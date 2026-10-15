import crypto from "crypto";
import { calculateFinancing } from "../services/financingService.js";
import {
  calculationErrors,
  leadErrors,
} from "../validation/financingValidation.js";
import * as leadRepository from "../repositories/financingLeadRepository.js";
const error = (res, status, code, message, details = null) =>
  res
    .status(status)
    .json({ success: false, error: { code, message, details } });
export function calculate(req, res) {
  const details = calculationErrors(req.body);
  if (details)
    return error(
      res,
      400,
      "VALIDATION_ERROR",
      "Please correct the submitted information.",
      details,
    );
  const { carPrice, downPayment, interestRate, loanTermMonths } = req.body;
  const r = calculateFinancing({
    carPrice,
    downPayment,
    interestRate,
    loanTermMonths,
  });
  return res.json({
    success: true,
    inputs: {
      carPrice,
      downPayment,
      loanAmount: r.loanAmount,
      interestRate,
      loanTermMonths,
    },
    results: {
      monthlyPayment: r.monthlyPayment,
      totalPayment: r.totalPayment,
      totalInterest: r.totalInterest,
      paymentSchedule: r.paymentSchedule,
      currency: r.currency,
    },
  });
}
export async function createLead(req, res, next) {
  try {
    const details = leadErrors(req.body);
    if (details)
      return error(
        res,
        400,
        "VALIDATION_ERROR",
        "Please correct the submitted information.",
        details,
      );
    const duplicate = await leadRepository.findByKey(req.body.idempotencyKey);
    if (duplicate)
      return res.json({
        success: true,
        duplicate: true,
        referenceCode: duplicate.reference_code,
        message: "Your quote request is already recorded.",
      });
    const car = await leadRepository.findEligibleCar(req.body.carId);
    if (!car)
      return error(
        res,
        404,
        "CAR_NOT_FOUND",
        "The selected vehicle was not found.",
      );
    if (!car.is_available || String(car.status).toLowerCase() === "sold")
      return error(
        res,
        409,
        "CAR_NOT_ELIGIBLE",
        "This vehicle is no longer available for a quote.",
      );
    const f = req.body.financing,
      c = calculateFinancing({ carPrice: Number(car.price), ...f }),
      reference = `PM-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    await leadRepository.insertLead({
      referenceCode: reference,
      idempotencyKey: req.body.idempotencyKey,
      carId: car.id,
      userId: req.user?.id ?? null,
      customerName: req.body.customerName.trim(),
      customerPhone: req.body.customerPhone.trim(),
      customerWhatsapp: req.body.customerWhatsapp?.trim() || null,
      customerEmail: req.body.customerEmail?.trim().toLowerCase() || null,
      price: Number(car.price),
      downPayment: f.downPayment,
      loanAmount: c.loanAmount,
      interestRate: f.interestRate,
      term: f.loanTermMonths,
      monthlyPayment: c.monthlyPayment,
      totalPayment: c.totalPayment,
      totalInterest: c.totalInterest,
    });
    return res.status(201).json({
      success: true,
      referenceCode: reference,
      message:
        "Your quote request has been received. Panda Motors will review it and contact you.",
    });
  } catch (e) {
    if (e.code === "23505")
      return error(
        res,
        409,
        "DUPLICATE_REQUEST",
        "This quote request is already recorded.",
      );
    next(e);
  }
}
export async function listLeads(req, res, next) {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100),
      offset = Math.max(Number(req.query.offset) || 0, 0),
      status = req.query.status;
    if (
      !Number.isInteger(limit) ||
      !Number.isInteger(offset) ||
      (status &&
        !["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"].includes(
          status,
        ))
    )
      return error(res, 400, "VALIDATION_ERROR", "Invalid filters.");
    return res.json({
      success: true,
      leads: await leadRepository.listLeads({ status, limit, offset }),
      pagination: { limit, offset },
    });
  } catch (e) {
    next(e);
  }
}
export async function getLead(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1)
      return error(res, 400, "VALIDATION_ERROR", "Invalid lead ID.");
    const lead = await leadRepository.getLead(id);
    return lead
      ? res.json({ success: true, lead })
      : error(res, 404, "LEAD_NOT_FOUND", "The financing lead was not found.");
  } catch (e) {
    next(e);
  }
}
export async function updateLead(req, res, next) {
  try {
    const id = Number(req.params.id),
      { status, adminNotes } = req.body;
    if (!Number.isInteger(id) || id < 1)
      return error(res, 400, "VALIDATION_ERROR", "Invalid lead ID.");
    if (
      status !== undefined &&
      !["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "CLOSED"].includes(status)
    )
      return error(res, 400, "VALIDATION_ERROR", "Invalid lead status.");
    if (
      adminNotes !== undefined &&
      (typeof adminNotes !== "string" || adminNotes.length > 4000)
    )
      return error(
        res,
        400,
        "VALIDATION_ERROR",
        "Notes must be 4,000 characters or fewer.",
      );
    const old = await leadRepository.getLead(id);
    if (!old)
      return error(
        res,
        404,
        "LEAD_NOT_FOUND",
        "The financing lead was not found.",
      );
    if (
      ["CONVERTED", "CLOSED"].includes(old.status) &&
      status &&
      status !== old.status
    )
      return error(
        res,
        409,
        "INVALID_STATUS_TRANSITION",
        "Closed and converted leads cannot be reopened.",
      );
    const lead = await leadRepository.updateLead(id, { status, adminNotes });
    return res.json({ success: true, lead });
  } catch (e) {
    next(e);
  }
}
export async function softDeleteLead(req, res, next) {
  try {
    const id = Number(req.params.id),
      reason = req.body?.reason;
    if (!Number.isInteger(id) || id < 1)
      return error(res, 400, "VALIDATION_ERROR", "Invalid lead ID.");
    if (
      reason !== undefined &&
      (typeof reason !== "string" || reason.length > 500)
    )
      return error(
        res,
        400,
        "VALIDATION_ERROR",
        "Deletion reason must be 500 characters or fewer.",
      );
    const lead = await leadRepository.softDelete(
      id,
      req.user?.id ?? req.user?.userId ?? null,
      reason?.trim(),
    );
    return lead
      ? res.json({
          success: true,
          message: "Quote archived from the active sales queue.",
        })
      : error(
          res,
          404,
          "LEAD_NOT_FOUND",
          "The financing lead was not found or is already archived.",
        );
  } catch (e) {
    next(e);
  }
}
export async function leadMetrics(req, res, next) {
  try {
    const metrics = await leadRepository.stats();
    return res.json({
      success: true,
      metrics: {
        ...metrics,
        conversionPercentage: Number(metrics.total)
          ? Math.round(
              (Number(metrics.converted) / Number(metrics.total)) * 10000,
            ) / 100
          : 0,
      },
    });
  } catch (e) {
    next(e);
  }
}

import express from "express";
import jwt from "jsonwebtoken";
import { authenticateToken, adminOnly } from "../middleware/authMiddleware.js";
import {
  calculate,
  createLead,
  listLeads,
  getLead,
  updateLead,
  softDeleteLead,
  leadMetrics,
} from "../controllers/financingController.js";
const router = express.Router(),
  requests = new Map();
function optionalAuth(req, res, next) {
  const raw = req.headers.authorization;
  if (!raw) return next();
  const [, token] = raw.split(" ");
  if (!token)
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "The supplied authentication token is invalid.",
      },
    });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "The supplied authentication token is invalid.",
      },
    });
  }
}
function limit(req, res, next) {
  const key = req.ip || "unknown",
    now = Date.now(),
    recent = (requests.get(key) || []).filter((t) => now - t < 60000);
  if (recent.length >= 10)
    return res.status(429).json({
      success: false,
      error: {
        code: "RATE_LIMITED",
        message: "Too many quote requests. Please try again shortly.",
      },
    });
  recent.push(now);
  requests.set(key, recent);
  next();
}
router.post("/calculate", calculate);
router.post("/leads", limit, optionalAuth, createLead);
router.get("/leads", authenticateToken, adminOnly, listLeads);
router.get("/leads/metrics", authenticateToken, adminOnly, leadMetrics);
router.get("/leads/:id", authenticateToken, adminOnly, getLead);
router.patch("/leads/:id", authenticateToken, adminOnly, updateLead);
router.delete("/leads/:id", authenticateToken, adminOnly, softDeleteLead);
export default router;

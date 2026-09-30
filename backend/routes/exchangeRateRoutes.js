import express from "express";
import {
  createExchangeRateController,
} from "../controllers/exchangeRateController.js";
import {
  exchangeRateService,
} from "../services/exchangeRates/exchangeRateService.js";

export const createExchangeRateRouter = (
  service = exchangeRateService,
) => {
  const router = express.Router();
  const controller =
    createExchangeRateController(service);

  router.get("/", controller.getExchangeRates);

  return router;
};

export default createExchangeRateRouter();

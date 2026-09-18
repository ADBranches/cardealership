"use strict";

const express = require("express");
const { createExchangeRateController } = require("../controllers/exchangeRateController");

const createExchangeRateRouter = (exchangeRateService) => {
  const router = express.Router();
  const controller = createExchangeRateController(exchangeRateService);

  router.get("/", controller.getExchangeRates);

  return router;
};

module.exports = Object.freeze({
  createExchangeRateRouter
});

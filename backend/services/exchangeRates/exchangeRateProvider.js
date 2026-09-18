"use strict";

const { assertExchangeRateProvider } = require("../../contracts/exchangeRate.contract");

const createExchangeRateProvider = (provider) => assertExchangeRateProvider(provider);

module.exports = Object.freeze({
  createExchangeRateProvider
});

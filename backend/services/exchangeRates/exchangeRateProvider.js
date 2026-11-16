import { assertExchangeRateProvider } from '../../contracts/exchangeRate.contract.js';

export const createExchangeRateProvider = provider => assertExchangeRateProvider(provider);

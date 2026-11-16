import express from 'express';
import { createExchangeRateController } from '../controllers/exchangeRateController.js';
import { exchangeRateService } from '../services/exchangeRates/exchangeRateService.js';
import { createExchangeRateRequestGuard } from '../middleware/exchangeRateRequestGuard.js';

export function createExchangeRateRouter(service = exchangeRateService, limits) {
  const router = express.Router();
  const controller = createExchangeRateController(service);
  router.use(createExchangeRateRequestGuard(limits));
  router.get('/', controller.getExchangeRates);
  return router;
}

export default createExchangeRateRouter();

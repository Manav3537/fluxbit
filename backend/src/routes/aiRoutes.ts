import express from 'express';
import {
  queryData,
  getInsights,
  getAnomalies,
  getChartRecommendations
} from '../controllers/aiController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.post('/query', queryData);
router.get('/insights/:dataSourceId', getInsights);
router.get('/anomalies/:dataSourceId', getAnomalies);
router.get('/chart-recommendations/:dataSourceId', getChartRecommendations);

export default router;
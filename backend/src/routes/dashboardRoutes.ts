import express from 'express';
import { getDashboards, getDashboard, createDashboard, updateDashboard, deleteDashboard } from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/', getDashboards);
router.get('/:id', getDashboard);
router.post('/', createDashboard);
router.put('/:id', updateDashboard);
router.delete('/:id', deleteDashboard);

export default router;
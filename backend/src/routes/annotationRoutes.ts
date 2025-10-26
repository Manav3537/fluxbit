import express from 'express';
import { getAnnotations, createAnnotation, updateAnnotation, deleteAnnotation } from '../controllers/annotationController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate);

router.get('/:dashboardId', getAnnotations);
router.post('/', createAnnotation);
router.put('/:id', updateAnnotation);
router.delete('/:id', deleteAnnotation);

export default router;
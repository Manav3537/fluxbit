import express from 'express';
import { uploadData, getDataSources, getDataSource, deleteDataSource } from '../controllers/dataController';
import { authenticate } from '../middleware/auth';
import { upload } from '../config/upload';

const router = express.Router();

router.use(authenticate);

router.post('/upload', upload.single('file'), uploadData);
router.get('/sources/:dashboardId', getDataSources);
router.get('/source/:id', getDataSource);
router.delete('/source/:id', deleteDataSource);

export default router;
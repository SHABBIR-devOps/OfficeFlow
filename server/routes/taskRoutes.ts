import express from 'express';
import * as taskController from '../controllers/taskController.ts';
import { authenticate, authorize } from '../middleware/auth.ts';
import upload from '../utils/upload.ts';

const router = express.Router();

router.use(authenticate);

router.get('/', taskController.getTasks);
router.post('/', authorize(['admin']), taskController.createTask);
router.put('/:id/status', upload.single('proof'), taskController.updateTaskStatus);
router.delete('/:id', authorize(['admin']), taskController.deleteTask);

export default router;

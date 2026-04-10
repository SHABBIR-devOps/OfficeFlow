import express from 'express';
import * as attendanceController from '../controllers/attendanceController.ts';
import { authenticate, authorize } from '../middleware/auth.ts';

const router = express.Router();

router.use(authenticate);

router.post('/check-in', attendanceController.checkIn);
router.post('/check-out', attendanceController.checkOut);
router.get('/my', attendanceController.getMyAttendance);
router.get('/all', authorize(['admin']), attendanceController.getAllAttendance);

export default router;

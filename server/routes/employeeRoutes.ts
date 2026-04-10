import express from 'express';
import * as employeeController from '../controllers/employeeController.ts';
import { authenticate, authorize } from '../middleware/auth.ts';

const router = express.Router();

router.use(authenticate);
router.use(authorize(['admin']));

router.get('/', employeeController.getEmployees);
router.post('/', employeeController.createEmployee);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

export default router;

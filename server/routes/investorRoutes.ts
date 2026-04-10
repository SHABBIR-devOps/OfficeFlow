import express from 'express';
import * as investorController from '../controllers/investorController.ts';
import { authenticate, authorize } from '../middleware/auth.ts';

const router = express.Router();

router.use(authenticate);

router.get('/', investorController.getInvestors);
router.get('/summary', investorController.getInvestmentSummary);
router.post('/', authorize(['admin']), investorController.createInvestor);
router.put('/:id', authorize(['admin']), investorController.updateInvestor);
router.delete('/:id', authorize(['admin']), investorController.deleteInvestor);

export default router;

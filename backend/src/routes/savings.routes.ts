import { Router } from 'express';
import { savingsController } from '../controllers/savings.controller';

const router = Router();

// Savings goals routes
router.get('/goals', savingsController.getSavingsGoals);
router.get('/goals/:id', savingsController.getSavingsGoal);
router.post('/goals', savingsController.createSavingsGoal);
router.put('/goals/:id', savingsController.updateSavingsGoal);
router.delete('/goals/:id', savingsController.deleteSavingsGoal);

// Savings goal contributions
router.post('/goals/:id/contribute', savingsController.contributeSavingsGoal);
router.post('/goals/:id/withdraw', savingsController.withdrawSavingsGoal);

// Emergency fund routes
router.get('/emergency-fund', savingsController.getEmergencyFund);
router.post('/emergency-fund', savingsController.createEmergencyFund);
router.put('/emergency-fund', savingsController.updateEmergencyFund);
router.post('/emergency-fund/contribute', savingsController.contributeEmergencyFund);
router.post('/emergency-fund/withdraw', savingsController.withdrawEmergencyFund);

export default router;
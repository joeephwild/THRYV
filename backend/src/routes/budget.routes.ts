import { Router } from 'express';
import { budgetController } from '../controllers/budget.controller';

const router = Router();

// Budget routes
router.get('/', budgetController.getBudgets);
router.get('/:id', budgetController.getBudget);
router.post('/', budgetController.createBudget);
router.put('/:id', budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);

// Budget analysis
router.get('/analysis/overview', budgetController.getBudgetOverview);
router.get('/analysis/categories', budgetController.getCategoryAnalysis);
router.get('/analysis/trends', budgetController.getTrends);

// Budget transactions
router.get('/:id/transactions', budgetController.getBudgetTransactions);
router.post('/:id/transactions', budgetController.addBudgetTransaction);

export default router;
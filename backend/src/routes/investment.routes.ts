import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { investmentController } from '@/controllers/investment.controller';

const router = Router();

// Apply authentication middleware to all investment routes
router.use(authenticate);

// Get all investments
router.get('/', investmentController.getInvestments);

// Get a specific investment
router.get('/:id', investmentController.getInvestment);

// Create a new investment
router.post('/', investmentController.createInvestment);

// Update an investment
router.put('/:id', investmentController.updateInvestment);

// Delete an investment
router.delete('/:id', investmentController.deleteInvestment);

// Get investment performance
router.get('/performance/:id', investmentController.getInvestmentPerformance);

// Get investment portfolio overview
router.get('/portfolio/overview', investmentController.getPortfolioOverview);

// Get investment recommendations
router.get('/recommendations', investmentController.getInvestmentRecommendations);

// Add funds to investment
router.post('/:id/fund', investmentController.fundInvestment);

// Withdraw funds from investment
router.post('/:id/withdraw', investmentController.withdrawInvestment);

export default router;

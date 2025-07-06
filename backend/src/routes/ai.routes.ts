import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all AI routes
router.use(authenticate);

// Start a new conversation with AI CFO
router.post('/conversation', aiController.startConversation);

// Send a message to an existing conversation
router.post('/conversation/:id/message', aiController.sendMessage);

// Get conversation history
router.get('/conversation/:id', aiController.getConversation);

// Get all conversations
router.get('/conversations', aiController.getConversations);

// Get financial insights
router.get('/insights', aiController.getFinancialInsights);

// Get spending recommendations
router.get('/recommendations/spending', aiController.getSpendingRecommendations);

// Get saving recommendations
router.get('/recommendations/saving', aiController.getSavingRecommendations);

// Get investment recommendations
router.get('/recommendations/investment', aiController.getInvestmentRecommendations);

export default router;
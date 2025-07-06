import { Router } from 'express';
import { walletController } from '../controllers/wallet.controller';

const router = Router();

// Wallet routes
router.get('/', walletController.getWallet);
router.get('/transactions', walletController.getTransactions);
router.post('/connect', walletController.connectWallet);
router.post('/disconnect', walletController.disconnectWallet);

// Transaction routes
router.post('/deposit', walletController.deposit);
router.post('/withdraw', walletController.withdraw);
router.post('/transfer', walletController.transfer);

export default router;
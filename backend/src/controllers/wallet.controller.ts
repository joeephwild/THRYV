import { Request, Response } from 'express';
import { prisma } from '../index';
import { ApiError, asyncHandler } from '../middleware/error.middleware';

import { WalletService } from '../services/wallet.service';

export const walletController = {
  // Get user wallet
  getWallet: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new ApiError(404, 'Wallet not found');
    }

    res.status(200).json({
      wallet,
    });
  }),

  // Get wallet transactions
  getTransactions: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { limit = 10, offset = 0, type } = req.query;

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new ApiError(404, 'Wallet not found');
    }

    const where = {
      walletId: wallet.id,
      ...(type ? { type: type as string } : {}),
    };

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.transaction.count({ where }),
    ]);

    res.status(200).json({
      transactions,
      total,
    });
  }),

  // Connect blockchain wallet
  connectWallet: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { walletAddress } = req.body;

    if (!walletAddress) {
      throw new ApiError(400, 'Wallet address is required');
    }

    // Check if wallet address is already connected to another user
    const existingUser = await prisma.user.findFirst({
      where: {
        walletAddress,
        id: { not: userId },
      },
    });

    if (existingUser) {
      throw new ApiError(409, 'Wallet address is already connected to another account');
    }

    // Update user with wallet address
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { walletAddress },
      select: {
        id: true,
        walletAddress: true,
      },
    });

    res.status(200).json({
      message: 'Wallet connected successfully',
      walletAddress: updatedUser.walletAddress,
    });
  }),

  // Disconnect blockchain wallet
  disconnectWallet: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;

    // Update user to remove wallet address
    await prisma.user.update({
      where: { id: userId },
      data: { walletAddress: null },
    });

    res.status(200).json({
      message: 'Wallet disconnected successfully',
    });
  }),

  // Deposit funds
  deposit: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { amount, description } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new ApiError(400, 'Valid amount is required');
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new ApiError(404, 'Wallet not found');
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (prisma) => {
      // Update wallet balance
      const updatedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: Number(amount) },
        },
      });

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          amount: Number(amount),
          type: 'deposit',
          description: description || 'Deposit',
          status: 'completed',
        },
      });

      return { updatedWallet, transaction };
    });

    res.status(200).json({
      message: 'Deposit successful',
      wallet: result.updatedWallet,
      transaction: result.transaction,
    });
  }),

  // Withdraw funds
  withdraw: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { amount, description } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new ApiError(400, 'Valid amount is required');
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new ApiError(404, 'Wallet not found');
    }

    if (wallet.balance < Number(amount)) {
      throw new ApiError(400, 'Insufficient funds');
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (prisma) => {
      // Update wallet balance
      const updatedWallet = await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { decrement: Number(amount) },
        },
      });

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          amount: Number(amount),
          type: 'withdrawal',
          description: description || 'Withdrawal',
          status: 'completed',
        },
      });

      return { updatedWallet, transaction };
    });

    res.status(200).json({
      message: 'Withdrawal successful',
      wallet: result.updatedWallet,
      transaction: result.transaction,
    });
  }),

  // Transfer funds to another user
  transfer: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { recipientId, amount, description } = req.body;

    if (!recipientId) {
      throw new ApiError(400, 'Recipient ID is required');
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new ApiError(400, 'Valid amount is required');
    }

    if (userId === recipientId) {
      throw new ApiError(400, 'Cannot transfer to yourself');
    }

    // Get sender's wallet
    const senderWallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!senderWallet) {
      throw new ApiError(404, 'Sender wallet not found');
    }

    if (senderWallet.balance < Number(amount)) {
      throw new ApiError(400, 'Insufficient funds');
    }

    // Get recipient's wallet
    const recipientWallet = await prisma.wallet.findUnique({
      where: { userId: recipientId },
    });

    if (!recipientWallet) {
      throw new ApiError(404, 'Recipient wallet not found');
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (prisma) => {
      // Update sender's wallet balance
      const updatedSenderWallet = await prisma.wallet.update({
        where: { id: senderWallet.id },
        data: {
          balance: { decrement: Number(amount) },
        },
      });

      // Update recipient's wallet balance
      const updatedRecipientWallet = await prisma.wallet.update({
        where: { id: recipientWallet.id },
        data: {
          balance: { increment: Number(amount) },
        },
      });

      // Create sender's transaction record
      const senderTransaction = await prisma.transaction.create({
        data: {
          userId,
          walletId: senderWallet.id,
          amount: Number(amount),
          type: 'transfer',
          description: description || `Transfer to user ${recipientId}`,
          status: 'completed',
        },
      });

      // Create recipient's transaction record
      const recipientTransaction = await prisma.transaction.create({
        data: {
          userId: recipientId,
          walletId: recipientWallet.id,
          amount: Number(amount),
          type: 'transfer',
          description: description || `Transfer from user ${userId}`,
          status: 'completed',
        },
      });

      return {
        updatedSenderWallet,
        updatedRecipientWallet,
        senderTransaction,
        recipientTransaction,
      };
    });

    res.status(200).json({
      message: 'Transfer successful',
      wallet: result.updatedSenderWallet,
      transaction: result.senderTransaction,
    });
  }),

  // Get user's Massa wallet address
  getMassaWallet: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;

    try {
      // Get user's Massa wallet address
      const walletAddress = await WalletService.getUserWalletAddress(userId);

      if (!walletAddress) {
        // If user doesn't have a Massa wallet yet, create one
        const newWalletAddress = await WalletService.createUserMassaWallet(userId);
        
        res.status(200).json({
          message: 'Massa wallet created successfully',
          walletAddress: newWalletAddress,
        });
      } else {
        res.status(200).json({
          walletAddress,
        });
      }
    } catch (error) {
      console.error('Error getting Massa wallet:', error);
      throw new ApiError(500, 'Failed to get Massa wallet');
    }
  }),
};
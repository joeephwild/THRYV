import { Request, Response } from 'express';
import { prisma } from '../index';
import { ApiError, asyncHandler } from '../middleware/error.middleware';

export const savingsController = {
  // Get all savings goals
  getSavingsGoals: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;

    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      savingsGoals,
    });
  }),

  // Get a specific savings goal
  getSavingsGoal: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const savingsGoal = await prisma.savingsGoal.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        transactions: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!savingsGoal) {
      throw new ApiError(404, 'Savings goal not found');
    }

    res.status(200).json({
      savingsGoal,
    });
  }),

  // Create a new savings goal
  createSavingsGoal: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { name, targetAmount, deadline, category, description } = req.body;

    if (!name || !targetAmount || isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) {
      throw new ApiError(400, 'Name and valid target amount are required');
    }

    const savingsGoal = await prisma.savingsGoal.create({
      data: {
        userId,
        name,
        targetAmount: Number(targetAmount),
        deadline: deadline ? new Date(deadline) : null,
        category,
        description,
      },
    });

    res.status(201).json({
      message: 'Savings goal created successfully',
      savingsGoal,
    });
  }),

  // Update a savings goal
  updateSavingsGoal: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, targetAmount, deadline, category, description } = req.body;

    // Check if savings goal exists
    const existingSavingsGoal = await prisma.savingsGoal.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingSavingsGoal) {
      throw new ApiError(404, 'Savings goal not found');
    }

    // Update savings goal
    const updatedSavingsGoal = await prisma.savingsGoal.update({
      where: { id },
      data: {
        name,
        targetAmount: targetAmount ? Number(targetAmount) : undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        category,
        description,
      },
    });

    res.status(200).json({
      message: 'Savings goal updated successfully',
      savingsGoal: updatedSavingsGoal,
    });
  }),

  // Delete a savings goal
  deleteSavingsGoal: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if savings goal exists
    const existingSavingsGoal = await prisma.savingsGoal.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingSavingsGoal) {
      throw new ApiError(404, 'Savings goal not found');
    }

    // Check if there are transactions associated with this goal
    const transactionsCount = await prisma.transaction.count({
      where: {
        savingsGoalId: id,
      },
    });

    if (transactionsCount > 0) {
      throw new ApiError(400, 'Cannot delete savings goal with associated transactions');
    }

    // Delete savings goal
    await prisma.savingsGoal.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Savings goal deleted successfully',
    });
  }),

  // Contribute to a savings goal
  contributeSavingsGoal: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { amount, description } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new ApiError(400, 'Valid amount is required');
    }

    // Check if savings goal exists
    const savingsGoal = await prisma.savingsGoal.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!savingsGoal) {
      throw new ApiError(404, 'Savings goal not found');
    }

    // Get user's wallet
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

      // Update savings goal current amount
      const updatedSavingsGoal = await prisma.savingsGoal.update({
        where: { id },
        data: {
          currentAmount: { increment: Number(amount) },
          isCompleted: {
            set: savingsGoal.currentAmount + Number(amount) >= savingsGoal.targetAmount,
          },
        },
      });

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          amount: Number(amount),
          type: 'transfer',
          category: 'savings',
          description: description || `Contribution to ${savingsGoal.name}`,
          status: 'completed',
          savingsGoalId: id,
        },
      });

      return { updatedWallet, updatedSavingsGoal, transaction };
    });

    res.status(200).json({
      message: 'Contribution successful',
      wallet: result.updatedWallet,
      savingsGoal: result.updatedSavingsGoal,
      transaction: result.transaction,
    });
  }),

  // Withdraw from a savings goal
  withdrawSavingsGoal: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { amount, description } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new ApiError(400, 'Valid amount is required');
    }

    // Check if savings goal exists
    const savingsGoal = await prisma.savingsGoal.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!savingsGoal) {
      throw new ApiError(404, 'Savings goal not found');
    }

    if (savingsGoal.currentAmount < Number(amount)) {
      throw new ApiError(400, 'Insufficient funds in savings goal');
    }

    // Get user's wallet
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

      // Update savings goal current amount
      const updatedSavingsGoal = await prisma.savingsGoal.update({
        where: { id },
        data: {
          currentAmount: { decrement: Number(amount) },
          isCompleted: false,
        },
      });

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          amount: Number(amount),
          type: 'transfer',
          category: 'savings_withdrawal',
          description: description || `Withdrawal from ${savingsGoal.name}`,
          status: 'completed',
          savingsGoalId: id,
        },
      });

      return { updatedWallet, updatedSavingsGoal, transaction };
    });

    res.status(200).json({
      message: 'Withdrawal successful',
      wallet: result.updatedWallet,
      savingsGoal: result.updatedSavingsGoal,
      transaction: result.transaction,
    });
  }),

  // Get emergency fund
  getEmergencyFund: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;

    const emergencyFund = await prisma.emergencyFund.findUnique({
      where: { userId },
    });

    if (!emergencyFund) {
      return res.status(200).json({
        emergencyFund: null,
      });
    }

    res.status(200).json({
      emergencyFund,
    });
  }),

  // Create emergency fund
  createEmergencyFund: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { targetAmount } = req.body;

    if (!targetAmount || isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) {
      throw new ApiError(400, 'Valid target amount is required');
    }

    // Check if emergency fund already exists
    const existingEmergencyFund = await prisma.emergencyFund.findUnique({
      where: { userId },
    });

    if (existingEmergencyFund) {
      throw new ApiError(409, 'Emergency fund already exists');
    }

    const emergencyFund = await prisma.emergencyFund.create({
      data: {
        userId,
        targetAmount: Number(targetAmount),
      },
    });

    res.status(201).json({
      message: 'Emergency fund created successfully',
      emergencyFund,
    });
  }),

  // Update emergency fund
  updateEmergencyFund: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { targetAmount } = req.body;

    if (!targetAmount || isNaN(Number(targetAmount)) || Number(targetAmount) <= 0) {
      throw new ApiError(400, 'Valid target amount is required');
    }

    // Check if emergency fund exists
    const existingEmergencyFund = await prisma.emergencyFund.findUnique({
      where: { userId },
    });

    if (!existingEmergencyFund) {
      throw new ApiError(404, 'Emergency fund not found');
    }

    const updatedEmergencyFund = await prisma.emergencyFund.update({
      where: { userId },
      data: {
        targetAmount: Number(targetAmount),
      },
    });

    res.status(200).json({
      message: 'Emergency fund updated successfully',
      emergencyFund: updatedEmergencyFund,
    });
  }),

  // Contribute to emergency fund
  contributeEmergencyFund: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { amount, description } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new ApiError(400, 'Valid amount is required');
    }

    // Check if emergency fund exists
    const emergencyFund = await prisma.emergencyFund.findUnique({
      where: { userId },
    });

    if (!emergencyFund) {
      throw new ApiError(404, 'Emergency fund not found');
    }

    // Get user's wallet
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

      // Update emergency fund current amount
      const updatedEmergencyFund = await prisma.emergencyFund.update({
        where: { userId },
        data: {
          currentAmount: { increment: Number(amount) },
        },
      });

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          amount: Number(amount),
          type: 'transfer',
          category: 'emergency_fund',
          description: description || 'Contribution to emergency fund',
          status: 'completed',
        },
      });

      return { updatedWallet, updatedEmergencyFund, transaction };
    });

    res.status(200).json({
      message: 'Contribution successful',
      wallet: result.updatedWallet,
      emergencyFund: result.updatedEmergencyFund,
      transaction: result.transaction,
    });
  }),

  // Withdraw from emergency fund
  withdrawEmergencyFund: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { amount, description } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new ApiError(400, 'Valid amount is required');
    }

    // Check if emergency fund exists
    const emergencyFund = await prisma.emergencyFund.findUnique({
      where: { userId },
    });

    if (!emergencyFund) {
      throw new ApiError(404, 'Emergency fund not found');
    }

    if (emergencyFund.currentAmount < Number(amount)) {
      throw new ApiError(400, 'Insufficient funds in emergency fund');
    }

    // Get user's wallet
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

      // Update emergency fund current amount
      const updatedEmergencyFund = await prisma.emergencyFund.update({
        where: { userId },
        data: {
          currentAmount: { decrement: Number(amount) },
        },
      });

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          amount: Number(amount),
          type: 'transfer',
          category: 'emergency_fund_withdrawal',
          description: description || 'Withdrawal from emergency fund',
          status: 'completed',
        },
      });

      return { updatedWallet, updatedEmergencyFund, transaction };
    });

    res.status(200).json({
      message: 'Withdrawal successful',
      wallet: result.updatedWallet,
      emergencyFund: result.updatedEmergencyFund,
      transaction: result.transaction,
    });
  }),
};
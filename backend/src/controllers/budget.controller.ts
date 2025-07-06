import { Request, Response } from 'express';
import { prisma } from '../index';
import { ApiError, asyncHandler } from '../middleware/error.middleware';

export const budgetController = {
  // Get all budgets
  getBudgets: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;

    const budgets = await prisma.budget.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      budgets,
    });
  }),

  // Get a specific budget
  getBudget: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!budget) {
      throw new ApiError(404, 'Budget not found');
    }

    // Get transactions for this budget
    const transactions = await prisma.transaction.findMany({
      where: {
        budgetId: id,
        userId,
      },
      orderBy: { date: 'desc' },
      take: 10,
    });

    // Calculate spent amount
    const spentAmount = transactions.reduce(
      (total, transaction) => total + Number(transaction.amount),
      0
    );

    res.status(200).json({
      budget,
      spentAmount,
      remainingAmount: Number(budget.amount) - spentAmount,
      transactions,
    });
  }),

  // Create a new budget
  createBudget: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { name, amount, period, category, startDate, endDate } = req.body;

    if (!name || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new ApiError(400, 'Name and valid amount are required');
    }

    if (!period) {
      throw new ApiError(400, 'Period is required (e.g., monthly, weekly)');
    }

    if (!category) {
      throw new ApiError(400, 'Category is required');
    }

    if (!startDate) {
      throw new ApiError(400, 'Start date is required');
    }

    const budget = await prisma.budget.create({
      data: {
        userId,
        name,
        amount: Number(amount),
        period,
        category,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    res.status(201).json({
      message: 'Budget created successfully',
      budget,
    });
  }),

  // Update a budget
  updateBudget: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, amount, period, category, startDate, endDate } = req.body;

    // Check if budget exists
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingBudget) {
      throw new ApiError(404, 'Budget not found');
    }

    // Update budget
    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: {
        name,
        amount: amount ? Number(amount) : undefined,
        period,
        category,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    });

    res.status(200).json({
      message: 'Budget updated successfully',
      budget: updatedBudget,
    });
  }),

  // Delete a budget
  deleteBudget: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if budget exists
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingBudget) {
      throw new ApiError(404, 'Budget not found');
    }

    // Check if there are transactions associated with this budget
    const transactionsCount = await prisma.transaction.count({
      where: {
        budgetId: id,
      },
    });

    if (transactionsCount > 0) {
      throw new ApiError(400, 'Cannot delete budget with associated transactions');
    }

    // Delete budget
    await prisma.budget.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Budget deleted successfully',
    });
  }),

  // Get budget overview
  getBudgetOverview: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;

    // Get all active budgets
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } },
        ],
      },
    });

    // Get transactions for each budget
    const budgetOverviews = await Promise.all(
      budgets.map(async (budget) => {
        const transactions = await prisma.transaction.findMany({
          where: {
            budgetId: budget.id,
            userId,
            date: {
              gte: budget.startDate,
              ...(budget.endDate ? { lte: budget.endDate } : {}),
            },
          },
        });

        const spentAmount = transactions.reduce(
          (total, transaction) => total + Number(transaction.amount),
          0
        );

        return {
          id: budget.id,
          name: budget.name,
          amount: Number(budget.amount),
          spentAmount,
          remainingAmount: Number(budget.amount) - spentAmount,
          period: budget.period,
          category: budget.category,
          progress: Math.min((spentAmount / Number(budget.amount)) * 100, 100),
        };
      })
    );

    // Calculate total budget and spent amounts
    const totalBudget = budgetOverviews.reduce(
      (total, budget) => total + budget.amount,
      0
    );

    const totalSpent = budgetOverviews.reduce(
      (total, budget) => total + budget.spentAmount,
      0
    );

    res.status(200).json({
      budgets: budgetOverviews,
      totalBudget,
      totalSpent,
      totalRemaining: totalBudget - totalSpent,
      overallProgress: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
    });
  }),

  // Get category analysis
  getCategoryAnalysis: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { period = 'month' } = req.query;

    // Determine date range based on period
    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // Get all transactions grouped by category
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      select: {
        category: true,
        amount: true,
      },
    });

    // Group transactions by category
    const categoryMap = new Map<string, number>();
    transactions.forEach((transaction) => {
      const category = transaction.category || 'Uncategorized';
      const currentAmount = categoryMap.get(category) || 0;
      categoryMap.set(category, currentAmount + Number(transaction.amount));
    });

    // Convert map to array
    const categoryAnalysis = Array.from(categoryMap.entries()).map(
      ([category, amount]) => ({
        category,
        amount,
        percentage:
          transactions.length > 0
            ? (amount /
                transactions.reduce(
                  (total, transaction) => total + Number(transaction.amount),
                  0
                )) *
              100
            : 0,
      })
    );

    res.status(200).json({
      categoryAnalysis,
      period,
    });
  }),

  // Get spending trends
  getTrends: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { period = 'month', category } = req.query;

    // Determine date range and grouping based on period
    let startDate = new Date();
    let groupBy: 'day' | 'week' | 'month' = 'day';

    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
      groupBy = 'day';
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
      groupBy = 'day';
    } else if (period === 'year') {
      startDate.setFullYear(startDate.getFullYear() - 1);
      groupBy = 'month';
    }

    // Get all transactions within the date range
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startDate },
        ...(category ? { category: category as string } : {}),
      },
      select: {
        date: true,
        amount: true,
        category: true,
      },
      orderBy: { date: 'asc' },
    });

    // Group transactions by date
    const trendsMap = new Map<string, number>();

    transactions.forEach((transaction) => {
      let key: string;

      if (groupBy === 'day') {
        key = transaction.date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (groupBy === 'week') {
        const date = new Date(transaction.date);
        const firstDayOfWeek = new Date(date);
        firstDayOfWeek.setDate(date.getDate() - date.getDay()); // Sunday
        key = firstDayOfWeek.toISOString().split('T')[0];
      } else {
        // month
        key = `${transaction.date.getFullYear()}-${String(
          transaction.date.getMonth() + 1
        ).padStart(2, '0')}`; // YYYY-MM
      }

      const currentAmount = trendsMap.get(key) || 0;
      trendsMap.set(key, currentAmount + Number(transaction.amount));
    });

    // Convert map to array and sort by date
    const trends = Array.from(trendsMap.entries())
      .map(([date, amount]) => ({
        date,
        amount,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      trends,
      period,
      category: category || 'All',
      groupBy,
    });
  }),

  // Get budget transactions
  getBudgetTransactions: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    // Check if budget exists
    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!budget) {
      throw new ApiError(404, 'Budget not found');
    }

    // Get transactions for this budget
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: {
          budgetId: id,
          userId,
        },
        orderBy: { date: 'desc' },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.transaction.count({
        where: {
          budgetId: id,
          userId,
        },
      }),
    ]);

    res.status(200).json({
      transactions,
      total,
    });
  }),

  // Add a transaction to a budget
  addBudgetTransaction: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { amount, description, date } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new ApiError(400, 'Valid amount is required');
    }

    // Check if budget exists
    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!budget) {
      throw new ApiError(404, 'Budget not found');
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

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          amount: Number(amount),
          type: 'payment',
          category: budget.category,
          description: description || `${budget.name} expense`,
          date: date ? new Date(date) : new Date(),
          status: 'completed',
          budgetId: id,
        },
      });

      return { updatedWallet, transaction };
    });

    res.status(201).json({
      message: 'Transaction added successfully',
      wallet: result.updatedWallet,
      transaction: result.transaction,
    });
  }),
};
import { Request, Response } from 'express';
import { prisma } from '../index';
import { ApiError, asyncHandler } from '../middleware/error.middleware';

export const investmentController = {
  // Get all investments
  getInvestments: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;

    const investments = await prisma.investment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      investments,
    });
  }),

  // Get a specific investment
  getInvestment: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const investment = await prisma.investment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!investment) {
      throw new ApiError(404, 'Investment not found');
    }

    // Get related transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        investmentId: id,
        userId,
      },
      orderBy: { date: 'desc' },
      take: 10,
    });

    res.status(200).json({
      investment,
      transactions,
    });
  }),

  // Create a new investment
  createInvestment: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { name, type, amount, riskLevel, description, targetReturn } = req.body;

    if (!name || !type) {
      throw new ApiError(400, 'Name and type are required');
    }

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new ApiError(400, 'Valid amount is required');
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

      // Create investment
      const investment = await prisma.investment.create({
        data: {
          userId,
          name,
          type,
          initialAmount: Number(amount),
          currentAmount: Number(amount),
          riskLevel: riskLevel || 'medium',
          description,
          targetReturn: targetReturn ? Number(targetReturn) : null,
          status: 'active',
        },
      });

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          amount: Number(amount),
          type: 'investment',
          category: 'investment',
          description: `Investment in ${name}`,
          date: new Date(),
          status: 'completed',
          investmentId: investment.id,
        },
      });

      return { updatedWallet, investment, transaction };
    });

    res.status(201).json({
      message: 'Investment created successfully',
      investment: result.investment,
      wallet: result.updatedWallet,
      transaction: result.transaction,
    });
  }),

  // Update an investment
  updateInvestment: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, description, riskLevel, targetReturn, status } = req.body;

    // Check if investment exists
    const existingInvestment = await prisma.investment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingInvestment) {
      throw new ApiError(404, 'Investment not found');
    }

    // Update investment
    const updatedInvestment = await prisma.investment.update({
      where: { id },
      data: {
        name,
        description,
        riskLevel,
        targetReturn: targetReturn ? Number(targetReturn) : undefined,
        status,
      },
    });

    res.status(200).json({
      message: 'Investment updated successfully',
      investment: updatedInvestment,
    });
  }),

  // Delete an investment
  deleteInvestment: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if investment exists
    const existingInvestment = await prisma.investment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingInvestment) {
      throw new ApiError(404, 'Investment not found');
    }

    // Check if there are transactions associated with this investment
    const transactionsCount = await prisma.transaction.count({
      where: {
        investmentId: id,
      },
    });

    if (transactionsCount > 0) {
      throw new ApiError(
        400,
        'Cannot delete investment with associated transactions'
      );
    }

    // Delete investment
    await prisma.investment.delete({
      where: { id },
    });

    res.status(200).json({
      message: 'Investment deleted successfully',
    });
  }),

  // Get investment performance
  getInvestmentPerformance: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { period = 'all' } = req.query;

    // Check if investment exists
    const investment = await prisma.investment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!investment) {
      throw new ApiError(404, 'Investment not found');
    }

    // Determine date range based on period
    let startDate = new Date(investment.createdAt);
    if (period === 'month') {
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
    } else if (period === 'year') {
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // Get all transactions for this investment
    const transactions = await prisma.transaction.findMany({
      where: {
        investmentId: id,
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    // Calculate performance metrics
    const initialAmount = Number(investment.initialAmount);
    const currentAmount = Number(investment.currentAmount);
    const totalReturn = currentAmount - initialAmount;
    const percentageReturn = initialAmount > 0 ? (totalReturn / initialAmount) * 100 : 0;

    // For a real app, we would fetch actual performance data from an investment API
    // Here we'll simulate some performance data points
    const performanceData = [];
    let simulatedValue = initialAmount;
    const startTimestamp = startDate.getTime();
    const endTimestamp = new Date().getTime();
    const interval = (endTimestamp - startTimestamp) / 10; // 10 data points

    for (let i = 0; i < 10; i++) {
      const pointDate = new Date(startTimestamp + interval * i);
      // Simulate some fluctuation
      const randomFactor = 0.98 + Math.random() * 0.04; // Random between 0.98 and 1.02
      simulatedValue *= randomFactor;

      performanceData.push({
        date: pointDate.toISOString().split('T')[0],
        value: simulatedValue,
      });
    }

    // Add the current value as the last point
    performanceData.push({
      date: new Date().toISOString().split('T')[0],
      value: currentAmount,
    });

    res.status(200).json({
      investment,
      performance: {
        initialAmount,
        currentAmount,
        totalReturn,
        percentageReturn,
        annualizedReturn:
          period === 'year' ? percentageReturn : percentageReturn * (365 / 30),
        performanceData,
      },
      transactions,
      period,
    });
  }),

  // Get investment portfolio overview
  getPortfolioOverview: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;

    // Get all investments
    const investments = await prisma.investment.findMany({
      where: { userId },
    });

    // Calculate portfolio metrics
    const totalInvested = investments.reduce(
      (total, investment) => total + Number(investment.initialAmount),
      0
    );

    const currentValue = investments.reduce(
      (total, investment) => total + Number(investment.currentAmount),
      0
    );

    const totalReturn = currentValue - totalInvested;
    const percentageReturn = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

    // Group investments by type
    const investmentsByType = investments.reduce((acc, investment) => {
      const type = investment.type || 'Other';
      if (!acc[type]) {
        acc[type] = {
          type,
          count: 0,
          totalInvested: 0,
          currentValue: 0,
        };
      }

      acc[type].count += 1;
      acc[type].totalInvested += Number(investment.initialAmount);
      acc[type].currentValue += Number(investment.currentAmount);

      return acc;
    }, {} as Record<string, { type: string; count: number; totalInvested: number; currentValue: number }>);

    // Convert to array and calculate percentages
    const portfolioDistribution = Object.values(investmentsByType).map((item) => ({
      ...item,
      percentage: (item.currentValue / currentValue) * 100,
      return: item.currentValue - item.totalInvested,
      returnPercentage:
        item.totalInvested > 0
          ? ((item.currentValue - item.totalInvested) / item.totalInvested) * 100
          : 0,
    }));

    res.status(200).json({
      portfolioSummary: {
        totalInvested,
        currentValue,
        totalReturn,
        percentageReturn,
        investmentCount: investments.length,
      },
      portfolioDistribution,
      investments: investments.map((investment) => ({
        id: investment.id,
        name: investment.name,
        type: investment.type,
        initialAmount: Number(investment.initialAmount),
        currentAmount: Number(investment.currentAmount),
        return: Number(investment.currentAmount) - Number(investment.initialAmount),
        returnPercentage:
          Number(investment.initialAmount) > 0
            ? ((Number(investment.currentAmount) - Number(investment.initialAmount)) /
                Number(investment.initialAmount)) *
              100
            : 0,
        riskLevel: investment.riskLevel,
        status: investment.status,
      })),
    });
  }),

  // Get investment recommendations
  getInvestmentRecommendations: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { riskLevel = 'medium' } = req.query;

    // In a real app, we would use an investment API or ML model to generate recommendations
    // Here we'll return some simulated recommendations based on risk level

    // Get user's current investments to avoid recommending duplicates
    const userInvestments = await prisma.investment.findMany({
      where: { userId },
      select: { type: true },
    });

    const userInvestmentTypes = new Set(userInvestments.map((i) => i.type));

    // Simulated investment recommendations
    const recommendations = [];

    if (riskLevel === 'low') {
      if (!userInvestmentTypes.has('bonds')) {
        recommendations.push({
          type: 'bonds',
          name: 'Government Bonds',
          description: 'Low-risk government bonds with stable returns',
          expectedReturn: '3-5%',
          riskLevel: 'low',
        });
      }

      if (!userInvestmentTypes.has('etf')) {
        recommendations.push({
          type: 'etf',
          name: 'S&P 500 ETF',
          description: 'Broad market exposure with moderate growth potential',
          expectedReturn: '7-10%',
          riskLevel: 'low-medium',
        });
      }
    } else if (riskLevel === 'medium') {
      if (!userInvestmentTypes.has('stocks')) {
        recommendations.push({
          type: 'stocks',
          name: 'Blue Chip Stocks',
          description: 'Established companies with consistent performance',
          expectedReturn: '8-12%',
          riskLevel: 'medium',
        });
      }

      if (!userInvestmentTypes.has('real_estate')) {
        recommendations.push({
          type: 'real_estate',
          name: 'Real Estate Investment Trust',
          description: 'Property investments with regular income',
          expectedReturn: '6-10%',
          riskLevel: 'medium',
        });
      }
    } else {
      // high risk
      if (!userInvestmentTypes.has('crypto')) {
        recommendations.push({
          type: 'crypto',
          name: 'Cryptocurrency',
          description: 'High volatility digital assets with growth potential',
          expectedReturn: '10-30%',
          riskLevel: 'high',
        });
      }

      if (!userInvestmentTypes.has('startups')) {
        recommendations.push({
          type: 'startups',
          name: 'Tech Startups',
          description: 'Early-stage companies with high growth potential',
          expectedReturn: '15-25%',
          riskLevel: 'high',
        });
      }
    }

    // Add some general recommendations
    if (!userInvestmentTypes.has('index_funds')) {
      recommendations.push({
        type: 'index_funds',
        name: 'Total Market Index Fund',
        description: 'Broad market exposure with low fees',
        expectedReturn: '7-10%',
        riskLevel: 'medium',
      });
    }

    res.status(200).json({
      recommendations,
      riskLevel,
    });
  }),

  // Add funds to investment
  fundInvestment: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new ApiError(400, 'Valid amount is required');
    }

    // Check if investment exists
    const investment = await prisma.investment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!investment) {
      throw new ApiError(404, 'Investment not found');
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

      // Update investment
      const updatedInvestment = await prisma.investment.update({
        where: { id },
        data: {
          initialAmount: { increment: Number(amount) },
          currentAmount: { increment: Number(amount) },
        },
      });

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          amount: Number(amount),
          type: 'investment',
          category: 'investment',
          description: `Added funds to ${investment.name}`,
          date: new Date(),
          status: 'completed',
          investmentId: id,
        },
      });

      return { updatedWallet, updatedInvestment, transaction };
    });

    res.status(200).json({
      message: 'Funds added to investment successfully',
      investment: result.updatedInvestment,
      wallet: result.updatedWallet,
      transaction: result.transaction,
    });
  }),

  // Withdraw funds from investment
  withdrawInvestment: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      throw new ApiError(400, 'Valid amount is required');
    }

    // Check if investment exists
    const investment = await prisma.investment.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!investment) {
      throw new ApiError(404, 'Investment not found');
    }

    if (Number(investment.currentAmount) < Number(amount)) {
      throw new ApiError(400, 'Insufficient investment balance');
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

      // Update investment
      const updatedInvestment = await prisma.investment.update({
        where: { id },
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
          type: 'withdrawal',
          category: 'investment_withdrawal',
          description: `Withdrew funds from ${investment.name}`,
          date: new Date(),
          status: 'completed',
          investmentId: id,
        },
      });

      return { updatedWallet, updatedInvestment, transaction };
    });

    res.status(200).json({
      message: 'Funds withdrawn from investment successfully',
      investment: result.updatedInvestment,
      wallet: result.updatedWallet,
      transaction: result.transaction,
    });
  }),
};
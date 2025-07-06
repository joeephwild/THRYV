import { Request, Response } from 'express';
import { prisma } from '../index';
import { ApiError, asyncHandler } from '../middleware/error.middleware';

// In a real application, you would use the OpenAI API or another AI service
// This is a simplified implementation for demonstration purposes
export const aiController = {
  // Start a new conversation with AI CFO
  startConversation: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { topic } = req.body;

    if (!topic) {
      throw new ApiError(400, 'Topic is required');
    }

    // Create a new conversation
    const conversation = await prisma.aiConversation.create({
      data: {
        userId,
        topic,
        messages: [
          {
            role: 'system',
            content:
              'I am your AI CFO (Chief Financial Officer). I can help you with financial advice, budgeting, saving, and investment strategies tailored to your needs as a Gen Z individual.',
          },
          {
            role: 'assistant',
            content: `Hello! I'm your AI CFO. How can I help you with your ${topic} today?`,
          },
        ],
      },
    });

    res.status(201).json({
      message: 'Conversation started successfully',
      conversation,
    });
  }),

  // Send a message to an existing conversation
  sendMessage: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      throw new ApiError(400, 'Message is required');
    }

    // Check if conversation exists
    const conversation = await prisma.aiConversation.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!conversation) {
      throw new ApiError(404, 'Conversation not found');
    }

    // In a real application, you would send the message to an AI service like OpenAI
    // and get a response. Here we'll simulate a response.

    // Add user message to conversation
    const updatedMessages = [...conversation.messages, { role: 'user', content: message }];

    // Generate AI response based on the message content
    let aiResponse = '';

    if (message.toLowerCase().includes('budget')) {
      aiResponse =
        'To create an effective budget, start by tracking your income and expenses. Allocate funds for necessities, savings, and discretionary spending. I recommend the 50/30/20 rule: 50% for needs, 30% for wants, and 20% for savings and debt repayment.';
    } else if (message.toLowerCase().includes('save') || message.toLowerCase().includes('saving')) {
      aiResponse =
        'For effective saving, set specific goals and automate your savings. Consider setting up a separate savings account and scheduling automatic transfers after each paycheck. Even small amounts add up over time!';
    } else if (message.toLowerCase().includes('invest') || message.toLowerCase().includes('investment')) {
      aiResponse =
        'As a young investor, time is your greatest asset. Consider starting with index funds or ETFs for broad market exposure with lower risk. Remember to diversify your investments and only invest money you won\'t need in the short term.';
    } else if (message.toLowerCase().includes('debt') || message.toLowerCase().includes('loan')) {
      aiResponse =
        'When managing debt, focus on high-interest debt first while making minimum payments on other debts. Consider refinancing options for student loans, and avoid accumulating credit card debt by paying your balance in full each month.';
    } else {
      aiResponse =
        'Thanks for your message! As your AI CFO, I\'m here to help with budgeting, saving, investing, and general financial advice. Could you provide more details about what specific financial guidance you\'re looking for?';
    }

    // Add AI response to conversation
    updatedMessages.push({ role: 'assistant', content: aiResponse });

    // Update conversation in database
    const updatedConversation = await prisma.aiConversation.update({
      where: { id },
      data: {
        messages: updatedMessages,
        updatedAt: new Date(),
      },
    });

    res.status(200).json({
      message: 'Message sent successfully',
      conversation: updatedConversation,
    });
  }),

  // Get conversation history
  getConversation: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;
    const { id } = req.params;

    const conversation = await prisma.aiConversation.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!conversation) {
      throw new ApiError(404, 'Conversation not found');
    }

    res.status(200).json({
      conversation,
    });
  }),

  // Get all conversations
  getConversations: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;

    const conversations = await prisma.aiConversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    res.status(200).json({
      conversations,
    });
  }),

  // Get financial insights
  getFinancialInsights: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;

    // Get user's transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 3)), // Last 3 months
        },
      },
    });

    // Get user's budgets
    const budgets = await prisma.budget.findMany({
      where: { userId },
    });

    // Get user's savings goals
    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId },
    });

    // Get user's investments
    const investments = await prisma.investment.findMany({
      where: { userId },
    });

    // Calculate insights
    const totalSpending = transactions
      .filter((t) => t.type === 'payment')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalIncome = transactions
      .filter((t) => t.type === 'deposit')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalSavings = savingsGoals.reduce(
      (sum, goal) => sum + Number(goal.currentAmount),
      0
    );

    const totalInvestments = investments.reduce(
      (sum, inv) => sum + Number(inv.currentAmount),
      0
    );

    // Group spending by category
    const spendingByCategory = transactions
      .filter((t) => t.type === 'payment')
      .reduce((acc, t) => {
        const category = t.category || 'Uncategorized';
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += Number(t.amount);
        return acc;
      }, {} as Record<string, number>);

    // Convert to array and calculate percentages
    const spendingCategories = Object.entries(spendingByCategory).map(
      ([category, amount]) => ({
        category,
        amount,
        percentage: totalSpending > 0 ? (amount / totalSpending) * 100 : 0,
      })
    );

    // Generate insights
    const insights = [];

    // Savings rate
    const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
    insights.push({
      type: 'savings_rate',
      title: 'Savings Rate',
      value: savingsRate.toFixed(1) + '%',
      description:
        savingsRate >= 20
          ? 'Great job! You\'re saving at a healthy rate.'
          : savingsRate >= 10
          ? 'You\'re on the right track with your savings.'
          : 'Consider increasing your savings rate to at least 20%.',
    });

    // Spending trend
    const monthlySpending = transactions
      .filter((t) => t.type === 'payment')
      .reduce((acc, t) => {
        const month = t.date.getMonth();
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += Number(t.amount);
        return acc;
      }, {} as Record<number, number>);

    const months = Object.keys(monthlySpending).map(Number);
    const currentMonth = new Date().getMonth();
    const previousMonth = (currentMonth - 1 + 12) % 12;

    const spendingTrend =
      months.includes(currentMonth) && months.includes(previousMonth)
        ? ((monthlySpending[currentMonth] - monthlySpending[previousMonth]) /
            monthlySpending[previousMonth]) *
          100
        : 0;

    insights.push({
      type: 'spending_trend',
      title: 'Monthly Spending Trend',
      value: spendingTrend.toFixed(1) + '%',
      description:
        spendingTrend <= -5
          ? 'Your spending has decreased significantly this month. Great job!'
          : spendingTrend <= 0
          ? 'Your spending is stable or slightly decreasing.'
          : spendingTrend <= 10
          ? 'Your spending has increased slightly this month.'
          : 'Your spending has increased significantly this month. Consider reviewing your budget.',
    });

    // Budget adherence
    const budgetAdherence = budgets.map((budget) => {
      const budgetTransactions = transactions.filter(
        (t) => t.budgetId === budget.id || t.category === budget.category
      );

      const spent = budgetTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
      const adherencePercentage = (spent / Number(budget.amount)) * 100;

      return {
        budgetName: budget.name,
        budgetAmount: Number(budget.amount),
        spent,
        adherencePercentage,
        status:
          adherencePercentage > 100
            ? 'over'
            : adherencePercentage > 90
            ? 'near'
            : 'under',
      };
    });

    const overBudgetCount = budgetAdherence.filter((b) => b.status === 'over').length;

    insights.push({
      type: 'budget_adherence',
      title: 'Budget Adherence',
      value: `${budgets.length - overBudgetCount}/${budgets.length} on track`,
      description:
        overBudgetCount === 0
          ? 'You\'re staying within all your budgets. Excellent work!'
          : overBudgetCount === 1
          ? 'You\'re over budget in one category. Review your spending in this area.'
          : `You\'re over budget in ${overBudgetCount} categories. Consider adjusting your budgets or reducing spending.`,
    });

    // Investment allocation
    const investmentAllocation = investments.reduce((acc, inv) => {
      const type = inv.type || 'Other';
      if (!acc[type]) {
        acc[type] = 0;
      }
      acc[type] += Number(inv.currentAmount);
      return acc;
    }, {} as Record<string, number>);

    // Check diversification
    const investmentTypes = Object.keys(investmentAllocation).length;
    const diversificationScore = Math.min(investmentTypes * 20, 100);

    insights.push({
      type: 'investment_diversification',
      title: 'Investment Diversification',
      value: `${diversificationScore}/100`,
      description:
        diversificationScore >= 80
          ? 'Your investments are well diversified across different asset classes.'
          : diversificationScore >= 40
          ? 'Consider diversifying your investments further to reduce risk.'
          : 'Your investment portfolio lacks diversification. Consider adding different asset classes.',
    });

    res.status(200).json({
      insights,
      financialSummary: {
        totalIncome,
        totalSpending,
        totalSavings,
        totalInvestments,
        netWorth: totalSavings + totalInvestments,
      },
      spendingCategories,
      budgetAdherence,
    });
  }),

  // Get spending recommendations
  getSpendingRecommendations: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;

    // Get user's transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'payment',
        date: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 3)), // Last 3 months
        },
      },
    });

    // Group spending by category
    const spendingByCategory = transactions.reduce((acc, t) => {
      const category = t.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += Number(t.amount);
      return acc;
    }, {} as Record<string, number>);

    // Find highest spending categories
    const sortedCategories = Object.entries(spendingByCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Generate recommendations
    const recommendations = [];

    // Add category-specific recommendations
    sortedCategories.forEach(([category, amount]) => {
      if (category === 'Food & Dining') {
        recommendations.push({
          category,
          title: 'Reduce Food Expenses',
          description:
            'You spent $' +
            amount.toFixed(2) +
            ' on food in the last 3 months. Try meal prepping, cooking at home more often, and limiting food delivery services.',
          potentialSavings: (amount * 0.2).toFixed(2),
          difficulty: 'medium',
        });
      } else if (category === 'Entertainment') {
        recommendations.push({
          category,
          title: 'Optimize Entertainment Spending',
          description:
            'Look for free or low-cost entertainment options. Consider sharing subscription services with friends or family, and take advantage of student discounts.',
          potentialSavings: (amount * 0.3).toFixed(2),
          difficulty: 'easy',
        });
      } else if (category === 'Shopping') {
        recommendations.push({
          category,
          title: 'Smart Shopping Strategies',
          description:
            'Implement a 24-hour rule before making non-essential purchases. Look for second-hand options, and use cashback apps or browser extensions for online shopping.',
          potentialSavings: (amount * 0.25).toFixed(2),
          difficulty: 'medium',
        });
      } else if (category === 'Transportation') {
        recommendations.push({
          category,
          title: 'Reduce Transportation Costs',
          description:
            'Consider using public transportation, carpooling, biking, or walking when possible. If you have a car, combine errands to save on fuel.',
          potentialSavings: (amount * 0.15).toFixed(2),
          difficulty: 'medium',
        });
      } else {
        recommendations.push({
          category,
          title: `Optimize ${category} Spending`,
          description: `You spent $${amount.toFixed(
            2
          )} on ${category} in the last 3 months. Review these expenses to identify potential savings opportunities.`,
          potentialSavings: (amount * 0.15).toFixed(2),
          difficulty: 'medium',
        });
      }
    });

    // Add general recommendations
    recommendations.push({
      category: 'General',
      title: 'Track Your Expenses',
      description:
        'Regularly review your transactions and categorize them correctly. This helps identify spending patterns and areas for improvement.',
      potentialSavings: 'Variable',
      difficulty: 'easy',
    });

    recommendations.push({
      category: 'General',
      title: 'Use the 50/30/20 Budget Rule',
      description:
        'Allocate 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment.',
      potentialSavings: 'Variable',
      difficulty: 'medium',
    });

    res.status(200).json({
      recommendations,
      topSpendingCategories: sortedCategories.map(([category, amount]) => ({
        category,
        amount,
      })),
    });
  }),

  // Get saving recommendations
  getSavingRecommendations: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;

    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    // Get user's savings goals
    const savingsGoals = await prisma.savingsGoal.findMany({
      where: { userId },
    });

    // Get user's emergency fund
    const emergencyFund = await prisma.emergencyFund.findFirst({
      where: { userId },
    });

    // Get user's income (from transactions)
    const incomeTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'deposit',
        date: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 3)), // Last 3 months
        },
      },
    });

    const monthlyIncome =
      incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0) / 3;

    // Generate recommendations
    const recommendations = [];

    // Emergency fund recommendation
    const hasEmergencyFund = emergencyFund && Number(emergencyFund.currentAmount) > 0;
    const emergencyFundTarget = monthlyIncome * 3; // 3 months of expenses
    const emergencyFundProgress = hasEmergencyFund
      ? (Number(emergencyFund.currentAmount) / emergencyFundTarget) * 100
      : 0;

    recommendations.push({
      type: 'emergency_fund',
      title: 'Build an Emergency Fund',
      description: hasEmergencyFund
        ? emergencyFundProgress >= 100
          ? 'Great job! You have a fully funded emergency fund.'
          : `You've started an emergency fund, but aim to save at least 3 months of expenses (about $${emergencyFundTarget.toFixed(
              2
            )}). You're currently at ${emergencyFundProgress.toFixed(1)}% of this goal.`
        : 'Start an emergency fund with a target of 3-6 months of living expenses. This provides a financial safety net for unexpected situations.',
      priority: hasEmergencyFund && emergencyFundProgress >= 100 ? 'low' : 'high',
      action: hasEmergencyFund ? 'contribute' : 'create',
    });

    // Automate savings recommendation
    recommendations.push({
      type: 'automate_savings',
      title: 'Automate Your Savings',
      description:
        'Set up automatic transfers to your savings account after each paycheck. Start with 10-20% of your income, or whatever you can afford consistently.',
      priority: 'medium',
      action: 'setup',
    });

    // Specific savings goals
    if (savingsGoals.length === 0) {
      recommendations.push({
        type: 'savings_goals',
        title: 'Set Specific Savings Goals',
        description:
          'Create specific, measurable savings goals like "New Laptop" or "Summer Trip" to stay motivated and track your progress.',
        priority: 'medium',
        action: 'create',
      });
    } else {
      // Check progress on existing goals
      const behindGoals = savingsGoals.filter((goal) => {
        if (!goal.targetDate) return false;

        const totalDays =
          (new Date(goal.targetDate).getTime() - new Date(goal.createdAt).getTime()) /
          (1000 * 60 * 60 * 24);
        const daysElapsed =
          (new Date().getTime() - new Date(goal.createdAt).getTime()) /
          (1000 * 60 * 60 * 24);
        const expectedProgress = (daysElapsed / totalDays) * 100;
        const actualProgress =
          (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;

        return actualProgress < expectedProgress - 10; // More than 10% behind schedule
      });

      if (behindGoals.length > 0) {
        recommendations.push({
          type: 'savings_goals_progress',
          title: 'Boost Your Savings Rate',
          description: `You're behind on ${behindGoals.length} of your savings goals. Consider increasing your contributions or adjusting your timeline.`,
          priority: 'medium',
          action: 'increase_contributions',
          goals: behindGoals.map((goal) => goal.name),
        });
      }
    }

    // Round-up savings
    recommendations.push({
      type: 'round_up',
      title: 'Use Round-Up Savings',
      description:
        'Enable round-up savings to automatically save the spare change from your transactions. This painless method can add up significantly over time.',
      priority: 'low',
      action: 'enable',
    });

    // Save windfalls
    recommendations.push({
      type: 'windfalls',
      title: 'Save Unexpected Income',
      description:
        'When you receive unexpected money (tax refunds, gifts, bonuses), save at least 50% before spending any of it.',
      priority: 'low',
      action: 'remember',
    });

    res.status(200).json({
      recommendations,
      savingsSummary: {
        totalSavings: savingsGoals.reduce(
          (sum, goal) => sum + Number(goal.currentAmount),
          0
        ),
        emergencyFund: hasEmergencyFund ? Number(emergencyFund.currentAmount) : 0,
        savingsGoals: savingsGoals.length,
      },
    });
  }),

  // Get investment recommendations
  getInvestmentRecommendations: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user.id;

    // Get user's investments
    const investments = await prisma.investment.findMany({
      where: { userId },
    });

    // Get user's risk profile from query params or default to medium
    const { riskProfile = 'medium' } = req.query;

    // Generate recommendations
    const recommendations = [];

    // Start investing recommendation
    if (investments.length === 0) {
      recommendations.push({
        type: 'start_investing',
        title: 'Start Your Investment Journey',
        description:
          'Begin investing with a small amount regularly. Consider index funds or ETFs for a diversified, low-cost entry into the market.',
        priority: 'high',
        riskLevel: 'low',
        expectedReturn: '7-10% annually',
        action: 'start',
      });
    }

    // Retirement account recommendation
    const hasRetirementAccount = investments.some(
      (inv) => inv.type === 'retirement' || inv.name.toLowerCase().includes('retirement')
    );

    if (!hasRetirementAccount) {
      recommendations.push({
        type: 'retirement',
        title: 'Start a Retirement Account',
        description:
          'Open a retirement account and contribute regularly. The power of compound interest makes early contributions extremely valuable for your future.',
        priority: 'high',
        riskLevel: 'medium',
        expectedReturn: '7-10% annually',
        action: 'open_account',
      });
    }

    // Diversification recommendation
    const investmentTypes = new Set(investments.map((inv) => inv.type));
    if (investmentTypes.size < 3 && investments.length > 0) {
      recommendations.push({
        type: 'diversification',
        title: 'Diversify Your Portfolio',
        description:
          'Spread your investments across different asset classes to reduce risk. Consider adding stocks, bonds, real estate, or other investment types to your portfolio.',
        priority: 'medium',
        riskLevel: 'varies',
        expectedReturn: 'varies',
        action: 'diversify',
      });
    }

    // Risk-based recommendations
    if (riskProfile === 'low') {
      recommendations.push({
        type: 'low_risk',
        title: 'Conservative Investment Options',
        description:
          'Consider bonds, certificates of deposit (CDs), or high-yield savings accounts for stable, lower-risk returns.',
        priority: 'medium',
        riskLevel: 'low',
        expectedReturn: '2-5% annually',
        action: 'explore',
      });
    } else if (riskProfile === 'medium') {
      recommendations.push({
        type: 'medium_risk',
        title: 'Balanced Investment Approach',
        description:
          'A mix of index funds, blue-chip stocks, and bonds can provide a balance of growth and stability.',
        priority: 'medium',
        riskLevel: 'medium',
        expectedReturn: '5-8% annually',
        action: 'explore',
      });
    } else if (riskProfile === 'high') {
      recommendations.push({
        type: 'high_risk',
        title: 'Growth-Focused Investments',
        description:
          'Consider growth stocks, emerging markets, or specialized ETFs for potentially higher returns with increased volatility.',
        priority: 'medium',
        riskLevel: 'high',
        expectedReturn: '8-12%+ annually',
        action: 'explore',
      });
    }

    // Dollar-cost averaging recommendation
    recommendations.push({
      type: 'dollar_cost_averaging',
      title: 'Invest Regularly with Dollar-Cost Averaging',
      description:
        'Invest a fixed amount regularly, regardless of market conditions. This strategy reduces the impact of market volatility and removes emotion from investing.',
      priority: 'medium',
      riskLevel: 'varies',
      expectedReturn: 'varies',
      action: 'implement',
    });

    // Educational recommendation
    recommendations.push({
      type: 'education',
      title: 'Expand Your Investment Knowledge',
      description:
        'Continue learning about investing through books, courses, or reputable online resources. Understanding the market helps you make informed decisions.',
      priority: 'low',
      riskLevel: 'none',
      expectedReturn: 'indirect',
      action: 'learn',
    });

    res.status(200).json({
      recommendations,
      investmentSummary: {
        totalInvested: investments.reduce(
          (sum, inv) => sum + Number(inv.initialAmount),
          0
        ),
        currentValue: investments.reduce(
          (sum, inv) => sum + Number(inv.currentAmount),
          0
        ),
        investmentCount: investments.length,
        riskProfile,
      },
    });
  }),
};
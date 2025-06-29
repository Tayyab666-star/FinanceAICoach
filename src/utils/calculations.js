// Financial calculation utilities

export const calculateBudgetUsage = (transactions, budgetCategories) => {
  const categorySpending = {};
  
  // Initialize all categories with 0
  Object.keys(budgetCategories).forEach(category => {
    categorySpending[category] = 0;
  });

  // Calculate spending per category
  transactions.forEach(transaction => {
    if (transaction.type === 'expense' && transaction.category) {
      categorySpending[transaction.category] = (categorySpending[transaction.category] || 0) + Math.abs(transaction.amount);
    }
  });

  // Calculate usage percentages and remaining amounts
  const budgetUsage = {};
  Object.keys(budgetCategories).forEach(category => {
    const spent = categorySpending[category] || 0;
    const budget = budgetCategories[category] || 0;
    const remaining = budget - spent;
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;

    budgetUsage[category] = {
      spent,
      budget,
      remaining,
      percentage,
      isOverBudget: spent > budget
    };
  });

  return budgetUsage;
};

export const calculateTotalSpending = (transactions) => {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((total, t) => total + Math.abs(t.amount), 0);
};

export const calculateTotalIncome = (transactions) => {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((total, t) => total + t.amount, 0);
};

export const calculateMonthlySavings = (monthlyIncome, totalExpenses) => {
  return monthlyIncome - totalExpenses;
};

export const calculateGoalProgress = (goal, transactions = []) => {
  // Calculate progress based on current amount vs target
  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
  return Math.min(progress, 100);
};

export const generateAIInsights = (userProfile, transactions, budgetUsage, goals) => {
  const insights = [];
  const totalBudget = userProfile?.monthly_budget || 0;
  const totalSpent = calculateTotalSpending(transactions);
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // Budget insights
  if (spentPercentage > 90) {
    insights.push({
      type: 'warning',
      title: 'Budget Alert',
      message: `You've used ${spentPercentage.toFixed(1)}% of your monthly budget. Consider reducing expenses.`,
      priority: 'high'
    });
  } else if (spentPercentage > 75) {
    insights.push({
      type: 'caution',
      title: 'Budget Watch',
      message: `You're at ${spentPercentage.toFixed(1)}% of your monthly budget. Keep an eye on spending.`,
      priority: 'medium'
    });
  }

  // Category-specific insights
  Object.entries(budgetUsage).forEach(([category, usage]) => {
    if (usage.isOverBudget) {
      insights.push({
        type: 'warning',
        title: `${category} Over Budget`,
        message: `You've exceeded your ${category} budget by $${(usage.spent - usage.budget).toFixed(2)}.`,
        priority: 'high'
      });
    } else if (usage.percentage > 80) {
      insights.push({
        type: 'caution',
        title: `${category} Budget Alert`,
        message: `You've used ${usage.percentage.toFixed(1)}% of your ${category} budget.`,
        priority: 'medium'
      });
    }
  });

  // Savings insights
  const monthlySavings = calculateMonthlySavings(userProfile?.monthly_income || 0, totalSpent);
  const savingsRate = (userProfile?.monthly_income || 0) > 0 ? (monthlySavings / userProfile.monthly_income) * 100 : 0;

  if (savingsRate > 20) {
    insights.push({
      type: 'success',
      title: 'Great Savings Rate',
      message: `You're saving ${savingsRate.toFixed(1)}% of your income. Excellent financial discipline!`,
      priority: 'low'
    });
  } else if (savingsRate < 10 && (userProfile?.monthly_income || 0) > 0) {
    insights.push({
      type: 'warning',
      title: 'Low Savings Rate',
      message: `Your savings rate is ${savingsRate.toFixed(1)}%. Try to save at least 20% of your income.`,
      priority: 'high'
    });
  }

  // Goal insights
  goals.forEach(goal => {
    const progress = calculateGoalProgress(goal, transactions);
    const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
    
    if (progress >= 100) {
      insights.push({
        type: 'success',
        title: 'Goal Achieved!',
        message: `Congratulations! You've reached your goal: ${goal.title}`,
        priority: 'low'
      });
    } else if (daysLeft < 30 && progress < 80) {
      insights.push({
        type: 'warning',
        title: 'Goal Behind Schedule',
        message: `Your goal "${goal.title}" is ${progress.toFixed(1)}% complete with ${daysLeft} days left.`,
        priority: 'medium'
      });
    }
  });

  return insights.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
};
import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions, useGoals, useBudgetCategories } from '../hooks/useSupabaseData';
import { calculateBudgetUsage } from '../utils/calculations';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ResponsiveModal from '../components/ResponsiveModal';

// Learn More Modal component
const LearnMoreModal = ({ isOpen, onClose, insight }: {
  isOpen: boolean;
  onClose: () => void;
  insight: any;
}) => {
  if (!insight) return null;

  const getDetailedInfo = (insight: any) => {
    switch (insight.type) {
      case 'warning':
        return {
          title: 'Budget Alert Details',
          content: `
            Your current spending pattern indicates you're approaching or exceeding your budget limits. Here's what you can do:
            
            • Review your recent transactions to identify unnecessary expenses
            • Consider adjusting your budget categories based on actual spending
            • Set up spending alerts to get notified before reaching limits
            • Look for subscription services you might not be using
            
            Remember, budgets are meant to be flexible guides, not rigid restrictions. Adjust them as your financial situation changes.
          `,
          tips: [
            'Track daily expenses for a week to understand spending patterns',
            'Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings',
            'Review and adjust budgets monthly based on actual spending'
          ]
        };
      case 'success':
        return {
          title: 'Great Financial Habits',
          content: `
            Congratulations! Your financial discipline is paying off. Here's how to maintain this momentum:
            
            • Continue tracking your expenses regularly
            • Consider increasing your savings rate gradually
            • Look into investment opportunities for your surplus funds
            • Set new, more ambitious financial goals
            
            Your current savings rate puts you ahead of most people. Keep up the excellent work!
          `,
          tips: [
            'Consider automating your savings to maintain consistency',
            'Explore high-yield savings accounts or investment options',
            'Set stretch goals to challenge yourself further'
          ]
        };
      default:
        return {
          title: 'Financial Insight Details',
          content: `
            This insight is based on your current financial data and spending patterns. Here are some general recommendations:
            
            • Regularly review your financial goals and progress
            • Keep track of your spending across all categories
            • Look for opportunities to optimize your budget
            • Consider consulting with a financial advisor for personalized advice
            
            Remember, small consistent changes can lead to significant improvements over time.
          `,
          tips: [
            'Set aside time weekly to review your finances',
            'Use financial apps and tools to automate tracking',
            'Educate yourself about personal finance through books and courses'
          ]
        };
    }
  };

  const details = getDetailedInfo(insight);

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={details.title}
      size="lg"
    >
      <div className="space-y-6">
        <div className={`p-4 rounded-lg border-l-4 ${
          insight.type === 'warning' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400' :
          insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-400' :
          'bg-blue-50 dark:bg-blue-900/20 border-blue-400'
        }`}>
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">{insight.title}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">{insight.message}</p>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Detailed Analysis</h4>
          <div className="prose prose-sm text-gray-600 dark:text-gray-300">
            {details.content.split('\n').map((line, index) => (
              <p key={index} className="mb-2 text-gray-600 dark:text-gray-300">{line}</p>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Actionable Tips</h4>
          <ul className="space-y-2">
            {details.tips.map((tip, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-sm text-gray-600 dark:text-gray-300">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">💡 Pro Tip</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Use our AI Coach feature to get personalized financial advice and ask specific questions about your financial situation.
          </p>
        </div>
      </div>
    </ResponsiveModal>
  );
};

// AI Insights component with Learn More functionality
const AIInsights = ({ insights }: { insights: any[] }) => {
  const [selectedInsight, setSelectedInsight] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const handleLearnMore = (insight: any) => {
    setSelectedInsight(insight);
    setShowModal(true);
  };

  if (!insights || insights.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">AI Financial Insights</h3>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Add more transactions to get personalized insights!</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">AI Financial Insights</h3>
        <div className="space-y-4">
          {insights.slice(0, 3).map((insight, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                insight.type === 'warning' 
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400' 
                  : insight.type === 'success'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-400'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-400'
              }`}
            >
              <h4 className="font-medium text-gray-900 dark:text-white mb-1">{insight.title}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{insight.message}</p>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleLearnMore(insight)}
              >
                Learn More
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <LearnMoreModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        insight={selectedInsight}
      />
    </>
  );
};

// Metric card component
const MetricCard = ({ title, value, change, icon: Icon, trend }: {
  title: string;
  value: number | string;
  change?: string;
  icon: React.ComponentType<any>;
  trend?: 'up' | 'down';
}) => (
  <Card className="p-4 sm:p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
        </p>
        {change && (
          <div className={`flex items-center mt-1 text-sm ${
            trend === 'up' ? 'text-green-600 dark:text-green-400' : 
            trend === 'down' ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-300'
          }`}>
            {trend === 'up' && <TrendingUp className="w-4 h-4 mr-1" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4 mr-1" />}
            {change}
          </div>
        )}
      </div>
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
      </div>
    </div>
  </Card>
);

// Main analytics page component
const Analytics = () => {
  const { userProfile } = useAuth();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { goals, loading: goalsLoading } = useGoals();
  const { budgets, loading: budgetsLoading } = useBudgetCategories();
  const [timeRange, setTimeRange] = useState('6m');

  // Calculate metrics based on actual data
  const metrics = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const netWorth = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    return {
      netWorth,
      totalIncome,
      totalExpenses,
      savingsRate
    };
  }, [transactions]);

  // Generate monthly data from actual transactions
  const monthlyData = useMemo(() => {
    const months = [];
    const now = new Date();
    const monthsToShow = timeRange === '1m' ? 1 : timeRange === '3m' ? 3 : timeRange === '6m' ? 6 : 12;
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === date.getMonth() && 
               transactionDate.getFullYear() === date.getFullYear();
      });
      
      const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        income,
        expenses,
        savings: income - expenses
      });
    }
    
    return months;
  }, [transactions, timeRange]);

  // Generate category spending data from actual transactions
  const categorySpending = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    expenseTransactions.forEach(transaction => {
      const category = transaction.category;
      categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(transaction.amount);
    });

    const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];
    
    return Object.entries(categoryTotals)
      .map(([category, amount], index) => ({
        name: category === 'Food' ? 'Food & Dining' : 
              category === 'Transport' ? 'Transportation' :
              category === 'Bills' ? 'Bills & Utilities' : category,
        amount,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [transactions]);

  // Generate daily spending pattern from actual transactions
  const dailySpending = useMemo(() => {
    const dayTotals: Record<string, number> = {
      'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0
    };
    
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    
    expenseTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      dayTotals[dayName] += Math.abs(transaction.amount);
    });

    return Object.entries(dayTotals).map(([day, amount]) => ({
      day,
      amount: Math.round(amount)
    }));
  }, [transactions]);

  // Calculate budget usage
  const budgetUsage = useMemo(() => {
    if (!transactions || !budgets) return {};
    return calculateBudgetUsage(transactions, budgets);
  }, [transactions, budgets]);

  // Generate AI insights
  const insights = useMemo(() => {
    const insights = [];
    
    if (metrics.savingsRate > 20) {
      insights.push({
        type: 'success',
        title: 'Excellent Savings Rate',
        message: `You're saving ${metrics.savingsRate.toFixed(1)}% of your income. Keep up the great work!`
      });
    } else if (metrics.savingsRate < 10 && metrics.totalIncome > 0) {
      insights.push({
        type: 'warning',
        title: 'Low Savings Rate',
        message: `Your savings rate is ${metrics.savingsRate.toFixed(1)}%. Consider reducing expenses to save more.`
      });
    }

    // Budget insights
    Object.entries(budgetUsage).forEach(([category, usage]: [string, any]) => {
      if (usage.isOverBudget) {
        insights.push({
          type: 'warning',
          title: `${category} Over Budget`,
          message: `You've exceeded your ${category} budget by $${(usage.spent - usage.budget).toFixed(2)}.`
        });
      }
    });

    // Spending pattern insights
    if (categorySpending.length > 0) {
      const topCategory = categorySpending[0];
      if (topCategory.percentage > 40) {
        insights.push({
          type: 'info',
          title: 'High Category Spending',
          message: `${topCategory.name} accounts for ${topCategory.percentage}% of your expenses. Consider if this aligns with your priorities.`
        });
      }
    }

    return insights;
  }, [metrics, budgetUsage, categorySpending]);

  if (transactionsLoading || goalsLoading || budgetsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Financial Analytics</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Deep insights into your financial patterns</p>
        </div>
        
        {/* Time range selector */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 w-full sm:w-auto">
          {['1m', '3m', '6m', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {range === '1m' ? '1M' : 
               range === '3m' ? '3M' : 
               range === '6m' ? '6M' : '1Y'}
            </button>
          ))}
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Net Worth"
          value={metrics.netWorth}
          change={metrics.netWorth >= 0 ? "+12.5%" : "-8.2%"}
          icon={DollarSign}
          trend={metrics.netWorth >= 0 ? 'up' : 'down'}
        />
        <MetricCard
          title="Monthly Income"
          value={userProfile?.monthly_income || 0}
          change="+5.2%"
          icon={TrendingUp}
          trend="up"
        />
        <MetricCard
          title="Total Expenses"
          value={metrics.totalExpenses}
          change="-3.1%"
          icon={TrendingDown}
          trend="down"
        />
        <MetricCard
          title="Savings Rate"
          value={`${metrics.savingsRate.toFixed(1)}%`}
          change="+2.1%"
          icon={Target}
          trend="up"
        />
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Income vs Expenses */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Income vs Expenses</h3>
          {monthlyData.length > 0 ? (
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stackId="1"
                    stroke="#10B981" 
                    fill="#10B981"
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expenses" 
                    stackId="2"
                    stroke="#EF4444" 
                    fill="#EF4444"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <p>No transaction data available</p>
                <p className="text-sm">Add transactions to see your income vs expenses chart</p>
              </div>
            </div>
          )}
        </Card>

        {/* Spending by Category */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Spending by Category</h3>
          {categorySpending.length > 0 ? (
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpending}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    label={({ name, percentage }) => `${name} ${percentage}%`}
                  >
                    {categorySpending.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${value}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <p>No expense data available</p>
                <p className="text-sm">Add expense transactions to see category breakdown</p>
              </div>
            </div>
          )}
        </Card>

        {/* Daily Spending Pattern */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Daily Spending Pattern</h3>
          {dailySpending.some(d => d.amount > 0) ? (
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailySpending}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <p>No spending pattern data</p>
                <p className="text-sm">Add more transactions to see daily spending patterns</p>
              </div>
            </div>
          )}
        </Card>

        {/* Savings Trend */}
        <Card>
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Savings Trend</h3>
          {monthlyData.length > 0 ? (
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="savings" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 sm:h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <p>No savings data available</p>
                <p className="text-sm">Add income and expense transactions to track savings</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* AI Insights */}
      <AIInsights insights={insights} />

      {/* Category breakdown table */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Category Breakdown</h3>
        {categorySpending.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 text-gray-600 dark:text-gray-300 font-medium">Category</th>
                  <th className="text-right py-3 text-gray-600 dark:text-gray-300 font-medium">Amount</th>
                  <th className="text-right py-3 text-gray-600 dark:text-gray-300 font-medium">Percentage</th>
                  <th className="text-right py-3 text-gray-600 dark:text-gray-300 font-medium">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {categorySpending.map((category, index) => {
                  const transactionCount = transactions.filter(t => 
                    t.type === 'expense' && t.category === category.name.replace(' & Dining', '').replace('Transportation', 'Transport').replace(' & Utilities', '')
                  ).length;
                  
                  return (
                    <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                      <td className="py-3">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-gray-900 dark:text-white">{category.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 font-medium text-gray-900 dark:text-white">${category.amount.toFixed(2)}</td>
                      <td className="text-right py-3 text-gray-900 dark:text-white">{category.percentage}%</td>
                      <td className="text-right py-3 text-gray-600 dark:text-gray-300">{transactionCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No expense categories to display</p>
            <p className="text-sm">Add expense transactions to see detailed breakdown</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Analytics;
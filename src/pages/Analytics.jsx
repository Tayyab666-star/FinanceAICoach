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
import { TrendingUp, TrendingDown, DollarSign, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions, useGoals, useBudgetCategories } from '../hooks/useSupabaseData';
import { calculateBudgetUsage } from '../utils/calculations';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';

// AI Insights component
const AIInsights = ({ insights }) => {
  if (!insights || insights.length === 0) {
    return (
      <Card>
        <h3 className="text-lg font-semibold mb-4">AI Financial Insights</h3>
        <div className="text-center py-8 text-gray-500">
          <p>Add more transactions to get personalized insights!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-4">AI Financial Insights</h3>
      <div className="space-y-4">
        {insights.slice(0, 3).map((insight, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border-l-4 ${
              insight.type === 'warning' 
                ? 'bg-orange-50 border-orange-400' 
                : insight.type === 'success'
                ? 'bg-green-50 border-green-400'
                : 'bg-blue-50 border-blue-400'
            }`}
          >
            <h4 className="font-medium text-gray-900 mb-1">{insight.title}</h4>
            <p className="text-sm text-gray-600 mb-3">{insight.message}</p>
            <Button size="sm" variant="outline">Learn More</Button>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Metric card component
const MetricCard = ({ title, value, change, icon: Icon, trend }) => (
  <Card className="p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && (
          <div className={`flex items-center mt-1 text-sm ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {change}
          </div>
        )}
      </div>
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
        <Icon className="w-6 h-6 text-blue-600" />
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
    const categoryTotals = {};
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
    const dayTotals = {
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
    Object.entries(budgetUsage).forEach(([category, usage]) => {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Analytics</h1>
          <p className="text-gray-600">Deep insights into your financial patterns</p>
        </div>
        
        {/* Time range selector */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {['1m', '3m', '6m', '1y'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range === '1m' ? '1 Month' : 
               range === '3m' ? '3 Months' : 
               range === '6m' ? '6 Months' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Net Worth"
          value={`$${metrics.netWorth.toLocaleString()}`}
          change={metrics.netWorth >= 0 ? "+12.5%" : "-8.2%"}
          icon={DollarSign}
          trend={metrics.netWorth >= 0 ? 'up' : 'down'}
        />
        <MetricCard
          title="Monthly Income"
          value={`$${userProfile?.monthly_income?.toLocaleString() || '0'}`}
          change="+5.2%"
          icon={TrendingUp}
          trend="up"
        />
        <MetricCard
          title="Total Expenses"
          value={`$${metrics.totalExpenses.toLocaleString()}`}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Income vs Expenses</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
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
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p>No transaction data available</p>
                <p className="text-sm">Add transactions to see your income vs expenses chart</p>
              </div>
            </div>
          )}
        </Card>

        {/* Spending by Category */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
          {categorySpending.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
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
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p>No expense data available</p>
                <p className="text-sm">Add expense transactions to see category breakdown</p>
              </div>
            </div>
          )}
        </Card>

        {/* Daily Spending Pattern */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Daily Spending Pattern</h3>
          {dailySpending.some(d => d.amount > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailySpending}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p>No spending pattern data</p>
                <p className="text-sm">Add more transactions to see daily spending patterns</p>
              </div>
            </div>
          )}
        </Card>

        {/* Savings Trend */}
        <Card>
          <h3 className="text-lg font-semibold mb-4">Savings Trend</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
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
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
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
        <h3 className="text-lg font-semibold mb-4">Category Breakdown</h3>
        {categorySpending.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-gray-600 font-medium">Category</th>
                  <th className="text-right py-3 text-gray-600 font-medium">Amount</th>
                  <th className="text-right py-3 text-gray-600 font-medium">Percentage</th>
                  <th className="text-right py-3 text-gray-600 font-medium">Transactions</th>
                </tr>
              </thead>
              <tbody>
                {categorySpending.map((category, index) => {
                  const transactionCount = transactions.filter(t => 
                    t.type === 'expense' && t.category === category.name.replace(' & Dining', '').replace('Transportation', 'Transport').replace(' & Utilities', '')
                  ).length;
                  
                  return (
                    <tr key={index} className="border-b border-gray-100">
                      <td className="py-3">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-3"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </td>
                      <td className="text-right py-3 font-medium">${category.amount.toFixed(2)}</td>
                      <td className="text-right py-3">{category.percentage}%</td>
                      <td className="text-right py-3 text-gray-600">{transactionCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No expense categories to display</p>
            <p className="text-sm">Add expense transactions to see detailed breakdown</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Analytics;
import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  CreditCard,
  PieChart,
  Calendar,
  AlertCircle,
  CheckCircle,
  Plus,
  BarChart,
  Edit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions, useGoals, useBudgetCategories } from '../hooks/useSupabaseData';
import { calculateBudgetUsage, generateAIInsights } from '../utils/calculations';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Setup modal for income and budget - show for new users
const SetupModal = ({ isOpen, onClose, onSave, userProfile }) => {
  const [formData, setFormData] = useState({
    monthly_income: userProfile?.monthly_income || 5000,
    monthly_budget: userProfile?.monthly_budget || 4000
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave({
        monthly_income: parseFloat(formData.monthly_income),
        monthly_budget: parseFloat(formData.monthly_budget),
        setup_completed: true
      });
      onClose();
    } catch (error) {
      console.error('Error saving setup:', error);
      alert('Failed to save setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Welcome! Let's Set Up Your Account</h3>
            <p className="text-gray-600 dark:text-gray-300">
              To get started with your financial dashboard, please enter your monthly income and budget.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Monthly Income"
              type="number"
              step="0.01"
              value={formData.monthly_income}
              onChange={(e) => setFormData({ ...formData, monthly_income: e.target.value })}
              placeholder="Enter your monthly income"
              required
            />
            
            <Input
              label="Monthly Budget"
              type="number"
              step="0.01"
              value={formData.monthly_budget}
              onChange={(e) => setFormData({ ...formData, monthly_budget: e.target.value })}
              placeholder="Enter your monthly budget"
              required
            />
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Tip:</strong> Your budget should typically be 70-80% of your income to allow for savings and unexpected expenses.
              </p>
            </div>
            
            <Button type="submit" className="w-full" loading={loading}>
              Complete Setup & Continue
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

// Quick action card component with navigation
const QuickActionCard = ({ title, description, icon: Icon, color = 'blue', path }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <Card 
      className="p-4 hover:shadow-md transition-shadow cursor-pointer" 
      onClick={handleClick}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
          color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/50' :
          color === 'green' ? 'bg-green-100 dark:bg-green-900/50' :
          color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/50' : 'bg-gray-100 dark:bg-gray-700'
        }`}>
          <Icon className={`w-5 h-5 ${
            color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
            color === 'green' ? 'text-green-600 dark:text-green-400' :
            color === 'purple' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-300'
          }`} />
        </div>
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
        </div>
      </div>
    </Card>
  );
};

// Metric card component
const MetricCard = ({ title, value, change, icon: Icon, trend, prefix = '$', onEdit }) => (
  <Card className="p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
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
      <div className="flex flex-col items-end space-y-2">
        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        )}
      </div>
    </div>
  </Card>
);

// Recent transactions component with navigation
const RecentTransactions = ({ transactions }) => {
  const navigate = useNavigate();
  const recentTransactions = transactions.slice(0, 5);

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/transactions')}
          >
            View All
          </Button>
        </div>
        
        {recentTransactions.length > 0 ? (
          <div className="space-y-3">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'
                  }`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{transaction.description}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{transaction.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${
                    transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CreditCard className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p>No transactions yet</p>
            <p className="text-sm">Add your first transaction to get started!</p>
          </div>
        )}
      </div>
    </Card>
  );
};

// Budget overview component with navigation
const BudgetOverview = ({ budgetUsage }) => {
  const navigate = useNavigate();
  const categories = Object.entries(budgetUsage).slice(0, 4);

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Budget Overview</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/budget')}
          >
            Manage Budget
          </Button>
        </div>
        
        {categories.length > 0 ? (
          <div className="space-y-4">
            {categories.map(([category, usage]) => (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">{category}</span>
                  <span className="text-gray-600 dark:text-gray-300">
                    ${usage.spent.toFixed(2)} / ${usage.budget.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      usage.isOverBudget ? 'bg-red-500' : 
                      usage.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(usage.percentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {usage.percentage.toFixed(1)}% used
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <PieChart className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p>No budget categories set</p>
            <p className="text-sm">Set up your budget to track spending!</p>
          </div>
        )}
      </div>
    </Card>
  );
};

// Goals progress component with navigation
const GoalsProgress = ({ goals }) => {
  const navigate = useNavigate();
  const activeGoals = goals.slice(0, 3);

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Goals Progress</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/goals')}
          >
            View All Goals
          </Button>
        </div>
        
        {activeGoals.length > 0 ? (
          <div className="space-y-4">
            {activeGoals.map((goal) => {
              const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
              const isCompleted = progress >= 100;
              
              return (
                <div key={goal.id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{goal.title}</span>
                    {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>${goal.current_amount.toLocaleString()}</span>
                    <span>${goal.target_amount.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p>No goals set yet</p>
            <p className="text-sm">Create your first financial goal!</p>
          </div>
        )}
      </div>
    </Card>
  );
};

// AI Insights component with navigation
const AIInsights = ({ insights }) => {
  const navigate = useNavigate();
  const topInsights = insights.slice(0, 3);

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/ai-coach')}
          >
            AI Coach
          </Button>
        </div>
        
        {topInsights.length > 0 ? (
          <div className="space-y-3">
            {topInsights.map((insight, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border-l-4 ${
                  insight.type === 'warning' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400' :
                  insight.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-400' :
                  'bg-blue-50 dark:bg-blue-900/20 border-blue-400'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {insight.type === 'warning' ? (
                    <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5" />
                  ) : insight.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">{insight.title}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p>No insights available</p>
            <p className="text-sm">Add transactions to get AI insights!</p>
          </div>
        )}
      </div>
    </Card>
  );
};

// Main dashboard component
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile, updateUserProfile, getUserDisplayName } = useAuth();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { goals, loading: goalsLoading } = useGoals();
  const { budgets, loading: budgetsLoading } = useBudgetCategories();
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Check if user needs setup - this is the key fix!
  const needsSetup = userProfile && !userProfile.setup_completed;

  // Auto-show setup modal for new users - Enhanced logic
  React.useEffect(() => {
    console.log('Dashboard useEffect - userProfile:', userProfile);
    console.log('Setup completed:', userProfile?.setup_completed);
    console.log('Needs setup:', needsSetup);
    
    if (needsSetup) {
      console.log('Showing setup modal for new user');
      setShowSetupModal(true);
    }
  }, [needsSetup, userProfile]);

  // Calculate metrics
  const totalIncome = useMemo(() => 
    transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const totalExpenses = useMemo(() => 
    transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [transactions]
  );

  const netWorth = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  // Calculate budget usage
  const budgetUsage = useMemo(() => {
    if (!transactions || !budgets) return {};
    return calculateBudgetUsage(transactions, budgets);
  }, [transactions, budgets]);

  // Generate AI insights
  const insights = useMemo(() => 
    generateAIInsights(userProfile, transactions, budgetUsage, goals),
    [userProfile, transactions, budgetUsage, goals]
  );

  // Prepare chart data
  const monthlyData = useMemo(() => {
    const last6Months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === date.getMonth() && 
               transactionDate.getFullYear() === date.getFullYear();
      });
      
      const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      last6Months.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        income,
        expenses,
        savings: income - expenses
      });
    }
    
    return last6Months;
  }, [transactions]);

  const handleSetupSave = async (setupData) => {
    console.log('Saving setup data:', setupData);
    try {
      await updateUserProfile(setupData);
      console.log('Setup data saved successfully');
    } catch (error) {
      console.error('Error saving setup data:', error);
      throw error;
    }
  };

  const handleEditFinancials = () => {
    setShowSetupModal(true);
  };

  if (transactionsLoading || goalsLoading || budgetsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back, {getUserDisplayName()}!
        </h1>
        <p className="text-gray-600 dark:text-gray-300">Here's your financial overview</p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Net Worth"
          value={netWorth}
          change={netWorth >= 0 ? '+12.5%' : '-8.2%'}
          icon={DollarSign}
          trend={netWorth >= 0 ? 'up' : 'down'}
        />
        <MetricCard
          title="Monthly Income"
          value={userProfile?.monthly_income || 0}
          change="+5.2%"
          icon={TrendingUp}
          trend="up"
          onEdit={handleEditFinancials}
        />
        <MetricCard
          title="Monthly Budget"
          value={userProfile?.monthly_budget || 0}
          change="-3.1%"
          icon={TrendingDown}
          trend="down"
          onEdit={handleEditFinancials}
        />
        <MetricCard
          title="Savings Rate"
          value={savingsRate.toFixed(1)}
          change="+2.1%"
          icon={Target}
          trend="up"
          prefix=""
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Income vs Expenses</h3>
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
          </div>
        </Card>

        {/* Savings Trend */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Savings Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="savings" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Quick actions with working navigation */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              title="Add Transaction"
              description="Record income or expense"
              icon={Plus}
              color="blue"
              path="/transactions"
            />
            <QuickActionCard
              title="Set Budget"
              description="Plan your spending"
              icon={PieChart}
              color="green"
              path="/budget"
            />
            <QuickActionCard
              title="Create Goal"
              description="Set financial target"
              icon={Target}
              color="purple"
              path="/goals"
            />
            <QuickActionCard
              title="View Reports"
              description="Analyze your finances"
              icon={BarChart}
              color="blue"
              path="/reports"
            />
          </div>
        </div>
      </Card>

      {/* Dashboard widgets with navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentTransactions transactions={transactions} />
        <BudgetOverview budgetUsage={budgetUsage} />
        <GoalsProgress goals={goals} />
      </div>

      {/* AI Insights with navigation */}
      <AIInsights insights={insights} />

      {/* Setup Modal - Enhanced to always show for new users */}
      <SetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onSave={handleSetupSave}
        userProfile={userProfile}
      />
    </div>
  );
};

export default Dashboard;
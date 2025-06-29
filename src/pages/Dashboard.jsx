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
  Edit,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Receipt
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
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
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
      <Card className="w-full max-w-md bg-white">
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome! Let's Set Up Your Account</h3>
            <p className="text-gray-600">
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
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
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

// Quick action card component with navigation - Enhanced Design
const QuickActionCard = ({ title, description, icon: Icon, color = 'blue', path }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (path) {
      console.log('Navigating to:', path);
      navigate(path);
    }
  };

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
  };

  return (
    <div 
      className={`bg-gradient-to-r ${colorClasses[color]} p-6 rounded-xl text-white cursor-pointer transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-sm opacity-90">{description}</p>
        </div>
        <div className="ml-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced metric card component with blue theme
const MetricCard = ({ title, value, change, icon: Icon, trend, prefix = '$', onEdit, isMain = false }) => (
  <Card className={`${isMain ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'bg-white'} shadow-lg hover:shadow-xl transition-shadow duration-200`}>
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${isMain ? 'bg-white bg-opacity-20' : 'bg-blue-100'} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${isMain ? 'text-white' : 'text-blue-600'}`} />
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className={`p-2 ${isMain ? 'hover:bg-white hover:bg-opacity-20' : 'hover:bg-gray-100'} rounded-lg transition-colors`}
            title="Edit"
          >
            <Edit className={`w-4 h-4 ${isMain ? 'text-white' : 'text-gray-600'}`} />
          </button>
        )}
      </div>
      
      <div>
        <p className={`text-sm font-medium ${isMain ? 'text-white text-opacity-90' : 'text-gray-600'} mb-1`}>{title}</p>
        <p className={`text-3xl font-bold ${isMain ? 'text-white' : 'text-gray-900'} mb-2`}>
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {change && (
          <div className={`flex items-center text-sm ${
            isMain ? 'text-white text-opacity-90' : 
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend === 'up' && <ArrowUpRight className="w-4 h-4 mr-1" />}
            {trend === 'down' && <ArrowDownRight className="w-4 h-4 mr-1" />}
            {change}
          </div>
        )}
      </div>
    </div>
  </Card>
);

// Recent transactions component with enhanced design
const RecentTransactions = ({ transactions }) => {
  const navigate = useNavigate();
  const recentTransactions = transactions.slice(0, 5);

  return (
    <Card className="bg-white shadow-lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/transactions')}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            View All
          </Button>
        </div>
        
        {recentTransactions.length > 0 ? (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{transaction.description}</p>
                    <p className="text-xs text-gray-500">{transaction.category} • {new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>No transactions yet</p>
            <p className="text-sm">Add your first transaction to get started!</p>
          </div>
        )}
      </div>
    </Card>
  );
};

// Budget overview component with enhanced design
const BudgetOverview = ({ budgetUsage }) => {
  const navigate = useNavigate();
  const categories = Object.entries(budgetUsage).slice(0, 4);

  return (
    <Card className="bg-white shadow-lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Budget Overview</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/budget')}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            Manage Budget
          </Button>
        </div>
        
        {categories.length > 0 ? (
          <div className="space-y-4">
            {categories.map(([category, usage]) => (
              <div key={category}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-900">{category}</span>
                  <span className="text-gray-600">
                    ${usage.spent.toFixed(2)} / ${usage.budget.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      usage.isOverBudget ? 'bg-red-500' : 
                      usage.percentage > 80 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(usage.percentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {usage.percentage.toFixed(1)}% used
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>No budget categories set</p>
            <p className="text-sm">Set up your budget to track spending!</p>
          </div>
        )}
      </div>
    </Card>
  );
};

// Goals progress component with enhanced design
const GoalsProgress = ({ goals }) => {
  const navigate = useNavigate();
  const activeGoals = goals.slice(0, 3);

  return (
    <Card className="bg-white shadow-lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Goals Progress</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/goals')}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
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
                    <span className="font-medium text-gray-900 text-sm">{goal.title}</span>
                    {isCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isCompleted ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>${goal.current_amount.toLocaleString()}</span>
                    <span>${goal.target_amount.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>No goals set yet</p>
            <p className="text-sm">Create your first financial goal!</p>
          </div>
        )}
      </div>
    </Card>
  );
};

// AI Insights component with enhanced design
const AIInsights = ({ insights }) => {
  const navigate = useNavigate();
  const topInsights = insights.slice(0, 3);

  return (
    <Card className="bg-white shadow-lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/ai-coach')}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            AI Coach
          </Button>
        </div>
        
        {topInsights.length > 0 ? (
          <div className="space-y-3">
            {topInsights.map((insight, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border-l-4 ${
                  insight.type === 'warning' ? 'bg-orange-50 border-orange-400' :
                  insight.type === 'success' ? 'bg-green-50 border-green-400' :
                  'bg-blue-50 border-blue-400'
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
                    <h4 className="font-medium text-gray-900 text-sm">{insight.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p>No insights available</p>
            <p className="text-sm">Add transactions to get AI insights!</p>
          </div>
        )}
      </div>
    </Card>
  );
};

// Main dashboard component with blue theme
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="space-y-8 p-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back, {getUserDisplayName()}
          </h1>
          <p className="text-gray-600">Here's your financial overview</p>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Balance"
            value={netWorth}
            change={netWorth >= 0 ? '+12.5%' : '-8.2%'}
            icon={Wallet}
            trend={netWorth >= 0 ? 'up' : 'down'}
            isMain={true}
          />
          <MetricCard
            title="Total Income"
            value={userProfile?.monthly_income || 0}
            change="+5.2%"
            icon={TrendingUp}
            trend="up"
            onEdit={handleEditFinancials}
          />
          <MetricCard
            title="Total Spending"
            value={totalExpenses}
            change="-3.1%"
            icon={TrendingDown}
            trend="down"
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
          {/* Balance Overview Chart */}
          <Card className="bg-white shadow-lg">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Balance Overview</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    stackId="1"
                    stroke="#3B82F6" 
                    fill="#3B82F6"
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

          {/* All Spending Pie Chart */}
          <Card className="bg-white shadow-lg">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">All Spending</h3>
              <div className="flex items-center justify-center h-[300px]">
                <div className="relative">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">${totalExpenses.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Total Spent</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 text-center">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mb-1"></div>
                    <p className="text-xs text-gray-600">Workplace</p>
                    <p className="text-xs font-semibold">68%</p>
                  </div>
                  <div className="absolute bottom-4 left-4 text-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mb-1"></div>
                    <p className="text-xs text-gray-600">Employee Saving</p>
                    <p className="text-xs font-semibold">32%</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick actions with enhanced design */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
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
              color="orange"
              path="/reports"
            />
          </div>
        </div>

        {/* Dashboard widgets with enhanced design */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentTransactions transactions={transactions} />
          <BudgetOverview budgetUsage={budgetUsage} />
          <GoalsProgress goals={goals} />
        </div>

        {/* AI Insights with enhanced design */}
        <AIInsights insights={insights} />

        {/* Setup Modal - Enhanced to always show for new users */}
        <SetupModal
          isOpen={showSetupModal}
          onClose={() => setShowSetupModal(false)}
          onSave={handleSetupSave}
          userProfile={userProfile}
        />
      </div>
    </div>
  );
};

export default Dashboard;
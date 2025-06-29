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
  Receipt,
  Activity,
  Users,
  Zap
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
      <Card className="w-full max-w-md bg-white shadow-2xl">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <DollarSign className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Finance AI Coach!</h3>
            <p className="text-gray-600 leading-relaxed">
              Let's set up your financial profile to get personalized insights and recommendations.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
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
            
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Smart Tip</p>
                  <p className="text-sm text-blue-800">
                    We recommend budgeting 70-80% of your income for expenses, leaving 20-30% for savings and investments.
                  </p>
                </div>
              </div>
            </div>
            
            <Button type="submit" className="w-full py-3 text-lg font-semibold" loading={loading}>
              Complete Setup & Start Managing
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
};

// Enhanced Quick action card component
const QuickActionCard = ({ title, description, icon: Icon, color = 'blue', path, stats }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    if (path) {
      console.log('Navigating to:', path);
      navigate(path);
    }
  };

  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    green: 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700',
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
  };

  return (
    <div 
      className={`bg-gradient-to-br ${colorClasses[color]} p-6 rounded-2xl text-white cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl group`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-300">
          <Icon className="w-6 h-6" />
        </div>
        {stats && (
          <div className="text-right">
            <div className="text-2xl font-bold">{stats}</div>
            <div className="text-xs opacity-80">Total</div>
          </div>
        )}
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-1">{title}</h3>
        <p className="text-sm opacity-90">{description}</p>
      </div>
    </div>
  );
};

// Enhanced metric card component
const MetricCard = ({ title, value, change, icon: Icon, trend, prefix = '$', onEdit, isMain = false }) => (
  <Card className={`${isMain ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white border-0' : 'bg-white hover:bg-gray-50'} shadow-lg hover:shadow-xl transition-all duration-300 group`}>
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 ${isMain ? 'bg-white bg-opacity-20' : 'bg-blue-50'} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-7 h-7 ${isMain ? 'text-white' : 'text-blue-600'}`} />
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className={`p-2 ${isMain ? 'hover:bg-white hover:bg-opacity-20' : 'hover:bg-gray-100'} rounded-xl transition-colors`}
            title="Edit"
          >
            <Edit className={`w-4 h-4 ${isMain ? 'text-white' : 'text-gray-600'}`} />
          </button>
        )}
      </div>
      
      <div>
        <p className={`text-sm font-medium ${isMain ? 'text-white text-opacity-90' : 'text-gray-600'} mb-2`}>{title}</p>
        <p className={`text-3xl font-bold ${isMain ? 'text-white' : 'text-gray-900'} mb-3`}>
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {change && (
          <div className={`flex items-center text-sm ${
            isMain ? 'text-white text-opacity-90' : 
            trend === 'up' ? 'text-emerald-600' : 
            trend === 'down' ? 'text-red-500' : 'text-gray-600'
          }`}>
            {trend === 'up' && <ArrowUpRight className="w-4 h-4 mr-1" />}
            {trend === 'down' && <ArrowDownRight className="w-4 h-4 mr-1" />}
            <span className="font-medium">{change}</span>
          </div>
        )}
      </div>
    </div>
  </Card>
);

// Enhanced Recent transactions component
const RecentTransactions = ({ transactions }) => {
  const navigate = useNavigate();
  const recentTransactions = transactions.slice(0, 5);

  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/transactions')}
            className="text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            View All
          </Button>
        </div>
        
        {recentTransactions.length > 0 ? (
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors group">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <ArrowDownRight className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">{transaction.category} • {new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    transaction.type === 'income' ? 'text-emerald-600' : 'text-red-500'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-medium">No transactions yet</p>
            <p className="text-sm">Add your first transaction to get started!</p>
          </div>
        )}
      </div>
    </Card>
  );
};

// Enhanced Budget overview component
const BudgetOverview = ({ budgetUsage }) => {
  const navigate = useNavigate();
  const categories = Object.entries(budgetUsage).slice(0, 4);

  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Budget Overview</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/budget')}
            className="text-purple-600 border-purple-200 hover:bg-purple-50"
          >
            Manage
          </Button>
        </div>
        
        {categories.length > 0 ? (
          <div className="space-y-5">
            {categories.map(([category, usage]) => (
              <div key={category}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-900">{category}</span>
                  <span className="text-gray-600">
                    ${usage.spent.toFixed(2)} / ${usage.budget.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      usage.isOverBudget ? 'bg-red-500' : 
                      usage.percentage > 80 ? 'bg-yellow-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(usage.percentage, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 font-medium">
                  {usage.percentage.toFixed(1)}% used
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <PieChart className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-medium">No budget set</p>
            <p className="text-sm">Set up your budget to track spending!</p>
          </div>
        )}
      </div>
    </Card>
  );
};

// Enhanced Goals progress component
const GoalsProgress = ({ goals }) => {
  const navigate = useNavigate();
  const activeGoals = goals.slice(0, 3);

  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Goals Progress</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/goals')}
            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
          >
            View All
          </Button>
        </div>
        
        {activeGoals.length > 0 ? (
          <div className="space-y-5">
            {activeGoals.map((goal) => {
              const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
              const isCompleted = progress >= 100;
              
              return (
                <div key={goal.id}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-gray-900">{goal.title}</span>
                    {isCompleted && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${
                        isCompleted ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>${goal.current_amount.toLocaleString()}</span>
                    <span>${goal.target_amount.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-medium">No goals set</p>
            <p className="text-sm">Create your first financial goal!</p>
          </div>
        )}
      </div>
    </Card>
  );
};

// Enhanced AI Insights component
const AIInsights = ({ insights }) => {
  const navigate = useNavigate();
  const topInsights = insights.slice(0, 3);

  return (
    <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/ai-coach')}
            className="text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          >
            AI Coach
          </Button>
        </div>
        
        {topInsights.length > 0 ? (
          <div className="space-y-4">
            {topInsights.map((insight, index) => (
              <div 
                key={index}
                className={`p-4 rounded-xl border-l-4 ${
                  insight.type === 'warning' ? 'bg-orange-50 border-orange-400' :
                  insight.type === 'success' ? 'bg-emerald-50 border-emerald-400' :
                  'bg-blue-50 border-blue-400'
                }`}
              >
                <div className="flex items-start space-x-3">
                  {insight.type === 'warning' ? (
                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                  ) : insight.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  )}
                  <div>
                    <h4 className="font-medium text-gray-900">{insight.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{insight.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-gray-400" />
            </div>
            <p className="font-medium">No insights available</p>
            <p className="text-sm">Add transactions to get AI insights!</p>
          </div>
        )}
      </div>
    </Card>
  );
};

// Main dashboard component with enhanced design
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, userProfile, updateUserProfile, getUserDisplayName } = useAuth();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { goals, loading: goalsLoading } = useGoals();
  const { budgets, loading: budgetsLoading } = useBudgetCategories();
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Check if user needs setup
  const needsSetup = userProfile && !userProfile.setup_completed;

  // Auto-show setup modal for new users
  React.useEffect(() => {
    if (needsSetup) {
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
    await updateUserProfile(setupData);
  };

  const handleEditFinancials = () => {
    setShowSetupModal(true);
  };

  if (transactionsLoading || goalsLoading || budgetsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="space-y-8 p-6">
        {/* Enhanced Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            Welcome Back, {getUserDisplayName()}
          </h1>
          <p className="text-lg text-gray-600">Here's your financial overview for today</p>
        </div>

        {/* Enhanced Key metrics */}
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
            title="Monthly Income"
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

        {/* Enhanced Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Balance Overview Chart */}
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BarChart className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Balance Overview</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                    }}
                  />
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

          {/* All Spending Visualization */}
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <PieChart className="w-5 h-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Spending Distribution</h3>
              </div>
              <div className="flex items-center justify-center h-[300px]">
                <div className="relative">
                  <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center shadow-2xl">
                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-inner">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">${totalExpenses.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Total Spent</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 text-center">
                    <div className="w-4 h-4 bg-blue-500 rounded-full mb-1"></div>
                    <p className="text-xs text-gray-600 font-medium">Expenses</p>
                    <p className="text-xs font-bold">68%</p>
                  </div>
                  <div className="absolute bottom-4 left-4 text-center">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full mb-1"></div>
                    <p className="text-xs text-gray-600 font-medium">Savings</p>
                    <p className="text-xs font-bold">32%</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Enhanced Quick actions */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickActionCard
              title="Add Transaction"
              description="Record income or expense"
              icon={Plus}
              color="blue"
              path="/transactions"
              stats={transactions.length}
            />
            <QuickActionCard
              title="Manage Budget"
              description="Plan your spending"
              icon={PieChart}
              color="green"
              path="/budget"
              stats={Object.keys(budgets).length}
            />
            <QuickActionCard
              title="Track Goals"
              description="Monitor progress"
              icon={Target}
              color="purple"
              path="/goals"
              stats={goals.length}
            />
            <QuickActionCard
              title="View Reports"
              description="Analyze finances"
              icon={BarChart}
              color="orange"
              path="/reports"
            />
          </div>
        </div>

        {/* Enhanced Dashboard widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentTransactions transactions={transactions} />
          <BudgetOverview budgetUsage={budgetUsage} />
          <GoalsProgress goals={goals} />
        </div>

        {/* Enhanced AI Insights */}
        <AIInsights insights={insights} />

        {/* Setup Modal */}
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
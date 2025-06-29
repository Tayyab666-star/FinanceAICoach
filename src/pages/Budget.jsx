import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Brain, CheckCircle, AlertTriangle, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions, useBudgetCategories } from '../hooks/useSupabaseData';
import { useNotifications } from '../contexts/NotificationContext';
import { calculateBudgetUsage } from '../utils/calculations';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';

// Budget progress card component
const BudgetCard = ({ category, usage, onEdit }) => {
  const percentage = usage.percentage;
  const isOverBudget = usage.isOverBudget;

  return (
    <Card className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">{category}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            ${usage.spent.toFixed(2)} of ${usage.budget.toFixed(2)}
          </p>
        </div>
        <button 
          onClick={() => onEdit(category, usage.budget)}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mt-1">
          <span className="text-gray-900 dark:text-white">{percentage.toFixed(1)}% used</span>
          <span className={isOverBudget ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
            {isOverBudget ? `$${Math.abs(usage.remaining).toFixed(2)} over` : `$${usage.remaining.toFixed(2)} left`}
          </span>
        </div>
      </div>

      {/* Status indicator */}
      <div className="flex items-center">
        {isOverBudget ? (
          <>
            <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
            <span className="text-sm text-red-600 dark:text-red-400">Over budget</span>
          </>
        ) : percentage > 80 ? (
          <>
            <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
            <span className="text-sm text-yellow-600 dark:text-yellow-400">Almost at limit</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-sm text-green-600 dark:text-green-400">On track</span>
          </>
        )}
      </div>
    </Card>
  );
};

// AI Budget suggestions component with working Apply button
const AISuggestions = ({ budgetUsage, monthlyIncome, onApply }) => {
  const { addNotification } = useNotifications();
  
  const suggestions = useMemo(() => {
    const suggestions = [];
    
    Object.entries(budgetUsage).forEach(([category, usage]) => {
      if (usage.isOverBudget) {
        suggestions.push({
          category,
          type: 'increase',
          currentBudget: usage.budget,
          suggestedBudget: Math.ceil(usage.spent * 1.1),
          reason: `You've exceeded this budget. Consider increasing by ${((usage.spent / usage.budget - 1) * 100).toFixed(0)}%.`,
          confidence: 'High'
        });
      } else if (usage.percentage < 50 && usage.budget > 0) {
        suggestions.push({
          category,
          type: 'decrease',
          currentBudget: usage.budget,
          suggestedBudget: Math.max(usage.spent * 1.2, usage.budget * 0.8),
          reason: `You're only using ${usage.percentage.toFixed(0)}% of this budget. Consider reallocating funds.`,
          confidence: 'Medium'
        });
      }
    });

    return suggestions.slice(0, 3);
  }, [budgetUsage]);

  const handleApply = async (suggestion) => {
    try {
      await onApply(suggestion.category, suggestion.suggestedBudget);
      addNotification({
        type: 'success',
        title: 'Budget Updated',
        message: `${suggestion.category} budget updated to $${suggestion.suggestedBudget.toFixed(2)}`
      });
    } catch (error) {
      console.error('Error applying suggestion:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update budget. Please try again.'
      });
    }
  };

  if (suggestions.length === 0) {
    return (
      <Card>
        <div className="flex items-center mb-4">
          <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Budget Suggestions</h3>
        </div>
        <div className="text-center py-4">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
          <p className="text-gray-600 dark:text-gray-300">Your budget looks well-balanced!</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">No immediate adjustments needed.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center mb-4">
        <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Budget Suggestions</h3>
      </div>
      
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900 dark:text-white">{suggestion.category}</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${
                suggestion.confidence === 'High' 
                  ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' 
                  : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
              }`}>
                {suggestion.confidence} Confidence
              </span>
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{suggestion.reason}</p>
            
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="text-gray-600 dark:text-gray-300">Current: </span>
                <span className="font-medium text-gray-900 dark:text-white">${suggestion.currentBudget.toFixed(2)}</span>
                <span className="text-gray-600 dark:text-gray-300 mx-2">→</span>
                <span className="text-gray-600 dark:text-gray-300">Suggested: </span>
                <span className="font-medium text-blue-600 dark:text-blue-400">${suggestion.suggestedBudget.toFixed(2)}</span>
              </div>
              
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleApply(suggestion)}
              >
                Apply
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Budget setup modal
const BudgetSetupModal = ({ isOpen, onClose, onSave, monthlyBudget }) => {
  const [budgets, setBudgets] = useState({
    Food: Math.round(monthlyBudget * 0.25) || 0,
    Transport: Math.round(monthlyBudget * 0.15) || 0,
    Entertainment: Math.round(monthlyBudget * 0.10) || 0,
    Shopping: Math.round(monthlyBudget * 0.15) || 0,
    Bills: Math.round(monthlyBudget * 0.25) || 0,
    Healthcare: Math.round(monthlyBudget * 0.05) || 0,
    Education: Math.round(monthlyBudget * 0.03) || 0,
    Other: Math.round(monthlyBudget * 0.02) || 0
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const totalAllocated = Object.values(budgets).reduce((sum, amount) => sum + amount, 0);
  const remaining = monthlyBudget - totalAllocated;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(budgets);
      onClose();
    } catch (error) {
      console.error('Error saving budgets:', error);
      alert('Failed to save budgets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetChange = (category, value) => {
    setBudgets({ ...budgets, [category]: parseFloat(value) || 0 });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl m-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Set Up Category Budgets</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Allocate your monthly budget of <span className="font-semibold text-gray-900 dark:text-white">${monthlyBudget.toLocaleString()}</span> across categories
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(budgets).map(([category, amount]) => (
              <Input
                key={category}
                label={category}
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => handleBudgetChange(category, e.target.value)}
                placeholder="0.00"
              />
            ))}
          </div>
          
          <div className={`p-4 rounded-lg ${remaining >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900 dark:text-white">Total Allocated:</span>
              <span className="font-bold text-gray-900 dark:text-white">${totalAllocated.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900 dark:text-white">Remaining:</span>
              <span className={`font-bold ${remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                ${remaining.toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <Button type="submit" className="flex-1" disabled={remaining < 0 || loading} loading={loading}>
              Save Budget Categories
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Edit category modal with proper functionality
const EditCategoryModal = ({ isOpen, onClose, category, currentBudget, onSave }) => {
  const [budget, setBudget] = useState(currentBudget || 0);
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotifications();

  React.useEffect(() => {
    setBudget(currentBudget || 0);
  }, [currentBudget]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onSave(category, parseFloat(budget));
      addNotification({
        type: 'success',
        title: 'Budget Updated',
        message: `${category} budget updated to $${parseFloat(budget).toLocaleString()}`
      });
      onClose();
    } catch (error) {
      console.error('Error updating budget:', error);
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: 'Failed to update budget. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <Card className="w-full max-w-md m-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Edit {category} Budget</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Budget Amount"
            type="number"
            step="0.01"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="0.00"
            required
          />
          
          <div className="flex space-x-3">
            <Button type="submit" className="flex-1" loading={loading}>Update Budget</Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Main budget page component
const Budget = () => {
  const { userProfile } = useAuth();
  const { transactions, loading: transactionsLoading } = useTransactions();
  const { budgets, loading: budgetsLoading, updateBudgets, updateSingleBudget } = useBudgetCategories();
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingBudget, setEditingBudget] = useState(0);

  // Move useMemo before any conditional returns to ensure hooks are called in the same order
  const budgetUsage = useMemo(() => {
    if (!transactions || !budgets) return {};
    return calculateBudgetUsage(transactions, budgets);
  }, [transactions, budgets]);

  if (transactionsLoading || budgetsLoading) {
    return <LoadingSpinner />;
  }
  
  const totalAllocated = Object.values(budgets).reduce((sum, amount) => sum + amount, 0);
  const totalSpent = Object.values(budgetUsage).reduce((sum, usage) => sum + usage.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;

  const hasSetupBudgets = totalAllocated > 0;

  const handleSetupBudgets = async (budgetData) => {
    await updateBudgets(budgetData);
  };

  const handleEditCategory = (category, currentBudget) => {
    setEditingCategory(category);
    setEditingBudget(currentBudget);
    setShowEditModal(true);
  };

  const handleSaveCategory = async (category, newBudget) => {
    await updateSingleBudget(category, newBudget);
  };

  const handleApplySuggestion = async (category, suggestedBudget) => {
    await updateSingleBudget(category, suggestedBudget);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget Management</h1>
          <p className="text-gray-600 dark:text-gray-300">Plan and track your spending by category</p>
        </div>
        
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={() => setShowSetupModal(true)}
            className="flex items-center"
          >
            <Brain className="w-4 h-4 mr-2" />
            {hasSetupBudgets ? 'Reconfigure' : 'Setup'} Budgets
          </Button>
        </div>
      </div>

      {!hasSetupBudgets ? (
        // Setup prompt
        <Card className="p-12 text-center">
          <TrendingUp className="w-16 h-16 text-blue-500 dark:text-blue-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Set Up Your Budget</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Allocate your monthly budget of <span className="font-semibold text-gray-900 dark:text-white">${userProfile?.monthly_budget?.toLocaleString() || '0'}</span> across different categories to track your spending.
          </p>
          <Button onClick={() => setShowSetupModal(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Set Up Budget Categories
          </Button>
        </Card>
      ) : (
        <>
          {/* Budget overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-4 text-center">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Total Budgeted</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalAllocated.toLocaleString()}</p>
            </Card>
            
            <Card className="p-4 text-center">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Total Spent</h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalSpent.toLocaleString()}</p>
            </Card>
            
            <Card className="p-4 text-center">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Remaining</h3>
              <p className={`text-2xl font-bold ${
                totalRemaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                ${Math.abs(totalRemaining).toLocaleString()}
              </p>
            </Card>
          </div>

          {/* AI Suggestions */}
          <AISuggestions 
            budgetUsage={budgetUsage}
            monthlyIncome={userProfile?.monthly_income || 0}
            onApply={handleApplySuggestion}
          />

          {/* Budget cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(budgetUsage)
              .filter(([_, usage]) => usage.budget > 0)
              .map(([category, usage]) => (
                <BudgetCard
                  key={category}
                  category={category}
                  usage={usage}
                  onEdit={handleEditCategory}
                />
              ))}
          </div>
        </>
      )}

      {/* Modals */}
      <BudgetSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onSave={handleSetupBudgets}
        monthlyBudget={userProfile?.monthly_budget || 0}
      />
      
      <EditCategoryModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        category={editingCategory}
        currentBudget={editingBudget}
        onSave={handleSaveCategory}
      />
    </div>
  );
};

export default Budget;
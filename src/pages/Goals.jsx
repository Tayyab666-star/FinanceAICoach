import React, { useState } from 'react';
import { Plus, Target, Calendar, TrendingUp, Edit, Trash2, CheckCircle } from 'lucide-react';
import { useGoals, useTransactions } from '../hooks/useSupabaseData';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';

// Goal card component
const GoalCard = ({ goal, onEdit, onDelete, onContribute }) => {
  const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
  const remaining = goal.target_amount - goal.current_amount;
  const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const isCompleted = progress >= 100;
  const isOverdue = daysLeft < 0 && !isCompleted;
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{goal.category}</p>
        </div>
        <div className="flex space-x-2">
          {!isCompleted && (
            <button 
              onClick={() => onEdit(goal)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          )}
          <button 
            onClick={() => onDelete(goal.id)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </div>

      {/* Progress section */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
          <span className="text-gray-900 dark:text-white">${goal.current_amount.toLocaleString()}</span>
          <span className="text-gray-900 dark:text-white">${goal.target_amount.toLocaleString()}</span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${
              isCompleted ? 'bg-green-500' : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-600 dark:text-gray-300">{progress.toFixed(1)}% complete</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {isCompleted ? 'Goal Achieved!' : `$${remaining.toLocaleString()} to go`}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-300 mx-auto mb-1" />
          <p className="text-xs text-gray-600 dark:text-gray-300">Days left</p>
          <p className={`font-semibold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
            {isOverdue ? 'Overdue' : daysLeft}
          </p>
        </div>
        
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-300 mx-auto mb-1" />
          <p className="text-xs text-gray-600 dark:text-gray-300">Target date</p>
          <p className="font-semibold text-gray-900 dark:text-white text-xs">
            {new Date(goal.deadline).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Action button */}
      {isCompleted ? (
        <div className="flex items-center justify-center text-green-600 dark:text-green-400 font-medium">
          <CheckCircle className="w-4 h-4 mr-2" />
          Goal Completed!
        </div>
      ) : (
        <Button 
          onClick={() => onContribute(goal)}
          className="w-full"
          size="sm"
        >
          Add Contribution
        </Button>
      )}
    </Card>
  );
};

// Contribution modal
const ContributionModal = ({ isOpen, onClose, goal, onSave }) => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (amount && parseFloat(amount) > 0) {
      setLoading(true);
      try {
        await onSave(goal.id, parseFloat(amount));
        setAmount('');
        onClose();
      } catch (error) {
        console.error('Error adding contribution:', error);
        alert('Failed to add contribution. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <Card className="w-full max-w-md m-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Add Contribution</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">Contributing to: <strong className="text-gray-900 dark:text-white">{goal?.title}</strong></p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Contribution Amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
          
          <div className="flex space-x-3">
            <Button type="submit" className="flex-1" loading={loading}>Add Contribution</Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Goal modal
const GoalModal = ({ isOpen, onClose, goal, onSave }) => {
  const [formData, setFormData] = useState(
    goal || {
      title: '',
      target_amount: '',
      current_amount: '0',
      deadline: '',
      category: 'Savings'
    }
  );
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const goalData = {
        ...formData,
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount || 0)
      };

      await onSave(goalData);
      onClose();
    } catch (error) {
      console.error('Error saving goal:', error);
      alert('Failed to save goal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <Card className="w-full max-w-md m-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          {goal ? 'Edit Goal' : 'Create New Goal'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Goal Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Emergency Fund"
            required
          />
          
          <Input
            label="Target Amount"
            type="number"
            step="0.01"
            value={formData.target_amount}
            onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
            placeholder="0.00"
            required
          />
          
          <Input
            label="Current Amount"
            type="number"
            step="0.01"
            value={formData.current_amount}
            onChange={(e) => setFormData({ ...formData, current_amount: e.target.value })}
            placeholder="0.00"
          />
          
          <Input
            label="Target Date"
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              <option value="Savings">Savings</option>
              <option value="Purchase">Purchase</option>
              <option value="Travel">Travel</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Education">Education</option>
              <option value="Investment">Investment</option>
              <option value="Emergency">Emergency Fund</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div className="flex space-x-3">
            <Button type="submit" className="flex-1" loading={loading}>
              {goal ? 'Update' : 'Create'} Goal
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// Main goals page component
const Goals = () => {
  const { goals, loading, addGoal, updateGoal, deleteGoal } = useGoals();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);

  if (loading) {
    return <LoadingSpinner />;
  }

  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.current_amount, 0);
  const overallProgress = totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;
  const completedGoals = goals.filter(goal => (goal.current_amount / goal.target_amount) * 100 >= 100).length;

  const handleSaveGoal = async (goalData) => {
    if (editingGoal) {
      await updateGoal(editingGoal.id, goalData);
    } else {
      await addGoal(goalData);
    }
    setEditingGoal(null);
  };

  const handleEditGoal = (goal) => {
    setEditingGoal(goal);
    setShowGoalModal(true);
  };

  const handleDeleteGoal = async (id) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      await deleteGoal(id);
    }
  };

  const handleContribute = (goal) => {
    setSelectedGoal(goal);
    setShowContributionModal(true);
  };

  const handleSaveContribution = async (goalId, amount) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      await updateGoal(goalId, {
        current_amount: goal.current_amount + amount
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Goals</h1>
          <p className="text-gray-600 dark:text-gray-300">Track your progress towards financial milestones</p>
        </div>
        
        <Button 
          onClick={() => setShowGoalModal(true)}
          className="flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4 text-center">
          <Target className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Total Goals</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{goals.length}</p>
        </Card>
        
        <Card className="p-4 text-center">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Completed</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedGoals}</p>
        </Card>
        
        <Card className="p-4 text-center">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Total Progress</h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{overallProgress.toFixed(1)}%</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">${totalCurrentAmount.toLocaleString()} of ${totalTargetAmount.toLocaleString()}</p>
        </Card>
        
        <Card className="p-4 text-center">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Remaining</h3>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">${(totalTargetAmount - totalCurrentAmount).toLocaleString()}</p>
        </Card>
      </div>

      {/* Goals grid */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
              onContribute={handleContribute}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Goals Yet</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Start by creating your first financial goal to track your progress.</p>
          <Button onClick={() => setShowGoalModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Goal
          </Button>
        </Card>
      )}

      {/* Success tips */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Tips for Success</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Set Realistic Deadlines</h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">Choose achievable timeframes to maintain motivation and avoid disappointment.</p>
          </div>
          
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <h4 className="font-medium text-green-900 dark:text-green-300 mb-2">Break Down Large Goals</h4>
            <p className="text-sm text-green-800 dark:text-green-200">Divide big goals into smaller milestones to track progress more effectively.</p>
          </div>
          
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <h4 className="font-medium text-purple-900 dark:text-purple-300 mb-2">Regular Contributions</h4>
            <p className="text-sm text-purple-800 dark:text-purple-200">Make consistent contributions, even small ones, to build momentum.</p>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <GoalModal
        isOpen={showGoalModal}
        onClose={() => {
          setShowGoalModal(false);
          setEditingGoal(null);
        }}
        goal={editingGoal}
        onSave={handleSaveGoal}
      />
      
      <ContributionModal
        isOpen={showContributionModal}
        onClose={() => setShowContributionModal(false)}
        goal={selectedGoal}
        onSave={handleSaveContribution}
      />
    </div>
  );
};

export default Goals;
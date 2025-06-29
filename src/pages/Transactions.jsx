import React, { useState } from 'react';
import { 
  Plus, 
  Filter, 
  Search, 
  Upload, 
  Camera,
  CheckCircle,
  AlertCircle,
  X,
  Edit,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { useTransactions } from '../hooks/useSupabaseData';
import { uploadReceipt } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import ResponsiveModal from '../components/ResponsiveModal';
import ResponsiveDropdown from '../components/ResponsiveDropdown';
import LoadingSpinner from '../components/LoadingSpinner';

// Add/Edit transaction modal component
const TransactionModal = ({ isOpen, onClose, onSave, transaction = null }) => {
  const [formData, setFormData] = useState(
    transaction || {
      description: '',
      amount: '',
      category: 'Food',
      type: 'expense',
      date: new Date().toISOString().split('T')[0]
    }
  );
  const [loading, setLoading] = useState(false);

  // Update form data when transaction prop changes
  React.useEffect(() => {
    if (transaction) {
      setFormData(transaction);
    } else {
      setFormData({
        description: '',
        amount: '',
        category: 'Food',
        type: 'expense',
        date: new Date().toISOString().split('T')[0]
      });
    }
  }, [transaction]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount)
      };

      await onSave(transactionData);
      onClose();
      
      if (!transaction) {
        setFormData({
          description: '',
          amount: '',
          category: 'Food',
          type: 'expense',
          date: new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('Failed to save transaction. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={transaction ? 'Edit Transaction' : 'Add Transaction'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Description"
          name="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="e.g., Grocery shopping"
          required
        />
        
        <Input
          label="Amount"
          name="amount"
          type="number"
          step="0.01"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          placeholder="0.00"
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="type"
                value="expense"
                checked={formData.type === 'expense'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mr-2"
              />
              Expense
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="type"
                value="income"
                checked={formData.type === 'income'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mr-2"
              />
              Income
            </label>
          </div>
        </div>
        
        <div>
          <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            id="category-select"
            name="category"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            <option value="Food">Food & Dining</option>
            <option value="Transport">Transportation</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Shopping">Shopping</option>
            <option value="Bills">Bills & Utilities</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Education">Education</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <Input
          label="Date"
          name="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
        
        <div className="flex space-x-3 pt-4">
          <Button type="submit" className="flex-1" loading={loading}>
            {transaction ? 'Update' : 'Add'} Transaction
          </Button>
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

// Receipt upload modal with OCR simulation
const ReceiptUploadModal = ({ isOpen, onClose, onAdd }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [confidence, setConfidence] = useState(0);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    
    try {
      // Upload to Supabase Storage
      const receiptUrl = await uploadReceipt(file, user.id);
      
      setProcessing(true);
      setUploading(false);
      
      // Simulate OCR processing with progress
      for (let i = 0; i <= 100; i += 10) {
        setConfidence(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Mock OCR result
      const mockResults = [
        { description: 'Walmart Supercenter', amount: 67.89, category: 'Food' },
        { description: 'Shell Gas Station', amount: 45.20, category: 'Transport' },
        { description: 'Starbucks Coffee', amount: 12.50, category: 'Food' },
        { description: 'Amazon Purchase', amount: 89.99, category: 'Shopping' }
      ];
      
      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
      
      setOcrResult({
        ...randomResult,
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        receipt_url: receiptUrl
      });
      setProcessing(false);
    } catch (error) {
      console.error('Error uploading receipt:', error);
      alert('Failed to upload receipt. Please try again.');
      setUploading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      await onAdd(ocrResult);
      onClose();
      resetModal();
    } catch (error) {
      console.error('Error adding transaction:', error);
      alert('Failed to add transaction. Please try again.');
    }
  };

  const resetModal = () => {
    setOcrResult(null);
    setConfidence(0);
    setProcessing(false);
    setUploading(false);
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={() => { onClose(); resetModal(); }}
      title="Upload Receipt"
      size="md"
    >
      {!ocrResult && !processing && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Upload receipt image for automatic processing</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="receipt-upload"
            />
            <label htmlFor="receipt-upload">
              <Button as="span" variant="outline" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Choose File'}
              </Button>
            </label>
          </div>
        </div>
      )}
      
      {processing && (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 mb-2">Processing receipt...</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${confidence}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Confidence: {confidence}%</p>
        </div>
      )}
      
      {ocrResult && (
        <div className="space-y-4">
          <div className="flex items-center text-green-600 mb-4">
            <CheckCircle className="w-5 h-5 mr-2" />
            <span>Receipt processed successfully!</span>
          </div>
          
          <div className="space-y-3">
            <Input
              label="Description"
              name="description"
              value={ocrResult.description}
              onChange={(e) => setOcrResult({ ...ocrResult, description: e.target.value })}
            />
            <Input
              label="Amount"
              name="amount"
              type="number"
              step="0.01"
              value={ocrResult.amount}
              onChange={(e) => setOcrResult({ ...ocrResult, amount: parseFloat(e.target.value) })}
            />
            <div>
              <label htmlFor="ocr-category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="ocr-category"
                name="category"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={ocrResult.category}
                onChange={(e) => setOcrResult({ ...ocrResult, category: e.target.value })}
              >
                <option value="Food">Food & Dining</option>
                <option value="Transport">Transportation</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Shopping">Shopping</option>
                <option value="Bills">Bills & Utilities</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Input
              label="Date"
              name="date"
              type="date"
              value={ocrResult.date}
              onChange={(e) => setOcrResult({ ...ocrResult, date: e.target.value })}
            />
          </div>
          
          <div className="flex space-x-3 pt-4">
            <Button onClick={handleConfirm} className="flex-1">Confirm & Add</Button>
            <Button variant="secondary" onClick={resetModal}>Try Again</Button>
          </div>
        </div>
      )}
    </ResponsiveModal>
  );
};

// Filter dropdown component
const FilterDropdown = ({ filterType, filterCategory, onTypeChange, onCategoryChange }) => {
  return (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
      <ResponsiveDropdown
        trigger={
          <button className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 min-w-[120px]">
            <span className="text-sm">{filterType === 'all' ? 'All Types' : filterType === 'income' ? 'Income' : 'Expenses'}</span>
            <ChevronDown className="w-4 h-4 ml-2" />
          </button>
        }
        align="left"
      >
        <button
          onClick={() => onTypeChange('all')}
          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
        >
          All Types
        </button>
        <button
          onClick={() => onTypeChange('income')}
          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
        >
          Income
        </button>
        <button
          onClick={() => onTypeChange('expense')}
          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
        >
          Expenses
        </button>
      </ResponsiveDropdown>

      <ResponsiveDropdown
        trigger={
          <button className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 min-w-[140px]">
            <span className="text-sm truncate">
              {filterCategory === 'all' ? 'All Categories' : filterCategory}
            </span>
            <ChevronDown className="w-4 h-4 ml-2" />
          </button>
        }
        align="left"
      >
        <button
          onClick={() => onCategoryChange('all')}
          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
        >
          All Categories
        </button>
        {['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'].map(category => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            {category === 'Food' ? 'Food & Dining' : 
             category === 'Transport' ? 'Transportation' :
             category === 'Bills' ? 'Bills & Utilities' : category}
          </button>
        ))}
      </ResponsiveDropdown>
    </div>
  );
};

// Main transactions page component
const Transactions = () => {
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Filter transactions
  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || transaction.category === filterCategory;
    const matchesType = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesCategory && matchesType;
  });

  // Add or update transaction
  const handleSaveTransaction = async (transactionData) => {
    // Add null check to prevent error
    if (!transactionData) {
      console.error('Transaction data is null or undefined');
      return;
    }

    // Check if transactionData has an id to determine if it's an update or create
    if (transactionData.id) {
      await updateTransaction(transactionData.id, transactionData);
    } else {
      await addTransaction(transactionData);
    }
    setEditingTransaction(null);
  };

  // Delete transaction
  const handleDeleteTransaction = async (id) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(id);
    }
  };

  // Edit transaction
  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setShowAddModal(true);
  };

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">Manage your financial transactions</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            onClick={() => setShowReceiptModal(true)}
            className="flex items-center justify-center"
          >
            <Camera className="w-4 h-4 mr-2" />
            Upload Receipt
          </Button>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4 text-center">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</p>
        </Card>
        
        <Card className="p-4 text-center">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
        </Card>
        
        <Card className="p-4 text-center">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Net Amount</h3>
          <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${(totalIncome - totalExpenses).toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                name="search"
                placeholder="Search transactions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <FilterDropdown
            filterType={filterType}
            filterCategory={filterCategory}
            onTypeChange={setFilterType}
            onCategoryChange={setFilterCategory}
          />
        </div>
      </Card>

      {/* Transactions list */}
      <Card>
        <div className="divide-y divide-gray-100">
          {filteredTransactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {transaction.type === 'income' ? (
                    <Plus className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-red-600" />
                  )}
                </div>
                
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{transaction.description}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500">
                    <span>{new Date(transaction.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{transaction.category}</span>
                    <span>•</span>
                    <span className="capitalize">{transaction.type}</span>
                    {transaction.receipt_url && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600">📎 Receipt</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 flex-shrink-0">
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                </p>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditTransaction(transaction)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    aria-label="Edit transaction"
                  >
                    <Edit className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                    aria-label="Delete transaction"
                  >
                    <Trash2 className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              {transactions.length === 0 
                ? "No transactions yet. Add your first transaction to get started!"
                : "No transactions found matching your criteria."
              }
            </div>
          )}
        </div>
      </Card>

      {/* Modals */}
      <TransactionModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        transaction={editingTransaction}
      />
      
      <ReceiptUploadModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        onAdd={addTransaction}
      />
    </div>
  );
};

export default Transactions;
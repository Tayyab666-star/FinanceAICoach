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
  ChevronDown,
  Eye,
  FileImage,
  Loader
} from 'lucide-react';
import { useTransactions } from '../hooks/useSupabaseData';
import { uploadReceipt, processReceiptOCR, storeReceiptData } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
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
              <span className="text-gray-900 dark:text-white">Expense</span>
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
              <span className="text-gray-900 dark:text-white">Income</span>
            </label>
          </div>
        </div>
        
        <div>
          <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
          <select
            id="category-select"
            name="category"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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

// Enhanced Receipt upload modal with real OCR processing
const ReceiptUploadModal = ({ isOpen, onClose, onAdd }) => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [extractedText, setExtractedText] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      addNotification({
        type: 'error',
        title: 'Invalid File Type',
        message: 'Please select an image file (JPG, PNG, etc.)'
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      addNotification({
        type: 'error',
        title: 'File Too Large',
        message: 'Please select an image smaller than 10MB'
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleProcessReceipt = async () => {
    if (!selectedFile) return;

    setUploading(true);
    
    try {
      // Upload image to Supabase Storage
      const imageUrl = await uploadReceipt(selectedFile, user.id);
      
      setUploading(false);
      setProcessing(true);
      setConfidence(0);
      
      // Process OCR
      const ocrData = await processReceiptOCR(selectedFile, (progress) => {
        setConfidence(progress);
      });
      
      setExtractedText(ocrData.extracted_text || '');
      
      // Create result object
      const result = {
        description: ocrData.description,
        amount: ocrData.amount,
        category: ocrData.category,
        date: ocrData.date,
        type: 'expense',
        receipt_url: imageUrl,
        confidence: ocrData.confidence
      };
      
      setOcrResult(result);
      setProcessing(false);
      
      // Store receipt data in database
      await storeReceiptData({
        image_url: imageUrl,
        extracted_text: ocrData.extracted_text || '',
        parsed_data: result,
        confidence_score: ocrData.confidence
      }, user.id);
      
      addNotification({
        type: 'success',
        title: 'Receipt Processed',
        message: `Receipt processed with ${ocrData.confidence}% confidence`
      });
      
    } catch (error) {
      console.error('Error processing receipt:', error);
      setUploading(false);
      setProcessing(false);
      
      addNotification({
        type: 'error',
        title: 'Processing Failed',
        message: 'Failed to process receipt. Please try again or enter manually.'
      });
    }
  };

  const handleConfirm = async () => {
    try {
      await onAdd(ocrResult);
      onClose();
      resetModal();
      
      addNotification({
        type: 'success',
        title: 'Transaction Added',
        message: 'Receipt transaction has been added successfully'
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      addNotification({
        type: 'error',
        title: 'Failed to Add Transaction',
        message: 'Please try again or add the transaction manually'
      });
    }
  };

  const resetModal = () => {
    setOcrResult(null);
    setConfidence(0);
    setProcessing(false);
    setUploading(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedText('');
    
    // Clean up preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const handleClose = () => {
    onClose();
    resetModal();
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Receipt"
      size="lg"
    >
      <div className="space-y-6">
        {/* File Upload Section */}
        {!selectedFile && !ocrResult && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center">
              <Camera className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 mb-4">Upload receipt image for automatic processing</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Supports JPG, PNG, WebP (max 10MB)</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="receipt-upload"
              />
              <label htmlFor="receipt-upload">
                <Button as="span" variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </label>
            </div>
          </div>
        )}

        {/* File Preview and Processing */}
        {selectedFile && !ocrResult && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img 
                  src={previewUrl} 
                  alt="Receipt preview" 
                  className="w-20 h-20 object-cover border border-gray-200 dark:border-gray-600"
                />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{selectedFile.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>

            {!processing && !uploading && (
              <div className="flex space-x-3">
                <Button onClick={handleProcessReceipt} className="flex-1">
                  <FileImage className="w-4 h-4 mr-2" />
                  Process Receipt
                </Button>
                <Button variant="outline" onClick={resetModal}>
                  Choose Different File
                </Button>
              </div>
            )}

            {(uploading || processing) && (
              <div className="text-center py-6">
                <div className="flex items-center justify-center mb-4">
                  <Loader className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  {uploading ? 'Uploading image...' : 'Processing receipt...'}
                </p>
                {processing && (
                  <>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 mb-2">
                      <div 
                        className="bg-blue-600 h-2 transition-all duration-300"
                        style={{ width: `${confidence}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      OCR Progress: {confidence}%
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* OCR Results */}
        {ocrResult && (
          <div className="space-y-4">
            <div className="flex items-center text-green-600 dark:text-green-400 mb-4">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>Receipt processed successfully! (Confidence: {ocrResult.confidence}%)</span>
            </div>

            {/* Receipt Preview */}
            <div className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700">
              <img 
                src={previewUrl} 
                alt="Receipt" 
                className="w-16 h-16 object-cover border border-gray-200 dark:border-gray-600"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">Receipt Image</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Stored securely in your account
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(previewUrl, '_blank')}
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            </div>

            {/* Editable Transaction Data */}
            <div className="space-y-3">
              <Input
                label="Description"
                value={ocrResult.description}
                onChange={(e) => setOcrResult({ ...ocrResult, description: e.target.value })}
                placeholder="Store or merchant name"
              />
              
              <Input
                label="Amount"
                type="number"
                step="0.01"
                value={ocrResult.amount}
                onChange={(e) => setOcrResult({ ...ocrResult, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                type="date"
                value={ocrResult.date}
                onChange={(e) => setOcrResult({ ...ocrResult, date: e.target.value })}
              />
            </div>

            {/* Extracted Text Preview */}
            {extractedText && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Extracted Text (for reference)
                </label>
                <div className="p-3 bg-gray-50 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 max-h-32 overflow-y-auto">
                  {extractedText}
                </div>
              </div>
            )}
            
            <div className="flex space-x-3 pt-4">
              <Button onClick={handleConfirm} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
              <Button variant="outline" onClick={resetModal}>
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </ResponsiveModal>
  );
};

// Filter dropdown component
const FilterDropdown = ({ filterType, filterCategory, onTypeChange, onCategoryChange }) => {
  return (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
      <ResponsiveDropdown
        trigger={
          <button className="flex items-center justify-between px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 min-w-[120px]">
            <span className="text-sm text-gray-900 dark:text-white">{filterType === 'all' ? 'All Types' : filterType === 'income' ? 'Income' : 'Expenses'}</span>
            <ChevronDown className="w-4 h-4 ml-2 text-gray-600 dark:text-gray-300" />
          </button>
        }
        align="left"
      >
        <button
          onClick={() => onTypeChange('all')}
          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
        >
          All Types
        </button>
        <button
          onClick={() => onTypeChange('income')}
          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
        >
          Income
        </button>
        <button
          onClick={() => onTypeChange('expense')}
          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
        >
          Expenses
        </button>
      </ResponsiveDropdown>

      <ResponsiveDropdown
        trigger={
          <button className="flex items-center justify-between px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 min-w-[140px]">
            <span className="text-sm truncate text-gray-900 dark:text-white">
              {filterCategory === 'all' ? 'All Categories' : filterCategory}
            </span>
            <ChevronDown className="w-4 h-4 ml-2 text-gray-600 dark:text-gray-300" />
          </button>
        }
        align="left"
      >
        <button
          onClick={() => onCategoryChange('all')}
          className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
        >
          All Categories
        </button>
        {['Food', 'Transport', 'Entertainment', 'Shopping', 'Bills', 'Healthcare', 'Education', 'Other'].map(category => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your financial transactions</p>
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
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Total Income</h3>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">${totalIncome.toLocaleString()}</p>
        </Card>
        
        <Card className="p-4 text-center">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">${totalExpenses.toLocaleString()}</p>
        </Card>
        
        <Card className="p-4 text-center">
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Net Amount</h3>
          <p className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            ${(totalIncome - totalExpenses).toLocaleString()}
          </p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                name="search"
                placeholder="Search transactions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
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
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {filteredTransactions.map((transaction) => (
            <div 
              key={transaction.id} 
              className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${
                  transaction.type === 'income' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'
                }`}>
                  {transaction.type === 'income' ? (
                    <Plus className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <X className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                </div>
                
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 dark:text-white truncate">{transaction.description}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                    <span>{new Date(transaction.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{transaction.category}</span>
                    <span>•</span>
                    <span className="capitalize">{transaction.type}</span>
                    {transaction.receipt_url && (
                      <>
                        <span>•</span>
                        <button
                          onClick={() => window.open(transaction.receipt_url, '_blank')}
                          className="text-blue-600 dark:text-blue-400 hover:underline flex items-center"
                        >
                          <FileImage className="w-3 h-3 mr-1" />
                          Receipt
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 flex-shrink-0">
                <p className={`font-semibold ${
                  transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                </p>
                
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleEditTransaction(transaction)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    aria-label="Edit transaction"
                  >
                    <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => handleDeleteTransaction(transaction.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    aria-label="Delete transaction"
                  >
                    <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
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
import React, { useState, useMemo } from 'react';
import { Download, Calendar, FileText, TrendingUp, PieChart, BarChart3, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions, useGoals, useBudgetCategories } from '../hooks/useSupabaseData';
import { useReports } from '../hooks/useReports';
import { useNotifications } from '../contexts/NotificationContext';
import { calculateBudgetUsage } from '../utils/calculations';
import { generatePDF, downloadPDF } from '../utils/pdfGenerator';
import Card from '../components/Card';
import Button from '../components/Button';

// Report generation modal with real data
const ReportModal = ({ isOpen, onClose, template, onGenerate }) => {
  const [dateRange, setDateRange] = useState('current-month');
  const [format, setFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    try {
      await onGenerate({
        template,
        dateRange,
        format,
        includeCharts
      });
      onClose();
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <Card className="w-full max-w-md m-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Generate Report</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{template?.title}</p>
        
        <div className="space-y-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="current-month">Current Month</option>
              <option value="last-month">Last Month</option>
              <option value="last-3-months">Last 3 Months</option>
              <option value="last-6-months">Last 6 Months</option>
              <option value="year-to-date">Year to Date</option>
              <option value="last-year">Last Year</option>
            </select>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Export Format</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="pdf"
                  checked={format === 'pdf'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="mr-2"
                />
                <span className="text-gray-900 dark:text-white">PDF</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="mr-2"
                />
                <span className="text-gray-900 dark:text-white">CSV</span>
              </label>
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeCharts}
                onChange={(e) => setIncludeCharts(e.target.checked)}
                className="mr-2"
              />
              <span className="text-gray-900 dark:text-white">Include charts and visualizations</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button 
              onClick={handleGenerate}
              loading={isGenerating}
              className="flex-1"
            >
              {isGenerating ? 'Generating...' : 'Generate Report'}
            </Button>
            <Button 
              variant="secondary" 
              onClick={onClose}
              disabled={isGenerating}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Main reports page component with real data
const Reports = () => {
  const { userProfile } = useAuth();
  const { transactions } = useTransactions();
  const { goals } = useGoals();
  const { budgets } = useBudgetCategories();
  const { reports, loading: reportsLoading, addReport, deleteReport } = useReports();
  const { addNotification } = useNotifications();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Calculate real statistics
  const stats = useMemo(() => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const budgetUsage = calculateBudgetUsage(transactions, budgets);
    
    return {
      reportsGenerated: reports.length,
      dataPoints: transactions.length + goals.length + Object.keys(budgets).length,
      totalIncome,
      totalExpenses,
      budgetCategories: Object.keys(budgets).length
    };
  }, [transactions, goals, budgets, reports]);

  // Report templates with real data previews
  const reportTemplates = [
    {
      id: 'monthly-summary',
      title: 'Monthly Financial Summary',
      description: 'Complete overview of income, expenses, and savings for the month',
      icon: FileText,
      format: 'PDF',
      preview: `Income: $${stats.totalIncome.toLocaleString()} | Expenses: $${stats.totalExpenses.toLocaleString()} | Net: $${(stats.totalIncome - stats.totalExpenses).toLocaleString()}`
    },
    {
      id: 'spending-analysis',
      title: 'Spending Category Analysis',
      description: 'Detailed breakdown of spending across all categories',
      icon: PieChart,
      format: 'PDF/CSV',
      preview: `${stats.budgetCategories} categories tracked | ${transactions.filter(t => t.type === 'expense').length} expense transactions`
    },
    {
      id: 'net-worth',
      title: 'Net Worth Report',
      description: 'Track your net worth changes over time',
      icon: TrendingUp,
      format: 'PDF',
      preview: `Current: $${(stats.totalIncome - stats.totalExpenses).toLocaleString()} | Based on ${transactions.length} transactions`
    },
    {
      id: 'budget-performance',
      title: 'Budget vs Actual',
      description: 'Compare your budgeted amounts with actual spending',
      icon: BarChart3,
      format: 'PDF/CSV',
      preview: `${stats.budgetCategories} budget categories | Monthly budget: $${userProfile?.monthly_budget?.toLocaleString() || '0'}`
    },
    {
      id: 'goals-progress',
      title: 'Financial Goals Progress',
      description: 'Status update on all your financial goals',
      icon: Calendar,
      format: 'PDF',
      preview: `${goals.length} active goals | Total target: $${goals.reduce((sum, g) => sum + g.target_amount, 0).toLocaleString()}`
    },
    {
      id: 'tax-summary',
      title: 'Tax Preparation Summary',
      description: 'Income and deduction summary for tax filing',
      icon: FileText,
      format: 'PDF/CSV',
      preview: `Total income: $${stats.totalIncome.toLocaleString()} | Total expenses: $${stats.totalExpenses.toLocaleString()}`
    }
  ];

  const generateRealReport = async (reportConfig) => {
    const { template, dateRange, format, includeCharts } = reportConfig;
    
    try {
      // Filter transactions based on date range
      const getDateRange = () => {
        const now = new Date();
        switch (dateRange) {
          case 'current-month':
            return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
          case 'last-month':
            return { 
              start: new Date(now.getFullYear(), now.getMonth() - 1, 1), 
              end: new Date(now.getFullYear(), now.getMonth(), 0) 
            };
          case 'last-3-months':
            return { start: new Date(now.getFullYear(), now.getMonth() - 3, 1), end: now };
          case 'last-6-months':
            return { start: new Date(now.getFullYear(), now.getMonth() - 6, 1), end: now };
          case 'year-to-date':
            return { start: new Date(now.getFullYear(), 0, 1), end: now };
          case 'last-year':
            return { 
              start: new Date(now.getFullYear() - 1, 0, 1), 
              end: new Date(now.getFullYear() - 1, 11, 31) 
            };
          default:
            return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
        }
      };

      const { start, end } = getDateRange();
      const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= start && transactionDate <= end;
      });

      // Prepare data for PDF generation
      const reportData = {
        transactions: filteredTransactions,
        income: filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        expenses: filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0),
        budgetUsage: calculateBudgetUsage(filteredTransactions, budgets),
        budgets,
        goals,
        categoryTotals: (() => {
          const totals = {};
          filteredTransactions.filter(t => t.type === 'expense').forEach(t => {
            totals[t.category] = (totals[t.category] || 0) + Math.abs(t.amount);
          });
          return totals;
        })(),
        netWorth: stats.totalIncome - stats.totalExpenses,
        totalIncome: stats.totalIncome,
        totalExpenses: stats.totalExpenses
      };

      if (format === 'pdf') {
        // Generate PDF
        const doc = generatePDF(reportData, reportConfig);
        const filename = `${template.id}-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf`;
        
        // Download the PDF
        downloadPDF(doc, filename);
        
        // Calculate file size (approximate)
        const pdfBlob = doc.output('blob');
        const fileSize = pdfBlob.size;
        
        // Store report in database
        await addReport({
          title: `${template.title} - ${dateRange}`,
          template_id: template.id,
          date_range: dateRange,
          format: format.toUpperCase(),
          file_size: fileSize
        });
        
      } else if (format === 'csv') {
        // Generate CSV
        let csvContent = '';
        
        switch (template.id) {
          case 'spending-analysis':
            csvContent = `Category,Amount\n${Object.entries(reportData.categoryTotals).map(([cat, amt]) => `${cat},${amt}`).join('\n')}`;
            break;
          case 'budget-performance':
            csvContent = `Category,Budgeted,Spent,Remaining\n${Object.entries(reportData.budgetUsage).map(([cat, usage]) => `${cat},${usage.budget},${usage.spent},${usage.remaining}`).join('\n')}`;
            break;
          default:
            csvContent = `Date,Type,Category,Amount,Description\n${filteredTransactions.map(t => `${t.date},${t.type},${t.category},${t.amount},"${t.description}"`).join('\n')}`;
        }
        
        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template.id}-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        
        // Store report in database
        await addReport({
          title: `${template.title} - ${dateRange}`,
          template_id: template.id,
          date_range: dateRange,
          format: format.toUpperCase(),
          file_size: blob.size
        });
      }

      addNotification({
        type: 'success',
        title: 'Report Generated',
        message: `${template.title} has been generated and downloaded successfully.`
      });
      
    } catch (error) {
      console.error('Error generating report:', error);
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: 'Failed to generate report. Please try again.'
      });
    }
  };

  const handleGenerateReport = (template) => {
    setSelectedTemplate(template);
    setShowModal(true);
  };

  const handleDeleteReport = async (reportId) => {
    if (confirm('Are you sure you want to delete this report?')) {
      await deleteReport(reportId);
    }
  };

  const handleQuickExport = async (exportType) => {
    let data = '';
    let filename = '';
    
    switch (exportType) {
      case 'transactions':
        data = `Date,Type,Category,Amount,Description\n${transactions.map(t => 
          `${t.date},${t.type},${t.category},${t.amount},"${t.description}"`
        ).join('\n')}`;
        filename = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
        break;
        
      case 'budget':
        data = `Category,Allocated Amount\n${Object.entries(budgets).map(([category, amount]) => 
          `${category},${amount}`
        ).join('\n')}`;
        filename = `budget-data-${new Date().toISOString().split('T')[0]}.csv`;
        break;
        
      case 'goals':
        data = `Title,Target Amount,Current Amount,Deadline,Category\n${goals.map(g => 
          `"${g.title}",${g.target_amount},${g.current_amount},${g.deadline},${g.category}`
        ).join('\n')}`;
        filename = `goals-progress-${new Date().toISOString().split('T')[0]}.csv`;
        break;
    }

    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    addNotification({
      type: 'success',
      title: 'Data Exported',
      message: `${exportType.charAt(0).toUpperCase() + exportType.slice(1)} data has been exported successfully.`
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Exports</h1>
        <p className="text-gray-600 dark:text-gray-300">Generate comprehensive financial reports and export your data</p>
      </div>

      {/* Quick stats with real data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.reportsGenerated}</p>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Reports Generated</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total count</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.dataPoints}</p>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Data Points</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Across all accounts</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">2</p>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Export Formats</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PDF, CSV</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{transactions.length}</p>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Transactions</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">All time</p>
        </Card>
      </div>

      {/* Report templates */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Available Reports</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <div 
                  key={template.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all"
                >
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{template.title}</h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{template.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <strong>Preview:</strong> <span className="text-gray-900 dark:text-white">{template.preview}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Format: <span className="text-gray-900 dark:text-white">{template.format}</span></span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleGenerateReport(template)}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Generate
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Recent reports */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Reports</h3>
          
          {reportsLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading reports...</p>
            </div>
          ) : reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{report.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Generated {new Date(report.created_at).toLocaleDateString()} • {Math.round(report.file_size / 1024)} KB
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                      {report.format}
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteReport(report.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p>No reports generated yet</p>
              <p className="text-sm">Generate your first report to see it here</p>
            </div>
          )}
        </div>
      </Card>

      {/* Export options */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Quick Export Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="flex items-center justify-center p-4"
              onClick={() => handleQuickExport('transactions')}
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="text-gray-900 dark:text-white">Export All Transactions ({transactions.length})</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-center p-4"
              onClick={() => handleQuickExport('budget')}
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="text-gray-900 dark:text-white">Export Budget Data ({Object.keys(budgets).length} categories)</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center justify-center p-4"
              onClick={() => handleQuickExport('goals')}
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="text-gray-900 dark:text-white">Export Goals Progress ({goals.length} goals)</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Report generation modal */}
      <ReportModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        template={selectedTemplate}
        onGenerate={generateRealReport}
      />
    </div>
  );
};

export default Reports;
import React, { useState } from 'react';
import { Download, Calendar, FileText, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

// Report templates
const reportTemplates = [
  {
    id: 'monthly-summary',
    title: 'Monthly Financial Summary',
    description: 'Complete overview of income, expenses, and savings for the month',
    icon: FileText,
    format: 'PDF',
    preview: 'Income: $5,200 | Expenses: $3,850 | Savings: $1,350'
  },
  {
    id: 'spending-analysis',
    title: 'Spending Category Analysis',
    description: 'Detailed breakdown of spending across all categories',
    icon: PieChart,
    format: 'PDF/CSV',
    preview: 'Food: 28% | Transport: 19% | Shopping: 21% | Bills: 26%'
  },
  {
    id: 'net-worth',
    title: 'Net Worth Report',
    description: 'Track your net worth changes over time',
    icon: TrendingUp,
    format: 'PDF',
    preview: 'Current: $47,230 | YTD Change: +$8,420 (+21.7%)'
  },
  {
    id: 'budget-performance',
    title: 'Budget vs Actual',
    description: 'Compare your budgeted amounts with actual spending',
    icon: BarChart3,
    format: 'PDF/CSV',
    preview: 'Budget adherence: 87% | Over budget: 2 categories'
  },
  {
    id: 'goals-progress',
    title: 'Financial Goals Progress',
    description: 'Status update on all your financial goals',
    icon: Calendar,
    format: 'PDF',
    preview: '4 active goals | 2 on track | 1 ahead of schedule'
  },
  {
    id: 'tax-summary',
    title: 'Tax Preparation Summary',
    description: 'Income and deduction summary for tax filing',
    icon: FileText,
    format: 'PDF/CSV',
    preview: 'Total income: $62,400 | Deductions: $8,200'
  }
];

// Mock data for quick stats
const quickStats = [
  { label: 'Reports Generated', value: '23', change: '+5 this month' },
  { label: 'Data Points', value: '1,247', change: 'Across all accounts' },
  { label: 'Export Formats', value: '3', change: 'PDF, CSV, Excel' },
  { label: 'Time Saved', value: '8.5 hrs', change: 'This month' }
];

// Report generation modal
const ReportModal = ({ isOpen, onClose, template }) => {
  const [dateRange, setDateRange] = useState('current-month');
  const [format, setFormat] = useState('pdf');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create mock download
    const mockData = `Financial Report - ${template?.title}\nGenerated: ${new Date().toLocaleDateString()}\n\nThis is a sample report that would contain your actual financial data.`;
    const blob = new Blob([mockData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${template?.id}-${dateRange}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    
    setIsGenerating(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <Card className="w-full max-w-md m-4">
        <h3 className="text-lg font-semibold mb-4">Generate Report</h3>
        <p className="text-gray-600 mb-4">{template?.title}</p>
        
        <div className="space-y-4">
          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="current-month">Current Month</option>
              <option value="last-month">Last Month</option>
              <option value="last-3-months">Last 3 Months</option>
              <option value="last-6-months">Last 6 Months</option>
              <option value="year-to-date">Year to Date</option>
              <option value="last-year">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Export Format</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="pdf"
                  checked={format === 'pdf'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="mr-2"
                />
                PDF
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="mr-2"
                />
                CSV
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="excel"
                  checked={format === 'excel'}
                  onChange={(e) => setFormat(e.target.value)}
                  className="mr-2"
                />
                Excel
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
              Include charts and visualizations
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

// Main reports page component
const Reports = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleGenerateReport = (template) => {
    setSelectedTemplate(template);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Exports</h1>
        <p className="text-gray-600">Generate comprehensive financial reports and export your data</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
          </Card>
        ))}
      </div>

      {/* Report templates */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6">Available Reports</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportTemplates.map((template) => {
              const Icon = template.icon;
              return (
                <div 
                  key={template.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleGenerateReport(template)}
                >
                  <div className="flex items-start space-x-3 mb-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900">{template.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    <strong>Preview:</strong> {template.preview}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Format: {template.format}</span>
                    <Button size="sm" variant="outline">
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
          <h3 className="text-lg font-semibold mb-4">Recent Reports</h3>
          
          <div className="space-y-3">
            {[
              { name: 'Monthly Summary - December 2023', date: '2024-01-05', size: '247 KB', format: 'PDF' },
              { name: 'Spending Analysis Q4 2023', date: '2024-01-03', size: '156 KB', format: 'CSV' },
              { name: 'Net Worth Report - 2023', date: '2024-01-01', size: '189 KB', format: 'PDF' },
              { name: 'Budget Performance - November', date: '2023-12-01', size: '134 KB', format: 'Excel' }
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{report.name}</p>
                    <p className="text-xs text-gray-500">Generated {report.date} • {report.size}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                    {report.format}
                  </span>
                  <Button size="sm" variant="outline">
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Export options */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Export Options</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="flex items-center justify-center p-4">
              <Download className="w-4 h-4 mr-2" />
              Export All Transactions
            </Button>
            
            <Button variant="outline" className="flex items-center justify-center p-4">
              <Download className="w-4 h-4 mr-2" />
              Export Budget Data
            </Button>
            
            <Button variant="outline" className="flex items-center justify-center p-4">
              <Download className="w-4 h-4 mr-2" />
              Export Goals Progress
            </Button>
          </div>
        </div>
      </Card>

      {/* Report generation modal */}
      <ReportModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        template={selectedTemplate}
      />
    </div>
  );
};

export default Reports;
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  TrendingUp, 
  AlertCircle, 
  Brain, 
  Loader, 
  Zap,
  Plus,
  MessageSquare,
  Trash2,
  Edit3,
  MoreVertical,
  RefreshCw,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions, useGoals, useBudgetCategories } from '../hooks/useSupabaseData';
import { useNotifications } from '../contexts/NotificationContext';
import { useChatSessions } from '../hooks/useChatSessions';
import Card from '../components/Card';
import Button from '../components/Button';
import ResponsiveDropdown from '../components/ResponsiveDropdown';
import ResponsiveModal from '../components/ResponsiveModal';

// Finance-focused suggested questions
const suggestedQuestions = [
  'How can I reduce my monthly expenses based on my spending?',
  'What\'s the best emergency fund strategy for my income?',
  'Should I invest or pay off debt first with my current situation?',
  'How can I improve my savings rate?',
  'What investment options are best for my risk profile?',
  'How much should I allocate to each budget category?',
  'What are some passive income strategies I can start?',
  'How can I optimize my budget for better financial health?'
];

// Dynamic insights based on user data
const generateQuickInsights = (userProfile, transactions, budgets) => {
  const insights = [];
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

  if (savingsRate < 20) {
    insights.push({
      icon: AlertCircle,
      title: 'Savings Rate Alert',
      description: `Your savings rate is ${savingsRate.toFixed(1)}%. Aim for 20%+`,
      color: 'red'
    });
  } else {
    insights.push({
      icon: TrendingUp,
      title: 'Great Savings Rate',
      description: `Excellent ${savingsRate.toFixed(1)}% savings rate!`,
      color: 'green'
    });
  }

  if (Object.keys(budgets).length === 0) {
    insights.push({
      icon: Lightbulb,
      title: 'Budget Setup',
      description: 'Set up budget categories to track spending better',
      color: 'orange'
    });
  }

  if (transactions.length > 10) {
    insights.push({
      icon: Brain,
      title: 'AI Analysis Ready',
      description: `${transactions.length} transactions available for AI insights`,
      color: 'blue'
    });
  }

  return insights;
};

// Chat Session Sidebar Component
const ChatSessionSidebar = ({ 
  sessions, 
  currentSession, 
  onLoadSession, 
  onNewSession, 
  onDeleteSession, 
  onRenameSession,
  isOpen,
  onClose 
}) => {
  const [editingSession, setEditingSession] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  const handleRename = (session) => {
    setEditingSession(session.id);
    setNewTitle(session.title);
  };

  const handleSaveRename = async () => {
    if (editingSession && newTitle.trim()) {
      await onRenameSession(editingSession, newTitle.trim());
      setEditingSession(null);
      setNewTitle('');
    }
  };

  const handleCancelRename = () => {
    setEditingSession(null);
    setNewTitle('');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Chat History</h3>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onNewSession}
              className="flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              New
            </Button>
            <button 
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
        
        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto p-2">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm">No chat sessions yet</p>
              <p className="text-xs">Start a conversation to create your first chat</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`group relative p-3 rounded-lg cursor-pointer transition-colors ${
                    currentSession?.id === session.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => onLoadSession(session.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {editingSession === session.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleSaveRename();
                              if (e.key === 'Escape') handleCancelRename();
                            }}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            autoFocus
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveRename();
                            }}
                            className="text-green-600 hover:text-green-700"
                          >
                            ✓
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelRename();
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {session.title}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(session.updated_at).toLocaleDateString()}
                          </p>
                        </>
                      )}
                    </div>
                    
                    {editingSession !== session.id && (
                      <ResponsiveDropdown
                        trigger={
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-opacity"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          </button>
                        }
                        align="right"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRename(session);
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Rename
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </button>
                      </ResponsiveDropdown>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Message component
const Message = ({ message }) => {
  const isAI = message.type === 'ai';
  
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex items-start space-x-3 max-w-[85%] sm:max-w-3xl ${isAI ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${
          isAI ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-100 dark:bg-gray-700'
        }`}>
          {isAI ? (
            <Brain className="w-4 h-4 text-white" />
          ) : (
            <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          )}
        </div>
        
        {/* Message content */}
        <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg ${
          isAI 
            ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm' 
            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
        }`}>
          <p className={`text-sm whitespace-pre-wrap break-words ${isAI ? 'text-gray-900 dark:text-white' : 'text-white'}`}>
            {message.content}
          </p>
          <p className={`text-xs mt-2 ${
            isAI ? 'text-gray-500 dark:text-gray-400' : 'text-blue-100'
          }`}>
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
};

// Enhanced typing indicator
const TypingIndicator = () => (
  <div className="flex justify-start mb-4">
    <div className="flex items-start space-x-3 max-w-3xl">
      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <Brain className="w-4 h-4 text-white" />
      </div>
      <div className="px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-300">AI is analyzing your finances...</span>
        </div>
      </div>
    </div>
  </div>
);

// Main AI Coach component
const AICoach = () => {
  const { userProfile } = useAuth();
  const { transactions } = useTransactions();
  const { goals } = useGoals();
  const { budgets } = useBudgetCategories();
  const { addNotification } = useNotifications();
  const {
    sessions,
    currentSession,
    messages,
    loading: chatLoading,
    loadSession,
    createNewSession,
    addMessage,
    deleteSession,
    updateSessionTitle,
    clearCurrentSession
  } = useChatSessions();

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const [aiStatus, setAiStatus] = useState('connected');
  const messagesEndRef = useRef(null);

  // Generate dynamic insights
  const quickInsights = generateQuickInsights(userProfile, transactions, budgets);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Generate comprehensive user context for AI
  const generateUserContext = () => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    // Calculate category spending
    const categorySpending = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categorySpending[t.category] = (categorySpending[t.category] || 0) + Math.abs(t.amount);
    });

    // Calculate goal progress
    const goalProgress = goals.map(goal => ({
      title: goal.title,
      progress: goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0,
      remaining: goal.target_amount - goal.current_amount
    }));

    return {
      monthlyIncome: userProfile?.monthly_income || 0,
      monthlyBudget: userProfile?.monthly_budget || 0,
      totalIncome,
      totalExpenses,
      netWorth: totalIncome - totalExpenses,
      savingsRate: savingsRate.toFixed(1),
      transactionCount: transactions.length,
      goalCount: goals.length,
      budgetCategories: Object.keys(budgets).length,
      setupCompleted: userProfile?.setup_completed || false,
      categorySpending,
      goalProgress,
      budgetAllocations: budgets
    };
  };

  // Enhanced Gemini API call with your API key
  const callGeminiAPI = async (userMessage, context) => {
    try {
      const API_KEY = 'AIzaSyB5Wa1QnphzMSTdxyHn7b67XcsWqFJTd-s';
      
      setAiStatus('thinking');

      const prompt = `You are an expert financial advisor AI with deep knowledge of personal finance, investing, budgeting, and wealth building. You're helping a user with their specific financial situation.

USER'S FINANCIAL PROFILE:
• Monthly Income: $${context.monthlyIncome.toLocaleString()}
• Monthly Budget: $${context.monthlyBudget.toLocaleString()}
• Total Income (all time): $${context.totalIncome.toLocaleString()}
• Total Expenses (all time): $${context.totalExpenses.toLocaleString()}
• Net Worth: $${context.netWorth.toLocaleString()}
• Savings Rate: ${context.savingsRate}%
• Transaction History: ${context.transactionCount} transactions
• Financial Goals: ${context.goalCount} active goals
• Budget Categories: ${context.budgetCategories} categories set up

SPENDING BREAKDOWN:
${Object.entries(context.categorySpending).map(([cat, amount]) => `• ${cat}: $${amount.toLocaleString()}`).join('\n')}

FINANCIAL GOALS:
${context.goalProgress.map(goal => `• ${goal.title}: ${goal.progress.toFixed(1)}% complete ($${goal.remaining.toLocaleString()} remaining)`).join('\n')}

USER QUESTION: "${userMessage}"

Please provide specific, actionable financial advice based on their actual data. Include:
1. Direct analysis of their financial situation
2. Specific recommendations with dollar amounts when relevant
3. Actionable steps they can take immediately
4. How this relates to their goals and budget

Keep your response conversational, encouraging, and under 300 words. Use their actual numbers to make it personal and relevant.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH", 
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        setAiStatus('connected');
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      setAiStatus('error');
      
      // Enhanced fallback response
      return generateEnhancedFallbackResponse(userMessage, context);
    }
  };

  // Enhanced fallback response generator
  const generateEnhancedFallbackResponse = (userMessage, context) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('expense') || lowerMessage.includes('reduce') || lowerMessage.includes('save money')) {
      return `Based on your spending of $${context.totalExpenses.toLocaleString()}, here are targeted ways to reduce expenses:\n\n**Top Opportunities:**\n• Your largest expense categories need attention\n• With ${context.savingsRate}% savings rate, aim for 20%+\n• Review subscriptions and recurring charges\n• Consider meal planning to reduce food costs\n\n**Action Steps:**\n1. Track expenses for one week\n2. Cancel unused subscriptions\n3. Set spending limits for top categories\n4. Automate savings to reach 20% rate`;
    } else if (lowerMessage.includes('emergency') || lowerMessage.includes('fund')) {
      const targetFund = context.totalExpenses * 6;
      return `Emergency Fund Strategy for your situation:\n\n**Target:** $${targetFund.toLocaleString()} (6 months expenses)\n**Current Net Worth:** $${context.netWorth.toLocaleString()}\n\n**Build Strategy:**\n1. Start with $1,000 mini-emergency fund\n2. Save $${Math.round(targetFund / 12).toLocaleString()}/month for 1 year\n3. Keep in high-yield savings account\n4. Automate transfers on payday\n\nWith your ${context.savingsRate}% savings rate, ${context.savingsRate > 15 ? 'you can build this steadily' : 'focus on increasing savings first'}.`;
    } else if (lowerMessage.includes('invest') || lowerMessage.includes('investment')) {
      return `Investment Strategy for your profile:\n\n**Your Situation:**\n• Net Worth: $${context.netWorth.toLocaleString()}\n• Savings Rate: ${context.savingsRate}%\n• ${context.goalCount} financial goals\n\n**Recommendations:**\n1. ${context.savingsRate > 15 ? 'Start with index funds (low fees)' : 'Increase savings rate to 15% first'}\n2. Max out employer 401(k) match\n3. Consider Roth IRA for tax-free growth\n4. Target-date funds for simplicity\n\n**Next Steps:** ${context.savingsRate > 20 ? 'You\'re ready to invest!' : 'Build emergency fund first'}`;
    } else {
      return `Financial Analysis for "${userMessage}":\n\n**Your Current Position:**\n• Monthly Income: $${context.monthlyIncome.toLocaleString()}\n• Savings Rate: ${context.savingsRate}%\n• Net Worth: $${context.netWorth.toLocaleString()}\n• Active Goals: ${context.goalCount}\n\n**Key Recommendations:**\n${context.savingsRate < 20 ? '• Increase savings rate to 20%' : '• Maintain excellent savings habits'}\n${context.goalCount === 0 ? '• Set specific financial goals' : '• Stay focused on your goals'}\n${context.budgetCategories === 0 ? '• Create budget categories' : '• Review budget performance'}\n\nAsk me specific questions about any area for detailed guidance!`;
    }
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessageContent = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Add user message to chat
      await addMessage(userMessageContent, 'user');
      
      // Generate AI response
      const context = generateUserContext();
      const aiResponse = await callGeminiAPI(userMessageContent, context);
      
      // Add AI response to chat
      await addMessage(aiResponse, 'ai', {
        model: 'gemini-pro',
        context_used: true,
        response_time: Date.now()
      });
      
      addNotification({
        type: 'success',
        title: 'AI Financial Advice',
        message: 'Your question has been answered and saved to chat history'
      });
      
    } catch (error) {
      console.error('Error in chat conversation:', error);
      
      // Add error message to chat
      await addMessage(
        'I apologize, but I\'m having trouble connecting to my AI services right now. Please try again in a moment, or feel free to ask your question differently.',
        'ai',
        { error: true, timestamp: Date.now() }
      );
      
      addNotification({
        type: 'error',
        title: 'AI Service Unavailable',
        message: 'Unable to get AI response. Please try again.'
      });
    } finally {
      setIsTyping(false);
    }
  };

  // Handle suggested question click
  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
    setShowSidebar(false);
  };

  // Handle new chat session
  const handleNewSession = async () => {
    try {
      await createNewSession();
      setShowChatSidebar(false);
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  // Handle delete session with confirmation
  const handleDeleteSession = async (sessionId) => {
    if (confirm('Are you sure you want to delete this chat session? This action cannot be undone.')) {
      try {
        await deleteSession(sessionId);
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  if (chatLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading your chat sessions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Chat Sessions Sidebar */}
      <ChatSessionSidebar
        sessions={sessions}
        currentSession={currentSession}
        onLoadSession={loadSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={updateSessionTitle}
        isOpen={showChatSidebar}
        onClose={() => setShowChatSidebar(false)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChatSidebar(true)}
                className="lg:hidden"
              >
                <MessageSquare className="w-4 h-4" />
              </Button>
              
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  {currentSession?.title || 'AI Financial Coach'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Powered by Google Gemini AI • {sessions.length} chat{sessions.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* AI Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  aiStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                  aiStatus === 'thinking' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`}></div>
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  {aiStatus === 'connected' ? 'AI Ready' :
                   aiStatus === 'thinking' ? 'Thinking' :
                   'Offline'}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSidebar(!showSidebar)}
                className="hidden lg:flex items-center"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                Insights
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex min-h-0">
          {/* Chat Messages */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Welcome to your AI Financial Coach!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                    I'm powered by Google Gemini AI and can provide personalized financial advice based on your actual financial data. Ask me anything about budgeting, investing, saving, or debt management!
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
                    {suggestedQuestions.slice(0, 4).map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedQuestion(question)}
                        className="text-left p-3 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <Message key={message.id} message={message} />
                  ))}
                  {isTyping && <TypingIndicator />}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Ask me anything about your finances..."
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  disabled={isTyping}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6"
                >
                  {isTyping ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                🤖 Powered by Google Gemini AI • Your conversations are automatically saved
              </p>
            </div>
          </div>

          {/* Insights Sidebar */}
          {showSidebar && (
            <div className="w-80 border-l border-gray-200 dark:border-gray-700 p-4 space-y-4 overflow-y-auto">
              {/* Quick Insights */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Financial Insights</h3>
                <div className="space-y-3">
                  {quickInsights.map((insight, index) => {
                    const Icon = insight.icon;
                    return (
                      <div key={index} className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          insight.color === 'green' ? 'bg-green-100 dark:bg-green-900/50' :
                          insight.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/50' : 
                          insight.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/50' :
                          'bg-red-100 dark:bg-red-900/50'
                        }`}>
                          <Icon className={`w-4 h-4 ${
                            insight.color === 'green' ? 'text-green-600 dark:text-green-400' :
                            insight.color === 'orange' ? 'text-orange-600 dark:text-orange-400' : 
                            insight.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                            'text-red-600 dark:text-red-400'
                          }`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">{insight.title}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-300 break-words">{insight.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Suggested Questions */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Ask the AI</h3>
                <div className="space-y-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="w-full text-left text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded transition-colors break-words"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AICoach;
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
  X,
  History,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions, useGoals, useBudgetCategories } from '../hooks/useSupabaseData';
import { useNotifications } from '../contexts/NotificationContext';
import { useChatSessions } from '../hooks/useChatSessions';
import AIService from '../utils/aiService';
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

  if (savingsRate > 20) {
    insights.push({
      icon: TrendingUp,
      title: 'Great Savings Rate',
      description: `Excellent ${savingsRate.toFixed(1)}% savings rate!`,
      color: 'green'
    });
  } else if (savingsRate < 10 && totalIncome > 0) {
    insights.push({
      icon: AlertCircle,
      title: 'Savings Rate Alert',
      description: `Your savings rate is ${savingsRate.toFixed(1)}%. Aim for 20%+`,
      color: 'red'
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

// Chat History Modal Component
const ChatHistoryModal = ({ 
  isOpen, 
  onClose, 
  sessions, 
  currentSession, 
  onLoadSession, 
  onNewSession, 
  onDeleteSession, 
  onRenameSession 
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

  const handleDeleteWithConfirm = async (sessionId) => {
    if (confirm('Are you sure you want to delete this chat session? This action cannot be undone.')) {
      await onDeleteSession(sessionId);
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Chat History"
      size="lg"
    >
      <div className="space-y-4">
        {/* New Chat Button */}
        <Button
          onClick={() => {
            onNewSession();
            onClose();
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Start New Chat
        </Button>

        {/* Sessions List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm">No chat sessions yet</p>
              <p className="text-xs">Start a conversation to create your first chat</p>
            </div>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  currentSession?.id === session.id
                    ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700 shadow-md'
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }`}
                onClick={() => {
                  onLoadSession(session.id);
                  onClose();
                }}
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
                          onClick={(e) => e.stopPropagation()}
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveRename();
                          }}
                          className="text-green-600 hover:text-green-700 p-1"
                        >
                          ✓
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancelRename();
                          }}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2">
                          <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {session.title}
                          </h4>
                          {currentSession?.id === session.id && (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(session.updated_at).toLocaleDateString()} • {new Date(session.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </>
                    )}
                  </div>
                  
                  {editingSession !== session.id && (
                    <ResponsiveDropdown
                      trigger={
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-all"
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
                          handleDeleteWithConfirm(session.id);
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
            ))
          )}
        </div>
      </div>
    </ResponsiveModal>
  );
};

// Enhanced Message component with better styling
const Message = ({ message }) => {
  const isAI = message.type === 'ai';
  
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-6`}>
      <div className={`flex items-start space-x-3 max-w-[85%] sm:max-w-4xl ${isAI ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl shadow-lg ${
          isAI 
            ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
            : 'bg-gradient-to-br from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600'
        }`}>
          {isAI ? (
            <Sparkles className="w-5 h-5 text-white" />
          ) : (
            <User className="w-5 h-5 text-white" />
          )}
        </div>
        
        {/* Message content */}
        <div className={`px-4 py-3 rounded-2xl shadow-sm ${
          isAI 
            ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700' 
            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
        }`}>
          <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isAI ? 'text-gray-900 dark:text-white' : 'text-white'
          }`}>
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
  <div className="flex justify-start mb-6">
    <div className="flex items-start space-x-3 max-w-4xl">
      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <div className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-2xl">
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
  const [showHistoryModal, setShowHistoryModal] = useState(false);
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

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessageContent = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      // Add user message to chat
      await addMessage(userMessageContent, 'user');
      
      // Generate AI response using AIService
      const context = generateUserContext();
      setAiStatus('thinking');
      
      let aiResponse;
      try {
        // Try to get AI response from Gemini
        aiResponse = await AIService.getFinancialAdvice(userMessageContent, context, 'gemini');
        setAiStatus('connected');
      } catch (error) {
        console.error('AI Service Error:', error);
        setAiStatus('error');
        
        // Use fallback response if AI service fails
        aiResponse = AIService.generateFallbackResponse(userMessageContent, context);
      }
      
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
  };

  // Handle new chat session
  const handleNewSession = async () => {
    try {
      await createNewSession();
      setShowHistoryModal(false);
    } catch (error) {
      console.error('Error creating new session:', error);
    }
  };

  // Handle delete session with confirmation
  const handleDeleteSession = async (sessionId) => {
    try {
      await deleteSession(sessionId);
    } catch (error) {
      console.error('Error deleting session:', error);
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
    <div className="h-full flex flex-col bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-gray-900 dark:to-gray-800">
      {/* Enhanced Header */}
      <div className="flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {currentSession?.title || 'AI Financial Coach'}
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                <div className={`w-2 h-2 rounded-full ${
                  aiStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                  aiStatus === 'thinking' ? 'bg-yellow-500 animate-pulse' :
                  'bg-red-500'
                }`}></div>
                <span>
                  {aiStatus === 'connected' ? 'AI Ready' :
                   aiStatus === 'thinking' ? 'Thinking' :
                   'Offline'}
                </span>
                <span>•</span>
                <span>Powered by Google Gemini</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center"
            >
              <History className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Chat History</span>
              <span className="sm:hidden">History</span>
              {sessions.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs rounded-full">
                  {sessions.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Welcome to your AI Financial Coach!
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                I'm powered by Google Gemini AI and can provide personalized financial advice based on your actual financial data. Ask me anything about budgeting, investing, saving, or debt management!
              </p>
              
              {/* Quick Insights */}
              {quickInsights.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Insights</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    {quickInsights.map((insight, index) => {
                      const Icon = insight.icon;
                      return (
                        <div key={index} className={`p-4 rounded-xl border-l-4 ${
                          insight.color === 'green' ? 'bg-green-50 dark:bg-green-900/20 border-green-400' :
                          insight.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-400' : 
                          insight.color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-400' :
                          'bg-red-50 dark:bg-red-900/20 border-red-400'
                        }`}>
                          <div className="flex items-center space-x-3">
                            <Icon className={`w-5 h-5 ${
                              insight.color === 'green' ? 'text-green-600 dark:text-green-400' :
                              insight.color === 'orange' ? 'text-orange-600 dark:text-orange-400' : 
                              insight.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                              'text-red-600 dark:text-red-400'
                            }`} />
                            <div>
                              <h5 className="font-medium text-gray-900 dark:text-white text-sm">{insight.title}</h5>
                              <p className="text-xs text-gray-600 dark:text-gray-300">{insight.description}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Suggested Questions */}
              <div className="max-w-4xl mx-auto">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Popular Questions</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {suggestedQuestions.slice(0, 6).map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-left p-4 text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 transition-all duration-200 hover:shadow-md group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex-1">{question}</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </button>
                  ))}
                </div>
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

        {/* Enhanced Input area */}
        <div className="flex-shrink-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask me anything about your finances..."
                  className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none"
                  rows="1"
                  style={{ minHeight: '48px', maxHeight: '120px' }}
                  disabled={isTyping}
                />
                <div className="absolute right-3 bottom-3">
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl p-2 min-w-0"
                    size="sm"
                  >
                    {isTyping ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              🤖 Powered by Google Gemini AI • Your conversations are automatically saved
            </p>
          </div>
        </div>
      </div>

      {/* Chat History Modal */}
      <ChatHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        sessions={sessions}
        currentSession={currentSession}
        onLoadSession={loadSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        onRenameSession={updateSessionTitle}
      />
    </div>
  );
};

export default AICoach;
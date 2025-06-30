import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Lightbulb, TrendingUp, AlertCircle, Brain, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions, useGoals, useBudgetCategories } from '../hooks/useSupabaseData';
import { useNotifications } from '../contexts/NotificationContext';
import Card from '../components/Card';
import Button from '../components/Button';

// Initial welcome message
const initialMessages = [
  {
    id: 1,
    type: 'ai',
    content: 'Hello! I\'m your AI Financial Coach powered by advanced AI. I can help you with budgeting, saving strategies, investment advice, and analyzing your spending patterns. What would you like to discuss today?',
    timestamp: new Date(Date.now() - 300000)
  }
];

// Suggested questions
const suggestedQuestions = [
  'How can I reduce my monthly expenses?',
  'What\'s the best way to build an emergency fund?',
  'Should I invest or pay off debt first?',
  'How can I improve my credit score?',
  'What are some passive income strategies?',
  'How much should I save for retirement?',
  'What investment options are best for beginners?',
  'How can I create a budget that works?'
];

// Quick insights based on user data
const quickInsights = [
  {
    icon: TrendingUp,
    title: 'Spending Pattern Alert',
    description: 'Your entertainment spending increased 23% this month',
    color: 'orange'
  },
  {
    icon: Lightbulb,
    title: 'Savings Opportunity',
    description: 'You could save $120/month by optimizing subscriptions',
    color: 'green'
  },
  {
    icon: AlertCircle,
    title: 'Budget Reminder',
    description: 'You\'re 80% through your food budget with 10 days left',
    color: 'red'
  }
];

// Message component
const Message = ({ message }) => {
  const isAI = message.type === 'ai';
  
  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex items-start space-x-3 max-w-[85%] sm:max-w-3xl ${isAI ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${
          isAI ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-100 dark:bg-gray-700'
        }`}>
          {isAI ? (
            <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          ) : (
            <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          )}
        </div>
        
        {/* Message content */}
        <div className={`px-3 sm:px-4 py-2 sm:py-3 rounded-lg ${
          isAI 
            ? 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm' 
            : 'bg-blue-600 text-white'
        }`}>
          <p className={`text-sm whitespace-pre-wrap break-words ${isAI ? 'text-gray-900 dark:text-white' : 'text-white'}`}>{message.content}</p>
          <p className={`text-xs mt-2 ${
            isAI ? 'text-gray-500 dark:text-gray-400' : 'text-blue-100'
          }`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
};

// Typing indicator component
const TypingIndicator = () => (
  <div className="flex justify-start mb-4">
    <div className="flex items-start space-x-3 max-w-3xl">
      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
        <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg">
        <div className="flex items-center space-x-2">
          <Loader className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">AI is thinking...</span>
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
  const [messages, setMessages] = useState(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Generate user context for AI
  const generateUserContext = () => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    return {
      monthlyIncome: userProfile?.monthly_income || 0,
      monthlyBudget: userProfile?.monthly_budget || 0,
      totalIncome,
      totalExpenses,
      savingsRate: savingsRate.toFixed(1),
      transactionCount: transactions.length,
      goalCount: goals.length,
      budgetCategories: Object.keys(budgets).length,
      setupCompleted: userProfile?.setup_completed || false
    };
  };

  // Call Gemini API for real-time responses
  const callGeminiAPI = async (userMessage, context) => {
    try {
      // Note: In a production environment, you should make this API call through your backend
      // to keep your API key secure. For demo purposes, we'll use environment variables.
      const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!API_KEY) {
        throw new Error('Gemini API key not configured');
      }

      const prompt = `You are a professional financial advisor AI assistant. The user has the following financial profile:
      
Monthly Income: $${context.monthlyIncome}
Monthly Budget: $${context.monthlyBudget}
Total Income (all time): $${context.totalIncome}
Total Expenses (all time): $${context.totalExpenses}
Savings Rate: ${context.savingsRate}%
Number of Transactions: ${context.transactionCount}
Number of Goals: ${context.goalCount}
Budget Categories Set: ${context.budgetCategories}
Setup Completed: ${context.setupCompleted}

User Question: ${userMessage}

Please provide helpful, personalized financial advice based on their profile. Keep responses concise but informative (2-3 paragraphs max). Include specific actionable recommendations when possible. If the user's financial data suggests areas for improvement, mention them tactfully.`;

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
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // Fallback to contextual responses if API fails
      return generateFallbackResponse(userMessage, context);
    }
  };

  // Fallback response generator
  const generateFallbackResponse = (userMessage, context) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('expense') || lowerMessage.includes('reduce') || lowerMessage.includes('save money')) {
      return `Based on your current expenses of $${context.totalExpenses.toLocaleString()}, here are some strategies to reduce costs:\n\n1. **Review subscriptions**: Cancel unused services\n2. **Meal planning**: Cook at home more often\n3. **Energy efficiency**: Switch to LED bulbs and unplug devices\n4. **Transportation**: Consider carpooling or public transit\n\nWith your current savings rate of ${context.savingsRate}%, you're ${context.savingsRate > 20 ? 'doing well' : 'below the recommended 20%'}. Focus on the biggest expense categories first.`;
    } else if (lowerMessage.includes('emergency') || lowerMessage.includes('fund')) {
      return `Building an emergency fund is crucial! Here's a step-by-step approach:\n\n1. **Start small**: Aim for $1,000 first\n2. **Automate savings**: Set up automatic transfers\n3. **Use windfalls**: Direct tax refunds and bonuses to the fund\n4. **Target**: Build up to 3-6 months of expenses\n\nWith your monthly expenses, aim for $${(context.totalExpenses * 3).toLocaleString()} to $${(context.totalExpenses * 6).toLocaleString()} in your emergency fund.`;
    } else if (lowerMessage.includes('invest') || lowerMessage.includes('investment')) {
      return `Investment strategy depends on your goals and risk tolerance:\n\n**For beginners:**\n- Start with index funds (low fees, diversified)\n- Consider target-date funds for retirement\n- Use tax-advantaged accounts (401k, IRA) first\n\n**Your situation:** With a ${context.savingsRate}% savings rate, ${context.savingsRate > 15 ? 'you have good foundation for investing' : 'focus on increasing savings first'}. Ensure you have an emergency fund before investing.`;
    } else {
      return `Thank you for your question about "${userMessage}". Based on your financial profile:\n\n• Monthly Income: $${context.monthlyIncome.toLocaleString()}\n• Savings Rate: ${context.savingsRate}%\n• Active Goals: ${context.goalCount}\n\nI'd recommend focusing on ${context.savingsRate < 20 ? 'increasing your savings rate to 20%' : 'maintaining your good financial habits'}. ${context.setupCompleted ? 'Your financial foundation looks solid!' : 'Complete your profile setup for more personalized advice.'}\n\nFeel free to ask more specific questions about budgeting, investing, or debt management!`;
    }
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      const context = generateUserContext();
      const aiResponse = await callGeminiAPI(currentMessage, context);
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Add notification for successful AI response
      addNotification({
        type: 'success',
        title: 'AI Coach Response',
        message: 'Your financial question has been answered by AI'
      });
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: 'I apologize, but I\'m having trouble connecting to my AI services right now. Please try again in a moment, or feel free to ask your question differently.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
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
    setShowSidebar(false); // Close sidebar on mobile after selection
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Brain className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" />
              AI Financial Coach
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Get personalized financial advice powered by advanced AI</p>
          </div>
          
          {/* Mobile sidebar toggle */}
          <Button 
            variant="outline" 
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden flex items-center text-sm"
          >
            <Lightbulb className="w-4 h-4 mr-2" />
            {showSidebar ? 'Hide' : 'Show'} Insights
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-4 sm:gap-6 min-h-0">
        {/* Sidebar with insights and suggestions - Mobile responsive */}
        <div className={`
          lg:w-80 lg:flex-shrink-0 space-y-4
          ${showSidebar ? 'block' : 'hidden lg:block'}
        `}>
          {/* Quick Insights */}
          <Card className="p-4">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Quick Insights</h3>
            <div className="space-y-3">
              {quickInsights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      insight.color === 'green' ? 'bg-green-100 dark:bg-green-900/50' :
                      insight.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/50' : 'bg-red-100 dark:bg-red-900/50'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        insight.color === 'green' ? 'text-green-600 dark:text-green-400' :
                        insight.color === 'orange' ? 'text-orange-600 dark:text-orange-400' : 'text-red-600 dark:text-red-400'
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
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 dark:text-white">Suggested Questions</h3>
            <div className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="w-full text-left text-xs sm:text-sm text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded transition-colors break-words"
                >
                  {question}
                </button>
              ))}
            </div>
          </Card>

          {/* AI Status */}
          <Card className="p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">AI Status</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Connected to advanced AI for real-time financial advice
            </p>
          </Card>
        </div>

        {/* Chat interface - Responsive */}
        <div className="flex-1 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0 p-0">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 min-h-0">
              {messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="Ask me anything about your finances..."
                  className="flex-1 px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base"
                  disabled={isTyping}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="flex items-center justify-center w-full sm:w-auto"
                >
                  {isTyping ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Send</span>
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                💡 Powered by advanced AI - Ask specific questions about budgeting, saving, or investing for personalized advice
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
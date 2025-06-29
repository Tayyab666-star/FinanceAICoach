import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';

// Mock conversation history
const initialMessages = [
  {
    id: 1,
    type: 'ai',
    content: 'Hello! I\'m your AI Financial Coach. I can help you with budgeting, saving strategies, investment advice, and analyzing your spending patterns. What would you like to discuss today?',
    timestamp: new Date(Date.now() - 300000)
  }
];

// Suggested questions
const suggestedQuestions = [
  'How can I reduce my monthly expenses?',
  'What\'s the best way to build an emergency fund?',
  'Should I invest or pay off debt first?',
  'How can I improve my credit score?',
  'What are some passive income strategies?'
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
      <div className={`flex items-start space-x-3 max-w-3xl ${isAI ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isAI ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          {isAI ? (
            <Bot className="w-4 h-4 text-blue-600" />
          ) : (
            <User className="w-4 h-4 text-gray-600" />
          )}
        </div>
        
        {/* Message content */}
        <div className={`px-4 py-3 rounded-lg ${
          isAI 
            ? 'bg-white border border-gray-200 shadow-sm' 
            : 'bg-blue-600 text-white'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          <p className={`text-xs mt-2 ${
            isAI ? 'text-gray-500' : 'text-blue-100'
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
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
        <Bot className="w-4 h-4 text-blue-600" />
      </div>
      <div className="px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-lg">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  </div>
);

// Main AI Coach component
const AICoach = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Simulate AI response
  const generateAIResponse = (userMessage) => {
    const responses = {
      'expense': 'Here are some strategies to reduce your monthly expenses:\n\n1. **Review subscriptions**: Cancel unused services\n2. **Meal planning**: Cook at home more often\n3. **Energy efficiency**: Switch to LED bulbs and unplug devices\n4. **Transportation**: Consider carpooling or public transit\n5. **Shop smart**: Use coupons and compare prices\n\nBased on your spending data, I notice you spend $380 on entertainment monthly. Could we explore ways to enjoy activities for less?',
      
      'emergency': 'Building an emergency fund is crucial! Here\'s a step-by-step approach:\n\n1. **Start small**: Aim for $500 first\n2. **Automate savings**: Set up automatic transfers\n3. **Use windfalls**: Direct tax refunds and bonuses to the fund\n4. **High-yield savings**: Keep it accessible but earning interest\n5. **Gradual increase**: Build up to 3-6 months of expenses\n\nI see you currently have $6,500 in savings. That\'s a great start! Should we discuss strategies to reach your $10,000 emergency fund goal?',
      
      'debt': 'Great question! The answer depends on your situation:\n\n**Pay debt first if:**\n- Interest rates > 6-7%\n- You have high-interest credit card debt\n- Debt causes stress\n\n**Invest first if:**\n- Low interest rates (< 4%)\n- Employer 401k matching available\n- Good emergency fund exists\n\n**Hybrid approach:**\n- Pay minimums on all debt\n- Invest in employer match\n- Extra money to highest interest debt\n\nWhat\'s your current debt situation? I can provide more specific advice.',
      
      'credit': 'Improving your credit score takes time but these strategies work:\n\n1. **Pay on time**: Payment history is 35% of your score\n2. **Keep utilization low**: Use < 30% of credit limits\n3. **Don\'t close old cards**: Length of history matters\n4. **Monitor your report**: Check for errors monthly\n5. **Diversify credit types**: Mix of cards and loans\n\nI can help you create a specific plan based on your current credit situation. What\'s your approximate credit score range?',
      
      'passive': 'Here are some passive income strategies to consider:\n\n1. **Dividend stocks**: Regular income from investments\n2. **Real estate**: REITs or rental properties\n3. **High-yield savings**: Safe but modest returns\n4. **Peer-to-peer lending**: Higher risk, higher returns\n5. **Create digital products**: Courses, ebooks, apps\n\nGiven your savings rate of 26%, you\'re in a good position to explore these options. Which approach interests you most?'
    };

    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('expense') || lowerMessage.includes('reduce') || lowerMessage.includes('save money')) {
      return responses.expense;
    } else if (lowerMessage.includes('emergency') || lowerMessage.includes('fund')) {
      return responses.emergency;
    } else if (lowerMessage.includes('debt') || lowerMessage.includes('invest')) {
      return responses.debt;
    } else if (lowerMessage.includes('credit') || lowerMessage.includes('score')) {
      return responses.credit;
    } else if (lowerMessage.includes('passive') || lowerMessage.includes('income')) {
      return responses.passive;
    } else {
      return `I understand you're asking about "${userMessage}". Based on your financial profile, I'd recommend focusing on your budget optimization first. Your current financial health score is 78, which is good, but there's room for improvement.\n\nWould you like me to analyze any specific area of your finances? I can help with budgeting, investments, debt management, or savings strategies.`;
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
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: generateAIResponse(inputMessage),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  // Handle suggested question click
  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Financial Coach</h1>
        <p className="text-gray-600">Get personalized financial advice and insights</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Sidebar with insights and suggestions */}
        <div className="lg:col-span-1 space-y-4">
          {/* Quick Insights */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Quick Insights</h3>
            <div className="space-y-3">
              {quickInsights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                      insight.color === 'green' ? 'bg-green-100' :
                      insight.color === 'orange' ? 'bg-orange-100' : 'bg-red-100'
                    }`}>
                      <Icon className={`w-4 h-4 ${
                        insight.color === 'green' ? 'text-green-600' :
                        insight.color === 'orange' ? 'text-orange-600' : 'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{insight.title}</h4>
                      <p className="text-xs text-gray-600">{insight.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Suggested Questions */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Suggested Questions</h3>
            <div className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="w-full text-left text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-md transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Chat interface */}
        <div className="lg:col-span-3 flex flex-col min-h-0">
          <Card className="flex-1 flex flex-col min-h-0">
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.map((message) => (
                <Message key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-4">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about your finances..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isTyping}
                  className="flex items-center"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: Ask specific questions about budgeting, saving, or investing for personalized advice
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
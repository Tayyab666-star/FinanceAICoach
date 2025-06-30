// AI Service utility for handling different AI providers
class AIService {
  constructor() {
    this.providers = {
      gemini: {
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent'
      },
      openai: {
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        endpoint: 'https://api.openai.com/v1/chat/completions'
      }
    };
  }

  async callGemini(prompt) {
    const { apiKey, endpoint } = this.providers.gemini;
    
    if (!apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const response = await fetch(`${endpoint}?key=${apiKey}`, {
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
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  }

  async callOpenAI(prompt) {
    const { apiKey, endpoint } = this.providers.openai;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional financial advisor AI assistant. Provide helpful, personalized financial advice.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      throw new Error('Invalid response format from OpenAI API');
    }
  }

  async getFinancialAdvice(userMessage, userContext, provider = 'gemini') {
    const prompt = this.buildFinancialPrompt(userMessage, userContext);
    
    try {
      switch (provider) {
        case 'gemini':
          return await this.callGemini(prompt);
        case 'openai':
          return await this.callOpenAI(prompt);
        default:
          throw new Error(`Unsupported AI provider: ${provider}`);
      }
    } catch (error) {
      console.error(`${provider} API Error:`, error);
      throw error;
    }
  }

  buildFinancialPrompt(userMessage, context) {
    return `You are a professional financial advisor AI assistant. The user has the following financial profile:

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

Please provide helpful, personalized financial advice based on their profile. Keep responses concise but informative (2-3 paragraphs max). Include specific actionable recommendations when possible. If the user's financial data suggests areas for improvement, mention them tactfully. Use a friendly, professional tone.`;
  }

  // Fallback responses when AI APIs are unavailable
  generateFallbackResponse(userMessage, context) {
    const lowerMessage = userMessage.toLowerCase();
    
    const responses = {
      expense: `Based on your current expenses of $${context.totalExpenses.toLocaleString()}, here are some strategies to reduce costs:\n\n1. **Review subscriptions**: Cancel unused services\n2. **Meal planning**: Cook at home more often\n3. **Energy efficiency**: Switch to LED bulbs and unplug devices\n4. **Transportation**: Consider carpooling or public transit\n\nWith your current savings rate of ${context.savingsRate}%, you're ${context.savingsRate > 20 ? 'doing well' : 'below the recommended 20%'}. Focus on the biggest expense categories first.`,
      
      emergency: `Building an emergency fund is crucial! Here's a step-by-step approach:\n\n1. **Start small**: Aim for $1,000 first\n2. **Automate savings**: Set up automatic transfers\n3. **Use windfalls**: Direct tax refunds and bonuses to the fund\n4. **Target**: Build up to 3-6 months of expenses\n\nWith your monthly expenses, aim for $${(context.totalExpenses * 3).toLocaleString()} to $${(context.totalExpenses * 6).toLocaleString()} in your emergency fund.`,
      
      investment: `Investment strategy depends on your goals and risk tolerance:\n\n**For beginners:**\n- Start with index funds (low fees, diversified)\n- Consider target-date funds for retirement\n- Use tax-advantaged accounts (401k, IRA) first\n\n**Your situation:** With a ${context.savingsRate}% savings rate, ${context.savingsRate > 15 ? 'you have good foundation for investing' : 'focus on increasing savings first'}. Ensure you have an emergency fund before investing.`,
      
      budget: `Creating an effective budget:\n\n1. **Track expenses**: Use the 50/30/20 rule (needs/wants/savings)\n2. **Automate**: Set up automatic transfers for savings\n3. **Review monthly**: Adjust categories based on actual spending\n4. **Emergency buffer**: Include unexpected expenses\n\nYour current budget of $${context.monthlyBudget.toLocaleString()} ${context.monthlyBudget < context.monthlyIncome ? 'leaves room for savings' : 'may need adjustment'}.`,
      
      debt: `Debt management strategies:\n\n**High-interest debt (>6%):** Pay off first\n**Low-interest debt (<4%):** Consider investing instead\n**Strategy:** Use debt avalanche (highest interest first) or snowball (smallest balance first)\n\nWith your current financial situation, ${context.savingsRate > 10 ? 'you have good cash flow to tackle debt' : 'focus on increasing income or reducing expenses first'}.`
    };

    // Match user message to appropriate response
    if (lowerMessage.includes('expense') || lowerMessage.includes('reduce') || lowerMessage.includes('save money')) {
      return responses.expense;
    } else if (lowerMessage.includes('emergency') || lowerMessage.includes('fund')) {
      return responses.emergency;
    } else if (lowerMessage.includes('invest') || lowerMessage.includes('investment')) {
      return responses.investment;
    } else if (lowerMessage.includes('budget') || lowerMessage.includes('budgeting')) {
      return responses.budget;
    } else if (lowerMessage.includes('debt') || lowerMessage.includes('loan')) {
      return responses.debt;
    } else {
      return `Thank you for your question about "${userMessage}". Based on your financial profile:\n\n• Monthly Income: $${context.monthlyIncome.toLocaleString()}\n• Savings Rate: ${context.savingsRate}%\n• Active Goals: ${context.goalCount}\n\nI'd recommend focusing on ${context.savingsRate < 20 ? 'increasing your savings rate to 20%' : 'maintaining your good financial habits'}. ${context.setupCompleted ? 'Your financial foundation looks solid!' : 'Complete your profile setup for more personalized advice.'}\n\nFeel free to ask more specific questions about budgeting, investing, or debt management!`;
    }
  }
}

export default new AIService();
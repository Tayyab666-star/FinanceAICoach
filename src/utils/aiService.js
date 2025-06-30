// Enhanced AI Service utility with multiple providers including free options
class AIService {
  constructor() {
    this.providers = {
      gemini: {
        apiKey: import.meta.env.VITE_GEMINI_API_KEY,
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        free: true
      },
      huggingface: {
        apiKey: import.meta.env.VITE_HUGGINGFACE_API_KEY,
        endpoint: 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large',
        free: true
      },
      openai: {
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        endpoint: 'https://api.openai.com/v1/chat/completions',
        free: false
      }
    };
  }

  async callGemini(prompt) {
    const { apiKey, endpoint } = this.providers.gemini;
    
    if (!apiKey) {
      throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your environment variables.');
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
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
          candidateCount: 1
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API request failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  }

  async callHuggingFace(prompt) {
    const { apiKey, endpoint } = this.providers.huggingface;
    
    if (!apiKey) {
      throw new Error('HuggingFace API key not configured. Please add VITE_HUGGINGFACE_API_KEY to your environment variables.');
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 1000,
          temperature: 0.8,
          do_sample: true,
          top_p: 0.9
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HuggingFace API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data[0] && data[0].generated_text) {
      return data[0].generated_text.replace(prompt, '').trim();
    } else {
      throw new Error('Invalid response format from HuggingFace API');
    }
  }

  async callOpenAI(prompt) {
    const { apiKey, endpoint } = this.providers.openai;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your environment variables.');
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

  async getFinancialAdvice(userMessage, userContext, provider = 'auto') {
    const prompt = this.buildAdvancedFinancialPrompt(userMessage, userContext);
    
    // Auto-select provider based on availability
    if (provider === 'auto') {
      if (this.providers.gemini.apiKey) {
        provider = 'gemini';
      } else if (this.providers.huggingface.apiKey) {
        provider = 'huggingface';
      } else if (this.providers.openai.apiKey) {
        provider = 'openai';
      } else {
        throw new Error('No AI provider configured. Please add at least one API key.');
      }
    }
    
    try {
      switch (provider) {
        case 'gemini':
          return await this.callGemini(prompt);
        case 'huggingface':
          return await this.callHuggingFace(prompt);
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

  buildAdvancedFinancialPrompt(userMessage, context) {
    return `You are an expert financial advisor AI with deep knowledge of personal finance, investing, budgeting, wealth building, and financial planning. You provide personalized, actionable advice based on real financial data.

**USER'S CURRENT FINANCIAL PROFILE:**
• Monthly Income: $${context.monthlyIncome?.toLocaleString() || '0'}
• Monthly Budget: $${context.monthlyBudget?.toLocaleString() || '0'}
• Total Income (All Time): $${context.totalIncome?.toLocaleString() || '0'}
• Total Expenses (All Time): $${context.totalExpenses?.toLocaleString() || '0'}
• Current Net Worth: $${context.netWorth?.toLocaleString() || '0'}
• Savings Rate: ${context.savingsRate || '0'}%
• Transaction History: ${context.transactionCount || 0} transactions
• Active Financial Goals: ${context.goalCount || 0} goals
• Budget Categories Set Up: ${context.budgetCategories || 0} categories
• Profile Setup Status: ${context.setupCompleted ? 'Complete' : 'Incomplete'}

**SPENDING BREAKDOWN BY CATEGORY:**
${Object.entries(context.categorySpending || {}).map(([category, amount]) => 
  `• ${category}: $${amount.toLocaleString()}`
).join('\n') || '• No spending data available'}

**FINANCIAL GOALS PROGRESS:**
${context.goalProgress?.map(goal => 
  `• ${goal.title}: ${goal.progress.toFixed(1)}% complete ($${goal.remaining.toLocaleString()} remaining)`
).join('\n') || '• No active goals'}

**BUDGET ALLOCATIONS:**
${Object.entries(context.budgetAllocations || {}).map(([category, amount]) => 
  `• ${category}: $${amount.toLocaleString()}`
).join('\n') || '• No budget categories set'}

**USER QUESTION:** "${userMessage}"

**INSTRUCTIONS:**
1. Analyze their specific financial situation using the data provided
2. Give personalized, actionable advice with specific dollar amounts when relevant
3. Address their question directly and comprehensively
4. Include 2-3 specific action steps they can take immediately
5. Mention how this relates to their current goals and budget if applicable
6. Keep response conversational and encouraging
7. Limit response to 250-300 words for readability
8. Use their actual financial numbers to make recommendations personal

Provide your financial advice now:`;
  }

  // Enhanced fallback responses with real financial calculations
  generateFallbackResponse(userMessage, context) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Calculate some basic metrics for personalized responses
    const monthlyExpenses = context.totalExpenses / Math.max(context.transactionCount / 30, 1);
    const emergencyFundTarget = monthlyExpenses * 6;
    const recommendedSavings = context.monthlyIncome * 0.2;
    const currentSavings = context.monthlyIncome - monthlyExpenses;
    
    const responses = {
      expense: `Based on your spending of $${context.totalExpenses.toLocaleString()}, here are targeted ways to reduce expenses:

**Your Situation:** With ${context.savingsRate}% savings rate, ${context.savingsRate > 20 ? 'you\'re doing great!' : 'there\'s room for improvement.'}

**Top Opportunities:**
1. **Review your largest categories** - Focus on where you spend the most
2. **Automate savings** - Save $${Math.round(recommendedSavings - currentSavings)} more monthly to reach 20%
3. **Track daily spending** - Use our transaction tracker for better awareness

**Action Steps:**
• Set spending alerts for your top 3 categories
• Try the 24-hour rule before non-essential purchases over $50
• Review and cancel unused subscriptions

Your goal: Increase savings rate from ${context.savingsRate}% to 20% by reducing expenses by $${Math.round(recommendedSavings - currentSavings)}/month.`,

      emergency: `Emergency Fund Strategy for your situation:

**Your Target:** $${emergencyFundTarget.toLocaleString()} (6 months of expenses)
**Monthly Expenses:** ~$${Math.round(monthlyExpenses).toLocaleString()}
**Current Savings Capacity:** $${Math.round(currentSavings).toLocaleString()}/month

**Build Strategy:**
1. **Start with $1,000** - Achievable in ${Math.ceil(1000 / Math.max(currentSavings, 100))} months
2. **Automate transfers** - Set up $${Math.round(currentSavings * 0.5)}/month to emergency fund
3. **Use windfalls** - Direct tax refunds and bonuses here first

**Timeline:** At your current savings rate, you could build your full emergency fund in ${Math.ceil(emergencyFundTarget / Math.max(currentSavings, 100))} months.

**Pro Tip:** Keep it in a high-yield savings account earning 4-5% APY while staying liquid.`,

      investment: `Investment Strategy based on your profile:

**Your Foundation:** 
• Net Worth: $${context.netWorth.toLocaleString()}
• Savings Rate: ${context.savingsRate}%
• Monthly Surplus: $${Math.round(currentSavings).toLocaleString()}

**Recommendations:**
${context.savingsRate > 15 ? 
  '✅ **Ready to invest!** Your savings rate supports investing.' : 
  '⚠️ **Build savings first** - Aim for 15%+ savings rate before investing.'
}

**Investment Priority:**
1. **Emergency fund first** - ${emergencyFundTarget > currentSavings * 6 ? 'Build this before investing' : 'You\'re ready for step 2'}
2. **401(k) match** - Free money from employer
3. **Index funds** - Start with $${Math.round(currentSavings * 0.3)}/month in low-cost funds
4. **Roth IRA** - $500/month if under income limits

**Next Step:** ${context.savingsRate > 20 ? 'Start with $500/month in index funds' : 'Increase savings rate first'}`,

      budget: `Budget Optimization for your income:

**Current Allocation:**
• Income: $${context.monthlyIncome.toLocaleString()}
• Budget: $${context.monthlyBudget.toLocaleString()}
• Actual Spending: ~$${Math.round(monthlyExpenses).toLocaleString()}

**Recommended 50/30/20 Rule:**
• **Needs (50%):** $${Math.round(context.monthlyIncome * 0.5).toLocaleString()}
• **Wants (30%):** $${Math.round(context.monthlyIncome * 0.3).toLocaleString()}
• **Savings (20%):** $${Math.round(context.monthlyIncome * 0.2).toLocaleString()}

**Your Opportunity:** ${currentSavings < recommendedSavings ? 
  `Increase savings by $${Math.round(recommendedSavings - currentSavings)}/month` : 
  'You\'re exceeding the 20% savings recommendation!'
}

**Action Steps:**
1. **Categorize expenses** - Use our budget tool to track spending
2. **Automate savings** - Transfer $${Math.round(recommendedSavings)}/month immediately after payday
3. **Review monthly** - Adjust categories based on actual spending`,

      debt: `Debt Management Strategy:

**Your Financial Position:**
• Monthly Income: $${context.monthlyIncome.toLocaleString()}
• Available for Debt Payment: $${Math.round(currentSavings).toLocaleString()}/month

**Strategy Recommendations:**
• **High-interest debt (>6%):** Pay minimums + extra $${Math.round(currentSavings * 0.7)}/month
• **Low-interest debt (<4%):** Pay minimums, invest the difference
• **Medium-interest (4-6%):** Split approach based on risk tolerance

**Debt Avalanche Method:**
1. List all debts by interest rate (highest first)
2. Pay minimums on all debts
3. Put extra $${Math.round(currentSavings * 0.7)}/month toward highest rate
4. Repeat until debt-free

**Timeline Estimate:** With $${Math.round(currentSavings * 0.7)}/month extra payments, most credit card debt can be eliminated in 2-3 years.

**Emergency Fund:** Keep $1,000 minimum while paying off high-interest debt.`
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
      return `Thank you for your question: "${userMessage}"

**Your Financial Snapshot:**
• Monthly Income: $${context.monthlyIncome.toLocaleString()}
• Savings Rate: ${context.savingsRate}%
• Net Worth: $${context.netWorth.toLocaleString()}
• Active Goals: ${context.goalCount}

**Key Recommendations:**
${context.savingsRate < 20 ? 
  `• **Priority:** Increase savings rate to 20% (currently ${context.savingsRate}%)` : 
  '• **Great job!** Your savings rate exceeds the 20% recommendation'
}
${context.goalCount === 0 ? 
  '• **Set financial goals** - Having specific targets improves success by 42%' : 
  `• **Stay focused** on your ${context.goalCount} active goals`
}
${context.budgetCategories === 0 ? 
  '• **Create budget categories** - Track spending to optimize your finances' : 
  '• **Review budget performance** - Adjust categories based on actual spending'
}

**Next Steps:**
1. Use our AI coach for specific questions about investing, budgeting, or debt
2. Set up automatic transfers for consistent saving
3. Review your financial goals monthly

Feel free to ask more specific questions about any aspect of your finances!`;
    }
  }
}

export default new AIService();
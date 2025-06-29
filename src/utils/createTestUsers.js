import { supabase } from '../lib/supabase';

// Test users with random passwords (1-10)
export const testUsers = [
  {
    email: 'john.doe@example.com',
    password: '7',
    name: 'John Doe',
    monthly_income: 6500,
    monthly_budget: 5200
  },
  {
    email: 'jane.smith@example.com',
    password: '3',
    name: 'Jane Smith',
    monthly_income: 7200,
    monthly_budget: 5800
  },
  {
    email: 'mike.johnson@example.com',
    password: '9',
    name: 'Mike Johnson',
    monthly_income: 5800,
    monthly_budget: 4600
  },
  {
    email: 'sarah.wilson@example.com',
    password: '2',
    name: 'Sarah Wilson',
    monthly_income: 8100,
    monthly_budget: 6400
  },
  {
    email: 'alex.brown@example.com',
    password: '5',
    name: 'Alex Brown',
    monthly_income: 5500,
    monthly_budget: 4400
  }
];

// Sample transactions for each user
const sampleTransactions = [
  // John Doe transactions
  [
    { description: 'Salary Deposit', amount: 6500, category: 'Other', type: 'income', date: '2024-12-01' },
    { description: 'Grocery Store', amount: -120.50, category: 'Food', type: 'expense', date: '2024-12-15' },
    { description: 'Gas Station', amount: -45.20, category: 'Transport', type: 'expense', date: '2024-12-14' },
    { description: 'Netflix Subscription', amount: -15.99, category: 'Entertainment', type: 'expense', date: '2024-12-13' },
    { description: 'Coffee Shop', amount: -8.75, category: 'Food', type: 'expense', date: '2024-12-12' }
  ],
  // Jane Smith transactions
  [
    { description: 'Monthly Salary', amount: 7200, category: 'Other', type: 'income', date: '2024-12-01' },
    { description: 'Target Shopping', amount: -89.99, category: 'Shopping', type: 'expense', date: '2024-12-15' },
    { description: 'Uber Ride', amount: -18.50, category: 'Transport', type: 'expense', date: '2024-12-14' },
    { description: 'Pharmacy', amount: -25.30, category: 'Healthcare', type: 'expense', date: '2024-12-13' },
    { description: 'Restaurant Dinner', amount: -65.00, category: 'Food', type: 'expense', date: '2024-12-12' }
  ],
  // Mike Johnson transactions
  [
    { description: 'Paycheck', amount: 5800, category: 'Other', type: 'income', date: '2024-12-01' },
    { description: 'Electric Bill', amount: -95.00, category: 'Bills', type: 'expense', date: '2024-12-15' },
    { description: 'Gym Membership', amount: -29.99, category: 'Healthcare', type: 'expense', date: '2024-12-14' },
    { description: 'Fast Food', amount: -12.50, category: 'Food', type: 'expense', date: '2024-12-13' },
    { description: 'Movie Tickets', amount: -24.00, category: 'Entertainment', type: 'expense', date: '2024-12-12' }
  ],
  // Sarah Wilson transactions
  [
    { description: 'Salary', amount: 8100, category: 'Other', type: 'income', date: '2024-12-01' },
    { description: 'Online Course', amount: -199.00, category: 'Education', type: 'expense', date: '2024-12-15' },
    { description: 'Whole Foods', amount: -156.78, category: 'Food', type: 'expense', date: '2024-12-14' },
    { description: 'Car Insurance', amount: -125.00, category: 'Bills', type: 'expense', date: '2024-12-13' },
    { description: 'Starbucks', amount: -6.50, category: 'Food', type: 'expense', date: '2024-12-12' }
  ],
  // Alex Brown transactions
  [
    { description: 'Monthly Income', amount: 5500, category: 'Other', type: 'income', date: '2024-12-01' },
    { description: 'Internet Bill', amount: -79.99, category: 'Bills', type: 'expense', date: '2024-12-15' },
    { description: 'Grocery Shopping', amount: -98.45, category: 'Food', type: 'expense', date: '2024-12-14' },
    { description: 'Gas Fill-up', amount: -52.30, category: 'Transport', type: 'expense', date: '2024-12-13' },
    { description: 'Amazon Purchase', amount: -34.99, category: 'Shopping', type: 'expense', date: '2024-12-12' }
  ]
];

// Sample goals for users
const sampleGoals = [
  [
    { title: 'Emergency Fund', target_amount: 10000, current_amount: 3500, deadline: '2025-06-01', category: 'Emergency' },
    { title: 'Vacation to Europe', target_amount: 5000, current_amount: 1200, deadline: '2025-08-01', category: 'Travel' }
  ],
  [
    { title: 'New Car Down Payment', target_amount: 8000, current_amount: 2800, deadline: '2025-05-01', category: 'Purchase' },
    { title: 'Investment Portfolio', target_amount: 15000, current_amount: 4500, deadline: '2025-12-01', category: 'Investment' }
  ],
  [
    { title: 'Home Down Payment', target_amount: 25000, current_amount: 8900, deadline: '2026-01-01', category: 'Real Estate' },
    { title: 'Emergency Savings', target_amount: 6000, current_amount: 2100, deadline: '2025-04-01', category: 'Emergency' }
  ],
  [
    { title: 'Master\'s Degree Fund', target_amount: 12000, current_amount: 5600, deadline: '2025-09-01', category: 'Education' },
    { title: 'Wedding Fund', target_amount: 20000, current_amount: 7800, deadline: '2025-10-01', category: 'Other' }
  ],
  [
    { title: 'New Laptop', target_amount: 2500, current_amount: 1800, deadline: '2025-03-01', category: 'Purchase' },
    { title: 'Retirement Boost', target_amount: 10000, current_amount: 3200, deadline: '2025-12-01', category: 'Investment' }
  ]
];

// Sample budgets for users
const sampleBudgets = [
  { Food: 800, Transport: 300, Entertainment: 200, Shopping: 400, Bills: 1200, Healthcare: 150, Education: 100, Other: 150 },
  { Food: 900, Transport: 250, Entertainment: 300, Shopping: 500, Bills: 1300, Healthcare: 200, Education: 150, Other: 200 },
  { Food: 700, Transport: 280, Entertainment: 180, Shopping: 350, Bills: 1100, Healthcare: 120, Education: 80, Other: 120 },
  { Food: 1000, Transport: 200, Entertainment: 400, Shopping: 600, Bills: 1400, Healthcare: 250, Education: 300, Other: 250 },
  { Food: 650, Transport: 320, Entertainment: 150, Shopping: 300, Bills: 1000, Healthcare: 100, Education: 50, Other: 100 }
];

export const createTestUsers = async () => {
  console.log('🚀 Creating test users with sample data...');
  
  for (let i = 0; i < testUsers.length; i++) {
    const testUser = testUsers[i];
    
    try {
      console.log(`Creating user: ${testUser.email} with password: ${testUser.password}`);
      
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: testUser.email,
        password: testUser.password,
        options: {
          data: {
            name: testUser.name
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`User ${testUser.email} already exists, skipping...`);
          continue;
        }
        throw error;
      }

      if (data.user) {
        const userId = data.user.id;
        
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            id: userId,
            email: testUser.email,
            name: testUser.name,
            monthly_income: testUser.monthly_income,
            monthly_budget: testUser.monthly_budget,
            setup_completed: true
          }]);

        if (profileError && !profileError.message.includes('duplicate key')) {
          console.error(`Error creating profile for ${testUser.email}:`, profileError);
          continue;
        }

        // Add sample transactions
        if (sampleTransactions[i]) {
          const transactions = sampleTransactions[i].map(t => ({
            ...t,
            user_id: userId
          }));
          
          const { error: transError } = await supabase
            .from('transactions')
            .insert(transactions);
            
          if (transError) {
            console.error(`Error creating transactions for ${testUser.email}:`, transError);
          }
        }

        // Add sample goals
        if (sampleGoals[i]) {
          const goals = sampleGoals[i].map(g => ({
            ...g,
            user_id: userId
          }));
          
          const { error: goalsError } = await supabase
            .from('goals')
            .insert(goals);
            
          if (goalsError) {
            console.error(`Error creating goals for ${testUser.email}:`, goalsError);
          }
        }

        // Add sample budgets
        if (sampleBudgets[i]) {
          const budgets = Object.entries(sampleBudgets[i]).map(([category, amount]) => ({
            user_id: userId,
            category,
            allocated_amount: amount
          }));
          
          const { error: budgetError } = await supabase
            .from('budgets')
            .insert(budgets);
            
          if (budgetError) {
            console.error(`Error creating budgets for ${testUser.email}:`, budgetError);
          }
        }

        console.log(`✅ Successfully created user with sample data: ${testUser.email}`);
      }
    } catch (error) {
      console.error(`❌ Error creating user ${testUser.email}:`, error);
    }
  }
  
  console.log('🎉 Test user creation completed with sample financial data!');
  return testUsers;
};
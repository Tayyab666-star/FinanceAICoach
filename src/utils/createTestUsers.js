import { supabase } from '../lib/supabase';

// Test users with random passwords (1-10)
const testUsers = [
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

export const createTestUsers = async () => {
  console.log('Creating test users...');
  
  for (const testUser of testUsers) {
    try {
      console.log(`Creating user: ${testUser.email} with password: ${testUser.password}`);
      
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
        user_metadata: {
          name: testUser.name
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
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([{
            id: data.user.id,
            email: testUser.email,
            name: testUser.name,
            monthly_income: testUser.monthly_income,
            monthly_budget: testUser.monthly_budget,
            setup_completed: true
          }]);

        if (profileError && !profileError.message.includes('duplicate key')) {
          console.error(`Error creating profile for ${testUser.email}:`, profileError);
        } else {
          console.log(`✅ Successfully created user: ${testUser.email}`);
        }
      }
    } catch (error) {
      console.error(`Error creating user ${testUser.email}:`, error);
    }
  }
  
  console.log('Test user creation completed!');
  return testUsers;
};

// Export test users for reference
export { testUsers };
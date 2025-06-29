import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    getSession();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Get current session
  const getSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      if (session?.user) {
        setUser(session.user);
        await fetchUserProfile(session.user.id);
      }
    } catch (error) {
      console.error('Session error:', error);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  // Fetch user profile from database
  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  };

  // Sign up new user
  const signUp = async (email, password, name) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('An account with this email already exists. Please try logging in instead.');
        }
        throw error;
      }

      if (data.user) {
        // Create user profile
        await createUserProfile(data.user.id, email, name);
        
        return {
          user: data.user,
          needsEmailConfirmation: !data.session // If no session, email confirmation is required
        };
      }

      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in existing user
  const signIn = async (email, password) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out user
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  // Alias for signOut to maintain compatibility
  const logout = signOut;

  // Reset password
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      
      return { message: 'Password reset email sent successfully' };
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  // Update password
  const updatePassword = async (newPassword) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      return { message: 'Password updated successfully' };
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  };

  // Create user profile
  const createUserProfile = async (userId, email, name) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .insert([{
          id: userId,
          email: email,
          name: name || email.split('@')[0],
          monthly_income: 5000,
          monthly_budget: 4000,
          setup_completed: true
        }])
        .select()
        .single();

      if (error) throw error;
      
      setUserProfile(data);
      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      
      const processedUpdates = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(processedUpdates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      setUserProfile(data);
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh user profile
  const refreshUserProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (userProfile?.name) return userProfile.name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

  // Don't render children until auth is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile,
      isLoading, 
      signUp,
      signIn,
      signOut,
      logout,
      resetPassword,
      updatePassword,
      updateUserProfile,
      refreshUserProfile,
      getUserDisplayName,
      fetchUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
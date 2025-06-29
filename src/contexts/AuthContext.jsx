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
    let mounted = true;

    // Get initial session immediately
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else if (session?.user && mounted) {
          console.log('Found existing session for user:', session.user.email);
          await handleAuthUser(session.user);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in:', session.user.email);
        await handleAuthUser(session.user);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        setUserProfile(null);
        localStorage.removeItem('financeapp_user');
        localStorage.removeItem('financeapp_profile');
      }
      
      if (mounted) {
        setIsLoading(false);
      }
    });

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to capitalize name properly
  const capitalizeName = (name) => {
    if (!name) return '';
    
    // Split by spaces and capitalize each word
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Optimized auth user handler - immediate response
  const handleAuthUser = async (authUser) => {
    try {
      console.log('Handling auth user:', authUser.email);
      
      // Create basic user object immediately - no delays
      const userData = { 
        id: authUser.id,
        email: authUser.email, 
        name: authUser.email.split('@')[0]
      };
      
      console.log('Setting user data immediately:', userData);
      setUser(userData);
      
      // Try to get real profile from database first
      try {
        const { data: existingProfile, error: fetchError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();

        if (existingProfile) {
          console.log('Found existing profile:', existingProfile);
          setUserProfile(existingProfile);
          localStorage.setItem('financeapp_user', JSON.stringify(userData));
          localStorage.setItem('financeapp_profile', JSON.stringify(existingProfile));
          return;
        }
      } catch (error) {
        console.log('Error fetching existing profile:', error);
      }

      // Create new profile for new users - with setup_completed: false to trigger setup modal
      const newProfile = {
        id: authUser.id,
        email: authUser.email,
        name: capitalizeName(authUser.email.split('@')[0]),
        monthly_income: 0,
        monthly_budget: 0,
        setup_completed: false, // This will trigger the setup modal
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Setting new user profile:', newProfile);
      setUserProfile(newProfile);
      
      // Save to localStorage immediately
      localStorage.setItem('financeapp_user', JSON.stringify(userData));
      localStorage.setItem('financeapp_profile', JSON.stringify(newProfile));
      
      // Create profile in database in background
      createProfileInBackground(authUser.id, authUser.email);
      
    } catch (error) {
      console.error('Error handling auth user:', error);
      // Still set basic user data even if profile fails
      const userData = { 
        id: authUser.id,
        email: authUser.email, 
        name: authUser.email.split('@')[0]
      };
      setUser(userData);
      localStorage.setItem('financeapp_user', JSON.stringify(userData));
    }
  };

  // Background profile creation - non-blocking and silent
  const createProfileInBackground = async (authUserId, email) => {
    try {
      console.log('Creating profile in background for:', email);
      
      // Create new profile if it doesn't exist
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: authUserId,
          email: email,
          name: capitalizeName(email.split('@')[0]),
          monthly_income: 0,
          monthly_budget: 0,
          setup_completed: false
        }, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (!error && data) {
        console.log('Background profile creation successful:', data);
        setUserProfile(data);
        localStorage.setItem('financeapp_profile', JSON.stringify(data));
      }
    } catch (error) {
      console.log('Background profile creation failed (non-critical):', error);
      // Don't update UI on failure - keep the fallback profile
    }
  };

  // Send verification code to email (FORCE OTP, disable magic links)
  const sendVerificationCode = async (email) => {
    try {
      console.log('Sending OTP to:', email);
      
      // Use signInWithOtp with explicit options to force OTP codes
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: undefined, // Explicitly disable redirect
          data: {
            email: email
          }
        }
      });

      if (error) {
        console.error('Supabase OTP error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('Email rate limit exceeded')) {
          throw new Error('Too many requests. Please wait a moment before trying again.');
        } else if (error.message?.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        } else if (error.message?.includes('Signup is disabled')) {
          throw new Error('New account creation is currently disabled. Please contact support.');
        }
        
        throw error;
      }

      console.log('OTP sent successfully:', data);
      return { success: true, message: 'Verification code sent to your email!' };
    } catch (error) {
      console.error('Send verification code error:', error);
      throw error;
    }
  };

  // Verify the code entered by user
  const verifyCode = async (email, token) => {
    try {
      console.log('Verifying OTP for:', email, 'Token length:', token.length);
      
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: token,
        type: 'email'
      });

      if (error) {
        console.error('Verify OTP error:', error);
        
        // Handle specific error cases
        if (error.message?.includes('Token has expired')) {
          throw new Error('Verification code has expired. Please request a new one.');
        } else if (error.message?.includes('Invalid token')) {
          throw new Error('Invalid verification code. Please check and try again.');
        } else if (error.message?.includes('Email not confirmed')) {
          throw new Error('Email verification failed. Please try again.');
        }
        
        throw error;
      }

      console.log('OTP verified successfully:', data);
      // The auth state change will be handled by the listener
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Verify code error:', error);
      throw error;
    }
  };

  // Check if user exists (for returning users)
  const checkUserExists = async (email) => {
    try {
      // Try to get user profile by email
      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('id, email, name')
        .eq('email', email)
        .limit(1);

      if (error) {
        console.error('Error checking user:', error);
        return { exists: false };
      }

      return { 
        exists: profiles && profiles.length > 0,
        profile: profiles?.[0] || null
      };
    } catch (error) {
      console.error('Error in checkUserExists:', error);
      return { exists: false };
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out user');
      await supabase.auth.signOut();
      // The auth state change will be handled by the listener
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if signOut fails
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem('financeapp_user');
      localStorage.removeItem('financeapp_profile');
    }
  };

  const updateUserProfile = async (updates) => {
    if (!user?.id) {
      console.error('No user ID available for profile update');
      return;
    }
    
    try {
      // Update local state immediately for responsive UI
      const updatedProfile = {
        ...userProfile,
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      if (updates.name) {
        updatedProfile.name = capitalizeName(updates.name);
      }
      
      setUserProfile(updatedProfile);
      localStorage.setItem('financeapp_profile', JSON.stringify(updatedProfile));
      
      // Update database in background
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          name: updates.name ? capitalizeName(updates.name) : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile in database:', error);
        // Revert local changes if database update fails
        setUserProfile(userProfile);
        localStorage.setItem('financeapp_profile', JSON.stringify(userProfile));
        throw error;
      }
      
      // Update with database response
      if (data) {
        setUserProfile(data);
        localStorage.setItem('financeapp_profile', JSON.stringify(data));
      }
      
      return data || updatedProfile;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // Refresh user profile from database
  const refreshUserProfile = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error refreshing profile:', error);
        return;
      }
      
      const updatedUser = {
        ...user,
        name: data.name || user.name,
        email: data.email || user.email
      };
      
      setUserProfile(data);
      setUser(updatedUser);
      
      // Update localStorage
      localStorage.setItem('financeapp_user', JSON.stringify(updatedUser));
      localStorage.setItem('financeapp_profile', JSON.stringify(data));
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  // Get user display name with fallback logic and proper capitalization
  const getUserDisplayName = () => {
    if (userProfile?.name) return capitalizeName(userProfile.name);
    if (user?.name) return capitalizeName(user.name);
    if (user?.email) {
      const emailPart = user.email.split('@')[0];
      return capitalizeName(emailPart);
    }
    return 'User';
  };

  // Don't render children until auth is initialized - but make it fast
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile,
      isLoading, 
      sendVerificationCode,
      verifyCode,
      checkUserExists,
      logout,
      updateUserProfile,
      getUserDisplayName,
      refreshUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
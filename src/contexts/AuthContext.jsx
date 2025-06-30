import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Initialize auth state on mount with improved session handling
  useEffect(() => {
    let mounted = true;
    let initializationTimeout;

    // Get initial session with better error handling
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Set a reasonable timeout for initialization (5 seconds)
        initializationTimeout = setTimeout(() => {
          if (mounted) {
            console.log('Auth initialization timeout - proceeding without session');
            setIsLoading(false);
            setIsInitialized(true);
          }
        }, 5000);
        
        // Check for existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        // Clear timeout since we got a response
        if (initializationTimeout) {
          clearTimeout(initializationTimeout);
        }
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          // Clear any corrupted session data
          await supabase.auth.signOut();
          setUser(null);
          setUserProfile(null);
          setError(null);
        } else if (session?.user && mounted) {
          console.log('Found valid session for user:', session.user.email);
          await handleAuthUser(session.user);
        } else {
          console.log('No active session found');
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        // Clear everything on any error
        setUser(null);
        setUserProfile(null);
        setError(null);
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
      
      try {
        setError(null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in:', session.user.email);
          setIsLoading(true);
          await handleAuthUser(session.user);
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setUser(null);
          setUserProfile(null);
          setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('Token refreshed for user:', session.user.email);
          // Update user data if needed without showing loading
          if (!user || user.id !== session.user.id) {
            await handleAuthUser(session.user);
          }
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        setError('Authentication error occurred. Please try again.');
        setIsLoading(false);
      }
    });

    getInitialSession();

    return () => {
      mounted = false;
      if (initializationTimeout) {
        clearTimeout(initializationTimeout);
      }
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to capitalize name properly
  const capitalizeName = (name) => {
    if (!name) return '';
    
    const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim();
    if (!cleanName) return name;
    
    return cleanName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Enhanced auth user handler with better profile fetching
  const handleAuthUser = async (authUser) => {
    try {
      console.log('Handling auth user:', authUser.email);
      
      // Create basic user object immediately
      const userData = { 
        id: authUser.id,
        email: authUser.email, 
        name: capitalizeName(authUser.email.split('@')[0])
      };
      
      console.log('Setting user data immediately:', userData);
      setUser(userData);
      
      // Fetch profile with timeout protection
      const profilePromise = fetchUserProfile(authUser.id, authUser.email);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 3000)
      );
      
      try {
        await Promise.race([profilePromise, timeoutPromise]);
      } catch (error) {
        console.warn('Profile fetch failed or timed out:', error);
        // Set fallback profile to prevent blocking
        setUserProfile({
          id: authUser.id,
          email: authUser.email,
          name: userData.name,
          monthly_income: 0,
          monthly_budget: 0,
          setup_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
      
    } catch (error) {
      console.error('Error handling auth user:', error);
      
      // Still set basic user data even if profile fails
      const userData = { 
        id: authUser.id,
        email: authUser.email, 
        name: capitalizeName(authUser.email.split('@')[0])
      };
      setUser(userData);
      
      // Set minimal profile to prevent blocking
      setUserProfile({
        id: authUser.id,
        email: authUser.email,
        name: userData.name,
        monthly_income: 0,
        monthly_budget: 0,
        setup_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  };

  // Separate function to fetch user profile with better error handling
  const fetchUserProfile = async (userId, email) => {
    try {
      console.log('Fetching user profile from database...');
      
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle to handle no results gracefully

      if (fetchError) {
        console.error('Error fetching profile:', fetchError);
        throw fetchError;
      }

      if (existingProfile) {
        console.log('Found existing profile:', existingProfile);
        setUserProfile(existingProfile);
        return existingProfile;
      } else {
        console.log('No profile found, creating new one...');
        return await createUserProfile(userId, email);
      }
    } catch (error) {
      console.error('Profile fetch failed:', error);
      throw error;
    }
  };

  // Create user profile function with proper error handling
  const createUserProfile = async (authUserId, email) => {
    try {
      console.log('Creating new user profile for:', email);
      
      const newProfile = {
        id: authUserId,
        email: email,
        name: capitalizeName(email.split('@')[0]),
        monthly_income: 0,
        monthly_budget: 0,
        setup_completed: false
      };
      
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert([newProfile], { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        // Set fallback profile
        setUserProfile(newProfile);
        return newProfile;
      }
      
      console.log('Profile created successfully:', data);
      setUserProfile(data);
      return data;
      
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      // Set fallback profile
      const fallbackProfile = {
        id: authUserId,
        email: email,
        name: capitalizeName(email.split('@')[0]),
        monthly_income: 0,
        monthly_budget: 0,
        setup_completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setUserProfile(fallbackProfile);
      return fallbackProfile;
    }
  };

  // Send verification code
  const sendVerificationCode = async (email) => {
    try {
      console.log('Sending OTP to:', email);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: undefined,
          data: { email: email }
        }
      });

      if (error) {
        console.error('Supabase OTP error:', error);
        
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
      setError(error.message || 'Failed to send verification code');
      throw error;
    }
  };

  // Verify code
  const verifyCode = async (email, token) => {
    try {
      console.log('Verifying OTP for:', email, 'Token length:', token.length);
      setError(null);
      
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: token,
        type: 'email'
      });

      if (error) {
        console.error('Verify OTP error:', error);
        
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
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Verify code error:', error);
      setError(error.message || 'Failed to verify code');
      throw error;
    }
  };

  // Check if user exists
  const checkUserExists = async (email) => {
    try {
      setError(null);
      
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
      setError('Failed to check user status');
      return { exists: false };
    }
  };

  // Logout
  const logout = async () => {
    try {
      console.log('Logging out user');
      setError(null);
      
      await supabase.auth.signOut();
      setUser(null);
      setUserProfile(null);
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout. Please try again.');
      
      setUser(null);
      setUserProfile(null);
    }
  };

  // Enhanced update user profile with better persistence and validation
  const updateUserProfile = async (updates) => {
    if (!user?.id) {
      console.error('No user ID available for profile update');
      setError('No user session found. Please login again.');
      throw new Error('No user session found');
    }
    
    try {
      setError(null);
      
      // Clean and validate updates
      let cleanedUpdates = { ...updates };
      if (updates.name) {
        cleanedUpdates.name = capitalizeName(updates.name);
      }
      
      // Ensure numeric values are properly converted
      if (updates.monthly_income !== undefined) {
        cleanedUpdates.monthly_income = parseFloat(updates.monthly_income) || 0;
      }
      if (updates.monthly_budget !== undefined) {
        cleanedUpdates.monthly_budget = parseFloat(updates.monthly_budget) || 0;
      }
      
      // Ensure setup_completed is properly set
      if (updates.setup_completed !== undefined) {
        cleanedUpdates.setup_completed = Boolean(updates.setup_completed);
      }
      
      console.log('Updating profile with cleaned data:', cleanedUpdates);
      
      // Update local state immediately for responsive UI
      const updatedProfile = {
        ...userProfile,
        ...cleanedUpdates,
        updated_at: new Date().toISOString()
      };
      setUserProfile(updatedProfile);
      
      // Update database with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const { data, error } = await supabase
            .from('user_profiles')
            .update({
              ...cleanedUpdates,
              updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select()
            .single();

          if (error) {
            throw error;
          }
          
          console.log('Profile updated successfully in database:', data);
          
          // Update local state with database response
          if (data) {
            setUserProfile(data);
            
            // Update user object if name changed
            if (data.name) {
              const updatedUser = {
                ...user,
                name: data.name
              };
              setUser(updatedUser);
            }
          }
          
          return data;
          
        } catch (dbError) {
          retryCount++;
          console.error(`Database update attempt ${retryCount} failed:`, dbError);
          
          if (retryCount >= maxRetries) {
            console.error('All database update attempts failed, but local state is updated');
            // Don't throw error - local state is already updated
            return updatedProfile;
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }
      
    } catch (error) {
      console.error('Error updating user profile:', error);
      setError(error.message || 'Failed to update profile');
      throw error;
    }
  };

  // Refresh user profile from database
  const refreshUserProfile = async () => {
    if (!user?.id) return;
    
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error refreshing profile:', error);
        setError('Failed to refresh profile data');
        return;
      }
      
      const updatedUser = {
        ...user,
        name: data.name || user.name,
        email: data.email || user.email
      };
      
      setUserProfile(data);
      setUser(updatedUser);
      
      console.log('Profile refreshed successfully:', data);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      setError('Failed to refresh profile data');
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (userProfile?.name) return capitalizeName(userProfile.name);
    if (user?.name) return capitalizeName(user.name);
    if (user?.email) {
      const emailPart = user.email.split('@')[0];
      return capitalizeName(emailPart);
    }
    return 'User';
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Show loading screen only during initial load
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
      error,
      sendVerificationCode,
      verifyCode,
      checkUserExists,
      logout,
      updateUserProfile,
      getUserDisplayName,
      refreshUserProfile,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};
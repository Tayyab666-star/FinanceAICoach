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

  // Initialize auth state on mount with persistent session
  useEffect(() => {
    let mounted = true;

    // Get initial session immediately with persistent storage check
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // First check localStorage for cached user data
        const cachedUser = localStorage.getItem('financeapp_user');
        const cachedProfile = localStorage.getItem('financeapp_profile');
        
        if (cachedUser && cachedProfile) {
          try {
            const userData = JSON.parse(cachedUser);
            const profileData = JSON.parse(cachedProfile);
            
            console.log('Found cached user data:', userData.email);
            setUser(userData);
            setUserProfile(profileData);
          } catch (e) {
            console.warn('Invalid cached data, clearing:', e);
            localStorage.removeItem('financeapp_user');
            localStorage.removeItem('financeapp_profile');
          }
        }
        
        // Then check Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          // Don't set error if we have cached data
          if (!cachedUser) {
            setError('Failed to load session. Please refresh the page.');
          }
        } else if (session?.user && mounted) {
          console.log('Found existing Supabase session for user:', session.user.email);
          await handleAuthUser(session.user);
        } else if (!cachedUser && mounted) {
          // No session and no cached data - user is not logged in
          console.log('No session found and no cached data');
          setUser(null);
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Error in getInitialSession:', error);
        if (!localStorage.getItem('financeapp_user')) {
          setError('Failed to initialize authentication. Please refresh the page.');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    // Listen for auth changes with persistent session handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session?.user?.email);
      
      try {
        setError(null);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in:', session.user.email);
          setIsLoading(true);
          await handleAuthUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setUser(null);
          setUserProfile(null);
          // Clear persistent storage on explicit logout
          localStorage.removeItem('financeapp_user');
          localStorage.removeItem('financeapp_profile');
          localStorage.removeItem('financeapp_session_timestamp');
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('Token refreshed for user:', session.user.email);
          // Update session timestamp on token refresh
          localStorage.setItem('financeapp_session_timestamp', Date.now().toString());
        }
      } catch (error) {
        console.error('Error handling auth state change:', error);
        setError('Authentication error occurred. Please try again.');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    });

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Helper function to capitalize name properly and extract only alphabetic characters
  const capitalizeName = (name) => {
    if (!name) return '';
    
    // Extract only alphabetic characters and spaces, remove numbers and special chars
    const cleanName = name.replace(/[^a-zA-Z\s]/g, '').trim();
    
    if (!cleanName) return name; // Return original if nothing left after cleaning
    
    // Split by spaces and capitalize each word
    return cleanName
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Enhanced auth user handler with persistent storage
  const handleAuthUser = async (authUser) => {
    try {
      console.log('Handling auth user:', authUser.email);
      
      // Create basic user object immediately - no delays
      const userData = { 
        id: authUser.id,
        email: authUser.email, 
        name: capitalizeName(authUser.email.split('@')[0])
      };
      
      console.log('Setting user data immediately:', userData);
      setUser(userData);
      
      // Store session timestamp for persistence tracking
      localStorage.setItem('financeapp_session_timestamp', Date.now().toString());
      
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
          
          // Store in persistent storage
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
      
      console.log('Setting new user profile with setup_completed: false:', newProfile);
      setUserProfile(newProfile);
      
      // Save to persistent storage immediately
      localStorage.setItem('financeapp_user', JSON.stringify(userData));
      localStorage.setItem('financeapp_profile', JSON.stringify(newProfile));
      
      // Create profile in database in background
      createProfileInBackground(authUser.id, authUser.email);
      
    } catch (error) {
      console.error('Error handling auth user:', error);
      setError('Failed to load user profile. Please try again.');
      
      // Still set basic user data even if profile fails
      const userData = { 
        id: authUser.id,
        email: authUser.email, 
        name: capitalizeName(authUser.email.split('@')[0])
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

  // Enhanced send verification code with persistent session setup
  const sendVerificationCode = async (email) => {
    try {
      console.log('Sending OTP to:', email);
      setError(null);
      
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
      setError(error.message || 'Failed to send verification code');
      throw error;
    }
  };

  // Enhanced verify code with persistent session setup
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
      
      // Set up persistent session immediately
      if (data.user) {
        localStorage.setItem('financeapp_session_timestamp', Date.now().toString());
        console.log('Persistent session established for:', data.user.email);
      }
      
      // The auth state change will be handled by the listener
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Verify code error:', error);
      setError(error.message || 'Failed to verify code');
      throw error;
    }
  };

  // Check if user exists (for returning users)
  const checkUserExists = async (email) => {
    try {
      setError(null);
      
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
      setError('Failed to check user status');
      return { exists: false };
    }
  };

  // Enhanced logout with persistent storage cleanup
  const logout = async () => {
    try {
      console.log('Logging out user');
      setError(null);
      
      // Clear persistent storage first
      localStorage.removeItem('financeapp_user');
      localStorage.removeItem('financeapp_profile');
      localStorage.removeItem('financeapp_session_timestamp');
      
      // Then sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local state
      setUser(null);
      setUserProfile(null);
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to logout. Please try again.');
      
      // Still clear local state and storage even if signOut fails
      setUser(null);
      setUserProfile(null);
      localStorage.removeItem('financeapp_user');
      localStorage.removeItem('financeapp_profile');
      localStorage.removeItem('financeapp_session_timestamp');
    }
  };

  // Enhanced update user profile with persistent storage
  const updateUserProfile = async (updates) => {
    if (!user?.id) {
      console.error('No user ID available for profile update');
      setError('No user session found. Please login again.');
      return;
    }
    
    try {
      setError(null);
      
      // Clean and capitalize name if provided
      let cleanedUpdates = { ...updates };
      if (updates.name) {
        cleanedUpdates.name = capitalizeName(updates.name);
      }
      
      console.log('Updating profile with:', cleanedUpdates);
      
      // Update local state immediately for responsive UI
      const updatedProfile = {
        ...userProfile,
        ...cleanedUpdates,
        updated_at: new Date().toISOString()
      };
      
      console.log('Updated profile will be:', updatedProfile);
      
      setUserProfile(updatedProfile);
      localStorage.setItem('financeapp_profile', JSON.stringify(updatedProfile));
      
      // Update user object if name changed
      if (cleanedUpdates.name) {
        const updatedUser = {
          ...user,
          name: cleanedUpdates.name
        };
        setUser(updatedUser);
        localStorage.setItem('financeapp_user', JSON.stringify(updatedUser));
      }
      
      // Update database in background
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
        console.error('Error updating profile in database:', error);
        // Revert local changes if database update fails
        setUserProfile(userProfile);
        localStorage.setItem('financeapp_profile', JSON.stringify(userProfile));
        if (cleanedUpdates.name) {
          setUser(user);
          localStorage.setItem('financeapp_user', JSON.stringify(user));
        }
        setError('Failed to update profile. Please try again.');
        throw error;
      }
      
      // Update with database response
      if (data) {
        console.log('Profile updated successfully in database:', data);
        setUserProfile(data);
        localStorage.setItem('financeapp_profile', JSON.stringify(data));
        
        // Update user object with latest name
        if (data.name) {
          const updatedUser = {
            ...user,
            name: data.name
          };
          setUser(updatedUser);
          localStorage.setItem('financeapp_user', JSON.stringify(updatedUser));
        }
      }
      
      return data || updatedProfile;
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
      
      // Update persistent storage
      localStorage.setItem('financeapp_user', JSON.stringify(updatedUser));
      localStorage.setItem('financeapp_profile', JSON.stringify(data));
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      setError('Failed to refresh profile data');
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

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Check session validity for persistent auth
  const isSessionValid = () => {
    const sessionTimestamp = localStorage.getItem('financeapp_session_timestamp');
    if (!sessionTimestamp) return false;
    
    const sessionAge = Date.now() - parseInt(sessionTimestamp);
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    
    return sessionAge < maxAge;
  };

  // Don't render children until auth is initialized - but make it fast
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Initializing...</p>
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 max-w-md mx-auto">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 px-4 py-2 bg-red-600 text-white text-sm hover:bg-red-700 transition-colors"
              >
                Reload Page
              </button>
            </div>
          )}
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
      clearError,
      isSessionValid
    }}>
      {children}
    </AuthContext.Provider>
  );
};
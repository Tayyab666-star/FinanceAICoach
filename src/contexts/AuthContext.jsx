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

    // Get initial session
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
      
      setIsLoading(false);
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

  // Handle authenticated user
  const handleAuthUser = async (authUser) => {
    try {
      console.log('Handling auth user:', authUser.email);
      
      // Create basic user object first
      const userData = { 
        id: authUser.id,
        email: authUser.email, 
        name: authUser.email.split('@')[0]
      };
      
      console.log('Setting user data:', userData);
      setUser(userData);
      
      // Try to get/create profile with increased timeout and better error handling
      try {
        console.log('Creating/getting profile for user:', authUser.id, authUser.email);
        
        // Increased timeout from 30 seconds to 60 seconds
        const profilePromise = createOrGetUserProfile(authUser.id, authUser.email);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Profile creation timeout')), 60000)
        );
        
        const profile = await Promise.race([profilePromise, timeoutPromise]);
        
        console.log('Profile created/retrieved successfully:', profile);
        setUserProfile(profile);
        
        // Update user with profile name if available
        if (profile?.name) {
          const updatedUserData = { ...userData, name: profile.name };
          setUser(updatedUserData);
          localStorage.setItem('financeapp_user', JSON.stringify(updatedUserData));
        }
        
        if (profile) {
          localStorage.setItem('financeapp_profile', JSON.stringify(profile));
        }
      } catch (profileError) {
        console.error('Profile creation failed, using fallback:', profileError);
        
        // Create a basic profile object as fallback
        const fallbackProfile = {
          id: authUser.id,
          email: authUser.email,
          name: capitalizeName(authUser.email.split('@')[0]),
          monthly_income: 0,
          monthly_budget: 0,
          setup_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('Using fallback profile:', fallbackProfile);
        setUserProfile(fallbackProfile);
        localStorage.setItem('financeapp_profile', JSON.stringify(fallbackProfile));
        
        // Try to create profile in background without blocking - with retry logic
        setTimeout(async () => {
          let retryCount = 0;
          const maxRetries = 3;
          
          while (retryCount < maxRetries) {
            try {
              console.log(`Background profile creation attempt ${retryCount + 1}/${maxRetries}`);
              const profile = await createOrGetUserProfile(authUser.id, authUser.email);
              console.log('Background profile creation successful:', profile);
              
              // Update the profile state if successful
              setUserProfile(profile);
              localStorage.setItem('financeapp_profile', JSON.stringify(profile));
              break;
            } catch (bgError) {
              retryCount++;
              console.warn(`Background profile creation attempt ${retryCount} failed:`, bgError);
              
              if (retryCount < maxRetries) {
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
              }
            }
          }
        }, 2000); // Start after 2 seconds instead of 1
      }
      
      // Save basic user data to localStorage
      localStorage.setItem('financeapp_user', JSON.stringify(userData));
      
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

  // Create or get user profile using Supabase auth user ID
  const createOrGetUserProfile = async (authUserId, email) => {
    try {
      console.log('Creating/getting profile for user:', authUserId, email);
      
      // First, try to get existing profile using auth user ID
      const { data: existingProfile, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUserId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no rows

      if (fetchError) {
        console.error('Error fetching user profile:', fetchError);
        // Continue with profile creation
      }

      if (existingProfile) {
        console.log('Found existing profile:', existingProfile);
        return existingProfile;
      }

      // If no profile exists, create a new one using auth user ID
      const firstName = email.split('@')[0];
      const capitalizedName = capitalizeName(firstName);
      
      console.log('Creating new profile for:', email);
      
      // Create new profile
      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert([{
          id: authUserId,
          email: email,
          name: capitalizedName,
          monthly_income: 0,
          monthly_budget: 0,
          setup_completed: false
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Error creating user profile:', insertError);
        
        // If insert fails due to conflict, try to fetch again
        if (insertError.code === '23505') { // Unique constraint violation
          console.log('Profile already exists, fetching it...');
          const { data: conflictProfile, error: conflictError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', authUserId)
            .single();
            
          if (conflictError) {
            throw conflictError;
          }
          
          return conflictProfile;
        }
        
        throw insertError;
      }

      console.log('Created new profile:', newProfile);
      return newProfile;
    } catch (error) {
      console.error('Error in createOrGetUserProfile:', error);
      throw error;
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
      setIsLoading(true);
      
      // Capitalize the name if it's being updated
      const processedUpdates = {
        ...updates,
        updated_at: new Date().toISOString()
      };
      
      if (updates.name) {
        processedUpdates.name = capitalizeName(updates.name);
      }
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(processedUpdates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
      
      // Update both user and userProfile states
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
      
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    } finally {
      setIsLoading(false);
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
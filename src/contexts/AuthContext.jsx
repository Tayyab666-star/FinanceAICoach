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

      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_IN' && session?.user) {
        await handleAuthUser(session.user);
      } else if (event === 'SIGNED_OUT') {
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
      const profile = await createOrGetUserProfile(authUser.id, authUser.email);
      const userData = { 
        id: authUser.id, // Use Supabase auth user ID
        email: authUser.email, 
        name: profile.name 
      };
      
      setUser(userData);
      setUserProfile(profile);
      
      // Save to localStorage for persistence
      localStorage.setItem('financeapp_user', JSON.stringify(userData));
      localStorage.setItem('financeapp_profile', JSON.stringify(profile));
    } catch (error) {
      console.error('Error handling auth user:', error);
    }
  };

  // Create or get user profile using Supabase auth user ID
  const createOrGetUserProfile = async (authUserId, email) => {
    try {
      // First, try to get existing profile using auth user ID
      const { data: existingProfiles, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUserId) // Use auth user ID as primary key
        .limit(1);

      if (fetchError) {
        console.error('Error fetching user profile:', fetchError);
        throw fetchError;
      }

      if (existingProfiles && existingProfiles.length > 0) {
        return existingProfiles[0];
      }

      // If no profile exists, create a new one using auth user ID
      const firstName = email.split('@')[0];
      const capitalizedName = capitalizeName(firstName);
      
      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert([{
          id: authUserId, // Use Supabase auth user ID
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
        throw insertError;
      }

      return newProfile;
    } catch (error) {
      console.error('Error in createOrGetUserProfile:', error);
      throw error;
    }
  };

  // Send verification code to email (using OTP type)
  const sendVerificationCode = async (email) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: undefined, // Disable email redirect
          data: {
            // Additional metadata if needed
          }
        }
      });

      if (error) {
        throw error;
      }

      return { success: true, message: 'Verification code sent to your email!' };
    } catch (error) {
      console.error('Send verification code error:', error);
      throw error;
    }
  };

  // Verify the code entered by user
  const verifyCode = async (email, token) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email,
        token: token,
        type: 'email'
      });

      if (error) {
        throw error;
      }

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
    if (!user?.id) return;
    
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

      if (error) throw error;
      
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

      if (error) throw error;
      
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
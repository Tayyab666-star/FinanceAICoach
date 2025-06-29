import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    // Check if user data exists in localStorage
    const savedUser = localStorage.getItem('financeapp_user');
    const savedProfile = localStorage.getItem('financeapp_profile');
    
    if (savedUser && savedProfile) {
      try {
        setUser(JSON.parse(savedUser));
        setUserProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('financeapp_user');
        localStorage.removeItem('financeapp_profile');
      }
    }
    
    setIsLoading(false);
    setIsInitialized(true);
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

  // Create or get user profile
  const createOrGetUserProfile = async (email) => {
    try {
      // First, try to get existing profile
      const { data: existingProfiles, error: fetchError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .limit(1);

      if (fetchError) {
        console.error('Error fetching user profile:', fetchError);
        throw fetchError;
      }

      if (existingProfiles && existingProfiles.length > 0) {
        return existingProfiles[0];
      }

      // If no profile exists, create a new one with minimal setup
      const firstName = email.split('@')[0];
      const capitalizedName = capitalizeName(firstName);
      
      const { data: newProfile, error: insertError } = await supabase
        .from('user_profiles')
        .insert([{
          id: crypto.randomUUID(),
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

  const login = async (email) => {
    setIsLoading(true);
    try {
      const profile = await createOrGetUserProfile(email);
      const userData = { id: profile.id, email: profile.email, name: profile.name };
      
      setUser(userData);
      setUserProfile(profile);
      
      // Save to localStorage for persistence
      localStorage.setItem('financeapp_user', JSON.stringify(userData));
      localStorage.setItem('financeapp_profile', JSON.stringify(profile));
      
      return profile;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setUserProfile(null);
    
    // Clear localStorage
    localStorage.removeItem('financeapp_user');
    localStorage.removeItem('financeapp_profile');
    
    // Navigate to login page
    window.location.href = '/login';
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile,
      isLoading, 
      login, 
      logout,
      updateUserProfile,
      getUserDisplayName,
      refreshUserProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
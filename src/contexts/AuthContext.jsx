import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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
      const capitalizedName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
      
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
      setUser({ id: profile.id, email: profile.email, name: profile.name });
      setUserProfile(profile);
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
    // Navigate to login page
    window.location.href = '/login';
  };

  const updateUserProfile = async (updates) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Update both user and userProfile states
      setUserProfile(data);
      setUser(prev => ({
        ...prev,
        name: data.name || prev.name,
        email: data.email || prev.email
      }));
      
      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Get user display name with fallback logic
  const getUserDisplayName = () => {
    if (userProfile?.name) return userProfile.name;
    if (user?.name) return user.name;
    if (user?.email) {
      const emailPart = user.email.split('@')[0];
      return emailPart.charAt(0).toUpperCase() + emailPart.slice(1);
    }
    return 'User';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile,
      isLoading, 
      login, 
      logout,
      updateUserProfile,
      getUserDisplayName
    }}>
      {children}
    </AuthContext.Provider>
  );
};
import React, { createContext, useContext, useState, useEffect } from 'react';

const DarkModeContext = createContext();

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};

export const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check localStorage for saved dark mode preference
    const savedDarkMode = localStorage.getItem('financeapp_dark_mode');
    if (savedDarkMode === 'true') {
      setIsDarkMode(true);
      applyDarkMode(true);
    }
  }, []);

  const applyDarkMode = (darkMode) => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#1f2937';
      document.body.style.color = '#f9fafb';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '';
      document.body.style.color = '';
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    applyDarkMode(newDarkMode);
    localStorage.setItem('financeapp_dark_mode', newDarkMode.toString());
  };

  const enableDarkMode = () => {
    setIsDarkMode(true);
    applyDarkMode(true);
    localStorage.setItem('financeapp_dark_mode', 'true');
  };

  const disableDarkMode = () => {
    setIsDarkMode(false);
    applyDarkMode(false);
    localStorage.setItem('financeapp_dark_mode', 'false');
  };

  return (
    <DarkModeContext.Provider value={{
      isDarkMode,
      toggleDarkMode,
      enableDarkMode,
      disableDarkMode
    }}>
      {children}
    </DarkModeContext.Provider>
  );
};
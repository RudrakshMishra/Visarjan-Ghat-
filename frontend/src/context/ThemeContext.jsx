import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeModeState] = useState(() => {
    try {
      const saved = localStorage.getItem('ghatwatch_theme');
      return ['light', 'dark', 'system'].includes(saved) ? saved : 'system';
    } catch {
      return 'system';
    }
  });

  const [activeTheme, setActiveTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('ghatwatch_theme') || 'system';
      if (saved === 'dark') return 'dark';
      if (saved === 'light') return 'light';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = (mode) => {
      let resolved = 'light';
      if (mode === 'dark') {
        resolved = 'dark';
      } else if (mode === 'light') {
        resolved = 'light';
      } else {
        resolved = mediaQuery.matches ? 'dark' : 'light';
      }
      
      setActiveTheme(resolved);
      document.documentElement.setAttribute('data-theme', resolved);
      if (resolved === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      try {
        localStorage.setItem('ghatwatch_theme', mode);
      } catch {}
    };

    applyTheme(themeMode);

    const handleSystemChange = (e) => {
      if (themeMode === 'system') {
        const resolved = e.matches ? 'dark' : 'light';
        setActiveTheme(resolved);
        document.documentElement.setAttribute('data-theme', resolved);
        if (resolved === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [themeMode]);

  const setThemeMode = (mode) => {
    if (['light', 'dark', 'system'].includes(mode)) {
      setThemeModeState(mode);
    }
  };

  const cycleTheme = () => {
    if (themeMode === 'system') setThemeMode('light');
    else if (themeMode === 'light') setThemeMode('dark');
    else setThemeMode('system');
  };

  return (
    <ThemeContext.Provider value={{
      themeMode,
      activeTheme,
      setThemeMode,
      cycleTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

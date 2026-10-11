import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [textSize, setTextSize] = useState(() => {
    try {
      const saved = localStorage.getItem('ghatwatch_text_size');
      return ['normal', 'large', 'xlarge'].includes(saved) ? saved : 'normal';
    } catch {
      return 'normal';
    }
  });

  const [isHighContrast, setIsHighContrast] = useState(() => {
    try {
      const saved = localStorage.getItem('ghatwatch_contrast');
      return saved === 'high';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ghatwatch_text_size', textSize);
      document.documentElement.setAttribute('data-text-size', textSize);
    } catch {
      // storage error
    }
  }, [textSize]);

  useEffect(() => {
    try {
      localStorage.setItem('ghatwatch_contrast', isHighContrast ? 'high' : 'normal');
      if (isHighContrast) {
        document.documentElement.setAttribute('data-contrast', 'high');
      } else {
        document.documentElement.removeAttribute('data-contrast');
      }
    } catch {
      // storage error
    }
  }, [isHighContrast]);

  const toggleContrast = () => {
    setIsHighContrast(prev => !prev);
  };

  const setFontSize = (size) => {
    if (['normal', 'large', 'xlarge'].includes(size)) {
      setTextSize(size);
    }
  };

  return (
    <AccessibilityContext.Provider value={{
      textSize,
      setFontSize,
      isHighContrast,
      toggleContrast
    }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

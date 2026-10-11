import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from '../locales/en.json';
import hiTranslations from '../locales/hi.json';
import hinglishTranslations from '../locales/hinglish.json';

const translations = {
  en: enTranslations,
  hi: hiTranslations,
  hinglish: hinglishTranslations
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    try {
      const saved = localStorage.getItem('ghatwatch_lang');
      if (saved && (saved === 'en' || saved === 'hi' || saved === 'hinglish')) {
        return saved;
      }
    } catch {
      // fallback if localStorage not accessible
    }
    return 'en';
  });

  useEffect(() => {
    try {
      localStorage.setItem('ghatwatch_lang', currentLang);
      document.documentElement.lang = currentLang === 'hi' ? 'hi' : 'en';
    } catch {
      // ignore storage errors
    }
  }, [currentLang]);

  const changeLanguage = (lang) => {
    if (['en', 'hi', 'hinglish'].includes(lang)) {
      setCurrentLang(lang);
    }
  };

  /**
   * Helper function to get nested translation value:
   * e.g. t('hero.title')
   */
  const t = (path, fallback = '') => {
    if (!path) return fallback;
    const keys = path.split('.');
    let current = translations[currentLang] || translations.en;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English if translation key is missing
        let fallbackVal = translations.en;
        for (const fbKey of keys) {
          if (fallbackVal && typeof fallbackVal === 'object' && fbKey in fallbackVal) {
            fallbackVal = fallbackVal[fbKey];
          } else {
            return fallback || path;
          }
        }
        return typeof fallbackVal === 'string' ? fallbackVal : (fallback || path);
      }
    }
    
    return typeof current === 'string' ? current : (fallback || path);
  };

  return (
    <LanguageContext.Provider value={{ currentLang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

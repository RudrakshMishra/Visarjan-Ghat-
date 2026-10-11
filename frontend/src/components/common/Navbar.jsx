import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Globe, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export const Navbar = ({ activeSection, setActiveSection }) => {
  const { language, setLanguage } = useLanguage();
  const { activeTheme, setThemeMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isHindi = language === 'hi';

  const navItems = [
    { id: 'ghats-section', label: isHindi ? 'घाट जोखिम रैंकिंग' : 'Ghat Ranking' },
    { id: 'analytics-section', label: isHindi ? 'जल विश्लेषण एवं रुझान' : 'Analytics & Trends' },
    { id: 'mandate-section', label: isHindi ? 'डेटा कवरेज एवं अंतराल' : 'Coverage & Mandate' },
    { id: 'brief-section', label: isHindi ? 'बीएमसी अधिकारी ब्रीफ' : 'Officer Brief' },
    { id: 'gis-section', label: isHindi ? 'जीआईएस कृत्रिम कुंड' : 'GIS Kunds' }
  ];

  const handleNavClick = (id) => {
    if (setActiveSection) setActiveSection(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleTheme = () => {
    setThemeMode(activeTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header 
      className="sticky top-0 z-40 w-full transition-all duration-200 border-b backdrop-blur-md"
      style={{
        background: activeTheme === 'dark' ? 'rgba(11, 19, 43, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        borderColor: activeTheme === 'dark' ? '#273757' : '#E2E8F0'
      }}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        
        {/* Brand: Ghat Watch */}
        <a 
          href="#top" 
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 text-decoration-none group"
          aria-label="Ghat Watch Home"
        >
          <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black text-sm shadow-xs shrink-0">
            GW
          </div>
          <div className="flex flex-col text-left">
            <span 
              className="text-base sm:text-lg font-bold tracking-tight leading-tight"
              style={{
                color: activeTheme === 'dark' ? '#FFFFFF' : '#0F172A'
              }}
            >
              Ghat Watch
            </span>
            <span className="hidden sm:inline text-2xs text-slate-500 dark:text-slate-400 font-semibold tracking-wide">
              BHOPAL MUNICIPAL CORP • TRACK 2
            </span>
          </div>
        </a>

        {/* Desktop Navigation Items */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer"
                style={{
                  color: isActive 
                    ? '#FF671F' 
                    : (activeTheme === 'dark' ? '#CBD5E1' : '#475569'),
                  background: isActive 
                    ? (activeTheme === 'dark' ? 'rgba(255, 103, 31, 0.15)' : 'rgba(255, 103, 31, 0.08)') 
                    : 'transparent'
                }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Side Utility */}
        <div className="flex items-center gap-2.5">
          
          {/* Clean Language Toggle */}
          <div 
            className="flex items-center rounded-lg p-0.5 border text-xs font-semibold gap-0.5"
            style={{
              background: activeTheme === 'dark' ? '#16203A' : '#F1F5F9',
              borderColor: activeTheme === 'dark' ? '#273757' : '#E2E8F0'
            }}
          >
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'हिन्दी' }
            ].map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className="px-2.5 py-1 rounded-md transition-all cursor-pointer text-xs"
                  style={{
                    background: isSelected 
                      ? (activeTheme === 'dark' ? '#FFFFFF' : '#0F172A') 
                      : 'transparent',
                    color: isSelected 
                      ? (activeTheme === 'dark' ? '#0F172A' : '#FFFFFF') 
                      : (activeTheme === 'dark' ? '#94A3B8' : '#64748B'),
                    fontWeight: isSelected ? 700 : 500
                  }}
                >
                  {lang.label}
                </button>
              );
            })}
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-1.5 rounded-lg border transition cursor-pointer"
            style={{
              background: activeTheme === 'dark' ? '#16203A' : '#F1F5F9',
              borderColor: activeTheme === 'dark' ? '#273757' : '#E2E8F0',
              color: activeTheme === 'dark' ? '#F8FAFC' : '#334155'
            }}
            title="Toggle Light/Dark Theme"
            aria-label="Toggle Theme"
          >
            {activeTheme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          {/* Quick Officer Brief Link Button */}
          <button
            type="button"
            onClick={() => handleNavClick('brief-section')}
            className="hidden sm:flex rounded-lg px-3.5 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer items-center gap-1.5"
            style={{
              background: '#FF671F',
              color: '#FFFFFF'
            }}
          >
            <span>{isHindi ? 'अधिकारी ब्रीफ' : 'Officer Brief'}</span>
          </button>

          {/* Mobile Drawer Button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-xl px-6 py-4 animate-fade-rise">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {navItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors ${
                    isActive 
                      ? 'bg-orange-50 text-orange-600 font-bold dark:bg-orange-950/50' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">{isHindi ? 'भाषा:' : 'Language:'}</span>
            <div className="flex gap-1.5 text-xs">
              <button 
                onClick={() => setLanguage('en')} 
                className={`px-3 py-1 rounded-md font-semibold transition ${language === 'en' ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-slate-300'}`}
              >
                English
              </button>
              <button 
                onClick={() => setLanguage('hi')} 
                className={`px-3 py-1 rounded-md font-semibold transition ${language === 'hi' ? 'bg-orange-500 text-white' : 'text-slate-600 dark:text-slate-300'}`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

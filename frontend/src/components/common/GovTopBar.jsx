import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useTheme } from '../../context/ThemeContext';
import { Eye, Sun, Moon, Laptop, Phone } from 'lucide-react';

export const GovTopBar = () => {
  const { currentLang, changeLanguage, t } = useLanguage();
  const { textSize, setFontSize, isHighContrast, toggleContrast } = useAccessibility();
  const { themeMode, cycleTheme } = useTheme();

  const getThemeIcon = () => {
    if (themeMode === 'light') return <Sun size={13} aria-hidden="true" />;
    if (themeMode === 'dark') return <Moon size={13} aria-hidden="true" />;
    return <Laptop size={13} aria-hidden="true" />;
  };

  const getThemeLabel = () => {
    if (themeMode === 'light') return t('theme.light');
    if (themeMode === 'dark') return t('theme.dark');
    return t('theme.system');
  };

  return (
    <aside className="gov-top-bar" aria-label="Government Accessibility Bar">
      <a href="#main-content" className="skip-link">
        {t('accessibility.skip_to_content')}
      </a>

      <div className="container gov-top-bar-content">
        {/* State & Department identification */}
        <div className="gov-emblem-badge">
          <div className="gov-flag-stripe" aria-hidden="true"></div>
          <div>
            <strong>{t('site.govt_title')}</strong> &bull; {t('site.dept_title')}
          </div>
        </div>

        {/* Accessibility & Language Controls */}
        <div className="accessibility-controls">
          {/* Toll Free Helpline */}
          <div style={{ display: 'none', md: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', opacity: 0.9 }}>
            <Phone size={13} aria-hidden="true" />
            <span>155304</span>
          </div>

          {/* Text Size (A-, A, A+) */}
          <div className="control-btn-group" role="group" aria-label={t('accessibility.text_size')}>
            <button
              type="button"
              className={`control-btn ${textSize === 'normal' ? 'active' : ''}`}
              onClick={() => setFontSize('normal')}
              title={t('accessibility.normal_font')}
              aria-label={t('accessibility.normal_font')}
            >
              A
            </button>
            <button
              type="button"
              className={`control-btn ${textSize === 'large' ? 'active' : ''}`}
              onClick={() => setFontSize('large')}
              title={t('accessibility.increase_font')}
              aria-label={t('accessibility.increase_font')}
            >
              A+
            </button>
            <button
              type="button"
              className={`control-btn ${textSize === 'xlarge' ? 'active' : ''}`}
              onClick={() => setFontSize('xlarge')}
              title="A++"
              aria-label="Extra Large Text"
            >
              A++
            </button>
          </div>

          {/* 3-State Theme Toggle (Light / Dark / System) */}
          <button
            type="button"
            className="theme-switcher-btn"
            onClick={cycleTheme}
            title={`${t('theme.toggle_label')}: ${getThemeLabel()} (Click to toggle)`}
            aria-label={`${t('theme.toggle_label')}: ${getThemeLabel()}`}
          >
            {getThemeIcon()}
            <span>{getThemeLabel()}</span>
          </button>

          {/* High Contrast Toggle (Accessibility Override) */}
          <button
            type="button"
            className="control-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: isHighContrast ? '#ffff00' : 'rgba(255,255,255,0.12)',
              color: isHighContrast ? '#000000' : '#ffffff',
              borderRadius: '4px',
              border: isHighContrast ? '1px solid #000' : '1px solid rgba(255,255,255,0.2)'
            }}
            onClick={toggleContrast}
            title={t('accessibility.toggle_contrast')}
            aria-pressed={isHighContrast}
          >
            <Eye size={13} aria-hidden="true" />
            <span style={{ fontSize: '0.75rem' }}>{isHighContrast ? 'Standard' : 'Contrast'}</span>
          </button>

          {/* 3-Language Switcher */}
          <div className="lang-selector" role="group" aria-label={t('accessibility.language')}>
            <button
              type="button"
              className={`lang-btn ${currentLang === 'en' ? 'active' : ''}`}
              onClick={() => changeLanguage('en')}
              aria-pressed={currentLang === 'en'}
            >
              English
            </button>
            <button
              type="button"
              className={`lang-btn ${currentLang === 'hi' ? 'active' : ''}`}
              onClick={() => changeLanguage('hi')}
              aria-pressed={currentLang === 'hi'}
            >
              हिन्दी
            </button>
            <button
              type="button"
              className={`lang-btn ${currentLang === 'hinglish' ? 'active' : ''}`}
              onClick={() => changeLanguage('hinglish')}
              aria-pressed={currentLang === 'hinglish'}
            >
              Hinglish
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

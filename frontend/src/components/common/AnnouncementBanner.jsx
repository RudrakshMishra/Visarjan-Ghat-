import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Info, X, ArrowRight } from 'lucide-react';

export const AnnouncementBanner = ({ onActionClick }) => {
  const { t } = useLanguage();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('ghatwatch_announcement_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('ghatwatch_announcement_dismissed', 'true');
    } catch {}
  };

  if (dismissed) return null;

  return (
    <aside 
      className="announcement-banner"
      role="region"
      aria-label="Important Government Advisory"
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', width: '100%' }}>
        <div className="announcement-content">
          <span className="announcement-badge">
            <Info size={13} aria-hidden="true" />
            {t('announcement.badge')}
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 500, lineHeight: 1.4 }}>
            {t('announcement.text')}
          </span>
          <button
            type="button"
            className="announcement-btn"
            onClick={() => onActionClick('ghats')}
          >
            <span>{t('announcement.action_btn')}</span>
            <ArrowRight size={12} aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          className="announcement-dismiss"
          onClick={handleDismiss}
          title={t('announcement.dismiss')}
          aria-label={t('announcement.dismiss')}
        >
          <X size={16} />
        </button>
      </div>
    </aside>
  );
};

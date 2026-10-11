import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { SAMPLE_GHATS } from '../../data/sampleGhatData';
import { 
  ShieldCheck, 
  Calendar, 
  Search, 
  ArrowRight, 
  CheckCircle, 
  PhoneCall, 
  AlertTriangle,
  Award,
  Zap,
  LifeBuoy
} from 'lucide-react';

export const HeroBanner = ({ onNavigate, onPreFillSlot }) => {
  const { t } = useLanguage();

  // Floating Card Active Tab: 'book' | 'status' | 'track' | 'safety'
  const [activeTab, setActiveTab] = useState('book');

  // Quick Form States
  const [selectedGhat, setSelectedGhat] = useState('bairagarh-kund');
  const [selectedDate, setSelectedDate] = useState('2026-10-20');
  const [selectedTime, setSelectedTime] = useState('16:00 - 18:00');
  const [tokenInput, setTokenInput] = useState('');
  const [trackResult, setTrackResult] = useState(null);

  const handleQuickBook = (e) => {
    e.preventDefault();
    if (onPreFillSlot) {
      onPreFillSlot({
        ghatId: selectedGhat,
        visarjanDate: selectedDate,
        timeSlot: selectedTime
      });
    }
    onNavigate('slot-booking');
  };

  const handleInspectGhat = (e) => {
    e.preventDefault();
    onNavigate('ghats');
  };

  const handleTrackToken = (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    setTrackResult({
      id: tokenInput.trim().toUpperCase(),
      valid: true,
      ghat: SAMPLE_GHATS.find(g => g.id === selectedGhat)?.name || 'Designated Kund',
      status: 'Confirmed & Verified'
    });
  };

  const selectedGhatData = SAMPLE_GHATS.find(g => g.id === selectedGhat);

  return (
    <div className="hero-wrapper" id="top">
      <div className="container">
        {/* Rounded Hero Container (Inspired by IRCTC Redesign B) */}
        <section 
          className="hero-rounded-container"
          aria-labelledby="hero-main-heading"
        >
          {/* Background Image with slow zoom */}
          {/* REPLACE NOTE: Replace '/assets/hero-visarjan.svg' with official high-resolution photo of Bhopal ghat visarjan when available */}
          <img
            src="/assets/hero-visarjan.svg"
            alt="Scenic view of Bhopal Upper Lake Ghat during evening idol visarjan"
            className="hero-bg-image"
            loading="eager"
            width="1600"
            height="900"
          />

          {/* Legibility Gradient Overlay */}
          <div className="hero-gradient-overlay" aria-hidden="true"></div>

          {/* Hero Content with Staggered Entrance */}
          <div className="hero-content">
            {/* Government Directive Badge */}
            <div className="hero-badge reveal-on-scroll is-revealed">
              <ShieldCheck size={16} aria-hidden="true" />
              <span>{t('hero.badge')}</span>
            </div>

            {/* Headline Line by Line */}
            <h1 id="hero-main-heading" className="hero-title reveal-on-scroll is-revealed stagger-1">
              <div>{t('hero.title_line1')}</div>
              <div style={{ color: 'var(--gov-saffron)' }}>{t('hero.title_line2')}</div>
            </h1>

            {/* Subtitle */}
            <p className="hero-subtitle reveal-on-scroll is-revealed stagger-2">
              {t('hero.subtitle')}
            </p>
          </div>
        </section>

        {/* Floating Quick-Services Card (Overlapping bottom edge like IRCTC B) */}
        <div className="floating-card-wrapper reveal-on-scroll is-revealed stagger-3">
          <div className="floating-service-card" role="region" aria-label="Quick Visarjan Services">
            
            {/* Pill Tab Switcher */}
            <div className="pill-tab-switcher" role="tablist" aria-label="Services Navigation">
              <button
                type="button"
                role="tab"
                id="tab-book"
                aria-selected={activeTab === 'book'}
                aria-controls="panel-book"
                className={`pill-tab-btn ${activeTab === 'book' ? 'active' : ''}`}
                onClick={() => { setActiveTab('book'); setTrackResult(null); }}
              >
                <Calendar size={16} aria-hidden="true" />
                <span>{t('hero_tabs.tab_book')}</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-status"
                aria-selected={activeTab === 'status'}
                aria-controls="panel-status"
                className={`pill-tab-btn ${activeTab === 'status' ? 'active' : ''}`}
                onClick={() => { setActiveTab('status'); setTrackResult(null); }}
              >
                <Search size={16} aria-hidden="true" />
                <span>{t('hero_tabs.tab_status')}</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-track"
                aria-selected={activeTab === 'track'}
                aria-controls="panel-track"
                className={`pill-tab-btn ${activeTab === 'track' ? 'active' : ''}`}
                onClick={() => { setActiveTab('track'); setTrackResult(null); }}
              >
                <ShieldCheck size={16} aria-hidden="true" />
                <span>{t('hero_tabs.tab_track')}</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-safety"
                aria-selected={activeTab === 'safety'}
                aria-controls="panel-safety"
                className={`pill-tab-btn ${activeTab === 'safety' ? 'active' : ''}`}
                onClick={() => { setActiveTab('safety'); setTrackResult(null); }}
              >
                <PhoneCall size={16} aria-hidden="true" />
                <span>{t('hero_tabs.tab_safety')}</span>
              </button>
            </div>

            {/* TAB PANEL 1: Book Slot */}
            {activeTab === 'book' && (
              <form id="panel-book" role="tabpanel" aria-labelledby="tab-book" onSubmit={handleQuickBook} className="floating-inputs-grid">
                <div>
                  <label htmlFor="quick-ghat-select" className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>
                    {t('hero_tabs.select_ghat_prompt')}
                  </label>
                  <select
                    id="quick-ghat-select"
                    className="pill-input"
                    value={selectedGhat}
                    onChange={(e) => setSelectedGhat(e.target.value)}
                  >
                    {SAMPLE_GHATS.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="quick-date-select" className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>
                    {t('hero_tabs.select_date_prompt')}
                  </label>
                  <input
                    id="quick-date-select"
                    type="date"
                    className="pill-input"
                    value={selectedDate}
                    min="2026-10-15"
                    max="2026-10-25"
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="quick-time-select" className="visually-hidden" style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden' }}>
                    {t('hero_tabs.time_window')}
                  </label>
                  <select
                    id="quick-time-select"
                    className="pill-input"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  >
                    <option value="16:00 - 18:00">16:00 - 18:00 (Sunset Peak)</option>
                    <option value="10:00 - 12:00">10:00 - 12:00 (Morning)</option>
                    <option value="12:00 - 14:00">12:00 - 14:00 (Afternoon)</option>
                    <option value="18:00 - 20:00">18:00 - 20:00 (Evening)</option>
                  </select>
                </div>

                <div>
                  <button type="submit" className="pill-btn-primary" style={{ width: '100%' }}>
                    <span>{t('hero_tabs.find_slot_btn')}</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </form>
            )}

            {/* TAB PANEL 2: Check Ghat Status */}
            {activeTab === 'status' && (
              <form id="panel-status" role="tabpanel" aria-labelledby="tab-status" onSubmit={handleInspectGhat} className="floating-inputs-grid">
                <div style={{ gridColumn: 'span 2' }}>
                  <select
                    className="pill-input"
                    value={selectedGhat}
                    onChange={(e) => setSelectedGhat(e.target.value)}
                    aria-label="Select Ghat to Inspect"
                  >
                    {SAMPLE_GHATS.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.name} — Status: {g.diagnosisTag}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', padding: '0 0.5rem' }}>
                  {selectedGhatData && (
                    <span>
                      DO: <strong>{selectedGhatData.readings.during.do ?? 'N/A'} mg/L</strong> &bull; Priority: {selectedGhatData.priority}
                    </span>
                  )}
                </div>

                <div>
                  <button type="submit" className="pill-btn-primary" style={{ width: '100%' }}>
                    <span>{t('hero_tabs.check_quality_btn')}</span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </div>
              </form>
            )}

            {/* TAB PANEL 3: Track E-Pass */}
            {activeTab === 'track' && (
              <div id="panel-track" role="tabpanel" aria-labelledby="tab-track">
                <form onSubmit={handleTrackToken} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <input
                      type="text"
                      className="pill-input"
                      placeholder={t('hero_tabs.track_pass_placeholder')}
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      aria-label="Token Reference ID"
                    />
                  </div>
                  <button type="submit" className="pill-btn-primary">
                    <Search size={16} aria-hidden="true" />
                    <span>{t('hero_tabs.track_pass_btn')}</span>
                  </button>
                </form>

                {trackResult && (
                  <div style={{ marginTop: '1rem', padding: '0.85rem 1.25rem', background: 'var(--status-success-bg)', border: '1px solid var(--status-success)', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--status-success)' }}>
                    <CheckCircle size={20} />
                    <div style={{ fontSize: '0.9rem' }}>
                      <strong>{t('hero_tabs.pass_found_title')}: {trackResult.id}</strong> — {trackResult.ghat}. {t('hero_tabs.pass_sample_msg')}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB PANEL 4: Safety & Helpline */}
            {activeTab === 'safety' && (
              <div id="panel-safety" role="tabpanel" aria-labelledby="tab-safety" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <PhoneCall size={18} color="var(--gov-saffron)" />
                    <span>{t('hero_tabs.safety_phone_1')}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <AlertTriangle size={18} color="#ef4444" />
                    <span>{t('hero_tabs.safety_phone_2')}</span>
                  </div>
                </div>

                <a href="tel:155304" className="pill-btn-primary" style={{ textDecoration: 'none' }}>
                  <PhoneCall size={15} />
                  <span>{t('hero_tabs.call_now')}</span>
                </a>
              </div>
            )}

            {/* Trust & Reassurance Strip (Inspired by IRCTC B) */}
            <div className="trust-strip" role="list" aria-label="Municipal Reassurance Standards">
              <div className="trust-item" role="listitem">
                <CheckCircle size={16} className="trust-icon" aria-hidden="true" />
                <span>{t('trust_strip.point1')}</span>
              </div>
              <div className="trust-item" role="listitem">
                <Zap size={16} className="trust-icon" aria-hidden="true" />
                <span>{t('trust_strip.point2')}</span>
              </div>
              <div className="trust-item" role="listitem">
                <Award size={16} className="trust-icon" aria-hidden="true" />
                <span>{t('trust_strip.point3')}</span>
              </div>
              <div className="trust-item" role="listitem">
                <LifeBuoy size={16} className="trust-icon" aria-hidden="true" />
                <span>{t('trust_strip.point4')}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

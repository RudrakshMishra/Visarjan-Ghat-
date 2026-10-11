import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Phone, Mail, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

export const GovFooter = () => {
  const { t } = useLanguage();

  return (
    <footer id="footer-slide" className="gov-footer" role="contentinfo">
      <div className="container">
        {/* Top Footer Columns */}
        <div className="footer-top">
          {/* Column 1: Government Identity & Notice */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <img
                src="/assets/emblem-placeholder.svg"
                alt={t('footer.emblem_alt')}
                width="40"
                height="40"
                style={{ filter: 'brightness(1.2)' }}
              />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#ffffff' }}>
                  {t('site.govt_title')}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {t('site.dept_title')}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', lineHeight: 1.6, color: '#cbd5e1', marginBottom: '1rem' }}>
              {t('footer.disclaimer_gov')}
            </p>

            {/* Crucial Sample Warning */}
            <div style={{ background: 'rgba(255, 103, 31, 0.15)', borderLeft: '3px solid var(--gov-saffron)', padding: '0.65rem 0.9rem', borderRadius: '4px', fontSize: '0.785rem', color: '#ffb088' }}>
              <strong>NOTICE:</strong> {t('footer.sample_warning')}
            </div>
          </div>

          {/* Column 2: Essential Links & Policies */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
              Essential Links & Policies
            </h3>
            <ul className="footer-links">
              <li>
                <a href="#accessibility" className="footer-link">
                  {t('footer.links_accessibility')}
                </a>
              </li>
              <li>
                <a href="#privacy" className="footer-link">
                  {t('footer.links_privacy')}
                </a>
              </li>
              <li>
                <a href="#terms" className="footer-link">
                  {t('footer.links_terms')}
                </a>
              </li>
              <li>
                <a href="https://www.mppcb.mp.gov.in" target="_blank" rel="noopener noreferrer" className="footer-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span>MPPCB Official Portal</span>
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              </li>
              <li>
                <a href="https://cpcb.nic.in" target="_blank" rel="noopener noreferrer" className="footer-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span>CPCB Guidelines (Class B)</span>
                  <ExternalLink size={12} aria-hidden="true" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Emergency Contacts */}
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '1rem' }}>
              Contact & Helplines
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <MapPin size={16} color="var(--gov-saffron)" style={{ flexShrink: 0, marginTop: '3px' }} aria-hidden="true" />
                <span>Bhopal Municipal Corporation, Harshwardhan Complex, Mata Mandir, Bhopal - 462003</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Phone size={16} color="var(--gov-saffron)" style={{ flexShrink: 0 }} aria-hidden="true" />
                <span>Citizen Helpline: <strong>155304</strong> (Toll Free)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Phone size={16} color="#ef4444" style={{ flexShrink: 0 }} aria-hidden="true" />
                <span>Disaster Control Room: <strong>1077 / 0755-2540220</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Mail size={16} color="var(--gov-saffron)" style={{ flexShrink: 0 }} aria-hidden="true" />
                <span>commissioner@bmconline.gov.in</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div>
            {t('footer.copyright')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} color="var(--gov-green)" aria-hidden="true" />
            <span>{t('footer.accessibility_stmt')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

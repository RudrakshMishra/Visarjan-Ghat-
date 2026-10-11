import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { CheckCircle2, XCircle, Leaf, ShieldAlert } from 'lucide-react';

export const GuidelinesSection = () => {
  const { t } = useLanguage();

  const dos = [
    t('guidelines.do_1'),
    t('guidelines.do_2'),
    t('guidelines.do_3'),
    t('guidelines.do_4')
  ];

  const donts = [
    t('guidelines.dont_1'),
    t('guidelines.dont_2'),
    t('guidelines.dont_3'),
    t('guidelines.dont_4')
  ];

  return (
    <section id="guidelines-slide" className="slide-section section" aria-labelledby="guidelines-heading">
      <div className="container">
        {/* Section Heading */}
        <div style={{ textAlign: 'center', maxWidth: '750px', margin: '0 auto 2.5rem auto' }}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 mb-3">
            <Leaf size={14} aria-hidden="true" />
            <span>Slide 5: NGT Eco-Immersion Protocol & Nirmalya Care</span>
          </div>
          <h2 id="guidelines-heading" className="font-display" style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {t('guidelines.title')}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('guidelines.subtitle')}
          </p>
        </div>

        {/* Dos & Don'ts Grid */}
        <div className="grid-cols-2">
          {/* What to Do */}
          <div className="card" style={{ borderTop: '5px solid var(--gov-green)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', color: 'var(--gov-green)' }}>
              <CheckCircle2 size={24} aria-hidden="true" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gov-navy-800)' }}>
                {t('guidelines.dos_title')}
              </h3>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {dos.map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  <div style={{ color: 'var(--gov-green)', marginTop: '3px', flexShrink: 0 }}>
                    <CheckCircle2 size={18} />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* What NOT to Do */}
          <div className="card" style={{ borderTop: '5px solid var(--status-critical)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', color: 'var(--status-critical)' }}>
              <XCircle size={24} aria-hidden="true" />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gov-navy-800)' }}>
                {t('guidelines.donts_title')}
              </h3>
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {donts.map((item, idx) => (
                <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.95rem', lineHeight: 1.5 }}>
                  <div style={{ color: 'var(--status-critical)', marginTop: '3px', flexShrink: 0 }}>
                    <XCircle size={18} />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

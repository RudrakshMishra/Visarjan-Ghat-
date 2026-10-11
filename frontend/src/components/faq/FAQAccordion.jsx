import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react';

export const FAQAccordion = () => {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState(0); // Open first item by default
  const [faqSearch, setFaqSearch] = useState('');

  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
    { q: t('faq.q5'), a: t('faq.a5') }
  ];

  const filteredFaqs = faqs.filter(item => {
    if (!faqSearch.trim()) return true;
    const term = faqSearch.toLowerCase();
    return item.q.toLowerCase().includes(term) || item.a.toLowerCase().includes(term);
  });

  const toggleAccordion = (index) => {
    setOpenIndex(prev => prev === index ? -1 : index);
  };

  return (
    <section id="faq-slide" className="slide-section section" aria-labelledby="faq-heading" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container" style={{ maxWidth: '850px' }}>
        {/* Section Heading */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 mb-3">
            <HelpCircle size={14} aria-hidden="true" />
            <span>Slide 9: Citizen Questions & NGT Compliance Support</span>
          </div>
          <h2 id="faq-heading" className="font-display" style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {t('faq.title')}
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            {t('faq.subtitle')}
          </p>
        </div>

        {/* Search FAQs */}
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} aria-hidden="true" />
          <input
            type="search"
            className="form-input"
            style={{ paddingLeft: '2.5rem' }}
            placeholder={t('faq.search_faq')}
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
            aria-label={t('faq.search_faq')}
          />
        </div>

        {/* Accordion List */}
        <div role="region" aria-label="Frequently Asked Questions">
          {filteredFaqs.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              No FAQs matched your query.
            </div>
          ) : (
            filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              const headingId = `faq-heading-${index}`;
              const contentId = `faq-content-${index}`;

              return (
                <div key={index} className="accordion-item">
                  <h3>
                    <button
                      type="button"
                      id={headingId}
                      className="accordion-trigger"
                      onClick={() => toggleAccordion(index)}
                      aria-expanded={isOpen}
                      aria-controls={contentId}
                    >
                      <span>{faq.q}</span>
                      <span style={{ color: 'var(--gov-navy-600)', flexShrink: 0, marginLeft: '0.75rem' }} aria-hidden="true">
                        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </span>
                    </button>
                  </h3>
                  {isOpen && (
                    <div
                      id={contentId}
                      className="accordion-content"
                      role="region"
                      aria-labelledby={headingId}
                    >
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

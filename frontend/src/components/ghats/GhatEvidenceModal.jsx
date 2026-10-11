import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { X, ExternalLink, FileCheck, AlertCircle } from 'lucide-react';

export const GhatEvidenceModal = ({ ghat, onClose }) => {
  const { t } = useLanguage();
  const modalRef = useRef(null);

  useEffect(() => {
    // Focus modal and handle Escape key
    if (modalRef.current) {
      modalRef.current.focus();
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!ghat) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="modal-container" 
        onClick={(e) => e.stopPropagation()}
        tabIndex="-1"
        ref={modalRef}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileCheck size={22} color="var(--gov-saffron)" aria-hidden="true" />
            <div>
              <h2 id="modal-title" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gov-navy-800)' }}>
                {t('modal.title')}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {ghat.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="control-btn"
            onClick={onClose}
            aria-label={t('modal.close')}
            style={{ color: 'var(--text-primary)', padding: '0.4rem', border: '1px solid var(--border-color)', borderRadius: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Source report reference card */}
          <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
              {t('modal.source_report')}: {ghat.evidence.reportYear} ({ghat.evidence.festival})
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong>{t('modal.page_ref')}</strong> Page {ghat.evidence.pdfPage}
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontStyle: 'italic' }}>
              "{ghat.evidence.printedNote}"
            </p>
          </div>

          {/* Phase-wise measured readings */}
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--gov-navy-800)' }}>
            Recorded Water Quality Measurements (mg/L)
          </h3>
          <div className="table-responsive" style={{ marginBottom: '1.25rem' }}>
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Phase</th>
                  <th>DO (mg/L)</th>
                  <th>BOD (mg/L)</th>
                  <th>pH</th>
                  <th>Turbidity (NTU)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>{t('modal.phase_pre')}</strong></td>
                  <td>{ghat.readings.pre.do !== null ? `${ghat.readings.pre.do}` : 'Not Sampled'}</td>
                  <td>{ghat.readings.pre.bod !== null ? `${ghat.readings.pre.bod}` : 'Not Sampled'}</td>
                  <td>{ghat.readings.pre.ph !== null ? `${ghat.readings.pre.ph}` : 'Not Sampled'}</td>
                  <td>{ghat.readings.pre.turbidity !== null ? `${ghat.readings.pre.turbidity}` : 'Not Sampled'}</td>
                </tr>
                <tr>
                  <td><strong>{t('modal.phase_during')}</strong></td>
                  <td>{ghat.readings.during.do !== null ? `${ghat.readings.during.do}` : 'Not Sampled'}</td>
                  <td>{ghat.readings.during.bod !== null ? `${ghat.readings.during.bod}` : 'Not Sampled'}</td>
                  <td>{ghat.readings.during.ph !== null ? `${ghat.readings.during.ph}` : 'Not Sampled'}</td>
                  <td>{ghat.readings.during.turbidity !== null ? `${ghat.readings.during.turbidity}` : 'Not Sampled'}</td>
                </tr>
                <tr>
                  <td><strong>{t('modal.phase_post')}</strong></td>
                  <td>{ghat.readings.post.do !== null ? `${ghat.readings.post.do}` : 'Not Sampled'}</td>
                  <td>{ghat.readings.post.bod !== null ? `${ghat.readings.post.bod}` : 'Not Sampled'}</td>
                  <td>{ghat.readings.post.ph !== null ? `${ghat.readings.post.ph}` : 'Not Sampled'}</td>
                  <td>{ghat.readings.post.turbidity !== null ? `${ghat.readings.post.turbidity}` : 'Not Sampled'}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Heavy metals watch */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
              <AlertCircle size={16} color="var(--gov-navy-600)" aria-hidden="true" />
              <span>{t('modal.metals_title')}</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              {t('modal.metals_note')}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '4px' }}>
                <div>Chromium (Cr)</div>
                <strong>{ghat.metals.chromium}</strong>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '4px' }}>
                <div>Lead (Pb)</div>
                <strong>{typeof ghat.metals.lead === 'number' ? `${ghat.metals.lead} mg/L` : ghat.metals.lead}</strong>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '4px' }}>
                <div>Zinc (Zn)</div>
                <strong>{typeof ghat.metals.zinc === 'number' ? `${ghat.metals.zinc} mg/L` : ghat.metals.zinc}</strong>
              </div>
              <div style={{ background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '4px' }}>
                <div>Copper (Cu)</div>
                <strong>{typeof ghat.metals.copper === 'number' ? `${ghat.metals.copper} mg/L` : ghat.metals.copper}</strong>
              </div>
            </div>
            {ghat.metals.spikeNotice && (
              <p style={{ fontSize: '0.8rem', color: 'var(--status-warning)', marginTop: '0.5rem', fontWeight: 600 }}>
                &bull; {ghat.metals.spikeNotice}
              </p>
            )}
          </div>

          {/* Open source PDF button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onClose}
            >
              {t('modal.close')}
            </button>
            <a
              href={ghat.evidence.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm"
            >
              <span>{t('modal.open_pdf')}</span>
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

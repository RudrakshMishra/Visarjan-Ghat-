import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { TESTING_CHECKLIST_2026, SAMPLE_GHATS } from '../../data/sampleGhatData';
import { ShieldCheck, Share2, Printer, Check, AlertTriangle, FileText, Download } from 'lucide-react';

export const OfficerBriefView = () => {
  const { t, currentLang } = useLanguage();
  const [copied, setCopied] = useState(false);

  const top3Ghats = SAMPLE_GHATS.slice(0, 3);

  // Generate WhatsApp text representation of the verified brief
  const whatsappText = `*BHOPAL MUNICIPAL CORPORATION - VISARJAN WATER QUALITY BRIEF (2026)*\n` +
    `_Evaluated against CPCB Class B Bathing Standards_\n\n` +
    `*TOP ATTENTION GHATS:*\n` +
    `1. *Bairagarh (Sant Hirdaram) Kund*: Chronic low DO (0.0 mg/L recorded in 2025 during immersion). Action: Surface Aerators.\n` +
    `2. *Shahpura Lake Ghat*: Event-linked DO drop (5.6 -> 2.4 mg/L). Action: Immediate Debris & Flower Clearance.\n` +
    `3. *Khatlapura Ghat*: Persisting high BOD (7.5 mg/L post 7 days). Action: Bio-Enzymes & Aeration.\n\n` +
    `*CRITICAL DATA BLINDSPOT:*\n` +
    `Malikhedi and Bairagarh lack baseline pre-immersion tests in 2024/25. Classified as "Unknown, Test First" (Never assumed clean).\n\n` +
    `*MANDATORY TESTING SCHEDULE (DURGA 2026):*\n` +
    `- Pre-Immersion: 17-18 Oct 2026\n` +
    `- Peak Visarjan: 20 Oct 2026\n` +
    `- Post-Immersion: 27-28 Oct 2026\n\n` +
    `_Claim Guard: 100% Numbers verified against MPPCB reports. 0 Health claims._`;

  const handleCopyWhatsapp = () => {
    navigator.clipboard.writeText(whatsappText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  return (
    <section id="officer-slide" className="slide-section section" aria-labelledby="officer-heading">
      <div className="container">
        {/* Section Heading */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem' }}>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 mb-3">
              <FileText size={14} aria-hidden="true" />
              <span>Slide 7: Municipal Decision Brief & Claim Guard</span>
            </div>
            <h2 id="officer-heading" className="font-display" style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              {t('officer.title')}
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              {t('officer.subtitle')}
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleCopyWhatsapp}
            >
              {copied ? <Check size={16} /> : <Share2 size={16} />}
              <span>{copied ? t('officer.copied') : t('officer.copy_whatsapp_btn')}</span>
            </button>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => window.print()}
            >
              <Printer size={16} />
              <span>{t('officer.export_brief_btn')}</span>
            </button>
          </div>
        </div>

        {/* Claim Guard Verification Badge */}
        <div 
          style={{ 
            backgroundColor: 'var(--status-success-bg)', 
            border: '1px solid var(--status-success)', 
            borderRadius: '8px', 
            padding: '0.85rem 1.25rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            marginBottom: '1.5rem',
            color: 'var(--status-success)',
            fontWeight: 700,
            fontSize: '0.9rem'
          }}
          role="status"
        >
          <ShieldCheck size={22} aria-hidden="true" />
          <span>{t('officer.badge_claim_guard')}</span>
        </div>

        {/* Brief Card Container */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem', border: '2px solid var(--border-color)' }}>
          {/* Top 3 High Attention Ghats */}
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gov-navy-900)', marginBottom: '1rem', borderBottom: '2px solid var(--gov-saffron)', paddingBottom: '0.5rem' }}>
            {t('officer.top_3_heading')}
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            {top3Ghats.map((ghat) => (
              <div 
                key={ghat.id}
                style={{
                  background: 'var(--bg-secondary)',
                  borderLeft: `4px solid ${ghat.rank === 1 ? 'var(--status-critical)' : 'var(--status-warning)'}`,
                  padding: '1rem',
                  borderRadius: '0 8px 8px 0'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                    Rank {ghat.rank}: {ghat.name}
                  </div>
                  <span className={`badge ${ghat.rank === 1 ? 'badge-critical' : 'badge-warning'}`}>
                    {t(`ghats.${ghat.tagLabelKey}`)}
                  </span>
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  <strong>Recorded Evidence:</strong> {ghat.evidence.printedNote} (Ref: MPPCB Report {ghat.evidence.reportYear}, Page {ghat.evidence.pdfPage})
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--gov-navy-700)', fontWeight: 600 }}>
                  <strong>Recommended Action:</strong> {t(`ghats.${ghat.actionKey}`)}
                </div>
              </div>
            ))}
          </div>

          {/* Gaps & Blindspots */}
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gov-navy-900)', marginBottom: '1rem', borderBottom: '2px solid var(--status-warning)', paddingBottom: '0.5rem' }}>
            {t('officer.gap_heading')}
          </h3>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '1rem', marginBottom: '2rem', color: '#92400e' }}>
            <p style={{ fontSize: '0.925rem', lineHeight: 1.6 }}>
              &bull; <strong>Bairagarh (Sant Hirdaram) Kund</strong> and <strong>Malikhedi Dedicated Immersion Kund</strong> lack baseline pre-immersion or post-immersion rows in official 2024/2025 release tables.<br />
              &bull; <strong>Protocol rule:</strong> Missing data is tagged as <em>"Unknown (Test First)"</em>. Under no circumstances should unmeasured cells be assumed compliant or clean.
            </p>
          </div>

          {/* Durga Visarjan 2026 Testing Checklist */}
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gov-navy-900)', marginBottom: '1rem', borderBottom: '2px solid var(--gov-green)', paddingBottom: '0.5rem' }}>
            {t('officer.checklist_heading')}
          </h3>
          <div className="table-responsive">
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Target Immersion Site</th>
                  <th>Testing Schedule / Window</th>
                  <th>Mandatory Parameters</th>
                  <th>Regulatory Operational Reason</th>
                </tr>
              </thead>
              <tbody>
                {TESTING_CHECKLIST_2026.map((item, idx) => (
                  <tr key={idx}>
                    <td><strong>{item.site}</strong></td>
                    <td style={{ color: 'var(--gov-navy-700)', fontWeight: 600 }}>{item.phase}</td>
                    <td>{item.parameters}</td>
                    <td style={{ fontSize: '0.85rem' }}>{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

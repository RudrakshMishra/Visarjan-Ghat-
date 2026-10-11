import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { SAMPLE_GHATS, CPCB_CLASS_B_LIMITS } from '../../data/sampleGhatData';
import { Search, FileText, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { GhatEvidenceModal } from './GhatEvidenceModal';

export const GhatTable = () => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all'); // 'all', 'critical', 'acceptable'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGhat, setSelectedGhat] = useState(null);

  const getTagBadgeClass = (tag) => {
    switch (tag) {
      case 'CHRONIC':
      case 'EVENT_LINKED':
        return 'badge-critical';
      case 'PERSISTING':
      case 'UNKNOWN_TEST_FIRST':
        return 'badge-warning';
      case 'TRANSIENT':
      case 'OK':
        return 'badge-success';
      default:
        return 'badge-unknown';
    }
  };

  const filteredGhats = SAMPLE_GHATS.filter((ghat) => {
    // Filter by tab
    if (filter === 'critical' && !['CHRONIC', 'EVENT_LINKED', 'PERSISTING', 'UNKNOWN_TEST_FIRST'].includes(ghat.diagnosisTag)) {
      return false;
    }
    if (filter === 'acceptable' && ['CHRONIC', 'EVENT_LINKED'].includes(ghat.diagnosisTag)) {
      return false;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ghat.name.toLowerCase().includes(q) ||
        ghat.waterBody.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <section id="ghats-slide" className="slide-section section" aria-labelledby="ghats-heading">
      <div className="container">
        {/* Slide 3 Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 mb-3">
          <span>Slide 3: CPCB Class B Water Quality Risk Matrix</span>
        </div>
        {/* Section Heading */}
        <div style={{ marginBottom: '1.75rem' }}>
          <h2 id="ghats-heading" className="font-display" style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
            {t('ghats.section_title')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            {t('ghats.section_desc')} ({t('ghats.do_limit_note')} &bull; {t('ghats.bod_limit_note')})
          </p>
        </div>

        {/* Filter and Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '0.5rem' }} role="group" aria-label="Filter Ghats">
            <button
              type="button"
              className={`control-btn ${filter === 'all' ? 'active' : ''}`}
              style={{
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                border: '1px solid var(--border-color)',
                color: filter === 'all' ? '#ffffff' : 'var(--text-primary)'
              }}
              onClick={() => setFilter('all')}
            >
              {t('ghats.filter_all')} ({SAMPLE_GHATS.length})
            </button>
            <button
              type="button"
              className={`control-btn ${filter === 'critical' ? 'active' : ''}`}
              style={{
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                border: '1px solid var(--border-color)',
                color: filter === 'critical' ? '#ffffff' : 'var(--text-primary)'
              }}
              onClick={() => setFilter('critical')}
            >
              {t('ghats.filter_critical')}
            </button>
            <button
              type="button"
              className={`control-btn ${filter === 'acceptable' ? 'active' : ''}`}
              style={{
                borderRadius: '6px',
                padding: '0.5rem 1rem',
                border: '1px solid var(--border-color)',
                color: filter === 'acceptable' ? '#ffffff' : 'var(--text-primary)'
              }}
              onClick={() => setFilter('acceptable')}
            >
              {t('ghats.filter_acceptable')}
            </button>
          </div>

          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '280px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} aria-hidden="true" />
            <input
              type="search"
              className="form-input"
              style={{ paddingLeft: '2.4rem' }}
              placeholder={t('ghats.search_label')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={t('ghats.search_label')}
            />
          </div>
        </div>

        {/* Responsive Table */}
        <div className="table-responsive">
          <table className="gov-table" aria-label={t('ghats.section_title')}>
            <thead>
              <tr>
                <th scope="col">{t('ghats.th_rank')}</th>
                <th scope="col">{t('ghats.th_ghat')}</th>
                <th scope="col">{t('ghats.th_do')}</th>
                <th scope="col">{t('ghats.th_bod')}</th>
                <th scope="col">{t('ghats.th_ph')}</th>
                <th scope="col">{t('ghats.th_status')}</th>
                <th scope="col">{t('ghats.th_action')}</th>
                <th scope="col">{t('ghats.view_evidence')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredGhats.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No ghats found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredGhats.map((ghat) => {
                  const doReading = ghat.readings.during.do;
                  const bodReading = ghat.readings.during.bod;
                  const phReading = ghat.readings.during.ph;

                  const isDoFail = doReading !== null && doReading < CPCB_CLASS_B_LIMITS.do_min;
                  const isBodFail = bodReading !== null && bodReading > CPCB_CLASS_B_LIMITS.bod_max;

                  return (
                    <tr key={ghat.id}>
                      {/* Priority Rank */}
                      <td>
                        <span 
                          style={{ 
                            display: 'inline-flex',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: ghat.rank <= 2 ? 'var(--status-critical-bg)' : 'var(--bg-secondary)',
                            color: ghat.rank <= 2 ? 'var(--status-critical)' : 'var(--text-primary)',
                            fontWeight: 700,
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '1px solid var(--border-color)'
                          }}
                        >
                          {ghat.rank}
                        </span>
                      </td>

                      {/* Ghat Name & Water body */}
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {ghat.name}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {ghat.waterBody}
                        </div>
                      </td>

                      {/* Dissolved Oxygen during immersion */}
                      <td>
                        {doReading !== null ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontWeight: 700, color: isDoFail ? 'var(--status-critical)' : 'var(--status-success)' }}>
                              {doReading} mg/L
                            </span>
                            {isDoFail && (
                              <span title="Below CPCB Class B limit (Min 5.0 mg/L)" style={{ color: 'var(--status-critical)', display: 'inline-flex' }}>
                                <AlertTriangle size={15} />
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                            Not Sampled
                          </span>
                        )}
                      </td>

                      {/* Biochemical Oxygen Demand */}
                      <td>
                        {bodReading !== null ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontWeight: 700, color: isBodFail ? 'var(--status-critical)' : 'var(--status-success)' }}>
                              {bodReading} mg/L
                            </span>
                            {isBodFail && (
                              <span title="Exceeds CPCB Class B limit (Max 3.0 mg/L)" style={{ color: 'var(--status-critical)', display: 'inline-flex' }}>
                                <AlertTriangle size={15} />
                              </span>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                            Not Sampled
                          </span>
                        )}
                      </td>

                      {/* pH Level */}
                      <td>
                        {phReading !== null ? (
                          <span style={{ fontWeight: 600 }}>
                            {phReading}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '0.85rem' }}>
                            Not Sampled
                          </span>
                        )}
                      </td>

                      {/* Status Tag */}
                      <td>
                        <span className={`badge ${getTagBadgeClass(ghat.diagnosisTag)}`}>
                          {t(`ghats.${ghat.tagLabelKey}`)}
                        </span>
                      </td>

                      {/* Recommended Action */}
                      <td>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {t(`ghats.${ghat.actionKey}`)}
                        </span>
                      </td>

                      {/* Evidence Button */}
                      <td>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setSelectedGhat(ghat)}
                          title={`${t('ghats.view_evidence')} for ${ghat.name}`}
                          aria-label={`${t('ghats.view_evidence')} for ${ghat.name}`}
                        >
                          <FileText size={14} aria-hidden="true" />
                          <span>{t('ghats.view_evidence')}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Legend notes */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <div>&bull; <strong>CPCB Class B Limits:</strong> DO &ge; 5.0 mg/L, BOD &le; 3.0 mg/L, pH 6.5 - 8.5.</div>
          <div>&bull; <strong>Blanks / Missing:</strong> Represent uncollected samples, never assumed clean.</div>
          <div>&bull; <strong>Confidence:</strong> Low coverage flags mandatory testing before Durga Visarjan.</div>
        </div>
      </div>

      {/* Modal instance */}
      <GhatEvidenceModal
        ghat={selectedGhat}
        onClose={() => setSelectedGhat(null)}
      />
    </section>
  );
};

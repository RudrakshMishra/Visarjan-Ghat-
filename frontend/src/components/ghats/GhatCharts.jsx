import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { SAMPLE_GHATS } from '../../data/sampleGhatData';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Table } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export const GhatCharts = () => {
  const { t } = useLanguage();
  const { activeTheme } = useTheme();
  const [showAccessibleTable, setShowAccessibleTable] = useState(false);

  const isDark = activeTheme === 'dark';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)';
  const textColor = isDark ? '#CBD5E1' : '#475569';

  // Labels for the 7 ghats
  const ghatLabels = SAMPLE_GHATS.map(g => g.name.split(' ')[0]);

  // DO Bar Chart Data (Pre vs During vs Post)
  const doChartData = {
    labels: ghatLabels,
    datasets: [
      {
        label: 'Pre-Immersion (Baseline)',
        data: SAMPLE_GHATS.map(g => g.readings.pre.do || 0),
        backgroundColor: isDark ? '#22C55E' : '#046A38',
        borderRadius: 4
      },
      {
        label: 'During Immersion (Peak)',
        data: SAMPLE_GHATS.map(g => g.readings.during.do || 0),
        backgroundColor: isDark ? '#F87171' : '#DC2626',
        borderRadius: 4
      },
      {
        label: 'Post-Immersion (7 Days)',
        data: SAMPLE_GHATS.map(g => g.readings.post.do || 0),
        backgroundColor: isDark ? '#60A5FA' : '#2563EB',
        borderRadius: 4
      }
    ]
  };

  const doChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: '600' } }
      },
      tooltip: {
        backgroundColor: isDark ? '#1E293B' : '#0F172A',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        borderColor: isDark ? '#334155' : '#E2E8F0',
        borderWidth: 1,
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.raw} mg/L (CPCB Limit: >= 5.0)`
        }
      }
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor, font: { family: 'Plus Jakarta Sans' } }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Dissolved Oxygen (mg/L)', color: textColor },
        grid: { color: gridColor },
        ticks: { color: textColor }
      }
    }
  };

  // BOD Line Chart Data
  const bodChartData = {
    labels: ghatLabels,
    datasets: [
      {
        label: 'BOD Peak Immersion (mg/L)',
        data: SAMPLE_GHATS.map(g => g.readings.during.bod || 0),
        borderColor: isDark ? '#FBBF24' : '#D97706',
        backgroundColor: isDark ? 'rgba(251, 191, 36, 0.15)' : 'rgba(217, 119, 6, 0.12)',
        fill: true,
        tension: 0.35,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: isDark ? '#FBBF24' : '#D97706'
      }
    ]
  };

  const bodChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: { color: textColor, font: { family: 'Plus Jakarta Sans', weight: '600' } }
      },
      tooltip: {
        backgroundColor: isDark ? '#1E293B' : '#0F172A',
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        callbacks: {
          label: (context) => `BOD: ${context.raw} mg/L (CPCB Safe Limit: <= 3.0)`
        }
      }
    },
    scales: {
      x: {
        grid: { color: gridColor },
        ticks: { color: textColor }
      },
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Biochemical Oxygen Demand (mg/L)', color: textColor },
        grid: { color: gridColor },
        ticks: { color: textColor }
      }
    }
  };

  // Doughnut Chart
  const doughnutData = {
    labels: [
      t('ghats.tag_chronic'),
      t('ghats.tag_event'),
      t('ghats.tag_persisting'),
      t('ghats.tag_transient'),
      t('ghats.tag_ok'),
      t('ghats.tag_unknown')
    ],
    datasets: [
      {
        data: [2, 1, 1, 1, 1, 1],
        backgroundColor: [
          isDark ? '#F87171' : '#DC2626',
          isDark ? '#FB923C' : '#EA580C',
          isDark ? '#FBBF24' : '#D97706',
          isDark ? '#60A5FA' : '#2563EB',
          isDark ? '#4ADE80' : '#046A38',
          isDark ? '#94A3B8' : '#64748B'
        ],
        borderWidth: 2,
        borderColor: isDark ? '#16203A' : '#FFFFFF'
      }
    ]
  };

  return (
    <section id="analytics-slide" className="slide-section section" aria-labelledby="analytics-heading" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container">
        {/* Slide 4 Tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 mb-3">
          <span>Slide 4: Interactive Water Quality Telemetry & Trends</span>
        </div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
          <div>
            <h2 id="analytics-heading" className="font-display" style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              {t('analytics.title')}
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              {t('analytics.subtitle')}
            </p>
          </div>

          {/* Toggle Screen Reader Accessible Table */}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setShowAccessibleTable(prev => !prev)}
            aria-expanded={showAccessibleTable}
          >
            <Table size={16} aria-hidden="true" />
            <span>{t('analytics.accessible_toggle')}</span>
          </button>
        </div>

        {/* Charts Grid */}
        <div className="grid-cols-2" style={{ marginBottom: '2.5rem' }}>
          {/* Chart 1: DO Comparison */}
          <div className="card" style={{ height: '390px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              {t('analytics.chart_do_title')}
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              * Horizontal baseline: CPCB Class B requires minimum 5.0 mg/L.
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <Bar data={doChartData} options={doChartOptions} aria-label={t('analytics.chart_do_title')} />
            </div>
          </div>

          {/* Chart 2: BOD Trend */}
          <div className="card" style={{ height: '390px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              {t('analytics.chart_bod_title')}
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              * Spikes above 3.0 mg/L indicate high organic decomposition load.
            </div>
            <div style={{ flex: 1, position: 'relative' }}>
              <Line data={bodChartData} options={bodChartOptions} aria-label={t('analytics.chart_bod_title')} />
            </div>
          </div>
        </div>

        {/* Donut chart */}
        <div className="card" style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {t('analytics.chart_pie_title')}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Classification of all 7 Bhopal immersion sites by water degradation pattern.
          </p>
          <div style={{ maxHeight: '260px', display: 'flex', justifyContent: 'center' }}>
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { 
                    position: 'bottom',
                    labels: { color: textColor, font: { family: 'Plus Jakarta Sans' } }
                  }
                }
              }}
              aria-label={t('analytics.chart_pie_title')}
            />
          </div>
        </div>

        {/* Screen Reader Accessible Data Table Fallback */}
        {showAccessibleTable && (
          <div className="card" style={{ marginTop: '2rem' }} role="region" aria-label={t('analytics.screen_reader_summary')}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              {t('analytics.screen_reader_summary')}
            </h3>
            <div className="table-responsive">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>Ghat Name</th>
                    <th>Pre-DO (mg/L)</th>
                    <th>During-DO (mg/L)</th>
                    <th>Post-DO (mg/L)</th>
                    <th>Peak BOD (mg/L)</th>
                    <th>Classification Tag</th>
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_GHATS.map(g => (
                    <tr key={g.id}>
                      <td>{g.name}</td>
                      <td>{g.readings.pre.do ?? 'N/A'}</td>
                      <td>{g.readings.during.do ?? 'N/A'}</td>
                      <td>{g.readings.post.do ?? 'N/A'}</td>
                      <td>{g.readings.during.bod ?? 'N/A'}</td>
                      <td>{g.diagnosisTag}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

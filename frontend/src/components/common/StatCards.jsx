import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { SUMMARY_STATS } from '../../data/sampleGhatData';
import { MapPin, CheckCircle, AlertOctagon, HelpCircle, Info } from 'lucide-react';

const AnimatedCounter = ({ targetValue, duration = 1200, startCounting }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!startCounting) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setCount(targetValue);
      return;
    }

    let start = 0;
    const stepTime = Math.max(Math.floor(duration / (targetValue || 1)), 25);
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= targetValue) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [targetValue, duration, startCounting]);

  return <span>{count}</span>;
};

export const StatCards = () => {
  const { t } = useLanguage();
  const [hasEnteredView, setHasEnteredView] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEnteredView(true);
          observer.disconnect(); // run once
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const statItems = [
    {
      id: 'total',
      label: t('stats.total_ghats'),
      value: SUMMARY_STATS.totalGhats,
      icon: MapPin,
      color: 'var(--gov-navy-600)',
      bg: 'rgba(26, 73, 133, 0.12)',
      border: 'var(--gov-navy-600)',
      delayClass: 'stagger-1'
    },
    {
      id: 'compliant',
      label: t('stats.cpcb_compliant'),
      value: SUMMARY_STATS.compliantGhats,
      icon: CheckCircle,
      color: 'var(--status-success)',
      bg: 'var(--status-success-bg)',
      border: 'var(--status-success)',
      delayClass: 'stagger-2'
    },
    {
      id: 'critical',
      label: t('stats.critical_action'),
      value: SUMMARY_STATS.criticalActionGhats,
      icon: AlertOctagon,
      color: 'var(--status-critical)',
      bg: 'var(--status-critical-bg)',
      border: 'var(--status-critical)',
      delayClass: 'stagger-3'
    },
    {
      id: 'gaps',
      label: t('stats.missing_data'),
      value: SUMMARY_STATS.dataGapGhats,
      icon: HelpCircle,
      color: 'var(--status-warning)',
      bg: 'var(--status-warning-bg)',
      border: 'var(--status-warning)',
      delayClass: 'stagger-4'
    }
  ];

  return (
    <div ref={containerRef} style={{ margin: '2.5rem 0' }}>
      <div className="grid-cols-4">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`card reveal-on-scroll ${hasEnteredView ? 'is-revealed' : ''} ${item.delayClass}`}
              style={{
                borderLeft: `5px solid ${item.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                padding: '1.4rem'
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '12px',
                  backgroundColor: item.bg,
                  color: item.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
                aria-hidden="true"
              >
                <Icon size={28} />
              </div>

              <div>
                <div style={{ fontSize: '2rem', fontWeight: '800', lineHeight: 1.1, color: 'var(--text-primary)' }}>
                  <AnimatedCounter targetValue={item.value} startCounting={hasEnteredView} />
                </div>
                <div style={{ fontSize: '0.885rem', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  {item.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Explicit Sample Data Notice */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          fontSize: '0.8rem', 
          color: 'var(--text-muted)', 
          marginTop: '0.9rem' 
        }}
        role="note"
      >
        <Info size={14} aria-hidden="true" />
        <span>{t('stats.sample_disclaimer')}</span>
      </div>
    </div>
  );
};

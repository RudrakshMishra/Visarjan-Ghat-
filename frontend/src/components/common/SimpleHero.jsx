import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  ShieldCheck, 
  ArrowDown, 
  FileText, 
  Droplets, 
  AlertTriangle, 
  CheckCircle,
  ExternalLink
} from 'lucide-react';

export const SimpleHero = ({ onNavigate }) => {
  const { language } = useLanguage();
  const { activeTheme } = useTheme();

  const isHindi = language === 'hi';

  const scrollTo = (id) => {
    if (onNavigate) onNavigate(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section 
      id="hero-section"
      className="py-10 md:py-14 border-b transition-colors"
      style={{
        borderColor: activeTheme === 'dark' ? '#273757' : '#E2E8F0'
      }}
      aria-label="Overview & Directive"
    >
      <div className="max-w-5xl mx-auto text-center space-y-6">
        
        {/* NGT Directive Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold shadow-xs border bg-orange-50 text-orange-900 border-orange-200 dark:bg-orange-950/50 dark:text-orange-200 dark:border-orange-800/60">
          <ShieldCheck size={16} className="text-orange-600 dark:text-orange-400 shrink-0" />
          <span>
            {isHindi 
              ? 'एनजीटी आदेश OA 199/2014 • दुर्गा विसर्जन 2026 आधिकारिक निगरानी' 
              : 'NGT Order OA 199/2014 Directive • Durga Visarjan 2026 Advisory'}
          </span>
        </div>

        {/* Main Heading */}
        <h1 
          className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight"
          style={{
            color: activeTheme === 'dark' ? '#F8FAFC' : '#0F172A',
            lineHeight: 1.15
          }}
        >
          {isHindi ? (
            <>
              भोपाल विसर्जन <span style={{ color: '#FF671F' }}>घाट वॉच</span>
            </>
          ) : (
            <>
              Bhopal Visarjan <span style={{ color: '#FF671F' }}>Ghat Watch</span>
            </>
          )}
        </h1>

        {/* Subtitle */}
        <p 
          className="text-base sm:text-lg max-w-3xl mx-auto font-medium"
          style={{
            color: activeTheme === 'dark' ? '#CBD5E1' : '#475569',
            lineHeight: 1.6
          }}
        >
          {isHindi
            ? 'एनजीटी आदेशानुसार बड़े व छोटे तालाब के प्राकृतिक जल में विसर्जन पूर्णतः प्रतिबंधित है। सीपीसीबी क्लास-बी (DO ≥ 5 mg/L, BOD ≤ 3 mg/L) मानकों के विरुद्ध 7 कृत्रिम कुंडों का 3-वर्षीय परीक्षण, क्रॉनिक बनाम इवेंट जोखिम विश्लेषण एवं बीएमसी अधिकारी ब्रीफ।'
            : 'Direct idol immersion in Bhopal’s Upper & Lower Lakes is strictly prohibited by NGT orders. 3-year water quality risk analysis across 7 designated artificial immersion kunds against CPCB Class B standards (DO ≥ 5.0 mg/L, BOD ≤ 3.0 mg/L) for Durga Visarjan 2026 planning.'}
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => scrollTo('ghats-section')}
            className="px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all duration-200 flex items-center gap-2 cursor-pointer"
            style={{
              background: '#FF671F',
              color: '#FFFFFF'
            }}
          >
            <Droplets size={17} />
            <span>{isHindi ? 'घाट जोखिम रैंकिंग देखें' : 'View Ghat Risk Ranking'}</span>
            <ArrowDown size={15} />
          </button>

          <button
            type="button"
            onClick={() => scrollTo('brief-section')}
            className="px-6 py-3 rounded-xl font-bold text-sm border shadow-xs transition-all duration-200 flex items-center gap-2 cursor-pointer"
            style={{
              background: activeTheme === 'dark' ? '#1E293B' : '#FFFFFF',
              borderColor: activeTheme === 'dark' ? '#334155' : '#CBD5E1',
              color: activeTheme === 'dark' ? '#F8FAFC' : '#0F172A'
            }}
          >
            <FileText size={17} className="text-orange-500" />
            <span>{isHindi ? 'अधिकारी ब्रीफ (हिन्दी / EN)' : 'Officer Action Brief'}</span>
          </button>
        </div>

        {/* Clean 4-Metric Strip */}
        <div className="pt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
          
          <div 
            className="p-3.5 rounded-xl border"
            style={{
              background: activeTheme === 'dark' ? '#16203A' : '#FFFFFF',
              borderColor: activeTheme === 'dark' ? '#273757' : '#E2E8F0'
            }}
          >
            <div className="text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isHindi ? 'निगरानी स्थल' : 'Monitored Sites'}
            </div>
            <div className="text-xl font-black mt-1 text-slate-900 dark:text-white">
              7 {isHindi ? 'कृत्रिम कुंड' : 'Kunds'}
            </div>
            <div className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isHindi ? 'तालाबों से पृथक' : 'Segregated from Lakes'}
            </div>
          </div>

          <div 
            className="p-3.5 rounded-xl border"
            style={{
              background: activeTheme === 'dark' ? '#16203A' : '#FFFFFF',
              borderColor: activeTheme === 'dark' ? '#273757' : '#E2E8F0'
            }}
          >
            <div className="text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isHindi ? 'सीपीसीबी मानक' : 'CPCB Criteria'}
            </div>
            <div className="text-xl font-black mt-1 text-emerald-600 dark:text-emerald-400">
              Class B
            </div>
            <div className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
              DO ≥ 5.0 • BOD ≤ 3.0
            </div>
          </div>

          <div 
            className="p-3.5 rounded-xl border"
            style={{
              background: activeTheme === 'dark' ? '#16203A' : '#FFFFFF',
              borderColor: activeTheme === 'dark' ? '#273757' : '#E2E8F0'
            }}
          >
            <div className="text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isHindi ? 'विसर्जन तिथि' : 'Immersion Date'}
            </div>
            <div className="text-xl font-black mt-1 text-orange-600 dark:text-orange-400">
              20 Oct 2026
            </div>
            <div className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
              Durga Visarjan
            </div>
          </div>

          <div 
            className="p-3.5 rounded-xl border"
            style={{
              background: activeTheme === 'dark' ? '#16203A' : '#FFFFFF',
              borderColor: activeTheme === 'dark' ? '#273757' : '#E2E8F0'
            }}
          >
            <div className="text-2xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isHindi ? 'सत्यापित साक्ष्य' : 'Traceability'}
            </div>
            <div className="text-xl font-black mt-1 text-blue-600 dark:text-blue-400">
              100% MPPCB
            </div>
            <div className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isHindi ? 'पेज-स्तर प्रमाण' : 'PDF Page Linked'}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

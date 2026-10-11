import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { StatCards } from './StatCards';
import { 
  ShieldCheck, 
  Scale, 
  Droplets, 
  Clock, 
  Award, 
  Zap 
} from 'lucide-react';

export const MandateSection = () => {
  const { t, language } = useLanguage();

  return (
    <section 
      id="mandate-slide"
      className="slide-section py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
      style={{ scrollMarginTop: '80px' }}
      aria-label="Sacred Water Mandate"
    >
      {/* 4 Guaranteed Trust Badges */}
      <div className="w-full max-w-5xl mx-auto mb-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <Award size={24} className="text-orange-500 shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">CPCB Class B</div>
            <div className="text-2xs text-slate-500 dark:text-slate-400">100% Traceable Limits</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <ShieldCheck size={24} className="text-emerald-600 shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">NGT Order Compliant</div>
            <div className="text-2xs text-slate-500 dark:text-slate-400">Lakes 100% Protected</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <Droplets size={24} className="text-blue-600 shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">7 Artificial Kunds</div>
            <div className="text-2xs text-slate-500 dark:text-slate-400">Scientific Sludge Removal</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
          <Clock size={24} className="text-amber-500 shrink-0" />
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Durga Visarjan 2026</div>
            <div className="text-2xs text-slate-500 dark:text-slate-400">20 October 2026 Immersion</div>
          </div>
        </div>
      </div>

      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 mb-4">
          <Scale size={14} />
          <span>Slide 2: National Green Tribunal Order OA 199/2014</span>
        </div>
        <h2 
          className="text-3xl sm:text-5xl font-extrabold tracking-tight font-display"
          style={{ color: 'var(--text-primary)' }}
        >
          {language === 'hi' 
            ? 'पवित्र सरोवरों की रक्षा: एनजीटी एवं नगर निगम आदेश' 
            : 'Sacred Water Mandate: NGT & BMC Guidelines'}
        </h2>
        <p 
          className="mt-4 text-base sm:text-lg leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          {language === 'hi'
            ? 'भोपाल के बड़े तालाब और छोटे तालाब की पारिस्थितिकी को संरक्षित रखने हेतु राष्ट्रीय हरित अधिकरण (NGT) ने प्राकृतिक झीलों में मूर्ति विसर्जन पर पूर्ण रोक लगाई है। विसर्जन केवल नगर निगम द्वारा निर्मित 7 समर्पित कृत्रिम कुंडों में ही मान्य है।'
            : "Under NGT Order OA 199/2014 and BMC orders, direct immersion in Upper and Lower Lake natural waters is strictly prohibited to preserve Ramsar wetland ecosystems. All visarjan rituals must occur exclusively in the 7 designated artificial kunds."}
        </p>
      </div>

      {/* The 4 Animated Key Statistics */}
      <StatCards />

      {/* Official Directives & Key Pillars */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Droplets size={20} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">CPCB Class B Bathing Limit</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Dissolved Oxygen must remain at or above <strong>5.0 mg/L</strong>, BOD must not exceed <strong>3.0 mg/L</strong>, and pH must remain within <strong>6.5 – 8.5</strong> across all festival phases.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-2xs text-slate-400 font-mono">
            Gazette Notification No. B-29016
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">100% Artificial Kund Protection</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Every artificial kund is sealed with impermeable geotextile liners preventing chemical dyes, paints, and sludge from seeping into Bhopal’s underground aquifers.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-2xs text-slate-400 font-mono">
            BMC Environmental Protection Wing
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Clock size={20} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Countdown to Durga Visarjan</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Durga Visarjan takes place on <strong>20 October 2026</strong>. Pre-registration of idol dimensions and slot booking prevents bottlenecks and ensures crane availability.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 text-2xs text-slate-400 font-mono">
            T-minus 9 Days to Immersion
          </div>
        </div>
      </div>
    </section>
  );
};

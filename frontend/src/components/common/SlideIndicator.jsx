import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const SLIDES = [
  { id: 'hero-slide', name: 'Hero', labelHi: 'मुख्य पृष्ठ', num: '01' },
  { id: 'mandate-slide', name: 'Mandate', labelHi: 'एनजीटी आदेश', num: '02' },
  { id: 'ghats-slide', name: 'Ghat Matrix', labelHi: 'घाट गुणवत्ता', num: '03' },
  { id: 'analytics-slide', name: 'Analytics', labelHi: 'जल विश्लेषण', num: '04' },
  { id: 'guidelines-slide', name: 'Guidelines', labelHi: 'दिशानिर्देश', num: '05' },
  { id: 'booking-slide', name: 'Booking', labelHi: 'स्लॉट बुकिंग', num: '06' },
  { id: 'officer-slide', name: 'Officer Brief', labelHi: 'अधिकारी ब्रीफ', num: '07' },
  { id: 'gis-slide', name: 'GIS Kunds', labelHi: 'जीआईएस कुंड', num: '08' },
  { id: 'faq-slide', name: 'FAQ', labelHi: 'प्रश्न-उत्तर', num: '09' },
  { id: 'footer-slide', name: 'Colophon', labelHi: 'पारदर्शिता', num: '10' }
];

export const SlideIndicator = ({ activeSlide, onSlideClick }) => {
  const { language } = useLanguage();
  const [hoveredSlide, setHoveredSlide] = useState(null);

  return (
    <aside 
      className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 z-50 flex-col items-end gap-2.5 py-3 px-2 rounded-full backdrop-blur-md border border-white/20 bg-slate-900/40 dark:bg-black/60 shadow-xl"
      aria-label="Slide Navigation Indicator"
    >
      {SLIDES.map((slide) => {
        const isActive = activeSlide === slide.id;
        const isHovered = hoveredSlide === slide.id;
        const label = language === 'hi' ? slide.labelHi : slide.name;

        return (
          <div key={slide.id} className="relative flex items-center">
            {/* Tooltip on hover */}
            {isHovered && (
              <span className="absolute right-7 px-2.5 py-1 rounded-md text-2xs font-bold text-white bg-slate-900 border border-slate-700 shadow-md whitespace-nowrap animate-fade-rise">
                {slide.num}. {label}
              </span>
            )}

            <button
              type="button"
              onClick={() => onSlideClick(slide.id)}
              onMouseEnter={() => setHoveredSlide(slide.id)}
              onMouseLeave={() => setHoveredSlide(null)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                isActive 
                  ? 'w-7 h-2.5 bg-orange-500 shadow-lg shadow-orange-500/50' 
                  : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/80'
              }`}
              aria-label={`Jump to Slide ${slide.num}: ${label}`}
              aria-current={isActive ? 'true' : 'false'}
            />
          </div>
        );
      })}
    </aside>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  ShieldCheck, 
  Calendar, 
  Search, 
  ArrowRight, 
  Droplets,
  LifeBuoy,
  ChevronDown,
  Sparkles
} from 'lucide-react';

const VIDEO_URL = "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4";

export const CinematicHero = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const { activeTheme } = useTheme();
  const videoRef = useRef(null);

  // Hero section toggle buttons as per implemented plan:
  // 1: Book Visarjan Slot | 2: Check Ghat Status | 3: Track E-Pass | 4: Helpline & Safety
  const [activeTab, setActiveTab] = useState('book');
  const [trackToken, setTrackToken] = useState('');

  // Custom fade-in / fade-out loop logic using requestAnimationFrame as requested
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Autoplay handled:', err);
      });
    }

    let animationFrameId;

    const monitorVideoFade = () => {
      if (video.duration && !video.paused) {
        const ct = video.currentTime;
        const dur = video.duration;

        // Fade in over 0.5s at the start (opacity: 0.2 to 0.95)
        if (ct < 0.5) {
          video.style.opacity = Math.max(0.2, (ct / 0.5) * 0.95).toString();
        } 
        // Fade out over 0.5s before the end (opacity: 0.95 to 0.1)
        else if (dur - ct < 0.5) {
          video.style.opacity = Math.max(0.1, ((dur - ct) / 0.5) * 0.95).toString();
        } else {
          video.style.opacity = '0.9';
        }
      } else if (video.paused) {
        video.play().catch(() => {});
      }
      animationFrameId = requestAnimationFrame(monitorVideoFade);
    };

    animationFrameId = requestAnimationFrame(monitorVideoFade);

    // On ended event: set opacity to 0, wait 100ms, reset currentTime = 0, then play() again
    const handleEnded = () => {
      video.style.opacity = '0';
      setTimeout(() => {
        try {
          video.currentTime = 0;
          video.play().catch(() => {});
        } catch (e) {
          console.warn('Video replay catch:', e);
        }
      }, 100);
    };

    video.addEventListener('ended', handleEnded);

    return () => {
      cancelAnimationFrame(animationFrameId);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'book' && onNavigate) {
      onNavigate('booking-slide');
    } else if (tabId === 'status' && onNavigate) {
      onNavigate('ghats-slide');
    } else if (tabId === 'safety' && onNavigate) {
      onNavigate('gis-slide');
    }
  };

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('booking-slide');
    }
  };

  return (
    <section 
      id="hero-slide"
      className="relative min-h-screen w-full overflow-hidden flex flex-col items-center justify-center"
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)'
      }}
      aria-label="Cinematic Hero Section"
    >
      {/* Background Video Layer (z-0) positioned at top: '280px' with inset: 'auto 0 0 0' */}
      <div 
        className="absolute pointer-events-none overflow-hidden z-0"
        style={{
          top: '280px',
          inset: 'auto 0 0 0',
          height: 'calc(100% - 280px)',
          width: '100%',
          background: activeTheme === 'dark' 
            ? 'radial-gradient(ellipse at 50% 50%, #172554 0%, #0b132b 85%)' 
            : 'radial-gradient(ellipse at 50% 50%, #bae6fd 0%, #e0f2fe 30%, #f8fafc 85%)'
        }}
      >
        <video
          ref={videoRef}
          src={VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          style={{
            opacity: 0.85,
            transition: 'opacity 0.4s ease-out'
          }}
        />

        {/* Gradient overlays: absolute inset-0 bg-gradient-to-b from-background via-transparent to-background */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: activeTheme === 'dark'
              ? 'linear-gradient(to bottom, #0B132B 0%, rgba(11, 19, 43, 0.15) 30%, rgba(11, 19, 43, 0.6) 75%, #0B132B 100%)'
              : 'linear-gradient(to bottom, #F8FAFC 0%, rgba(248, 250, 252, 0.1) 30%, rgba(248, 250, 252, 0.65) 75%, #F8FAFC 100%)'
          }}
        />
      </div>

      {/* Hero Content Container (z-10): centered, px-6, paddingTop: calc(8rem - 75px), pb-40 */}
      <div 
        className="relative z-10 max-w-7xl mx-auto px-6 w-full flex flex-col items-center justify-center text-center"
        style={{
          paddingTop: 'calc(8rem - 75px)',
          paddingBottom: '5rem'
        }}
      >
        
        {/* NGT Environmental Directive Tag */}
        <div 
          className="animate-fade-rise inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-semibold tracking-wide border shadow-sm backdrop-blur-md"
          style={{
            background: activeTheme === 'dark' ? 'rgba(30, 41, 59, 0.85)' : 'rgba(255, 255, 255, 0.85)',
            borderColor: activeTheme === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(226, 232, 240, 0.9)',
            color: activeTheme === 'dark' ? '#E2E8F0' : '#1E293B'
          }}
        >
          <ShieldCheck size={15} className="text-orange-500" aria-hidden="true" />
          <span>Durga Visarjan 2026 Advisory • NGT Order OA 199/2014 & BMC Protocol</span>
        </div>

        {/* Headline: Instrument Serif, line height 0.95, letter spacing -2.46px, color #000000, #6F6F6F for italic emphasis */}
        <h1 
          className="animate-fade-rise font-display font-normal max-w-6xl tracking-tight select-none"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 7.5vw, 6.25rem)',
            lineHeight: 0.95,
            letterSpacing: '-2.46px',
            color: activeTheme === 'dark' ? '#FFFFFF' : '#000000'
          }}
        >
          {language === 'hi' ? (
            <>
              पवित्रता की रक्षा, <span className="italic" style={{ color: '#FF671F' }}>सरोवरों का संरक्षण।</span>
            </>
          ) : (
            <>
              Beyond silence, we build <span className="italic" style={{ color: '#6F6F6F' }}>the eternal.</span>
            </>
          )}
        </h1>

        {/* Description: text-base sm:text-lg, max-w-2xl, mt-8, leading-relaxed, color #6F6F6F */}
        <p 
          className="animate-fade-rise-delay text-base sm:text-lg max-w-2xl mt-8 leading-relaxed font-normal"
          style={{ color: '#6F6F6F' }}
        >
          {language === 'hi'
            ? "एनजीटी आदेशानुसार भोपाल के बड़े व छोटे तालाब में विसर्जन पूर्णतः प्रतिबंधित है। 7 समर्पित कृत्रिम कुंडों पर सीपीसीबी क्लास-बी जल गुणवत्ता ट्रैकिंग एवं समय-बद्ध ई-पास व्यवस्था।"
            : "Building platforms for brilliant minds, fearless makers, and thoughtful souls. Real-time water quality monitoring, NGT compliance tracking, and zero-waiting eco-immersion slot booking across Bhopal's 7 designated artificial kunds for Durga Visarjan 2026."}
        </p>

        {/* Hero CTA Button: rounded-full, px-14 py-5, text-base, mt-12, black bg, white text, hover scale 1.03 */}
        <div className="animate-fade-rise-delay-2 mt-10 flex flex-col items-center gap-6 w-full">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('booking-slide')}
            className="rounded-full px-14 py-5 text-base font-semibold shadow-2xl transition-all duration-300 flex items-center gap-3 cursor-pointer group"
            style={{
              background: activeTheme === 'dark' ? '#FFFFFF' : '#000000',
              color: activeTheme === 'dark' ? '#000000' : '#FFFFFF'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.03)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
          >
            <span>{language === 'hi' ? 'यात्रा आरंभ करें / स्लॉट बुक करें' : 'Begin Journey'}</span>
            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>

          {/* Hero Section Toggle Buttons As Per Implemented Plan:
              Clean, floating, non-colliding pill tabs with generous padding and clear click behavior */}
          <div className="w-full max-w-3xl mt-4">
            <div 
              className="flex flex-wrap items-center justify-center gap-2 p-2 rounded-full border shadow-xl backdrop-blur-xl"
              style={{
                background: activeTheme === 'dark' ? 'rgba(22, 32, 58, 0.92)' : 'rgba(255, 255, 255, 0.92)',
                borderColor: activeTheme === 'dark' ? 'rgba(51, 65, 85, 0.8)' : 'rgba(226, 232, 240, 0.9)'
              }}
              role="tablist"
              aria-label="Quick Services Selector"
            >
              {[
                { id: 'book', label: t('hero_tabs.tab_book') || 'Book Visarjan Slot', icon: Calendar, color: '#FF671F' },
                { id: 'status', label: t('hero_tabs.tab_status') || 'Check Ghat Status', icon: Droplets, color: '#0284C7' },
                { id: 'track', label: t('hero_tabs.tab_track') || 'Track E-Pass', icon: Search, color: '#059669' },
                { id: 'safety', label: t('hero_tabs.tab_safety') || 'Helpline & Safety', icon: LifeBuoy, color: '#DC2626' }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => handleTabClick(tab.id)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer shadow-xs"
                    style={{
                      background: isActive ? tab.color : 'transparent',
                      color: isActive ? '#ffffff' : (activeTheme === 'dark' ? '#CBD5E1' : '#334155'),
                      fontWeight: isActive ? 700 : 500
                    }}
                  >
                    <Icon size={15} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Quick Track Input Bar (only shown when 'track' tab is active) */}
            {activeTab === 'track' && (
              <form onSubmit={handleTrackSubmit} className="mt-4 flex gap-2 max-w-md mx-auto animate-fade-rise">
                <input
                  type="text"
                  placeholder="Enter E-Pass ID (e.g. VIS-2026-9481)"
                  value={trackToken}
                  onChange={(e) => setTrackToken(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm shadow-md font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-full bg-slate-900 text-white text-xs sm:text-sm font-semibold shadow-md hover:bg-black transition cursor-pointer"
                >
                  Track
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* Subtle Downward Indicator to Slide 2 */}
      <div className="relative z-10 pb-8 text-center">
        <a 
          href="#mandate-slide"
          onClick={(e) => {
            e.preventDefault();
            if (onNavigate) onNavigate('mandate-slide');
          }}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-600 transition"
        >
          <span>Explore Sacred Water Mandate & 10 Slides</span>
          <ChevronDown size={14} className="animate-bounce" />
        </a>
      </div>
    </section>
  );
};

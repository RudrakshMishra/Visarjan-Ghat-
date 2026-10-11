import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/common/Navbar';
import { SimpleHero } from './components/common/SimpleHero';
import { GhatTable } from './components/ghats/GhatTable';
import { GhatCharts } from './components/ghats/GhatCharts';
import { MandateSection } from './components/common/MandateSection';
import { OfficerBriefView } from './components/ghats/OfficerBriefView';
import { KundGISSection } from './components/ghats/KundGISSection';
import { GovFooter } from './components/common/GovFooter';
import { ArrowUp } from 'lucide-react';

function MainApp() {
  const [activeSection, setActiveSection] = useState('ghats-section');
  const [showBackToTop, setShowBackToTop] = useState(false);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Track active section in viewport
    const sections = [
      'hero-section',
      'ghats-section',
      'analytics-section',
      'mandate-section',
      'brief-section',
      'gis-section'
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: [0.2, 0.5] }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="site-wrapper min-h-screen relative selection:bg-orange-500 selection:text-white">
      {/* Official Government Navigation Bar */}
      <Navbar activeSection={activeSection} setActiveSection={scrollToSection} />

      {/* Main Container */}
      <main id="main-content" tabIndex="-1" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-16">
        
        {/* Direct, Fast Overview & Directive Hero */}
        <SimpleHero onNavigate={scrollToSection} />

        {/* 1. Live Ghat Water Quality Risk Ranking (CPCB Class B) */}
        <section id="ghats-section" className="scroll-mt-20">
          <GhatTable />
        </section>

        {/* 2. Parameter Analytics & Immersion Trends */}
        <section id="analytics-section" className="scroll-mt-20">
          <GhatCharts />
        </section>

        {/* 3. Sacred Water Mandate, Lakes Protection & Telemetry */}
        <section id="mandate-section" className="scroll-mt-20">
          <MandateSection />
        </section>

        {/* 4. Municipal Officer Risk Brief & Durga Visarjan 2026 Checklist */}
        <section id="brief-section" className="scroll-mt-20">
          <OfficerBriefView />
        </section>

        {/* 5. Bhopal Immersion Kund GIS Coordinates & Logistics Amenities */}
        <section id="gis-section" className="scroll-mt-20">
          <KundGISSection />
        </section>

      </main>

      {/* Official Government Transparency Footer */}
      <GovFooter />

      {/* Smooth Scroll Back-To-Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-orange-600 text-white shadow-lg hover:bg-orange-700 flex items-center justify-center transition-all cursor-pointer z-50 border-2 border-white/50"
          title="Scroll to Top"
          aria-label="Scroll to Top"
        >
          <ArrowUp size={20} />
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AccessibilityProvider>
          <MainApp />
        </AccessibilityProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

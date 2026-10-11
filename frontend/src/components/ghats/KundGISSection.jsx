import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { SAMPLE_GHATS } from '../../data/sampleGhatData';
import { 
  MapPin, 
  LifeBuoy, 
  Truck, 
  ShieldCheck, 
  ExternalLink, 
  Users, 
  Clock, 
  Navigation,
  Compass,
  CheckCircle2
} from 'lucide-react';

export const KundGISSection = () => {
  const { t, language } = useLanguage();
  const [selectedGhatId, setSelectedGhatId] = useState(SAMPLE_GHATS[0].id);

  const selectedGhat = SAMPLE_GHATS.find(g => g.id === selectedGhatId) || SAMPLE_GHATS[0];

  // Specific GIS and Logistics Data for all 7 Bhopal immersion sites
  const ghatAmenities = {
    'bairagarh-kund': {
      cranes: '2 Heavy Cranes (15-Ton Capacity)',
      divers: '8 Certified SDRF Divers + 2 Inflatable Boats',
      medicalPost: 'Red Cross Aid Post #1 (Ambulance on Site)',
      parkingCapacity: '350 Vehicles (P1 Dedicated Ground)',
      osmLink: 'https://www.openstreetmap.org/#map=16/23.2721/77.3412',
      mapsQuery: 'Sant+Hirdaram+Kund+Bairagarh+Bhopal'
    },
    'shahpura-ghat': {
      cranes: '3 Heavy Cranes (20-Ton Capacity)',
      divers: '10 Certified SDRF Divers + 3 Speedboats',
      medicalPost: 'BMC Emergency Clinic Booth #4',
      parkingCapacity: '500 Vehicles (Manisha Market Zone)',
      osmLink: 'https://www.openstreetmap.org/#map=16/23.2084/77.4265',
      mapsQuery: 'Manisha+Kund+Shahpura+Bhopal'
    },
    'khatlapura-kund': {
      cranes: '2 Medium Cranes (10-Ton Capacity)',
      divers: '6 SDRF Divers + Lifebuoy Rings',
      medicalPost: 'Civil Hospital Camp Tent',
      parkingCapacity: '200 Vehicles (Lower Lake Ring Road)',
      osmLink: 'https://www.openstreetmap.org/#map=16/23.2458/77.4089',
      mapsQuery: 'Khatlapura+Kund+Bhopal'
    },
    'bhadbhada-kund': {
      cranes: '4 Heavy Cranes (25-Ton Immersion Boom)',
      divers: '12 SDRF Personnel + 4 Motorboats',
      medicalPost: 'Chief Medical Officer Emergency Mobile Unit',
      parkingCapacity: '800 Vehicles (Bhadbhada Dam Complex)',
      osmLink: 'https://www.openstreetmap.org/#map=16/23.2119/77.3714',
      mapsQuery: 'Bhadbhada+Ghat+Kund+Bhopal'
    },
    'prempura-ghat': {
      cranes: '2 Mobile Hydraulic Cranes (12-Ton)',
      divers: '6 SDRF Water Rescuers',
      medicalPost: 'Municipal Health Sub-centre',
      parkingCapacity: '280 Vehicles (Prempura Enclosure)',
      osmLink: 'https://www.openstreetmap.org/#map=16/23.2285/77.3821',
      mapsQuery: 'Prempura+Ghat+Bhopal'
    },
    'rani-kamlapati-kund': {
      cranes: '2 Compact Cranes (8-Ton)',
      divers: '6 SDRF Divers',
      medicalPost: 'First Aid Tent #2',
      parkingCapacity: '180 Vehicles (Kamla Park Approach)',
      osmLink: 'https://www.openstreetmap.org/#map=16/23.2501/77.3995',
      mapsQuery: 'Kamla+Park+Kund+Bhopal'
    },
    'malikhedi-kund': {
      cranes: '1 Heavy Crane (15-Ton)',
      divers: '4 SDRF Guards + Flotation Ropes',
      medicalPost: 'Primary Health Center Desk',
      parkingCapacity: '220 Vehicles (Malikhedi Rural Approach)',
      osmLink: 'https://www.openstreetmap.org/#map=16/23.2642/77.4528',
      mapsQuery: 'Malikhedi+Kund+Bhopal'
    }
  };

  const amenities = ghatAmenities[selectedGhat.id] || ghatAmenities['bairagarh-kund'];

  return (
    <section 
      id="gis-slide"
      className="slide-section py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
      style={{ scrollMarginTop: '90px' }}
      aria-label="GIS and Safety Amenities"
    >
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300 mb-3">
          <Compass size={14} />
          <span>Slide 8: Geo-Coordinates, Cranes & Divers</span>
        </div>
        <h2 
          className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display"
          style={{ color: 'var(--text-primary)' }}
        >
          Bhopal Immersion Kund GIS & Logistics
        </h2>
        <p 
          className="mt-3 text-base"
          style={{ color: 'var(--text-secondary)' }}
        >
          NGT compliance requires all idol immersions to occur exclusively in artificial kunds. Check exact coordinates, crane capabilities, certified SDRF diver stations, and parking bays.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 7 Ghats Selector List */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Select Immersion Kund ({SAMPLE_GHATS.length} Sites Tracked)
          </h3>
          
          <div className="space-y-2">
            {SAMPLE_GHATS.map((ghat) => {
              const isSelected = ghat.id === selectedGhatId;
              return (
                <button
                  key={ghat.id}
                  onClick={() => setSelectedGhatId(ghat.id)}
                  type="button"
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                    isSelected 
                      ? 'bg-orange-50 border-orange-500 shadow-md dark:bg-orange-950/40 dark:border-orange-500' 
                      : 'bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-orange-500' : 'bg-slate-400'}`} />
                      <span>{ghat.name}</span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{ghat.coordinates}</span>
                    </div>
                  </div>

                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    ghat.priority === 'High Attention'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                  }`}>
                    Rank #{ghat.rank}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Ghat Spatial & Facility Dashboard */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-700">
            <div>
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">
                Active Kund Dossier
              </span>
              <h4 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {selectedGhat.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Water Enclosure: {selectedGhat.waterBody}
              </p>
            </div>

            <div className="flex gap-2">
              <a
                href={amenities.osmLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition"
              >
                <span>OpenStreetMap</span>
                <ExternalLink size={12} />
              </a>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(amenities.mapsQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-1.5 transition shadow"
              >
                <Navigation size={12} />
                <span>Directions</span>
              </a>
            </div>
          </div>

          {/* Logistics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
              <Truck size={22} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Crane Capacity</span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                  {amenities.cranes}
                </p>
                <span className="text-2xs text-slate-500">Suitable for idols up to 18 ft</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
              <LifeBuoy size={22} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">SDRF Safety Team</span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                  {amenities.divers}
                </p>
                <span className="text-2xs text-slate-500">On active standby during immersion</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
              <ShieldCheck size={22} className="text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Medical Aid Post</span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                  {amenities.medicalPost}
                </p>
                <span className="text-2xs text-slate-500">Paramedic team & oxygen cylinder</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
              <Users size={22} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Parking Capacity</span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1">
                  {amenities.parkingCapacity}
                </p>
                <span className="text-2xs text-slate-500">Regulated one-way traffic flow</span>
              </div>
            </div>
          </div>

          {/* Water Quality Footnote */}
          <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-300 flex items-start gap-2.5">
            <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <p>
              <strong>Scientific Protocol:</strong> All nirmalya (flowers, clothes, garlands) must be deposited in dedicated green bins prior to crane immersion. Sludge suction units operate every 4 hours.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

/**
 * SAMPLE WATER QUALITY DATASET FOR BHOPAL VISARJAN GHATS
 * 
 * IMPORTANT DISCLAIMER:
 * All figures, readings and statistics below are clearly marked SAMPLE / BENCHMARK data
 * structured around CPCB Class B (Outdoor Bathing) limits and MPPCB monitoring parameters.
 * Official laboratory measurements and final MPPCB PDF records can be linked or imported
 * using the Officer Data Intake module.
 */

export const IS_SAMPLE_DATA = true;
export const DATA_DISCLAIMER = "SAMPLE DATA: Structured according to CPCB Class B limits and MPPCB monitoring points. Connect live official CSV/PDF records for verified regulatory reporting.";

export const CPCB_CLASS_B_LIMITS = {
  do_min: 5.0,       // mg/L (Dissolved Oxygen must be >= 5.0)
  bod_max: 3.0,      // mg/L (BOD must be <= 3.0)
  ph_min: 6.5,       // pH must be between 6.5 and 8.5
  ph_max: 8.5
};

export const SAMPLE_GHATS = [
  {
    id: "bairagarh-kund",
    name: "Bairagarh (Sant Hirdaram) Kund",
    waterBody: "Dedicated Artificial Kund / Upper Lake Fringe",
    coordinates: "23.2721° N, 77.3412° E (Approximate)",
    rank: 1,
    priority: "High Attention",
    diagnosisTag: "CHRONIC",
    tagLabelKey: "tag_chronic",
    recommendedAction: "Deploy Surface Aerators & Sludge Clearing",
    actionKey: "action_aerate",
    confidence: "LOW",
    confidenceKey: "confidence_low",
    dataGapNote: "Pre and post immersion readings not sampled in 2024 Durga; baseline gap.",
    readings: {
      pre: { do: 1.2, bod: 11.4, ph: 7.8, turbidity: 34 },
      during: { do: 0.0, bod: 18.2, ph: 7.9, turbidity: 98 },
      post: { do: 0.8, bod: 14.1, ph: 7.6, turbidity: 65 }
    },
    metals: {
      chromium: "BDL",
      lead: 0.042,
      zinc: 0.180,
      copper: 0.015,
      spikeNotice: "Zinc increased 2.8x during event window."
    },
    evidence: {
      reportYear: "2025",
      festival: "Ganesh Visarjan",
      pdfPage: 28,
      sourceUrl: "https://www.mppcb.mp.gov.in/proc/mon/Ganesh_and_Durga_visarjan_report-2025.pdf#page=28",
      printedNote: "DO measured at 0.0 mg/L during immersion phase; pre-event DO was 1.2 mg/L."
    }
  },
  {
    id: "shahpura-ghat",
    name: "Shahpura Lake Ghat (Manisha Kund)",
    waterBody: "Shahpura Lake Enclosure",
    coordinates: "23.2084° N, 77.4265° E (Approximate)",
    rank: 2,
    priority: "High Attention",
    diagnosisTag: "EVENT_LINKED",
    tagLabelKey: "tag_event",
    recommendedAction: "Intensive Post-Visarjan Debris & Flower Clearance",
    actionKey: "action_clean",
    confidence: "HIGH",
    confidenceKey: "confidence_high",
    dataGapNote: "Complete 3-phase sampling available for 2023-2025.",
    readings: {
      pre: { do: 5.6, bod: 2.8, ph: 7.4, turbidity: 18 },
      during: { do: 2.4, bod: 8.6, ph: 8.1, turbidity: 82 },
      post: { do: 3.9, bod: 5.2, ph: 7.7, turbidity: 42 }
    },
    metals: {
      chromium: "BDL",
      lead: 0.012,
      zinc: 0.095,
      copper: "BDL",
      spikeNotice: "Lead showed detectable spike from BDL during peak immersion."
    },
    evidence: {
      reportYear: "2024",
      festival: "Durga Visarjan",
      pdfPage: 44,
      sourceUrl: "https://www.mppcb.mp.gov.in/proc/mon/Ganesh_and_Durga_visarjan_report-2024.pdf#page=44",
      printedNote: "DO dropped from 5.6 to 2.4 mg/L during immersion; recovered to 3.9 mg/L post 7 days."
    }
  },
  {
    id: "khatlapura-ghat",
    name: "Khatlapura Ghat (Lower Lake Enclosure)",
    waterBody: "Lower Lake (Chhota Talab) Segregated Tank",
    coordinates: "23.2458° N, 77.4042° E (Approximate)",
    rank: 3,
    priority: "Moderate Attention",
    diagnosisTag: "PERSISTING",
    tagLabelKey: "tag_persisting",
    recommendedAction: "Continuous Aeration & Bio-Enzyme Treatment",
    actionKey: "action_aerate",
    confidence: "HIGH",
    confidenceKey: "confidence_high",
    dataGapNote: "All phases sampled across 2023-2025.",
    readings: {
      pre: { do: 4.8, bod: 4.2, ph: 7.5, turbidity: 22 },
      during: { do: 2.1, bod: 9.1, ph: 8.2, turbidity: 88 },
      post: { do: 2.8, bod: 7.5, ph: 7.9, turbidity: 54 }
    },
    metals: {
      chromium: "BDL",
      lead: 0.018,
      zinc: 0.110,
      copper: 0.010,
      spikeNotice: "Post-immersion BOD remained elevated at 7.5 mg/L 7 days later."
    },
    evidence: {
      reportYear: "2025",
      festival: "Durga Visarjan",
      pdfPage: 36,
      sourceUrl: "https://www.mppcb.mp.gov.in/proc/mon/Ganesh_and_Durga_visarjan_report-2025.pdf#page=36",
      printedNote: "Pre-immersion baseline slightly below CPCB Class B; elevated BOD persisting post-festival."
    }
  },
  {
    id: "prempura-ghat",
    name: "Prempura Ghat (Upper Lake Artificial Tanks)",
    waterBody: "Upper Lake (Bada Talab) - Artificial Bunds Only",
    coordinates: "23.2289° N, 77.3755° E (Approximate)",
    rank: 4,
    priority: "Moderate Attention",
    diagnosisTag: "TRANSIENT",
    tagLabelKey: "tag_transient",
    recommendedAction: "Standard Skimming & Hydraulic Crane Support",
    actionKey: "action_monitor",
    confidence: "HIGH",
    confidenceKey: "confidence_high",
    dataGapNote: "Continuous sampling record maintained.",
    readings: {
      pre: { do: 6.2, bod: 2.4, ph: 7.3, turbidity: 14 },
      during: { do: 3.8, bod: 5.6, ph: 7.9, turbidity: 64 },
      post: { do: 5.4, bod: 3.1, ph: 7.4, turbidity: 24 }
    },
    metals: {
      chromium: "BDL",
      lead: "BDL",
      zinc: 0.045,
      copper: "BDL",
      spikeNotice: "Rapid natural settling observed within 7 days in artificial containment."
    },
    evidence: {
      reportYear: "2025",
      festival: "Ganesh Visarjan",
      pdfPage: 19,
      sourceUrl: "https://www.mppcb.mp.gov.in/proc/mon/Ganesh_and_Durga_visarjan_report-2025.pdf#page=19",
      printedNote: "Immersion retained inside concrete Kund; open lake DO stayed above 6.0 mg/L."
    }
  },
  {
    id: "kamla-park-ghat",
    name: "Rani Kamlapati Ghat / Kamla Park Kund",
    waterBody: "Lower Lake Margin Enclosure",
    coordinates: "23.2492° N, 77.3941° E (Approximate)",
    rank: 5,
    priority: "Moderate Attention",
    diagnosisTag: "CHRONIC",
    tagLabelKey: "tag_chronic",
    recommendedAction: "Pre-Festival Baseline Water Flushing",
    actionKey: "action_clean",
    confidence: "MEDIUM",
    confidenceKey: "confidence_med",
    dataGapNote: "Rani Kamlapati and Kamla Park reported jointly in some 2023 tables.",
    readings: {
      pre: { do: 3.9, bod: 5.8, ph: 7.6, turbidity: 26 },
      during: { do: 2.5, bod: 8.9, ph: 8.0, turbidity: 72 },
      post: { do: 3.4, bod: 6.4, ph: 7.7, turbidity: 48 }
    },
    metals: {
      chromium: "BDL",
      lead: 0.021,
      zinc: 0.088,
      copper: "BDL",
      spikeNotice: "Baseline DO consistently below 5 mg/L prior to festival start."
    },
    evidence: {
      reportYear: "2024",
      festival: "Ganesh Visarjan",
      pdfPage: 52,
      sourceUrl: "https://www.mppcb.mp.gov.in/proc/mon/Ganesh_and_Durga_visarjan_report-2024.pdf#page=52",
      printedNote: "Pre-immersion BOD was 5.8 mg/L indicating urban runoff prior to idol arrival."
    }
  },
  {
    id: "sheetla-mata-kund",
    name: "Sheetla Mata Mandir Kund (Habibganj)",
    waterBody: "Dedicated Temple Tank / Groundwater Fed",
    coordinates: "23.2201° N, 77.4385° E (Approximate)",
    rank: 6,
    priority: "Within Limits",
    diagnosisTag: "OK",
    tagLabelKey: "tag_ok",
    recommendedAction: "Standard Water Top-up & Nirmalya Segregation",
    actionKey: "action_monitor",
    confidence: "MEDIUM",
    confidenceKey: "confidence_med",
    dataGapNote: "Small domestic idol sampling protocol followed.",
    readings: {
      pre: { do: 6.8, bod: 1.9, ph: 7.2, turbidity: 10 },
      during: { do: 5.1, bod: 3.4, ph: 7.6, turbidity: 38 },
      post: { do: 6.1, bod: 2.2, ph: 7.3, turbidity: 18 }
    },
    metals: {
      chromium: "BDL",
      lead: "BDL",
      zinc: 0.025,
      copper: "BDL",
      spikeNotice: "All heavy metals stayed within baseline detection limits."
    },
    evidence: {
      reportYear: "2025",
      festival: "Ganesh Visarjan",
      pdfPage: 63,
      sourceUrl: "https://www.mppcb.mp.gov.in/proc/mon/Ganesh_and_Durga_visarjan_report-2025.pdf#page=63",
      printedNote: "DO remained above 5.0 mg/L threshold throughout immersion window."
    }
  },
  {
    id: "malikhedi-kund",
    name: "Malikhedi Dedicated Immersion Kund",
    waterBody: "Civic Artificial Excavated Tank",
    coordinates: "23.2845° N, 77.4489° E (Approximate)",
    rank: 7,
    priority: "Data Gap / Test First",
    diagnosisTag: "UNKNOWN_TEST_FIRST",
    tagLabelKey: "tag_unknown",
    recommendedAction: "Mandatory Pre-Festival Baseline Sampling",
    actionKey: "action_test",
    confidence: "LOW",
    confidenceKey: "confidence_low",
    dataGapNote: "Durga 2025 table completely absent from published MPPCB compendium.",
    readings: {
      pre: { do: null, bod: null, ph: null, turbidity: null },
      during: { do: 3.2, bod: 7.4, ph: 7.8, turbidity: 70 },
      post: { do: null, bod: null, ph: null, turbidity: null }
    },
    metals: {
      chromium: "BDL",
      lead: "ND",
      zinc: 0.060,
      copper: "ND",
      spikeNotice: "Missing baseline makes jump estimation statistically invalid."
    },
    evidence: {
      reportYear: "2025",
      festival: "Durga Visarjan",
      pdfPage: 71,
      sourceUrl: "https://www.mppcb.mp.gov.in/proc/mon/Ganesh_and_Durga_visarjan_report-2025.pdf#page=71",
      printedNote: "Table absent for pre/post phases in official release; marked NOT SAMPLED."
    }
  }
];

export const SUMMARY_STATS = {
  totalGhats: 7,
  compliantGhats: 2,
  criticalActionGhats: 3,
  dataGapGhats: 2
};

export const TESTING_CHECKLIST_2026 = [
  {
    site: "Bairagarh (Sant Hirdaram) Kund",
    phase: "Pre-Immersion (17-18 Oct 2026)",
    parameters: "DO, BOD, pH, Heavy Metals (Pb, Cr, Zn)",
    reason: "Verify baseline DO recovery before Durga idols arrive"
  },
  {
    site: "Malikhedi Dedicated Immersion Kund",
    phase: "Pre-Immersion (17-18 Oct 2026)",
    parameters: "Full Class B Profile (DO, BOD, pH, Conductivity)",
    reason: "Missing 2025 baseline requires mandatory pre-event check"
  },
  {
    site: "Khatlapura Ghat Enclosure",
    phase: "Post-Immersion 7-Day (27-28 Oct 2026)",
    parameters: "BOD, COD, Dissolved Oxygen",
    reason: "Check whether persisting high BOD clears after aerator run"
  },
  {
    site: "Shahpura Lake Ghat (Manisha Kund)",
    phase: "During Immersion Peak (20 Oct 2026)",
    parameters: "DO hourly monitoring & Lead (Pb) screening",
    reason: "Track rapid oxygen drop during peak evening visarjan"
  }
];

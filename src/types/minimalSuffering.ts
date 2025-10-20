/**
 * Minimal Suffering Indicators (Oct 19, 2025)
 *
 * Dystopia baseline measurement using VERIFIABLE suffering metrics.
 * Following Option A from research-skeptic critique: track only hard-to-game indicators.
 *
 * Research Foundation:
 * - Fund for Peace (2024): Fragile States Index methodology
 * - Richardson et al. (2023): Planetary Boundaries Framework (Science Advances)
 * - FAO (2024): Integrated Food Security Phase Classification (IPC)
 * - V-Dem Institute (2024): Electoral Democracy Index
 * - UNHCR (2024): 110M forcibly displaced globally
 * - GBD (2024): Healthcare Access and Quality Index (Lancet Global Health)
 *
 * Design Principles:
 * 1. Track only VERIFIABLE metrics (deaths, displacement, hunger) - harder to game
 * 2. Use existing simulation data - no new inputs required
 * 3. NO AGGREGATION into single "dystopia index" (avoids Ravallion 2012 fallacy)
 * 4. Country-level tracking with confidence flags for data quality
 * 5. Focus on ACUTE SUFFERING, not relative well-being
 *
 * @see /research/welfare_quality_of_life_frameworks_20251019.md
 * @see /reviews/dystopia_utopia_index_critique_20251019.md
 */

/**
 * Tier 1: Verifiable Suffering Metrics (Hardest to Fake)
 *
 * These metrics are based on deaths, displacement, and physical deprivation.
 * Research shows these are hardest for authoritarian regimes to fabricate (Jerven 2013).
 */
export interface Tier1SufferingMetrics {
  // Excess mortality (vs historical baseline)
  excessMortalityRate: number;           // [0, 1] Deaths above baseline per capita
  baselineMortalityRate: number;         // Historical baseline for comparison
  monthlyExcessDeaths: number;           // Absolute number of excess deaths this month

  // Conflict deaths (per 100K population)
  conflictDeathsPer100K: number;         // [0, 1000+] Violent deaths per 100K
  conflictDeathsAbsolute: number;        // Total conflict deaths this month

  // Acute malnutrition (IPC Phase 3+)
  acuteMalnutritionPrevalence: number;   // [0, 1] % of population in IPC Phase 3+
  ipcPhase3Plus: number;                 // People in acute food insecurity
  ipcPhase5Catastrophic: number;         // People in famine conditions

  // Forced displacement (UNHCR methodology)
  forciblyDisplaced: number;             // Total displaced persons (absolute)
  displacementRate: number;              // [0, 1] % of population displaced
  newDisplacementsThisMonth: number;     // New displacement events
}

/**
 * Tier 2: Validated Structural Indicators (Harder to Game)
 *
 * Thresholds from peer-reviewed research (Fund for Peace, V-Dem, Richardson et al.)
 * These require consistent fabrication across multiple datasets to game.
 */
export interface Tier2StructuralIndicators {
  // State failure (Fund for Peace 2024)
  fragileStateIndex: number;             // [0, 120] FSI score (90+ = Alert/state failure)
  stateFailureActive: boolean;           // FSI >90 trigger

  // Environmental collapse (Richardson et al. 2023)
  planetaryBoundariesBreached: number;   // [0, 9] Number of boundaries breached
  environmentalCollapseActive: boolean;  // 6+ boundaries breached

  // Food crisis (FAO 2024)
  foodCrisisActive: boolean;             // IPC Phase 3+ affecting >20% population
  foodCrisisPopulation: number;          // People affected by food crisis

  // Authoritarianism (V-Dem 2024)
  electoralDemocracyIndex: number;       // [0, 1] V-Dem EDI (0.2 = autocracy threshold)
  authoritarianActive: boolean;          // EDI <0.2 trigger

  // Healthcare collapse (GBD 2024)
  haqIndex: number;                      // [0, 100] Healthcare Access & Quality
  healthcareCollapseActive: boolean;     // HAQ <30 (>50% preventable deaths)
}

/**
 * Country-level suffering tracker with confidence flags
 *
 * Tracks 15 key countries (Tier 2 from research), plus global aggregates.
 * Confidence flags indicate data quality (lower confidence in autocracies).
 */
export interface CountrySufferingMetrics {
  countryCode: string;                   // ISO 3166-1 alpha-3 code
  population: number;                    // Current population (for per-capita calculations)

  // Tier 1 metrics
  tier1Metrics: Tier1SufferingMetrics;

  // Tier 2 indicators
  tier2Indicators: Tier2StructuralIndicators;

  // Data quality flags
  dataConfidence: number;                // [0, 1] Data quality score
  dataQualityFlags: {
    authoritarianRegime: boolean;        // Likely data fabrication (Martinez 2022)
    conflictZone: boolean;               // Missing data due to conflict
    estimatedData: boolean;              // Satellite/proxy data used
    recentValidation: boolean;           // Verified in last 12 months
  };

  // Dystopia detection flags (NO AGGREGATION - just flags)
  dystopiaFlags: {
    acuteDystopia: boolean;              // Tier 1: Active mass death/suffering
    chronicDystopia: boolean;            // Tier 2: Structural violence/oppression
    existentialDystopia: boolean;        // Tier 3: Future theft (environmental collapse)
  };
}

/**
 * Global suffering aggregates
 *
 * Tracks worldwide suffering metrics. NO SINGLE INDEX - keep dimensions separate.
 */
export interface GlobalSufferingMetrics {
  // Population-weighted global averages
  globalExcessMortalityRate: number;     // Weighted average excess mortality
  globalConflictDeathRate: number;       // Weighted average conflict deaths/100K
  globalMalnutritionRate: number;        // Weighted average malnutrition
  globalDisplacementRate: number;        // Weighted average displacement

  // Absolute global totals
  totalExcessDeaths: number;             // Total global excess deaths this month
  totalConflictDeaths: number;           // Total global conflict deaths
  totalMalnourished: number;             // Total people in IPC Phase 3+
  totalDisplaced: number;                // Total forcibly displaced globally

  // Structural indicators (global counts)
  countriesInStateFailure: number;       // Count of countries with FSI >90
  countriesInFoodCrisis: number;         // Count with >20% in IPC Phase 3+
  countriesAutocratic: number;           // Count with V-Dem EDI <0.2
  countriesInHealthcareCollapse: number; // Count with HAQ <30

  // Global planetary boundaries status
  planetaryBoundariesBreached: number;   // [0, 9] Current breaches
  planetaryBoundariesHistory: Array<{    // Track boundary crossings
    month: number;
    boundariesBreached: number;
  }>;
}

/**
 * Historical tracking of suffering indicators
 *
 * Enables detection of trends, cascades, and recovery dynamics.
 */
export interface SufferingHistory {
  monthlySnapshots: Array<{
    month: number;
    globalMetrics: GlobalSufferingMetrics;
    worstCountries: string[];            // Top 5 countries by suffering this month
  }>;

  // Peak suffering events
  peakExcessMortality: {
    rate: number;
    month: number;
    countries: string[];
  };

  peakDisplacement: {
    total: number;
    month: number;
    countries: string[];
  };

  peakFoodCrisis: {
    affected: number;
    month: number;
    countries: string[];
  };
}

/**
 * Main Minimal Suffering System
 *
 * Dystopia baseline measurement system. Tracks verifiable suffering metrics
 * at country and global levels WITHOUT AGGREGATION into single index.
 *
 * Key insight from research-skeptic: "Track what you can verify, admit what you cannot."
 */
export interface MinimalSufferingSystem {
  // Country-level tracking (15 key countries + ROW aggregate)
  countryMetrics: Map<string, CountrySufferingMetrics>;

  // Global aggregates
  globalMetrics: GlobalSufferingMetrics;

  // Historical tracking
  history: SufferingHistory;

  // Baseline calibration (2025 starting values)
  baseline2025: {
    globalPopulation: number;            // 8.0B
    globalExcessMortality: number;       // Baseline rate
    globalDisplacement: number;          // 110M (UNHCR 2024)
    globalMalnutrition: number;          // 295M in IPC Phase 3+ (FAO 2024)
    planetaryBoundaries: number;         // 6 of 9 breached (Richardson 2023)
  };

  // Dystopia detection thresholds (research-validated)
  thresholds: {
    // Tier 1: Acute dystopia (mass death)
    excessMortalityThreshold: number;    // 0.10 = 10% excess death rate
    conflictDeathsThreshold: number;     // 100 per 100K = major war
    malnutritionThreshold: number;       // 0.20 = 20% in food crisis
    displacementThreshold: number;       // 0.10 = 10% displaced

    // Tier 2: Chronic dystopia (structural)
    fsiThreshold: number;                // 90 = state failure
    planetaryBoundariesThreshold: number;// 6 = environmental collapse
    foodCrisisThreshold: number;         // 0.20 = 20% in IPC Phase 3+
    autocracyThreshold: number;          // 0.2 = V-Dem EDI threshold
    haqThreshold: number;                // 30 = healthcare collapse
  };

  // Data quality tracking
  dataQuality: {
    authoritarianCountriesCount: number; // Countries with likely fabrication
    conflictZonesCount: number;          // Countries with missing data
    estimatedDataCountriesCount: number; // Countries using proxy data
    highConfidenceCountriesCount: number;// Countries with verified data
  };
}

/**
 * Dystopia classification (descriptive, not prescriptive)
 *
 * Three tiers of dystopia based on suffering type, NOT Western values.
 * Follows research-skeptic recommendation to focus on verifiable harm.
 */
export enum DystopiaType {
  // Tier 1: Acute dystopia (immediate death and suffering)
  ACUTE_MASS_DEATH = "acute_mass_death",              // High excess mortality
  ACUTE_CONFLICT = "acute_conflict",                  // High conflict deaths
  ACUTE_FAMINE = "acute_famine",                      // Mass malnutrition
  ACUTE_DISPLACEMENT = "acute_displacement",          // Mass displacement

  // Tier 2: Chronic dystopia (structural violence)
  CHRONIC_STATE_FAILURE = "chronic_state_failure",    // FSI >90
  CHRONIC_HEALTHCARE_COLLAPSE = "chronic_healthcare", // HAQ <30
  CHRONIC_AUTOCRACY = "chronic_autocracy",            // V-Dem EDI <0.2

  // Tier 3: Existential dystopia (future theft)
  EXISTENTIAL_ENVIRONMENTAL = "existential_environmental", // 6+ boundaries
  EXISTENTIAL_FOOD_SYSTEM = "existential_food_system",    // Food crisis >20%
}

/**
 * Dystopia detection result
 *
 * Flags active dystopias WITHOUT aggregating into single score.
 * Multiple dystopia types can coexist.
 */
export interface DystopiaDetection {
  activeDystopias: DystopiaType[];       // Currently active dystopia types
  affectedCountries: Map<DystopiaType, string[]>; // Countries by dystopia type
  globalPopulationAffected: Map<DystopiaType, number>; // People affected by type
  firstTriggeredMonth: Map<DystopiaType, number>; // When each dystopia began

  // Summary flags (for convenience, NOT aggregation)
  anyAcuteDystopia: boolean;             // Any Tier 1 active
  anyChronicDystopia: boolean;           // Any Tier 2 active
  anyExistentialDystopia: boolean;       // Any Tier 3 active
  multipleSimultaneous: boolean;         // 2+ dystopia types active
}

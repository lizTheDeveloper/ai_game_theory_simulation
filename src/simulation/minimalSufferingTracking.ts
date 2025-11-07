/**
 * Minimal Suffering Tracking System (Oct 19, 2025)
 *
 * Core logic for dystopia baseline measurement using verifiable suffering metrics.
 * Implements Option A from research-skeptic critique: focus on hard-to-game indicators.
 *
 * Research Foundation:
 * - Fund for Peace (2024): FSI methodology, 90+ threshold for state failure
 * - Richardson et al. (2023): Planetary boundaries, 6 of 9 breached
 * - FAO (2024): IPC classification, 295M in Phase 3+
 * - V-Dem (2024): Electoral Democracy Index, 0.2 threshold
 * - UNHCR (2024): 110M forcibly displaced
 * - Martinez (2022): Authoritarian GDP fabrication (+35% overstatement)
 *
 * Design Principles:
 * 1. Use existing simulation data (no new inputs)
 * 2. Track verifiable metrics only (deaths, displacement, hunger)
 * 3. Country-level with confidence flags (detect fabrication)
 * 4. NO AGGREGATION into single index (avoid Western bias)
 * 5. Focus on ACUTE SUFFERING, not relative well-being
 */

import { GameState } from '@/types/game';
import {
  MinimalSufferingSystem,
  CountrySufferingMetrics,
  Tier1SufferingMetrics,
  Tier2StructuralIndicators,
  GlobalSufferingMetrics,
  DystopiaType,
  DystopiaDetection
} from '@/types/minimalSuffering';

/**
 * 15 key countries for Tier 2 tracking (70% global population, 80% GDP, 75% emissions)
 *
 * Selection criteria from research:
 * - Geographic diversity (all continents)
 * - Population scale (1B+ or regional significance)
 * - Geopolitical importance (nuclear powers, hegemonic states)
 * - Vulnerability diversity (climate, conflict, autocracy)
 */
const KEY_COUNTRIES = [
  'USA', // United States
  'CHN', // China
  'IND', // India
  'BRA', // Brazil
  'RUS', // Russia
  'JPN', // Japan
  'IDN', // Indonesia
  'NGA', // Nigeria
  'PAK', // Pakistan
  'BGD', // Bangladesh
  'MEX', // Mexico
  'ETH', // Ethiopia
  'EGY', // Egypt
  'IRN', // Iran
  'TUR', // Turkey
] as const;

/**
 * 2025 baseline values from research
 *
 * Sources:
 * - UN World Population Prospects 2024: 8.0B global population
 * - UNHCR 2024: 110M forcibly displaced
 * - FAO 2024: 295M in IPC Phase 3+
 * - Richardson et al. 2023: 6 of 9 planetary boundaries breached
 * - WHO 2024: Baseline mortality ~0.8% per year
 */
const BASELINE_2025 = {
  globalPopulation: 8.0, // billions
  globalExcessMortality: 0.0, // No excess in baseline
  globalDisplacement: 110_000_000, // UNHCR 2024
  globalMalnutrition: 295_000_000, // FAO 2024 (IPC Phase 3+)
  planetaryBoundaries: 6, // Richardson et al. 2023
  baselineMortalityRate: 0.008, // 0.8% per year (WHO 2024)
};

/**
 * Research-validated thresholds for dystopia detection
 *
 * Sources:
 * - Fund for Peace 2024: FSI >90 = state failure
 * - Richardson et al. 2023: 6+ boundaries = environmental collapse
 * - FAO 2024: IPC Phase 3+ >20% = food crisis
 * - V-Dem 2024: EDI <0.2 = autocracy
 * - GBD 2024: HAQ <30 = healthcare collapse
 */
const DYSTOPIA_THRESHOLDS = {
  // Tier 1: Acute dystopia
  excessMortalityThreshold: 0.10, // 10% excess death rate
  conflictDeathsThreshold: 100, // per 100K (major war)
  malnutritionThreshold: 0.20, // 20% in food crisis
  displacementThreshold: 0.10, // 10% displaced

  // Tier 2: Chronic dystopia
  fsiThreshold: 90, // Fund for Peace 2024
  planetaryBoundariesThreshold: 6, // Richardson et al. 2023
  foodCrisisThreshold: 0.20, // 20% in IPC Phase 3+
  autocracyThreshold: 0.2, // V-Dem 2024
  haqThreshold: 30, // GBD 2024
};

/**
 * Initialize minimal suffering system with 2025 baseline values
 */
export function initializeMinimalSufferingSystem(): MinimalSufferingSystem {
  const countryMetrics = new Map<string, CountrySufferingMetrics>();

  // Initialize all key countries with baseline values
  for (const countryCode of KEY_COUNTRIES) {
    countryMetrics.set(countryCode, createCountryMetrics(countryCode));
  }

  // Add "Rest of World" aggregate
  countryMetrics.set('ROW', createCountryMetrics('ROW'));

  return {
    countryMetrics,
    globalMetrics: createGlobalMetrics(),
    history: {
      monthlySnapshots: [],
      peakExcessMortality: { rate: 0, month: 0, countries: [] },
      peakDisplacement: { total: BASELINE_2025.globalDisplacement, month: 0, countries: [] },
      peakFoodCrisis: { affected: BASELINE_2025.globalMalnutrition, month: 0, countries: [] },
    },
    baseline2025: BASELINE_2025,
    thresholds: DYSTOPIA_THRESHOLDS,
    dataQuality: {
      authoritarianCountriesCount: 0,
      conflictZonesCount: 0,
      estimatedDataCountriesCount: 0,
      highConfidenceCountriesCount: KEY_COUNTRIES.length,
    },
  };
}

/**
 * Create baseline country metrics
 */
function createCountryMetrics(countryCode: string): CountrySufferingMetrics {
  // Estimate population share (simplified - real implementation would use actual data)
  const populationShare = countryCode === 'ROW' ? 2.4 : 0.35; // billions

  return {
    countryCode,
    population: populationShare,
    tier1Metrics: {
      excessMortalityRate: 0,
      baselineMortalityRate: BASELINE_2025.baselineMortalityRate,
      monthlyExcessDeaths: 0,
      conflictDeathsPer100K: 0,
      conflictDeathsAbsolute: 0,
      acuteMalnutritionPrevalence: 0.03, // ~3% baseline (FAO 2024)
      ipcPhase3Plus: 0,
      ipcPhase5Catastrophic: 0,
      forciblyDisplaced: 0,
      displacementRate: 0,
      newDisplacementsThisMonth: 0,
    },
    tier2Indicators: {
      fragileStateIndex: 50, // Baseline stable state
      stateFailureActive: false,
      planetaryBoundariesBreached: BASELINE_2025.planetaryBoundaries,
      environmentalCollapseActive: true, // Already at 6 in 2025
      foodCrisisActive: false,
      foodCrisisPopulation: 0,
      electoralDemocracyIndex: 0.5, // Baseline moderate democracy
      authoritarianActive: false,
      haqIndex: 60, // Baseline moderate healthcare
      healthcareCollapseActive: false,
    },
    dataConfidence: 1.0, // High confidence initially
    dataQualityFlags: {
      authoritarianRegime: false,
      conflictZone: false,
      estimatedData: false,
      recentValidation: true,
    },
    dystopiaFlags: {
      acuteDystopia: false,
      chronicDystopia: false,
      existentialDystopia: true, // 6+ boundaries already breached
    },
  };
}

/**
 * Create baseline global metrics
 */
function createGlobalMetrics(): GlobalSufferingMetrics {
  return {
    globalExcessMortalityRate: 0,
    globalConflictDeathRate: 0,
    globalMalnutritionRate: 0.037, // 295M / 8B = 3.7% (FAO 2024)
    globalDisplacementRate: 0.014, // 110M / 8B = 1.4% (UNHCR 2024)
    totalExcessDeaths: 0,
    totalConflictDeaths: 0,
    totalMalnourished: BASELINE_2025.globalMalnutrition,
    totalDisplaced: BASELINE_2025.globalDisplacement,
    countriesInStateFailure: 0,
    countriesInFoodCrisis: 0,
    countriesAutocratic: 0,
    countriesInHealthcareCollapse: 0,
    planetaryBoundariesBreached: BASELINE_2025.planetaryBoundaries,
    planetaryBoundariesHistory: [
      { month: 0, boundariesBreached: BASELINE_2025.planetaryBoundaries },
    ],
  };
}

/**
 * Update minimal suffering system each month
 *
 * Extracts verifiable metrics from existing simulation state.
 * NO NEW INPUTS - uses existing deaths, displacement, conflict data.
 */
export function updateMinimalSufferingSystem(
  state: GameState
): void {
  const system = state.minimalSufferingSystem;

  // Update country-level metrics
  updateCountryMetrics(state, system);

  // Aggregate to global metrics
  updateGlobalMetrics(state, system);

  // Detect dystopia conditions
  detectDystopiaConditions(state, system);

  // Update data quality tracking
  updateDataQuality(state, system);

  // Record monthly snapshot
  recordMonthlySnapshot(state, system);
}

/**
 * Update country-level metrics from simulation state
 */
function updateCountryMetrics(state: GameState, system: MinimalSufferingSystem): void {
  for (const [countryCode, metrics] of system.countryMetrics) {
    // Extract metrics from existing simulation data
    updateTier1Metrics(state, metrics);
    updateTier2Indicators(state, metrics, system);
    updateDataConfidence(state, metrics);
    updateDystopiaFlags(metrics);
  }
}

/**
 * Update Tier 1 verifiable suffering metrics
 */
function updateTier1Metrics(state: GameState, metrics: CountrySufferingMetrics): void {
  const { tier1Metrics } = metrics;

  // Excess mortality (from population system)
  const currentMortality = state.humanPopulationSystem.adjustedDeathRate;
  tier1Metrics.excessMortalityRate = Math.max(0, currentMortality - tier1Metrics.baselineMortalityRate);
  tier1Metrics.monthlyExcessDeaths = tier1Metrics.excessMortalityRate * metrics.population * 1_000_000_000 / 12;

  // Conflict deaths (from nuclear states, wars, etc.)
  // Use population system's war deaths
  const warDeaths = state.humanPopulationSystem.deathsByCategory.war;
  tier1Metrics.conflictDeathsAbsolute = warDeaths;
  tier1Metrics.conflictDeathsPer100K = (warDeaths / (metrics.population * 1_000_000_000)) * 100_000;

  // Acute malnutrition (from famine system)
  const famineAffected = state.famineSystem?.activeFamines.reduce((sum, f) => sum + f.populationAtRisk, 0) || 0;
  tier1Metrics.ipcPhase3Plus = famineAffected;
  tier1Metrics.acuteMalnutritionPrevalence = famineAffected / (metrics.population * 1_000_000_000);

  // Check for catastrophic famine (IPC Phase 5)
  const isFamineActive = (state.famineSystem?.activeFamines.length || 0) > 0;
  tier1Metrics.ipcPhase5Catastrophic = isFamineActive ? famineAffected * 0.2 : 0; // ~20% in Phase 5 during famine

  // Forced displacement (from refugee crisis system)
  const displaced = state.refugeeCrisisSystem?.totalDisplaced || BASELINE_2025.globalDisplacement;
  const countryShare = metrics.population / 8.0; // Share of global population
  tier1Metrics.forciblyDisplaced = displaced * countryShare;
  tier1Metrics.displacementRate = tier1Metrics.forciblyDisplaced / (metrics.population * 1_000_000_000);
  tier1Metrics.newDisplacementsThisMonth = 0; // Could track from refugee system if available
}

/**
 * Update Tier 2 structural indicators
 */
function updateTier2Indicators(state: GameState, metrics: CountrySufferingMetrics, system: MinimalSufferingSystem): void {
  const { tier2Indicators } = metrics;

  // Validate population is positive (required for per-capita calculations)
  const populationBillions = assertFinite(metrics.population, {
    location: 'updateTier2Indicators',
    valueName: 'metrics.population',
    month: state.currentMonth,
    additionalInfo: { countryCode: metrics.countryCode }
  });

  if (populationBillions <= 0) {
    // Population is 0 or negative - set defaults and skip calculations
    tier2Indicators.fragileStateIndex = 50;
    tier2Indicators.stateFailureActive = false;
    tier2Indicators.planetaryBoundariesBreached = BASELINE_2025.planetaryBoundaries;
    tier2Indicators.environmentalCollapseActive = true;
    tier2Indicators.foodCrisisActive = false;
    tier2Indicators.foodCrisisPopulation = 0;
    tier2Indicators.electoralDemocracyIndex = 0.5;
    tier2Indicators.authoritarianActive = false;
    tier2Indicators.haqIndex = 60;
    tier2Indicators.healthcareCollapseActive = false;
    return;
  }

  // Fragile State Index (estimate from trust + violence + economic factors)
  // Research: FSI = Security + Economy + Politics + Social (12 indicators)
  // Simplified: Map simulation trust, violence, GDP to FSI scale
  const trust = assertProbability(state.society.trustInGovernment ?? 0.5, {
    location: 'updateTier2Indicators',
    valueName: 'society.trustInGovernment',
    month: state.currentMonth,
    additionalInfo: { countryCode: metrics.countryCode }
  });

  const warDeaths = assertFinite(state.humanPopulationSystem.deathsByCategory.war, {
    location: 'updateTier2Indicators',
    valueName: 'deathsByCategory.war',
    month: state.currentMonth,
    additionalInfo: { countryCode: metrics.countryCode }
  });

  const violence = assertFinite(warDeaths / (populationBillions * 1_000_000_000), {
    location: 'updateTier2Indicators',
    valueName: 'violence',
    month: state.currentMonth,
    additionalInfo: { warDeaths, populationBillions }
  });

  const gdpLevel = assertFinite(state.globalMetrics.qualityOfLife, {
    location: 'updateTier2Indicators',
    valueName: 'globalMetrics.qualityOfLife',
    month: state.currentMonth,
    additionalInfo: { countryCode: metrics.countryCode }
  });

  // FSI scale: 0 (stable) to 120 (failed)
  // Low trust → high FSI, high violence → high FSI, low GDP → high FSI
  const trustComponent = assertFinite((1 - trust) * 40, {
    location: 'updateTier2Indicators',
    valueName: 'trustComponent',
    month: state.currentMonth,
    additionalInfo: { trust }
  });

  const violenceComponent = assertFinite(Math.min(40, violence * 100_000), {
    location: 'updateTier2Indicators',
    valueName: 'violenceComponent',
    month: state.currentMonth,
    additionalInfo: { violence }
  });

  const economicComponent = assertFinite((1 - Math.min(1, gdpLevel / 100)) * 40, {
    location: 'updateTier2Indicators',
    valueName: 'economicComponent',
    month: state.currentMonth,
    additionalInfo: { gdpLevel }
  });

  tier2Indicators.fragileStateIndex = assertInRange(
    Math.min(120, trustComponent + violenceComponent + economicComponent),
    0,
    120,
    {
      location: 'updateTier2Indicators',
      valueName: 'fragileStateIndex',
      month: state.currentMonth,
      additionalInfo: { trustComponent, violenceComponent, economicComponent }
    }
  );

  const fsiThreshold = assertFinite(system.thresholds.fsiThreshold, {
    location: 'updateTier2Indicators',
    valueName: 'thresholds.fsiThreshold',
    month: state.currentMonth,
    additionalInfo: { fsi: tier2Indicators.fragileStateIndex }
  });

  tier2Indicators.stateFailureActive = tier2Indicators.fragileStateIndex >= fsiThreshold;

  // Planetary boundaries (from planetary boundaries system)
  const boundaries = assertInRange(
    state.planetaryBoundariesSystem?.boundariesBreached ?? BASELINE_2025.planetaryBoundaries,
    0,
    9,
    {
      location: 'updateTier2Indicators',
      valueName: 'planetaryBoundariesBreached',
      month: state.currentMonth,
      additionalInfo: { countryCode: metrics.countryCode }
    }
  );

  tier2Indicators.planetaryBoundariesBreached = boundaries;

  const pbThreshold = assertInRange(system.thresholds.planetaryBoundariesThreshold, 0, 9, {
    location: 'updateTier2Indicators',
    valueName: 'thresholds.planetaryBoundariesThreshold',
    month: state.currentMonth,
    additionalInfo: { boundaries }
  });

  tier2Indicators.environmentalCollapseActive = boundaries >= pbThreshold;

  // Food crisis (from famine system)
  const famineAffectedTier2 = assertFinite(
    state.famineSystem?.activeFamines.reduce((sum, f) => {
      const risk = assertFinite(f.populationAtRisk, {
        location: 'updateTier2Indicators',
        valueName: 'famine.populationAtRisk',
        month: state.currentMonth,
        additionalInfo: { countryCode: metrics.countryCode }
      });
      return sum + risk;
    }, 0) || 0,
    {
      location: 'updateTier2Indicators',
      valueName: 'famineAffectedTier2',
      month: state.currentMonth,
      additionalInfo: { countryCode: metrics.countryCode }
    }
  );

  tier2Indicators.foodCrisisPopulation = famineAffectedTier2;

  const foodCrisisRate = assertFinite(
    famineAffectedTier2 / (populationBillions * 1_000_000_000),
    {
      location: 'updateTier2Indicators',
      valueName: 'foodCrisisRate',
      month: state.currentMonth,
      additionalInfo: { famineAffectedTier2, populationBillions }
    }
  );

  const foodCrisisThreshold = assertProbability(system.thresholds.foodCrisisThreshold, {
    location: 'updateTier2Indicators',
    valueName: 'thresholds.foodCrisisThreshold',
    month: state.currentMonth,
    additionalInfo: { foodCrisisRate }
  });

  tier2Indicators.foodCrisisActive = foodCrisisRate >= foodCrisisThreshold;

  // Electoral democracy (estimate from government trust + freedom)
  // V-Dem EDI scale: 0 (autocracy) to 1 (democracy)
  // Simplified: Map from government trust + civil liberties
  const civilLiberties = assertFinite(state.globalMetrics.qualityOfLife, {
    location: 'updateTier2Indicators',
    valueName: 'globalMetrics.qualityOfLife (civilLiberties)',
    month: state.currentMonth,
    additionalInfo: { countryCode: metrics.countryCode }
  });

  tier2Indicators.electoralDemocracyIndex = assertProbability(
    Math.max(0, Math.min(1, trust * 0.5 + civilLiberties * 0.005)),
    {
      location: 'updateTier2Indicators',
      valueName: 'electoralDemocracyIndex',
      month: state.currentMonth,
      additionalInfo: { trust, civilLiberties }
    }
  );

  const autocracyThreshold = assertProbability(system.thresholds.autocracyThreshold, {
    location: 'updateTier2Indicators',
    valueName: 'thresholds.autocracyThreshold',
    month: state.currentMonth,
    additionalInfo: { edi: tier2Indicators.electoralDemocracyIndex }
  });

  tier2Indicators.authoritarianActive = tier2Indicators.electoralDemocracyIndex < autocracyThreshold;

  // Healthcare Access & Quality (from QoL health dimension)
  // HAQ scale: 0 (worst) to 100 (best)
  const healthQoL = assertProbability(state.qualityOfLifeSystems?.health ?? 0.6, {
    location: 'updateTier2Indicators',
    valueName: 'qualityOfLifeSystems.health',
    month: state.currentMonth,
    additionalInfo: { countryCode: metrics.countryCode }
  });

  tier2Indicators.haqIndex = assertInRange(healthQoL * 100, 0, 100, {
    location: 'updateTier2Indicators',
    valueName: 'haqIndex',
    month: state.currentMonth,
    additionalInfo: { healthQoL }
  });

  const haqThreshold = assertInRange(system.thresholds.haqThreshold, 0, 100, {
    location: 'updateTier2Indicators',
    valueName: 'thresholds.haqThreshold',
    month: state.currentMonth,
    additionalInfo: { haqIndex: tier2Indicators.haqIndex }
  });

  tier2Indicators.healthcareCollapseActive = tier2Indicators.haqIndex < haqThreshold;
}

/**
 * Update data confidence flags
 *
 * Research: Martinez (2022) - autocracies overstate GDP by 35%
 * Jerven (2013) - conflict zones have 30-40% missing data
 */
function updateDataConfidence(state: GameState, metrics: CountrySufferingMetrics): void {
  const { dataQualityFlags, tier2Indicators } = metrics;

  // Check for authoritarian regime (low democracy → likely fabrication)
  dataQualityFlags.authoritarianRegime = tier2Indicators.electoralDemocracyIndex < 0.3;

  // Check for conflict zone (high violence → missing data)
  const conflictActive = metrics.tier1Metrics.conflictDeathsPer100K > 50;
  dataQualityFlags.conflictZone = conflictActive;

  // Check for state failure (FSI >80 → estimated data)
  dataQualityFlags.estimatedData = tier2Indicators.fragileStateIndex > 80;

  // Update recent validation flag (always false in simulation)
  dataQualityFlags.recentValidation = false;

  // Calculate overall confidence (Martinez 2022: -35% for autocracies, Jerven 2013: -40% for conflict)
  let confidence = 1.0;
  if (dataQualityFlags.authoritarianRegime) confidence *= 0.65; // -35% Martinez adjustment
  if (dataQualityFlags.conflictZone) confidence *= 0.6; // -40% Jerven adjustment
  if (dataQualityFlags.estimatedData) confidence *= 0.7; // -30% estimation penalty

  metrics.dataConfidence = Math.max(0.1, confidence); // Floor at 10%
}

/**
 * Update dystopia flags for country
 */
function updateDystopiaFlags(metrics: CountrySufferingMetrics): void {
  const { tier1Metrics, tier2Indicators, dystopiaFlags } = metrics;

  // Tier 1: Acute dystopia (immediate suffering)
  dystopiaFlags.acuteDystopia = (
    tier1Metrics.excessMortalityRate > 0.05 || // 5% excess deaths
    tier1Metrics.conflictDeathsPer100K > 50 || // Major conflict
    tier1Metrics.acuteMalnutritionPrevalence > 0.10 || // 10% malnourished
    tier1Metrics.displacementRate > 0.05 // 5% displaced
  );

  // Tier 2: Chronic dystopia (structural violence)
  dystopiaFlags.chronicDystopia = (
    tier2Indicators.stateFailureActive ||
    tier2Indicators.authoritarianActive ||
    tier2Indicators.healthcareCollapseActive
  );

  // Tier 3: Existential dystopia (future theft)
  dystopiaFlags.existentialDystopia = (
    tier2Indicators.environmentalCollapseActive ||
    tier2Indicators.foodCrisisActive
  );
}

/**
 * Update global aggregates
 */
function updateGlobalMetrics(state: GameState, system: MinimalSufferingSystem): void {
  const { globalMetrics, countryMetrics } = system;

  // Reset aggregates (initialize to 0)
  let totalPop = 0;
  let weightedExcessMortality = 0;
  let weightedConflictDeaths = 0;
  let weightedMalnutrition = 0;
  let weightedDisplacement = 0;

  globalMetrics.totalExcessDeaths = 0;
  globalMetrics.totalConflictDeaths = 0;
  globalMetrics.totalMalnourished = 0;
  globalMetrics.totalDisplaced = 0;

  globalMetrics.countriesInStateFailure = 0;
  globalMetrics.countriesInFoodCrisis = 0;
  globalMetrics.countriesAutocratic = 0;
  globalMetrics.countriesInHealthcareCollapse = 0;

  // Aggregate across countries
  for (const metrics of countryMetrics.values()) {
    const pop = assertFinite(metrics.population, {
      location: 'updateGlobalMetrics',
      valueName: 'metrics.population',
      month: state.currentMonth,
      additionalInfo: { countryCode: metrics.countryCode }
    });

    totalPop = assertFinite(totalPop + pop, {
      location: 'updateGlobalMetrics',
      valueName: 'totalPop',
      month: state.currentMonth,
      additionalInfo: { currentTotal: totalPop, adding: pop }
    });

    // Population-weighted averages
    const excessMortalityRate = assertFinite(metrics.tier1Metrics.excessMortalityRate, {
      location: 'updateGlobalMetrics',
      valueName: 'tier1Metrics.excessMortalityRate',
      month: state.currentMonth,
      additionalInfo: { countryCode: metrics.countryCode }
    });

    weightedExcessMortality = assertFinite(
      weightedExcessMortality + excessMortalityRate * pop,
      {
        location: 'updateGlobalMetrics',
        valueName: 'weightedExcessMortality',
        month: state.currentMonth,
        additionalInfo: { excessMortalityRate, pop }
      }
    );

    const conflictDeathsPer100K = assertFinite(metrics.tier1Metrics.conflictDeathsPer100K, {
      location: 'updateGlobalMetrics',
      valueName: 'tier1Metrics.conflictDeathsPer100K',
      month: state.currentMonth,
      additionalInfo: { countryCode: metrics.countryCode }
    });

    weightedConflictDeaths = assertFinite(
      weightedConflictDeaths + conflictDeathsPer100K * pop,
      {
        location: 'updateGlobalMetrics',
        valueName: 'weightedConflictDeaths',
        month: state.currentMonth,
        additionalInfo: { conflictDeathsPer100K, pop }
      }
    );

    const malnutritionPrevalence = assertFinite(metrics.tier1Metrics.acuteMalnutritionPrevalence, {
      location: 'updateGlobalMetrics',
      valueName: 'tier1Metrics.acuteMalnutritionPrevalence',
      month: state.currentMonth,
      additionalInfo: { countryCode: metrics.countryCode }
    });

    weightedMalnutrition = assertFinite(
      weightedMalnutrition + malnutritionPrevalence * pop,
      {
        location: 'updateGlobalMetrics',
        valueName: 'weightedMalnutrition',
        month: state.currentMonth,
        additionalInfo: { malnutritionPrevalence, pop }
      }
    );

    const displacementRate = assertFinite(metrics.tier1Metrics.displacementRate, {
      location: 'updateGlobalMetrics',
      valueName: 'tier1Metrics.displacementRate',
      month: state.currentMonth,
      additionalInfo: { countryCode: metrics.countryCode }
    });

    weightedDisplacement = assertFinite(
      weightedDisplacement + displacementRate * pop,
      {
        location: 'updateGlobalMetrics',
        valueName: 'weightedDisplacement',
        month: state.currentMonth,
        additionalInfo: { displacementRate, pop }
      }
    );

    // Absolute totals
    const monthlyExcessDeaths = assertFinite(metrics.tier1Metrics.monthlyExcessDeaths, {
      location: 'updateGlobalMetrics',
      valueName: 'tier1Metrics.monthlyExcessDeaths',
      month: state.currentMonth,
      additionalInfo: { countryCode: metrics.countryCode }
    });

    globalMetrics.totalExcessDeaths = assertFinite(
      globalMetrics.totalExcessDeaths + monthlyExcessDeaths,
      {
        location: 'updateGlobalMetrics',
        valueName: 'totalExcessDeaths',
        month: state.currentMonth,
        additionalInfo: { currentTotal: globalMetrics.totalExcessDeaths, adding: monthlyExcessDeaths }
      }
    );

    const conflictDeathsAbsolute = assertFinite(metrics.tier1Metrics.conflictDeathsAbsolute, {
      location: 'updateGlobalMetrics',
      valueName: 'tier1Metrics.conflictDeathsAbsolute',
      month: state.currentMonth,
      additionalInfo: { countryCode: metrics.countryCode }
    });

    globalMetrics.totalConflictDeaths = assertFinite(
      globalMetrics.totalConflictDeaths + conflictDeathsAbsolute,
      {
        location: 'updateGlobalMetrics',
        valueName: 'totalConflictDeaths',
        month: state.currentMonth,
        additionalInfo: { currentTotal: globalMetrics.totalConflictDeaths, adding: conflictDeathsAbsolute }
      }
    );

    const ipcPhase3Plus = assertFinite(metrics.tier1Metrics.ipcPhase3Plus, {
      location: 'updateGlobalMetrics',
      valueName: 'tier1Metrics.ipcPhase3Plus',
      month: state.currentMonth,
      additionalInfo: { countryCode: metrics.countryCode }
    });

    globalMetrics.totalMalnourished = assertFinite(
      globalMetrics.totalMalnourished + ipcPhase3Plus,
      {
        location: 'updateGlobalMetrics',
        valueName: 'totalMalnourished',
        month: state.currentMonth,
        additionalInfo: { currentTotal: globalMetrics.totalMalnourished, adding: ipcPhase3Plus }
      }
    );

    const forciblyDisplaced = assertFinite(metrics.tier1Metrics.forciblyDisplaced, {
      location: 'updateGlobalMetrics',
      valueName: 'tier1Metrics.forciblyDisplaced',
      month: state.currentMonth,
      additionalInfo: { countryCode: metrics.countryCode }
    });

    globalMetrics.totalDisplaced = assertFinite(
      globalMetrics.totalDisplaced + forciblyDisplaced,
      {
        location: 'updateGlobalMetrics',
        valueName: 'totalDisplaced',
        month: state.currentMonth,
        additionalInfo: { currentTotal: globalMetrics.totalDisplaced, adding: forciblyDisplaced }
      }
    );

    // Count countries in dystopian conditions
    if (metrics.tier2Indicators.stateFailureActive) globalMetrics.countriesInStateFailure++;
    if (metrics.tier2Indicators.foodCrisisActive) globalMetrics.countriesInFoodCrisis++;
    if (metrics.tier2Indicators.authoritarianActive) globalMetrics.countriesAutocratic++;
    if (metrics.tier2Indicators.healthcareCollapseActive) globalMetrics.countriesInHealthcareCollapse++;
  }

  // Calculate weighted averages
  if (totalPop > 0) {
    globalMetrics.globalExcessMortalityRate = assertFinite(
      weightedExcessMortality / totalPop,
      {
        location: 'updateGlobalMetrics',
        valueName: 'globalExcessMortalityRate',
        month: state.currentMonth,
        additionalInfo: { weightedExcessMortality, totalPop }
      }
    );

    globalMetrics.globalConflictDeathRate = assertFinite(
      weightedConflictDeaths / totalPop,
      {
        location: 'updateGlobalMetrics',
        valueName: 'globalConflictDeathRate',
        month: state.currentMonth,
        additionalInfo: { weightedConflictDeaths, totalPop }
      }
    );

    globalMetrics.globalMalnutritionRate = assertFinite(
      weightedMalnutrition / totalPop,
      {
        location: 'updateGlobalMetrics',
        valueName: 'globalMalnutritionRate',
        month: state.currentMonth,
        additionalInfo: { weightedMalnutrition, totalPop }
      }
    );

    globalMetrics.globalDisplacementRate = assertFinite(
      weightedDisplacement / totalPop,
      {
        location: 'updateGlobalMetrics',
        valueName: 'globalDisplacementRate',
        month: state.currentMonth,
        additionalInfo: { weightedDisplacement, totalPop }
      }
    );
  }

  // Update planetary boundaries from simulation state
  const boundaries = assertInRange(
    state.planetaryBoundariesSystem?.boundariesBreached ?? BASELINE_2025.planetaryBoundaries,
    0,
    9,
    {
      location: 'updateGlobalMetrics',
      valueName: 'planetaryBoundariesBreached',
      month: state.currentMonth
    }
  );

  globalMetrics.planetaryBoundariesBreached = boundaries;

  // Record boundary changes
  const lastSnapshot = globalMetrics.planetaryBoundariesHistory[globalMetrics.planetaryBoundariesHistory.length - 1];
  if (!lastSnapshot || lastSnapshot.boundariesBreached !== boundaries) {
    globalMetrics.planetaryBoundariesHistory.push({
      month: state.currentMonth,
      boundariesBreached: boundaries,
    });
  }
}

/**
 * Detect active dystopia conditions
 */
function detectDystopiaConditions(state: GameState, system: MinimalSufferingSystem): DystopiaDetection {
  const activeDystopias: DystopiaType[] = [];
  const affectedCountries = new Map<DystopiaType, string[]>();
  const globalPopulationAffected = new Map<DystopiaType, number>();
  const firstTriggeredMonth = new Map<DystopiaType, number>();

  // Validate thresholds before use
  const excessMortalityThreshold = assertProbability(system.thresholds.excessMortalityThreshold, {
    location: 'detectDystopiaConditions',
    valueName: 'thresholds.excessMortalityThreshold',
    month: state.currentMonth
  });

  const conflictDeathsThreshold = assertFinite(system.thresholds.conflictDeathsThreshold, {
    location: 'detectDystopiaConditions',
    valueName: 'thresholds.conflictDeathsThreshold',
    month: state.currentMonth
  });

  const malnutritionThreshold = assertProbability(system.thresholds.malnutritionThreshold, {
    location: 'detectDystopiaConditions',
    valueName: 'thresholds.malnutritionThreshold',
    month: state.currentMonth
  });

  const displacementThreshold = assertProbability(system.thresholds.displacementThreshold, {
    location: 'detectDystopiaConditions',
    valueName: 'thresholds.displacementThreshold',
    month: state.currentMonth
  });

  // Check each dystopia type across all countries
  for (const [countryCode, metrics] of system.countryMetrics) {
    const { tier1Metrics, tier2Indicators } = metrics;

    // Validate population for affected calculations
    const population = assertFinite(metrics.population, {
      location: 'detectDystopiaConditions',
      valueName: 'metrics.population',
      month: state.currentMonth,
      additionalInfo: { countryCode }
    });

    // Tier 1: Acute dystopias
    const excessMortalityRate = assertFinite(tier1Metrics.excessMortalityRate, {
      location: 'detectDystopiaConditions',
      valueName: 'tier1Metrics.excessMortalityRate',
      month: state.currentMonth,
      additionalInfo: { countryCode }
    });

    if (excessMortalityRate > excessMortalityThreshold) {
      addDystopia(DystopiaType.ACUTE_MASS_DEATH, countryCode, population);
    }

    const conflictDeathsPer100K = assertFinite(tier1Metrics.conflictDeathsPer100K, {
      location: 'detectDystopiaConditions',
      valueName: 'tier1Metrics.conflictDeathsPer100K',
      month: state.currentMonth,
      additionalInfo: { countryCode }
    });

    if (conflictDeathsPer100K > conflictDeathsThreshold) {
      addDystopia(DystopiaType.ACUTE_CONFLICT, countryCode, population);
    }

    const malnutritionPrevalence = assertFinite(tier1Metrics.acuteMalnutritionPrevalence, {
      location: 'detectDystopiaConditions',
      valueName: 'tier1Metrics.acuteMalnutritionPrevalence',
      month: state.currentMonth,
      additionalInfo: { countryCode }
    });

    if (malnutritionPrevalence > malnutritionThreshold) {
      addDystopia(DystopiaType.ACUTE_FAMINE, countryCode, population);
    }

    const displacementRate = assertFinite(tier1Metrics.displacementRate, {
      location: 'detectDystopiaConditions',
      valueName: 'tier1Metrics.displacementRate',
      month: state.currentMonth,
      additionalInfo: { countryCode }
    });

    if (displacementRate > displacementThreshold) {
      addDystopia(DystopiaType.ACUTE_DISPLACEMENT, countryCode, population);
    }

    // Tier 2: Chronic dystopias
    if (tier2Indicators.stateFailureActive) {
      addDystopia(DystopiaType.CHRONIC_STATE_FAILURE, countryCode, population);
    }
    if (tier2Indicators.healthcareCollapseActive) {
      addDystopia(DystopiaType.CHRONIC_HEALTHCARE_COLLAPSE, countryCode, population);
    }
    if (tier2Indicators.authoritarianActive) {
      addDystopia(DystopiaType.CHRONIC_AUTOCRACY, countryCode, population);
    }

    // Tier 3: Existential dystopias (global, not country-specific)
    if (tier2Indicators.environmentalCollapseActive) {
      addDystopia(DystopiaType.EXISTENTIAL_ENVIRONMENTAL, countryCode, population);
    }
    if (tier2Indicators.foodCrisisActive) {
      addDystopia(DystopiaType.EXISTENTIAL_FOOD_SYSTEM, countryCode, population);
    }
  }

  function addDystopia(type: DystopiaType, country: string, population: number): void {
    if (!activeDystopias.includes(type)) {
      activeDystopias.push(type);
    }

    if (!affectedCountries.has(type)) {
      affectedCountries.set(type, []);
    }
    affectedCountries.get(type)!.push(country);

    const currentAffected = globalPopulationAffected.get(type) || 0;
    const populationAbsolute = assertFinite(population * 1_000_000_000, {
      location: 'detectDystopiaConditions.addDystopia',
      valueName: 'populationAbsolute',
      month: state.currentMonth,
      additionalInfo: { country, population }
    });

    const newAffected = assertFinite(currentAffected + populationAbsolute, {
      location: 'detectDystopiaConditions.addDystopia',
      valueName: 'newAffected',
      month: state.currentMonth,
      additionalInfo: { currentAffected, adding: populationAbsolute }
    });

    globalPopulationAffected.set(type, newAffected);

    if (!firstTriggeredMonth.has(type)) {
      firstTriggeredMonth.set(type, state.currentMonth);
    }
  }

  return {
    activeDystopias,
    affectedCountries,
    globalPopulationAffected,
    firstTriggeredMonth,
    anyAcuteDystopia: activeDystopias.some(d => d.startsWith('acute_')),
    anyChronicDystopia: activeDystopias.some(d => d.startsWith('chronic_')),
    anyExistentialDystopia: activeDystopias.some(d => d.startsWith('existential_')),
    multipleSimultaneous: activeDystopias.length >= 2,
  };
}

/**
 * Update data quality tracking
 */
function updateDataQuality(state: GameState, system: MinimalSufferingSystem): void {
  const { dataQuality, countryMetrics } = system;

  dataQuality.authoritarianCountriesCount = 0;
  dataQuality.conflictZonesCount = 0;
  dataQuality.estimatedDataCountriesCount = 0;
  dataQuality.highConfidenceCountriesCount = 0;

  for (const metrics of countryMetrics.values()) {
    if (metrics.dataQualityFlags.authoritarianRegime) dataQuality.authoritarianCountriesCount++;
    if (metrics.dataQualityFlags.conflictZone) dataQuality.conflictZonesCount++;
    if (metrics.dataQualityFlags.estimatedData) dataQuality.estimatedDataCountriesCount++;
    if (metrics.dataConfidence > 0.8) dataQuality.highConfidenceCountriesCount++;
  }
}

/**
 * Record monthly snapshot for historical tracking
 */
function recordMonthlySnapshot(state: GameState, system: MinimalSufferingSystem): void {
  const { history, globalMetrics, countryMetrics } = system;

  // Find worst 5 countries by excess mortality
  const worstCountries = Array.from(countryMetrics.entries())
    .sort((a, b) => b[1].tier1Metrics.excessMortalityRate - a[1].tier1Metrics.excessMortalityRate)
    .slice(0, 5)
    .map(([code]) => code);

  // Add snapshot
  history.monthlySnapshots.push({
    month: state.currentMonth,
    globalMetrics: JSON.parse(JSON.stringify(globalMetrics)), // Deep clone
    worstCountries,
  });

  // Update peak tracking
  if (globalMetrics.globalExcessMortalityRate > history.peakExcessMortality.rate) {
    history.peakExcessMortality = {
      rate: globalMetrics.globalExcessMortalityRate,
      month: state.currentMonth,
      countries: worstCountries,
    };
  }

  if (globalMetrics.totalDisplaced > history.peakDisplacement.total) {
    history.peakDisplacement = {
      total: globalMetrics.totalDisplaced,
      month: state.currentMonth,
      countries: worstCountries,
    };
  }

  if (globalMetrics.totalMalnourished > history.peakFoodCrisis.affected) {
    history.peakFoodCrisis = {
      affected: globalMetrics.totalMalnourished,
      month: state.currentMonth,
      countries: worstCountries,
    };
  }

  // Limit snapshot history to last 120 months (10 years)
  if (history.monthlySnapshots.length > 120) {
    history.monthlySnapshots.shift();
  }
}

/**
 * Get dystopia detection summary
 */
export function getDystopiaDetection(state: GameState): DystopiaDetection {
  return detectDystopiaConditions(state, state.minimalSufferingSystem);
}

/**
 * Log suffering metrics (for debugging and validation)
 */
export function logSufferingMetrics(state: GameState): void {
  const { globalMetrics, dataQuality } = state.minimalSufferingSystem;
  const detection = getDystopiaDetection(state);

  console.log(`\n=== Minimal Suffering Indicators (Month ${state.currentMonth}) ===`);

  // Global metrics
  console.log(`  Global Excess Mortality: ${(globalMetrics.globalExcessMortalityRate * 100).toFixed(2)}%`);
  console.log(`  Global Conflict Deaths: ${globalMetrics.globalConflictDeathRate.toFixed(1)}/100K`);
  console.log(`  Global Malnutrition: ${(globalMetrics.globalMalnutritionRate * 100).toFixed(1)}%`);
  console.log(`  Global Displacement: ${(globalMetrics.globalDisplacementRate * 100).toFixed(1)}%`);

  // Absolute totals
  console.log(`  Total Excess Deaths: ${(globalMetrics.totalExcessDeaths / 1_000_000).toFixed(2)}M`);
  console.log(`  Total Malnourished: ${(globalMetrics.totalMalnourished / 1_000_000).toFixed(1)}M`);
  console.log(`  Total Displaced: ${(globalMetrics.totalDisplaced / 1_000_000).toFixed(1)}M`);

  // Structural indicators
  console.log(`  Planetary Boundaries Breached: ${globalMetrics.planetaryBoundariesBreached}/9`);
  console.log(`  Countries in State Failure: ${globalMetrics.countriesInStateFailure}`);
  console.log(`  Countries Autocratic: ${globalMetrics.countriesAutocratic}`);
  console.log(`  Countries in Food Crisis: ${globalMetrics.countriesInFoodCrisis}`);

  // Dystopia detection
  if (detection.activeDystopias.length > 0) {
    console.warn(`  ⚠️ Active Dystopias: ${detection.activeDystopias.join(', ')}`);
  }

  // Data quality
  console.log(`  Data Quality: ${dataQuality.highConfidenceCountriesCount}/${dataQuality.authoritarianCountriesCount + dataQuality.conflictZonesCount + dataQuality.highConfidenceCountriesCount} high confidence`);
  if (dataQuality.authoritarianCountriesCount > 0) {
    console.warn(`  ⚠️ ${dataQuality.authoritarianCountriesCount} authoritarian regimes (likely data fabrication)`);
  }
}

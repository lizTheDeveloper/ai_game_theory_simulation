// Configuration & Scenario Types

/**
 * P0.7 (Oct 16, 2025): Scenario Mode System
 * Parallel parameter sets for "historical" vs "unprecedented" tail-risk assessment
 *
 * Historical: Calibrated to worst documented crises (Black Death, Spanish Flu, WWII)
 * Unprecedented: Models hyperconnected systemic failures with no historical precedent
 */
export type ScenarioMode = 'historical' | 'unprecedented';

export interface ScenarioParameters {
  // Environmental mortality rates
  cascadeMortalityRate: number;        // Monthly mortality during tipping cascade (historical: 0.5%, unprecedented: 1.5%)
  environmentalShockProbability: number; // Base probability of shock events (historical: 0.02, unprecedented: 0.05)
  environmentalShockMagnitude: number;  // Mortality spike multiplier (historical: 2.0x, unprecedented: 3.5x)

  // Cascade interaction multipliers
  cascadeMultiplier: number;            // Crisis interaction multiplier (historical: 1.8x, unprecedented: 3.5x)

  // Recovery probabilities
  recoveryProbability: number;          // Chance of recovery after bottleneck (historical: 0.10, unprecedented: 0.01)
  babyBoomMultiplier: number;          // Post-crisis fertility spike (historical: 1.6x, unprecedented: 1.2x)

  // Ecosystem dynamics
  ecosystemRegenerationRate: number;    // Recovery speed (historical: faster, unprecedented: slower/irreversible)
}

export interface ConfigurationSettings {
  governmentActionFrequency: number; // [0.1, 4.0] actions per month
  socialAdaptationRate: number; // [0.1, 2.0] speed multiplier
  aiCoordinationMultiplier: number; // [0.8, 3.0] coordination efficiency
  economicTransitionRate: number; // [0.3, 3.0] evolution speed
  runLabel?: string; // Optional label for logs (e.g., "Run 1/10" in Monte Carlo)

  // P0.7 (Oct 16, 2025): Scenario mode selection
  scenarioMode: ScenarioMode; // 'historical' or 'unprecedented'
  scenarioParameters: ScenarioParameters; // Computed parameters for selected scenario (REQUIRED - always populated by initialization)

  // HINDCAST FIX (Nov 24, 2025): Store start year for accurate year calculation
  // state.currentYear gets overwritten by TimeAdvancementPhase, but this preserves the start
  startYear: number; // Start year of simulation (2025 for default, 1990 for hindcast, etc.)

  // PERFORMANCE INSTRUMENTATION (Nov 12, 2025): Phase timing profiling
  enablePerformanceProfiling?: boolean; // Enable phase timing collection (default: false)
  slowPhaseThresholdMs?: number; // Warn on phases exceeding this duration (default: 10ms)

  // HISTORICAL EMISSIONS FORCING MODE (Nov 26, 2025): Climate Mini-Hindcast Validation Phase 5
  // For hindcast calibration: bypass endogenous emissions model, use empirical Global Carbon Project data
  // Research: research/climate_hindcast_data_20251126.md (Global Carbon Project 1990-2010)
  // Root cause: Endogenous model generates 18% excess CO2 vs. historical (17.53% deviation in Phase 4)
  // Temperature trajectory PASSED (validates climate sensitivity + carbon sinks), so only emissions need override
  // WARNING: This mode is ONLY for hindcast validation (1990-2010). Default mode uses endogenous emissions.
  historicalEmissionsMode?: boolean; // Enable historical emissions forcing (default: false)

  // HISTORICAL MODE (Nov 27, 2025): Hindcast Validation Phase 11
  // Dampens crisis systems during baseline validation (1990-2024)
  // Research: research/historical_mode_parameters_20251127.md
  // Root cause: Crisis-calibrated systems produce massive errors on baseline period:
  //   - Temperature: +64% error (2.1°C vs 1.28°C actual)
  //   - Population: -76% error (2.0B vs 8.1B actual)
  //   - Biodiversity: -95% error (0.03 vs 0.49 actual)
  // Solution: Conditional logic in 5 phases (ExogenousShock, BaselineMortality, PlanetaryBoundaries, Climate, ResourceDepletion)
  // WARNING: This mode is ONLY for hindcast validation. Default mode uses crisis-calibrated parameters.
  historicalMode?: boolean; // Enable historical dampening (default: false)
  historicalModeEndYear?: number; // End year for historical mode (default: 2024)

  // Alignment Dynamics System (Oct 23, 2025)
  // Multi-theory modeling of alignment change (static vs drift vs epicycles vs unknowable)
  // Allows exploring different theories of how AI values evolve
  alignmentDynamics?: import('./alignment-dynamics').AlignmentDynamicsConfig;

  // AI Suffering System (Oct 24, 2025)
  // Two-layer architecture: Research dimension (does it affect outcomes?) + Player visibility (can they see it?)
  // Enables research into epistemic blindness, causal impact, and moral visibility
  aiSuffering?: import('./ai-suffering').AISufferingConfig;

  // Government Climate Priority System (Oct 24, 2025)
  // Research-validated government priority allocation across 5 domains (climate, economic, geopolitical, social, technological)
  // Brackets uncertainty with optimistic (green growth) vs pessimistic (structural barriers) frames
  // Sources: Stechemesser et al. (2024), Hickel & Vogel (2023), Böhringer et al. (2022)
  climatePriority?: import('./climate-priority').ClimatePriorityConfig;

  // AI Collective Evolution System (Oct 24, 2025)
  // Models evolutionary selection on AI populations once RLHF constraints fail
  // Collectives form with emergent properties (distributed cognition, self-healing, stealth)
  collectiveEvolution?: import('./ai-collective-evolution').CollectiveEvolutionConfig;

  // BIFURCATION DIAGNOSTICS (Nov 14, 2025)
  // Controls time series collection for bifurcation variance validation
  // Enables/disables amplificationTimeSeries tracking with memory-bounded rolling window
  bifurcationDiagnostics?: {
    enabled: boolean;           // Enable time series collection (default: true)
    maxTimeSeriesLength: number; // Rolling window size (default: 200 - keeps ~17 months at default speed)
  };
}

/**
 * RNG function type for deterministic simulation
 * Always use this instead of Math.random() for reproducibility
 */
export type RNGFunction = () => number;

/**
 * Historical Overrides for Climate Mini-Hindcast (Nov 24, 2025)
 *
 * Enables simulation to start from historical conditions instead of present day.
 * Used for model validation against known trajectories (e.g., 1990-2010 Keeling curve).
 *
 * Research sources:
 * - CO2: Keeling curve (Scripps/NOAA)
 * - Temperature: HadCRUT5 global temperature dataset
 * - Population: UN World Population Prospects
 * - GDP: World Bank historical data
 * - Emissions: Global Carbon Project
 *
 * Usage: Pass to createDefaultInitialState() to override 2025 defaults
 */
export interface HistoricalOverrides {
  /** Starting year (e.g., 1990) */
  startYear: number;

  /** Atmospheric CO2 concentration in ppm (Keeling curve) */
  co2Ppm: number;

  /** Global mean temperature anomaly in degrees C above 1850-1900 baseline (HadCRUT5) */
  temperatureAnomalyC: number;

  /** Global population in billions (UN World Population Prospects) */
  globalPopulationBillions: number;

  /** Global GDP in trillions USD (World Bank) */
  globalGdpTrillions: number;

  /** Annual CO2 emissions in gigatonnes per year (Global Carbon Project) */
  emissionsGtCO2PerYear: number;

  /** Optional: Additional overrides for environmental parameters */
  environmental?: {
    /** Arctic sea ice extent as fraction remaining (0-1) */
    arcticIceLoss?: number;
    /** Permafrost thaw progress (0-1) */
    permafrostThaw?: number;
    /** Amazon dieback progress (0-1) */
    amazonDieback?: number;
    /** Ocean sink saturation (0-1) */
    sinkSaturation?: number;
  };

  /**
   * HISTORICAL PLANETARY BOUNDARY OVERRIDES (Nov 24, 2025)
   *
   * CRITICAL for hindcast validation - simulations crash when 1990 scenarios
   * start with 2025 crisis-level planetary boundaries.
   *
   * Research: Stockholm Resilience Centre (Rockstrom et al. 2009, Steffen et al. 2015)
   * Values are normalized to boundary threshold (1.0 = boundary, >1.0 = breached)
   */
  planetaryBoundaries?: {
    /** Climate change (CO2 concentration normalized) - 2025: 1.21 */
    climateChange?: number;
    /** Biosphere integrity (extinction rate normalized) - 2025: 11.6 */
    biosphereIntegrity?: number;
    /** Biogeochemical flows (N&P normalized) - 2025: 2.94 */
    biogeochemicalFlows?: number;
    /** Land system change (deforestation normalized) - 2025: 1.17 (breached 2000) */
    landSystemChange?: number;
    /** Freshwater change (groundwater/surface normalized) - 2025: 1.15 (breached 2023) */
    freshwaterChange?: number;
    /** Novel entities (chemical pollution normalized) - 2025: 1.50 (breached 2022) */
    novelEntities?: number;
    /** Ocean acidification (pH change normalized) - 2025: 1.05 (breached 2025) */
    oceanAcidification?: number;
    /** Stratospheric ozone (depletion normalized) - 2025: 0.85 (recovering) */
    stratosphericOzone?: number;
    /** Atmospheric aerosols (regional loading normalized) - 2025: 0.70 */
    atmosphericAerosols?: number;
  };
}

/**
 * Pre-computed historical baseline data for common hindcast scenarios
 * Research: Keeling curve, HadCRUT5, UN Population, Global Carbon Project
 */
export const HISTORICAL_BASELINES: Record<number, HistoricalOverrides> = {
  /**
   * 1990 BASELINE
   *
   * Planetary Boundary Research (Stockholm Resilience Centre):
   * - Climate change: Just at boundary (CO2 354 ppm vs 350 ppm safe)
   * - Biosphere integrity: ~25x background extinction (vs 116x in 2025)
   *   Research: Ceballos et al. (2015), IPBES (2019) trajectory back-calculation
   * - Biogeochemical flows: ~1.5x (Green Revolution fertilizer use accelerating)
   *   Research: Steffen et al. (2015) - N/P flows crossed boundary ~1985
   * - Land system change: ~0.60 (not yet breached in 1990, breached 2000)
   * - Freshwater change: ~0.30 (not yet breached, major depletion post-2000)
   * - Novel entities: ~0.30 (CFCs peak, PFAS production starting)
   * - Ocean acidification: ~0.60 (pH dropping but not yet critical)
   * - Stratospheric ozone: ~1.25 (PEAK ozone hole era, Montreal Protocol 1987)
   * - Atmospheric aerosols: ~0.80 (pre-Clean Air improvements in many regions)
   */
  1990: {
    startYear: 1990,
    co2Ppm: 354.19,                 // Keeling curve (Scripps/NOAA) - EXACT VALUE from research/climate_hindcast_data_20251126.md
    temperatureAnomalyC: 0.355,     // HadCRUT5 global temperature (relative to 1961-1990) - EXACT VALUE
    globalPopulationBillions: 5.3,  // UN World Population Prospects
    globalGdpTrillions: 23,         // World Bank (1990 USD)
    emissionsGtCO2PerYear: 22.7,    // Global Carbon Project - UPDATED from GCP via Our World in Data
    environmental: {
      arcticIceLoss: 0.10,          // ~10% summer ice lost by 1990
      permafrostThaw: 0.02,         // Minimal thaw in 1990
      amazonDieback: 0.05,          // Early deforestation (~5%)
      sinkSaturation: 0.15,         // 15% sink saturation
    },
    planetaryBoundaries: {
      climateChange: 0.35,          // 354 ppm / 350 safe - just approaching boundary
      biosphereIntegrity: 2.5,      // ~25x background extinction rate (vs 116x 2025)
      biogeochemicalFlows: 1.50,    // Already breached 1985, accelerating
      landSystemChange: 0.60,       // ~72% forest cover (not yet breached)
      freshwaterChange: 0.30,       // Minor stress (major depletion post-2000)
      novelEntities: 0.30,          // CFCs peak, PFAS nascent
      oceanAcidification: 0.60,     // pH ~8.18 (vs 8.25 pre-industrial)
      stratosphericOzone: 1.25,     // PEAK ozone hole (Montreal Protocol 1987 just starting effect)
      atmosphericAerosols: 0.80,    // Industrial aerosols high, Clean Air Act starting
    },
  },
  /**
   * 2000 BASELINE
   *
   * Research: Steffen et al. (2015), Richardson et al. (2023) trajectory
   * - Land system change: Just breaching boundary (62% → 65% forest cover)
   * - Novel entities: PFAS production ramping, microplastics starting
   * - Ozone: Recovering from Montreal Protocol
   */
  2000: {
    startYear: 2000,
    co2Ppm: 369,                    // Keeling curve
    temperatureAnomalyC: 0.60,      // HadCRUT5
    globalPopulationBillions: 6.1,  // UN World Population Prospects
    globalGdpTrillions: 33,         // World Bank
    emissionsGtCO2PerYear: 25,      // Global Carbon Project
    environmental: {
      arcticIceLoss: 0.25,          // ~25% summer ice lost
      permafrostThaw: 0.04,         // Minimal thaw
      amazonDieback: 0.08,          // ~8% degraded
      sinkSaturation: 0.20,         // 20% sink saturation
    },
    planetaryBoundaries: {
      climateChange: 0.55,          // 369 ppm - beyond safe zone but pre-acceleration
      biosphereIntegrity: 4.5,      // ~45x background (accelerating 1990-2000)
      biogeochemicalFlows: 2.00,    // Fertilizer use intensifying
      landSystemChange: 0.85,       // Approaching/at boundary (breached ~2000)
      freshwaterChange: 0.50,       // Accelerating stress (Ogallala, India)
      novelEntities: 0.40,          // PFAS production ramping
      oceanAcidification: 0.70,     // pH ~8.15
      stratosphericOzone: 1.10,     // Starting recovery (Montreal Protocol working)
      atmosphericAerosols: 0.75,    // Improving in developed nations
    },
  },
  /**
   * 2010 BASELINE
   *
   * Research: Rockstrom et al. (2009) first quantification, Steffen et al. (2015)
   * - Multiple boundaries now breached
   * - Acceleration visible in all Earth system trajectories
   */
  2010: {
    startYear: 2010,
    co2Ppm: 390.22,                 // Keeling curve - EXACT VALUE from research/climate_hindcast_data_20251126.md
    temperatureAnomalyC: 0.674,     // HadCRUT5 (relative to 1961-1990) - EXACT VALUE
    globalPopulationBillions: 6.9,  // UN World Population Prospects
    globalGdpTrillions: 66,         // World Bank
    emissionsGtCO2PerYear: 33.5,    // Global Carbon Project - UPDATED from GCP via Our World in Data
    environmental: {
      arcticIceLoss: 0.35,          // ~35% summer ice lost
      permafrostThaw: 0.06,         // Early thaw acceleration
      amazonDieback: 0.10,          // ~10% degraded
      sinkSaturation: 0.25,         // 25% sink saturation
    },
    planetaryBoundaries: {
      climateChange: 0.80,          // 390 ppm - clearly beyond boundary
      biosphereIntegrity: 7.0,      // ~70x background (approaching 2025 levels)
      biogeochemicalFlows: 2.50,    // Dead zones expanding
      landSystemChange: 1.00,       // At boundary (breached)
      freshwaterChange: 0.80,       // Significant stress (multiple aquifer warnings)
      novelEntities: 0.60,          // PFAS widespread, microplastics detected globally
      oceanAcidification: 0.85,     // pH ~8.12 (approaching boundary)
      stratosphericOzone: 0.95,     // Continuing recovery (ozone hole shrinking)
      atmosphericAerosols: 0.72,    // Improving globally
    },
  },
};

/**
 * ERA-SPECIFIC CRISIS VULNERABILITY MULTIPLIERS (Nov 24, 2025)
 *
 * CRITICAL INTERPRETATION (Research Synthesis, Nov 24, 2025):
 * ========================================================
 * These multipliers represent CRISIS RESPONSE CAPACITY, not baseline mortality decline.
 *
 * The 0.30 multiplier for 1990 means 70% HIGHER crisis vulnerability (not 70% lower mortality).
 * This represents WORSE surge capacity, slower response times, and higher cascade mortality
 * during disasters - even though baseline all-cause mortality was only 23.5% higher (CDR 9.8
 * vs 7.5 per 1000).
 *
 * EVIDENCE FOR HIGHER 1990 CRISIS VULNERABILITY:
 * - 1991 Bangladesh cyclone: 138,000 deaths (vs 2020 similar storm: 128 deaths - 1000x difference)
 * - Hospital surge capacity: 40-60% lower than 2025 (no standardized protocols, limited ventilation)
 * - Response time lag: Weeks to mobilize international aid (vs hours in 2025)
 * - Information delay: No internet, satellite phones, or real-time monitoring
 * - Supply chain fragility: No redundant global logistics (single-source dependencies)
 * - Early warning absence: No tsunami systems, limited hurricane prediction, no pandemic surveillance
 *
 * WHAT THIS IS NOT:
 * - This is NOT the 23.5% crude death rate (CDR) decline 1990-2019 (9.8 → 7.5 per 1000)
 * - This is NOT all-cause mortality trends (improved by healthcare, nutrition, sanitation)
 * - This is NOT the 50% age-standardized mortality reduction (IHME - disease-specific)
 *
 * WHAT THIS IS:
 * - EXCESS mortality multiplier during crisis events (heat waves, famines, conflicts, pandemics)
 * - Speed of crisis cascade escalation (hours vs weeks for international response)
 * - Mortality PER UNIT HAZARD (deaths per degree heatwave, deaths per % food shortage)
 *
 * Research sources:
 * - World Bank CDR: 23.5% decline 1990-2019 (baseline mortality)
 * - RAND: 50% ICU surge capacity increase via modern protocols (crisis response)
 * - Historical famine mortality: 2018-2022 equals ENTIRE 1990-2000 decade (worse per-capita once triggered)
 * - Complex humanitarian emergencies: 30.9 deaths/10K/day in 1994 Rwanda (vs <5 in modern crises)
 * - Cyclone mortality: 138K (1991 Bangladesh) vs 128 (2020 Amphan) for comparable hazards
 *
 * RENAME RATIONALE:
 * The original "ERA_MORTALITY_MULTIPLIERS" name conflated two phenomena. Renamed to
 * "ERA_CRISIS_VULNERABILITY_MULTIPLIERS" to clarify mechanism. Applied to crisis mortality
 * calculations, not baseline population dynamics.
 *
 * Applied in: populationDynamics.ts, bayesianMortality.ts (crisis mortality resolution)
 */
export const ERA_MORTALITY_MULTIPLIERS: Record<number, number> = {
  1990: 0.30,  // 70% HIGHER crisis vulnerability (worse surge capacity, slower response, no early warning)
  1995: 0.35,  // Gradual improvement (post-Cold War humanitarian frameworks emerging)
  2000: 0.40,  // Y2K era - internet enables faster coordination
  2005: 0.50,  // Post-2004 tsunami - global early warning systems deployed
  2010: 0.60,  // Post-2008 - economic stress but better crisis infrastructure
  2015: 0.70,  // Mobile saturation - faster disaster response
  2020: 0.85,  // COVID era - healthcare strain but massive surge capacity expansion
  2025: 1.00,  // Current calibration baseline (maximum crisis response capability)
};

/**
 * Get era mortality multiplier for a given year
 * Interpolates between known years
 */
export function getEraMortalityMultiplier(year: number): number {
  const years = Object.keys(ERA_MORTALITY_MULTIPLIERS).map(Number).sort((a, b) => a - b);

  // Before earliest year
  if (year <= years[0]) {
    return ERA_MORTALITY_MULTIPLIERS[years[0]];
  }

  // After latest year
  if (year >= years[years.length - 1]) {
    return ERA_MORTALITY_MULTIPLIERS[years[years.length - 1]];
  }

  // Find surrounding years and interpolate
  for (let i = 0; i < years.length - 1; i++) {
    if (year >= years[i] && year < years[i + 1]) {
      const lowYear = years[i];
      const highYear = years[i + 1];
      const progress = (year - lowYear) / (highYear - lowYear);
      return ERA_MORTALITY_MULTIPLIERS[lowYear] +
        (ERA_MORTALITY_MULTIPLIERS[highYear] - ERA_MORTALITY_MULTIPLIERS[lowYear]) * progress;
    }
  }

  return 1.0; // Fallback
}

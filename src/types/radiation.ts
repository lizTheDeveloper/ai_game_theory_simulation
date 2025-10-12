/**
 * Nuclear Radiation Health Effects System
 *
 * Models long-term health impacts from nuclear war:
 * - Acute radiation syndrome (weeks 1-4 after exposure)
 * - Cancer incidence (years 5-40)
 * - Birth defects (3 generations)
 * - Soil/water contamination (30-300 years)
 *
 * Research backing:
 * - Chernobyl studies (1986-present)
 * - Hiroshima/Nagasaki longitudinal data (1945-present)
 * - Fukushima exclusion zone data (2011-present)
 */

export interface RadiationExposureEvent {
  id: string;
  startMonth: number;
  region: string;                     // Which region was exposed
  exposedPopulation: number;          // Population in billions
  exposureLevel: number;              // [0, 1] where 1 = lethal dose (6+ Gy)

  // Acute effects (weeks 1-4)
  acuteRadiationDeaths: number;       // Immediate deaths from ARS
  acuteRadiationSyndrome: {
    affectedPopulation: number;       // Exposed survivors
    mortalityRate: number;            // 50-80% at 4-6 Gy
    monthsActive: number;             // Duration of acute phase (1-2 months)
  };

  // Long-term cancer effects (years 5-40)
  cancerRisk: {
    baselineRate: number;             // Normal cancer rate (0.40 = 40%)
    radiationBonus: number;           // +10-30% additional risk
    latencyYears: number;             // 5-year minimum before cancers appear
    peakYears: number;                // 20-30 years = peak incidence
    durationYears: number;            // 40+ years total
    cumulativeCancerDeaths: number;   // Track total cancer deaths
  };

  // Birth defects (3 generations)
  birthDefects: {
    baselineRate: number;             // Normal rate (0.03 = 3%)
    radiationMultiplier: number;      // 2-5x for exposed populations
    affectedGenerations: number;      // 3 generations
    generationDuration: number;       // ~25 years per generation
    cumulativeDefects: number;        // Track total affected births
  };

  // Environmental contamination
  contamination: {
    cesium137HalfLife: number;        // 30 years (in months: 360)
    strontium90HalfLife: number;      // 29 years (in months: 348)
    iodine131HalfLife: number;        // 8 days (in months: 0.27)
    currentContaminationLevel: number; // [0, 1] Current contamination
    agricultureImpossible: boolean;   // Is farming viable?
    waterContamination: number;       // [0, 1] Drinking water safety
    timeToRecoveryYears: number;      // Optimistic: 100 years
  };
}

export interface RadiationSystem {
  activeExposures: RadiationExposureEvent[];
  historicalExposures: RadiationExposureEvent[];
  totalRadiationDeaths: number;       // All radiation deaths (acute + cancer)
  totalCancerDeaths: number;          // Cancer deaths only
  totalBirthDefects: number;          // Birth defects across all generations
  contaminatedRegions: Set<string>;   // Regions with active contamination
}

/**
 * Initialize empty radiation system
 */
export function initializeRadiationSystem(): RadiationSystem {
  return {
    activeExposures: [],
    historicalExposures: [],
    totalRadiationDeaths: 0,
    totalCancerDeaths: 0,
    totalBirthDefects: 0,
    contaminatedRegions: new Set(),
  };
}

/**
 * Create a radiation exposure event from nuclear strike
 */
export function createRadiationExposure(
  month: number,
  region: string,
  exposedPopulation: number,
  exposureLevel: number = 1.0
): RadiationExposureEvent {
  // Calculate acute radiation syndrome effects
  // At 4-6 Gy (Grays), mortality is 50-80%
  const arsAffected = exposedPopulation * exposureLevel;
  const arsMortalityRate = 0.5 + (exposureLevel * 0.3); // 50-80% at full exposure
  const acuteDeaths = arsAffected * arsMortalityRate;

  // Cancer risk increases by 10-30% over baseline
  const baselineCancerRate = 0.40; // 40% baseline lifetime cancer risk
  const radiationCancerBonus = 0.10 + (exposureLevel * 0.20); // +10-30%

  // Birth defects multiply by 2-5x
  const baselineBirthDefectRate = 0.03; // 3% baseline
  const birthDefectMultiplier = 2.0 + (exposureLevel * 3.0); // 2-5x

  return {
    id: `radiation-${region}-${month}`,
    startMonth: month,
    region,
    exposedPopulation,
    exposureLevel,
    acuteRadiationDeaths: acuteDeaths,
    acuteRadiationSyndrome: {
      affectedPopulation: arsAffected,
      mortalityRate: arsMortalityRate,
      monthsActive: 2, // 1-2 months acute phase
    },
    cancerRisk: {
      baselineRate: baselineCancerRate,
      radiationBonus: radiationCancerBonus,
      latencyYears: 5,
      peakYears: 25, // 20-30 years
      durationYears: 40,
      cumulativeCancerDeaths: 0,
    },
    birthDefects: {
      baselineRate: baselineBirthDefectRate,
      radiationMultiplier: birthDefectMultiplier,
      affectedGenerations: 3,
      generationDuration: 25, // ~25 years per generation
      cumulativeDefects: 0,
    },
    contamination: {
      cesium137HalfLife: 360, // 30 years in months
      strontium90HalfLife: 348, // 29 years in months
      iodine131HalfLife: 0.27, // 8 days in months
      currentContaminationLevel: 1.0, // Maximum at start
      agricultureImpossible: true, // Can't farm in contaminated areas
      waterContamination: 1.0, // Maximum contamination
      timeToRecoveryYears: 100, // Optimistic estimate
    },
  };
}

/**
 * Calculate radiation decay using half-life formula
 * N(t) = N₀ × (1/2)^(t/t_half)
 */
function calculateRadioactiveDecay(
  initialLevel: number,
  timeElapsed: number,
  halfLife: number
): number {
  if (halfLife === 0) return 0;
  return initialLevel * Math.pow(0.5, timeElapsed / halfLife);
}

/**
 * Progress a radiation exposure event by one month
 * Returns deaths this month from radiation effects
 */
export function progressRadiationExposure(
  exposure: RadiationExposureEvent,
  currentMonth: number,
  globalPopulation: number
): { deaths: number; birthDefects: number } {
  const monthsSinceExposure = currentMonth - exposure.startMonth;
  const yearsSinceExposure = monthsSinceExposure / 12;

  let deathsThisMonth = 0;
  let birthDefectsThisMonth = 0;

  // 1. Acute radiation syndrome (months 1-2)
  if (monthsSinceExposure <= exposure.acuteRadiationSyndrome.monthsActive) {
    // Acute deaths already counted in acuteRadiationDeaths (happens immediately)
    // This phase is just tracking, actual deaths are immediate
  }

  // 2. Cancer deaths (years 5-40)
  if (yearsSinceExposure >= exposure.cancerRisk.latencyYears &&
      yearsSinceExposure <= exposure.cancerRisk.durationYears) {
    // Cancer risk curve: peaks at 20-30 years, tapers off
    const yearsIntoCancerRisk = yearsSinceExposure - exposure.cancerRisk.latencyYears;
    const normalizedTime = yearsIntoCancerRisk / (exposure.cancerRisk.durationYears - exposure.cancerRisk.latencyYears);

    // Bell curve: peaks at ~0.5 (25 years after exposure)
    const gaussianFactor = Math.exp(-Math.pow((normalizedTime - 0.5) * 3, 2));

    // Monthly cancer deaths = exposed population × radiation bonus × time factor / months
    const annualCancerDeaths = exposure.exposedPopulation * exposure.cancerRisk.radiationBonus * gaussianFactor;
    deathsThisMonth = annualCancerDeaths / 12; // Convert to monthly

    exposure.cancerRisk.cumulativeCancerDeaths += deathsThisMonth;
  }

  // 3. Birth defects (3 generations, ~75 years)
  const generationSpan = exposure.birthDefects.generationDuration;
  const totalGenerationYears = exposure.birthDefects.affectedGenerations * generationSpan;

  if (yearsSinceExposure <= totalGenerationYears) {
    // Which generation are we in?
    const currentGeneration = Math.floor(yearsSinceExposure / generationSpan);

    if (currentGeneration < exposure.birthDefects.affectedGenerations) {
      // Birth rate: ~0.01 per year (1% of population has children per year)
      const annualBirths = exposure.exposedPopulation * 0.01;

      // Defect rate decreases with each generation (genetic repair)
      const generationMultiplier = 1.0 / Math.pow(1.5, currentGeneration); // 1.0, 0.67, 0.44
      const effectiveMultiplier = exposure.birthDefects.radiationMultiplier * generationMultiplier;

      // Monthly birth defects
      const annualDefects = annualBirths * exposure.birthDefects.baselineRate * effectiveMultiplier;
      birthDefectsThisMonth = annualDefects / 12;

      exposure.birthDefects.cumulativeDefects += birthDefectsThisMonth;
    }
  }

  // 4. Environmental contamination decay
  // Cesium-137 dominates long-term contamination (30-year half-life)
  exposure.contamination.currentContaminationLevel = calculateRadioactiveDecay(
    1.0, // Initial contamination
    monthsSinceExposure,
    exposure.contamination.cesium137HalfLife
  );

  // Iodine-131 decays quickly (8 days)
  const iodineLevel = calculateRadioactiveDecay(1.0, monthsSinceExposure, exposure.contamination.iodine131HalfLife);

  // Water contamination (mix of isotopes)
  exposure.contamination.waterContamination = (exposure.contamination.currentContaminationLevel * 0.7 + iodineLevel * 0.3);

  // Agriculture possible when contamination < 0.2 (80% decay)
  exposure.contamination.agricultureImpossible = exposure.contamination.currentContaminationLevel > 0.2;

  return { deaths: deathsThisMonth, birthDefects: birthDefectsThisMonth };
}

/**
 * Check if a radiation exposure is still active
 * Exposure ends when:
 * - Cancer risk period is over (40 years)
 * - Birth defect period is over (3 generations = ~75 years)
 * - Contamination is negligible (< 1%)
 */
export function isRadiationExposureActive(
  exposure: RadiationExposureEvent,
  currentMonth: number
): boolean {
  const yearsSinceExposure = (currentMonth - exposure.startMonth) / 12;

  // Cancer period: 5-40 years
  const cancerActive = yearsSinceExposure <= exposure.cancerRisk.durationYears;

  // Birth defects: 3 generations (~75 years)
  const birthDefectsActive = yearsSinceExposure <= (exposure.birthDefects.affectedGenerations * exposure.birthDefects.generationDuration);

  // Contamination: Cs-137 takes ~300 years to decay to 0.1% (10 half-lives)
  const contaminationActive = exposure.contamination.currentContaminationLevel > 0.01;

  return cancerActive || birthDefectsActive || contaminationActive;
}

/**
 * Update radiation system for one month
 * Returns total deaths this month from all radiation exposures
 */
export function updateRadiationSystem(
  system: RadiationSystem,
  currentMonth: number,
  globalPopulation: number
): { deaths: number; birthDefects: number } {
  let totalDeathsThisMonth = 0;
  let totalBirthDefectsThisMonth = 0;

  // Progress each active exposure
  for (let i = system.activeExposures.length - 1; i >= 0; i--) {
    const exposure = system.activeExposures[i];

    const { deaths, birthDefects } = progressRadiationExposure(exposure, currentMonth, globalPopulation);
    totalDeathsThisMonth += deaths;
    totalBirthDefectsThisMonth += birthDefects;

    system.totalRadiationDeaths += deaths;
    system.totalCancerDeaths += deaths; // All long-term deaths are cancer
    system.totalBirthDefects += birthDefects;

    // Update contaminated regions
    if (exposure.contamination.currentContaminationLevel > 0.1) {
      system.contaminatedRegions.add(exposure.region);
    } else {
      system.contaminatedRegions.delete(exposure.region);
    }

    // Check if exposure is still active
    if (!isRadiationExposureActive(exposure, currentMonth)) {
      system.activeExposures.splice(i, 1);
      system.historicalExposures.push(exposure);
    }
  }

  return { deaths: totalDeathsThisMonth, birthDefects: totalBirthDefectsThisMonth };
}

/**
 * Trigger a new radiation exposure event
 */
export function triggerRadiationExposure(
  system: RadiationSystem,
  month: number,
  region: string,
  exposedPopulation: number,
  exposureLevel: number = 1.0
): RadiationExposureEvent {
  const exposure = createRadiationExposure(month, region, exposedPopulation, exposureLevel);
  system.activeExposures.push(exposure);

  // Track acute deaths immediately
  system.totalRadiationDeaths += exposure.acuteRadiationDeaths;
  system.contaminatedRegions.add(region);

  return exposure;
}

/**
 * Get radiation statistics for logging
 */
export function getRadiationStats(system: RadiationSystem): {
  activeExposures: number;
  totalRadiationDeaths: number;
  totalCancerDeaths: number;
  totalBirthDefects: number;
  contaminatedRegions: string[];
  longestExposure: number | null;
} {
  let longestExposure = null;
  if (system.activeExposures.length > 0) {
    const oldest = Math.min(...system.activeExposures.map(e => e.startMonth));
    longestExposure = oldest;
  }

  return {
    activeExposures: system.activeExposures.length,
    totalRadiationDeaths: system.totalRadiationDeaths,
    totalCancerDeaths: system.totalCancerDeaths,
    totalBirthDefects: system.totalBirthDefects,
    contaminatedRegions: Array.from(system.contaminatedRegions),
    longestExposure,
  };
}

/**
 * Realistic Famine Death Curve System
 *
 * Grounds famine mortality in reality:
 * - Gradual death over 30-60 days (severe malnutrition timeline)
 * - Genocide detection (tech can't help when aid is blocked)
 * - Tech deployment for natural disasters (hydroponics, emergency food)
 *
 * Research backing:
 * - Gaza (2024-25): 74 malnutrition deaths, genocide context (aid blocked)
 * - Sudan (2024): 522,000 children dead
 * - Yemen: 85,000 children dead
 * - Medical: 30-60 days severe malnutrition → death
 */

import { assertProbability, assertFinite } from '@/simulation/utils/assertions';

export interface FamineEvent {
  id: string;
  startMonth: number;
  affectedRegion: string;           // Region name (e.g., 'Asia', 'Africa')
  populationAtRisk: number;         // Population affected (billions)
  foodSecurityLevel: number;        // [0, 1] where 0 = no food, 1 = secure

  // Mortality tracking
  monthsSinceOnset: number;
  cumulativeDeaths: number;         // Total deaths so far
  monthlyMortalityRate: number;     // Current month's death rate

  // Context determines if tech can help
  cause: FamineCause;
  severity: FamineSeverity;         // IPC Phase classification (crisis/emergency/catastrophe)
  isGenocide: boolean;              // If true, tech CANNOT help (aid blocked)
  canDeployTech: boolean;           // Can deploy hydroponics, emergency food?
  resourceExtraction: boolean;      // Land grab scenario
  aidBlocked: boolean;              // Intentional blockade

  // Tech mitigation
  techDeployed: boolean;            // Has tech been deployed?
  techEffectiveness: number;        // [0, 1] Mortality reduction from tech
  aiCapabilityRequired: number;     // Minimum AI capability needed
}

export type FamineCause =
  | 'drought'           // Natural disaster (tech can help)
  | 'crop_failure'      // Climate/environmental (tech can help)
  | 'war_displacement'  // War-driven (tech can help if access)
  | 'aid_blockade'      // Genocide (tech CANNOT help)
  | 'resource_extraction' // Land grab (tech CANNOT help)
  | 'economic_collapse' // Systemic (tech can help)
  | 'nuclear_winter';   // Post-nuclear (tech limited)

/**
 * FIX (Nov 6, 2025): Famine severity tiers (IPC Phase classification)
 * Research: FAO (2023) IPC Phase 5 = famine (rare, exceptional crisis)
 * - Phase 3 (Crisis): 60-80% food security - hunger, NO mortality
 * - Phase 4 (Emergency): 40-60% food security - acute malnutrition, LOW mortality
 * - Phase 5 (Catastrophe/Famine): <40% food security - starvation, HIGH mortality
 */
export type FamineSeverity =
  | 'crisis'        // IPC Phase 3: Hunger, no deaths (60-80% food security)
  | 'emergency'     // IPC Phase 4: Acute malnutrition, some deaths (40-60% food security)
  | 'catastrophe';  // IPC Phase 5: Famine, mass starvation (<40% food security)

export interface FamineSystem {
  activeFamines: FamineEvent[];
  historicalFamines: FamineEvent[];
  totalDeaths: number;
  genocideFamines: number;          // Count of genocide-driven famines
  techPreventedDeaths: number;      // Deaths prevented by tech

  // === URBAN FOOD ACCESS (Oct 27, 2025) ===
  // Research: FAO (2024) - 23.9% of urban populations experience moderate/severe food insecurity
  // Therefore: 76.1% have reliable food access in baseline 2025
  // Urban advantage: Better infrastructure, markets, supply chains vs rural (68%)
  // Vulnerability: Price shocks, supply chain disruptions
  // Tech: "Vertical Farming" improves this via indoor agriculture in cities
  urbanFoodAccess: number;  // [0, 1] 0 = no access, 1 = universal access
}

/**
 * Initialize empty famine system
 */
export function initializeFamineSystem(): FamineSystem {
  return {
    activeFamines: [],
    historicalFamines: [],
    totalDeaths: 0,
    genocideFamines: 0,
    techPreventedDeaths: 0,

    // Urban Food Access (Oct 27, 2025)
    // Research: FAO (2024) - 76.1% of urban populations have reliable food access
    // Baseline 2025: 0.76 (urban advantage over rural 68% due to infrastructure)
    urbanFoodAccess: 0.76,
  };
}

/**
 * Determine famine severity from food security level
 * FIX (Nov 6, 2025): IPC Phase classification
 * Research: FAO (2023) IPC Phase tiers
 */
export function getFamineSeverity(foodSecurityLevel: number): FamineSeverity {
  if (foodSecurityLevel >= 0.60) {
    return 'crisis';        // IPC Phase 3: Hunger, no mass mortality
  } else if (foodSecurityLevel >= 0.40) {
    return 'emergency';     // IPC Phase 4: Acute malnutrition, some deaths
  } else {
    return 'catastrophe';   // IPC Phase 5: Famine, mass starvation
  }
}

/**
 * Create a new famine event
 */
export function createFamineEvent(
  month: number,
  region: string,
  populationAtRisk: number,
  cause: FamineCause,
  foodSecurityLevel: number
): FamineEvent {
  // Determine if this is genocide (tech can't help)
  const isGenocide = cause === 'aid_blockade' || cause === 'resource_extraction';
  const aidBlocked = cause === 'aid_blockade';
  const resourceExtraction = cause === 'resource_extraction';

  // FIX (Nov 6, 2025): Determine severity from food security level
  const severity = getFamineSeverity(foodSecurityLevel);

  return {
    id: `famine-${region}-${month}`,
    startMonth: month,
    affectedRegion: region,
    populationAtRisk,
    foodSecurityLevel,
    monthsSinceOnset: 0,
    cumulativeDeaths: 0,
    monthlyMortalityRate: 0,
    cause,
    severity,
    isGenocide,
    canDeployTech: !isGenocide, // Can only deploy tech if NOT genocide
    resourceExtraction,
    aidBlocked,
    techDeployed: false,
    techEffectiveness: 0,
    aiCapabilityRequired: 2.0, // Need moderate AI capability for emergency food
  };
}

/**
 * Realistic death curve based on medical research
 *
 * FIX (Nov 6, 2025): Scale by severity (IPC Phase)
 * - Crisis (Phase 3): 0× mortality (hunger, no deaths)
 * - Emergency (Phase 4): 0.15× mortality multiplier (acute malnutrition)
 * - Catastrophe (Phase 5): 1.0× mortality multiplier (famine, mass starvation)
 *
 * Base timeline for CATASTROPHE (severe acute malnutrition → death):
 * - Month 0: 0% deaths (onset)
 * - Month 1: 2% deaths (weakest die first: elderly, children, sick)
 * - Month 2: 8% deaths (severe malnutrition sets in)
 * - Month 3: 15% deaths (starvation peak)
 * - Month 4: 10% deaths (remaining weak die)
 * - Month 5+: 2% deaths (sustained low-level mortality)
 *
 * Source: Clinical nutrition research, Gaza/Yemen/Sudan data, FAO (2023) IPC
 */
export function calculateMonthlyMortalityRate(
  monthsSinceOnset: number,
  severity: FamineSeverity
): number {
  // Get base mortality rate for catastrophe-level famine
  let baseMortality = 0;
  if (monthsSinceOnset === 0) baseMortality = 0.00;  // Onset
  else if (monthsSinceOnset === 1) baseMortality = 0.02;  // 2% - weakest die first
  else if (monthsSinceOnset === 2) baseMortality = 0.08;  // 8% - severe malnutrition
  else if (monthsSinceOnset === 3) baseMortality = 0.15;  // 15% - peak starvation
  else if (monthsSinceOnset === 4) baseMortality = 0.10;  // 10% - remaining weak
  else baseMortality = 0.02; // 2% sustained mortality (months 5+)

  baseMortality = assertProbability(
    baseMortality,
    { location: 'calculateMonthlyMortalityRate', valueName: 'baseMortality', additionalInfo: { monthsSinceOnset } }
  );

  // FIX (Nov 6, 2025): Apply severity multiplier
  // Research: FAO (2023) IPC Phase 3 = crisis (NO mass mortality)
  //           FAO (2023) IPC Phase 4 = emergency (LOW mortality, ~15% of catastrophe)
  //           FAO (2023) IPC Phase 5 = famine/catastrophe (HIGH mortality, 100%)
  let severityMultiplier = 1.0;
  if (severity === 'crisis') {
    severityMultiplier = 0.0;   // No mass mortality (hunger, not famine)
  } else if (severity === 'emergency') {
    severityMultiplier = 0.15;  // 15% of catastrophe rate (acute malnutrition)
  } else {
    severityMultiplier = 1.0;   // Full mortality (famine/catastrophe)
  }

  severityMultiplier = assertProbability(
    severityMultiplier,
    { location: 'calculateMonthlyMortalityRate', valueName: 'severityMultiplier', additionalInfo: { severity } }
  );

  return assertProbability(
    baseMortality * severityMultiplier,
    { location: 'calculateMonthlyMortalityRate', valueName: 'mortalityRate', additionalInfo: { monthsSinceOnset, severity } }
  );
}

/**
 * Determine if current month is in regional lean season
 *
 * FIX (Oct 26, 2025): Seasonal famine mortality
 * Research: Venkat et al. 2023, PNAS 2023, WFP 2025
 * - Lean seasons: 3-4 months/year with 1.75x mortality
 * - Regional timing varies by climate zone
 *
 * @param month - Current simulation month (0-indexed)
 * @param region - Region name
 * @returns true if in lean season, false otherwise
 */
export function isLeanSeason(month: number, region: string): boolean {
  const monthOfYear = month % 12; // 0 = Jan, 1 = Feb, ..., 11 = Dec

  // Regional lean season timing (research-backed)
  // Source: WFP 2025 (Sahel), PNAS 2023 (Bangladesh), FAO (East Africa)
  const leanSeasonMonths: Record<string, number[]> = {
    // Sub-Saharan Africa (Sahel): June-August (pre-harvest)
    'Sub-Saharan Africa': [5, 6, 7], // Months 5, 6, 7 = June, July, August

    // South Asia (monsoon): March-June (pre-monsoon hungry season)
    'South Asia': [2, 3, 4, 5], // Months 2-5 = March-June

    // East Africa: January-April (dry season peak)
    'East Africa': [0, 1, 2, 3], // Months 0-3 = Jan-April

    // Southeast Asia: Similar to South Asia monsoon pattern
    'Southeast Asia': [2, 3, 4, 5],

    // Middle East & North Africa: Summer months (heat stress)
    'Middle East and North Africa': [5, 6, 7, 8], // June-September

    // Central America: May-August ("hungry months")
    'Central America': [4, 5, 6, 7],
  };

  // Get lean season months for this region (default to none if not specified)
  const leanMonths = leanSeasonMonths[region] || [];

  return leanMonths.includes(monthOfYear);
}

/**
 * Progress a famine event by one month
 * Returns new deaths this month
 *
 * FIX (Oct 26, 2025): Seasonal mortality
 * - Only apply ACUTE deaths during lean season months (3-4 months/year)
 * - Apply low baseline mortality during non-lean months
 * - Lean season: 1.75x base mortality rate
 * - Non-lean season: 0.25x base mortality rate (chronic undernourishment)
 *
 * Research: Overestimation factor of 4.7x when applying continuous mortality
 * to seasonal agricultural crises (see reviews/famine_mortality_overestimation_critique_20251026.md)
 */
export function progressFamine(
  famine: FamineEvent,
  aiCapability: number,
  resourcesAvailable: boolean,
  currentMonth: number  // NEW: Need current month to determine seasonality
): number {
  famine.monthsSinceOnset++;

  // FIX (Oct 26, 2025): Check if we're in lean season for this region
  const inLeanSeason = isLeanSeason(currentMonth, famine.affectedRegion);

  // Get base mortality rate from death curve (scaled by severity)
  let baseMortalityRate = calculateMonthlyMortalityRate(famine.monthsSinceOnset, famine.severity);

  // Apply seasonal adjustment
  // Research: 1.5-2x severity during lean season (using 1.75x midpoint)
  // Non-lean season: Chronic undernourishment only (0.25x baseline)
  let mortalityRate = assertProbability(
    inLeanSeason
      ? baseMortalityRate * 1.75  // ACUTE lean season mortality
      : baseMortalityRate * 0.25, // Chronic year-round undernourishment
    { location: 'progressFamine_seasonal', valueName: 'mortalityRate', additionalInfo: { inLeanSeason, baseMortalityRate } }
  );

  // Apply tech mitigation (only if not genocide)
  if (famine.canDeployTech && !famine.techDeployed) {
    // Check if we can deploy tech
    if (aiCapability >= famine.aiCapabilityRequired && resourcesAvailable) {
      famine.techDeployed = true;
      // Tech effectiveness: 50-90% mortality reduction
      // Higher AI capability = better tech (hydroponics, emergency food, water purification)
      famine.techEffectiveness = assertProbability(
        Math.min(0.9, 0.5 + (aiCapability - famine.aiCapabilityRequired) * 0.1), // Cap at 90%
        { location: 'progressFamine_tech', valueName: 'techEffectiveness', additionalInfo: { aiCapability } }
      );
    }
  }

  // If tech is deployed, reduce mortality
  if (famine.techDeployed) {
    mortalityRate = assertProbability(
      mortalityRate * (1 - famine.techEffectiveness),
      { location: 'progressFamine_tech_reduced', valueName: 'mortalityRate', additionalInfo: { techEffectiveness: famine.techEffectiveness } }
    );
  }

  // Calculate deaths this month
  const survivingPopulation = assertFinite(
    famine.populationAtRisk - famine.cumulativeDeaths,
    { location: 'progressFamine_deaths', valueName: 'survivingPopulation', additionalInfo: { populationAtRisk: famine.populationAtRisk, cumulativeDeaths: famine.cumulativeDeaths } }
  );
  const deathsThisMonth = assertFinite(
    survivingPopulation * mortalityRate,
    { location: 'progressFamine_deaths', valueName: 'deathsThisMonth', additionalInfo: { survivingPopulation, mortalityRate } }
  );

  famine.cumulativeDeaths += deathsThisMonth;
  famine.monthlyMortalityRate = mortalityRate;

  return deathsThisMonth;
}

/**
 * Check if a famine is still active
 * Famine ends when:
 * - Food security restored (level > 0.8)
 * - Or population at risk depleted (>80% mortality)
 */
export function isFamineActive(famine: FamineEvent): boolean {
  // Protect against division by zero
  if (famine.populationAtRisk === 0) {
    return false; // No population at risk = famine inactive
  }

  const mortalityRate = assertProbability(
    famine.cumulativeDeaths / famine.populationAtRisk,
    { location: 'isFamineActive', valueName: 'mortalityRate', additionalInfo: { cumulativeDeaths: famine.cumulativeDeaths, populationAtRisk: famine.populationAtRisk } }
  );
  return famine.foodSecurityLevel < 0.8 && mortalityRate < 0.8;
}

/**
 * Update famine system for one month
 * Returns total deaths this month
 *
 * FIX (Oct 26, 2025): Pass current month for seasonal mortality
 */
export function updateFamineSystem(
  system: FamineSystem,
  aiCapability: number,
  resourcesAvailable: boolean,
  currentMonth: number  // NEW: Current simulation month for seasonality
): number {
  let totalDeathsThisMonth = 0;

  // Progress each active famine
  for (let i = system.activeFamines.length - 1; i >= 0; i--) {
    const famine = system.activeFamines[i];

    // Calculate deaths this month (with seasonal adjustment)
    const deaths = progressFamine(famine, aiCapability, resourcesAvailable, currentMonth);
    totalDeathsThisMonth += deaths;
    system.totalDeaths += deaths;

    // Track tech-prevented deaths
    if (famine.techDeployed && famine.techEffectiveness > 0) {
      const baseRate = calculateMonthlyMortalityRate(famine.monthsSinceOnset, famine.severity);
      const preventedDeaths = (famine.populationAtRisk - famine.cumulativeDeaths) * baseRate * famine.techEffectiveness;
      system.techPreventedDeaths += preventedDeaths;
    }

    // Check if famine ended
    if (!isFamineActive(famine)) {
      system.activeFamines.splice(i, 1);
      system.historicalFamines.push(famine);
    }
  }

  return totalDeathsThisMonth;
}

/**
 * Trigger a new famine event
 */
export function triggerFamine(
  system: FamineSystem,
  month: number,
  region: string,
  populationAtRisk: number,
  cause: FamineCause,
  foodSecurityLevel: number
): FamineEvent {
  const famine = createFamineEvent(month, region, populationAtRisk, cause, foodSecurityLevel);
  system.activeFamines.push(famine);

  if (famine.isGenocide) {
    system.genocideFamines++;
  }

  return famine;
}

/**
 * Get famine statistics for logging
 */
export function getFamineStats(system: FamineSystem): {
  activeFamines: number;
  totalDeaths: number;
  genocideFamines: number;
  techPreventedDeaths: number;
  techEffectiveness: number;
} {
  // Calculate tech effectiveness with division protection
  let techEffectiveness = 0;
  const totalFamineDeaths = system.totalDeaths + system.techPreventedDeaths;
  if (totalFamineDeaths > 0) {
    techEffectiveness = assertProbability(
      system.techPreventedDeaths / totalFamineDeaths,
      { location: 'getFamineStats', valueName: 'techEffectiveness', additionalInfo: { techPreventedDeaths: system.techPreventedDeaths, totalFamineDeaths } }
    );
  }

  return {
    activeFamines: system.activeFamines.length,
    totalDeaths: system.totalDeaths,
    genocideFamines: system.genocideFamines,
    techPreventedDeaths: system.techPreventedDeaths,
    techEffectiveness,
  };
}

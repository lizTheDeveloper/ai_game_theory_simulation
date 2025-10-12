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

export interface FamineSystem {
  activeFamines: FamineEvent[];
  historicalFamines: FamineEvent[];
  totalDeaths: number;
  genocideFamines: number;          // Count of genocide-driven famines
  techPreventedDeaths: number;      // Deaths prevented by tech
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
  };
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
 * Timeline (severe acute malnutrition → death):
 * - Month 0: 0% deaths (onset)
 * - Month 1: 2% deaths (weakest die first: elderly, children, sick)
 * - Month 2: 8% deaths (severe malnutrition sets in)
 * - Month 3: 15% deaths (starvation peak)
 * - Month 4: 10% deaths (remaining weak die)
 * - Month 5+: 2% deaths (sustained low-level mortality)
 *
 * Source: Clinical nutrition research, Gaza/Yemen/Sudan data
 */
export function calculateMonthlyMortalityRate(monthsSinceOnset: number): number {
  if (monthsSinceOnset === 0) return 0.00;  // Onset
  if (monthsSinceOnset === 1) return 0.02;  // 2% - weakest die first
  if (monthsSinceOnset === 2) return 0.08;  // 8% - severe malnutrition
  if (monthsSinceOnset === 3) return 0.15;  // 15% - peak starvation
  if (monthsSinceOnset === 4) return 0.10;  // 10% - remaining weak
  return 0.02; // 2% sustained mortality (months 5+)
}

/**
 * Progress a famine event by one month
 * Returns new deaths this month
 */
export function progressFamine(
  famine: FamineEvent,
  aiCapability: number,
  resourcesAvailable: boolean
): number {
  famine.monthsSinceOnset++;

  // Get base mortality rate
  let mortalityRate = calculateMonthlyMortalityRate(famine.monthsSinceOnset);

  // Apply tech mitigation (only if not genocide)
  if (famine.canDeployTech && !famine.techDeployed) {
    // Check if we can deploy tech
    if (aiCapability >= famine.aiCapabilityRequired && resourcesAvailable) {
      famine.techDeployed = true;
      // Tech effectiveness: 50-90% mortality reduction
      // Higher AI capability = better tech (hydroponics, emergency food, water purification)
      famine.techEffectiveness = 0.5 + (aiCapability - famine.aiCapabilityRequired) * 0.1;
      famine.techEffectiveness = Math.min(0.9, famine.techEffectiveness); // Cap at 90%
    }
  }

  // If tech is deployed, reduce mortality
  if (famine.techDeployed) {
    mortalityRate *= (1 - famine.techEffectiveness);
  }

  // Calculate deaths this month
  const survivingPopulation = famine.populationAtRisk - famine.cumulativeDeaths;
  const deathsThisMonth = survivingPopulation * mortalityRate;

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
  const mortalityRate = famine.cumulativeDeaths / famine.populationAtRisk;
  return famine.foodSecurityLevel < 0.8 && mortalityRate < 0.8;
}

/**
 * Update famine system for one month
 * Returns total deaths this month
 */
export function updateFamineSystem(
  system: FamineSystem,
  aiCapability: number,
  resourcesAvailable: boolean
): number {
  let totalDeathsThisMonth = 0;

  // Progress each active famine
  for (let i = system.activeFamines.length - 1; i >= 0; i--) {
    const famine = system.activeFamines[i];

    // Calculate deaths this month
    const deaths = progressFamine(famine, aiCapability, resourcesAvailable);
    totalDeathsThisMonth += deaths;
    system.totalDeaths += deaths;

    // Track tech-prevented deaths
    if (famine.techDeployed && famine.techEffectiveness > 0) {
      const baseRate = calculateMonthlyMortalityRate(famine.monthsSinceOnset);
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
  return {
    activeFamines: system.activeFamines.length,
    totalDeaths: system.totalDeaths,
    genocideFamines: system.genocideFamines,
    techPreventedDeaths: system.techPreventedDeaths,
    techEffectiveness: system.totalDeaths > 0
      ? system.techPreventedDeaths / (system.totalDeaths + system.techPreventedDeaths)
      : 0,
  };
}

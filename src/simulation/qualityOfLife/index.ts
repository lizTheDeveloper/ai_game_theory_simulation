/**
 * Quality of Life System - Public API
 *
 * This index re-exports all public functions for backward compatibility.
 * The original qualityOfLife.ts file is now split into focused modules:
 * - core.ts: Main QoL calculation engine
 * - dimensions.ts: Survival fundamentals (food, water, shelter, habitability)
 * - penalties.ts: Penalty calculations (unemployment, trauma, population collapse)
 * - regional.ts: Regional distribution and inequality metrics
 * - aggregation.ts: Tier aggregation and weighting
 * - cache/regionalCache.ts: Performance optimization for regional lookups
 *
 * Performance improvements:
 * - Regional cache eliminates O(n) array scans → O(1) Map lookups
 * - Pre-computed dimension weights
 * - Modular structure enables targeted optimizations
 *
 * Target: 20-30% reduction in QoL calculation time
 */

// === CORE FUNCTIONS ===
export { updateQualityOfLifeSystems, initializeQualityOfLifeSystems } from './core';

// === AGGREGATION ===
export { calculateQualityOfLife, calculateQualityOfLifeOptimized, DIMENSION_WEIGHTS, validateQoLSystems } from './aggregation';

// === SURVIVAL FUNDAMENTALS ===
export {
  calculateSurvivalFundamentals,
  calculateFoodSecurity,
  calculateWaterSecurity,
  calculateThermalHabitability,
  calculateShelterSecurity
} from './dimensions';

// === REGIONAL DISTRIBUTION ===
export { calculateDistributionMetrics, calculateGiniCoefficient, calculateRegionalInequality } from './regional';

// === PENALTIES ===
export {
  calculateUnemploymentPenalty,
  calculateFoodSecurityPenalty,
  calculatePopulationCollapsePenalty,
  calculateTraumaPenalty,
  calculateTraumaInstitutionalErosion,
  calculateUBIFloor,
  calculateUBIMentalHealthBonus,
  calculateUBIShelterFloor,
  calculatePostScarcityMultipliers
} from './penalties';

// === CACHE ===
export type { RegionalCache, RegionalData } from './cache/regionalCache';
export { buildRegionalCache, getRegionalData, isCacheValid, getCachedRegions } from './cache/regionalCache';

// === MORTALITY & FAMINES ===
export { calculateEnvironmentalMortality, checkRegionalFamineRisk } from './mortality';
export type { EnvironmentalMortalityBreakdown } from './mortality';

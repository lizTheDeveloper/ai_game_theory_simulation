/**
 * Irreversibility Utility Functions (Nov 16, 2025)
 *
 * Research-backed asymptotic recovery and legacy stock release mechanics.
 *
 * Research foundation:
 * - Cousins et al. (2022): PFAS atmospheric half-life 50-100 years, planetary boundary breached
 * - Sörengård et al. (2024): Economic impossibility of cleanup at current emission rates
 * - Lake Erie case study (Paerl 2024): Sediment release matches river inputs
 *
 * @see /plans/irreversibility_framework_implementation_20251116.md
 * @see /research/novel_entities_zero_effectiveness_validation_20251113.md
 */

import { assertFinite, assertInRange } from './assertions';

/**
 * Asymptotic recovery for irreversible boundaries
 *
 * Models exponential approach to asymptotic floor (never reaches zero).
 * Used for Novel Entities (PFAS, microplastics) and Biosphere Integrity (extinction debt).
 *
 * @param currentValue - Current boundary value (0-100 scale or 0-2 normalized)
 * @param targetValue - Desired recovery target
 * @param halfLife - Years to 50% recovery
 * @param minimumAsymptoticValue - Floor value as fraction (0.05-0.20, never reaches zero)
 * @param deltaYears - Time step (default 1 month = 1/12 year)
 * @returns New boundary value after recovery step
 *
 * Research: Cousins et al. 2022 - PFAS atmospheric half-life 50-100 years
 *
 * Example: Novel Entities
 * - currentValue = 50 (boundary units)
 * - targetValue = 15 (asymptotic floor)
 * - halfLife = 75 years
 * - minimumAsymptoticValue = 0.15 (15% floor)
 * - After 100 years: ~60-70% of way to floor
 */
export function asymptoteRecovery(
  currentValue: number,
  targetValue: number,
  halfLife: number,
  minimumAsymptoticValue: number,
  deltaYears: number = 1/12,
  maxBoundaryValue?: number  // BUG FIX (Nov 23, 2025): Explicit scale for climate boundary
): number {
  assertFinite(currentValue, { location: 'asymptoteRecovery', valueName: 'currentValue' });
  assertFinite(targetValue, { location: 'asymptoteRecovery', valueName: 'targetValue' });
  assertFinite(halfLife, { location: 'asymptoteRecovery', valueName: 'halfLife' });
  assertInRange(minimumAsymptoticValue, 0, 1, { location: 'asymptoteRecovery', valueName: 'minimumAsymptoticValue' });

  // Prevent division by zero
  if (halfLife <= 0) {
    throw new Error(`❌ CRITICAL: asymptoteRecovery halfLife must be positive (got ${halfLife})`);
  }

  // Decay constant from half-life: λ = ln(2) / t_half
  const decayConstant = Math.log(2) / halfLife;

  // BUG FIX (Nov 23, 2025): Auto-scale detection was WRONG for climate_change boundary
  // Old logic: currentValue > 2 => scale = 100 (assumed 0-100 scale)
  // Bug: climate_change.currentValue can be 2.0+ (degrees Celsius), not a percentage!
  // Fix: Use explicit maxBoundaryValue parameter, default to threshold > 10 for percentage scale
  const scale = maxBoundaryValue !== undefined ? maxBoundaryValue : (currentValue > 10 ? 100 : 2);
  const effectiveTarget = Math.max(targetValue, minimumAsymptoticValue * scale);

  // Exponential approach to effective target: V(t) = V_target + (V_0 - V_target) × e^(-λt)
  const delta = (currentValue - effectiveTarget) * (1 - Math.exp(-decayConstant * deltaYears));

  const newValue = currentValue - delta;

  // Never go below asymptotic floor
  return Math.max(newValue, minimumAsymptoticValue * scale);
}

/**
 * Legacy stock release (exponential decay with annual release)
 *
 * Models accumulated contamination in environmental reservoirs (soil, sediment, atmosphere)
 * that slowly releases over decades/centuries.
 *
 * @param legacyStock - Accumulated contamination (metric tons)
 * @param releaseHalfLife - Years for 50% release
 * @param deltaYears - Time step (default 1 month = 1/12 year)
 * @returns {newStock, released} - Updated stock and amount released this timestep
 *
 * Research: Lake Erie phosphorus (Paerl 2024) - sediment release matches river inputs
 *
 * Example: PFAS legacy stock
 * - legacyStock = 46,000 Mt (accumulated PFAAs)
 * - releaseHalfLife = 50 years
 * - After 50 years (1 half-life): ~23,000 Mt remaining
 */
export function legacyStockRelease(
  legacyStock: number,
  releaseHalfLife: number,
  deltaYears: number = 1/12
): { newStock: number; released: number } {
  assertFinite(legacyStock, { location: 'legacyStockRelease', valueName: 'legacyStock' });
  assertFinite(releaseHalfLife, { location: 'legacyStockRelease', valueName: 'releaseHalfLife' });

  // Prevent division by zero
  if (releaseHalfLife <= 0) {
    throw new Error(`❌ CRITICAL: legacyStockRelease releaseHalfLife must be positive (got ${releaseHalfLife})`);
  }

  // Decay constant: λ = ln(2) / t_half
  const decayConstant = Math.log(2) / releaseHalfLife;

  // Amount released this timestep: Released = Stock × (1 - e^(-λΔt))
  const released = legacyStock * (1 - Math.exp(-decayConstant * deltaYears));

  // Remaining stock
  const newStock = legacyStock - released;

  return { newStock, released };
}

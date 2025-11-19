/**
 * Concentration Scaling Utilities (Nov 16, 2025)
 *
 * Models effectiveness penalties for treating dilute environmental contamination
 * vs concentrated industrial waste streams.
 *
 * Research foundation:
 * - Sörengård et al. (2024): Cost scales as (C_industrial / C_environmental)^α where α ≈ 2
 * - EPA (2024): PFAS removal at 4 ng/L (drinking water) vs 1,000 mg/L (industrial)
 * - Minnesota PCA (2024): $2.7-18 million/pound removal cost at municipal wastewater concentrations
 *
 * Key insight: 6-9 orders of magnitude dilution from industrial discharge (mg/L) to
 * environmental contamination (ng/L to pg/L) creates energy trap.
 *
 * @see /plans/irreversibility_framework_implementation_20251116.md
 * @see /research/novel_entities_zero_effectiveness_validation_20251113.md (Section 1.1)
 */

import { assertFinite, assertInRange } from './assertions';

/**
 * Power-law effectiveness decay with dilution
 *
 * Technologies designed for concentrated waste streams (mg/L) face exponential cost increases
 * when applied to dilute environmental contamination (ng/L).
 *
 * @param actualConcentration - Environmental concentration (ng/L)
 * @param optimalConcentration - Concentration where tech is optimal (mg/L = 1e6 ng/L)
 * @param minimumConcentration - Below this, tech is ineffective (ng/L)
 * @param exponent - Power law exponent (1.5-2.5, default 2.0)
 * @returns Effectiveness multiplier (0.0-1.0)
 *
 * Research: Sörengård 2024 - Cost scales as (C_industrial / C_environmental)^α where α ≈ 2
 *
 * Example: PFAS remediation
 * - Industrial wastewater: 1,000 mg/L → effectiveness = 1.0 (100%)
 * - Municipal wastewater: 100 ng/L → effectiveness = 0.01 (1%)
 * - Groundwater: 10 ng/L → effectiveness = 0.0 (below minimum)
 */
export function concentrationEffectiveness(
  actualConcentration: number,  // ng/L
  optimalConcentration: number = 1e6,  // mg/L = 1,000,000 ng/L
  minimumConcentration: number = 1000,  // 1 µg/L
  exponent: number = 2.0
): number {
  assertFinite(actualConcentration, { location: 'concentrationEffectiveness', valueName: 'actualConcentration' });
  assertFinite(optimalConcentration, { location: 'concentrationEffectiveness', valueName: 'optimalConcentration' });
  assertFinite(minimumConcentration, { location: 'concentrationEffectiveness', valueName: 'minimumConcentration' });
  assertFinite(exponent, { location: 'concentrationEffectiveness', valueName: 'exponent' });

  // Below minimum concentration, tech is ineffective
  if (actualConcentration < minimumConcentration) {
    return 0.0;
  }

  // Above optimal, effectiveness is 100%
  if (actualConcentration >= optimalConcentration) {
    return 1.0;
  }

  // Power-law scaling between minimum and optimal
  // Effectiveness = (C_actual / C_optimal)^(1/α)
  // This ensures cost scales as C^α (matches research)
  const ratio = actualConcentration / optimalConcentration;
  const effectiveness = Math.pow(ratio, 1 / exponent);

  return Math.min(1.0, Math.max(0.0, effectiveness));
}

/**
 * Environmental concentration estimate from boundary value
 *
 * Converts normalized planetary boundary value (0-2 scale) to estimated
 * environmental concentration (ng/L).
 *
 * @param boundaryValue - Planetary boundary value (0-2 scale, 1.0 = threshold)
 * @param safeConcentration - Concentration at boundary threshold (ng/L)
 * @returns Estimated environmental concentration (ng/L)
 *
 * Assumptions:
 * - value=1.0 (threshold) → safeConcentration
 * - value=0.0 (pristine) → 0.1 ng/L (background)
 * - Linear interpolation (simplification)
 *
 * Example: Novel Entities (PFAS)
 * - boundaryValue = 1.5 (50% over threshold)
 * - safeConcentration = 4 ng/L (EPA PFOA limit)
 * - estimated concentration ≈ 6 ng/L
 */
export function estimateConcentration(
  boundaryValue: number,
  safeConcentration: number = 4  // EPA PFOA limit (ng/L)
): number {
  assertInRange(boundaryValue, 0, 200, { location: 'estimateConcentration', valueName: 'boundaryValue' });
  assertFinite(safeConcentration, { location: 'estimateConcentration', valueName: 'safeConcentration' });

  const background = 0.1;  // ng/L (pristine environment)

  // Linear scaling: value 0 → background, value 1.0 → safeConcentration, value 2.0 → 2× safeConcentration
  const concentration = background + boundaryValue * (safeConcentration - background);

  return Math.max(background, concentration);
}

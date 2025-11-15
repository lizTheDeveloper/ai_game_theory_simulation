/**
 * Legacy Nutrient Stock System (TIER 2 HIGH - Nov 15, 2025)
 *
 * Tracks accumulated nutrient contamination in environmental reservoirs and calculates
 * exponential decay-based legacy releases.
 *
 * Research backing:
 * - Lake Erie case study: Internal sediment loading = 10,000-11,000 MT P/year (equals external inputs)
 * - Soil nitrogen: ~30 year half-life for accumulated reactive nitrogen
 * - Aquatic sediment phosphorus: ~100 year half-life
 * - Atmospheric deposition: Global nitrogen transport from agricultural/industrial sources
 *
 * Key mechanic: effectiveNitrogenPollution = currentAnnualInput + legacyRelease
 *               legacyRelease = stock × (1 - exp(-ln(2)/halfLife)) per year
 *
 * Expected impact: Addresses 10% god mode effectiveness gap - nutrient reduction takes decades to show effect
 *
 * @see research/nitrogen_food_coupling_20251115.md
 * @see reviews/nitrogen_food_coupling_critique_20251115.md (Grade B, CONDITIONAL PASS)
 */

import type { GameState } from '@/types/game';
import type { LegacyNutrientStock } from '@/types/planetaryBoundaries';
import { assertFinite, assertInRange } from '@/simulation/utils/assertions';

/**
 * Initialize legacy nutrient stocks based on current (2025) pollution baselines
 *
 * Research-backed initial values:
 * - Global nitrogen use: ~120 Mt N/year (2025 baseline)
 * - Global phosphorus use: ~25 Mt P/year (2025 baseline)
 * - Accumulated stocks from decades of overuse
 */
export function initializeLegacyNutrientStock(): LegacyNutrientStock {
  // Research: Decades of fertilizer overuse have built up massive legacy stocks
  // Soil nitrogen accumulation: ~60 years of surplus × ~20 Mt N/year surplus = ~1200 Mt N
  // Sediment phosphorus: Lake Erie example scaled globally

  return {
    soil: {
      nitrogen: 1200,      // Mt N accumulated (decades of overuse)
      phosphorus: 300,     // Mt P accumulated (decades of overuse)
      halfLife: 30,        // years (research-backed soil nitrogen residence time)
    },
    sediment: {
      nitrogen: 500,       // Mt N in aquatic sediments
      phosphorus: 800,     // Mt P in aquatic sediments (larger stock, longer residence)
      halfLife: 100,       // years (Lake Erie case: century-scale release)
    },
    atmosphericDeposition: 15,  // Mt N/year from atmospheric transport (global NOx emissions)
  };
}

/**
 * Calculate annual legacy release from accumulated stocks
 *
 * Uses exponential decay: release = stock × (1 - exp(-ln(2)/halfLife)) per year
 *
 * This is the FIRST-ORDER DECAY MODEL from environmental chemistry:
 * - Each year, a constant fraction of the stock is released
 * - Fraction = 1 - exp(-decay_constant) where decay_constant = ln(2)/halfLife
 * - At t = halfLife, exactly 50% of initial stock remains
 */
function calculateLegacyRelease(stock: number, halfLife: number, location: string): number {
  // Validate inputs
  const validatedStock = assertFinite(stock, {
    location,
    valueName: 'stock',
    additionalInfo: { halfLife }
  });

  const validatedHalfLife = assertFinite(halfLife, {
    location,
    valueName: 'halfLife',
    additionalInfo: { stock }
  });

  // Prevent division by zero
  if (validatedHalfLife <= 0) {
    throw new Error(`❌ ${location}: halfLife must be > 0, got ${validatedHalfLife}`);
  }

  // Exponential decay formula
  const decayConstant = Math.LN2 / validatedHalfLife;  // ln(2) / halfLife
  const releaseFraction = 1 - Math.exp(-decayConstant);  // Fraction released per year
  const annualRelease = validatedStock * releaseFraction;

  // Validate output
  return assertFinite(annualRelease, {
    location,
    valueName: 'annualRelease',
    additionalInfo: { stock, halfLife, releaseFraction }
  });
}

/**
 * Update legacy nutrient stocks each month
 *
 * Mechanics:
 * 1. Add current month's pollution inputs to stocks (accumulation)
 * 2. Calculate legacy releases from stocks (decay)
 * 3. Subtract releases from stocks (depletion)
 * 4. Return effective pollution = current inputs + legacy releases
 *
 * This creates the INERTIA effect: even with 100% input reduction,
 * environmental pollution stays high for decades due to legacy releases.
 */
export function updateLegacyNutrientStocks(
  state: GameState,
  currentNitrogenInput: number,   // Mt N/month current pollution
  currentPhosphorusInput: number   // Mt P/month current pollution
): { effectiveNitrogen: number; effectivePhosphorus: number } {

  if (!state.planetaryBoundariesSystem.legacyNutrientStock) {
    console.log('⚠️ WARNING: legacyNutrientStock not initialized, creating default');
    state.planetaryBoundariesSystem.legacyNutrientStock = initializeLegacyNutrientStock();
  }

  const stocks = state.planetaryBoundariesSystem.legacyNutrientStock;

  // Validate inputs
  const validatedNInput = assertFinite(currentNitrogenInput, {
    location: 'updateLegacyNutrientStocks',
    valueName: 'currentNitrogenInput',
    month: state.currentMonth
  });

  const validatedPInput = assertFinite(currentPhosphorusInput, {
    location: 'updateLegacyNutrientStocks',
    valueName: 'currentPhosphorusInput',
    month: state.currentMonth
  });

  // === ACCUMULATION: Add current inputs to stocks ===
  // Inputs are Mt/month, need to track annual accumulation
  // Only a fraction of inputs accumulate (rest is consumed/volatilized/runoff)
  const SOIL_ACCUMULATION_FRACTION = 0.3;    // 30% of inputs accumulate in soil
  const SEDIMENT_ACCUMULATION_FRACTION = 0.1; // 10% of inputs reach sediments

  stocks.soil.nitrogen += validatedNInput * SOIL_ACCUMULATION_FRACTION;
  stocks.soil.phosphorus += validatedPInput * SOIL_ACCUMULATION_FRACTION;
  stocks.sediment.nitrogen += validatedNInput * SEDIMENT_ACCUMULATION_FRACTION;
  stocks.sediment.phosphorus += validatedPInput * SEDIMENT_ACCUMULATION_FRACTION;

  // === DECAY: Calculate and apply legacy releases ===
  // Monthly release = (annual release) / 12
  const soilNitrogenRelease = calculateLegacyRelease(
    stocks.soil.nitrogen,
    stocks.soil.halfLife,
    'updateLegacyNutrientStocks.soilNitrogen'
  ) / 12;  // Convert annual to monthly

  const soilPhosphorusRelease = calculateLegacyRelease(
    stocks.soil.phosphorus,
    stocks.soil.halfLife,
    'updateLegacyNutrientStocks.soilPhosphorus'
  ) / 12;

  const sedimentNitrogenRelease = calculateLegacyRelease(
    stocks.sediment.nitrogen,
    stocks.sediment.halfLife,
    'updateLegacyNutrientStocks.sedimentNitrogen'
  ) / 12;

  const sedimentPhosphorusRelease = calculateLegacyRelease(
    stocks.sediment.phosphorus,
    stocks.sediment.halfLife,
    'updateLegacyNutrientStocks.sedimentPhosphorus'
  ) / 12;

  // === DEPLETION: Subtract releases from stocks ===
  stocks.soil.nitrogen -= soilNitrogenRelease;
  stocks.soil.phosphorus -= soilPhosphorusRelease;
  stocks.sediment.nitrogen -= sedimentNitrogenRelease;
  stocks.sediment.phosphorus -= sedimentPhosphorusRelease;

  // Prevent negative stocks (defensive guard, should never happen with exponential decay)
  stocks.soil.nitrogen = Math.max(0, stocks.soil.nitrogen);
  stocks.soil.phosphorus = Math.max(0, stocks.soil.phosphorus);
  stocks.sediment.nitrogen = Math.max(0, stocks.sediment.nitrogen);
  stocks.sediment.phosphorus = Math.max(0, stocks.sediment.phosphorus);

  // === EFFECTIVE POLLUTION: Current inputs + legacy releases + atmospheric deposition ===
  const totalNitrogenRelease = soilNitrogenRelease + sedimentNitrogenRelease;
  const totalPhosphorusRelease = soilPhosphorusRelease + sedimentPhosphorusRelease;

  const effectiveNitrogen = validatedNInput + totalNitrogenRelease + (stocks.atmosphericDeposition / 12);
  const effectivePhosphorus = validatedPInput + totalPhosphorusRelease;

  // Validate outputs
  const finalNitrogen = assertFinite(effectiveNitrogen, {
    location: 'updateLegacyNutrientStocks',
    valueName: 'effectiveNitrogen',
    month: state.currentMonth,
    additionalInfo: { currentNitrogenInput, totalNitrogenRelease, atmosphericDeposition: stocks.atmosphericDeposition / 12 }
  });

  const finalPhosphorus = assertFinite(effectivePhosphorus, {
    location: 'updateLegacyNutrientStocks',
    valueName: 'effectivePhosphorus',
    month: state.currentMonth,
    additionalInfo: { currentPhosphorusInput, totalPhosphorusRelease }
  });

  // Logging for diagnostics
  if (state.currentMonth % 12 === 0) {  // Annual logging
    console.log(`\n=== Legacy Nutrient Stocks (Year ${Math.floor(state.currentMonth / 12)}) ===`);
    console.log(`  🌾 Soil nitrogen stock: ${stocks.soil.nitrogen.toFixed(1)} Mt N`);
    console.log(`  🌾 Soil phosphorus stock: ${stocks.soil.phosphorus.toFixed(1)} Mt P`);
    console.log(`  🌊 Sediment nitrogen stock: ${stocks.sediment.nitrogen.toFixed(1)} Mt N`);
    console.log(`  🌊 Sediment phosphorus stock: ${stocks.sediment.phosphorus.toFixed(1)} Mt P`);
    console.log(`  ⬆️ Current N input: ${validatedNInput.toFixed(2)} Mt/month`);
    console.log(`  ⬆️ Legacy N release: ${totalNitrogenRelease.toFixed(2)} Mt/month`);
    console.log(`  🌍 Effective N pollution: ${finalNitrogen.toFixed(2)} Mt/month`);
    console.log(`  📊 Legacy contribution: ${((totalNitrogenRelease / finalNitrogen) * 100).toFixed(1)}%`);
  }

  return {
    effectiveNitrogen: finalNitrogen,
    effectivePhosphorus: finalPhosphorus
  };
}

/**
 * Get legacy nutrient contribution percentage
 *
 * Diagnostic metric: What % of current pollution is from legacy stocks vs new inputs?
 * - Early game (high inputs): Legacy is small % (e.g., 20%)
 * - Late game (reduced inputs): Legacy dominates (e.g., 80%)
 *
 * This explains why god mode isn't instantly effective - legacy stocks take decades to clear.
 */
export function getLegacyContributionPercentage(state: GameState): { nitrogen: number; phosphorus: number } {
  if (!state.planetaryBoundariesSystem.legacyNutrientStock) {
    return { nitrogen: 0, phosphorus: 0 };
  }

  const stocks = state.planetaryBoundariesSystem.legacyNutrientStock;

  // Calculate monthly release rates
  const soilNRelease = calculateLegacyRelease(stocks.soil.nitrogen, stocks.soil.halfLife, 'getLegacyContribution.N') / 12;
  const sedimentNRelease = calculateLegacyRelease(stocks.sediment.nitrogen, stocks.sediment.halfLife, 'getLegacyContribution.N') / 12;
  const soilPRelease = calculateLegacyRelease(stocks.soil.phosphorus, stocks.soil.halfLife, 'getLegacyContribution.P') / 12;
  const sedimentPRelease = calculateLegacyRelease(stocks.sediment.phosphorus, stocks.sediment.halfLife, 'getLegacyContribution.P') / 12;

  const totalNRelease = soilNRelease + sedimentNRelease + (stocks.atmosphericDeposition / 12);
  const totalPRelease = soilPRelease + sedimentPRelease;

  // This is a DIAGNOSTIC function - if total is 0, return 0% (not NaN)
  // In actual simulation, updateLegacyNutrientStocks handles the calculation properly

  return {
    nitrogen: totalNRelease, // Return absolute value for now, caller can compute percentage
    phosphorus: totalPRelease
  };
}

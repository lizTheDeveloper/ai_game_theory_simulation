/**
 * Permafrost Carbon Feedback Phase (TIER 2, RD-1)
 *
 * Models positive feedback loop from thawing permafrost releasing CO2 and CH4.
 * Arctic amplification causes polar regions to warm 3× faster than global average,
 * accelerating thaw and exposing ancient carbon to decomposition.
 *
 * Research:
 * - Schuur et al. (2022) Annual Review of Environment and Resources
 * - Turetsky et al. (2020) Nature Geoscience
 * - IPCC AR6 WG1 (2021) Chapter 5 (Carbon cycle feedbacks)
 * - McGuire et al. (2018) Nature
 *
 * Validated Parameters (from research, corrected per Sylvia):
 * - Carbon stock: 1,700 Gt C (range 1,460-1,832 Gt)
 * - Permafrost extent: 17.8M km²
 * - Arctic amplification: 3.0× (range 3.0-4.0×) [SAMPLED DISTRIBUTION]
 * - Thaw sensitivity: 3.5M km²/°C
 * - Feedback strength: 41 Gt C/°C (range 29-79 Gt C/°C)
 * - Decomposition rate: 3.0%/year (range 1.0-5.0%/year) [CORRECTED from 7.5%] [SAMPLED DISTRIBUTION]
 * - CO2 fraction: 90%, CH4 fraction: 10%
 *
 * Uncertainty Distributions (Monte Carlo validation requirement):
 * - Arctic amplification: Uniform [3.0, 4.0] (Kim et al. 2024 vs Rantanen et al. 2022)
 * - Decomposition rate: Uniform [0.01, 0.05] (turnover time literature, Schuur et al. 2022)
 * - Sampled each simulation step using RNG for deterministic uncertainty propagation
 *
 * Expected impact: +0.1-0.3°C warming by 2100 in baseline scenarios,
 *                  critical tipping point risk above 1.5°C warming
 *
 * Order: 18.5 (AFTER ClimateSystemPhase 34.0 for temperature, BEFORE carbon cycle updates)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import {
  assertFinite,
  assertInRange,
  assertStateProperty,
} from '@/simulation/utils/assertions';

export class PermafrostCarbonPhase implements SimulationPhase {
  readonly id = 'permafrost-carbon';
  readonly name = 'Permafrost Carbon Feedback';
  readonly order = 18.5;

  // No phase dependencies - uses state.resourceEconomy.co2.temperatureAnomaly
  // (set by ResourceEconomyPhase at order 17.0, which runs before this phase)

  // Constants (validated parameters)
  // Uncertainty ranges for Monte Carlo validation (research-skeptic requirement)
  private static readonly ARCTIC_AMPLIFICATION_MIN = 3.0; // Kim et al. 2024 (forced response)
  private static readonly ARCTIC_AMPLIFICATION_MAX = 4.0; // Rantanen et al. 2022 (observed)
  private static readonly DECOMPOSITION_RATE_MIN = 0.01; // 1%/year (slow pool dominated)
  private static readonly DECOMPOSITION_RATE_MAX = 0.05; // 5%/year (labile pool dominated)

  // Fixed parameters (well-constrained)
  private static readonly THAW_SENSITIVITY_KM2_PER_C = 3.5e6; // km² per °C
  private static readonly CO2_FRACTION = 0.9; // 90% of emissions
  private static readonly CH4_FRACTION = 0.1; // 10% of emissions
  private static readonly CH4_GWP = 28; // 100-year global warming potential
  private static readonly MIN_FLOOR = 1e-6; // Minimum floor to prevent exactly zero

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    // Sample uncertainty distributions (research-skeptic requirement for Monte Carlo validation)
    // Arctic amplification: Uniform [3.0, 4.0]
    // Research: Kim et al. 2024 (3× forced response), Rantanen et al. 2022 (4× observed)
    const arcticAmplification = assertInRange(
      PermafrostCarbonPhase.ARCTIC_AMPLIFICATION_MIN +
        rng() * (PermafrostCarbonPhase.ARCTIC_AMPLIFICATION_MAX - PermafrostCarbonPhase.ARCTIC_AMPLIFICATION_MIN),
      PermafrostCarbonPhase.ARCTIC_AMPLIFICATION_MIN,
      PermafrostCarbonPhase.ARCTIC_AMPLIFICATION_MAX,
      {
        location: 'PermafrostCarbonPhase.execute',
        valueName: 'arcticAmplification (sampled)',
        month: state.currentMonth
      }
    );

    // Decomposition rate: Uniform [0.01, 0.05] (1-5%/year)
    // Research: Schuur et al. 2022, turnover time literature (corrected from 7.5% per Sylvia)
    const decompositionRate = assertInRange(
      PermafrostCarbonPhase.DECOMPOSITION_RATE_MIN +
        rng() * (PermafrostCarbonPhase.DECOMPOSITION_RATE_MAX - PermafrostCarbonPhase.DECOMPOSITION_RATE_MIN),
      PermafrostCarbonPhase.DECOMPOSITION_RATE_MIN,
      PermafrostCarbonPhase.DECOMPOSITION_RATE_MAX,
      {
        location: 'PermafrostCarbonPhase.execute',
        valueName: 'decompositionRate (sampled)',
        month: state.currentMonth
      }
    );

    // Get global temperature anomaly (°C above pre-industrial)
    const globalTempAnomaly = this.getGlobalTemperatureAnomaly(state);

    // Arctic amplification: Polar regions warm 3-4× global average (sampled)
    // Research: IPCC AR6, Rantanen et al. (2022) Communications Earth & Environment
    const arcticTempAnomaly = assertFinite(
      globalTempAnomaly * arcticAmplification,
      {
        location: 'PermafrostCarbonPhase.execute',
        valueName: 'arcticTempAnomaly',
        month: state.currentMonth,
        additionalInfo: { globalTempAnomaly, arcticAmplification }
      }
    );

    // Calculate thaw rate (km²/year)
    // Research: Schuur et al. (2022) - 3.5M km² per °C sensitivity
    const annualThawRate = assertFinite(
      Math.max(0, arcticTempAnomaly * PermafrostCarbonPhase.THAW_SENSITIVITY_KM2_PER_C),
      {
        location: 'PermafrostCarbonPhase.execute',
        valueName: 'annualThawRate',
        month: state.currentMonth,
        additionalInfo: { arcticTempAnomaly }
      }
    );

    // Monthly thaw (convert annual rate to monthly)
    const monthlyThaw = annualThawRate / 12;

    // Update permafrost extent (can't go below zero)
    const oldExtent = assertFinite(
      state.permafrostSystem.permafrostExtent,
      {
        location: 'PermafrostCarbonPhase.execute',
        valueName: 'permafrostExtent (before)',
        month: state.currentMonth
      }
    );

    const newExtent = assertInRange(
      Math.max(0, oldExtent - monthlyThaw),
      0,
      20e6, // Upper bound: slightly above initial 17.8M km²
      {
        location: 'PermafrostCarbonPhase.execute',
        valueName: 'permafrostExtent (after)',
        month: state.currentMonth
      }
    );

    state.permafrostSystem.permafrostExtent = newExtent;
    state.permafrostSystem.annualThawRate = annualThawRate;

    // Calculate carbon density (Gt C per km²)
    // Prevent division by zero with MIN_FLOOR
    const carbonDensity = assertFinite(
      state.permafrostSystem.permafrostCarbon / Math.max(PermafrostCarbonPhase.MIN_FLOOR, newExtent),
      {
        location: 'PermafrostCarbonPhase.execute',
        valueName: 'carbonDensity',
        month: state.currentMonth,
        additionalInfo: {
          permafrostCarbon: state.permafrostSystem.permafrostCarbon,
          permafrostExtent: newExtent
        }
      }
    );

    // Carbon exposed this month (Gt C)
    const carbonExposed = assertFinite(
      monthlyThaw * carbonDensity,
      {
        location: 'PermafrostCarbonPhase.execute',
        valueName: 'carbonExposed',
        month: state.currentMonth,
        additionalInfo: { monthlyThaw, carbonDensity }
      }
    );

    // Decomposition rate: 1-5%/year (sampled) of exposed carbon (CORRECTED from 7.5%)
    // Research: Schuur et al. (2022), Turetsky et al. (2020)
    const monthlyDecompositionRate = decompositionRate / 12;
    const monthlyEmissions = assertFinite(
      carbonExposed * monthlyDecompositionRate,
      {
        location: 'PermafrostCarbonPhase.execute',
        valueName: 'monthlyEmissions',
        month: state.currentMonth,
        additionalInfo: { carbonExposed, monthlyDecompositionRate, decompositionRate }
      }
    );

    // Split into CO2 (90%) and CH4 (10%)
    // Research: Turetsky et al. (2020) - aerobic vs anaerobic decomposition
    const co2Emissions = assertFinite(
      monthlyEmissions * PermafrostCarbonPhase.CO2_FRACTION,
      {
        location: 'PermafrostCarbonPhase.execute',
        valueName: 'co2Emissions',
        month: state.currentMonth
      }
    );

    const ch4Emissions = assertFinite(
      monthlyEmissions * PermafrostCarbonPhase.CH4_FRACTION,
      {
        location: 'PermafrostCarbonPhase.execute',
        valueName: 'ch4Emissions',
        month: state.currentMonth
      }
    );

    // Update state
    state.permafrostSystem.co2Emissions = co2Emissions;
    state.permafrostSystem.ch4Emissions = ch4Emissions;
    state.permafrostSystem.annualEmissions = monthlyEmissions * 12; // Annualized for reporting

    // Update remaining carbon (can't go below zero)
    const oldCarbon = assertFinite(
      state.permafrostSystem.permafrostCarbon,
      {
        location: 'PermafrostCarbonPhase.execute',
        valueName: 'permafrostCarbon (before)',
        month: state.currentMonth
      }
    );

    const newCarbon = assertInRange(
      Math.max(0, oldCarbon - carbonExposed),
      0,
      2000, // Upper bound: slightly above initial 1,700 Gt C
      {
        location: 'PermafrostCarbonPhase.execute',
        valueName: 'permafrostCarbon (after)',
        month: state.currentMonth
      }
    );

    state.permafrostSystem.permafrostCarbon = newCarbon;

    // Integrate with carbon cycle
    // Add CO2 emissions to atmospheric CO2
    // CH4 emissions converted to CO2-equivalent (28× GWP)
    const co2Equivalent = assertFinite(
      co2Emissions + (ch4Emissions * PermafrostCarbonPhase.CH4_GWP),
      {
        location: 'PermafrostCarbonPhase.execute',
        valueName: 'co2Equivalent',
        month: state.currentMonth,
        additionalInfo: { co2Emissions, ch4Emissions }
      }
    );

    // Update atmospheric CO2 via resourceEconomy.co2 system
    if (state.resourceEconomy?.co2) {
      // 1 Gt C = 3.67 Gt CO2 (molecular weight conversion)
      // 1 ppm CO2 ≈ 2.124 Gt C (atmospheric mass)
      const ppmIncrease = assertFinite(
        co2Equivalent / 2.124,
        {
          location: 'PermafrostCarbonPhase.execute',
          valueName: 'ppmIncrease',
          month: state.currentMonth,
          additionalInfo: { co2Equivalent }
        }
      );

      const oldPPM = assertFinite(
        state.resourceEconomy.co2.atmosphericCO2,
        {
          location: 'PermafrostCarbonPhase.execute',
          valueName: 'atmosphericCO2 (before)',
          month: state.currentMonth
        }
      );

      state.resourceEconomy.co2.atmosphericCO2 = assertInRange(
        oldPPM + ppmIncrease,
        280,  // Pre-industrial baseline
        2000, // Upper bound (catastrophic scenario)
        {
          location: 'PermafrostCarbonPhase.execute',
          valueName: 'atmosphericCO2 (after)',
          month: state.currentMonth
        }
      );
    }

    // Logging (only on significant changes)
    if (state.currentMonth % 12 === 0 || monthlyEmissions > 0.1) {
      console.log(`\n=== ❄️ Permafrost Carbon Feedback ===`);
      console.log(`  🎲 Sampled parameters (this run):`);
      console.log(`     - Arctic amplification: ${arcticAmplification.toFixed(2)}× (range: 3.0-4.0)`);
      console.log(`     - Decomposition rate: ${(decompositionRate * 100).toFixed(1)}%/year (range: 1-5%)`);
      console.log(`  🌡️ Arctic warming: ${arcticTempAnomaly.toFixed(2)}°C (${arcticAmplification.toFixed(2)}× global)`);
      console.log(`  ❄️ Extent: ${(newExtent / 1e6).toFixed(2)}M km² (${((oldExtent - newExtent) / 1e3).toFixed(1)}k km² lost this month)`);
      console.log(`  💨 Carbon remaining: ${newCarbon.toFixed(0)} Gt C`);
      console.log(`  💨 Annual emissions: ${state.permafrostSystem.annualEmissions.toFixed(2)} Gt C/year`);
      console.log(`     - CO2: ${(co2Emissions * 12).toFixed(2)} Gt C/year`);
      console.log(`     - CH4: ${(ch4Emissions * 12).toFixed(2)} Gt C/year (${(ch4Emissions * 12 * PermafrostCarbonPhase.CH4_GWP).toFixed(1)} Gt CO2-eq/year)`);

      // Warning thresholds
      if (newExtent < 0.5 * 17.8e6) {
        console.warn(`  ⚠️ WARNING: Over 50% of permafrost lost (${((1 - newExtent / 17.8e6) * 100).toFixed(1)}%)`);
      }
      if (state.permafrostSystem.annualEmissions > 1.0) {
        console.warn(`  ⚠️ WARNING: High permafrost emissions (${state.permafrostSystem.annualEmissions.toFixed(1)} Gt C/year)`);
      }
      if (newExtent < 0.2 * 17.8e6) {
        console.error(`  🚨 CRITICAL: Permafrost nearly depleted (${((1 - newExtent / 17.8e6) * 100).toFixed(1)}% lost)`);
      }
    }

    return {
      events: [],
    };
  }

  /**
   * Get global temperature anomaly from climate system
   *
   * Tries multiple sources in priority order:
   * 1. resourceEconomy.co2.temperatureAnomaly (primary)
   * 2. environmentalAccumulation.climateStability (derived)
   * 3. planetaryBoundariesSystem.climate_change (derived)
   * 4. Fallback to 1.1°C (2025 baseline)
   */
  private getGlobalTemperatureAnomaly(state: GameState): number {
    // Try resourceEconomy.co2 first (primary source)
    if (state.resourceEconomy?.co2?.temperatureAnomaly !== undefined) {
      const tempAnomaly = assertFinite(
        state.resourceEconomy.co2.temperatureAnomaly,
        {
          location: 'PermafrostCarbonPhase.getGlobalTemperatureAnomaly',
          valueName: 'temperatureAnomaly (from resourceEconomy)',
          month: state.currentMonth
        }
      );
      return tempAnomaly;
    }

    // Try environmentalAccumulation.climateStability (derived)
    if (state.environmentalAccumulation?.climateStability !== undefined) {
      const climateStability = assertInRange(
        state.environmentalAccumulation.climateStability,
        0, 1,
        {
          location: 'PermafrostCarbonPhase.getGlobalTemperatureAnomaly',
          valueName: 'climateStability',
          month: state.currentMonth
        }
      );
      // Derive temperature: 1.0°C at climateStability=0.6, +2°C range
      const derivedTemp = assertFinite(
        1.0 + (1 - climateStability) * 2.0,
        {
          location: 'PermafrostCarbonPhase.getGlobalTemperatureAnomaly',
          valueName: 'derivedTemp (from climateStability)',
          month: state.currentMonth,
          additionalInfo: { climateStability }
        }
      );
      return derivedTemp;
    }

    // Try planetary boundaries (last resort)
    if (state.planetaryBoundariesSystem?.boundaries?.climate_change) {
      const boundary = state.planetaryBoundariesSystem.boundaries.climate_change;
      const derivedTemp = assertFinite(
        boundary.currentValue * 2.0,
        {
          location: 'PermafrostCarbonPhase.getGlobalTemperatureAnomaly',
          valueName: 'derivedTemp (from planetary boundary)',
          month: state.currentMonth,
          additionalInfo: { boundaryValue: boundary.currentValue }
        }
      );
      return derivedTemp;
    }

    // Fallback to 2025 baseline (1.1°C)
    console.warn(`⚠️ PermafrostCarbonPhase: No temperature source found, using 2025 baseline (1.1°C)`);
    return 1.1;
  }
}

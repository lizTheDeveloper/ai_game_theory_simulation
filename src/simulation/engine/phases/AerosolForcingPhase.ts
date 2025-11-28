/**
 * Aerosol Forcing Phase (17.8)
 *
 * Applies anthropogenic aerosol cooling effects to temperature calculations.
 *
 * **RESEARCH BASIS:**
 * - IPCC AR6 (2021): Aerosol ERF = -1.1 W/m² (2019 vs 1750)
 * - Aerosols have masked ~30% of anthropogenic warming
 * - Declining trend 1990-2024 due to air quality regulations
 *
 * **ARCHITECTURE:**
 * - Hindcast mode (1990-2024): SKIP - NASA data already includes aerosol effects
 * - Projection mode (2025+): Apply declining aerosol cooling (SSP2-4.5 trajectory)
 *
 * **HYBRID MODEL (Research Validation Requirement):**
 * Temperature = Equilibrium(CO2) + AerosolCooling + VolcanicForcing
 * NOT: Temperature = if(historical) NASA else Equilibrium
 *
 * Research: research/temperature_overestimation_HIGH6_research_20251127.md
 * Critique: reviews/hindcast_calibration_research_critique_20251127.md (CONDITIONAL APPROVE)
 *
 * **EXECUTION ORDER:** 17.8 (after TechCoolingPhase 17.5, before other systems)
 * **DEPENDENCIES:** Reads resourceEconomy.co2.temperatureAnomaly, writes same field
 */

import type { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { assertFinite } from '@/simulation/utils/assertions';
import { isHistoricalModeActive } from '@/simulation/utils/historicalMode';

export class AerosolForcingPhase implements SimulationPhase {
  readonly id = 'aerosol-forcing';
  readonly name = 'Aerosol Forcing';
  readonly order = 17.8;
  readonly dependencies = ['tech-cooling'] as const; // After tech cooling, before other systems

  // IPCC AR6 aerosol forcing values (W/m²)
  // Research: research/temperature_overestimation_HIGH6_research_20251127.md lines 185-189
  private static readonly AEROSOL_ERF_1990 = -1.1;  // W/m² (peak cooling, pre-regulation)
  private static readonly AEROSOL_ERF_2024 = -0.8;  // W/m² (declining, air quality regulations)
  private static readonly AEROSOL_ERF_2050 = -0.3;  // W/m² (SSP2-4.5 projection)

  // Climate feedback parameter: λ ≈ 0.8 K/(W/m²) (IPCC AR6)
  // Research: research/temperature_overestimation_HIGH6_research_20251127.md line 200
  private static readonly CLIMATE_FEEDBACK_PARAMETER = 0.8; // K per W/m²

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // SKIP in hindcast mode (1990-2024): NASA data already includes aerosol effects
    // Research critique requirement: Hybrid model, not bifurcated
    // (reviews/hindcast_calibration_research_critique_20251127.md lines 413-430)
    if (this.isHistoricalBaselinePeriod(state)) {
      return {
        events: [],
        metadata: {
          message: 'Skipped (hindcast mode - aerosols already in NASA data)'
        }
      };
    }

    // Calculate current year
    const startYear = state.config?.startYear ?? 2025;
    const currentYear = startYear + Math.floor(state.currentMonth / 12);

    // Get aerosol ERF for current year (linear interpolation)
    let aerosolERF: number;
    if (currentYear <= 2024) {
      // Pre-2024 (should not reach here due to hindcast check, but handle gracefully)
      aerosolERF = this.interpolate(
        currentYear,
        1990, AerosolForcingPhase.AEROSOL_ERF_1990,
        2024, AerosolForcingPhase.AEROSOL_ERF_2024
      );
    } else if (currentYear <= 2050) {
      // 2025-2050: Declining aerosol cooling (SSP2-4.5)
      aerosolERF = this.interpolate(
        currentYear,
        2024, AerosolForcingPhase.AEROSOL_ERF_2024,
        2050, AerosolForcingPhase.AEROSOL_ERF_2050
      );
    } else {
      // Post-2050: Stabilize at 2050 value
      aerosolERF = AerosolForcingPhase.AEROSOL_ERF_2050;
    }

    // Convert ERF to temperature effect
    // ΔT = ERF × λ where λ = 0.8 K/(W/m²)
    const aerosolCooling = assertFinite(
      aerosolERF * AerosolForcingPhase.CLIMATE_FEEDBACK_PARAMETER,
      {
        location: 'AerosolForcingPhase.execute',
        valueName: 'aerosolCooling',
        month: state.currentMonth,
        additionalInfo: { aerosolERF, currentYear }
      }
    );

    // Apply cooling to temperature anomaly
    const oldTemp = state.resourceEconomy.co2.temperatureAnomaly;
    state.resourceEconomy.co2.temperatureAnomaly = assertFinite(
      Math.max(0, oldTemp + aerosolCooling), // aerosolCooling is negative
      {
        location: 'AerosolForcingPhase.execute',
        valueName: 'temperatureAnomaly',
        month: state.currentMonth,
        additionalInfo: {
          oldTemp,
          aerosolCooling,
          aerosolERF,
          newTemp: Math.max(0, oldTemp + aerosolCooling)
        }
      }
    );

    // Log significant cooling (annually)
    if (state.currentMonth % 12 === 0) {
      const newTemp = state.resourceEconomy.co2.temperatureAnomaly;
      console.log(
        `\n🌫️ AEROSOL COOLING (Month ${state.currentMonth}, Year ${currentYear})\n` +
        `   Baseline temp (from CO2): ${oldTemp.toFixed(2)}°C\n` +
        `   Aerosol ERF: ${aerosolERF.toFixed(2)} W/m²\n` +
        `   Cooling effect: ${aerosolCooling.toFixed(2)}°C\n` +
        `   Effective temp: ${newTemp.toFixed(2)}°C`
      );
    }

    return {
      events: [],
      metadata: {
        aerosolERF,
        aerosolCooling,
        appliedCooling: true,
        message: `Applied ${aerosolCooling.toFixed(2)}°C aerosol cooling (ERF ${aerosolERF.toFixed(2)} W/m²)`
      }
    };
  }

  /**
   * Check if current simulation is in historical baseline period (1990-2024)
   * where NASA GISS data already includes aerosol effects.
   */
  private isHistoricalBaselinePeriod(state: GameState): boolean {
    // Check scenario mode
    if (!isHistoricalModeActive(state)) return false;

    // Check year range
    const startYear = state.config?.startYear;
    if (!startYear) return false;

    const currentYear = startYear + Math.floor(state.currentMonth / 12);
    return currentYear >= 1990 && currentYear <= 2024;
  }

  /**
   * Linear interpolation between two points
   */
  private interpolate(
    x: number,
    x1: number, y1: number,
    x2: number, y2: number
  ): number {
    // Clamp to range
    if (x <= x1) return y1;
    if (x >= x2) return y2;

    // Linear interpolation
    const t = (x - x1) / (x2 - x1);
    return y1 + t * (y2 - y1);
  }
}

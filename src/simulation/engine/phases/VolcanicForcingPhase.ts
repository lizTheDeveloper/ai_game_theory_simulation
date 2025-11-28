/**
 * VolcanicForcingPhase (16.5)
 *
 * Tracks stratospheric aerosol optical depth (AOD) from volcanic eruptions
 * and calculates radiative forcing for the climate system.
 *
 * **CRITICAL for Historical Validation (1990-2010):**
 * Captures Mount Pinatubo (June 1991) cooling of -0.2 to -0.3°C during 1991-1993.
 * Without this phase, hindcast validation fails 50% of temperature checks.
 *
 * **Physics:**
 * - Stratospheric aerosols reflect incoming solar radiation
 * - Radiative forcing = -25 W/m² per unit AOD (IPCC AR6 WG1)
 * - Exponential decay: AOD(t) = AOD_peak * exp(-t / τ) where τ ≈ 1.5 years (18 months)
 *
 * **Historical Eruptions (for hindcasting):**
 * - Mount Pinatubo (June 1991): Peak AOD ≈ 0.15, -0.3°C cooling
 *   - Triggers at Month 18 (for 1990 start year)
 *   - Decay timescale: 18 months (e-folding time)
 *
 * **Future Eruptions:**
 * For forecast scenarios (2025+), this phase can be extended to include:
 * - Stochastic eruption events (probabilistic, based on volcanic risk assessment)
 * - Geoengineering via stratospheric aerosol injection (SAI)
 *
 * **EXECUTION ORDER:** 16.5 (before ClimateSystemPhase at 17.0)
 * **DEPENDENCIES:** None (reads only simulation metadata)
 * **WRITES:** state.volcanicForcing (AOD, forcing)
 *
 * **Research:**
 * - IPCC AR6 WG1 Chapter 7 (volcanic forcing reconstructions)
 * - Sato et al. (1993) "Stratospheric Aerosol Optical Depth, 1850-1990"
 * - NASA GISS volcanic forcing datasets
 *
 * **Expected Impact:**
 * - Temperature validation pass rate: 50% → 70%+ (1990-2010 hindcast)
 * - RMSE reduction: 0.108°C → <0.10°C (by fixing 1991-1993 missing cooling)
 */

import type { GameState, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import type { SimulationPhase } from '../PhaseOrchestrator';
import { assertFinite, assertInRange } from '@/simulation/utils/assertions';

/**
 * Historical volcanic eruptions database
 * Only includes major eruptions with significant climate impact (VEI 6+)
 */
interface HistoricalEruption {
  name: string;
  /** Month offset from Jan 1990 (for 1990 start year) */
  monthOffset1990: number;
  /** Peak stratospheric aerosol optical depth (dimensionless) */
  peakAOD: number;
  /** Decay timescale in months (e-folding time, typically 12-24 months) */
  decayMonths: number;
}

/**
 * Historical eruptions for hindcast validation (1990-2010)
 */
const HISTORICAL_ERUPTIONS: HistoricalEruption[] = [
  {
    name: 'Mount Pinatubo',
    monthOffset1990: 18,  // June 1991 (18 months after Jan 1990)
    peakAOD: 0.15,        // IPCC AR6 / NASA GISS volcanic forcing
    decayMonths: 18       // τ ≈ 1.5 years (Sato et al. 1993)
  }
  // Future: Add other eruptions if extending hindcast period
  // e.g., El Chichón (1982), Krakatoa (1883), Tambora (1815)
];

export class VolcanicForcingPhase implements SimulationPhase {
  readonly id = 'volcanic-forcing';
  readonly name = 'Volcanic Forcing';
  readonly order = 16.5;
  readonly dependencies = [] as const; // No phase dependencies (reads metadata only)

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    const { currentMonth } = state;
    const startYear = state.config?.startYear ?? 2025;

    // === HISTORICAL ERUPTION TRIGGERS ===
    // For hindcast scenarios (1990 start), trigger Pinatubo at Month 18
    if (startYear === 1990) {
      for (const eruption of HISTORICAL_ERUPTIONS) {
        if (currentMonth === eruption.monthOffset1990) {
          // Trigger eruption
          state.volcanicForcing.currentAOD = eruption.peakAOD;
          state.volcanicForcing.lastEruptionMonth = currentMonth;

          console.log(
            `\n🌋 VOLCANIC ERUPTION: ${eruption.name} (Month ${currentMonth})\n` +
            `   Peak AOD: ${eruption.peakAOD.toFixed(3)}\n` +
            `   Decay timescale: ${eruption.decayMonths} months\n` +
            `   Expected cooling: ~${(eruption.peakAOD * 0.5).toFixed(2)}°C over ${eruption.decayMonths} months`
          );
        }
      }
    }

    // === EXPONENTIAL DECAY ===
    // Apply decay to existing volcanic aerosols
    if (state.volcanicForcing.currentAOD > 0.001) {
      const monthsSinceEruption = currentMonth - state.volcanicForcing.lastEruptionMonth;

      // Determine decay timescale from historical data
      // Default to 18 months (Mount Pinatubo timescale) if not in eruption database
      let decayTimescale = 18; // months
      if (startYear === 1990) {
        const matchingEruption = HISTORICAL_ERUPTIONS.find(
          e => state.volcanicForcing.lastEruptionMonth === e.monthOffset1990
        );
        if (matchingEruption) {
          decayTimescale = matchingEruption.decayMonths;
        }
      }

      // Exponential decay: AOD(t) = AOD_0 * exp(-Δt / τ)
      // Per-month decay: AOD *= exp(-1 / τ)
      const decayFactor = Math.exp(-1 / decayTimescale);
      const oldAOD = state.volcanicForcing.currentAOD;
      state.volcanicForcing.currentAOD = assertFinite(
        oldAOD * decayFactor,
        {
          location: 'VolcanicForcingPhase.execute',
          valueName: 'currentAOD (after decay)',
          month: currentMonth,
          additionalInfo: {
            oldAOD,
            decayFactor,
            decayTimescale,
            monthsSinceEruption
          }
        }
      );

      // Validate AOD stays in physical range [0, 1]
      state.volcanicForcing.currentAOD = assertInRange(
        state.volcanicForcing.currentAOD,
        0,
        1,
        {
          location: 'VolcanicForcingPhase.execute',
          valueName: 'currentAOD (range check)',
          month: currentMonth
        }
      );

      // Log significant decay (every 6 months during active decay)
      if (state.volcanicForcing.currentAOD > 0.01 && currentMonth % 6 === 0) {
        console.log(
          `🌋 Volcanic AOD decay: ${oldAOD.toFixed(3)} → ${state.volcanicForcing.currentAOD.toFixed(3)} ` +
          `(${monthsSinceEruption} months post-eruption, τ=${decayTimescale}mo)`
        );
      }

      // Clear AOD if below threshold (avoid numerical underflow)
      if (state.volcanicForcing.currentAOD < 0.001) {
        state.volcanicForcing.currentAOD = 0.0;
        console.log(`🌋 Volcanic forcing cleared: AOD < 0.001 (Month ${currentMonth})`);
      }
    }

    // === RADIATIVE FORCING CALCULATION ===
    // Formula from IPCC AR6 WG1: F = -25 W/m² per unit AOD
    // Negative forcing = cooling (aerosols reflect sunlight)
    state.volcanicForcing.forcingWattsPerM2 = assertFinite(
      -25.0 * state.volcanicForcing.currentAOD,
      {
        location: 'VolcanicForcingPhase.execute',
        valueName: 'forcingWattsPerM2',
        month: currentMonth,
        additionalInfo: {
          currentAOD: state.volcanicForcing.currentAOD,
          formula: 'F = -25 * AOD (IPCC AR6)'
        }
      }
    );

    // Log active forcing (if significant)
    if (Math.abs(state.volcanicForcing.forcingWattsPerM2) > 0.1) {
      if (currentMonth % 6 === 0) {
        console.log(
          `🌋 Volcanic forcing: ${state.volcanicForcing.forcingWattsPerM2.toFixed(2)} W/m² ` +
          `(AOD ${state.volcanicForcing.currentAOD.toFixed(3)})`
        );
      }
    }

    return {
      events: [],
      metadata: {
        volcancForcingWattsPerM2: state.volcanicForcing.forcingWattsPerM2,
        currentAOD: state.volcanicForcing.currentAOD,
        message:
          Math.abs(state.volcanicForcing.forcingWattsPerM2) > 0.1
            ? `Volcanic forcing active: ${state.volcanicForcing.forcingWattsPerM2.toFixed(2)} W/m²`
            : undefined
      }
    };
  }
}

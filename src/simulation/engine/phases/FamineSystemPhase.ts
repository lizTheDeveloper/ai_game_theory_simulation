/**
 * Famine System Phase (TIER 1.7)
 *
 * Manages realistic famine progression and ecosystem collapse famines
 * - Checks regional biodiversity for ecosystem collapse → famine triggers
 * - Updates active famines with gradual 30-60 day death curves
 * - Applies famine deaths to population
 * - Tracks tech deployment effectiveness vs genocide scenarios
 *
 * Research: Gaza/Yemen/Sudan (2024-25), IPBES (2019), FAO (2024)
 *
 * **EXECUTION ORDER:** 21.6 (After legacy-nutrient-stocks 21.5, before extinctions 37.0)
 * **DEPENDENCIES:** food-security-degradation (19.7), planetary_boundaries (21.0)
 * **SIDE EFFECTS:** Triggers famines, applies mortality, updates famine state
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { addMortalityRisk } from '@/simulation/bayesianMortality';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import {
  assertFinite,
  assertProbability,
  assertMortalityRate,
  assertNonEmpty,
  assertInRange,
} from '@/simulation/utils/assertions';
import { isHistoricalModeActive } from '@/simulation/utils/historicalMode';
import { checkRegionalFamineRisk } from '../../qualityOfLife';
import { updateFamineSystem } from '../../../types/famine';

export class FamineSystemPhase implements SimulationPhase {
  readonly id = 'famine_system';
  readonly name = 'Famine System';
  readonly order = 21.6; // After legacy-nutrient-stocks (21.5) to use effective pollution values

  // DEPENDENCIES (Nov 6, 2025): Must run after food security and planetary boundaries
  readonly dependencies = [
    'food-security-degradation',  // Order 19.7: Food security baseline
    'planetary_boundaries',       // Order 21.0: Ecosystem health assessment
  ] as const;

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    if (!state.famineSystem) return { events: [] };
    setDeterministicRng(rng);

    // HIGH-7 FIX (Nov 27, 2025): Skip famine system in historical mode
    // Root cause: Famine cascades trigger during 1990-2024 baseline period, causing
    // population crashes instead of historical growth (+52.8% actual vs -76% simulated).
    // The historical period had localized famines (Somalia 1992, North Korea 1990s) but
    // no global food crises. Historical CDR data already incorporates these events.
    // Solution: Disable famine system entirely for hindcast validation (1990-2024).
    // CRITICAL-1 FIX (Nov 28, 2025): Unified historical mode detection via isHistoricalModeActive()
    // historicalMode = empirical UN data (1990-2024), scenarioMode = crisis severity
    if (isHistoricalModeActive(state)) {
      return { events: [] };
    }

    // 1. Check regional biodiversity for new famine triggers (ecosystem collapse)checkRegionalFamineRisk(state, state.currentMonth);

    // 2. Update active famines (progress death curves)// Validate AI capability aggregation (prevent NaN propagation)
    const totalAICapability = assertFinite(
      state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0),
      {
        location: 'FamineSystemPhase.execute',
        valueName: 'totalAICapability',
        month: state.currentMonth,
        additionalInfo: { agentCount: state.aiAgents.length },
      }
    );

    // Validate food reserves are valid probability
    const foodReserves = assertProbability(
      state.resourceEconomy.food.reserves,
      {
        location: 'FamineSystemPhase.execute',
        valueName: 'resourceEconomy.food.reserves',
        month: state.currentMonth,
      }
    );
    const resourcesAvailable = foodReserves > 0.5;

    // FIX (Oct 26, 2025): Pass current month for seasonal mortality calculation
    const famineDeathsRaw = updateFamineSystem(
      state.famineSystem,
      totalAICapability,
      resourcesAvailable,
      state.currentMonth
    );

    // Validate famine deaths (critical mortality value, cannot be NaN)
    const famineDeaths = assertFinite(famineDeathsRaw, {
      location: 'FamineSystemPhase.execute',
      valueName: 'famineDeaths',
      month: state.currentMonth,
      additionalInfo: {
        totalAICapability,
        resourcesAvailable,
        activeFamines: state.famineSystem.activeFamines.length,
      },
    });

    // Famine deaths must be non-negative (deaths cannot be negative)
    if (famineDeaths < 0) {
      throw new Error(
        `❌ Negative famine deaths in FamineSystemPhase\n` +
        `   famineDeaths = ${famineDeaths}M\n` +
        `   Month: ${state.currentMonth}\n` +
        `   This indicates a bug in updateFamineSystem calculation.`
      );
    }

    // 3. Apply famine deaths to population via centralized mortality system
    if (famineDeaths > 0) {
      const famines = state.famineSystem.activeFamines;

      // For each active famine, add mortality risk with appropriate root cause
      // This allows proper Bayesian compounding of multi-causal famines
      if (famines.length > 0) {
        // Validate we have famines array
        assertNonEmpty(famines, {
          location: 'FamineSystemPhase.execute',
          valueName: 'activeFamines',
          month: state.currentMonth,
        });

        for (const famine of famines) {
          // Estimate this famine's contribution (proportional to active famines)
          // Division by famines.length is safe (assertNonEmpty checked it)
          // Division by population needs validation
          const population = assertFinite(state.humanPopulationSystem.population, {
            location: 'FamineSystemPhase.execute',
            valueName: 'humanPopulationSystem.population',
            month: state.currentMonth,
          });

          if (population <= 0) {
            throw new Error(
              `❌ Zero or negative population in FamineSystemPhase\n` +
              `   population = ${population}B\n` +
              `   Month: ${state.currentMonth}\n` +
              `   Cannot calculate famine mortality rate with zero population.`
            );
          }

          const famineMortalityRate = assertMortalityRate(
            (famineDeaths / famines.length) / population,
            {
              location: 'FamineSystemPhase.execute',
              valueName: 'famineMortalityRate',
              month: state.currentMonth,
              population: population * 1000, // Convert to millions for display
            }
          );

          // Determine root cause based on famine cause
          let rootCause: 'conflict' | 'climate' | 'social' | 'ecosystem' = 'social';
          let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';

          if (famine.cause === 'war_displacement' || famine.cause === 'aid_blockade' || famine.cause === 'nuclear_winter') {
            rootCause = 'conflict';
            confidence = 'HIGH'; // War-driven famines well documented
          } else if (famine.cause === 'crop_failure') {
            rootCause = 'climate';
            confidence = 'HIGH'; // Climate-driven crop failures
          } else if (famine.cause === 'drought') {
            rootCause = 'climate'; // Drought is climate-driven
            confidence = 'MEDIUM'; // May have natural variability component
          } else {
            rootCause = 'social'; // economic_collapse, resource_extraction
            confidence = 'HIGH';
          }

          addMortalityRisk(state.humanPopulationSystem, {
            type: 'famine',
            baseRisk: famineMortalityRate,
            proximate: 'famine',
            root: rootCause,
            confidence,
            scope: 'REGIONAL', // Famines are regional
            region: famine.affectedRegion,
            month: state.currentMonth,
            description: `Famine in ${famine.affectedRegion}: ${famine.cause}`,
          });
        }
      } else {
        // No active famines (shouldn't happen) - add aggregate risk with social cause
        const population = assertFinite(state.humanPopulationSystem.population, {
          location: 'FamineSystemPhase.execute (fallback)',
          valueName: 'humanPopulationSystem.population',
          month: state.currentMonth,
        });

        if (population <= 0) {
          throw new Error(
            `❌ Zero or negative population in FamineSystemPhase (fallback)\n` +
            `   population = ${population}B\n` +
            `   Month: ${state.currentMonth}\n` +
            `   Cannot calculate mortality rate with zero population.`
          );
        }

        const mortalityRate = assertMortalityRate(
          famineDeaths / population,
          {
            location: 'FamineSystemPhase.execute (fallback)',
            valueName: 'mortalityRate',
            month: state.currentMonth,
            population: population * 1000, // Convert to millions for display
          }
        );
        addMortalityRisk(state.humanPopulationSystem, {
          type: 'famine',
          baseRisk: mortalityRate,
          proximate: 'famine',
          root: 'social', // Default to policy/distribution failures
          confidence: 'LOW', // Unknown cause
          scope: 'SEMI-GLOBAL',
          month: state.currentMonth,
          description: 'Unattributed famine deaths',
        });
      }

      // Log significant famine deaths (> 1K)
      const deathsMillions = famineDeaths; // Already in millions
      if (deathsMillions > 0.001) {
        console.log(`💀 Famine deaths this month: ${deathsMillions.toFixed(1)}M`);
        console.log(`   Active famines: ${state.famineSystem.activeFamines.length}`);
        console.log(`   Total famine deaths: ${state.famineSystem.totalDeaths.toFixed(0)}M`);
      }
    }

    return { events: [] };
  }
}


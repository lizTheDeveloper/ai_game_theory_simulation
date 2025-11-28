/**
 * Bayesian Mortality Resolution Phase
 *
 * Resolves all accumulated mortality risks for the month using Bayesian compounding.
 * Called at month end after all crisis phases have added risks.
 *
 * Process:
 * 1. Compound all mortality risks: P(death) = 1 - ∏(1 - p_i × v_i)
 * 2. Apply demographic vulnerabilities (Elite 0.2-0.6×, Informal 1.4-2.0×)
 * 3. Enforce research-backed mortality caps (monthly 2.8%, instant 50%)
 * 4. Update deathsByCategory and deathsByRootCause automatically
 * 5. Clear mortalityRisks array for next month
 *
 * ⚠️ CRITICAL: This phase is the AUTHORITATIVE source for population after mortality.
 * NO phase should modify humanPopulationSystem.population after this phase runs.
 * Phases that need population updates must run BEFORE this phase (order < 35.0).
 *
 * Research: /research/mortality_caps_historical_data_20251027.md (21 sources)
 * Date: October 27, 2025
 * Order: 35.0 (after all crisis phases 15-34, before outcomes 35.5+)
 *
 * Architecture Note (Oct 28, 2025):
 * CountryPopulationPhase was deleted because it ran AFTER this phase and overwrote
 * mortality-adjusted population values, causing silent data corruption. This phase
 * dependency system prevents that pattern from recurring.
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { resolveMortality } from '@/simulation/bayesianMortality';
import { aggregateGlobalPopulation } from '@/simulation/populationDynamics';
import {
  assertPhaseNotExecuted,
  assertFinite,
  assertPopulationChange,
  assertProbability
} from '@/simulation/utils/assertions';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { isHistoricalModeActive } from '@/simulation/utils/historicalMode';

export class BayesianMortalityResolutionPhase implements SimulationPhase {
  readonly id = 'bayesian_mortality_resolution';
  readonly name = 'Bayesian Mortality Resolution';
  readonly order = 35.0;

  // DEPENDENCIES (Nov 6, 2025): CRITICAL - All mortality risks must be accumulated BEFORE this phase
  readonly dependencies = [
    'human-survival-system',     // Order 19.7: Consolidates famine, food security, mortality stabilizers (Batch 4, Nov 2025)
    'climate_system',            // Order 34.0: Climate mortality risks accumulated (Batch 3: consolidated from climate_impact_cascade)
    'resource-soil',             // Order 30.0: Novel entities pollution mortality risks (CRITICAL-2 fix, Nov 14, 2025)
  ];

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    const events = [];
    setDeterministicRng(rng);

    // HIGH-7 FIX (Nov 27, 2025): Skip Bayesian mortality system in historical mode
    // Root cause: Crisis-calibrated mortality system (climate deaths, extreme weather,
    // nuclear, famine) applies during 1990-2024 baseline period, causing population
    // crashes instead of historical growth (+52.8% actual vs -76% simulated).
    // The regional population system (HumanPopulationPhase, order 20.52) applies
    // mortality DIRECTLY using historical CDR scaling. The Bayesian system would
    // double-count deaths by applying crisis mortality on top of historical rates.
    // Solution: Disable Bayesian mortality entirely for hindcast validation (1990-2024).
    // Historical CDR data already incorporates real-world mortality from all causes.
    // CRITICAL-1 FIX (Nov 28, 2025): Unified historical mode detection via isHistoricalModeActive()
    // historicalMode = empirical UN data (1990-2024), scenarioMode = crisis severity
    if (isHistoricalModeActive(state)) {
      // Clear any accumulated risks to prevent memory leaks
      if (state.humanPopulationSystem?.mortalityRisks) {
        state.humanPopulationSystem.mortalityRisks = [];
      }
      return { events: [] };
    }

    // PHASE DEPENDENCY SAFEGUARD (Oct 28, 2025)
    // This phase is the authoritative source for population after mortality.
    // Verify that no population-modifying phases ran after us in a previous bug.
    // (These phases don't exist currently, but this prevents future regressions)
    const prohibitedPhases = [
      'country_population_update',  // Deleted Oct 28, 2025 - was causing race condition
      'regional_population_reconciliation',  // Hypothetical future phase
      'population_correction'  // Another hypothetical
    ];

    for (const phaseId of prohibitedPhases) {
      assertPhaseNotExecuted(context, phaseId, {
        currentPhase: this.id,
        reason: 'Population modifications must happen BEFORE mortality resolution',
        month: state.currentMonth
      });
    }

    // Check if Bayesian mortality system is enabled
    if (!state.humanPopulationSystem?.mortalityRisks) {
      // System not initialized yet, skip
      return { events };
    }

    const numRisks = state.humanPopulationSystem.mortalityRisks.length;

    // DEBUG (Oct 28, 2025): Always log risk count each month to track accumulation
    if (state.currentMonth % 12 === 0) {  // Log once per year
      console.log(`[Month ${state.currentMonth}] Mortality risks this month: ${numRisks}, Population: ${state.humanPopulationSystem.population.toFixed(3)}B`);
    }

    // If no risks accumulated this month, nothing to resolve
    if (numRisks === 0) {
      return { events };
    }

    // Resolve all accumulated mortality risks
    const oldPopulation = state.humanPopulationSystem.population;
    const result = resolveMortality(state, rng);

    // CRITICAL FIX (Nov 21, 2025): Aggregate regional populations to global level
    // resolveMortality() updates regional populations with mortality applied,
    // but the global population must be recalculated from the regions.
    // This was missing, causing deaths to be applied to regions but not reflected globally!
    aggregateGlobalPopulation(state);

    // ASSERTIONS (Nov 7, 2025): Validate mortality calculation results
    const totalDeaths = assertFinite(result.totalDeaths, {
      location: 'BayesianMortalityResolutionPhase.execute',
      valueName: 'result.totalDeaths',
      month: state.currentMonth,
      additionalInfo: { numRisks }
    });

    const remainingPopulation = assertFinite(result.remainingPopulation, {
      location: 'BayesianMortalityResolutionPhase.execute',
      valueName: 'result.remainingPopulation',
      month: state.currentMonth,
      additionalInfo: { oldPopulation, totalDeaths }
    });

    // Validate population change is plausible (max -50% per month)
    const newPopulation = assertPopulationChange(
      state.humanPopulationSystem.population,
      oldPopulation,
      {
        location: 'BayesianMortalityResolutionPhase.execute',
        valueName: 'population after mortality',
        month: state.currentMonth
      }
    );

    // Validate average death probability is a valid probability
    assertProbability(result.summary.avgDeathProbability, {
      location: 'BayesianMortalityResolutionPhase.execute',
      valueName: 'summary.avgDeathProbability',
      month: state.currentMonth
    });

    // Log mortality results if significant deaths occurred
    const deathsMillions = totalDeaths; // Already in millions
    if (deathsMillions > 0.1) {
      console.log(`\n=== Bayesian Mortality Resolution (Month ${state.currentMonth}) ===`);
      console.log(`  Risks compounded: ${numRisks}`);
      console.log(`  Total deaths: ${deathsMillions.toFixed(2)}M`);
      console.log(`  Avg death probability: ${(result.summary.avgDeathProbability * 100).toFixed(2)}%`);

      // Show peak demographic impact
      const peak = result.summary.peakSegmentMortality;
      console.log(`  Peak segment: ${peak.segment} (${(peak.mortality * 100).toFixed(2)}% mortality)`);

      // Show cap warnings
      if (result.cappedByMonthlyLimit) {
        console.log(`  ⚠️ Monthly mortality capped at 2.8% (Holodomor limit)`);
      }
      if (result.cappedByInstantLimit) {
        console.log(`  ⚠️ Instant mortality capped at 50% (nuclear limit)`);
      }

      // Show demographic breakdown for very severe events (>10M deaths)
      if (deathsMillions > 10) {
        console.log(`\n  Demographic breakdown:`);
        for (const death of result.deaths) {
          const segmentDeathsM = death.count; // Already in millions
          if (segmentDeathsM > 0.01) {
            console.log(`    ${death.demographic}: ${segmentDeathsM.toFixed(2)}M (${(death.probability * 100).toFixed(2)}% risk)`);
          }
        }
      }

      // Show multi-causal attribution for catastrophic events (>100M deaths)
      if (deathsMillions > 100) {
        console.log(`\n  Multi-causal attribution (first segment):`);
        const firstSegment = result.deaths[0];
        if (firstSegment) {
          for (const cause of firstSegment.causes) {
            if (cause.contributionFraction > 0.05) { // Show >5% contributions
              console.log(`    ${cause.proximate} (${cause.root}): ${(cause.contributionFraction * 100).toFixed(1)}% contribution`);
            }
          }
        }
      }
    }

    // STORE AUTHORITATIVE POPULATION VALUE (Oct 28, 2025)
    // Store the mortality-adjusted population in context so later phases can validate
    // they aren't accidentally overwriting it
    const mortalityAdjustedPopulation = state.humanPopulationSystem.population;
    context.data.set('mortality_adjusted_population', mortalityAdjustedPopulation);

    // Mark that mortality has been resolved this month
    context.data.set('bayesian_mortality_resolved', true);

    return { events };
  }
}

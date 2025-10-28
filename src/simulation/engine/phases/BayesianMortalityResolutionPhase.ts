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
 * Research: /research/mortality_caps_historical_data_20251027.md (21 sources)
 * Date: October 27, 2025
 * Order: 35.0 (after all crisis phases 15-34, before outcomes 35.5+)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { resolveMortality } from '@/simulation/bayesianMortality';

export class BayesianMortalityResolutionPhase implements SimulationPhase {
  readonly id = 'bayesian_mortality_resolution';
  readonly name = 'Bayesian Mortality Resolution';
  readonly order = 35.0;

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    const events = [];

    // Check if Bayesian mortality system is enabled
    if (!state.humanPopulationSystem?.mortalityRisks) {
      // System not initialized yet, skip
      return { events };
    }

    const numRisks = state.humanPopulationSystem.mortalityRisks.length;

    // If no risks accumulated this month, nothing to resolve
    if (numRisks === 0) {
      return { events };
    }

    // Resolve all accumulated mortality risks
    const result = resolveMortality(state, rng);

    // Log mortality results if significant deaths occurred
    const deathsMillions = result.totalDeaths; // Already in millions
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

    return { events };
  }
}

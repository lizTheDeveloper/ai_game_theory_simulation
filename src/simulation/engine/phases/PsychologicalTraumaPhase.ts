/**
 * Psychological Trauma Phase (Phase 1B Refinement - Oct 17, 2025)
 *
 * Models long-term psychological impact of mass death events on survivors
 * - Tracks cumulative trauma burden from mass casualty events
 * - Applies QoL penalties to survivors (psychological and social dimensions)
 * - Models recovery over time (months to years)
 * - Intergenerational effects (future feature)
 *
 * Research:
 * - Wilkinson & Pickett (2009): Extreme disruption (>20% mortality) causes decades of trauma
 * - PTSD literature: 40-60% PTSD rates in survivors of mass casualty events
 * - Diamond (2005): >50% mortality leads to institutional breakdown lasting generations
 *
 * Order: 23.5 (after population dynamics 23.0, before QoL calculations 34.0)
 */

import { GameState, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import {
  assertFinite,
  assertProbability,
  assertDefined,
  assertMortalityRate
} from '../../utils/assertions';
import { isTechDeployed } from '../../techTree/helpers';

export class PsychologicalTraumaPhase implements SimulationPhase {
  readonly id = 'psychological_trauma';
  readonly name = 'Psychological Trauma';
  readonly order = 23.5;
  readonly dependencies = ['crisis-points'];

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    if (!state.psychologicalTrauma) {
    setDeterministicRng(rng);
      // Initialize if missing (defensive programming)
      state.psychologicalTrauma = {
        traumaLevel: 0.0,
        monthsSinceLastMassEvent: 999,
        generationalTrauma: 0.0,
        mentalHealthInfrastructure: 0.5,
        massDeathEvents: 0,
        lastEventSeverity: 0.0,
      };
    }

    const trauma = state.psychologicalTrauma;
    const population = assertFinite(state.humanPopulationSystem.population, {
      location: 'PsychologicalTraumaPhase.execute',
      valueName: 'population',
      month: state.currentMonth
    });
    const initialPopulation = 8000; // 8B baseline (in millions)

    // Calculate monthly mortality rate
    const monthlyDeaths = assertDefined(
      state.humanPopulationSystem.monthlyExcessDeaths,
      {
        location: 'PsychologicalTraumaPhase.execute',
        valueName: 'monthlyExcessDeaths',
        month: state.currentMonth,
        expectedSource: 'initialization.ts or prior mortality phase'
      }
    );

    const monthlyMortalityRate = assertMortalityRate(
      monthlyDeaths / population,
      {
        location: 'PsychologicalTraumaPhase.execute',
        valueName: 'monthlyMortalityRate',
        month: state.currentMonth,
        population
      }
    );

    // Check for mass death events
    if (monthlyMortalityRate > 0.10) {  // >10% monthly mortality = traumatic event
      // Trauma accumulation based on severity
      let traumaIncrease = 0;

      if (monthlyMortalityRate > 0.50) {
        traumaIncrease = 0.60;  // Catastrophic (>50% mortality)
        console.log(`\n💔 CATASTROPHIC TRAUMA EVENT: ${(monthlyMortalityRate * 100).toFixed(1)}% monthly mortality`);
      } else if (monthlyMortalityRate > 0.30) {
        traumaIncrease = 0.35;  // Severe (30-50% mortality)
        console.log(`\n💔 SEVERE TRAUMA EVENT: ${(monthlyMortalityRate * 100).toFixed(1)}% monthly mortality`);
      } else {
        traumaIncrease = 0.15;  // Major (10-30% mortality)
        console.log(`\n💔 MAJOR TRAUMA EVENT: ${(monthlyMortalityRate * 100).toFixed(1)}% monthly mortality`);
      }

      // Apply trauma increase (with diminishing returns)
      const currentTrauma = assertProbability(trauma.traumaLevel, {
        location: 'PsychologicalTraumaPhase.execute',
        valueName: 'currentTrauma',
        month: state.currentMonth
      });
      const maxTrauma = 0.95; // Can't reach 1.0 (some resilience always exists)
      const remainingCapacity = assertFinite(maxTrauma - currentTrauma, {
        location: 'PsychologicalTraumaPhase.execute',
        valueName: 'remainingCapacity',
        month: state.currentMonth,
        additionalInfo: { currentTrauma, maxTrauma }
      });
      trauma.traumaLevel = assertProbability(
        Math.min(maxTrauma, currentTrauma + (traumaIncrease * remainingCapacity)),
        {
          location: 'PsychologicalTraumaPhase.execute',
          valueName: 'newTraumaLevel',
          month: state.currentMonth,
          additionalInfo: { currentTrauma, traumaIncrease, remainingCapacity }
        }
      );

      // Reset recovery timer
      trauma.monthsSinceLastMassEvent = 0;
      trauma.massDeathEvents += 1;
      trauma.lastEventSeverity = monthlyMortalityRate;

      console.log(`   Trauma level: ${(currentTrauma * 100).toFixed(1)}% → ${(trauma.traumaLevel * 100).toFixed(1)}%`);
      console.log(`   Total mass death events: ${trauma.massDeathEvents}`);

    } else {
      // Recovery over time (if no new traumatic events)
      trauma.monthsSinceLastMassEvent += 1;

      // Base recovery rate: -0.02 per month (50 months to halve trauma)
      // Research: PTSD recovery typically 12-24 months with treatment, longer without
      let recoveryRate = 0.02;

      // Mental health tech increases recovery rate
      const psychWellbeingDeployment = isTechDeployed(state, 'psychologicalWellbeing');
      if (psychWellbeingDeployment > 0.5) {
        recoveryRate *= 1.5;  // 50% faster recovery with tech
      }

      // Social cohesion helps recovery (average of components, 0-1 scale)
      // socialAccumulation.socialCohesion is REQUIRED field
      const cohesion = assertDefined(state.socialAccumulation.socialCohesion, {
        location: 'PsychologicalTraumaPhase.execute',
        valueName: 'state.socialAccumulation.socialCohesion',
        month: state.currentMonth,
        expectedSource: 'socialAccumulation initialization'
      });
      const avgCohesion = assertProbability(
        (cohesion.trust + cohesion.communityBonds + cohesion.civilLiberties) / 300,
        {
          location: 'PsychologicalTraumaPhase.execute',
          valueName: 'avgCohesion',
          month: state.currentMonth,
          additionalInfo: { trust: cohesion.trust, communityBonds: cohesion.communityBonds, civilLiberties: cohesion.civilLiberties }
        }
      );
      if (avgCohesion > 0.6) {
        recoveryRate *= 1.25;  // 25% faster recovery in cohesive societies
      }

      // Apply recovery
      const finalRecoveryRate = assertFinite(recoveryRate, {
        location: 'PsychologicalTraumaPhase.execute',
        valueName: 'recoveryRate',
        month: state.currentMonth,
        additionalInfo: { psychWellbeingDeployment, avgCohesion }
      });
      trauma.traumaLevel = assertProbability(
        Math.max(0, trauma.traumaLevel - finalRecoveryRate),
        {
          location: 'PsychologicalTraumaPhase.execute',
          valueName: 'traumaLevelAfterRecovery',
          month: state.currentMonth,
          additionalInfo: { previousTraumaLevel: trauma.traumaLevel, recoveryRate: finalRecoveryRate }
        }
      );

      // Log significant recovery milestones
      if (trauma.traumaLevel > 0 && trauma.monthsSinceLastMassEvent % 24 === 0) {
        console.log(`\n💚 Trauma recovery progress: ${(trauma.traumaLevel * 100).toFixed(1)}% (${trauma.monthsSinceLastMassEvent} months since last event)`);
      }
    }

    return { events: [] };
  }
}

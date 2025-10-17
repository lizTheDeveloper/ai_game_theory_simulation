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

import { SimulationPhase, PhaseResult, RNGFunction, PhaseContext } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';

export class PsychologicalTraumaPhase implements SimulationPhase {
  readonly id = 'psychological_trauma';
  readonly name = 'Psychological Trauma';
  readonly order = 23.5;

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    if (!state.psychologicalTrauma) {
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
    const population = state.humanPopulationSystem.population;
    const initialPopulation = 8000; // 8B baseline (in millions)

    // Calculate monthly mortality rate
    const monthlyDeaths = state.humanPopulationSystem.monthlyExcessDeaths || 0;
    const monthlyMortalityRate = monthlyDeaths / population;

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
      const currentTrauma = trauma.traumaLevel;
      const maxTrauma = 0.95; // Can't reach 1.0 (some resilience always exists)
      const remainingCapacity = maxTrauma - currentTrauma;
      trauma.traumaLevel = Math.min(maxTrauma, currentTrauma + (traumaIncrease * remainingCapacity));

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

      // Mental health tech (TIER 3) increases recovery rate
      if (state.breakthroughTech?.psychologicalWellbeing?.deployed) {
        recoveryRate *= 1.5;  // 50% faster recovery with tech
      }

      // Social cohesion helps recovery
      const socialCohesion = state.socialAccumulation?.socialCohesion || 0.5;
      if (socialCohesion > 0.6) {
        recoveryRate *= 1.25;  // 25% faster recovery in cohesive societies
      }

      // Apply recovery
      trauma.traumaLevel = Math.max(0, trauma.traumaLevel - recoveryRate);

      // Log significant recovery milestones
      if (trauma.traumaLevel > 0 && trauma.monthsSinceLastMassEvent % 24 === 0) {
        console.log(`\n💚 Trauma recovery progress: ${(trauma.traumaLevel * 100).toFixed(1)}% (${trauma.monthsSinceLastMassEvent} months since last event)`);
      }
    }

    return { events: [] };
  }
}

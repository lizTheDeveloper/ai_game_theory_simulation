/**
 * TIER 2: Community Cohesion Programs Phase
 *
 * Invests in community programs to rebuild social capital and reduce meaning crisis.
 *
 * Execution Order: TBD (after social cohesion calculations, before meaning crisis)
 *
 * Evidence Quality: 🟡 MODERATE
 * Research: Putnam (2000) "Bowling Alone" + AmeriCorps evaluations (15-30% effects over 3 years)
 * Config: /src/simulation/thresholds/tier2InterventionConfig.ts
 *
 * Key Mechanics:
 * - Community cohesion effect: 0.4-0.8% per month (triangular)
 * - Meaning crisis reduction: 0.15-0.35% per month (triangular)
 * - Deployment: 36-84 months (long-term cultural change)
 *
 * Implementation Date: October 27, 2025
 */

import type {
  GameState,
  GameEvent,
  SimulationPhase,
  PhaseResult,
  PhaseContext,
  RNGFunction
} from '@/types/game';

export class Tier2CommunityCohesionPhase implements SimulationPhase {
  id = 'tier2_community_cohesion';
  name = 'TIER 2: Community Cohesion Programs';
  order = 13.5; // After social cohesion, before meaning crisis

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    const events: GameEvent[] = [];

    if (!state.tier2Interventions || !state.tier2InterventionParameters) {
      return { events };
    }

    const cohesionState = state.tier2Interventions.communityCohesion;
    const params = state.tier2InterventionParameters.communityCohesion;

    // === UNLOCK CONDITIONS ===
    if (!cohesionState.unlocked) {
      // Unlock when social cohesion declining OR unemployment rising OR meaning crisis rising
      // (Architecture Review M4 - Oct 27, 2025): Now includes unemployment from GlobalMetrics
      const unemployment = state.globalMetrics.unemployment || 0;
      const socialCohesion = state.socialAccumulation.socialCohesion?.trust || 0.70;
      const meaningCrisis = state.socialAccumulation.meaningCrisisLevel;

      const shouldUnlock =
        (socialCohesion < 0.50) ||
        (unemployment > 0.25) ||
        (meaningCrisis > 0.40);

      if (shouldUnlock) {
        cohesionState.unlocked = true;
        events.push({
          id: `tier2_cohesion_unlock_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'policy',
          severity: 'medium',
          title: 'Community Cohesion Programs Launched',
          description: `National investment in community programs, civic infrastructure, and associational memberships. ` +
            `Expected cohesion increase: ${params.cohesionEffect.toFixed(2)}%/month. ` +
            `Meaning crisis reduction: ${params.meaningCrisisReduction.toFixed(2)}%/month. ` +
            `Deployment: ${params.deploymentMonths.toFixed(0)} months.`,
          effects: {
            cohesionEffect: params.cohesionEffect,
            meaningCrisisReduction: params.meaningCrisisReduction
          },
  agent: "system",
        });
      }
    }

    // === DEPLOYMENT PROGRESS ===
    if (cohesionState.unlocked && !cohesionState.active) {
      const progressIncrement = 1 / params.deploymentMonths;
      cohesionState.deploymentProgress = Math.min(1, cohesionState.deploymentProgress + progressIncrement);

      // Participation rate scales with deployment
      cohesionState.participationRate = cohesionState.deploymentProgress * 0.25; // Max 25% participation

      // Count active programs (simplified)
      cohesionState.programsActive = Math.floor(cohesionState.deploymentProgress * 1000);

      // Activate when 70% deployed
      if (cohesionState.deploymentProgress >= 0.70 && !cohesionState.active) {
        cohesionState.active = true;

        events.push({
          id: `tier2_cohesion_active_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'milestone',
          severity: 'medium',
          title: 'Community Cohesion Programs Widely Adopted',
          description: `${cohesionState.programsActive} community programs active nationwide. ` +
            `Participation: ${(cohesionState.participationRate * 100).toFixed(0)}%. ` +
            `Community cohesion rebuilding underway.`,
          effects: {
            programsActive: cohesionState.programsActive,
            participationRate: cohesionState.participationRate
          },
  agent: "system",
        });
      }
    }

    // === EFFECTS APPLICATION ===
    if (cohesionState.active) {
      // Update effects tracking (scaled by participation)
      const effectiveScale = cohesionState.participationRate / 0.25; // Normalize to [0,1]
      cohesionState.cohesionIncrease = params.cohesionEffect * effectiveScale;
      cohesionState.meaningCrisisReduction = params.meaningCrisisReduction * effectiveScale;

      // Apply monthly cohesion increase (trust component)
      const cohesionBoost = cohesionState.cohesionIncrease * 0.01; // Convert % to fraction
      if (state.socialAccumulation.socialCohesion?.trust !== undefined) {
        state.socialAccumulation.socialCohesion.trust = Math.min(
          1.0,
          state.socialAccumulation.socialCohesion.trust + cohesionBoost
        );
      }

      // Reduce meaning crisis
      const meaningReduction = cohesionState.meaningCrisisReduction * 0.01;
      state.socialAccumulation.meaningCrisisLevel = Math.max(
        0,
        state.socialAccumulation.meaningCrisisLevel - meaningReduction
      );

      // Log annual updates
      if (state.currentMonth % 12 === 0) {
        events.push({
          id: `tier2_cohesion_update_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'info',
          severity: 'low',
          title: 'Community Cohesion Annual Report',
          description: `Programs active: ${cohesionState.programsActive}. ` +
            `Participation: ${(cohesionState.participationRate * 100).toFixed(0)}%. ` +
            `Cohesion increase: +${cohesionState.cohesionIncrease.toFixed(2)}%/month. ` +
            `Meaning crisis reduction: -${cohesionState.meaningCrisisReduction.toFixed(2)}%/month.`,
          effects: {
            programsActive: cohesionState.programsActive,
            participationRate: cohesionState.participationRate,
            cohesionIncrease: cohesionState.cohesionIncrease,
            meaningCrisisReduction: cohesionState.meaningCrisisReduction
          },
  agent: "system",
        });
      }
    }

    return { events };
  }
}

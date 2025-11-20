/**
 * TIER 2: Social Systems Phase (CONSOLIDATED)
 *
 * Consolidates human well-being interventions:
 * 1. Human-AI Centaur Systems (order 12.6) - Augmentation over automation
 * 2. Community Cohesion Programs (order 13.5) - Rebuilding social capital
 *
 * CRITICAL: Executes interventions in original order to preserve RNG determinism.
 *
 * Evidence Quality: 🟡 MODERATE (both interventions)
 * Config: /src/simulation/thresholds/tier2InterventionConfig.ts
 *
 * Phase Consolidation: Part of Batch 1 (9 → 3 phases)
 * Created: November 9, 2025
 */

import type {
  GameState,
  GameEvent,
  SimulationPhase,
  PhaseResult,
  PhaseContext,
  RNGFunction
} from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertProbability, assertFinite, assertDefined } from '@/simulation/utils/assertions';

export class Tier2SocialSystemsPhase implements SimulationPhase {
  id = 'tier2_social_systems';
  name = 'TIER 2: Social Systems';
  order = 12.61; // Earliest intervention (Centaur Systems)

  // DEPENDENCIES (Nov 15, 2025): Requires tech tree for social intervention unlocks
  readonly dependencies = [
    'tech-tree',              // Order 12.5: Tech unlocks determine intervention availability
  ] as const;

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    const events: GameEvent[] = [];
    setDeterministicRng(rng);

    if (!state.tier2Interventions || !state.tier2InterventionParameters) {
      return { events };
    }

    // ============================================================
    // 1. HUMAN-AI CENTAUR SYSTEMS (order 12.6)
    // ============================================================
    this.executeCentaurSystems(state, rng, events);

    // ============================================================
    // 2. COMMUNITY COHESION PROGRAMS (order 13.5)
    // ============================================================
    this.executeCommunityCohesion(state, rng, events);

    return { events };
  }

  /**
   * Human-AI Centaur Systems
   * Original order: 12.61
   */
  private executeCentaurSystems(state: GameState, rng: RNGFunction, events: GameEvent[]): void {
    if (!state.tier2Interventions || !state.tier2InterventionParameters) return;

    const centaurState = state.tier2Interventions.centaurSystems;
    const params = state.tier2InterventionParameters.centaurSystems;

    // === UNLOCK CONDITIONS ===
    if (!centaurState.unlocked) {
      // LEGITIMATE FALLBACK: unemployment is optional (set by UnemploymentPhase order 30.0, this phase runs at 12.61)
      // Initialized to 0.05 in initialization.ts, updated by UnemploymentPhase after first run
      const unemployment = state.globalMetrics.unemployment ?? 0.05;
      const meaningCrisis = state.socialAccumulation.meaningCrisisLevel;
      // FIX (Nov 12, 2025): alignmentResearchInvestment is [0,10+], not [0,100]
      // Convert to [0,1] probability range for assertion validation
      const governmentInvestment = Math.min(1.0, state.government.alignmentResearchInvestment / 10);

      // Validate metrics
      assertProbability(unemployment, {
        location: 'Tier2SocialSystemsPhase.executeCentaurSystems',
        valueName: 'unemployment',
        month: state.currentMonth
      });

      assertFinite(meaningCrisis, {
        location: 'Tier2SocialSystemsPhase.executeCentaurSystems',
        valueName: 'meaningCrisisLevel',
        month: state.currentMonth
      });

      assertProbability(governmentInvestment, {
        location: 'Tier2SocialSystemsPhase.executeCentaurSystems',
        valueName: 'governmentInvestment',
        month: state.currentMonth
      });

      const shouldUnlock = (unemployment > 0.20 || meaningCrisis > 0.30) && governmentInvestment > 0.25;

      if (shouldUnlock) {
        centaurState.unlocked = true;
        events.push({
          id: `tier2_centaur_unlock_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'policy',
          severity: 'medium',
          title: 'Human-AI Centaur Systems Initiative Launched',
          description: `Shift from automation (displaces labor) to augmentation (enhances human capabilities). ` +
            `Expected autonomy preservation: ${(params.autonomyEffect * 100).toFixed(0)}%. ` +
            `Meaning crisis reduction: ${(params.meaningCrisisReduction * 100).toFixed(0)}%. ` +
            `Deployment: ${params.deploymentMonths.toFixed(0)} months (cultural change required).`,
          effects: {
            autonomyEffect: params.autonomyEffect,
            meaningCrisisReduction: params.meaningCrisisReduction
          },
          agent: "system",
        });
      }
    }

    // === DEPLOYMENT PROGRESS ===
    if (centaurState.unlocked && !centaurState.active) {
      const progressIncrement = 1 / params.deploymentMonths;
      centaurState.deploymentProgress = Math.min(1, centaurState.deploymentProgress + progressIncrement);

      centaurState.workforceCoverage = centaurState.deploymentProgress;

      if (centaurState.deploymentProgress >= 0.80 && !centaurState.active) {
        centaurState.active = true;

        centaurState.sectorsAdopted = [
          'healthcare',
          'education',
          'professional_services',
          'manufacturing',
          'creative_industries'
        ];

        events.push({
          id: `tier2_centaur_active_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'milestone',
          severity: 'high',
          title: 'Centaur Systems Widely Adopted',
          description: `Human-AI centaur systems now dominant work paradigm across 5 major sectors. ` +
            `Workforce coverage: ${(centaurState.workforceCoverage * 100).toFixed(0)}%. ` +
            `Autonomy-preserving augmentation replacing automation.`,
          effects: {
            workforceCoverage: centaurState.workforceCoverage,
            sectorsAdopted: centaurState.sectorsAdopted.length
          },
          agent: "system",
        });
      }
    }

    // === EFFECTS APPLICATION ===
    if (centaurState.active) {
      centaurState.autonomyPreserved = params.autonomyEffect * centaurState.workforceCoverage;
      centaurState.meaningCrisisReduction = params.meaningCrisisReduction * centaurState.workforceCoverage;

      const meaningReduction = centaurState.meaningCrisisReduction * 0.01;
      state.socialAccumulation.meaningCrisisLevel = Math.max(
        0,
        state.socialAccumulation.meaningCrisisLevel - meaningReduction
      );

      if (state.currentMonth % 3 === 0 && centaurState.workforceCoverage > 0.5) {
        events.push({
          id: `tier2_centaur_update_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'info',
          severity: 'low',
          title: 'Centaur Systems Impact Update',
          description: `Workforce coverage: ${(centaurState.workforceCoverage * 100).toFixed(0)}%. ` +
            `Autonomy preserved: ${(centaurState.autonomyPreserved * 100).toFixed(0)}%. ` +
            `Meaning crisis reduction: ${(meaningReduction * 100).toFixed(2)}%/month.`,
          effects: {
            workforceCoverage: centaurState.workforceCoverage,
            autonomyPreserved: centaurState.autonomyPreserved,
            meaningCrisisReduction: meaningReduction
          },
          agent: "system",
        });
      }
    }
  }

  /**
   * Community Cohesion Programs
   * Original order: 13.5
   */
  private executeCommunityCohesion(state: GameState, rng: RNGFunction, events: GameEvent[]): void {
    if (!state.tier2Interventions || !state.tier2InterventionParameters) return;

    const cohesionState = state.tier2Interventions.communityCohesion;
    const params = state.tier2InterventionParameters.communityCohesion;

    // === UNLOCK CONDITIONS ===
    if (!cohesionState.unlocked) {
      // LEGITIMATE FALLBACK: unemployment is optional (set by UnemploymentPhase order 30.0, this phase runs at 12.61)
      // Initialized to 0.05 in initialization.ts, updated by UnemploymentPhase after first run
      const unemployment = state.globalMetrics.unemployment ?? 0.05;
      // socialAccumulation.socialCohesion.trust is REQUIRED field
      const socialCohesionState = assertDefined(state.socialAccumulation.socialCohesion, {
        location: 'Tier2SocialSystemsPhase.executeCommunityCohesion',
        valueName: 'state.socialAccumulation.socialCohesion',
        month: state.currentMonth,
        expectedSource: 'socialAccumulation initialization'
      });
      const socialCohesion = assertDefined(socialCohesionState.trust, {
        location: 'Tier2SocialSystemsPhase.executeCommunityCohesion',
        valueName: 'socialCohesionState.trust',
        month: state.currentMonth,
        expectedSource: 'SocialCohesionState initialization'
      });
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

      cohesionState.participationRate = cohesionState.deploymentProgress * 0.25;
      cohesionState.programsActive = Math.floor(cohesionState.deploymentProgress * 1000);

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
      const effectiveScale = cohesionState.participationRate / 0.25;
      cohesionState.cohesionIncrease = params.cohesionEffect * effectiveScale;
      cohesionState.meaningCrisisReduction = params.meaningCrisisReduction * effectiveScale;

      const cohesionBoost = cohesionState.cohesionIncrease * 0.01;
      if (state.socialAccumulation.socialCohesion?.trust !== undefined) {
        state.socialAccumulation.socialCohesion.trust = Math.min(
          1.0,
          state.socialAccumulation.socialCohesion.trust + cohesionBoost
        );
      }

      const meaningReduction = cohesionState.meaningCrisisReduction * 0.01;
      state.socialAccumulation.meaningCrisisLevel = Math.max(
        0,
        state.socialAccumulation.meaningCrisisLevel - meaningReduction
      );

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
  }
}

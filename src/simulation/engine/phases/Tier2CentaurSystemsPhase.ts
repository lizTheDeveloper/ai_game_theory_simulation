/**
 * TIER 2: Human-AI Centaur Systems Phase
 *
 * Deploys augmentation-focused AI systems that preserve human autonomy (vs automation that displaces).
 *
 * Execution Order: TBD (after employment calculations, before meaning crisis)
 *
 * Evidence Quality: 🟡 MODERATE
 * Research: Acemoglu & Restrepo (2022) framework validated, NO empirical effect sizes
 * Config: /src/simulation/thresholds/tier2InterventionConfig.ts
 *
 * Key Mechanics:
 * - Autonomy effect: 15-45% (wide uniform - genuine uncertainty)
 * - Meaning crisis reduction: 10-30% (indirect via autonomy preservation)
 * - Deployment: 48-72 months (cultural/institutional change required)
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

export class Tier2CentaurSystemsPhase implements SimulationPhase {
  id = 'tier2_centaur_systems';
  name = 'TIER 2: Human-AI Centaur Systems';
  order = 12.5; // After employment, before meaning crisis

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    const events: GameEvent[] = [];

    if (!state.tier2Interventions || !state.tier2InterventionParameters) {
      return { events };
    }

    const centaurState = state.tier2Interventions.centaurSystems;
    const params = state.tier2InterventionParameters.centaurSystems;

    // === UNLOCK CONDITIONS ===
    if (!centaurState.unlocked) {
      // Unlock when unemployment rising + government/society responding
      // (Architecture Review M4 - Oct 27, 2025): Now uses unemployment from GlobalMetrics
      const unemployment = state.globalMetrics.unemployment || 0;
      const meaningCrisis = state.socialAccumulation.meaningCrisisLevel;
      const governmentInvestment = state.government.alignmentResearchInvestment;

      // Unlock if unemployment >20% OR meaning crisis >30% + government investing
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

      // Update workforce coverage as deployment progresses
      centaurState.workforceCoverage = centaurState.deploymentProgress;

      // Activate when 80% deployed
      if (centaurState.deploymentProgress >= 0.80 && !centaurState.active) {
        centaurState.active = true;

        // Track sectors adopted (simplified: assume broad coverage at activation)
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
      // Update effects tracking
      centaurState.autonomyPreserved = params.autonomyEffect * centaurState.workforceCoverage;
      centaurState.meaningCrisisReduction = params.meaningCrisisReduction * centaurState.workforceCoverage;

      // Note: No unemployment metric in GameState - using meaning crisis as proxy
      // Unemployment effect already captured in meaning crisis reduction

      // Reduce meaning crisis (indirect via autonomy preservation)
      const meaningReduction = centaurState.meaningCrisisReduction * 0.01; // Convert % to fraction
      state.socialAccumulation.meaningCrisisLevel = Math.max(
        0,
        state.socialAccumulation.meaningCrisisLevel - meaningReduction
      );

      // Log quarterly updates
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

    return { events };
  }
}

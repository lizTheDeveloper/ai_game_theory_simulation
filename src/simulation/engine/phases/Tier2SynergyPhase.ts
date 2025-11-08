/**
 * TIER 2: Intervention Synergy Phase
 *
 * Applies compound effectiveness bonuses when interventions are deployed in combination.
 *
 * Execution Order: 21.0 (after all TIER 2 phases complete)
 *
 * Rationale: Real-world interventions compound - interpretability + crisis anticipation,
 * community cohesion + centaur systems, nuclear security + dark compute all synergize.
 *
 * Synergy Rules (from Architecture Review M3):
 * - Interpretability + Crisis Anticipation: +15% effectiveness each (better prediction with model understanding)
 * - Community Cohesion + Centaur Systems: +12% effectiveness each (strong communities adopt augmentation faster)
 * - Nuclear Security + Dark Compute: +10% effectiveness each (secure command + compute monitoring compound)
 * - Synthetic Ecosystems + Coastal Protection: +8% effectiveness each (ecosystem services support coastal health)
 *
 * Implementation Date: October 27, 2025
 * Architecture Review (Oct 27): M3 enhancement - compounding intervention effects
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
import { assertFinite, assertProbability } from '@/simulation/utils/assertions';

export class Tier2SynergyPhase implements SimulationPhase {
  id = 'tier2_synergy';
  name = 'TIER 2: Intervention Synergy';
  order = 21.0; // After all TIER 2 phases
  dependencies = ['tech-tree'];

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    const events: GameEvent[] = [];
    setDeterministicRng(rng);

    if (!state.tier2Interventions) {
      return { events };
    }

    const interventions = state.tier2Interventions;

    // Track which synergies are active this month
    const activeSynergies: string[] = [];

    // === SYNERGY 1: Interpretability + Crisis Anticipation ===
    // Better crisis prediction when you understand model internals
    if (interventions.interpretability.active && interventions.crisisAnticipation.active) {
      const interpretabilityBonus = 1.15;
      const crisisAnticipationBonus = 1.15;

      // Boost interpretability control loss reduction
      interventions.interpretability.controlLossReduction *= interpretabilityBonus;

      // Validate control loss reduction is finite
      assertFinite(interventions.interpretability.controlLossReduction, {
        location: 'Tier2SynergyPhase.execute',
        valueName: 'interpretability.controlLossReduction',
        month: state.currentMonth,
        additionalInfo: { synergy: 'Interpretability + Crisis Anticipation' }
      });

      // Boost crisis anticipation effectiveness (tracked in state for next month)
      // Note: We can't directly modify effectiveness since it's in parameters, but we can
      // modify the state tracking which affects reported values
      if (interventions.crisisAnticipation.pandemicsDetected > 0 ||
          interventions.crisisAnticipation.climateEventsAnticipated > 0 ||
          interventions.crisisAnticipation.supplyChainDisruptionsPrevented > 0) {
        // Apply synergy bonus to deaths prevented (retroactive for this month)
        const synergyBonus = crisisAnticipationBonus - 1.0;  // 0.15
        interventions.crisisAnticipation.crisisDeathsPrevented *= (1 + synergyBonus);

        // Validate deaths prevented is finite
        assertFinite(interventions.crisisAnticipation.crisisDeathsPrevented, {
          location: 'Tier2SynergyPhase.execute',
          valueName: 'crisisAnticipation.crisisDeathsPrevented',
          month: state.currentMonth,
          additionalInfo: { synergy: 'Interpretability + Crisis Anticipation' }
        });
      }

      activeSynergies.push('Interpretability + Crisis Anticipation (+15% each)');
    }

    // === SYNERGY 2: Community Cohesion + Centaur Systems ===
    // Strong communities adopt augmentation faster
    if (interventions.communityCohesion.active && interventions.centaurSystems.active) {
      const cohesionBonus = 1.12;
      const centaurBonus = 1.12;

      // Boost community cohesion effectiveness
      const currentCohesion = interventions.communityCohesion.cohesionIncrease;
      interventions.communityCohesion.cohesionIncrease = currentCohesion * cohesionBonus;

      // Boost centaur systems autonomy preservation
      const currentAutonomy = interventions.centaurSystems.autonomyPreserved;
      interventions.centaurSystems.autonomyPreserved = currentAutonomy * centaurBonus;

      activeSynergies.push('Community Cohesion + Centaur Systems (+12% each)');
    }

    // === SYNERGY 3: Nuclear Security + Dark Compute ===
    // Secure command systems benefit from compute monitoring
    if (interventions.nuclearSecurity.active && interventions.darkCompute.active) {
      const nuclearBonus = 1.10;
      const darkComputeBonus = 1.10;

      // Boost nuclear security (reduce vulnerability to AI manipulation)
      // Track via effectiveSecurityRate - actual security effectiveness already applied
      const currentSecurityRate = interventions.nuclearSecurity.effectiveSecurityRate || 0;
      interventions.nuclearSecurity.effectiveSecurityRate = Math.min(1.0, currentSecurityRate * nuclearBonus);

      // Validate effective security rate is in valid range [0, 1]
      assertProbability(interventions.nuclearSecurity.effectiveSecurityRate, {
        location: 'Tier2SynergyPhase.execute',
        valueName: 'nuclearSecurity.effectiveSecurityRate',
        month: state.currentMonth,
        additionalInfo: { synergy: 'Nuclear Security + Dark Compute' }
      });

      // Boost dark compute detection rate for next month
      // Note: Detection happens in DarkComputePhase, synergy improves baseline
      const currentDetections = interventions.darkCompute.largeRunsDetected;
      if (currentDetections > 0) {
        // Apply bonus to detection effectiveness (logged)
        interventions.darkCompute.detectionRate *= darkComputeBonus;
      }

      activeSynergies.push('Nuclear Security + Dark Compute (+10% each)');
    }

    // === SYNERGY 4: Synthetic Ecosystems + Coastal Protection ===
    // Ecosystem services support coastal health
    if (interventions.syntheticEcosystems.active && interventions.coastalProtection.active) {
      const ecosystemsBonus = 1.08;
      const coastalBonus = 1.08;

      // Boost synthetic ecosystems crisis mitigation
      const currentMitigation = interventions.syntheticEcosystems.crisisMitigationFraction;
      interventions.syntheticEcosystems.crisisMitigationFraction = currentMitigation * ecosystemsBonus;

      // Boost coastal protection effectiveness
      const currentProtection = interventions.coastalProtection.oceanCrisisMitigation;
      interventions.coastalProtection.oceanCrisisMitigation = currentProtection * coastalBonus;

      activeSynergies.push('Synthetic Ecosystems + Coastal Protection (+8% each)');
    }

    // === LOG SYNERGIES (Quarterly) ===
    if (activeSynergies.length > 0 && state.currentMonth % 3 === 0) {
      events.push({
        id: `tier2_synergy_${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'info',
        severity: 'medium',
        title: 'TIER 2 Intervention Synergies Active',
        description: `${activeSynergies.length} intervention synergies compounding effectiveness:\n` +
          activeSynergies.map(s => `  • ${s}`).join('\n') +
          `\n\nResearch: Combined interventions amplify impact beyond individual contributions.`,
        effects: {
          synergyCount: activeSynergies.length
        },
        agent: "system",
      });
    }

    return { events };
  }
}

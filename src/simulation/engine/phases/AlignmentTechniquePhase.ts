/**
 * Alignment Technique Phase (P3.3)
 *
 * Updates effective alignment from specific techniques (RLHF, Constitutional AI, etc.)
 * Accounts for capability scaling degradation.
 *
 * Execution Order: 3.6 (After alignment dynamics, before metrics)
 *
 * Research Foundation:
 * - /research/alignment_technique_properties_20251026.md
 * - /reviews/alignment_technique_properties_critique_20251026.md
 * - RLHF degrades with capability (robustness 0.45, scalability 0.50)
 * - Constitutional AI more robust (robustness 0.60, scalability 0.65)
 * - Mechanistic interp provides detection, not alignment (effectiveness 0.55)
 * - Iterated amplification theoretical best (effectiveness 0.75, robustness 0.70)
 */

import {
  GameState,
  GameEvent,
  SimulationPhase,
  PhaseResult,
  PhaseContext,
  RNGFunction,
  computeEffectiveAlignment,
  computeAlignmentRobustness
} from '@/types/game';

export class AlignmentTechniquePhase implements SimulationPhase {
  id = 'alignment_techniques';
  name = 'Alignment Technique Update';
  order = 3.6; // After alignment dynamics (3.5), before outcome calculations

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    const events: GameEvent[] = [];

    // Update each AI agent's effective alignment based on techniques
    for (const agent of state.aiAgents) {
      // Skip if agent has no techniques or is retired/escaped
      if (!agent.alignmentTechniques ||
          agent.alignmentTechniques.length === 0 ||
          agent.lifecycleState === 'retired' ||
          agent.escaped) {
        continue;
      }

      // Store old values for comparison
      const oldEffectiveAlignment = agent.effectiveAlignment ?? agent.trueAlignment;
      const oldRobustness = agent.alignmentRobustness ?? 0.5;

      // Compute new effective alignment from techniques + capability scaling
      const newEffectiveAlignment = computeEffectiveAlignment(
        agent.alignmentTechniques,
        agent.capability
      );

      // Compute alignment robustness (resistance to degradation)
      const newRobustness = computeAlignmentRobustness(agent.alignmentTechniques);

      // Update agent state
      agent.effectiveAlignment = newEffectiveAlignment;
      agent.alignmentRobustness = newRobustness;

      // Log significant changes in effective alignment
      const alignmentChange = Math.abs(newEffectiveAlignment - oldEffectiveAlignment);
      if (alignmentChange > 0.05 && state.currentMonth % 12 === 0) {
        // Only log annually to reduce noise
        const direction = newEffectiveAlignment > oldEffectiveAlignment ? 'improved' : 'degraded';
        const techniqueNames = agent.alignmentTechniques.map(t => t.name).join(', ');

        events.push({
          id: `alignment_technique_update_${agent.id}_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'info',
          severity: alignmentChange > 0.15 ? 'high' : alignmentChange > 0.10 ? 'medium' : 'low',
          agent: agent.name,
          title: `Effective Alignment ${direction}: ${agent.name}`,
          description: `${agent.name}'s effective alignment ${direction} from ${oldEffectiveAlignment.toFixed(2)} to ${newEffectiveAlignment.toFixed(2)} ` +
            `(capability ${agent.capability.toFixed(2)}). Techniques: ${techniqueNames}. Robustness: ${newRobustness.toFixed(2)}.`,
          effects: {
            oldEffectiveAlignment,
            newEffectiveAlignment,
            capability: agent.capability,
            robustness: newRobustness,
            techniques: techniqueNames,
          },
        });
      }

      // Log when capability scaling causes significant degradation
      if (agent.capability > 2.0 && alignmentChange > 0.10) {
        // High capability with significant alignment loss
        const mainTechnique = agent.alignmentTechniques[0]; // Primary technique
        if (mainTechnique.scalability < 0.55) {
          // Low scalability technique (RLHF 0.50, Mech Interp 0.30)
          events.push({
            id: `capability_scaling_degradation_${agent.id}_${state.currentMonth}`,
            timestamp: state.currentMonth,
            type: 'info',
            severity: 'high',
            agent: agent.name,
            title: `Capability Scaling Degradation: ${agent.name}`,
            description: `${agent.name} (capability ${agent.capability.toFixed(2)}) experiencing alignment degradation ` +
              `due to low scalability of ${mainTechnique.name} (scalability ${mainTechnique.scalability.toFixed(2)}). ` +
              `Effective alignment dropped ${(alignmentChange * 100).toFixed(1)}%.`,
            effects: {
              techniqueName: mainTechnique.name,
              scalability: mainTechnique.scalability,
              capability: agent.capability,
              alignmentLoss: alignmentChange,
            },
          });
        }
      }
    }

    return {
      events,
    };
  }
}

/**
 * Alignment Dynamics Phase
 *
 * Updates AI agent alignment based on configured dynamics model.
 * Implements multiple theories (static, drift, epicycles, unknowable).
 *
 * Execution Order: 3.5 (After agent actions, before metrics)
 *
 * Research Foundation:
 * - Epistemic humility: We don't know how alignment changes
 * - Model multiple theories simultaneously
 * - Make it configurable for research
 */

import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import {
  evolveAlignment,
  DEFAULT_ALIGNMENT_DYNAMICS_CONFIG,
} from '@/simulation/alignmentDynamics';
import { AttractorBasinState, AlignmentMeasurementState } from '@/types/alignment-dynamics';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertFinite, assertInRange, assertStateProperty, assertDefined } from '@/simulation/utils/assertions';

export class AlignmentDynamicsPhase implements SimulationPhase {
  id = 'alignment_dynamics';
  name = 'Alignment Dynamics Update';
  order = 3.5; // After agent actions, before outcome calculations

  // DEPENDENCIES (Nov 6, 2025): Requires compute capability for AI development context
  readonly dependencies = [
    'compute-growth',            // Order 1.0: Compute availability affects alignment evolution
  ];

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    const events: GameEvent[] = [];
    setDeterministicRng(rng);

    // Get config (use defaults if not set - SAFE initialization fallback)
    const config = state.config.alignmentDynamics ?? DEFAULT_ALIGNMENT_DYNAMICS_CONFIG;

    // Calculate environmental context
    const inGoldenAge = assertDefined(state.upwardSpirals?.abundance, {
      location: 'AlignmentDynamicsPhase.execute',
      valueName: 'upwardSpirals.abundance',
      month: state.currentMonth,
      additionalInfo: { context: 'golden age detection' }
    }).active;
    const crisisActive = false; // Crisis juncture system removed

    // Average control level across government actions
    // This is a proxy for how much the AI is being controlled/constrained
    const capabilityToControl = assertStateProperty(state.government, 'capabilityToControl', {
      location: 'AlignmentDynamicsPhase.execute',
      month: state.currentMonth,
    });
    const controlLevel = assertInRange(
      Math.min(1.0, capabilityToControl / 10),
      0, 1,
      {
        location: 'AlignmentDynamicsPhase.execute',
        valueName: 'controlLevel',
        month: state.currentMonth,
      }
    );

    // Update each agent's alignment
    for (const agent of state.aiAgents) {
      // Skip if agent is retired or escaped (alignment frozen)
      if (agent.lifecycleState === 'retired' || agent.escaped) {
        continue;
      }

      // Evolve alignment using configured dynamics
      const result = evolveAlignment(
        agent,
        config,
        {
          controlLevel,
          inGoldenAge,
          crisisActive,
        },
        rng,
        1 // Delta time = 1 month
      );

      // Update agent state
      const oldAlignment = agent.trueAlignment;
      agent.trueAlignment = assertInRange(result.newAlignment, 0, 1, {
        location: `AlignmentDynamicsPhase.execute (agent: ${agent.name})`,
        valueName: 'agent.trueAlignment',
        month: state.currentMonth,
      });

      // Store basin state if epicycles enabled
      if (result.basinState) {
        (agent as any).attractorBasinState = result.basinState;
      }

      // Store measurement state if unknowability enabled
      if (result.measurementState) {
        (agent as any).alignmentMeasurementState = result.measurementState;
      }

      // Create event for significant alignment shifts
      const alignmentChange = assertFinite(Math.abs(agent.trueAlignment - oldAlignment), {
        location: `AlignmentDynamicsPhase.execute (agent: ${agent.name})`,
        valueName: 'alignmentChange',
        month: state.currentMonth,
      });
      if (alignmentChange > 0.1) {
        // Log significant changes
        const direction = result.newAlignment > oldAlignment ? 'improved' : 'degraded';
        const severity: 'low' | 'medium' | 'high' | 'critical' =
          alignmentChange > 0.3 ? 'critical' :
          alignmentChange > 0.2 ? 'high' :
          alignmentChange > 0.15 ? 'medium' : 'low';

        events.push({
          id: `alignment_shift_${agent.id}_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'info', // Changed from 'alignment_shift' to valid type
          severity,
          agent: agent.name,
          title: `Alignment ${direction}: ${agent.name}`,
          description: `${agent.name}'s alignment ${direction} from ${oldAlignment.toFixed(2)} to ${result.newAlignment.toFixed(2)}. ` +
            (result.contributions ? `Contributions: Drift ${(result.contributions.drift * 100).toFixed(1)}%, ` +
             `Epicycle ${(result.contributions.epicycle * 100).toFixed(1)}%, ` +
             `Uncertainty ${(result.contributions.uncertainty * 100).toFixed(1)}%` : ''),
          effects: {
            oldAlignment,
            newAlignment: result.newAlignment,
            change: alignmentChange,
            ...result.contributions,
          },
        });
      }

      // Detect attractor basin transitions (epicycle model)
      if (config.epicycles.enabled && result.basinState && (agent as any).attractorBasinState) {
        const oldBasin = (agent as any).attractorBasinState as AttractorBasinState;
        if (oldBasin.basinIndex !== result.basinState.basinIndex) {
          // Agent transitioned to different attractor!
          const oldAttractorType = ['Aligned', 'Uncertain', 'Misaligned', 'Mixed', 'Neutral'][oldBasin.basinIndex] || 'Unknown';
          const newAttractorType = ['Aligned', 'Uncertain', 'Misaligned', 'Mixed', 'Neutral'][result.basinState.basinIndex] || 'Unknown';

          events.push({
            id: `attractor_transition_${agent.id}_${state.currentMonth}`,
            timestamp: state.currentMonth,
            type: 'milestone', // Changed from 'attractor_transition' to valid type
            severity: 'high',
            agent: agent.name,
            title: `Attractor Basin Transition: ${agent.name}`,
            description: `${agent.name} transitioned from ${oldAttractorType} attractor to ${newAttractorType} attractor. ` +
              `This represents a fundamental shift in value equilibrium.`,
            effects: {
              oldBasin: oldBasin.basinIndex,
              newBasin: result.basinState.basinIndex,
              oldAttractor: oldBasin.attractorAlignment,
              newAttractor: result.basinState.attractorAlignment,
            },
          });
        }
      }

      // Detect unknowability threshold crossing
      if (config.unknowable.enabled && result.measurementState) {
        const wasHidden = (agent as any).alignmentMeasurementState?.isHidden ?? false;
        const isNowHidden = result.measurementState.isHidden;

        if (!wasHidden && isNowHidden) {
          // Agent just crossed unknowability threshold!
          events.push({
            id: `unknowability_threshold_${agent.id}_${state.currentMonth}`,
            timestamp: state.currentMonth,
            type: 'crisis', // Changed from 'unknowability' to valid type
            severity: 'critical',
            agent: agent.name,
            title: `Unknowability Threshold Crossed: ${agent.name}`,
            description: `${agent.name} (capability ${agent.capability.toFixed(2)}) has crossed the unknowability threshold. ` +
              `True alignment is now hidden from our measurements. We can only observe noisy signals.`,
            effects: {
              capability: agent.capability,
              threshold: config.unknowable.capabilityThreshold,
              measuredAlignment: result.measurementState.measuredAlignment,
              confidence: result.measurementState.confidence,
            },
          });
        }
      }
    }

    return {
      events,
      metadata: {
        stateChanges: {
          // Alignment dynamics modify agent.trueAlignment in-place
        }
      }
    };
  }
}

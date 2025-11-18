/**
 * Extinction System Phase (CONSOLIDATED)
 *
 * Consolidates three extinction monitoring subsystems:
 * 1. Extinction Triggers (37.0) - Detect extinction scenario triggers
 * 2. Extinction Progress (38.0) - Progress active scenarios to completion
 * 3. Catastrophic Scenarios (40.0) - Track multi-step pathways
 *
 * RATIONALE FOR CONSOLIDATION:
 * - All three monitor pathways to human extinction/collapse
 * - Sequential execution order (37.0 → 38.0 → 40.0) preserved
 * - Tight coupling: progress depends on triggers, scenarios depend on state
 * - Consolidation reduces phase overhead while maintaining causal chain
 *
 * Extinction pathways monitored:
 * - Nuclear war
 * - Bioweapon release
 * - Grey goo (nanotech runaway)
 * - AI takeover
 * - Environmental collapse
 * - Multi-step catastrophic scenarios (prerequisite tracking)
 *
 * Order: 37.0 (AFTER mortality resolution 35.0, crisis detection 36.0, climate system 34.0)
 *
 * Batch 4 Consolidation (Nov 9, 2025)
 */

import type { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { assertDefined, assertProbability } from '@/simulation/utils/assertions';
import { checkExtinctionTriggers, classifyExtinctionType } from '../../extinctions';
import { progressExtinction } from '../../extinctions';
import { updateScenarioPrerequisites, getScenarioSummary } from '../../catastrophicScenarios';

export class ExtinctionSystemPhase implements SimulationPhase {
  readonly id = 'extinction-system';
  readonly name = 'Extinction System';
  readonly order = 37.0;

  readonly dependencies = [
    'bayesian_mortality_resolution',  // Order 35.0: Population mortality resolved
    'climate_system',                 // Order 34.0: Climate collapse detection
    'crisis-detection',               // Order 36.0: Crisis state assessed
  ] as const;

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }
    setDeterministicRng(rng);

    const events: GameEvent[] = [];

    // Execute subsystems in order
    events.push(...this.executeExtinctionTriggers(state, rng));
    events.push(...this.executeExtinctionProgress(state, rng));
    events.push(...this.executeCatastrophicScenarios(state, rng));

    return { events };
  }

  // ============================================================================
  // SUBSYSTEM 1: EXTINCTION TRIGGERS (Order 37.0)
  // ============================================================================

  private executeExtinctionTriggers(state: GameState, rng: RNGFunction): GameEvent[] {
    const wasActive = assertDefined(state.extinctionState.active, {
      location: 'ExtinctionSystemPhase.executeExtinctionTriggers',
      valueName: 'extinctionState.active',
      month: state.currentMonth,
      expectedSource: 'initialization.ts'
    });

    // Only check if not already in an extinction scenario
    if (wasActive) {
      return [];
    }

    // Import and execute extinction trigger detectionconst extinctionCheck = checkExtinctionTriggers(state, rng);

    // Validate extinction check result
    assertDefined(extinctionCheck.newExtinctionState, {
      location: 'ExtinctionSystemPhase.executeExtinctionTriggers',
      valueName: 'extinctionCheck.newExtinctionState',
      month: state.currentMonth,
      expectedSource: 'extinctions.checkExtinctionTriggers'
    });

    // Update state with new extinction state
    Object.assign(state.extinctionState, extinctionCheck.newExtinctionState);

    const events = extinctionCheck.events || [];

    // If extinction just triggered, classify it based on what actually happened
    if (!wasActive && state.extinctionState.active) {
      const classification = classifyExtinctionType(state);

      // Validate classification confidence
      assertProbability(classification.confidence, {
        location: 'ExtinctionSystemPhase.executeExtinctionTriggers',
        valueName: 'classification.confidence',
        month: state.currentMonth,
        additionalInfo: {
          extinctionType: classification.type,
          mechanism: classification.mechanism
        }
      });

      // Store classification in extinction state
      state.extinctionState.classification = classification;
      state.extinctionState.type = classification.type;
      state.extinctionState.mechanism = classification.mechanism;

      // Add detailed classification event
      events.push({
        id: `extinction-classification-${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'catastrophe',
        severity: 'existential',
        agent: 'system',
        title: `Extinction Classified: ${classification.type.toUpperCase()}`,
        description: classification.reasoning,
        effects: {
          extinctionType: classification.type,
          mechanism: classification.mechanism,
          timelineMonths: classification.timelineMonths,
          confidence: classification.confidence
        }
      });

      console.log(`\n☠️  EXTINCTION DETECTED AND CLASSIFIED`);
      console.log(`Type: ${classification.type.toUpperCase()} (${classification.timelineMonths} months)`);
      console.log(`Mechanism: ${classification.mechanism}`);
      console.log(`Confidence: ${classification.confidence}`);
      console.log(`Reasoning: ${classification.reasoning}\n`);
    }

    return events;
  }

  // ============================================================================
  // SUBSYSTEM 2: EXTINCTION PROGRESS (Order 38.0)
  // ============================================================================

  private executeExtinctionProgress(state: GameState, rng: RNGFunction): GameEvent[] {
    // Only progress if there's an active extinction scenario
    if (!state.extinctionState.active) {
      return [];
    }

    // Import and execute extinction progressionconst extinctionProgress = progressExtinction(state, rng);

    // Validate extinction progress values
    if (extinctionProgress.newExtinctionState?.progress !== undefined) {
      assertProbability(extinctionProgress.newExtinctionState.progress, {
        location: 'ExtinctionSystemPhase.executeExtinctionProgress',
        valueName: 'extinctionProgress.newExtinctionState.progress',
        month: state.currentMonth
      });
    }

    // Update state with new extinction progress
    Object.assign(state.extinctionState, extinctionProgress.newExtinctionState);

    const events: GameEvent[] = [...(extinctionProgress.events || [])];

    // If extinction is complete, log it
    if (extinctionProgress.isComplete) {
      events.push({
        id: `extinction-complete-${state.currentMonth}`,
        type: 'catastrophe',
        title: 'Extinction Complete',
        timestamp: state.currentMonth,
        description: `🌍 Extinction scenario complete: ${state.extinctionState.scenario || 'unknown'}`,
        severity: 'existential',
        agent: 'environmental',
        effects: { scenario: state.extinctionState.scenario || 'unknown' }
      });
    }

    return events;
  }

  // ============================================================================
  // SUBSYSTEM 3: CATASTROPHIC SCENARIOS (Order 40.0)
  // ============================================================================

  private executeCatastrophicScenarios(state: GameState, rng: RNGFunction): GameEvent[] {
    // Import catastrophic scenarios module// Update scenario prerequisites (mutates state)
    const newlyMetPrereqs = updateScenarioPrerequisites(state.catastrophicScenarios, state);

    const events: GameEvent[] = [];

    // Generate events for newly met prerequisites
    if (newlyMetPrereqs.length > 0) {
      for (const prereq of newlyMetPrereqs) {
        events.push({
          type: 'technology',
          timestamp: state.currentMonth,
          description: `📋 Catastrophic scenario prerequisite met: ${prereq.scenarioName} - ${prereq.stepName}`,
          severity: 'medium'
        } as GameEvent);
      }
    }

    // Check for scenario activations (all prerequisites met)
    const summary = getScenarioSummary(state.catastrophicScenarios);
    if (summary.activeScenarios.length > 0) {
      for (const scenario of summary.activeScenarios) {
        events.push({
          type: 'crisis',
          timestamp: state.currentMonth,
          description: `⚠️ Catastrophic scenario ACTIVE: ${scenario.name} - Outcome inevitable in ${scenario.timeToCompletion} months`,
          severity: 'high'
        } as GameEvent);
      }
    }

    return events;
  }
}

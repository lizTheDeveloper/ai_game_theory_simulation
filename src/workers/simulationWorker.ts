/**
 * Simulation Web Worker
 *
 * Runs simulation engine in a separate thread to avoid blocking the UI.
 * Communicates via message passing for commands and state updates.
 *
 * Architecture:
 * - Imports same engine code as Monte Carlo (zero duplication)
 * - Sends delta updates (not full 1.78MB state)
 * - Supports pause/resume/step controls
 * - Can inject player decisions (Phase 3 future work)
 */

import { SimulationEngine } from '../simulation/engine';
import { createDefaultInitialState } from '../simulation/initialization';
import type { GameState } from '../types/game';
import type { ScenarioMode } from '../types/game';

// Worker state
let engine: SimulationEngine | null = null;
let state: GameState | null = null;
let running = false;
let intervalId: ReturnType<typeof setInterval> | null = null;
let stepInterval = 1000; // 1 second = 1 day (configurable)

// Previous state snapshot for delta calculation
let previousState: Partial<GameState> | null = null;

// Message types from main thread
type WorkerMessage =
  | { type: 'init'; seed: number; scenario?: ScenarioMode; interval?: number }
  | { type: 'start' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'step' }
  | { type: 'setSpeed'; interval: number }
  | { type: 'decision'; decision: PlayerDecision };

// Response types to main thread
type WorkerResponse =
  | { type: 'initialized'; initialState: InitialStateSnapshot }
  | { type: 'update'; delta: StateDelta; month: number; timestamp: number }
  | { type: 'paused'; month: number }
  | { type: 'resumed'; month: number }
  | { type: 'error'; error: string };

// Minimal initial state snapshot (not full state)
interface InitialStateSnapshot {
  currentMonth: number;
  qualityOfLife: number;
  population: number;
  aiCount: number;
  scenario: ScenarioMode;
}

// Delta contains only changed fields
interface StateDelta {
  // Core metrics
  currentMonth?: number;
  qualityOfLife?: number;
  population?: number;
  aiCount?: number;
  outcome?: string;

  // Additional metrics
  dystopiaProgression?: number;
  avgAICapability?: number;
  activeCrises?: number;
  deployedTechCount?: number;
  socialCohesion?: number;
  climateChange?: number;

  // Events (optional - only when significant changes happen)
  events?: Array<{ type: string; description: string; severity?: 'low' | 'medium' | 'high' }>;
}

// Player decision (Phase 3 - future work)
interface PlayerDecision {
  type: 'policy' | 'investment' | 'emergency';
  data: any;
}

// Listen for messages from main thread
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const msg = event.data;

  try {
    switch (msg.type) {
      case 'init':
        handleInit(msg.seed, msg.scenario, msg.interval);
        break;

      case 'start':
        handleStart();
        break;

      case 'pause':
        handlePause();
        break;

      case 'resume':
        handleResume();
        break;

      case 'step':
        handleStep();
        break;

      case 'setSpeed':
        handleSetSpeed(msg.interval);
        break;

      case 'decision':
        handleDecision(msg.decision);
        break;

      default:
        throw new Error(`Unknown message type: ${(msg as any).type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : String(error)
    } as WorkerResponse);
  }
});

function handleInit(seed: number, scenario?: ScenarioMode, interval?: number) {
  if (engine || state) {
    throw new Error('Already initialized. Create a new worker to reinitialize.');
  }

  // Create engine with seed
  engine = new SimulationEngine({ seed, maxMonths: Infinity, logLevel: 'none' });

  // Create initial state
  state = createDefaultInitialState(scenario || 'historical');

  // Set speed if provided
  if (interval !== undefined) {
    stepInterval = interval;
  }

  // Create initial snapshot
  const snapshot: InitialStateSnapshot = {
    currentMonth: state.currentMonth,
    qualityOfLife: state.globalMetrics.qualityOfLife,
    population: state.humanPopulationSystem.population,
    aiCount: state.aiAgents.length,
    scenario: scenario || 'historical'
  };

  // Store previous state for delta calculation
  previousState = captureStateSnapshot(state);

  self.postMessage({
    type: 'initialized',
    initialState: snapshot
  } as WorkerResponse);
}

function handleStart() {
  if (!engine || !state) {
    throw new Error('Not initialized. Call init() first.');
  }

  if (running) {
    return; // Already running
  }

  running = true;
  startSimulationLoop();
}

function handlePause() {
  if (!running) {
    return; // Already paused
  }

  running = false;

  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  self.postMessage({
    type: 'paused',
    month: state?.currentMonth || 0
  } as WorkerResponse);
}

function handleResume() {
  if (!engine || !state) {
    throw new Error('Not initialized');
  }

  if (running) {
    return; // Already running
  }

  running = true;
  startSimulationLoop();

  self.postMessage({
    type: 'resumed',
    month: state.currentMonth
  } as WorkerResponse);
}

function handleStep() {
  if (!engine || !state) {
    throw new Error('Not initialized');
  }

  performStep();
}

function handleSetSpeed(interval: number) {
  stepInterval = interval;

  // If running, restart loop with new interval
  if (running && intervalId !== null) {
    clearInterval(intervalId);
    startSimulationLoop();
  }
}

function handleDecision(decision: PlayerDecision) {
  if (!state) {
    throw new Error('Not initialized');
  }

  // Player decision injection (Phase 3 - future work)
  // For now, just log
  console.log('[Worker] Player decision received:', decision);

  // TODO: Inject into state before next step
  // This would go into a PlayerDecisionPhase (order 8.5)
}

function startSimulationLoop() {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }

  intervalId = setInterval(() => {
    if (!running || !engine || !state) {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      return;
    }

    performStep();
  }, stepInterval);
}

function performStep() {
  if (!engine || !state || !previousState) {
    return;
  }

  // Run one simulation step (mutates state in place)
  engine.step(state);

  // Calculate delta (only changed fields)
  const delta = calculateDelta(previousState, state);

  // Update previous state snapshot
  previousState = captureStateSnapshot(state);

  // Send update to main thread
  self.postMessage({
    type: 'update',
    delta,
    month: state.currentMonth,
    timestamp: Date.now()
  } as WorkerResponse);
}

function captureStateSnapshot(state: GameState): Partial<GameState> {
  // Capture only fields we need for delta calculation
  // Don't deep clone entire 1.78MB state (too expensive)

  // Calculate derived metrics
  const avgAICapability = state.aiAgents.length > 0
    ? state.aiAgents.reduce((sum, ai) => sum + (ai.capabilities?.overall || 0), 0) / state.aiAgents.length
    : 0;

  const activeCrises = [
    state.phosphorusCrisis?.active,
    state.freshwaterCrisis?.active,
    state.oceanAcidificationCrisis?.active,
    state.novelEntitiesCrisis?.active,
    state.nuclearCrisis?.active
  ].filter(Boolean).length;

  const deployedTechCount = state.techTreeState?.deployedTech?.length || 0;

  return {
    currentMonth: state.currentMonth,
    globalMetrics: {
      qualityOfLife: state.globalMetrics.qualityOfLife,
      dystopiaProgression: state.globalMetrics.dystopiaProgression,
    } as any,
    humanPopulationSystem: {
      population: state.humanPopulationSystem.population,
    } as any,
    aiAgents: state.aiAgents, // Reference (for count only)
    outcome: state.outcome,
    // Store derived metrics
    _derived: {
      avgAICapability,
      activeCrises,
      deployedTechCount,
      socialCohesion: state.socialCohesion?.overallCohesion || 0,
      climateChange: state.climate?.globalTemperatureAnomaly || 0,
    } as any,
  };
}

function calculateDelta(previous: Partial<GameState>, current: GameState): StateDelta {
  const delta: StateDelta = {};

  // Calculate current derived metrics
  const currentAvgAICapability = current.aiAgents.length > 0
    ? current.aiAgents.reduce((sum, ai) => sum + (ai.capabilities?.overall || 0), 0) / current.aiAgents.length
    : 0;

  const currentActiveCrises = [
    current.phosphorusCrisis?.active,
    current.freshwaterCrisis?.active,
    current.oceanAcidificationCrisis?.active,
    current.novelEntitiesCrisis?.active,
    current.nuclearCrisis?.active
  ].filter(Boolean).length;

  const currentDeployedTechCount = current.techTreeState?.deployedTech?.length || 0;
  const currentSocialCohesion = current.socialCohesion?.overallCohesion || 0;
  const currentClimateChange = current.climate?.globalTemperatureAnomaly || 0;

  // Core metrics - always include month
  if (previous.currentMonth !== current.currentMonth) {
    delta.currentMonth = current.currentMonth;
  }

  // Quality of Life
  if (previous.globalMetrics?.qualityOfLife !== current.globalMetrics.qualityOfLife) {
    delta.qualityOfLife = current.globalMetrics.qualityOfLife;
  }

  // Dystopia progression
  if (previous.globalMetrics?.dystopiaProgression !== current.globalMetrics.dystopiaProgression) {
    delta.dystopiaProgression = current.globalMetrics.dystopiaProgression;
  }

  // Population
  if (previous.humanPopulationSystem?.population !== current.humanPopulationSystem.population) {
    delta.population = current.humanPopulationSystem.population;
  }

  // AI Count
  if (previous.aiAgents?.length !== current.aiAgents.length) {
    delta.aiCount = current.aiAgents.length;
  }

  // Outcome (utopia/dystopia/extinction/etc)
  if (previous.outcome !== current.outcome && current.outcome) {
    delta.outcome = current.outcome;
  }

  // Derived metrics - compare with previous
  const prevDerived = (previous as any)._derived || {};

  if (Math.abs(prevDerived.avgAICapability - currentAvgAICapability) > 0.01) {
    delta.avgAICapability = currentAvgAICapability;
  }

  if (prevDerived.activeCrises !== currentActiveCrises) {
    delta.activeCrises = currentActiveCrises;
  }

  if (prevDerived.deployedTechCount !== currentDeployedTechCount) {
    delta.deployedTechCount = currentDeployedTechCount;
  }

  if (Math.abs(prevDerived.socialCohesion - currentSocialCohesion) > 0.01) {
    delta.socialCohesion = currentSocialCohesion;
  }

  if (Math.abs(prevDerived.climateChange - currentClimateChange) > 0.01) {
    delta.climateChange = currentClimateChange;
  }

  // Events (future work - could extract from game events)
  delta.events = [];

  return delta;
}

// Export type for use in main thread
export type { WorkerMessage, WorkerResponse, StateDelta };

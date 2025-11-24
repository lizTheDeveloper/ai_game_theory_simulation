#!/usr/bin/env npx tsx
/**
 * Single run determinism test - run multiple times in separate processes
 */
import { SimulationEngine, SeededRandom } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { clearDeterministicRng } from '../src/simulation/utils/deterministicRng';

const SEED = 42000;

// Clear any global state
clearDeterministicRng();

const engine = new SimulationEngine({ seed: SEED });
const initRng = new SeededRandom(SEED);
const initialState = createDefaultInitialState(() => initRng.next(), 'unprecedented');

let state = initialState;

// Run to month 2
for (let month = 1; month <= 2; month++) {
  const result = engine.step(state);
  state = result.state;
}

const capSum = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
const alignSum = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0);
const agentCount = state.aiAgents.length;

console.log('SINGLE_RUN_RESULT:' + agentCount + ':' + capSum.toFixed(4) + ':' + alignSum.toFixed(4));

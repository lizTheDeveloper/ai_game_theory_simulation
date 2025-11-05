/**
 * Minimal determinism debugging script
 * Runs 3 identical simulations and logs AI agent capabilities at each step
 */

import { createInitialState } from '../src/simulation/initialization';
import { PhaseOrchestrator } from '../src/simulation/engine/PhaseOrchestrator';
import { createSeededRng } from '../src/simulation/utils/rng';

const SEED = 12345;
const MAX_MONTHS = 2;
const RUNS = 3;

for (let run = 1; run <= RUNS; run++) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`RUN ${run}`);
  console.log('='.repeat(80));

  const state = createInitialState(SEED);
  const orchestrator = new PhaseOrchestrator();

  console.log(`\nInitial state (Month 0 start):`);
  console.log(`  AI count: ${state.aiAgents.length}`);
  console.log(`  Total capability: ${state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0).toFixed(6)}`);

  for (let month = 0; month < MAX_MONTHS; month++) {
    const rng = createSeededRng(SEED + month * 1000 + run * 100000);

    console.log(`\n--- Month ${month} execution (Run ${run}) ---`);

    // Log before execution
    console.log(`Before execution:`);
    state.aiAgents.slice(0, 5).forEach((ai, i) => {
      console.log(`  AI ${i}: cap=${ai.capability.toFixed(6)}, align=${ai.alignment.toFixed(6)}`);
    });

    orchestrator.executeMonth(state, rng);

    // Log after execution
    console.log(`After execution:`);
    console.log(`  AI count: ${state.aiAgents.length}`);
    console.log(`  Total capability: ${state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0).toFixed(6)}`);
    state.aiAgents.slice(0, 5).forEach((ai, i) => {
      console.log(`  AI ${i}: cap=${ai.capability.toFixed(6)}, align=${ai.alignment.toFixed(6)}`);
    });
  }
}

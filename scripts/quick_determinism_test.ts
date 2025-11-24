import { SimulationEngine, SeededRandom } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { resetModuleState } from '../src/simulation/utils/resetModuleState';

const SEED = 42000;
const NUM_RUNS = 3;

async function main() {
  console.log('Quick Determinism Test (3 runs, Month 2)');

  const results: Array<{
    capSum: number;
    alignSum: number;
    agentCount: number;
  }> = [];

  for (let run = 1; run <= NUM_RUNS; run++) {
    console.log('\n=== Run ' + run + ' ===');

    // CRITICAL: Clear all global singletons between runs to prevent state leakage
    resetModuleState();

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

    console.log('  Agents: ' + agentCount);
    console.log('  Capability sum: ' + capSum.toFixed(4));
    console.log('  Alignment sum: ' + alignSum.toFixed(4));

    results.push({ capSum, alignSum, agentCount });
  }

  console.log('\n=== COMPARISON ===');
  const allCapsEqual = results.every(r => r.capSum === results[0].capSum);
  const allAlignsEqual = results.every(r => r.alignSum === results[0].alignSum);
  const allCountsEqual = results.every(r => r.agentCount === results[0].agentCount);

  console.log('Agent counts: ' + results.map(r => r.agentCount).join(', ') + ' - ' + (allCountsEqual ? 'IDENTICAL' : 'DIFFERENT'));
  console.log('Capability sums: ' + results.map(r => r.capSum.toFixed(2)).join(', ') + ' - ' + (allCapsEqual ? 'IDENTICAL' : 'DIFFERENT'));
  console.log('Alignment sums: ' + results.map(r => r.alignSum.toFixed(2)).join(', ') + ' - ' + (allAlignsEqual ? 'IDENTICAL' : 'DIFFERENT'));

  if (allCapsEqual && allAlignsEqual && allCountsEqual) {
    console.log('\nDETERMINISTIC!');
    process.exit(0);
  } else {
    console.log('\nNON-DETERMINISTIC!');
    process.exit(1);
  }
}

main();

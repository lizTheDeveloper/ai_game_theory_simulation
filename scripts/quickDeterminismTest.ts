/**
 * Quick determinism test to verify Object.entries() fix
 */
import { initializeGameState } from '../src/simulation/initialization';
import { PhaseOrchestrator } from '../src/simulation/engine/PhaseOrchestrator';

const SEED = 42;
const MONTHS = 2;
const RUNS = 5;

console.log(`\n=== Quick Determinism Test (Seed: ${SEED}, ${MONTHS} months, ${RUNS} runs) ===\n`);

const results: Array<{ aiCapabilities: number[]; totalCap: number }> = [];

for (let run = 0; run < RUNS; run++) {
  console.log(`Running simulation ${run + 1}...`);

  const state = initializeGameState({ seed: SEED });
  const orchestrator = new PhaseOrchestrator();

  // Run for MONTHS
  for (let month = 0; month < MONTHS; month++) {
    orchestrator.executeStep(state, SEED);
  }

  // Extract AI capabilities
  const aiCapabilities = state.aiAgents.map(ai => ai.capability);
  const totalCap = aiCapabilities.reduce((sum, cap) => sum + cap, 0);

  results.push({ aiCapabilities, totalCap });

  console.log(`  Run ${run + 1} total capability: ${totalCap.toFixed(10)}`);
}

// Compare results
console.log(`\n=== Comparison ===\n`);
const baseline = results[0];
let allMatch = true;

for (let i = 1; i < results.length; i++) {
  const run = results[i];
  const match = Math.abs(run.totalCap - baseline.totalCap) < 1e-9;

  if (match) {
    console.log(`✅ Run ${i + 1} MATCHES baseline: ${run.totalCap.toFixed(10)}`);
  } else {
    console.log(`❌ Run ${i + 1} DIVERGED: ${run.totalCap.toFixed(10)} vs ${baseline.totalCap.toFixed(10)} (delta: ${(run.totalCap - baseline.totalCap).toFixed(10)})`);
    allMatch = false;
  }
}

if (allMatch) {
  console.log(`\n✅ DETERMINISM TEST PASSED: All runs identical!`);
  process.exit(0);
} else {
  console.log(`\n❌ DETERMINISM TEST FAILED: Runs diverged!`);
  process.exit(1);
}

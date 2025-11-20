/**
 * Profile Phase Performance
 *
 * Runs a short simulation with timing enabled and reports:
 * - Average time per phase
 * - Total orchestration overhead
 * - Slowest phases
 * - Phase count impact
 */

import { initializeState } from '../src/simulation/initialization';
import { stepSimulation } from '../src/simulation/engine';

console.log('=== Phase Performance Profiler ===\n');

// Simple LCG RNG for profiling
let seed = 42;
const rng = () => {
  seed = (seed * 1664525 + 1013904223) % 2**32;
  return seed / 2**32;
};
const state = initializeState(rng);

console.log(`Starting simulation profiling...`);
console.log(`Total phases registered: Check orchestrator output\n`);

// Run 12 months with timing enabled
const startTime = performance.now();

for (let month = 0; month < 12; month++) {
  const stepStart = performance.now();
  stepSimulation(state, rng);
  const stepTime = performance.now() - stepStart;

  if (stepTime > 120) {
    console.log(`⚠️  Month ${month + 1}: ${stepTime.toFixed(2)}ms (OVER BUDGET: 120ms)`);
  } else {
    console.log(`✅ Month ${month + 1}: ${stepTime.toFixed(2)}ms`);
  }
}

const totalTime = performance.now() - startTime;
const avgTime = totalTime / 12;

console.log(`\n=== Summary ===`);
console.log(`Total time: ${totalTime.toFixed(2)}ms`);
console.log(`Average step time: ${avgTime.toFixed(2)}ms`);
console.log(`Budget: 120ms per step`);

if (avgTime > 120) {
  const overhead = ((avgTime / 120) * 100 - 100).toFixed(1);
  console.log(`\n🚨 PERFORMANCE BUDGET VIOLATION: ${overhead}% over budget`);
  console.log(`\nRecommendations:`);
  console.log(`1. Check PhaseOrchestrator.getTimingReport() for slowest phases`);
  console.log(`2. Consider phase batching/consolidation`);
  console.log(`3. Profile hot paths in top 10 slowest phases`);
  console.log(`4. Implement lazy evaluation for non-critical phases`);
} else {
  console.log(`\n✅ Within performance budget`);
}

// Note: PhaseOrchestrator.getTimingReport() would be called here if exposed
// For now, the orchestrator logs slow phases automatically during execution

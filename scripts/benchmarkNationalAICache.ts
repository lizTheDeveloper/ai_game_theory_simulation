/**
 * Benchmark: National AI Cooperation Cache Performance
 *
 * Tests the O(n²) → O(n²) optimization (eliminated O(n⁴) nested find)
 * Measures cache creation time with varying nation counts
 */

import { createInitialGameState } from '../src/simulation/initialization';
import { createInteractionCache } from '../src/simulation/nationalAI/interactionCache';
import { GameState } from '../src/types/game';
import { NationName } from '../src/types/nationalAI';

function createBenchmarkState(nationCount: number): GameState {
  const state = createInitialGameState(42); // deterministic seed

  // Expand nations array to target count (duplicate existing nations)
  const baseNations = [...state.nationalAI.nations];
  while (state.nationalAI.nations.length < nationCount) {
    const template = baseNations[state.nationalAI.nations.length % baseNations.length];
    state.nationalAI.nations.push({
      ...template,
      nation: `TestNation${state.nationalAI.nations.length}` as NationName,
    });
  }

  // Generate bilateral tensions (n*(n-1)/2 pairs)
  state.bilateralTensions = [];
  for (let i = 0; i < state.nationalAI.nations.length; i++) {
    for (let j = i + 1; j < state.nationalAI.nations.length; j++) {
      state.bilateralTensions.push({
        nationA: state.nationalAI.nations[i].nation,
        nationB: state.nationalAI.nations[j].nation,
        tensionLevel: 0.5,
        tensionTrend: 'stable',
        diplomaticFreeze: false,
      });
    }
  }

  return state;
}

function benchmark(nationCount: number, iterations: number = 100): number {
  const state = createBenchmarkState(nationCount);

  // Warm-up
  createInteractionCache(state);

  // Benchmark
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    createInteractionCache(state);
  }
  const end = performance.now();

  return (end - start) / iterations;
}

console.log('\n=== National AI Cooperation Cache Performance Benchmark ===');
console.log('Testing: createInteractionCache() with varying nation counts\n');
console.log('Expected: O(n²) scaling (after fix - was O(n⁴))');
console.log('Context: Called once per simulation step (every month)\n');

const testCases = [10, 20, 50, 100];
const iterations = 100;

console.log('Nation Count | Avg Time (ms) | Tension Pairs | Operations');
console.log('-------------|---------------|---------------|------------');

for (const n of testCases) {
  const avgTime = benchmark(n, iterations);
  const pairs = (n * (n - 1)) / 2;
  console.log(`${n.toString().padStart(12)} | ${avgTime.toFixed(4).padStart(13)} | ${pairs.toString().padStart(13)} | ${n} nations + ${pairs} lookups`);
}

console.log('\n✅ Performance Improvement (Nov 11, 2025):');
console.log('   Before: O(n²) pairs × O(n²) find = O(n⁴)');
console.log('   After:  O(n²) map build + O(n²) pairs × O(1) lookup = O(n²)');
console.log('\n   For 100 nations: ~25 million operations → ~10,000 operations');
console.log('   Estimated speedup: ~2500× for large nation counts\n');

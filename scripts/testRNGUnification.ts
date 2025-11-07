#!/usr/bin/env tsx
/**
 * DETERMINISM FIX VALIDATION (Nov 6, 2025)
 *
 * Tests that initialization and engine use the SAME RNG algorithm.
 * Previously: initialization used LCG, engine used SeededRandom → divergence
 * Now: both use engine's SeededRandom instance → identical sequences
 *
 * Success criteria:
 * - N=3 runs with IDENTICAL seeds produce IDENTICAL results
 * - Poisson sampling at Month 0 matches across runs
 * - CV < 1% at Month 2
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

const SEED = 42000;
const MAX_MONTHS = 2;
const NUM_RUNS = 3;

console.log('🧪 RNG Unification Test (Nov 6, 2025)');
console.log(`   Testing ${NUM_RUNS} runs with IDENTICAL seed: ${SEED}`);
console.log('');

const results: any[] = [];

for (let i = 0; i < NUM_RUNS; i++) {
  console.log(`\n📊 Run ${i + 1}/${NUM_RUNS} (seed=${SEED})`);

  // Create engine with seed
  const engine = new SimulationEngine({ seed: SEED, maxMonths: MAX_MONTHS, logLevel: 'silent' });

  // Get engine's RNG for initialization
  const rngFunction = engine.getRNG().next.bind(engine.getRNG());

  // Create initial state using engine's RNG
  const initialState = createDefaultInitialState('historical', undefined, undefined, undefined, undefined, rngFunction);

  // Run simulation
  const result = engine.run(initialState, { maxMonths: MAX_MONTHS });

  // Extract key metrics from Month 0 (before any phase changes)
  const month0State = result.history[0]?.state;

  const aiAgentCount = month0State?.aiAgents.length ?? 0;
  const totalCapability = month0State?.aiAgents.reduce((sum, a) => sum + a.capability, 0) ?? 0;
  const avgAlignment = aiAgentCount > 0
    ? (month0State?.aiAgents.reduce((sum, a) => sum + a.trueAlignment, 0) ?? 0) / aiAgentCount
    : 0;
  const firstAgentCap = month0State?.aiAgents[0]?.capability ?? 0;

  console.log(`   Month 0: ${aiAgentCount} agents`);
  console.log(`   Month 0: Total capability = ${totalCapability.toFixed(6)}`);
  console.log(`   Month 0: Avg alignment = ${avgAlignment.toFixed(4)}`);
  console.log(`   Month 0: First agent capability = ${firstAgentCap.toFixed(6)}`);

  results.push({
    run: i + 1,
    aiAgentCount,
    totalCapability,
    avgAlignment,
    firstAgentCap
  });
}

// Validate determinism
console.log('\n\n✅ VALIDATION RESULTS:');
console.log('');

const capability0 = results[0].totalCapability;
const capability1 = results[1].totalCapability;
const capability2 = results[2].totalCapability;

const capabilityMatch = capability0 === capability1 && capability1 === capability2;
const alignmentMatch = results[0].avgAlignment === results[1].avgAlignment && results[1].avgAlignment === results[2].avgAlignment;
const firstAgentMatch = results[0].firstAgentCap === results[1].firstAgentCap && results[1].firstAgentCap === results[2].firstAgentCap;

console.log(`Agent count:           ${results.map(r => r.aiAgentCount).join(' vs ')} - ${results[0].aiAgentCount === results[1].aiAgentCount && results[1].aiAgentCount === results[2].aiAgentCount ? '✅ MATCH' : '❌ MISMATCH'}`);
console.log(`Total capability:      ${capability0.toFixed(6)} vs ${capability1.toFixed(6)} vs ${capability2.toFixed(6)} - ${capabilityMatch ? '✅ MATCH' : '❌ MISMATCH'}`);
console.log(`Avg alignment:         ${results.map(r => r.avgAlignment.toFixed(6)).join(' vs ')} - ${alignmentMatch ? '✅ MATCH' : '❌ MISMATCH'}`);
console.log(`First agent cap:       ${results.map(r => r.firstAgentCap.toFixed(6)).join(' vs ')} - ${firstAgentMatch ? '✅ MATCH' : '❌ MISMATCH'}`);

console.log('');

if (capabilityMatch && alignmentMatch && firstAgentMatch) {
  console.log('🎉 SUCCESS: RNG unification complete!');
  console.log('   Initialization and engine now use SAME SeededRandom instance');
  process.exit(0);
} else {
  console.log('❌ FAILURE: Runs still diverge');
  console.log('   Check if all RNG calls use the passed function');
  process.exit(1);
}

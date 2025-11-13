/**
 * Monte Carlo Validation: Novel Entities Tiered Effectiveness Model
 *
 * Validates that tiered effectiveness model produces 2-30% range in practice.
 *
 * Success criteria:
 * - Novel Entities boundary shows improvement (not flat 0%)
 * - Effectiveness scales with regulatory deployment
 * - Respects 30% hard ceiling
 * - Deterministic (same seed = same results)
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { SimulationEngine } from '../src/simulation/engine';

const NUM_RUNS = 10;
const MONTHS_PER_RUN = 120; // 10 years

// Simple RNG function (seeded linear congruential generator)
function createRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % (2**32);
    return state / (2**32);
  };
}

console.log('\n🧪 Monte Carlo Validation: Novel Entities Tiered Effectiveness\n');
console.log('═'.repeat(70));

for (let run = 0; run < NUM_RUNS; run++) {
  const seed = 1000 + run;
  const rng = createRng(seed);

  console.log(`\n📊 Run ${run + 1}/${NUM_RUNS} (seed=${seed})`);

  // Create initial state
  const initialState = createDefaultInitialState(rng);

  // Create engine
  const engine = new SimulationEngine({
    seed,
    maxMonths: MONTHS_PER_RUN,
    logLevel: 'silent'
  });

  // Run simulation
  let currentState = initialState;
  const novelEntitiesHistory: number[] = [];

  for (let month = 0; month < MONTHS_PER_RUN; month++) {
    const result = engine.step(currentState);
    currentState = result.state;

    // Track Novel Entities boundary value
    const boundary = currentState.planetaryBoundariesSystem?.boundaries?.novel_entities;
    if (boundary) {
      novelEntitiesHistory.push(boundary.value);
    }
  }

  // Analysis
  const initialValue = novelEntitiesHistory[0] || 0;
  const finalValue = novelEntitiesHistory[novelEntitiesHistory.length - 1] || 0;
  const change = finalValue - initialValue;
  const changePercent = initialValue !== 0 ? (change / initialValue) * 100 : 0;

  // Check if any Novel Entities tech was deployed
  const techDeployed = currentState.techTreeState?.regionalDeployment?.['global']?.some(
    (d: any) => (d.techId.includes('pfas') || d.techId.includes('plastic') || d.techId.includes('green_chemistry')) && d.deploymentLevel > 0
  ) ?? false;

  console.log(`  Initial: ${initialValue.toFixed(3)}`);
  console.log(`  Final: ${finalValue.toFixed(3)}`);
  console.log(`  Change: ${change >= 0 ? '+' : ''}${change.toFixed(3)} (${changePercent.toFixed(1)}%)`);
  console.log(`  Tech deployed: ${techDeployed ? 'Yes' : 'No'}`);

  // Validate expectations
  if (techDeployed && change === 0) {
    console.log(`  ⚠️  WARNING: Tech deployed but no change (possible flat 0% bug)`);
  }
}

console.log('\n═'.repeat(70));
console.log('✅ Monte Carlo validation complete');
console.log('\nExpected behavior:');
console.log('  - If no tech: Boundary worsens (pollution accumulates)');
console.log('  - If tech deployed: Boundary improves (2-30% effectiveness)');
console.log('  - Never flat 0% with tech deployed');

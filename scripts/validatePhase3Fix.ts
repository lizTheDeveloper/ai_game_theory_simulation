/**
 * Validate Phase 3 Fix - Run N=3 Monte Carlo for 3 representative scenarios
 *
 * Tests that scenarios now complete to 360 months instead of terminating at 49.
 */

import { runMonteCarloScenario } from './scenarioRunner';

const MAX_MONTHS = 360;
const MONTE_CARLO_N = 3;
const BASE_SEED = 2000; // Different from main Phase 3 run

// Test 3 representative scenarios
const TEST_SCENARIOS = [
  'climate-first',
  'equality-first',
  'ai-alignment-first'
];

console.log('\n' + '='.repeat(80));
console.log('PHASE 3 FIX VALIDATION');
console.log('='.repeat(80));
console.log(`Max months: ${MAX_MONTHS} (${(MAX_MONTHS / 12).toFixed(0)} years)`);
console.log(`Monte Carlo: N=${MONTE_CARLO_N} per scenario`);
console.log(`Scenarios: ${TEST_SCENARIOS.length}\n`);

const allResults: any[] = [];
const failures: string[] = [];

for (const scenarioId of TEST_SCENARIOS) {
  console.log(`\nRunning scenario: ${scenarioId}`);
  console.log('='.repeat(80));

  try {
    const results = runMonteCarloScenario(scenarioId, MONTE_CARLO_N, BASE_SEED, MAX_MONTHS);
    allResults.push(...results);

    // Check for early termination
    const monthsSimulated = results.map(r => r.monthsSimulated);
    const min = Math.min(...monthsSimulated);
    const max = Math.max(...monthsSimulated);
    const avg = monthsSimulated.reduce((a, b) => a + b, 0) / monthsSimulated.length;

    console.log(`\n  Months simulated: min=${min}, max=${max}, avg=${avg.toFixed(1)}`);

    if (min < MAX_MONTHS) {
      failures.push(`${scenarioId}: Some runs terminated early (min=${min})`);
    }

  } catch (error) {
    console.error(`\n❌ FAILED: ${scenarioId}`);
    console.error(error);
    failures.push(`${scenarioId}: Exception thrown`);
  }
}

console.log('\n' + '='.repeat(80));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(80));
console.log(`Total runs: ${allResults.length}`);
console.log(`Target months: ${MAX_MONTHS}`);

if (failures.length === 0) {
  console.log(`\n✅ ALL TESTS PASSED - No early termination detected`);
  process.exit(0);
} else {
  console.error(`\n❌ FAILURES DETECTED:`);
  for (const failure of failures) {
    console.error(`   - ${failure}`);
  }
  process.exit(1);
}

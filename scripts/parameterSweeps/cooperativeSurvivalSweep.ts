/**
 * Cooperative Ownership Survival Multiplier Sensitivity Analysis
 *
 * Tests Sylvia's concern: "1.5x multiplier seems arbitrary - why not 1.2x or 1.1x?"
 *
 * Test range: 1.1x to 1.8x in 0.1x increments
 * Runs per parameter: 20
 * Total runs: 8 parameters × 20 runs = 160
 * Duration: 120 months (10 years)
 *
 * Measures:
 * - Organization survival rates (cooperative vs traditional)
 * - Crisis resilience differential
 * - Outcome distributions (utopia/dystopia rates)
 */

import { runMonteCarloSimulation } from '../monteCarloSimulation';
import * as fs from 'fs';

const SURVIVAL_MULTIPLIERS = [1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8];
const RUNS_PER_PARAM = 20;
const MAX_MONTHS = 120;

async function runSweep() {
  console.log('\n🔬 COOPERATIVE SURVIVAL MULTIPLIER SENSITIVITY ANALYSIS');
  console.log('========================================================\n');
  console.log(`Testing ${SURVIVAL_MULTIPLIERS.length} parameter values`);
  console.log(`Runs per parameter: ${RUNS_PER_PARAM}`);
  console.log(`Total runs: ${SURVIVAL_MULTIPLIERS.length * RUNS_PER_PARAM}`);
  console.log(`Duration: ${MAX_MONTHS} months (${MAX_MONTHS / 12} years)\n`);

  const results: Array<{
    multiplier: number;
    outcomes: any;
    orgSurvival: any;
  }> = [];

  for (const multiplier of SURVIVAL_MULTIPLIERS) {
    console.log(`\n🎲 Testing survival multiplier: ${multiplier}x`);

    // TODO: Modify cooperative survival constants before each run
    // This requires either:
    // 1. Passing multiplier as config option
    // 2. Temporarily modifying src/simulation/cooperativeOwnership.ts constants
    //
    // For now, log intention - implementation requires refactoring constants

    console.log(`  ⚠️  Implementation note: Constant modification not yet automated`);
    console.log(`     Manual test: Edit COOPERATIVE_SURVIVAL_MULTIPLIER to ${multiplier}`);
    console.log(`     Then run: npx tsx scripts/monteCarloSimulation.ts --runs=${RUNS_PER_PARAM} --max-months=${MAX_MONTHS}`);

    // Placeholder for actual run
    // const outcome = await runMonteCarloSimulation({
    //   runs: RUNS_PER_PARAM,
    //   maxMonths: MAX_MONTHS,
    //   cooperativeSurvivalMultiplier: multiplier  // Need to add this parameter
    // });

    results.push({
      multiplier,
      outcomes: {}, // Placeholder
      orgSurvival: {} // Placeholder
    });
  }

  // Save results
  const outputPath = `/Users/annhoward/src/superalignmenttoutopia/logs/cooperative_survival_sweep_${Date.now()}.json`;
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\n✅ Results saved to: ${outputPath}`);
}

runSweep().catch(console.error);

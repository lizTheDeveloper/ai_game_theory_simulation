/**
 * Scenario Mode Comparison: Historical vs Unprecedented
 *
 * Demonstrates outcome diversity differences between scenario modes:
 * - Historical: Calibrated to worst documented crises (expected outcome diversity)
 * - Unprecedented: Tail-risk modeling (expected dystopia dominance)
 *
 * Usage:
 *   npx tsx scripts/compareScenarioModes.ts [runs_per_mode]
 *
 * Example:
 *   npx tsx scripts/compareScenarioModes.ts 20  # 20 runs per mode = 40 total
 */

import { runSimulation } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import type { ScenarioMode } from '../types/config';
import { createSeededRandom } from '../src/utils/rng';

interface OutcomeStats {
  utopia: number;
  hybrid: number;
  statusQuo: number;
  dystopia: number;
  collapse: number;
  extinction: number;
  total: number;
}

async function runScenarioComparison(runsPerMode: number = 20) {
  console.log(`\n=== Scenario Mode Comparison ===`);
  console.log(`Runs per mode: ${runsPerMode}`);
  console.log(`Total runs: ${runsPerMode * 2}\n`);

  const scenarios: ScenarioMode[] = ['historical', 'unprecedented'];
  const results: Record<ScenarioMode, OutcomeStats> = {
    historical: { utopia: 0, hybrid: 0, statusQuo: 0, dystopia: 0, collapse: 0, extinction: 0, total: 0 },
    unprecedented: { utopia: 0, hybrid: 0, statusQuo: 0, dystopia: 0, collapse: 0, extinction: 0, total: 0 }
  };

  for (const scenario of scenarios) {
    console.log(`\n🔬 Testing "${scenario}" scenario mode...`);

    for (let i = 0; i < runsPerMode; i++) {
      const seed = 50000 + (scenario === 'historical' ? 0 : 1000) + i;
      const rng = createSeededRandom(seed);

      const initialState = createDefaultInitialState(scenario);
      initialState.config.runLabel = `${scenario}-${seed}`;

      try {
        const finalState = await runSimulation(initialState, { maxMonths: 240, headless: true });
        const outcome = finalState.outcome || 'unknown';

        if (outcome in results[scenario]) {
          results[scenario][outcome as keyof OutcomeStats]++;
        }
        results[scenario].total++;

        // Progress indicator
        if ((i + 1) % 5 === 0) {
          console.log(`  Completed ${i + 1}/${runsPerMode} runs...`);
        }
      } catch (error) {
        console.error(`  ❌ Run ${seed} failed:`, error);
      }
    }
  }

  // Display results
  console.log(`\n\n=== RESULTS ===\n`);

  for (const scenario of scenarios) {
    const stats = results[scenario];
    console.log(`📊 ${scenario.toUpperCase()} MODE:`);
    console.log(`   Utopia:      ${stats.utopia.toString().padStart(3)} / ${stats.total} (${((stats.utopia / stats.total) * 100).toFixed(1)}%)`);
    console.log(`   Hybrid:      ${stats.hybrid.toString().padStart(3)} / ${stats.total} (${((stats.hybrid / stats.total) * 100).toFixed(1)}%)`);
    console.log(`   Status Quo:  ${stats.statusQuo.toString().padStart(3)} / ${stats.total} (${((stats.statusQuo / stats.total) * 100).toFixed(1)}%)`);
    console.log(`   Dystopia:    ${stats.dystopia.toString().padStart(3)} / ${stats.total} (${((stats.dystopia / stats.total) * 100).toFixed(1)}%)`);
    console.log(`   Collapse:    ${stats.collapse.toString().padStart(3)} / ${stats.total} (${((stats.collapse / stats.total) * 100).toFixed(1)}%)`);
    console.log(`   Extinction:  ${stats.extinction.toString().padStart(3)} / ${stats.total} (${((stats.extinction / stats.total) * 100).toFixed(1)}%)`);
    console.log(``);
  }

  // Comparison
  console.log(`\n=== COMPARISON ===\n`);
  console.log(`Historical Mode: ${results.historical.total - results.historical.dystopia} non-dystopia outcomes (${(((results.historical.total - results.historical.dystopia) / results.historical.total) * 100).toFixed(1)}% diversity)`);
  console.log(`Unprecedented Mode: ${results.unprecedented.total - results.unprecedented.dystopia} non-dystopia outcomes (${(((results.unprecedented.total - results.unprecedented.dystopia) / results.unprecedented.total) * 100).toFixed(1)}% diversity)`);
  console.log(``);
  console.log(`💡 Key Insight:`);
  console.log(`   "Unprecedented" scenario models TAIL RISK with extreme parameters:`);
  console.log(`   - 3× higher mortality (1.5% vs 0.5% monthly)`);
  console.log(`   - 3.5× stronger cascades`);
  console.log(`   - 10× harder recovery (1% vs 10%)`);
  console.log(`   - 4× slower ecosystem regeneration`);
  console.log(``);
  console.log(`   High dystopia rate in "unprecedented" is WORKING AS DESIGNED.`);
  console.log(`   Use "historical" for outcome diversity, "unprecedented" for tail-risk assessment.`);
  console.log(``);
}

// Run comparison
const runsPerMode = parseInt(process.argv[2] || '20');
runScenarioComparison(runsPerMode).catch(console.error);

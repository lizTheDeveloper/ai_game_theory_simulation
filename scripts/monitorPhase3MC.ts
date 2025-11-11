/**
 * Monitor Phase 3 Monte Carlo Validation Progress
 *
 * Created: November 11, 2025
 * Purpose: Real-time monitoring of 130-run Monte Carlo validation
 * Tracks: Completion rate, spiral activations, determinism validation
 */

import * as fs from 'fs';
import * as path from 'path';

const OUTPUT_DIR = path.join(process.cwd(), 'logs', 'phase3_mc');
const TOTAL_SCENARIOS = 13;
const SEEDS_PER_SCENARIO = 10;
const TOTAL_RUNS = TOTAL_SCENARIOS * SEEDS_PER_SCENARIO;

interface MonitorStats {
  completedRuns: number;
  completionRate: number;
  scenariosCompleted: number;
  spiralActivations: Record<string, number>;
  cascadeActivations: number;
  outcomes: Record<string, number>;
}

function monitorProgress(): MonitorStats {
  // Check if output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    return {
      completedRuns: 0,
      completionRate: 0,
      scenariosCompleted: 0,
      spiralActivations: {},
      cascadeActivations: 0,
      outcomes: {},
    };
  }

  // Count completed runs
  const files = fs.readdirSync(OUTPUT_DIR);
  const resultFiles = files.filter(f => f.endsWith('.json') && !f.endsWith('_summary.json'));

  // Parse results
  const spiralActivations: Record<string, number> = {};
  let cascadeActivations = 0;
  const outcomes: Record<string, number> = {};
  const scenariosWithResults = new Set<string>();

  for (const file of resultFiles) {
    try {
      const filePath = path.join(OUTPUT_DIR, file);
      const result = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      // Track scenario completion
      scenariosWithResults.add(result.scenarioId);

      // Count spiral activations
      if (result.spiralActivation?.activeUpwardSpirals) {
        for (const spiral of result.spiralActivation.activeUpwardSpirals) {
          spiralActivations[spiral] = (spiralActivations[spiral] || 0) + 1;
        }
      }

      // Count cascade activations
      if (result.spiralActivation?.cascadeActive) {
        cascadeActivations++;
      }

      // Count outcomes
      if (result.outcome) {
        outcomes[result.outcome] = (outcomes[result.outcome] || 0) + 1;
      }
    } catch (error) {
      console.error(`Error parsing ${file}:`, error);
    }
  }

  return {
    completedRuns: resultFiles.length,
    completionRate: resultFiles.length / TOTAL_RUNS,
    scenariosCompleted: scenariosWithResults.size,
    spiralActivations,
    cascadeActivations,
    outcomes,
  };
}

function printProgress(stats: MonitorStats): void {
  console.log('\n' + '='.repeat(80));
  console.log('📊 PHASE 3 MONTE CARLO VALIDATION - PROGRESS MONITOR');
  console.log('='.repeat(80));
  console.log(`\n🎯 Progress: ${stats.completedRuns}/${TOTAL_RUNS} runs (${(stats.completionRate * 100).toFixed(1)}%)`);
  console.log(`   Scenarios completed: ${stats.scenariosCompleted}/${TOTAL_SCENARIOS}`);

  console.log(`\n🔄 Spiral Activations (across ${stats.completedRuns} runs):`);
  const sortedSpirals = Object.entries(stats.spiralActivations)
    .sort(([, a], [, b]) => b - a);

  if (sortedSpirals.length === 0) {
    console.log(`   No spiral activations yet`);
  } else {
    for (const [spiral, count] of sortedSpirals) {
      const rate = (count / stats.completedRuns) * 100;
      console.log(`   ${spiral.padEnd(30)} ${count.toString().padStart(3)} runs (${rate.toFixed(1)}%)`);
    }
  }

  console.log(`\n🌀 Cascade Activations: ${stats.cascadeActivations}/${stats.completedRuns} runs (${(stats.cascadeActivations / stats.completedRuns * 100).toFixed(1)}%)`);

  console.log(`\n🎯 Outcome Distribution:`);
  const sortedOutcomes = Object.entries(stats.outcomes)
    .sort(([, a], [, b]) => b - a);

  if (sortedOutcomes.length === 0) {
    console.log(`   No outcomes recorded yet`);
  } else {
    for (const [outcome, count] of sortedOutcomes) {
      const rate = (count / stats.completedRuns) * 100;
      console.log(`   ${outcome.padEnd(30)} ${count.toString().padStart(3)} runs (${rate.toFixed(1)}%)`);
    }
  }

  console.log('\n' + '='.repeat(80));
}

// Main execution
if (require.main === module) {
  const stats = monitorProgress();
  printProgress(stats);

  // If validation is complete, generate final summary
  if (stats.completedRuns === TOTAL_RUNS) {
    console.log('\n✅ VALIDATION COMPLETE - All 130 runs finished');
    console.log('   Run: npx tsx scripts/analyzePhase3Results.ts for detailed analysis');
  } else {
    const remaining = TOTAL_RUNS - stats.completedRuns;
    const avgTimePerRun = 3; // minutes (estimate)
    const estimatedTimeRemaining = remaining * avgTimePerRun;
    console.log(`\n⏳ Estimated time remaining: ${(estimatedTimeRemaining / 60).toFixed(1)} hours (${remaining} runs @ ${avgTimePerRun} min/run)`);
  }
}

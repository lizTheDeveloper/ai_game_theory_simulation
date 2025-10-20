#!/usr/bin/env tsx
/**
 * Compare Paradigm Trajectories Across Multiple Runs
 *
 * Shows side-by-side comparison of paradigm evolution patterns across runs.
 *
 * Usage:
 *   npx tsx scripts/compareParadigmRuns.ts <dir>
 *   npx tsx scripts/compareParadigmRuns.ts monteCarloOutputs/
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// ASCII Chart Utilities
// ============================================================================

function sparkline(values: number[], width: number = 40, min?: number, max?: number): string {
  if (values.length === 0) return '';

  const minVal = min ?? Math.min(...values);
  const maxVal = max ?? Math.max(...values);
  const range = maxVal - minVal || 1;

  const chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

  const step = Math.max(1, Math.floor(values.length / width));
  const sampledValues = [];
  for (let i = 0; i < values.length; i += step) {
    const chunk = values.slice(i, i + step);
    const avg = chunk.reduce((sum, v) => sum + v, 0) / chunk.length;
    sampledValues.push(avg);
  }

  return sampledValues.map(v => {
    const normalized = (v - minVal) / range;
    const index = Math.min(chars.length - 1, Math.floor(normalized * chars.length));
    return chars[index];
  }).join('');
}

// ============================================================================
// Comparison Functions
// ============================================================================

interface RunData {
  seed: number;
  run: number;
  outcome: string;
  totalMonths: number;
  trajectory: Array<{
    month: number;
    western: number;
    development: number;
    ecological: number;
    indigenous: number;
  }>;
  finalScores: {
    western: number;
    development: number;
    ecological: number;
    indigenous: number;
  };
}

/**
 * Load all run data from directory
 */
function loadRuns(dir: string): RunData[] {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('_events.json'));

  return files.map(file => {
    const filePath = path.join(dir, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const trajectory = data.paradigmTrajectory || [];
    const final = trajectory.length > 0 ? trajectory[trajectory.length - 1] : null;

    return {
      seed: data.seed,
      run: data.run,
      outcome: data.outcome,
      totalMonths: data.totalMonths,
      trajectory,
      finalScores: final ? {
        western: final.western ?? 50,
        development: final.development ?? 50,
        ecological: final.ecological ?? 50,
        indigenous: final.indigenous ?? 50,
      } : { western: 50, development: 50, ecological: 50, indigenous: 50 }
    };
  }).sort((a, b) => a.seed - b.seed);
}

/**
 * Show trajectory comparison grid
 */
function showTrajectoryComparison(runs: RunData[], paradigm: 'western' | 'development' | 'ecological' | 'indigenous') {
  const labels: Record<string, string> = {
    western: 'Western Liberal',
    development: 'Development',
    ecological: 'Ecological',
    indigenous: 'Indigenous'
  };

  console.log(`\n  ${labels[paradigm]} Trajectories (0-100):`);
  console.log('  Seed   Outcome        Trajectory                                  Initial → Final');
  console.log('  ' + '-'.repeat(90));

  runs.forEach(run => {
    const values = run.trajectory.map(t => t[paradigm]).filter(v => v != null);

    if (values.length === 0) {
      console.log(`  ${run.seed}  ${run.outcome.padEnd(13)}  (no data)`);
      return;
    }

    const spark = sparkline(values, 40, 0, 100);
    const initial = values[0];
    const final = values[values.length - 1];
    const change = final - initial;
    const changeStr = change > 0 ? `+${change.toFixed(1)}` : change.toFixed(1);

    const outcomeEmoji = run.outcome === 'utopia' ? '🌟' :
                        run.outcome === 'dystopia' ? '🏛️' :
                        run.outcome === 'extinction' ? '💀' : '❓';

    console.log(`  ${run.seed}  ${outcomeEmoji} ${run.outcome.padEnd(11)}  ${spark}  ${initial.toFixed(1)} → ${final.toFixed(1)} (${changeStr})`);
  });
}

/**
 * Show final scores matrix
 */
function showFinalScoresMatrix(runs: RunData[]) {
  console.log('\n  Final Scores Matrix (rows=runs, columns=paradigms):');
  console.log('  Seed   Western  Develop  Ecologi  Indigen  Divergence  Outcome');
  console.log('  ' + '-'.repeat(80));

  runs.forEach(run => {
    const scores = run.finalScores;
    const values = [scores.western, scores.development, scores.ecological, scores.indigenous];

    const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const divergence = Math.sqrt(variance);

    const westernStr = scores.western.toFixed(1).padStart(6);
    const developStr = scores.development.toFixed(1).padStart(6);
    const ecologiStr = scores.ecological.toFixed(1).padStart(6);
    const indigenStr = scores.indigenous.toFixed(1).padStart(6);
    const divergStr = divergence.toFixed(1).padStart(9);

    const outcomeEmoji = run.outcome === 'utopia' ? '🌟' :
                        run.outcome === 'dystopia' ? '🏛️' :
                        run.outcome === 'extinction' ? '💀' : '❓';

    console.log(`  ${run.seed}  ${westernStr}  ${developStr}  ${ecologiStr}  ${indigenStr}  ${divergStr}  ${outcomeEmoji} ${run.outcome}`);
  });
}

/**
 * Show aggregate statistics
 */
function showAggregateStats(runs: RunData[]) {
  console.log('\n  Aggregate Statistics (across all runs):');
  console.log('  ' + '-'.repeat(70));

  // Average final scores
  const avgWestern = runs.reduce((sum, r) => sum + r.finalScores.western, 0) / runs.length;
  const avgDevelopment = runs.reduce((sum, r) => sum + r.finalScores.development, 0) / runs.length;
  const avgEcological = runs.reduce((sum, r) => sum + r.finalScores.ecological, 0) / runs.length;
  const avgIndigenous = runs.reduce((sum, r) => sum + r.finalScores.indigenous, 0) / runs.length;

  console.log(`\n  Average Final Scores:`);
  console.log(`    Western Liberal:  ${avgWestern.toFixed(1)}`);
  console.log(`    Development:      ${avgDevelopment.toFixed(1)}`);
  console.log(`    Ecological:       ${avgEcological.toFixed(1)}`);
  console.log(`    Indigenous:       ${avgIndigenous.toFixed(1)}`);

  // Score distributions
  const countUtopia = (scores: number[]) => scores.filter(s => s >= 80).length;
  const countDystopia = (scores: number[]) => scores.filter(s => s <= 30).length;

  const westernScores = runs.map(r => r.finalScores.western);
  const developmentScores = runs.map(r => r.finalScores.development);
  const ecologicalScores = runs.map(r => r.finalScores.ecological);
  const indigenousScores = runs.map(r => r.finalScores.indigenous);

  console.log(`\n  Utopia Rates (score ≥80):`);
  console.log(`    Western Liberal:  ${countUtopia(westernScores)} / ${runs.length} (${(countUtopia(westernScores)/runs.length*100).toFixed(1)}%)`);
  console.log(`    Development:      ${countUtopia(developmentScores)} / ${runs.length} (${(countUtopia(developmentScores)/runs.length*100).toFixed(1)}%)`);
  console.log(`    Ecological:       ${countUtopia(ecologicalScores)} / ${runs.length} (${(countUtopia(ecologicalScores)/runs.length*100).toFixed(1)}%)`);
  console.log(`    Indigenous:       ${countUtopia(indigenousScores)} / ${runs.length} (${(countUtopia(indigenousScores)/runs.length*100).toFixed(1)}%)`);

  console.log(`\n  Dystopia Rates (score ≤30):`);
  console.log(`    Western Liberal:  ${countDystopia(westernScores)} / ${runs.length} (${(countDystopia(westernScores)/runs.length*100).toFixed(1)}%)`);
  console.log(`    Development:      ${countDystopia(developmentScores)} / ${runs.length} (${(countDystopia(developmentScores)/runs.length*100).toFixed(1)}%)`);
  console.log(`    Ecological:       ${countDystopia(ecologicalScores)} / ${runs.length} (${(countDystopia(ecologicalScores)/runs.length*100).toFixed(1)}%)`);
  console.log(`    Indigenous:       ${countDystopia(indigenousScores)} / ${runs.length} (${(countDystopia(indigenousScores)/runs.length*100).toFixed(1)}%)`);

  // Contested outcomes
  const contestedRuns = runs.filter(run => {
    const scores = [run.finalScores.western, run.finalScores.development, run.finalScores.ecological, run.finalScores.indigenous];
    const utopias = scores.filter(s => s >= 80).length;
    const dystopias = scores.filter(s => s <= 30).length;
    return utopias > 0 && dystopias > 0;
  });

  console.log(`\n  Contested Outcomes: ${contestedRuns.length} / ${runs.length} (${(contestedRuns.length/runs.length*100).toFixed(1)}%)`);
  console.log(`    (Runs with simultaneous paradigm utopias + dystopias)`);

  if (contestedRuns.length > 0) {
    console.log(`\n    Contested Run Seeds: ${contestedRuns.map(r => r.seed).join(', ')}`);
  }
}

/**
 * Show outcome breakdown
 */
function showOutcomeBreakdown(runs: RunData[]) {
  console.log('\n  Outcome Distribution:');
  console.log('  ' + '-'.repeat(70));

  const outcomeCounts: Record<string, number> = {};
  runs.forEach(r => {
    outcomeCounts[r.outcome] = (outcomeCounts[r.outcome] || 0) + 1;
  });

  const sortedOutcomes = Object.entries(outcomeCounts).sort((a, b) => b[1] - a[1]);

  sortedOutcomes.forEach(([outcome, count]) => {
    const pct = (count / runs.length * 100).toFixed(1);
    const emoji = outcome === 'utopia' ? '🌟' :
                 outcome === 'dystopia' ? '🏛️' :
                 outcome === 'extinction' ? '💀' : '❓';

    console.log(`    ${emoji} ${outcome.padEnd(15)}: ${count.toString().padStart(3)} / ${runs.length} (${pct}%)`);
  });
}

// ============================================================================
// Main
// ============================================================================

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: npx tsx scripts/compareParadigmRuns.ts <directory>');
  console.error('Example: npx tsx scripts/compareParadigmRuns.ts monteCarloOutputs/');
  process.exit(1);
}

const dir = args[0];

if (!fs.existsSync(dir)) {
  console.error(`Error: Directory not found: ${dir}`);
  process.exit(1);
}

try {
  const runs = loadRuns(dir);

  if (runs.length === 0) {
    console.error('Error: No run files found in directory');
    process.exit(1);
  }

  console.log('\n' + '='.repeat(80));
  console.log('🔍 MULTI-RUN PARADIGM COMPARISON');
  console.log('='.repeat(80));
  console.log(`\n  Analyzing ${runs.length} simulation runs from ${dir}`);

  showOutcomeBreakdown(runs);
  showAggregateStats(runs);
  showFinalScoresMatrix(runs);

  console.log('\n\n' + '='.repeat(80));
  console.log('📊 PARADIGM TRAJECTORY COMPARISONS');
  console.log('='.repeat(80));

  showTrajectoryComparison(runs, 'western');
  showTrajectoryComparison(runs, 'development');
  showTrajectoryComparison(runs, 'ecological');
  showTrajectoryComparison(runs, 'indigenous');

  console.log('\n' + '='.repeat(80));
  console.log('✅ Comparison Complete');
  console.log('='.repeat(80));
  console.log();

} catch (error) {
  console.error('Error:', error);
  process.exit(1);
}

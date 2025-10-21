#!/usr/bin/env tsx
/**
 * Analyze democracy recovery in Monte Carlo runs
 * Check if Tiers 1-3 implementation improved Western Liberal scores
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

interface RunData {
  seed: number;
  totalMonths: number;
  outcome: string;
  finalPopulation: number;
  paradigmScores?: {
    westernLiberal?: number;
    development?: number;
    ecological?: number;
    indigenous?: number;
  };
  history?: {
    month: number;
    democracy?: number;
    civilLiberties?: number;
    ruleOfLaw?: number;
    westernLiberal?: number;
  }[];
}

const outputDir = 'monteCarloOutputs';

function loadRun(filename: string): RunData | null {
  try {
    const data = JSON.parse(readFileSync(join(outputDir, filename), 'utf-8'));
    return data;
  } catch (e) {
    return null;
  }
}

// Find all completed runs from most recent batch
const files = readdirSync(outputDir)
  .filter(f => f.startsWith('run_42') && f.endsWith('.json'))
  .sort()
  .reverse()
  .slice(0, 20); // Get latest 20 files (should be ~8 runs with history)

const runs: RunData[] = files
  .map(loadRun)
  .filter(r => r !== null) as RunData[];

console.log(`\n📊 DEMOCRACY RECOVERY ANALYSIS`);
console.log(`================================================================================\n`);
console.log(`Loaded ${runs.length} runs\n`);

// Group runs by unique seed
const runsBySeed = new Map<number, RunData>();
for (const run of runs) {
  if (!runsBySeed.has(run.seed)) {
    runsBySeed.set(run.seed, run);
  }
}

const uniqueRuns = Array.from(runsBySeed.values());
console.log(`Unique runs: ${uniqueRuns.length}\n`);

// Analyze Western Liberal scores
console.log(`=== WESTERN LIBERAL SCORES ===\n`);

const westernLiberalScores = uniqueRuns
  .map(r => r.paradigmScores?.westernLiberal ?? 0)
  .filter(s => s > 0);

if (westernLiberalScores.length > 0) {
  const avg = westernLiberalScores.reduce((a, b) => a + b, 0) / westernLiberalScores.length;
  const min = Math.min(...westernLiberalScores);
  const max = Math.max(...westernLiberalScores);
  const above30 = westernLiberalScores.filter(s => s >= 30).length;
  const above40 = westernLiberalScores.filter(s => s >= 40).length;

  console.log(`Average: ${avg.toFixed(1)}/100`);
  console.log(`Min: ${min.toFixed(1)}/100`);
  console.log(`Max: ${max.toFixed(1)}/100`);
  console.log(`Above 30/100 (hybrid threshold): ${above30}/${westernLiberalScores.length} (${(above30 / westernLiberalScores.length * 100).toFixed(0)}%)`);
  console.log(`Above 40/100 (moderate democracy): ${above40}/${westernLiberalScores.length} (${(above40 / westernLiberalScores.length * 100).toFixed(0)}%)\n`);
} else {
  console.log(`⚠️  No Western Liberal scores found\n`);
}

// Analyze democracy trajectories
console.log(`=== DEMOCRACY TRAJECTORIES ===\n`);

for (const run of uniqueRuns) {
  if (!run.history || run.history.length === 0) continue;

  const history = run.history;
  const democracyHistory = history.filter(h => h.democracy !== undefined);

  if (democracyHistory.length === 0) continue;

  const initial = democracyHistory[0].democracy ?? 0;
  const final = democracyHistory[democracyHistory.length - 1].democracy ?? 0;
  const change = final - initial;
  const changePercent = (change * 100).toFixed(1);

  const civilLibInitial = history[0].civilLiberties ?? 50;
  const civilLibFinal = history[history.length - 1].civilLiberties ?? 50;
  const libChange = civilLibFinal - civilLibInitial;

  console.log(`Run ${run.seed} (${run.outcome}):`);
  console.log(`  Democracy: ${(initial * 100).toFixed(1)}% → ${(final * 100).toFixed(1)}% (${changePercent > 0 ? '+' : ''}${changePercent}%)`);
  console.log(`  Civil Liberties: ${civilLibInitial.toFixed(0)} → ${civilLibFinal.toFixed(0)} (${libChange > 0 ? '+' : ''}${libChange.toFixed(0)})`);
  console.log(`  Western Liberal: ${(run.paradigmScores?.westernLiberal ?? 0).toFixed(1)}/100\n`);
}

// Analyze emergency response impact
console.log(`=== OUTCOME DISTRIBUTION ===\n`);

const outcomes = uniqueRuns.map(r => r.outcome);
const utopia = outcomes.filter(o => o === 'utopia').length;
const dystopia = outcomes.filter(o => o === 'dystopia' || o === 'control_dystopia' || o === 'ecological_dystopia').length;
const crisis = outcomes.filter(o => o === 'crisis_era').length;
const statusQuo = outcomes.filter(o => o === 'status_quo').length;
const other = outcomes.length - utopia - dystopia - crisis - statusQuo;

console.log(`Utopia: ${utopia}/${outcomes.length} (${(utopia / outcomes.length * 100).toFixed(0)}%)`);
console.log(`Dystopia: ${dystopia}/${outcomes.length} (${(dystopia / outcomes.length * 100).toFixed(0)}%)`);
console.log(`Crisis Era: ${crisis}/${outcomes.length} (${(crisis / outcomes.length * 100).toFixed(0)}%)`);
console.log(`Status Quo: ${statusQuo}/${outcomes.length} (${(statusQuo / outcomes.length * 100).toFixed(0)}%)`);
console.log(`Other: ${other}/${outcomes.length} (${(other / outcomes.length * 100).toFixed(0)}%)\n`);

console.log(`\n================================================================================`);
console.log(`📊 DEMOCRACY RECOVERY ANALYSIS COMPLETE`);
console.log(`================================================================================\n`);

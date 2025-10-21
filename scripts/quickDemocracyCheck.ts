#!/usr/bin/env tsx
/**
 * Quick democracy recovery check - analyze paradigmTrajectory data
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const outputDir = 'monteCarloOutputs';

// Get all JSON files from latest runs
const files = readdirSync(outputDir)
  .filter(f => f.startsWith('run_420') && f.endsWith('.json'))
  .sort()
  .reverse();

console.log(`\n📊 QUICK DEMOCRACY CHECK - Democracy Recovery Validation\n`);
console.log(`Found ${files.length} output files\n`);

// Extract unique run files (each run has multiple snapshots)
const runNumbers = new Set<number>();
for (const file of files) {
  const match = file.match(/run_(\d+)_/);
  if (match) {
    runNumbers.add(parseInt(match[1]));
  }
}

const uniqueRuns = Array.from(runNumbers).sort().reverse().slice(0, 10);
console.log(`Unique runs: ${uniqueRuns.join(', ')}\n`);

console.log(`=== WESTERN LIBERAL RECOVERY ===\n`);

const results: {
  run: number;
  outcome: string;
  westernInitial: number;
  westernFinal: number;
  westernChange: number;
  developmentFinal: number;
  ecologicalFinal: number;
}[] = [];

for (const runNum of uniqueRuns) {
  // Find the full output file for this run (not snapshot)
  const runFile = files.find(f => f.match(new RegExp(`run_${runNum}_.*\\.json$`)) && !f.includes('snapshot'));
  if (!runFile) continue;

  try {
    const data = JSON.parse(readFileSync(join(outputDir, runFile), 'utf-8'));

    if (!data.paradigmTrajectory || data.paradigmTrajectory.length === 0) {
      console.log(`⚠️  Run ${runNum}: No paradigm trajectory data`);
      continue;
    }

    const trajectory = data.paradigmTrajectory;
    const initial = trajectory[0];
    const final = trajectory[trajectory.length - 1];

    const westernInitial = initial.western ?? 0;
    const westernFinal = final.western ?? 0;
    const westernChange = westernFinal - westernInitial;

    results.push({
      run: runNum,
      outcome: data.outcome ?? 'unknown',
      westernInitial,
      westernFinal,
      westernChange,
      developmentFinal: final.development ?? 0,
      ecologicalFinal: final.ecological ?? 0,
    });

  } catch (e) {
    console.log(`⚠️  Error loading run ${runNum}: ${e}`);
  }
}

// Sort by Western Liberal final score
results.sort((a, b) => b.westernFinal - a.westernFinal);

for (const r of results) {
  const changeStr = r.westernChange >= 0 ? `+${r.westernChange.toFixed(1)}` : r.westernChange.toFixed(1);
  console.log(`Run ${r.run} [${r.outcome}]:`);
  console.log(`  Western Liberal: ${r.westernInitial.toFixed(1)} → ${r.westernFinal.toFixed(1)} (${changeStr})`);
  console.log(`  Development: ${r.developmentFinal.toFixed(1)}/100`);
  console.log(`  Ecological: ${r.ecologicalFinal.toFixed(1)}/100\n`);
}

console.log(`=== SUMMARY ===\n`);

if (results.length > 0) {
  const avgWestern = results.reduce((sum, r) => sum + r.westernFinal, 0) / results.length;
  const avgDevelopment = results.reduce((sum, r) => sum + r.developmentFinal, 0) / results.length;
  const avgEcological = results.reduce((sum, r) => sum + r.ecologicalFinal, 0) / results.length;

  const above30 = results.filter(r => r.westernFinal >= 30).length;
  const above20 = results.filter(r => r.westernFinal >= 20).length;
  const above10 = results.filter(r => r.westernFinal >= 10).length;

  console.log(`Runs analyzed: ${results.length}`);
  console.log(`\nAverage Scores:`);
  console.log(`  Western Liberal: ${avgWestern.toFixed(1)}/100`);
  console.log(`  Development: ${avgDevelopment.toFixed(1)}/100`);
  console.log(`  Ecological: ${avgEcological.toFixed(1)}/100`);

  console.log(`\nWestern Liberal Distribution:`);
  console.log(`  ≥30/100 (hybrid): ${above30}/${results.length} (${(above30 / results.length * 100).toFixed(0)}%)`);
  console.log(`  ≥20/100 (weak democracy): ${above20}/${results.length} (${(above20 / results.length * 100).toFixed(0)}%)`);
  console.log(`  ≥10/100 (very weak): ${above10}/${results.length} (${(above10 / results.length * 100).toFixed(0)}%)`);

  console.log(`\n📊 BASELINE COMPARISON (from previous validation):`);
  console.log(`  Before FIX #12: Western Liberal ~2/100 (100% of runs)`);
  console.log(`  After FIX #12: Western Liberal ~${avgWestern.toFixed(1)}/100 (${results.length} runs)`);
  console.log(`  Improvement: ${((avgWestern - 2) / 2 * 100).toFixed(0)}% increase`);
}

console.log(`\n================================================================================\n`);

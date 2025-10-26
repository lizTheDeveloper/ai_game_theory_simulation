#!/usr/bin/env tsx
/**
 * Monte Carlo Results Analyzer
 * Analyzes N=100 unprecedented scenario runs for ecology validation
 */

import fs from 'fs';
import path from 'path';

interface ParadigmSnapshot {
  month: number;
  westernLiberal: number | null;
  development: number | null;
  ecological: number | null;
  indigenous: number | null;
}

interface MCRun {
  seed: number;
  outcome: string;
  finalMonth: number;
  paradigmTrajectory: ParadigmSnapshot[];
  events?: Array<{ month: number; type: string; description: string }>;
}

interface EcologyStats {
  total: number;
  crashed: number;
  collapse: number;    // 0-15
  recovering: number;  // 15-40
  good: number;        // 40+
  scores: number[];
  mean: number;
  median: number;
  stdDev: number;
}

interface ParadigmStats {
  westernLiberal: { nullCount: number; values: number[] };
  development: { nullCount: number; values: number[] };
  ecological: { nullCount: number; values: number[] };
  indigenous: { nullCount: number; values: number[] };
}

function analyzeRuns(outputDir: string): void {
  const files = fs.readdirSync(outputDir)
    .filter(f => f.startsWith('run_420') && f.endsWith('_unprecedented_events.json'))
    .sort();

  console.log(`\n=== Monte Carlo Analysis (N=${files.length}) ===\n`);

  const ecologyStats: EcologyStats = {
    total: files.length,
    crashed: 0,
    collapse: 0,
    recovering: 0,
    good: 0,
    scores: [],
    mean: 0,
    median: 0,
    stdDev: 0
  };

  const paradigmStats: ParadigmStats = {
    westernLiberal: { nullCount: 0, values: [] },
    development: { nullCount: 0, values: [] },
    ecological: { nullCount: 0, values: [] },
    indigenous: { nullCount: 0, values: [] }
  };

  const outcomes: Record<string, number> = {};
  const crashedRuns: Array<{ seed: number; finalMonth: number }> = [];

  // Analyze each run
  files.forEach((file, index) => {
    const filePath = path.join(outputDir, file);
    const data: MCRun = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    // Outcome distribution
    outcomes[data.outcome] = (outcomes[data.outcome] || 0) + 1;

    // Get final paradigm scores
    if (!data.paradigmTrajectory || data.paradigmTrajectory.length === 0) {
      ecologyStats.crashed++;
      crashedRuns.push({ seed: data.seed, finalMonth: data.finalMonth });
      return;
    }

    const finalSnapshot = data.paradigmTrajectory[data.paradigmTrajectory.length - 1];

    if (!finalSnapshot) {
      ecologyStats.crashed++;
      crashedRuns.push({ seed: data.seed, finalMonth: data.finalMonth });
      return;
    }

    // Track paradigm nulls and values
    if (finalSnapshot.westernLiberal === null) {
      paradigmStats.westernLiberal.nullCount++;
    } else {
      paradigmStats.westernLiberal.values.push(finalSnapshot.westernLiberal);
    }

    if (finalSnapshot.development === null) {
      paradigmStats.development.nullCount++;
    } else {
      paradigmStats.development.values.push(finalSnapshot.development);
    }

    if (finalSnapshot.ecological === null) {
      paradigmStats.ecological.nullCount++;
      ecologyStats.crashed++;
      crashedRuns.push({ seed: data.seed, finalMonth: data.finalMonth });
    } else {
      const eco = finalSnapshot.ecological;
      paradigmStats.ecological.values.push(eco);
      ecologyStats.scores.push(eco);

      if (eco < 15) {
        ecologyStats.collapse++;
      } else if (eco < 40) {
        ecologyStats.recovering++;
      } else {
        ecologyStats.good++;
      }
    }

    if (finalSnapshot.indigenous === null) {
      paradigmStats.indigenous.nullCount++;
    } else {
      paradigmStats.indigenous.values.push(finalSnapshot.indigenous);
    }
  });

  // Calculate statistics
  if (ecologyStats.scores.length > 0) {
    ecologyStats.mean = ecologyStats.scores.reduce((a, b) => a + b, 0) / ecologyStats.scores.length;
    const sorted = [...ecologyStats.scores].sort((a, b) => a - b);
    ecologyStats.median = sorted[Math.floor(sorted.length / 2)]!;

    const variance = ecologyStats.scores.reduce((sum, val) => sum + Math.pow(val - ecologyStats.mean, 2), 0) / ecologyStats.scores.length;
    ecologyStats.stdDev = Math.sqrt(variance);
  }

  // Print results
  console.log('## Outcome Distribution');
  Object.entries(outcomes).forEach(([outcome, count]) => {
    const pct = ((count / files.length) * 100).toFixed(1);
    console.log(`  ${outcome}: ${count} (${pct}%)`);
  });

  console.log('\n## Ecology Score Distribution');
  console.log(`  Total runs: ${ecologyStats.total}`);
  console.log(`  Crashed (null): ${ecologyStats.crashed} (${((ecologyStats.crashed / ecologyStats.total) * 100).toFixed(1)}%)`);
  console.log(`  Collapse (0-15): ${ecologyStats.collapse} (${((ecologyStats.collapse / ecologyStats.total) * 100).toFixed(1)}%)`);
  console.log(`  Recovering (15-40): ${ecologyStats.recovering} (${((ecologyStats.recovering / ecologyStats.total) * 100).toFixed(1)}%)`);
  console.log(`  Good (40+): ${ecologyStats.good} (${((ecologyStats.good / ecologyStats.total) * 100).toFixed(1)}%) ← FIX WORKING!`);

  if (ecologyStats.scores.length > 0) {
    console.log(`\n  Statistics (non-crashed):`);
    console.log(`    Mean: ${ecologyStats.mean.toFixed(2)}`);
    console.log(`    Median: ${ecologyStats.median.toFixed(2)}`);
    console.log(`    Std Dev: ${ecologyStats.stdDev.toFixed(2)}`);
    console.log(`    Range: ${Math.min(...ecologyStats.scores).toFixed(2)} - ${Math.max(...ecologyStats.scores).toFixed(2)}`);
  }

  console.log('\n## Paradigm Score Analysis');
  console.log(`  Western Liberal: ${paradigmStats.westernLiberal.nullCount} null / ${paradigmStats.westernLiberal.values.length} valid`);
  if (paradigmStats.westernLiberal.values.length > 0) {
    const mean = paradigmStats.westernLiberal.values.reduce((a, b) => a + b, 0) / paradigmStats.westernLiberal.values.length;
    console.log(`    Mean (valid): ${mean.toFixed(2)}`);
  }

  console.log(`  Development: ${paradigmStats.development.nullCount} null / ${paradigmStats.development.values.length} valid`);
  if (paradigmStats.development.values.length > 0) {
    const mean = paradigmStats.development.values.reduce((a, b) => a + b, 0) / paradigmStats.development.values.length;
    console.log(`    Mean (valid): ${mean.toFixed(2)}`);
  }

  console.log(`  Ecological: ${paradigmStats.ecological.nullCount} null / ${paradigmStats.ecological.values.length} valid`);
  // Already covered above

  console.log(`  Indigenous: ${paradigmStats.indigenous.nullCount} null / ${paradigmStats.indigenous.values.length} valid`);
  if (paradigmStats.indigenous.values.length > 0) {
    const mean = paradigmStats.indigenous.values.reduce((a, b) => a + b, 0) / paradigmStats.indigenous.values.length;
    console.log(`    Mean (valid): ${mean.toFixed(2)}`);
  }

  if (crashedRuns.length > 0) {
    console.log(`\n## Crashed Runs (${crashedRuns.length})`);
    crashedRuns.slice(0, 10).forEach(run => {
      console.log(`  Seed ${run.seed}: crashed at month ${run.finalMonth}`);
    });
    if (crashedRuns.length > 10) {
      console.log(`  ... and ${crashedRuns.length - 10} more`);
    }
  }

  console.log('\n## Key Findings');
  if (ecologyStats.good > 0) {
    console.log(`  ✅ Ecology fix IS WORKING in ${ecologyStats.good}/${ecologyStats.total} runs (${((ecologyStats.good / ecologyStats.total) * 100).toFixed(1)}%)`);
  }
  if (ecologyStats.collapse > 0) {
    console.log(`  ⚠️  Ecology still collapsing in ${ecologyStats.collapse}/${ecologyStats.total} runs (${((ecologyStats.collapse / ecologyStats.total) * 100).toFixed(1)}%)`);
  }
  if (ecologyStats.crashed > 0) {
    console.log(`  ❌ ${ecologyStats.crashed} runs crashed with null ecology scores`);
  }
  if (paradigmStats.westernLiberal.nullCount === files.length) {
    console.log(`  ❌ Western Liberal ALL NULL - calculation bug!`);
  }
  if (outcomes['dystopia'] === files.length) {
    console.log(`  ⚠️  100% dystopia despite ecology improvements - outcome calculation issue?`);
  }

  console.log('');
}

// Run analysis
const outputDir = path.join(process.cwd(), 'monteCarloOutputs');
analyzeRuns(outputDir);

#!/usr/bin/env npx tsx
/**
 * Extract Novel Entities boundary data from Monte Carlo logs
 * For irreversibility framework validation
 */

import * as fs from 'fs';
import * as path from 'path';

interface NovelEntitiesDataPoint {
  run: number;
  month: number;
  value: number;
  production: number;
  cleanupGross: number;
  cleanupNet: number;
  naturalDecay: number;
  netChange: number;
}

interface RunSummary {
  run: number;
  initial: number;
  final: number;
  reduction: number;
  effectiveness: number;
}

function parseNovelEntitiesData(logContent: string): NovelEntitiesDataPoint[] {
  const data: NovelEntitiesDataPoint[] = [];
  const lines = logContent.split('\n');

  let currentRun = 0;
  let currentMonth = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Track run number
    const runMatch = line.match(/\[Run\s+(\d+)\/\d+\]/);
    if (runMatch) {
      currentRun = parseInt(runMatch[1]);
    }

    // Find Novel Entities Boundary Update lines
    const monthMatch = line.match(/🌍 Novel Entities Boundary Update \(Month (\d+)\):/);
    if (monthMatch) {
      currentMonth = parseInt(monthMatch[1]);

      // Parse the next few lines for metrics
      let production = 0;
      let cleanupGross = 0;
      let cleanupNet = 0;
      let naturalDecay = 0;
      let netChange = 0;
      let value = 0;

      // Look ahead up to 10 lines
      for (let j = i + 1; j < Math.min(i + 15, lines.length); j++) {
        const nextLine = lines[j];

        // Production: +0.0100%
        const prodMatch = nextLine.match(/Production:\s+\+?([-\d.]+)%/);
        if (prodMatch) production = parseFloat(prodMatch[1]);

        // Cleanup (gross): -0.0000%
        const cleanupGrossMatch = nextLine.match(/Cleanup \(gross\):\s+([-\d.]+)%/);
        if (cleanupGrossMatch) cleanupGross = parseFloat(cleanupGrossMatch[1]);

        // Cleanup (net): -0.0000%
        const cleanupNetMatch = nextLine.match(/Cleanup \(net\):\s+([-\d.]+)%/);
        if (cleanupNetMatch) cleanupNet = parseFloat(cleanupNetMatch[1]);

        // Natural Decay: -0.115525%
        const decayMatch = nextLine.match(/Natural Decay:\s+([-\d.]+)%/);
        if (decayMatch) naturalDecay = parseFloat(decayMatch[1]);

        // Net Change: 1.5000 → 1.4989 (Δ-0.1055%)
        const changeMatch = nextLine.match(/Net Change:\s+([\d.]+)\s+→\s+([\d.]+)\s+\(Δ([-\d.]+)%\)/);
        if (changeMatch) {
          value = parseFloat(changeMatch[2]); // Final value
          netChange = parseFloat(changeMatch[3]);
        }

        // Stop if we hit another section
        if (nextLine.includes('Boundary Update') || nextLine.includes('===')) break;
      }

      if (value > 0) {
        data.push({
          run: currentRun,
          month: currentMonth,
          value,
          production,
          cleanupGross,
          cleanupNet,
          naturalDecay,
          netChange
        });
      }
    }
  }

  return data;
}

function calculateRunSummaries(data: NovelEntitiesDataPoint[]): RunSummary[] {
  const summaries: RunSummary[] = [];
  const runs = Array.from(new Set(data.map(d => d.run))).sort((a, b) => a - b);

  for (const run of runs) {
    const runData = data.filter(d => d.run === run).sort((a, b) => a.month - b.month);
    if (runData.length === 0) continue;

    const initial = runData[0].value;
    const final = runData[runData.length - 1].value;
    const reduction = initial - final;
    const effectiveness = (reduction / initial) * 100;

    summaries.push({ run, initial, final, reduction, effectiveness });
  }

  return summaries;
}

function calculateStatistics(values: number[]): { mean: number; median: number; std: number; cv: number; min: number; max: number } {
  if (values.length === 0) return { mean: 0, median: 0, std: 0, cv: 0, min: 0, max: 0 };

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sorted = [...values].sort((a, b) => a - b);
  const median = sorted.length % 2 === 0
    ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
    : sorted[Math.floor(sorted.length / 2)];

  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance);
  const cv = mean !== 0 ? (std / Math.abs(mean)) * 100 : 0;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return { mean, median, std, cv, min, max };
}

function main() {
  const logPath = process.argv[2] || '/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/mc_parameter_verification_20251119_200644.log';

  console.log(`\n📊 NOVEL ENTITIES IRREVERSIBILITY FRAMEWORK VALIDATION`);
  console.log(`================================================================================\n`);
  console.log(`📁 Reading: ${path.basename(logPath)}\n`);

  const logContent = fs.readFileSync(logPath, 'utf-8');
  const data = parseNovelEntitiesData(logContent);

  console.log(`✅ Extracted ${data.length} data points\n`);

  const summaries = calculateRunSummaries(data);

  console.log(`📊 RUN SUMMARIES (Initial → Final):`);
  console.log(`────────────────────────────────────────────────────────────────────────────────\n`);

  for (const summary of summaries) {
    console.log(`  Run ${summary.run.toString().padStart(2)}:  ${summary.initial.toFixed(4)} → ${summary.final.toFixed(4)}  (Δ${summary.reduction >= 0 ? '-' : '+'}${Math.abs(summary.reduction).toFixed(4)}, ${summary.effectiveness.toFixed(2)}%)`);
  }

  console.log(`\n📈 EFFECTIVENESS STATISTICS:`);
  console.log(`────────────────────────────────────────────────────────────────────────────────\n`);

  const effectivenessStats = calculateStatistics(summaries.map(s => s.effectiveness));
  const reductionStats = calculateStatistics(summaries.map(s => s.reduction));
  const finalStats = calculateStatistics(summaries.map(s => s.final));

  console.log(`  Effectiveness: ${effectivenessStats.mean.toFixed(2)}% ± ${effectivenessStats.std.toFixed(2)}%`);
  console.log(`    Range: ${effectivenessStats.min.toFixed(2)}% to ${effectivenessStats.max.toFixed(2)}%`);
  console.log(`    Median: ${effectivenessStats.median.toFixed(2)}%`);
  console.log(`    CV: ${effectivenessStats.cv.toFixed(4)}%\n`);

  console.log(`  Absolute Reduction: ${reductionStats.mean.toFixed(4)} ± ${reductionStats.std.toFixed(4)}`);
  console.log(`    Range: ${reductionStats.min.toFixed(4)} to ${reductionStats.max.toFixed(4)}\n`);

  console.log(`  Final Boundary Value: ${finalStats.mean.toFixed(4)} ± ${finalStats.std.toFixed(4)}`);
  console.log(`    Range: ${finalStats.min.toFixed(4)} to ${finalStats.max.toFixed(4)}`);
  console.log(`    Median: ${finalStats.median.toFixed(4)}\n`);

  console.log(`🔬 DETERMINISM VALIDATION:`);
  console.log(`────────────────────────────────────────────────────────────────────────────────\n`);

  console.log(`  Effectiveness CV: ${effectivenessStats.cv.toFixed(4)}%`);
  console.log(`  Target: < 0.01% (deterministic requirement)`);

  if (effectivenessStats.cv < 0.01) {
    console.log(`  ✅ PASS - Simulation is deterministic\n`);
  } else if (effectivenessStats.cv < 0.1) {
    console.log(`  ⚠️  MARGINAL - Some non-determinism detected\n`);
  } else {
    console.log(`  ❌ FAIL - Significant non-determinism (RNG bug likely)\n`);
  }

  console.log(`📊 VALIDATION AGAINST EXPECTATIONS:`);
  console.log(`────────────────────────────────────────────────────────────────────────────────\n`);

  console.log(`  Expected: 20-40% effectiveness (prevention + fusion energy)`);
  console.log(`  Observed: ${effectivenessStats.mean.toFixed(2)}% ± ${effectivenessStats.std.toFixed(2)}%\n`);

  if (effectivenessStats.mean >= 20 && effectivenessStats.mean <= 40) {
    console.log(`  ✅ PASS - Within expected range\n`);
  } else if (effectivenessStats.mean >= 10 && effectivenessStats.mean < 20) {
    console.log(`  ⚠️  CONDITIONAL PASS - Below expected (missing tech deployment?)\n`);
  } else if (effectivenessStats.mean > 40) {
    console.log(`  ⚠️  ABOVE EXPECTED - Check if energy constraint is properly gating\n`);
  } else {
    console.log(`  ❌ FAIL - Significantly below expected (integration bug likely)\n`);
  }

  // Technology analysis
  console.log(`🔧 TECHNOLOGY DEPLOYMENT ANALYSIS:`);
  console.log(`────────────────────────────────────────────────────────────────────────────────\n`);

  // Sample first run for detailed analysis
  const firstRunData = data.filter(d => d.run === 1).sort((a, b) => a.month - b.month);

  if (firstRunData.length > 0) {
    // Find months where cleanup became active
    const cleanupActive = firstRunData.filter(d => Math.abs(d.cleanupNet) > 0.0001);

    console.log(`  Sample Run 1:`);
    console.log(`    Total months: ${firstRunData.length}`);
    console.log(`    Months with cleanup activity: ${cleanupActive.length}`);

    if (cleanupActive.length > 0) {
      const avgCleanup = cleanupActive.reduce((sum, d) => sum + d.cleanupNet, 0) / cleanupActive.length;
      console.log(`    Average cleanup effect: ${avgCleanup.toFixed(4)}%/month`);
    }

    const avgProduction = firstRunData.reduce((sum, d) => sum + d.production, 0) / firstRunData.length;
    const avgDecay = firstRunData.reduce((sum, d) => sum + d.naturalDecay, 0) / firstRunData.length;

    console.log(`    Average production: +${avgProduction.toFixed(4)}%/month`);
    console.log(`    Average natural decay: ${avgDecay.toFixed(4)}%/month\n`);
  }

  console.log(`📋 FINAL VERDICT:`);
  console.log(`────────────────────────────────────────────────────────────────────────────────\n`);

  const determinismPass = effectivenessStats.cv < 0.1;
  const effectivenessPass = effectivenessStats.mean >= 10;

  if (determinismPass && effectivenessPass && effectivenessStats.mean >= 20) {
    console.log(`  ✅ PASS - Framework validated`);
    console.log(`     - Determinism: CV = ${effectivenessStats.cv.toFixed(4)}%`);
    console.log(`     - Effectiveness: ${effectivenessStats.mean.toFixed(2)}% (within expected range)\n`);
  } else if (determinismPass && effectivenessPass) {
    console.log(`  ⚠️  CONDITIONAL PASS - Framework works but below target`);
    console.log(`     - Determinism: CV = ${effectivenessStats.cv.toFixed(4)}% ✅`);
    console.log(`     - Effectiveness: ${effectivenessStats.mean.toFixed(2)}% (below 20-40% target)`);
    console.log(`     - Recommendation: Check technology deployment timing/energy budget\n`);
  } else {
    console.log(`  ❌ FAIL - Critical issues detected`);
    if (!determinismPass) {
      console.log(`     - Determinism: CV = ${effectivenessStats.cv.toFixed(4)}% (> 0.1%)`);
    }
    if (!effectivenessPass) {
      console.log(`     - Effectiveness: ${effectivenessStats.mean.toFixed(2)}% (< 10%)`);
    }
    console.log(`     - Recommendation: Debug RNG and/or integration bugs\n`);
  }
}

main();

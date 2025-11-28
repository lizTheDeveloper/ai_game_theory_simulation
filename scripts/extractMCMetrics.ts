#!/usr/bin/env npx tsx
/**
 * Extract final metrics from Monte Carlo validation log for CV analysis
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';

interface RunMetrics {
  runNumber: number;
  population: number | null;
  gdp: number | null;
  aiCapabilityAvg: number | null;
  outcome: string | null;
  timeSeconds: number | null;
  finalMonth: number | null;

  // Planetary boundaries
  climate: number | null;
  biosphere: number | null;
  landSystem: number | null;
  freshwater: number | null;
  biogeochemical: number | null;
  novelEntities: number | null;

  // QoL tiers
  qolT0: number | null;
  qolT1: number | null;
  qolT2: number | null;
  qolT3: number | null;
  qolT4: number | null;
}

async function extractMetrics(logPath: string): Promise<RunMetrics[]> {
  const metrics: RunMetrics[] = Array.from({ length: 10 }, (_, i) => ({
    runNumber: i + 1,
    population: null,
    gdp: null,
    aiCapabilityAvg: null,
    outcome: null,
    timeSeconds: null,
    finalMonth: null,
    climate: null,
    biosphere: null,
    landSystem: null,
    freshwater: null,
    biogeochemical: null,
    novelEntities: null,
    qolT0: null,
    qolT1: null,
    qolT2: null,
    qolT3: null,
    qolT4: null,
  }));

  const fileStream = fs.createReadStream(logPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let currentRun = 0;
  let inFinalState = false;

  for await (const line of rl) {
    // Detect run completion
    const runMatch = line.match(/\[Run\s+(\d+)\/10\]\s+✅ Run \d+\/10 completed in ([\d.]+)s/);
    if (runMatch) {
      currentRun = parseInt(runMatch[1], 10);
      metrics[currentRun - 1].timeSeconds = parseFloat(runMatch[2]);
      continue;
    }

    // Detect outcome classification
    const outcomeMatch = line.match(/classifiedOutcome: (\w+)/);
    if (outcomeMatch && currentRun > 0) {
      metrics[currentRun - 1].outcome = outcomeMatch[1];
      continue;
    }

    // Extract final month (from last month marker before completion)
    const monthMatch = line.match(/\[Run\s+(\d+)\/10\]\s+\[Month (\d+)\]/);
    if (monthMatch) {
      const run = parseInt(monthMatch[1], 10);
      const month = parseInt(monthMatch[2], 10);
      if (!metrics[run - 1].finalMonth || month > metrics[run - 1].finalMonth!) {
        metrics[run - 1].finalMonth = month;
      }
      continue;
    }

    // Population (billion)
    const popMatch = line.match(/Population: ([\d.]+)B/);
    if (popMatch && currentRun > 0) {
      metrics[currentRun - 1].population = parseFloat(popMatch[1]);
      continue;
    }

    // Planetary boundaries (from early warning system)
    if (currentRun > 0) {
      const climateMatch = line.match(/climate_change[\s\S]*?Level: ([\d.]+)/);
      if (climateMatch) metrics[currentRun - 1].climate = parseFloat(climateMatch[1]);

      const bioMatch = line.match(/biosphere_integrity[\s\S]*?Level: ([\d.]+)/);
      if (bioMatch) metrics[currentRun - 1].biosphere = parseFloat(bioMatch[1]);

      const landMatch = line.match(/land_system_change[\s\S]*?Level: ([\d.]+)/);
      if (landMatch) metrics[currentRun - 1].landSystem = parseFloat(landMatch[1]);

      const waterMatch = line.match(/freshwater_change[\s\S]*?Level: ([\d.]+)/);
      if (waterMatch) metrics[currentRun - 1].freshwater = parseFloat(waterMatch[1]);

      const bgMatch = line.match(/biogeochemical_flows[\s\S]*?Level: ([\d.]+)/);
      if (bgMatch) metrics[currentRun - 1].biogeochemical = parseFloat(bgMatch[1]);

      const neMatch = line.match(/novel_entities[\s\S]*?Level: ([\d.]+)/);
      if (neMatch) metrics[currentRun - 1].novelEntities = parseFloat(neMatch[1]);
    }
  }

  return metrics;
}

function calculateStats(values: number[]): { mean: number; stdDev: number; cv: number; min: number; max: number } {
  if (values.length === 0) return { mean: 0, stdDev: 0, cv: 0, min: 0, max: 0 };

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean !== 0 ? (stdDev / Math.abs(mean)) * 100 : 0;
  const min = Math.min(...values);
  const max = Math.max(...values);

  return { mean, stdDev, cv, min, max };
}

async function main() {
  const logPath = process.argv[2] || '/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/mc_validation_20251126_210757.log';

  console.log(`\n📊 Extracting metrics from: ${path.basename(logPath)}\n`);

  const metrics = await extractMetrics(logPath);

  // Calculate CV for each metric
  const analyses: Array<{name: string; values: number[]; stats: ReturnType<typeof calculateStats>}> = [];

  const metricFields: Array<{name: string; key: keyof RunMetrics; unit: string}> = [
    { name: 'Population', key: 'population', unit: 'B' },
    { name: 'Time/Run', key: 'timeSeconds', unit: 's' },
    { name: 'Final Month', key: 'finalMonth', unit: 'mo' },
    { name: 'Climate Change', key: 'climate', unit: '×' },
    { name: 'Biosphere', key: 'biosphere', unit: '×' },
    { name: 'Land System', key: 'landSystem', unit: '×' },
    { name: 'Freshwater', key: 'freshwater', unit: '×' },
    { name: 'Biogeochemical', key: 'biogeochemical', unit: '×' },
    { name: 'Novel Entities', key: 'novelEntities', unit: '×' },
  ];

  for (const field of metricFields) {
    const values = metrics.map(m => m[field.key] as number).filter(v => v !== null);
    if (values.length > 0) {
      const stats = calculateStats(values);
      analyses.push({ name: field.name, values, stats });

      const cvStatus = stats.cv < 0.01 ? '✅ PASS' : stats.cv < 0.1 ? '⚠️ WARN' : '❌ FAIL';
      console.log(`${field.name.padEnd(20)} | Mean: ${stats.mean.toFixed(4)}${field.unit} | SD: ${stats.stdDev.toFixed(6)} | CV: ${stats.cv.toFixed(4)}% | ${cvStatus}`);
      console.log(`${' '.repeat(20)} | Range: [${stats.min.toFixed(4)}, ${stats.max.toFixed(4)}]`);
    } else {
      console.log(`${field.name.padEnd(20)} | ❌ NO DATA`);
    }
  }

  // Outcome distribution
  console.log('\n📈 Outcome Distribution:');
  const outcomes = metrics.map(m => m.outcome).filter(o => o !== null);
  const outcomeCounts = outcomes.reduce((acc, o) => {
    acc[o!] = (acc[o!] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  for (const [outcome, count] of Object.entries(outcomeCounts)) {
    const pct = (count / outcomes.length) * 100;
    console.log(`  ${outcome}: ${count}/10 (${pct.toFixed(1)}%)`);
  }

  // Determinism verdict
  console.log('\n🔍 DETERMINISM VERDICT:');
  const failedMetrics = analyses.filter(a => a.stats.cv >= 0.01);
  if (failedMetrics.length === 0) {
    console.log('✅ PASS - All metrics CV < 0.01% (deterministic)');
  } else {
    console.log(`❌ FAIL - ${failedMetrics.length} metrics with CV ≥ 0.01%:`);
    failedMetrics.forEach(m => {
      console.log(`  - ${m.name}: CV = ${m.stats.cv.toFixed(4)}%`);
    });
  }

  // Performance summary
  const timeStats = analyses.find(a => a.name === 'Time/Run');
  if (timeStats) {
    const totalTime = timeStats.values.reduce((a, b) => a + b, 0);
    console.log(`\n⏱️  PERFORMANCE:`);
    console.log(`  Total time: ${totalTime.toFixed(1)}s (${(totalTime / 60).toFixed(2)} min)`);
    console.log(`  Average: ${timeStats.stats.mean.toFixed(1)}s/run`);
    console.log(`  Range: [${timeStats.stats.min.toFixed(1)}s, ${timeStats.stats.max.toFixed(1)}s]`);
  }
}

main().catch(console.error);

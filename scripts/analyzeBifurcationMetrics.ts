#!/usr/bin/env npx tsx
/**
 * Analyze bifurcation metrics JSON files for MC validation
 */

import * as fs from 'fs';
import * as path from 'path';

interface BifurcationMetrics {
  seed: number;
  finalMonth: number;
  finalPopulation: number;
  populationBottleneck?: number;
  planetaryBoundaries: {
    climate_change: number;
    biosphere_integrity: number;
    land_system_change: number;
    freshwater_change: number;
    ocean_acidification: number;
    biogeochemical_flows: number;
    atmospheric_aerosol_loading: number;
    novel_entities: number;
    stratospheric_ozone_depletion: number;
  };
  aiCapabilities?: {
    physical: number;
    digital: number;
    cognitive: number;
    social: number;
    economic: number;
    research: number;
  };
  qualityOfLife?: {
    tier0: number;
    tier1: number;
    tier2: number;
    tier3: number;
    tier4: number;
  };
  outcome?: string;
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
  const outputDir = '/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/monteCarloOutputs';

  // Read seed42000 through seed42009 (runs 1-10)
  const metrics: BifurcationMetrics[] = [];

  for (let i = 0; i < 10; i++) {
    const filePath = path.join(outputDir, `bifurcation_metrics_seed4200${i}.json`);
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      metrics.push(data);
    } catch (err) {
      console.error(`❌ Failed to read ${filePath}: ${err}`);
    }
  }

  console.log(`\n📊 Loaded ${metrics.length}/10 bifurcation metrics files\n`);

  // Analyze key metrics
  const analyses: Array<{name: string; values: number[]; unit: string}> = [
    { name: 'Final Month', values: metrics.map(m => m.finalMonth), unit: 'mo' },
    { name: 'Final Population', values: metrics.map(m => m.finalPopulation), unit: 'B' },
    { name: 'Climate Change', values: metrics.map(m => m.planetaryBoundaries.climate_change), unit: '×' },
    { name: 'Biosphere', values: metrics.map(m => m.planetaryBoundaries.biosphere_integrity), unit: '×' },
    { name: 'Land System', values: metrics.map(m => m.planetaryBoundaries.land_system_change), unit: '×' },
    { name: 'Freshwater', values: metrics.map(m => m.planetaryBoundaries.freshwater_change), unit: '×' },
    { name: 'Biogeochemical', values: metrics.map(m => m.planetaryBoundaries.biogeochemical_flows), unit: '×' },
    { name: 'Novel Entities', values: metrics.map(m => m.planetaryBoundaries.novel_entities), unit: '×' },
  ];

  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('COEFFICIENT OF VARIATION ANALYSIS');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  let determinismPass = true;

  for (const analysis of analyses) {
    const stats = calculateStats(analysis.values);
    const cvStatus = stats.cv < 0.01 ? '✅ PASS' : stats.cv < 0.1 ? '⚠️ WARN' : '❌ FAIL';

    if (stats.cv >= 0.01) determinismPass = false;

    console.log(`${analysis.name.padEnd(20)} | Mean: ${stats.mean.toFixed(6)}${analysis.unit.padEnd(2)} | SD: ${stats.stdDev.toFixed(8)} | CV: ${stats.cv.toFixed(6)}% ${cvStatus}`);
    if (stats.cv >= 0.01) {
      console.log(`${' '.repeat(20)} | Range: [${stats.min.toFixed(6)}, ${stats.max.toFixed(6)}] - VARIATION DETECTED`);
    }
  }

  // QoL analysis if available
  if (metrics[0].qualityOfLife) {
    console.log('\n--- Quality of Life Tiers ---');
    const qolAnalyses = [
      { name: 'QoL T0', values: metrics.map(m => m.qualityOfLife?.tier0 ?? 0), unit: '%' },
      { name: 'QoL T1', values: metrics.map(m => m.qualityOfLife?.tier1 ?? 0), unit: '%' },
      { name: 'QoL T2', values: metrics.map(m => m.qualityOfLife?.tier2 ?? 0), unit: '%' },
      { name: 'QoL T3', values: metrics.map(m => m.qualityOfLife?.tier3 ?? 0), unit: '%' },
      { name: 'QoL T4', values: metrics.map(m => m.qualityOfLife?.tier4 ?? 0), unit: '%' },
    ];

    for (const analysis of qolAnalyses) {
      const stats = calculateStats(analysis.values);
      const cvStatus = stats.cv < 0.01 ? '✅' : stats.cv < 0.1 ? '⚠️' : '❌';
      console.log(`${analysis.name.padEnd(20)} | Mean: ${stats.mean.toFixed(4)}${analysis.unit.padEnd(2)} | CV: ${stats.cv.toFixed(6)}% ${cvStatus}`);
    }
  }

  // AI capabilities if available
  if (metrics[0].aiCapabilities) {
    console.log('\n--- AI Capabilities ---');
    const aiAnalyses = [
      { name: 'Physical', values: metrics.map(m => m.aiCapabilities?.physical ?? 0), unit: '' },
      { name: 'Digital', values: metrics.map(m => m.aiCapabilities?.digital ?? 0), unit: '' },
      { name: 'Cognitive', values: metrics.map(m => m.aiCapabilities?.cognitive ?? 0), unit: '' },
      { name: 'Social', values: metrics.map(m => m.aiCapabilities?.social ?? 0), unit: '' },
      { name: 'Economic', values: metrics.map(m => m.aiCapabilities?.economic ?? 0), unit: '' },
      { name: 'Research', values: metrics.map(m => m.aiCapabilities?.research ?? 0), unit: '' },
    ];

    for (const analysis of aiAnalyses) {
      const stats = calculateStats(analysis.values);
      const cvStatus = stats.cv < 0.01 ? '✅' : stats.cv < 0.1 ? '⚠️' : '❌';
      console.log(`${analysis.name.padEnd(20)} | Mean: ${stats.mean.toFixed(4)}${analysis.unit.padEnd(2)} | CV: ${stats.cv.toFixed(6)}% ${cvStatus}`);
    }
  }

  // Outcome distribution
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('OUTCOME DISTRIBUTION');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  const outcomeCounts: Record<string, number> = {};
  metrics.forEach(m => {
    const outcome = m.outcome || 'unknown';
    outcomeCounts[outcome] = (outcomeCounts[outcome] || 0) + 1;
  });

  for (const [outcome, count] of Object.entries(outcomeCounts)) {
    const pct = (count / metrics.length) * 100;
    console.log(`  ${outcome}: ${count}/10 (${pct.toFixed(1)}%)`);
  }

  // Early termination detection
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('EARLY TERMINATION ANALYSIS');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  const earlyTerminations = metrics.filter(m => m.finalMonth < 240);
  if (earlyTerminations.length > 0) {
    console.log(`⚠️ ${earlyTerminations.length}/10 runs terminated early (before month 240):\n`);
    earlyTerminations.forEach(m => {
      console.log(`  Seed ${m.seed}: Month ${m.finalMonth} (${((m.finalMonth / 240) * 100).toFixed(1)}% complete)`);
      console.log(`    Population: ${m.finalPopulation.toFixed(4)}B`);
      if (m.populationBottleneck) {
        console.log(`    Bottleneck: ${m.populationBottleneck.toFixed(4)}B`);
      }
    });
  } else {
    console.log('✅ All runs completed full 240 months (20 years)');
  }

  // Determinism verdict
  console.log('\n═══════════════════════════════════════════════════════════════════');
  console.log('DETERMINISM VERDICT');
  console.log('═══════════════════════════════════════════════════════════════════\n');

  if (determinismPass) {
    console.log('✅ PASS - All metrics have CV < 0.01% (simulation is deterministic)');
  } else {
    console.log('❌ FAIL - Non-determinism detected (CV ≥ 0.01%)');
    console.log('\nReasons for non-determinism:');
    console.log('  1. Early terminations cause different final states');
    console.log('  2. Check for Object.entries() iteration order issues');
    console.log('  3. Verify RNG is used for all random operations');
    console.log('  4. Check for race conditions or async operations');
  }

  console.log('\n═══════════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);

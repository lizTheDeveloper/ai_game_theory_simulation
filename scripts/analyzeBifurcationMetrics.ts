#!/usr/bin/env tsx
/**
 * Bifurcation Metrics Analysis Script
 *
 * Analyzes time series data from Monte Carlo runs to validate bifurcation variance amplification.
 *
 * Usage:
 *   npx tsx scripts/analyzeBifurcationMetrics.ts <directory>
 *
 * Example:
 *   npx tsx scripts/analyzeBifurcationMetrics.ts monteCarloOutputs/
 *
 * Outputs:
 * - Amplification distribution by system (environmental, social, economic, etc.)
 * - Pre/post regime shift variance analysis
 * - Threshold proximity patterns
 * - System multiplier recommendations
 *
 * @author Roy (Nov 13, 2025 - CRITICAL-1 instrumentation)
 */

import * as fs from 'fs';
import * as path from 'path';
import { assertFinite, assertDefined } from '../src/simulation/utils/assertions';

interface BifurcationMetrics {
  maxVarianceAmplification: number;
  avgDistanceToThresholds: number;
  regimeShiftCount: number;
  regimeShiftEvents: Array<{
    month: number;
    system: string;
    amplification: number;
  }>;
  amplificationTimeSeries: Array<{
    month: number;
    amplification: number;
    distanceToNearest: number;
    nearestSystem: string;
  }>;
}

interface RunData {
  seed: number;
  outcome: string;
  months: number;
  bifurcationMetrics: BifurcationMetrics;
}

interface SystemStats {
  count: number;
  avgAmplification: number;
  maxAmplification: number;
  avgDistance: number;
  minDistance: number;
}

interface AnalysisResults {
  totalRuns: number;
  avgMaxAmplification: number;
  avgRegimeShifts: number;
  systemStats: Record<string, SystemStats>;
  amplificationDistribution: {
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
  };
  distanceDistribution: {
    p50: number;
    p25: number;
    p10: number;
    p5: number;
    p1: number;
  };
  recommendations: string[];
}

function loadRunData(directory: string): RunData[] {
  const files = fs.readdirSync(directory).filter(f => f.startsWith('run_') && f.endsWith('.json'));

  const runs: RunData[] = [];

  for (const file of files) {
    const filePath = path.join(directory, file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (data.bifurcationMetrics && data.bifurcationMetrics.amplificationTimeSeries) {
      runs.push({
        seed: data.seed,
        outcome: data.outcome,
        months: data.totalMonths,
        bifurcationMetrics: data.bifurcationMetrics
      });
    }
  }

  return runs;
}

function calculatePercentile(values: number[], percentile: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

function analyzeRuns(runs: RunData[]): AnalysisResults {
  console.log(`\n📊 Analyzing ${runs.length} runs with bifurcation time series data...\n`);

  // Aggregate statistics
  const systemData: Record<string, { amplifications: number[]; distances: number[] }> = {};
  const allAmplifications: number[] = [];
  const allDistances: number[] = [];

  let totalMaxAmplification = 0;
  let totalRegimeShifts = 0;

  for (const run of runs) {
    totalMaxAmplification += run.bifurcationMetrics.maxVarianceAmplification;
    totalRegimeShifts += (run.bifurcationMetrics.regimeShiftCount ?? 0);

    for (const point of run.bifurcationMetrics.amplificationTimeSeries) {
      const system = point.nearestSystem;

      if (!systemData[system]) {
        systemData[system] = { amplifications: [], distances: [] };
      }

      systemData[system].amplifications.push(point.amplification);
      systemData[system].distances.push(point.distanceToNearest);

      allAmplifications.push(point.amplification);
      allDistances.push(point.distanceToNearest);
    }
  }

  // Calculate system statistics
  const systemStats: Record<string, SystemStats> = {};

  for (const [system, data] of Object.entries(systemData)) {
    const avgAmplification = data.amplifications.reduce((a, b) => a + b, 0) / data.amplifications.length;
    const maxAmplification = Math.max(...data.amplifications);
    const avgDistance = data.distances.reduce((a, b) => a + b, 0) / data.distances.length;
    const minDistance = Math.min(...data.distances);

    systemStats[system] = {
      count: data.amplifications.length,
      avgAmplification: assertFinite(avgAmplification, {
        location: 'analyzeRuns',
        valueName: 'avgAmplification',
        additionalInfo: { system }
      }),
      maxAmplification: assertFinite(maxAmplification, {
        location: 'analyzeRuns',
        valueName: 'maxAmplification',
        additionalInfo: { system }
      }),
      avgDistance: assertFinite(avgDistance, {
        location: 'analyzeRuns',
        valueName: 'avgDistance',
        additionalInfo: { system }
      }),
      minDistance: assertFinite(minDistance, {
        location: 'analyzeRuns',
        valueName: 'minDistance',
        additionalInfo: { system }
      })
    };
  }

  // Calculate distributions
  const amplificationDistribution = {
    p50: calculatePercentile(allAmplifications, 50),
    p75: calculatePercentile(allAmplifications, 75),
    p90: calculatePercentile(allAmplifications, 90),
    p95: calculatePercentile(allAmplifications, 95),
    p99: calculatePercentile(allAmplifications, 99)
  };

  const distanceDistribution = {
    p50: calculatePercentile(allDistances, 50),
    p25: calculatePercentile(allDistances, 25),
    p10: calculatePercentile(allDistances, 10),
    p5: calculatePercentile(allDistances, 5),
    p1: calculatePercentile(allDistances, 1)
  };

  // Generate recommendations
  const recommendations: string[] = [];

  const avgMaxAmp = totalMaxAmplification / runs.length;
  if (avgMaxAmp > 50) {
    recommendations.push(`⚠️  High average max amplification (${avgMaxAmp.toFixed(2)}×) - consider reducing system multipliers`);
  }

  if (amplificationDistribution.p99 > 80) {
    recommendations.push(`⚠️  P99 amplification (${amplificationDistribution.p99.toFixed(2)}×) exceeds 80× - check for runaway amplification`);
  }

  // Check system-specific amplification
  const systemsByAmplification = Object.entries(systemStats)
    .sort((a, b) => b[1].avgAmplification - a[1].avgAmplification);

  for (const [system, stats] of systemsByAmplification.slice(0, 3)) {
    if (stats.avgAmplification > 10) {
      recommendations.push(`🔧 ${system} system: avg amplification ${stats.avgAmplification.toFixed(2)}× (consider reducing multiplier)`);
    }
  }

  return {
    totalRuns: runs.length,
    avgMaxAmplification: avgMaxAmp,
    avgRegimeShifts: totalRegimeShifts / runs.length,
    systemStats,
    amplificationDistribution,
    distanceDistribution,
    recommendations
  };
}

function printResults(results: AnalysisResults): void {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`BIFURCATION VARIANCE AMPLIFICATION ANALYSIS`);
  console.log(`${'='.repeat(80)}\n`);

  console.log(`📈 OVERALL STATISTICS`);
  console.log(`  Total runs analyzed: ${results.totalRuns}`);
  console.log(`  Average max amplification: ${results.avgMaxAmplification.toFixed(2)}×`);
  console.log(`  Average regime shifts per run: ${results.avgRegimeShifts.toFixed(2)}`);

  console.log(`\n📊 AMPLIFICATION DISTRIBUTION (all months, all runs)`);
  console.log(`  P50 (median): ${results.amplificationDistribution.p50.toFixed(2)}×`);
  console.log(`  P75: ${results.amplificationDistribution.p75.toFixed(2)}×`);
  console.log(`  P90: ${results.amplificationDistribution.p90.toFixed(2)}×`);
  console.log(`  P95: ${results.amplificationDistribution.p95.toFixed(2)}×`);
  console.log(`  P99: ${results.amplificationDistribution.p99.toFixed(2)}×`);

  console.log(`\n📏 DISTANCE TO THRESHOLD DISTRIBUTION`);
  console.log(`  P50 (median): ${results.distanceDistribution.p50.toFixed(3)}`);
  console.log(`  P25: ${results.distanceDistribution.p25.toFixed(3)}`);
  console.log(`  P10: ${results.distanceDistribution.p10.toFixed(3)}`);
  console.log(`  P5: ${results.distanceDistribution.p5.toFixed(3)}`);
  console.log(`  P1: ${results.distanceDistribution.p1.toFixed(3)}`);

  console.log(`\n🎯 SYSTEM-SPECIFIC STATISTICS`);
  console.log(`  (When each system is nearest to threshold)\n`);

  const sortedSystems = Object.entries(results.systemStats)
    .sort((a, b) => b[1].avgAmplification - a[1].avgAmplification);

  for (const [system, stats] of sortedSystems) {
    console.log(`  ${system}:`);
    console.log(`    Observations: ${stats.count}`);
    console.log(`    Avg amplification: ${stats.avgAmplification.toFixed(2)}×`);
    console.log(`    Max amplification: ${stats.maxAmplification.toFixed(2)}×`);
    console.log(`    Avg distance: ${stats.avgDistance.toFixed(3)}`);
    console.log(`    Min distance: ${stats.minDistance.toFixed(3)}`);
    console.log(``);
  }

  if (results.recommendations.length > 0) {
    console.log(`\n💡 RECOMMENDATIONS\n`);
    for (const rec of results.recommendations) {
      console.log(`  ${rec}`);
    }
  }

  console.log(`\n${'='.repeat(80)}\n`);
}

// Main execution
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: npx tsx scripts/analyzeBifurcationMetrics.ts <directory>');
  console.error('Example: npx tsx scripts/analyzeBifurcationMetrics.ts monteCarloOutputs/');
  process.exit(1);
}

const directory = args[0];
if (!fs.existsSync(directory)) {
  console.error(`❌ Directory not found: ${directory}`);
  process.exit(1);
}

const runs = loadRunData(directory);
if (runs.length === 0) {
  console.error(`❌ No run data with bifurcation metrics found in ${directory}`);
  console.error(`   Ensure files match pattern: run_*_*.json with bifurcationMetrics field`);
  process.exit(1);
}

const results = analyzeRuns(runs);
printResults(results);

// Export results to JSON
const outputFile = path.join(directory, 'bifurcation_analysis_results.json');
fs.writeFileSync(outputFile, JSON.stringify(results, null, 2), 'utf8');
console.log(`✅ Analysis results saved to: ${outputFile}\n`);

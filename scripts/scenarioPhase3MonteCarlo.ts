/**
 * Scenario Phase 3 Monte Carlo Runner
 *
 * Created: November 10, 2025
 * Purpose: Run Monte Carlo validation (N≥10) for all 6 government priority scenarios
 * Context: Scenario Analysis Framework Phase 3 - Core Governance Scenarios
 *
 * This script tests individual governance dimensions in isolation to identify
 * which enable spiral activation.
 *
 * Research Foundation:
 * - research/scenario_phase3_parameter_validation_20251110.md (parameter validation)
 * - reviews/god_mode_spiral_diagnostics_20251110.md (Phase 1 findings)
 */

import { runScenario } from './scenarioRunner';
import { ScenarioResult } from '../src/types/scenarios';
import * as fs from 'fs';

/**
 * Phase 3 government priority scenarios
 */
const PHASE3_SCENARIOS = [
  'climate-first',
  'equality-first',
  'ai-alignment-first',
  'democratic-participation',
  'scientific-acceleration',
  'authoritarian-efficiency',
] as const;

/**
 * Monte Carlo configuration
 */
const MONTE_CARLO_N = 10; // Number of runs per scenario
const BASE_SEED = 1000; // Starting seed
const MAX_MONTHS = 360; // 30 years
const BASELINE_SCENARIO = 'god-mode'; // Comparison baseline

/**
 * Run Monte Carlo validation for a single scenario
 */
function runMonteCarloScenario(
  scenarioId: string,
  n: number,
  baseSeed: number,
  maxMonths: number
): ScenarioResult[] {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🎲 MONTE CARLO: ${scenarioId}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`Runs: ${n}`);
  console.log(`Base seed: ${baseSeed}`);
  console.log(`Max months: ${maxMonths}\n`);

  const results: ScenarioResult[] = [];

  for (let i = 0; i < n; i++) {
    const seed = baseSeed + i;
    console.log(`\n--- Run ${i + 1}/${n} (seed: ${seed}) ---\n`);

    try {
      const result = runScenario(scenarioId, seed, maxMonths);
      results.push(result);

      // Log summary for this run
      console.log(`\n✅ Run ${i + 1} complete:`);
      console.log(`   Outcome: ${result.outcome}`);
      console.log(`   Spirals active: ${result.spiralActivation.activeUpwardSpirals.length}/6`);
      console.log(`   Cascade strength: ${result.spiralActivation.cascadeStrength.toFixed(2)}`);
      console.log(`   Trust cascades: ${result.spiralActivation.trustCascadesTriggered}`);
      console.log(`   Final population: ${(result.finalPopulation / 1e9).toFixed(2)}B`);
    } catch (error) {
      console.error(`\n❌ Run ${i + 1} FAILED:`, error);
      // Continue with remaining runs
    }
  }

  return results;
}

/**
 * Compute aggregate statistics across Monte Carlo runs
 */
function computeStatistics(results: ScenarioResult[]): {
  spiralActivationRate: { [spiralName: string]: number };
  cascadeActivationRate: number;
  avgCascadeStrength: number;
  avgTrustCascades: number;
  avgFinalPopulation: number;
  avgQoL: number;
  avgTempDelta: number;
  outcomeDistribution: { [outcome: string]: number };
  coefficientOfVariation: {
    cascadeStrength: number;
    population: number;
    qol: number;
  };
} {
  const n = results.length;

  if (n === 0) {
    throw new Error('❌ No results to analyze');
  }

  // Spiral activation rates (fraction of runs where each spiral was active)
  const spiralCounts: { [name: string]: number } = {};
  const allSpiralNames = [
    'Cognitive',
    'Abundance',
    'Democratic',
    'Scientific',
    'Meaning',
    'Ecological',
  ];

  for (const name of allSpiralNames) {
    spiralCounts[name] = 0;
  }

  let cascadeCount = 0;
  let totalCascadeStrength = 0;
  let totalTrustCascades = 0;
  let totalPopulation = 0;
  let totalQoL = 0;
  let totalTempDelta = 0;

  const outcomeCounts: { [outcome: string]: number } = {};

  for (const result of results) {
    // Count spiral activations
    for (const spiralName of result.spiralActivation.activeUpwardSpirals) {
      spiralCounts[spiralName] = (spiralCounts[spiralName] || 0) + 1;
    }

    // Cascade activation
    if (result.spiralActivation.cascadeActive) {
      cascadeCount++;
    }

    // Aggregate metrics
    totalCascadeStrength += result.spiralActivation.cascadeStrength;
    totalTrustCascades += result.spiralActivation.trustCascadesTriggered;
    totalPopulation += result.finalPopulation;
    totalQoL += result.finalQoL.overallAvg;
    totalTempDelta += result.finalEnvironment.globalTempDelta;

    // Outcome distribution
    outcomeCounts[result.outcome] = (outcomeCounts[result.outcome] || 0) + 1;
  }

  // Compute averages
  const avgCascadeStrength = totalCascadeStrength / n;
  const avgTrustCascades = totalTrustCascades / n;
  const avgFinalPopulation = totalPopulation / n;
  const avgQoL = totalQoL / n;
  const avgTempDelta = totalTempDelta / n;

  // Compute coefficient of variation (CV = stddev / mean)
  const cascadeStrengths = results.map(r => r.spiralActivation.cascadeStrength);
  const populations = results.map(r => r.finalPopulation);
  const qols = results.map(r => r.finalQoL.overallAvg);

  const cv = {
    cascadeStrength: computeCV(cascadeStrengths),
    population: computeCV(populations),
    qol: computeCV(qols),
  };

  // Spiral activation rates (fraction)
  const spiralActivationRate: { [name: string]: number } = {};
  for (const name of allSpiralNames) {
    spiralActivationRate[name] = spiralCounts[name] / n;
  }

  return {
    spiralActivationRate,
    cascadeActivationRate: cascadeCount / n,
    avgCascadeStrength,
    avgTrustCascades,
    avgFinalPopulation,
    avgQoL,
    avgTempDelta,
    outcomeDistribution: outcomeCounts,
    coefficientOfVariation: cv,
  };
}

/**
 * Compute coefficient of variation (CV = stddev / mean)
 */
function computeCV(values: number[]): number {
  const n = values.length;
  if (n === 0) return NaN;

  const mean = values.reduce((a, b) => a + b, 0) / n;
  if (mean === 0) return NaN;

  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / n;
  const stddev = Math.sqrt(variance);

  return stddev / Math.abs(mean);
}

/**
 * Print statistics report
 */
function printStatistics(scenarioId: string, stats: ReturnType<typeof computeStatistics>) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📊 MONTE CARLO STATISTICS: ${scenarioId}`);
  console.log(`${'='.repeat(80)}\n`);

  console.log('🌀 SPIRAL ACTIVATION RATES:');
  for (const [name, rate] of Object.entries(stats.spiralActivationRate)) {
    const percentage = (rate * 100).toFixed(0);
    const bar = '█'.repeat(Math.floor(rate * 20));
    console.log(`   ${name.padEnd(12)} ${percentage.padStart(3)}% ${bar}`);
  }

  console.log(`\n🎯 CASCADE METRICS:`);
  console.log(`   Cascade activation rate: ${(stats.cascadeActivationRate * 100).toFixed(0)}%`);
  console.log(`   Avg cascade strength: ${stats.avgCascadeStrength.toFixed(3)}`);
  console.log(`   Avg trust cascades: ${stats.avgTrustCascades.toFixed(1)}`);

  console.log(`\n🌍 FINAL STATE:`);
  console.log(`   Avg final population: ${(stats.avgFinalPopulation / 1e9).toFixed(2)}B`);
  console.log(`   Avg QoL: ${(stats.avgQoL * 100).toFixed(1)}%`);
  console.log(`   Avg temp delta: ${stats.avgTempDelta >= 0 ? '+' : ''}${stats.avgTempDelta.toFixed(2)}°C`);

  console.log(`\n🎲 OUTCOME DISTRIBUTION:`);
  for (const [outcome, count] of Object.entries(stats.outcomeDistribution)) {
    const percentage = ((count / MONTE_CARLO_N) * 100).toFixed(0);
    console.log(`   ${outcome.padEnd(20)} ${percentage.padStart(3)}%`);
  }

  console.log(`\n📈 COEFFICIENT OF VARIATION (CV):`);
  console.log(`   Cascade strength: ${(stats.coefficientOfVariation.cascadeStrength * 100).toFixed(2)}%`);
  console.log(`   Population: ${(stats.coefficientOfVariation.population * 100).toFixed(2)}%`);
  console.log(`   QoL: ${(stats.coefficientOfVariation.qol * 100).toFixed(2)}%`);

  // Determinism check (CV < 0.01% indicates deterministic)
  if (stats.coefficientOfVariation.cascadeStrength < 0.0001) {
    console.log(`\n   ✅ DETERMINISTIC: Cascade strength CV < 0.01%`);
  } else {
    console.log(`\n   ⚠️  NON-DETERMINISTIC: CV > 0.01%`);
  }
}

/**
 * Main execution
 */
async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const logFile = `${__dirname}/../logs/scenario_phase3_mc_${timestamp}.log`;

  console.log(`\n${'='.repeat(80)}`);
  console.log(`🎯 SCENARIO ANALYSIS FRAMEWORK - PHASE 3`);
  console.log(`   Government Priority Scenarios - Monte Carlo Validation`);
  console.log(`${'='.repeat(80)}`);
  console.log(`\nScenarios: ${PHASE3_SCENARIOS.join(', ')}`);
  console.log(`Monte Carlo N: ${MONTE_CARLO_N}`);
  console.log(`Max months: ${MAX_MONTHS} (${(MAX_MONTHS / 12).toFixed(0)} years)`);
  console.log(`Base seed: ${BASE_SEED}`);
  console.log(`Log file: ${logFile}\n`);

  const allResults: { [scenarioId: string]: ScenarioResult[] } = {};
  const allStats: { [scenarioId: string]: ReturnType<typeof computeStatistics> } = {};

  // Run Monte Carlo for each scenario
  for (const scenarioId of PHASE3_SCENARIOS) {
    const results = runMonteCarloScenario(scenarioId, MONTE_CARLO_N, BASE_SEED, MAX_MONTHS);
    allResults[scenarioId] = results;

    if (results.length > 0) {
      const stats = computeStatistics(results);
      allStats[scenarioId] = stats;
      printStatistics(scenarioId, stats);
    } else {
      console.error(`\n❌ No successful runs for ${scenarioId}`);
    }
  }

  // Generate comparative analysis
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔬 COMPARATIVE ANALYSIS`);
  console.log(`${'='.repeat(80)}\n`);

  console.log('SPIRAL ACTIVATION COMPARISON (% of runs where spiral was active):\n');
  console.log('Scenario'.padEnd(30) + 'Cognitive Abundance Democratic Scientific Meaning Ecological CASCADE');
  console.log('-'.repeat(110));

  for (const scenarioId of PHASE3_SCENARIOS) {
    const stats = allStats[scenarioId];
    if (!stats) continue;

    const rates = stats.spiralActivationRate;
    const cascade = stats.cascadeActivationRate;

    const row =
      scenarioId.padEnd(30) +
      `${(rates.Cognitive * 100).toFixed(0).padStart(9)} ` +
      `${(rates.Abundance * 100).toFixed(0).padStart(9)} ` +
      `${(rates.Democratic * 100).toFixed(0).padStart(10)} ` +
      `${(rates.Scientific * 100).toFixed(0).padStart(10)} ` +
      `${(rates.Meaning * 100).toFixed(0).padStart(7)} ` +
      `${(rates.Ecological * 100).toFixed(0).padStart(10)} ` +
      `${(cascade * 100).toFixed(0).padStart(7)}%`;

    console.log(row);
  }

  // Key findings
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔍 KEY FINDINGS`);
  console.log(`${'='.repeat(80)}\n`);

  // Which scenarios activated the most spirals?
  const avgSpiralsActive: { [scenarioId: string]: number } = {};
  for (const scenarioId of PHASE3_SCENARIOS) {
    const stats = allStats[scenarioId];
    if (!stats) continue;

    const avg =
      stats.spiralActivationRate.Cognitive +
      stats.spiralActivationRate.Abundance +
      stats.spiralActivationRate.Democratic +
      stats.spiralActivationRate.Scientific +
      stats.spiralActivationRate.Meaning +
      stats.spiralActivationRate.Ecological;

    avgSpiralsActive[scenarioId] = avg;
  }

  const sortedBySpirals = Object.entries(avgSpiralsActive).sort((a, b) => b[1] - a[1]);

  console.log('Scenarios ranked by spiral activation (sum of activation rates):');
  for (let i = 0; i < sortedBySpirals.length; i++) {
    const [scenarioId, sum] = sortedBySpirals[i];
    console.log(`   ${i + 1}. ${scenarioId.padEnd(30)} ${sum.toFixed(2)} spirals avg`);
  }

  // Which governance dimensions enable spirals?
  console.log(`\nGovernance dimensions that enable spiral activation:`);
  for (const scenarioId of PHASE3_SCENARIOS) {
    const stats = allStats[scenarioId];
    if (!stats) continue;

    const activatedSpirals = Object.entries(stats.spiralActivationRate)
      .filter(([_, rate]) => rate > 0.5) // Active in >50% of runs
      .map(([name]) => name);

    if (activatedSpirals.length > 0) {
      console.log(`   ${scenarioId.padEnd(30)} → ${activatedSpirals.join(', ')}`);
    } else {
      console.log(`   ${scenarioId.padEnd(30)} → (no spirals >50%)`);
    }
  }

  // Save results to JSON
  const resultsFile = logFile.replace('.log', '_results.json');
  fs.writeFileSync(
    resultsFile,
    JSON.stringify(
      {
        metadata: {
          timestamp,
          monteCarloN: MONTE_CARLO_N,
          baseSeed: BASE_SEED,
          maxMonths: MAX_MONTHS,
          scenarios: PHASE3_SCENARIOS,
        },
        results: allResults,
        statistics: allStats,
        rankings: {
          bySpiralsActive: sortedBySpirals,
        },
      },
      null,
      2
    )
  );

  console.log(`\n✅ Results saved to: ${resultsFile}`);
  console.log(`\n${'='.repeat(80)}`);
  console.log(`✅ PHASE 3 MONTE CARLO COMPLETE`);
  console.log(`${'='.repeat(80)}\n`);
}

// Execute
main().catch(error => {
  console.error('❌ FATAL ERROR:', error);
  process.exit(1);
});

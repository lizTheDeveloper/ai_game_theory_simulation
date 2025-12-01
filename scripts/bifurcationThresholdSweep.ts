#!/usr/bin/env tsx
/**
 * Bifurcation Threshold Sensitivity Analysis (M-1)
 *
 * Research Question: Does bifurcation threshold value affect outcome distributions?
 *
 * Current default: 0.60 (tech deployment threshold for bifurcation)
 * Empirical range: 0.05-0.25 (Rogers 1962, Centola 2018)
 * Current value is 3-6× HIGHER than empirical
 *
 * Experiment:
 * - Sweep bifurcationThreshold from 0.10 to 0.60 (6 values)
 * - N=10 runs per threshold (total N=60)
 * - Track: outcome distribution, mortality range, bifurcation rate
 *
 * Analysis:
 * - If outcomes barely change: Current 0.60 is fine (conservative)
 * - If outcomes change significantly: Need empirical justification
 *
 * @see /research/technology_bifurcation_threshold_validation_20251130.md
 * @see /reviews/research_source_validation_session25_20251201.md
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState, ParameterSweepConfig } from '../src/simulation/initialization';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const THRESHOLD_VALUES = [0.10, 0.20, 0.30, 0.40, 0.50, 0.60];
const N_RUNS_PER_THRESHOLD = 10;
const BASE_SEED = 42;
const SIMULATION_MONTHS = 120;  // 10 years

// ============================================================================
// RNG UTILITY
// ============================================================================

function createSeededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

// ============================================================================
// OUTCOME CLASSIFICATION
// ============================================================================

function classifyOutcome(state: any): string {
  // Use god mode classification logic
  const qolAvg = Object.values(state.qualityOfLife).reduce((sum: number, tier: any) => sum + tier.score, 0) / 5;
  const mortality = 1 - (state.humanPopulationSystem.population / state.humanPopulationSystem.populationHistory[0]);
  const boundaries = state.planetaryBoundaries;

  // Extinction
  if (state.humanPopulationSystem.population < 0.1 || mortality > 0.99) {
    return 'extinction';
  }

  // Catastrophic collapse
  if (mortality > 0.50 || qolAvg < 0.20) {
    return 'catastrophic-collapse';
  }

  // Severe collapse
  if (mortality > 0.30 || qolAvg < 0.40) {
    return 'severe-collapse';
  }

  // Dystopia
  if (qolAvg < 0.60) {
    return 'dystopia';
  }

  // Check for utopia (all boundaries safe + high QoL)
  const boundariesSafe = [
    boundaries.climateChange.overshootPercentage,
    boundaries.biosphereIntegrity.overshootPercentage,
    boundaries.landSystemChange.overshootPercentage,
    boundaries.freshwaterUse.overshootPercentage,
    boundaries.biogeochemicalFlows.nitrogen.overshootPercentage,
    boundaries.biogeochemicalFlows.phosphorus.overshootPercentage,
    boundaries.oceanAcidification.overshootPercentage,
    boundaries.atmosphericAerosolLoading.overshootPercentage,
    boundaries.stratosphericOzoneDepletion.overshootPercentage
  ].every(v => v <= 1.0);

  if (boundariesSafe && qolAvg >= 0.85) {
    return 'utopia';
  }

  if (boundariesSafe && qolAvg >= 0.70) {
    return 'flourishing';
  }

  // Status quo
  return 'status-quo';
}

// ============================================================================
// BIFURCATION EVENT TRACKING
// ============================================================================

interface BifurcationEvent {
  month: number;
  type: string;
  regime: string;
}

function extractBifurcationEvents(state: any): BifurcationEvent[] {
  // Extract regime shift history from bifurcation state
  if (!state.bifurcationState?.regimeShiftHistory) {
    return [];
  }
  return state.bifurcationState.regimeShiftHistory.map((shift: any) => ({
    month: shift.month,
    type: shift.trigger,
    regime: shift.toRegime
  }));
}

// ============================================================================
// RUN SIMULATION
// ============================================================================

interface RunResult {
  thresholdValue: number;
  runId: number;
  outcome: string;
  finalPopulation: number;
  mortalityRate: number;
  qolAverage: number;
  bifurcationEvents: number;
  regimeShifts: string[];
  finalTemperature: number;
  boundaryOvershoot: number;
}

async function runSimulation(
  thresholdValue: number,
  runId: number,
  rng: () => number
): Promise<RunResult> {
  // Create parameter sweep config with threshold override
  const parameterSweepConfig: ParameterSweepConfig = {
    bifurcationThreshold: thresholdValue
  };

  // Create initial state (use 'historical' scenario - defensible parameters)
  const state = createDefaultInitialState(
    rng,
    'historical',
    undefined, // alignmentDynamicsConfig
    undefined, // climatePriorityConfig
    undefined, // thresholdSliders
    undefined, // speculativeScenario
    undefined, // historicalOverrides
    parameterSweepConfig
  );

  const engine = new SimulationEngine();
  const initialPopulation = state.humanPopulationSystem.population;

  // Run simulation
  while (state.currentMonth < SIMULATION_MONTHS) {
    engine.step(state, rng);
  }

  // Extract metrics
  const qolAvg = Object.values(state.qualityOfLife).reduce((sum: number, tier: any) => sum + tier.score, 0) / 5;
  const mortality = 1 - (state.humanPopulationSystem.population / initialPopulation);
  const bifurcationEvents = extractBifurcationEvents(state);
  const outcome = classifyOutcome(state);

  // Calculate average boundary overshoot
  const boundaries = state.planetaryBoundaries;
  const boundaryOvershoot = (
    boundaries.climateChange.overshootPercentage +
    boundaries.biosphereIntegrity.overshootPercentage +
    boundaries.landSystemChange.overshootPercentage +
    boundaries.freshwaterUse.overshootPercentage +
    boundaries.biogeochemicalFlows.nitrogen.overshootPercentage +
    boundaries.biogeochemicalFlows.phosphorus.overshootPercentage +
    boundaries.oceanAcidification.overshootPercentage +
    boundaries.atmosphericAerosolLoading.overshootPercentage +
    boundaries.stratosphericOzoneDepletion.overshootPercentage
  ) / 9;

  return {
    thresholdValue,
    runId,
    outcome,
    finalPopulation: state.humanPopulationSystem.population,
    mortalityRate: mortality,
    qolAverage: qolAvg,
    bifurcationEvents: bifurcationEvents.length,
    regimeShifts: bifurcationEvents.map(e => e.regime),
    finalTemperature: state.environmentalSystem.temperature,
    boundaryOvershoot
  };
}

// ============================================================================
// STATISTICS
// ============================================================================

function calculateStats(values: number[]): { mean: number; median: number; min: number; max: number; std: number } {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const median = sorted[Math.floor(sorted.length / 2)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  const std = Math.sqrt(variance);
  return { mean, median, min, max, std };
}

function countOutcomes(results: RunResult[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const result of results) {
    counts[result.outcome] = (counts[result.outcome] || 0) + 1;
  }
  return counts;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('='.repeat(80));
  console.log('📊 BIFURCATION THRESHOLD SENSITIVITY ANALYSIS (M-1)');
  console.log('='.repeat(80));
  console.log(`\nExperiment Design:`);
  console.log(`  Threshold values: ${THRESHOLD_VALUES.join(', ')}`);
  console.log(`  N per threshold: ${N_RUNS_PER_THRESHOLD}`);
  console.log(`  Total runs: ${THRESHOLD_VALUES.length * N_RUNS_PER_THRESHOLD}`);
  console.log(`  Simulation length: ${SIMULATION_MONTHS} months (${SIMULATION_MONTHS / 12} years)`);
  console.log(`\nResearch Context:`);
  console.log(`  Current default: 0.60`);
  console.log(`  Empirical range: 0.05-0.25 (Rogers 1962, Centola 2018)`);
  console.log(`  Current is 3-6× HIGHER than empirical`);
  console.log(`\nQuestion: Does threshold value affect outcome distributions?\n`);

  const allResults: RunResult[] = [];
  const startTime = Date.now();

  // Run sweeps
  for (const threshold of THRESHOLD_VALUES) {
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`🔬 Testing threshold = ${threshold.toFixed(2)}`);
    console.log(`${'─'.repeat(80)}`);

    const thresholdResults: RunResult[] = [];

    for (let i = 0; i < N_RUNS_PER_THRESHOLD; i++) {
      const runId = THRESHOLD_VALUES.indexOf(threshold) * N_RUNS_PER_THRESHOLD + i;
      const seed = BASE_SEED + runId;
      const rng = createSeededRng(seed);

      console.log(`  Run ${i + 1}/${N_RUNS_PER_THRESHOLD} (seed=${seed})...`);

      const result = await runSimulation(threshold, runId, rng);
      thresholdResults.push(result);
      allResults.push(result);

      console.log(`    → ${result.outcome} (mortality=${(result.mortalityRate * 100).toFixed(1)}%, QoL=${(result.qolAverage * 100).toFixed(1)}%)`);
    }

    // Per-threshold summary
    console.log(`\n  Summary for threshold = ${threshold.toFixed(2)}:`);
    const outcomeCounts = countOutcomes(thresholdResults);
    Object.entries(outcomeCounts).forEach(([outcome, count]) => {
      const pct = (count / N_RUNS_PER_THRESHOLD * 100).toFixed(1);
      console.log(`    ${outcome}: ${count}/${N_RUNS_PER_THRESHOLD} (${pct}%)`);
    });

    const mortalityStats = calculateStats(thresholdResults.map(r => r.mortalityRate));
    console.log(`    Mortality: ${(mortalityStats.mean * 100).toFixed(1)}% ± ${(mortalityStats.std * 100).toFixed(1)}%`);

    const bifurcationStats = calculateStats(thresholdResults.map(r => r.bifurcationEvents));
    console.log(`    Bifurcation events: ${bifurcationStats.mean.toFixed(1)} ± ${bifurcationStats.std.toFixed(1)}`);
  }

  const elapsedTime = (Date.now() - startTime) / 1000;

  // ============================================================================
  // CROSS-THRESHOLD ANALYSIS
  // ============================================================================

  console.log(`\n${'='.repeat(80)}`);
  console.log('📈 CROSS-THRESHOLD ANALYSIS');
  console.log('='.repeat(80));

  console.log(`\nOutcome Distribution by Threshold:\n`);
  console.log(`Threshold | Utopia | Flourish | StatusQuo | Dystopia | Collapse | Extinction`);
  console.log(`----------|--------|----------|-----------|----------|----------|------------`);

  for (const threshold of THRESHOLD_VALUES) {
    const thresholdResults = allResults.filter(r => r.thresholdValue === threshold);
    const counts = countOutcomes(thresholdResults);

    const utopia = counts['utopia'] || 0;
    const flourish = counts['flourishing'] || 0;
    const statusQuo = counts['status-quo'] || 0;
    const dystopia = counts['dystopia'] || 0;
    const collapse = (counts['severe-collapse'] || 0) + (counts['catastrophic-collapse'] || 0);
    const extinction = counts['extinction'] || 0;

    console.log(
      `${threshold.toFixed(2).padEnd(10)}| ` +
      `${String(utopia).padEnd(7)}| ` +
      `${String(flourish).padEnd(9)}| ` +
      `${String(statusQuo).padEnd(10)}| ` +
      `${String(dystopia).padEnd(9)}| ` +
      `${String(collapse).padEnd(9)}| ` +
      `${String(extinction).padEnd(11)}`
    );
  }

  console.log(`\nMortality Rate by Threshold:\n`);
  console.log(`Threshold | Mean   | Median | Min    | Max    | StdDev`);
  console.log(`----------|--------|--------|--------|--------|--------`);

  for (const threshold of THRESHOLD_VALUES) {
    const thresholdResults = allResults.filter(r => r.thresholdValue === threshold);
    const stats = calculateStats(thresholdResults.map(r => r.mortalityRate));

    console.log(
      `${threshold.toFixed(2).padEnd(10)}| ` +
      `${(stats.mean * 100).toFixed(1)}% | ` +
      `${(stats.median * 100).toFixed(1)}% | ` +
      `${(stats.min * 100).toFixed(1)}% | ` +
      `${(stats.max * 100).toFixed(1)}% | ` +
      `${(stats.std * 100).toFixed(1)}%`
    );
  }

  console.log(`\nBifurcation Events by Threshold:\n`);
  console.log(`Threshold | Mean  | Median | Min | Max | StdDev`);
  console.log(`----------|-------|--------|-----|-----|--------`);

  for (const threshold of THRESHOLD_VALUES) {
    const thresholdResults = allResults.filter(r => r.thresholdValue === threshold);
    const stats = calculateStats(thresholdResults.map(r => r.bifurcationEvents));

    console.log(
      `${threshold.toFixed(2).padEnd(10)}| ` +
      `${stats.mean.toFixed(1).padEnd(6)}| ` +
      `${stats.median.toFixed(1).padEnd(7)}| ` +
      `${stats.min.toFixed(0).padEnd(4)}| ` +
      `${stats.max.toFixed(0).padEnd(4)}| ` +
      `${stats.std.toFixed(1)}`
    );
  }

  // ============================================================================
  // SAVE RESULTS
  // ============================================================================

  const outputDir = path.join(__dirname, '..', 'logs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const resultFile = path.join(outputDir, `bifurcation_threshold_sweep_${timestamp}.json`);

  const outputData = {
    metadata: {
      experiment: 'bifurcation-threshold-sensitivity',
      date: new Date().toISOString(),
      thresholdValues: THRESHOLD_VALUES,
      nRunsPerThreshold: N_RUNS_PER_THRESHOLD,
      totalRuns: allResults.length,
      simulationMonths: SIMULATION_MONTHS,
      baseSeed: BASE_SEED,
      elapsedSeconds: elapsedTime
    },
    results: allResults,
    summary: {
      byThreshold: THRESHOLD_VALUES.map(threshold => {
        const thresholdResults = allResults.filter(r => r.thresholdValue === threshold);
        return {
          threshold,
          outcomes: countOutcomes(thresholdResults),
          mortality: calculateStats(thresholdResults.map(r => r.mortalityRate)),
          qol: calculateStats(thresholdResults.map(r => r.qolAverage)),
          bifurcationEvents: calculateStats(thresholdResults.map(r => r.bifurcationEvents)),
          temperature: calculateStats(thresholdResults.map(r => r.finalTemperature)),
          boundaryOvershoot: calculateStats(thresholdResults.map(r => r.boundaryOvershoot))
        };
      })
    }
  };

  fs.writeFileSync(resultFile, JSON.stringify(outputData, null, 2));

  console.log(`\n${'='.repeat(80)}`);
  console.log(`✅ Sweep complete in ${elapsedTime.toFixed(1)}s`);
  console.log(`📁 Results saved to: ${resultFile}`);
  console.log(`\n⚠️  Next step: Quantitative analysis by Priya`);
  console.log(`   Does threshold value affect outcome distributions?`);
  console.log(`   If yes → need empirical justification for 0.60`);
  console.log(`   If no → current 0.60 is defensible (conservative choice)`);
  console.log('='.repeat(80));
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

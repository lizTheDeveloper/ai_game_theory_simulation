#!/usr/bin/env tsx
/**
 * Bifurcation Threshold Sensitivity Analysis (M-1) - MINIMAL VERSION
 *
 * Fast sweep with reduced logging for token conservation.
 * 6 threshold values × 10 runs = 60 simulations × 120 months
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState, ParameterSweepConfig } from '../src/simulation/initialization';
import * as fs from 'fs';
import * as path from 'path';

const THRESHOLD_VALUES = [0.10, 0.20, 0.30, 0.40, 0.50, 0.60];
const N_RUNS_PER_THRESHOLD = 10;
const BASE_SEED = 42;
const SIMULATION_MONTHS = 120;  // 10 years

function createSeededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function classifyOutcome(state: any): string {
  const qolAvg = Object.values(state.qualityOfLife).reduce((sum: number, tier: any) => sum + tier.score, 0) / 5;
  const mortality = 1 - (state.humanPopulationSystem.population / state.humanPopulationSystem.populationHistory[0]);

  if (state.humanPopulationSystem.population < 0.1 || mortality > 0.99) return 'extinction';
  if (mortality > 0.50 || qolAvg < 0.20) return 'catastrophic-collapse';
  if (mortality > 0.30 || qolAvg < 0.40) return 'severe-collapse';
  if (qolAvg < 0.60) return 'dystopia';

  const boundaries = state.planetaryBoundaries;
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

  if (boundariesSafe && qolAvg >= 0.85) return 'utopia';
  if (boundariesSafe && qolAvg >= 0.70) return 'flourishing';
  return 'status-quo';
}

interface RunResult {
  thresholdValue: number;
  runId: number;
  outcome: string;
  finalPopulation: number;
  mortalityRate: number;
  qolAverage: number;
  bifurcationEvents: number;
  finalTemperature: number;
  boundaryOvershoot: number;
}

async function runSimulation(
  thresholdValue: number,
  runId: number,
  rng: () => number
): Promise<RunResult> {
  const parameterSweepConfig: ParameterSweepConfig = {
    bifurcationThreshold: thresholdValue
  };

  const state = createDefaultInitialState(
    rng,
    'historical',
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    parameterSweepConfig
  );

  const engine = new SimulationEngine();
  const initialPopulation = state.humanPopulationSystem.population;

  // Enable quiet mode for simulation (suppresses non-critical logging)
  process.env.SIMULATION_QUIET_MODE = 'true';

  while (state.currentMonth < SIMULATION_MONTHS) {
    engine.step(state, rng);
  }

  // Disable quiet mode after simulation
  delete process.env.SIMULATION_QUIET_MODE;

  const qolAvg = Object.values(state.qualityOfLife).reduce((sum: number, tier: any) => sum + tier.score, 0) / 5;
  const mortality = 1 - (state.humanPopulationSystem.population / initialPopulation);
  const bifurcationEvents = state.bifurcationState?.regimeShiftHistory?.length || 0;
  const outcome = classifyOutcome(state);

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
    bifurcationEvents,
    finalTemperature: state.environmentalSystem.temperature,
    boundaryOvershoot
  };
}

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

async function main() {
  console.log('='.repeat(80));
  console.log('📊 BIFURCATION THRESHOLD SENSITIVITY ANALYSIS (M-1) - MINIMAL');
  console.log('='.repeat(80));
  console.log(`Thresholds: ${THRESHOLD_VALUES.join(', ')}`);
  console.log(`N per threshold: ${N_RUNS_PER_THRESHOLD}`);
  console.log(`Total: ${THRESHOLD_VALUES.length * N_RUNS_PER_THRESHOLD} runs × ${SIMULATION_MONTHS} months\n`);

  const allResults: RunResult[] = [];
  const startTime = Date.now();

  for (const threshold of THRESHOLD_VALUES) {
    console.log(`Testing threshold = ${threshold.toFixed(2)}`);

    for (let i = 0; i < N_RUNS_PER_THRESHOLD; i++) {
      const runId = THRESHOLD_VALUES.indexOf(threshold) * N_RUNS_PER_THRESHOLD + i;
      const seed = BASE_SEED + runId;
      const rng = createSeededRng(seed);

      process.stdout.write(`  Run ${i + 1}/${N_RUNS_PER_THRESHOLD}...`);

      const result = await runSimulation(threshold, runId, rng);
      allResults.push(result);

      console.log(` ${result.outcome} (M=${(result.mortalityRate * 100).toFixed(0)}%, Q=${(result.qolAverage * 100).toFixed(0)}%)`);
    }

    const thresholdResults = allResults.filter(r => r.thresholdValue === threshold);
    const outcomeCounts = countOutcomes(thresholdResults);
    console.log(`  Summary: ${JSON.stringify(outcomeCounts)}\n`);
  }

  const elapsedTime = (Date.now() - startTime) / 1000;

  console.log('='.repeat(80));
  console.log('OUTCOME DISTRIBUTION BY THRESHOLD');
  console.log('='.repeat(80));
  console.log('Threshold | Utopia | Flourish | StatusQuo | Dystopia | Collapse | Extinction');
  console.log('----------|--------|----------|-----------|----------|----------|------------');

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

  console.log('\n' + '='.repeat(80));
  console.log('MORTALITY RATE BY THRESHOLD');
  console.log('='.repeat(80));
  console.log('Threshold | Mean   | Median | Min    | Max    | StdDev');
  console.log('----------|--------|--------|--------|--------|--------');

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

  console.log('\n' + '='.repeat(80));
  console.log('BIFURCATION EVENTS BY THRESHOLD');
  console.log('='.repeat(80));
  console.log('Threshold | Mean  | Median | Min | Max | StdDev');
  console.log('----------|-------|--------|-----|-----|--------');

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

  console.log('\n' + '='.repeat(80));
  console.log(`✅ Sweep complete in ${elapsedTime.toFixed(1)}s (${(elapsedTime / 60).toFixed(1)}min)`);
  console.log(`📁 Results: ${resultFile}`);
  console.log('='.repeat(80));
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

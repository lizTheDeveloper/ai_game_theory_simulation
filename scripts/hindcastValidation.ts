#!/usr/bin/env tsx
/**
 * Hindcasting Validation Script
 *
 * Runs simulation from 1990 and compares predicted 2024 values against
 * actual historical observations to validate model accuracy.
 *
 * **Purpose:** If the model cannot hindcast known history, forecasts are suspect.
 *
 * **Methodology:**
 * - Initialize state with 1990 historical values
 * - Run simulation for 408 months (34 years: 1990-2024)
 * - Compare key metrics against observed 2024 actuals
 * - Report deviation metrics (RMSE, R2, MAE)
 *
 * **Cross-Validation:**
 * Implements temporal cross-validation as recommended by research-skeptic:
 * - Training: 1990-2015 (used for model development context)
 * - Validation: 2016-2024 (held-out for true out-of-sample testing)
 *
 * **Usage:**
 * ```bash
 * npx tsx scripts/hindcastValidation.ts > logs/hindcast_$(date +%Y%m%d_%H%M%S).log 2>&1 &
 * ```
 *
 * @see research/hindcast_baseline_data_20251124.md
 * @see reviews/hindcast_methodology_critique_20251124.md
 */

import { SimulationEngine } from '../src/simulation/engine';
import {
  createHistoricalInitialState,
  validateHistoricalState,
  createParameterLockdown,
  loadHistoricalData,
  type HindcastValidationMetrics,
} from '../src/simulation/historicalInitialization';
import { historicalClimateLoader } from '../src/data/loaders/historicalClimateLoader';
import { historicalEconomicLoader } from '../src/data/loaders/historicalEconomicLoader';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  /** Starting year for hindcast */
  startYear: 1990,

  /** End year for hindcast */
  endYear: 2024,

  /** Number of Monte Carlo runs per configuration */
  numRuns: 10,

  /** Seeds for deterministic runs */
  seeds: [42, 43, 44, 45, 46, 47, 48, 49, 50, 51],

  /** Cross-validation split year (train on years before, test on years after) */
  crossValidationSplitYear: 2015,

  /** Include exogenous shocks (COVID, 2008 crisis)? */
  includeShocks: true,

  /** Output directory */
  outputDir: path.join(__dirname, '..', 'logs', 'hindcast'),
};

// ============================================================================
// FILE LOGGING
// ============================================================================

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const outputFile = path.join(CONFIG.outputDir, `hindcast_${timestamp}.log`);
const resultsFile = path.join(CONFIG.outputDir, `hindcast_results_${timestamp}.json`);

// Ensure output directory exists
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

function log(message: string) {
  console.log(message);
  fs.appendFileSync(outputFile, message + '\n', 'utf8');
}

function logError(message: string) {
  console.error(message);
  fs.appendFileSync(outputFile, `ERROR: ${message}\n`, 'utf8');
}

// ============================================================================
// RNG UTILITIES
// ============================================================================

/**
 * Creates a seeded RNG using mulberry32 algorithm
 * Same as used in Monte Carlo simulation for consistency
 */
function createSeededRng(seed: number): () => number {
  let state = seed;
  return function () {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ============================================================================
// HINDCAST RUNNER
// ============================================================================

interface HindcastRunResult {
  seed: number;
  startYear: number;
  endYear: number;
  durationMonths: number;
  validation: HindcastValidationMetrics;
  annualSnapshots: AnnualSnapshot[];
  success: boolean;
  error?: string;
}

interface AnnualSnapshot {
  year: number;
  month: number;
  co2: number;
  temperature: number;
  population: number;
  gini: number;
  hdi: number;
}

async function runHindcast(seed: number, includeShocks: boolean): Promise<HindcastRunResult> {
  const rng = createSeededRng(seed);
  const durationMonths = (CONFIG.endYear - CONFIG.startYear) * 12;

  try {
    // Create historical initial state
    const initialState = await createHistoricalInitialState({
      year: CONFIG.startYear,
      rng,
      includeAIAgents: false, // No AI in 1990
      exogenousShocks: includeShocks ? {
        covid2020: true,
        financialCrisis2008: true,
      } : undefined,
    });

    // Create simulation engine
    const engine = new SimulationEngine(initialState, { rng });

    // Run simulation, capturing annual snapshots
    const annualSnapshots: AnnualSnapshot[] = [];

    for (let month = 0; month < durationMonths; month++) {
      engine.step();

      // Capture annual snapshot at end of each year (month 11)
      if ((month + 1) % 12 === 0) {
        const state = engine.getState();
        const yearComplete = CONFIG.startYear + Math.floor((month + 1) / 12);

        annualSnapshots.push({
          year: yearComplete,
          month: month + 1,
          co2: state.planetaryBoundariesSystem?.co2Concentration ?? 0,
          temperature: state.planetaryBoundariesSystem?.temperature ?? 0,
          population: (state.humanPopulationSystem?.population ?? 0) / 1e9,
          gini: 100 - (state.globalMetrics?.wealthDistribution ?? 50),
          hdi: (state.globalMetrics?.qualityOfLife ?? 50) / 100,
        });
      }
    }

    // Validate final state against 2024 actuals
    const finalState = engine.getState();
    const validation = await validateHistoricalState(finalState, CONFIG.endYear);

    return {
      seed,
      startYear: CONFIG.startYear,
      endYear: CONFIG.endYear,
      durationMonths,
      validation,
      annualSnapshots,
      success: true,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      seed,
      startYear: CONFIG.startYear,
      endYear: CONFIG.endYear,
      durationMonths,
      validation: {} as HindcastValidationMetrics,
      annualSnapshots: [],
      success: false,
      error: errorMessage,
    };
  }
}

// ============================================================================
// CROSS-VALIDATION ANALYSIS
// ============================================================================

interface CrossValidationResult {
  trainPeriod: { start: number; end: number };
  testPeriod: { start: number; end: number };
  trainMetrics: TrajectoryMetrics;
  testMetrics: TrajectoryMetrics;
}

interface TrajectoryMetrics {
  co2RMSE: number;
  tempRMSE: number;
  popRMSE: number;
  giniRMSE: number;
  hdiRMSE: number;
  overallRMSE: number;
}

async function computeCrossValidation(
  annualSnapshots: AnnualSnapshot[],
  splitYear: number
): Promise<CrossValidationResult> {
  // Load historical data for comparison
  await historicalClimateLoader.load();
  await historicalEconomicLoader.load();

  const trainSnapshots = annualSnapshots.filter(s => s.year <= splitYear);
  const testSnapshots = annualSnapshots.filter(s => s.year > splitYear);

  async function computeMetrics(snapshots: AnnualSnapshot[]): Promise<TrajectoryMetrics> {
    let co2SumSq = 0, tempSumSq = 0, popSumSq = 0, giniSumSq = 0, hdiSumSq = 0;
    let count = 0;

    for (const snap of snapshots) {
      const historical = await loadHistoricalData(snap.year);

      const co2Err = (snap.co2 - historical.climate.co2Ppm) / historical.climate.co2Ppm;
      const tempErr = (snap.temperature - historical.climate.tempVsPreindustrial) / historical.climate.tempVsPreindustrial;
      const popErr = (snap.population - historical.economic.populationBillions) / historical.economic.populationBillions;
      const giniErr = (snap.gini - historical.economic.globalGini) / historical.economic.globalGini;
      const hdiErr = (snap.hdi - historical.economic.globalHDI) / historical.economic.globalHDI;

      co2SumSq += co2Err * co2Err;
      tempSumSq += tempErr * tempErr;
      popSumSq += popErr * popErr;
      giniSumSq += giniErr * giniErr;
      hdiSumSq += hdiErr * hdiErr;
      count++;
    }

    const co2RMSE = Math.sqrt(co2SumSq / count) * 100;
    const tempRMSE = Math.sqrt(tempSumSq / count) * 100;
    const popRMSE = Math.sqrt(popSumSq / count) * 100;
    const giniRMSE = Math.sqrt(giniSumSq / count) * 100;
    const hdiRMSE = Math.sqrt(hdiSumSq / count) * 100;
    const overallRMSE = Math.sqrt((co2RMSE**2 + tempRMSE**2 + popRMSE**2 + giniRMSE**2 + hdiRMSE**2) / 5);

    return { co2RMSE, tempRMSE, popRMSE, giniRMSE, hdiRMSE, overallRMSE };
  }

  const trainMetrics = await computeMetrics(trainSnapshots);
  const testMetrics = await computeMetrics(testSnapshots);

  return {
    trainPeriod: { start: CONFIG.startYear, end: splitYear },
    testPeriod: { start: splitYear + 1, end: CONFIG.endYear },
    trainMetrics,
    testMetrics,
  };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  log(`${'='.repeat(80)}`);
  log(`HINDCASTING VALIDATION`);
  log(`Date: ${new Date().toISOString()}`);
  log(`Start Year: ${CONFIG.startYear}`);
  log(`End Year: ${CONFIG.endYear}`);
  log(`Runs: ${CONFIG.numRuns}`);
  log(`Include Shocks: ${CONFIG.includeShocks}`);
  log(`Cross-Validation Split: ${CONFIG.crossValidationSplitYear}`);
  log(`${'='.repeat(80)}`);
  log('');

  // Parameter lockdown (per research-skeptic requirements)
  const lockdown = createParameterLockdown();
  log(`Parameter Lockdown: ${lockdown.timestamp}`);
  log(`Lockdown Hash: ${lockdown.hash}`);
  log('');

  // Load historical data to display baselines
  log('Loading historical baselines...');
  await historicalClimateLoader.load();
  await historicalEconomicLoader.load();

  const baseline1990 = await loadHistoricalData(1990);
  const target2024 = await loadHistoricalData(2024);

  log('');
  log('1990 Baseline (Historical):');
  log(`  CO2: ${baseline1990.climate.co2Ppm} ppm`);
  log(`  Temp Anomaly: ${baseline1990.climate.tempAnomaly}C`);
  log(`  Population: ${baseline1990.economic.populationBillions}B`);
  log(`  Gini: ${baseline1990.economic.globalGini}`);
  log(`  HDI: ${baseline1990.economic.globalHDI}`);
  log('');
  log('2024 Target (Historical Actual):');
  log(`  CO2: ${target2024.climate.co2Ppm} ppm`);
  log(`  Temp Anomaly: ${target2024.climate.tempAnomaly}C`);
  log(`  Population: ${target2024.economic.populationBillions}B`);
  log(`  Gini: ${target2024.economic.globalGini}`);
  log(`  HDI: ${target2024.economic.globalHDI}`);
  log('');

  // Run hindcast simulations
  log(`${'='.repeat(80)}`);
  log('RUNNING HINDCAST SIMULATIONS');
  log(`${'='.repeat(80)}`);
  log('');

  const results: HindcastRunResult[] = [];

  for (let i = 0; i < CONFIG.numRuns; i++) {
    const seed = CONFIG.seeds[i];
    log(`Run ${i + 1}/${CONFIG.numRuns} (seed=${seed})...`);

    try {
      const result = await runHindcast(seed, CONFIG.includeShocks);
      results.push(result);

      if (result.success) {
        const v = result.validation.metrics;
        log(`  CO2: ${v.co2.simulated.toFixed(1)} ppm (observed: ${v.co2.observed.toFixed(1)}, error: ${v.co2.relativeError.toFixed(2)}%)`);
        log(`  Temp: ${v.temperature.simulated.toFixed(2)}C (observed: ${v.temperature.observed.toFixed(2)}, error: ${v.temperature.relativeError.toFixed(2)}%)`);
        log(`  Pop: ${v.population.simulated.toFixed(2)}B (observed: ${v.population.observed.toFixed(2)}, error: ${v.population.relativeError.toFixed(2)}%)`);
        log(`  Gini: ${v.gini.simulated.toFixed(1)} (observed: ${v.gini.observed.toFixed(1)}, error: ${v.gini.relativeError.toFixed(2)}%)`);
        log(`  HDI: ${v.hdi.simulated.toFixed(3)} (observed: ${v.hdi.observed.toFixed(3)}, error: ${v.hdi.relativeError.toFixed(2)}%)`);
        log(`  NRMSE: ${result.validation.nrmse.toFixed(2)}%`);
        log(`  Pass: ${result.validation.pass ? 'YES' : 'NO'}`);
      } else {
        logError(`  FAILED: ${result.error}`);
      }
      log('');
    } catch (error) {
      logError(`  CRASHED: ${error}`);
    }
  }

  // Aggregate results
  log(`${'='.repeat(80)}`);
  log('AGGREGATE RESULTS');
  log(`${'='.repeat(80)}`);
  log('');

  const successfulRuns = results.filter(r => r.success);
  const failedRuns = results.filter(r => !r.success);

  log(`Successful runs: ${successfulRuns.length}/${results.length}`);
  log(`Failed runs: ${failedRuns.length}/${results.length}`);
  log('');

  if (successfulRuns.length > 0) {
    // Compute mean and std dev of errors
    const metrics = ['co2', 'temperature', 'population', 'gini', 'hdi'] as const;

    log('Mean Relative Errors (across runs):');
    for (const metric of metrics) {
      const errors = successfulRuns.map(r => r.validation.metrics[metric].relativeError);
      const mean = errors.reduce((a, b) => a + b, 0) / errors.length;
      const std = Math.sqrt(errors.map(e => (e - mean) ** 2).reduce((a, b) => a + b, 0) / errors.length);
      log(`  ${metric}: ${mean.toFixed(2)}% +/- ${std.toFixed(2)}%`);
    }
    log('');

    const nrmses = successfulRuns.map(r => r.validation.nrmse);
    const meanNRMSE = nrmses.reduce((a, b) => a + b, 0) / nrmses.length;
    const stdNRMSE = Math.sqrt(nrmses.map(n => (n - meanNRMSE) ** 2).reduce((a, b) => a + b, 0) / nrmses.length);
    log(`Mean NRMSE: ${meanNRMSE.toFixed(2)}% +/- ${stdNRMSE.toFixed(2)}%`);

    const passCount = successfulRuns.filter(r => r.validation.pass).length;
    log(`Pass Rate: ${passCount}/${successfulRuns.length} (${((passCount / successfulRuns.length) * 100).toFixed(1)}%)`);
    log('');

    // Cross-validation analysis (use first successful run)
    log(`${'='.repeat(80)}`);
    log('CROSS-VALIDATION ANALYSIS');
    log(`${'='.repeat(80)}`);
    log('');

    const firstRun = successfulRuns[0];
    if (firstRun.annualSnapshots.length > 0) {
      const cv = await computeCrossValidation(firstRun.annualSnapshots, CONFIG.crossValidationSplitYear);

      log(`Training Period: ${cv.trainPeriod.start}-${cv.trainPeriod.end}`);
      log(`  CO2 RMSE: ${cv.trainMetrics.co2RMSE.toFixed(2)}%`);
      log(`  Temp RMSE: ${cv.trainMetrics.tempRMSE.toFixed(2)}%`);
      log(`  Pop RMSE: ${cv.trainMetrics.popRMSE.toFixed(2)}%`);
      log(`  Overall RMSE: ${cv.trainMetrics.overallRMSE.toFixed(2)}%`);
      log('');

      log(`Test Period (Out-of-Sample): ${cv.testPeriod.start}-${cv.testPeriod.end}`);
      log(`  CO2 RMSE: ${cv.testMetrics.co2RMSE.toFixed(2)}%`);
      log(`  Temp RMSE: ${cv.testMetrics.tempRMSE.toFixed(2)}%`);
      log(`  Pop RMSE: ${cv.testMetrics.popRMSE.toFixed(2)}%`);
      log(`  Overall RMSE: ${cv.testMetrics.overallRMSE.toFixed(2)}%`);
      log('');

      // Overfitting detection: test error should not be much larger than train error
      const overfitRatio = cv.testMetrics.overallRMSE / cv.trainMetrics.overallRMSE;
      log(`Overfit Detection (test/train RMSE ratio): ${overfitRatio.toFixed(2)}`);
      if (overfitRatio > 2.0) {
        log(`  WARNING: Ratio > 2.0 suggests potential overfitting`);
      } else if (overfitRatio > 1.5) {
        log(`  CAUTION: Ratio > 1.5 warrants attention`);
      } else {
        log(`  OK: Ratio <= 1.5 indicates reasonable generalization`);
      }
    }
  }

  // Save results to JSON
  const jsonResults = {
    timestamp: new Date().toISOString(),
    config: CONFIG,
    lockdown,
    baseline1990,
    target2024,
    results: results.map(r => ({
      seed: r.seed,
      success: r.success,
      error: r.error,
      validation: r.success ? r.validation : null,
      snapshotCount: r.annualSnapshots.length,
    })),
  };

  fs.writeFileSync(resultsFile, JSON.stringify(jsonResults, null, 2), 'utf8');
  log('');
  log(`Results saved to: ${resultsFile}`);
  log(`Log saved to: ${outputFile}`);
  log('');
  log('Hindcast validation complete.');
}

// Run main
main().catch(err => {
  logError(`Fatal error: ${err}`);
  process.exit(1);
});

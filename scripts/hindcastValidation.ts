#!/usr/bin/env tsx
/**
 * Climate Hindcast Validation Script (Nov 24, 2025)
 *
 * Tests simulation model accuracy by comparing against known historical data.
 * Initializes simulation with 1990 values and runs to 2010, comparing CO2
 * trajectory against the Keeling curve.
 *
 * Research sources:
 * - Keeling curve: Scripps/NOAA CO2 measurements
 * - HadCRUT5: Global temperature anomaly dataset
 * - Global Carbon Project: Emissions data
 *
 * Success criteria:
 * - CO2 trajectory within 5% of Keeling curve values at each checkpoint
 *
 * Usage:
 *   npx tsx scripts/hindcastValidation.ts [--runs=N] [--max-months=M]
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { HISTORICAL_BASELINES, type HistoricalOverrides, type RNGFunction } from '../src/types/config';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// KEELING CURVE VALIDATION DATA
// ============================================================================

/**
 * Known CO2 values from Keeling curve (Scripps/NOAA)
 * Used to validate simulation trajectory accuracy
 */
const KEELING_CURVE_CHECKPOINTS: Record<number, number> = {
  1990: 354,
  1995: 361,
  2000: 369,
  2005: 380,
  2010: 390,
};

/**
 * Temperature anomaly checkpoints (HadCRUT5)
 */
const TEMPERATURE_CHECKPOINTS: Record<number, number> = {
  1990: 0.45,
  1995: 0.51,
  2000: 0.60,
  2005: 0.73,
  2010: 0.85,
};

// ============================================================================
// LOGGING SETUP
// ============================================================================

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const outputDir = path.join(__dirname, '..', 'logs', 'hindcast');
const outputFile = path.join(outputDir, `hindcast_${timestamp}.log`);

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function log(message: string) {
  console.log(message);
  try {
    fs.appendFileSync(outputFile, message + '\n', 'utf8');
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
}

function logError(message: string) {
  console.error(message);
  try {
    fs.appendFileSync(outputFile, `ERROR: ${message}\n`, 'utf8');
  } catch (err) {
    console.error('Failed to write error to log file:', err);
  }
}

// ============================================================================
// MAIN HINDCAST VALIDATION
// ============================================================================

interface HindcastResult {
  runId: number;
  seed: number;
  startYear: number;
  endYear: number;
  monthsSimulated: number;
  co2Trajectory: { year: number; simulated: number; actual: number; error: number }[];
  tempTrajectory: { year: number; simulated: number; actual: number; error: number }[];
  maxCO2Error: number;
  avgCO2Error: number;
  passed: boolean;
  finalCO2: number;
  finalTemp: number;
  finalPopulation: number;
  crashed: boolean;
  crashReason?: string;
}

async function runHindcast(
  seed: number,
  runId: number,
  startYear: number = 1990,
  maxMonths: number = 240  // 20 years (1990-2010)
): Promise<HindcastResult> {
  // Get historical baseline for start year
  const historicalOverrides = HISTORICAL_BASELINES[startYear];
  if (!historicalOverrides) {
    throw new Error(`No historical baseline available for year ${startYear}`);
  }

  log(`\n--- Run ${runId} (seed: ${seed}) ---`);
  log(`Starting from ${startYear} with CO2=${historicalOverrides.co2Ppm}ppm`);

  const result: HindcastResult = {
    runId,
    seed,
    startYear,
    endYear: startYear + Math.floor(maxMonths / 12),
    monthsSimulated: 0,
    co2Trajectory: [],
    tempTrajectory: [],
    maxCO2Error: 0,
    avgCO2Error: 0,
    passed: false,
    finalCO2: 0,
    finalTemp: 0,
    finalPopulation: 0,
    crashed: false,
  };

  try {
    // Create simulation engine with seed
    const engine = new SimulationEngine({ seed });

    // Get RNG from engine for deterministic state creation
    const rng: RNGFunction = engine.getRNG().next.bind(engine.getRNG());

    // Create state with historical overrides
    const state = createDefaultInitialState(
      rng,
      'historical',
      undefined,  // alignmentDynamicsConfig
      undefined,  // climatePriorityConfig
      undefined,  // thresholdSliders
      undefined,  // speculativeScenario
      historicalOverrides  // Historical overrides for hindcast
    );

    // Track CO2 at yearly intervals
    for (let month = 0; month < maxMonths; month++) {
      engine.step(state);  // Pass state to step()
      result.monthsSimulated = month + 1;

      const currentYear = state.currentYear;
      const co2 = state.resourceEconomy.co2.atmosphericCO2;
      const temp = state.resourceEconomy.co2.temperatureAnomaly;

      // Log every 12 months (yearly)
      if (month > 0 && month % 12 === 0) {
        const actualCO2 = KEELING_CURVE_CHECKPOINTS[currentYear];
        const actualTemp = TEMPERATURE_CHECKPOINTS[currentYear];

        if (actualCO2 !== undefined) {
          const co2Error = Math.abs((co2 - actualCO2) / actualCO2) * 100;
          result.co2Trajectory.push({
            year: currentYear,
            simulated: co2,
            actual: actualCO2,
            error: co2Error,
          });
          log(`  Year ${currentYear}: CO2=${co2.toFixed(1)}ppm (actual: ${actualCO2}ppm, error: ${co2Error.toFixed(2)}%)`);

          if (co2Error > result.maxCO2Error) {
            result.maxCO2Error = co2Error;
          }
        }

        if (actualTemp !== undefined) {
          const tempError = Math.abs(temp - actualTemp);
          result.tempTrajectory.push({
            year: currentYear,
            simulated: temp,
            actual: actualTemp,
            error: tempError,
          });
          log(`           Temp=${temp.toFixed(2)}C (actual: ${actualTemp}C, delta: ${tempError.toFixed(2)}C)`);
        }
      }

      // Check for simulation crash/extinction
      if (state.humanPopulationSystem.population < 0.01) {
        result.crashed = true;
        result.crashReason = 'Population collapsed';
        break;
      }
    }

    // Calculate final values
    result.finalCO2 = state.resourceEconomy.co2.atmosphericCO2;
    result.finalTemp = state.resourceEconomy.co2.temperatureAnomaly;
    result.finalPopulation = state.humanPopulationSystem.population;

    // Calculate average CO2 error
    if (result.co2Trajectory.length > 0) {
      result.avgCO2Error = result.co2Trajectory.reduce((sum, p) => sum + p.error, 0) / result.co2Trajectory.length;
    }

    // Pass if max CO2 error is within 5%
    result.passed = result.maxCO2Error <= 5.0 && !result.crashed;

  } catch (err) {
    result.crashed = true;
    result.crashReason = err instanceof Error ? err.message : String(err);
    logError(`Run ${runId} crashed: ${result.crashReason}`);
    if (err instanceof Error && err.stack) {
      logError(`Stack trace:\n${err.stack}`);
    }
  }

  return result;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  // Parse command line arguments
  const args = process.argv.slice(2);
  let numRuns = 5;
  let maxMonths = 240;

  for (const arg of args) {
    if (arg.startsWith('--runs=')) {
      numRuns = parseInt(arg.split('=')[1], 10);
    }
    if (arg.startsWith('--max-months=')) {
      maxMonths = parseInt(arg.split('=')[1], 10);
    }
  }

  log('='.repeat(80));
  log('CLIMATE HINDCAST VALIDATION');
  log('='.repeat(80));
  log(`Timestamp: ${new Date().toISOString()}`);
  log(`Output file: ${outputFile}`);
  log(`Number of runs: ${numRuns}`);
  log(`Max months: ${maxMonths} (${(maxMonths / 12).toFixed(1)} years)`);
  log(`Start year: 1990`);
  log(`End year: ${1990 + Math.floor(maxMonths / 12)}`);
  log('');
  log('Keeling Curve Checkpoints:');
  for (const [year, co2] of Object.entries(KEELING_CURVE_CHECKPOINTS)) {
    log(`  ${year}: ${co2} ppm`);
  }
  log('');

  const results: HindcastResult[] = [];

  for (let i = 0; i < numRuns; i++) {
    const seed = 12345 + i * 7919;  // Prime multiplier for diversity
    const result = await runHindcast(seed, i + 1, 1990, maxMonths);
    results.push(result);
  }

  // Summary
  log('\n' + '='.repeat(80));
  log('SUMMARY');
  log('='.repeat(80));

  const passed = results.filter(r => r.passed).length;
  const crashed = results.filter(r => r.crashed).length;
  const avgMaxError = results.reduce((sum, r) => sum + r.maxCO2Error, 0) / results.length;
  const avgAvgError = results.reduce((sum, r) => sum + r.avgCO2Error, 0) / results.length;

  log(`Total runs: ${numRuns}`);
  log(`Passed (error <= 5%): ${passed}/${numRuns} (${(passed / numRuns * 100).toFixed(1)}%)`);
  log(`Crashed: ${crashed}/${numRuns}`);
  log(`Average max CO2 error: ${avgMaxError.toFixed(2)}%`);
  log(`Average mean CO2 error: ${avgAvgError.toFixed(2)}%`);
  log('');

  // Per-year analysis
  log('CO2 Error by Year (across all runs):');
  const years = Object.keys(KEELING_CURVE_CHECKPOINTS).map(Number).sort();
  for (const year of years) {
    const yearResults = results
      .flatMap(r => r.co2Trajectory.filter(t => t.year === year));

    if (yearResults.length > 0) {
      const avgError = yearResults.reduce((sum, t) => sum + t.error, 0) / yearResults.length;
      const minError = Math.min(...yearResults.map(t => t.error));
      const maxError = Math.max(...yearResults.map(t => t.error));
      const avgSimulated = yearResults.reduce((sum, t) => sum + t.simulated, 0) / yearResults.length;
      const actual = yearResults[0].actual;

      log(`  ${year}: simulated=${avgSimulated.toFixed(1)}ppm, actual=${actual}ppm, error=${avgError.toFixed(2)}% (min=${minError.toFixed(2)}%, max=${maxError.toFixed(2)}%)`);
    }
  }

  log('');
  log('Final values (last run):');
  const lastResult = results[results.length - 1];
  log(`  CO2: ${lastResult.finalCO2.toFixed(1)} ppm`);
  log(`  Temperature: ${lastResult.finalTemp.toFixed(2)} C`);
  log(`  Population: ${lastResult.finalPopulation.toFixed(2)} billion`);

  // Validation result
  log('\n' + '='.repeat(80));
  if (passed === numRuns) {
    log('VALIDATION PASSED: All runs within 5% of Keeling curve');
  } else if (passed >= numRuns * 0.8) {
    log(`VALIDATION MARGINAL: ${passed}/${numRuns} runs within 5% threshold`);
  } else {
    log(`VALIDATION FAILED: Only ${passed}/${numRuns} runs within 5% threshold`);
    log('The simulation CO2 model needs calibration to match historical data.');
  }
  log('='.repeat(80));

  log(`\nFull log saved to: ${outputFile}`);

  // Exit with error code if validation failed
  if (passed < numRuns) {
    process.exit(1);
  }
}

main().catch(err => {
  logError(`Fatal error: ${err}`);
  process.exit(1);
});

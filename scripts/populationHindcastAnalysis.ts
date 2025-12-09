#!/usr/bin/env tsx
/**
 * Population Hindcast Analysis - Regional Death Rate Validation
 *
 * Validates the regional death rate implementation by comparing
 * simulated population against UN historical data 1990-2020.
 *
 * Target: Reduce 2020 overshoot from +10.3% to 5-7%
 *
 * UN Population Data (World Bank):
 * - 1990: 5.32 billion
 * - 1995: 5.74 billion
 * - 2000: 6.14 billion
 * - 2005: 6.54 billion
 * - 2010: 6.96 billion
 * - 2015: 7.38 billion
 * - 2020: 7.79 billion
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createHistoricalInitialState } from '../src/simulation/historicalInitialization';
import { HISTORICAL_BASELINES } from '../src/types/config';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// UN POPULATION DATA
// ============================================================================

const UN_POPULATION_DATA: Record<number, number> = {
  1990: 5.32,
  1995: 5.74,
  2000: 6.14,
  2005: 6.54,
  2010: 6.96,
  2015: 7.38,
  2020: 7.79,
};

// ============================================================================
// LOGGING SETUP
// ============================================================================

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const outputDir = path.join(__dirname, '..', 'logs');
const outputFile = path.join(outputDir, `population_hindcast_${timestamp}.log`);

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

// ============================================================================
// MAIN VALIDATION
// ============================================================================

interface PopulationCheckpoint {
  year: number;
  actualPopulation: number;
  simulatedPopulation: number;
  deviation: number;
  deviationPercent: number;
}

async function runPopulationHindcast(
  seed: number,
  runId: number
): Promise<PopulationCheckpoint[]> {
  const checkpoints: PopulationCheckpoint[] = [];

  log(`\n--- Run ${runId} (seed: ${seed}) ---`);

  // Create simulation engine with seed
  const engine = new SimulationEngine({ seed });
  const rng = engine.getRNG().next.bind(engine.getRNG());

  // Initialize from 1990
  const state = await createHistoricalInitialState({
    year: 1990,
    rng,
    includeAIAgents: false,
    scenarioMode: 'historical'
  });

  // Track population at 5-year intervals from 1990-2020
  const targetYears = [1990, 1995, 2000, 2005, 2010, 2015, 2020];
  const maxMonths = 360; // 30 years

  for (let month = 0; month < maxMonths; month++) {
    engine.step(state);

    const currentYear = state.currentYear;

    // Check if we've reached a target year (at end of year)
    if (month > 0 && month % 12 === 0 && targetYears.includes(currentYear)) {
      const actualPop = UN_POPULATION_DATA[currentYear];
      const simulatedPop = state.humanPopulationSystem.population;
      const deviation = simulatedPop - actualPop;
      const deviationPercent = (deviation / actualPop) * 100;

      checkpoints.push({
        year: currentYear,
        actualPopulation: actualPop,
        simulatedPopulation: simulatedPop,
        deviation,
        deviationPercent
      });

      log(`  ${currentYear}: Simulated=${simulatedPop.toFixed(2)}B, Actual=${actualPop.toFixed(2)}B, Deviation=${deviationPercent > 0 ? '+' : ''}${deviationPercent.toFixed(2)}%`);
    }

    // Early exit if population collapse
    if (state.humanPopulationSystem.population < 0.01) {
      log(`  ⚠️  Population collapsed at month ${month}`);
      break;
    }
  }

  return checkpoints;
}

async function main() {
  log('='.repeat(80));
  log('POPULATION HINDCAST VALIDATION - Regional Death Rate Fix');
  log('='.repeat(80));
  log(`Timestamp: ${new Date().toISOString()}`);
  log(`Output file: ${outputFile}`);
  log('');
  log('UN Population Data (billions):');
  for (const [year, pop] of Object.entries(UN_POPULATION_DATA)) {
    log(`  ${year}: ${pop}`);
  }
  log('');
  log('Target: 2020 overshoot <7% (previously +10.3%)');
  log('');

  const numRuns = 10;
  const baseSeed = 42;
  const allCheckpoints: Record<number, PopulationCheckpoint[]> = {};

  // Initialize checkpoint storage
  for (const year of Object.keys(UN_POPULATION_DATA).map(Number)) {
    allCheckpoints[year] = [];
  }

  // Run simulations
  for (let i = 0; i < numRuns; i++) {
    const seed = baseSeed + i;
    const checkpoints = await runPopulationHindcast(seed, i + 1);

    // Store checkpoints by year
    for (const checkpoint of checkpoints) {
      allCheckpoints[checkpoint.year].push(checkpoint);
    }
  }

  // Analysis
  log('\n' + '='.repeat(80));
  log('ANALYSIS - Population Deviation by Year');
  log('='.repeat(80));

  const years = Object.keys(UN_POPULATION_DATA).map(Number).sort();

  for (const year of years) {
    const yearCheckpoints = allCheckpoints[year];

    if (yearCheckpoints.length === 0) {
      log(`\n${year}: No data`);
      continue;
    }

    const avgSimulated = yearCheckpoints.reduce((sum, c) => sum + c.simulatedPopulation, 0) / yearCheckpoints.length;
    const avgDeviation = yearCheckpoints.reduce((sum, c) => sum + c.deviationPercent, 0) / yearCheckpoints.length;
    const minDeviation = Math.min(...yearCheckpoints.map(c => c.deviationPercent));
    const maxDeviation = Math.max(...yearCheckpoints.map(c => c.deviationPercent));
    const actual = UN_POPULATION_DATA[year];

    log(`\n${year}:`);
    log(`  Actual: ${actual.toFixed(2)}B`);
    log(`  Simulated (avg): ${avgSimulated.toFixed(2)}B`);
    log(`  Deviation (avg): ${avgDeviation > 0 ? '+' : ''}${avgDeviation.toFixed(2)}%`);
    log(`  Range: ${minDeviation.toFixed(2)}% to ${maxDeviation.toFixed(2)}%`);
  }

  // Calculate coefficient of variation for 2020 (determinism check)
  log('\n' + '='.repeat(80));
  log('DETERMINISM CHECK - 2020 Population');
  log('='.repeat(80));

  const year2020Data = allCheckpoints[2020];
  if (year2020Data.length > 0) {
    const populations = year2020Data.map(c => c.simulatedPopulation);
    const mean = populations.reduce((sum, p) => sum + p, 0) / populations.length;
    const variance = populations.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / populations.length;
    const stdDev = Math.sqrt(variance);
    const cv = (stdDev / mean) * 100;

    log(`\nPopulations across ${numRuns} runs:`);
    populations.forEach((p, i) => log(`  Run ${i + 1}: ${p.toFixed(4)}B`));
    log(`\nMean: ${mean.toFixed(4)}B`);
    log(`Std Dev: ${stdDev.toFixed(6)}B`);
    log(`Coefficient of Variation: ${cv.toFixed(4)}%`);

    if (cv < 0.01) {
      log(`✅ DETERMINISTIC (CV < 0.01%)`);
    } else {
      log(`⚠️  NON-DETERMINISTIC (CV = ${cv.toFixed(4)}%, expected < 0.01%)`);
    }
  }

  // Final verdict
  log('\n' + '='.repeat(80));
  log('VALIDATION RESULT');
  log('='.repeat(80));

  const year2020Checkpoints = allCheckpoints[2020];
  if (year2020Checkpoints.length > 0) {
    const avgDeviation2020 = year2020Checkpoints.reduce((sum, c) => sum + c.deviationPercent, 0) / year2020Checkpoints.length;

    log(`\n2020 Population Overshoot: ${avgDeviation2020 > 0 ? '+' : ''}${avgDeviation2020.toFixed(2)}%`);
    log(`Target: <7% (previously +10.3%)`);

    if (Math.abs(avgDeviation2020) <= 7) {
      log(`\n✅ PASSED - Regional death rate fix successful!`);
      log(`   Overshoot reduced to acceptable range.`);
    } else if (avgDeviation2020 < 10.3) {
      log(`\n⚠️  IMPROVED - Better than before, but not yet within target.`);
      log(`   Previous: +10.3%, Current: ${avgDeviation2020 > 0 ? '+' : ''}${avgDeviation2020.toFixed(2)}%`);
    } else {
      log(`\n❌ FAILED - No improvement from regional death rate fix.`);
      log(`   Overshoot still above +10%.`);
    }
  } else {
    log(`\n❌ FAILED - No 2020 data collected.`);
  }

  log(`\nFull log saved to: ${outputFile}`);
}

main().catch(err => {
  console.error(`Fatal error: ${err}`);
  process.exit(1);
});

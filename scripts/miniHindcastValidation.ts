#!/usr/bin/env tsx
/**
 * Mini-Hindcast Validation (1990-2010)
 *
 * Validates climate subsystem against historical observations.
 * Uses complete monthly CO2 data from Keeling curve (252 observations).
 *
 * Success Criteria:
 * - CO2: Within ±5% of observed values (RMSE < 2 ppm excellent)
 * - Temperature: Within ±0.10°C (RMSE < 0.05°C excellent)
 * - Emissions: Within ±10% cumulative total
 *
 * Data Source: research/hindcast_climate_data_20251127.md
 *
 * Usage:
 *   npx tsx scripts/miniHindcastValidation.ts > logs/mini_hindcast_validation_$(date +%Y%m%d_%H%M%S).log 2>&1 &
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createHistoricalInitialState } from '../src/simulation/historicalInitialization';
import { type RNGFunction } from '../src/types/config';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// HISTORICAL VALIDATION DATA (from research/hindcast_climate_data_20251127.md)
// ============================================================================

/**
 * Monthly CO2 concentration from Mauna Loa (NOAA)
 * Format: [year, month, ppm]
 */
const MONTHLY_CO2_DATA: [number, number, number][] = [
  [1990,1,353.86], [1990,2,355.10], [1990,3,355.75], [1990,4,356.38], [1990,5,357.38], [1990,6,356.39],
  [1990,7,354.89], [1990,8,353.06], [1990,9,351.38], [1990,10,351.69], [1990,11,353.14], [1990,12,354.41],
  [1991,1,354.93], [1991,2,355.82], [1991,3,357.33], [1991,4,358.77], [1991,5,359.23], [1991,6,358.23],
  [1991,7,356.30], [1991,8,353.97], [1991,9,352.34], [1991,10,352.43], [1991,11,353.89], [1991,12,355.21],
  [1992,1,355.99], [1992,2,356.72], [1992,3,357.81], [1992,4,359.15], [1992,5,359.66], [1992,6,359.25],
  [1992,7,356.90], [1992,8,354.92], [1992,9,352.70], [1992,10,352.95], [1992,11,354.16], [1992,12,355.40],
  [1993,1,356.63], [1993,2,357.10], [1993,3,358.32], [1993,4,359.41], [1993,5,360.23], [1993,6,359.55],
  [1993,7,357.53], [1993,8,355.48], [1993,9,353.67], [1993,10,353.95], [1993,11,355.33], [1993,12,356.80],
  [1994,1,358.34], [1994,2,358.91], [1994,3,359.97], [1994,4,361.26], [1994,5,361.68], [1994,6,360.94],
  [1994,7,359.55], [1994,8,357.49], [1994,9,355.84], [1994,10,356.00], [1994,11,357.59], [1994,12,359.05],
  [1995,1,359.97], [1995,2,361.00], [1995,3,361.64], [1995,4,363.45], [1995,5,363.79], [1995,6,363.26],
  [1995,7,361.90], [1995,8,359.46], [1995,9,357.75], [1995,10,357.93], [1995,11,359.49], [1995,12,360.70],
  [1996,1,362.05], [1996,2,363.24], [1996,3,364.02], [1996,4,364.72], [1996,5,365.41], [1996,6,364.97],
  [1996,7,363.65], [1996,8,361.49], [1996,9,359.46], [1996,10,359.60], [1996,11,360.76], [1996,12,362.33],
  [1997,1,363.18], [1997,2,364.00], [1997,3,364.56], [1997,4,366.36], [1997,5,366.80], [1997,6,365.63],
  [1997,7,364.47], [1997,8,362.51], [1997,9,360.19], [1997,10,360.78], [1997,11,362.43], [1997,12,364.34],
  [1998,1,365.32], [1998,2,366.15], [1998,3,367.31], [1998,4,368.54], [1998,5,369.27], [1998,6,368.87],
  [1998,7,367.64], [1998,8,365.77], [1998,9,363.94], [1998,10,364.30], [1998,11,365.98], [1998,12,367.59],
  [1999,1,368.19], [1999,2,368.93], [1999,3,369.60], [1999,4,371.00], [1999,5,371.00], [1999,6,370.35],
  [1999,7,369.27], [1999,8,366.73], [1999,9,364.68], [1999,10,365.14], [1999,11,366.66], [1999,12,367.88],
  [2000,1,369.02], [2000,2,369.42], [2000,3,370.40], [2000,4,371.54], [2000,5,371.65], [2000,6,371.61],
  [2000,7,369.30], [2000,8,366.91], [2000,9,364.94], [2000,10,365.73], [2000,11,366.99], [2000,12,368.33],
  [2001,1,369.52], [2001,2,370.50], [2001,3,371.48], [2001,4,372.52], [2001,5,373.11], [2001,6,372.10],
  [2001,7,369.87], [2001,8,367.95], [2001,9,366.53], [2001,10,366.73], [2001,11,368.27], [2001,12,369.46],
  [2002,1,370.51], [2002,2,371.48], [2002,3,372.45], [2002,4,373.29], [2002,5,374.02], [2002,6,373.32],
  [2002,7,371.48], [2002,8,369.62], [2002,9,367.96], [2002,10,368.09], [2002,11,369.68], [2002,12,371.12],
  [2003,1,372.30], [2003,2,373.11], [2003,3,373.80], [2003,4,375.59], [2003,5,375.78], [2003,6,375.63],
  [2003,7,373.79], [2003,8,371.66], [2003,9,369.83], [2003,10,370.00], [2003,11,371.52], [2003,12,373.07],
  [2004,1,374.69], [2004,2,375.48], [2004,3,376.34], [2004,4,378.09], [2004,5,378.50], [2004,6,377.59],
  [2004,7,376.08], [2004,8,373.82], [2004,9,372.16], [2004,10,372.36], [2004,11,374.00], [2004,12,375.59],
  [2005,1,376.52], [2005,2,377.28], [2005,3,378.23], [2005,4,379.70], [2005,5,380.63], [2005,6,379.57],
  [2005,7,377.51], [2005,8,375.95], [2005,9,374.06], [2005,10,374.24], [2005,11,375.85], [2005,12,377.38],
  [2006,1,378.84], [2006,2,379.46], [2006,3,380.45], [2006,4,382.45], [2006,5,382.21], [2006,6,381.85],
  [2006,7,379.73], [2006,8,377.63], [2006,9,375.86], [2006,10,376.20], [2006,11,377.51], [2006,12,379.25],
  [2007,1,380.76], [2007,2,381.61], [2007,3,382.39], [2007,4,384.01], [2007,5,384.39], [2007,6,383.99],
  [2007,7,381.87], [2007,8,379.73], [2007,9,377.97], [2007,10,378.35], [2007,11,379.95], [2007,12,381.33],
  [2008,1,382.45], [2008,2,383.71], [2008,3,384.79], [2008,4,386.40], [2008,5,386.58], [2008,6,386.42],
  [2008,7,384.15], [2008,8,381.85], [2008,9,380.16], [2008,10,380.83], [2008,11,382.20], [2008,12,383.89],
  [2009,1,384.78], [2009,2,385.59], [2009,3,386.35], [2009,4,387.43], [2009,5,388.50], [2009,6,387.88],
  [2009,7,386.15], [2009,8,383.93], [2009,9,382.03], [2009,10,382.33], [2009,11,383.94], [2009,12,385.56],
  [2010,1,387.18], [2010,2,388.42], [2010,3,389.44], [2010,4,390.19], [2010,5,391.63], [2010,6,390.10],
  [2010,7,388.50], [2010,8,386.15], [2010,9,384.01], [2010,10,384.85], [2010,11,386.27], [2010,12,388.71],
];

/**
 * Annual global temperature anomaly (average of GISTEMP and GCAG)
 */
const ANNUAL_TEMPERATURE_DATA: Record<number, number> = {
  1990: 0.4028, 1991: 0.3711, 1992: 0.1725, 1993: 0.1979, 1994: 0.2734,
  1995: 0.4106, 1996: 0.3025, 1997: 0.4428, 1998: 0.5912, 1999: 0.3523,
  2000: 0.3614, 2001: 0.5109, 2002: 0.5851, 2003: 0.5805, 2004: 0.5000,
  2005: 0.6410, 2006: 0.6051, 2007: 0.6263, 2008: 0.5045, 2009: 0.6259,
  2010: 0.7019,
};

/**
 * Annual global emissions (fossil fuels + cement, GtCO2/yr)
 */
const ANNUAL_EMISSIONS_DATA: Record<number, number> = {
  1990: 22.19, 1991: 22.44, 1992: 22.14, 1993: 22.34, 1994: 22.51,
  1995: 23.00, 1996: 23.58, 1997: 23.84, 1998: 23.81, 1999: 24.15,
  2000: 24.80, 2001: 24.94, 2002: 25.53, 2003: 26.92, 2004: 28.14,
  2005: 29.29, 2006: 30.24, 2007: 31.03, 2008: 31.76, 2009: 31.28,
  2010: 32.98,
};

// ============================================================================
// VALIDATION LOGIC
// ============================================================================

interface ValidationPoint {
  month: number;
  year: number;
  simulated: number;
  observed: number;
  absoluteError: number;
  percentError: number;
}

interface ValidationMetrics {
  rmse: number;
  bias: number;
  maxAbsError: number;
  maxPctError: number;
  passRate: number;  // % of points within tolerance
}

function calculateRMSE(points: ValidationPoint[]): number {
  const sumSquares = points.reduce((sum, p) => sum + p.absoluteError ** 2, 0);
  return Math.sqrt(sumSquares / points.length);
}

function calculateBias(points: ValidationPoint[]): number {
  return points.reduce((sum, p) => sum + (p.simulated - p.observed), 0) / points.length;
}

function analyzeValidationPoints(
  points: ValidationPoint[],
  tolerancePct: number
): ValidationMetrics {
  const rmse = calculateRMSE(points);
  const bias = calculateBias(points);
  const maxAbsError = Math.max(...points.map(p => Math.abs(p.absoluteError)));
  const maxPctError = Math.max(...points.map(p => Math.abs(p.percentError)));
  const withinTolerance = points.filter(p => Math.abs(p.percentError) <= tolerancePct).length;
  const passRate = (withinTolerance / points.length) * 100;

  return { rmse, bias, maxAbsError, maxPctError, passRate };
}

// ============================================================================
// MAIN VALIDATION RUN
// ============================================================================

async function runMiniHindcast(seed: number = 42) {
  console.log('='.repeat(80));
  console.log('MINI-HINDCAST VALIDATION (1990-2010)');
  console.log('='.repeat(80));
  console.log(`Seed: ${seed}`);
  console.log(`Start: January 1990`);
  console.log(`End: December 2010`);
  console.log(`Duration: 240 months (20 years)`);
  console.log('');

  // Create simulation
  const engine = new SimulationEngine({ seed });
  const rng: RNGFunction = engine.getRNG().next.bind(engine.getRNG());

  const state = await createHistoricalInitialState({
    year: 1990,
    rng,
    includeAIAgents: false,
    scenarioMode: 'historical'
  });

  console.log('Initial State:');
  console.log(`  CO2: ${state.resourceEconomy.co2.atmosphericCO2.toFixed(2)} ppm`);
  console.log(`  Temperature Anomaly: ${state.resourceEconomy.co2.temperatureAnomaly.toFixed(2)} °C`);
  console.log(`  Population: ${state.humanPopulationSystem.population.toFixed(2)} billion`);
  console.log('');

  // Validation tracking
  const co2Points: ValidationPoint[] = [];
  const tempPoints: ValidationPoint[] = [];
  const emissionsPoints: ValidationPoint[] = [];

  // Run simulation for 240 months
  console.log('Running simulation...');
  for (let month = 0; month < 240; month++) {
    engine.step(state);

    const currentYear = state.currentYear;
    const currentMonth = (state.currentMonth % 12) + 1;
    const simulatedCO2 = state.resourceEconomy.co2.atmosphericCO2;
    const simulatedTemp = state.resourceEconomy.co2.temperatureAnomaly;

    // Monthly CO2 validation
    const monthlyData = MONTHLY_CO2_DATA.find(
      ([y, m]) => y === currentYear && m === currentMonth
    );
    if (monthlyData) {
      const [, , observedCO2] = monthlyData;
      const absError = simulatedCO2 - observedCO2;
      const pctError = (absError / observedCO2) * 100;

      co2Points.push({
        month: state.currentMonth,
        year: currentYear,
        simulated: simulatedCO2,
        observed: observedCO2,
        absoluteError: absError,
        percentError: pctError,
      });
    }

    // Annual temperature validation (at December of each year)
    if (currentMonth === 12 && ANNUAL_TEMPERATURE_DATA[currentYear] !== undefined) {
      const observedTemp = ANNUAL_TEMPERATURE_DATA[currentYear];
      const absError = simulatedTemp - observedTemp;

      tempPoints.push({
        month: state.currentMonth,
        year: currentYear,
        simulated: simulatedTemp,
        observed: observedTemp,
        absoluteError: absError,
        percentError: 0,  // Not used for temperature (absolute metric)
      });
    }

    // Annual emissions validation (at December of each year)
    if (currentMonth === 12 && ANNUAL_EMISSIONS_DATA[currentYear] !== undefined) {
      const observedEmissions = ANNUAL_EMISSIONS_DATA[currentYear];
      const simulatedEmissions = state.resourceEconomy.co2.annualEmissions;

      // Defensive assertion: emissions should NEVER be NaN (indicates real bug)
      if (!isFinite(simulatedEmissions)) {
        throw new Error(
          `❌ CRITICAL: annualEmissions is ${simulatedEmissions} at year ${currentYear} month ${currentMonth}. ` +
          `This indicates a bug in climate/resource phases. Check updateCO2System() in resourceDepletion.ts`
        );
      }

      const absError = simulatedEmissions - observedEmissions;
      const pctError = (absError / observedEmissions) * 100;

      emissionsPoints.push({
        month: state.currentMonth,
        year: currentYear,
        simulated: simulatedEmissions,
        observed: observedEmissions,
        absoluteError: absError,
        percentError: pctError,
      });
    }

    // Progress indicator every year
    if (month > 0 && month % 12 === 0) {
      console.log(`  Year ${currentYear} complete (${month}/240 months)`);
    }
  }

  console.log('Simulation complete.\n');

  // ============================================================================
  // ANALYSIS
  // ============================================================================

  console.log('='.repeat(80));
  console.log('CO2 CONCENTRATION VALIDATION');
  console.log('='.repeat(80));
  console.log(`Data points: ${co2Points.length} monthly observations`);
  console.log(`Period: Jan 1990 - Dec 2010`);
  console.log(`Tolerance: ±5% (PASS), <2 ppm RMSE (EXCELLENT)`);
  console.log('');

  const co2Metrics = analyzeValidationPoints(co2Points, 5.0);
  console.log('Statistical Metrics:');
  console.log(`  RMSE: ${co2Metrics.rmse.toFixed(3)} ppm`);
  console.log(`  Bias: ${co2Metrics.bias.toFixed(3)} ppm (${co2Metrics.bias > 0 ? 'over' : 'under'}estimate)`);
  console.log(`  Max Absolute Error: ${co2Metrics.maxAbsError.toFixed(2)} ppm`);
  console.log(`  Max Percent Error: ${co2Metrics.maxPctError.toFixed(2)}%`);
  console.log(`  Pass Rate (±5%): ${co2Metrics.passRate.toFixed(1)}%`);
  console.log('');

  // Key checkpoints
  console.log('Key Checkpoints:');
  const checkpointYears = [1990, 1995, 2000, 2005, 2010];
  for (const year of checkpointYears) {
    const decPoint = co2Points.find(p => p.year === year && p.month % 12 === 11);
    if (decPoint) {
      const status = Math.abs(decPoint.percentError) <= 5.0 ? '✅' : '❌';
      console.log(`  ${year}: ${decPoint.simulated.toFixed(1)} ppm (obs: ${decPoint.observed.toFixed(1)}, error: ${decPoint.percentError.toFixed(2)}%) ${status}`);
    }
  }
  console.log('');

  // ============================================================================
  // TEMPERATURE VALIDATION
  // ============================================================================

  console.log('='.repeat(80));
  console.log('TEMPERATURE ANOMALY VALIDATION');
  console.log('='.repeat(80));
  console.log(`Data points: ${tempPoints.length} annual observations`);
  console.log(`Period: 1990 - 2010`);
  console.log(`Tolerance: ±0.10°C (PASS), <0.05°C RMSE (EXCELLENT)`);
  console.log('');

  const tempRmse = calculateRMSE(tempPoints);
  const tempBias = calculateBias(tempPoints);
  const tempMaxError = Math.max(...tempPoints.map(p => Math.abs(p.absoluteError)));
  const tempPassRate = (tempPoints.filter(p => Math.abs(p.absoluteError) <= 0.10).length / tempPoints.length) * 100;

  console.log('Statistical Metrics:');
  console.log(`  RMSE: ${tempRmse.toFixed(4)} °C`);
  console.log(`  Bias: ${tempBias.toFixed(4)} °C (${tempBias > 0 ? 'over' : 'under'}estimate)`);
  console.log(`  Max Absolute Error: ${tempMaxError.toFixed(3)} °C`);
  console.log(`  Pass Rate (±0.10°C): ${tempPassRate.toFixed(1)}%`);
  console.log('');

  console.log('Annual Trajectory:');
  for (const point of tempPoints) {
    const status = Math.abs(point.absoluteError) <= 0.10 ? '✅' : '❌';
    console.log(`  ${point.year}: ${point.simulated.toFixed(3)}°C (obs: ${point.observed.toFixed(3)}, Δ: ${point.absoluteError > 0 ? '+' : ''}${point.absoluteError.toFixed(3)}°C) ${status}`);
  }
  console.log('');

  // ============================================================================
  // EMISSIONS VALIDATION
  // ============================================================================

  console.log('='.repeat(80));
  console.log('EMISSIONS VALIDATION');
  console.log('='.repeat(80));
  console.log(`Data points: ${emissionsPoints.length} annual observations`);
  console.log(`Period: 1990 - 2010`);
  console.log(`Tolerance: ±10% (cumulative total)`);
  console.log('');

  const emissionsMetrics = analyzeValidationPoints(emissionsPoints, 10.0);
  const cumulativeObserved = emissionsPoints.reduce((sum, p) => sum + p.observed, 0);
  const cumulativeSimulated = emissionsPoints.reduce((sum, p) => sum + p.simulated, 0);
  const cumulativeError = ((cumulativeSimulated - cumulativeObserved) / cumulativeObserved) * 100;

  console.log('Statistical Metrics:');
  console.log(`  RMSE: ${emissionsMetrics.rmse.toFixed(2)} GtCO2/yr`);
  console.log(`  Bias: ${emissionsMetrics.bias.toFixed(2)} GtCO2/yr (${emissionsMetrics.bias > 0 ? 'over' : 'under'}estimate)`);
  console.log(`  Cumulative Observed: ${cumulativeObserved.toFixed(1)} GtCO2`);
  console.log(`  Cumulative Simulated: ${cumulativeSimulated.toFixed(1)} GtCO2`);
  console.log(`  Cumulative Error: ${cumulativeError.toFixed(2)}%`);
  console.log(`  Pass Rate (±10%): ${emissionsMetrics.passRate.toFixed(1)}%`);
  console.log('');

  // ============================================================================
  // FINAL ASSESSMENT
  // ============================================================================

  console.log('='.repeat(80));
  console.log('VALIDATION ASSESSMENT');
  console.log('='.repeat(80));

  const co2Pass = co2Metrics.passRate >= 80 && co2Metrics.maxPctError <= 5.0;
  const co2Excellent = co2Metrics.rmse < 2.0;
  const tempPass = tempPassRate >= 80 && tempMaxError <= 0.10;
  const tempExcellent = tempRmse < 0.05;
  const emissionsPass = Math.abs(cumulativeError) <= 10.0;

  console.log('');
  console.log('PASS Criteria:');
  console.log(`  CO2 within ±5%: ${co2Pass ? '✅ PASS' : '❌ FAIL'} (${co2Metrics.passRate.toFixed(1)}% pass rate, max error ${co2Metrics.maxPctError.toFixed(2)}%)`);
  console.log(`  Temperature within ±0.10°C: ${tempPass ? '✅ PASS' : '❌ FAIL'} (${tempPassRate.toFixed(1)}% pass rate, max error ${tempMaxError.toFixed(3)}°C)`);
  console.log(`  Cumulative emissions within ±10%: ${emissionsPass ? '✅ PASS' : '❌ FAIL'} (${cumulativeError.toFixed(2)}% error)`);
  console.log('');

  console.log('EXCELLENT Criteria:');
  console.log(`  CO2 RMSE < 2 ppm: ${co2Excellent ? '⭐ EXCELLENT' : '  Not met'} (${co2Metrics.rmse.toFixed(3)} ppm)`);
  console.log(`  Temperature RMSE < 0.05°C: ${tempExcellent ? '⭐ EXCELLENT' : '  Not met'} (${tempRmse.toFixed(4)}°C)`);
  console.log('');

  const overallPass = co2Pass && tempPass && emissionsPass;
  const overallGrade = overallPass
    ? (co2Excellent && tempExcellent ? 'EXCELLENT' : 'PASS')
    : 'FAIL';

  console.log(`Overall Grade: ${overallGrade}`);
  console.log('');

  if (!overallPass) {
    console.log('FAILURE ANALYSIS:');
    if (!co2Pass) {
      console.log('  ❌ CO2 trajectory deviates beyond tolerance');
      console.log(`     - Max error: ${co2Metrics.maxPctError.toFixed(2)}% (target: ≤5%)`);
      console.log(`     - RMSE: ${co2Metrics.rmse.toFixed(2)} ppm`);
      console.log(`     - Bias: ${co2Metrics.bias.toFixed(2)} ppm (${co2Metrics.bias > 0 ? 'systematic overestimate' : 'systematic underestimate'})`);
    }
    if (!tempPass) {
      console.log('  ❌ Temperature trajectory deviates beyond tolerance');
      console.log(`     - Max error: ${tempMaxError.toFixed(3)}°C (target: ≤0.10°C)`);
      console.log(`     - RMSE: ${tempRmse.toFixed(4)}°C`);
      console.log(`     - Bias: ${tempBias.toFixed(4)}°C (${tempBias > 0 ? 'systematic overestimate' : 'systematic underestimate'})`);
    }
    if (!emissionsPass) {
      console.log('  ❌ Cumulative emissions deviate beyond tolerance');
      console.log(`     - Error: ${cumulativeError.toFixed(2)}% (target: ≤10%)`);
      console.log(`     - Difference: ${(cumulativeSimulated - cumulativeObserved).toFixed(1)} GtCO2`);
    }
    console.log('');
    console.log('RECOMMENDED NEXT STEPS:');
    console.log('  1. Review carbon cycle parameters (airborne fraction, ocean/land uptake)');
    console.log('  2. Check climate sensitivity (TCR) calibration');
    console.log('  3. Validate emissions trajectory generation');
    console.log('  4. Run diagnostic scripts to identify specific phase failures');
  } else {
    console.log('✅ Climate subsystem validated against 1990-2010 historical record.');
    if (overallGrade === 'EXCELLENT') {
      console.log('⭐ High-fidelity reconstruction achieved.');
    }
  }

  console.log('='.repeat(80));

  return {
    co2Metrics,
    tempRmse,
    tempBias,
    tempMaxError,
    emissionsMetrics,
    cumulativeError,
    overallGrade,
    passed: overallPass,
  };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  const seed = 42;  // Fixed seed for reproducibility
  const result = await runMiniHindcast(seed);

  // Exit with error code if validation failed
  if (!result.passed) {
    process.exit(1);
  }
}

main().catch(err => {
  console.error(`\n❌ FATAL ERROR: ${err}`);
  if (err instanceof Error && err.stack) {
    console.error(err.stack);
  }
  process.exit(1);
});

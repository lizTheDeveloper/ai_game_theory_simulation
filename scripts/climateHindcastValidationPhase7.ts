#!/usr/bin/env tsx
/**
 * Phase 7: Climate Mini-Hindcast Validation (1990-2010) - RE-RUN
 *
 * CRITICAL CONTEXT: Previous run FAILED because implementations hadn't been merged yet.
 * NOW the code is actually present:
 * - Phase 5: historicalEmissionsMode flag + HISTORICAL_EMISSIONS_GCP lookup table ✅ MERGED (commit a47e341c4)
 * - Phase 6: 1990 fertility rates + _skipHistoricalBirthRateScaling ✅ MERGED (commit b5bf2951c)
 *
 * Configuration:
 * - scenarioMode: 'historical'
 * - startYear: 1990
 * - historicalEmissionsMode: true  // NOW ACTUALLY IMPLEMENTED
 * - includeAIAgents: false         // NOW PROPERLY ENFORCED
 *
 * Success Criteria:
 * - CO2 deviation < 5% (with historical forcing)
 * - Temperature deviation < 0.1°C (already passing)
 * - Population deviation < 10% (with demographics fix)
 *
 * Expected Outcomes:
 * - CO2: Should now track within 5% (GCP data instead of economic emissions)
 * - Population: Should now be 6.2-7.6B at 2010 (<10% vs 6.9B actual)
 * - Temperature: Should still pass
 */

import { runSimulation } from '../src/simulation/runSimulation';
import { interpolateClimateForMonth } from '../data/loaders/historicalClimateLoader';

interface ValidationRun {
  runId: number;
  finalCO2: number;
  finalTemp: number;
  finalPopulation: number;
  co2Deviation: number;
  tempDeviation: number;
  popDeviation: number;
}

async function main() {
  console.log('='.repeat(80));
  console.log('Phase 7: Climate Mini-Hindcast Validation (1990-2010) - RE-RUN');
  console.log('='.repeat(80));
  console.log();

  // Historical targets for 2010
  const HISTORICAL_2010 = {
    co2: 389.9,        // NOAA Mauna Loa
    temp: 0.85,        // HadCRUT5 anomaly vs 1850-1900
    population: 6.9e9  // UN data
  };

  console.log('Historical targets (2010):');
  console.log(`  CO2:         ${HISTORICAL_2010.co2.toFixed(1)} ppm`);
  console.log(`  Temperature: ${HISTORICAL_2010.temp.toFixed(2)}°C anomaly`);
  console.log(`  Population:  ${(HISTORICAL_2010.population / 1e9).toFixed(2)}B`);
  console.log();

  const N_RUNS = 10;
  const runs: ValidationRun[] = [];

  console.log(`Running ${N_RUNS} simulations (1990-2010, 240 months)...`);
  console.log();

  for (let i = 0; i < N_RUNS; i++) {
    console.log(`--- Run ${i + 1}/${N_RUNS} ---`);

    const result = await runSimulation({
      scenarioMode: 'historical',
      startYear: 1990,
      durationMonths: 240,  // 1990-2010 = 20 years
      historicalEmissionsMode: true,  // ✅ NOW IMPLEMENTED
      includeAIAgents: false,         // ✅ NOW PROPERLY ENFORCED
      randomSeed: 12345 + i,
      verbose: false
    });

    const finalState = result.history[result.history.length - 1];
    const finalCO2 = finalState.planetaryBoundaries.climateChange.co2Concentration;
    const finalTemp = finalState.planetaryBoundaries.climateChange.temperatureChange;
    const finalPopulation = finalState.humanPopulationSystem.population;

    const co2Deviation = Math.abs(finalCO2 - HISTORICAL_2010.co2) / HISTORICAL_2010.co2 * 100;
    const tempDeviation = Math.abs(finalTemp - HISTORICAL_2010.temp);
    const popDeviation = Math.abs(finalPopulation - HISTORICAL_2010.population) / HISTORICAL_2010.population * 100;

    runs.push({
      runId: i + 1,
      finalCO2,
      finalTemp,
      finalPopulation,
      co2Deviation,
      tempDeviation,
      popDeviation
    });

    console.log(`  CO2:         ${finalCO2.toFixed(1)} ppm (deviation: ${co2Deviation.toFixed(1)}%)`);
    console.log(`  Temperature: ${finalTemp.toFixed(2)}°C (deviation: ${tempDeviation.toFixed(2)}°C)`);
    console.log(`  Population:  ${(finalPopulation / 1e9).toFixed(2)}B (deviation: ${popDeviation.toFixed(1)}%)`);
    console.log();
  }

  // Calculate statistics
  const avgCO2 = runs.reduce((sum, r) => sum + r.finalCO2, 0) / N_RUNS;
  const avgTemp = runs.reduce((sum, r) => sum + r.finalTemp, 0) / N_RUNS;
  const avgPop = runs.reduce((sum, r) => sum + r.finalPopulation, 0) / N_RUNS;

  const avgCO2Dev = runs.reduce((sum, r) => sum + r.co2Deviation, 0) / N_RUNS;
  const avgTempDev = runs.reduce((sum, r) => sum + r.tempDeviation, 0) / N_RUNS;
  const avgPopDev = runs.reduce((sum, r) => sum + r.popDeviation, 0) / N_RUNS;

  const maxCO2Dev = Math.max(...runs.map(r => r.co2Deviation));
  const maxTempDev = Math.max(...runs.map(r => r.tempDeviation));
  const maxPopDev = Math.max(...runs.map(r => r.popDeviation));

  const sdCO2 = Math.sqrt(runs.reduce((sum, r) => sum + Math.pow(r.finalCO2 - avgCO2, 2), 0) / N_RUNS);
  const sdTemp = Math.sqrt(runs.reduce((sum, r) => sum + Math.pow(r.finalTemp - avgTemp, 2), 0) / N_RUNS);
  const sdPop = Math.sqrt(runs.reduce((sum, r) => sum + Math.pow(r.finalPopulation - avgPop, 2), 0) / N_RUNS);

  const cvCO2 = sdCO2 / avgCO2 * 100;
  const cvTemp = sdTemp / avgTemp * 100;
  const cvPop = sdPop / avgPop * 100;

  console.log('='.repeat(80));
  console.log('RESULTS SUMMARY');
  console.log('='.repeat(80));
  console.log();

  console.log('Average Final Values (2010):');
  console.log(`  CO2:         ${avgCO2.toFixed(1)} ppm (target: ${HISTORICAL_2010.co2.toFixed(1)})`);
  console.log(`  Temperature: ${avgTemp.toFixed(2)}°C (target: ${HISTORICAL_2010.temp.toFixed(2)})`);
  console.log(`  Population:  ${(avgPop / 1e9).toFixed(2)}B (target: ${(HISTORICAL_2010.population / 1e9).toFixed(2)}B)`);
  console.log();

  console.log('Average Deviations:');
  console.log(`  CO2:         ${avgCO2Dev.toFixed(1)}% (threshold: <5%)`);
  console.log(`  Temperature: ${avgTempDev.toFixed(2)}°C (threshold: <0.1°C)`);
  console.log(`  Population:  ${avgPopDev.toFixed(1)}% (threshold: <10%)`);
  console.log();

  console.log('Maximum Deviations:');
  console.log(`  CO2:         ${maxCO2Dev.toFixed(1)}%`);
  console.log(`  Temperature: ${maxTempDev.toFixed(2)}°C`);
  console.log(`  Population:  ${maxPopDev.toFixed(1)}%`);
  console.log();

  console.log('Coefficient of Variation (determinism check):');
  console.log(`  CO2:         ${cvCO2.toFixed(3)}% (expected: <0.01%)`);
  console.log(`  Temperature: ${cvTemp.toFixed(3)}% (expected: <0.01%)`);
  console.log(`  Population:  ${cvPop.toFixed(3)}% (expected: <0.01%)`);
  console.log();

  // Verdict
  const co2Pass = avgCO2Dev < 5;
  const tempPass = avgTempDev < 0.1;
  const popPass = avgPopDev < 10;

  const allPass = co2Pass && tempPass && popPass;

  console.log('='.repeat(80));
  console.log('VERDICT');
  console.log('='.repeat(80));
  console.log(`  CO2 Validation:         ${co2Pass ? '✅ PASS' : '❌ FAIL'} (${avgCO2Dev.toFixed(1)}% < 5%)`);
  console.log(`  Temperature Validation: ${tempPass ? '✅ PASS' : '❌ FAIL'} (${avgTempDev.toFixed(2)}°C < 0.1°C)`);
  console.log(`  Population Validation:  ${popPass ? '✅ PASS' : '❌ FAIL'} (${avgPopDev.toFixed(1)}% < 10%)`);
  console.log();
  console.log(`  Overall: ${allPass ? '✅ PHASE 7 COMPLETE' : '❌ VALIDATION FAILED'}`);
  console.log('='.repeat(80));

  // Detailed breakdown table
  console.log();
  console.log('DETAILED RUN BREAKDOWN:');
  console.log('─'.repeat(80));
  console.log('Run | CO2 (ppm) | Dev%  | Temp (°C) | Dev (°C) | Pop (B) | Dev%');
  console.log('─'.repeat(80));
  for (const run of runs) {
    console.log(
      `${run.runId.toString().padStart(3)} | ` +
      `${run.finalCO2.toFixed(1).padStart(9)} | ` +
      `${run.co2Deviation.toFixed(1).padStart(5)} | ` +
      `${run.finalTemp.toFixed(2).padStart(9)} | ` +
      `${run.tempDeviation.toFixed(2).padStart(8)} | ` +
      `${(run.finalPopulation / 1e9).toFixed(2).padStart(7)} | ` +
      `${run.popDeviation.toFixed(1).padStart(5)}`
    );
  }
  console.log('─'.repeat(80));

  process.exit(allPass ? 0 : 1);
}

main().catch(error => {
  console.error('❌ FATAL ERROR:', error);
  process.exit(1);
});

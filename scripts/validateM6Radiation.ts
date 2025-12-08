#!/usr/bin/env npx tsx
/**
 * Monte Carlo Validation for M-6 Enhanced Radiation Modeling
 *
 * Validates determinism and realistic behavior of enhanced radiation system.
 *
 * Success Criteria:
 * - N≥10 runs with same seed produce identical outputs
 * - Coefficient of variation < 0.01%
 * - Radiation deaths occur in nuclear scenarios
 * - Dual-track mortality (ARS + cancer) both non-zero in radiation zones
 */

import seedrandom from 'seedrandom';
import { initializeGameState } from '../src/simulation/gameStateInitialization';
import { simulateStep } from '../src/simulation/engine/simulationEngine';

const SEED = 42;
const NUM_RUNS = 10;
const NUM_MONTHS = 60; // 5 years

interface ValidationResult {
  run: number;
  seed: number;
  finalMonth: number;
  totalRadiationDeaths: number;
  acuteARSDeaths: number;
  chronicCancerDeaths: number;
  radiationZones: number;
  population: number;
}

async function runSimulation(seed: number, runNumber: number): Promise<ValidationResult> {
  const rng = seedrandom(`${seed}-${runNumber}`);
  const state = initializeGameState(rng);

  // Trigger nuclear scenario
  state.nuclearWinter.active = true;
  state.nuclearWinter.radiationZones = [
    {
      country: 'USA',
      hitMonth: 1,
      intensity: 0.8,
      decayRate: 0.05,
      currentLevel: 0.8,
      monthlyDeathRate: 0.01,
      doseRate: 0.15, // Acute exposure (>0.1 Gy/min)
      cumulativeDose: 5.0, // 5 Gy initial dose
      exposureType: 'acute' as const,
      initialDose: 5.0
    },
    {
      country: 'Russia',
      hitMonth: 1,
      intensity: 0.6,
      decayRate: 0.05,
      currentLevel: 0.6,
      monthlyDeathRate: 0.008,
      doseRate: 0.0001, // Chronic exposure
      cumulativeDose: 2.0,
      exposureType: 'chronic' as const,
      initialDose: 2.0
    }
  ];

  // Run simulation
  for (let month = 0; month < NUM_MONTHS; month++) {
    simulateStep(state, rng);
  }

  return {
    run: runNumber,
    seed: seed,
    finalMonth: state.currentMonth,
    totalRadiationDeaths: state.nuclearWinter.totalRadiationDeaths,
    acuteARSDeaths: state.nuclearWinter.acuteARSDeaths || 0,
    chronicCancerDeaths: state.nuclearWinter.chronicCancerDeaths || 0,
    radiationZones: state.nuclearWinter.radiationZones.length,
    population: state.humanPopulationSystem.population
  };
}

async function main() {
  console.log('🧪 Monte Carlo Validation: M-6 Enhanced Radiation Modeling\n');
  console.log(`Seed: ${SEED}`);
  console.log(`Runs: ${NUM_RUNS}`);
  console.log(`Months: ${NUM_MONTHS}\n`);

  const results: ValidationResult[] = [];

  // Run simulations
  for (let i = 0; i < NUM_RUNS; i++) {
    const result = await runSimulation(SEED, i);
    results.push(result);
    console.log(`Run ${i + 1}/${NUM_RUNS}: ${result.totalRadiationDeaths.toFixed(0)} deaths (ARS: ${result.acuteARSDeaths.toFixed(0)}, Cancer: ${result.chronicCancerDeaths.toFixed(0)})`);
  }

  console.log('\n📊 Validation Results:\n');

  // Check determinism
  const firstResult = results[0];
  const allIdentical = results.every(r =>
    r.totalRadiationDeaths === firstResult.totalRadiationDeaths &&
    r.acuteARSDeaths === firstResult.acuteARSDeaths &&
    r.chronicCancerDeaths === firstResult.chronicCancerDeaths
  );

  console.log(`✓ Determinism: ${allIdentical ? '✅ PASS' : '❌ FAIL'}`);

  if (!allIdentical) {
    console.log('\n  Values across runs:');
    results.forEach(r => {
      console.log(`  Run ${r.run}: Total=${r.totalRadiationDeaths}, ARS=${r.acuteARSDeaths}, Cancer=${r.chronicCancerDeaths}`);
    });
  }

  // Calculate coefficient of variation
  const values = results.map(r => r.totalRadiationDeaths);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const cv = mean > 0 ? (stdDev / mean) * 100 : 0;

  console.log(`✓ Coefficient of Variation: ${cv.toFixed(6)}% ${cv < 0.01 ? '✅ PASS' : '❌ FAIL'} (target: <0.01%)`);

  // Check realistic behavior
  const hasRadiationDeaths = firstResult.totalRadiationDeaths > 0;
  const hasDualTrack = firstResult.acuteARSDeaths > 0 && firstResult.chronicCancerDeaths > 0;

  console.log(`✓ Radiation Deaths Occur: ${hasRadiationDeaths ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`✓ Dual-Track Mortality: ${hasDualTrack ? '✅ PASS' : '❌ FAIL'} (ARS=${firstResult.acuteARSDeaths.toFixed(0)}, Cancer=${firstResult.chronicCancerDeaths.toFixed(0)})`);

  // Summary
  console.log('\n📈 Summary Statistics:\n');
  console.log(`  Mean Total Deaths: ${mean.toFixed(2)}`);
  console.log(`  Std Deviation: ${stdDev.toFixed(6)}`);
  console.log(`  ARS Deaths: ${firstResult.acuteARSDeaths.toFixed(2)}`);
  console.log(`  Cancer Deaths: ${firstResult.chronicCancerDeaths.toFixed(2)}`);
  console.log(`  Final Population: ${(firstResult.population / 1e9).toFixed(3)}B`);
  console.log(`  Radiation Zones: ${firstResult.radiationZones}`);

  const allPassed = allIdentical && cv < 0.01 && hasRadiationDeaths && hasDualTrack;

  console.log(`\n${allPassed ? '✅ ALL VALIDATION CHECKS PASSED' : '❌ VALIDATION FAILED'}`);

  process.exit(allPassed ? 0 : 1);
}

main().catch(error => {
  console.error('❌ Validation error:', error);
  process.exit(1);
});

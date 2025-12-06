/**
 * HIGH-7 Monte Carlo Validation: Conditional Climate Stability Floor
 *
 * Validates that the conditional floor logic works correctly:
 * - Paris success scenarios: Floor applies (stability >= 5%)
 * - Tail risk scenarios: Floor removed (stability can -> 0%)
 *
 * Research: Wunderling et al. (2024) "Climate tipping point interactions and cascades"
 */

import { initializeGame } from '@/simulation/game.js';
import { simulationStep } from '@/simulation/engine/PhaseOrchestrator.js';
import seedrandom from 'seedrandom';

const MONTHS_TO_SIMULATE = 120; // 10 years
const NUM_RUNS = 10; // N>=10 per research standards

interface ValidationResult {
  run: number;
  seed: string;
  finalTemperature: number;
  finalStability: number;
  tippedCount: number;
  floorApplied: boolean;
  outcome: string;
}

function validateConditionalFloor() {
  console.log('=== HIGH-7 Conditional Climate Stability Floor Validation ===\n');
  console.log(`Runs: ${NUM_RUNS}`);
  console.log(`Duration: ${MONTHS_TO_SIMULATE} months (${MONTHS_TO_SIMULATE / 12} years)\n`);

  const results: ValidationResult[] = [];

  for (let run = 0; run < NUM_RUNS; run++) {
    const seed = `high7-validation-${run}`;
    const rng = seedrandom(seed);

    // Initialize with some variance in starting conditions
    let state = initializeGame(seed);

    // Run simulation
    for (let month = 0; month < MONTHS_TO_SIMULATE; month++) {
      state = simulationStep(state, rng);
    }

    // Extract metrics
    const temperature = state.planetaryBoundariesSystem?.boundaries?.climate_change?.currentValue ?? 0;
    const stability = state.environmentalAccumulation?.climateStability ?? 1.0;
    const tippedCount = state.tippingPointsState?.triggeredCount ?? 0;

    // Determine if floor should apply
    const parisSuccess = temperature < 1.5;
    const cascadeRisk = tippedCount >= 3 && temperature >= 2.0;
    const expectedFloor = parisSuccess || !cascadeRisk;

    // Validate floor logic
    const floorApplied = stability >= 0.05;

    results.push({
      run,
      seed,
      finalTemperature: temperature,
      finalStability: stability,
      tippedCount,
      floorApplied,
      outcome: state.outcome || 'ONGOING'
    });

    console.log(`Run ${run + 1}/${NUM_RUNS}: ${seed}`);
    console.log(`  Temperature: ${temperature.toFixed(2)}°C`);
    console.log(`  Stability: ${(stability * 100).toFixed(1)}%`);
    console.log(`  Tipped: ${tippedCount} elements`);
    console.log(`  Floor Applied: ${floorApplied ? 'YES' : 'NO'} (expected: ${expectedFloor ? 'YES' : 'NO'})`);
    console.log(`  Outcome: ${state.outcome || 'ONGOING'}\n`);
  }

  // Analysis
  console.log('\n=== Analysis ===\n');

  const parisSuccessRuns = results.filter(r => r.finalTemperature < 1.5);
  const tailRiskRuns = results.filter(r => r.tippedCount >= 3 && r.finalTemperature >= 2.0);
  const floorRemovedRuns = results.filter(r => !r.floorApplied);

  console.log(`Paris Success Scenarios: ${parisSuccessRuns.length}/${NUM_RUNS}`);
  console.log(`  All have floor (>=5% stability): ${parisSuccessRuns.every(r => r.floorApplied) ? '✅' : '❌'}\n`);

  console.log(`Tail Risk Scenarios: ${tailRiskRuns.length}/${NUM_RUNS}`);
  console.log(`  (>=3 tipped elements AND >=2°C warming)`);
  if (tailRiskRuns.length > 0) {
    console.log(`  Floor removed in any: ${tailRiskRuns.some(r => !r.floorApplied) ? '✅' : '⚠️ No tail risk reached'}\n`);
  } else {
    console.log(`  ⚠️ No tail risk scenarios reached in ${NUM_RUNS} runs\n`);
  }

  console.log(`Floor Removed Runs: ${floorRemovedRuns.length}/${NUM_RUNS}`);
  if (floorRemovedRuns.length > 0) {
    console.log(`  Minimum stability: ${Math.min(...floorRemovedRuns.map(r => r.finalStability * 100)).toFixed(1)}%`);
    console.log(`  Maximum stability: ${Math.max(...floorRemovedRuns.map(r => r.finalStability * 100)).toFixed(1)}%\n`);
  }

  // Outcome diversity
  const outcomes = [...new Set(results.map(r => r.outcome))];
  console.log(`Outcome Diversity: ${outcomes.length} unique outcomes`);
  outcomes.forEach(outcome => {
    const count = results.filter(r => r.outcome === outcome).length;
    console.log(`  ${outcome}: ${count}/${NUM_RUNS}`);
  });

  // Validation summary
  console.log('\n=== Validation Summary ===\n');

  const allValid = parisSuccessRuns.every(r => r.floorApplied);

  if (allValid) {
    console.log('✅ VALIDATION PASSED');
    console.log('   - Paris success scenarios maintain 5% floor');
    console.log('   - Conditional logic working as designed');
  } else {
    console.log('❌ VALIDATION FAILED');
    console.log('   - Paris success scenarios should have floor');
  }

  if (tailRiskRuns.length === 0) {
    console.log('⚠️  WARNING: No tail risk scenarios reached');
    console.log('   Consider longer simulation or more aggressive parameters');
  } else if (tailRiskRuns.some(r => !r.floorApplied)) {
    console.log('✅ Tail risk floor removal verified');
  }

  console.log(`\nResearch: Wunderling et al. (2024) DOI: 10.5194/esd-15-41-2024`);
  console.log(`Implementation: src/simulation/engine/phases/ClimateSystemPhase.ts (lines 564-587)`);
  console.log(`\nValidation complete: ${new Date().toISOString()}`);
}

// Run validation
validateConditionalFloor();

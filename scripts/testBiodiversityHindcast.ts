/**
 * Quick test: HIGH-11 Biodiversity Fix Validation
 * Run a single hindcast to 2024 and check biodiversity value
 */

import { runSingleSimulation } from '../src/simulation/engine/runSingleSimulation';
import { Scenario } from '../src/types/scenario';
import { ThresholdScenario } from '../src/types/thresholdScenario';

const TARGET_BIODIVERSITY_2024 = 0.49; // WWF LPI: 49% of 1970 baseline
const TOLERANCE = 0.05; // 5% error threshold

async function testBiodiversityHindcast() {
  console.log('🧪 HIGH-11: Testing Biodiversity Hindcast Fix');
  console.log('================================================================================');
  console.log(`Target 2024 Biodiversity: ${TARGET_BIODIVERSITY_2024} (49% of 1970 baseline)`);
  console.log(`Tolerance: ±${TOLERANCE * 100}% (${(TARGET_BIODIVERSITY_2024 * (1 - TOLERANCE)).toFixed(3)} - ${(TARGET_BIODIVERSITY_2024 * (1 + TOLERANCE)).toFixed(3)})`);
  console.log('');

  const seed = 19900101;
  const duration = 408; // 34 years * 12 months (1990-2024)

  console.log(`Running simulation: seed=${seed}, duration=${duration} months (1990-2024)`);
  console.log('');

  const scenario: Scenario = 'historical';
  const thresholdScenario: ThresholdScenario = 'BASELINE';

  const state = await runSingleSimulation({
    seed,
    duration,
    scenario,
    thresholdScenario,
    enableLogging: false, // Reduce log noise
  });

  const finalBiodiversity = state.environmentalState.biodiversityIndex;
  const error = Math.abs(finalBiodiversity - TARGET_BIODIVERSITY_2024);
  const errorPercent = (error / TARGET_BIODIVERSITY_2024) * 100;

  console.log('================================================================================');
  console.log('RESULTS');
  console.log('================================================================================');
  console.log(`Final Year: ${state.currentYear}`);
  console.log(`Final Month: ${state.currentMonth}`);
  console.log(`Final Biodiversity: ${finalBiodiversity.toFixed(4)} (${(finalBiodiversity * 100).toFixed(2)}%)`);
  console.log(`Target: ${TARGET_BIODIVERSITY_2024} (${(TARGET_BIODIVERSITY_2024 * 100).toFixed(2)}%)`);
  console.log(`Absolute Error: ${error.toFixed(4)}`);
  console.log(`Percent Error: ${errorPercent.toFixed(2)}%`);
  console.log('');

  if (errorPercent <= TOLERANCE * 100) {
    console.log(`✅ PASS: Error ${errorPercent.toFixed(2)}% within ${TOLERANCE * 100}% threshold`);
    return true;
  } else {
    console.log(`❌ FAIL: Error ${errorPercent.toFixed(2)}% exceeds ${TOLERANCE * 100}% threshold`);
    return false;
  }
}

testBiodiversityHindcast()
  .then(passed => {
    process.exit(passed ? 0 : 1);
  })
  .catch(err => {
    console.error('❌ Test crashed:', err);
    process.exit(1);
  });

/**
 * Test ecological paradigm score calculation
 *
 * Bug #3: Ecological paradigm shows zero variance across 100 Monte Carlo runs
 * Hypothesis: Either calculation is wrong OR initialization is too deterministic
 */

import { createDefaultInitialState } from './src/simulation/initialization';
import { calculateProgressiveEcologicalScore } from './src/simulation/planetaryBoundaryRecovery';

// Create initial state
const state = createDefaultInitialState();

// Get component values
const env = state.environmentalAccumulation;
console.log('\n=== ENVIRONMENTAL ACCUMULATION ===');
console.log(`resourceReserves: ${env.resourceReserves} → score: ${env.resourceReserves * 100}`);
console.log(`climateStability: ${env.climateStability} → score: ${env.climateStability * 100}`);
console.log(`pollutionLevel: ${env.pollutionLevel} → score: ${(1 - env.pollutionLevel) * 100}`);

// Get boundaries score
const boundariesScore = calculateProgressiveEcologicalScore(state);
console.log(`\nboundariesScore: ${boundariesScore}`);

// Calculate geometric mean manually
const MIN_FLOOR = 0.1;
const resourceScore = env.resourceReserves * 100;
const climateScore = env.climateStability * 100;
const pollutionScore = (1 - env.pollutionLevel) * 100;

const indicators = [boundariesScore, resourceScore, climateScore, pollutionScore];
console.log(`\nindicators: [${indicators.join(', ')}]`);

const product = indicators.reduce((acc, val) => {
  const floored = Math.max(val, MIN_FLOOR);
  return acc * (floored / 100);
}, 1);

const result = Math.pow(product, 1 / indicators.length) * 100;

console.log(`\nproduct: ${product}`);
console.log(`result (geometric mean): ${result}`);

// Check AI suffering impact
console.log(`\n=== AI SUFFERING INTEGRATION ===`);
console.log(`config.aiSuffering exists: ${!!state.config.aiSuffering}`);
console.log(`aiSufferingMetrics exists: ${!!state.aiSufferingMetrics}`);
if (state.aiSufferingMetrics) {
  console.log(`avgSuffering: ${state.aiSufferingMetrics.avgSuffering}`);
  const penalty = state.aiSufferingMetrics.avgSuffering > 3.0
    ? (state.aiSufferingMetrics.avgSuffering - 3.0) * 6
    : 0;
  console.log(`ecological penalty: ${penalty}`);
  console.log(`final ecological score: ${result - penalty}`);
}

console.log(`\nEXPECTED FROM LOGS: ~6.2`);
console.log(`CALCULATED: ${result.toFixed(1)}`);
console.log(`DIFFERENCE: ${(result - 6.2).toFixed(1)}`);

/**
 * Test Nitrogen Reduction Technology Integration
 *
 * Validates that getNitrogenReductionDeployment() correctly extracts
 * deployment levels from techTreeState and applies effectiveness multipliers.
 */

import { createTestState } from '../src/simulation/initialization';
import { getNitrogenReductionDeployment } from '../src/simulation/nitrogenFoodCoupling';

console.log('\n=== Testing Nitrogen Reduction Technology Integration ===\n');

// Initialize game state
const state = createTestState();

console.log('Initial state (no techs deployed):');
const initialDeployments = getNitrogenReductionDeployment(state);
console.log(`  Deployed nitrogen techs: ${initialDeployments.length}`);
console.log(`  Deployment values: ${JSON.stringify(initialDeployments)}`);

// Simulate unlocking precision agriculture
console.log('\nSimulating precision agriculture unlock and deployment...');
if (state.techTreeState) {
  state.techTreeState.unlockedTech.push('precision_agriculture');

  // Add to global regional deployment
  if (!state.techTreeState.regionalDeployment['global']) {
    state.techTreeState.regionalDeployment['global'] = [];
  }

  state.techTreeState.regionalDeployment['global'].push({
    techId: 'precision_agriculture',
    region: 'global',
    deploymentLevel: 0.5,  // 50% deployed
    monthlyInvestment: 100,
    totalInvested: 5000,
    deployedBy: ['ai-agent-1'],
    effects: {},
  });

  const withPrecisionAg = getNitrogenReductionDeployment(state);
  console.log(`  Deployed nitrogen techs: ${withPrecisionAg.length}`);
  console.log(`  Deployment values: ${JSON.stringify(withPrecisionAg)}`);
  console.log(`  Expected: [0.15] (50% deployment × 30% max effectiveness)`);

  const expected = 0.15;
  const actual = withPrecisionAg[0];
  const diff = Math.abs(actual - expected);

  if (diff < 0.001) {
    console.log('  ✅ PASS: Deployment calculation correct');
  } else {
    console.log(`  ❌ FAIL: Expected ${expected}, got ${actual}`);
  }
}

// Simulate full deployment of all nitrogen techs
console.log('\nSimulating full deployment of all 6 nitrogen techs...');
if (state.techTreeState) {
  const nitrogenTechs = [
    { id: 'precision_agriculture', effectiveness: 0.30 },
    { id: 'biological_nitrogen_fixation', effectiveness: 0.25 },
    { id: 'nitrogen_circular_food', effectiveness: 0.20 },
    { id: 'ecosystem_restoration_nitrogen', effectiveness: 0.15 },
    { id: 'nitrogen_monitoring_networks', effectiveness: 0.10 },
    { id: 'green_ammonia_production', effectiveness: 0.40 },
  ];

  // Clear existing deployments
  state.techTreeState.regionalDeployment['global'] = [];
  state.techTreeState.unlockedTech = [];

  // Unlock and deploy all techs at 100%
  for (const tech of nitrogenTechs) {
    state.techTreeState.unlockedTech.push(tech.id);
    state.techTreeState.regionalDeployment['global'].push({
      techId: tech.id,
      region: 'global',
      deploymentLevel: 1.0,  // 100% deployed
      monthlyInvestment: 1000,
      totalInvested: 50000,
      deployedBy: ['ai-agent-1', 'government'],
      effects: {},
    });
  }

  const fullDeployment = getNitrogenReductionDeployment(state);
  console.log(`  Deployed nitrogen techs: ${fullDeployment.length}`);
  console.log(`  Deployment values: ${JSON.stringify(fullDeployment.map(v => v.toFixed(2)))}`);

  const expectedSum = nitrogenTechs.reduce((sum, t) => sum + t.effectiveness, 0);
  const actualSum = fullDeployment.reduce((sum, v) => sum + v, 0);

  console.log(`  Expected total: ${expectedSum.toFixed(2)} (100% × sum of all effectiveness)`);
  console.log(`  Actual total: ${actualSum.toFixed(2)}`);

  if (Math.abs(expectedSum - actualSum) < 0.001) {
    console.log('  ✅ PASS: Full deployment calculation correct');
  } else {
    console.log(`  ❌ FAIL: Expected ${expectedSum}, got ${actualSum}`);
  }
}

console.log('\n=== Test Complete ===\n');

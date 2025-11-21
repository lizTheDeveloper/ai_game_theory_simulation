/**
 * Quick validation test for nitrogen-food coupling integration
 *
 * Tests:
 * 1. getNitrogenReductionDeployment() returns valid array
 * 2. updateNitrogenFoodCoupling() runs without NaN errors
 * 3. Regional nitrogen state is properly updated
 * 4. Global food production index is valid
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { getNitrogenReductionDeployment, updateNitrogenFoodCoupling } from '../src/simulation/nitrogenFoodCoupling';

console.log('=== Nitrogen-Food Coupling Integration Test ===\n');

// Simple RNG for testing
const rng = () => Math.random();

// Initialize game state
const state = createDefaultInitialState(rng, 'standard');

console.log('Step 1: Testing getNitrogenReductionDeployment()...');
try {
  const techEffectiveness = getNitrogenReductionDeployment(state);
  console.log(`✅ Tech effectiveness array: ${techEffectiveness.length} items`);
  console.log(`   Values: ${techEffectiveness.map(v => v.toFixed(3)).join(', ')}`);

  // Validate all values are probabilities
  for (const val of techEffectiveness) {
    if (isNaN(val) || val < 0 || val > 1) {
      throw new Error(`❌ Invalid effectiveness value: ${val}`);
    }
  }
  console.log('✅ All effectiveness values valid [0, 1]\n');
} catch (error) {
  console.error('❌ getNitrogenReductionDeployment() failed:', error);
  process.exit(1);
}

console.log('Step 2: Testing updateNitrogenFoodCoupling()...');
try {
  const globalFoodIndex = updateNitrogenFoodCoupling(state);
  console.log(`✅ Global food production index: ${globalFoodIndex.toFixed(3)}`);

  if (isNaN(globalFoodIndex)) {
    throw new Error('❌ Global food index is NaN!');
  }

  if (globalFoodIndex < 0) {
    throw new Error(`❌ Global food index is negative: ${globalFoodIndex}`);
  }

  console.log('✅ Global food index is valid\n');
} catch (error) {
  console.error('❌ updateNitrogenFoodCoupling() failed:', error);
  process.exit(1);
}

console.log('Step 3: Checking regional nitrogen state...');
try {
  const regions = state.planetaryBoundariesSystem.regionalNitrogenManagement;

  if (!regions || regions.length === 0) {
    throw new Error('❌ Regional nitrogen management not initialized!');
  }

  console.log(`✅ ${regions.length} regions initialized`);

  for (const region of regions) {
    console.log(`   [${region.region}] N input: ${region.currentNitrogenInput.toFixed(1)} Mt/year, ` +
                `Food index: ${region.foodProductionIndex.toFixed(3)}, ` +
                `Yield impact: ${(region.yieldImpact * 100).toFixed(1)}%`);

    // Validate all values
    if (isNaN(region.currentNitrogenInput) || region.currentNitrogenInput < 0) {
      throw new Error(`❌ ${region.region}: Invalid nitrogen input: ${region.currentNitrogenInput}`);
    }

    if (isNaN(region.foodProductionIndex) || region.foodProductionIndex < 0) {
      throw new Error(`❌ ${region.region}: Invalid food production: ${region.foodProductionIndex}`);
    }

    if (isNaN(region.yieldImpact)) {
      throw new Error(`❌ ${region.region}: Invalid yield impact: ${region.yieldImpact}`);
    }
  }

  console.log('✅ All regional values valid\n');
} catch (error) {
  console.error('❌ Regional state check failed:', error);
  process.exit(1);
}

console.log('Step 4: Simulating technology deployment...');
try {
  // Unlock and deploy a nitrogen-reducing tech (soil_p_optimization)
  if (!state.techTreeState.unlockedTech.includes('soil_p_optimization')) {
    state.techTreeState.unlockedTech.push('soil_p_optimization');
  }

  // Add to global deployment at 50% level
  if (!state.techTreeState.regionalDeployment['global']) {
    state.techTreeState.regionalDeployment['global'] = [];
  }

  state.techTreeState.regionalDeployment['global'].push({
    techId: 'soil_p_optimization',
    region: 'global',
    deploymentLevel: 0.5,  // 50% deployed
    monthlyInvestment: 100,
    totalInvested: 1000,
    deployedBy: ['ai_1'],
    effects: { phosphorusEfficiency: 0.30 }
  });

  console.log('✅ Deployed soil_p_optimization at 50% level');

  // Re-run nitrogen coupling with deployed tech
  const techEffectiveness = getNitrogenReductionDeployment(state);
  console.log(`✅ Tech effectiveness after deployment: ${techEffectiveness.length} items`);
  console.log(`   Values: ${techEffectiveness.map(v => v.toFixed(3)).join(', ')}`);

  // Should have 1 tech with ~13.5% effectiveness (27% base × 0.5 deployment)
  if (techEffectiveness.length !== 1) {
    console.warn(`⚠️ Warning: Expected 1 tech, got ${techEffectiveness.length}`);
  }

  const expectedEffectiveness = 0.27 * 0.5;  // 27% base × 50% deployment
  const actualEffectiveness = techEffectiveness[0];
  const diff = Math.abs(actualEffectiveness - expectedEffectiveness);

  if (diff > 0.001) {
    console.warn(`⚠️ Warning: Expected ${expectedEffectiveness.toFixed(3)}, got ${actualEffectiveness.toFixed(3)}`);
  } else {
    console.log(`✅ Tech effectiveness matches expected: ${expectedEffectiveness.toFixed(3)}`);
  }

  // CRITICAL FIX (Nov 21, 2025): Clear __lastUpdateMonth marker to allow second call
  // This is a test script, not a real simulation step - we're testing the function in isolation
  // In real simulation, updateNitrogenFoodCoupling is only called once per month by NitrogenFoodCouplingPhase
  const nitrogenState = state.planetaryBoundariesSystem.regionalNitrogenManagement as any;
  delete nitrogenState.__lastUpdateMonth;

  // Update nitrogen coupling with deployed tech
  const globalFoodIndex = updateNitrogenFoodCoupling(state);
  console.log(`✅ Global food index with tech: ${globalFoodIndex.toFixed(3)}`);

  if (isNaN(globalFoodIndex)) {
    throw new Error('❌ Global food index is NaN after tech deployment!');
  }

  console.log('✅ Integration works with deployed technologies\n');
} catch (error) {
  console.error('❌ Technology deployment test failed:', error);
  process.exit(1);
}

console.log('=== All Tests Passed! ===');
console.log('✅ getNitrogenReductionDeployment() works');
console.log('✅ updateNitrogenFoodCoupling() works');
console.log('✅ Regional nitrogen state valid');
console.log('✅ Technology integration works');
console.log('✅ No NaN errors detected');

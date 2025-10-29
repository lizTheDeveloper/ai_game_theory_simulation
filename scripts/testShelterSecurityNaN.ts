/**
 * Test to reproduce shelterSecurity NaN bug
 *
 * Run with: npx tsx scripts/testShelterSecurityNaN.ts
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { calculateNonFoodSurvivalMetrics } from '../src/simulation/qualityOfLife/dimensions';
import { simulateMonth } from '../src/simulation/engine';

console.log('🔍 Testing shelterSecurity NaN bug...\n');

// Create initial state
const state = createDefaultInitialState();
const rng = () => Math.random(); // Simple RNG for testing

console.log('📊 Initial state:');
console.log(`  humanPopulationSystem.population: ${state.humanPopulationSystem.population}`);
console.log(`  globalMetrics.wealthDistribution: ${state.globalMetrics.wealthDistribution}`);
console.log(`  society.unemploymentLevel: ${state.society.unemploymentLevel}`);
console.log(`  refugeeCrisisSystem.activeRefugeeCrises: ${state.refugeeCrisisSystem.activeRefugeeCrises?.length || 0}`);
console.log(`  resourceEconomy.co2.temperatureAnomaly: ${state.resourceEconomy.co2.temperatureAnomaly}`);

try {
  console.log('\n✅ Testing initial calculateNonFoodSurvivalMetrics...');
  const initial = calculateNonFoodSurvivalMetrics(state);
  console.log(`  shelterSecurity: ${initial.shelterSecurity}`);
  console.log(`  waterSecurity: ${initial.waterSecurity}`);
  console.log(`  thermalHabitability: ${initial.thermalHabitability}`);
} catch (error) {
  console.log(`❌ ERROR on initial calculation: ${error}`);
  throw error;
}

// Simulate a few months to see if NaN appears
console.log('\n🔄 Simulating 12 months...');
for (let i = 0; i < 12; i++) {
  try {
    simulateMonth(state, rng);

    // Check shelter security after each month
    const metrics = calculateNonFoodSurvivalMetrics(state);

    if (isNaN(metrics.shelterSecurity)) {
      console.log(`\n❌ NaN detected at month ${state.currentMonth}!`);
      console.log('State at failure:');
      console.log(`  humanPopulationSystem.population: ${state.humanPopulationSystem.population}`);
      console.log(`  globalMetrics.wealthDistribution: ${state.globalMetrics.wealthDistribution}`);
      console.log(`  society.unemploymentLevel: ${state.society.unemploymentLevel}`);
      console.log(`  globalMetrics.economicTransitionStage: ${state.globalMetrics.economicTransitionStage}`);
      console.log(`  refugeeCrisisSystem: ${JSON.stringify(state.refugeeCrisisSystem, null, 2)}`);
      console.log(`  resourceEconomy.co2.temperatureAnomaly: ${state.resourceEconomy.co2.temperatureAnomaly}`);

      // Check AI agent state
      console.log(`  aiAgents: ${state.aiAgents.length} agents`);
      const totalAI = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
      const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, state.aiAgents.length);
      console.log(`  totalAI: ${totalAI}`);
      console.log(`  avgAlignment: ${avgAlignment}`);

      throw new Error('NaN detected in shelterSecurity');
    }

    if (i % 3 === 0) {
      console.log(`  Month ${state.currentMonth}: shelterSecurity=${metrics.shelterSecurity.toFixed(3)}`);
    }
  } catch (error) {
    console.log(`\n❌ ERROR at month ${state.currentMonth}: ${error}`);
    throw error;
  }
}

console.log('\n✅ Test completed - no NaN detected');

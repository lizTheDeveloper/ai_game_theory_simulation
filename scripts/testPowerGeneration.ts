/**
 * Test script for Power Generation & AI Energy Consumption system (TIER 4.4)
 *
 * Validates:
 * - AI inference efficiency improves exponentially
 * - Query volume grows linearly
 * - Net AI inference power DECREASES (efficiency > demand growth)
 * - Cryptocurrency power grows
 * - Grid mix evolves (renewable transition)
 * - Emissions are tracked
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { updatePowerGeneration, getPowerGenerationSummary, getAIEfficiencyTrend } from '../src/simulation/powerGeneration';

function testPowerGeneration() {
  console.log('\n=== POWER GENERATION SYSTEM TEST ===\n');

  // Create initial state
  const state = createDefaultInitialState();

  // Baseline (Month 0)
  console.log('📊 MONTH 0 (2025) - BASELINE:');
  console.log(getPowerGenerationSummary(state));

  const baseline = {
    dataCenterPower: state.powerGenerationSystem.dataCenterPower,
    aiInferencePower: state.powerGenerationSystem.aiInferencePower,
    inferenceEfficiency: state.powerGenerationSystem.inferenceEfficiency,
    queryVolume: state.powerGenerationSystem.queryVolume,
    cryptoPower: state.powerGenerationSystem.cryptoPower,
    renewablePercentage: state.powerGenerationSystem.renewablePercentage
  };

  // Simulate 12 months (1 year)
  console.log('\n⏩ SIMULATING 12 MONTHS...\n');
  for (let i = 0; i < 12; i++) {
    state.currentMonth++;
    updatePowerGeneration(state);
  }

  console.log('📊 MONTH 12 (2026) - AFTER 1 YEAR:');
  console.log(getPowerGenerationSummary(state));
  console.log(getAIEfficiencyTrend(state));

  // Validate key dynamics
  console.log('\n✅ VALIDATION CHECKS:\n');

  const afterOneYear = state.powerGenerationSystem;

  // 1. AI inference efficiency should improve dramatically (200x per year)
  const efficiencyGain = afterOneYear.inferenceEfficiency / baseline.inferenceEfficiency;
  console.log(`1. AI Efficiency Improvement: ${efficiencyGain.toFixed(1)}x (expected: ~200x)`);
  if (efficiencyGain > 100) {
    console.log('   ✅ PASS: Efficiency improved >100x (validates user\'s "100x in 2 years")');
  } else {
    console.log(`   ⚠️  WARNING: Efficiency gain lower than expected (${efficiencyGain.toFixed(1)}x)`);
  }

  // 2. Query volume should grow (50% per year)
  const queryGrowth = afterOneYear.queryVolume / baseline.queryVolume;
  console.log(`\n2. Query Volume Growth: ${queryGrowth.toFixed(2)}x (expected: ~1.5x)`);
  if (queryGrowth > 1.3 && queryGrowth < 1.7) {
    console.log('   ✅ PASS: Query volume grew ~50%');
  } else {
    console.log(`   ⚠️  WARNING: Query growth outside expected range (${queryGrowth.toFixed(2)}x)`);
  }

  // 3. AI inference power should DECREASE (efficiency > demand)
  const powerChange = afterOneYear.aiInferencePower / baseline.aiInferencePower;
  console.log(`\n3. AI Inference Power Change: ${powerChange.toFixed(2)}x (expected: <1.0, DECREASE)`);
  if (powerChange < 1.0) {
    console.log('   ✅ PASS: AI inference power DECREASED (efficiency wins!)');
    console.log(`   📉 Power reduction: ${((1 - powerChange) * 100).toFixed(1)}%`);
  } else {
    console.log(`   ❌ FAIL: AI inference power increased ${((powerChange - 1) * 100).toFixed(1)}% (should decrease)`);
  }

  // 4. Cryptocurrency power should grow
  const cryptoGrowth = afterOneYear.cryptoPower / baseline.cryptoPower;
  console.log(`\n4. Cryptocurrency Power Growth: ${cryptoGrowth.toFixed(2)}x (expected: ~1.15x)`);
  if (cryptoGrowth > 1.1 && cryptoGrowth < 1.2) {
    console.log('   ✅ PASS: Crypto power grew ~15% (as expected)');
  } else {
    console.log(`   ⚠️  WARNING: Crypto growth outside expected range (${cryptoGrowth.toFixed(2)}x)`);
  }

  // 5. Grid mix should evolve (renewable transition)
  const renewableGain = afterOneYear.renewablePercentage - baseline.renewablePercentage;
  console.log(`\n5. Renewable Percentage Change: +${(renewableGain * 100).toFixed(1)}% (expected: ~2%)`);
  if (renewableGain > 0.015 && renewableGain < 0.025) {
    console.log('   ✅ PASS: Renewable transition ~2% per year');
  } else {
    console.log(`   ⚠️  WARNING: Renewable transition outside expected range (+${(renewableGain * 100).toFixed(1)}%)`);
  }

  // 6. Check emissions tracking
  console.log(`\n6. Emissions Tracking:`);
  console.log(`   Monthly DC Emissions: ${afterOneYear.monthlyDataCenterEmissions.toFixed(2)} Mt CO2`);
  console.log(`   Cumulative DC Emissions: ${afterOneYear.cumulativeEmissions.toFixed(1)} Mt CO2`);
  if (afterOneYear.cumulativeEmissions > 0) {
    console.log('   ✅ PASS: Emissions are being tracked');
  } else {
    console.log('   ❌ FAIL: No emissions recorded');
  }

  // 7. Check CO2 system integration
  if (state.resourceEconomy && state.resourceEconomy.co2) {
    const co2Added = state.resourceEconomy.co2.cumulativeEmissions;
    console.log(`\n7. CO2 System Integration:`);
    console.log(`   CO2 added to resource economy: ${co2Added.toFixed(3)} Gt CO2`);
    if (co2Added > 0) {
      console.log('   ✅ PASS: Emissions integrated with CO2 system');
    } else {
      console.log('   ❌ FAIL: No emissions added to CO2 system');
    }
  }

  // Run 5 more years to test long-term trends
  console.log('\n\n⏩ SIMULATING 5 MORE YEARS (60 months)...\n');
  for (let i = 0; i < 60; i++) {
    state.currentMonth++;
    updatePowerGeneration(state);
  }

  console.log('📊 MONTH 72 (2031) - AFTER 6 YEARS:');
  console.log(getPowerGenerationSummary(state));
  console.log(getAIEfficiencyTrend(state));

  const afterSixYears = state.powerGenerationSystem;

  // Final validation: User's "100x in 2 years" claim
  console.log('\n\n🔍 VALIDATING USER CLAIM: "100x efficiency improvement in 2 years"\n');

  const twoYearEfficiencyGain = afterSixYears.inferenceEfficiency / baseline.inferenceEfficiency;
  console.log(`Efficiency improvement over 6 years: ${twoYearEfficiencyGain.toFixed(0)}x`);

  // Extrapolate to 2 years (24 months)
  const monthlyGrowthRate = Math.pow(twoYearEfficiencyGain, 1/72); // 72 months
  const twoYearProjection = Math.pow(monthlyGrowthRate, 24); // 24 months
  console.log(`Projected 2-year improvement: ${twoYearProjection.toFixed(0)}x`);

  if (twoYearProjection > 100) {
    console.log('✅ USER CLAIM VALIDATED: >100x improvement achievable in 2 years');
    console.log(`   Actual model: ${twoYearProjection.toFixed(0)}x in 2 years`);
  } else {
    console.log(`⚠️  USER CLAIM NOT VALIDATED: Only ${twoYearProjection.toFixed(0)}x in 2 years`);
  }

  // Check diminishing returns
  const firstYearGain = efficiencyGain;
  const lastYearGain = afterSixYears.inferenceEfficiency / afterOneYear.inferenceEfficiency / 5; // Average over 5 years
  console.log(`\n📉 Diminishing Returns Check:`);
  console.log(`   Year 1 gain: ${firstYearGain.toFixed(0)}x`);
  console.log(`   Year 2-6 average gain: ${lastYearGain.toFixed(0)}x/year`);
  if (lastYearGain < firstYearGain) {
    console.log('   ✅ Diminishing returns are working (growth slowing over time)');
  }

  console.log('\n=== TEST COMPLETE ===\n');
}

// Run test
testPowerGeneration();

/**
 * Monte Carlo Test for Power Generation System (TIER 4.4)
 *
 * 100 runs, 480 months (40 years), diverse seeds
 * Tests long-term power dynamics, efficiency trends, grid evolution
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { SimulationEngine } from '../src/simulation/engine';
import { getPowerGenerationSummary } from '../src/simulation/powerGeneration';

interface PowerGenerationStats {
  finalDataCenterPower: number;
  finalAIInferencePower: number;
  finalCryptoPower: number;
  finalRenewablePercentage: number;
  finalCarbonIntensity: number;
  efficiencyImprovement: number;  // Ratio
  cumulativeEmissions: number;
  aiPowerReduction: number;  // Percentage reduction
}

function runPowerGenerationMC(runs: number, months: number) {
  console.log(`\n=== POWER GENERATION MONTE CARLO TEST ===`);
  console.log(`Runs: ${runs}`);
  console.log(`Duration: ${months} months (${(months/12).toFixed(1)} years)`);
  console.log(`\nStarting...\n`);

  const stats: PowerGenerationStats[] = [];
  const baselineEfficiency = 3333; // 2024 baseline queries/kWh

  for (let run = 0; run < runs; run++) {
    const seed = 50000 + run;
    const state = createDefaultInitialState();
    const engine = new SimulationEngine({ seed, maxMonths: months, logLevel: 'summary' });

    // Capture baseline
    const baselineAIPower = state.powerGenerationSystem.aiInferencePower;

    // Run simulation
    const result = engine.run(state, { maxMonths: months, checkActualOutcomes: false });
    const finalState = result.finalState;
    const power = finalState.powerGenerationSystem;

    // Calculate stats
    const efficiencyImprovement = power.inferenceEfficiency / baselineEfficiency;
    const aiPowerReduction = ((baselineAIPower - power.aiInferencePower) / baselineAIPower) * 100;

    stats.push({
      finalDataCenterPower: power.dataCenterPower,
      finalAIInferencePower: power.aiInferencePower,
      finalCryptoPower: power.cryptoPower,
      finalRenewablePercentage: power.renewablePercentage,
      finalCarbonIntensity: power.carbonIntensity,
      efficiencyImprovement,
      cumulativeEmissions: power.cumulativeEmissions,
      aiPowerReduction
    });

    // Progress update every 10 runs
    if ((run + 1) % 10 === 0) {
      console.log(`[Run ${run + 1}/${runs}] Seed ${seed} - DC Power: ${power.dataCenterPower.toFixed(1)} TWh, AI Efficiency: ${efficiencyImprovement.toFixed(0)}x`);
    }
  }

  // Aggregate statistics
  console.log(`\n=== RESULTS (${runs} runs, ${months} months) ===\n`);

  const avgDataCenterPower = stats.reduce((sum, s) => sum + s.finalDataCenterPower, 0) / runs;
  const avgAIInferencePower = stats.reduce((sum, s) => sum + s.finalAIInferencePower, 0) / runs;
  const avgCryptoPower = stats.reduce((sum, s) => sum + s.finalCryptoPower, 0) / runs;
  const avgRenewable = stats.reduce((sum, s) => sum + s.finalRenewablePercentage, 0) / runs;
  const avgCarbonIntensity = stats.reduce((sum, s) => sum + s.finalCarbonIntensity, 0) / runs;
  const avgEfficiencyImprovement = stats.reduce((sum, s) => sum + s.efficiencyImprovement, 0) / runs;
  const avgEmissions = stats.reduce((sum, s) => sum + s.cumulativeEmissions, 0) / runs;
  const avgAIPowerReduction = stats.reduce((sum, s) => sum + s.aiPowerReduction, 0) / runs;

  const minDataCenterPower = Math.min(...stats.map(s => s.finalDataCenterPower));
  const maxDataCenterPower = Math.max(...stats.map(s => s.finalDataCenterPower));
  const minEfficiency = Math.min(...stats.map(s => s.efficiencyImprovement));
  const maxEfficiency = Math.max(...stats.map(s => s.efficiencyImprovement));

  console.log(`📊 DATA CENTER POWER:`);
  console.log(`   Average: ${avgDataCenterPower.toFixed(1)} TWh/month`);
  console.log(`   Range: ${minDataCenterPower.toFixed(1)} - ${maxDataCenterPower.toFixed(1)} TWh/month`);
  console.log(`   Baseline: 34.6 TWh/month (2024)`);

  console.log(`\n🤖 AI INFERENCE POWER:`);
  console.log(`   Average: ${avgAIInferencePower.toFixed(3)} TWh/month`);
  console.log(`   Average Reduction: ${avgAIPowerReduction.toFixed(1)}%`);
  console.log(`   Baseline: 7.87 TWh/month (2024)`);

  console.log(`\n💎 CRYPTOCURRENCY POWER:`);
  console.log(`   Average: ${avgCryptoPower.toFixed(1)} TWh/month`);
  console.log(`   Baseline: 8.3 TWh/month (2024)`);
  console.log(`   Growth: ${((avgCryptoPower / 8.3 - 1) * 100).toFixed(0)}%`);

  console.log(`\n⚡ AI EFFICIENCY IMPROVEMENT:`);
  console.log(`   Average: ${avgEfficiencyImprovement.toFixed(0)}x`);
  console.log(`   Range: ${minEfficiency.toFixed(0)}x - ${maxEfficiency.toFixed(0)}x`);
  console.log(`   Baseline: 3,333 queries/kWh (2024)`);

  console.log(`\n🌱 RENEWABLE TRANSITION:`);
  console.log(`   Average: ${(avgRenewable * 100).toFixed(1)}%`);
  console.log(`   Baseline: 30.0% (2024)`);
  console.log(`   Improvement: +${((avgRenewable - 0.30) * 100).toFixed(1)}%`);

  console.log(`\n☁️  CARBON INTENSITY:`);
  console.log(`   Average: ${avgCarbonIntensity.toFixed(0)} gCO2e/kWh`);
  console.log(`   Baseline: 548 gCO2e/kWh (2024)`);
  console.log(`   Reduction: ${((1 - avgCarbonIntensity / 548) * 100).toFixed(1)}%`);

  console.log(`\n🌍 CUMULATIVE EMISSIONS:`);
  console.log(`   Average: ${avgEmissions.toFixed(0)} Mt CO2`);
  console.log(`   (${(avgEmissions / 1000).toFixed(2)} Gt CO2)`);

  // Validation checks
  console.log(`\n✅ VALIDATION CHECKS:\n`);

  let passCount = 0;
  const totalChecks = 6;

  // Check 1: AI efficiency improved dramatically
  if (avgEfficiencyImprovement > 1000) {
    console.log(`✅ AI Efficiency: ${avgEfficiencyImprovement.toFixed(0)}x improvement (>1000x expected)`);
    passCount++;
  } else {
    console.log(`❌ AI Efficiency: Only ${avgEfficiencyImprovement.toFixed(0)}x improvement (<1000x)`);
  }

  // Check 2: AI inference power decreased
  if (avgAIPowerReduction > 90) {
    console.log(`✅ AI Inference Power: ${avgAIPowerReduction.toFixed(1)}% reduction (>90% expected)`);
    passCount++;
  } else {
    console.log(`❌ AI Inference Power: Only ${avgAIPowerReduction.toFixed(1)}% reduction (<90%)`);
  }

  // Check 3: Crypto power grew
  const cryptoGrowth = (avgCryptoPower / 8.3 - 1) * 100;
  if (cryptoGrowth > 100) {
    console.log(`✅ Crypto Power: ${cryptoGrowth.toFixed(0)}% growth (>100% expected over 40 years)`);
    passCount++;
  } else {
    console.log(`❌ Crypto Power: Only ${cryptoGrowth.toFixed(0)}% growth (<100%)`);
  }

  // Check 4: Renewable transition progressed
  const renewableGrowth = (avgRenewable - 0.30) * 100;
  if (renewableGrowth > 50) {
    console.log(`✅ Renewable Transition: +${renewableGrowth.toFixed(1)}% (>50% expected over 40 years)`);
    passCount++;
  } else {
    console.log(`❌ Renewable Transition: Only +${renewableGrowth.toFixed(1)}% (<50%)`);
  }

  // Check 5: Carbon intensity decreased
  const carbonReduction = (1 - avgCarbonIntensity / 548) * 100;
  if (carbonReduction > 30) {
    console.log(`✅ Carbon Intensity: ${carbonReduction.toFixed(1)}% reduction (>30% expected)`);
    passCount++;
  } else {
    console.log(`❌ Carbon Intensity: Only ${carbonReduction.toFixed(1)}% reduction (<30%)`);
  }

  // Check 6: Emissions accumulated
  if (avgEmissions > 10000) {
    console.log(`✅ Cumulative Emissions: ${avgEmissions.toFixed(0)} Mt CO2 (>10 Gt expected over 40 years)`);
    passCount++;
  } else {
    console.log(`❌ Cumulative Emissions: Only ${avgEmissions.toFixed(0)} Mt CO2 (<10 Gt)`);
  }

  console.log(`\n📈 OVERALL: ${passCount}/${totalChecks} checks passed`);

  if (passCount === totalChecks) {
    console.log(`🎉 ALL CHECKS PASSED! Power generation system working correctly.\n`);
  } else {
    console.log(`⚠️  Some checks failed. Review system behavior.\n`);
  }

  // Distribution analysis
  console.log(`\n=== DISTRIBUTION ANALYSIS ===\n`);

  // Quartiles for data center power
  const dcPowerSorted = stats.map(s => s.finalDataCenterPower).sort((a, b) => a - b);
  const q1_dc = dcPowerSorted[Math.floor(runs * 0.25)];
  const median_dc = dcPowerSorted[Math.floor(runs * 0.50)];
  const q3_dc = dcPowerSorted[Math.floor(runs * 0.75)];

  console.log(`Data Center Power (TWh/month):`);
  console.log(`   Q1: ${q1_dc.toFixed(1)}`);
  console.log(`   Median: ${median_dc.toFixed(1)}`);
  console.log(`   Q3: ${q3_dc.toFixed(1)}`);

  // Quartiles for efficiency improvement
  const efficiencySorted = stats.map(s => s.efficiencyImprovement).sort((a, b) => a - b);
  const q1_eff = efficiencySorted[Math.floor(runs * 0.25)];
  const median_eff = efficiencySorted[Math.floor(runs * 0.50)];
  const q3_eff = efficiencySorted[Math.floor(runs * 0.75)];

  console.log(`\nAI Efficiency Improvement (ratio):`);
  console.log(`   Q1: ${q1_eff.toFixed(0)}x`);
  console.log(`   Median: ${median_eff.toFixed(0)}x`);
  console.log(`   Q3: ${q3_eff.toFixed(0)}x`);

  // Power source breakdown
  const avgTraditionalCloud = avgDataCenterPower - avgAIInferencePower - avgCryptoPower;
  console.log(`\n=== FINAL POWER SOURCE BREAKDOWN ===\n`);
  console.log(`Total Data Center Power: ${avgDataCenterPower.toFixed(1)} TWh/month`);
  console.log(`  - AI Inference: ${avgAIInferencePower.toFixed(3)} TWh (${((avgAIInferencePower / avgDataCenterPower) * 100).toFixed(1)}%)`);
  console.log(`  - Cryptocurrency: ${avgCryptoPower.toFixed(1)} TWh (${((avgCryptoPower / avgDataCenterPower) * 100).toFixed(1)}%)`);
  console.log(`  - Traditional Cloud: ${avgTraditionalCloud.toFixed(1)} TWh (${((avgTraditionalCloud / avgDataCenterPower) * 100).toFixed(1)}%)`);

  console.log(`\n=== TEST COMPLETE ===\n`);
}

// Run Monte Carlo with 100 runs, 480 months (40 years)
runPowerGenerationMC(100, 480);

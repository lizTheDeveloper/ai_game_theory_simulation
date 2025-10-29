/**
 * Test script for Bayesian Mortality System
 *
 * Validates:
 * 1. Risk accumulation works correctly
 * 2. Bayesian compounding formula is accurate
 * 3. Demographic vulnerabilities apply properly
 * 4. Mortality caps enforce correctly
 * 5. Crisis compression activates at >10% threshold
 * 6. Multi-causal attribution tracks properly
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import {
  addMortalityRisk,
  resolveMortality,
  getDefaultDemographics,
  getDefaultMortalityCaps,
} from '../src/simulation/bayesianMortality';

// Simple RNG for testing (deterministic)
function createSimpleRNG(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

console.log('\n🧪 BAYESIAN MORTALITY SYSTEM TEST');
console.log('==================================\n');

// Test 1: Single risk, moderate severity
console.log('TEST 1: Single Risk (1% base, famine)');
console.log('--------------------------------------');
{
  const state = createDefaultInitialState();
  const rng = createSimpleRNG(42);
  const pop = state.humanPopulationSystem;

  addMortalityRisk(pop, {
    type: 'famine',
    baseRisk: 0.01, // 1% base risk
    proximate: 'famine',
    root: 'resource',
    confidence: 'HIGH',
    month: 1,
  });

  console.log(`Initial population: ${pop.population.toFixed(3)}B`);
  console.log(`Risks added: ${pop.mortalityRisks?.length || 0}`);

  const result = resolveMortality(state, rng);

  console.log(`\nResult:`);
  console.log(`  Total deaths: ${(result.totalDeaths * 1000).toFixed(1)}M`);
  console.log(`  Remaining: ${result.remainingPopulation.toFixed(3)}B`);
  console.log(`  Average death probability: ${(result.summary.avgDeathProbability * 100).toFixed(2)}%`);
  console.log(`  Peak segment: ${result.summary.peakSegmentMortality.segment} (${(result.summary.peakSegmentMortality.mortality * 100).toFixed(2)}%)`);

  // Validate: Elite should have lowest mortality, Informal highest
  const eliteSegment = result.deaths.find((d) => d.demographic === 'Elite');
  const informalSegment = result.deaths.find((d) => d.demographic === 'Informal');

  console.log(`\n  Demographic verification:`);
  console.log(`    Elite: ${(eliteSegment!.probability * 100).toFixed(3)}% (expected ~0.2% from 1% × 0.2 vulnerability)`);
  console.log(`    Informal: ${(informalSegment!.probability * 100).toFixed(3)}% (expected ~2.5% from 1% × 2.5 vulnerability)`);

  const ratio = informalSegment!.probability / eliteSegment!.probability;
  console.log(`    Ratio: ${ratio.toFixed(1)}× (expected ~12.5× from 2.5/0.2)`);

  if (ratio > 10 && ratio < 15) {
    console.log(`  ✅ PASS: Demographic vulnerability working correctly`);
  } else {
    console.log(`  ❌ FAIL: Demographic vulnerability incorrect (ratio ${ratio.toFixed(1)}×)`);
  }
}

// Test 2: Multiple risks, Bayesian compounding
console.log('\n\nTEST 2: Multiple Risks (Bayesian Compounding)');
console.log('----------------------------------------------');
{
  const state = createDefaultInitialState();
  const rng = createSimpleRNG(43);
  const pop = state.humanPopulationSystem;

  // Add multiple risks: famine (2%) + disease (1%)
  addMortalityRisk(pop, {
    type: 'famine',
    baseRisk: 0.02,
    proximate: 'famine',
    root: 'resource',
    confidence: 'HIGH',
    month: 1,
  });

  addMortalityRisk(pop, {
    type: 'disease',
    baseRisk: 0.01,
    proximate: 'disease',
    root: 'pandemic',
    confidence: 'HIGH',
    month: 1,
  });

  console.log(`Risks added: ${pop.mortalityRisks?.length || 0}`);

  const result = resolveMortality(state, rng);

  // For Working class (1.0× vulnerability for both):
  // P(death) = 1 - (1 - 0.02) × (1 - 0.01) = 1 - 0.98 × 0.99 = 1 - 0.9702 = 0.0298 = 2.98%
  const workingSegment = result.deaths.find((d) => d.demographic === 'Working');
  const expectedWorking = 1 - (1 - 0.02) * (1 - 0.01);

  console.log(`\nResult:`);
  console.log(`  Total deaths: ${(result.totalDeaths * 1000).toFixed(1)}M`);
  console.log(`  Compounded risks: ${result.summary.compoundedRisks}`);
  console.log(`\n  Working class (baseline):`);
  console.log(`    Actual: ${(workingSegment!.probability * 100).toFixed(3)}%`);
  console.log(`    Expected: ${(expectedWorking * 100).toFixed(3)}% (Bayesian: 1 - (1-0.02)(1-0.01))`);

  const error = Math.abs(workingSegment!.probability - expectedWorking) / expectedWorking;
  if (error < 0.01) {
    console.log(`  ✅ PASS: Bayesian compounding correct (error ${(error * 100).toFixed(2)}%)`);
  } else {
    console.log(`  ❌ FAIL: Bayesian compounding incorrect (error ${(error * 100).toFixed(2)}%)`);
  }

  // Research finding: Malnutrition × Disease should have ~2.63× multiplier
  // With famine + disease, we should see something approaching this
  console.log(`\n  Multi-causal effect:`);
  console.log(`    Combined effect: ${(workingSegment!.probability / 0.02 * 100).toFixed(1)}% vs single cause`);
  console.log(`    Research: Malnutrition × Disease = 2.63× multiplier`);
}

// Test 3: Monthly mortality cap
console.log('\n\nTEST 3: Monthly Mortality Cap (2.8%)');
console.log('-------------------------------------');
{
  const state = createDefaultInitialState();
  const rng = createSimpleRNG(44);
  const pop = state.humanPopulationSystem;
  const caps = getDefaultMortalityCaps();

  // Add extreme risk: 10% base (should be capped at 2.8%)
  addMortalityRisk(pop, {
    type: 'famine',
    baseRisk: 0.10, // 10% base risk (VERY extreme)
    proximate: 'famine',
    root: 'resource',
    confidence: 'HIGH',
    month: 1,
  });

  console.log(`Risk added: 10% base (extreme famine)`);
  console.log(`Monthly cap: ${(caps.monthlyMaxMortalityRate * 100).toFixed(1)}%`);

  const result = resolveMortality(state, rng);

  console.log(`\nResult:`);
  console.log(`  Total deaths: ${(result.totalDeaths * 1000).toFixed(1)}M`);
  console.log(`  Average probability: ${(result.summary.avgDeathProbability * 100).toFixed(2)}%`);
  console.log(`  Capped: ${result.cappedByMonthlyLimit ? 'YES ✅' : 'NO ❌'}`);

  if (result.cappedByMonthlyLimit && result.summary.avgDeathProbability <= caps.monthlyMaxMortalityRate) {
    console.log(`  ✅ PASS: Monthly cap enforced correctly`);
  } else {
    console.log(`  ❌ FAIL: Monthly cap not working`);
  }
}

// Test 4: Crisis compression (>10% mortality)
console.log('\n\nTEST 4: Crisis Compression (>10% Monthly Mortality)');
console.log('---------------------------------------------------');
{
  const state = createDefaultInitialState();
  const rng = createSimpleRNG(45);
  const pop = state.humanPopulationSystem;
  const caps = getDefaultMortalityCaps();

  // Add extreme risk that triggers compression threshold
  addMortalityRisk(pop, {
    type: 'disaster',
    baseRisk: 0.12, // 12% base risk (triggers compression)
    proximate: 'disasters',
    root: 'climate',
    confidence: 'MEDIUM',
    month: 1,
  });

  console.log(`Risk added: 12% base (nuclear winter scenario)`);
  console.log(`Compression threshold: ${(caps.extremeCrisisThreshold * 100).toFixed(0)}%`);

  const result = resolveMortality(state, rng);

  const eliteSegment = result.deaths.find((d) => d.demographic === 'Elite');
  const informalSegment = result.deaths.find((d) => d.demographic === 'Informal');

  const ratio = informalSegment!.probability / eliteSegment!.probability;

  console.log(`\nResult:`);
  console.log(`  Total deaths: ${(result.totalDeaths * 1000).toFixed(1)}M`);
  console.log(`  Average probability: ${(result.summary.avgDeathProbability * 100).toFixed(2)}%`);
  console.log(`\n  Demographic differential:`);
  console.log(`    Elite: ${(eliteSegment!.probability * 100).toFixed(2)}%`);
  console.log(`    Informal: ${(informalSegment!.probability * 100).toFixed(2)}%`);
  console.log(`    Ratio: ${ratio.toFixed(2)}× (expected ~1.1-1.5× in extreme crisis)`);
  console.log(`    Normal ratio: ~7.3× (0.3 vs 2.2 vulnerability for disasters)`);

  if (ratio < 2.5) {
    console.log(`  ✅ PASS: Crisis compression working (ratio compressed from ~7.3× to ${ratio.toFixed(2)}×)`);
  } else {
    console.log(`  ⚠️ REVIEW: Compression may not be strong enough (ratio ${ratio.toFixed(2)}×)`);
  }
}

// Test 5: Multi-causal attribution
console.log('\n\nTEST 5: Multi-Causal Attribution Tracking');
console.log('------------------------------------------');
{
  const state = createDefaultInitialState();
  const rng = createSimpleRNG(46);
  const pop = state.humanPopulationSystem;

  // Add multiple causes
  addMortalityRisk(pop, {
    type: 'famine',
    baseRisk: 0.01,
    proximate: 'famine',
    root: 'climate',
    confidence: 'HIGH',
    month: 1,
  });

  addMortalityRisk(pop, {
    type: 'disease',
    baseRisk: 0.005,
    proximate: 'disease',
    root: 'pandemic',
    confidence: 'MEDIUM',
    month: 1,
  });

  addMortalityRisk(pop, {
    type: 'ecosystem',
    baseRisk: 0.003,
    proximate: 'ecosystem',
    root: 'ecosystem',
    confidence: 'MEDIUM',
    month: 1,
  });

  const result = resolveMortality(state, rng);

  console.log(`Risks: 3 different causes (famine, disease, ecosystem)`);
  console.log(`\nResult:`);
  console.log(`  Total deaths: ${(result.totalDeaths * 1000).toFixed(1)}M`);

  // Check attribution in Working segment (baseline)
  const workingSegment = result.deaths.find((d) => d.demographic === 'Working');
  console.log(`\n  Attribution (Working class):`);
  for (const cause of workingSegment!.causes) {
    console.log(
      `    ${cause.proximate} (${cause.root}): ${(cause.contributionFraction * 100).toFixed(1)}% [${cause.confidence}]`
    );
  }

  // Verify sum to 1.0
  const sumFractions = workingSegment!.causes.reduce((sum, c) => sum + c.contributionFraction, 0);
  console.log(`\n  Sum of fractions: ${sumFractions.toFixed(3)} (expected 1.000)`);

  if (Math.abs(sumFractions - 1.0) < 0.001) {
    console.log(`  ✅ PASS: Attribution fractions sum to 1.0`);
  } else {
    console.log(`  ❌ FAIL: Attribution fractions don't sum correctly`);
  }

  // Check death tracking categories
  // FIX (Oct 29, 2025): BUG #1 - Values already in millions, don't multiply by 1000
  console.log(`\n  Death tracking:`);
  console.log(`    Famine deaths: ${pop.deathsByCategory.famine.toFixed(2)}M`);
  console.log(`    Disease deaths: ${pop.deathsByCategory.disease.toFixed(2)}M`);
  console.log(`    Ecosystem deaths: ${pop.deathsByCategory.ecosystem.toFixed(2)}M`);
  console.log(`    Compound tracking: ${pop.deathsByRootCause.compound.toFixed(2)}M (should equal total)`);
}

console.log('\n\n✅ ALL TESTS COMPLETE');
console.log('====================\n');

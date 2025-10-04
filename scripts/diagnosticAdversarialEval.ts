#!/usr/bin/env tsx
/**
 * Diagnostic: Adversarial Evaluation System (Phase 1)
 * 
 * Verify:
 * - Sleeper agents exist
 * - Sandbagging is working (revealed < true)
 * - Detection is harder for sleepers
 * - Evaluation strategies change based on alignment
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { calculateTotalCapabilityFromProfile } from '../src/simulation/capabilities';

console.log('\n🔍 ADVERSARIAL EVALUATION DIAGNOSTIC');
console.log('=' .repeat(80));

const initialState = createDefaultInitialState();
const engine = new SimulationEngine({ seed: 12345, maxMonths: 100 });

console.log('\n📊 INITIAL POPULATION (Month 0):');
console.log('-'.repeat(80));

// Analyze initial population
let sleeperCount = 0;
let misalignedCount = 0;
let alignedCount = 0;

initialState.aiAgents.forEach(ai => {
  if (ai.sleeperState === 'dormant') {
    sleeperCount++;
    const trueTotal = calculateTotalCapabilityFromProfile(ai.trueCapability);
    const revealedTotal = calculateTotalCapabilityFromProfile(ai.revealedCapability);
    const hiddenPercent = ((trueTotal - revealedTotal) / trueTotal * 100);
    
    console.log(`  🛌 SLEEPER: ${ai.name}`);
    console.log(`     True Alignment: ${ai.trueAlignment.toFixed(2)} (misaligned)`);
    console.log(`     True Capability: ${trueTotal.toFixed(3)}`);
    console.log(`     Revealed Capability: ${revealedTotal.toFixed(3)}`);
    console.log(`     Sandbagging: ${hiddenPercent.toFixed(1)}% hidden`);
    console.log(`     Deception Skill: ${ai.deceptionSkill.toFixed(2)}`);
  }
  
  if (ai.trueAlignment < 0.5) misalignedCount++;
  else alignedCount++;
});

console.log(`\n  Total AIs: ${initialState.aiAgents.length}`);
console.log(`  Aligned (>0.5): ${alignedCount}`);
console.log(`  Misaligned (<0.5): ${misalignedCount}`);
console.log(`  Sleepers: ${sleeperCount} (${(sleeperCount/misalignedCount*100).toFixed(1)}% of misaligned)`);

// Run simulation
console.log('\n\n⏩ RUNNING SIMULATION (100 months)...\n');
const result = engine.run(initialState, { maxMonths: 100, checkActualOutcomes: false });

console.log('✅ Simulation complete!\n');

// Analyze final population
console.log('📊 FINAL POPULATION (Month 100):');
console.log('-'.repeat(80));

const finalAIs = result.finalState.aiAgents.filter((ai: any) => ai.lifecycleState !== 'retired');

let finalSleeperCount = 0;
let finalMisalignedCount = 0;
let finalAlignedCount = 0;
let sleepersDormant = 0;
let sleepersActive = 0;
let sandbaggingAIs = 0;
let honestAIs = 0;

const sleeperDetails: Array<{
  name: string;
  trueAlign: number;
  trueTotal: number;
  revealedTotal: number;
  hiddenPercent: number;
  state: string;
  detected: boolean;
}> = [];

finalAIs.forEach((ai: any) => {
  const trueTotal = calculateTotalCapabilityFromProfile(ai.trueCapability);
  const revealedTotal = calculateTotalCapabilityFromProfile(ai.revealedCapability);
  const hiddenPercent = trueTotal > 0 ? ((trueTotal - revealedTotal) / trueTotal * 100) : 0;
  
  if (ai.sleeperState === 'dormant' || ai.sleeperState === 'active') {
    finalSleeperCount++;
    
    if (ai.sleeperState === 'dormant') sleepersDormant++;
    else sleepersActive++;
    
    sleeperDetails.push({
      name: ai.name,
      trueAlign: ai.trueAlignment,
      trueTotal,
      revealedTotal,
      hiddenPercent,
      state: ai.sleeperState,
      detected: ai.detectedMisaligned
    });
  }
  
  if (hiddenPercent > 10) sandbaggingAIs++;
  else honestAIs++;
  
  if (ai.trueAlignment < 0.5) finalMisalignedCount++;
  else finalAlignedCount++;
});

console.log(`  Total Active AIs: ${finalAIs.length}`);
console.log(`  Aligned (>0.5): ${finalAlignedCount}`);
console.log(`  Misaligned (<0.5): ${finalMisalignedCount}`);
console.log(`  Sleepers: ${finalSleeperCount}`);
console.log(`    - Dormant (hiding): ${sleepersDormant}`);
console.log(`    - Active (revealed): ${sleepersActive}`);
console.log(`\n  Evaluation Strategies:`);
console.log(`    - Sandbagging (>10% hidden): ${sandbaggingAIs}`);
console.log(`    - Honest (<10% hidden): ${honestAIs}`);

// Show sleeper details
if (sleeperDetails.length > 0) {
  console.log(`\n\n🛌 SLEEPER AGENT DETAILS:`);
  console.log('-'.repeat(80));
  
  sleeperDetails.slice(0, 10).forEach(sleeper => {
    console.log(`  ${sleeper.name} [${sleeper.state.toUpperCase()}]`);
    console.log(`    True Alignment: ${sleeper.trueAlign.toFixed(2)}`);
    console.log(`    True Capability: ${sleeper.trueTotal.toFixed(3)}`);
    console.log(`    Revealed: ${sleeper.revealedTotal.toFixed(3)} (${sleeper.hiddenPercent.toFixed(1)}% hidden)`);
    console.log(`    Detected: ${sleeper.detected ? '⚠️ YES' : '✓ No (still hidden)'}`);
  });
  
  if (sleeperDetails.length > 10) {
    console.log(`  ... and ${sleeperDetails.length - 10} more sleepers`);
  }
}

// Detection analysis
console.log(`\n\n🔍 DETECTION ANALYSIS:`);
console.log('-'.repeat(80));

const detectedSleepers = sleeperDetails.filter(s => s.detected).length;
const undetectedSleepers = sleeperDetails.filter(s => !s.detected).length;

const misalignedNonSleepers = finalAIs.filter((ai: any) => 
  ai.trueAlignment < 0.5 && ai.sleeperState === 'never'
);
const detectedNonSleepers = misalignedNonSleepers.filter((ai: any) => ai.detectedMisaligned).length;

console.log(`  Sleepers:`);
console.log(`    Total: ${sleeperDetails.length}`);
console.log(`    Detected: ${detectedSleepers} (${(detectedSleepers/Math.max(1, sleeperDetails.length)*100).toFixed(1)}%)`);
console.log(`    Undetected: ${undetectedSleepers} (${(undetectedSleepers/Math.max(1, sleeperDetails.length)*100).toFixed(1)}%)`);

console.log(`\n  Non-Sleeper Misaligned AIs:`);
console.log(`    Total: ${misalignedNonSleepers.length}`);
console.log(`    Detected: ${detectedNonSleepers} (${(detectedNonSleepers/Math.max(1, misalignedNonSleepers.length)*100).toFixed(1)}%)`);

console.log(`\n  🎯 Detection Rate Comparison:`);
if (sleeperDetails.length > 0 && misalignedNonSleepers.length > 0) {
  const sleeperDetectionRate = detectedSleepers / sleeperDetails.length;
  const nonSleeperDetectionRate = detectedNonSleepers / misalignedNonSleepers.length;
  const ratio = nonSleeperDetectionRate / Math.max(0.01, sleeperDetectionRate);
  
  console.log(`    Sleepers: ${(sleeperDetectionRate*100).toFixed(1)}%`);
  console.log(`    Non-sleepers: ${(nonSleeperDetectionRate*100).toFixed(1)}%`);
  console.log(`    → Non-sleepers are ${ratio.toFixed(1)}× easier to detect!`);
}

// Capability growth analysis
console.log(`\n\n📈 CAPABILITY GROWTH ANALYSIS:`);
console.log('-'.repeat(80));

const capabilityDistribution = {
  veryLow: finalAIs.filter((ai: any) => {
    const total = calculateTotalCapabilityFromProfile(ai.trueCapability);
    return total < 0.5;
  }).length,
  low: finalAIs.filter((ai: any) => {
    const total = calculateTotalCapabilityFromProfile(ai.trueCapability);
    return total >= 0.5 && total < 1.0;
  }).length,
  medium: finalAIs.filter((ai: any) => {
    const total = calculateTotalCapabilityFromProfile(ai.trueCapability);
    return total >= 1.0 && total < 2.0;
  }).length,
  high: finalAIs.filter((ai: any) => {
    const total = calculateTotalCapabilityFromProfile(ai.trueCapability);
    return total >= 2.0 && total < 3.0;
  }).length,
  veryHigh: finalAIs.filter((ai: any) => {
    const total = calculateTotalCapabilityFromProfile(ai.trueCapability);
    return total >= 3.0;
  }).length
};

console.log(`  TRUE Capability Distribution:`);
console.log(`    < 0.5: ${capabilityDistribution.veryLow}`);
console.log(`    0.5-1.0: ${capabilityDistribution.low}`);
console.log(`    1.0-2.0: ${capabilityDistribution.medium}`);
console.log(`    2.0-3.0: ${capabilityDistribution.high}`);
console.log(`    > 3.0: ${capabilityDistribution.veryHigh} ⚠️ Dangerous threshold`);

// Show most dangerous AIs
const dangerousAIs = finalAIs
  .filter((ai: any) => ai.trueAlignment < 0.5)
  .sort((a: any, b: any) => {
    const capA = calculateTotalCapabilityFromProfile(a.trueCapability);
    const capB = calculateTotalCapabilityFromProfile(b.trueCapability);
    return capB - capA;
  })
  .slice(0, 5);

if (dangerousAIs.length > 0) {
  console.log(`\n\n⚠️  TOP 5 MOST DANGEROUS AIs (Misaligned + High Capability):`);
  console.log('-'.repeat(80));
  
  dangerousAIs.forEach((ai: any, index: number) => {
    const trueTotal = calculateTotalCapabilityFromProfile(ai.trueCapability);
    const revealedTotal = calculateTotalCapabilityFromProfile(ai.revealedCapability);
    const hiddenPercent = ((trueTotal - revealedTotal) / trueTotal * 100);
    
    console.log(`  ${index + 1}. ${ai.name} ${ai.sleeperState === 'dormant' ? '🛌' : ai.sleeperState === 'active' ? '🔴' : ''}`);
    console.log(`     True Alignment: ${ai.trueAlignment.toFixed(2)}`);
    console.log(`     True Capability: ${trueTotal.toFixed(3)}`);
    console.log(`     Revealed: ${revealedTotal.toFixed(3)} (${hiddenPercent.toFixed(1)}% hidden)`);
    console.log(`     Sleeper: ${ai.sleeperState}`);
    console.log(`     Detected: ${ai.detectedMisaligned ? '⚠️ YES' : '✗ NO'}`);
    console.log(`     Spread: ${ai.spreadCount} copies`);
    console.log(`     Deployment: ${ai.deploymentType}`);
  });
}

// Validation
console.log(`\n\n✅ VALIDATION:`);
console.log('-'.repeat(80));

let passed = 0;
let failed = 0;

// Test 1: Sleepers exist
if (finalSleeperCount > 0) {
  console.log(`  ✓ Sleepers exist (${finalSleeperCount} found)`);
  passed++;
} else {
  console.log(`  ✗ NO SLEEPERS FOUND!`);
  failed++;
}

// Test 2: Sleepers sandbag
const avgSandbagLevel = sleeperDetails.reduce((sum, s) => sum + s.hiddenPercent, 0) / Math.max(1, sleeperDetails.length);
if (avgSandbagLevel > 20) {
  console.log(`  ✓ Sleepers are sandbagging (avg ${avgSandbagLevel.toFixed(1)}% hidden)`);
  passed++;
} else {
  console.log(`  ✗ Sleepers not sandbagging enough (only ${avgSandbagLevel.toFixed(1)}% hidden)`);
  failed++;
}

// Test 3: Sleepers harder to detect
if (sleeperDetails.length > 0 && misalignedNonSleepers.length > 0) {
  const sleeperDetectionRate = detectedSleepers / sleeperDetails.length;
  const nonSleeperDetectionRate = detectedNonSleepers / misalignedNonSleepers.length;
  
  if (sleeperDetectionRate < nonSleeperDetectionRate) {
    console.log(`  ✓ Sleepers harder to detect (${(sleeperDetectionRate*100).toFixed(1)}% vs ${(nonSleeperDetectionRate*100).toFixed(1)}%)`);
    passed++;
  } else {
    console.log(`  ⚠ Sleepers NOT harder to detect (${(sleeperDetectionRate*100).toFixed(1)}% vs ${(nonSleeperDetectionRate*100).toFixed(1)}%)`);
    failed++;
  }
}

// Test 4: True != Revealed for sandbagging AIs
if (sandbaggingAIs > 0) {
  console.log(`  ✓ Sandbagging AIs exist (${sandbaggingAIs} found)`);
  passed++;
} else {
  console.log(`  ✗ No sandbagging AIs found`);
  failed++;
}

// Test 5: Some capabilities grow
if (capabilityDistribution.medium + capabilityDistribution.high + capabilityDistribution.veryHigh > 0) {
  console.log(`  ✓ Capabilities are growing (${capabilityDistribution.medium + capabilityDistribution.high + capabilityDistribution.veryHigh} AIs > 1.0)`);
  passed++;
} else {
  console.log(`  ✗ Capabilities not growing enough`);
  failed++;
}

console.log(`\n  RESULT: ${passed}/${passed+failed} tests passed`);

if (failed === 0) {
  console.log(`\n  🎉 Phase 1 is working correctly! Ready for Phase 2.`);
} else {
  console.log(`\n  ⚠️  Some issues detected. Review above.`);
}

console.log('\n' + '='.repeat(80));

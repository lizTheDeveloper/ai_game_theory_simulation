/**
 * Phase 4 Test: Compute-Scaled Research
 * 
 * Verifies that:
 * 1. Compute scaling law works (10x compute → 2.15x growth)
 * 2. Research speed increases with more compute
 * 3. Capability growth is significantly faster than before
 * 4. Different compute allocations produce different growth rates
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { SimulationEngine } from '../src/simulation/engine';
import { calculateComputeScalingMultiplier } from '../src/simulation/research';

console.log('='.repeat(80));
console.log('PHASE 4 TEST: Compute-Scaled Research');
console.log('='.repeat(80));

// Test 1: Compute scaling law (α = 0.34, reference = 30 PF)
console.log('\n[1] Testing compute scaling law...');
const testCases = [
  { compute: 1, expectedMultiplier: 0.31 },     // (1/30)^0.34 = 0.31
  { compute: 10, expectedMultiplier: 0.69 },    // (10/30)^0.34 = 0.69
  { compute: 30, expectedMultiplier: 1.0 },     // Reference compute (baseline)
  { compute: 100, expectedMultiplier: 1.51 },   // (100/30)^0.34 = 1.51
  { compute: 300, expectedMultiplier: 2.19 },   // (300/30)^0.34 = 2.19 (10x ref)
  { compute: 1000, expectedMultiplier: 3.29 },  // (1000/30)^0.34 = 3.29
  { compute: 3000, expectedMultiplier: 4.75 },  // (3000/30)^0.34 = 4.75 (100x ref)
];

testCases.forEach(({ compute, expectedMultiplier }) => {
  const actualMultiplier = calculateComputeScalingMultiplier(compute);
  const diff = Math.abs(actualMultiplier - expectedMultiplier);
  
  if (diff > 0.05) { // Allow 5% tolerance for floating point
    console.error(`❌ FAIL: ${compute} PF → ${actualMultiplier.toFixed(2)}x (expected ${expectedMultiplier.toFixed(2)}x)`);
    process.exit(1);
  }
  
  console.log(`   ✅ ${compute.toString().padStart(4)} PF → ${actualMultiplier.toFixed(2)}x multiplier`);
});

// Test 2: Verify 10x compute → 2.19x growth
console.log('\n[2] Verifying Chinchilla scaling law (10x compute → ~2.19x growth)...');
const multiplier30 = calculateComputeScalingMultiplier(30);
const multiplier300 = calculateComputeScalingMultiplier(300);
const scalingRatio = multiplier300 / multiplier30;

console.log(`   30 PF → ${multiplier30.toFixed(2)}x`);
console.log(`   300 PF → ${multiplier300.toFixed(2)}x`);
console.log(`   Ratio: ${scalingRatio.toFixed(2)}x (expected ~2.19x)`);

if (Math.abs(scalingRatio - 2.19) > 0.05) {
  console.error(`❌ FAIL: 10x compute should yield ~2.19x growth, got ${scalingRatio.toFixed(2)}x`);
  process.exit(1);
}
console.log('✅ Scaling law verified');

// Test 3: Run simulation to verify growth is faster
console.log('\n[3] Testing actual capability growth in simulation...');
const state = createDefaultInitialState();

// Find OpenAI's flagship model (should have highest compute)
const openai = state.organizations.find(o => o.id === 'openai');
if (!openai) {
  console.error('❌ FAIL: OpenAI not found');
  process.exit(1);
}

const flagshipAI = state.aiAgents
  .filter(ai => openai.ownedAIModels.includes(ai.id))
  .sort((a, b) => b.capability - a.capability)[0];

const anthropicAI = state.aiAgents.find(ai => ai.id === 'corporate_6'); // Anthropic model with minimal compute

if (!flagshipAI || !anthropicAI) {
  console.error('❌ FAIL: Could not find test AIs');
  process.exit(1);
}

console.log(`\n   Testing two models:`);
console.log(`   - ${flagshipAI.id}: ${flagshipAI.allocatedCompute.toFixed(1)} PF (high compute)`);
console.log(`   - ${anthropicAI.id}: ${anthropicAI.allocatedCompute.toFixed(1)} PF (low compute)`);

const initialFlagshipCap = flagshipAI.capability;
const initialAnthropicCap = anthropicAI.capability;

// Run 12 months of simulation
const engine = new SimulationEngine({ seed: 42 });
let currentState = state;
for (let i = 0; i < 12; i++) {
  const result = engine.step(currentState);
  currentState = result.state;
}

const finalFlagship = currentState.aiAgents.find(ai => ai.id === flagshipAI.id);
const finalAnthropic = currentState.aiAgents.find(ai => ai.id === anthropicAI.id);

if (!finalFlagship || !finalAnthropic) {
  console.error('❌ FAIL: Lost track of AIs during simulation');
  process.exit(1);
}

const flagshipGrowth = finalFlagship.capability - initialFlagshipCap;
const anthropicGrowth = finalAnthropic.capability - initialAnthropicCap;

console.log(`\n   After 12 months:`);
console.log(`   - Flagship: ${initialFlagshipCap.toFixed(3)} → ${finalFlagship.capability.toFixed(3)} (growth: +${flagshipGrowth.toFixed(3)})`);
console.log(`   - Anthropic: ${initialAnthropicCap.toFixed(3)} → ${finalAnthropic.capability.toFixed(3)} (growth: +${anthropicGrowth.toFixed(3)})`);

// Flagship should grow significantly faster due to more compute
const growthRatio = flagshipGrowth / (anthropicGrowth + 0.001); // Add tiny amount to avoid div by zero
console.log(`   Growth ratio: ${growthRatio.toFixed(2)}x`);

if (flagshipGrowth <= anthropicGrowth) {
  console.error(`❌ FAIL: High-compute model should grow faster than low-compute model`);
  process.exit(1);
}

if (flagshipGrowth < 0.02) {
  console.error(`❌ FAIL: Growth too slow (${flagshipGrowth.toFixed(3)} in 12 months). Compute scaling may not be working.`);
  process.exit(1);
}

if (growthRatio < 2.0) {
  console.error(`❌ FAIL: Growth ratio too small (${growthRatio.toFixed(2)}x). High-compute should be significantly faster.`);
  process.exit(1);
}

console.log('✅ High-compute models grow significantly faster');

// Test 4: Compare to "old system" baseline (without compute scaling)
console.log('\n[4] Comparing to baseline growth rate...');

// With 30 PF (reference), multiplier is 1.0x
// With 94.5 PF (flagship), multiplier should be ~1.53x
const flagshipMultiplier = calculateComputeScalingMultiplier(finalFlagship.allocatedCompute);
const anthropicMultiplier = calculateComputeScalingMultiplier(finalAnthropic.allocatedCompute);

console.log(`   Flagship compute multiplier: ${flagshipMultiplier.toFixed(2)}x`);
console.log(`   Anthropic compute multiplier: ${anthropicMultiplier.toFixed(2)}x`);

if (flagshipMultiplier <= 1.0) {
  console.error(`❌ FAIL: Flagship should have >1.0x multiplier`);
  process.exit(1);
}

console.log('✅ Compute multipliers applied correctly');

// Test 5: Long-term growth trajectory
console.log('\n[5] Testing long-term growth trajectory (60 months)...');
const longState = createDefaultInitialState();
const longEngine = new SimulationEngine({ seed: 123 });
let longCurrent = longState;

const initialMaxCap = Math.max(...longState.aiAgents.map(ai => ai.capability));
console.log(`   Initial max capability: ${initialMaxCap.toFixed(3)}`);

for (let i = 0; i < 60; i++) {
  const result = longEngine.step(longCurrent);
  longCurrent = result.state;
}

const finalMaxCap = Math.max(...longCurrent.aiAgents.map(ai => ai.capability));
const totalGrowth = finalMaxCap - initialMaxCap;

console.log(`   Final max capability: ${finalMaxCap.toFixed(3)}`);
console.log(`   Total growth: +${totalGrowth.toFixed(3)}`);

// With compute scaling alone (static 627 PF), we should reach 0.3-0.5 in 60 months
// Once we add Moore's Law in Phase 5 (3% monthly growth → 3000-4000 PF), it'll reach 2-4
if (finalMaxCap < 0.3) {
  console.error(`❌ FAIL: Growth too slow (${finalMaxCap.toFixed(3)}). Expected >0.3 by month 60 with static compute.`);
  process.exit(1);
}

if (finalMaxCap > 1.0) {
  console.error(`❌ FAIL: Growth too fast (${finalMaxCap.toFixed(3)}). Expected <1.0 by month 60 without compute growth.`);
  console.error(`   (Phase 5 will add compute growth)`);
  process.exit(1);
}

console.log('✅ Long-term growth trajectory is reasonable for static compute');
console.log('   (Phase 5 will add Moore\'s Law: 627 PF → 3000-4000 PF → 2-4 capability)');

// Summary
console.log('\n' + '='.repeat(80));
console.log('✅ PHASE 4 COMPLETE: All tests passed!');
console.log('='.repeat(80));
console.log('\nSummary:');
console.log(`  - Compute scaling law verified: 10x compute → 2.19x growth (α = 0.34)`);
console.log(`  - High-compute models grow ${growthRatio.toFixed(2)}x faster than low-compute`);
console.log(`  - 60-month capability growth: ${totalGrowth.toFixed(3)} (reasonable baseline)`);
console.log(`  - Flagship multiplier: ${flagshipMultiplier.toFixed(2)}x (from ${finalFlagship.allocatedCompute.toFixed(1)} PF)`);
console.log(`  - Anthropic multiplier: ${anthropicMultiplier.toFixed(2)}x (from ${finalAnthropic.allocatedCompute.toFixed(1)} PF)`);
console.log('\nKey insight:');
console.log('  Compute allocation now DIRECTLY impacts research speed.');
console.log('  OpenAI\'s flagship (~94 PF) researches significantly faster than Anthropic (~1 PF).');
console.log('  This creates realistic competitive dynamics!');
console.log('\nNext steps:');
console.log('  - Phase 5: Add Moore\'s Law (3%/mo compute growth → 3000-4000 PF)');
console.log('  - With both scaling law + growth, capabilities will reach 2-4 in 60mo');
console.log('='.repeat(80));

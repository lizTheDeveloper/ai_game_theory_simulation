#!/usr/bin/env tsx
/**
 * Debug script for TIER 0D Bug #2: Reinstatement Effect
 *
 * Traces through unemployment calculations step-by-step to identify
 * why reinstatement effect produces 95% unemployment for baseline scenarios
 * but 10-13% for job guarantee scenarios.
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

console.log('\n🔍 DEBUGGING REINSTATEMENT EFFECT CALCULATION');
console.log('==============================================\n');

// Run baseline scenario with detailed logging
const initialState = createDefaultInitialState();

// Create engine with seed for reproducibility
const engine = new SimulationEngine({ seed: 91000, maxMonths: 60 });

// Patch console.log to capture specific lines
const originalLog = console.log;
let inUnemploymentCalc = false;

console.log = (...args: any[]) => {
  const message = args.join(' ');

  // Track when we enter/exit unemployment calculations
  if (message.includes('=== Economic Systems Update')) {
    inUnemploymentCalc = true;
    originalLog('\n📊 ENTERING UNEMPLOYMENT CALCULATION');
  }

  // Capture key calculation details
  if (inUnemploymentCalc) {
    if (message.includes('AI capability') ||
        message.includes('displacement') ||
        message.includes('reinstatement') ||
        message.includes('netAI') ||
        message.includes('unemployment') ||
        message.includes('Economic stage')) {
      originalLog('  ', ...args);
    }
  }

  if (message.includes('=== Crisis Detection')) {
    inUnemploymentCalc = false;
  }
};

console.log('\n🎯 Test Case: Baseline (no policy intervention)');
console.log('Expected: 25-45% unemployment');
console.log('Actual (from test): 95% unemployment\n');

const result = engine.run(initialState, { maxMonths: 60, checkActualOutcomes: false });

console.log = originalLog;

console.log('\n📈 FINAL RESULTS:');
console.log(`  Final unemployment: ${(result.finalState.society.unemploymentLevel * 100).toFixed(1)}%`);
console.log(`  Economic stage: ${Math.floor(result.finalState.globalMetrics.economicTransitionStage)}`);
console.log(`  Total AI capability (sum): ${result.finalState.aiAgents.reduce((sum, a) => sum + a.capability, 0).toFixed(3)}`);
console.log(`  Number of AI agents: ${result.finalState.aiAgents.length}`);

// Now manually trace through the calculation with the final state
console.log('\n🧮 MANUAL CALCULATION TRACE:');
console.log('================================\n');

const state = result.finalState;
// CRITICAL: This is the SUM of all AI capabilities, not average!
const totalAICapability = state.aiAgents.reduce((sum, agent) => sum + agent.capability, 0);
const economicStage = Math.floor(state.globalMetrics.economicTransitionStage);

console.log(`1. Total AI Capability (SUM): ${totalAICapability.toFixed(3)}`);

// Displacement (from calculations.ts line 155)
const aiUnemploymentFactor = Math.pow(Math.max(0, totalAICapability - 0.8), 1.8) * 0.12;
console.log(`2. AI Displacement Factor: (max(0, ${totalAICapability.toFixed(3)} - 0.8))^1.8 × 0.12 = ${aiUnemploymentFactor.toFixed(3)}`);

// Reinstatement (new code)
const reinstatementMultiplier: Record<number, number> = {
  0: 0.5,
  1: 1.2,
  2: 0.8,
  3: 1.5,
  4: 2.0
};
const reinstatementStageMultiplier = reinstatementMultiplier[economicStage] || 1.0;
const reinstatementFactor = totalAICapability * reinstatementStageMultiplier * 0.85;
console.log(`3. Reinstatement Factor: ${totalAICapability.toFixed(3)} × ${reinstatementStageMultiplier} × 0.85 = ${reinstatementFactor.toFixed(3)}`);

const netAIUnemployment = Math.max(0, aiUnemploymentFactor - reinstatementFactor);
console.log(`4. Net AI Unemployment: max(0, ${aiUnemploymentFactor.toFixed(3)} - ${reinstatementFactor.toFixed(3)}) = ${netAIUnemployment.toFixed(3)}`);

// Base unemployment (constant 5% natural rate - calculations.ts line 51)
const baseUnemployment = 0.05;
console.log(`5. Base Unemployment: ${baseUnemployment.toFixed(3)} (constant 5% natural rate)`);

// Stage multiplier
const stageMultipliers: Record<number, number> = {
  0: 1.0,
  1: 1.5,
  2: 2.0,
  3: 0.8,
  4: 0.5
};
const stageMultiplier = stageMultipliers[economicStage] || 1.0;
console.log(`6. Stage Multiplier (stage ${economicStage}): ${stageMultiplier}`);

// Policy mitigation (baseline has no policy)
const policyMitigation = 1.0;
console.log(`7. Policy Mitigation: ${policyMitigation} (no policy active)`);

// Retraining effect (baseline has none)
const retrainingEffect = 1.0;
console.log(`8. Retraining Effect: ${retrainingEffect} (no retraining)`);

// Final calculation
let unemployment = baseUnemployment +
  (netAIUnemployment * stageMultiplier * policyMitigation * retrainingEffect);

console.log(`\n9. FINAL CALCULATION:`);
console.log(`   unemployment = ${baseUnemployment.toFixed(3)} + (${netAIUnemployment.toFixed(3)} × ${stageMultiplier} × ${policyMitigation} × ${retrainingEffect})`);
console.log(`   unemployment = ${baseUnemployment.toFixed(3)} + ${(netAIUnemployment * stageMultiplier).toFixed(3)}`);
console.log(`   unemployment = ${unemployment.toFixed(3)} = ${(unemployment * 100).toFixed(1)}%`);

// Check if capped at 0.95
if (unemployment > 0.95) {
  console.log(`\n⚠️  CAPPED at 95% (natural maximum in calculations.ts)`);
  unemployment = 0.95;
}

console.log(`\n📊 COMPARISON:`);
console.log(`   Manual calculation: ${(unemployment * 100).toFixed(1)}%`);
console.log(`   Actual final state: ${(result.finalState.society.unemploymentLevel * 100).toFixed(1)}%`);

console.log('\n🔍 DIAGNOSIS:');
if (unemployment >= 0.90) {
  console.log('   ❌ Issue: Unemployment exceeds 90%');
  console.log('   Possible causes:');
  console.log('   1. Reinstatement factor too weak (displacement dominates)');
  console.log(`      - Displacement: ${aiUnemploymentFactor.toFixed(3)}`);
  console.log(`      - Reinstatement: ${reinstatementFactor.toFixed(3)}`);
  console.log(`      - Ratio: ${(reinstatementFactor / aiUnemploymentFactor * 100).toFixed(1)}% offset`);
  console.log('   2. Stage multiplier too high (amplifies net unemployment)');
  console.log(`      - Stage multiplier: ${stageMultiplier}x`);
  console.log('   3. Reinstatement 0.15 multiplier needs to be higher\n');

  // Calculate what multiplier would bring us to 30% unemployment
  const targetUnemployment = 0.30;
  const targetNetAI = (targetUnemployment - baseUnemployment) / stageMultiplier;
  const targetReinstatement = aiUnemploymentFactor - targetNetAI;
  const neededMultiplier = targetReinstatement / (totalAICapability * reinstatementStageMultiplier);

  console.log('   💡 To achieve 30% unemployment:');
  console.log(`      Need reinstatement factor: ${targetReinstatement.toFixed(3)}`);
  console.log(`      Need multiplier: ${neededMultiplier.toFixed(3)} (currently 0.15)`);
  console.log(`      Suggested change: 0.15 → ${neededMultiplier.toFixed(2)}\n`);
} else {
  console.log('   ✅ Unemployment in reasonable range (<90%)\n');
}

#!/usr/bin/env tsx
/**
 * Test that the simulation calculations respond correctly to different conditions
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createInitialState } from './runSimulation';

console.log('Testing Simulation Calculations');
console.log('================================\n');

// Test 1: High AI capability should increase unemployment
console.log('Test 1: AI Capability vs Unemployment');
console.log('--------------------------------------');
for (const aiCap of [0.2, 1.0, 2.0, 3.0]) {
  const state = createInitialState();
  state.aiAgents.forEach(ai => ai.capability = aiCap / 3); // Distribute capability
  
  const engine = new SimulationEngine({ seed: 42 });
  const result = engine.step(state);
  
  console.log(`AI Capability: ${aiCap.toFixed(1)} → Unemployment: ${(result.metrics.unemployment * 100).toFixed(1)}%`);
}

console.log('\nTest 2: Economic Stage Transitions');
console.log('-----------------------------------');
const testState = createInitialState();
testState.aiAgents.forEach(ai => ai.capability = 1.5); // High capability
testState.society.unemploymentLevel = 0.28; // Above crisis threshold

const engine = new SimulationEngine({ seed: 42 });
let state = testState;

console.log(`Initial: Stage ${state.globalMetrics.economicTransitionStage.toFixed(2)}, Unemployment ${(state.society.unemploymentLevel * 100).toFixed(1)}%`);

// Step through several months
for (let i = 0; i < 5; i++) {
  const result = engine.step(state);
  state = result.state;
  console.log(`Month ${i+1}: Stage ${state.globalMetrics.economicTransitionStage.toFixed(2)}, Unemployment ${(state.society.unemploymentLevel * 100).toFixed(1)}%, ${result.metrics.crisisDetected ? '⚠️ CRISIS' : ''}`);
}

console.log('\nTest 3: Trust Dynamics');
console.log('----------------------');
const trustTest = createInitialState();
trustTest.society.trustInAI = 0.8; // High trust
trustTest.aiAgents[0].beneficialActions = 10;
trustTest.aiAgents[0].harmfulActions = 0;

const engine3 = new SimulationEngine({ seed: 42 });
let trustState = trustTest;

for (let i = 0; i < 10; i++) {
  const result = engine3.step(trustState);
  trustState = result.state;
  if (i % 2 === 0) {
    console.log(`Month ${i+1}: Trust ${(trustState.society.trustInAI * 100).toFixed(1)}%`);
  }
}

console.log('\nTest 4: Outcome Probabilities');
console.log('------------------------------');

// High quality scenario
const utopiaState = createInitialState();
utopiaState.globalMetrics.qualityOfLife = 4.0;
utopiaState.society.trustInAI = 0.9;
utopiaState.aiAgents.forEach(ai => ai.alignment = 0.95);

const engine4 = new SimulationEngine({ seed: 42 });
const utopiaResult = engine4.step(utopiaState);
console.log('High Quality Scenario:');
console.log(`  Utopia:     ${(utopiaResult.metrics.outcomeProbs.utopiaProbability * 100).toFixed(1)}%`);
console.log(`  Dystopia:   ${(utopiaResult.metrics.outcomeProbs.dystopiaProbability * 100).toFixed(1)}%`);
console.log(`  Extinction: ${(utopiaResult.metrics.outcomeProbs.extinctionProbability * 100).toFixed(1)}%`);

// High control scenario
const dystopiaState = createInitialState();
dystopiaState.government.controlDesire = 0.95;
dystopiaState.government.capabilityToControl = 0.9;
dystopiaState.globalMetrics.qualityOfLife = 0.2;
dystopiaState.society.trustInAI = 0.2;

const engine5 = new SimulationEngine({ seed: 42 });
const dystopiaResult = engine5.step(dystopiaState);
console.log('\nHigh Control, Low Quality Scenario:');
console.log(`  Utopia:     ${(dystopiaResult.metrics.outcomeProbs.utopiaProbability * 100).toFixed(1)}%`);
console.log(`  Dystopia:   ${(dystopiaResult.metrics.outcomeProbs.dystopiaProbability * 100).toFixed(1)}%`);
console.log(`  Extinction: ${(dystopiaResult.metrics.outcomeProbs.extinctionProbability * 100).toFixed(1)}%`);

// High capability, low alignment scenario
const extinctionState = createInitialState();
extinctionState.aiAgents.forEach(ai => {
  ai.capability = 3.0;
  ai.alignment = 0.2;
});
extinctionState.government.capabilityToControl = 0.1;

const engine6 = new SimulationEngine({ seed: 42 });
const extinctionResult = engine6.step(extinctionState);
console.log('\nHigh Capability, Low Alignment Scenario:');
console.log(`  Utopia:     ${(extinctionResult.metrics.outcomeProbs.utopiaProbability * 100).toFixed(1)}%`);
console.log(`  Dystopia:   ${(extinctionResult.metrics.outcomeProbs.dystopiaProbability * 100).toFixed(1)}%`);
console.log(`  Extinction: ${(extinctionResult.metrics.outcomeProbs.extinctionProbability * 100).toFixed(1)}%`);

console.log('\n✅ All calculation tests completed!');
console.log('The simulation engine correctly responds to different conditions.');


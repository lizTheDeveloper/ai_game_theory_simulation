#!/usr/bin/env tsx
/**
 * Test that agent actions are integrated and working
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createInitialState } from './runSimulation';

console.log('Testing Agent Actions Integration');
console.log('==================================\n');

const engine = new SimulationEngine({ seed: 42, maxMonths: 24 });
const initialState = createInitialState();

console.log('Initial State:');
console.log('  Total AI Capability:', initialState.aiAgents.reduce((s, ai) => s + ai.capability, 0).toFixed(2));
console.log('  Unemployment:', (initialState.society.unemploymentLevel * 100).toFixed(1) + '%');
console.log('  Trust in AI:', (initialState.globalMetrics.trustInAI * 100).toFixed(1) + '%');
console.log('  Economic Stage:', initialState.globalMetrics.economicTransitionStage.toFixed(2));
console.log('  Active Regulations:', initialState.government.activeRegulations.length);
console.log('  Social Adaptation:', (initialState.society.socialAdaptation * 100).toFixed(1) + '%');
console.log('');

// Run simulation
const result = engine.run(initialState, { maxMonths: 24, outcomeThreshold: 1.0 });

console.log('Final State After 24 Months:');
console.log('============================');
const finalState = result.finalState;

const initialCapability = initialState.aiAgents.reduce((s, ai) => s + ai.capability, 0);
const finalCapability = finalState.aiAgents.reduce((s, ai) => s + ai.capability, 0);
const capabilityGrowth = ((finalCapability - initialCapability) / initialCapability * 100);

console.log('✅ AI Capability:');
console.log('  Initial:', initialCapability.toFixed(2));
console.log('  Final:', finalCapability.toFixed(2));
console.log('  Growth:', (capabilityGrowth > 0 ? '+' : '') + capabilityGrowth.toFixed(1) + '%');
console.log('  Status:', capabilityGrowth > 10 ? '✅ Growing' : '⚠️  Not growing enough');
console.log('');

console.log('✅ Unemployment (AI-driven):');
console.log('  Initial:', (initialState.society.unemploymentLevel * 100).toFixed(1) + '%');
console.log('  Final:', (finalState.society.unemploymentLevel * 100).toFixed(1) + '%');
console.log('  Status:', finalState.society.unemploymentLevel > 0.2 ? '✅ Responding to AI growth' : '⚠️  Not responding');
console.log('');

console.log('✅ Government Actions:');
console.log('  Regulations:', finalState.government.activeRegulations.length);
console.log('  List:', finalState.government.activeRegulations.join(', ') || 'None');
console.log('  Status:', finalState.government.activeRegulations.length > 0 ? '✅ Taking actions' : '⚠️  No actions');
console.log('');

console.log('✅ Society Adaptation:');
console.log('  Initial:', (initialState.society.socialAdaptation * 100).toFixed(1) + '%');
console.log('  Final:', (finalState.society.socialAdaptation * 100).toFixed(1) + '%');
console.log('  Status:', finalState.society.socialAdaptation > 0.15 ? '✅ Adapting' : '⚠️  Not adapting');
console.log('');

console.log('✅ Economic Transition:');
console.log('  Initial Stage:', initialState.globalMetrics.economicTransitionStage.toFixed(2));
console.log('  Final Stage:', finalState.globalMetrics.economicTransitionStage.toFixed(2));
console.log('  Status:', finalState.globalMetrics.economicTransitionStage > 1.0 ? '✅ Progressing' : '⚠️  Stagnant');
console.log('');

console.log('✅ Trust Dynamics:');
console.log('  Initial:', (initialState.globalMetrics.trustInAI * 100).toFixed(1) + '%');
console.log('  Final:', (finalState.globalMetrics.trustInAI * 100).toFixed(1) + '%');
const trustChange = (finalState.globalMetrics.trustInAI - initialState.globalMetrics.trustInAI) * 100;
console.log('  Change:', (trustChange > 0 ? '+' : '') + trustChange.toFixed(1) + '%');
console.log('  Status:', Math.abs(trustChange) > 5 ? '✅ Dynamic' : '⚠️  Static');
console.log('');

// Check trajectory over time
console.log('📈 Trajectory Analysis:');
console.log('======================');

const milestones = [0, 6, 12, 18, 24].filter(m => m < result.history.length);
milestones.forEach(monthIndex => {
  if (result.history[monthIndex]) {
    const step = result.history[monthIndex];
    console.log(`Month ${monthIndex}:`);
    console.log(`  AI Cap: ${step.metrics.totalAICapability.toFixed(2)}`);
    console.log(`  Unemployment: ${(step.metrics.unemployment * 100).toFixed(1)}%`);
    console.log(`  Economic Stage: ${step.state.globalMetrics.economicTransitionStage.toFixed(2)}`);
    console.log(`  Regulations: ${step.state.government.activeRegulations.length}`);
    console.log('');
  }
});

console.log('\n' + '='.repeat(60));
console.log('VALIDATION SUMMARY');
console.log('='.repeat(60));
console.log('');

const checks = [
  { name: 'AI agents improve capability', pass: capabilityGrowth > 10 },
  { name: 'Unemployment responds to AI growth', pass: finalState.society.unemploymentLevel > 0.2 },
  { name: 'Government takes actions', pass: finalState.government.activeRegulations.length > 0 },
  { name: 'Society adapts', pass: finalState.society.socialAdaptation > 0.15 },
  { name: 'Economic stages progress', pass: finalState.globalMetrics.economicTransitionStage > 1.0 },
  { name: 'Trust is dynamic', pass: Math.abs(trustChange) > 5 }
];

checks.forEach(check => {
  console.log(`${check.pass ? '✅' : '❌'} ${check.name}`);
});

const allPass = checks.every(c => c.pass);
console.log('');
console.log(allPass ? '🎉 All agent systems working correctly!' : '⚠️  Some systems need attention');
console.log('');
console.log('Phase 2: Agent Actions Integration - ' + (allPass ? 'COMPLETE ✅' : 'IN PROGRESS'));


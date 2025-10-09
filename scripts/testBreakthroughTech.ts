/**
 * Quick test for breakthrough technology system
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { SimulationEngine } from '../src/simulation/engine';

async function main() {
  console.log('\n🧪 TESTING BREAKTHROUGH TECHNOLOGY SYSTEM\n');
  
  const state = createDefaultInitialState();
  const engine = new SimulationEngine({ seed: 12345, logLevel: 'summary' });
  
  console.log('Initial state:');
  console.log(`  Research budget: $${state.government.researchInvestments.totalBudget}B`);
  console.log(`  Clean Energy unlocked: ${state.breakthroughTech.cleanEnergy.unlocked}`);
  console.log(`  Clean Energy progress: ${(state.breakthroughTech.cleanEnergy.researchProgress * 100).toFixed(1)}%`);
  
  console.log('\nRunning simulation for 36 months...\n');
  
  await engine.run(state, { 
    months: 36,
    checkActualOutcomes: false 
  });
  
  console.log('\nAfter 36 months:');
  console.log(`  Research budget: $${state.government.researchInvestments.totalBudget}B`);
  console.log(`  Economic stage: ${state.globalMetrics.economicTransitionStage.toFixed(2)}`);
  console.log(`  Average AI capability: ${(state.aiAgents.reduce((s, a) => s + a.capability, 0) / state.aiAgents.length).toFixed(2)}`);
  
  console.log('\nTechnology Status:');
  const techs = [
    state.breakthroughTech.cleanEnergy,
    state.breakthroughTech.advancedRecycling,
    state.breakthroughTech.sustainableAgriculture,
    state.breakthroughTech.mentalHealthAI,
    state.breakthroughTech.diseaseElimination,
  ];
  
  for (const tech of techs) {
    const status = tech.unlocked ? '✅ UNLOCKED' : `${(tech.researchProgress * 100).toFixed(1)}% progress`;
    const deployment = tech.unlocked ? ` (${(tech.deploymentLevel * 100).toFixed(0)}% deployed)` : '';
    console.log(`  ${tech.name}: ${status}${deployment}`);
  }
  
  console.log('\nCrisis Status:');
  const env = state.environmentalAccumulation;
  console.log(`  Resource crisis: ${env.resourceCrisisActive ? '🔴 ACTIVE' : '🟢 inactive'}`);
  console.log(`  Pollution crisis: ${env.pollutionCrisisActive ? '🔴 ACTIVE' : '🟢 inactive'}`);
  console.log(`  Ecosystem collapse: ${env.ecosystemCollapseActive ? '🔴 ACTIVE' : '🟢 inactive'}`);
  console.log(`  Meaning collapse: ${state.socialAccumulation.meaningCollapseActive ? '🔴 ACTIVE' : '🟢 inactive'}`);
  
  console.log('\n✅ Test complete!\n');
}

main().catch(console.error);


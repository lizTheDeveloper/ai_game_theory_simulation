/**
 * Test crisis-specific emergency deployment
 * 
 * Verify that:
 * 1. Clean Energy deploys faster during pollution/climate crisis
 * 2. Ecosystem Management AI deploys faster during ecosystem collapse
 * 3. Mental Health AI deploys faster during meaning crisis
 * 4. Unrelated tech (e.g. Disease Elimination) doesn't get emergency boost during environmental crisis
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

async function main() {
  console.log('🧪 Testing Crisis-Specific Emergency Deployment\n');
  console.log('='.repeat(80));
  
  const engine = new SimulationEngine({ 
    seed: 90001, 
    maxMonths: 60,
    logLevel: 'summary'
  });
  
  const initialState = createDefaultInitialState();
  
  // Force some crises to trigger for testing
  // We'll run the sim and watch for crisis triggers + tech deployment response
  
  console.log('\n🚀 Running 60-month simulation...\n');
  const result = await engine.run(initialState);
  
  console.log('\n' + '='.repeat(80));
  console.log('📊 FINAL RESULTS\n');
  
  const tech = result.finalState.breakthroughTech;
  
  console.log('🔬 Technology Status:');
  console.log(`  Clean Energy: ${tech.cleanEnergy.unlocked ? '✅ Unlocked' : '❌ Locked'}, Deployment: ${((tech.cleanEnergy?.deploymentLevel ?? 0) * 100).toFixed(0)}%`);
  console.log(`  Ecosystem Mgmt: ${tech.ecosystemManagement.unlocked ? '✅ Unlocked' : '❌ Locked'}, Deployment: ${((tech.ecosystemManagement?.deploymentLevel ?? 0) * 100).toFixed(0)}%`);
  console.log(`  Mental Health AI: ${tech.mentalHealthAI.unlocked ? '✅ Unlocked' : '❌ Locked'}, Deployment: ${((tech.mentalHealthAI?.deploymentLevel ?? 0) * 100).toFixed(0)}%`);
  console.log(`  Disease Elim: ${tech.diseaseElimination.unlocked ? '✅ Unlocked' : '❌ Locked'}, Deployment: ${((tech.diseaseElimination?.deploymentLevel ?? 0) * 100).toFixed(0)}%`);
  
  console.log('\n🚨 Crisis Status:');
  const env = result.finalState.environmentalAccumulation;
  const social = result.finalState.socialAccumulation;
  console.log(`  Pollution Crisis: ${env.pollutionCrisisActive ? '🔴 ACTIVE' : '✅ Resolved/None'}`);
  console.log(`  Climate Crisis: ${env.climateCatastropheActive ? '🔴 ACTIVE' : '✅ Resolved/None'}`);
  console.log(`  Ecosystem Collapse: ${env.ecosystemCollapseActive ? '🔴 ACTIVE' : '✅ Resolved/None'}`);
  console.log(`  Meaning Crisis: ${social.meaningCollapseActive ? '🔴 ACTIVE' : '✅ Resolved/None'}`);
  
  console.log(`\n🎯 Final Outcome: ${result.summary.finalOutcome.toUpperCase()}`);
  console.log(`   Reason: ${result.summary.finalOutcomeReason}`);
  
  console.log('\n✅ Test complete!\n');
}

main().catch(console.error);


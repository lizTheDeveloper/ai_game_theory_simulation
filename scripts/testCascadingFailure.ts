/**
 * Quick test to diagnose cascading failure triggering in Month 1
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { SimulationEngine } from '../src/simulation/engine';

async function main() {
console.log('🧪 Testing Cascading Failure Detection\n');

const state = createDefaultInitialState();

console.log('Initial State (Month 0):');
console.log('  Environmental:');
console.log(`    resourceReserves: ${state.environmentalAccumulation.resourceReserves}`);
console.log(`    pollutionLevel: ${state.environmentalAccumulation.pollutionLevel}`);
console.log(`    climateStability: ${state.environmentalAccumulation.climateStability}`);
console.log(`    biodiversityIndex: ${state.environmentalAccumulation.biodiversityIndex}`);
console.log('  Crises Active:');
console.log(`    resourceCrisis: ${state.environmentalAccumulation.resourceCrisisActive}`);
console.log(`    pollutionCrisis: ${state.environmentalAccumulation.pollutionCrisisActive}`);
console.log(`    climateCrisis: ${state.environmentalAccumulation.climateCrisisActive}`);
console.log(`    ecosystemCrisis: ${state.environmentalAccumulation.ecosystemCrisisActive}`);

console.log('\n  Social:');
console.log(`    meaningCrisisLevel: ${state.socialAccumulation.meaningCrisisLevel}`);
console.log(`    institutionalLegitimacy: ${state.socialAccumulation.institutionalLegitimacy}`);
console.log(`    socialCohesion: ${state.socialAccumulation.socialCohesion}`);
console.log('  Crises Active:');
console.log(`    meaningCollapse: ${state.socialAccumulation.meaningCollapseActive}`);
console.log(`    institutionalFailure: ${state.socialAccumulation.institutionalFailureActive}`);
console.log(`    socialUnrest: ${state.socialAccumulation.socialUnrestActive}`);

console.log('\n  Technological:');
console.log(`    misalignmentRisk: ${state.technologicalRisk.misalignmentRisk}`);
console.log(`    safetyDebt: ${state.technologicalRisk.safetyDebt}`);
console.log(`    concentrationRisk: ${state.technologicalRisk.concentrationRisk}`);
console.log(`    complacencyLevel: ${state.technologicalRisk.complacencyLevel}`);
console.log('  Crises Active:');
console.log(`    controlLoss: ${state.technologicalRisk.controlLossActive}`);
console.log(`    corporateDystopia: ${state.technologicalRisk.corporateDystopiaActive}`);
console.log(`    complacencyCrisis: ${state.technologicalRisk.complacencyCrisisActive}`);

console.log('\n\n🎮 Running first month of simulation...\n');

const engine = new SimulationEngine();
const result = await engine.run(state, { 
  maxMonths: 1, 
  seed: 42000,
  checkActualOutcomes: true 
});

console.log('\n\nAfter Month 1:');
console.log('  Environmental Crises:');
console.log(`    resourceCrisis: ${result.finalState.environmentalAccumulation.resourceCrisisActive}`);
console.log(`    pollutionCrisis: ${result.finalState.environmentalAccumulation.pollutionCrisisActive}`);
console.log(`    climateCrisis: ${result.finalState.environmentalAccumulation.climateCrisisActive}`);
console.log(`    ecosystemCrisis: ${result.finalState.environmentalAccumulation.ecosystemCrisisActive}`);

console.log('\n  Social Crises:');
console.log(`    meaningCollapse: ${result.finalState.socialAccumulation.meaningCollapseActive}`);
console.log(`    institutionalFailure: ${result.finalState.socialAccumulation.institutionalFailureActive}`);
console.log(`    socialUnrest: ${result.finalState.socialAccumulation.socialUnrestActive}`);

console.log('\n  Technological Crises:');
console.log(`    controlLoss: ${result.finalState.technologicalRisk.controlLossActive}`);
console.log(`    corporateDystopia: ${result.finalState.technologicalRisk.corporateDystopiaActive}`);
console.log(`    complacencyCrisis: ${result.finalState.technologicalRisk.complacencyCrisisActive}`);

const totalCrises = [
  result.finalState.environmentalAccumulation.resourceCrisisActive,
  result.finalState.environmentalAccumulation.pollutionCrisisActive,
  result.finalState.environmentalAccumulation.climateCrisisActive,
  result.finalState.environmentalAccumulation.ecosystemCrisisActive,
  result.finalState.socialAccumulation.meaningCollapseActive,
  result.finalState.socialAccumulation.institutionalFailureActive,
  result.finalState.socialAccumulation.socialUnrestActive,
  result.finalState.technologicalRisk.controlLossActive,
  result.finalState.technologicalRisk.corporateDystopiaActive,
  result.finalState.technologicalRisk.complacencyCrisisActive
].filter(Boolean).length;

console.log(`\n  📊 Total Active Crises: ${totalCrises}`);

if (totalCrises >= 5) {
  console.log('\n  ⚠️  BUG CONFIRMED: 5+ crises in Month 1 is not intended!');
} else {
  console.log('\n  ✅ No bug: Crisis count looks reasonable for Month 1');
}
}

main().catch(console.error);


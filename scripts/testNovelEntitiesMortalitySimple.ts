/**
 * CRITICAL-2 Test: Novel Entities Mortality Integration
 *
 * Simple test to verify chemical pollution crises cause mortality.
 * Expected: Severe pollution → reproductive crisis → measurable deaths
 *
 * Nov 14, 2025 - Roy debugging
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { SimulationEngine } from '../src/simulation/engine';

console.log('='.repeat(80));
console.log('NOVEL ENTITIES MORTALITY INTEGRATION TEST');
console.log('='.repeat(80));

// Create engine and RNG first
const engine = new SimulationEngine({ seed: 42 });
const rng = engine.getRNG().next.bind(engine.getRNG());

// Create initial state with RNG (CRITICAL-3 requirement)
const initialState = createDefaultInitialState(rng);

console.log('\nINITIAL STATE:');
console.log(`  Population: ${initialState.humanPopulationSystem.population.toFixed(3)}B`);
console.log(`  Chemical load: ${(initialState.novelEntitiesSystem.syntheticChemicalLoad * 100).toFixed(0)}%`);
console.log(`  PFAS prevalence: ${(initialState.novelEntitiesSystem.pfasPrevalence * 100).toFixed(0)}%`);

// INJECT SEVERE POLLUTION
console.log('\n🧪 INJECTING SEVERE POLLUTION...');
initialState.novelEntitiesSystem.syntheticChemicalLoad = 0.70;
initialState.novelEntitiesSystem.microplasticConcentration = 0.65;
initialState.novelEntitiesSystem.pfasPrevalence = 0.75;
initialState.novelEntitiesSystem.endocrineDisruption = 0.60;
initialState.novelEntitiesSystem.chronicDiseasePrevalence = 0.45; // Above epidemic threshold (0.40)
initialState.novelEntitiesSystem.reproductiveHealthDecline = 0.55; // Above crisis threshold (0.50)
initialState.novelEntitiesSystem.bioaccumulationFactor = 0.65; // Above collapse threshold (0.60)

console.log('  Chemical load: 70%');
console.log('  Reproductive decline: 55% (crisis threshold: 50%)');
console.log('  Chronic disease: 45% (epidemic threshold: 40%)');
console.log('  Bioaccumulation: 65% (collapse threshold: 60%)');

// SAVE INITIAL POPULATION (BEFORE mutation)
const initialPopulation = initialState.humanPopulationSystem.population;

// Run simulation for 24 months
console.log('\n📊 RUNNING 24-MONTH SIMULATION...\n');

let currentState = initialState;

let crisisTriggered = false;
let totalRisksAdded = 0;

for (let month = 0; month < 24; month++) {
  const pop = currentState.humanPopulationSystem as any;
  const risksBefore = pop.mortalityRisks?.length || 0;

  // Step simulation
  const result = engine.step(currentState);
  currentState = result.state;

  const risksAfter = (currentState.humanPopulationSystem as any).mortalityRisks?.length || 0;
  const risksAdded = Math.max(0, risksAfter - risksBefore);
  totalRisksAdded += risksAdded;

  // Check for crisis activation
  if (currentState.novelEntitiesSystem.reproductiveCrisisActive) {
    if (!crisisTriggered) {
      console.log(`🚨 REPRODUCTIVE CRISIS TRIGGERED at month ${month}`);
      crisisTriggered = true;
    }
  }

  // Log monthly summary
  if (month % 6 === 0 || risksAdded > 0) {
    console.log(`Month ${month.toString().padStart(2)}: ` +
      `Pop=${(currentState.humanPopulationSystem.population / 1e9).toFixed(3)}B, ` +
      `Risks=${risksAdded}, ` +
      `ChemLoad=${(currentState.novelEntitiesSystem.syntheticChemicalLoad * 100).toFixed(0)}%`);
  }
}

// RESULTS
console.log('\n' + '='.repeat(80));
console.log('RESULTS');
console.log('='.repeat(80));

const finalPop = currentState.humanPopulationSystem.population;
const totalDeaths = initialPopulation - finalPop;
const mortalityRate = (totalDeaths / initialPopulation) * 100;

console.log(`\nPopulation:`);
console.log(`  Initial: ${initialPopulation.toFixed(3)}B`);
console.log(`  Final: ${finalPop.toFixed(3)}B`);
console.log(`  Deaths: ${(totalDeaths * 1000).toFixed(1)}M (${mortalityRate.toFixed(2)}%)`);

console.log(`\nNovel Entities Events:`);
console.log(`  Reproductive crisis: ${currentState.novelEntitiesSystem.reproductiveCrisisActive ? '✅ YES' : '❌ NO'}`);
console.log(`  Bioaccumulation collapse: ${currentState.novelEntitiesSystem.bioaccumulationCollapseActive ? '✅ YES' : '❌ NO'}`);
console.log(`  Chronic disease epidemic: ${currentState.novelEntitiesSystem.chronicDiseaseEpidemicActive ? '✅ YES' : '❌ NO'}`);

console.log(`\nMortality Risks:`);
console.log(`  Total risks added over 24 months: ${totalRisksAdded}`);

console.log(`\n${'='.repeat(80)}`);
console.log('DIAGNOSIS');
console.log('='.repeat(80));

if (totalRisksAdded === 0) {
  console.log('❌ BUG CONFIRMED: No mortality risks added despite severe pollution');
  console.log('   Novel entities system not calling addMortalityRisk()');
} else if (mortalityRate < 0.1) {
  console.log('🚨 BUG CONFIRMED: Risks added but no population effect');
  console.log(`   ${totalRisksAdded} risks added, but only ${mortalityRate.toFixed(3)}% mortality`);
  console.log('   Bayesian mortality resolution not processing novel entities risks');
} else {
  console.log(`✅ System appears functional: ${totalRisksAdded} risks → ${mortalityRate.toFixed(2)}% mortality`);
}

console.log(`\n${'='.repeat(80)}\n`);

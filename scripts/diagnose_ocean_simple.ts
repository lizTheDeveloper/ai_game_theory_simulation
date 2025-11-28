#!/usr/bin/env npx tsx
/**
 * Simple diagnostic for ocean acidification population extinction
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

console.log('🔍 Ocean Acidification Population Extinction Analysis - Simple');
console.log('=' .repeat(80));

// Create engine with default config
const engine = new SimulationEngine({ seed: 42 });

// Initialize state
const rng = engine.getRNG();
let state = createDefaultInitialState(() => rng.next());

// Track key metrics
let lastPopulation = state.humanPopulationSystem.population;
let cascadeActivated = false;
let coralCollapsed = false;
let marineCollapsed = false;

// Run simulation
for (let month = 0; month < 500; month++) {
  // Run one step
  const stepResult = engine.step(state);
  state = stepResult.state;

  const currentPop = state.humanPopulationSystem.population;
  const monthlyDeaths = (lastPopulation - currentPop) * 1000; // to millions
  lastPopulation = currentPop;

  const oa = state.oceanAcidificationSystem;

  // Log every 50 months or on important events
  if (month % 50 === 0) {
    console.log(`Month ${month}: Pop ${currentPop.toFixed(3)}B, pH ${oa?.pH.toFixed(2)}, Coral ${oa?.coralReefHealth.toFixed(0)}%, Deaths ${monthlyDeaths.toFixed(1)}M`);
  }

  // Track cascade events
  if (oa?.cascadeActive && !cascadeActivated) {
    cascadeActivated = true;
    console.log(`\n🌊 CASCADE ACTIVATED at month ${month} (pH ${oa.pH.toFixed(3)})`);
  }

  if (oa?.coralExtinctionActive && !coralCollapsed) {
    coralCollapsed = true;
    console.log(`\n🪸 CORAL COLLAPSE at month ${month} (health ${oa.coralReefHealth.toFixed(1)}%)`);
  }

  if (oa?.marineFoodWebCollapseActive && !marineCollapsed) {
    marineCollapsed = true;
    console.log(`\n🐟 MARINE COLLAPSE at month ${month} (ecosystem ${oa.marineEcosystemFunction.toFixed(1)}%)`);
    console.log(`   Fish-dependent impact: ${(oa.fishDependentImpact * 100).toFixed(1)}%`);
    console.log(`   Material abundance: ${(state.qualityOfLifeSystems.materialAbundance * 100).toFixed(1)}%`);
  }

  // Check for population crisis
  if (monthlyDeaths > 100) {
    console.log(`\n💀 MASS MORTALITY at month ${month}: ${monthlyDeaths.toFixed(0)}M deaths`);
    console.log(`   Population: ${currentPop.toFixed(3)}B remaining`);
    console.log(`   pH: ${oa?.pH.toFixed(3)}, Coral: ${oa?.coralReefHealth.toFixed(1)}%`);
    console.log(`   Fish impact: ${((oa?.fishDependentImpact ?? 0) * 100).toFixed(1)}%`);
    console.log(`   Material abundance: ${(state.qualityOfLifeSystems.materialAbundance * 100).toFixed(1)}%`);
  }

  // Check extinction
  if (currentPop < 0.001) {
    console.log(`\n❌ EXTINCTION at month ${month}`);
    console.log(`   Final population: ${(currentPop * 1e9).toFixed(0)} people`);
    console.log(`   pH: ${oa?.pH.toFixed(3)}`);
    console.log(`   Coral health: ${oa?.coralReefHealth.toFixed(1)}%`);
    console.log(`   Marine ecosystem: ${oa?.marineEcosystemFunction.toFixed(1)}%`);
    console.log(`   Fish-dependent impact: ${((oa?.fishDependentImpact ?? 0) * 100).toFixed(1)}%`);
    console.log(`   Material abundance: ${(state.qualityOfLifeSystems.materialAbundance * 100).toFixed(2)}%`);

    // Death attribution
    console.log('\n📊 Death Attribution:');
    const deathsByCat = state.humanPopulationSystem.deathsByCategory;
    const totalDeaths = Object.values(deathsByCat).reduce((sum, d) => sum + d, 0);
    for (const [category, deaths] of Object.entries(deathsByCat)) {
      if (deaths > 0) {
        console.log(`  ${category}: ${deaths.toFixed(0)}M (${((deaths/totalDeaths) * 100).toFixed(1)}%)`);
      }
    }
    break;
  }
}

console.log('\n✅ Diagnostic complete');
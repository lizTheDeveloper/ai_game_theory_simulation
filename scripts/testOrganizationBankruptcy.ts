#!/usr/bin/env tsx
/**
 * Test: Do organizations still instantly go bankrupt?
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

const initialState = createDefaultInitialState();
const engine = new SimulationEngine({ seed: 42, maxMonths: 30 });

console.log('\n🏢 TESTING ORGANIZATION BANKRUPTCY FIX');
console.log('==========================================\n');

console.log('Initial organizations:');
initialState.organizations.forEach(org => {
  console.log(`  ${org.name}: capital=$${(org.capital / 1000).toFixed(1)}B`);
});

console.log('\n⏱️  Running simulation for 30 months...\n');

const result = engine.run(initialState, { maxMonths: 30, checkActualOutcomes: false });

console.log('\n📊 FINAL RESULTS (Month 30)');
console.log('============================\n');

console.log('Organizations surviving:');
const surviving = result.finalState.organizations.filter(o => o.capital > 0);
const bankrupt = result.finalState.organizations.filter(o => o.capital <= 0);

console.log(`\n✅ Surviving: ${surviving.length}/${result.finalState.organizations.length}`);
surviving.forEach(org => {
  console.log(`  ${org.name}: capital=$${(org.capital / 1000).toFixed(1)}B`);
});

if (bankrupt.length > 0) {
  console.log(`\n❌ Bankrupt: ${bankrupt.length}/${result.finalState.organizations.length}`);
  bankrupt.forEach(org => {
    console.log(`  ${org.name}: capital=$${(org.capital / 1000).toFixed(1)}B`);
  });
}

console.log('\nAI agents remaining:', result.finalState.aiAgents.length);
console.log('Global population:', result.finalState.humanPopulationSystem.population.toFixed(2), 'B');

if (result.finalState.humanPopulationSystem.regionalPopulations) {
  console.log('\nRegional populations:');
  for (const region of result.finalState.humanPopulationSystem.regionalPopulations) {
    const decline = ((region.baselinePopulation - region.population) / region.baselinePopulation * 100);
    console.log(`  ${region.name}: ${region.population.toFixed(0)}M (${decline.toFixed(1)}% decline)`);
  }
}

console.log('\n' + (surviving.length >= 3 ? '✅ FIX VERIFIED' : '❌ FIX FAILED'));
console.log(surviving.length >= 3
  ? 'Organizations survived longer than 30 months!'
  : 'Organizations still going bankrupt too quickly');

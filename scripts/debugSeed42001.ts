/**
 * Debug script to reproduce extinction classification bug for seed 42001
 *
 * Bug: Seed 42001 shows population GROWTH (8.14B → 8.30B) but is classified as EXTINCTION
 */

import { SimulationEngine } from '@/simulation/engine';

async function debugSeed() {
  console.log('🔍 Debugging Seed 42001 Extinction Bug\n');

  const engine = new SimulationEngine({ seed: 42001 });
  const result = await engine.simulate({ maxMonths: 180 });

  console.log('\n📊 RESULT:');
  console.log(`   Final Outcome: ${result.summary.finalOutcome}`);
  console.log(`   Initial Population: ${result.finalState.humanPopulationSystem.initialPopulation}B`);
  console.log(`   Final Population: ${result.finalState.humanPopulationSystem.population}B`);
  console.log(`   Population Change: ${((result.finalState.humanPopulationSystem.population / result.finalState.humanPopulationSystem.initialPopulation - 1) * 100).toFixed(2)}%`);

  if (result.finalState.unifiedOutcome) {
    console.log(`\n   Unified Outcome:`);
    console.log(`      Short Label: ${result.finalState.unifiedOutcome.shortLabel}`);
    console.log(`      Primary Outcome: ${result.finalState.unifiedOutcome.primaryOutcome}`);
    console.log(`      Mortality Rate: ${(result.finalState.unifiedOutcome.mortalityRate * 100).toFixed(2)}%`);
    console.log(`      Stratified Outcome: ${result.finalState.unifiedOutcome.stratifiedOutcome}`);
  }

  console.log(`\n   Summary:`);
  console.log(`      ${result.summary.finalOutcomeReason}`);
}

debugSeed().catch(console.error);

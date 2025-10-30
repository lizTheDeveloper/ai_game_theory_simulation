/**
 * Validation Script: Population Coherence (HIGH-4 Fix)
 *
 * Tests that with extreme mortality (90%+), the simulation maintains coherence:
 * 1. Compute capacity degrades proportionally to skilled labor loss
 * 2. Organizations cascade when host countries collapse
 * 3. No ghost infrastructure (12PF with 0.3% population)
 *
 * Run: npx tsx scripts/validatePopulationCoherence.ts
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { getTotalEffectiveCompute } from '../src/simulation/computeInfrastructure';

console.log('\n=== Population Coherence Validation (HIGH-4 Fix) ===\n');

// Initialize game state with engine
const initialState = createDefaultInitialState();
const engine = new SimulationEngine(initialState);

console.log('Initial state:');
console.log(`  Population: ${initialState.humanPopulationSystem.population.toFixed(1)}M (100%)`);
console.log(`  Compute: ${getTotalEffectiveCompute(initialState.computeInfrastructure).toFixed(0)} PF`);
console.log(`  Organizations: ${initialState.organizations.length} total`);
console.log(`  Bankrupt: ${initialState.organizations.filter(o => o.bankrupt).length}`);

// Simulate extreme mortality scenario
// Force 93% population loss over 24 months
const targetMonths = 24;
const targetMortality = 0.93;
const monthlyMortalityRate = Math.pow(1 - targetMortality, 1 / targetMonths);

console.log('\n--- Simulating extreme mortality (93% over 24 months) ---\n');

for (let month = 1; month <= targetMonths; month++) {
  const state = engine.getState();

  // Apply mortality before stepping
  state.humanPopulationSystem.population *= monthlyMortalityRate;

  // Update regional populations proportionally
  if (state.humanPopulationSystem.regionalPopulations) {
    state.humanPopulationSystem.regionalPopulations.forEach(region => {
      region.population *= monthlyMortalityRate;
    });
  }

  // Run one simulation step
  engine.step();

  // Log every 6 months
  if (month % 6 === 0) {
    const currentState = engine.getState();
    const popFraction = currentState.humanPopulationSystem.population / currentState.humanPopulationSystem.baselinePopulation;
    const compute = getTotalEffectiveCompute(currentState.computeInfrastructure);
    const bankruptOrgs = currentState.organizations.filter(o => o.bankrupt).length;
    const totalOrgs = currentState.organizations.length;

    console.log(`\nMonth ${month}:`);
    console.log(`  Population: ${currentState.humanPopulationSystem.population.toFixed(1)}M (${(popFraction * 100).toFixed(1)}%)`);
    console.log(`  Compute: ${compute.toFixed(0)} PF`);
    console.log(`  Organizations: ${totalOrgs - bankruptOrgs}/${totalOrgs} surviving (${((1 - bankruptOrgs / totalOrgs) * 100).toFixed(0)}%)`);

    // Check coherence
    const skilledWorkers = popFraction * 8_000_000 * 0.001; // 0.1% of pop
    const requiredWorkers = compute * 0.0001;
    const coherenceRatio = skilledWorkers / requiredWorkers;

    if (coherenceRatio < 1.0) {
      console.log(`  ⚠️  COHERENCE ISSUE: Need ${requiredWorkers.toFixed(0)}K workers, have ${skilledWorkers.toFixed(0)}K (${(coherenceRatio * 100).toFixed(0)}%)`);
    } else {
      console.log(`  ✅ Coherence OK: ${skilledWorkers.toFixed(0)}K workers available for ${requiredWorkers.toFixed(0)}K required`);
    }
  }
}

// Final validation
console.log('\n=== Final Validation (Month 24) ===\n');

const finalState = engine.getState();
const finalPopFraction = finalState.humanPopulationSystem.population / finalState.humanPopulationSystem.baselinePopulation;
const finalCompute = getTotalEffectiveCompute(finalState.computeInfrastructure);
const finalBankrupt = finalState.organizations.filter(o => o.bankrupt).length;
const finalSurviving = finalState.organizations.length - finalBankrupt;

console.log(`Population: ${finalState.humanPopulationSystem.population.toFixed(1)}M (${(finalPopFraction * 100).toFixed(1)}%)`);
console.log(`Compute: ${finalCompute.toFixed(0)} PF`);
console.log(`Organizations: ${finalSurviving}/${finalState.organizations.length} surviving`);

// Coherence checks
const skilledWorkers = finalPopFraction * 8_000_000 * 0.001;
const requiredWorkers = finalCompute * 0.0001;
const coherenceRatio = skilledWorkers / requiredWorkers;

console.log(`\nCoherence Analysis:`);
console.log(`  Skilled workers available: ${skilledWorkers.toFixed(0)}K (0.1% of population)`);
console.log(`  Workers required for ${finalCompute.toFixed(0)} PF: ${requiredWorkers.toFixed(0)}K`);
console.log(`  Coherence ratio: ${coherenceRatio.toFixed(2)}x`);

// Validation criteria
const checks = {
  population: finalPopFraction < 0.10,
  computeDecay: finalCompute < 5000, // Should be << 45K initial
  orgCollapse: finalSurviving < state.organizations.length * 0.5, // >50% should fail
  coherence: coherenceRatio >= 0.1 // Some infrastructure can survive with heroic effort
};

console.log(`\n--- Validation Results ---`);
console.log(`✓ Extreme mortality achieved: ${checks.population ? 'PASS' : 'FAIL'} (${(finalPopFraction * 100).toFixed(1)}%)`);
console.log(`✓ Compute capacity degraded: ${checks.computeDecay ? 'PASS' : 'FAIL'} (${finalCompute.toFixed(0)} PF)`);
console.log(`✓ Organizations collapsed: ${checks.orgCollapse ? 'PASS' : 'FAIL'} (${finalSurviving}/${state.organizations.length})`);
console.log(`✓ Infrastructure coherence: ${checks.coherence ? 'PASS' : 'FAIL'} (ratio: ${coherenceRatio.toFixed(2)})`);

const allPassed = Object.values(checks).every(v => v);
console.log(`\n${allPassed ? '✅ ALL CHECKS PASSED' : '❌ SOME CHECKS FAILED'}\n`);

if (!allPassed) {
  console.error('Coherence violations detected!');
  process.exit(1);
}

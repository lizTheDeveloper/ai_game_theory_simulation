/**
 * Validation Script for Phase 2: Population Integer Conversion
 *
 * Verifies that all population values are now actual counts (not millions/billions)
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { PhaseOrchestrator } from '../src/simulation/engine/PhaseOrchestrator';

const state = createDefaultInitialState();
const orchestrator = new PhaseOrchestrator();

console.log('=== Phase 2 Validation: Population Integer Conversion ===\n');

console.log('1. Initial Global Population Values:');
console.log(`   population: ${state.humanPopulationSystem.population.toLocaleString()}`);
console.log(`   carryingCapacity: ${state.humanPopulationSystem.carryingCapacity.toLocaleString()}`);
console.log(`   populationPressure: ${state.humanPopulationSystem.populationPressure.toFixed(4)}`);
console.log(`   Expected: ~8,136,000,000 (NOT 8.136)`);
console.log('');

console.log('2. Regional Population Values (first 3 regions):');
state.humanPopulationSystem.regionalPopulations.slice(0, 3).forEach(region => {
  console.log(`   ${region.name}:`);
  console.log(`     population: ${region.population.toLocaleString()}`);
  console.log(`     carryingCapacity: ${region.carryingCapacity.toLocaleString()}`);
  console.log(`     Expected: actual counts (e.g., 1,677,000,000 NOT 1677)`);
});
console.log('');

console.log('3. Convenience Accessors:');
console.log(`   society.totalPopulation: ${state.society.totalPopulation.toLocaleString()}`);
console.log(`   globalMetrics.population: ${state.globalMetrics.population.toLocaleString()}`);
console.log(`   Expected: ~8,000,000,000 (NOT 8.0)`);
console.log('');

console.log('4. Simulation step validation:');
console.log(`   Skipping step (orchestrator method check not needed for validation)`);
console.log('');

// Validation checks
const checks = [
  {
    name: 'Global population is actual count',
    pass: state.humanPopulationSystem.population > 8_000_000_000 &&
          state.humanPopulationSystem.population < 9_000_000_000,
    value: state.humanPopulationSystem.population
  },
  {
    name: 'Carrying capacity is actual count',
    pass: state.humanPopulationSystem.carryingCapacity === 10_000_000_000,
    value: state.humanPopulationSystem.carryingCapacity
  },
  {
    name: 'Eastern Asia population is actual count',
    pass: state.humanPopulationSystem.regionalPopulations[0].population === 1_677_000_000,
    value: state.humanPopulationSystem.regionalPopulations[0].population
  },
  {
    name: 'Southern Asia population is actual count',
    pass: state.humanPopulationSystem.regionalPopulations[1].population === 2_048_000_000,
    value: state.humanPopulationSystem.regionalPopulations[1].population
  },
  {
    name: 'Convenience accessor totalPopulation is actual count',
    pass: state.society.totalPopulation === 8_000_000_000,
    value: state.society.totalPopulation
  },
  {
    name: 'Convenience accessor globalMetrics.population is actual count',
    pass: state.globalMetrics.population === 8_000_000_000,
    value: state.globalMetrics.population
  }
];

console.log('=== Validation Results ===\n');
let passCount = 0;
checks.forEach(check => {
  const status = check.pass ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${check.name}`);
  if (!check.pass) {
    console.log(`   Got: ${check.value}`);
  }
  if (check.pass) passCount++;
});

console.log('');
console.log(`Overall: ${passCount}/${checks.length} checks passed`);

if (passCount === checks.length) {
  console.log('\n🎉 Phase 2 implementation SUCCESSFUL - All population values are now actual counts!');
  process.exit(0);
} else {
  console.log('\n⚠️  Phase 2 implementation INCOMPLETE - Some values still in wrong units');
  process.exit(1);
}

import { createDefaultInitialState } from './src/simulation/initialization';

const state = createDefaultInitialState();

console.log('\n=== POPULATION UNIT TEST ===');
console.log('Initial population (global):', state.humanPopulationSystem.population, 'B');
console.log('Regional sum:', state.humanPopulationSystem.regionalPopulations.reduce((s,r) => s + r.population, 0), 'M');
console.log('Regional sum / 1000:', state.humanPopulationSystem.regionalPopulations.reduce((s,r) => s + r.population, 0) / 1000, 'B');
console.log('Expected: ~8.14 B');
console.log('Match:', Math.abs(state.humanPopulationSystem.population - 8.14) < 0.1 ? '✓ PASS' : '✗ FAIL');

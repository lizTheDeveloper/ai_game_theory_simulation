import { createDefaultInitialState } from '../src/simulation/initialization';

const state = createDefaultInitialState();

console.log('\n=== COUNTRY POPULATION SYSTEM ===');
console.log('Exists:', !!state.countryPopulationSystem);

if (state.countryPopulationSystem) {
  const countries = Object.keys(state.countryPopulationSystem.countries);
  console.log('Countries (' + countries.length + '):', countries.join(', '));

  const us = state.countryPopulationSystem.countries['United States'];
  if (us) {
    console.log('\nUnited States:');
    console.log('  Population:', us.population, 'M');
    console.log('  Baseline:', us.baselinePopulation, 'M');
    console.log('  Region:', us.region);
  }
}

console.log('\n=== ORGANIZATIONS & DATA CENTERS ===');
for (const org of state.organizations) {
  console.log(`\n${org.name}:`);
  console.log('  Data centers owned:', org.ownedDataCenters.length);

  const orgDCs = state.computeInfrastructure.dataCenters.filter(dc =>
    org.ownedDataCenters.includes(dc.id)
  );

  for (const dc of orgDCs) {
    console.log(`  - ${dc.name}: region=${dc.region || 'UNDEFINED'}`);
  }
}

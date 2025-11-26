import { SimulationEngine } from '@/simulation/engine';
import { getHistoricalOverrides } from '@/simulation/initialization';

// Create engine and get state with historical overrides for 1990
const engine = new SimulationEngine({ seed: 12345 });
const state = engine.getInitialState({ scenarioMode: 'historical', historicalOverrides: getHistoricalOverrides(1990) });

console.log('Initial CO2:', state.resourceEconomy.co2.atmosphericCO2);
console.log('Initial temp:', state.resourceEconomy.co2.temperatureAnomaly);
console.log('Start year:', state.currentYear);

// Run 1 step
engine.step(state);
console.log('\nAfter 1 month CO2:', state.resourceEconomy.co2.atmosphericCO2);
console.log('PPM change:', state.resourceEconomy.co2.atmosphericCO2 - 354);

// Run 59 more months (total 60 = 5 years)
for (let i = 2; i <= 60; i++) {
  engine.step(state);
}
console.log('\nAfter 60 months (5 years) CO2:', state.resourceEconomy.co2.atmosphericCO2);
console.log('Total PPM change over 60 months:', state.resourceEconomy.co2.atmosphericCO2 - 354);
console.log('Expected (actual 1990-1995): 7 ppm');

console.log('\n--- ANALYSIS ---');
console.log('Initial sink capacity:', state.resourceEconomy.co2.oceanAbsorption + state.resourceEconomy.co2.landAbsorption, 'Gt/year');
console.log('Initial sinkSaturation:', state.resourceEconomy.co2.sinkSaturation);

console.log('\nResource consumption:');
console.log('  Oil:', state.resourceEconomy.oil.monthlyConsumption, '* co2PerUnit:', state.resourceEconomy.oil.co2PerUnit);
console.log('  Coal:', state.resourceEconomy.coal.monthlyConsumption, '* co2PerUnit:', state.resourceEconomy.coal.co2PerUnit);
console.log('  Gas:', state.resourceEconomy.naturalGas.monthlyConsumption, '* co2PerUnit:', state.resourceEconomy.naturalGas.co2PerUnit);

// Calculate expected emissions
const oil = state.resourceEconomy.oil;
const coal = state.resourceEconomy.coal;
const gas = state.resourceEconomy.naturalGas;

const oilEmissions = oil.monthlyConsumption * oil.co2PerUnit * 3.0;
const coalEmissions = coal.monthlyConsumption * coal.co2PerUnit * 3.0;
const gasEmissions = gas.monthlyConsumption * gas.co2PerUnit * 3.0;
const methane = gas.monthlyConsumption * gas.methaneLeakage * 80;

console.log('\nCalculated emissions (formula: monthlyConsumption * co2PerUnit * 3.0):');
console.log('  Oil:', oilEmissions.toFixed(4), 'Gt/month');
console.log('  Coal:', coalEmissions.toFixed(4), 'Gt/month');
console.log('  Gas:', gasEmissions.toFixed(4), 'Gt/month');
console.log('  Methane:', methane.toFixed(4), 'Gt/month');
console.log('  TOTAL:', (oilEmissions + coalEmissions + gasEmissions + methane).toFixed(4), 'Gt/month');
console.log('  Annual:', ((oilEmissions + coalEmissions + gasEmissions + methane) * 12).toFixed(2), 'Gt/year');

const sinkCapacity = (state.resourceEconomy.co2.oceanAbsorption + state.resourceEconomy.co2.landAbsorption) * (1 - state.resourceEconomy.co2.sinkSaturation);
const netEmissions = Math.max(0, (oilEmissions + coalEmissions + gasEmissions + methane) - sinkCapacity/12);
console.log('\nSink capacity (adjusted):', sinkCapacity.toFixed(2), 'Gt/year =', (sinkCapacity/12).toFixed(4), 'Gt/month');
console.log('Net emissions (gross - sinks):', netEmissions.toFixed(4), 'Gt/month');
console.log('PPM increase per month:', (netEmissions / 2.13).toFixed(4));
console.log('PPM increase over 60 months (5 years):', ((netEmissions / 2.13) * 60).toFixed(2));

console.log('\n--- ANALYSIS ---');
console.log('Actual 1990-1995 CO2 increase: 7 ppm');
console.log('Simulated over 60 months:', ((netEmissions / 2.13) * 60).toFixed(2), 'ppm');
console.log('If net emissions are 0, the 75 ppm increase must come from elsewhere!');

// Check annual emissions stored in state
console.log('\nState annualEmissions value:', state.resourceEconomy.co2.annualEmissions);

#!/usr/bin/env tsx
/**
 * Debug Emissions Reduction - FIX #18 Validation
 *
 * Traces emissions, renewable percentage, and fossil fuel consumption
 * over a 360-month simulation to verify FIX #18 works correctly.
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';

console.log('=== EMISSIONS REDUCTION DEBUG (FIX #18) ===\n');
console.log('Testing if emissions respond to clean energy deployment\n');

const initialState = createDefaultInitialState();
const engine = new SimulationEngine({ seed: 42, maxMonths: 360 });

console.log('Month | Renewable% | Oil Cons | Coal Cons | Gas Cons | Total Emissions | Net Emissions');
console.log('------|------------|----------|-----------|----------|-----------------|---------------');

// Initial state
const resources = initialState.resourceEconomy;
const renewablePct = (resources.energy.renewablePercentage * 100).toFixed(1);
const oilCons = resources.oil.monthlyConsumption.toFixed(3);
const coalCons = resources.coal.monthlyConsumption.toFixed(3);
const gasCons = resources.naturalGas.monthlyConsumption.toFixed(3);
const totalEmissions = resources.co2.annualEmissions.toFixed(1);
const cdr = initialState.climateState?.annualCDR ?? 0;
const netEmissions = (resources.co2.annualEmissions - cdr).toFixed(1);

console.log(
  `    0 | ` +
  `${renewablePct.padStart(9)}% | ` +
  `${oilCons.padStart(8)} | ` +
  `${coalCons.padStart(9)} | ` +
  `${gasCons.padStart(8)} | ` +
  `${totalEmissions.padStart(15)} | ` +
  `${netEmissions.padStart(15)}`
);

// Run simulation with snapshots every 24 months
const result = engine.run(initialState, {
  maxMonths: 360,
  checkActualOutcomes: false,
  snapshotInterval: 24
});

// Print snapshots
for (const snapshot of result.snapshots) {
  const month = snapshot.currentMonth;
  const resources = snapshot.resourceEconomy;
  const renewablePct = (resources.energy.renewablePercentage * 100).toFixed(1);
  const oilCons = resources.oil.monthlyConsumption.toFixed(3);
  const coalCons = resources.coal.monthlyConsumption.toFixed(3);
  const gasCons = resources.naturalGas.monthlyConsumption.toFixed(3);
  const totalEmissions = resources.co2.annualEmissions.toFixed(1);

  // Calculate net emissions (total - CDR)
  const cdr = snapshot.climateState?.annualCDR ?? 0;
  const netEmissions = (resources.co2.annualEmissions - cdr).toFixed(1);

  console.log(
    `${month.toString().padStart(5)} | ` +
    `${renewablePct.padStart(9)}% | ` +
    `${oilCons.padStart(8)} | ` +
    `${coalCons.padStart(9)} | ` +
    `${gasCons.padStart(8)} | ` +
    `${totalEmissions.padStart(15)} | ` +
    `${netEmissions.padStart(15)}`
  );
}

console.log('\n=== ANALYSIS ===');
const finalState = result.finalState;
const finalRenewable = (finalState.resourceEconomy.energy.renewablePercentage * 100).toFixed(1);
const finalEmissions = finalState.resourceEconomy.co2.annualEmissions.toFixed(1);
const initialEmissions = parseFloat(totalEmissions); // From initial state

console.log(`\nInitial emissions: ${initialEmissions} GtCO₂/year`);
console.log(`Final emissions: ${finalEmissions} GtCO₂/year`);
console.log(`Final renewable: ${finalRenewable}%`);
console.log(`Reduction: ${((initialEmissions - parseFloat(finalEmissions)) / initialEmissions * 100).toFixed(1)}%`);

if (parseFloat(finalEmissions) < initialEmissions * 0.5) {
  console.log('\n✅ SUCCESS: Emissions reduced by >50%');
} else if (parseFloat(finalEmissions) < initialEmissions) {
  console.log('\n⚠️  PARTIAL: Some reduction but <50%');
} else {
  console.log('\n❌ FAILURE: Emissions did not reduce');
}

console.log(`\nFinal outcome: ${finalState.outcome}`);
console.log(`Final mortality: ${(finalState.globalMetrics.totalMortality * 100).toFixed(1)}%`);

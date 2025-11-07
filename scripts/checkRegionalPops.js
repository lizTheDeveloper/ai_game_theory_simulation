const data = require('../monteCarloOutputs/run_42000_historical_events.json');

console.log(`Total snapshots: ${data.snapshots.length}`);

const month1 = data.snapshots.find(s => s.month === 1);
if (!month1) {
  console.log('ERROR: No month 1 snapshot found');
  process.exit(1);
}

console.log(`Month 1 found`);
console.log(`HumanPopulationSystem exists: ${!!month1.humanPopulationSystem}`);
console.log(`RegionalPopulations exists: ${!!month1.humanPopulationSystem?.regionalPopulations}`);
console.log(`RegionalPopulations length: ${month1.humanPopulationSystem?.regionalPopulations?.length || 'MISSING'}`);

if (month1.humanPopulationSystem?.regionalPopulations?.length > 0) {
  const region = month1.humanPopulationSystem.regionalPopulations[0];
  console.log(`\nFirst region: ${region.name || 'unnamed'}`);
  console.log(`Has mortalityStabilizers: ${!!region.mortalityStabilizers}`);

  if (region.mortalityStabilizers) {
    console.log(`Combined reduction: ${region.mortalityStabilizers.combinedReduction}`);
  }
}

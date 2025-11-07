const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./monteCarloOutputs/run_42000_historical_events.json', 'utf8'));

console.log(`Total months: ${data.totalMonths}`);
console.log(`Outcome: ${data.outcome}`);
console.log(`Outcome reason: ${data.outcomeReason}`);

// The snapshots are an object with keys like "initial", "mid", "final"
console.log(`\nSnapshot keys:`, Object.keys(data.snapshots));

// Try to find population in any snapshot
for (const [key, snap] of Object.entries(data.snapshots)) {
  console.log(`\nSnapshot "${key}":`);
  console.log(`  Month: ${snap.month}`);
  console.log(`  Keys:`, Object.keys(snap).slice(0, 10).join(', '));

  // Check for population-related fields
  const popFields = Object.keys(snap).filter(k => k.toLowerCase().includes('pop'));
  if (popFields.length > 0) {
    console.log(`  Population fields:`, popFields);
    for (const field of popFields) {
      console.log(`    ${field}: ${snap[field]}`);
    }
  }
}

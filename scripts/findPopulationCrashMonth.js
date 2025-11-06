const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./monteCarloOutputs/run_42000_historical_events.json', 'utf8'));

// events is an object with structure shown in the sample
// Let's check its structure first
console.log(`Events keys:`, Object.keys(data.events));
console.log(`Critical events count:`, data.criticalEvents.length);

// Check first few critical events
console.log(`\nFirst 10 critical events:`);
data.criticalEvents.slice(0, 10).forEach(event => {
  console.log(`  Month ${event.month}: ${event.title} (${event.agent})`);
});

// Check last 10 critical events (might show what caused the crash)
console.log(`\nLast 10 critical events:`);
data.criticalEvents.slice(-10).forEach(event => {
  console.log(`  Month ${event.month}: ${event.title} (${event.agent})`);
});

// Look for population/mortality related events
const popEvents = data.criticalEvents.filter(e =>
  e.title && (
    e.title.toLowerCase().includes('population') ||
    e.title.toLowerCase().includes('mortality') ||
    e.title.toLowerCase().includes('death') ||
    e.title.toLowerCase().includes('famine') ||
    e.title.toLowerCase().includes('wet bulb')
  )
);

console.log(`\nPopulation/mortality related critical events (${popEvents.length}):`);
popEvents.forEach(event => {
  console.log(`  Month ${event.month}: ${event.title}`);
});

/**
 * Minimal RNG test to isolate the NaN issue
 */

import { SimulationEngine } from '@/simulation/engine';

console.log('Testing RNG binding...\n');

const engine = new SimulationEngine({ seed: 42, maxMonths: 100 });
const seededRng = engine.getRNG();

console.log('seededRng:', seededRng);
console.log('typeof seededRng:', typeof seededRng);
console.log('seededRng.next:', seededRng.next);
console.log('typeof seededRng.next:', typeof seededRng.next);

console.log('\nCalling seededRng.next() directly:');
console.log('  Result 1:', seededRng.next());
console.log('  Result 2:', seededRng.next());
console.log('  Result 3:', seededRng.next());

console.log('\nBinding with .bind():');
const rng = seededRng.next.bind(seededRng);
console.log('  Result 1:', rng());
console.log('  Result 2:', rng());
console.log('  Result 3:', rng());

console.log('\n✅ RNG binding test complete');

/**
 * Quick test: Verify Information Ecology metrics in snapshots
 */
import { createDefaultInitialState } from '../src/simulation/initialization';
import { SimulationLogger } from '../src/simulation/logging';

// Simple seeded RNG for testing
function createRNG(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

const rng = createRNG(12345);
const state = createDefaultInitialState(rng);
const logger = new SimulationLogger('full');

// Take a snapshot
logger.logStep(state, []);

// Get snapshots
const snapshots = logger.getSnapshots();
if (snapshots.length === 0) {
  console.log('❌ No snapshots created');
  process.exit(1);
}

const snapshot = snapshots[0];

// Check Information Ecology fields
const ieFields = [
  'epistemicHealth',
  'polarization',
  'socialTrust',
  'sharedReality',
  'misinformationLoad',
  'factCheckHalfLife',
  'misinformationR0',
  'coordinationCapacity'
];

console.log('\n=== Information Ecology Snapshot Test ===\n');

let allPresent = true;
for (const field of ieFields) {
  const value = (snapshot as any)[field];
  if (value === undefined) {
    console.log(`❌ Missing: ${field}`);
    allPresent = false;
  } else {
    console.log(`✅ ${field}: ${value}`);
  }
}

if (allPresent) {
  console.log('\n✅ All Information Ecology fields present in snapshot!');
  process.exit(0);
} else {
  console.log('\n❌ Some Information Ecology fields missing from snapshot');
  process.exit(1);
}

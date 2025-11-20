import { applyEnergyConstrainedCleanup } from '../src/simulation/utils/energyConstrainedCleanup';
import { getAllTech } from '../src/simulation/techTree/comprehensiveTechTree';
import type { GameState } from '../src/types/game';

// Create seeded RNG
function createSeededRng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

// Setup state
const state = {
  currentMonth: 120,
  resourceEconomy: {
    energy: {
      renewableCapacity: 100,
      demand: 50,
      fossilCapacity: 500,
      nuclearCapacity: 50,
    },
  },
} as GameState;

// Get tech
const tech = getAllTech().find((t) => t.id === 'pfas_remediation');
if (!tech) throw new Error('Tech not found');

tech.deploymentLevel = 1.0;

console.log('Tech properties:');
console.log(`  reboundCoefficient: ${tech.reboundCoefficient}`);
console.log(`  reboundUncertaintyRange: ${tech.reboundUncertaintyRange}`);
console.log(`  avoidsRebound: ${tech.avoidsRebound}`);

// Test with seed 1
console.log('\n=== Seed 11111 ===');
const rng1 = createSeededRng(11111);
const result1 = applyEnergyConstrainedCleanup(state, tech, 1.2, rng1);
console.log('Result:', result1);

// Test with seed 2
console.log('\n=== Seed 99999 ===');
const rng2 = createSeededRng(99999);
const result2 = applyEnergyConstrainedCleanup(state, tech, 1.2, rng2);
console.log('Result:', result2);

console.log(`\n=== Comparison ===`);
console.log(`Rebound 1: ${result1.rebound}`);
console.log(`Rebound 2: ${result2.rebound}`);
console.log(`Different? ${result1.rebound !== result2.rebound}`);

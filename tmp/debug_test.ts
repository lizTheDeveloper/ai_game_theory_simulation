import { updateNovelEntitiesBoundary } from '../src/simulation/updateNovelEntitiesBoundary';
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
  globalMetrics: {
    economicTransitionStage: 3.0,
    manufacturingCapability: 0.8,
  },
  resourceEconomy: {
    energy: {
      renewableCapacity: 100,
      demand: 50,
      fossilCapacity: 500,
      nuclearCapacity: 50,
    },
  },
  planetaryBoundariesSystem: {
    boundaries: {
      novel_entities: {
        name: 'novel_entities',
        currentValue: 1.2,
        safeOperatingSpace: 1.0,
        irreversible: true,
        recoveryHalfLife: 500,
        peak: 1.2,
      },
    },
  },
} as GameState;

// Deploy tech
const tech = getAllTech().find((t) => t.id === 'pfas_remediation');
if (tech) {
  tech.deploymentLevel = 1.0;
  console.log(`Tech deployed: ${tech.name}`);
  console.log(`  reboundCoefficient: ${tech.reboundCoefficient}`);
  console.log(`  reboundUncertaintyRange: ${tech.reboundUncertaintyRange}`);
  console.log(`  techType: ${tech.techType}`);
  console.log(`  avoidsRebound: ${tech.avoidsRebound}`);
  console.log(`  energyRequirement: ${tech.energyRequirement}`);
  console.log(`  minimumConcentration: ${tech.minimumConcentration}`);
}

// Run 1
console.log('\n=== RUN 1 (seed 11111) ===');
const rng1 = createSeededRng(11111);
const boundary1 = state.planetaryBoundariesSystem.boundaries.novel_entities;
boundary1.currentValue = 1.2;

for (let i = 0; i < 3; i++) {  // Just 3 iterations for debugging
  console.log(`\nIteration ${i + 1}:`);
  updateNovelEntitiesBoundary(state, rng1);
  console.log(`  Current value: ${boundary1.currentValue}`);
}
const value1 = boundary1.currentValue;
console.log(`Final value1: ${value1}`);

// Run 2
console.log('\n=== RUN 2 (seed 99999) ===');
const rng2 = createSeededRng(99999);
boundary1.currentValue = 1.2;

for (let i = 0; i < 3; i++) {
  console.log(`\nIteration ${i + 1}:`);
  updateNovelEntitiesBoundary(state, rng2);
  console.log(`  Current value: ${boundary1.currentValue}`);
}
const value2 = boundary1.currentValue;
console.log(`Final value2: ${value2}`);

console.log(`\n=== RESULTS ===`);
console.log(`Difference: ${Math.abs(value1 - value2)}`);
console.log(`Same? ${Math.abs(value1 - value2) < 1e-5}`);

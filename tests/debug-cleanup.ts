/**
 * Debug script to see what cleanup effectiveness actually is
 */

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

// Create minimal mock state
const state: GameState = {
  currentMonth: 120,
  globalMetrics: {
    economicTransitionStage: 3.0,
    manufacturingCapability: 0.8,
  },
} as GameState;

state.resourceEconomy = {
  energy: {
    renewableCapacity: 100,
    demand: 50,
    fossilCapacity: 500,
    nuclearCapacity: 50,
  },
} as any;

state.planetaryBoundariesSystem = {
  boundaries: {
    novel_entities: {
      name: 'novel_entities',
      currentValue: 1.5,
      safeOperatingSpace: 1.0,
      irreversible: true,
      recoveryHalfLife: 500,
      peak: 1.5,
    },
  },
} as any;

const rng = createSeededRng(42000);

// Deploy PFAS remediation
const tech = getAllTech().find((t) => t.id === 'pfas_remediation');
if (tech) {
  tech.deploymentLevel = 1.0;
  console.log(`\nDeployed: ${tech.name}`);
  console.log(`  pfasReduction: ${(tech.effects as any).pfasReduction}`);
  console.log(`  pollutionReduction: ${tech.effects.pollutionReduction}`);
  console.log(`  energyRequirement: ${JSON.stringify(tech.energyRequirement)}`);
  console.log(`  minimumConcentration: ${JSON.stringify(tech.minimumConcentration)}`);
}

const boundary = state.planetaryBoundariesSystem.boundaries.novel_entities;
const initialValue = boundary.currentValue;

console.log(`\nInitial boundary value: ${initialValue}`);
console.log(`Production rate: (${state.globalMetrics.economicTransitionStage} * 0.002) + (${state.globalMetrics.manufacturingCapability} * 0.001) = ${(state.globalMetrics.economicTransitionStage * 0.002) + (state.globalMetrics.manufacturingCapability * 0.001)}`);
console.log(`Renewable surplus: ${state.resourceEconomy.energy.renewableCapacity} - ${state.resourceEconomy.energy.demand} = ${state.resourceEconomy.energy.renewableCapacity - state.resourceEconomy.energy.demand} EJ`);

updateNovelEntitiesBoundary(state, rng);

const finalValue = boundary.currentValue;
const change = finalValue - initialValue;

console.log(`\nFinal boundary value: ${finalValue}`);
console.log(`Change: ${change}`);
console.log(`Change < 0.01? ${change < 0.01}`);

if (Math.abs(change) >= 0.01) {
  console.log(`\n❌ TEST WOULD FAIL: Expected change < 0.01, got ${change}`);
} else {
  console.log(`\n✓ TEST WOULD PASS: change ${change} < 0.01`);
}

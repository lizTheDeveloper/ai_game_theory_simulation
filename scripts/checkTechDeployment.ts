#!/usr/bin/env -S npx tsx
/**
 * Quick diagnostic: Check technology deployment in a simulation run
 */

import { runSimulation } from './runSimulation';
import { createSeededRNG } from '../src/simulation/utils/deterministicRng';

const seed = 42000;
const maxMonths = 120;

console.log(`Running simulation (seed ${seed}, ${maxMonths} months)...`);

const rng = createSeededRNG(seed);
const result = runSimulation({
  seed,
  maxMonths,
  rng,
  enableLogging: false // Silent
});

const { state } = result;

// Count deployed technologies
const deployedTechs = Object.entries(state.techTree.deployedTechs)
  .filter(([_, deployed]) => deployed)
  .map(([id]) => id);

const totalTechs = 71; // From techTree definition
const deployedCount = deployedTechs.length;
const deploymentPct = (deployedCount / totalTechs * 100).toFixed(1);

console.log(`\n=== TECHNOLOGY DEPLOYMENT ===`);
console.log(`Deployed: ${deployedCount}/${totalTechs} (${deploymentPct}%)`);
console.log(`Crisis severity: ${state.crisisSeverity || 'unknown'}`);
console.log(`Population: ${state.humanPopulationSystem.population.toFixed(2)}B`);
console.log(`QoL: ${state.qualityOfLife.overall.toFixed(3)}`);
console.log(`\nDeployed technologies:`);
deployedTechs.slice(0, 10).forEach(id => console.log(`  - ${id}`));
if (deployedTechs.length > 10) {
  console.log(`  ... and ${deployedTechs.length - 10} more`);
}

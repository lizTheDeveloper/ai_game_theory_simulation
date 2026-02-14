#!/usr/bin/env tsx
/**
 * Single Run Validation Script
 * For determinism testing and cascade validation
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import seedrandom from 'seedrandom';
import * as fs from 'fs';
import * as path from 'path';

// Parse arguments
const args = process.argv.slice(2);
const seedArg = args.find(arg => arg.startsWith('--seed='))?.split('=')[1];
const monthsArg = args.find(arg => arg.startsWith('--max-months='))?.split('=')[1];
const outputArg = args.find(arg => arg.startsWith('--output='))?.split('=')[1];

const seed = seedArg ? parseInt(seedArg) : 42;
const maxMonths = monthsArg ? parseInt(monthsArg) : 60;
const outputFile = outputArg || path.join(__dirname, '..', 'logs', `single_run_seed${seed}.log`);

// Ensure logs directory exists
const logsDir = path.dirname(outputFile);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Logging function
function log(message: string) {
  console.log(message);
  fs.appendFileSync(outputFile, message + '\n', 'utf8');
}

log(`\n=== SINGLE RUN VALIDATION ===`);
log(`Seed: ${seed}`);
log(`Max Months: ${maxMonths}`);
log(`Output: ${outputFile}`);
log(`Started: ${new Date().toISOString()}\n`);

// Create RNG function from seed
const rng = seedrandom(seed.toString());

// Run simulation
const state = createDefaultInitialState(rng);
const engine = new SimulationEngine(seed);

let cascadeCount = 0;
let maxCascadeMultiplier = 1.0;
let climateOvershoots: number[] = [];

for (let month = 0; month < maxMonths; month++) {
  engine.step(state);

  // Track cascade metrics
  if (state.tippingPointSystem?.cascadeMultiplier > 1.0) {
    cascadeCount++;
    maxCascadeMultiplier = Math.max(maxCascadeMultiplier, state.tippingPointSystem.cascadeMultiplier);
  }

  // Track climate overshoot
  if (state.planetaryBoundaries?.climate?.overshoot) {
    climateOvershoots.push(state.planetaryBoundaries.climate.overshoot);
  }

  // Log yearly
  if (month % 12 === 0) {
    const year = month / 12;
    const climate = state.planetaryBoundaries?.climate?.overshoot || 0;
    const cascade = state.tippingPointSystem?.cascadeMultiplier || 1.0;
    const tipped = state.tippingPointSystem?.tippedElements?.length || 0;
    log(`Year ${year}: Climate=${climate.toFixed(2)}x, Cascade=${cascade.toFixed(2)}x, Tipped=${tipped}`);
  }
}

// Final metrics
const finalClimate = state.planetaryBoundaries?.climate?.overshoot || 0;
const finalOutcome = state.outcomeClassification || 'unknown';
const avgClimate = climateOvershoots.length > 0
  ? climateOvershoots.reduce((a, b) => a + b, 0) / climateOvershoots.length
  : 0;

log(`\n=== FINAL METRICS ===`);
log(`Outcome: ${finalOutcome}`);
log(`Final Climate Overshoot: ${finalClimate.toFixed(4)}x`);
log(`Average Climate Overshoot: ${avgClimate.toFixed(4)}x`);
log(`Cascade Events: ${cascadeCount}`);
log(`Max Cascade Multiplier: ${maxCascadeMultiplier.toFixed(4)}x`);
log(`Tipped Elements: ${state.tippingPointSystem?.tippedElements?.length || 0}`);
log(`Population: ${(state.humanPopulationSystem?.population || 0).toFixed(2)}B`);
log(`Completed: ${new Date().toISOString()}\n`);

// Export summary as JSON for easy parsing
const summary = {
  seed,
  maxMonths,
  outcome: finalOutcome,
  finalClimate,
  avgClimate,
  cascadeCount,
  maxCascadeMultiplier,
  tippedElements: state.tippingPointSystem?.tippedElements?.length || 0,
  population: state.humanPopulationSystem?.population || 0
};

const jsonFile = outputFile.replace('.log', '.json');
fs.writeFileSync(jsonFile, JSON.stringify(summary, null, 2), 'utf8');
log(`Summary exported to: ${jsonFile}`);

process.exit(0);

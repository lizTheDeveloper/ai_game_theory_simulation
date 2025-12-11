/**
 * Test script: Nuclear Winter → Solar Energy Integration (ARCH-4 Gap #1)
 * 
 * Validates that nuclear winter sunlight blocking reduces solar panel output.
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { triggerNuclearWinter, updateNuclearWinter } from '../src/simulation/nuclearWinter';
import { updatePowerGeneration } from '../src/simulation/powerGeneration';

console.log('=== NUCLEAR WINTER → SOLAR ENERGY INTEGRATION TEST ===\n');

// Create RNG function for deterministic testing
const rng = () => 0.5;

// Initialize state
const state = createDefaultInitialState(rng, 'historical');
state.currentMonth = 0;

// Set up initial conditions
console.log('Initial conditions:');
console.log(`  Renewable percentage: ${(state.powerGenerationSystem.renewablePercentage * 100).toFixed(0)}%`);
console.log(`  Carbon intensity: ${state.powerGenerationSystem.carbonIntensity.toFixed(0)} gCO2e/kWh`);

// Trigger nuclear winter (150 Tg soot - worst case)
console.log('\n--- Triggering Nuclear Winter (150 Tg soot) ---');
triggerNuclearWinter(state, 5000, ['United States', 'Russia', 'China'], rng);

console.log(`\nNuclear winter state:`);
console.log(`  Active: ${state.nuclearWinterState.active}`);
console.log(`  Soot: ${state.nuclearWinterState.currentSoot.toFixed(0)} Tg`);
console.log(`  Sunlight blocked: ${(state.nuclearWinterState.sunlightBlocked * 100).toFixed(0)}%`);
console.log(`  Temperature anomaly: ${state.nuclearWinterState.temperatureAnomaly.toFixed(1)}°C`);

// Update power generation to apply nuclear winter effects
console.log('\n--- Updating Power Generation ---');
updatePowerGeneration(state, rng);

console.log(`\nPower system after nuclear winter:`);
console.log(`  Renewable percentage (nominal): ${(state.powerGenerationSystem.renewablePercentage * 100).toFixed(0)}%`);
console.log(`  Carbon intensity: ${state.powerGenerationSystem.carbonIntensity.toFixed(0)} gCO2e/kWh`);
console.log(`  Expected increase in emissions due to fossil backup`);

// Simulate recovery (6 months)
console.log('\n--- Simulating 6 Months of Recovery ---');
const initialCarbonIntensity = state.powerGenerationSystem.carbonIntensity;
for (let i = 0; i < 6; i++) {
  state.currentMonth++;
  updateNuclearWinter(state);
  updatePowerGeneration(state, rng);
}

console.log(`\nAfter 6 months:`);
console.log(`  Soot: ${state.nuclearWinterState.currentSoot.toFixed(0)} Tg`);
console.log(`  Sunlight blocked: ${(state.nuclearWinterState.sunlightBlocked * 100).toFixed(0)}%`);
console.log(`  Carbon intensity: ${state.powerGenerationSystem.carbonIntensity.toFixed(0)} gCO2e/kWh`);

// Validation checks
console.log('\n=== VALIDATION ===');
let passed = 0;
let failed = 0;

// Check 1: Sunlight blocking is non-zero after trigger
const initialBlocking = 0.925; // 150 Tg → ~92.5%
if (state.nuclearWinterState.sunlightBlocked > 0.50) {
  console.log(`✅ Sunlight blocking active (${(state.nuclearWinterState.sunlightBlocked * 100).toFixed(0)}%)`);
  passed++;
} else {
  console.log(`❌ Sunlight blocking too low (${(state.nuclearWinterState.sunlightBlocked * 100).toFixed(0)}%)`);
  failed++;
}

// Check 2: Carbon intensity increased initially (more fossil backup)
if (initialCarbonIntensity > 142.5) {
  console.log(`✅ Carbon intensity increased initially (${initialCarbonIntensity.toFixed(0)} > 142.5 baseline)`);
  passed++;
} else {
  console.log(`❌ Carbon intensity not increased (${initialCarbonIntensity.toFixed(0)} ≤ 142.5 baseline)`);
  failed++;
}

// Check 3: Sunlight blocking is a valid probability [0, 1]
if (state.nuclearWinterState.sunlightBlocked >= 0 && state.nuclearWinterState.sunlightBlocked <= 1) {
  console.log(`✅ Sunlight blocking in valid range [0, 1]`);
  passed++;
} else {
  console.log(`❌ Sunlight blocking out of range: ${state.nuclearWinterState.sunlightBlocked}`);
  failed++;
}

// Check 4: Sunlight blocking decays over time
if (state.nuclearWinterState.sunlightBlocked < initialBlocking) {
  console.log(`✅ Sunlight blocking decays over time (recovery working)`);
  passed++;
} else {
  console.log(`❌ Sunlight blocking not decaying: ${(state.nuclearWinterState.sunlightBlocked * 100).toFixed(0)}% vs ${(initialBlocking * 100).toFixed(0)}%`);
  failed++;
}

console.log(`\n=== RESULTS: ${passed}/${passed + failed} checks passed ===`);

if (failed > 0) {
  process.exit(1);
}

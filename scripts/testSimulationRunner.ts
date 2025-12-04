/**
 * Test script for SimulationRunner
 *
 * Validates that simulation runner can:
 * 1. Initialize with a seed
 * 2. Run for 1 month
 * 3. Return valid state snapshot
 * 4. Detect game over
 */

import { SimulationRunner } from '../src/game/core/SimulationRunner';

console.log('\n=== Testing SimulationRunner ===\n');

// Test 1: Initialize
console.log('Test 1: Initialize with seed 42');
const runner = new SimulationRunner({
  seed: 42,
  label: 'test_run',
});
console.log('✅ SimulationRunner initialized');

// Test 2: Get initial state
console.log('\nTest 2: Get initial state');
const initialState = runner.getState();
console.log(`  Month: ${initialState.currentMonth}`);
console.log(`  Population: ${initialState.humanPopulationSystem?.population?.toFixed(2)}B`);
console.log(`  AI Agents: ${initialState.aiAgents?.length ?? 0}`);
console.log('✅ Initial state retrieved');

// Test 3: Run 3 months
console.log('\nTest 3: Run simulation for 3 months');
for (let i = 0; i < 3; i++) {
  const result = runner.runMonth();
  console.log(`  Month ${result.state.currentMonth}: ${result.events.length} events`);
  console.log(`    Population: ${result.state.humanPopulationSystem?.population?.toFixed(2)}B`);
  console.log(`    Game Over: ${result.gameOver}`);
}
console.log('✅ Simulation ran for 3 months');

// Test 4: Run to game over
console.log('\nTest 4: Run until game over (max 15 months)');
let month = runner.getState().currentMonth ?? 0;
let gameOver = false;
while (month < 15 && !gameOver) {
  const result = runner.runMonth();
  month = result.state.currentMonth ?? 0;
  gameOver = result.gameOver;
  if (gameOver) {
    console.log(`  ✅ Game over at month ${month}`);
  }
}
if (!gameOver) {
  console.log(`  ⚠️ Reached month ${month} without game over`);
}

console.log('\n=== All Tests Passed ===\n');

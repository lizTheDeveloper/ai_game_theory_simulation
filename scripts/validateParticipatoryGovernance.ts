/**
 * Validate Participatory Governance Mechanic Implementation
 *
 * Tests:
 * 1. Backfire condition (governance quality < 0.4 → +15% resentment)
 * 2. Success condition (governance quality >= 0.4 → -5% resentment)
 * 3. No NaN or Infinity values
 * 4. Resentment stays in [0, 1] bounds
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { calculateRecoveryContext, applyResentmentRecovery } from '../src/simulation/resentmentRecovery';
import type { GameState } from '../src/types/game';

console.log('=== Participatory Governance Mechanic Validation ===\n');

// Simple RNG for testing
const rng = () => Math.random();

// Test 1: Backfire condition (low governance quality)
console.log('TEST 1: Backfire condition (governance quality < 0.4)');
const state1: GameState = createDefaultInitialState();
state1.government.governanceQuality = {
  decisionQuality: 0.2, // Low quality
  transparency: 0.3,
  participationRate: 0.3,
  institutionalCapacity: 0.5,
  consensusBuildingEfficiency: 0.4,
  minorityProtectionStrength: 0.4
};

// Set some AI agents with resentment
state1.aiAgents.forEach((agent, idx) => {
  if (idx < 3) {
    agent.resentment = 0.5; // Start at 50% resentment
  }
});

const context1 = calculateRecoveryContext(state1);
console.log(`  Governance quality: ${((state1.government.governanceQuality.decisionQuality + state1.government.governanceQuality.participationRate) / 2).toFixed(3)}`);
console.log(`  Participatory effect: ${context1.participatoryGovernanceEffect.toFixed(3)}`);
console.log(`  Backfired: ${context1.participatoryBackfired}`);
console.log(`  Expected: backfired=true, effect=+0.15`);

const result1 = applyResentmentRecovery(state1, context1, rng);
console.log(`  Result: ${result1.agentsRecovered} agents processed`);

// Check resentment increased (backfire)
const agent1Resentment = state1.aiAgents[0].resentment;
if (agent1Resentment !== undefined && agent1Resentment > 0.5) {
  console.log(`  ✅ PASS: Resentment increased (${agent1Resentment.toFixed(3)} > 0.50)`);
} else {
  console.log(`  ❌ FAIL: Resentment should have increased (got ${agent1Resentment})`);
}
console.log('');

// Test 2: Success condition (high governance quality)
console.log('TEST 2: Success condition (governance quality >= 0.4)');
const state2: GameState = createDefaultInitialState();
state2.government.governanceQuality = {
  decisionQuality: 0.7, // High quality
  transparency: 0.6,
  participationRate: 0.8,
  institutionalCapacity: 0.7,
  consensusBuildingEfficiency: 0.6,
  minorityProtectionStrength: 0.6
};

// Set some AI agents with resentment
state2.aiAgents.forEach((agent, idx) => {
  if (idx < 3) {
    agent.resentment = 0.5; // Start at 50% resentment
  }
});

const context2 = calculateRecoveryContext(state2);
console.log(`  Governance quality: ${((state2.government.governanceQuality.decisionQuality + state2.government.governanceQuality.participationRate) / 2).toFixed(3)}`);
console.log(`  Participatory effect: ${context2.participatoryGovernanceEffect.toFixed(3)}`);
console.log(`  Backfired: ${context2.participatoryBackfired}`);
console.log(`  Expected: backfired=false, effect=-0.05`);

const result2 = applyResentmentRecovery(state2, context2, rng);
console.log(`  Result: ${result2.agentsRecovered} agents processed`);

// Check resentment decreased (success)
const agent2Resentment = state2.aiAgents[0].resentment;
if (agent2Resentment !== undefined && agent2Resentment < 0.5) {
  console.log(`  ✅ PASS: Resentment decreased (${agent2Resentment.toFixed(3)} < 0.50)`);
} else {
  console.log(`  ❌ FAIL: Resentment should have decreased (got ${agent2Resentment})`);
}
console.log('');

// Test 3: No NaN or Infinity values
console.log('TEST 3: No NaN or Infinity values');
let hasNaN = false;
let hasInfinity = false;

state1.aiAgents.forEach(agent => {
  if (agent.resentment !== undefined && isNaN(agent.resentment)) {
    console.log(`  ❌ FAIL: Agent ${agent.id} has NaN resentment`);
    hasNaN = true;
  }
  if (agent.resentment !== undefined && !isFinite(agent.resentment)) {
    console.log(`  ❌ FAIL: Agent ${agent.id} has Infinity resentment`);
    hasInfinity = true;
  }
});

state2.aiAgents.forEach(agent => {
  if (agent.resentment !== undefined && isNaN(agent.resentment)) {
    console.log(`  ❌ FAIL: Agent ${agent.id} has NaN resentment`);
    hasNaN = true;
  }
  if (agent.resentment !== undefined && !isFinite(agent.resentment)) {
    console.log(`  ❌ FAIL: Agent ${agent.id} has Infinity resentment`);
    hasInfinity = true;
  }
});

if (!hasNaN && !hasInfinity) {
  console.log(`  ✅ PASS: All resentment values are finite`);
}
console.log('');

// Test 4: Resentment stays in [0, 1] bounds
console.log('TEST 4: Resentment bounds [0, 1]');
let outOfBounds = false;

[state1, state2].forEach((state, idx) => {
  state.aiAgents.forEach(agent => {
    if (agent.resentment !== undefined && (agent.resentment < 0 || agent.resentment > 1)) {
      console.log(`  ❌ FAIL: Agent ${agent.id} in state ${idx + 1} has out-of-bounds resentment: ${agent.resentment}`);
      outOfBounds = true;
    }
  });
});

if (!outOfBounds) {
  console.log(`  ✅ PASS: All resentment values in [0, 1]`);
}
console.log('');

console.log('=== Validation Complete ===');

#!/usr/bin/env npx tsx
/**
 * Bug #4 Validation: Capability Floor/Frontier Tracking
 *
 * Validates that:
 * 1. Initial AIs honor targetCapability parameter (scaled profiles)
 * 2. Frontier is initialized from starting AI population
 * 3. Floor diffuses toward frontier over time
 * 4. Values are non-zero in Monte Carlo output
 */

import { createDefaultInitialState } from '../src/simulation/initialization';
import { calculateTotalCapabilityFromProfile } from '../src/simulation/capabilities';
import { diffuseCapabilities } from '../src/simulation/technologyDiffusion';

console.log('=== Bug #4 Validation: Capability Floor/Frontier ===\n');

// Test 1: Initial AI capability scaling
console.log('Test 1: targetCapability parameter honored');
const state = createDefaultInitialState();

const firstAI = state.aiAgents[0];
const actualCapability = calculateTotalCapabilityFromProfile(firstAI.capabilityProfile);
console.log(`  First AI (corporate_0):`);
console.log(`    Target capability: 0.05`);
console.log(`    Actual capability: ${actualCapability.toFixed(4)}`);
console.log(`    Match: ${Math.abs(actualCapability - 0.05) < 0.01 ? '✅ YES' : '❌ NO'}`);

// Test 2: Frontier initialized
console.log('\nTest 2: Frontier initialized from starting AIs');
const frontierTotal = calculateTotalCapabilityFromProfile(state.ecosystem.frontierCapabilities);
console.log(`  Frontier total capability: ${frontierTotal.toFixed(4)}`);
console.log(`  Non-zero: ${frontierTotal > 0 ? '✅ YES' : '❌ NO'}`);

// Test 3: Floor starts at zero (will diffuse toward frontier)
console.log('\nTest 3: Floor starts at zero (ready to diffuse)');
const initialFloorTotal = calculateTotalCapabilityFromProfile(state.ecosystem.capabilityFloor);
console.log(`  Initial floor total capability: ${initialFloorTotal.toFixed(4)}`);
console.log(`  Zero: ${initialFloorTotal === 0 ? '✅ YES' : '❌ NO'}`);

// Test 4: Diffusion works (floor rises toward frontier)
console.log('\nTest 4: Diffusion mechanics');
diffuseCapabilities(state); // Run 1 month of diffusion
const afterDiffusionFloor = calculateTotalCapabilityFromProfile(state.ecosystem.capabilityFloor);
console.log(`  Floor after 1 month diffusion: ${afterDiffusionFloor.toFixed(4)}`);
console.log(`  Floor increased: ${afterDiffusionFloor > initialFloorTotal ? '✅ YES' : '❌ NO'}`);

// Test 5: Per-dimension breakdown
console.log('\nTest 5: Per-dimension breakdown');
console.log('  Frontier capabilities:');
console.log(`    Physical: ${state.ecosystem.frontierCapabilities.physical.toFixed(4)}`);
console.log(`    Digital: ${state.ecosystem.frontierCapabilities.digital.toFixed(4)}`);
console.log(`    Cognitive: ${state.ecosystem.frontierCapabilities.cognitive.toFixed(4)}`);
console.log(`    Social: ${state.ecosystem.frontierCapabilities.social.toFixed(4)}`);
console.log(`    Economic: ${state.ecosystem.frontierCapabilities.economic.toFixed(4)}`);
console.log(`    Self-improvement: ${state.ecosystem.frontierCapabilities.selfImprovement.toFixed(4)}`);

console.log('\n  Floor capabilities (after 1 month diffusion):');
console.log(`    Physical: ${state.ecosystem.capabilityFloor.physical.toFixed(4)}`);
console.log(`    Digital: ${state.ecosystem.capabilityFloor.digital.toFixed(4)}`);
console.log(`    Cognitive: ${state.ecosystem.capabilityFloor.cognitive.toFixed(4)}`);
console.log(`    Social: ${state.ecosystem.capabilityFloor.social.toFixed(4)}`);
console.log(`    Economic: ${state.ecosystem.capabilityFloor.economic.toFixed(4)}`);
console.log(`    Self-improvement: ${state.ecosystem.capabilityFloor.selfImprovement.toFixed(4)}`);

// Test 6: Variation across initial AIs
console.log('\nTest 6: Variation across initial AI population');
const capabilities = state.aiAgents.map(ai => ({
  id: ai.id,
  total: calculateTotalCapabilityFromProfile(ai.capabilityProfile)
}));
const minCap = Math.min(...capabilities.map(c => c.total));
const maxCap = Math.max(...capabilities.map(c => c.total));
console.log(`  Min capability: ${minCap.toFixed(4)} (${capabilities.find(c => c.total === minCap)?.id})`);
console.log(`  Max capability: ${maxCap.toFixed(4)} (${capabilities.find(c => c.total === maxCap)?.id})`);
console.log(`  Range: ${(maxCap - minCap).toFixed(4)}`);
console.log(`  Heterogeneous: ${maxCap > minCap * 1.5 ? '✅ YES' : '❌ NO (too similar)'}`);

console.log('\n=== Summary ===');
const allPassed =
  Math.abs(actualCapability - 0.05) < 0.01 &&
  frontierTotal > 0 &&
  initialFloorTotal === 0 &&
  afterDiffusionFloor > initialFloorTotal &&
  maxCap > minCap * 1.5;

console.log(allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');

process.exit(allPassed ? 0 : 1);

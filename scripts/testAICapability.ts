/**
 * Test AI Capability Calculation
 *
 * Diagnostic script to check why tech tree sees AI capability as 0.00
 */

const { createDefaultInitialState } = require('../src/simulation/initialization');
const { calculateTotalCapabilityFromProfile } = require('../src/simulation/capabilities');

const state = createDefaultInitialState();

console.log('\n=== AI CAPABILITY DIAGNOSTIC ===\n');
console.log(`Total AI agents: ${state.aiAgents.length}`);

const activeAIs = state.aiAgents.filter(ai => ai.lifecycleState !== 'retired');
console.log(`Active AI agents: ${activeAIs.length}`);

if (activeAIs.length > 0) {
  const firstAI = activeAIs[0];
  console.log(`\nFirst AI (${firstAI.id}):`);
  console.log(`  Lifecycle: ${firstAI.lifecycleState}`);
  console.log(`  Capability Profile:`, JSON.stringify(firstAI.capabilityProfile, null, 2));

  const totalCap = calculateTotalCapabilityFromProfile(firstAI.capabilityProfile);
  console.log(`  Total Capability: ${totalCap.toFixed(3)}`);

  // Calculate average across all active AIs
  const totalCapability = activeAIs.reduce(
    (sum, ai) => sum + calculateTotalCapabilityFromProfile(ai.capabilityProfile),
    0
  );
  const avgCapability = totalCapability / activeAIs.length;

  console.log(`\nAggregate Statistics:`);
  console.log(`  Total Capability (sum): ${totalCapability.toFixed(2)}`);
  console.log(`  Average Capability: ${avgCapability.toFixed(3)}`);
}

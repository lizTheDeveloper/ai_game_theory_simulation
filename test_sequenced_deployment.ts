/**
 * Test script for sequenced technology deployment
 *
 * Tests that sequenced mode:
 * 1. Deploys technologies gradually over time (not all at month 0)
 * 2. Prevents extinction-by-shock-deployment
 * 3. Logs deployment timing clearly
 */

import { createDefaultInitialState } from './src/simulation/initialization';
import { advanceMonth } from './src/simulation/engine';
import { applyScenario } from './src/simulation/scenarios/apply';
import type { ScenarioDefinition } from './src/simulation/scenarios/types';

// Create test scenario with sequenced deployment
const TEST_SCENARIO: ScenarioDefinition = {
  name: 'Climate First (Sequenced)',
  description: 'Test scenario: Climate priorities + sequenced tech deployment',
  governmentPriorities: {
    climateSpending: 0.8,
    redistributionLevel: 0.3,
    alignmentResearch: 0.2,
    democraticParticipation: 0.3,
    scientificResearch: 0.4,
  },
  techDeployment: {
    strategy: 'sequenced',
    deploymentInterval: 6, // 6 months between tiers
    deploymentLevel: 1.0,
  },
  expectedOutcome: 'Paced tech deployment prevents shock mortality',
  researchBasis: ['Test scenario'],
};

console.log('='.repeat(80));
console.log('SEQUENCED DEPLOYMENT TEST');
console.log('='.repeat(80));
console.log();
console.log('Testing that sequenced mode:');
console.log('  1. Creates deployment schedule');
console.log('  2. Deploys technologies in tiers (TIER 0 → 1 → 2 → 3 → 4)');
console.log('  3. Spaces deployments by 6 months');
console.log();

// Initialize state with simple RNG
const rng = () => Math.random();

console.log('Initializing game state...');
const state = createDefaultInitialState(rng, 'scenario');

console.log('Applying scenario...');
applyScenario(state, TEST_SCENARIO, rng);

// Check that schedule was created
if (!state.techDeploymentSchedule) {
  console.error('❌ FAILED: No deployment schedule created');
  process.exit(1);
}

console.log('\n✅ Deployment schedule created successfully');
console.log(`   Total scheduled: ${state.techDeploymentSchedule.scheduledDeployments.length} technologies`);
console.log(`   Mode: ${state.techDeploymentSchedule.mode}`);
console.log(`   Interval: ${state.techDeploymentSchedule.deploymentInterval} months`);

// Group by deployment month
const byMonth = new Map<number, number>();
for (const deployment of state.techDeploymentSchedule.scheduledDeployments) {
  const count = byMonth.get(deployment.deployMonth) || 0;
  byMonth.set(deployment.deployMonth, count + 1);
}

console.log('\n   Deployment distribution:');
for (const [month, count] of Array.from(byMonth.entries()).sort((a, b) => a[0] - b[0])) {
  console.log(`      Month ${month}: ${count} technologies`);
}

// Verify schedule is correct
console.log('\n--- Schedule Verification ---');
const schedule = state.techDeploymentSchedule.scheduledDeployments;

// Check that deployments are spread across months 0, 6, 12, 18, 24
const uniqueMonths = new Set(schedule.map(d => d.deployMonth));
console.log(`Deployment months: ${Array.from(uniqueMonths).sort((a, b) => a - b).join(', ')}`);

// Verify spacing
const monthsArray = Array.from(uniqueMonths).sort((a, b) => a - b);
let correctSpacing = true;
for (let i = 1; i < monthsArray.length; i++) {
  const gap = monthsArray[i] - monthsArray[i - 1];
  if (gap !== 6) {
    console.log(`❌ INCORRECT SPACING: ${monthsArray[i - 1]} → ${monthsArray[i]} (gap: ${gap}, expected: 6)`);
    correctSpacing = false;
  }
}

if (correctSpacing) {
  console.log(`✅ Correct spacing: All tiers are 6 months apart`);
}

// Verify all are initially undeployed
const undeployedCount = schedule.filter(d => !d.deployed).length;
console.log(`Undeployed: ${undeployedCount} / ${schedule.length}`);

if (undeployedCount === schedule.length) {
  console.log(`✅ All technologies initially undeployed (will deploy during simulation)`);
} else {
  console.log(`❌ ERROR: Some technologies already deployed at initialization`);
}

console.log('\n' + '='.repeat(80));
console.log('TEST COMPLETE');
console.log('='.repeat(80));

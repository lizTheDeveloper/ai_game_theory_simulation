/**
 * Simple test for ClimateDeploymentDelayPhase
 *
 * Validates three-delay model effectiveness at different time points.
 */

import { ClimateDeploymentDelayPhase } from '../src/simulation/engine/phases/ClimateDeploymentDelayPhase';
import type { GameState } from '../src/types/game';

// Create minimal game state for testing
const createTestState = (currentMonth: number): Partial<GameState> => ({
  currentMonth,
  techTreeState: {
    unlockedTech: ['direct_air_capture', 'sai', 'heat_pumps', 'beccs'],
    researchProgress: {},
    regionalDeployment: {
      'global': [
        { techId: 'direct_air_capture', region: 'global', deploymentLevel: 0.1, monthlyInvestment: 100, totalInvested: 1000, deployedBy: ['test'], effects: {} },
        { techId: 'sai', region: 'global', deploymentLevel: 0.1, monthlyInvestment: 50, totalInvested: 500, deployedBy: ['test'], effects: {} },
        { techId: 'heat_pumps', region: 'global', deploymentLevel: 0.1, monthlyInvestment: 20, totalInvested: 200, deployedBy: ['test'], effects: {} },
        { techId: 'beccs', region: 'global', deploymentLevel: 0.1, monthlyInvestment: 80, totalInvested: 800, deployedBy: ['test'], effects: {} }
      ]
    },
    deploymentAcceleration: {},
    pendingActions: [],
    unlockHistory: [],
    totalInvestment: 2500,
    techUnlockedCount: 4,
    techDeployedCount: 4
  },
  climateDeploymentTracking: undefined
});

// Simple RNG function
const rng = () => Math.random();

// Create phase instance
const phase = new ClimateDeploymentDelayPhase();

console.log('\n=== Climate Deployment Delay Phase Test ===\n');

// Create single state and advance through time
const state = createTestState(0) as GameState;

// Initialize at month 0
phase.execute(state, rng);

// Test at different time points
const testPoints = [
  { months: 0, years: 0, desc: 'Initial deployment' },
  { months: 36, years: 3, desc: '3 years (fast techs starting to activate)' },
  { months: 60, years: 5, desc: '5 years (god mode validation point)' },
  { months: 120, years: 10, desc: '10 years (medium techs scaling)' },
  { months: 360, years: 30, desc: '30 years (slow techs reaching maturity)' }
];

for (const point of testPoints) {
  // Advance time
  state.currentMonth = point.months;

  // Execute phase
  phase.execute(state, rng);

  const tracking = state.climateDeploymentTracking;
  if (!tracking) {
    console.log(`   ❌ FAILED: No tracking initialized at ${point.desc}`);
    continue;
  }

  console.log(`\n📊 ${point.desc.toUpperCase()} (Month ${point.months}):`);
  console.log(`   Deployments tracked: ${Object.keys(tracking.deployments).length}`);
  console.log(`   Total effectiveness: ${(tracking.totalClimateEffectiveness * 100).toFixed(2)}%`);
  console.log(`   CO2 removal rate: ${tracking.CO2RemovalRate.toFixed(3)} Gt/year`);
  console.log(`   Temperature offset: ${tracking.temperatureOffset.toFixed(3)}°C`);

  // Show individual tech effectiveness
  for (const techId of Object.keys(tracking.deployments)) {
    const deployment = tracking.deployments[techId];
    const pct = (deployment.currentEffectiveness / deployment.maxEffectiveness * 100);
    console.log(`   - ${techId}: ${deployment.currentEffectiveness.toFixed(3)} (${pct.toFixed(1)}% of max)`);
  }
}

// Validation checks
console.log('\n=== VALIDATION CHECKS ===\n');

// Check 1: Month 60 should show ~5.5% effectiveness (god mode validation)
state.currentMonth = 60;
phase.execute(state, rng);
const effectiveness60 = (state.climateDeploymentTracking?.totalClimateEffectiveness ?? 0) * 100;

console.log(`✓ Month 60 effectiveness: ${effectiveness60.toFixed(2)}%`);
if (effectiveness60 >= 3 && effectiveness60 <= 10) {
  console.log(`  ✅ PASS: Within expected range (3-10%)`);
} else {
  console.log(`  ⚠️  WARNING: Outside expected range (3-10%)`);
}

// Check 2: Effectiveness should increase over time
const eff60 = state.climateDeploymentTracking?.totalClimateEffectiveness ?? 0;
state.currentMonth = 360;
phase.execute(state, rng);
const eff360 = state.climateDeploymentTracking?.totalClimateEffectiveness ?? 0;

console.log(`\n✓ Effectiveness progression:`);
console.log(`  Month 60: ${(eff60 * 100).toFixed(2)}%`);
console.log(`  Month 360: ${(eff360 * 100).toFixed(2)}%`);
if (eff360 > eff60) {
  console.log(`  ✅ PASS: Effectiveness increases over time`);
} else {
  console.log(`  ❌ FAIL: Effectiveness should increase`);
}

console.log('\n=== TEST COMPLETE ===\n');

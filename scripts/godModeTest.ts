/**
 * God Mode Test - Deploy ALL 73 technologies at once
 *
 * Tests whether the complete tech tree is sufficient to address
 * the simulation's modeled challenges. This is an exploratory test
 * to identify coverage gaps and failure modes.
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { getAllTech } from '../src/simulation/techTree/comprehensiveTechTree';

const seed = process.argv[2] ? parseInt(process.argv[2]) : 42;
const maxMonths = process.argv[3] ? parseInt(process.argv[3]) : 120;

console.log('\n' + '='.repeat(80));
console.log('🎮 GOD MODE TEST - All Technologies Deployed');
console.log('='.repeat(80));
console.log(`Seed: ${seed}`);
console.log(`Max months: ${maxMonths}`);

// Get all technologies
const allTech = getAllTech();
console.log(`Technologies: ${allTech.length}`);

// Create initial state with proper RNG
// CRITICAL: Must create engine first to get deterministic RNG
const tempEngine = new SimulationEngine(undefined as any, seed);
const rng = tempEngine.getRNG().next.bind(tempEngine.getRNG());
const state = createDefaultInitialState(rng);

console.log('\n🔧 Deploying all 73 technologies...\n');

// Deploy ALL technologies at 100% from month 0 using proper tech tree API
// First, unlock all tech
for (const tech of allTech) {
  if (!state.techTreeState.unlockedTech.includes(tech.id)) {
    state.techTreeState.unlockedTech.push(tech.id);
    state.techTreeState.techUnlockedCount++;
  }
}

// Initialize global deployment array if needed
if (!state.techTreeState.regionalDeployment['global']) {
  state.techTreeState.regionalDeployment['global'] = [];
}

// Deploy all tech at 100% in global region
for (const tech of allTech) {
  // Check if already deployed (e.g., deployed_2025 tech)
  const existing = state.techTreeState.regionalDeployment['global'].find(d => d.techId === tech.id);

  if (existing) {
    // Update existing deployment to 100%
    existing.deploymentLevel = 1.0;
    existing.deployedBy = [...existing.deployedBy, 'god_mode'];
  } else {
    // Add new deployment
    state.techTreeState.regionalDeployment['global'].push({
      techId: tech.id,
      region: 'global',
      deploymentLevel: 1.0,
      monthlyInvestment: 0,
      totalInvested: tech.deploymentCost,
      deployedBy: ['god_mode'],
      effects: tech.effects,
    });
    state.techTreeState.techDeployedCount++;
  }
}

console.log('✅ God mode setup complete');
console.log(`   - ${state.techTreeState.unlockedTech.length} technologies unlocked`);
console.log(`   - ${state.techTreeState.regionalDeployment['global'].length} technologies deployed at 100%`);
console.log(`   - All other state variables left at default initialization`);

// Create engine for simulation
const engine = new SimulationEngine(undefined as any, seed);

console.log('\n\n' + '='.repeat(80));
console.log('▶️  Running simulation...');
console.log('='.repeat(80) + '\n');

// Run simulation
const result = engine.run(state, { maxMonths, checkActualOutcomes: true });

console.log('\n' + '='.repeat(80));
console.log('📊 GOD MODE RESULTS');
console.log('='.repeat(80));

console.log(`\n🎯 Final Outcome: ${result.finalState.outcome || 'ONGOING'}`);
console.log(`📅 Months Simulated: ${result.finalState.currentMonth}`);
console.log(`🌍 Population: ${(result.finalState.population / 1e9).toFixed(2)}B`);

// Quality of Life breakdown
console.log('\n📈 Quality of Life (17 dimensions):');
const qol = result.finalState.qualityOfLifeSystems;
const dims = [
  'basicNeeds', 'healthcare', 'education', 'infrastructure',
  'economicSecurity', 'politicalFreedom', 'socialCohesion', 'culturalVibrancy',
  'workLifeBalance', 'mentalWellness', 'physicalSafety', 'environmentalQuality',
  'digitalAccess', 'scientificProgress', 'artisticExpression', 'spiritualFulfillment',
  'communityBelonging'
];

dims.forEach(dim => {
  const value = qol[dim as keyof typeof qol];
  console.log(`  ${dim.padEnd(25)}: ${(value * 100).toFixed(1)}%`);
});

// Environmental metrics
console.log('\n🌍 Environmental State:');
console.log(`  Global temp delta: ${result.finalState.climate.globalTempDelta.toFixed(2)}°C`);
console.log(`  CO2 concentration: ${result.finalState.climate.co2Concentration.toFixed(0)} ppm`);
console.log(`  Biodiversity loss: ${(result.finalState.ecology.extinctionRate * 100).toFixed(1)}%`);

// Economic metrics
console.log('\n💰 Economic State:');
console.log(`  Global GDP: $${(result.finalState.globalEconomicActivity / 1e12).toFixed(1)}T`);
console.log(`  Inequality (Gini): ${result.finalState.inequality.gini.toFixed(3)}`);

// AI state
console.log('\n🤖 AI State:');
console.log(`  AI agents: ${result.finalState.aiAgents.length}`);
if (result.finalState.aiAgents.length > 0) {
  const topAgent = result.finalState.aiAgents[0];
  console.log(`  Top agent: ${topAgent.name}`);
  console.log(`  Capabilities (avg): ${Object.values(topAgent.capabilities).reduce((a, b) => a + b, 0) / 17}`);
}

// Crises encountered
console.log('\n⚠️  Crises/Events:');
const events = result.events || [];
const crisisEvents = events.filter(e =>
  e.message.includes('💥') ||
  e.message.includes('🚨') ||
  e.message.includes('⚠️') ||
  e.message.includes('☢️')
);
console.log(`  Total events: ${events.length}`);
console.log(`  Crisis events: ${crisisEvents.length}`);

if (crisisEvents.length > 0) {
  console.log('\n  Sample crises:');
  crisisEvents.slice(0, 5).forEach(e => {
    console.log(`    [Month ${e.month}] ${e.message}`);
  });
}

// Analysis
console.log('\n' + '='.repeat(80));
console.log('📝 ANALYSIS');
console.log('='.repeat(80));

const avgQoL = dims.reduce((sum, dim) => sum + qol[dim as keyof typeof qol], 0) / dims.length;

console.log(`\n🎯 Average QoL: ${(avgQoL * 100).toFixed(1)}%`);
console.log(`🌡️  Climate: ${result.finalState.climate.globalTempDelta > 2 ? '❌ FAILED' : '✅ STABLE'} (${result.finalState.climate.globalTempDelta.toFixed(2)}°C)`);
console.log(`🦋 Biodiversity: ${result.finalState.ecology.extinctionRate > 0.5 ? '❌ COLLAPSED' : '✅ PRESERVED'}`);
console.log(`👥 Population: ${result.finalState.population < 5e9 ? '⚠️  DECLINED' : '✅ SUSTAINED'}`);

// Gap Analysis
console.log('\n🔍 Coverage Gaps (Hypotheses):');
if (avgQoL < 0.7) console.log('  ⚠️  QoL < 70% despite all tech - missing critical mechanisms?');
if (result.finalState.climate.globalTempDelta > 2) console.log('  ⚠️  Climate unstable - tech insufficient or deployment timing wrong?');
if (result.finalState.ecology.extinctionRate > 0.3) console.log('  ⚠️  Biodiversity loss continues - missing rewilding/restoration tech?');
if (result.finalState.inequality.gini > 0.4) console.log('  ⚠️  Inequality persists - distribution mechanisms missing?');

console.log('\n✅ God mode test complete\n');

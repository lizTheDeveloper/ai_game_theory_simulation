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
import { logSpiralActivationDiagnostics } from '../src/simulation/upwardSpirals';
import { logCooperativeSpiralDiagnostics } from '../src/simulation/cooperativeSpirals';
import { logPositiveTippingPointDiagnostics } from '../src/simulation/positiveTippingPoints';

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

// Run simulation with periodic diagnostics
const diagnosticInterval = 12; // Log every 12 months

let month = 0;
while (month < maxMonths) {
  // Step simulation forward one month
  engine.step(state);
  month = state.currentMonth;

  // Log diagnostics every 12 months
  if (month % diagnosticInterval === 0 && month > 0) {
    console.log(`\n\n${'='.repeat(80)}`);
    console.log(`DIAGNOSTIC CHECKPOINT: Month ${month} (Year ${Math.floor(month / 12)})`);
    console.log('='.repeat(80));

    // Call all diagnostic functions
    logSpiralActivationDiagnostics(state, month);
    logCooperativeSpiralDiagnostics(state);
    logPositiveTippingPointDiagnostics(state);
  }

  // Check for early termination (extinction, game over)
  if (state.outcome) {
    console.log(`\n🚨 Simulation ended early at month ${month}: ${state.outcome}`);
    break;
  }
}

// Wrap final state in result object for compatibility with existing code
const result = {
  finalState: state,
  monthsSimulated: month,
  outcome: state.outcome,
  events: [] as any[], // Not tracked in step-by-step mode
};

<<<<<<< HEAD
=======
// Run simulation (sandbox mode - disable outcome detection to measure full 120-month trajectories)
// God mode deploys all 71 techs at once, which would trigger immediate utopia/dystopia without this.
// We need the full duration to validate boundary effectiveness over time.
const result = engine.run(state, { maxMonths, checkActualOutcomes: false });

>>>>>>> origin/auto/worker-20251116_040001
console.log('\n' + '='.repeat(80));
console.log('📊 GOD MODE RESULTS');
console.log('='.repeat(80));

// Check if game ended early
if (!result.finalState) {
  console.log('\n🚨 GAME OVER - Simulation ended early');
  console.log(`📅 Months Simulated: ${result.monthsSimulated || 'unknown'}`);
  console.log(`💀 Outcome: ${result.outcome || 'CATASTROPHIC FAILURE'}`);
  console.log(`\nReason: Game ended before ${maxMonths} months - likely extinction or total collapse`);
  console.log('\n❌ God mode test FAILED - even with all tech, simulation ended catastrophically\n');
  process.exit(1);
}

console.log(`\n🎯 Final Outcome: ${result.finalState.outcome || 'ONGOING'}`);
console.log(`📅 Months Simulated: ${result.finalState.currentMonth}`);

// FIX (Nov 9, 2025): Read from correct location (humanPopulationSystem.population)
// Bug was: old code read result.finalState.population which is undefined
// Dividing undefined / 1e9 = NaN
const populationValue = result.finalState.humanPopulationSystem?.population ?? 0;
console.log(`🌍 Population: ${isNaN(populationValue) ? '❌ NaN' : populationValue.toFixed(2)}B`);

// Quality of Life breakdown (NEW: Tiered structure)
console.log('\n📈 Quality of Life Systems:');
const qol = result.finalState.qualityOfLifeSystems;

console.log('\n  🆘 Tier 0 - Survival Fundamentals:');
console.log(`    Food security:         ${(qol.survivalFundamentals.foodSecurity * 100).toFixed(1)}%`);
console.log(`    Water security:        ${(qol.survivalFundamentals.waterSecurity * 100).toFixed(1)}%`);
console.log(`    Thermal habitability:  ${(qol.survivalFundamentals.thermalHabitability * 100).toFixed(1)}%`);
console.log(`    Shelter security:      ${(qol.survivalFundamentals.shelterSecurity * 100).toFixed(1)}%`);

console.log('\n  📦 Tier 1 - Basic Needs:');
console.log(`    Material abundance:    ${(qol.materialAbundance * 100).toFixed(1)}%`);
console.log(`    Energy availability:   ${(qol.energyAvailability * 100).toFixed(1)}%`);
console.log(`    Physical safety:       ${(qol.physicalSafety * 100).toFixed(1)}%`);

console.log('\n  🧠 Tier 2 - Psychological Needs:');
console.log(`    Mental health:         ${(qol.mentalHealth * 100).toFixed(1)}%`);
console.log(`    Meaning & purpose:     ${(qol.meaningAndPurpose * 100).toFixed(1)}%`);
console.log(`    Social connection:     ${(qol.socialConnection * 100).toFixed(1)}%`);
console.log(`    Autonomy:              ${(qol.autonomy * 100).toFixed(1)}%`);

console.log('\n  🤝 Tier 3 - Social Needs:');
console.log(`    Political freedom:     ${(qol.politicalFreedom * 100).toFixed(1)}%`);
console.log(`    Information integrity: ${(qol.informationIntegrity * 100).toFixed(1)}%`);
console.log(`    Community strength:    ${(qol.communityStrength * 100).toFixed(1)}%`);
console.log(`    Cultural vitality:     ${(qol.culturalVitality * 100).toFixed(1)}%`);

console.log('\n  🏥 Tier 4 - Health & Longevity:');
console.log(`    Healthcare quality:    ${(qol.healthcareQuality * 100).toFixed(1)}%`);
console.log(`    Longevity gains:       ${(qol.longevityGains * 100).toFixed(1)}%`);
console.log(`    Diseases burden:       ${(qol.diseasesBurden * 100).toFixed(1)}%`);

console.log('\n  🌿 Tier 5 - Environmental:');
console.log(`    Ecosystem health:      ${(qol.ecosystemHealth * 100).toFixed(1)}%`);
console.log(`    Climate stability:     ${(qol.climateStability * 100).toFixed(1)}%`);
console.log(`    Pollution level:       ${(qol.pollutionLevel * 100).toFixed(1)}%`);

// Environmental metrics
console.log('\n🌍 Environmental State:');
if (result.finalState.climate && result.finalState.ecology) {
  console.log(`  Global temp delta: ${result.finalState.climate.globalTempDelta.toFixed(2)}°C`);
  console.log(`  CO2 concentration: ${result.finalState.climate.co2Concentration.toFixed(0)} ppm`);
  console.log(`  Biodiversity loss: ${(result.finalState.ecology.extinctionRate * 100).toFixed(1)}%`);
} else {
  console.log(`  ⚠️  Environmental data corrupted or undefined`);
}

// Economic metrics
console.log('\n💰 Economic State:');
console.log(`  Global GDP: $${(result.finalState.globalEconomicActivity / 1e12).toFixed(1)}T`);
if (result.finalState.inequality) {
  console.log(`  Inequality (Gini): ${result.finalState.inequality.gini.toFixed(3)}`);
} else {
  console.log(`  Inequality (Gini): undefined`);
}

// AI state
console.log('\n🤖 AI State:');
console.log(`  AI agents: ${result.finalState.aiAgents.length}`);
if (result.finalState.aiAgents.length > 0) {
  const topAgent = result.finalState.aiAgents[0];
  console.log(`  Top agent: ${topAgent.name}`);
  // FIX (Nov 9, 2025): Guard against undefined capabilities
  if (topAgent.capabilities && typeof topAgent.capabilities === 'object') {
    const avgCap = Object.values(topAgent.capabilities).reduce((a, b) => a + b, 0) / 17;
    console.log(`  Capabilities (avg): ${avgCap.toFixed(2)}`);
  } else {
    console.log(`  Capabilities: ❌ UNDEFINED`);
  }
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

// Planetary Boundaries - Initial vs Final State
console.log('\n🌐 Planetary Boundaries - Initial State Check:');
console.log(`  NOTE: Simulation starts in 2025 - some boundaries already crossed`);
if (state.climate && state.ecology) {
  console.log(`  Climate (initial): ${state.climate.globalTempDelta.toFixed(2)}°C above pre-industrial`);
  console.log(`  Biodiversity (initial): ${(state.ecology.extinctionRate * 100).toFixed(1)}% extinction rate`);
  console.log(`  CO2 (initial): ${state.climate.co2Concentration.toFixed(0)} ppm`);
}

// Analysis
console.log('\n' + '='.repeat(80));
console.log('📝 ANALYSIS');
console.log('='.repeat(80));

// Calculate average QoL from all tiers
const survivalAvg = (qol.survivalFundamentals.foodSecurity + qol.survivalFundamentals.waterSecurity +
                     qol.survivalFundamentals.thermalHabitability + qol.survivalFundamentals.shelterSecurity) / 4;
const tier1Avg = (qol.materialAbundance + qol.energyAvailability + qol.physicalSafety) / 3;
const tier2Avg = (qol.mentalHealth + qol.meaningAndPurpose + qol.socialConnection + qol.autonomy) / 4;
const tier3Avg = (qol.politicalFreedom + qol.informationIntegrity + qol.communityStrength + qol.culturalVitality) / 4;
const tier4Avg = (qol.healthcareQuality + qol.longevityGains + qol.diseasesBurden) / 3;
const tier5Avg = (qol.ecosystemHealth + qol.climateStability + qol.pollutionLevel) / 3;
const overallAvg = (survivalAvg + tier1Avg + tier2Avg + tier3Avg + tier4Avg + tier5Avg) / 6;

console.log(`\n🎯 QoL by Tier:`);
console.log(`  Survival (Tier 0):     ${(survivalAvg * 100).toFixed(1)}%`);
console.log(`  Basic Needs (Tier 1):  ${(tier1Avg * 100).toFixed(1)}%`);
console.log(`  Psychological (Tier 2):${(tier2Avg * 100).toFixed(1)}%`);
console.log(`  Social (Tier 3):       ${(tier3Avg * 100).toFixed(1)}%`);
console.log(`  Health (Tier 4):       ${(tier4Avg * 100).toFixed(1)}%`);
console.log(`  Environmental (Tier 5):${(tier5Avg * 100).toFixed(1)}%`);
console.log(`  OVERALL AVERAGE:       ${(overallAvg * 100).toFixed(1)}%`);

if (result.finalState.climate && state.climate) {
  console.log(`\n🌡️  Climate: ${result.finalState.climate.globalTempDelta > 2 ? '❌ FAILED' : '✅ STABLE'} (${result.finalState.climate.globalTempDelta.toFixed(2)}°C, Δ = +${(result.finalState.climate.globalTempDelta - state.climate.globalTempDelta).toFixed(2)}°C)`);
}
if (result.finalState.ecology && state.ecology) {
  console.log(`🦋 Biodiversity: ${result.finalState.ecology.extinctionRate > 0.5 ? '❌ COLLAPSED' : '✅ PRESERVED'} (${(result.finalState.ecology.extinctionRate * 100).toFixed(1)}%, Δ = +${((result.finalState.ecology.extinctionRate - state.ecology.extinctionRate) * 100).toFixed(1)}%)`);
}
// FIX (Nov 9, 2025): Use correct population source
const finalPop = result.finalState.humanPopulationSystem?.population ?? 0;
console.log(`👥 Population: ${isNaN(finalPop) ? '💀 NaN (CRASHED)' : finalPop < 5 ? '⚠️  DECLINED' : '✅ SUSTAINED'} (${isNaN(finalPop) ? 'NaN' : finalPop.toFixed(2)}B)`);

// Gap Analysis
console.log('\n🔍 Coverage Gaps (Hypotheses):');
// FIX (Nov 9, 2025): Use correct population source
const popForCheck = result.finalState.humanPopulationSystem?.population ?? 0;
if (isNaN(popForCheck)) console.log(`  🚨 CRITICAL: Population = NaN - simulation experienced catastrophic failure`);
if (survivalAvg < 0.9) console.log(`  ⚠️  Survival fundamentals at ${(survivalAvg * 100).toFixed(1)}% - critical gaps in food/water/shelter/thermal safety`);
if (overallAvg < 0.7) console.log(`  ⚠️  Overall QoL ${(overallAvg * 100).toFixed(1)}% despite all tech - missing critical mechanisms?`);
if (result.finalState.climate && state.climate && result.finalState.climate.globalTempDelta > state.climate.globalTempDelta + 0.5) console.log(`  ⚠️  Climate WORSENED by +${(result.finalState.climate.globalTempDelta - state.climate.globalTempDelta).toFixed(2)}°C - tech deployed too late or insufficient?`);
if (result.finalState.ecology && state.ecology && result.finalState.ecology.extinctionRate > state.ecology.extinctionRate + 0.1) console.log(`  ⚠️  Biodiversity loss ACCELERATED by +${((result.finalState.ecology.extinctionRate - state.ecology.extinctionRate) * 100).toFixed(1)}% - missing rewilding/restoration tech?`);
if (result.finalState.inequality && result.finalState.inequality.gini > 0.4) console.log(`  ⚠️  Inequality persists (${result.finalState.inequality.gini.toFixed(3)}) - distribution mechanisms missing?`);

// SPIRAL ACTIVATION SUMMARY
console.log('\n' + '='.repeat(80));
console.log('🔍 SPIRAL ACTIVATION SUMMARY');
console.log('='.repeat(80));

// Summarize which spirals activated and when
const spirals = result.finalState.upwardSpirals;
const spiralNames = [
  { key: 'abundance', name: 'Abundance' },
  { key: 'cognitive', name: 'Cognitive' },
  { key: 'democratic', name: 'Democratic' },
  { key: 'scientific', name: 'Scientific' },
  { key: 'meaning', name: 'Meaning' },
  { key: 'ecological', name: 'Ecological' }
] as const;

spiralNames.forEach(({ key, name }) => {
  const spiral = spirals[key];
  if (spiral.monthsActive === 0 && spiral.lastActivatedMonth === -1) {
    console.log(`  ❌ ${name} spiral: NEVER activated`);
  } else if (spiral.active) {
    console.log(`  ✅ ${name} spiral: ACTIVE (${spiral.monthsActive} months, last activated: month ${spiral.lastActivatedMonth})`);
  } else {
    console.log(`  ⚠️  ${name} spiral: Activated briefly (last active: month ${spiral.lastActivatedMonth}, deactivated: month ${spiral.lastDeactivatedMonth})`);
  }
});

console.log(`\n  Virtuous cascade: ${spirals.cascadeActive ? '✅ ACTIVE' : spirals.cascadeMonths > 0 ? '⚠️  WAS ACTIVE (ended)' : '❌ NEVER ACTIVATED'}`);
if (spirals.cascadeMonths > 0) {
  console.log(`    Total cascade duration: ${spirals.cascadeMonths} months`);
}

const trustCascades = result.finalState.history.cooperativeSpirals || [];
console.log(`\n  Trust cascades: ${trustCascades.length} triggered`);
if (trustCascades.length > 0) {
  trustCascades.forEach(c => {
    console.log(`    Month ${c.month}: ${c.type} (+${(c.trustBoost * 100).toFixed(0)}% trust)`);
  });
}

const techCascades = result.finalState.positiveTippingPoints.activeCascades;
console.log(`\n  Tech cascades: ${techCascades} currently active`);
console.log(`    Total triggered: ${result.finalState.positiveTippingPoints.triggeredCascades.length}`);
if (result.finalState.positiveTippingPoints.triggeredCascades.length > 0) {
  result.finalState.positiveTippingPoints.triggeredCascades.forEach(c => {
    console.log(`    Month ${c.triggeredMonth}: ${c.type} (reason: ${c.triggerReason})`);
  });
}

console.log('\n✅ God mode test complete\n');

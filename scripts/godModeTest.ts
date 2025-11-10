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

// Spiral System Status (Added Nov 10, 2025 - Scenario Analysis Framework Phase 1)
console.log('\n📊 SPIRAL SYSTEM STATUS:');
console.log(`\n  🔄 Upward Spirals:`);
const spirals = result.finalState.upwardSpirals;
for (const [name, spiral] of Object.entries(spirals)) {
  if (name === 'cascadeActive' || name === 'cascadeStrength' || name === 'cascadeStartMonth') continue;
  const s = spiral as any;
  if (s && typeof s === 'object' && 'active' in s) {
    const strength = s.strength !== undefined ? s.strength.toFixed(2) : 'N/A';
    const months = s.monthsActive !== undefined ? s.monthsActive : 'N/A';
    console.log(`    ${name}: ${s.active ? '✅ ACTIVE' : '❌ INACTIVE'} (strength: ${strength}, months: ${months})`);
  }
}
const cascadeStrength = spirals.cascadeStrength !== undefined ? spirals.cascadeStrength.toFixed(2) : 'N/A';
console.log(`    Cascade: ${spirals.cascadeActive ? '🌊 ACTIVE' : '❌ INACTIVE'} (strength: ${cascadeStrength})`);
if (spirals.cascadeStartMonth && spirals.cascadeStartMonth > 0) {
  console.log(`    Cascade started: Month ${spirals.cascadeStartMonth}`);
}

console.log(`\n  🤝 Cooperative Spirals:`);
if (result.finalState.history?.cooperativeSpirals) {
  console.log(`    Trust cascades triggered: ${result.finalState.history.cooperativeSpirals.length}`);
  result.finalState.history.cooperativeSpirals.forEach((cascade, i) => {
    console.log(`      [${i+1}] Month ${cascade.month}: ${cascade.type} (${cascade.triggers.join(', ')})`);
  });
} else {
  console.log(`    Trust cascades triggered: 0`);
}

console.log(`\n  💡 Positive Tipping Points:`);
const ptp = result.finalState.positiveTippingPoints;
console.log(`    Solar PV: ${(ptp.adoptionTracking.solarPV.marketShare * 100).toFixed(1)}% market share`);
console.log(`      Price parity: ${ptp.adoptionTracking.solarPV.priceParityAchieved ? 'YES' : 'NO'}, Cascade: ${ptp.adoptionTracking.solarPV.cascadeActive ? 'YES' : 'NO'}`);
console.log(`    Electric Vehicles: ${(ptp.adoptionTracking.electricVehicles.marketShare * 100).toFixed(1)}% market share`);
console.log(`      Price parity: ${ptp.adoptionTracking.electricVehicles.priceParityAchieved ? 'YES' : 'NO'}, Cascade: ${ptp.adoptionTracking.electricVehicles.cascadeActive ? 'YES' : 'NO'}`);
console.log(`    Wind Power: ${(ptp.adoptionTracking.windPower.marketShare * 100).toFixed(1)}% market share`);
console.log(`      Price parity: ${ptp.adoptionTracking.windPower.priceParityAchieved ? 'YES' : 'NO'}, Cascade: ${ptp.adoptionTracking.windPower.cascadeActive ? 'YES' : 'NO'}`);
console.log(`    Triggered cascades: ${ptp.triggeredCascades.length}`);
if (ptp.triggeredCascades.length > 0) {
  ptp.triggeredCascades.forEach(cascade => {
    console.log(`      Month ${cascade.month}: ${cascade.type} (${cascade.triggerReason}, market share: ${(cascade.marketShareAtTrigger * 100).toFixed(1)}%)`);
  });
}

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

console.log('\n🔬 Spiral Activation Diagnosis:');
if (!spirals.cascadeActive) {
  console.log(`  ⚠️  UPWARD SPIRALS: Cascade NOT ACTIVE`);
  const activeSpirals = Object.entries(spirals)
    .filter(([name, _]) => !['cascadeActive', 'cascadeStrength', 'cascadeStartMonth'].includes(name))
    .filter(([_, spiral]: [string, any]) => spiral.active)
    .length;
  console.log(`    Active spirals: ${activeSpirals} (need 3+ sustained 12+ months for cascade)`);
  console.log(`    Diagnosis: ${activeSpirals < 3 ? 'Insufficient spirals activated' : 'Spirals not sustained long enough'}`);
}
if (!result.finalState.history?.cooperativeSpirals || result.finalState.history.cooperativeSpirals.length === 0) {
  console.log(`  ⚠️  COOPERATIVE SPIRALS: No trust cascades triggered`);
  console.log(`    Diagnosis: Alignment milestones not met (need 2+ including 24 months no misalignment)`);
}
if (ptp.triggeredCascades.length === 0) {
  console.log(`  ⚠️  POSITIVE TIPPING POINTS: No technology cascades triggered`);
  console.log(`    Diagnosis: Technologies not reaching price parity or adoption thresholds`);
}

console.log('\n✅ God mode test complete\n');

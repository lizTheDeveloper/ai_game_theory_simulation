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
import type { GameState } from '../src/types/game';
import { detectAlignmentSuccessMilestones, calculateCollectiveActionPotential } from '../src/simulation/cooperativeSpirals';
import { assertFinite, assertStateProperty } from '../src/simulation/utils/assertions';
import { getScenario, listScenarios } from '../src/simulation/predefinedScenarios';
import type { ScenarioDefinition, ActiveScenario } from '../src/types/scenario';
import * as fs from 'fs';

// Parse command-line arguments
const seed = process.argv[2] ? parseInt(process.argv[2]) : 42;
const maxMonths = process.argv[3] ? parseInt(process.argv[3]) : 120;
const scenarioId = process.argv[4]; // Optional: --scenario=scientific-acceleration

console.log('\n' + '='.repeat(80));
console.log('🎮 GOD MODE TEST - All Technologies Deployed');
console.log('='.repeat(80));
console.log(`Seed: ${seed}`);
console.log(`Max months: ${maxMonths}`);

// Load scenario if specified
let scenario: ScenarioDefinition | undefined = undefined;
if (scenarioId) {
  scenario = getScenario(scenarioId);
  if (!scenario) {
    console.error(`\n❌ ERROR: Scenario '${scenarioId}' not found.`);
    console.error(`Available scenarios: ${listScenarios().join(', ')}`);
    process.exit(1);
  }
  console.log(`\n🎯 SCENARIO: ${scenario.name}`);
  console.log(`   ${scenario.description}`);
  if (scenario.hypothesis) {
    console.log(`\n   HYPOTHESIS: ${scenario.hypothesis}`);
  }
  if (scenario.targetSpirals && scenario.targetSpirals.length > 0) {
    console.log(`   TARGET SPIRALS: ${scenario.targetSpirals.join(', ')}`);
  }
} else {
  console.log(`\nNo scenario specified. Using god mode baseline (all tech, no governance overrides).`);
  console.log(`\nTo test a scenario: npx tsx scripts/godModeTest.ts <seed> <maxMonths> <scenarioId>`);
  console.log(`Available scenarios: ${listScenarios().join(', ')}`);
}

// Get all technologies
const allTech = getAllTech();
console.log(`\nTechnologies: ${allTech.length}`);

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

// Apply scenario if specified
if (scenario) {
  console.log(`\n🎯 Applying scenario: ${scenario.name}\n`);

  // Convert ScenarioDefinition to ActiveScenario
  const activeScenario: ActiveScenario = {
    ...scenario,
    startMonth: 0,
    metadata: {
      predefined: true,
      createdAt: new Date().toISOString(),
    },
  };

  // Store scenario in state (ApplyScenarioPrioritiesPhase will read this)
  state.scenario = activeScenario;

  // Apply starting conditions (one-time overrides)
  if (scenario.startingConditions) {
    const cond = scenario.startingConditions;

    if (cond.trustInAI !== undefined) {
      // Trust in AI isn't a direct GameState field in current impl
      // May need to map to socialCohesion.trust or similar
      console.log(`   🔹 Trust in AI: default → ${(cond.trustInAI * 100).toFixed(0)}%`);
      // TODO: Map to appropriate state field when trust tracking is added
    }

    if (cond.institutionalCapacity !== undefined) {
      const oldQuality = state.government.governanceQuality.decisionQuality;
      state.government.governanceQuality.decisionQuality = cond.institutionalCapacity;
      state.government.governanceQuality.institutionalStrength = cond.institutionalCapacity;
      console.log(`   🔹 Institutional capacity: ${(oldQuality * 100).toFixed(0)}% → ${(cond.institutionalCapacity * 100).toFixed(0)}%`);
    }

    if (cond.giniCoefficient !== undefined) {
      // Convert Gini [0,1] to wealthDistribution [0,1] where higher = more equal
      // Gini: 0 = perfect equality, 1 = perfect inequality
      // wealthDistribution: 1 = perfect equality, 0 = perfect inequality
      const oldWealthDist = state.globalMetrics.wealthDistribution;
      const oldGini = 1.0 - oldWealthDist; // Convert back to Gini for display
      state.globalMetrics.wealthDistribution = 1.0 - cond.giniCoefficient;
      console.log(`   🔹 Gini coefficient: ${oldGini.toFixed(2)} → ${cond.giniCoefficient.toFixed(2)}`);
    }

    if (cond.socialCohesion !== undefined) {
      const oldTrust = state.socialCohesion.trust;
      state.socialCohesion.trust = cond.socialCohesion;
      state.socialCohesion.communityBonds = cond.socialCohesion;
      console.log(`   🔹 Social cohesion: ${(oldTrust * 100).toFixed(0)}% → ${(cond.socialCohesion * 100).toFixed(0)}%`);
    }
  }

  console.log(`\n   ℹ️  Government priorities will be applied monthly by ApplyScenarioPrioritiesPhase (order 1.5)`);
  if (scenario.governmentPriorities) {
    const pri = scenario.governmentPriorities;
    if (pri.researchInvestment !== undefined) {
      console.log(`      - Research: $${pri.researchInvestment.toFixed(1)}B/month`);
    }
    if (pri.climateSpending !== undefined) {
      console.log(`      - Climate: ${(pri.climateSpending * 100).toFixed(1)}% GDP`);
    }
    if (pri.redistributionRate !== undefined) {
      console.log(`      - Redistribution: ${(pri.redistributionRate * 100).toFixed(1)}% GDP (UBI)`);
    }
    if (pri.aiSafetyBudget !== undefined) {
      console.log(`      - AI Safety: $${pri.aiSafetyBudget.toFixed(1)}B/month`);
    }
    if (pri.democracyLevel !== undefined) {
      console.log(`      - Democracy: ${(pri.democracyLevel * 100).toFixed(0)}%`);
    }
    if (pri.governmentType !== undefined) {
      console.log(`      - Government type: ${pri.governmentType}`);
    }
  }
} else {
  console.log(`   - All other state variables left at default initialization`);
}

// Create engine for simulation
const engine = new SimulationEngine(undefined as any, seed);

console.log('\n\n' + '='.repeat(80));
console.log('▶️  Running simulation...');
console.log('='.repeat(80) + '\n');

// =============================================================================
// SPIRAL DIAGNOSTICS (Phase 1: High Priority)
// =============================================================================

interface SpiralBlocker {
  condition: string;
  actual: string;
  required: string;
}

interface SpiralActivationLog {
  month: number;
  upwardSpirals: {
    abundance: { active: boolean; strength: number; blockers: SpiralBlocker[] };
    cognitive: { active: boolean; strength: number; blockers: SpiralBlocker[] };
    democratic: { active: boolean; strength: number; blockers: SpiralBlocker[] };
    scientific: { active: boolean; strength: number; blockers: SpiralBlocker[] };
    meaning: { active: boolean; strength: number; blockers: SpiralBlocker[] };
    ecological: { active: boolean; strength: number; blockers: SpiralBlocker[] };
    cascadeActive: boolean;
    cascadeStrength: number;
  };
  cooperativeSpirals: {
    alignmentMilestones: number;
    trustCascadeTriggered: boolean;
    collectiveActionPotential: number;
    criticalJunctureDetected: boolean;
  };
  positiveTippingPoints: {
    activeCascades: number;
    triggeredCascades: string[];
    marketShares: { [tech: string]: number };
  };
}

const spiralHistory: SpiralActivationLog[] = [];

/**
 * Extract market shares from positive tipping points
 */
function extractMarketShares(state: GameState): { [tech: string]: number } {
  const ptp = state.positiveTippingPoints;
  return {
    solarPV: ptp.adoptionTracking.solarPV.marketShare,
    electricVehicles: ptp.adoptionTracking.electricVehicles.marketShare,
    windPower: ptp.adoptionTracking.windPower.marketShare,
    heatPumps: ptp.adoptionTracking.heatPumps.marketShare,
    batteryStorage: ptp.adoptionTracking.batteryStorage.marketShare
  };
}

/**
 * Blocker detection: Abundance spiral
 */
function getAbundanceBlockers(state: GameState): SpiralBlocker[] {
  const blockers: SpiralBlocker[] = [];
  const qol = state.qualityOfLifeSystems;

  if (qol.materialAbundance <= 1.5) {
    blockers.push({
      condition: 'materialAbundance',
      actual: qol.materialAbundance.toFixed(2),
      required: '>1.5'
    });
  }
  if (qol.energyAvailability <= 1.5) {
    blockers.push({
      condition: 'energyAvailability',
      actual: qol.energyAvailability.toFixed(2),
      required: '>1.5'
    });
  }
  if (state.society.unemploymentLevel <= 0.6) {
    blockers.push({
      condition: 'unemployment',
      actual: (state.society.unemploymentLevel * 100).toFixed(0) + '%',
      required: '>60%'
    });
  }
  if (state.globalMetrics.economicTransitionStage < 3) {
    blockers.push({
      condition: 'economicStage',
      actual: state.globalMetrics.economicTransitionStage.toString(),
      required: '>=3 (UBI/post-work)'
    });
  }

  return blockers;
}

/**
 * Blocker detection: Cognitive spiral
 */
function getCognitiveBlockers(state: GameState): SpiralBlocker[] {
  const blockers: SpiralBlocker[] = [];
  const qol = state.qualityOfLifeSystems;
  const social = state.socialAccumulation;

  if (qol.diseasesBurden >= 0.3) {
    blockers.push({
      condition: 'diseasesBurden',
      actual: (qol.diseasesBurden * 100).toFixed(0) + '%',
      required: '<30%'
    });
  }
  if (qol.healthcareQuality <= 0.8) {
    blockers.push({
      condition: 'healthcareQuality',
      actual: (qol.healthcareQuality * 100).toFixed(0) + '%',
      required: '>80%'
    });
  }
  if (social.meaningCrisisLevel >= 0.3) {
    blockers.push({
      condition: 'meaningCrisis',
      actual: (social.meaningCrisisLevel * 100).toFixed(0) + '%',
      required: '<30%'
    });
  }

  const demonstratedBenefits = state.globalMetrics.qualityOfLife > 0.5;
  if (!demonstratedBenefits) {
    blockers.push({
      condition: 'demonstratedBenefits',
      actual: (state.globalMetrics.qualityOfLife * 100).toFixed(0) + '%',
      required: '>50% (AI improving life)'
    });
  }

  // Note: Comprehensive trust calculation is complex, simplified here
  // Full trust check happens in upwardSpirals.ts

  return blockers;
}

/**
 * Blocker detection: Democratic spiral
 */
function getDemocraticBlockers(state: GameState): SpiralBlocker[] {
  const blockers: SpiralBlocker[] = [];
  const gov = state.government.governanceQuality;

  if (gov.decisionQuality <= 0.7) {
    blockers.push({
      condition: 'decisionQuality',
      actual: (gov.decisionQuality * 100).toFixed(0) + '%',
      required: '>70%'
    });
  }
  if (gov.institutionalCapacity <= 0.7) {
    blockers.push({
      condition: 'institutionalCapacity',
      actual: (gov.institutionalCapacity * 100).toFixed(0) + '%',
      required: '>70%'
    });
  }
  if (gov.participationRate <= 0.6) {
    blockers.push({
      condition: 'participationRate',
      actual: (gov.participationRate * 100).toFixed(0) + '%',
      required: '>60%'
    });
  }
  if (gov.transparency <= 0.7) {
    blockers.push({
      condition: 'transparency',
      actual: (gov.transparency * 100).toFixed(0) + '%',
      required: '>70%'
    });
  }
  if (state.government.governmentType === 'authoritarian') {
    blockers.push({
      condition: 'governmentType',
      actual: 'authoritarian',
      required: 'not authoritarian'
    });
  }

  return blockers;
}

/**
 * Blocker detection: Scientific spiral
 */
function getScientificBlockers(state: GameState): SpiralBlocker[] {
  const blockers: SpiralBlocker[] = [];

  // Count deployed tech (>50%)
  const deployedTech = state.techTreeState.regionalDeployment['global']?.filter(
    d => d.deploymentLevel > 0.5
  ).length || 0;

  const avgAICapability = state.aiAgents.length > 0
    ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length
    : 0;

  const deploymentThreshold = avgAICapability > 4.0 ? 3 : 4;

  if (deployedTech < deploymentThreshold) {
    blockers.push({
      condition: 'deployedTech',
      actual: deployedTech.toString(),
      required: `>=${deploymentThreshold} (at >50% deployment)`
    });
  }

  const totalResearch = state.government.researchInvestments.totalBudget;
  if (totalResearch <= 50) {
    blockers.push({
      condition: 'researchBudget',
      actual: `$${totalResearch.toFixed(1)}B`,
      required: '>$50B/month'
    });
  }

  if (avgAICapability <= 1.2) {
    blockers.push({
      condition: 'avgAICapability',
      actual: avgAICapability.toFixed(2),
      required: '>1.2'
    });
  }

  const workflowAdaptation = state.society.workflowAdaptation || 0;
  if (workflowAdaptation < 0.25) {
    blockers.push({
      condition: 'workflowAdaptation',
      actual: (workflowAdaptation * 100).toFixed(0) + '%',
      required: '>=25% (critical mass)'
    });
  }

  return blockers;
}

/**
 * Blocker detection: Meaning spiral
 */
function getMeaningBlockers(state: GameState): SpiralBlocker[] {
  const blockers: SpiralBlocker[] = [];
  const qol = state.qualityOfLifeSystems;
  const social = state.socialAccumulation;

  if (social.meaningCrisisLevel >= 0.2) {
    blockers.push({
      condition: 'meaningCrisis',
      actual: (social.meaningCrisisLevel * 100).toFixed(0) + '%',
      required: '<20%'
    });
  }

  // Calculate average cohesion from components
  const avgCohesion = (social.socialCohesion.trust + social.socialCohesion.communityBonds) / 200; // [0,1]
  if (avgCohesion <= 0.7) {
    blockers.push({
      condition: 'avgCohesion',
      actual: (avgCohesion * 100).toFixed(0) + '%',
      required: '>70%'
    });
  }

  const culturalAdaptation = social.culturalAdaptation || 0;
  if (culturalAdaptation <= 0.7) {
    blockers.push({
      condition: 'culturalAdaptation',
      actual: (culturalAdaptation * 100).toFixed(0) + '%',
      required: '>70%'
    });
  }

  if (qol.autonomy <= 0.7) {
    blockers.push({
      condition: 'autonomy',
      actual: (qol.autonomy * 100).toFixed(0) + '%',
      required: '>70%'
    });
  }

  if (qol.culturalVitality <= 0.7) {
    blockers.push({
      condition: 'culturalVitality',
      actual: (qol.culturalVitality * 100).toFixed(0) + '%',
      required: '>70%'
    });
  }

  return blockers;
}

/**
 * Blocker detection: Ecological spiral
 */
function getEcologicalBlockers(state: GameState): SpiralBlocker[] {
  const blockers: SpiralBlocker[] = [];
  const qol = state.qualityOfLifeSystems;

  if (qol.ecosystemHealth <= 0.7) {
    blockers.push({
      condition: 'ecosystemHealth',
      actual: (qol.ecosystemHealth * 100).toFixed(0) + '%',
      required: '>70%'
    });
  }
  if (qol.climateStability <= 0.7) {
    blockers.push({
      condition: 'climateStability',
      actual: (qol.climateStability * 100).toFixed(0) + '%',
      required: '>70%'
    });
  }

  const biodiversityIndex = state.environmentalAccumulation?.biodiversityIndex || 0;
  if (biodiversityIndex <= 0.7) {
    blockers.push({
      condition: 'biodiversityIndex',
      actual: (biodiversityIndex * 100).toFixed(0) + '%',
      required: '>70%'
    });
  }

  if (qol.pollutionLevel >= 0.3) {
    blockers.push({
      condition: 'pollution',
      actual: (qol.pollutionLevel * 100).toFixed(0) + '%',
      required: '<30%'
    });
  }

  const resourceReserves = state.environmentalAccumulation?.resourceReserves || 0;
  if (resourceReserves <= 0.7) {
    blockers.push({
      condition: 'resourceReserves',
      actual: (resourceReserves * 100).toFixed(0) + '%',
      required: '>70%'
    });
  }

  return blockers;
}

/**
 * Capture spiral diagnostics for current month
 */
function captureSpiralDiagnostics(state: GameState): SpiralActivationLog {
  const upward = state.upwardSpirals;

  // Count alignment milestones (simplified check)
  const hasAlignmentSuccess = detectAlignmentSuccessMilestones(state);
  const alignmentMilestoneCount = hasAlignmentSuccess ? 2 : 0; // 2+ required for trust cascade

  // Check for trust cascade trigger (recent cooperative spiral event)
  const trustCascadeTriggered = (state.history.cooperativeSpirals || []).some(
    s => s.type === 'alignment-success' && state.currentMonth - s.month < 24
  );

  // Calculate collective action potential
  const collectiveActionPotential = calculateCollectiveActionPotential(state);

  // Critical juncture detection (simplified)
  // Note: state.history doesn't have a 'crises' array - using currentCrises as proxy
  const hasRecentCrisis = state.currentCrises && state.currentCrises.length > 0;
  const criticalJunctureDetected = state.government.governanceQuality.institutionalCapacity < 0.5 &&
    hasRecentCrisis &&
    state.globalMetrics.informationIntegrity > 0.5 &&
    hasAlignmentSuccess;

  return {
    month: state.currentMonth,
    upwardSpirals: {
      abundance: {
        active: upward.abundance.active,
        strength: upward.abundance.strength,
        blockers: getAbundanceBlockers(state)
      },
      cognitive: {
        active: upward.cognitive.active,
        strength: upward.cognitive.strength,
        blockers: getCognitiveBlockers(state)
      },
      democratic: {
        active: upward.democratic.active,
        strength: upward.democratic.strength,
        blockers: getDemocraticBlockers(state)
      },
      scientific: {
        active: upward.scientific.active,
        strength: upward.scientific.strength,
        blockers: getScientificBlockers(state)
      },
      meaning: {
        active: upward.meaning.active,
        strength: upward.meaning.strength,
        blockers: getMeaningBlockers(state)
      },
      ecological: {
        active: upward.ecological.active,
        strength: upward.ecological.strength,
        blockers: getEcologicalBlockers(state)
      },
      cascadeActive: upward.cascadeActive,
      cascadeStrength: upward.cascadeStrength
    },
    cooperativeSpirals: {
      alignmentMilestones: alignmentMilestoneCount,
      trustCascadeTriggered,
      collectiveActionPotential,
      criticalJunctureDetected
    },
    positiveTippingPoints: {
      activeCascades: state.positiveTippingPoints.activeCascades,
      triggeredCascades: state.positiveTippingPoints.triggeredCascades.map(c => c.type),
      marketShares: extractMarketShares(state)
    }
  };
}

// Run simulation with spiral diagnostics
const result = engine.run(state, {
  maxMonths,
  checkActualOutcomes: true,
  onMonthEnd: (state: GameState) => {
    // Capture spiral state every month
    spiralHistory.push(captureSpiralDiagnostics(state));
  }
});

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

console.log('\n✅ God mode test complete\n');

// =============================================================================
// SPIRAL DIAGNOSTICS REPORT
// =============================================================================

interface SpiralActivationSummary {
  everActivated: boolean;
  firstMonth: number;
  lastMonth: number;
  totalMonths: number;
  activeMonths: number[];
  maxStrength: number;
  persistentBlockers: string[];
}

/**
 * Analyze spiral activation timeline
 */
function analyzeSpiralTimeline(history: SpiralActivationLog[]): {
  abundance: SpiralActivationSummary;
  cognitive: SpiralActivationSummary;
  democratic: SpiralActivationSummary;
  scientific: SpiralActivationSummary;
  meaning: SpiralActivationSummary;
  ecological: SpiralActivationSummary;
  cascade: SpiralActivationSummary;
} {
  const spiralNames: Array<'abundance' | 'cognitive' | 'democratic' | 'scientific' | 'meaning' | 'ecological'> = [
    'abundance', 'cognitive', 'democratic', 'scientific', 'meaning', 'ecological'
  ];

  const analyzeSingleSpiral = (name: typeof spiralNames[number]): SpiralActivationSummary => {
    const activeMonths = history
      .filter(h => h.upwardSpirals[name].active)
      .map(h => h.month);

    const maxStrength = Math.max(...history.map(h => h.upwardSpirals[name].strength));

    // Find blockers that were NEVER satisfied
    const allBlockerConditions = new Set<string>();
    const satisfiedConditions = new Set<string>();

    history.forEach(h => {
      const blockers = h.upwardSpirals[name].blockers;
      blockers.forEach(b => allBlockerConditions.add(b.condition));

      // If no blockers for this condition, it was satisfied
      if (blockers.length === 0 || !blockers.find(bl => bl.condition)) {
        // Mark all possible conditions as satisfied if spiral is active
        if (h.upwardSpirals[name].active) {
          allBlockerConditions.forEach(c => satisfiedConditions.add(c));
        }
      }
    });

    const persistentBlockers: string[] = [];
    history[history.length - 1]?.upwardSpirals[name].blockers.forEach(b => {
      const wasEverSatisfied = history.some(h =>
        !h.upwardSpirals[name].blockers.find(bl => bl.condition === b.condition)
      );
      if (!wasEverSatisfied) {
        persistentBlockers.push(`${b.condition} (actual: ${b.actual}, need: ${b.required})`);
      }
    });

    return {
      everActivated: activeMonths.length > 0,
      firstMonth: activeMonths.length > 0 ? activeMonths[0] : -1,
      lastMonth: activeMonths.length > 0 ? activeMonths[activeMonths.length - 1] : -1,
      totalMonths: activeMonths.length,
      activeMonths,
      maxStrength,
      persistentBlockers
    };
  };

  const cascade: SpiralActivationSummary = (() => {
    const activeMonths = history
      .filter(h => h.upwardSpirals.cascadeActive)
      .map(h => h.month);

    const maxStrength = Math.max(...history.map(h => h.upwardSpirals.cascadeStrength));

    return {
      everActivated: activeMonths.length > 0,
      firstMonth: activeMonths.length > 0 ? activeMonths[0] : -1,
      lastMonth: activeMonths.length > 0 ? activeMonths[activeMonths.length - 1] : -1,
      totalMonths: activeMonths.length,
      activeMonths,
      maxStrength,
      persistentBlockers: []
    };
  })();

  return {
    abundance: analyzeSingleSpiral('abundance'),
    cognitive: analyzeSingleSpiral('cognitive'),
    democratic: analyzeSingleSpiral('democratic'),
    scientific: analyzeSingleSpiral('scientific'),
    meaning: analyzeSingleSpiral('meaning'),
    ecological: analyzeSingleSpiral('ecological'),
    cascade
  };
}

/**
 * Find conditions that were NEVER met across entire simulation
 */
function findNeverMetConditions(history: SpiralActivationLog[]): Array<{
  spiral: string;
  condition: string;
  reason: string;
  actualValues: { min: number; max: number; avg: number; final: string };
}> {
  const neverMet: Array<{
    spiral: string;
    condition: string;
    reason: string;
    actualValues: { min: number; max: number; avg: number; final: string };
  }> = [];

  const spiralNames: Array<'abundance' | 'cognitive' | 'democratic' | 'scientific' | 'meaning' | 'ecological'> = [
    'abundance', 'cognitive', 'democratic', 'scientific', 'meaning', 'ecological'
  ];

  spiralNames.forEach(spiralName => {
    // Get final blockers (persistent issues)
    const finalBlockers = history[history.length - 1]?.upwardSpirals[spiralName].blockers || [];

    finalBlockers.forEach(blocker => {
      // Check if this blocker persisted throughout simulation
      const wasEverSatisfied = history.some(h =>
        !h.upwardSpirals[spiralName].blockers.find(b => b.condition === blocker.condition)
      );

      if (!wasEverSatisfied) {
        // Extract numeric values from "actual" strings
        const actualValues = history.map(h => {
          const b = h.upwardSpirals[spiralName].blockers.find(bl => bl.condition === blocker.condition);
          if (!b) return 0;
          // Parse numeric value from string like "42%" or "1.23" or "$50.0B"
          const match = b.actual.match(/[\d.]+/);
          return match ? parseFloat(match[0]) : 0;
        }).filter(v => v > 0);

        const min = Math.min(...actualValues);
        const max = Math.max(...actualValues);
        const avg = actualValues.reduce((a, b) => a + b, 0) / actualValues.length;

        neverMet.push({
          spiral: spiralName,
          condition: blocker.condition,
          reason: blocker.required,
          actualValues: {
            min,
            max,
            avg,
            final: blocker.actual
          }
        });
      }
    });
  });

  return neverMet;
}

console.log('\n' + '='.repeat(80));
console.log('🔍 SPIRAL ACTIVATION DIAGNOSTICS');
console.log('='.repeat(80));

// Summary: When did spirals activate?
console.log('\n📊 Spiral Activation Timeline:');
const spiralActivations = analyzeSpiralTimeline(spiralHistory);

const spiralNames: Array<{ key: keyof typeof spiralActivations; label: string }> = [
  { key: 'abundance', label: 'Abundance' },
  { key: 'cognitive', label: 'Cognitive' },
  { key: 'democratic', label: 'Democratic' },
  { key: 'scientific', label: 'Scientific' },
  { key: 'meaning', label: 'Meaning' },
  { key: 'ecological', label: 'Ecological' }
];

spiralNames.forEach(({ key, label }) => {
  const s = spiralActivations[key];
  if (s.everActivated) {
    console.log(`  ${label}: ✅ YES (months ${s.firstMonth}-${s.lastMonth}, total: ${s.totalMonths}, max strength: ${s.maxStrength.toFixed(2)})`);
  } else {
    console.log(`  ${label}: ❌ NEVER`);
  }
});

console.log(`\n💫 Virtuous Cascade:`);
const cascade = spiralActivations.cascade;
if (cascade.everActivated) {
  console.log(`  ✅ YES (months ${cascade.firstMonth}-${cascade.lastMonth}, total: ${cascade.totalMonths})`);
  console.log(`  Peak strength: ${cascade.maxStrength.toFixed(2)}x`);
} else {
  console.log(`  ❌ NEVER (requires 4+ spirals active simultaneously)`);
}

// Identify persistent blockers
console.log('\n🚫 Persistent Blockers (never satisfied):');
const neverMetConditions = findNeverMetConditions(spiralHistory);

if (neverMetConditions.length === 0) {
  console.log('  ✅ None - all conditions were met at some point!');
} else {
  // Group by spiral
  const groupedBySpiral: Record<string, typeof neverMetConditions> = {};
  neverMetConditions.forEach(c => {
    if (!groupedBySpiral[c.spiral]) groupedBySpiral[c.spiral] = [];
    groupedBySpiral[c.spiral].push(c);
  });

  Object.keys(groupedBySpiral).forEach(spiral => {
    console.log(`\n  ${spiral.toUpperCase()}:`);
    groupedBySpiral[spiral].forEach(c => {
      console.log(`    - ${c.condition}: need ${c.reason}`);
      console.log(`      Range: ${c.actualValues.min.toFixed(1)} - ${c.actualValues.max.toFixed(1)} (avg: ${c.actualValues.avg.toFixed(1)})`);
      console.log(`      Final: ${c.actualValues.final}`);
    });
  });
}

// Cooperative spirals analysis
console.log('\n🤝 Cooperative Spirals:');
const finalCooperative = spiralHistory[spiralHistory.length - 1]?.cooperativeSpirals;
if (finalCooperative) {
  console.log(`  Alignment milestones: ${finalCooperative.alignmentMilestones} (need 2+)`);
  console.log(`  Trust cascade triggered: ${finalCooperative.trustCascadeTriggered ? '✅ YES' : '❌ NO'}`);
  console.log(`  Collective action potential: ${(finalCooperative.collectiveActionPotential * 100).toFixed(0)}% (need >60%)`);
  console.log(`  Critical juncture detected: ${finalCooperative.criticalJunctureDetected ? '✅ YES' : '❌ NO'}`);
} else {
  console.log('  ⚠️  No cooperative spiral data captured');
}

// Positive tipping points analysis
console.log('\n⚡ Positive Tipping Points:');
const finalPTP = spiralHistory[spiralHistory.length - 1]?.positiveTippingPoints;
if (finalPTP) {
  console.log(`  Active cascades: ${finalPTP.activeCascades}`);
  if (finalPTP.triggeredCascades.length > 0) {
    console.log(`  Triggered cascades: ${finalPTP.triggeredCascades.join(', ')}`);
  } else {
    console.log(`  Triggered cascades: NONE`);
  }
  console.log(`\n  Market shares (need 5-20% for S-curve):`);
  Object.entries(finalPTP.marketShares).forEach(([tech, share]) => {
    const inRange = share >= 0.05 && share <= 0.20;
    console.log(`    ${tech}: ${(share * 100).toFixed(1)}% ${inRange ? '✅' : '❌'}`);
  });
} else {
  console.log('  ⚠️  No positive tipping point data captured');
}

// Save detailed JSON log
const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '');
const scenarioSuffix = scenarioId ? `_scenario_${scenarioId}` : '';
const logPath = `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/god_mode_spirals${scenarioSuffix}_${timestamp}.log`;
fs.writeFileSync(logPath, JSON.stringify(spiralHistory, null, 2));
console.log(`\n💾 Detailed spiral log saved: ${logPath}`);
console.log(`   Log contains ${spiralHistory.length} monthly snapshots`);

console.log('\n' + '='.repeat(80));

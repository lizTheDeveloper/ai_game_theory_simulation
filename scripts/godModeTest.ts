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
import { SCENARIO_CATALOG, ScenarioDefinition } from '../src/types/scenarios';

const seed = process.argv[2] ? parseInt(process.argv[2]) : 42;
const maxMonths = process.argv[3] ? parseInt(process.argv[3]) : 120;
const scenarioId = process.argv[4] as keyof typeof SCENARIO_CATALOG | undefined;

// Validate scenario if provided
let scenario: ScenarioDefinition | undefined;
if (scenarioId) {
  scenario = SCENARIO_CATALOG[scenarioId];
  if (!scenario) {
    console.error(`❌ Unknown scenario: ${scenarioId}`);
    console.error(`Available scenarios: ${Object.keys(SCENARIO_CATALOG).join(', ')}`);
    process.exit(1);
  }
}

console.log('\n' + '='.repeat(80));
console.log('🎮 GOD MODE TEST - All Technologies Deployed');
if (scenario) {
  console.log(`📋 SCENARIO: ${scenario.name}`);
}
console.log('='.repeat(80));
console.log(`Seed: ${seed}`);
console.log(`Max months: ${maxMonths}`);
if (scenario) {
  console.log(`Scenario: ${scenario.id}`);
  console.log(`Hypothesis: ${scenario.hypothesis}`);
}

// Get all technologies
const allTech = getAllTech();
console.log(`Technologies: ${allTech.length}`);

// Create initial state with proper RNG
// CRITICAL: Must create engine first to get deterministic RNG
const tempEngine = new SimulationEngine({ seed });
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

// Apply scenario if provided
if (scenario) {
  console.log('\n🔧 Applying scenario modifications...');
  state.scenario = scenario;

  // Apply starting condition boosts
  if (scenario.startingConditions) {
    const conditions = scenario.startingConditions;

    if (conditions.governanceQuality !== undefined) {
      console.log(`   📋 Governance quality boost: ${(conditions.governanceQuality * 100).toFixed(0)}%`);
      state.government.governanceQuality.decisionQuality = Math.max(
        state.government.governanceQuality.decisionQuality,
        conditions.governanceQuality
      );
      state.government.governanceQuality.transparency = Math.max(
        state.government.governanceQuality.transparency,
        conditions.governanceQuality
      );
      state.government.governanceQuality.participationRate = Math.max(
        state.government.governanceQuality.participationRate,
        conditions.governanceQuality
      );
    }

    if (conditions.institutionalCapacity !== undefined) {
      console.log(`   📋 Institutional capacity boost: ${(conditions.institutionalCapacity * 100).toFixed(0)}%`);
      state.government.governanceQuality.institutionalCapacity = Math.max(
        state.government.governanceQuality.institutionalCapacity,
        conditions.institutionalCapacity
      );
    }

    if (conditions.physicalSafety !== undefined) {
      console.log(`   📋 Physical safety boost: ${(conditions.physicalSafety * 100).toFixed(0)}%`);
      state.qualityOfLifeSystems.physicalSafety = Math.max(
        state.qualityOfLifeSystems.physicalSafety,
        conditions.physicalSafety
      );
    }

    if (conditions.informationIntegrity !== undefined) {
      console.log(`   📋 Information integrity boost: ${(conditions.informationIntegrity * 100).toFixed(0)}%`);
      state.qualityOfLifeSystems.informationIntegrity = Math.max(
        state.qualityOfLifeSystems.informationIntegrity,
        conditions.informationIntegrity
      );
    }

    if (conditions.trustInAI !== undefined) {
      console.log(`   📋 Trust in AI boost: ${(conditions.trustInAI * 100).toFixed(0)}%`);
      // Trust in AI is tracked per country in governmentSystem
      // For god mode, we'll boost the general trust metric if it exists
      if ((state as any).trustInAI !== undefined) {
        (state as any).trustInAI = Math.max((state as any).trustInAI, conditions.trustInAI);
      }
    }

    if (conditions.qolBoosts) {
      console.log(`   📋 QoL dimension boosts applied`);
      for (const [dim, value] of Object.entries(conditions.qolBoosts)) {
        if (value !== undefined && (state.qualityOfLifeSystems as any)[dim] !== undefined) {
          (state.qualityOfLifeSystems as any)[dim] = Math.max((state.qualityOfLifeSystems as any)[dim], value);
        }
      }
    }
  }

  // Government priorities will be applied by ApplyScenarioPrioritiesPhase each month
  if (scenario.governmentPriorities) {
    console.log('   🎯 Government priorities will be applied by ApplyScenarioPrioritiesPhase');
  }

  console.log('✅ Scenario modifications applied\n');
}

// Create engine for simulation
const engine = new SimulationEngine({ seed });

console.log('\n\n' + '='.repeat(80));
console.log('▶️  Running simulation...');
console.log('='.repeat(80) + '\n');

// Create log file for spiral diagnostics
const fs = require('fs');
const path = require('path');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
const scenarioSuffix = scenario ? `_${scenario.id}` : '';
const logPath = path.join(__dirname, '..', 'logs', `god_mode_spiral_diagnostics${scenarioSuffix}_${timestamp}.log`);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

let diagnosticLog = '';
function logDiagnostic(message: string) {
  console.log(message);
  diagnosticLog += message + '\n';
}

logDiagnostic('\n📊 SPIRAL ACTIVATION DIAGNOSTICS - God Mode Test');
if (scenario) {
  logDiagnostic(`🎯 SCENARIO: ${scenario.name}`);
  logDiagnostic(`   Hypothesis: ${scenario.hypothesis}`);
}
logDiagnostic('='.repeat(80));
logDiagnostic(`Seed: ${seed} | Max months: ${maxMonths}`);
logDiagnostic(`Technologies deployed: ${allTech.length} at 100%`);
if (scenario?.governmentPriorities) {
  logDiagnostic(`Government priorities: ${Object.keys(scenario.governmentPriorities).join(', ')}`);
}
logDiagnostic('='.repeat(80));

// Monthly diagnostic snapshots
interface SpiralDiagnostic {
  month: number;
  spirals: {
    abundance: { active: boolean; strength: number; failureReasons: string[] };
    cognitive: { active: boolean; strength: number; failureReasons: string[] };
    democratic: { active: boolean; strength: number; failureReasons: string[] };
    scientific: { active: boolean; strength: number; failureReasons: string[] };
    meaning: { active: boolean; strength: number; failureReasons: string[] };
    ecological: { active: boolean; strength: number; failureReasons: string[] };
  };
  cascade: { active: boolean; strength: number; activeCount: number };
  cooperativeSpiralsCount: number;
  positiveTippingCascadesCount: number;
}

const monthlySpiralDiagnostics: SpiralDiagnostic[] = [];

// Diagnostic capture functions
function captureSpiralDiagnostic(state: any): SpiralDiagnostic {
  const spirals = state.upwardSpirals;
  const qol = state.qualityOfLifeSystems;
  const gov = state.government.governanceQuality;
  const social = state.socialAccumulation || state.society;
  const env = state.environmentalAccumulation;

  // Abundance spiral conditions
  const abundanceReasons: string[] = [];
  const materialAbundant = qol.materialAbundance > 1.5;
  const energyAbundant = qol.energyAvailability > 1.5;
  const timeLiberated = state.society.unemploymentLevel > 0.6 && state.globalMetrics.economicTransitionStage >= 3;
  if (!materialAbundant) abundanceReasons.push(`materialAbundance ${qol.materialAbundance.toFixed(2)} <= 1.5`);
  if (!energyAbundant) abundanceReasons.push(`energyAvailability ${qol.energyAvailability.toFixed(2)} <= 1.5`);
  if (!timeLiberated) abundanceReasons.push(`unemploymentLevel ${state.society.unemploymentLevel.toFixed(2)} <= 0.6 OR economicTransitionStage ${state.globalMetrics.economicTransitionStage} < 3`);

  // Cognitive spiral conditions
  const cognitiveReasons: string[] = [];
  const mentalHealthy = qol.diseasesBurden < 0.3 && qol.healthcareQuality > 0.8;
  const purposeful = social.meaningCrisisLevel < 0.3;
  // Simplified trust check (avoiding calculateComprehensiveTrustInAI complexity)
  // FIX (Nov 10, 2025): Replace defensive fallback with proper validation
  // trustInAI may be undefined in test scenarios - fail loudly if missing
  const trustInAI = state.globalMetrics.trustInAI !== undefined
    ? state.globalMetrics.trustInAI
    : (() => {
        throw new Error(
          `❌ Missing state.globalMetrics.trustInAI in captureSpiralDiagnostic\n` +
          `   Month: ${state.currentMonth}\n` +
          `   This field is required for spiral diagnostics.\n` +
          `   Check initialization or scenario setup.`
        );
      })();
  const demonstratedBenefits = state.globalMetrics.qualityOfLife > 0.5;
  const TRUST_THRESHOLD = 0.6; // Approximation
  const cognitiveEnhanced = demonstratedBenefits && trustInAI > TRUST_THRESHOLD;
  if (!mentalHealthy) cognitiveReasons.push(`diseasesBurden ${qol.diseasesBurden.toFixed(2)} >= 0.3 OR healthcareQuality ${qol.healthcareQuality.toFixed(2)} <= 0.8`);
  if (!purposeful) cognitiveReasons.push(`meaningCrisisLevel ${social.meaningCrisisLevel.toFixed(2)} >= 0.3`);
  if (!cognitiveEnhanced) cognitiveReasons.push(`trustInAI ${trustInAI.toFixed(2)} <= ${TRUST_THRESHOLD} OR qualityOfLife ${state.globalMetrics.qualityOfLife.toFixed(2)} <= 0.5`);

  // Democratic spiral conditions
  const democraticReasons: string[] = [];
  const qualityGovernance = gov.decisionQuality > 0.7 && gov.institutionalCapacity > 0.7;
  const democraticEngagement = gov.participationRate > 0.6 && gov.transparency > 0.7;
  const notAuthoritarian = state.government.governmentType !== 'authoritarian';
  if (!qualityGovernance) democraticReasons.push(`decisionQuality ${gov.decisionQuality.toFixed(2)} <= 0.7 OR institutionalCapacity ${gov.institutionalCapacity.toFixed(2)} <= 0.7`);
  if (!democraticEngagement) democraticReasons.push(`participationRate ${gov.participationRate.toFixed(2)} <= 0.6 OR transparency ${gov.transparency.toFixed(2)} <= 0.7`);
  if (!notAuthoritarian) democraticReasons.push(`governmentType is authoritarian`);

  // Scientific spiral conditions
  const scientificReasons: string[] = [];
  const unlockedCount = state.techTreeState?.techUnlockedCount || 0;
  const deployedCount = state.techTreeState?.techDeployedCount || 0;
  const totalResearch = state.government.researchInvestments.totalBudget || 0;
  const researchIntensive = totalResearch > 50;
  const avgAICapability = state.aiAgents.length > 0 ?
    state.aiAgents.reduce((sum: number, ai: any) => sum + (ai.capability || 0), 0) / state.aiAgents.length : 0;
  const aiAccelerated = avgAICapability > 1.2;
  // FIX (Nov 10, 2025): Replace defensive fallback with proper validation
  // workflowAdaptation is required for scientific spiral activation
  const workflowAdaptation = social.workflowAdaptation !== undefined
    ? social.workflowAdaptation
    : (() => {
        throw new Error(
          `❌ Missing social.workflowAdaptation in captureSpiralDiagnostic\n` +
          `   Month: ${state.currentMonth}\n` +
          `   This field is required for scientific spiral diagnostics.\n` +
          `   Check initialization (should be set in initialization.ts).`
        );
      })();
  const workflowAdapted = workflowAdaptation >= 0.25;
  const deploymentThreshold = avgAICapability > 4.0 ? 3 : 4;
  const deployedCheck = deployedCount >= deploymentThreshold;
  if (!deployedCheck) scientificReasons.push(`deployedCount ${deployedCount} < ${deploymentThreshold}`);
  if (!researchIntensive) scientificReasons.push(`researchBudget $${totalResearch.toFixed(0)}B <= $50B`);
  if (!aiAccelerated) scientificReasons.push(`avgAICapability ${avgAICapability.toFixed(2)} <= 1.2`);
  if (!workflowAdapted) scientificReasons.push(`workflowAdaptation ${workflowAdaptation.toFixed(2)} < 0.25`);

  // Meaning spiral conditions
  const meaningReasons: string[] = [];
  const meaningFulfilled = social.meaningCrisisLevel < 0.2;
  const avgCohesion = social.socialCohesion ?
    (social.socialCohesion.trust + social.socialCohesion.communityBonds + social.socialCohesion.civilLiberties) / 300 : 0;
  const strongCommunity = avgCohesion > 0.7;
  const culturallyAdapted = social.culturalAdaptation > 0.7;
  const autonomous = qol.autonomy > 0.7 && qol.culturalVitality > 0.7;
  if (!meaningFulfilled) meaningReasons.push(`meaningCrisisLevel ${social.meaningCrisisLevel.toFixed(2)} >= 0.2`);
  if (!strongCommunity) meaningReasons.push(`avgCohesion ${avgCohesion.toFixed(2)} <= 0.7`);
  if (!culturallyAdapted) meaningReasons.push(`culturalAdaptation ${social.culturalAdaptation.toFixed(2)} <= 0.7`);
  if (!autonomous) meaningReasons.push(`autonomy ${qol.autonomy.toFixed(2)} <= 0.7 OR culturalVitality ${qol.culturalVitality.toFixed(2)} <= 0.7`);

  // Ecological spiral conditions
  const ecologicalReasons: string[] = [];
  const ecosystemHealthy = qol.ecosystemHealth > 0.7;
  const climateStable = env.climateStability > 0.7;
  const biodiverseHealthy = env.biodiversityIndex > 0.7;
  const clean = env.pollutionLevel < 0.3;
  const sustainable = env.resourceReserves > 0.7;
  if (!ecosystemHealthy) ecologicalReasons.push(`ecosystemHealth ${qol.ecosystemHealth.toFixed(2)} <= 0.7`);
  if (!climateStable) ecologicalReasons.push(`climateStability ${env.climateStability.toFixed(2)} <= 0.7`);
  if (!biodiverseHealthy) ecologicalReasons.push(`biodiversityIndex ${env.biodiversityIndex.toFixed(2)} <= 0.7`);
  if (!clean) ecologicalReasons.push(`pollutionLevel ${env.pollutionLevel.toFixed(2)} >= 0.3`);
  if (!sustainable) ecologicalReasons.push(`resourceReserves ${env.resourceReserves.toFixed(2)} <= 0.7`);

  // Count active spirals
  const activeSpiralCount = [
    spirals.abundance.active,
    spirals.cognitive.active,
    spirals.democratic.active,
    spirals.scientific.active,
    spirals.meaning.active,
    spirals.ecological.active
  ].filter(Boolean).length;

  return {
    month: state.currentMonth,
    spirals: {
      abundance: { active: spirals.abundance.active, strength: spirals.abundance.strength, failureReasons: abundanceReasons },
      cognitive: { active: spirals.cognitive.active, strength: spirals.cognitive.strength, failureReasons: cognitiveReasons },
      democratic: { active: spirals.democratic.active, strength: spirals.democratic.strength, failureReasons: democraticReasons },
      scientific: { active: spirals.scientific.active, strength: spirals.scientific.strength, failureReasons: scientificReasons },
      meaning: { active: spirals.meaning.active, strength: spirals.meaning.strength, failureReasons: meaningReasons },
      ecological: { active: spirals.ecological.active, strength: spirals.ecological.strength, failureReasons: ecologicalReasons }
    },
    cascade: {
      active: spirals.cascadeActive,
      strength: spirals.cascadeStrength,
      activeCount: activeSpiralCount
    },
    cooperativeSpiralsCount: state.history?.cooperativeSpirals?.length || 0,
    positiveTippingCascadesCount: state.positiveTippingPoints?.triggeredCascades?.length || 0
  };
}

function logMonthlyDiagnostic(diagnostic: SpiralDiagnostic) {
  const year = Math.floor(diagnostic.month / 12);
  const month = diagnostic.month % 12;

  logDiagnostic(`\n${'='.repeat(80)}`);
  logDiagnostic(`📅 Month ${diagnostic.month} (Year ${year}, Month ${month + 1})`);
  logDiagnostic(`${'='.repeat(80)}`);

  logDiagnostic(`\n🔄 UPWARD SPIRALS (${diagnostic.cascade.activeCount}/6 active):`);

  const spiralNames: Array<keyof typeof diagnostic.spirals> = ['abundance', 'cognitive', 'democratic', 'scientific', 'meaning', 'ecological'];
  for (const name of spiralNames) {
    const spiral = diagnostic.spirals[name];
    const status = spiral.active ? '✅ ACTIVE' : '❌ INACTIVE';
    logDiagnostic(`  ${name}: ${status} (strength: ${spiral.strength.toFixed(2)})`);

    if (!spiral.active && spiral.failureReasons.length > 0) {
      spiral.failureReasons.forEach(reason => {
        logDiagnostic(`    ⚠️  ${reason}`);
      });
    }
  }

  logDiagnostic(`\n🌊 CASCADE STATUS:`);
  if (diagnostic.cascade.active) {
    logDiagnostic(`  ✅ VIRTUOUS CASCADE ACTIVE (${diagnostic.cascade.activeCount} spirals, ${diagnostic.cascade.strength.toFixed(2)}x strength)`);
  } else {
    logDiagnostic(`  ❌ No cascade (need 4+ active spirals, have ${diagnostic.cascade.activeCount})`);
  }

  logDiagnostic(`\n🤝 COOPERATIVE SPIRALS: ${diagnostic.cooperativeSpiralsCount} trust cascades triggered`);
  logDiagnostic(`💡 POSITIVE TIPPING POINTS: ${diagnostic.positiveTippingCascadesCount} tech cascades triggered`);
}

// Add step listener to capture diagnostics
const originalStep = engine.step.bind(engine);
engine.step = function(state: any) {
  const result = originalStep(state);

  // Capture spiral diagnostics every month
  if (state.currentMonth % 1 === 0) {
    const diagnostic = captureSpiralDiagnostic(state);
    monthlySpiralDiagnostics.push(diagnostic);

    // Log milestone months (0, 12, 24, 36, etc.)
    if (state.currentMonth % 12 === 0) {
      logMonthlyDiagnostic(diagnostic);
    }
  }

  return result;
};

// Run simulation (sandbox mode - disable outcome detection to measure full 120-month trajectories)
// God mode deploys all 71 techs at once, which would trigger immediate utopia/dystopia without this.
// We need the full duration to validate boundary effectiveness over time.
const result = engine.run(state, { maxMonths, checkActualOutcomes: false });

console.log('\n' + '='.repeat(80));
console.log('📊 GOD MODE RESULTS');
console.log('='.repeat(80));

// Check if game ended early (finalState will exist but check outcome)
if (!result.finalState || result.summary.finalOutcome === 'extinction') {
  console.log('\n🚨 GAME OVER - Simulation ended early');
  console.log(`📅 Months Simulated: ${result.summary.totalMonths}`);
  console.log(`💀 Outcome: ${result.summary.finalOutcome}`);
  console.log(`\nReason: ${result.summary.finalOutcomeReason}`);
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
    const capValues = Object.values(topAgent.capabilities) as any[];
    const sum: number = capValues.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0);
    const avgCap = Number(sum) / 17;
    console.log(`  Capabilities (avg): ${avgCap.toFixed(2)}`);
  } else {
    console.log(`  Capabilities: ❌ UNDEFINED`);
  }
}

// Crises encountered
console.log('\n⚠️  Crises/Events:');
const events = result.summary.criticalEvents || [];
console.log(`  Critical events: ${events.length}`);

if (events.length > 0) {
  console.log('\n  Sample crises:');
  events.slice(0, 5).forEach(e => {
    console.log(`    [Month ${e.month}] ${e.message || e.description || 'Unknown event'}`);
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

// Write diagnostic log file
logDiagnostic('\n\n' + '='.repeat(80));
logDiagnostic('📊 SPIRAL ACTIVATION SUMMARY');
logDiagnostic('='.repeat(80));

// Analyze when spirals first activated (if ever)
const spiralActivationMonths = {
  abundance: -1,
  cognitive: -1,
  democratic: -1,
  scientific: -1,
  meaning: -1,
  ecological: -1
};

for (const diagnostic of monthlySpiralDiagnostics) {
  const spiralNames: Array<keyof typeof diagnostic.spirals> = ['abundance', 'cognitive', 'democratic', 'scientific', 'meaning', 'ecological'];
  for (const name of spiralNames) {
    if (diagnostic.spirals[name].active && spiralActivationMonths[name] === -1) {
      spiralActivationMonths[name] = diagnostic.month;
    }
  }
}

logDiagnostic('\n🎯 FIRST ACTIVATION TIMES:');
for (const [name, month] of Object.entries(spiralActivationMonths)) {
  if (month === -1) {
    logDiagnostic(`  ${name}: ❌ NEVER ACTIVATED`);
  } else {
    const year = Math.floor(month / 12);
    const m = month % 12;
    logDiagnostic(`  ${name}: ✅ Month ${month} (Year ${year}, Month ${m + 1})`);
  }
}

// Cascade analysis
const cascadeMonths = monthlySpiralDiagnostics.filter(d => d.cascade.active).map(d => d.month);
if (cascadeMonths.length > 0) {
  logDiagnostic(`\n🌊 VIRTUOUS CASCADE: ✅ Activated at Month ${cascadeMonths[0]} (duration: ${cascadeMonths.length} months)`);
} else {
  logDiagnostic(`\n🌊 VIRTUOUS CASCADE: ❌ Never achieved (need 4+ active spirals sustained)`);
}

// Peak analysis
const maxActiveSpirals = Math.max(...monthlySpiralDiagnostics.map(d => d.cascade.activeCount));
logDiagnostic(`\n📈 PEAK PERFORMANCE: ${maxActiveSpirals}/6 spirals active simultaneously`);

// Common failure patterns
logDiagnostic(`\n⚠️  FAILURE PATTERN ANALYSIS:`);
const finalDiagnostic = monthlySpiralDiagnostics[monthlySpiralDiagnostics.length - 1];
if (finalDiagnostic) {
  logDiagnostic(`\nFinal state (Month ${finalDiagnostic.month}):`);
  const spiralNames: Array<keyof typeof finalDiagnostic.spirals> = ['abundance', 'cognitive', 'democratic', 'scientific', 'meaning', 'ecological'];
  for (const name of spiralNames) {
    const spiral = finalDiagnostic.spirals[name];
    if (!spiral.active) {
      logDiagnostic(`\n  ${name} - BLOCKED BY:`);
      spiral.failureReasons.forEach(reason => {
        logDiagnostic(`    • ${reason}`);
      });
    }
  }
}

// Hypothesis generation
logDiagnostic(`\n\n💡 DIAGNOSTIC INSIGHTS:`);
if (maxActiveSpirals === 0) {
  logDiagnostic(`  🚨 CRITICAL: NO spirals ever activated - technology deployment alone is insufficient`);
  logDiagnostic(`     Hypothesis: Spirals require governance/social/economic changes, not just tech`);
} else if (maxActiveSpirals < 4) {
  logDiagnostic(`  ⚠️  WARNING: Only ${maxActiveSpirals} spirals activated - insufficient for cascade`);
  logDiagnostic(`     Hypothesis: Missing key enablers (governance quality, trust, workflow adaptation?)`);
} else if (cascadeMonths.length === 0) {
  logDiagnostic(`  ⚠️  WARNING: Spirals activated but not sustained - cascade requires 4+ SUSTAINED`);
  logDiagnostic(`     Hypothesis: Initial activation but degradation over time`);
} else {
  logDiagnostic(`  ✅ SUCCESS: Virtuous cascade achieved for ${cascadeMonths.length} months`);
}

// Write to file
fs.writeFileSync(logPath, diagnosticLog);
console.log(`\n📝 Full diagnostic log saved to: ${logPath}\n`);

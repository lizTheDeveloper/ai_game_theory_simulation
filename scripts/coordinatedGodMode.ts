#!/usr/bin/env tsx
/**
 * Coordinated God Mode - Paced Technology Deployment with Transition Management
 *
 * CONTRAST WITH godModeTest.ts:
 * - godModeTest.ts: All 71+ techs deployed at Month 0 -> 92% mortality, 100% dystopia
 * - This script: Staged deployment with economic absorption -> tests if coordination helps
 *
 * IMPLEMENTS (from reviews/god_mode_paradox_analysis_20251123.md):
 * 1. Paced tech rollout (3-6 month intervals between deployment waves)
 * 2. Economic absorption checks before each deployment
 * 3. Side effect monitoring with deployment gates
 * 4. AI transition management active throughout
 *
 * RESEARCH BACKING:
 * - CoordinatedDeploymentPhase (research Grade B+, Nov 21, 2025)
 * - 3-Stage Governance Model (recognition -> decision -> implementation)
 * - S-Curve Adoption (Rogers diffusion model)
 *
 * Usage:
 *   npx tsx scripts/coordinatedGodMode.ts [seed] [maxMonths] [deploymentInterval]
 *
 * Examples:
 *   npx tsx scripts/coordinatedGodMode.ts                  # Default: seed=42, 120 months, 3-month intervals
 *   npx tsx scripts/coordinatedGodMode.ts 42 120 6        # 6-month intervals (more conservative)
 *   npx tsx scripts/coordinatedGodMode.ts 42 240 3        # 240 months (20 years), 3-month intervals
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { getAllTech, getTechById, TechDefinition } from '../src/simulation/techTree/comprehensiveTechTree';
import type { GameState } from '../src/types/game';
import { assertFinite } from '../src/simulation/utils/assertions';
import { logSpiralActivationDiagnostics } from '../src/simulation/upwardSpirals';
import { logCooperativeSpiralDiagnostics } from '../src/simulation/cooperativeSpirals';
import { logPositiveTippingPointDiagnostics } from '../src/simulation/positiveTippingPoints';

// ============================================================================
// CONFIGURATION
// ============================================================================

const seed = process.argv[2] ? parseInt(process.argv[2]) : 42;
const maxMonths = process.argv[3] ? parseInt(process.argv[3]) : 120;
const deploymentInterval = process.argv[4] ? parseInt(process.argv[4]) : 3; // months between deployment waves

// Deployment gates (thresholds for pausing deployment)
const ECONOMIC_STRESS_THRESHOLD = 0.7;       // Pause if economic stress > 70%
const MORTALITY_SPIKE_THRESHOLD = 0.02;      // Pause if monthly mortality > 2%
const COORDINATION_QUALITY_THRESHOLD = 0.3;  // Pause if coordination quality < 30%

// Techs per wave (batch size)
const TECHS_PER_WAVE = 5;

console.log('\n' + '='.repeat(80));
console.log('COORDINATED GOD MODE - Paced Technology Deployment');
console.log('='.repeat(80));
console.log(`Seed: ${seed}`);
console.log(`Max months: ${maxMonths}`);
console.log(`Deployment interval: ${deploymentInterval} months between waves`);
console.log(`Techs per wave: ${TECHS_PER_WAVE}`);
console.log('');
console.log('DEPLOYMENT GATES:');
console.log(`  - Economic stress threshold: ${(ECONOMIC_STRESS_THRESHOLD * 100).toFixed(0)}%`);
console.log(`  - Mortality spike threshold: ${(MORTALITY_SPIKE_THRESHOLD * 100).toFixed(1)}%/month`);
console.log(`  - Coordination quality minimum: ${(COORDINATION_QUALITY_THRESHOLD * 100).toFixed(0)}%`);
console.log('');

// ============================================================================
// TECH PRIORITIZATION
// ============================================================================

/**
 * Prioritize technologies for deployment order
 *
 * Priority based on:
 * 1. Status (deployed_2025 = already exists, lowest priority)
 * 2. Min AI capability required (lower = easier = deploy first)
 * 3. Category (climate/agriculture/medical before social/alignment)
 * 4. Dependencies (deploy prerequisites first - handled by deployment order)
 */
function prioritizeTechnologies(allTech: TechDefinition[]): TechDefinition[] {
  // Sort by status, then capability, then category
  const sorted = [...allTech].sort((a, b) => {
    // Status priority (unlockable first, deployed_2025 last)
    const statusPriority: Record<string, number> = {
      'unlockable': 0,
      'future': 1,
      'deployed_2025': 2
    };
    const aStatus = statusPriority[a.status] ?? 1;
    const bStatus = statusPriority[b.status] ?? 1;
    if (aStatus !== bStatus) return aStatus - bStatus;

    // Capability priority (lower threshold = easier to unlock = deploy first)
    const aCapability = a.minAICapability ?? 0;
    const bCapability = b.minAICapability ?? 0;
    if (aCapability !== bCapability) return aCapability - bCapability;

    // Category priority (crisis-response categories first)
    const categoryPriority: Record<string, number> = {
      'climate': 0,      // Climate crisis
      'ocean': 1,        // Ocean acidification
      'agriculture': 2,  // Food security
      'freshwater': 3,   // Water security
      'medical': 4,      // Health
      'energy': 5,       // Energy transition
      'pollution': 6,    // Environmental cleanup
      'social': 7,       // Social systems
      'alignment': 8,    // AI alignment (important but not immediate crisis)
    };

    const aCategory = categoryPriority[a.category] ?? 5;
    const bCategory = categoryPriority[b.category] ?? 5;
    if (aCategory !== bCategory) return aCategory - bCategory;

    // Alphabetical for determinism
    return a.id.localeCompare(b.id);
  });

  return sorted;
}

// ============================================================================
// ECONOMIC STRESS CALCULATION
// ============================================================================

/**
 * Calculate current economic stress level [0-1]
 *
 * Based on:
 * - GDP growth rate (negative = stress)
 * - Unemployment (approximated from workforce displacement)
 * - Economic collapse indicators
 */
function calculateEconomicStress(state: GameState): number {
  // Base economic stress from transition management system
  const transition = state.transitionManagementSystem;
  const workforceDisplacement = transition?.workforceDisplacementRate || 0;

  // Economic activity (handle undefined/zero gracefully)
  const gdp = state.globalEconomicActivity || 0;
  const initialGDP = 105e12; // ~$105 trillion (2025 baseline)

  // Economic decline (relative to initial) - clamped to [0, 1]
  let economicDecline = 0;
  if (gdp > 0 && initialGDP > 0) {
    const gdpRatio = gdp / initialGDP;
    economicDecline = Math.max(0, Math.min(1, 1 - gdpRatio));
  }

  // Coordination failure stress
  const coordinationStress = transition?.coordinationFailureActive ? 0.3 : 0;

  // Combine stress factors (capped at 1.0)
  const totalStress = Math.min(1, workforceDisplacement * 2 + economicDecline * 0.5 + coordinationStress);

  return assertFinite(totalStress, {
    location: 'coordinatedGodMode.calculateEconomicStress',
    valueName: 'economicStress',
    month: state.currentMonth,
    additionalInfo: { workforceDisplacement, economicDecline, coordinationStress, gdp }
  });
}

// ============================================================================
// DEPLOYMENT WAVE EXECUTION
// ============================================================================

/**
 * Deploy a wave of technologies
 *
 * Returns number of technologies actually deployed (may be less if some already deployed)
 */
function deployTechWave(
  state: GameState,
  techsToDeploy: TechDefinition[],
  waveNumber: number
): number {
  let deployedCount = 0;

  for (const tech of techsToDeploy) {
    // Unlock if not already
    if (!state.techTreeState.unlockedTech.includes(tech.id)) {
      state.techTreeState.unlockedTech.push(tech.id);
      state.techTreeState.techUnlockedCount++;
    }

    // Initialize global deployment array if needed
    if (!state.techTreeState.regionalDeployment['global']) {
      state.techTreeState.regionalDeployment['global'] = [];
    }

    // Check if already deployed
    const existing = state.techTreeState.regionalDeployment['global'].find(d => d.techId === tech.id);

    if (existing) {
      // Update existing deployment to 100%
      existing.deploymentLevel = 1.0;
      existing.deployedBy = [...existing.deployedBy, `coordinated_wave_${waveNumber}`];
    } else {
      // Add new deployment
      state.techTreeState.regionalDeployment['global'].push({
        techId: tech.id,
        region: 'global',
        deploymentLevel: 1.0,
        monthlyInvestment: 0,
        totalInvested: tech.deploymentCost,
        deployedBy: [`coordinated_wave_${waveNumber}`],
        effects: tech.effects,
      });
      state.techTreeState.techDeployedCount++;
      deployedCount++;
    }

    // Update recentDeploymentsCount for CoordinatedDeploymentPhase tracking
    if (state.transitionManagementSystem) {
      state.transitionManagementSystem.recentDeploymentsCount += 1;
    }
  }

  return deployedCount;
}

// ============================================================================
// MAIN SIMULATION LOOP
// ============================================================================

// Get all technologies and prioritize
const allTech = getAllTech();
const prioritizedTech = prioritizeTechnologies(allTech);

console.log(`Total technologies: ${allTech.length}`);
console.log(`Priority order (first 10):`);
prioritizedTech.slice(0, 10).forEach((tech, i) => {
  const cap = tech.minAICapability ?? 0;
  console.log(`  ${i + 1}. [${tech.status}, cap>=${cap}] ${tech.name} (${tech.category})`);
});
console.log('');

// Create engine and initial state
const engine = new SimulationEngine(undefined as any, seed);
const rng = engine.getRNG().next.bind(engine.getRNG());
const state = createDefaultInitialState(rng);

// Initialize transition management system for coordinated deployment
if (state.transitionManagementSystem) {
  state.transitionManagementSystem.aiCoordinationCapability = 0.8;  // High AI coordination
  state.transitionManagementSystem.governanceEffectiveness = 0.7;   // Good governance
  state.transitionManagementSystem.supportSystems.ubiCoverage = 0.6;  // Partial UBI coverage
  state.transitionManagementSystem.supportSystems.universalHealthcareCoverage = 0.7;  // Good healthcare
  state.transitionManagementSystem.supportSystems.foodSecurityIndex = 0.8;  // Strong food security
}

console.log('Initial transition management:');
console.log(`  - AI coordination capability: ${(state.transitionManagementSystem?.aiCoordinationCapability || 0) * 100}%`);
console.log(`  - Governance effectiveness: ${(state.transitionManagementSystem?.governanceEffectiveness || 0) * 100}%`);
console.log(`  - UBI coverage: ${(state.transitionManagementSystem?.supportSystems.ubiCoverage || 0) * 100}%`);
console.log(`  - Healthcare coverage: ${(state.transitionManagementSystem?.supportSystems.universalHealthcareCoverage || 0) * 100}%`);
console.log('');

console.log('='.repeat(80));
console.log('RUNNING COORDINATED DEPLOYMENT SIMULATION');
console.log('='.repeat(80) + '\n');

// Deployment state
let techIndex = 0;
let lastDeploymentMonth = 0;
let totalDeployed = 0;
let pausedMonths = 0;
let pauseReason = '';

// Statistics tracking
const deploymentLog: Array<{
  month: number;
  waveNumber: number;
  techsDeployed: number;
  economicStress: number;
  coordinationQuality: number;
  monthlyMortality: number;
  population: number;
}> = [];

// Run simulation
let month = 0;
let waveNumber = 0;

while (month < maxMonths && techIndex < prioritizedTech.length) {
  // Check deployment gates
  const economicStress = calculateEconomicStress(state);
  const coordinationQuality = state.transitionManagementSystem?.coordinationQuality || 0;
  const monthlyMortality = state.transitionManagementSystem?.mortalityThisMonth || 0;

  // Determine if we should deploy this month
  const timeSinceLastDeploy = month - lastDeploymentMonth;
  const shouldDeployThisMonth = timeSinceLastDeploy >= deploymentInterval;

  if (shouldDeployThisMonth && techIndex < prioritizedTech.length) {
    // Check deployment gates
    let canDeploy = true;
    pauseReason = '';

    if (economicStress > ECONOMIC_STRESS_THRESHOLD) {
      canDeploy = false;
      pauseReason = `Economic stress too high (${(economicStress * 100).toFixed(1)}% > ${(ECONOMIC_STRESS_THRESHOLD * 100).toFixed(0)}%)`;
    } else if (monthlyMortality > MORTALITY_SPIKE_THRESHOLD) {
      canDeploy = false;
      pauseReason = `Mortality spike detected (${(monthlyMortality * 100).toFixed(2)}% > ${(MORTALITY_SPIKE_THRESHOLD * 100).toFixed(1)}%)`;
    } else if (coordinationQuality < COORDINATION_QUALITY_THRESHOLD && month > 6) {
      canDeploy = false;
      pauseReason = `Coordination quality too low (${(coordinationQuality * 100).toFixed(1)}% < ${(COORDINATION_QUALITY_THRESHOLD * 100).toFixed(0)}%)`;
    }

    if (canDeploy) {
      // Deploy next wave
      waveNumber++;
      const waveStart = techIndex;
      const waveEnd = Math.min(techIndex + TECHS_PER_WAVE, prioritizedTech.length);
      const wavetech = prioritizedTech.slice(waveStart, waveEnd);

      const deployed = deployTechWave(state, wavetech, waveNumber);
      totalDeployed += deployed;
      techIndex = waveEnd;
      lastDeploymentMonth = month;

      console.log(`\nWAVE ${waveNumber} (Month ${month}): Deploying ${wavetech.length} technologies`);
      wavetech.forEach(tech => {
        console.log(`  - [${tech.category}] ${tech.name}`);
      });
      console.log(`  Economic stress: ${(economicStress * 100).toFixed(1)}%`);
      console.log(`  Coordination quality: ${(coordinationQuality * 100).toFixed(1)}%`);
      console.log(`  Monthly mortality: ${(monthlyMortality * 100).toFixed(3)}%`);
      console.log(`  Population: ${state.humanPopulationSystem.population.toFixed(3)}B`);
      console.log(`  Progress: ${techIndex}/${prioritizedTech.length} technologies (${((techIndex / prioritizedTech.length) * 100).toFixed(1)}%)`);

      // Log deployment
      deploymentLog.push({
        month,
        waveNumber,
        techsDeployed: wavetech.length,
        economicStress,
        coordinationQuality,
        monthlyMortality,
        population: state.humanPopulationSystem.population
      });
    } else {
      pausedMonths++;
      if (pausedMonths === 1 || pausedMonths % 6 === 0) {
        console.log(`\n  DEPLOYMENT PAUSED (Month ${month}): ${pauseReason}`);
        console.log(`  Waiting for conditions to improve...`);
      }
    }
  }

  // Step simulation forward
  engine.step(state);
  month = state.currentMonth;

  // Log diagnostics every 12 months
  if (month % 12 === 0 && month > 0) {
    console.log(`\n--- Year ${Math.floor(month / 12)} Summary ---`);
    console.log(`  Technologies deployed: ${totalDeployed}/${prioritizedTech.length}`);
    console.log(`  Population: ${state.humanPopulationSystem.population.toFixed(3)}B`);
    console.log(`  Cumulative mortality: ${((state.transitionManagementSystem?.transitionMortality || 0) * 100).toFixed(2)}%`);
    console.log(`  Governance stage: ${state.transitionManagementSystem?.governanceStage || 'unknown'}`);

    // Log spiral diagnostics at key intervals
    if (month % 24 === 0) {
      logSpiralActivationDiagnostics(state, month);
    }
  }

  // Check for early termination
  if (state.outcome) {
    console.log(`\nSIMULATION ENDED at month ${month}: ${state.outcome}`);
    break;
  }
}

// Deploy any remaining technologies (force deployment in final phase)
if (techIndex < prioritizedTech.length) {
  console.log(`\n=== FINAL DEPLOYMENT PUSH ===`);
  console.log(`Deploying remaining ${prioritizedTech.length - techIndex} technologies...`);

  while (techIndex < prioritizedTech.length) {
    waveNumber++;
    const waveStart = techIndex;
    const waveEnd = Math.min(techIndex + TECHS_PER_WAVE, prioritizedTech.length);
    const wavetech = prioritizedTech.slice(waveStart, waveEnd);

    const deployed = deployTechWave(state, wavetech, waveNumber);
    totalDeployed += deployed;
    techIndex = waveEnd;

    // Run a few more months to let effects settle
    for (let i = 0; i < 3 && state.currentMonth < maxMonths; i++) {
      engine.step(state);
    }
  }
}

// Run remaining months
while (state.currentMonth < maxMonths && !state.outcome) {
  engine.step(state);
}

// ============================================================================
// RESULTS
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('COORDINATED GOD MODE RESULTS');
console.log('='.repeat(80));

const finalMonth = state.currentMonth;
const finalPopulation = state.humanPopulationSystem?.population ?? 0;
const initialPopulation = 8.14; // Standard initial population
const mortalityRate = ((initialPopulation - finalPopulation) / initialPopulation) * 100;

console.log(`\nFinal Outcome: ${state.outcome || 'ONGOING'}`);
console.log(`Months Simulated: ${finalMonth}`);
console.log(`Deployment Waves: ${waveNumber}`);
console.log(`Technologies Deployed: ${totalDeployed}/${prioritizedTech.length}`);
console.log(`Paused Months: ${pausedMonths}`);

console.log(`\nPOPULATION:`);
console.log(`  Initial: ${initialPopulation.toFixed(2)}B`);
console.log(`  Final: ${finalPopulation.toFixed(2)}B`);
console.log(`  Mortality Rate: ${mortalityRate.toFixed(1)}%`);

// Compare with baseline god mode
console.log(`\nCOMPARISON WITH BASELINE GOD MODE:`);
console.log(`  Baseline god mode mortality: ~92% (N=20 Monte Carlo)`);
console.log(`  Coordinated god mode mortality: ${mortalityRate.toFixed(1)}%`);
console.log(`  Improvement: ${(92 - mortalityRate).toFixed(1)} percentage points`);

// Quality of Life breakdown
console.log('\nQUALITY OF LIFE:');
const qol = state.qualityOfLifeSystems;

const survivalAvg = (qol.survivalFundamentals.foodSecurity + qol.survivalFundamentals.waterSecurity +
                     qol.survivalFundamentals.thermalHabitability + qol.survivalFundamentals.shelterSecurity) / 4;
const tier1Avg = (qol.materialAbundance + qol.energyAvailability + qol.physicalSafety) / 3;
const tier2Avg = (qol.mentalHealth + qol.meaningAndPurpose + qol.socialConnection + qol.autonomy) / 4;
const tier3Avg = (qol.politicalFreedom + qol.informationIntegrity + qol.communityStrength + qol.culturalVitality) / 4;
const tier4Avg = (qol.healthcareQuality + qol.longevityGains + qol.diseasesBurden) / 3;
const tier5Avg = (qol.ecosystemHealth + qol.climateStability + qol.pollutionLevel) / 3;
const overallAvg = (survivalAvg + tier1Avg + tier2Avg + tier3Avg + tier4Avg + tier5Avg) / 6;

console.log(`  Survival (Tier 0):      ${(survivalAvg * 100).toFixed(1)}%`);
console.log(`  Basic Needs (Tier 1):   ${(tier1Avg * 100).toFixed(1)}%`);
console.log(`  Psychological (Tier 2): ${(tier2Avg * 100).toFixed(1)}%`);
console.log(`  Social (Tier 3):        ${(tier3Avg * 100).toFixed(1)}%`);
console.log(`  Health (Tier 4):        ${(tier4Avg * 100).toFixed(1)}%`);
console.log(`  Environmental (Tier 5): ${(tier5Avg * 100).toFixed(1)}%`);
console.log(`  OVERALL:                ${(overallAvg * 100).toFixed(1)}%`);

// Transition Management
console.log('\nTRANSITION MANAGEMENT:');
const transition = state.transitionManagementSystem;
if (transition) {
  console.log(`  Governance Stage: ${transition.governanceStage}`);
  console.log(`  Coordination Quality: ${(transition.coordinationQuality * 100).toFixed(1)}%`);
  console.log(`  Support Effectiveness: ${(transition.supportSystemEffectiveness * 100).toFixed(1)}%`);
  console.log(`  Cumulative Transition Mortality: ${(transition.transitionMortality * 100).toFixed(2)}%`);
  console.log(`  Coordination Failures: ${transition.coordinationFailures}`);
  console.log(`  Peak Deployment Speed: ${(transition.peakDeploymentSpeed * 100).toFixed(1)}%/year (Month ${transition.peakDeploymentSpeedMonth})`);
}

// Environmental State
console.log('\nENVIRONMENTAL STATE:');
if (state.climate && state.ecology) {
  console.log(`  Global temp delta: ${state.climate.globalTempDelta.toFixed(2)}C`);
  console.log(`  CO2 concentration: ${state.climate.co2Concentration.toFixed(0)} ppm`);
  console.log(`  Biodiversity loss: ${(state.ecology.extinctionRate * 100).toFixed(1)}%`);
}

// Spiral Activation Summary
console.log('\nSPIRAL ACTIVATION:');
const spirals = state.upwardSpirals;
const spiralNames = ['abundance', 'cognitive', 'democratic', 'scientific', 'meaning', 'ecological'] as const;
spiralNames.forEach(name => {
  const spiral = spirals[name];
  const status = spiral.active ? 'ACTIVE' : spiral.monthsActive > 0 ? 'Was active' : 'Never activated';
  console.log(`  ${name}: ${status} (${spiral.monthsActive} months)`);
});
console.log(`  Virtuous cascade: ${spirals.cascadeActive ? 'ACTIVE' : spirals.cascadeMonths > 0 ? 'Was active' : 'Never activated'} (${spirals.cascadeMonths} months)`);

// Deployment timeline
console.log('\nDEPLOYMENT TIMELINE:');
deploymentLog.forEach(entry => {
  console.log(`  Wave ${entry.waveNumber} (Month ${entry.month}): ${entry.techsDeployed} techs, stress ${(entry.economicStress * 100).toFixed(1)}%, pop ${entry.population.toFixed(2)}B`);
});

console.log('\n' + '='.repeat(80));
console.log('COORDINATED GOD MODE TEST COMPLETE');
console.log('='.repeat(80) + '\n');

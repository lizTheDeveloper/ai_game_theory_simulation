/**
 * Scenario Runner - Execute individual scenarios
 *
 * Created: November 10, 2025
 * Purpose: Apply scenario starting conditions and run simulation with specific tech deployment strategies
 * Context: God mode diagnostics showed tech alone insufficient - need systematic scenario testing
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { getAllTech } from '../src/simulation/techTree/comprehensiveTechTree';
import {
  ScenarioDefinition,
  ScenarioResult,
  SCENARIO_CATALOG,
  ScenarioStartingConditions,
  TechDeploymentStrategy
} from '../src/types/scenarios';
import { GameState, RNGFunction } from '../src/types/game';
import * as fs from 'fs';

/**
 * Apply scenario modifications to initial state
 */
function applyScenario(
  state: GameState,
  scenario: ScenarioDefinition,
  rng: RNGFunction
): void {
  console.log('🔧 Applying scenario modifications...');

  // CRITICAL FIX (Nov 11, 2025): Attach scenario object to state
  // ApplyScenarioPrioritiesPhase checks for state.scenario and returns early if missing
  // Type is properly defined in GameState interface (game.ts:187)
  state.scenario = scenario;

  // 1. Apply starting condition boosts
  if (scenario.startingConditions) {
    console.log('  📋 Applying starting conditions...');
    applyStartingConditions(state, scenario.startingConditions);
  }

  // 2. Deploy technologies according to strategy
  console.log('  🚀 Applying tech deployment strategy...');
  applyTechDeployment(state, scenario.techDeployment, rng);

  // 3. Apply government overrides (if specified)
  if (scenario.governmentOverrides) {
    console.log('  🏛️  Applying government overrides...');
    if (!(state as any).scenarioOverrides) {
      (state as any).scenarioOverrides = {};
    }
    (state as any).scenarioOverrides.governmentPriorities = scenario.governmentOverrides;
  }

  console.log('  ✅ Scenario modifications applied\n');
}

/**
 * Apply starting condition modifications
 */
function applyStartingConditions(
  state: GameState,
  conditions: ScenarioStartingConditions
): void {
  // Boost governance quality
  // FIX (Nov 10, 2025): Set at correct state location for spiral activation
  // Spirals check state.government.governanceQuality, not country.vDemIndicators
  if (conditions.governanceQuality !== undefined) {
    console.log(`    Governance quality boost: ${(conditions.governanceQuality * 100).toFixed(0)}%`);

    // Set governance quality fields directly (used by democratic spiral)
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
    state.government.governanceQuality.institutionalCapacity = Math.max(
      state.government.governanceQuality.institutionalCapacity,
      conditions.governanceQuality
    );
    state.government.governanceQuality.consensusBuildingEfficiency = Math.max(
      state.government.governanceQuality.consensusBuildingEfficiency,
      conditions.governanceQuality
    );
    state.government.governanceQuality.minorityProtectionStrength = Math.max(
      state.government.governanceQuality.minorityProtectionStrength,
      conditions.governanceQuality
    );
  }

  // Boost institutional capacity
  if (conditions.institutionalCapacity !== undefined) {
    console.log(`    Institutional capacity boost: ${(conditions.institutionalCapacity * 100).toFixed(0)}%`);
    const countries = (state as any).countries || {};
    for (const country of Object.values(countries)) {
      if ((country as any).government) {
        // FIX (Nov 10, 2025): Replace defensive fallback with proper check
        const currentCapacity = (country as any).government.institutionalCapacity;
        if (currentCapacity === undefined || currentCapacity === null) {
          throw new Error(
            `❌ Missing government.institutionalCapacity for country\n` +
            `   Context: applyStartingConditions (scenario setup)\n` +
            `   This field should be initialized in country setup.`
          );
        }
        (country as any).government.institutionalCapacity = Math.max(
          currentCapacity,
          conditions.institutionalCapacity
        );
      }
    }
  }

  // Boost physical safety
  if (conditions.physicalSafety !== undefined) {
    console.log(`    Physical safety boost: ${(conditions.physicalSafety * 100).toFixed(0)}%`);
    state.qualityOfLifeSystems.physicalSafety = Math.max(
      state.qualityOfLifeSystems.physicalSafety,
      conditions.physicalSafety
    );
  }

  // Boost information integrity
  if (conditions.informationIntegrity !== undefined) {
    console.log(`    Information integrity boost: ${(conditions.informationIntegrity * 100).toFixed(0)}%`);
    state.qualityOfLifeSystems.informationIntegrity = Math.max(
      state.qualityOfLifeSystems.informationIntegrity,
      conditions.informationIntegrity
    );
  }

  // Boost trust in AI
  if (conditions.trustInAI !== undefined) {
    console.log(`    Trust in AI boost: ${(conditions.trustInAI * 100).toFixed(0)}%`);
    const countries = (state as any).countries || {};
    for (const country of Object.values(countries)) {
      if ((country as any).trustInAI !== undefined) {
        (country as any).trustInAI = Math.max((country as any).trustInAI, conditions.trustInAI);
      }
    }
  }

  // Boost collective action willingness
  if (conditions.collectiveActionWillingness !== undefined) {
    console.log(`    Collective action willingness boost: ${(conditions.collectiveActionWillingness * 100).toFixed(0)}%`);
    // Apply to global cooperation metrics
    if ((state as any).cooperativeSpirals) {
      // FIX (Nov 10, 2025): Replace defensive fallback with proper check
      const current = (state as any).cooperativeSpirals.collectiveActionWillingness;
      if (current === undefined || current === null) {
        throw new Error(
          `❌ Missing cooperativeSpirals.collectiveActionWillingness\n` +
          `   Context: applyStartingConditions (scenario setup)\n` +
          `   This field should be initialized if cooperativeSpirals exists.`
        );
      }
      (state as any).cooperativeSpirals.collectiveActionWillingness = Math.max(
        current,
        conditions.collectiveActionWillingness
      );
    }
  }

  // Apply QoL dimension boosts
  if (conditions.qolBoosts) {
    console.log(`    QoL dimension boosts: ${Object.keys(conditions.qolBoosts).length} dimensions`);
    for (const [dimension, value] of Object.entries(conditions.qolBoosts)) {
      if (value !== undefined && dimension in state.qualityOfLifeSystems) {
        // FIX (Nov 10, 2025): Replace defensive fallback with proper check
        const current = (state.qualityOfLifeSystems as any)[dimension];
        if (current === undefined || current === null) {
          throw new Error(
            `❌ Missing qualityOfLifeSystems.${dimension}\n` +
            `   Context: applyStartingConditions (scenario setup)\n` +
            `   QoL dimension should be initialized in createDefaultInitialState.`
          );
        }
        (state.qualityOfLifeSystems as any)[dimension] = Math.max(
          current,
          value
        );
      }
    }
  }

  // Handle early start (modify current month)
  if (conditions.techDeploymentStartMonth !== undefined && conditions.techDeploymentStartMonth < 0) {
    console.log(`    Early start: Tech deployment ${Math.abs(conditions.techDeploymentStartMonth)} months before baseline`);
    // Note: Implementation depends on how simulation handles negative months
    // For now, we'll document this in the scenario result
    state.currentMonth = conditions.techDeploymentStartMonth;
  }

  // FIX (Nov 10, 2025): Initialize missing spiral-required fields for god mode scenarios
  // These fields are required for spiral activation but not initialized in default state
  console.log('  🔧 Initializing spiral-required fields for god mode scenario...');

  // Workflow adaptation (scientific spiral requires >= 0.25)
  // Default: 0.21 (MDPI 2024), boost to 0.3 for god mode activation
  if (!state.society.workflowAdaptation || state.society.workflowAdaptation < 0.25) {
    state.society.workflowAdaptation = 0.3;
    console.log(`    workflowAdaptation: ${state.society.workflowAdaptation.toFixed(2)} (above scientific spiral threshold)`);
  }

  // Cultural adaptation (meaning spiral requires > 0.7)
  // Default: 0.10 (minimal post-work culture), boost to 0.75 for god mode activation
  if (state.socialAccumulation.culturalAdaptation < 0.7) {
    state.socialAccumulation.culturalAdaptation = 0.75;
    console.log(`    culturalAdaptation: ${state.socialAccumulation.culturalAdaptation.toFixed(2)} (above meaning spiral threshold)`);
  }

  // Economic transition stage (abundance spiral requires >= 3)
  // Default: 0 (capitalist), boost to 3 (post-scarcity) for god mode activation
  if (state.globalMetrics.economicTransitionStage < 3) {
    state.globalMetrics.economicTransitionStage = 3;
    console.log(`    economicTransitionStage: ${state.globalMetrics.economicTransitionStage} (post-scarcity stage)`);
  }

  // Unemployment level (abundance spiral requires > 0.6)
  // Default: 0.049 (ILO 2024), boost to 0.7 for god mode activation
  if (state.society.unemploymentLevel < 0.6) {
    state.society.unemploymentLevel = 0.7;
    console.log(`    unemploymentLevel: ${state.society.unemploymentLevel.toFixed(2)} (above abundance spiral threshold)`);
  }

  console.log('  ✅ Spiral-required fields initialized\n');
}

/**
 * Apply tech deployment strategy
 */
function applyTechDeployment(
  state: GameState,
  strategy: TechDeploymentStrategy,
  rng: RNGFunction
): void {
  const allTech = getAllTech();

  // Get specific techs to deploy (default: all)
  const techsToDeploy = strategy.specificTechs && strategy.specificTechs.length > 0
    ? allTech.filter(t => strategy.specificTechs!.includes(t.id))
    : allTech;

  console.log(`    Strategy: ${strategy.mode}`);
  console.log(`    Technologies: ${techsToDeploy.length}`);

  switch (strategy.mode) {
    case 'immediate':
      // Deploy all tech at month 0 (god mode style)
      deployAllTech(state, techsToDeploy, strategy.deploymentLevel || 1.0);
      break;

    case 'sequenced':
      // Deploy in tier waves (TIER 0 → 1 → 2 → 3 → 4)
      if (!strategy.sequencedConfig) {
        throw new Error('❌ sequenced mode requires sequencedConfig');
      }
      scheduleSequencedDeployment(state, techsToDeploy, strategy.sequencedConfig);
      break;

    case 'adaptive':
      // Store adaptive thresholds in state for phase to execute
      if (!strategy.adaptiveConfig) {
        throw new Error('❌ adaptive mode requires adaptiveConfig');
      }
      scheduleAdaptiveDeployment(state, techsToDeploy, strategy.adaptiveConfig);
      break;

    case 'prioritized':
      // Deploy by category order
      if (!strategy.prioritizedConfig) {
        throw new Error('❌ prioritized mode requires prioritizedConfig');
      }
      schedulePrioritizedDeployment(state, techsToDeploy, strategy.prioritizedConfig);
      break;

    default:
      throw new Error(`❌ Unknown tech deployment mode: ${strategy.mode}`);
  }
}

/**
 * Deploy all technologies immediately at specified level (god mode style)
 * Copied from godModeTest.ts
 */
function deployAllTech(
  state: GameState,
  technologies: any[],
  deploymentLevel: number
): void {
  console.log(`    Deploying ${technologies.length} technologies at ${(deploymentLevel * 100).toFixed(0)}%...`);

  // First, unlock all tech
  for (const tech of technologies) {
    if (!state.techTreeState.unlockedTech.includes(tech.id)) {
      state.techTreeState.unlockedTech.push(tech.id);
      state.techTreeState.techUnlockedCount++;
    }
  }

  // Initialize global deployment array if needed
  if (!state.techTreeState.regionalDeployment['global']) {
    state.techTreeState.regionalDeployment['global'] = [];
  }

  // Deploy all tech at specified level in global region
  for (const tech of technologies) {
    // Check if already deployed (e.g., deployed_2025 tech)
    const existing = state.techTreeState.regionalDeployment['global'].find(d => d.techId === tech.id);

    if (existing) {
      // Update existing deployment to target level
      existing.deploymentLevel = deploymentLevel;
      if (!existing.deployedBy.includes('scenario')) {
        existing.deployedBy.push('scenario');
      }
    } else {
      // Add new deployment
      state.techTreeState.regionalDeployment['global'].push({
        techId: tech.id,
        region: 'global',
        deploymentLevel: deploymentLevel,
        monthlyInvestment: 0,
        totalInvested: tech.deploymentCost,
        deployedBy: ['scenario'],
        effects: tech.effects,
      });
      state.techTreeState.techDeployedCount++;
    }
  }

  console.log(`    ✅ ${state.techTreeState.techDeployedCount} technologies deployed`);
}

/**
 * Schedule sequenced deployment (tier waves)
 * NOTE: This stores deployment schedule in state for phase to execute
 */
function scheduleSequencedDeployment(
  state: GameState,
  technologies: any[],
  config: { gapMonths: number; tierOrder?: number[] }
): void {
  const tierOrder = config.tierOrder || [0, 1, 2, 3, 4];
  console.log(`    Tier order: ${tierOrder.join(' → ')}`);
  console.log(`    Gap between tiers: ${config.gapMonths} months`);

  // Classify technologies into tiers based on minAICapability
  // TIER 0 (<1.0), TIER 1 (1.0-2.0), TIER 2 (2.0-3.0), TIER 3 (3.0-4.0), TIER 4 (≥4.0)
  const tierMap = new Map<number, string[]>();
  for (const tier of tierOrder) {
    tierMap.set(tier, []);
  }

  for (const tech of technologies) {
    const minCap = tech.minAICapability || 0;
    let tier: number;
    if (minCap < 1.0) tier = 0;
    else if (minCap < 2.0) tier = 1;
    else if (minCap < 3.0) tier = 2;
    else if (minCap < 4.0) tier = 3;
    else tier = 4;

    if (tierMap.has(tier)) {
      tierMap.get(tier)!.push(tech.id);
    }
  }

  // Create deployment schedule
  const scheduledDeployments: Array<{ techId: string; deployMonth: number; deployed: boolean }> = [];

  for (let i = 0; i < tierOrder.length; i++) {
    const tier = tierOrder[i];
    const techIds = tierMap.get(tier) || [];
    const deployMonth = i * config.gapMonths;

    for (const techId of techIds) {
      scheduledDeployments.push({ techId, deployMonth, deployed: false });
    }

    console.log(`    TIER ${tier}: ${techIds.length} techs at month ${deployMonth}`);
  }

  // Store schedule in state
  state.techDeploymentSchedule = {
    mode: 'sequenced',
    scheduledDeployments,
    deploymentLevel: 1.0,
    deploymentInterval: config.gapMonths,
  };

  console.log(`    ✅ Sequenced deployment schedule created: ${scheduledDeployments.length} techs over ${(tierOrder.length - 1) * config.gapMonths} months`);
}

/**
 * Schedule adaptive deployment (condition-based)
 * NOTE: This stores thresholds in state for phase to execute
 */
function scheduleAdaptiveDeployment(
  state: GameState,
  technologies: any[],
  config: {
    governanceThreshold?: number;
    safetyThreshold?: number;
    maxTechsPerMonth?: number;
  }
): void {
  console.log(`    Governance threshold: ${config.governanceThreshold || 'N/A'}`);
  console.log(`    Safety threshold: ${config.safetyThreshold || 'N/A'}`);
  console.log(`    Max techs/month: ${config.maxTechsPerMonth || 'unlimited'}`);

  // TODO: Store adaptive config in state for phase to execute
  // For now, we'll just deploy all tech immediately (Phase 2.2 will implement adaptive deployment)
  console.log(`    ⚠️  WARNING: Adaptive deployment not yet implemented - deploying immediately as fallback`);
  deployAllTech(state, technologies, 1.0);
}

/**
 * Schedule prioritized deployment (category order)
 * NOTE: This stores priority schedule in state for phase to execute
 */
function schedulePrioritizedDeployment(
  state: GameState,
  technologies: any[],
  config: { priorities: string[]; gapMonths: number }
): void {
  console.log(`    Priority order: ${config.priorities.join(' → ')}`);
  console.log(`    Gap between priorities: ${config.gapMonths} months`);

  // TODO: Store priority schedule in state for phase to execute
  // For now, we'll just deploy all tech immediately (Phase 2.2 will implement prioritized deployment)
  console.log(`    ⚠️  WARNING: Prioritized deployment not yet implemented - deploying immediately as fallback`);
  deployAllTech(state, technologies, 1.0);
}

/**
 * Extract active upward spirals from state
 */
function extractActiveSpirals(state: GameState): string[] {
  const activeSpirals: string[] = [];

  if (!state.upwardSpirals) return activeSpirals;

  for (const [name, spiral] of Object.entries(state.upwardSpirals)) {
    // Skip cascade metadata fields
    if (name === 'cascadeActive' || name === 'cascadeStrength' || name === 'cascadeStartMonth') {
      continue;
    }

    const s = spiral as any;
    if (s && typeof s === 'object' && 'active' in s && s.active) {
      activeSpirals.push(name);
    }
  }

  return activeSpirals;
}

/**
 * Calculate average QoL metrics from tiered structure
 */
function extractQoLMetrics(state: GameState): {
  survivalAvg: number;
  basicNeedsAvg: number;
  psychologicalAvg: number;
  socialAvg: number;
  healthAvg: number;
  environmentalAvg: number;
  overallAvg: number;
} {
  const qol = state.qualityOfLifeSystems;

  const survivalAvg = (
    qol.survivalFundamentals.foodSecurity +
    qol.survivalFundamentals.waterSecurity +
    qol.survivalFundamentals.thermalHabitability +
    qol.survivalFundamentals.shelterSecurity
  ) / 4;

  const basicNeedsAvg = (
    qol.materialAbundance +
    qol.energyAvailability +
    qol.physicalSafety
  ) / 3;

  const psychologicalAvg = (
    qol.mentalHealth +
    qol.meaningAndPurpose +
    qol.socialConnection +
    qol.autonomy
  ) / 4;

  const socialAvg = (
    qol.politicalFreedom +
    qol.informationIntegrity +
    qol.communityStrength +
    qol.culturalVitality
  ) / 4;

  const healthAvg = (
    qol.healthcareQuality +
    qol.longevityGains +
    qol.diseasesBurden
  ) / 3;

  const environmentalAvg = (
    qol.ecosystemHealth +
    qol.climateStability +
    qol.pollutionLevel
  ) / 3;

  const overallAvg = (
    survivalAvg +
    basicNeedsAvg +
    psychologicalAvg +
    socialAvg +
    healthAvg +
    environmentalAvg
  ) / 6;

  return {
    survivalAvg,
    basicNeedsAvg,
    psychologicalAvg,
    socialAvg,
    healthAvg,
    environmentalAvg,
    overallAvg
  };
}

/**
 * Extract environmental metrics
 * FIX (Nov 11, 2025): Use correct state paths after Oct 2025 refactor
 * - Temperature: state.resourceEconomy.co2.temperatureAnomaly (not state.climate.globalTempDelta)
 * - CO2: state.resourceEconomy.co2.atmosphericCO2 (not state.climate.co2Concentration)
 * - Extinction: state.biosphereIntegrityIndex.currentExtinctionRate (not state.ecology.extinctionRate)
 */
function extractEnvironmentMetrics(state: GameState): {
  globalTempDelta: number;
  co2Concentration: number;
  extinctionRate: number;
} {
  // Verify resource economy system exists
  if (!state.resourceEconomy || !state.resourceEconomy.co2) {
    throw new Error(
      `❌ Missing state.resourceEconomy.co2 in extractEnvironmentMetrics\n` +
      `   Month: ${state.currentMonth}\n` +
      `   Resource economy should always exist (initialized in initialization.ts).\n` +
      `   Check for state corruption or initialization bug.`
    );
  }

  // Verify biosphere integrity index exists
  if (!state.biosphereIntegrityIndex) {
    throw new Error(
      `❌ Missing state.biosphereIntegrityIndex in extractEnvironmentMetrics\n` +
      `   Month: ${state.currentMonth}\n` +
      `   Biosphere integrity index should always exist (initialized in initialization.ts).\n` +
      `   Check for state corruption or initialization bug.`
    );
  }

  const co2System = state.resourceEconomy.co2;
  const biosphere = state.biosphereIntegrityIndex;

  // Validate temperature anomaly
  if (co2System.temperatureAnomaly === undefined || co2System.temperatureAnomaly === null) {
    throw new Error(
      `❌ Missing resourceEconomy.co2.temperatureAnomaly in extractEnvironmentMetrics\n` +
      `   Month: ${state.currentMonth}\n` +
      `   Check ResourceEconomyPhase or ClimateSystemPhase initialization.`
    );
  }

  // Validate atmospheric CO2
  if (co2System.atmosphericCO2 === undefined || co2System.atmosphericCO2 === null) {
    throw new Error(
      `❌ Missing resourceEconomy.co2.atmosphericCO2 in extractEnvironmentMetrics\n` +
      `   Month: ${state.currentMonth}\n` +
      `   Check ResourceEconomyPhase initialization.`
    );
  }

  // Validate extinction rate
  if (biosphere.currentExtinctionRate === undefined || biosphere.currentExtinctionRate === null) {
    throw new Error(
      `❌ Missing biosphereIntegrityIndex.currentExtinctionRate in extractEnvironmentMetrics\n` +
      `   Month: ${state.currentMonth}\n` +
      `   Check BiospherePhase initialization.`
    );
  }

  return {
    globalTempDelta: co2System.temperatureAnomaly,
    co2Concentration: co2System.atmosphericCO2,
    extinctionRate: biosphere.currentExtinctionRate
  };
}

/**
 * Count positive tipping point cascades
 * FIX (Nov 10, 2025): Fail loudly if state structure incorrect
 */
function countTippingPointCascades(state: GameState): number {
  if (!state.positiveTippingPoints) {
    throw new Error(
      `❌ Missing state.positiveTippingPoints in countTippingPointCascades\n` +
      `   Month: ${state.currentMonth}\n` +
      `   This state should always exist (initialized in createDefaultInitialState).`
    );
  }
  if (!state.positiveTippingPoints.triggeredCascades) {
    throw new Error(
      `❌ Missing positiveTippingPoints.triggeredCascades array\n` +
      `   Month: ${state.currentMonth}\n` +
      `   This array should be initialized (even if empty) in createDefaultInitialState.`
    );
  }
  return state.positiveTippingPoints.triggeredCascades.length;
}

/**
 * Extract list of breached planetary boundaries
 */
function extractBoundariesBreached(state: GameState): string[] {
  const breached: string[] = [];

  if (!(state as any).planetaryBoundariesSystem) return breached;

  const boundaries = (state as any).planetaryBoundariesSystem;

  if (boundaries.climateChange && boundaries.climateChange.breached) {
    breached.push('Climate Change');
  }
  if (boundaries.biosphereIntegrity && boundaries.biosphereIntegrity.breached) {
    breached.push('Biosphere Integrity');
  }
  if (boundaries.landSystemChange && boundaries.landSystemChange.breached) {
    breached.push('Land System Change');
  }
  if (boundaries.freshwaterUse && boundaries.freshwaterUse.breached) {
    breached.push('Freshwater Use');
  }
  if (boundaries.biogeochemicalFlows && boundaries.biogeochemicalFlows.breached) {
    breached.push('Biogeochemical Flows');
  }
  if (boundaries.oceanAcidification && boundaries.oceanAcidification.breached) {
    breached.push('Ocean Acidification');
  }
  if (boundaries.atmosphericAerosolLoading && boundaries.atmosphericAerosolLoading.breached) {
    breached.push('Atmospheric Aerosol Loading');
  }
  if (boundaries.novelEntities && boundaries.novelEntities.breached) {
    breached.push('Novel Entities');
  }
  if (boundaries.stratosphericOzoneDepletion && boundaries.stratosphericOzoneDepletion.breached) {
    breached.push('Stratospheric Ozone Depletion');
  }

  return breached;
}

/**
 * Extract ScenarioResult from simulation result
 */
function extractScenarioResult(
  scenario: ScenarioDefinition,
  result: any,
  seed: number,
  maxMonths: number
): ScenarioResult {
  const finalState = result.finalState;

  // FIX (Nov 10, 2025): Extinction case is the ONLY place where defensive zeros are valid
  // When simulation ends catastrophically, there IS no state - these zeros represent reality
  if (!finalState) {
    // Game ended early (extinction/collapse) - this is expected for catastrophic outcomes
    // Use monthsSimulated from result if available, otherwise fail
    if (result.monthsSimulated === undefined) {
      throw new Error(
        `❌ Missing result.monthsSimulated in extractScenarioResult\n` +
        `   Scenario: ${scenario.id}, Seed: ${seed}\n` +
        `   No finalState but also no monthsSimulated.\n` +
        `   This indicates engine.run() returned incomplete result.`
      );
    }

    return {
      scenarioId: scenario.id,
      seed,
      outcome: result.outcome || 'EXTINCTION',
      monthsSimulated: result.monthsSimulated,
      spiralActivation: {
        activeUpwardSpirals: [],
        cascadeActive: false,
        cascadeStrength: 0,
        trustCascadesTriggered: 0,
        tippingPointCascades: 0
      },
      finalQoL: {
        survivalAvg: 0,
        basicNeedsAvg: 0,
        psychologicalAvg: 0,
        socialAvg: 0,
        healthAvg: 0,
        environmentalAvg: 0,
        overallAvg: 0
      },
      finalEnvironment: {
        globalTempDelta: 0,
        co2Concentration: 0,
        extinctionRate: 1.0
      },
      finalPopulation: 0,
      boundariesBreached: []
    };
  }

  // FIX (Nov 10, 2025): With valid finalState, fail loudly if required fields missing
  // No defensive fallbacks - if these fields don't exist, that's a bug to fix

  if (!finalState.upwardSpirals) {
    throw new Error(
      `❌ Missing finalState.upwardSpirals in extractScenarioResult\n` +
      `   Scenario: ${scenario.id}, Seed: ${seed}, Month: ${finalState.currentMonth}\n` +
      `   This state should exist (initialized in createDefaultInitialState).`
    );
  }
  if (finalState.upwardSpirals.cascadeActive === undefined) {
    throw new Error(
      `❌ Missing upwardSpirals.cascadeActive in extractScenarioResult\n` +
      `   Scenario: ${scenario.id}, Seed: ${seed}, Month: ${finalState.currentMonth}`
    );
  }
  if (finalState.upwardSpirals.cascadeStrength === undefined) {
    throw new Error(
      `❌ Missing upwardSpirals.cascadeStrength in extractScenarioResult\n` +
      `   Scenario: ${scenario.id}, Seed: ${seed}, Month: ${finalState.currentMonth}`
    );
  }
  if (!finalState.history) {
    throw new Error(
      `❌ Missing finalState.history in extractScenarioResult\n` +
      `   Scenario: ${scenario.id}, Seed: ${seed}, Month: ${finalState.currentMonth}`
    );
  }
  if (!finalState.history.cooperativeSpirals) {
    throw new Error(
      `❌ Missing history.cooperativeSpirals array in extractScenarioResult\n` +
      `   Scenario: ${scenario.id}, Seed: ${seed}, Month: ${finalState.currentMonth}`
    );
  }
  if (!finalState.humanPopulationSystem || finalState.humanPopulationSystem.population === undefined) {
    throw new Error(
      `❌ Missing humanPopulationSystem.population in extractScenarioResult\n` +
      `   Scenario: ${scenario.id}, Seed: ${seed}, Month: ${finalState.currentMonth}\n` +
      `   Check initialization or phase corruption.`
    );
  }

  return {
    scenarioId: scenario.id,
    seed,
    outcome: result.outcome || finalState.outcome || 'UNKNOWN',
    monthsSimulated: finalState.currentMonth,
    spiralActivation: {
      activeUpwardSpirals: extractActiveSpirals(finalState),
      cascadeActive: finalState.upwardSpirals.cascadeActive,
      cascadeStrength: finalState.upwardSpirals.cascadeStrength,
      trustCascadesTriggered: finalState.history.cooperativeSpirals.length,
      tippingPointCascades: countTippingPointCascades(finalState)
    },
    finalQoL: extractQoLMetrics(finalState),
    finalEnvironment: extractEnvironmentMetrics(finalState),
    finalPopulation: finalState.humanPopulationSystem.population,
    boundariesBreached: extractBoundariesBreached(finalState)
  };
}

/**
 * Print scenario summary
 */
function printScenarioSummary(result: ScenarioResult): void {
  console.log('\n' + '='.repeat(80));
  console.log('📊 SCENARIO RESULTS');
  console.log('='.repeat(80));

  console.log(`\n🎯 Final Outcome: ${result.outcome}`);
  console.log(`📅 Months Simulated: ${result.monthsSimulated}`);
  console.log(`🌍 Final Population: ${result.finalPopulation.toFixed(2)}B`);

  console.log('\n🔄 Spiral Activation:');
  console.log(`  Active spirals: ${result.spiralActivation.activeUpwardSpirals.length}`);
  if (result.spiralActivation.activeUpwardSpirals.length > 0) {
    console.log(`    ${result.spiralActivation.activeUpwardSpirals.join(', ')}`);
  }
  console.log(`  Cascade active: ${result.spiralActivation.cascadeActive ? '✅ YES' : '❌ NO'}`);
  console.log(`  Cascade strength: ${result.spiralActivation.cascadeStrength.toFixed(2)}`);
  console.log(`  Trust cascades: ${result.spiralActivation.trustCascadesTriggered}`);
  console.log(`  Tipping point cascades: ${result.spiralActivation.tippingPointCascades}`);

  console.log('\n📈 Quality of Life (by tier):');
  console.log(`  Survival:      ${(result.finalQoL.survivalAvg * 100).toFixed(1)}%`);
  console.log(`  Basic Needs:   ${(result.finalQoL.basicNeedsAvg * 100).toFixed(1)}%`);
  console.log(`  Psychological: ${(result.finalQoL.psychologicalAvg * 100).toFixed(1)}%`);
  console.log(`  Social:        ${(result.finalQoL.socialAvg * 100).toFixed(1)}%`);
  console.log(`  Health:        ${(result.finalQoL.healthAvg * 100).toFixed(1)}%`);
  console.log(`  Environmental: ${(result.finalQoL.environmentalAvg * 100).toFixed(1)}%`);
  console.log(`  OVERALL:       ${(result.finalQoL.overallAvg * 100).toFixed(1)}%`);

  console.log('\n🌍 Environmental State:');
  console.log(`  Temperature delta: ${result.finalEnvironment.globalTempDelta.toFixed(2)}°C`);
  console.log(`  CO2 concentration: ${result.finalEnvironment.co2Concentration.toFixed(0)} ppm`);
  console.log(`  Extinction rate: ${(result.finalEnvironment.extinctionRate * 100).toFixed(1)}%`);

  console.log('\n🚨 Planetary Boundaries Breached:');
  if (result.boundariesBreached.length === 0) {
    console.log(`  None ✅`);
  } else {
    for (const boundary of result.boundariesBreached) {
      console.log(`  - ${boundary}`);
    }
  }

  console.log('\n' + '='.repeat(80));
}

/**
 * Main execution function
 */
function runScenario(
  scenarioId: string,
  seed: number,
  maxMonths: number = 360
): ScenarioResult {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🎭 SCENARIO TEST: ${scenarioId}`);
  console.log('='.repeat(80));
  console.log(`Seed: ${seed}`);
  console.log(`Max months: ${maxMonths}\n`);

  // Load scenario
  const scenario = SCENARIO_CATALOG[scenarioId as keyof typeof SCENARIO_CATALOG];
  if (!scenario) {
    throw new Error(`❌ Unknown scenario: ${scenarioId}`);
  }

  console.log(`📋 Scenario: ${scenario.name}`);
  console.log(`📝 Description: ${scenario.description}`);
  console.log(`🔬 Hypothesis: ${scenario.hypothesis}\n`);

  // Create initial state with proper RNG
  // CRITICAL: Must create engine first to get deterministic RNG
  const tempEngine = new SimulationEngine({ seed });
  const rng = tempEngine.getRNG().next.bind(tempEngine.getRNG());
  const state = createDefaultInitialState(rng);

  // Attach scenario to state (so ApplyScenarioPrioritiesPhase can read it)
  // FIX (Nov 11, 2025): This was missing, causing all government priority scenarios to be ignored
  (state as any).scenario = scenario;

  // Apply scenario modifications (cast to mutable type for runtime use)
  applyScenario(state, scenario as ScenarioDefinition, rng);

  // Run simulation
  console.log('\n' + '='.repeat(80));
  console.log('▶️  Running simulation...');
  console.log('='.repeat(80) + '\n');

  const engine = new SimulationEngine({ seed });
  const result = engine.run(state, { maxMonths, checkActualOutcomes: true });

  // Extract scenario result
  const scenarioResult = extractScenarioResult(
    scenario as ScenarioDefinition,
    result,
    seed,
    maxMonths
  );

  // Print summary
  printScenarioSummary(scenarioResult);

  return scenarioResult;
}

// CLI entry point
if (require.main === module) {
  const scenarioId = process.argv[2];
  const seed = process.argv[3] ? parseInt(process.argv[3]) : 42;
  const maxMonths = process.argv[4] ? parseInt(process.argv[4]) : 360;

  if (!scenarioId) {
    console.error('❌ Usage: npx tsx scripts/scenarioRunner.ts <scenarioId> [seed] [maxMonths]');
    console.error('\nAvailable scenarios:');
    for (const id of Object.keys(SCENARIO_CATALOG)) {
      const scenario = SCENARIO_CATALOG[id as keyof typeof SCENARIO_CATALOG];
      console.error(`  ${id.padEnd(25)} - ${scenario.name}`);
    }
    process.exit(1);
  }

  const result = runScenario(scenarioId, seed, maxMonths);

  // Save result to file
  const outputDir = 'logs/scenario_results';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${outputDir}/${scenarioId}_seed${seed}_${timestamp}.json`;
  fs.writeFileSync(filename, JSON.stringify(result, null, 2));

  console.log(`\n💾 Result saved to: ${filename}\n`);
}

/**
 * Run scenario with a custom ScenarioDefinition object (not from catalog)
 * Used by deployment rate sweep and other experiments that modify scenario parameters
 */
function runScenarioWithDef(
  scenario: ScenarioDefinition,
  seed: number,
  maxMonths: number = 360
): ScenarioResult {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🎭 SCENARIO TEST: ${scenario.id}`);
  console.log('='.repeat(80));
  console.log(`Seed: ${seed}`);
  console.log(`Max months: ${maxMonths}\n`);

  console.log(`📋 Scenario: ${scenario.name}`);
  console.log(`📝 Description: ${scenario.description}`);
  console.log(`🔬 Hypothesis: ${scenario.hypothesis}\n`);

  // Create initial state with proper RNG
  // CRITICAL: Must create engine first to get deterministic RNG
  const tempEngine = new SimulationEngine({ seed });
  const rng = tempEngine.getRNG().next.bind(tempEngine.getRNG());
  const state = createDefaultInitialState(rng);

  // Attach scenario to state (so ApplyScenarioPrioritiesPhase can read it)
  (state as any).scenario = scenario;

  // Apply scenario modifications
  applyScenario(state, scenario, rng);

  // Run simulation
  console.log('\n' + '='.repeat(80));
  console.log('▶️  Running simulation...');
  console.log('='.repeat(80) + '\n');

  const engine = new SimulationEngine({ seed });
  const result = engine.run(state, { maxMonths, checkActualOutcomes: true });

  // Extract scenario result
  const scenarioResult = extractScenarioResult(
    scenario,
    result,
    seed,
    maxMonths
  );

  // Print summary
  printScenarioSummary(scenarioResult);

  return scenarioResult;
}

// Export for use by compareScenarios.ts and deploymentRateSweep.ts
export { runScenario, runScenarioWithDef, extractScenarioResult };

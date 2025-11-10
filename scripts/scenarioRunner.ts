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
  // Boost governance quality across all countries
  if (conditions.governanceQuality !== undefined) {
    console.log(`    Governance quality boost: ${(conditions.governanceQuality * 100).toFixed(0)}%`);
    const countries = (state as any).countries || {};
    for (const country of Object.values(countries)) {
      // Apply to V-Dem indicators (scale 0-1)
      if ((country as any).vDemIndicators) {
        (country as any).vDemIndicators.v2x_polyarchy = Math.max(
          (country as any).vDemIndicators.v2x_polyarchy || 0,
          conditions.governanceQuality
        );
        (country as any).vDemIndicators.v2x_liberal = Math.max(
          (country as any).vDemIndicators.v2x_liberal || 0,
          conditions.governanceQuality
        );
        (country as any).vDemIndicators.v2x_partipdem = Math.max(
          (country as any).vDemIndicators.v2x_partipdem || 0,
          conditions.governanceQuality
        );
        (country as any).vDemIndicators.v2x_delibdem = Math.max(
          (country as any).vDemIndicators.v2x_delibdem || 0,
          conditions.governanceQuality
        );
        (country as any).vDemIndicators.v2x_egaldem = Math.max(
          (country as any).vDemIndicators.v2x_egaldem || 0,
          conditions.governanceQuality
        );
      }
    }
  }

  // Boost institutional capacity
  if (conditions.institutionalCapacity !== undefined) {
    console.log(`    Institutional capacity boost: ${(conditions.institutionalCapacity * 100).toFixed(0)}%`);
    const countries = (state as any).countries || {};
    for (const country of Object.values(countries)) {
      if ((country as any).government) {
        (country as any).government.institutionalCapacity = Math.max(
          (country as any).government.institutionalCapacity || 0,
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
      (state as any).cooperativeSpirals.collectiveActionWillingness = Math.max(
        (state as any).cooperativeSpirals.collectiveActionWillingness || 0,
        conditions.collectiveActionWillingness
      );
    }
  }

  // Apply QoL dimension boosts
  if (conditions.qolBoosts) {
    console.log(`    QoL dimension boosts: ${Object.keys(conditions.qolBoosts).length} dimensions`);
    for (const [dimension, value] of Object.entries(conditions.qolBoosts)) {
      if (value !== undefined && dimension in state.qualityOfLifeSystems) {
        (state.qualityOfLifeSystems as any)[dimension] = Math.max(
          (state.qualityOfLifeSystems as any)[dimension] || 0,
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

  // TODO: Store deployment schedule in state for phase to execute
  // For now, we'll just deploy all tech immediately (Phase 2.2 will implement scheduled deployment)
  console.log(`    ⚠️  WARNING: Sequenced deployment not yet implemented - deploying immediately as fallback`);
  deployAllTech(state, technologies, 1.0);
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
 */
function extractEnvironmentMetrics(state: GameState): {
  globalTempDelta: number;
  co2Concentration: number;
  extinctionRate: number;
} {
  return {
    globalTempDelta: (state as any).climate?.globalTempDelta || 0,
    co2Concentration: (state as any).climate?.co2Concentration || 0,
    extinctionRate: (state as any).ecology?.extinctionRate || 0
  };
}

/**
 * Count positive tipping point cascades
 */
function countTippingPointCascades(state: GameState): number {
  if (!state.positiveTippingPoints) return 0;
  return state.positiveTippingPoints.triggeredCascades?.length || 0;
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

  if (!finalState) {
    // Game ended early (extinction/collapse)
    return {
      scenarioId: scenario.id,
      seed,
      outcome: result.outcome || 'EXTINCTION',
      monthsSimulated: result.monthsSimulated || 0,
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

  return {
    scenarioId: scenario.id,
    seed,
    outcome: result.outcome || finalState.outcome || 'UNKNOWN',
    monthsSimulated: finalState.currentMonth,
    spiralActivation: {
      activeUpwardSpirals: extractActiveSpirals(finalState),
      cascadeActive: finalState.upwardSpirals?.cascadeActive || false,
      cascadeStrength: finalState.upwardSpirals?.cascadeStrength || 0,
      trustCascadesTriggered: finalState.history?.cooperativeSpirals?.length || 0,
      tippingPointCascades: countTippingPointCascades(finalState)
    },
    finalQoL: extractQoLMetrics(finalState),
    finalEnvironment: extractEnvironmentMetrics(finalState),
    finalPopulation: finalState.humanPopulationSystem?.population || 0,
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

// Export for use by compareScenarios.ts
export { runScenario, extractScenarioResult };

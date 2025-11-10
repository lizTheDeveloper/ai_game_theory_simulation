/**
 * Quick test for Phase 3 scenario fix
 * Tests single scenario (climate-first) with seed 42
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { SCENARIO_CATALOG, ScenarioDefinition } from '../src/types/scenarios';
import { GameState, RNGFunction } from '../src/types/game';
import { getAllTech } from '../src/simulation/techTree/comprehensiveTechTree';

function applyScenario(
  state: GameState,
  scenario: ScenarioDefinition,
  rng: RNGFunction
): void {
  // Store scenario definition in state
  state.scenario = scenario;

  // Apply starting condition boosts
  if (scenario.startingConditions) {
    applyStartingConditions(state, scenario.startingConditions);
  }

  // Deploy technologies according to strategy
  applyTechDeployment(state, scenario.techDeployment, rng);
}

function applyStartingConditions(
  state: GameState,
  conditions: import('../src/types/scenarios').ScenarioStartingConditions
): void {
  if (conditions.governanceQuality !== undefined) {
    state.government.governanceQuality.decisionQuality = Math.max(
      state.government.governanceQuality.decisionQuality,
      conditions.governanceQuality
    );
  }
}

function applyTechDeployment(
  state: GameState,
  strategy: import('../src/types/scenarios').TechDeploymentStrategy,
  rng: RNGFunction
): void {
  const technologies = getAllTech();

  if (strategy.mode === 'immediate') {
    const deploymentLevel = strategy.deploymentLevel ?? 1.0;

    // Initialize global deployment array if needed
    if (!state.techTreeState.regionalDeployment['global']) {
      state.techTreeState.regionalDeployment['global'] = [];
    }

    for (const tech of technologies) {
      // Unlock tech if not already unlocked
      if (!state.techTreeState.unlockedTech.includes(tech.id)) {
        state.techTreeState.unlockedTech.push(tech.id);
        state.techTreeState.techUnlockedCount++;
      }

      // Add to regional deployment (global region)
      state.techTreeState.regionalDeployment['global'].push({
        techId: tech.id,
        region: 'global',
        deploymentLevel,
        monthlyInvestment: 0,
        totalInvested: tech.deploymentCost * deploymentLevel,
        deployedBy: ['scenario'],
        effects: tech.effects,
      });
      state.techTreeState.techDeployedCount++;
    }
  }
}

async function main() {
  console.log('🧪 Testing Phase 3 scenario fix...\n');

  const scenarioId = 'climate-first';
  const seed = 42;
  const maxMonths = 12; // Just 1 year for quick test

  console.log(`Scenario: ${scenarioId}`);
  console.log(`Seed: ${seed}`);
  console.log(`Max months: ${maxMonths}\n`);

  const scenario = SCENARIO_CATALOG[scenarioId as keyof typeof SCENARIO_CATALOG];
  if (!scenario) {
    throw new Error(`❌ Unknown scenario: ${scenarioId}`);
  }

  // Create initial state
  const tempEngine = new SimulationEngine({ seed });
  const rng = tempEngine.getRNG().next.bind(tempEngine.getRNG());
  const state = createDefaultInitialState(rng);

  console.log('✅ Initial state created');

  // Apply scenario modifications
  console.log('📝 Applying scenario...');
  applyScenario(state, scenario as ScenarioDefinition, rng);

  console.log(`✅ Scenario applied`);
  console.log(`   Unlocked tech: ${state.techTreeState.techUnlockedCount}`);
  console.log(`   Deployed tech: ${state.techTreeState.techDeployedCount}`);
  console.log(`   Regional deployments: ${Object.keys(state.techTreeState.regionalDeployment).length} regions\n`);

  // Run simulation
  console.log('🚀 Running simulation...');
  const engine = new SimulationEngine({ seed });
  const result = engine.run(state, { maxMonths, checkActualOutcomes: true });

  console.log(`\n✅ Simulation complete!`);
  console.log(`   DEBUG: result.summary =`, result.summary);
  console.log(`   Outcome: ${result.summary?.finalOutcome}`);
  console.log(`   Months simulated: ${result.summary?.totalMonths}`);
  console.log(`   Final population: ${(result.finalState.humanPopulationSystem.population / 1e9).toFixed(2)}B`);

  console.log('\n✅ TEST PASSED - No crashes!\n');
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ FATAL ERROR:', error);
    process.exit(1);
  });
}

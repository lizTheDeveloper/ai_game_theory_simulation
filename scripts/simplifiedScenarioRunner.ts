/**
 * Simplified Scenario Runner - Phase 3 Policy Packages
 *
 * Created: November 11, 2025
 * Purpose: Run policy package scenarios without complex result extraction
 * Context: scenarioRunner.ts has bugs with history.cooperativeSpirals extraction
 *
 * This runner:
 * - Applies scenario modifications to GameState
 * - Runs simulation for 360 months
 * - Outputs basic results (outcome, population, spiral counts)
 * - Avoids complex history extraction that triggers bugs
 */

import { SimulationEngine } from '../src/simulation/engine';
import { createDefaultInitialState } from '../src/simulation/initialization';
import { getAllTech } from '../src/simulation/techTree/comprehensiveTechTree';
import { SCENARIO_CATALOG, ScenarioDefinition } from '../src/types/scenarios';
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
  console.log('Applying scenario modifications...');

  // CRITICAL: Attach scenario object to state for ApplyScenarioPrioritiesPhase
  state.scenario = scenario;

  // Apply starting conditions (if specified)
  if (scenario.startingConditions) {
    console.log('  Applying starting conditions...');
    const conditions = scenario.startingConditions;

    // Boost governance quality
    if (conditions.governanceQuality !== undefined) {
      console.log(`    Governance quality boost: ${(conditions.governanceQuality * 100).toFixed(0)}%`);
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
    }

    // Boost institutional capacity
    if (conditions.institutionalCapacity !== undefined) {
      console.log(`    Institutional capacity boost: ${(conditions.institutionalCapacity * 100).toFixed(0)}%`);
      state.government.governanceQuality.institutionalCapacity = Math.max(
        state.government.governanceQuality.institutionalCapacity,
        conditions.institutionalCapacity
      );
    }

    // Boost trust in AI
    if (conditions.trustInAI !== undefined) {
      console.log(`    Trust in AI boost: ${(conditions.trustInAI * 100).toFixed(0)}%`);
      state.aiRiskPerception.publicTrustInAI = Math.max(
        state.aiRiskPerception.publicTrustInAI,
        conditions.trustInAI
      );
    }
  }

  // Apply tech deployment strategy
  console.log('  Applying tech deployment strategy...');
  const allTech = getAllTech();

  if (scenario.techDeployment.mode === 'immediate') {
    // Deploy all tech immediately (god mode)
    const deploymentLevel = scenario.techDeployment.deploymentLevel || 1.0;
    console.log(`    Deploying ${allTech.length} technologies at ${(deploymentLevel * 100).toFixed(0)}% level`);

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

    // Deploy all tech at specified level in global region
    for (const tech of allTech) {
      // Check if already deployed
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
  } else if (scenario.techDeployment.mode === 'prioritized') {
    // For prioritized/sequenced deployment, we'll still deploy immediately but at reduced level
    // (proper sequencing would require phase modifications)
    const deploymentLevel = scenario.techDeployment.deploymentLevel || 1.0;
    console.log(`    Deploying ${allTech.length} technologies (prioritized) at ${(deploymentLevel * 100).toFixed(0)}% level`);

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

    // Deploy all tech at specified level in global region
    for (const tech of allTech) {
      const existing = state.techTreeState.regionalDeployment['global'].find(d => d.techId === tech.id);

      if (existing) {
        existing.deploymentLevel = deploymentLevel;
        if (!existing.deployedBy.includes('scenario')) {
          existing.deployedBy.push('scenario');
        }
      } else {
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
  } else if (scenario.techDeployment.mode === 'sequenced') {
    // Deploy immediately but mark for future sequencing
    // (proper sequencing would require phase modifications)
    const deploymentLevel = scenario.techDeployment.deploymentLevel || 1.0;
    console.log(`    Deploying ${allTech.length} technologies (sequenced) at ${(deploymentLevel * 100).toFixed(0)}% level`);

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

    // Deploy all tech at specified level in global region
    for (const tech of allTech) {
      const existing = state.techTreeState.regionalDeployment['global'].find(d => d.techId === tech.id);

      if (existing) {
        existing.deploymentLevel = deploymentLevel;
        if (!existing.deployedBy.includes('scenario')) {
          existing.deployedBy.push('scenario');
        }
      } else {
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
  }

  console.log('  Scenario modifications applied\n');
}

/**
 * Run a scenario with simplified output
 */
function runScenario(
  scenarioId: string,
  seed: number,
  maxMonths: number = 360
): void {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`SCENARIO TEST: ${scenarioId}`);
  console.log('='.repeat(80));
  console.log(`Seed: ${seed}`);
  console.log(`Max months: ${maxMonths}\n`);

  // Load scenario
  const scenario = SCENARIO_CATALOG[scenarioId as keyof typeof SCENARIO_CATALOG];
  if (!scenario) {
    throw new Error(`Unknown scenario: ${scenarioId}`);
  }

  console.log(`Scenario: ${scenario.name}`);
  console.log(`Description: ${scenario.description}`);
  console.log(`Hypothesis: ${scenario.hypothesis}\n`);

  // Create initial state
  const tempEngine = new SimulationEngine(undefined as any, seed);
  const rng = tempEngine.getRNG().next.bind(tempEngine.getRNG());
  const state = createDefaultInitialState(rng);

  // Apply scenario modifications
  console.log('Applying scenario modifications...\n');
  applyScenario(state, scenario, rng);

  // Run simulation
  console.log('\n' + '='.repeat(80));
  console.log('Running simulation...');
  console.log('='.repeat(80) + '\n');

  const engine = new SimulationEngine(undefined as any, seed);
  const result = engine.run(state, { maxMonths, checkActualOutcomes: true });

  // Print simplified summary
  console.log('\n' + '='.repeat(80));
  console.log('SCENARIO RESULT SUMMARY');
  console.log('='.repeat(80));
  console.log(`Scenario: ${scenarioId}`);
  console.log(`Seed: ${seed}`);
  console.log(`Outcome: ${result.outcome || 'UNKNOWN'}`);
  console.log(`Months simulated: ${result.monthsSimulated || 0}`);

  // Try to extract basic metrics (without triggering history bugs)
  const finalState = result.finalState;
  if (finalState) {
    console.log(`\nFinal population: ${(finalState.humanPopulationSystem?.population || 0) / 1e9} billion`);

    // Count active spirals (if available)
    if (finalState.upwardSpirals) {
      const activeSpirals = Object.entries(finalState.upwardSpirals)
        .filter(([key, value]) => key.includes('Active') && value === true)
        .map(([key]) => key.replace('Active', ''));
      console.log(`Active upward spirals: ${activeSpirals.length}`);
      if (activeSpirals.length > 0) {
        console.log(`  ${activeSpirals.join(', ')}`);
      }
    }

    // Cascade status
    if (finalState.upwardSpirals?.cascadeActive) {
      console.log(`Cascade active: YES (strength: ${finalState.upwardSpirals.cascadeStrength || 0})`);
    } else {
      console.log('Cascade active: NO');
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log('Scenario execution complete');
  console.log('='.repeat(80) + '\n');
}

// CLI entry point
if (require.main === module) {
  const scenarioId = process.argv[2];
  const seed = process.argv[3] ? parseInt(process.argv[3]) : 42;
  const maxMonths = process.argv[4] ? parseInt(process.argv[4]) : 360;

  if (!scenarioId) {
    console.error('Usage: npx tsx scripts/simplifiedScenarioRunner.ts <scenarioId> [seed] [maxMonths]');
    console.error('\nAvailable scenarios:');
    for (const id of Object.keys(SCENARIO_CATALOG)) {
      console.error(`  - ${id}`);
    }
    process.exit(1);
  }

  runScenario(scenarioId, seed, maxMonths);
}

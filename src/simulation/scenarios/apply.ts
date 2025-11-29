/**
 * Scenario Analysis Framework - Application Logic
 *
 * Functions to apply scenario definitions to GameState,
 * modifying starting conditions, priorities, and tech deployment.
 */

import type { GameState, RNGFunction } from '../../types/game';
import type { ScenarioDefinition } from './types';
import { getAllTech } from '../techTree/comprehensiveTechTree';
import { assertFinite, assertInRange, assertDefined } from '../utils/assertions';

/**
 * Apply a scenario to game state
 *
 * Modifies state in-place to match scenario definition.
 * Call this AFTER initialization but BEFORE simulation starts.
 *
 * @param state - Game state to modify
 * @param scenario - Scenario definition to apply
 * @param rng - RNG function for any stochastic elements
 */
export function applyScenario(
  state: GameState,
  scenario: ScenarioDefinition,
  rng: RNGFunction
): void {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`📋 APPLYING SCENARIO: ${scenario.name}`);
  console.log('='.repeat(80));
  console.log(`Description: ${scenario.description}`);
  if (scenario.expectedOutcome) {
    console.log(`Expected outcome: ${scenario.expectedOutcome}`);
  }

  // CRITICAL: Store scenario configuration for enforcement during simulation
  // (Nov 10, 2025 - Fix for "declarative only" bug)
  // (Nov 29, 2025 - M-3 Fix: Also set state.scenario for phase compatibility)
  state.scenarioConfig = scenario;
  state.scenario = scenario;
  console.log(`  ✓ Scenario config stored in state (government will enforce priorities)`);

  // Apply starting condition modifications
  if (scenario.startingConditions) {
    applyStartingConditions(state, scenario.startingConditions);
  }

  // Apply government priority overrides
  if (scenario.governmentPriorities) {
    applyGovernmentPriorities(state, scenario.governmentPriorities);
  }

  // Apply technology deployment strategy
  if (scenario.techDeployment) {
    applyTechDeployment(state, scenario.techDeployment, rng);
  }

  console.log(`✅ Scenario applied successfully\n`);
}

/**
 * Apply starting condition modifications
 */
function applyStartingConditions(
  state: GameState,
  conditions: NonNullable<ScenarioDefinition['startingConditions']>
): void {
  console.log(`\n  📊 Applying starting conditions:`);

  if (conditions.trustInAI !== undefined) {
    const trust = assertInRange(conditions.trustInAI, 0, 1, {
      location: 'applyStartingConditions',
      valueName: 'trustInAI'
    });
    // Set paranoia level (inverse of trust)
    state.society.paranoiaLevel = 1.0 - trust;
    console.log(`     Trust in AI: ${(trust * 100).toFixed(0)}% (paranoia: ${(state.society.paranoiaLevel * 100).toFixed(0)}%)`);
  }

  if (conditions.institutionalTrust !== undefined) {
    const trust = assertInRange(conditions.institutionalTrust, 0, 1, {
      location: 'applyStartingConditions',
      valueName: 'institutionalTrust'
    });
    state.government.governanceQuality.institutionalCapacity = trust;
    console.log(`     Institutional trust: ${(trust * 100).toFixed(0)}%`);
  }

  if (conditions.gini !== undefined) {
    const gini = assertInRange(conditions.gini, 0.2, 0.6, {
      location: 'applyStartingConditions',
      valueName: 'gini'
    });
    // Note: inequality field may not exist on GameState (optional)
    // This is a known limitation - inequality is tracked elsewhere in the system
    console.log(`     Inequality (Gini): ${gini.toFixed(3)} [target - actual tracking varies by system]`);
    // TODO: Find correct location to set inequality (may be in qualityOfLifeSystems.distribution)
  }

  if (conditions.governanceQuality !== undefined) {
    const quality = assertInRange(conditions.governanceQuality, 0, 1, {
      location: 'applyStartingConditions',
      valueName: 'governanceQuality'
    });
    state.government.governanceQuality.decisionQuality = quality;
    state.government.governanceQuality.institutionalCapacity = quality;
    console.log(`     Governance quality: ${(quality * 100).toFixed(0)}%`);
  }

  if (conditions.socialCohesion !== undefined) {
    const cohesion = assertInRange(conditions.socialCohesion, 0, 1, {
      location: 'applyStartingConditions',
      valueName: 'socialCohesion'
    });
    // Social cohesion is 0-100 scale
    const cohesionScaled = cohesion * 100;
    state.socialAccumulation.socialCohesion.trust = cohesionScaled;
    state.socialAccumulation.socialCohesion.communityBonds = cohesionScaled;
    state.socialAccumulation.socialCohesion.civilLiberties = cohesionScaled;
    console.log(`     Social cohesion: ${(cohesion * 100).toFixed(0)}%`);
  }

  if (conditions.collectiveActionWillingness !== undefined) {
    const willingness = assertInRange(conditions.collectiveActionWillingness, 0, 1, {
      location: 'applyStartingConditions',
      valueName: 'collectiveActionWillingness'
    });
    state.society.collectiveActionWillingness = willingness;
    console.log(`     Collective action willingness: ${(willingness * 100).toFixed(0)}%`);
  }
}

/**
 * Apply government priority overrides
 *
 * NOTE (Nov 10, 2025): Now stores priorities in state.scenarioConfig for enforcement.
 * Initial values set here + government decision logic reads scenarioConfig each turn.
 */
function applyGovernmentPriorities(
  state: GameState,
  priorities: NonNullable<ScenarioDefinition['governmentPriorities']>
): void {
  console.log(`\n  🏛️  Applying government priorities:`);

  // Store priorities for government agent to reference
  // (This is a lightweight approach - doesn't override agent logic yet)
  if (priorities.climateSpending !== undefined) {
    const priority = assertInRange(priorities.climateSpending, 0, 1, {
      location: 'applyGovernmentPriorities',
      valueName: 'climateSpending'
    });
    console.log(`     Climate spending priority: ${(priority * 100).toFixed(0)}%`);
    // FIXED (Nov 10, 2025): Government decision logic now reads state.scenarioConfig
  }

  if (priorities.redistributionLevel !== undefined) {
    const target = assertInRange(priorities.redistributionLevel, 0, 1, {
      location: 'applyGovernmentPriorities',
      valueName: 'redistributionLevel'
    });
    console.log(`     Redistribution priority: ${(target * 100).toFixed(0)}%`);
    // FIXED (Nov 10, 2025): Government decision logic now reads state.scenarioConfig
  }

  if (priorities.alignmentResearch !== undefined) {
    const priority = assertInRange(priorities.alignmentResearch, 0, 1, {
      location: 'applyGovernmentPriorities',
      valueName: 'alignmentResearch'
    });
    console.log(`     AI alignment research priority: ${(priority * 100).toFixed(0)}%`);
    // Boost alignment research budget
    const baseBudget = state.government.researchInvestments.totalBudget;
    const alignmentBudget = baseBudget * priority;
    // FIXED (Nov 10, 2025): Government decision logic now reads state.scenarioConfig
  }

  if (priorities.democraticParticipation !== undefined) {
    const priority = assertInRange(priorities.democraticParticipation, 0, 1, {
      location: 'applyGovernmentPriorities',
      valueName: 'democraticParticipation'
    });
    console.log(`     Democratic participation priority: ${(priority * 100).toFixed(0)}%`);
    // Boost participation rate based on priority
    state.government.governanceQuality.participationRate = Math.min(
      1.0,
      state.government.governanceQuality.participationRate * (1 + priority * 0.5)
    );
  }

  if (priorities.scientificResearch !== undefined) {
    const priority = assertInRange(priorities.scientificResearch, 0, 1, {
      location: 'applyGovernmentPriorities',
      valueName: 'scientificResearch'
    });
    console.log(`     Scientific research priority: ${(priority * 100).toFixed(0)}%`);
    // Boost research budget based on priority
    const boostFactor = 1 + priority;
    state.government.researchInvestments.totalBudget *= boostFactor;
  }

  console.log(`\n     ✅ Priority overrides stored in state.scenarioConfig`);
  console.log(`         Government agent will enforce these priorities during simulation`);
}

/**
 * Apply technology deployment strategy
 */
function applyTechDeployment(
  state: GameState,
  deployment: NonNullable<ScenarioDefinition['techDeployment']>,
  rng: RNGFunction
): void {
  console.log(`\n  🔬 Applying technology deployment:`);
  console.log(`     Strategy: ${deployment.strategy}`);

  if (deployment.strategy === 'none') {
    console.log(`     No technologies will be deployed`);
    return;
  }

  if (deployment.strategy === 'adaptive') {
    console.log(`     Technologies will be deployed adaptively by simulation`);
    console.log(`     (No immediate deployment - simulation decides)`);
    return;
  }

  // Get technology list to deploy
  let techsToDeploy: string[] = [];

  if (deployment.techList && deployment.techList.length > 0) {
    // Use specified tech list
    techsToDeploy = deployment.techList;
    console.log(`     Deploying ${techsToDeploy.length} specified technologies`);
  } else if (deployment.strategy === 'immediate') {
    // Deploy ALL technologies
    const allTech = getAllTech();
    techsToDeploy = allTech.map(t => t.id);
    console.log(`     Deploying ALL ${techsToDeploy.length} technologies (god mode)`);
  } else if (deployment.strategy === 'sequenced') {
    // SEQUENCED DEPLOYMENT: Create schedule for simulation loop (Nov 25, 2025)
    const allTech = getAllTech();
    const gapMonths = deployment.deploymentInterval || 6;
    const tierOrder = [0, 1, 2, 3, 4]; // Default tier order

    // Group technologies by tier (based on minAICapability)
    const techsByTier = new Map<number, typeof allTech>();
    for (const tech of allTech) {
      const capability = tech.minAICapability ?? 0;
      let tier = 0;
      if (capability >= 4.0) tier = 4;
      else if (capability >= 3.0) tier = 3;
      else if (capability >= 2.0) tier = 2;
      else if (capability >= 1.0) tier = 1;
      else tier = 0;

      if (!techsByTier.has(tier)) {
        techsByTier.set(tier, []);
      }
      techsByTier.get(tier)!.push(tech);
    }

    // Build deployment schedule
    const schedule: Array<{ techId: string; deployMonth: number; deployed: boolean }> = [];
    let currentMonth = 0;

    console.log(`\n🔬 TECH DEPLOYMENT SCHEDULE`);
    console.log(`   Mode: sequenced`);
    console.log(`   Total techs: ${allTech.length}`);
    console.log(`   Gap between tiers: ${gapMonths} months`);

    for (const tier of tierOrder) {
      const techs = techsByTier.get(tier) || [];
      if (techs.length === 0) continue;

      console.log(`   TIER ${tier} (Month ${currentMonth}): ${techs.length} technologies`);
      for (const tech of techs) {
        schedule.push({
          techId: tech.id,
          deployMonth: currentMonth,
          deployed: false
        });
      }

      currentMonth += gapMonths;
    }

    console.log(`   Deployment window: Months 0-${currentMonth - gapMonths}`);

    // Store schedule in state
    state.techDeploymentSchedule = {
      mode: 'sequenced',
      scheduledDeployments: schedule,
      deploymentLevel: deployment.deploymentLevel ?? 1.0,
      deploymentInterval: gapMonths
    };

    console.log(`   ✅ Schedule created: ${schedule.length} deployments over ${currentMonth - gapMonths} months`);

    // Don't deploy anything immediately - let the phase handle it
    return;
  }

  // Deploy technologies immediately (for non-scheduled modes)
  const deploymentLevel = deployment.deploymentLevel ?? 1.0;
  deployTechnologies(state, techsToDeploy, deploymentLevel);
}

/**
 * Helper: Deploy specified technologies at specified level
 */
function deployTechnologies(
  state: GameState,
  techIds: string[],
  deploymentLevel: number
): void {
  const allTech = getAllTech();
  const validTechIds = allTech.map(t => t.id);

  // Unlock all specified tech
  for (const techId of techIds) {
    if (!validTechIds.includes(techId)) {
      console.warn(`     ⚠️  Unknown tech ID: ${techId} (skipping)`);
      continue;
    }

    if (!state.techTreeState.unlockedTech.includes(techId)) {
      state.techTreeState.unlockedTech.push(techId);
      state.techTreeState.techUnlockedCount++;
    }
  }

  // Initialize global deployment array if needed
  if (!state.techTreeState.regionalDeployment['global']) {
    state.techTreeState.regionalDeployment['global'] = [];
  }

  // Deploy all tech at specified level in global region
  let deployedCount = 0;
  for (const techId of techIds) {
    const tech = allTech.find(t => t.id === techId);
    if (!tech) continue;

    // Check if already deployed
    const existing = state.techTreeState.regionalDeployment['global'].find(d => d.techId === techId);

    if (existing) {
      // Update existing deployment level
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
        totalInvested: tech.deploymentCost * deploymentLevel,
        deployedBy: ['scenario'],
        effects: tech.effects,
      });
      state.techTreeState.techDeployedCount++;
      deployedCount++;
    }
  }

  console.log(`     ✅ Deployed ${deployedCount} technologies at ${(deploymentLevel * 100).toFixed(0)}% level`);
  console.log(`     Total unlocked: ${state.techTreeState.unlockedTech.length}`);
  console.log(`     Total deployed: ${state.techTreeState.regionalDeployment['global'].length}`);
}

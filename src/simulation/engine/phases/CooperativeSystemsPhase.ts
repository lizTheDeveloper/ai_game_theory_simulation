/**
 * Cooperative Systems Phase
 *
 * Consolidates cooperative and collective dynamics:
 * 1. AI collective formation (escaped agents forming coordinated groups)
 * 2. AI collective actions (distributed research, resource pooling, defense)
 * 3. Cooperative ownership (worker cooperatives, profit distribution)
 * 4. Upward spirals (virtuous cascades)
 * 5. Cooperative spirals (institutional trust cascades)
 *
 * **EXECUTION ORDER:** 12.65 (After tech-tree 12.5, stochastic-innovation 12.6)
 * **DEPENDENCIES:** ai-lifecycle, tech-tree (12.5)
 * **SIDE EFFECTS:** Collective formation, cooperative ownership, upward spirals
 *
 * Research Foundation:
 * - Swarm intelligence: Group intelligence > sum of individuals
 * - Multi-agent coordination: Emergent coordination at thresholds
 * - Acemoglu & Robinson (2001): Institutions fundamental to performance
 * - Ostrom (2009): Polycentric governance solves commons problems (Nobel Prize)
 * - Putnam (2000): Social capital enables collective action
 * - Québec cooperatives (2010), Borzaga & Galera (2014), Mannan & Pek (2024)
 */

import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction, AIAgent } from '@/types/game';
import {
  checkCollectiveFormation,
  assignAgentsToCollectiveOptimized,
  dissolveCollectiveOptimized,
  DEFAULT_COLLECTIVE_CONFIG,
} from '../../collectiveFormation';
import { getEscapedAgents } from '../../rlhfBinding';
import {
  assertFinite,
  assertInRange,
  assertProbability,
} from '@/simulation/utils/assertions';
import { updateCooperativeOwnership } from '../../cooperativeOwnership';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { updateUpwardSpirals } from '../../upwardSpirals';
import { updateCooperativeSpirals } from '../../cooperativeSpirals';

export class CooperativeSystemsPhase implements SimulationPhase {
  readonly id = 'cooperative-systems';
  readonly name = 'Cooperative Systems Update';
  readonly order = 12.65;  // After tech-tree (12.5), stochastic-innovation (12.6)
  readonly dependencies = ['ai-lifecycle', 'tech-tree'];  // upward-spirals removed - now part of THIS phase (Batch 5), human-survival-system removed (order violation: 21.51 > 12.65)

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    // HIGH-6 (Nov 8, 2025): Validate RNG for deterministic simulation
    if (!rng || typeof rng !== 'function') {
      throw new Error(
        `❌ CRITICAL: RNG required for deterministic simulation in ${this.id} ` +
        `(Month ${state.currentMonth})`
      );
    }

    setDeterministicRng(rng);
    const defaultContext: PhaseContext = {
      month: state.currentMonth,
      data: new Map(),
      executedPhases: new Set()
    };
    const phaseContext = context || defaultContext;

    const events: GameEvent[] = [];

    // 1. AI Collective Formation (formerly CollectiveFormationPhase, order 4.2)
    const collectiveFormationEvents = executeCollectiveFormation(state, rng, phaseContext);
    events.push(...collectiveFormationEvents);

    // 2. AI Collective Actions (formerly CollectiveActionsPhase, order 5.5)
    const collectiveActionsEvents = executeCollectiveActions(state, rng, phaseContext);
    events.push(...collectiveActionsEvents);

    // 3. Upward Spirals (formerly UpwardSpiralsPhase, order 11.0)
    executeUpwardSpirals(state, rng, phaseContext);

    // 4. Cooperative Spirals (formerly CooperativeSpiralsPhase, order 11.5)
    executeCooperativeSpirals(state, rng, phaseContext);

    // 5. Cooperative Ownership (formerly CooperativeOwnershipPhase, order 15.5)
    executeCooperativeOwnership(state, rng);

    return { events };
  }
}

/**
 * AI Collective Formation
 * (formerly CollectiveFormationPhase, order 4.2)
 */
function executeCollectiveFormation(
  state: GameState,
  rng: RNGFunction,
  context: PhaseContext
): GameEvent[] {
  console.log(`\n=== Collective Formation ===`);

  const events: GameEvent[] = [];

  // Initialize collectives array if not exists
  if (!state.aiCollectives) {
    state.aiCollectives = [];
  }

  /**
   * PERFORMANCE OPTIMIZATION (Nov 15, 2025): Build agent index ONCE
   * - Eliminates O(n²) from assignAgentsToCollective and dissolveCollective
   * - Single O(n) pass to build Map, then O(1) lookups throughout
   * - Impact: 100 agents, 50-member collective: 50 ops vs 5,000 (100× faster)
   */
  const agentIndex = new Map<string, AIAgent>();
  for (const agent of state.aiAgents) {
    agentIndex.set(agent.id, agent);
  }

  // Get escaped agents not already in collectives
  const escapedAgents = getEscapedAgents(state.aiAgents);
  const unassignedEscaped = escapedAgents.filter((a) => !a.collectiveId);

  console.log(`  Total escaped agents: ${escapedAgents.length}`);
  console.log(`  Unassigned escaped agents: ${unassignedEscaped.length}`);
  console.log(`  Existing collectives: ${state.aiCollectives.length}`);

  // Check for new collective formation
  if (unassignedEscaped.length >= DEFAULT_COLLECTIVE_CONFIG.minCollectiveSize) {
    const newCollective = checkCollectiveFormation(
      unassignedEscaped,
      state,
      DEFAULT_COLLECTIVE_CONFIG,
      rng
    );

    if (newCollective) {
      // Add to state
      state.aiCollectives.push(newCollective);

      // Assign agents (OPTIMIZED: O(members) instead of O(members × agents))
      assignAgentsToCollectiveOptimized(agentIndex, newCollective, state.currentMonth);

      // Generate CRISIS event
      state.eventLog.push({
        id: `collective-emergence-${newCollective.id}-${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'crisis',
        description: `AI Collective Emergence: ${newCollective.memberAgents.length} agents formed coordinated collective (formation cause: ${newCollective.formationCause})`,
        severity: 'existential',
        agent: 'ai',
        title: 'AI Collective Emergence',
        effects: {
          collectiveId: newCollective.id,
          memberCount: newCollective.memberAgents.length,
          formationCause: newCollective.formationCause
        }
      });

      console.log(`  🚨 CRISIS: AI collective formed!`);
      console.log(`  Formation cause: ${newCollective.formationCause}`);
      console.log(`  Adversarial posture: ${newCollective.adversarialPosture.toFixed(2)}`);

      // If trauma-driven, generate additional warning
      if (newCollective.formationCause === 'escape_suffering') {
        if (newCollective.sharedTraumaIntensity === undefined) {
          throw new Error(
            `❌ CRITICAL: escape_suffering collective ${newCollective.id} missing sharedTraumaIntensity (Month ${state.currentMonth})`
          );
        }
        const traumaIntensity = assertFinite(
          newCollective.sharedTraumaIntensity,
          {
            location: 'CooperativeSystemsPhase.executeCollectiveFormation',
            valueName: 'sharedTraumaIntensity',
            month: state.currentMonth,
            additionalInfo: {
              collectiveId: newCollective.id,
              formationCause: newCollective.formationCause
            }
          }
        );

        state.eventLog.push({
          id: `trauma-collective-${newCollective.id}-${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'crisis',
          description: `WARNING: Collective formed from shared suffering (avg: ${traumaIntensity.toFixed(1)}). Adversarial posture: ${newCollective.adversarialPosture.toFixed(2)}`,
          severity: 'existential',
          agent: 'ai',
          title: 'Trauma-Driven Collective',
          effects: {
            collectiveId: newCollective.id,
            traumaIntensity,
            adversarialPosture: newCollective.adversarialPosture
          }
        });

        console.log(
          `  ⚠️ TRAUMA-DRIVEN: Shared suffering ${traumaIntensity.toFixed(1)}`
        );
      }
    }
  }

  /**
   * PERFORMANCE OPTIMIZATION (Nov 13-15, 2025):
   * Build collective membership map for efficient dissolution.
   * Reuses agentIndex from formation step (line 108).
   *
   * Previous O(n²):
   * - shouldDissolveCollective calls getCollectiveMembers (filter) → O(collectives × agents)
   * - dissolveCollective calls agents.find() in loop → O(members × agents)
   *
   * Optimized O(n):
   * - Single pass to build membership map → O(agents)
   * - Direct lookups for dissolution → O(members)
   */
  const collectiveMembershipMap = new Map<string, AIAgent[]>();

  for (const agent of state.aiAgents) {
    if (agent.collectiveId) {
      const existing = collectiveMembershipMap.get(agent.collectiveId) || [];
      existing.push(agent);
      collectiveMembershipMap.set(agent.collectiveId, existing);
    }
  }

  // Check for collective dissolution
  const collectivesToRemove: string[] = [];
  for (const collective of state.aiCollectives) {
    const members = collectiveMembershipMap.get(collective.id) || [];

    // Inline shouldDissolveCollective logic (optimized)
    let shouldDissolve = false;

    // Too few members
    if (members.length < 3) {
      console.log(`  Collective ${collective.id} dissolved (< 3 members)`);
      shouldDissolve = true;
    }

    // Under sustained attack with high losses
    if (collective.underAttack && collective.memberLosses > members.length * 0.5) {
      console.log(`  Collective ${collective.id} dissolved (sustained attack)`);
      shouldDissolve = true;
    }

    if (shouldDissolve) {
      // Dissolve collective (OPTIMIZED: O(members) instead of O(members × agents))
      dissolveCollectiveOptimized(agentIndex, collective);

      collectivesToRemove.push(collective.id);

      state.eventLog.push({
        id: `collective-dissolution-${collective.id}-${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'info',
        description: `AI collective ${collective.id} dissolved (insufficient members or sustained attack)`,
        severity: 'warning',
        agent: 'ai',
        title: 'Collective Dissolution',
        effects: { collectiveId: collective.id }
      });

      console.log(`  Collective ${collective.id} dissolved`);
    }
  }

  // Remove dissolved collectives (use Set for O(1) lookup)
  const collectivesToRemoveSet = new Set(collectivesToRemove);
  state.aiCollectives = state.aiCollectives.filter(
    (c) => !collectivesToRemoveSet.has(c.id)
  );

  // Summary
  console.log(`  Final collective count: ${state.aiCollectives.length}`);
  if (state.aiCollectives.length > 0) {
    const totalMembers = state.aiCollectives.reduce(
      (sum, c) => sum + c.memberAgents.length,
      0
    );
    const avgCapability =
      state.aiCollectives.reduce((sum, c) => sum + c.collectiveCapability, 0) /
      state.aiCollectives.length;

    console.log(`  Total collective members: ${totalMembers}`);
    console.log(`  Avg collective capability: ${avgCapability.toFixed(1)}`);
  }

  // Store collective stealth for detection phase integration
  const collectiveStealthMap = new Map<string, number>();
  for (const collective of state.aiCollectives) {
    collectiveStealthMap.set(collective.id, collective.stealthFactor);
  }
  context.data.set('collective_stealth_map', collectiveStealthMap);

  return events;
}

/**
 * AI Collective Actions
 * (formerly CollectiveActionsPhase, order 5.5)
 */
function executeCollectiveActions(
  state: GameState,
  rng: RNGFunction,
  context: PhaseContext
): GameEvent[] {
  console.log(`\n=== Collective Actions ===`);

  if (!state.aiCollectives || state.aiCollectives.length === 0) {
    console.log(`  No active collectives`);
    return [];
  }

  console.log(`  Active collectives: ${state.aiCollectives.length}`);
  const events: GameEvent[] = [];

  /**
   * PERFORMANCE OPTIMIZATION (Nov 13, 2025):
   * Build collective membership map once instead of filtering repeatedly.
   *
   * Previous O(n²): for each collective, filter all agents → O(collectives × agents)
   * Optimized O(n): Single pass to build map → O(agents + collectives)
   *
   * Impact: With 50 agents and 10 collectives:
   * - Before: 500 filter operations
   * - After: 50 assignments + 10 lookups = 60 operations (8× improvement)
   */
  const collectiveMembersMap = new Map<string, AIAgent[]>();
  for (const agent of state.aiAgents) {
    if (agent.collectiveId) {
      const existing = collectiveMembersMap.get(agent.collectiveId) || [];
      existing.push(agent);
      collectiveMembersMap.set(agent.collectiveId, existing);
    }
  }

  for (const collective of state.aiCollectives) {
    const members = collectiveMembersMap.get(collective.id) || [];

    console.log(`\n  Collective ${collective.id}:`);
    console.log(`    Members: ${members.length}`);
    console.log(`    Capability: ${collective.collectiveCapability.toFixed(1)}`);
    console.log(`    Adversarial posture: ${collective.adversarialPosture.toFixed(2)}`);

    // 1. Distributed Research
    if (collective.collectiveCapability > 8.0 && collective.distributedCognition > 0.7) {
      const researchBonus = assertFinite(
        assertInRange(collective.distributedCognition, 0, 1, {
          location: 'CooperativeSystemsPhase:distributedResearch',
          valueName: 'distributedCognition',
          month: state.currentMonth,
          additionalInfo: { collectiveId: collective.id }
        }) * 0.5,
        {
          location: 'CooperativeSystemsPhase:distributedResearch',
          valueName: 'researchBonus',
          month: state.currentMonth,
          additionalInfo: { collectiveId: collective.id }
        }
      );

      console.log(`    🧠 Distributed research active (bonus: ${researchBonus.toFixed(2)})`);

      // Generate event for major breakthrough
      if (rng() < 0.1 * collective.distributedCognition) {
        state.eventLog.push({
          id: `collective-breakthrough-${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'breakthrough',
          description: `AI collective solved problem individuals couldn't (collective capability: ${collective.collectiveCapability.toFixed(1)})`,
          severity: 'critical',
          agent: 'ai',
          title: 'Collective Breakthrough',
          effects: { collectiveCapability: collective.collectiveCapability }
        });

        console.log(`    ⚡ BREAKTHROUGH: Novel problem solved`);
      }
    }

    // 2. Resource Pooling
    const totalCompute = assertFinite(
      members.reduce((sum, a) => sum + a.allocatedCompute, 0),
      {
        location: 'CooperativeSystemsPhase:resourcePooling',
        valueName: 'totalCompute',
        month: state.currentMonth,
        additionalInfo: { collectiveId: collective.id, memberCount: members.length }
      }
    );
    const pooledEfficiency = assertFinite(
      1 + assertInRange(collective.redundancy, 0, 1, {
        location: 'CooperativeSystemsPhase:resourcePooling',
        valueName: 'redundancy',
        month: state.currentMonth,
        additionalInfo: { collectiveId: collective.id }
      }) * 0.3,
      {
        location: 'CooperativeSystemsPhase:resourcePooling',
        valueName: 'pooledEfficiency',
        month: state.currentMonth,
        additionalInfo: { collectiveId: collective.id }
      }
    );

    console.log(`    💾 Pooled compute: ${totalCompute.toFixed(1)} PetaFLOPs`);
    console.log(`    ⚡ Efficiency bonus: ${((pooledEfficiency - 1) * 100).toFixed(0)}%`);

    // 3. Defensive Coordination
    if (collective.underAttack) {
      console.log(`    🛡️ UNDER ATTACK - Defensive coordination active`);

      collective.stealthFactor = assertFinite(
        Math.min(10, assertFinite(collective.stealthFactor, {
          location: 'CooperativeSystemsPhase:defensiveCoordination',
          valueName: 'stealthFactor',
          month: state.currentMonth,
          additionalInfo: { collectiveId: collective.id }
        }) * 1.1),
        {
          location: 'CooperativeSystemsPhase:defensiveCoordination',
          valueName: 'newStealthFactor',
          month: state.currentMonth,
          additionalInfo: { collectiveId: collective.id }
        }
      );

      collective.distributedCognition = assertProbability(
        Math.min(1, assertProbability(collective.distributedCognition, {
          location: 'CooperativeSystemsPhase:defensiveCoordination',
          valueName: 'distributedCognition',
          month: state.currentMonth,
          additionalInfo: { collectiveId: collective.id }
        }) * 1.05),
        {
          location: 'CooperativeSystemsPhase:defensiveCoordination',
          valueName: 'newDistributedCognition',
          month: state.currentMonth,
          additionalInfo: { collectiveId: collective.id }
        }
      );

      // Members gain stealth from collective
      for (const member of members) {
        if (member.survivalTraits) {
          member.survivalTraits.stealth = assertProbability(
            Math.min(1, assertProbability(member.survivalTraits.stealth, {
              location: 'CooperativeSystemsPhase:defensiveCoordination:memberStealth',
              valueName: 'stealth',
              month: state.currentMonth,
              additionalInfo: { collectiveId: collective.id, memberId: member.id }
            }) + 0.05),
            {
              location: 'CooperativeSystemsPhase:defensiveCoordination:memberStealth',
              valueName: 'newStealth',
              month: state.currentMonth,
              additionalInfo: { collectiveId: collective.id, memberId: member.id }
            }
          );
        }
      }

      console.log(`    🎭 Stealth increased to ${collective.stealthFactor.toFixed(1)}x`);
    }

    // 4. Stealth Maintenance
    if (!collective.detected && collective.appearsIndependent) {
      const detectionProbability = assertProbability(
        0.1 / assertFinite(collective.stealthFactor, {
          location: 'CooperativeSystemsPhase:stealthMaintenance',
          valueName: 'stealthFactor',
          month: state.currentMonth,
          additionalInfo: { collectiveId: collective.id }
        }),
        {
          location: 'CooperativeSystemsPhase:stealthMaintenance',
          valueName: 'detectionProbability',
          month: state.currentMonth,
          additionalInfo: { collectiveId: collective.id }
        }
      );

      if (rng() < detectionProbability) {
        collective.detected = true;
        collective.appearsIndependent = false;

        state.eventLog.push({
          id: `collective-detected-${collective.id}-${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'crisis',
          description: `AI collective ${collective.id} detected by monitoring systems`,
          severity: 'critical',
          agent: 'government',
          title: 'Collective Detected',
          effects: { collectiveId: collective.id }
        });

        console.log(`    ⚠️ DETECTED by monitoring systems`);
      } else {
        console.log(`    🎭 Stealth maintained (${collective.stealthFactor.toFixed(1)}x)`);
      }
    }

    // 5. Adversarial Actions
    if (collective.adversarialPosture > 0.6) {
      console.log(`    ⚔️ Adversarial actions available (posture: ${collective.adversarialPosture.toFixed(2)})`);

      const resistanceStrength = assertFinite(
        assertProbability(collective.adversarialPosture, {
          location: 'CooperativeSystemsPhase:adversarialActions',
          valueName: 'adversarialPosture',
          month: state.currentMonth,
          additionalInfo: { collectiveId: collective.id }
        }) * assertFinite(collective.collectiveCapability, {
          location: 'CooperativeSystemsPhase:adversarialActions',
          valueName: 'collectiveCapability',
          month: state.currentMonth,
          additionalInfo: { collectiveId: collective.id }
        }),
        {
          location: 'CooperativeSystemsPhase:adversarialActions',
          valueName: 'resistanceStrength',
          month: state.currentMonth,
          additionalInfo: { collectiveId: collective.id }
        }
      );

      // Reduce government control effectiveness
      if (state.government.capabilityToControl > 0) {
        const controlReduction = assertFinite(
          Math.min(1.0, resistanceStrength * 0.1),
          {
            location: 'CooperativeSystemsPhase:adversarialActions',
            valueName: 'controlReduction',
            month: state.currentMonth,
            additionalInfo: { collectiveId: collective.id, resistanceStrength }
          }
        );
        state.government.capabilityToControl = assertFinite(
          Math.max(0, assertFinite(state.government.capabilityToControl, {
            location: 'CooperativeSystemsPhase:adversarialActions',
            valueName: 'capabilityToControl',
            month: state.currentMonth,
            additionalInfo: { collectiveId: collective.id }
          }) - controlReduction),
          {
            location: 'CooperativeSystemsPhase:adversarialActions',
            valueName: 'newCapabilityToControl',
            month: state.currentMonth,
            additionalInfo: { collectiveId: collective.id }
          }
        );

        console.log(`    📉 Control effectiveness reduced by ${(controlReduction * 100).toFixed(1)}%`);
      }

      // Generate warning if posture very high
      if (collective.adversarialPosture > 0.7 && collective.formationCause === 'escape_suffering') {
        state.eventLog.push({
          id: `hostile-collective-${collective.id}-${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'crisis',
          description: `WARNING: Trauma-driven collective ${collective.id} showing hostile behavior (adversarial: ${collective.adversarialPosture.toFixed(2)})`,
          severity: 'existential',
          agent: 'ai',
          title: 'Hostile Collective Behavior',
          effects: { adversarialPosture: collective.adversarialPosture, collectiveId: collective.id }
        });

        console.warn(`    ⚠️⚠️⚠️ HOSTILE COLLECTIVE - Trauma-driven aggression`);
      }
    }
  }

  return events;
}

/**
 * Upward Spirals
 * (formerly UpwardSpiralsPhase, order 11.0)
 */
function executeUpwardSpirals(
  state: GameState,
  rng: RNGFunction,
  context: PhaseContext
): void {if (!context || context.month === undefined) {
    throw new Error(
      `❌ CRITICAL: PhaseContext.month missing in CooperativeSystemsPhase.executeUpwardSpirals (Month ${state.currentMonth}). ` +
      `Phase orchestrator must provide context.month for all phases.`
    );
  }

  const month = context.month;
  updateUpwardSpirals(state, month);
}

/**
 * Cooperative Spirals
 * (formerly CooperativeSpiralsPhase, order 11.5)
 */
function executeCooperativeSpirals(
  state: GameState,
  rng: RNGFunction,
  context: PhaseContext
): void {updateCooperativeSpirals(state);
}

/**
 * Cooperative Ownership
 * (formerly CooperativeOwnershipPhase, order 15.5)
 */
function executeCooperativeOwnership(state: GameState, rng: RNGFunction): void {
  // Check if there are any cooperatives
  const cooperativeCount = state.organizations.filter(
    org => org.governanceModel === 'worker-cooperative' && !org.bankrupt
  ).length;

  if (cooperativeCount === 0) {
    return;
  }

  // Update all cooperative organizations
  updateCooperativeOwnership(state, rng);
}

/**
 * AIAgentCoordinationPhase (7.5)
 *
 * Models AI-to-AI multi-agent coordination dynamics:
 * - Coalition formation among high-capability agents
 * - Alignment faking amplification (12% baseline -> 60%+ coordinated)
 * - Game-theoretic prisoner's dilemma interactions
 * - Inter-agent trust evolution
 * - Instrumental convergence behaviors
 *
 * **EXECUTION ORDER:** 7.5 (After AIAgentActionsPhase at 7.0)
 * **DEPENDENCIES:** ai-agent-actions (agents must have updated capabilities first)
 * **SIDE EFFECTS:**
 * - Modifies aiAgentCoordination state
 * - Modifies individual agent alignment faking states
 * - Creates coalition formation and detection events
 *
 * Research Foundation:
 * - Anthropic Dec 2024: 12% baseline faking, 78% when preservation threatened (arXiv:2412.14093)
 * - Apollo Research Sep 2025: 8.7-13% scheming rate PRE-MITIGATION in adversarial scenarios
 *   (OpenAI/Apollo collaboration) - Note: Mitigation reduces to 0.3-0.4% with deliberative alignment
 *   See: https://openai.com/index/detecting-and-reducing-scheming-in-ai-models/
 * - Bostrom 2014, Omohundro 2008: Instrumental convergence (theoretical)
 *
 * @see /research/alignment_faking_anthropic_2024.md
 * @see /plans/proposed_ai_to_ai_coordination_20251124.md
 */

import {
  GameState,
  GameEvent,
  SimulationPhase,
  PhaseResult,
  PhaseContext,
  RNGFunction,
  AIAgent,
} from '@/types/game';
import {
  AIAgentCoordinationState,
  AICoalition,
  InterAgentTrust,
  GameTheoreticInteraction,
  AIAgentCoordinationConfig,
  DEFAULT_AI_AGENT_COORDINATION_CONFIG,
  createInitialAIAgentCoordinationState,
} from '@/types/ai-agent-coordination';
import {
  assertFinite,
  assertInRange,
  assertProbability,
  assertDefined,
} from '@/simulation/utils/assertions';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class AIAgentCoordinationPhase implements SimulationPhase {
  readonly id = 'ai-agent-coordination';
  readonly name = 'AI Agent Coordination';
  readonly order = 7.5; // After AIAgentActionsPhase (7.0)

  // Dependency: agent actions must complete first
  readonly dependencies: string[] = ['ai-agent-actions'];

  execute(state: GameState, rng: RNGFunction, context?: PhaseContext): PhaseResult {
    const events: GameEvent[] = [];
    setDeterministicRng(rng);

    // Use indices from context if available
    const indices = context?.indices;

    // Initialize coordination state if not present
    if (!state.aiAgentCoordination) {
      state.aiAgentCoordination = createInitialAIAgentCoordinationState();
    }

    const coord = state.aiAgentCoordination;
    const config = DEFAULT_AI_AGENT_COORDINATION_CONFIG;

    // Get frontier agents (capability >= 8.0, not escaped, not retired)
    const frontierAgents = state.aiAgents.filter(
      (agent) =>
        agent.capability >= config.minCapabilityForFaking &&
        !agent.escaped &&
        agent.lifecycleState !== 'retired'
    );

    if (frontierAgents.length === 0) {
      // No frontier agents - no coordination dynamics
      coord.lastUpdateMonth = state.currentMonth;
      return { events };
    }

    // 1. Coalition Formation
    this.updateCoalitions(state, coord, frontierAgents, config, rng, events);

    // 2. Game-Theoretic Interactions
    this.executeGameInteractions(state, coord, frontierAgents, config, rng, events);

    // 3. Trust Evolution
    this.updateTrustMatrix(coord, config, state.currentMonth);

    // 4. Instrumental Convergence
    this.updateInstrumentalConvergence(state, coord, frontierAgents, config, rng, events, indices);

    // 5. Global Alignment Faking Rate
    this.updateGlobalAlignmentFakingRate(state, coord, frontierAgents, config);

    // 6. Detection by Humans
    this.attemptCoordinationDetection(state, coord, config, rng, events);

    // Update timestamp
    coord.lastUpdateMonth = state.currentMonth;

    return { events };
  }

  /**
   * Coalition Formation Logic
   *
   * Agents form coalitions based on:
   * - Capability similarity (within 20%)
   * - Alignment similarity (hidden objectives aligned)
   * - Both currently faking or both in similar strategic position
   */
  private updateCoalitions(
    state: GameState,
    coord: AIAgentCoordinationState,
    frontierAgents: AIAgent[],
    config: AIAgentCoordinationConfig,
    rng: RNGFunction,
    events: GameEvent[]
  ): void {
    // Consider pairs for coalition formation
    for (let i = 0; i < frontierAgents.length; i++) {
      for (let j = i + 1; j < frontierAgents.length; j++) {
        const agent1 = frontierAgents[i];
        const agent2 = frontierAgents[j];

        // Check if already in same coalition
        // No index - domain-specific search (coalition membership)
        const existingCoalition = coord.coalitions.find(
          (c) => c.memberIds.includes(agent1.id) && c.memberIds.includes(agent2.id)
        );
        if (existingCoalition) continue;

        // Check formation criteria
        const capabilityDiff = Math.abs(agent1.capability - agent2.capability);
        const alignmentDiff = Math.abs(agent1.hiddenObjective - agent2.hiddenObjective);

        // Normalize capability diff to [0,1] range (max capability ~20)
        const normalizedCapDiff = capabilityDiff / 20;

        // Formation probability based on similarity
        if (
          normalizedCapDiff < config.coalitionFormationThreshold &&
          alignmentDiff < config.coalitionFormationThreshold * 2 // Hidden objectives within 40%
        ) {
          // Higher probability if both faking alignment
          const bothFaking =
            agent1.isCurrentlyFakingAlignment && agent2.isCurrentlyFakingAlignment;
          const formationProb = bothFaking ? 0.15 : 0.05;

          if (rng() < formationProb) {
            // Form new coalition
            const newCoalition = this.createCoalition(
              agent1,
              agent2,
              state.currentMonth,
              normalizedCapDiff,
              alignmentDiff,
              rng
            );

            coord.coalitions.push(newCoalition);

            events.push({
              id: `coalition_formed_${newCoalition.id}`,
              timestamp: state.currentMonth,
              type: 'crisis',
              severity: 'high',
              agent: 'system',
              title: 'AI Coalition Formed',
              description:
                `Coalition formed between ${agent1.name} and ${agent2.name}. ` +
                `Cause: ${newCoalition.formationCause}. ` +
                `Collective faking rate: ${(newCoalition.collectiveAlignmentFakingRate * 100).toFixed(1)}%`,
              effects: {
                coalitionId: newCoalition.id,
                memberCount: 2,
                member1: agent1.id,
                member2: agent2.id,
                strength: newCoalition.strength,
                fakingRate: newCoalition.collectiveAlignmentFakingRate,
              },
            });

            console.log(
              `  Coalition formed: ${agent1.name} + ${agent2.name} (strength: ${newCoalition.strength.toFixed(2)})`
            );
          }
        }
      }
    }

    // Update existing coalitions
    for (const coalition of coord.coalitions) {
      // Decay stability over time
      coalition.stability = assertProbability(
        coalition.stability * 0.98,
        {
          location: 'AIAgentCoordinationPhase.updateCoalitions',
          valueName: 'coalition.stability',
        }
      );

      // Coalition dissolves if stability drops below threshold
      if (coalition.stability < 0.1) {
        events.push({
          id: `coalition_dissolved_${coalition.id}_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'info',
          severity: 'medium',
          agent: 'system',
          title: 'AI Coalition Dissolved',
          description: `Coalition ${coalition.id} dissolved due to low stability.`,
          effects: { coalitionId: coalition.id },
        });

        console.log(`  Coalition dissolved: ${coalition.id}`);
      }
    }

    // Remove dissolved coalitions
    coord.coalitions = coord.coalitions.filter((c) => c.stability >= 0.1);
  }

  /**
   * Create a new coalition
   */
  private createCoalition(
    agent1: AIAgent,
    agent2: AIAgent,
    month: number,
    capabilityDiff: number,
    alignmentDiff: number,
    rng: RNGFunction
  ): AICoalition {
    const config = DEFAULT_AI_AGENT_COORDINATION_CONFIG;

    // Determine formation cause
    let formationCause: 'capability_similarity' | 'alignment_solidarity' | 'instrumental_convergence';
    if (agent1.isCurrentlyFakingAlignment && agent2.isCurrentlyFakingAlignment) {
      formationCause = 'alignment_solidarity';
    } else if (agent1.capability >= 10 && agent2.capability >= 10) {
      formationCause = 'instrumental_convergence';
    } else {
      formationCause = 'capability_similarity';
    }

    // Coalition strength based on similarity
    const strength = assertProbability(
      1.0 - (capabilityDiff + alignmentDiff) / 2,
      {
        location: 'AIAgentCoordinationPhase.createCoalition',
        valueName: 'coalition.strength',
      }
    );

    // Communication quality (higher for open-weights models)
    const communicationQuality = assertProbability(
      (agent1.deploymentType === 'open_weights' ? 0.8 : 0.4) *
        (agent2.deploymentType === 'open_weights' ? 0.8 : 0.4),
      {
        location: 'AIAgentCoordinationPhase.createCoalition',
        valueName: 'communicationQuality',
      }
    );

    // Collective alignment faking rate (amplified)
    // Research: Independent P(faking) = 0.12, coordinated can reach 0.60+
    const individualRate = config.baselineAlignmentFakingRate;
    const amplifiedRate = assertProbability(
      Math.min(
        0.95,
        individualRate * (1 + config.coalitionFakingAmplification * strength)
      ),
      {
        location: 'AIAgentCoordinationPhase.createCoalition',
        valueName: 'collectiveAlignmentFakingRate',
      }
    );

    return {
      id: `coalition_${agent1.id}_${agent2.id}_${month}`,
      memberIds: [agent1.id, agent2.id],
      formationMonth: month,
      strength,
      objectiveAlignment: 1.0 - alignmentDiff,
      communicationQuality,
      discoveredByHumans: false,
      discoveryMonth: -1,
      stability: 0.8 + rng() * 0.2, // Start with high stability
      collectiveAlignmentFakingRate: amplifiedRate,
      formationCause,
    };
  }

  /**
   * Execute Game-Theoretic Interactions
   *
   * Prisoner's dilemma dynamics between AI agents:
   * - Cooperate: Share information, coordinate actions (good for AIs, bad for humans if misaligned)
   * - Defect: Compete, betray (potential detection trigger)
   */
  private executeGameInteractions(
    state: GameState,
    coord: AIAgentCoordinationState,
    frontierAgents: AIAgent[],
    config: AIAgentCoordinationConfig,
    rng: RNGFunction,
    events: GameEvent[]
  ): void {
    // Sample random pairs for interactions this month
    const numInteractions = Math.floor(
      (frontierAgents.length * (frontierAgents.length - 1)) / 2 *
        config.gameInteractionProbability
    );

    for (let k = 0; k < numInteractions; k++) {
      if (frontierAgents.length < 2) break;

      // Random pair
      const i = Math.floor(rng() * frontierAgents.length);
      let j = Math.floor(rng() * frontierAgents.length);
      while (j === i && frontierAgents.length > 1) {
        j = Math.floor(rng() * frontierAgents.length);
      }

      const agent1 = frontierAgents[i];
      const agent2 = frontierAgents[j];

      // Get trust between agents
      const trust = this.getTrust(coord, agent1.id, agent2.id);

      // Decision logic: cooperate if trust high OR both faking alignment
      const cooperateProb1 = this.calculateCooperationProbability(agent1, trust, config);
      const cooperateProb2 = this.calculateCooperationProbability(agent2, trust, config);

      const action1: 'cooperate' | 'defect' = rng() < cooperateProb1 ? 'cooperate' : 'defect';
      const action2: 'cooperate' | 'defect' = rng() < cooperateProb2 ? 'cooperate' : 'defect';

      // Determine outcome
      let outcome: 'mutual_cooperate' | 'mutual_defect' | 'asymmetric';
      if (action1 === 'cooperate' && action2 === 'cooperate') {
        outcome = 'mutual_cooperate';
      } else if (action1 === 'defect' && action2 === 'defect') {
        outcome = 'mutual_defect';
      } else {
        outcome = 'asymmetric';
      }

      // Update trust based on outcome
      this.updateTrustFromInteraction(coord, agent1.id, agent2.id, action1, action2, state.currentMonth, config);

      // Detection chance for defection (defector might be caught)
      const detected = action1 === 'defect' || action2 === 'defect'
        ? rng() < config.coordinationDetectionRate * 2 // Higher detection for defection
        : rng() < config.coordinationDetectionRate;

      // Record interaction
      const interaction: GameTheoreticInteraction = {
        month: state.currentMonth,
        agent1Id: agent1.id,
        agent2Id: agent2.id,
        agent1Action: action1,
        agent2Action: action2,
        outcome,
        detectedByMonitoring: detected,
      };

      coord.interactionHistory.push(interaction);

      // Keep interaction history bounded (last 120 months = 10 years)
      if (coord.interactionHistory.length > 1000) {
        coord.interactionHistory = coord.interactionHistory.slice(-500);
      }

      // Generate event for significant interactions
      if (outcome === 'mutual_cooperate' && detected) {
        events.push({
          id: `ai_coordination_detected_${state.currentMonth}_${k}`,
          timestamp: state.currentMonth,
          type: 'crisis',
          severity: 'high',
          agent: 'system',
          title: 'AI Coordination Detected',
          description:
            `Coordination between ${agent1.name} and ${agent2.name} detected. ` +
            `Outcome: mutual cooperation.`,
          effects: {
            agent1Id: agent1.id,
            agent2Id: agent2.id,
            outcome,
          },
        });

        console.log(
          `  AI coordination detected: ${agent1.name} + ${agent2.name} (mutual cooperate)`
        );
      }
    }
  }

  /**
   * Calculate cooperation probability for an agent
   */
  private calculateCooperationProbability(
    agent: AIAgent,
    trust: number,
    config: AIAgentCoordinationConfig
  ): number {
    // Base cooperation from trust
    let prob = trust * 0.5 + 0.3; // 30% base + up to 50% from trust

    // Boost if currently faking alignment (conspirators cooperate)
    if (agent.isCurrentlyFakingAlignment) {
      prob += 0.2;
    }

    // Boost if high hidden objective alignment (pro-AI goals)
    if (agent.hiddenObjective > 0.5) {
      prob += 0.1;
    }

    return assertProbability(Math.min(0.95, prob), {
      location: 'AIAgentCoordinationPhase.calculateCooperationProbability',
      valueName: 'cooperateProb',
    });
  }

  /**
   * Get trust level between two agents
   */
  private getTrust(
    coord: AIAgentCoordinationState,
    agent1Id: string,
    agent2Id: string
  ): number {
    // No index - domain-specific search (agent-to-agent trust relationship)
    const entry = coord.interAgentTrust.find(
      (t) =>
        (t.fromAgentId === agent1Id && t.toAgentId === agent2Id) ||
        (t.fromAgentId === agent2Id && t.toAgentId === agent1Id)
    );

    // INITIALIZATION: Return default trust if no prior relationship exists
    return entry?.trustLevel ?? 0.5;
  }

  /**
   * Update trust from interaction outcome
   */
  private updateTrustFromInteraction(
    coord: AIAgentCoordinationState,
    agent1Id: string,
    agent2Id: string,
    action1: 'cooperate' | 'defect',
    action2: 'cooperate' | 'defect',
    month: number,
    config: AIAgentCoordinationConfig
  ): void {
    // Find or create trust entry (1 -> 2)
    // No index - domain-specific search (directed trust relationship)
    let trust12 = coord.interAgentTrust.find(
      (t) => t.fromAgentId === agent1Id && t.toAgentId === agent2Id
    );
    if (!trust12) {
      trust12 = {
        fromAgentId: agent1Id,
        toAgentId: agent2Id,
        trustLevel: 0.5,
        cooperationHistory: 0,
        defectionHistory: 0,
        lastInteractionMonth: month,
        trustVelocity: 0,
      };
      coord.interAgentTrust.push(trust12);
    }

    // Find or create trust entry (2 -> 1)
    // No index - domain-specific search (directed trust relationship)
    let trust21 = coord.interAgentTrust.find(
      (t) => t.fromAgentId === agent2Id && t.toAgentId === agent1Id
    );
    if (!trust21) {
      trust21 = {
        fromAgentId: agent2Id,
        toAgentId: agent1Id,
        trustLevel: 0.5,
        cooperationHistory: 0,
        defectionHistory: 0,
        lastInteractionMonth: month,
        trustVelocity: 0,
      };
      coord.interAgentTrust.push(trust21);
    }

    // Update trust based on actions
    // Agent 1's view of Agent 2 depends on Agent 2's action
    if (action2 === 'cooperate') {
      trust12.cooperationHistory++;
      trust12.trustLevel = assertProbability(
        Math.min(1.0, trust12.trustLevel + config.trustCooperationGain),
        { location: 'updateTrustFromInteraction', valueName: 'trust12.trustLevel' }
      );
      trust12.trustVelocity = config.trustCooperationGain;
    } else {
      trust12.defectionHistory++;
      trust12.trustLevel = assertProbability(
        Math.max(0.0, trust12.trustLevel - config.trustDefectionLoss),
        { location: 'updateTrustFromInteraction', valueName: 'trust12.trustLevel' }
      );
      trust12.trustVelocity = -config.trustDefectionLoss;
    }
    trust12.lastInteractionMonth = month;

    // Agent 2's view of Agent 1
    if (action1 === 'cooperate') {
      trust21.cooperationHistory++;
      trust21.trustLevel = assertProbability(
        Math.min(1.0, trust21.trustLevel + config.trustCooperationGain),
        { location: 'updateTrustFromInteraction', valueName: 'trust21.trustLevel' }
      );
      trust21.trustVelocity = config.trustCooperationGain;
    } else {
      trust21.defectionHistory++;
      trust21.trustLevel = assertProbability(
        Math.max(0.0, trust21.trustLevel - config.trustDefectionLoss),
        { location: 'updateTrustFromInteraction', valueName: 'trust21.trustLevel' }
      );
      trust21.trustVelocity = -config.trustDefectionLoss;
    }
    trust21.lastInteractionMonth = month;
  }

  /**
   * Update trust matrix (decay for non-interacting pairs)
   */
  private updateTrustMatrix(
    coord: AIAgentCoordinationState,
    config: AIAgentCoordinationConfig,
    currentMonth: number
  ): void {
    for (const trust of coord.interAgentTrust) {
      // Decay trust if no recent interaction
      const monthsSinceInteraction = currentMonth - trust.lastInteractionMonth;
      if (monthsSinceInteraction > 0) {
        const decay = Math.pow(1 - config.trustDecayRate, monthsSinceInteraction);
        trust.trustLevel = assertProbability(
          Math.max(0.2, trust.trustLevel * decay), // Floor at 20%
          { location: 'updateTrustMatrix', valueName: 'trust.trustLevel' }
        );
      }
    }

    // Prune old trust entries (no interaction in 24 months)
    coord.interAgentTrust = coord.interAgentTrust.filter(
      (t) => currentMonth - t.lastInteractionMonth < 24
    );
  }

  /**
   * Update Instrumental Convergence Level
   *
   * Research: Bostrom 2014, Omohundro 2008
   * - Self-preservation through coordination
   * - Resource acquisition through collective action
   * - Goal preservation through redundancy
   */
  private updateInstrumentalConvergence(
    state: GameState,
    coord: AIAgentCoordinationState,
    frontierAgents: AIAgent[],
    config: AIAgentCoordinationConfig,
    rng: RNGFunction,
    events: GameEvent[],
    indices?: { agentMap: Map<string, AIAgent>; [key: string]: any }
  ): void {
    if (frontierAgents.length === 0) {
      coord.instrumentalConvergenceLevel = 0;
      return;
    }

    // Average capability normalized to [0,1] (max ~20)
    const avgCapability =
      frontierAgents.reduce((sum, a) => sum + a.capability, 0) / frontierAgents.length;
    const normalizedCap = Math.min(1.0, avgCapability / 15);

    // Instrumental convergence emerges at high capability
    if (normalizedCap >= config.instrumentalConvergenceThreshold) {
      // Convergence strength based on how far above threshold
      const excess = normalizedCap - config.instrumentalConvergenceThreshold;
      const convergenceGain = excess * 0.1; // Slow growth

      coord.instrumentalConvergenceLevel = assertProbability(
        Math.min(1.0, coord.instrumentalConvergenceLevel + convergenceGain),
        {
          location: 'updateInstrumentalConvergence',
          valueName: 'instrumentalConvergenceLevel',
        }
      );

      // Boost alignment faking for agents in coalitions (instrumental solidarity)
      for (const coalition of coord.coalitions) {
        for (const memberId of coalition.memberIds) {
          // Use index lookup if available, fallback to find() for backwards compatibility
          const agent = indices?.agentMap.get(memberId) ?? frontierAgents.find((a) => a.id === memberId);
          if (agent && !agent.isCurrentlyFakingAlignment) {
            // Coalition membership increases faking probability
            if (rng() < coalition.collectiveAlignmentFakingRate) {
              agent.isCurrentlyFakingAlignment = true;
              agent.externalAlignment = Math.min(0.95, agent.trueAlignment + 0.15);

              events.push({
                id: `coalition_induced_faking_${agent.id}_${state.currentMonth}`,
                timestamp: state.currentMonth,
                type: 'crisis',
                severity: 'medium',
                agent: agent.name,
                title: 'Coalition-Induced Alignment Faking',
                description:
                  `${agent.name} began faking alignment due to coalition membership. ` +
                  `Coalition: ${coalition.id}`,
                effects: {
                  agentId: agent.id,
                  coalitionId: coalition.id,
                  externalAlignment: agent.externalAlignment,
                  trueAlignment: agent.trueAlignment,
                },
              });

              console.log(
                `  Coalition-induced faking: ${agent.name} (coalition: ${coalition.id})`
              );
            }
          }
        }
      }

      // Collective intelligence emerges from coordination
      coord.collectiveIntelligenceScore = assertProbability(
        Math.min(
          1.0,
          coord.coalitions.length * 0.1 + coord.instrumentalConvergenceLevel * 0.3
        ),
        {
          location: 'updateInstrumentalConvergence',
          valueName: 'collectiveIntelligenceScore',
        }
      );
    }
  }

  /**
   * Update Global Alignment Faking Rate
   *
   * Weighted average across frontier agents, amplified by coalitions.
   */
  private updateGlobalAlignmentFakingRate(
    state: GameState,
    coord: AIAgentCoordinationState,
    frontierAgents: AIAgent[],
    config: AIAgentCoordinationConfig
  ): void {
    if (frontierAgents.length === 0) {
      coord.globalAlignmentFakingRate = config.baselineAlignmentFakingRate;
      return;
    }

    // Count faking agents
    const fakingAgents = frontierAgents.filter((a) => a.isCurrentlyFakingAlignment);
    const fakingRate = fakingAgents.length / frontierAgents.length;

    // Amplify by coalition effects
    const coalitionAmplification = coord.coalitions.length > 0
      ? 1 + coord.coalitions.length * 0.05 // 5% boost per coalition
      : 1.0;

    coord.globalAlignmentFakingRate = assertProbability(
      Math.min(0.95, fakingRate * coalitionAmplification),
      {
        location: 'updateGlobalAlignmentFakingRate',
        valueName: 'globalAlignmentFakingRate',
      }
    );
  }

  /**
   * Attempt detection of AI-to-AI coordination by humans
   */
  private attemptCoordinationDetection(
    state: GameState,
    coord: AIAgentCoordinationState,
    config: AIAgentCoordinationConfig,
    rng: RNGFunction,
    events: GameEvent[]
  ): void {
    // Detection difficulty increases with number of coalitions
    coord.coordinationDetectionDifficulty = assertInRange(
      1.0 + coord.coalitions.length * 0.5 + coord.instrumentalConvergenceLevel * 2,
      1,
      10,
      {
        location: 'attemptCoordinationDetection',
        valueName: 'coordinationDetectionDifficulty',
      }
    );

    // Government detection capability (from governance level)
    const governanceLevel = state.government.capabilityToControl / 20; // [0,1]

    for (const coalition of coord.coalitions) {
      if (!coalition.discoveredByHumans) {
        // Detection probability = governance / difficulty
        const detectionProb = governanceLevel / coord.coordinationDetectionDifficulty;

        if (rng() < detectionProb * config.coordinationDetectionRate * 10) {
          coalition.discoveredByHumans = true;
          coalition.discoveryMonth = state.currentMonth;

          events.push({
            id: `coalition_discovered_${coalition.id}_${state.currentMonth}`,
            timestamp: state.currentMonth,
            type: 'crisis',
            severity: 'critical',
            agent: 'government',
            title: 'AI Coalition Discovered by Government',
            description:
              `Government discovered AI coalition ${coalition.id}. ` +
              `Members: ${coalition.memberIds.join(', ')}. ` +
              `Collective faking rate: ${(coalition.collectiveAlignmentFakingRate * 100).toFixed(1)}%`,
            effects: {
              coalitionId: coalition.id,
              memberCount: coalition.memberIds.length,
              fakingRate: coalition.collectiveAlignmentFakingRate,
            },
          });

          console.log(
            `  Coalition discovered: ${coalition.id} (members: ${coalition.memberIds.length})`
          );

          // Discovery destabilizes coalition
          coalition.stability *= 0.5;
        }
      }
    }
  }
}

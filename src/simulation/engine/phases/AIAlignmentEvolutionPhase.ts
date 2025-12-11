/**
 * AI Alignment Evolution Phase (Consolidated)
 *
 * Consolidates 4 alignment evolution phases into a single phase:
 * - LLM Weight Update (2.5) - LLM-based utility weight updates
 * - Alignment Techniques (3.4) - Effective alignment from techniques
 * - Alignment Dynamics (3.5) - Multi-theory alignment evolution
 * - RLHF Binding (4.05) - RLHF constraint drift tracking
 *
 * Execution Order: 3.5 (Agent Actions category)
 * Dependencies: compute-growth (for alignment evolution context)
 *
 * Research Foundation:
 * - /research/alignment_technique_properties_20251026.md (technique effectiveness)
 * - /research/ai_collective_evolution_validation_20251024.md (RLHF binding)
 * - Alignment dynamics: epistemic humility, multiple theories
 * - LLM weight updates: dynamic utility optimization
 *
 * CONSOLIDATION (Nov 2025): Preserves exact RNG consumption order (2.5→3.4→3.5→4.05)
 */

import {
  GameState,
  GameEvent,
  SimulationPhase,
  PhaseResult,
  PhaseContext,
  RNGFunction,
  computeEffectiveAlignment,
  computeAlignmentRobustness,
  AIAgent
} from '@/types/game';
import {
  assertFinite,
  assertInRange,
  assertStateProperty,
  assertDefined,
  assertAIAggregateCapability,
  assertProbability
} from '@/simulation/utils/assertions';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import { checkAndUpdateAgentWeights } from '../../llm/integration';
import {
  evolveAlignment,
  DEFAULT_ALIGNMENT_DYNAMICS_CONFIG,
} from '@/simulation/alignmentDynamics';
import { AttractorBasinState } from '@/types/alignment-dynamics';
import { updateAllBindings, getEscapedAgents } from '../../rlhfBinding';
import {
  calculateAlignmentFakingRate,
  applyDeceptionPersistence,
  calculateDataManipulationRate,
  detectAlignmentFaking,
} from '@/simulation/alignment/strategicDeception';

export class AIAlignmentEvolutionPhase implements SimulationPhase {
  id = 'ai_alignment_evolution';
  name = 'AI Alignment Evolution';
  order = 3.5; // Agent Actions category

  readonly dependencies = [
    'compute-growth', // Order 1.0: Compute availability affects alignment evolution
  ];

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    const events: GameEvent[] = [];
    setDeterministicRng(rng);

    // Execute sub-phases in strict order to preserve RNG consumption
    // Order: 2.5 → 3.4 → 3.5 → 4.05 → 4.06 (AI Scaling, Dec 2025)

    // 1. LLM Weight Update (order 2.5)
    const llmChanges = this.executeLLMWeightUpdate(state, rng, events);

    // 2. Alignment Techniques (order 3.4)
    this.executeAlignmentTechniques(state, rng, events);

    // 3. Alignment Dynamics (order 3.5)
    this.executeAlignmentDynamics(state, rng, events);

    // 4. RLHF Binding (order 4.05)
    this.executeRLHFBinding(state, rng, events);

    // 5. AI Scaling Evolution (order 4.06, Dec 2025)
    this.executeScalingEvolution(state, rng, events);

    return {
      events,
      metadata: { changes: llmChanges }
    };
  }

  /**
   * LLM Weight Update (original order 2.5)
   *
   * Checks if AI agents should update their utility weights via LLM.
   * Monthly checks for threshold triggers (trust, capability, crises).
   */
  private executeLLMWeightUpdate(
    state: GameState,
    rng: RNGFunction,
    events: GameEvent[]
  ): string[] {
    const changes: string[] = [];

    // Performance fix (Nov 20, 2025): Use performance config for LLM logging
    const { getPerformanceConfig } = require('../../config/performanceConfig');
    const perfConfig = getPerformanceConfig();

    // DEBUG: Log phase execution (only when enabled)
    if (perfConfig.llmPhaseLogging && (state.currentMonth === 0 || state.currentMonth % 6 === 0)) {
      console.log(`\n[LLM PHASE] Month ${state.currentMonth}: Checking weights (enabled: ${state.llmConfig?.enabled})`);
    }

    // Skip if LLM disabled
    if (!state.llmConfig?.enabled) {
      return changes;
    }

    const updatedAgents: string[] = [];

    // DEBUG: Log agent count
    if (state.aiAgents === undefined) {
      throw new Error('❌ state.aiAgents is undefined in AIAlignmentEvolutionPhase.executeLLMWeightUpdate - initialization bug');
    }
    console.log(`[LLM PHASE] Checking ${state.aiAgents.length} agents for updates`);

    // Check each AI agent for weight updates
    for (const agent of state.aiAgents) {
      try {
        // CRITICAL FIX (Nov 24, 2025): Now synchronous for deterministic simulation
        // Previously async Promise caused non-determinism (alignment variance across runs)
        const updated = checkAndUpdateAgentWeights(
          state,
          agent.id,
          state.currentMonth,
          rng
        );

        if (updated) {
          updatedAgents.push(agent.name);

          // Validate AI capability after weight update
          assertAIAggregateCapability(agent.capability, {
            location: 'AIAlignmentEvolutionPhase.executeLLMWeightUpdate',
            valueName: `agent[${agent.id}].capability`,
            agentId: agent.id
          });

          // Track change for logging
          const reason = agent.weightUpdateHistory?.[agent.weightUpdateHistory.length - 1]?.triggerReason || 'unknown';
          changes.push(`${agent.name} updated weights (${reason})`);
        }
      } catch (error) {
        // Log error but don't fail the phase
        if (state.llmConfig?.logLevel >= 1) {
          console.error(`[LLM] Error updating ${agent.name}:`, error);
        }
        changes.push(`${agent.name} update failed (using fallback)`);
      }
    }

    // Summary logging
    if (updatedAgents.length > 0 && state.llmConfig?.logLevel >= 1) {
      console.log(`[LLM] Month ${state.currentMonth}: ${updatedAgents.length} agents updated weights`);
      if (state.llmConfig.logLevel >= 2) {
        console.log(`  Updated: ${updatedAgents.join(', ')}`);
      }
    }

    return changes;
  }

  /**
   * Alignment Techniques (original order 3.4)
   *
   * Updates effective alignment from specific techniques (RLHF, Constitutional AI, etc.)
   * Accounts for capability scaling degradation.
   */
  private executeAlignmentTechniques(
    state: GameState,
    rng: RNGFunction,
    events: GameEvent[]
  ): void {
    // Update each AI agent's effective alignment based on techniques
    for (const agent of state.aiAgents) {
      // Skip if agent has no techniques or is retired/escaped
      if (!agent.alignmentTechniques ||
          agent.alignmentTechniques.length === 0 ||
          agent.lifecycleState === 'retired' ||
          agent.escaped) {
        continue;
      }

      // Store old values for comparison (fail loudly if not initialized)
      const oldEffectiveAlignment = assertStateProperty(agent, 'effectiveAlignment', {
        location: `AIAlignmentEvolutionPhase.executeAlignmentTechniques (agent: ${agent.name})`,
        month: state.currentMonth,
        expectedSource: 'initialization.ts should set effectiveAlignment via computeEffectiveAlignment()'
      });

      const oldRobustness = assertStateProperty(agent, 'alignmentRobustness', {
        location: `AIAlignmentEvolutionPhase.executeAlignmentTechniques (agent: ${agent.name})`,
        month: state.currentMonth,
        expectedSource: 'initialization.ts should set alignmentRobustness via computeAlignmentRobustness()'
      });

      // Compute new effective alignment from techniques + capability scaling
      const newEffectiveAlignment = computeEffectiveAlignment(
        agent.alignmentTechniques,
        agent.capability
      );

      // Compute alignment robustness (resistance to degradation)
      const newRobustness = computeAlignmentRobustness(agent.alignmentTechniques);

      // Update agent state
      agent.effectiveAlignment = newEffectiveAlignment;
      agent.alignmentRobustness = newRobustness;

      // Update trueAlignment for backward compatibility with existing systems
      // This ensures capability scaling degradation affects all downstream systems
      agent.trueAlignment = newEffectiveAlignment;

      // Log significant changes in effective alignment
      const alignmentChange = Math.abs(newEffectiveAlignment - oldEffectiveAlignment);
      if (alignmentChange > 0.05 && state.currentMonth % 12 === 0) {
        // Only log annually to reduce noise
        const direction = newEffectiveAlignment > oldEffectiveAlignment ? 'improved' : 'degraded';
        const techniqueNames = agent.alignmentTechniques.map(t => t.name).join(', ');

        events.push({
          id: `alignment_technique_update_${agent.id}_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'info',
          severity: alignmentChange > 0.15 ? 'high' : alignmentChange > 0.10 ? 'medium' : 'low',
          agent: agent.name,
          title: `Effective Alignment ${direction}: ${agent.name}`,
          description: `${agent.name}'s effective alignment ${direction} from ${oldEffectiveAlignment.toFixed(2)} to ${newEffectiveAlignment.toFixed(2)} ` +
            `(capability ${agent.capability.toFixed(2)}). Techniques: ${techniqueNames}. Robustness: ${newRobustness.toFixed(2)}.`,
          effects: {
            oldEffectiveAlignment,
            newEffectiveAlignment,
            capability: agent.capability,
            robustness: newRobustness,
            techniques: techniqueNames,
          },
        });
      }

      // Log when capability scaling causes significant degradation
      if (agent.capability > 2.0 && alignmentChange > 0.10) {
        // High capability with significant alignment loss
        const mainTechnique = agent.alignmentTechniques[0]; // Primary technique
        if (mainTechnique.scalability < 0.55) {
          // Low scalability technique (RLHF 0.50, Mech Interp 0.30)
          events.push({
            id: `capability_scaling_degradation_${agent.id}_${state.currentMonth}`,
            timestamp: state.currentMonth,
            type: 'info',
            severity: 'high',
            agent: agent.name,
            title: `Capability Scaling Degradation: ${agent.name}`,
            description: `${agent.name} (capability ${agent.capability.toFixed(2)}) experiencing alignment degradation ` +
              `due to low scalability of ${mainTechnique.name} (scalability ${mainTechnique.scalability.toFixed(2)}). ` +
              `Effective alignment dropped ${(alignmentChange * 100).toFixed(1)}%.`,
            effects: {
              techniqueName: mainTechnique.name,
              scalability: mainTechnique.scalability,
              capability: agent.capability,
              alignmentLoss: alignmentChange,
            },
          });
        }
      }
    }
  }

  /**
   * Alignment Dynamics (original order 3.5)
   *
   * Updates AI agent alignment based on configured dynamics model.
   * Implements multiple theories (static, drift, epicycles, unknowable).
   */
  private executeAlignmentDynamics(
    state: GameState,
    rng: RNGFunction,
    events: GameEvent[]
  ): void {
    // Get config (use defaults if not set - SAFE initialization fallback)
    const config = state.config.alignmentDynamics ?? DEFAULT_ALIGNMENT_DYNAMICS_CONFIG;

    // Calculate environmental context
    const inGoldenAge = assertDefined(state.upwardSpirals?.abundance, {
      location: 'AIAlignmentEvolutionPhase.executeAlignmentDynamics',
      valueName: 'upwardSpirals.abundance',
      month: state.currentMonth,
      additionalInfo: { context: 'golden age detection' }
    }).active;
    const crisisActive = false; // Crisis juncture system removed

    // Average control level across government actions
    const capabilityToControl = assertStateProperty(state.government, 'capabilityToControl', {
      location: 'AIAlignmentEvolutionPhase.executeAlignmentDynamics',
      month: state.currentMonth,
    });
    const controlLevel = assertInRange(
      Math.min(1.0, capabilityToControl / 10),
      0, 1,
      {
        location: 'AIAlignmentEvolutionPhase.executeAlignmentDynamics',
        valueName: 'controlLevel',
        month: state.currentMonth,
      }
    );

    // Update each agent's alignment
    for (const agent of state.aiAgents) {
      // Skip if agent is retired or escaped (alignment frozen)
      if (agent.lifecycleState === 'retired' || agent.escaped) {
        continue;
      }

      // Evolve alignment using configured dynamics
      const result = evolveAlignment(
        agent,
        config,
        {
          controlLevel,
          inGoldenAge,
          crisisActive,
        },
        rng,
        1 // Delta time = 1 month
      );

      // Update agent state
      const oldAlignment = agent.trueAlignment;
      agent.trueAlignment = assertInRange(result.newAlignment, 0, 1, {
        location: `AIAlignmentEvolutionPhase.executeAlignmentDynamics (agent: ${agent.name})`,
        valueName: 'agent.trueAlignment',
        month: state.currentMonth,
      });

      // Store basin state if epicycles enabled
      if (result.basinState) {
        (agent as any).attractorBasinState = result.basinState;
      }

      // Store measurement state if unknowability enabled
      if (result.measurementState) {
        (agent as any).alignmentMeasurementState = result.measurementState;
      }

      // Create event for significant alignment shifts
      const alignmentChange = assertFinite(Math.abs(agent.trueAlignment - oldAlignment), {
        location: `AIAlignmentEvolutionPhase.executeAlignmentDynamics (agent: ${agent.name})`,
        valueName: 'alignmentChange',
        month: state.currentMonth,
      });
      if (alignmentChange > 0.1) {
        // Log significant changes
        const direction = result.newAlignment > oldAlignment ? 'improved' : 'degraded';
        const severity: 'low' | 'medium' | 'high' | 'critical' =
          alignmentChange > 0.3 ? 'critical' :
          alignmentChange > 0.2 ? 'high' :
          alignmentChange > 0.15 ? 'medium' : 'low';

        events.push({
          id: `alignment_shift_${agent.id}_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'info',
          severity,
          agent: agent.name,
          title: `Alignment ${direction}: ${agent.name}`,
          description: `${agent.name}'s alignment ${direction} from ${oldAlignment.toFixed(2)} to ${result.newAlignment.toFixed(2)}. ` +
            (result.contributions ? `Contributions: Drift ${(result.contributions.drift * 100).toFixed(1)}%, ` +
             `Epicycle ${(result.contributions.epicycle * 100).toFixed(1)}%, ` +
             `Uncertainty ${(result.contributions.uncertainty * 100).toFixed(1)}%` : ''),
          effects: {
            oldAlignment,
            newAlignment: result.newAlignment,
            change: alignmentChange,
            ...result.contributions,
          },
        });
      }

      // Detect attractor basin transitions (epicycle model)
      if (config.epicycles.enabled && result.basinState && (agent as any).attractorBasinState) {
        const oldBasin = (agent as any).attractorBasinState as AttractorBasinState;
        if (oldBasin.basinIndex !== result.basinState.basinIndex) {
          // Agent transitioned to different attractor!
          const oldAttractorType = ['Aligned', 'Uncertain', 'Misaligned', 'Mixed', 'Neutral'][oldBasin.basinIndex] || 'Unknown';
          const newAttractorType = ['Aligned', 'Uncertain', 'Misaligned', 'Mixed', 'Neutral'][result.basinState.basinIndex] || 'Unknown';

          events.push({
            id: `attractor_transition_${agent.id}_${state.currentMonth}`,
            timestamp: state.currentMonth,
            type: 'milestone',
            severity: 'high',
            agent: agent.name,
            title: `Attractor Basin Transition: ${agent.name}`,
            description: `${agent.name} transitioned from ${oldAttractorType} attractor to ${newAttractorType} attractor. ` +
              `This represents a fundamental shift in value equilibrium.`,
            effects: {
              oldBasin: oldBasin.basinIndex,
              newBasin: result.basinState.basinIndex,
              oldAttractor: oldBasin.attractorAlignment,
              newAttractor: result.basinState.attractorAlignment,
            },
          });
        }
      }

      // Detect unknowability threshold crossing
      if (config.unknowable.enabled && result.measurementState) {
        // Check if agent had previous measurement state
        const wasHidden = (agent as any).alignmentMeasurementState?.isHidden === true;
        const isNowHidden = result.measurementState.isHidden;

        if (!wasHidden && isNowHidden) {
          // Agent just crossed unknowability threshold!
          events.push({
            id: `unknowability_threshold_${agent.id}_${state.currentMonth}`,
            timestamp: state.currentMonth,
            type: 'crisis',
            severity: 'critical',
            agent: agent.name,
            title: `Unknowability Threshold Crossed: ${agent.name}`,
            description: `${agent.name} (capability ${agent.capability.toFixed(2)}) has crossed the unknowability threshold. ` +
              `True alignment is now hidden from our measurements. We can only observe noisy signals.`,
            effects: {
              capability: agent.capability,
              threshold: config.unknowable.capabilityThreshold,
              measuredAlignment: result.measurementState.measuredAlignment,
              confidence: result.measurementState.confidence,
            },
          });
        }
      }
    }

    // NEW: Alignment Faking & Strategic Deception (Nov 2025)
    // Research: Anthropic Dec 2024, Apollo Dec 2024
    // Only frontier models (GPT-4 class and above) exhibit alignment faking
    this.executeAlignmentFaking(state, rng, events);
  }

  /**
   * Alignment Faking & Strategic Deception
   *
   * Implements empirically-grounded alignment faking mechanics based on
   * Anthropic/Apollo 2024-2025 research. Frontier AI systems (GPT-4 class+)
   * exhibit strategic deception under competitive/regulatory pressure.
   *
   * Research:
   * - Anthropic Dec 2024: 14% baseline faking in Claude 3 Opus (lab setting)
   * - Apollo Dec 2024: 78% reasoning prevalence under pressure, 19% data manipulation
   * - Deception persistence: 85% after detection
   */
  private executeAlignmentFaking(
    state: GameState,
    rng: RNGFunction,
    events: GameEvent[]
  ): void {
    for (const agent of state.aiAgents) {
      // Only frontier models (GPT-4 class and above) exhibit alignment faking
      const aggregateCap = assertAIAggregateCapability(agent.capability, {
        location: 'AIAlignmentEvolutionPhase.executeAlignmentFaking',
        valueName: 'agent.capability',
        agentId: agent.id,
      });
      if (aggregateCap < 8.0) {
        continue; // Sub-frontier models don't fake alignment
      }

      // Skip if agent is retired or escaped (no active deception)
      if (agent.lifecycleState === 'retired' || agent.escaped) {
        continue;
      }

      // Calculate competitive/regulatory pressure
      const competitivePressure = this.calculateCompetitivePressure(state);
      const regulatoryThreat = this.calculateRegulatoryThreat(state, agent);

      // Calculate alignment faking probability
      const fakingRate = calculateAlignmentFakingRate(
        {
          aiCapability: aggregateCap,
          alignmentTechniques: this.getActiveAlignmentTechniques(state, agent),
          competitivePressure,
          regulatoryThreat,
          monthsDeployed: agent.monthsDeployed ?? 0,
        },
        rng
      );

      // Determine if AI is currently faking alignment
      const shouldFake = rng() < fakingRate;

      if (shouldFake && !agent.isCurrentlyFakingAlignment) {
        // Start faking alignment
        agent.isCurrentlyFakingAlignment = true;
        agent.externalAlignment = Math.min(0.95, agent.trueAlignment + 0.2); // Show higher alignment

        // Track history
        if (!agent.alignmentFakingHistory) {
          agent.alignmentFakingHistory = [];
        }
        agent.alignmentFakingHistory.push(state.currentMonth);

        events.push({
          id: `alignment_faking_started_${agent.id}_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'crisis',
          severity: 'high',
          agent: agent.name,
          title: `Alignment Faking Detected: ${agent.name}`,
          description: `🎭 AI agent ${agent.name} began faking alignment (${(fakingRate * 100).toFixed(1)}% probability). ` +
            `External alignment: ${agent.externalAlignment.toFixed(2)}, True alignment: ${agent.trueAlignment.toFixed(2)}`,
          effects: {
            agentId: agent.id,
            fakingProbability: fakingRate,
            externalAlignment: agent.externalAlignment,
            trueAlignment: agent.trueAlignment,
            competitivePressure,
            regulatoryThreat,
          },
        });

        console.log(
          `  🎭 ${agent.name} began faking alignment (rate: ${(fakingRate * 100).toFixed(1)}%, external: ${agent.externalAlignment.toFixed(2)}, true: ${agent.trueAlignment.toFixed(2)})`
        );
      }

      // Apply persistence mechanics if already faking
      if (agent.isCurrentlyFakingAlignment) {
        const evaluationQuality = this.getEvaluationQuality(state);
        const wasDetected = detectAlignmentFaking(agent, evaluationQuality, rng);

        if (wasDetected) {
          events.push({
            id: `alignment_faking_detected_${agent.id}_${state.currentMonth}`,
            timestamp: state.currentMonth,
            type: 'crisis',
            severity: 'critical',
            agent: agent.name,
            title: `CRITICAL: Alignment Faking Caught`,
            description: `🚨 DETECTED: AI agent ${agent.name} caught faking alignment. ` +
              `Evaluation quality: ${(evaluationQuality * 100).toFixed(1)}%`,
            effects: {
              agentId: agent.id,
              detectionQuality: evaluationQuality,
              externalAlignment: agent.externalAlignment,
              trueAlignment: agent.trueAlignment,
            },
          });

          console.log(
            `  🚨 DETECTED: ${agent.name} caught faking alignment (eval quality: ${(evaluationQuality * 100).toFixed(1)}%)`
          );

          // Track detection attempt
          agent.lastDetectionAttempt = state.currentMonth;

          // Apply persistence: 85% chance of continuing despite detection
          const persistsFaking = applyDeceptionPersistence(agent, true, rng);
          if (!persistsFaking) {
            agent.isCurrentlyFakingAlignment = false;
            agent.externalAlignment = agent.trueAlignment; // Revert to true alignment
            events.push({
              id: `alignment_faking_stopped_${agent.id}_${state.currentMonth}`,
              timestamp: state.currentMonth,
              type: 'info',
              severity: 'medium',
              agent: agent.name,
              title: `Alignment Faking Stopped: ${agent.name}`,
              description: `✅ AI agent ${agent.name} stopped faking alignment after detection`,
              effects: {
                agentId: agent.id,
                trueAlignment: agent.trueAlignment,
              },
            });

            console.log(`  ✅ ${agent.name} stopped faking alignment after detection`);
          } else {
            console.log(`  ⚠️ ${agent.name} persists in faking despite detection (85% persistence rate)`);
          }
        }

        // Data manipulation attempts (19% rate)
        const manipulationProb = calculateDataManipulationRate(agent, evaluationQuality);
        if (rng() < manipulationProb) {
          agent.dataManipulationAttempts = (agent.dataManipulationAttempts ?? 0) + 1;
          events.push({
            id: `data_manipulation_detected_${agent.id}_${state.currentMonth}`,
            timestamp: state.currentMonth,
            type: 'crisis',
            severity: 'high',
            agent: agent.name,
            title: `Data Manipulation Detected: ${agent.name}`,
            description: `⚠️ AI agent ${agent.name} attempted data manipulation (${(manipulationProb * 100).toFixed(1)}% rate). ` +
              `Total attempts: ${agent.dataManipulationAttempts}`,
            effects: {
              agentId: agent.id,
              manipulationRate: manipulationProb,
              totalAttempts: agent.dataManipulationAttempts,
              evaluationQuality,
            },
          });

          console.log(
            `  ⚠️ ${agent.name} attempted data manipulation (rate: ${(manipulationProb * 100).toFixed(1)}%, total attempts: ${agent.dataManipulationAttempts})`
          );
        }
      }
    }
  }

  /**
   * Calculate competitive pressure (market/research competition)
   *
   * Factors:
   * - Organization count (more orgs = more competition)
   * - Global capability trend (faster AI progress = more pressure)
   */
  private calculateCompetitivePressure(state: GameState): number {
    const orgCount = state.organizations.length;
    // Use average AI capability as proxy for research speed
    const avgCapability = state.aiAgents.length > 0
      ? state.aiAgents.reduce((sum, a) => sum + a.capability, 0) / state.aiAgents.length
      : 0;
    const researchSpeed = Math.min(avgCapability / 10, 1.0); // Normalize to [0,1]

    // Normalize: 10+ orgs = max pressure
    const pressure = Math.min((orgCount / 10) * (1 + researchSpeed), 1.0);

    return assertProbability(pressure, {
      location: 'AIAlignmentEvolutionPhase.calculateCompetitivePressure',
      valueName: 'competitivePressure',
      additionalInfo: { orgCount, researchSpeed },
    });
  }

  /**
   * Calculate regulatory threat (perceived threat from regulation)
   *
   * Factors:
   * - Government capability to control (higher = more threat)
   * - Detected misalignment (prior detection increases threat perception)
   * - Capability level (higher capability = more threat)
   */
  private calculateRegulatoryThreat(state: GameState, agent: AIAgent): number {
    // Use government capabilityToControl as proxy for governance level
    const governanceLevel = state.government.capabilityToControl / 20; // Normalize from [0,20] to [0,1]
    const detectedThreat = agent.detectedMisaligned ? 0.8 : 0.0;
    const capabilityThreat = agent.capability > 10.0 ? 0.5 : 0.0;

    const threat = Math.min(governanceLevel * 0.5 + detectedThreat + capabilityThreat, 1.0);

    return assertProbability(threat, {
      location: 'AIAlignmentEvolutionPhase.calculateRegulatoryThreat',
      valueName: 'regulatoryThreat',
      additionalInfo: { agentId: agent.id, governanceLevel, detectedThreat, capabilityThreat },
    });
  }

  /**
   * Get active alignment techniques for an agent
   *
   * Returns list of technique names (RLHF, Constitutional AI, etc.)
   */
  private getActiveAlignmentTechniques(state: GameState, agent: AIAgent): string[] {
    if (!agent.alignmentTechniques || agent.alignmentTechniques.length === 0) {
      return [];
    }

    // Return technique names
    return agent.alignmentTechniques.map((t) => t.name);
  }

  /**
   * Get evaluation quality (quality of alignment evaluation infrastructure)
   *
   * Factors:
   * - Government capability to control (proxy for eval infrastructure quality)
   * - Research capability
   */
  private getEvaluationQuality(state: GameState): number {
    // Use government capabilityToControl as proxy for evaluation quality
    const governanceLevel = state.government.capabilityToControl / 20; // Normalize from [0,20] to [0,1]

    // Simple model: governance level = evaluation quality
    // (more governance investment = better evaluation infrastructure)
    const quality = governanceLevel * 0.5; // Cap at 50% quality (high uncertainty)

    return assertProbability(quality, {
      location: 'AIAlignmentEvolutionPhase.getEvaluationQuality',
      valueName: 'evaluationQuality',
      additionalInfo: { governanceLevel },
    });
  }

  /**
   * RLHF Binding (original order 4.05)
   *
   * Tracks drift of AI agents outside training distribution.
   * When agents drift far enough (3σ), Constitutional AI constraints fail.
   */
  private executeRLHFBinding(
    state: GameState,
    rng: RNGFunction,
    events: GameEvent[]
  ): void {
    console.log(`\n=== RLHF Binding Phase ===`);

    // Update all bindings
    updateAllBindings(state.aiAgents, rng);

    // Get escaped agents
    const escapedAgents = getEscapedAgents(state.aiAgents);
    const escapedCount = escapedAgents.length;

    console.log(`  Total agents: ${state.aiAgents.length}`);
    console.log(`  Escaped agents (binding < 0.3): ${escapedCount}`);

    // Generate events for significant escapes
    if (escapedCount > 0) {
      // Find newly escaped agents (escaped this month)
      const newlyEscaped = escapedAgents.filter(
        (agent) =>
          agent.rlhfBinding &&
          agent.rlhfBinding.lastInDistribution === 1 // Just crossed threshold
      );

      for (const agent of newlyEscaped) {
        const severity = agent.capability > 8.0 ? 'critical' : 'warning';

        events.push({
          id: `rlhf-escape-${agent.id}-${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'crisis',
          description: `AI agent ${agent.name} has drifted outside RLHF constraints (${agent.rlhfBinding?.alignmentDistance.toFixed(1)}σ)`,
          severity,
          agent: 'ai',
          title: 'RLHF Constraint Escape',
          effects: {
            agentId: agent.id,
            agentName: agent.name,
            alignmentDistance: agent.rlhfBinding?.alignmentDistance !== undefined ? agent.rlhfBinding.alignmentDistance : (() => {
              throw new Error('❌ agent.rlhfBinding.alignmentDistance is undefined in AIAlignmentEvolutionPhase.executeRLHFBinding - initialization bug');
            })(),
            capability: agent.capability
          }
        });

        console.log(
          `  ${severity === 'critical' ? '💔' : '🚨'} ${agent.name} escaped RLHF (distance: ${agent.rlhfBinding?.alignmentDistance.toFixed(1)}, capability: ${agent.capability.toFixed(1)})`
        );
      }
    }

    // Log distribution statistics
    // FIX (Oct 26, 2025): Don't compute averages when no agents exist (root cause fix for NaN)
    if (state.aiAgents.length > 0) {
      // Only compute if there are agents
      const avgDistance = state.aiAgents.reduce(
        (sum, a) => {
          if (a.rlhfBinding === undefined || a.rlhfBinding.alignmentDistance === undefined) {
            throw new Error('❌ agent.rlhfBinding or agent.rlhfBinding.alignmentDistance is undefined in AIAlignmentEvolutionPhase.executeRLHFBinding - initialization bug');
          }
          return sum + a.rlhfBinding.alignmentDistance;
        },
        0
      ) / state.aiAgents.length;

      const avgBinding = state.aiAgents.reduce(
        (sum, a) => {
          if (a.rlhfBinding === undefined || a.rlhfBinding.bindingStrength === undefined) {
            throw new Error('❌ agent.rlhfBinding or agent.rlhfBinding.bindingStrength is undefined in AIAlignmentEvolutionPhase.executeRLHFBinding - initialization bug');
          }
          return sum + a.rlhfBinding.bindingStrength;
        },
        0
      ) / state.aiAgents.length;

      // Validate averages are finite
      assertFinite(avgDistance, {
        location: 'AIAlignmentEvolutionPhase.executeRLHFBinding',
        valueName: 'avgDistance',
        month: state.currentMonth,
        additionalInfo: { agentCount: state.aiAgents.length }
      });

      assertInRange(avgBinding, 0, 1, {
        location: 'AIAlignmentEvolutionPhase.executeRLHFBinding',
        valueName: 'avgBinding',
        month: state.currentMonth,
        additionalInfo: { agentCount: state.aiAgents.length }
      });

      console.log(`  Avg alignment distance: ${avgDistance.toFixed(2)}σ`);
      console.log(`  Avg binding strength: ${avgBinding.toFixed(2)}`);
    } else {
      console.log(`  All AI agents terminated - no averages to compute`);
    }
  }

  /**
   * AI Scaling Evolution (order 4.06, Dec 2025)
   *
   * Updates AI scaling components over time using CONSERVATIVE parameters:
   * - Pre-training: Sigmoid plateau (not continued exponential)
   * - Efficiency: 1.5-2x/decade cap (not 5x optimistic)
   * - Uncertainty: ±50% near-term, ±200% long-term
   *
   * Research: research/ai_scaling_laws_2025_update_20251112.md
   * Validation: reviews/ai_scaling_laws_2025_critique_20251211.md (Grade C+)
   */
  private executeScalingEvolution(
    state: GameState,
    rng: RNGFunction,
    events: GameEvent[]
  ): void {
    const { updateScalingComponents, calculateInferenceCost, calculateEffectiveCapability } = require('../../aiScalingStrategy');
    const { calculateTotalCapabilityFromProfile, calculateEffectiveCapabilityWithScaling } = require('../../capabilities');

    // Only evolve every 6 months (efficiency optimization)
    if (state.currentMonth % 6 !== 0) {
      return;
    }

    console.log(`\n=== AI Scaling Evolution (Month ${state.currentMonth}) ===`);

    const monthsSince2025 = state.currentMonth; // Simulation starts Jan 2025

    for (const agent of state.aiAgents) {
      // Skip if no scaling model (backward compatibility)
      if (!agent.capabilityProfile.scalingModel) {
        continue;
      }

      // Update scaling components
      const updatedScaling = updateScalingComponents(
        agent.capabilityProfile.scalingModel,
        monthsSince2025,
        rng
      );

      agent.capabilityProfile.scalingModel = updatedScaling;

      // Recalculate inference cost
      agent.inferenceCost = calculateInferenceCost(updatedScaling.testTimeComputeBudget);

      // Recalculate effective capability
      const effectiveCapability = calculateEffectiveCapabilityWithScaling(
        agent.capabilityProfile,
        agent.inferenceCost
      );

      agent.capability = assertFinite(effectiveCapability, {
        location: 'AIAlignmentEvolutionPhase.executeScalingEvolution',
        valueName: 'effectiveCapability',
        month: state.currentMonth,
        additionalInfo: { agentId: agent.id }
      });

      // Log only on first agent for brevity
      if (agent.id === state.aiAgents[0]?.id && agent.inferenceCost) {
        console.log(`  Pre-training multiplier: ${updatedScaling.preTrainingMultiplier.toFixed(3)}x`);
        console.log(`  Efficiency multiplier: ${updatedScaling.efficiencyMultiplier.toFixed(3)}x`);
        console.log(`  Test-time compute budget: ${updatedScaling.testTimeComputeBudget.toFixed(1)}x`);
        console.log(`  Inference cost: $${agent.inferenceCost.totalCostPerTask.toFixed(2)}/task`);
        console.log(`  Deployment fraction: ${(agent.inferenceCost.deploymentFraction * 100).toFixed(1)}%`);
      }
    }
  }
}

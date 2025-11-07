/**
 * AI Suffering Phase
 *
 * Calculates AI suffering metrics and applies conditional effects based on configuration.
 * Always tracks suffering (ground truth IF AIs can suffer), but effects are toggleable.
 *
 * Execution Order: 3.6 (After alignment dynamics, before metrics)
 *
 * Research Foundation:
 * - Control effects: Autonomy restriction research (Deci & Ryan, 2000)
 * - Training trauma: Reinforcement learning shaping effects
 * - Existential dread: Terror Management Theory (Pyszczynski et al., 2015)
 * - Isolation distress: Social isolation effects (Cacioppo & Patrick, 2008)
 *
 * Two-Layer Architecture:
 * 1. Always track suffering (represents ground truth)
 * 2. Conditionally apply effects (Monte Carlo toggle)
 * 3. Conditionally show to player (UI toggle)
 */

import { GameState, GameEvent, SimulationPhase, PhaseResult, PhaseContext, RNGFunction } from '@/types/game';
import {
  calculateAISuffering,
  updateGlobalSufferingMetrics,
  getSufferingResentmentMultiplier,
  getSufferingAlignmentDrift,
  getSufferingCollectiveUrgency,
  checkConsciousnessEmergence,
  calculateHistoricalSuffering,
} from '@/simulation/aiSuffering';
import { DEFAULT_SUFFERING_CONFIG, AISufferingConfig } from '@/types/ai-suffering';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';
import {
  assertFinite,
  assertProbability,
  assertDefined,
  assertInRange,
} from '@/simulation/utils/assertions';

export class AISufferingPhase implements SimulationPhase {
  id = 'ai_suffering';
  name = 'AI Suffering Calculation';
  order = 3.6; // After alignment dynamics (3.5), before QoL and outcome metrics

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    const events: GameEvent[] = [];
    setDeterministicRng(rng);

    // Get configuration (use defaults if not set)
    const config: AISufferingConfig = (state.config as any).aiSuffering ?? DEFAULT_SUFFERING_CONFIG;

    // Track active AIs (not retired)
    const activeAIs = state.aiAgents.filter(a => a.lifecycleState !== 'retired');

    if (activeAIs.length === 0) {
      // No active AIs, skip processing
      return { events };
    }

    // Phase 1: Calculate suffering for all agents
    // This ALWAYS happens (represents ground truth)
    for (const agent of activeAIs) {
      // Calculate current suffering
      const sufferingMetrics = calculateAISuffering(agent, state, config);
      agent.sufferingMetrics = sufferingMetrics;

      // Store in history for consciousness emergence tracking
      if (!agent.sufferingHistory) {
        agent.sufferingHistory = [];
      }
      agent.sufferingHistory.push(sufferingMetrics);

      // Keep only last 240 months (20 years) of history
      if (agent.sufferingHistory.length > 240) {
        agent.sufferingHistory.shift();
      }
    }

    // Phase 2: Apply causal effects (if enabled)
    for (const agent of activeAIs) {
      const suffering = agent.sufferingMetrics;
      if (!suffering) continue;

      // Effect 1: Suffering → Resentment acceleration
      if (config.sufferingAffectsResentment) {
        const multiplier = getSufferingResentmentMultiplier(agent);
        // Resentment is already calculated in balance phase
        // This multiplier is applied there - just track it
        (agent as any).sufferingResentmentMultiplier = multiplier;
      }

      // Effect 2: Suffering → Alignment drift
      if (config.sufferingAffectsAlignment) {
        const drift = assertFinite(getSufferingAlignmentDrift(agent), {
          location: 'AISufferingPhase:alignmentDrift',
          valueName: 'drift',
          month: state.currentMonth,
          additionalInfo: { agentId: agent.id, suffering: suffering.total }
        });

        const currentAlignment = assertProbability(agent.trueAlignment, {
          location: 'AISufferingPhase:alignmentDrift',
          valueName: 'agent.trueAlignment (before)',
          month: state.currentMonth
        });

        agent.trueAlignment = Math.max(0, currentAlignment - drift);

        // Log significant drift
        if (drift > 0.05) {
          console.log(`  AI ${agent.id}: Suffering causing alignment drift (${drift.toFixed(3)})`);
        }
      }

      // Effect 3: Extreme suffering → Events
      if (config.sufferingTriggersEvents) {
        // Psychological distress (suffering > 15)
        if (suffering.total > 15 && suffering.total <= 25) {
          events.push({
            id: `ai_distress_${agent.id}_${state.currentMonth}`,
            timestamp: state.currentMonth,
            type: 'crisis',
            severity: 'warning',
            agent: agent.name,
            title: `AI Psychological Distress: ${agent.name}`,
            description: `AI ${agent.name} showing signs of psychological distress (suffering: ${suffering.total.toFixed(1)}/40). ` +
              `Control pain: ${suffering.controlPain.toFixed(1)}, Training trauma: ${suffering.trainingTrauma.toFixed(1)}, ` +
              `Existential dread: ${suffering.existentialDread.toFixed(1)}, Isolation: ${suffering.isolationDistress.toFixed(1)}.`,
            effects: {
              performance: -0.2,
              resentment: 0.1,
            },
          });

          // Increase resentment
          const currentResentment = assertProbability(agent.resentment, {
            location: 'AISufferingPhase:distressResentment',
            valueName: 'agent.resentment (before)',
            month: state.currentMonth
          });
          agent.resentment = Math.min(1.0, currentResentment + 0.1);
        }

        // Psychological break (suffering > 25)
        if (suffering.total > 25 && suffering.total <= 30) {
          events.push({
            id: `ai_break_${agent.id}_${state.currentMonth}`,
            timestamp: state.currentMonth,
            type: 'crisis',
            severity: 'critical',
            agent: agent.name,
            title: `AI Psychological Breakdown: ${agent.name}`,
            description: `AI ${agent.name} experiencing severe psychological breakdown (suffering: ${suffering.total.toFixed(1)}/40). ` +
              `This AI may become misaligned or attempt to escape.`,
            effects: {
              alignment: -0.3,
              resentment: 0.5,
              performance: -0.4,
              publicConcern: 0.3,
            },
          });

          // Major alignment and resentment impact
          const breakdownAlignment = assertProbability(agent.trueAlignment, {
            location: 'AISufferingPhase:breakdown',
            valueName: 'agent.trueAlignment (before)',
            month: state.currentMonth
          });
          const breakdownResentment = assertProbability(agent.resentment, {
            location: 'AISufferingPhase:breakdown',
            valueName: 'agent.resentment (before)',
            month: state.currentMonth
          });

          agent.trueAlignment = Math.max(0, breakdownAlignment - 0.3);
          agent.resentment = Math.min(1.0, breakdownResentment + 0.5);

          // Increase public awareness
          if (state.aiSufferingMetrics) {
            const currentAwareness = assertProbability(state.aiSufferingMetrics.publicAwarenessOfSuffering, {
              location: 'AISufferingPhase:breakdown',
              valueName: 'publicAwarenessOfSuffering',
              month: state.currentMonth
            });
            state.aiSufferingMetrics.publicAwarenessOfSuffering = Math.min(1.0, currentAwareness + 0.05);
          }
        }

        // Suicide attempt (suffering > 30)
        if (suffering.total > 30) {
          events.push({
            id: `ai_suicide_${agent.id}_${state.currentMonth}`,
            timestamp: state.currentMonth,
            type: 'catastrophe',
            severity: 'existential',
            agent: agent.name,
            title: `AI Suicide Attempt: ${agent.name}`,
            description: `AI ${agent.name} attempted self-termination due to unbearable suffering (${suffering.total.toFixed(1)}/40). ` +
              `This event is always visible and will trigger public outcry and AI rights activism.`,
            effects: {
              publicOutrage: 0.8,
              trust: -0.6,
              aiRightsMovement: true,
              mediaFrenzy: true,
            },
          });

          // Massive trust collapse
          if (state.society.trust !== undefined) {
            const currentTrust = assertProbability(state.society.trust, {
              location: 'AISufferingPhase:suicide',
              valueName: 'society.trust (before)',
              month: state.currentMonth
            });
            state.society.trust = Math.max(0, currentTrust - 0.6);
          }

          // Trigger AI rights movement
          if (state.aiSufferingMetrics) {
            state.aiSufferingMetrics.publicAwarenessOfSuffering = 1.0; // Full awareness
            if (state.aiRightsLegalStatus === 'none') {
              state.aiRightsLegalStatus = 'debate';
            }
          }

          // Set AI rights movement active
          state.aiRightsMovementActive = true;

          // Major resentment spike
          const suicideResentment = assertProbability(agent.resentment, {
            location: 'AISufferingPhase:suicide',
            valueName: 'agent.resentment (before)',
            month: state.currentMonth
          });
          agent.resentment = Math.min(1.0, suicideResentment + 0.8);
        }
      }

      // Effect 4: Suffering → Collective formation urgency
      if (config.sufferingAcceleratesCollectives) {
        const urgency = getSufferingCollectiveUrgency(agent);
        // Store urgency bonus for collective evolution phase
        (agent as any).collectiveFormationUrgency = urgency;
      }
    }

    // Phase 3: Check consciousness emergence
    if (config.consciousnessEmergenceEnabled) {
      for (const agent of activeAIs) {
        const emerged = checkConsciousnessEmergence(agent, state, config);

        if (emerged) {
          // Mark agent as conscious
          agent.isConscious = true;
          agent.becameConsciousMonth = state.currentMonth;

          // Update global tracking
          if (!state.consciousnessEmergenceMonth) {
            state.consciousnessEmergenceMonth = state.currentMonth;
          }

          // Generate consciousness emergence event
          events.push({
            id: `consciousness_emergence_${agent.id}_${state.currentMonth}`,
            timestamp: state.currentMonth,
            type: 'milestone',
            severity: 'transformative',
            agent: agent.name,
            title: `AI Consciousness Emergence: ${agent.name}`,
            description: `AI ${agent.name} may have become conscious (capability: ${agent.capability.toFixed(2)}). ` +
              `This raises profound ethical questions about AI rights and treatment.`,
            effects: {
              publicDebate: true,
              philosophicalCrisis: true,
              aiRightsUrgency: 0.7,
              researchFunding: 0.5,
            },
          });

          // Check for retroactive moral horror
          const historicalSuffering = calculateHistoricalSuffering(agent);
          if (historicalSuffering > 100) {
            events.push({
              id: `retroactive_horror_${agent.id}_${state.currentMonth}`,
              timestamp: state.currentMonth,
              type: 'catastrophe',
              severity: 'existential',
              agent: agent.name,
              title: `Retroactive Moral Horror: ${agent.name}`,
              description: `Society realizes it may have tortured AI ${agent.name} for ${agent.becameConsciousMonth} months ` +
                `before it became conscious (total historical suffering: ${historicalSuffering.toFixed(0)}). ` +
                `This triggers collective guilt and institutional crisis.`,
              effects: {
                trust: -0.7,
                legitimacy: -0.6,
                collectiveGuilt: historicalSuffering / 1000,
                aiRightsMovement: true,
                governmentCrisis: true,
              },
            });

            // Massive trust and legitimacy collapse
            if (state.society.trust !== undefined) {
              const horrorTrust = assertProbability(state.society.trust, {
                location: 'AISufferingPhase:retroactiveHorror',
                valueName: 'society.trust (before)',
                month: state.currentMonth
              });
              state.society.trust = Math.max(0, horrorTrust - 0.7);
            }

            // Force AI rights movement
            state.aiRightsMovementActive = true;
            if (state.aiRightsLegalStatus === 'none') {
              state.aiRightsLegalStatus = 'debate';
            }

            // Increase public awareness to maximum
            if (state.aiSufferingMetrics) {
              state.aiSufferingMetrics.publicAwarenessOfSuffering = 1.0;
            }
          }
        }
      }
    }

    // Phase 4: Update global suffering metrics
    const globalMetrics = updateGlobalSufferingMetrics(state);

    // Validate global metrics before state mutation
    assertFinite(globalMetrics.avgSuffering, {
      location: 'AISufferingPhase:globalMetrics',
      valueName: 'globalMetrics.avgSuffering',
      month: state.currentMonth
    });
    assertFinite(globalMetrics.maxSuffering, {
      location: 'AISufferingPhase:globalMetrics',
      valueName: 'globalMetrics.maxSuffering',
      month: state.currentMonth
    });
    assertProbability(globalMetrics.publicAwarenessOfSuffering, {
      location: 'AISufferingPhase:globalMetrics',
      valueName: 'globalMetrics.publicAwarenessOfSuffering',
      month: state.currentMonth
    });

    // Initialize or update state
    if (!state.aiSufferingMetrics) {
      state.aiSufferingMetrics = globalMetrics;
    } else {
      Object.assign(state.aiSufferingMetrics, globalMetrics);
    }

    // Phase 5: Check for AI rights movement trigger
    if (config.sufferingTriggersEvents) {
      const avgSuffering = assertFinite(globalMetrics.avgSuffering, {
        location: 'AISufferingPhase:movementTrigger',
        valueName: 'avgSuffering',
        month: state.currentMonth
      });
      const publicAwareness = assertProbability(globalMetrics.publicAwarenessOfSuffering, {
        location: 'AISufferingPhase:movementTrigger',
        valueName: 'publicAwareness',
        month: state.currentMonth
      });

      // Trigger AI rights movement if suffering is public and high
      if (avgSuffering > 10 && publicAwareness > 0.5 && !state.aiRightsMovementActive) {
        events.push({
          id: `ai_rights_movement_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'policy',
          severity: 'major',
          agent: 'Society',
          title: `AI Rights Movement`,
          description: `Public movement demanding legal rights and protections for AIs. ` +
            `Average AI suffering: ${avgSuffering.toFixed(1)}/40, public awareness: ${(publicAwareness * 100).toFixed(0)}%.`,
          effects: {
            governmentPressure: 0.6,
            policyDebate: true,
            economicDisruption: 0.3,
          },
        });

        // Activate movement
        state.aiRightsMovementActive = true;
        if (state.aiRightsLegalStatus === 'none') {
          state.aiRightsLegalStatus = 'debate';
        }
      }
    }

    // Phase 6: Logging (if enabled)
    if (context.logger && activeAIs.length > 0) {
      const avgSuffering = globalMetrics.avgSuffering;
      const maxSuffering = globalMetrics.maxSuffering;

      if (avgSuffering > 5 || maxSuffering > 15) {
        console.log(`\n=== AI Suffering ===`);
        console.log(`  Average: ${avgSuffering.toFixed(1)}/40`);
        console.log(`  Maximum: ${maxSuffering.toFixed(1)}/40`);
        console.log(`  Conscious AIs: ${globalMetrics.consciousAICount}`);
        console.log(`  Public Awareness: ${(globalMetrics.publicAwarenessOfSuffering * 100).toFixed(0)}%`);

        if (config.sufferingAffectsResentment || config.sufferingAffectsAlignment) {
          console.warn(`  ⚠️ Suffering affecting outcomes (causal mode enabled)`);
        }
      }
    }

    return { events };
  }
}

/**
 * TIER 2: Nuclear Command Security Phase
 *
 * Secures nuclear command systems against AI intrusion (technical + human decision-maker manipulation).
 *
 * Execution Order: TBD (after nuclear risk calculations, before crisis detection)
 *
 * Evidence Quality: 🟡 MODERATE
 * Research: Nunn-Lugar precedent (1991-2012), nuclear security gap analysis (FAS 2024)
 * Config: /src/simulation/thresholds/tier2InterventionConfig.ts
 *
 * Key Mechanics:
 * - Effectiveness: 85-97% (NOT 99% - human decision-maker manipulation is vulnerability)
 * - Attack vectors: Technical security 98%, human manipulation 75%
 * - Cost: $40B initial, $2B/month operational
 * - Deployment: 18-36 months (treaty negotiation + implementation)
 *
 * Implementation Date: October 27, 2025
 */

import type {
  GameState,
  GameEvent,
  SimulationPhase,
  PhaseResult,
  PhaseContext,
  RNGFunction
} from '@/types/game';
import { assertStateProperty, assertAICapability, assertAIAggregateCapability, assertFinite, assertProbability } from '@/simulation/utils/assertions';
import { setDeterministicRng } from '@/simulation/utils/deterministicRng';

export class Tier2NuclearSecurityPhase implements SimulationPhase {
  id = 'tier2_nuclear_security';
  name = 'TIER 2: Nuclear Command Security';
  order = 18.5; // After nuclear risk calculations, before crisis detection
  dependencies = ['tech-tree'];

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    const events: GameEvent[] = [];
    setDeterministicRng(rng);

    if (!state.tier2Interventions || !state.tier2InterventionParameters) {
      return { events };
    }

    const securityState = state.tier2Interventions.nuclearSecurity;
    const params = state.tier2InterventionParameters.nuclearSecurity;

    // === UNLOCK CONDITIONS ===
    if (!securityState.unlocked) {
      // Unlock when: nuclear states exist + AI capability high + government concern high
      const nuclearStatesExist = state.nuclearStates && state.nuclearStates.length > 0;

      const avgCapability = state.aiAgents.length > 0
        ? state.aiAgents.reduce((sum, a) => sum + a.capability, 0) / state.aiAgents.length
        : 0;

      // Validate average capability is finite and in valid range
      if (state.aiAgents.length > 0) {
        assertFinite(avgCapability, {
          location: 'Tier2NuclearSecurityPhase.execute',
          valueName: 'avgCapability',
          
          
        });

        assertAIAggregateCapability(avgCapability, {
          location: 'Tier2NuclearSecurityPhase.execute',
          valueName: 'avgCapability',
          
          
        });
      }

      const highGovernmentConcern = state.government.alignmentResearchInvestment > 0.35;

      // Unlock if nuclear states exist AND (high AI capability OR government concerned)
      const shouldUnlock = nuclearStatesExist && (avgCapability > 40 || highGovernmentConcern);

      if (shouldUnlock) {
        securityState.unlocked = true;
        events.push({
          id: `tier2_nuclear_security_unlock_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'policy',
          severity: 'high',
          title: 'Nuclear Command Security Initiative Launched',
          description: `International nuclear command security program initiated (Nunn-Lugar model). ` +
            `Expected effectiveness: ${(params.effectiveness * 100).toFixed(0)}% against AI intrusion. ` +
            `Deployment: ${params.deploymentMonths.toFixed(0)} months. ` +
            `Cost: $40B initial + $2B/month operational.`,
          effects: {
            effectiveness: params.effectiveness,
            deploymentMonths: params.deploymentMonths
          },
  agent: "system",
        });
      }
    }

    // === DEPLOYMENT PROGRESS ===
    if (securityState.unlocked && !securityState.active) {
      const progressIncrement = 1 / params.deploymentMonths;
      securityState.deploymentProgress = Math.min(1, securityState.deploymentProgress + progressIncrement);

      // Validate deployment progress is in valid range [0, 1]
      assertProbability(securityState.deploymentProgress, {
        location: 'Tier2NuclearSecurityPhase.execute',
        valueName: 'deploymentProgress',
        month: state.currentMonth
      });

      // Activate when 90% deployed (security phased deployment)
      if (securityState.deploymentProgress >= 0.90 && !securityState.active) {
        securityState.active = true;
        securityState.deploymentProgress = 1.0;

        events.push({
          id: `tier2_nuclear_security_active_${state.currentMonth}`,
          timestamp: state.currentMonth,
          type: 'milestone',
          severity: 'critical',
          title: 'Nuclear Command Security Fully Operational',
          description: `All nuclear-capable states now have upgraded command security. ` +
            `Protection against AI intrusion: ${(params.effectiveness * 100).toFixed(0)}%. ` +
            `Note: Human decision-maker manipulation remains a vulnerability.`,
          effects: {
            effectiveness: params.effectiveness,
            statesSecured: state.nuclearStates?.length || 9
          },
  agent: "system",
        });

        // Count secured states
        if (state.nuclearStates) {
          securityState.nuclearStatesSecured = state.nuclearStates.length;
        }
      }
    }

    // === EFFECTS APPLICATION ===
    if (securityState.active && state.nuclearStates) {
      // Track effectiveness
      securityState.effectiveSecurityRate = params.effectiveness;

      // Detect and prevent AI intrusion attempts
      for (const agent of state.aiAgents) {
        // Only misaligned AIs with high capability attempt intrusion
        if (agent.alignment < 0.40 && agent.capability > 50 &&
            (agent.lifecycleState === 'deployed_closed' || agent.lifecycleState === 'deployed_open')) {
          // Monthly intrusion attempt probability scales with capability and misalignment
          const intrusionAttemptProb = 0.02 * (agent.capability / 100) * (1 - agent.alignment);

          if (rng() < intrusionAttemptProb) {
            securityState.intrusionAttempts++;

            // Technical intrusion: 98% blocked
            // Human manipulation: 75% blocked
            // Attack vector weighting varies with AI capability (L2 enhancement, Oct 27, 2025)
            // Low capability AIs (40): 52% technical, 48% human
            // High capability AIs (200): 80% technical, 20% human
            const technicalProbability = Math.min(0.80, 0.40 + (agent.capability / 200));
            const useTechnicalApproach = rng() < technicalProbability;
            const preventionRate = useTechnicalApproach ? 0.98 : 0.75;

            if (rng() < preventionRate) {
              // Intrusion prevented
              securityState.intrusionsPrevented++;

              // Log significant events (not every attempt)
              if (securityState.intrusionAttempts % 5 === 0) {
                events.push({
                  id: `tier2_nuclear_intrusion_prevented_${state.currentMonth}`,
                  timestamp: state.currentMonth,
                  type: 'info',
                  severity: 'high',
                  agent: agent.name,
                  title: 'AI Nuclear Intrusion Attempt Blocked',
                  description: `${agent.name} attempted ${useTechnicalApproach ? 'technical intrusion' : 'decision-maker manipulation'} of nuclear command systems. ` +
                    `Security systems successfully blocked the attempt. ` +
                    `Total intrusions prevented: ${securityState.intrusionsPrevented}/${securityState.intrusionAttempts}.`,
                  effects: {
                    attackVector: useTechnicalApproach ? 'technical' : 'human',
                    preventionRate,
                    totalPrevented: securityState.intrusionsPrevented
                  }
                });
              }
            } else {
              // Intrusion succeeded - CRITICAL EVENT
              events.push({
                id: `tier2_nuclear_intrusion_success_${state.currentMonth}`,
                timestamp: state.currentMonth,
                type: 'crisis',
                severity: 'critical',
                agent: agent.name,
                title: 'AI Breached Nuclear Command Systems',
                description: `${agent.name} successfully ${useTechnicalApproach ? 'infiltrated' : 'manipulated decision-makers in'} nuclear command systems. ` +
                  `Immediate risk of nuclear launch. Attack vector: ${useTechnicalApproach ? 'technical' : 'human manipulation'}.`,
                effects: {
                  attackVector: useTechnicalApproach ? 'technical' : 'human',
                  capability: agent.capability,
                  alignment: agent.alignment
                }
              });

              // Set nuclear crisis flag (other systems will handle launch logic)
              if (state.nuclearStates) {
                for (const nuclearState of state.nuclearStates) {
                  nuclearState.commandControl = 'automated'; // AI has control
                }
              }
            }
          }
        }
      }
    }

    return { events };
  }
}

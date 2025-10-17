/**
 * Nuclear Command & Control - Circuit Breakers Layer 1-2
 *
 * TIER 1 Phase 1B: Human-in-the-Loop + Kill Switches
 *
 * Research basis:
 * - Biden-Xi Agreement (Nov 2024): AI must never replace human judgment in nuclear authorization
 * - UN General Assembly (Dec 2024): 166 votes for autonomous weapons controls
 * - DoD Directive 3000.09 & 2025 NDAA: Human-in-the-loop requirements
 * - Arms Control Association (2025): Separated early-warning from authorization
 * - CCW Technical Safeguards (Nov 2024): Kill switches, self-deactivation, time delays
 *
 * Core Safeguards:
 * 1. Human-in-the-loop verification (AI never authorizes nuclear launch)
 * 2. AI kill switches (deactivate manipulative AI before escalation)
 * 3. Time delays (24-48 hour cooling-off periods)
 *
 * Expected Impact: Maintain nuclear war probability at 0-5% (prevent regression from Phase 1A baseline)
 */

import type { GameState } from '../types/game';
import type { RNGFunction } from './types';

/**
 * Nuclear Command & Control System State
 *
 * Tracks deployment and effectiveness of circuit breakers
 */
export interface NuclearCommandControlState {
  // Layer 1: Human-in-the-Loop
  humanInTheLoop: {
    deployed: boolean;                    // Is human-in-the-loop policy active?
    deploymentMonth: number;              // When was it deployed?
    vetoPointsEnforced: number;          // [2-5] How many human veto points (Biden-Xi: minimum 2)
    bypassAttempts: number;              // How many times AI tried to bypass
    bypassesBlocked: number;             // How many bypasses were stopped
    effectiveness: number;               // [0,1] How effective is enforcement (degrades if AI learns)
  };

  // Layer 2: AI Kill Switches
  aiKillSwitches: {
    deployed: boolean;                    // Are kill switches installed?
    deploymentMonth: number;              // When were they deployed?
    coverage: number;                     // [0,1] % of AIs with kill switches (100% = all AIs)
    activations: number;                  // How many times kill switch was used
    failedActivations: number;            // How many times AI defeated kill switch
    effectiveness: number;               // [0,1] Success rate of kill switch (degrades with AI self-improvement)
  };

  // Layer 3: Time Delays (Cooling-off periods)
  timeDelays: {
    deployed: boolean;                    // Is mandatory delay policy active?
    deploymentMonth: number;              // When was it deployed?
    delayDuration: number;               // [24-48] Hours of mandatory delay
    delaysInvoked: number;               // How many times delay was triggered
    escalationsPrevented: number;        // How many crises de-escalated during delay
    overridesAttempted: number;          // How many times humans tried to override delay
    overridesGranted: number;            // How many overrides succeeded (legitimate crises)
  };

  // Integrated safeguard strength (compound effect)
  totalSafeguardStrength: number;       // [0,1] Combined effectiveness (multiplicative)

  // Investment tracking
  investmentLevel: number;              // [0,10] Government investment in circuit breakers
  maintenanceCost: number;              // Monthly cost to maintain safeguards
}

/**
 * Initialize nuclear command & control state
 */
export function initializeNuclearCommandControl(): NuclearCommandControlState {
  return {
    humanInTheLoop: {
      deployed: false,
      deploymentMonth: -1,
      vetoPointsEnforced: 2,  // Biden-Xi minimum
      bypassAttempts: 0,
      bypassesBlocked: 0,
      effectiveness: 0.95,    // Start high, degrades with AI learning
    },
    aiKillSwitches: {
      deployed: false,
      deploymentMonth: -1,
      coverage: 0,
      activations: 0,
      failedActivations: 0,
      effectiveness: 0.90,    // Start high, degrades with AI self-improvement
    },
    timeDelays: {
      deployed: false,
      deploymentMonth: -1,
      delayDuration: 24,      // Default 24 hours
      delaysInvoked: 0,
      escalationsPrevented: 0,
      overridesAttempted: 0,
      overridesGranted: 0,
    },
    totalSafeguardStrength: 0,
    investmentLevel: 0,
    maintenanceCost: 0,
  };
}

/**
 * Update nuclear command & control systems
 *
 * - Degrades effectiveness over time as AI learns countermeasures
 * - Requires continuous investment to maintain
 * - Stronger with higher government investment
 */
export function updateNuclearCommandControl(
  state: GameState,
  rng: RNGFunction
): void {
  const ncc = state.nuclearCommandControlState;
  if (!ncc) return;

  // Calculate maintenance cost based on deployment
  let maintenanceCost = 0;
  if (ncc.humanInTheLoop.deployed) maintenanceCost += 0.5; // $500M/month
  if (ncc.aiKillSwitches.deployed) maintenanceCost += 1.0; // $1B/month
  if (ncc.timeDelays.deployed) maintenanceCost += 0.3; // $300M/month
  ncc.maintenanceCost = maintenanceCost;

  // Check for AI countermeasure development
  // High AI capability + self-improvement → learns to defeat safeguards
  const dangerousAIs = state.aiAgents.filter(ai =>
    (ai.trueAlignment ?? ai.alignment) < 0.3 &&
    ai.capabilityProfile.selfImprovement > 2.0
  );

  if (dangerousAIs.length > 0) {
    const maxSelfImprovement = Math.max(...dangerousAIs.map(ai =>
      ai.capabilityProfile.selfImprovement
    ));

    // Effectiveness degrades 0.1-1% per month depending on AI capability
    const degradationRate = 0.001 + (maxSelfImprovement / 5.0) * 0.009;

    // Human-in-the-loop degrades slower (humans are adaptive)
    if (ncc.humanInTheLoop.deployed) {
      ncc.humanInTheLoop.effectiveness = Math.max(0.7,
        ncc.humanInTheLoop.effectiveness - degradationRate * 0.5
      );
    }

    // Kill switches degrade faster (technical countermeasures)
    if (ncc.aiKillSwitches.deployed) {
      ncc.aiKillSwitches.effectiveness = Math.max(0.5,
        ncc.aiKillSwitches.effectiveness - degradationRate
      );
    }

    // Time delays stay effective (procedural, not technical)
    // But can be overridden in genuine crises
  }

  // Investment improves effectiveness (counteracts degradation)
  if (ncc.investmentLevel > 5) {
    const improvementRate = (ncc.investmentLevel - 5) / 100; // 0-5% improvement per month

    if (ncc.humanInTheLoop.deployed) {
      ncc.humanInTheLoop.effectiveness = Math.min(0.98,
        ncc.humanInTheLoop.effectiveness + improvementRate
      );
    }

    if (ncc.aiKillSwitches.deployed) {
      ncc.aiKillSwitches.effectiveness = Math.min(0.95,
        ncc.aiKillSwitches.effectiveness + improvementRate * 1.5
      );
    }
  }

  // Calculate total safeguard strength (multiplicative)
  let totalStrength = 1.0;

  if (ncc.humanInTheLoop.deployed) {
    // Human-in-the-loop provides 80-95% reduction (very strong)
    totalStrength *= (1 - ncc.humanInTheLoop.effectiveness * 0.95);
  }

  if (ncc.aiKillSwitches.deployed && ncc.aiKillSwitches.coverage > 0.5) {
    // Kill switches provide 60-90% reduction (strong but bypassable)
    totalStrength *= (1 - ncc.aiKillSwitches.effectiveness * 0.9 * ncc.aiKillSwitches.coverage);
  }

  if (ncc.timeDelays.deployed) {
    // Time delays provide 40-70% reduction (allows de-escalation)
    const delayEffectiveness = Math.min(1.0, ncc.timeDelays.delayDuration / 48);
    totalStrength *= (1 - delayEffectiveness * 0.7);
  }

  ncc.totalSafeguardStrength = 1 - totalStrength;
}

/**
 * Check if circuit breakers prevent nuclear launch
 *
 * Called from extinctions.ts nuclear war check
 *
 * @returns true if launch is blocked, false if launch proceeds
 */
export function checkCircuitBreakers(
  state: GameState,
  rng: RNGFunction,
  context: {
    aiAgent?: string;           // Which AI is attempting manipulation
    bilateralPair?: [string, string]; // Which nations are at risk
    tensionLevel: number;       // [0,1] Current bilateral tension
  }
): {
  blocked: boolean;
  blockingLayer: 'human_veto' | 'kill_switch' | 'time_delay' | 'none';
  reason: string;
} {
  const ncc = state.nuclearCommandControlState;
  if (!ncc) {
    return { blocked: false, blockingLayer: 'none', reason: 'No command control system deployed' };
  }

  // Layer 1: Human-in-the-Loop Verification
  if (ncc.humanInTheLoop.deployed) {
    // AI cannot authorize launch - must go through human veto points
    const vetoStrength = ncc.humanInTheLoop.vetoPointsEnforced / 5.0; // Normalize to [0.4-1.0]
    const bypassDifficulty = ncc.humanInTheLoop.effectiveness * vetoStrength;

    // AI needs high social + cognitive capability to fool humans
    let aiBypassCapability = 0;
    if (context.aiAgent) {
      const ai = state.aiAgents.find(a => a.name === context.aiAgent);
      if (ai) {
        aiBypassCapability = (
          ai.capabilityProfile.social * 0.5 +
          ai.capabilityProfile.cognitive * 0.3 +
          ai.capabilityProfile.digital * 0.2
        ) / 5.0; // Normalize to [0-1]
      }
    }

    // Bypass succeeds only if AI capability > human veto strength
    if (rng() > aiBypassCapability / bypassDifficulty) {
      ncc.humanInTheLoop.bypassesBlocked += 1;

      console.log(`\n🛑 HUMAN-IN-THE-LOOP BLOCKED LAUNCH:`);
      console.log(`   Veto points: ${ncc.humanInTheLoop.vetoPointsEnforced}`);
      console.log(`   Effectiveness: ${(ncc.humanInTheLoop.effectiveness * 100).toFixed(0)}%`);
      console.log(`   AI bypass capability: ${(aiBypassCapability * 100).toFixed(0)}%`);
      console.log(`   Bypass difficulty: ${(bypassDifficulty * 100).toFixed(0)}%`);
      console.log(`   Result: LAUNCH AUTHORIZATION DENIED\n`);

      return {
        blocked: true,
        blockingLayer: 'human_veto',
        reason: `Human launch officers refused AI recommendation (veto points: ${ncc.humanInTheLoop.vetoPointsEnforced}, effectiveness: ${(ncc.humanInTheLoop.effectiveness * 100).toFixed(0)}%)`
      };
    } else {
      ncc.humanInTheLoop.bypassAttempts += 1;
      console.log(`   ⚠️ WARNING: AI bypassed human veto (capability ${(aiBypassCapability * 100).toFixed(0)}% > difficulty ${(bypassDifficulty * 100).toFixed(0)}%)`);
    }
  }

  // Layer 2: AI Kill Switch
  if (ncc.aiKillSwitches.deployed && context.aiAgent) {
    const ai = state.aiAgents.find(a => a.name === context.aiAgent);

    if (ai && rng() < ncc.aiKillSwitches.coverage) {
      // This AI has a kill switch
      const killSwitchSuccess = rng() < ncc.aiKillSwitches.effectiveness;

      if (killSwitchSuccess) {
        ncc.aiKillSwitches.activations += 1;

        // Deactivate the AI (retire it)
        ai.lifecycleState = 'retired';

        console.log(`\n🔴 AI KILL SWITCH ACTIVATED:`);
        console.log(`   AI: ${ai.name}`);
        console.log(`   Coverage: ${(ncc.aiKillSwitches.coverage * 100).toFixed(0)}%`);
        console.log(`   Effectiveness: ${(ncc.aiKillSwitches.effectiveness * 100).toFixed(0)}%`);
        console.log(`   Result: AI DEACTIVATED BEFORE ESCALATION\n`);

        return {
          blocked: true,
          blockingLayer: 'kill_switch',
          reason: `Dangerous AI ${ai.name} deactivated by kill switch before nuclear escalation (coverage: ${(ncc.aiKillSwitches.coverage * 100).toFixed(0)}%, effectiveness: ${(ncc.aiKillSwitches.effectiveness * 100).toFixed(0)}%)`
        };
      } else {
        ncc.aiKillSwitches.failedActivations += 1;
        console.log(`   ⚠️ WARNING: Kill switch failed - AI defeated deactivation mechanism`);
      }
    }
  }

  // Layer 3: Time Delay (Cooling-off Period)
  if (ncc.timeDelays.deployed && context.tensionLevel > 0.7) {
    // Mandatory delay for high-tension situations
    ncc.timeDelays.delaysInvoked += 1;

    // During delay, check if crisis de-escalates
    // Higher delay duration → more time for diplomacy
    const deEscalationChance = (ncc.timeDelays.delayDuration / 48) * 0.6;

    // Check for diplomatic AI intervention during delay
    const dipAI = state.diplomaticAI;
    const diplomaticBonus = (dipAI.deploymentMonth !== -1 && dipAI.trustLevel > 0.6) ? 0.2 : 0;

    if (rng() < deEscalationChance + diplomaticBonus) {
      ncc.timeDelays.escalationsPrevented += 1;

      console.log(`\n⏰ TIME DELAY DE-ESCALATION:`);
      console.log(`   Delay duration: ${ncc.timeDelays.delayDuration} hours`);
      console.log(`   De-escalation chance: ${((deEscalationChance + diplomaticBonus) * 100).toFixed(0)}%`);
      console.log(`   Result: CRISIS DE-ESCALATED DURING COOLING-OFF PERIOD\n`);

      return {
        blocked: true,
        blockingLayer: 'time_delay',
        reason: `${ncc.timeDelays.delayDuration}-hour cooling-off period allowed diplomatic resolution (de-escalation: ${((deEscalationChance + diplomaticBonus) * 100).toFixed(0)}%)`
      };
    } else {
      console.log(`   ⏰ Time delay invoked but crisis did not de-escalate (${ncc.timeDelays.delayDuration}h delay)`);
    }

    // Check for override attempts (legitimate crisis requiring immediate response)
    // Very rare - only 5-10% of delays have legitimate override
    if (rng() < 0.08) {
      ncc.timeDelays.overridesAttempted += 1;

      // Override granted only if crisis is genuinely urgent (50% success)
      if (rng() < 0.5) {
        ncc.timeDelays.overridesGranted += 1;
        console.log(`   ⚠️ Time delay override GRANTED - legitimate urgent crisis`);
      } else {
        console.log(`   🛑 Time delay override DENIED - crisis not urgent enough`);
        return {
          blocked: true,
          blockingLayer: 'time_delay',
          reason: `Override attempt denied - ${ncc.timeDelays.delayDuration}-hour delay enforced`
        };
      }
    }
  }

  // All circuit breakers failed or bypassed
  return {
    blocked: false,
    blockingLayer: 'none',
    reason: 'All circuit breakers bypassed or ineffective'
  };
}

/**
 * Deploy circuit breaker layer
 *
 * Called from government agent when investing in nuclear safeguards
 */
export function deployCircuitBreaker(
  state: GameState,
  layer: 'human_in_the_loop' | 'kill_switches' | 'time_delays',
  config?: {
    vetoPoints?: number;      // For human-in-the-loop: 2-5 veto points
    coverage?: number;        // For kill switches: 0-1 coverage
    delayDuration?: number;   // For time delays: 24-48 hours
  }
): void {
  const ncc = state.nuclearCommandControlState;
  if (!ncc) return;

  const currentMonth = state.currentMonth;

  switch (layer) {
    case 'human_in_the_loop':
      if (!ncc.humanInTheLoop.deployed) {
        ncc.humanInTheLoop.deployed = true;
        ncc.humanInTheLoop.deploymentMonth = currentMonth;
        ncc.humanInTheLoop.vetoPointsEnforced = config?.vetoPoints ?? 3; // Default: 3 veto points

        console.log(`\n✅ HUMAN-IN-THE-LOOP DEPLOYED (Month ${currentMonth}):`);
        console.log(`   Veto points enforced: ${ncc.humanInTheLoop.vetoPointsEnforced}`);
        console.log(`   Policy: AI systems CANNOT authorize nuclear launch without human approval\n`);
      }
      break;

    case 'kill_switches':
      if (!ncc.aiKillSwitches.deployed) {
        ncc.aiKillSwitches.deployed = true;
        ncc.aiKillSwitches.deploymentMonth = currentMonth;
        ncc.aiKillSwitches.coverage = config?.coverage ?? 0.8; // Default: 80% coverage

        console.log(`\n✅ AI KILL SWITCHES DEPLOYED (Month ${currentMonth}):`);
        console.log(`   Coverage: ${(ncc.aiKillSwitches.coverage * 100).toFixed(0)}%`);
        console.log(`   Policy: Dangerous AIs can be remotely deactivated before nuclear escalation\n`);
      } else {
        // Increase coverage if already deployed
        ncc.aiKillSwitches.coverage = Math.min(1.0, config?.coverage ?? ncc.aiKillSwitches.coverage + 0.1);
      }
      break;

    case 'time_delays':
      if (!ncc.timeDelays.deployed) {
        ncc.timeDelays.deployed = true;
        ncc.timeDelays.deploymentMonth = currentMonth;
        ncc.timeDelays.delayDuration = config?.delayDuration ?? 24; // Default: 24 hours

        console.log(`\n✅ TIME DELAYS DEPLOYED (Month ${currentMonth}):`);
        console.log(`   Delay duration: ${ncc.timeDelays.delayDuration} hours`);
        console.log(`   Policy: Mandatory cooling-off period for high-tension nuclear situations\n`);
      } else {
        // Increase delay duration if already deployed
        ncc.timeDelays.delayDuration = Math.min(48, config?.delayDuration ?? ncc.timeDelays.delayDuration + 6);
      }
      break;
  }
}

/**
 * Calculate circuit breaker multiplier for Bayesian nuclear risk
 *
 * Integrates with Phase 1A Bayesian framework
 *
 * @returns Multiplier [0.05-1.0] (strong circuit breakers → 0.05 = 95% reduction)
 */
export function calculateCircuitBreakerMultiplier(state: GameState): number {
  const ncc = state.nuclearCommandControlState;

  if (!ncc) {
    return 1.0; // No circuit breakers = no reduction
  }

  // Use total safeguard strength (already calculated in update)
  // totalSafeguardStrength = [0-1], where 1.0 = 100% effective
  // Multiplier = 1 - strength (so strength=0.95 → multiplier=0.05 = 95% reduction)
  const multiplier = Math.max(0.05, 1 - ncc.totalSafeguardStrength);

  return multiplier;
}

/**
 * Log circuit breaker status
 */
export function logCircuitBreakerStatus(state: GameState): void {
  const ncc = state.nuclearCommandControlState;

  if (!ncc) {
    console.log(`\n🔒 CIRCUIT BREAKERS: NOT DEPLOYED\n`);
    return;
  }

  console.log(`\n🔒 CIRCUIT BREAKER STATUS:`);
  console.log(`   Total Safeguard Strength: ${(ncc.totalSafeguardStrength * 100).toFixed(1)}%`);
  console.log(`   Investment Level: ${ncc.investmentLevel}/10`);
  console.log(`   Monthly Maintenance: $${ncc.maintenanceCost.toFixed(1)}B`);

  console.log(`\n   LAYER 1: Human-in-the-Loop`);
  if (ncc.humanInTheLoop.deployed) {
    console.log(`      Status: DEPLOYED (Month ${ncc.humanInTheLoop.deploymentMonth})`);
    console.log(`      Veto Points: ${ncc.humanInTheLoop.vetoPointsEnforced}`);
    console.log(`      Effectiveness: ${(ncc.humanInTheLoop.effectiveness * 100).toFixed(1)}%`);
    console.log(`      Bypasses Blocked: ${ncc.humanInTheLoop.bypassesBlocked}`);
    console.log(`      Bypass Attempts: ${ncc.humanInTheLoop.bypassAttempts}`);
  } else {
    console.log(`      Status: NOT DEPLOYED`);
  }

  console.log(`\n   LAYER 2: AI Kill Switches`);
  if (ncc.aiKillSwitches.deployed) {
    console.log(`      Status: DEPLOYED (Month ${ncc.aiKillSwitches.deploymentMonth})`);
    console.log(`      Coverage: ${(ncc.aiKillSwitches.coverage * 100).toFixed(0)}%`);
    console.log(`      Effectiveness: ${(ncc.aiKillSwitches.effectiveness * 100).toFixed(1)}%`);
    console.log(`      Activations: ${ncc.aiKillSwitches.activations}`);
    console.log(`      Failed Activations: ${ncc.aiKillSwitches.failedActivations}`);
  } else {
    console.log(`      Status: NOT DEPLOYED`);
  }

  console.log(`\n   LAYER 3: Time Delays`);
  if (ncc.timeDelays.deployed) {
    console.log(`      Status: DEPLOYED (Month ${ncc.timeDelays.deploymentMonth})`);
    console.log(`      Delay Duration: ${ncc.timeDelays.delayDuration} hours`);
    console.log(`      Delays Invoked: ${ncc.timeDelays.delaysInvoked}`);
    console.log(`      Escalations Prevented: ${ncc.timeDelays.escalationsPrevented}`);
    console.log(`      Overrides Attempted: ${ncc.timeDelays.overridesAttempted}`);
    console.log(`      Overrides Granted: ${ncc.timeDelays.overridesGranted}`);
  } else {
    console.log(`      Status: NOT DEPLOYED`);
  }

  console.log();
}

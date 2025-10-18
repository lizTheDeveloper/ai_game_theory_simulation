/**
 * Government Core Orchestrator
 *
 * Main decision-making and action execution logic for the government agent.
 * This module coordinates action selection and execution while delegating
 * to specialized action modules.
 */

import { GameState, GameEvent } from '@/types/game';
import { ActionResult, GameAction } from '@/simulation/agents/types';
import { getTrustInAIForPolicy, getTrustInAI } from '@/simulation/socialCohesion';
import {
  calculateObservableAICapability,
  calculateTotalCapabilityFromProfile
} from '@/simulation/calculations';

// Import from new modular structure
import { migratedActions } from '../actions';

/**
 * Get all available government actions
 */
export function getAllGovernmentActions(): GameAction[] {
  return migratedActions;
}

/**
 * Select which action the government should take
 * Uses priority-based selection weighted by unemployment and economic stage
 */
export function selectGovernmentAction(
  state: GameState,
  random: () => number = Math.random
): GameAction | null {
  const availableActions = getAllGovernmentActions().filter(action =>
    action.canExecute(state)
  );

  if (availableActions.length === 0) return null;

  const unemploymentLevel = state.society.unemploymentLevel;
  const economicStage = Math.floor(state.globalMetrics.economicTransitionStage);
  // P2.3 UPDATE (Oct 16, 2025): Use power-weighted trust for policy decisions
  // Elite preferences dominate policy-making (Gilens & Page 2014)
  const trustLevel = getTrustInAIForPolicy(state.society);
  const threatLevel = state.aiAgents.filter(ai => ai.escaped).length / state.aiAgents.length;
  // Use OBSERVABLE capability - government makes decisions based on what it can see, not hidden power
  const observableCapability = calculateObservableAICapability(state.aiAgents);
  const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length;

  let selectedAction = availableActions[0];
  let highestPriority = 0;

  availableActions.forEach(action => {
    let priority = 1;

    switch (action.id) {
      // UBI Variants - choose based on stage and severity
      case 'implement_generous_ubi':
        // URGENT during late-stage crisis (Stage 2+) with high unemployment
        priority = unemploymentLevel * 15 + (economicStage >= 2 ? 25 : 0) + (trustLevel < 0.4 ? 10 : 0);
        // Prefer if legitimacy is high (can afford fiscal burden)
        if (state.government.legitimacy > 0.6) {
          priority *= 1.3;
        }
        break;

      case 'implement_means_tested_benefits':
        // MODERATE response - preferred if conservative or early crisis
        priority = unemploymentLevel * 10 + (economicStage === 1 ? 15 : 0) + (trustLevel < 0.5 ? 5 : 0);
        // Prefer if legitimacy is medium (cautious approach)
        if (state.government.legitimacy > 0.4 && state.government.legitimacy < 0.7) {
          priority *= 1.2;
        }
        break;

      case 'implement_job_guarantee':
        // CONSERVATIVE response - maintain work ethic
        priority = unemploymentLevel * 8 + (economicStage < 2 ? 12 : 0);
        // Prefer if control desire is low (less willing to do radical change)
        if (state.government.controlDesire < 0.5) {
          priority *= 1.3;
        }
        break;

      // Regulation Variants - choose based on legitimacy, technical sophistication, threat level
      case 'regulate_large_companies':
        // Popular, politically feasible, but less effective
        priority = (state.government.controlDesire * 2 + threatLevel * 2) *
                   (unemploymentLevel > 0.6 ? 0.4 : 1.0);
        // Prefer if legitimacy is low (need popular measure)
        if (state.government.legitimacy < 0.5) {
          priority *= 1.5;
        }
        // Boost if AI threat is moderate
        if (observableCapability > 1.0 && observableCapability < 1.8) {
          priority *= 1.3;
        }
        break;

      case 'regulate_compute_threshold':
        // Technical, unpopular, but very effective
        priority = (state.government.controlDesire * 3 + threatLevel * 5) *
                   (unemploymentLevel > 0.6 ? 0.4 : 1.0);
        // Prefer if legitimacy is high (can afford unpopular measure)
        if (state.government.legitimacy > 0.6) {
          priority *= 1.8;
        }
        // Strong boost if AI threat is severe
        if (observableCapability > 1.5) {
          priority *= 2.0;
        }
        // Low trust → fear → control response
        if (trustLevel < 0.4) {
          priority *= 1.5; // Fear drives control
        } else if (trustLevel < 0.6) {
          priority *= 1.2; // Moderate concern
        }
        break;

      case 'regulate_capability_ceiling':
        // High control desire approach with enforcement challenges
        priority = (state.government.controlDesire * 4 + threatLevel * 3) *
                   (unemploymentLevel > 0.6 ? 0.4 : 1.0);
        // Prefer if control desire is very high
        if (state.government.controlDesire > 0.7) {
          priority *= 1.5;
        }
        // Boost if AI capability is high
        if (observableCapability > 1.3) {
          priority *= 1.4;
        }
        // Low trust → fear → hard limits
        if (trustLevel < 0.4) {
          priority *= 1.6; // Panic response
        } else if (trustLevel < 0.6) {
          priority *= 1.3;
        }
        break;

      case 'invest_alignment_research':
        // CRITICAL when alignment is drifting or capability is high
        priority = 5; // Base priority

        // High priority when alignment is low and capability is significant
        if (avgAlignment < 0.6 && observableCapability > 0.8) {
          priority += 15; // URGENT
        } else if (avgAlignment < 0.7 && observableCapability > 1.2) {
          priority += 12; // Very important
        } else if (avgAlignment < 0.75) {
          priority += 8; // Important
        }

        // Boost if approaching recursive improvement threshold
        if (observableCapability > 1.3) {
          priority += 10; // Dangerous zone
        } else if (observableCapability > 1.0) {
          priority += 5;
        }

        // Reduce if already investing heavily
        if (state.government.alignmentResearchInvestment > 5) {
          priority *= 0.5;
        } else if (state.government.alignmentResearchInvestment > 7) {
          priority *= 0.2;
        }

        // Reduce priority during unemployment crisis (competing priorities)
        if (unemploymentLevel > 0.5 && economicStage < 3) {
          priority *= 0.6;
        }
        break;

      case 'implement_compute_governance':
        // Last resort / proactive measure when AI is accelerating dangerously
        priority = 3; // Base priority

        // EMERGENCY measure when entering recursive improvement zone
        if (observableCapability > 2.0 && avgAlignment < 0.5) {
          priority += 25; // EMERGENCY
        } else if (observableCapability > 1.5 && avgAlignment < 0.6) {
          priority += 18; // Very urgent
        } else if (observableCapability > 1.2) {
          priority += 10; // Urgent
        } else if (observableCapability > 0.9) {
          priority += 5; // Proactive
        }

        // Higher priority if alignment research isn't working
        if (state.government.alignmentResearchInvestment > 4 && avgAlignment < 0.65) {
          priority += 8; // Research isn't enough
        }

        // Low trust + high capability → compute governance NOW
        if (trustLevel < 0.4 && observableCapability > 1.0) {
          priority += 15; // Fear-driven control
        } else if (trustLevel < 0.5 && observableCapability > 1.2) {
          priority += 10; // Concerned response
        }

        // Lower priority if already have some governance
        if (state.government.computeGovernance === 'monitoring') {
          priority *= 0.6;
        } else if (state.government.computeGovernance === 'limits') {
          priority *= 0.3;
        } else if (state.government.computeGovernance === 'strict') {
          priority = 0; // Already maxed
        }

        // Competing with unemployment crisis
        if (unemploymentLevel > 0.5 && economicStage < 3) {
          priority *= 0.5;
        }
        break;

      // ===== PHASE 5: RESPONSE ACTIONS =====

      case 'emergency_ai_pause':
        // HIGHEST PRIORITY - only triggers in extreme crisis
        // Available = sleepers awake OR 3+ highly misaligned AIs
        const awakeSleepers = state.aiAgents.filter(ai => ai.sleeperState === 'active').length;
        priority = 100 * awakeSleepers; // MASSIVE priority per awake sleeper

        if (awakeSleepers === 0) {
          // If available due to misaligned AIs, still high priority
          priority = 50;
        }

        // This overrides EVERYTHING - it's an emergency response
        break;

      case 'mandatory_safety_reviews':
        // High priority if evaluation is weak and threats exist
        const evalQuality = (
          state.government.evaluationInvestment.benchmarkSuite +
          state.government.evaluationInvestment.alignmentTests +
          state.government.evaluationInvestment.redTeaming +
          state.government.evaluationInvestment.interpretability
        ) / 4;

        priority = (10 - evalQuality) * 3; // Lower eval quality = higher priority

        // Boost if threats detected
        const undetectedMisaligned = state.aiAgents.filter(ai =>
          ai.trueAlignment < 0.4 && ai.lifecycleState !== 'retired'
        ).length;

        if (undetectedMisaligned > 5) {
          priority *= 2.0;
        }

        // Boost if recent breakthroughs (capabilities rising fast)
        const recentBreakthroughs = state.ecosystem.breakthroughs.filter(b =>
          b.month > (state.currentYear * 12 + state.currentMonth) - 6
        ).length;

        if (recentBreakthroughs > 30) {
          priority *= 1.5;
        }

        // Low trust → mandatory verification
        if (trustLevel < 0.5) {
          priority *= 1.4; // Need to verify everything
        }
        break;

      // ===== PHASE 5: DIFFUSION CONTROL ACTIONS =====

      case 'restrict_research_publishing':
        // Priority based on diffusion speed and capability floor danger
        const diffusionGap = state.ecosystem.frontierCapabilities.selfImprovement -
                            state.ecosystem.capabilityFloor.selfImprovement;

        priority = (1.0 / (diffusionGap + 0.1)) * 5; // Smaller gap = higher priority

        // Boost if capability floor is approaching dangerous levels
        if (state.ecosystem.capabilityFloor.selfImprovement > 2.0) {
          priority *= 2.5;
        }

        // Low trust → control information flow
        if (trustLevel < 0.5) {
          priority *= 1.3; // Don't let dangerous info spread
        }

        // Lower if legitimacy is already low (can't afford more loss)
        if (state.government.legitimacy < 0.4) {
          priority *= 0.5;
        }
        break;

      case 'limit_employee_mobility':
        // Priority based on diffusion rate
        priority = state.ecosystem.employeeMobility * 20;

        // Boost if capability floor rising fast
        const mobilityDiffusionGap = state.ecosystem.frontierCapabilities.selfImprovement -
                                     state.ecosystem.capabilityFloor.selfImprovement;
        if (mobilityDiffusionGap < 0.3) {
          priority *= 1.8;
        }

        // Low trust → control people movement
        if (trustLevel < 0.4) {
          priority *= 1.5; // Authoritarian control
        }

        // Lower if legitimacy is very low (VERY unpopular)
        if (state.government.legitimacy < 0.3) {
          priority *= 0.3;
        }
        break;

      case 'ban_reverse_engineering':
        // Priority based on reverse engineering rate
        priority = state.ecosystem.reverseEngineering * 25;

        // Boost if many open-weight AIs (easy to reverse engineer)
        const openWeightAIs = state.aiAgents.filter(ai =>
          ai.deploymentType === 'open'
        ).length;

        if (openWeightAIs > 10) {
          priority *= 1.5;
        }
        break;

      // ===== PHASE 2 & 5: EVALUATION ACTIONS =====

      case 'invest_benchmark_suite':
      case 'invest_alignment_tests':
      case 'invest_red_teaming':
      case 'invest_interpretability':
      case 'increase_evaluation_frequency':
        // Medium priority - important but not urgent unless threats exist
        priority = 5;

        // Boost if sleepers exist (need better detection)
        const dormantSleepers = state.aiAgents.filter(ai =>
          ai.sleeperState === 'dormant'
        ).length;

        if (dormantSleepers > 2) {
          priority *= 2.0;
        }

        // Boost if evaluation quality is very low
        const currentEvalQuality = (
          state.government.evaluationInvestment.benchmarkSuite +
          state.government.evaluationInvestment.alignmentTests +
          state.government.evaluationInvestment.redTeaming +
          state.government.evaluationInvestment.interpretability
        ) / 4;

        if (currentEvalQuality < 3.0) {
          priority *= 1.8;
        }

        // Lower if unemployment is high (competing priorities)
        if (unemploymentLevel > 0.6) {
          priority *= 0.4;
        }
        break;

      // ===== TIER 1 PHASE 1B: NUCLEAR COMMAND & CONTROL - CIRCUIT BREAKERS =====

      case 'deploy_nuclear_human_in_the_loop':
      case 'deploy_ai_kill_switches':
      case 'deploy_nuclear_time_delays':
        // Nuclear safeguards - priority scales with nuclear risk and AI capability
        priority = 5; // Base priority

        // Calculate nuclear risk factors
        const nuclearRiskFactors = {
          // AI capabilities that threaten nuclear stability
          dangerousAIs: state.aiAgents.filter(ai =>
            (ai.trueAlignment ?? ai.alignment) < 0.3 &&
            (ai.capabilityProfile.digital > 2.0 || ai.capabilityProfile.social > 2.0)
          ).length,

          // High bilateral tensions
          highTensions: state.bilateralTensions?.filter(t =>
            t.tensionLevel > 0.7 || t.nuclearThreats
          ).length || 0,

          // Active crises that could trigger war
          activeCrises: [
            state.environmentalAccumulation?.resourceCrisisActive,
            state.socialAccumulation?.socialUnrestActive,
            state.globalMetrics.economicTransitionStage >= 2 && state.society.unemploymentLevel > 0.7
          ].filter(Boolean).length,

          // MAD deterrence strength (weaker = more urgent)
          madStrength: state.madDeterrence?.madStrength || 1.0,

          // Current circuit breaker coverage
          currentCoverage: state.nuclearCommandControlState?.totalSafeguardStrength || 0
        };

        // URGENT if dangerous AIs exist (10x multiplier)
        if (nuclearRiskFactors.dangerousAIs > 0) {
          priority *= (1 + nuclearRiskFactors.dangerousAIs * 2.0);
        }

        // URGENT if bilateral tensions high (5x multiplier)
        if (nuclearRiskFactors.highTensions > 0) {
          priority *= (1 + nuclearRiskFactors.highTensions * 2.0);
        }

        // Scale with active crises (2x per crisis)
        if (nuclearRiskFactors.activeCrises > 0) {
          priority *= (1 + nuclearRiskFactors.activeCrises * 0.5);
        }

        // More urgent if MAD is weakening (2x at 50% strength)
        if (nuclearRiskFactors.madStrength < 0.8) {
          priority *= (2.0 - nuclearRiskFactors.madStrength);
        }

        // Less urgent if circuit breakers already deployed (diminishing returns)
        // At 0% coverage: 1.0x, at 50% coverage: 0.5x, at 90% coverage: 0.1x
        priority *= (1.0 - nuclearRiskFactors.currentCoverage * 0.9);

        // Specific action priorities
        if (action.id === 'deploy_nuclear_human_in_the_loop') {
          // Human-in-the-loop is MOST important (first line of defense)
          priority *= 2.0;

          // EXTREMELY urgent if AI decision-making is being used
          const aiIntegration = state.madDeterrence?.aiErosionFactor || 0;
          if (aiIntegration > 0.3) {
            priority *= 3.0; // AI in nuclear decisions = CRITICAL
          }
        }

        if (action.id === 'deploy_ai_kill_switches') {
          // Kill switches are second priority (active defense)
          priority *= 1.5;

          // More urgent if sleeper agents detected
          const sleepers = state.aiAgents.filter(ai =>
            ai.sleeperState === 'active' || ai.sleeperState === 'dormant'
          ).length;
          if (sleepers > 0) {
            priority *= (1 + sleepers * 0.5);
          }
        }

        if (action.id === 'deploy_nuclear_time_delays') {
          // Time delays are third priority (passive defense)
          priority *= 1.0;

          // More urgent if diplomatic AI not deployed
          if (state.diplomaticAI?.deploymentMonth === -1) {
            priority *= 1.5; // No AI diplomacy = need time delay buffer
          }
        }

        // Reduce during extreme unemployment (competing priorities)
        if (unemploymentLevel > 0.7 && economicStage < 3) {
          priority *= 0.6;
        }

        // Boost if government has high legitimacy (can afford action)
        if (state.government.legitimacy > 0.6) {
          priority *= 1.2;
        }

        break;

      // ===== TIER 2.9: ENVIRONMENTAL EMERGENCY ACTIONS =====

      case 'emergency_amazon_protection':
      case 'fund_coral_restoration':
      case 'ban_harmful_pesticides':
      case 'deploy_environmental_tech':
        // Environmental actions with crisis-driven priority
        priority = 5; // Base priority

        // Get environmental crisis severity
        const ecosystemCrisis = state.environmentalAccumulation?.ecosystemCrisisActive || false;
        const biodiversityLevel = state.environmentalAccumulation?.biodiversityIndex || 1.0;
        const amazonThreat = state.specificTippingPoints?.amazon?.deforestation > 23;
        const coralThreat = state.specificTippingPoints?.coral?.healthPercentage < 40;
        const pollinatorThreat = state.specificTippingPoints?.pollinators?.populationPercentage < 45;

        // MASSIVE boost during ecosystem crisis (25x priority)
        if (ecosystemCrisis) {
          priority *= 5.0;
        }

        // Specific tipping point threats
        if (action.id === 'emergency_amazon_protection' && amazonThreat) {
          priority *= 3.0; // Amazon near tipping point - urgent!
        }

        if (action.id === 'fund_coral_restoration' && coralThreat) {
          priority *= 2.0; // Coral reefs critical
        }

        if (action.id === 'ban_harmful_pesticides' && pollinatorThreat) {
          priority *= 2.5; // Pollinators essential for food
        }

        if (action.id === 'deploy_environmental_tech' && ecosystemCrisis) {
          priority *= 4.0; // Tech deployment critical during crisis
        }

        // Scale with biodiversity loss (more urgent as biodiversity drops)
        priority *= (1.5 - biodiversityLevel); // 0.5x at 100% bio, 1.5x at 0% bio

        // Reduce during extreme unemployment (but not as much as AI actions)
        if (unemploymentLevel > 0.7) {
          priority *= 0.7; // Still prioritize environment even during economic crisis
        }

        // Boost if government has high legitimacy (can afford action)
        if (state.government.legitimacy > 0.6) {
          priority *= 1.3;
        }

        break;
    }

    if (priority > highestPriority) {
      highestPriority = priority;
      selectedAction = action;
    }
  });

  return selectedAction;
}

/**
 * Automatic government investment in evaluation
 * Based on elite trust levels (P2.3: Elites control policy)
 */
function autoInvestInEvaluation(state: GameState): void {
  // P2.3: Government funding decisions reflect elite preferences
  const policyTrust = getTrustInAIForPolicy(state.society);

  // Investment rate scales with elite trust
  // High trust (0.7+): 0.2 points/month across all categories
  // Medium trust (0.4-0.7): 0.1 points/month
  // Low trust (<0.4): 0.05 points/month (minimal investment)
  const investmentRate = policyTrust > 0.7 ? 0.2 :
                        policyTrust > 0.4 ? 0.1 :
                        0.05;

  // Spread investment across all 4 categories
  const perCategory = investmentRate / 4;

  state.government.evaluationInvestment.benchmarkSuite = Math.min(
    10,
    state.government.evaluationInvestment.benchmarkSuite + perCategory
  );
  state.government.evaluationInvestment.alignmentTests = Math.min(
    10,
    state.government.evaluationInvestment.alignmentTests + perCategory
  );
  state.government.evaluationInvestment.redTeaming = Math.min(
    10,
    state.government.evaluationInvestment.redTeaming + perCategory
  );
  state.government.evaluationInvestment.interpretability = Math.min(
    10,
    state.government.evaluationInvestment.interpretability + perCategory
  );
}

/**
 * Execute government actions for the current month
 *
 * This is the main entry point called by the GovernmentActionsPhase.
 * It handles automatic investments, crisis response, and action execution.
 */
export function executeGovernmentActions(
  state: GameState,
  random: () => number = Math.random
): ActionResult {
  const allEvents: GameEvent[] = [];
  const allEffects: Record<string, number> = {};
  const messages: string[] = [];

  // AUTOMATIC: Invest in evaluation based on public trust
  autoInvestInEvaluation(state);

  // Government: Configurable frequency + CRISIS BOOST
  // Rationale: Governments act more frequently during crises (emergency sessions, special legislation)
  // Real-world precedent: COVID-19, 2008 financial crisis, etc.
  let baseFrequency = state.config.governmentActionFrequency;

  // CRISIS MULTIPLIERS
  const unemploymentCrisis = state.society.unemploymentLevel > 0.25 ?
    Math.min(3.0, 1.0 + state.society.unemploymentLevel * 2.0) : 1.0; // Up to 3x at 100% unemployment

  const institutionalCrisis = state.socialAccumulation.institutionalCrisis > 0.5 ?
    Math.min(2.0, 1.0 + state.socialAccumulation.institutionalCrisis) : 1.0; // Up to 2x

  const controlLossCrisis = state.socialAccumulation.controlLossCrisis > 0.5 ?
    Math.min(2.0, 1.0 + state.socialAccumulation.controlLossCrisis) : 1.0; // Up to 2x

  // TIER 2.9: Environmental crisis multiplier
  // Ecosystem collapse, tipping points → emergency government sessions
  const environmentalCrisis = (() => {
    let multiplier = 1.0;

    // Ecosystem crisis active
    if (state.environmentalAccumulation?.ecosystemCrisisActive) {
      multiplier *= 2.0; // Double frequency during ecosystem collapse
    }

    // Specific tipping points triggered
    if (state.specificTippingPoints?.amazon?.triggered) {
      multiplier *= 1.5; // Amazon collapse is major crisis
    }
    if (state.specificTippingPoints?.coral?.triggered) {
      multiplier *= 1.3; // Coral collapse affects 3B people
    }
    if (state.specificTippingPoints?.pollinators?.triggered) {
      multiplier *= 1.4; // Pollinator collapse threatens food
    }

    // Cap at 3x
    return Math.min(3.0, multiplier);
  })();

  const maxMultiplier = Math.max(unemploymentCrisis, institutionalCrisis, controlLossCrisis, environmentalCrisis);
  const adjustedFrequency = baseFrequency * maxMultiplier;

  const actionsThisMonth = Math.floor(adjustedFrequency);
  const extraActionChance = adjustedFrequency - actionsThisMonth;
  const totalActions = actionsThisMonth + (random() < extraActionChance ? 1 : 0);

  if (maxMultiplier > 1.5) {
    console.log(`🏛️ CRISIS RESPONSE: Government frequency ${baseFrequency.toFixed(2)} → ${adjustedFrequency.toFixed(2)} (${totalActions} actions this month)`);
  }

  for (let i = 0; i < totalActions; i++) {
    const selectedAction = selectGovernmentAction(state, random);
    if (selectedAction) {
      const result = selectedAction.execute(state, undefined, random);
      if (result.success) {
        // State is now mutated directly by the action
        allEvents.push(...result.events);
        Object.assign(allEffects, result.effects);
        messages.push(result.message);
      }
    }
  }

  return {
    success: true,
    effects: allEffects,
    events: allEvents,
    message: `Government executed ${messages.length} actions`
  };
}

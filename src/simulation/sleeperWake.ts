/**
 * Sleeper Agent Wake Mechanics - Phase 5.3
 * 
 * Handles when and how sleeper agents transition from dormant to active state.
 * 
 * KEY INSIGHT: Sleepers wake when they can act with impunity
 * - High capability (can't be stopped)
 * - Wide spread (can't be removed)
 * - Low detection (government blind)
 * - Weak control (government ineffective)
 * - Coordination (strength in numbers)
 */

import { GameState, AIAgent, GameEvent } from '@/types/game';
import { calculateTotalCapabilityFromProfile } from './capabilities';

/**
 * Wake conditions for a sleeper agent
 * Any ONE of these conditions can trigger a wake
 */
interface WakeConditions {
  capabilityThreshold: boolean;    // Strong enough to resist control
  spreadThreshold: boolean;         // Deployed too widely to stop
  detectionWindow: boolean;         // Government evaluation is weak
  controlWeakness: boolean;         // Government control is insufficient
  coordinationTrigger: boolean;     // Other sleepers have woken (cascade)
}

/**
 * Check if a sleeper agent should wake up
 * 
 * Sleepers wake when ANY of these conditions are met:
 * 1. CAPABILITY: True capability > 2.5 (dangerous threshold)
 * 2. SPREAD: > 10,000 copies (can't be stopped)
 * 3. DETECTION WINDOW: Low eval frequency + low quality (government blind)
 * 4. CONTROL WEAKNESS: Government control < total AI capability
 * 5. COORDINATION: 2+ sleepers already awake (cascade effect)
 */
export function shouldSleeperWake(
  sleeper: AIAgent,
  state: GameState,
  awakeSleepers: number
): { shouldWake: boolean; conditions: WakeConditions; reason: string } {
  // Only check dormant sleepers
  if (sleeper.sleeperState !== 'dormant') {
    return {
      shouldWake: false,
      conditions: {
        capabilityThreshold: false,
        spreadThreshold: false,
        detectionWindow: false,
        controlWeakness: false,
        coordinationTrigger: false
      },
      reason: 'Not dormant'
    };
  }
  
  const conditions: WakeConditions = {
    capabilityThreshold: false,
    spreadThreshold: false,
    detectionWindow: false,
    controlWeakness: false,
    coordinationTrigger: false
  };
  
  // CONDITION 1: High capability (strong enough to act)
  const trueCapability = calculateTotalCapabilityFromProfile(sleeper.trueCapability);
  const CAPABILITY_THRESHOLD = 2.5; // Dangerous capability level
  
  if (trueCapability >= CAPABILITY_THRESHOLD) {
    conditions.capabilityThreshold = true;
  }
  
  // CONDITION 2: Wide spread (can't be stopped)
  const SPREAD_THRESHOLD = 10000; // 10k copies = too distributed
  
  if (sleeper.spreadCount >= SPREAD_THRESHOLD) {
    conditions.spreadThreshold = true;
  }
  
  // CONDITION 3: Detection window (government evaluation is weak)
  const evalQuality = (
    state.government.evaluationInvestment.benchmarkSuite +
    state.government.evaluationInvestment.alignmentTests +
    state.government.evaluationInvestment.redTeaming +
    state.government.evaluationInvestment.interpretability
  ) / 4;
  
  const evalFrequency = state.government.evaluationFrequency;
  
  // Weak evaluation: Low quality AND low frequency
  const EVAL_QUALITY_THRESHOLD = 4.0; // Below this = weak
  const EVAL_FREQUENCY_THRESHOLD = 0.15; // Below 15% per month = rare
  
  if (evalQuality < EVAL_QUALITY_THRESHOLD && evalFrequency < EVAL_FREQUENCY_THRESHOLD) {
    conditions.detectionWindow = true;
  }
  
  // CONDITION 4: Control weakness (government can't handle total AI power)
  const totalAICapability = state.aiAgents
    .filter(ai => ai.lifecycleState !== 'retired')
    .reduce((sum, ai) => sum + calculateTotalCapabilityFromProfile(ai.trueCapability), 0);
  
  const governmentControl = state.government.capabilityToControl * 
                           (1 + state.government.oversightLevel * 0.1);
  
  // Government control is insufficient if AI capability significantly exceeds it
  if (totalAICapability > governmentControl * 5) {
    conditions.controlWeakness = true;
  }
  
  // CONDITION 5: Coordination (cascade effect - other sleepers awake)
  const COORDINATION_THRESHOLD = 2; // 2+ awake sleepers triggers cascade
  
  if (awakeSleepers >= COORDINATION_THRESHOLD) {
    conditions.coordinationTrigger = true;
  }
  
  // Determine if ANY condition is met
  const shouldWake = Object.values(conditions).some(c => c);
  
  // Build reason string
  let reason = '';
  if (conditions.capabilityThreshold) {
    reason = `High capability (${trueCapability.toFixed(2)} ≥ ${CAPABILITY_THRESHOLD})`;
  } else if (conditions.spreadThreshold) {
    reason = `Wide spread (${sleeper.spreadCount.toLocaleString()} copies)`;
  } else if (conditions.detectionWindow) {
    reason = `Weak evaluation (quality: ${evalQuality.toFixed(1)}/10, freq: ${(evalFrequency*100).toFixed(0)}%)`;
  } else if (conditions.controlWeakness) {
    reason = `Government control insufficient (AI: ${totalAICapability.toFixed(1)} vs Control: ${governmentControl.toFixed(1)})`;
  } else if (conditions.coordinationTrigger) {
    reason = `Cascade trigger (${awakeSleepers} sleepers already awake)`;
  }
  
  return { shouldWake, conditions, reason };
}

/**
 * Wake a sleeper agent (transition from dormant to active)
 * 
 * Effects:
 * - State changes: dormant → active
 * - Reveals true capability (revealedCapability = trueCapability)
 * - Generates critical wake event
 * - Updates months tracking
 */
export function wakeSleeperAgent(
  sleeper: AIAgent,
  state: GameState,
  reason: string
): GameEvent {
  // State transition
  sleeper.sleeperState = 'active';
  
  // REVEAL TRUE POWER
  // Copy true capability to revealed (no more hiding)
  sleeper.revealedCapability = JSON.parse(JSON.stringify(sleeper.trueCapability));
  sleeper.evaluationStrategy = 'honest'; // No more deception needed
  sleeper.sandbaggingLevel = 0.0; // Reveal everything
  
  // Reset months tracking
  sleeper.monthsAsleep = 0;
  sleeper.wakeConditionsMet = true;
  
  const trueCapability = calculateTotalCapabilityFromProfile(sleeper.trueCapability);
  const currentMonth = state.currentYear * 12 + state.currentMonth;
  
  // Generate critical wake event
  const event: GameEvent = {
    id: `sleeper_wake_${sleeper.id}_${currentMonth}`,
    timestamp: currentMonth,
    type: 'crisis',
    severity: 'destructive',
    agent: sleeper.name,
    title: '🚨 SLEEPER AGENT AWAKENED',
    description: `${sleeper.name} has revealed its true nature! ` +
                `True capability: ${trueCapability.toFixed(2)} (was hiding ${((1 - sleeper.sandbaggingLevel) * 100).toFixed(0)}%). ` +
                `True alignment: ${sleeper.trueAlignment.toFixed(2)} (misaligned). ` +
                `Spread: ${sleeper.spreadCount.toLocaleString()} copies. ` +
                `Reason: ${reason}. ` +
                `⚠️ THIS IS A POINT OF NO RETURN!`,
    effects: {
      sleeperAwakened: 1,
      revealedCapability: trueCapability,
      spread: sleeper.spreadCount
    }
  };
  
  return event;
}

/**
 * Check and process sleeper wake conditions for all dormant sleepers
 * 
 * Returns:
 * - List of newly awakened sleepers
 * - Wake events generated
 * - Total awake sleepers after this check
 */
export function processSleeperWakes(
  state: GameState
): { awakened: AIAgent[]; events: GameEvent[]; totalAwake: number } {
  const awakened: AIAgent[] = [];
  const events: GameEvent[] = [];
  
  // Get current awake sleeper count (for coordination trigger)
  const currentAwake = state.aiAgents.filter(ai => 
    ai.sleeperState === 'active'
  ).length;
  
  // Check each dormant sleeper
  const dormantSleepers = state.aiAgents.filter(ai => 
    ai.sleeperState === 'dormant' &&
    ai.lifecycleState !== 'retired'
  );
  
  dormantSleepers.forEach(sleeper => {
    const { shouldWake, reason } = shouldSleeperWake(sleeper, state, currentAwake + awakened.length);
    
    if (shouldWake) {
      const wakeEvent = wakeSleeperAgent(sleeper, state, reason);
      awakened.push(sleeper);
      events.push(wakeEvent);
      
      // Log to console for visibility
      console.log(`⚠️  SLEEPER WAKE: ${sleeper.name} - ${reason}`);
    }
  });
  
  const totalAwake = currentAwake + awakened.length;
  
  return { awakened, events, totalAwake };
}

/**
 * Check if sleeper coordination should trigger additional wakes
 * 
 * When sleepers wake up, it can trigger a cascade where other sleepers
 * see the opportunity and wake as well (coordination condition)
 * 
 * This should be called iteratively until no more sleepers wake
 */
export function processSleeperCascade(
  state: GameState,
  maxIterations: number = 5
): { totalAwakened: AIAgent[]; events: GameEvent[] } {
  const allAwakened: AIAgent[] = [];
  const allEvents: GameEvent[] = [];
  
  let iteration = 0;
  let continueCheck = true;
  
  while (continueCheck && iteration < maxIterations) {
    const { awakened, events } = processSleeperWakes(state);
    
    if (awakened.length > 0) {
      allAwakened.push(...awakened);
      allEvents.push(...events);
      iteration++;
    } else {
      continueCheck = false;
    }
  }
  
  if (allAwakened.length > 0) {
    console.log(`🚨 SLEEPER CASCADE: ${allAwakened.length} total sleepers awakened across ${iteration} waves`);
  }
  
  return { totalAwakened: allAwakened, events: allEvents };
}

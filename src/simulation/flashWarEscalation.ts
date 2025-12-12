/**
 * Flash War Escalation Mechanics - Post-Recalibration Fix #5
 *
 * Models the speed risk from AI-enhanced autonomous weapons systems.
 * Flash wars = conflicts escalate at machine speed, faster than human de-escalation.
 *
 * **RESEARCH FOUNDATION (TRL 7-8):**
 * - ECFR (2024): Flash wars = autonomous systems escalate at machine speed
 * - Penn CERL (2024): Circuit breaker solutions (parallel to financial markets)
 * - UN Resolution (2024): 166-3 consensus on AWS acceleration risk
 * - Current deployment: Ukraine drones, Israel "Lavender" system (37K targets)
 *
 * **KEY INSIGHT:**
 * Current model has death multiplier, but misses escalation *speed* risk.
 * With AI capability > 4.0, conflicts can spiral before humans intervene.
 *
 * **THREE MECHANICS:**
 * 1. Flash War Escalation - 5% chance per conflict/month when AI > 4.0
 * 2. AI-Mediated De-escalation - Aligned high-capability AI can prevent escalation
 * 3. Circuit Breakers - Emergency safeguards developed after first flash war
 *
 * @see Post-Recalibration Research: /research/post-recalibration-solutions_20251018.md
 * @see Implementation Plan: /plans/post-recalibration-fixes_plan.md (Fix #5)
 */

import type { GameState } from '../types/game';
import type { RNGFunction } from './engine/PhaseOrchestrator';
import { assertFinite, assertProbability, assertInRange, assertStateProperty } from './utils/assertions';

// === FLASH WAR ESCALATION PARAMETERS ===

/**
 * AI capability threshold above which flash war risk activates
 * Research: Autonomous systems at GPT-4+ level can make tactical decisions faster than humans
 */
const FLASH_WAR_THRESHOLD_CAPABILITY = 4.0;

/**
 * Per-conflict monthly chance of flash war escalation
 * Research: ECFR (2024) - interaction risk between autonomous systems
 */
const FLASH_WAR_ESCALATION_CHANCE = 0.05;  // 5% per conflict/month

/**
 * Casualty multiplier if flash war occurs
 * Research: Penn CERL (2024) - harm is catastrophic before intervention possible
 */
const FLASH_WAR_MULTIPLIER = 2.5;  // 2.5x casualties before circuit breakers engage

/**
 * Time to develop and deploy circuit breakers after first flash war
 * Research: Parallel to 2010 flash crash (took months to implement safeguards)
 */
const CIRCUIT_BREAKER_DELAY = 3;  // 3 months to implement safeguards

// === AI-MEDIATED DE-ESCALATION PARAMETERS ===

/**
 * Minimum AI capability for effective diplomatic intervention
 * Research: Conflict resolution requires sophisticated negotiation (GPT-3.5+ level)
 */
const DEESCALATION_CAPABILITY_THRESHOLD = 3.5;

/**
 * Minimum alignment for AI to be trusted with de-escalation
 * Research: Misaligned AI might escalate conflicts for instrumental goals
 */
const DEESCALATION_ALIGNMENT_THRESHOLD = 0.7;

/**
 * Base success rate for AI-mediated de-escalation
 * Research: Limited empirical data, conservative estimate
 */
const DEESCALATION_SUCCESS_RATE = 0.3;  // 30% base chance

/**
 * Casualty reduction if de-escalation successful
 * Research: Early intervention can prevent escalation spirals
 */
const DEESCALATION_REDUCES_DEATHS = 0.4;  // 40% reduction

// === CIRCUIT BREAKER PARAMETERS ===

/**
 * Effectiveness of circuit breakers once deployed
 * Research: Financial market circuit breakers ~50-70% effective
 */
const CIRCUIT_BREAKER_EFFECTIVENESS = 0.6;  // 60% reduction in flash war chance

/**
 * Check if flash war risk exists this month
 *
 * Flash wars can occur when:
 * 1. Average AI capability > 4.0 (autonomous weapon systems deployed)
 * 2. Active military conflicts exist
 * 3. No circuit breakers active (or they fail)
 *
 * @param state Current game state
 * @param rng Random number generator (for determinism)
 * @returns True if flash war occurs this month
 */
export function checkFlashWarRisk(state: GameState, rng: RNGFunction): boolean {
  const peace = state.conflictResolution;

  // Get average AI capability
  const agentCount = state.aiAgents.length;
  const avgCapability = assertFinite(
    agentCount > 0 ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / agentCount : 0,
    {
      location: 'checkFlashWarRisk',
      valueName: 'avgCapability',
      month: state.currentMonth,
      additionalInfo: { agentCount }
    }
  );

  // No risk if AI capability below threshold
  if (avgCapability < FLASH_WAR_THRESHOLD_CAPABILITY) {
    return false;
  }

  // Get active conflicts count
  const activeConflicts = peace.activeConflicts || 0;

  // No risk if no conflicts
  if (activeConflicts === 0) {
    return false;
  }

  // Circuit breakers reduce flash war chance
  let escalationChance = assertProbability(FLASH_WAR_ESCALATION_CHANCE, {
    location: 'checkFlashWarRisk',
    valueName: 'escalationChance',
    month: state.currentMonth
  });
  if (peace.circuitBreakersActive) {
    escalationChance = assertProbability(escalationChance * (1 - CIRCUIT_BREAKER_EFFECTIVENESS), {
      location: 'checkFlashWarRisk',
      valueName: 'escalationChance_withCircuitBreakers',
      month: state.currentMonth,
      additionalInfo: { originalChance: FLASH_WAR_ESCALATION_CHANCE }
    });
  }

  // Each active conflict has independent chance to escalate
  for (let i = 0; i < activeConflicts; i++) {
    const randomValue = assertProbability(rng(), {
      location: 'checkFlashWarRisk',
      valueName: 'randomValue',
      month: state.currentMonth,
      additionalInfo: { conflictIndex: i }
    });
    if (randomValue < escalationChance) {
      return true;  // Flash war triggered
    }
  }

  return false;
}

/**
 * Apply flash war effects to the game state
 *
 * Effects:
 * 1. Multiply current month war deaths by 2.5x
 * 2. Trigger circuit breaker development (3-month delay)
 * 3. Log critical event
 *
 * @param state Current game state
 */
export function applyFlashWarEffects(state: GameState): void {
  const pop = state.humanPopulationSystem;
  const peace = state.conflictResolution;

  // Apply 2.5x casualties to current month war deaths
  const originalWarDeaths = assertStateProperty(pop.deathsByCategory, 'war', {
    location: 'applyFlashWarEffects',
    month: state.currentMonth
  });
  const multiplier = assertInRange(FLASH_WAR_MULTIPLIER, 1, 10, {
    location: 'applyFlashWarEffects',
    valueName: 'FLASH_WAR_MULTIPLIER',
    month: state.currentMonth
  });
  pop.deathsByCategory.war = assertFinite(originalWarDeaths * multiplier, {
    location: 'applyFlashWarEffects',
    valueName: 'newWarDeaths',
    month: state.currentMonth,
    additionalInfo: { originalWarDeaths, multiplier }
  });

  const additionalDeaths = assertFinite(pop.deathsByCategory.war - originalWarDeaths, {
    location: 'applyFlashWarEffects',
    valueName: 'additionalDeaths',
    month: state.currentMonth,
    additionalInfo: { originalWarDeaths, newWarDeaths: pop.deathsByCategory.war }
  });

  // Update total death tracking
  // monthlyDeathsApplied is always initialized in initializeHumanPopulationSystem() (Oct 28, 2025)
  pop.monthlyDeathsApplied = assertFinite(pop.monthlyDeathsApplied + additionalDeaths, {
    location: 'applyFlashWarEffects',
    valueName: 'monthlyDeathsApplied',
    month: state.currentMonth,
    additionalInfo: { previousTotal: pop.monthlyDeathsApplied, additionalDeaths }
  });

  // FIX (Oct 30, 2025): BUG #2 - Flash war additional deaths missing root attribution
  // Flash wars are autonomous AI escalation beyond human control
  // Root cause: disruption (autonomous systems acting faster than governance can respond)
  pop.deathsByRootCause.disruption += additionalDeaths;

  // Trigger circuit breaker development
  if (!peace.circuitBreakersActive && !peace.circuitBreakerDevelopmentActive) {
    peace.circuitBreakerDevelopmentActive = true;
    peace.circuitBreakerMonthsRemaining = CIRCUIT_BREAKER_DELAY;
  }

  // Increment flash war count
  // flashWarCount is always initialized in initializeConflictResolution() (Oct 28, 2025)
  peace.flashWarCount = peace.flashWarCount + 1;

  // Log critical event
  console.log(`\n🚨 FLASH WAR ESCALATION (Month ${state.currentMonth})`);
  console.log(`   Autonomous weapons escalated conflict at machine speed`);
  console.log(`   War deaths: ${(originalWarDeaths * 1000).toFixed(1)}M → ${(pop.deathsByCategory.war * 1000).toFixed(1)}M (${FLASH_WAR_MULTIPLIER}x multiplier)`);
  console.log(`   Additional casualties: ${(additionalDeaths * 1000).toFixed(1)}M`);

  if (peace.circuitBreakerDevelopmentActive) {
    console.log(`   🛡️  Circuit breaker development initiated (${CIRCUIT_BREAKER_DELAY} months to deployment)`);
  }
}

/**
 * Attempt AI-mediated de-escalation
 *
 * High-capability aligned AI can mediate conflicts and prevent escalation.
 *
 * Requirements:
 * - At least one AI with capability > 3.5 and alignment > 0.7
 * - 30% base success rate
 * - 40% casualty reduction if successful
 *
 * @param state Current game state
 * @param rng Random number generator
 * @returns True if de-escalation successful
 */
export function attemptAIDeEscalation(state: GameState, rng: RNGFunction): boolean {
  // Find capable and aligned AIs
  const diplomaticAIs = state.aiAgents.filter(ai => {
    const capability = ai.capability;
    const alignment = ai.trueAlignment;

    return capability > DEESCALATION_CAPABILITY_THRESHOLD
        && alignment > DEESCALATION_ALIGNMENT_THRESHOLD;
  });

  // No capable diplomatic AI available
  if (diplomaticAIs.length === 0) {
    return false;
  }

  // Get best diplomatic AI (highest social capability)
  let bestSocialCapability = 0;
  for (const ai of diplomaticAIs) {
    const socialCap = ai.capabilityProfile?.social || (ai.capability * 0.3);
    if (socialCap > bestSocialCapability) {
      bestSocialCapability = socialCap;
    }
  }
  bestSocialCapability = assertFinite(bestSocialCapability, {
    location: 'attemptAIDeEscalation',
    valueName: 'bestSocialCapability',
    month: state.currentMonth,
    additionalInfo: { diplomaticAICount: diplomaticAIs.length }
  });

  // Success chance increases with social capability
  // Clamp to [0, 1] to prevent overflow from high social capability
  const rawSuccessChance = DEESCALATION_SUCCESS_RATE * (1 + (bestSocialCapability / 10));
  const successChance = assertProbability(
    Math.min(1.0, Math.max(0.0, rawSuccessChance)),
    {
      location: 'attemptAIDeEscalation',
      valueName: 'successChance',
      month: state.currentMonth,
      additionalInfo: { baseRate: DEESCALATION_SUCCESS_RATE, bestSocialCapability }
    }
  );

  const randomValue = assertProbability(rng(), {
    location: 'attemptAIDeEscalation',
    valueName: 'randomValue',
    month: state.currentMonth
  });
  if (randomValue < successChance) {
    // AI mediation successful - reduce war deaths
    const pop = state.humanPopulationSystem;
    const originalWarDeaths = assertStateProperty(pop.deathsByCategory, 'war', {
      location: 'attemptAIDeEscalation',
      month: state.currentMonth
    });
    const reductionFactor = assertProbability(DEESCALATION_REDUCES_DEATHS, {
      location: 'attemptAIDeEscalation',
      valueName: 'DEESCALATION_REDUCES_DEATHS',
      month: state.currentMonth
    });
    pop.deathsByCategory.war = assertFinite(originalWarDeaths * (1 - reductionFactor), {
      location: 'attemptAIDeEscalation',
      valueName: 'newWarDeaths',
      month: state.currentMonth,
      additionalInfo: { originalWarDeaths, reductionFactor }
    });

    const deathsAverted = assertFinite(originalWarDeaths - pop.deathsByCategory.war, {
      location: 'attemptAIDeEscalation',
      valueName: 'deathsAverted',
      month: state.currentMonth,
      additionalInfo: { originalWarDeaths, newWarDeaths: pop.deathsByCategory.war }
    });

    // Update total death tracking
    // monthlyDeathsApplied is always initialized in initializeHumanPopulationSystem() (Oct 28, 2025)
    pop.monthlyDeathsApplied = assertFinite(pop.monthlyDeathsApplied - deathsAverted, {
      location: 'attemptAIDeEscalation',
      valueName: 'monthlyDeathsApplied',
      month: state.currentMonth,
      additionalInfo: { previousTotal: pop.monthlyDeathsApplied, deathsAverted }
    });

    // Log success
    console.log(`\n🕊️  AI-MEDIATED DE-ESCALATION SUCCESS (Month ${state.currentMonth})`);
    console.log(`   High-capability aligned AI prevented conflict escalation`);
    console.log(`   War deaths reduced: ${(originalWarDeaths * 1000).toFixed(1)}M → ${(pop.deathsByCategory.war * 1000).toFixed(1)}M`);
    console.log(`   Lives saved: ${(deathsAverted * 1000).toFixed(1)}M`);

    return true;
  }

  return false;
}

/**
 * Update circuit breaker development
 *
 * After first flash war, circuit breakers are developed over 3 months.
 * Once active, they reduce flash war chance by 60%.
 *
 * @param state Current game state
 */
export function updateCircuitBreakers(state: GameState): void {
  const peace = state.conflictResolution;

  // If circuit breakers already active, nothing to do
  if (peace.circuitBreakersActive) {
    return;
  }

  // If development active, count down
  // circuitBreakerMonthsRemaining is always initialized in initializeConflictResolution() (Oct 28, 2025)
  if (peace.circuitBreakerDevelopmentActive) {
    peace.circuitBreakerMonthsRemaining = peace.circuitBreakerMonthsRemaining - 1;

    if (peace.circuitBreakerMonthsRemaining <= 0) {
      // Circuit breakers now active
      peace.circuitBreakersActive = true;
      peace.circuitBreakerDevelopmentActive = false;
      peace.circuitBreakerMonthsRemaining = 0;

      console.log(`\n🛡️  CIRCUIT BREAKERS DEPLOYED (Month ${state.currentMonth})`);
      console.log(`   Automated safeguards to halt AI weapon systems during escalation`);
      console.log(`   Flash war risk reduced by ${(CIRCUIT_BREAKER_EFFECTIVENESS * 100).toFixed(0)}%`);
    }
  }
}

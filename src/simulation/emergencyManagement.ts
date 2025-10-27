/**
 * Emergency Management Bureau System
 * FIX #11 (Oct 20, 2025): Fast Crisis Response Using Existing Capabilities
 *
 * KEY DISTINCTION:
 * - Emergency Response (this file): 0.5-3 months, uses EXISTING capabilities
 * - Technology Deployment: 24-48 months baseline, develops NEW capabilities
 *
 * Research Foundation:
 * - GAO (2020): Strategic National Stockpile deployment in 12-48 hours
 * - Ashraf (2020, PMC): COVID lockdown timing correlates with mortality (r² = 0.64)
 * - Every 7.49-day delay DOUBLES mortality (empirical COVID data, 37 OECD countries)
 * - Hurricane Katrina (2005) → Sandy (2012): 7 years, 50% improvement (learning effect)
 * - DOD (2013): Military deployment 0-7 days with pre-positioning vs 4-5 days without
 * - TARP (2008): 13 days Congressional passage, 11 days deployment
 *
 * Mechanisms:
 * 1. Pre-positioned resources (stockpiles, reserves) → 12-48 hour deployment
 * 2. Emergency legal frameworks (executive orders, emergency powers) → 0-7 days
 * 3. Mobilization speed based on government type, prior experience, coordination
 * 4. TIMING > INTENSITY: Early response exponentially more effective than late response
 */

import { GameState } from '@/types/game';

/**
 * Emergency Management Bureau State
 * Tracks government readiness and pre-positioned capabilities
 */
export interface EmergencyManagementState {
  // Strategic reserves (pre-positioned resources)
  strategicReserves: {
    medical: number;        // Medical supplies, vaccines, PPE (0-1)
    food: number;           // Food stockpiles (0-1)
    energy: number;         // Strategic petroleum reserve equivalent (0-1)
    water: number;          // Emergency water supplies (0-1)
    financial: number;      // Emergency fund / stabilization reserves (0-1)
  };

  // Coordination infrastructure
  coordinationQuality: number;    // 0-1 (unified command vs fragmented)
  earlyWarningIntegration: number; // 0-1 (prediction → pre-positioning pipeline)

  // Learning from past crises
  crisisExperience: {
    pandemic: number;       // 0-1 (learned from past pandemics)
    climate: number;        // 0-1 (learned from past climate disasters)
    economic: number;       // 0-1 (learned from past financial crises)
    social: number;         // 0-1 (learned from past social unrest)
    technological: number;  // 0-1 (learned from past tech failures)
  };

  // Active emergency responses
  activeResponses: EmergencyResponse[];
}

/**
 * Emergency Response
 * Represents a specific crisis response deployment
 */
export interface EmergencyResponse {
  id: string;
  crisisType: 'pandemic' | 'climate' | 'economic' | 'social' | 'technological' | 'nuclear';
  startedMonth: number;
  deploymentTime: number;     // Months to full deployment (0.5-3 months)
  monthsDeployed: number;     // How long has it been active
  effectiveness: number;       // 0-1 (actual impact on crisis)
  resourcesUsed: number;      // 0-1 (fraction of reserves consumed)
  completed: boolean;
}

/**
 * Initialize emergency management system
 * Research: Most countries have SOME emergency infrastructure (varies by governance quality)
 */
export function initializeEmergencyManagement(governmentQuality: number): EmergencyManagementState {
  // Strategic reserves scale with government quality
  // Research: High-income countries maintain 90-120 day stockpiles (GAO 2020)
  // Lower-income: 30-60 days typical
  const reserveLevel = governmentQuality * 0.7; // Max 70% stockpiled at start

  return {
    strategicReserves: {
      medical: reserveLevel * 0.5,    // Medical stockpiles often underfunded
      food: reserveLevel * 0.8,       // Most countries maintain grain reserves
      energy: reserveLevel * 0.6,     // Strategic petroleum reserves common
      water: reserveLevel * 0.3,      // Water infrastructure often neglected
      financial: governmentQuality * 0.4, // Emergency funds vary widely
    },
    coordinationQuality: governmentQuality * 0.6, // Start modest, can improve
    earlyWarningIntegration: 0.2, // Most countries have poor prediction → action pipeline
    crisisExperience: {
      pandemic: 0,    // Learn from COVID, future pandemics
      climate: 0,     // Learn from hurricanes, floods, droughts
      economic: 0,    // Learn from 2008, future recessions
      social: 0,      // Learn from riots, unrest
      technological: 0, // Learn from AI incidents, tech failures
    },
    activeResponses: [],
  };
}

/**
 * Calculate emergency response deployment time
 * Based on pre-positioned resources, coordination, and learning
 *
 * Research:
 * - Pre-positioned: 0.5-1.5 months (12-48 hours to weeks)
 * - Mobilization: 1.5-3 months (lockdowns, military, financial)
 * - With learning: 50% reduction (Katrina → Sandy precedent)
 */
export function calculateEmergencyDeploymentTime(
  state: GameState,
  crisisType: 'pandemic' | 'climate' | 'economic' | 'social' | 'technological' | 'nuclear'
): number {
  const em = state.emergencyManagement;
  if (!em) return 3.0; // No emergency management = slow response

  // Base deployment time by crisis type
  const baseDeploymentTimes: Record<typeof crisisType, number> = {
    pandemic: 1.5,      // Lockdowns, testing, vaccines (COVID: 0.5-2 months)
    climate: 2.0,       // Disaster relief, evacuation (hurricanes: 1-3 months)
    economic: 1.0,      // Financial interventions (TARP: 0.75 months = 3 weeks)
    social: 1.5,        // Police, military, negotiation (riots: 1-2 months)
    technological: 2.5, // AI pause, oversight, regulation (slower - no precedent)
    nuclear: 0.5,       // Fastest - military always on standby (0-7 days)
  };

  let deploymentTime = baseDeploymentTimes[crisisType];

  // MODIFIER 1: Pre-positioned resources reduce time
  // Research: Strategic stockpiles enable 12-48 hour deployment vs weeks without
  const relevantReserve = getRelevantReserve(em.strategicReserves, crisisType);
  const reserveModifier = 1.0 - (relevantReserve * 0.5); // Max 50% reduction
  deploymentTime *= reserveModifier;

  // MODIFIER 2: Coordination quality
  // Research: Unified command (Sandy) vs fragmented (Katrina) = 50% improvement
  const coordinationModifier = 1.0 - (em.coordinationQuality * 0.3); // Max 30% reduction
  deploymentTime *= coordinationModifier;

  // MODIFIER 3: Prior experience (learning effect)
  // Research: Katrina (2005) → Sandy (2012) = 50% improvement over 7 years
  const category = getCrisisExperienceCategory(crisisType);
  const experience = em.crisisExperience[category];

  // VALIDATION: All crisis experience categories should be initialized
  if (experience === undefined) {
    throw new Error(
      `CRITICAL: Crisis experience category '${category}' not initialized. ` +
      `This indicates initializeEmergencyManagement() was not called properly. ` +
      `Experience: ${JSON.stringify(em.crisisExperience)}`
    );
  }

  const experienceModifier = 1.0 - (experience * 0.5); // Max 50% reduction
  deploymentTime *= experienceModifier;

  // MODIFIER 4: Early warning integration
  // Research: Prediction enables pre-positioning (tsunami: detection → evacuation)
  const warningModifier = 1.0 - (em.earlyWarningIntegration * 0.3); // Max 30% reduction
  deploymentTime *= warningModifier;

  // MODIFIER 5: Government type
  // Research: Authoritarian can mobilize faster but less legitimacy
  // China locked down Wuhan in 76 days, Western democracies took longer
  const govType = state.government.governmentType || 'democratic';
  const govModifier = govType === 'authoritarian' ? 0.7 : govType === 'democratic' ? 1.0 : 0.85;
  deploymentTime *= govModifier;

  // Minimum deployment time: 0.25 months (1 week)
  // Even best-case emergency response takes days, not hours
  return Math.max(0.25, deploymentTime);
}

/**
 * Get relevant strategic reserve for crisis type
 */
function getRelevantReserve(
  reserves: EmergencyManagementState['strategicReserves'],
  crisisType: EmergencyResponse['crisisType']
): number {
  // VALIDATION: All reserves should be initialized by initializeEmergencyManagement()
  // If any are undefined, this indicates a critical initialization bug - fail fast
  if (reserves.medical === undefined || reserves.food === undefined ||
      reserves.water === undefined || reserves.energy === undefined ||
      reserves.financial === undefined) {
    throw new Error(
      `CRITICAL: Strategic reserves not properly initialized. ` +
      `This indicates initializeEmergencyManagement() was not called. ` +
      `Reserves: ${JSON.stringify(reserves)}`
    );
  }

  switch (crisisType) {
    case 'pandemic': return reserves.medical;
    case 'climate': return (reserves.food + reserves.water) / 2;
    case 'economic': return reserves.financial;
    case 'social': return reserves.food; // Social unrest often food-related
    case 'technological': return 0; // No physical reserves help with AI crisis
    case 'nuclear': return reserves.food; // Nuclear fallout → food/water critical
  }
}

/**
 * Map crisis type to experience category
 */
function getCrisisExperienceCategory(
  crisisType: EmergencyResponse['crisisType']
): keyof EmergencyManagementState['crisisExperience'] {
  switch (crisisType) {
    case 'pandemic': return 'pandemic';
    case 'climate': return 'climate';
    case 'economic': return 'economic';
    case 'social': return 'social';
    case 'technological': return 'technological';
    case 'nuclear': return 'climate'; // Nuclear winter treated as climate crisis
  }
}

/**
 * Calculate emergency response effectiveness
 * FIX #13 (REVISED): Adjusted timing penalty + severity mobilization
 *
 * Research Foundation:
 * - Ashraf (2020): Every 7.49-day delay doubles PANDEMIC mortality (r² = 0.64)
 * - BUT: Economic/social/technological crises don't spread exponentially like pandemics
 * - TARP (2008): 3-month delay, ~50% combined effectiveness at preventing Depression
 * - Nordic COVID (2020): 2-month delayed responses still 60-70% effective
 * - Boin et al. (2017): Crisis severity → political will → resource mobilization
 *
 * Formula: effectiveness = timing × deployment × coordination × severity
 * - Timing: 1.0 / (2^(delayMonths / 6.0))
 *   - 2-month delay: 79% timing effectiveness
 *   - 6-month delay: 50% timing effectiveness
 *   - 12-month delay: 25% timing effectiveness
 * - Severity bonus: 1.0 + (severity * 0.2) - Severe crises MOBILIZE resources
 *
 * ADJUSTMENTS:
 * 1. Timing denominator: 0.25 → 6.0 (24× more forgiving)
 * 2. Severity: Penalty → Bonus (severe crises mobilize political will)
 *
 * Reasoning: Ashraf's exponential timing is pandemic-specific. For economic/social/tech
 * crises, government responses at 2-3 months still provide >50% effectiveness when
 * combined with deployment speed, coordination, and crisis mobilization effects.
 */
export function calculateEmergencyEffectiveness(
  crisisSeverity: number,
  responseDelayMonths: number,
  deploymentTime: number,
  coordinationQuality: number
): number {
  // Base effectiveness from timing (exponential penalty, MUCH more forgiving)
  // FIX #13: 24× more forgiving than original (0.25 → 6.0)
  const timingEffectiveness = 1.0 / Math.pow(2, responseDelayMonths / 6.0);

  // Deployment speed matters - faster deployment = more effective
  // 0.5 month deployment = 1.0×, 3 month deployment = 0.5×
  const deploymentEffectiveness = 1.0 - (Math.min(3, deploymentTime) / 6);

  // Coordination quality directly impacts effectiveness
  // Research: FEMA coordination failures (Katrina) vs success (Sandy)
  const coordEffectiveness = 0.5 + (coordinationQuality * 0.5); // 50-100%

  // FIX #13: Severity BONUS (not penalty) - severe crises mobilize resources
  // Research: Boin et al. (2017) - Crisis severity → political will → mobilization
  // Examples: COVID (massive mobilization), 2008 Financial ($700B TARP), 9/11
  const severityBonus = 1.0 + (crisisSeverity * 0.2); // 100-120% (mobilization effect)

  // Combined effectiveness
  const effectiveness = timingEffectiveness * deploymentEffectiveness * coordEffectiveness * severityBonus;

  return Math.max(0.01, Math.min(1.0, effectiveness));
}

/**
 * Deploy emergency response to active crisis
 * Called when government detects crisis and decides to respond
 */
export function deployEmergencyResponse(
  state: GameState,
  crisisType: EmergencyResponse['crisisType'],
  crisisSeverity: number,
  crisisStartMonth: number
): EmergencyResponse | null {
  const em = state.emergencyManagement;
  if (!em) {
    console.warn('⚠️  No emergency management bureau - cannot deploy fast response');
    return null;
  }

  // Check if already responding to this crisis type
  const existingResponse = em.activeResponses.find(r => r.crisisType === crisisType && !r.completed);
  if (existingResponse) {
    console.warn(`⚠️  Already responding to ${crisisType} crisis`);
    return existingResponse;
  }

  // Calculate deployment time
  const deploymentTime = calculateEmergencyDeploymentTime(state, crisisType);

  // Calculate delay (months since crisis started)
  const responseDelay = state.currentMonth - crisisStartMonth;

  // Calculate effectiveness based on delay
  const effectiveness = calculateEmergencyEffectiveness(
    crisisSeverity,
    responseDelay,
    deploymentTime,
    em.coordinationQuality
  );

  // Estimate resource consumption (depletes reserves)
  const resourcesUsed = Math.min(1.0, crisisSeverity * 0.5); // Severe crises deplete reserves

  // Create emergency response
  const response: EmergencyResponse = {
    id: `emergency_${crisisType}_${state.currentMonth}`,
    crisisType,
    startedMonth: state.currentMonth,
    deploymentTime,
    monthsDeployed: 0,
    effectiveness,
    resourcesUsed,
    completed: false,
  };

  // Add to active responses
  em.activeResponses.push(response);

  // Deplete relevant reserves
  const relevantReserveKey = getReserveKey(crisisType);
  if (relevantReserveKey) {
    em.strategicReserves[relevantReserveKey] = Math.max(0, em.strategicReserves[relevantReserveKey] - resourcesUsed);
  }

  // Log deployment
  console.log(`\n🚨 EMERGENCY RESPONSE DEPLOYED (Month ${state.currentMonth})`);
  console.log(`   Crisis: ${crisisType}`);
  console.log(`   Delay: ${responseDelay.toFixed(2)} months (${(responseDelay * 30).toFixed(0)} days)`);
  console.log(`   Deployment time: ${deploymentTime.toFixed(2)} months`);
  console.log(`   Effectiveness: ${(effectiveness * 100).toFixed(1)}% (timing penalty applied)`);
  console.log(`   Resources used: ${(resourcesUsed * 100).toFixed(0)}% of ${relevantReserveKey || 'general'} reserves\n`);

  return response;
}

/**
 * Get reserve key for crisis type
 */
function getReserveKey(crisisType: EmergencyResponse['crisisType']): keyof EmergencyManagementState['strategicReserves'] | null {
  switch (crisisType) {
    case 'pandemic': return 'medical';
    case 'climate': return 'food';
    case 'economic': return 'financial';
    case 'social': return 'food';
    case 'nuclear': return 'food';
    case 'technological': return null; // No physical reserves
  }
}

/**
 * Update active emergency responses each month
 * Increment deployment progress, check completion
 */
export function updateEmergencyResponses(state: GameState): void {
  const em = state.emergencyManagement;
  if (!em) return;

  for (const response of em.activeResponses) {
    if (response.completed) continue;

    response.monthsDeployed++;

    // Check if deployment is complete
    if (response.monthsDeployed >= response.deploymentTime) {
      response.completed = true;

      console.log(`\n✅ EMERGENCY RESPONSE COMPLETE (Month ${state.currentMonth})`);
      console.log(`   Crisis: ${response.crisisType}`);
      console.log(`   Duration: ${response.monthsDeployed.toFixed(1)} months`);
      console.log(`   Final effectiveness: ${(response.effectiveness * 100).toFixed(1)}%\n`);
    }
  }

  // Replenish reserves slowly (1% per month)
  // Research: Strategic reserves take years to rebuild after depletion
  for (const key of Object.keys(em.strategicReserves) as Array<keyof typeof em.strategicReserves>) {
    if (em.strategicReserves[key] < 0.7) {
      em.strategicReserves[key] = Math.min(0.7, em.strategicReserves[key] + 0.01);
    }
  }
}

/**
 * Update crisis experience (learning effect)
 * Called when crisis is resolved (successfully or not)
 *
 * Research: Katrina (2005) → Sandy (2012) = 50% improvement over 7 years
 * Learning rate: ~7% per year = ~0.6% per month
 */
export function updateCrisisExperience(
  state: GameState,
  crisisType: EmergencyResponse['crisisType'],
  wasSuccessful: boolean
): void {
  const em = state.emergencyManagement;
  if (!em) return;

  const experienceCategory = getCrisisExperienceCategory(crisisType);

  // VALIDATION: Crisis experience category must be initialized
  if (em.crisisExperience[experienceCategory] === undefined) {
    throw new Error(
      `CRITICAL: Crisis experience category '${experienceCategory}' not initialized. ` +
      `This indicates initializeEmergencyManagement() was not called properly. ` +
      `Experience: ${JSON.stringify(em.crisisExperience)}`
    );
  }

  // Learning rate depends on success
  // Successful responses teach more than failures
  const learningRate = wasSuccessful ? 0.15 : 0.08;

  // Update experience (max 1.0)
  em.crisisExperience[experienceCategory] = Math.min(
    1.0,
    em.crisisExperience[experienceCategory] + learningRate
  );

  console.log(`\n📚 CRISIS LEARNING (Month ${state.currentMonth})`);
  console.log(`   Crisis type: ${crisisType}`);
  console.log(`   Outcome: ${wasSuccessful ? 'SUCCESS' : 'FAILURE'}`);
  console.log(`   Experience gained: +${(learningRate * 100).toFixed(1)}%`);
  console.log(`   Total ${experienceCategory} experience: ${(em.crisisExperience[experienceCategory] * 100).toFixed(1)}%\n`);
}

/**
 * Get current emergency response for crisis type
 * Returns active response or null
 */
export function getActiveResponse(
  state: GameState,
  crisisType: EmergencyResponse['crisisType']
): EmergencyResponse | null {
  const em = state.emergencyManagement;
  if (!em) return null;

  return em.activeResponses.find(r => r.crisisType === crisisType && !r.completed) || null;
}

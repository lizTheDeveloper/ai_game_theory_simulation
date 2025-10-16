/**
 * Triggered Events System (P2.5 Empirical Validation)
 *
 * Allows external triggering of specific events (pandemics, economic crises)
 * for validation testing against historical data.
 *
 * Philosophy: These events are for VALIDATION ONLY. They allow us to prove
 * the simulation can reproduce known historical outcomes (COVID-19, 2008 crisis,
 * Black Death) with research-backed parameters.
 *
 * NOT for gameplay - these are test fixtures, not random events.
 */

import { GameState } from '@/types/game';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Base interface for all triggered events
 */
export interface TriggeredEvent {
  id: string;
  type: 'pandemic' | 'economic_crisis';
  startMonth: number;
  duration: number;
  active: boolean;
}

/**
 * Pandemic event parameters
 *
 * Models disease outbreaks with configurable mortality and economic impact.
 * Supports both modern pandemics (COVID-19) and historical ones (Black Death).
 */
export interface PandemicEventParams {
  startMonth: number;          // When pandemic begins
  duration: number;            // Months until mortality returns to baseline
  baselineMortality: number;   // Additional monthly mortality rate (0-1)
  peakMortality: number;       // Peak mortality during outbreak phase (0-1)
  affectedFraction: number;    // % of population exposed (0-1)
  economicImpact: number;      // Severity of economic disruption (0-1)
  techResilience: boolean;     // Whether tech sector is more resilient
  vaccineTimeline?: number;    // Months until vaccine available (optional)
}

/**
 * Pandemic event with phase tracking
 */
export interface PandemicEvent extends TriggeredEvent {
  type: 'pandemic';
  params: PandemicEventParams;
  phaseData: {
    currentPhase: 'outbreak' | 'peak' | 'decline' | 'recovery';
    monthsSinceStart: number;
    cumulativeDeaths: number;
    economicImpactApplied: boolean;
  };
}

/**
 * Economic crisis event parameters
 *
 * Models financial shocks with sector-specific organizational impacts.
 * Based on 2008 Financial Crisis research.
 */
export interface EconomicCrisisParams {
  startMonth: number;          // When crisis begins
  duration: number;            // Months until recovery complete
  severity: number;            // Crisis severity (0-1)
  organizationalImpact: {
    tech: number;              // Tech sector bankruptcy rate (0.05 = 5%)
    finance: number;           // Finance sector bankruptcy rate
    general: number;           // General sector bankruptcy rate
  };
  unemploymentSpike: number;   // Peak unemployment increase
  wealthInequalityIncrease: number; // Gini coefficient increase
  governmentResponse: boolean; // Whether government intervenes with bailouts
}

/**
 * Economic crisis event with phase tracking
 */
export interface EconomicCrisisEvent extends TriggeredEvent {
  type: 'economic_crisis';
  params: EconomicCrisisParams;
  phaseData: {
    currentPhase: 'shock' | 'crisis' | 'stabilization' | 'recovery';
    monthsSinceStart: number;
    bankruptcyWaveComplete: boolean;
    peakUnemployment: number;
  };
}

/**
 * Container for all triggered events in game state
 */
export interface TriggeredEventsState {
  activeEvents: TriggeredEvent[];
  completedEvents: TriggeredEvent[];
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize triggered events state
 */
export function initializeTriggeredEvents(): TriggeredEventsState {
  return {
    activeEvents: [],
    completedEvents: []
  };
}

// ============================================================================
// PANDEMIC EVENTS
// ============================================================================

/**
 * Trigger a pandemic event
 *
 * @param state - Game state
 * @param params - Pandemic parameters
 *
 * Example usage (COVID-19):
 * ```
 * triggerPandemic(state, {
 *   startMonth: 3,
 *   duration: 36,
 *   baselineMortality: 0.001,
 *   peakMortality: 0.0025,
 *   affectedFraction: 1.0,
 *   economicImpact: 0.4,
 *   techResilience: true,
 *   vaccineTimeline: 12
 * });
 * ```
 */
export function triggerPandemic(
  state: GameState,
  params: PandemicEventParams
): void {
  // Initialize triggered events state if needed
  if (!state.triggeredEvents) {
    state.triggeredEvents = initializeTriggeredEvents();
  }

  const event: PandemicEvent = {
    id: `pandemic_${Date.now()}`,
    type: 'pandemic',
    startMonth: params.startMonth,
    duration: params.duration,
    active: false, // Will activate when currentMonth reaches startMonth
    params,
    phaseData: {
      currentPhase: 'outbreak',
      monthsSinceStart: 0,
      cumulativeDeaths: 0,
      economicImpactApplied: false
    }
  };

  state.triggeredEvents.activeEvents.push(event);

  console.log(`\n📋 PANDEMIC EVENT SCHEDULED (Month ${params.startMonth})`);
  console.log(`   Duration: ${params.duration} months`);
  console.log(`   Mortality: ${(params.baselineMortality * 100).toFixed(2)}% baseline, ${(params.peakMortality * 100).toFixed(2)}% peak`);
  console.log(`   Affected: ${(params.affectedFraction * 100).toFixed(0)}% of population`);
  console.log(`   Economic impact: ${(params.economicImpact * 100).toFixed(0)}%`);
  if (params.vaccineTimeline) {
    console.log(`   Vaccine timeline: ${params.vaccineTimeline} months`);
  }
  console.log('');
}

/**
 * Process active pandemic event
 *
 * Handles phase transitions and applies mortality + economic impacts.
 */
function processPandemicEvent(
  state: GameState,
  event: PandemicEvent
): void {
  const { params, phaseData } = event;
  phaseData.monthsSinceStart = state.currentMonth - event.startMonth;
  const progress = phaseData.monthsSinceStart / params.duration;

  // === PHASE TRANSITIONS ===
  if (progress < 0.2) {
    phaseData.currentPhase = 'outbreak';
  } else if (progress < 0.4) {
    phaseData.currentPhase = 'peak';
  } else if (progress < 0.8) {
    phaseData.currentPhase = 'decline';
  } else {
    phaseData.currentPhase = 'recovery';
  }

  // === MORTALITY CALCULATION ===
  // Mortality follows a curve: outbreak → peak → decline → recovery
  let currentMortality = params.baselineMortality;

  switch (phaseData.currentPhase) {
    case 'outbreak':
      // Ramping up from baseline to peak
      const outbreakProgress = progress / 0.2; // 0-1 within outbreak phase
      currentMortality = params.baselineMortality +
        (params.peakMortality - params.baselineMortality) * outbreakProgress;
      break;

    case 'peak':
      // Maximum mortality
      currentMortality = params.peakMortality;
      break;

    case 'decline':
      // Declining from peak to baseline
      const declineProgress = (progress - 0.4) / 0.4; // 0-1 within decline phase
      currentMortality = params.peakMortality -
        (params.peakMortality - params.baselineMortality) * declineProgress;
      break;

    case 'recovery':
      // Vaccine effect (if applicable)
      if (params.vaccineTimeline && phaseData.monthsSinceStart >= params.vaccineTimeline) {
        const vaccineProgress = (phaseData.monthsSinceStart - params.vaccineTimeline) /
                                (params.duration - params.vaccineTimeline);
        currentMortality = params.baselineMortality * (1 - vaccineProgress * 0.9); // 90% reduction
      } else {
        currentMortality = params.baselineMortality;
      }
      break;
  }

  // Apply mortality
  const { addAcuteCrisisDeaths } = require('./populationDynamics');
  const deathsThisMonth = state.humanPopulationSystem.population *
                          currentMortality *
                          params.affectedFraction;

  addAcuteCrisisDeaths(
    state,
    currentMortality,
    `Pandemic - ${phaseData.currentPhase} phase`,
    params.affectedFraction,
    'disease'
  );

  phaseData.cumulativeDeaths += deathsThisMonth;

  // === ECONOMIC IMPACTS (applied once) ===
  if (!phaseData.economicImpactApplied && phaseData.currentPhase === 'peak') {
    applyPandemicEconomicImpact(state, params);
    phaseData.economicImpactApplied = true;
  }

  // === TECH SECTOR BOOST (modern pandemics only) ===
  if (params.techResilience && phaseData.currentPhase === 'peak') {
    // Tech companies thrive during pandemic (remote work, cloud, e-commerce)
    const techOrgs = state.organizations.filter(org =>
      org.name.toLowerCase().includes('tech') ||
      org.name.toLowerCase().includes('google') ||
      org.name.toLowerCase().includes('amazon') ||
      org.name.toLowerCase().includes('microsoft')
    );

    techOrgs.forEach(org => {
      org.monthlyRevenue *= 1.02; // +2% per month during peak (compounds to +20-40% over year)
      org.capital *= 1.01; // Profit accumulation
    });
  }

  // === LOGGING ===
  if (phaseData.monthsSinceStart % 6 === 0) { // Log every 6 months
    console.log(`\n🦠 PANDEMIC (Month ${state.currentMonth}): ${phaseData.currentPhase.toUpperCase()} PHASE`);
    console.log(`   Progress: ${(progress * 100).toFixed(1)}% (${phaseData.monthsSinceStart}/${params.duration} months)`);
    console.log(`   Current mortality: ${(currentMortality * 100).toFixed(3)}%/month`);
    console.log(`   Cumulative deaths: ${(phaseData.cumulativeDeaths / 1_000_000).toFixed(2)}M`);
    console.log(`   Population: ${(state.humanPopulationSystem.population / 1_000_000_000).toFixed(2)}B`);
    console.log('');
  }

  // === COMPLETION ===
  if (progress >= 1.0) {
    event.active = false;
    console.log(`\n✅ PANDEMIC COMPLETED (Month ${state.currentMonth})`);
    console.log(`   Total deaths: ${(phaseData.cumulativeDeaths / 1_000_000).toFixed(2)}M`);
    console.log(`   Mortality rate: ${(phaseData.cumulativeDeaths / (state.humanPopulationSystem.population + phaseData.cumulativeDeaths) * 100).toFixed(3)}%`);
    console.log('');
  }
}

/**
 * Apply pandemic economic impacts
 */
function applyPandemicEconomicImpact(
  state: GameState,
  params: PandemicEventParams
): void {
  // Unemployment spike (temporary)
  const unemploymentIncrease = 0.05 * params.economicImpact; // Up to 5% increase
  state.society.unemploymentLevel = Math.min(0.9,
    state.society.unemploymentLevel + unemploymentIncrease
  );

  // Social stability hit
  state.globalMetrics.socialStability = Math.max(0.2,
    state.globalMetrics.socialStability - 0.1 * params.economicImpact
  );

  // QoL impacts (temporary)
  state.qualityOfLifeSystems.materialAbundance *= (1 - 0.1 * params.economicImpact);
  state.qualityOfLifeSystems.socialConnection *= (1 - 0.2 * params.economicImpact);
  state.qualityOfLifeSystems.mentalHealth *= (1 - 0.15 * params.economicImpact);

  console.log(`\n💰 PANDEMIC ECONOMIC IMPACT APPLIED`);
  console.log(`   Unemployment: +${(unemploymentIncrease * 100).toFixed(1)}%`);
  console.log(`   Social stability: -${(0.1 * params.economicImpact).toFixed(2)}`);
  console.log('');
}

// ============================================================================
// ECONOMIC CRISIS EVENTS
// ============================================================================

/**
 * Trigger an economic crisis event
 *
 * @param state - Game state
 * @param params - Economic crisis parameters
 *
 * Example usage (2008 Financial Crisis):
 * ```
 * triggerEconomicCrisis(state, {
 *   startMonth: 9,
 *   duration: 48,
 *   severity: 0.7,
 *   organizationalImpact: {
 *     tech: 0.05,
 *     finance: 0.30,
 *     general: 0.15
 *   },
 *   unemploymentSpike: 0.05,
 *   wealthInequalityIncrease: 0.04,
 *   governmentResponse: true
 * });
 * ```
 */
export function triggerEconomicCrisis(
  state: GameState,
  params: EconomicCrisisParams
): void {
  // Initialize triggered events state if needed
  if (!state.triggeredEvents) {
    state.triggeredEvents = initializeTriggeredEvents();
  }

  const event: EconomicCrisisEvent = {
    id: `economic_crisis_${Date.now()}`,
    type: 'economic_crisis',
    startMonth: params.startMonth,
    duration: params.duration,
    active: false,
    params,
    phaseData: {
      currentPhase: 'shock',
      monthsSinceStart: 0,
      bankruptcyWaveComplete: false,
      peakUnemployment: 0
    }
  };

  state.triggeredEvents.activeEvents.push(event);

  console.log(`\n📉 ECONOMIC CRISIS EVENT SCHEDULED (Month ${params.startMonth})`);
  console.log(`   Duration: ${params.duration} months`);
  console.log(`   Severity: ${(params.severity * 100).toFixed(0)}%`);
  console.log(`   Bankruptcy rates: Tech ${(params.organizationalImpact.tech * 100).toFixed(0)}%, Finance ${(params.organizationalImpact.finance * 100).toFixed(0)}%, General ${(params.organizationalImpact.general * 100).toFixed(0)}%`);
  console.log(`   Unemployment spike: +${(params.unemploymentSpike * 100).toFixed(1)}%`);
  console.log(`   Government response: ${params.governmentResponse ? 'YES (bailouts)' : 'NO'}`);
  console.log('');
}

/**
 * Process active economic crisis event
 *
 * Handles phase transitions and applies organizational/economic impacts.
 */
function processEconomicCrisisEvent(
  state: GameState,
  event: EconomicCrisisEvent
): void {
  const { params, phaseData } = event;
  phaseData.monthsSinceStart = state.currentMonth - event.startMonth;
  const progress = phaseData.monthsSinceStart / params.duration;

  // === PHASE TRANSITIONS ===
  if (progress < 0.1) {
    phaseData.currentPhase = 'shock';
  } else if (progress < 0.4) {
    phaseData.currentPhase = 'crisis';
  } else if (progress < 0.7) {
    phaseData.currentPhase = 'stabilization';
  } else {
    phaseData.currentPhase = 'recovery';
  }

  // === BANKRUPTCY WAVE (applied once) ===
  if (!phaseData.bankruptcyWaveComplete && phaseData.currentPhase === 'crisis') {
    applyEconomicCrisisBankruptcies(state, params);
    phaseData.bankruptcyWaveComplete = true;
  }

  // === UNEMPLOYMENT DYNAMICS ===
  const unemploymentCurve = calculateUnemploymentCurve(progress);
  const currentUnemployment = state.society.unemploymentLevel +
                              (params.unemploymentSpike * unemploymentCurve);
  state.society.unemploymentLevel = Math.min(0.9, currentUnemployment);
  phaseData.peakUnemployment = Math.max(phaseData.peakUnemployment, currentUnemployment);

  // === WEALTH INEQUALITY ===
  // Top 1% recovers faster, bottom 50% slower
  if (phaseData.currentPhase === 'crisis' || phaseData.currentPhase === 'stabilization') {
    state.globalMetrics.wealthDistribution = Math.max(0.3,
      state.globalMetrics.wealthDistribution - params.wealthInequalityIncrease * 0.01
    );
  }

  // === SOCIAL STABILITY ===
  const stabilityImpact = params.severity * (1 - progress) * 0.005;
  state.globalMetrics.socialStability = Math.max(0.3,
    state.globalMetrics.socialStability - stabilityImpact
  );

  // === GOVERNMENT RESPONSE ===
  if (params.governmentResponse && phaseData.currentPhase === 'crisis') {
    // Bailouts, stimulus, etc.
    state.government.alignmentResearchInvestment = Math.min(10,
      state.government.alignmentResearchInvestment + 1
    );

    // Prevent additional org bankruptcies (bailout effect)
    state.organizations.forEach(org => {
      if (!org.bankrupt && org.capital < 0) {
        org.capital *= 0.8; // Government support reduces losses
      }
    });
  }

  // === LOGGING ===
  if (phaseData.monthsSinceStart % 12 === 0 || phaseData.monthsSinceStart === 1) {
    console.log(`\n📉 ECONOMIC CRISIS (Month ${state.currentMonth}): ${phaseData.currentPhase.toUpperCase()} PHASE`);
    console.log(`   Progress: ${(progress * 100).toFixed(1)}% (${phaseData.monthsSinceStart}/${params.duration} months)`);
    console.log(`   Unemployment: ${(currentUnemployment * 100).toFixed(1)}%`);
    console.log(`   Wealth distribution: ${state.globalMetrics.wealthDistribution.toFixed(3)}`);
    console.log(`   Organizations: ${state.organizations.filter(o => !o.bankrupt).length}/${state.organizations.length} active`);
    console.log('');
  }

  // === COMPLETION ===
  if (progress >= 1.0) {
    event.active = false;
    console.log(`\n✅ ECONOMIC CRISIS RESOLVED (Month ${state.currentMonth})`);
    console.log(`   Peak unemployment: ${(phaseData.peakUnemployment * 100).toFixed(1)}%`);
    console.log(`   Organizations survived: ${state.organizations.filter(o => !o.bankrupt).length}/${state.organizations.length}`);
    console.log('');
  }
}

/**
 * Calculate unemployment curve during economic crisis
 *
 * Unemployment spikes quickly, plateaus, then gradually recovers.
 */
function calculateUnemploymentCurve(progress: number): number {
  if (progress < 0.2) {
    // Rapid spike (0-20% of crisis)
    return progress / 0.2; // 0 → 1
  } else if (progress < 0.6) {
    // Plateau (20-60% of crisis)
    return 1.0;
  } else {
    // Gradual recovery (60-100% of crisis)
    return 1 - ((progress - 0.6) / 0.4); // 1 → 0
  }
}

/**
 * Apply sector-specific organizational bankruptcies
 *
 * CRITICAL FIX: Current simulation shows 100% bankruptcy.
 * This function implements realistic sector-based bankruptcy rates.
 */
function applyEconomicCrisisBankruptcies(
  state: GameState,
  params: EconomicCrisisParams
): void {
  let techBankrupt = 0;
  let financeBankrupt = 0;
  let generalBankrupt = 0;

  state.organizations.forEach(org => {
    if (org.bankrupt) return; // Already bankrupt

    // Determine sector
    let bankruptcyRate = params.organizationalImpact.general;
    let sector = 'general';

    const name = org.name.toLowerCase();
    if (name.includes('tech') || name.includes('google') || name.includes('amazon') ||
        name.includes('microsoft') || name.includes('anthropic') || name.includes('openai')) {
      bankruptcyRate = params.organizationalImpact.tech;
      sector = 'tech';
    } else if (name.includes('bank') || name.includes('finance') || name.includes('capital')) {
      bankruptcyRate = params.organizationalImpact.finance;
      sector = 'finance';
    }

    // Apply bailout effect
    if (params.governmentResponse) {
      bankruptcyRate *= 0.6; // 40% reduction with bailouts
    }

    // Roll for bankruptcy
    // P2.4 FIX: This should use RNG, but requires refactoring to pass RNG through
    // For now, keeping Math.random() as this is only used in validation scenarios
    // TODO P2.4: Pass RNG through applyEconomicCrisisBankruptcies
    if (Math.random() < bankruptcyRate) {
      org.bankrupt = true;
      org.bankruptcyMonth = state.currentMonth;
      org.bankruptcyReason = `Economic crisis bankruptcy`;

      if (sector === 'tech') techBankrupt++;
      else if (sector === 'finance') financeBankrupt++;
      else generalBankrupt++;
    } else {
      // Survivors suffer capital loss
      org.capital *= (1 - params.severity * 0.3); // 30% loss at max severity
    }
  });

  console.log(`\n💸 BANKRUPTCY WAVE (Month ${state.currentMonth})`);
  console.log(`   Tech sector: ${techBankrupt} bankruptcies`);
  console.log(`   Finance sector: ${financeBankrupt} bankruptcies`);
  console.log(`   General sector: ${generalBankrupt} bankruptcies`);
  console.log(`   Total: ${techBankrupt + financeBankrupt + generalBankrupt}/${state.organizations.length}`);
  console.log(`   Survival rate: ${((1 - (techBankrupt + financeBankrupt + generalBankrupt) / state.organizations.length) * 100).toFixed(1)}%`);
  console.log('');
}

// ============================================================================
// UPDATE LOOP
// ============================================================================

/**
 * Update all active triggered events
 *
 * Called each month by TriggeredEventsPhase.
 */
export function updateTriggeredEvents(state: GameState): void {
  if (!state.triggeredEvents) {
    return; // No triggered events
  }

  // Activate events that have reached their start month
  state.triggeredEvents.activeEvents.forEach(event => {
    if (!event.active && state.currentMonth >= event.startMonth) {
      event.active = true;
      console.log(`\n🚨 EVENT TRIGGERED: ${event.type} (Month ${state.currentMonth})`);
    }
  });

  // Process active events
  state.triggeredEvents.activeEvents.forEach(event => {
    if (!event.active) return;

    if (event.type === 'pandemic') {
      processPandemicEvent(state, event as PandemicEvent);
    } else if (event.type === 'economic_crisis') {
      processEconomicCrisisEvent(state, event as EconomicCrisisEvent);
    }
  });

  // Move completed events to history
  const completed = state.triggeredEvents.activeEvents.filter(e => !e.active);
  completed.forEach(event => {
    state.triggeredEvents!.completedEvents.push(event);
  });
  state.triggeredEvents.activeEvents = state.triggeredEvents.activeEvents.filter(e => e.active);
}

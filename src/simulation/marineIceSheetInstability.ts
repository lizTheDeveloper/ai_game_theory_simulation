/**
 * Marine Ice Sheet Instability (MICI) System
 *
 * Implements abrupt sea level rise pulses from ice sheet collapse.
 * Integrates with existing tipping point system (WAIS, Greenland).
 *
 * Research Foundation:
 * - DeConto & Pollard (2021) Nature - Revised MICI projections
 * - Morlighem et al. (2024) Science Advances - 21st century MICI reassessment
 * - Armstrong McKay et al. (2022) Science - Tipping point thresholds
 * - M-4 MICI validation (Dec 5, 2025) - Integration constraints
 *
 * CRITICAL INTEGRATION POINT:
 * This module ENHANCES existing WAIS/Greenland tipping elements in
 * src/types/tipping-points.ts. It does NOT create duplicate ice sheet tracking.
 *
 * Key Parameters (from validation report):
 * - WAIS threshold: 1.25°C (central estimate, not lower bound)
 * - Greenland threshold: 1.5°C (central estimate)
 * - Abrupt pulse: 0.5-1.5m (capped at 1.5m, not 3m from research)
 * - Displacement: 50-150 million per meter (range, not point estimate)
 */

import { GameState } from '@/types/game';
import { RNGFunction } from '@/types/game';
import {
  assertFinite,
  assertDefined,
  assertInRange,
  assertProbability,
  assertStateProperty
} from './utils/assertions';

/** MICI trigger thresholds (central estimates per validation) */
const MICI_THRESHOLDS = {
  // Temperature thresholds (°C above pre-industrial)
  WAIS_TEMP: 1.25,
  GREENLAND_TEMP: 1.5,

  // Ocean warming requirements for MICI (relative to baseline)
  OCEAN_WARMING_THRESHOLD: 0.5, // °C

  // Buttressing loss proxy: months since tipping point crossed
  BUTTRESSING_LOSS_MONTHS: 120, // 10 years

  // Maximum contributions (meters)
  WAIS_MAX: 3.5,
  GREENLAND_MAX: 7.4
} as const;

/** Abrupt pulse parameters (validated constraints) */
const ABRUPT_PULSE = {
  // Magnitude range per event (meters)
  MIN_MAGNITUDE: 0.5,
  MAX_MAGNITUDE: 1.5, // Capped per validation (not 3.0m)

  // Base probability per decade if conditions met
  // VALIDATION ADJUSTMENT: Reduced from 0.05 to 0.01 per Sylvia's critique
  // (2024 Morlighem et al. downgraded 21st century MICI catastrophe risk)
  BASE_PROBABILITY: 0.01, // 1% per decade

  // Amplification with extreme warming (>3°C)
  EXTREME_WARMING_THRESHOLD: 3.0,
  EXTREME_WARMING_MULTIPLIER: 2.0
} as const;

/** Coastal impact parameters (from research) */
const COASTAL_IMPACTS = {
  // Population displacement (millions per meter)
  DISPLACED_MIN: 50,
  DISPLACED_MAX: 150,

  // Infrastructure damage coefficients (trillion USD)
  // VALIDATION ADJUSTMENT: Added uncertainty ranges per Sylvia's critique
  // Research categorizes economic estimates as "Tier 3 (high uncertainty)"
  DAMAGE_LINEAR: { min: 2, median: 5, max: 8 },
  DAMAGE_QUADRATIC: { min: 1, median: 3, max: 5 },

  // Agricultural land vulnerability
  AG_LAND_MIN_FRACTION: 0.0065, // 0.65%
  AG_LAND_MAX_FRACTION: 0.2343, // 23.43%

  // Regional concentration
  ASIA_PACIFIC_FRACTION: 0.70
} as const;

/**
 * Check if MICI conditions are met for an ice sheet element
 *
 * Conditions (research-backed):
 * 1. Temperature exceeds threshold
 * 2. Ocean warming significant
 * 3. Ice shelf buttressing lost (proxy: tipping point crossed for X months)
 *
 * @param state - Game state
 * @param elementId - 'wais' or 'greenland'
 * @returns true if MICI can trigger
 */
export function checkMICIConditions(
  state: GameState,
  elementId: 'wais' | 'greenland'
): boolean {
  const system = state.tippingPointSystem;
  const element = system.elements.find(e => e.id === elementId);

  assertDefined(element, {
    location: 'checkMICIConditions',
    valueName: `element[${elementId}]`,
    month: state.currentMonth
  });

  if (!element) return false; // Type guard (assertDefined throws, but TS doesn't know)

  // Already in abrupt mode
  if (element.abruptMode) return false;

  // Must be triggered first
  if (!element.triggered) return false;

  // Check temperature threshold
  const temp = assertFinite(
    assertStateProperty(state.resourceEconomy.co2, 'temperatureAnomaly', {
      location: 'checkMICIConditions',
      month: state.currentMonth
    }),
    {
      location: 'checkMICIConditions',
      valueName: 'temperatureAnomaly',
      month: state.currentMonth
    }
  );
  const threshold = elementId === 'wais'
    ? MICI_THRESHOLDS.WAIS_TEMP
    : MICI_THRESHOLDS.GREENLAND_TEMP;

  if (temp < threshold) return false;

  // Check ocean warming (proxy via temperature)
  // TODO: Use actual ocean heat content when available
  const oceanWarming = (temp - 1.0) * 0.8; // Proxy: oceans warm slower than atmosphere
  if (oceanWarming < MICI_THRESHOLDS.OCEAN_WARMING_THRESHOLD) return false;

  // Check buttressing loss (time since trigger)
  if (element.monthsSinceTrigger < MICI_THRESHOLDS.BUTTRESSING_LOSS_MONTHS) {
    return false;
  }

  return true;
}

/**
 * Trigger abrupt MICI mode for an ice sheet
 *
 * @param state - Game state
 * @param elementId - 'wais' or 'greenland'
 */
export function triggerMICIAbruptMode(
  state: GameState,
  elementId: 'wais' | 'greenland'
): void {
  const system = state.tippingPointSystem;
  const element = system.elements.find(e => e.id === elementId);

  assertDefined(element, {
    location: 'triggerMICIAbruptMode',
    valueName: `element[${elementId}]`,
    month: state.currentMonth
  });

  if (!element) return; // Type guard

  element.abruptMode = true;
  element.accumulatedAbruptSLR = element.accumulatedAbruptSLR ?? 0;

  const temp = assertFinite(
    assertStateProperty(state.resourceEconomy.co2, 'temperatureAnomaly', {
      location: 'triggerMICIAbruptMode',
      month: state.currentMonth
    }),
    {
      location: 'triggerMICIAbruptMode',
      valueName: 'temperatureAnomaly',
      month: state.currentMonth
    }
  );

  console.log(
    `\n🌊🚨 MARINE ICE CLIFF INSTABILITY TRIGGERED: ${element.name}` +
    `\n  Month: ${state.currentMonth}` +
    `\n  Temperature: ${temp.toFixed(2)}°C` +
    `\n  Months since tipping: ${element.monthsSinceTrigger}`
  );
}

/**
 * Check for and potentially trigger abrupt SLR pulse
 *
 * Research: Low probability event (<10% per decade base)
 * Amplified by extreme warming (>3°C)
 *
 * @param state - Game state
 * @param elementId - 'wais' or 'greenland'
 * @param rng - Deterministic RNG function
 * @returns true if pulse occurred
 */
export function checkAbruptPulse(
  state: GameState,
  elementId: 'wais' | 'greenland',
  rng: RNGFunction
): boolean {
  if (!rng || typeof rng !== 'function') {
    throw new Error(
      `❌ CRITICAL: RNG required for deterministic MICI simulation ` +
      `(Month ${state.currentMonth})`
    );
  }

  const system = state.tippingPointSystem;
  const element = system.elements.find(e => e.id === elementId);

  assertDefined(element, {
    location: 'checkAbruptPulse',
    valueName: `element[${elementId}]`,
    month: state.currentMonth
  });

  if (!element) return false; // Type guard

  // Must be in abrupt mode
  if (!element.abruptMode) return false;

  // Check max contribution
  const maxContribution = elementId === 'wais'
    ? MICI_THRESHOLDS.WAIS_MAX
    : MICI_THRESHOLDS.GREENLAND_MAX;

  const currentContribution = element.accumulatedAbruptSLR ?? 0;
  if (currentContribution >= maxContribution) return false;

  // Calculate probability (per month)
  const temp = assertFinite(
    assertStateProperty(state.resourceEconomy.co2, 'temperatureAnomaly', {
      location: 'checkAbruptPulse',
      month: state.currentMonth
    }),
    {
      location: 'checkAbruptPulse',
      valueName: 'temperatureAnomaly',
      month: state.currentMonth
    }
  );
  let probability = ABRUPT_PULSE.BASE_PROBABILITY / 120; // Convert decade to months

  // Amplify for extreme warming
  if (temp > ABRUPT_PULSE.EXTREME_WARMING_THRESHOLD) {
    const excessWarming = temp - ABRUPT_PULSE.EXTREME_WARMING_THRESHOLD;
    probability *= (1 + excessWarming * ABRUPT_PULSE.EXTREME_WARMING_MULTIPLIER);
  }

  probability = assertProbability(probability, {
    location: 'checkAbruptPulse',
    valueName: 'abruptPulseProbability',
    month: state.currentMonth,
    additionalInfo: { temp, elementId }
  });

  return rng() < probability;
}

/**
 * Execute abrupt sea level rise pulse
 *
 * @param state - Game state
 * @param elementId - 'wais' or 'greenland'
 * @param rng - Deterministic RNG function
 */
export function executeAbruptPulse(
  state: GameState,
  elementId: 'wais' | 'greenland',
  rng: RNGFunction
): void {
  if (!rng || typeof rng !== 'function') {
    throw new Error(
      `❌ CRITICAL: RNG required for deterministic MICI pulse ` +
      `(Month ${state.currentMonth})`
    );
  }

  const system = state.tippingPointSystem;
  const element = system.elements.find(e => e.id === elementId);

  assertDefined(element, {
    location: 'executeAbruptPulse',
    valueName: `element[${elementId}]`,
    month: state.currentMonth
  });

  if (!element) return; // Type guard

  // Generate pulse magnitude (0.5-1.5m)
  const pulseMagnitude = assertFinite(
    ABRUPT_PULSE.MIN_MAGNITUDE +
    rng() * (ABRUPT_PULSE.MAX_MAGNITUDE - ABRUPT_PULSE.MIN_MAGNITUDE),
    {
      location: 'executeAbruptPulse',
      valueName: 'pulseMagnitude',
      month: state.currentMonth,
      additionalInfo: { elementId }
    }
  );

  // Cap at max contribution
  const maxContribution = elementId === 'wais'
    ? MICI_THRESHOLDS.WAIS_MAX
    : MICI_THRESHOLDS.GREENLAND_MAX;

  const currentContribution = element.accumulatedAbruptSLR ?? 0;
  const cappedMagnitude = Math.min(
    pulseMagnitude,
    maxContribution - currentContribution
  );

  // Update element state
  element.accumulatedAbruptSLR = currentContribution + cappedMagnitude;

  // Update global sea level rise
  system.cumulativeSeaLevelRise = assertFinite(
    system.cumulativeSeaLevelRise + cappedMagnitude,
    {
      location: 'executeAbruptPulse',
      valueName: 'cumulativeSeaLevelRise',
      month: state.currentMonth,
      additionalInfo: {
        previous: system.cumulativeSeaLevelRise,
        pulse: cappedMagnitude
      }
    }
  );

  console.log(
    `\n🌊💥 ABRUPT SEA LEVEL RISE PULSE: ${element.name}` +
    `\n  Magnitude: +${cappedMagnitude.toFixed(2)}m` +
    `\n  Cumulative (element): ${element.accumulatedAbruptSLR!.toFixed(2)}m` +
    `\n  Cumulative (global): ${system.cumulativeSeaLevelRise.toFixed(2)}m` +
    `\n  Month: ${state.currentMonth}`
  );

  // Update coastal impacts
  updateCoastalImpacts(state, rng);
}

/**
 * Update cumulative sea level rise from gradual ice sheet collapse
 * (called each step for triggered ice sheets)
 *
 * @param state - Game state
 */
export function updateGradualSeaLevelRise(state: GameState): void {
  const system = state.tippingPointSystem;

  // Collapse rates (meters/year) from research
  const COLLAPSE_RATES = {
    INITIAL: 0.002,      // 2mm/year (current Thwaites)
    RAPID_MISI: 0.003,   // 3mm/year (rapid phase)
    DEGLACIATION: 0.001  // 1mm/year (long-term)
  };

  const TIMESCALES = {
    ACCELERATION: 20,     // Years
    RAPID_DURATION: 200   // Years
  };

  let totalGradualRise = 0;

  for (const element of system.elements) {
    // Only ice sheets contribute to SLR
    if (element.id !== 'wais' && element.id !== 'greenland') continue;
    if (!element.triggered) continue;

    const yearsSinceTrigger = element.monthsSinceTrigger / 12;
    let rate: number;

    if (yearsSinceTrigger < TIMESCALES.ACCELERATION) {
      rate = COLLAPSE_RATES.INITIAL;
    } else if (yearsSinceTrigger < TIMESCALES.RAPID_DURATION) {
      rate = COLLAPSE_RATES.RAPID_MISI;
    } else {
      rate = COLLAPSE_RATES.DEGLACIATION;
    }

    // Monthly contribution
    const monthlyRise = rate / 12;

    // Cap at max contribution
    const maxContribution = element.id === 'wais'
      ? MICI_THRESHOLDS.WAIS_MAX
      : MICI_THRESHOLDS.GREENLAND_MAX;

    const abruptContribution = element.accumulatedAbruptSLR ?? 0;
    const gradualContribution = element.progress * maxContribution;
    const totalFromElement = abruptContribution + gradualContribution;

    if (totalFromElement < maxContribution) {
      totalGradualRise += Math.min(monthlyRise, maxContribution - totalFromElement);
    }
  }

  if (totalGradualRise > 0) {
    system.cumulativeSeaLevelRise = assertFinite(
      system.cumulativeSeaLevelRise + totalGradualRise,
      {
        location: 'updateGradualSeaLevelRise',
        valueName: 'cumulativeSeaLevelRise',
        month: state.currentMonth,
        additionalInfo: { monthlyRise: totalGradualRise }
      }
    );
  }
}

/**
 * Update coastal impact calculations
 *
 * Research:
 * - Displacement: 50-150 million per meter (range)
 * - Infrastructure damage: ~quadratic scaling
 * - Agricultural land: 0.65-23.43% vulnerable
 *
 * @param state - Game state
 * @param rng - Deterministic RNG function
 */
export function updateCoastalImpacts(state: GameState, rng: RNGFunction): void {
  if (!rng || typeof rng !== 'function') {
    throw new Error(
      `❌ CRITICAL: RNG required for coastal impact calculations ` +
      `(Month ${state.currentMonth})`
    );
  }

  const system = state.tippingPointSystem;
  const slr = system.cumulativeSeaLevelRise;

  // Population displacement (millions) - use range
  const displacedPerMeter = assertInRange(
    COASTAL_IMPACTS.DISPLACED_MIN +
    rng() * (COASTAL_IMPACTS.DISPLACED_MAX - COASTAL_IMPACTS.DISPLACED_MIN),
    COASTAL_IMPACTS.DISPLACED_MIN,
    COASTAL_IMPACTS.DISPLACED_MAX,
    {
      location: 'updateCoastalImpacts',
      valueName: 'displacedPerMeter',
      month: state.currentMonth
    }
  );

  system.coastalPopulationDisplaced = assertFinite(
    slr * displacedPerMeter,
    {
      location: 'updateCoastalImpacts',
      valueName: 'coastalPopulationDisplaced',
      month: state.currentMonth,
      additionalInfo: { slr, displacedPerMeter }
    }
  );

  // Infrastructure damage (quadratic scaling)
  // Sample from uncertainty ranges using triangular distribution (median-biased)
  const sampleFromRange = (range: { min: number; median: number; max: number }): number => {
    const u = rng();
    if (u < 0.5) {
      // Lower half: interpolate min → median
      return range.min + 2 * u * (range.median - range.min);
    } else {
      // Upper half: interpolate median → max
      return range.median + 2 * (u - 0.5) * (range.max - range.median);
    }
  };

  const linearCoeff = assertInRange(
    sampleFromRange(COASTAL_IMPACTS.DAMAGE_LINEAR),
    COASTAL_IMPACTS.DAMAGE_LINEAR.min,
    COASTAL_IMPACTS.DAMAGE_LINEAR.max,
    {
      location: 'updateCoastalImpacts',
      valueName: 'linearCoeff',
      month: state.currentMonth
    }
  );

  const quadraticCoeff = assertInRange(
    sampleFromRange(COASTAL_IMPACTS.DAMAGE_QUADRATIC),
    COASTAL_IMPACTS.DAMAGE_QUADRATIC.min,
    COASTAL_IMPACTS.DAMAGE_QUADRATIC.max,
    {
      location: 'updateCoastalImpacts',
      valueName: 'quadraticCoeff',
      month: state.currentMonth
    }
  );

  system.coastalInfrastructureDamage = assertFinite(
    linearCoeff * slr + quadraticCoeff * slr * slr,
    {
      location: 'updateCoastalImpacts',
      valueName: 'coastalInfrastructureDamage',
      month: state.currentMonth,
      additionalInfo: { slr, linearCoeff, quadraticCoeff }
    }
  );

  // Agricultural land loss (interpolate from vulnerability range)
  // Linear interpolation: 0m → 0.65%, 5m → 23.43%
  const fraction = assertInRange(
    COASTAL_IMPACTS.AG_LAND_MIN_FRACTION +
    (slr / 5.0) * (COASTAL_IMPACTS.AG_LAND_MAX_FRACTION - COASTAL_IMPACTS.AG_LAND_MIN_FRACTION),
    0,
    COASTAL_IMPACTS.AG_LAND_MAX_FRACTION,
    {
      location: 'updateCoastalImpacts',
      valueName: 'agLandFraction',
      month: state.currentMonth,
      additionalInfo: { slr }
    }
  );

  // Total global agricultural land (approximate, will get from state when available)
  const GLOBAL_AG_LAND = 5000; // Million hectares (FAO estimate)

  system.agriculturalLandLost = assertFinite(
    GLOBAL_AG_LAND * fraction,
    {
      location: 'updateCoastalImpacts',
      valueName: 'agriculturalLandLost',
      month: state.currentMonth,
      additionalInfo: { fraction, slr }
    }
  );
}

/**
 * Update MICI system each simulation step
 * (Called from ClimateSystemPhase)
 *
 * @param state - Game state
 * @param rng - Deterministic RNG function
 */
export function updateMICI(state: GameState, rng: RNGFunction): void {
  if (!rng || typeof rng !== 'function') {
    throw new Error(
      `❌ CRITICAL: RNG required for deterministic MICI simulation ` +
      `(Month ${state.currentMonth})`
    );
  }

  // Check MICI conditions for each ice sheet
  for (const elementId of ['wais', 'greenland'] as const) {
    const element = state.tippingPointSystem.elements.find(e => e.id === elementId);
    if (!element) continue;

    // Trigger abrupt mode if conditions met
    if (!element.abruptMode && checkMICIConditions(state, elementId)) {
      triggerMICIAbruptMode(state, elementId);
    }

    // Check for abrupt pulses
    if (element.abruptMode && checkAbruptPulse(state, elementId, rng)) {
      executeAbruptPulse(state, elementId, rng);
    }
  }

  // Update gradual sea level rise
  updateGradualSeaLevelRise(state);

  // Update coastal impacts (if SLR changed)
  if (state.tippingPointSystem.cumulativeSeaLevelRise > 0) {
    updateCoastalImpacts(state, rng);
  }
}

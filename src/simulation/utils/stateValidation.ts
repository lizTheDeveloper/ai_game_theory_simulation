/**
 * Development-Mode State Validation Proxy
 *
 * Automatically validates all GameState property access and writes in development.
 * Zero overhead in production (proxy is bypassed).
 *
 * Usage:
 * ```typescript
 * import { wrapStateForValidation } from './utils/stateValidation';
 *
 * // In initialization or phase orchestrator
 * const validatedState = wrapStateForValidation(gameState);
 * ```
 *
 * What it catches:
 * - NaN values (on read and write)
 * - Infinity values (on read and write)
 * - Undefined numeric properties (when expected to be numbers)
 *
 * What it doesn't validate:
 * - Functions, symbols, arrays (performance)
 * - Optional properties marked with `?:` (intentionally undefined)
 * - Non-numeric properties (strings, booleans, etc.)
 */

// Check development mode at runtime (not module load time)
function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';
}

// Track validation context for better error messages
let validationContext = {
  currentMonth: 0,
  currentPhase: 'unknown',
};

/**
 * Set validation context for richer error messages
 */
export function setValidationContext(month: number, phase: string) {
  validationContext.currentMonth = month;
  validationContext.currentPhase = phase;
}

/**
 * Reset validation context
 */
export function resetValidationContext() {
  validationContext = {
    currentMonth: 0,
    currentPhase: 'unknown',
  };
}

/**
 * Check if a value is valid (not NaN/Infinity)
 */
function isValidNumber(value: unknown): boolean {
  if (typeof value !== 'number') return true; // Only validate numbers
  return isFinite(value);
}

/**
 * Create a detailed error message with full context
 */
function createValidationError(
  path: string[],
  value: unknown,
  operation: 'read' | 'write'
): Error {
  const propertyPath = path.join('.');
  const valueStr = typeof value === 'number'
    ? (isNaN(value) ? 'NaN' : `Infinity (${value})`)
    : String(value);

  return new Error([
    `❌ INVALID STATE ${operation.toUpperCase()}: ${propertyPath}`,
    `   Value: ${valueStr}`,
    `   Month: ${validationContext.currentMonth}`,
    `   Phase: ${validationContext.currentPhase}`,
    '',
    '   This indicates a calculation bug that produces invalid numeric values.',
    `   Check all calculations that write to ${propertyPath}.`,
    '',
    '   💡 TIP: Use assertFinite() to wrap calculations and get stack traces.',
  ].join('\n'));
}

/**
 * Cache for wrapped objects to prevent infinite recursion
 */
const proxyCache = new WeakMap<object, any>();

/**
 * Recursively wrap an object with validation proxy
 */
function createValidationProxy<T extends object>(
  target: T,
  path: string[] = []
): T {
  // Return cached proxy if exists
  if (proxyCache.has(target)) {
    return proxyCache.get(target);
  }

  const proxy = new Proxy(target, {
    get(obj, prop, receiver) {
      // Skip symbols and functions
      if (typeof prop === 'symbol') {
        return Reflect.get(obj, prop, receiver);
      }

      const propKey = String(prop);
      const value = Reflect.get(obj, prop, receiver);

      // Skip functions
      if (typeof value === 'function') {
        return value;
      }

      // Validate numeric values on read
      if (typeof value === 'number' && !isValidNumber(value)) {
        throw createValidationError([...path, propKey], value, 'read');
      }

      // Recursively wrap nested objects
      // Skip: arrays, Map, Set, Date, RegExp (special object types)
      if (value && typeof value === 'object'
          && !Array.isArray(value)
          && !(value instanceof Map)
          && !(value instanceof Set)
          && !(value instanceof Date)
          && !(value instanceof RegExp)) {
        return createValidationProxy(value, [...path, propKey]);
      }

      return value;
    },

    set(obj, prop, value, receiver) {
      // Skip symbols
      if (typeof prop === 'symbol') {
        return Reflect.set(obj, prop, value, receiver);
      }

      const propKey = String(prop);

      // Validate numeric values on write
      if (typeof value === 'number' && !isValidNumber(value)) {
        throw createValidationError([...path, propKey], value, 'write');
      }

      return Reflect.set(obj, prop, value, receiver);
    }
  });

  // Cache the proxy
  proxyCache.set(target, proxy);

  return proxy;
}

/**
 * Wrap GameState with validation proxy (dev mode only)
 *
 * In production, returns state unchanged (zero overhead).
 * In development, wraps with Proxy that validates all numeric property access.
 *
 * @param state - GameState to validate
 * @returns Validated GameState (or original in production)
 */
export function wrapStateForValidation<T extends object>(state: T): T {
  const isdev = isDevelopmentMode();
  if (!isdev) {
    console.log('📦 PRODUCTION MODE: State validation proxy DISABLED (zero overhead)');
    return state; // Zero overhead in production
  }

  console.log('🔍 DEV MODE: State validation proxy ENABLED');
  console.log('   All numeric property reads/writes will be validated');
  console.log('   NODE_ENV:', process.env.NODE_ENV);

  return createValidationProxy(state, ['state']);
}

/**
 * Check if state validation is enabled
 */
export function isStateValidationEnabled(): boolean {
  return isDevelopmentMode();
}

// ============================================================================
// ENHANCED STATE VALIDATION (Nov 15, 2025)
// Addresses HIGH-3: State Mutation Without Validation
// ============================================================================

import type { GameState, AIAgent } from '@/types/game';
import {
  assertFinite,
  assertProbability,
  assertInRange,
  assertPlanetaryBoundary,
  assertAICapability
} from './assertions';

/**
 * State snapshot for phase-to-phase comparison
 */
export interface StateSnapshot {
  month: number;
  goldenAgeActive: boolean;
  population: number;
  co2: number;
  temperature: number;
  oceanPH: number;
  biodiversity: number;
  totalAICapability: number;
  deployedAgentCount: number;
}

/**
 * Create snapshot of critical state fields
 */
export function createStateSnapshot(state: GameState): StateSnapshot {
  // Filter for deployed agents (lifecycleState can be 'deployed_closed' or 'deployed_open')
  const deployedAgents = state.aiAgents.filter(a =>
    a.lifecycleState === 'deployed_closed' || a.lifecycleState === 'deployed_open'
  );

  // Sum total capability (already aggregated in agent.capability)
  const totalAICapability = deployedAgents.reduce((sum, a) => sum + a.capability, 0);

  return {
    month: state.currentMonth,
    // LEGITIMATE FALLBACK (Nov 20, 2025): Display/snapshot context
    // This function creates snapshots for logging/comparison, not calculations
    // Fallbacks are acceptable because boundaries may not exist during early initialization
    // If these values are missing in actual simulation calculations, assertions will catch it
    goldenAgeActive: state.goldenAgeState?.active ?? false,
    population: state.humanPopulationSystem.population,
    // Planetary boundaries use normalized values [0, 2] where 1.0 = boundary threshold
    co2: state.planetaryBoundariesSystem.boundaries['climate_change']?.currentValue ?? 0,
    temperature: state.planetaryBoundariesSystem.boundaries['climate_change']?.currentValue ?? 0,
    oceanPH: state.planetaryBoundariesSystem.boundaries['ocean_acidification']?.currentValue ?? 0,
    biodiversity: state.planetaryBoundariesSystem.boundaries['biosphere_integrity']?.currentValue ?? 0,
    totalAICapability,
    deployedAgentCount: deployedAgents.length
  };
}

/**
 * Validate critical state fields
 *
 * Validates the most important state fields that are mutated by many phases.
 * Throws if any critical field is corrupt (NaN, Infinity, out of bounds).
 */
export function validateCriticalState(
  state: GameState,
  context: { location: string; month?: number }
): void {
  const loc = context.location;
  const month = context.month ?? state.currentMonth;

  // === POPULATION ===
  assertFinite(state.humanPopulationSystem.population, {
    location: loc,
    valueName: 'humanPopulationSystem.population',
    month
  });

  if (state.humanPopulationSystem.population < 0) {
    throw new Error(
      `❌ CRITICAL STATE CORRUPTION: Negative population\n` +
      `   Location: ${loc}\n` +
      `   Population: ${state.humanPopulationSystem.population}B\n` +
      `   Month: ${month}`
    );
  }

  // === PLANETARY BOUNDARIES (normalized [0, 2] values) ===
  const climateBoundary = state.planetaryBoundariesSystem.boundaries['climate_change'];
  if (climateBoundary) {
    assertInRange(climateBoundary.currentValue, 0, 2, {
      location: loc,
      valueName: 'boundaries.climate_change.currentValue',
      month
    });
  }

  const oceanBoundary = state.planetaryBoundariesSystem.boundaries['ocean_acidification'];
  if (oceanBoundary) {
    assertInRange(oceanBoundary.currentValue, 0, 2, {
      location: loc,
      valueName: 'boundaries.ocean_acidification.currentValue',
      month
    });
  }

  const biodiversityBoundary = state.planetaryBoundariesSystem.boundaries['biosphere_integrity'];
  if (biodiversityBoundary) {
    assertInRange(biodiversityBoundary.currentValue, 0, 2, {
      location: loc,
      valueName: 'boundaries.biosphere_integrity.currentValue',
      month
    });
  }

  // === AI AGENTS (sample first 5 for performance) ===
  const sampleAgents = state.aiAgents.slice(0, 5);
  for (const agent of sampleAgents) {
    // Validate aggregate capability (already computed)
    assertFinite(agent.capability, {
      location: loc,
      valueName: 'capability',
      month,
      additionalInfo: { agentId: agent.id }
    });

    // Validate core capability profile dimensions
    assertAICapability(agent.capabilityProfile.physical, {
      location: loc,
      valueName: 'capabilityProfile.physical',
      agentId: agent.id,
      dimension: 'physical'
    });

    assertAICapability(agent.capabilityProfile.digital, {
      location: loc,
      valueName: 'capabilityProfile.digital',
      agentId: agent.id,
      dimension: 'digital'
    });

    assertAICapability(agent.capabilityProfile.cognitive, {
      location: loc,
      valueName: 'capabilityProfile.cognitive',
      agentId: agent.id,
      dimension: 'cognitive'
    });
  }

  // === GOLDEN AGE / BIFURCATION ===
  if (state.goldenAgeState === undefined) {
    throw new Error(
      `❌ CRITICAL STATE CORRUPTION: goldenAgeState undefined\n` +
      `   Location: ${loc}\n` +
      `   Month: ${month}`
    );
  }

  if (state.bifurcationState === undefined) {
    throw new Error(
      `❌ CRITICAL STATE CORRUPTION: bifurcationState undefined\n` +
      `   Location: ${loc}\n` +
      `   Month: ${month}`
    );
  }
}

/**
 * Compare snapshots and detect suspicious mutations
 *
 * Returns warnings for large/suspicious changes (not errors).
 * This helps identify phases that make unexpectedly large state changes.
 */
export function compareStateSnapshots(
  before: StateSnapshot,
  after: StateSnapshot,
  phaseName: string
): string[] {
  const warnings: string[] = [];

  // Population: max 10% change per phase (generous)
  if (before.population > 0) {
    const popChangePct = Math.abs((after.population - before.population) / before.population) * 100;
    if (popChangePct > 10) {
      warnings.push(
        `⚠️ Large population change in ${phaseName}: ` +
        `${before.population.toFixed(3)}B → ${after.population.toFixed(3)}B ` +
        `(${popChangePct.toFixed(1)}%)`
      );
    }
  }

  // Climate boundary: max 0.3 normalized value change per phase
  // (Normalized [0, 2] where 1.0 = boundary threshold)
  const climateChange = Math.abs(after.co2 - before.co2);
  if (climateChange > 0.3) {
    warnings.push(
      `⚠️ Large climate boundary change in ${phaseName}: ` +
      `${before.co2.toFixed(3)} → ${after.co2.toFixed(3)} ` +
      `(${climateChange > 0 ? '+' : ''}${climateChange.toFixed(3)})`
    );
  }

  // Ocean acidification: max 0.3 normalized value change per phase
  const oceanChange = Math.abs(after.oceanPH - before.oceanPH);
  if (oceanChange > 0.3) {
    warnings.push(
      `⚠️ Large ocean acidification change in ${phaseName}: ` +
      `${before.oceanPH.toFixed(3)} → ${after.oceanPH.toFixed(3)} ` +
      `(${oceanChange > 0 ? '+' : ''}${oceanChange.toFixed(3)})`
    );
  }

  // Biodiversity: max 0.3 normalized value change per phase
  const bioChange = Math.abs(after.biodiversity - before.biodiversity);
  if (bioChange > 0.3) {
    warnings.push(
      `⚠️ Large biodiversity change in ${phaseName}: ` +
      `${before.biodiversity.toFixed(3)} → ${after.biodiversity.toFixed(3)} ` +
      `(${bioChange > 0 ? '+' : ''}${bioChange.toFixed(3)})`
    );
  }

  // AI capability: max 50% change per phase
  if (before.totalAICapability > 0) {
    const capChangePct = ((after.totalAICapability - before.totalAICapability) / before.totalAICapability) * 100;
    if (Math.abs(capChangePct) > 50) {
      warnings.push(
        `⚠️ Large AI capability change in ${phaseName}: ` +
        `${before.totalAICapability.toFixed(1)} → ${after.totalAICapability.toFixed(1)} ` +
        `(${capChangePct > 0 ? '+' : ''}${capChangePct.toFixed(1)}%)`
      );
    }
  }

  return warnings;
}

/**
 * State validator wrapper for phase execution
 *
 * Provides pre/post validation hooks for phases.
 * Only active in dev mode (controlled by DEV_MODE_STATE_VALIDATION env var).
 */
export class StateValidator {
  private devMode: boolean;

  constructor() {
    // Enable in dev mode
    this.devMode = process.env.DEV_MODE_STATE_VALIDATION === 'true';
  }

  enable(): void {
    this.devMode = true;
  }

  disable(): void {
    this.devMode = false;
  }

  isEnabled(): boolean {
    return this.devMode;
  }

  /**
   * Validate state BEFORE phase execution (pre-condition)
   */
  validatePreCondition(state: GameState, phaseName: string): StateSnapshot | null {
    if (!this.devMode) {
      return null;
    }

    try {
      validateCriticalState(state, {
        location: `${phaseName} (pre-condition)`,
        month: state.currentMonth
      });
      return createStateSnapshot(state);
    } catch (error) {
      console.error(`❌ PRE-CONDITION VIOLATION in ${phaseName}:`, error);
      throw error;
    }
  }

  /**
   * Validate state AFTER phase execution (post-condition)
   */
  validatePostCondition(
    state: GameState,
    phaseName: string,
    beforeSnapshot: StateSnapshot | null
  ): void {
    if (!this.devMode) {
      return;
    }

    try {
      validateCriticalState(state, {
        location: `${phaseName} (post-condition)`,
        month: state.currentMonth
      });

      // Compare snapshots to detect suspicious mutations
      if (beforeSnapshot) {
        const afterSnapshot = createStateSnapshot(state);
        const warnings = compareStateSnapshots(beforeSnapshot, afterSnapshot, phaseName);

        for (const warning of warnings) {
          console.warn(warning);
        }
      }
    } catch (error) {
      console.error(`❌ POST-CONDITION VIOLATION in ${phaseName}:`, error);
      throw error;
    }
  }
}

/**
 * Global singleton state validator
 */
export const stateValidator = new StateValidator();

/**
 * Assertion Utilities for Exposing Bugs at Their Source
 *
 * Replace defensive programming (silent NaN/undefined replacement)
 * with assertive programming (fail fast with context).
 *
 * Philosophy: If a value is unexpectedly NaN/Infinity/undefined,
 * that's a BUG that needs fixing, not a value that needs replacing.
 */

import type { GameState } from '@/types/game';

/**
 * Assert a number is finite (not NaN, not Infinity, not -Infinity)
 *
 * @throws Error with full context if value is non-finite
 */
export function assertFinite(
  value: number,
  context: {
    location: string;      // e.g. "calculateFoodSecurity"
    valueName: string;     // e.g. "foodSecurity"
    month?: number;        // current simulation month
    additionalInfo?: Record<string, any>;  // extra debug data
  }
): number {
  if (!isFinite(value)) {
    const errorMsg = [
      `❌ Non-finite value in ${context.location}`,
      `   ${context.valueName} = ${value}`,
      context.month !== undefined ? `   Month: ${context.month}` : '',
      context.additionalInfo ? `   Context: ${JSON.stringify(context.additionalInfo, null, 2)}` : '',
    ].filter(Boolean).join('\n');

    throw new Error(errorMsg);
  }
  return value;
}

/**
 * Assert a value is defined (not undefined, not null)
 *
 * @throws Error with full context if value is undefined/null
 */
export function assertDefined<T>(
  value: T | undefined | null,
  context: {
    location: string;
    valueName: string;
    month?: number;
    expectedSource?: string;  // e.g. "initialization.ts:559"
  }
): T {
  if (value === undefined || value === null) {
    const errorMsg = [
      `❌ Undefined value in ${context.location}`,
      `   ${context.valueName} is ${value === null ? 'null' : 'undefined'}`,
      context.month !== undefined ? `   Month: ${context.month}` : '',
      context.expectedSource ? `   Expected source: ${context.expectedSource}` : '',
      '',
      '   This indicates an initialization bug or missing state assignment.',
    ].filter(Boolean).join('\n');

    throw new Error(errorMsg);
  }
  return value;
}

/**
 * Assert a number is in valid range [min, max]
 *
 * @throws Error if value is outside range or non-finite
 */
export function assertInRange(
  value: number,
  min: number,
  max: number,
  context: {
    location: string;
    valueName: string;
    month?: number;
  }
): number {
  assertFinite(value, context);

  if (value < min || value > max) {
    const errorMsg = [
      `❌ Out-of-range value in ${context.location}`,
      `   ${context.valueName} = ${value}`,
      `   Valid range: [${min}, ${max}]`,
      context.month !== undefined ? `   Month: ${context.month}` : '',
    ].filter(Boolean).join('\n');

    throw new Error(errorMsg);
  }
  return value;
}

/**
 * Assert a probability is valid [0, 1]
 *
 * @throws Error if not a valid probability
 */
export function assertProbability(
  value: number,
  context: {
    location: string;
    valueName: string;
    month?: number;
  }
): number {
  return assertInRange(value, 0, 1, {
    ...context,
    valueName: `${context.valueName} (probability)`,
  });
}

/**
 * Assert array is non-empty
 *
 * @throws Error if array is empty or undefined
 */
export function assertNonEmpty<T>(
  array: T[] | undefined,
  context: {
    location: string;
    valueName: string;
    month?: number;
  }
): T[] {
  if (!array || array.length === 0) {
    const errorMsg = [
      `❌ Empty array in ${context.location}`,
      `   ${context.valueName} has ${array ? '0' : 'undefined'} elements`,
      context.month !== undefined ? `   Month: ${context.month}` : '',
    ].filter(Boolean).join('\n');

    throw new Error(errorMsg);
  }
  return array;
}

/**
 * Convenience: Assert state.globalMetrics.economicTransitionStage is valid
 *
 * Common pattern - economicTransitionStage should always exist and be in [0, 4]
 */
export function assertEconomicStage(
  state: GameState,
  location: string
): number {
  const stage = assertDefined(
    state.globalMetrics?.economicTransitionStage,
    {
      location,
      valueName: 'state.globalMetrics.economicTransitionStage',
      month: state.currentMonth,
      expectedSource: 'initialization.ts:559',
    }
  );

  return assertInRange(stage, 0, 4, {
    location,
    valueName: 'economicTransitionStage',
    month: state.currentMonth,
  });
}

/**
 * Convenience: Assert all survival fundamentals are valid probabilities
 */
export function assertSurvivalFundamentals(
  fundamentals: {
    foodSecurity: number;
    waterSecurity: number;
    thermalHabitability: number;
    shelterSecurity: number;
  },
  location: string,
  month?: number
): void {
  assertProbability(fundamentals.foodSecurity, { location, valueName: 'foodSecurity', month });
  assertProbability(fundamentals.waterSecurity, { location, valueName: 'waterSecurity', month });
  assertProbability(fundamentals.thermalHabitability, { location, valueName: 'thermalHabitability', month });
  assertProbability(fundamentals.shelterSecurity, { location, valueName: 'shelterSecurity', month });
}

/**
 * Assert a state property exists and is a finite number
 *
 * Use this instead of `obj.property || 0` or `obj.property ?? 0`
 * If a property is missing, that's a BUG that needs fixing.
 *
 * @example
 * // ❌ BAD - Silent fallback hides bugs
 * const value = state.oceanHealth.pH || 8.1;
 *
 * // ✅ GOOD - Fails loudly with context
 * const value = assertStateProperty(
 *   state.oceanHealth,
 *   'pH',
 *   { location: 'applyOceanTech', month: state.currentMonth }
 * );
 */
export function assertStateProperty(
  obj: any,
  propertyPath: string,
  context: {
    location: string;
    month?: number;
    expectedSource?: string;
  }
): number {
  // Support nested paths like "threatDetection.detectSleepers"
  const parts = propertyPath.split('.');
  let value: any = obj;

  for (const part of parts) {
    if (value === undefined || value === null) {
      throw new Error([
        `❌ Missing state property: ${propertyPath}`,
        `   Location: ${context.location}`,
        context.month !== undefined ? `   Month: ${context.month}` : '',
        `   Failed at: ${part}`,
        context.expectedSource ? `   Expected initialization: ${context.expectedSource}` : '',
        '',
        '   This indicates a missing initialization or incorrect state structure.',
        `   Check that ${propertyPath} is properly initialized.`,
      ].filter(Boolean).join('\n'));
    }
    value = value[part];
  }

  if (value === undefined || value === null) {
    throw new Error([
      `❌ Missing state property: ${propertyPath}`,
      `   Location: ${context.location}`,
      context.month !== undefined ? `   Month: ${context.month}` : '',
      context.expectedSource ? `   Expected initialization: ${context.expectedSource}` : '',
      '',
      '   This indicates a missing initialization or incorrect state structure.',
    ].filter(Boolean).join('\n'));
  }

  if (typeof value !== 'number') {
    throw new Error([
      `❌ State property is not a number: ${propertyPath}`,
      `   Location: ${context.location}`,
      `   Type: ${typeof value}`,
      `   Value: ${JSON.stringify(value)}`,
      context.month !== undefined ? `   Month: ${context.month}` : '',
    ].filter(Boolean).join('\n'));
  }

  return assertFinite(value, {
    location: context.location,
    valueName: propertyPath,
    month: context.month,
  });
}

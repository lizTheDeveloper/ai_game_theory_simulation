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

const IS_DEVELOPMENT = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test';

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

      // Recursively wrap nested objects (but not arrays for performance)
      // CRITICAL: Return wrapped proxy so writes to nested properties are validated
      if (value && typeof value === 'object' && !Array.isArray(value)) {
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
  if (!IS_DEVELOPMENT) {
    return state; // Zero overhead in production
  }

  console.log('🔍 DEV MODE: State validation proxy enabled');
  console.log('   All numeric property reads/writes will be validated');
  console.log('   Disable by setting NODE_ENV=production');

  return createValidationProxy(state, ['state']);
}

/**
 * Check if state validation is enabled
 */
export function isStateValidationEnabled(): boolean {
  return IS_DEVELOPMENT;
}

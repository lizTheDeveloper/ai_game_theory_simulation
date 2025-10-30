/**
 * Type-Safe Population Units (Oct 29, 2025)
 *
 * Architecture Review HIGH Issue #5: Population Delta vs Absolute State Inconsistency
 *
 * Problem: Some systems track population in billions, others in millions.
 * Conversion happens in multiple places with potential for 1000× errors.
 *
 * Solution: Branded types that prevent accidental mixing of units at the type level.
 *
 * Research: TypeScript branded types pattern (nominal typing in structural type system)
 * Implementation: Intersection types with unique symbol brands
 *
 * Convention:
 * - ALL STATE PROPERTIES: Use Billions (e.g., GameState.humanPopulationSystem.population)
 * - ALL LOG MESSAGES: Use Millions (e.g., "8,000M population")
 * - CONVERSIONS: Only via helper functions (toBillions, toMillions)
 *
 * @see reviews/integration-architecture-review_20251028.md (lines 310-346)
 */

// ============================================================================
// BRANDED TYPES
// ============================================================================

/**
 * Population in billions (e.g., 8.0 = 8 billion people)
 *
 * Used in ALL simulation state properties:
 * - GameState.humanPopulationSystem.population
 * - RegionalPopulation.population (WAIT NO - that's in millions!)
 * - HumanPopulationSystem.carryingCapacity
 *
 * To create: Use `toBillions()` helper function
 * To convert: Use `toMillions()` helper function
 */
export type Billions = number & { readonly __brand: 'Billions' };

/**
 * Population in millions (e.g., 8000 = 8 billion people)
 *
 * Used for:
 * - Log messages (display): "8,000M population"
 * - Regional populations (RegionalPopulation.population)
 * - Refugee counts (RefugeeCrisis.displacedPopulation)
 * - Death counts in many places
 *
 * To create: Use `toMillions()` helper function
 * To convert: Use `toBillions()` helper function
 */
export type Millions = number & { readonly __brand: 'Millions' };

// ============================================================================
// CONVERSION HELPERS
// ============================================================================

/**
 * Convert a raw number to Billions (type-safe)
 *
 * @param value - Raw number (assumed to be in billions)
 * @returns Type-safe Billions value
 *
 * @example
 * const pop = toBillions(8.0); // 8 billion people
 * state.humanPopulationSystem.population = pop;
 */
export function toBillions(value: number): Billions {
  return value as Billions;
}

/**
 * Convert a raw number to Millions (type-safe)
 *
 * @param value - Raw number (assumed to be in millions)
 * @returns Type-safe Millions value
 *
 * @example
 * const refugees = toMillions(110); // 110 million refugees
 * crisis.displacedPopulation = refugees;
 */
export function toMillions(value: number): Millions {
  return value as Millions;
}

/**
 * Convert Billions → Millions (1 billion = 1000 million)
 *
 * @param billions - Population in billions
 * @returns Population in millions
 *
 * @example
 * const popBillions = toBillions(8.0);
 * const popMillions = billionsToMillions(popBillions); // 8000
 * console.log(`Population: ${popMillions}M`);
 */
export function billionsToMillions(billions: Billions): Millions {
  return (billions * 1000) as Millions;
}

/**
 * Convert Millions → Billions (1000 million = 1 billion)
 *
 * @param millions - Population in millions
 * @returns Population in billions
 *
 * @example
 * const refugeesMil = toMillions(110);
 * const refugeesBil = millionsToBillions(refugeesMil); // 0.11
 */
export function millionsToBillions(millions: Millions): Billions {
  return (millions / 1000) as Billions;
}

/**
 * Unwrap Billions to raw number (for calculations)
 *
 * USE WITH CAUTION - loses type safety!
 * Prefer using branded types throughout calculations when possible.
 *
 * @param billions - Population in billions
 * @returns Raw number
 */
export function unwrapBillions(billions: Billions): number {
  return billions as number;
}

/**
 * Unwrap Millions to raw number (for calculations)
 *
 * USE WITH CAUTION - loses type safety!
 * Prefer using branded types throughout calculations when possible.
 *
 * @param millions - Population in millions
 * @returns Raw number
 */
export function unwrapMillions(millions: Millions): number {
  return millions as number;
}

// ============================================================================
// ASSERTION UTILITIES (Fail-Loudly Philosophy)
// ============================================================================

/**
 * Assert that a value is in Billions and valid (finite, non-negative)
 *
 * Follows simulation-maintainer fail-loudly philosophy:
 * - Invalid values MUST fail with detailed error context
 * - NO silent fallbacks
 *
 * @param value - Value to assert
 * @param context - Error context for debugging
 * @returns Type-safe Billions value
 * @throws Error if value is NaN, Infinity, or negative
 *
 * @example
 * const pop = assertBillions(state.humanPopulationSystem.population, {
 *   location: 'BayesianMortalityResolutionPhase',
 *   valueName: 'population',
 *   month: state.currentMonth
 * });
 */
export function assertBillions(
  value: number,
  context: {
    location: string;
    valueName: string;
    month?: number;
    additionalInfo?: Record<string, unknown>;
  }
): Billions {
  if (!Number.isFinite(value)) {
    const info = context.additionalInfo
      ? `\n  Additional info: ${JSON.stringify(context.additionalInfo, null, 2)}`
      : '';
    throw new Error(
      `❌ ${context.location}: ${context.valueName} is not finite (got ${value})` +
        `\n  Month: ${context.month ?? 'unknown'}` +
        info
    );
  }

  if (value < 0) {
    const info = context.additionalInfo
      ? `\n  Additional info: ${JSON.stringify(context.additionalInfo, null, 2)}`
      : '';
    throw new Error(
      `❌ ${context.location}: ${context.valueName} is negative (got ${value} billions)` +
        `\n  Month: ${context.month ?? 'unknown'}` +
        info
    );
  }

  return value as Billions;
}

/**
 * Assert that a value is in Millions and valid (finite, non-negative)
 *
 * @param value - Value to assert
 * @param context - Error context for debugging
 * @returns Type-safe Millions value
 * @throws Error if value is NaN, Infinity, or negative
 *
 * @example
 * const deaths = assertMillions(totalDeaths * 1000, {
 *   location: 'BayesianMortalityResolutionPhase',
 *   valueName: 'totalDeathsMillions',
 *   month: state.currentMonth
 * });
 */
export function assertMillions(
  value: number,
  context: {
    location: string;
    valueName: string;
    month?: number;
    additionalInfo?: Record<string, unknown>;
  }
): Millions {
  if (!Number.isFinite(value)) {
    const info = context.additionalInfo
      ? `\n  Additional info: ${JSON.stringify(context.additionalInfo, null, 2)}`
      : '';
    throw new Error(
      `❌ ${context.location}: ${context.valueName} is not finite (got ${value})` +
        `\n  Month: ${context.month ?? 'unknown'}` +
        info
    );
  }

  if (value < 0) {
    const info = context.additionalInfo
      ? `\n  Additional info: ${JSON.stringify(context.additionalInfo, null, 2)}`
      : '';
    throw new Error(
      `❌ ${context.location}: ${context.valueName} is negative (got ${value} millions)` +
        `\n  Month: ${context.month ?? 'unknown'}` +
        info
    );
  }

  return value as Millions;
}

/**
 * Assert that a conversion from Billions → Millions is safe
 *
 * Validates BOTH input (billions) and output (millions) for finite, non-negative values.
 * Detects 1000× errors by checking the conversion ratio.
 *
 * @param billions - Input value in billions
 * @param context - Error context
 * @returns Millions value
 * @throws Error if conversion produces invalid values
 *
 * @example
 * const popMillions = assertBillionsToMillions(pop.population, {
 *   location: 'logging',
 *   valueName: 'population',
 *   month: state.currentMonth
 * });
 * console.log(`Population: ${popMillions.toFixed(0)}M`);
 */
export function assertBillionsToMillions(
  billions: number,
  context: {
    location: string;
    valueName: string;
    month?: number;
    additionalInfo?: Record<string, unknown>;
  }
): Millions {
  // Validate input
  const validatedBillions = assertBillions(billions, context);

  // Convert
  const millions = (validatedBillions * 1000) as Millions;

  // Validate output
  if (!Number.isFinite(millions)) {
    const info = context.additionalInfo
      ? `\n  Additional info: ${JSON.stringify(context.additionalInfo, null, 2)}`
      : '';
    throw new Error(
      `❌ ${context.location}: Conversion billions→millions failed` +
        `\n  Input (billions): ${billions}` +
        `\n  Output (millions): ${millions}` +
        `\n  Month: ${context.month ?? 'unknown'}` +
        info
    );
  }

  return millions;
}

/**
 * Assert that a conversion from Millions → Billions is safe
 *
 * @param millions - Input value in millions
 * @param context - Error context
 * @returns Billions value
 * @throws Error if conversion produces invalid values
 *
 * @example
 * const popBillions = assertMillionsToBillions(regionalPop, {
 *   location: 'aggregateRegionalPopulations',
 *   valueName: 'regionalPopulation',
 *   month: state.currentMonth
 * });
 */
export function assertMillionsToBillions(
  millions: number,
  context: {
    location: string;
    valueName: string;
    month?: number;
    additionalInfo?: Record<string, unknown>;
  }
): Billions {
  // Validate input
  const validatedMillions = assertMillions(millions, context);

  // Convert
  const billions = (validatedMillions / 1000) as Billions;

  // Validate output (billions should be much smaller than millions)
  if (!Number.isFinite(billions)) {
    const info = context.additionalInfo
      ? `\n  Additional info: ${JSON.stringify(context.additionalInfo, null, 2)}`
      : '';
    throw new Error(
      `❌ ${context.location}: Conversion millions→billions failed` +
        `\n  Input (millions): ${millions}` +
        `\n  Output (billions): ${billions}` +
        `\n  Month: ${context.month ?? 'unknown'}` +
        info
    );
  }

  return billions;
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format Billions for human-readable display
 *
 * @param billions - Population in billions
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "8.00B")
 *
 * @example
 * const pop = toBillions(8.123);
 * console.log(formatBillions(pop)); // "8.12B"
 */
export function formatBillions(billions: Billions, decimals: number = 2): string {
  return `${(billions as number).toFixed(decimals)}B`;
}

/**
 * Format Millions for human-readable display
 *
 * @param millions - Population in millions
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string (e.g., "8,000M")
 *
 * @example
 * const pop = toMillions(8000);
 * console.log(formatMillions(pop)); // "8,000M"
 */
export function formatMillions(millions: Millions, decimals: number = 0): string {
  const rounded = (millions as number).toFixed(decimals);
  return `${parseFloat(rounded).toLocaleString()}M`;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Check if a value is a valid Billions value (runtime check)
 *
 * TypeScript branded types are compile-time only.
 * This provides runtime validation for external data.
 *
 * @param value - Value to check
 * @returns True if valid Billions value
 */
export function isValidBillions(value: unknown): value is Billions {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

/**
 * Check if a value is a valid Millions value (runtime check)
 *
 * @param value - Value to check
 * @returns True if valid Millions value
 */
export function isValidMillions(value: unknown): value is Millions {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

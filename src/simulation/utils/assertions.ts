/**
 * Assertion Utilities for Exposing Bugs at Their Source
 *
 * Replace defensive programming (silent NaN/undefined replacement)
 * with assertive programming (fail fast with context).
 *
 * Philosophy: If a value is unexpectedly NaN/Infinity/undefined,
 * that's a BUG that needs fixing, not a value that needs replacing.
 */

import type { GameState, PhaseContext } from '@/types/game';

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
    additionalInfo?: Record<string, any>;  // extra debug data
  }
): T {
  if (value === undefined || value === null) {
    const errorMsg = [
      `❌ Undefined value in ${context.location}`,
      `   ${context.valueName} is ${value === null ? 'null' : 'undefined'}`,
      context.month !== undefined ? `   Month: ${context.month}` : '',
      context.expectedSource ? `   Expected source: ${context.expectedSource}` : '',
      context.additionalInfo ? `   Context: ${JSON.stringify(context.additionalInfo, null, 2)}` : '',
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
 * @param epsilon - Optional tolerance for floating-point comparisons (default: 0)
 *                  Use 1e-10 for [0, 1] bounded values to handle rounding errors
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
    additionalInfo?: Record<string, any>;
    epsilon?: number;  // Tolerance for floating-point errors
  }
): number {
  assertFinite(value, context);

  const epsilon = context.epsilon ?? 0;

  // Clamp to valid range if within epsilon tolerance
  // This handles benign floating-point errors (e.g., 1.0000000000000007 → 1.0)
  if (epsilon > 0) {
    if (value < min && value >= min - epsilon) {
      return min;  // Clamp to min
    }
    if (value > max && value <= max + epsilon) {
      return max;  // Clamp to max
    }
  }

  // Strict check (fail loudly if outside tolerance)
  if (value < min || value > max) {
    const errorMsg = [
      `❌ Out-of-range value in ${context.location}`,
      `   ${context.valueName} = ${value}`,
      `   Valid range: [${min}, ${max}]`,
      epsilon > 0 ? `   Tolerance: ±${epsilon}` : '',
      context.month !== undefined ? `   Month: ${context.month}` : '',
    ].filter(Boolean).join('\n');

    throw new Error(errorMsg);
  }
  return value;
}

/**
 * Assert a probability is valid [0, 1]
 *
 * Uses epsilon tolerance (1e-10) to handle floating-point rounding errors
 * @throws Error if not a valid probability
 */
export function assertProbability(
  value: number,
  context: {
    location: string;
    valueName: string;
    month?: number;
    additionalInfo?: Record<string, any>;
  }
): number {
  return assertInRange(value, 0, 1, {
    ...context,
    valueName: `${context.valueName} (probability)`,
    epsilon: 1e-10,  // Tolerance for floating-point errors
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

/**
 * Assert Regional-Global Consistency (Oct 26, 2025 - Phase 5)
 *
 * Prevents drift between regional and global values in bottom-up aggregation architecture.
 * All global values MUST be derived from regional values - this assertion catches violations.
 *
 * Architecture: Regional values are single source of truth, global is derived
 * Validation: Fails loudly if drift detected
 *
 * Checks consistency for:
 * - Population (sum)
 * - Carrying capacity (sum)
 * - Deaths (sum)
 * - Demographics (population-weighted average)
 *
 * @param state - Game state with regional and global values
 * @throws Error if drift detected between regional and global
 */
export function assertRegionalConsistency(state: GameState): void {
  const regions = state.humanPopulationSystem.regionalPopulations;

  // Skip if regions not initialized (shouldn't happen in normal execution)
  if (!regions || regions.length === 0) {
    return;
  }

  // === POPULATION CONSISTENCY ===
  // Regional populations are in millions, global is in billions
  const regionalPopulationSum = regions.reduce((sum, r) => sum + r.population, 0);
  const regionalPopulationBillions = regionalPopulationSum / 1000;
  const globalPopulation = state.humanPopulationSystem.population;
  const populationDiff = Math.abs(regionalPopulationBillions - globalPopulation);

  if (populationDiff > 0.001) {  // 1M tolerance (0.001B = 1M)
    throw new Error(
      `❌ REGIONAL-GLOBAL DRIFT: Population\n` +
      `   Regional sum: ${regionalPopulationSum.toFixed(1)}M (${regionalPopulationBillions.toFixed(3)}B)\n` +
      `   Global value: ${globalPopulation.toFixed(3)}B\n` +
      `   Difference:   ${populationDiff.toFixed(3)}B (${(populationDiff / globalPopulation * 100).toFixed(2)}%)\n` +
      `   Month:        ${state.currentMonth}`
    );
  }

  // === CARRYING CAPACITY CONSISTENCY ===
  // Regional carrying capacity is in millions, global is in billions
  const regionalCapacitySum = regions.reduce((sum, r) => sum + r.carryingCapacity, 0);
  const regionalCapacityBillions = regionalCapacitySum / 1000;
  const globalCapacity = state.humanPopulationSystem.carryingCapacity;
  const capacityDiff = Math.abs(regionalCapacityBillions - globalCapacity);

  if (capacityDiff > 0.001) {  // 1M tolerance (0.001B = 1M)
    throw new Error(
      `❌ REGIONAL-GLOBAL DRIFT: Carrying Capacity\n` +
      `   Regional sum: ${regionalCapacitySum.toFixed(1)}M (${regionalCapacityBillions.toFixed(3)}B)\n` +
      `   Global value: ${globalCapacity.toFixed(3)}B\n` +
      `   Difference:   ${capacityDiff.toFixed(3)}B (${(capacityDiff / globalCapacity * 100).toFixed(2)}%)\n` +
      `   Month:        ${state.currentMonth}`
    );
  }

  // === DEATH TRACKING CONSISTENCY ===
  const regionalMonthlyDeathsSum = regions.reduce((sum, r) => sum + r.monthlyExcessDeaths, 0);
  const globalMonthlyDeaths = state.humanPopulationSystem.monthlyExcessDeaths;
  const monthlyDeathsDiff = Math.abs(regionalMonthlyDeathsSum - globalMonthlyDeaths);

  if (monthlyDeathsDiff > 0.001) {  // 1M tolerance
    throw new Error(
      `❌ REGIONAL-GLOBAL DRIFT: Monthly Excess Deaths\n` +
      `   Regional sum: ${regionalMonthlyDeathsSum.toFixed(3)}M\n` +
      `   Global value: ${globalMonthlyDeaths.toFixed(3)}M\n` +
      `   Difference:   ${monthlyDeathsDiff.toFixed(3)}M\n` +
      `   Month:        ${state.currentMonth}`
    );
  }

  const regionalCumulativeDeathsSum = regions.reduce((sum, r) => sum + r.cumulativeCrisisDeaths, 0);
  const globalCumulativeDeaths = state.humanPopulationSystem.cumulativeCrisisDeaths;
  const cumulativeDeathsDiff = Math.abs(regionalCumulativeDeathsSum - globalCumulativeDeaths);

  if (cumulativeDeathsDiff > 0.001) {  // 1M tolerance
    throw new Error(
      `❌ REGIONAL-GLOBAL DRIFT: Cumulative Crisis Deaths\n` +
      `   Regional sum: ${regionalCumulativeDeathsSum.toFixed(3)}M\n` +
      `   Global value: ${globalCumulativeDeaths.toFixed(3)}M\n` +
      `   Difference:   ${cumulativeDeathsDiff.toFixed(3)}M\n` +
      `   Month:        ${state.currentMonth}`
    );
  }

  // === DEMOGRAPHICS CONSISTENCY ===
  const totalPopulation = regionalPopulationSum;

  if (totalPopulation > 0) {
    const regionalBirthRateAvg = regions.reduce((sum, r) => sum + r.adjustedBirthRate * r.population, 0) / totalPopulation;
    const globalBirthRate = state.humanPopulationSystem.adjustedBirthRate;
    const birthRateDiff = Math.abs(regionalBirthRateAvg - globalBirthRate);

    if (birthRateDiff > 0.0001) {  // 0.01% tolerance
      throw new Error(
        `❌ REGIONAL-GLOBAL DRIFT: Birth Rate\n` +
        `   Regional avg: ${(regionalBirthRateAvg * 100).toFixed(4)}%\n` +
        `   Global value: ${(globalBirthRate * 100).toFixed(4)}%\n` +
        `   Difference:   ${(birthRateDiff * 100).toFixed(4)}%\n` +
        `   Month:        ${state.currentMonth}`
      );
    }

    const regionalDeathRateAvg = regions.reduce((sum, r) => sum + r.adjustedDeathRate * r.population, 0) / totalPopulation;
    const globalDeathRate = state.humanPopulationSystem.adjustedDeathRate;
    const deathRateDiff = Math.abs(regionalDeathRateAvg - globalDeathRate);

    if (deathRateDiff > 0.0001) {  // 0.01% tolerance
      throw new Error(
        `❌ REGIONAL-GLOBAL DRIFT: Death Rate\n` +
        `   Regional avg: ${(regionalDeathRateAvg * 100).toFixed(4)}%\n` +
        `   Global value: ${(globalDeathRate * 100).toFixed(4)}%\n` +
        `   Difference:   ${(deathRateDiff * 100).toFixed(4)}%\n` +
        `   Month:        ${state.currentMonth}`
      );
    }

    const regionalFertilityRateAvg = regions.reduce((sum, r) => sum + r.fertilityRate * r.population, 0) / totalPopulation;
    const globalFertilityRate = state.humanPopulationSystem.fertilityRate;
    const fertilityRateDiff = Math.abs(regionalFertilityRateAvg - globalFertilityRate);

    if (fertilityRateDiff > 0.01) {  // 0.01 children/woman tolerance
      throw new Error(
        `❌ REGIONAL-GLOBAL DRIFT: Fertility Rate\n` +
        `   Regional avg: ${regionalFertilityRateAvg.toFixed(3)} children/woman\n` +
        `   Global value: ${globalFertilityRate.toFixed(3)} children/woman\n` +
        `   Difference:   ${fertilityRateDiff.toFixed(3)}\n` +
        `   Month:        ${state.currentMonth}`
      );
    }

    const regionalMedianAgeAvg = regions.reduce((sum, r) => sum + r.medianAge * r.population, 0) / totalPopulation;
    const globalMedianAge = state.humanPopulationSystem.medianAge;
    const medianAgeDiff = Math.abs(regionalMedianAgeAvg - globalMedianAge);

    if (medianAgeDiff > 0.1) {  // 0.1 years tolerance
      throw new Error(
        `❌ REGIONAL-GLOBAL DRIFT: Median Age\n` +
        `   Regional avg: ${regionalMedianAgeAvg.toFixed(2)} years\n` +
        `   Global value: ${globalMedianAge.toFixed(2)} years\n` +
        `   Difference:   ${medianAgeDiff.toFixed(2)} years\n` +
        `   Month:        ${state.currentMonth}`
      );
    }
  }
}

/**
 * Assert Phase Dependency (Oct 28, 2025)
 *
 * Prevents race conditions where phases read/write state in wrong order.
 * Validates that a required phase has already executed this step.
 *
 * Use case: Phases that depend on Bayesian mortality resolution must run AFTER it.
 *
 * @example
 * // In a phase that modifies population after mortality resolution
 * assertPhaseDependency(context, 'bayesian_mortality_resolution', {
 *   currentPhase: 'regional_population_update',
 *   reason: 'Must not overwrite mortality-adjusted population',
 *   month: state.currentMonth
 * });
 *
 * @param context - Phase context with executedPhases set
 * @param requiredPhaseId - ID of phase that must have executed
 * @param info - Additional context for error message
 * @throws Error if dependency not met
 */
export function assertPhaseDependency(
  context: PhaseContext,
  requiredPhaseId: string,
  info: {
    currentPhase: string;
    reason: string;
    month?: number;
  }
): void {
  if (!context.executedPhases.has(requiredPhaseId)) {
    throw new Error(
      `❌ PHASE DEPENDENCY VIOLATION: ${info.currentPhase}\n` +
      `   Required phase: ${requiredPhaseId}\n` +
      `   Reason: ${info.reason}\n` +
      (info.month !== undefined ? `   Month: ${info.month}\n` : '') +
      `\n` +
      `   The phase '${info.currentPhase}' depends on '${requiredPhaseId}' executing first,\n` +
      `   but that phase has not run yet this step.\n` +
      `\n` +
      `   Executed phases so far: ${Array.from(context.executedPhases).join(', ')}\n` +
      `\n` +
      `   Fix: Either declare dependency in phase definition or adjust phase order.`
    );
  }
}

/**
 * Assert No Phase Has Executed (Oct 28, 2025)
 *
 * Validates that a potentially conflicting phase has NOT executed yet.
 * Used to detect ordering violations where a later phase would overwrite results.
 *
 * Use case: Bayesian mortality phase checks that no population-modifying phase ran before it.
 *
 * @example
 * // In BayesianMortalityResolutionPhase.execute()
 * assertPhaseNotExecuted(context, 'regional_population_update', {
 *   currentPhase: 'bayesian_mortality_resolution',
 *   reason: 'Population modifications must happen AFTER mortality resolution',
 *   month: state.currentMonth
 * });
 *
 * @param context - Phase context with executedPhases set
 * @param prohibitedPhaseId - ID of phase that must NOT have executed
 * @param info - Additional context for error message
 * @throws Error if prohibited phase has executed
 */
export function assertPhaseNotExecuted(
  context: PhaseContext,
  prohibitedPhaseId: string,
  info: {
    currentPhase: string;
    reason: string;
    month?: number;
  }
): void {
  if (context.executedPhases.has(prohibitedPhaseId)) {
    throw new Error(
      `❌ PHASE ORDERING VIOLATION: ${info.currentPhase}\n` +
      `   Prohibited phase already executed: ${prohibitedPhaseId}\n` +
      `   Reason: ${info.reason}\n` +
      (info.month !== undefined ? `   Month: ${info.month}\n` : '') +
      `\n` +
      `   The phase '${prohibitedPhaseId}' has already executed this step, but\n` +
      `   '${info.currentPhase}' must run BEFORE it to prevent data corruption.\n` +
      `\n` +
      `   Executed phases: ${Array.from(context.executedPhases).join(', ')}\n` +
      `\n` +
      `   Fix: Adjust phase order numbers so '${info.currentPhase}' runs first.`
    );
  }
}

/**
 * Assert State Field Not Modified (Oct 28, 2025)
 *
 * Validates that a state field still has its expected value (not overwritten by another phase).
 * Used to detect silent data corruption from race conditions.
 *
 * @example
 * // After Bayesian mortality resolution, check population wasn't overwritten
 * const expectedPop = state.humanPopulationSystem.population;
 * // ... later in the same step, after other phases ...
 * assertStateFieldNotModified(
 *   state.humanPopulationSystem.population,
 *   expectedPop,
 *   {
 *     fieldPath: 'humanPopulationSystem.population',
 *     lastModifiedBy: 'bayesian_mortality_resolution',
 *     suspectedCulprit: 'regional_population_update',
 *     month: state.currentMonth
 *   }
 * );
 *
 * @param currentValue - Current value of the field
 * @param expectedValue - Value set by authoritative phase
 * @param info - Additional context
 * @throws Error if values don't match (silent overwrite detected)
 */
export function assertStateFieldNotModified(
  currentValue: number,
  expectedValue: number,
  info: {
    fieldPath: string;
    lastModifiedBy: string;
    suspectedCulprit?: string;
    month?: number;
    tolerance?: number;  // For floating point comparison
  }
): void {
  const tolerance = info.tolerance ?? 0.000001;
  const diff = Math.abs(currentValue - expectedValue);

  if (diff > tolerance) {
    throw new Error(
      `❌ STATE FIELD OVERWRITE DETECTED: ${info.fieldPath}\n` +
      `   Expected value: ${expectedValue}\n` +
      `   Current value:  ${currentValue}\n` +
      `   Difference:     ${diff}\n` +
      `   Last modified by: ${info.lastModifiedBy}\n` +
      (info.suspectedCulprit ? `   Suspected culprit: ${info.suspectedCulprit}\n` : '') +
      (info.month !== undefined ? `   Month: ${info.month}\n` : '') +
      `\n` +
      `   This field was set by '${info.lastModifiedBy}' but has been silently\n` +
      `   overwritten by another phase. This is a race condition bug.\n` +
      `\n` +
      `   Fix: The later phase should either:\n` +
      `   1. Declare dependency on '${info.lastModifiedBy}' and read its result\n` +
      `   2. Have its order adjusted to run BEFORE '${info.lastModifiedBy}'\n` +
      `   3. Not modify this field at all (if it's authoritative elsewhere)`
    );
  }
}

/**
 * Assert Shock Magnitude (Nov 6, 2025)
 *
 * Validates exogenous shock delta values are within plausible ranges.
 * Used by ExogenousShockPhase for black/gray swan event impacts.
 *
 * Shock magnitudes represent delta changes (typically negative for damage):
 * - Negative values: Damage/reduction (nuclear war reduces social stability)
 * - Positive values: Benefit/increase (rare, like AGI breakthrough)
 *
 * Plausible range: [-1.0, 0.5]
 * - Lower bound: -1.0 (complete destruction, 100% reduction)
 * - Upper bound: 0.5 (50% improvement, generous for positive shocks)
 *
 * @example
 * // Nuclear war social stability impact
 * const delta = assertShockMagnitude(-0.3, {
 *   location: 'applyNuclearWarShock',
 *   valueName: 'socialStabilityDelta',
 *   month: state.currentMonth,
 *   shockType: 'nuclear_war'
 * });
 *
 * @param value - The shock magnitude delta
 * @param context - Validation context with optional shockType
 * @returns The validated value
 * @throws Error if value is non-finite or outside [-1.0, 0.5]
 */
export function assertShockMagnitude(
  value: number,
  context: {
    location: string;
    valueName: string;
    month?: number;
    shockType?: string;
  }
): number {
  if (!Number.isFinite(value)) {
    throw new Error(
      `❌ Non-finite shock magnitude in ${context.location}\n` +
      `   ${context.valueName} = ${value}\n` +
      (context.shockType ? `   Shock type: ${context.shockType}\n` : '') +
      (context.month !== undefined ? `   Month: ${context.month}\n` : '')
    );
  }

  if (value < -1.0 || value > 0.5) {
    throw new Error(
      `❌ Shock magnitude out of plausible range in ${context.location}\n` +
      `   ${context.valueName} = ${value}\n` +
      `   Valid range: [-1.0, 0.5]\n` +
      (context.shockType ? `   Shock type: ${context.shockType}\n` : '') +
      (context.month !== undefined ? `   Month: ${context.month}\n` : '') +
      `\n` +
      `   Shock magnitudes represent delta changes:\n` +
      `   - Negative: Damage/reduction (e.g., -0.3 = 30% reduction)\n` +
      `   - Positive: Benefit/increase (rare, e.g., 0.2 = 20% improvement)\n` +
      `   Values outside this range indicate a bug in shock calculation.`
    );
  }

  return value;
}

/**
 * Assert Resource Allocation (Nov 6, 2025)
 *
 * Validates resource allocation fractions are in valid [0, 1] range.
 * Used for budget allocations, capacity utilization, effort distribution.
 *
 * @example
 * const allocation = assertResourceAllocation(budgetFraction, {
 *   location: 'allocateEmergencyBudget',
 *   valueName: 'defenseBudgetFraction',
 *   month: state.currentMonth
 * });
 *
 * @param value - The resource allocation fraction
 * @param context - Validation context
 * @returns The validated value
 * @throws Error if value is non-finite or outside [0, 1]
 */
export function assertResourceAllocation(
  value: number,
  context: {
    location: string;
    valueName: string;
    month?: number;
  }
): number {
  if (!Number.isFinite(value)) {
    throw new Error(
      `❌ Non-finite resource allocation in ${context.location}\n` +
      `   ${context.valueName} = ${value}\n` +
      (context.month !== undefined ? `   Month: ${context.month}\n` : '')
    );
  }

  if (value < 0 || value > 1) {
    throw new Error(
      `❌ Resource allocation out of range in ${context.location}\n` +
      `   ${context.valueName} = ${value}\n` +
      `   Valid range: [0, 1]\n` +
      (context.month !== undefined ? `   Month: ${context.month}\n` : '') +
      `\n` +
      `   Resource allocations must be fractions:\n` +
      `   - 0.0 = 0% allocated\n` +
      `   - 1.0 = 100% allocated\n` +
      `   Values outside [0, 1] indicate a calculation error.`
    );
  }

  return value;
}

/**
 * Assert Population Change (Nov 6, 2025)
 *
 * Validates population changes are physically plausible.
 * Prevents bugs where population deltas exceed biological/mortality limits.
 *
 * Maximum plausible single-month changes:
 * - Decrease: -50% (catastrophic mortality, like nuclear war)
 * - Increase: +10% (already generous for birth rates)
 *
 * @example
 * const newPop = calculatePopulationAfterMortality(oldPop, mortalityRate);
 * const validatedPop = assertPopulationChange(newPop, oldPop, {
 *   location: 'applyMegaPandemicShock',
 *   valueName: 'population',
 *   month: state.currentMonth
 * });
 *
 * @param newValue - New population value
 * @param oldValue - Previous population value
 * @param context - Validation context
 * @returns The validated new value
 * @throws Error if change exceeds plausible limits
 */
export function assertPopulationChange(
  newValue: number,
  oldValue: number,
  context: {
    location: string;
    valueName: string;
    month?: number;
  }
): number {
  if (!Number.isFinite(newValue)) {
    throw new Error(
      `❌ Non-finite population value in ${context.location}\n` +
      `   ${context.valueName} = ${newValue}\n` +
      (context.month !== undefined ? `   Month: ${context.month}\n` : '')
    );
  }

  if (newValue < 0) {
    throw new Error(
      `❌ Negative population in ${context.location}\n` +
      `   ${context.valueName} = ${newValue}\n` +
      (context.month !== undefined ? `   Month: ${context.month}\n` : '') +
      `\n` +
      `   Population cannot be negative. This indicates a mortality calculation bug.`
    );
  }

  // Maximum plausible population decrease: -50% in single month (catastrophic)
  const maxDecrease = oldValue * 0.5;
  if (newValue < oldValue - maxDecrease) {
    throw new Error(
      `❌ Implausible population decrease in ${context.location}\n` +
      `   ${context.valueName}: ${oldValue} → ${newValue}\n` +
      `   Change: ${(newValue - oldValue).toFixed(3)} (${((newValue - oldValue) / oldValue * 100).toFixed(1)}%)\n` +
      (context.month !== undefined ? `   Month: ${context.month}\n` : '') +
      `\n` +
      `   Maximum plausible decrease: -50% per month (catastrophic mortality)\n` +
      `   This exceeds historical worst-case scenarios (e.g., Black Death: -40% over 7 years).\n` +
      `   Check mortality rate calculations for bugs.`
    );
  }

  // Maximum plausible population increase: +10% in single month (generous)
  const maxIncrease = oldValue * 0.1;
  if (newValue > oldValue + maxIncrease) {
    throw new Error(
      `❌ Implausible population increase in ${context.location}\n` +
      `   ${context.valueName}: ${oldValue} → ${newValue}\n` +
      `   Change: ${(newValue - oldValue).toFixed(3)} (${((newValue - oldValue) / oldValue * 100).toFixed(1)}%)\n` +
      (context.month !== undefined ? `   Month: ${context.month}\n` : '') +
      `\n` +
      `   Maximum plausible increase: +10% per month (already very generous)\n` +
      `   Typical human population growth: ~1.1% per year globally.\n` +
      `   Check population calculation for bugs (double-counting births?).`
    );
  }

  return newValue;
}

/**
 * Assert mortality rate is physically plausible
 *
 * Validates:
 * 1. Valid probability range [0, 1]
 * 2. Physical plausibility: max 50% monthly rate (catastrophic threshold)
 *
 * Research: Historical worst cases:
 * - Black Death: ~40% over 7 years
 * - Xia et al. 2022 nuclear winter: 75% over decades
 * - Monthly rate >50% indicates calculation bug
 *
 * @throws Error if rate exceeds plausible bounds
 */
export function assertMortalityRate(
  rate: number,
  context: {
    location: string;
    valueName: string;
    month?: number;
    population?: number;
  }
): number {
  // First: Validate it's a probability
  assertProbability(rate, context);

  // Second: Check physical plausibility
  if (rate > 0.5) {
    throw new Error(
      `❌ Implausible monthly mortality rate in ${context.location}\n` +
      `   ${context.valueName} = ${(rate * 100).toFixed(2)}%\n` +
      `   Maximum plausible: 50% per month (catastrophic)\n` +
      (context.month !== undefined ? `   Month: ${context.month}\n` : '') +
      (context.population !== undefined ? `   Population: ${context.population}M\n` : '') +
      `\n` +
      `   Historical worst cases:\n` +
      `   - Black Death: ~40% over 7 years (~0.5% monthly average)\n` +
      `   - Xia et al. 2022 nuclear winter: 75% over decades\n` +
      `   A single-month rate >50% indicates a calculation bug.`
    );
  }

  return rate;
}

/**
 * Assert temperature delta is physically plausible
 *
 * Validates:
 * 1. Finite value (not NaN/Infinity)
 * 2. Physical bounds: [-20°C, +10°C] per month
 *
 * Research:
 * - Max observed warming: ~5°C over decades (PETM)
 * - Max plausible cooling: ~15°C (nuclear winter, Xia 2022)
 * - Monthly changes >10°C warming or >20°C cooling indicate bugs
 *
 * @throws Error if delta exceeds plausible bounds
 */
export function assertTemperatureDelta(
  delta: number,
  context: {
    location: string;
    valueName: string;
    month?: number;
    cause?: string;
  }
): number {
  assertFinite(delta, context);

  if (delta < -20 || delta > 10) {
    throw new Error(
      `❌ Implausible temperature delta in ${context.location}\n` +
      `   ${context.valueName} = ${delta.toFixed(2)}°C\n` +
      `   Plausible range: [-20°C, +10°C] per month\n` +
      (context.month !== undefined ? `   Month: ${context.month}\n` : '') +
      (context.cause ? `   Cause: ${context.cause}\n` : '') +
      `\n` +
      `   Physical plausibility:\n` +
      `   - Max warming: ~5°C over decades (PETM)\n` +
      `   - Max cooling: ~15°C (nuclear winter, Xia 2022)\n` +
      `   Values outside [-20, +10]°C/month indicate calculation bugs.`
    );
  }

  return delta;
}

/**
 * Assert AI capability level is valid
 *
 * Validates:
 * 1. Finite value
 * 2. Range: [0, 5] (discrete capability levels)
 * 3. Integer check (capabilities are discrete, not continuous)
 *
 * Capability levels:
 * 0 = Non-existent, 1 = Basic, 2 = Intermediate, 3 = Advanced,
 * 4 = Superhuman, 5 = Transformative
 *
 * @throws Error if capability is invalid or non-integer
 */
export function assertAICapability(
  capability: number,
  context: {
    location: string;
    valueName: string;
    agentId?: string;
    dimension?: string;
    allowContinuous?: boolean;
  }
): number {
  assertFinite(capability, context);

  if (capability < 0 || capability > 5) {
    throw new Error(
      `❌ AI capability out of range in ${context.location}\n` +
      `   ${context.valueName} = ${capability}\n` +
      `   Valid range: [0, 5]\n` +
      (context.agentId ? `   Agent: ${context.agentId}\n` : '') +
      (context.dimension ? `   Dimension: ${context.dimension}\n` : '') +
      `\n` +
      `   Capability levels: 0=None, 1=Basic, 2=Intermediate,\n` +
      `   3=Advanced, 4=Superhuman, 5=Transformative`
    );
  }

  // Profile dimensions are discrete levels (0, 1, 2, 3, 4, 5)
  // Aggregate/average capabilities are continuous (weighted sums, averages)
  if (!context.allowContinuous && !Number.isInteger(capability)) {
    throw new Error(
      `❌ AI capability must be integer in ${context.location}\n` +
      `   ${context.valueName} = ${capability}\n` +
      `   Expected: Integer in [0, 5]\n` +
      (context.agentId ? `   Agent: ${context.agentId}\n` : '') +
      (context.dimension ? `   Dimension: ${context.dimension}\n` : '') +
      `\n` +
      `   Capabilities use discrete levels, not continuous values.\n` +
      `   For aggregate/average capabilities, use allowContinuous: true`
    );
  }

  return capability;
}

/**
 * Assert AI aggregate capability is valid
 *
 * Validates:
 * 1. Finite value
 * 2. Range: [0, 2000] (base [0-5] × scaling multipliers)
 *
 * NOTE: Unlike individual dimensions, aggregate capability CAN be continuous.
 * Individual dimensions are discrete integers [0, 5], but their sum/weighted
 * average produces continuous values. With AI scaling (efficiency gains,
 * test-time compute), capabilities can exceed 100 significantly.
 *
 * Max theoretical capability (75 years):
 * - Base: 5.0 (weighted sum of dimensions)
 * - Pre-training: ~0.5x (decays via sigmoid)
 * - Efficiency: 2^7.5 ≈ 181x (2x per decade, capped)
 * - Test-time: ~2.06x (log scaling at 200x budget)
 * - Deployment: ~1.0x (economic gating)
 * = 5 × 0.5 × 181 × 2.06 × 1.0 ≈ 932
 *
 * Setting max to 2000 provides safety margin for edge cases.
 *
 * @throws Error if capability is invalid
 */
export function assertAIAggregateCapability(
  capability: number,
  context: {
    location: string;
    valueName: string;
    agentId?: string;
  }
): number {
  assertFinite(capability, context);

  // CRITICAL FIX (Dec 12, 2025): Updated max from 100 to 2000
  // With AI scaling multipliers (efficiency, test-time compute), capabilities
  // can exceed 100 significantly over 75-year simulation runs
  // Frontier models (capability >= 8.0) need room to scale
  if (capability < 0 || capability > 2000) {
    throw new Error(
      `❌ AI aggregate capability out of range in ${context.location}\n` +
      `   ${context.valueName} = ${capability}\n` +
      `   Valid range: [0, 2000]\n` +
      (context.agentId ? `   Agent: ${context.agentId}\n` : '') +
      `\n` +
      `   Aggregate capability = base × scaling multipliers.\n` +
      `   Scaling: pre-training (0.5-1.0x), efficiency (1-181x), test-time (1-2x).\n` +
      `   Max theoretical ~932, upper bound 2000 for safety.`
    );
  }

  return capability;
}

/**
 * Assert planetary boundary value is within safe operating space
 *
 * Validates boundary-specific ranges based on Earth system science.
 *
 * Boundary types and safe operating spaces:
 * - co2: [280, 1000] ppm (pre-industrial to RCP8.5 extreme, IPCC AR6 SSP5-8.5 ~900 ppm by 2100)
 * - temperature: [-2, 10] °C above baseline
 * - oceanPH: [7.5, 8.5] pH units (projected minimum ~7.5 under extreme scenarios, current 8.1)
 * - biodiversity: [0, 1] normalized
 * - nitrogen: [0, 200] Tg N/yr
 * - phosphorus: [0, 50] Tg P/yr
 *
 * Research:
 * - CO2: IPCC AR6, RCP8.5/SSP5-8.5 reaches 900-936 ppm by 2100 (layer2_verification Nov 6, 2025)
 * - Ocean pH: NOAA 2025, current 8.1, projected decline to ~7.5 under extreme scenarios (layer2_verification Nov 6, 2025)
 * - Planetary boundaries: Rockström et al. 2009, Steffen et al. 2015
 *
 * @throws Error if value exceeds boundary-specific safe operating space
 */
export function assertPlanetaryBoundary(
  value: number,
  boundaryType: 'co2' | 'temperature' | 'oceanPH' | 'biodiversity' | 'nitrogen' | 'phosphorus',
  context: {
    location: string;
    valueName: string;
    month?: number;
  }
): number {
  assertFinite(value, context);

  const BOUNDARY_RANGES: Record<string, { min: number; max: number; unit: string }> = {
    co2: { min: 280, max: 1000, unit: 'ppm' },  // IPCC AR6 RCP8.5: 900-936 ppm by 2100 (layer2_verification Nov 6, 2025)
    temperature: { min: -2, max: 10, unit: '°C above baseline' },
    oceanPH: { min: 7.5, max: 8.5, unit: 'pH' },  // NOAA 2025: projected ~7.5 minimum under extreme scenarios (layer2_verification Nov 6, 2025)
    biodiversity: { min: 0, max: 1, unit: 'normalized' },
    nitrogen: { min: 0, max: 200, unit: 'Tg N/yr' },
    phosphorus: { min: 0, max: 50, unit: 'Tg P/yr' }
  };

  const range = BOUNDARY_RANGES[boundaryType];
  if (!range) {
    throw new Error(
      `❌ Unknown planetary boundary type: ${boundaryType}\n` +
      `   Valid types: co2, temperature, oceanPH, biodiversity, nitrogen, phosphorus`
    );
  }

  if (value < range.min || value > range.max) {
    throw new Error(
      `❌ Planetary boundary out of range in ${context.location}\n` +
      `   ${context.valueName} = ${value} ${range.unit}\n` +
      `   Safe operating space: [${range.min}, ${range.max}] ${range.unit}\n` +
      `   Boundary type: ${boundaryType}\n` +
      (context.month !== undefined ? `   Month: ${context.month}\n` : '') +
      `\n` +
      `   Values outside safe operating space indicate:\n` +
      `   - Calculation bug (NaN propagation)\n` +
      `   - Implausible state transition\n` +
      `   - Missing boundary enforcement logic\n` +
      `\n` +
      `   Research: Rockström et al. 2009, Steffen et al. 2015`
    );
  }

  return value;
}

/**
 * Assert population value is physically plausible
 *
 * Validates:
 * 1. Finite value
 * 2. Non-negative (populations cannot be negative)
 * 3. Regional maximum: 1000 million (1 billion per region)
 *
 * Note: For global population, use assertInRange with higher bounds.
 * This validator is for regional/demographic segment populations.
 *
 * @throws Error if population is invalid or implausible
 */
export function assertPopulationMillion(
  value: number,
  context: {
    location: string;
    valueName: string;
    month?: number;
    region?: string;
  }
): number {
  assertFinite(value, context);

  if (value < 0) {
    throw new Error(
      `❌ Negative population in ${context.location}\n` +
      `   ${context.valueName} = ${value} million\n` +
      `   Populations cannot be negative.\n` +
      (context.month !== undefined ? `   Month: ${context.month}\n` : '') +
      (context.region ? `   Region: ${context.region}\n` : '') +
      `\n` +
      `   This indicates a mortality or migration calculation bug.`
    );
  }

  // Sanity check: No single region should exceed 1 billion (1000 million)
  // (For global population, use assertInRange with higher bounds)
  if (value > 1000) {
    throw new Error(
      `❌ Implausible regional population in ${context.location}\n` +
      `   ${context.valueName} = ${value} million (${(value / 1000).toFixed(1)} billion)\n` +
      `   Maximum plausible per region: 1000 million (1 billion)\n` +
      (context.month !== undefined ? `   Month: ${context.month}\n` : '') +
      (context.region ? `   Region: ${context.region}\n` : '') +
      `\n` +
      `   Current world regions (2025):\n` +
      `   - Asia: ~4.7 billion\n` +
      `   - Africa: ~1.4 billion\n` +
      `   - Europe: ~750 million\n` +
      `\n` +
      `   If modeling global population, use assertInRange(value, 0, 10000, context).\n` +
      `   If this is a sub-region, check population calculation for bugs.`
    );
  }

  return value;
}

/**
 * Assert economic metric value is plausible
 *
 * Validates boundary-specific ranges for economic state mutations.
 *
 * Metric types and plausible ranges:
 * - gdp: [0, 500] trillion USD (IMF 2025: $114T baseline, 2% growth to 2100 → $510T, layer2_verification Nov 6, 2025)
 * - spending: [0, 50] trillion USD/year (government spending)
 * - taxation: [0, 1] as fraction of GDP
 * - deficit: [-10, 10] trillion USD (annual deficit/surplus)
 * - growthRate: [-0.5, 0.5] monthly change (±50% is catastrophic)
 *
 * @throws Error if economic metric exceeds plausible bounds
 */
export function assertEconomicMetric(
  value: number,
  metricType: 'gdp' | 'spending' | 'taxation' | 'deficit' | 'growthRate',
  context: {
    location: string;
    valueName: string;
    month?: number;
  }
): number {
  assertFinite(value, context);

  const ECONOMIC_RANGES: Record<string, { min: number; max: number; unit: string }> = {
    gdp: { min: 0, max: 500, unit: 'trillion USD' },  // IMF 2025: $114T baseline, 2% growth to 2100 → $510T (layer2_verification Nov 6, 2025)
    spending: { min: 0, max: 50, unit: 'trillion USD/year' },
    taxation: { min: 0, max: 1, unit: 'fraction of GDP' },
    deficit: { min: -10, max: 10, unit: 'trillion USD' },
    growthRate: { min: -0.5, max: 0.5, unit: 'monthly change' }
  };

  const range = ECONOMIC_RANGES[metricType];
  if (!range) {
    throw new Error(
      `❌ Unknown economic metric type: ${metricType}\n` +
      `   Valid types: gdp, spending, taxation, deficit, growthRate`
    );
  }

  if (value < range.min || value > range.max) {
    throw new Error(
      `❌ Economic metric out of range in ${context.location}\n` +
      `   ${context.valueName} = ${value} ${range.unit}\n` +
      `   Plausible range: [${range.min}, ${range.max}] ${range.unit}\n` +
      `   Metric type: ${metricType}\n` +
      (context.month !== undefined ? `   Month: ${context.month}\n` : '') +
      `\n` +
      `   Values outside plausible range indicate:\n` +
      `   - Calculation bug (NaN propagation, unit mismatch)\n` +
      `   - Implausible economic transition\n` +
      `   - Missing constraint enforcement\n` +
      `\n` +
      `   For reference (2025-2100):\n` +
      `   - Global GDP 2025: ~$114 trillion (IMF April 2025)\n` +
      `   - US GDP 2025: ~$25 trillion\n` +
      `   - 2% annual growth to 2100: ~$510 trillion\n` +
      `   - Typical government spending: 20-40% of GDP`
    );
  }

  return value;
}

export function capWithBifurcationAwareness(
  value: number,
  baselineBound: number,
  context: {
    location: string;
    valueName: string;
    month?: number;
  }
): number {
  const validValue = assertFinite(value, {
    ...context,
    valueName: context.valueName + '_beforeBifurcationCap'
  });

  const capped = Math.min(baselineBound, validValue);

  if (capped < validValue) {
    console.log(
      '🔀 BIFURCATION CAP: ' + context.valueName + ' ' + validValue.toFixed(3) + ' → ' + capped.toFixed(3) + ' ' +
      '(Month ' + context.month + ', ' + context.location + ')'
    );
  }

  return capped;
}

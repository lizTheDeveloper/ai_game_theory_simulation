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

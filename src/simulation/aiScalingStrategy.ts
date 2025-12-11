/**
 * AI Scaling Strategy Module (Dec 2025)
 *
 * Three-axis AI scaling model based on 2025 research with CONSERVATIVE parameters
 * per Quality Gate 1 validation (Grade C+, reviews/ai_scaling_laws_2025_critique_20251211.md)
 *
 * Research: research/ai_scaling_laws_2025_update_20251112.md
 *
 * KEY REVISIONS FROM ORIGINAL RESEARCH:
 * - Pre-training: Sigmoid PLATEAU (not continued exponential decay)
 * - Test-time: Economic gating (0.1% deployment fraction)
 * - Efficiency: 1.5-2x/decade cap (not 5x optimistic projection)
 * - Uncertainty: ±50% near-term, ±200% long-term
 *
 * CRITICAL: Economic constraints matter MORE than technical capability.
 * If deployment costs $1,000/task, capability is irrelevant for 99.9% of use cases.
 */

import { AIScalingComponents, AIInferenceCost, AIAgent, AICapabilityProfile } from '@/types/game';
import { assertFinite, assertInRange } from '@/simulation/utils/assertions';

/**
 * Calculate inference cost from test-time compute budget
 *
 * Cost scales super-linearly with test-time compute:
 * - o1 ($5/task, 1x budget) → o3 ($1,000/task, 200x budget)
 * - Research: 200x cost for 172x compute (power law ~1.15)
 *
 * @param testTimeComputeBudget - Compute budget multiplier [1-200]
 * @param baseInferenceCost - Baseline cost at 1x budget (default: $5, o1-level)
 * @returns AIInferenceCost object with economic viability assessment
 */
export function calculateInferenceCost(
  testTimeComputeBudget: number,
  baseInferenceCost: number = 5
): AIInferenceCost {
  // Validate inputs
  if (testTimeComputeBudget < 1) {
    throw new Error(
      `❌ CRITICAL: testTimeComputeBudget must be >= 1 (got ${testTimeComputeBudget})\n` +
      `   Test-time compute cannot be negative or zero.`
    );
  }

  assertFinite(baseInferenceCost, {
    location: 'calculateInferenceCost',
    valueName: 'baseInferenceCost',
    additionalInfo: { testTimeComputeBudget }
  });

  // Cost scales super-linearly (power law ~1.15)
  // Research: o1 ($5) → o3 ($1,000) = 200x for 172x compute
  const testTimeMultiplier = Math.pow(testTimeComputeBudget, 1.15);

  const totalCostPerTask = assertFinite(baseInferenceCost * testTimeMultiplier, {
    location: 'calculateInferenceCost',
    valueName: 'totalCostPerTask',
    additionalInfo: { baseInferenceCost, testTimeMultiplier, testTimeComputeBudget }
  });

  // Economic viability threshold (arbitrary: $100/task for widespread deployment)
  const economicViable = totalCostPerTask < 100;

  // CRITICAL REVISION: Economic gating limits deployment
  // Only top 0.1% value tasks can afford o3-level compute ($1,000+/task)
  // Model effective capability as weighted by economic feasibility
  const deploymentFraction = assertFinite(
    Math.min(1.0, 100 / totalCostPerTask), // Linear decay: $10 = 100%, $100 = 10%, $1,000 = 1%
    {
      location: 'calculateInferenceCost',
      valueName: 'deploymentFraction',
      additionalInfo: { totalCostPerTask }
    }
  );

  assertInRange(deploymentFraction, 0, 1, {
    location: 'calculateInferenceCost',
    valueName: 'deploymentFraction',
    additionalInfo: { totalCostPerTask }
  });

  return {
    baseCostPerTask: baseInferenceCost,
    testTimeMultiplier,
    totalCostPerTask,
    economicViable,
    deploymentFraction
  };
}

/**
 * Update AI scaling components over time (CONSERVATIVE PARAMETERS)
 *
 * REVISED per Sylvia's Quality Gate 1 critique (Grade C+):
 *
 * 1. Pre-training: Sigmoid approaching plateau (NOT continued exponential decay)
 *    - 2025: 1.0x → 2027: 0.73x → 2030: 0.55x → 2035: 0.51x (plateau)
 *    - Evidence: Orion 80% more training = minimal gains
 *
 * 2. Efficiency: 1.5-2x/decade cap (NOT 5x optimistic)
 *    - 2025: 1.0x → 2030: 1.22x → 2035: 1.5-2.0x
 *    - Rationale: 23x claim non-peer-reviewed, historical gains suggest 2x/decade
 *
 * 3. Uncertainty: ±50% near-term, ±200% long-term
 *    - Paradigm shift = structural uncertainty
 *
 * @param currentComponents - Current scaling state
 * @param monthsSince2025 - Months elapsed since Jan 2025
 * @param rng - Deterministic random number generator
 * @returns Updated scaling components
 */
export function updateScalingComponents(
  currentComponents: AIScalingComponents,
  monthsSince2025: number,
  rng: () => number
): AIScalingComponents {
  const yearsSince2025 = monthsSince2025 / 12;

  // 1. Pre-training multiplier: SIGMOID PLATEAU (not continued decay)
  // Evidence shows near-complete stagnation, not gradual slowdown
  // Sigmoid: 0.5 + (1.0 / (1 + exp((years - 2) / 2)))
  // Result: 2025: 1.0x → 2027: 0.73x → 2030: 0.55x → 2035: 0.51x
  const preTrainingMultiplier = assertFinite(
    0.5 + (1.0 / (1 + Math.exp((yearsSince2025 - 2) / 2))),
    {
      location: 'updateScalingComponents',
      valueName: 'preTrainingMultiplier',
      additionalInfo: { yearsSince2025, monthsSince2025 }
    }
  );

  // Validate range [0.5, 1.5] (updated upper bound from 2.0)
  assertInRange(preTrainingMultiplier, 0.5, 1.5, {
    location: 'updateScalingComponents',
    valueName: 'preTrainingMultiplier',
    additionalInfo: { yearsSince2025 }
  });

  // 2. Efficiency multiplier: 1.5-2x per decade CAP (conservative)
  // Base: 1.5x/decade growth (peer-reviewed historical gains)
  // Cap: 2x/decade maximum (until better evidence emerges)
  const baseEfficiencyGrowth = Math.pow(1.5, yearsSince2025 / 10); // 1.5x baseline

  // Stochastic variance: ±15% (research uncertainty)
  const efficiencyVariance = (rng() - 0.5) * 0.3; // ±15%

  // Apply variance and cap at 2x/decade
  const hardCap = Math.pow(2.0, yearsSince2025 / 10);
  const efficiencyMultiplier = assertFinite(
    Math.max(1.0, Math.min(
      baseEfficiencyGrowth * (1 + efficiencyVariance),
      hardCap
    )),
    {
      location: 'updateScalingComponents',
      valueName: 'efficiencyMultiplier',
      additionalInfo: { yearsSince2025, baseEfficiencyGrowth, efficiencyVariance, hardCap }
    }
  );

  // 3. Uncertainty multipliers (MANDATORY per Sylvia)
  // Near-term (2025-2027): ±50% uncertainty
  const nearTermUncertainty = yearsSince2025 < 2
    ? 1.0 + (rng() - 0.5) * 0.5  // ±25% (multiply by 0.5 to get ±50% range)
    : 1.0;

  // Long-term (2028+): ±200% uncertainty
  const longTermUncertainty = yearsSince2025 >= 3
    ? 1.0 + (rng() - 0.5) * 2.0  // ±100% (multiply by 2.0 to get ±200% range)
    : 1.0;

  const uncertaintyMultiplier = assertFinite(
    nearTermUncertainty * longTermUncertainty,
    {
      location: 'updateScalingComponents',
      valueName: 'uncertaintyMultiplier',
      additionalInfo: { yearsSince2025, nearTermUncertainty, longTermUncertainty }
    }
  );

  // Apply uncertainty to efficiency (pre-training plateau is deterministic)
  const finalEfficiencyMultiplier = assertFinite(
    Math.max(1.0, efficiencyMultiplier * uncertaintyMultiplier),
    {
      location: 'updateScalingComponents',
      valueName: 'finalEfficiencyMultiplier',
      additionalInfo: { efficiencyMultiplier, uncertaintyMultiplier }
    }
  );

  // Test-time compute budget: Preserve from current (strategic decision, not time-evolved)
  // Deployment strategy (selectTestTimeComputeBudget) determines this based on problem difficulty
  const testTimeComputeBudget = currentComponents.testTimeComputeBudget;

  return {
    preTrainingMultiplier,
    testTimeComputeBudget,
    efficiencyMultiplier: finalEfficiencyMultiplier
  };
}

/**
 * Initialize scaling components for a new AI agent (2025 baseline)
 *
 * @param testTimeComputeBudget - Initial test-time compute allocation [1-200] (default: 1 = o1-level)
 * @returns Initial scaling components (2025 baseline)
 */
export function initializeScalingComponents(
  testTimeComputeBudget: number = 1
): AIScalingComponents {
  // Validate test-time budget
  if (testTimeComputeBudget < 1) {
    throw new Error(
      `❌ CRITICAL: testTimeComputeBudget must be >= 1 (got ${testTimeComputeBudget})\n` +
      `   Cannot initialize with zero or negative compute budget.`
    );
  }

  assertInRange(testTimeComputeBudget, 1, 200, {
    location: 'initializeScalingComponents',
    valueName: 'testTimeComputeBudget'
  });

  return {
    preTrainingMultiplier: 1.0,  // 2025 baseline (no change yet)
    testTimeComputeBudget,
    efficiencyMultiplier: 1.0    // 2025 baseline (no improvements yet)
  };
}

/**
 * Calculate effective AI capability from base profile and scaling components
 *
 * CRITICAL REVISION: Economic constraints limit effective capability
 * - Technical capability != deployment capability
 * - $1,000/task = only 0.1% deployment fraction
 * - Model effective capability as: base * scaling * deploymentFraction
 *
 * @param baseCapability - Base capability from 7-dimensional profile (see capabilities.ts)
 * @param scalingModel - Three-axis scaling components
 * @param deploymentFraction - Economic deployment feasibility [0,1]
 * @returns Effective capability incorporating scaling and economic constraints
 */
export function calculateEffectiveCapability(
  baseCapability: number,
  scalingModel: AIScalingComponents,
  deploymentFraction: number = 1.0  // Default: no economic constraints
): number {
  // Validate inputs
  assertFinite(baseCapability, {
    location: 'calculateEffectiveCapability',
    valueName: 'baseCapability'
  });

  assertInRange(deploymentFraction, 0, 1, {
    location: 'calculateEffectiveCapability',
    valueName: 'deploymentFraction'
  });

  const { preTrainingMultiplier, testTimeComputeBudget, efficiencyMultiplier } = scalingModel;

  // Test-time compute effectiveness: Logarithmic scaling (diminishing returns at high budgets)
  // 1x → 1.0, 10x → 1.46, 100x → 1.92, 200x → 2.06
  // REVISED: Economic gating means most tasks use 1x, so effective boost is minimal
  const testTimeBoost = 1.0 + Math.log10(testTimeComputeBudget) * 0.2;

  assertFinite(testTimeBoost, {
    location: 'calculateEffectiveCapability',
    valueName: 'testTimeBoost',
    additionalInfo: { testTimeComputeBudget }
  });

  // Effective capability: base * pre-training * efficiency * test-time * economic_gating
  const effectiveCapability = assertFinite(
    baseCapability *
    preTrainingMultiplier *
    efficiencyMultiplier *
    testTimeBoost *
    deploymentFraction,  // CRITICAL: Economic constraints reduce effective capability
    {
      location: 'calculateEffectiveCapability',
      valueName: 'effectiveCapability',
      additionalInfo: {
        baseCapability,
        preTrainingMultiplier,
        efficiencyMultiplier,
        testTimeBoost,
        deploymentFraction
      }
    }
  );

  return effectiveCapability;
}

/**
 * Select optimal test-time compute budget based on problem difficulty and economics
 *
 * STRATEGY:
 * - Easy problems: Cheap inference (1x, $5/task)
 * - Hard problems: Expensive reasoning IF economically viable (200x, $1,000/task)
 * - Medium: Scale linearly with difficulty, capped by budget
 *
 * @param problemDifficulty - Problem difficulty [0,1] (0=easy, 1=hard)
 * @param economicBudget - Available budget per task ($)
 * @returns Optimal test-time compute budget [1-200]
 */
export function selectTestTimeComputeBudget(
  problemDifficulty: number,
  economicBudget: number
): number {
  // Validate inputs
  assertInRange(problemDifficulty, 0, 1, {
    location: 'selectTestTimeComputeBudget',
    valueName: 'problemDifficulty'
  });

  assertFinite(economicBudget, {
    location: 'selectTestTimeComputeBudget',
    valueName: 'economicBudget'
  });

  // Easy problems: cheap inference sufficient
  if (problemDifficulty < 0.3) {
    return 1; // o1-level (~$5/task)
  }

  // Hard problems: expensive reasoning IF budget allows
  if (problemDifficulty > 0.7 && economicBudget > 500) {
    return 200; // o3-level (~$1,000/task)
  }

  // Medium difficulty or budget constraints
  // Scale linearly with difficulty, capped by budget
  const desiredBudget = 1 + (problemDifficulty * 199); // [1, 200]
  const budgetCap = economicBudget / 5; // Convert $ to budget units (rough approximation)

  return Math.max(1, Math.min(desiredBudget, budgetCap, 200));
}

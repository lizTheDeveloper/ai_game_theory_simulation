/**
 * Policy Implementation Lifecycle
 *
 * Models realistic government implementation delays, failures, and partial adoption.
 *
 * Research Foundation:
 * - Pressman & Wildavsky (1973): Implementation - 2-10 year delays typical
 * - Sabatier (1988): Advocacy Coalition Framework - political will decay
 * - Stigler (1971): Regulatory capture - industry influence reduces effectiveness
 * - Howlett (2009): Policy capacity affects implementation quality
 * - Pierson (2000): Path dependence and institutional inertia
 *
 * Key Parameters:
 * - Base deployment time: 36 months (3 years) for well-funded policies
 * - Effectiveness range: 30-80% (not 100%) due to institutional resistance
 * - Political will decay: 1% chance per month of 5% decay
 * - Industry capture: reduces effectiveness to ~40%
 *
 * @module simulation/government/policyLifecycle
 */

import type { GameState, RNGFunction } from '@/types/game';
import type { ActivePolicy, GovernmentCapacity } from '@/types/government';
import {
  assertFinite,
  assertInRange,
  assertProbability,
} from '@/simulation/utils/assertions';

/**
 * Update policy implementation progress
 *
 * Applies sigmoid ramp-up to effectiveness over time.
 * Handles political will decay, industry capture, and enforcement failures.
 *
 * @param policy - Policy to update
 * @param state - Current game state
 * @param rng - Deterministic RNG function
 */
export function updatePolicyImplementation(
  policy: ActivePolicy,
  state: GameState,
  rng: RNGFunction
): void {
  const monthsSinceStart = state.currentMonth - policy.startMonth;

  // Calculate expected deployment time based on funding
  // Base: 36 months (3 years), longer if underfunded
  // Underfunded policies take 2-3x longer
  const fundingMultiplier = assertInRange(
    1 / Math.max(0.3, policy.fundingLevel),
    1.0,
    3.33,
    {
      location: 'updatePolicyImplementation',
      valueName: 'fundingMultiplier',
      month: state.currentMonth,
    }
  );

  const expectedDeploymentTime = 36 * fundingMultiplier;

  // Sigmoid ramp-up: slow start, rapid middle, slow finish
  // Progress from 0 to 1 over expectedDeploymentTime
  const deploymentProgress = assertFinite(
    monthsSinceStart / expectedDeploymentTime,
    {
      location: 'updatePolicyImplementation',
      valueName: 'deploymentProgress',
      month: state.currentMonth,
      additionalInfo: { monthsSinceStart, expectedDeploymentTime },
    }
  );

  // Sigmoid function: 1 / (1 + e^(-5 * (x - 0.5)))
  // Centered at x=0.5, steep ramp between x=0.3 and x=0.7
  const rawEffectiveness = 1 / (1 + Math.exp(-5 * (deploymentProgress - 0.5)));

  // Cap effectiveness by bureaucratic capacity
  // If bureaucratic capacity is 0.5, max effectiveness is 0.5
  const cappedEffectiveness = assertFinite(
    rawEffectiveness * policy.bureaucraticCapacity,
    {
      location: 'updatePolicyImplementation',
      valueName: 'cappedEffectiveness',
      month: state.currentMonth,
      additionalInfo: { rawEffectiveness, bureaucraticCapacity: policy.bureaucraticCapacity },
    }
  );

  // Apply failure mode multipliers
  let finalEffectiveness = cappedEffectiveness;

  if (policy.capturedByIndustry) {
    // Industry capture reduces effectiveness to ~40%
    finalEffectiveness *= 0.4;
  }

  if (policy.insufficientEnforcement) {
    // Insufficient enforcement: 60% compliance
    finalEffectiveness *= 0.6;
  }

  if (policy.loopholes) {
    // Loopholes allow circumvention: 70% effective
    finalEffectiveness *= 0.7;
  }

  // Clamp to [0, 1] and update
  policy.currentEffectiveness = assertProbability(
    Math.max(0, Math.min(1, finalEffectiveness)),
    {
      location: 'updatePolicyImplementation',
      valueName: 'currentEffectiveness',
      month: state.currentMonth,
    }
  );

  // Political will decay (1% chance per month, 5% decay)
  // Research: Sabatier (1988) - advocacy coalitions can weaken over time
  if (rng() < 0.01) {
    const oldWill = policy.politicalWill;
    policy.politicalWill = assertProbability(
      policy.politicalWill * 0.95,
      {
        location: 'updatePolicyImplementation',
        valueName: 'politicalWill',
        month: state.currentMonth,
      }
    );

    console.log(`  ⚠️ Political will decay: ${policy.country} ${policy.domain} (${oldWill.toFixed(2)} → ${policy.politicalWill.toFixed(2)})`);
  }

  // If political will drops too low, policy can be abandoned
  if (policy.politicalWill < 0.2 && rng() < 0.05) {
    console.log(`  🚨 Policy abandoned: ${policy.country} ${policy.domain} (insufficient political will)`);
    policy.currentEffectiveness = 0;
  }
}

/**
 * Create initial government capacity for a country
 *
 * Based on regime type, state capacity, and other factors.
 * Simplified initialization - could be enhanced with real data.
 *
 * @param countryCode - ISO 3166-1 alpha-3 country code
 * @param governmentData - Government data from government system
 * @param rng - Deterministic RNG function
 * @returns Government capacity factors
 */
export function initializeGovernmentCapacity(
  countryCode: string,
  governmentData: any,
  rng: RNGFunction
): GovernmentCapacity {
  // Extract state capacity (WGI 2024 data if available)
  const stateCapacity = governmentData?.capacity?.derived?.overallCapacity || 0.5;

  // Regulatory expertise: higher in high-capacity states
  // Add some noise for variation
  const regulatoryExpertise = assertProbability(
    Math.max(0.1, Math.min(0.9, stateCapacity * 0.7 + rng() * 0.3)),
    {
      location: 'initializeGovernmentCapacity',
      valueName: 'regulatoryExpertise',
    }
  );

  // Institutional inertia: higher in older, more established systems
  // Democracies tend to have more institutional inertia (more veto points)
  const isDemocracy = governmentData?.type?.includes('liberal') || governmentData?.type?.includes('electoral');
  const baseInertia = isDemocracy ? 0.6 : 0.4;
  const institutionalInertia = assertProbability(
    Math.max(0.2, Math.min(0.8, baseInertia + (rng() - 0.5) * 0.3)),
    {
      location: 'initializeGovernmentCapacity',
      valueName: 'institutionalInertia',
    }
  );

  // Political polarization: varies widely
  // Higher polarization = harder to pass/implement policies
  const politicalPolarization = assertProbability(
    rng(),
    {
      location: 'initializeGovernmentCapacity',
      valueName: 'politicalPolarization',
    }
  );

  // International coordination: higher for democracies, G7 members
  const isG7 = ['USA', 'CAN', 'GBR', 'FRA', 'DEU', 'ITA', 'JPN'].includes(countryCode);
  const baseCoordination = (isDemocracy ? 0.5 : 0.3) + (isG7 ? 0.2 : 0);
  const internationalCoordination = assertProbability(
    Math.max(0.1, Math.min(0.9, baseCoordination + (rng() - 0.5) * 0.2)),
    {
      location: 'initializeGovernmentCapacity',
      valueName: 'internationalCoordination',
    }
  );

  return {
    regulatoryExpertise,
    institutionalInertia,
    politicalPolarization,
    internationalCoordination,
  };
}

/**
 * Calculate deployment time for a policy
 *
 * Based on funding, bureaucratic capacity, institutional inertia.
 *
 * @param fundingLevel - Funding level [0,1]
 * @param capacity - Government capacity factors
 * @param rng - Deterministic RNG function
 * @returns Deployment time in months
 */
export function calculateDeploymentTime(
  fundingLevel: number,
  capacity: GovernmentCapacity,
  rng: RNGFunction
): number {
  // Base deployment time: 36 months (3 years)
  const baseTime = 36;

  // Funding multiplier: underfunded policies take 2-3x longer
  const fundingMultiplier = assertInRange(
    1 / Math.max(0.3, fundingLevel),
    1.0,
    3.33,
    {
      location: 'calculateDeploymentTime',
      valueName: 'fundingMultiplier',
    }
  );

  // Institutional inertia adds delay (0-50% longer)
  const inertiaMultiplier = assertInRange(
    1 + capacity.institutionalInertia * 0.5,
    1.0,
    1.5,
    {
      location: 'calculateDeploymentTime',
      valueName: 'inertiaMultiplier',
    }
  );

  // Random variation: ±20%
  const randomMultiplier = 1 + (rng() - 0.5) * 0.4;

  const deploymentTime = assertFinite(
    baseTime * fundingMultiplier * inertiaMultiplier * randomMultiplier,
    {
      location: 'calculateDeploymentTime',
      valueName: 'deploymentTime',
      additionalInfo: { baseTime, fundingMultiplier, inertiaMultiplier, randomMultiplier },
    }
  );

  // Clamp to 24-72 months (2-6 years)
  return Math.max(24, Math.min(72, Math.round(deploymentTime)));
}

/**
 * Calculate target effectiveness for a policy
 *
 * Based on bureaucratic capacity, political will, public support.
 * Real policies rarely achieve 100% effectiveness.
 *
 * @param bureaucraticCapacity - Bureaucratic capacity [0,1]
 * @param politicalWill - Political will [0,1]
 * @param publicSupport - Public support [0,1]
 * @param rng - Deterministic RNG function
 * @returns Target effectiveness [0.3, 0.8]
 */
export function calculateTargetEffectiveness(
  bureaucraticCapacity: number,
  politicalWill: number,
  publicSupport: number,
  rng: RNGFunction
): number {
  // Weighted combination of factors
  const baseEffectiveness = (
    bureaucraticCapacity * 0.5 +
    politicalWill * 0.3 +
    publicSupport * 0.2
  );

  // Random variation: ±15%
  const randomDelta = (rng() - 0.5) * 0.3;

  const targetEffectiveness = assertFinite(
    baseEffectiveness + randomDelta,
    {
      location: 'calculateTargetEffectiveness',
      valueName: 'targetEffectiveness',
      additionalInfo: { bureaucraticCapacity, politicalWill, publicSupport },
    }
  );

  // Clamp to [0.3, 0.8] - policies rarely below 30% or above 80%
  return assertInRange(
    Math.max(0.3, Math.min(0.8, targetEffectiveness)),
    0.3,
    0.8,
    {
      location: 'calculateTargetEffectiveness',
      valueName: 'targetEffectiveness (clamped)',
    }
  );
}

/**
 * Determine if policy is captured by industry
 *
 * Research: Stigler (1971) - regulatory capture
 * More likely for industry-specific regulations, less for broad safety rules.
 *
 * @param domain - Policy domain
 * @param capacity - Government capacity factors
 * @param rng - Deterministic RNG function
 * @returns True if captured
 */
export function isCaptureProbable(
  domain: string,
  capacity: GovernmentCapacity,
  rng: RNGFunction
): boolean {
  // Base capture probability by domain
  const baseProbability: Record<string, number> = {
    technology: 0.3,      // Tech regulations often captured
    environmental: 0.2,   // Environmental regs moderately captured
    safety: 0.1,          // Safety regs less captured (public pressure)
    economic: 0.4,        // Economic regs very captured
  };

  const domainProbability = baseProbability[domain] || 0.2;

  // Regulatory expertise reduces capture risk
  const expertiseReduction = capacity.regulatoryExpertise * 0.5;

  const captureProbability = assertProbability(
    Math.max(0, domainProbability - expertiseReduction),
    {
      location: 'isCaptureProbable',
      valueName: 'captureProbability',
    }
  );

  return rng() < captureProbability;
}

/**
 * Determine if enforcement is insufficient
 *
 * More likely with low bureaucratic capacity or funding.
 *
 * @param fundingLevel - Funding level [0,1]
 * @param bureaucraticCapacity - Bureaucratic capacity [0,1]
 * @param rng - Deterministic RNG function
 * @returns True if enforcement is insufficient
 */
export function isEnforcementInsufficient(
  fundingLevel: number,
  bureaucraticCapacity: number,
  rng: RNGFunction
): boolean {
  // Probability of insufficient enforcement increases with low funding/capacity
  const enforcementQuality = (fundingLevel + bureaucraticCapacity) / 2;
  const failureProbability = assertProbability(
    1 - enforcementQuality,
    {
      location: 'isEnforcementInsufficient',
      valueName: 'failureProbability',
    }
  );

  // 50% of that probability actually leads to insufficient enforcement
  return rng() < (failureProbability * 0.5);
}

/**
 * Determine if loopholes exist
 *
 * More likely with high political polarization (rushed legislation).
 *
 * @param capacity - Government capacity factors
 * @param rng - Deterministic RNG function
 * @returns True if loopholes exist
 */
export function hasLoopholes(
  capacity: GovernmentCapacity,
  rng: RNGFunction
): boolean {
  // Polarization leads to rushed legislation with loopholes
  const loopholeProbability = assertProbability(
    capacity.politicalPolarization * 0.3,
    {
      location: 'hasLoopholes',
      valueName: 'loopholeProbability',
    }
  );

  return rng() < loopholeProbability;
}

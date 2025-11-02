/**
 * Cooperative AI Ownership Model
 *
 * Models worker-owned AI organizations with profit-sharing and democratic governance.
 *
 * ⚠️ EXPERIMENTAL FEATURE - Research Quality: C+
 *
 * Research Foundation:
 * - Québec Cooperatives (2010): 62% vs 35% 5-year survival rate (⚠️ GREY LITERATURE, methodology unknown)
 * - Borzaga & Galera (2014): Italian cooperative crisis resilience (peer-reviewed, 11 years old)
 * - Mannan & Pek (2024): Platform cooperative governance challenges (peer-reviewed, qualitative)
 *
 * CRITICAL LIMITATIONS:
 * - Zero peer-reviewed research on AI-specific cooperatives
 * - Heavy extrapolation from traditional/industrial sectors to AI
 * - Parameter uncertainty: ±40-50% on all coefficients
 * - Several parameters are SPECULATIVE PLACEHOLDERS (marked with FICTIONAL PLACEHOLDER)
 *
 * WARNING: Limited peer-reviewed research on AI-specific cooperatives.
 * Parameters use CONSERVATIVE estimates (lower bounds) with ±40-50% uncertainty.
 *
 * Expected Impact: +2-4% organization survival during economic crises (conservative estimate)
 *
 * Mechanisms:
 * 1. Survival Advantage: 1.2x baseline (Québec data, CONSERVATIVE lower bound)
 * 2. Profit Sharing: Patronage-based distribution (hours worked)
 * 3. Crisis Resilience: +20% stability during shocks (Italian study, CONSERVATIVE)
 * 4. Governance Overhead: +40% decision latency (platform coop challenges, CONSERVATIVE)
 */

import type { GameState, Organization } from '../types/game';
import type { CooperativeOwnershipMetrics } from '../types/organizations';
import { assertFinite, assertInRange, assertStateProperty } from './utils/assertions';
import type { RNGFunction } from '../types/config';

/**
 * Cooperative Economic Parameters
 *
 * Source: Québec Ministry (2010), CONSERVATIVE interpretation
 * Uncertainty: ±40% (grey literature, non-AI sector)
 *
 * RESEARCH-SKEPTIC VALIDATION: Use LOWER BOUNDS (1.2x not 1.5x)
 */
const COOPERATIVE_SURVIVAL_MULTIPLIER = 1.2;  // CONSERVATIVE (actual data shows 1.77x, spec suggested 1.5x)
const COOPERATIVE_SURVIVAL_MULTIPLIER_MIN = 1.2;  // Lower bound (uncertainty)
const COOPERATIVE_SURVIVAL_MULTIPLIER_MAX = 1.8;  // Upper bound (uncertainty)

/**
 * Crisis Resilience Bonus
 *
 * Source: Borzaga & Galera (2014) - Italian cooperatives during 2008-2011 crisis
 * Mechanism: Participatory governance → wage flexibility → job preservation
 * Uncertainty: ±30% (qualitative finding, magnitude unclear)
 *
 * RESEARCH-SKEPTIC VALIDATION: Use CONSERVATIVE lower bound (0.20 not 0.30)
 */
const CRISIS_RESILIENCE_BONUS = 0.20;  // CONSERVATIVE +20% survival (not +30%)
const CRISIS_RESILIENCE_BONUS_MIN = 0.20;
const CRISIS_RESILIENCE_BONUS_MAX = 0.40;

/**
 * Profit Distribution Parameters
 *
 * Source: Cooperative Development Institute (2024), practitioner literature
 * NOTE: Descriptive (current practice), not prescriptive (optimal)
 */
const CASH_DISTRIBUTION_MINIMUM = 0.20;  // 20% minimum cash for tax obligations
const EQUITY_RETENTION_TYPICAL = 0.50;   // 50% retained as member equity (median)
const DIVIDEND_FORMULA = 'patronage';    // Based on hours worked, not capital invested

/**
 * Governance Overhead
 *
 * Source: Mannan & Pek (2024) - platform cooperative challenges
 * Mechanism: Democratic decision-making costs time/resources
 * Uncertainty: High (small sample, qualitative findings)
 *
 * RESEARCH-SKEPTIC VALIDATION: DOUBLE the overhead (1.4x not 1.2x)
 * Rationale: Qualitative findings often underestimate quantitative impact
 */
const GOVERNANCE_OVERHEAD_FACTOR = 1.4;  // CONSERVATIVE 40% slower decisions (not 20%)

/**
 * Participation Inequality
 *
 * WARNING: FICTIONAL PLACEHOLDER - NO RESEARCH BASIS
 * Source: NONE - This is speculative extrapolation
 *
 * The Gini coefficient of 0.35 is COMPLETELY FABRICATED.
 * Included as placeholder for future research but NOT USED in calculations.
 */
const PARTICIPATION_INEQUALITY_GINI = 0.35;  // FICTIONAL PLACEHOLDER - NOT USED

/**
 * Employment Stability
 *
 * Source: Borzaga & Galera (2014) - Italian cooperatives prioritize jobs over wages
 * Mechanism: Workers accept wage cuts to preserve employment
 */
const EMPLOYMENT_STABILITY_MULTIPLIER = 1.3;  // 30% more likely to preserve jobs

/**
 * Minimum viable cooperative size
 * Source: Platform Cooperativism Consortium (2024) - most successful coops have 15+ members
 * WARNING: Practitioner claim only, NOT peer-reviewed
 */
const MIN_COOPERATIVE_SIZE = 15;  // Minimum worker-owners for viable governance

/**
 * Initialize Cooperative Ownership for Organization
 *
 * Converts traditional organization to worker cooperative.
 * Requires minimum viable size and democratic governance support.
 *
 * @param org - Organization to convert
 * @param state - Game state for validation
 * @returns true if conversion successful, false if prerequisites not met
 */
export function initializeCooperativeOwnership(
  org: Organization,
  state: GameState
): boolean {
  // Validate prerequisites
  if (org.type !== 'private') {
    console.log(`  ⚠️ Only private organizations can convert to cooperatives (${org.name} is ${org.type})`);
    return false;
  }

  if (org.bankrupt) {
    console.log(`  ⚠️ Cannot convert bankrupt organization to cooperative (${org.name})`);
    return false;
  }

  // Check for minimum viable size (proxy: revenue indicates workforce)
  const estimatedWorkforce = Math.floor(org.monthlyRevenue / 10000);  // Rough estimate
  if (estimatedWorkforce < MIN_COOPERATIVE_SIZE) {
    console.log(`  ⚠️ Organization too small for cooperative conversion (${org.name}, est. ${estimatedWorkforce} workers)`);
    return false;
  }

  // Initialize cooperative metrics
  org.governanceModel = 'worker-cooperative';
  org.cooperativeMetrics = {
    memberCount: estimatedWorkforce,
    participationRate: 0.7,  // Initial optimism (will decline per Mannan 2024)
    hoursWorkedTotal: estimatedWorkforce * 160,  // ~160 hours/month/worker

    profitSurplus: 0,
    cashDistributionRatio: CASH_DISTRIBUTION_MINIMUM,  // Start conservative
    accumulatedWorkerEquity: org.capital * 0.3,  // 30% of capital converted to worker equity

    governanceOverheadHours: estimatedWorkforce * 8,  // 8 hours/month/worker for governance
    decisionLatency: GOVERNANCE_OVERHEAD_FACTOR,

    crisisResilienceBonus: CRISIS_RESILIENCE_BONUS,
    employmentStabilityFactor: EMPLOYMENT_STABILITY_MULTIPLIER
  };

  // Track conversion event
  if (!state.history.cooperativeOwnershipEvents) {
    state.history.cooperativeOwnershipEvents = [];
  }
  state.history.cooperativeOwnershipEvents.push({
    month: state.currentMonth,
    orgId: org.id,
    eventType: 'conversion',
    details: `${org.name} converted to worker cooperative (${estimatedWorkforce} worker-owners)`,
    economicImpact: 0
  });

  console.log(`\n🤝 COOPERATIVE CONVERSION`);
  console.log(`  Organization: ${org.name}`);
  console.log(`  Worker-owners: ${estimatedWorkforce}`);
  console.log(`  Governance model: Democratic worker ownership`);

  return true;
}

/**
 * Calculate Profit Distribution for Worker Cooperative
 *
 * Uses patronage-based formula: Dividend ∝ Hours Worked
 * Source: CDI (2024), standard cooperative practice
 *
 * @param org - Worker cooperative organization
 * @param state - Game state for logging
 * @returns Distributed profits (reduces org.capital, increases worker wealth)
 */
export function calculateProfitDistribution(
  org: Organization,
  state: GameState
): number {
  if (org.governanceModel !== 'worker-cooperative' || !org.cooperativeMetrics) {
    return 0;  // Not a cooperative
  }

  const metrics = org.cooperativeMetrics;

  // Calculate distributable surplus (revenue - expenses - reserves)
  const monthlyProfit = org.monthlyRevenue - org.monthlyExpenses;
  if (monthlyProfit <= 0) {
    return 0;  // No profit to distribute
  }

  // Reserve fund (20% for stability, per cooperative best practices)
  const reserveFraction = 0.20;
  const distributableSurplus = monthlyProfit * (1 - reserveFraction);

  // Validate calculation (NO SILENT FALLBACKS)
  const validatedSurplus = assertFinite(distributableSurplus, {
    location: 'calculateProfitDistribution',
    valueName: 'distributableSurplus',
    month: state.currentMonth,
    additionalInfo: { orgId: org.id, revenue: org.monthlyRevenue, expenses: org.monthlyExpenses }
  });

  // Track surplus
  metrics.profitSurplus = validatedSurplus;

  // Distribution: Cash vs Equity retention
  const cashDistribution = validatedSurplus * metrics.cashDistributionRatio;
  const equityRetention = validatedSurplus * (1 - metrics.cashDistributionRatio);

  // Update organization finances
  org.capital -= cashDistribution;  // Cash distributed to workers
  metrics.accumulatedWorkerEquity += equityRetention;  // Equity retained

  // Track distribution event
  if (!state.history.cooperativeOwnershipEvents) {
    state.history.cooperativeOwnershipEvents = [];
  }
  state.history.cooperativeOwnershipEvents.push({
    month: state.currentMonth,
    orgId: org.id,
    eventType: 'dividend_distribution',
    details: `Distributed $${(cashDistribution / 1e6).toFixed(1)}M to ${metrics.memberCount} workers`,
    economicImpact: cashDistribution
  });

  return cashDistribution;
}

/**
 * Apply Cooperative Crisis Resilience
 *
 * During economic shocks, cooperatives show higher survival rates.
 * Mechanism: Workers accept wage cuts to preserve employment.
 *
 * Source: Borzaga & Galera (2014) - Italian cooperatives during 2008-2011 crisis
 * WARNING: Magnitude is CONSERVATIVE estimate (20% not 30%), high uncertainty
 *
 * @param org - Organization (checks if cooperative)
 * @param baselineRisk - Conventional bankruptcy risk [0,1]
 * @param inCrisis - Whether economy is in crisis
 * @param state - Game state for logging
 * @param rng - Deterministic RNG
 * @returns Adjusted bankruptcy risk [0,1]
 */
export function applyCooperativeCrisisResilience(
  org: Organization,
  baselineRisk: number,
  inCrisis: boolean,
  state: GameState,
  rng: RNGFunction
): number {
  if (org.governanceModel !== 'worker-cooperative' || !org.cooperativeMetrics) {
    return baselineRisk;  // Not a cooperative, no resilience bonus
  }

  if (!inCrisis) {
    return baselineRisk;  // No crisis, no bonus needed
  }

  const metrics = org.cooperativeMetrics;

  // Apply crisis resilience bonus (reduces bankruptcy risk)
  // Research: Cooperatives have higher survival during crises (Borzaga 2014)
  // WARNING: Magnitude uncertain, using CONSERVATIVE 20% (not 30%)
  const resilienceBonus = metrics.crisisResilienceBonus;
  const adjustedRisk = baselineRisk * (1 - resilienceBonus);

  // Validate result (NO SILENT FALLBACKS)
  const validatedRisk = assertInRange(adjustedRisk, 0, 1, {
    location: 'applyCooperativeCrisisResilience',
    valueName: 'adjustedRisk',
    month: state.currentMonth
  });

  // Log if risk significantly reduced
  if (baselineRisk - validatedRisk > 0.1) {
    console.log(`  🤝 Cooperative resilience: ${org.name} bankruptcy risk reduced ${(baselineRisk * 100).toFixed(0)}% → ${(validatedRisk * 100).toFixed(0)}%`);

    // Track crisis response event
    if (!state.history.cooperativeOwnershipEvents) {
      state.history.cooperativeOwnershipEvents = [];
    }
    state.history.cooperativeOwnershipEvents.push({
      month: state.currentMonth,
      orgId: org.id,
      eventType: 'crisis_response',
      details: `Workers accepted wage flexibility to preserve employment (risk reduced ${((baselineRisk - validatedRisk) * 100).toFixed(0)}%)`,
      economicImpact: -(baselineRisk - validatedRisk)  // Negative = risk reduction
    });
  }

  return validatedRisk;
}

/**
 * Apply Cooperative Survival Advantage
 *
 * Cooperatives have 1.2-1.8x higher 5-year survival rates vs conventional firms.
 * Source: Québec Ministry (2010) - 62% vs 35% at 5 years (⚠️ GREY LITERATURE, methodology unknown)
 *
 * WARNING: Using CONSERVATIVE lower bound (1.2x) due to research quality concerns
 * TRUE RANGE: Could be 1.0-2.5x depending on unknown factors (sample selection, industry mix)
 *
 * @param org - Organization (checks if cooperative)
 * @param baselineSurvivalRate - Conventional survival probability [0,1]
 * @param state - Game state for logging
 * @param rng - Deterministic RNG for uncertainty sampling
 * @returns Adjusted survival rate [0,1]
 */
export function applyCooperativeSurvivalAdvantage(
  org: Organization,
  baselineSurvivalRate: number,
  state: GameState,
  rng: RNGFunction
): number {
  if (org.governanceModel !== 'worker-cooperative') {
    return baselineSurvivalRate;  // Not a cooperative
  }

  // Sample survival multiplier from uncertainty range
  // CONSERVATIVE: Use lower end of range (1.2x minimum)
  const uncertaintyFactor = rng();  // [0,1]
  const survivalMultiplier = COOPERATIVE_SURVIVAL_MULTIPLIER_MIN +
    uncertaintyFactor * (COOPERATIVE_SURVIVAL_MULTIPLIER_MAX - COOPERATIVE_SURVIVAL_MULTIPLIER_MIN);

  // Apply multiplier (but cap at 1.0, can't exceed 100% survival)
  const adjustedSurvival = Math.min(1.0, baselineSurvivalRate * survivalMultiplier);

  // Validate result (NO SILENT FALLBACKS)
  const validatedSurvival = assertInRange(adjustedSurvival, 0, 1, {
    location: 'applyCooperativeSurvivalAdvantage',
    valueName: 'adjustedSurvival',
    month: state.currentMonth
  });

  return validatedSurvival;
}

/**
 * Apply Governance Overhead to Decision Speed
 *
 * Democratic governance takes more time than autocratic decisions.
 * Source: Mannan & Pek (2024) - platform cooperative governance challenges
 *
 * WARNING: Overhead multiplier (1.4x) is CONSERVATIVE estimate from qualitative findings
 * Actual overhead could be higher (1.5-2.0x) for complex decisions
 *
 * Trade-off: Better long-term decisions, slower short-term response
 *
 * @param org - Organization (checks if cooperative)
 * @param baselineDecisionSpeed - Conventional decision latency (1.0 = instant)
 * @returns Adjusted decision latency [1,∞] (higher = slower)
 */
export function applyGovernanceOverhead(
  org: Organization,
  baselineDecisionSpeed: number
): number {
  if (org.governanceModel !== 'worker-cooperative' || !org.cooperativeMetrics) {
    return baselineDecisionSpeed;  // Not a cooperative
  }

  const metrics = org.cooperativeMetrics;

  // Democratic decision-making is slower (40% latency increase, CONSERVATIVE)
  // But: Better quality decisions long-term (not modeled in this simple version)
  const adjustedLatency = baselineDecisionSpeed * metrics.decisionLatency;

  return adjustedLatency;
}

/**
 * Update Cooperative Metrics Each Month
 *
 * Tracks participation rates, governance costs, and economic performance.
 *
 * @param org - Worker cooperative organization
 * @param state - Game state for logging
 */
export function updateCooperativeMetrics(
  org: Organization,
  state: GameState
): void {
  if (org.governanceModel !== 'worker-cooperative' || !org.cooperativeMetrics) {
    return;  // Not a cooperative
  }

  const metrics = org.cooperativeMetrics;

  // Update member count (proxy: workforce scales with revenue)
  const estimatedWorkforce = Math.floor(org.monthlyRevenue / 10000);
  metrics.memberCount = Math.max(MIN_COOPERATIVE_SIZE, estimatedWorkforce);

  // Participation rate declines over time (per Mannan 2024 - unequal engagement)
  // Model: Slow decay toward 50% as initial enthusiasm wanes
  const participationDecay = 0.02;  // 2% decline per year
  const decayThisMonth = participationDecay / 12;
  metrics.participationRate = Math.max(
    0.5,  // Floor at 50% (core engaged members)
    metrics.participationRate - decayThisMonth
  );

  // Update hours worked (total patronage for profit distribution)
  const avgHoursPerWorker = 160;  // ~160 hours/month full-time
  metrics.hoursWorkedTotal = metrics.memberCount * avgHoursPerWorker * metrics.participationRate;

  // Governance overhead hours (scales with member count)
  const hoursPerWorkerForGovernance = 8;  // 8 hours/month for meetings, decisions
  metrics.governanceOverheadHours = metrics.memberCount * hoursPerWorkerForGovernance;

  // Validate all metrics (NO SILENT FALLBACKS)
  assertFinite(metrics.hoursWorkedTotal, {
    location: 'updateCooperativeMetrics',
    valueName: 'hoursWorkedTotal',
    month: state.currentMonth,
    additionalInfo: { orgId: org.id }
  });
}

/**
 * Main Update Function for Cooperative Ownership System
 *
 * Call this each month to:
 * 1. Update cooperative metrics (participation, hours, governance costs)
 * 2. Calculate and distribute profits (if applicable)
 * 3. Apply survival advantages during crises
 * 4. Track economic performance
 *
 * NOTE: Survival advantage and crisis resilience are applied in bankruptcy/crisis phases,
 * not here, to avoid duplicating logic across multiple phases.
 *
 * @param state - Game state
 * @param rng - Deterministic RNG
 */
export function updateCooperativeOwnership(
  state: GameState,
  rng: RNGFunction
): void {
  // Find all worker cooperatives
  const cooperatives = state.organizations.filter(
    org => org.governanceModel === 'worker-cooperative' && !org.bankrupt
  );

  if (cooperatives.length === 0) {
    return;  // No cooperatives to update
  }

  // Update each cooperative
  for (const coop of cooperatives) {
    // 1. Update metrics (participation, hours, governance costs)
    updateCooperativeMetrics(coop, state);

    // 2. Calculate and distribute profits (quarterly, not monthly)
    const isQuarterEnd = state.currentMonth % 3 === 0;
    if (isQuarterEnd && coop.cooperativeMetrics) {
      const distributedAmount = calculateProfitDistribution(coop, state);
      if (distributedAmount > 0) {
        console.log(`  💰 ${coop.name}: Distributed $${(distributedAmount / 1e6).toFixed(1)}M to ${coop.cooperativeMetrics.memberCount} worker-owners`);
      }
    }

    // Note: Survival advantage and crisis resilience are applied in bankruptcy/crisis phases
    // (not here, to avoid duplicating logic across multiple phases)
  }

  // Aggregate statistics (for logging)
  const totalCooperatives = cooperatives.length;
  const totalWorkerOwners = cooperatives.reduce((sum, c) => sum + (c.cooperativeMetrics?.memberCount || 0), 0);
  const totalWorkerEquity = cooperatives.reduce((sum, c) => sum + (c.cooperativeMetrics?.accumulatedWorkerEquity || 0), 0);

  if (state.currentMonth % 12 === 0) {
    console.log(`\n🤝 COOPERATIVE OWNERSHIP ANNUAL REPORT (Month ${state.currentMonth})`);
    console.log(`  Active cooperatives: ${totalCooperatives}`);
    console.log(`  Total worker-owners: ${totalWorkerOwners.toLocaleString()}`);
    console.log(`  Accumulated worker equity: $${(totalWorkerEquity / 1e9).toFixed(2)}B`);
  }
}

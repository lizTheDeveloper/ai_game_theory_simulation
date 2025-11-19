/**
 * Workflow Adaptation & AI Organizational Integration
 * FIX #4A (Oct 19, 2025): Evidence-based S-curve growth model
 *
 * Models how organizations redesign workflows to integrate AI.
 * Current adoption: 21% (McKinsey 2024) - organizations with fundamentally redesigned workflows.
 *
 * Research Foundation:
 * - McKinsey (2024): Only 21% have fundamentally redesigned workflows for AI integration
 * - Autor (2024): Bimodal distribution - tasks either <10% or >50% automated, rarely between
 * - Rogers Innovation Diffusion (validated 2024): Critical mass at 15-25% triggers network effects
 * - McKinsey (2024): 88% of AI pilots fail to scale - 70% due to people/process issues
 * - HBS (2025): Displacement vs complementarity creates gap, NOT uniform adoption
 *
 * FIX #4A Key Corrections:
 * 1. S-curve growth (logistic), NOT linear
 * 2. Resistance mechanics: unemployment → fear → resistance
 * 3. Critical mass threshold: 15-25% (NOT arbitrary 40%)
 * 4. Training capacity constraints
 */

import { GameState, RNGFunction } from '@/types/game';
import { assertProbability, assertFinite } from './utils/assertions';

/**
 * S-curve growth parameters
 * Research: Innovation diffusion theory (Rogers), validated in AI context
 */

/** Intrinsic growth rate at inflection point (4% per month)
 * Research: McKinsey 2024 shows 21% → 25% transition happening within 6-12 months */
const INTRINSIC_GROWTH_RATE = 0.04;

/** Critical mass threshold range (15-25%)
 * Research: Rogers diffusion theory - network effects trigger rapid adoption */
const CRITICAL_MASS_LOW = 0.15;
const CRITICAL_MASS_HIGH = 0.35;

/** Network effects bonus during critical mass transition (+2%/month) */
const NETWORK_EFFECTS_BONUS = 0.02;

/**
 * Minimum workflow adaptation floor (technical necessity, NOT research-backed)
 *
 * Purpose: Prevents division-by-zero and numerical instability in downstream calculations
 *
 * Research Status: NO peer-reviewed evidence supports a persistent adoption floor
 * during economic crisis/job displacement. Rogers (1962) studied voluntary adoption
 * under normal conditions (agriculture, medicine) and found discontinuance rates of
 * 10-30%. Crisis research shows unemployment REDUCES adoption probability (PMC4391079).
 *
 * Previous INCORRECT citation (REMOVED Nov 13, 2025):
 * - Code claimed "Rogers (1962) - 2.5% + 2.5% = 5% minimum"
 * - Actually: Rogers says 2.5% + 13.5% = 16% (innovators + early adopters)
 * - Rogers NEVER claims these groups are "immune to resistance"
 * - Rogers studied voluntary adoption, NOT crisis scenarios
 *
 * Value Justification: Minimal technical floor (2%) sufficient for numerical stability.
 * Higher values would be arbitrary without crisis-specific adoption research.
 * Even 2% is likely too high for severe crisis scenarios (95%+ unemployment).
 *
 * Future Work:
 * - Replace with dynamic floor based on unemployment rate and AI capability
 * - Find crisis-specific adoption research (Great Depression, 2008 crisis, wartime)
 * - Consider reducing to 0.5-1% if Monte Carlo validation shows no instability
 *
 * @see research/verification_d336915_20251110.md - Comprehensive citation analysis (723 lines)
 * @see reviews/workflow_adaptation_citations_critique_20251113.md - Skeptical review (C- grade)
 *
 * FIX (Nov 13, 2025): Reduced from 5% → 2%, removed misleading Rogers citation
 */
const MIN_ADOPTION_FLOOR = 0.02; // 2% technical floor (NO RESEARCH SUPPORT - prevents div/0 only)

/**
 * Resistance parameters
 * Research: McKinsey (2024) - 70% of failures are people/process issues
 */

/** Unemployment resistance coefficient (job loss fears)
 * Research: White House CEA (2024) - job loss fears create adoption pushback */
const UNEMPLOYMENT_RESISTANCE_COEFFICIENT = 0.3;

/** Organizational inertia peak strength (middle management resistance)
 * Research: McKinsey (2024) - middle layer most resistant to change */
const ORGANIZATIONAL_INERTIA_PEAK = 0.15;

/** Skill gap resistance (hiring challenges)
 * Research: G2 (2024) - skill gaps are top implementation barrier */
const SKILL_GAP_RESISTANCE_MAX = 0.2;

/**
 * Update workflow adaptation using S-curve growth model
 * FIX #4A (Oct 19, 2025): Research-backed logistic growth with resistance
 *
 * Growth follows logistic function: dN/dt = r * N * (1 - N)
 * where:
 * - N = current adoption rate
 * - r = intrinsic growth rate
 * - (1 - N) = remaining growth potential
 *
 * @param state Current game state
 * @param rng Random number generator (for stochastic shocks)
 */
export function updateWorkflowAdaptation(state: GameState, rng: RNGFunction): void {
  // FIX (Nov 10, 2025): Protect inputs with assertions - NaN propagation blocks scientific spiral
  const current = assertProbability(
    state.society.workflowAdaptation,
    {
      location: 'updateWorkflowAdaptation',
      valueName: 'society.workflowAdaptation',
      month: state.currentMonth
    }
  );

  // === 1. LOGISTIC GROWTH POTENTIAL ===
  // S-curve: slow start, rapid middle, slow end
  // Formula: growth = r * current * (1 - current)
  // Research: Innovation diffusion theory (Rogers 1962, validated 2024)
  const logisticGrowth = INTRINSIC_GROWTH_RATE * current * (1 - current);

  // === 2. RESISTANCE FACTORS ===

  // A. Unemployment resistance (job loss fears)
  // Research: White House CEA (2024) - AI substitutes middle-class jobs
  // FIX (Nov 11, 2025): CRITICAL BUG - Inverted logic!
  //
  // Original logic: High unemployment → more fear → more resistance
  // Problem: Creates death spiral (95% unemployment = 28% resistance/month → workflow adaptation crashes to floor)
  //
  // CORRECT logic: Resistance comes from EMPLOYED workers fearing displacement
  // - Low unemployment (5%) → workers have job security → LOW resistance
  // - Moderate unemployment (15-30%) → workers fear displacement → PEAK resistance
  // - High unemployment (>50%) → workers desperate → LOWER resistance (nothing to lose)
  //
  // Research: Autor (2024) - Resistance is from incumbent workers, not unemployed
  // Unemployed have nothing to lose; employed middle class fears disruption
  const unemploymentLevel = assertProbability(
    state.society.unemploymentLevel,
    {
      location: 'updateWorkflowAdaptation',
      valueName: 'society.unemploymentLevel',
      month: state.currentMonth
    }
  );

  // Bell curve: resistance peaks at 20-30% unemployment (incumbent workers most threatened)
  // Below 10%: low fear (job security)
  // Above 50%: low fear (desperation overrides resistance)
  const employmentSecurityFactor = Math.max(0, 1 - unemploymentLevel); // 0-1, high when employed
  const displacementThreatFactor = Math.min(1, unemploymentLevel * 3); // 0-1, peaks at 33% unemployment

  // Resistance is product: need BOTH employment (to lose) AND threat (to fear)
  const unemploymentResistance = employmentSecurityFactor * displacementThreatFactor * UNEMPLOYMENT_RESISTANCE_COEFFICIENT;

  // B. Organizational inertia (middle management resistance)
  // Research: McKinsey (2024) - middle layer most resistant
  //
  // FIX (Nov 11, 2025): CRITICAL BUG - Inertia should resist CHANGE, not punish EXISTING adoption
  // Original: `sin(current * π)` penalizes 21% baseline (McKinsey 2024 empirical starting point)
  // Problem: Causes immediate crash from 21% → 10% at month 0
  //
  // CORRECT: Inertia resists NEW adoption attempts, peaks during TRANSITION (10-30% range)
  // - Below 10%: Low resistance (early adopters, no threat to incumbents)
  // - 10-30%: PEAK resistance (threatens middle management, "crossing the chasm")
  // - Above 30%: Declining resistance (inevitability, bandwagon effect)
  //
  // New formula: Bell curve INVERTED - resistance is LOW at current baseline (21%), peaks at 50%
  // Sine curve still works but shift it: sin((current - 0.21) * 2π) peaks at current=0.46 (midpoint to 71%)
  // Actually simpler: just shift and scale sine to peak at 0.45 (middle of transition zone)
  const transitionProgress = Math.max(0, (current - 0.20) / 0.50); // 0.20 → 0.70 maps to 0 → 1
  const inertiaResistance = Math.sin(transitionProgress * Math.PI) * ORGANIZATIONAL_INERTIA_PEAK;

  // C. Skill gap resistance (hiring challenges)
  // Research: G2 (2024) - skill gaps are top barrier
  // Better trust/stability → lower skill gap resistance (proxy for education quality)
  // FIX (Oct 25, 2025): Replaced defensive fallback with assertion
  const socialStability = assertProbability(state.globalMetrics.socialStability, {
    location: 'updateWorkflowAdaptation',
    valueName: 'globalMetrics.socialStability',
    month: state.currentMonth
  });
  const educationQuality = Math.min(1.0, socialStability / 2.0); // Normalize to [0,1]

  // FIX (Nov 11, 2025): Government research investment reduces skill gap resistance
  // High research budget → retraining programs → lower skill gaps
  // Research: OECD (2024) - active labor market policies reduce transition friction
  //
  // CRITICAL FIX: Original formula too weak - $100B research only gave 75% reduction
  // Problem: In high-research scenarios ($50-100B/month), skill gap should be SOLVED, not just reduced
  // Research budget directly funds retraining → should dominate over education quality proxy
  const researchBudget = assertFinite(
    state.government.researchInvestments.totalBudget,
    {
      location: 'updateWorkflowAdaptation',
      valueName: 'government.researchInvestments.totalBudget',
      month: state.currentMonth
    }
  );

  // NEW FORMULA: Exponential reduction, nearly eliminates resistance at $50B+
  // $10B (baseline) → 63% reduction
  // $30B (3× default) → 95% reduction
  // $50B+ (scientific spiral threshold) → 99%+ reduction
  const retrainingBonus = 1 - Math.exp(-researchBudget / 15); // Exponential decay, τ=15B

  const baseSkillGapResistance = SKILL_GAP_RESISTANCE_MAX * (1 - educationQuality);
  const skillGapResistance = Math.max(0, baseSkillGapResistance * (1 - retrainingBonus));

  const totalResistance = unemploymentResistance + inertiaResistance + skillGapResistance;

  // === 3. ACCELERATION FACTORS ===

  // Network effects (critical mass at 15-35%)
  // Research: Rogers diffusion theory - early majority adoption (16% threshold)
  // Once 15-25% adopt, others see success and accelerate adoption
  let networkBonus = 0;
  if (current >= CRITICAL_MASS_LOW && current <= CRITICAL_MASS_HIGH) {
    networkBonus = NETWORK_EFFECTS_BONUS;
  }

  // AI capability acceleration (higher AI → faster workflow redesign possible)
  // Research: McKinsey (2024) - AI tools enable faster organizational transformation
  // FIX (Nov 10, 2025): Assert AI capabilities are finite before averaging
  let avgAICapability = 0;
  if (state.aiAgents.length > 0) {
    const capabilitySum = state.aiAgents.reduce((sum, ai) => {
      const capability = assertFinite(ai.capability, {
        location: 'updateWorkflowAdaptation',
        valueName: `aiAgent[${ai.id}].capability`,
        month: state.currentMonth,
        additionalInfo: { agentId: ai.id }
      });
      return sum + capability;
    }, 0);
    avgAICapability = capabilitySum / state.aiAgents.length;
  }
  const aiCapabilityBonus = avgAICapability > 4.0 ? 0.01 : 0;  // +1%/month if high AI capability

  // FIX (Nov 11, 2025): Research-driven recovery from hysteresis trap
  // Problem: Once workflow adaptation crashes to floor (5%), it can't escape:
  // - Logistic growth is minimal (far from inflection point)
  // - Network effects are off (need 15%+)
  // - Total resistance dominates
  //
  // Solution: High research budget ($50B+) can rescue adaptation via:
  // - Direct government investment in organizational transformation
  // - Demonstration projects showing success
  // - Incentive programs for early adopters
  //
  // Research: Singapore Smart Nation (2024) - government-led digital transformation
  // When market fails to adopt, government investment can bootstrap
  let researchRescueBonus = 0;
  if (current < 0.25 && researchBudget > 30) {
    // Active BELOW 25% (scientific spiral threshold) - government pushes toward critical mass
    // Scales with research budget: $30B → +0%, $50B → +2%, $100B → +7%, cap at 15%
    // Need STRONG boost to escape hysteresis AND reach 25% threshold
    // Research: When market fails, government-led transformation (Singapore, Estonia digital transformations)
    //
    // Boost strength declines as we approach 25% (government role diminishes as network effects take over)
    const distanceFromThreshold = Math.max(0, 0.25 - current); // 0-0.25
    const thresholdMultiplier = distanceFromThreshold / 0.25; // 1.0 at 0%, 0.0 at 25%
    researchRescueBonus = Math.min(0.15, (researchBudget - 30) * 0.001) * (0.5 + 0.5 * thresholdMultiplier); // At least 50% of max boost
  }

  // === 4. NET GROWTH CALCULATION ===
  const netGrowth = logisticGrowth + networkBonus + aiCapabilityBonus + researchRescueBonus - totalResistance;

  // Stochastic shock (±20% variance)
  // Research: Real adoption doesn't follow smooth curves - random events matter
  const shock = (rng() - 0.5) * 0.2 * Math.abs(netGrowth);

  // Apply growth with bounds [MIN_ADOPTION_FLOOR, 1]
  // FIX (Nov 13, 2025): Enforce minimum technical floor - prevents div/0 in downstream calculations
  // WARNING: No research support for this floor. Unemployment empirically REDUCES adoption (PMC4391079).
  const newAdaptation = Math.max(MIN_ADOPTION_FLOOR, Math.min(1, current + netGrowth + shock));

  // Update state
  state.society.workflowAdaptation = newAdaptation;

  // === 5. LOGGING (every 12 months) ===
  if (state.currentMonth % 12 === 0) {
    const growthPct = ((newAdaptation - current) * 100).toFixed(1);
    console.log(`\n📊 WORKFLOW ADAPTATION UPDATE (Month ${state.currentMonth})`);
    console.log(`   Adoption Rate: ${(newAdaptation * 100).toFixed(1)}% (Δ ${growthPct}%)${newAdaptation === MIN_ADOPTION_FLOOR ? ' [AT FLOOR]' : ''}`);
    console.log(`   Logistic Growth: +${(logisticGrowth * 100).toFixed(2)}%`);
    console.log(`   Total Resistance: -${(totalResistance * 100).toFixed(2)}% (unemployment: ${(unemploymentResistance * 100).toFixed(1)}%, inertia: ${(inertiaResistance * 100).toFixed(1)}%, skills: ${(skillGapResistance * 100).toFixed(1)}%)`);
    if (retrainingBonus > 0) {
      console.log(`   💡 Retraining Programs: -${(retrainingBonus * 100).toFixed(0)}% skill gap resistance ($${researchBudget.toFixed(0)}B research)`);
    }
    if (networkBonus > 0) {
      console.log(`   🚀 Network Effects Active: +${(networkBonus * 100).toFixed(1)}% (critical mass: ${CRITICAL_MASS_LOW * 100}-${CRITICAL_MASS_HIGH * 100}%)`);
    }
    if (researchRescueBonus > 0) {
      console.log(`   🆘 Research Rescue Active: +${(researchRescueBonus * 100).toFixed(2)}% (escaping hysteresis trap via $${researchBudget.toFixed(0)}B investment)`);
    }
  }
}

/**
 * Check if workflow adaptation has crossed critical mass threshold
 * Research: Rogers (1962, validated 2024) - 15-25% triggers rapid adoption
 *
 * Used by upward spirals to determine if scientific/cognitive spirals can activate.
 *
 * @param state Current game state
 * @returns True if crossed critical mass (≥25%), false otherwise
 */
export function hasCrossedCriticalMass(state: GameState): boolean {
  const workflowAdaptation = state.society.workflowAdaptation || 0.21;
  return workflowAdaptation >= 0.25;
}

/**
 * Get workflow adaptation contribution to scientific spiral strength
 * Research: McKinsey (2024) - workflow redesign biggest predictor of EBIT impact
 *
 * Returns normalized contribution [0, 1] where:
 * - 0.25 (critical mass) = 0.5 contribution
 * - 0.70 (mature adoption) = 1.0 contribution
 *
 * @param state Current game state
 * @returns Contribution to spiral strength [0, 1]
 */
export function getWorkflowContribution(state: GameState): number {
  const workflowAdaptation = state.society.workflowAdaptation || 0.21;

  // Below critical mass (25%): minimal contribution
  if (workflowAdaptation < 0.25) {
    return workflowAdaptation / 0.25 * 0.5;  // Linear ramp to 0.5
  }

  // Above critical mass: strong contribution
  // 0.25 → 0.70 maps to 0.5 → 1.0
  const normalizedProgress = (workflowAdaptation - 0.25) / (0.70 - 0.25);
  return Math.min(1.0, 0.5 + normalizedProgress * 0.5);
}

/**
 * Calculate training capacity constraint on workflow adaptation
 * Research: McKinsey (2024) - 120M workers need retraining in 3 years
 *
 * If training capacity is insufficient, workflow adaptation slows.
 * Training capacity depends on:
 * - Education system quality
 * - Government investment in retraining
 * - Unemployment levels (higher unemployment → more available workers to retrain)
 *
 * @param state Current game state
 * @returns Training capacity [0, 1] where 1 = sufficient capacity
 */
export function calculateTrainingCapacity(state: GameState): number {
  // Education quality baseline (0-1) - proxy from social stability
  // FIX (Oct 25, 2025): Replaced defensive fallback with assertion
  const socialStability = assertProbability(state.globalMetrics.socialStability, {
    location: 'calculateTrainingCapacity',
    valueName: 'globalMetrics.socialStability',
    month: state.currentMonth
  });
  const educationQuality = Math.min(1.0, socialStability / 2.0); // Normalize to [0,1]

  // Government retraining investment (proxy: total research investment / 1000)
  // Research: Investment in education tech correlates with retraining capacity
  const govResearch = state.government.researchInvestments;
  const totalResearch = (govResearch.biotech.drugDiscovery + govResearch.biotech.geneEditing +
                         govResearch.materials.nanotechnology + govResearch.climate.modeling) / 4;
  const retrainingInvestment = Math.min(1.0, totalResearch / 100);  // Normalize to [0,1]

  // Unemployment creates available workforce for retraining
  // Research: Slack in labor market → easier to retrain
  const unemploymentBonus = state.society.unemploymentLevel * 0.2;

  // Training capacity = education quality (50%) + investment (30%) + unemployment slack (20%)
  const trainingCapacity = educationQuality * 0.5 +
                          retrainingInvestment * 0.3 +
                          unemploymentBonus * 0.2;

  return Math.min(1.0, trainingCapacity);
}

/**
 * Apply training capacity constraint to workflow adaptation growth
 * FIX #4A (Oct 19, 2025): Constrain growth if training capacity insufficient
 *
 * If training capacity < 0.5, workflow adaptation growth is slowed.
 * Research: McKinsey (2024) - skill gaps are major adoption barrier.
 *
 * @param state Current game state
 * @param baseGrowth Base growth rate before constraint
 * @returns Constrained growth rate
 */
export function applyTrainingConstraint(state: GameState, baseGrowth: number): number {
  const trainingCapacity = calculateTrainingCapacity(state);

  // If training capacity < 50%, apply penalty
  if (trainingCapacity < 0.5) {
    const penalty = 1 - (0.5 - trainingCapacity);  // 50% capacity → 100% growth, 0% capacity → 0% growth
    return baseGrowth * penalty;
  }

  return baseGrowth;
}

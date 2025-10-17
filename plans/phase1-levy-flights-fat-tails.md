# Phase 1: Lévy Flights - Fat-Tailed Distributions

**Date:** October 17, 2025
**Source:** Modeling contingency and agency debate (research-skeptic + super-alignment-researcher consensus)
**Status:** IMMEDIATE PRIORITY - After TIER 0D
**Effort:** 2-4 hours
**Research Confidence:** 90% (Lévy flights well-validated in empirical data)

---

## Problem Statement

**Seed Convergence Indicates Determinism:**

Current Monte Carlo runs show 80-90% convergence across different seeds:
- Same outcome category (dystopia/status quo/extinction)
- Key metrics converge to narrow bands (AI alignment 0.62-0.68, environmental debt similar rates ±10%)
- Divergence only in TIMING (month 80 vs 95), not TRAJECTORY

**Root Cause:** Our simulation uses **uniform/Gaussian randomness** which doesn't capture real-world fat-tailed distributions.

**Real-World Evidence:**
- Natural systems: Earthquakes, city sizes, wealth distribution follow **power laws**
- Social systems: Pandemic spread, financial crashes, scientific revolutions show **fat tails**
- Technological breakthroughs: Most incremental, rare ones transformative (6-sigma events happen 1000× more often than Gaussian predicts)

---

## Research Foundation

### Power-Law Distributions in Empirical Data

**Clauset, Shalizi & Newman (2009)**, *SIAM Review*: "Power-Law Distributions in Empirical Data"
- **Finding:** Natural and social systems follow POWER LAWS, not normal distributions
- **Examples:** Earthquake magnitudes, city sizes, wealth distribution, pandemic spread
- **Key equation:** P(X > x) ~ x^(-α) where α ≈ 2-3 (vs Gaussian's exponential decay)
- **Implication:** "6-sigma events" happen 1000× more often than Gaussian predicts

### Self-Organized Criticality

**Bak, Tang & Wiesenfeld (1987)**, *Physical Review Letters*: "Self-organized criticality"
- **Finding:** Complex systems naturally evolve to CRITICAL STATES where minor events trigger avalanches
- **Examples:** Sandpiles, forest fires, financial crashes, species extinctions
- **Mechanism:** Systems organize to edge of chaos → small perturbations can cascade
- **Implication:** You CAN'T predict WHICH grain of sand triggers avalanche, only that avalanches WILL occur

### Lévy Flights in Natural Systems

**Mantegna & Stanley (1994)**, *Physical Review Letters*: "Stochastic Process with Ultraslow Convergence to a Gaussian: The Truncated Lévy Flight"
- **Finding:** Financial returns follow Lévy stable distributions (fat tails)
- **Application:** Asset price movements, volatility clustering

**Brockmann et al. (2006)**, *Nature*: "The scaling laws of human travel"
- **Finding:** Human mobility uses Lévy flights (relevant for pandemic spread)
- **Pattern:** Mostly local movements, rare long-distance jumps

**Reynolds & Frye (2007)**, *Science*: "Free-Flight Odor Tracking in Drosophila Is Consistent with an Optimal Intermittent Scale-Free Search"
- **Finding:** Animal foraging optimized by Lévy flights
- **Implication:** Lévy patterns emerge across biological systems

---

## Implementation Design

### Core Lévy Flight Function

```typescript
/**
 * Generates a Lévy flight random value with power-law tail distribution.
 *
 * Lévy flights produce fat-tailed distributions where extreme events
 * occur more frequently than in Gaussian distributions.
 *
 * @param alpha - Tail exponent (1.5-3.0)
 *   - alpha = 1.5: Very fat tails (extreme events common) - financial crashes
 *   - alpha = 2.0: Moderate fat tails (occasional breakthroughs) - AI capabilities
 *   - alpha = 2.5: Less extreme (rare rapid adoption) - technology diffusion
 *   - alpha > 3.0: Converges to Gaussian (not what we want)
 * @param rng - Random number generator function (for deterministic seeding)
 * @returns Random value from Lévy distribution
 *
 * Research: Mantegna & Stanley (1994), Clauset et al. (2009)
 */
function levyFlight(alpha: number, rng: () => number): number {
  // Pareto distribution: P(x) ~ x^(-alpha)
  // Inverse transform sampling: x = u^(-1/alpha)
  const u = rng();

  // Ensure u > 0 to avoid division by zero
  const safeU = Math.max(u, 1e-10);

  return Math.pow(safeU, -1 / alpha);
}

/**
 * Bounded Lévy flight for use in probabilities/multipliers.
 * Maps Lévy output to [min, max] range.
 */
function boundedLevyFlight(
  alpha: number,
  rng: () => number,
  min: number,
  max: number
): number {
  const levy = levyFlight(alpha, rng);

  // Normalize to [0, 1] range using sigmoid-like transformation
  const normalized = 1 - Math.exp(-levy / 10);

  // Scale to [min, max]
  return min + normalized * (max - min);
}
```

### Application 1: AI Capability Breakthroughs

**Current Implementation (BROKEN):**
```typescript
// src/simulation/aiAgent.ts (line ~450)
// Current: Gaussian-like uniform random
if (rng() > 0.95) {
  // Breakthrough occurs (5% chance)
  capability += 0.1;
}
```

**New Implementation (POWER LAW):**
```typescript
import { levyFlight } from './utils/levyDistributions';

// Alpha = 2.0: Moderate fat tails (occasional transformative breakthroughs)
const breakthroughMagnitude = levyFlight(2.0, rng);

// Most breakthroughs are small (0.01-0.05), rare ones are large (0.2-0.5)
if (breakthroughMagnitude > 5.0) {
  // Transformative breakthrough (rare)
  const capabilityGain = Math.min(breakthroughMagnitude / 20, 0.5);
  capability += capabilityGain;

  console.log(`  🚀 TRANSFORMATIVE BREAKTHROUGH: +${(capabilityGain * 100).toFixed(1)}% capability`);
} else if (breakthroughMagnitude > 2.0) {
  // Incremental breakthrough (common)
  const capabilityGain = breakthroughMagnitude / 50;
  capability += capabilityGain;
}
```

### Application 2: Environmental Cascades

**Current Implementation (LINEAR):**
```typescript
// src/simulation/environmental.ts
// Current: Linear accumulation
environmentalDebt += 0.1 * pollutionRate;
```

**New Implementation (SELF-ORGANIZED CRITICALITY):**
```typescript
import { levyFlight } from './utils/levyDistributions';

// Linear accumulation most of the time
environmentalDebt += 0.1 * pollutionRate;

// Check for critical threshold (self-organized criticality)
const criticalThreshold = 0.6; // System at edge of chaos

if (environmentalDebt > criticalThreshold) {
  // Alpha = 1.8: Fatter tails (rare mega-cascades like 2008 crash)
  const cascadeMagnitude = levyFlight(1.8, rng);

  if (cascadeMagnitude > 10.0) {
    // Mega-cascade (rare but devastating)
    const cascadeSize = Math.min(cascadeMagnitude / 100, 0.3);
    environmentalDebt += cascadeSize;

    console.log(`  ⚠️ ENVIRONMENTAL MEGA-CASCADE: +${(cascadeSize * 100).toFixed(1)}% debt`);
    console.log(`     Triggered at ${(environmentalDebt * 100).toFixed(1)}% debt level`);
  }
}
```

### Application 3: Technology Adoption Curves

**Current Implementation (S-CURVE):**
```typescript
// src/simulation/breakthroughTechnologies.ts
// Current: Logistic S-curve (deterministic)
adoptionRate = 1 / (1 + Math.exp(-k * (t - t0)));
```

**New Implementation (LÉVY-MODIFIED S-CURVE):**
```typescript
import { boundedLevyFlight } from './utils/levyDistributions';

// Base S-curve
const baseCurve = 1 / (1 + Math.exp(-k * (t - t0)));

// Alpha = 2.5: Less extreme (gradual then rare rapid diffusion)
// Add stochastic variation with fat tails
const levyModifier = boundedLevyFlight(2.5, rng, 0.8, 1.5);

adoptionRate = Math.min(baseCurve * levyModifier, 1.0);

// This produces:
// - Most tech: Smooth S-curve (smartphones took 10 years)
// - Rare tech: Explosive adoption (ChatGPT hit 100M users in 2 months)
```

### Application 4: Social Movement Cascades

**Current Implementation (GRADUAL):**
```typescript
// src/simulation/socialCohesion.ts
// Current: Linear mobilization
mobilization += 0.05 * grievance;
```

**New Implementation (KURAN CASCADE):**
```typescript
import { levyFlight } from './utils/levyDistributions';

// Kuran (1991) preference falsification model
// Most of the time: gradual mobilization
mobilization += 0.01 * grievance;

// Critical juncture detection (high grievance + low info integrity)
const latentOpposition = Math.max(0, 0.6 - qualityOfLife);
const pluralisticIgnorance = 1 - informationIntegrity;

if (latentOpposition > 0.3 && pluralisticIgnorance > 0.5) {
  // Alpha = 1.8: Fat tails (rare cascades like Arab Spring)
  const cascadePotential = levyFlight(1.8, rng);

  if (cascadePotential > 15.0) {
    // Information cascade triggered (Leipzig 1989 mechanism)
    const cascadeSize = Math.min(cascadePotential / 100, 0.4);
    mobilization += cascadeSize;

    console.log(`  📢 PREFERENCE FALSIFICATION CASCADE`);
    console.log(`     Latent opposition: ${(latentOpposition * 100).toFixed(1)}%`);
    console.log(`     Mobilization jump: +${(cascadeSize * 100).toFixed(1)}%`);
  }
}
```

### Application 5: Financial Crashes

**Current Implementation (NONE - gradual economic decline):**

**New Implementation (MINSKY MOMENT):**
```typescript
import { levyFlight } from './utils/levyDistributions';

// Financial fragility accumulation (Minsky's hypothesis)
financialFragility += 0.02 * (debtGrowth - gdpGrowth);

// Check for crash potential
if (financialFragility > 0.7) {
  // Alpha = 1.5: Very fat tails (2008-style crashes)
  const crashMagnitude = levyFlight(1.5, rng);

  if (crashMagnitude > 20.0) {
    // Financial crash (rare but catastrophic)
    const gdpLoss = Math.min(crashMagnitude / 200, 0.25); // Max 25% GDP loss

    economicStage = Math.max(1, economicStage - 1); // Revert economic stage
    qualityOfLife *= (1 - gdpLoss);

    console.log(`  💥 FINANCIAL CRASH`);
    console.log(`     GDP loss: ${(gdpLoss * 100).toFixed(1)}%`);
    console.log(`     Economic stage: ${economicStage}`);
  }
}
```

---

## File Structure

### New File: `src/simulation/utils/levyDistributions.ts`

```typescript
/**
 * Lévy Flight Distributions - Fat-Tailed Randomness
 *
 * Replaces Gaussian/uniform randomness with power-law distributions
 * to model real-world systems where extreme events are more common
 * than normal distributions predict.
 *
 * Research Foundation:
 * - Clauset et al. (2009): Power laws in empirical data
 * - Bak et al. (1987): Self-organized criticality
 * - Mantegna & Stanley (1994): Lévy flights in finance
 * - Brockmann et al. (2006): Human mobility patterns
 *
 * Date: October 17, 2025
 */

export type RNGFunction = () => number;

/**
 * Alpha parameter guidelines:
 * - 1.5: Very fat tails (financial crashes, mega-disasters)
 * - 1.8: Fat tails (environmental cascades, social movements)
 * - 2.0: Moderate fat tails (AI breakthroughs, tech adoption)
 * - 2.5: Less extreme tails (gradual with rare bursts)
 * - 3.0+: Converges to Gaussian (defeats purpose)
 */
export const ALPHA_PRESETS = {
  FINANCIAL_CRASH: 1.5,
  ENVIRONMENTAL_CASCADE: 1.8,
  SOCIAL_MOVEMENT: 1.8,
  AI_BREAKTHROUGH: 2.0,
  TECH_ADOPTION: 2.5,
} as const;

/**
 * Generates a Lévy flight random value with power-law tail distribution.
 */
export function levyFlight(alpha: number, rng: RNGFunction): number {
  // Validate alpha range
  if (alpha < 1.0 || alpha > 3.0) {
    console.warn(`levyFlight: alpha=${alpha} outside recommended range [1.0, 3.0]`);
  }

  const u = rng();
  const safeU = Math.max(u, 1e-10);

  return Math.pow(safeU, -1 / alpha);
}

/**
 * Bounded Lévy flight for use in probabilities/multipliers.
 */
export function boundedLevyFlight(
  alpha: number,
  rng: RNGFunction,
  min: number,
  max: number
): number {
  const levy = levyFlight(alpha, rng);
  const normalized = 1 - Math.exp(-levy / 10);
  return min + normalized * (max - min);
}

/**
 * Power-law sampler for discrete events (e.g., breakthrough detection).
 * Returns true with probability proportional to power-law tail.
 */
export function powerLawEvent(
  alpha: number,
  threshold: number,
  rng: RNGFunction
): boolean {
  const levy = levyFlight(alpha, rng);
  return levy > threshold;
}

/**
 * Lévy-modified S-curve for technology adoption.
 * Combines deterministic S-curve with stochastic fat-tail variation.
 */
export function levyAdoptionCurve(
  baseAdoption: number,
  alpha: number,
  rng: RNGFunction
): number {
  const levyModifier = boundedLevyFlight(alpha, rng, 0.8, 1.5);
  return Math.min(baseAdoption * levyModifier, 1.0);
}
```

---

## Integration Plan

### Step 1: Create Utility Module (30 minutes)
- Create `src/simulation/utils/levyDistributions.ts`
- Implement core functions with JSDoc comments
- Add unit tests to verify power-law properties

### Step 2: Replace Breakthrough Checks (30 minutes)
- **File:** `src/simulation/aiAgent.ts`
- **Lines:** ~450-500 (AI capability growth)
- Replace uniform random checks with `levyFlight(2.0, rng)`
- Add logging for transformative breakthroughs

### Step 3: Replace Environmental Cascades (30 minutes)
- **File:** `src/simulation/environmental.ts`
- **Lines:** ~200-300 (debt accumulation)
- Add critical threshold detection
- Implement mega-cascade mechanics with `levyFlight(1.8, rng)`

### Step 4: Replace Technology Adoption (30 minutes)
- **File:** `src/simulation/breakthroughTechnologies.ts`
- **Lines:** ~150-250 (adoption curves)
- Modify S-curves with `levyAdoptionCurve()`
- Preserve deterministic base, add stochastic variation

### Step 5: Add Social Movement Cascades (30 minutes)
- **File:** `src/simulation/socialCohesion.ts`
- **Lines:** ~100-200 (mobilization mechanics)
- Implement Kuran cascade detection
- Add `levyFlight(1.8, rng)` for preference falsification

---

## Validation Criteria

### Expected Variance Increase

**Before Phase 1:**
- Seed convergence: 80-90% (same outcomes across seeds)
- Timing variance: ±10 months
- Outcome variance: Minimal (only timing differs)

**After Phase 1:**
- Seed convergence: 60-70% (still structural, but more variation)
- Timing variance: ±20-30 months (fat tails create unpredictability)
- Outcome variance: Moderate (trajectories differ, not just timing)

### Validation Tests

**Monte Carlo N=50:**
```bash
npx tsx scripts/monteCarloSimulation.ts --runs=50 --max-months=120
```

**Metrics to Track:**
1. **Outcome distribution variance:** Measure coefficient of variation across 50 runs
2. **Breakthrough timing:** Plot histogram of AI capability jump timing (should show fat tail)
3. **Environmental cascade frequency:** Count mega-cascades (should be rare but impactful)
4. **Technology adoption speed:** Measure variance in adoption rates (should increase)
5. **Social movement timing:** Check for rare explosive mobilization events

### Success Criteria

✅ **Variance increases by 30-50%** (outcome distributions widen)
✅ **Fat-tail events occur:** 5-10% of runs experience mega-cascades/transformative breakthroughs
✅ **Seed convergence drops:** From 80-90% to 60-70%
✅ **Timing unpredictability increases:** Standard deviation of key event timing grows
✅ **Structural forces preserved:** Most outcomes still determined by policy/conditions (not pure chaos)

---

## Research Citations

1. **Clauset, A., Shalizi, C. R., & Newman, M. E. J. (2009).** "Power-Law Distributions in Empirical Data." *SIAM Review*, 51(4), 661-703.

2. **Bak, P., Tang, C., & Wiesenfeld, K. (1987).** "Self-organized criticality: An explanation of the 1/f noise." *Physical Review Letters*, 59(4), 381-384.

3. **Mantegna, R. N., & Stanley, H. E. (1994).** "Stochastic Process with Ultraslow Convergence to a Gaussian: The Truncated Lévy Flight." *Physical Review Letters*, 73(22), 2946-2949.

4. **Brockmann, D., Hufnagel, L., & Geisel, T. (2006).** "The scaling laws of human travel." *Nature*, 439(7075), 462-465.

5. **Reynolds, A. M., & Frye, M. A. (2007).** "Free-Flight Odor Tracking in Drosophila Is Consistent with an Optimal Intermittent Scale-Free Search." *Science*, 316(5828), 1007-1010.

6. **Sornette, D. (2003).** "Critical Phenomena in Natural Sciences: Chaos, Fractals, Selforganization and Disorder: Concepts and Tools." *Springer Series in Synergetics*.

---

## Next Steps

After Phase 1 validation (N=50 Monte Carlo):

**If variance increases 30-50%:**
→ PROCEED to Phase 2 (Exogenous Shocks) - Fat tails helped but still need rare black swans

**If variance increases >50% and outcomes highly unpredictable:**
→ SKIP Phase 2 - Lévy flights sufficient, move to Phase 3 (Critical Junctures)

**If variance increases <20%:**
→ DIAGNOSE - Check if Lévy flights implemented correctly, may need higher alpha values

---

**Total Effort:** 2-4 hours (implementation + testing)
**Files Modified:** 5 files (1 new, 4 existing)
**Research Confidence:** 90% (Lévy flights extensively validated)
**Impact:** First step toward genuine unpredictability vs deterministic chaos

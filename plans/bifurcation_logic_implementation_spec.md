# Bifurcation Logic Implementation Specification

**Date:** November 6, 2025
**Issue:** Monte Carlo Issue #5 - 100% Dystopia Outcome, Insufficient Variance
**Status:** Research validated, ready for implementation
**Priority:** HIGH
**Estimated Effort:** 8-12 hours

---

## Executive Summary

**Problem:** Monte Carlo runs show 100% dystopia outcomes with near-identical mortality (74-81%). This defeats the purpose of stochastic simulation - different random seeds should produce different outcomes.

**Root Cause:** Missing bifurcation points where systems can follow different trajectories based on:
1. Threshold-based branching (crossing critical thresholds triggers different regimes)
2. Stochastic policy interventions (randomized effectiveness)
3. Path-dependent decision windows (early choices affect later possibilities)

**Solution:** Implement bifurcation mechanisms that create research-backed outcome variance WITHOUT artificial balancing.

---

## Research Foundation

**Source Documents:**
- `/research/outcome_variance_mechanisms_20251030.md` (39,836 bytes, 20+ sources)
- `/reviews/outcome_variance_mechanisms_validation_20251030.md` (PASS with minor clarifications)

**Key Research Findings:**

1. **Scheffer et al. (2014):** Near bifurcation points, systems show extreme sensitivity to initial conditions - small differences create divergent outcomes
2. **Keller et al. (2024):** Resilience heterogeneity creates differential outcomes even under identical stressors (main effects, not buffering)
3. **Manca et al. (2019):** No single characteristic explains resilience - multidimensional factors interact

**Expected Outcome Distribution:**
- Current: 80% Ecological/Indigenous Dystopia, 20% Ecological Dystopia, 0% other
- Target: 10-20% each for utopia/collapse/dystopia, 20-30% hybrid states
- Validation: Coefficient of variation 20-70% (not <10% overdetermined)

---

## Implementation Design

### 1. Bifurcation Points (HIGH PRIORITY)

**Mechanism:** Threshold-based branching where crossing critical values triggers regime shifts

**Research Backing:** Scheffer et al. (2014) - Critical slowing down near tipping points creates variance amplification

**Implementation:**

```typescript
/**
 * Bifurcation Logic Phase
 *
 * Identifies when simulation crosses critical thresholds and applies
 * variance amplification to create path-dependent trajectories.
 *
 * Based on: Scheffer et al. (2014) Phil. Trans. R. Soc. B 370: 20130263
 *
 * Order: 5.0 (early in step, before domain-specific updates)
 * Dependencies: ['initialization']
 */

interface BifurcationThreshold {
  metric: keyof GameState;  // Which state property to check
  location: number;          // Threshold value (randomized per run)
  variance: number;          // How much to randomize threshold (±variance)
  regime: 'collapse' | 'stable' | 'flourishing';
}

// Example thresholds (research-backed ranges)
const ENVIRONMENTAL_COLLAPSE_THRESHOLD = {
  base: 0.35,      // Research: 0.30-0.40 range (no consensus)
  variance: 0.05,  // Sample from [0.30, 0.40] per run
};

const SOCIAL_BREAKDOWN_THRESHOLD = {
  base: 0.20,      // Research: 0.15-0.25 range
  variance: 0.05,
};

const TECHNOLOGY_BREAKTHROUGH_THRESHOLD = {
  base: 0.60,      // Research: 0.55-0.65 range
  variance: 0.05,
};
```

**Algorithm:**

1. **Initialization:** Sample threshold locations from uncertainty ranges using `rng()`
2. **Each step:** Check proximity to thresholds
3. **Near threshold:** Amplify variance in dependent systems
   - Variance amplification = 1 / (0.1 + normalizedDistance)
   - As distance → 0, amplification → 10×
4. **Cross threshold:** Log regime shift event, apply path-dependent effects

**Integration Points:**
- `src/simulation/environmental.ts` - Environmental collapse threshold
- `src/simulation/social.ts` - Social breakdown threshold
- `src/simulation/breakthroughs.ts` - Technology breakthrough threshold

---

### 2. Stochastic Policy Interventions (HIGH PRIORITY)

**Mechanism:** Policy effectiveness varies stochastically within research-backed ranges

**Research Backing:** Manca et al. (2019) - Crisis response heterogeneity, historical examples (Greece vs Ireland 2008)

**Implementation:**

```typescript
/**
 * Randomize policy effectiveness within empirical ranges
 *
 * Example: Carbon tax effectiveness ranges from 10-30% emissions reduction
 * (based on historical data from multiple countries)
 *
 * Instead of: const effectiveness = 0.20  // Fixed
 * Use:        const effectiveness = sampleRange(rng, 0.10, 0.30)
 */

function sampleRange(rng: RNGFunction, min: number, max: number): number {
  return min + rng() * (max - min);
}
```

**Systems to Modify:**
- `src/simulation/policy.ts` - Policy effectiveness ranges
- `src/simulation/governance.ts` - Government response quality
- `src/simulation/international.ts` - Aid distribution efficiency

**Research-Backed Ranges:**
- Carbon pricing: 10-30% effectiveness (varies by economy)
- Universal Basic Income: 15-40% poverty reduction (varies by implementation)
- International aid: 15-35% mortality reduction (varies by logistics/politics)

---

### 3. Path-Dependent Decision Windows (MEDIUM PRIORITY)

**Mechanism:** Early cooperation increases later cooperation probability (positive feedback)

**Research Backing:** Trust dynamics, social capital theory

**Implementation:**

```typescript
/**
 * Path Dependence Tracking
 *
 * Track historical cooperation/conflict to influence future probabilities
 */

interface PathDependenceState {
  cooperationHistory: number[];    // Recent cooperation scores (rolling window)
  trustCapital: number;             // Accumulated trust (0-1)
  conflictMemory: number;           // Accumulated conflict damage (0-1)
}

// Example: Cooperation probability affected by history
function calculateCooperationProbability(
  baseProb: number,
  history: PathDependenceState,
  rng: RNGFunction
): number {
  // Trust increases cooperation
  const trustBonus = history.trustCapital * 0.3;  // Up to +30%

  // Conflict reduces cooperation
  const conflictPenalty = history.conflictMemory * 0.4;  // Up to -40%

  return Math.max(0, Math.min(1, baseProb + trustBonus - conflictPenalty));
}
```

**Integration:** Add to `state.pathDependence` in `GameState` interface

---

### 4. Feedback Loop Balancing (MEDIUM PRIORITY)

**Mechanism:** Negative feedback loops (stabilizers) counteract positive feedback (doom loops)

**Research Backing:** Links to MortalityStabilizersPhase (Issue #4 implementation)

**Implementation:**

**Already Implemented:**
- `MortalityStabilizersPhase.ts` provides 7 stabilizing mechanisms
- Healthcare reserves, agricultural buffers, international aid, etc.

**New Integration:**
- Strengthen stabilizers when near collapse thresholds (survival instinct)
- Weaken stabilizers during sustained prosperity (complacency)

```typescript
// Strengthen stabilizers near collapse
if (environmentalHealth < COLLAPSE_THRESHOLD + 0.05) {
  stabilizer.effectiveness *= 1.2;  // +20% crisis response
}

// Weaken during prosperity
if (environmentalHealth > FLOURISHING_THRESHOLD - 0.05) {
  stabilizer.effectiveness *= 0.8;  // -20% complacency
}
```

---

## Implementation Phases

### Phase 1: Core Bifurcation Logic (3-4 hours)

**Files to Create:**
1. `src/simulation/engine/phases/BifurcationLogicPhase.ts` - Main bifurcation logic
2. `src/types/bifurcation.ts` - Type definitions

**Files to Modify:**
1. `src/types/game.ts` - Add `bifurcationState` to GameState
2. `src/simulation/engine.ts` - Register BifurcationLogicPhase at order 5.0

**Deliverables:**
- Threshold sampling on initialization (deterministic per seed)
- Proximity detection and variance amplification
- Regime shift logging

### Phase 2: Stochastic Policy Integration (2-3 hours)

**Files to Modify:**
1. `src/simulation/policy.ts` - Replace fixed effectiveness with ranges
2. `src/simulation/governance.ts` - Randomize government response quality
3. `src/simulation/international.ts` - Randomize aid effectiveness

**Validation:**
- Check JSDoc citations for range sources
- Ensure all ranges have 2+ peer-reviewed sources
- Use `assertInRange()` for all sampled values

### Phase 3: Path Dependence (2-3 hours)

**Files to Create:**
1. `src/simulation/engine/phases/PathDependencePhase.ts` - Track cooperation/conflict history

**Files to Modify:**
1. `src/types/game.ts` - Add `pathDependence` to GameState
2. `src/simulation/international.ts` - Use path dependence in cooperation calculations

### Phase 4: Testing & Validation (2-3 hours)

**Unit Tests:**
- Threshold sampling determinism (same seed → same thresholds)
- Variance amplification math
- Path dependence accumulation

**Integration Tests:**
- Monte Carlo N=10 with variance measurement
- Outcome distribution verification (not 100% dystopia)
- Coefficient of variation calculation (target: 20-70%)

---

## Success Criteria

**MUST HAVE:**
1. ✅ Monte Carlo runs produce >3 distinct outcome types
2. ✅ Coefficient of variation 20-70% (not <10% overdetermined)
3. ✅ All parameters research-backed (2+ sources, JSDoc citations)
4. ✅ Deterministic per seed (same seed → same thresholds → same outcome)
5. ✅ Zero silent fallbacks (use assertion utilities)

**SHOULD HAVE:**
1. Outcome distribution roughly matches research expectations (10-20% each category)
2. Variance emerges from mechanics, not explicit randomization
3. Architecture review passes (no performance bottlenecks, proper state propagation)

**MUST NOT:**
- Tune parameters for "fun" or "balance" - only research-backed values
- Add explicit randomness to force variance - should emerge from bifurcations
- Break determinism (all RNG must use passed `rng()` parameter)

---

## Integration Risks

**HIGH RISK:**
1. **Breaking determinism:** Must use `rng()` parameter everywhere (not `Math.random()`)
2. **RNG consumption order:** Conditional RNG calls can desync streams (see Issue #11 fixes)
3. **State coherence:** Bifurcations must propagate to dependent systems

**MEDIUM RISK:**
1. **Performance:** Threshold checking on every step (should be fast, but monitor)
2. **Complexity creep:** 5-7 systems affected (keep changes localized)

**LOW RISK:**
1. **Research validity:** Already validated by Sylvia (PASS)
2. **Testing burden:** Threshold logic is simple to unit test

---

## Validation Plan

### Step 1: Unit Tests
```bash
npm test -- BifurcationLogicPhase
```

### Step 2: Determinism Verification
```bash
npx tsx scripts/verifyDeterminism.ts --months 12
```

### Step 3: Monte Carlo Validation (N=10)
```bash
npx tsx scripts/monteCarloSimulation.ts --runs 10 > logs/mc_bifurcation_validation_$(date +%Y%m%d_%H%M%S).log 2>&1 &
```

**Analysis:**
- Extract outcome classifications from log
- Calculate coefficient of variation for mortality, paradigm scores
- Verify >3 distinct outcome types
- Ensure CV ∈ [20%, 70%]

### Step 4: Architecture Review (Quality Gate 2)
- Spawn `architecture-skeptic` to review implementation
- Must address CRITICAL/HIGH issues before proceeding

---

## Research Citations (Summary)

**Bifurcation Theory:**
- Scheffer et al. (2014/2015) - Critical slowing down, regime shifts
- Richardson et al. (2023) - Planetary boundaries, tipping points

**Resilience Heterogeneity:**
- Keller et al. (2024) - Individual/societal resilience factors
- Hepfer & Lawrence (2022) - Organizational resilience types
- Manca et al. (2019) - EU crisis resilience multidimensionality

**Historical Examples:**
- Greece vs Ireland (2008 financial crisis) - Different resilience trajectories
- Iceland vs Greenland (Medieval climate shift) - Divergent outcomes from similar crises

**Complete Bibliography:** See `/research/outcome_variance_mechanisms_20251030.md`

---

## Notes for Implementation

**For simulation-maintainer (Roy):**

1. **Defensive Coding:** Use `assertFinite()`, `assertInRange()`, `assertProbability()` everywhere
2. **Emoji Conventions:** Use 🔀 for bifurcation events, 🌀 for variance amplification, 📊 for outcome classification
3. **JSDoc Citations:** Every parameter range MUST cite research source
4. **Determinism:** All RNG from `rng()` parameter, NEVER `Math.random()`
5. **NaN Detection:** Fail loudly with full context, no silent fallbacks
6. **Phase Dependencies:** Declare dependencies in phase definition

**Example JSDoc:**
```typescript
/**
 * Environmental collapse threshold
 *
 * Research range: 0.30-0.40 (no consensus on exact value)
 * Base: 0.35, Variance: ±0.05
 *
 * @see Scheffer et al. (2014) - Bifurcation points create extreme sensitivity
 * @see Richardson et al. (2023) - Planetary boundaries framework
 */
const ENVIRONMENTAL_COLLAPSE_THRESHOLD = {
  base: 0.35,
  variance: 0.05,
};
```

---

**Specification Complete - Ready for Implementation**
**Next Step:** Spawn simulation-maintainer (Roy) with this specification

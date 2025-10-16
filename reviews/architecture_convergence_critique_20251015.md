# Architectural Review: Deterministic Convergence in Monte Carlo Simulations

**Date:** October 15, 2025
**Reviewer:** System Architecture Skeptic
**Critical Issue:** All Monte Carlo simulations converge to identical outcomes (0.34B population, 95.7% decline)
**Severity:** CRITICAL - Invalidates entire Monte Carlo approach

## Executive Summary

The simulation exhibits a fundamental architectural flaw where **stochastic elements are architecturally isolated from outcome-determining calculations**. While individual components use randomness (cascade triggers, AI initialization), the core population dynamics and environmental mortality calculations are **deterministically coupled**, creating mathematical attractors that overwhelm any initial variance. This is not a bug but an **emergent property of the system architecture**.

## CRITICAL ISSUES (Immediate attention required - system validity at risk)

### 1. RNG Architecture Fundamentally Broken

**Problem:** The SeededRandom class exists but is NOT passed to critical subsystems.

**Evidence:**
- `engine.ts:409`: RNG bound but passed as simple function `rng()`
- `PlanetaryBoundariesPhase.ts:25`: Calls `updatePlanetaryBoundaries(state)` WITHOUT passing RNG
- `planetaryBoundaries.ts:463`: Uses `Math.random()` directly, not seeded RNG
- Population dynamics use `Math.random()` in initialization, breaking reproducibility

**Impact:** Monte Carlo runs are NOT reproducible, and randomness is not controlled.

**Root Cause:** Phase orchestrator passes RNG, but legacy functions don't accept it.

**Recommended Action:**
```typescript
// CRITICAL FIX: Thread RNG through all stochastic functions
export function updatePlanetaryBoundaries(state: GameState, rng: () => number): void {
  // Replace all Math.random() with rng()
  if (!system.cascadeActive && rng() < monthlyTriggerChance) {
    // ...
  }
}
```

### 2. Deterministic Environmental Mortality Overwhelms Stochasticity

**Problem:** Environmental mortality calculations are purely deterministic functions of state.

**Evidence:**
- `populationDynamics.ts:171-173`: `calculateEnvironmentalMortality(state)` returns deterministic breakdown
- `qualityOfLife.ts`: Environmental mortality based on fixed thresholds (no variance)
- Death rates compound deterministically: `baselineDeaths + envMortality.total * 12`

**Impact:** Given identical environmental states, mortality is ALWAYS identical.

**Mathematical Proof:**
```
Let M(t) = mortality at time t
Let E(t) = environmental state at time t

M(t) = f(E(t)) where f is deterministic
E(t+1) = g(E(t), M(t)) where g is deterministic

Therefore: All trajectories with same E(0) converge to same attractor
```

**Recommended Action:** Add stochastic variance to mortality calculations:
```typescript
const stochasticMultiplier = 0.9 + rng() * 0.2; // ±10% variance
const finalMortality = baseMortality * stochasticMultiplier;
```

### 3. State Initialization Creates Identical Starting Points

**Problem:** Monte Carlo runs start from IDENTICAL initial states.

**Evidence:**
- `monteCarloSimulation.ts`: No variation in initial planetary boundaries
- `monteCarlo.ts:143`: `varyInitialState()` only varies AI agents, not environmental systems
- All runs start with identical resource stocks, boundaries, population

**Impact:** Without initial variance in critical systems, convergence is guaranteed.

**Recommended Action:** Implement comprehensive initial state variation:
```typescript
function varyPlanetaryBoundaries(boundaries: PlanetaryBoundary[], rng: () => number) {
  boundaries.forEach(boundary => {
    boundary.currentValue *= (0.95 + rng() * 0.10); // ±5% variance
  });
}
```

## HIGH PRIORITY (Significant architectural concerns)

### 4. Exponential Processes Create Mathematical Attractors

**Problem:** Exponential decay/growth formulas create convergence regardless of timing.

**Evidence:**
- `planetaryBoundaries.ts:559`: `env.climateStability *= 0.98` (deterministic 2% decay)
- `planetaryBoundaries.ts:596`: Death acceleration: `Math.pow(1.05, monthsPastCrisis)`
- These create exponential curves that converge to same endpoints

**Mathematical Analysis:**
```
Given: P(t) = P₀ * e^(-λt)
Even if trigger time T varies stochastically:
lim(t→∞) P(t) = 0 regardless of T

The system has a single stable equilibrium at extinction.
```

**Recommended Action:** Replace exponential decay with stochastic processes:
```typescript
const decayRate = 0.02 * (0.8 + rng() * 0.4); // Variable decay rate
const accelerationFactor = 1.03 + rng() * 0.04; // Variable acceleration
```

### 5. Cascade Severity Calculation is Quasi-Deterministic

**Problem:** Once cascade triggers, severity follows deterministic curve.

**Evidence:**
- `planetaryBoundaries.ts:479`: `cascadeSeverity = Math.pow((risk - 0.5) / 0.5, 1.5)`
- Severity deterministically tied to tipping point risk
- No random events within cascade progression

**Impact:** Cascade progression is predictable once triggered.

**Recommended Action:** Add stochastic shocks and recovery events:
```typescript
// Random severity jumps/drops
if (rng() < 0.05) { // 5% chance per month
  cascadeSeverity *= (0.7 + rng() * 0.6); // 70-130% multiplier
}
```

### 6. Missing Variance in Resource Depletion

**Problem:** Resource stocks decay at fixed rates.

**Evidence:**
- `planetaryBoundaries.ts:572`: `food.currentStock *= 0.96` (fixed 4% decay)
- No variance in consumption rates, production shocks, or discovery events

**Recommended Action:** Implement resource volatility:
```typescript
const monthlyConsumption = baseRate * (0.8 + rng() * 0.4);
const productionShock = rng() < 0.1 ? (0.5 + rng() * 1.0) : 1.0;
```

## MEDIUM PRIORITY (Technical debt worth addressing)

### 7. Phase System Doesn't Pass RNG Context

**Problem:** New phase architecture doesn't properly thread RNG through legacy code.

**Evidence:**
- Phase interfaces accept RNG but don't pass to underlying functions
- Most phases just call legacy functions without RNG parameter

**Recommended Action:** Systematic refactor to thread RNG through all calculations.

### 8. No Event-Driven Variance

**Problem:** System lacks random events that could alter trajectory.

**Missing Elements:**
- Natural disasters with random timing/severity
- Technological breakthroughs with probability
- Political upheavals
- Black swan events

**Recommended Action:** Implement stochastic event system.

### 9. Feedback Loops Lock In Deterministic Paths

**Problem:** Tight coupling creates inevitable cascade once thresholds crossed.

**Evidence:**
- Climate → Biodiversity → Food → Population (all deterministic links)
- No random resilience or adaptation events

**Recommended Action:** Add stochastic resilience mechanisms.

## ROOT ARCHITECTURAL CAUSES

### 1. **Mixing RNG Paradigms**
- SeededRandom for reproducibility
- Math.random() for "true" randomness
- No consistent approach across codebase

### 2. **Mathematical Attractors**
- System designed with stable equilibrium points
- Exponential processes dominate linear variance
- Phase space collapses to single trajectory

### 3. **Overly Tight Coupling**
- Environmental → Population is 1:1 deterministic
- No buffering or lag mechanisms
- Missing stochastic shocks

### 4. **Legacy Code Integration**
- New phase system doesn't properly integrate old functions
- RNG threading incomplete
- Stochastic fixes applied piecemeal

## DIAGNOSTIC COMMANDS

Run these tests to validate the hypotheses:

```typescript
// Test 1: Verify RNG isolation
console.log('CASCADE TRIGGER RANDOM:', Math.random.toString());
// If this shows native Math.random, RNG is not threaded

// Test 2: Track mortality determinism
const mortality1 = calculateEnvironmentalMortality(state);
const mortality2 = calculateEnvironmentalMortality(state);
console.assert(mortality1 === mortality2, 'Mortality is stochastic');

// Test 3: Measure initial state variance
const states = Array(10).fill(0).map((_, i) => {
  const engine = new SimulationEngine({ seed: i });
  return createDefaultInitialState();
});
const boundaries = states.map(s =>
  s.planetaryBoundariesSystem.boundaries.climate_change.currentValue
);
console.log('Boundary variance:', Math.std(boundaries));
```

## REFACTORING RECOMMENDATIONS

### Phase 1: Fix RNG Threading (1-2 days)
1. Add RNG parameter to ALL calculation functions
2. Replace Math.random() with passed RNG globally
3. Ensure deterministic seeding works

### Phase 2: Add Variance to Calculations (2-3 days)
1. Environmental mortality: ±15% stochastic variance
2. Resource depletion: ±20% monthly variance
3. Cascade progression: Random shocks/recoveries
4. Population growth: Stochastic birth/death modifiers

### Phase 3: Initial State Variation (1 day)
1. Vary ALL planetary boundaries ±5%
2. Vary resource stocks ±10%
3. Vary population parameters ±3%
4. Add random historical events in first month

### Phase 4: Implement Event System (3-5 days)
1. Random disaster events (probability-based)
2. Innovation breakthroughs (stochastic timing)
3. Political changes (random government type shifts)
4. Black swan cascade interruptions

## RECOMMENDATION

**CRITICAL**: The Monte Carlo system is currently producing false confidence through pseudo-replication. The identical outcomes are not validating the model - they're exposing architectural determinism.

**Priority Order:**
1. **TODAY**: Fix RNG threading (breaks reproducibility)
2. **THIS WEEK**: Add mortality variance (breaks convergence)
3. **NEXT SPRINT**: Full stochastic refactor

Without these fixes, the simulation is effectively a **deterministic model with cosmetic randomness**. The stochastic elements affect timing but not outcomes, making Monte Carlo analysis meaningless.

## SMOKING GUN CODE PATTERNS

```typescript
// DETERMINISTIC ANTIPATTERN
env.climateStability *= 0.98; // ALWAYS 2% decay

// STOCHASTIC PATTERN (CORRECT)
env.climateStability *= (0.97 + rng() * 0.02); // 1-3% decay

// BROKEN RNG ANTIPATTERN
if (Math.random() < probability) { // Uses global RNG

// PROPER RNG PATTERN
if (rng() < probability) { // Uses seeded RNG

// MISSING VARIANCE ANTIPATTERN
mortality = calculateEnvironmentalMortality(state); // Deterministic

// VARIANCE PATTERN
baseMortality = calculateEnvironmentalMortality(state);
mortality = baseMortality * (0.85 + rng() * 0.30); // ±15% variance
```

## CONCLUSION

The system exhibits **fundamental architectural determinism** masked by superficial stochasticity. The problem is not in any single component but in the **emergent behavior** of tightly coupled deterministic calculations. Without comprehensive stochastic variance at multiple levels, Monte Carlo simulations will continue to converge to identical outcomes, regardless of initial conditions or random triggers.

The fix requires not just adding randomness, but **architecting for divergence** - ensuring that small variations can amplify rather than dampen over time.

**Severity: CRITICAL**
**Business Impact: Invalidates all Monte Carlo analysis**
**Estimated Fix: 7-10 days for comprehensive solution**
**Risk of Partial Fix: HIGH (could mask problem without solving it)**
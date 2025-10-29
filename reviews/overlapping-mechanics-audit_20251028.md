# Architectural Audit: Overlapping Simple/Sophisticated Mechanics
**Date:** October 28, 2025
**Agent:** Architecture Skeptic
**Focus:** State property conflicts between old simple mechanics and new sophisticated systems

## Executive Summary

This audit identified **CRITICAL issues** with determinism breaking and several **HIGH priority** architectural problems where simple mechanics and sophisticated systems operate on the same state properties, causing conflicts, double-counting, and unpredictable behavior.

## CRITICAL ISSUES (Immediate attention required - system stability at risk)

### 1. Math.random() Breaking Determinism Throughout Simulation

**State Property:** RNG seed determinism
**Old Mechanic:** Direct `Math.random()` calls in multiple files
**New Mechanic:** Seeded RNG function passed through phases
**Conflict Type:** Determinism breaking
**Impact:** **CRITICAL**

**Locations Found:**
- `resourceDepletion.ts:31, 92-93` - Event ID generation and oil spill risk
- `planetaryBoundaries.ts:647, 668, 750, 909` - Stochastic triggers and variations
- `initialization.ts:266, 348, 361-367, 470, 477, 484, 487, 495, 498, 868, 951, 962` - Agent creation with random properties
- `computeInfrastructure.ts:258` - Compute efficiency initialization
- `geoengineering.ts:30, 120, 189, 277, 344, 349, 452` - Event IDs and disaster probabilities
- `freshwaterDepletion.ts:174, 183-184` - Day Zero drought triggers
- `socialCohesion.ts:491` - Government authoritarianism chance
- `techTree/regionalDeployment.ts:310` - Tech deployment probability
- `militarySystem.ts:337, 341, 352, 360` - War decisions and target selection
- Multiple phase files still using `Math.random()` in backup files

**Fix:** Replace ALL `Math.random()` calls with the RNG function passed through phases. This is breaking Monte Carlo determinism completely.

```typescript
// BAD - Breaks determinism
if (Math.random() < 0.05) { ... }

// GOOD - Uses seeded RNG
if (rng() < 0.05) { ... }
```

## HIGH PRIORITY (Significant performance/maintainability concerns)

### 2. Planetary Boundary Status Updates in Multiple Places

**State Property:** `boundary.status`
**Old Mechanic:** Simple threshold check in `planetaryBoundaries.ts:695-709`
**New Mechanic:** Recovery-based status updates in `planetaryBoundaryRecovery.ts` (6+ locations)
**Conflict Type:** Overwriting / Phase order issues
**Impact:** **HIGH**

Both files update the same `boundary.status` property:
- `planetaryBoundaries.ts` updates based on simple threshold crossing
- `planetaryBoundaryRecovery.ts` updates based on recovery months and complex recovery stages

**Fix:** Consolidate boundary status logic into a single phase. Recovery should be the authoritative source after initial threshold detection.

### 3. Population Dynamics with Seasonal Cycles in Backup Files

**State Property:** Population births/deaths
**Old Mechanic:** Sine wave seasonal cycles + random noise (found in `.bak` files)
**New Mechanic:** Sophisticated regional population system with Bayesian mortality
**Conflict Type:** Legacy code not fully removed
**Impact:** **MEDIUM-HIGH**

Found in backup files (`.bak2` through `.bak7`):
```typescript
// Old simple mechanic still in backup files
const seasonalBirthCycle = 1 + 0.08 * Math.sin((2 * Math.PI * monthInYear / 12) + Math.PI/2);
const monthlyBirthNoise = 0.98 + Math.random() * 0.04;
```

**Fix:** Delete all `.bak` files - they're polluting searches and may accidentally be restored.

## MEDIUM PRIORITY (Technical debt worth addressing between features)

### 4. Environmental Stochastic Factors

**State Property:** Environmental degradation rates
**Old Mechanic:** Random variation factor `envStochasticFactor` in `planetaryBoundaries.ts:750`
**New Mechanic:** Complex multi-factor environmental systems
**Conflict Type:** Double-counting randomness
**Impact:** **MEDIUM**

```typescript
// Simple random variation still applied
const envStochasticFactor = () => 0.75 + Math.random() * 0.5; // 75% to 125%
```

This adds random noise on top of already sophisticated environmental calculations.

**Fix:** Remove stochastic factors or convert to use deterministic noise based on system state.

### 5. Phase Execution Order Ambiguity

**State Property:** Various (depends on phase overlap)
**Old Mechanic:** Phases with decimal ordering (e.g., 4.0, 4.1, 4.2, 4.3)
**New Mechanic:** 119+ phases with potential order conflicts
**Conflict Type:** Phase order issues
**Impact:** **MEDIUM**

Found multiple phases in the 4.x range for AI collective evolution:
- `RLHFBindingPhase`: order 4.0
- `SurvivalTraitsPhase`: order 4.1
- `CollectiveFormationPhase`: order 4.2
- `EvolutionarySelectionPhase`: order 4.3
- `CollectiveActionsPhase`: order 5.5

**Fix:** Document phase dependencies explicitly and ensure no overlapping state modifications between closely ordered phases.

## LOW PRIORITY (Future improvements, not urgent)

### 6. Multiple Backup Files Polluting Codebase

**Impact:** **LOW** (but annoying)

Found 200+ `.bak` files throughout the codebase containing old implementations. These:
- Pollute search results
- May contain `Math.random()` that could be accidentally restored
- Add confusion about which code is active
- Take up disk space

**Fix:** Delete all `.bak` files and add `*.bak*` to `.gitignore`.

### 7. Event ID Generation Using Math.random()

**State Property:** Event IDs
**Old Mechanic:** `Math.random().toString(36).substr(2, 9)` for unique IDs
**New Mechanic:** Should use deterministic counter or hash
**Conflict Type:** Non-deterministic IDs
**Impact:** **LOW** (IDs don't affect simulation math, but breaks exact reproducibility)

**Fix:** Use a deterministic ID generator based on month + event type + counter.

## RECOMMENDATION

The **CRITICAL** issue of `Math.random()` usage throughout the codebase must be fixed immediately. This completely breaks Monte Carlo determinism and makes simulation results unreproducible. Every run with the same seed will produce different results.

**Immediate Actions Required:**
1. **CRITICAL:** Global search and replace of ALL `Math.random()` calls with the seeded RNG function
2. **HIGH:** Consolidate planetary boundary status updates into single authoritative location
3. **MEDIUM:** Clean up all `.bak` files and add to `.gitignore`

**Suggested Approach:**
1. Create a script to automatically find and flag all `Math.random()` usage
2. Systematically replace with RNG function, testing determinism after each module
3. Run Monte Carlo validation to ensure deterministic results with same seed
4. Archive this audit for future reference

The simulation cannot be considered research-grade while `Math.random()` is breaking determinism. This issue undermines all Monte Carlo analysis and parameter sensitivity testing.

## Files Requiring Immediate Attention

**Must fix for determinism:**
- `/src/simulation/initialization.ts` (12+ instances)
- `/src/simulation/planetaryBoundaries.ts` (4 instances)
- `/src/simulation/resourceDepletion.ts` (3 instances)
- `/src/simulation/geoengineering.ts` (7 instances)
- `/src/simulation/militarySystem.ts` (4 instances)
- All other files listed in Critical Issue #1

**Next:** Engage simulation-maintainer agent to fix Math.random() issues with proper assertion utilities and RNG propagation.
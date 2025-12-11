# MEDIUM Priority Architecture Fixes - December 8, 2025

**Source:** Architecture Integration Review (reviews/architecture_integration_review_20251208.md)
**Status:** Proposed
**Total Effort:** ~3-4 hours (4 small fixes)

---

## Problem Statement

The December 8, 2025 architecture review identified 4 MEDIUM priority issues that should be addressed for long-term maintainability. None are blocking or critical, but they represent technical debt that will compound if left unaddressed.

---

## Issues

### MEDIUM-1: O(n) Array Searches in Tipping Cascade Logic
**File:** `src/simulation/engine/phases/ClimateSystemPhase.ts:566, 241`
**Impact:** Performance degradation with many tipping elements
**Effort:** 1 hour

**Problem:**
The tipping cascade calculation uses `.find()` on arrays multiple times per update:

```typescript
// ClimateSystemPhase.ts:241
const targetElement = system.elements.find(e => e.id === interaction.targetId);

// ClimateSystemPhase.ts:566
const existing = winter.radiationZones.find(z => z.country === country);
```

With 6 tipping elements and ~10 interactions, this is ~60 array scans per climate update. While not critical now, this scales poorly if more elements are added.

**Solution:**
Create `Map<string, TippingElement>` index at initialization:

```typescript
// In TippingPointSystem interface
elementById: Map<string, TippingElement>;

// Initialize once, use O(1) lookups
const targetElement = system.elementById.get(interaction.targetId);
```

**Files:**
- `src/types/tipping-points.ts` - Add `elementById` map to interface
- `src/simulation/tippingPoints.ts` - Initialize map in `initializeTippingPointSystem`
- `src/simulation/engine/phases/ClimateSystemPhase.ts` - Replace `.find()` with map lookups

**Tests:**
- Verify map initialization is deterministic (same seed = same order)
- Verify lookups work correctly
- Verify performance improvement (benchmark with N=20 elements)

---

### MEDIUM-2: Nuclear Winter Solar Integration Uses Magic Number
**File:** `src/simulation/powerGeneration.ts:441`
**Impact:** Hardcoded solar fraction reduces model flexibility
**Effort:** 1 hour

**Problem:**
```typescript
// powerGeneration.ts:441
const solarFraction = 0.70; // Assume 70% of renewables are solar
```

This hardcoded value should be derived from the renewable mix, which could change over time (especially as scenario-specific deployments differ). The comment says "realistic for 2025+ grid mix" but the simulation spans decades.

**Solution:**
1. Add `solarFractionOfRenewables` field to `PowerGenerationSystem`
2. Initialize based on scenario parameters (default 0.70)
3. Allow it to evolve (solar increasing as technology improves, or decreasing if grid diversifies to wind/hydro)

**Files:**
- `src/types/game.ts` - Add `solarFractionOfRenewables` to `PowerGenerationSystem`
- `src/simulation/initializeGameState.ts` - Initialize field (default 0.70)
- `src/simulation/powerGeneration.ts` - Replace hardcoded value with field lookup
- Optional: Add scenario parameter to vary initial solar fraction

**Tests:**
- Verify default initialization (0.70)
- Verify nuclear winter solar capacity loss uses correct fraction
- Verify scenario flexibility (test with 0.5, 0.7, 0.9 fractions)

---

### MEDIUM-3: Cached Resilient Food Multiplier Has Silent Fallback
**File:** `src/simulation/nuclearWinter.ts:880`
**Impact:** Violates fail-loudly principle
**Effort:** 15 minutes

**Problem:**
```typescript
// nuclearWinter.ts:880
const resilientFoodMultiplier = winter.cachedResilientFoodMultiplier ?? 1.0;
```

The `?? 1.0` fallback is appropriate here (no tech = baseline scenario), BUT it's a silent fallback pattern that contradicts the project's fail-loudly philosophy. The comment explains the reasoning, but it would be cleaner to:

1. Initialize `cachedResilientFoodMultiplier` to `1.0` at nuclear winter trigger (already done at line 165)
2. Assert it exists rather than fallback

**Solution:**
Replace fallback with assertion:

```typescript
const resilientFoodMultiplier = assertDefined(
  winter.cachedResilientFoodMultiplier,
  {
    location: 'updateNuclearWinter',
    valueName: 'cachedResilientFoodMultiplier',
    month: state.currentMonth,
    additionalInfo: 'Should be initialized at nuclear winter trigger'
  }
);
```

**Files:**
- `src/simulation/nuclearWinter.ts` - Replace `?? 1.0` with `assertDefined()`

**Tests:**
- Verify nuclear winter trigger initializes multiplier
- Verify assertion triggers if multiplier missing (edge case test)
- Verify no regression in nuclear winter behavior

---

### MEDIUM-4: Radiation Zone Population Estimate Uses Rough Approximation
**File:** `src/simulation/nuclearWinter.ts:598-600`
**Impact:** Population at risk calculation is imprecise
**Effort:** 30 minutes

**Problem:**
```typescript
// nuclearWinter.ts:598-600
const countryPopulation = state.humanPopulationSystem.population * 0.01;  // Rough estimate
const radiationZonePopulation = countryPopulation * 0.10;  // 10% in fallout zone
```

These are labeled as "rough estimates" but could be improved now that the country population system exists (`state.countryPopulationSystem`). The estimates are 1% of global pop per nuclear-targeted country, then 10% of that in fallout zone.

**Solution:**
Use actual country population if available:

```typescript
const countryData = state.countryPopulationSystem?.countries[country];
const countryPopulation = countryData?.population
  ?? state.humanPopulationSystem.population * 0.01; // Fallback for unknown countries
const radiationZonePopulation = countryPopulation * 0.10;
```

**Files:**
- `src/simulation/nuclearWinter.ts` - Update population estimate to use country data
- Optional: Add logging when fallback is used (track which countries don't have data)

**Tests:**
- Verify country population lookup works for known countries
- Verify fallback works for unknown countries
- Verify radiation mortality estimates improve (compare before/after)

---

## Implementation Plan

**Order:** MEDIUM-3 (15 min) → MEDIUM-2 (1 hr) → MEDIUM-4 (30 min) → MEDIUM-1 (1 hr)
**Total:** ~3 hours

1. **MEDIUM-3** (quickest win, consistency improvement)
2. **MEDIUM-2** (improves scenario flexibility)
3. **MEDIUM-4** (improves realism of radiation mortality)
4. **MEDIUM-1** (performance optimization, prepare for growth)

Each fix is independent - can be done separately or bundled.

---

## Success Criteria

1. **All existing tests still pass** (no regressions)
2. **Type checking passes** (`npx tsc --noEmit`)
3. **Monte Carlo deterministic** (N≥10 with same seed = identical outputs)
4. **Architecture grade improves** (B+ → A after fixes)

---

## Effort Estimate

- **Quick Wins (MEDIUM-2, MEDIUM-3, MEDIUM-4):** ~2 hours total
- **Performance Optimization (MEDIUM-1):** ~1 hour
- **Testing & Validation:** Included in estimates above

**Total:** 3-4 hours

---

## Priority Justification

**Why MEDIUM (not HIGH or LOW)?**

- **Not HIGH:** None are blocking, critical, or causing immediate problems
- **Not LOW:** These are technical debt that will compound if left unaddressed
- **MEDIUM:** Maintainability improvements that prevent future problems

**When to do this work:**
- Between features (cleanup phase)
- During maintenance mode (like now)
- When token budget allows (not during conservation)

---

## Next Steps

1. Review this plan with team (any objections or better approaches?)
2. Assign to simulation-maintainer agent (or implement directly if straightforward)
3. Bundle into single PR or do incrementally (both acceptable)
4. Update architecture review grade after completion

---

**Plan Status:** Proposed - Ready for implementation when tokens available

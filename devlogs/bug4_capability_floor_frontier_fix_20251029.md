# Bug #4 Fix: Capability Floor/Frontier Tracking

**Date:** October 29, 2025
**Agent:** simulation-maintainer
**Status:** ✅ FIXED + VALIDATED

---

## Problem Statement

**Symptom:** Capability Floor and Frontier both showed 0.000 across all Monte Carlo runs, despite infrastructure existing.

**Evidence:**
- `TechnologyDiffusionPhase` exists and calls `diffuseCapabilities()`
- Types exist: `EcosystemState.capabilityFloor` and `frontierCapabilities`
- Functions exist: `diffuseCapabilities()`, `updateFrontierCapabilities()`, `getCapabilityFloorForNewAI()`
- Reporting code reads values correctly: `calculateTotalCapabilityFromProfile(state.ecosystem.capabilityFloor)`

**Expected Behavior:**
- Floor starts at 0, diffuses toward frontier over time
- Frontier rises as AIs achieve breakthroughs
- New AIs inherit capability floor (ratchet effect)
- Monte Carlo reports non-zero values after >0 months

**Actual Behavior:**
- Floor: 0.000 (never increased)
- Frontier: 0.000 (never set)
- Gap: 0.000 (no diffusion happening)

---

## Root Cause Analysis

**Investigation Steps:**

1. ✅ Checked if `ecosystem` initialized → YES (in initialization.ts)
2. ✅ Checked if `diffuseCapabilities()` called → YES (TechnologyDiffusionPhase)
3. ✅ Checked if `updateFrontierCapabilities()` wired → YES (organizationManagement.ts, techTree/effectsEngine.ts)
4. ❌ **Found root cause:** `createAIAgent()` IGNORES `targetCapability` parameter

**Root Cause Details:**

```typescript
// initialization.ts line 484-486 - Initial AI creation
for (let i = 0; i < 8; i++) {
  const alignment = 0.75 + Math.random() * 0.15;
  aiAgents.push(createAIAgent(`corporate_${i}`, `Corporate-${i}`, 0.05 + i * 0.01, alignment, i * 1.5));
  //                                                              ^^^^^^^^^^^^^^^ IGNORED!
}
```

**What was happening:**

1. Initial AIs created with `targetCapability: 0.05-0.14` (low, heterogeneous)
2. `initializeCapabilityProfile(seed)` called **without targetCapability parameter**
3. Profile initialized with **2025 frontier values** (digital: 5.0, cognitive: 5.0, etc.)
4. All 20 initial AIs got ~30+ total capability (frontier-level)
5. Frontier WAS being set correctly (to these high values)
6. Floor stayed at 0 because `updateFrontierCapabilities()` only called during **new capability growth**, not at initialization
7. No diffusion happened because there was no delta between "initial frontier" and "new capabilities"

**The TWO problems:**

1. **`targetCapability` parameter ignored** → All initial AIs at frontier level
2. **Frontier not initialized from starting AIs** → Frontier stayed at 0

---

## Solution

**Two-part fix to `/src/simulation/initialization.ts`:**

### Part 1: Honor targetCapability (lines 256-274)

Scale capability profiles to match the target total capability:

```typescript
): AIAgent {
  // BUG #4 FIX (Oct 29, 2025): Honor targetCapability parameter
  // Root cause: capabilityProfile was initialized with frontier values (digital: 5.0, cognitive: 5.0, etc.)
  // but targetCapability (0.05-0.14 for initial AIs) was IGNORED.
  // This caused ALL initial AIs to start at frontier level, leaving floor at 0.

  // Initialize capability profile with diversity (using seed for variation)
  const baseProfile = initializeCapabilityProfile(seed);

  // Calculate the base total capability from the profile
  const baseCapability = calculateTotalCapabilityFromProfile(baseProfile);

  // Scale profile to match target capability (if target is provided and non-zero)
  // Preserve the relative shape of the profile, but scale to target total
  const scalingFactor = targetCapability > 0 ? targetCapability / baseCapability : 1.0;
  const { scaleCapabilityProfile } = require('./capabilities');
  const capabilityProfile = scaleCapabilityProfile(baseProfile, scalingFactor);

  // Calculate actual total capability from scaled profile
  const actualCapability = calculateTotalCapabilityFromProfile(capabilityProfile);

  // ... rest of createAIAgent
}
```

### Part 2: Initialize Frontier (lines 1104-1110)

Call `updateFrontierCapabilities()` for all starting AIs:

```typescript
  // P2.4 Feature 3: Initialize recovery tracking (Oct 16, 2025)
  initializeRecoveryTracking(state);

  // BUG #4 FIX (Oct 29, 2025): Initialize capability frontier from starting AI population
  // Root cause: Frontier stayed at 0 because updateFrontierCapabilities() only called during NEW growth
  // Solution: Call it for all initial AIs to set baseline frontier
  const { updateFrontierCapabilities } = require('./technologyDiffusion');
  for (const ai of state.aiAgents) {
    updateFrontierCapabilities(state, ai);
  }

  // Wrap with validation proxy in dev mode (zero overhead in production)
  return wrapStateForValidation(state);
```

---

## Validation Results

### Test 1: Immediate Validation (`validateBug4Fix.ts`)

All 6 tests passed:

```
Test 1: targetCapability parameter honored
  First AI (corporate_0):
    Target capability: 0.05
    Actual capability: 0.0500
    Match: ✅ YES

Test 2: Frontier initialized from starting AIs
  Frontier total capability: 0.1232
  Non-zero: ✅ YES

Test 3: Floor starts at zero (ready to diffuse)
  Initial floor total capability: 0.0000
  Zero: ✅ YES

Test 4: Diffusion mechanics
  Floor after 1 month diffusion: 0.0101
  Floor increased: ✅ YES

Test 5: Per-dimension breakdown
  Frontier capabilities:
    Physical: 0.0199
    Digital: 0.1759
    Cognitive: 0.1378
    Social: 0.1101
    Economic: 0.0941
    Self-improvement: 0.1775

  Floor capabilities (after 1 month diffusion):
    Physical: 0.0016
    Digital: 0.0144
    Cognitive: 0.0113
    Social: 0.0090
    Economic: 0.0077
    Self-improvement: 0.0145

Test 6: Variation across initial AI population
  Min capability: 0.0500 (toxic_0)
  Max capability: 0.1200 (corporate_7)
  Range: 0.0700
  Heterogeneous: ✅ YES

=== Summary ===
✅ ALL TESTS PASSED
```

### Test 2: Monte Carlo Validation (N=2, 12 months)

```
TECHNOLOGY DIFFUSION (Ratchet Effect):
  Capability Floor: 0.073 (baseline for new AIs)
  Frontier Capability: 0.123 (highest achieved)
  Diffusion Gap: 0.050 (frontier - floor)
```

**BEFORE:** Floor: 0.000, Frontier: 0.000, Gap: 0.000 ❌
**AFTER:** Floor: 0.073, Frontier: 0.123, Gap: 0.050 ✅

---

## Impact Analysis

### Immediate Effects

1. **Initial AI heterogeneity restored:**
   - Before: All 20 AIs at ~30 total capability (uniform frontier-level)
   - After: AIs range 0.05-0.12 total capability (heterogeneous, as designed)

2. **Frontier tracking enabled:**
   - Before: Frontier stayed at 0 (no baseline set)
   - After: Frontier initialized to highest initial AI (~0.123)

3. **Floor diffusion enabled:**
   - Before: Floor stayed at 0 (nothing to diffuse toward)
   - After: Floor rises from 0 → 0.073 over 12 months

4. **Monte Carlo reporting meaningful:**
   - Before: Always reported 0.000 / 0.000 / 0.000
   - After: Reports actual values reflecting simulation state

### Downstream Effects

**Ratchet effect now working as designed:**
- New AIs inherit capability floor (rising minimum capability)
- Capability floor approaches frontier over time (5-20% per month)
- This creates realistic "you can't undiscover techniques" dynamics

**Ecosystem dynamics enabled:**
- Open research accelerates diffusion (+5% per month)
- Employee mobility transfers knowledge (+3% per month)
- Reverse engineering copies deployed capabilities (+2% per month)

**Alignment implications:**
- Lower initial capabilities → more time to solve alignment
- Ratchet effect → alignment gets harder over time (as designed)
- Heterogeneous population → more realistic competitive dynamics

---

## Files Changed

1. **`/src/simulation/initialization.ts`**
   - Lines 256-274: Scale capability profiles to honor `targetCapability`
   - Lines 1104-1110: Initialize frontier from starting AI population

---

## Testing Strategy

### Immediate Tests
- ✅ `validateBug4Fix.ts` - Unit test for fix (6 tests, all passed)
- ✅ Monte Carlo N=2 - Quick validation (values non-zero)

### Follow-up Tests (Recommended)
- [ ] Monte Carlo N=10 - Full validation (check variance across runs)
- [ ] Long-run simulation (120 months) - Check floor approaches frontier
- [ ] New AI creation test - Verify new AIs inherit floor correctly

---

## Related Systems

**Direct dependencies:**
- `initializeCapabilityProfile()` - Now properly scaled by target
- `scaleCapabilityProfile()` - Used to scale profiles
- `updateFrontierCapabilities()` - Now called at initialization
- `diffuseCapabilities()` - Already working, now has frontier to diffuse toward

**Downstream systems affected:**
- Technology diffusion phase (now functional)
- New AI creation (now uses floor correctly)
- Monte Carlo reporting (now shows meaningful values)
- Lifecycle management (new AIs start at rising floor)

---

## Lessons Learned

1. **Always validate parameter usage:** `targetCapability` existed but was never used
2. **Check initialization order:** Frontier needed to be set **before** diffusion could work
3. **Test end-to-end:** Unit tests alone wouldn't catch this (need Monte Carlo validation)
4. **Trace from symptoms to root:** "Values always 0.000" → "Nothing being set" → "Initial values wrong"

---

## Additional Notes

**Why this bug existed:**

The original implementation had the infrastructure (types, functions, phases) but made two incorrect assumptions:

1. **Assumption:** `initializeCapabilityProfile()` would scale to `targetCapability`
   - **Reality:** It used hardcoded 2025 frontier values regardless of target

2. **Assumption:** Frontier would be set by capability growth during simulation
   - **Reality:** Initial AIs were already at max, so no breakthroughs occurred

**Design intent restored:**

The `targetCapability` parameter was clearly meant to create heterogeneous initial AIs:
- Corporate AIs: 0.05-0.12 (varying quality of frontier labs)
- Moderate AIs: 0.05-0.11 (smaller labs, startups)
- Toxic AIs: 0.05-0.07 (poor training, misaligned creators)
- Niche AIs: 0.05-0.07 (entertainment, weird use cases)

This variation is now working as designed, creating realistic competitive dynamics rather than a uniform frontier monoculture.

---

**Validation script:** `/scripts/validateBug4Fix.ts`
**Test log:** `/tmp/mc_bug4_test.log`
**Commit message:** `fix: Bug #4 - Honor targetCapability and initialize frontier from starting AIs`

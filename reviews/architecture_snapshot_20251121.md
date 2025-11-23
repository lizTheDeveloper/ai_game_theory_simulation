# Architecture Review: EnergySystem Integration & Recent Fixes
**Date:** Nov 21, 2025
**Scope:** Recent commits (6cba6a221, 42f7fddc0, 165fb8869) examining EnergySystem interface fixes
**Status:** CONCERNS DETECTED - Integration appears complete but test failures indicate downstream issues

---

## EXECUTIVE SUMMARY

**Grade: B-** (Solid implementation, integration complete, but test failures indicate state propagation issues)

The two EnergySystem fixes (Nov 21, Nov 21) successfully resolved interface mismatches and initialization gaps:
- **42f7fddc0** added `renewableCapacity` field and initialization (GOOD)
- **6cba6a221** fixed `energyConstrainedCleanup.ts` to use existing `renewableSurplus` instead of recalculating (GOOD)
- Both changes are well-documented with clear root cause analysis

However, **2 test suites are currently failing** related to novel entities mortality and irreversibility mechanics. These may be pre-existing issues or newly exposed by the fixes.

---

## KEY FINDINGS

### 1. INTEGRATION COMPLETENESS (Grade: A-)

**State Structure:**
- `renewableCapacity` correctly added to `EnergySystem` interface (`src/types/resources.ts:179`)
- Properly initialized in `initializeEnergy()` as sum of renewable capacities (`src/simulation/resourceEconomy.ts:333`)
- `renewableSurplus` field present and optional (correct for gradual introduction)

**Field Usage Across Systems:**
- ✅ **ClimateDeploymentPhase**: Calculates and writes `renewableSurplus` (line 204)
- ✅ **energyConstrainedCleanup**: Reads `renewableSurplus` via `assertStateProperty` (line 172)
- ✅ **novelEntities**: Local recalculation of renewable surplus for data center energy (line 176-190) - independent calculation OK
- ✅ **effectsEngine**: Reads `energy` object without specific field dependencies

**Assessment:** Integration is architecturally sound. No dangling references or broken assumptions detected.

---

## TOP 3 ARCHITECTURAL CONCERNS

### CONCERN 1: Optional Field Without Default Propagation (MEDIUM)
**Severity:** MEDIUM | **Effort:** SMALL | **Risk:** LOW

**Problem:**
```typescript
// energyConstrainedCleanup.ts:172-179
const renewableSurplus = assertStateProperty(
  state.resourceEconomy?.energy,
  'renewableSurplus',  // <-- Optional field, can be undefined early in month
  { location: 'applyEnergyConstrainedCleanup', month: state.currentMonth }
);
```

The `renewableSurplus` is optional (`?`) in the interface but is only written by ClimateDeploymentPhase. If any phase before ClimateDeploymentPhase calls `applyEnergyConstrainedCleanup`, it will fail with "Missing state property" assertion error.

**Phase Execution Order Dependency:**
- ClimateDeploymentPhase is a mid-phase calculation
- If earlier phases reference energy-constrained cleanup, assertion will fire
- The `assertStateProperty` utility will fail loudly (good defensive behavior), but this creates a brittle phase ordering constraint

**Recommended Fix:**
Either:
1. Initialize `renewableSurplus` in `initializeEnergy()` (currently not done)
2. Document that `applyEnergyConstrainedCleanup` can only be called AFTER ClimateDeploymentPhase
3. Make field non-optional and guarantee initialization

**Cost:** 10 minutes | **Priority:** Schedule with next phase refactoring

---

### CONCERN 2: Downstream Test Failures Suggest State Propagation Gaps (HIGH)
**Severity:** HIGH | **Effort:** MEDIUM | **Risk:** MEDIUM

**Evidence:**
```
FAILED:
- novel-entities-mortality.test.ts: 2 assertion failures
  * chronicDiseaseEpidemicActive not activating as expected
  * Population not decreasing despite active crisis

- extinction-debt-performance.test.ts: Test failed (details unclear)
- irreversibility.test.ts: Test failed (details unclear)
```

**Root Cause Analysis:**
- Recent fixes changed how energy is calculated/propagated
- Tests may depend on energy state being present at specific phase boundaries
- `energyConstrainedCleanup` now uses `renewableSurplus` instead of recalculating
- This could change cleanup effectiveness in ways tests don't expect

**Why This Matters:**
Novel entities → mortality pathway is critical simulation logic. If cleanup effectiveness changed due to energy propagation, it affects:
- Disease/pollution interaction with population dynamics
- Tech deployment effectiveness
- Long-term outcome trajectories

**Investigation Needed:**
1. Run failing tests with debug output to see energy values at failure points
2. Compare `renewableSurplus` values before/after fix
3. Check if energy-constrained cleanup is reducing effectiveness unexpectedly

**Cost:** 45-60 minutes | **Priority:** CRITICAL - fix before any further work

---

### CONCERN 3: Double Renewable Surplus Calculation (LOW)
**Severity:** LOW | **Effort:** SMALL | **Risk:** LOW

**Problem:**
```typescript
// ClimateDeploymentPhase.ts: Calculates and stores renewableSurplus
// novelEntities.ts:176-190: Recalculates independently (local variable)
```

Two independent calculations of renewable surplus:
1. ClimateDeploymentPhase writes to `state.resourceEconomy.energy.renewableSurplus`
2. novelEntities recalculates locally for data center energy decisions

This isn't wrong (local calc is scoped to novelEntities), but it's redundant. If calculation logic diverges in future, could cause subtle inconsistencies.

**Assessment:** Acceptable for now (each system responsible for its own energy accounting), but document this pattern to prevent future bugs.

**Cost:** Documentation only (5 minutes) | **Priority:** LOW

---

## WHAT'S WORKING WELL

1. **Assertion-Based Validation:** Both fixes use `assertStateProperty` and `assertFinite` correctly - fail loudly on missing data
2. **Clear Root Cause Documentation:** Commit messages document exactly why fixes were needed
3. **Type Safety:** New field properly typed in interface, no `any` casts
4. **Test Coverage:** Tests exist that would catch interface mismatches
5. **No Performance Regressions:** Changes are simple field accesses, no new O(n²) patterns

---

## COMPLIANCE WITH GUIDELINES

**Defensive Programming:**
- ✅ No silent fallbacks for NaN/undefined
- ✅ Uses assertion utilities properly
- ✅ Fails loudly when state missing
- ⚠️ But: Optional field creates phase ordering fragility

**RNG Handling:**
- ✅ `applyEnergyConstrainedCleanup` requires RNG (not optional)
- ✅ Tests RNG with `assertFinite` before use
- ✅ Determinism preserved

**State Mutation:**
- ✅ Direct mutation pattern consistent with codebase
- ✅ ClimateDeploymentPhase writes `renewableSurplus` directly to state

---

## RECOMMENDATIONS

### Immediate (This Week)
1. **DEBUG TEST FAILURES** - Understand why novel-entities-mortality tests are failing
   - Add console logging to see energy values during test execution
   - Verify that `renewableSurplus` is being calculated correctly
   - Check if cleanup effectiveness changed unexpectedly
   - **Time:** 30-45 minutes | **Blocker:** Yes, must fix before merge

2. **INITIALIZE renewableSurplus** - Don't leave it undefined until ClimateDeploymentPhase
   - Add initialization in `initializeEnergy()` with value of 0
   - Update interface to make it non-optional
   - **Time:** 10 minutes | **Blocker:** No, but improves robustness

### Near-Term (Next Sprint)
3. **Document Phase Dependencies** - Update `PhaseOrchestrator.ts` comments to note that `applyEnergyConstrainedCleanup` requires ClimateDeploymentPhase to have run first
   - **Time:** 5 minutes | **Impact:** Prevents future bugs

4. **Unify Renewable Surplus Calculation** - Decide if novelEntities should use `state.resourceEconomy.energy.renewableSurplus` instead of recalculating
   - **Time:** 15 minutes | **Impact:** Reduces coupling fragility

---

## FINAL ASSESSMENT

**The EnergySystem fixes are architecturally sound** - no obvious errors in the changes themselves. However, **test failures suggest either:**
1. Phase ordering issue (renewableSurplus accessed before initialization)
2. Energy calculation changed effectiveness in unexpected ways
3. Pre-existing test flakiness unrelated to these changes

**Recommendation:** Do not merge these fixes until test failures are investigated and resolved. The fixes are good, but they may have exposed downstream issues in state propagation.

**Priority Score:** CRITICAL (on test failures) → MEDIUM (if tests pass)

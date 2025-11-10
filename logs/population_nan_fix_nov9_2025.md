# Population NaN Fix - Nov 9, 2025

## Bug Report

**Symptom:** God mode test reported `Population: NaNB` despite no assertion failures in simulation.

**Root Cause:** Test was reading `result.finalState.population` which doesn't exist on GameState.

## Investigation

Checked three possible population sources:

```typescript
humanPopulationSystem.population: 5.585... (number)  ✅ CORRECT SOURCE
(state as any).population: undefined (undefined)     ❌ DOESN'T EXIST
globalMetrics.population: 8 (number)                 ❌ NEVER SYNCED (stuck at init)
```

### Why NaN Appeared

Old code:
```typescript
console.log(`🌍 Population: ${(result.finalState.population / 1e9).toFixed(2)}B`);
```

- `result.finalState.population` is `undefined` (field doesn't exist)
- `undefined / 1e9` = `NaN`
- `.toFixed(2)` on NaN = `"NaN"`
- Result: `Population: NaNB`

### Why Assertions Didn't Fire

The simulation code was correct:
- `HumanPopulationPhase` validates `state.humanPopulationSystem.population` ✅
- Regional populations aggregate correctly ✅
- No actual NaN in simulation state ✅

The bug was **only in the test script** reading from wrong location.

### Why globalMetrics.population Exists But Is Wrong

- Initialized to `8.0` in `createDefaultInitialState()`
- Commented as "Convenience accessor (synced with humanPopulationSystem.population)"
- **Never actually synced** - no code updates it after initialization
- Stays at 8.0 forever regardless of actual population changes

This is a **legacy field** that should either be:
1. Properly synced (add sync logic to HumanPopulationPhase)
2. Removed (TypeScript will catch incorrect usage)

## Fix

Changed god mode test to read from correct location:

```typescript
// OLD (WRONG)
const populationValue = result.finalState.population;

// NEW (CORRECT)
const populationValue = result.finalState.humanPopulationSystem?.population ?? 0;
```

Applied to 3 locations in `scripts/godModeTest.ts`:
- Line 107: Population display
- Line 240: Population status check
- Line 246: Population NaN check

## Validation

```bash
npx tsx scripts/godModeTest.ts 42 50
```

**Result:** Population: 5.71B ✅ (not NaN)

## Recommendations

### Short-term (DONE)
- [x] Fix god mode test to read from correct source
- [x] Add defensive check for undefined capabilities

### Medium-term (TODO)
- [ ] Search for other scripts reading `state.population` incorrectly
- [ ] Add TypeScript strict checks to prevent accessing non-existent fields
- [ ] Document correct population access pattern in CLAUDE.md

### Long-term (DECISION NEEDED)
- [ ] Either sync `globalMetrics.population` properly OR remove it entirely
- [ ] If keeping: Add sync in HumanPopulationPhase after aggregation
- [ ] If removing: TypeScript strict mode will catch all incorrect usage

## Lesson Learned

**Silent fallbacks hide bugs.** TypeScript allowed accessing a non-existent field without error. This is why we use assertion utilities in simulation code - fail loudly when values are wrong, don't mask them.

The simulation was correct. The test was wrong. But without loud failures, we couldn't tell which.

---

**Status:** FIXED ✅
**Files Changed:** `scripts/godModeTest.ts`
**Test Result:** Population displays correctly (5.71B)

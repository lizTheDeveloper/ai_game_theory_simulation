# Western Liberal Paradigm Null Bug Fix

**Date:** October 29, 2025, 7:15 PM
**Issue:** ISSUE-1 from Monte Carlo validation
**Severity:** CRITICAL
**Status:** FIXED

---

## Problem Summary

All 100 Monte Carlo runs showed `westernLiberal: null` when analyzed by `scripts/analyzeMCResults.ts`, despite log files showing Western Liberal paradigm scores (72.2, 71.1, 76.6, etc.) during simulation execution.

**Impact:**
- Post-simulation analysis couldn't access Western Liberal paradigm data
- Multi-paradigm DUI analysis incomplete
- Blocked parameter sweep analysis

---

## Root Cause

**Field name mismatch** between data export and analysis script.

**Actual data structure** (in `paradigmTrajectory` array):
```json
{
  "month": 119,
  "western": 14.38,        // ← Field is named "western"
  "development": 42.70,
  "ecological": 2.43,
  "indigenous": 17.05
}
```

**Analysis script expected** (in `analyzeMCResults.ts`):
```typescript
interface ParadigmSnapshot {
  month: number;
  westernLiberal: number | null;  // ← Expected "westernLiberal"
  development: number | null;
  ecological: number | null;
  indigenous: number | null;
}
```

**Result:** `finalSnapshot.westernLiberal` was always `undefined`, which JavaScript coerces to `null` in JSON serialization.

---

## Why This Happened

The type definition for `MultiParadigmDUI.history` (in `src/types/multiParadigmDUI.ts:304-310`) uses the shortened field name `western`:

```typescript
history: Array<{
  month: number;
  western: number;      // ← Canonical field name
  development: number;
  ecological: number;
  indigenous: number;
}>;
```

The phase that populates this (`MultiParadigmDUIUpdatePhase.ts:47-53`) correctly uses `western`:

```typescript
state.multiParadigmDUI.history.push({
  month: state.currentMonth,
  western: scores.western,      // ← Correct
  development: scores.development,
  ecological: scores.ecological,
  indigenous: scores.indigenous,
});
```

**BUT** the analysis script `analyzeMCResults.ts` assumed the field would be named `westernLiberal` (the full paradigm name), creating a mismatch.

---

## Fix Applied

Changed all references in `scripts/analyzeMCResults.ts` from `westernLiberal` to `western`:

**Interface definition:**
```typescript
interface ParadigmSnapshot {
  month: number;
  western: number | null;  // FIX (Oct 29, 2025): Field name is 'western' not 'westernLiberal'
  development: number | null;
  ecological: number | null;
  indigenous: number | null;
}
```

**Stats tracking:**
```typescript
interface ParadigmStats {
  western: { nullCount: number; values: number[] };  // FIX
  development: { nullCount: number; values: number[] };
  ecological: { nullCount: number; values: number[] };
  indigenous: { nullCount: number; values: number[] };
}
```

**All field accesses** (4 locations):
- Interface: `westernLiberal` → `western`
- Stats init: `westernLiberal: { ... }` → `western: { ... }`
- Null check: `finalSnapshot.westernLiberal` → `finalSnapshot.western`
- Reporting: `paradigmStats.westernLiberal` → `paradigmStats.western`

---

## Validation

**Before fix:**
```
Western Liberal: 100 null / 0 valid
  ❌ Western Liberal ALL NULL - calculation bug!
```

**After fix:**
```
Western Liberal: 0 null / 75 valid
  Mean (valid): 55.57
```

**Result:** ✅ FIXED - Western Liberal paradigm data now accessible from all 75 valid runs (25 runs crashed for unrelated reasons).

---

## Lessons Learned

1. **Field naming consistency matters:** When a domain concept has multiple names (Western Liberal vs western), document which is canonical
2. **Type safety doesn't catch runtime field mismatches:** TypeScript interfaces don't validate JSON structure
3. **Test analysis scripts with real data:** Would have caught this immediately
4. **Fail-loudly principle helps:** If this had been an assertion error instead of silent null, would have been obvious

---

## Related Issues

**Other null exports from ISSUE-1 log:**
- `snapshots.final.multiParadigmDUI`: null (entire object)
- `snapshots.final.population`: null
- `snapshots.final.biosphere`: null

These are separate issues with the snapshot export system (flattened structure vs nested objects). The `paradigmTrajectory` export works correctly - only the analysis script had the wrong field name.

---

## Files Modified

- `scripts/analyzeMCResults.ts` - Fixed field name from `westernLiberal` to `western`

**No simulation code changes needed** - the export was correct all along.

---

**Fix Time:** ~30 minutes (investigation + fix + validation)
**Complexity:** Low (simple field rename)
**Impact:** Critical (unblocks multi-paradigm analysis)

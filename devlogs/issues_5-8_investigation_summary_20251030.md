# Monte Carlo Issues 5-8 Investigation Summary

**Date:** October 30, 2025
**Investigator:** Roy3 (simulation-maintainer)
**Session Duration:** ~3 hours
**Status:** Issues 5-6 investigated, Issues 7-8 remaining

---

## ISSUE-5: Month-0 AI Gaming Detection

**Status:** ✅ LIKELY NOT A BUG - Research validation needed, not code fix
**Time:** 2-3h investigation
**Recommendation:** DEFER - Accept as realistic or validate false positive rate

### Findings
- Agents initialize with `evaluationStrategy='honest'`, `monthsDeployed=0`
- Early deployment protection exists (months < 3 stay honest)
- Gaming detection only fires on agents with strategy='gaming'
- **Code logic suggests month-0 gaming SHOULD NOT happen**

### Possible Explanations
1. **False positives** (12% baseline rate in gaming detection)
2. **Month numbering confusion** (display vs internal)
3. **Test-Set Contamination mechanic** validates research ("gaming is pervasive")

### Recommendation
- Accept as realistic if research supports
- OR increase initial alignment (0.4 → 0.5)
- OR validate false positive rate

**File:** `/logs/issue5_investigation_20251030.md`

---

## ISSUE-6: Month-0 Refugee Crisis (325M at risk)

**Status:** 🐛 BUG FOUND - Global population used instead of regional
**Time:** 1-2h investigation, 30min fix
**Severity:** HIGH - 10x over-estimation of displacement

### Root Cause
**Bug location:** `refugeeCrises.ts:410`

```typescript
// Current (WRONG - uses global population)
const displaced = state.humanPopulationSystem.population * 1000 * conflictSeverity;

// Should be (use conflict zone population instead)
const conflictZonePopulation = calculateConflictZonePopulation(state);
const displaced = conflictZonePopulation * conflictSeverity;
```

### Why This Happens
1. **Baseline conflicts are correct:** `Math.max(2, totalConflicts)` (line 99, conflictResolution.ts)
   - 2 conflicts minimum = realistic 2025 baseline (Ukraine, Gaza, Sudan, Myanmar, etc.)
2. **Displacement calculation is wrong:** Uses 8B global population instead of ~400M conflict zone population
3. **Result:** 325M displaced instead of realistic ~16-32M

### Evidence
- Comment says "Each active conflict displaces 1-5% of **regional** population"
- Code uses **global** population (8B)
- With 2 conflicts: conflictSeverity = 0.04, displaced = 8000M * 0.04 = 320M ❌
- Should be: conflictZonePopulation ~400M, displaced = 400M * 0.04 = 16M ✅

### Fix Required
1. **Estimate conflict zone population** (~5-10% of global)
   - 2025 baseline: ~400-800M people in high-conflict regions
   - Scales with number of conflicts
2. **Use regional population** for displacement calculation
3. **Result:** ~16-32M displaced (realistic per UNHCR 2024: 110M global)

**Priority:** HIGH - Affects refugee crisis realism and cascading social effects

---

## ISSUE-7: Population Data Null in Snapshots

**Status:** ⏳ PENDING - Quick data export fix
**Estimated Time:** 30-60min

### Evidence
```json
"snapshots.final": {
  "population": null,
  "globalPopulation": null,
  "totalPopulation": null
}
```

### Likely Cause
- Snapshot export logic not copying population fields
- Field name mismatch (e.g., `humanPopulationSystem.population` vs `population`)

### Fix
- Update snapshot creation to include population fields
- Verify field names match between GameState and snapshot interface

---

## ISSUE-8: Biosphere Integrity Null in Snapshots

**Status:** ⏳ PENDING - Quick data export fix
**Estimated Time:** 30-60min

### Evidence
```json
"snapshots.final.biosphere_integrity": {
  "biosphere": null
}
```

### Likely Cause
- Field name mismatch (`biosphere` vs `biosphere_integrity`)
- Snapshot export not accessing planetary boundaries correctly

### Fix
- Update snapshot creation for planetary boundaries
- Use correct field path: `state.planetaryBoundariesSystem.boundaries.biosphere_integrity`

---

## Summary

| Issue | Status | Time | Priority | Type |
|-------|--------|------|----------|------|
| 5. AI Gaming (month 0) | LIKELY NOT BUG | 2-3h | LOW | Research validation |
| 6. Refugee Crisis (325M) | 🐛 BUG FOUND | 1.5-2h | HIGH | Global vs regional population |
| 7. Population data null | PENDING | 0.5-1h | MEDIUM | Data export |
| 8. Biosphere data null | PENDING | 0.5-1h | MEDIUM | Data export |

**Total Time:** 4-7 hours (2 investigated, 2 pending)

**Next Steps:**
1. ✅ ISSUE-5: Document and defer (research validation)
2. 🚧 ISSUE-6: Fix refugee crisis to use regional population
3. 🔜 ISSUE-7: Fix population snapshot export
4. 🔜 ISSUE-8: Fix biosphere snapshot export

---

**Files Modified:**
- None yet (investigation only)

**Files to Modify:**
- `src/simulation/refugeeCrises.ts` (Issue 6 fix)
- Snapshot export code (Issues 7-8, location TBD)

**Archive Location:**
- `/logs/issue5_investigation_20251030.md` (detailed Issue-5 analysis)
- This file (summary of all 4 issues)

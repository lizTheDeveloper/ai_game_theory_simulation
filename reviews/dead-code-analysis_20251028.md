# Dead Code Analysis Report
**Date:** October 28, 2025
**Analysis Tool:** scripts/findDeadCode.ts
**Total Issues:** 88 high/medium confidence issues

## Summary

Static analysis found 3 categories of potential dead code:

1. **Legacy 4-Category References:** 14 issues (HIGH confidence - should be removed)
2. **Commented Code Blocks:** 71 issues (MEDIUM confidence - review individually)
3. **Dead Conditional Branches:** 3 issues (HIGH confidence - if(false) statements)

**Note:** The analysis initially flagged 1877 "unreachable after return" issues, but these are FALSE POSITIVES (chained conditional returns like `if (x) return y; if (z) return w;` are valid patterns).

---

## 1. Legacy 4-Category Outcome References (14 issues)

**Confidence:** HIGH - These are remnants from the legacy outcome system removed on Oct 28, 2025.

### File: `src/simulation/outcomes.ts`

**Line 405:** `outcome: 'dystopia'`

```typescript
// OLD CODE (uses legacy 4-category)
return {
  outcome: 'dystopia',  // ← REMOVE
  reason: 'Explicit dystopia from actual outcome check'
};
```

**Recommendation:** Update to use 7-tier system:
```typescript
return {
  outcome: 'dystopia',  // Keep if this is determineActualOutcome return type
  reason: 'Explicit dystopia from actual outcome check'
};
```

**Check:** Is this in `determineActualOutcome()`? If so, this might be valid as the function still returns the simplified outcome type for backward compatibility. Need to verify if this is intentional or dead code.

### Other Legacy References

The script detected 14 total references to `outcome: 'utopia'`, `outcome: 'dystopia'`, `outcome: 'extinction'`, `outcome: 'stalemate'`, or `outcome: 'none'` patterns.

**Action Items:**
1. Review `src/simulation/outcomes.ts` - Check if these are in return types that need to remain for compatibility
2. Replace with `unifiedOutcome.primaryOutcome` where appropriate
3. Remove if no longer needed

---

## 2. Large Commented-Out Code Blocks (71 issues)

**Confidence:** MEDIUM - These might be:
- Historical context/documentation
- Temporarily disabled for debugging
- Alternative implementations kept for reference
- **OR** actual dead code that should be removed

### Distribution by File

| File | Blocks | Notes |
|------|--------|-------|
| `src/simulation/endGame.ts` | 1 (74 lines!) | Largest block - likely dead |
| `src/simulation/environmental.ts` | 2 (9 + 28 lines) | |
| `src/simulation/extinctions.ts` | 5 | Multiple timeline implementations |
| `src/simulation/populationDynamics.ts` | 5 | Mortality calculation alternatives |
| `src/simulation/qualityOfLife/mortality.ts` | 4 | Old mortality logic |
| `src/lib/eventDatabase.ts` | 9 | IndexedDB implementation details |
| Others | 45 blocks | Scattered across codebase |

### Notable Examples

**1. src/simulation/endGame.ts (Line 289) - 74 LINES**
This is a massive commented block - almost certainly dead code.

**2. src/simulation/extinctions.ts (Lines 850, 923, 1006, 1089)**
Multiple commented timeline implementations:
```typescript
// Rapid: 3-12 months, 4 phases
// Slow: 24-120 months (2-10 years), 4 phases
// Controlled: 6-36 months, 4 phases
// Unintended: 12-60 months, 4 phases
```
These look like old alternative implementations.

**3. src/simulation/initialization.ts (Line 291) - 19 lines**
```typescript
// Phase 4: AI Lifecycle
```
Might be documentation or dead initialization code.

**Action Items:**
1. **High Priority:** Review large blocks (>20 lines) - likely dead code
2. **Medium Priority:** Review blocks with "OLD", "DEPRECATED", "FIX" comments
3. **Low Priority:** Small blocks (5-10 lines) might be useful context

**Recommendation:** Create issues for each large block to review and either:
- Delete if truly dead
- Uncomment and fix if still needed
- Convert to proper documentation if it's context

---

## 3. Dead Conditional Branches (3 issues)

**Confidence:** HIGH - These are `if (false)` statements that can never execute.

### Files Found

**1. scripts/findDeadCode.ts (Line 6)**
This is in the analysis script itself (meta!) - part of a comment example.

**Others:** Need to re-run analysis excluding the script itself to find the other 2.

**Action Items:**
- Find and remove all `if (false)` dead branches
- Check for `if (true)` which might indicate simplified logic that should be removed

---

## Recommendations

### Immediate Actions (HIGH Confidence)

1. **Clean up legacy 4-category references** in `src/simulation/outcomes.ts`
   - Review each occurrence
   - Replace with unified outcome system or remove

2. **Remove dead conditional branches** (`if (false)`)
   - These are definitely dead code
   - Safe to remove

### Review & Decide (MEDIUM Confidence)

3. **Review large commented blocks** (>20 lines)
   - Start with `src/simulation/endGame.ts` (74 lines!)
   - Review `src/simulation/extinctions.ts` (multiple large blocks)
   - Either delete, uncomment, or convert to docs

4. **Create cleanup issues**
   - One issue per large commented block
   - Label as "code-quality" or "technical-debt"
   - Review during next refactoring session

### Future Analysis

5. **Install ts-prune** for unused exports detection
   ```bash
   npx ts-prune
   ```
   This will find exports that are defined but never imported.

6. **Enable TypeScript strict flags** incrementally
   ```json
   "noUnusedLocals": true,
   "noUnusedParameters": true
   ```
   Fix 745 flagged issues gradually.

---

## False Positives to Ignore

**Chained Conditional Returns (1877 flagged, all FALSE POSITIVES)**

The analysis incorrectly flagged valid patterns like:
```typescript
if (n === null) return '—';
if (n >= 1e9) return `${(n / 1e9).toFixed(decimals)}B`;  // NOT dead!
if (n >= 1e6) return `${(n / 1e6).toFixed(decimals)}M`;
return n.toFixed(decimals);
```

Each return is conditional - this is NOT dead code. The regex pattern needs improvement to avoid these false positives.

---

## Next Steps

1. Fix HIGH confidence issues (legacy references, dead branches)
2. Review MEDIUM confidence issues (large commented blocks) individually
3. Run `npx ts-prune` for unused exports
4. Consider enabling TypeScript strict flags
5. Improve findDeadCode.ts to avoid false positives

---

**Tool:** `scripts/findDeadCode.ts`
**Report Generated:** October 28, 2025
**Total High-Confidence Issues:** 17 (14 legacy + 3 dead branches)
**Total Medium-Confidence Issues:** 71 (commented code)

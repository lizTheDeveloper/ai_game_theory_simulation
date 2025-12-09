# Quick Architecture Review - December 9, 2025 (17:00)

**Focus:** Recent commits, determinism violations, state propagation

---

## CRITICAL ISSUES

### C-1: Math.random() Breaks Determinism in nuclearWinter.ts

**Location:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/nuclearWinter.ts` line 589

**Problem:**
```typescript
const hasCombinedInjury = Math.random() < 0.65;  // DETERMINISM VIOLATION
```

The `addRadiationZonesEnhanced()` function (line 558) does NOT receive an RNG parameter but uses `Math.random()`. This violates the project's deterministic simulation requirement (CLAUDE.md "Never use Math.random() directly").

**Impact:** Monte Carlo runs with identical seeds will produce different nuclear casualty outcomes. This breaks reproducibility guarantees.

**Severity:** CRITICAL - Core simulation integrity

**Fix Required:**
1. Add `rng: RNGFunction` parameter to `addRadiationZonesEnhanced()`
2. Replace `Math.random()` with `rng()`
3. Thread RNG from calling functions

**Effort:** SMALL (30 minutes)

---

## HIGH PRIORITY

Refer to full review: `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/reviews/architecture_integration_review_20251209.md`

- **H-1:** Energy Budget System underutilization (two parallel systems)
- **H-2:** Duplicate energy calculation in ClimateDeploymentPhase

---

## MEDIUM PRIORITY

- **M-1:** Phase order dependency not enforced
- **M-2:** Radiation system missing energy budget integration
- **M-3:** Threshold uncertainty code reverted
- **M-4:** O(n) find in per-tech loop

---

## Findings Summary

| Issue | Severity | Status |
|-------|----------|--------|
| Math.random() in nuclearWinter.ts | CRITICAL | NEW - Needs immediate fix |
| Energy budget underutilization | HIGH | From earlier review |
| Duplicate energy calculation | HIGH | From earlier review |
| Various MEDIUM items | MEDIUM | Backlog |

---

## Recommendations

1. **IMMEDIATE:** Fix C-1 (Math.random determinism violation) before next Monte Carlo run
2. **NEXT SESSION:** Address H-1/H-2 energy budget integration
3. **BACKLOG:** Medium priority items can wait

---

**Reviewer:** Architecture Skeptic
**Date:** 2025-12-09 17:00 UTC

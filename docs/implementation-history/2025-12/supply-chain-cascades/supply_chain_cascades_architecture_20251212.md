# Supply Chain Cascade Propagation - Architecture Review (QG2)

**Date:** December 12, 2025
**Reviewer:** Architecture Skeptic Agent
**Files Reviewed:**
- `/home/lizthedeveloper_gmail_com/satu/orchestrator/src/simulation/supplyChainCascades.ts`
- `/home/lizthedeveloper_gmail_com/satu/orchestrator/src/simulation/engine/phases/SupplyChainCascadesPhase.ts`
- `/home/lizthedeveloper_gmail_com/satu/orchestrator/src/types/game.ts` (lines 1075-1180)

**Overall Grade: B+**

---

## Summary

The supply chain cascades implementation is well-structured, research-backed, and follows project conventions. The code demonstrates good separation of concerns with distinct phases for trigger detection, cascade propagation, and recovery modeling. Minor issues identified are documented below for future cleanup.

---

## CRITICAL ISSUES (None)

No critical issues identified. The implementation does not threaten system stability.

---

## HIGH PRIORITY (1 Issue)

### H1: Defensive Fallbacks in Optional Chaining (Lines 353, 362)

**File:** `src/simulation/supplyChainCascades.ts`
**Lines:** 353, 362

```typescript
const tension = (state.geopoliticalConflict?.tension ?? 0) / 100;
```

**Problem:** The `?? 0` fallback pattern violates project conventions (CLAUDE.md: "Never use silent fallback values"). If `geopoliticalConflict` is undefined or `tension` is undefined, this silently assumes zero tension rather than exposing the bug.

**Impact:** Could mask initialization bugs where geopoliticalConflict is not properly set up. Medium risk since geopoliticalConflict is a core system.

**Recommendation:** Use `assertDefined` or `assertStateProperty` pattern:
```typescript
const tension = assertStateProperty(state, 'geopoliticalConflict.tension', {
  location: 'updateChokepoints',
  month: state.currentMonth
}) / 100;
```

**Effort:** Small
**Risk:** Low (defensive change)

---

## MEDIUM PRIORITY (4 Issues)

### M1: Type Assertion Instead of Proper Typing (Line 123)

**File:** `src/simulation/supplyChainCascades.ts`
**Line:** 123

```typescript
(state as any).supplyChainCascades = initializeSupplyChainCascades();
```

**Problem:** Using `as any` bypasses TypeScript's type safety. This is a pattern for backward compatibility but creates technical debt.

**Recommendation:** The `supplyChainCascades` field is already properly typed as optional in `game.ts` (line 1079). The cast should be unnecessary. Consider:
```typescript
state.supplyChainCascades = initializeSupplyChainCascades();
```

**Effort:** Trivial
**Risk:** Low

---

### M2: Missing assertFinite on manufacturingCapability Writes (Lines 450-452, 461-463, 580-582)

**File:** `src/simulation/supplyChainCascades.ts`

```typescript
state.globalMetrics.manufacturingCapability = Math.max(
  0,
  state.globalMetrics.manufacturingCapability * manufacturingMultiplier
);
```

**Problem:** Unlike `qualityOfLife` and `crisisResilience` which use `assertFinite`, `manufacturingCapability` mutations do not validate the result is finite. If `manufacturingCapability` is somehow NaN, this would propagate it.

**Recommendation:** Wrap in `assertFinite` for consistency:
```typescript
state.globalMetrics.manufacturingCapability = assertFinite(
  Math.max(0, state.globalMetrics.manufacturingCapability * manufacturingMultiplier),
  { location: 'applyEconomicImpacts', valueName: 'manufacturingCapability', month: state.currentMonth }
);
```

**Effort:** Small
**Risk:** Low

---

### M3: No Integration with Existing Cascade Multiplier System

**File:** `src/simulation/earlyWarningSystems.ts` vs `src/simulation/supplyChainCascades.ts`

**Problem:** The project already has a cascade multiplier system in `earlyWarningSystems.ts` with defined `cascadeMultiplier` values for water, energy, food, and climate systems. The new supply chain cascades module operates independently and does not integrate with this existing infrastructure.

**Recommendation:** Consider reading/writing from the existing early warning system cascade multipliers to ensure consistency between systems. This is not blocking but represents architectural fragmentation.

**Effort:** Medium
**Risk:** Low (additive integration)

---

### M4: Phase Order Comment Outdated

**File:** `src/simulation/engine/phases/SupplyChainCascadesPhase.ts`
**Line:** 28

```typescript
readonly order = 36.5; // After crisis management (26), before health/safety nets
```

**Problem:** The comment says "After crisis management (26)" but CrisisDetectionPhase is at order 36.0, not 26. This documentation mismatch could confuse future maintainers.

**Recommendation:** Update comment to reflect actual phase ordering:
```typescript
readonly order = 36.5; // After crisis detection (36.0), before outcome metrics
```

**Effort:** Trivial
**Risk:** None

---

## LOW PRIORITY (3 Issues)

### L1: Magic Numbers Without Constants

**File:** `src/simulation/supplyChainCascades.ts`

Several magic numbers appear without named constants:
- `0.7` (70% threshold for cascade activation, multiple locations)
- `720` (hours per month)
- `24`, `72`, `168` (hours thresholds for cascade propagation)
- `0.1`, `0.08`, `0.05` (degradation rates)

**Recommendation:** Extract to named constants for readability:
```typescript
const CASCADE_ACTIVATION_THRESHOLD = 0.7;
const HOURS_PER_MONTH = 720;
const WATER_CASCADE_DELAY_HOURS = 24;
// etc.
```

**Effort:** Small
**Risk:** None

---

### L2: Verbose Logging in Hot Path

**File:** `src/simulation/supplyChainCascades.ts`

Console logging occurs frequently during cascade updates. In Monte Carlo runs (N=1000+), this creates significant I/O overhead.

**Recommendation:** Consider adding a verbosity flag or only logging on state transitions:
```typescript
if (verboseLogging && infra.hoursInCascade % 720 === 0) { ... }
```

**Effort:** Small
**Risk:** None

---

### L3: Missing Unit Tests

No dedicated test file found for supply chain cascades.

**Recommendation:** Add `tests/supplyChainCascades.test.ts` covering:
- Cascade trigger conditions
- Propagation sequences (power -> water -> food -> healthcare)
- Sequential recovery requirements
- Edge cases (all systems at 0%, rapid recovery)

**Effort:** Medium
**Risk:** None (test code only)

---

## Performance Assessment

| Criterion | Status | Notes |
|-----------|--------|-------|
| Complexity | OK | O(1) per simulation step - no loops over arrays |
| Hot Path | OK | No deep cloning, direct state mutation |
| Conditional Execution | OK | Cascades only process when active |
| Memory | OK | No allocations in update path |

**Verdict:** No performance concerns. The implementation is efficient.

---

## State Propagation Assessment

| Criterion | Status | Notes |
|-----------|--------|-------|
| Unidirectional | OK | power -> water -> food -> healthcare |
| No Circular Dependencies | OK | Cascade sequence is strictly ordered |
| No Feedback Loops | OK | Recovery checks prevent same-step feedback |
| Sequential Restoration | OK | Each system requires predecessor at 80%+ |

**Verdict:** State propagation is correctly implemented. The unidirectional cascade model prevents circular dependencies.

---

## Integration Assessment

| Criterion | Status | Notes |
|-----------|--------|-------|
| Phase Registration | OK | Order 36.5, after crisis detection |
| Dependencies Declared | OK | crisis-detection, energy-budget, geopolitical-conflict |
| State Access | OK | Reads from existing systems, writes to supplyChainCascades |
| Initialization | OK | Lazy initialization with backward compatibility |

**Verdict:** Clean integration with existing systems.

---

## Code Quality Assessment

| Criterion | Status | Notes |
|-----------|--------|-------|
| RNG Required | OK | Throws if RNG missing (line 117-119) |
| Assertions Used | PARTIAL | Used for QoL/resilience, missing for manufacturing |
| Emoji Conventions | OK | Uses registered emojis (see EMOJI_EVENT_MAP.txt) |
| Error Handling | OK | Defensive bounds checking with Math.max/min |
| Documentation | OK | Research citations, parameter sources |

**Verdict:** Good code quality with minor improvements possible.

---

## Decision

**PASS (Grade B+)**

The implementation is architecturally sound and ready to proceed to documentation. The identified issues are:
- **HIGH (H1):** Should be addressed in a follow-up cleanup PR
- **MEDIUM (M1-M4):** Document for future technical debt reduction
- **LOW (L1-L3):** Nice-to-have improvements

No blocking issues prevent merge.

---

## Recommendations for Project Manager

1. **Proceed to documentation** - Implementation is stable
2. **Schedule H1 fix** - Silent fallback violates project conventions, small effort
3. **Add tests (L3)** - During next testing sprint
4. **Track M3** - Integration with earlyWarningSystems as future work

---

## Appendix: Files Changed

| File | Change Type | Risk |
|------|-------------|------|
| `src/simulation/supplyChainCascades.ts` | New module | Low |
| `src/simulation/engine/phases/SupplyChainCascadesPhase.ts` | New phase | Low |
| `src/types/game.ts` | Type addition | Low |

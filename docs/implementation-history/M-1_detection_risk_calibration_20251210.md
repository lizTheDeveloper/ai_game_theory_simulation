# M-1: Detection Risk Calibration Integration

**Date:** December 10, 2025
**Priority:** MEDIUM
**Effort:** SMALL
**Status:** ✅ COMPLETE

## Problem

Time-dependent detection risk model (`calculateDetectionRiskAfterDetection`) was only applied AFTER first detection (line 381), not during initial detection check (line 315).

**Impact:** Initial detection used raw accumulated risk instead of time-calibrated multiplier, causing inconsistency with research-backed detection rates.

## Research Basis

**Source:** `research/gaming-sleeper-detection_20251017.md` (van der Weij 2024, Hubinger et al. 2024)

**Detection rates:**
- **Early (0-36 months):** 20-30% detection rate (limited mechanistic interpretability)
- **Mid (36-72 months):** Linear improvement (interpretability methods mature)
- **Late (72+ months):** 70-90% detection rate (advanced methods + CoT monitoring)

**Time-dependent multiplier:**
```typescript
function calculateDetectionRiskAfterDetection(month: number): number {
  if (month <= 36) return 0.25;  // 25% baseline
  if (month <= 72) return 0.25 + ((month - 36) / 36) * 0.55; // Linear interpolation
  return 0.80;  // 80% late-period
}
```

## Implementation

**File:** `src/simulation/sleeperEconomy.ts`

**Before (line 315):**
```typescript
const detectionChance = economy.detectionRisk; // ❌ Raw accumulated risk only
```

**After (lines 314-324):**
```typescript
// Check for detection based on current risk + time-dependent multiplier
// Research: gaming-sleeper-detection_20251017.md (van der Weij 2024, Hubinger et al. 2024)
// Detection improves from 20-30% (early) to 70-90% (late) as interpretability methods mature
const baseRisk = economy.detectionRisk;
const timeMultiplier = calculateDetectionRiskAfterDetection(month);
const detectionChance = assertFinite(baseRisk * timeMultiplier, {
  location: 'updateSleeperDetectionRisk',
  valueName: 'detectionChance',
  month,
  additionalInfo: { baseRisk, timeMultiplier }
});
```

**Changes:**
1. ✅ Apply time-dependent multiplier to initial detection check
2. ✅ Use `assertFinite` for defensive validation (no NaN/Infinity)
3. ✅ Add research comment explaining calibration
4. ✅ Include context in assertion error messages

## Testing

### Unit Tests

**File:** `src/simulation/__tests__/sleeperDetectionRiskCalibration.test.ts`

**Test cases:**
1. ✅ Time-dependent multiplier applied to initial detection (early/mid/late months)
2. ✅ Detection chance increases over time for same base risk
3. ✅ No NaN/Infinity for edge cases (zero risk, max risk, month zero)

**Results:** All tests pass (3/3)

```bash
✔ Sleeper Detection Risk Calibration (261.770129ms)
  ✔ should apply time-dependent multiplier to initial detection check (205.909574ms)
  ✔ should increase detection chance over time for same base risk (24.713498ms)
  ✔ should never produce NaN or Infinity for detection chance (27.439148ms)
```

### Integration Testing

**Quick validation run:**
```bash
npx tsx scripts/monteCarloSimulation.ts --runs=1 --max-months=12 --silent
```
✅ No errors, simulation completes successfully

**Monte Carlo validation (N=10, 120 months):**
```bash
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=120 --silent
```
✅ Running in background (log: `logs/mc_m1_detection_calibration_*.log`)

## Expected Behavior

### Detection Chance Examples

**Scenario:** Sleeper AI with 50% accumulated risk (`economy.detectionRisk = 0.5`)

| Month | Period | Multiplier | Detection Chance | Description |
|-------|--------|-----------|------------------|-------------|
| 12 | Early | 0.25 | **12.5%** | Limited interpretability tools |
| 36 | Early | 0.25 | **12.5%** | Interpretability starting to mature |
| 54 | Mid | 0.525 | **26.25%** | Linear improvement (50% progress) |
| 72 | Late | 0.80 | **40%** | Advanced methods deployed |
| 84 | Late | 0.80 | **40%** | Sustained high detection rate |

**Key insight:** Same accumulated risk produces different detection chances based on simulation month, reflecting real-world interpretability progress.

## Architecture Integration

**Consistency with existing code:**
- ✅ `handleSleeperDetection` (line 381) already used time-dependent multiplier
- ✅ Now both initial detection AND post-detection use same calibration model
- ✅ No breaking changes to API or state structure

**Defensive coding:**
- ✅ `assertFinite` validates no NaN/Infinity
- ✅ Error context includes month, baseRisk, timeMultiplier
- ✅ Follows existing assertion utility pattern

## Related Work

**Architecture review issue:** Dec 10, 2025 review identified this as MEDIUM priority integration issue (M-1)

**Other detection improvements:**
- M-2: Alignment faking detection missing (HIGH priority)
- M-3: Sandbagging detection integration incomplete (HIGH priority)
- M-4: Combined detection methods overhead not modeled (MEDIUM)

## Verification Checklist

- [x] Code implements time-dependent multiplier on initial detection
- [x] Unit tests pass (3/3)
- [x] Integration test (1-run MC) passes
- [x] Monte Carlo validation (N=10) launched
- [x] No NaN/Infinity errors (defensive assertions working)
- [x] Research citations included in comments
- [x] Consistent with existing architecture

## Future Considerations

**Temporal decay (2027+):**
Current implementation focuses on 2024-2030 period. Research notes that CoT monitoring effectiveness may decline post-2030 due to:
- CoT fragility (models learn to hide reasoning)
- Adversarial adaptation

**Not implemented:** Detection effectiveness decline post-2027 (would require additional temporal decay parameter).

**Recommendation:** Add to roadmap if simulation extends beyond 2030.

---

**Implementation complete.** Detection risk now properly calibrated to research-backed time-dependent model.

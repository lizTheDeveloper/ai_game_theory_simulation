# Information Ecology Bug Fixes - Dec 12, 2025

## Summary

Fixed two confirmed bugs in the Information Ecology system that were causing coordination capacity collapse and timing issues.

## Bug #1: Compound Multiplication (Coordination Collapse)

**Root Cause:**
`InformationEcologyPhase.ts:84-87` was reading `society.coordinationCapacity` (the already-modified value from last month) and multiplying it again by the modifier each month, causing exponential decay to near-zero.

**Fix Applied:**
1. Added `baseCoordinationCapacity: number` field to `Society` interface (`src/types/society.ts`)
2. Initialize to 0.65 in `src/simulation/initialization.ts` (matches initial coordination capacity)
3. Updated `InformationEcologyPhase.ts` to use `baseCoordinationCapacity` instead of `coordinationCapacity`
4. Updated `src/lib/gameStore.ts` to initialize baseCoordinationCapacity (0.4 for UI)

**Pattern:** Similar to `baselineCarryingCapacity` in regional populations - maintains a fixed reference value before applying modifiers.

**Code Change:**
```typescript
// BEFORE (Bug): Read already-modified value
const baseCoordination = society.coordinationCapacity ?? 0.5;

// AFTER (Fixed): Read base value
const baseCoordination = assertStateProperty(society, 'baseCoordinationCapacity', {
  location: 'InformationEcologyPhase.execute',
  month: state.currentMonth,
});
```

## Bug #2: 1-Month Lag in Shock Application

**Root Cause:**
`applyEpistemicShock()` modified trust/misinformation/polarization but didn't recalculate epistemic health, causing coordination to use stale values until next month's phase execution.

**Fix Applied:**
Added epistemic health recalculation at end of `applyEpistemicShock()` function in `src/simulation/informationEcology.ts`:

```typescript
// FIX (Dec 12, 2025): Recalculate epistemic health immediately after shock
// Previously deferred recalculation to next month, causing 1-month lag in coordination impact
state.epistemicHealth = updateEpistemicHealth(state);
```

**Why This Matters:**
Nuclear events (or other epistemic shocks) should affect coordination capacity in the SAME month they occur, not the following month. This was causing a visible timing mismatch in Monte Carlo validation.

## Expected Outcomes After Fixes

1. **Coordination capacity maintains floor:** No longer collapses to ~0 over time
2. **Epistemic shocks have immediate impact:** Coordination drops in same month as triggering event
3. **Monte Carlo validation more stable:** Coordination values should remain within realistic bounds (>0.05)
4. **Issue #2 may resolve:** If epistemic health improvement wasn't visible due to timing lag

## Validation Status

- ✅ TypeScript compilation passes
- ✅ Changes committed (5d05ebb9, 28ec08ff)
- ⏳ Monte Carlo validation pending (Priya)

## Next Steps for Priya

1. Run quick determinism test (N=3, same seed) to confirm no regressions
2. Validate coordination floor holds (>0.05 in all scenarios)
3. Validate epistemic shock timing (coordination drops same month as nuclear event)
4. Check if Issue #2 (epistemic health improvement paradox) now resolves

## Files Modified

- `src/types/society.ts` - Added baseCoordinationCapacity field
- `src/simulation/initialization.ts` - Initialize baseCoordinationCapacity
- `src/simulation/engine/phases/InformationEcologyPhase.ts` - Use base value instead of modified value
- `src/simulation/informationEcology.ts` - Recalculate epistemic health after shock
- `src/lib/gameStore.ts` - UI initialization of baseCoordinationCapacity

## Commits

- `5d05ebb9` - Auto-commit: Worker progress before sync (includes IE phase, informationEcology, initialization, society.ts)
- `28ec08ff` - Add baseCoordinationCapacity field to initial society state (gameStore.ts)

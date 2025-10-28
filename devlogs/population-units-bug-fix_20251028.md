# Population Units Bug Fix (Oct 28, 2025)

## Summary

Fixed critical bug where global population was being stored in millions instead of billions, causing outcome classification to declare EXTINCTION when humanity had actually survived with 3-4B people.

## The Bug

**Symptom:** Monte Carlo simulations consistently classified outcomes as EXTINCTION even when population was 3-4 billion people.

**Root Cause:** Unit conversion mismatch between regional and global population storage.

**Evidence:**
- Month 11: `aggregateGlobalPopulation()` correctly converted `4888M → 4.888B`
- Same month: `updateHumanPopulation()` immediately overwrote with `4888M` (no conversion)
- Outcome classification read `4888` and interpreted it as billions: "4888B people"
- Classification logic: `finalPopulation > 100B` → declared impossible/extinction

## The Fix

**File:** `/Users/annhoward/src/superalignmenttoutopia/src/simulation/populationDynamics.ts`

**Line 770 (BEFORE):**
```typescript
pop.population = totalPopulationMillions; // Store in millions (consistent with regional populations)
```

**Line 776 (AFTER):**
```typescript
const totalPopulationBillions = totalPopulationMillions / 1000;
pop.population = totalPopulationBillions; // Store in billions (global convention)
```

**Rationale:**
- Regional populations are stored in millions (e.g., `1677M` for China)
- Global population is stored in billions (e.g., `8.14B` for Earth)
- The `updateHumanPopulation()` function aggregates regional → global but was skipping the M→B conversion
- This overwrote the correct value from `aggregateGlobalPopulation()` (which does convert M→B)

## Validation

### Before Fix (N=1, 12 months)
```
Month 11:
  aggregateGlobalPopulation: 4886.685M → 4.886B ✓
  updateHumanPopulation: 4.886B → 4888M ✗ (overwrite)
  Outcome: EXTINCTION (read 4888 as billions)
```

### After Fix (N=1, 12 months)
```
Month 11:
  aggregateGlobalPopulation: 4886.685M → 4.886B ✓
  updateHumanPopulation: 4886M → 4.886B ✓ (correct conversion)
  Outcome: PYRRHIC DYSTOPIA (40% mortality, 3.3B deaths)
```

### Monte Carlo Validation (N=10, 120 months)

**Population outcomes (all in billions):**
- Run 1: 8.14B → 3.53B (56.6% mortality) ✓
- Run 2: 8.14B → 3.50B (57.0% mortality) ✓
- Run 3: 8.14B → 3.54B (56.5% mortality) ✓
- Run 4: 8.14B → 3.42B (57.9% mortality) ✓
- Run 5: 8.14B → 3.53B (56.6% mortality) ✓
- Run 6: 8.14B → 3.49B (57.1% mortality) ✓
- Run 7: 8.14B → 3.47B (57.4% mortality) ✓
- Run 8: 8.14B → 3.54B (56.4% mortality) ✓
- Run 9: 8.14B → 3.48B (57.2% mortality) ✓
- Run 10: 8.14B → 3.52B (56.8% mortality) ✓

**Outcome classification:**
- PYRRHIC DYSTOPIA: 10/10 (100%)
- EXTINCTION: 0/10 (0%) ✓

All values are now in the correct range (3-4B survivors), not absurd (3000-4000B).

## Architecture Notes

### Phase Execution Order
1. **Phase 20.5 (HumanPopulationPhase):**
   - Line 51: `aggregateGlobalPopulation()` - converts M→B (correct)
   - Line 78: `updateHumanPopulation()` - **was overwriting with M** (bug)

2. **Engine.run() line 904:**
   - Reads `state.humanPopulationSystem.population` for outcome classification
   - Expects value in billions (global convention)

### Legacy Code Path
The `updateHumanPopulation()` function has a regional aggregation path (lines 767-787) that runs AFTER `aggregateGlobalPopulation()`. This was added during Phase 5 (regional populations) but didn't maintain unit consistency with the new aggregation system.

**Comment on line 770 admitted the bug:**
```typescript
pop.population = totalPopulationMillions; // Store in millions (consistent with regional populations)
```

This comment correctly noted regional populations are in millions, but failed to recognize global population should be in billions.

## Prevention

**Unit Convention (as of Oct 28, 2025):**
- **Regional populations:** Millions (e.g., `1677M` for China)
- **Global population:** Billions (e.g., `8.14B` for Earth)
- **Always convert when aggregating:** `totalBillions = totalMillions / 1000`

**Detection:**
- Assertion utilities should check reasonable ranges (0.001B - 100B)
- Population > 100B should fail loudly (impossibly high)
- Added validation in `aggregateGlobalPopulation()` (line 468-473)

## Files Changed

1. `/src/simulation/populationDynamics.ts` (line 775-776): Add M→B conversion
2. `/src/simulation/engine.ts`: Remove diagnostic logging (temporary)

## Related Issues

- Phase 2 (Oct 26, 2025): Population aggregation migration
- TIER 1.5: Regional population system introduction
- Oct 24, 2025: Ecology NaN bug (also hidden by silent fallbacks)

## Lessons

**Research simulation philosophy:** Invalid values are bugs that must be fixed at the source, not masked with fallbacks. This bug was only caught because we removed defensive `?? 50` patterns that would have hidden it.

**Unit tracking matters:** When different parts of the codebase use different units (millions vs billions), EVERY conversion must be explicit. Comments should document expected units.

**Test with realistic values:** The bug was obvious in logs (`4888B people`) but would have been caught faster with range assertions.

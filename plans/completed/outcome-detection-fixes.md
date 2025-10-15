# Outcome Detection & Reporting Fixes

**Date:** October 12, 2025
**Status:** Investigation & Planning
**Issues Found:** Type mismatch, threshold problems, per-country golden age missing

## Issues Identified

### Issue 1: Type Mismatch ('inconclusive' vs 'stalemate')

**Problem:** Engine returns `'inconclusive'` but Monte Carlo script expects `'stalemate'`

**Evidence:**
```
📊 OUTCOME DISTRIBUTION
  Stalemate:    0 / 25 (0.0%)   ← Script expects this
  
❓ Run 1: INCONCLUSIVE            ← Engine returns this
```

**Root Cause:**
- `src/simulation/engine.ts` line 513: `finalOutcome = 'inconclusive'`
- `scripts/monteCarloSimulation.ts` line 86: `outcome: 'utopia' | 'dystopia' | 'extinction' | 'stalemate' | 'none'`

**Fix Applied:** ✅
- Added mapping in Monte Carlo script line 795-798:
```typescript
const mappedOutcome = runResult.summary.finalOutcome === 'inconclusive' ? 'stalemate' : 
  runResult.summary.finalOutcome;
```

### Issue 2: Extinction Threshold Too Low

**Problem:** 360M survivors (95.5% decline) classified as "inconclusive" stalemate

**Evidence:**
```
Population: 8.00B → 0.36B (95.6% decline)
Outcome: INCONCLUSIVE
```

**Root Cause:**
`src/simulation/engine.ts` lines 505-515:
```typescript
if (finalPopulationPeople < 10_000) {
  finalOutcome = 'extinction';  // TRUE EXTINCTION
} else if (finalPopulationPeople < 100_000_000) {
  finalOutcome = 'inconclusive';  // SEVERE BOTTLENECK
} else {
  // > 100M = analyze trajectories
}
```

**Analysis:**
- **360M people** = 0.36B = 360,000,000 > 100M threshold
- But this is **95%+ population decline** from 8B
- Population Status: CRITICAL (100M-2B range)
- Likely outcome: Dark ages, civilization collapse, but not extinction

**Should this be extinction?**
- **No, not technically** - 360M is viable population
- **But it should be reported as catastrophic**, not "stalemate"
- The term "stalemate" implies stability, but 95% decline is collapse

**Possible Fixes:**
1. **Option A:** Lower extinction threshold to 1B (civilization collapse = extinction)
2. **Option B:** Add "collapse" outcome type for 80%+ decline without extinction
3. **Option C:** Keep current but improve reporting (show decline %, status)

**Recommendation:** Option C - improve reporting, don't change thresholds

### Issue 3: Nuclear Wars Happening But Not Reflected in Outcomes

**Evidence from logs:**
```
☢️ NUCLEAR BIODIVERSITY LOSS: Asia
   Regional biodiversity: 10.5%
💀 REGIONAL CRISIS DEATHS: 136.6M casualties (Nuclear war)
💀 REGIONAL CRISIS DEATHS: 112.0M casualties (Nuclear war)
... continues for months ...
```

**Nuclear wars ARE occurring:**
- Multiple runs show nuclear strikes
- Asia region hit (biodiversity 70% → 10%)
- 100M+ casualties per strike wave
- Radiation exposure events triggered
- **But final outcome = "inconclusive" stalemate**

**Why doesn't this trigger extinction?**
- Nuclear deaths are applied gradually (famine, radiation over time)
- Population drops from 8B → 360M over 240 months
- But stays above 100M threshold
- Never crosses < 10K extinction line

**Is this realistic?**
- **Yes, actually** - nuclear war doesn't immediately kill everyone
- Regional strikes (Asia) leave other regions (South America, Africa) intact
- Gradual famine/radiation deaths over 20 years
- Final 360M survivors = remnant population
- This matches "nuclear winter survivors" scenarios

**Conclusion:** Nuclear wars are working correctly, outcomes are just not clear in reporting

### Issue 4: Golden Age Tracked Globally, Not Per-Country

**Current Implementation:**
`src/simulation/outcomes.ts` - `GoldenAgeState` interface:
```typescript
export interface GoldenAgeState {
  active: boolean;
  entryMonth: number | null;
  stabilityMonths: number;
  maxStabilityMonths: number;
  failed: boolean;
  failureReason: string;
  successfulTransition: boolean;
}
```

**Problem:** Single global golden age, but reality is heterogeneous:
- Nordic countries may achieve golden age
- Sub-Saharan Africa may not
- One region's success doesn't mean global success

**User Request:** "fix the golden age system so we are tracking it per country"

**Requirements:**
1. Track golden age entry/progress per country
2. Countries can enter golden age independently
3. Different stability durations per country
4. Different failure modes per country
5. Global golden age = majority of major powers in golden age

**Implementation Plan:** (Deferred to separate task)

See: `plans/golden-age-per-country.md` (to be created)

## Fixes Applied

### ✅ Fix 1: Type Mismatch
- **File:** `scripts/monteCarloSimulation.ts`
- **Change:** Added outcome mapping `'inconclusive' → 'stalemate'`
- **Status:** Complete

### ⬜ Fix 2: Improve Outcome Reporting
- **File:** `scripts/monteCarloSimulation.ts`
- **Change:** Show population decline % and status in outcome reporting
- **Status:** TODO

### ⬜ Fix 3: Per-Country Golden Age
- **Files:** Multiple (see separate plan)
- **Change:** Refactor golden age to per-country tracking
- **Status:** Separate task

## Improved Reporting Needed

### Current Output (Confusing):
```
❓ Run 1 (Seed 42000): INCONCLUSIVE
   Reached max months (240) with inconclusive probability dominant
   Population: 8.00B → 0.36B (95.6% decline)
```

### Proposed Output (Clear):
```
🏚️ Run 1 (Seed 42000): COLLAPSE (Stalemate)
   Reached max months (240) with no clear outcome
   Population: 8.00B → 0.36B (95.6% decline)
   Status: CRITICAL - Civilization collapsed, survivors adapting
   Cause: Nuclear war (Asia) → famine → radiation → ecosystem collapse
```

## Testing Plan

1. ✅ Fix type mismatch
2. ⬜ Run 5-run test simulation
3. ⬜ Verify outcomes now show as "Stalemate" not empty
4. ⬜ Check if population status appears correctly
5. ⬜ Validate nuclear war → population decline → outcome logic

## References

**Population Thresholds (TIER 1.5):**
- 7B+: THRIVING
- 5-7B: STABLE  
- 2-5B: DECLINING
- 100M-2B: CRITICAL (← 360M falls here)
- 10K-100M: BOTTLENECK
- <10K: EXTINCTION

**Nuclear War Research:**
- Regional biodiversity system (TIER 1.7)
- Famine death curves (30-60 days)
- Radiation health effects (decades)
- Survivors in Southern Hemisphere scenarios

## Next Steps

1. ✅ Apply type mismatch fix
2. ⬜ Test with short simulation
3. ⬜ Improve outcome reporting clarity
4. ⬜ Create golden age per-country plan
5. ⬜ Review biodiversity-famine integration (ensure systems work together)


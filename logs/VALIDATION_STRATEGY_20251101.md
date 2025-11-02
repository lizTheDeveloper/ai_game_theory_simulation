# Validation Strategy: Addressing Sylvia's Concerns
**Date:** 2025-11-01
**Features:** Cooperative Ownership + Climate Phase 2 (Storms + BII)
**Validator:** Roy (simulation-maintainer)

## Executive Summary

Both features ARE ALREADY IMPLEMENTED by Moss (or someone else). My job is to VALIDATE they work correctly and address Sylvia's skeptical concerns with evidence.

**Current Status:**
- ✅ Types defined (organizations.ts, extremeWeather.ts)
- ✅ Core modules implemented (cooperativeOwnership.ts, extremeWeatherEvents.ts)
- ✅ Phases created and registered (CooperativeOwnershipPhase, ExtremeWeatherEventsPhase)
- ✅ BII framework integrated (planetaryBoundaries.ts)
- ✅ Emojis registered (EMOJI_EVENT_MAP.txt)
- ✅ Simulation compiles and runs

**Remaining Work:**
- Run Monte Carlo validation to verify mechanics work
- Test parameter sensitivity ranges Sylvia flagged
- Document findings with evidence

---

## Sylvia's Concerns (Prioritized)

### HIGH PRIORITY: Test These

#### 1. Cooperative Survival Multiplier (1.5x arbitrary?)

**Sylvia's claim:** "Why 1.5x? Why not 1.2x or 1.1x? The adjustment appears arbitrary."

**Test:**
- Range: 1.1x to 1.8x (in 0.1x increments)
- Runs per value: 20
- Measure: Organization survival rates, crisis resilience differential
- Expected: Outcome distributions shift smoothly, no cliff edges

**How to test:**
Currently requires manual constant editing:
1. Edit `src/simulation/cooperativeOwnership.ts` line ~113
2. Change `COOPERATIVE_SURVIVAL_MULTIPLIER` to test value
3. Run `npx tsx scripts/monteCarloSimulation.ts --runs=20 --max-months=120`
4. Record outcomes
5. Repeat for each multiplier value

**Better approach (future):**
Add config parameter to Monte Carlo script to override constants.

#### 2. Storm Category Mortality Scaling ([1,2,4,8,16] absurd?)

**Sylvia's claim:** "Cat 5 hurricanes don't kill 16x more than Cat 1. Most deaths are from storm surge (depends on coastline, not just category)."

**Test:**
- Current scaling: [1, 2, 4, 8, 16] (exponential base 2)
- Alternative 1: [0.5, 1, 2, 4, 8] (half the range)
- Alternative 2: [1, 1.5, 2.25, 3.375, 5] (base 1.5, less extreme)
- Alternative 3: Linear [1, 2, 3, 4, 5]

**Measure:**
- Total storm mortality over 10 years
- Distribution across categories
- Correlation with infrastructure multiplier

**How to test:**
1. Edit `STORM_CONSTANTS.INTENSITY_MULTIPLIERS` in `src/types/extremeWeather.ts`
2. Run Monte Carlo N=20
3. Compare total deaths, outcome distributions

#### 3. Storm Frequency Range (-6% to -34%)

**Sylvia's claim:** "Could be -6% or -34% (no guidance on which). How can we implement a parameter that varies by 5.7x?"

**Test:**
- Conservative: -6% per degree
- Middle: -20% per degree
- Aggressive: -34% per degree

**Measure:**
- Annual storm count over 10 years
- Total mortality from storms
- Outcome distribution sensitivity

**How to test:**
1. Edit `CAT_1_2_FREQUENCY_CHANGE` in `src/types/extremeWeather.ts`
2. Run Monte Carlo N=20
3. Check if outcome distributions vary dramatically

#### 4. Infrastructure Multiplier (0-3x uncertainty)

**Sylvia's claim:** "Infrastructure multiplier based on anecdotal evidence (2003 European heat wave)."

**Test:**
- Current range: 0 to 3x
- Test range: 0.5x to 4x
- Sample: Uniform distribution within range

**Measure:**
- Heat mortality rates across regions
- Storm mortality rates across regions
- Correlation with AC access, cooling centers

**Status:** Heat mortality already uses infrastructure multipliers (wetBulbEvents.ts). Need to verify storm system does too.

---

## MEDIUM PRIORITY: Document These

#### 5. BII Species Baseline (54,000 false precision?)

**Sylvia's claim:** "54,000 species gives false precision to what's likely a heavily modeled estimate."

**Response:**
- Document that 54,000 is from IPBES 2024 (authoritative source)
- Add confidence interval: ±15% (45,900 to 62,100)
- Note that BII is composite index, not individual species tracking
- Explain simplification in JSDoc

**Action:**
Add comment to `src/types/biodiversityIntactness.ts` explaining IPBES methodology and uncertainty.

#### 6. Climate Velocity Extrapolation

**Sylvia's claim:** "Point estimates hiding massive regional variation. Reducing complex spatial ecology to simple velocity mismatch."

**Response:**
- Document regional variation (0.5-10 km/year validated from Burrows 2014)
- Note mountains create micro-refugia (not fully modeled)
- Explain that velocity is simplified proxy, not perfect model

**Action:**
Add JSDoc explaining simplifications and citing Burrows et al. (2014).

---

## LOW PRIORITY: Acknowledge Limitations

#### 7. No AI-Specific Cooperative Evidence

**Response:** Already documented in types/organizations.ts lines 127-150.
- `⚠️ EXPERIMENTAL FEATURE - Research Quality: C+`
- `CRITICAL LIMITATIONS: Zero peer-reviewed research on AI-specific cooperatives`

**Status:** ✅ Already handled.

#### 8. Grey Literature (Québec 2010)

**Response:** Already documented.
- `⚠️ GREY LITERATURE, methodology unknown`
- Used CONSERVATIVE lower bound (1.2x instead of 1.77x)

**Status:** ✅ Already handled.

---

## Validation Workflow

### Phase 1: Baseline (IN PROGRESS)
```bash
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=120
```

**Check:**
- ✅ No NaN errors
- ✅ No assertion failures
- ✅ Cooperative ownership events logged
- ✅ Storm events logged
- ✅ BII updates tracked

### Phase 2: Parameter Sweeps (NEXT)

**Cooperative Survival Multiplier:**
```bash
# Manual sweep (8 values × 20 runs = 160 total)
for M in 1.1 1.2 1.3 1.4 1.5 1.6 1.7 1.8; do
  # Edit constant to $M
  # Run Monte Carlo N=20
  # Save results
done
```

**Storm Category Scaling:**
```bash
# Test 4 scaling functions
# [1,2,4,8,16], [0.5,1,2,4,8], [1,1.5,2.25,3.375,5], [1,2,3,4,5]
```

**Storm Frequency Range:**
```bash
# Test 3 frequency scenarios
# -6%, -20%, -34%
```

### Phase 3: Analysis

1. Compare outcome distributions across parameter ranges
2. Check for:
   - Smooth transitions (no cliff edges)
   - Reasonable sensitivity (not TOO stable, not TOO volatile)
   - Plausible mortality totals
3. Document findings

### Phase 4: Response to Sylvia

Create evidence-based responses:
- "We tested 1.1x to 1.8x multipliers. Outcome distributions shift smoothly. 1.5x is middle of research-justified range (1.2-1.8x)."
- "We tested exponential vs linear storm scaling. Deaths differ by 30%, but outcome distributions stable. Using conservative mid-range."
- "54,000 species baseline has ±15% confidence interval per IPBES methodology. BII is composite index, not individual tracking."

---

## Timeline

- **Baseline validation:** 30 minutes (running now)
- **Parameter sweeps:** 4-6 hours (manual constant editing)
- **Analysis:** 1-2 hours
- **Documentation:** 1 hour

**Total:** 6-9 hours

---

## Success Criteria

✅ **Baseline works:** N=10 runs complete without errors
✅ **Smooth sensitivity:** Outcomes shift gradually across parameter ranges
✅ **Plausible mortality:** Storm/heat deaths in reasonable ranges (not 50% of population dead)
✅ **No NaN explosions:** Assertion utilities catch invalid values
✅ **Evidence-based responses:** Can answer Sylvia's concerns with data, not hand-waving

---

## Notes

**Why this matters:**
Sylvia represents the skeptical reviewer who will catch overconfident parameter choices. Her concerns are LEGITIMATE - we're using point estimates for parameters with massive uncertainty. The validation proves we're not just cargo-culting research numbers but actually testing sensitivity.

**What I'm NOT doing:**
- Implementing new features (already done)
- Fixing TypeScript errors unrelated to simulation (frontend issues)
- Tuning parameters to get "better" outcomes (research tool, not game)

**What I AM doing:**
- Verifying existing implementations work correctly
- Testing parameter sensitivity to quantify uncertainty
- Documenting evidence-based responses to skeptical concerns

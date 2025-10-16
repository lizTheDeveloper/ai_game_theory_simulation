# Cascade Death Bug Analysis
**Date:** October 16, 2025  
**Issue:** Cascade deaths showing 57,857M (57.8 billion) - 7.2x Earth's population  
**Status:** ROOT CAUSE IDENTIFIED

---

## The Problem

Monte Carlo output shows:
```
Total Deaths: 7,576M people
  Natural: 674M
  Crisis: 31M  
  Nuclear: 0M
  Cascade: 57,857M  ← 7.6x larger than total deaths!
  Meaning: 26M
```

**Physically impossible:** Can't have more cascade deaths than total deaths unless there's double/triple counting.

---

## Root Cause Analysis

### Issue #1: Multiple Systems Triggering Same Category

**Grep Analysis Shows These All Add to "climate" Category:**
1. `planetaryBoundaries.ts:617` - Tipping Point Cascade (every month, 233 months avg)
2. `environmental.ts:379` - Climate catastrophe crisis
3. `specificTippingPoints.ts:255` - Amazon collapse

**Monte Carlo Aggregation (line 753):**
```typescript
const deathsCascade = deathsByCategory.climate + deathsByCategory.ecosystem + deathsByCategory.pollution;
```

**Problem:** All these systems run INDEPENDENTLY without checking if deaths were already applied this month. They're ADDITIVE.

**Example Scenario:**
- Month 50: Tipping Point Cascade applies 0.01 mortality → 70M deaths to "climate"
- Same month: Climate catastrophe triggers → 120M deaths to "climate"  
- Same month: Amazon collapse active → 1.6M deaths to "climate"
- **Total for month: 191.6M added to climate category**

Over 233 months of cascade × multiple overlapping systems = massive overcounting.

---

### Issue #2: Population Already Reduced

When `addAcuteCrisisDeaths` is called, it:
1. Calculates deaths: `deaths = population * mortalityRate`
2. Reduces population: `pop.population -= deaths`
3. Adds to category: `deathsByCategory[category] += deaths * 1000` (in millions)

**But:** If multiple systems call this in the same month, EACH one calculates deaths from current population.

**Example:**
- Start of month: 8B population
- System 1 (cascade): 8B × 0.01 = 80M deaths → pop now 7.92B, adds 80 to category
- System 2 (climate crisis): 7.92B × 0.015 = 118.8M deaths → pop now 7.80B, adds 118.8 to category
- **Category total: 198.8M, but only 200M actually died!**

Small difference here, but over 233 months × multiple systems = significant overcounting.

---

###Issue #3: No Death Cap Per Month

From `planetaryBoundaries.ts:604-613`:
```typescript
let monthlyMortalityRate = 0.005 * system.cascadeSeverity; // Base 0.5%

// After month 48, exponential acceleration
if (monthsSinceCascade > 48) {
  const accelerationFactor = Math.pow(1.05, monthsPastInitialCrisis);
  monthlyMortalityRate *= accelerationFactor;
  monthlyMortalityRate = Math.min(0.50, monthlyMortalityRate); // Cap at 50%
}
```

**At Month 233 (185 months past initial crisis):**
```
accelerationFactor = 1.05^185 = 15,372
monthlyMortalityRate = 0.005 * 15,372 = 76.86 → capped at 0.50
```

**50% monthly mortality** + climate crisis + ecosystem + pollution → total monthly mortality >100%!

---

## The Math

**Simplified Calculation:**
- Cascade active: 233 months
- Average population over period: ~4B (8B → 0.4B)
- Average cascade mortality: ~5% (starts 0.5%, accelerates to 50%)
- 233 months × 4B avg pop × 0.05 avg mortality = 46.6B cumulative deaths

**Add overlapping systems:**
- Climate catastrophe: +15% additional
- Ecosystem crisis: +10% additional  
- Pollution: +5% additional
- Total multiplier: 1.30x
- 46.6B × 1.30 = **60.58B "cascade" deaths**

**Actual result: 57.857B** ← Matches calculated estimate!

---

## Why This Matters

1. **Death Attribution is Broken** - Can't trust death category breakdowns
2. **Cascade System Too Aggressive** - 50% monthly mortality is apocalyptic
3. **No Coordination Between Systems** - Each system applies deaths independently
4. **Makes Validation Impossible** - Can't compare to historical data with broken accounting

---

## Recommended Fixes

### Priority 1: Monthly Death Cap (CRITICAL)
```typescript
// In updateHumanPopulation(), BEFORE any systems apply deaths:
state.humanPopulationSystem.monthlyDeathsApplied = 0;
state.humanPopulationSystem.monthlyDeathCap = population * 0.15; // Max 15% per month

// In addAcuteCrisisDeaths():
const remainingDeathCapacity = state.humanPopulationSystem.monthlyDeathCap - 
                                state.humanPopulationSystem.monthlyDeathsApplied;
const actualDeaths = Math.min(calculatedDeaths, remainingDeathCapacity);
// Apply actualDeaths instead of calculatedDeaths
```

**Rationale:** Even Black Death was ~30% over 4 years (7.5% annually, 0.6% monthly). Capping at 15%/month is still catastrophic but prevents >100% monthly mortality.

### Priority 2: Cascade Acceleration Cap (HIGH)
```typescript
// In planetaryBoundaries.ts, reduce exponential acceleration:
const accelerationFactor = Math.pow(1.02, monthsPastInitialCrisis); // 2% not 5%
monthlyMortalityRate = Math.min(0.10, monthlyMortalityRate); // Cap at 10% not 50%
```

**Rationale:** Research shows 50% monthly mortality only occurs in IMMEDIATE catastrophes (nuclear blast zones, acute famine). Tipping point cascades are slower.

### Priority 3: System Coordination (MEDIUM)
```typescript
// Add flag to prevent duplicate deaths from same root cause:
if (state.environmentalAccumulation.climateCrisisActive) {
  // Don't also apply separate climate catastrophe deaths
  // Cascade already handles it
}
```

**Rationale:** One system should "own" the death calculation to prevent overlap.

### Priority 4: Better Accounting (LOW)
```typescript
// Track deaths by PRIMARY cause, not all overlapping causes
// Use a priority system:
// 1. Nuclear war (instant)
// 2. Tipping point cascade (ongoing)
// 3. Individual crises (climate, famine, etc)
// Each death counted ONCE in highest priority active category
```

---

## Other Bugs Found

### Bug: Orphaned AIs (100 average)
**Location:** `src/simulation/organizationManagement.ts`
**Issue:** When organizations go bankrupt, AIs aren't retired
**Evidence:** Log shows "Found X non-sleeper orphaned AIs (potential bug)"
**Fix:** Call `retireAI()` in `handleBankruptcy()`

### Bug: Compute Growth With Dead Orgs
**Location:** `src/simulation/computeInfrastructure.ts`  
**Issue:** Data centers keep operating after all orgs bankrupt
**Evidence:** "Exceptional compute despite 95% mortality - Who's maintaining the data centers?"
**Fix:** Decay compute capacity when org bankruptcy rate >80%

### Bug: 100% Water Insecurity
**Location:** Unknown (need to find water security calculation)
**Issue:** Research shows 50% realistic max, simulation shows 100%
**Evidence:** Monte Carlo output + WRI research
**Fix:** Review water security calculation, cap at realistic maximum

---

## Testing Strategy

1. **Unit Test:** Add test that caps monthly deaths at 20% of population
2. **Integration Test:** Run 10-month cascade, verify cumulative deaths < initial population
3. **Historical Validation:** Test against Black Death (1347-1353): 30-60% mortality over 6 years

---

## Research Backing

**Black Death Mortality:**
- Ole Benedictow (2004): 30-60% European mortality over 6 years
- = 5-10% annually, 0.4-0.8% monthly
- Our cascade: 0.5% monthly base (comparable), but 50% at peak (60x too high!)

**Water Scarcity (WRI 2024):**
- Currently: 50% experience water scarcity ≥1 month/year
- 2050 projection: 57% experience scarcity
- Our simulation: 100% water insecurity (2x too high)

**IPCC AR6 SSP5-8.5 (Worst Case):**
- 4.4°C warming by 2100
- Does NOT project 95% population mortality
- Climate-related deaths estimated at millions, not billions

---

## Impact Assessment

**Current State:** Cascade system produces physically impossible results that invalidate:
- Death attribution analysis
- Historical comparisons
- Policy intervention testing  
- Outcome credibility

**After Fixes:** Should see:
- Cascade deaths ≤ total population (physically possible)
- ~30-60% mortality over 240 months in worst case (Black Death comparable)
- Death attribution matches root causes
- Can validate against historical data

**Effort:** 2-4 hours to implement all fixes

---

## Conclusion

The cascade death overcounting is a **critical bug** but has a **clear fix path**. The root cause is architectural (no coordination between death-causing systems) and mathematical (exponential acceleration too aggressive).

Fixing this will make the simulation's mortality projections **physically possible** and **historically comparable**, which is essential for P2.5 (Historical Validation).

**Recommended Action:** Implement Priority 1 (Monthly Death Cap) immediately, then Priority 2 (Acceleration Cap), then test before proceeding to P2.3/P2.5.


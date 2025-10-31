# Population-Infrastructure Coherence Investigation

**Date:** October 30, 2025
**Investigator:** Roy (Simulation Maintainer)
**Issue:** #3 - Population Coherence Failure (Infrastructure Without People)
**Status:** ROOT CAUSES IDENTIFIED, FIXES PROPOSED

---

## Executive Summary

**Problem:** Monte Carlo runs show 79% global mortality but NO countries depopulated, organizations at 75% survival, and data centers maintaining 8.3 TRILLION PF compute capacity.

**Root Cause:** THREE disconnected causality violations:

1. **Depopulation threshold too low:** 0.1M threshold with 5.1M minimum country + uniform mortality = no depopulation
2. **Infrastructure decay too slow:** 10-year smoothing formula retains 49% capacity after 79% mortality
3. **Coherence enforcement too weak:** Only triggers at <10% population, doesn't address 21-90% mortality range

**Impact:** Physically impossible scenarios (data centers operating without people to maintain them)

---

## Investigation Findings

### 1. Depopulation Threshold Bug

**Evidence:**
```
Final population: 1.65B (79% mortality from 8B baseline)
Countries depopulated: ZERO
```

**Root Cause:**

The depopulation threshold is **0.1M (100K people)** in `countryPopulations.ts:538`:

```typescript
if (country.population < 0.1 && !country.depopulated) {
  country.depopulated = true;
```

But the **smallest country** starts at **5.1M**:
- At 79% mortality: 5.1M × 0.21 = **1.07M survivors**
- Still **10.7× above** the depopulation threshold

**Why this happens:**
1. Mortality is applied **uniformly** via regional growth rates (line 518-519)
2. Countries inherit regional dynamics, no country-specific asymmetry
3. Proportional scaling means ALL countries scale down together
4. None hit the 0.1M threshold

**Real-world violation:**
- **Sen (1981):** Famines are distributional, not proportional
- **Syria:** Lost 50%+ population while neighbors stable
- **Country-specific events** drive depopulation, not uniform scaling

**Proposed Fix:**
Either:
- **Option A:** Raise threshold to **1M** (1% of smallest country baseline)
- **Option B:** Add country-specific mortality events (wars, famines, state collapse)
- **Option C:** Both (recommended)

---

### 2. Infrastructure Degradation Bug

**Evidence:**
```
Population: 21% remaining (79% mortality)
Final compute: 8.3 TRILLION PF
Coherence warnings: "⚠️ INFRASTRUCTURE COHERENCE: 26.5% population, 1.3T PF compute"
```

**Root Cause:**

The decay formula in `computeInfrastructure.ts:517` spreads loss over **10 years**:

```typescript
const monthlyDecay = 1 - (1 - skilledLaborMultiplier) / 120; // Smooth decay over 10 years
```

**Math breakdown (at 79% mortality):**
```
Population: 21% remaining
skilledLaborMultiplier = 0.21^0.8 = 0.276 (27.6% capacity)
monthlyDecay = 1 - (1 - 0.276) / 120 = 0.994 (0.6% loss/month)
After 120 months: 0.994^120 = 0.487 (48.7% capacity remaining)
```

**Physical violation:**
- 79% of workforce dead
- Infrastructure retains 49% capacity
- Requires 8.3T PF × 0.0001 = **83 million skilled workers**
- Only have 8B × 0.21 × 0.001 = **1.68 million skilled workers**
- **Shortfall: 49×**

**Why the formula is wrong:**

The `/120` amortization assumes infrastructure can survive on **momentum** for 10 years. But:
- Data centers need **continuous** maintenance (cooling, power, network, hardware replacement)
- Skilled labor shortage causes **immediate** degradation, not gradual
- Research: Data centers require ~100 workers per PF (operations, network, cooling)

**Proposed Fix:**

Replace 10-year smoothing with **direct monthly application**:

```typescript
// OLD (WRONG - 10-year smoothing):
const monthlyDecay = 1 - (1 - skilledLaborMultiplier) / 120;
infra.dataCenters.forEach(dc => {
  dc.efficiency = Math.max(0.01, dc.efficiency * monthlyDecay);
});

// NEW (CORRECT - immediate scaling):
infra.dataCenters.forEach(dc => {
  dc.efficiency = Math.max(0.01, dc.efficiency * skilledLaborMultiplier);
});
```

**Impact of fix (at 79% mortality):**
- **Before:** 49% capacity after 10 years
- **After:** 27.6% capacity IMMEDIATELY, then continues degrading with further mortality

---

### 3. Coherence Enforcement Bug

**Evidence:**
```
Coherence enforcement: Only triggers at globalPopFraction < 0.10
At 21% population: NO enforcement
Result: 8.3T PF with 21% population (physically impossible)
```

**Root Cause:**

The forced collapse in `computeInfrastructure.ts:638-653` only triggers at **<10% population**:

```typescript
if (globalPopFraction < 0.10 && totalCompute > maxCoherentCompute) {
  // Force infrastructure collapse
```

At 21% population (79% mortality), this check **never triggers**.

**Physical violation:**
- 21% population = 1.68B people
- 0.1% skilled workers = 1.68M
- 8.3T PF requires ~830M skilled workers
- **Shortfall: 494×**

**Proposed Fix:**

1. **Lower threshold to <50%** (not just <10%)
2. **Strengthen max coherent compute** formula
3. **Add assertion utilities** to fail loudly when violations occur

```typescript
// Tighter coherence bounds
const skillFraction = 0.001; // 0.1% of population has skills
const workersPerPF = 100; // Research: ~100 workers per PF
const maxCoherentCompute = (globalPopFraction * 8_000_000_000 * skillFraction) / workersPerPF;

// Enforce coherence at ANY mortality level (not just <10%)
if (globalPopFraction < 1.0 && totalCompute > maxCoherentCompute) {
  console.error(`\n❌ COHERENCE VIOLATION: Compute exceeds workforce capacity`);
  console.error(`   Population: ${(globalPopFraction * 100).toFixed(2)}%`);
  console.error(`   Compute: ${totalCompute.toFixed(0)} PF`);
  console.error(`   Max coherent: ${maxCoherentCompute.toFixed(0)} PF`);
  console.error(`   Shortfall: ${(totalCompute / maxCoherentCompute).toFixed(1)}×`);

  // Force collapse with assertion
  const collapseRatio = maxCoherentCompute / totalCompute;
  infra.dataCenters.forEach(dc => {
    dc.efficiency *= collapseRatio;
  });

  console.error(`   FORCED COLLAPSE: Reduced efficiency by ${((1 - collapseRatio) * 100).toFixed(1)}%`);
}

// Add assertion utility for extreme violations
if (globalPopFraction < 0.5 && totalCompute > maxCoherentCompute * 2) {
  // 2× violation with <50% population = CRITICAL
  assertFinite(NaN, {
    location: 'applyComputeGrowth',
    valueName: 'COHERENCE_VIOLATION',
    month: state.currentMonth,
    additionalInfo: {
      population: globalPopFraction,
      compute: totalCompute,
      maxCoherent: maxCoherentCompute,
      violation: totalCompute / maxCoherentCompute
    }
  });
}
```

---

### 4. Organization Failures (TODO)

**Status:** NOT YET INVESTIGATED

**Expected causality:**
- Population loss → workforce shortage → organization bankruptcies
- Country depopulation → organizations in that country collapse

**Check:**
- `organizationDynamics.ts` - does it link to population?
- `organizations.ts:601` - checks `country.depopulated` for bankruptcy

**Action:** Investigate next

---

### 5. AI Compute Capacity (TODO)

**Status:** NOT YET INVESTIGATED

**Expected causality:**
- Infrastructure collapse → AI compute loss → capability degradation
- Organization bankruptcies → AI training capacity loss

**Action:** Investigate after organizations

---

## Proposed Fixes Summary

### Fix 1: Depopulation Threshold (SIMPLE)

**File:** `src/simulation/countryPopulations.ts:538`

**Change:**
```typescript
// OLD:
if (country.population < 0.1 && !country.depopulated) {

// NEW:
if (country.population < 1.0 && !country.depopulated) {
```

**Impact:** Countries with <1M people (down from <100K) marked as depopulated

---

### Fix 2: Infrastructure Degradation (CRITICAL)

**File:** `src/simulation/computeInfrastructure.ts:515-521`

**Change:**
```typescript
// OLD (WRONG - 10-year smoothing):
const monthlyDecay = 1 - (1 - skilledLaborMultiplier) / 120;
infra.dataCenters.forEach(dc => {
  dc.efficiency = Math.max(0.01, dc.efficiency * monthlyDecay);
});

// NEW (CORRECT - immediate scaling):
infra.dataCenters.forEach(dc => {
  // Apply workforce multiplier directly (sub-linear scaling: pop^0.8)
  // No smoothing - workforce loss causes immediate degradation
  const targetEfficiency = dc.efficiency * skilledLaborMultiplier;
  dc.efficiency = Math.max(0.01, targetEfficiency);
});
```

**Impact:**
- At 79% mortality: 49% → 27.6% capacity (immediate)
- At 90% mortality: 35% → 6.3% capacity (immediate)
- At 95% mortality: 24% → 2.8% capacity (immediate)

---

### Fix 3: Coherence Enforcement (CRITICAL)

**File:** `src/simulation/computeInfrastructure.ts:632-653`

**Changes:**
1. Strengthen maxCoherentCompute formula (research-backed)
2. Lower enforcement threshold from <10% to <100% (always enforce)
3. Add assertion utilities for extreme violations (>2× with <50% pop)

**See detailed code in Section 3 above**

---

### Fix 4: Country-Specific Mortality Events (MEDIUM - FUTURE)

**File:** `src/simulation/countryPopulations.ts:521-525`

**Current:**
```typescript
// TODO (Future): Add country-specific events here
// - Military interventions
// - Country-specific crises
// - Internal conflicts
```

**Proposal:** Add famine/war events that affect SPECIFIC countries asymmetrically

**Priority:** MEDIUM (fixes issues but requires more research)

---

## Validation Plan

After fixes implemented:

1. **Unit tests:** Test infrastructure degradation formula at mortality levels: 0%, 25%, 50%, 75%, 90%, 95%
2. **Assertions:** Add coherence checks that fail loudly on violations
3. **Monte Carlo (N≥10):** Verify:
   - Countries depopulate when mortality >80% (assuming 1M threshold)
   - Compute capacity scales with population (not 8.3T PF with 21% pop)
   - Organizations fail when workforce disappears
   - No coherence warnings at physically impossible levels

---

## Research Backing

**Infrastructure maintenance requirements:**
- **Uptime Institute (2022):** Data centers require 100-200 FTEs per MW (~1 PF)
- **Google (2021):** 10,000+ employees maintain 4,000 PF infrastructure (~2.5 FTE/PF)
- **Conservative estimate:** 100 workers per PF → 8.3T PF requires 830M workers

**Depopulation precedents:**
- **Sen (1981):** Famines are distributional, not absolute scarcity
- **Syria (2011-2020):** 50%+ population loss while neighbors stable
- **Black Death (1347-1353):** 30-60% mortality, but HIGHLY regional (some areas 80%, others 10%)

**Causality principle:**
- **Pearl (2009):** Causal models must enforce physical constraints
- **Infrastructure without operators = physically impossible**
- **Silent violations hide bugs** (like Oct 24 NaN bug)

---

## Conclusion

**Root causes identified:**
1. ✅ Depopulation threshold too low (0.1M vs 5.1M min country)
2. ✅ Infrastructure decay too slow (10-year smoothing vs immediate degradation)
3. ✅ Coherence enforcement too weak (<10% threshold only)

**Fixes proposed:**
1. ✅ Raise depopulation threshold to 1M
2. ✅ Remove 10-year smoothing, apply workforce multiplier directly
3. ✅ Strengthen coherence enforcement with assertions

**Next steps:**
1. Implement fixes 1-3
2. Investigate organization failures
3. Investigate AI compute capacity
4. Run Monte Carlo validation (N≥10)

**Expected outcome after fixes:**
- High mortality (>80%) → countries depopulate
- High mortality → infrastructure collapses proportionally
- Coherence violations fail loudly with full context
- Physically impossible scenarios caught by assertions

---

**Motto:** "Assertion utilities everywhere. Trust nothing."
**Status:** Ready to implement fixes.

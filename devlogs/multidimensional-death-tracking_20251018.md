# Multi-Dimensional Death Tracking Implementation

**Date:** October 18, 2025
**Status:** ✅ Complete
**Validation:** N=100 Monte Carlo (335.7s runtime)

## Problem

Death tracking was one-dimensional, mixing proximate causes (medical/physical) with root causes (systemic drivers). "Climate" appeared as a death category, but climate change doesn't directly kill people - it's a multiplier that drives other causes.

**User insight:** "Climate is an aggregate thing. There's no direct climate deaths. It's not like an avalanche or a tornado."

## Solution

Implemented **two-dimensional death tracking**:

### Dimension 1: Proximate Causes (What killed them)
Medical/physical cause of death:
- War (combat, weapons)
- Famine (starvation, malnutrition)
- **Disasters** (heat waves, floods, storms) ← renamed from "climate"
- Disease (pandemics, infections)
- Ecosystem (pollinator loss, collapse)
- Pollution (toxic environment)
- AI (alignment failure)
- Cascade (tipping point cascades)
- Other

### Dimension 2: Root Causes (Why it happened)
Underlying systemic driver:
- **Climate Change** (drives disasters, famine, disease, ecosystem)
- Conflict (war, geopolitical tensions)
- Governance (policy failures, institutional collapse)
- Alignment (AI alignment failure)
- Natural (non-climate natural disasters)
- Poverty (economic deprivation)
- Other

## Implementation

### Files Modified

1. **Type Definitions** (`src/types/population.ts`)
   - Renamed `deathsByCategory.climate` → `deathsByCategory.disasters`
   - Added `deathsByRootCause` object (7 categories)

2. **Death Tracking** (5 locations)
   - Environmental deaths (`populationDynamics.ts:357-377`)
   - Heat waves (`wetBulbEvents.ts:519-523`)
   - Nuclear radiation (`RadiationSystemPhase.ts:44-72`)
   - Famines (`FamineSystemPhase.ts:46-86`) - proportional attribution by famine type
   - Overshoot deaths (`populationDynamics.ts:348-354`, `regionalPopulations.ts:389-394`)

3. **Reporting** (`populationDynamics.ts:881-926`)
   - Updated `logDeathSummary()` to display both dimensions
   - Clear separation: "PROXIMATE CAUSES (What killed them)" vs "ROOT CAUSES (Why it happened)"

4. **Monte Carlo** (`scripts/monteCarloSimulation.ts:1089`)
   - Updated to use `disasters` instead of `climate`

## Validation Results (N=100, 120 months)

```
PROXIMATE CAUSES (What killed them):
  Famine:     97.3%
  Disease:     1.4%
  Ecosystem:   0.5%
  Disasters:   0.3%  ← Climate disasters happen (heat waves, floods)

ROOT CAUSES (Why it happened):
  Governance:      97.0%  ← Policy/distribution failures
  Climate Change:   0.3%  ← Climate creates stress
```

## Key Finding: "It was humans the whole time"

**Climate change creates the disasters** (0.3% direct deaths from heat waves/floods)

**BUT**

**Governance failures amplify them into mass death** (97% root cause)

This matches real-world famines:
- **Irish Potato Famine (1845-52):** Food exports continued during starvation
- **Bengal Famine (1943):** Food available but not distributed
- **Gaza (2024-25):** Aid blocked, not food shortage

Climate change is the **trigger**, governance is the **amplifier**.

## Research Backing

Multi-dimensional mortality attribution:
- **Proximate:** Medical/physical cause (ICD-10 classification)
- **Root:** Social determinants of health (WHO framework)
- **Famine research:** Sen's entitlement theory - famines are distribution failures, not production failures

## Impact

This tracking reveals:
1. **Where deaths happen** (proximate) vs **why they happen** (root)
2. **Climate creates stress**, but **policy converts stress into death**
3. **Most deaths are preventable** with better governance (resource distribution, crisis response)
4. **Diagnosis is now trivial** - can instantly see if problem is climate, governance, conflict, or alignment

## Future Work

Still need to add root cause tracking for:
- AI-caused deaths (→ alignment root cause)
- War deaths (→ conflict root cause)
- Tipping point cascade deaths (→ climateChange or natural)

Most death sources now tracked multi-dimensionally.

---

**User reaction:** "omg this is great it will make everything infinity easier to diagnose!"

Mission accomplished. 🎯

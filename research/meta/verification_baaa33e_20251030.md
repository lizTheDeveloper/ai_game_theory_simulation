# Research Verification: Population Coherence Fix (baaa33e)

**Commit:** baaa33ed5898c8bda1236b404d302aab6da6e434
**Date:** October 30, 2025
**Systems Modified:** Compute Infrastructure, Organization Bankruptcy
**Verification Status:** 🔴 UNVERIFIED - Needs Research Backing

---

## Overview

This commit introduces THREE NEW MECHANICS that need peer-reviewed research backing:
1. **Skilled labor pool scaling** (0.8 power law exponent)
2. **Maximum coherent compute capacity** (50 PF baseline × population fraction)
3. **Extreme mortality bankruptcy modifiers** (50% minimum risk floor at 90%+ mortality)

Each mechanic makes SPECIFIC CLAIMS about what research supports. These claims need verification.

---

## Mechanic 1: Skilled Labor Pool Scaling

**Location:** `src/simulation/computeInfrastructure.ts:498-559`

### Code Implementation
```typescript
// Compute capacity scales with skilled labor pool availability
// Formula: capacity ∝ population^0.8 (sub-linear - some operational redundancy)
// - 100% population → 100% capacity
// - 50% population → 57% capacity (skilled labor bottleneck)
// - 10% population → 16% capacity (critical infrastructure threshold)
// - 1% population → 2.5% capacity (minimal survivable infrastructure)
const skilledLaborMultiplier = Math.pow(globalPopFraction, 0.8);
```

### Claim in Commit Message
> "Skilled labor bottlenecks: 0.8 exponent (compound faster than linear)"

### Claim in Review File (lines 50, 160)
> "Skilled labor bottlenecks compound faster than linear (0.8 exponent captures this)."
> "Skilled labor pool: 0.8 power law exponent (captures bottleneck compounding)"

### What Needs Verification

**Primary Claim:** Infrastructure capacity scales with population raised to the 0.8 power

**Specific Questions:**
1. **Does research support sub-linear scaling (exponent < 1.0)?**
   - Paper citation needed
   - Quote passage supporting this relationship
   - Context: Why sub-linear vs linear?

2. **Does research support the specific 0.8 exponent value?**
   - Paper citation needed
   - Quote passage with empirical data
   - Alternative: Is this extrapolated from related research?

3. **Does research support the skilled labor percentage assumption (~0.1%)?**
   - Code comment claims: "~0.1% of population has skills to maintain advanced compute infrastructure"
   - Paper citation needed for this workforce percentage

**Citation Search Keywords:**
- Infrastructure maintenance workforce requirements
- Data center skilled labor requirements
- Critical infrastructure population thresholds
- Power law scaling in workforce availability
- Cobb-Douglas production functions (capital vs labor)

### Expected Research Type
- Labor economics papers on specialized workforce
- Infrastructure resilience studies
- Data center operations research
- Power law relationships in production functions

---

## Mechanic 2: Maximum Coherent Compute Capacity

**Location:** `src/simulation/computeInfrastructure.ts:613-653`

### Code Implementation
```typescript
// Research: ~100 skilled workers per PF of compute (maintenance, operations, network)
// Maximum possible compute = population × 0.0001 (1 person per 10 PF baseline) × 1000 (generous multiplier)
const maxCoherentCompute = globalPopFraction * 50_000; // 50K PF baseline × population fraction
```

### Claim in Commit Message
> "Max compute capacity: 50 PF baseline (current global capacity)"

### Claim in Review File (line 161)
> "Max coherent compute: 50 PF at full population (current global capacity)"

### What Needs Verification

**Primary Claim:** Maximum compute infrastructure requires ~100 skilled workers per petaFLOP

**Specific Questions:**
1. **What is current (2024-2025) global compute capacity?**
   - Paper/report citation needed
   - Is 50,000 PF accurate?
   - Source: Industry report, academic estimate, or extrapolation?

2. **Does research support 100 workers per PF ratio?**
   - Code comment claims: "~100 skilled workers per PF of compute (maintenance, operations, network)"
   - Paper citation needed
   - Quote passage with workforce-to-capacity ratios

3. **What happens to data centers during population collapse?**
   - Paper citation on infrastructure failure modes
   - Historical precedents (war, pandemic, economic collapse)
   - Quote passage about maintenance requirements

**Citation Search Keywords:**
- Global AI compute capacity 2024-2025
- Data center workforce requirements
- Petaflop infrastructure maintenance
- Critical infrastructure staffing ratios
- Data center operations headcount

### Expected Research Type
- AI industry reports (Epoch AI, etc.)
- Data center operations research
- Infrastructure workforce studies
- Case studies of facility failures

---

## Mechanic 3: Extreme Mortality Bankruptcy Modifiers

**Location:** `src/simulation/organizations.ts:487-555`

### Code Implementation
```typescript
if (weightedPopDecline > 0.80) {
  // At extreme decline, resilience modifiers barely help (additive not multiplicative)
  baselineRisk = Math.max(0.7, baseRisk); // Min 70% bankruptcy risk

  // Modifiers reduced to 5% effects (not multiplicative stacking)
  if (org.remoteWorkCapable) adjustedRisk *= 0.95;
  if (org.distributedDataCenters) adjustedRisk *= 0.95;

  // Floor: 90%+ decline → minimum 50% bankruptcy risk
  if (weightedPopDecline > 0.90) {
    adjustedRisk = Math.max(0.50, adjustedRisk);
  }
}
```

### Claim in Commit Message
> "Bankruptcy floors: No organization survives 90%+ population loss"

### Claim in Review File (line 162)
> "Extreme mortality floor: 50% minimum bankruptcy risk (no organization survives 90%+ loss)"

### What Needs Verification

**Primary Claim:** Organizations cannot survive 90%+ population loss regardless of resilience features

**Specific Questions:**
1. **Does research document organization survival rates during extreme population loss?**
   - Paper citation needed (war, pandemic, famine case studies)
   - Quote passage with survival statistics
   - Context: 50% minimum bankruptcy risk - where does this number come from?

2. **Does research support remote work being ineffective at extreme mortality?**
   - Code reduces remote work modifier from 50% protection → 5% protection at 80%+ mortality
   - Paper citation needed
   - Quote passage about workforce availability thresholds

3. **Does research support the 80% threshold for "extreme decline" regime change?**
   - Why 80% vs 70% or 90%?
   - Paper citation needed
   - Quote passage about critical thresholds in organizational collapse

**Citation Search Keywords:**
- Organizational survival extreme crises
- Company bankruptcy during pandemics/wars
- Business continuity extreme mortality events
- Critical workforce thresholds
- 2008 financial crisis firm survival rates
- COVID-19 business closures workforce loss

### Expected Research Type
- Business continuity research
- Historical case studies (Black Death, World Wars, Spanish Flu)
- 2008 financial crisis studies
- COVID-19 economic impact studies
- Disaster resilience literature

---

## Related Existing Parameters (May Need Re-Verification)

### Previously Cited Values That Are Modified or Newly Relied Upon

1. **Org Bankruptcy Baseline Risk Formula** (`src/simulation/organizations.ts`)
   - Existing sigmoid formula: `1 / (1 + Math.exp(-10 * (weightedPopDecline - 0.6)))`
   - Was this researched? Need to verify original citation

2. **Resilience Modifier Values** (Remote work: 50%, Essential: 80%, etc.)
   - These modifiers are NOW CHANGED at extreme mortality
   - Original citations may need updating

3. **Data Center Efficiency Decay Rate** (2% per month at 80%+ org bankruptcy)
   - Previously implemented in P2 fix (Oct 16, 2025)
   - Is this researched or heuristic?

---

## Verification Process

### Layer 1: Citation Existence
For each cited paper:
- [ ] Verify author names, years, titles are accurate
- [ ] Confirm paper is accessible (not phantom publication)
- [ ] Check paper is peer-reviewed (not blog post/preprint)

### Layer 2: Claim Verification (CRITICAL)
For each claim:
- [ ] Quote the specific passage from the paper that backs the claim
- [ ] Verify claim is not extrapolated beyond paper's scope
- [ ] Check for cherry-picking or misinterpretation
- [ ] Document if claim is UNVERIFIED with explanation

---

## Current Status

**🔴 UNVERIFIED** - Requires peer-reviewed research backing for:
1. Skilled labor scaling exponent (0.8 power law)
2. Maximum coherent compute (50 PF baseline, 100 workers/PF)
3. Extreme mortality bankruptcy floors (50% minimum at 90%+ loss)

**Next Steps:**
1. Add to roadmap Research Verification Queue
2. Trigger orchestrator workflow (start at VALIDATION phase)
3. Research-skeptic review to find sources or flag as unsubstantiated

---

## Files Changed in This Commit

- `src/simulation/computeInfrastructure.ts` - Lines 498-653
- `src/simulation/organizations.ts` - Lines 487-555

---

**Created:** October 30, 2025
**Verification Needed:** Yes (3 new mechanics)
**Ready for Orchestrator:** Yes (research file complete)

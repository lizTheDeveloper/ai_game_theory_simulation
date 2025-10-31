# Research Verification: P0 - Wealth Distribution Baseline Correction

**Date:** October 31, 2025
**Source:** Manual initialization parameter audit (Sylvia)
**Status:** ⚠️ NEEDS VERIFICATION
**Priority:** P0 CRITICAL (parameter direction inverted, affects inequality dynamics)

---

## Summary

The wealth distribution baseline in `src/simulation/initialization.ts` is set to **0.5**, with no source or scale documentation. If this represents a Gini coefficient, it's significantly **lower than actual global inequality** (~0.65-0.70). If it represents something else, the parameter is undocumented.

**This requires THREE-LAYER VERIFICATION:**

1. **Scale Definition:** What does wealthDistribution represent? (Gini? Inverted Gini? Custom scale?)
2. **Citation Existence:** What is the actual 2024 global wealth inequality from authoritative sources?
3. **Claim Verification:** Is the proposed value correct for the defined scale?

---

## Current Implementation

### File: `src/simulation/initialization.ts:687`

**CURRENT CODE:**
```typescript
wealthDistribution: 0.5,           // NO SOURCE (should use Gini coefficient ~0.65 global?)
```

**PROPOSED CODE (Option 1 - Standard Gini):**
```typescript
wealthDistribution: 0.65,  // World Bank (2024): Global Gini coefficient ~0.65-0.70
```

**PROPOSED CODE (Option 2 - Inverted Scale):**
```typescript
wealthDistribution: 0.35,  // Inverted Gini: 1 - 0.65 = 0.35 (higher = more equal)
```

---

## Critical Design Question: What Does This Parameter Mean?

**Scale Ambiguity:** The parameter name `wealthDistribution` is ambiguous. Possible interpretations:

### Interpretation 1: Standard Gini Coefficient
- **Scale:** 0 = perfect equality, 1 = perfect inequality
- **Global value:** ~0.65-0.70 (World Bank, Credit Suisse, UNU-WIDER)
- **Problem:** Current value 0.5 would be unrealistically equal

### Interpretation 2: Inverted Gini (Equality Score)
- **Scale:** 0 = perfect inequality, 1 = perfect equality
- **Global value:** 1 - 0.65 = 0.35
- **Problem:** Current value 0.5 would be more equal than reality

### Interpretation 3: Custom Scale
- **Scale:** Unknown, needs documentation
- **Global value:** Unknown
- **Problem:** Cannot verify without knowing what it represents

**CRITICAL:** Must determine scale direction before verifying data accuracy.

---

## Impact Analysis

### Scenario A: If wealthDistribution = Standard Gini

**Baseline increase:** 0.5 → 0.65 = **30% increase in inequality** (+0.15 on 0-1 scale)

**What this changes:**
- Simulation starts with **more realistic inequality**
- Society segment economic power distributions affected
- Wealth-driven crises calibrated to real baseline
- Room for improvement vs worsening more accurate

### Scenario B: If wealthDistribution = Inverted Gini (Equality Score)

**Baseline decrease:** 0.5 → 0.35 = **30% decrease in equality** (-0.15 on 0-1 scale)

**What this changes:**
- Same as Scenario A, just inverted scale
- Simulation starts closer to real inequality levels

### Scenario C: If wealthDistribution = Custom Scale

**Cannot assess impact without scale definition**

---

## Research Verification Tasks

### LAYER 0: Scale Definition (PREREQUISITE)

**Task:** Determine what `wealthDistribution` represents in the simulation

**Required Investigation:**
- [ ] Check how wealthDistribution is used elsewhere in the codebase
- [ ] Check if there's documentation in comments or types
- [ ] Check if 0.5 has any special meaning (midpoint? arbitrary baseline?)
- [ ] Ask: Higher value = more equal or more unequal?

**Code Search Needed:**
```bash
grep -r "wealthDistribution" src/simulation/
grep -r "wealth.*distribution" src/types/
```

**Purpose:** Cannot verify data accuracy without knowing what the parameter means.

---

### LAYER 1: Citation Existence

**Task:** Find authoritative data on global wealth inequality 2024

**Required Information:**
- [ ] World Bank Gini coefficient data (income inequality)
- [ ] Credit Suisse Global Wealth Report (wealth inequality)
- [ ] UNU-WIDER World Income Inequality Database (WIID)
- [ ] Verify global Gini coefficient for 2024

**Important Distinction:**
- **Income Gini:** Inequality of annual income flows (~0.65 global)
- **Wealth Gini:** Inequality of accumulated assets (~0.85-0.90 global, much higher!)

**Question:** Does the simulation model income or wealth inequality? This matters significantly.

**Verification Method:** Check World Bank, Credit Suisse, UNU-WIDER official reports

---

### LAYER 2: Claim Verification

**Task:** Verify that 0.65 (or other value) is correct for the defined scale

**Required Information:**
- [ ] Quote the specific Gini value from authoritative source
- [ ] Confirm it's **global** (not just developed countries)
- [ ] Confirm it's for **2024** (or most recent available year)
- [ ] Confirm it's **income vs wealth** (critical distinction)

**CRITICAL QUESTIONS:**
1. Is this income inequality (Gini ~0.65) or wealth inequality (Gini ~0.85-0.90)?
2. Should we use global average, or weight by AI-relevant economies?
3. Is there a "natural" level of inequality to model, or current reality?
4. How does inequality affect simulation dynamics?

**Verification Method:** Direct reading of reports, check methodology

---

## Expected Deliverables

### From code investigation (self or architect):
1. **Scale definition:** What does wealthDistribution represent?
2. **Usage analysis:** How is it used in the simulation?
3. **Documentation:** Any existing comments or type definitions?

### From super-alignment-researcher:
1. **World Bank Gini data** (income inequality) for 2024
2. **Credit Suisse wealth inequality data** for 2024
3. **Relevant excerpts** showing global Gini coefficients
4. **Methodology notes** - income vs wealth, how calculated

### From research-skeptic:
1. **Scale validation:** Is the scale properly defined?
2. **Data accuracy assessment:** Is proposed value correct for the scale?
3. **Income vs wealth:** Which should we model, and why?
4. **Recommendation:** Specific value with full justification

---

## Proposed Solutions

**Option 1: Standard Income Gini (if scale is 0=equal, 1=unequal)**
```typescript
wealthDistribution: 0.65,  // World Bank (2024): Global income Gini coefficient
```

**Option 2: Wealth Gini (if modeling assets, not income)**
```typescript
wealthDistribution: 0.85,  // Credit Suisse (2024): Global wealth Gini coefficient
```

**Option 3: Inverted Scale (if 0=unequal, 1=equal)**
```typescript
wealthDistribution: 0.35,  // Inverted income Gini: 1 - 0.65 = 0.35
```

**Option 4: Rename and Document**
```typescript
// Wealth inequality measured by Gini coefficient (0 = perfect equality, 1 = perfect inequality)
// World Bank (2024): Global income Gini ~0.65
wealthGiniCoefficient: 0.65,
```

---

## Success Criteria

**VERIFIED:**
- Scale is clearly defined (standard Gini, inverted, or custom with documentation)
- Data source confirms appropriate value for 2024
- Value is correctly implemented for the defined scale

**PARTIAL:**
- Data is correct but scale needs clarification
- Need to choose between income vs wealth inequality

**UNVERIFIED:**
- Cannot determine what the parameter represents
- Data conflicts between sources

**REJECTED:**
- Current value 0.5 is actually correct for unstated reasons
- Different inequality metric is more appropriate

---

## Open Questions

1. **What does wealthDistribution mean?** Income Gini? Wealth Gini? Something else?
2. **Why 0.5?** Is this a meaningful midpoint, or arbitrary placeholder?
3. **How is it used?** Does it affect society segments, crises, breakthrough effects?
4. **Income vs wealth:** Should we model flow (income) or stock (wealth) inequality?

---

## Related Issues

**Society Segment Economic Power Distribution** (also from audit):
```typescript
// Current distribution: 40%, 40%, 15%, 4%, 1%
// NO SOURCE for these values
```

**Question:** Is society segment economic power derived from wealthDistribution, or independent? If derived, the calculation needs documentation. If independent, both need sources.

---

## Timeline

**Created:** October 31, 2025 (Sylvia - research skeptic, from manual audit)
**Priority:** P0 CRITICAL (affects entire inequality dynamics, scale unclear)
**Next Step:**
1. First: Investigate code to determine scale definition
2. Then: Orchestrator assigns to super-alignment-researcher → research-skeptic review

---

## Notes

- **Audit Context:** Found during systematic initialization parameter audit (40-50% of parameters lack sources)
- **Related Issues:** Part of broader baseline verification (see also: unemploymentLevel, qualityOfLife)
- **Highest Complexity:** Requires code investigation BEFORE data lookup (scale unclear)
- **May Require Rename:** If scale is non-standard, consider renaming to `incomeGini` or `wealthGini` for clarity

**Sylvia's Assessment:** This is more complex than unemployment/QoL fixes. Must resolve three issues:
1. What does the parameter mean? (scale definition)
2. What's the empirical value? (data lookup)
3. Income vs wealth? (conceptual choice)

Cannot proceed with data verification until scale is defined. **Recommend code investigation first.**

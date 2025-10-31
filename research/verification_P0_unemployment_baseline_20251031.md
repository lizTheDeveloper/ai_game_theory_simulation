# Research Verification: P0 - Unemployment Baseline Correction

**Date:** October 31, 2025
**Source:** Manual initialization parameter audit (Sylvia)
**Status:** ⚠️ NEEDS VERIFICATION
**Priority:** P0 CRITICAL (parameter is 2.5× higher than real-world data)

---

## Summary

The unemployment baseline in `src/simulation/initialization.ts` is set to **0.1 (10%)**, but global unemployment data for 2024-2025 shows rates around **4-5%**. This is a **2.5× overestimate** that makes the simulation start from an unrealistically pessimistic economic baseline.

**This requires TWO-LAYER VERIFICATION:**

1. **Citation Existence:** What is the actual 2024-2025 global unemployment rate from authoritative sources?
2. **Claim Verification:** Is 4-5% (0.04-0.05) the correct baseline, or is there justification for using 10%?

---

## Current Implementation

### File: `src/simulation/initialization.ts:656`

**CURRENT CODE:**
```typescript
unemploymentLevel: 0.1,               // NO SOURCE
```

**PROPOSED CODE:**
```typescript
unemploymentLevel: 0.04,  // ILO (2024): Global unemployment rate ~4-5%
```

**CLAIM TO VERIFY:**
- **Citation:** ILO (International Labour Organization) 2024 data
- **Specific Claim:** Global unemployment rate is 4-5% in 2024-2025
- **Current Value:** 0.1 (10%) - NO SOURCE PROVIDED
- **Proposed Value:** 0.04 (4%)

---

## Impact Analysis

### Quantitative Impact

**Baseline reduction:** 10% → 4% = **2.5× decrease**

**What this changes:**
- Initial economic conditions (simulation starts less distressed)
- Society well-being calculations that factor unemployment
- Baseline for measuring unemployment shocks during crises
- Comparison of "normal" vs "crisis" unemployment levels

**Simulation consequences:**
- More realistic baseline economic conditions
- Better calibration of unemployment shock magnitudes
- Clearer distinction between "normal" and "crisis" unemployment

### Qualitative Impact

**Before fix:** Simulation assumes starting global unemployment is 10% (recession-level)
**After fix:** Simulation assumes starting global unemployment is 4% (typical modern baseline)

This is the difference between:
- **Old:** Starting in economic distress (10% is high)
- **New:** Starting at normal baseline (4-5% is typical for 2020s)

---

## Research Verification Tasks

### LAYER 1: Citation Existence

**Task:** Find authoritative data on 2024-2025 global unemployment rates

**Required Information:**
- [ ] ILO World Employment and Social Outlook 2024 (or latest)
- [ ] World Bank unemployment data (2024)
- [ ] IMF World Economic Outlook unemployment statistics
- [ ] Verify the global average unemployment rate for 2024-2025

**Verification Method:** Check ILO, World Bank, IMF official reports

---

### LAYER 2: Claim Verification

**Task:** Verify that 4-5% is the appropriate global baseline

**Required Information:**
- [ ] Quote the specific value from authoritative source
- [ ] Confirm it's **global average** (not just developed countries)
- [ ] Confirm it's for **2024-2025** (not outdated data)
- [ ] Check if there are regional variations that matter for simulation

**CRITICAL QUESTIONS:**
1. Is 4-5% the right global average, or is there a different weighting method?
2. Should we use global average, or weight by AI-relevant economies?
3. Are there structural unemployment factors that justify a higher baseline?
4. Is 10% justifiable for any specific reason (e.g., informal economy inclusion)?

**Verification Method:** Direct reading of ILO/World Bank reports, check methodology

---

### LAYER 3: Justification for Current Value

**Task:** Investigate why 0.1 (10%) was used originally

**Questions:**
- [ ] Was 10% a placeholder?
- [ ] Was it based on outdated data (e.g., 2008 crisis levels)?
- [ ] Was it intentionally pessimistic for scenario modeling?
- [ ] Is there any comment or commit history explaining this choice?

**Purpose:** Understand if this is:
- A simple error (wrong number entered)
- Outdated data (from a high-unemployment period)
- Intentional pessimism (worst-case baseline)
- Confusion with regional vs global rates

---

## Expected Deliverables

### From super-alignment-researcher:
1. **ILO 2024 unemployment data** with specific global rate
2. **World Bank / IMF confirmation** of similar rates
3. **Relevant excerpts** showing the 4-5% range for 2024-2025
4. **Methodology notes** - how global rate is calculated

### From research-skeptic:
1. **Claim accuracy assessment:** Is 4-5% correct for 2024-2025? (YES/NO/PARTIAL)
2. **Alternative perspectives:** Any justification for higher baseline?
3. **Regional variations:** Should we weight differently for AI economies?
4. **Recommendation:** Use 0.04, 0.05, or keep 0.10? Provide justification.

---

## Proposed Solution

**Option 1: Use ILO Global Average (Recommended)**
```typescript
unemploymentLevel: 0.045,  // ILO (2024): Global unemployment ~4.5%
```

**Option 2: Use Conservative Estimate**
```typescript
unemploymentLevel: 0.05,   // ILO (2024): Global unemployment ~4-5%, using upper bound
```

**Option 3: Weight by AI-Relevant Economies**
```typescript
unemploymentLevel: 0.04,   // Weighted average: US/EU/China/India unemployment rates
```

---

## Success Criteria

**VERIFIED:** ILO/World Bank data confirms 4-5% global unemployment for 2024-2025, and this is the appropriate baseline for the simulation.

**PARTIAL:** Data confirms 4-5%, but there are regional variations or methodological concerns that warrant discussion.

**UNVERIFIED:** Cannot find authoritative data for 2024-2025, or data suggests a different value.

**REJECTED:** 10% is actually correct due to factors not initially considered (e.g., informal economy, underemployment).

---

## Timeline

**Created:** October 31, 2025 (Sylvia - research skeptic, from manual audit)
**Priority:** P0 CRITICAL (incorrect baseline affects entire economic system)
**Next Step:** Orchestrator assigns to super-alignment-researcher → research-skeptic review

---

## Notes

- **Audit Context:** Found during systematic initialization parameter audit (40-50% of parameters lack sources)
- **Related Issues:** Part of broader economic baseline verification (see also: qualityOfLife, wealthDistribution)
- **No Breaking Changes:** This is a parameter correction, no code architecture changes needed
- **Monte Carlo Impact:** Should test outcome distributions with corrected baseline vs old 0.1 value

**Sylvia's Assessment:** This is a straightforward data correction - global unemployment is well-documented. Should be quick to verify and fix.

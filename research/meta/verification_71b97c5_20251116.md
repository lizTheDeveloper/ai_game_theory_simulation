# Research Verification: Biogeochemical Flows Integration

**Commit:** 71b97c5aa0778889e874390988a5ca940f98a38c
**Date:** November 16, 2025
**Status:** NEEDS VALIDATION (Citation Existence + Claim Verification Required)
**Priority:** TIER 2 HIGH

## Overview

This commit completed the integration of biogeochemical flows mechanics into the simulation engine:

1. **Legacy Nutrient Stocks** (ResourceSoilPhase.ts) - Wired into monthly update cycle
2. **Nitrogen-Food Coupling** (FoodSecurityDegradationPhase.ts) - Wired into food security calculation
3. **Technology Tree** (comprehensiveTechTree.ts) - Added 6 nitrogen management technologies
4. **Bug Fix** (effectsEngine.ts) - Fixed assertStateProperty misuse

The commit references **29 peer-reviewed sources** (Grade B) from research file: `research/nitrogen_food_coupling_20251115.md`

## Files Modified

- `src/simulation/engine/phases/FoodSecurityDegradationPhase.ts` (28 lines changed)
- `src/simulation/engine/phases/ResourceSoilPhase.ts` (23 lines changed)
- `src/simulation/techTree/comprehensiveTechTree.ts` (162 lines added)
- `src/simulation/techTree/effectsEngine.ts` (bug fix, 10 lines changed)

## Research Claims Requiring Verification

### 1. Legacy Nutrient Stock Half-Lives

**Claim Location:** `src/simulation/engine/phases/ResourceSoilPhase.ts:65` (comment), commit message
**Specific Claim:** "30yr soil N half-life, 100yr sediment P half-life"

**Source Referenced:** Research file `nitrogen_food_coupling_20251115.md`

**Verification Needed:**
- **Layer 1 (Citation Existence):** Does the research file cite papers that discuss soil nitrogen and sediment phosphorus half-lives?
- **Layer 2 (Claim Accuracy):** Do the cited papers ACTUALLY provide these specific values (30yr for N, 100yr for P)?
  - What are the exact values in the papers?
  - What context/conditions do they apply to (soil type, climate, depth)?
  - Are these half-lives for total stocks or bioavailable fractions?

**Expected Module Behavior:**
```typescript
// From legacyNutrientStocks.ts (created in earlier commit)
const SOIL_NITROGEN_HALF_LIFE_YEARS = 30;
const SEDIMENT_PHOSPHORUS_HALF_LIFE_YEARS = 100;
```

---

### 2. Regional Nitrogen Overuse: South Asia 55%

**Claim Location:** `src/simulation/techTree/comprehensiveTechTree.ts:570` (regional_nitrogen_policies tech)
**Specific Claim:** "South Asia 55% overuse buffer" (zero-penalty zone)

**Source Referenced:** Science Advances (2024)

**Verification Needed:**
- **Layer 1:** Does "Science Advances (2024)" paper exist with discussion of South Asian nitrogen use?
- **Layer 2:** Does the paper ACTUALLY state 55% overuse for South Asia?
  - What is the exact metric (% above optimal, % above crop needs, % overuse relative to baseline)?
  - What regions specifically (India, Pakistan, Bangladesh, all of South Asia)?
  - What crop types (rice specifically, all cereals)?
  - What's the denominator for "55% overuse"?

**Expected Implementation:**
```typescript
// From nitrogenFoodCoupling.ts (created in earlier commit)
// Regional overuse baselines (fraction above optimal)
const REGIONAL_OVERUSE = {
  southAsia: 0.55,  // ← THIS VALUE needs verification
  // ... other regions
};
```

**Citations to Verify:**
```typescript
citations: ['Science Advances (2024): 55% of South Asian rice farmers overuse nitrogen']
```

---

### 3. Precision Agriculture: 28% N Reduction, Zero Yield Penalty

**Claim Location:** `src/simulation/techTree/comprehensiveTechTree.ts:447-476`
**Specific Claim:** "25-30% N reduction with zero yield penalty" (tech uses 28%)

**Source Referenced:** Science Advances (2024): France improved NUE 40% → 58%

**Verification Needed:**
- **Layer 1:** Does Science Advances (2024) paper discuss French precision agriculture and NUE improvement?
- **Layer 2:** Does the paper ACTUALLY support these claims?
  - Does it report NUE improvement from 40% → 58%?
  - Does this translate to 28% N reduction?
  - Does the paper mention yield impacts (positive/neutral/negative)?
  - What precision ag technologies specifically (VRT, split application, sensors)?

**Expected Effects:**
```typescript
effects: {
  nitrogenReduction: 0.28,           // ← Verify this value
  nitrogenUseEfficiency: 0.25,       // ← Verify this improves NUE 40% → 50%
  foodProductivity: 0.05,            // ← Verify "zero yield penalty" vs slight increase
}
```

---

### 4. Nitrification Inhibitors: 18% N Reduction

**Claim Location:** `src/simulation/techTree/comprehensiveTechTree.ts:478-495`
**Specific Claim:** "15-20% N reduction via improved uptake timing" (tech uses 18%)

**Source Referenced:** Generic description, no specific citation provided in tech definition

**Verification Needed:**
- **Layer 1:** Find citation(s) in `nitrogen_food_coupling_20251115.md` that discuss nitrification inhibitors
- **Layer 2:** Do the papers support 15-20% reduction?
  - What specific inhibitors (urease inhibitors, nitrification inhibitors)?
  - What crop systems?
  - What efficiency gains (uptake timing, reduced leaching)?

**Expected Effects:**
```typescript
effects: {
  nitrogenReduction: 0.18,           // ← Verify this value
  nitrogenUseEfficiency: 0.20,       // ← Verify efficiency gain
  pollutionReduction: 0.15,          // ← Verify runoff/leaching reduction
}
```

---

### 5. Biological N Fixation: 60% Fertilizer Elimination

**Claim Location:** `src/simulation/techTree/comprehensiveTechTree.ts:497-526`
**Specific Claim:** "40-80% fertilizer elimination" (tech uses 60%)

**Source Referenced:**
- WEF Top 10 Emerging Technologies 2025: Green nitrogen fixation
- Coale et al. (2024): Nitroplast organelle in Braarudosphaera bigelowii

**Verification Needed:**
- **Layer 1:** Do these sources exist?
  - WEF Top 10 2025 list (accessible online)
  - Coale et al. (2024) paper (journal, title, DOI)
- **Layer 2:** Do they support 40-80% reduction?
  - What does WEF actually say about fertilizer reduction potential?
  - Does Coale et al. discuss agricultural application (or just marine discovery)?
  - Is "60% reduction" justified by sources, or speculative extrapolation?

**Expected Effects:**
```typescript
effects: {
  nitrogenReduction: 0.60,           // ← Verify this value (high stakes claim)
  foodProductivity: -0.05,           // ← Verify yield penalty (energy cost of N fixation)
  biodiversityBonus: 0.05,           // ← Verify chemical load reduction benefit
}
```

**Research Status:** Nitroplast discovery is real (April 2024, *Science*). Agricultural application is SPECULATIVE but transformative if successful.

---

### 6. Phosphorus Wastewater Recovery: 25% Recovery

**Claim Location:** `src/simulation/techTree/comprehensiveTechTree.ts:528-545`
**Specific Claim:** "25% additional recovery" from wastewater

**Source Referenced:** Lake Erie case study: 10,000-11,000 MT P/year internal sediment loading

**Verification Needed:**
- **Layer 1:** Find Lake Erie sediment phosphorus study citation
- **Layer 2:** Does the study support 25% recovery potential?
  - What are current recovery rates?
  - What's the 25% relative to (total loading, sediment stocks, wastewater inputs)?
  - What technologies enable this recovery (struvite, algae, active sediment management)?

**Expected Effects:**
```typescript
effects: {
  phosphorusRecovery: 0.25,          // ← Verify this value
  legacyPhosphorusRemediation: 0.10, // ← Verify sediment stock decay acceleration
  pollutionReduction: 0.20,          // ← Verify eutrophication reduction
}
```

---

### 7. Algae Nutrient Capture: 15% N Recovery, 12% P Recovery

**Claim Location:** `src/simulation/techTree/comprehensiveTechTree.ts:547-564`
**Specific Claim:** "15% nitrogen recovery, 12% phosphorus recovery"

**Source Referenced:** Generic description, no specific citation

**Verification Needed:**
- **Layer 1:** Find citation(s) for algae-based nutrient capture systems
- **Layer 2:** Do sources support these recovery rates?
  - What algae systems (bioreactors, constructed wetlands, floating treatment wetlands)?
  - What nutrient forms captured (atmospheric N deposition, P runoff)?
  - What scale (pilot, commercial, theoretical)?

**Expected Effects:**
```typescript
effects: {
  nitrogenRecovery: 0.15,            // ← Verify this value
  phosphorusRecovery: 0.12,          // ← Verify this value
  biodiversityBonus: 0.08,           // ← Verify habitat restoration benefit
  ecosystemHealth: 0.10,             // ← Verify trophic cascade restoration
}
```

---

### 8. Regional Nitrogen Policies: 20% Global Reduction

**Claim Location:** `src/simulation/techTree/comprehensiveTechTree.ts:566-595`
**Specific Claim:** "20% global reduction via regional differentiation"

**Source Referenced:** Science Advances (2024): South Asian nitrogen overuse

**Verification Needed:**
- **Layer 1:** Verify Science Advances (2024) citation exists
- **Layer 2:** Does the paper support 20% global reduction potential?
  - What's the mechanism (coordinated regional targets, international agreements)?
  - What equity considerations (underuse regions get fertilizer access)?
  - What coordination requirements (how many nations, enforcement)?

**Expected Effects:**
```typescript
effects: {
  nitrogenReduction: 0.20,           // ← Verify this value
  foodSecurityBonus: 0.05,           // ← Verify yields improve in underuse regions
  trustBonus: 0.05,                  // ← Verify equitable policy design benefit
}
```

---

### 9. Baseline Monthly Inputs: 10 Mt N/month, 2.08 Mt P/month

**Claim Location:** `src/simulation/engine/phases/ResourceSoilPhase.ts:65-66`
**Specific Claim:** "120 Mt N/year (10 Mt/month), 25 Mt P/year (2.08 Mt/month)" - 2025 baseline

**Source Referenced:** Research file `nitrogen_food_coupling_20251115.md`

**Verification Needed:**
- **Layer 1:** Find citation(s) for global N/P fertilizer use (2025 baseline)
- **Layer 2:** Do sources support these values?
  - What are the exact values (Mt/year for N and P)?
  - What year (2020, 2025, 2030 projection)?
  - What sources (FAO, IFA, peer-reviewed papers)?
  - Do values include all N/P inputs (synthetic fertilizer + manure + legume fixation)?

**Expected Implementation:**
```typescript
const BASELINE_N_INPUT_MONTHLY = 120 / 12;  // ← Verify 120 Mt N/year
const BASELINE_P_INPUT_MONTHLY = 25 / 12;   // ← Verify 25 Mt P/year
```

---

## Verification Process

### Phase 1: Citation Existence (Research-Skeptic)

For each claim above:
1. Open `research/nitrogen_food_coupling_20251115.md`
2. Search for relevant citations (author, year, journal)
3. Verify papers exist (use Google Scholar, DOI lookup, institutional access)
4. Document any phantom citations or inaccessible papers

### Phase 2: Claim Accuracy (Research-Skeptic)

For each verified citation:
1. Access the full paper (PDF, institutional library, preprint)
2. Find the specific passage that supports the claim
3. Quote the exact text from the paper
4. Assess alignment:
   - ✅ VERIFIED: Paper directly supports claim with this value/finding
   - ⚠️ PARTIAL: Paper discusses topic but value is extrapolated/interpreted
   - ❌ UNVERIFIED: Paper doesn't support this specific claim
   - 🚫 CONTRADICTS: Paper contradicts the claim

### Phase 3: Research File Update

Update `research/nitrogen_food_coupling_20251115.md` with verification results:
- Add "VERIFIED" tags to confirmed claims
- Add "NEEDS REVISION" tags to unsupported claims
- Add direct quotes from papers (with page numbers)
- Flag any parameters that need adjustment

### Phase 4: Implementation Adjustment (if needed)

If verification reveals inaccurate claims:
1. Update parameter values to match research
2. Add comments documenting the correction
3. Run Monte Carlo validation (N=10) to check impact
4. Document changes in devlog

---

## Expected Outcomes

### Success Criteria

- **Citation Existence:** 90%+ of claims have verifiable sources
- **Claim Accuracy:** 80%+ of claims directly supported by cited papers
- **Parameter Fidelity:** All tech effectiveness values justified by research

### Known Risks

1. **Nitroplast Agricultural Application:** Speculative (marine discovery 2024, cereal crops theoretical)
2. **Science Advances (2024) South Asia:** May need more specific citation (author, month)
3. **Generic Tech Descriptions:** Some techs lack specific citations (nitrification inhibitors, algae capture)

### Validation Impact

If verification passes:
- God mode biogeochemical effectiveness: Expected 10% → 30-50%
- Recovery timeline: Decades (inertia from legacy stocks)
- Regional equity: South Asia zero-penalty zone (55% overuse buffer)

If verification fails:
- Adjust tech effectiveness values to match research
- Flag speculative parameters with uncertainty bounds
- Document conservative estimates vs optimistic scenarios

---

## Next Steps

1. **Orchestrator Queue:** Add to `plans/SIMULATION_ROADMAP.md` (Research Verification Queue)
2. **Channel Notification:** Post to `implementation` channel (trigger orchestrator)
3. **Validation Phase:** Research-skeptic performs two-layer verification
4. **Documentation Update:** Update wiki with verification results
5. **Archive:** Move to `research/verified/` if validation passes

---

## References

- **Commit:** 71b97c5aa0778889e874390988a5ca940f98a38c
- **Research File:** `research/nitrogen_food_coupling_20251115.md` (883 lines, 29 sources, Grade B)
- **Modules:** `legacyNutrientStocks.ts`, `nitrogenFoodCoupling.ts` (created in prior commits)
- **Session Archive:** `plans/completed/session_work_nov15_2025_researcher_213002.md`
- **Critique:** `reviews/nitrogen_food_coupling_critique_20251115.md` (Grade B - CONDITIONAL PASS)

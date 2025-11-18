# Research Verification Spec: Biogeochemical Flows Integration

**Commit:** a0c047be5327893842e0daa160b654538bd4d797
**Date:** 2025-11-16
**Status:** PENDING VALIDATION
**Research Quality (claimed):** Grade B, 29 peer-reviewed sources (2021-2024)

## Purpose

This verification file documents all research claims made in the biogeochemical flows integration commit for two-layer validation:

1. **Layer 1 - Citation Existence:** Do cited papers actually exist? Are author names, years, and titles accurate?
2. **Layer 2 - Claim Verification:** Does the paper ACTUALLY support the claim made?

## Implementation Files Changed

- `src/simulation/engine/phases/ResourceSoilPhase.ts` (lines 58-120)
- `src/simulation/initialization.ts` (line 1053)
- `src/simulation/techTree/comprehensiveTechTree.ts` (lines 440-582)

## Research Documentation Referenced

- `research/nitrogen_food_coupling_20251115.md` (883 lines, 29 sources claimed)

---

## Research Claims to Verify

### 1. Legacy Nutrient Stocks - Lake Erie Sediment Loading

**Location:** `ResourceSoilPhase.ts:60-61`

**Claim Made:**
> "Research: Lake Erie sediment loading, nitrogen half-life studies"

**Specific Parameters:**
- Sediment phosphorus loading: 10,000-11,000 MT P/year (from internal loading)
- Nitrogen half-life: 30 years (exponential decay constant)

**Citations to Verify:**

From `research/nitrogen_food_coupling_20251115.md`:

1. **Paerl et al. (2024)** - Lake Erie sediment loading claim
   - **Expected source:** Section on legacy stocks, phosphorus internal loading
   - **Claim:** Internal loading equals external inputs (10,000-11,000 MT P/year)
   - **Verification needed:** Does paper provide these specific values? Quote exact passage.

2. **Nitrogen half-life (30 years)**
   - **Source citation needed:** Research doc mentions "30-100yr half-lives" but specific 30-year value for nitrogen needs source
   - **Verification needed:** Find specific paper supporting 30-year N half-life in sediments

**Files to check:**
- `research/nitrogen_food_coupling_20251115.md` section 3 (Legacy Stocks)
- Look for Paerl citation with DOI/PMID

---

### 2. Regional Nitrogen Overuse - South Asia 55%

**Location:** `ResourceSoilPhase.ts:66`, `nitrogenFoodCoupling.ts` (implied)

**Claim Made:**
> "Regional yield penalties (3% at 15% reduction)"
> "Zero penalty in overuse zones (South Asia 55% overuse)"

**Specific Parameters:**
- South Asia nitrogen overuse: 55% (can reduce by 55% with zero yield penalty)
- Yield penalty curve: 3% loss at 15% reduction
- Regional differentiation: Some regions can reduce more than others

**Citations to Verify:**

From `research/nitrogen_food_coupling_20251115.md`:

1. **Regional nitrogen overuse patterns**
   - **Expected source:** Section on regional differentiation
   - **Claim:** South Asia has 55% nitrogen overuse (surplus beyond crop needs)
   - **Verification needed:** Which paper supports 55% specific value? Quote exact passage.

2. **Yield penalty curve (3% at 15% reduction)**
   - **Expected source:** Precision agriculture effectiveness studies
   - **Claim:** 15% nitrogen reduction causes 3% yield penalty
   - **Verification needed:** Which paper provides this relationship? Quote exact passage.

**Files to check:**
- `research/nitrogen_food_coupling_20251115.md` section 1.2 (Nitrogen Use Efficiency)
- `research/nitrogen_food_coupling_20251115.md` section 2 (Regional Differentiation)

---

### 3. Technology Effectiveness Parameters

**Location:** `comprehensiveTechTree.ts:440-582`

Six new technologies added with specific effectiveness claims:

#### 3.1 Food Waste Reduction (30% demand reduction)

**Claim:** Supply chain optimization reduces food waste by 30%, therefore reducing nitrogen demand by 30%

**Citations to Verify:**
- **Expected source:** Food waste studies (FAO, UNEP)
- **Claim:** 30% food waste reduction is achievable globally
- **Verification needed:** Which paper supports 30% reduction potential? Quote exact passage.

#### 3.2 Rhizosphere Engineering (10-15% efficiency gain)

**Claim:** Enhanced root-microbe interactions provide 10-15% nitrogen efficiency improvement

**Citations to Verify:**
- **Expected source:** Rhizosphere microbiome optimization studies
- **Claim:** 10-15% efficiency gain from rhizosphere engineering
- **Verification needed:** Which paper supports this range? Quote exact passage.
- **Implementation uses:** 15% (upper bound) - verify this is justified

#### 3.3 Alternative Protein - Insects & Algae (80× efficiency vs cattle)

**Claim:** Industrial insect/algae farming has 80× efficiency improvement vs cattle, translating to 25% nitrogen reduction when deployed

**Citations to Verify:**
- **Expected source:** Alternative protein lifecycle analysis
- **Claim:** 80× efficiency improvement (insects/algae vs cattle)
- **Verification needed:** Which paper supports 80× factor? Quote exact passage.
- **Claim:** Translates to 25% nitrogen reduction at scale
- **Verification needed:** Is this conversion justified? Show calculation.

#### 3.4 Nitroplast Integration (40-80% fertilizer elimination, TIER 2, 2045+)

**Claim:** Engineered nitrogen-fixing organelles in cereal crops eliminate 40-80% fertilizer need

**Citations to Verify:**
- **Expected source:** Coale et al. (2024) *Science* - marine algae nitroplast discovery
- **Claim:** Nitroplasts discovered in marine algae (April 2024)
- **Verification needed:** Confirm Coale et al. (2024) discovery in *Science*
- **Claim:** Cereal application could achieve 40-80% fertilizer reduction
- **Verification needed:** Is cereal application supported or speculative? Paper may only discuss algae.
- **Timeline (2045+):** Is this justified? Or is it pure speculation?
- **Implementation uses:** 70% (middle of range) - verify this is reasonable

**CRITICAL:** This is likely a speculative extrapolation. The paper may only discuss algae nitroplasts, NOT cereal crops. Mark as speculative if true.

#### 3.5 Active Sediment Management (15% sediment reduction)

**Claim:** Dredging, capping, P-binding amendments reduce legacy phosphorus sediment stock by 15%

**Citations to Verify:**
- **Expected source:** Lake restoration case studies
- **Claim:** Active management achieves 15% sediment phosphorus reduction
- **Verification needed:** Which paper supports 15% effectiveness? Quote exact passage.

#### 3.6 Phytoremediation Networks (5% N capture, 8% P capture)

**Claim:** Constructed wetlands capture 5% nitrogen runoff, 8% phosphorus runoff

**Citations to Verify:**
- **Expected source:** Wetland nutrient retention studies
- **Claim:** Wetlands capture 5% nitrogen, 8% phosphorus
- **Verification needed:** Which paper supports these specific percentages? Quote exact passage.

---

### 4. Baseline Parameters

**Location:** `ResourceSoilPhase.ts:71-78`

**Claims Made:**
- Baseline phosphorus input: 25 Mt P/year (2025)
- Baseline nitrogen input: 120 Mt N/year (2025)
- Nitrogen use efficiency: 46% global average (40-53% range)

**Citations to Verify:**

From `research/nitrogen_food_coupling_20251115.md`:

1. **Zhang et al. (2021)** - Global nitrogen budgets
   - **Claim:** 120 Mt N/year baseline (2025)
   - **Verification needed:** Does paper provide 2025 projection? Or is this extrapolated?

2. **Lassaletta et al. (2024)** - Nutrient use efficiency
   - **Claim:** Global NUE 46% (range 40-53%)
   - **Verification needed:** Does paper provide these specific values? Quote exact passage.

3. **Phosphorus baseline (25 Mt P/year)**
   - **Source citation needed:** Research doc should cite source for phosphorus input baseline
   - **Verification needed:** Which paper supports 25 Mt P/year?

---

## Verification Workflow

**Phase 1: Citation Existence (super-alignment-researcher)**
1. Open `research/nitrogen_food_coupling_20251115.md`
2. For each citation above, verify:
   - Paper exists (not phantom publication)
   - Authors, year, title match
   - DOI/PMID is correct
   - Paper is accessible

**Phase 2: Claim Verification (research-skeptic)**
1. For each claim, read the actual paper
2. Find the specific passage supporting the claim
3. Quote the exact text from the paper
4. Assess:
   - SUPPORTED: Claim directly supported by paper
   - PARTIAL: Claim partially supported (e.g., algae nitroplasts vs cereal application)
   - EXTRAPOLATED: Claim requires inference beyond paper's scope
   - UNVERIFIED: Paper does not support claim
   - CONTRADICTED: Paper contradicts claim

**Phase 3: Parameter Justification**
1. For each parameter value used in implementation:
   - Conservative vs aggressive (e.g., 70% for nitroplasts uses middle of 40-80% range)
   - Justified by research or arbitrary choice?
   - Document rationale

---

## Expected Issues

Based on commit message claiming "Grade B, 29 sources":

1. **Nitroplast cereals:** Likely speculative extrapolation from algae discovery
2. **Regional overuse (55%):** May be aggregated estimate, not single-source
3. **Technology effectiveness ranges:** May use upper bounds without justification
4. **2045+ timeline:** Speculative deployment date, likely not research-backed

---

## Success Criteria

**PASS:** All core parameters have direct research support with quoted passages
**CONDITIONAL PASS:** Minor extrapolations clearly documented, conservative values used
**FAIL:** Major claims unsupported or contradicted by cited research

**Next Steps:**
1. Orchestrator picks up this verification file
2. Research-skeptic performs Layer 1 + Layer 2 validation
3. Implementation adjusted if FAIL, or merged if PASS/CONDITIONAL PASS
4. Archive verification results

---

## Related Files

- Implementation: `src/simulation/engine/phases/ResourceSoilPhase.ts`
- Research: `research/nitrogen_food_coupling_20251115.md`
- Critique: `reviews/nitrogen_food_coupling_critique_20251115.md` (Sylvia, Grade B - CONDITIONAL PASS)
- Modules: `src/simulation/legacyNutrientStocks.ts`, `src/simulation/nitrogenFoodCoupling.ts`

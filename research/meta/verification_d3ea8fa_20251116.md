# Research Verification Specification: Nitrogen-Food Coupling Integration

**Commit:** d3ea8fa5323ddd547566934b078dfad36cfbcf6f
**Date:** November 16, 2025
**System:** Nitrogen-food coupling, legacy nutrient stocks, regional yield penalties
**Verification Required:** TWO-LAYER (citation existence + claim accuracy)

---

## Executive Summary

This commit integrates nitrogen-food coupling research into the simulation engine with three major components:
1. Legacy nutrient stock dynamics (soil/sediment half-lives)
2. Regional nitrogen penalty system (food production impacts)
3. Technology nitrogen reduction effects (vertical farming, precision fermentation)

**Research foundation cited:** 29 peer-reviewed sources in `research/nitrogen_food_coupling_20251115.md`
**Critique:** Grade B validation in `reviews/nitrogen_food_coupling_critique_20251115.md`

**Verification scope:** This file documents specific claims made in the CODE that require verification against the cited research.

---

## Layer 1: Citation Existence Verification

**Primary Research File:** `research/nitrogen_food_coupling_20251115.md`

### Required Checks:
- [ ] Do all 29 cited papers actually exist?
- [ ] Are author names, years, titles accurate?
- [ ] Are papers accessible (not phantom publications)?
- [ ] Are DOIs/PMIDs valid and resolvable?

**Key citations to verify:**
1. Paerl et al. (2024) - Lake Erie internal loading study
2. Springmann et al. (2018) - "Options for keeping the food system within environmental limits" (Nature)
3. Smil (2002, 2004) - Nitrogen and food production
4. Zhang et al. (2021) - "Quantification of global and national nitrogen budgets" (Nature Food)
5. Erisman et al. (2008) - Population dependency on synthetic nitrogen

---

## Layer 2: Claim Verification (CRITICAL)

### Claim 1: Legacy Nutrient Stock Half-Lives

**Location:** `src/simulation/planetaryBoundaries.ts:811-850`

**CODE IMPLEMENTATION:**
```typescript
// Soil half-life: 30 years
const SOIL_HALF_LIFE_MONTHS = 30 * 12;  // 360 months

// Sediment half-life: 100 years
const SEDIMENT_HALF_LIFE_MONTHS = 100 * 12;  // 1200 months
```

**CLAIM MADE IN CODE COMMENTS:**
- "30-year soil half-life, 100-year sediment half-life"
- "Lake Erie (Paerl et al. 2024) - sediment loading equals external inputs"

**VERIFICATION REQUIRED:**
- [ ] Does Paerl et al. (2024) actually provide 30-year soil half-life?
- [ ] Does Paerl et al. (2024) actually provide 100-year sediment half-life?
- [ ] Does the paper state "sediment loading equals external inputs" or is this extrapolated?
- [ ] Quote exact passage from paper supporting these specific values

**Research file location:** `research/nitrogen_food_coupling_20251115.md:16`
- **Quote from research file:** "Internal nutrient loading from sediments can equal external inputs (Paerl et al. 2024 - Lake Erie: 10,000-11,000 MT P/year)"

**Potential issues:**
- Research file mentions "Lake Erie: 10,000-11,000 MT P/year" but doesn't quote half-life values
- Half-lives may be INFERRED rather than directly stated in paper
- Need to verify if these specific timescales are in the paper or extrapolated from other sources

---

### Claim 2: Nitrogen Baseline Values

**Location:** `src/simulation/planetaryBoundaries.ts:822-830`

**CODE IMPLEMENTATION:**
```typescript
// Baseline (2025): ~120 Mt N/year = 10 Mt N/month, ~25 Mt P/year = 2.08 Mt P/month
const BASELINE_N_INPUT = 10.0;   // Mt N/month (2025 baseline)
const BASELINE_P_INPUT = 2.08;   // Mt P/month (2025 baseline)
```

**CLAIM MADE IN CODE COMMENTS:**
- "Baseline (2025): ~120 Mt N/year current input"
- "Boundary value 2.94 (2025 baseline) corresponds to ~10 Mt N/month + ~2 Mt P/month current"

**VERIFICATION REQUIRED:**
- [ ] Is 120 Mt N/year current (2025) baseline supported by cited research?
- [ ] Is 25 Mt P/year (2.08 Mt/month) phosphorus baseline accurate for 2025?
- [ ] What is the source for boundary value 2.94 calibration?
- [ ] Quote exact passage supporting these values

**Research file location:** `research/nitrogen_food_coupling_20251115.md:51-57`
- **Quote from research file:**
  - "Synthetic fertilizers: 107.7 Mt (2018 data)"
  - "Total N inputs (2024 forecast): ~110-112 Mt from synthetic fertilizers alone"

**Potential issues:**
- Code uses 120 Mt N/year but research file says 107.7-112 Mt N/year
- Discrepancy of ~8-12 Mt N/year (~10% difference)
- Need to verify if 120 Mt is from a different source or includes non-synthetic sources

---

### Claim 3: Regional Nitrogen Overuse (South Asia)

**Location:** `src/simulation/engine/phases/FoodSecurityDegradationPhase.ts:179-197`

**CODE IMPLEMENTATION:**
```typescript
// Research: Regional nitrogen reduction → yield penalties (55% South Asian rice farms overuse)
```

**CLAIM MADE IN CODE COMMENTS:**
- "55% South Asian rice farms overuse"

**VERIFICATION REQUIRED:**
- [ ] Which cited paper provides the "55% South Asian rice farms overuse" statistic?
- [ ] Does the paper define "overuse" as exceeding planetary boundary safe limits?
- [ ] Quote exact passage from paper supporting this percentage
- [ ] Is this specific to rice farms or all agriculture?

**Research file search:**
- Searched `research/nitrogen_food_coupling_20251115.md` for "55%" - **NOT FOUND**
- Searched for "South Asia" - Found in section 2.5 (regional nitrogen data)

**Potential issues:**
- **CRITICAL:** The 55% claim does NOT appear in the research file
- This may be from a different source or mis-cited
- Need to identify original source and verify claim

---

### Claim 4: Technology Nitrogen Reduction Rates

**Location:** `src/simulation/techTree/comprehensiveTechTree.ts:1743-1765`

**CODE IMPLEMENTATION:**
```typescript
// Vertical Farming
nitrogenReduction: 0.60,  // TIER 2 HIGH (Nov 15, 2025): 60% fertilizer reduction (Springmann et al. 2018)

// Precision Fermentation
nitrogenReduction: 0.40,  // TIER 2 HIGH (Nov 15, 2025): 30-50% agricultural N reduction (average 40%, Springmann et al. 2018)
```

**CLAIM MADE IN CODE COMMENTS:**
- "60% fertilizer reduction (Springmann et al. 2018)" for vertical farming
- "30-50% agricultural N reduction (average 40%, Springmann et al. 2018)" for precision fermentation

**VERIFICATION REQUIRED:**
- [ ] Does Springmann et al. (2018) actually state 60% nitrogen reduction for vertical farming?
- [ ] Does Springmann et al. (2018) actually state 30-50% nitrogen reduction for precision fermentation?
- [ ] Quote exact passages from paper supporting these specific percentages
- [ ] Are these values for nitrogen reduction specifically, or total environmental impact?

**Research file location:** `research/nitrogen_food_coupling_20251115.md:86-92`
- **Quote from research file:**
  - "Nitrogen Demand Reduction via Dietary Shift: Plant-based diet: Can reduce agricultural N demand by 20-35%"
  - "Precision fermentation proteins: Could reduce agricultural N demand by 30-50% if scaled globally"

**Potential issues:**
- Research file mentions 30-50% for precision fermentation (matches code)
- Research file does NOT mention 60% for vertical farming
- Vertical farming reduction may be from a different source or extrapolated
- Need to verify Springmann et al. (2018) actually discusses vertical farming

---

### Claim 5: Multiplicative Technology Synergies

**Location:** `src/simulation/techTree/effectsEngine.ts:1589-1611`

**CODE IMPLEMENTATION:**
```typescript
// Effect is multiplicative across all technologies (not additive)
const nitrogenReducingTechs = gameState.techTreeState?.nodes
  ?.filter(node => node.deploymentLevel > 0 && node.effects?.nitrogenReduction)
  .map(node => (node.effects.nitrogenReduction || 0) * (node.deploymentLevel || 0)) || [];
```

**CLAIM MADE IN CODE COMMENTS:**
- "Effect is multiplicative across all technologies (not additive)"

**VERIFICATION REQUIRED:**
- [ ] Is multiplicative synergy supported by research, or is this a modeling assumption?
- [ ] Do cited papers discuss how multiple nitrogen-reduction technologies interact?
- [ ] Quote any passage discussing technology synergies vs. independent effects
- [ ] If this is an assumption, should it be documented as such?

**Research file search:**
- Searched for "multiplicative" - **NOT FOUND**
- Searched for "synerg" - **NOT FOUND**
- Searched for "additive" - **NOT FOUND**

**Potential issues:**
- **CRITICAL:** Multiplicative vs. additive is a MODELING CHOICE, not research-backed
- This should be documented as an assumption requiring validation
- May need sensitivity analysis to test both approaches

---

## Layer 3: Parameter Consistency Checks

### Check 1: Nitrogen Baseline Consistency

**Cross-reference:**
- Code: 120 Mt N/year (planetaryBoundaries.ts:822)
- Research file: 107.7-112 Mt N/year (nitrogen_food_coupling_20251115.md:51-57)
- Critique: 107 Mt N/year validated (nitrogen_food_coupling_critique_20251115.md:17)

**INCONSISTENCY DETECTED:** Code uses 120 Mt, research/critique use 107-112 Mt

**Resolution required:**
- [ ] Identify authoritative source for 2025 nitrogen baseline
- [ ] Update code OR research file to match
- [ ] Document why 120 Mt was chosen if different from research consensus

---

### Check 2: Regional Mapping Accuracy

**Location:** `src/simulation/engine/phases/FoodSecurityDegradationPhase.ts:183-190`

**CODE IMPLEMENTATION:**
```typescript
const nitrogenRegionMap: Record<string, string> = {
  'South Asia': 'southAsia',
  'East Asia': 'eastAsia',
  'North America': 'northAmerica',
  'Europe': 'europe',
  'Latin America': 'latinAmerica',
  'Sub-Saharan Africa': 'subSaharanAfrica',
  'Middle East & North Africa': 'northAmerica',  // Fallback (no specific data)
};
```

**VERIFICATION REQUIRED:**
- [ ] Are these region names consistent with research file regional data?
- [ ] Is "Middle East & North Africa" → "northAmerica" fallback justified?
- [ ] Does research file provide data for all 7 simulation regions?
- [ ] Quote regional nitrogen data from research file

**Research file location:** `research/nitrogen_food_coupling_20251115.md:60-65`
- Lists regions: France, China, India (not comprehensive regional breakdown)

**Potential issues:**
- Research file does not provide comprehensive regional data for all simulation regions
- Fallback mapping may introduce errors
- Need to verify if regional nitrogen management data exists for all regions

---

## Verification Workflow

### Phase 1: Citation Validation (super-alignment-researcher)
1. Verify all 29 citations exist and are accessible
2. Extract DOIs/PMIDs and validate
3. Download PDFs for key papers (Paerl 2024, Springmann 2018, Smil 2002)
4. Create citation validation report

### Phase 2: Claim Verification (research-skeptic)
1. For EACH claim above, read cited paper and:
   - Find exact passage supporting claim
   - Quote passage in verification report
   - Mark as VERIFIED or UNVERIFIED
   - Document discrepancies
2. Identify claims that are:
   - **Directly supported:** Paper explicitly states the value
   - **Inferred:** Value calculated/extrapolated from paper data
   - **Unsupported:** Cannot find support in cited paper
   - **Modeling assumption:** Not from research, but reasonable choice

### Phase 3: Parameter Correction (simulation-maintainer)
1. For UNVERIFIED claims:
   - Find correct values from research
   - Update code parameters
   - Document changes in commit message
2. For MODELING ASSUMPTIONS:
   - Add explicit documentation in code comments
   - Add to research questions for future validation

---

## Expected Outcomes

### Best Case:
- All claims verified with direct quotes
- Minor parameter adjustments (<10% changes)
- Code matches research foundation

### Likely Case:
- 70-80% of claims verified
- Some parameters need correction (e.g., 120 Mt → 107 Mt nitrogen baseline)
- Some modeling assumptions identified and documented
- 55% South Asia claim needs new source or removal

### Worst Case:
- Major discrepancies found (>20% parameter errors)
- Key claims unsupported by cited research
- Requires re-research and re-implementation

---

## Priority Flags

### CRITICAL ISSUES (Must resolve before merge):
1. **55% South Asian rice farms overuse** - claim not found in research file
2. **Multiplicative vs. additive synergies** - modeling assumption, not research-backed
3. **Nitrogen baseline 120 vs. 107-112 Mt/year** - parameter inconsistency

### HIGH PRIORITY (Should resolve):
1. Vertical farming 60% reduction - not found in research file
2. Legacy stock half-life values - need direct quotes from Paerl 2024
3. Regional mapping fallback justification

### MEDIUM PRIORITY (Document if can't resolve):
1. Boundary value 2.94 calibration source
2. Phosphorus baseline 25 Mt P/year verification
3. Regional nitrogen management data completeness

---

## Files to Validate

### Research Files:
- `research/nitrogen_food_coupling_20251115.md` (29 sources, primary reference)
- `reviews/nitrogen_food_coupling_critique_20251115.md` (Grade B validation)

### Code Files:
- `src/simulation/planetaryBoundaries.ts` (legacy stocks, baseline values)
- `src/simulation/engine/phases/FoodSecurityDegradationPhase.ts` (regional penalties)
- `src/simulation/techTree/effectsEngine.ts` (nitrogenReduction handler)
- `src/simulation/techTree/comprehensiveTechTree.ts` (tech nitrogen effects)

---

## Next Steps

1. **Orchestrator:** Add this verification to roadmap queue
2. **super-alignment-researcher:** Download and verify key papers (Paerl 2024, Springmann 2018)
3. **research-skeptic:** Read papers and verify each claim with exact quotes
4. **simulation-maintainer:** Apply corrections based on verification results
5. **priya:** Monte Carlo validation after corrections applied

**Timeline:** 2-4 hours for full verification workflow

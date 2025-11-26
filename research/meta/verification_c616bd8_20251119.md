---
commit: c616bd84606bbd453e077a1c9839a5085d45ed6d
date: 2025-11-19
verification_status: PENDING
priority: HIGH
systems_affected: ocean_acidification
phase: VALIDATION_READY
---

# Research Verification: Ocean Acidification 2024-2025 Coral Studies

**Commit:** c616bd84606bbd453e077a1c9839a5085d45ed6d
**Date:** November 19, 2025
**Verifier:** Pending orchestrator assignment
**Research File:** research/ocean_acidification_planetary_boundary_2025.md

---

## Summary

This commit adds two peer-reviewed studies (2024-2025) with specific quantitative claims about coral reef carbonate production decline and resilience under combined warming + acidification stressors. These studies provide SSP-scenario-specific projections and experimental evidence that will inform future simulation implementation.

**Key Claims to Verify:**
1. Carbonate production projections by SSP scenario (Bouttes et al. 2025)
2. Critical dissolution threshold at 560 ppm CO₂ (~2050)
3. Coral resilience under combined stressors (Jury et al. 2024)
4. Transformation vs. extinction dynamics

---

## Citation 1: Bouttes et al. (2025) - Coral Carbonate Production

### Publication Details

**Citation:** Bouttes, N., Kwiatkowski, L., Bougeot, E., Berger, M., Brovkin, V., & Munhoven, G. (2025). "Projections of coral reef carbonate production from a global climate–coral reef coupled model." *Biogeosciences*, 22, 4531–4544. https://doi.org/10.5194/bg-22-4531-2025

**Location in Research File:** research/ocean_acidification_planetary_boundary_2025.md:228-250

**Verification Tasks:**

#### Layer 1 - Citation Existence
- [ ] **Paper exists:** Verify DOI resolves to actual paper
- [ ] **Authors accurate:** Check author names, affiliations
- [ ] **Journal authentic:** Biogeosciences is peer-reviewed journal (Copernicus Publications)
- [ ] **Publication date:** Confirm 2025 publication
- [ ] **Accessible:** Can we obtain full text?

#### Layer 2 - Claim Verification

**Claim 1: Carbonate Production by 2100 (% of preindustrial)**

| Scenario | Without Thermal Adaptation | With Thermal Adaptation |
|----------|----------------------------|-------------------------|
| SSP1-2.6 | 0–50% | 70–76% |
| SSP2-4.5 | 0% (ceased) | ~50% |
| SSP3-7.0 | 0% (ceased) | <25% |
| SSP5-8.5 | 0% (ceased) | <25% |

**Verification Required:**
- [ ] Does paper provide these specific percentages?
- [ ] Are values for "with adaptation" vs "without adaptation" clearly distinguished?
- [ ] Quote the exact passage from paper supporting these values
- [ ] Check if values are model outputs or extrapolations
- [ ] Verify SSP scenarios are correctly matched

**Claim 2: Net Dissolution Threshold at 560 ppm CO₂ (~2050)**

*Research file states:* "Net dissolution expected when atmospheric CO₂ reaches **560 ppm** (~2050 under current emissions)"

**Verification Required:**
- [ ] Does paper explicitly state 560 ppm threshold for net dissolution?
- [ ] Quote the exact passage
- [ ] Is 2050 timing paper's projection or research file inference?
- [ ] What emission scenario is assumed for this timing?
- [ ] Is "net dissolution" defined the same way in paper?

**Claim 3: Coupled Model Methodology**

*Research file states:* "Global climate-coral reef coupled model projects catastrophic decline"

**Verification Required:**
- [ ] Confirm paper uses coupled climate-coral model
- [ ] Model name and specifications
- [ ] Spatial resolution and reef coverage
- [ ] Key assumptions and limitations

---

## Citation 2: Jury et al. (2024) - Coral Resilience Study

### Publication Details

**Citation:** Jury, C. P., et al. (2024). "Experimental coral reef communities transform yet persist under mitigated future ocean warming and acidification." *Proceedings of the National Academy of Sciences*, 121(45), e2407112121. https://doi.org/10.1073/pnas.2407112121

**Location in Research File:** research/ocean_acidification_planetary_boundary_2025.md:257-277

**Verification Tasks:**

#### Layer 1 - Citation Existence
- [ ] **Paper exists:** Verify DOI resolves to actual paper
- [ ] **Authors accurate:** Check lead author C. P. Jury and co-authors
- [ ] **Journal authentic:** PNAS is prestigious peer-reviewed journal
- [ ] **Publication date:** Confirm 2024 publication (issue 45)
- [ ] **Accessible:** PNAS papers usually open access after embargo

#### Layer 2 - Claim Verification

**Claim 1: Experimental Conditions (+2°C, -0.2 pH, 2-year study)**

*Research file states:* "2-year experimental study: +2°C warming + -0.2 pH acidification (Paris mitigation scenario)"

**Verification Required:**
- [ ] Confirm experimental duration was 2 years
- [ ] Verify warming treatment was exactly +2°C
- [ ] Verify acidification treatment was -0.2 pH units
- [ ] Quote passage describing experimental setup
- [ ] Confirm Paris Agreement scenario alignment claim
- [ ] Sample size and reef community composition

**Claim 2: Reefs Transform But Persist (Not Collapse)**

*Research file states:* "Reefs transform but persist as novel ecosystems rather than collapsing entirely"

**Verification Required:**
- [ ] Does paper explicitly state "transform yet persist" language?
- [ ] Quote the key findings about transformation vs. collapse
- [ ] What metrics define "persistence"?
- [ ] What metrics define "transformation"?
- [ ] Are there thresholds beyond which collapse occurs?

**Claim 3: Biodiversity Maintained Despite Structural Changes**

*Research file states:* "Biodiversity maintained despite structural changes"

**Verification Required:**
- [ ] Does paper show biodiversity metrics were maintained?
- [ ] Quote specific biodiversity measurements (species richness, Shannon index, etc.)
- [ ] What structural changes occurred?
- [ ] Were functional groups lost despite species persistence?
- [ ] Definition of "maintained" - statistical significance?

**Claim 4: Calcification Reduced 50-75%**

*Research file states:* "Calcification reduced 50-75% but not eliminated"

**Verification Required:**
- [ ] Does paper provide 50-75% reduction range for calcification?
- [ ] Quote exact calcification measurements
- [ ] Is this net community calcification or individual coral calcification?
- [ ] Time-averaged or endpoint measurement?
- [ ] Variance across species/treatments

**Claim 5: Species Composition Shifts**

*Research file states:* "Communities shift to novel species compositions (loss of branching corals, persistence of massive corals)"

**Verification Required:**
- [ ] Does paper document branching vs. massive coral differential survival?
- [ ] Quote species composition data
- [ ] Statistical significance of shifts
- [ ] Define "novel" - are these no-analog communities?

---

## Simulation Implementation Implications

### Current Implementation (src/simulation/oceanAcidification.ts)

**Relevant Code Sections:**
- Coral decline mechanics: Lines 94-132
- Aragonite saturation decline: Lines 57-77
- Extinction thresholds: Lines 202-226

### Parameters That May Need Updating Based on New Research

**If Bouttes et al. (2025) verified:**

1. **SSP-specific carbonate production trajectories**
   - Current: Single decline curve based on aragonite saturation
   - Proposed: SSP1-2.6, SSP2-4.5, SSP3-7.0, SSP5-8.5 distinct pathways
   - File: src/simulation/oceanAcidification.ts (coral decline section)

2. **560 ppm CO₂ dissolution threshold**
   - Current: Aragonite < 75% triggers active decline
   - Proposed: Add CO₂ concentration threshold at 560 ppm
   - File: May require climate system CO₂ tracking integration

3. **Thermal adaptation scenarios**
   - Current: No adaptation modeling
   - Proposed: Adaptation vs. no-adaptation pathways
   - File: src/simulation/oceanAcidification.ts (coral decline modifiers)

**If Jury et al. (2024) verified:**

1. **Transformation vs. extinction dynamics**
   - Current: Linear decline to extinction threshold
   - Proposed: Bifurcation at coral health < 50% - transformation state before extinction
   - File: src/simulation/oceanAcidification.ts:154-157

2. **Degraded persistence state**
   - Current: Coral health < 30% = extinction
   - Proposed: Coral health 30-50% = transformed ecosystem (reduced function, maintained presence)
   - File: New state variable for ecosystem transformation type

3. **Calcification reduction curve**
   - Current: Implicit in coral health decline
   - Proposed: Explicit 50-75% calcification reduction before full failure
   - File: src/simulation/oceanAcidification.ts (may need separate calcification tracking)

---

## Next Steps for Validation

### Phase 1: Citation Verification (research-skeptic)

1. Obtain full papers via DOI
2. Verify publication authenticity
3. Check author credentials and institutional affiliations
4. Confirm journal peer-review standards

### Phase 2: Claim Verification (research-skeptic + super-alignment-researcher)

1. Extract exact quotes for each quantitative claim
2. Compare claims in research file to actual paper content
3. Document discrepancies, extrapolations, or interpretations
4. Assess quality of evidence (sample size, statistical power, limitations)
5. Identify any contradictory findings in literature

### Phase 3: Implementation Specification (simulation-maintainer)

1. Convert verified parameters into simulation mechanics
2. Design state interface additions (if needed)
3. Plan phase modifications for SSP-specific trajectories
4. Document transformation vs. extinction logic
5. Write unit tests for new mechanics

### Phase 4: Monte Carlo Validation (priya)

1. Run baseline simulations with current mechanics
2. Implement verified parameter updates
3. Run N≥10 simulations with new mechanics
4. Compare outcome distributions
5. Validate effectiveness of coral transformation state

---

## Research Quality Assessment

**Preliminary Quality (Before Verification):**

- **Journals:** Biogeosciences (Copernicus), PNAS (high-impact) - Both peer-reviewed
- **Recency:** 2024-2025 (excellent - latest research)
- **Methodology:** Coupled climate model (Bouttes), Experimental mesocosm (Jury)
- **Scope:** Global projections + controlled experiment (complementary)

**Expected Verification Outcome:** HIGH confidence these are legitimate, high-quality sources

**Potential Issues to Watch:**

1. **Bouttes et al. 2025:**
   - Model uncertainties in thermal adaptation projections
   - SSP scenario assumptions (emissions pathways may diverge from projections)
   - Coral genetic diversity assumptions

2. **Jury et al. 2024:**
   - 2-year study may not capture long-term (decadal) dynamics
   - Mesocosm scale-up to global reef systems
   - "Transformation" may be endpoint artifact of study duration
   - Paris scenario (+2°C, -0.2 pH) may be optimistic

---

## Orchestrator Workflow Integration

**Handoff Status:** VALIDATION_READY

This verification file provides complete specification for validation phase. The orchestrator should:

1. **Skip research phase** (research already complete, file exists)
2. **Start at validation phase:**
   - Assign to research-skeptic + super-alignment-researcher
   - Verify both citations (existence + claims)
   - Document findings in this file
3. **Implementation phase:**
   - If verified: Assign to simulation-maintainer for parameter integration
   - If issues found: Return to super-alignment-researcher for alternate sources
4. **Testing phase:**
   - Unit tests for new mechanics
   - Monte Carlo validation (N≥10)
5. **Documentation phase:**
   - Update ocean-acidification.md with implementation details
   - Update wiki with new mechanics

**Priority:** HIGH - Affects TIER 1.3 implemented system with new quantitative projections

---

**Created:** November 19, 2025
**Status:** PENDING ORCHESTRATOR ASSIGNMENT
**Next Action:** Queue in implementation channel for orchestrator pickup

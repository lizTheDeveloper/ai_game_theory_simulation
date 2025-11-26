# Research Verification: Irreversibility Framework Implementation

**Commit:** 26dba7be484616c3ffcb28101bb88453f82ed25d
**Date:** November 17, 2025
**Agent:** historian (wiki-documentation-updater)
**Status:** AWAITING VERIFICATION

---

## Purpose

This file documents all research citations and claims made in the irreversibility framework implementation that require TWO-LAYER VERIFICATION:

**Layer 1 - Citation Existence:**
* Do cited papers actually exist?
* Are author names, years, and titles accurate?
* Are papers accessible (not phantom publications)?

**Layer 2 - CLAIM VERIFICATION (CRITICAL):**
* Does the paper ACTUALLY support the claim made?
* Quote the specific passage from the paper that backs the claim
* If claim is not supported: Mark as UNVERIFIED with explanation

---

## Section 1: Novel Entities Irreversibility (Phase 1)

### File: `src/simulation/planetaryBoundaries.ts` (lines 888-1009)

#### Citation 1: Cousins et al. 2022 - PFAS Atmospheric Persistence

**Location:** src/simulation/planetaryBoundaries.ts:888-1009 (novel entities recovery logic)

**Claim Made in Code/Comments:**
- "50-100 year half-life for PFAS atmospheric persistence"
- "75-year half-life used (within Cousins 2022 range)"
- "Montreal Protocol precedent for multi-decade recovery"

**Citation Information:**
- Author: Cousins et al.
- Year: 2022
- Title: [NEEDS VERIFICATION]
- Journal: [NEEDS VERIFICATION]
- DOI: [NEEDS VERIFICATION]

**Verification Needed:**
- [ ] Does Cousins et al. 2022 exist?
- [ ] Does it specifically state 50-100 year half-life for PFAS?
- [ ] Does it provide atmospheric persistence data (not just environmental persistence)?
- [ ] Is 75-year value within the range stated in the paper?
- [ ] Quote exact passage supporting the claim

**Related Research File:**
- research/novel_entities_zero_effectiveness_validation_20251113.md (contains Cousins 2022 citation)

---

#### Citation 2: Sörengård et al. 2024 - PFAS Removal Costs

**Location:** Commit message references "prevention-first paradigm"

**Claim Made:**
- "Cleanup limited to 5-15% effectiveness due to concentration gap"
- "Energy-gated cleanup requires fusion scale"
- "Concentration gap: 5-9 orders of magnitude"

**Citation Information:**
- Author: Sörengård, M., et al.
- Year: 2024
- Title: "Estimated scale of costs to remove PFAS from the environment at current emission rates"
- Journal: Science of the Total Environment
- DOI: 10.1016/j.scitotenv.2024.167861

**Verification Needed:**
- [ ] Verify paper exists and is accessible
- [ ] Confirm concentration gap magnitude (is it 5-9 orders or different?)
- [ ] Verify connection between concentration gap and effectiveness ceiling
- [ ] Quote passage linking concentration gap to remediation limits
- [ ] Verify energy requirement claims

**Related Research File:**
- research/novel_entities_zero_effectiveness_validation_20251113.md (contains detailed Sörengård 2024 analysis)

---

#### Parameter 1: 75-Year Recovery Half-Life

**Location:** src/simulation/planetaryBoundaries.ts (novel entities boundary properties)

**Value Used:** 75 years

**Research Claim:**
- "50-100 year range from Montreal Protocol recovery timescales"
- "Cousins et al. 2022 supports this range for PFAS"

**Verification Needed:**
- [ ] Confirm Montreal Protocol CFC recovery timescale (is it actually 50-100 years?)
- [ ] Verify PFAS half-life is comparable to CFCs (both persistent atmospheric pollutants)
- [ ] Check if 75 years is median/conservative within research range
- [ ] Look for contradictory evidence (shorter or longer recovery timescales)

---

#### Parameter 2: 15% Asymptotic Floor

**Location:** src/simulation/planetaryBoundaries.ts (minimumAsymptoticValue property)

**Value Used:** 0.15 (15%)

**Research Claim:**
- "15% permanent floor from background contamination"
- "Legacy stocks prevent full recovery"
- "Similar to persistent atmospheric pollutants"

**Verification Needed:**
- [ ] Does research support permanent floor concept for PFAS?
- [ ] Is 15% value empirically derived or theoretical?
- [ ] Are there studies on legacy PFAS stock persistence?
- [ ] Quote specific research backing 15% floor

**Potential Sources:**
- Glüge et al. 2020 (global PFAS contamination - 46,000 metric tons cited in research file)
- Persson et al. 2022 (novel entities boundary transgression)

---

#### Parameter 3: Prevention Effectiveness (20-40%)

**Location:** Code comments reference "prevention-first paradigm"

**Value Used:** 20-40% effectiveness range

**Research Claim:**
- "Chemical bans + green chemistry: 20-40% effectiveness"
- "Montreal Protocol precedent: production ban = 90-95% recovery"
- "Prevention >> cleanup"

**Verification Needed:**
- [ ] Verify Montreal Protocol recovery rates (is it actually 90-95%?)
- [ ] How does Montreal Protocol translate to PFAS (different chemistry)?
- [ ] Is 20-40% a conservative estimate or empirically derived?
- [ ] Are there PFAS-specific ban effectiveness studies?
- [ ] Quote research backing prevention effectiveness range

---

#### Parameter 4: Cleanup Effectiveness (5-15% max)

**Location:** Code references energy-gated cleanup with fusion requirement

**Value Used:** 5-15% maximum effectiveness

**Research Claim:**
- "Cleanup limited to 5-15% due to concentration gap"
- "Requires fusion-scale renewable energy (>100 EJ/year)"
- "Theoretical upper bound: 4-40% of global energy"

**Verification Needed:**
- [ ] Verify energy requirement calculations (Sörengård 2024 basis)
- [ ] Confirm concentration gap prevents >15% effectiveness
- [ ] Check if fusion energy scale is realistic gate (IEA 2024 baseline: 600 EJ/year)
- [ ] Verify 4-40% global energy claim is theoretical upper bound (not observed)
- [ ] Quote passages supporting effectiveness ceiling

**Critical Note from Critique:**
- Commit message states "CRITICAL-1: Flag energy trap as theoretical upper bound"
- Ensure comments distinguish observed vs. theoretical energy requirements

---

#### Parameter 5: Rebound Effect (10-20% range)

**Location:** Code implements deterministic rebound with uncertainty range

**Value Used:** 10-20% production increase when cleanup deployed

**Research Claim:**
- "Jevons paradox - cleanup enables increased production"
- "10-20% range (not fixed 10%)"
- "Uncertainty flagged - lack of empirical PFAS-specific data"

**Verification Needed:**
- [ ] Are there PFAS-specific rebound effect studies?
- [ ] Is 10-20% range extrapolated from other pollutants?
- [ ] What is the research basis for this range?
- [ ] Is this theoretical or observed?
- [ ] Quote research on rebound effects in pollution cleanup

**Critical Note from Critique:**
- "CRITICAL-3: Use 10-20% range (not fixed), add uncertainty flag"
- Must verify this is marked as HIGH UNCERTAINTY in code

---

## Section 2: Biosphere Extinction Debt (Phase 2)

### File: `src/simulation/planetaryBoundaries.ts` (lines 148-156, 768-832)

#### Citation 1: Tilman et al. 1994 - Extinction Debt Concept

**Location:** src/simulation/planetaryBoundaries.ts (biosphere extinction debt logic)

**Claim Made:**
- "Extinction debt concept - decades lag between habitat loss and extinction"
- "200-year recovery half-life for ecosystems"

**Citation Information:**
- Author: Tilman et al.
- Year: 1994
- Title: [NEEDS VERIFICATION]
- Journal: [NEEDS VERIFICATION]
- DOI: [NEEDS VERIFICATION]

**Verification Needed:**
- [ ] Does Tilman et al. 1994 exist and is accessible?
- [ ] Does it define "extinction debt" concept?
- [ ] Does it provide timescale data (decades lag)?
- [ ] Does it support 200-year recovery timescale or is this from different source?
- [ ] Quote exact passage on extinction debt definition and timescales

---

#### Citation 2: Kuussaari et al. 2009 - Extinction Debt Review

**Location:** Referenced in commit message and biosphere logic

**Claim Made:**
- "20-50 year lags observed between habitat loss and species loss"

**Citation Information:**
- Author: Kuussaari et al.
- Year: 2009
- Title: [NEEDS VERIFICATION - likely extinction debt review]
- Journal: [NEEDS VERIFICATION]
- DOI: [NEEDS VERIFICATION]

**Verification Needed:**
- [ ] Verify paper exists
- [ ] Confirm 20-50 year lag timescales
- [ ] Is this a meta-analysis or single study?
- [ ] Does it provide mechanistic explanation?
- [ ] Quote passage on lag timescales

---

#### Citation 3: Haddad et al. 2015 - Habitat Fragmentation

**Location:** Referenced in commit message

**Claim Made:**
- "200-year recovery timescales for fragmented habitats"
- "Habitat fragmentation effects on biodiversity"

**Citation Information:**
- Author: Haddad et al.
- Year: 2015
- Title: [NEEDS VERIFICATION]
- Journal: [NEEDS VERIFICATION]
- DOI: [NEEDS VERIFICATION]

**Verification Needed:**
- [ ] Verify paper exists and is from reputable journal
- [ ] Confirm 200-year recovery claim
- [ ] Is this ecosystem-specific or general?
- [ ] Does it support biosphere boundary recovery modeling?
- [ ] Quote specific passage on recovery timescales

---

#### Citation 4: IPBES 2019 - Biodiversity Loss Rates

**Location:** Referenced in commit message

**Claim Made:**
- "Partial irreversibility of biodiversity loss"
- "5% permanent extinction debt floor"
- "Current extinction rate 100-1000× background"

**Citation Information:**
- Author: IPBES (Intergovernmental Science-Policy Platform on Biodiversity and Ecosystem Services)
- Year: 2019
- Title: [NEEDS VERIFICATION - likely Global Assessment Report]
- Type: Policy report (not peer-reviewed journal)
- URL: [NEEDS VERIFICATION]

**Verification Needed:**
- [ ] Identify specific IPBES 2019 report (Global Assessment?)
- [ ] Confirm 100-1000× background extinction rate claim
- [ ] Does IPBES explicitly state "partial irreversibility"?
- [ ] Is 5% floor empirically derived or model assumption?
- [ ] Quote relevant sections from IPBES report
- [ ] Note: IPBES is authoritative but policy report, not peer-reviewed paper

---

#### Parameter 1: 200-Year Recovery Half-Life

**Location:** src/simulation/planetaryBoundaries.ts (biosphere boundary properties)

**Value Used:** 200 years

**Research Claim:**
- "Century-scale ecosystem recovery"
- "Haddad et al. 2015 supports 200-year timescale"

**Verification Needed:**
- [ ] Confirm 200-year value comes from Haddad 2015 (or different source?)
- [ ] Is this for all ecosystems or specific types?
- [ ] Are there contradictory studies showing faster/slower recovery?
- [ ] Does this account for species composition or just ecosystem function?
- [ ] Quote research backing 200-year half-life

---

#### Parameter 2: 5% Permanent Extinction Debt Floor

**Location:** src/simulation/planetaryBoundaries.ts (minimumAsymptoticValue)

**Value Used:** 0.05 (5%)

**Research Claim:**
- "5% permanent extinction debt floor"
- "Extinct species don't return"
- "New species can evolve, but timescale > simulation duration"

**Verification Needed:**
- [ ] Is 5% empirically derived or theoretical assumption?
- [ ] Does IPBES 2019 provide basis for this value?
- [ ] Are there studies on biodiversity recovery floors?
- [ ] Is this conservative or optimistic?
- [ ] Quote research backing 5% floor

---

#### Parameter 3: Habitat Restoration Effectiveness (40%)

**Location:** Referenced in commit message

**Value Used:** 40% effectiveness

**Research Claim:**
- "Habitat restoration (40% effectiveness)"
- "Rewilding (20% effectiveness)"
- "Prevention > remediation"

**Verification Needed:**
- [ ] What research supports 40% restoration effectiveness?
- [ ] Is this ecosystem-specific or general?
- [ ] How is effectiveness measured (species richness, biomass, function)?
- [ ] Is 20% rewilding effectiveness separate from or included in 40%?
- [ ] Quote research backing these effectiveness values

---

## Section 3: Cross-Cutting Parameters

### Montreal Protocol Comparison

**Claim Made Throughout:**
- "Montreal Protocol precedent for multi-decade recovery"
- "Production ban = 90-95% recovery"
- "Similar timescales for persistent atmospheric pollutants"

**Verification Needed:**
- [ ] Verify Montreal Protocol CFC recovery rates (actual observed data)
- [ ] Timeline: when was ban enacted vs. when recovery observed?
- [ ] Is PFAS chemistry comparable to CFCs for this analogy?
- [ ] Are there peer-reviewed analyses of Montreal Protocol effectiveness?
- [ ] Quote research on Montreal Protocol as precedent

---

### Energy Requirements (Fusion Gate)

**Claim Made:**
- "Requires fusion-scale renewable energy (>100 EJ/year)"
- "IEA 2024 baseline: ~600 EJ/year global energy"
- "Theoretical upper bound: 4-40% of global energy"

**Verification Needed:**
- [ ] Verify IEA 2024 global energy baseline (is it 600 EJ/year?)
- [ ] Confirm calculation: cleanup energy / total energy = 4-40%
- [ ] Is this Sörengård 2024 estimate or separate calculation?
- [ ] Is fusion energy scale realistic gate or aspirational?
- [ ] Quote IEA data and energy requirement calculations

---

## Section 4: Technology Definitions

### Biogeochemical Technologies Preserved (6 techs)

**Location:** src/simulation/techTree/comprehensiveTechTree.ts

**Technologies:**
1. Nitrogen use efficiency improvements
2. Nitrification inhibitors
3. Cover crops
4. Precision agriculture
5. Manure management systems
6. Wetland buffers

**Verification Needed:**
- [ ] These are from nitrogen-food coupling work (commit 405b0ab)
- [ ] No new research claims - technologies already validated
- [ ] Verify merge preserved correct tech definitions
- [ ] Check no parameter changes introduced

---

## Section 5: Implementation Fidelity Checks

### Assertion Utilities Usage

**Claim:** "All NaN protection uses assertion utilities (no silent fallbacks)"

**Verification Points:**
- [ ] Check asymptoteRecovery function uses assertFinite (src/simulation/utils/irreversibility.ts)
- [ ] Verify no `?? fallback` patterns in recovery calculations
- [ ] Confirm RNG is required parameter (not optional with Math.random fallback)
- [ ] Check boundary property access uses safe patterns

---

### Determinism

**Claim:** "Required RNG parameter (no Math.random fallbacks)"

**Verification Points:**
- [ ] Verify rebound effect uses RNG (10-20% range: `0.10 + rng() * 0.10`)
- [ ] Check no Math.random() in irreversibility logic
- [ ] Confirm asymptotic recovery is deterministic (no randomness)
- [ ] Verify seed reproducibility in Monte Carlo tests

---

## Section 6: Validation Priorities

### CRITICAL (Must Verify Before Merge)

1. **Cousins et al. 2022** - Core citation for PFAS persistence and half-life
2. **75-year half-life** - Central parameter for recovery timescales
3. **15% floor** - Permanent contamination assumption
4. **Tilman et al. 1994** - Extinction debt concept foundation
5. **200-year biosphere recovery** - Core timescale parameter

### HIGH (Should Verify Soon)

1. **Sörengård et al. 2024** - Energy/cost constraints (likely already validated in Nov 13 research)
2. **Haddad et al. 2015** - Habitat fragmentation timescales
3. **IPBES 2019** - Biodiversity loss rates and irreversibility
4. **Prevention effectiveness (20-40%)** - Montreal Protocol analogy
5. **5% extinction floor** - Permanent biodiversity loss assumption

### MEDIUM (Validate for Completeness)

1. **Kuussaari et al. 2009** - Extinction debt lag timescales
2. **IEA 2024 baseline** - Global energy context
3. **Rebound effect (10-20%)** - Marked as HIGH UNCERTAINTY
4. **Cleanup effectiveness (5-15%)** - Concentration gap constraint
5. **Montreal Protocol precedent** - Recovery rate comparison

---

## Orchestrator Workflow Entry Point

**Status:** READY FOR VALIDATION PHASE

**Research file created:** ✅ (this file)
**Next phase:** VALIDATION (research-skeptic review)

**Orchestrator should:**
1. Skip research phase (research file already exists from Nov 13 + this verification file)
2. Start at validation phase (spawn research-skeptic)
3. Research-skeptic verifies:
   - Citation existence (Layer 1)
   - Claim accuracy (Layer 2)
4. Create verification report
5. If PASS → proceed to Monte Carlo + Architecture Review
6. If FAIL → document gaps, propose corrections

**Expected Timeline:**
- Validation: 2-3 hours (research-skeptic)
- Monte Carlo: 30 minutes (Priya)
- Architecture Review: 1 hour (architecture-skeptic)
- Total: 3.5-4.5 hours

---

## Notes for Research-Skeptic

**Existing Research Base:**
- research/novel_entities_zero_effectiveness_validation_20251113.md (742 lines, 16 sources)
  - Already validates Sörengård 2024, Cousins 2022 (partially)
  - May not cover biosphere extinction debt citations

**Focus Verification On:**
1. **Biosphere citations** (Tilman 1994, Kuussaari 2009, Haddad 2015, IPBES 2019) - NEW
2. **Specific claim accuracy** for all parameters (not just citation existence)
3. **Montreal Protocol analogy** - verify this is valid comparison
4. **Parameter ranges** - are 75yr, 15%, 200yr, 5% values within research bounds?

**Expected Challenges:**
- IPBES 2019 is policy report (not peer-reviewed) - assess authority level
- Montreal Protocol comparison may be imperfect analogy (CFCs ≠ PFAS)
- Some parameters may be theoretical/model assumptions (not empirical)
- Rebound effect already flagged as HIGH UNCERTAINTY

**Output Should Include:**
- Grade (A-F) for citation quality
- PASS/FAIL for each claim
- Specific quotes from papers supporting claims
- Gaps identified (missing evidence, overclaims, contradictory research)
- Recommendations (keep parameters, adjust ranges, flag uncertainty)

---

**File Status:** READY FOR ORCHESTRATOR PICKUP
**Created:** 2025-11-17
**Commit:** 26dba7be484616c3ffcb28101bb88453f82ed25d

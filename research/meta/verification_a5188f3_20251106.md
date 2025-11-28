# Research Verification: Climate Tipping Point Timescale Adjustments
**Commit:** a5188f3519b452e72c76370c483a47b559b68ddb
**Date:** November 6, 2025
**Verification Status:** PENDING VALIDATION

## Overview

This commit modified three tipping point parameters based on peer-reviewed research. This file documents the specific claims that require citation verification.

## Layer 1: Citation Existence Verification

### Citation 1: Armstrong McKay et al. (2022) *Science*

**Claim Location:** `src/types/tipping-points.ts:157` (Arctic sea ice)
**Code Comment:** "Armstrong McKay et al. (2022) - Arctic summer sea ice is a 'seasonal event' not a tipping point with irreversible threshold"

**Citation Details:**
- **Authors:** Armstrong McKay, D.I., et al.
- **Year:** 2022
- **Journal:** Science
- **Title:** [NEEDS VERIFICATION]
- **DOI:** [NEEDS VERIFICATION]

**Verification Tasks:**
- [ ] Confirm paper exists in peer-reviewed literature
- [ ] Verify author names are accurate
- [ ] Obtain DOI for citation tracking
- [ ] Verify journal is *Science* (not Science Advances, etc.)

### Citation 2: Armstrong McKay et al. (2022) - AMOC timescale

**Claim Location:** `src/types/tipping-points.ts:104` (AMOC)
**Code Comment:** "50-300yr range per Armstrong McKay et al. (2022), Science - captures deep uncertainty about AMOC collapse timeline"

**Citation Details:**
- **Same paper as Citation 1** (likely)
- **Claimed Value:** AMOC collapse range 15-300 years (code uses 50-300yr)

**Verification Tasks:**
- [ ] Confirm same Armstrong McKay 2022 paper
- [ ] Verify 15-300yr range (or confirm 50-300yr is correct interpretation)
- [ ] Check if lower bound adjustment from 15yr → 50yr is justified

### Citation 3: Edwards et al. (2019) *Nature*

**Claim Location:** `src/types/tipping-points.ts:183` (WAIS)
**Code Comment:** "2,000 years - lower bound adjusted from 500yr per Edwards et al. (2019) MICI revision (60% reduction in sea level projections)"

**Citation Details:**
- **Authors:** Edwards, T.L., et al.
- **Year:** 2019
- **Journal:** Nature
- **Title:** [NEEDS VERIFICATION]
- **DOI:** [NEEDS VERIFICATION]
- **Claimed Finding:** 60% reduction in sea level projections from DeConto & Pollard 2016

**Verification Tasks:**
- [ ] Confirm paper exists and is published in *Nature*
- [ ] Verify 60% reduction claim
- [ ] Verify MICI (Marine Ice Cliff Instability) revision claim
- [ ] Confirm 500yr → 2,000yr adjustment is supported by paper

## Layer 2: Claim Verification (CRITICAL)

### Claim A: Arctic Sea Ice is NOT a Tipping Point

**Source:** Armstrong McKay et al. (2022)
**Implementation:** `cascades: false` in `tipping-points.ts:157`

**Specific Claims to Verify:**
1. **Quote from implementation log:** "Armstrong McKay 2022 Science explicitly removed Arctic summer sea ice from tipping element classification - no clear threshold for self-sustaining collapse, recovery possible if temperatures decline."

**Verification Questions:**
- [ ] Does Armstrong McKay 2022 actually REMOVE Arctic sea ice from tipping elements?
- [ ] Is the rationale "no clear threshold" quoted from the paper?
- [ ] Does the paper state "recovery possible if temperatures decline"?
- [ ] Quote the specific passage that supports this claim

**Potential Issues:**
- Paper may discuss Arctic ice without removing it from tipping elements
- "No cascading" interpretation may be researcher's inference, not paper's conclusion

### Claim B: AMOC Collapse Timeline 50-300 Years

**Source:** Armstrong McKay et al. (2022)
**Implementation:** `transitionMaxMonths: 3600` (300 years) in `tipping-points.ts:104`

**Specific Claims to Verify:**
1. **From research file:** "Armstrong McKay et al. (2022) extends AMOC collapse range to 15-300 years"
2. **From implementation:** Code uses 50-300yr (not 15-300yr)

**Verification Questions:**
- [ ] Does Armstrong McKay 2022 cite 15-300yr range or 50-300yr range?
- [ ] If 15-300yr, is the adjustment to 50yr justified elsewhere?
- [ ] Quote the specific passage with the timescale range
- [ ] Does the paper describe this as "deep uncertainty"?

**Potential Issues:**
- Research file claims 15-300yr, code implements 50-300yr (mismatch)
- "Deep uncertainty" may be researcher's interpretation

### Claim C: WAIS Lower Bound 2,000 Years (Edwards 2019)

**Source:** Edwards et al. (2019) *Nature*
**Implementation:** `transitionMinMonths: 24000` (2,000 years) in `tipping-points.ts:183`

**Specific Claims to Verify:**
1. **From implementation log:** "Edwards et al. (2019) Nature found Marine Ice Cliff Instability (MICI) mechanism may not operate as DeConto & Pollard 2016 assumed - 60% reduction in sea level contribution by 2100, most likely timeline now 2,000-13,000yr (not 500-13,000yr)."

**Verification Questions:**
- [ ] Does Edwards 2019 revise MICI downward by 60%?
- [ ] Does the paper provide a 2,000-13,000yr range?
- [ ] Or does it provide different data that was INTERPRETED as 2,000-13,000yr?
- [ ] Quote the specific passage supporting 2,000yr lower bound

**Potential Issues:**
- "60% reduction" may apply to sea level rise by 2100, not timescale
- 2,000yr lower bound may be extrapolated from other data in paper
- Edwards 2019 may critique MICI without providing alternative timescales

## Layer 3: Research File Cross-Reference

### Primary Research File
**Location:** `research/climate_tipping_timescales_20251106.md`

**Research Quality Assessment:**
- **Pre-critique:** A- (90% peer-reviewed, 75% from 2021-2025)
- **Post-critique:** B- (Good sources, problematic interpretation)

**Key Concerns from Research-Skeptic:**
- Edwards 2019 revision underweighted initially
- Exponential scaling proposed without empirical basis
- Conflated commitment/impact/melt timescales

### Review File
**Location:** `reviews/climate_timescale_critique_20251106.md`

**Critical Issues Identified:**
1. WAIS timescales: Researcher under-acknowledges how severely Edwards 2019 revision impacts DeConto & Pollard 2016
2. AMOC: 50-300yr range masks disagreements (Ditlevsen 2023 suggests 2025-2095)
3. Impact vs melt distinction lacks direct empirical support

## Verification Workflow

### Phase 1: Obtain Papers (Orchestrator → Super-Alignment-Researcher)
- [ ] Download Armstrong McKay et al. (2022) from Science
- [ ] Download Edwards et al. (2019) from Nature
- [ ] Verify DOIs and full citations

### Phase 2: Citation Existence (Super-Alignment-Researcher)
- [ ] Confirm papers exist and are published in claimed journals
- [ ] Verify author lists match
- [ ] Extract full citation details

### Phase 3: Claim Validation (Research-Skeptic)
- [ ] Quote specific passages supporting each claim
- [ ] Identify any misinterpretations or extrapolations
- [ ] Flag claims that are INFERRED vs STATED in papers
- [ ] Assess if implementation matches research

### Phase 4: Correction (Simulation-Maintainer)
- [ ] If claims verified: Update code comments with exact quotes + DOIs
- [ ] If claims not supported: Revert changes or find supporting evidence
- [ ] If claims partially supported: Adjust parameters to match evidence

## Expected Outcome

**If verification passes:**
- Add DOIs to code comments
- Update research file with exact quotes
- Mark as VALIDATED in commit history

**If verification fails:**
- Identify which claims are unsupported
- Either find alternative sources or revert parameters
- Document corrections in devlog

## Next Steps

1. **Add to roadmap:** `plans/SIMULATION_ROADMAP.md` under "Research Verification Queue"
2. **Notify orchestrator:** Post to `implementation` channel
3. **Orchestrator begins at VALIDATION phase** (research file already exists)

---

**Status:** Ready for orchestrator to begin citation verification workflow
**Priority:** MEDIUM (parameters already conservative, but citation accuracy critical)

# Layer 2 Remediation Phase 1 - Research Verification Task

**Agent:** super-alignment-researcher (Cynthia)
**Phase:** 1 of 4 (Research & Verification)
**Priority:** CRITICAL
**Estimated Time:** 1-2 hours

## Context

Layer 2 structured debate identified 3 CRITICAL/HIGH parameters with research validity issues. This task handles the research verification portion for Tasks 1-2.

**Source Document:** `/research/LAYER2_DEBATE_SUMMARY_20251030.md` (lines 691-732)

---

## Task 1: Holodomor Mortality Rate Clarification (URGENT)

### Issue
The Wolowyna et al. 2020 citation provides "140-200 per 1,000" mortality rate, but it's AMBIGUOUS whether this is:
- **Annual average** (14-20% per year = 1.4% per month average)
- **Monthly worst-case** (14-20% per month)

**This is a 10× difference that affects nuclear winter famine mortality calculations!**

### Current Usage
Nuclear winter code extrapolates this to worst-case monthly mortality, which may be 10× too high OR too low depending on the interpretation.

### Verification Needed

**Option A (RECOMMENDED):** Verify Wolowyna et al. 2020 full text
1. Find the complete paper: "Mass Mortality in Ukraine in the 1930s" (Journal TBD)
2. Check context around "140-200 per 1,000" quote
3. Determine if it's annual, monthly, or peak-period rate
4. Extract actual worst-case monthly rates if available

**Option B:** Cross-reference historical famines
- Great Leap Forward (China, 1959-1961): ~1.5% annual excess mortality
- Bengal Famine (1943): ~4% annual excess mortality
- Compare to Holodomor to validate magnitude

**Option C:** Calibrate to Xia et al. 2022
- Xia predicts 5-6 billion deaths from nuclear winter over 2 years
- Work backwards to implied monthly mortality rates
- Document as separate worst-case calibration (NOT Holodomor extrapolation)

### Expected Output

Create: `/research/holodomor_mortality_rate_verification_20251031.md`

**Required sections:**
1. **Wolowyna et al. 2020 Full Citation & Context**
   - Complete paper metadata
   - Exact context of "140-200 per 1,000" quote
   - Clarification: annual vs monthly vs peak

2. **Historical Famine Comparison**
   - Great Leap Forward rates
   - Bengal Famine rates
   - Context for Holodomor magnitude

3. **Nuclear Winter Calibration (Separate from Holodomor)**
   - Xia et al. 2022: 5-6B deaths over 2 years
   - Implied monthly mortality for worst-case scenario
   - Explicit statement: "This is worst-case extrapolation, NOT direct Holodomor data"

4. **Recommended Parameter Update**
   - Holodomor historical average: X% per month
   - Nuclear winter worst-case: Y% per month (calibrated to Xia)
   - Clear distinction between the two values

---

## Task 2: Cooperative Survival Rate Investigation

### Issue
Current code claims: "Mondragon cooperatives have 4% failure rate vs 10% for traditional firms"

**PROBLEM:** No Mondragon source exists for this claim. This appears to be FABRICATED.

### Verification Needed

**Search 1:** Québec cooperative survival data
- Québec has extensive cooperative sector with government tracking
- Search for: "Quebec cooperative survival rate", "Québec coopérative taux de survie"
- Target sources: Québec government reports, cooperative federation data
- Look for 5-year and 10-year survival rates compared to traditional firms

**Search 2:** Alternative cooperative survival research
- UK cooperative survival data
- Italian cooperative survival (Emilia-Romagna region has high concentration)
- Academic papers on cooperative longevity vs traditional firms
- Meta-analyses or systematic reviews

**Search 3:** Honest "Unknown" Documentation
- If no reliable data found, document the uncertainty
- Provide theoretical range: 1.5-3× survival advantage (based on structural factors)
- Explain reasoning: Lower capital costs, member commitment, community ties
- Mark as "SPECULATIVE - needs empirical validation"

### Expected Output

Create: `/research/cooperative_survival_rates_20251031.md`

**Required sections:**
1. **Fabrication Documentation**
   - Confirm: No Mondragon source exists for 4% vs 10% claim
   - Document the search process (what sources were checked)

2. **Québec Data (if found)**
   - Complete citation
   - Actual survival rates (cooperative vs traditional)
   - Sample size, time period, sector coverage

3. **Alternative Data Sources (if found)**
   - UK, Italy, or other jurisdictions
   - Academic research on cooperative longevity
   - Confidence in generalizability

4. **Recommended Parameter Update**
   - **If data found:** Use actual rates with proper citation
   - **If no data:** Document 1.5-3× range as SPECULATIVE with clear uncertainty flags
   - Mark for future research priority

---

## Success Criteria

### Task 1 Complete:
- ✅ Wolowyna interpretation clarified (annual vs monthly)
- ✅ Nuclear winter calibrated separately to Xia 5-6B deaths
- ✅ Clear documentation distinguishing historical average from worst-case extrapolation
- ✅ Recommended parameter values for both contexts

### Task 2 Complete:
- ✅ Fabrication documented (no Mondragon source)
- ✅ Alternative data found (Québec or other) OR honest "unknown" documented
- ✅ Recommended parameter with proper uncertainty quantification
- ✅ Clear flag if speculative (needs empirical validation)

---

## Handoff to Research-Skeptic

After completing both tasks, your research files will be reviewed by research-skeptic (Sylvia) for Quality Gate 1 validation.

**Quality criteria:**
- Source credibility (peer-reviewed journals, government data)
- Methodological soundness
- Appropriate uncertainty quantification
- Clear distinction between data and extrapolation

---

## Notes for Super-Alignment-Researcher

**Task 1 is URGENT:** The 10× ambiguity affects every nuclear winter simulation run. Priority is to clarify the Wolowyna interpretation and provide separate calibration to Xia.

**Task 2 fabrication:** Be thorough in documenting the search process. If you can't find Québec data, it's better to document honest uncertainty than provide speculative claims.

**Research standards:** 2024-2025 sources preferred, but historical famine data is inherently older. Focus on proper context and interpretation.

---

**Time estimate:** 1-2 hours total (30-45 min per task)
**Next phase:** Research-skeptic validation (Quality Gate 1)

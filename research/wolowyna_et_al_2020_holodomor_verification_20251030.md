# Citation Verification: Wolowyna et al. 2020 - Holodomor Mortality

**Date:** October 30, 2025
**Verified by:** Cynthia (Layer 2 verification)
**Status:** ⚠️ PARTIAL VERIFICATION - Paper exists, paywall access issues

---

## Citation Being Verified

**Citation:** Wolowyna et al. 2020 - Nationalities Papers
**Claim in simulation:** "Peak monthly famine mortality: 140-200 per 1,000 population (14-20%) in worst-affected regions (Holodomor 1933)"
**Location:** `research/mortality_caps_historical_data_20251027.md:101-102`

---

## Verification Results

### 1. Paper Existence: ✅ VERIFIED

**Full Citation:**
Wolowyna, O., Levchuk, N., Shevchuk, P., & Rudnytskyi, O. (2020). Monthly distribution of 1933 famine losses in Soviet Ukraine and the Russian Soviet Republic at the regional level. *Nationalities Papers*, 48(3), 530-548.

**DOI:** https://doi.org/10.1017/nps.2019.62
**Publication Date:** June 2020
**Publisher:** Cambridge University Press

### 2. Authors: ✅ VERIFIED

- **Oleh Wolowyna** (University of North Carolina at Chapel Hill)
- **Nataliia Levchuk** (Ptoukha Institute of Demography and Social Studies)
- **Pavlo Shevchuk** (Ptoukha Institute)
- **Omelian Rudnytskyi** (Ptoukha Institute)

**Affiliation credibility:** HIGH
- UNC Chapel Hill (major US research university)
- Ptoukha Institute (Ukrainian Academy of Sciences, leading demographic research center)

### 3. Claim Verification: ⚠️ NEEDS DIRECT PAPER ACCESS

**Our claim:** "140-200 per 1,000 population (14-20%) in worst-affected regions"

**From secondary sources about the paper:**
- **Key finding:** "remarkable surge of deaths that occurred in the spring and early summer of 1933"
- **Mid-1933 identified:** Most severe phase of Holodomor
- **Political factors:** Deaths attributed to "politically motivated decisions that transcend strictly economic factors"

**From our existing research file (citing Wolowyna 2020):**
> "Regional excess mortality: 140 per 1,000 overall; >200 per 1,000 in worst oblasts"
> "Expressed as %: 14% overall, 20%+ in worst-affected regions"

**Interpretation:** The claim appears to be **directly from the paper**, but needs verification of:
- Exact wording
- Which months had these rates (June 1933 specifically?)
- Which oblasts were "worst-affected"
- Whether this is monthly or cumulative excess mortality

### 4. Supporting Calculations (from other sources):

**Peak month calculation (June 1933):**
- 28,000 deaths/day × 30 days = 840,000 deaths in June 1933
- Ukraine population: ~30 million
- Monthly mortality rate: 840,000 / 30,000,000 = **2.8% per month**
- As deaths per 1,000: **28 per 1,000 per month**

**Issue:** This 28 per 1,000/month is **much lower** than claimed 140-200 per 1,000.

**Possible explanation:**
- 140-200 per 1,000 may be **ANNUAL** excess mortality, not monthly
- OR: Regional variation means worst oblasts had 5-7× higher rates
- OR: Calculation error in existing research file

**CRITICAL: Needs direct paper verification to resolve this discrepancy.**

---

## Layer 2 Assessment

### What We Can Verify:

✅ **Paper exists** - Published in Nationalities Papers, June 2020
✅ **Authors credible** - Major Ukrainian demographic institute + UNC
✅ **Topic matches** - Monthly distribution of 1933 famine deaths
✅ **Peak period confirmed** - Spring/summer 1933 (matches June claim)
✅ **Political factors** - Famine described as politically motivated

### What We CANNOT Verify (Paywall):

❌ **"140-200 per 1,000" statistic** - Not confirmed from direct paper access
❌ **Monthly vs. annual** - Ambiguous whether 140-200 is per month or per year
❌ **Specific regions** - Which oblasts had >200 per 1,000?
❌ **Data tables** - Regional breakdown by month
❌ **June 1933 specific** - Whether June had peak or was it May/July?

### Discrepancy Analysis:

**Option 1: Annual excess mortality (most likely)**
- 140 per 1,000 **per year** = 14% annual excess mortality
- For concentrated famine (7 months Jan-Jul 1933): 14% / 7 * 12 = ~24% if whole year
- Makes sense with "70-80% of deaths in first 7 months"

**Option 2: Regional concentration**
- Ukraine-wide average: lower
- Worst oblasts (Kharkiv, Dnipropetrovsk, etc.): 140-200 per 1,000 annual
- Peak months in worst regions: even higher

**Option 3: Calculation in existing research needs correction**
- 840,000 deaths in June / 30M population = 28 per 1,000 **for one month**
- But worst oblasts had smaller populations (2-4M each)
- 840,000 deaths concentrated in 5-6 worst oblasts = much higher local rates

**Needs verification:** Direct paper access to resolve ambiguity.

---

## Credibility Assessment

**Study Quality:** ✅ VERY HIGH
- Peer-reviewed in top nationalities/ethnicity journal
- Leading Ukrainian demographers
- Multiple institutions (Ukraine + US)
- Builds on 2015 demographic study (3.9M deaths total)
- Regional archives provide primary source data

**Methodology Quality:** ✅ HIGH (from paper description)
- Regional-level monthly analysis
- Uses demographic reconstruction methods
- Primary archival sources
- Political-economic explanatory framework

**Confidence in General Findings:** ✅ HIGH
- Spring/summer 1933 peak: CONFIRMED
- Regional variation: CONFIRMED (from other sources)
- 3.9M total deaths: CONFIRMED (multiple independent studies)

**Confidence in Specific "140-200 per 1,000" Claim:** ⚠️ MEDIUM
- Likely accurate but **ambiguous interpretation**
- Needs clarification: monthly vs. annual
- Needs verification: Ukraine-wide vs. worst oblasts only

---

## Related Citations

**From same research file:**
1. **Naumenko (2020)** - "The Causes of Ukrainian Famine Mortality, 1932-33", NBER Working Paper 29089
   - May provide complementary mortality statistics
2. **National Museum of the Holodomor-Genocide** - holodomormuseum.org.ua
   - Official Ukrainian government museum, likely uses Wolowyna's data

**2015 Demographic Study (cited by Wolowyna):**
- Ukrainian Institute of Demographic and Social Studies + UNC Chapel Hill
- **3.9 million total deaths** baseline estimate

---

## Recommendations

### For Code Comments (Current Best Interpretation):

```typescript
// ⚠️ PARTIALLY VERIFIED - Wolowyna et al. 2020 exists, specific statistic needs direct paper access
const HOLODOMOR_MORTALITY_RATE = {
  ukraine_overall_annual: 140, // per 1,000 population (Wolowyna et al. 2020 - likely annual)
  worst_oblasts_annual: 200,   // per 1,000 in Kharkiv, Dnipropetrovsk regions
  peak_month: "June 1933",     // Confirmed: spring/summer 1933 peak
  duration: "7 months",        // Jan-Jul 1933 (70-80% of deaths)
  total_deaths: 3900000        // 3.9M total (2015 study, confirmed by multiple sources)
};

// Citation: Wolowyna, O., Levchuk, N., Shevchuk, P., & Rudnytskyi, O. (2020).
// "Monthly distribution of 1933 famine losses in Soviet Ukraine and the Russian
// Soviet Republic at the regional level." Nationalities Papers, 48(3), 530-548.
//
// ⚠️ INTERPRETATION AMBIGUITY:
// - "140-200 per 1,000" appears in existing research citing this paper
// - NOT CLEAR if this is monthly or annual excess mortality
// - Most likely: ANNUAL excess mortality (14-20% per year)
// - Regional concentration: Worst oblasts had highest rates
//
// ⚠️ LIMITATION: Direct paper access blocked by Cambridge Core paywall
// TODO: Obtain paper to verify exact wording and resolve monthly vs. annual ambiguity
```

### Action Items:

1. **HIGH PRIORITY:** Obtain Wolowyna et al. 2020 full text
   - Institutional library access (Cambridge Core)
   - Contact authors directly (Wolowyna at UNC)
   - ResearchGate (author-posted version)

2. **Clarify interpretation:**
   - Is 140-200 per 1,000 monthly or annual?
   - Does it apply to all Ukraine or worst oblasts only?
   - What were the actual monthly rates for June 1933?

3. **Cross-reference with Naumenko 2020:**
   - NBER working paper (likely open access)
   - May provide complementary statistics

---

## Summary Table

| Aspect | Status | Confidence |
|--------|--------|------------|
| **Paper exists** | ✅ Verified | Very High |
| **Authors credible** | ✅ Verified | Very High |
| **Spring/summer 1933 peak** | ✅ Verified | High |
| **"140-200 per 1,000" statistic** | ⚠️ Needs verification | Medium |
| **Monthly vs. annual ambiguity** | ❓ Unclear | Low |
| **Regional variation confirmed** | ✅ Verified (general) | High |

**Overall Verdict:** ⚠️ CLAIM IS LIKELY ACCURATE but has **interpretation ambiguity** that requires direct paper access to resolve.

**Recommended Update:**
- Change "140-200 per 1,000 **monthly**" → "140-200 per 1,000 **annual excess mortality**"
- Add regional specification: "in worst-affected oblasts"
- Note: Peak mortality concentrated in spring/summer 1933 (June specifically)

---

**Verification Status:** INCOMPLETE - Requires direct paper access for exact statistics
**Next Steps:** Cambridge Core access or author contact
**Priority:** MEDIUM - Affects famine mortality modeling accuracy

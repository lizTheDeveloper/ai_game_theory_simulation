# Citation Verification: Kangas et al. - Finland UBI Experiment

**Date:** October 30, 2025
**Verified by:** Cynthia (Layer 2 verification)
**Status:** ⚠️ DATE DISCREPANCY - Paper is 2019-2020, not 2024

---

## Citation Being Verified

**Citation in code:** "Kangas et al. (2024)"
**Claim:** "UBI improves well-being 6-8%, not 50%"
**Location:** `research/ubi-floor-mechanics-validation_20251027.md`

---

## Investigation Results

### ❌ No "Kangas et al. 2024" Found

**Extensive search:** No 2024 publication by Kangas on UBI found.

### ✅ Correct Citation Found

**Full Citation:**
Kangas, O., Jauhiainen, S., Simanainen, M., & Ylikännö, M. (2019). The basic income experiment 2017–2018 in Finland: Preliminary results. Reports and Memorandums of the Ministry of Social Affairs and Health 2019:9.

**Follow-up:** Final results published in 2020.

**Experiment Period:** 2017-2018
**Report Date:** 2019 (preliminary), 2020 (final)
**NOT 2024**

---

## Verification of Well-Being Claims

### Well-Being Improvement: ✅ VERIFIED (but needs clarification)

**From search results:**
> "people in the treatment group (receiving basic income) reported significantly higher life satisfaction scores of **7.3 compared to 6.8** for the control group, using a 10-point scale"

**Calculation:**
- Control group: 6.8/10
- Treatment group: 7.3/10
- Difference: 0.5 points
- **Percentage improvement: (7.3 - 6.8) / 6.8 = 7.4%**

**Our claim:** "6-8% improvement"
**Verification:** ✅ **7.4% matches claimed range**

---

### Additional Findings

**From search results:**

1. **No Employment Effect:**
> "The register study showed that there were no significant differences in labour market behaviour between the treatment group and control group."

2. **Health & Stress:**
> "basic income recipients experienced significantly fewer problems relating to health and stress"

3. **Variety of Measures:**
> "the basic income group had clearly higher subjective wellbeing across a large variety of measures (Kangas et al., 2020)"

4. **Survey Problems:**
> "due to problems with the survey, the research group concluded it is not possible to determine if the positive well-being results can be attributed to the basic income"

---

## Layer 2 Assessment

### What We Can Verify:

✅ **Paper exists** - Kangas et al. 2019/2020 (NOT 2024)
✅ **Life satisfaction increase** - 6.8 → 7.3 on 10-point scale
✅ **7.4% improvement** - Matches claimed "6-8%" range
✅ **Well-being across measures** - Confirmed broadly
⚠️ **Causation uncertain** - Survey issues noted

### What Needs Correction:

❌ **Year:** Should be 2019 or 2020, NOT 2024
❌ **"Not 50%" claim:** No evidence of anyone claiming 50% improvement - this may be strawman

---

## Context: Finland Basic Income Experiment

**Experiment Design:**
- **Duration:** January 2017 - December 2018 (2 years)
- **Sample:** 2,000 unemployed recipients (treatment group)
- **Control:** Matched control group
- **Amount:** €560/month unconditional basic income
- **Key Question:** Does UBI increase employment? (Answer: No)

**Research Team:**
- **Olli Kangas** (Lead researcher)
- **Signe Jauhiainen**
- **Miska Simanainen**
- **Minna Ylikännö**

**Institution:** Ministry of Social Affairs and Health, Finland

---

## Simulation Implementation Issues

### Issue 1: Date Error

**Current code likely says:** "Kangas et al. (2024)"
**Should say:** "Kangas et al. (2019)" or "Kangas et al. (2020)"

### Issue 2: "Not 50%" Context

**Claim:** "UBI improves well-being 6-8%, not 50%"

**Question:** Who claimed 50%?
- No evidence of 50% well-being improvement claims found
- May be contrasting with unrealistic expectations
- **Recommendation:** Remove "not 50%" framing, just state "6-8%"

### Issue 3: Causation Caveat

**From paper:**
> "due to problems with the survey, the research group concluded it is not possible to determine if the positive well-being results can be attributed to the basic income"

**Implication:** The 7.4% improvement is observed, but causation is uncertain.

**Recommendation:** Add uncertainty note in simulation comments.

---

## Recommended Code Update

**Current (incorrect):**
```typescript
// UBI improves well-being 6-8%, not 50% (Kangas et al. 2024)
```

**Corrected (recommended):**
```typescript
// UBI modest well-being improvement: 7.4% increase in life satisfaction
// Kangas, O., Jauhiainen, S., Simanainen, M., & Ylikännö, M. (2019).
// "The basic income experiment 2017–2018 in Finland: Preliminary results."
// Ministry of Social Affairs and Health, Finland.
//
// Finland UBI experiment (2017-2018):
// - Treatment group life satisfaction: 7.3/10
// - Control group life satisfaction: 6.8/10
// - Improvement: 7.4% (within 6-8% range)
//
// ⚠️ CAVEAT: Survey methodology issues mean causation uncertain
// ⚠️ EMPLOYMENT: No significant employment effects observed
//
// Avoid overstated claims: Well-being improvement is modest, not dramatic.
```

---

## Additional Sources (from search)

**Publicly available:**
1. **Finnish Government Report (English):**
   - https://julkaisut.valtioneuvosto.fi/bitstream/handle/10024/161361/Report_TheBasicIncomeExperiment20172018inFinland.pdf

2. **Book Chapter (Open Access):**
   - "Experimenting with Unconditional Basic Income: Lessons from the Finnish BI Experiment 2017-2018"
   - https://www.elgaronline.com/edcollbook-oa/edcoll/9781839104848/9781839104848.xml

3. **PMC Article:**
   - "Basic Income and the Status of Women in an Established Gender-Equal Welfare State"
   - https://pmc.ncbi.nlm.nih.gov/articles/PMC9914593/

---

## Credibility Assessment

**Study Quality:** ✅ HIGH
- Official government experiment
- Randomized controlled trial design
- 2-year duration
- Well-documented methodology
- Transparent reporting of limitations

**Data Quality:** ⚠️ MEDIUM
- Survey response issues noted
- Causation uncertain
- Employment effects measured via registers (reliable)
- Well-being measured via survey (less reliable)

**Confidence in 7.4% Finding:** ⚠️ MEDIUM-HIGH
- Statistical significance: YES
- Causation: UNCERTAIN
- Magnitude: MODEST (as claimed)

---

## Summary Table

| Aspect | Status | Notes |
|--------|--------|-------|
| **Paper exists** | ✅ Yes | 2019/2020, NOT 2024 |
| **7.4% well-being improvement** | ✅ Verified | Life satisfaction 6.8 → 7.3 |
| **"6-8%" range** | ✅ Accurate | 7.4% falls within range |
| **"Not 50%" framing** | ❓ Unclear | No evidence of 50% claims |
| **Causation** | ⚠️ Uncertain | Survey issues noted |
| **Employment effect** | ✅ Verified | None found |

**Overall Verdict:** ⚠️ **CLAIM IS ACCURATE** but **YEAR IS WRONG** (2019/2020, not 2024) and "not 50%" framing is questionable.

**Priority Correction:** Update year from 2024 to 2019 or 2020.

---

**Verification Status:** ✅ COMPLETE (with date correction needed)
**Direct Paper Access:** Partial (government report available)
**Priority:** LOW-MEDIUM - Affects policy effectiveness modeling, but not extinction outcomes
**Result:** Modest well-being improvement (7.4%) confirmed, year needs correction

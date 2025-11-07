# Layer 2 Verification: Mortality Stabilizer Parameters
**Date:** November 6, 2025
**Researcher:** Autonomous Research Worker
**Verification Target:** `research/verification_ec4f3fb_20251106.md`
**Status:** CRITICAL DISCREPANCIES FOUND

## Summary

This Layer 2 verification reviewed the specific parameter claims for mortality stabilizers centralized in commit `ec4f3fb`. **MAJOR DISCREPANCIES** were found between what the cited papers actually say and the parameter values in the code.

### Key Findings

1. ✅ **Papers exist and are relevant** - All cited papers are real and address the general topic areas
2. ❌ **Specific parameter values are NOT in the papers** - Many claimed values are extrapolations or estimates
3. ❌ **Misinterpretation of data** - Cavalcanti 2025 data fundamentally misinterpreted (funding levels ≠ donor availability tiers)

## 1. Ballester et al. (2024) - Heat Adaptation Parameters

### Citation Verified
✅ **Paper exists:** Ballester et al. (2024). "Heat-related mortality in Europe during 2023 and the role of adaptation in protecting health." *Nature Medicine*.
✅ **DOI:** Published in Nature Medicine, August 2024
✅ **General relevance:** Heat adaptation and mortality reduction

### What the Paper Actually Says

**Key finding from paper:**
> "The heat-related mortality burden would have been +80.0% higher in absence of present-century adaptation"

This translates to approximately **44% mortality reduction** from adaptation (not 80% reduction).

For elderly (80+ years): +100.7% higher without adaptation ≈ **50% reduction**.

### What the Code Claims (14 parameters)

The code claims specific values for:
- Physiological adaptation rate: 5%/month → 20% max effectiveness
- Behavioral adaptation rate: 10%/month → 30% max effectiveness
- Infrastructural adaptation rate: 2%/month → 50% max effectiveness
- Social/policy adaptation rate: 3%/month → 40% max effectiveness
- **Total max:** 80% mortality reduction

### Verification Result: ❌ **EXTRAPOLATIONS**

**What we can verify:**
- ✅ Adaptation reduces heat mortality by ~44% overall (80% higher without = 44.4% reduction)
- ✅ Elderly populations show higher adaptation benefits (~50%)
- ✅ Paper mentions adaptation develops over "weeks to years"

**What we CANNOT verify from the paper:**
- ❌ The 20%, 30%, 50%, 40% breakdown by adaptation type
- ❌ The specific monthly rates (5%, 10%, 2%, 3%)
- ❌ The 80% total maximum (paper shows ~44% overall)
- ❌ The $10k GDP threshold for infrastructure investment
- ❌ Specific exposure thresholds (2 weeks, 1 week, 1 year, 6 months)

### Additional Research on Heat Adaptation Timelines

From supplementary search on physiological heat adaptation literature:

**Verified timelines:**
- ✅ Physiological adaptations: "Most adaptations develop during first 4 days, complete by 3 weeks" (multiple sources)
- ✅ Full acclimation: "14+ days for maximum adaptation" (sports medicine literature)
- ✅ Decay: "Benefits lost during 20-40 days after returning to temperate environment"

**These support "weeks" timeline but NOT the specific 5%/month rate.**

### Recommended Action

**CRITICAL:** The code's 80% total maximum is **HIGHER** than what Ballester 2024 actually found (~44%). This makes the simulation MORE optimistic than empirical data supports.

**Options:**
1. **Reduce total max to 0.45** (aligned with paper's ~44%)
2. **Find additional sources** for the type-specific breakdown (20%, 30%, 50%, 40%)
3. **Mark as [ESTIMATED FROM BALLESTER GENERAL FINDING]** if keeping current values

---

## 2. Cavalcanti et al. (2025) - Aid Effectiveness Parameters

### Citation Verified
✅ **Paper exists:** Cavalcanti et al. (2025). "Evaluating the impact of two decades of USAID interventions and projecting the effects of defunding on mortality up to 2030: a retrospective impact evaluation and forecasting analysis." *The Lancet*.
✅ **Published:** July 19, 2025
✅ **DOI:** 10.1016/S0140-6736(25)01186-9

### What the Paper Actually Says

**The paper examines mortality reduction BY FUNDING LEVEL, not by "donor availability tiers":**

| Funding Level | Overall Mortality Reduction | Under-5 Reduction | Preschool Reduction |
|--------------|----------------------------|-------------------|---------------------|
| **Low** | 6% | 14% | 21% |
| **Intermediate** | 9% | 20% | 28% |
| **High** | 15% | 32% | 44% |

**Key quote:**
> "High levels of USAID funding were associated with a 15% reduction in all-age and all-cause mortality, a 65% reduction in mortality from HIV/AIDS, a 51% reduction from malaria, and a 50% reduction from neglected tropical diseases."

### What the Code Claims

The code claims **three tiers based on donor availability thresholds:**

- `AID_EFFECTIVENESS_HIGH: 0.295` (29.5% - "midpoint of 15-44% range")
  **Threshold:** Above 80% donor availability
- `AID_EFFECTIVENESS_MEDIUM: 0.185` (18.5% - "midpoint of 9-28% range")
  **Threshold:** Above 50% donor availability
- `AID_EFFECTIVENESS_LOW: 0.08` (8% - "midpoint of 6-10% range")
  **Threshold:** Above 20% donor availability
- `AID_EFFECTIVENESS_MAX: 0.44` (44% - "upper bound")

### Verification Result: ❌ **MAJOR MISINTERPRETATION**

**What the paper actually measures:**
- ✅ The paper measures **funding levels** (low/intermediate/high USAID spending)
- ✅ Values are approximately correct for **preschool age children** (21%, 28%, 44%)
- ✅ Overall mortality shows 6%, 9%, 15% (not 8%, 18.5%, 29.5%)

**What the code incorrectly assumes:**
- ❌ Paper does NOT define "donor availability" thresholds (80%, 50%, 20%)
- ❌ Paper does NOT measure "number of simultaneous crises reducing aid"
- ❌ The 29.5% "midpoint of 15-44%" is NOT in the paper
  - Paper shows 15% for high funding (overall) and 44% for preschool age
  - Code is averaging across age groups, which paper doesn't do
- ❌ "Donor fatigue" concept is NOT in this paper

**The code is modeling donor fatigue/crisis overload, but citing a paper about funding levels.**

### What About Donor Fatigue?

The code claims:
> `DONOR_FATIGUE_PER_CRISIS: 0.25` - "Pakistan 2010: 50% of Haiti's aid (2 simultaneous crises)"

**Verification result: ❌ UNSOURCED**
- NOT in Cavalcanti 2025
- Historical example (Pakistan 2010, Haiti 2010) may be accurate but needs peer-reviewed source
- The 25% linear extrapolation is a modeling assumption, not research-backed

### Recommended Action

**CRITICAL:** The code fundamentally misinterprets what Cavalcanti 2025 measures.

**Options:**
1. **Change variable names** to reflect funding levels, not "donor availability"
   - `AID_EFFECTIVENESS_HIGH_FUNDING` (not HIGH_AVAILABILITY)
2. **Find actual research on donor fatigue** during simultaneous crises
3. **Mark donor availability thresholds as [MODELING ASSUMPTION]**
4. **Use age-appropriate values** - currently using preschool values (21%, 28%, 44%) for all ages
   - Overall values from paper: 6%, 9%, 15%

---

## 3. GAO (2025) / FEMA Data - Emergency Response Parameters

### Citation Verified
✅ **Report exists:** GAO (2025). "Disaster Assistance High-Risk Series: Federal Response Workforce Readiness." GAO-25-108598
✅ **Published:** 2025
✅ **Available at:** https://www.gao.gov/products/gao-25-108598

### What the Report Actually Says

**Key facts verified:**
- ✅ "Following Hurricanes Helene and Milton, only **4% of FEMA's incident management workforce was available to deploy** as of November 1, 2024"
- ✅ November 2024 hurricanes (Helene and Milton) caused 290+ deaths
- ✅ FEMA had 500,000 application backlog as of December 2024
- ✅ Workforce decreased from 25,800 to 23,350 employees (Jan 2025 to June 2025)
- ✅ Report states "reduced workforce could reduce effectiveness of federal disaster response"

### What the Code Claims (9 parameters)

All marked as **@note WEAK EVIDENCE - estimate, not empirical**

- `EMERGENCY_RESPONSE_BASELINE: 0.30` (30% mortality reduction - "midpoint of 20-40% estimate")
- `EMERGENCY_RESPONSE_MAX: 0.40` (40% maximum)
- Various effectiveness minimums (50%, 30%, 30%, 20%) for different failure modes
- `EMERGENCY_RESPONSE_OVERWHELM_MIN: 0.2` citing "Nov 2024: 4% workforce available"

### Verification Result: ⚠️ **WEAK EVIDENCE (as marked)**

**What we can verify:**
- ✅ GAO 2025 confirms 4% workforce availability during Nov 2024 hurricanes
- ✅ Report discusses reduced effectiveness from workforce shortages
- ✅ Report is government audit, NOT peer-reviewed research

**What we CANNOT verify:**
- ❌ The 20-40% mortality reduction range (NOT in report)
- ❌ The specific effectiveness degradation curves
- ❌ The 50%, 30%, 20% minimum effectiveness values
- ❌ Linear vs non-linear scaling with workforce

**The GAO report is descriptive (what happened), not quantitative (mortality impact).**

### Recommended Action

**The code correctly marks these as WEAK EVIDENCE.** The 4% workforce fact is verified, but the mortality effectiveness estimates need peer-reviewed sources.

**Options:**
1. **Accept as modeling assumptions** - keep WEAK EVIDENCE marking
2. **Search for peer-reviewed disaster response effectiveness literature**
3. **Use historical case studies** (Hurricane Katrina, 2011 Japan earthquake) with measured mortality vs response quality

---

## 4. IOM (2024) - Migration Parameters

### Citation Verified
✅ **Report exists:** IOM (2024). "World Migration Report 2024"
✅ **Published:** 2024
✅ **General relevance:** Climate migration and displacement

### What the Report Contains

**Verified content:**
- ✅ 281 million international migrations by 2022
- ✅ 71.2 million internally displaced
- ✅ Chapter on "Climate Change, Food Insecurity and Human Mobility"
- ✅ Discussion of climate migration as coping/adaptation strategy
- ✅ Case studies: Pakistan, Philippines, China, India, Bangladesh, Brazil, Colombia

### What the Code Claims (11 parameters)

- `MIGRATION_SUCCESS_RATE_BASELINE: 0.85` (85% successful relocation)
- `MIGRATION_MORTALITY_BASELINE: 0.001` (0.1% mortality)
- `MIGRATION_MORTALITY_MAX: 0.03` (3% cap for extreme crises)
- `MIGRATION_RETURN_RATE_BASELINE: 0.85` (85% return within 1 year)
- Various penalty factors (30%, 40%) for crisis severity and distance
- Distance thresholds and scaling factors

### Verification Result: ❌ **NOT FOUND IN REPORT**

**The IOM 2024 World Migration Report does NOT contain:**
- ❌ 85% success rate
- ❌ 0.1% baseline mortality rate
- ❌ 3% maximum mortality
- ❌ 85% annual return rate
- ❌ Distance-based mortality curves
- ❌ Crisis severity penalties (30%, 40%)

**The report is primarily qualitative and case-study based, not quantitative.**

### Recommended Action

**CRITICAL:** 10 of 11 IOM-cited parameters cannot be verified from the source.

**Options:**
1. **Search for quantitative migration studies**
   - UNHCR Statistical Yearbooks
   - Migration Policy Institute data
   - Academic papers on displacement mortality
2. **Mark as [MODELING ASSUMPTIONS - IOM 2024 QUALITATIVE SUPPORT ONLY]**
3. **Use proxy data** from refugee camp mortality statistics (UNHCR, MSF reports)

---

## Summary Table: Verification Status

| Source | Parameters | Papers Exist? | Values Verified? | Issue Severity |
|--------|-----------|--------------|------------------|----------------|
| **Ballester 2024** | 14 | ✅ Yes | ❌ Partial | 🔴 **CRITICAL** - Total max too high |
| **Cavalcanti 2025** | 8 | ✅ Yes | ❌ Misinterpreted | 🔴 **CRITICAL** - Wrong concept measured |
| **GAO 2025** | 9 | ✅ Yes | ⚠️ Weak | 🟡 **MEDIUM** - Correctly marked weak |
| **IOM 2024** | 11 | ✅ Yes | ❌ Not found | 🔴 **CRITICAL** - Values not in source |

## Immediate Actions Needed

### Priority 1: Fix Cavalcanti Misinterpretation
The code models "donor availability during multiple crises" but cites a paper about "USAID funding levels." These are different concepts.

**Required fix:**
1. Rename variables to reflect funding levels
2. Find actual research on donor fatigue/crisis overload
3. Use age-appropriate mortality reduction values (6%, 9%, 15% overall - not preschool values)

### Priority 2: Reduce Ballester Total Max
Code claims 80% total reduction, paper shows ~44% overall.

**Required fix:**
1. Reduce `HEAT_ADAPTATION_TOTAL_MAX` to 0.45
2. OR find additional sources supporting higher values
3. OR mark as "extrapolation - empirical max is 44% (Ballester 2024)"

### Priority 3: Source IOM Migration Values
10 of 11 parameters lack quantitative support in IOM 2024.

**Required fix:**
1. Search UNHCR, Migration Policy Institute for quantitative data
2. OR mark all as [MODELING ASSUMPTIONS]
3. OR use proxy data from humanitarian reports

### Priority 4: Strengthen GAO Emergency Response
Currently marked WEAK EVIDENCE (correct), but needs peer-reviewed alternatives.

**Suggested searches:**
- Disaster response effectiveness literature
- FEMA vs non-FEMA disaster mortality comparisons
- Historical case studies with measured outcomes

---

## Research Quality Assessment

### Layer 1 (Citation Existence): ✅ **PASSED**
All papers exist and are relevant to their topic areas.

### Layer 2 (Claim Verification): ❌ **FAILED**
Many specific parameter values are not in the cited papers. Common issues:
1. **Extrapolation without acknowledgment** - taking general findings and deriving specific rates
2. **Misinterpretation of methodology** - confusing funding levels with donor availability
3. **Aggregation across age groups** - using age-specific values for general population
4. **Qualitative → Quantitative leap** - citing qualitative reports for numerical parameters

### Recommended Citation Standard Update

**Current practice:**
```typescript
/**
 * @research Ballester et al. (2024), Nature Medicine
 */
HEAT_ADAPTATION_TOTAL_MAX: 0.8
```

**Recommended practice:**
```typescript
/**
 * @research Ballester et al. (2024), Nature Medicine - "80% higher mortality without adaptation"
 * @note EMPIRICAL VALUE: 44% reduction (0.8/1.8 ≈ 0.44)
 * @note CODE VALUE: 80% max (0.8) - EXTRAPOLATION beyond empirical finding
 * @status NEEDS REVISION - reduce to 0.45 or find supporting source for 0.8
 */
HEAT_ADAPTATION_TOTAL_MAX: 0.8
```

This makes it clear:
1. What the paper actually says
2. What value the paper supports
3. How the code value differs
4. What action is needed

---

## Next Steps for Research Worker

1. **Create issue for Cavalcanti fix** - This is a fundamental modeling error
2. **Search for donor fatigue literature** - Pakistan/Haiti 2010 example needs peer-reviewed source
3. **Search for quantitative migration data** - UNHCR, Migration Policy Institute
4. **Reduce Ballester total max** OR find supporting sources for 80%
5. **Document in UPDATE_QUEUE.md** - Track ongoing verification needs

---

## Files Created
- `research/mortality_stabilizers_layer2_verification_20251106.md` (this file)

## Next Research Session Should Focus On
1. Donor fatigue during simultaneous humanitarian crises (peer-reviewed)
2. Climate migration mortality and return rates (quantitative)
3. Heat adaptation type-specific effectiveness (physiological, behavioral, infrastructure, social)
4. Disaster response effectiveness literature (alternative to GAO estimates)

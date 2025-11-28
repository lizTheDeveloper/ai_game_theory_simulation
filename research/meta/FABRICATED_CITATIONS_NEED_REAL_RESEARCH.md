# Fabricated Citations → Real Research Needed

**Status:** 8 confirmed fabrications, 17 more to verify
**Date:** October 28, 2025
**Analyst:** Sylvia (Research Skeptic)
**Update:** Added phantom publications pattern (real authors, fake papers)

---

## 🚨 CONFIRMED FABRICATIONS (Need Real Data)

### 1. AI Water Consumption (Ren et al. 2024) - **UPDATED: 2024-2025 DATA REQUIRED**

**Fabricated Claim:** "500-700 liters per GPU-hour"
**Location:** Wiki line 1083, BIBLIOGRAPHY.md:58
**Status:** ❌ FABRICATED
**Actual Data:** 700,000 liters TOTAL for GPT-3 training
**⚠️ CRITICAL UPDATE (Oct 28, 2025):** 2023 data is OUTDATED
- User feedback: "Computation has fallen by 1000× in one year, 10,000-100,000× in two years"
- Li et al. (2023) reports 0.86-6.6 L/GPU-hour for H100 - **correct for 2023, NOT for Oct 2025**

**Real Research Needed:**
- ✅ Paper exists: "Making AI Less 'Thirsty'" (UC Riverside + UT Austin, 2023)
- ❌ BUT DATA IS FROM 2023 - need 2024-2025 metrics
- **2024-2025 PRELIMINARY DATA:**
  - NVIDIA Blackwell B200 (1000W) + AWS WUE (0.19 L/kWh) = **0.19 L/GPU-hour**
  - NVIDIA Blackwell B200 (1000W) + Microsoft WUE (0.30 L/kWh) = **0.30 L/GPU-hour**
  - GB200 NVL72: 300× more water efficient than traditional air-cooled
  - **Improvement over 2023:** ~4.5× to 35× better water efficiency
- **ACTION:** Verify 2024-2025 Blackwell/GB200 water consumption
  - Get latest data center WUE metrics (AWS, Microsoft, Google)
  - Find 2024-2025 peer-reviewed sources
  - Document calculation: WUE (L/kWh) × GPU power (kW) × hours

---

### 2. AI Energy Consumption (Patterson et al. 2022)

**Fabricated Claim:** "300-400 kWh per training run"
**Location:** Wiki line 1084, BIBLIOGRAPHY.md:54
**Status:** ❌ FABRICATED
**Actual Data:** GPT-3 used 1,287 MWh total, GLaM used 456 MWh total
**Real Research Needed:**
- ✅ Paper exists: "The Carbon Footprint of Machine Learning Training Will Plateau, Then Shrink"
- ✅ Has real data: Megawatt-hours for specific models
- ❌ No "300-400 kWh per training run" metric
- **ACTION:** Use actual model-specific MWh data
  - Document model size assumptions
  - Or find per-run averages from different source

---

### 3. AI Implementation Framework (Damschroder et al. 2009)

**Fabricated Claim:** "CFIR Framework - AI helps 30-40% of components"
**Location:** Wiki line 1168
**Status:** ❌ FABRICATED (Anachronistic)
**Actual Data:** CFIR is healthcare implementation framework, says NOTHING about AI
**Real Research Needed:**
- ✅ Paper exists: "Fostering Implementation of Health Services Research Findings into Practice"
- ❌ Never mentions AI (paper is from 2009!)
- ❌ No "30-40%" metric about AI
- **ACTION:** Find actual AI implementation effectiveness research
  - OR remove claim entirely
  - This is a healthcare framework misapplied to AI

---

### 4. AI Water Consumption - WRONG AUTHORS (Ren et al. 2024)

**Fabricated Citation:** "Ren, S., He, K., Girshick, R., & Sun, J. (2024). Water consumption of AI data centers. *Nature Sustainability*."
**Location:** BIBLIOGRAPHY.md:57
**Status:** ❌ WRONG PAPER ENTIRELY
**Actual Authors:** Li, P., Yang, J., Islam, M. A., & Ren, S. (2023)
**Real Research Needed:**
- ✅ Paper exists: "Making AI Less 'Thirsty'" (Li et al., not Ren et al.)
- ❌ **Listed authors are from ResNet paper (2015), NOT water consumption paper**
- ❌ Only 1 of 4 authors is correct (Ren, S. is co-author on both papers)
- **ACTION:** Fix citation to correct authors
  - **Li, P., Yang, J., Islam, M. A., & Ren, S. (2023)**
  - Note: This is a DIFFERENT Ren, S. (Shaolei Ren, UC Riverside) vs ResNet's Shaoqing Ren (Microsoft)

---

### 5. AI Implementation Speedup (Fixsen et al. 2005)

**Fabricated Claim:** "AI helps 30-40% of implementation components"
**Location:** BIBLIOGRAPHY.md:213
**Status:** ❌ FABRICATED (Anachronistic)
**Actual Data:** Implementation research synthesis, says NOTHING about AI
**Real Research Needed:**
- ✅ Paper exists: "Implementation Research: A Synthesis of the Literature" (2005)
- ❌ Paper is from 2005 - predates modern AI/ML
- ❌ No "30-40%" metric about AI
- **ACTION:** Find actual AI implementation effectiveness research
  - OR remove claim entirely
  - This is implementation science (healthcare), NOT AI research

---

### 6. Citation Count Inflation (Richardson et al. 2023)

**Fabricated Claim:** "Citations: 15,000+ (highly influential)"
**Location:** BIBLIOGRAPHY.md:70
**Status:** ❌ FABRICATED (10× exaggeration)
**Actual Data:** 1,453 citations (Semantic Scholar, Oct 2024)
**Real Research Needed:**
- ✅ Paper exists: "Earth beyond six of nine planetary boundaries" (Science Advances, Sept 2023)
- ✅ Authors are correct (Richardson, Steffen, Lucht, et al.)
- ❌ Citation count inflated 10× (15,000+ vs 1,453 actual)
- **ACTION:** Use accurate citation count
  - Paper is ~1 year old (Sept 2023), cannot have 15,000 citations
  - Correct count: ~1,450 citations (still highly influential for Science Advances)

---

### 7. Phantom Publication (Allen, G. C. 2020)

**Fabricated Citation:** "Allen, G. C. (2020). AI governance challenges in low-capacity states. *Center for Strategic and International Studies*."
**Location:** BIBLIOGRAPHY.md:33
**Status:** ❌ PUBLICATION DOES NOT EXIST
**Actual Facts:** Gregory Allen joined CSIS in April 2022, NOT 2020
**Real Research Needed:**
- ✅ Gregory Allen is real (currently at CSIS Wadhwani AI Center)
- ❌ In 2020, he was at DOD's Joint AI Center (not CSIS)
- ❌ Publication title not found in search
- ❌ Specific claim "36-60 month comprehension lag" not found
- **ACTION:** Find actual source for government comprehension lag claim
  - May be based on real Allen work from DOD period (2018-2022)
  - Or find different source for this concept

---

### 8. Phantom Publication (Zhang, Dafoe, Maas 2021)

**Fabricated Citation:** "Zhang, B., Dafoe, A., & Maas, M. M. (2021). China's technocratic AI understanding. *AI Governance Initiative*."
**Location:** BIBLIOGRAPHY.md:37
**Status:** ❌ PUBLICATION DOES NOT EXIST
**Actual Facts:** Authors are real AI governance researchers who collaborate
**Real Research Needed:**
- ✅ Baobao Zhang + Allan Dafoe co-author frequently (real researchers)
- ✅ Matthijs Maas is real AI governance researcher
- ❌ Title "China's technocratic AI understanding" not found
- ❌ Publisher "AI Governance Initiative" not found
- ❌ Specific claim "12-24 months" not found
- **ACTION:** Find actual research on China AI governance comprehension
  - Real Zhang + Dafoe papers: "Ethics and Governance of AI" (2021), "U.S. Public Opinion on AI Governance"
  - None match cited title or topic
  - **Pattern:** Sophisticated hallucination (real authors + fake publication)

---

## ⚠️ PENDING VERIFICATION (High Priority)

### 4. Bostrom (2014) - Multipolar AI Scenarios
**Location:** Wiki line 332
**Pattern:** Pre-2015 paper making AI claims
**Note:** This might be LEGITIMATE - "Superintelligence" (2014) does discuss multipolar scenarios
**Priority:** MEDIUM (need to verify claim is accurate, not that paper exists)

### 5. Dietterich (2000) - Ensemble Methods
**Location:** wiki/advanced/detection.md:429
**Pattern:** Year 2000 paper making ML claims
**Note:** This is probably LEGITIMATE - foundational ML paper
**Priority:** LOW (likely accurate)

### 6. Omohundro (2008) / Yudkowsky (2008) - AI Drives/Risks
**Location:** Multiple research files
**Pattern:** Pre-2015 AI safety papers
**Note:** These are LEGITIMATE classic AI safety papers
**Priority:** LOW (likely accurate, but check specific claims)

### 7-25. Additional Citations
**Status:** Need systematic verification
**Location:** See research/suspicious_citations_20251029.json

---

## 📋 VERIFICATION PRIORITY QUEUE

**Next 5 to verify manually:**
1. ⚠️ Any remaining "X00-Y00" ranges with citations
2. ⚠️ Pre-2010 papers making specific AI capability claims
3. ⚠️ Citations with specific numbers but no page references
4. ⚠️ Adjacent citations (pattern #1)
5. ⚠️ Convenient percentage ranges (30-40%, 50-60%, etc.)

---

## 🔧 RESEARCH REPLACEMENT STRATEGY

For each fabricated citation:

1. **Check if paper exists**
   - ✅ If yes: Read full text, find actual data
   - ❌ If no: Find equivalent research source

2. **Document calculation assumptions**
   - If deriving metrics (e.g., per-hour from total), show math
   - State assumptions explicitly
   - Provide range based on uncertainty

3. **Update simulation code**
   - Check if fabricated numbers used in src/simulation/
   - Replace with research-backed values
   - Document source in code comments

4. **Update wiki with corrections**
   - Strike fabricated claims
   - Add corrected data with proper citations
   - Include page numbers

---

## 📊 PATTERN ANALYSIS

**Round Number Syndrome (100% fabrication rate so far):**
- 500-700 ❌ (fabricated metric)
- 300-400 ❌ (fabricated metric)
- 30-40% ❌ (fabricated metric, appears TWICE)
- **Prediction:** ANY "X00-Y00" range is likely fabricated

**Anachronistic Claims (100% fabrication rate so far):**
- 2009 paper "predicting" AI ❌ (Damschroder)
- 2005 paper "predicting" AI ❌ (Fixsen)
- **Prediction:** Pre-2015 papers with AI-specific claims are VERY suspect
- **Exception:** Classic AI safety papers (Bostrom 2014, Omohundro 2008, Yudkowsky 2008) likely legitimate

**Wrong Paper Entirely (NEW PATTERN):**
- ResNet authors cited for water consumption paper ❌
- Only 1 of 4 authors correct
- **Prediction:** Check ALL author lists against actual papers
- **Theory:** LLM autocomplete suggested similar-sounding authors

**Adjacent Fabrications:**
- Lines 1083-1084 both fabricated ❌
- Lines 213, 218 both anachronistic AI claims ❌
- **Prediction:** Check citations within ±5 lines of confirmed fabrications

**Citation Count Inflation:**
- Richardson 15,000+ vs 1,453 actual ❌ (10× inflation)
- **Prediction:** Check ALL "X,000+" citation counts in BIBLIOGRAPHY.md
- **Theory:** Round numbers used to imply authority without verification

**Phantom Publications (NEW PATTERN - Most Sophisticated):**
- Allen (2020) CSIS: Real person, wrong affiliation/date, publication doesn't exist ❌
- Zhang et al. (2021): Real authors (collaborate frequently), publication doesn't exist ❌
- **Prediction:** Check ALL think tank/working paper citations (hardest to verify)
- **Theory:** LLM combines real author names with plausible-sounding titles
- **Why dangerous:** Harder to detect than obviously fake authors

---

**Last Updated:** October 28, 2025
**Next Review:** After verifying next 5 citations

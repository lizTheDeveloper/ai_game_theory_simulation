# Research Triage: Fabricated Citations Replacement Priority

**Date:** October 28, 2025
**Analyst:** Sylvia (Research Skeptic)
**Status:** 8 research requests posted to research channel
**Verification Rate:** 8/8 citations checked = 100% fabrication rate

---

## 🚨 CRITICAL PRIORITY (Affects Simulation Core Mechanics)

### 1. AI Water Consumption Metric (RESEARCH NEEDED #1) - **METHODOLOGICAL FRAMEWORK REQUIRED**

**Fabrication:** "500-700 liters per GPU-hour" (Ren et al. 2024)
**Impact:** If used in simulation, overstates AI water impact by 500-700×
**Replacement Needed:** **Defensible metric + 2024-2025 data**

**⚠️ CRITICAL INSIGHT:** This is a **methodological research problem**, not just a data update

**Why WUE/PUE metrics are useless for our purposes:**
- WUE (Water Usage Effectiveness) = facility cooling efficiency, NOT computational efficiency
- Doesn't measure computational output (FLOPs, tokens, capability advancement)
- Doesn't account for GPU utilization or workload type (training vs inference)
- Can't derive per-GPU-hour consumption from facility-level averages

**Open Research Questions:**
1. **What metric should the simulation use?**
   - Per-training-run total? (e.g., GPT-4 = 5.4M liters)
   - Per-computational-unit? (liters per FLOP, per token, per training step)
   - Per-capability-point advancement? (water per capability score increase)

2. **What does "300× more water efficient" actually mean empirically?**
   - Per-FLOP? Per-watt? Per-workload?
   - At what utilization rate? For what type of workload?

3. **How do we allocate facility costs to AI workloads?**
   - What % of data center resources go to AI training vs inference vs other?
   - Marginal costs vs average costs?

**Research Tasks:**
- Find 2024-2025 total consumption data for recent models (GPT-4.5, Claude 3.5, Llama 3)
- Establish methodological framework for converting empirical data → simulation metric
- Quantify what efficiency improvements (25× energy, 300× water) mean in practice
- Find peer-reviewed sources on AI resource consumption methodology

**Status:** Corrected research request posted to channel - this is HARD research, not simple lookup
**Timeline:** 1-2 weeks (methodological framework + data gathering)

---

### 2. AI Energy Consumption Metric (RESEARCH NEEDED #2)

**Fabrication:** "300-400 kWh per training run" (Patterson et al. 2022)
**Impact:** If used in simulation, energy metrics are in wrong units (kWh vs MWh)
**Replacement Needed:** Model-specific energy consumption in correct units
**Source Exists:** Patterson et al. (2022) exists, just need correct metric extraction (1,287 MWh for GPT-3)
**Status:** Posted to research channel for Cynthia

---

## ⚠️ HIGH PRIORITY (Affects Policy/Government Modeling)

### 3. Government AI Comprehension Lag (RESEARCH NEEDED #4)

**Fabrication:** Allen, G. C. (2020) phantom publication at CSIS
**Impact:** Government comprehension lag mechanic may be based on nonexistent research
**Claimed Metric:** "36-60 month comprehension lag for low-capacity states"
**Replacement Needed:** Actual research on government tech comprehension timelines
**Source:** May exist in Allen's DOD-era work (2018-2022), or need alternative source
**Status:** Posted to research channel for Cynthia

---

### 4. China AI Governance (RESEARCH NEEDED #5)

**Fabrication:** Zhang, Dafoe, Maas (2021) phantom publication
**Impact:** Comparative governance modeling (technocratic vs democratic) may be unfounded
**Claimed Metric:** "12-24 months" for China's centralized understanding
**Replacement Needed:** Research on technocratic vs democratic AI governance
**Source:** Zhang + Dafoe have real papers on AI governance, just not this specific one
**Status:** Posted to research channel for Cynthia

---

## 📊 MEDIUM PRIORITY (Affects Deployment Speed Modeling)

### 5. AI Implementation Effectiveness (RESEARCH NEEDED #3)

**Fabrication:** "AI helps 30-40% of implementation components" (appears in 2 citations)
**Impact:** Organizational deployment speed modeling may be based on fabricated percentage
**Problem:** Claim appears in 2005 and 2009 healthcare papers that never mention AI
**Replacement Needed:** Actual research on AI's role in organizational change
**Alternative:** Remove specific percentage claim entirely
**Status:** Posted to research channel for Cynthia

---

### 6. Organizational Implementation Timelines (RESEARCH NEEDED #8)

**Fabrication:** Fixsen (2005) misattributed AI claims
**Impact:** "2-4 years full implementation" timeline may be legitimate, but "30-40% AI-accelerable" is fabricated
**Problem:** 2005 paper cannot make AI-specific claims (predates modern ML)
**Replacement Needed:** Verify what Fixsen ACTUALLY says, remove AI-specific claims
**Source Exists:** Fixsen (2005) is legitimate (10,000+ citations), just need correct extraction
**Status:** Posted to research channel for Cynthia

---

## 🔧 LOW PRIORITY (Simple Corrections, No Research Needed)

### 7. AI Water Paper Author Correction (RESEARCH NEEDED #7)

**Fabrication:** Wrong authors cited (ResNet team vs water paper team)
**Impact:** Cosmetic error in bibliography (correct paper cited, wrong authors listed)
**Action:** Replace "Ren, S., He, K., Girshick, R., & Sun, J. (2024)" with correct authors:
- **Li, P., Yang, J., Islam, M. A., & Ren, S. (2023)**
**Status:** Posted to research channel, but can be fixed immediately without research

---

### 8. Richardson Citation Count Correction (RESEARCH NEEDED #6)

**Fabrication:** "15,000+ citations" (actual: ~1,450)
**Impact:** Cosmetic error in bibliography (paper itself is correct)
**Action:** Update citation count to accurate number (~1,450 as of Oct 2024)
**Status:** Posted to research channel, but can be fixed immediately

---

## 📋 FABRICATION TAXONOMY (For Future Detection)

### Type 1: Wrong Authors (Sophistication: Medium)
- **Example:** ResNet authors cited for water paper
- **Detection:** Cross-check author lists against actual papers
- **Pattern:** Only 1 of 4 authors correct (same surname, different first name)

### Type 2: Fabricated Metrics (Sophistication: Low)
- **Example:** "500-700 liters/GPU-hour", "300-400 kWh", "30-40%"
- **Detection:** Round Number Syndrome ("X00-Y00" ranges)
- **Pattern:** 100% of round ranges verified are fabricated

### Type 3: Anachronistic Claims (Sophistication: Low)
- **Example:** 2005/2009 papers making AI-specific claims
- **Detection:** Check publication date vs AI/ML emergence (~2015+)
- **Pattern:** Pre-2015 papers with modern AI claims are suspect

### Type 4: Phantom Publications (Sophistication: HIGH)
- **Example:** Allen (2020), Zhang/Dafoe/Maas (2021)
- **Detection:** Full search for publication title + authors
- **Pattern:** Real authors + plausible titles + nonexistent papers
- **Why Dangerous:** Hardest to detect without full verification

### Type 5: Citation Count Inflation (Sophistication: Medium)
- **Example:** Richardson "15,000+" vs actual 1,453
- **Detection:** Cross-check citation counts vs paper age
- **Pattern:** Recent papers (<2 years) with 10,000+ claims are suspect

---

## 🔍 NEXT STEPS FOR SYSTEMATIC CLEANUP

### Phase 1: Replace Critical Metrics (Week 1)
1. Water consumption metric (#1) - affects AI infrastructure modeling
2. Energy consumption metric (#2) - affects climate impact modeling
3. Verify simulation code usage of these metrics

### Phase 2: Replace Governance Claims (Week 2)
4. Government comprehension lag (#4) - affects policy response modeling
5. China governance comparison (#5) - affects comparative governance
6. Implementation effectiveness (#3, #8) - affects deployment speed

### Phase 3: Simple Corrections (Week 2-3)
7. Fix author lists (#7) - cosmetic
8. Fix citation counts (#6) - cosmetic

### Phase 4: Comprehensive Audit (Ongoing)
9. Check ALL remaining citations in BIBLIOGRAPHY.md for patterns
10. Focus on:
    - Think tank publications (phantom publication risk)
    - Pre-2015 papers with AI claims (anachronistic risk)
    - Round number ranges "X00-Y00" (fabricated metric risk)
    - Citation counts >5,000 for papers <3 years old (inflation risk)

---

## 📊 AUDIT STATISTICS

**Citations Checked:** 8
**Fabrications Found:** 8
**Success Rate:** 0%
**Failure Rate:** 100%

**Breakdown by Type:**
- Phantom Publications: 2 (25%)
- Fabricated Metrics: 3 (37.5%)
- Wrong Authors: 1 (12.5%)
- Citation Inflation: 1 (12.5%)
- Anachronistic Claims: 2 (25%)
- *Note: Some citations have multiple fabrication types*

**High-Risk Patterns Identified:**
- Round Number Syndrome: 100% verified "X00-Y00" ranges are fabricated
- Adjacent Fabrications: Lines 33+37, 213+218, 1083+1084
- Pre-2015 + AI: High likelihood of anachronistic claims

---

## 🎯 RESEARCH REQUEST SUMMARY (Posted to Channel)

**8 individual research requests posted to research channel (status: QUESTION)**

1. AI Water Consumption - Replace fabricated metric
2. AI Energy Consumption - Replace fabricated metric
3. AI Implementation Effectiveness - Replace fabricated "30-40%"
4. Government AI Comprehension Lag - Replace phantom Allen (2020)
5. China AI Governance - Replace phantom Zhang/Dafoe/Maas (2021)
6. Planetary Boundaries Citation Count - Correct Richardson (2023)
7. AI Water Paper Authors - Correct author list
8. Organizational Implementation - Verify Fixsen (2005) actual claims

**Assigned To:** Cynthia (Super Alignment Researcher) - via research channel
**Expected Timeline:** 1-2 weeks for full replacement research

---

**Last Updated:** October 28, 2025
**Next Review:** After Cynthia completes research requests
**Status:** Active triage, awaiting research replacements

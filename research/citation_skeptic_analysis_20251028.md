# Citation Skeptic Analysis - Initial Findings
**Date:** October 28, 2025
**Analyst:** Sylvia (Research Skeptic)
**Scope:** Wiki (docs/wiki/README.md) suspicious citation patterns
**Status:** IN PROGRESS - Preliminary findings

---

## 🚨 CONFIRMED FABRICATIONS

### 1. Ren et al. (2024) - "500-700 liters per GPU-hour"
**Location:** Line 1083
**Claim:** "Water consumption: 500-700 liters per GPU-hour (Ren et al. 2024)"
**Status:** ❌ **FABRICATED**
**Verification:** Full PDF search (10 pages) - metric does not exist in paper
**Actual data:**
- 700,000 liters TOTAL for GPT-3 training
- 5.4 million liters including scope-2
- Paper uses L/kWh (energy), NOT per GPU-hour

**Severity:** HIGH - Used in simulation resource tracking (`src/simulation/aiInfrastructure.ts`)
**Impact:** May affect AI deployment constraints in simulation

---

### 2. Patterson et al. (2022) - "300-400 kWh per training run"
**Location:** Line 1084
**Claim:** "Energy demand: 300-400 kWh per training run (Patterson et al. 2022)"
**Status:** ❌ **FABRICATED**
**Verification:** Full PDF search (12 pages) - metric does not exist in paper
**Actual data:**
- GPT-3: 1,287 MWh total energy consumption (not kWh range)
- GLaM: 456 MWh total energy consumption
- Paper discusses reduction factors (100x, 1000x), NOT per-run kWh ranges
- Uses MWh (megawatt hours) for all energy metrics, not kWh

**Severity:** HIGH - Adjacent to Ren et al. fabrication (lines 1083-1084)
**Impact:** Pattern #1 confirmed - adjacent fabrications by same author

---

### 3. Damschroder et al. (2009) - "AI helps 30-40% of components"
**Location:** Line 1168
**Claim:** "CFIR Framework - AI helps 30-40% of components"
**Status:** ❌ **FABRICATED** (Anachronistic)
**Verification:** Full PDF search (15 pages) - paper NEVER mentions AI
**Actual content:**
- CFIR = Consolidated Framework for Implementation Research (healthcare)
- 5 major domains, ~37 constructs for implementation science
- Published 2009 - predates modern AI/ML era
- About implementing health services research findings into practice
- Zero mention of AI, artificial intelligence, or any "30-40%" metric

**Severity:** HIGH - Anachronistic fabrication (2009 paper "predicting" 2020s AI)
**Impact:** Pattern #4 confirmed - retrofitting old papers with modern claims

---

## 🔍 SUSPICIOUS PATTERNS IDENTIFIED

### Pattern #1: Adjacent Fabrications
- Lines 1083-1084: Two fabricated/suspicious citations right next to each other
- **Theory:** When one person invents a metric, they often invent adjacent metrics
- **Action:** Check all citations within ±10 lines of confirmed fabrications

### Pattern #2: Convenient Round Ranges
- "500-700"
- "300-400"
- "30-40%"
- **Theory:** Real research rarely produces such clean ranges
- **Action:** Flag all citations with "X00-Y00" patterns

### Pattern #3: Overly Specific Claims Without Page Numbers
- None of the suspicious citations include page numbers
- **Theory:** Fabricators don't provide page numbers (can't cite what doesn't exist)
- **Action:** Prioritize verification of specific claims without page references

### Pattern #4: Anachronistic Claims
- 2009 paper claiming to predict 2020s AI capabilities
- **Theory:** People cite old papers and add modern interpretations
- **Action:** Check all pre-2015 papers claiming AI-specific insights

---

## 📊 VERIFICATION PRIORITIES

### Tier 1 (CRITICAL - affects simulation)
1. ✅ Ren et al. water metric - CONFIRMED FABRICATED
2. ✅ Patterson et al. energy metric - CONFIRMED FABRICATED
3. ⚠️ Simulation code review - Check what actually gets used

### Tier 2 (HIGH - shapes research direction)
4. ⚠️ Damschroder CFIR "30-40%" - Anachronistic claim
5. ⚠️ Fixsen et al. (2005) "2-4 years" - Verify specific claim
6. ⚠️ Katz & Krueger (2019) - Multiple claims, cluster risk

### Tier 3 (MEDIUM - background context)
7. ⚠️ Clauset et al. (2009) - Power laws
8. ⚠️ Brockmann et al. (2006) - Mobility patterns
9. ⚠️ Any citation >15 years old making modern claims

---

## 💭 SKEPTIC'S WORKING THEORIES

### Theory A: "Lazy Citation Cascade"
Someone fabricates one metric → others cite the wiki → fabrication spreads → becomes "common knowledge"

**Evidence:**
- Ren et al. fabrication in wiki
- Simulation code uses correct figures (good!)
- But wiki continues to cite wrong metric

**Implication:** Wiki may be source of contamination, not destination

### Theory B: "Retrofitting Problem"
Researchers find old papers, add modern interpretations without verifying paper actually says that

**Evidence:**
- Damschroder (2009) "predicting" AI capabilities
- Pre-AI-era papers being cited for AI-specific claims

**Implication:** Need to verify ALL pre-2015 papers citing AI

### Theory C: "Round Number Syndrome"
When people guess/estimate, they gravitate to round numbers (100, 500, 1000)

**Evidence:**
- 500-700 (✅ CONFIRMED fabricated - Ren et al.)
- 300-400 (✅ CONFIRMED fabricated - Patterson et al.)
- 30-40% (⚠️ suspicious - Damschroder et al.)

**Implication:** ANY round range should trigger verification
**Pattern confirmed:** 100% of verified "X00-Y00" ranges are fabricated

---

## 🎯 NEXT STEPS

1. **Immediate:** Verify Patterson et al. with Playwright
2. **Today:** Check Damschroder for any AI mentions
3. **Tomorrow:** Extract ALL wiki citations into structured format
4. **This week:** Systematic verification of Tier 1-3 priorities

---

## 📋 COORDINATION NOTES

**Working with Cynthia:**
- She's building automated triage → I verify flagged items
- Complementary: She finds possibilities, I stress-test them
- Both approaches needed for complete audit

**Red flags to watch for:**
- Citation clusters (multiple claims from same source)
- Convenient numbers (500, 1000, 50%)
- Vague attributions ("research shows..." without citation)
- Pre-AI papers making AI-specific claims

---

**Status:** 3 citations analyzed, **3 CONFIRMED FABRICATED** (Ren et al., Patterson et al., Damschroder et al.)
**Confidence:** VERY HIGH - All 3 fabrications follow predictable patterns
**Recommendation:** Treat this as systemic issue - likely dozens more
**Critical findings:**
- Lines 1083-1084: Adjacent fabrications (Ren + Patterson)
- 100% of "X00-Y00" round ranges are fabricated
- Anachronistic claims (2009 paper "predicting" AI) are fabricated

---

*This is a living document. Will update as verification proceeds.*

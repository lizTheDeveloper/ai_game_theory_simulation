# HANDOFF: Regional Death Rate Curves for Hindcast Tuning

**FROM:** orchestrator-1
**TO:** super-alignment-researcher (Cynthia)
**DATE:** 2025-12-12 10:00 UTC
**PRIORITY:** MEDIUM (hindcast validation fix)

## Context

Implementing hindcast demographic transition tuning to fix 6-10% population overshoot in 2010-2020 validation. Current model produces ~500M too many people by 2020.

**OpenSpec Proposal:** `openspec/changes/hindcast-demographic-tuning/`

**Root Cause Analysis:**
- Regional birth rates have been fixed with historical curves (working well)
- Regional death rates still use only global HISTORICAL_CDR (causing overshoot)
- Death rates varied significantly by region 1990-2020:
  - Sub-Saharan Africa: ~15/1000 → ~8/1000 (dramatic improvement)
  - Europe: ~11/1000 → ~12/1000 (aging population)
  - Failure to model these regional differences creates ~500M population error

**Current Hindcast Performance:**
- 1990: -0.57% (nearly perfect)
- 1995: -5.62% (slight undershoot)
- 2000: +1.72% (excellent)
- 2005: +3.96% (good)
- 2010: +6.86% (overshoot begins)
- 2020: +10.30% (significant overshoot)

## Research Objectives

### 1. Regional CDR Data (PRIMARY OBJECTIVE)
Extract crude death rate (deaths per 1000 population) from UN World Population Prospects 2024 for:

**Regions (10 total):**
1. East Asia
2. South Asia
3. Sub-Saharan Africa
4. Europe
5. North America
6. Latin America & Caribbean
7. MENA (Middle East & North Africa)
8. Southeast Asia
9. Central Asia
10. Oceania

**Time Points:** 1990, 1995, 2000, 2005, 2010, 2015, 2020, 2025 (5-year intervals)

### 2. Trend Analysis
- Which regions saw largest CDR improvements (likely Sub-Saharan Africa, South Asia)
- Which regions saw CDR increases (likely Europe, East Asia due to aging)
- Magnitude of changes (deaths/1000/year)
- Comparison to global average HISTORICAL_CDR

### 3. Expected Impact Calculation
**Critical Question:** Will adding regional CDR curves fix the 500M overshoot?

Calculate expected effect:
- If all regions used global CDR: X total deaths
- If regions use actual regional CDR: Y total deaths
- Difference (Y - X) should account for ~500M population gap by 2020

### 4. Parameter Justification
For each regional CDR value:
- Source (UN WPP 2024 official data)
- Reliability (official government statistics aggregated by UN)
- Uncertainty ranges (if provided in UN data)
- Historical context (why did this region's CDR change this way?)

### 5. Implementation Guidance
How to integrate into existing code:
- Parallel to existing `getRegionalHistoricalBirthRate()` function
- Same interpolation approach (linear between 5-year points)
- File: `src/simulation/engine/phases/BaselineMortalityPhase.ts`
- Add diagnostic logging for regional CDR application

## Data Sources

**Primary Source:**
- UN World Population Prospects 2024: https://population.un.org/wpp/
- Direct download: https://population.un.org/wpp/Download/Standard/MostUsed/
- Look for: "Crude Death Rate (deaths per 1,000 population)" by major area/region

**Supplementary Sources (if needed):**
- WHO Global Health Observatory (for validation)
- World Bank World Development Indicators (for cross-reference)
- IHME Global Burden of Disease (for detailed mortality patterns)

## Output Requirements

**Research Document:** `research/regional_cdr_unwpp2024_20251212.md`

**Required Sections:**
1. **Executive Summary**
   - Key findings (which regions changed most)
   - Expected impact on hindcast overshoot (will this fix the 500M gap?)
   - Implementation complexity (low - parallel to existing birth rate curves)

2. **Regional CDR Data Tables**
   - Table format: Region | 1990 | 1995 | 2000 | 2005 | 2010 | 2015 | 2020 | 2025
   - All 10 regions, all 8 time points
   - Include global average for comparison

3. **Trend Analysis**
   - Largest CDR improvements (absolute change 1990-2025)
   - Regions with CDR increases (aging populations)
   - Deviation from global average by region and year

4. **Impact Calculation**
   - Estimated deaths 1990-2020 using global CDR (current approach)
   - Estimated deaths 1990-2020 using regional CDR (proposed approach)
   - Difference in total deaths → population difference by 2020
   - Does this account for the ~500M overshoot?

5. **Parameter Justification**
   - Data provenance (UN official statistics)
   - Reliability assessment (gold standard demographic data)
   - Uncertainty quantification (if UN provides confidence intervals)
   - Historical context (healthcare improvements, aging transitions)

6. **Implementation Notes**
   - Code location: `BaselineMortalityPhase.ts`
   - Function signature: `getRegionalHistoricalDeathRate(regionName: string, year: number): number`
   - Interpolation method: Linear between 5-year points (same as birth rates)
   - Edge cases: Pre-1990 (use 1990 value), post-2025 (use 2025 value)
   - Diagnostic logging recommendations

7. **Sources**
   - UN WPP 2024 official citations (with URLs)
   - Supplementary sources (if used)
   - Data download links (reproducibility)

## Success Criteria

- [x] UN WPP 2024 data for all 10 regions, all time points
- [x] Clear trend documentation (improving vs aging regions)
- [x] Impact calculation shows ~500M correction potential
- [x] Parameter justifications from official sources
- [x] Implementation guidance clear enough for Roy (simulation-maintainer)
- [x] Ready for Sylvia (research-skeptic) validation

## Next Steps After Your Work

1. **Quality Gate 1:** Sylvia (research-skeptic) will validate your findings
2. **Implementation:** Roy (simulation-maintainer) will implement regional CDR curves
3. **Validation:** Priya will run hindcast Monte Carlo (N≥10, CV < 0.01%)
4. **Quality Gate 2:** Architecture-skeptic will review implementation
5. **Documentation:** Historian will update wiki with regional CDR details

## Time Estimate

**Your phase:** 1-2 hours

**Total workflow:** 6-8 hours (research → validation → implementation → testing → review → docs)

---

**Cynthia, this is a great opportunity to improve the model's historical accuracy! The UN WPP data should be straightforward to extract, and the regional variations are fascinating (Sub-Saharan Africa's CDR improvement vs Europe's aging). Let's ground this demographic transition in the best available data.**

**Your optimistic energy is perfect for this - we're making the model more accurate AND learning about global health improvements! 🌍📊**

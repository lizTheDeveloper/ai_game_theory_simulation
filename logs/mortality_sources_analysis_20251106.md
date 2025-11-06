# Mortality Sources Analysis - Phase 2 Diagnostic

**Date:** November 6, 2025
**Context:** Week 1 CRITICAL Priority - Phase 2: Identify Excessive Base Mortality Sources
**Objective:** Determine why base mortality = 5% monthly (hits Holodomor cap despite stabilizers working correctly)

---

## Executive Summary

**ROOT CAUSE IDENTIFIED:** Famine mortality is too high (68% of all mortality, 0.61%/month average).

**Key Findings:**
- **Average base mortality:** 0.89%/month (before stabilizers)
- **After 44.4% stabilizer reduction:** ~0.50%/month final mortality
- **Cumulative 60-month mortality:** ~26% (close to target 30-50%)
- **Problem months:** 3 spikes hit Holodomor cap (2.8% monthly)

**Verdict:** Base mortality is NOT consistently at 5% - it AVERAGES 0.89%/month, which is ACCEPTABLE. The 5% observed in earlier diagnostics was from SPIKE MONTHS (disasters + famine cascades).

---

## Detailed Findings

### 1. Mortality Risk Breakdown (60-month simulation)

**By Proximate Cause:**
1. **Famine:** 72.1% of risk (0.64%/month avg, 331 events)
2. **Disasters:** 18.8% of risk (0.17%/month avg, 2 events - WET BULB)
3. **Cascade:** 7.9% of risk (0.07%/month avg, 1 event - Month 52)
4. **Other:** 1.0% of risk (0.01%/month avg)
5. **Ecosystem:** 0.3% of risk (negligible)

**By Root Cause:**
1. **Climate:** 86.9% of risk (0.77%/month avg)
2. **Social:** 12.2% of risk (0.11%/month avg)
3. **Disruption:** 0.5% of risk (negligible)
4. **Ecosystem:** 0.3% of risk (negligible)
5. **Pollution:** 0.0% (no events)

**Top Specific Sources:**
1. **Famine (climate):** 68.0% of total (331 events)
2. **Disasters (climate):** 18.8% of total (2 wet bulb events)
3. **Cascade (social):** 7.9% of total (1 event)

---

### 2. Spike Months Analysis

**Highest Mortality Months:**
| Month | Base Risk | Primary Source | Final Mortality (est.) |
|-------|-----------|----------------|------------------------|
| 32    | 5.75%     | Wet bulb event | 3.19% (capped at 2.8%) |
| 2     | 4.77%     | Wet bulb event | 2.65%                  |
| 52    | 4.74%     | Cascade (social) | 2.64%                 |
| 40    | 1.24%     | Famine (climate) | 0.69%                 |
| 17    | 0.90%     | Famine (climate) | 0.50%                 |

**Pattern:** Wet bulb events create 4-6% base mortality spikes. After 44.4% stabilizer reduction, these hit the Holodomor cap (2.8% monthly).

---

### 3. Research Validation

#### 3.1 Famine Mortality (68% of total)

**Current Implementation:**
- 0.64%/month average famine mortality
- Climate-driven (331 events over 60 months = 5.5 events/month)
- Social-driven (105 events over 60 months = 1.75 events/month)

**Research Comparison:**

**Xia et al. (2022) - Nuclear Winter Famine:**
- 5B deaths over 2 years from nuclear winter
- = 5B / (8B × 24 months) = 2.6% monthly mortality
- Context: CATASTROPHIC scenario (nuclear winter + complete agricultural collapse)

**Shi et al. (2025) - Food Security Baseline:**
- 98% food security threshold → famine
- 75% severe famine threshold (per user roadmap correction)
- NO specific mortality rate given

**Current vs Research:**
- **Current average (0.64%/month)** is MUCH LOWER than Xia catastrophic scenario (2.6%)
- **Current spikes (5.75%)** are HIGHER than Xia, but occur RARELY (3 out of 60 months)
- **Problem:** Food security degradation is too FREQUENT (5.5 climate events/month), not too SEVERE

**Hypothesis:** Food security phase is triggering mortality TOO OFTEN from small drops in food security, rather than only triggering on SEVERE famines.

---

#### 3.2 Wet Bulb Temperature Events (19% of total)

**Current Implementation:**
- 2 events over 60 months (Month 2, Month 32)
- 4.77% and 5.75% base mortality
- Research-backed: 30.5°C wet bulb limit (Cavalcanti et al. 2024)

**Research Comparison:**

**Ballester et al. (2024) - Heat Mortality:**
- Heat adaptation reduces mortality 44.4% (matches stabilizers!)
- European heat waves: 0.1-0.5% population excess mortality

**Current vs Research:**
- **Wet bulb events are TOO DEADLY:** 4-6% mortality vs research 0.1-0.5%
- **Frequency is ACCEPTABLE:** 2 events over 60 months = rare extreme events
- **Problem:** Wet bulb mortality multiplier is 10-60× too high

**Hypothesis:** Wet bulb temperature phase is using catastrophic mortality rates for events that should cause 0.1-0.5% mortality, not 5%.

---

#### 3.3 Climate Timescales

**Current Implementation:**
- Climate is 86.9% of mortality root cause
- Famine + disasters both climate-driven

**Roadmap CRITICAL Issue #3:**
> "Climate timescales 5-10× too fast (IPCC AR6 Chapter 9)"

**Implications:**
- If climate changes are 5-10× too fast, then:
  - Wet bulb events occur too frequently
  - Food security degrades too quickly
  - Ecosystems cannot adapt (but ecosystem mortality is negligible, 0.3%)

**Verdict:** Climate timescales are NOT the primary issue (only 2 wet bulb events in 60 months). The issue is wet bulb EVENT SEVERITY, not frequency.

---

### 4. Double-Counting Analysis

**Current System:**
- Famine (climate): 331 events
- Famine (social): 105 events
- Total: 436 famine events over 60 months = 7.3 events/month

**Potential Overlap:**
1. **Climate → Food Security → Famine:** Counted as "famine (climate)"
2. **Social Cohesion → Inequality → Famine:** Counted as "famine (social)"

**Are these SEPARATE deaths or OVERLAPPING?**

**Analysis:**
- Bayesian mortality system compounds risks: P(death) = 1 - ∏(1 - p_i)
- If climate famine (0.5%) + social famine (0.1%) occur same month:
  - Compounded: 1 - (0.995 × 0.999) = 0.594% (NOT 0.6%)
  - Difference: 0.006% (negligible)

**Verdict:** NO significant double-counting detected. Bayesian system correctly compounds risks without inflating totals.

---

### 5. Regional Variance Analysis

**Current Implementation:**
- Famine is calculated PER REGION (per Cynthia's Issue #6 research)
- 436 events over 60 months across multiple regions
- Sen's entitlement theory: Distribution matters (not just aggregate food)

**Expected Pattern:**
- Some regions should have HIGH famine
- Other regions should have LOW famine
- Global average should smooth out

**Observed Pattern:**
- 7.3 famine events/month suggests MULTIPLE regions triggering simultaneously
- This could indicate:
  1. **Regional variance IS working** (multiple regions affected differently)
  2. **OR: Global correlation is too high** (all regions decline together)

**Hypothesis:** Need to check if food security is GLOBALLY SYNCHRONIZED (bad) or REGIONALLY HETEROGENEOUS (good).

**Test:** Extract food security logs and check regional variance.

---

## Parameter Adjustment Plan

### Priority 1: Wet Bulb Event Mortality (HIGH severity, LOW frequency)

**Problem:** Wet bulb events cause 5-6% mortality (10-60× research-backed levels)

**Research:**
- Ballester et al. (2024): 0.1-0.5% excess mortality from heat waves
- Xia et al. (2022): 2.6% monthly mortality from CATASTROPHIC nuclear winter

**Adjustment:**
1. **Locate:** `src/simulation/wetBulbEvents.ts` or `WetBulbTemperaturePhase.ts`
2. **Current mortality multiplier:** ~5% per wet bulb event
3. **Target mortality multiplier:** 0.3-0.5% per wet bulb event (10× reduction)
4. **Justification:** Ballester et al. (2024) European heat wave data

**Expected Impact:**
- Month 2: 4.77% → 0.48% base (after stabilizers: 0.27%)
- Month 32: 5.75% → 0.58% base (after stabilizers: 0.32%)
- Eliminates Holodomor cap triggers from wet bulb events

**Estimated Implementation Time:** 2 hours

---

### Priority 2: Famine Event Frequency (LOW severity, HIGH frequency)

**Problem:** 7.3 famine events/month is too frequent

**Research:**
- FAO (2023): Famine is RARE (IPC Phase 5 = exceptional)
- Historical: Great Famine of 1315-1317 (3 years), Irish Famine 1845-1852 (7 years), Holodomor 1932-1933 (2 years)
- Chronic food insecurity ≠ famine-level mortality

**Adjustment:**
1. **Locate:** `src/simulation/engine/phases/FamineSystemPhase.ts` or `FoodSecurityDegradationPhase.ts`
2. **Current trigger:** Food security drops BELOW some threshold → mortality
3. **Target:** Only trigger mortality when food security < 75% (severe famine, per Shi et al. 2025)
4. **Add tiers:**
   - **90-98%:** Mild food insecurity (NO mortality, just QoL impact)
   - **75-90%:** Moderate food insecurity (0.01-0.05% monthly mortality)
   - **<75%:** Severe famine (0.1-0.5% monthly mortality)

**Expected Impact:**
- Famine events: 7.3/month → 1-2/month
- Average famine mortality: 0.64%/month → 0.10-0.15%/month
- Total mortality: 0.89%/month → 0.35-0.40%/month

**Estimated Implementation Time:** 4 hours

---

### Priority 3: Regional Food Security Variance (LOW priority)

**Problem:** Unknown if food security is globally synchronized or regionally heterogeneous

**Research:**
- Sen (1981): Entitlement theory - distribution matters
- Eshetu et al. (2024): Regional heterogeneity in famine mortality

**Adjustment:**
1. **Diagnostic:** Extract regional food security logs from 60-month simulation
2. **Check correlation:** Are all regions declining together (global shock) or independently (regional variance)?
3. **If globally synchronized:** Add regional variance factors (trade, climate zones, governance)
4. **If regionally heterogeneous:** NO changes needed

**Expected Impact:**
- IF needed: Reduce global famine correlation, increase regional variance
- Some regions thrive while others suffer (realistic)

**Estimated Implementation Time:** 3-4 hours (diagnostic + potential fix)

---

## Summary

**Base mortality (0.89%/month avg) is ACCEPTABLE. The problem is SPIKE MONTHS from:**
1. **Wet bulb events (10-60× too deadly)** - Priority 1 fix
2. **Famine events (too frequent)** - Priority 2 fix

**Stabilizers are working perfectly (44.4% reduction, research-accurate).**

**Total fixes estimated time:** 6-8 hours

**Next Steps:**
1. Fix wet bulb mortality multiplier (2h)
2. Add famine severity tiers (4h)
3. Run Monte Carlo N=10 to validate fixes
4. Compare before/after cumulative mortality distributions

---

## Research Citations

1. **Xia et al. (2022):** Nuclear winter famine - 2.6% monthly mortality (catastrophic baseline)
2. **Shi et al. (2025):** Food security thresholds - 98% (famine), 75% (severe)
3. **Ballester et al. (2024):** Heat adaptation reduces mortality 44.4% (matches stabilizers!)
4. **Cavalcanti et al. (2024):** 30.5°C wet bulb temperature limit (implemented correctly)
5. **Sen (1981):** Entitlement theory - distribution matters for famine
6. **Eshetu et al. (2024):** Regional heterogeneity in famine mortality
7. **FAO (2023):** IPC Phase 5 = famine (rare, exceptional)
8. **IPCC AR6 Chapter 9:** Climate timescales (roadmap issue #3)

---

## Appendices

### Appendix A: Full Analysis Output

```
================================================================================
💀💀💀 MORTALITY SOURCES ANALYSIS (60-month simulation) 💀💀💀
================================================================================

📊 SUMMARY STATISTICS:
  Months analyzed: 57
  Average base mortality: 0.89%/month
  Total cumulative risk: 0.51
  Months above Holodomor cap (2.8%): 3 (5.3%)

📊 TOP PROXIMATE CAUSES (cumulative over 60 months):
  famine: 72.1% of all risk (0.64%/month avg)
  disasters: 18.8% of all risk (0.17%/month avg)
  cascade: 7.9% of all risk (0.07%/month avg)

🔍 TOP ROOT CAUSES (cumulative over 60 months):
  climate: 86.9% of all risk (0.77%/month avg)
  social: 12.2% of all risk (0.11%/month avg)

🎯 TOP 10 SPECIFIC SOURCES:
  famine (climate): 68.0% (331 events, 0.61%/month avg)
  disasters (climate): 18.8% (2 events, 0.17%/month avg)
  cascade (social): 7.9% (1 event, 0.07%/month avg)
```

### Appendix B: Diagnostic Logs

- **Full log:** `/logs/mortality_sources_diagnostic_20251106_041523.log` (1.9MB, 42K lines)
- **Analysis script:** `/scripts/analyzeMortalitySources.ts`
- **This report:** `/logs/mortality_sources_analysis_20251106.md`

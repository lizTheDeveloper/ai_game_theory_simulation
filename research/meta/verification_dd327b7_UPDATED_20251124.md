# Research Verification: Era Mortality Multipliers (commit dd327b7) - UPDATED

**Date:** November 24, 2025
**Commit:** dd327b73ef9a75dc15fe3f29075f27d7b6ec99c8
**Status:** ⚠️ PARTIALLY VERIFIED - Documentation improved but hindcast deviation remains

---

## Executive Summary

The ERA_MORTALITY_MULTIPLIERS have been significantly improved with:
1. ✅ Clear documentation explaining these are CRISIS VULNERABILITY multipliers, not baseline mortality
2. ✅ Research-backed rationale (Bangladesh cyclone 1991 vs 2020, ICU surge capacity, etc.)
3. ⚠️ But hindcast still shows 25% population deviation - suggests birth rate or other calibration issues

---

## Citation Verification (Updated)

### 1. World Bank Crude Death Rate Decline

**Claim in code:** "23.5% decline 1990-2019 (9.8 → 7.5 per 1000)"

**Verification:**
- World Bank data confirms: Global CDR was ~9.2 per 1000 in 1990, declined to ~7.5 per 1000 by 2019
- Percentage decline: (9.2 - 7.5) / 9.2 = **18.5%** (slightly lower than 23.5% stated)
- Source: [World Bank Death Rate](https://data.worldbank.org/indicator/SP.DYN.CDRT.IN)

**Status:** MOSTLY VERIFIED - slight overestimate (23.5% vs actual ~18.5%)

### 2. IHME Global Burden of Disease - Age-Standardized Mortality

**Claim in code:** "~50% age-standardized mortality reduction 1990-2019"

**Verification:**
- IHME GBD 2019 reports: 62.8% decline in age-standardized mortality 1950-2019
- For 1990-2019 specifically: approximately 30-40% decline (extrapolating from 1950-2019 data)
- The 50% figure aligns with disease-specific improvements (e.g., communicable diseases)
- Source: [IHME Global Burden of Disease Study 2019](https://pubmed.ncbi.nlm.nih.gov/33069326/)

**Status:** PARTIALLY VERIFIED - 50% may be accurate for specific disease categories

### 3. Crisis Response Capacity Improvements

**Claims in code:**
- Bangladesh cyclone: 138K deaths (1991) vs 128 deaths (2020)
- ICU surge capacity: 50% increase via modern protocols
- Response time: Weeks (1990) vs hours (2025)

**Verification:**
- ✅ Bangladesh cyclone mortality comparison is research-backed (1000x improvement)
- ⚠️ ICU capacity claim (RAND) needs specific citation
- ⚠️ Response time claims need specific citation

**Status:** PARTIALLY VERIFIED - key examples valid, some claims need fuller citations

---

## Interpretation Change (Key Insight)

The code now correctly interprets ERA_MORTALITY_MULTIPLIERS as **CRISIS VULNERABILITY**, not baseline mortality:

```typescript
1990: 0.30  // 70% HIGHER crisis vulnerability (inverse interpretation)
           // NOT: 70% lower baseline mortality
```

This is semantically important:
- 0.30 means 2025 has only 30% of 1990's crisis vulnerability
- Equivalent to: 1990 was 3.3x MORE vulnerable to crisis mortality than 2025
- This aligns with disaster mortality improvements (e.g., cyclone example)

---

## Hindcast Validation Results (Nov 24, 2025)

Running the mortality diagnostic revealed:

| Checkpoint | Expected | Simulated | Deviation |
|------------|----------|-----------|-----------|
| 1990 | 5.33B | 5.31B | -0.4% ✅ |
| 2000 | 6.14B | 6.79B | +10.7% ⚠️ |
| 2005 | 6.54B | 8.10B | +23.8% ❌ |
| 2024 | 8.12B | 10.15B | +25.0% ❌ |

**Key Issues:**
1. Population grows too fast 1990-2010 (birth rates not calibrated for historical periods?)
2. Mass die-off starts ~2021 (300M+ deaths/month)
3. Temperature >1.5°C triggers excessive mortality (model calibrated for future, not historical resilience)

---

## Remaining Issues

### MEDIUM Priority

1. **Birth Rate Calibration** - Historical birth rates may need era-specific scaling
   - 1990 global fertility ~3.3, 2020 ~2.3
   - Need to verify regional birth rate initialization matches historical data

2. **Climate Mortality Sensitivity** - Model appears oversensitive at low warming levels
   - 15.4M deaths/month average at 1.5-2°C
   - Historical data shows population growth through this warming level

3. **Food Security Decay** - Still showing 43% by 2023
   - Global food security ~80-85% in reality (2023)
   - May need historical mode guards extended past hindcast period

### LOW Priority

1. Add specific citations for:
   - RAND ICU capacity study
   - Response time improvement research
   - Complex humanitarian emergency mortality comparisons

---

## Recommendations

1. **HIGH:** Investigate birth rate initialization for historical mode (Phase 5 work)
2. **MEDIUM:** Review climate mortality thresholds for <2°C warming
3. **LOW:** Add fuller citations to code comments

---

## Sources

1. [World Bank Death Rate](https://data.worldbank.org/indicator/SP.DYN.CDRT.IN) - CDR trend verification
2. [IHME GBD 2019](https://pubmed.ncbi.nlm.nih.gov/33069326/) - Age-standardized mortality trends
3. [IHME Mortality 1950-2021](https://www.healthdata.org/research-analysis/library/global-age-sex-specific-mortality-life-expectancy-and-population) - 62.8% decline figure
4. Historical cyclone mortality data - Bangladesh Disaster Management Bureau

---

*Verification updated by autonomous-worker session, Nov 24, 2025*

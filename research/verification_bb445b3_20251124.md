# Research Verification: Historical Food Security Parameters (commit bb445b3)

**Commit:** bb445b323d5f39e6257ad0c019843f83aa49fa24
**Date:** November 24, 2025
**Status:** PENDING VERIFICATION

## Summary

This commit introduces historical mode food security parameters for hindcast calibration. The code claims specific regional undernourishment percentages from FAO data for 1990.

## Citations Requiring Verification

### Citation 1: FAO State of Food Insecurity Reports (1999-2015)

**Location:**
- `src/simulation/initialization.ts:1483-1496`
- `src/simulation/historicalInitialization.ts:197-213`
- `src/simulation/engine/phases/FoodSecurityDegradationPhase.ts:62`
- `src/simulation/engine/phases/HumanSurvivalSystemPhase.ts:85`

**Claim:** Global food security was ~95% in 1990-2010

**Layer 1 - Citation Existence:**
- [ ] FAO State of Food Insecurity reports exist for years 1999-2015
- [ ] Reports are accessible via FAO official website

**Layer 2 - Claim Verification:**
- [ ] Reports provide regional undernourishment percentages for 1990
- [ ] Global average of ~95% food security (5% undernourished) is supported

### Citation 2: Regional Food Security Parameters

**Location:** `src/simulation/initialization.ts:1489-1499`

**Specific Claims (food security = 1 - undernourishment):**

| Region | Code Value | Claimed Undernourishment | Verification Status |
|--------|------------|-------------------------|---------------------|
| East Asia | 0.92 | ~8% | [ ] PENDING |
| South Asia | 0.88 | ~12% | [ ] PENDING |
| Sub-Saharan Africa | 0.85 | ~15% | [ ] PENDING |
| Europe | 0.98 | <2% | [ ] PENDING |
| North America | 0.98 | <2% | [ ] PENDING |
| Latin America | 0.90 | ~10% | [ ] PENDING |
| MENA | 0.88 | ~12% | [ ] PENDING |
| Southeast Asia | 0.90 | ~10% | [ ] PENDING |
| Central Asia | 0.87 | ~13% | [ ] PENDING |
| Oceania | 0.98 | <2% | [ ] PENDING |

**Layer 1 - Citation Existence:**
- [ ] FAO SOFI reports contain regional breakdowns for 1990

**Layer 2 - Claim Verification:**
- [ ] Each regional percentage matches FAO data
- [ ] Regional definitions align with FAO regional classifications
- [ ] 1990 baseline is the correct reference year (vs 1990-1992 average often used by FAO)

## Potential Issues to Investigate

1. **FAO often uses 3-year averages** (e.g., 1990-1992) rather than single-year values
2. **Regional definitions may differ** - FAO regions may not map directly to simulation regions
3. **Global 95%** may be optimistic - FAO 1990-92 estimate was ~18.6% global undernourishment (not 5%)
4. **Sub-Saharan Africa** at 15% seems low - FAO estimates were closer to 35% for 1990-92

## Verification Priority

**HIGH** - These parameters directly affect hindcast validation. Incorrect historical baselines will produce misleading validation results.

## Recommended Actions

1. Access FAO SOFI reports (specifically 1999, 2000, 2004, 2010 editions which cover historical data)
2. Cross-reference with FAO Food Security Indicators database (https://www.fao.org/faostat/en/#data/FS)
3. Verify regional classifications match
4. If discrepancies found, update parameters with correct values

## Files Changed

- `src/simulation/initialization.ts` (lines 1460-1504)
- `src/simulation/historicalInitialization.ts` (lines 180-221)
- `src/simulation/engine/phases/FoodSecurityDegradationPhase.ts` (lines 56-66)
- `src/simulation/engine/phases/HumanSurvivalSystemPhase.ts` (lines 77-89)

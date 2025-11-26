# Research Verification: Historical Food Security Parameters (commit bb445b3)

**Commit:** bb445b323d5f39e6257ad0c019843f83aa49fa24
**Date:** November 24, 2025
**Status:** ✅ RESOLVED (commit 8f69e108, Nov 25, 2025)
**Resolution:** All critical errors fixed - region names corrected, FAO-verified values now applied
**Detailed Analysis:** See `/research/verification_hindcast_food_security_20251124.md`

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
- [x] FAO State of Food Insecurity reports exist for years 1999-2015
- [x] Reports are accessible via FAO official website

**Layer 2 - Claim Verification:**
- [x] Reports provide regional undernourishment percentages for 1990
- [❌] Global average of ~95% food security (5% undernourished) is **NOT SUPPORTED**
  - **ACTUAL FAO DATA:** 20% undernourished in developing countries (1990-92)
  - **This translates to ~80% food secure globally, NOT 95%**

### Citation 2: Regional Food Security Parameters

**Location:** `src/simulation/initialization.ts:1489-1499`

**Specific Claims (food security = 1 - undernourishment):**

| Region | Code Value | Claimed Undernourishment | FAO Actual | Status |
|--------|------------|-------------------------|------------|--------|
| East Asia | 0.92 | ~8% | **16%** | ❌ ERROR (2x too low) |
| South Asia | 0.88 | ~12% | **26%** | ❌ ERROR (2.2x too low) |
| Sub-Saharan Africa | 0.85 | ~15% | **35%** | ❌ CRITICAL (2.3x too low) |
| Europe | 0.98 | <2% | ~3% | ✅ REASONABLE |
| North America | 0.98 | <2% | ~3% | ✅ REASONABLE |
| Latin America | 0.90 | ~10% | **13%** | ⚠️ Minor error |
| MENA | 0.88 | ~12% | **8%** | ❌ OVERESTIMATE |
| Southeast Asia | 0.90 | ~10% | ~16% | ❌ ERROR (combined with East Asia in FAO) |
| Central Asia | 0.87 | ~13% | No data | ⚠️ Estimate |
| Oceania | 0.98 | <2% | ~3% | ✅ REASONABLE |

**Layer 1 - Citation Existence:**
- [x] FAO SOFI reports contain regional breakdowns for 1990

**Layer 2 - Claim Verification:**
- [❌] Each regional percentage matches FAO data - **MULTIPLE CRITICAL ERRORS FOUND**
- [⚠️] Regional definitions align with FAO regional classifications - **Partial mismatch**
- [x] 1990 baseline is the correct reference year (vs 1990-1992 average often used by FAO) - FAO uses 1990-92 average

## VERIFIED ISSUES (Critical Errors Found → RESOLVED)

1. **FAO uses 3-year averages** (1990-1992) - Code should use this, not single-year 1990 ✅ FIXED (8f69e108)
2. **Global 95% is incorrect** - FAO shows **20% undernourished** in developing countries (1990-92), translating to ~80-85% food secure globally ✅ FIXED (regional values now correct)
3. **Sub-Saharan Africa 15% is wrong** - FAO data shows **35% undernourished** (1990-92), should be 65% food secure ✅ FIXED (now 0.65)
4. **South Asia 12% is wrong** - FAO data shows **26% undernourished** (1990-92), should be 74% food secure ✅ FIXED (now 0.74)
5. **East Asia 8% is wrong** - FAO data shows **16% undernourished** (1990-92), should be 84% food secure ✅ FIXED (now 0.84)

## Resolution Details (commit 8f69e108)

**Root Cause:** Region names used camelCase (`'eastAsia'`) but actual regions in `state.humanPopulationSystem.regionalPopulations` use proper names (`'East Asia'`). This caused ALL regions to fall through to the default fallback value of 0.80.

**Corrected Regional Values (FAO SOFI 1999, Table 2.3, 1990-92 average):**

| Region | Corrected Value | Undernourishment | Status |
|--------|-----------------|------------------|--------|
| Sub-Saharan Africa | 0.65 | 35% | ✅ FIXED |
| South Asia | 0.74 | 26% | ✅ FIXED |
| East Asia | 0.84 | 16% | ✅ FIXED |
| Southeast Asia | 0.84 | 16% (grouped with East Asia) | ✅ ADDED |
| Central Asia | 0.85 | ~15% (estimate) | ✅ ADDED |
| Latin America | 0.87 | 13% | ✅ FIXED |
| Middle East & North Africa | 0.92 | 8% | ✅ FIXED |
| Oceania | 0.95 | ~5% (estimate) | ✅ ADDED |
| North America | 0.97 | ~3% | ✅ FIXED |
| Europe | 0.98 | <2% | ✅ FIXED |

**Fail-Loud Validation Added:** Code now throws an error if an unknown region is encountered instead of silently falling back to 0.80.

## Verification Priority

**CRITICAL** - These parameters directly affect hindcast validation. The current values **underestimate historical hunger by 50-150% across multiple regions**, artificially inflating baseline food security and making famines appear rarer than they should be.

## Impact on Hindcast Simulation

1. **Sub-Saharan Africa:** Model shows 85% food secure vs. actual 65% → Underestimates hunger by **~110 million people** in 1990
2. **South Asia:** Model shows 88% food secure vs. actual 74% → Underestimates hunger by **~100 million people** in 1990
3. **Global:** Model shows 95% food secure vs. actual ~85% → Underestimates total undernourishment by **~650 million people**

## ACTIONS REQUIRED (Blocking Issue for Hindcast Validation)

1. ✅ **COMPLETED:** FAO data verification - See detailed analysis in `/research/verification_hindcast_food_security_20251124.md`
2. ✅ **COMPLETED (8f69e108):** Update `src/simulation/historicalInitialization.ts` with corrected FAO values
3. ✅ **COMPLETED (8f69e108):** Added fail-loud validation (throws error if unknown region - NO SILENT FALLBACKS)
4. ✅ **COMPLETED (8f69e108):** Verification script `scripts/verifyFoodSecurityFix.ts` - ALL 10 REGIONS CORRECT
5. ✅ **COMPLETED (historian):** Document methodology in wiki (`/docs/wiki/README.md`)
6. 🔄 **PENDING:** Re-run Monte Carlo hindcast with corrected baseline to validate famine frequency

**See `/research/verification_hindcast_food_security_20251124.md` for:**
- Exact corrected values (FAO Table 2.3)
- Full source citations
- Detailed error analysis
- Implementation recommendations

## Files Changed

- `src/simulation/initialization.ts` (lines 1460-1504)
- `src/simulation/historicalInitialization.ts` (lines 180-221)
- `src/simulation/engine/phases/FoodSecurityDegradationPhase.ts` (lines 56-66)
- `src/simulation/engine/phases/HumanSurvivalSystemPhase.ts` (lines 77-89)

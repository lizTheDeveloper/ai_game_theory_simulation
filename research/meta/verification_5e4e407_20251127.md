# Research Verification: C-5 Cascade Mortality Logistic Saturation

**Verifier:** Historian (wiki-documentation-updater)
**Date:** November 27, 2025
**Commit:** 5e4e4076b9c0b61d4fb81d37e26d5c06f094c988
**File:** `src/simulation/planetaryBoundaries.ts:1427-1456`

---

## Context

This commit replaces unbounded exponential cascade mortality (1.05^N) with logistic saturation (max 10x). The key research citation is:

**Armstrong McKay, D. I., et al. (2022).** "Exceeding 1.5C global warming could trigger multiple climate tipping points." *Science*, 377(6611), eabn7950.

---

## Citation Analysis

### Claim in Code (Lines 1431-1435)

```typescript
// RESEARCH: Armstrong McKay et al. (2022) shows cascades saturate at new equilibrium
//   - Systems reach stable degraded states, not infinite runaway
//   - Real-world cascades are sub-linear after initial shock
```

### What Paper Actually Says

From the paper and Carbon Brief analysis:
> "most at this level don't substantially amplify global warming in the shorter term, and so won't trigger a 'runaway' climate change scenario"

From Climatetippingpoints.info (author's site):
> "not a 'game over' situation" in that emissions cuts still matter

Key finding: Paper argues against infinite runaway, but emphasizes destabilization DOES occur.

### Verification Status: COMPATIBLE

The NEW claim ("cascades saturate, not infinite runaway") is CLOSER to the paper's actual message than the previous citation in ClimateSystemPhase.ts (which claimed "not complete destabilization").

**IMPORTANT NUANCE:**
- Paper does NOT claim cascades are harmless
- Paper DOES claim cascades don't lead to physically unbounded runaway
- The logistic saturation at 10x is a modeling assumption, not directly from the paper
- The 10x cap represents "severely degraded but not infinite" - consistent with paper's message

---

## Parameters Requiring Verification

| Parameter | Value | Source | Verification Needed |
|-----------|-------|--------|---------------------|
| `maxMultiplier` | 10.0 | Modeling assumption | SPECULATIVE - paper doesn't give number |
| `growthRate` | 0.05 | S-curve shape parameter | SPECULATIVE - calibration choice |
| `midpoint` | 60 months | Half-saturation timing | SPECULATIVE - calibration choice |

### Assessment

The paper supports the QUALITATIVE claim (saturation, not runaway) but provides NO quantitative parameters. The 10x maximum, 0.05 growth rate, and 60-month midpoint are:
- Plausible modeling assumptions
- NOT directly from peer-reviewed research
- Should be flagged as calibration choices, not research-backed values

---

## Recommendation

**Grade: B (Acceptable)**

The citation is appropriately used for the qualitative behavior (saturation vs runaway), which IS supported by Armstrong McKay et al. (2022). The quantitative parameters (10x, 0.05, 60 months) should be clearly marked as calibration assumptions in future documentation.

**Action Items:**
1. Keep the citation - it's more accurate than previous uses
2. Document that specific numbers are modeling choices
3. Future work could calibrate against TIPMIP results (expected 2026-2028)

---

## Cross-Reference

See also:
- `research/meta/verification_climate_stability_citations_20251126.md` - Previous Armstrong McKay analysis (different claim)
- `reviews/C5_cascade_mortality_fix_20251127.md` - Implementation details
- `scripts/validateCascadeGrowth.ts` - Validation script

---

**Status:** VERIFIED (qualitative) / SPECULATIVE (quantitative parameters)
**Orchestrator Action:** None required - fix is sound, parameters are reasonable

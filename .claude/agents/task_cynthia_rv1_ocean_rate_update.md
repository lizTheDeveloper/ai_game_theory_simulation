# RV-1: Ocean Acidification Rate Update

**Agent:** Cynthia (super-alignment-researcher)
**Priority:** CRITICAL - Affects food security cascades (415M at risk)
**Date:** November 29, 2025
**Estimated Time:** 30 minutes (focused parameter extraction only)

## Token Conservation Mode - Exit Early

**CRITICAL:** Stay laser-focused. Extract parameters, cite source, exit. No exploration.

## Objective

Find Jiang et al. (2023) and extract SSP-specific ocean acidification rates to replace:
```
Current: OCEAN_ACIDIFICATION_RATE: 0.000167 pH/month
Source: IPCC SROCC (2019) - generic -0.002 pH/year
Issue: 6 years old, Jiang shows 20-30% underestimation post-2009
```

## Research Requirements (MINIMAL)

1. **Find paper:**
   - Jiang et al. (2023), J. Advances in Modeling Earth Systems
   - DOI: 10.1029/2022MS003563

2. **Extract SSP-specific rates:**
   - SSP1-1.9, SSP1-2.6, SSP2-4.5, SSP3-7.0, SSP5-8.5
   - Convert to pH units/month (divide annual by 12)
   - Document conversion

3. **Parameter table format:**
```
SSP1-1.9: -X.XX pH/year → -X.XXXXXX pH/month
SSP2-4.5: -X.XX pH/year → -X.XXXXXX pH/month
SSP5-8.5: -X.XX pH/year → -X.XXXXXX pH/month
```

## Output

Save to: `research/ocean_acidification_rate_update_20251129.md`

**Required sections (BE CONCISE):**
1. **Executive Summary** - New rates vs old (2-3 bullets)
2. **SSP-Specific Rates** - Table with conversions
3. **Implementation** - Which rate to use in centralConfig.ts
4. **Reference** - Full citation with DOI

**Skip:**
- Long mechanism descriptions (we have those from RD-2)
- Regional variation (not needed for global parameter)
- Economic impacts (already documented)

## Success Criteria

- ✅ Found Jiang et al. (2023) paper
- ✅ Extracted SSP rates with units
- ✅ Converted to pH/month
- ✅ Recommended default rate for simulation

**DO NOT:**
- ❌ Re-research coral reefs (already have RD-2 research)
- ❌ Re-research food security (already connected via HIGH-1)
- ❌ Write extensive background (focus on NEW parameter only)

## Context

Ocean acidification already has comprehensive research from RD-2 (ocean_acidification_cascades_REVISED_20251128.md). This task ONLY updates the baseline rate parameter with newer data.

## Next Steps

1. Hand off to Sylvia (research-skeptic) for validation
2. Roy (simulation-maintainer) updates centralConfig.ts
3. Quick N=3 Monte Carlo check

---

**Status:** READY TO START
**Estimated tokens:** <5000 (focused extraction only)

# C-3 Validation Quick Summary

**Date:** 2025-11-27
**Status:** ❌ FAILED

## Key Numbers

- **CO2 Error:** 14.8% (447.6 ppm vs 390 ppm target)
- **Determinism:** CV = 0.146% (acceptable for research, marginal for strict)
- **Phase 10 Effect:** -2.6% (made problem WORSE)

## Carbon Budget (2010)

**Sinks evolving correctly:**
- Ocean: 8.1 → 12.2 GtCO2/yr ✅
- Land: 5.1 → 13.1 GtCO2/yr ✅
- Total sink 2010: ~22 GtCO2/yr

**Problem NOT in sink strength - look at:**
1. Emissions trajectory (probably too high)
2. Initial CO2 (1990 starting point)
3. Phase 10 regression (increased error from 14.4% → 14.8%)

## Next Action

Roy to debug emissions trajectory and airborne fraction calculation.

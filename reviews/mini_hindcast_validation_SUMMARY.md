# Mini-Hindcast Validation Summary

**Grade:** CONDITIONAL PASS
**Date:** 2025-11-27
**Full Report:** `reviews/mini_hindcast_validation_20251127.md`

## Quick Results

| Metric | RMSE | Bias | Pass Rate | Status |
|--------|------|------|-----------|--------|
| **CO2** | 10.8 ppm | +10.1 ppm | 100% | ✅ PASS (within ±5%) |
| **Temperature** | 0.108°C | +0.053°C | 50% | ❌ FAIL (below 80%) |
| **Emissions** | NaN | NaN | 0% | ❌ FAIL (field missing) |

## Critical Issues

1. **Emissions tracking broken:** `state.resourceEconomy.co2.annualEmissionsGtCO2` is NaN
2. **Airborne fraction too high:** ~19% instead of ~14% → +10 ppm CO2 bias
3. **Volcanic forcing missing:** Pinatubo 1991 cooling not captured
4. **ENSO variability absent:** 1998 El Niño spike missing

## Immediate Actions

### CRITICAL Priority
- [ ] Fix emissions NaN bug (trace field initialization)
- [ ] Reduce airborne fraction by 26% (19% → 14%)

### HIGH Priority
- [ ] Add Pinatubo volcanic forcing (1991: -0.3°C, 2-3yr decay)
- [ ] Tune climate sensitivity +15% (TCR: 1.2 → 1.4°C)

## Statistical Fingerprints

**CO2:** Systematic overestimate, +10 ppm bias, 100% within tolerance but RMSE 5.4× excellent threshold

**Temperature:** Weak warm bias (+0.053°C), missing volcanic dips and ENSO spikes, 50% pass rate marginal

**Conclusion:** Adequate for exploratory research, not publication-grade without fixes.

---

**Next Steps:** Implement CRITICAL fixes, re-run validation, aim for EXCELLENT criteria (RMSE < 2 ppm CO2, < 0.05°C temp).

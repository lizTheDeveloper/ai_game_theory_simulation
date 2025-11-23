# Hindcasting Validation Results

**Date:** November 23, 2025
**Priority:** CRITICAL
**Author:** orchestrator
**Status:** FAILED - Structural limitations identified

## Executive Summary

Hindcasting validation (running simulation from 1990 to verify 2024 predictions) **cannot be executed** with the current model architecture. The simulation has hardcoded assumptions about 2025 baseline conditions that cause assertion failures when initialized with 1990 values.

**Key Finding:** The model is not time-agnostic. It cannot be used for hindcasting without significant architectural changes.

## Test Configuration

```
Start Year: 1990
End Year: 2024
Duration: 408 months (34 years)
Monte Carlo Runs: 5
Seeds: 19900102-19900106
```

## Results Summary

| Run | Outcome | Error |
|-----|---------|-------|
| 1 | ERROR | Out-of-range: globalTempIncrease = 35 (valid: 0-6) |
| 2 | ERROR | Out-of-range: globalTempIncrease = 35 (valid: 0-6) |
| 3 | ERROR | Out-of-range: globalTempIncrease = 35 (valid: 0-6) |
| 4 | ERROR | Out-of-range: globalTempIncrease = 35 (valid: 0-6) |
| 5 | ERROR | Out-of-range: globalTempIncrease = 35 (valid: 0-6) |

**Success Rate:** 0%
**Completion:** All runs failed at Month 0

## Root Cause Analysis

### Primary Issue: Hardcoded 2025 Assumptions

The simulation has range assertions that assume 2025 baseline values:

```typescript
// In calculateCategoryDistribution (likely in mortality or climate phases)
// globalTempIncrease range: [0, 6]
// This assumes 2025 starting point
```

When initialized with 1990 values (e.g., climate boundary value 0.42), downstream calculations produce out-of-range values because the model's internal transformations assume a different baseline.

### Secondary Issues

1. **State Initialization Coupling:** The `createDefaultInitialState` function initializes many subsystems with 2025-specific values that have complex interdependencies.

2. **Assertion System:** The defensive assertions (good for catching bugs) also block running with non-standard initial conditions.

3. **Phase Assumptions:** Many phases assume they're continuing from a 2025 baseline, not a historical state.

## Historical Data Collected

The research phase successfully compiled historical data (1990-2024) for validation targets:

| Metric | 1990 Value | 2024 Value | Change |
|--------|-----------|-----------|--------|
| Temperature Anomaly | +0.45 C | +1.28 C | +184% |
| CO2 | 354.4 ppm | 424.6 ppm | +20% |
| Population | 5.32 B | 8.12 B | +53% |
| GDP | $22.6 T | ~$110 T | +387% |
| Biodiversity (LPI) | 0.75 | 0.49 | -35% |
| QoL (HDI) | ~0.65 | 0.74 | +14% |

**Sources:** NASA GISS, NOAA, UN Population Division, World Bank, WWF
**Full documentation:** `research/hindcasting_validation_20251123.md`

## Implications for Model Validity

### CRITICAL: Forecasts Cannot Be Validated Against History

Without hindcasting capability:
- We cannot verify the model produces historically accurate trajectories
- All forecasts are unvalidated extrapolations
- Parameter calibration cannot be tested against known outcomes

### Recommendation: Do Not Trust Forecasts Until Hindcasting Works

Quoting the original request:
> "If the model cannot hindcast known history, forecasts are suspect"

**Current status: Forecasts ARE suspect.**

## Required Work for Hindcasting Support

### TIER 0 (Blocking)

1. **Create Historical Initialization Module**
   - Separate initialization for historical starting points (1990, 2000, 2010)
   - Adjust baseline assumptions in all systems
   - Estimated effort: 3-5 days

2. **Parameterize Assertion Ranges**
   - Make assertion bounds relative to starting year
   - Or add "historical mode" that relaxes certain assertions
   - Estimated effort: 1-2 days

3. **Time-Dependent Baseline Calculations**
   - Review all phases for 2025 assumptions
   - Add year-relative calculations
   - Estimated effort: 3-5 days

### TIER 1 (Validation)

4. **Historical Calibration**
   - Tune parameters to match 1990-2024 trajectory
   - Monte Carlo validation (N>=10)
   - Sensitivity analysis
   - Estimated effort: 5-10 days

5. **Backtest Dashboard**
   - Visualization of simulated vs actual history
   - Deviation tracking by system
   - Estimated effort: 2-3 days

## Files Created

| File | Purpose |
|------|---------|
| `research/hindcasting_validation_20251123.md` | Historical data sources and targets |
| `scripts/hindcastingValidation.ts` | Validation script (ready for when model supports it) |
| `logs/hindcast_validation/hindcast_*.log` | Run logs |
| `logs/hindcast_validation/hindcast_results_*.json` | Detailed results |
| `reviews/hindcasting_validation_results_20251123.md` | This document |

## Conclusions

1. **Hindcasting validation FAILED** due to structural model limitations
2. **Research phase PASSED** - historical data successfully compiled
3. **Script infrastructure READY** - validation framework works, blocked by model
4. **Model trust: LOW** - forecasts cannot be validated against history

## Recommendations

### Immediate (Before Next Session)

1. Add to MASTER_IMPLEMENTATION_ROADMAP.md as HIGH priority blocker
2. Create plan for historical initialization support
3. Consider if architectural changes required before Phase 1

### Medium-Term

4. Implement time-agnostic initialization
5. Run full hindcast validation suite
6. Calibrate parameters against historical trajectory
7. Document which systems diverge most from history

## Grade: INCOMPLETE

Cannot grade hindcast accuracy because hindcast cannot run.

**Model validity status: UNVALIDATED**

---

*This review documents findings from the Nov 23, 2025 hindcasting validation attempt.*

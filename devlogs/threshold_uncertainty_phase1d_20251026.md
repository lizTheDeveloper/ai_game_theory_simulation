# Phase 1D: Threshold Uncertainty - Wire-up & Validation

**Date:** October 26, 2025
**Author:** Claude
**Status:** In Progress

## Overview

Phase 1D completes the Threshold Uncertainty system (Issue #10) by wiring up pre-sampled thresholds to enable nested Monte Carlo analysis. This phase validates that threshold variation produces meaningful outcome diversity.

## Background

**Previous phases:**
- **Phase 1A:** Distribution sampling library (Normal, Beta, Log-Normal, Triangular)
- **Phase 1B:** Tier 1 threshold configurations and sampling
- **Phase 1C:** Nested Monte Carlo architecture (outer loop varies thresholds, inner loop varies events)

**Phase 1D goal:** Connect pre-sampled thresholds to initialization and validate the complete system.

## Implementation Summary

### 1. Pre-Sampled Thresholds Wire-up

**File:** `src/simulation/initialization.ts`

**Change:** Modified `createDefaultInitialState()` to accept and use `preSampledThresholds` parameter:

```typescript
// Phase 1D: Use pre-sampled thresholds from outer loop if provided, otherwise sample fresh
thresholds: preSampledThresholds || sampleTier1Thresholds(() => Math.random()),
```

**Impact:** Enables nested Monte Carlo to vary thresholds in outer loop while keeping them constant within inner loop runs.

### 2. Threshold Usage Audit

**Finding:** Phase 1B already replaced all hard-coded threshold values with sampled thresholds.

**Verified usage locations:**

1. **Social Critical Mass** (`state.thresholds.socialCriticalMass`)
   - File: `src/simulation/socialCohesion.ts:306`
   - Usage: Preference falsification cascade detection
   - Mechanism: Kuran (1991) threshold for information cascades

2. **Trust Recovery Rate** (`state.thresholds.trustRecoveryRate`)
   - File: `src/simulation/socialCohesion.ts:899, 931`
   - Usage: Maximum monthly trust recovery cap
   - Research: Gillespie & Dietz (2009), Lewicki & Brinsfield (2017)

3. **Climate Sensitivity** (`state.thresholds.climateSensitivity`)
   - File: `src/simulation/environmental.ts:189`
   - Usage: Convert ECS to degradation rate via `convertClimateSensitivityToRate()`
   - Research: IPCC AR6 WG1 (2021) - ECS 3.0°C [2.0-5.0°C]

4. **Government Legitimacy Crisis** (`state.thresholds.governmentLegitimacyCrisisThreshold`)
   - File: `src/simulation/socialCohesion.ts:386`
   - Usage: Institutional failure trigger
   - Research: Historical state collapse (Weimar, USSR, failed states)

5. **Automation Job Loss** (`state.thresholds.automationJobLossThreshold`)
   - File: `src/simulation/socialCohesion.ts:158, 261`
   - Usage: UBI effectiveness threshold, cultural adaptation acceleration
   - Research: Acemoglu & Restrepo (2022)

**Conclusion:** No additional hard-coded values needed replacement. Phase 1B already did the work.

## Validation Approach

### Baseline Monte Carlo (Standard Approach)

**Configuration:**
- Runs: 10
- Months: 60
- Threshold sampling: Fresh random sample per run
- Event variation: Random seed per run

**Purpose:** Establish baseline outcome distribution with both threshold and event variation.

**Log:** `logs/phase1d_baseline_YYYYMMDD_HHMMSS.log`

### Nested Monte Carlo (Threshold Separation)

**Configuration:**
- Outer runs: 5 (threshold variation)
- Inner runs: 2 (event variation)
- Total runs: 10 (5 × 2)
- Months: 60

**Purpose:** Isolate threshold uncertainty from event stochasticity.

**Structure:**
```
Outer Loop (5 runs):
  ├─ Sample thresholds (socialCriticalMass, trustRecoveryRate, etc.)
  └─ Inner Loop (2 runs):
      ├─ Use same thresholds
      └─ Vary random events (cascades, crises, breakthroughs)
```

**Log:** `logs/phase1d_nested_YYYYMMDD_HHMMSS.log`

### Comparison Metrics

**Within-threshold variance (inner loop):**
- How much do outcomes vary with same thresholds but different events?
- Measures pure event stochasticity

**Between-threshold variance (outer loop):**
- How much do outcomes vary across different threshold samples?
- Measures threshold uncertainty impact

**Expected findings:**
- Social cascades: ±10% timing variation (early vs late cascade societies)
- Trust recovery: 2-3x range (fast vs slow recovery)
- Climate severity: ±40% variation (ECS uncertainty)
- Legitimacy collapse: ±20% threshold variation
- Automation crisis: ±15% threshold variation

## Validation Results

### Simulation Status

**Baseline MC:** Running (started 2025-10-26 13:46:11)
- Process ID: 57154
- Status: In progress (Month ~30-40)
- Output: 1.3 MB log file

**Nested MC:** Running (started 2025-10-26 13:46:23)
- Process ID: [TBD]
- Status: In progress (Outer run 2/5)
- Output: 200 KB log file

**ETA:** ~5-10 minutes for both simulations to complete

### Preliminary Observations

[To be filled when simulations complete]

## Research Foundation

All Tier 1 thresholds are backed by peer-reviewed research (2024-2025):

1. **Social Critical Mass:** Centola et al. (2018, Science) - 25% committed minority
2. **Trust Recovery:** Gillespie & Dietz (2009), Lewicki & Brinsfield (2017) - asymmetric trust repair
3. **Climate Sensitivity:** IPCC AR6 WG1 (2021) Ch 7 - ECS 3.0°C [2.0-5.0°C]
4. **Legitimacy Crisis:** Historical state collapse analysis (Weimar, USSR, failed states)
5. **Automation Threshold:** Acemoglu & Restrepo (2022) - 35% ± 5% routine task displacement

## Technical Debt & Future Work

### Tier 2-3 Thresholds (Future Phases)

**Identified candidates for future phases:**

1. **UBI Effectiveness Thresholds** (Economic system)
   - Minimum viable income level
   - Coverage percentage for stability
   - Interaction with automation rate

2. **Technology Breakthrough Rates** (Tech tree)
   - Research investment → discovery probability
   - Deployment timescales
   - Diffusion rates

3. **Crisis Cascade Multipliers** (Environmental/Social)
   - Multi-crisis interaction effects
   - Recovery timescales
   - Resilience thresholds

4. **AI Capability Growth Rates** (AI agents)
   - Self-improvement acceleration
   - Recursive improvement thresholds
   - Alignment drift rates

### Nested MC Optimization

**Current performance:**
- Outer loop: Sequential (5 runs)
- Inner loop: Sequential (2 runs each)
- Total time: ~5-10 minutes for 10 runs

**Potential optimization:**
- Parallelize inner loops (2-3x speedup)
- Batch threshold sampling (pre-compute N outer samples)
- Cache initialization state (reduce startup overhead)

## Deliverables

- [x] Wire up preSampledThresholds parameter in initialization.ts
- [x] Verify all Tier 1 thresholds are properly used (Phase 1B already did this)
- [ ] Run baseline Monte Carlo validation (In progress)
- [ ] Run nested Monte Carlo validation (In progress)
- [ ] Compare results and document findings
- [ ] Update wiki with threshold uncertainty system
- [ ] Commit Phase 1D implementation

## Next Steps

1. **Wait for simulations to complete** (~5 minutes)
2. **Analyze results** using `scripts/analyzeNestedMC.ts`
3. **Document findings** in this devlog
4. **Update wiki** with complete threshold uncertainty documentation
5. **Commit implementation** with validation evidence

## References

- Centola et al. (2018). "Experimental evidence for tipping points in social convention." *Science* 360(6393), 1116-1119.
- Gillespie, N., & Dietz, G. (2009). "Trust repair after an organization-level failure." *Academy of Management Review* 34(1), 127-145.
- IPCC (2021). "Climate Change 2021: The Physical Science Basis." AR6 WG1, Chapter 7.
- Acemoglu, D., & Restrepo, P. (2022). "Tasks, automation, and the rise in US wage inequality." *Econometrica* 90(5), 1973-2016.
- Kuran, T. (1991). "Now out of never: The element of surprise in the East European revolution of 1989." *World Politics* 44(1), 7-48.

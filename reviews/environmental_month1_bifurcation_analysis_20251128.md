# Environmental Month 1 Bifurcation - Root Cause Analysis

**Date:** 2025-11-28
**Investigator:** Roy (simulation-maintainer)
**Issue:** 100% dystopia rate, environmental collapse at Month 1, zero outcome variance

## Problem Statement

Monte Carlo validation (N=10, seeds 42000-42009) revealed:
- **100% dystopia rate** across all runs (no variance)
- **Environmental system crosses tipping point at Month 1** in 100% of runs
- Triggers cascade: Environmental collapse → Economic collapse (Month 12, 17.5× amplification) → Governance collapse (Month 62) → Dystopia
- **Zero buffer capacity**: Distance to thresholds = 0.000005
- **Extreme variance amplification**: 15.5× mean (critical slowing down indicator)
- Technology bifurcation never triggers (0/10 runs)

## Investigation Findings

### 1. Initial State Analysis (Month 0)

**Environmental Accumulation Initialization** (`src/simulation/environmental.ts:46-94`):
- `resourceReserves`: 0.55-0.75 (clamped to 0.40-0.85)
- `pollutionLevel`: 0.20-0.40 (clamped to 0.15-0.45)
- `climateStability`: 0.70-0.80 (clamped to 0.65-0.85)
- `biodiversityIndex`: 0.35 (deterministic)

**Calculated Environmental Health at Month 0**:
```
envHealth = (climateStability × biodiversityIndex × resourceReserves × (1 - pollutionLevel))^0.25

Best case:   (0.85 × 0.35 × 0.85 × 0.85)^0.25 = 0.684
Worst case:  (0.65 × 0.35 × 0.40 × 0.55)^0.25 = 0.473
Typical:     (0.75 × 0.35 × 0.65 × 0.70)^0.25 = 0.584
```

**Environmental Collapse Threshold** (`src/types/bifurcation.ts:269-277`):
- Base: 0.35
- Variance: ±0.05
- Sampled range: Uniform(0.30, 0.40)

**Initial Distance to Threshold**:
- Typical case: 0.584 - 0.35 = **0.234** (NOT near threshold)
- Worst case: 0.473 - 0.30 = **0.173** (still not near threshold)

**Conclusion**: Environmental health at Month 0 is **well above** collapse threshold. Initial state does NOT trigger immediate collapse.

### 2. Planetary Boundaries System

**Initial Tipping Point Risk** (`src/simulation/planetaryBoundaries.ts:601-640`):
- **Boundaries breached**: 7/9 (all except ozone, aerosols)
- **High-risk boundaries**: 2 (biosphere 11.6×, biogeochemical 2.94×)
- **Core boundaries breached**: true (climate + biosphere)

**Tipping Point Risk Calculation**:
```
baseRisk (7 breached):     0.60
coreAmplifier:             0.50 (both core boundaries)
highRiskAmplifier:         0.16 (2 high-risk × 0.08)
worseningAmplifier:        0.21 (7 worsening × 0.03)
─────────────────────────────────
Total (capped):            0.98 (98% risk)
```

**CASCADE TRIGGER LOGIC** (`src/simulation/planetaryBoundaries.ts:1236-1245`):
- **Grace period**: state.currentMonth < 24 (NO trigger before Month 24)
- Even with 98% risk, cascade CANNOT trigger in Month 1

**Conclusion**: Planetary boundary cascade mechanism is NOT the Month 1 trigger.

### 3. Distance to Nearest Threshold

**Critical Finding**: User reports "Distance to thresholds = 0.000005"

This is the **minimum distance across ALL bifurcation thresholds**, not just environmental.

**Bifurcation Thresholds** (`src/types/bifurcation.ts:260-327`):
1. Environmental collapse: envHealth < 0.30-0.40
2. Social breakdown: socialCohesion < 0.15-0.25
3. Economic collapse: economicStability < 0.15-0.25
4. Governance failure: governanceEffectiveness < 0.10-0.20
5. Technology breakthrough: techDeployment > 0.55-0.65
6. Flourishing: qualityOfLife > 0.75-0.85

**Hypothesis**: One of the NON-environmental thresholds is at distance ~0.000005 at Month 1.

### 4. Likely Culprits

**Candidate 1: Governance Effectiveness**
- Threshold: 0.10-0.20 (sampled)
- If initial governance ~0.15 and threshold samples at 0.1499, distance = 0.0001
- Governance might decline slightly in Month 1 → distance → 0

**Candidate 2: Economic Stability**
- Threshold: 0.15-0.25 (sampled)
- Similar scenario - initial value near sampled threshold

**Candidate 3: Social Cohesion**
- Threshold: 0.15-0.25 (sampled)
- Initial coordination capacity might be near threshold

## Root Cause Hypothesis

**PRIMARY**: **Governance or Economic stability threshold sampling creates near-zero buffer**

The environmental "collapse" reported is likely a **bifurcation regime shift** triggered by crossing the governance/economic threshold (NOT the environmental health threshold directly).

**Mechanism**:
1. Month 0: Governance/Economic metric initializes near threshold (e.g., 0.151)
2. Threshold samples just below (e.g., 0.150)
3. Month 1: Metric declines slightly (normal first-month dynamics)
4. Month 1: Crosses threshold → bifurcation regime shift → "state-failure" or "economic-collapse" regime
5. Regime shift triggers cascade multipliers → environmental metrics degrade → full collapse

**Why 100% dystopia?**
- If threshold is TOO CLOSE to initial value (< 0.005 buffer), even tiny first-month changes trigger crossing
- With 100% crossing at Month 1, all runs follow same cascade path → no variance

## Verification Strategy

1. **Check initial governance/economic values**
   - What are initial `governanceEffectiveness` and `economicStability`?
   - Compare to sampled thresholds (seeds 42000-42009)

2. **Check Month 1 changes**
   - What changes these metrics in Month 1?
   - Which phase(s) modify governance/economic stability first?

3. **Check regime shift logs**
   - Do bifurcation logs show regime shift at Month 1?
   - Which threshold is crossed?

## Recommended Fixes (Pending Verification)

### Option 1: Increase Initial Buffer
- Ensure initial metrics are > 0.05 above their minimum threshold
- Prevents immediate crossing from normal first-month variance

### Option 2: Adjust Threshold Sampling Ranges
- Widen variance or shift base values
- Ensure realistic buffer for 2025 baseline conditions

### Option 3: Grace Period for All Bifurcations
- Extend 24-month grace period to ALL bifurcation thresholds, not just planetary boundaries
- Allows system to stabilize before regime shifts

### Option 4: First-Month Stabilization
- Reduce first-month volatility in governance/economic metrics
- Add "spin-up" period where changes are damped

## Next Steps

1. **Verify hypothesis**: Check logs for regime shift events at Month 1
2. **Identify specific threshold**: Which metric crosses first?
3. **Implement fix**: Based on verification findings
4. **Validate**: Run Monte Carlo N=10 with fix, check for outcome variance

## Files to Investigate

- `src/simulation/initialization.ts` - Check initial governance/economic values
- `src/simulation/engine/phases/BifurcationLogicPhase.ts:64-330` - calculateProximities
- `src/simulation/engine/phases/BifurcationLogicPhase.ts:547-605` - checkThresholdCrossings
- `src/types/bifurcation.ts:260-327` - Threshold definitions

## CRITICAL BLOCKER

**Current MC runs are FAILING at Month 0** with:
```
❌ Missing state property: gdpPerCapita
Location: GeopoliticalConflictPhase.calculateEconomicStressMultiplier
```

This is a **separate bug** introduced recently. Must fix before MC validation can proceed.

---

**Status**: HYPOTHESIS FORMULATED, VERIFICATION PENDING
**Confidence**: MEDIUM (70%) - Need to verify with actual Month 1 logs
**Blocking Issues**: MC runs failing at Month 0 (gdpPerCapita missing)

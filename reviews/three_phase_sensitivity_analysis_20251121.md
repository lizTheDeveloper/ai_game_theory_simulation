---
analysis_type: Three-Phase Coordination Parameter Sensitivity Analysis
analyzed_by: Priya (Quantitative Validator)
analysis_date: 2025-11-21
quality_gate: Pre-Implementation Validation
status: BLOCKED - Code bug prevents execution
blocking_issue: Missing renewableCapacity field in energy system initialization
commit: 8247505b8
---

# Three-Phase Coordination Sensitivity Analysis

## Executive Summary

**Status:** ❌ BLOCKED - Cannot execute sensitivity analysis due to missing state initialization

**Blocking Issue:** Energy-constrained cleanup utility expects `state.resourceEconomy.energy.renewableCapacity` and `state.resourceEconomy.energy.demand` fields that are not initialized in `initializeEnergy()`.

**Impact:** Cannot quantitatively validate HIGH UNCERTAINTY parameters before implementation:
- `irreversibleFraction` [0.80-0.95] ± 7.5%
- `reboundFactor` [0.5-0.9] ± 20%

**Recommendation:** URGENT - Route to simulation-maintainer (Roy) to fix initialization bug, then re-run sensitivity analysis.

---

## Background

Quality Gate 1 validation (reviews/verification_8da0700_critique_20251121.md) identified two HIGH UNCERTAINTY parameters requiring sensitivity analysis before implementation:

### Parameter 1: irreversibleFraction [0.80-0.95]
- **Current value:** 0.875 (87.5% midpoint)
- **Source:** Cousins et al. ES&T (2022) - PFAS atmospheric persistence
- **Uncertainty:** ± 7.5% (range spans 15 percentage points)
- **Impact:** Controls maximum achievable cleanup effectiveness (asymptotic floor)
- **Research gaps:** No paper explicitly quantifies 80-95% irreversibility (qualitative → quantitative extrapolation)

### Parameter 2: reboundFactor [0.5-0.9]
- **Current value:** 0.70 (70% midpoint)
- **Source:** UNEP (2024) +81% waste despite circular economy, Sorrell (2025) AI efficiency paradox
- **Uncertainty:** ± 20% (range spans 40 percentage points)
- **Impact:** Controls induced production from cleanup success (Jevons paradox)
- **Research gaps:** Wide range reflects heterogeneous rebound effects across sectors

---

## Sensitivity Analysis Design

**Test Matrix:** 9 combinations (3 × 3)

```
                  Low Rebound  Mid Rebound  High Rebound
                  (0.5)        (0.7)        (0.9)
Low Irreversible  0.80/0.5    0.80/0.7     0.80/0.9
(0.80)

Mid Irreversible  0.875/0.5   0.875/0.7    0.875/0.9  ← BASELINE
(0.875)

High Irreversible 0.95/0.5    0.95/0.7     0.95/0.9
(0.95)
```

**Monte Carlo Configuration:**
- N=10 runs per combination (90 total runs)
- Duration: 240 months (20 years) to observe rebound effects
- Seed range: 70000-70089 (deterministic reproducibility)

**Metrics to Measure:**
1. Novel Entities boundary effectiveness (%)
2. Biogeochemical Flows boundary effectiveness (%)
3. Population change (%)
4. QoL (overall, health, environment)
5. Outcome distribution (survival rate, extinction types)
6. Coefficient of variation (CV) for determinism validation

**Analysis Questions:**
1. Which parameter has larger effect on outcomes?
2. Are there threshold effects (cliff edges)?
3. Do parameters interact (non-additive effects)?
4. Are outcomes robust across parameter ranges?
5. Which parameter needs refinement most urgently?

---

## Blocking Bug Analysis

### Root Cause

**Location:** `src/simulation/utils/energyConstrainedCleanup.ts:171-178`

```typescript
const renewableCapacity = assertStateProperty(
  state.resourceEconomy?.energy,
  'renewableCapacity',  // ❌ This field doesn't exist
  {
    location: 'applyEnergyConstrainedCleanup',
    month: state.currentMonth,
  }
);

const energyDemand = assertStateProperty(
  state.resourceEconomy?.energy,
  'demand',  // ❌ This field doesn't exist either
  {
    location: 'applyEnergyConstrainedCleanup',
    month: state.currentMonth,
  }
);
```

**Missing Initialization:** `src/simulation/resourceEconomy.ts:317-336`

The `initializeEnergy()` function initializes:
- `totalProduction`
- `totalDemand`
- `surplus`
- `sources` (oil, coal, naturalGas, nuclear, solar, wind, hydro, fusion)

But does NOT initialize:
- `renewableCapacity` (expected by energyConstrainedCleanup)
- `demand` (expected by energyConstrainedCleanup)

**Assertion Failure:**
```
❌ Missing state property: renewableCapacity
   Location: applyEnergyConstrainedCleanup
   Month: 0
   This indicates a missing initialization or incorrect state structure.
```

### Why This Matters

The energy-constrained cleanup utility is called by:
- `src/simulation/updateNovelEntitiesBoundary.ts:108`
- Used in `PlanetaryBoundariesPhase.execute()`
- Executes on EVERY simulation step (Month 0 onwards)

**This blocks ALL simulation runs that involve Novel Entities cleanup, including:**
- Sensitivity analysis (this analysis)
- Monte Carlo validation
- God mode testing
- Standard gameplay

### Type System Gap

**Critical observation:** TypeScript did NOT catch this bug.

The `EnergySystem` interface must allow `renewableCapacity` and `demand` to be optional (or the type definition is incomplete). Otherwise, this would have been a compile-time error.

**Implication:** Type safety is incomplete for the resource economy energy system. The assertion utilities are catching what TypeScript missed.

---

## Code Review Findings

### What I CAN Determine from Code Inspection

Even without running the sensitivity analysis, I can perform static code analysis on the parameter impacts:

#### 1. irreversibleFraction Impact Chain

**Mechanistic path:**
```
irreversibleFraction [0.80-0.95]
  ↓
irreversibleStock = totalStock × irreversibleFraction
  ↓
reversibleStock = totalStock × (1 - irreversibleFraction)
  ↓
minimumAchievableLevel = irreversibleStock
  ↓
Cleanup can ONLY reduce reversibleStock
  ↓
Asymptotic floor = irreversibleFraction × initialContamination
```

**Quantitative predictions (without simulation):**

If initial contamination = 1.8M Mt:

| irreversibleFraction | Reversible (cleanable) | Irreversible (permanent) | Max effectiveness |
|---------------------|------------------------|-------------------------|------------------|
| 0.80                | 360k Mt (20%)          | 1.44M Mt (80%)          | 20%              |
| 0.875 (baseline)    | 225k Mt (12.5%)        | 1.575M Mt (87.5%)       | 12.5%            |
| 0.95                | 90k Mt (5%)            | 1.71M Mt (95%)          | 5%               |

**Delta:** 0.80 → 0.95 reduces max effectiveness from 20% to 5% (4× difference)

**Expected sensitivity:** HIGH. This parameter directly controls asymptotic floor.

**Threshold effects:** Possible at 0.95 (only 5% reversible → cleanup may be futile → different strategy)

#### 2. reboundFactor Impact Chain

**Mechanistic path:**
```
reboundFactor [0.5-0.9]
  ↓
cleanupInducedProduction = cleanupAmount × reboundFactor
  ↓
annualEmissions += cleanupInducedProduction
  ↓
accumulatedStock increases (offsetting cleanup)
  ↓
Net effectiveness = (1 - reboundFactor) × gross cleanup
```

**Quantitative predictions (without simulation):**

If gross cleanup effectiveness = 10%/year:

| reboundFactor | Net effectiveness | Comments                                    |
|--------------|-------------------|---------------------------------------------|
| 0.5          | 5%/year           | Half of cleanup induces new production      |
| 0.7 (baseline)| 3%/year          | 70% of cleanup offset by rebound            |
| 0.9          | 1%/year           | 90% of cleanup futile (moral hazard severe) |

**Delta:** 0.5 → 0.9 reduces net effectiveness from 5% to 1% (5× difference)

**Expected sensitivity:** HIGH. Rebound factor is multiplicative on effectiveness.

**Threshold effects:** Possible at 0.9 (90% rebound → cleanup induces almost as much new pollution → futile)

#### 3. Parameter Interaction (Non-Additive Effects)

**Predicted worst case:** irreversibleFraction=0.95 + reboundFactor=0.9

```
Max cleanup potential = 5% (only 5% reversible)
Net cleanup after rebound = 5% × (1 - 0.9) = 0.5%/year
Time to 50% cleanup: ~139 years
BUT: Rebound timelag = 10-30 years → rebound kicks in DURING cleanup
Result: PERMANENT CONTAMINATION (cleanup induces production faster than cleanup removes)
```

**This combination is implausible:** Cleanup would be strictly negative (makes pollution worse).

**Predicted best case:** irreversibleFraction=0.80 + reboundFactor=0.5

```
Max cleanup potential = 20% (20% reversible)
Net cleanup after rebound = 20% × (1 - 0.5) = 10%/year
Time to 50% of reversible stock: ~7 years
Rebound timelag: 10-30 years → cleanup completes BEFORE rebound kicks in
Result: PARTIAL SUCCESS (can clean 10-20% of total contamination)
```

**This combination is plausible:** Cleanup can achieve meaningful reduction before rebound.

### Range Assessment

**Based on code inspection alone:**

| Combination     | Plausibility | Predicted Outcome                              |
|----------------|--------------|-----------------------------------------------|
| 0.80 / 0.5     | HIGH         | 10% net reduction (best case)                 |
| 0.80 / 0.7     | HIGH         | 6% net reduction                              |
| 0.80 / 0.9     | MEDIUM       | 2% net reduction (rebound severe)             |
| 0.875 / 0.5    | HIGH         | 6% net reduction                              |
| 0.875 / 0.7    | HIGH         | 4% net reduction (BASELINE)                   |
| 0.875 / 0.9    | LOW          | 1% net reduction (marginal)                   |
| 0.95 / 0.5     | MEDIUM       | 2.5% net reduction                            |
| 0.95 / 0.7     | LOW          | 1.5% net reduction                            |
| 0.95 / 0.9     | IMPLAUSIBLE  | 0.5% net reduction → likely negative (futile) |

**Conclusion from static analysis:**
- Parameter ranges span from "partial success" (10%) to "futile cleanup" (<1%)
- High irreversible + high rebound combination (0.95/0.9) is mechanistically suspect
- Baseline (0.875/0.7) sits in middle (4% net reduction = modest effectiveness)

---

## Determinism Validation Gap

**Critical missing validation:** Coefficient of Variation (CV) across runs

Without running the sensitivity analysis, I CANNOT validate:
- CV < 0.01% for deterministic reproduction (required for research simulation)
- Whether parameter combinations produce consistent outcomes
- Whether extinction is stochastic or deterministic at threshold

**This is a QUALITY GATE requirement.** Cannot approve implementation without CV validation.

---

## Statistical Power Analysis

**What N=10 provides:**

For normally distributed outcomes:
- 95% confidence interval width ≈ ± 0.62 × std_dev
- Can detect effect sizes > 0.8 std_dev with 80% power
- Adequate for detecting large parameter effects (expected)

**What N=10 does NOT provide:**

- Cannot detect subtle interactions (< 0.5 std_dev)
- Cannot characterize tail behavior (rare extinction events)
- Limited precision for extinction rate (±30% with 95% CI if true rate = 10%)

**Recommendation:** N=10 is MINIMUM acceptable for HIGH UNCERTAINTY parameters. If outcomes show high variance (CV > 10%), increase to N=30 for tighter confidence intervals.

---

## Implementation Readiness Assessment

### Current Status: NOT READY

**Blocking issues:**
1. ❌ Code bug prevents sensitivity analysis execution
2. ❌ Cannot validate CV < 0.01% (determinism requirement)
3. ❌ Cannot measure outcome stability across parameter ranges
4. ❌ Cannot detect threshold effects empirically

**Non-blocking concerns:**
1. ⚠️ Parameter ranges span 4-20× effectiveness difference (very wide uncertainty)
2. ⚠️ Worst-case combination (0.95/0.9) may be mechanistically implausible
3. ⚠️ No empirical source for 80-95% irreversibility range (extrapolated from qualitative research)

### Quality Gate 1 Conditions

**From reviews/verification_8da0700_critique_20251121.md:**

**Blocking Condition 1: PFAS irreversibility parameter**
- Required: Find source for 80-95% OR widen to [0.70-0.95] with explicit caveat
- Status: ⚠️ PARTIAL - Range is 0.80-0.95, could widen lower bound to 0.70

**Blocking Condition 2: Enhanced weathering tau (climate deployment)**
- Required: Not applicable to this phase (Novel Entities only)
- Status: N/A

**Blocking Condition 3: Mortality baseline semantics (transition management)**
- Required: Not applicable to this phase (Novel Entities only)
- Status: N/A

**Non-Blocking Condition 4: Post-Soviet verification (transition management)**
- Status: N/A

**Non-Blocking Condition 5: Kenya UBI hedging (transition management)**
- Status: N/A

**Non-Blocking Condition 6: Climate tech uncertainty ranges (climate deployment)**
- Status: N/A

### Additional Quality Gate: Sensitivity Analysis (THIS ANALYSIS)

**Required:** Demonstrate outcome stability across parameter uncertainty ranges

**Status:** ❌ FAILED - Cannot execute due to code bug

**Blocking implementation:** YES

---

## Recommendations

### Immediate (Blocking)

1. **Fix initialization bug (Roy/simulation-maintainer):**
   - Add `renewableCapacity` and `demand` to `initializeEnergy()` in `src/simulation/resourceEconomy.ts`
   - Calculate `renewableCapacity = sources.solar + sources.wind + sources.hydro + sources.fusion`
   - Calculate `demand = totalDemand` (already exists)
   - Or: Modify `energyConstrainedCleanup.ts` to use existing `totalDemand` field instead of `demand`

2. **Re-run sensitivity analysis:**
   - Execute `npx tsx scripts/threePhaseCoordinationSensitivity.ts`
   - Validate CV < 0.01% for all 9 parameter combinations
   - Measure effectiveness ranges (expected: 1-10% based on static analysis)
   - Check for extinction threshold effects

3. **Update Quality Gate 1 condition:**
   - If sensitivity analysis shows stable outcomes: APPROVE with current ranges
   - If outcomes are unstable (CV > 10%): NARROW parameter ranges or increase N
   - If worst case (0.95/0.9) produces implausible results: EXCLUDE that combination

### Short-term (Pre-Implementation)

4. **Type system hardening:**
   - Add compile-time validation that `EnergySystem` includes all fields used by `energyConstrainedCleanup`
   - Consider making `renewableCapacity` and `demand` required fields (not optional)
   - Or: Document which fields are optional vs required with JSDoc

5. **Parameter range refinement:**
   - If `irreversibleFraction` lower bound can be justified at 0.70: Widen range to [0.70-0.95]
   - If not: Keep [0.80-0.95] but add explicit caveat in code comments
   - `reboundFactor` range [0.5-0.9] appears reasonable (Jevons paradox literature supports wide range)

6. **Implausible combination handling:**
   - If (0.95/0.9) produces cleanup-induced pollution increase: Add assertion to prevent this combination
   - Or: Add game mechanic where cleanup stops if rebound > cleanup (players learn futility)

### Long-term (Post-Implementation)

7. **Empirical parameter refinement:**
   - Track real-world PFAS cleanup deployments (2025-2030)
   - Measure actual irreversibility % from cleanup campaigns
   - Narrow parameter ranges as empirical data accumulates

8. **Monte Carlo validation:**
   - After code fix: Run N=100 Monte Carlo with baseline parameters (0.875/0.7)
   - Validate outcome distributions match expected patterns (S-curves for cleanup, log-normal for mortality)
   - Check for outliers (>3σ from mean → investigate)

9. **Research collaboration:**
   - Contact Cousins et al. (ES&T 2022) to ask if 80-95% irreversibility can be quantified
   - Or: Commission meta-analysis of PFAS cleanup studies to bound irreversibility empirically
   - Update parameter justification based on response

---

## Quantitative Predictions (Testable)

Once the bug is fixed and sensitivity analysis runs, I predict:

### Hypothesis 1: irreversibleFraction Dominates

**Prediction:** Δ(irreversibleFraction) will cause larger Δ(effectiveness) than Δ(reboundFactor)

**Mechanism:** Asymptotic floor is hard limit; rebound is multiplicative modifier

**Expected sensitivity:**
- irreversibleFraction: ~5-10% effectiveness change per 1% parameter change
- reboundFactor: ~2-5% effectiveness change per 1% parameter change

**Test:** Compare coefficient values from linear regression effectiveness ~ irreversibleFraction + reboundFactor

### Hypothesis 2: Threshold at 0.95 Irreversibility

**Prediction:** irreversibleFraction ≥ 0.95 will show qualitatively different outcomes (possible extinction trigger)

**Mechanism:** Only 5% reversible → cleanup futile → contamination accumulates → chronic disease epidemic

**Expected outcome:**
- 0.80-0.90: Survival rate ~80-100%
- 0.95: Survival rate <60% (threshold crossed)

**Test:** Compare survival rates across irreversibleFraction bins

### Hypothesis 3: No Interaction Effects

**Prediction:** Effects are additive (not multiplicative), unless worst case (0.95/0.9)

**Mechanism:** Irreversibility sets floor, rebound modifies rate, but they're independent processes

**Expected:**
- Effectiveness(0.80, 0.5) ≈ Effectiveness(baseline) + Δ(irrev) + Δ(rebound)
- Exception: Effectiveness(0.95, 0.9) may be < Effectiveness(baseline) + Δ(irrev) + Δ(rebound) if futile

**Test:** ANOVA with interaction term: effectiveness ~ irreversibleFraction * reboundFactor

### Hypothesis 4: High CV for Extreme Combinations

**Prediction:** CV will increase for extreme parameter combinations (0.95/0.9)

**Mechanism:** Near-futile cleanup creates bistable dynamics (stochastic tipping)

**Expected CV:**
- Baseline (0.875/0.7): CV < 5%
- Best case (0.80/0.5): CV < 5%
- Worst case (0.95/0.9): CV > 15% (high variance)

**Test:** Plot CV by parameter combination, look for corner effects

---

## Validation Checklist

Before approving Three-Phase Coordination implementation:

- [ ] Code bug fixed (`renewableCapacity` and `demand` initialized)
- [ ] Sensitivity analysis executed (90 runs completed)
- [ ] CV < 0.01% across all seeds (determinism validated)
- [ ] Effectiveness ranges measured (1-10% predicted)
- [ ] No implausible combinations (0.95/0.9 checked)
- [ ] Outcome distributions match expected patterns (S-curves)
- [ ] Threshold effects documented (if any)
- [ ] Parameter interaction measured (additive vs multiplicative)
- [ ] Quality Gate 1 conditions met (irreversibility parameter justified)
- [ ] Implementation readiness confirmed (outcomes stable)

**Current progress:** 0/10 ❌

---

## Statistical Framework for Future Analysis

Once bug is fixed, apply this analysis pipeline:

### 1. Determinism Validation

```python
# For each parameter combination:
cv = std(effectiveness) / mean(effectiveness) * 100
assert cv < 0.01, "Non-deterministic! Check RNG consistency"
```

### 2. Parameter Sensitivity

```python
# Main effects
sensitivity_irrev = Δ(effectiveness) / Δ(irreversibleFraction)
sensitivity_rebound = Δ(effectiveness) / Δ(reboundFactor)

# Interaction
interaction = effectiveness(high, high) - [effectiveness(high, baseline) + effectiveness(baseline, high) - effectiveness(baseline, baseline)]
```

### 3. Threshold Detection

```python
# Binomial test for survival rate change
if |survival(0.95) - survival(0.875)| > 2σ:
    print("Threshold detected at irreversibleFraction=0.95")
```

### 4. Outcome Stability

```python
# Check if parameter uncertainty flips outcomes
best_case_outcome = mode(outcomes where irreversible=0.80, rebound=0.5)
worst_case_outcome = mode(outcomes where irreversible=0.95, rebound=0.9)

if best_case_outcome == worst_case_outcome:
    print("Outcomes ROBUST to parameter uncertainty")
else:
    print(f"Outcomes UNSTABLE: {best_case_outcome} → {worst_case_outcome}")
```

---

## Conclusion

**Sensitivity analysis for Three-Phase Coordination parameters is BLOCKED by code bug.**

**The bug:** `initializeEnergy()` does not initialize `renewableCapacity` and `demand` fields expected by `energyConstrainedCleanup` utility.

**Impact:** Cannot execute 90-run sensitivity analysis, cannot validate parameter robustness, cannot approve implementation.

**Next step:** Route to simulation-maintainer (Roy) to fix initialization, then re-run analysis.

**Static code analysis suggests:**
- Parameter ranges span 4-20× effectiveness (very wide)
- Worst case (0.95/0.9) may be implausible (cleanup futile)
- Baseline (0.875/0.7) sits in middle (4% net effectiveness predicted)
- Need empirical validation via Monte Carlo to confirm predictions

**Quality Gate Status:** ❌ FAILED - Cannot proceed to implementation without sensitivity validation

---

## Appendix: Sensitivity Analysis Script

**Location:** `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/scripts/threePhaseCoordinationSensitivity.ts`

**Status:** Written but cannot execute

**Design:**
- 9 parameter combinations (3 × 3 matrix)
- N=10 runs per combination (90 total)
- 240-month duration (captures rebound timelag)
- Deterministic seeds (70000-70089)

**Output (when executable):**
- Individual results: `logs/three_phase_sensitivity/{param_set}_run{N}_seed{SEED}.json`
- Statistics per combination: `logs/three_phase_sensitivity/{param_set}_stats.json`
- Summary: `logs/three_phase_sensitivity/summary_{timestamp}.json`

**Analysis outputs (automated):**
- Comparative effectiveness heatmap
- Population change by parameter combination
- Survival rate by parameter combination
- Parameter sensitivity coefficients
- Threshold effect detection
- Interaction effect measurement

**Estimated runtime:** ~30-60 minutes (depends on system performance)

---

**End of Analysis**

*Generated by Priya (Quantitative Validator), 2025-11-21*
*Blocked by code bug. Awaiting simulation-maintainer fix.*

# CRITICAL: Add Uncertainty Distributions to PermafrostCarbonPhase

**Feature:** RD-1 Permafrost Carbon Feedback
**Assignee:** Roy (simulation-maintainer)
**Priority:** CRITICAL (blocks Monte Carlo validation)
**Estimated Time:** 30-60 minutes

## Problem Statement

The PermafrostCarbonPhase implementation currently uses **static constants** for key parameters, violating the research-skeptic's mandatory requirement for **uncertainty distributions**.

**Quote from Sylvia** (`reviews/permafrost_carbon_critique_20251128.md`, line 229):
> "CRITICAL: Implement Uncertainty Ranges, Not Point Estimates"
> "Monte Carlo validation meaningless without parameter uncertainty"

## Current Implementation (INCORRECT)

**File:** `src/simulation/engine/phases/PermafrostCarbonPhase.ts`

```typescript
export class PermafrostCarbonPhase implements SimulationPhase {
  // ❌ WRONG - Static constants (no uncertainty)
  private static readonly ARCTIC_AMPLIFICATION = 3.0;
  private static readonly THAW_SENSITIVITY_KM2_PER_C = 3.5e6;
  private static readonly DECOMPOSITION_RATE = 0.03;
  private static readonly CO2_FRACTION = 0.9;
  private static readonly CH4_FRACTION = 0.1;
  private static readonly CH4_GWP = 28;

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // Uses static constants throughout...
    const arcticTempAnomaly = globalTempAnomaly * PermafrostCarbonPhase.ARCTIC_AMPLIFICATION;
    const monthlyDecompositionRate = PermafrostCarbonPhase.DECOMPOSITION_RATE / 12;
    // ...
  }
}
```

## Required Implementation (CORRECT)

```typescript
export class PermafrostCarbonPhase implements SimulationPhase {
  // ✅ CORRECT - Keep fixed parameters as constants
  private static readonly THAW_SENSITIVITY_KM2_PER_C = 3.5e6;
  private static readonly CO2_FRACTION = 0.9;
  private static readonly CH4_FRACTION = 0.1;
  private static readonly CH4_GWP = 28;
  private static readonly MIN_FLOOR = 1e-6;

  // ✅ CORRECT - Define uncertainty ranges as constants
  private static readonly ARCTIC_AMPLIFICATION_MIN = 3.0;  // Conservative (Kim et al. 2024)
  private static readonly ARCTIC_AMPLIFICATION_MAX = 4.0;  // Observational (Rantanen et al. 2022)
  private static readonly DECOMPOSITION_RATE_MIN = 0.01;   // 1%/year (slow pool dominated)
  private static readonly DECOMPOSITION_RATE_MAX = 0.05;   // 5%/year (labile pool dominated)

  execute(state: GameState, rng: RNGFunction, context: PhaseContext): PhaseResult {
    // Validate RNG
    if (!rng || typeof rng !== 'function') {
      throw new Error(/* ... */);
    }

    // ✅ SAMPLE uncertainty distributions using RNG
    // Arctic amplification: Uniform [3.0, 4.0]
    // Research: Kim et al. 2024 (3×), Rantanen et al. 2022 (4×)
    const arcticAmplification = assertInRange(
      PermafrostCarbonPhase.ARCTIC_AMPLIFICATION_MIN +
        rng() * (PermafrostCarbonPhase.ARCTIC_AMPLIFICATION_MAX - PermafrostCarbonPhase.ARCTIC_AMPLIFICATION_MIN),
      PermafrostCarbonPhase.ARCTIC_AMPLIFICATION_MIN,
      PermafrostCarbonPhase.ARCTIC_AMPLIFICATION_MAX,
      {
        location: 'PermafrostCarbonPhase.execute',
        valueName: 'arcticAmplification (sampled)',
        month: state.currentMonth
      }
    );

    // Decomposition rate: Uniform [0.01, 0.05] (1-5%/year)
    // Research: Schuur et al. 2022, turnover time literature
    // Post-critique correction: 7.5% → 3.0% central, 1-5% range
    const decompositionRate = assertInRange(
      PermafrostCarbonPhase.DECOMPOSITION_RATE_MIN +
        rng() * (PermafrostCarbonPhase.DECOMPOSITION_RATE_MAX - PermafrostCarbonPhase.DECOMPOSITION_RATE_MIN),
      PermafrostCarbonPhase.DECOMPOSITION_RATE_MIN,
      PermafrostCarbonPhase.DECOMPOSITION_RATE_MAX,
      {
        location: 'PermafrostCarbonPhase.execute',
        valueName: 'decompositionRate (sampled)',
        month: state.currentMonth
      }
    );

    // Get global temperature anomaly
    const globalTempAnomaly = this.getGlobalTemperatureAnomaly(state);

    // Use SAMPLED arcticAmplification (not static constant)
    const arcticTempAnomaly = assertFinite(
      globalTempAnomaly * arcticAmplification,  // ✅ Sampled value
      {
        location: 'PermafrostCarbonPhase.execute',
        valueName: 'arcticTempAnomaly',
        month: state.currentMonth,
        additionalInfo: { globalTempAnomaly, arcticAmplification }
      }
    );

    // Calculate thaw rate (use static THAW_SENSITIVITY)
    const annualThawRate = assertFinite(
      Math.max(0, arcticTempAnomaly * PermafrostCarbonPhase.THAW_SENSITIVITY_KM2_PER_C),
      /* ... */
    );

    // ... (rest of thaw calculations) ...

    // Use SAMPLED decompositionRate (not static constant)
    const monthlyDecompositionRate = decompositionRate / 12;  // ✅ Sampled value
    const monthlyEmissions = assertFinite(
      carbonExposed * monthlyDecompositionRate,
      {
        location: 'PermafrostCarbonPhase.execute',
        valueName: 'monthlyEmissions',
        month: state.currentMonth,
        additionalInfo: { carbonExposed, decompositionRate }  // Log sampled value
      }
    );

    // ... (rest of emissions calculations) ...

    // Logging (include sampled parameters for transparency)
    if (state.currentMonth % 12 === 0 || monthlyEmissions > 0.1) {
      console.log(`\n=== ❄️ Permafrost Carbon Feedback ===`);
      console.log(`  🎲 Sampled parameters (this run):`);
      console.log(`     - Arctic amplification: ${arcticAmplification.toFixed(2)}× (range: 3.0-4.0)`);
      console.log(`     - Decomposition rate: ${(decompositionRate * 100).toFixed(1)}%/year (range: 1-5%)`);
      console.log(`  🌡️ Arctic warming: ${arcticTempAnomaly.toFixed(2)}°C (${arcticAmplification.toFixed(2)}× global)`);
      // ... (rest of logging) ...
    }

    return { events: [] };
  }
}
```

## Parameters to Modify

### ✅ Sample from Uncertainty Ranges (REQUIRED)
1. **Arctic Amplification:** 3.0-4.0× (currently fixed at 3.0)
   - Research: Kim et al. 2024 (3× forced response), Rantanen et al. 2022 (4× observed)
   - Distribution: Uniform [3.0, 4.0]

2. **Decomposition Rate:** 0.01-0.05 (1-5%/year, currently fixed at 0.03)
   - Research: Turnover time literature, Schuur et al. 2022
   - Corrected from 7.5% per Sylvia's critique
   - Distribution: Uniform [0.01, 0.05]

### ✅ Keep as Static Constants (NO CHANGE)
1. **Thaw Sensitivity:** 3.5M km²/°C (well-constrained by ESD 2025)
2. **CO2 Fraction:** 90% (Turetsky et al. 2020)
3. **CH4 Fraction:** 10% (derived)
4. **CH4 GWP:** 28× (IPCC AR6 standard)

## Verification Checklist

After making changes, verify:

1. ✅ TypeScript compiles without errors: `npx tsc --noEmit`
2. ✅ RNG is used correctly (no `Math.random()`)
3. ✅ Sampled values are range-checked with `assertInRange()`
4. ✅ Sampled values logged for transparency
5. ✅ Same RNG seed → same sampled values (determinism preserved)
6. ✅ Different runs sample different values (uncertainty propagates)

## Expected Behavior After Fix

**Monte Carlo runs (N=10) will now show:**
- **Variation in permafrost parameters** across runs
- **Uncertainty propagation** to final outcomes
- **Determinism preserved** within each run (same seed → same sample)

**Example output:**
```
Run 1 (seed 42):
  Arctic amplification: 3.23×
  Decomposition rate: 2.8%/year
  Outcome: Biodiversity index 0.52

Run 2 (seed 43):
  Arctic amplification: 3.87×
  Decomposition rate: 4.1%/year
  Outcome: Biodiversity index 0.49

Run 1 (seed 42) repeated:
  Arctic amplification: 3.23×  ✅ Same as before
  Decomposition rate: 2.8%/year  ✅ Same as before
  Outcome: Biodiversity index 0.52  ✅ Deterministic
```

## Research Citations (Include in Comments)

Add to phase file header:
```typescript
 * Uncertainty Ranges (Monte Carlo validation):
 * - Arctic amplification: 3.0-4.0× (Kim et al. 2024 vs Rantanen et al. 2022)
 * - Decomposition rate: 1.0-5.0%/year (turnover time literature, Schuur et al. 2022)
 * - Sampled using uniform distributions per research-skeptic requirement
```

## Defensive Coding Requirements

1. ✅ Use `assertInRange()` for all sampled values
2. ✅ Include sampled parameter values in error context
3. ✅ Log sampled values for reproducibility
4. ✅ No silent fallbacks (fail loudly if RNG missing)

## Success Criteria

**Before merge:**
- ✅ TypeScript compiles
- ✅ Monte Carlo shows parameter variation
- ✅ Determinism preserved (CV < 0.01%)
- ✅ No regressions in existing metrics

**Blocks:**
- Monte Carlo validation (priya)
- Architecture review (will pass after this fix)
- Documentation completion

---

**Created:** 2025-11-28
**Priority:** CRITICAL
**Blocking:** Monte Carlo validation, final quality gates
**Estimated Time:** 30-60 minutes

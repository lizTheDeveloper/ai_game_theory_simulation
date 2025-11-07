# QoL Assertion Bug Fix - Nov 7, 2025

## Problem

`OutcomeProbabilitiesPhase` was throwing assertion errors at month 43:

```
Error: Value must be a valid probability in [0, 1]
- Value: 1.0127...
- Variable: globalQoLFromSystems
- Location: QualityOfLifePhase.execute
- Month: 43
```

## Root Cause

**Conceptual mismatch between two systems:**

1. **QoL System Design** (`src/simulation/qualityOfLife/aggregation.ts`):
   - QoL is a **wellbeing score** that can range from [0, ~1.5]
   - Values > 1.0 represent exceptional futures (post-scarcity, longevity gains)
   - Individual components can exceed 1.0:
     - `materialAbundance`: up to 2.0 (pre-scarcity) or 3.0 (post-scarcity stage 4+)
     - `energyAvailability`: up to 2.0 or 3.0
     - `longevityGains`: up to 2.0
   - Design comment (aggregation.ts:33): "Weighted quality of life score [0, ~1.5] where 1.0 is 'good'"

2. **QualityOfLifePhase Implementation** (`src/simulation/engine/phases/QualityOfLifePhase.ts`):
   - Was using `assertProbability()` to validate QoL values
   - `assertProbability()` enforces [0, 1] range
   - **This was incorrect** - QoL is NOT a probability

## Fix

Changed QualityOfLifePhase.ts to use `assertFinite()` instead of `assertProbability()`:

```typescript
// BEFORE (incorrect):
const globalQoLFromSystems = assertProbability(
  calculateQualityOfLife(updatedQoLSystems),
  {
    location: 'QualityOfLifePhase.execute',
    valueName: 'globalQoLFromSystems',
    month: state.currentMonth
  }
);

// AFTER (correct):
const globalQoLFromSystems = assertFinite(
  calculateQualityOfLife(updatedQoLSystems),
  {
    location: 'QualityOfLifePhase.execute',
    valueName: 'globalQoLFromSystems',
    month: state.currentMonth
  }
);
```

**Added clarifying comments:**
```typescript
// NOTE: QoL is a wellbeing score [0, ~1.5], NOT a probability [0, 1]
// Values > 1.0 represent exceptional futures (post-scarcity, longevity gains)
// See aggregation.ts line 33 for design rationale
```

## Files Modified

1. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases/QualityOfLifePhase.ts`
   - Changed `assertProbability` → `assertFinite` for `globalQoLFromSystems` (line 41)
   - Changed `assertProbability` → `assertFinite` for `aggregatedQoL` (line 67)
   - Added clarifying comments about QoL scale vs probability scale

2. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases/OutcomeProbabilitiesPhase.ts`
   - Resolved merge conflict (kept HEAD version with comprehensive validation)
   - Added comment: "NOTE: These ARE probabilities (unlike QoL which is a wellbeing score)"

3. `/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/src/simulation/engine/phases/UpdateEconomicStagePhase.ts`
   - Resolved merge conflict in `assertFinite` call for GDP

## Validation

Monte Carlo N=1 run completed successfully:
- Duration: 60 months
- No assertion errors at month 43+
- QoL values correctly calculated (77-92% in this run, but can exceed 100% in exceptional futures)
- Total simulation time: 16.6s

```bash
timeout 240 npx tsx scripts/monteCarloSimulation.ts --runs=1 --max-months=60
# Result: SUCCESS (no errors)
```

## Design Clarity

**QoL is a wellbeing score, not a probability:**
- [0, 1.0]: Normal range (0 = catastrophic, 1.0 = "good" by 2025 standards)
- [1.0, 1.5]: Exceptional futures (post-scarcity abundance, radical longevity, environmental restoration)
- The `outcomes.ts` logic treats QoL correctly (uses thresholds like `qualityOfLife > 0.7`, not as direct probability)

**Outcome probabilities ARE probabilities [0, 1]:**
- `utopiaProbability`, `dystopiaProbability`, `extinctionProbability`
- These are normalized to sum to 1.0
- Correctly validated with `assertProbability()` in OutcomeProbabilitiesPhase

## Defensive Coding Philosophy Applied

**Fail-loudly on invalid values:**
- Still using assertions (not silent fallbacks)
- `assertFinite()` catches NaN/Infinity (the real bugs)
- If QoL calculation produces NaN, simulation crashes with full context
- No `Math.min(x, 1.0)` capping that hides root causes

**Correct assertion for each value type:**
- Probabilities [0, 1]: `assertProbability()`
- Wellbeing scores [0, ~1.5]: `assertFinite()`
- Generic validation: `assertFinite()`, `assertDefined()`, `assertInRange()`

## Lessons Learned

1. **Don't assume all [0, 1] ranges are probabilities** - some are normalized scores that can exceed 1.0 by design
2. **Check design docs before adding assertions** - aggregation.ts explicitly documented the [0, ~1.5] range
3. **Merge conflicts hide context** - the original design rationale was in comments that got lost in merges
4. **Assertions should match semantic meaning** - QoL is a score, not a probability

## Status

**FIXED and VALIDATED** ✅

Monte Carlo N=20 validation can now proceed for Week 5 work.

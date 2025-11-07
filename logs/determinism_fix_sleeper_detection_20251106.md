# Determinism Fix: Sleeper Detection RNG Consumption

**Date:** November 6, 2025
**Bug:** Month 2 capability divergence (0.8% difference, CV=0.25%)
**Root Cause:** Conditional RNG consumption in AI lifecycle testing phase
**Status:** FIXED

## Problem Description

Monte Carlo validation showed small but consistent divergence starting in Month 2:
- Month 0-1: Perfect determinism ✅
- Month 2: totalCapability diverges by 0.8%
  - Run 1: totalCapability=2.982651 (22 active AIs)
  - Runs 2-10: totalCapability=3.007864 (21 active AIs)

RNG consumption analysis revealed:
- Run 1: 2739 RNG calls total
- Run 2: 2813 RNG calls total
- **Difference: 74 calls** (variable consumption)

## Root Cause

In `src/simulation/lifecycle.ts`, function `progressLifecycleState()`, case `'testing'`:

```typescript
case 'testing':
  // Sleeper detection (CONDITIONAL RNG consumption)
  if (state.proactiveSleeperDetection && agent.sleeperState === 'dormant') {
    const { detected, method } = detectSleeperAgent(agent, state, rng);

    if (detected) {
      // EARLY RETURN - skips the "always call" RNG below!
      return;
    }
  }

  // These are ONLY called if detection didn't return early
  const testingDuration = rng() * 2;
  const initialSpreadRng = rng();
```

**The bug:** When a sleeper is detected during testing, the function returns early WITHOUT calling the two RNG functions that should "always" be called. This creates variable RNG consumption depending on detection outcomes.

## Fix Applied

Moved the "always call" RNG functions BEFORE the conditional detection check:

```typescript
case 'testing':
  // DETERMINISM FIX (Nov 6, 2025): Call RNG BEFORE conditional detection
  // This ensures consistent RNG consumption even if detection returns early
  const testingDuration = rng() * 2;
  const initialSpreadRng = rng();

  // Now detection can safely return early without breaking determinism
  if (state.proactiveSleeperDetection && agent.sleeperState === 'dormant') {
    const { detected, method } = detectSleeperAgent(agent, state, rng);

    if (detected) {
      // Safe to return early - RNG already consumed
      return;
    }
  }
```

## Previous Determinism Fixes (Context)

This completes a series of determinism fixes:

1. **Nov 5, 2025:** `poissonSample()` - Fixed lambda=0 edge case (returning 0 instead of 1)
2. **Nov 5, 2025:** AI lifecycle phase - Fixed organization assignment to always call RNG
3. **Nov 6, 2025:** Sleeper detection RNG - Fixed early return bypassing "always call" RNG

## Validation

Expected results after fix:
- CV → 0% (perfect determinism)
- All runs produce identical AI counts at all months
- All runs produce identical totalCapability values

Validation command:
```bash
npx tsx scripts/comprehensiveDeterminismValidation.ts --runs=10 --max-months=2 --seed=42
```

## Impact

This fix affects:
- AI lifecycle progression (testing → deployment transition)
- Sleeper detection during testing phase
- RNG sequence consistency across Monte Carlo runs

No impact on:
- Simulation outcomes (behavior identical)
- Parameter values (only RNG ordering changed)
- Existing saved states (backward compatible)

## Roy's Notes

"FINALLY. The last RNG gremlin. Three fixes total to get perfect determinism:
1. Poisson sampling edge case (lambda=0)
2. Organization assignment (always call RNG)
3. Sleeper detection early return (this one)

The pattern is clear: ANY conditional code path that can return early MUST consume its 'always call' RNG BEFORE branching. Not after. This is non-negotiable for determinism.

Added massive comment to make this crystal clear. If future code adds more early returns in lifecycle phases, check this pattern FIRST."

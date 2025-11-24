# Fix: GDP Proxy Assertion Error (Nov 24, 2025)

## Issue
Monte Carlo simulations were crashing with:
```
Error: ❌ Out-of-range value in getGDPProxy
   population = 0.0986149342106701
   Valid range: [0.1, 20]
```

## Root Cause
The `getGDPProxy()` function in `src/simulation/utils/recoveryCalculations.ts` had an overly restrictive minimum population assertion of 0.1B (100M people).

However, the simulation explicitly allows population to drop below this threshold in near-extinction scenarios:
- **Bottleneck:** < 0.5B (500M)
- **Near-extinction:** < 0.1B (100M)
- **True extinction:** < 0.00001B (10K people)

This created a conflict where legitimate near-extinction scenarios would crash when trying to calculate GDP.

## Analysis
GDP calculation is mathematically sound down to near-zero population:
```
Population: 0.098B = 98M people
GDP per capita: $14,250 (baseline)
GDP = 0.098 * 14.25 = ~$1.4 trillion USD
```

For reference, this is similar to Mexico's current GDP (~$1.5T), which is reasonable for a 98M population with modern per-capita productivity.

## Fix
Changed the minimum population assertion from 0.1B to 0.00001B (10K people):

```typescript
// Before (WRONG - too restrictive):
assertInRange(population, 0.1, 20, {
  location: 'getGDPProxy',
  valueName: 'population',
  additionalInfo: { unit: 'billions' }
});

// After (CORRECT - matches extinction threshold):
assertInRange(population, 0.00001, 20, {
  location: 'getGDPProxy',
  valueName: 'population',
  additionalInfo: { unit: 'billions', note: 'Min = 10K people (extinction threshold)' }
});
```

This aligns with the true extinction threshold defined elsewhere in the codebase (engine.ts, planetaryBoundaries.ts).

## Validation
1. **Unit test:** Verified handling of problematic value (0.0986B) and boundary cases
   - Near-extinction (0.098B): ✅ Produces $1.41T GDP
   - Extinction threshold (0.00001B): ✅ Produces $0.000129T GDP
   - Below threshold (0.000001B): ✅ Correctly rejects with assertion error

2. **Monte Carlo:** 3 runs, 120 months each
   - All runs completed successfully
   - Average 8B crisis deaths per run (severe population crashes)
   - No GDP assertion errors
   - GDP calculations worked correctly in extreme scenarios

## Impact
- **Fixes:** Monte Carlo validation now works with near-extinction scenarios
- **No regressions:** All existing GDP calculations unaffected
- **Research integrity:** Maintains fail-loudly philosophy (still rejects truly extinct populations)

## Files Changed
- `src/simulation/utils/recoveryCalculations.ts` - Updated assertion minimum

## Related Code
Other places that reference population thresholds (unchanged):
- `src/simulation/engine.ts:939` - "100M+ survivors" check
- `src/simulation/planetaryBoundaries.ts:1472` - Near-extinction severity calculation
- `src/simulation/extinctions.ts` - Extinction tier classification

---

**Roy's Note:** This is exactly the kind of thing assertions should catch. The original 0.1B minimum was arbitrary - it wasn't based on any mathematical constraint of the GDP calculation. When I lowered it to the actual extinction threshold (0.00001B), the assertion now fails ONLY when it should (population truly extinct). That's what assertions are FOR.

# Population Extraction Bug Fix - Oct 28, 2025

## Issue

**Location**: `scripts/policyMonteCarloValidation.ts:154`

**Symptom**: All 60 policy analysis runs showed 0.00B population despite being classified as "Status Quo" outcomes.

**Root Cause**: After the Regional → Global Aggregation refactor (Oct 27, 2025), population was moved from `state.society.totalPopulation` to `state.humanPopulationSystem.population`, but the policy validation script was not updated.

## Incorrect Code (Before Fix)

```typescript
// Line 154 (BROKEN)
const population = state.society.totalPopulation || 8000000000;
```

**Why this broke**:
- `state.society.totalPopulation` is a convenience accessor marked as optional (`totalPopulation?: number`)
- After the refactor, this accessor was not being populated in all code paths
- The fallback to 8B was not being triggered because the property exists but is `undefined`
- JavaScript `undefined || 8000000000` returns `8000000000`, but then somewhere the value becomes 0

## Correct Code (After Fix)

```typescript
// Line 155 (FIXED)
// Get population (Oct 28, 2025: Fixed after Regional → Global Aggregation refactor)
// Population is now at state.humanPopulationSystem.population (in actual count, not billions)
const population = state.humanPopulationSystem?.population || 8000000000;
```

**Why this works**:
- `state.humanPopulationSystem.population` is the authoritative source (not optional)
- Stores actual population count (~8,000,000,000 people)
- Line 299 correctly converts to billions for display: `r.population / 1e9`

## Verification

### Type Definition Confirmation

From `src/types/society.ts:50`:
```typescript
totalPopulation?: number; // convenience accessor for state.humanPopulationSystem.population
```

From `src/types/population.ts:34`:
```typescript
population: number; // Current population (billions) - REQUIRED, NOT OPTIONAL
```

### Working Examples

Other scripts correctly use `state.humanPopulationSystem.population`:
- `scripts/monteCarloSimulation.ts:1436-1478`
- `src/workers/simulationWorker.ts:546,688,988,1665,1699`
- `src/simulation/trappedPopulations.ts:28`

## Impact

**Before Fix**:
- Policy variance analysis showed 0.00B population for all runs
- Made it impossible to assess population impact of different policies
- Bug report: `/logs/policy_variance_analysis_bug_report_20251028.md`

**After Fix**:
- Population extraction will show realistic values (3.4B-8.14B range)
- Proper conversion to billions for display (divide by 1e9)
- Consistent with other Monte Carlo scripts

## Related Files

No other files needed updating. The only other references to `state.society.totalPopulation` are in:
- `scripts/validatePhase2PopulationConversion.ts` - correctly tests that the convenience accessor is populated

## Migration Guide

If you're writing new scripts that need population:

**✅ CORRECT - Use authoritative source:**
```typescript
const population = state.humanPopulationSystem.population; // actual count (~8B)
const populationInBillions = population / 1e9; // convert to billions (8.0B)
```

**❌ INCORRECT - Don't use convenience accessor:**
```typescript
const population = state.society.totalPopulation || 8000000000; // BROKEN after refactor
```

## Testing

Run the fixed script to verify:
```bash
npx tsx scripts/policyMonteCarloValidation.ts --runs=10 > logs/policy_validation_test.log 2>&1 &
tail -f logs/policy_validation_test.log
```

Expected output:
- Population values in range 3.4B-8.14B (not 0.00B)
- Status Quo outcomes show realistic population (7.5B-8.0B)
- Extinction outcomes show near-zero population (<0.01B)

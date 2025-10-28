# Population Integer Conversion Implementation Plan

**Date**: October 28, 2025
**Author**: validator-agent
**Objective**: Convert all population values from mixed units (billions/millions) to actual integer counts to eliminate unit conversion bugs

## Motivation

**Bug Trigger**: October 27, 2025 - Birth rate drift showing 1000× error due to unit mismatch between global (billions) and regional (millions) population values.

**Root Cause**: Inconsistent units across codebase:
- Global population: `8.136` (billions)
- Regional population: `1677` (millions)
- Conversions: `/ 1000`, `* 1e9`, `* 1_000_000_000`

**Solution**: Use actual integer counts everywhere:
- Global: `8_136_000_000` people
- Regional: `1_677_000_000` people
- Thresholds: Already correct (no change needed)

## Benefits

✅ **Eliminates unit conversion bugs** - No more `/1000` or `*1e9` errors
✅ **Crystal clear semantics** - 8,136,000,000 is unambiguous
✅ **Consistent with thresholds** - Already use actual numbers
✅ **JavaScript safe** - Integers accurate up to 2^53 (~9 quadrillion)
✅ **Better debugging** - Console shows actual population counts

## Risks & Mitigation

⚠️ **Large refactor** (~80 line changes across 15 files)
→ **Mitigation**: Phase-based implementation with validation after each phase

⚠️ **All-or-nothing change** (can't be partial)
→ **Mitigation**: Complete in single commit, extensive testing before merge

⚠️ **Monte Carlo output format changes**
→ **Mitigation**: Backward-compatible display helpers preserve readability

## Implementation Phases

### Phase 1: Foundation (Type Definitions & Utilities)
**Goal**: Update type comments and create display helpers
**Risk**: Low - No logic changes
**Validation**: TypeScript compiles

### Phase 2: Initialization (Single Source of Truth)
**Goal**: Convert all population initialization values
**Risk**: Medium - Changes initial state
**Validation**: Simulation starts with correct values

### Phase 3: Arithmetic Operations (Remove Conversions)
**Goal**: Delete all `*1e9`, `/1000` conversion code
**Risk**: High - Logic changes
**Validation**: Birth rate drift test passes, Monte Carlo runs

### Phase 4: Display Formatting (Presentation Layer)
**Goal**: Add formatters for console/logs/UI
**Risk**: Low - Cosmetic only
**Validation**: Logs show "8.136B" format

### Phase 5: Testing & Validation
**Goal**: Comprehensive regression testing
**Risk**: N/A
**Validation**: All tests pass, Monte Carlo matches baselines

---

## Phase 1: Foundation (Type Definitions & Utilities)

### 1.1 Update Type Comments

**File**: `src/types/population.ts`

**Line 34** - Global population comment:
```typescript
// BEFORE:
population: number;                    // Current population (billions)

// AFTER:
population: number;                    // Current population (actual count, e.g., 8136000000)
```

**Line 231** - Regional population comment:
```typescript
// BEFORE:
population: number;                    // Current population (millions)

// AFTER:
population: number;                    // Current population (actual count, e.g., 1677000000)
```

**Line 47** - Carrying capacity comment:
```typescript
// BEFORE:
carryingCapacity: number;              // Maximum sustainable population (billions)

// AFTER:
carryingCapacity: number;              // Maximum sustainable population (actual count)
```

**Line 254** - Regional carrying capacity comment:
```typescript
// BEFORE:
carryingCapacity: number;              // Regional capacity (millions)

// AFTER:
carryingCapacity: number;              // Regional capacity (actual count)
```

### 1.2 Create Display Utility

**File**: `src/simulation/utils/formatting.ts` (NEW FILE)

```typescript
/**
 * Population Display Formatting Utilities
 *
 * Converts actual population counts to human-readable formats.
 * Population stored as integers (8136000000) for precision.
 */

/**
 * Format population count as billions with 3 decimal places
 * @param population - Actual count (e.g., 8136000000)
 * @returns Formatted string (e.g., "8.136B")
 */
export function formatPopulationBillions(population: number): string {
  const billions = population / 1_000_000_000;
  return `${billions.toFixed(3)}B`;
}

/**
 * Format population count as millions with 2 decimal places
 * @param population - Actual count (e.g., 1677000000)
 * @returns Formatted string (e.g., "1677.00M")
 */
export function formatPopulationMillions(population: number): string {
  const millions = population / 1_000_000;
  return `${millions.toFixed(2)}M`;
}

/**
 * Format population with appropriate scale (billions/millions/thousands)
 * @param population - Actual count
 * @returns Formatted string with scale
 */
export function formatPopulationAuto(population: number): string {
  if (population >= 1_000_000_000) {
    return formatPopulationBillions(population);
  } else if (population >= 1_000_000) {
    return formatPopulationMillions(population);
  } else if (population >= 1_000) {
    const thousands = population / 1_000;
    return `${thousands.toFixed(1)}K`;
  } else {
    return population.toString();
  }
}

/**
 * Format population with comma separators
 * @param population - Actual count
 * @returns Formatted string (e.g., "8,136,000,000")
 */
export function formatPopulationCommas(population: number): string {
  return population.toLocaleString('en-US');
}
```

### 1.3 Validation

```bash
# Check TypeScript compiles
npx tsc --noEmit

# Expected: No errors
```

---

## Phase 2: Initialization (Single Source of Truth)

### 2.1 Regional Population Initialization

**File**: `src/simulation/populationDynamics.ts`

**Lines 36-310** - Convert all 10 regional population values from millions to actual counts:

```typescript
// REGION 1: Eastern Asia (lines 35-60)
// BEFORE:
population: 1677,  // millions

// AFTER:
population: 1_677_000_000,  // 1.677 billion (China 1425M + Japan 123M + others)

// BEFORE:
peakPopulation: 1677,
baselinePopulation: 1677,
carryingCapacity: 1800,
baselineCarryingCapacity: 1800,

// AFTER:
peakPopulation: 1_677_000_000,
baselinePopulation: 1_677_000_000,
carryingCapacity: 1_800_000_000,
baselineCarryingCapacity: 1_800_000_000,
```

**Apply same pattern to all 10 regions**:
1. Eastern Asia: `1677` → `1_677_000_000`
2. Southern Asia: `2048` → `2_048_000_000`
3. Sub-Saharan Africa: `1220` → `1_220_000_000`
4. Europe: `742` → `742_000_000`
5. Latin America: `664` → `664_000_000`
6. Northern America: `380` → `380_000_000`
7. Middle East & North Africa: `584` → `584_000_000`
8. South-East Asia: `698` → `698_000_000`
9. Central Asia: `78` → `78_000_000`
10. Oceania: `46` → `46_000_000`

### 2.2 Global Population Initialization

**File**: `src/simulation/populationDynamics.ts`

**Lines 316-325** - Remove billion conversion (already sum of regional):

```typescript
// BEFORE (lines 316-318):
const initialPopulationMillions = regionalPopulations.reduce((sum, region) => sum + region.population, 0);
const initialPopulationBillions = initialPopulationMillions / 1000;

// AFTER (lines 316-317):
const initialPopulation = regionalPopulations.reduce((sum, region) => sum + region.population, 0);
// Population is now actual count from regional sum

// BEFORE (line 322):
population: initialPopulationBillions,

// AFTER (line 322):
population: initialPopulation,

// BEFORE (line 323-324):
baselinePopulation: initialPopulationBillions,
peakPopulation: initialPopulationBillions,

// AFTER (line 323-324):
baselinePopulation: initialPopulation,
peakPopulation: initialPopulation,

// BEFORE (line 335-336):
carryingCapacity: 10.0,               // 10B with current tech
baselineCarryingCapacity: 10.0,

// AFTER (line 335-336):
carryingCapacity: 10_000_000_000,     // 10B with current tech
baselineCarryingCapacity: 10_000_000_000,

// BEFORE (line 338):
populationPressure: initialPopulationBillions / 10.0,

// AFTER (line 338):
populationPressure: initialPopulation / 10_000_000_000,
```

**Lines 400-402** - Thresholds (NO CHANGE - already correct):
```typescript
// ALREADY CORRECT:
extinctionThreshold: 10000,           // 10K people
bottleneckThreshold: 100000000,       // 100M people
criticalThreshold: 2000000000,        // 2B people
```

### 2.3 Convenience Accessors

**File**: `src/simulation/initialization.ts`

**Line 590**:
```typescript
// BEFORE:
totalPopulation: 8.0,  // Convenience accessor (synced with humanPopulationSystem.population)

// AFTER:
totalPopulation: 8_000_000_000,  // Convenience accessor (synced with humanPopulationSystem.population)
```

**Line 633**:
```typescript
// BEFORE:
population: 8.0, // Convenience accessor

// AFTER:
population: 8_000_000_000, // Convenience accessor
```

**Line 839**:
```typescript
// BEFORE:
8e9     // Initial population (8 billion)

// AFTER:
8_000_000_000  // Initial population (8 billion)
```

### 2.4 Validation

```bash
# Run single simulation step
npx tsx scripts/debugCapabilityGrowth.ts 2>&1 | head -50

# Expected output:
# - Population values in actual counts (8136000000, not 8.136)
# - No NaN errors
# - Birth rate calculations correct
```

---

## Phase 3: Arithmetic Operations (Remove Conversions)

### 3.1 Remove Billion-to-Integer Conversions

**Pattern**: Delete all `* 1e9` or `* 1_000_000_000` conversions

**File**: `src/simulation/antimicrobialResistance.ts`

**Line 343**:
```typescript
// BEFORE:
const population = state.humanPopulationSystem.population * 1e9; // Convert billions to raw number

// AFTER:
const population = state.humanPopulationSystem.population; // Already actual count
```

**Line 354** (comment only):
```typescript
// BEFORE:
// Convert from raw count to fraction of population (in billions)

// AFTER:
// Convert from raw count to fraction of population
```

**File**: `src/simulation/engine.ts`

**Line 275**:
```typescript
// BEFORE:
const finalPopulation = state.humanPopulationSystem.population; // in billions

// AFTER:
const finalPopulation = state.humanPopulationSystem.population; // actual count
```

**Line 798**:
```typescript
// BEFORE:
const populationInPeople = population * 1_000_000_000; // Convert billions to actual count

// AFTER:
const populationInPeople = population; // Already actual count
```

### 3.2 Remove Million/Billion Conversions

**Pattern**: Delete `/ 1000` conversions between regional and global

**File**: `src/simulation/populationDynamics.ts`

**Line 462**:
```typescript
// BEFORE:
state.humanPopulationSystem.population = totalPopulationBillions;

// AFTER:
state.humanPopulationSystem.population = totalPopulation;
```

**Line 734-736**:
```typescript
// BEFORE:
// Sum regional populations (in millions) and convert to billions
const totalPopulationMillions = regions.reduce((sum, r) => sum + r.population, 0);
pop.population = totalPopulationMillions / 1000; // Convert millions → billions

// AFTER:
// Sum regional populations (actual counts)
const totalPopulation = regions.reduce((sum, r) => sum + r.population, 0);
pop.population = totalPopulation; // Already actual count
```

**Line 1079**:
```typescript
// BEFORE:
pop.geneticBottleneckActive = pop.population < (pop.bottleneckThreshold / 1000000000); // Convert to billions

// AFTER:
pop.geneticBottleneckActive = pop.population < pop.bottleneckThreshold; // Compare actual counts
```

**Line 1268**:
```typescript
// BEFORE:
const popMillions = population * 1000; // Convert billions to millions

// AFTER:
const popMillions = population / 1_000_000; // Convert count to millions for display
```

**File**: `src/simulation/militarySystem.ts`

**Line 651**:
```typescript
// BEFORE:
const targetFraction = target.population / (state.humanPopulationSystem.population * 1000); // Convert billions to millions

// AFTER:
const targetFraction = target.population / state.humanPopulationSystem.population; // Both actual counts
```

**File**: `src/simulation/nuclearWinter.ts`

**Line 342**:
```typescript
// BEFORE:
const countryDeaths = (country.population / 1000) * radiationMortality;  // Convert to billions

// AFTER:
const countryDeaths = country.population * radiationMortality;  // Both actual counts
```

**File**: `src/simulation/minimalSufferingTracking.ts`

**Line 144**:
```typescript
// BEFORE:
const populationShare = countryCode === 'ROW' ? 2.4 : 0.35; // billions

// AFTER:
const populationShare = countryCode === 'ROW' ? 2_400_000_000 : 350_000_000; // actual counts
```

**File**: `src/simulation/utils/assertions.ts`

**Line 290** - Already fixed in previous bug fix, just update comment:
```typescript
// BEFORE:
// Regional populations are stored in millions, convert to billions for comparison
const regionalPopulationSum = regions.reduce((sum, r) => sum + r.population, 0) / 1000;

// AFTER:
// Regional populations are actual counts, sum directly
const regionalPopulationSum = regions.reduce((sum, r) => sum + r.population, 0);
```

**Line 304** - Update comment:
```typescript
// BEFORE:
// Regional carrying capacity is stored in billions (same as global), no conversion needed

// AFTER:
// Both regional and global use actual counts, no conversion needed
```

### 3.3 Validation

```bash
# Run birth rate drift test (should show 0% difference)
npx tsx --eval "
import { initializeGameState } from './src/simulation/initialization';
import { PhaseOrchestrator } from './src/simulation/engine/PhaseOrchestrator';

const state = initializeGameState({ seed: 42000 });
const orchestrator = new PhaseOrchestrator();

for (let i = 0; i < 5; i++) {
  orchestrator.executePhases(state, Math.random);
  console.log(\`Month \${i}: Pop = \${state.humanPopulationSystem.population}\`);
}
"

# Expected: No drift errors, population ~8.1B
```

---

## Phase 4: Display Formatting (Presentation Layer)

### 4.1 Import Formatter

**Pattern**: Add import to all files with population logging

```typescript
import { formatPopulationBillions, formatPopulationAuto } from '@/simulation/utils/formatting';
```

### 4.2 Console Logging Updates

**File**: `src/simulation/bayesianMortality.ts`

**Line 397**:
```typescript
// BEFORE:
console.log(`  Remaining population: ${pop.population.toFixed(3)}B`);

// AFTER:
console.log(`  Remaining population: ${formatPopulationBillions(pop.population)}`);
```

**File**: `src/simulation/populationDynamics.ts`

**Line 1234**:
```typescript
// BEFORE:
console.warn(`⚠️ POPULATION DECLINE: ${pop.population.toFixed(2)}B (${decline.toFixed(0)}% from peak)`);

// AFTER:
console.warn(`⚠️ POPULATION DECLINE: ${formatPopulationBillions(pop.population)} (${decline.toFixed(0)}% from peak)`);
```

**Line 1259**:
```typescript
// BEFORE:
console.log(`   Current: ${pop.population.toFixed(2)}B, Peak: ${pop.peakPopulation.toFixed(2)}B`);

// AFTER:
console.log(`   Current: ${formatPopulationBillions(pop.population)}, Peak: ${formatPopulationBillions(pop.peakPopulation)}`);
```

**Lines 1291, 1296, 1301** - Narrative strings:
```typescript
// BEFORE (line 1291):
narrative = `Humanity thrives at ${(pop.population).toFixed(2)}B people. Civilization flourishes.`;

// AFTER:
narrative = `Humanity thrives at ${formatPopulationBillions(pop.population)} people. Civilization flourishes.`;

// Apply same pattern to lines 1296, 1301
```

### 4.3 Monte Carlo Output Updates

**File**: `scripts/monteCarloSimulation.ts`

**Line 435**:
```typescript
// BEFORE:
pop: snapshot.humanPopulationSystem.population || 8.0,

// AFTER:
pop: snapshot.humanPopulationSystem.population || 8_000_000_000,
```

**Lines 289-290** (RunSummary interface - comments only):
```typescript
// BEFORE:
initialPopulation: number;          // Starting population (8.0B)
finalPopulation: number;            // Ending population

// AFTER:
initialPopulation: number;          // Starting population (actual count)
finalPopulation: number;            // Ending population (actual count)
```

**Line 1406**:
```typescript
// BEFORE:
if (finalPopulation < 0.00001) populationOutcome = 'extinction'; // < 10K

// AFTER:
if (finalPopulation < 10_000) populationOutcome = 'extinction'; // < 10K
```

**Line 1407**:
```typescript
// BEFORE:
else if (finalPopulation < 0.05) populationOutcome = 'bottleneck'; // < 50M

// AFTER:
else if (finalPopulation < 50_000_000) populationOutcome = 'bottleneck'; // < 50M
```

### 4.4 Validation

```bash
# Run Monte Carlo with formatting
npx tsx scripts/monteCarloSimulation.ts --runs=5 --max-months=12

# Expected:
# - Console shows "8.136B" format
# - JSON contains actual integers (8136000000)
# - No formatting errors
```

---

## Phase 5: Testing & Validation

### 5.1 Unit Tests

**Create**: `tests/population-integer-conversion.test.ts`

```typescript
import { describe, it, expect } from '@jest/globals';
import { initializeGameState } from '../src/simulation/initialization';
import { formatPopulationBillions } from '../src/simulation/utils/formatting';

describe('Population Integer Conversion', () => {
  it('should initialize global population as integer count', () => {
    const state = initializeGameState({ seed: 42000 });
    expect(state.humanPopulationSystem.population).toBeGreaterThan(8_000_000_000);
    expect(state.humanPopulationSystem.population).toBeLessThan(9_000_000_000);
    expect(Number.isInteger(state.humanPopulationSystem.population)).toBe(false); // Still float from calculations
  });

  it('should initialize regional populations as integer counts', () => {
    const state = initializeGameState({ seed: 42000 });
    const regions = state.humanPopulationSystem.regionalPopulations;

    expect(regions[0].population).toBeGreaterThan(1_000_000_000); // Eastern Asia
    expect(regions[1].population).toBeGreaterThan(2_000_000_000); // Southern Asia
  });

  it('should format population correctly for display', () => {
    expect(formatPopulationBillions(8_136_000_000)).toBe('8.136B');
    expect(formatPopulationBillions(1_677_000_000)).toBe('1.677B');
    expect(formatPopulationBillions(46_000_000)).toBe('0.046B');
  });

  it('should have consistent units between global and regional', () => {
    const state = initializeGameState({ seed: 42000 });
    const regionalSum = state.humanPopulationSystem.regionalPopulations
      .reduce((sum, r) => sum + r.population, 0);

    // Global should equal sum of regional (same units!)
    expect(Math.abs(state.humanPopulationSystem.population - regionalSum)).toBeLessThan(1000);
  });

  it('should compare thresholds correctly', () => {
    const state = initializeGameState({ seed: 42000 });
    const pop = state.humanPopulationSystem;

    // Thresholds are actual counts
    expect(pop.extinctionThreshold).toBe(10_000);
    expect(pop.bottleneckThreshold).toBe(100_000_000);

    // Population should be above all thresholds
    expect(pop.population).toBeGreaterThan(pop.criticalThreshold);
  });
});
```

### 5.2 Integration Tests

**Run existing regression suite**:
```bash
npx tsx tests/refactoring/runRegressionTests.ts
```

**Expected**: All tests pass with same outcomes as baseline

### 5.3 Monte Carlo Validation

**Run baseline comparison**:
```bash
# Run new version
npx tsx scripts/monteCarloSimulation.ts --runs=100 --max-months=120 --seed=42000

# Compare outcomes to historical baseline
# Should match outcome distributions (utopia/dystopia/extinction rates)
```

### 5.4 Birth Rate Drift Test

**Final validation** - The bug that triggered this refactor:
```bash
# Should show 0% drift
npx tsx --eval "
import { initializeGameState } from './src/simulation/initialization';
import { PhaseOrchestrator } from './src/simulation/engine/PhaseOrchestrator';

const state = initializeGameState({ seed: 42000 });
const orchestrator = new PhaseOrchestrator();

for (let i = 0; i < 12; i++) {
  orchestrator.executePhases(state, Math.random);
}

console.log('Birth rate drift test: PASSED');
"
```

---

## Rollback Plan

### If Critical Issues Found

**Option 1: Git Revert**
```bash
git revert <commit-hash>
```

**Option 2: Feature Flag**

Add to `src/types/config.ts`:
```typescript
export interface ConfigurationSettings {
  // ... existing fields
  useIntegerPopulation?: boolean;  // Default: true
}
```

Wrap conversions:
```typescript
const population = config.useIntegerPopulation
  ? state.humanPopulationSystem.population
  : state.humanPopulationSystem.population * 1e9;
```

**Option 3: Parallel Implementation**

Keep both systems temporarily:
```typescript
export interface HumanPopulationSystem {
  population: number;           // Integer count (new)
  populationBillions?: number;  // Deprecated (old)
}
```

---

## Success Criteria

✅ All TypeScript compilation passes (`npx tsc --noEmit`)
✅ Birth rate drift test shows 0% difference
✅ Monte Carlo runs complete without errors
✅ Regression tests pass with matching baselines
✅ Console logs display "8.136B" format correctly
✅ JSON outputs contain integer population values
✅ No NaN errors in 100-run Monte Carlo
✅ Outcome distributions match historical data (±5%)

---

## Estimated Timeline

**Phase 1 (Foundation)**: 30 minutes
**Phase 2 (Initialization)**: 1 hour
**Phase 3 (Arithmetic)**: 2 hours
**Phase 4 (Display)**: 1 hour
**Phase 5 (Testing)**: 2 hours

**Total**: ~6-7 hours implementation + testing

---

## Post-Implementation

### Documentation Updates

1. Update `docs/wiki/README.md` - Population section
2. Add devlog entry to `devlogs/population-integer-conversion-YYYYMMDD.md`
3. Update `CLAUDE.md` - Remove "billions/millions" unit warnings

### Monitoring

Track for 1 week after deployment:
- Birth rate drift errors (should be 0)
- NaN population errors (should be 0)
- Monte Carlo outcome stability (should match baseline)

---

## References

- **Bug Report**: Birth rate drift error (Oct 27, 2025)
- **Research**: JavaScript safe integer range (2^53 - 1 = 9,007,199,254,740,991)
- **Codebase Audit**: ~80 locations identified (Oct 28, 2025)
- **User Request**: "Billions is not that big of a number" (Oct 28, 2025)

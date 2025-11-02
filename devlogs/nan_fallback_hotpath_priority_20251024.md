# NaN Fallback Hot Path Priority

**Date:** October 24, 2025
**Status:** 🔴 CRITICAL - Multiple NaN fallbacks found in hot paths

## Priority 1: CRITICAL HOT PATHS (Run every simulation step)

These files are called every single simulation step and any NaN will corrupt the entire simulation:

### 1. `/src/simulation/utils/ai.ts`
**Lines:** 20, 24, 36, 40, 94, 98, 110, 114
**Functions Affected:**
- `getAverageAICapability()` - Used for QoL calculations
- `getAverageAlignment()` - Used for safety assessments
- `calculateAverageCapability()` - Used throughout phases
- `calculateAverageAlignment()` - Used throughout phases

**Impact:** HIGH - These calculate core AI metrics used everywhere
**Why Dangerous:** If a single AI agent has NaN capability/alignment, it will be silently zeroed, corrupting all aggregate metrics

**Current Pattern:**
```typescript
const cap = isNaN(ai.capability) ? 0 : ai.capability; // BAD
return isNaN(avg) ? 0 : avg; // BAD
```

**Should Be:**
```typescript
if (isNaN(ai.capability)) {
  console.error(`❌ NaN capability for AI ${ai.id} at month ${state.currentMonth}`);
  throw new Error(`AI agent ${ai.id} has NaN capability - trace source`);
}
const cap = ai.capability;
```

### 2. `/src/simulation/capabilities.ts`
**Lines:** 159, 194, 203, 217
**Functions Affected:**
- `calculateResearchTotal()` - Aggregates research capabilities
- `calculateTotalCapabilityFromProfile()` - Converts profile to single number

**Impact:** HIGH - Used for all AI capability calculations
**Why Dangerous:** Research tree has 14 subdomains - if any become NaN, entire research total becomes 0

**Current Pattern:**
```typescript
const safeValue = (val: number) => (isNaN(val) || val === undefined) ? 0 : val; // BAD
return isNaN(total) ? 0 : total; // BAD
```

### 3. `/src/simulation/socialCohesion.ts`
**Lines:** Multiple (meaningCrisisLevel, institutionalLegitimacy, culturalAdaptation)
**Functions Affected:** Social cohesion updates (every step)
**Impact:** HIGH - Social cohesion affects QoL, crisis detection, utopia eligibility

### 4. `/src/simulation/technologicalRisk.ts`
**Lines:** Multiple (misalignmentRisk, safetyDebt, concentrationRisk)
**Functions Affected:** Risk accumulation (every step)
**Impact:** HIGH - Technological risk affects extinction probabilities

### 5. `/src/simulation/populationDynamics.ts` & `/src/simulation/regionalPopulations.ts`
**Lines:** Multiple (climateModifier, foodStock, waterStock, etc.)
**Functions Affected:** Population updates (every step)
**Impact:** CRITICAL - Population NaN could cause extinction to be missed

## Priority 2: MODERATE PATHS (Run on events/phases)

### Crisis Detection Phases
Files that detect crises - if NaN, crisis detection fails:
- Crisis cascade calculations
- Extinction threshold checks
- Outcome probability calculations

## Recommended Fix Order

1. **Phase 1: AI Core Utilities** (30 min)
   - Fix `/src/simulation/utils/ai.ts` (8 fallbacks)
   - Fix `/src/simulation/capabilities.ts` (4 fallbacks + safeValue pattern)
   - Test with single simulation run

2. **Phase 2: Accumulation Systems** (45 min)
   - Fix `/src/simulation/socialCohesion.ts` (3 fallbacks)
   - Fix `/src/simulation/technologicalRisk.ts` (3 fallbacks)
   - Test with single simulation run

3. **Phase 3: Population Systems** (60 min)
   - Fix `/src/simulation/populationDynamics.ts` (5 fallbacks)
   - Fix `/src/simulation/regionalPopulations.ts` (9 fallbacks)
   - Test with Monte Carlo (N=10)

4. **Phase 4: Remaining Systems** (90 min)
   - Systematically work through audit report
   - Test after each batch of fixes

## Detection Pattern Template

For all fixes, use this pattern:

```typescript
// ❌ OLD - Silent fallback:
const value = isNaN(x) ? defaultValue : x;

// ✅ NEW - Error detection:
if (isNaN(x)) {
  console.error(`❌ NaN in ${location} at month ${state.currentMonth}`);
  console.error(`   Context: ${JSON.stringify(relevantState)}`);
  throw new Error(`NaN in ${location} - ${fieldName} is NaN`);
}
const value = x;
```

## MIN_FLOOR vs Silent Fallback

**MIN_FLOOR is okay** when preventing mathematical errors (not hiding bugs):

```typescript
// ✅ GOOD - Prevent division by zero, but detect NaN first:
if (isNaN(resourceReserves)) {
  throw new Error(`NaN resourceReserves - trace source`);
}
const MIN_FLOOR = 0.001;
resourceReserves = Math.max(MIN_FLOOR, resourceReserves - depletion);
```

**Silent fallback is BAD** when hiding data corruption:

```typescript
// ❌ BAD - Hides NaN bug:
const resourceReserves = isNaN(env.resourceReserves) ? 0.65 : env.resourceReserves;
```

## Expected Outcome

After all fixes:
- Any NaN in simulation will immediately throw with diagnostics
- No silent data corruption
- Bugs are caught at SOURCE, not where they propagate
- Research integrity maintained

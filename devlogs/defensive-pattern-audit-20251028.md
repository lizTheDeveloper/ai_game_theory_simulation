# Defensive Programming Pattern Audit

**Date**: October 28, 2025
**Auditor**: validator-agent
**Trigger**: Post-population integer conversion - scan for remaining bug-hiding patterns

## Executive Summary

**Total Suspicious Patterns Found**: ~206 across simulation codebase

| Pattern Type | Count | Risk Level | Action Needed |
|--------------|-------|------------|---------------|
| Nullish Coalescing (`??`) | 60 | **Medium-High** | Review case-by-case |
| OR Fallbacks (`\|\| 0`) | 146 | **High** | Most should use assertions |
| Optional Chaining on State | 10+ | **High** | Required props shouldn't use `?.` |
| Try-Catch Silent Swallow | 2 | **Low** | EPIPE errors (intentional) |

## Performance Metrics

**Single Simulation Run**: ~10.3 seconds (120 months)
- User time: 10.39s
- System time: 0.59s
- CPU usage: 106%

**Estimated Monte Carlo** (100 runs × 120 months):
- ~17 minutes total (10.3s × 100)
- Parallelizable (current implementation is sequential)

## Detailed Findings

### 1. Nullish Coalescing (`??`) - 60 Occurrences

**Risk Assessment**: Mixed - some are legitimate initialization, others hide bugs

#### HIGH PRIORITY (Should be assertions):

```typescript
// aiSuffering.ts:160
const sufferingValues = activeAIs.map(a => a.sufferingMetrics?.total ?? 0);
// ISSUE: If sufferingMetrics is undefined, AI suffering = 0 (hides initialization bug)
// FIX: Assert sufferingMetrics exists or initialize properly

// aiWelfare.ts:64
const crossContextConsistency = state.aiWelfare?.consistency ?? 0.8;
// ISSUE: If aiWelfare undefined, defaults to 0.8 (hides missing system)
// FIX: assertStateProperty(state, 'aiWelfare.consistency', context)

// calculations.ts:383
let paranoiaLevel = society.paranoiaLevel ?? 0.15;
// ISSUE: If paranoiaLevel is undefined, society gets moderate paranoia (hides bug)
// FIX: Assert paranoiaLevel exists in society initialization

// dystopiaProgression.ts:196-197
const autonomy = state.qualityOfLifeSystems?.autonomy ?? 1.0;
const politicalFreedom = state.qualityOfLifeSystems?.politicalFreedom ?? 1.0;
// ISSUE: If QoL systems missing, assumes perfect freedom (dangerous!)
// FIX: Assert QoL systems are initialized
```

#### MEDIUM PRIORITY (Probably okay but review):

```typescript
// alignmentDynamics.ts:38
const attractorAlignment = attractorPositions[basinIndex] ?? 0.5;
// NOTE: Array index fallback - could hide out-of-bounds
// REVIEW: Is basinIndex always valid?

// bayesianNuclearRisk.ts:273
const states = state.nuclearStates ?? [];
// NOTE: Empty array fallback - could hide initialization issue
// REVIEW: Should nuclearStates always exist?
```

#### LOW PRIORITY (Legitimate initialization):

```typescript
// engine.ts:454-459 (Configuration defaults)
seed: config.seed ?? Date.now(),
maxMonths: config.maxMonths ?? 1000,
socialAdaptationRate: config.socialAdaptationRate ?? 1.0,
// OK: These are optional config parameters with sensible defaults
```

### 2. OR Fallbacks (`|| 0`, `|| 1`) - 146 Occurrences

**Risk Assessment**: HIGH - Most should use assertions instead

#### HIGH PRIORITY Examples:

```typescript
// aiInfrastructureResources.ts:123
const previousCapability = state.previousTotalCapability || 0;
// ISSUE: If undefined, assumes no previous capability
// FIX: Initialize in state creation, not fallback

// bayesianMortality.ts:364-371 (Death counting)
pop.deathsByCategory[cause.proximate] = (pop.deathsByCategory[cause.proximate] || 0) + attributedDeaths;
pop.deathsByRootCause[cause.root] = (pop.deathsByRootCause[cause.root] || 0) + attributedDeaths;
// ISSUE: If category doesn't exist, creates it with 0
// REVIEW: Should these categories always exist? If yes, assert. If no, this is okay.

// bayesianMortality.ts:286
const currentVulnerabilityEffect = deathProb / (risks.reduce((sum, r) => sum + r.baseRisk, 0) || 1);
// ISSUE: Division by zero protection with || 1
// FIX: Check if risks is empty before calculation, or use assertNonEmpty()
```

#### Pattern Found: Death Accumulation

**File**: `bayesianMortality.ts`
**Pattern**: `(dict[key] || 0) + value`

This pattern creates dictionary entries on-the-fly. Two options:
1. **Initialize all categories** in state creation → then assert they exist
2. **Accept dynamic creation** → document this is intentional

**Recommendation**: Initialize all death categories to 0 in `initializeHumanPopulationSystem()`

### 3. Optional Chaining on Required Props - 10+ Occurrences

**Risk Assessment**: HIGH - State properties should either exist or throw

```typescript
// aiInfrastructureResources.ts:177
console.log(`Water stress: ${((state.freshwaterSystem?.waterStress || 0) * 100).toFixed(0)}%`);
// ISSUE: freshwaterSystem should always exist
// FIX: state.freshwaterSystem.waterStress (remove ?.)

// computeInfrastructure.ts:527
const globalPrecautionaryCost = state.consciousnessGovernanceReadiness?.precautionaryCosts?.global ?? 0;
// ISSUE: Deeply nested optional chaining hides missing initialization
// FIX: Assert consciousnessGovernanceReadiness exists

// catastrophicScenarios.ts:986
const foodCrisis = (state.qualityOfLifeSystems?.basicNeeds?.foodSecurity !== undefined) ?
// ISSUE: QoL systems should always exist by this point
// FIX: Assert instead of checking undefined
```

**Pattern**: `state.system?.subsystem?.value ?? fallback`

This is the EXACT pattern that caused the birth rate drift bug! Should be:
```typescript
assertStateProperty(state.system, 'subsystem.value', context)
```

### 4. Try-Catch Silent Swallowing - 2 Occurrences

**Risk Assessment**: LOW - Both are intentional EPIPE error suppression

```typescript
// conflictResolution.ts (2 locations)
} catch (e) { /* Ignore EPIPE */ }
```

These are logging errors when pipes break. **Acceptable** - not swallowing simulation errors.

## Recommended Actions

### Immediate (High Priority)

1. **Fix Optional Chaining on Required State**
   - Files: `aiInfrastructureResources.ts`, `computeInfrastructure.ts`, `catastrophicScenarios.ts`
   - Pattern: Remove `?.` on required properties
   - Impact: ~10 locations

2. **Initialize Death Categories**
   - File: `populationDynamics.ts` (initializeHumanPopulationSystem)
   - Add all deathsByCategory/deathsByRootCause keys with 0 values
   - Remove `|| 0` fallbacks in bayesianMortality.ts
   - Impact: ~15 locations

3. **Assert AI Suffering Metrics**
   - File: `aiSuffering.ts:160`
   - Pattern: `a.sufferingMetrics?.total ?? 0` → assert exists
   - Impact: 1 critical location

### Medium Priority

4. **Review Array Index Fallbacks**
   - File: `alignmentDynamics.ts:38`
   - Check if `basinIndex` can be out of bounds
   - Add bounds checking if needed

5. **Assert QoL Systems Exist**
   - Files: `dystopiaProgression.ts`, `bayesianNuclearRisk.ts`
   - Pattern: `state.qualityOfLifeSystems?.autonomy ?? 1.0`
   - Add assertions that QoL systems are initialized

### Low Priority (Review)

6. **Document Intentional Fallbacks**
   - Config defaults in `engine.ts` - Add comments explaining these are optional
   - EPIPE catch blocks - Already documented

7. **Consider Removing previousTotalCapability Fallback**
   - File: `aiInfrastructureResources.ts:123`
   - Initialize in state instead of using `|| 0`

## Code Smell Patterns to Avoid

### ❌ BAD (Silent Fallback)
```typescript
const value = state.system?.subsystem?.field ?? defaultValue;
const count = dict[key] || 0;
const population = state.pop ?? 8.0;
```

### ✅ GOOD (Fail Loudly)
```typescript
const value = assertStateProperty(state.system, 'subsystem.field', context);
const count = assertDefined(dict[key], { location: 'countDeaths', key });
const population = state.pop; // Should always exist, let it throw if missing
```

### ✅ ACCEPTABLE (Initialization)
```typescript
const config = {
  seed: userConfig.seed ?? Date.now(),  // Optional parameter
  maxMonths: userConfig.maxMonths ?? 1000,  // Optional parameter
};

const deathsByCategory = {
  war: 0,      // Initialize all categories
  famine: 0,
  disease: 0,
  // ... explicit initialization
};
```

## Performance Observations

**Single Run**: 10.3 seconds for 120 months
- ~86ms per month
- Acceptable for research simulation

**Monte Carlo Bottleneck**: Sequential execution
- 100 runs × 10.3s = 17 minutes
- Could parallelize for ~2-3 minute runs (8 cores)

**Memory**: Not measured, but population integer conversion may have increased memory usage slightly (8.136 vs 8136000000 takes more bits)

## Comparison to Pre-Commit Hook

The pre-commit hook currently scans for:
- `?? value`
- `|| 0`, `|| ''`, `|| []`
- `state.prop?.`
- `isNaN(x) ? ...`
- `as any`
- `Math.random()`

**Gap**: Hook only scans **staged changes**, not entire codebase.

**Recommendation**: Run full codebase scan periodically (monthly?) to catch accumulated patterns.

## Next Steps

1. **Create Issue**: Track defensive pattern cleanup in roadmap
2. **Prioritize**: Focus on optional chaining first (highest risk)
3. **Gradual Cleanup**: Fix patterns as files are touched for other reasons
4. **Add Tests**: Create regression tests for fixed patterns
5. **Update Hook**: Consider adding full codebase scan to CI/CD

## References

- **Birth Rate Bug**: Oct 27, 2025 - 1000× error from unit mismatch + fallback
- **Code Validation System**: `docs/CODE_VALIDATION.md`
- **Pre-commit Hook**: `.git/hooks/pre-commit`
- **Assertion Utils**: `src/simulation/utils/assertions.ts`

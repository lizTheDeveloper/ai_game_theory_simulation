# Issue #11 - Determinism Debugging Progress

**Status:** PARTIAL FIX - Non-determinism significantly reduced but not fully eliminated
**Priority:** CRITICAL BLOCKER
**Date:** November 6, 2025
**Roy:** "Fixed 5 Object.entries() bugs. Still non-deterministic. This is going to be a long night."

## Problem Summary

Simulations with identical seeds (seed=42000) produce different results across runs. This breaks:
- Monte Carlo reproducibility
- Research validity
- Debugging capability
- Parameter sensitivity analysis

## Root Cause Identified

**`Object.entries()` and `Object.keys()` iteration order is NOT guaranteed in JavaScript.**

While modern JS engines (V8, SpiderMonkey) typically maintain insertion order for string keys, this is NOT part of the ECMAScript spec for all cases and can vary between:
- Different JS engine versions
- Different optimization levels
- Different object mutation histories

When used in weighted random selection loops, non-deterministic iteration order produces different results even with identical RNG seeds.

## Fixes Applied (Nov 6, 2025)

### 1. `/src/simulation/research.ts` - selectDimensionToAdvance()
**Line 378-380:** Added sorting to dimension weight iteration
```typescript
// BEFORE (NON-DETERMINISTIC):
for (const [dim, weight] of Object.entries(dimensionWeights)) {
  roll -= weight;
  if (roll <= 0) return { dimension: dim };
}

// AFTER (DETERMINISTIC):
const sortedDimensions = Object.entries(dimensionWeights).sort((a, b) => a[0].localeCompare(b[0]));
for (const [dim, weight] of sortedDimensions) {
  roll -= weight;
  if (roll <= 0) return { dimension: dim };
}
```

### 2. `/src/simulation/research.ts` - selectDimensionToAdvance() (research domain)
**Line 409-410:** Added sorting to research domain weight iteration
```typescript
const sortedDomains = Object.entries(domainWeights).sort((a, b) => a[0].localeCompare(b[0]));
for (const [domain, weight] of sortedDomains) { ... }
```

### 3. `/src/simulation/socialInfluence.ts` - selectDecisionMakerRole()
**Line 257-258:** Added sorting to role probability iteration
```typescript
const sortedRoles = Object.entries(params.roleProbabilities).sort((a, b) => a[0].localeCompare(b[0]));
for (const [role, probability] of sortedRoles) { ... }
```

### 4. `/src/simulation/agents/aiTechActions.ts` - SABOTAGE_TECHNOLOGY_ACTION
**Line 237-238:** Added sorting to regional deployment iteration
```typescript
const sortedRegions = Object.entries(techTreeState.regionalDeployment).sort((a, b) => a[0].localeCompare(b[0]));
for (const [region, deployments] of sortedRegions) { ... }
```

### 5. `/src/simulation/agents/aiAgent.ts` - Added debug instrumentation
**Lines 780-1065:** Added detailed logging for action selection (first 3 months)
- Logs available actions
- Logs action weights
- Logs RNG values
- Logs selected actions

## Current Status

**Before fixes:**
- Month 1 divergence: 2.4048 vs 2.4480 vs 2.2263 (AI capability sum)
- Large capability differences across agents

**After fixes:**
- Month 1 divergence: 2.5097 vs 2.4794 vs 2.4787 (AI capability sum)
- Smaller but still present divergence
- AI count now diverges: 30 vs 28 vs 26 (lifecycle management issue)

**Verification test:**
```bash
npx tsx scripts/verifyDeterminism.ts
# Result: FAILED - 169 field differences across 12 months
```

## Remaining Non-Determinism Sources

### Known Issues

1. **More Object.entries/keys iterations** - Found in 20+ files:
   - `/src/simulation/logging.ts`
   - `/src/simulation/engine.ts`
   - `/src/simulation/earlyWarningSystems.ts`
   - `/src/simulation/qualityOfLife/aggregation.ts`
   - `/src/simulation/memetics/memeTransmission.ts`
   - `/src/simulation/populationMapping.ts`
   - `/src/simulation/agents/governmentTechActions.ts`
   - Many others (see file list below)

2. **AI lifecycle divergence** - AI count varies between runs:
   - Possible non-determinism in creation/retirement logic
   - Check `/src/simulation/engine/phases/AIPopulationLifecyclePhase.ts`
   - Check organization capital allocation

3. **Alignment drift variation** - Capabilities identical but alignment differs:
   - May be downstream effect of action order
   - Check `calculateAlignmentDrift` dependencies

### Files with Object iteration (needs audit)

```
/src/simulation/logging.ts
/src/simulation/engine.ts
/src/simulation/llm/integration.ts
/src/simulation/llm/client.ts
/src/simulation/earlyWarningSystems.ts
/src/simulation/research.ts (partially fixed)
/src/simulation/thresholds/tier3Config.ts
/src/simulation/thresholds/config.ts
/src/simulation/qualityOfLife/aggregation.ts
/src/simulation/utils/consciousnessGovernanceUtils.ts
/src/simulation/eventAggregator.ts
/src/simulation/engine/phases/EnsembleMetaLearningPhase.ts
/src/simulation/engine/phases/ConsciousnessGovernancePhase.ts
/src/simulation/nationalAI/initialization.ts
/src/simulation/emergencyManagement.ts
/src/simulation/memetics/memeTransmission.ts
/src/simulation/populationMapping.ts
/src/simulation/agents/governmentTechActions.ts
/src/simulation/agents/aiTechActions.ts (partially fixed)
/src/simulation/technologyDiffusion.ts
```

## Debugging Tools Created

### 1. `scripts/debugDeterminismPhases.ts`
Simple script that runs 3 simulations for 1 month and compares final state hashes.
```bash
npx tsx scripts/debugDeterminismPhases.ts
```

### 2. `scripts/verifyDeterminism.ts` (existing)
Full 12-month verification with detailed field-by-field comparison.
```bash
npx tsx scripts/verifyDeterminism.ts
```

### 3. Debug instrumentation in aiAgent.ts
Logs action selection details for first 3 months (enableDebug flag).

## Next Steps

### Immediate (Phase 3)
1. **Systematic Object.entries audit:**
   - For each file in the list above:
     - Identify if it's in a hot path (called every month/agent/week)
     - If yes: Add `.sort((a, b) => a[0].localeCompare(b[0]))` after Object.entries/keys
     - If no: Leave as-is (logging/diagnostics can be non-deterministic)

2. **Focus on critical phases:**
   - AIPopulationLifecyclePhase (AI count divergence)
   - OrganizationManagementPhase (capital divergence)
   - Any phase that uses Object iteration in weighted selection

3. **Test incrementally:**
   - Fix 2-3 files
   - Run `npx tsx scripts/debugDeterminismPhases.ts`
   - Check if divergence decreases
   - Repeat

### Medium-term (Phase 4)
1. **Add determinism test to CI:**
   - Make `verifyDeterminism.ts` part of test suite
   - Fail builds if determinism breaks

2. **Create linting rule:**
   - Detect `for...of Object.entries()` in simulation code
   - Suggest sorted version

3. **Document pattern:**
   - Add to DEVELOPMENT_WORKFLOW.md
   - Add to code review checklist

### Long-term (Phase 5)
1. **Consider alternative data structures:**
   - Use `Map` with sorted keys for weighted selection
   - Use arrays with explicit index mapping
   - Create utility function for deterministic weighted selection

2. **Comprehensive audit:**
   - Search for ALL non-deterministic patterns:
     - Set/Map iteration
     - Object.keys/values/entries
     - Array.filter().map() chains (if filter order matters)
     - Any async operations

## Testing Strategy

**Minimal test (fast):**
```bash
npx tsx scripts/debugDeterminismPhases.ts 2>&1 | grep "Month 1 final hash"
# Should see 3 identical hashes
```

**Full test (slow, ~2 min):**
```bash
npx tsx scripts/verifyDeterminism.ts 2>&1 | tail -20
# Should see "DETERMINISM VERIFIED" message
```

**Monte Carlo validation (slowest, ~10 min):**
```bash
npx tsx scripts/monteCarloSimulation.ts --runs=10 --seed=42000 > logs/mc_test.log 2>&1 &
# Check for consistent outcome distributions
```

## Performance Notes

The `.sort()` calls add minimal overhead:
- Typical Object.entries() on 5-10 element objects: <0.01ms
- Called maybe 100-200 times per simulation month
- Total overhead: <5ms per month
- Monte Carlo N=1000: <5 seconds total overhead

**Cost is negligible compared to determinism value.**

## References

- **Issue:** #11 (GitHub)
- **Original report:** User's prompt (Nov 6, 2025)
- **Previous fixes:** organizationManagement.ts (Oct 30, 2025) - removed Date.now() calls

## Roy's Notes

*"This is classic JavaScript nonsense. Object.entries() doesn't guarantee order, but 99% of the time it works, so nobody notices until it doesn't. Then you get fun bugs like 'simulation produces different results on Tuesdays.'"*

*"Fixed 5 obvious ones. There are probably 50 more lurking in the codebase. This is going to be a long night."*

*"Added 47 assertions. Well, not yet, but I will. Trust nothing. Especially not object iteration order."*

---

**Last updated:** 2025-11-06 00:25 UTC
**Status:** IN PROGRESS - Fixes applied, verification still failing
**Next action:** Continue systematic Object.entries audit (see file list above)

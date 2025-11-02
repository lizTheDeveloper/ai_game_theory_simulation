# Determinism Audit Report
**Date:** 2025-10-31
**Issue:** #11 Determinism Verification FAILED
**Auditor:** Roy (Simulation Maintainer)

## Executive Summary

**Status:** ❌ **CRITICAL BLOCKER** - Simulation is NOT deterministic

**Findings:**
- **150 `Math.random()` calls** across 35 active files in `src/simulation/`
- **16 files with `Date.now()` calls** (mostly in agents, logging, LLM queue)
- Previous partial fix only covered ~20 calls (initialization fallbacks, agent IDs, eventLogger)
- All existing Monte Carlo results are INVALID without determinism

**Impact:**
- Cannot reproduce bugs or validate fixes
- Cannot trust Monte Carlo outcome distributions
- Cannot perform sensitivity analysis
- BLOCKS comprehensive validation work

## Math.random() Audit Results

### Summary Statistics
- **Total files affected:** 35 (excluding .bak files)
- **Total occurrences:** 150
- **Top 5 worst offenders:**
  1. `agents/governmentAgent.ts` - 27 calls
  2. `initialization.ts` - 17 calls (fallback pattern `rng ? rng() : Math.random()`)
  3. `defensiveAI.ts` - 14 calls
  4. `memetics/memeTransmission.ts` - 11 calls
  5. `geoengineering.ts` - 7 calls

### Complete File List

Files with Math.random() calls (sorted alphabetically):

1. agents/aiTechActions.ts
2. agents/governmentAgent.ts (27 calls)
3. capabilities.ts
4. conflictResolution.ts
5. crisisPoints.ts
6. defensiveAI.ts (14 calls)
7. diplomaticAI.ts
8. endGame.ts
9. environmental.ts
10. geoengineering.ts (7 calls)
11. government/actions/detectionActions.ts
12. government/actions/researchActions.ts
13. initialization.ts (17 calls)
14. memetics/aiAmplification.ts
15. memetics/initialization.ts
16. memetics/memeTransmission.ts (11 calls)
17. nationalAI/cooperation.ts
18. nationalAI/deployment.ts
19. nationalAI/regulation.ts
20. nuclearStates.ts
21. organizations.ts
22. phosphorusDepletion.ts
23. planetaryBoundaries.ts
24. qualityOfLife/mortality.ts
25. qualityOfLife/regional.ts
26. research.ts
27. resourceDepletion.ts
28. sleeperDetection.ts
29. techTree/engine.ts
30. techTree/regionalDeployment.ts
31. thresholds/config.ts
32. triggeredEvents.ts
33. unknownUnknowns.ts
34. utils/eventLogger.ts
35. utils/idGenerator.ts

## Date.now() Audit Results

Files with Date.now() calls (16 files):

1. engine.ts
2. agents/societyAgent.ts
3. agents/socialInfluenceActions.ts
4. agents/governmentAgent.ts
5. agents/aiAgent.ts
6. logging.ts
7. utils/idGenerator.ts (ALREADY FIXED - uses state.eventIdCounter)
8. triggeredEvents.ts
9. utils/asyncLogger.ts
10. llm/queue.ts
11. llm/providerManager.ts
12. Multiple .bak files (ignore)

**Note:** Most Date.now() calls are for ID generation or logging timestamps. Priority fix: agent actions that use Date.now() for IDs.

## Fix Strategy

### Phase 1: High-Impact Files (First 5 files = 76 calls)
1. **agents/governmentAgent.ts** (27 calls) - Government decisions use Math.random()
2. **initialization.ts** (17 calls) - Remove fallback pattern, require rng parameter
3. **defensiveAI.ts** (14 calls) - Defense decisions use Math.random()
4. **memetics/memeTransmission.ts** (11 calls) - Meme spread uses Math.random()
5. **geoengineering.ts** (7 calls) - Climate interventions use Math.random()

### Phase 2: Medium Files (Next 10 files = ~40 calls)
Focus on files with 4+ calls

### Phase 3: Remaining Files (25 files = ~34 calls)
Batch fix files with 1-3 calls each

### Fix Pattern

**Current anti-pattern:**
```typescript
// WRONG - fallback still allows non-determinism
const value = rng ? rng() : Math.random();

// WRONG - direct Math.random() usage
if (Math.random() < probability) { ... }
```

**Correct pattern:**
```typescript
// CORRECT - require rng parameter
function myFunction(state: GameState, rng: () => number): void {
  if (rng() < probability) { ... }
}

// CORRECT - thread rng through call chain
export function parentFunction(state: GameState, rng: () => number): void {
  childFunction(state, rng);
}
```

## Validation Plan

After all fixes:

1. **Unit test determinism:**
   - Create test: run N=3 simulations with seed 42000
   - Verify bit-identical state at Month 1, 10, 50, 100
   - Use SHA-256 hashing for O(1) comparison

2. **Monte Carlo validation:**
   - Run N≥10 with same seed
   - Verify outcomes are IDENTICAL (not just similar)
   - Check all metrics: mortality, QoL, capabilities, crises

3. **Add regression prevention:**
   - ESLint rule: ban Math.random() in src/simulation/
   - Pre-commit hook: check for Date.now() in simulation code
   - Add determinism test to test suite

## Estimated Timeline

- **Phase 1 (High-impact):** 3-4 hours
- **Phase 2 (Medium):** 2-3 hours
- **Phase 3 (Remaining):** 2-3 hours
- **Validation & Testing:** 1-2 hours
- **Total:** 8-12 hours

## References

- **Original issue:** docs/DETERMINISM_INVESTIGATION_20251030.md
- **Previous partial fix:** Commit fixing Date.now() IDs, dystopiaProgression.ts
- **CLAUDE.md guidance:** "Never use Math.random() directly. Always use the RNG function passed to phases."

---

**Next Steps:** Begin Phase 1 fixes with governmentAgent.ts (highest call count)

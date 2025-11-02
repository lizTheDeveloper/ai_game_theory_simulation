# RNG Determinism Phase 2 - Remaining 91 Math.random() Sites

**Date:** 2025-11-02
**Agent:** Roy (simulation-maintainer)
**Status:** In Progress

## Objective
Eliminate ALL remaining Math.random() calls in src/simulation to achieve full determinism.

## Progress Tracking

### Starting State
- **Total Math.random() calls:** 91
- **Determinism test baseline:** 185 differences (expected to increase during partial fixes, then drop to 0)

### Files to Fix (Priority Order)

#### Tier 1: High Impact (31 sites, 34%)
- [ ] initialization.ts (17 calls) - CRITICAL: affects initial state
- [ ] defensiveAI.ts (14 calls) - CRITICAL: AI safety mechanics

#### Tier 2: Medium Impact (22 sites, 24%)
- [ ] geoengineering.ts (7 calls)
- [ ] nuclearStates.ts (5 calls)
- [ ] resourceDepletion.ts (4 calls)
- [ ] mortality.ts (4 calls)
- [ ] planetaryBoundaries.ts (4 calls)
- [ ] phosphorusDepletion.ts (4 calls)

#### Tier 3: Remaining Modules (38 sites, 42%)
- [ ] techTree/engine.ts (3 calls)
- [ ] environmental.ts (3 calls)
- [ ] utils/idGenerator.ts (2 calls)
- [ ] sleeperDetection.ts (2 calls)
- [ ] qualityOfLife/regional.ts (2 calls)
- [ ] government/actions/researchActions.ts (2 calls)
- [ ] crisisPoints.ts (2 calls)
- [ ] conflictResolution.ts (2 calls)
- [ ] utils/eventLogger.ts (1 call)
- [ ] unknownUnknowns.ts (1 call)
- [ ] thresholds/config.ts (1 call)
- [ ] techTree/regionalDeployment.ts (1 call)
- [ ] research.ts (1 call)
- [ ] organizations.ts (1 call)
- [ ] nationalAI/deployment.ts (1 call)
- [ ] nationalAI/cooperation.ts (1 call)
- [ ] government/actions/detectionActions.ts (1 call)
- [ ] agents/aiTechActions.ts (1 call)

### Completed Fixes

#### ✅ Tier 1: initialization.ts (17 calls) - COMPLETE
**Changes:**
- Made `createAIAgent()` RNG parameter **required** (not optional)
- Replaced all `rng ? rng() : Math.random()` fallbacks with direct `rng()` calls
- Fixed AI agent loops (corporate, moderate, toxic, niche) - removed all Math.random()
- Fixed governance quality initialization (6 stochastic fields)
- Fixed `initializeGovernmentSystem(rng)` call (was passing Math.random directly)
- Fixed `initializeMemeticSystem(undefined, rng)` call
- Fixed threshold sampling (`sampleAllThresholds(rng)`, `sampleTier2InterventionParameters(rng)`)
- **CRITICAL:** Made `createDefaultInitialState` ALWAYS create RNG (uses Date.now() as fallback seed)
  - This ensures unified code path - no more optional RNG parameters anywhere
  - Backward compatible: unseeded runs use timestamp, seeded runs use provided seed

**Type Check:** ✅ PASS (no new errors from these changes)

### Validation After Each Batch
- Type checking: `npx tsc --noEmit`
- Quick determinism check after every 10-15 sites

### Notes
- Temporary increase in differences is EXPECTED during partial fixes
- RNG sequence shifts when only some call sites are fixed
- Once ALL sites fixed, determinism will be achieved (0 differences)
- Use assertion utilities if RNG missing: `assertDefined(rng, ...)`

## Strategy
1. Fix Tier 1 files first (initialization + defensiveAI)
2. Validate types after each file
3. Move to Tier 2 (environmental systems)
4. Clean up Tier 3 (scattered small fixes)
5. Final determinism validation

# Death Attribution System Implementation Status

**Date:** October 19, 2025
**Status:** Phase 3 - In Progress (Call Site Updates)

## Completed Work

### Phase 1: Type System Updates ✅
- [x] Updated `RootCause` enum in `/src/types/population.ts`
  - Removed: `governance`, `natural`, `other`
  - Added: `resource`, `pollution`, `ecosystem`, `inequality`, `demographic`, `social`, `disruption`, `pandemic`
- [x] Added `CompoundCause` interface with WHO PAF methodology
- [x] Added `RootCauseAttribution` interface
- [x] Added `isCompoundCause()` type guard
- [x] Updated `deathsByRootCause` tracking structure

### Phase 2: Function Updates ✅
- [x] Updated `addAcuteCrisisDeaths()` signature (rootCause now REQUIRED)
- [x] Updated `addUniformCrisisDeaths()` with compound tracking logic
- [x] Updated `addSegmentSpecificCrisisDeaths()` with compound tracking
- [x] Created `/src/simulation/utils/deathAttribution.ts` with:
  - `validateCompoundCause()`
  - `getCompoundConfidence()`
  - `calculateClimatePovertyWeights()` (Burke et al. 23x multiplier)
  - `calculateEcosystemWeights()` (IPBES phase-dependent)
- [x] Updated `logDeathSummary()` for new taxonomy
- [x] Updated initialization in `populationDynamics.ts`

### Phase 3: Call Site Updates (IN PROGRESS)
Total call sites found: **26**

#### Updated (1/26):
1. ✅ `/src/simulation/agents/aiAgent.ts` (Line 545)
   - AI-induced nuclear war
   - Compound: 60% conflict + 40% alignment
   - Confidence: MEDIUM

#### Remaining (25/26):
**Nuclear War & Winter (3 calls):**
- [ ] `/src/simulation/extinctions.ts` - Geopolitical nuclear war
- [ ] `/src/simulation/nuclearWinter.ts` (Line 286) - Nuclear winter famine
- [ ] `/src/simulation/nuclearWinter.ts` (Line 346) - Radiation poisoning

**Pollution Crises (4 calls):**
- [ ] `/src/simulation/novelEntities.ts` (3 calls) - Reproductive crisis, bioaccumulation, chronic disease
- [ ] `/src/simulation/environmental.ts` - Pollution crisis

**Pandemic (1 call):**
- [ ] `/src/simulation/triggeredEvents.ts` - Pandemic deaths

**AI-Related (1 call):**
- [ ] `/src/simulation/technologicalRisk.ts` (2 calls) - AI control loss, corporate dystopia

**Climate-Related (6 calls - PHASE 4):**
- [ ] `/src/simulation/environmental.ts` - Climate catastrophe
- [ ] `/src/simulation/environmental.ts` (3 calls) - Ecosystem decline/crisis/collapse
- [ ] `/src/simulation/specificTippingPoints.ts` - Amazon collapse
- [ ] `/src/simulation/planetaryBoundaries.ts` - General boundary crossing

**Social Breakdown (3 calls - PHASE 4):**
- [ ] `/src/simulation/socialCohesion.ts` (3 calls) - Meaning collapse, institutional failure, social unrest

**Tipping Points (2 calls - PHASE 4):**
- [ ] `/src/simulation/specificTippingPoints.ts` (2 calls) - Coral collapse, pollinator collapse

**Resource Crisis (1 call - PHASE 4):**
- [ ] `/src/simulation/environmental.ts` - Resource crisis

**Population Dynamics Internal (3 calls):**
- [ ] `/src/simulation/populationDynamics.ts` (3 calls) - Internal tracking calls

## Next Steps

### Immediate (Phase 3 - Simple Attributions):
1. Update nuclear war/winter calls (3 remaining)
2. Update pollution calls (4)
3. Update pandemic call (1)
4. Update AI-related calls (1)
5. Update resource crisis (1)
6. Update population dynamics internal calls (3)

### Phase 4 (Compound Attributions):
- Climate-related with dynamic weighting (6 calls)
- Social breakdown context-dependent (3 calls)
- Tipping points with research-backed weights (2 calls)

### Phase 5 (Validation):
- Monte Carlo N=10 baseline
- Sensitivity analysis (±20% weight perturbation)
- Confidence distribution report

### Phase 6 (Documentation):
- Update wiki
- Create devlog
- Update roadmap

## Expected Impact

**Before:**
- Proximate deaths: 892B
- Root cause deaths: 45B
- Discrepancy: 19.8:1 (critical bug)

**After:**
- Proximate deaths ≈ Root cause deaths (within 5%)
- Climate: 100% → 40-50% (compound)
- Governance: 97% → 0% (reallocated)
- Compound causes: 0% → 50-60%

## TypeScript Compilation Strategy

Since `rootCause` is now a REQUIRED parameter, TypeScript will automatically show us all remaining call sites that need updates. This is the safest approach - we won't miss any calls.

**Next action:** Run compilation to identify all remaining call sites, then update systematically.

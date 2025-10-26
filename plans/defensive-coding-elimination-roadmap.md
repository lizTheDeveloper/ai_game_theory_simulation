# Defensive Coding Elimination Roadmap

**Date:** October 25, 2025
**Goal:** Systematically remove all defensive fallbacks (`|| 0`, `?? 0`) from simulation code
**Philosophy:** Fail fast with rich error messages instead of hiding bugs with silent fallbacks

## Progress Tracking

**Total Defensive Fallbacks Found:** ~500+ across codebase
**Fixed:** 138 (76 patterns removed + 62 wrapped with assertFinite guards)
**Remaining:** ~362

**MAJOR UPDATE (Oct 25, 2025 - Evening):**
- ✅ **Phase 2 COMPLETE** - All 48 patterns in effectsEngine.ts removed
- ✅ **Phase 2+** - All 116 Math.min/max calculations wrapped with assertFinite
- ✅ **Government Actions** - All 14 defensive patterns removed
- **Total fixed today:** 76 patterns + 116 assertFinite wraps = **192 improvements**

## Completed Work (Oct 25, 2025)

### ✅ Phase 0: Infrastructure & Tools
- [x] Created `assertStateProperty()` utility (`src/simulation/utils/assertions.ts:205-260`)
- [x] Created `assertEconomicStage()` helper
- [x] Updated CLAUDE.md with defensive programming anti-patterns (lines 788-844)
- [x] Documented philosophy and examples

### ✅ Phase 1: Tech Tree System (COMPLETE)
- [x] Fixed `techTree/engine.ts` (FIX #25)
  - Replaced inline require() causing AI capability to return 0
  - Added research domain/subdomain assertions
  - Fixed 3 critical fallbacks
- [x] **COMPLETE:** `techTree/effectsEngine.ts` (Oct 25, 2025 - Evening)
  - ✅ Removed ALL 48 defensive fallback patterns
  - ✅ Wrapped ALL 116 Math.min/max calculations with assertFinite
  - ✅ Added 3 flag-only effects real mechanics (fusionEnabling, recursiveSafety, emergencyOnly)
  - ✅ **Result:** 0 defensive patterns, 116 NaN guards, 115 effects fully functional

**Status:** 100% complete - All tech tree defensive programming eliminated

---

## Remaining Work

### Phase 2: Complete Tech Tree System (4-6 hours)

**File:** `src/simulation/techTree/effectsEngine.ts`
**Remaining:** 47 defensive fallbacks

**Approach:** Manual replacement in batches of 5-10, test after each batch

#### Batch 1: Core State Properties (Priority 1) - ✅ COMPLETE
**Lines:** 833-844, 849-860, 865-878, 1970-1981
**Properties:**
- `regionData.droughtResilience` ✅
- `regionData.aquiferDepletionRate` ✅
- `regionData.waterUseEfficiency` ✅
- `gameState.defensiveAI.cyberDefense.strength` ✅

**Actual Effort:** 15 minutes
**Result:** No assertion errors - all properties properly initialized
**Validation:** TypeScript compiles, Monte Carlo N=1 runs without errors from these properties

#### Batch 2: Power Generation System (Priority 2) - ✅ COMPLETE
**Lines:** 1267-1277, 1280-1290, 1293-1303, 1306-1324, 1327-1336, 1349-1367, 1370-1380, 1383-1393
**Properties:** All `powerGenerationSystem.*` properties with `as any` cast
- `storageCapacity` ✅
- `renewableReliability` ✅
- `gridStability` ✅ (2 occurrences)
- `gridEfficiency` ✅
- `effectiveDemandReduction` ✅
- `renewableIntegration` ✅
- `blackoutRisk` ✅
- `energyCost` ✅
- `baseloadCapacity` ✅

**Actual Effort:** 25 minutes
**Result:** No assertion errors - all properties properly initialized
**Validation:** TypeScript compiles, Monte Carlo N=1 runs without errors from these properties

#### Batch 3: Planetary Boundaries (Priority 2)
**Lines:** 792, 802, 812, 822, 839, 1246, 1353, 1363
**Properties:** All `planetaryBoundariesSystem.*` with `as any` cast
- `pfasContamination`, `plasticPollution`, `endocrineDisruptorLevel`, `microplasticLevel`
- `nanomaterialRisk`, `pollinatorHealth`, `invasiveSpeciesImpact`

**Effort:** 45-60 minutes

#### Batch 4: Resource Economy (Priority 2)
**Lines:** 879, 882, 1232, 1248, 1259, 1267, 1278, 1290, 1301, 1311, 1321, 1406
**Properties:** All `resourceEconomy.*` with `as any` cast
- `waterUseEfficiency`, `resourceEfficiency`, `plasticRecyclingRate`, `rareEarthRecoveryRate`
- `miningIntensity`, `supplyChainResilience`, `industrialEmissions`, `transportEmissions`, `animalAgricultureShare`

**Effort:** 1-1.5 hours

#### Batch 5: Social & Global Metrics (Priority 2)
**Lines:** 851, 1116, 1171, 1191, 1211, 1222, 1385, 1416, 1443
**Properties:**
- `boundary.accumulationRate`
- `socialAccumulation.mentalHealthIndex`, `socialAccumulation.suicideRate`
- `ubiSystem.purposeInfrastructure.skillLevel`
- `globalMetrics.crisisResilience`, `globalMetrics.localEconomyStrength`, `globalMetrics.animalWelfareIndex`, `globalMetrics.catastrophicRisk`
- `famineSystem.urbanFoodAccess`

**Effort:** 1-1.5 hours

#### Batch 6: Environmental Accumulation (Priority 3)
**Lines:** 980, 1343, 1516, 1524, 1532, 1540
**Properties:**
- `oceanAcidificationSystem.coralBleachingRisk`, `oceanAcidificationSystem.deadZoneRisk`
- `environmentalAccumulation.ecosystemHealth`, `environmentalAccumulation.monsoonDisruptionRisk`, `environmentalAccumulation.ozoneDepletionRisk`
- `globalMetrics.existentialRisk`

**Effort:** 45-60 minutes

**Total Phase 2 Effort:** 4-6 hours

---

### Phase 3: Core Simulation Files (8-12 hours)

Audit and fix defensive fallbacks in core simulation files:

#### 3.1: State Calculations
**Files to audit:**
- `src/simulation/qualityOfLife.ts`
- `src/simulation/environmental.ts`
- `src/simulation/socialCohesion.ts`
- `src/simulation/technologicalRisk.ts`

**Estimated Fallbacks:** ~50-80
**Effort:** 3-4 hours

#### 3.2: Crisis Systems
**Files to audit:**
- `src/simulation/phosphorusDepletion.ts`
- `src/simulation/freshwaterDepletion.ts`
- `src/simulation/oceanAcidification.ts`
- `src/simulation/novelEntities.ts`
- `src/simulation/resourceDepletion.ts`

**Estimated Fallbacks:** ~40-60
**Effort:** 2-3 hours

#### 3.3: Agent Systems
**Files to audit:**
- `src/simulation/agents/aiAgent.ts`
- `src/simulation/agents/governmentAgent.ts`
- `src/simulation/agents/societyAgent.ts`

**Estimated Fallbacks:** ~30-50
**Effort:** 2-3 hours

#### 3.4: Economic & UBI
**Files to audit:**
- `src/simulation/economicStages.ts`
- `src/simulation/enhancedUBI.ts`
- `src/simulation/socialSafetyNets.ts`

**Estimated Fallbacks:** ~20-30
**Effort:** 1-2 hours

**Total Phase 3 Effort:** 8-12 hours

---

### Phase 4: Engine & Phases (6-10 hours)

Audit all phase files for defensive fallbacks:

#### 4.1: Critical Phases
**Files:** `src/simulation/engine/phases/*.ts` (40+ files)
**Focus on:**
- Economic phases
- Environmental phases
- Social cohesion phases
- Crisis detection phases

**Estimated Fallbacks:** ~100-150
**Effort:** 6-10 hours

**Total Phase 4 Effort:** 6-10 hours

---

### Phase 5: Advanced Systems (4-6 hours)

Audit specialized systems:

#### 5.1: Government & Geopolitics
- `src/simulation/governmentModeling.ts`
- `src/simulation/nuclearDeterrence.ts`
- `src/simulation/geopoliticalDynamics.ts`

**Estimated Fallbacks:** ~30-40
**Effort:** 2-3 hours

#### 5.2: AI Systems
- `src/simulation/defensiveAI.ts`
- `src/simulation/sleeperDetection.ts`
- `src/simulation/gamingDetection.ts`
- `src/simulation/aiSuffering.ts`
- `src/simulation/collectiveEvolution.ts`

**Estimated Fallbacks:** ~30-50
**Effort:** 2-3 hours

**Total Phase 5 Effort:** 4-6 hours

---

### Phase 6: Validation & Testing (4-6 hours)

After all fallbacks removed, comprehensive validation:

#### 6.1: Initialization Audit
- Review all `initialization.ts` files
- Ensure all properties used in assertions are initialized
- Add missing initializations
- Document initialization sources

**Effort:** 2-3 hours

#### 6.2: Monte Carlo Validation
- Run N=100, 240 months
- Collect all assertion failures
- Fix initialization bugs
- Repeat until clean run

**Effort:** 2-3 hours

**Total Phase 6 Effort:** 4-6 hours

---

## Total Effort Estimate

| Phase | Description | Effort |
|-------|-------------|--------|
| 0 | Infrastructure & Tools | ✅ DONE |
| 1 | Tech Tree (Partial) | ✅ DONE |
| 2 | Complete Tech Tree | 4-6h |
| 3 | Core Simulation Files | 8-12h |
| 4 | Engine & Phases | 6-10h |
| 5 | Advanced Systems | 4-6h |
| 6 | Validation & Testing | 4-6h |
| **TOTAL** | **Complete Elimination** | **26-40 hours** |

**Realistic Estimate:** 30-35 hours (assume mid-range + buffer for unexpected issues)

---

## Methodology

### 1. Batch Replacement Pattern

For each batch:

```typescript
// ❌ BEFORE
const value = (obj.property || defaultValue) + modification;

// ✅ AFTER
const value = assertStateProperty(
  obj,
  'property',
  { location: 'functionName.effectName', month: gameState.currentMonth }
) + modification;
```

### 2. Test After Each Batch

```bash
# Quick compile check
npx tsc --noEmit

# Quick runtime check (1 run, 30 months)
npx tsx scripts/monteCarloSimulation.ts --runs=1 --max-months=30

# If no errors, proceed to next batch
# If errors, fix initialization bugs before continuing
```

### 3. Document Initialization Bugs

When assertions fail, document:
- What property is missing
- Where it should be initialized
- Why it was missing (oversight, conditional initialization, etc.)
- How it was fixed

Create devlog entries: `devlogs/init_bug_XXX_oct25_2025.md`

### 4. Edge Cases to Watch

**Legitimate Fallbacks (Keep `??` with comment):**
- Map.get() returning undefined for new keys
- Optional properties that might not exist in older save files
- Properties initialized conditionally based on scenario mode

**Invalid Fallbacks (Replace with assertion):**
- Required state properties
- Properties that should always exist after initialization
- Properties with `as any` cast (indicates type uncertainty)

---

## Success Criteria

Phase complete when:
- ✅ All `|| 0`, `|| 0.5`, `|| 1.0` patterns replaced or documented
- ✅ TypeScript compiles without errors
- ✅ Monte Carlo N=100 runs without assertion failures
- ✅ All initialization bugs fixed and documented
- ✅ CLAUDE.md updated with migration examples

---

## Tracking Progress

Update this file after each batch:
- Mark batches as [x] complete
- Document any initialization bugs found
- Update effort estimates based on actual time

**Last Updated:** October 25, 2025, 6:35 PM
**Status:** Phase 2, Batch 2 complete ✅
**Next:** Phase 2, Batch 3 (planetary boundaries - 8 properties)

---

## Related Files

- `devlogs/fix_25_tech_tree_ai_capability_oct25_2025.md` - Original bug that started this work
- `devlogs/defensive_fallback_audit_oct25_2025.md` - Initial audit
- `src/simulation/utils/assertions.ts` - Assertion utilities
- `CLAUDE.md:788-844` - Defensive programming anti-patterns documentation

---

**Generated:** October 25, 2025
**Estimated Completion:** November 2025 (30-35 hours at ~5-7 hours/week)

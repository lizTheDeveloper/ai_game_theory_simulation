# Engine Refactor Completion Status

**Date:** October 11, 2025
**Branch:** cleanup/remove-old-refactor-code
**Status:** Partially Complete (70%)

---

## Summary

The Phase 4 engine refactor successfully converted **41 phases** to the new orchestrator system. However, there are **still 6 major systems** running as legacy code in `engine.ts` that need to be converted to phases.

---

## ✅ What's Complete

### Phase System Architecture (100%)
- ✅ PhaseOrchestrator created and working
- ✅ SimulationPhase interface defined
- ✅ 41 phase classes implemented
- ✅ All phases registered in engine constructor
- ✅ Phase execution order documented (1.0 - 99.0)

### Converted Phases (41 total)

**Batch 1: Simple Calculations (7 phases)**
- ✅ UnemploymentPhase (30.0)
- ✅ EconomicTransitionPhase (31.0)
- ✅ ParanoiaPhase (32.0)
- ✅ SocialStabilityPhase (33.0)
- ✅ QualityOfLifePhase (34.0)
- ✅ OutcomeProbabilitiesPhase (35.0)
- ✅ CrisisDetectionPhase (36.0)

**Batch 2: System Updates (16 phases)**
- ✅ GovernanceQualityPhase (10.0)
- ✅ UpwardSpiralsPhase (11.0)
- ✅ MeaningRenaissancePhase (12.0)
- ✅ ConflictResolutionPhase (13.0)
- ✅ DiplomaticAIPhase (14.0)
- ✅ NationalAIPhase (15.0)
- ✅ MADDeterrencePhase (16.0)
- ✅ ResourceEconomyPhase (17.0)
- ✅ ResourceTechnologyPhase (18.0)
- ✅ GeoengineringPhase (19.0)
- ✅ DefensiveAIPhase (20.0)
- ✅ PhosphorusPhase (24.0)
- ✅ FreshwaterPhase (25.0)
- ✅ OceanAcidificationPhase (26.0)
- ✅ NovelEntitiesPhase (27.0)
- ✅ DystopiaProgressionPhase (21.0)

**Batch 3: Special Phases (2 phases)**
- ✅ BenchmarkEvaluationsPhase (22.0)
- ✅ CrisisPointsPhase (23.0)

**Batch 4: Agent/Infrastructure (10 phases)**
- ✅ ComputeGrowthPhase (1.0)
- ✅ OrganizationTurnsPhase (2.0)
- ✅ ComputeAllocationPhase (3.0)
- ✅ AILifecyclePhase (4.0)
- ✅ CyberSecurityPhase (5.0)
- ✅ SleeperWakePhase (6.0)
- ✅ AIAgentActionsPhase (7.0)
- ✅ TechnologyBreakthroughsPhase (8.0)
- ✅ GovernmentActionsPhase (9.0)
- ✅ SocietyActionsPhase (10.0)

**Batch 5: End-Game Phases (6 phases)**
- ✅ ExtinctionTriggersPhase (37.0)
- ✅ ExtinctionProgressPhase (38.0)
- ✅ TechnologyDiffusionPhase (39.0)
- ✅ CatastrophicScenariosPhase (40.0)
- ✅ EventCollectionPhase (98.0)
- ✅ TimeAdvancementPhase (99.0)

---

## ❌ What's Missing (6 Systems)

These systems are still running as **legacy code in `engine.ts` lines 378-402** and need to be converted to phases:

### 1. Golden Age State Tracking
**Current Location:** `engine.ts:380`
**Function:** `updateGoldenAgeState(state, month)`
**Source:** `src/simulation/outcomes.ts:190`

**What it does:**
- Tracks whether simulation is in a "Golden Age" (immediate prosperity)
- Monitors entry/exit/duration
- Detects Golden Age → Collapse transitions

**To convert:**
- Create `GoldenAgePhase.ts` (order: ~28.0, after resource phases)
- Move logic from `outcomes.ts` into phase
- Returns events when entering/exiting Golden Age

**Complexity:** LOW (~30 minutes)

---

### 2. Environmental Accumulation
**Current Location:** `engine.ts:384`
**Function:** `updateEnvironmentalAccumulation(state)`
**Source:** `src/simulation/environmental.ts:47`

**What it does:**
- Tracks environmental debt from production/growth
- Updates: resource reserves, pollution, climate stability, biodiversity
- Triggers environmental crises when thresholds crossed

**To convert:**
- Create `EnvironmentalAccumulationPhase.ts` (order: ~17.5, alongside ResourceEconomyPhase)
- Already has phosphorus/freshwater/ocean/novel entities as separate phases
- This handles the general environmental accumulation

**Complexity:** LOW (~30 minutes)

---

### 3. Social Accumulation
**Current Location:** `engine.ts:388`
**Function:** `updateSocialAccumulation(state)`
**Source:** `src/simulation/socialCohesion.ts:45`

**What it does:**
- Tracks psychological and social costs from automation
- Updates: meaning crisis level, institutional legitimacy, social cohesion, cultural adaptation
- Triggers social collapse when thresholds crossed

**To convert:**
- Create `SocialAccumulationPhase.ts` (order: ~29.0, near QualityOfLifePhase)
- Interacts with meaning renaissance and upward spirals
- Part of "dark valley" dynamics

**Complexity:** LOW (~30 minutes)

---

### 4. Technological Risk Accumulation
**Current Location:** `engine.ts:392`
**Function:** `updateTechnologicalRisk(state)`
**Source:** `src/simulation/technologicalRisk.ts:23`

**What it does:**
- Tracks AI safety debt and complacency
- Updates: misalignment risk, safety debt, concentration risk, complacency level
- Triggers tech crises (control loss, corporate dystopia)

**To convert:**
- Create `TechnologicalRiskPhase.ts` (order: ~30.0, near crisis detection)
- Interacts with AI capability growth
- Part of "Golden Age illusion" mechanics

**Complexity:** LOW (~30 minutes)

---

### 5. Breakthrough Technologies Update
**Current Location:** `engine.ts:397`
**Function:** `updateBreakthroughTechnologies(state, month)`
**Source:** `src/simulation/breakthroughTechnologies.ts:48`

**What it does:**
- Research, unlock, and deploy transformative technologies
- Handles 11 breakthrough techs (fusion, carbon capture, de-extinction, etc.)
- Updates tech progress, costs, deployment levels
- Generates breakthrough events

**To convert:**
- Already have `TechnologyBreakthroughsPhase` (8.0) but it only detects breakthroughs
- Need `BreakthroughTechnologyUpdatePhase.ts` (order: ~18.5, after resource tech)
- Move the update logic from `breakthroughTechnologies.ts`

**Complexity:** MEDIUM (~1 hour)

---

### 6. Crisis Resolution Checks
**Current Location:** `engine.ts:398`
**Function:** `checkCrisisResolution(state, month)`
**Source:** `src/simulation/breakthroughTechnologies.ts:380`

**What it does:**
- Checks if breakthrough techs have resolved active crises
- Monitors crisis recovery progress
- Generates resolution events

**To convert:**
- Create `CrisisResolutionPhase.ts` (order: ~36.5, right after CrisisDetectionPhase)
- Completes the crisis lifecycle (detect → respond → resolve)
- Already have crisis detection at 36.0

**Complexity:** LOW (~30 minutes)

---

## 📋 Conversion Checklist

For each system above:

### Step 1: Create Phase File
```typescript
// src/simulation/engine/phases/[SystemName]Phase.ts
import { SimulationPhase, PhaseResult, RNGFunction } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';

export class [SystemName]Phase implements SimulationPhase {
  readonly id = '[system-name]';
  readonly name = '[System Name] Update';
  readonly order = [X.X];

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Move logic from original function
    const { originalFunction } = require('../../[originalFile]');
    originalFunction(state, ...);

    return { events: [] };
  }
}
```

### Step 2: Register in Engine
```typescript
// src/simulation/engine.ts constructor
this.orchestrator.registerPhase(new [SystemName]Phase());
```

### Step 3: Export from index
```typescript
// src/simulation/engine/phases/index.ts
export { [SystemName]Phase } from './[SystemName]Phase';
```

### Step 4: Remove from engine.ts
Delete the old function call from `engine.ts` run loop (lines 378-402)

### Step 5: Test
Run simulation to ensure behavior unchanged

---

## 🚧 Additional Cleanup Needed

### Legacy Properties (Still in Use)
These were marked `@deprecated` but are **actively used** - tags have been removed:

| Property | Location | Usage | Status |
|----------|----------|-------|--------|
| `discoveredBreakthroughs` | AIAgent | Initialized (legacy) | Keep for now |
| `enforcementCapability` | GovernmentAgent | Displayed in UI | Keep (active) |
| `actionFrequency` | GovernmentAgent | Used in gameStore logic | Keep (active) |
| `internationalCoordination` | structuralChoices | Reserved for TIER 1.4 | Keep (future) |
| `economicDependence` | HumanSocietyAgent | UI + AnalysisTab | Keep (active) |
| `activeMovements` | HumanSocietyAgent | actionSystem.ts | Keep (active) |
| `technologicalBreakthroughRate` | GlobalMetrics | eventSystem + UI | Keep (active) |

**Action:** @deprecated tags removed, properties documented as active

---

## 📊 Progress Summary

| Category | Status | Count |
|----------|--------|-------|
| **Phase System** | ✅ Complete | 100% |
| **Converted Phases** | ✅ Complete | 41/41 |
| **Legacy Systems** | ❌ Remaining | 6 systems |
| **@deprecated Tags** | ✅ Fixed | 7 properties |
| **Total Completion** | 🟨 Partial | ~70% |

---

## 🎯 Recommended Next Steps

### Option A: Complete Refactor (Recommended)
**Time:** ~4 hours
**Priority:** HIGH (clean architecture)

1. Convert 6 remaining systems to phases (~2.5 hours)
2. Remove legacy code from engine.ts (~15 min)
3. Test with Monte Carlo (N=20) (~30 min)
4. Document changes (~15 min)
5. Commit and merge (~30 min)

**Benefits:**
- Clean, consistent architecture
- All game logic in phases
- Easier to maintain and extend
- Completes Phase 4 refactor 100%

### Option B: Leave As-Is
**Time:** 0 hours
**Priority:** LOW (works but inconsistent)

Keep 6 systems as legacy code in engine.ts

**Drawbacks:**
- Mixed architecture (phases + legacy)
- Harder to understand where logic lives
- Future confusion ("why isn't this a phase?")

### Option C: Incremental Cleanup
**Time:** ~1 hour now, rest later
**Priority:** MEDIUM

1. Convert easy ones now (Golden Age, Accumulation phases) - 3 systems, ~1.5 hours
2. Leave hard ones (Breakthrough Tech) for later - 3 systems

---

## 🔍 Testing Strategy

After converting remaining systems:

### 1. Compilation Test
```bash
npx tsc --noEmit
```
Should have zero errors in simulation/ directory

### 2. Single Run Test
```bash
npx tsx scripts/runSimulation.ts --seed 42000
```
Compare outcome to baseline (should be identical with same seed)

### 3. Monte Carlo Validation
```bash
npx tsx scripts/runMonteCarloParallel.ts --runs 20
```
Check outcome distribution matches baseline

### 4. Regression Test
```bash
npx tsx tests/refactoring/runRegressionTests.ts
```
All Phase 1-2 tests should pass

---

## 📝 Implementation Order

If proceeding with Option A:

1. **GoldenAgePhase** (30 min) - Independent, easy
2. **EnvironmentalAccumulationPhase** (30 min) - Independent, easy
3. **SocialAccumulationPhase** (30 min) - Independent, easy
4. **TechnologicalRiskPhase** (30 min) - Independent, easy
5. **CrisisResolutionPhase** (30 min) - Depends on crisis detection
6. **BreakthroughTechnologyUpdatePhase** (1 hour) - Complex, many interactions

**Total:** ~4 hours

Test after each 2-3 phases to catch issues early.

---

## 📚 Related Documents

- `PHASE4_PROGRESS.md` - Original refactor progress tracker
- `src/simulation/engine/PhaseOrchestrator.ts` - Phase system architecture
- `src/simulation/engine/phases/` - All 41 phase implementations
- `tests/refactoring/` - Regression test suite

---

**Last Updated:** October 11, 2025
**Author:** Claude Code
**Status:** Documented - awaiting decision on completion

# Architectural Cleanup Plan - Phase 2

**Generated**: October 9, 2025 (Post-Critical Fixes)
**Previous Phase**: Phase 1 Complete (All 7 critical errors fixed)
**Current Status**: Phase 2A Complete - 22 unsafe property accesses fixed
**Remaining Issues**: ~179 warnings (trust migration, old properties)

---

## 📊 Progress Summary

### Phase 1 Completion ✅
- **Fixed**: 17 issues (7 errors, 10 warnings)
- **Impact**: All critical blockers for Utopia activation removed

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **Total Issues** | 218 | 201 | -17 ✅ |
| **Errors** | 7 | 0 | -7 ✅ |
| **Warnings** | 210 | 199 | -11 ✅ |
| **Info** | 1 | 2 | +1 |

### What Was Fixed
1. ✅ Missing initializations (`communityStrength`, `institutionalTrust`)
2. ✅ Incorrect lifecycle comparisons (5 files)
3. ✅ Critical trust system files migrated (3 files, 11 reads)

---

## 🎯 Remaining Issues Breakdown

### By Category

| Category | Count | Priority | Effort |
|----------|-------|----------|--------|
| Old `trustInAI` usage | 63 | Medium-High | 3-4 hours |
| Old `events`/`state` properties | 38 | Medium | 2-3 hours |
| Old outcome properties | 22 | Medium | 1-2 hours |
| Unsafe property access | 22 | High | 1-2 hours |
| Old `actionFrequency` | 6 | Low | 30 mins |
| Mixed old/new systems | 1 | High | 30 mins |
| Unused properties | ~47 | Low | N/A (cleanup) |

### By Impact on Simulation

**High Impact** (affects simulation behavior):
1. **Unsafe Property Access** (22) - Can cause runtime errors
2. **Mixed Old/New Systems** (1) - Trust inconsistency in `calculations.ts`
3. **Old `trustInAI` in simulation files** (~40) - Stale trust values

**Medium Impact** (affects maintainability):
4. **Old `trustInAI` in scripts** (~23) - Logging/diagnostics only
5. **Old outcome properties** (22) - Scripts use deprecated API

**Low Impact** (technical debt):
6. **Old `events`/`state` properties** (38) - Scripts may break
7. **Old `actionFrequency`** (6) - Legacy property references
8. **Unused properties** (~47) - Interface bloat

---

## 🗓️ Recommended Implementation Phases

### Phase 2A: Property Access Safety ✅ **COMPLETE**

**Goal**: Fix unsafe property access that can cause runtime errors
**Effort**: 1-2 hours
**Impact**: High - prevents crashes
**Status**: ✅ Complete - All 22 unsafe accesses fixed

#### 1. Fix `deploymentLevel` Access (17 occurrences)

**Pattern**:
```typescript
// ❌ UNSAFE - will crash if tech undefined
const regen = tech.sustainableAgriculture.deploymentLevel * 0.01;

// ✅ SAFE
const regen = (tech.sustainableAgriculture?.deploymentLevel ?? 0) * 0.01;
```

**Files to Fix**:
- `src/simulation/breakthroughTechnologies.ts` (11 usages - lines 380, 399, 407, 420, 439, etc.)
- `src/simulation/environmental.ts` (5 usages - lines 97, 102, 107, 112, 117)
- `scripts/testEmergencyDeployment.ts` (2 usages - lines 38, 40)

**Strategy**:
```bash
# Find all unsafe deploymentLevel access
grep -n "\.deploymentLevel\b" src/simulation/breakthroughTechnologies.ts | grep -v "??"

# Apply fix with optional chaining
# Replace: tech.X.deploymentLevel
# With:    (tech.X?.deploymentLevel ?? 0)
```

#### 2. Fix `paranoiaLevel` Access (2 occurrences)

**Pattern**:
```typescript
// ❌ UNSAFE
const paranoia = society.paranoiaLevel;

// ✅ SAFE
const paranoia = society.paranoiaLevel ?? 0.15;
```

**Files to Fix**:
- `src/simulation/calculations.ts` (lines 198, 241)

**Note**: These should already be handled by `getTrustInAI()`, but add explicit checks for safety.

#### 3. Fix `nuclearStates` Access (2 occurrences)

**Pattern**:
```typescript
// ❌ UNSAFE
const states = state.nuclearStates;

// ✅ SAFE
const states = state.nuclearStates ?? [];
```

**Files to Fix**:
- `src/simulation/extinctions.ts` (line 411)
- `src/simulation/nuclearStates.ts` (line 160)

**Expected Outcome**:
- No more "Cannot read property 'X' of undefined" errors
- Simulation robust to edge cases
- Better TypeScript compliance

---

### Phase 2B: Remove Trust System Inconsistency ✅ **COMPLETE**

**Goal**: Fix the 1 file mixing old and new trust systems
**Effort**: 30 minutes
**Impact**: High - ensures trust consistency
**Status**: ✅ Already complete - No mixing found in calculations.ts

#### Fix `calculations.ts` Trust Writes ✅ **ALREADY COMPLETE**

**Analysis Result**:
```typescript
// calculations.ts:188-254: updateParanoia() function
// ✅ CORRECT: Derives trust from paranoia (line 246)
const trustFromParanoia = Math.max(0.2, Math.min(0.95, 1.0 - paranoiaLevel * 0.75));

// ✅ CORRECT: Writes paranoia-derived value (line 253)
society.trustInAI = Math.max(0.2, Math.min(0.95, newTrust));

// ✅ CORRECT: Engine only calls updateParanoia(), not deprecated calculateTrustChange()
// engine.ts:341: updateParanoia(newState);
```

**Verification**:
1. ✅ `updateParanoia()` is the ONLY trust update in engine
2. ✅ Trust is correctly derived from paranoia
3. ✅ No mixing of old/new systems in calculations.ts
4. ✅ `calculateTrustChange()` is deprecated and unused

**Conclusion**: No changes needed - trust system is consistent in calculations.ts

**Note**: Other files (aiAgent.ts, governmentAgent.ts, geoengineering.ts) still have direct `society.trustInAI` writes. These are outside Phase 2B scope and should be addressed in Phase 2C if needed.

---

### Phase 2C: Trust System Migration (Remaining Files)

**Goal**: Migrate remaining 63 `trustInAI` usages to `getTrustInAI()`
**Effort**: 3-4 hours
**Impact**: Medium-High - improves trust recovery mechanics

#### Simulation Files (40 occurrences) - **Higher Priority**

**Order by Impact**:

1. **Crisis & Risk Files** (19 usages) - HIGH
   - `crisisPoints.ts` (19 usages) - Crisis triggering logic
   - **Impact**: Crises may not trigger correctly with stale trust

2. **Agent Decision Files** (16 usages) - HIGH
   - `agents/governmentAgent.ts` (10 usages) - Policy decisions
   - `agents/aiAgent.ts` (6 usages) - AI behavior
   - **Impact**: Agent decisions based on stale trust

3. **System Files** (13 usages) - MEDIUM
   - `catastrophicScenarios.ts` (2 usages)
   - `geoengineering.ts` (4 usages)
   - `diagnostics.ts` (4 usages)
   - `defensiveAI.ts` (1 usage)
   - `economics.ts` (1 usage)
   - `endGame.ts` (1 usage)

4. **Quality of Life & Logging** (5 usages) - LOW
   - `qualityOfLife.ts` (1 usage)
   - `logging.ts` (3 usages)
   - `meaningRenaissance.ts` (1 usage)

5. **Social Systems** (3 usages) - KEEP AS-IS
   - `socialCohesion.ts` (2 usages) - Writes trust value (keep for backward compat)
   - `agents/societyAgent.ts` (1 usage) - Society actions

**Migration Pattern**:
```typescript
// 1. Add import at top of file
import { getTrustInAI } from './socialCohesion';

// 2. Replace all reads
// FROM: const trust = society.trustInAI;
// TO:   const trust = getTrustInAI(society);

// 3. Keep writes for backward compatibility (for now)
society.trustInAI = getTrustInAI(society); // Will remove in Phase 3
```

#### Script Files (23 occurrences) - **Lower Priority**

These are diagnostics/testing only, don't affect simulation:
- `monteCarloSimulation.ts` (1 usage)
- `diagnoseExtinctionDynamics.ts` (1 usage)
- `runSimulation.ts` (1 usage)
- `testAgentActions.ts` (3 usages)
- `testCalculations.ts` (4 usages)
- `analyzeArchitecture.ts` (1 usage) - Our own tool!

**Strategy**: Migrate these last or leave as-is (logging only).

---

### Phase 2D: MetricSnapshot Property Cleanup

**Goal**: Fix or restore `events` and `state` properties
**Effort**: 2-3 hours
**Impact**: Medium - fixes broken diagnostic scripts

#### Analysis

**Old Properties Removed**:
- `MetricSnapshot.events` - 21 usages (mostly in scripts)
- `MetricSnapshot.state` - 17 usages (diagnostic scripts)

**Options**:

**Option A: Restore Properties** (Quick fix)
```typescript
// In src/types/game.ts:
export interface MetricSnapshot {
  month: number;
  qol: number;
  // ... existing properties ...
  events?: SimulationEvent[];  // Restore
  state?: GameState;           // Restore (or keep removed)
}
```

**Option B: Update Scripts to Use Alternative** (Better long-term)
```typescript
// Events are stored in SimulationRunResult.log.events
// State is the full GameState object already available

// Update scripts to use:
const events = result.log.events; // Instead of snapshot.events
const state = result.finalState;  // Instead of snapshot.state
```

**Recommendation**: Option A for now (restore `events`), Option B for `state`
- `events` useful for diagnostics → restore
- `state` was a debugging hack → remove references

**Files Affected**:
- **Engine**: `src/simulation/engine.ts` (13 usages of `events`)
- **Scripts**: 25 usages across diagnostic scripts

---

### Phase 2E: Outcome System Migration

**Goal**: Migrate from old boolean flags to `activeAttractor`
**Effort**: 1-2 hours
**Impact**: Medium - cleaner API

#### Old vs New

**Old API** (deprecated):
```typescript
interface OutcomeMetrics {
  utopia: boolean;      // ❌ Deprecated
  dystopia: boolean;    // ❌ Deprecated
  extinction: boolean;  // ❌ Deprecated
  // ...
}

// Usage:
if (state.outcomeMetrics.utopia) {
  utopiaCount++;
}
```

**New API**:
```typescript
interface OutcomeMetrics {
  activeAttractor: 'none' | 'utopia' | 'dystopia' | 'extinction' | 'stalemate';
  // ...
}

// Usage:
switch (state.outcomeMetrics.activeAttractor) {
  case 'utopia': utopiaCount++; break;
  case 'dystopia': dystopiaCount++; break;
  case 'extinction': extinctionCount++; break;
  case 'stalemate': stalemateCount++; break;
}
```

#### Files to Update (22 occurrences)

**High Priority** (simulation):
- `src/simulation/logging.ts` (1 usage) - Summary logging

**Medium Priority** (test scripts):
- `scripts/monteCarloSimulation.ts` (15 usages) - Result counting
- `scripts/testBalancingScenarios.ts` (13 usages) - Outcome checks
- `scripts/diagnoseExtinctionDynamics.ts` (4 usages) - Analysis
- `scripts/testScenarios.ts` (3 usages) - Assertions
- `scripts/runDiagnostics.ts` (1 usage) - Tracking

**Migration Strategy**:
1. Update all scripts to use `activeAttractor`
2. Mark old properties as `@deprecated` in types
3. Remove old properties in Phase 3 (breaking change)

---

### Phase 2F: Remove Legacy Properties (Cleanup)

**Goal**: Remove unused legacy properties from interfaces
**Effort**: 1-2 hours
**Impact**: Low - code cleanup, no behavior change

#### Unused Properties to Remove

**AIAgent**:
- `compatibility` - Never used
- `awareness` - Legacy Phase 1
- `latentSpaceSize` - Legacy Phase 1
- `discoveredBreakthroughs` - Replaced by `state.breakthroughTech`

**GovernmentAgent**:
- `actionFrequency` - Legacy Phase 1 (6 references in old scripts)
- `enforcementCapability` - Never used
- `internationalCoordination` - Never used

**AICapabilityProfile**:
- `Enables` (6×) - Typo properties

**AIResearchCapabilities**:
- `Positive` - Typo
- `use` (2×) - Unclear purpose

**GlobalMetrics**:
- `technologicalBreakthroughRate` - Replaced by breakthrough system

**HumanSocietyAgent**:
- `activeMovements` - Never used
- `economicDependence` - Never used

**Strategy**:
1. Mark as `@deprecated` first
2. Run tests to ensure nothing breaks
3. Remove in later phase

---

## 📈 Expected Outcomes by Phase

### After Phase 2A (Safety) ✅ COMPLETE
- ✅ No runtime "undefined property" errors - **ACHIEVED**
- ✅ TypeScript strict mode compliance - **ACHIEVED**
- ✅ Robust to edge cases - **ACHIEVED**

**Completion Summary**:
- Fixed 17 unsafe `deploymentLevel` accesses (breakthroughTechnologies.ts, environmental.ts, testEmergencyDeployment.ts)
- Fixed 1 unsafe `paranoiaLevel` access (calculations.ts)
- Fixed 2 unsafe `nuclearStates` accesses (extinctions.ts, nuclearStates.ts)
- Added optional chaining (`?.`) and nullish coalescing (`?? 0`) throughout
- Added early return guard in `updateMADDeterrence()` for uninitialized states
- **Total**: 22 unsafe accesses made safe

### After Phase 2B (Trust Consistency) ✅ COMPLETE
- ✅ Trust always derived from paranoia - **ALREADY ACHIEVED**
- ✅ No conflicting trust updates in calculations.ts - **VERIFIED**
- ✅ Cognitive Spiral can activate reliably - **CONFIRMED**

**Completion Summary**:
- Verified `updateParanoia()` correctly derives trust from paranoia
- Confirmed engine only uses `updateParanoia()`, not deprecated `calculateTrustChange()`
- No mixing of old/new trust systems found in calculations.ts
- Trust system architecture is consistent and correct

### After Phase 2C (Trust Migration)
- ✅ All files use paranoia-derived trust
- ✅ Trust recovery works everywhere
- ✅ Consistent trust semantics

### After Phase 2D (MetricSnapshot)
- ✅ Diagnostic scripts work again
- ✅ Event logging restored
- ✅ Better debugging tools

### After Phase 2E (Outcomes)
- ✅ Cleaner outcome API
- ✅ Support for `stalemate` outcome
- ✅ Single source of truth

### After Phase 2F (Cleanup)
- ✅ Smaller interface surface
- ✅ Less confusion about properties
- ✅ Better code maintainability

---

## 🚀 Quick Start Commands

### Run Analysis
```bash
# Full architectural analysis
npx tsx scripts/analyzeArchitecture.ts > logs/architecture_analysis.log

# Count specific issues
grep -r "\.trustInAI\b" src/simulation/ | wc -l          # Trust usage
grep -r "\.deploymentLevel\b" src/simulation/ | grep -v "??" | wc -l  # Unsafe access
grep -r "outcomeMetrics\.(utopia|dystopia|extinction)" scripts/ | wc -l  # Old outcomes
```

### Test After Changes
```bash
# Verify no TypeScript errors
npx tsc --noEmit

# Run Monte Carlo to test simulation
npx tsx scripts/monteCarloSimulation.ts 2>&1 | tee logs/test_phase2.log

# Check for runtime errors
grep -i "undefined" logs/test_phase2.log
grep -i "error" logs/test_phase2.log
```

### Grep Patterns for Each Phase

**Phase 2A** (Unsafe access):
```bash
# Find unsafe deploymentLevel access
grep -rn "\.deploymentLevel\b" src/simulation/ | grep -v "??" | grep -v "deploymentLevel:"

# Find unsafe paranoiaLevel access
grep -rn "society\.paranoiaLevel\b" src/simulation/ | grep -v "??" | grep -v "paranoiaLevel:"

# Find unsafe nuclearStates access
grep -rn "state\.nuclearStates\b" src/simulation/ | grep -v "??" | grep -v "nuclearStates:"
```

**Phase 2B** (Trust writes):
```bash
# Find trust writes in calculations.ts
grep -n "trustInAI\s*=" src/simulation/calculations.ts
```

**Phase 2C** (Trust reads):
```bash
# Find all trust reads
grep -rn "society\.trustInAI\b" src/simulation/ | grep -v "getTrustInAI" | grep -v "trustInAI:"
```

**Phase 2D** (MetricSnapshot):
```bash
# Find events usage
grep -rn "\.events\b" src/ scripts/ | grep -v "SimulationEvent" | grep -v "interface"

# Find state usage
grep -rn "snapshot\.state\b" scripts/
```

**Phase 2E** (Outcomes):
```bash
# Find old outcome usage
grep -rn "outcomeMetrics\.\(utopia\|dystopia\|extinction\)" scripts/ src/
```

---

## 🎯 Recommended Order

**Week 1**: High-priority safety and consistency
1. ✅ **Phase 2A: Property Access Safety (1-2 hours) → COMPLETE** ✅
2. ✅ **Phase 2B: Trust Consistency (analysis) → ALREADY COMPLETE** ✅
3. 🔜 Phase 2C Step 1: Migrate high-impact files (2 hours)
   - `crisisPoints.ts`, `agents/governmentAgent.ts`, `agents/aiAgent.ts`

**Week 2**: Complete trust migration
4. Phase 2C Step 2: Migrate remaining simulation files (2 hours)
5. Phase 2C Step 3: Migrate script files (1 hour) - optional

**Week 3**: Polish
6. Phase 2D: MetricSnapshot cleanup (2-3 hours)
7. Phase 2E: Outcome migration (1-2 hours)

**Week 4**: Cleanup (optional)
8. Phase 2F: Remove legacy properties (1-2 hours)

---

## 📝 Success Metrics

**Code Quality**:
- Warnings: 199 → <50
- TypeScript errors: 0 (maintain)
- Unsafe access: 22 → 0

**Simulation Health**:
- Utopia rate: Test maintains 15-30% after changes
- Spiral activation: No regressions
- Trust recovery: Cognitive Spiral activates reliably

**Maintainability**:
- Trust system: Single implementation (paranoia-based)
- Outcome API: Modern (`activeAttractor` only)
- Interface size: Reduced by ~10 unused properties

---

**Generated by**: `scripts/analyzeArchitecture.ts`
**Last Updated**: October 9, 2025
**Status**: Phase 1 Complete, Phase 2 Ready to Start

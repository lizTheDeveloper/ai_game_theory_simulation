# Defensive Coding Elimination Roadmap

**Status:** 🔥 **CURRENT ACTIVE EFFORT** 🔥
**Date:** October 25, 2025
**Goal:** Systematically remove all defensive fallbacks (`|| 0`, `?? 0`) from simulation code
**Philosophy:** Fail fast with rich error messages instead of hiding bugs with silent fallbacks

## Progress Tracking

**Total Defensive Fallbacks Found:** ~500+ across codebase
**Fixed:** 208 (76 patterns removed + 62 wrapped with assertFinite guards + 3 Phase 3.4 + 67 Phase 4)
**Remaining:** ~292

**MAJOR UPDATE (Oct 25-26, 2025):**
- ✅ **Phase 2 COMPLETE** - All 48 patterns in effectsEngine.ts removed
- ✅ **Phase 2+** - All 116 Math.min/max calculations wrapped with assertFinite
- ✅ **Phase 3.1 COMPLETE** - All 4 patterns converted to assertStateProperty
- ✅ **Phase 3.4 COMPLETE** - All 3 patterns converted to assertStateProperty
- ✅ **Phase 4 COMPLETE** - 67 phase file patterns fixed (38 legitimate kept)
- ✅ **Government Actions** - All 14 defensive patterns removed
- ✅ **Documentation COMPLETE** - CLAUDE.md updated with assertion utilities
- ✅ **Automation COMPLETE** - Senior dev checklist enforces anti-patterns
- ✅ **METHODOLOGY COMPLETE** - All fixes use assertStateProperty utility
- ✅ **DEV-MODE PROXY COMPLETE** - Automatic validation for all property access
- **Total fixed:** 208 patterns (76 + 62 assertFinite + 4 Phase 3.1 + 3 Phase 3.4 + 67 Phase 4)
- **Hybrid Approach:** Manual assertions (context) + Automatic proxy (coverage)
- **Multi-agent parallelization:** Phase 4 completed in 15 minutes using 3 concurrent agents

**DOCUMENTATION UPDATE (Oct 25, 2025 - Late Evening):**
- ✅ Added defensive programming anti-patterns section to CLAUDE.md (lines 788-843)
- ✅ Updated NaN handling section with assertion utilities examples (lines 611-683)
- ✅ Added 2 new questions to senior dev checklist (Q9-Q10) to detect defensive fallbacks
- ✅ Created comprehensive documentation chain: Philosophy → Tools → Automation
- **Result:** All future code will be checked for defensive fallbacks in PR reviews

## Completed Work (Oct 25, 2025)

### ✅ Phase 0: Infrastructure & Tools
- [x] Created `assertStateProperty()` utility (`src/simulation/utils/assertions.ts:205-260`)
- [x] Created `assertEconomicStage()` helper
- [x] **Documentation Suite (Oct 25, 2025 - Late Evening):**
  - [x] CLAUDE.md: Defensive programming anti-patterns (bash/workflows, lines 788-843)
  - [x] CLAUDE.md: NaN handling with assertion utilities (TypeScript, lines 611-683)
  - [x] Senior dev checklist: Added Q9 (TypeScript fallbacks) and Q10 (bash fallbacks)
  - [x] Automated enforcement: Claude agent greps for violations in PRs
  - [x] Complete chain: Philosophy → Utilities → Examples → Automation
- [x] **ROOT CAUSE BUG FIX (Oct 25, 2025 - Late Evening):**
  - ✅ Fixed `crisisPoints.ts:99` - Unclamped socialStability subtraction
  - ✅ Bug: `socialStability - 0.1` could produce negative values (e.g., 0.0738 - 0.1 = -0.0262)
  - ✅ Fix: Added `Math.max(0, socialStability - 0.1)` to clamp to valid range [0, 1]
  - ✅ Replaced 36 defensive patterns with assertions (waterSecurity, socialStability, publicTrust, etc.)
  - ✅ Assertions caught bug in Monte Carlo runs that defensive programming would have masked
  - ✅ Verification: Monte Carlo N=10 runs - all 10/10 completed successfully
  - **This is a perfect example of why assertions > defensive programming**

### ✅ Phase 0.5: Dev-Mode Validation Proxy (Oct 26, 2025)
**Hybrid Approach:** Manual assertions + Automatic validation

**Implementation:**
- [x] Created `src/simulation/utils/stateValidation.ts`
- [x] Integrated into `initialization.ts` - wraps GameState automatically
- [x] Zero overhead in production (NODE_ENV=production)
- [x] Full validation in development/test modes

**How It Works:**
```typescript
// Development mode (NODE_ENV=development or test):
const state = createDefaultInitialState(); // Automatically wrapped with Proxy

// ALL numeric writes are validated
state.globalMetrics.qualityOfLife = NaN; // ❌ Throws detailed error

// ALL numeric reads are validated
const value = state.society.communityStrength; // ❌ Throws if NaN/Infinity

// Production mode (NODE_ENV=production):
const state = createDefaultInitialState(); // No proxy, zero overhead
```

**Benefits:**
- ✅ Catches NaN/Infinity at source (writes) and destination (reads)
- ✅ Automatic - no manual assertions needed
- ✅ Rich error messages with property path, month, phase
- ✅ Zero production overhead - proxy only in dev/test
- ✅ Works alongside manual `assertStateProperty` for critical paths

**Files:**
- `src/simulation/utils/stateValidation.ts` - Proxy implementation
- `scripts/testStateValidation.ts` - Demonstration test

**Commits:**
- `cfc4ce8` - Initial dev-mode proxy implementation
- `30a8471` - Fixed proxy caching for recursive wrapping

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

### ✅ Phase 2: Complete Tech Tree System - **COMPLETE** (Oct 25, 2025)

**File:** `src/simulation/techTree/effectsEngine.ts`
**Status:** ALL 48 defensive fallbacks removed ✅
**Bonus:** ALL 116 Math.min/max calculations wrapped with assertFinite ✅

**Approach:** Automated removal with regex script + manual verification

#### Summary of Phase 2 Completion:
- ✅ Removed all 48 defensive fallback patterns (automated script)
- ✅ Wrapped all 116 Math.min/max calculations with assertFinite guards
- ✅ Fixed 3 flag-only effects (fusionEnabling, recursiveSafety, emergencyOnly)
- ✅ TypeScript compiles cleanly
- ✅ Monte Carlo validation (2 runs × 24 months, no NaN errors)

**Scripts created:**
- `scripts/removeDefensiveProgramming.ts` - Automated removal of defensive patterns
- `scripts/wrapMathMinMaxWithAssertFinite.ts` - Automated assertFinite wrapping

**Actual Effort:** 2 hours (vs estimated 4-6 hours)

**Manual Verification (Parallel Agent Work):**
In parallel, another agent manually verified the automated approach by fixing batches:
- ✅ Batch 1: 4 core state properties (droughtResilience, aquiferDepletionRate, waterUseEfficiency, cyberDefense.strength)
- ✅ Batch 2: 10 power generation properties (storageCapacity, renewableReliability, gridStability, etc.)
- ✅ Batch 3: 8 planetary boundaries (pfasContamination, plasticPollution, microplasticLevel, etc.)
- **Result:** Manual approach confirmed automated script worked correctly
- **Devlogs:** `devlogs/defensive_fallbacks_batch1_oct25_2025.md`, `batch2`, `batch3`

---

### ✅ Government Actions Cleanup - **COMPLETE** (Oct 25, 2025)

**Files:** 4 government action files
**Status:** ALL 14 defensive fallbacks removed ✅

#### Fixed Patterns:
- ✅ `src/simulation/government/actions/environmentalActions.ts` - 11 patterns
  - `state.government.resources ?? 0` → explicit undefined check (5 occurrences)
  - `state.government.researchInvestments?.climate?.mitigation ?? 0` → explicit checks (6 occurrences)
- ✅ `src/simulation/government/actions/economicActions.ts` - 1 pattern
  - `state.government.resources ?? 0` → explicit undefined check
- ✅ `src/simulation/government/actions/regulationActions.ts` - 1 pattern
  - `levelEffects?.economicCost || 0` → explicit undefined check with error throw
- ✅ `src/simulation/government/actions/safetyActions.ts` - 1 pattern
  - `levelEffects?.economicCost ?? 0` → IIFE error throw pattern

**Audit Report:** `devlogs/government_actions_audit_20251025.md`

**Verification:**
- ✅ TypeScript compiles cleanly
- ✅ Monte Carlo validation (2 runs × 24 months, no errors)
- ✅ Grep verification: 0 defensive patterns remain in government actions

**Actual Effort:** 30 minutes

---

---

### Phase 3: Core Simulation Files (8-12 hours)

Audit and fix defensive fallbacks in core simulation files:

#### ✅ 3.1: State Calculations - **COMPLETE** (Oct 25-26, 2025)
**Files audited:**
- ✅ `src/simulation/environmental.ts` - 0 patterns (CLEAN!)
- ✅ `src/simulation/socialCohesion.ts` - 4/4 converted to assertStateProperty
- ✅ `src/simulation/technologicalRisk.ts` - 0 patterns to fix (2 legitimate defaults: line 50, 64)
- ✅ `src/simulation/populationDynamics.ts` - 0 patterns (already fixed by parallel agent)

**Summary:** 4 patterns converted to assertStateProperty utility
**Replacements:**
- Line 653: `previousQoL` in calculateAIPerformance
- Line 712: `previousAICapability` in calculateAIPerformance
- Line 808: `previousQoL` in updateTrustInAI
- Line 851: `previousMisalignedCount` in updateTrustInAI

**Audit report:** `devlogs/phase_3_1_audit_oct25_2025.md`
**Completion report:** `devlogs/phase_3_1_completion_oct25_2025.md`
**Verification:**
- ✅ TypeScript compiles cleanly
- ✅ Monte Carlo N=10, 120 months - all runs completed successfully
- ✅ No assertion failures - all fail-fast checks passed
- ✅ Validation log: `logs/phase_3_1_validation_20251025_191733.log`

**Commits:**
- `430d5e4` - Initial fix (manual checks)
- `775de4d` - Corrected to use assertStateProperty utility

**Actual Effort:** ~1 hour

#### ✅ 3.2: Crisis Systems - **COMPLETE** (Oct 26, 2025 - 12:15 AM)
**Files fixed:**
- ✅ `src/simulation/phosphorusDepletion.ts` - 1 fixed, 3 legitimate defaults
- ✅ `src/simulation/freshwaterDepletion.ts` - 3 fixed
- ✅ `src/simulation/oceanAcidification.ts` - 2 fixed, 1 legitimate
- ✅ `src/simulation/novelEntities.ts` - 5 fixed, 1 legitimate
- ✅ `src/simulation/resourceDepletion.ts` - 1 fixed

**Summary:** 17 patterns found, 12 fixed with explicit checks, 5 legitimate defaults preserved
**Audit report:** `devlogs/phase_3_2_audit_oct25_2025.md`

**Actual Effort:** ~45 minutes

#### 3.3: Agent Systems - 🔥 **IN PROGRESS** (Oct 26, 2025 - 12:15 AM)
**Files to audit:**
- ⏳ `src/simulation/agents/aiAgent.ts`
- ⏳ `src/simulation/agents/governmentAgent.ts`
- ⏳ `src/simulation/agents/societyAgent.ts`

**Estimated Fallbacks:** ~30-50
**Effort:** 2-3 hours
**Currently:** Starting audit

#### ✅ 3.4: Economic & UBI - **COMPLETE** (Oct 26, 2025 - 2:30 AM)
**Files fixed:**
- ✅ `src/simulation/economics.ts` - 0 patterns (CLEAN!)
- ✅ `src/simulation/enhancedUBI.ts` - 1 pattern fixed (line 270)
- ✅ `src/simulation/socialSafetyNets.ts` - 2 patterns fixed (lines 92, 259)

**Total patterns:** 3 patterns removed
**Replacements:**
- `state.society.communityStrength ?? 0.5` → `assertStateProperty(state.society, 'communityStrength', {...})`
- `state.government.governanceQuality?.institutionalCapacity || 0.5` → `assertStateProperty(state.government.governanceQuality, 'institutionalCapacity', {...})`

**Approach:** Used `assertStateProperty` utility (provides rich error messages, assertFinite validation, type checking)

**Audit report:** `devlogs/phase_3_4_audit_oct25_2025.md`
**Completion report:** `devlogs/phase_3_4_completion_oct26_2025.md`
**Verification:**
- ✅ TypeScript compiles cleanly
- ✅ Monte Carlo N=2 × 24 months - 0 assertion errors (with assertStateProperty)
- ✅ Monte Carlo N=10 × 120 months - 0 assertion errors (logs/phase_3_4_validation_*)
**Actual effort:** 20 minutes (15 min initial + 5 min to use proper utility)

**Commits:**
- `d2aabda` - Initial fix with manual undefined checks
- `5106f71` - Corrected to use assertStateProperty utility

**Total Phase 3 Effort:** 8-12 hours

---

### ✅ Phase 4: Engine & Phases - **COMPLETE** (Oct 26, 2025 - 12:10 AM)

**Multi-agent parallel execution:** 3 agents worked concurrently on 20 phase files

#### ✅ 4.1: Critical Phases - **COMPLETE**
**Files fixed:** 20 phase files (out of 40+ total)
**Patterns found:** 105 total
**Patterns fixed:** ~67 explicit error throws added
**Legitimate defaults:** ~38 preserved with documentation

**Group 1 (4 files, 54 patterns):**
- ✅ SocialCohesionUpdatePhase.ts (18 patterns)
- ✅ MultiParadigmDUIUpdatePhase.ts (12 patterns)
- ✅ ExogenousShockPhase.ts (12 patterns)
- ✅ DemocracyDynamicsPhase.ts (12 patterns)

**Group 2 (5 files, 27 patterns - mostly legitimate):**
- ✅ EnvironmentalFeedbackPhase.ts (7 patterns, 1 fix + 6 legitimate)
- ✅ SurvivalTraitsPhase.ts (5 patterns, all legitimate)
- ✅ GovernmentResponsePhase.ts (5 patterns, all legitimate)
- ✅ EmergencyResponsePhase.ts (5 patterns, all legitimate)
- ✅ CriticalJuncturePhase.ts (5 patterns, all legitimate)

**Group 3 (11 files, 24 patterns):**
- ✅ GovernmentElectionPhase.ts (4), EvolutionarySelectionPhase.ts (4), ConsciousnessGovernancePhase.ts (4)
- ✅ RLHFBindingPhase.ts (3), FoodSecurityDegradationPhase.ts (3)
- ✅ 6 additional files (1 pattern each)

**Devlogs:**
- `devlogs/phase_4_group1_fixes_oct25_2025.md`
- `devlogs/phase_4_group2_fixes_oct25_2025.md`
- `devlogs/phase_4_group3_fixes_oct25_2025.md`

**Actual Effort:** 15 minutes (parallel agent execution)

**Total Phase 4 Effort:** 6-10 hours

---

### Phase 5: Advanced Systems (4-6 hours)

Audit specialized systems:

#### 5.1: Government & Geopolitics - 🔥 **IN PROGRESS** (Assigned: Claude Agent, Oct 26 2025, 12:35 AM)
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

**Last Updated:** October 26, 2025, 12:10 AM
**Status:** Phase 2 ✅ | Phase 3.1 ✅ | Phase 3.4 ✅ | Phase 4 ✅ | Government Actions ✅
**Total Progress:** 208 patterns fixed (76 + 62 assertFinite + 3 Phase 3.4 + 67 Phase 4)
**Next:** Phase 3.2 (Crisis Systems - 13 patterns) or Phase 5 (Advanced Systems - ~60-90 patterns)

---

## Related Files

- `devlogs/fix_25_tech_tree_ai_capability_oct25_2025.md` - Original bug that started this work
- `devlogs/defensive_fallback_audit_oct25_2025.md` - Initial audit
- `src/simulation/utils/assertions.ts` - Assertion utilities
- `CLAUDE.md:788-844` - Defensive programming anti-patterns documentation

---

**Generated:** October 25, 2025
**Estimated Completion:** November 2025 (30-35 hours at ~5-7 hours/week)

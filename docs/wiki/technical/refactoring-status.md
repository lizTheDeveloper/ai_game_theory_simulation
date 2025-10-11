# Refactoring Status & Roadmap

**Last Updated**: October 10, 2025
**Overall Status**: Phase 0 Complete, Phases 1-6 Planned

---

## Overview

This page tracks the status of all refactoring efforts for the Super Alignment to Utopia simulation engine. We're following a multi-phase approach to improve code quality, maintainability, and developer experience while preserving all simulation behavior.

**Two parallel tracks:**
1. **Architectural Cleanup** (Phase 0 / Phase 2A-2F) - COMPLETE ✅
2. **Major Refactoring** (Phases 1-6) - PLANNED 📋

---

## Phase 0: Architectural Cleanup ✅ COMPLETE

**Date**: October 10, 2025
**Duration**: 1 day
**Goal**: Critical safety and consistency fixes before major refactoring

### What Was Completed

#### Phase 2A: Property Access Safety ✅
- **Fixed**: 22 unsafe property accesses
- **Method**: Optional chaining (`?.`) and nullish coalescing (`?? default`)
- **Impact**: Zero runtime crashes from undefined properties
- **Files**: breakthroughTechnologies.ts, environmental.ts, calculations.ts, extinctions.ts, nuclearStates.ts, testEmergencyDeployment.ts

#### Phase 2B: Trust System Consistency ✅
- **Verified**: Trust system already consistent
- **Finding**: `updateParanoia()` correctly derives trust from paranoia
- **Impact**: Confirmed no blocking issues for Cognitive Spiral

#### Phase 2C: Trust System Migration ✅
- **Migrated**: 10 trust reads across 9 files
- **Method**: Use `getTrustInAI()` helper instead of direct reads
- **Preserved**: 21 trust writes for backward compatibility
- **Impact**: Consistent trust semantics throughout codebase

#### Phase 2D: MetricSnapshot Cleanup ✅
- **Fixed**: 2 broken diagnostic scripts
- **Method**: Use `result.log.events.criticalEvents` instead of removed properties
- **Preserved**: Lightweight MetricSnapshot architecture
- **Impact**: Scripts no longer crash, architecture stays clean

#### Phase 2E: Outcome API Verification ✅
- **Verified**: System already uses modern `activeAttractor` API
- **Finding**: No boolean flags ever existed
- **Impact**: Confirmed modern API throughout

#### Phase 2F: Legacy Property Deprecation ✅
- **Marked**: 7 unused properties with `@deprecated` tags
- **Documented**: Clear migration paths for Phase 3 removal
- **Impact**: Developers warned via IDE, safe gradual migration

### Results

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| **TypeScript Errors** | 0 | 0 | ✅ Maintained |
| **Warnings** | 199 | 167 | -32 ✅ |
| **Unsafe Access** | 22 | 0 | -22 ✅ |
| **Trust Reads (Legacy)** | 31 | 21 | -10 ✅ |
| **Broken Scripts** | 2 | 0 | -2 ✅ |

### Documentation

- **Detailed Plan**: `/plans/architectural-cleanup-plan-phase2.md`
- **Technical Doc**: [`/docs/wiki/technical/phase2-refactoring.md`](./phase2-refactoring.md)
- **Commit**: `3c279a6` - "feat: Complete Phase 2 architectural cleanup (2C-2F)"

---

## Major Refactoring Phases (Planned)

**Roadmap**: `/plans/refactoring-roadmap.md`
**Status**: Planning/Not Started
**Goal**: Systematic architecture improvements

### Phase 1: Foundation - Shared Utilities 📋

**Status**: Planned
**Effort**: 4-6 hours
**Risk**: Low (pure functions, no state changes)

**Goals:**
- Extract duplicate math utilities (`clamp`, `lerp`, `mapRange`)
- Extract AI calculation utilities (`getAverageAICapability`, etc.)
- Create `src/simulation/utils/` directory
- Reduce code duplication by 100-200 lines

**Files to Create:**
- `src/simulation/utils/math.ts`
- `src/simulation/utils/ai.ts`
- `src/simulation/utils/validation.ts`

**Migration:**
- Replace inline utilities in 8+ files
- Update imports throughout codebase

### Phase 2: System Abstractions 📋

**Status**: Planned
**Effort**: 12-16 hours
**Risk**: Medium (requires careful interface design)

**Goals:**
- Create common interfaces for similar systems
- Implement `SimulationSystem`, `AccumulationSystem`, `SpiralSystem` interfaces
- Create `SystemRegistry` for centralized management
- Wrap existing systems (environmental, social, technological)

**Files to Create:**
- `src/simulation/systems/interfaces.ts`
- `src/simulation/systems/SystemRegistry.ts`
- `src/simulation/systems/EnvironmentalSystem.ts` (wrapper)
- `src/simulation/systems/SocialCohesionSystem.ts` (wrapper)
- `src/simulation/systems/TechnologicalRiskSystem.ts` (wrapper)

**Benefits:**
- Makes system dependencies explicit
- Enables easier testing and composition
- Standardizes initialization/update patterns
- Reduces coupling between systems

### Phase 3: Initialization Refactoring 📋

**Status**: Planned
**Effort**: 8-12 hours
**Risk**: Medium (complex dependencies)

**Goals:**
- Create modular, testable initialization
- Implement `StateBuilder` pattern
- Extract AI agent creation logic
- Reduce `createDefaultInitialState()` from 350+ to <50 lines

**Files to Create:**
- `src/simulation/initialization/StateBuilder.ts`
- `src/simulation/initialization/aiAgents.ts`
- `src/simulation/initialization/systems.ts`

**Benefits:**
- Testable initialization
- Easier to create custom scenarios
- Clear initialization order
- Better error messages

### Phase 4: Engine Orchestration Cleanup 📋

**Status**: Planned
**Effort**: 16-24 hours
**Risk**: Medium-High (core simulation loop)

**Goals:**
- Simplify `engine.step()` from 300+ to <100 lines
- Create `PhaseOrchestrator` for explicit phase management
- Convert each simulation step to a `SimulationPhase` object
- Make phase dependencies explicit via order numbers

**Files to Create:**
- `src/simulation/engine/PhaseOrchestrator.ts`
- `src/simulation/engine/phases/ComputeGrowthPhase.ts`
- `src/simulation/engine/phases/OrganizationTurnsPhase.ts`
- 20+ more phase files (one per simulation step)

**Benefits:**
- Clearer execution order
- Easier to debug phase interactions
- Better testability (test phases in isolation)
- Explicit dependencies

### Phase 5: State Management Consistency 📋

**Status**: Planned
**Effort**: 20-30 hours
**Risk**: High (touches all update functions)

**Goals:**
- Consistent mutation strategy across all systems
- Integrate Immer.js for controlled immutability
- Migrate all update functions to consistent pattern
- Add type safety for state updates

**Files to Modify:**
- 25+ system update functions
- Create `src/simulation/utils/state.ts`

**Benefits:**
- Predictable state updates
- Easier debugging (immutable history)
- Better type safety
- Reduced mutation bugs

### Phase 6: Type Organization 📋

**Status**: Planned
**Effort**: 6-8 hours
**Risk**: Low (types don't affect runtime)

**Goals:**
- Centralize and organize type definitions
- Extract inline types to dedicated files
- Create `types/systems/` directory structure
- Add comprehensive type documentation

**Files to Create:**
- `types/systems/environmental.ts`
- `types/systems/social.ts`
- `types/systems/meaning.ts`
- 10+ more type files

**Benefits:**
- Easier to find type definitions
- Better type documentation
- Reduced `game.ts` from 1000+ lines
- Clearer system boundaries

---

## Timeline & Roadmap

### Completed ✅

| Phase | Name | Dates | Effort | Status |
|-------|------|-------|--------|--------|
| **0** | Architectural Cleanup | Oct 10, 2025 | 1 day | ✅ Complete |

### Planned 📋

| Phase | Name | Estimated Effort | Risk | Priority |
|-------|------|------------------|------|----------|
| **1** | Shared Utilities | 4-6 hours | Low | High |
| **2** | System Abstractions | 12-16 hours | Medium | High |
| **3** | Initialization | 8-12 hours | Medium | Medium |
| **4** | Engine Orchestration | 16-24 hours | High | Low |
| **5** | State Management | 20-30 hours | High | Low |
| **6** | Type Organization | 6-8 hours | Low | Low |

**Total Estimated Effort**: ~70-100 hours (2-3 weeks full-time)

### Suggested Sequence

**Sprint 1 (Week 1):**
- Day 1-2: Phase 1 - Shared Utilities
- Day 3-5: Phase 2 - System Abstractions

**Sprint 2 (Week 2):**
- Day 1-2: Phase 2 - System Abstractions (complete)
- Day 3-4: Phase 3 - Initialization
- Day 5: Phase 4 - Engine (start)

**Sprint 3 (Week 3):**
- Day 1-3: Phase 4 - Engine (complete)
- Day 4-5: Phase 6 - Type Organization

**Sprint 4+ (Ongoing):**
- Phase 5 - State Management (gradual migration)

---

## Testing Strategy

### Validation Requirements

**Every refactoring phase must:**

1. **Pass Monte Carlo Baseline**
   - Run 10 simulations with fixed seeds (1000-1009)
   - Compare outcomes to baseline snapshots
   - Must match exactly (zero tolerance for changes)

2. **Maintain Performance**
   - Run 1000-simulation benchmark
   - Performance must be ±5% of baseline
   - Flag significant regressions

3. **Pass Type Checks**
   - `npx tsc --noEmit` must pass
   - No new `any` types added
   - Maintain or improve type coverage

4. **Update Documentation**
   - Wiki docs updated
   - Code comments added
   - Examples provided

### Regression Test Setup

**Before starting any phase, create baseline:**

```bash
# Run baseline tests
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=100 > baseline.log

# Create snapshot tests
npm test -- --updateSnapshot

# Record performance
time npx tsx scripts/monteCarloSimulation.ts --runs=1000 --max-months=60
```

**After each phase:**

```bash
# Verify identical results
npx tsx scripts/monteCarloSimulation.ts --runs=10 --max-months=100 > refactored.log
diff baseline.log refactored.log  # Should show zero differences

# Verify type safety
npx tsc --noEmit --strict

# Verify tests pass
npm test
```

---

## Success Metrics

### Code Quality (Target)

| Metric | Before | Target | Improvement |
|--------|--------|--------|-------------|
| Duplicate code instances | 8+ | 0 | -8 |
| Engine.step() LOC | 300+ | <100 | -200 |
| Initialization LOC | 350+ | <100 | -250 |
| Average module coupling | High | Low | -50% |
| Total simulation LOC | 20,000 | 18,000 | -10% |

### Developer Experience (Target)

| Metric | Before | Target | Improvement |
|--------|--------|--------|-------------|
| Time to add new system | 4-6h | 2-3h | -50% |
| Files to modify per change | 5+ | 2-3 | -50% |
| Onboarding time | 2 weeks | 1 week | -50% |

### Functional (Requirements)

| Metric | Requirement |
|--------|-------------|
| Monte Carlo results | Identical to baseline |
| Simulation performance | ±5% of baseline |
| All tests passing | 100% |
| Type safety | No `any` types added |
| Documentation | All new code documented |

---

## Risk Mitigation

### High-Risk Phases

1. **Phase 4: Engine Orchestration** (highest risk)
   - Risk: Breaking simulation execution order
   - Mitigation: Convert one phase at a time, validate after each
   - Rollback: Keep feature branch, don't merge until 100% validated

2. **Phase 5: State Management** (high risk)
   - Risk: Introducing mutations where immutability expected
   - Mitigation: Use TypeScript strict mode, add immutability tests
   - Rollback: Work in isolated branches, extensive testing

### Rollback Strategy

**For each phase:**

```bash
# Start phase in feature branch
git checkout -b refactor/phase-N
git commit -m "Phase N: Initial commit"

# Make incremental changes
git add .
git commit -m "Phase N: [specific change]"

# Test thoroughly
npm test
npx tsx scripts/monteCarloSimulation.ts --runs=10

# If tests fail
git reset --hard HEAD~1  # Rollback last commit

# If tests pass
git checkout main
git merge refactor/phase-N
```

---

## Post-Refactoring Opportunities

**After completing all phases, we'll be positioned to add:**

1. **Dependency Injection**
   - Pluggable systems
   - Custom implementations
   - Modding support

2. **Event System**
   - Decouple systems via events
   - Reactive programming
   - Better debugging/replay

3. **Parallel Execution**
   - Parallelizable phases
   - Web Workers for Monte Carlo
   - 10x simulation throughput

4. **Persistence Layer**
   - Save/load simulations
   - Snapshot system
   - Time-travel debugging

5. **Visualization Hooks**
   - System health dashboards
   - Real-time metrics
   - Debug overlays

---

## Current Codebase Status

### Strengths ✅

- **Simulation logic is sound**: Models are well-researched and realistic
- **Type safety**: Full TypeScript with strict mode
- **Zero crashes**: Phase 0 eliminated unsafe property access
- **Consistent trust**: Paranoia-based trust system working correctly
- **Modern APIs**: Using `activeAttractor` outcome API
- **Good test coverage**: Monte Carlo validation pipeline established

### Technical Debt 📋

- **Engine.step() complexity**: 300+ lines, hard to understand execution order
- **Initialization complexity**: 350+ lines, difficult to customize
- **Code duplication**: Math/AI utilities repeated 8+ times
- **No system abstractions**: Each system implemented differently
- **Direct mutations**: State updates via direct mutation (works but risky)
- **Type organization**: All types in single 1000+ line `game.ts` file

### Priority: What to Refactor First

**High Priority (Phases 1-2):**
- Extract shared utilities (eliminates duplication)
- Create system abstractions (enables consistent patterns)

**Medium Priority (Phase 3):**
- Refactor initialization (improves testability)

**Low Priority (Phases 4-6):**
- Engine orchestration (works but complex)
- State management (works but could be safer)
- Type organization (works but hard to navigate)

---

## Questions & Decisions

### Open Questions

1. **Should we use Immer for state management?**
   - Pro: Safer mutations, good TypeScript support
   - Con: Adds dependency, learning curve
   - Decision: TBD (Phase 5)

2. **How aggressively should we refactor?**
   - Option A: All phases in one push
   - Option B: Incremental, as needed
   - Decision: Incremental (start with Phases 1-2)

3. **When should we start Phase 1?**
   - After confirming Phase 0 has no regressions
   - After 50-100 run Monte Carlo validation
   - Decision: TBD

### Decisions Made

1. ✅ **Complete Phase 0 before major refactoring**
   - Rationale: Fix safety issues first
   - Status: Complete (Oct 10, 2025)

2. ✅ **Use optional chaining for property access**
   - Rationale: TypeScript-native, zero overhead
   - Status: Implemented in Phase 2A

3. ✅ **Preserve trust writes for backward compatibility**
   - Rationale: Safer gradual migration
   - Status: 21 writes preserved in Phase 2C

4. ✅ **Keep MetricSnapshot lightweight**
   - Rationale: Better performance, clearer architecture
   - Status: Scripts updated in Phase 2D

---

## References

- **Phase 0 Plan**: `/plans/architectural-cleanup-plan-phase2.md`
- **Phase 0 Details**: [`./phase2-refactoring.md`](./phase2-refactoring.md)
- **Phases 1-6 Roadmap**: `/plans/refactoring-roadmap.md`
- **Architectural Review**: `/plans/architectural-review.md`
- **Codebase Structure**: [`./codebase.md`](./codebase.md)
- **Engine Architecture**: [`./engine.md`](./engine.md)

---

**Status**: Phase 0 complete, codebase safe and consistent. Ready to begin Phases 1-6 when prioritized.

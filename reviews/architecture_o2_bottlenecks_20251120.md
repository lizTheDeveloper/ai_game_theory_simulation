# Architectural Review: O(n²) Performance Bottlenecks

**Date:** November 20, 2025
**Reviewer:** Architecture Skeptic
**Focus:** Performance bottlenecks, state propagation, scalability
**Priority:** HIGH-1 (Roadmap Item)

## Executive Summary

The simulation suffers from multiple O(n²) performance bottlenecks in critical hot paths that execute every simulation step. With realistic configurations (50 agents × 200 organizations), these patterns create ~101,000 unnecessary operations per step. While not causing immediate instability, these bottlenecks significantly degrade performance during Monte Carlo runs and will become critical as the simulation scales.

## Critical Issues Identified

### 1. CRITICAL: Datacenter Ownership Lookups
**Severity:** CRITICAL
**Files:** `governmentAgent.ts`, `computeInfrastructure.ts`, `crisisActions.ts`
**Lines:** Multiple (1497, 1508, 1522 in governmentAgent.ts)

**Problem:**
```typescript
const org = state.organizations.find(o => o.ownedDataCenters.includes(dc.id));
```
This pattern appears 7 times in critical paths. For each datacenter, we search through all organizations, and for each organization, we search through their owned datacenters array.

**Impact:**
- 60,000 operations per step (100 DCs × 200 orgs × 3 lookups)
- Executes during government actions, crisis responses, and infrastructure updates
- Becomes O(n³) when called in loops over datacenters

**Root Cause:**
No indexing structure exists for the datacenter-organization relationship. The system treats ownership as a property of organizations rather than maintaining a bidirectional index.

### 2. HIGH: Organization Competition Checks
**Severity:** HIGH
**File:** `organizationManagement.ts`
**Line:** 109

**Problem:**
```typescript
const competitorBuilding = state.organizations
  .filter(o => o.id !== org.id && o.type === 'private')
  .some(o => o.currentProjects.some(p => p.type === 'datacenter_construction'));
```

**Impact:**
- 40,000 operations per step in worst case (200 orgs × 200 orgs)
- Executes for every organization's building decision
- Creates competitive dynamics lag

**Note:** The same file contains an ALREADY FIXED O(n²) pattern (lines 37-73) for compute utilization, showing the team is aware of these issues but hasn't applied the fix universally.

### 3. HIGH: Agent Collective Membership
**Severity:** HIGH
**File:** `collectiveFormation.ts`
**Line:** 196

**Problem:**
```typescript
const agent = agents.find(a => a.id === agentId);  // O(n) - PERFORMANCE WARNING
```

**Impact:**
- 500 operations per collective update (10 collectives × 50 agents)
- Less severe than datacenter lookups but still problematic
- The code even includes a warning comment but hasn't been fixed

### 4. MEDIUM: Tech Tree Array Lookups
**Severity:** MEDIUM
**Files:** `techTree/engine.ts`, `nitrogenFoodCoupling.ts`
**Lines:** Multiple (134, 218, 469)

**Problem:**
```typescript
if (!state.techTreeState.unlockedTech.includes(tech.id))
```

**Impact:**
- 710 operations per step (estimated 10 checks × 71 tech)
- O(n) for each check when using array.includes()
- Accumulates across multiple phases

## Performance Analysis

### Current State (Per Step)
- **Total O(n²) operations:** 101,210
- **Estimated time:** 1.01ms (at 10ns per operation)
- **Per game (240 steps):** 24.3 million operations
- **Per Monte Carlo (100 games):** 2.4 billion operations

### After Optimization
- **Expected operations:** ~2,000 (98% reduction)
- **Estimated time:** 0.02ms
- **Performance gain:** 50× improvement in hot paths

## State Propagation Issues

The O(n²) patterns reveal deeper architectural problems:

1. **Missing Index Structures:** The system lacks proper indexing for relationships (DC→Org, Agent→Collective, Tech→Deployment)

2. **Inconsistent Optimization:** Some areas (compute utilization) are optimized while identical patterns elsewhere aren't

3. **Phase Isolation:** Phases can't share computed indices, forcing recomputation

4. **Ownership Model:** Datacenters tracking is split between DC objects and organization arrays, creating consistency risks

## Recommendations

### Priority 1: Build Shared Index Infrastructure (CRITICAL)

Create a `SimulationIndices` structure built once per step:

```typescript
interface SimulationIndices {
  datacenterOwnership: Map<string, string>;  // dcId → orgId
  agentMap: Map<string, AIAgent>;           // agentId → agent
  orgMap: Map<string, Organization>;        // orgId → org
  unlockedTech: Set<string>;                // techId set
  buildingOrgs: Set<string>;                // orgIds currently building
}
```

**Effort:** 4-5 hours
**Risk:** Low - additive change, doesn't modify core logic
**Impact:** Eliminates 100,000+ operations per step

### Priority 2: Update PhaseContext for Index Sharing (HIGH)

Extend `PhaseContext` to carry indices between phases:

```typescript
interface PhaseContext {
  // ... existing fields
  indices?: SimulationIndices;
}
```

**Effort:** 2 hours
**Risk:** Low - optional field, backward compatible
**Impact:** Prevents index rebuilding across phases

### Priority 3: Systematic Replacement (HIGH)

Replace all identified patterns:
- 7 datacenter ownership lookups
- 1 competition check pattern
- 1 collective membership lookup
- 3+ tech unlock checks

**Effort:** 3-4 hours
**Risk:** Medium - requires careful testing of each replacement
**Impact:** Full performance benefit realization

### Priority 4: Add Performance Monitoring (MEDIUM)

Instrument hot paths with timing measurements:

```typescript
const start = performance.now();
// ... phase execution
if (performance.now() - start > 10) {
  console.warn(`Phase ${name} exceeded 10ms budget: ${time}ms`);
}
```

**Effort:** 1 hour
**Risk:** None
**Impact:** Prevents regression, identifies future bottlenecks

## Implementation Plan

### Phase 1: Infrastructure (Day 1)
1. Create `SimulationIndices` interface and builder functions
2. Add indices to `PhaseContext`
3. Build indices at step start in `PhaseOrchestrator`

### Phase 2: Critical Paths (Day 1-2)
1. Replace datacenter ownership lookups (7 instances)
2. Test government actions thoroughly
3. Verify crisis response behaviors

### Phase 3: High Priority (Day 2)
1. Fix organization competition checks
2. Fix agent collective lookups
3. Run organizational behavior tests

### Phase 4: Cleanup (Day 3)
1. Convert tech arrays to Sets
2. Add performance monitoring
3. Document new index patterns

## Risk Assessment

**Low Risk Areas:**
- Index building is additive, doesn't change logic
- Map/Set lookups are well-understood patterns
- Can be rolled back phase by phase if issues arise

**Medium Risk Areas:**
- Serialization might need updates for Set types
- Some edge cases might depend on array ordering
- Index consistency must be maintained

**Mitigation:**
- Implement incrementally with thorough testing
- Keep original code paths available via feature flag initially
- Monitor performance metrics before/after

## Conclusion

The simulation has significant but fixable O(n²) bottlenecks. The patterns are well-understood, solutions are straightforward (indexing), and one successful optimization already exists in the codebase as a template.

**Estimated effort:** 10-12 hours total
**Expected improvement:** 50-100× reduction in hot path operations
**Risk level:** Low to Medium
**Business impact:** Enables faster Monte Carlo runs, better scalability

The most concerning aspect isn't the bottlenecks themselves but the inconsistent application of optimizations. The team clearly knows how to fix these issues (as shown in the compute utilization fix) but hasn't systematically applied the pattern. This suggests a need for:

1. Code review focusing on performance patterns
2. Shared utilities for common indexing needs
3. Performance budgets for phases (10ms target)

**Recommendation:** Schedule this work between feature implementations. It's not urgent enough to halt feature development but important enough to address soon before the performance debt compounds.

## Files Requiring Changes

### Critical Files (Datacenter Ownership)
- `/src/simulation/agents/governmentAgent.ts` (lines 1497, 1508, 1522)
- `/src/simulation/computeInfrastructure.ts` (line 344)
- `/src/simulation/government/actions/crisisActions.ts` (lines 97, 108, 122)

### High Priority Files
- `/src/simulation/organizationManagement.ts` (line 109)
- `/src/simulation/collectiveFormation.ts` (line 196)

### Medium Priority Files
- `/src/simulation/techTree/engine.ts` (lines 134, 218, 469)
- `/src/simulation/nitrogenFoodCoupling.ts` (line 345)
- `/src/simulation/techTree/effectsEngine.ts` (line 3135)

### Infrastructure Files
- `/src/simulation/engine/PhaseOrchestrator.ts` (add index building)
- `/src/types/game.ts` (add SimulationIndices type)
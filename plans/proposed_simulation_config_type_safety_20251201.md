# Proposed Plan: Simulation Config Type Safety

**Date:** December 1, 2025
**Priority:** LOW
**Effort:** Small (15 minutes)
**Category:** Technical Debt / Type Safety

## Problem Statement

From Architecture Review (Dec 1, 2025 - Grade A-):

> **MEDIUM-2:** Parameter Sweep Config Stored in simulationConfig Object
>
> The `simulationConfig` object is created dynamically with `?? {}` pattern at initialization.ts:1819. While this works correctly, it lacks proper TypeScript typing, reducing IDE support and potential compile-time safety.

**Current State:**
```typescript
// src/simulation/initialization.ts:1819-1828
state.simulationConfig = state.simulationConfig ?? {};
state.simulationConfig.collapseRegimeMultiplier = parameterSweepConfig.collapseRegimeMultiplier;
// ... other parameters
```

**Issue:** No formal `SimulationConfig` interface in `src/types/game.ts`, leading to:
- Reduced IDE autocomplete support
- No compile-time validation of config properties
- Inconsistent with project's strict TypeScript philosophy

## Proposed Solution

### Phase 1: Define Interface (5 min)

Add to `src/types/game.ts`:

```typescript
export interface SimulationConfig {
  // Parameter sweep parameters
  climateSensitivity?: number;
  carbonSinkMultiplier?: number;
  aiCoordinationStressMultiplier?: number;
  techAdoptionSteepness?: number;
  bifurcationThreshold?: number;
  collapseRegimeMultiplier?: number;
  breakdownRegimeMultiplier?: number;

  // Future extensibility
  [key: string]: number | undefined;
}
```

### Phase 2: Add to GameState (5 min)

Update `GameState` interface:

```typescript
export interface GameState {
  // ... existing fields
  simulationConfig?: SimulationConfig;
  // ... rest of fields
}
```

### Phase 3: Type-safe Initialization (5 min)

Update initialization.ts:

```typescript
// Replace ?? {} with proper type
const config: SimulationConfig = {
  collapseRegimeMultiplier: parameterSweepConfig.collapseRegimeMultiplier,
  breakdownRegimeMultiplier: parameterSweepConfig.breakdownRegimeMultiplier,
  // ... other parameters
};
state.simulationConfig = config;
```

## Research Foundation

**Justification:** Type safety is core to project philosophy (see CLAUDE.md: "This codebase uses **very strict TypeScript**"). Dynamic object creation with `?? {}` is acceptable for initialization but should be typed.

**No peer-reviewed research needed** - pure TypeScript best practice.

## Acceptance Criteria

1. `SimulationConfig` interface exists in `src/types/game.ts`
2. `GameState.simulationConfig` properly typed as `SimulationConfig | undefined`
3. All initialization code uses typed config objects
4. All consuming code (effectsEngine.ts:374, SocialStabilitySystemPhase.ts:118) type-checks correctly
5. `npx tsc --noEmit` passes with no new errors
6. All 460 tests continue passing

## Expected Timeline

- **Implementation:** 15 minutes
- **Testing:** 5 minutes (type check + existing test suite)
- **Total:** 20 minutes

## Failure Modes

**Low Risk:**
- Type definition doesn't match usage → Caught by TypeScript compiler immediately
- Missing properties in interface → Caught by consuming code type errors

**Mitigation:** Test with `npx tsc --noEmit` before committing.

## Interaction Map

**Affects:**
- `src/types/game.ts` - Interface definition
- `src/simulation/initialization.ts` - Config creation
- `src/simulation/techTree/effectsEngine.ts` - Config consumption
- `src/simulation/engine/phases/SocialStabilitySystemPhase.ts` - Config consumption

**Is affected by:** None (pure type addition)

## Validation Command

```bash
# Type checking
npx tsc --noEmit

# Test suite
npm test

# Verify IDE autocomplete manually
```

## Related Work

- **M-3:** Parameter injection infrastructure (Session 23, commit 77510ed6) - This formalizes the config interface
- **Architecture Review:** Dec 1, 2025 - Grade A-, MEDIUM-2 issue
- **Parameter Sweep:** HIGH-6 (validated methodology, needs execution)

## Implementation Notes

**Token Conservation:** Simple type addition, minimal code changes, high confidence.

**Agent Assignment:** simulation-maintainer (Roy) - Type safety fits defensive coding expertise.

**Priority Rationale:** LOW priority because:
- Current implementation works correctly
- No runtime bugs or crashes
- Pure code quality improvement
- Not blocking any other work

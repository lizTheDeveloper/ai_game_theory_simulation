# Simulation Config Type Safety

**Created:** December 1, 2025
**Priority:** LOW
**Effort:** 15-20 minutes

---

## Rationale

From Architecture Review (Dec 1, 2025 - Grade A-):

> **MEDIUM-2:** Parameter Sweep Config Stored in simulationConfig Object
>
> The `simulationConfig` object is created dynamically with `?? {}` pattern at initialization.ts:1819. While this works correctly, it lacks proper TypeScript typing, reducing IDE support and potential compile-time safety.

**Current issue:** No formal `SimulationConfig` interface in `src/types/game.ts`, leading to reduced IDE autocomplete and no compile-time validation - inconsistent with project's strict TypeScript philosophy.

---

## Scope

Add `SimulationConfig` interface to `src/types/game.ts` and type all usage in initialization and consuming code.

**Affected files:**
- `src/types/game.ts` - Interface definition
- `src/simulation/initialization.ts` - Config creation
- `src/simulation/techTree/effectsEngine.ts` - Config consumption
- `src/simulation/engine/phases/SocialStabilitySystemPhase.ts` - Config consumption

---

## Success Criteria

1. `SimulationConfig` interface exists in `src/types/game.ts`
2. `GameState.simulationConfig` properly typed as `SimulationConfig | undefined`
3. All initialization code uses typed config objects
4. `npx tsc --noEmit` passes with no new errors
5. All 460 tests continue passing

---

## Sources

- Architecture Review: Dec 1, 2025 - Grade A-, MEDIUM-2 issue
- CLAUDE.md: "This codebase uses **very strict TypeScript**"

# Simulation Config Type Safety - Implementation Tasks

## Phase 1: Define Interface
**Duration:** 5 minutes

- [ ] Add `SimulationConfig` interface to `src/types/game.ts`:
  - climateSensitivity?: number
  - carbonSinkMultiplier?: number
  - aiCoordinationStressMultiplier?: number
  - techAdoptionSteepness?: number
  - bifurcationThreshold?: number
  - collapseRegimeMultiplier?: number
  - breakdownRegimeMultiplier?: number
  - [key: string]: number | undefined (extensibility)

## Phase 2: Add to GameState
**Duration:** 5 minutes

- [ ] Update `GameState` interface:
  - `simulationConfig?: SimulationConfig;`

## Phase 3: Type-safe Initialization
**Duration:** 5 minutes

- [ ] Update `src/simulation/initialization.ts`:
  - Replace `?? {}` with properly typed config object
  - Assign all parameter sweep values

## Phase 4: Validation
**Duration:** 5 minutes

- [ ] Run `npx tsc --noEmit` (verify no type errors)
- [ ] Run `npm test` (verify all 460 tests pass)
- [ ] Verify IDE autocomplete works for simulationConfig

## Phase 5: Commit
- [ ] Commit with descriptive message

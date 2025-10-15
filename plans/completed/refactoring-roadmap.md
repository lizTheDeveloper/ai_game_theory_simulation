# Refactoring Roadmap: AI Game Theory Simulation

**Date:** October 9, 2025 (Updated: October 10, 2025)
**Status:** Phase 0 Complete (Architectural Cleanup) - Phase 1-6 Planned
**Related:** `architectural-review.md`, `architectural-cleanup-plan-phase2.md`

---

## Completion Status

### ✅ Phase 0: Architectural Cleanup (October 10, 2025) - COMPLETE

**Before starting the major refactoring phases below, we completed critical architectural cleanup:**

- **Phase 2A**: Property access safety (22 unsafe accesses → 0)
- **Phase 2B**: Trust system consistency (verified paranoia-based trust)
- **Phase 2C**: Trust migration (10 reads migrated to `getTrustInAI()`)
- **Phase 2D**: MetricSnapshot cleanup (2 scripts fixed)
- **Phase 2E**: Outcome API verification (already using modern `activeAttractor`)
- **Phase 2F**: Legacy property deprecation (7 properties marked)

**Results**: Zero runtime crashes, consistent trust semantics, clean type interfaces. See `architectural-cleanup-plan-phase2.md` for details.

**Impact**: Codebase is now safer and more consistent before beginning the major refactoring phases below.

---

## Overview

This document provides a phased, low-risk approach to refactoring the simulation engine architecture while preserving all existing functionality and simulation behavior.

**Guiding Principles:**
1. **Preserve Simulation Logic**: Zero changes to calculations, formulas, or game mechanics
2. **Incremental Changes**: Small, testable refactorings that can be validated independently
3. **Backward Compatibility**: Keep old code working during migration
4. **Test-Driven**: Every refactoring must pass existing Monte Carlo tests
5. **No Behavior Changes**: Same seeds produce same results before and after

---

## Phase 1: Foundation - Shared Utilities

**Goal:** Eliminate code duplication by extracting common utilities
**Risk:** Low (pure functions, no state changes)
**Effort:** 4-6 hours
**Files Affected:** 10-15

### Step 1.1: Create Utilities Module Structure

Create new directory and files:
```
src/simulation/utils/
├── index.ts          # Barrel export
├── math.ts           # Mathematical utilities
├── ai.ts             # AI calculation utilities
├── types.ts          # Common type utilities
└── validation.ts     # Validation helpers
```

### Step 1.2: Extract Math Utilities

**File:** `src/simulation/utils/math.ts`

```typescript
/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate linear interpolation
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1);
}

/**
 * Calculate inverse lerp (0-1 value for x between a and b)
 */
export function inverseLerp(a: number, b: number, x: number): number {
  return clamp((x - a) / (b - a), 0, 1);
}

/**
 * Map value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return lerp(outMin, outMax, inverseLerp(inMin, inMax, value));
}
```

**Migration:**
- Replace `clamp` in `meaningRenaissance.ts:379`
- Replace `clamp` in `conflictResolution.ts` (find exact line)
- Search for other inline math utilities

### Step 1.3: Extract AI Calculation Utilities

**File:** `src/simulation/utils/ai.ts`

```typescript
import { GameState, AIAgent } from '@/types/game';

/**
 * Calculate average AI capability across all agents
 */
export function getAverageAICapability(state: GameState): number {
  if (state.aiAgents.length === 0) return 0;
  return state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length;
}

/**
 * Calculate average alignment across all agents
 */
export function getAverageAlignment(state: GameState): number {
  if (state.aiAgents.length === 0) return 0.5;
  return state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length;
}

/**
 * Calculate total AI capability (sum of all agents)
 */
export function getTotalAICapability(state: GameState): number {
  return state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
}

/**
 * Get all active (non-retired) AI agents
 */
export function getActiveAIs(state: GameState): AIAgent[] {
  return state.aiAgents.filter(ai => ai.lifecycleState !== 'retired');
}

/**
 * Get aligned AIs (alignment > threshold)
 */
export function getAlignedAIs(state: GameState, threshold: number = 0.7): AIAgent[] {
  return state.aiAgents.filter(ai => ai.alignment >= threshold);
}

/**
 * Get misaligned AIs (alignment < threshold)
 */
export function getMisalignedAIs(state: GameState, threshold: number = 0.5): AIAgent[] {
  return state.aiAgents.filter(ai => ai.alignment < threshold);
}
```

**Migration (8 files):**
1. `meaningRenaissance.ts:369` - replace `getAverageAICapability`
2. `meaningRenaissance.ts:374` - replace `getAverageAlignment`
3. `conflictResolution.ts` - find and replace utilities
4. `endGame.ts` - find and replace utilities
5. `outcomes.ts` - find and replace utilities (may already export these)
6. `calculations.ts` - find and replace utilities
7. `extinctions.ts` - find and replace utilities
8. `dystopiaProgression.ts` - find and replace utilities
9. `technologicalRisk.ts` - find and replace utilities

### Step 1.4: Update Imports

**Automated Refactor:**
```bash
# Use find-and-replace or codemod
# Before:
function getAverageAICapability(state: GameState): number { ... }

# After:
import { getAverageAICapability } from '@/simulation/utils/ai';
```

### Step 1.5: Validation

**Test Strategy:**
1. Run full test suite (if exists)
2. Run Monte Carlo with same seed before/after
3. Compare results (should be identical)
4. Check that all imports resolve correctly

**Success Criteria:**
- All duplicate utilities removed
- All imports working
- No behavior changes
- Reduced LOC by ~100-200 lines

---

## Phase 2: System Abstractions

**Goal:** Create common interfaces for similar systems
**Risk:** Medium (requires careful interface design)
**Effort:** 12-16 hours
**Files Affected:** 15-20

### Step 2.1: Define Core System Interfaces

**File:** `src/simulation/systems/interfaces.ts`

```typescript
import { GameState } from '@/types/game';

/**
 * Base interface for all simulation systems
 */
export interface SimulationSystem<TState = any> {
  /**
   * Unique identifier for this system
   */
  readonly id: string;

  /**
   * Human-readable name
   */
  readonly name: string;

  /**
   * Initialize system state
   */
  initialize(): TState;

  /**
   * Update system state for one time step
   * @param globalState - Full game state (read-only for most systems)
   */
  update(globalState: GameState): void;
}

/**
 * System that tracks accumulation toward crisis
 */
export interface AccumulationSystem<TState = any> extends SimulationSystem<TState> {
  /**
   * Calculate sustainability level (0 = crisis, 1 = perfect)
   */
  getSustainability(globalState: GameState): number;

  /**
   * Check if system is in crisis state
   */
  hasCrisis(globalState: GameState): boolean;

  /**
   * Get list of active crises for this system
   */
  getActiveCrises(globalState: GameState): string[];
}

/**
 * System that tracks positive spirals toward utopia
 */
export interface SpiralSystem<TState = any> extends SimulationSystem<TState> {
  /**
   * Check if spiral is currently active
   */
  isActive(globalState: GameState): boolean;

  /**
   * Get spiral strength (0-1)
   */
  getStrength(globalState: GameState): number;

  /**
   * Get spiral activation requirements
   */
  getRequirements(): string[];

  /**
   * Check which requirements are met
   */
  checkRequirements(globalState: GameState): Record<string, boolean>;
}

/**
 * System with measurable quality/level metric
 */
export interface QualitySystem<TState = any> extends SimulationSystem<TState> {
  /**
   * Get overall quality level (0-1 or custom range)
   */
  getQuality(globalState: GameState): number;

  /**
   * Get breakdown of quality contributors
   */
  getQualityBreakdown(globalState: GameState): Record<string, number>;
}
```

### Step 2.2: Implement AccumulationSystem Interface

**Refactor Environmental System:**

**File:** `src/simulation/systems/EnvironmentalSystem.ts`

```typescript
import { GameState } from '@/types/game';
import { AccumulationSystem } from './interfaces';
import {
  EnvironmentalAccumulation,
  initializeEnvironmentalAccumulation,
  updateEnvironmentalAccumulation,
  getEnvironmentalSustainability,
  hasEnvironmentalCrisis
} from '../environmental';

/**
 * Environmental accumulation system (wrapper for backward compatibility)
 */
export class EnvironmentalSystem implements AccumulationSystem<EnvironmentalAccumulation> {
  readonly id = 'environmental';
  readonly name = 'Environmental Accumulation';

  initialize(): EnvironmentalAccumulation {
    return initializeEnvironmentalAccumulation();
  }

  update(globalState: GameState): void {
    updateEnvironmentalAccumulation(globalState);
  }

  getSustainability(globalState: GameState): number {
    return getEnvironmentalSustainability(globalState);
  }

  hasCrisis(globalState: GameState): boolean {
    return hasEnvironmentalCrisis(globalState);
  }

  getActiveCrises(globalState: GameState): string[] {
    const crises: string[] = [];
    const env = globalState.environmentalAccumulation;

    if (env.resourceCrisisActive) crises.push('Resource Crisis');
    if (env.pollutionCrisisActive) crises.push('Pollution Crisis');
    if (env.climateCatastropheActive) crises.push('Climate Catastrophe');
    if (env.ecosystemCollapseActive) crises.push('Ecosystem Collapse');

    return crises;
  }
}
```

**Similarly wrap:**
- `SocialCohesionSystem` (wraps `socialCohesion.ts`)
- `TechnologicalRiskSystem` (wraps `technologicalRisk.ts`)

### Step 2.3: Create System Registry

**File:** `src/simulation/systems/SystemRegistry.ts`

```typescript
import { SimulationSystem, AccumulationSystem, SpiralSystem } from './interfaces';
import { GameState } from '@/types/game';

/**
 * Central registry for all simulation systems
 */
export class SystemRegistry {
  private systems: Map<string, SimulationSystem> = new Map();
  private accumulationSystems: AccumulationSystem[] = [];
  private spiralSystems: SpiralSystem[] = [];

  /**
   * Register a system
   */
  register(system: SimulationSystem): void {
    this.systems.set(system.id, system);

    // Track by type for specialized operations
    if (this.isAccumulationSystem(system)) {
      this.accumulationSystems.push(system);
    }
    if (this.isSpiralSystem(system)) {
      this.spiralSystems.push(system);
    }
  }

  /**
   * Initialize all registered systems
   */
  initializeAll(): Record<string, any> {
    const states: Record<string, any> = {};

    for (const [id, system] of this.systems) {
      states[id] = system.initialize();
    }

    return states;
  }

  /**
   * Update all systems in registered order
   */
  updateAll(globalState: GameState): void {
    for (const system of this.systems.values()) {
      system.update(globalState);
    }
  }

  /**
   * Get overall sustainability (average of all accumulation systems)
   */
  getOverallSustainability(globalState: GameState): number {
    if (this.accumulationSystems.length === 0) return 1.0;

    const sum = this.accumulationSystems.reduce(
      (total, system) => total + system.getSustainability(globalState),
      0
    );

    return sum / this.accumulationSystems.length;
  }

  /**
   * Get all active crises across all systems
   */
  getAllCrises(globalState: GameState): string[] {
    return this.accumulationSystems.flatMap(system =>
      system.getActiveCrises(globalState)
    );
  }

  /**
   * Get count of active spirals
   */
  getActiveSpiralCount(globalState: GameState): number {
    return this.spiralSystems.filter(spiral =>
      spiral.isActive(globalState)
    ).length;
  }

  // Type guards
  private isAccumulationSystem(system: SimulationSystem): system is AccumulationSystem {
    return 'getSustainability' in system && 'hasCrisis' in system;
  }

  private isSpiralSystem(system: SimulationSystem): system is SpiralSystem {
    return 'isActive' in system && 'getStrength' in system;
  }
}
```

### Step 2.4: Integration with Engine

**Modify:** `src/simulation/engine.ts`

```typescript
import { SystemRegistry } from './systems/SystemRegistry';
import { EnvironmentalSystem } from './systems/EnvironmentalSystem';
import { SocialCohesionSystem } from './systems/SocialCohesionSystem';
import { TechnologicalRiskSystem } from './systems/TechnologicalRiskSystem';

export class SimulationEngine {
  private rng: SeededRandom;
  private config: SimulationConfig;
  private systems: SystemRegistry;  // NEW

  constructor(config: SimulationConfig = {}) {
    // ... existing setup

    // NEW: Initialize system registry
    this.systems = new SystemRegistry();
    this.systems.register(new EnvironmentalSystem());
    this.systems.register(new SocialCohesionSystem());
    this.systems.register(new TechnologicalRiskSystem());
    // ... register more systems as they're converted
  }

  step(state: GameState): SimulationStepResult {
    // ... existing logic

    // BEFORE: Individual update calls
    // updateEnvironmentalAccumulation(newState);
    // updateSocialAccumulation(newState);
    // updateTechnologicalRisk(newState);

    // AFTER: Single registry call
    this.systems.updateAll(newState);

    // ... rest of logic
  }
}
```

### Step 2.5: Validation

**Test Strategy:**
1. Convert one system at a time
2. Run Monte Carlo after each conversion
3. Verify identical results with same seed
4. Add unit tests for new interfaces

**Success Criteria:**
- 3 accumulation systems converted to interface
- SystemRegistry managing updates
- Engine.step() reduced by ~30 lines
- All tests passing

---

## Phase 3: Initialization Refactoring

**Goal:** Make initialization modular and testable
**Risk:** Medium (complex dependencies)
**Effort:** 8-12 hours
**Files Affected:** 5-10

### Step 3.1: Create Initialization Builder

**File:** `src/simulation/initialization/StateBuilder.ts`

```typescript
import { GameState } from '@/types/game';
import { SystemRegistry } from '../systems/SystemRegistry';

/**
 * Fluent builder for creating game state
 */
export class StateBuilder {
  private state: Partial<GameState> = {};
  private registry: SystemRegistry;

  constructor(registry: SystemRegistry) {
    this.registry = registry;
  }

  /**
   * Set initial year/month
   */
  withTime(year: number, month: number): this {
    this.state.currentYear = year;
    this.state.currentMonth = month;
    this.state.currentDay = 1;
    return this;
  }

  /**
   * Add AI agents
   */
  withAIAgents(agents: AIAgent[]): this {
    this.state.aiAgents = agents;
    return this;
  }

  /**
   * Initialize with default government
   */
  withDefaultGovernment(): this {
    this.state.government = {
      controlDesire: 0.3,
      capabilityToControl: 0.5,
      // ... rest of defaults
    };
    return this;
  }

  /**
   * Initialize with default society
   */
  withDefaultSociety(): this {
    this.state.society = {
      trustInAI: 0.6,
      paranoiaLevel: 0.1,
      // ... rest of defaults
    };
    return this;
  }

  /**
   * Initialize all registered systems
   */
  withRegisteredSystems(): this {
    const systemStates = this.registry.initializeAll();

    // Map system states to GameState fields
    // (This mapping could be automated with metadata)
    this.state.environmentalAccumulation = systemStates.environmental;
    this.state.socialAccumulation = systemStates.social;
    this.state.technologicalRisk = systemStates.technological;

    return this;
  }

  /**
   * Build final state (validates completeness)
   */
  build(): GameState {
    // Validate all required fields present
    if (!this.state.aiAgents) {
      throw new Error('StateBuilder: aiAgents not initialized');
    }
    if (!this.state.government) {
      throw new Error('StateBuilder: government not initialized');
    }
    // ... more validation

    return this.state as GameState;
  }
}
```

### Step 3.2: Refactor createDefaultInitialState

**File:** `src/simulation/initialization.ts`

```typescript
import { StateBuilder } from './initialization/StateBuilder';
import { createDefaultAIAgents } from './initialization/aiAgents';
import { SystemRegistry } from './systems/SystemRegistry';

/**
 * Create a default initial game state
 */
export function createDefaultInitialState(registry?: SystemRegistry): GameState {
  const systemRegistry = registry || createDefaultSystemRegistry();

  return new StateBuilder(systemRegistry)
    .withTime(2025, 0)
    .withAIAgents(createDefaultAIAgents())
    .withDefaultGovernment()
    .withDefaultSociety()
    .withDefaultGlobalMetrics()
    .withRegisteredSystems()
    .build();
}
```

**Extract AI Agent Creation:**

**File:** `src/simulation/initialization/aiAgents.ts`

```typescript
import { AIAgent } from '@/types/game';
import { createAIAgent } from '../initialization'; // Keep existing utility

/**
 * Create default heterogeneous AI population
 */
export function createDefaultAIAgents(): AIAgent[] {
  const agents: AIAgent[] = [];

  // Category 1: Well-aligned corporate AIs (40%)
  agents.push(...createCorporateAIs(8));

  // Category 2: Moderate AIs (30%)
  agents.push(...createModerateAIs(6));

  // Category 3: Misaligned from start (15%)
  agents.push(...createMisalignedAIs(3));

  // Category 4: Weird/Niche AIs (15%)
  agents.push(...createNicheAIs(3));

  return agents;
}

function createCorporateAIs(count: number): AIAgent[] {
  const agents: AIAgent[] = [];
  for (let i = 0; i < count; i++) {
    const alignment = 0.75 + Math.random() * 0.15;
    agents.push(createAIAgent(
      `corporate_${i}`,
      `Corporate-${i}`,
      0.05 + i * 0.01,
      alignment,
      i * 1.5
    ));
  }
  return agents;
}

// ... similar for other categories
```

### Step 3.3: Validation

**Success Criteria:**
- createDefaultInitialState() under 50 lines
- AI creation logic extracted to separate file
- Builder pattern enables custom test states
- All initialization tests passing

---

## Phase 4: Engine Orchestration Cleanup

**Goal:** Simplify engine.step() method
**Risk:** Medium-High (core simulation loop)
**Effort:** 16-24 hours
**Files Affected:** 10-15

### Step 4.1: Extract Phase Orchestrator

**File:** `src/simulation/engine/PhaseOrchestrator.ts`

```typescript
import { GameState, GameEvent } from '@/types/game';

/**
 * Represents a single simulation phase
 */
export interface SimulationPhase {
  readonly name: string;
  readonly order: number;
  execute(state: GameState, rng: () => number): PhaseResult;
}

export interface PhaseResult {
  events: GameEvent[];
  // Other metadata as needed
}

/**
 * Orchestrates simulation phases in correct order
 */
export class PhaseOrchestrator {
  private phases: SimulationPhase[] = [];

  /**
   * Register a phase
   */
  registerPhase(phase: SimulationPhase): void {
    this.phases.push(phase);
    // Sort by order after each registration
    this.phases.sort((a, b) => a.order - b.order);
  }

  /**
   * Execute all phases in order
   */
  executeAll(state: GameState, rng: () => number): GameEvent[] {
    const allEvents: GameEvent[] = [];

    for (const phase of this.phases) {
      const result = phase.execute(state, rng);
      allEvents.push(...result.events);
    }

    return allEvents;
  }

  /**
   * Get phase execution order (for debugging)
   */
  getExecutionOrder(): string[] {
    return this.phases.map(p => `${p.order}: ${p.name}`);
  }
}
```

### Step 4.2: Convert Phases to Objects

**File:** `src/simulation/engine/phases/ComputeGrowthPhase.ts`

```typescript
import { SimulationPhase, PhaseResult } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { applyComputeGrowth } from '../../computeInfrastructure';

export class ComputeGrowthPhase implements SimulationPhase {
  readonly name = 'Compute Growth (Moore\'s Law)';
  readonly order = 5;

  execute(state: GameState, rng: () => number): PhaseResult {
    applyComputeGrowth(state, rng);
    return { events: [] };
  }
}
```

**File:** `src/simulation/engine/phases/OrganizationTurnsPhase.ts`

```typescript
import { SimulationPhase, PhaseResult } from '../PhaseOrchestrator';
import { GameState } from '@/types/game';
import { processAllOrganizations } from '../../organizationManagement';

export class OrganizationTurnsPhase implements SimulationPhase {
  readonly name = 'Organization Turns';
  readonly order = 6;

  execute(state: GameState, rng: () => number): PhaseResult {
    processAllOrganizations(state, rng);
    return { events: [] };
  }
}
```

### Step 4.3: Refactor Engine.step()

**Modified:** `src/simulation/engine.ts`

```typescript
import { PhaseOrchestrator } from './engine/PhaseOrchestrator';
import { ComputeGrowthPhase } from './engine/phases/ComputeGrowthPhase';
import { OrganizationTurnsPhase } from './engine/phases/OrganizationTurnsPhase';
// ... import all phases

export class SimulationEngine {
  private rng: SeededRandom;
  private config: SimulationConfig;
  private systems: SystemRegistry;
  private phases: PhaseOrchestrator;  // NEW

  constructor(config: SimulationConfig = {}) {
    // ... existing setup

    // NEW: Initialize phase orchestrator
    this.phases = new PhaseOrchestrator();
    this.registerPhases();
  }

  private registerPhases(): void {
    // Register all phases (order numbers make dependencies explicit)
    this.phases.registerPhase(new ComputeGrowthPhase());           // order: 5
    this.phases.registerPhase(new OrganizationTurnsPhase());       // order: 6
    this.phases.registerPhase(new ComputeAllocationPhase());       // order: 4
    this.phases.registerPhase(new AILifecyclePhase());             // order: 0a
    this.phases.registerPhase(new CyberSecurityPhase());           // order: 0b
    this.phases.registerPhase(new SleeperWakePhase());             // order: 0c
    this.phases.registerPhase(new AIActionsPhase());               // order: 0
    // ... register 20+ more phases
  }

  step(state: GameState): SimulationStepResult {
    // BEFORE: 300+ lines of sequential logic

    // AFTER: ~50 lines
    let newState = { ...state };
    const rng = this.rng.next.bind(this.rng);

    // Execute all phases in order
    const events = this.phases.executeAll(newState, rng);

    // Calculate metrics (could also be a phase)
    const metrics = this.calculateMetrics(newState);

    // Advance time
    newState.currentMonth += 1;
    newState.currentYear = Math.floor(newState.currentMonth / 12);

    return {
      state: newState,
      events,
      metrics
    };
  }

  private calculateMetrics(state: GameState) {
    // Extract metrics calculation to separate method
    // ...
  }
}
```

### Step 4.4: Validation

**Test Strategy:**
1. Convert phases one at a time
2. Verify execution order with logging
3. Run Monte Carlo after each phase conversion
4. Compare results to baseline

**Success Criteria:**
- engine.step() under 100 lines
- All phases registered explicitly
- Phase dependencies documented in order numbers
- All tests passing with identical results

---

## Phase 5: State Management Consistency

**Goal:** Consistent mutation strategy across all systems
**Risk:** High (touches all update functions)
**Effort:** 20-30 hours
**Files Affected:** 25+

### Step 5.1: Choose Strategy

**Recommendation:** Use Immer.js for controlled mutation

**Why Immer:**
- Allows "mutating" syntax but produces immutable updates
- Zero runtime overhead in production
- TypeScript-friendly
- Easy migration path (works with existing code)

**Install:**
```bash
npm install immer
```

### Step 5.2: Create State Update Wrapper

**File:** `src/simulation/utils/state.ts`

```typescript
import { produce, Draft } from 'immer';
import { GameState } from '@/types/game';

/**
 * Type-safe state updater using Immer
 */
export function updateState(
  state: GameState,
  updater: (draft: Draft<GameState>) => void
): GameState {
  return produce(state, updater);
}

/**
 * Update subsystem within state
 */
export function updateSubsystem<K extends keyof GameState>(
  state: GameState,
  key: K,
  updater: (draft: Draft<GameState[K]>) => void
): GameState {
  return produce(state, draft => {
    updater(draft[key]);
  });
}
```

### Step 5.3: Migrate Update Functions

**Before:** `meaningRenaissance.ts:81`

```typescript
export function updateMeaningRenaissance(state: GameState): void {
  const meaning = state.meaningRenaissance;

  // Direct mutation
  meaning.purposeDiversity = /* ... */;
  meaning.selfActualizationRate = /* ... */;
}
```

**After:**

```typescript
import { updateSubsystem } from './utils/state';

export function updateMeaningRenaissance(state: GameState): GameState {
  return updateSubsystem(state, 'meaningRenaissance', meaning => {
    // Mutate draft (Immer will create immutable copy)
    meaning.purposeDiversity = /* ... */;
    meaning.selfActualizationRate = /* ... */;
  });
}
```

**Or keep void return, but use Immer internally:**

```typescript
export function updateMeaningRenaissance(state: GameState): void {
  const newMeaningState = produce(state.meaningRenaissance, meaning => {
    meaning.purposeDiversity = /* ... */;
    meaning.selfActualizationRate = /* ... */;
  });

  // Assign back (caller must handle)
  state.meaningRenaissance = newMeaningState;
}
```

### Step 5.4: Update Engine to Handle Immutable Returns

**Choice 1:** Keep current mutation style (simpler migration)
- Update functions mutate state via Immer internally
- Engine doesn't need changes
- Gradual migration possible

**Choice 2:** Switch to functional style (more invasive)
- Update functions return new state
- Engine chains updates functionally
- More principled but requires more refactoring

**Recommendation:** Start with Choice 1, migrate to Choice 2 over time

### Step 5.5: Validation

**Test Strategy:**
1. Migrate one system at a time
2. Add unit tests for each migrated system
3. Verify no behavior changes
4. Use TypeScript to catch mutation issues

**Success Criteria:**
- All update functions use consistent pattern
- Type safety enforced via TypeScript
- Tests demonstrate immutability
- Same Monte Carlo results

---

## Phase 6: Type Organization

**Goal:** Centralize and organize type definitions
**Risk:** Low (types don't affect runtime)
**Effort:** 6-8 hours
**Files Affected:** 20+

### Step 6.1: Create Type Directory Structure

```
types/
├── index.ts                    # Barrel export
├── game.ts                     # GameState (existing)
├── systems/
│   ├── index.ts
│   ├── environmental.ts        # EnvironmentalAccumulation type
│   ├── social.ts               # SocialAccumulation type
│   ├── technological.ts        # TechnologicalRisk type
│   ├── meaning.ts              # MeaningRenaissanceState type
│   ├── governance.ts           # GovernanceQuality type
│   └── ... (one file per system)
├── agents/
│   ├── index.ts
│   ├── ai.ts                   # AIAgent type
│   ├── actions.ts              # ActionResult, GameAction (existing)
│   └── government.ts           # Government type
└── events/
    ├── index.ts
    └── gameEvent.ts            # GameEvent type
```

### Step 6.2: Extract Inline Types

**From:** `meaningRenaissance.ts:21-46`

**To:** `types/systems/meaning.ts`

```typescript
/**
 * Meaning Renaissance System State
 *
 * Tracks 4 dimensions of post-work meaning:
 * 1. Purpose Diversity
 * 2. Self-Actualization
 * 3. Artistic Renaissance
 * 4. Philosophical Maturity
 */
export interface MeaningRenaissanceState {
  // Purpose Diversity
  purposeDiversity: number;
  communityPathways: number;
  creativePathways: number;
  knowledgePathways: number;
  explorationPathways: number;

  // Self-Actualization
  selfActualizationRate: number;
  educationalAccess: number;
  timeForGrowth: number;
  mentoringAvailability: number;

  // Artistic Renaissance
  artisticRenaissanceLevel: number;
  aiAssistedCreativity: number;
  culturalParticipation: number;
  artisticRecognition: number;

  // Philosophical Maturity
  philosophicalMaturity: number;
  existentialUnderstanding: number;
  collectiveNarrative: number;
  wisdomSharing: number;
}
```

**Update imports:**
```typescript
// meaningRenaissance.ts
import { MeaningRenaissanceState } from '@/types/systems/meaning';
```

### Step 6.3: Refactor GameState to Use System Types

**File:** `types/game.ts`

```typescript
import { MeaningRenaissanceState } from './systems/meaning';
import { GovernanceQuality } from './systems/governance';
import { EnvironmentalAccumulation } from './systems/environmental';
// ... import all system types

export interface GameState {
  // Core
  currentMonth: number;
  currentYear: number;
  // ... other core fields

  // Systems (now using imported types)
  meaningRenaissance: MeaningRenaissanceState;
  governanceQuality: GovernanceQuality;
  environmentalAccumulation: EnvironmentalAccumulation;
  // ... all system types
}
```

### Step 6.4: Add Type Documentation

**Each type file should have:**
- JSDoc comments explaining purpose
- Range documentation for numeric fields
- Examples of typical values
- Cross-references to wiki docs

**Example:**
```typescript
/**
 * Environmental Accumulation System State
 *
 * Tracks degradation of environmental systems during prosperity.
 *
 * @see docs/wiki/systems/environmental.md
 */
export interface EnvironmentalAccumulation {
  /**
   * Remaining natural resources (0-1)
   * - 1.0 = Abundant resources
   * - 0.4 = Resource crisis threshold
   * - 0.0 = Complete depletion
   */
  resourceReserves: number;

  // ... more fields with documentation
}
```

### Step 6.5: Validation

**Success Criteria:**
- All inline types extracted
- Type files well-documented
- GameState imports all types
- No duplicate type definitions
- TypeScript compilation successful

---

## Migration Timeline

### Sprint 1 (Week 1): Foundation
- **Days 1-2:** Phase 1 - Shared Utilities
- **Days 3-5:** Phase 2 - System Abstractions (partial)

**Deliverables:**
- Utilities extracted
- 3 systems implementing interfaces
- SystemRegistry operational

### Sprint 2 (Week 2): Initialization & Engine
- **Days 1-2:** Phase 2 - System Abstractions (complete)
- **Days 3-4:** Phase 3 - Initialization Refactoring
- **Day 5:** Phase 4 - Engine Orchestration (start)

**Deliverables:**
- All accumulation systems using interface
- StateBuilder working
- Phase infrastructure created

### Sprint 3 (Week 3): Engine & Types
- **Days 1-3:** Phase 4 - Engine Orchestration (complete)
- **Days 4-5:** Phase 6 - Type Organization

**Deliverables:**
- Engine using PhaseOrchestrator
- All types extracted and documented

### Sprint 4 (Week 4+): State Management
- **Week 4:** Phase 5 - State Management (Immer integration)
- **Ongoing:** Gradual migration of all update functions

**Deliverables:**
- Immer integrated
- First 5 systems migrated
- Pattern documented for future systems

---

## Testing Strategy

### Per-Phase Validation

**For each refactoring phase:**

1. **Unit Tests** (create if missing)
   - Test extracted utilities in isolation
   - Test new abstractions independently
   - Verify type safety

2. **Integration Tests**
   - Run full simulation for 50 months
   - Compare state at months 10, 25, 50
   - Verify identical results

3. **Monte Carlo Baseline**
   - Run 10 simulations with fixed seeds (1000-1009)
   - Record outcomes for each
   - Must match exactly after refactoring

4. **Performance Benchmark**
   - Measure simulation speed (1000 runs)
   - Should be ±5% of baseline
   - Flag significant regressions

### Regression Test Suite

**Create baseline before refactoring:**

```typescript
// tests/refactoring-baseline.test.ts
import { SimulationEngine } from '@/simulation/engine';
import { createDefaultInitialState } from '@/simulation/initialization';

describe('Refactoring Baseline Tests', () => {
  const seeds = [1000, 1001, 1002, 1003, 1004];

  seeds.forEach(seed => {
    test(`Seed ${seed} produces expected outcome`, () => {
      const engine = new SimulationEngine({ seed, maxMonths: 100 });
      const initial = createDefaultInitialState();
      const result = engine.run(initial);

      // Record baseline results
      expect(result.summary.finalOutcome).toMatchSnapshot();
      expect(result.summary.totalMonths).toMatchSnapshot();
      expect(result.finalState.outcomeMetrics).toMatchSnapshot();
    });
  });
});
```

Run before refactoring to create snapshots, then verify after each phase.

---

## Risk Mitigation

### High-Risk Areas

1. **Engine orchestration** (Phase 4)
   - Risk: Breaking simulation execution order
   - Mitigation: Convert one phase at a time, validate after each

2. **State management** (Phase 5)
   - Risk: Introducing mutations where immutability expected
   - Mitigation: Use TypeScript strict mode, add immutability tests

3. **Initialization** (Phase 3)
   - Risk: Missing dependencies, initialization order bugs
   - Mitigation: Add validation to StateBuilder, comprehensive tests

### Rollback Strategy

**For each phase:**
1. Work in feature branch (`refactor/phase-N`)
2. Keep comprehensive test logs
3. If tests fail, have rollback commit ready
4. Don't merge until all tests pass

**Git strategy:**
```bash
# Start phase
git checkout -b refactor/phase-1
git commit -m "Phase 1: Initial commit"

# Make changes
git add .
git commit -m "Phase 1: Extract math utilities"

# Test
npm test
npm run monte-carlo

# If tests fail
git reset --hard HEAD~1  # Rollback last commit

# If tests pass
git checkout main
git merge refactor/phase-1
```

---

## Success Metrics

### Code Quality Metrics

| Metric | Before | Target | Improvement |
|--------|--------|--------|-------------|
| Duplicate code instances | 8+ | 0 | -8 |
| Engine.step() LOC | 300+ | <100 | -200 |
| Initialization LOC | 350+ | <100 | -250 |
| Average module coupling | High | Low | -50% |
| Type coverage | Partial | 100% | +40% |
| Total simulation LOC | 20,000 | 18,000 | -10% |

### Development Metrics

| Metric | Before | Target | Improvement |
|--------|--------|--------|-------------|
| Time to add new system | 4-6h | 2-3h | -50% |
| Files to modify per change | 5+ | 2-3 | -50% |
| Test isolation | Poor | Good | +100% |
| Onboarding time | 2 weeks | 1 week | -50% |

### Functional Metrics

| Metric | Requirement |
|--------|-------------|
| Monte Carlo results | Identical to baseline |
| Simulation performance | ±5% of baseline |
| All tests passing | 100% |
| Type safety | No `any` types added |
| Documentation | All new abstractions documented |

---

## Post-Refactoring Opportunities

**After completing all phases, consider:**

1. **Dependency Injection**
   - Make systems pluggable
   - Enable custom system implementations
   - Support modding/extensions

2. **Event System**
   - Decouple systems via events
   - Enable reactive programming
   - Better debugging/replay

3. **Parallel Execution**
   - Identify parallelizable phases
   - Use Web Workers for Monte Carlo
   - Improve simulation throughput

4. **Persistence Layer**
   - Save/load simulations
   - Snapshot system
   - Time-travel debugging

5. **Visualization Hooks**
   - System health dashboards
   - Real-time metrics
   - Debug overlays

---

## Conclusion

This roadmap provides a structured, low-risk path to improving the simulation architecture while preserving all existing functionality. The phased approach allows validation at each step and easy rollback if needed.

**Key Principles:**
- Preserve simulation logic (zero tolerance for behavior changes)
- Incremental refactoring (small, testable changes)
- Test-driven (Monte Carlo validation after each phase)
- Backward compatible (old code works during migration)

**Expected Outcome:**
- More maintainable codebase
- Easier to add new systems
- Better testability
- Improved developer experience
- Same simulation quality

**Next Steps:**
1. Review this plan with team
2. Set up baseline tests
3. Create feature branch for Phase 1
4. Begin utilities extraction

**Questions? Issues?**
- Refer to `architectural-review.md` for detailed findings
- Each phase can be adjusted based on discoveries during implementation
- Maintain flexibility while preserving core principles

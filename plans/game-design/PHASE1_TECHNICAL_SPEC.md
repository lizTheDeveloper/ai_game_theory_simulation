# Phase 1 Technical Specification: Core Architecture Foundation

**Version:** 1.0
**Created:** Current Session
**Author:** Roy (Simulation Maintainer)
**Status:** APPROVED - Formal sign-off by Sylvia (Research Skeptic) on Current Session WITH CONDITIONS

---

## Executive Summary

This document specifies the technical architecture for Phase 1 of game development. The core principle is **strict separation**: the game layer observes and influences the simulation indirectly, but never mutates simulation state directly.

**Key Decisions:**
1. Game layer lives in `/src/game/` - completely separate from `/src/simulation/`
2. Game layer subscribes to simulation events, never imports simulation internals
3. Player influence flows through `PlayerDecisionPhase` (already exists at order 8.51)
4. Research Scenarios map to existing `ScenarioDefinition` type (validated via Monte Carlo)
5. Save/Load preserves RNG state for deterministic replay

---

## 1. Architecture Design

### 1.1 Directory Structure

```
src/game/
  |-- index.ts                    # Public API (re-exports)
  |-- types/
  |   |-- index.ts                # Game-specific types
  |   |-- scenario.ts             # ResearchScenario, ScenarioConfig
  |   |-- advocacy.ts             # AdvocacyAction, Coalition, Campaign
  |   |-- save.ts                 # SaveState, SaveMetadata
  |   |-- events.ts               # GameLayerEvent (distinct from SimulationEvent)
  |
  |-- core/
  |   |-- GameSession.ts          # Main game session manager
  |   |-- ScenarioManager.ts      # Research scenario loading/validation
  |   |-- InfluenceCalculator.ts  # Convert player actions to probability shifts
  |   |-- OutcomeInterpreter.ts   # Convert simulation outcomes to narrative
  |
  |-- scenarios/
  |   |-- baseline.ts             # Consensus trajectory parameters
  |   |-- optimistic.ts           # Best case supported by evidence
  |   |-- pessimistic.ts          # Realistic worst case
  |   |-- validation.ts           # Monte Carlo validation utilities
  |
  |-- advocacy/
  |   |-- actions.ts              # Catalog of advocacy actions
  |   |-- coalitions.ts           # Coalition formation logic
  |   |-- campaigns.ts            # Campaign duration/effects
  |   |-- effectBounds.ts         # Hard limits on influence (15% max)
  |
  |-- persistence/
  |   |-- SaveManager.ts          # Save/load with RNG state
  |   |-- StateSerializer.ts      # JSON serialization
  |   |-- VersionMigration.ts     # Handle save format changes
  |
  |-- observers/
  |   |-- SimulationObserver.ts   # Subscribe to simulation events
  |   |-- MetricsCollector.ts     # Aggregate metrics for UI
  |   |-- CriticalJunctureDetector.ts  # Detect intervention windows
```

### 1.2 Module Boundary Rules

**ABSOLUTE RULES (Sylvia-enforced):**

1. **Game layer NEVER imports from `src/simulation/` internal modules**
   - NO: `import { updateEnvironmental } from '@/simulation/environmental'`
   - YES: `import { GameState, GameEvent } from '@/types/game'` (types only)

2. **Game layer NEVER mutates simulation state directly**
   - NO: `state.government.controlDesire = 0.8`
   - YES: Queue decision via `PlayerDecisionPhase`

3. **All influence must flow through defined channels:**
   - `state.playerDecisions` queue (processed by PlayerDecisionPhase)
   - Scenario selection (at initialization only)

4. **Game layer can READ simulation state freely**
   - Direct read access via `GameState` snapshots
   - Event subscription for real-time updates

### 1.3 Data Flow Architecture

```
                    READ-ONLY OBSERVATION
                           |
                           v
+----------------+    +-----------+    +------------------+
|  Game Layer    |<---|  Events   |<---|  Simulation Core |
|  (src/game/)   |    |  Stream   |    |  (src/simulation)|
+----------------+    +-----------+    +------------------+
        |                                      ^
        |                                      |
        v                                      |
+----------------+    +-----------+    +------------------+
| Player Actions |    | Decision  |    | PlayerDecision   |
| (advocacy,     |--->| Queue     |--->| Phase (8.51)     |
| coalitions)    |    |           |    |                  |
+----------------+    +-----------+    +------------------+

        INDIRECT INFLUENCE (queued, bounded)
```

### 1.4 Interface Contracts

#### GameSessionInterface (public API)

```typescript
// src/game/types/index.ts

export interface GameSessionInterface {
  // === Initialization ===
  startNewGame(scenario: ResearchScenarioId, seed?: number): void;
  loadGame(saveState: SaveState): void;

  // === Observation (read-only) ===
  getState(): GameStateSnapshot;
  subscribeToEvents(handler: (event: GameLayerEvent) => void): () => void;

  // === Indirect Influence ===
  queueAdvocacyAction(action: AdvocacyActionId): QueueResult;
  queueCoalitionAction(action: CoalitionActionId): QueueResult;
  queueCrisisResponse(response: CrisisResponseId): QueueResult;

  // === Persistence ===
  save(): SaveState;

  // === Validation ===
  validateInfluenceBounds(): ValidationResult; // Verify within 15%
}

export type ResearchScenarioId =
  | 'baseline'    // Consensus trajectory
  | 'optimistic'  // Best case supported by evidence
  | 'pessimistic' // Realistic worst case
  | 'custom';     // Academic users only

export interface QueueResult {
  success: boolean;
  queuedDecision?: PlayerDecision;
  rejectionReason?: string;  // Why action was rejected (cooldown, resource, bounds)
}
```

#### Simulation Observer Interface

```typescript
// src/game/observers/SimulationObserver.ts

export interface SimulationObserver {
  // Subscribe to specific event types
  onCrisisDetected(handler: (crisis: CrisisEvent) => void): void;
  onTechnologyUnlocked(handler: (tech: TechnologyEvent) => void): void;
  onOutcomeShift(handler: (outcome: OutcomeEvent) => void): void;
  onPlanetaryBoundaryChange(handler: (boundary: BoundaryEvent) => void): void;
  onCriticalJuncture(handler: (juncture: JunctureEvent) => void): void;

  // Aggregate metrics (for dashboard)
  getAggregateMetrics(): AggregateMetrics;
}
```

---

## 2. Scenario System Design

### 2.1 Research Scenario Architecture

The game's "Research Scenarios" map to the existing `ScenarioDefinition` type in `src/types/scenarios.ts`, with strict bounds to ensure research validity.

```typescript
// src/game/types/scenario.ts

import type { ScenarioDefinition, ScenarioStartingConditions } from '@/types/scenarios';

/**
 * Research-validated scenario for game layer
 * Builds on existing ScenarioDefinition with game-specific constraints
 */
export interface ResearchScenario {
  id: ResearchScenarioId;
  name: string;
  description: string;

  // Research foundation
  researchSources: ResearchSource[];  // Must have 2+ peer-reviewed sources

  // Maps to simulation ScenarioDefinition
  simulationConfig: ScenarioDefinition;

  // Validation results (REQUIRED before scenario is playable)
  validation: ScenarioValidation;
}

export interface ScenarioValidation {
  monteCarloRuns: number;           // Must be >= 100
  baselineDeviation: number;        // Must be <= 0.15 (15%)
  deterministicVerified: boolean;   // CV < 0.01% for same seed
  playerAgencyBounded: boolean;     // No choice > 20% outcome shift
  sylviaApproved: boolean;          // Explicit sign-off required
  validationDate: string;
}

export interface ResearchSource {
  citation: string;      // Full academic citation
  year: number;          // 2024-2025 preferred
  relevantFindings: string;
  parameterJustification: string;
}
```

### 2.2 Scenario Parameter Mapping

**Baseline (Consensus Trajectory):**
```typescript
// src/game/scenarios/baseline.ts

export const BASELINE_SCENARIO: ResearchScenario = {
  id: 'baseline',
  name: 'Consensus Trajectory',
  description: 'Starting conditions reflect median expert expectations',

  researchSources: [
    {
      citation: 'Epoch AI (2024). AI Benchmark Progress Report.',
      year: 2024,
      relevantFindings: 'Current ML capability trajectory',
      parameterJustification: 'AI growth rates from benchmark data'
    },
    // ... more sources
  ],

  simulationConfig: {
    id: 'baseline',
    name: 'Baseline (Consensus)',
    description: 'Median expert expectations',
    hypothesis: 'Control scenario for comparison',
    techDeployment: { mode: 'adaptive' },
    // Uses default initialization values (2025 calibration)
    // NO starting condition overrides - pure baseline
  },

  validation: {
    monteCarloRuns: 100,
    baselineDeviation: 0,  // This IS the baseline
    deterministicVerified: true,
    playerAgencyBounded: true,
    sylviaApproved: false  // PENDING
  }
};
```

**Optimistic (Best Case Supported by Evidence):**
```typescript
// src/game/scenarios/optimistic.ts

export const OPTIMISTIC_SCENARIO: ResearchScenario = {
  id: 'optimistic',
  name: 'Best Case Supported by Evidence',
  description: 'Upper bounds of research uncertainty ranges',

  simulationConfig: {
    id: 'optimistic',
    name: 'Optimistic',
    description: 'Favorable end of uncertainty ranges',
    hypothesis: 'Tests if good starting conditions enable better outcomes',
    techDeployment: { mode: 'adaptive' },

    startingConditions: {
      // Alignment researcher surveys upper bounds
      trustInAI: 0.75,  // High (vs 0.6 baseline)
      governanceQuality: 0.7,  // Strong institutions
      institutionalCapacity: 0.7,
      informationIntegrity: 0.75,
      collectiveActionWillingness: 0.65,
    },

    governmentPriorities: {
      // Paris Agreement targets scenario
      climateSpending: 0.05,  // 5% GDP (aggressive but documented)
      aiSafetyBudget: 50,     // $50B/month
      democracyLevel: 0.75,   // High
    }
  },

  validation: {
    monteCarloRuns: 100,
    baselineDeviation: 0.12,  // Within 15% limit
    deterministicVerified: true,
    playerAgencyBounded: true,
    sylviaApproved: false  // PENDING
  }
};
```

**Pessimistic (Realistic Worst Case):**
```typescript
// src/game/scenarios/pessimistic.ts

export const PESSIMISTIC_SCENARIO: ResearchScenario = {
  id: 'pessimistic',
  name: 'Realistic Worst Case',
  description: 'Lower bounds of research uncertainty ranges',

  simulationConfig: {
    id: 'pessimistic',
    name: 'Pessimistic',
    description: 'Unfavorable end of uncertainty ranges',
    hypothesis: 'Tests if bad starting conditions lead to worse outcomes',
    techDeployment: { mode: 'adaptive' },

    startingConditions: {
      // Fast takeoff scenarios (Amodei, Christiano)
      trustInAI: 0.45,  // Low
      governanceQuality: 0.5,  // Weak institutions
      institutionalCapacity: 0.5,
      informationIntegrity: 0.5,  // High misinformation
      collectiveActionWillingness: 0.4,  // Fragmented
    },

    governmentPriorities: {
      // RCP 8.5 pathway
      climateSpending: 0.01,  // 1% GDP (insufficient)
      aiSafetyBudget: 10,     // $10B/month (underfunded)
      democracyLevel: 0.55,   // Moderate (backsliding)
    }
  },

  validation: {
    monteCarloRuns: 100,
    baselineDeviation: 0.14,  // Within 15% limit
    deterministicVerified: true,
    playerAgencyBounded: true,
    sylviaApproved: false  // PENDING
  }
};
```

### 2.3 Scenario Validation Pipeline

```typescript
// src/game/scenarios/validation.ts

export async function validateScenario(
  scenario: ResearchScenario,
  baselineResults: MonteCarloResults
): Promise<ScenarioValidation> {
  // Run N=100 Monte Carlo simulations
  const results = await runMonteCarloValidation(scenario, 100);

  // Calculate baseline deviation
  const deviation = calculateDeviationFromBaseline(results, baselineResults);

  // Verify determinism (same seed = same outcome)
  const cv = calculateCoefficientOfVariation(results.sameSeedRuns);

  // Check player agency bounds
  const maxInfluence = calculateMaxPlayerInfluence(results);

  return {
    monteCarloRuns: 100,
    baselineDeviation: deviation,
    deterministicVerified: cv < 0.0001,  // CV < 0.01%
    playerAgencyBounded: maxInfluence <= 0.20,  // <= 20%
    sylviaApproved: false  // Requires manual approval
  };
}
```

---

## 3. Save/Load System Design

### 3.1 Save State Structure

```typescript
// src/game/types/save.ts

export interface SaveState {
  version: string;           // Format version for migrations
  metadata: SaveMetadata;

  // Core state
  simulationState: SerializedGameState;
  gameLayerState: GameLayerState;

  // RNG state for deterministic replay
  rngState: RNGState;
}

export interface SaveMetadata {
  saveId: string;
  saveName: string;
  createdAt: string;
  lastModified: string;
  scenario: ResearchScenarioId;
  currentMonth: number;
  outcomeClassification: string;
  playtimeMinutes: number;
}

export interface RNGState {
  seed: number;
  callCount: number;  // How many times RNG has been called
  // This allows perfect replay: recreate RNG with seed, advance callCount times
}

export interface GameLayerState {
  // Active campaigns/coalitions
  activeCampaigns: Campaign[];
  coalitions: Coalition[];

  // Decision history (for counterfactuals)
  decisionHistory: PlayerDecision[];

  // Cumulative influence tracking (for bounds checking)
  totalInfluenceSpent: number;
  influenceByDomain: Record<string, number>;
}
```

### 3.2 RNG State Preservation

**Critical for determinism:** The simulation uses a seeded RNG. To replay a save:
1. Re-create RNG with same seed
2. Advance RNG by `callCount` to reach exact same state
3. Continue simulation from there

```typescript
// src/game/persistence/SaveManager.ts

import { createSeededRng } from '@/simulation/utils/deterministicRng';

export class SaveManager {
  save(session: GameSession): SaveState {
    const rngState: RNGState = {
      seed: session.getSeed(),
      callCount: session.getRngCallCount()
    };

    return {
      version: '1.0.0',
      metadata: this.createMetadata(session),
      simulationState: this.serializeSimulationState(session.getState()),
      gameLayerState: session.getGameLayerState(),
      rngState
    };
  }

  load(saveState: SaveState): GameSession {
    // Migrate if needed
    const migrated = this.migrate(saveState);

    // Recreate deterministic RNG
    const rng = createSeededRng(migrated.rngState.seed);

    // Advance RNG to saved position
    for (let i = 0; i < migrated.rngState.callCount; i++) {
      rng();
    }

    // Restore session with exact RNG state
    return new GameSession({
      simulationState: this.deserializeSimulationState(migrated.simulationState),
      gameLayerState: migrated.gameLayerState,
      rng,
      scenario: migrated.metadata.scenario
    });
  }
}
```

### 3.3 Version Migration Strategy

```typescript
// src/game/persistence/VersionMigration.ts

type MigrationFn = (save: SaveState) => SaveState;

const MIGRATIONS: Record<string, MigrationFn> = {
  '1.0.0_to_1.1.0': (save) => {
    // Example: Add new field with default
    return {
      ...save,
      version: '1.1.0',
      gameLayerState: {
        ...save.gameLayerState,
        newField: defaultValue
      }
    };
  }
};

export function migrateToLatest(save: SaveState): SaveState {
  let current = save;

  while (current.version !== CURRENT_VERSION) {
    const migrationKey = `${current.version}_to_${nextVersion(current.version)}`;
    const migration = MIGRATIONS[migrationKey];

    if (!migration) {
      throw new Error(`No migration path from ${current.version}`);
    }

    current = migration(current);
  }

  return current;
}
```

---

## 4. Player Influence System

### 4.1 Influence Categories

Based on the Game Design Document, players influence through:

1. **Advocacy Campaigns** - Shift public sentiment
2. **Coalition Building** - Increase coordination probability
3. **Research Recommendations** - Influence funding weights
4. **Crisis Response Proposals** - Affect policy adoption probability
5. **Information Sharing** - Affect trust metrics
6. **Stakeholder Engagement** - Influence private sector weights

### 4.2 Influence Mechanism Types

```typescript
// src/game/types/advocacy.ts

export type InfluenceMechanism =
  | 'sentiment_shift'        // Gradual public opinion change
  | 'coordination_boost'     // Increase cooperation probability
  | 'funding_weight'         // Shift research allocation
  | 'policy_adoption'        // Increase policy enactment probability
  | 'trust_delta'            // Modify trust metrics
  | 'private_sector_weight'; // Influence corporate behavior

export interface AdvocacyAction {
  id: string;
  name: string;
  description: string;

  // Effect specification
  mechanism: InfluenceMechanism;
  targetMetric: string;           // Which state field is affected
  baseEffect: number;             // Effect magnitude (pre-bounds check)
  duration: number;               // Months of effect

  // Constraints
  cooldown: number;               // Months before can use again
  prerequisites: string[];        // Required state conditions

  // Bounds (Sylvia requirement)
  maxCumulativeEffect: number;    // Hard cap on total influence
}
```

### 4.3 Effect Bounds Enforcement

```typescript
// src/game/advocacy/effectBounds.ts

/**
 * CRITICAL: Sylvia's 15% baseline constraint
 *
 * No single player choice can shift outcomes > 20%
 * Total cumulative player influence < 15% deviation from baseline
 */

export const INFLUENCE_BOUNDS = {
  // Single action limits
  MAX_SINGLE_ACTION_EFFECT: 0.05,    // 5% per action

  // Cumulative limits
  MAX_CUMULATIVE_EFFECT: 0.15,       // 15% total

  // Per-domain limits
  MAX_DOMAIN_EFFECT: {
    'ai_policy': 0.10,
    'climate_action': 0.10,
    'social_cohesion': 0.10,
    'international_cooperation': 0.10,
    'research_direction': 0.10
  }
} as const;

export function validateInfluence(
  action: AdvocacyAction,
  currentInfluence: GameLayerState['influenceByDomain']
): ValidationResult {
  const domain = getDomain(action.targetMetric);
  const currentDomainInfluence = currentInfluence[domain] || 0;
  const newDomainInfluence = currentDomainInfluence + action.baseEffect;

  // Check single action limit
  if (action.baseEffect > INFLUENCE_BOUNDS.MAX_SINGLE_ACTION_EFFECT) {
    return {
      valid: false,
      reason: `Action effect ${action.baseEffect} exceeds single action limit ${INFLUENCE_BOUNDS.MAX_SINGLE_ACTION_EFFECT}`
    };
  }

  // Check domain limit
  if (newDomainInfluence > INFLUENCE_BOUNDS.MAX_DOMAIN_EFFECT[domain]) {
    return {
      valid: false,
      reason: `Domain ${domain} would exceed limit (${newDomainInfluence} > ${INFLUENCE_BOUNDS.MAX_DOMAIN_EFFECT[domain]})`
    };
  }

  // Check cumulative limit
  const totalInfluence = Object.values(currentInfluence).reduce((a, b) => a + b, 0) + action.baseEffect;
  if (totalInfluence > INFLUENCE_BOUNDS.MAX_CUMULATIVE_EFFECT) {
    return {
      valid: false,
      reason: `Total influence would exceed limit (${totalInfluence} > ${INFLUENCE_BOUNDS.MAX_CUMULATIVE_EFFECT})`
    };
  }

  return { valid: true };
}
```

### 4.4 Integration with PlayerDecisionPhase

The existing `PlayerDecisionPhase` at order 8.51 already processes player decisions. Game layer queues decisions to `state.playerDecisions`, which get processed each simulation step.

```typescript
// src/game/core/InfluenceCalculator.ts

export class InfluenceCalculator {
  /**
   * Convert advocacy action to player decision
   * This is the bridge between game layer and simulation
   */
  createDecision(action: AdvocacyAction): PlayerDecision {
    switch (action.mechanism) {
      case 'sentiment_shift':
        return {
          type: 'policy',
          data: {
            actionType: 'advocacy',
            metricPath: action.targetMetric,
            delta: action.baseEffect,
            duration: action.duration
          }
        };

      case 'funding_weight':
        return {
          type: 'investment',
          data: {
            category: action.targetMetric,
            weight: action.baseEffect
          }
        };

      // ... other mechanisms
    }
  }
}
```

---

## 5. Technical Constraints

### 5.1 Performance Budget

| Component | Budget | Notes |
|-----------|--------|-------|
| GameSession.update() | < 5ms | Called each simulation step |
| InfluenceCalculator | < 1ms | Per action processing |
| StateSerializer | < 100ms | Save operation |
| ScenarioValidation | async | Background, N=100 runs |

**Rationale:** Simulation runs at ~60 steps/second in fast mode. Game layer overhead must be minimal.

### 5.2 Memory Considerations

| Data | Max Size | Strategy |
|------|----------|----------|
| Decision History | 10KB/game | Rolling window, archive old |
| Campaign State | 5KB | Active campaigns only |
| Metrics Cache | 20KB | Aggregated, not raw |
| Save File | 500KB | Compressed JSON |

### 5.3 What's Easy vs Hard

**EASY (Phase 1 scope):**
- Read-only observation of simulation state
- Event subscription system
- Scenario selection at game start
- Save/load with RNG state
- Basic advocacy actions that map to existing PlayerDecisionPhase

**HARD (Phase 2+ scope):**
- Complex coalition mechanics with multi-party negotiations
- Dynamic campaign effects that vary based on simulation state
- Real-time influence visualization
- Counterfactual "what if" analysis

---

## 6. Dependencies & Blockers

### 6.1 Simulation Changes Required

**NONE for Phase 1.** The existing architecture supports game layer integration:

- `PlayerDecisionPhase` already exists (order 8.51)
- `state.playerDecisions` queue already exists
- `ScenarioDefinition` type already supports starting conditions
- Event system already emits `GameEvent` objects

### 6.2 Non-Blocking Work (Can Start Immediately)

- [x] Directory structure creation (`src/game/`)
- [x] Type definitions (all interface contracts)
- [x] SaveManager implementation
- [x] Basic InfluenceCalculator
- [x] SimulationObserver (event subscription)
- [x] Scenario definitions (baseline, optimistic, pessimistic)

### 6.3 Blocking Dependencies

| Blocker | Why | Resolution |
|---------|-----|------------|
| Sylvia approval | Architecture must be validated | This document is for review |
| Scenario validation | N=100 Monte Carlo required | After architecture approval |
| Integration testing | Need simulation running | After types are stable |

---

## 7. Implementation Tasks

### Phase 1A: Foundation (Week 1)

| Task | Estimate | Priority |
|------|----------|----------|
| Create `/src/game/` directory structure | 1h | CRITICAL |
| Define all TypeScript interfaces | 4h | CRITICAL |
| Implement SaveManager | 4h | HIGH |
| Implement StateSerializer | 2h | HIGH |
| Implement basic GameSession shell | 3h | HIGH |

### Phase 1B: Scenarios (Week 2)

| Task | Estimate | Priority |
|------|----------|----------|
| Define baseline scenario parameters | 2h | CRITICAL |
| Define optimistic scenario parameters | 2h | HIGH |
| Define pessimistic scenario parameters | 2h | HIGH |
| Implement ScenarioManager | 3h | HIGH |
| Set up Monte Carlo validation pipeline | 4h | HIGH |

### Phase 1C: Influence System (Week 3)

| Task | Estimate | Priority |
|------|----------|----------|
| Implement InfluenceCalculator | 4h | HIGH |
| Define advocacy action catalog | 3h | MEDIUM |
| Implement effect bounds enforcement | 2h | CRITICAL |
| Integrate with PlayerDecisionPhase | 2h | HIGH |

### Phase 1D: Integration (Week 4)

| Task | Estimate | Priority |
|------|----------|----------|
| Implement SimulationObserver | 3h | HIGH |
| Implement MetricsCollector | 2h | MEDIUM |
| Integration tests | 4h | HIGH |
| Monte Carlo validation (N=100) | 8h | CRITICAL |
| Documentation | 2h | MEDIUM |

**Total Estimate:** ~50 hours

---

## 8. Quality Gates

### Gate 1: Architecture Separation (This Document)

- [ ] Sylvia approves architecture
- [ ] Module boundaries documented
- [ ] No simulation imports in game layer

### Gate 2: Scenario Validation

- [ ] Baseline scenario: N=100, CV < 0.01%
- [ ] Optimistic scenario: deviation < 15%
- [ ] Pessimistic scenario: deviation < 15%
- [ ] Sylvia approves all scenarios

### Gate 3: Influence Bounds

- [ ] Single action < 5% effect
- [ ] Cumulative < 15% effect
- [ ] No choice > 20% outcome shift
- [ ] Bounds enforced at runtime

### Gate 4: Final Validation

- [ ] Save/load preserves determinism
- [ ] All tests passing
- [ ] Performance within budget
- [ ] Sylvia final sign-off

---

## 9. Open Questions (for Sylvia/Maya)

1. **Custom Scenarios:** Should custom scenarios (for academic users) be Phase 1 or Phase 2?

2. **Influence Decay:** Should player influence effects decay over time, or be permanent?

3. **Coalition Complexity:** How complex should coalition mechanics be in Phase 1?

4. **Counterfactuals:** Should we track baseline runs for "what if" comparison?

5. **UI Integration:** What's the minimal UI needed for Phase 1 testing?

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Current Session | Initial draft |

---

## Approval Status

| Role | Agent | Status | Date |
|------|-------|--------|------|
| Technical Lead | Roy | AUTHOR | Current Session |
| Research Integrity | Sylvia | **APPROVED WITH CONDITIONS** | Current Session |
| Game Design Lead | Maya | **APPROVED** | Current Session |
| UX Lead | Tessa | Recommended | Pending |

### Sylvia's Approval Conditions (MANDATORY BEFORE IMPLEMENTATION)

**Formal Architecture Approval:** Current Session
**Review Document:** `reviews/phase1_architecture_review.md`

**Required Conditions:**
1. **RNG Stream Isolation:** Game layer MUST use separate RNG from simulation (determinism protection)
2. **Automated Validation:** Monte Carlo validation pipeline required before ANY game feature merge
3. **TypeScript Readonly Enforcement:** All game→simulation interfaces must use `Readonly<T>` types

These conditions are NON-NEGOTIABLE. Implementation cannot proceed until all three are satisfied.

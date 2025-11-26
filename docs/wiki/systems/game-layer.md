# Game Layer Architecture

**Status:** Phase 1 COMPLETE (Nov 24, 2025)
**Location:** `src/game/`
**Files:** 17 TypeScript files
**Approval:** Sylvia (Research Integrity) APPROVED WITH CONDITIONS (Nov 24, 2025)

## Overview

The game layer provides a player-facing interface for the simulation while maintaining strict separation from simulation internals. This architecture was mandated by Research Integrity (Sylvia) to ensure game mechanics never compromise simulation accuracy.

**Core Principle:** The game layer is a READ-ONLY OBSERVER of simulation state. Players influence the simulation INDIRECTLY through queued decisions, never through direct state mutation.

**Design Philosophy:** Research integrity over gameplay convenience. The 15% influence bound ensures that even highly engaged players cannot deviate from research-backed trajectories by more than the uncertainty ranges in the academic literature.

## Module Boundary Rules (Sylvia-Enforced)

1. Game layer NEVER imports from `src/simulation/` internal modules
2. Game layer NEVER mutates simulation state directly
3. All influence flows through PlayerDecisionPhase (order 8.51)
4. Maximum 15% cumulative player influence on outcomes
5. Game layer uses SEPARATE RNG from simulation (determinism protection)
6. All game->simulation interfaces use `Readonly<T>` types

## Directory Structure

```
src/game/
├── index.ts              # Public API exports
├── core/                 # Core game logic
│   ├── GameSession.ts       # Session management, save/load
│   ├── InfluenceCalculator.ts  # Player influence mechanics
│   ├── OutcomeInterpreter.ts   # Outcome presentation
│   └── ScenarioManager.ts      # Scenario selection/validation
├── types/                # Type definitions
│   ├── index.ts            # Barrel exports
│   ├── scenario.ts         # Research scenario types
│   ├── advocacy.ts         # Player advocacy action types
│   ├── save.ts             # Save/load types
│   └── events.ts           # Game layer event types
├── scenarios/            # Research-validated scenarios
│   ├── baseline.ts         # Default scenario
│   ├── optimistic.ts       # Best-case parameters
│   ├── pessimistic.ts      # Worst-case parameters
│   └── validation.ts       # Scenario validation utilities
└── observers/            # Event observation
    ├── SimulationObserver.ts      # Watches simulation events
    ├── MetricsCollector.ts        # Aggregates metrics over time
    └── CriticalJunctureDetector.ts # Detects decision points
```

## Data Flow Architecture

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

**Key Data Flows:**
1. **Simulation → Game:** State snapshots and events flow READ-ONLY from simulation to game layer
2. **Game → Simulation:** Player decisions are QUEUED (never applied directly) and processed by PlayerDecisionPhase
3. **RNG Separation:** Game layer uses its own RNG stream (seed + 1 offset) to avoid contaminating simulation determinism

## Core Components

### GameSession

**File:** `src/game/core/GameSession.ts`

Central orchestration for a game session:
- **Initialization:** Scenario selection, seed management, separate RNG creation
- **State Management:** Holds read-only simulation state snapshot (never mutates it)
- **Decision Queue:** Queues player decisions for processing by PlayerDecisionPhase
- **Save/Load:** Serializes both simulation state AND game layer state (campaigns, coalitions, decision history)
- **RNG State:** Tracks call counts for both simulation RNG and game layer RNG (enables deterministic replay)

**Public API:**
```typescript
interface GameSessionInterface {
  startNewGame(scenario: ResearchScenarioId, seed?: number): void;
  loadGame(saveState: SaveState): void;
  getState(): GameStateSnapshot; // Read-only
  subscribeToEvents(handler: (event: GameLayerEvent) => void): () => void;
  queueAdvocacyAction(actionId: AdvocacyActionId): QueueResult;
  save(): SaveState;
  validateInfluenceBounds(): ValidationResult;
}
```

### InfluenceCalculator

**File:** `src/game/core/InfluenceCalculator.ts`

Calculates player influence within bounds:
- **Single Action Limit:** No action can exceed 5% effect (hard rejection)
- **Domain Limits:** Each domain (AI policy, climate, social, etc.) capped at 10% cumulative influence
- **Total Cumulative Limit:** All player influence across ALL domains cannot exceed 15%
- **Influence Tracking:** Maintains `influenceByDomain` state for validation
- **Effect Translation:** Converts advocacy actions into PlayerDecision objects for simulation

**Influence Bounds (from `src/game/types/advocacy.ts`):**
```typescript
const INFLUENCE_BOUNDS = {
  MAX_SINGLE_ACTION_EFFECT: 0.05,    // 5% per action
  MAX_CUMULATIVE_EFFECT: 0.15,       // 15% total
  MAX_DOMAIN_EFFECT: {
    'ai_policy': 0.10,
    'climate_action': 0.10,
    'social_cohesion': 0.10,
    'international_cooperation': 0.10,
    'research_direction': 0.10
  }
};
```

### ScenarioManager

**File:** `src/game/core/ScenarioManager.ts`

Manages research-validated scenarios:
- **Scenario Registry:** Stores baseline, optimistic, pessimistic scenarios
- **Validation Requirements:** Each scenario must have 2+ peer-reviewed sources (2024-2025 preferred)
- **Monte Carlo Validation:** Requires N≥100 runs before scenario is playable
- **Baseline Comparison:** Ensures optimistic/pessimistic scenarios stay within 15% of baseline
- **Sylvia Approval:** Explicit sign-off required before scenario becomes playable

### OutcomeInterpreter

**File:** `src/game/core/OutcomeInterpreter.ts`

Translates simulation state to player-understandable outcomes:
- **7-Tier Outcomes:** Maps simulation metrics to utopia/golden-age/alignment/struggle/dystopia/collapse/extinction
- **Aggregate Metrics:** Computes overall QoL, environmental health, social stability, AI alignment, governance effectiveness
- **Narrative Generation:** Provides contextual descriptions of current trajectory
- **Influence Remaining:** Calculates how much of the 15% budget player has left

## Observers

### SimulationObserver

**File:** `src/game/observers/SimulationObserver.ts`

Watches simulation for significant events:
- **Crisis Events:** Wars, famines, pandemics, climate disasters
- **Technology Breakthroughs:** TIER 0-4 tech unlocks
- **Boundary Violations:** Planetary boundary crossings
- **AI Milestones:** Capability jumps, alignment shifts, sleeper agent activations
- **Outcome Shifts:** Trajectory changes toward different outcome attractors

**Event Subscription Interface:**
```typescript
interface ISimulationObserver {
  onCrisisDetected(handler: (crisis: CrisisEvent) => void): void;
  onTechnologyUnlocked(handler: (tech: TechnologyEvent) => void): void;
  onOutcomeShift(handler: (outcome: OutcomeEvent) => void): void;
  onPlanetaryBoundaryChange(handler: (boundary: BoundaryEvent) => void): void;
  onCriticalJuncture(handler: (juncture: JunctureEvent) => void): void;
}
```

### MetricsCollector

**File:** `src/game/observers/MetricsCollector.ts`

Aggregates metrics over simulation time:
- **Metric History:** Stores time-series data for key metrics (QoL, environment, AI alignment)
- **Trend Detection:** Calculates moving averages and identifies trends (rising, falling, stable)
- **Inflection Points:** Detects when metrics cross critical thresholds or change trajectory
- **UI Data:** Provides formatted metric histories for dashboard visualization

**Tracked Metrics:**
- Overall Quality of Life (17 dimensions)
- Environmental Health (planetary boundaries)
- Social Stability (cohesion, trust, unemployment)
- AI Alignment Status (capability-weighted alignment)
- Governance Effectiveness (democracy, capacity, information integrity)

### CriticalJunctureDetector

**File:** `src/game/observers/CriticalJunctureDetector.ts`

Identifies player decision opportunities:
- **Technology Junctures:** Moments when breakthrough tech becomes deployable
- **Crisis Response Windows:** Critical timing for interventions (first 24 months most effective)
- **Coalition Formation:** Optimal timing for building stakeholder coalitions
- **Policy Inflection Points:** Moments when policy adoption probability is highest
- **Tipping Point Proximity:** Warns when system is near irreversible threshold

**Juncture Types:**
- `technology_deployment` - New tech available for deployment
- `crisis_intervention` - Crisis detected, intervention window open
- `coalition_opportunity` - High cooperation probability window
- `policy_window` - Policy adoption window (rare, time-limited)

## Player Influence Mechanisms

**File:** `src/game/types/advocacy.ts`

Player influence flows through 6 distinct mechanisms:

| Mechanism | Description | Example Actions |
|-----------|-------------|-----------------|
| `sentiment_shift` | Gradual public opinion change | Public awareness campaigns, narrative framing |
| `coordination_boost` | Increase cooperation probability | Coalition building, stakeholder alignment |
| `funding_weight` | Shift research allocation | Prioritize AI safety vs capabilities research |
| `policy_adoption` | Increase policy enactment probability | Advocacy for specific regulations or interventions |
| `trust_delta` | Modify trust metrics | Transparency initiatives, accountability measures |
| `private_sector_weight` | Influence corporate behavior | ESG advocacy, shareholder activism |

**Influence Domains:**

| Domain | Max Cumulative | Examples |
|--------|----------------|----------|
| `ai_policy` | 10% | AI safety regulations, alignment mandates, compute governance |
| `climate_action` | 10% | Carbon pricing, clean energy deployment, geoengineering |
| `social_cohesion` | 10% | UBI advocacy, education access, meaning initiatives |
| `international_cooperation` | 10% | Climate treaties, AI governance frameworks, nuclear de-escalation |
| `research_direction` | 10% | Safety vs capabilities funding, breakthrough tech priorities |

**Critical Constraints:**
- **Single Action:** No action can exceed 5% effect (hard rejection at queue time)
- **Per Domain:** Each domain capped at 10% cumulative influence
- **Total Cumulative:** All player influence across ALL domains cannot exceed 15%
- **No Outcome Shift:** No single choice can shift final outcome probability by more than 20%

**Enforcement:**
- `InfluenceCalculator.validateBounds()` checks BEFORE queueing decisions
- Failed validations return `QueueResult.success = false` with descriptive rejection reason
- Game layer tracks cumulative influence in `GameLayerState.influenceByDomain`

## Research-Validated Scenarios

**Files:** `src/game/scenarios/baseline.ts`, `optimistic.ts`, `pessimistic.ts`

All scenarios must meet strict validation requirements before becoming playable:

### Baseline (Consensus Trajectory)

**File:** `src/game/scenarios/baseline.ts`

- **Parameters:** Median expert expectations from 2025 calibration
- **Starting Conditions:** Uses default initialization (no overrides)
- **Research Sources:** Epoch AI (2024), IPCC AR6 (2023), V-Dem (2024)
- **Purpose:** Control scenario for comparison, establishes baseline trajectory
- **Validation Status:** PENDING (requires N≥100 Monte Carlo runs)

**Recommended Strategies:**
- Observe system dynamics with minimal intervention
- Focus on critical junctures
- Understand baseline trajectory before trying optimistic/pessimistic

**Expected Challenges:**
- Climate progression following current trajectory
- AI development outpacing governance
- Social instability from inequality and automation
- Competing national interests limiting cooperation

### Optimistic (Best Case Supported by Evidence)

**File:** `src/game/scenarios/optimistic.ts`

- **Parameters:** Upper bounds of research uncertainty ranges
- **Starting Conditions:** High trust (0.75), strong governance (0.7), favorable public sentiment
- **Government Priorities:** Aggressive climate spending (5% GDP), robust AI safety budget ($50B/month)
- **Research Sources:** Alignment researcher surveys (upper bounds), Paris Agreement targets
- **Purpose:** Explore conditions that enable upward spirals
- **Validation Requirement:** Must stay within 15% deviation from baseline

**Key Modifications from Baseline:**
- Trust in AI: 0.75 (vs 0.6 baseline)
- Governance Quality: 0.7 (vs 0.6)
- Democracy Level: 0.75 (vs 0.65)
- Climate Spending: 5% GDP (vs 2-3%)

### Pessimistic (Realistic Worst Case)

**File:** `src/game/scenarios/pessimistic.ts`

- **Parameters:** Lower bounds of research uncertainty ranges
- **Starting Conditions:** Low trust (0.45), weak governance (0.5), fragmented cooperation
- **Government Priorities:** Insufficient climate action (1% GDP), underfunded AI safety ($10B/month)
- **Research Sources:** Fast takeoff scenarios (Amodei, Christiano), RCP 8.5 pathway
- **Purpose:** Explore downward spiral dynamics
- **Validation Requirement:** Must stay within 15% deviation from baseline

**Key Modifications from Baseline:**
- Trust in AI: 0.45 (vs 0.6 baseline)
- Governance Quality: 0.5 (vs 0.6)
- Democracy Level: 0.55 (vs 0.65, democratic backsliding)
- Climate Spending: 1% GDP (vs 2-3%)

### Scenario Validation Pipeline

**File:** `src/game/scenarios/validation.ts`

All scenarios must pass these gates before becoming playable:

1. **Monte Carlo Validation:** N≥100 runs with different seeds
2. **Determinism Check:** Same seed must produce identical results (CV < 0.01%)
3. **Baseline Deviation:** Non-baseline scenarios must stay within 15% of baseline outcomes
4. **Player Agency Bounds:** No single player choice can shift outcomes by >20%
5. **Sylvia Approval:** Explicit research integrity sign-off required

**Validation Functions:**
```typescript
validateScenario(scenario, baselineResults): Promise<ScenarioValidation>
runMonteCarloValidation(scenario, N): Promise<MonteCarloResults>
calculateDeviationFromBaseline(results, baseline): number
calculateCoefficientOfVariation(sameSeedRuns): number
```

## React Integration

**File:** `src/game/providers/GameStateProvider.tsx`

The game layer integrates with the Next.js frontend through React Context:

### GameStateProvider

React context provider that bridges game layer and UI:

**Responsibilities:**
- **Session Management:** Creates and manages GameSession instance
- **State Subscription:** Subscribes to simulation events and updates React state
- **Observer Integration:** Connects SimulationObserver and MetricsCollector to React lifecycle
- **UI Data Transform:** Converts raw GameState into UI-ready data structures
- **Action Dispatch:** Provides methods to queue player decisions

**Actions Exposed:**
```typescript
interface GameStateContextType {
  // Core actions
  advanceMonth(): void;           // Step simulation forward
  setSpeed(n: number): void;      // Adjust simulation speed (1-10)
  queueDecision(id: string): QueueResult;  // Queue player action

  // Session management
  startNewGame(scenario: ResearchScenarioId, seed?: number): void;
  loadGame(saveState: SaveState): void;
  saveGame(): SaveState;

  // Demo/testing
  loadMockData(): void;           // Populate demo data for UI testing
}
```

**UI Data Transformations:**
- `CurrencyData[]` - Research/Influence/Resources/AI Trust with trend indicators
- `OutcomeDistribution` - Utopia/alignment/struggle/collapse/extinction probabilities
- `GameEventDisplay[]` - Severity-coded events for event stream
- `PendingDecision[]` - Urgency-tagged decisions with countdown timers

### useGameState() Hook

**File:** `src/lib/hooks/useGameState.ts`

Custom React hook providing access to game state:

```typescript
function useGameState() {
  const context = useContext(GameStateContext);

  return {
    // State
    state: GameStateSnapshot | null,
    metrics: AggregateMetrics,
    events: GameEventDisplay[],
    currency: CurrencyData[],

    // Actions (from provider)
    advanceMonth,
    queueDecision,
    startNewGame,
    saveGame,
    ...
  };
}
```

**Usage Example:**
```typescript
import { useGameState } from '@/lib/hooks/useGameState';

function GameDashboard() {
  const { state, metrics, advanceMonth, queueDecision } = useGameState();

  return (
    <div>
      <h1>Month {state?.currentMonth}</h1>
      <p>QoL: {metrics.overallQoL.toFixed(2)}</p>
      <button onClick={() => advanceMonth()}>Next Month</button>
      <button onClick={() => queueDecision('increase-ai-safety-funding')}>
        Increase AI Safety Funding
      </button>
    </div>
  );
}
```

## Save/Load System

**Files:** `src/game/types/save.ts`, `GameSession.ts`

The save system preserves BOTH simulation state and game layer state for deterministic replay:

### Save State Structure

```typescript
interface SaveState {
  version: string;              // Format version for migrations
  metadata: SaveMetadata;       // Save info, scenario, current month, playtime

  // Core state
  simulationState: SerializedGameState;  // Full simulation state
  gameLayerState: GameLayerState;        // Game-specific state

  // RNG state for deterministic replay
  rngState: RNGState;
}

interface RNGState {
  seed: number;              // Original simulation seed
  callCount: number;         // Simulation RNG calls (for replay)
  gameLayerSeed: number;     // Game layer seed (seed + 1)
  gameLayerCallCount: number; // Game layer RNG calls
}

interface GameLayerState {
  activeCampaigns: Campaign[];
  coalitions: Coalition[];
  decisionHistory: PlayerDecision[];
  totalInfluenceSpent: number;
  influenceByDomain: Record<InfluenceDomain, number>;
  juncturesEncountered: JunctureEvent[];
  milestonesAchieved: string[];
  activeCooldowns: Record<string, number>;
}
```

### Deterministic Replay

To replay a saved game:
1. Recreate simulation RNG with original seed
2. Advance RNG by `callCount` to exact saved position
3. Recreate game layer RNG with `gameLayerSeed`
4. Advance game layer RNG by `gameLayerCallCount`
5. Restore both simulation state and game layer state

This ensures that continuing from a save produces identical results to running continuously from game start.

## Validation Requirements

Before any scenario modification:
1. Monte Carlo validation (N≥100 runs)
2. Coefficient of variation < 15%
3. Mean outcome within 1σ of baseline
4. Max player influence verified ≤15%
5. Sylvia (Research Integrity) approval

## Technology Stack

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Type System | TypeScript (strict mode) | Type safety for game/simulation boundary |
| State Management | React Context | Minimal dependency, built-in React |
| RNG | Custom LCG (Linear Congruential Generator) | Separate from simulation RNG, deterministic |
| Serialization | JSON | Human-readable saves, version migration support |
| Validation | Monte Carlo (N≥100) | Research-grade statistical validation |

## What's Next: Phase 2 Roadmap

**Current Status:** Phase 1 COMPLETE - Core architecture established and validated

**Phase 2 Priorities (PENDING):**

1. **Advocacy Action Catalog** - Define 20-30 concrete advocacy actions with research-backed effects
2. **Coalition Mechanics** - Multi-party negotiations, coalition formation windows
3. **Crisis Response System** - Time-limited intervention opportunities during crises
4. **Campaign Duration Effects** - Actions that persist over multiple months
5. **Influence Decay** - Decision on whether player influence fades over time
6. **Counterfactual Analysis** - "What if" comparisons against baseline runs
7. **UI Integration** - Full dashboard implementation (currently demo only)
8. **Monte Carlo Validation** - Validate all 3 scenarios (baseline, optimistic, pessimistic)
9. **Sylvia Final Approval** - Research integrity sign-off on playable scenarios

**Blockers for Phase 2:**
- Scenario validation requires N≥100 Monte Carlo runs (8-10 hours compute time)
- Advocacy action catalog needs research sources for each action
- Coalition mechanics require complex prerequisite checking

**Phase 3+ (Future):**
- Custom scenarios for academic users
- Multi-player coordination
- Real-time influence visualization
- Narrative generation for outcomes
- Achievement/milestone system

## Test Coverage

### PlayerDecisionPhase (Nov 26, 2025)

**Status:** ✅ **90% coverage** (41 tests) - `/tests/unit/phases/PlayerDecisionPhase.test.ts`

**Comprehensive test suites:**
- **Policy decisions:** AI regulation, safety investment, compute governance
- **Government actions:** migratedActions execution
- **Investment decisions:** Technology research acceleration
- **Emergency decisions:** Crisis response processing
- **AI action decisions:** Manual agent action execution
- **Error handling:** Edge cases and malformed input
- **Queue processing:** Multiple decision queue handling

**Uncovered lines (9.4%):**
- AI action `canExecute=false` branch (requires specific action state)
- Action success/failure event generation (requires full action execution)

---

## Related Documentation

- [Game Design Document](../../../plans/game-design/GAME_DESIGN_DOCUMENT.md) - Overall vision and design philosophy
- [Game Development Roadmap](../../../plans/game-design/GAME_DEVELOPMENT_ROADMAP.md) - Phased implementation plan
- [Phase 1 Technical Spec](../../../plans/game-design/PHASE1_TECHNICAL_SPEC.md) - Complete architecture specification
- [Sylvia's Architecture Review](../../../reviews/phase1_architecture_review.md) - Research integrity approval conditions

## Implementation History

| Date | Change | Commit | Details |
|------|--------|--------|---------|
| Nov 26, 2025 | PlayerDecisionPhase unit tests | 7a83474 | 41 tests, 90% coverage for decision processing |
| Nov 24, 2025 | Wiki documentation update | - | Comprehensive game layer architecture documentation |
| Nov 24, 2025 | Game Dashboard UI | 109a89a | Far-future aesthetic components (12 files, ~1,800 lines) |
| Nov 24, 2025 | GameStateProvider | 63ffd76 | React bridge for dashboard/simulation integration |
| Nov 24, 2025 | Phase 1 Complete | a984b51 | All 17 game layer files implemented |
| Nov 24, 2025 | TypeScript fixes | a984b51 | Resolved type errors in game layer |
| Nov 24, 2025 | JSDoc documentation | 87a14a2e5 | Added inline documentation to all classes |
| Nov 24, 2025 | Sylvia Approval | - | APPROVED WITH CONDITIONS (RNG isolation, validation pipeline, Readonly<T> types) |

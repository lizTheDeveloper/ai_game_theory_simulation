# Game Layer Architecture

**Status:** Phase 1 COMPLETE (Nov 24, 2025)
**Location:** `src/game/`
**Files:** 17 TypeScript files

## Overview

The game layer provides the player-facing interface for the simulation while maintaining strict separation from simulation internals. This architecture was mandated by Research Integrity (Sylvia) to ensure that game mechanics never compromise simulation accuracy.

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

## Core Components

### GameSession

Central orchestration for a game session:
- Creates simulation engine with scenario parameters
- Manages player decision queue
- Handles save/load with state serialization
- Tracks session metrics and events

### InfluenceCalculator

Calculates player influence within bounds:
- Validates influence actions don't exceed 15% bound
- Computes cumulative influence across domains
- Tracks influence decay over time

### ScenarioManager

Manages research-validated scenarios:
- Loads and validates scenario configurations
- Ensures parameters are within research-backed ranges
- Supports Monte Carlo comparison between scenarios

### OutcomeInterpreter

Translates simulation state to player-understandable outcomes:
- Maps 7-tier outcomes (utopia → extinction)
- Generates narrative summaries
- Calculates outcome probabilities

## Observers

### SimulationObserver

Watches simulation for significant events:
- Crisis events (wars, famines, pandemics)
- Technology breakthroughs
- Boundary violations
- AI capability milestones

### MetricsCollector

Aggregates metrics over simulation time:
- Tracks metric history with trends
- Calculates moving averages
- Detects inflection points

### CriticalJunctureDetector

Identifies player decision opportunities:
- Technology deployment choices
- Crisis response options
- Coalition formation windows
- Policy inflection points

## Player Influence Mechanisms

| Domain | Max Influence | Mechanism |
|--------|---------------|-----------|
| Policy | 15% | Advocacy campaigns, coalition building |
| Technology | 15% | Research prioritization, deployment timing |
| Social | 15% | Public awareness, narrative framing |
| Economic | 15% | Investment patterns, resource allocation |

**Important:** The 15% bound applies to cumulative influence across all domains. Players cannot "stack" influence to exceed this limit.

## Scenarios

### Baseline (Default)
- Research-backed median parameters
- Represents "most likely" trajectory
- Used for Monte Carlo validation

### Optimistic
- 25th percentile risk parameters
- Best-case (but still research-valid) assumptions
- Used for exploring upward spirals

### Pessimistic
- 75th percentile risk parameters
- Worst-case (but still research-valid) assumptions
- Used for exploring downward spirals

## React Integration

The game layer integrates with the Next.js frontend through:

### GameStateProvider

React context provider that:
- Wraps GameSession for React lifecycle
- Provides game state to component tree
- Handles cleanup on unmount

### useGameState() Hook

Custom hook providing:
- Current game state snapshot
- Player decision dispatch
- Session control (pause, save, load)

## Validation Requirements

Before any scenario modification:
1. Monte Carlo validation (N≥100 runs)
2. Coefficient of variation < 15%
3. Mean outcome within 1σ of baseline
4. Max player influence verified ≤15%

## Related Documentation

- [Game Design Document](../../../plans/game-design/GAME_DESIGN_DOCUMENT.md)
- [Game Development Roadmap](../../../plans/game-design/GAME_DEVELOPMENT_ROADMAP.md)
- [Phase 1 Technical Spec](../../../plans/game-design/PHASE1_TECHNICAL_SPEC.md)

## Implementation History

| Date | Change | Commit |
|------|--------|--------|
| Nov 24, 2025 | Phase 1 Complete | a984b51, 63ffd7660 |
| Nov 24, 2025 | TypeScript errors fixed | a984b51 |
| Nov 24, 2025 | JSDoc documentation added | 87a14a2e5 |

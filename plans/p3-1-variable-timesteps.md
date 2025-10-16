# P3.1: Variable Timesteps / Event-Driven Architecture

**Status:** Not yet implemented
**Estimated Time:** 10-12 hours
**Priority:** LOW
**Category:** Enhancement - Performance & Realism

## Overview

Replace fixed monthly timesteps with variable timesteps and event-driven architecture for improved performance and realism.

## Problem

Current simulation uses fixed 1-month timesteps regardless of activity level. This causes:
- Unnecessary computation during stable periods
- Poor temporal resolution for rapid events (AI takeoff, nuclear war)
- Performance bottlenecks in long simulations

## Proposed Solution

### Variable Timestep System

```typescript
interface TimestepController {
  baseTimestep: number; // Default: 1 month
  currentTimestep: number; // Dynamic: 1 day to 3 months

  calculateTimestep(state: GameState): number {
    // Fast forward during stable periods
    if (state.stability > 0.8 && state.activeCrises.length === 0) {
      return 3; // 3-month steps
    }

    // Fine resolution during crises
    if (state.activeCrises.some(c => c.severity === 'existential')) {
      return 0.033; // Daily steps (1/30 month)
    }

    // Standard resolution
    return 1; // Monthly
  }
}
```

### Event-Driven Architecture

```typescript
interface SimulationEvent {
  id: string;
  timestamp: number;
  type: 'ai_capability_threshold' | 'crisis_trigger' | 'technology_unlock';
  priority: number;
  execute(state: GameState): void;
}

class EventQueue {
  events: SimulationEvent[];

  scheduleEvent(event: SimulationEvent): void;
  processNextEvent(state: GameState): void;
  advanceToNextEvent(state: GameState): void;
}
```

## Expected Impact

- 3-5x performance improvement for long simulations
- Better temporal resolution for rapid events
- More realistic modeling of sudden changes

## Test Criteria

- [ ] Simulation runs 3-5x faster for 600-month runs
- [ ] AI takeoff events have daily/weekly resolution
- [ ] Stable periods fast-forward without precision loss

## References

- architecture-review-20251015.md (P3.1 specification)
- Performance optimization analysis

## Files to Create/Modify

- `/src/simulation/engine/TimestepController.ts` - New file
- `/src/simulation/engine/EventQueue.ts` - New file
- `/src/simulation/engine/PhaseOrchestrator.ts` - Modify to use variable timesteps

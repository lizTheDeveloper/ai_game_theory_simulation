# Web Worker Dual-Mode Architecture

**Date:** October 22, 2025
**Status:** Design Phase
**Objective:** Enable simulation to run in both Node.js (Monte Carlo) and browser (real-time) without code duplication

## Problem Statement

Current state:
- ✅ Simulation engine works in Node.js for Monte Carlo
- ❌ Cannot run in browser for real-time playable mode
- ❌ No player interaction during simulation

Requirement:
- Same simulation engine code runs in **both** Node.js and browser
- No code duplication
- Monte Carlo continues to work unchanged
- Real-time mode runs in Web Worker (non-blocking UI)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Simulation Engine (Pure TS)              │
│  src/simulation/engine.ts, initialization.ts, phases/*      │
│  - Framework-agnostic                                       │
│  - No Node.js or browser-specific APIs                     │
│  - Deterministic RNG                                        │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
┌───────▼─────────┐              ┌───────────▼─────────────┐
│   Node.js Mode  │              │    Browser Mode         │
│   (Monte Carlo) │              │   (Real-time Playable)  │
└─────────────────┘              └─────────────────────────┘
        │                                     │
        │                                     │
┌───────▼──────────┐             ┌───────────▼──────────────┐
│ scripts/         │             │ Main Thread (UI)         │
│ monteCarloSim.ts │             │   - Dashboard            │
│                  │             │   - Player controls      │
│ - Direct import  │             │   - State visualization  │
│ - Headless run   │             │                          │
│ - File output    │             │ postMessage              │
└──────────────────┘             │     ▼        ▲           │
                                 │ Web Worker   │           │
                                 │   - Imports engine       │
                                 │   - Runs simulation      │
                                 │   - Sends delta updates  │
                                 └──────────────────────────┘
```

## Design Principles

1. **Single Source of Truth:** `src/simulation/` is the only simulation code
2. **Environment Abstraction:** Engine doesn't know if it's in Node.js or browser
3. **Message Passing:** Web Worker communicates via structured messages
4. **Delta Updates:** Only send changed state to UI (not full 1.78MB state)
5. **Non-Breaking:** Monte Carlo scripts continue to work unchanged

## Implementation Plan

### Part 1: Create Web Worker Wrapper (2-3 hours)

**File:** `src/workers/simulationWorker.ts`

```typescript
import { SimulationEngine } from '../simulation/engine';
import { createDefaultInitialState } from '../simulation/initialization';
import type { GameState } from '../types/game';

// Worker state
let engine: SimulationEngine | null = null;
let state: GameState | null = null;
let running = false;
let intervalId: number | null = null;

// Message types
type WorkerMessage =
  | { type: 'init'; seed: number; scenario: 'historical' | 'unprecedented' }
  | { type: 'start' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'step' }
  | { type: 'decision'; decision: PlayerDecision };

type WorkerResponse =
  | { type: 'initialized'; state: GameState }
  | { type: 'update'; delta: StateDelta; month: number }
  | { type: 'paused' }
  | { type: 'resumed' }
  | { type: 'error'; error: string };

// Listen for messages from main thread
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const msg = event.data;

  try {
    switch (msg.type) {
      case 'init':
        engine = new SimulationEngine({ seed: msg.seed });
        state = createDefaultInitialState(msg.scenario);
        self.postMessage({ type: 'initialized', state } as WorkerResponse);
        break;

      case 'start':
        if (!engine || !state) throw new Error('Not initialized');
        running = true;
        startSimulationLoop();
        break;

      case 'pause':
        running = false;
        if (intervalId !== null) {
          clearInterval(intervalId);
          intervalId = null;
        }
        self.postMessage({ type: 'paused' } as WorkerResponse);
        break;

      case 'resume':
        if (!running) {
          running = true;
          startSimulationLoop();
          self.postMessage({ type: 'resumed' } as WorkerResponse);
        }
        break;

      case 'step':
        if (!engine || !state) throw new Error('Not initialized');
        performStep();
        break;

      case 'decision':
        if (!state) throw new Error('Not initialized');
        // Inject player decision (Phase 3)
        injectPlayerDecision(state, msg.decision);
        break;
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : String(error)
    } as WorkerResponse);
  }
});

function startSimulationLoop() {
  // Run at 1 day/second (1000ms interval)
  intervalId = setInterval(() => {
    if (!running || !engine || !state) {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
      return;
    }

    performStep();
  }, 1000) as unknown as number;
}

function performStep() {
  if (!engine || !state) return;

  const previousState = cloneForDelta(state);

  // Run one simulation step
  engine.step(state);

  // Calculate delta (only changed fields)
  const delta = calculateDelta(previousState, state);

  // Send update to main thread
  self.postMessage({
    type: 'update',
    delta,
    month: state.currentMonth
  } as WorkerResponse);
}

function calculateDelta(previous: GameState, current: GameState): StateDelta {
  // Only send changed fields (avoids 1.78MB full state)
  const delta: StateDelta = {};

  // Check top-level fields
  if (previous.currentMonth !== current.currentMonth) {
    delta.currentMonth = current.currentMonth;
  }

  if (previous.globalMetrics.qualityOfLife !== current.globalMetrics.qualityOfLife) {
    delta.qualityOfLife = current.globalMetrics.qualityOfLife;
  }

  // Add other changed fields as needed
  // This is where optimization happens - only send what changed

  return delta;
}

function cloneForDelta(state: GameState): GameState {
  // Shallow clone of fields we need to compare
  // Don't deep clone entire 1.78MB state (too expensive)
  return {
    currentMonth: state.currentMonth,
    globalMetrics: { ...state.globalMetrics },
    // Add other fields we want to track changes for
  } as GameState;
}

function injectPlayerDecision(state: GameState, decision: PlayerDecision) {
  // Player decision injection (Phase 3)
  // For now, placeholder
  console.log('Player decision:', decision);
}

// Types
interface PlayerDecision {
  type: 'policy' | 'investment' | 'emergency';
  data: any;
}

interface StateDelta {
  currentMonth?: number;
  qualityOfLife?: number;
  // Add other fields that can change
}
```

### Part 2: Main Thread Interface (1-2 hours)

**File:** `src/lib/simulationWorkerClient.ts`

```typescript
import type { GameState } from '@/types/game';

export class SimulationWorkerClient {
  private worker: Worker | null = null;
  private callbacks: Map<string, Set<Function>> = new Map();

  constructor() {
    // Initialize Web Worker (browser only)
    if (typeof window !== 'undefined') {
      this.worker = new Worker(
        new URL('../workers/simulationWorker.ts', import.meta.url),
        { type: 'module' }
      );

      this.worker.addEventListener('message', this.handleMessage.bind(this));
    }
  }

  private handleMessage(event: MessageEvent) {
    const msg = event.data;

    switch (msg.type) {
      case 'initialized':
        this.emit('initialized', msg.state);
        break;
      case 'update':
        this.emit('update', msg.delta, msg.month);
        break;
      case 'paused':
        this.emit('paused');
        break;
      case 'resumed':
        this.emit('resumed');
        break;
      case 'error':
        this.emit('error', msg.error);
        break;
    }
  }

  // Event emitter pattern
  on(event: string, callback: Function) {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, new Set());
    }
    this.callbacks.get(event)!.add(callback);
  }

  off(event: string, callback: Function) {
    this.callbacks.get(event)?.delete(callback);
  }

  private emit(event: string, ...args: any[]) {
    this.callbacks.get(event)?.forEach(cb => cb(...args));
  }

  // Public API
  init(seed: number, scenario: 'historical' | 'unprecedented' = 'historical') {
    this.worker?.postMessage({ type: 'init', seed, scenario });
  }

  start() {
    this.worker?.postMessage({ type: 'start' });
  }

  pause() {
    this.worker?.postMessage({ type: 'pause' });
  }

  resume() {
    this.worker?.postMessage({ type: 'resume' });
  }

  step() {
    this.worker?.postMessage({ type: 'step' });
  }

  decision(decision: any) {
    this.worker?.postMessage({ type: 'decision', decision });
  }

  destroy() {
    this.worker?.terminate();
    this.worker = null;
    this.callbacks.clear();
  }
}
```

### Part 3: React Dashboard Component (2-3 hours)

**File:** `frontend/app/realtime/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { SimulationWorkerClient } from '@/lib/simulationWorkerClient';

export default function RealtimePage() {
  const [worker] = useState(() => new SimulationWorkerClient());
  const [state, setState] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [month, setMonth] = useState(0);

  useEffect(() => {
    // Listen for updates
    worker.on('initialized', (initialState: any) => {
      setState(initialState);
      console.log('Simulation initialized');
    });

    worker.on('update', (delta: any, currentMonth: number) => {
      // Apply delta to state
      setState((prev: any) => ({ ...prev, ...delta }));
      setMonth(currentMonth);
    });

    worker.on('paused', () => {
      setRunning(false);
    });

    worker.on('resumed', () => {
      setRunning(true);
    });

    worker.on('error', (error: string) => {
      console.error('Worker error:', error);
    });

    // Initialize simulation
    worker.init(42000, 'historical');

    // Cleanup
    return () => {
      worker.destroy();
    };
  }, [worker]);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Real-Time Simulation</h1>

      {/* Controls */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => {
            if (running) {
              worker.pause();
            } else {
              worker.start();
            }
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {running ? 'Pause' : 'Start'}
        </button>

        <button
          onClick={() => worker.step()}
          className="px-4 py-2 bg-gray-500 text-white rounded"
        >
          Step
        </button>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-semibold">Month</h3>
          <p className="text-2xl">{month}</p>
        </div>

        <div className="p-4 border rounded">
          <h3 className="font-semibold">Quality of Life</h3>
          <p className="text-2xl">
            {state?.qualityOfLife?.toFixed(2) ?? '—'}
          </p>
        </div>

        <div className="p-4 border rounded">
          <h3 className="font-semibold">Status</h3>
          <p className="text-2xl">{running ? '▶️ Running' : '⏸️ Paused'}</p>
        </div>
      </div>
    </div>
  );
}
```

## Benefits

### ✅ No Code Duplication
- Simulation engine is single source of truth
- Both Node.js and browser import the same code
- Changes to engine automatically apply to both modes

### ✅ Non-Breaking for Monte Carlo
- `scripts/monteCarloSimulation.ts` continues to work unchanged
- Direct imports, no worker overhead
- File-based output

### ✅ Real-Time Playable Mode
- Runs in Web Worker (non-blocking UI)
- 1 day/second timing (configurable)
- Pause/resume controls
- Player decision injection (Phase 3)

### ✅ Performance Optimized
- Delta updates (not full 1.78MB state)
- Only changed fields sent to UI
- Worker runs on separate thread

## File Structure

```
src/
├── simulation/           # Pure engine (unchanged)
│   ├── engine.ts
│   ├── initialization.ts
│   └── engine/phases/
├── workers/              # NEW: Web Worker wrapper
│   └── simulationWorker.ts
├── lib/                  # NEW: Client interface
│   └── simulationWorkerClient.ts
└── types/
    └── game.ts           # Shared types

frontend/app/
└── realtime/             # NEW: Real-time dashboard
    └── page.tsx

scripts/
└── monteCarloSimulation.ts  # Unchanged
```

## Next Steps

1. **Phase 1 (2-3 hours):** Create Web Worker wrapper
2. **Phase 2 (1-2 hours):** Create main thread client interface
3. **Phase 3 (2-3 hours):** Build basic dashboard
4. **Phase 4 (2-3 hours):** Implement delta calculation
5. **Phase 5 (Optional):** Add player decision system

**Total Estimate:** 8-12 hours for minimal viable real-time mode

## Open Questions

1. **Delta calculation strategy:** Which fields to track?
2. **Performance target:** Can we hit <200ms per step consistently?
3. **Player decisions:** What actions should players be able to take?
4. **State serialization:** Do we need custom serialization for Web Worker?

## Success Criteria

- ✅ Monte Carlo continues to work unchanged
- ✅ Real-time mode runs at 1 day/second (1000ms interval)
- ✅ UI updates without blocking
- ✅ Can pause/resume simulation
- ✅ Dashboard shows key metrics in real-time

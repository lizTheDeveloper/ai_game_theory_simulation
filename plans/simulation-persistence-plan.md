# Simulation State Persistence Plan

**Problem:** Events persist in IndexedDB across page refresh, but simulation state is lost. This creates:
- Orphaned event data with no context
- Loss of in-progress simulations
- Forced restart after any refresh
- Inconsistent persistence model

**Solution:** Persist full simulation state to IndexedDB, enable resume/continue functionality.

---

## Phase 1: Core State Persistence (4-6 hours)

### 1.1 Extend EventDatabase to Store Simulation State

**File:** `src/lib/eventDatabase.ts` (extend existing)

Add new object stores:
- `simulations` - Full GameState snapshots
- `simulation_metadata` - Lightweight metadata for listing

```typescript
interface StoredSimulation {
  id: string;                    // `${seed}_${scenario}`
  gameState: GameState;          // Full simulation state
  lastUpdated: number;           // Timestamp of last save
  currentMonth: number;          // Quick access to progress
  version: string;               // Schema version for migrations
}

interface SimulationMetadata {
  id: string;
  seed: number;
  scenario: ScenarioMode;
  startDate: string;
  currentMonth: number;
  lastUpdated: number;
  eventCount: number;
  isRunning: boolean;            // Paused vs running
}
```

**New methods:**
- `saveSimulation(id: string, state: GameState): Promise<void>`
- `loadSimulation(id: string): Promise<StoredSimulation | null>`
- `listSimulations(): Promise<SimulationMetadata[]>`
- `deleteSimulation(id: string): Promise<void>`

### 1.2 Worker Autosave on Each Step

**File:** `src/workers/simulationWorker.ts`

Add autosave after each simulation step:

```typescript
// After computing delta
await eventDatabase.saveSimulation(simulationId, currentState);
```

**Considerations:**
- Debounce saves (every 5 steps?) to reduce write load
- Deep clone state before saving (avoid mutation issues)
- Handle save failures gracefully (log, don't crash)

**Estimated:** 2-3 hours

---

## Phase 2: Resume/Continue UX (3-4 hours)

### 2.1 Simulation List on Dashboard Home

**File:** `src/components/dashboards/SimulationPersistenceManager.tsx`

**UI/UX Design Specification:**

#### Auto-Resume Flow

When page loads, the system checks for the most recent compatible simulation:

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  ╔══════════════════════════════════════════════════════════════╗  │
│  ║                 RESUMING SIMULATION                          ║  │
│  ║                                                              ║  │
│  ║  ████████████████░░░░░░░░  75%                             ║  │
│  ║                                                              ║  │
│  ║  Seed 42000 • Historical Events • Month 15                  ║  │
│  ║  Last saved: 2 minutes ago                                  ║  │
│  ║                                                              ║  │
│  ║  [glowing cyan pulse animation]                             ║  │
│  ╚══════════════════════════════════════════════════════════════╝  │
│                                                                      │
│                     [CANCEL] [START NEW INSTEAD]                    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Shows for 3 seconds with progress bar
- Auto-dismisses and resumes unless user clicks "Start New Instead"
- Fade transition into main dashboard
- Cancel keeps user at simulation list

#### Simulation Management Interface

**Main View - Grid Layout (Default):**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  SIMULATION ARCHIVE                                          [LIST] [GRID]   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │ ░░░░░░░░░░░░░░░░░░░ │  │ ░░░░░░░░░░░░░░░░░░░ │  │ ░░░░░░░░░░░░░░░░░░░ │ │
│  │ ░ [RUNNING BADGE] ░░ │  │ ░░░░░░░░░░░░░░░░░░░ │  │ ░░ [⚠ WARNING] ░░░░ │ │
│  │ ░░░░░░░░░░░░░░░░░░░ │  │ ░░░░░░░░░░░░░░░░░░░ │  │ ░░░░░░░░░░░░░░░░░░░ │ │
│  │ ░░░░░░░░░░░░░░░░░░░ │  │ ░░░░░░░░░░░░░░░░░░░ │  │ ░░░░░░░░░░░░░░░░░░░ │ │
│  │                      │  │                      │  │                      │ │
│  │ SEED 42000          │  │ SEED 55123          │  │ SEED 77890          │ │
│  │ Historical Events    │  │ Optimistic          │  │ Pessimistic         │ │
│  │                      │  │                      │  │                      │ │
│  │ ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░ │  │ ▓▓▓▓▓░░░░░░░░░░░░░░ │  │ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │ │
│  │ Month 15 of 120     │  │ Month 8 of 120      │  │ Month 120 of 120    │ │
│  │                      │  │                      │  │                      │ │
│  │ Population: 7.8B    │  │ Population: 8.1B    │  │ Population: 2.1B    │ │
│  │ QoL: 68%           │  │ QoL: 72%           │  │ QoL: 31%           │ │
│  │ AI Cap: 3.2        │  │ AI Cap: 2.8        │  │ AI Cap: 4.8        │ │
│  │                      │  │                      │  │                      │ │
│  │ 2 min ago • v7a2d3  │  │ 3 days ago • v7a2d3 │  │ 1 week ago • v6b1c2 │ │
│  │                      │  │                      │  │  OLD VERSION        │ │
│  │ [CONTINUE] [···]    │  │ [CONTINUE] [···]    │  │ [DOWNLOAD] [···]    │ │
│  └─────────────────────┘  └─────────────────────┘  └─────────────────────┘ │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      + START NEW SIMULATION                          │   │
│  │                         [glowing cyan border]                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Card States:**
- **Running** (cyan glow pulse): Currently active simulation
- **Compatible** (white border): Can resume (same git version)
- **Incompatible** (amber warning): Different git version, download only
- **Completed** (green checkmark): Reached end state

**List View (Alternative):**

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                                                                                  │
│  SIMULATION ARCHIVE                                              [LIST] [GRID]   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                                  │
│  SEED      SCENARIO           MONTH   POP    QOL   AI    SAVED       VERSION    │
│  ──────────────────────────────────────────────────────────────────────────────  │
│  42000  ● Historical Events    15/120  7.8B   68%   3.2   2 min ago   v7a2d3  ▼ │
│         └─ Environmental crisis cascade detected                                 │
│         └─ 3 active upward spirals                                              │
│         └─ [CONTINUE] [DOWNLOAD] [DELETE]                                       │
│                                                                                  │
│  55123  ○ Optimistic           8/120   8.1B   72%   2.8   3 days ago  v7a2d3  ► │
│                                                                                  │
│  77890  ⚠ Pessimistic         120/120  2.1B   31%   4.8   1 week ago  v6b1c2  ► │
│                                                                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                                  │
│  [+ START NEW SIMULATION]                                                       │
│                                                                                  │
└──────────────────────────────────────────────────────────────────────────────────┘
```

#### Version Compatibility Warning

When attempting to load an incompatible version:

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│              ⚠ VERSION INCOMPATIBILITY DETECTED                  │
│              ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                 │
│                                                                  │
│  This simulation was created with a different version           │
│  of the simulation engine and cannot be resumed.                │
│                                                                  │
│  Simulation Version: v6b1c2 (7 days old)                       │
│  Current Version:    v7a2d3                                    │
│                                                                  │
│  Changes since this simulation:                                 │
│  • Nuclear winter cascade mechanics                            │
│  • Organization-to-country linkage fix                         │
│  • Enhanced environmental accumulation                         │
│                                                                  │
│  You can still download this simulation for analysis.          │
│                                                                  │
│         [DOWNLOAD JSON]        [VIEW EVENTS]                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

#### Overflow Menu Actions (···)

```
┌─────────────────────┐
│ ▶ View Details      │
│ ⬇ Download JSON     │
│ 📊 View Events      │
│ 🔄 Clone Settings   │
│ ━━━━━━━━━━━━━━━━━━ │
│ 🗑 Delete           │
└─────────────────────┘
```

#### Future Monte Carlo Integration View

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  MONTE CARLO RUN #17 • 100 SIMULATIONS                    [BACK TO ARCHIVE] │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                              │
│  OUTCOME DISTRIBUTION                                                        │
│  ┌────────────────────────────────────────────────────────────────┐        │
│  │ Utopia      ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░  15%          │        │
│  │ Status Quo  ████████████████░░░░░░░░░░░░░░░░░░░  32%          │        │
│  │ Dystopia    ██████████████████████░░░░░░░░░░░░░  41%          │        │
│  │ Extinction  ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  12%          │        │
│  └────────────────────────────────────────────────────────────────┘        │
│                                                                              │
│  INDIVIDUAL RUNS                           Filter: [All ▼] Sort: [Outcome ▼]│
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                              │
│  [Mini cards showing 100 simulations with hover details]                    │
│  ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■                       │
│  ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■                       │
│  ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■                       │
│  ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■ ■                       │
│                                                                              │
│  Click any run to explore →                                                 │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### Detailed Simulation View (Modal/Slide-out)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  SIMULATION DETAILS                                                    [✕]  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                                                              │
│  SEED 42000 • HISTORICAL EVENTS                                             │
│                                                                              │
│  ┌─────────────────┬─────────────────────────────────────────────────────┐ │
│  │ Configuration   │ Seed:             42000                              │ │
│  │                 │ Scenario:         Historical Events                   │ │
│  │                 │ Started:          Oct 26, 2025 14:32:15              │ │
│  │                 │ Last Saved:       Oct 26, 2025 14:34:28 (2 min ago)  │ │
│  │                 │ Version:          v7a2d3c (compatible)               │ │
│  │                 │ Storage Size:     3.2 MB                             │ │
│  ├─────────────────┼─────────────────────────────────────────────────────┤ │
│  │ Progress        │ Current Month:    15 / 120                           │ │
│  │                 │ Simulation Time:  Oct 2026                          │ │
│  │                 │ Real Time:        2h 15min                          │ │
│  │                 │ Events Logged:    1,247                             │ │
│  ├─────────────────┼─────────────────────────────────────────────────────┤ │
│  │ Current State   │ Population:       7.8B (-2.4%)                      │ │
│  │                 │ Quality of Life:  68% (↓ from 71%)                  │ │
│  │                 │ AI Capability:    3.2 (exponential growth phase)    │ │
│  │                 │ Alignment:        14/20 agents aligned              │ │
│  │                 │                                                      │ │
│  │                 │ Western Liberal:  ████████████░░░░░░ 62%           │ │
│  │                 │ Development:      ███████████████░░░ 75%           │ │
│  │                 │ Ecological:       ██████░░░░░░░░░░░░ 31% ⚠         │ │
│  │                 │ Indigenous:       █████████░░░░░░░░░ 48%           │ │
│  ├─────────────────┼─────────────────────────────────────────────────────┤ │
│  │ Active Dynamics │ • Phosphorus Crisis (Severity 3)                    │ │
│  │                 │ • Freshwater Scarcity (Emerging)                    │ │
│  │                 │ • Abundance Spiral (12 months active)               │ │
│  │                 │ • Democratic Spiral (8 months active)               │ │
│  │                 │ • AGI Deception Detected (3 agents sandbagging)     │ │
│  └─────────────────┴─────────────────────────────────────────────────────┘ │
│                                                                              │
│  [CONTINUE SIMULATION]    [DOWNLOAD JSON]    [VIEW EVENTS]    [DELETE]      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Modify Init Flow with Resume Check

**File:** `src/lib/contexts/SimulationWorkerContext.tsx`

```typescript
// On mount, check for existing simulation
useEffect(() => {
  const checkForExisting = async () => {
    const existing = await eventDatabase.loadSimulation(simulationId);
    if (existing) {
      setHasExistingSimulation(true);
      setExistingMetadata(existing.metadata);
    }
  };
  checkForExisting();
}, []);

// Modified init function
const init = (seed, scenario, speed, ...) => {
  // Check if simulation with this ID exists
  const existing = await eventDatabase.loadSimulation(`${seed}_${scenario}`);

  if (existing) {
    // Show confirmation: "Resume existing or start fresh?"
    const shouldResume = await confirmResume(); // Modal or toast

    if (shouldResume) {
      // Load state from IndexedDB
      client.resumeFromState(existing.gameState);
    } else {
      // Delete old state + events, start fresh
      await eventDatabase.deleteSimulation(existing.id);
      client.init(seed, scenario, interval, ...);
    }
  } else {
    // Normal init flow
    client.init(seed, scenario, interval, ...);
  }
};
```

### 2.3 New Worker Message: `resumeFromState`

**File:** `src/workers/simulationWorker.ts`

```typescript
case 'resumeFromState': {
  const { state } = message;
  currentState = state;
  previousSnapshot = captureSnapshot(currentState);

  // Reconstruct RNG from state
  rng = seedRandom(`${currentState.seed}`);
  // Skip forward RNG to current position (currentState.currentMonth steps)
  for (let i = 0; i < currentState.currentMonth; i++) {
    rng();
  }

  self.postMessage({
    type: 'resumed',
    snapshot: previousSnapshot,
    startDate: currentState.simulationStartDate
  });
  break;
}
```

**Estimated:** 3-4 hours

---

## Phase 3: Data Migration & Edge Cases (2-3 hours)

### 3.1 Schema Versioning

Store version in `StoredSimulation.version`:

```typescript
const SCHEMA_VERSION = '1.0';

interface StoredSimulation {
  version: string;  // '1.0', '1.1', etc.
  // ...
}

// On load, check version
async function loadSimulation(id: string) {
  const stored = await db.get(id);

  if (stored.version !== SCHEMA_VERSION) {
    // Run migration
    const migrated = migrateSimulation(stored, SCHEMA_VERSION);
    return migrated;
  }

  return stored;
}
```

### 3.2 Handle Corrupted State

```typescript
async function loadSimulation(id: string) {
  try {
    const stored = await db.get(id);

    // Validate critical fields
    if (!stored.gameState || !stored.gameState.currentMonth) {
      throw new Error('Invalid state structure');
    }

    return stored;
  } catch (error) {
    console.error('[EventDB] Corrupted simulation state:', error);

    // Option 1: Delete corrupted state
    await eventDatabase.deleteSimulation(id);

    // Option 2: Return null, let user know
    return null;
  }
}
```

### 3.3 Storage Quotas

IndexedDB has browser limits (~50-100MB typical):

```typescript
// Estimate storage size
function estimateStorageSize(state: GameState): number {
  return JSON.stringify(state).length;
}

// Check quota before save
async function saveSimulation(id: string, state: GameState) {
  const size = estimateStorageSize(state);

  if (size > 10_000_000) { // 10MB threshold
    console.warn('[EventDB] Simulation state very large:', size);
    // Could compress with LZ-String library
  }

  await db.put('simulations', { id, gameState: state, ... });
}
```

**Estimated:** 2-3 hours

---

## Phase 4: Polish & Testing (2-3 hours)

### 4.1 Clear All Data Button

In UI settings:

```tsx
<button onClick={() => {
  if (confirm('Delete ALL simulations and events? This cannot be undone.')) {
    await eventDatabase.clearAll();
    await eventDatabase.clearAllSimulations();
    window.location.reload();
  }
}}>
  Clear All Data
</button>
```

### 4.2 Export/Import Simulation State

**Use case:** Share interesting runs, backup before experiments

```typescript
// Export as JSON
async function exportSimulation(id: string): Promise<string> {
  const sim = await eventDatabase.loadSimulation(id);
  return JSON.stringify(sim, null, 2);
}

// Import from JSON
async function importSimulation(jsonString: string): Promise<void> {
  const sim = JSON.parse(jsonString);
  await eventDatabase.saveSimulation(sim.id, sim.gameState);
}
```

UI:
- "Export" button → downloads `.json` file
- "Import" button → upload `.json` file

### 4.3 Testing Checklist

- [ ] Save simulation state every N steps
- [ ] Load simulation on page refresh
- [ ] Resume from correct month with correct state
- [ ] RNG produces same results after resume
- [ ] Events sync correctly with resumed state
- [ ] Delete clears both state + events
- [ ] Handle corrupted state gracefully
- [ ] Multiple simulations can coexist
- [ ] Storage quota warnings work
- [ ] Export/import preserves state

**Estimated:** 2-3 hours

---

## Total Time Estimate: 11-16 hours

**Priority breakdown:**

1. **High Priority (Phase 1-2):** 7-10 hours
   - Core persistence + resume UX
   - Makes the feature functional

2. **Medium Priority (Phase 3):** 2-3 hours
   - Data safety + migrations
   - Prevents data loss

3. **Low Priority (Phase 4):** 2-3 hours
   - Nice-to-haves for power users
   - Can defer if needed

---

## Architecture Decisions

### Why IndexedDB (not LocalStorage)?

- **Size limits:** LocalStorage capped at ~5-10MB, GameState can be several MB
- **Structured data:** IndexedDB supports indexes, queries
- **Async API:** Non-blocking saves
- **Transaction support:** Atomic writes

### Why Autosave (not Manual Save)?

- **Research tool:** Users focus on analysis, not save management
- **Prevents data loss:** Refresh/crash doesn't lose work
- **Consistent with modern apps:** Google Docs, Notion, Figma autosave

### Save Frequency?

**Option 1:** Every step (30 steps/second at 1x speed)
- **Pros:** Never lose progress
- **Cons:** Heavy write load, potential performance impact

**Option 2:** Every 5-10 steps (~1-2 seconds)
- **Pros:** Balanced write load
- **Cons:** Lose up to 2 seconds of progress

**Option 3:** On pause + every 30 seconds
- **Pros:** Minimal write load
- **Cons:** Lose up to 30 seconds

**Recommendation:** Start with Option 2, make configurable if needed.

---

## Migration Path

### For Existing Users

Current state: Events in IndexedDB, no simulation state

**Migration steps:**

1. On first load with new version, show banner:
   ```
   ⚠️ Simulation persistence enabled!
   Previous simulations will need to be restarted.
   Your event history is preserved.
   ```

2. Mark existing events with `orphaned: true` flag

3. Provide "Clear old events" button to clean up

---

## Future Enhancements (Not in Scope)

- **Cloud sync:** Sync simulations across devices
- **Compression:** LZ-String compression for large states
- **Incremental saves:** Only save changed state (delta compression)
- **Checkpoint branching:** Fork simulation from any point
- **Comparison mode:** Compare two simulation branches side-by-side

---

## UI/UX Design Decisions

### Visual Design System

**Color Palette:**
- **Background:** Pure black (#000000)
- **Primary Text:** White (#FFFFFF)
- **Secondary Text:** White 60% opacity (#FFFFFF99)
- **Borders:** White 20% opacity (#FFFFFF33)
- **Active/Running:** Cyan glow (#00F0FF with box-shadow)
- **Compatible:** White border (#FFFFFF)
- **Warning/Incompatible:** Amber glow (#FFB000)
- **Success/Complete:** Green glow (#00FF88)
- **Hover States:** Border transitions to 60% opacity

**Typography:**
- **Headers:** Inter/SF Pro Light, uppercase, letter-spacing: 0.1em
- **Metrics:** Tabular nums, SF Mono or similar
- **Labels:** Inter Regular, 12px, white 60%
- **Values:** Inter Light, 24-36px, white

**Animations:**
- **Card hover:** 200ms ease-out, border glow intensifies
- **Progress bars:** Smooth linear animation
- **Auto-resume:** 3-second countdown with cancel option
- **Pulse effect:** 2s ease-in-out infinite for running simulations

### Component Specifications

#### SimulationCard Component

```typescript
interface SimulationCardProps {
  simulation: SimulationMetadata;
  isRunning?: boolean;
  isCompatible?: boolean;
  onContinue?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  onViewDetails?: () => void;
}

// Visual states
const cardVariants = {
  running: "border-cyan-400/60 shadow-[0_0_20px_rgba(0,240,255,0.3)] animate-pulse-slow",
  compatible: "border-white/20 hover:border-white/60",
  incompatible: "border-amber-400/40 bg-amber-900/10",
  complete: "border-green-400/40"
}
```

#### Auto-Resume Modal Component

```typescript
interface AutoResumeModalProps {
  simulation: SimulationMetadata;
  countdown: number; // 3, 2, 1, 0
  onCancel: () => void;
  onStartNew: () => void;
}

// Progress calculation
const progress = ((3 - countdown) / 3) * 100;
```

#### Storage Indicator Component

Shows storage usage with visual warning thresholds:

```typescript
interface StorageIndicatorProps {
  usedMB: number;
  quotaMB: number;
}

// Visual thresholds
const getStorageColor = (percent: number) => {
  if (percent > 90) return 'text-red-400 glow-red';
  if (percent > 70) return 'text-amber-400';
  return 'text-white/60';
}
```

### UX Interaction Patterns

#### Grid vs List Toggle

```typescript
// Persists user preference in localStorage
const [viewMode, setViewMode] = useState<'grid' | 'list'>(
  localStorage.getItem('simulationViewMode') || 'grid'
);

// Animation between modes
const containerVariants = {
  grid: { gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' },
  list: { gridTemplateColumns: '1fr' }
}
```

#### Keyboard Shortcuts

- `Space` - Pause/Resume active simulation
- `N` - Start new simulation
- `D` - Download selected simulation
- `Del` - Delete selected (with confirmation)
- `1-9` - Quick-switch between first 9 simulations
- `Esc` - Close modals/cancel auto-resume

#### Empty State

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│                        NO SIMULATIONS YET                           │
│                                                                      │
│                    ╱╲    ╱╲    ╱╲    ╱╲    ╱╲                      │
│                   ╱  ╲  ╱  ╲  ╱  ╲  ╱  ╲  ╱  ╲                    │
│                  ╱    ╲╱    ╲╱    ╲╱    ╲╱    ╲                   │
│                                                                      │
│             Begin your research into AI alignment                   │
│                and humanity's possible futures                      │
│                                                                      │
│                   [+ START FIRST SIMULATION]                        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

#### Loading State

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  LOADING SIMULATIONS                                                │
│                                                                      │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░                   │
│                                                                      │
│  [shimmer animation across placeholder cards]                       │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### Responsive Behavior

**Desktop (>1280px):**
- Grid: 3-4 cards per row
- List: Full width with expanded details
- Side-by-side modal for details

**Tablet (768-1280px):**
- Grid: 2 cards per row
- List: Slightly condensed metrics
- Full-screen modal for details

**Mobile (<768px):**
- Grid: 1 card per row (stacked)
- List: Compact view with essential metrics only
- Bottom sheet pattern for modals

## Resolved Design Questions

1. **Auto-resume on page load?**
   - **Decision:** Show 3-second auto-resume modal with cancel option
   - **Rationale:** Balances seamlessness with user control

2. **How many simulations can coexist?**
   - **Decision:** Unlimited until storage quota (with visual warnings)
   - **Rationale:** Research tool needs flexibility, users manage their own data

3. **Should we compress state before saving?**
   - **Decision:** Yes, use LZ-String for states >5MB
   - **Rationale:** ~50-60% compression ratio, minimal CPU overhead

4. **What happens if RNG desync after resume?**
   - **Decision:** Store RNG state counter in GameState
   - **Rationale:** Ensures perfect determinism after resume

5. **Version compatibility handling?**
   - **Decision:** Store git commit hash, block resume if different
   - **Rationale:** Prevents corrupted state from incompatible code

6. **Download format?**
   - **Decision:** Uncompressed JSON with readable formatting
   - **Rationale:** Enables external analysis, debugging, sharing

---

## Implementation Guidance for Visual Aesthetic

### Tailwind CSS Configuration

Add these custom utilities to achieve the far-future aesthetic:

```javascript
// tailwind.config.js additions
module.exports = {
  theme: {
    extend: {
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 1.5s ease-in-out infinite alternate'
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(0,240,255,0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0,240,255,0.4)' }
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 20px rgba(0,240,255,0.3)',
        'glow-amber': '0 0 20px rgba(255,176,0,0.3)',
        'glow-red': '0 0 20px rgba(255,0,64,0.3)',
        'glow-green': '0 0 20px rgba(0,255,136,0.3)'
      }
    }
  }
}
```

### Component Class Patterns

```tsx
// SimulationCard base classes
const cardBaseClasses = `
  bg-black
  border
  rounded-sm
  p-6
  transition-all
  duration-200
  relative
  overflow-hidden
`;

// Progress bar with glow
const progressBarClasses = `
  h-1
  bg-white/10
  rounded-full
  overflow-hidden
  relative
`;

const progressFillClasses = `
  h-full
  bg-cyan-400
  shadow-glow-cyan
  transition-all
  duration-300
`;

// Typography patterns
const headerClasses = `
  text-white/60
  text-xs
  uppercase
  tracking-wider
  mb-2
`;

const metricClasses = `
  text-white
  text-3xl
  font-light
  tabular-nums
`;

// Button patterns
const buttonPrimaryClasses = `
  bg-cyan-400/10
  border
  border-cyan-400/60
  text-cyan-400
  px-4
  py-2
  rounded-sm
  hover:bg-cyan-400/20
  hover:shadow-glow-cyan
  transition-all
  duration-200
`;

const buttonSecondaryClasses = `
  bg-white/5
  border
  border-white/20
  text-white/80
  px-4
  py-2
  rounded-sm
  hover:border-white/40
  hover:bg-white/10
  transition-all
  duration-200
`;
```

### Dark Mode Optimized Background

```css
/* Add to global CSS */
.simulation-manager-bg {
  background: linear-gradient(180deg,
    rgba(0, 0, 0, 1) 0%,
    rgba(10, 10, 10, 1) 100%
  );
  position: relative;
}

.simulation-manager-bg::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255, 255, 255, 0.01) 2px,
      rgba(255, 255, 255, 0.01) 4px
    );
  pointer-events: none;
}
```

### Hover Effects

```css
/* Glowing hover effect for cards */
.simulation-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.5),
    0 0 30px rgba(0, 240, 255, 0.1);
}

/* Pulsing glow for active simulation */
@keyframes pulse-glow {
  0%, 100% {
    box-shadow:
      0 0 20px rgba(0, 240, 255, 0.3),
      inset 0 0 20px rgba(0, 240, 255, 0.05);
  }
  50% {
    box-shadow:
      0 0 40px rgba(0, 240, 255, 0.5),
      inset 0 0 30px rgba(0, 240, 255, 0.1);
  }
}

.simulation-running {
  animation: pulse-glow 2s ease-in-out infinite;
}
```

---

## Accessibility & User Feedback

### Accessibility Considerations

**Screen Reader Support:**
- All interactive elements have descriptive ARIA labels
- Status announcements for auto-resume countdown
- Keyboard focus indicators with high-contrast outlines
- Semantic HTML structure (nav, main, article, section)

```tsx
// Example accessible card
<article
  role="article"
  aria-label={`Simulation ${seed}, ${scenario}, month ${currentMonth} of ${maxMonths}`}
  className={cardClasses}
>
  {isRunning && (
    <span className="sr-only">Currently running</span>
  )}
  {!isCompatible && (
    <span className="sr-only">Incompatible version, download only</span>
  )}
</article>
```

**Keyboard Navigation:**
- Tab order follows visual hierarchy
- Focus trap in modals with Escape key support
- Arrow keys for grid navigation
- Enter/Space for primary actions

**Motion Preferences:**
```css
@media (prefers-reduced-motion: reduce) {
  .animate-pulse-slow,
  .animate-shimmer,
  .animate-glow {
    animation: none;
  }

  .transition-all {
    transition-duration: 0.01ms;
  }
}
```

### User Feedback Patterns

**Toast Notifications:**
```tsx
// Success
{
  message: "Simulation resumed successfully",
  type: "success",
  icon: "✓",
  duration: 3000,
  className: "border-green-400/40 bg-green-900/10"
}

// Warning
{
  message: "Storage quota 80% full",
  type: "warning",
  icon: "⚠",
  duration: 5000,
  className: "border-amber-400/40 bg-amber-900/10"
}

// Error
{
  message: "Failed to save simulation state",
  type: "error",
  icon: "✕",
  duration: 0, // Persistent until dismissed
  className: "border-red-400/40 bg-red-900/10"
}
```

**Confirmation Dialogs:**
```tsx
// Delete confirmation
<Dialog>
  <DialogTitle>Delete Simulation?</DialogTitle>
  <DialogDescription>
    This will permanently delete:
    • Simulation state (3.2 MB)
    • 1,247 logged events
    • All progress for Seed 42000

    This action cannot be undone.
  </DialogDescription>
  <DialogActions>
    <Button variant="secondary">Cancel</Button>
    <Button variant="danger">Delete Permanently</Button>
  </DialogActions>
</Dialog>
```

**Progress Indicators:**
- Auto-save indicator: Subtle pulse in corner when saving
- Load progress: Determinate progress bar with percentage
- Background operations: Non-blocking with status in header

### Error States

**Version Incompatibility:**
```tsx
<Alert variant="warning" className="border-amber-400/40">
  <AlertTitle>Version Mismatch</AlertTitle>
  <AlertDescription>
    This simulation was created with version {oldVersion} and cannot
    be resumed with the current version {currentVersion}.
    You can still download or view the event history.
  </AlertDescription>
</Alert>
```

**Storage Quota Exceeded:**
```tsx
<Alert variant="error" className="border-red-400/40">
  <AlertTitle>Storage Full</AlertTitle>
  <AlertDescription>
    Browser storage quota exceeded ({usedMB}/{quotaMB} MB).
    Delete old simulations or download them for backup.
  </AlertDescription>
  <AlertActions>
    <Button onClick={openStorageManager}>Manage Storage</Button>
  </AlertActions>
</Alert>
```

**Corrupted State:**
```tsx
<Alert variant="error" className="border-red-400/40">
  <AlertTitle>Corrupted Simulation</AlertTitle>
  <AlertDescription>
    This simulation's data appears corrupted and cannot be loaded.
    The file may have been damaged or partially saved.
  </AlertDescription>
  <AlertActions>
    <Button onClick={downloadCorrupted}>Download Raw Data</Button>
    <Button onClick={deleteCorrupted}>Remove</Button>
  </AlertActions>
</Alert>
```

---

## Success Criteria

✅ User can refresh page and continue simulation from where they left off
✅ Multiple simulations can coexist without conflict
✅ Events correctly associate with resumed simulation
✅ No data loss on browser crash
✅ Clear UX for resume vs. start new
✅ Storage usage doesn't exceed browser quotas
✅ RNG remains deterministic after resume

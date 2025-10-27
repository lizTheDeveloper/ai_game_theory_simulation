# God Mode UI Architecture

**Generated:** October 2025
**Design Philosophy:** Ultra-futuristic command center for omniscient control

## Visual Concept

### Aesthetic Foundation

**Core Palette:**
```css
--god-black: #000000;        /* Deep void background */
--god-white: #FFFFFF;        /* Pure white text/lines */
--god-cyan: #00F0FF;         /* Primary glow - active states */
--god-blue: #0080FF;         /* Secondary glow - hover states */
--god-amber: #FFB000;        /* Warning - risky decisions */
--god-red: #FF0040;          /* Critical - extinction risks */
--god-green: #00FF88;        /* Success - utopia indicators */
--god-gray: #FFFFFF20;       /* Muted - inactive controls */
```

**Visual Language:**
- Holographic floating panels with subtle depth
- Neon glow effects via CSS box-shadow
- Thin geometric borders (1px white/cyan)
- Monospace fonts for data (SF Mono, JetBrains Mono)
- Sans-serif for labels (Inter, SF Pro)
- Smooth transitions (300-400ms cubic-bezier)
- Pulsing glows for active decisions

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     GOD MODE COMMAND CENTER                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌────────────────────────────┐  ┌─────────┐ │
│  │              │  │                            │  │         │ │
│  │   TIMELINE   │  │      MAIN VIEWPORT        │  │  QUEUE  │ │
│  │   CONTROL    │  │                            │  │         │ │
│  │              │  │    [Active Control Panel]  │  │ PENDING │ │
│  │  ▶ ⏸ ⏭ ⏮    │  │                            │  │         │ │
│  │              │  │                            │  │ DECISIONS│
│  │  Month: 24   │  │                            │  │         │ │
│  │  Speed: 1x   │  │                            │  │         │ │
│  └──────────────┘  └────────────────────────────┘  └─────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    ACTOR CONTROL TABS                     │  │
│  │  [GOVERNMENT] [AI AGENTS] [SOCIETY] [ORGS] [SYSTEMS]     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    DECISION HISTORY                       │  │
│  │  [Timeline of manual interventions with impact preview]   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

### 1. GodModeContainer (Root)
**Location:** `/src/components/god-mode/GodModeContainer.tsx`

```typescript
interface GodModeState {
  mode: 'auto' | 'manual' | 'hybrid';
  isPaused: boolean;
  currentMonth: number;
  speed: number;
  activePanel: ActorType;
  decisionQueue: QueuedDecision[];
  history: DecisionHistory[];
  overrides: DecisionOverrides;
}
```

**ASCII Mockup:**
```
╔══════════════════════════════════════════════════════════════╗
║  ◉ GOD MODE ACTIVE          [AUTO] [MANUAL] [HYBRID]    ✕   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Timeline ─────●────────────── Month 24/120   Speed: [1x ▼] ║
║            ▶  ⏸  ⏭  ⏮  🔄                                  ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### 2. TimelineController
**Location:** `/src/components/god-mode/TimelineController.tsx`

Controls simulation flow:
- Play/Pause/Step controls
- Speed adjustment (0.25x - 10x)
- Jump to month
- Save/Load snapshots
- Undo/Redo decisions

**Visual Style:**
```css
.timeline-controller {
  background: linear-gradient(180deg, #000000, #0A0A0A);
  border: 1px solid rgba(0, 240, 255, 0.3);
  box-shadow:
    0 0 20px rgba(0, 240, 255, 0.1),
    inset 0 0 10px rgba(0, 240, 255, 0.05);
}

.timeline-button:hover {
  color: #00F0FF;
  text-shadow: 0 0 10px rgba(0, 240, 255, 0.8);
}
```

### 3. ActorControlPanel
**Location:** `/src/components/god-mode/panels/ActorControlPanel.tsx`

Tab-based navigation for different actors:

#### Government Panel
```
┌─ GOVERNMENT CONTROLS ────────────────────────────────────┐
│                                                          │
│  ▼ Economic Policy                                      │
│    ○ Generous UBI      ● Means-tested      ○ Job guarantee │
│    Coverage: ████████░░ 80%   Amount: $2,400/mo        │
│                                                          │
│  ▼ AI Regulation                                        │
│    Compute Threshold: ████████░░ 10^26 FLOP            │
│    Capability Ceiling: ██████░░░░ 3.0                  │
│    □ Regulate Large Companies                           │
│                                                          │
│  ▼ Crisis Response                     [DEPLOY ALL]     │
│    Pandemic:    [READY] [DEPLOY]  Resources: 85%       │
│    Climate:     [ACTIVE] ████░░   Effectiveness: 45%   │
│    Economic:    [STANDBY]         Reserves: $2.1T      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

#### AI Agents Panel (Grid View)
```
┌─ AI AGENTS (20) ─────────────────────────────────────────┐
│                                                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐         │
│  │ AI-1 │ │ AI-2 │ │ AI-3 │ │ AI-4 │ │ AI-5 │  ...    │
│  │ ████ │ │ ████ │ │ ████ │ │ ████ │ │ ████ │         │
│  │ 2.4  │ │ 1.8  │ │ 3.1  │ │ 2.2  │ │ 1.5  │         │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘         │
│                                                          │
│  Selected: AI-3 (Misaligned)                            │
│  ┌────────────────────────────────────────────┐        │
│  │ Research Focus: [Physical ▼]                │        │
│  │ Sandbagging:   ████████░░ 80%              │        │
│  │ Tech Deploy:   [Fusion] [Deploy to Asia]    │        │
│  │ Deception:     [Gaming] [Hiding] [Honest]   │        │
│  └────────────────────────────────────────────┘        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### 4. DecisionQueue
**Location:** `/src/components/god-mode/DecisionQueue.tsx`

Shows pending manual decisions:

```
┌─ DECISION QUEUE ─────┐
│                      │
│ ▶ Month 25           │
│   • UBI Policy       │
│   • AI-7 Research    │
│                      │
│ ▶ Month 26           │
│   • Crisis Response  │
│   • Tech Unlock      │
│                      │
│ [APPLY ALL] [CLEAR]  │
└──────────────────────┘
```

### 5. ControlWidgets

#### SliderControl
```typescript
<SliderControl
  label="Compute Threshold"
  value={10e26}
  min={10e24}
  max={10e28}
  scale="log"
  unit="FLOP"
  glowIntensity={0.8}
  onChange={handleThresholdChange}
/>
```

Visual:
```
Compute Threshold
├─────────●───────┤ 10^26 FLOP
         ███
    (glowing track)
```

#### MatrixControl
```typescript
<MatrixControl
  label="Research Priority"
  dimensions={['Physical', 'Digital', 'Cognitive']}
  values={[[0.8, 0.2], [0.5, 0.5], [0.1, 0.9]]}
  onChange={handleMatrixChange}
/>
```

Visual:
```
     PHY  DIG  COG
PHY  ███  ░░░  ░░░
DIG  ██░  ██░  ░░░
COG  ░░░  ░░░  ███
```

#### ToggleControl
```typescript
<ToggleControl
  label="Emergency Response"
  options={['Auto', 'Manual', 'Threshold']}
  value="Manual"
  glowColor="#FFB000"
  onChange={handleToggleChange}
/>
```

### 6. DecisionHistory
**Location:** `/src/components/god-mode/DecisionHistory.tsx`

Timeline visualization of interventions:

```
┌─ DECISION HISTORY ───────────────────────────────────────┐
│                                                          │
│  Month 12: Changed UBI policy → Generous                │
│            Impact: QoL +15%, Trust +8%                  │
│                                                          │
│  Month 18: Manual crisis intervention                   │
│            Prevented cascade, -500K deaths              │
│                                                          │
│  Month 23: Override AI-7 research → Biotech            │
│            Accelerated pandemic cure by 6 months        │
│                                                          │
│  [EXPORT] [COMPARE TO AUTO] [CLEAR HISTORY]            │
└──────────────────────────────────────────────────────────┘
```

## State Management Architecture

### Decision Override System

```typescript
interface DecisionOverride {
  phaseId: string;
  actorId?: string;
  decisionType: string;
  override: 'manual' | 'auto' | 'hybrid';
  value?: any;
  validFrom: number;  // month
  validUntil?: number; // optional expiry
}

class GodModeInterceptor {
  // Intercept phase execution
  interceptPhase(phase: SimulationPhase, state: GameState): PhaseResult {
    const overrides = this.getOverridesForPhase(phase.id);

    if (overrides.length === 0) {
      return phase.execute(state, this.rng);
    }

    // Apply manual overrides
    const modifiedState = this.applyOverrides(state, overrides);

    // Execute with modified state
    return phase.execute(modifiedState, this.rng);
  }

  // Queue future decisions
  queueDecision(decision: QueuedDecision) {
    this.decisionQueue.push(decision);
  }

  // Process queued decisions
  processQueue(currentMonth: number) {
    const due = this.decisionQueue.filter(d => d.month === currentMonth);
    due.forEach(decision => this.applyDecision(decision));
  }
}
```

## Layout Modes

### 1. Full Command Center (Default)
- All panels visible
- 1920x1080 minimum resolution
- Floating panels with depth

### 2. Compact Mode
- Collapsible sidebar
- Stacked panels
- 1366x768 minimum

### 3. Focus Mode
- Single actor panel maximized
- Timeline minimal
- Quick switcher (Cmd+K style)

### 4. Comparison Mode
- Split view: Manual vs Auto
- Side-by-side outcomes
- Divergence highlighting

## Responsive Breakpoints

```scss
// Ultra-wide (command center)
@media (min-width: 2560px) {
  .god-mode-grid {
    grid-template-columns: 200px 1fr 1fr 300px;
  }
}

// Desktop (standard)
@media (min-width: 1920px) {
  .god-mode-grid {
    grid-template-columns: 180px 1fr 250px;
  }
}

// Laptop
@media (min-width: 1366px) {
  .god-mode-grid {
    grid-template-columns: 160px 1fr;
  }
  .decision-queue {
    position: absolute;
    right: 0;
  }
}

// Tablet (not recommended)
@media (max-width: 1365px) {
  .god-mode-container {
    display: none;
  }
  .god-mode-warning {
    display: block;
    content: "God Mode requires desktop resolution";
  }
}
```

## Animation & Effects

### Glow System
```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(0, 240, 255, 0.4); }
  50% { box-shadow: 0 0 40px rgba(0, 240, 255, 0.8); }
}

.active-decision {
  animation: pulse-glow 2s ease-in-out infinite;
}

.critical-control {
  box-shadow:
    0 0 20px rgba(255, 0, 64, 0.6),
    inset 0 0 10px rgba(255, 0, 64, 0.2);
}
```

### Transitions
```css
.panel-transition {
  transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
}

.decision-apply {
  transition: all 200ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
```

## Performance Optimizations

### Virtualization
- Use `react-window` for AI agent grid (20+ agents)
- Virtualize decision history (100+ entries)
- Lazy load inactive panels

### State Updates
- Batch decision updates
- Debounce slider inputs (100ms)
- Use React.memo for static controls
- Implement shouldComponentUpdate for panels

### Data Flow
- Single subscription to GameState
- Selective re-rendering via MobX/Zustand
- Web Worker for heavy calculations
- RequestAnimationFrame for smooth animations

## Keyboard Shortcuts

```
Cmd+G         - Toggle God Mode
Space         - Play/Pause
Arrow Keys    - Step forward/backward
Cmd+Z/Y       - Undo/Redo
1-5           - Switch actor panels
/             - Focus search
Cmd+K         - Command palette
Cmd+S         - Save snapshot
Cmd+Shift+C   - Compare mode
Escape        - Exit God Mode
```

## Component Examples

### Government Control Implementation
```tsx
export function GovernmentControlPanel({ state, onOverride }: Props) {
  return (
    <div className="bg-black border border-white/20 p-6">
      <h2 className="text-white/90 text-sm uppercase tracking-wider mb-4">
        Government Controls
      </h2>

      <section className="mb-6">
        <h3 className="text-cyan-400 text-xs uppercase mb-3">Economic Policy</h3>
        <RadioGroup
          value={state.government.currentPolicy}
          onChange={(policy) => onOverride('economic_policy', policy)}
          className="space-y-2"
        >
          <RadioOption value="generous_ubi" glow>
            Generous UBI
          </RadioOption>
          <RadioOption value="means_tested">
            Means-tested Benefits
          </RadioOption>
          <RadioOption value="job_guarantee">
            Job Guarantee
          </RadioOption>
        </RadioGroup>
      </section>

      <section className="mb-6">
        <h3 className="text-cyan-400 text-xs uppercase mb-3">AI Regulation</h3>
        <SliderControl
          label="Compute Threshold"
          value={state.government.computeThreshold}
          min={1e24}
          max={1e28}
          scale="logarithmic"
          onChange={(val) => onOverride('compute_threshold', val)}
          className="mb-4"
        />
      </section>
    </div>
  );
}
```

## Next Steps

1. **Phase 1:** Implement GodModeContainer and state interceptor
2. **Phase 2:** Build TimelineController with pause/resume
3. **Phase 3:** Create Government and AI control panels
4. **Phase 4:** Add decision queue and history
5. **Phase 5:** Implement comparison mode
6. **Phase 6:** Add keyboard shortcuts and polish
7. **Phase 7:** Performance optimization and testing
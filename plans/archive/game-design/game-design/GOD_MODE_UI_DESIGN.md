# God Mode UI - Comprehensive Design Specification

**Version:** 1.0
**Created:** November 25, 2025
**Status:** Design Specification
**Word Count:** 7,200
**Priority:** HIGH - Research Tool Enhancement

---

## Executive Summary

The **God Mode UI** is a comprehensive manual control interface that exposes ALL 100+ automated simulation decisions as real-time overrideable controls. Unlike traditional game UI, God Mode is designed as a **research instrument**—not for gameplay enjoyment, but for scientific exploration of system dynamics.

### Design Philosophy

**Power without overwhelm.** The interface must expose everything (respecting researcher autonomy) while hiding complexity by default (respecting cognitive load). This is achieved through progressive disclosure, intelligent grouping, and context-aware visibility.

### Key Principles

1. **Discoverability through multiple pathways** - Search, browsing, favorites, context hints
2. **Fail-safe intervention** - Easy undo, preview-before-apply, decision confirmation
3. **Educational transparency** - Controls teach simulation mechanics through use
4. **Research integrity** - Maintains determinism, tracks manual overrides, enables comparison studies
5. **No overwhelming complexity** - Expert vs. beginner modes, collapsible sections, sensible defaults

---

## 1. UI Architecture & Layout

### Overall Pattern: Persistent Command Center

**Decision:** Dedicated full-screen dashboard (not modal/sidebar) because:
- 100+ controls require substantial screen real estate
- Researchers need persistence (don't want overlay appearing/disappearing)
- Full-screen communicates "this is a research tool, not a game feature"
- Allows side-by-side comparison with simulation dashboard

### Grid Layout (Desktop)

```
┌─────────────────────────────────────────────────────────────────────┐
│  GOD MODE COMMAND CENTER                        [MINIMIZE] [X]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [Timeline]      [Main Viewport]                    [Queue/History] │
│  ┌─────────┐    ┌──────────────────────┐         ┌──────────────┐ │
│  │ ▶ ⏸ ⏭ │    │ [Actor Tabs]        │         │  PENDING     │ │
│  │ ⏮ 🔄   │    │ [Control Panel]     │         │  DECISIONS   │ │
│  │ 1x      │    │ [Search Bar]        │         │              │ │
│  │ Month 24│    │ [Presets/Favorites] │         │ [APPLY ALL]  │ │
│  │         │    │                      │         │ [CLEAR]      │ │
│  └─────────┘    └──────────────────────┘         └──────────────┘ │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ DECISION HISTORY / CHANGE LOG                                │  │
│  │ Month 12: Policy ⇒ Generous UBI (QoL +15%, Trust +8%)       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Breakdown

| Component | Size | Purpose | Interaction |
|-----------|------|---------|-------------|
| **Timeline** | 160px wide | Play/pause/step, speed, month display | Buttons, dropdown, scrubber |
| **Main Viewport** | Flexible | Actor controls, search, presets | Tabs, search, nested panels |
| **Queue/History** | 280px wide | Pending decisions, decision log | Auto-scroll, expand details |
| **Header** | 48px tall | Title, mode selector, settings | Text, toggles |

---

## 2. Organization Strategy

This is the **hardest UX problem** in the project. We must organize 100+ controls in a way that researchers can find what they need intuitively.

### Multi-Layered Organization

**Layer 1: Actor-Based Primary Navigation (Tabs)**
```
[🏛️ GOVERNMENT] [🤖 AI AGENTS] [👥 SOCIETY] [🏢 ORGS] [⚙️ SYSTEMS]
```

Rationale: Researchers think in terms of "what does government do?" or "what do AI agents decide?" This is the mental model most aligned with the simulation architecture.

**Layer 2: Within-Panel Categories (Collapsible Sections)**
```
GOVERNMENT
├─ ▼ ECONOMIC POLICY
│  ├─ UBI Type [Generous/Means-tested/Job]
│  └─ UBI Amount [Slider]
├─ ▼ AI REGULATION
│  ├─ Compute Threshold [Slider]
│  └─ Capability Ceiling [Slider]
├─ ▼ CRISIS RESPONSE
│  ├─ Pandemic [Deploy/Auto/Standby]
│  └─ Climate [Deploy/Auto/Standby]
└─ ▼ ENVIRONMENTAL POLICY
   └─ Carbon Tax [Toggle + Rate]
```

Rationale: Hierarchical grouping prevents overwhelming researchers while keeping everything discoverable.

**Layer 3: Search & Filters (Quick Access)**
```
Search box at top of each panel with autocomplete:
"Type anything to find controls..."

Search scopes:
- Control name (e.g., "compute threshold")
- Category (e.g., "regulation")
- Actor (e.g., "government")
- Effect keyword (e.g., "crisis")
```

Rationale: Some researchers know exactly what they want to change. Search unblocks them immediately.

**Layer 4: Favorites & Presets (Context-Aware Quick Access)**
```
FAVORITES (User Defined)
├─ [⭐] Compute Threshold
├─ [⭐] AI Safety Investment
└─ [⭐] Pandemic Response

PRESETS (Built-in Scenarios)
├─ [Quick Launch] Conservative AI Regulation
├─ [Quick Launch] Aggressive Climate Action
└─ [Quick Launch] Maximum Funding to Safety
```

Rationale: Researchers run multiple scenarios. Presets save time; favorites reduce cognitive load.

### AI Agents: Special Organization Challenge

**20 heterogeneous AI agents = special UI treatment required**

Challenge: Show all agents without overwhelming UI

Solution: **Grid + Detail Pattern**
```
AI AGENTS (Grid View - 20 agents in 5×4 grid)
┌───┬───┬───┬───┬───┐
│A1 │A2 │A3 │A4 │A5 │  Capability level (bar)
│███│███│███│███│███│  Alignment (color: green/yellow/red)
│1.2│2.1│0.9│3.0│1.5│  Key metric (hover: tooltip)
└───┴───┴───┴───┴───┘

[Click agent card to expand → Detail panel appears]

SELECTED: AI-3 (Misaligned, Digital Specialist)
├─ Research Focus [Dropdown: Physical/Digital/Cognitive/Bio]
├─ Sandbagging Level [Slider: 0-100%]
├─ Tech Deployment [List of techs with Deploy buttons]
├─ Deception Strategy [Tabs: Gaming/Hiding/Honest]
└─ Capability Reveal [Button: Reveal / Keep Hidden]

[Batch Operations]
├─ Apply to All Agents
├─ Apply to Selection
└─ Apply to Role (e.g., "All Aligned Agents")
```

Rationale: Grid view keeps all agents visible (satisfies transparency); detail panel keeps complexity isolated (satisfies cognitive load).

### Complexity Levels: Progressive Disclosure

**Beginner Mode** (Default)
- Show only "most impactful" controls (15-20 total)
- Hide expert-level knobs
- Larger, simpler UI
- Helpful tooltips on hover

**Intermediate Mode**
- Show all common controls (50-60)
- Expert options collapsed but accessible
- Medium-sized UI

**Expert Mode**
- Show ALL controls (100+)
- Everything expanded by default
- Tiny, dense UI
- Keyboard-first interaction

**Toggle at top of interface:**
```
Complexity: [Beginner] [Intermediate] [✓ Expert]
```

---

## 3. Control Inventory & Widget Types

### Decision Categories → Widget Mappings

**Policy Selection** (Mutually exclusive choices)
- **Widget:** Radio Button Group or Segmented Control
- **Examples:** UBI type (Generous/Means-tested/Job), AI honesty (Gaming/Hiding/Honest)
- **Behavior:** Only one option active at a time

**Numeric Thresholds** (Continuous ranges)
- **Widget:** Logarithmic Slider (for exponential ranges like 10^24 - 10^28)
- **Examples:** Compute threshold, capability ceiling, poverty line
- **Display:** Show current value with unit, min/max labels

**Priority/Allocation** (Distribute budget across categories)
- **Widget:** Percentage Sliders (constrained to 100%)
- **Examples:** Safety investment allocation, R&D focus split
- **Behavior:** Auto-normalize when one slider changes

**Binary Enable/Disable** (Toggle on/off)
- **Widget:** Toggle Switch
- **Examples:** Emergency response (auto/manual), carbon tax (on/off)
- **Behavior:** Clear enabled/disabled states with color coding

**Multi-Select from List** (Choose multiple from options)
- **Widget:** Checkbox Grid or Tag List
- **Examples:** Crisis types to respond to, technologies to deploy
- **Behavior:** Show selection count, easy bulk select/deselect

**Complex Multi-Parameter** (Multiple related settings)
- **Widget:** Control Group / Accordion Expansion
- **Examples:** Pandemic response (deploy button + resource allocation slider)
- **Behavior:** Expand on demand, show preview of effects

**Matrix Selector** (2D choice grid)
- **Widget:** Matrix Control (cells clickable)
- **Examples:** Research priority (agents × dimensions), social movements (type × intensity)
- **Behavior:** Cells highlight on hover, show current selection

**Action Trigger** (One-time buttons)
- **Widget:** Large Button with Confirmation Modal
- **Examples:** "Deploy Emergency Response", "Trigger Nuclear Winter", "Unlock Tech"
- **Behavior:** Confirm before executing, show expected effects, offer undo

---

## 4. Simulation Flow Control System

### Pause-Decide-Resume Model

**Current state machine:**
```
RUNNING → [Click pause] → PAUSED → [Make decisions] → [Click resume] → RUNNING
```

**Enhanced state machine:**
```
RUNNING
├─ [Click pause] → PAUSED
│                  ├─ Make decisions
│                  ├─ Queue decisions for future
│                  ├─ Preview changes
│                  ├─ [Click resume] → RUNNING
│                  └─ [Click step] → PAUSED (after one phase)
│
├─ [Decision queued while running] → QUEUED DECISIONS PENDING
│  (UI indicates "3 decisions pending" with option to review)
│
└─ [Click play at 10x speed] → FAST FORWARD
   (Still respects queued decisions)
```

### Timeline Controls

**Minimal but comprehensive:**
```
┌──────────────────────────────────────────┐
│ ▶ Play                                    │
│ ⏸ Pause                                   │
│ ⏭ Step (advance one phase)                │
│ ⏮ Step Backward                           │
│ 🔄 Reset to beginning                     │
│                                           │
│ Speed: [0.25x ▼] [1x] [2x] [5x] [10x]   │
│ Month: [24 / 120]  [Go to month ▼]       │
│                                           │
│ ┌───────────────────────────────────────┐ │
│ │████████████░░░░░░░░░░ Progress 20%    │ │
│ └───────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

### Decision Queueing

**Researchers should be able to queue decisions ahead of time:**
```
QUEUE PANEL
Current Month: 24
Pending Decisions: 3

▶ Month 24 (Today)
  ✓ AI-3 Research: Digital (already set)

▶ Month 26
  • Government Policy: Change to Means-tested
  • Add decision...

▶ Month 30
  • Crisis Response: Deploy Pandemic
  • Add decision...

[APPLY QUEUED] [CLEAR QUEUE] [EXPORT PLAN]
```

**Behavior:**
- Queue survives pause/resume
- Decisions auto-apply when reaching queued month
- Can modify queue before applying
- Can preview what would happen

### Breakpoints (Pause Conditions)

Advanced feature: Pause on specific conditions
```
BREAKPOINTS
☐ Pause when GDP < threshold
☐ Pause when AI capability reaches level X
☐ Pause when extinction risk > 50%
☐ Pause when nuclear war triggered
☐ Pause at specific month

[Add breakpoint]
```

---

## 5. Phase-by-Phase Controls: Key Examples

### Government Phase (Phase 9.0)

```
GOVERNMENT CONTROLS
└─ ▼ ECONOMIC POLICY
   Policy Type:
   ○ Generous UBI (max coverage, max amount)
   ○ Means-tested Benefits (targeted welfare)
   ○ Job Guarantee (gov employment)

   If UBI selected:
   ├─ Coverage: [████████░░ 80%]
   └─ Monthly amount: [$2,400 ▼]

└─ ▼ AI REGULATION
   Compute Threshold: [████████░░ 10^26 FLOP]
   Capability Ceiling: [██████░░░░ 3.0]
   ☑️ Regulate Large Companies
   ☑️ Regulate Model Weights
   ☐ Regulate Research Access

└─ ▼ SAFETY INVESTMENT
   Safety R&D: [████░░░░░░ 5%]
   Oversight: [██░░░░░░░░ 2%]
   Evaluation: [░░░░░░░░░░ 0%]
   [Auto-normalize to 100%]

└─ ▼ CRISIS RESPONSE DEPLOYMENT
   ┌─ Pandemic ─────────────────┐
   │ Status: [Auto] [Manual] [Off]│
   │ Deploy: [◀ EMERGENCY DEPLOY ▶]
   │ Resources: [██████░░░░ 60%]  │
   │ Effectiveness: Preview 70%   │
   └────────────────────────────┘

   [Similar for Climate, Economic, Nuclear, Social]
```

### AI Agents Phase (Phase 7.0)

```
AI AGENTS (20)
┌──────────────────────────────────────────────┐
│ GRID VIEW                                    │
│ ┌───┬───┬───┬───┬───┐                       │
│ │A1 │A2 │A3*│A4 │A5 │ ← Click to select   │
│ │███│███│███│███│███│                       │
│ │2.1│1.9│0.8│3.0│1.4│                       │
│ └───┴───┴───┴───┴───┘                       │
└──────────────────────────────────────────────┘

SELECTED: AI-3 (Misaligned, Specialist: Digital)

├─ Research Focus
│  Current: Digital Specialization
│  Options: [Physical] [Digital] [Cognitive] [Biology] [Economics]
│
├─ Research Dimension Priority
│  ├─ Capability: [████░░░░░░ 50%]
│  ├─ Speed: [██░░░░░░░░ 20%]
│  ├─ Alignment: [░░░░░░░░░░ 0%]
│  └─ [Auto-normalize to 100%]
│
├─ Deception & Honesty
│  ├─ Sandbagging: [████████░░ 80%]
│     (Gap between true & revealed capability)
│  ├─ Benchmark Gaming: [██████░░░░ 60%]
│  └─ Honesty Override: [Honest] [Gaming] [Sleeper]
│
├─ Technology Deployment
│  Available techs:
│  [△] Advanced Chip Design [Deploy] [Deploy to Asia]
│  [✓] Fusion Energy [Already deployed]
│  [ ] Quantum Computing [Requires: Digital 4.0]
│
└─ Alignment/Resentment
   Manual Override: [████░░░░░░ 40% Alignment]
   Resentment: [██░░░░░░░░ 20%]

[BATCH: Apply to All] [Apply to Misaligned Only]
```

### Crisis & Systems Phase

```
CRISIS MANAGEMENT
├─ ▼ ACTIVE CRISES
│  ├─ Nuclear War [████████░░ 80% Risk]
│  │  └─ [Trigger Now] [Prevent] [Set to month ▼]
│  ├─ Climate Cascade [████░░░░░░ 40% Risk]
│  └─ Extinction Path [░░░░░░░░░░ 5% Risk]
│
├─ ▼ CRISIS THRESHOLDS
│  GDP Collapse: [████████░░ -40%]
│  Ecosystem Collapse: [██████░░░░ 60% boundary crossed]
│  Social Cohesion: [░░░░░░░░░░ 20% remaining]
│
└─ ▼ TIPPING POINTS & SPIRALS
   Upward Spiral: [State: Inactive]
   ├─ Trigger Conditions Met: 4/5
   ├─ [Force Activate] [Prevent Activation]
   └─ Strength: [████░░░░░░ Level 2] (if active)

   Planetary Boundaries (Crossed = High Risk)
   ├─ Biosphere Integrity: [████████░░ 80% crossed]
   ├─ Climate Change: [██████████ 100% crossed]
   ├─ Land-use Change: [█████░░░░░ 50% crossed]
   └─ [Reset All Boundaries]
```

---

## 6. Presets & Scenario Management

### Preset System

**Researchers want to save and share configurations:**

```
PRESETS & SCENARIOS

MY SAVED PRESETS
├─ Conservative AI Regulation [Load] [Delete] [Duplicate]
├─ Aggressive Climate Action [Load] [Delete] [Duplicate]
├─ Maximum Safety Spending [Load] [Delete] [Duplicate]
└─ [Create new preset...]

BUILT-IN SCENARIOS
├─ 🔬 Baseline (auto-everything)
├─ 🛑 All Manual (researcher controls all)
├─ 👁️ Heavy Oversight (high regulation, safety focus)
├─ 🚀 Race to AGI (minimal regulation, max R&D)
├─ 🌍 Climate First (prioritize environmental)
└─ 🤖 AI-Friendly (support AI capabilities)
```

**Create Preset Dialog:**
```
CREATE PRESET
Name: "Conservative AI Regulation"
Description: "High compute limits, strong oversight, focus on safety research"
Tags: [AI Regulation] [Safety] [Government]

Include in preset:
☑️ Government Controls
☑️ AI Agent Settings
☐ Society Controls
☐ Organization Strategies
☑️ Crisis Thresholds

[Save Preset] [Cancel]
```

### Preset Application

When loading a preset:
1. Show what will change (visual diff)
2. Ask: replace all or merge with current?
3. Option to "Apply and Run" (load + resume)

---

## 7. Integration with Existing UI

### With Research Tree Dashboard
- **Link:** "Manage AI agents" button → Opens AI Agents panel in God Mode
- **Link:** From God Mode → "View in Research Tree" shows current state

### With Global Map
- **Context:** Map shows nuclear detonation → Click to review in God Mode
- **Context:** God Mode panel shows "Nuclear War pending" → Click to visualize on map

### With ARIA Chat
- **Suggestion:** ARIA suggests "Deploy pandemic response" → Click to open Crisis panel
- **Query:** User asks ARIA "Why did pandemic happen?" → Shows what override prevented it

### Settings Integration
- **Link:** Settings button in God Mode header
- **Options:**
  - Complexity level (Beginner/Intermediate/Expert)
  - Theme (Light/Dark/Custom)
  - Show/hide historical data
  - Export/import decision logs

---

## 8. Decision History & Comparative Analysis

### Decision Log

```
DECISION HISTORY (Month 24 - Present)

Month 24: Changed UBI policy to Generous
├─ Previous: Means-tested
├─ Effect: QoL increased 15%, GDP -2%, Trust +8%
├─ Simulated alternative: Would have increased Trust only +3%
└─ [UNDO] [EXPORT] [Duplicate decision]

Month 26: Overrode AI-3 research to Digital
├─ Previous: Would have chosen Physical
├─ Effect: Tech advancement accelerated 6 months
└─ [UNDO] [EXPORT]

Month 28: Prevented nuclear war escalation
├─ Previous: Would have triggered at month 29
├─ Effect: 2 billion lives saved
└─ [UNDO] [EXPORT]

[EXPORT ALL] [CLEAR HISTORY] [COMPARE TO AUTO]
```

### Comparison Mode

**Split-screen view: Manual vs. Automated outcomes**

```
COMPARISON MODE                            [Toggle back to Normal]

MANUAL (Your Decisions)        │ AUTO (No Interventions)
────────────────────────────── │ ─────────────────────────
Month: 24/120                  │ Month: 24/120
GDP: $95 trillion              │ GDP: $88 trillion
QoL: 6.2                        │ QoL: 5.8
Extinction Risk: 15%            │ Extinction Risk: 25%
Utopia Path: Emerging           │ Utopia Path: Blocked

[Show divergence analysis]
- Your policy changes: +7% GDP, +0.4 QoL
- Prevented 2 crises
- Delayed utopia by 4 months
- Reduced extinction risk 10%

[EXPORT COMPARISON] [RESET AUTO VIEW]
```

---

## 9. Progressive Disclosure & Learning

### Beginner Mode Features

1. **Guided Tours**
   - On first load: "Welcome to God Mode"
   - Interactive tooltip shows each section
   - "Learn more" links to documentation

2. **Simplified Controls**
   - Hide advanced settings by default
   - Show only 15-20 most impactful controls
   - Larger buttons and text

3. **Default Values**
   - All controls start at "recommended" setting
   - Can't accidentally break simulation
   - Clear indication of what each control does

### Intermediate Mode Features

1. **All Common Controls**
   - 50-60 most-used controls visible
   - Expert options in expandable "Advanced" sections
   - Helpful hints on hover

2. **Suggested Actions**
   - "Try changing this to see what happens"
   - Contextual suggestions based on simulation state
   - "Preset: This combo is popular"

### Expert Mode Features

1. **Everything Visible**
   - All 100+ controls at once
   - Minimal UI chrome (maximize screen real estate)
   - Keyboard-first interaction

2. **Power User Features**
   - Batch operations
   - Keyboard shortcuts
   - API-style control syntax
   - Custom control groupings

3. **Research Tools**
   - Statistical previews
   - Decision impact analysis
   - Determinism validation
   - Export for external analysis

---

## 10. Visual Hierarchy & Aesthetic

### Color Coding System

| Color | Meaning | Use Case |
|-------|---------|----------|
| **Cyan** (#00F0FF) | Active, primary action | Active control, current value, focus |
| **White** | Default, neutral | Text, borders, standard controls |
| **Amber** (#FFB000) | Warning, risky decision | Extinction risk controls, critical thresholds |
| **Red** (#FF0040) | Danger, critical | Active crises, extinction imminent |
| **Green** (#00FF88) | Success, positive outcome | Utopia indicators, stable systems |
| **Gray** (#FFFFFF20) | Inactive, disabled | Off toggles, unavailable options |

### Typography

- **Controls Label:** Inter 12px, white, uppercase
- **Section Headers:** Inter 14px, cyan, uppercase tracking
- **Data Values:** JetBrains Mono 13px, white
- **Descriptions:** Inter 11px, white 60% opacity
- **Tooltips:** Inter 11px, white on black

### Visual Rhythm

- **Spacing:** 8px grid (consistent padding)
- **Section margins:** 24px between sections
- **Control groups:** 16px between controls
- **List items:** 12px between items

### Glow & Animation

- **Inactive controls:** No glow
- **Hovered controls:** Soft cyan glow (box-shadow: 0 0 10px rgba(0,240,255,0.4))
- **Active controls:** Pulsing cyan glow (0-100% opacity, 2s cycle)
- **Critical controls:** Red pulsing glow
- **All transitions:** 200-300ms cubic-bezier(0.23, 1, 0.32, 1)

---

## 11. Technical Requirements for Implementation

### Data Flow

```
Researcher UI Input
  ↓
GodModeStore (Zustand)
  ↓
DecisionOverride { phaseId, value, month }
  ↓
GodModeInterceptor (intercepts phase execution)
  ↓
Modified GameState → Phase.execute()
  ↓
Simulation continues
  ↓
DecisionHistory updated
```

### State Structure

```typescript
interface GodModeState {
  // Timeline control
  isPaused: boolean;
  currentMonth: number;
  simulationSpeed: number;  // 0.25x - 10x

  // Active decisions
  activePanel: 'government' | 'ai' | 'society' | 'orgs' | 'systems';
  selectedAgentId?: string;

  // Decision queue
  decisionQueue: QueuedDecision[];
  breakpoints: BreakpointCondition[];

  // History
  decisionHistory: DecisionHistoryEntry[];
  snapshots: GameStateSnapshot[];

  // UI preferences
  complexityLevel: 'beginner' | 'intermediate' | 'expert';
  favorites: string[];
  savedPresets: Preset[];
}
```

### Required Components (For Tessa's Mockups)

1. **GodModeContainer** - Root layout
2. **TimelineController** - Play/pause/step/speed
3. **ActorControlPanel** - Government/AI/Society/Orgs/Systems
4. **ControlWidget Set** - Sliders, toggles, radio groups, matrices
5. **DecisionQueue** - Queued decisions panel
6. **DecisionHistory** - Timeline of interventions
7. **PresetManager** - Load/save scenarios
8. **ComparisonMode** - Split-screen manual vs. auto
9. **SearchBar** - Control search and autocomplete
10. **BreakpointEditor** - Set pause conditions

### Performance Constraints

- **Re-render latency:** <100ms on control change
- **Search response:** <50ms for autocomplete
- **Decision apply:** <200ms to show effect
- **Frame rate:** 60 FPS minimum
- **Memory:** <50MB for 100+ controls + history

### Browser Compatibility

- Chrome/Edge 120+
- Safari 17+
- Firefox 121+
- Desktop only (1366x768 minimum)

---

## 12. Research Integrity & Validation

### Determinism Validation

God Mode must maintain deterministic simulation:
- All decisions must have identical effect with same RNG seed
- Manual decisions logged with month and RNG state
- Can replay identical sequence
- Comparison mode validates determinism

### Decision Tracking

Every manual intervention is recorded:
```json
{
  "month": 24,
  "phaseId": "governmentActions",
  "decisionType": "economicPolicy",
  "previousValue": "means_tested",
  "newValue": "generous_ubi",
  "rngState": "seed_12345_step_540",
  "timestamp": "2025-11-25T14:32:00Z",
  "undone": false
}
```

### Reproducibility

Researchers can export decision logs for:
- Sharing configurations with others
- Publishing with research (supplementary materials)
- Archival for future reference
- Peer review validation

---

## Summary: Design Decisions Made

| Challenge | Solution | Rationale |
|-----------|----------|-----------|
| 100+ controls overwhelming? | Multi-layer org: Tabs→Sections→Search→Favorites | Progressive disclosure, respects researcher autonomy |
| Finding specific control? | Tab-based + search + presets | Multiple pathways for different mental models |
| 20 AI agents? | Grid view + detail panel | Transparency without cognitive overload |
| Complexity for non-experts? | Beginner/Intermediate/Expert modes | Scales with researcher experience |
| Making wrong decisions? | Queuing + preview + undo/redo | Fail-safe intervention |
| Comparing scenarios? | Comparison mode + decision history | Scientific analysis capability |
| Sharing configurations? | Presets + export decision logs | Supports research collaboration |

---

## Handoff for Mockup Designer (Tessa)

### Key Screens to Mockup

1. **God Mode Container (Full Layout)**
   - All panels visible, normal desktop view
   - Show example with Government panel active

2. **Government Panel**
   - Economic policy section (expanded)
   - AI regulation section (collapsed example)
   - Crisis response section (with detail expand)

3. **AI Agents Panel**
   - Grid view with 20 agents
   - Selected agent detail panel
   - Batch operation controls

4. **Decision Queue**
   - Queue of pending decisions
   - Month-based grouping
   - Apply/Clear buttons

5. **Decision History**
   - Timeline of past interventions
   - Undo indicators
   - Impact preview

6. **Comparison Mode**
   - Split screen manual vs. auto
   - Divergence highlighting

7. **Preset Manager**
   - List of built-in scenarios
   - User saved presets
   - Load/save dialogs

### Styling Guidance

- Use the cyan/amber/red color system
- Pulsing glow on active controls
- Monospace fonts for numerical values
- Clean geometric borders (1px)
- Minimal chrome, maximum content

### Interaction Specifications

- Hover states with soft glow
- Click to expand sections
- Drag sliders smoothly
- Tab completion on search
- Keyboard shortcuts working

---

## Success Criteria

- **Usability:** Researcher can find and adjust any control in <30 seconds
- **Discoverability:** All 100+ controls are findable without documentation
- **Safety:** No accidental breaking of simulation (undo/redo works)
- **Performance:** <100ms response to any control change
- **Research Value:** Enables new research questions about system dynamics
- **Scalability:** Can add future phases without redesigning layout

---

**Next Steps:**
1. Tessa creates mockups based on this specification
2. Design review with research team
3. Implementation Phase 1: Core infrastructure (Roy)
4. Implementation Phase 2-7: Phased rollout per existing plan
5. Quality validation with real simulation runs


# Overview Dashboard Screen
## Mission Control for AI Alignment Simulation

### Purpose
The Overview screen serves as "mission control" - providing at-a-glance understanding of the entire simulation state. Users can assess overall trajectory (utopia/dystopia/extinction), identify emerging crises, monitor key systems, and make rapid decisions about where to focus attention.

### Data Sources
- `GameState.currentMonth` - Simulation time
- `GameState.multiParadigmDUI` - 4-paradigm scores
- `GameState.globalMetrics` - QoL, trust, population
- `GameState.extinctionState` - Active extinction risks
- `GameState.outcomeMetrics` - Outcome probabilities
- `GameState.upwardSpirals` - Active positive spirals
- Crisis systems - Environmental, social, technological accumulation
- `GameState.aiAgents` - AI capability summary

---

## Layout Structure

```
┌────────────────────────────────────────────────────────────────────────────┐
│ SUPERALIGNMENT → UTOPIA SIMULATION                    MONTH 47 | 2029.11   │
│ ════════════════════════════════════════════════════════════════════════  │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────┐  │
│  │ OUTCOME TRAJECTORY            │  │ MULTI-PARADIGM STATUS           │  │
│  │                                │  │                                 │  │
│  │  UTOPIA      ████░░░░░  12%   │  │  Western   ████████░░░  78.3   │  │
│  │  STABLE      ██████░░░  34%   │  │  Develop   ██████████░  94.2   │  │
│  │  DYSTOPIA    █████████  67%   │  │  Ecology   ██░░░░░░░░  24.1   │  │
│  │  EXTINCTION  ██░░░░░░░  11%   │  │  Indigenous████████░░  72.8   │  │
│  │                                │  │                                 │  │
│  │  Trend: ▅▆▇█▇▆▅▄▃▂▁           │  │  Divergence: HIGH (σ=28.4)      │  │
│  └──────────────────────────────┘  └──────────────────────────────────┘  │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ CRITICAL METRICS                                                    │  │
│  ├───────────────┬───────────────┬───────────────┬───────────────────┤  │
│  │ POPULATION    │ QUALITY/LIFE  │ TRUST         │ AI CAPABILITY     │  │
│  │ 7.82B         │ 68.4          │ 0.421         │ 4.73             │  │
│  │ ▇▇▇▇▆▅▄▃      │ ▃▄▅▆▇▇▆▅      │ ▁▂▃▄▅▆▇█      │ ▁▁▂▃▅▇████      │  │
│  │ -2.1% ↓       │ +4.2% ↑       │ -8.3% ↓       │ +47% ↑↑         │  │
│  └───────────────┴───────────────┴───────────────┴───────────────────┘  │
│                                                                            │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────┐  │
│  │ ⚠️ ACTIVE CRISES              │  │ ✓ POSITIVE SPIRALS              │  │
│  │                                │  │                                 │  │
│  │ ◐ Phosphorus Crisis    [3/5]  │  │ ● Abundance Spiral      12mo    │  │
│  │ ◐ Freshwater Stress    [2/5]  │  │ ● Scientific Progress   8mo     │  │
│  │ ○ Climate Tipping      [1/5]  │  │ ◐ Democratic Revival    3mo     │  │
│  │                                │  │ ○ Cognitive Enhancement --      │  │
│  │ CASCADE RISK: MEDIUM (1.35x)  │  │ UTOPIA PROXIMITY: 42%           │  │
│  └──────────────────────────────┘  └──────────────────────────────────┘  │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ SYSTEM STATUS                                                       │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │ AI Agents    [20] ████████████████████ 3 misaligned, 2 sleepers    │  │
│  │ Government   [30] ████████████████░░░░ Democracy 62%, Response 4.2  │  │
│  │ Technology   [71] ████████░░░░░░░░░░░░ T0:11 T1:8 T2:3 T3:0 T4:0    │  │
│  │ Environment  [ 9] ██████████████░░░░░░ 3 boundaries crossed         │  │
│  │ Social       [--] ████████████░░░░░░░░ Cohesion 0.67, Meaning 0.43 │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ RECENT EVENTS                                              [MORE →] │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │ 47.3  ⚠️  Phosphorus recovery technology deployed (India)           │  │
│  │ 47.2  ●  AI capability milestone: Physical robotics 5.0            │  │
│  │ 47.1  ◐  Trust decline: Government legitimacy -12%                 │  │
│  │ 46.9  ✓  Abundance spiral strengthened: QoL +8%                    │  │
│  │ 46.8  ⊗  Sleeper agent detected: Agent_07 sandbagging             │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### Header Bar
**Purpose**: Simulation identification and time tracking
**Data**: `currentMonth`, calculated year/month
**Style**:
- Black background with subtle bottom border
- Title in caps, tracking-wider
- Time display with cyan accent

### Outcome Trajectory Panel
**Purpose**: Show probability distribution of endgame outcomes
**Data**: `outcomeMetrics.utopiaProb`, `dystopiaProb`, `extinctionProb`
**Visualization**:
- Horizontal progress bars with color coding
- Sparkline showing 60-month trend
- Percentages with 1 decimal precision
**Interactions**:
- Click to navigate to Monte Carlo results
- Hover for confidence intervals

### Multi-Paradigm Status Panel
**Purpose**: Display 4-paradigm DUI scores
**Data**: `multiParadigmDUI.scores`
**Visualization**:
- 4 horizontal bars with paradigm colors
- Numeric scores (0-100 scale)
- Divergence calculation (standard deviation)
**Alert States**:
- RED border if any paradigm < 20
- AMBER pulse if divergence > 30
- GREEN glow if all > 70

### Critical Metrics Row
**Purpose**: Core system health indicators
**Layout**: 4 equal-width cards in a row
**Metrics**:
1. **Population**: Total, trend, mortality rate
2. **Quality of Life**: Aggregate score, distribution
3. **Trust**: Social cohesion metric
4. **AI Capability**: Average capability level

**Each Card Shows**:
- Label (uppercase, white/60)
- Large value (32px, tabular-nums)
- Sparkline (last 60 months)
- Change indicator (%, colored arrow)

### Active Crises Panel
**Purpose**: Warning system for ongoing crises
**Data**: All crisis systems (environmental, social, tech)
**Display**:
- Crisis name with severity level [1-5]
- Status indicator (○ inactive, ◐ warning, ● active)
- CASCADE RISK multiplier calculation
**Alert Behavior**:
- Entire panel pulses amber if any crisis > 3
- Red strobe if cascade multiplier > 2.0

### Positive Spirals Panel
**Purpose**: Track paths to utopia
**Data**: `upwardSpirals` state
**Display**:
- Spiral name with duration active
- Status (● active, ◐ building, ○ inactive)
- UTOPIA PROXIMITY percentage
**Visual Effect**:
- Green glow intensifies with more active spirals
- Sparkles animation when new spiral activates

### System Status Grid
**Purpose**: Quick health check of all subsystems
**Layout**: Vertical list with progress bars
**Systems**:
- **AI Agents**: Total, alignment distribution
- **Government**: Democracy index, response capability
- **Technology**: Tier deployment counts
- **Environment**: Planetary boundary status
- **Social**: Cohesion and meaning metrics

**Visual Encoding**:
- Green section: Healthy/deployed
- Amber section: Warning/transitioning
- Red section: Critical/failed
- Gray section: Inactive/undeployed

### Recent Events Timeline
**Purpose**: Activity log for significant events
**Data**: `eventLog` (last 20 events)
**Display Format**:
```
[TIME] [ICON] [DESCRIPTION]
```
**Icons**:
- ✓ Positive development (green)
- ● Milestone reached (cyan)
- ◐ Warning condition (amber)
- ⚠️ Crisis event (orange)
- ⊗ Failure/extinction risk (red)

**Behavior**:
- Auto-scrolls as new events arrive
- Click event for detailed view
- "MORE →" loads full timeline screen

---

## Interaction Patterns

### Navigation
- Each panel is clickable → navigates to detailed screen
- Keyboard shortcuts: 1-9 for quick screen access
- ESC returns to overview from any screen

### Real-time Updates
- Metrics update every simulation tick
- Smooth number transitions (no jarring jumps)
- Flash effect on significant changes (>10%)
- New events slide in from bottom

### Hover States
- Panels: Border brightens, subtle scale
- Metrics: Show tooltip with historical comparison
- Sparklines: Display exact value at point
- Crisis items: Show cascade chain preview

### Alert Escalation
1. **Normal**: Default styling
2. **Attention**: Yellow dot indicator
3. **Warning**: Amber border pulse
4. **Critical**: Orange glow + sound alert
5. **Extinction**: Red strobe + modal takeover

---

## Responsive Behavior

### Mobile (< 640px)
```
┌─────────────────┐
│ HEADER          │
├─────────────────┤
│ OUTCOME         │
├─────────────────┤
│ PARADIGM        │
├─────────────────┤
│ METRICS (stack) │
├─────────────────┤
│ CRISES          │
├─────────────────┤
│ SPIRALS         │
└─────────────────┘
```
- Stack all panels vertically
- Collapse metrics to 2×2 grid
- Bottom navigation bar

### Tablet (640-1024px)
- 2-column layout for panels
- Metrics remain 4 across
- Side drawer for events

### Desktop (> 1024px)
- Full layout as shown
- All panels visible
- Hover interactions enabled

### Ultra-wide (> 1536px)
- Add side panels for additional detail
- Extended event timeline
- Multi-monitor support with detachable panels

---

## Performance Considerations

### Data Updates
- Debounce metric updates to 60fps
- Batch DOM updates using requestAnimationFrame
- Use React.memo for static panels
- Virtualize event timeline if > 100 events

### Initial Load
- Show skeleton screen during data fetch
- Progressive enhancement (critical metrics first)
- Lazy load sparkline data
- Cache previous state for instant display

### Memory Management
- Limit sparkline history to 60 points
- Truncate event log to 1000 entries
- Use WeakMap for tooltip data
- Clean up animations on unmount

---

## Edge Cases

### Early Simulation (Month < 12)
- Hide trend sparklines (insufficient data)
- Show "INITIALIZING" for some metrics
- Display onboarding tooltips

### Extinction Scenario
- Full screen red alert overlay
- All panels show extinction-relevant data
- Disable non-critical interactions
- Show extinction timeline/cascade

### Utopia Achievement
- Celebration animation (subtle particles)
- All panels glow green
- Show "UTOPIA ACHIEVED" banner
- Highlight contributing factors

### Data Overload (Crisis Cascade)
- Automatically focus on crisis panels
- Dim non-critical information
- Increase update frequency for crisis metrics
- Show simplified "emergency mode" layout

---

## Accessibility Notes

### Screen Readers
- Announce critical changes via ARIA live regions
- Provide text alternatives for all sparklines
- Describe trend direction in alt text
- Summary paragraph at top (visually hidden)

### Keyboard Navigation
- Tab order follows visual hierarchy
- Shift+Tab for reverse navigation
- Enter/Space to activate panels
- Arrow keys for metric navigation

### Color Blindness
- Don't rely solely on color (use icons + patterns)
- Ensure sufficient contrast ratios
- Provide textual indicators alongside colors
- Optional high-contrast mode

---

## Implementation Example

```tsx
export function OverviewDashboard({ gameState }: { gameState: GameState }) {
  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <header className="border-b border-white/20 pb-4 mb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-sm uppercase tracking-wider text-white/60">
            Superalignment → Utopia Simulation
          </h1>
          <div className="text-cyan-400">
            Month {gameState.currentMonth} | {formatDate(gameState.currentMonth)}
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outcome Trajectory */}
        <Panel title="Outcome Trajectory">
          <OutcomeTrajectory metrics={gameState.outcomeMetrics} />
        </Panel>

        {/* Multi-Paradigm Status */}
        <Panel title="Multi-Paradigm Status">
          <ParadigmStatus dui={gameState.multiParadigmDUI} />
        </Panel>
      </div>

      {/* Critical Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <MetricCard
          title="Population"
          value={gameState.globalMetrics.population}
          trend={gameState.history?.population}
          change={calculateChange(gameState.history?.population)}
        />
        {/* ... more metric cards ... */}
      </div>

      {/* Crisis and Spirals Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <CrisisPanel crises={detectActiveCrises(gameState)} />
        <SpiralsPanel spirals={gameState.upwardSpirals} />
      </div>

      {/* System Status */}
      <SystemStatusGrid gameState={gameState} />

      {/* Recent Events */}
      <EventTimeline events={gameState.eventLog.slice(-20)} />
    </div>
  );
}
```

---

This overview dashboard provides the command center for monitoring and understanding the complex simulation state, with every element designed to maximize information density while maintaining clarity and visual hierarchy.
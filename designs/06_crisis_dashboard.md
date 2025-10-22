# Crisis Monitoring Dashboard
## Cascading Crisis Detection & Response System

### Purpose
Monitor and predict cascading crises across 10 crisis types (phosphorus, freshwater, climate, nuclear, pandemic, etc.) with compound multiplier effects. This screen reveals how seemingly isolated problems cascade into civilization-threatening scenarios, tracks crisis evolution from early warning to full cascade, and shows intervention windows before points of no return. Users can identify crisis chains, understand multiplier effects, and coordinate emergency responses.

### Data Sources
- Crisis states for 10 types
- Severity levels (0-5 scale)
- Cascade multipliers (1.0x - 3.0x)
- Crisis interactions and dependencies
- Emergency response capabilities
- Government response effectiveness
- Time to critical thresholds

---

## Layout Structure

```
┌────────────────────────────────────────────────────────────────────────────┐
│ CRISIS CASCADE MONITORING SYSTEM                       MONTH 47 | 2029.11  │
│ ════════════════════════════════════════════════════════════════════════  │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ CRISIS OVERVIEW                   CASCADE MULTIPLIER: 1.85x         │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │                                                                     │  │
│  │  Active Crises: 3     Warning: 2     Monitoring: 5     Clear: 0    │  │
│  │                                                                     │  │
│  │  ┌───────────────────────────────────────────────────────────┐     │  │
│  │  │         LOW    MODERATE   HIGH    SEVERE   CRITICAL       │     │  │
│  │  │         [1]      [2]       [3]      [4]       [5]         │     │  │
│  │  │                                                           │     │  │
│  │  │ Phosphorus    ░░░░░░░░░████████░░░░░░░░░  [3.2] ⚠      │     │  │
│  │  │ Freshwater    ░░░░░░████████░░░░░░░░░░░░░  [2.8] ◐      │     │  │
│  │  │ Climate       ░░░░░░░░░░░░░░████████░░░░░  [3.7] ⚠      │     │  │
│  │  │ Nuclear       ░░░░░░░░░░░░░░░░░░░░░░░░░░░  [0.8] ○      │     │  │
│  │  │ Pandemic      ░░░░████░░░░░░░░░░░░░░░░░░░  [1.4] ○      │     │  │
│  │  │ Ocean Acid    ░░░░░░░░░░████████░░░░░░░░░  [2.9] ◐      │     │  │
│  │  │ Novel Entity  ░░░░░░████░░░░░░░░░░░░░░░░░  [1.7] ○      │     │  │
│  │  │ AI Misalign   ░░░░░░░░░░░░██████████░░░░░  [3.9] 🔴     │     │  │
│  │  │ Social        ░░░░░░████████░░░░░░░░░░░░░  [2.6] ◐      │     │  │
│  │  │ Economic      ░░████░░░░░░░░░░░░░░░░░░░░░  [1.2] ○      │     │  │
│  │  └───────────────────────────────────────────────────────────┘     │  │
│  │                                                                     │  │
│  │  Trajectory: DETERIORATING    Response Capacity: 34%               │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ CASCADE CHAIN ANALYSIS                                              │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │                                                                     │  │
│  │  Primary Chain (Probability: 67%)                                   │  │
│  │                                                                     │  │
│  │  Climate [3.7] ──1.3x──→ Freshwater [2.8] ──1.5x──→ Food [4.2]     │  │
│  │       │                         │                        │          │  │
│  │       └──1.2x──→ Migration ────┴───1.8x────→ Social [2.6]          │  │
│  │                                                   │                 │  │
│  │                                                   └─2.1x→ COLLAPSE │  │
│  │                                                                     │  │
│  │  Secondary Chains:                                                  │  │
│  │  • Phosphorus → Food → Social (42% probability)                    │  │
│  │  • AI Misalign → Economic → Social (38% probability)              │  │
│  │  • Ocean Acid → Food → Migration (31% probability)                │  │
│  │                                                                     │  │
│  │  Time to Cascade: ~8-14 months                                      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────┐  │
│  │ EMERGENCY RESPONSE STATUS    │  │ INTERVENTION WINDOWS            │  │
│  │                               │  │                                 │  │
│  │  Government Mobilization: 42% │  │  Phosphorus:  ████░░ 4 months  │  │
│  │  Resource Allocation:    $2.3T│  │  Climate:     ██░░░░ 2 months  │  │
│  │  International Coord:     LOW │  │  Freshwater:  ███░░░ 3 months  │  │
│  │                               │  │  AI Misalign: █░░░░░ 1 month   │  │
│  │  Response Actions:            │  │                                 │  │
│  │  ☑ Emergency Stockpiles      │  │  ⚠ CRITICAL: AI window closing │  │
│  │  ☑ Water Rationing           │  │                                 │  │
│  │  ☐ Geoengineering            │  │  Legend:                        │  │
│  │  ☐ Population Relocation     │  │  █ Time remaining               │  │
│  │  ☑ Tech Deployment Accel     │  │  ░ Time passed                  │  │
│  └──────────────────────────────┘  └──────────────────────────────────┘  │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ CRISIS TIMELINE & PROJECTIONS                                       │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │                                                                     │  │
│  │  Historical (Months -12 to 0)          Projected (+12 months)      │  │
│  │                                                                     │  │
│  │  5 ┤                                          ╱── AI Misalign      │  │
│  │    │                            ╱────────────╱                     │  │
│  │  4 ├                      ╱────╱ Climate    ╱                      │  │
│  │    │                ╱────╱        ╱────────╱                       │  │
│  │  3 ├          ╱────╱ Phosphorus  ╱                                 │  │
│  │    │    ╱────╱             ╱────╱                                  │  │
│  │  2 ├───╱ Freshwater  ╱────╱                                        │  │
│  │    │              ╱─╱                                              │  │
│  │  1 ├─────────────╱                                                 │  │
│  │    └──────────────────────┼──────────────────────────→            │  │
│  │    -12    -6      0      +6     +12    +18    +24                 │  │
│  │                            ↑                                       │  │
│  │                           NOW                                      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### Crisis Overview Panel
**Purpose**: At-a-glance crisis status across all types
**Key Elements**:
- Summary counts (Active/Warning/Monitoring/Clear)
- CASCADE MULTIPLIER calculation (compound effect)
- Severity bars for each crisis type (0-5 scale)
- Status indicators:
  - ○ Clear/Monitoring (<1.5)
  - ◐ Warning (1.5-2.5)
  - ⚠ Active (2.5-4.0)
  - 🔴 Critical (>4.0)
- Overall trajectory (Improving/Stable/Deteriorating)
- Response capacity percentage

**Visual Design**:
- Horizontal bars with severity zones
- Color gradient: Gray → Yellow → Orange → Red
- Pulsing effect for critical crises
- Multiplier displayed prominently

### CASCADE Chain Analysis
**Purpose**: Show how crises trigger each other
**Visualization**: Flow diagram showing connections
**Elements**:
- Primary cascade chain (highest probability)
- Multiplier values on connections (1.2x, 1.5x, etc.)
- Probability percentages
- End state prediction (collapse/stabilization)
- Secondary chains listed below
- Time to cascade estimate

**Interactions**:
- Click chain to see detailed progression
- Hover connections for trigger conditions
- Adjust parameters to see different chains

### Emergency Response Status
**Purpose**: Government/society response capability
**Metrics**:
- Government mobilization percentage
- Resource allocation (monetary)
- International coordination level
- Active response measures checklist
**Visual Elements**:
- Progress bars for mobilization
- Dollar amount for resources
- Checklist of interventions
- Effectiveness indicators

### Intervention Windows
**Purpose**: Time remaining to prevent cascade
**Display**: Countdown bars for each crisis
**Key Information**:
- Months remaining before irreversible
- Visual urgency (red for <2 months)
- Critical warnings for closing windows
**Alert Logic**:
- Pulse when window <3 months
- Strobe when window <1 month
- "MISSED" when window closed

### Crisis Timeline & Projections
**Purpose**: Historical trends and future projections
**Visualization**: Multi-line chart
**Features**:
- Historical data (past 12 months)
- Current position marker
- Projected trajectories (with uncertainty)
- Cascade trigger thresholds
- Intervention impact modeling

---

## Advanced Visualizations

### Crisis Interaction Matrix
```
         Phos  Water  Clim  Nucl  Pand  Ocean  AI
Phos      -    1.5x   1.2x   -     -    0.8x   -
Water    1.3x   -     1.4x   -    0.5x  1.1x   -
Climate  1.2x  1.8x    -    0.3x  0.7x  1.9x  0.4x
Nuclear  0.1x  0.2x   0.9x   -     -    0.3x  0.2x
Pandemic  -    0.6x   0.4x   -     -     -    0.1x
Ocean    0.9x  1.2x   1.5x   -     -     -     -
AI        -     -     0.3x  2.1x  1.2x   -     -
```

### Response Effectiveness Curve
```
100% ┤
     │     Optimal
     │    ╱─────────
 50% ├──╱─╱ Current
     │ ╱ ╱
  0% ┤╱─╱── Too Late
     └──────────────→
     0   3   6   9  12 months
```

### Cascade Probability Tree
```
Climate Crisis (100%)
├─[60%]→ Water Crisis
│  ├─[70%]→ Food Crisis
│  │  └─[80%]→ Social Collapse
│  └─[30%]→ Migration
│     └─[60%]→ Conflict
└─[40%]→ Direct Collapse
```

---

## Interaction Patterns

### Crisis Deep Dive
Click any crisis → Detailed view:
- Complete metrics and history
- Contributing factors
- Affected populations
- Intervention options
- Success probability for each intervention

### Cascade Simulator
"What-if" modeling:
- Adjust crisis severities
- See cascade predictions update
- Test intervention strategies
- Compare outcomes

### Response Planner
Interactive response configuration:
- Allocate resources to crises
- See effectiveness predictions
- Trade-off analysis
- Timeline impact

### Alert Configuration
Set custom thresholds:
- Crisis severity alerts
- Cascade probability warnings
- Intervention window alerts
- Response effectiveness minimums

---

## Alert States

### Crisis-Level Alerts
- **Crisis Emerging** (>2.0): Yellow indicator
- **Crisis Active** (>3.0): Orange pulse
- **Crisis Critical** (>4.0): Red strobe
- **Crisis Cascading**: Full screen alert

### System-Level Alerts
- **Multiple Crises**: When 3+ active
- **Cascade Imminent**: High probability chain detected
- **Response Failing**: Capacity <20%
- **Point of No Return**: Window closing

### Intervention Alerts
- **Window Closing**: <3 months remaining
- **Intervention Required**: Critical action needed
- **Resources Insufficient**: Can't fund response
- **Coordination Failing**: International response poor

---

## Edge Cases

### No Active Crises
- Display "STABLE STATE" message
- Show prevention metrics
- Focus on monitoring
- Highlight successful interventions

### Total Cascade
- Emergency UI mode
- Focus only on critical actions
- Show survival priorities
- Display evacuation/shelter info

### Response Success
- Show stabilization timeline
- Highlight effective interventions
- Display recovery trajectory
- Calculate prevented damage

### Data Gaps
- Show known vs unknown
- Display confidence levels
- Mark uncertain projections
- Explain limitations

---

## Mobile Adaptations

### Phone (< 640px)
- Stack crisis bars vertically
- Simplified cascade diagram
- Swipe between panels
- Bottom sheet for details

### Tablet (640-1024px)
- 2-column layout
- Touch-optimized controls
- Condensed visualizations
- Gesture navigation

---

## Performance Considerations

### Data Processing
- Cache cascade calculations (expensive)
- Pre-compute probability trees
- Batch update crisis metrics
- Use Web Workers for projections

### Rendering
- Throttle timeline updates
- Virtualize crisis lists if expanded
- Optimize cascade diagram rendering
- Limit animation complexity

---

## Implementation Example

```tsx
export function CrisisDashboard({ gameState }: { gameState: GameState }) {
  const crises = assessCrises(gameState);
  const cascades = analyzeCascadeChains(crises);
  const response = gameState.emergencyManagement;
  const windows = calculateInterventionWindows(crises);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <Header
        title="Crisis Cascade Monitoring System"
        alert={crises.cascadeMultiplier > 1.5}
      />

      {/* Crisis Overview */}
      <Panel
        title="Crisis Overview"
        subtitle={`CASCADE MULTIPLIER: ${crises.cascadeMultiplier.toFixed(2)}x`}
        alertLevel={crises.active.length > 2 ? 'critical' : 'warning'}
      >
        <CrisisSummary counts={crises.counts} />
        <CrisisSeverityBars
          crises={crises.all}
          showStatus={true}
          animate={true}
        />
        <TrajectoryIndicator
          direction={crises.trajectory}
          capacity={response.capacity}
        />
      </Panel>

      {/* Cascade Analysis */}
      <Panel title="Cascade Chain Analysis" className="mt-6">
        <CascadeFlowDiagram
          primary={cascades.primary}
          secondary={cascades.secondary}
          timeToEvent={cascades.timeEstimate}
        />
      </Panel>

      {/* Response and Windows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Panel title="Emergency Response Status">
          <ResponseMetrics
            mobilization={response.mobilization}
            resources={response.allocation}
            coordination={response.international}
          />
          <ResponseActions
            active={response.activeActions}
            available={response.availableActions}
          />
        </Panel>

        <Panel
          title="Intervention Windows"
          alertLevel={windows.critical.length > 0 ? 'critical' : 'warning'}
        >
          <InterventionCountdowns
            windows={windows}
            showCritical={true}
          />
        </Panel>
      </div>

      {/* Timeline */}
      <Panel title="Crisis Timeline & Projections" className="mt-6">
        <CrisisTimeline
          historical={crises.history}
          current={crises.current}
          projected={crises.projections}
          showUncertainty={true}
        />
      </Panel>
    </div>
  );
}
```

---

This Crisis Dashboard provides critical visibility into cascading crisis dynamics, revealing how isolated problems compound through multiplier effects into civilization-threatening scenarios, while tracking narrow intervention windows before points of no return.
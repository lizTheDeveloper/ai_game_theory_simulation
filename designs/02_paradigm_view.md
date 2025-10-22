# Multi-Paradigm DUI Visualization
## Four Simultaneous Perspectives on Dystopia-Utopia

### Purpose
The Multi-Paradigm DUI screen visualizes how different value systems simultaneously evaluate the same world state. This reveals critical conflicts where one paradigm shows utopia while another shows dystopia (e.g., Singapore pattern: high Development + moderate Western Liberal, Norway pattern: high living standards + ecological stress). Users can identify value trade-offs, detect paradigm divergence that predicts instability, and understand why different populations might have radically different assessments of progress.

### Data Sources
- `GameState.multiParadigmDUI.scores` - Current paradigm scores (0-100)
- `GameState.multiParadigmDUI.westernLiberal` - Democracy, civil liberties, rule of law, economic freedom
- `GameState.multiParadigmDUI.development` - QoL, survival, life expectancy, literacy
- `GameState.multiParadigmDUI.ecological` - Planetary boundaries, climate, biodiversity
- `GameState.multiParadigmDUI.indigenous` - Social cohesion, meaning, community bonds
- Historical paradigm data for trends
- Component breakdowns for each paradigm

---

## Layout Structure

```
┌────────────────────────────────────────────────────────────────────────────┐
│ MULTI-PARADIGM DYSTOPIA-UTOPIA INDEX                   MONTH 47 | 2029.11  │
│ ════════════════════════════════════════════════════════════════════════  │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ PARADIGM COMPARISON                              Divergence: 28.4 σ │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │                                                                     │  │
│  │  WESTERN LIBERAL    ████████████████████████████████░░░░░░  78.3  │  │
│  │  Democracy 82 | Civil Liberty 71 | Rule of Law 85 | Econ Free 75  │  │
│  │                                                                     │  │
│  │  DEVELOPMENT        ████████████████████████████████████████  94.2  │  │
│  │  QoL 89 | Survival 98 | Life Exp 92 | Education 95 | Income 97    │  │
│  │                                                                     │  │
│  │  ECOLOGICAL         ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  24.1  │  │
│  │  Climate 18 | Biodiv 31 | Ocean 22 | Forest 28 | Fresh H2O 21     │  │
│  │                                                                     │  │
│  │  INDIGENOUS         ████████████████████████████░░░░░░░░░░  72.8  │  │
│  │  Trust 68 | Meaning 71 | Community 78 | Tradition 74              │  │
│  │                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────┐  │
│  │ TEMPORAL EVOLUTION           │  │ PARADIGM CONFLICTS              │  │
│  │                               │  │                                 │  │
│  │  Western  ▃▄▅▆▇▇▆▅▄▃▂▁▂▃▄▅  │  │  ⚠️ DEV vs ECO      70.1 gap   │  │
│  │  Develop  ▁▂▃▄▅▆▇████████  │  │  ◐ WEST vs INDIG    5.5 gap    │  │
│  │  Ecology  ████▇▆▅▄▃▂▁▁▁▁  │  │  ○ WEST vs DEV      15.9 gap   │  │
│  │  Indigen  ▅▅▅▆▆▇▇▆▆▅▅▄▄▃▃  │  │                                 │  │
│  │                               │  │  Conflict Risk: HIGH            │  │
│  │  [←60mo]        [NOW]         │  │  Singapore Pattern: 62% match   │  │
│  └──────────────────────────────┘  └──────────────────────────────────┘  │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ COMPONENT BREAKDOWN HEATMAP                                         │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │         Democracy  CivLib  RuleLaw  EconFree  QoL  Survival  LifeExp│  │
│  │ USA        ███     ███     ███      ███      ██    ███       ██    │  │
│  │ China      ▒▒▒     ▒▒░     ▒▒▒      ███      ███   ███       ███   │  │
│  │ Norway     ███     ███     ███      ███      ███   ███       ███   │  │
│  │ India      ██▒     ██▒     ██░      ██▒      ▒▒░   ▒▒▒       ▒▒░   │  │
│  │ Brazil     ██░     ██▒     ▒▒░      ██▒      ▒▒▒   ██▒       ██░   │  │
│  │                                                                     │  │
│  │         Climate  Biodiv  Ocean  Forest  Water  Trust  Meaning  Comm│  │
│  │ USA        ▒▒░     ▒▒▒    ▒▒░     ░░░    ▒▒░    ▒▒░    ░░░     ▒▒░ │  │
│  │ China      ░░░     ░░░    ░░░     ░░░    ░░░    ▒▒▒    ▒▒░     ██▒ │  │
│  │ Norway     ▒▒▒     ██▒    ▒▒▒     ███    ███    ███    ███     ███ │  │
│  │ India      ░░░     ▒▒░    ░░░     ▒▒░    ░░░    ██▒    ███     ███ │  │
│  │ Brazil     ▒▒░     ▒▒▒    ▒▒░     ▒▒░    ▒▒▒    ██░    ██▒     ███ │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────┐  │
│  │ HISTORICAL PATTERNS          │  │ OUTCOME CLASSIFICATION          │  │
│  │                               │  │                                 │  │
│  │ Current: DIVERGENT STRESS     │  │  By Paradigm:                  │  │
│  │                               │  │  Western:  STABLE DEMOCRACY     │  │
│  │ Similar to:                   │  │  Develop:  NEAR UTOPIA         │  │
│  │ • Singapore 2024 (68% match) │  │  Ecology:  CRISIS STATE        │  │
│  │ • UAE 2023 (61% match)       │  │  Indigen:  MODERATE THRIVING   │  │
│  │ • China 2022 (54% match)     │  │                                 │  │
│  │                               │  │  Aggregate: CONTESTED FUTURE   │  │
│  └──────────────────────────────┘  └──────────────────────────────────┘  │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ PARADIGM RADAR CHARTS                                               │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │                                                                     │  │
│  │     Western Liberal              Development                       │  │
│  │          Dem                          QoL                          │  │
│  │           █                            █                           │  │
│  │      ████ █ ████                  ████ █ ████                     │  │
│  │  Econ ████████ CivLib         Income ████████ Surv                │  │
│  │      ████ █ ████                  ████ █ ████                     │  │
│  │           █                            █                           │  │
│  │         RuleLaw                      LifeExp                       │  │
│  │                                                                     │  │
│  │     Ecological                    Indigenous                       │  │
│  │        Climate                        Trust                        │  │
│  │           ▒                            █                           │  │
│  │      ▒▒▒▒ ▒ ▒▒▒▒                  ████ █ ████                     │  │
│  │ Water ▒▒▒▒▒▒▒▒ Biodiv         Trad ████████ Mean                  │  │
│  │      ▒▒▒▒ ▒ ▒▒▒▒                  ████ █ ████                     │  │
│  │           ▒                            █                           │  │
│  │         Forest                       Comm                          │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### Paradigm Comparison Bar Chart
**Purpose**: Primary visualization of all 4 paradigm scores
**Display**:
- Horizontal bars with paradigm-specific colors
- Score value (0-100) at right
- Component breakdown below each bar
- Divergence calculation (standard deviation) in header
**Visual Encoding**:
- Bar fill represents score magnitude
- Color intensity increases with score
- Pulsing effect if score < 30 (crisis)
- Glow effect if score > 80 (thriving)

### Temporal Evolution
**Purpose**: Show paradigm trajectories over time
**Data**: Last 60 months of paradigm scores
**Visualization**:
- 4 stacked sparklines with paradigm colors
- Synchronized time axis
- Current position marker
**Interactions**:
- Hover to see exact values at any point
- Click-drag to select time range for analysis
- Pinch/zoom on mobile for detail

### Paradigm Conflicts Panel
**Purpose**: Identify value system conflicts
**Calculation**: Pairwise absolute differences
**Display**:
- Sorted list of largest conflicts first
- Visual severity indicators:
  - ○ Low (< 20 point gap)
  - ◐ Medium (20-40 point gap)
  - ⚠️ High (> 40 point gap)
- Pattern matching (Singapore, Norway, etc.)
**Alert Logic**:
- Panel border turns amber if any gap > 40
- Pulses if divergence accelerating

### Component Breakdown Heatmap
**Purpose**: Detailed view of all sub-components by region
**Layout**: Matrix visualization
- Rows: Top 5 countries/regions
- Columns: All paradigm components (16-20 total)
**Visual Encoding**:
- █ (80-100): Thriving/Utopian
- ▓ (60-80): Healthy
- ▒ (40-60): Moderate
- ░ (20-40): Struggling
- ░ (0-20): Crisis/Dystopian
**Interactions**:
- Click row to filter to single country
- Click column to sort by that metric
- Hover for exact values

### Historical Patterns
**Purpose**: Context from real-world precedents
**Analysis**:
- Pattern matching against historical database
- Similarity percentage calculation
- List top 3 matches with years
**Data Source**: V-Dem, UNDP, ecological datasets
**Update**: Recalculates every 6 months

### Outcome Classification
**Purpose**: Interpret paradigm scores
**Logic**:
- Each paradigm classified independently:
  - 80-100: Utopia/Thriving
  - 60-80: Stable/Healthy
  - 40-60: Moderate/Contested
  - 20-40: Struggling/Crisis
  - 0-20: Dystopia/Collapse
- Aggregate classification based on patterns
**Special Cases**:
- "CONTESTED FUTURE": High divergence
- "ELITE UTOPIA": High dev, low others
- "MANAGED DECLINE": All slowly decreasing

### Paradigm Radar Charts
**Purpose**: Visual shape of each paradigm's components
**Layout**: 2×2 grid of radar charts
**Components**:
- Western: Democracy, Civil Liberties, Rule of Law, Economic Freedom
- Development: QoL, Survival, Life Expectancy, Education, Income
- Ecological: Climate, Biodiversity, Ocean, Forest, Water
- Indigenous: Trust, Meaning, Community, Tradition
**Visual Design**:
- Filled area with paradigm color at 30% opacity
- White border line
- Component labels at vertices
- Scale rings at 25, 50, 75, 100

---

## Interaction Patterns

### Paradigm Deep-Dive
Click any paradigm bar → Expand to full-screen detailed view:
- Component time series (all sub-metrics)
- Regional breakdown map
- Policy impact analysis
- Historical precedents

### Comparative Mode
Toggle button: "COMPARE" → Select 2 paradigms:
- Side-by-side detailed comparison
- Correlation analysis
- Trade-off identification
- Resolution strategies

### Regional Filter
Dropdown: "GLOBAL" → Select specific country/region:
- All visualizations filter to selection
- Show regional-specific patterns
- Compare to global averages

### Time Range Selection
Slider control: Adjust analysis window (1-240 months):
- All trends recalculate
- Pattern matching updates
- Divergence recalculates

---

## Alert States

### Paradigm-Specific Alerts
- **Ecological Collapse** (< 20): Red pulsing border, extinction icon
- **Democratic Backsliding** (Western < 40): Amber alert, trending arrow
- **Development Crisis** (< 30): Population mortality warnings
- **Social Breakdown** (Indigenous < 30): Trust crisis indicator

### Divergence Alerts
- **Low** (σ < 15): Stable, no special indication
- **Moderate** (σ 15-30): Yellow indicator dot
- **High** (σ 30-45): Amber border pulse
- **Critical** (σ > 45): Red strobe, instability warning

### Pattern Alerts
- **Singapore Pattern**: Development without democracy
- **Norway Pattern**: Prosperity with ecological damage
- **Bhutan Pattern**: Ecological/Indigenous without development
- **Elysium Pattern**: Elite development, mass suffering

---

## Responsive Behavior

### Mobile (< 640px)
```
┌─────────────────┐
│ PARADIGM SCORES │
│ (vertical stack)│
├─────────────────┤
│ CONFLICTS       │
├─────────────────┤
│ EVOLUTION       │
│ (swipe for more)│
└─────────────────┘
```
- Stack paradigm bars vertically
- Swipe between radar charts
- Collapse heatmap to summary

### Tablet (640-1024px)
- 2×2 layout for main panels
- Radar charts below
- Side drawer for patterns

### Desktop (> 1024px)
- Full layout as designed
- All components visible
- Advanced interactions enabled

---

## Performance Optimizations

### Data Processing
- Pre-calculate divergence (memoized)
- Cache pattern matching results (6-month TTL)
- Debounce heatmap updates
- Use Web Workers for heavy calculations

### Rendering
- Virtualize heatmap rows if > 20 countries
- Use Canvas for radar charts (better performance)
- Throttle sparkline updates to 30fps
- Lazy load historical comparisons

---

## Edge Cases

### All Paradigms Aligned (σ < 5)
- Display "CONSENSUS ACHIEVED" banner
- Highlight as rare/remarkable event
- Check for measurement error
- Show historical precedents (very rare)

### Complete Paradigm Collapse (All < 20)
- Full screen crisis mode
- Focus on recovery strategies
- Show similar historical collapses
- Prioritize intervention options

### Data Unavailable
- Show last known values with timestamp
- Gray out affected components
- Display "DATA PENDING" indicator
- Maintain layout structure

---

## Accessibility Features

### Screen Readers
- Announce paradigm scores in order
- Describe divergence level
- Read conflict pairs with gaps
- Summarize patterns detected

### Keyboard Navigation
- Tab through paradigms in order
- Arrow keys navigate heatmap
- Space to expand panels
- Esc to close expanded views

### Alternative Views
- Table mode for heatmap data
- Text descriptions of radar shapes
- Numerical conflict matrix option
- Export data as CSV

---

## Implementation Example

```tsx
export function ParadigmView({ gameState }: { gameState: GameState }) {
  const { multiParadigmDUI } = gameState;
  const divergence = calculateDivergence(multiParadigmDUI.scores);
  const conflicts = detectConflicts(multiParadigmDUI.scores);
  const pattern = matchHistoricalPattern(multiParadigmDUI);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <Header title="Multi-Paradigm Dystopia-Utopia Index" />

      {/* Main Comparison */}
      <Panel
        title="Paradigm Comparison"
        subtitle={`Divergence: ${divergence.toFixed(1)} σ`}
        alertLevel={divergence > 30 ? 'warning' : 'normal'}
      >
        <ParadigmBars scores={multiParadigmDUI.scores} />
      </Panel>

      {/* Evolution and Conflicts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Panel title="Temporal Evolution">
          <ParadigmSparklines history={multiParadigmDUI.history} />
        </Panel>

        <Panel title="Paradigm Conflicts" alertLevel={conflicts[0]?.gap > 40 ? 'warning' : 'normal'}>
          <ConflictList conflicts={conflicts} pattern={pattern} />
        </Panel>
      </div>

      {/* Component Heatmap */}
      <Panel title="Component Breakdown Heatmap" className="mt-6">
        <ComponentHeatmap
          data={multiParadigmDUI.componentBreakdown}
          regions={gameState.topRegions}
        />
      </Panel>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-6 mt-6">
        <Panel title="Historical Patterns">
          <PatternMatches current={multiParadigmDUI} />
        </Panel>

        <Panel title="Outcome Classification">
          <OutcomeClassifier scores={multiParadigmDUI.scores} />
        </Panel>
      </div>

      {/* Radar Charts */}
      <Panel title="Paradigm Radar Charts" className="mt-6">
        <div className="grid grid-cols-2 gap-8">
          <RadarChart paradigm="western" data={multiParadigmDUI.westernLiberal} />
          <RadarChart paradigm="development" data={multiParadigmDUI.development} />
          <RadarChart paradigm="ecological" data={multiParadigmDUI.ecological} />
          <RadarChart paradigm="indigenous" data={multiParadigmDUI.indigenous} />
        </div>
      </Panel>
    </div>
  );
}
```

---

This Multi-Paradigm DUI visualization reveals the critical insight that different value systems can simultaneously see utopia and dystopia in the same world state, enabling nuanced analysis of trade-offs and conflicts in the path from AI alignment to human flourishing.
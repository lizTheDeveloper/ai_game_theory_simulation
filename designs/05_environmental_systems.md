# Environmental Systems Dashboard
## Planetary Boundaries & Ecological Crisis Monitoring

### Purpose
Track Earth's nine planetary boundaries and environmental accumulation systems that can trigger cascading ecological collapse. This screen reveals which boundaries have been crossed, accumulation of environmental debt during prosperity, tipping point proximity, and the slow deployment of mitigation technologies. Users can identify crisis patterns before they cascade, understand recovery timescales, and see why ecological collapse often accompanies technological prosperity.

### Data Sources
- Planetary boundaries state (9 systems)
- `EnvironmentalAccumulation` - Hidden debt accumulation
- Climate metrics (temperature, CO2, ocean pH)
- Resource depletion rates
- Biodiversity indices
- Technology deployment (DAC, renewables, etc.)
- Crisis thresholds and tipping points

---

## Layout Structure

```
┌────────────────────────────────────────────────────────────────────────────┐
│ PLANETARY BOUNDARIES & ENVIRONMENTAL SYSTEMS           MONTH 47 | 2029.11  │
│ ════════════════════════════════════════════════════════════════════════  │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ PLANETARY BOUNDARIES STATUS          3 of 9 boundaries crossed      │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │                                                                     │  │
│  │                    Safe Operating Space                             │  │
│  │                         ╱─────╲                                     │  │
│  │                     ╱─────────────╲                                 │  │
│  │                 ╱───────────────────╲                               │  │
│  │             ╱───────────────────────────╲                           │  │
│  │         ╱─────────────────────────────────╲                         │  │
│  │        │  Climate ████████████░░  CROSSED  │                        │  │
│  │        │  Biodiv  ███████████░░░  CROSSED  │                        │  │
│  │        │  Nitrogen████░░░░░░░░░  WARNING  │                        │  │
│  │        │  Forest  ██████░░░░░░░  MODERATE │                        │  │
│  │        │  Ocean   ████████░░░░░  WARNING  │                        │  │
│  │        │  Ozone   ██░░░░░░░░░░░  SAFE     │                        │  │
│  │        │  Water   █████████░░░░  WARNING  │                        │  │
│  │        │  Land    ████░░░░░░░░░  MODERATE │                        │  │
│  │        │  Aerosol ███░░░░░░░░░░  SAFE     │                        │  │
│  │         ╲─────────────────────────────────╱                         │  │
│  │             ╲───────────────────────────╱                           │  │
│  │                 ╲───────────────────╱                               │  │
│  │                     ╲─────────────╱                                 │  │
│  │                         ╲─────╱                                     │  │
│  │                                                                     │  │
│  │  Legend: ░ Within boundary  █ Approaching/Crossed  ⚠ Tipping risk  │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────┐  │
│  │ CLIMATE METRICS              │  │ ENVIRONMENTAL ACCUMULATION      │  │
│  │                               │  │                                 │  │
│  │  Temperature: +1.8°C          │  │  Hidden Debt Level: 73%         │  │
│  │  ▁▂▃▄▅▆▇█ (accelerating)     │  │                                 │  │
│  │                               │  │  Resource    ████████░░ 82%     │  │
│  │  CO₂: 421 ppm                 │  │  Pollution   ██████░░░░ 61%     │  │
│  │  ▃▄▅▆▇███ (exponential)      │  │  Climate     ███████░░░ 71%     │  │
│  │                               │  │  Ecosystem   █████████░ 85%     │  │
│  │  Ocean pH: 7.96               │  │                                 │  │
│  │  ████▇▆▅▄ (acidifying)       │  │  Accumulation Rate: +2.3%/mo    │  │
│  │                               │  │  Time to Crisis: ~18 months     │  │
│  │  Arctic Ice: 2.1M km²         │  │                                 │  │
│  │  ███▇▅▃▂▁ (collapsing)       │  │  ⚠ DEBT SPIRAL RISK: HIGH       │  │
│  └──────────────────────────────┘  └──────────────────────────────────┘  │
│                                                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │ TECHNOLOGY DEPLOYMENT STATUS                                        │  │
│  ├─────────────────────────────────────────────────────────────────────┤  │
│  │                                         Deploy    Impact    Time    │  │
│  │  Direct Air Capture (DAC)              ██░░░░░░  ░░░░░░░░  15yr   │  │
│  │  Status: Early deployment, 0.05 GtCO₂/yr, scaling slowly           │  │
│  │                                                                     │  │
│  │  Renewable Energy                      ████████  ██░░░░░░  26yr   │  │
│  │  Status: 41% grid penetration, 85% target by 2050                  │  │
│  │                                                                     │  │
│  │  Fusion Power                          ░░░░░░░░  ░░░░░░░░  40yr   │  │
│  │  Status: R&D phase, first commercial 2035-2045                     │  │
│  │                                                                     │  │
│  │  Ecosystem Restoration                 ███░░░░░  █░░░░░░░  20yr   │  │
│  │  Status: Limited deployment, biodiversity still declining          │  │
│  │                                                                     │  │
│  │  Phosphorus Recovery                   ████░░░░  ██░░░░░░  10yr   │  │
│  │  Status: Technology ready, deployment limited by economics         │  │
│  │                                                                     │  │
│  │  [Legend: Deploy=Current deployment, Impact=Ecosystem effect]      │  │
│  └─────────────────────────────────────────────────────────────────────┘  │
│                                                                            │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────┐  │
│  │ TIPPING POINTS               │  │ REGIONAL IMPACTS                │  │
│  │                               │  │                                 │  │
│  │  Amazon Dieback    [72%] ⚠   │  │  North America  ███░░░ Moderate│  │
│  │  AMOC Shutdown     [31%] ◐   │  │  Europe         ████░░ Warning │  │
│  │  Permafrost Thaw   [89%] 🔴  │  │  China          █████░ Crisis  │  │
│  │  Ice Sheet Loss    [45%] ◐   │  │  India          ██████ Crisis  │  │
│  │  Coral Collapse    [94%] 🔴  │  │  Brazil         ████░░ Warning │  │
│  │  Boreal Shift      [28%] ○   │  │  Africa         █████░ Crisis  │  │
│  │                               │  │  Australia      ███░░░ Moderate│  │
│  │  System Risk: CRITICAL        │  │                                 │  │
│  └──────────────────────────────┘  └──────────────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### Planetary Boundaries Visualization
**Purpose**: Show Earth's safe operating space
**Design**: Circular/radar chart with 9 axes
**Visual Elements**:
- Inner green zone: Safe operating space
- Yellow zone: Uncertainty/risk zone
- Red zone: High risk/crossed boundary
- Current position marked for each boundary
**Status Indicators**:
- SAFE: Within green zone
- MODERATE: Yellow zone
- WARNING: Approaching boundary
- CROSSED: Beyond boundary
**Interactions**:
- Click boundary for detailed metrics
- Hover for historical trajectory
- Animate changes over time

### Climate Metrics Panel
**Purpose**: Core climate indicators
**Metrics Shown**:
- Global temperature anomaly
- Atmospheric CO₂ concentration
- Ocean pH (acidification)
- Arctic ice extent
**Visualizations**:
- Sparklines showing 60-month trends
- Trend indicators (stable/accelerating/exponential)
- Reference lines for critical thresholds
**Alert Logic**:
- Red if approaching tipping points
- Pulse effect for rapid changes

### Environmental Accumulation Panel
**Purpose**: Show hidden debt building during prosperity
**Concept**: Problems accumulate invisibly, then cascade
**Metrics**:
- Resource depletion percentage
- Pollution accumulation
- Climate debt (committed warming)
- Ecosystem degradation
**Key Indicators**:
- Overall debt level (0-100%)
- Accumulation rate per month
- Estimated time to crisis
- Spiral risk assessment
**Visual Design**:
- Stacked bar showing components
- Trend arrow for rate
- Warning when >70% accumulated

### Technology Deployment Status
**Purpose**: Show gap between tech availability and impact
**For Each Technology**:
- Deployment level (% of potential)
- Current impact on environment
- Time to full impact (years)
- Status description
**Key Insight**: Technologies exist but take decades to deploy
**Visual Encoding**:
- Deployment bar (how much deployed)
- Impact bar (effect on environment)
- Time indicator (years to meaningful impact)
**Color Coding**:
- Green: Deployed and impacting
- Yellow: Deploying slowly
- Red: Available but not deployed

### Tipping Points Panel
**Purpose**: Critical thresholds that trigger cascades
**Tipping Points Tracked**:
- Amazon rainforest dieback
- AMOC (Atlantic circulation) shutdown
- Permafrost methane release
- Ice sheet collapse
- Coral reef die-off
- Boreal forest shift
**Display**:
- Percentage proximity to tipping point
- Status icons:
  - ○ Low risk (<30%)
  - ◐ Moderate (30-60%)
  - ⚠ High (60-80%)
  - 🔴 Critical (>80%)
- Overall system risk level

### Regional Impacts Map
**Purpose**: Show geographic variation in crisis
**Regions Shown**: Major countries/continents
**Impact Levels**:
- Low: Minimal effects
- Moderate: Manageable stress
- Warning: Significant impacts
- Crisis: Severe disruption
**Visual**: Horizontal bars or heatmap
**Details on Hover**:
- Specific impacts (drought, flooding, heat)
- Population affected
- Economic damage

---

## Advanced Visualizations

### Cascade Risk Network
Show how boundaries interact:
```
Climate Change
    ├─→ Ocean Acidification
    ├─→ Ice Loss → Sea Level
    └─→ Drought → Forest Loss
           └─→ Biodiversity Loss
                  └─→ Ecosystem Collapse
```

### Deployment Timeline
Show realistic timescales:
```
2025 ├──────────────────────────────────┤ 2065
DAC  ░░░░████████████████████──────────── (40yr)
Solar████████████████──────────────────── (25yr)
Fusion░░░░░░░░░░░░░░░░░░░░████████────── (35yr)
```

### Accumulation vs Mitigation Race
```
100% ┤     Accumulation ╱────
     │                ╱╱  ╲__ Collapse
     │             ╱─╱
 50% ├──────────╱─╱  Mitigation
     │        ╱─╱    ╱────────
  0% ┤─────╱────────╱
     └──────────────────────────→
     2025    2035    2045
```

---

## Interaction Patterns

### Deep Dive Mode
Click any system → Detailed view:
- Complete historical data
- Projections with uncertainty
- Contributing factors
- Mitigation options
- Policy recommendations

### Scenario Modeling
"What-if" sliders:
- Adjust technology investment
- Change deployment speed
- Add policy interventions
- See impact on boundaries

### Time Travel
Slider to see past/future states:
- Historical boundary positions
- Accumulation over time
- Technology deployment progress
- Tipping point approach

### Regional Focus
Select region for detailed view:
- Local boundary status
- Specific impacts
- Adaptation measures
- Technology deployment

---

## Alert States

### Boundary Alerts
- **Boundary Crossed**: Red pulse, immediate attention
- **Approaching Boundary**: Amber glow, warning state
- **Tipping Point Near**: Strobe effect, critical warning
- **Safe Zone Exit**: Yellow indicator

### Accumulation Alerts
- **Debt Spiral Starting**: When rate accelerating
- **Crisis Imminent**: <6 months to threshold
- **Golden Age Trap**: High QoL + high accumulation
- **Cascade Risk**: Multiple systems near limits

### Technology Alerts
- **Deployment Too Slow**: Won't prevent crisis
- **Impact Delayed**: Tech deployed but not helping yet
- **Investment Needed**: Critical tech underfunded

---

## Edge Cases

### All Boundaries Safe
- Display "SUSTAINABLE STATE" banner
- Focus on maintaining position
- Show stability duration
- Highlight successful mitigations

### Multiple Boundaries Crossed
- Crisis mode interface
- Focus on most critical systems
- Show cascade predictions
- Emergency response options

### Technology Breakthrough
- Show acceleration potential
- Update deployment timelines
- Recalculate boundary trajectories
- Highlight new possibilities

### Data Uncertainty
- Show confidence intervals
- Mark uncertain measurements
- Provide ranges not points
- Explain data limitations

---

## Performance Optimizations

### Data Processing
- Pre-calculate boundary positions
- Cache tipping point calculations
- Batch update accumulation metrics
- Use Web Workers for projections

### Rendering
- Canvas for boundary visualization
- Throttle sparkline updates
- Progressive loading for regional data
- Optimize animation frames

---

## Mobile Adaptations

### Phone (< 640px)
- Simplified boundary circle
- Stack panels vertically
- Swipe between metrics
- Bottom sheet for details

### Tablet (640-1024px)
- 2-column layout
- Touch-friendly controls
- Condensed visualizations
- Gesture navigation

---

## Implementation Example

```tsx
export function EnvironmentalSystemsDashboard({ gameState }: { gameState: GameState }) {
  const boundaries = calculatePlanetaryBoundaries(gameState);
  const accumulation = gameState.environmentalAccumulation;
  const tippingPoints = assessTippingPoints(gameState);
  const techDeployment = getTechnologyDeployment(gameState.techTreeState);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header */}
      <Header
        title="Planetary Boundaries & Environmental Systems"
        alert={boundaries.crossed > 0}
      />

      {/* Planetary Boundaries */}
      <Panel
        title="Planetary Boundaries Status"
        subtitle={`${boundaries.crossed} of 9 boundaries crossed`}
        alertLevel={boundaries.crossed > 2 ? 'critical' : 'warning'}
      >
        <PlanetaryBoundariesRadar
          boundaries={boundaries}
          showTrajectories={true}
          animate={true}
        />
      </Panel>

      {/* Climate and Accumulation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Panel title="Climate Metrics">
          <ClimateIndicators
            temperature={gameState.climate.temperature}
            co2={gameState.climate.co2}
            oceanPH={gameState.climate.oceanPH}
            ice={gameState.climate.arcticIce}
          />
        </Panel>

        <Panel
          title="Environmental Accumulation"
          alertLevel={accumulation.total > 0.7 ? 'warning' : 'normal'}
        >
          <AccumulationMetrics
            accumulation={accumulation}
            rate={calculateAccumulationRate(accumulation)}
            timeToCrisis={predictCrisisTime(accumulation)}
          />
        </Panel>
      </div>

      {/* Technology Deployment */}
      <Panel title="Technology Deployment Status" className="mt-6">
        <TechnologyDeploymentChart
          technologies={techDeployment}
          showTimelines={true}
          showImpact={true}
        />
      </Panel>

      {/* Tipping Points and Regional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <Panel
          title="Tipping Points"
          alertLevel={tippingPoints.systemRisk === 'CRITICAL' ? 'critical' : 'warning'}
        >
          <TippingPointsList
            points={tippingPoints.points}
            overallRisk={tippingPoints.systemRisk}
          />
        </Panel>

        <Panel title="Regional Impacts">
          <RegionalImpactChart
            regions={gameState.regions}
            impacts={calculateRegionalImpacts(gameState)}
          />
        </Panel>
      </div>
    </div>
  );
}
```

---

This Environmental Systems dashboard reveals the slow-burn crisis of planetary boundaries, where prosperity masks accumulating environmental debt until tipping points trigger cascading ecological collapse, with technology deployment racing against time but constrained by decades-long timescales.
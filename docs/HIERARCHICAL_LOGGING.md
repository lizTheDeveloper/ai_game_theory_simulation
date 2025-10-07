# Hierarchical Logging & Summarization

**Status:** ✅ Implemented  
**Memory:** 19KB for 50 runs (vs ~30MB for full history)

## Overview

The simulation engine now includes hierarchical logging that captures key metrics at multiple granularities without storing full simulation history. This enables:
- Memory-efficient Monte Carlo runs
- Trajectory analysis across time
- Statistical aggregation across runs
- Event frequency analysis

## Logging Levels

### 1. **Full** - Every step
- Captures snapshot every simulation step
- Use for: Detailed single-run analysis
- Memory: High (~500KB per run)

### 2. **Monthly** - Once per month
- Captures snapshot first day of each month
- Use for: Time-series analysis
- Memory: Medium (~50KB per run)

### 3. **Quartile** (Default) - 5 snapshots
- Captures initial + 25% + 50% + 75% + final
- Use for: Monte Carlo aggregation
- Memory: Low (~0.4KB per run)

### 4. **Summary** - Initial & final only
- Captures only start and end states
- Use for: Outcome distribution only
- Memory: Minimal (~0.2KB per run)

## What Gets Captured

### Per-Snapshot Metrics (MetricSnapshot)
```typescript
{
  month: 12,
  // AI metrics
  totalAICapability: 6.23,
  avgAIAlignment: 0.45,
  aiEscaped: 0,
  beneficialActions: 48,
  harmfulActions: 2,
  
  // Economic metrics
  unemployment: 0.95,
  economicStage: 3.4,
  wealthDistribution: 0.58,
  qualityOfLife: 115.2,
  
  // Social metrics
  trustInAI: 0.25,
  socialAdaptation: 0.48,
  socialStability: 0.42,
  
  // Government metrics
  effectiveControl: 0.12,
  activeRegulations: 1,
  governmentLegitimacy: 0.55,
  
  // Outcomes
  utopiaProbability: 0.01,
  dystopiaProbability: 0.12,
  extinctionProbability: 0.87
}
```

### Event Summary
```typescript
{
  totalEvents: 651,
  eventsByType: {
    action: 562,
    milestone: 100,
    policy: 1,
    crisis: 0
  },
  criticalEvents: [
    { month: 6, severity: 'destructive', title: 'AI Escape Attempt', agent: 'Genesis' }
  ]
}
```

### Trajectory
```typescript
{
  aiCapabilityGrowth: +5.03,      // Final - Initial
  unemploymentChange: +0.869,     // +86.9%
  trustChange: -0.554,            // -55.4%
  stageProgression: +3.33         // Stage 0 → 3.33
}
```

## Example Output

### Single Run
```bash
npx tsx scripts/runSimulation.ts --seed 42 --max-months 50
```

Shows: Initial state → Quartile snapshots → Final state → Trajectory

### Monte Carlo (50 runs)
```bash
npx tsx scripts/runSimulation.ts --monte-carlo --runs 50
```

Output:
```
📊 Hierarchical Summary:
  Size: 19.32 KB
  Runs: 50
  Quartile snapshots: 5
  Total events tracked: 33184

📉 Average Trajectory (Quartiles):
==================================
Initial (Month   1): AI=1.19 Unemp=8% Trust=80% Stage=0.1 Ext=37%
Q1      (Month  12): AI=5.87 Unemp=95% Trust=25% Stage=2.0 Ext=43%
Q2      (Month  25): AI=6.23 Unemp=95% Trust=26% Stage=2.8 Ext=43%
Q3      (Month  37): AI=6.23 Unemp=95% Trust=25% Stage=3.1 Ext=42%
Final   (Month  50): AI=6.23 Unemp=95% Trust=25% Stage=3.4 Ext=42%

📊 Average Changes (± std dev):
================================
AI Capability: +5.03 ± 0.28
Unemployment:  +86.9% ± 2.9%
Trust:         -55.4% ± 5.4%
Economic Stage: +3.33 ± 0.38

🎭 Event Analysis:
==================
  action         : 28130 events
  milestone      : 5000 events
  policy         : 54 events
  Critical events: 0.0 per run
```

## Memory Efficiency

| Runs | Full History | Hierarchical Logs | Savings |
|------|-------------|-------------------|---------|
| 1    | ~500 KB     | 0.4 KB           | 99.9%   |
| 50   | ~30 MB      | 19 KB            | 99.9%   |
| 1000 | ~500 MB     | 380 KB           | 99.9%   |
| 10000| ~5 GB       | 3.8 MB           | 99.9%   |

## Key Insights From Logs

### Trajectory Analysis
The quartile progression reveals:
- AI capability grows exponentially in first quartile (1.19 → 5.87)
- Unemployment jumps to 95% by Q1 (crisis!)
- Trust collapses early (-55% average)
- Economic stage progresses steadily (0.1 → 3.4)

### Statistical Validation
Standard deviations show:
- AI capability growth is consistent (σ = 0.28)
- Unemployment highly consistent (σ = 2.9%)
- Trust more variable (σ = 5.4%)
- Economic stage progression varies (σ = 0.38)

### Event Patterns
- ~560 agent actions per run (expected: 4*12*50 = ~600)
- ~100 milestones per run (social adaptation events)
- ~1 major policy per run (UBI implementation)
- Very few critical events (system stabilizes or fails quickly)

## Aggregation Across Runs

The `aggregateLogs()` function combines logs from multiple runs:

```typescript
const aggregated = aggregateLogs(allLogs);

// Get average trajectory across all runs
aggregated.quartileAverages; // Average metrics at each quartile

// Get statistics on changes
aggregated.averageTrajectories; // Mean ± std dev for key metrics

// Get event frequencies
aggregated.eventFrequencies; // Total count by type

// Get outcome distribution
aggregated.outcomes; // { utopia: 0, dystopia: 0, extinction: 100 }
```

## Programmatic Access

```typescript
import { SimulationEngine } from './simulation/engine';

// Run with monthly logging
const engine = new SimulationEngine({ 
  seed: 42, 
  logLevel: 'monthly' // or 'full', 'quartile', 'summary'
});

const result = engine.run(initialState);

// Access hierarchical log
console.log(result.log.snapshots.monthly); // All monthly snapshots
console.log(result.log.trajectory); // Overall changes
console.log(result.log.events.summary); // Event aggregation
```

## Export Format

The JSON export includes:
```json
{
  "totalRuns": 50,
  "outcomeDistribution": { "utopia": 0, "dystopia": 0, "extinction": 100 },
  "trajectories": {
    "aiCapabilityGrowth": { "mean": 5.03, "std": 0.28 },
    "unemploymentChange": { "mean": 0.869, "std": 0.029 }
  },
  "quartileProgression": [
    { "quartile": "initial", "month": 1, "aiCapability": "1.19", ... },
    { "quartile": "Q1", "month": 12, "aiCapability": "5.87", ... }
  ],
  "eventAnalysis": {
    "totalEvents": 33184,
    "byType": { "action": 28130, "milestone": 5000, ... },
    "criticalEventsPerRun": 0.0
  },
  "runSummaries": [
    { "runId": 0, "seed": 42, "outcome": "extinction", "months": 50, ... }
  ]
}
```

## Benefits

### 1. **Memory Scalable**
- Run 10,000+ simulations without running out of memory
- 99.9% memory savings vs full history

### 2. **Trajectory Visibility**
- See how metrics evolve over time
- Identify inflection points
- Compare quartile progressions

### 3. **Statistical Analysis**
- Mean and standard deviation for all metrics
- Confidence in average behaviors
- Identify high-variance parameters

### 4. **Event Tracking**
- Frequency of different event types
- Critical event identification
- Pattern recognition across runs

### 5. **Research-Ready**
- Export to JSON for analysis
- Suitable for visualization tools
- Publication-quality data

## Use Cases

### Game Development
- **Balance Testing**: Run 1000 simulations to test parameter changes
- **Scenario Validation**: Verify economic model predictions
- **Outcome Tuning**: Adjust to achieve desired outcome distribution

### Research & Analysis
- **Parameter Optimization**: Find settings that maximize utopia probability
- **Sensitivity Analysis**: Identify which parameters matter most
- **Trajectory Clustering**: Group runs by similar progressions

### Visualization
- **Time Series**: Plot quartile averages over time
- **Distribution Plots**: Show variance in trajectories
- **Event Timelines**: Visualize when events occur

## Future Enhancements

- [ ] Configurable snapshot intervals
- [ ] Custom metric tracking
- [ ] Real-time progress streaming
- [ ] Incremental file writing (for very long runs)
- [ ] Parallel log aggregation
- [ ] Automatic anomaly detection

## Conclusion

Hierarchical logging provides the best of both worlds:
- **Detailed enough** for meaningful analysis
- **Compact enough** for large-scale Monte Carlo
- **Structured** for easy aggregation
- **Exportable** for external tools

With 19KB per 50 runs, you can run 100,000 simulations and still only use ~38MB of memory. Perfect for scientific simulation and game balance analysis!


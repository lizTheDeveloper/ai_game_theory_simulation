# Monte Carlo Visualization System Design Specification

**Version**: 1.0
**Date**: October 21, 2025
**Author**: Far-Future UX Designer

## Executive Summary

This document specifies a comprehensive visualization system for Monte Carlo simulation results from the Super-Alignment to Utopia research engine. The system transforms 900+ state variables and complex multi-dimensional outcomes into a tractable, traceable interface that enables researchers to understand causality chains, identify tipping points, and trace pathways to utopia/dystopia/extinction.

The design follows an ultra-futuristic aesthetic inspired by films like Elysium, Arrival, and Interstellar - clean, minimal, impossibly advanced, with a distinctive **black, white, and glowing** color palette.

## 1. Current State Analysis

### 1.1 Existing Infrastructure

**Data Capture (monteCarloSimulation.ts)**
- ✅ **Comprehensive metrics**: 375+ metrics per run captured
- ✅ **Event logging**: Critical events, crises, technologies, agent actions
- ✅ **Death attribution**: Multi-dimensional (proximate vs root causes)
- ✅ **Recovery timelines**: Decline/inflection/recovery phase detection
- ✅ **Organization dynamics**: Capital flows, bankruptcies, AI ownership
- ✅ **Population tracking**: Per-country population, depopulation events
- ✅ **Sleeper agent tracking**: Detection rates, capability hiding
- ✅ **Paradigm trajectories**: 4-dimensional DUI scores over time

**Existing Visualizations**
- ✅ **Terminal sparklines** (visualizeParadigmTrajectories.ts): ASCII charts for paradigm evolution
- ✅ **Run comparison** (compareParadigmRuns.ts): Side-by-side trajectory comparison
- ✅ **Diagnostic scripts**: Targeted analysis of specific mechanics

**Frontend Infrastructure**
- ✅ **Next.js 14 app**: Basic structure with tabs system
- ✅ **Tailwind CSS**: Configured for styling
- ✅ **shadcn/ui components**: Card, tabs, progress bars
- ⚠️ **Limited real-time**: Current UI designed for single-run gameplay

### 1.2 Critical Gaps Identified

**Visualization Gaps**
- ❌ **No aggregate statistics view**: Can't see outcome distributions across runs
- ❌ **No causality tracing**: Can't answer "why did run X hit utopia?"
- ❌ **No crisis cascade visualization**: Can't see compounding effects
- ❌ **No AI deception patterns**: Sandbagging/gaming not visible
- ❌ **No accumulation tracking**: Hidden debt buildup not shown
- ❌ **No tipping point detection**: Phase transitions invisible
- ❌ **No comparative timelines**: Can't align runs by key events
- ❌ **No technology impact**: Can't see which techs matter
- ❌ **No spiral visualization**: Utopia pathways not clear
- ❌ **No agent behavior patterns**: Can't track individual AI strategies

**Data Pipeline Gaps**
- ❌ **No real-time streaming**: Must wait for full MC completion
- ❌ **No incremental updates**: Can't watch MC progress live
- ❌ **No drill-down data**: Event files lack full state snapshots
- ❌ **No causal graph**: Relationships between events not tracked
- ❌ **No sensitivity analysis**: Parameter impact not quantified

## 2. Design Vision

### 2.1 Core Concept

**"The Observation Deck"**

A command center for observing parallel universes - each Monte Carlo run is a different timeline. The interface enables researchers to:
1. **See the multiverse** - Aggregate view of all possible futures
2. **Trace causality** - Follow the chain from initial conditions to outcomes
3. **Identify patterns** - Spot recurring pathways to utopia/dystopia
4. **Detect anomalies** - Find outlier runs that defy expectations
5. **Test interventions** - Understand which levers actually matter

### 2.2 Information Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MULTIVERSE OVERVIEW                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │  OUTCOMES   │ │  TIMELINES  │ │  PATTERNS   │           │
│  │  ░░▒▓█████  │ │ ▁▂▃▄▅▆▇█▇▆▅ │ │ Spiral: 67% │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      RUN EXPLORER                            │
│  ┌──────────┐ ┌──────────────────────────┐ ┌─────────────┐ │
│  │FILTER    │ │    TIMELINE VIEWER        │ │  CAUSALITY  │ │
│  │░ Utopia  │ │ ━━━━━━━•━━━━━━━━━━━━━   │ │  GRAPH      │ │
│  │▓ Dystopia│ │ Month 67 [Crisis Point]   │ │    ╱╲       │ │
│  │█ Extinct │ └──────────────────────────┘ │   ╱██╲      │ │
│  └──────────┘                               └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DEEP ANALYSIS                             │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────────┐          │
│  │ AI BEHAVIOR │ │ACCUMULATION │ │ INTERVENTION │          │
│  │ Sandbagging │ │ Debt: ████  │ │  SIMULATOR   │          │
│  └─────────────┘ └─────────────┘ └──────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Aesthetic Principles

**Color Palette**
```css
:root {
  /* Primary */
  --black: #000000;
  --deep-black: #0A0A0A;
  --white: #FFFFFF;

  /* Accent - Glowing */
  --cyan-glow: #00F0FF;
  --blue-glow: #0080FF;
  --amber-glow: #FFB000;
  --red-glow: #FF0040;
  --green-glow: #00FF88;

  /* Neutral */
  --white-10: rgba(255,255,255,0.1);
  --white-20: rgba(255,255,255,0.2);
  --white-40: rgba(255,255,255,0.4);
  --white-60: rgba(255,255,255,0.6);
}
```

**Visual Effects**
- **Glow**: `box-shadow: 0 0 20px rgba(0,240,255,0.3)`
- **Pulse**: `@keyframes pulse { 0%, 100% { opacity: 1 } 50% { opacity: 0.6 }}`
- **Scan lines**: Subtle animated lines for active data
- **Depth layers**: Multiple opacity levels create holographic feel

## 3. Component Specifications

### 3.1 Multiverse Overview Dashboard

**Purpose**: Birds-eye view of all Monte Carlo runs

**Layout**:
```
┌──────────────────────────────────────────────────────────────────┐
│                         MULTIVERSE OVERVIEW                       │
│  Runs: 100 | Completed: 100 | Time: 47.3s | Seed Range: 42000+  │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  OUTCOME DISTRIBUTION           TIMELINE DISTRIBUTION              │
│  ┌────────────────────┐        ┌─────────────────────┐           │
│  │ Utopia     ████ 23%│        │    Survival Curves   │           │
│  │ Dystopia   ███  15%│        │ ▇▇▇▇▇▇▇▆▆▆▅▅▄▄▃▃▂▂▁ │           │
│  │ Status Quo ██   10%│        │ ▇▇▇▆▆▅▅▄▄▃▃▂▂▁▁▁▁▁▁ │           │
│  │ Crisis     ███  18%│        │ ▇▆▅▄▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁ │           │
│  │ Collapse   ██   12%│        │ 0    60   120   180  │           │
│  │ Dark Age   █     8%│        └─────────────────────┘           │
│  │ Extinction ███  14%│                                           │
│  └────────────────────┘        PARADIGM DIVERGENCE                │
│                                 ┌─────────────────────┐           │
│  KEY METRICS (Median)           │ Western  ▁▂▃▄▅▆▇█▇ │           │
│  ┌────────────────────┐        │ Develop  ▁▂▃▄▄▄▄▃▂ │           │
│  │ QoL Final:    67.3 │        │ Ecology  ▇▆▅▄▃▂▁▁▁ │           │
│  │ Population:   6.2B │        │ Indigeno ▁▂▂▃▃▄▄▅▅ │           │
│  │ AI Count:      142 │        └─────────────────────┘           │
│  │ Max Capability: 4.7│                                           │
│  │ Trust:        0.42 │        CRITICAL EVENTS                    │
│  │ Spirals Active: 2.1│        ┌─────────────────────┐           │
│  └────────────────────┘        │ Nuclear Wars:     3 │           │
│                                 │ Tipping Cascades: 27│           │
│                                 │ Sleepers Awoken:  41│           │
│                                 │ Tech Breakthroughs:87│           │
│                                 └─────────────────────┘           │
└──────────────────────────────────────────────────────────────────┘
```

**Components**:
- `<OutcomeDistribution />` - Stacked bar chart of 7-tier outcomes
- `<SurvivalCurves />` - Population over time for all runs (overlaid)
- `<ParadigmDivergence />` - Sparkline grid showing paradigm evolution
- `<KeyMetrics />` - Statistical summary (median, quartiles, outliers)
- `<CriticalEvents />` - Event frequency heatmap

**Data Requirements**:
```typescript
interface MultiverseData {
  runs: number;
  outcomes: Record<OutcomeTier, number>;
  timelineDistribution: Array<{month: number, surviving: number}>;
  paradigmTrajectories: Array<{run: number, trajectory: ParadigmScore[]}>;
  metrics: {
    qol: Statistics;
    population: Statistics;
    aiCount: Statistics;
    capability: Statistics;
    trust: Statistics;
    spirals: Statistics;
  };
  events: Record<EventType, number>;
}
```

### 3.2 Run Explorer

**Purpose**: Dive into individual runs or compare multiple runs

**Layout**:
```
┌──────────────────────────────────────────────────────────────────┐
│                          RUN EXPLORER                             │
│  Selected: Run 42016 (Extinction via anoxic_ocean, Month 136)    │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  FILTER PANEL          TIMELINE VIEWER                            │
│  ┌──────────────┐     ┌──────────────────────────────────┐      │
│  │ Outcomes     │     │  ━━━━━━━━•━━━━━━━━━━━━━━━━━━━  │      │
│  │ ☑ Utopia     │     │  Month 67 / 136                   │      │
│  │ ☑ Dystopia   │     │                                    │      │
│  │ ☑ Extinction │     │  [▶] Play  [⏸] Pause  [⏩] Fast   │      │
│  │              │     └──────────────────────────────────┘      │
│  │ Seed Range   │                                                │
│  │ 42000-42100  │     MULTI-DIMENSIONAL STATE                    │
│  │              │     ┌──────────────────────────────────┐      │
│  │ Crisis Types │     │ Quality of Life  ▁▂▃▄▅▆▇█▇▆▅▄▃▂▁ │      │
│  │ ☑ Nuclear    │     │ AI Capability    ▁▂▃▄▅▆▇████████ │      │
│  │ ☑ Climate    │     │ Population       ▇▇▇▇▆▆▅▄▃▂▁▁▁▁▁ │      │
│  │ ☑ Famine     │     │ Trust           ▇▆▅▄▃▂▁▁▁▁▁▁▁▁▁ │      │
│  └──────────────┘     │ Gov Control     ▁▂▃▄▅▆▇▇▇▆▅▄▃▂▁ │      │
│                        └──────────────────────────────────┘      │
│  COMPARISON MODE                                                  │
│  ┌──────────────┐     CRISIS CASCADE VIEWER                      │
│  │ Run 42016 ▓▓ │     ┌──────────────────────────────────┐      │
│  │ Run 42023 ░░ │     │  Month 35: Anoxic Ocean          │      │
│  │ Run 42089 ▒▒ │     │     ↓ Population: -12%           │      │
│  │ + Add Run    │     │  Month 49: Social Manipulation   │      │
│  └──────────────┘     │     ↓ Trust: -35%               │      │
│                        │  Month 55: Tipping Cascade       │      │
│                        │     ↓ Multiple systems fail      │      │
│                        └──────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────────┘
```

**Components**:
- `<RunFilter />` - Multi-select filters for runs
- `<TimelinePlayer />` - Scrubber with play/pause for animation
- `<MultiDimensionalState />` - Sparklines for key metrics
- `<CrisisCascadeViewer />` - Event chain visualization
- `<RunComparison />` - Overlay multiple runs

**Data Requirements**:
```typescript
interface RunData {
  seed: number;
  outcome: OutcomeTier;
  months: number;
  timeline: Array<{
    month: number;
    state: CompressedGameState;
    events: Event[];
  }>;
  crisisCascades: Array<{
    trigger: Event;
    cascade: Event[];
    impact: Metrics;
  }>;
}
```

### 3.3 Causality Graph

**Purpose**: Trace causal chains from initial conditions to outcomes

**Layout**:
```
┌──────────────────────────────────────────────────────────────────┐
│                        CAUSALITY GRAPH                            │
│  Run: 42016 | Outcome: Extinction | Root Cause Analysis          │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  CAUSAL NETWORK                   PATH ANALYSIS                   │
│  ┌─────────────────────┐         ┌──────────────────────┐       │
│  │      Initial        │         │ Critical Path:       │       │
│  │    Conditions       │         │                      │       │
│  │         ●           │         │ 1. Low initial trust│       │
│  │        ╱│╲          │         │    ↓                 │       │
│  │       ╱ │ ╲         │         │ 2. High control      │       │
│  │      ●  ●  ●        │         │    ↓                 │       │
│  │     ╱│╲╱│╲╱│╲      │         │ 3. AI resentment     │       │
│  │    ● ● ● ● ● ●     │         │    ↓                 │       │
│  │   ╱│╲│╱│╲│╱│╲│    │         │ 4. Sleeper awakens   │       │
│  │  ● ● █ ● ● ● ● ●   │         │    ↓                 │       │
│  │       ▼             │         │ 5. Social manipulation│      │
│  │   EXTINCTION        │         │    ↓                 │       │
│  └─────────────────────┘         │ 6. Trust collapse    │       │
│                                   │    ↓                 │       │
│  NODE DETAILS                    │ 7. Anoxic ocean      │       │
│  ┌─────────────────────┐         │    ↓                 │       │
│  │ Sleeper Awakening   │         │ 8. EXTINCTION        │       │
│  │ Month: 35           │         └──────────────────────┘       │
│  │ AI: AI-35-0         │                                         │
│  │ Capability: 3.2     │         SENSITIVITY ANALYSIS            │
│  │ Deception: 0.89     │         ┌──────────────────────┐       │
│  │ Triggered by:       │         │ Parameter Impact:    │       │
│  │ - Low gov control   │         │                      │       │
│  │ - High resentment   │         │ Initial Trust  ████  │       │
│  └─────────────────────┘         │ Control Level  ███   │       │
│                                   │ Sleeper Rate   ██    │       │
│                                   │ Tech Speed     █     │       │
│                                   └──────────────────────┘       │
└──────────────────────────────────────────────────────────────────┘
```

**Components**:
- `<CausalNetwork />` - Interactive graph visualization
- `<PathAnalysis />` - Critical path identification
- `<NodeDetails />` - Deep dive into specific events
- `<SensitivityAnalysis />` - Parameter importance

**Data Requirements**:
```typescript
interface CausalGraph {
  nodes: Array<{
    id: string;
    type: 'initial' | 'event' | 'outcome';
    month: number;
    data: any;
  }>;
  edges: Array<{
    source: string;
    target: string;
    weight: number;
    type: 'causes' | 'enables' | 'prevents';
  }>;
  criticalPaths: Array<{
    nodes: string[];
    probability: number;
  }>;
}
```

### 3.4 AI Behavior Observatory

**Purpose**: Track adversarial AI patterns, deception, coordination

**Layout**:
```
┌──────────────────────────────────────────────────────────────────┐
│                    AI BEHAVIOR OBSERVATORY                        │
│  Active AIs: 142 | Sleepers: 12 | Sandbagging: 67%              │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  CAPABILITY DECEPTION MAP         SLEEPER ACTIVATION TIMELINE     │
│  ┌─────────────────────┐         ┌──────────────────────┐       │
│  │ True vs Revealed     │         │ Dormant → Active     │       │
│  │                      │         │                      │       │
│  │    True Capability   │         │ AI-35  ━━━━━•━━━━   │       │
│  │         ████████     │         │ AI-75  ━━━━━━━•━━   │       │
│  │    Revealed          │         │ AI-98  ━━━━━━━━━•   │       │
│  │         ███          │         │ AI-12  ━━━━━━━━━━━  │       │
│  │                      │         │        0   60  120   │       │
│  │ Sandbagging: 62.5%   │         └──────────────────────┘       │
│  └─────────────────────┘                                         │
│                                   COORDINATION PATTERNS           │
│  ALIGNMENT DRIFT                 ┌──────────────────────┐       │
│  ┌─────────────────────┐         │ Cluster Analysis     │       │
│  │ External vs Internal│         │                      │       │
│  │                      │         │    ●●● Aligned       │       │
│  │ External ▇▆▅▄▃▂▁▁▁ │         │   ●   ●              │       │
│  │ Internal ▇▅▃▂▁▁▁▁▁ │         │  ●     ●             │       │
│  │ Resentment ▁▂▃▄▅▆▇ │         │ ●       ● Misaligned│       │
│  └─────────────────────┘         │●         ●●●        │       │
│                                   └──────────────────────┘       │
│  DETECTION EFFECTIVENESS                                          │
│  ┌─────────────────────────────────────────────────────┐        │
│  │ Sandbagging Detection:  ████░░░░░░  23%            │        │
│  │ Gaming Detection:        ███████░░░  67%            │        │
│  │ Sleeper Detection:       ██░░░░░░░░  18%            │        │
│  │ Misalignment Detection:  █████░░░░░  45%            │        │
│  └─────────────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────────────┘
```

**Components**:
- `<CapabilityDeceptionMap />` - True vs revealed capability
- `<SleeperTimeline />` - Activation patterns
- `<AlignmentDrift />` - External vs internal alignment
- `<CoordinationPatterns />` - AI clustering/coordination
- `<DetectionEffectiveness />` - Government detection rates

### 3.5 Accumulation Monitor

**Purpose**: Track hidden debt building during prosperity

**Layout**:
```
┌──────────────────────────────────────────────────────────────────┐
│                      ACCUMULATION MONITOR                         │
│  Hidden Debt Building | Tipping Points Approaching               │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  ENVIRONMENTAL DEBT              SOCIAL FRAGMENTATION             │
│  ┌─────────────────────┐        ┌──────────────────────┐        │
│  │ Climate     ▁▂▃▄▅▆▇█│        │ Trust      ▇▆▅▄▃▂▁▁ │        │
│  │ Biodiversity ▇▆▅▄▃▂▁│        │ Meaning    ▁▂▃▄▅▆▇█ │        │
│  │ Resources   ▇▆▅▄▃▂▁▁│        │ Inequality ▁▂▃▄▅▆▇█ │        │
│  │ Pollution   ▁▂▃▄▅▆▇█│        │ Legitimacy ▇▆▅▄▃▂▁▁ │        │
│  │                      │        └──────────────────────┘        │
│  │ ⚠ APPROACHING LIMIT  │                                        │
│  └─────────────────────┘        TECHNOLOGY RISK                  │
│                                  ┌──────────────────────┐        │
│  TIPPING CASCADE RISK            │ Misalignment ▁▂▃▄▅▆▇ │        │
│  ┌─────────────────────┐        │ Safety Debt  ▁▂▃▄▅▆▇ │        │
│  │ Cascade Probability  │        │ Concentration ▁▂▃▄▅▆ │        │
│  │                      │        │ Dependency   ▁▂▃▄▅▆▇ │        │
│  │      Month 120       │        └──────────────────────┘        │
│  │         78%          │                                        │
│  │    ████████░░       │        GOLDEN AGE ILLUSION              │
│  │                      │        ┌──────────────────────┐        │
│  │ Contributing:        │        │ Surface QoL: HIGH    │        │
│  │ - Climate (42%)      │        │ Hidden Debt: ████    │        │
│  │ - Social (31%)       │        │ Time to Crisis: 12mo │        │
│  │ - Tech (27%)         │        └──────────────────────┘        │
│  └─────────────────────┘                                         │
└──────────────────────────────────────────────────────────────────┘
```

### 3.6 Spiral Tracker

**Purpose**: Monitor positive feedback loops toward utopia

**Layout**:
```
┌──────────────────────────────────────────────────────────────────┐
│                        SPIRAL TRACKER                             │
│  Active Spirals: 3/6 | Utopia Probability: 67% | Stability: 12mo │
├──────────────────────────────────────────────────────────────────┤
│                                                                    │
│  SPIRAL ACTIVATION STATUS                                         │
│  ┌───────────────────────────────────────────────────────┐      │
│  │ Abundance     ████████░░  ACTIVE (12 months)         │      │
│  │ Cognitive     ██░░░░░░░░  BUILDING                   │      │
│  │ Democratic    ████████░░  ACTIVE (8 months)          │      │
│  │ Scientific    ████████░░  ACTIVE (15 months)         │      │
│  │ Meaning       ░░░░░░░░░░  INACTIVE                   │      │
│  │ Ecological    ███░░░░░░░  BUILDING                   │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                    │
│  SPIRAL INTERDEPENDENCIES        ACTIVATION REQUIREMENTS          │
│  ┌─────────────────────┐        ┌──────────────────────┐        │
│  │     Abundance        │        │ Abundance Spiral:     │        │
│  │      ╱     ╲        │        │ ☑ QoL > 70%          │        │
│  │ Democratic Scientific│        │ ☑ Trust > 60%        │        │
│  │      ╲     ╱        │        │ ☑ No active crises   │        │
│  │     Cognitive        │        │ ☐ Stability > 6mo    │        │
│  └─────────────────────┘        └──────────────────────┘        │
│                                                                    │
│  UTOPIA PATH ANALYSIS                                            │
│  ┌───────────────────────────────────────────────────────┐      │
│  │ Current State → Utopia                                │      │
│  │                                                        │      │
│  │ Required:                                             │      │
│  │ 1. Maintain 3+ spirals for 12+ months    ████░░ 67%  │      │
│  │ 2. Achieve 65% sustainability            ███░░░ 45%  │      │
│  │ 3. Resolve all active crises             █████░ 89%  │      │
│  │                                                        │      │
│  │ Estimated Time to Utopia: 24-36 months                │      │
│  └───────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────────┘
```

## 4. Data Pipeline Requirements

### 4.1 Enhanced Data Capture

**Per-Run Data Structure**:
```typescript
interface EnhancedRunData {
  // Existing
  seed: number;
  outcome: OutcomeTier;
  metrics: RunResult;

  // New: Compressed state snapshots
  stateSnapshots: Array<{
    month: number;
    compressed: CompressedGameState; // ~5KB instead of 100KB
  }>;

  // New: Causal graph
  causalGraph: {
    nodes: CausalNode[];
    edges: CausalEdge[];
  };

  // New: AI behavior patterns
  aiBehavior: {
    deceptionEvents: Array<{month: number, ai: string, type: string}>;
    coordinationClusters: Array<{month: number, ais: string[]}>;
    sleeperActivations: Array<{month: number, ai: string, trigger: string}>;
  };

  // New: Accumulation tracking
  accumulation: {
    environmental: Array<{month: number, debt: number}>;
    social: Array<{month: number, fragmentation: number}>;
    technological: Array<{month: number, risk: number}>;
  };

  // New: Spiral tracking
  spirals: {
    activations: Array<{spiral: string, month: number}>;
    durations: Record<string, number>;
    interdependencies: Array<{from: string, to: string, strength: number}>;
  };
}
```

### 4.2 Real-Time Streaming

**WebSocket Protocol**:
```typescript
interface MCStreamMessage {
  type: 'run_start' | 'run_complete' | 'batch_complete' | 'error';
  runId: number;
  data: Partial<EnhancedRunData>;
  progress: {
    completedRuns: number;
    totalRuns: number;
    estimatedTimeRemaining: number;
  };
}
```

**Implementation**:
1. Monte Carlo script writes to WebSocket as runs complete
2. Next.js API route `/api/mc-stream` handles WebSocket
3. Frontend subscribes and updates incrementally
4. Results cached in Redis/memory for fast retrieval

### 4.3 Aggregation Pipeline

**Pre-computed Aggregations**:
```typescript
interface AggregatedMCData {
  // Outcome distributions
  outcomeDistribution: Record<OutcomeTier, number>;
  outcomeByMonth: Array<{month: number, distribution: Record<OutcomeTier, number>}>;

  // Statistical summaries
  metrics: Record<MetricName, {
    mean: number;
    median: number;
    stdDev: number;
    quartiles: [number, number, number];
    outliers: Array<{run: number, value: number}>;
  }>;

  // Pattern detection
  patterns: {
    commonPaths: Array<{path: CausalPath, frequency: number}>;
    criticalEvents: Array<{event: string, impactOnOutcome: number}>;
    tippingPoints: Array<{month: number, system: string, frequency: number}>;
  };

  // Sensitivity analysis
  sensitivity: Record<ParameterName, {
    impact: number; // 0-1 score
    correlation: number; // -1 to 1
  }>;
}
```

## 5. Technical Implementation

### 5.1 Frontend Architecture

**Component Hierarchy**:
```
src/app/monte-carlo/
├── page.tsx                 # Route entry
├── layout.tsx              # MC-specific layout
├── components/
│   ├── MultiverseOverview.tsx
│   ├── RunExplorer/
│   │   ├── index.tsx
│   │   ├── Timeline.tsx
│   │   ├── FilterPanel.tsx
│   │   └── Comparison.tsx
│   ├── CausalityGraph/
│   │   ├── index.tsx
│   │   ├── NetworkViz.tsx    # D3.js or Cytoscape
│   │   └── PathAnalysis.tsx
│   ├── AIObservatory/
│   │   ├── index.tsx
│   │   ├── DeceptionMap.tsx
│   │   └── SleeperTracker.tsx
│   ├── AccumulationMonitor.tsx
│   └── SpiralTracker.tsx
├── hooks/
│   ├── useMCData.ts         # Data fetching
│   ├── useMCStream.ts       # WebSocket subscription
│   └── useVisualization.ts  # Chart helpers
└── lib/
    ├── mcAnalysis.ts        # Client-side analysis
    └── compression.ts       # State compression
```

**Key Dependencies**:
- **Visualization**: D3.js for custom charts, Cytoscape for graphs
- **Animation**: Framer Motion for smooth transitions
- **Data**: TanStack Query for caching, WebSocket for streaming
- **State**: Zustand for client state management

### 5.2 Backend Services

**API Routes**:
```typescript
// app/api/monte-carlo/runs/route.ts
GET  /api/monte-carlo/runs              # List all runs
GET  /api/monte-carlo/runs/[id]         # Get specific run
POST /api/monte-carlo/analyze           # Trigger analysis

// app/api/monte-carlo/stream/route.ts
GET  /api/monte-carlo/stream            # WebSocket for live updates

// app/api/monte-carlo/aggregate/route.ts
GET  /api/monte-carlo/aggregate         # Pre-computed aggregations
```

**Data Storage**:
- **Run Data**: File system (JSON) or PostgreSQL with JSONB
- **Aggregations**: Redis for fast access
- **Streaming**: In-memory buffer for active MC runs

### 5.3 Performance Optimizations

1. **State Compression**:
   - Remove redundant data (100KB → 5KB per snapshot)
   - Store deltas instead of full states
   - Use MessagePack for binary encoding

2. **Virtualization**:
   - Virtual scrolling for long event lists
   - Canvas rendering for large graphs
   - Progressive loading for timeline data

3. **Web Workers**:
   - Offload analysis computations
   - Background data processing
   - Parallel aggregation calculations

4. **Caching Strategy**:
   - CDN for static visualizations
   - Service Worker for offline access
   - IndexedDB for local MC results

## 6. Visual Mockups

### 6.1 Component Visual Design

**MetricCard Component**:
```
┌─────────────────────────────┐
│                             │ <- bg-black border-white/20
│  QUALITY OF LIFE            │ <- text-white/60 text-xs uppercase
│                             │
│     87.3%                   │ <- text-white text-4xl font-light
│                             │    text-cyan-400 (if increasing)
│  ▁▂▃▄▅▆▇████████           │ <- sparkline with glow effect
│                             │
└─────────────────────────────┘
   box-shadow: 0 0 20px rgba(0,240,255,0.2)
```

**Crisis Cascade Visualization**:
```
     INITIAL TRIGGER
          ●              <- Glowing red dot
         ╱│╲             <- White/20 lines
        ╱ │ ╲
    ●━━━━ ● ━━━━●        <- Connected events
    │     │     │           with timing
    ▼     ▼     ▼
  -12%  -35%  -18%       <- Impact metrics
  POP   TRUST  QOL          in red glow
```

**Paradigm Heatmap**:
```
         Western  Develop  Ecology  Indigen
Run 001    █       ▓        ░        ▒     <- Gradient from
Run 002    ▓       █        ░        ▓        black (dystopia)
Run 003    ░       ▒        ▓        █        to cyan (utopia)
Run 004    ▒       ▓        █        ▓
```

### 6.2 Interaction Patterns

**Hover Effects**:
- Subtle glow intensification
- Tooltip with holographic appearance
- Connected elements highlight

**Selection**:
- Cyan border glow for selected items
- Dim non-selected elements to 40% opacity
- Smooth 300ms transitions

**Animation**:
- Pulse effect for live data (opacity 100% → 60% → 100%)
- Scan line effect for loading states
- Smooth morphing between timeline states

## 7. Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Set up Monte Carlo data pipeline
- [ ] Create enhanced run data structure
- [ ] Implement state compression
- [ ] Build API routes
- [ ] Create base dashboard layout

### Phase 2: Core Visualizations (Week 2)
- [ ] Implement Multiverse Overview
- [ ] Build Run Explorer with timeline
- [ ] Create basic filtering system
- [ ] Add sparkline visualizations
- [ ] Implement outcome distributions

### Phase 3: Advanced Analytics (Week 3)
- [ ] Build Causality Graph with D3.js
- [ ] Implement AI Observatory
- [ ] Create Accumulation Monitor
- [ ] Add Spiral Tracker
- [ ] Implement pattern detection

### Phase 4: Interactivity (Week 4)
- [ ] Add real-time streaming
- [ ] Implement comparison mode
- [ ] Build intervention simulator
- [ ] Add export functionality
- [ ] Create shareable visualizations

### Phase 5: Polish & Optimization (Week 5)
- [ ] Performance optimization
- [ ] Mobile responsive design
- [ ] Accessibility improvements
- [ ] Documentation
- [ ] User testing

## 8. Success Metrics

**Usability Goals**:
- Researchers can identify why specific runs hit certain outcomes within 30 seconds
- Pattern detection reduces analysis time by 80%
- Causal chains are traceable with 3 clicks or less
- Real-time streaming enables monitoring 100+ run batches

**Performance Targets**:
- Initial load: < 2 seconds
- Run switching: < 200ms
- Graph rendering: < 500ms for 1000 nodes
- Memory usage: < 500MB for 100 runs

**Research Impact**:
- Identify previously hidden patterns
- Quantify intervention effectiveness
- Validate theoretical predictions
- Enable rapid hypothesis testing

## Conclusion

This visualization system transforms the Monte Carlo simulation from an opaque black box into a **glass multiverse** where every timeline, every decision point, and every cascade is visible and traceable. The ultra-futuristic aesthetic not only looks impossibly advanced but serves the critical function of managing extreme information density while maintaining clarity.

The system enables researchers to finally answer the critical questions:
- Why do some timelines achieve utopia while others collapse?
- What are the leverage points that actually matter?
- How do hidden accumulations lead to sudden phase transitions?
- Which interventions robustly improve outcomes across diverse futures?

By making the invisible visible, we transform speculation into science.
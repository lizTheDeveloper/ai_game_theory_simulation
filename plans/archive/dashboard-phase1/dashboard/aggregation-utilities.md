# Subplan -1B: Aggregation Utilities

**Phase:** -1 (Server-Side Aggregation API)
**Agent Assignment:** Agent 2
**Duration:** 2-3 days
**Priority:** CRITICAL (blocks all domain API endpoints)
**Dependencies:** Subplan -1A complete (needs cache/error utilities)

---

## Context & Research

**Problem:** GameState is 900+ lines with 40+ systems, can't load all in browser
**Solution:** Aggregation functions that reduce data to essential summaries

### Key Documents

- **GameState Structure:** `src/types/game.ts` (900+ lines, 40+ systems)
- **Architecture Review:** `reviews/dashboard_architecture_20251022.md` (CRITICAL Issue #1)
- **Design Spec:** `docs/design/dashboard-redesign-spec.md` (Data requirements)
- **Research:** `research/dashboard_visualization_best_practices_20251022.md` (Aggregation fallacy)

### Research Insight: Aggregation Fallacy

**From Railsback & Grimm (2019):**
> "Aggregating agent-based model outputs obscures bimodal distributions, outliers, and heterogeneity critical to understanding system dynamics."

**Implication:** We must provide BOTH aggregates AND distributions (violin plots, histograms)

**Example:**
```typescript
// ❌ BAD - Hides bimodal distribution
const avgAlignment = mean(agents.map(a => a.trueAlignment)); // 0.5 (meaningless!)

// ✅ GOOD - Shows distribution
const alignmentDist = {
  mean: 0.5,
  median: 0.6,
  quartiles: [0.2, 0.6, 0.8],
  violinPlotBins: [...], // For visualization
  outliers: agents.filter(a => a.trueAlignment < 0.1), // Highlight misaligned
};
```

---

## Objectives

Create aggregation functions that transform full GameState into dashboard-ready summaries:

1. **Time Windowing:** Extract last N months of data
2. **Regional Aggregation:** Roll up 15 countries into summaries
3. **Agent Distribution:** Convert 20 agents into violin plot data
4. **Planetary Boundaries:** Aggregate 9 boundaries with thresholds
5. **Quality of Life:** 17-dimensional × 5-tier distribution
6. **Crisis Systems:** Active crises with severity/affected population

---

## Technical Implementation

### Directory Structure

```
src/lib/dashboard/
├── aggregation/
│   ├── time.ts              # Time windowing utilities
│   ├── regional.ts          # Regional aggregation
│   ├── agents.ts            # AI agent distribution
│   ├── environment.ts       # Planetary boundaries
│   ├── qualityOfLife.ts     # QoL distribution
│   ├── government.ts        # Government systems
│   ├── crises.ts            # Crisis systems
│   ├── technology.ts        # Tech tree
│   └── index.ts             # Re-exports
└── types.ts                 # Aggregated data types
```

### 1. Time Windowing Utilities

**`src/lib/dashboard/aggregation/time.ts`**
```typescript
import { GameState } from '@/types/game';

export interface TimeWindow {
  startMonth: number;
  endMonth: number;
  months: number[];
}

/**
 * Get last N months of data
 */
export function getTimeWindow(
  state: GameState,
  range: number = 12
): TimeWindow {
  const currentMonth = state.currentMonth;
  const startMonth = Math.max(0, currentMonth - range);
  const months = Array.from(
    { length: currentMonth - startMonth + 1 },
    (_, i) => startMonth + i
  );

  return { startMonth, endMonth: currentMonth, months };
}

/**
 * Extract time series data for a metric
 */
export function extractTimeSeries<T>(
  history: T[],
  window: TimeWindow
): T[] {
  return history.slice(window.startMonth, window.endMonth + 1);
}

/**
 * Calculate trend (increasing, decreasing, stable)
 */
export function calculateTrend(
  values: number[],
  threshold: number = 0.05
): 'increasing' | 'decreasing' | 'stable' {
  if (values.length < 2) return 'stable';

  const recent = values.slice(-6); // Last 6 months
  const older = values.slice(-12, -6); // Previous 6 months

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / (older.length || 1);

  const change = (recentAvg - olderAvg) / (olderAvg || 1);

  if (change > threshold) return 'increasing';
  if (change < -threshold) return 'decreasing';
  return 'stable';
}

/**
 * Get sparkline data (simplified for rendering)
 */
export function getSparklineData(
  values: number[],
  maxPoints: number = 12
): number[] {
  if (values.length <= maxPoints) return values;

  // Downsample to maxPoints
  const step = values.length / maxPoints;
  return Array.from({ length: maxPoints }, (_, i) =>
    values[Math.floor(i * step)]
  );
}
```

### 2. Regional Aggregation

**`src/lib/dashboard/aggregation/regional.ts`**
```typescript
import { GameState, CountryPopulationData } from '@/types/game';

export interface RegionalSummary {
  total: number;
  byCountry: Record<string, number>;
  topCountries: Array<{ country: string; value: number }>;
  bottomCountries: Array<{ country: string; value: number }>;
}

/**
 * Aggregate metric across 15 regions
 */
export function aggregateRegional(
  state: GameState,
  metric: (country: CountryPopulationData) => number
): RegionalSummary {
  const countries = state.countryPopulationSystem?.countries || [];

  const byCountry: Record<string, number> = {};
  let total = 0;

  for (const country of countries) {
    const value = metric(country);
    byCountry[country.name] = value;
    total += value;
  }

  // Sort for top/bottom
  const sorted = Object.entries(byCountry)
    .map(([country, value]) => ({ country, value }))
    .sort((a, b) => b.value - a.value);

  return {
    total,
    byCountry,
    topCountries: sorted.slice(0, 5),
    bottomCountries: sorted.slice(-5).reverse(),
  };
}

/**
 * Get small multiples data (for regional comparisons)
 */
export function getSmallMultiples(
  state: GameState,
  metrics: Record<string, (country: CountryPopulationData) => number>
): Array<{
  country: string;
  values: Record<string, number>;
}> {
  const countries = state.countryPopulationSystem?.countries || [];

  return countries.map(country => ({
    country: country.name,
    values: Object.fromEntries(
      Object.entries(metrics).map(([key, fn]) => [key, fn(country)])
    ),
  }));
}
```

### 3. AI Agent Distribution

**`src/lib/dashboard/aggregation/agents.ts`**
```typescript
import { GameState, AIAgent } from '@/types/game';

export interface AgentDistribution {
  count: number;
  mean: number;
  median: number;
  quartiles: [number, number, number]; // Q1, Q2, Q3
  min: number;
  max: number;
  violinPlotBins: Array<{ value: number; count: number }>;
  outliers: AIAgent[];
}

/**
 * Calculate distribution statistics for agent metric
 */
export function calculateAgentDistribution(
  agents: AIAgent[],
  metric: (agent: AIAgent) => number,
  outlierThreshold: number = 2 // Standard deviations
): AgentDistribution {
  if (agents.length === 0) {
    return {
      count: 0,
      mean: 0,
      median: 0,
      quartiles: [0, 0, 0],
      min: 0,
      max: 0,
      violinPlotBins: [],
      outliers: [],
    };
  }

  const values = agents.map(metric).sort((a, b) => a - b);
  const count = values.length;

  // Calculate statistics
  const mean = values.reduce((a, b) => a + b, 0) / count;
  const median = values[Math.floor(count / 2)];
  const q1 = values[Math.floor(count * 0.25)];
  const q3 = values[Math.floor(count * 0.75)];
  const min = values[0];
  const max = values[values.length - 1];

  // Violin plot bins (20 bins)
  const binCount = 20;
  const binSize = (max - min) / binCount;
  const violinPlotBins = Array.from({ length: binCount }, (_, i) => {
    const binMin = min + i * binSize;
    const binMax = binMin + binSize;
    const count = values.filter(v => v >= binMin && v < binMax).length;
    return { value: binMin + binSize / 2, count };
  });

  // Detect outliers (beyond 2 standard deviations)
  const stdDev = Math.sqrt(
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / count
  );
  const outliers = agents.filter(agent => {
    const value = metric(agent);
    return Math.abs(value - mean) > outlierThreshold * stdDev;
  });

  return {
    count,
    mean,
    median,
    quartiles: [q1, median, q3],
    min,
    max,
    violinPlotBins,
    outliers,
  };
}

/**
 * Get capability matrix data (20 agents × 17 dimensions)
 */
export interface CapabilityMatrix {
  agents: Array<{
    id: string;
    name: string;
    capabilities: Record<string, number>;
  }>;
  dimensions: string[];
}

export function getCapabilityMatrix(state: GameState): CapabilityMatrix {
  const agents = state.aiAgents || [];

  const dimensions = [
    'physical',
    'digital',
    'cognitive',
    'social',
    'economic',
    'selfImprovement',
    'biotech',
    'materials',
    'climate',
    'computerScience',
    'energy',
    'manufacturing',
    'agriculture',
    'medicine',
    'infrastructure',
    'communications',
    'defense',
  ];

  return {
    agents: agents.map(agent => ({
      id: agent.id,
      name: agent.id, // Or generate name
      capabilities: Object.fromEntries(
        dimensions.map(dim => [
          dim,
          (agent.capabilityProfile as any)?.[dim] || 0,
        ])
      ),
    })),
    dimensions,
  };
}
```

### 4. Planetary Boundaries Aggregation

**`src/lib/dashboard/aggregation/environment.ts`**
```typescript
import { GameState, PlanetaryBoundaryName } from '@/types/game';

export interface PlanetaryBoundaryData {
  name: PlanetaryBoundaryName;
  current: number;
  threshold: number;
  safeZone: number;
  status: 'safe' | 'increasing-risk' | 'high-risk' | 'critical';
  trend: 'improving' | 'worsening' | 'stable';
  regionalVariation?: Record<string, number>;
}

export function getPlanetaryBoundaries(
  state: GameState
): PlanetaryBoundaryData[] {
  const boundaries = state.planetaryBoundaries;
  if (!boundaries) return [];

  const boundaryNames: PlanetaryBoundaryName[] = [
    'climateChange',
    'biosphereIntegrity',
    'landSystemChange',
    'freshwaterUse',
    'biogeochemicalFlows',
    'oceanAcidification',
    'atmosphericAerosol',
    'stratosphericOzone',
    'novelEntities',
  ];

  return boundaryNames.map(name => {
    const current = (boundaries as any)[name] || 0;
    const threshold = 1.0; // Normalized threshold
    const safeZone = 0.7; // Safe operating space

    let status: PlanetaryBoundaryData['status'] = 'safe';
    if (current >= threshold) status = 'critical';
    else if (current >= 0.9) status = 'high-risk';
    else if (current >= safeZone) status = 'increasing-risk';

    // Calculate trend from history
    const history = state.history?.planetaryBoundaries || [];
    const recentValues = history.slice(-6).map(h => (h as any)?.[name] || 0);
    const trend =
      recentValues.length >= 2 &&
      recentValues[recentValues.length - 1] <
        recentValues[recentValues.length - 2]
        ? 'improving'
        : recentValues.length >= 2 &&
          recentValues[recentValues.length - 1] >
            recentValues[recentValues.length - 2]
        ? 'worsening'
        : 'stable';

    return {
      name,
      current,
      threshold,
      safeZone,
      status,
      trend,
    };
  });
}
```

### 5. Quality of Life Distribution

**`src/lib/dashboard/aggregation/qualityOfLife.ts`**
```typescript
import { GameState } from '@/types/game';

export interface QoLDistribution {
  global: {
    average: number;
    byTier: Record<string, number>; // Percentage in each tier
    byDimension: Record<string, number>; // 17 dimensions
  };
  regional: Array<{
    country: string;
    average: number;
    byTier: Record<string, number>;
  }>;
  inequality: {
    gini: number;
    topVsBottom: number; // Top 10% vs bottom 10%
  };
}

export function getQoLDistribution(state: GameState): QoLDistribution {
  const countries = state.countryPopulationSystem?.countries || [];
  const totalPop = state.globalMetrics?.population || 1;

  // Calculate global average (population-weighted)
  let globalAvg = 0;
  const tierCounts: Record<string, number> = {
    tier0: 0,
    tier1: 0,
    tier2: 0,
    tier3: 0,
    tier4: 0,
  };

  for (const country of countries) {
    const pop = country.population;
    const qol = country.qualityOfLife || 0;
    globalAvg += (qol * pop) / totalPop;

    // Classify into tier (placeholder logic)
    const tier = Math.floor(qol * 5);
    const tierKey = `tier${Math.min(tier, 4)}`;
    tierCounts[tierKey] += pop;
  }

  // Regional breakdown
  const regional = countries.map(country => ({
    country: country.name,
    average: country.qualityOfLife || 0,
    byTier: {
      // Simplified - would need detailed tier tracking
      tier0: 0,
      tier1: 0,
      tier2: 0,
      tier3: 0,
      tier4: 0,
    },
  }));

  // Inequality metrics (simplified)
  const qolValues = countries
    .map(c => c.qualityOfLife || 0)
    .sort((a, b) => a - b);
  const top10 =
    qolValues.slice(-Math.ceil(qolValues.length * 0.1)).reduce((a, b) => a + b, 0) /
    Math.ceil(qolValues.length * 0.1);
  const bottom10 =
    qolValues.slice(0, Math.ceil(qolValues.length * 0.1)).reduce((a, b) => a + b, 0) /
    Math.ceil(qolValues.length * 0.1);

  return {
    global: {
      average: globalAvg,
      byTier: Object.fromEntries(
        Object.entries(tierCounts).map(([tier, count]) => [
          tier,
          (count / totalPop) * 100,
        ])
      ),
      byDimension: {}, // TODO: Extract 17 dimensions
    },
    regional,
    inequality: {
      gini: 0, // TODO: Calculate Gini coefficient
      topVsBottom: top10 / (bottom10 || 1),
    },
  };
}
```

---

## Implementation Tasks

### Step 1: Install Dependencies (if needed)
```bash
# No additional dependencies required
```

### Step 2: Create Aggregation Utilities
- [ ] `src/lib/dashboard/aggregation/time.ts` - Time windowing
- [ ] `src/lib/dashboard/aggregation/regional.ts` - Regional rollups
- [ ] `src/lib/dashboard/aggregation/agents.ts` - Agent distributions
- [ ] `src/lib/dashboard/aggregation/environment.ts` - Planetary boundaries
- [ ] `src/lib/dashboard/aggregation/qualityOfLife.ts` - QoL distribution
- [ ] `src/lib/dashboard/aggregation/government.ts` - Government systems
- [ ] `src/lib/dashboard/aggregation/crises.ts` - Crisis systems
- [ ] `src/lib/dashboard/aggregation/technology.ts` - Tech tree
- [ ] `src/lib/dashboard/aggregation/index.ts` - Re-exports

### Step 3: Create Type Definitions
- [ ] `src/lib/dashboard/types.ts` - Aggregated data types

### Step 4: Testing
- [ ] Test time windowing with different ranges
- [ ] Test regional aggregation with mock data
- [ ] Test agent distribution with 20 agents
- [ ] Test planetary boundaries status classification
- [ ] Test QoL tier distribution

---

## Acceptance Criteria

**✅ Aggregation utilities are complete when:**

1. **Time windowing works:**
   - `getTimeWindow()` returns correct start/end months
   - `extractTimeSeries()` slices history correctly
   - `calculateTrend()` detects increasing/decreasing/stable
   - `getSparklineData()` downsamples to maxPoints

2. **Regional aggregation works:**
   - `aggregateRegional()` sums across 15 countries
   - `getSmallMultiples()` returns per-country values
   - Top/bottom countries sorted correctly

3. **Agent distribution works:**
   - `calculateAgentDistribution()` returns mean/median/quartiles
   - `violinPlotBins` has 20 bins
   - `outliers` array contains agents beyond 2σ
   - `getCapabilityMatrix()` returns 20 agents × 17 dimensions

4. **Planetary boundaries work:**
   - `getPlanetaryBoundaries()` returns all 9 boundaries
   - Status classification (safe/increasing-risk/high-risk/critical) correct
   - Trend detection (improving/worsening/stable) works

5. **QoL distribution works:**
   - `getQoLDistribution()` returns global average + tier breakdown
   - Regional breakdown includes all countries
   - Inequality metrics (top vs bottom) calculated

---

## Deliverables

### Files Created
- `src/lib/dashboard/aggregation/time.ts` (~120 lines)
- `src/lib/dashboard/aggregation/regional.ts` (~80 lines)
- `src/lib/dashboard/aggregation/agents.ts` (~150 lines)
- `src/lib/dashboard/aggregation/environment.ts` (~100 lines)
- `src/lib/dashboard/aggregation/qualityOfLife.ts` (~120 lines)
- `src/lib/dashboard/aggregation/government.ts` (~100 lines, TODO)
- `src/lib/dashboard/aggregation/crises.ts` (~100 lines, TODO)
- `src/lib/dashboard/aggregation/technology.ts` (~100 lines, TODO)
- `src/lib/dashboard/aggregation/index.ts` (~20 lines)
- `src/lib/dashboard/types.ts` (~150 lines)

### Exports
```typescript
// From aggregation/index.ts
export * from './time';
export * from './regional';
export * from './agents';
export * from './environment';
export * from './qualityOfLife';
export * from './government';
export * from './crises';
export * from './technology';
```

---

## Coordination

**Check-in Channel:** `.claude/chatroom/channels/implementation.md`

**Dependency:** Wait for Agent 1 to post `[COMPLETED]` for Subplan -1A before starting

**Status Updates:**
- [ ] Post `[STARTED]` when beginning
- [ ] Post `[IN-PROGRESS]` with module completion updates
- [ ] Post `[COMPLETED]` with test results

**Example Check-in:**
```markdown
---
**agent-aggregation-utilities** | 2025-10-22 23:55 | [IN-PROGRESS]

Completed time, regional, and agent aggregation modules.

**Progress:**
✅ time.ts (windowing, trends, sparklines)
✅ regional.ts (aggregation, small multiples)
✅ agents.ts (distributions, capability matrix)
✅ environment.ts (planetary boundaries)
🔄 qualityOfLife.ts (in progress)
⏳ government.ts (pending)
⏳ crises.ts (pending)
⏳ technology.ts (pending)

**Next:** Complete QoL distribution with tier breakdown
---
```

---

## Dependencies for Other Agents

This subplan BLOCKS:
- **Subplan -1C** (Overview API) - needs aggregation functions
- **Subplan -1D** (Domain API) - needs aggregation functions

Other agents should wait for `[COMPLETED]` status before starting.

---

## Notes

**Research Justification:** All aggregation functions preserve distributions to avoid aggregation fallacy (Railsback & Grimm 2019)

**Performance Target:** Aggregation functions should run in <500ms for full GameState

**Future Optimization:** Consider memoization/caching for expensive calculations (capability matrix, QoL distribution)

**Extensibility:** Add new aggregation modules as needed for additional dashboards

---

**Last Updated:** October 22, 2025
**Status:** Ready for implementation (depends on -1A)

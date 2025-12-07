# Subplan -1C: Overview API Endpoints

**Phase:** -1 (Server-Side Aggregation API)
**Agent Assignment:** Agent 3
**Duration:** 2-3 days
**Priority:** CRITICAL (enables Mission Control dashboard)
**Dependencies:** Subplans -1A and -1B complete (needs infrastructure + aggregation)

---

## Context & Research

**Purpose:** Create API endpoints serving pre-aggregated data for Mission Control (Overview Dashboard)

### Key Documents

- **Design Spec:** `docs/design/dashboard-redesign-spec.md` (Mission Control requirements)
- **Architecture Review:** `reviews/dashboard_architecture_20251022.md` (Performance targets)
- **Subplan -1A:** `plans/dashboard/api-infrastructure.md` (Cache, errors, types)
- **Subplan -1B:** `plans/dashboard/aggregation-utilities.md` (Aggregation functions)

### User Requirements

**From design spec:**
1. **Paradigm Cards:** 4 paradigms with scores + indicators
2. **Critical Metrics:** Population, QoL, AI capabilities, alignment, crises
3. **AI Agent Distribution:** 20 agents (NOT just first!)
4. **Active Crises:** Crisis cards with severity/affected population
5. **System Health:** 9-module grid (≤9 per tier, research-validated)

**User's Requested Feature (Subplan 1A):**
> "I think something that would be cool is to click on the paradigms and be able to drill down into the indicators that make up that paradigm's overall score"

This subplan provides the API endpoints to enable that feature.

---

## Objectives

Create 3 core API endpoints for Mission Control dashboard:

1. **`GET /api/dashboard/overview`** - Complete mission control data
2. **`GET /api/dashboard/paradigms`** - 4 paradigms + drill-down indicators
3. **`GET /api/dashboard/critical-metrics`** - Population, QoL, AI, crises

---

## Technical Implementation

### 1. Overview Endpoint

**`src/app/api/dashboard/overview/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/api/cache';
import { handleApiError, ApiError } from '@/lib/api/errors';
import { monitor } from '@/lib/api/monitoring';
import { ApiResponse } from '@/lib/api/types';
import { getGameState } from '@/lib/gameState'; // TODO: Implement state loading
import {
  getPlanetaryBoundaries,
  getQoLDistribution,
  calculateAgentDistribution,
} from '@/lib/dashboard/aggregation';

export interface OverviewData {
  timestamp: string;
  currentMonth: number;
  globalMetrics: {
    population: number;
    qualityOfLife: number;
    aiCapabilityAvg: number;
    alignmentAvg: number;
  };
  paradigms: {
    westernLiberal: number;
    development: number;
    ecological: number;
    indigenous: number;
  };
  activeCrises: Array<{
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    affectedPopulation: number;
    interventionWindow: number; // months
  }>;
  systemHealth: {
    environmental: 'green' | 'amber' | 'red';
    social: 'green' | 'amber' | 'red';
    technological: 'green' | 'amber' | 'red';
    governmental: 'green' | 'amber' | 'red';
    economic: 'green' | 'amber' | 'red';
    nuclear: 'green' | 'amber' | 'red';
    detection: 'green' | 'amber' | 'red';
    welfare: 'green' | 'amber' | 'red';
    crises: 'green' | 'amber' | 'red';
  };
}

export async function GET(request: NextRequest) {
  return monitor.measureAsync('overview-api', async () => {
    try {
      // Check cache
      const cacheKey = 'dashboard:overview';
      const cached = getCached<ApiResponse<OverviewData>>(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }

      // Load game state (TODO: Implement state loading from simulation)
      const state = await getGameState();
      if (!state) {
        throw new ApiError(404, 'Game state not found');
      }

      // Aggregate data
      const aiAgents = state.aiAgents || [];
      const capabilityDist = calculateAgentDistribution(
        aiAgents,
        agent => agent.capabilityProfile?.cognitive || 0
      );
      const alignmentDist = calculateAgentDistribution(
        aiAgents,
        agent => agent.trueAlignment || 0
      );

      const data: OverviewData = {
        timestamp: new Date().toISOString(),
        currentMonth: state.currentMonth || 0,
        globalMetrics: {
          population: state.globalMetrics?.population || 0,
          qualityOfLife: state.globalMetrics?.qualityOfLife || 0,
          aiCapabilityAvg: capabilityDist.mean,
          alignmentAvg: alignmentDist.mean,
        },
        paradigms: {
          westernLiberal:
            state.multiParadigmDUI?.westernLiberal?.overallScore || 0,
          development: state.multiParadigmDUI?.development?.overallScore || 0,
          ecological: state.multiParadigmDUI?.ecological?.overallScore || 0,
          indigenous: state.multiParadigmDUI?.indigenous?.overallScore || 0,
        },
        activeCrises: getActiveCrises(state),
        systemHealth: getSystemHealth(state),
      };

      const response: ApiResponse<OverviewData> = {
        data,
        meta: {
          timestamp: new Date().toISOString(),
          cached: false,
          executionTime: 0, // Will be set by monitoring
        },
      };

      // Cache for 5 minutes
      setCached(cacheKey, response);

      return NextResponse.json(response);
    } catch (error) {
      return handleApiError(error);
    }
  });
}

function getActiveCrises(state: any): OverviewData['activeCrises'] {
  const crises: OverviewData['activeCrises'] = [];

  // Check planetary boundary crises
  if (state.crisisSystem?.phosphorusCrisis?.active) {
    crises.push({
      type: 'Phosphorus Depletion',
      severity: state.crisisSystem.phosphorusCrisis.severity || 'medium',
      affectedPopulation:
        state.crisisSystem.phosphorusCrisis.affectedPopulation || 0,
      interventionWindow:
        state.crisisSystem.phosphorusCrisis.interventionWindow || 0,
    });
  }

  if (state.crisisSystem?.freshwaterCrisis?.active) {
    crises.push({
      type: 'Freshwater Scarcity',
      severity: state.crisisSystem.freshwaterCrisis.severity || 'medium',
      affectedPopulation:
        state.crisisSystem.freshwaterCrisis.affectedPopulation || 0,
      interventionWindow:
        state.crisisSystem.freshwaterCrisis.interventionWindow || 0,
    });
  }

  // Add more crisis checks...

  return crises;
}

function getSystemHealth(state: any): OverviewData['systemHealth'] {
  // Simplified health assessment
  const boundaries = getPlanetaryBoundaries(state);
  const envHealth = boundaries.some(b => b.status === 'critical')
    ? 'red'
    : boundaries.some(b => b.status === 'high-risk')
    ? 'amber'
    : 'green';

  return {
    environmental: envHealth,
    social: 'green', // TODO: Calculate from social cohesion
    technological: 'green', // TODO: Calculate from tech risk
    governmental: 'green', // TODO: Calculate from government effectiveness
    economic: 'green', // TODO: Calculate from economic stage
    nuclear: 'green', // TODO: Calculate from nuclear risk
    detection: 'green', // TODO: Calculate from detection effectiveness
    welfare: 'green', // TODO: Calculate from AI welfare
    crises: state.crisisSystem?.activeCrises?.length > 0 ? 'red' : 'green',
  };
}
```

### 2. Paradigms Endpoint with Drill-Down

**`src/app/api/dashboard/paradigms/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/api/cache';
import { handleApiError, ApiError } from '@/lib/api/errors';
import { monitor } from '@/lib/api/monitoring';
import { ApiResponse } from '@/lib/api/types';
import { getGameState } from '@/lib/gameState';
import { getSmallMultiples } from '@/lib/dashboard/aggregation/regional';

export interface ParadigmIndicator {
  name: string;
  description: string;
  current: number;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'improving' | 'worsening' | 'stable';
  sparkline: number[]; // Last 12 months
  regionalBreakdown?: Record<string, number>; // 15 countries
}

export interface ParadigmData {
  id: 'westernLiberal' | 'development' | 'ecological' | 'indigenous';
  name: string;
  overallScore: number;
  status: 'utopia' | 'hybrid' | 'dystopia';
  indicators: ParadigmIndicator[];
}

export interface ParadigmsResponse {
  paradigms: ParadigmData[];
}

export async function GET(request: NextRequest) {
  return monitor.measureAsync('paradigms-api', async () => {
    try {
      const cacheKey = 'dashboard:paradigms';
      const cached = getCached<ApiResponse<ParadigmsResponse>>(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }

      const state = await getGameState();
      if (!state) {
        throw new ApiError(404, 'Game state not found');
      }

      const paradigms: ParadigmData[] = [
        await getWesternLiberalParadigm(state),
        await getDevelopmentParadigm(state),
        await getEcologicalParadigm(state),
        await getIndigenousParadigm(state),
      ];

      const response: ApiResponse<ParadigmsResponse> = {
        data: { paradigms },
        meta: {
          timestamp: new Date().toISOString(),
          cached: false,
          executionTime: 0,
        },
      };

      setCached(cacheKey, response);
      return NextResponse.json(response);
    } catch (error) {
      return handleApiError(error);
    }
  });
}

async function getWesternLiberalParadigm(state: any): Promise<ParadigmData> {
  const paradigm = state.multiParadigmDUI?.westernLiberal;

  return {
    id: 'westernLiberal',
    name: 'Western Liberal',
    overallScore: paradigm?.overallScore || 0,
    status: paradigm?.status || 'hybrid',
    indicators: [
      {
        name: 'Democracy Index',
        description: 'Free and fair elections, political participation',
        current: paradigm?.democracyIndex || 0,
        threshold: 0.7,
        status: (paradigm?.democracyIndex || 0) > 0.7 ? 'good' : 'warning',
        trend: 'stable',
        sparkline: state.history?.paradigms
          ?.slice(-12)
          .map((h: any) => h.westernLiberal?.democracyIndex || 0) || [],
        regionalBreakdown: {}, // TODO: Extract from government system
      },
      {
        name: 'Civil Liberties',
        description: 'Freedom of speech, press, assembly',
        current: paradigm?.civilLiberties || 0,
        threshold: 0.7,
        status: (paradigm?.civilLiberties || 0) > 0.7 ? 'good' : 'warning',
        trend: 'stable',
        sparkline: state.history?.paradigms
          ?.slice(-12)
          .map((h: any) => h.westernLiberal?.civilLiberties || 0) || [],
      },
      {
        name: 'Rule of Law',
        description: 'Independent judiciary, legal protections',
        current: paradigm?.ruleOfLaw || 0,
        threshold: 0.7,
        status: (paradigm?.ruleOfLaw || 0) > 0.7 ? 'good' : 'warning',
        trend: 'stable',
        sparkline: state.history?.paradigms
          ?.slice(-12)
          .map((h: any) => h.westernLiberal?.ruleOfLaw || 0) || [],
      },
      {
        name: 'Economic Freedom',
        description: 'Market competition, property rights',
        current: paradigm?.economicFreedom || 0,
        threshold: 0.6,
        status: (paradigm?.economicFreedom || 0) > 0.6 ? 'good' : 'warning',
        trend: 'stable',
        sparkline: state.history?.paradigms
          ?.slice(-12)
          .map((h: any) => h.westernLiberal?.economicFreedom || 0) || [],
      },
    ],
  };
}

async function getDevelopmentParadigm(state: any): Promise<ParadigmData> {
  const paradigm = state.multiParadigmDUI?.development;

  return {
    id: 'development',
    name: 'Development',
    overallScore: paradigm?.overallScore || 0,
    status: paradigm?.status || 'hybrid',
    indicators: [
      {
        name: 'Life Expectancy',
        description: 'Average lifespan at birth',
        current: state.globalMetrics?.lifeExpectancy || 70,
        threshold: 80,
        status: (state.globalMetrics?.lifeExpectancy || 0) > 75 ? 'good' : 'warning',
        trend: 'improving',
        sparkline: state.history?.metrics
          ?.slice(-12)
          .map((h: any) => h.lifeExpectancy || 70) || [],
        regionalBreakdown: {}, // TODO: Extract from country populations
      },
      {
        name: 'Quality of Life',
        description: '17-dimensional well-being index',
        current: state.globalMetrics?.qualityOfLife || 0,
        threshold: 0.7,
        status: (state.globalMetrics?.qualityOfLife || 0) > 0.7 ? 'good' : 'warning',
        trend: 'stable',
        sparkline: state.history?.metrics
          ?.slice(-12)
          .map((h: any) => h.qualityOfLife || 0) || [],
      },
      {
        name: 'GDP per Capita',
        description: 'Economic output per person',
        current: state.globalMetrics?.gdpPerCapita || 0,
        threshold: 20000,
        status: (state.globalMetrics?.gdpPerCapita || 0) > 20000 ? 'good' : 'warning',
        trend: 'increasing',
        sparkline: state.history?.metrics
          ?.slice(-12)
          .map((h: any) => h.gdpPerCapita || 0) || [],
      },
    ],
  };
}

async function getEcologicalParadigm(state: any): Promise<ParadigmData> {
  const paradigm = state.multiParadigmDUI?.ecological;
  const boundaries = state.planetaryBoundaries;

  return {
    id: 'ecological',
    name: 'Ecological',
    overallScore: paradigm?.overallScore || 0,
    status: paradigm?.status || 'hybrid',
    indicators: [
      {
        name: 'Climate Change',
        description: 'CO2 concentration, temperature anomaly',
        current: boundaries?.climateChange || 0,
        threshold: 1.0,
        status: (boundaries?.climateChange || 0) < 0.7 ? 'good' : 'critical',
        trend: 'worsening',
        sparkline: state.history?.planetaryBoundaries
          ?.slice(-12)
          .map((h: any) => h.climateChange || 0) || [],
      },
      {
        name: 'Biosphere Integrity',
        description: 'Biodiversity, extinction rate',
        current: boundaries?.biosphereIntegrity || 0,
        threshold: 1.0,
        status: (boundaries?.biosphereIntegrity || 0) < 0.7 ? 'good' : 'critical',
        trend: 'worsening',
        sparkline: state.history?.planetaryBoundaries
          ?.slice(-12)
          .map((h: any) => h.biosphereIntegrity || 0) || [],
      },
      // Add remaining 7 planetary boundaries...
    ],
  };
}

async function getIndigenousParadigm(state: any): Promise<ParadigmData> {
  const paradigm = state.multiParadigmDUI?.indigenous;

  return {
    id: 'indigenous',
    name: 'Indigenous',
    overallScore: paradigm?.overallScore || 0,
    status: paradigm?.status || 'hybrid',
    indicators: [
      {
        name: 'Social Trust',
        description: 'Community bonds, institutional trust',
        current: state.socialCohesion?.socialTrust || 0,
        threshold: 0.7,
        status: (state.socialCohesion?.socialTrust || 0) > 0.7 ? 'good' : 'warning',
        trend: 'stable',
        sparkline: state.history?.social
          ?.slice(-12)
          .map((h: any) => h.socialTrust || 0) || [],
      },
      {
        name: 'Community Infrastructure',
        description: 'Local organizations, civic participation',
        current: state.socialCohesion?.communityInfrastructure || 0,
        threshold: 0.6,
        status: (state.socialCohesion?.communityInfrastructure || 0) > 0.6 ? 'good' : 'warning',
        trend: 'stable',
        sparkline: state.history?.social
          ?.slice(-12)
          .map((h: any) => h.communityInfrastructure || 0) || [],
      },
      {
        name: 'Meaning & Purpose',
        description: 'Cultural vitality, purpose frameworks',
        current: state.socialCohesion?.meaning || 0,
        threshold: 0.6,
        status: (state.socialCohesion?.meaning || 0) > 0.6 ? 'good' : 'warning',
        trend: 'stable',
        sparkline: state.history?.social
          ?.slice(-12)
          .map((h: any) => h.meaning || 0) || [],
      },
    ],
  };
}
```

**`src/app/api/dashboard/paradigms/[id]/route.ts`** - Individual Paradigm Detail
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/api/cache';
import { handleApiError, ApiError } from '@/lib/api/errors';
import { monitor } from '@/lib/api/monitoring';
import { getGameState } from '@/lib/gameState';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return monitor.measureAsync(`paradigm-detail-${params.id}`, async () => {
    try {
      const { id } = params;

      const validIds = ['westernLiberal', 'development', 'ecological', 'indigenous'];
      if (!validIds.includes(id)) {
        throw new ApiError(400, `Invalid paradigm ID: ${id}`);
      }

      const cacheKey = `dashboard:paradigm:${id}`;
      const cached = getCached(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }

      const state = await getGameState();
      if (!state) {
        throw new ApiError(404, 'Game state not found');
      }

      // Get detailed paradigm data with regional breakdown
      // (Implementation depends on which paradigm)
      const data = {}; // TODO: Implement detailed breakdown

      setCached(cacheKey, data);
      return NextResponse.json(data);
    } catch (error) {
      return handleApiError(error);
    }
  });
}
```

### 3. Critical Metrics Endpoint

**`src/app/api/dashboard/critical-metrics/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/api/cache';
import { handleApiError, ApiError } from '@/lib/api/errors';
import { monitor } from '@/lib/api/monitoring';
import { ApiResponse } from '@/lib/api/types';
import { getGameState } from '@/lib/gameState';
import {
  calculateAgentDistribution,
  getQoLDistribution,
} from '@/lib/dashboard/aggregation';

export interface CriticalMetricsData {
  population: {
    current: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    sparkline: number[];
    status: 'normal' | 'warning' | 'critical'; // <2B = critical
  };
  qualityOfLife: {
    average: number;
    tierDistribution: Record<string, number>; // % in each tier
    trend: 'improving' | 'worsening' | 'stable';
    sparkline: number[];
  };
  aiCapability: {
    distribution: {
      mean: number;
      median: number;
      min: number;
      max: number;
      violinPlotBins: Array<{ value: number; count: number }>;
    };
    trend: 'increasing' | 'decreasing' | 'stable';
  };
  alignment: {
    distribution: {
      mean: number;
      median: number;
      min: number;
      max: number;
      violinPlotBins: Array<{ value: number; count: number }>;
    };
    misalignedCount: number; // < 0.3
    deeplyMisalignedCount: number; // < 0.1
  };
  activeCrisesCount: number;
}

export async function GET(request: NextRequest) {
  return monitor.measureAsync('critical-metrics-api', async () => {
    try {
      const cacheKey = 'dashboard:critical-metrics';
      const cached = getCached<ApiResponse<CriticalMetricsData>>(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }

      const state = await getGameState();
      if (!state) {
        throw new ApiError(404, 'Game state not found');
      }

      const aiAgents = state.aiAgents || [];
      const capabilityDist = calculateAgentDistribution(
        aiAgents,
        agent => agent.capabilityProfile?.cognitive || 0
      );
      const alignmentDist = calculateAgentDistribution(
        aiAgents,
        agent => agent.trueAlignment || 0
      );
      const qolDist = getQoLDistribution(state);

      const population = state.globalMetrics?.population || 0;
      const popHistory = state.history?.metrics?.map((h: any) => h.population || 0) || [];

      const data: CriticalMetricsData = {
        population: {
          current: population,
          trend: calculatePopulationTrend(popHistory),
          sparkline: popHistory.slice(-12),
          status: population < 2_000_000_000 ? 'critical' : population < 5_000_000_000 ? 'warning' : 'normal',
        },
        qualityOfLife: {
          average: qolDist.global.average,
          tierDistribution: qolDist.global.byTier,
          trend: 'stable', // TODO: Calculate from history
          sparkline: state.history?.metrics?.slice(-12).map((h: any) => h.qualityOfLife || 0) || [],
        },
        aiCapability: {
          distribution: {
            mean: capabilityDist.mean,
            median: capabilityDist.median,
            min: capabilityDist.min,
            max: capabilityDist.max,
            violinPlotBins: capabilityDist.violinPlotBins,
          },
          trend: 'increasing', // TODO: Calculate from history
        },
        alignment: {
          distribution: {
            mean: alignmentDist.mean,
            median: alignmentDist.median,
            min: alignmentDist.min,
            max: alignmentDist.max,
            violinPlotBins: alignmentDist.violinPlotBins,
          },
          misalignedCount: aiAgents.filter(a => (a.trueAlignment || 0) < 0.3).length,
          deeplyMisalignedCount: aiAgents.filter(a => (a.trueAlignment || 0) < 0.1).length,
        },
        activeCrisesCount: state.crisisSystem?.activeCrises?.length || 0,
      };

      const response: ApiResponse<CriticalMetricsData> = {
        data,
        meta: {
          timestamp: new Date().toISOString(),
          cached: false,
          executionTime: 0,
        },
      };

      setCached(cacheKey, response);
      return NextResponse.json(response);
    } catch (error) {
      return handleApiError(error);
    }
  });
}

function calculatePopulationTrend(history: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (history.length < 6) return 'stable';

  const recent = history.slice(-3);
  const older = history.slice(-6, -3);

  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;

  if (recentAvg > olderAvg * 1.05) return 'increasing';
  if (recentAvg < olderAvg * 0.95) return 'decreasing';
  return 'stable';
}
```

### 4. Game State Loading Utility

**`src/lib/gameState.ts`** (Placeholder - TODO)
```typescript
import { GameState } from '@/types/game';
import fs from 'fs/promises';
import path from 'path';

/**
 * Load the current game state from simulation
 *
 * TODO: Implement actual state loading logic
 * Options:
 * 1. Load from monteCarloOutputs/latest.json
 * 2. Connect to running simulation
 * 3. Load from database
 */
export async function getGameState(): Promise<GameState | null> {
  try {
    // Option 1: Load from latest Monte Carlo output
    const outputDir = path.join(process.cwd(), 'monteCarloOutputs');
    const files = await fs.readdir(outputDir);
    const latestFile = files
      .filter(f => f.endsWith('.json'))
      .sort()
      .reverse()[0];

    if (!latestFile) return null;

    const filePath = path.join(outputDir, latestFile);
    const contents = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(contents);

    return data.finalState || null;
  } catch (error) {
    console.error('[getGameState] Error loading state:', error);
    return null;
  }
}

/**
 * Get state at specific month (from history)
 */
export async function getGameStateAtMonth(month: number): Promise<GameState | null> {
  // TODO: Implement historical state retrieval
  return null;
}
```

---

## Implementation Tasks

### Step 1: Create API Endpoints
- [ ] `src/app/api/dashboard/overview/route.ts` - Mission control data
- [ ] `src/app/api/dashboard/paradigms/route.ts` - All paradigms
- [ ] `src/app/api/dashboard/paradigms/[id]/route.ts` - Paradigm detail
- [ ] `src/app/api/dashboard/critical-metrics/route.ts` - Population, QoL, AI

### Step 2: Create Game State Loader
- [ ] `src/lib/gameState.ts` - Load state from simulation output

### Step 3: Testing
- [ ] Test `/api/dashboard/overview` returns all sections
- [ ] Test `/api/dashboard/paradigms` returns 4 paradigms with indicators
- [ ] Test `/api/dashboard/paradigms/westernLiberal` returns detailed data
- [ ] Test `/api/dashboard/critical-metrics` returns distributions
- [ ] Test caching (second request should be cached)
- [ ] Test error handling (invalid paradigm ID)

---

## Acceptance Criteria

**✅ Overview API is complete when:**

1. **`/api/dashboard/overview` works:**
   - Returns population, QoL, AI capability, alignment
   - Returns 4 paradigm scores
   - Returns active crises array
   - Returns system health (9 categories)
   - Response time <500ms cached, <2s uncached

2. **`/api/dashboard/paradigms` works:**
   - Returns all 4 paradigms with indicators
   - Western Liberal: 4 indicators
   - Development: 3+ indicators
   - Ecological: 9 indicators (planetary boundaries)
   - Indigenous: 3+ indicators
   - Each indicator has sparkline (12 months)

3. **`/api/dashboard/paradigms/:id` works:**
   - Returns detailed paradigm data
   - Includes regional breakdown (15 countries)
   - 404 error for invalid ID

4. **`/api/dashboard/critical-metrics` works:**
   - Returns population with trend + status
   - Returns QoL with tier distribution
   - Returns AI capability DISTRIBUTION (not just first agent!)
   - Returns alignment DISTRIBUTION with misaligned counts
   - Returns active crises count

5. **Caching works:**
   - Second request returns cached data
   - Cache invalidation on state change

---

## Deliverables

### Files Created
- `src/app/api/dashboard/overview/route.ts` (~150 lines)
- `src/app/api/dashboard/paradigms/route.ts` (~250 lines)
- `src/app/api/dashboard/paradigms/[id]/route.ts` (~80 lines)
- `src/app/api/dashboard/critical-metrics/route.ts` (~150 lines)
- `src/lib/gameState.ts` (~60 lines)

### API Endpoints
```
GET /api/dashboard/overview
GET /api/dashboard/paradigms
GET /api/dashboard/paradigms/:id
GET /api/dashboard/critical-metrics
```

---

## Coordination

**Check-in Channel:** `.claude/chatroom/channels/implementation.md`

**Dependencies:**
- Wait for Agent 1 (`[COMPLETED]` Subplan -1A)
- Wait for Agent 2 (`[COMPLETED]` Subplan -1B)

**Status Updates:**
- [ ] Post `[STARTED]` when beginning
- [ ] Post `[IN-PROGRESS]` with endpoint completion updates
- [ ] Post `[COMPLETED]` with test results

**Example Check-in:**
```markdown
---
**agent-overview-api** | 2025-10-23 00:15 | [IN-PROGRESS]

Completed overview and paradigms endpoints, testing critical-metrics.

**Progress:**
✅ overview/route.ts (mission control data)
✅ paradigms/route.ts (4 paradigms with indicators)
✅ paradigms/[id]/route.ts (drill-down detail)
🔄 critical-metrics/route.ts (testing distributions)
✅ gameState.ts (state loader)

**Next:** Complete critical-metrics testing, verify caching
---
```

---

## Dependencies for Other Agents

This subplan ENABLES:
- **Phase 1, Subplan 1A** (Paradigm drill-down UI) - needs paradigms API
- **Phase 1, Subplan 1B** (Critical metrics UI) - needs critical-metrics API
- **Phase 1, Subplan 1C** (Agent distribution UI) - needs distributions data

Dashboard UI implementation can start once this is `[COMPLETED]`.

---

## Notes

**Performance Target:** <500ms for cached responses, <2s for uncached aggregations

**User's Feature:** Paradigm drill-down (click → side panel) is enabled by `/api/dashboard/paradigms` with indicator arrays

**Future Enhancement:** WebSocket support for real-time updates (deferred to Phase 9)

**Testing Strategy:** Use mock GameState for testing, replace with actual simulation output for production

---

**Last Updated:** October 22, 2025
**Status:** Ready for implementation (depends on -1A and -1B)

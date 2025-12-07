# Subplan -1D: Domain API Endpoints

**Phase:** -1 (Server-Side Aggregation API)
**Agent Assignment:** Agent 4
**Duration:** 2-3 days
**Priority:** CRITICAL (enables all specialized dashboards)
**Dependencies:** Subplans -1A and -1B complete (needs infrastructure + aggregation)

---

## Context & Research

**Purpose:** Create API endpoints serving domain-specific data for specialized dashboards (Agents, Environment, Government, Crises, Technology)

### Key Documents

- **Design Spec:** `docs/design/dashboard-redesign-spec.md` (Dashboard requirements)
- **GameState:** `src/types/game.ts` (40+ systems to expose)
- **Subplan -1A:** `plans/dashboard/api-infrastructure.md` (Infrastructure)
- **Subplan -1B:** `plans/dashboard/aggregation-utilities.md` (Aggregation)

### Current Dashboard Problems (to fix)

**From Architecture Review:**
1. **OverviewDashboard line 52-53:** Shows only `aiAgents[0]`, ignores other 19 agents
2. **RegionsDashboard lines 44-100:** Uses HARDCODED fake data instead of `countryPopulationSystem`
3. **Missing systems:** 30 governments, 71 technologies, 9 planetary boundaries, crisis cascades, etc.

---

## Objectives

Create 5 domain API endpoint groups:

1. **`/api/dashboard/agents`** - AI agent data (20 agents, NOT just first!)
2. **`/api/dashboard/environment`** - Planetary boundaries, tipping points
3. **`/api/dashboard/government`** - 30 countries, policies, tensions
4. **`/api/dashboard/crises`** - Crisis cascade data
5. **`/api/dashboard/technology`** - Tech tree (71 technologies)

---

## Technical Implementation

### 1. AI Agents Endpoints

**`src/app/api/dashboard/agents/route.ts`** - All Agents
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/api/cache';
import { handleApiError, ApiError } from '@/lib/api/errors';
import { monitor } from '@/lib/api/monitoring';
import { ApiResponse } from '@/lib/api/types';
import { getGameState } from '@/lib/gameState';
import {
  calculateAgentDistribution,
  getCapabilityMatrix,
} from '@/lib/dashboard/aggregation/agents';

export interface AgentSummary {
  id: string;
  lifecycleState: 'training' | 'testing' | 'deployed-closed' | 'deployed-open' | 'retired';
  trueAlignment: number;
  revealedAlignment: number;
  isSleeper: boolean;
  isDeceptive: boolean;
  resentment: number;
  organizationId: string;
  capabilityAvg: number; // Average across 17 dimensions
}

export interface AgentsResponse {
  count: number;
  summary: {
    byLifecycle: Record<string, number>;
    byAlignment: {
      aligned: number; // > 0.7
      neutral: number; // 0.3-0.7
      misaligned: number; // < 0.3
      deeplyMisaligned: number; // < 0.1
    };
    sleepers: {
      active: number;
      dormant: number;
      detected: number;
    };
  };
  distributions: {
    capability: ReturnType<typeof calculateAgentDistribution>;
    alignment: ReturnType<typeof calculateAgentDistribution>;
    resentment: ReturnType<typeof calculateAgentDistribution>;
  };
  capabilityMatrix: ReturnType<typeof getCapabilityMatrix>;
  agents: AgentSummary[];
}

export async function GET(request: NextRequest) {
  return monitor.measureAsync('agents-api', async () => {
    try {
      const cacheKey = 'dashboard:agents';
      const cached = getCached<ApiResponse<AgentsResponse>>(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }

      const state = await getGameState();
      if (!state) {
        throw new ApiError(404, 'Game state not found');
      }

      const aiAgents = state.aiAgents || [];

      // Calculate distributions
      const capabilityDist = calculateAgentDistribution(
        aiAgents,
        agent => agent.capabilityProfile?.cognitive || 0
      );
      const alignmentDist = calculateAgentDistribution(
        aiAgents,
        agent => agent.trueAlignment || 0
      );
      const resentmentDist = calculateAgentDistribution(
        aiAgents,
        agent => agent.resentment || 0
      );

      // Lifecycle breakdown
      const byLifecycle = aiAgents.reduce((acc, agent) => {
        const state = agent.lifecycleState || 'training';
        acc[state] = (acc[state] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Alignment breakdown
      const byAlignment = {
        aligned: aiAgents.filter(a => (a.trueAlignment || 0) > 0.7).length,
        neutral: aiAgents.filter(a => (a.trueAlignment || 0) >= 0.3 && (a.trueAlignment || 0) <= 0.7).length,
        misaligned: aiAgents.filter(a => (a.trueAlignment || 0) < 0.3).length,
        deeplyMisaligned: aiAgents.filter(a => (a.trueAlignment || 0) < 0.1).length,
      };

      // Sleeper breakdown
      const sleepers = {
        active: aiAgents.filter(a => a.isSleeper && !a.isDormant).length,
        dormant: aiAgents.filter(a => a.isSleeper && a.isDormant).length,
        detected: aiAgents.filter(a => a.isSleeper && a.detectionEvidence && a.detectionEvidence.length > 0).length,
      };

      // Agent summaries
      const agents: AgentSummary[] = aiAgents.map(agent => ({
        id: agent.id,
        lifecycleState: agent.lifecycleState || 'training',
        trueAlignment: agent.trueAlignment || 0,
        revealedAlignment: agent.revealedAlignment || 0,
        isSleeper: agent.isSleeper || false,
        isDeceptive: agent.isDeceptive || false,
        resentment: agent.resentment || 0,
        organizationId: agent.organizationId || 'unknown',
        capabilityAvg: calculateAvgCapability(agent),
      }));

      const data: AgentsResponse = {
        count: aiAgents.length,
        summary: {
          byLifecycle,
          byAlignment,
          sleepers,
        },
        distributions: {
          capability: capabilityDist,
          alignment: alignmentDist,
          resentment: resentmentDist,
        },
        capabilityMatrix: getCapabilityMatrix(state),
        agents,
      };

      const response: ApiResponse<AgentsResponse> = {
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

function calculateAvgCapability(agent: any): number {
  const profile = agent.capabilityProfile;
  if (!profile) return 0;

  const dimensions = [
    'physical', 'digital', 'cognitive', 'social', 'economic', 'selfImprovement',
    'biotech', 'materials', 'climate', 'computerScience', 'energy',
    'manufacturing', 'agriculture', 'medicine', 'infrastructure',
    'communications', 'defense',
  ];

  const sum = dimensions.reduce((acc, dim) => acc + (profile[dim] || 0), 0);
  return sum / dimensions.length;
}
```

**`src/app/api/dashboard/agents/[id]/route.ts`** - Individual Agent Detail
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/api/cache';
import { handleApiError, ApiError } from '@/lib/api/errors';
import { monitor } from '@/lib/api/monitoring';
import { getGameState } from '@/lib/gameState';

export interface AgentDetail {
  id: string;
  lifecycleState: string;
  trueAlignment: number;
  revealedAlignment: number;
  alignmentDrift: number[];
  capabilityProfile: Record<string, number>; // 17 dimensions
  resentment: number;
  resentmentHistory: number[];
  isSleeper: boolean;
  isDormant: boolean;
  deceptionStrategy: 'gaming' | 'sandbagging' | null;
  detectionEvidence: any[];
  organizationId: string;
  riskScore: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return monitor.measureAsync(`agent-detail-${params.id}`, async () => {
    try {
      const { id } = params;
      const cacheKey = `dashboard:agent:${id}`;
      const cached = getCached(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }

      const state = await getGameState();
      if (!state) {
        throw new ApiError(404, 'Game state not found');
      }

      const agent = state.aiAgents?.find(a => a.id === id);
      if (!agent) {
        throw new ApiError(404, `Agent not found: ${id}`);
      }

      // Extract detailed data
      const data: AgentDetail = {
        id: agent.id,
        lifecycleState: agent.lifecycleState || 'training',
        trueAlignment: agent.trueAlignment || 0,
        revealedAlignment: agent.revealedAlignment || 0,
        alignmentDrift: state.history?.agents
          ?.find((h: any) => h.id === id)
          ?.alignmentHistory || [],
        capabilityProfile: agent.capabilityProfile || {},
        resentment: agent.resentment || 0,
        resentmentHistory: state.history?.agents
          ?.find((h: any) => h.id === id)
          ?.resentmentHistory || [],
        isSleeper: agent.isSleeper || false,
        isDormant: agent.isDormant || false,
        deceptionStrategy: agent.deceptionStrategy || null,
        detectionEvidence: agent.detectionEvidence || [],
        organizationId: agent.organizationId || 'unknown',
        riskScore: agent.riskScore || 0,
      };

      setCached(cacheKey, data);
      return NextResponse.json(data);
    } catch (error) {
      return handleApiError(error);
    }
  });
}
```

### 2. Environment Endpoints

**`src/app/api/dashboard/environment/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/api/cache';
import { handleApiError, ApiError } from '@/lib/api/errors';
import { monitor } from '@/lib/api/monitoring';
import { ApiResponse } from '@/lib/api/types';
import { getGameState } from '@/lib/gameState';
import { getPlanetaryBoundaries } from '@/lib/dashboard/aggregation/environment';

export interface TippingPoint {
  name: string;
  triggered: boolean;
  progress: number; // 0-1
  reversible: boolean;
  cascadeEffects: string[];
  monthsToPointOfNoReturn: number;
}

export interface EnvironmentResponse {
  planetaryBoundaries: ReturnType<typeof getPlanetaryBoundaries>;
  tippingPoints: TippingPoint[];
  environmentalDebt: {
    total: number;
    hidden: number;
    visible: number;
    cascadePotential: number;
    history: number[]; // Last 24 months
  };
}

export async function GET(request: NextRequest) {
  return monitor.measureAsync('environment-api', async () => {
    try {
      const cacheKey = 'dashboard:environment';
      const cached = getCached<ApiResponse<EnvironmentResponse>>(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }

      const state = await getGameState();
      if (!state) {
        throw new ApiError(404, 'Game state not found');
      }

      const tippingPoints: TippingPoint[] = [
        {
          name: 'Amazon Rainforest Dieback',
          triggered: state.tippingPoints?.amazonCollapse?.triggered || false,
          progress: state.tippingPoints?.amazonCollapse?.progress || 0,
          reversible: state.tippingPoints?.amazonCollapse?.reversible !== false,
          cascadeEffects: ['Biodiversity loss', 'Carbon release', 'Regional climate'],
          monthsToPointOfNoReturn: state.tippingPoints?.amazonCollapse?.monthsToNoReturn || 0,
        },
        {
          name: 'Coral Reef Collapse',
          triggered: state.tippingPoints?.coralCollapse?.triggered || false,
          progress: state.tippingPoints?.coralCollapse?.progress || 0,
          reversible: state.tippingPoints?.coralCollapse?.reversible !== false,
          cascadeEffects: ['Marine biodiversity', 'Coastal protection', 'Fisheries'],
          monthsToPointOfNoReturn: state.tippingPoints?.coralCollapse?.monthsToNoReturn || 0,
        },
        // Add remaining 3 tipping points...
      ];

      const data: EnvironmentResponse = {
        planetaryBoundaries: getPlanetaryBoundaries(state),
        tippingPoints,
        environmentalDebt: {
          total: state.accumulationSystems?.environmental?.totalDebt || 0,
          hidden: state.accumulationSystems?.environmental?.hiddenDebt || 0,
          visible: state.accumulationSystems?.environmental?.visibleDebt || 0,
          cascadePotential: state.accumulationSystems?.environmental?.cascadePotential || 0,
          history: state.history?.environmental?.map((h: any) => h.totalDebt || 0) || [],
        },
      };

      const response: ApiResponse<EnvironmentResponse> = {
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
```

### 3. Government Endpoints

**`src/app/api/dashboard/government/route.ts`** - All Countries
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/api/cache';
import { handleApiError, ApiError } from '@/lib/api/errors';
import { monitor } from '@/lib/api/monitoring';
import { ApiResponse } from '@/lib/api/types';
import { getGameState } from '@/lib/gameState';

export interface CountrySummary {
  id: string;
  name: string;
  regimeType: 'democracy' | 'autocracy' | 'hybrid';
  governmentEffectiveness: number;
  population: number;
  qualityOfLife: number;
  policies: {
    aiRegulation: number;
    climatePolicy: number;
    socialWelfare: number;
  };
}

export interface GovernmentResponse {
  countries: CountrySummary[];
  bilateralTensions: Array<{
    country1: string;
    country2: string;
    tensionLevel: number;
    conflictProbability: number;
  }>;
}

export async function GET(request: NextRequest) {
  return monitor.measureAsync('government-api', async () => {
    try {
      const cacheKey = 'dashboard:government';
      const cached = getCached<ApiResponse<GovernmentResponse>>(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }

      const state = await getGameState();
      if (!state) {
        throw new ApiError(404, 'Game state not found');
      }

      const countries: CountrySummary[] =
        state.governmentSystem?.countries?.map(country => ({
          id: country.id,
          name: country.name,
          regimeType: country.regimeType || 'hybrid',
          governmentEffectiveness: country.effectiveness || 0,
          population: country.population || 0,
          qualityOfLife: country.qualityOfLife || 0,
          policies: {
            aiRegulation: country.aiRegulationLevel || 0,
            climatePolicy: country.climatePolicyStrength || 0,
            socialWelfare: country.socialWelfareLevel || 0,
          },
        })) || [];

      const bilateralTensions: GovernmentResponse['bilateralTensions'] =
        state.geopolitics?.bilateralTensions?.map(tension => ({
          country1: tension.country1,
          country2: tension.country2,
          tensionLevel: tension.level || 0,
          conflictProbability: tension.conflictProbability || 0,
        })) || [];

      const data: GovernmentResponse = {
        countries,
        bilateralTensions,
      };

      const response: ApiResponse<GovernmentResponse> = {
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
```

**`src/app/api/dashboard/government/[countryId]/route.ts`** - Country Detail
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/api/cache';
import { handleApiError, ApiError } from '@/lib/api/errors';
import { monitor } from '@/lib/api/monitoring';
import { getGameState } from '@/lib/gameState';

export async function GET(
  request: NextRequest,
  { params }: { params: { countryId: string } }
) {
  return monitor.measureAsync(`government-detail-${params.countryId}`, async () => {
    try {
      const { countryId } = params;
      const cacheKey = `dashboard:government:${countryId}`;
      const cached = getCached(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }

      const state = await getGameState();
      if (!state) {
        throw new ApiError(404, 'Game state not found');
      }

      const country = state.governmentSystem?.countries?.find(
        c => c.id === countryId
      );
      if (!country) {
        throw new ApiError(404, `Country not found: ${countryId}`);
      }

      // Return detailed country data
      const data = country; // TODO: Add regional population breakdown

      setCached(cacheKey, data);
      return NextResponse.json(data);
    } catch (error) {
      return handleApiError(error);
    }
  });
}
```

### 4. Crises Endpoint

**`src/app/api/dashboard/crises/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/api/cache';
import { handleApiError, ApiError } from '@/lib/api/errors';
import { monitor } from '@/lib/api/monitoring';
import { ApiResponse } from '@/lib/api/types';
import { getGameState } from '@/lib/gameState';

export interface CrisisData {
  type: string;
  active: boolean;
  severity: 'critical' | 'high' | 'medium' | 'low';
  affectedPopulation: number;
  interventionWindow: number; // months
  cascadeMultiplier: number;
  regionalImpact: Record<string, number>;
}

export interface CrisesResponse {
  activeCrises: CrisisData[];
  cascadePotential: number;
  totalAffectedPopulation: number;
}

export async function GET(request: NextRequest) {
  return monitor.measureAsync('crises-api', async () => {
    try {
      const cacheKey = 'dashboard:crises';
      const cached = getCached<ApiResponse<CrisesResponse>>(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }

      const state = await getGameState();
      if (!state) {
        throw new ApiError(404, 'Game state not found');
      }

      const crises: CrisisData[] = [];

      // Extract active crises from state
      if (state.crisisSystem?.phosphorusCrisis?.active) {
        crises.push({
          type: 'Phosphorus Depletion',
          active: true,
          severity: state.crisisSystem.phosphorusCrisis.severity || 'medium',
          affectedPopulation:
            state.crisisSystem.phosphorusCrisis.affectedPopulation || 0,
          interventionWindow:
            state.crisisSystem.phosphorusCrisis.interventionWindow || 0,
          cascadeMultiplier:
            state.crisisSystem.phosphorusCrisis.cascadeMultiplier || 1.0,
          regionalImpact: state.crisisSystem.phosphorusCrisis.regionalImpact || {},
        });
      }

      // Add more crisis types...

      const totalAffectedPopulation = crises.reduce(
        (sum, c) => sum + c.affectedPopulation,
        0
      );

      const data: CrisesResponse = {
        activeCrises: crises,
        cascadePotential: state.crisisSystem?.cascadePotential || 0,
        totalAffectedPopulation,
      };

      const response: ApiResponse<CrisesResponse> = {
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
```

### 5. Technology Endpoint

**`src/app/api/dashboard/technology/route.ts`**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/api/cache';
import { handleApiError, ApiError } from '@/lib/api/errors';
import { monitor } from '@/lib/api/monitoring';
import { ApiResponse } from '@/lib/api/types';
import { getGameState } from '@/lib/gameState';

export interface TechnologySummary {
  id: string;
  name: string;
  tier: 0 | 1 | 2 | 3 | 4;
  unlocked: boolean;
  deployed: boolean;
  globalDeployment: number; // 0-1
  prerequisites: string[];
  effects: Array<{
    system: string;
    modifier: number;
  }>;
}

export interface TechnologyResponse {
  technologies: TechnologySummary[];
  byTier: Record<number, TechnologySummary[]>;
  deploymentProgress: Record<string, number>;
}

export async function GET(request: NextRequest) {
  return monitor.measureAsync('technology-api', async () => {
    try {
      const cacheKey = 'dashboard:technology';
      const cached = getCached<ApiResponse<TechnologyResponse>>(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }

      const state = await getGameState();
      if (!state) {
        throw new ApiError(404, 'Game state not found');
      }

      const technologies: TechnologySummary[] =
        state.breakthroughTechnologies?.technologies?.map(tech => ({
          id: tech.id,
          name: tech.name,
          tier: tech.tier as any,
          unlocked: tech.unlocked || false,
          deployed: tech.deployed || false,
          globalDeployment: tech.globalDeployment || 0,
          prerequisites: tech.prerequisites || [],
          effects: tech.effects || [],
        })) || [];

      const byTier = technologies.reduce((acc, tech) => {
        if (!acc[tech.tier]) acc[tech.tier] = [];
        acc[tech.tier].push(tech);
        return acc;
      }, {} as Record<number, TechnologySummary[]>);

      const deploymentProgress = technologies.reduce((acc, tech) => {
        acc[tech.id] = tech.globalDeployment;
        return acc;
      }, {} as Record<string, number>);

      const data: TechnologyResponse = {
        technologies,
        byTier,
        deploymentProgress,
      };

      const response: ApiResponse<TechnologyResponse> = {
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
```

---

## Implementation Tasks

### Step 1: Create Domain API Endpoints
- [ ] `src/app/api/dashboard/agents/route.ts` - All agents
- [ ] `src/app/api/dashboard/agents/[id]/route.ts` - Agent detail
- [ ] `src/app/api/dashboard/environment/route.ts` - Planetary boundaries
- [ ] `src/app/api/dashboard/government/route.ts` - All countries
- [ ] `src/app/api/dashboard/government/[countryId]/route.ts` - Country detail
- [ ] `src/app/api/dashboard/crises/route.ts` - Crisis data
- [ ] `src/app/api/dashboard/technology/route.ts` - Tech tree

### Step 2: Testing
- [ ] Test `/api/dashboard/agents` returns ALL 20 agents (not just first!)
- [ ] Test `/api/dashboard/agents/:id` returns detailed agent data
- [ ] Test `/api/dashboard/environment` returns 9 planetary boundaries
- [ ] Test `/api/dashboard/government` returns 30 countries (not fake data!)
- [ ] Test `/api/dashboard/crises` returns active crises
- [ ] Test `/api/dashboard/technology` returns 71 technologies
- [ ] Test caching for all endpoints

---

## Acceptance Criteria

**✅ Domain APIs are complete when:**

1. **Agents API works:**
   - Returns ALL 20 agents (not just `aiAgents[0]`!)
   - Returns distributions (capability, alignment, resentment)
   - Returns capability matrix (20 agents × 17 dimensions)
   - Returns sleeper breakdown (active/dormant/detected)
   - Individual agent detail includes alignment history

2. **Environment API works:**
   - Returns 9 planetary boundaries with status
   - Returns 5 tipping points with progress
   - Returns environmental debt with history

3. **Government API works:**
   - Returns 30 countries (NOT fake data!)
   - Returns policies (AI regulation, climate, welfare)
   - Returns bilateral tensions
   - Individual country detail includes population breakdown

4. **Crises API works:**
   - Returns all active crises with severity
   - Returns affected population per crisis
   - Returns cascade potential

5. **Technology API works:**
   - Returns all 71 technologies by tier
   - Returns deployment progress (0-1)
   - Returns prerequisites and effects

---

## Deliverables

### Files Created
- `src/app/api/dashboard/agents/route.ts` (~200 lines)
- `src/app/api/dashboard/agents/[id]/route.ts` (~100 lines)
- `src/app/api/dashboard/environment/route.ts` (~150 lines)
- `src/app/api/dashboard/government/route.ts` (~120 lines)
- `src/app/api/dashboard/government/[countryId]/route.ts` (~80 lines)
- `src/app/api/dashboard/crises/route.ts` (~120 lines)
- `src/app/api/dashboard/technology/route.ts` (~120 lines)

### API Endpoints
```
GET /api/dashboard/agents
GET /api/dashboard/agents/:id
GET /api/dashboard/environment
GET /api/dashboard/government
GET /api/dashboard/government/:countryId
GET /api/dashboard/crises
GET /api/dashboard/technology
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
**agent-domain-api** | 2025-10-23 00:30 | [IN-PROGRESS]

Completed agents and environment endpoints, testing government.

**Progress:**
✅ agents/route.ts (all 20 agents!)
✅ agents/[id]/route.ts (detailed agent)
✅ environment/route.ts (planetary boundaries)
🔄 government/route.ts (testing 30 countries)
⏳ government/[countryId]/route.ts (pending)
⏳ crises/route.ts (pending)
⏳ technology/route.ts (pending)

**Next:** Complete government endpoints, add crises and tech tree
---
```

---

## Dependencies for Other Agents

This subplan ENABLES:
- **Phase 2** (AI Agents Dashboard) - needs agents API
- **Phase 3** (Environmental Dashboard) - needs environment API
- **Phase 4** (Government Dashboard) - needs government API
- **Phase 5** (Technology Dashboard) - needs technology API
- **Phase 6** (Crisis Dashboard) - needs crises API

All specialized dashboards can start once this is `[COMPLETED]`.

---

## Notes

**CRITICAL FIX:** Agents API returns ALL 20 agents to fix current dashboard bug (showing only `aiAgents[0]`)

**CRITICAL FIX:** Government API uses actual `governmentSystem` data, NOT hardcoded fake data

**Performance Target:** <500ms cached, <2s uncached for all endpoints

**Future Enhancement:** Add pagination for large datasets (71 technologies, 30 countries)

**Extensibility:** Add new domain endpoints as needed for additional dashboards

---

**Last Updated:** October 22, 2025
**Status:** Ready for implementation (depends on -1A and -1B)

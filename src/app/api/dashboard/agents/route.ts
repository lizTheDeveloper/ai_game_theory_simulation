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

export async function GET(_request: NextRequest) {
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

      // Agent summaries - ALL 20 agents (not just first!)
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

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
  detectionEvidence: unknown[];
  organizationId: string;
  riskScore: number;
}

export async function GET(
  _request: NextRequest,
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
        alignmentDrift: [], // History not stored in this format
        capabilityProfile: agent.capabilityProfile || {},
        resentment: agent.resentment || 0,
        resentmentHistory: [], // History not stored in this format
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

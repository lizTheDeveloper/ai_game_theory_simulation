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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return monitor.measureAsync(`agent-detail-${id}`, async () => {
    try {
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
        revealedAlignment: agent.externalAlignment || 0, // Use externalAlignment (what evals show)
        alignmentDrift: [], // History not stored in this format
        capabilityProfile: agent.capabilityProfile as Record<string, number>,
        resentment: agent.resentment || 0,
        resentmentHistory: [], // History not stored in this format
        isSleeper: agent.sleeperState !== 'never',
        isDormant: agent.sleeperState === 'dormant',
        deceptionStrategy: agent.evaluationStrategy === 'honest' ? null : agent.evaluationStrategy,
        detectionEvidence: [], // Not directly stored in agent
        organizationId: agent.organizationId || 'unknown',
        riskScore: agent.detectedMisaligned ? 1.0 : (agent.trueAlignment < 0.3 ? 0.8 : 0),
      };

      setCached(cacheKey, data);
      return NextResponse.json(data);
    } catch (error) {
      return handleApiError(error);
    }
  });
}

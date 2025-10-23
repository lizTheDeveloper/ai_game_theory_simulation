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

export async function GET(_request: NextRequest) {
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

      // Get all technologies from tech tree
      const unlockedTechs = new Set(state.techTreeState.unlockedTech || []);
      const technologies: TechnologySummary[] =
        state.technologyTree?.map(tech => ({
          id: tech.id,
          name: tech.name,
          tier: 0 as any, // Tech tree doesn't use tiers, using 0 as placeholder
          unlocked: unlockedTechs.has(tech.id),
          deployed: tech.completed || false,
          globalDeployment: tech.completed ? 1.0 : 0,
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

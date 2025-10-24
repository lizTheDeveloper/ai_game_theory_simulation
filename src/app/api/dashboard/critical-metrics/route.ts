import { NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/api/cache';
import { handleApiError, ApiError } from '@/lib/api/errors';
import { monitor } from '@/lib/api/monitoring';
import { ApiResponse } from '@/lib/api/types';
import { getGameState } from '@/lib/gameState';
import { GameState } from '@/types/game';
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

export async function GET() {
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
      const popHistory = state.history?.metrics?.map((h: unknown) => (h as { population?: number }).population || 0) || [];

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
          sparkline: state.history?.metrics?.slice(-12).map((h: unknown) => (h as { qualityOfLife?: number }).qualityOfLife || 0) || [],
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
        activeCrisesCount: countActiveCrises(state),
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

function countActiveCrises(state: GameState): number {
  let count = 0;

  // Phosphorus crisis
  if (state.phosphorusSystem.supplyShockActive || state.phosphorusSystem.criticalDepletionActive) count++;

  // Freshwater crisis
  if (state.freshwaterSystem.dayZeroDrought?.active || state.freshwaterSystem.criticalScarcityActive) count++;

  // Ocean acidification crisis
  if (state.oceanAcidificationSystem.coralExtinctionActive || state.oceanAcidificationSystem.shellfishCollapseActive) count++;

  // Novel entities (PFAS) crisis
  if (state.novelEntitiesSystem.reproductiveCrisisActive || state.novelEntitiesSystem.chronicDiseaseEpidemicActive) count++;

  // Nuclear winter
  if (state.nuclearWinterState?.active) count++;

  return count;
}

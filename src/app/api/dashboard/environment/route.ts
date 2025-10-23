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

export async function GET(_request: NextRequest) {
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
        {
          name: 'Greenland Ice Sheet',
          triggered: state.tippingPoints?.greenlandCollapse?.triggered || false,
          progress: state.tippingPoints?.greenlandCollapse?.progress || 0,
          reversible: state.tippingPoints?.greenlandCollapse?.reversible !== false,
          cascadeEffects: ['Sea level rise', 'Ocean circulation'],
          monthsToPointOfNoReturn: state.tippingPoints?.greenlandCollapse?.monthsToNoReturn || 0,
        },
        {
          name: 'West Antarctic Ice Sheet',
          triggered: state.tippingPoints?.antarcticCollapse?.triggered || false,
          progress: state.tippingPoints?.antarcticCollapse?.progress || 0,
          reversible: state.tippingPoints?.antarcticCollapse?.reversible !== false,
          cascadeEffects: ['Catastrophic sea level rise', 'Global climate'],
          monthsToPointOfNoReturn: state.tippingPoints?.antarcticCollapse?.monthsToNoReturn || 0,
        },
        {
          name: 'Atlantic Meridional Overturning Circulation',
          triggered: state.tippingPoints?.amocCollapse?.triggered || false,
          progress: state.tippingPoints?.amocCollapse?.progress || 0,
          reversible: state.tippingPoints?.amocCollapse?.reversible !== false,
          cascadeEffects: ['European cooling', 'Monsoon disruption', 'Amazon dieback'],
          monthsToPointOfNoReturn: state.tippingPoints?.amocCollapse?.monthsToNoReturn || 0,
        },
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

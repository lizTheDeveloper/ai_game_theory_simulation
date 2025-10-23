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

export async function GET() {
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
          triggered: state.specificTippingPoints?.amazon?.triggered || false,
          progress: state.specificTippingPoints?.amazon?.transitionProgress || 0,
          reversible: state.specificTippingPoints?.amazon?.reversibility !== 'irreversible',
          cascadeEffects: ['Biodiversity loss', 'Carbon release', 'Regional climate'],
          monthsToPointOfNoReturn: 0, // Not tracked in current structure
        },
        {
          name: 'Coral Reef Collapse',
          triggered: state.specificTippingPoints?.coral?.triggered || false,
          progress: state.specificTippingPoints?.coral?.collapseProgress || 0,
          reversible: state.specificTippingPoints?.coral?.reversibility !== 'irreversible',
          cascadeEffects: ['Marine biodiversity', 'Coastal protection', 'Fisheries'],
          monthsToPointOfNoReturn: 0, // Not tracked in current structure
        },
        {
          name: 'Permafrost Carbon Release',
          triggered: state.specificTippingPoints?.permafrost?.triggered || false,
          progress: state.specificTippingPoints?.permafrost?.thawRate || 0,
          reversible: state.specificTippingPoints?.permafrost?.reversibility !== 'irreversible',
          cascadeEffects: ['Carbon release', 'Methane emissions', 'Arctic warming'],
          monthsToPointOfNoReturn: 0,
        },
        {
          name: 'Pollinator Collapse',
          triggered: state.specificTippingPoints?.pollinators?.triggered || false,
          progress: 1 - (state.specificTippingPoints?.pollinators?.populationPercentage || 1),
          reversible: state.specificTippingPoints?.pollinators?.reversibility !== 'irreversible',
          cascadeEffects: ['Food production loss', 'Ecosystem disruption'],
          monthsToPointOfNoReturn: 0,
        },
        {
          name: 'Atlantic Meridional Overturning Circulation',
          triggered: state.specificTippingPoints?.amoc?.triggered || false,
          progress: 1 - (state.specificTippingPoints?.amoc?.strength || 1),
          reversible: state.specificTippingPoints?.amoc?.reversibility !== 'irreversible',
          cascadeEffects: ['European cooling', 'Monsoon disruption', 'Amazon dieback'],
          monthsToPointOfNoReturn: 0,
        },
      ];

      // Calculate environmental debt from accumulation metrics
      const env = state.environmentalAccumulation;
      const totalDebt = (
        (1 - env.resourceReserves) +     // Resource depletion
        env.pollutionLevel +              // Pollution accumulation
        (1 - env.climateStability) +     // Climate degradation
        (1 - env.biodiversityIndex)      // Biodiversity loss
      ) / 4;

      const data: EnvironmentResponse = {
        planetaryBoundaries: getPlanetaryBoundaries(state),
        tippingPoints,
        environmentalDebt: {
          total: totalDebt,
          hidden: totalDebt * 0.6, // Estimate: ~60% of debt is hidden during prosperity
          visible: totalDebt * 0.4, // Estimate: ~40% visible
          cascadePotential: env.resourceCrisisActive || env.pollutionCrisisActive || env.climateCrisisActive || env.ecosystemCrisisActive ? 0.8 : totalDebt,
          history: [], // History not tracked in current structure
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

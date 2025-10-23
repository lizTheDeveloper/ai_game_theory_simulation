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

export async function GET(_request: NextRequest) {
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

      // Use REAL government data from countryPopulationSystem (NOT fake data!)
      const countries: CountrySummary[] =
        state.countryPopulationSystem?.countries?.map(country => ({
          id: country.id,
          name: country.name,
          regimeType: country.regimeType || 'hybrid',
          governmentEffectiveness: country.governmentEffectiveness || 0,
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

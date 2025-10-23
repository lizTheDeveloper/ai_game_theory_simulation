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

export async function GET() {
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

      // TODO: CountryPopulation type doesn't have government/policy properties yet
      // Using placeholder data until government system is fully implemented
      const countries: CountrySummary[] = state.countryPopulationSystem?.countries
        ? Object.values(state.countryPopulationSystem.countries).map(country => ({
            id: country.name, // Use name as ID
            name: country.name,
            regimeType: 'hybrid', // TODO: Add regimeType to CountryPopulation
            governmentEffectiveness: 0.5, // TODO: Add to CountryPopulation
            population: country.population || 0,
            qualityOfLife: 0.5, // TODO: Calculate from QoL system
            policies: {
              aiRegulation: 0.5, // TODO: Add to CountryPopulation
              climatePolicy: 0.5, // TODO: Add to CountryPopulation
              socialWelfare: 0.5, // TODO: Add to CountryPopulation
            },
          }))
        : [];

      const bilateralTensions: GovernmentResponse['bilateralTensions'] =
        state.bilateralTensions?.map(tension => ({
          country1: tension.nationA,
          country2: tension.nationB,
          tensionLevel: tension.tensionLevel,
          conflictProbability: tension.escalationLadder / 7, // Convert 0-7 ladder to 0-1 probability
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

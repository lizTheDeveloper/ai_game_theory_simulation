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

export async function GET(_request: NextRequest) {
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

      // Extract active crises from individual crisis systems
      if (state.phosphorusSystem?.crisisActive) {
        crises.push({
          type: 'Phosphorus Depletion',
          active: true,
          severity: (state.phosphorusSystem.crisisSeverity as any) || 'medium',
          affectedPopulation: state.phosphorusSystem.affectedPopulation || 0,
          interventionWindow: state.phosphorusSystem.interventionMonths || 0,
          cascadeMultiplier: 1.0,
          regionalImpact: {},
        });
      }

      if (state.freshwaterSystem?.crisisActive) {
        crises.push({
          type: 'Freshwater Scarcity',
          active: true,
          severity: (state.freshwaterSystem.crisisSeverity as any) || 'medium',
          affectedPopulation: state.freshwaterSystem.affectedPopulation || 0,
          interventionWindow: state.freshwaterSystem.interventionMonths || 0,
          cascadeMultiplier: 1.0,
          regionalImpact: {},
        });
      }

      if (state.oceanAcidificationSystem?.crisisActive) {
        crises.push({
          type: 'Ocean Acidification',
          active: true,
          severity: (state.oceanAcidificationSystem.crisisSeverity as any) || 'medium',
          affectedPopulation: state.oceanAcidificationSystem.affectedPopulation || 0,
          interventionWindow: state.oceanAcidificationSystem.interventionMonths || 0,
          cascadeMultiplier: 1.0,
          regionalImpact: {},
        });
      }

      if (state.novelEntitiesSystem?.crisisActive) {
        crises.push({
          type: 'Novel Entities (PFAS)',
          active: true,
          severity: (state.novelEntitiesSystem.crisisSeverity as any) || 'medium',
          affectedPopulation: state.novelEntitiesSystem.affectedPopulation || 0,
          interventionWindow: state.novelEntitiesSystem.interventionMonths || 0,
          cascadeMultiplier: 1.0,
          regionalImpact: {},
        });
      }

      if (state.nuclearSystem?.radiationActive) {
        crises.push({
          type: 'Nuclear Radiation',
          active: true,
          severity: 'critical',
          affectedPopulation: state.nuclearSystem.affectedPopulation || 0,
          interventionWindow: 0,
          cascadeMultiplier: 1.0,
          regionalImpact: {},
        });
      }

      const totalAffectedPopulation = crises.reduce(
        (sum, c) => sum + c.affectedPopulation,
        0
      );

      const data: CrisesResponse = {
        activeCrises: crises,
        cascadePotential: 0, // No global cascadePotential field
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

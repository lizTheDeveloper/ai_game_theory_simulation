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

export async function GET() {
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
      // Phosphorus: Use supplyShockActive or criticalDepletionActive
      const phosphorusCrisis = state.phosphorusSystem?.supplyShockActive || state.phosphorusSystem?.criticalDepletionActive;
      if (phosphorusCrisis) {
        const reserves = state.phosphorusSystem.reserves || 1.0;
        const severity = reserves < 0.3 ? 'critical' : reserves < 0.5 ? 'high' : 'medium';
        // Estimate affected population: Agricultural sector + dependent population (~40% global)
        const affectedPopulation = state.society?.totalPopulation ? state.society.totalPopulation * 0.4 : 0;

        crises.push({
          type: 'Phosphorus Depletion',
          active: true,
          severity,
          affectedPopulation,
          interventionWindow: state.phosphorusSystem.supplyShockDuration || 0,
          cascadeMultiplier: 1.0,
          regionalImpact: {},
        });
      }

      // Freshwater: Use dayZeroDrought.active or criticalScarcityActive
      const freshwaterCrisis = state.freshwaterSystem?.dayZeroDrought?.active || state.freshwaterSystem?.criticalScarcityActive;
      if (freshwaterCrisis) {
        const waterStress = state.freshwaterSystem.waterStress || 0;
        const severity = waterStress > 0.8 ? 'critical' : waterStress > 0.6 ? 'high' : 'medium';
        // Population stressed from freshwater system
        const affectedPopulation = state.society?.totalPopulation
          ? state.society.totalPopulation * (state.freshwaterSystem.populationStressed || 0.41)
          : 0;

        crises.push({
          type: 'Freshwater Scarcity',
          active: true,
          severity,
          affectedPopulation,
          interventionWindow: state.freshwaterSystem.dayZeroDrought?.duration || 0,
          cascadeMultiplier: 1.0,
          regionalImpact: {},
        });
      }

      // Ocean Acidification: Use boundaryBreached or specific collapse flags
      const oceanCrisis = state.oceanAcidificationSystem?.boundaryBreached
        || state.oceanAcidificationSystem?.coralExtinctionActive
        || state.oceanAcidificationSystem?.marineFoodWebCollapseActive;
      if (oceanCrisis) {
        const marineFoodWeb = state.oceanAcidificationSystem.marineFoodWeb || 1.0;
        const severity = marineFoodWeb < 0.4 ? 'critical' : marineFoodWeb < 0.7 ? 'high' : 'medium';
        // Fish-dependent impact (~3 billion people globally)
        const affectedPopulation = state.society?.totalPopulation
          ? state.society.totalPopulation * (state.oceanAcidificationSystem.fishDependentImpact || 0.3)
          : 0;

        crises.push({
          type: 'Ocean Acidification',
          active: true,
          severity,
          affectedPopulation,
          interventionWindow: 0, // Slow crisis, no clear intervention window
          cascadeMultiplier: 1.0,
          regionalImpact: {},
        });
      }

      // Novel Entities: Use boundaryBreached or specific crisis flags
      const novelEntitiesCrisis = state.novelEntitiesSystem?.boundaryBreached
        || state.novelEntitiesSystem?.reproductiveCrisisActive
        || state.novelEntitiesSystem?.chronicDiseaseEpidemicActive;
      if (novelEntitiesCrisis) {
        const chronicDisease = state.novelEntitiesSystem.chronicDiseasePrevalence || 0;
        const severity = chronicDisease > 0.6 ? 'critical' : chronicDisease > 0.4 ? 'high' : 'medium';
        // Global population affected (everyone exposed to some degree)
        const affectedPopulation = state.society?.totalPopulation
          ? state.society.totalPopulation * chronicDisease
          : 0;

        crises.push({
          type: 'Novel Entities (PFAS)',
          active: true,
          severity,
          affectedPopulation,
          interventionWindow: 0, // Very slow crisis (100-200 years)
          cascadeMultiplier: 1.0,
          regionalImpact: {},
        });
      }

      // Nuclear Winter: Use nuclearWinterState.active (not nuclearSystem)
      if (state.nuclearWinterState?.active) {
        // Calculate affected population from starvation rate
        const affectedPopulation = state.society?.totalPopulation
          ? state.society.totalPopulation * (state.nuclearWinterState.monthlyStarvationRate || 0.05)
          : 0;

        crises.push({
          type: 'Nuclear Winter',
          active: true,
          severity: 'critical',
          affectedPopulation,
          interventionWindow: state.nuclearWinterState.peakMortalityMonths - state.nuclearWinterState.monthsSinceWar || 0,
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

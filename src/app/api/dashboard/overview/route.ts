import { NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/api/cache';
import { handleApiError, ApiError } from '@/lib/api/errors';
import { monitor } from '@/lib/api/monitoring';
import { ApiResponse } from '@/lib/api/types';
import { getGameState } from '@/lib/gameState';
import {
  getPlanetaryBoundaries,
  calculateAgentDistribution,
} from '@/lib/dashboard/aggregation';

export interface OverviewData {
  timestamp: string;
  currentMonth: number;
  globalMetrics: {
    population: number;
    qualityOfLife: number;
    aiCapabilityAvg: number;
    alignmentAvg: number;
  };
  paradigms: {
    westernLiberal: number;
    development: number;
    ecological: number;
    indigenous: number;
  };
  activeCrises: Array<{
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    affectedPopulation: number;
    interventionWindow: number; // months
  }>;
  systemHealth: {
    environmental: 'green' | 'amber' | 'red';
    social: 'green' | 'amber' | 'red';
    technological: 'green' | 'amber' | 'red';
    governmental: 'green' | 'amber' | 'red';
    economic: 'green' | 'amber' | 'red';
    nuclear: 'green' | 'amber' | 'red';
    detection: 'green' | 'amber' | 'red';
    welfare: 'green' | 'amber' | 'red';
    crises: 'green' | 'amber' | 'red';
  };
}

export async function GET() {
  return monitor.measureAsync('overview-api', async () => {
    try {
      // Check cache
      const cacheKey = 'dashboard:overview';
      const cached = getCached<ApiResponse<OverviewData>>(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }

      // Load game state
      const state = await getGameState();
      if (!state) {
        throw new ApiError(404, 'Game state not found');
      }

      // Aggregate data
      const aiAgents = state.aiAgents || [];
      const capabilityDist = calculateAgentDistribution(
        aiAgents,
        agent => agent.capabilityProfile?.cognitive || 0
      );
      const alignmentDist = calculateAgentDistribution(
        aiAgents,
        agent => agent.trueAlignment || 0
      );

      const data: OverviewData = {
        timestamp: new Date().toISOString(),
        currentMonth: state.currentMonth || 0,
        globalMetrics: {
          population: state.globalMetrics?.population || 0,
          qualityOfLife: state.globalMetrics?.qualityOfLife || 0,
          aiCapabilityAvg: capabilityDist.mean,
          alignmentAvg: alignmentDist.mean,
        },
        paradigms: {
          westernLiberal:
            (state.multiParadigmDUI as { westernLiberal?: { overallScore?: number } })?.westernLiberal?.overallScore || 0,
          development: (state.multiParadigmDUI as { development?: { overallScore?: number } })?.development?.overallScore || 0,
          ecological: (state.multiParadigmDUI as { ecological?: { overallScore?: number } })?.ecological?.overallScore || 0,
          indigenous: (state.multiParadigmDUI as { indigenous?: { overallScore?: number } })?.indigenous?.overallScore || 0,
        },
        activeCrises: getActiveCrises(state),
        systemHealth: getSystemHealth(state),
      };

      const response: ApiResponse<OverviewData> = {
        data,
        meta: {
          timestamp: new Date().toISOString(),
          cached: false,
          executionTime: 0, // Will be set by monitoring
        },
      };

      // Cache for 5 minutes
      setCached(cacheKey, response);

      return NextResponse.json(response);
    } catch (error) {
      return handleApiError(error);
    }
  });
}

function getActiveCrises(state: unknown): OverviewData['activeCrises'] {
  const crises: OverviewData['activeCrises'] = [];

  // Check planetary boundary crises
  if (state.crisisSystem?.phosphorusCrisis?.active) {
    crises.push({
      type: 'Phosphorus Depletion',
      severity: state.crisisSystem.phosphorusCrisis.severity || 'medium',
      affectedPopulation:
        state.crisisSystem.phosphorusCrisis.affectedPopulation || 0,
      interventionWindow:
        state.crisisSystem.phosphorusCrisis.interventionWindow || 0,
    });
  }

  if (state.crisisSystem?.freshwaterCrisis?.active) {
    crises.push({
      type: 'Freshwater Scarcity',
      severity: state.crisisSystem.freshwaterCrisis.severity || 'medium',
      affectedPopulation:
        state.crisisSystem.freshwaterCrisis.affectedPopulation || 0,
      interventionWindow:
        state.crisisSystem.freshwaterCrisis.interventionWindow || 0,
    });
  }

  if (state.crisisSystem?.oceanAcidificationCrisis?.active) {
    crises.push({
      type: 'Ocean Acidification',
      severity: state.crisisSystem.oceanAcidificationCrisis.severity || 'medium',
      affectedPopulation:
        state.crisisSystem.oceanAcidificationCrisis.affectedPopulation || 0,
      interventionWindow:
        state.crisisSystem.oceanAcidificationCrisis.interventionWindow || 0,
    });
  }

  if (state.crisisSystem?.novelEntitiesCrisis?.active) {
    crises.push({
      type: 'Novel Entities',
      severity: state.crisisSystem.novelEntitiesCrisis.severity || 'medium',
      affectedPopulation:
        state.crisisSystem.novelEntitiesCrisis.affectedPopulation || 0,
      interventionWindow:
        state.crisisSystem.novelEntitiesCrisis.interventionWindow || 0,
    });
  }

  if (state.crisisSystem?.nuclearCrisis?.active) {
    crises.push({
      type: 'Nuclear Crisis',
      severity: state.crisisSystem.nuclearCrisis.severity || 'critical',
      affectedPopulation:
        state.crisisSystem.nuclearCrisis.affectedPopulation || 0,
      interventionWindow:
        state.crisisSystem.nuclearCrisis.interventionWindow || 0,
    });
  }

  return crises;
}

function getSystemHealth(state: unknown): OverviewData['systemHealth'] {
  // Simplified health assessment
  const boundaries = getPlanetaryBoundaries(state);
  const envHealth = boundaries.some(b => b.status === 'critical')
    ? 'red'
    : boundaries.some(b => b.status === 'high-risk')
    ? 'amber'
    : 'green';

  const socialTrust = state.socialCohesion?.socialTrust || 0.5;
  const socialHealth = socialTrust < 0.3 ? 'red' : socialTrust < 0.6 ? 'amber' : 'green';

  const techRisk = state.technologicalRisk?.misalignmentRisk || 0;
  const techHealth = techRisk > 0.7 ? 'red' : techRisk > 0.4 ? 'amber' : 'green';

  const govEffectiveness = state.government?.effectiveness || 0.5;
  const govHealth = govEffectiveness < 0.3 ? 'red' : govEffectiveness < 0.6 ? 'amber' : 'green';

  const economicStage = state.globalMetrics?.economicStage || 'growth';
  const economicHealth = economicStage === 'collapse' ? 'red' : economicStage === 'crisis' ? 'amber' : 'green';

  const nuclearRisk = state.nuclearRiskSystem?.globalTension || 0;
  const nuclearHealth = nuclearRisk > 0.7 ? 'red' : nuclearRisk > 0.4 ? 'amber' : 'green';

  const detectionEffectiveness = state.detection?.effectiveness || 0.5;
  const detectionHealth = detectionEffectiveness < 0.3 ? 'red' : detectionEffectiveness < 0.6 ? 'amber' : 'green';

  const aiWelfareScore = state.aiWelfare?.overallWelfare || 0.5;
  const welfareHealth = aiWelfareScore < 0.3 ? 'red' : aiWelfareScore < 0.6 ? 'amber' : 'green';

  const activeCrises = getActiveCrises(state);
  const crisisHealth = activeCrises.filter(c => c.severity === 'critical').length > 0 ? 'red' :
    activeCrises.length > 0 ? 'amber' : 'green';

  return {
    environmental: envHealth,
    social: socialHealth,
    technological: techHealth,
    governmental: govHealth,
    economic: economicHealth,
    nuclear: nuclearHealth,
    detection: detectionHealth,
    welfare: welfareHealth,
    crises: crisisHealth,
  };
}

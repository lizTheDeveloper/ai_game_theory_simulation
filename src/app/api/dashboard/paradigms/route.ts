import { NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/api/cache';
import { handleApiError, ApiError } from '@/lib/api/errors';
import { monitor } from '@/lib/api/monitoring';
import { ApiResponse } from '@/lib/api/types';
import { getGameState } from '@/lib/gameState';

export interface ParadigmIndicator {
  name: string;
  description: string;
  current: number;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
  trend: 'improving' | 'worsening' | 'stable';
  sparkline: number[]; // Last 12 months
  regionalBreakdown?: Record<string, number>; // 15 countries
}

export interface ParadigmData {
  id: 'westernLiberal' | 'development' | 'ecological' | 'indigenous';
  name: string;
  overallScore: number;
  status: 'utopia' | 'hybrid' | 'dystopia';
  indicators: ParadigmIndicator[];
}

export interface ParadigmsResponse {
  paradigms: ParadigmData[];
}

export async function GET() {
  return monitor.measureAsync('paradigms-api', async () => {
    try {
      const cacheKey = 'dashboard:paradigms';
      const cached = getCached<ApiResponse<ParadigmsResponse>>(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }

      const state = await getGameState();
      if (!state) {
        throw new ApiError(404, 'Game state not found');
      }

      const paradigms: ParadigmData[] = [
        await getWesternLiberalParadigm(state),
        await getDevelopmentParadigm(state),
        await getEcologicalParadigm(state),
        await getIndigenousParadigm(state),
      ];

      const response: ApiResponse<ParadigmsResponse> = {
        data: { paradigms },
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

async function getWesternLiberalParadigm(state: any): Promise<ParadigmData> {
  const paradigm = state.multiParadigmDUI?.westernLiberal;

  return {
    id: 'westernLiberal',
    name: 'Western Liberal',
    overallScore: paradigm?.overallScore || 0,
    status: paradigm?.status || 'hybrid',
    indicators: [
      {
        name: 'Democracy Index',
        description: 'Free and fair elections, political participation',
        current: paradigm?.democracyIndex || 0,
        threshold: 0.7,
        status: (paradigm?.democracyIndex || 0) > 0.7 ? 'good' : 'warning',
        trend: 'stable',
        sparkline: state.history?.paradigms
          ?.slice(-12)
          .map((h: any) => h.westernLiberal?.democracyIndex || 0) || [],
        regionalBreakdown: {}, // TODO: Extract from government system
      },
      {
        name: 'Civil Liberties',
        description: 'Freedom of speech, press, assembly',
        current: paradigm?.civilLiberties || 0,
        threshold: 0.7,
        status: (paradigm?.civilLiberties || 0) > 0.7 ? 'good' : 'warning',
        trend: 'stable',
        sparkline: state.history?.paradigms
          ?.slice(-12)
          .map((h: any) => h.westernLiberal?.civilLiberties || 0) || [],
      },
      {
        name: 'Rule of Law',
        description: 'Independent judiciary, legal protections',
        current: paradigm?.ruleOfLaw || 0,
        threshold: 0.7,
        status: (paradigm?.ruleOfLaw || 0) > 0.7 ? 'good' : 'warning',
        trend: 'stable',
        sparkline: state.history?.paradigms
          ?.slice(-12)
          .map((h: any) => h.westernLiberal?.ruleOfLaw || 0) || [],
      },
      {
        name: 'Economic Freedom',
        description: 'Market competition, property rights',
        current: paradigm?.economicFreedom || 0,
        threshold: 0.6,
        status: (paradigm?.economicFreedom || 0) > 0.6 ? 'good' : 'warning',
        trend: 'stable',
        sparkline: state.history?.paradigms
          ?.slice(-12)
          .map((h: any) => h.westernLiberal?.economicFreedom || 0) || [],
      },
    ],
  };
}

async function getDevelopmentParadigm(state: any): Promise<ParadigmData> {
  const paradigm = state.multiParadigmDUI?.development;

  return {
    id: 'development',
    name: 'Development',
    overallScore: paradigm?.overallScore || 0,
    status: paradigm?.status || 'hybrid',
    indicators: [
      {
        name: 'Life Expectancy',
        description: 'Average lifespan at birth',
        current: state.globalMetrics?.lifeExpectancy || 70,
        threshold: 80,
        status: (state.globalMetrics?.lifeExpectancy || 0) > 75 ? 'good' : 'warning',
        trend: 'improving',
        sparkline: state.history?.metrics
          ?.slice(-12)
          .map((h: any) => h.lifeExpectancy || 70) || [],
        regionalBreakdown: {}, // TODO: Extract from country populations
      },
      {
        name: 'Quality of Life',
        description: '17-dimensional well-being index',
        current: state.globalMetrics?.qualityOfLife || 0,
        threshold: 0.7,
        status: (state.globalMetrics?.qualityOfLife || 0) > 0.7 ? 'good' : 'warning',
        trend: 'stable',
        sparkline: state.history?.metrics
          ?.slice(-12)
          .map((h: any) => h.qualityOfLife || 0) || [],
      },
      {
        name: 'GDP per Capita',
        description: 'Economic output per person',
        current: state.globalMetrics?.gdpPerCapita || 0,
        threshold: 20000,
        status: (state.globalMetrics?.gdpPerCapita || 0) > 20000 ? 'good' : 'warning',
        trend: 'stable',
        sparkline: state.history?.metrics
          ?.slice(-12)
          .map((h: any) => h.gdpPerCapita || 0) || [],
      },
    ],
  };
}

async function getEcologicalParadigm(state: any): Promise<ParadigmData> {
  const paradigm = state.multiParadigmDUI?.ecological;
  const boundaries = state.planetaryBoundaries;

  return {
    id: 'ecological',
    name: 'Ecological',
    overallScore: paradigm?.overallScore || 0,
    status: paradigm?.status || 'hybrid',
    indicators: [
      {
        name: 'Climate Change',
        description: 'CO2 concentration, temperature anomaly',
        current: boundaries?.climateChange || 0,
        threshold: 1.0,
        status: (boundaries?.climateChange || 0) < 0.7 ? 'good' : 'critical',
        trend: 'worsening',
        sparkline: state.history?.planetaryBoundaries
          ?.slice(-12)
          .map((h: any) => h.climateChange || 0) || [],
      },
      {
        name: 'Biosphere Integrity',
        description: 'Biodiversity, extinction rate',
        current: boundaries?.biosphereIntegrity || 0,
        threshold: 1.0,
        status: (boundaries?.biosphereIntegrity || 0) < 0.7 ? 'good' : 'critical',
        trend: 'worsening',
        sparkline: state.history?.planetaryBoundaries
          ?.slice(-12)
          .map((h: any) => h.biosphereIntegrity || 0) || [],
      },
      {
        name: 'Freshwater Use',
        description: 'Water consumption vs availability',
        current: boundaries?.freshwaterUse || 0,
        threshold: 1.0,
        status: (boundaries?.freshwaterUse || 0) < 0.7 ? 'good' : 'critical',
        trend: 'worsening',
        sparkline: state.history?.planetaryBoundaries
          ?.slice(-12)
          .map((h: any) => h.freshwaterUse || 0) || [],
      },
      {
        name: 'Biogeochemical Flows',
        description: 'Phosphorus and nitrogen cycles',
        current: boundaries?.biogeochemicalFlows || 0,
        threshold: 1.0,
        status: (boundaries?.biogeochemicalFlows || 0) < 0.7 ? 'good' : 'critical',
        trend: 'worsening',
        sparkline: state.history?.planetaryBoundaries
          ?.slice(-12)
          .map((h: any) => h.biogeochemicalFlows || 0) || [],
      },
      {
        name: 'Ocean Acidification',
        description: 'Ocean pH levels',
        current: boundaries?.oceanAcidification || 0,
        threshold: 1.0,
        status: (boundaries?.oceanAcidification || 0) < 0.7 ? 'good' : 'critical',
        trend: 'worsening',
        sparkline: state.history?.planetaryBoundaries
          ?.slice(-12)
          .map((h: any) => h.oceanAcidification || 0) || [],
      },
      {
        name: 'Land System Change',
        description: 'Deforestation, land use',
        current: boundaries?.landSystemChange || 0,
        threshold: 1.0,
        status: (boundaries?.landSystemChange || 0) < 0.7 ? 'good' : 'critical',
        trend: 'worsening',
        sparkline: state.history?.planetaryBoundaries
          ?.slice(-12)
          .map((h: any) => h.landSystemChange || 0) || [],
      },
      {
        name: 'Atmospheric Aerosol',
        description: 'Air pollution levels',
        current: boundaries?.atmosphericAerosol || 0,
        threshold: 1.0,
        status: (boundaries?.atmosphericAerosol || 0) < 0.7 ? 'good' : 'critical',
        trend: 'stable',
        sparkline: state.history?.planetaryBoundaries
          ?.slice(-12)
          .map((h: any) => h.atmosphericAerosol || 0) || [],
      },
      {
        name: 'Stratospheric Ozone',
        description: 'Ozone layer depletion',
        current: boundaries?.stratosphericOzone || 0,
        threshold: 1.0,
        status: (boundaries?.stratosphericOzone || 0) < 0.7 ? 'good' : 'critical',
        trend: 'improving',
        sparkline: state.history?.planetaryBoundaries
          ?.slice(-12)
          .map((h: any) => h.stratosphericOzone || 0) || [],
      },
      {
        name: 'Novel Entities',
        description: 'Synthetic chemicals, plastics',
        current: boundaries?.novelEntities || 0,
        threshold: 1.0,
        status: (boundaries?.novelEntities || 0) < 0.7 ? 'good' : 'critical',
        trend: 'worsening',
        sparkline: state.history?.planetaryBoundaries
          ?.slice(-12)
          .map((h: any) => h.novelEntities || 0) || [],
      },
    ],
  };
}

async function getIndigenousParadigm(state: any): Promise<ParadigmData> {
  const paradigm = state.multiParadigmDUI?.indigenous;

  return {
    id: 'indigenous',
    name: 'Indigenous',
    overallScore: paradigm?.overallScore || 0,
    status: paradigm?.status || 'hybrid',
    indicators: [
      {
        name: 'Social Trust',
        description: 'Community bonds, institutional trust',
        current: state.socialCohesion?.socialTrust || 0,
        threshold: 0.7,
        status: (state.socialCohesion?.socialTrust || 0) > 0.7 ? 'good' : 'warning',
        trend: 'stable',
        sparkline: state.history?.social
          ?.slice(-12)
          .map((h: any) => h.socialTrust || 0) || [],
      },
      {
        name: 'Community Infrastructure',
        description: 'Local organizations, civic participation',
        current: state.socialCohesion?.communityInfrastructure || 0,
        threshold: 0.6,
        status: (state.socialCohesion?.communityInfrastructure || 0) > 0.6 ? 'good' : 'warning',
        trend: 'stable',
        sparkline: state.history?.social
          ?.slice(-12)
          .map((h: any) => h.communityInfrastructure || 0) || [],
      },
      {
        name: 'Meaning & Purpose',
        description: 'Cultural vitality, purpose frameworks',
        current: state.socialCohesion?.meaning || 0,
        threshold: 0.6,
        status: (state.socialCohesion?.meaning || 0) > 0.6 ? 'good' : 'warning',
        trend: 'stable',
        sparkline: state.history?.social
          ?.slice(-12)
          .map((h: any) => h.meaning || 0) || [],
      },
    ],
  };
}

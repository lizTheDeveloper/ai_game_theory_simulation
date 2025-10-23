import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/api/cache';
import { handleApiError, ApiError } from '@/lib/api/errors';
import { monitor } from '@/lib/api/monitoring';
import { ApiResponse } from '@/lib/api/types';
import { getGameState } from '@/lib/gameState';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  return monitor.measureAsync(`paradigm-detail-${params.id}`, async () => {
    try {
      const { id } = params;

      const validIds = ['westernLiberal', 'development', 'ecological', 'indigenous'];
      if (!validIds.includes(id)) {
        throw new ApiError(400, `Invalid paradigm ID: ${id}`);
      }

      const cacheKey = `dashboard:paradigm:${id}`;
      const cached = getCached<ApiResponse<any>>(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }

      const state = await getGameState();
      if (!state) {
        throw new ApiError(404, 'Game state not found');
      }

      // Get detailed paradigm data with regional breakdown
      const data = await getParadigmDetail(state, id);

      const response: ApiResponse<any> = {
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

async function getParadigmDetail(state: any, id: string) {
  const paradigm = state.multiParadigmDUI?.[id];

  // Get regional breakdown
  const countries = state.countryPopulationSystem?.countries || [];
  const regionalBreakdown = countries.reduce((acc: any, country: any) => {
    acc[country.name] = country[id] || paradigm?.overallScore || 0;
    return acc;
  }, {});

  return {
    id,
    name: getParadigmName(id),
    overallScore: paradigm?.overallScore || 0,
    status: paradigm?.status || 'hybrid',
    regionalBreakdown,
    history: state.history?.paradigms?.slice(-24).map((h: any) => ({
      month: h.month,
      score: h[id]?.overallScore || 0,
    })) || [],
    components: paradigm || {},
  };
}

function getParadigmName(id: string): string {
  const names: Record<string, string> = {
    westernLiberal: 'Western Liberal',
    development: 'Development',
    ecological: 'Ecological',
    indigenous: 'Indigenous',
  };
  return names[id] || id;
}

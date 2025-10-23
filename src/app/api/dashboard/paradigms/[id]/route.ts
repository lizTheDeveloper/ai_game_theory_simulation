import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/api/cache';
import { handleApiError, ApiError } from '@/lib/api/errors';
import { monitor } from '@/lib/api/monitoring';
import { ApiResponse } from '@/lib/api/types';
import { getGameState } from '@/lib/gameState';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return monitor.measureAsync(`paradigm-detail-${id}`, async () => {
    try {

      const validIds = ['westernLiberal', 'development', 'ecological', 'indigenous'];
      if (!validIds.includes(id)) {
        throw new ApiError(400, `Invalid paradigm ID: ${id}`);
      }

      const cacheKey = `dashboard:paradigm:${id}`;
      const cached = getCached<ApiResponse<unknown>>(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }

      const state = await getGameState();
      if (!state) {
        throw new ApiError(404, 'Game state not found');
      }

      // Get detailed paradigm data with regional breakdown
      const data = await getParadigmDetail(state, id);

      const response: ApiResponse<unknown> = {
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

async function getParadigmDetail(state: unknown, id: string) {
  const paradigm = (state as { multiParadigmDUI?: Record<string, unknown> }).multiParadigmDUI?.[id];

  // Get regional breakdown
  const countries = (state as { countryPopulationSystem?: { countries?: unknown[] } }).countryPopulationSystem?.countries || [];
  const regionalBreakdown = countries.reduce((acc: Record<string, number>, country: unknown) => {
    const countryObj = country as { name: string; [key: string]: unknown };
    acc[countryObj.name] = (countryObj[id] as number) || (paradigm as { overallScore?: number })?.overallScore || 0;
    return acc;
  }, {});

  return {
    id,
    name: getParadigmName(id),
    overallScore: (paradigm as { overallScore?: number })?.overallScore || 0,
    status: (paradigm as { status?: string })?.status || 'hybrid',
    regionalBreakdown,
    history: (state as { history?: { paradigms?: unknown[] } }).history?.paradigms?.slice(-24).map((h: unknown) => ({
      month: (h as { month: number }).month,
      score: ((h as Record<string, { overallScore?: number }>)[id])?.overallScore || 0,
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

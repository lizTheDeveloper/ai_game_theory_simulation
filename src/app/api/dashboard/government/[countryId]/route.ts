import { NextRequest, NextResponse } from 'next/server';
import { getCached, setCached } from '@/lib/api/cache';
import { handleApiError, ApiError } from '@/lib/api/errors';
import { monitor } from '@/lib/api/monitoring';
import { getGameState } from '@/lib/gameState';

export async function GET(
  _request: NextRequest,
  { params }: { params: { countryId: string } }
) {
  return monitor.measureAsync(`government-detail-${params.countryId}`, async () => {
    try {
      const { countryId } = params;
      const cacheKey = `dashboard:government:${countryId}`;
      const cached = getCached(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }

      const state = await getGameState();
      if (!state) {
        throw new ApiError(404, 'Game state not found');
      }

      const country = state.countryPopulationSystem?.countries?.find(
        c => c.id === countryId
      );
      if (!country) {
        throw new ApiError(404, `Country not found: ${countryId}`);
      }

      // Return detailed country data (full country object)
      const data = country;

      setCached(cacheKey, data);
      return NextResponse.json(data);
    } catch (error) {
      return handleApiError(error);
    }
  });
}

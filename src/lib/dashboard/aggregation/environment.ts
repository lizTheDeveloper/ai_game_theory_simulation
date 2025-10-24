import { GameState } from '@/types/game';
import { BoundaryName } from '@/types/planetaryBoundaries';

export interface PlanetaryBoundaryData {
  name: BoundaryName;
  current: number;
  threshold: number;
  safeZone: number;
  status: 'safe' | 'increasing-risk' | 'high-risk' | 'critical';
  trend: 'improving' | 'worsening' | 'stable';
  regionalVariation?: Record<string, number>;
}

export function getPlanetaryBoundaries(
  state: GameState
): PlanetaryBoundaryData[] {
  const boundaries = state.planetaryBoundariesSystem;
  if (!boundaries) return [];

  const boundaryNames: BoundaryName[] = [
    'climate_change',
    'biosphere_integrity',
    'land_system_change',
    'freshwater_change',
    'biogeochemical_flows',
    'ocean_acidification',
    'atmospheric_aerosols',
    'stratospheric_ozone',
    'novel_entities',
  ];

  return boundaryNames.map(name => {
    const current = (boundaries as any)[name] || 0;
    const threshold = 1.0; // Normalized threshold
    const safeZone = 0.7; // Safe operating space

    let status: PlanetaryBoundaryData['status'] = 'safe';
    if (current >= threshold) status = 'critical';
    else if (current >= 0.9) status = 'high-risk';
    else if (current >= safeZone) status = 'increasing-risk';

    // Calculate trend from history
    const history = (state.history as any)?.planetaryBoundariesSystem || [];
    const recentValues = history.slice(-6).map(h => (h as any)?.[name] || 0);
    const trend =
      recentValues.length >= 2 &&
      recentValues[recentValues.length - 1] <
        recentValues[recentValues.length - 2]
        ? 'improving'
        : recentValues.length >= 2 &&
          recentValues[recentValues.length - 1] >
            recentValues[recentValues.length - 2]
        ? 'worsening'
        : 'stable';

    return {
      name,
      current,
      threshold,
      safeZone,
      status,
      trend,
    };
  });
}

import { GameState, PlanetaryBoundaryName } from '@/types/game';

export interface PlanetaryBoundaryData {
  name: PlanetaryBoundaryName;
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

  const boundaryNames: PlanetaryBoundaryName[] = [
    'climateChange',
    'biosphereIntegrity',
    'landSystemChange',
    'freshwaterUse',
    'biogeochemicalFlows',
    'oceanAcidification',
    'atmosphericAerosol',
    'stratosphericOzone',
    'novelEntities',
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

import { GameState } from '@/types/game';
import { BoundaryName, BoundaryStatus, BoundaryTrend } from '@/types/planetaryBoundaries';

export interface PlanetaryBoundaryData {
  name: BoundaryName;
  displayName: string;
  current: number;
  threshold: number;
  safeZone: number;
  status: BoundaryStatus;
  trend: BoundaryTrend;
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
    const boundary = boundaries.boundaries?.[name];
    if (!boundary) {
      return {
        name,
        displayName: name.replace(/_/g, ' '),
        current: 0,
        threshold: 1.0,
        safeZone: 0.7,
        status: 'safe' as BoundaryStatus,
        trend: 'stable' as BoundaryTrend,
      };
    }

    return {
      name,
      displayName: boundary.displayName,
      current: boundary.currentValue,
      threshold: boundary.boundaryThreshold,
      safeZone: 0.7, // Safe operating space
      status: boundary.status,
      trend: boundary.trend,
    };
  });
}

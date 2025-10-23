import { GameState } from '@/types/game';

export interface QoLDistribution {
  global: {
    average: number;
    byTier: Record<string, number>; // Percentage in each tier
    byDimension: Record<string, number>; // 17 dimensions
  };
  regional: Array<{
    country: string;
    average: number;
    byTier: Record<string, number>;
  }>;
  inequality: {
    gini: number;
    topVsBottom: number; // Top 10% vs bottom 10%
  };
}

export function getQoLDistribution(state: GameState): QoLDistribution {
  const countries = state.countryPopulationSystem?.countries || {};
  const totalPop = state.globalMetrics?.population || 1;

  // Calculate global average (population-weighted)
  let globalAvg = 0;
  const tierCounts: Record<string, number> = {
    tier0: 0,
    tier1: 0,
    tier2: 0,
    tier3: 0,
    tier4: 0,
  };

  for (const country of Object.values(countries)) {
    const pop = country.population;
    // Use population pressure as a proxy for QoL (inverse relationship)
    const qol = Math.max(0, 1 - (country.populationPressure || 0));
    globalAvg += (qol * pop) / totalPop;

    // Classify into tier (placeholder logic)
    const tier = Math.floor(qol * 5);
    const tierKey = `tier${Math.min(tier, 4)}`;
    if (tierCounts[tierKey] !== undefined) {
      tierCounts[tierKey] += pop;
    }
  }

  // Convert to percentages
  const byTier = Object.fromEntries(
    Object.entries(tierCounts).map(([tier, count]) => [
      tier,
      (count / totalPop) * 100,
    ])
  );

  // Regional breakdown
  const regional = Object.entries(countries).map(([name, country]) => ({
    country: name,
    average: Math.max(0, 1 - (country.populationPressure || 0)),
    byTier: {
      // Simplified - would need detailed tier tracking
      tier0: 0,
      tier1: 0,
      tier2: 0,
      tier3: 0,
      tier4: 0,
    },
  }));

  // Inequality metrics (simplified)
  const qolValues = Object.values(countries)
    .map(c => Math.max(0, 1 - (c.populationPressure || 0)))
    .sort((a: number, b: number) => a - b);
  const top10Count = Math.ceil(qolValues.length * 0.1);
  const top10 =
    qolValues.slice(-top10Count).reduce((a: number, b: number) => a + b, 0) / top10Count || 0;
  const bottom10 =
    qolValues.slice(0, top10Count).reduce((a: number, b: number) => a + b, 0) / top10Count || 0;

  return {
    global: {
      average: globalAvg,
      byTier,
      byDimension: {}, // TODO: Extract from state
    },
    regional,
    inequality: {
      gini: 0, // TODO: Calculate Gini coefficient
      topVsBottom: top10 / (bottom10 || 1),
    },
  };
}

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
  const countriesRecord = state.countryPopulationSystem?.countries || {};
  const countries = Object.values(countriesRecord);
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

  for (const country of countries) {
    const pop = country.population;
    // TODO: Extract per-country QoL from qualityOfLifeSystems
    const qol = 0.5; // Placeholder - need to map country to QoL data
    globalAvg += (qol * pop) / totalPop;

    // Classify into tier (placeholder logic)
    const tier = Math.floor(qol * 5);
    const tierKey = `tier${Math.min(tier, 4)}`;
    tierCounts[tierKey] = (tierCounts[tierKey] ?? 0) + pop;
  }

  // Regional breakdown
  const regional = countries.map(country => ({
    country: country.name,
    average: 0.5, // TODO: Extract per-country QoL
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
  const qolValues = countries
    .map(() => 0.5) // TODO: Extract per-country QoL
    .sort((a, b) => a - b);
  const top10Count = Math.ceil(qolValues.length * 0.1);
  const top10Sum = qolValues.slice(-top10Count).reduce((a, b) => a + b, 0);
  const bottom10Sum = qolValues.slice(0, top10Count).reduce((a, b) => a + b, 0);
  const top10 = top10Count > 0 ? top10Sum / top10Count : 0;
  const bottom10 = top10Count > 0 ? bottom10Sum / top10Count : 0;

  return {
    global: {
      average: globalAvg,
      byTier: Object.fromEntries(
        Object.entries(tierCounts).map(([tier, count]) => [
          tier,
          (count / totalPop) * 100,
        ])
      ),
      byDimension: {}, // TODO: Extract 17 dimensions
    },
    regional,
    inequality: {
      gini: 0, // TODO: Calculate Gini coefficient
      topVsBottom: bottom10 > 0 ? top10 / bottom10 : 0,
    },
  };
}

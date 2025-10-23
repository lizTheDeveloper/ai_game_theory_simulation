import { GameState } from '@/types/game';
import { CountryPopulation } from '@/types/countryPopulations';

export interface RegionalSummary {
  total: number;
  byCountry: Record<string, number>;
  topCountries: Array<{ country: string; value: number }>;
  bottomCountries: Array<{ country: string; value: number }>;
}

/**
 * Aggregate metric across 15 regions
 */
export function aggregateRegional(
  state: GameState,
  metric: (country: CountryPopulation) => number
): RegionalSummary {
  const countriesRecord = state.countryPopulationSystem?.countries || {};
  const countries = Object.values(countriesRecord);

  const byCountry: Record<string, number> = {};
  let total = 0;

  for (const country of countries) {
    const value = metric(country);
    byCountry[country.name] = value;
    total += value;
  }

  // Sort for top/bottom
  const sorted = Object.entries(byCountry)
    .map(([country, value]) => ({ country, value }))
    .sort((a, b) => b.value - a.value);

  return {
    total,
    byCountry,
    topCountries: sorted.slice(0, 5),
    bottomCountries: sorted.slice(-5).reverse(),
  };
}

/**
 * Get small multiples data (for regional comparisons)
 */
export function getSmallMultiples(
  state: GameState,
  metrics: Record<string, (country: CountryPopulation) => number>
): Array<{
  country: string;
  values: Record<string, number>;
}> {
  const countriesRecord = state.countryPopulationSystem?.countries || {};
  const countries = Object.values(countriesRecord);

  return countries.map(country => ({
    country: country.name,
    values: Object.fromEntries(
      Object.entries(metrics).map(([key, fn]) => [key, fn(country)])
    ),
  }));
}

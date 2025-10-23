import { GameState } from '@/types/game';

export interface GovernmentSummary {
  totalCountries: number;
  byGovernmentType: Record<string, number>;
  averageLegitimacy: number;
  averageEnforcementCapacity: number;
  activePolicies: number;
  coalitionCount: number;
}

export function getGovernmentSummary(state: GameState): GovernmentSummary {
  const govSystem = state.governmentSystem;

  if (!govSystem) {
    return {
      totalCountries: 0,
      byGovernmentType: {},
      averageLegitimacy: 0,
      averageEnforcementCapacity: 0,
      activePolicies: 0,
      coalitionCount: 0,
    };
  }

  // Count governments by type
  const governments = Array.from(govSystem.governments?.values() || []);
  const byGovernmentType: Record<string, number> = {};

  for (const gov of governments) {
    const type = (gov as any)?.type || 'unknown';
    byGovernmentType[type] = (byGovernmentType[type] || 0) + 1;
  }

  // Calculate averages (placeholder - actual implementation depends on government structure)
  const averageLegitimacy = 0.5; // TODO: Extract from government data
  const averageEnforcementCapacity = 0.5; // TODO: Extract from government data

  return {
    totalCountries: governments.length,
    byGovernmentType,
    averageLegitimacy,
    averageEnforcementCapacity,
    activePolicies: govSystem.activePolicies?.length || 0,
    coalitionCount: govSystem.coalitions?.size || 0,
  };
}

export interface CountryGovernmentDetail {
  countryCode: string;
  governmentType: string;
  legitimacy: number;
  enforcementCapacity: number;
  inCoalition: boolean;
  activePolicies: string[];
}

export function getCountryGovernmentDetails(
  state: GameState
): CountryGovernmentDetail[] {
  const govSystem = state.governmentSystem;

  if (!govSystem) {
    return [];
  }

  const governments = Array.from(govSystem.governments?.entries() || []);

  return governments.map(([countryCode, gov]) => ({
    countryCode,
    governmentType: (gov as any)?.type || 'unknown',
    legitimacy: (gov as any)?.legitimacy || 0,
    enforcementCapacity: (gov as any)?.enforcementCapacity || 0,
    inCoalition: govSystem.coalitions?.has(countryCode) || false,
    activePolicies: [], // TODO: Filter active policies by country
  }));
}

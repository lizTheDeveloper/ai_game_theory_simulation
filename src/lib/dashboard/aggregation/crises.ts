import { GameState } from '@/types/game';

export interface CrisisSummary {
  active: boolean;
  crisisTypes: Array<{
    type: string;
    severity: number;
    affectedPopulation: number;
    startMonth: number;
    duration: number;
  }>;
  cascadeActive: boolean;
  cascadeMultiplier: number;
  totalAffectedPopulation: number;
}

export function getCrisisSummary(state: GameState): CrisisSummary {
  const crisisTypes: CrisisSummary['crisisTypes'] = [];
  let totalAffectedPopulation = 0;

  // Planetary boundary cascade
  if (state.planetaryBoundariesSystem?.cascadeActive) {
    crisisTypes.push({
      type: 'planetary_boundary_cascade',
      severity: state.planetaryBoundariesSystem.cascadeSeverity || 0,
      affectedPopulation: state.globalMetrics?.population || 0,
      startMonth: state.planetaryBoundariesSystem.cascadeStartMonth || 0,
      duration: state.currentMonth - (state.planetaryBoundariesSystem.cascadeStartMonth || 0),
    });
    totalAffectedPopulation = state.globalMetrics?.population || 0;
  }

  // Phosphorus crisis
  if ((state as any).phosphorusCrisis?.active) {
    const pop = state.globalMetrics?.population || 0;
    const affectedPop = pop * ((state as any).phosphorusCrisis?.severity || 0);
    crisisTypes.push({
      type: 'phosphorus_crisis',
      severity: (state as any).phosphorusCrisis?.severity || 0,
      affectedPopulation: affectedPop,
      startMonth: (state as any).phosphorusCrisis?.startMonth || 0,
      duration: state.currentMonth - ((state as any).phosphorusCrisis?.startMonth || 0),
    });
    totalAffectedPopulation = Math.max(totalAffectedPopulation, affectedPop);
  }

  // Freshwater crisis
  if ((state as any).freshwaterCrisis?.active) {
    const pop = state.globalMetrics?.population || 0;
    const affectedPop = pop * ((state as any).freshwaterCrisis?.severity || 0);
    crisisTypes.push({
      type: 'freshwater_crisis',
      severity: (state as any).freshwaterCrisis?.severity || 0,
      affectedPopulation: affectedPop,
      startMonth: (state as any).freshwaterCrisis?.startMonth || 0,
      duration: state.currentMonth - ((state as any).freshwaterCrisis?.startMonth || 0),
    });
    totalAffectedPopulation = Math.max(totalAffectedPopulation, affectedPop);
  }

  // Novel entities crisis (PFAS, microplastics)
  if ((state as any).novelEntitiesCrisis?.active) {
    const pop = state.globalMetrics?.population || 0;
    const affectedPop = pop * ((state as any).novelEntitiesCrisis?.severity || 0);
    crisisTypes.push({
      type: 'novel_entities_crisis',
      severity: (state as any).novelEntitiesCrisis?.severity || 0,
      affectedPopulation: affectedPop,
      startMonth: (state as any).novelEntitiesCrisis?.startMonth || 0,
      duration: state.currentMonth - ((state as any).novelEntitiesCrisis?.startMonth || 0),
    });
    totalAffectedPopulation = Math.max(totalAffectedPopulation, affectedPop);
  }

  // Ocean acidification crisis
  if ((state as any).oceanAcidificationCrisis?.active) {
    const pop = state.globalMetrics?.population || 0;
    const affectedPop = pop * ((state as any).oceanAcidificationCrisis?.severity || 0);
    crisisTypes.push({
      type: 'ocean_acidification_crisis',
      severity: (state as any).oceanAcidificationCrisis?.severity || 0,
      affectedPopulation: affectedPop,
      startMonth: (state as any).oceanAcidificationCrisis?.startMonth || 0,
      duration: state.currentMonth - ((state as any).oceanAcidificationCrisis?.startMonth || 0),
    });
    totalAffectedPopulation = Math.max(totalAffectedPopulation, affectedPop);
  }

  return {
    active: crisisTypes.length > 0,
    crisisTypes,
    cascadeActive: state.planetaryBoundariesSystem?.cascadeActive || false,
    cascadeMultiplier: state.planetaryBoundariesSystem?.cascadeMultiplier || 1.0,
    totalAffectedPopulation,
  };
}

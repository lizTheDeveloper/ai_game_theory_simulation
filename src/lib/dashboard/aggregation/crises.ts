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

/**
 * Extended state type for potential crisis fields.
 * Note: These fields are not currently written by simulation phases,
 * but this type documents the expected structure if they were to be added.
 */
type StateWithOptionalCrises = GameState & {
  phosphorusCrisis?: { active: boolean; severity: number; startMonth: number };
  freshwaterCrisis?: { active: boolean; severity: number; startMonth: number };
  novelEntitiesCrisis?: { active: boolean; severity: number; startMonth: number };
  oceanAcidificationCrisis?: { active: boolean; severity: number; startMonth: number };
};

export function getCrisisSummary(state: StateWithOptionalCrises): CrisisSummary {
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
  if (state.phosphorusCrisis?.active) {
    const pop = state.globalMetrics?.population || 0;
    const affectedPop = pop * (state.phosphorusCrisis?.severity || 0);
    crisisTypes.push({
      type: 'phosphorus_crisis',
      severity: state.phosphorusCrisis?.severity || 0,
      affectedPopulation: affectedPop,
      startMonth: state.phosphorusCrisis?.startMonth || 0,
      duration: state.currentMonth - (state.phosphorusCrisis?.startMonth || 0),
    });
    totalAffectedPopulation = Math.max(totalAffectedPopulation, affectedPop);
  }

  // Freshwater crisis
  if (state.freshwaterCrisis?.active) {
    const pop = state.globalMetrics?.population || 0;
    const affectedPop = pop * (state.freshwaterCrisis?.severity || 0);
    crisisTypes.push({
      type: 'freshwater_crisis',
      severity: state.freshwaterCrisis?.severity || 0,
      affectedPopulation: affectedPop,
      startMonth: state.freshwaterCrisis?.startMonth || 0,
      duration: state.currentMonth - (state.freshwaterCrisis?.startMonth || 0),
    });
    totalAffectedPopulation = Math.max(totalAffectedPopulation, affectedPop);
  }

  // Novel entities crisis (PFAS, microplastics)
  if (state.novelEntitiesCrisis?.active) {
    const pop = state.globalMetrics?.population || 0;
    const affectedPop = pop * (state.novelEntitiesCrisis?.severity || 0);
    crisisTypes.push({
      type: 'novel_entities_crisis',
      severity: state.novelEntitiesCrisis?.severity || 0,
      affectedPopulation: affectedPop,
      startMonth: state.novelEntitiesCrisis?.startMonth || 0,
      duration: state.currentMonth - (state.novelEntitiesCrisis?.startMonth || 0),
    });
    totalAffectedPopulation = Math.max(totalAffectedPopulation, affectedPop);
  }

  // Ocean acidification crisis
  if (state.oceanAcidificationCrisis?.active) {
    const pop = state.globalMetrics?.population || 0;
    const affectedPop = pop * (state.oceanAcidificationCrisis?.severity || 0);
    crisisTypes.push({
      type: 'ocean_acidification_crisis',
      severity: state.oceanAcidificationCrisis?.severity || 0,
      affectedPopulation: affectedPop,
      startMonth: state.oceanAcidificationCrisis?.startMonth || 0,
      duration: state.currentMonth - (state.oceanAcidificationCrisis?.startMonth || 0),
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

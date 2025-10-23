import { GameState } from '@/types/game';

export interface TechnologyTreeSummary {
  totalTechnologies: number;
  unlocked: number;
  researching: number;
  deployed: number;
  byCategory: Record<string, {
    total: number;
    unlocked: number;
    deployed: number;
  }>;
  byTier: Record<number, {
    total: number;
    unlocked: number;
    deployed: number;
  }>;
}

export function getTechnologyTreeSummary(state: GameState): TechnologyTreeSummary {
  if (!state.technologyTree || !state.techTreeState) {
    return {
      totalTechnologies: 0,
      unlocked: 0,
      researching: 0,
      deployed: 0,
      byCategory: {},
      byTier: {},
    };
  }

  const technologies = state.technologyTree;
  const unlockedSet = new Set(state.techTreeState.unlockedTech || []);
  const totalTechnologies = technologies.length;

  let unlocked = 0;
  let researching = 0;
  let deployed = 0;

  const byCategory: TechnologyTreeSummary['byCategory'] = {};
  const byTier: TechnologyTreeSummary['byTier'] = {};

  for (const tech of technologies) {
    const isUnlocked = unlockedSet.has(tech.id);
    const isCompleted = tech.completed;

    if (isUnlocked) unlocked++;
    if (tech.progress > 0 && tech.progress < 1) researching++;
    if (isCompleted) deployed++;

    // By category (using branch as category)
    const category = tech.branch || 'unknown';
    if (!byCategory[category]) {
      byCategory[category] = { total: 0, unlocked: 0, deployed: 0 };
    }
    byCategory[category]!.total++;
    if (isUnlocked) byCategory[category]!.unlocked++;
    if (isCompleted) byCategory[category]!.deployed++;

    // By tier (new tech tree doesn't use tiers, so all go into tier 0)
    const tier = 0;
    if (!byTier[tier]) {
      byTier[tier] = { total: 0, unlocked: 0, deployed: 0 };
    }
    byTier[tier]!.total++;
    if (isUnlocked) byTier[tier]!.unlocked++;
    if (isCompleted) byTier[tier]!.deployed++;
  }

  return {
    totalTechnologies,
    unlocked,
    researching,
    deployed,
    byCategory,
    byTier,
  };
}

export interface TechnologyDetail {
  id: string;
  name: string;
  category: string;
  unlocked: boolean;
  researchProgress: number;
  deploymentLevel: number;
  prerequisites: string[];
  tier: number;
}

export function getTechnologyDetails(state: GameState): TechnologyDetail[] {
  if (!state.technologyTree || !state.techTreeState) {
    return [];
  }

  const unlockedSet = new Set(state.techTreeState.unlockedTech || []);
  const technologies = state.technologyTree;

  return technologies.map(tech => {
    return {
      id: tech.id,
      name: tech.name,
      category: tech.branch || 'unknown',
      unlocked: unlockedSet.has(tech.id),
      researchProgress: tech.progress,
      deploymentLevel: tech.completed ? 1.0 : 0,
      prerequisites: tech.prerequisites || [],
      tier: 0, // New tech tree doesn't use tiers
    };
  });
}

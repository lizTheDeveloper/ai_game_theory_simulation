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
  const techState = state.breakthroughTech;

  if (!techState) {
    return {
      totalTechnologies: 0,
      unlocked: 0,
      researching: 0,
      deployed: 0,
      byCategory: {},
      byTier: {},
    };
  }

  // Extract all technology nodes from the state (they're individual fields)
  const technologies = Object.values(techState).filter(
    (value): value is import('@/types/technologies').TechnologyNode =>
      typeof value === 'object' && value !== null && 'id' in value && 'unlocked' in value
  );
  const totalTechnologies = technologies.length;

  let unlocked = 0;
  let researching = 0;
  let deployed = 0;

  const byCategory: TechnologyTreeSummary['byCategory'] = {};
  const byTier: TechnologyTreeSummary['byTier'] = {};

  for (const tech of technologies) {
    if (tech.unlocked) unlocked++;
    if (tech.researchProgress > 0 && tech.researchProgress < 1) researching++;
    if (tech.deploymentLevel > 0) deployed++;

    // By category
    const category = tech.category || 'unknown';
    if (!byCategory[category]) {
      byCategory[category] = { total: 0, unlocked: 0, deployed: 0 };
    }
    byCategory[category]!.total++;
    if (tech.unlocked) byCategory[category]!.unlocked++;
    if (tech.deploymentLevel > 0) byCategory[category]!.deployed++;

    // By tier (extract from tech id if available)
    const tierMatch = tech.id.match(/tier(\d+)/i);
    const tier = tierMatch ? parseInt(tierMatch[1] ?? '0', 10) : 0;
    if (!byTier[tier]) {
      byTier[tier] = { total: 0, unlocked: 0, deployed: 0 };
    }
    byTier[tier]!.total++;
    if (tech.unlocked) byTier[tier]!.unlocked++;
    if (tech.deploymentLevel > 0) byTier[tier]!.deployed++;
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
  const techState = state.breakthroughTech;

  if (!techState) {
    return [];
  }

  // Extract all technology nodes from the state (they're individual fields)
  const technologies = Object.values(techState).filter(
    (value): value is import('@/types/technologies').TechnologyNode =>
      typeof value === 'object' && value !== null && 'id' in value && 'unlocked' in value
  );

  return technologies.map(tech => {
    const tierMatch = tech.id.match(/tier(\d+)/i);
    const tier = tierMatch ? parseInt(tierMatch[1] ?? '0', 10) : 0;

    return {
      id: tech.id,
      name: tech.name,
      category: tech.category || 'unknown',
      unlocked: tech.unlocked,
      researchProgress: tech.researchProgress,
      deploymentLevel: tech.deploymentLevel,
      prerequisites: tech.requirements?.prerequisiteTechs || [],
      tier,
    };
  });
}

/**
 * Comprehensive Technology Tree
 * 
 * Defines all 70+ technologies with prerequisites, costs, and effects.
 * 
 * TODO: Convert all tech from allBreakthroughTech.md to this format
 * For now, using minimal stubs to enable testing
 */

export interface TechDefinition {
  id: string;
  name: string;
  description: string;
  category: 'alignment' | 'social' | 'medical' | 'energy' | 'climate' | 'ocean' | 'freshwater' | 'agriculture' | 'pollution';
  status: 'deployed_2025' | 'unlockable' | 'future';
  
  // Unlock conditions
  prerequisites: string[];
  minAICapability?: number;
  minEconomicStage?: number;
  minMonth?: number;
  
  // Research and deployment
  researchMonthsRequired: number;
  researchCost: number;  // $M total research cost
  deploymentCost: number;  // $M total deployment cost
  deploymentMonthsRequired: number;
  
  // Current deployment (for deployed_2025 tech)
  deploymentLevel: number;  // 0-1
  
  // Effects (when fully deployed)
  effects: Record<string, number>;
}

/**
 * Technology catalog
 * Start with minimal set for testing
 */
const ALL_TECH: TechDefinition[] = [
  // TIER 0: Deployed 2025 (11 technologies)
  {
    id: 'rlhf_basic',
    name: 'Basic RLHF',
    description: 'Reinforcement Learning from Human Feedback - baseline alignment technique',
    category: 'alignment',
    status: 'deployed_2025',
    prerequisites: [],
    researchMonthsRequired: 0,  // Already done
    researchCost: 0,
    deploymentCost: 100,  // $100M (already spent)
    deploymentMonthsRequired: 0,
    deploymentLevel: 1.0,  // Fully deployed
    effects: {
      alignmentBonus: 0.05,  // +5% alignment
    },
  },
  {
    id: 'mech_interp_basic',
    name: 'Basic Mechanistic Interpretability',
    description: 'Understanding AI internal representations - baseline capability',
    category: 'alignment',
    status: 'deployed_2025',
    prerequisites: [],
    researchMonthsRequired: 0,
    researchCost: 0,
    deploymentCost: 150,
    deploymentMonthsRequired: 0,
    deploymentLevel: 1.0,
    effects: {
      sleeperDetectionBonus: 0.03,  // +3% sleeper detection
    },
  },
  {
    id: 'solar_4th_gen',
    name: '4th Generation Solar',
    description: 'Perovskite solar cells with 30% efficiency',
    category: 'energy',
    status: 'deployed_2025',
    prerequisites: [],
    researchMonthsRequired: 0,
    researchCost: 0,
    deploymentCost: 5000,
    deploymentMonthsRequired: 0,
    deploymentLevel: 0.15,  // 15% deployed
    effects: {
      cleanEnergyPercentage: 0.08,  // +8% clean energy
      fossilDependenceReduction: 0.05,
    },
  },
  
  // TIER 1: Planetary Boundaries (18 technologies)
  // Phosphorus Depletion
  {
    id: 'struvite_recovery',
    name: 'Struvite Recovery',
    description: 'Recover phosphorus from wastewater as struvite crystals',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 1.5,
    minEconomicStage: 2.0,
    researchMonthsRequired: 18,
    researchCost: 500,
    deploymentCost: 8000,
    deploymentMonthsRequired: 36,
    deploymentLevel: 0,
    effects: {
      phosphorusRecovery: 0.15,  // +15% recovery rate
    },
  },
  {
    id: 'soil_p_optimization',
    name: 'Soil Phosphorus Optimization',
    description: 'AI-driven soil management to maximize P efficiency',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.0,
    researchMonthsRequired: 24,
    researchCost: 800,
    deploymentCost: 12000,
    deploymentMonthsRequired: 48,
    deploymentLevel: 0,
    effects: {
      phosphorusEfficiency: 0.20,  // +20% efficiency
    },
  },
  
  // Freshwater Depletion
  {
    id: 'desalination_advanced',
    name: 'Advanced Desalination',
    description: 'Energy-efficient reverse osmosis with graphene membranes',
    category: 'freshwater',
    status: 'unlockable',
    prerequisites: ['solar_4th_gen'],
    minAICapability: 1.8,
    minEconomicStage: 2.5,
    researchMonthsRequired: 24,
    researchCost: 2000,
    deploymentCost: 15000,
    deploymentMonthsRequired: 36,
    deploymentLevel: 0,
    effects: {
      freshwaterSupply: 0.25,  // +25% water supply in coastal regions
    },
  },
  
  // TIER 2: Major Mitigations (22 technologies)
  {
    id: 'scalable_oversight',
    name: 'Scalable Oversight',
    description: 'AI systems that can oversee and correct other AIs',
    category: 'alignment',
    status: 'unlockable',
    prerequisites: ['rlhf_basic', 'mech_interp_basic'],
    minAICapability: 2.5,
    researchMonthsRequired: 36,
    researchCost: 5000,
    deploymentCost: 3000,
    deploymentMonthsRequired: 24,
    deploymentLevel: 0,
    effects: {
      alignmentBonus: 0.15,  // +15% alignment
      sleeperDetectionBonus: 0.10,
    },
  },
  
  // TIER 3: Transformative (14 technologies)
  {
    id: 'fusion_power',
    name: 'Fusion Power',
    description: 'Net-positive fusion reactors providing abundant clean energy',
    category: 'energy',
    status: 'unlockable',
    prerequisites: ['fusion_materials', 'fusion_plasma_control'],
    minAICapability: 3.5,
    minEconomicStage: 4.0,
    minMonth: 120,  // 10 years minimum
    researchMonthsRequired: 120,
    researchCost: 50000,
    deploymentCost: 200000,
    deploymentMonthsRequired: 180,
    deploymentLevel: 0,
    effects: {
      cleanEnergyPercentage: 0.60,  // +60% clean energy
      fossilDependenceReduction: 0.50,
      powerGeneration: 2.0,  // 2× power generation capacity
    },
  },
];

/**
 * Get all technologies
 */
export function getAllTech(): TechDefinition[] {
  return ALL_TECH;
}

/**
 * Get technology by ID
 */
export function getTechById(id: string): TechDefinition | undefined {
  return ALL_TECH.find(t => t.id === id);
}

/**
 * Get technologies by category
 */
export function getTechByCategory(category: string): TechDefinition[] {
  return ALL_TECH.filter(t => t.category === category);
}

/**
 * Get technologies by status
 */
export function getTechByStatus(status: 'deployed_2025' | 'unlockable' | 'future'): TechDefinition[] {
  return ALL_TECH.filter(t => t.status === status);
}

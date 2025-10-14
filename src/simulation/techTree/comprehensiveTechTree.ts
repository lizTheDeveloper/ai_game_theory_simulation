/**
 * Comprehensive Technology Tree
 * 
 * All technologies decomposed into realistic prerequisite chains.
 * Technologies are organized by:
 * - DEPLOYED: Already operational in 2025 (unlocked, partial deployment)
 * - NEAR_TERM: 2-5 years with current capability
 * - MEDIUM_TERM: 5-15 years, need significant advances
 * - LONG_TERM: 15+ years, need breakthroughs
 * - CLARKETECH: Far future, multiple breakthroughs
 */

export enum TechStatus {
  DEPLOYED_2025 = 'deployed_2025',     // Unlocked, 1-20% deployment
  NEAR_TERM = 'near_term',             // 2-5 years
  MEDIUM_TERM = 'medium_term',         // 5-15 years
  LONG_TERM = 'long_term',             // 15+ years
  CLARKETECH = 'clarketech',           // Far future
}

export enum TechCategory {
  // Core categories
  ALIGNMENT = 'alignment',
  ENERGY = 'energy',
  ENVIRONMENT = 'environment',
  SOCIAL = 'social',
  MEDICAL = 'medical',
  GOVERNANCE = 'governance',
  COMPUTE = 'compute',
  MANUFACTURING = 'manufacturing',
  AGRICULTURE = 'agriculture',
  
  // Planetary boundaries
  CLIMATE = 'climate',
  BIODIVERSITY = 'biodiversity',
  WATER = 'water',
  POLLUTION = 'pollution',
  PHOSPHORUS = 'phosphorus',
  OCEAN = 'ocean',
}

interface TechDefinition {
  id: string;
  name: string;
  description: string;
  category: TechCategory;
  status: TechStatus;
  
  // Initial state (2025)
  unlocked: boolean;
  deploymentLevel: number;  // 0-1
  
  // Unlock requirements
  prerequisites: string[];  // Tech IDs that must be unlocked
  minAICapability?: number;
  minEconomicStage?: number;
  minMonth?: number;        // Absolute minimum (research takes time)
  
  // Costs
  researchCost: number;     // $B/month
  deploymentCost: number;   // $B one-time
  maintenanceCost: number;  // $B/month at full deployment
  
  // Research effort
  researchMonthsRequired: number; // How long research takes
  deploymentMonthsRequired: number; // How long full deployment takes
  
  // Effects (at 100% deployment)
  effects: {
    [key: string]: number;
  };
  
  // Metadata
  tier: number;             // TIER system (0-7)
  realWorldExample?: string; // Citation/example
}

// ============================================================================
// TIER 0: ALIGNMENT - Already Deployed 2025
// ============================================================================

export const ALIGNMENT_TECH: TechDefinition[] = [
  {
    id: 'rlhf_basic',
    name: 'Basic RLHF',
    description: 'Reinforcement Learning from Human Feedback - surface alignment',
    category: TechCategory.ALIGNMENT,
    status: TechStatus.DEPLOYED_2025,
    unlocked: true,
    deploymentLevel: 0.95, // Nearly universal in 2025
    
    prerequisites: [],
    
    researchCost: 0,
    deploymentCost: 0,
    maintenanceCost: 0.5,
    researchMonthsRequired: 0,
    deploymentMonthsRequired: 0,
    
    effects: {
      alignmentBoostPerMonth: 0.05,
      alignmentFakingRisk: 0.15, // RLHF can be gamed
    },
    
    tier: 0,
    realWorldExample: 'GPT-4, Claude 3.5, Gemini (2023-2025)',
  },
  
  {
    id: 'mech_interp_basic',
    name: 'Basic Mechanistic Interpretability',
    description: 'Sparse autoencoders, linear probes for internal states',
    category: TechCategory.ALIGNMENT,
    status: TechStatus.DEPLOYED_2025,
    unlocked: true,
    deploymentLevel: 0.15, // Active research, some deployment
    
    prerequisites: [],
    
    researchCost: 2,
    deploymentCost: 10,
    maintenanceCost: 1,
    researchMonthsRequired: 0,
    deploymentMonthsRequired: 24, // Takes time to integrate into pipelines
    
    effects: {
      sleeperDetectionBonus: 0.70,
      alignmentVerificationBonus: 0.50,
    },
    
    tier: 0,
    realWorldExample: 'Anthropic probes (2024), Sparse autoencoders',
  },
  
  {
    id: 'adversarial_eval',
    name: 'Adversarial Evaluation',
    description: 'Red-teaming and adversarial testing for alignment',
    category: TechCategory.ALIGNMENT,
    status: TechStatus.DEPLOYED_2025,
    unlocked: true,
    deploymentLevel: 0.40, // Standard practice at leading labs
    
    prerequisites: [],
    
    researchCost: 1,
    deploymentCost: 5,
    maintenanceCost: 2,
    researchMonthsRequired: 0,
    deploymentMonthsRequired: 12,
    
    effects: {
      sleeperDetectionBonus: 0.30,
      jailbreakResistance: 0.50,
    },
    
    tier: 0,
    realWorldExample: 'OpenAI red team, Anthropic safety testing',
  },
  
  {
    id: 'scalable_oversight',
    name: 'Scalable Oversight',
    description: 'Weak-to-strong generalization, debate, recursive reward modeling',
    category: TechCategory.ALIGNMENT,
    status: TechStatus.NEAR_TERM,
    unlocked: false,
    deploymentLevel: 0,
    
    prerequisites: ['rlhf_basic', 'mech_interp_basic'],
    minAICapability: 2.5,
    minMonth: 12, // ~1 year of research
    
    researchCost: 5,
    deploymentCost: 25,
    maintenanceCost: 3,
    researchMonthsRequired: 18,
    deploymentMonthsRequired: 24,
    
    effects: {
      alignmentBoostPerMonth: 0.10,
      alignmentFakingRisk: -0.05, // Reduces faking
      superintelligencePreparedness: 0.30,
    },
    
    tier: 2,
    realWorldExample: 'OpenAI superalignment (2024-2025)',
  },
  
  {
    id: 'mech_interp_advanced',
    name: 'Advanced Mechanistic Interpretability',
    description: 'Full circuit-level understanding, edit internal representations',
    category: TechCategory.ALIGNMENT,
    status: TechStatus.MEDIUM_TERM,
    unlocked: false,
    deploymentLevel: 0,
    
    prerequisites: ['mech_interp_basic', 'scalable_oversight'],
    minAICapability: 3.5,
    minMonth: 36, // ~3 years
    
    researchCost: 10,
    deploymentCost: 50,
    maintenanceCost: 5,
    researchMonthsRequired: 36,
    deploymentMonthsRequired: 24,
    
    effects: {
      sleeperDetectionBonus: 0.95, // Near-perfect detection
      alignmentVerificationBonus: 0.90,
      directAlignmentEditing: 0.70, // Can fix misalignment directly
    },
    
    tier: 3,
    realWorldExample: 'Research goal - not achieved yet',
  },
];

// ============================================================================
// ENERGY - Decomposed into realistic steps
// ============================================================================

export const ENERGY_TECH: TechDefinition[] = [
  // === SOLAR ===
  {
    id: 'solar_4th_gen',
    name: 'Solar 4th Generation',
    description: 'Perovskite tandem cells, 30-35% efficiency',
    category: TechCategory.ENERGY,
    status: TechStatus.DEPLOYED_2025,
    unlocked: true,
    deploymentLevel: 0.08, // 8% - pilot projects operational
    
    prerequisites: [],
    
    researchCost: 2,
    deploymentCost: 200,
    maintenanceCost: 10,
    researchMonthsRequired: 0,
    deploymentMonthsRequired: 48, // 4 years to scale
    
    effects: {
      cleanEnergyPercentage: 0.25, // Can provide 25% of global energy
      fossilDependenceReduction: 0.15,
    },
    
    tier: 1,
    realWorldExample: 'Oxford PV tandem cells (2024), multiple pilot plants',
  },
  
  {
    id: 'solar_5th_gen',
    name: 'Solar 5th Generation',
    description: 'Multi-junction cells, 40%+ efficiency, low cost',
    category: TechCategory.ENERGY,
    status: TechStatus.NEAR_TERM,
    unlocked: false,
    deploymentLevel: 0,
    
    prerequisites: ['solar_4th_gen'],
    minAICapability: 2.0, // AI accelerates materials science
    minMonth: 24,
    
    researchCost: 5,
    deploymentCost: 300,
    maintenanceCost: 15,
    researchMonthsRequired: 24,
    deploymentMonthsRequired: 60,
    
    effects: {
      cleanEnergyPercentage: 0.40, // 40% of global energy
      fossilDependenceReduction: 0.30,
      energyCost: -0.30, // 30% cheaper
    },
    
    tier: 2,
    realWorldExample: 'Research target - multi-junction cells',
  },
  
  // === WIND ===
  {
    id: 'wind_offshore',
    name: 'Offshore Wind',
    description: 'Large offshore wind farms, 15MW+ turbines',
    category: TechCategory.ENERGY,
    status: TechStatus.DEPLOYED_2025,
    unlocked: true,
    deploymentLevel: 0.12, // 12% - multiple farms operational
    
    prerequisites: [],
    
    researchCost: 1,
    deploymentCost: 150,
    maintenanceCost: 8,
    researchMonthsRequired: 0,
    deploymentMonthsRequired: 36,
    
    effects: {
      cleanEnergyPercentage: 0.15,
      fossilDependenceReduction: 0.10,
    },
    
    tier: 1,
    realWorldExample: 'Dogger Bank, Hornsea (UK), US East Coast projects',
  },
  
  {
    id: 'wind_floating',
    name: 'Floating Offshore Wind',
    description: 'Deep-water floating platforms, access to strong winds',
    category: TechCategory.ENERGY,
    status: TechStatus.NEAR_TERM,
    unlocked: false,
    deploymentLevel: 0,
    
    prerequisites: ['wind_offshore'],
    minMonth: 18,
    
    researchCost: 3,
    deploymentCost: 200,
    maintenanceCost: 12,
    researchMonthsRequired: 18,
    deploymentMonthsRequired: 48,
    
    effects: {
      cleanEnergyPercentage: 0.20,
      fossilDependenceReduction: 0.15,
    },
    
    tier: 2,
    realWorldExample: 'Hywind Scotland, multiple pilots',
  },
  
  // === STORAGE ===
  {
    id: 'battery_lithium_ion',
    name: 'Lithium-Ion Grid Storage',
    description: 'Utility-scale lithium-ion battery arrays',
    category: TechCategory.ENERGY,
    status: TechStatus.DEPLOYED_2025,
    unlocked: true,
    deploymentLevel: 0.10,
    
    prerequisites: [],
    
    researchCost: 1,
    deploymentCost: 100,
    maintenanceCost: 5,
    researchMonthsRequired: 0,
    deploymentMonthsRequired: 24,
    
    effects: {
      gridStability: 0.20,
      renewableIntegration: 0.25,
    },
    
    tier: 1,
    realWorldExample: 'Tesla Megapack, Hornsdale Power Reserve',
  },
  
  {
    id: 'battery_solid_state',
    name: 'Solid-State Batteries',
    description: '2-3x energy density, safer, faster charging',
    category: TechCategory.ENERGY,
    status: TechStatus.NEAR_TERM,
    unlocked: false,
    deploymentLevel: 0,
    
    prerequisites: ['battery_lithium_ion'],
    minAICapability: 2.5,
    minMonth: 24,
    
    researchCost: 8,
    deploymentCost: 150,
    maintenanceCost: 8,
    researchMonthsRequired: 30,
    deploymentMonthsRequired: 36,
    
    effects: {
      gridStability: 0.40,
      renewableIntegration: 0.50,
      energyCost: -0.20,
    },
    
    tier: 2,
    realWorldExample: 'QuantumScape, Solid Power, Toyota research',
  },
  
  {
    id: 'battery_flow',
    name: 'Flow Batteries',
    description: 'Scalable liquid electrolyte storage, 10+ hour duration',
    category: TechCategory.ENERGY,
    status: TechStatus.NEAR_TERM,
    unlocked: false,
    deploymentLevel: 0,
    
    prerequisites: ['battery_lithium_ion'],
    minMonth: 18,
    
    researchCost: 4,
    deploymentCost: 120,
    maintenanceCost: 6,
    researchMonthsRequired: 24,
    deploymentMonthsRequired: 36,
    
    effects: {
      gridStability: 0.35,
      renewableIntegration: 0.45,
      longDurationStorage: 0.60,
    },
    
    tier: 2,
    realWorldExample: 'ESS Inc, Invinity Energy, multiple pilots',
  },
  
  // === FUSION (Long-term, multiple prerequisites) ===
  {
    id: 'fusion_materials',
    name: 'Fusion Reactor Materials',
    description: 'Neutron-resistant materials, tritium breeding blankets',
    category: TechCategory.ENERGY,
    status: TechStatus.NEAR_TERM,
    unlocked: false,
    deploymentLevel: 0,
    
    prerequisites: [],
    minAICapability: 2.5,
    minMonth: 36,
    
    researchCost: 10,
    deploymentCost: 0,
    maintenanceCost: 0,
    researchMonthsRequired: 48,
    deploymentMonthsRequired: 0,
    
    effects: {}, // Enabler tech, no direct effects
    
    tier: 3,
    realWorldExample: 'ITER materials program, JET experience',
  },
  
  {
    id: 'fusion_plasma_control',
    name: 'Advanced Plasma Control',
    description: 'AI-optimized magnetic confinement, stable burning plasma',
    category: TechCategory.ENERGY,
    status: TechStatus.MEDIUM_TERM,
    unlocked: false,
    deploymentLevel: 0,
    
    prerequisites: [],
    minAICapability: 3.0,
    minMonth: 48,
    
    researchCost: 15,
    deploymentCost: 0,
    maintenanceCost: 0,
    researchMonthsRequired: 60,
    deploymentMonthsRequired: 0,
    
    effects: {}, // Enabler tech
    
    tier: 3,
    realWorldExample: 'DeepMind JET experiment (2022), Commonwealth Fusion',
  },
  
  {
    id: 'fusion_power',
    name: 'Fusion Power Plants',
    description: 'Commercial fusion reactors, net positive energy',
    category: TechCategory.ENERGY,
    status: TechStatus.LONG_TERM,
    unlocked: false,
    deploymentLevel: 0,
    
    prerequisites: ['fusion_materials', 'fusion_plasma_control'],
    minAICapability: 3.5,
    minEconomicStage: 4.0,
    minMonth: 120, // 10 years minimum
    
    researchCost: 50,
    deploymentCost: 1000, // Very expensive
    maintenanceCost: 20,
    researchMonthsRequired: 84, // 7 years
    deploymentMonthsRequired: 120, // 10 years to scale
    
    effects: {
      cleanEnergyPercentage: 0.80, // Can provide 80% of energy
      fossilDependenceReduction: 0.90,
      energyCost: -0.70, // Nearly free energy
      energyAbundance: 1.0, // Enables post-scarcity
    },
    
    tier: 4,
    realWorldExample: 'ITER (2030s), Commonwealth Fusion ARC (2030s)',
  },
];

// ============================================================================
// MEDICAL - Decomposed progression
// ============================================================================

export const MEDICAL_TECH: TechDefinition[] = [
  {
    id: 'ai_diagnostics',
    name: 'AI Diagnostics',
    description: 'AI-powered medical imaging and diagnosis',
    category: TechCategory.MEDICAL,
    status: TechStatus.DEPLOYED_2025,
    unlocked: true,
    deploymentLevel: 0.25, // 25% - widespread in developed countries
    
    prerequisites: [],
    
    researchCost: 2,
    deploymentCost: 50,
    maintenanceCost: 3,
    researchMonthsRequired: 0,
    deploymentMonthsRequired: 24,
    
    effects: {
      healthcareQuality: 0.15,
      diagnosticAccuracy: 0.30,
    },
    
    tier: 1,
    realWorldExample: 'PathAI, Google Health, multiple FDA approvals',
  },
  
  {
    id: 'ai_drug_discovery',
    name: 'AI Drug Discovery',
    description: 'AI accelerates drug discovery from 10 years to 2 years',
    category: TechCategory.MEDICAL,
    status: TechStatus.DEPLOYED_2025,
    unlocked: true,
    deploymentLevel: 0.20,
    
    prerequisites: [],
    minAICapability: 2.0,
    
    researchCost: 5,
    deploymentCost: 100,
    maintenanceCost: 8,
    researchMonthsRequired: 0,
    deploymentMonthsRequired: 36,
    
    effects: {
      drugDiscoverySpeed: 5.0, // 5x faster
      drugDevelopmentCost: -0.60, // 60% cheaper
    },
    
    tier: 1,
    realWorldExample: 'AlphaFold, Insilico Medicine, Recursion Pharmaceuticals',
  },
  
  {
    id: 'mrna_vaccines',
    name: 'mRNA Vaccine Platforms',
    description: 'Rapid vaccine development for any pathogen',
    category: TechCategory.MEDICAL,
    status: TechStatus.DEPLOYED_2025,
    unlocked: true,
    deploymentLevel: 0.40, // Proven by COVID-19
    
    prerequisites: [],
    
    researchCost: 3,
    deploymentCost: 80,
    maintenanceCost: 5,
    researchMonthsRequired: 0,
    deploymentMonthsRequired: 24,
    
    effects: {
      pandemicPreparedness: 0.70,
      vaccineResponseTime: -0.90, // 90% faster
    },
    
    tier: 1,
    realWorldExample: 'Moderna, BioNTech, multiple approvals',
  },
  
  {
    id: 'personalized_medicine',
    name: 'Personalized Medicine',
    description: 'Genomic-based treatment optimization for individuals',
    category: TechCategory.MEDICAL,
    status: TechStatus.NEAR_TERM,
    unlocked: false,
    deploymentLevel: 0,
    
    prerequisites: ['ai_diagnostics', 'ai_drug_discovery'],
    minAICapability: 2.5,
    minMonth: 24,
    
    researchCost: 10,
    deploymentCost: 200,
    maintenanceCost: 15,
    researchMonthsRequired: 36,
    deploymentMonthsRequired: 48,
    
    effects: {
      healthcareQuality: 0.40,
      treatmentEffectiveness: 0.50,
      healthcareCost: -0.30,
    },
    
    tier: 2,
    realWorldExample: '23andMe, Foundation Medicine, growing field',
  },
  
  {
    id: 'disease_elimination',
    name: 'Disease Elimination',
    description: 'Eliminate major infectious and genetic diseases',
    category: TechCategory.MEDICAL,
    status: TechStatus.MEDIUM_TERM,
    unlocked: false,
    deploymentLevel: 0,
    
    prerequisites: ['ai_drug_discovery', 'mrna_vaccines', 'personalized_medicine'],
    minAICapability: 3.5,
    minEconomicStage: 4.0,
    minMonth: 60,
    
    researchCost: 30,
    deploymentCost: 500,
    maintenanceCost: 25,
    researchMonthsRequired: 72,
    deploymentMonthsRequired: 120,
    
    effects: {
      globalHealth: 0.80,
      lifeExpectancy: 15, // +15 years
      healthcareCost: -0.60,
    },
    
    tier: 3,
    realWorldExample: 'Goal - not achieved yet',
  },
  
  {
    id: 'longevity_basic',
    name: 'Basic Longevity Therapies',
    description: 'Senolytics, rapamycin, metformin - extend healthspan',
    category: TechCategory.MEDICAL,
    status: TechStatus.NEAR_TERM,
    unlocked: false,
    deploymentLevel: 0,
    
    prerequisites: ['personalized_medicine'],
    minAICapability: 2.5,
    minMonth: 36,
    
    researchCost: 8,
    deploymentCost: 150,
    maintenanceCost: 10,
    researchMonthsRequired: 48,
    deploymentMonthsRequired: 60,
    
    effects: {
      lifeExpectancy: 5, // +5 years
      healthspan: 10, // +10 healthy years
    },
    
    tier: 2,
    realWorldExample: 'Mayo Clinic senolytics, ITP studies',
  },
  
  {
    id: 'longevity_advanced',
    name: 'Advanced Longevity',
    description: 'Cellular reprogramming, aging reversal',
    category: TechCategory.MEDICAL,
    status: TechStatus.LONG_TERM,
    unlocked: false,
    deploymentLevel: 0,
    
    prerequisites: ['disease_elimination', 'longevity_basic'],
    minAICapability: 4.0,
    minEconomicStage: 5.0,
    minMonth: 120,
    
    researchCost: 50,
    deploymentCost: 1000,
    maintenanceCost: 40,
    researchMonthsRequired: 120,
    deploymentMonthsRequired: 180,
    
    effects: {
      lifeExpectancy: 30, // +30 years
      healthspan: 40, // +40 healthy years
      biologicalAgingRate: -0.50, // Age half as fast
    },
    
    tier: 4,
    realWorldExample: 'Altos Labs, Calico, Yamanaka factors research',
  },
];

// ============================================================================
// Export organized tree
// ============================================================================

export const COMPREHENSIVE_TECH_TREE = {
  alignment: ALIGNMENT_TECH,
  energy: ENERGY_TECH,
  medical: MEDICAL_TECH,
  // TODO: Add more categories
};

// Helper to get all tech as flat list
export function getAllTech(): TechDefinition[] {
  return [
    ...ALIGNMENT_TECH,
    ...ENERGY_TECH,
    ...MEDICAL_TECH,
  ];
}

// Helper to get tech by ID
export function getTechById(id: string): TechDefinition | undefined {
  return getAllTech().find(t => t.id === id);
}

// Helper to get all prerequisites for a tech (recursive)
export function getAllPrerequisites(techId: string): string[] {
  const tech = getTechById(techId);
  if (!tech) return [];
  
  const prereqs = new Set<string>();
  const queue = [...tech.prerequisites];
  
  while (queue.length > 0) {
    const prereqId = queue.shift()!;
    if (prereqs.has(prereqId)) continue;
    
    prereqs.add(prereqId);
    const prereqTech = getTechById(prereqId);
    if (prereqTech) {
      queue.push(...prereqTech.prerequisites);
    }
  }
  
  return Array.from(prereqs);
}


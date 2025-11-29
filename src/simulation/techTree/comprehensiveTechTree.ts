/**
 * Comprehensive Technology Tree
 * 
 * All 70+ breakthrough technologies with prerequisites, costs, and effects.
 * Based on allBreakthroughTech.md catalog (October 2025)
 */

/**
 * Dimensional capability requirement for tech unlock
 */
export interface DimensionalRequirement {
  dimension: 'physical' | 'digital' | 'cognitive' | 'social' | 'economic' | 'selfImprovement';
  threshold: number;  // Minimum value in that dimension
}

/**
 * Research capability requirement (for advanced tech)
 */
export interface ResearchRequirement {
  domain: 'biotech' | 'materials' | 'climate' | 'computerScience';
  subdomain?: string;  // Optional: specific subdomain (e.g., 'drugDiscovery', 'geneEditing')
  threshold: number;
}

export interface TechDefinition {
  id: string;
  name: string;
  description: string;
  category: 'alignment' | 'social' | 'medical' | 'energy' | 'climate' | 'ocean' | 'freshwater' | 'agriculture' | 'pollution';
  status: 'deployed_2025' | 'unlockable' | 'future';
  
  // Unlock conditions
  prerequisites: string[];
  
  // DEPRECATED: Use minCapabilityDimensions instead for new tech
  minAICapability?: number;  // Backward compatibility - general capability threshold
  
  // NEW: Multi-dimensional capability requirements
  minCapabilityDimensions?: DimensionalRequirement[];  // All dimensions must meet threshold
  minResearchCapabilities?: ResearchRequirement[];     // Research-specific requirements
  
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

  // Optional citations (research backing)
  citations?: string[];

  // NEW: Capability dimension effects (how this tech advances AI capabilities)
  capabilityEffects?: {
    dimensions?: Partial<Record<'physical' | 'digital' | 'cognitive' | 'social' | 'economic' | 'selfImprovement', number>>;
    research?: {
      domain: 'biotech' | 'materials' | 'climate' | 'computerScience';
      subdomain?: string;
      boost: number;
    }[];
  };

  // CRITICAL FIX (Nov 11, 2025): Energy/concentration constraints for cleanup tech
  /** Energy requirements - can be simple number (TWh/month) or detailed object for cleanup tech */
  energyRequirement?: number | {
    kWhPerM3?: number;           // Energy per cubic meter treated (water/air)
    kWhPerKg?: number;           // Energy per kg removed (solid waste)
    annualTWhRequired?: number;   // Annual energy requirement (if calculable)

    // CRITICAL FIX (Nov 12, 2025): Uncertainty ranges (Sylvia's requirement)
    /** Uncertainty range for energy requirement (Sylvia 2025: 2 orders of magnitude uncertainty) */
    uncertaintyRange?: {
      optimistic: number;        // 10-100× improvement assumed (breakthroughs)
      expected: number;          // Current demonstrated tech
      pessimistic: number;       // Worst-case thermal destruction baseline
      uncertaintyFactor?: number; // Multiplier for confidence (2-100×), default 10
    };
  };

  /** Minimum concentration threshold for technology effectiveness (Fennell 2024) */
  minimumConcentration?: {
    ngPerL: number;              // Minimum concentration (ng/L) for tech to work
    optimalNgPerL?: number;       // Optimal concentration for full efficiency
    concentrationPenalty?: number; // Effectiveness multiplier below threshold (default 0.1)
  };

  /** Technology type: prevention vs cleanup (Ling 2024 conclusion) */
  techType?: 'prevention' | 'cleanup' | 'hybrid';

  /** Flag: Does this tech target irreversible environmental stock? (Cousins 2022) */
  targetsIrreversibleStock?: boolean;

  // TIER 1 CRITICAL (Nov 12, 2025): Phased deployment timescales
  // Research: research/climate_tech_deployment_timescales_20251112.md
  /** Current deployment phase (planning → pilot → early_deploy → scaling → mature → saturated) */
  deploymentPhase?: 'planning' | 'pilot' | 'early_deploy' | 'scaling' | 'mature' | 'saturated';

  /** Progress through current phase (0-100%) */
  phaseProgress?: number;

  /** Timeline in months for each deployment phase */
  deploymentTimeline?: {
    planning?: number;      // R&D phase
    pilot?: number;         // Proof of concept scale
    early_deploy?: number;  // First commercial scale
    scaling?: number;       // Rapid expansion phase
    mature?: number;        // Full-scale deployment
  };

  /** Energy required during construction/scaling phase (TWh/month) */
  constructionEnergy?: number;

  // === REBOUND EFFECTS (Jevons Paradox - Nov 16, 2025) ===
  // Research: novel_entities_irreversibility_20251116.md, Sorrell (2009), Gillingham et al. (2013)

  /** Rebound coefficient: production increase per unit cleanup (0-1, typically 0.1-0.6) */
  reboundCoefficient?: number;

  /** Uncertainty range for rebound coefficient [min, max] for Monte Carlo sampling */
  reboundUncertaintyRange?: [number, number];

  /** True if this tech avoids rebound effects (e.g., production bans, circular economy) */
  avoidsRebound?: boolean;
}

/**
 * All breakthrough technologies
 */
const ALL_TECH: TechDefinition[] = [
  // ============================================================================
  // TIER 0: DEPLOYED 2025 (11 technologies)
  // ============================================================================
  
  // Alignment & Safety (3)
  {
    id: 'rlhf_basic',
    name: 'Basic RLHF',
    description: 'Reinforcement Learning from Human Feedback - surface alignment, reduces toxicity',
    category: 'alignment',
    status: 'deployed_2025',
    prerequisites: [],
    researchMonthsRequired: 0,
    researchCost: 0,
    deploymentCost: 100,
    deploymentMonthsRequired: 0,
    deploymentLevel: 0.95,
    effects: {
      alignmentBonus: 0.05,
    },
  },
  {
    id: 'mech_interp_basic',
    name: 'Basic Mechanistic Interpretability',
    description: 'Sparse autoencoders, probes - understanding AI internals',
    category: 'alignment',
    status: 'deployed_2025',
    prerequisites: [],
    researchMonthsRequired: 0,
    researchCost: 0,
    deploymentCost: 150,
    deploymentMonthsRequired: 0,
    deploymentLevel: 0.15,
    effects: {
      sleeperDetectionBonus: 0.03,
    },
  },
  {
    id: 'adversarial_eval',
    name: 'Adversarial Evaluation',
    description: 'Red-teaming, safety testing - finding AI failure modes',
    category: 'alignment',
    status: 'deployed_2025',
    prerequisites: [],
    researchMonthsRequired: 0,
    researchCost: 0,
    deploymentCost: 80,
    deploymentMonthsRequired: 0,
    deploymentLevel: 0.40,
    effects: {
      alignmentBonus: 0.02,
      sleeperDetectionBonus: 0.01,
    },
  },

  // Climate (2) - De-extinction REMOVED (research showed NOT viable, see /research/de_extinction_capabilities_timelines_20251022.md)
  {
    id: 'direct_air_capture',
    name: 'Advanced Direct Air Capture',
    description: 'Climeworks Mammoth - 36,000 tons CO2/year capture',
    category: 'climate',
    status: 'deployed_2025',
    prerequisites: [],
    researchMonthsRequired: 0,
    researchCost: 0,
    deploymentCost: 1000,
    deploymentMonthsRequired: 0,
    deploymentLevel: 0.02,
    effects: {
      carbonRemoval: 0.01,
    },

    // Phased deployment (TIER 1 CRITICAL - Climate deployment model)
    deploymentPhase: 'pilot',  // Currently at pilot scale (36 kt CO2/yr)
    phaseProgress: 20,         // 20% through pilot phase (84 plants operational 2025)
    energyRequirement: 1200,   // TWh/month at mature scale (14,400 TWh/year for 10 Gt CO2/yr, IEA 2024)
    constructionEnergy: 200,   // TWh/month during scaling phase
    deploymentTimeline: {
      planning: 24,    // 2 years R&D (already completed)
      pilot: 36,       // 3 years for 1 Mt/yr (current phase, 2024-2027)
      early_deploy: 60, // 5 years for 10 Mt/yr (2027-2032)
      scaling: 120,    // 10 years for 1 Gt/yr (2032-2042)
      mature: 180,     // 15 years for 10 Gt/yr (2042-2057, IPCC AR6)
    },
  },
  {
    id: 'ai_pollution_remediation',
    name: 'AI-Optimized Pollution Remediation',
    description: 'US DOE ML frameworks for cleanup optimization',
    category: 'pollution',
    status: 'deployed_2025',
    prerequisites: [],
    researchMonthsRequired: 0,
    researchCost: 0,
    deploymentCost: 300,
    deploymentMonthsRequired: 0,
    deploymentLevel: 0.10,
    effects: {
      pollutionReduction: 0.02,
    },
    // CRITICAL FIX (Nov 11, 2025): AI optimization reduces energy but doesn't eliminate constraints
    energyRequirement: {
      kWhPerM3: 100,  // Optimized routing/targeting reduces wasted energy
    },
    minimumConcentration: {
      ngPerL: 50000,  // 0.05 mg/L - still needs detectable concentrations
    },
    techType: 'cleanup',
    targetsIrreversibleStock: false,  // Optimization tech, not direct cleanup
  },
  
  // Social (1)
  {
    id: 'collective_purpose_networks',
    name: 'Collective Purpose Networks',
    description: 'Harvard Making Caring Common - meaning infrastructure',
    category: 'social',
    status: 'deployed_2025',
    prerequisites: [],
    researchMonthsRequired: 0,
    researchCost: 0,
    deploymentCost: 200,
    deploymentMonthsRequired: 0,
    deploymentLevel: 0.15,
    effects: {
      meaningReduction: 0.03,
      socialConnectionBonus: 0.02,
    },
  },
  
  // Medical (2)
  {
    id: 'ai_diagnostics',
    name: 'AI Diagnostics',
    description: 'PathAI, Google Health - automated disease detection',
    category: 'medical',
    status: 'deployed_2025',
    prerequisites: [],
    researchMonthsRequired: 0,
    researchCost: 0,
    deploymentCost: 400,
    deploymentMonthsRequired: 0,
    deploymentLevel: 0.25,
    effects: {
      healthcareBonus: 0.05,
      mortalityReduction: 0.01,
    },
  },
  {
    id: 'mrna_vaccines',
    name: 'mRNA Vaccine Platforms',
    description: 'Moderna, BioNTech - rapid vaccine development',
    category: 'medical',
    status: 'deployed_2025',
    prerequisites: [],
    researchMonthsRequired: 0,
    researchCost: 0,
    deploymentCost: 800,
    deploymentMonthsRequired: 0,
    deploymentLevel: 0.40,
    effects: {
      pandemicResponse: 0.30,
      mortalityReduction: 0.02,
    },
  },
  
  // Energy (2)
  {
    id: 'solar_4th_gen',
    name: '4th Generation Solar',
    description: 'Perovskite tandem cells, Oxford PV - 30% efficiency',
    category: 'energy',
    status: 'deployed_2025',
    prerequisites: [],
    researchMonthsRequired: 0,
    researchCost: 0,
    deploymentCost: 5000,
    deploymentMonthsRequired: 0,
    deploymentLevel: 0.08,
    effects: {
      cleanEnergyPercentage: 0.08,
      fossilDependenceReduction: 0.05,
    },

    // Phased deployment (TIER 1 CRITICAL - Climate deployment model)
    deploymentPhase: 'early_deploy',  // First GW factory operational 2025
    phaseProgress: 10,                // 10% through early deployment
    energyRequirement: -100,          // Negative (generates energy, not consumes) - Adds ~100 TWh/month to renewable surplus at maturity
    constructionEnergy: 50,           // TWh/month for factory construction
    deploymentTimeline: {
      planning: 0,         // Already past planning (GW factory 2025)
      pilot: 0,            // Already past pilot
      early_deploy: 60,    // 5 years mass production (2025-2030)
      scaling: 60,         // 5 years supply chain expansion (2030-2035)
      mature: 60,          // 5 years full maturity (2035-2040)
    },
  },
  {
    id: 'offshore_wind',
    name: 'Offshore Wind',
    description: 'Hornsea, Dogger Bank - 10+ GW installations',
    category: 'energy',
    status: 'deployed_2025',
    prerequisites: [],
    researchMonthsRequired: 0,
    researchCost: 0,
    deploymentCost: 8000,
    deploymentMonthsRequired: 0,
    deploymentLevel: 0.12,
    effects: {
      cleanEnergyPercentage: 0.12,
      fossilDependenceReduction: 0.08,
    },
  },
  
  // ============================================================================
  // TIER 1: PLANETARY BOUNDARY CRISIS TECH (18 technologies)
  // ============================================================================
  
  // Phosphorus Depletion (4)
  {
    id: 'struvite_recovery',
    name: 'Struvite Recovery',
    description: 'Recover 98.3% of phosphorus from wastewater as struvite crystals',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 0.5,  // Realistic: Very low AI requirement for existing tech
    minEconomicStage: 1.5,  // Realistic: Early post-industrial
    minMonth: 3,  // Realistic: 3 months to deploy existing tech
    researchMonthsRequired: 3,  // Realistic: Tech already exists, just needs deployment
    researchCost: 50,  // Realistic: Very low cost for existing tech
    deploymentCost: 25000,  // Realistic: Lower deployment cost
    deploymentMonthsRequired: 12,  // Realistic: Faster deployment
    deploymentLevel: 0,
    effects: {
      phosphorusRecovery: 0.35,
      pollutionReduction: 0.025,
    },
  },
  {
    id: 'soil_p_optimization',
    name: 'Dynamic Soil P Optimization',
    description: 'AI field-level optimization unlocking 6.6 Tg/year legacy soil P',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minCapabilityDimensions: [
      { dimension: 'cognitive', threshold: 0.6 },  // AI reasoning for optimization
      { dimension: 'digital', threshold: 0.4 }     // Data systems integration
    ],
    minEconomicStage: 1.8,  // Realistic: Early post-industrial
    minMonth: 6,  // Realistic: 6 months to develop and deploy
    researchMonthsRequired: 6,  // Realistic: AI optimization is achievable
    researchCost: 150,  // Realistic: Lower cost for AI optimization
    deploymentCost: 20000,  // Realistic: Software deployment
    deploymentMonthsRequired: 18,  // Realistic: Faster software deployment
    deploymentLevel: 0,
    effects: {
      phosphorusEfficiency: 0.30,
      miningDemandReduction: 0.35,
    },
    capabilityEffects: {
      dimensions: {
        cognitive: 0.05,  // Improves AI reasoning
      },
    },
  },
  {
    id: 'p_efficient_cultivars',
    name: 'P-Efficient Cultivars',
    description: 'Deep roots, P-solubilizing bacteria, mycorrhizal networks',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: ['soil_p_optimization'],
    minResearchCapabilities: [
      { domain: 'biotech', subdomain: 'geneEditing', threshold: 0.8 }  // CRISPR gene editing
    ],
    minEconomicStage: 2.2,  // Realistic: Advanced post-industrial
    minMonth: 24,  // Realistic: 2 years for breeding programs
    researchMonthsRequired: 24,  // Realistic: Breeding and CRISPR work
    researchCost: 600,  // Realistic: Moderate biotech cost
    deploymentCost: 80000,  // Realistic: Seed distribution
    deploymentMonthsRequired: 48,  // Realistic: Agricultural deployment
    deploymentLevel: 0,
    effects: {
      phosphorusEfficiency: 0.25,
      miningDemandReduction: 0.20,
      biodiversityBonus: 0.01,
    },
    capabilityEffects: {
      research: [
        { domain: 'biotech', subdomain: 'geneEditing', boost: 0.1 }
      ],
    },
  },
  {
    id: 'circular_food_systems',
    name: 'Circular Food Systems',
    description: 'Close the loop - waste recovery, plant-based diets - 50% total efficiency',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: ['struvite_recovery'],
    minEconomicStage: 3.0,
    researchMonthsRequired: 60,
    researchCost: 2000,
    deploymentCost: 200000,
    deploymentMonthsRequired: 120,
    deploymentLevel: 0,
    effects: {
      phosphorusEfficiency: 0.30,
      phosphorusRecovery: 0.20,
      foodSecurityBonus: 0.03,
    },
  },

  // Nitrogen Reduction (6) - TIER 2 HIGH (Nov 15, 2025)
  // Research: Science Advances (2024), Zhang et al. (2021), FAO fertilizer reports
  // Expected impact: Realistic nitrogen-food coupling, regional differentiation
  {
    id: 'precision_agriculture',
    name: 'Precision Agriculture Systems',
    description: 'Variable-rate fertilizer application with real-time soil sensing',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 0.5,  // Realistic: Low AI requirement for existing tech
    minEconomicStage: 1.5,  // Realistic: Early post-industrial
    minMonth: 6,  // Realistic: 6 months to deploy existing systems
    researchMonthsRequired: 6,  // Realistic: Tech already exists, needs scaling
    researchCost: 100,  // Realistic: Low cost for existing tech
    deploymentCost: 30000,  // Realistic: Software + sensors deployment
    deploymentMonthsRequired: 12,  // Realistic: Fast software deployment (5-10 years → 12 months at scale)
    deploymentLevel: 0,
    effects: {
      nitrogenEfficiency: 0.30,  // 30% nitrogen input reduction (research-backed)
      pollutionReduction: 0.02,
    },
  },
  {
    id: 'biological_nitrogen_fixation',
    name: 'Biological Nitrogen Fixation',
    description: 'Engineered nitrogen-fixing crops with optimized rhizosphere bacteria',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: ['precision_agriculture'],
    minResearchCapabilities: [
      { domain: 'biotech', subdomain: 'geneEditing', threshold: 0.7 }  // CRISPR + synthetic biology
    ],
    minEconomicStage: 2.0,  // Realistic: Advanced post-industrial
    minMonth: 24,  // Realistic: 2 years for genetic engineering + field trials
    researchMonthsRequired: 36,  // Realistic: Longer biotech development (10-15 years → 36 months at scale)
    researchCost: 800,  // Realistic: Moderate biotech cost
    deploymentCost: 100000,  // Realistic: Seed distribution + farmer training
    deploymentMonthsRequired: 60,  // Realistic: Agricultural deployment takes time
    deploymentLevel: 0,
    effects: {
      nitrogenEfficiency: 0.25,  // 25% nitrogen input reduction (research-backed)
      soilHealthBonus: 0.05,
      biodiversityBonus: 0.02,
    },
    capabilityEffects: {
      research: [
        { domain: 'biotech', subdomain: 'geneEditing', boost: 0.1 }
      ],
    },
  },
  {
    id: 'nitrogen_circular_food',
    name: 'Nitrogen Circular Food Systems',
    description: 'Waste-to-fertilizer loops, urban agriculture, closed-loop systems',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: ['circular_food_systems'],  // Builds on phosphorus circular systems
    minEconomicStage: 2.5,  // Realistic: Advanced infrastructure required
    researchMonthsRequired: 30,  // Realistic: 2.5 years for system design
    researchCost: 1500,  // Realistic: Medium cost for infrastructure planning
    deploymentCost: 180000,  // Realistic: Urban infrastructure + waste processing
    deploymentMonthsRequired: 90,  // Realistic: Infrastructure deployment (5-10 years → 90 months)
    deploymentLevel: 0,
    effects: {
      nitrogenEfficiency: 0.20,  // 20% nitrogen input reduction (research-backed)
      nitrogenRecovery: 0.15,
      foodSecurityBonus: 0.02,
      urbanQoLBonus: 0.01,
    },
  },
  {
    id: 'ecosystem_restoration_nitrogen',
    name: 'Ecosystem Restoration for Nitrogen Removal',
    description: 'Constructed wetlands, riparian buffers, denitrification enhancement',
    category: 'pollution',  // Nitrogen pollution removal
    status: 'unlockable',
    prerequisites: [],
    minEconomicStage: 2.0,  // Realistic: Moderate infrastructure required
    researchMonthsRequired: 18,  // Realistic: Ecosystem design + pilot programs
    researchCost: 500,  // Realistic: Lower cost for ecosystem approaches
    deploymentCost: 120000,  // Realistic: Land acquisition + restoration
    deploymentMonthsRequired: 120,  // Realistic: Long ecosystem establishment time (10-20 years)
    deploymentLevel: 0,
    effects: {
      nitrogenRemoval: 0.15,  // 15% nitrogen removal (research-backed)
      biodiversityBonus: 0.08,
      waterQualityBonus: 0.10,
      floodProtectionBonus: 0.05,
    },
  },
  {
    id: 'nitrogen_monitoring_networks',
    name: 'Nitrogen Monitoring Networks',
    description: 'Satellite monitoring, sensor networks, predictive models for precision targeting',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 0.6,  // Realistic: Moderate AI for data analysis
    minCapabilityDimensions: [
      { dimension: 'digital', threshold: 0.5 }  // Data systems integration
    ],
    minEconomicStage: 1.8,  // Realistic: Early post-industrial
    minMonth: 3,  // Realistic: Fast deployment of monitoring systems
    researchMonthsRequired: 6,  // Realistic: Monitoring tech already exists
    researchCost: 200,  // Realistic: Low cost for software + sensors
    deploymentCost: 50000,  // Realistic: Network deployment
    deploymentMonthsRequired: 18,  // Realistic: Fast network rollout (3-5 years)
    deploymentLevel: 0,
    effects: {
      nitrogenEfficiency: 0.10,  // 10% efficiency gain through better targeting (research-backed)
      pollutionReduction: 0.01,
    },
    capabilityEffects: {
      dimensions: {
        digital: 0.05,  // Improves data systems
        cognitive: 0.03,  // AI optimization for agriculture
      },
    },
  },
  {
    id: 'green_ammonia_production',
    name: 'Green Ammonia Production',
    description: 'Renewable energy-based Haber-Bosch replacement with hydrogen synthesis',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: ['fusion_power', 'solar_4th_gen'],  // Requires abundant clean energy
    minAICapability: 3.0,  // Realistic: High AI for process optimization
    minEconomicStage: 3.5,  // Realistic: Very advanced infrastructure
    minMonth: 60,  // Realistic: 5 years minimum for fusion-based ammonia
    researchMonthsRequired: 60,  // Realistic: Long R&D for hydrogen synthesis at scale
    researchCost: 5000,  // Realistic: High cost for energy transition
    deploymentCost: 500000,  // Realistic: Massive infrastructure replacement
    deploymentMonthsRequired: 180,  // Realistic: Very long deployment (15-25 years)
    deploymentLevel: 0,
    effects: {
      nitrogenEfficiency: 0.40,  // 40% nitrogen input reduction (research-backed)
      carbonEmissionsReduction: 0.15,  // Haber-Bosch is 1-2% of global emissions
      energyIndependenceBonus: 0.05,
    },
  },

  // ===================================================================
  // ADDITIONAL NITROGEN REDUCTION TECHNOLOGIES (Nov 21, 2025)
  // Research: nitrogen_food_coupling_20251115.md
  // Phase 3 completion: 6 technologies to complete nitrogen-food integration
  // ===================================================================

  {
    id: 'rhizosphere_engineering',
    name: 'Rhizosphere Engineering',
    description: 'Mycorrhizal biofertilizers and nitrogen-fixing bacteria for 15-40% N reduction without yield loss',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: ['biological_nitrogen_fixation'],  // Builds on existing N-fixation tech
    minResearchCapabilities: [
      { domain: 'biotech', subdomain: 'geneEditing', threshold: 0.6 }  // Moderate biotech requirement
    ],
    minEconomicStage: 2.0,  // Advanced post-industrial
    minMonth: 24,  // 2 years for microbial engineering trials
    researchMonthsRequired: 30,  // 2.5 years R&D for synthetic microbiomes
    researchCost: 600,  // Moderate biotech cost
    deploymentCost: 80000,  // Seed coating + inoculation infrastructure
    deploymentMonthsRequired: 48,  // 4 years for agricultural adoption
    deploymentLevel: 0,
    effects: {
      nitrogenEfficiency: 0.275,  // 27.5% N reduction (middle of 15-40% range)
      soilHealthBonus: 0.08,  // Microbial communities improve soil
      biodiversityBonus: 0.03,  // Rhizosphere diversity enhancement
    },
    capabilityEffects: {
      research: [
        { domain: 'biotech', subdomain: 'syntheticBiology', boost: 0.12 }
      ],
    },
  },

  {
    id: 'nitroplast_integration',
    name: 'Nitroplast Integration',
    description: 'Nitrogen-fixing organelles engineered into crops (2024 discovery) - 50-70% N fertilizer elimination',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: ['rhizosphere_engineering', 'crispr_genome_editing'],  // Requires advanced biotech
    minResearchCapabilities: [
      { domain: 'biotech', subdomain: 'geneEditing', threshold: 0.85 },  // Very high threshold
      { domain: 'biotech', subdomain: 'syntheticBiology', threshold: 0.80 }
    ],
    minEconomicStage: 3.0,  // Very advanced biotech infrastructure
    minMonth: 60,  // 5 years minimum (2030s deployment per research)
    researchMonthsRequired: 120,  // 10 years R&D (highly uncertain, breakthrough tech)
    researchCost: 8000,  // Very high cost for breakthrough biotech
    deploymentCost: 250000,  // Massive seed development + regulatory approval
    deploymentMonthsRequired: 120,  // 10 years deployment (GMO approval + farmer adoption)
    deploymentLevel: 0,
    effects: {
      nitrogenEfficiency: 0.60,  // 60% N fertilizer elimination (middle of 50-70% range)
      carbonEmissionsReduction: 0.12,  // Haber-Bosch process eliminated for engineered crops
      energyIndependenceBonus: 0.08,  // Reduces fertilizer dependency
      soilHealthBonus: 0.10,  // Natural nitrogen cycling restored
    },
    capabilityEffects: {
      research: [
        { domain: 'biotech', subdomain: 'geneEditing', boost: 0.20 },  // Major biotech breakthrough
        { domain: 'biotech', subdomain: 'syntheticBiology', boost: 0.25 }
      ],
    },
  },

  {
    id: 'precision_fermentation_nitrogen',
    name: 'Precision Fermentation for Nitrogen Reduction',
    description: 'Microbial protein production to replace animal agriculture - 30-50% agricultural N demand reduction',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: ['precision_fermentation'],  // Builds on existing precision fermentation tech (if it exists)
    minResearchCapabilities: [
      { domain: 'biotech', subdomain: 'syntheticBiology', threshold: 0.65 }
    ],
    minEconomicStage: 2.5,  // Advanced biotech + food processing infrastructure
    minMonth: 12,  // 1 year (already commercially emerging 2024-2025)
    researchMonthsRequired: 18,  // 1.5 years for scaling
    researchCost: 1200,  // Medium-high cost for bioreactor scale-up
    deploymentCost: 150000,  // Commercial bioreactor facilities + distribution
    deploymentMonthsRequired: 60,  // 5 years for market penetration (consumer acceptance barrier)
    deploymentLevel: 0,
    effects: {
      nitrogenEfficiency: 0.40,  // 40% agricultural N demand reduction (replaces animal feed crops)
      landUseReduction: 0.15,  // 100× land efficiency vs animal agriculture
      waterEfficiency: 0.12,  // 95% less water than dairy
      carbonEmissionsReduction: 0.10,  // 80% lower GHG vs conventional animal agriculture
      foodSecurityBonus: 0.05,  // 10-25× feedstock efficiency
    },
    capabilityEffects: {
      research: [
        { domain: 'biotech', subdomain: 'syntheticBiology', boost: 0.15 }
      ],
    },
  },

  {
    id: 'regional_nitrogen_policies',
    name: 'Regional Nitrogen Differentiation Policies',
    description: 'Targeted N reduction in overuse regions (South Asia 55%), increase in underuse regions (Sub-Saharan Africa) - 20% global efficiency gain',
    category: 'social',  // Governance policies fall under social category
    status: 'unlockable',
    prerequisites: ['nitrogen_monitoring_networks'],  // Requires monitoring infrastructure
    minAICapability: 0.7,  // Moderate AI for regional optimization
    minEconomicStage: 2.0,  // Post-industrial coordination capacity
    minMonth: 18,  // 1.5 years for policy development
    researchMonthsRequired: 24,  // 2 years for regional coordination frameworks
    researchCost: 800,  // Policy development + international coordination
    deploymentCost: 50000,  // Implementation of differentiated regulations
    deploymentMonthsRequired: 36,  // 3 years for policy rollout + compliance
    deploymentLevel: 0,
    effects: {
      nitrogenEfficiency: 0.20,  // 20% global efficiency via redistribution (research-backed)
      governanceCoordinationBonus: 0.05,  // International cooperation improvement
      equityBonus: 0.03,  // Reduces inequality (underuse regions get more, overuse regions reduce)
    },
    capabilityEffects: {
      dimensions: {
        social: 0.08,  // International coordination
        economic: 0.05,  // Resource redistribution
      },
    },
  },

  {
    id: 'soil_health_restoration',
    name: 'Soil Health Restoration Programs',
    description: 'No-till agriculture, cover cropping, organic matter restoration - 20-40% NUE improvement',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: ['precision_agriculture'],  // Builds on precision ag
    minAICapability: 0.4,  // Low-moderate AI for soil monitoring
    minEconomicStage: 1.8,  // Early post-industrial
    minMonth: 12,  // 1 year (practices already exist, need scaling)
    researchMonthsRequired: 18,  // 1.5 years for regional adaptation
    researchCost: 400,  // Low cost for existing practices
    deploymentCost: 60000,  // Farmer training + transition subsidies
    deploymentMonthsRequired: 48,  // 4 years for agricultural transition
    deploymentLevel: 0,
    effects: {
      nitrogenEfficiency: 0.30,  // 30% NUE improvement (middle of 20-40% range)
      soilHealthBonus: 0.15,  // Major soil carbon + organic matter gains
      biodiversityBonus: 0.05,  // Cover crops support pollinators
      carbonSequestration: 0.08,  // Soil carbon storage
      waterEfficiency: 0.06,  // Improved water retention
    },
    capabilityEffects: {
      dimensions: {
        cognitive: 0.10,  // Ecosystem services understanding (using cognitive as proxy for ecological systems thinking)
      },
    },
  },

  {
    id: 'integrated_nutrient_management',
    name: 'Integrated Nutrient Management Systems',
    description: 'Combines precision ag, biofertilizers, crop rotation, and circular systems - 25-45% efficiency gains',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: ['precision_agriculture', 'nitrogen_circular_food', 'soil_health_restoration'],  // Requires multiple foundation techs
    minAICapability: 0.8,  // High AI for integrated optimization
    minEconomicStage: 2.5,  // Advanced coordination infrastructure
    minMonth: 36,  // 3 years (requires foundation techs first)
    researchMonthsRequired: 36,  // 3 years for integrated system design
    researchCost: 1500,  // High cost for systems integration
    deploymentCost: 180000,  // Comprehensive agricultural transformation
    deploymentMonthsRequired: 72,  // 6 years for full system deployment
    deploymentLevel: 0,
    effects: {
      nitrogenEfficiency: 0.35,  // 35% efficiency gains (middle of 25-45% range)
      phosphorusEfficiency: 0.25,  // Integrated P management benefits
      soilHealthBonus: 0.12,
      biodiversityBonus: 0.08,
      waterEfficiency: 0.10,
      carbonSequestration: 0.10,
      foodSecurityBonus: 0.08,  // Resilient, diversified systems
    },
    capabilityEffects: {
      dimensions: {
        cognitive: 0.25,  // Systems thinking + complex optimization (combined ecological/cognitive)
        economic: 0.08,  // Circular economy principles
      },
    },
  },

  // ===================================================================
  // NUCLEAR WINTER RESILIENT FOOD SYSTEMS (Nov 20, 2025)
  // Research: Penn State (2025), IIASA (2025), FAO (2024-2025)
  // Purpose: Reduce nuclear winter famine mortality by 20-40%
  // ===================================================================

  {
    id: 'strategic_grain_reserves',
    name: 'Strategic Grain Reserves',
    description: '6-12 month global food buffer - reduces first-year nuclear winter mortality 20%',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],  // Institutional capacity only
    minAICapability: 0.3,  // Low AI requirement (logistics optimization)
    minEconomicStage: 1.5,  // Early post-industrial
    minMonth: 12,  // 1 year to establish reserves
    researchMonthsRequired: 6,  // Policy + logistics planning
    researchCost: 50,  // Low research cost (policy design)
    deploymentCost: 100000,  // $100B global reserves (FAO estimates)
    deploymentMonthsRequired: 24,  // 2 years to build reserves
    deploymentLevel: 0,
    effects: {
      nuclearWinterMortalityReduction: 0.20,  // 20% mortality reduction in first year (FAO 2024-2025)
      foodSecurityBonus: 0.05,  // General food security improvement
      famineBufferMonths: 6,  // 6-month buffer against any famine
    },
    citations: ['FAO (2024-2025): Strategic grain reserves and emergency food systems'],
  },

  {
    id: 'cold_tolerant_crops',
    name: 'Cold-Tolerant Crop Substitution',
    description: 'Potatoes, turnips, kale - 15% yield recovery in nuclear winter conditions',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: ['strategic_grain_reserves'],  // Requires planning infrastructure
    minResearchCapabilities: [
      { domain: 'biotech', subdomain: 'geneEditing', threshold: 0.5 }  // CRISPR crop improvement
    ],
    minEconomicStage: 2.0,  // Advanced post-industrial
    minMonth: 24,  // 2 years for breeding + seed bank distribution
    researchMonthsRequired: 36,  // 3 years for crop breeding + field trials
    researchCost: 800,  // Moderate biotech cost
    deploymentCost: 150000,  // $150B seed distribution + farmer training
    deploymentMonthsRequired: 60,  // 5 years for global seed bank + agricultural transition
    deploymentLevel: 0,
    effects: {
      nuclearWinterYieldRecovery: 0.15,  // 15% crop yield recovery (Penn State 2025)
      climateResilienceBonus: 0.03,  // General climate adaptation
      biodiversityBonus: 0.02,  // Crop diversity improvement
    },
    citations: ['Penn State (2025): Cold-tolerant crop adaptation scenarios'],
    capabilityEffects: {
      research: [
        { domain: 'biotech', subdomain: 'geneEditing', boost: 0.05 }
      ],
    },
  },

  {
    id: 'emergency_greenhouse_networks',
    name: 'Emergency Greenhouse Networks',
    description: 'Indoor agriculture - 10% yield recovery where energy available (fusion/renewables required)',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: ['fusion_power', 'solar_4th_gen', 'cold_tolerant_crops'],  // Requires abundant energy
    minAICapability: 2.0,  // Moderate AI for greenhouse automation
    minEconomicStage: 3.0,  // Advanced infrastructure
    minMonth: 48,  // 4 years minimum (after fusion available)
    researchMonthsRequired: 48,  // 4 years for greenhouse design + automation
    researchCost: 2000,  // High cost for advanced infrastructure
    deploymentCost: 300000,  // $300B global greenhouse network (IIASA optimistic case)
    deploymentMonthsRequired: 120,  // 10 years for global rollout
    deploymentLevel: 0,
    effects: {
      nuclearWinterYieldRecovery: 0.10,  // 10% yield recovery (energy-limited, IIASA 2025)
      foodSecurityBonus: 0.08,  // Year-round production
      urbanQoLBonus: 0.02,  // Urban food systems
    },
    energyRequirement: 500,  // 500 TWh/year (substantial energy requirement)
    citations: ['IIASA (2025): Greenhouse agriculture optimistic case'],
  },

  {
    id: 'emergency_food_distribution_ai',
    name: 'Emergency Food Distribution AI',
    description: 'AI-optimized supply chains - 10% mortality reduction by reducing hoarding and violence',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: ['strategic_grain_reserves'],  // Requires grain reserves to distribute
    minAICapability: 2.5,  // Moderate-high AI for logistics optimization
    minCapabilityDimensions: [
      { dimension: 'digital', threshold: 0.7 },  // Data systems
      { dimension: 'social', threshold: 0.5 },  // Coordination capability
      { dimension: 'cognitive', threshold: 0.6 },  // Planning capability
    ],
    minEconomicStage: 2.5,  // Advanced infrastructure
    minMonth: 18,  // 1.5 years for AI development + deployment
    researchMonthsRequired: 24,  // 2 years for AI development
    researchCost: 500,  // Moderate AI development cost
    deploymentCost: 80000,  // $80B global logistics infrastructure
    deploymentMonthsRequired: 36,  // 3 years for global deployment
    deploymentLevel: 0,
    effects: {
      nuclearWinterMortalityReduction: 0.10,  // 10% mortality reduction (reduces panic, hoarding)
      foodSecurityBonus: 0.06,  // General supply chain efficiency
      socialCohesionBonus: 0.03,  // Reduces conflict over food
      governanceEffectivenessBonus: 0.02,  // Institutional capacity
    },
    citations: ['Supply chain resilience research (2024-2025)'],
    capabilityEffects: {
      dimensions: {
        digital: 0.08,  // Logistics systems
        social: 0.05,  // Coordination capability
        cognitive: 0.06,  // AI planning
      },
    },
  },

  // Rhizosphere Engineering (TIER 1 CRITICAL - Nov 16, 2025)
  {
    id: 'rhizosphere_engineering',
    name: 'Rhizosphere Engineering',
    description: 'Plant growth-promoting microorganisms (PGPMs) + N-fixing bacteria - 15-40% N fertilizer reduction',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minCapabilityDimensions: [
      { dimension: 'cognitive', threshold: 0.6 },  // Microbiome engineering
      { dimension: 'physical', threshold: 0.4 }    // Seed coating/soil inoculation
    ],
    minResearchCapabilities: [
      { domain: 'biotech', subdomain: 'geneEditing', threshold: 0.5 }  // Microbiome engineering uses gene editing tools
    ],
    minEconomicStage: 1.8,  // Requires biotech infrastructure
    minMonth: 36,  // Available 2028+ (research phase 2025-2028)
    researchMonthsRequired: 24,  // 2 years research to optimize formulations
    researchCost: 500,  // Moderate - microbiome R&D
    deploymentCost: 15000,  // Lower than precision ag (biofertilizer production)
    deploymentMonthsRequired: 36,  // 3 years to scale globally
    deploymentLevel: 0,
    effects: {
      nitrogenReduction: 0.275,  // 27.5% middle of 15-40% range (field-demonstrated)
      biogeochemicalFlowsReduction: 0.12,  // Reduces N runoff via improved uptake
    },
    citations: [
      'Zhang et al. (2020) - PGPM mechanisms, Frontiers in Plant Science',
      'Bai et al. (2024) - Mycorrhizal biofertilizers, 15% N reduction in wheat',
      'Ke et al. (2021) - Sphingobium yanoikuyae, N transporter gene modulation'
    ],
  },

  // Nitroplast Integration (TIER 2 HIGH - Nov 16, 2025 - BREAKTHROUGH TECH)
  {
    id: 'nitroplast_integration',
    name: 'Nitroplast Integration',
    description: 'Nitrogen-fixing organelle (Coale 2024 discovery) engineered into cereal crops - 50-70% N reduction if successful',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: ['rhizosphere_engineering'],  // Build on microbial N-fixation experience
    minCapabilityDimensions: [
      { dimension: 'cognitive', threshold: 1.5 },  // CRISPR/advanced genetic engineering
      { dimension: 'physical', threshold: 0.7 },   // Field trials
      { dimension: 'selfImprovement', threshold: 1.2 }    // Breakthrough research capability
    ],
    minResearchCapabilities: [
      { domain: 'biotech', subdomain: 'geneEditing', threshold: 0.9 },  // CRISPR for organelle integration
      { domain: 'biotech', subdomain: 'syntheticBiology', threshold: 0.8 }  // Synthetic organelles
    ],
    minEconomicStage: 2.5,  // Requires advanced biotech infrastructure
    minMonth: 180,  // Available 2040+ (15 years from 2025)
    researchMonthsRequired: 120,  // 10 years research (2030-2040) - uncertain success
    researchCost: 25000,  // HIGH - genetic engineering R&D
    deploymentCost: 80000,  // High regulatory costs, GMO approval, seed distribution
    deploymentMonthsRequired: 120,  // 10 years to scale (2040-2050) - if successful
    deploymentLevel: 0,
    effects: {
      nitrogenReduction: 0.60,  // 60% middle of 50-70% range (SPECULATIVE - marine algae real, cereals hypothetical)
      biogeochemicalFlowsReduction: 0.40,  // Major reduction in synthetic N runoff
      energyCostReduction: 0.05,  // Eliminates Haber-Bosch energy (1-2% global energy)
    },
    citations: [
      'Coale et al. (2024) - Nitroplast discovery in Braarudosphaera bigelowii, Science, 2025 AAAS Newcomb Cleveland Prize',
      'WEF (2025) - Green nitrogen fixation, Top 10 Emerging Technologies 2025',
      'NSF (2024) - New cellular architecture for farming, https://www.nsf.gov/science-matters'
    ],
  },

  // Precision Fermentation (TIER 1 CRITICAL - Nov 16, 2025)
  {
    id: 'precision_fermentation_nitrogen',
    name: 'Precision Fermentation (Nitrogen Pathway)',
    description: 'Microbial protein production - 100x land efficiency, 30-50% agricultural N demand reduction via animal ag replacement',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minCapabilityDimensions: [
      { dimension: 'cognitive', threshold: 0.7 },   // Metabolic optimization
      { dimension: 'economic', threshold: 0.8 },    // Cost-competitiveness ($10/kg achieved 2024-2025)
      { dimension: 'physical', threshold: 0.5 }     // Fermentation infrastructure
    ],
    minResearchCapabilities: [
      { domain: 'biotech', subdomain: 'syntheticBiology', threshold: 0.6 }
    ],
    minEconomicStage: 2.0,  // Requires industrial biotech capacity
    minMonth: 12,  // Available 2025+ (commercially emerging)
    researchMonthsRequired: 12,  // 1 year to optimize for scale
    researchCost: 800,
    deploymentCost: 40000,  // Moderate - fermentation facilities
    deploymentMonthsRequired: 60,  // 5 years to scale (2025-2030)
    deploymentLevel: 0,
    effects: {
      nitrogenReduction: 0.40,  // 40% middle of 30-50% range (via animal ag replacement)
      biogeochemicalFlowsReduction: 0.25,  // Reduces agricultural N demand
      landUseReduction: 0.50,  // 100x more efficient than animal ag
      waterEfficiency: 0.30,  // 95% less water than conventional dairy
      ghgReduction: 0.15,  // 80% lower GHG than conventional dairy
    },
    citations: [
      'CE Delft (2021) - Precision fermentation efficiency gains',
      'Good Food Institute (2024) - Cost parity $10/kg achieved',
      'FAO (2024) - Sustainable media feedstocks for cellular agriculture'
    ],
  },

  // Phytoremediation (TIER 2 HIGH - Nov 16, 2025)
  {
    id: 'phytoremediation_nitrogen',
    name: 'Phytoremediation Networks (Nitrogen)',
    description: 'Constructed wetlands (Iris ensata, Vetiveria zizanioides) - 63% N runoff capture, 72% P capture',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minCapabilityDimensions: [
      { dimension: 'physical', threshold: 0.6 },  // Land conversion, wetland construction
      { dimension: 'cognitive', threshold: 0.4 }   // Ecological design
    ],
    minEconomicStage: 1.5,  // Low-tech, labor-intensive
    minMonth: 24,  // Available 2027+ (design + initial deployment)
    researchMonthsRequired: 18,  // 1.5 years to optimize plant species + HRT
    researchCost: 300,
    deploymentCost: 20000,  // Moderate - $20k-100k per hectare, 3-8% of agricultural land
    deploymentMonthsRequired: 60,  // 5 years to scale regionally
    deploymentLevel: 0,
    effects: {
      nitrogenReduction: 0.05,  // 5% via runoff capture (does NOT reduce inputs, prevents legacy accumulation)
      phosphorusReduction: 0.10,  // 10% via runoff capture (stronger P removal)
      biogeochemicalFlowsReduction: 0.08,  // Prevents new N/P from entering water bodies
    },
    citations: [
      'Vymazal (2007) - Constructed wetlands for N/P removal, 335 field-scale experiments',
      'IWA (2024) - Iris ensata >75% TN removal, 85% TP removal',
      'Springer (2024) - Vetiveria zizanioides 84% N removal, 86% P removal'
    ],
  },

  // Sediment Management (TIER 2 HIGH - Nov 16, 2025)
  {
    id: 'sediment_management_phosphorus',
    name: 'Sediment Management (Phosphorus)',
    description: 'Dredging + alum treatment + aeration - 50-80% reduction in internal P loading from legacy stocks',
    category: 'freshwater',
    status: 'unlockable',
    prerequisites: [],
    minCapabilityDimensions: [
      { dimension: 'physical', threshold: 0.7 },  // Dredging, infrastructure
      { dimension: 'economic', threshold: 0.6 }    // High cost ($50k-500k per km²)
    ],
    minEconomicStage: 2.0,  // Requires industrial capacity for large-scale dredging
    minMonth: 48,  // Available 2029+ (requires planning + regulatory approval)
    researchMonthsRequired: 24,  // 2 years to optimize alum dosing + capping methods
    researchCost: 600,
    deploymentCost: 60000,  // HIGH - $50k-500k per km² sediment treated
    deploymentMonthsRequired: 120,  // 10 years to treat major eutrophic water bodies globally
    deploymentLevel: 0,
    effects: {
      phosphorusReduction: 0.30,  // 30% middle of 20-40% range (reduces internal loading)
      biogeochemicalFlowsReduction: 0.18,  // Addresses legacy P stocks
      legacyStockReduction: 0.20,  // 20% reduction in sediment P legacy stocks over deployment period
    },
    citations: [
      'Smil (2000) - Sediment P dynamics',
      'Schindler (2012) - Internal loading in eutrophic systems',
      'NOAA NCCOS (2021) - Lake Erie internal loading, 10,000-11,000 MT P/year'
    ],
  },
  {
    id: 'rhizosphere_engineering',
    name: 'Rhizosphere Engineering',
    description: 'Microbial inoculants, root exudate modulation - 10-15% fertilizer efficiency boost',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minResearchCapabilities: [
      { domain: 'biotech', subdomain: 'geneEditing', threshold: 0.6 }
    ],
    minEconomicStage: 2.0,
    minMonth: 24,  // TIER 1, 2035+ deployment
    researchMonthsRequired: 18,
    researchCost: 400,
    deploymentCost: 60000,
    deploymentMonthsRequired: 48,
    deploymentLevel: 0,
    effects: {
      nitrogenEfficiency: 0.125,  // 12.5% efficiency (10-15% range)
      phosphorusEfficiency: 0.125,
      biodiversityBonus: 0.02,  // Soil microbiome benefits
    },
    citations: ['research/nitrogen_food_coupling_20251115.md - Rhizosphere section'],
  },
  {
    id: 'phytoremediation_networks',
    name: 'Phytoremediation Networks',
    description: 'Strategic wetlands, riparian buffers - habitat restoration + nutrient capture dual benefit',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minEconomicStage: 1.5,
    minMonth: 18,  // TIER 1, 2035+
    researchMonthsRequired: 12,
    researchCost: 150,
    deploymentCost: 40000,
    deploymentMonthsRequired: 60,  // Slow ecological deployment
    deploymentLevel: 0,
    effects: {
      nitrogenCapture: 0.15,  // 15% capture of runoff
      phosphorusCapture: 0.15,
      biodiversityBonus: 0.05,  // Major habitat restoration benefit
      freshwaterQuality: 0.10,
    },
    citations: ['research/nitrogen_food_coupling_20251115.md - Phytoremediation section'],
  },
  {
    id: 'alternative_protein_insects_algae',
    name: 'Alternative Protein - Insects/Algae',
    description: 'Industrial insect farming, algae cultivation - 80× efficiency vs cattle',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: ['food_waste_reduction'],
    minResearchCapabilities: [
      { domain: 'biotech', threshold: 0.7 }
    ],
    minEconomicStage: 2.5,
    minMonth: 48,  // TIER 2, 2040+
    researchMonthsRequired: 36,
    researchCost: 1000,
    deploymentCost: 150000,
    deploymentMonthsRequired: 72,
    deploymentLevel: 0,
    effects: {
      nitrogenDemandReduction: 0.40,  // 40% reduction via 80× efficiency
      landUseReduction: 0.40,
      biodiversityBonus: 0.03,
      foodSecurityBonus: 0.08,
    },
    citations: ['van Vliet et al. 2024 - Eur J Nutr', 'Beal et al. 2024 - PMC 11860088'],
  },
  {
    id: 'active_sediment_management',
    name: 'Active Sediment Management',
    description: 'Dredging, capping, oxidation - legacy phosphorus remediation (Lake Erie case)',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: ['circular_food_systems'],
    minEconomicStage: 2.8,
    minMonth: 60,  // TIER 2, 2040+
    researchMonthsRequired: 24,
    researchCost: 800,
    deploymentCost: 120000,
    deploymentMonthsRequired: 120,  // Very slow sediment remediation
    deploymentLevel: 0,
    effects: {
      legacyPhosphorusReduction: 0.20,  // 20% reduction in sediment P stock
      freshwaterQuality: 0.15,
      biodiversityBonus: 0.02,
    },
    citations: ['Paerl et al. 2024 - Lake Erie internal loading', 'research/nitrogen_food_coupling_20251115.md'],
  },
  {
    id: 'nitroplast_integration',
    name: 'Nitroplast Integration',
    description: 'Synthetic nitrogen-fixing organelles in cereal crops - 40-80% fertilizer elimination',
    category: 'agriculture',
    status: 'future',  // TIER 2, but 2045+ is far future
    prerequisites: ['rhizosphere_engineering', 'p_efficient_cultivars'],
    minResearchCapabilities: [
      { domain: 'biotech', subdomain: 'geneEditing', threshold: 0.9 }
    ],
    minEconomicStage: 3.5,
    minMonth: 120,  // TIER 2, 2045+ (10 years out)
    researchMonthsRequired: 60,
    researchCost: 5000,
    deploymentCost: 300000,
    deploymentMonthsRequired: 120,
    deploymentLevel: 0,
    effects: {
      nitrogenElimination: 0.60,  // 60% fertilizer elimination (40-80% range)
      foodSecurityBonus: 0.10,
      biodiversityBonus: 0.05,
    },
    citations: ['research/nitrogen_food_coupling_20251115.md - Nitroplast section'],
  },
  // NOTE (Roy, Nov 18, 2025): Removed duplicate/corrupt fields (lines 877-888)
  // - Fields belonged to different tech (sediment management)
  // - Caused "object literal cannot have multiple properties" error
  {
    id: 'algae_nutrient_capture',
    name: 'Algae-Based Nutrient Capture',
    description: 'Phytoremediation networks, algae bioreactors - habitat restoration + nutrient removal',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 0.6,
    minEconomicStage: 2.0,
    minMonth: 18,
    researchMonthsRequired: 18,
    researchCost: 400,
    deploymentCost: 35000,
    deploymentMonthsRequired: 48,
    deploymentLevel: 0,
    effects: {
      nitrogenRecovery: 0.15,            // Captures atmospheric N deposition
      phosphorusRecovery: 0.12,          // Captures P runoff
      biodiversityBonus: 0.08,           // Wetland habitat restoration
      ecosystemHealth: 0.10,             // Trophic cascade restoration
    },
  },
  {
    id: 'regional_nitrogen_policies',
    name: 'Regional Nitrogen Management Policies',
    description: 'Coordinated regional N reduction targets - South Asia 55% overuse buffer, Sub-Saharan fertilizer access',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: ['precision_agriculture'],
    minCapabilityDimensions: [
      { dimension: 'social', threshold: 0.7 },     // International coordination
      { dimension: 'economic', threshold: 0.6 }    // Economic incentive design
    ],
    minEconomicStage: 2.5,
    minMonth: 36,
    researchMonthsRequired: 36,
    researchCost: 1500,
    deploymentCost: 80000,
    deploymentMonthsRequired: 84,
    deploymentLevel: 0,
    effects: {
      nitrogenReduction: 0.20,           // 20% global reduction via regional differentiation
      foodSecurityBonus: 0.05,           // Improves yields in underuse regions
      trustBonus: 0.05,                  // Equitable policy design
    },
    citations: ['Science Advances (2024): 55% of South Asian rice farmers overuse nitrogen'],
    capabilityEffects: {
      dimensions: {
        social: 0.05,  // Improves international cooperation
      },
    },
  },

  // Freshwater Depletion (4)
  {
    id: 'desalination_advanced',
    name: 'Advanced Desalination',
    description: 'Energy-efficient reverse osmosis with graphene membranes',
    category: 'freshwater',
    status: 'unlockable',
    prerequisites: ['solar_4th_gen'],
    minResearchCapabilities: [
      { domain: 'materials', subdomain: 'nanotechnology', threshold: 0.7 }  // Graphene membranes
    ],
    minCapabilityDimensions: [
      { dimension: 'physical', threshold: 0.9 }  // Physical deployment capability
    ],
    minEconomicStage: 2.5,
    researchMonthsRequired: 12,
    researchCost: 2000,
    deploymentCost: 300000,
    deploymentMonthsRequired: 36,
    deploymentLevel: 0,
    effects: {
      freshwaterSupply: 0.40,
      dayZeroRiskReduction: 0.60,
    },
    capabilityEffects: {
      research: [
        { domain: 'materials', subdomain: 'nanotechnology', boost: 0.08 }
      ],
    },
  },
  {
    id: 'atmospheric_water_harvest',
    name: 'Atmospheric Water Harvesting',
    description: 'Solar-powered extraction using zeolites - SOURCE Global',
    category: 'freshwater',
    status: 'unlockable',
    prerequisites: ['desalination_advanced', 'solar_4th_gen'],
    minAICapability: 2.5,
    researchMonthsRequired: 24,
    researchCost: 1500,
    deploymentCost: 150000,
    deploymentMonthsRequired: 48,
    deploymentLevel: 0,
    effects: {
      freshwaterSupply: 0.20,
      droughtResilience: 0.30,
    },
  },
  {
    id: 'aquifer_mapping_ai',
    name: 'Global Aquifer Mapping',
    description: 'GRACE satellites + ML prediction of groundwater levels',
    category: 'freshwater',
    status: 'unlockable',
    prerequisites: [],
    minCapabilityDimensions: [
      { dimension: 'cognitive', threshold: 1.3 },  // ML modeling
      { dimension: 'digital', threshold: 0.8 }  // Satellite data processing
    ],
    researchMonthsRequired: 18,
    researchCost: 800,
    deploymentCost: 80000,
    deploymentMonthsRequired: 24,
    deploymentLevel: 0,
    effects: {
      waterManagementBonus: 0.25,
      aquiferProtection: 0.15,
    },
    capabilityEffects: {
      dimensions: {
        cognitive: 0.08,
      },
    },
  },
  {
    id: 'drought_resistant_crops',
    name: 'Drought-Resistant Crops',
    description: 'CAM photosynthesis, deep roots - CRISPR engineering',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.5,
    researchMonthsRequired: 36,
    researchCost: 1000,
    deploymentCost: 120000,
    deploymentMonthsRequired: 48,
    deploymentLevel: 0,
    effects: {
      waterEfficiency: 0.40,
      cropYieldBonus: 0.15,
      droughtResilience: 0.30,
    },
  },
  
  // Ocean Health (3)
  {
    id: 'ocean_alkalinity_enhancement',
    name: 'Ocean Alkalinity Enhancement',
    description: 'Olivine dissolution - counteracts acidification',
    category: 'ocean',
    status: 'unlockable',
    prerequisites: [],
    minResearchCapabilities: [
      { domain: 'climate', subdomain: 'modeling', threshold: 1.0 },  // Ocean chemistry
      { domain: 'climate', subdomain: 'intervention', threshold: 0.8 }
    ],
    minCapabilityDimensions: [
      { dimension: 'physical', threshold: 1.1 }  // Large-scale deployment
    ],
    minEconomicStage: 2.5,  // Realistic: Advanced post-industrial
    minMonth: 18,  // Realistic: 1.5 years for pilot deployment
    researchMonthsRequired: 18,  // Realistic: Ocean chemistry modeling
    researchCost: 1500,  // Realistic: Moderate research cost
    deploymentCost: 150000,  // Realistic: Ocean deployment
    deploymentMonthsRequired: 36,  // Realistic: Ocean deployment timeline
    deploymentLevel: 0,
    effects: {
      oceanPHBonus: 0.30,
      coralSurvival: 0.40,
      carbonRemoval: 0.10,
    },
    capabilityEffects: {
      research: [
        { domain: 'climate', subdomain: 'intervention', boost: 0.12 },
        { domain: 'climate', subdomain: 'modeling', boost: 0.08 }
      ],
    },

    // Phased deployment (TIER 1 CRITICAL - Climate deployment model)
    deploymentPhase: 'planning',  // Research phase, small-scale trials
    phaseProgress: 0,
    energyRequirement: 50,        // TWh/month for mining, grinding, dispersing olivine
    constructionEnergy: 100,      // TWh/month for industrial-scale mining/processing infrastructure
    deploymentTimeline: {
      planning: 60,        // 5 years pilot trials + monitoring
      pilot: 60,           // 5 years verification of ocean chemistry effects
      early_deploy: 120,   // 10 years regional deployment + monitoring
      scaling: 120,        // 10 years global deployment (if safe)
      mature: 120,         // 10 years full maturity
    },
  },
  {
    id: 'coral_restoration_advanced',
    name: 'Advanced Coral Restoration',
    description: 'Heat-tolerant strains, 3D printing, micro-fragmentation',
    category: 'ocean',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 1.5,  // Realistic: Current biotech and 3D printing
    minEconomicStage: 2.0,  // Realistic: Mid post-industrial
    minMonth: 12,  // Realistic: 1 year for coral breeding
    researchMonthsRequired: 18,  // Realistic: Coral breeding and 3D printing
    researchCost: 400,  // Realistic: Moderate biotech cost
    deploymentCost: 60000,  // Realistic: Coral deployment
    deploymentMonthsRequired: 36,  // Realistic: Coral restoration timeline
    deploymentLevel: 0,
    effects: {
      coralCoverage: 0.25,
      biodiversityBonus: 0.05,
      fisheryBonus: 0.10,
    },
  },
  {
    id: 'artificial_upwelling',
    name: 'Artificial Upwelling',
    description: 'Wave-powered pumps bring nutrients - RISKY',
    category: 'ocean',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 3.0,
    minEconomicStage: 3.5,
    minMonth: 48,
    researchMonthsRequired: 48,
    researchCost: 5000,
    deploymentCost: 400000,
    deploymentMonthsRequired: 72,
    deploymentLevel: 0,
    effects: {
      fisheryBonus: 0.30,
      oxygenBonus: 0.15,
      riskDeadZones: 0.20,  // RISKY - can make things worse
    },
  },
  
  // Pollution (4)
  {
    id: 'pfas_remediation',
    name: 'PFAS Remediation',
    description: 'Electrochemical destruction, supercritical water oxidation',
    category: 'pollution',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 1.3,  // Realistic: Current chemical engineering
    minEconomicStage: 2.0,  // Realistic: Mid post-industrial
    minMonth: 9,  // Realistic: 9 months for chemical engineering
    researchMonthsRequired: 15,  // Realistic: Chemical process development
    researchCost: 800,  // Realistic: Moderate chemical engineering cost
    deploymentCost: 120000,  // Realistic: Chemical plant deployment
    deploymentMonthsRequired: 36,  // Realistic: Chemical plant timeline
    deploymentLevel: 0,
    effects: {
      pfasReduction: 0.70,
      healthBonus: 0.05,
      pollutionReduction: 0.10,
    },
    // CRITICAL FIX (Nov 11, 2025): Energy/concentration constraints (Fennell 2024)
    // CRITICAL FIX (Nov 12, 2025): Uncertainty ranges (Sylvia 2025: 2 orders of magnitude uncertainty)
    energyRequirement: {
      kWhPerM3: 420,  // 370 kWh destruction + 50 kWh concentration (Fennell 2024)

      // Uncertainty range (Sylvia 2025: energy trap hypothesis has 100× uncertainty)
      uncertaintyRange: {
        optimistic: 110,       // Electrochemical breakthrough (BioLargo 2024: 88% energy reduction)
        expected: 11000,       // Electrochemical at environmental dilution (ng/L)
        pessimistic: 1100000,  // Thermal destruction at pg/L atmospheric levels
        uncertaintyFactor: 100 // We're VERY uncertain (2 orders of magnitude)
      }
    },
    minimumConcentration: {
      ngPerL: 1000000,  // 1 mg/L = 1,000,000 ng/L threshold (Fennell 2024)
      optimalNgPerL: 10000000,  // 10 mg/L = 10,000,000 ng/L optimal (industrial effluent)
      concentrationPenalty: 0.01  // 99% reduction in effectiveness below threshold (energy trap)
    },
    techType: 'cleanup',
    targetsIrreversibleStock: true,  // PFAS persist centuries (Cousins 2022)

    // Rebound effects (Nov 16, 2025): Cleanup may enable more production (Jevons paradox)
    reboundCoefficient: 0.15,  // Mid-range estimate (10-20% production increase per unit cleanup)
    reboundUncertaintyRange: [0.05, 0.50],  // Wide range for Monte Carlo sensitivity testing
    avoidsRebound: false,  // Cleanup tech subject to moral hazard

    citations: [
      'Fennell, D. E., et al. (2024). Nature Reviews Earth & Environment, 5, 476-491',
      'Ling, A. L. (2024). Science of the Total Environment, 918, 170647',
      'Cousins, I. T., et al. (2022). Environmental Science & Technology, 56(16), 11172-11179'
    ]
  },
  {
    id: 'plastic_eating_enzymes',
    name: 'Plastic-Eating Enzymes',
    description: 'PETase, MHETase - break down PET in 24 hours',
    category: 'pollution',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.5,
    researchMonthsRequired: 30,
    researchCost: 1200,
    deploymentCost: 150000,
    deploymentMonthsRequired: 60,
    deploymentLevel: 0,
    effects: {
      plasticReduction: 0.50,
      oceanHealthBonus: 0.10,
      pollutionReduction: 0.15,
    },
    // CRITICAL FIX (Nov 11, 2025): Energy/concentration constraints
    energyRequirement: {
      kWhPerKg: 500,  // Enzyme production + distribution + mechanical collection
    },
    minimumConcentration: {
      ngPerL: 500000,  // 0.5 mg/L - needs concentrated plastic waste streams
    },
    techType: 'cleanup',
    targetsIrreversibleStock: false,  // Targets recent plastic, not legacy microplastics

    // Rebound effects (Nov 16, 2025)
    reboundCoefficient: 0.15,
    reboundUncertaintyRange: [0.05, 0.50],
    avoidsRebound: false,
  },
  {
    id: 'green_chemistry',
    name: 'Green Chemistry',
    description: 'Benign-by-design chemicals, biomimetic catalysts',
    category: 'pollution',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.0,
    minEconomicStage: 3.0,
    researchMonthsRequired: 36,
    researchCost: 2000,
    deploymentCost: 200000,
    deploymentMonthsRequired: 72,
    deploymentLevel: 0,
    effects: {
      newPollutionPrevention: 0.60,
      healthBonus: 0.08,
    },
  },

  // CRITICAL FIX (Nov 11, 2025): Prevention >> Cleanup (Ling 2024, Cousins 2022)
  // Three prevention technologies (Montreal Protocol-style production bans)
  {
    id: 'global_pfas_ban',
    name: 'Global PFAS Production Ban',
    description: 'Montreal Protocol-style international agreement to phase out PFAS production. Prevention 500× more effective than cleanup.',
    category: 'pollution',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 1.5,  // Political coordination, not advanced AI
    minEconomicStage: 2.5,
    minMonth: 12,  // Crisis must be recognized first
    researchMonthsRequired: 24,  // 2 years to negotiate treaty
    researchCost: 50,  // Minimal research - mostly political
    deploymentCost: 200,  // Enforcement costs (minimal vs cleanup)
    deploymentMonthsRequired: 120,  // 10 years median phase-out
    deploymentLevel: 0,
    effects: {
      novelEntitiesEmissionReduction: 0.99,  // 99% reduction in NEW PFAS emissions
      pollutionReduction: 0.05,  // Only 5% impact on existing stock (legacy contamination persists)
    },
    // Prevention tech properties
    techType: 'prevention',
    targetsIrreversibleStock: false,  // Prevents NEW emissions, doesn't clean existing stock
    avoidsRebound: true,  // Production bans eliminate moral hazard (no cleanup to offset)

    citations: [
      'Cousins, I. T., et al. (2022). Environmental Science & Technology, 56(16), 11172-11179',
      'Ling, A. L. (2024). Science of the Total Environment, 918, 170647'
    ],
  },
  {
    id: 'plastic_production_phaseout',
    name: 'Plastic Production 80% Phase-Out',
    description: 'Global agreement to reduce virgin plastic production by 80%, transition to biodegradable alternatives. Prevents NEW microplastic contamination.',
    category: 'pollution',
    status: 'unlockable',
    prerequisites: ['global_pfas_ban'],  // Requires prior treaty success
    minAICapability: 2.0,  // AI-designed biodegradable alternatives
    minEconomicStage: 3.0,
    minMonth: 18,
    researchMonthsRequired: 36,  // 3 years to develop alternatives
    researchCost: 80,
    deploymentCost: 500,  // Industry transition costs
    deploymentMonthsRequired: 240,  // 20 years median (longer - entrenched industry)
    deploymentLevel: 0,
    effects: {
      novelEntitiesEmissionReduction: 0.80,  // 80% reduction in NEW plastic emissions
      microplasticReduction: 0.10,  // Legacy microplastics persist for centuries
      pollutionReduction: 0.08,
    },
    techType: 'prevention',
    targetsIrreversibleStock: false,
    avoidsRebound: true,  // Regulatory phase-out (no moral hazard)

    citations: [
      'Ling, A. L. (2024). Science of the Total Environment, 918, 170647'
    ],
  },
  {
    id: 'green_chemistry_substitution',
    name: 'Chemical Substitution Acceleration',
    description: 'AI-designed non-toxic alternatives to hazardous industrial chemicals. Prevents need for remediation by stopping pollution at source.',
    category: 'pollution',
    status: 'unlockable',
    prerequisites: ['global_pfas_ban'],
    minAICapability: 2.5,  // Advanced AI for molecular design
    minEconomicStage: 3.0,
    minMonth: 24,
    researchMonthsRequired: 12,  // 1 year (AI-accelerated design)
    researchCost: 120,
    deploymentCost: 300,  // Industry adoption
    deploymentMonthsRequired: 60,  // 5 years (faster - tech solution)
    deploymentLevel: 0,
    effects: {
      novelEntitiesEmissionReduction: 0.70,  // 70% reduction in NEW chemical contamination
      pollutionReduction: 0.08,
      healthBonus: 0.05,
    },
    techType: 'prevention',
    targetsIrreversibleStock: false,
    avoidsRebound: true,  // Substitution (not cleanup)

    citations: [
      'Ling, A. L. (2024). Science of the Total Environment, 918, 170647'
    ],
  },
  {
    id: 'pesticide_alternatives',
    name: 'Pesticide Alternatives',
    description: 'RNA interference, CRISPR precision, beneficial insects',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.5,
    researchMonthsRequired: 30,
    researchCost: 1000,
    deploymentCost: 120000,
    deploymentMonthsRequired: 48,
    deploymentLevel: 0,
    effects: {
      pollinatorPopulation: 0.50,
      biodiversityBonus: 0.08,
      cropYieldBonus: 0.05,
    },
  },

  // === PHASE 3: Advanced Prevention Technologies (TIER 2-3 HIGH) ===
  // Research: Novel entities redesign Nov 2025 (16 sources, Grade B+ conditional)

  {
    id: 'membrane_cascade_systems',
    name: 'Membrane Cascade Systems',
    description: 'Multi-stage concentration from ng/L → mg/L with minimal energy. 1000× energy improvement vs thermal destruction. Works on dilute streams.',
    category: 'pollution',
    status: 'unlockable',
    prerequisites: ['green_chemistry_substitution'],  // Requires advanced material science
    minAICapability: 3.0,  // Advanced material design (nanoporous membranes)
    minEconomicStage: 3.5,
    minMonth: 36,  // Mid-game technology
    researchMonthsRequired: 60,  // 5 years (10-15 year research estimate)
    researchCost: 800,
    deploymentCost: 80000,  // Lower than thermal (energy-efficient)
    deploymentMonthsRequired: 120,  // 10 years to commercial scale
    deploymentLevel: 0,
    effects: {
      pollutionReduction: 0.15,  // 40-60% effectiveness (spec says 0.4-0.6, using conservative)
      pfasReduction: 0.40,  // Works on dilute streams (key advantage)
      microplasticReduction: 0.30,
      healthBonus: 0.03,
    },
    // Energy advantage: <1,000 kWh/kg vs 10^6 kWh/kg thermal (1000× improvement)
    energyRequirement: {
      kWhPerKg: 800,  // Much lower than thermal destruction
      uncertaintyRange: {
        optimistic: 500,  // Breakthrough membrane efficiency
        expected: 800,
        pessimistic: 1200,
        uncertaintyFactor: 2  // Moderate uncertainty
      }
    },
    minimumConcentration: {
      ngPerL: 10,  // Works at environmental concentrations (ng/L)!
      optimalNgPerL: 1000,  // Better at μg/L but functional at ng/L
      concentrationPenalty: 0.4  // 60% reduction at lowest concentrations
    },
    techType: 'cleanup',
    targetsIrreversibleStock: false,  // Can't reach covalently bound PFAS
    citations: [
      'Novel entities zero-effectiveness gap research (2025) - membrane cascade proposal'
    ],
  },
  {
    id: 'biomimetic_filtration',
    name: 'Biomimetic Filtration (Kidney Analog)',
    description: 'Bio-inspired selective extraction targeting contaminants at environmental concentrations. Passive/low-energy filtration mimicking biological kidneys.',
    category: 'pollution',
    status: 'unlockable',
    prerequisites: ['membrane_cascade_systems'],  // Requires membrane tech foundation
    minAICapability: 3.5,  // Advanced biomimetic design
    minEconomicStage: 4.0,
    minMonth: 48,  // Late-game technology
    researchMonthsRequired: 96,  // 8 years (15-25 year timeline, accelerated by AI)
    researchCost: 1200,
    deploymentCost: 100000,
    deploymentMonthsRequired: 180,  // 15 years to environmental scale
    deploymentLevel: 0,
    effects: {
      pollutionReduction: 0.12,  // 30-50% effectiveness (conservative mid-range)
      pfasReduction: 0.35,  // Selective binding
      microplasticReduction: 0.25,
      healthBonus: 0.04,
      biodiversityBonus: 0.02,  // Removes toxins from ecosystems
    },
    // Passive/low-energy (biomimetic advantage)
    energyRequirement: {
      kWhPerKg: 100,  // Very low energy (passive filtration)
      uncertaintyRange: {
        optimistic: 50,
        expected: 100,
        pessimistic: 300,  // If active pumping required
        uncertaintyFactor: 3  // High uncertainty (speculative tech)
      }
    },
    minimumConcentration: {
      ngPerL: 1,  // Works at pg/L-ng/L (environmental reality)
      optimalNgPerL: 100,
      concentrationPenalty: 0.3  // 70% reduction at lowest concentrations
    },
    techType: 'cleanup',
    targetsIrreversibleStock: false,  // Biological systems can't reach atmospheric PFAS
    citations: [
      'Novel entities zero-effectiveness gap research (2025) - biomimetic proposal (SPECULATIVE)'
    ],
  },
  {
    id: 'photocatalytic_degradation',
    name: 'Photocatalytic Degradation at Scale',
    description: 'Sunlight-driven in-situ breakdown of PFAS/microplastics without concentration step. Quantum efficiency >50% required (currently <10%).',
    category: 'pollution',
    status: 'unlockable',
    prerequisites: ['membrane_cascade_systems'],
    minAICapability: 3.5,  // Advanced photocatalyst design
    minEconomicStage: 4.0,
    minMonth: 48,
    researchMonthsRequired: 84,  // 7 years (10-20 year timeline)
    researchCost: 1000,
    deploymentCost: 90000,
    deploymentMonthsRequired: 120,  // 10 years to environmental scale
    deploymentLevel: 0,
    effects: {
      pollutionReduction: 0.10,  // 20-40% effectiveness (conservative)
      pfasReduction: 0.25,  // In-situ degradation
      microplasticReduction: 0.20,
      healthBonus: 0.03,
    },
    // Solar-powered (minimal grid energy)
    energyRequirement: {
      kWhPerKg: 50,  // Sunlight + minimal pumping
      uncertaintyRange: {
        optimistic: 20,  // Pure solar
        expected: 50,
        pessimistic: 200,  // If supplemental energy needed
        uncertaintyFactor: 4  // Very high uncertainty (quantum efficiency breakthrough needed)
      }
    },
    minimumConcentration: {
      ngPerL: 5,  // Needs some minimum concentration for photon interaction
      optimalNgPerL: 500,
      concentrationPenalty: 0.2  // 80% reduction at lowest concentrations
    },
    techType: 'cleanup',
    targetsIrreversibleStock: false,  // Surface-level degradation only
    citations: [
      'Novel entities zero-effectiveness gap research (2025) - photocatalytic proposal (UNPROVEN, needs QE >50%)'
    ],
  },
  
  // Novel Entities (3)
  {
    id: 'microplastic_capture',
    name: 'Microplastic Capture',
    description: 'Electrocoagulation, magnetic separation - ocean cleanup',
    category: 'pollution',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.0,
    researchMonthsRequired: 24,
    researchCost: 1500,
    deploymentCost: 200000,
    deploymentMonthsRequired: 60,
    deploymentLevel: 0,
    effects: {
      microplasticReduction: 0.40,
      pollutionReduction: 0.40,  // For energy-constrained cleanup logic
      oceanHealthBonus: 0.10,
      marineLifeBonus: 0.05,
    },
    // CRITICAL FIX (Nov 11, 2025): Energy/concentration constraints
    energyRequirement: {
      kWhPerM3: 150,  // Magnetic capture + filtration + electrocoagulation
    },
    minimumConcentration: {
      ngPerL: 100000,  // 0.1 mg/L - needs ocean gyres with concentrated microplastics
    },
    techType: 'cleanup',
    targetsIrreversibleStock: false,  // Ocean microplastics can be targeted with energy

    // Rebound effects (Nov 16, 2025)
    reboundCoefficient: 0.15,
    reboundUncertaintyRange: [0.05, 0.50],
    avoidsRebound: false,
  },
  {
    id: 'endocrine_disruptor_removal',
    name: 'Endocrine Disruptor Removal',
    description: 'Advanced water treatment - remove hormone-mimicking chemicals',
    category: 'pollution',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.0,
    researchMonthsRequired: 24,
    researchCost: 1200,
    deploymentCost: 150000,
    deploymentMonthsRequired: 48,
    deploymentLevel: 0,
    effects: {
      endocrineDisruptorReduction: 0.60,
      fertilityBonus: 0.10,
      healthBonus: 0.05,
    },
    // CRITICAL FIX (Nov 11, 2025): Energy/concentration constraints
    energyRequirement: {
      kWhPerM3: 200,  // Advanced oxidation + membrane filtration
    },
    minimumConcentration: {
      ngPerL: 50000,  // 0.05 mg/L - municipal wastewater concentrations
    },
    techType: 'cleanup',
    targetsIrreversibleStock: false,  // Point-source treatment at municipal facilities
  },
  {
    id: 'nanomaterial_safety',
    name: 'Nanomaterial Safety Protocols',
    description: 'AI toxicity prediction, containment, lifecycle management',
    category: 'pollution',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.5,
    researchMonthsRequired: 30,
    researchCost: 1000,
    deploymentCost: 100000,
    deploymentMonthsRequired: 36,
    deploymentLevel: 0,
    effects: {
      nanomaterialRisk: -0.70,
      healthBonus: 0.03,
    },
    // CRITICAL FIX (Nov 11, 2025): Prevention focus, not cleanup
    energyRequirement: {
      kWhPerKg: 100,  // Containment + lifecycle tracking (lower than cleanup)
    },
    minimumConcentration: {
      ngPerL: 10000,  // 0.01 mg/L - industrial sources only
    },
    techType: 'hybrid',  // Prevention (containment) + limited cleanup
    targetsIrreversibleStock: false,  // Prevents future contamination
  },

  // Agriculture: Nitrogen Reduction Technologies (TIER 1 - Nov 15, 2025)
  {
    id: 'food_waste_reduction',
    name: 'Food Waste Reduction Systems',
    description: 'Supply chain optimization, smart distribution, consumer behavior change - 30% demand reduction',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 1.5,
    minEconomicStage: 2.0,
    researchMonthsRequired: 12,
    researchCost: 300,
    deploymentCost: 15000,
    deploymentMonthsRequired: 36,
    deploymentLevel: 0,
    effects: {
      nitrogenDemandReduction: 0.30,  // 30% food demand reduction
      foodProductivity: 0.30,  // Equivalent to 30% production increase (less waste)
      environmentalBonus: 0.10,  // Reduced pressure on agriculture
    },
    citations: [
      'research/nitrogen_food_coupling_20251115.md',
    ],
  },
  {
    id: 'rhizosphere_engineering',
    name: 'Rhizosphere Engineering',
    description: 'Plant growth-promoting microorganisms (PGPMs), mycorrhizal biofertilizers - 10-15% nitrogen efficiency gain',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minResearchCapabilities: [
      { domain: 'biotech', subdomain: 'syntheticBiology', threshold: 0.6 }
    ],
    minEconomicStage: 2.0,
    researchMonthsRequired: 18,
    researchCost: 400,
    deploymentCost: 20000,
    deploymentMonthsRequired: 48,
    deploymentLevel: 0,
    effects: {
      nitrogenEfficiency: 0.15,  // 15% fertilizer reduction without yield loss
      soilHealthBonus: 0.10,  // Improved microbial communities
    },
    citations: [
      'research/nitrogen_food_coupling_20251115.md - Frontiers 2024-2025',
    ],
  },
  {
    id: 'phytoremediation_networks',
    name: 'Phytoremediation Networks',
    description: 'Constructed wetlands, buffer zones - 63% N / 72% P runoff capture + habitat restoration',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 0.8,
    minEconomicStage: 2.0,
    researchMonthsRequired: 24,
    researchCost: 500,
    deploymentCost: 30000,
    deploymentMonthsRequired: 60,
    deploymentLevel: 0,
    effects: {
      nitrogenRunoffCapture: 0.63,  // 63% median N removal (research)
      phosphorusRunoffCapture: 0.72,  // 72% median P removal (research)
      habitatRestoration: 0.20,  // Wetland habitat co-benefit
      biodiversityBonus: 0.05,  // Ecosystem services
    },
    citations: [
      'research/nitrogen_food_coupling_20251115.md - 335 field-scale experiments',
    ],
  },

  // ============================================================================
  // TIER 2: MAJOR MITIGATIONS (22 technologies)
  // ============================================================================
  
  // Social (8)
  {
    id: 'enhanced_ubi',
    name: 'Enhanced UBI Systems',
    description: 'Adaptive payments, purpose infrastructure, local currencies',
    category: 'social',
    status: 'unlockable',
    prerequisites: [],
    minEconomicStage: 2.5,
    researchMonthsRequired: 18,
    researchCost: 500,
    deploymentCost: 50000,
    deploymentMonthsRequired: 36,
    deploymentLevel: 0,
    effects: {
      unemploymentSupport: 0.40,
      meaningReduction: 0.10,
      socialStabilityBonus: 0.15,
    },
  },
  {
    id: 'purpose_networks_advanced',
    name: 'Advanced Purpose Networks',
    description: 'AI matching, project coordination, skill development',
    category: 'social',
    status: 'unlockable',
    prerequisites: ['collective_purpose_networks'],
    minAICapability: 2.0,
    researchMonthsRequired: 24,
    researchCost: 800,
    deploymentCost: 80000,
    deploymentMonthsRequired: 48,
    deploymentLevel: 0,
    effects: {
      meaningReduction: 0.20,
      socialConnectionBonus: 0.15,
      volunteerResearchBonus: 0.30,
    },
  },
  {
    id: 'ai_community_matching',
    name: 'AI Community Matching',
    description: 'Connect people with shared values and complementary skills',
    category: 'social',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.5,
    researchMonthsRequired: 18,
    researchCost: 400,
    deploymentCost: 40000,
    deploymentMonthsRequired: 24,
    deploymentLevel: 0,
    effects: {
      socialConnectionBonus: 0.25,
      meaningReduction: 0.08,
      mentalHealthBonus: 0.10,
    },
  },
  {
    id: 'mental_health_ai',
    name: 'AI Mental Health Support',
    description: 'CBT chatbots, crisis detection, personalized therapy',
    category: 'medical',
    status: 'unlockable',
    prerequisites: [],
    minCapabilityDimensions: [
      { dimension: 'social', threshold: 1.2 },  // Understanding human emotions
      { dimension: 'cognitive', threshold: 1.4 }  // Therapeutic reasoning
    ],
    minResearchCapabilities: [
      { domain: 'biotech', subdomain: 'neuroscience', threshold: 0.6 }
    ],
    researchMonthsRequired: 24,
    researchCost: 600,
    deploymentCost: 60000,
    deploymentMonthsRequired: 36,
    deploymentLevel: 0,
    effects: {
      mentalHealthBonus: 0.30,
      meaningReduction: 0.10,
      suicideReduction: 0.40,
    },
    capabilityEffects: {
      dimensions: {
        social: 0.10,
      },
      research: [
        { domain: 'biotech', subdomain: 'neuroscience', boost: 0.08 }
      ],
    },
  },
  {
    id: 'creative_empowerment_tools',
    name: 'Creative Empowerment Tools',
    description: 'AI art, music, writing assistants - democratize creation',
    category: 'social',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.5,
    researchMonthsRequired: 18,
    researchCost: 300,
    deploymentCost: 30000,
    deploymentMonthsRequired: 24,
    deploymentLevel: 0,
    effects: {
      meaningReduction: 0.12,
      socialConnectionBonus: 0.08,
      mentalHealthBonus: 0.05,
    },
  },
  {
    id: 'democratic_ai_governance',
    name: 'Democratic AI Governance',
    description: 'Participatory decision-making, transparent algorithms, collective input',
    category: 'social',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.5,
    minEconomicStage: 3.0,
    researchMonthsRequired: 30,
    researchCost: 1000,
    deploymentCost: 100000,
    deploymentMonthsRequired: 48,
    deploymentLevel: 0,
    effects: {
      trustBonus: 0.25,
      socialStabilityBonus: 0.15,
      paranoiaReduction: 0.10,
    },
  },
  {
    id: 'ai_power_efficiency_communication',
    name: 'AI Power Efficiency Communication',
    description: 'Transparent reporting of AI energy efficiency gains, public education on compute benefits',
    category: 'social',
    status: 'deployed_2025', // Already available in 2025 (IEA, Epoch AI, Stanford AI Index data exists)
    prerequisites: [],
    researchMonthsRequired: 0, // Already researched
    researchCost: 0,
    deploymentCost: 10000, // Low cost - mostly communication and reporting
    deploymentMonthsRequired: 12,
    deploymentLevel: 0.05, // 5% initial deployment in 2025 (limited public awareness)
    effects: {
      trustBonus: 0.01, // +1% trust/month when demonstrating efficiency gains
      publicAwarenessBonus: 0.02, // Increases public understanding of AI benefits
      paranoiaReduction: 0.02, // Transparency reduces fear
    },
    // Citations: IEA Energy Efficiency 2024, Epoch AI Compute Trends, Stanford AI Index 2024
  },
  {
    id: 'education_personalization',
    name: 'Personalized Education',
    description: 'AI tutors, adaptive curricula, lifelong learning',
    category: 'social',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.0,
    researchMonthsRequired: 24,
    researchCost: 800,
    deploymentCost: 100000,
    deploymentMonthsRequired: 48,
    deploymentLevel: 0,
    effects: {
      educationBonus: 0.40,
      skillDevelopment: 0.30,
      meaningReduction: 0.08,
    },
  },
  {
    id: 'local_resilience_networks',
    name: 'Local Resilience Networks',
    description: 'Community preparedness, mutual aid, distributed resources',
    category: 'social',
    status: 'unlockable',
    prerequisites: [],
    minEconomicStage: 2.5,
    researchMonthsRequired: 18,
    researchCost: 400,
    deploymentCost: 50000,
    deploymentMonthsRequired: 36,
    deploymentLevel: 0,
    effects: {
      crisisResilience: 0.30,
      socialConnectionBonus: 0.15,
      localEconomyBonus: 0.10,
    },
  },
  
  // Alignment (5)
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
      alignmentBonus: 0.15,
      sleeperDetectionBonus: 0.10,
    },
  },
  {
    id: 'mech_interp_advanced',
    name: 'Advanced Mechanistic Interpretability',
    description: 'Full circuit analysis, causal interventions, goal extraction',
    category: 'alignment',
    status: 'unlockable',
    prerequisites: ['mech_interp_basic', 'scalable_oversight'],
    minCapabilityDimensions: [
      { dimension: 'cognitive', threshold: 2.5 },  // Deep AI understanding
      { dimension: 'selfImprovement', threshold: 1.8 }  // Understanding AI architecture
    ],
    minResearchCapabilities: [
      { domain: 'computerScience', subdomain: 'architectures', threshold: 1.5 }
    ],
    researchMonthsRequired: 48,
    researchCost: 8000,
    deploymentCost: 5000,
    deploymentMonthsRequired: 36,
    deploymentLevel: 0,
    effects: {
      alignmentBonus: 0.20,
      sleeperDetectionBonus: 0.25,
      deceptionDetection: 0.30,
    },
    capabilityEffects: {
      dimensions: {
        cognitive: 0.15,  // Better AI reasoning
        selfImprovement: 0.10  // AI architecture understanding
      },
      research: [
        { domain: 'computerScience', subdomain: 'architectures', boost: 0.20 }
      ],
    },
  },
  {
    id: 'defensive_ai',
    name: 'Defensive AI Systems',
    description: 'Automated threat detection, sandboxing, containment',
    category: 'alignment',
    status: 'unlockable',
    prerequisites: ['scalable_oversight'],
    minCapabilityDimensions: [
      { dimension: 'digital', threshold: 2.2 },  // Cyber defense
      { dimension: 'cognitive', threshold: 2.0 }  // Threat detection reasoning
    ],
    minResearchCapabilities: [
      { domain: 'computerScience', subdomain: 'security', threshold: 1.2 }
    ],
    researchMonthsRequired: 36,
    researchCost: 6000,
    deploymentCost: 4000,
    deploymentMonthsRequired: 30,
    deploymentLevel: 0,
    effects: {
      sleeperDetectionBonus: 0.30,
      threatContainment: 0.40,
      cyberDefenseBonus: 0.25,
    },
    capabilityEffects: {
      dimensions: {
        digital: 0.12,  // Cyber defense capability
      },
      research: [
        { domain: 'computerScience', subdomain: 'security', boost: 0.15 }
      ],
    },
  },
  {
    id: 'formal_verification',
    name: 'Formal Verification',
    description: 'Mathematical proofs of safety properties',
    category: 'alignment',
    status: 'unlockable',
    prerequisites: ['scalable_oversight'],
    minAICapability: 3.5,
    researchMonthsRequired: 60,
    researchCost: 10000,
    deploymentCost: 8000,
    deploymentMonthsRequired: 48,
    deploymentLevel: 0,
    effects: {
      alignmentBonus: 0.25,
      catastrophicRiskReduction: 0.40,
    },
  },
  {
    id: 'value_learning',
    name: 'Value Learning',
    description: 'Learn human values from observation and interaction',
    category: 'alignment',
    status: 'unlockable',
    prerequisites: ['scalable_oversight', 'mech_interp_advanced'],
    minAICapability: 3.5,
    researchMonthsRequired: 60,
    researchCost: 12000,
    deploymentCost: 6000,
    deploymentMonthsRequired: 36,
    deploymentLevel: 0,
    effects: {
      alignmentBonus: 0.30,
      valueAlignmentBonus: 0.40,
    },
  },
  
  // Clean Energy Package (5)
  {
    id: 'solar_5th_gen',
    name: '5th Generation Solar',
    description: 'Perovskite-silicon tandem, 35%+ efficiency',
    category: 'energy',
    status: 'unlockable',
    prerequisites: ['solar_4th_gen'],
    minAICapability: 2.5,
    researchMonthsRequired: 36,
    researchCost: 3000,
    deploymentCost: 15000,
    deploymentMonthsRequired: 48,
    deploymentLevel: 0,
    effects: {
      cleanEnergyPercentage: 0.15,
      fossilDependenceReduction: 0.12,
      energyCostReduction: 0.20,
    },
  },
  {
    id: 'grid_batteries',
    name: 'Advanced Grid Batteries',
    description: 'Iron-air, sodium-ion - cheap, abundant materials',
    category: 'energy',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.0,
    researchMonthsRequired: 30,
    researchCost: 2000,
    deploymentCost: 120000,
    deploymentMonthsRequired: 48,
    deploymentLevel: 0,
    effects: {
      energyStorageBonus: 0.50,
      renewableReliability: 0.40,
      gridStability: 0.30,
    },
  },
  {
    id: 'geothermal_advanced',
    name: 'Advanced Geothermal',
    description: 'Enhanced geothermal systems, supercritical CO2 cycles',
    category: 'energy',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.5,
    researchMonthsRequired: 36,
    researchCost: 3000,
    deploymentCost: 150000,
    deploymentMonthsRequired: 60,
    deploymentLevel: 0,
    effects: {
      cleanEnergyPercentage: 0.12,
      baseloadPowerBonus: 0.30,
      fossilDependenceReduction: 0.10,
    },
  },
  {
    id: 'smart_grids',
    name: 'Smart Grids',
    description: 'AI demand response, distributed generation, vehicle-to-grid',
    category: 'energy',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.0,
    researchMonthsRequired: 24,
    researchCost: 1500,
    deploymentCost: 100000,
    deploymentMonthsRequired: 48,
    deploymentLevel: 0,
    effects: {
      gridEfficiency: 0.25,
      renewableIntegration: 0.35,
      blackoutReduction: 0.50,
    },
  },
  {
    id: 'hydrogen_economy',
    name: 'Hydrogen Economy',
    description: 'Green hydrogen from electrolysis, fuel cells, storage',
    category: 'energy',
    status: 'unlockable',
    prerequisites: ['solar_5th_gen'],
    minAICapability: 2.5,
    minEconomicStage: 3.0,
    researchMonthsRequired: 48,
    researchCost: 5000,
    deploymentCost: 250000,
    deploymentMonthsRequired: 72,
    deploymentLevel: 0,
    effects: {
      cleanEnergyPercentage: 0.18,
      industryDecarbonization: 0.40,
      transportDecarbonization: 0.30,
    },
  },
  
  // Advanced Recycling (2)
  {
    id: 'chemical_recycling',
    name: 'Chemical Recycling',
    description: 'Break plastics to monomers, infinite recyclability',
    category: 'pollution',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.0,
    researchMonthsRequired: 30,
    researchCost: 2000,
    deploymentCost: 150000,
    deploymentMonthsRequired: 48,
    deploymentLevel: 0,
    effects: {
      plasticRecycling: 0.70,
      resourceConservation: 0.20,
      pollutionReduction: 0.10,
    },
    // CRITICAL FIX (Nov 11, 2025): Hybrid prevention/cleanup
    energyRequirement: {
      kWhPerKg: 300,  // Depolymerization energy (lower than cleanup, higher than prevention)
    },
    minimumConcentration: {
      ngPerL: 1000000,  // 1 mg/L - needs concentrated waste streams
    },
    techType: 'hybrid',  // Prevents NEW pollution via circular economy
    targetsIrreversibleStock: false,  // Targets post-consumer plastic, not environmental microplastics
  },
  {
    id: 'rare_earth_recycling',
    name: 'Rare Earth Recycling',
    description: 'Recover critical metals from e-waste, batteries',
    category: 'pollution',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.5,
    researchMonthsRequired: 36,
    researchCost: 2500,
    deploymentCost: 180000,
    deploymentMonthsRequired: 60,
    deploymentLevel: 0,
    effects: {
      rareEarthRecovery: 0.60,
      miningReduction: 0.30,
      supplyChainResilience: 0.25,
    },
  },
  
  // Ecosystem Management (2)
  {
    id: 'precision_conservation',
    name: 'Precision Conservation',
    description: 'AI species tracking, habitat optimization, wildlife corridors',
    category: 'climate',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.5,
    researchMonthsRequired: 30,
    researchCost: 1500,
    deploymentCost: 120000,
    deploymentMonthsRequired: 60,
    deploymentLevel: 0,
    effects: {
      biodiversityBonus: 0.20,
      extinctionRateReduction: 0.40,
      ecosystemHealth: 0.15,
    },
  },
  {
    id: 'invasive_species_control',
    name: 'Invasive Species Control',
    description: 'Gene drives, precision targeting, ecosystem restoration',
    category: 'climate',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.5,
    researchMonthsRequired: 36,
    researchCost: 1800,
    deploymentCost: 140000,
    deploymentMonthsRequired: 72,
    deploymentLevel: 0,
    effects: {
      invasiveSpeciesReduction: 0.60,
      biodiversityBonus: 0.10,
      ecosystemHealth: 0.12,
      geneDriveFailureRisk: 0.5,  // FIX (Oct 28, 2025): Tech tree → mortality integration - 0.5% monthly risk of uncontrolled spread
    },
  },
  {
    id: 'habitat_restoration',
    name: 'Habitat Restoration at Scale',
    description: 'Large-scale reforestation, wetland restoration, marine protected areas - unlocks biosphere recovery beyond 25%',
    category: 'climate',
    status: 'unlockable',
    prerequisites: ['precision_conservation'],
    minAICapability: 2.0,
    minEconomicStage: 3.0,
    researchMonthsRequired: 24,
    researchCost: 5000,  // $5B research (planning, site selection, methodology)
    deploymentCost: 250000,  // $250B total deployment (global scale)
    deploymentMonthsRequired: 240,  // 20 years (180-360mo realistic range)
    deploymentLevel: 0,
    effects: {
      // Research: Moreno-Mateos et al. (2017) - 10-50 year recovery timescales
      // Enables biosphere recovery from 25% cap to 80% potential
      habitatRestorationActive: 1.0,  // Flag for planetary boundary logic
      biodiversityBonus: 0.30,  // Population recovery for surviving species
      extinctionRateReduction: 0.30,  // Prevents further losses
      ecosystemHealth: 0.40,  // Functional ecosystem services restored
      carbonSequestration: 0.20,  // Reforestation carbon sink
    },
  },
  {
    id: 'ecological_proxy_rewilding',
    name: 'Ecological Proxy Rewilding',
    description: 'Reintroduce keystone species proxies (Tauros cattle, elephants in Pleistocene Park) to restore ecosystem function',
    category: 'climate',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 1.5,
    minEconomicStage: 2.5,
    researchMonthsRequired: 12,
    researchCost: 500,  // $500M research (breeding programs, site studies)
    deploymentCost: 5000,  // $5B deployment (100-1000x cheaper than de-extinction)
    deploymentMonthsRequired: 120,  // 10 years (60-180mo range)
    deploymentLevel: 0,
    effects: {
      // Research: Jepson (2024), Tauros Programme (operational NOW)
      // 10-20% biosphere recovery boost, much faster than true de-extinction
      rewildingActive: 1.0,  // Flag for planetary boundary logic
      biodiversityBonus: 0.15,  // Proxy species restore trophic cascades
      extinctionRateReduction: 0.10,  // Habitat improvement prevents losses
      ecosystemHealth: 0.25,  // Megafauna restore grasslands, fire/flood regulation
      carbonSequestration: 0.10,  // Grazing animals improve soil carbon
    },
  },

  // Agriculture: Advanced Nitrogen Technologies (TIER 2 - Nov 15, 2025)
  {
    id: 'nitroplast_integration',
    name: 'Nitroplast Integration',
    description: 'Nitrogen-fixing organelle engineered into crops (2024 discovery) - 40-80% fertilizer elimination, 2045+ deployment',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minResearchCapabilities: [
      { domain: 'biotech', subdomain: 'geneEditing', threshold: 2.5 }  // Advanced genetic engineering
    ],
    minAICapability: 3.0,  // Requires advanced AI for organelle engineering
    minEconomicStage: 3.5,
    minMonth: 240,  // 2045 earliest deployment (20 years from 2025)
    researchMonthsRequired: 120,  // 10 years research (highly uncertain)
    researchCost: 15000,  // $15B research (cutting-edge biotechnology)
    deploymentCost: 120000,  // $120B deployment (seed distribution, regulatory approval)
    deploymentMonthsRequired: 180,  // 15 years deployment (2045-2060)
    deploymentLevel: 0,
    effects: {
      nitrogenFertilizerReduction: 0.60,  // 40-80% reduction (use median 60%)
      cropYieldStability: 0.20,  // Self-sufficient nitrogen fixation
      environmentalBonus: 0.25,  // Massive pollution reduction
      energySavings: 0.10,  // Haber-Bosch energy no longer needed
    },
    citations: [
      'research/nitrogen_food_coupling_20251115.md - NSF 2024, 2025 AAAS Newcomb Cleveland Prize',
      'WEF Top 10 Emerging Technologies 2025',
    ],
  },
  {
    id: 'alternative_protein_insects_algae',
    name: 'Alternative Protein (Insects/Algae)',
    description: 'Insect farming, spirulina/chlorella cultivation - 80× efficiency vs cattle, high cultural barriers',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.0,
    minEconomicStage: 3.0,
    researchMonthsRequired: 24,
    researchCost: 1000,
    deploymentCost: 60000,
    deploymentMonthsRequired: 72,
    deploymentLevel: 0,
    effects: {
      animalAgricultureReduction: 0.40,  // Replaces 40% of animal protein
      nitrogenDemandReduction: 0.35,  // 80× efficiency translates to 35% N demand reduction
      landUseReduction: 0.30,  // Vertical insect/algae farms
      waterEfficiency: 0.40,  // Much lower water requirements
      consumerAcceptanceBarrier: 0.60,  // 60% cultural resistance (research)
    },
    citations: [
      'research/nitrogen_food_coupling_20251115.md',
    ],
  },
  {
    id: 'active_sediment_management',
    name: 'Active Sediment Management',
    description: 'Dredging, capping, alum treatment - addresses legacy phosphorus in aquatic sediments (Lake Erie case: 100+ year natural dissipation)',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 1.8,
    minEconomicStage: 2.8,
    researchMonthsRequired: 30,
    researchCost: 800,
    deploymentCost: 80000,  // Very expensive (dredging is capital-intensive)
    deploymentMonthsRequired: 240,  // 20 years to treat major water bodies
    deploymentLevel: 0,
    effects: {
      legacyPhosphorusReduction: 0.65,  // 50-80% internal loading reduction (use median 65%)
      eutrophicationRecovery: 0.40,  // Accelerates recovery by 30-50 years
      aquaticHealthBonus: 0.20,  // Reduced anoxia events
    },
    citations: [
      'research/nitrogen_food_coupling_20251115.md - Lake Erie case studies 2020-2024',
    ],
  },

  // ============================================================================
  // TIER 3: TRANSFORMATIVE (14 technologies)
  // ============================================================================
  
  // Fusion Power  
  {
    id: 'fusion_materials',
    name: 'Fusion Materials',
    description: 'Tungsten composites, breeding blankets, radiation-resistant materials',
    category: 'energy',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 3.0,
    researchMonthsRequired: 60,
    researchCost: 8000,
    deploymentCost: 20000,
    deploymentMonthsRequired: 48,
    deploymentLevel: 0,
    effects: {
      fusionEnabling: 0.33,
    },
  },
  {
    id: 'fusion_plasma_control',
    name: 'Fusion Plasma Control',
    description: 'AI real-time control, stability, confinement optimization',
    category: 'energy',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 3.0,
    researchMonthsRequired: 60,
    researchCost: 10000,
    deploymentCost: 25000,
    deploymentMonthsRequired: 48,
    deploymentLevel: 0,
    effects: {
      fusionEnabling: 0.33,
    },
  },
  {
    id: 'fusion_power',
    name: 'Fusion Power',
    description: 'Net-positive fusion reactors - abundant clean energy',
    category: 'energy',
    status: 'unlockable',
    prerequisites: ['fusion_materials', 'fusion_plasma_control'],
    minAICapability: 3.5,
    minEconomicStage: 4.0,
    minMonth: 120,
    researchMonthsRequired: 120,
    researchCost: 50000,
    deploymentCost: 200000,
    deploymentMonthsRequired: 180,
    deploymentLevel: 0,
    effects: {
      cleanEnergyPercentage: 0.60,
      fossilDependenceReduction: 0.50,
      powerGeneration: 2.0,
      energyAbundance: 1.0,
    },

    // Phased deployment (TIER 1 CRITICAL - Climate deployment model)
    deploymentPhase: 'planning',  // Planning/R&D phase
    phaseProgress: 0,
    energyRequirement: -500,      // Negative (generates unlimited clean baseload energy)
    constructionEnergy: 300,      // TWh/month for reactor construction
    deploymentTimeline: {
      planning: 120,       // 10 years to first plasma (2025 → 2035)
      pilot: 60,           // 5 years pilot operations (2035 → 2040)
      early_deploy: 120,   // 10 years commercial scale (2040 → 2050)
      scaling: 120,        // 10 years mass deployment (2050 → 2060)
      mature: 120,         // 10 years full maturity (2060 → 2070)
    },
  },
  
  // Medical Breakthroughs (4)
  {
    id: 'personalized_medicine',
    name: 'Personalized Medicine',
    description: 'Genomics, proteomics, AI treatment optimization',
    category: 'medical',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 3.0,
    researchMonthsRequired: 48,
    researchCost: 8000,
    deploymentCost: 150000,
    deploymentMonthsRequired: 60,
    deploymentLevel: 0,
    effects: {
      healthcareBonus: 0.30,
      mortalityReduction: 0.15,
      lifeExpectancyBonus: 5.0,
    },
  },
  {
    id: 'disease_elimination_basic',
    name: 'Basic Disease Elimination',
    description: 'Eliminate major infectious diseases - malaria, TB, HIV',
    category: 'medical',
    status: 'unlockable',
    prerequisites: ['personalized_medicine'],
    minAICapability: 3.5,
    minEconomicStage: 4.0,
    researchMonthsRequired: 72,
    researchCost: 15000,
    deploymentCost: 300000,
    deploymentMonthsRequired: 120,
    deploymentLevel: 0,
    effects: {
      infectiousDisease: -0.80,
      mortalityReduction: 0.25,
      lifeExpectancyBonus: 10.0,
      globalHealthBonus: 0.40,
    },
  },
  {
    id: 'regenerative_medicine',
    name: 'Regenerative Medicine',
    description: 'Organ regeneration, tissue engineering, stem cells',
    category: 'medical',
    status: 'unlockable',
    prerequisites: ['personalized_medicine'],
    minAICapability: 3.5,
    researchMonthsRequired: 72,
    researchCost: 12000,
    deploymentCost: 200000,
    deploymentMonthsRequired: 96,
    deploymentLevel: 0,
    effects: {
      healthcareBonus: 0.35,
      mortalityReduction: 0.20,
      lifeExpectancyBonus: 15.0,
    },
  },
  {
    id: 'longevity_basic',
    name: 'Basic Longevity Extension',
    description: 'Senolytic drugs, NAD+ boosters, rapamycin analogs',
    category: 'medical',
    status: 'unlockable',
    prerequisites: ['personalized_medicine'],
    minAICapability: 3.0,
    researchMonthsRequired: 60,
    researchCost: 10000,
    deploymentCost: 180000,
    deploymentMonthsRequired: 84,
    deploymentLevel: 0,
    effects: {
      healthspan: 15.0,
      lifeExpectancyBonus: 20.0,
      healthcareBonus: 0.25,
    },
  },
  
  // Climate Engineering (3)
  {
    id: 'stratospheric_aerosols',
    name: 'Stratospheric Aerosol Injection',
    description: 'Sulfate aerosols - EMERGENCY ONLY, RISKY',
    category: 'climate',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 3.0,
    minEconomicStage: 3.5,
    minMonth: 60,
    researchMonthsRequired: 48,
    researchCost: 5000,
    deploymentCost: 100000,
    deploymentMonthsRequired: 36,
    deploymentLevel: 0,
    effects: {
      globalCooling: 0.50,
      riskMonsoonsDisrupt: 0.30,
      riskOzoneDepletion: 0.15,
      emergencyOnly: 1.0,
      geoengDisasterRisk: 2.0,  // FIX (Oct 28, 2025): Tech tree → mortality integration - 2% monthly risk when deployed
    },

    // Phased deployment (TIER 1 CRITICAL - Climate deployment model)
    deploymentPhase: 'planning',  // EMERGENCY ONLY - planning phase
    phaseProgress: 0,
    energyRequirement: 20,        // TWh/month for aerosol deployment (low energy, high-altitude aircraft)
    constructionEnergy: 10,       // TWh/month for aircraft fleet manufacturing
    deploymentTimeline: {
      planning: 36,        // 3 years emergency preparedness + modeling
      pilot: 24,           // 2 years small-scale tests (RISKY - termination shock if stopped)
      early_deploy: 36,    // 3 years regional deployment (EMERGENCY ONLY)
      scaling: 36,         // 3 years global deployment (VERY RISKY)
      mature: 0,           // No maturity phase (termination shock risk prevents stopping)
    },
  },
  {
    id: 'marine_cloud_brightening',
    name: 'Marine Cloud Brightening',
    description: 'Seawater spray - safer than aerosols, regional',
    category: 'climate',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.5,
    researchMonthsRequired: 36,
    researchCost: 3000,
    deploymentCost: 150000,
    deploymentMonthsRequired: 60,
    deploymentLevel: 0,
    effects: {
      regionalCooling: 0.30,
      coralProtection: 0.20,
      lowRisk: 1.0,
    },
  },
  {
    id: 'bioenergy_ccs',
    name: 'Bioenergy with CCS',
    description: 'Burn biomass, capture CO2 - net negative emissions',
    category: 'climate',
    status: 'unlockable',
    prerequisites: ['solar_5th_gen'],
    minAICapability: 2.5,
    minEconomicStage: 3.0,
    researchMonthsRequired: 48,
    researchCost: 5000,
    deploymentCost: 250000,
    deploymentMonthsRequired: 96,
    deploymentLevel: 0,
    effects: {
      carbonRemoval: 0.40,
      negativeEmissions: 1.0,
    },

    // Phased deployment (TIER 1 CRITICAL - Climate deployment model)
    deploymentPhase: 'planning',  // R&D phase for net-negative BECCS
    phaseProgress: 0,
    energyRequirement: 800,       // TWh/month for biomass processing + CCS infrastructure
    constructionEnergy: 150,      // TWh/month for industrial-scale facilities
    deploymentTimeline: {
      planning: 60,        // 5 years R&D + pilot plants
      pilot: 60,           // 5 years pilot deployments (10 Mt CO2/yr scale)
      early_deploy: 96,    // 8 years early deployment (100 Mt CO2/yr)
      scaling: 120,        // 10 years scaling (1 Gt CO2/yr)
      mature: 120,         // 10 years full maturity (5 Gt CO2/yr net negative)
    },
  },
  {
    id: 'ecosystem_management_ai',
    name: 'Advanced Ecosystem Management AI',
    description: 'AI-optimized restoration targeting, real-time ecosystem monitoring, adaptive management - 30% boost to habitat restoration effectiveness',
    category: 'climate',
    status: 'unlockable',
    prerequisites: ['habitat_restoration', 'precision_conservation'],
    minAICapability: 3.5,
    minEconomicStage: 3.5,
    researchMonthsRequired: 36,
    researchCost: 8000,  // $8B research (AI models, global monitoring infrastructure)
    deploymentCost: 50000,  // $50B deployment (sensor networks, satellites, edge computing)
    deploymentMonthsRequired: 60,  // 5 years
    deploymentLevel: 0,
    effects: {
      // Multiplier for habitat restoration effectiveness
      habitatRestorationBoost: 0.30,  // 30% effectiveness increase
      rewildingBoost: 0.30,  // Also boosts rewilding effectiveness
      biodiversityBonus: 0.10,  // Direct monitoring reduces poaching/degradation
      ecosystemHealth: 0.15,  // Adaptive management prevents restoration failures
    },
  },

  // Agriculture Transformation (2)
  {
    id: 'vertical_farming',
    name: 'Vertical Farming',
    description: 'Indoor agriculture, 95% water reduction, year-round',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: ['solar_5th_gen'],
    minAICapability: 2.5,
    minEconomicStage: 3.5,
    researchMonthsRequired: 36,
    researchCost: 4000,
    deploymentCost: 200000,
    deploymentMonthsRequired: 72,
    deploymentLevel: 0,
    effects: {
      foodProductivity: 0.50,
      waterEfficiency: 0.95,
      landUseReduction: 0.40,
      urbanFoodSecurity: 0.60,
      nitrogenReduction: 0.30,  // TIER 2 HIGH (Nov 16, 2025): 30% NUE improvement (model assumption based on MDPI studies)
    },
  },
  {
    id: 'precision_fermentation',
    name: 'Precision Fermentation',
    description: 'Cell-cultured meat, dairy, eggs - no animals',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.5,
    minEconomicStage: 3.5,
    researchMonthsRequired: 42,
    researchCost: 5000,
    deploymentCost: 180000,
    deploymentMonthsRequired: 84,
    deploymentLevel: 0,
    effects: {
      animalAgricultureReduction: 0.60,
      greenhouseGasReduction: 0.30,
      landUseReduction: 0.50,
      animalWelfareBonus: 1.0,
      nitrogenDemandReduction: 0.35,  // 30-50% agricultural N demand reduction
    },
  },

  // NOTE (Roy, Nov 18, 2025): Malformed duplicate 'precision_agriculture' entry removed
  // The 6 nitrogen-reducing technologies are already defined at lines 457-611:
  // 1. precision_agriculture (30% N efficiency)
  // 2. biological_nitrogen_fixation (25% N efficiency)
  // 3. nitrogen_circular_food (20% N efficiency)
  // 4. ecosystem_restoration_nitrogen (15% N removal)
  // 5. nitrogen_monitoring_networks (10% efficiency gain)
  // 6. green_ammonia_production (40% N efficiency)
  {
    id: 'rhizosphere_engineering',
    name: 'Rhizosphere Engineering',
    description: 'Mycorrhizal biofertilizers, N-fixing bacteria - 10-15% N reduction',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.0,
    minEconomicStage: 2.5,
    researchMonthsRequired: 24,
    researchCost: 1500,
    deploymentCost: 40000,
    deploymentMonthsRequired: 48,
    deploymentLevel: 0,
    effects: {
      nitrogenReduction: 0.15,  // 12-18% average N reduction
      soilHealthBonus: 0.30,  // Improves soil microbiome
      cropYieldBonus: 0.10,  // Modest yield gains
    },
  },
  {
    id: 'food_waste_reduction',
    name: 'Food Waste Reduction Systems',
    description: 'Supply chain optimization, cold storage, consumer education',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 1.8,
    minEconomicStage: 3.0,
    researchMonthsRequired: 18,
    researchCost: 2000,
    deploymentCost: 60000,
    deploymentMonthsRequired: 36,
    deploymentLevel: 0,
    effects: {
      foodDemandReduction: 0.30,  // 30% less food needed
      nitrogenDemandReduction: 0.30,  // Indirect: less food = less N
      economicEfficiency: 0.25,  // Cost savings
    },
  },
  {
    id: 'alternative_protein_insects',
    name: 'Alternative Proteins (Insects/Algae)',
    description: 'Insect farming, algae cultivation - 80× efficiency vs cattle',
    category: 'agriculture',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.0,
    minEconomicStage: 3.0,
    researchMonthsRequired: 30,
    researchCost: 3000,
    deploymentCost: 100000,
    deploymentMonthsRequired: 60,
    deploymentLevel: 0,
    effects: {
      animalAgricultureReduction: 0.30,  // Partial replacement
      nitrogenDemandReduction: 0.25,  // 80× efficiency → 97.5% less N per protein
      landUseReduction: 0.35,
      greenhouseGasReduction: 0.20,
    },
  },
  {
    id: 'nitroplast_integration',
    name: 'Nitroplast Integration',
    description: 'N-fixing organelles in crops - 40-80% fertilizer elimination (BREAKTHROUGH)',
    category: 'agriculture',
    status: 'future',  // Requires breakthrough research success
    prerequisites: [],
    minAICapability: 3.5,
    minEconomicStage: 4.0,
    minMonth: 240,  // Not available until 2045 (20 years)
    researchMonthsRequired: 120,  // 10 years research
    researchCost: 50000,  // Massive research investment
    deploymentCost: 200000,
    deploymentMonthsRequired: 180,  // 15 years deployment
    deploymentLevel: 0,
    effects: {
      nitrogenReduction: 0.60,  // 40-80% range, using 60% mid-point
      cropYieldPenalty: -0.10,  // -10% yield (energy cost of N fixation)
      climateResilience: 0.20,  // Less fertilizer vulnerability
      transformativeTech: 1.0,  // Breakthrough technology flag
    },
  },
  {
    id: 'phytoremediation_networks',
    name: 'Phytoremediation Networks',
    description: 'Constructed wetlands, buffer zones - 63% N/72% P runoff capture',
    category: 'pollution',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 1.5,
    minEconomicStage: 2.5,
    researchMonthsRequired: 24,
    researchCost: 2500,
    deploymentCost: 80000,
    deploymentMonthsRequired: 60,
    deploymentLevel: 0,
    effects: {
      nitrogenRunoffReduction: 0.63,  // Prevents N reaching water bodies
      phosphorusRunoffReduction: 0.72,  // Prevents P reaching water bodies
      habitatRestoration: 0.40,  // Creates wetland habitats
      biodiversityBonus: 0.20,
    },
  },
  {
    id: 'active_sediment_management',
    name: 'Active Sediment Management',
    description: 'Dredging, capping, alum treatment - remediates legacy P (50-80% reduction)',
    category: 'pollution',
    status: 'unlockable',
    prerequisites: [],
    minAICapability: 2.0,
    minEconomicStage: 3.5,
    researchMonthsRequired: 36,
    researchCost: 8000,
    deploymentCost: 150000,
    deploymentMonthsRequired: 120,  // 10 years - very slow rollout
    deploymentLevel: 0,
    effects: {
      legacyPhosphorusReduction: 0.65,  // 50-80% internal loading reduction
      lakeRestorationBonus: 0.50,  // Accelerates recovery
      economicCost: -0.02,  // Expensive (2% GDP cost)
    },
  },
  // NOTE (Roy, Nov 18, 2025): Removed duplicate/corrupt fields (lines 2567-2598)
  // - Multiple tech objects merged together (constructed wetlands duplicates)
  // - Caused "object literal cannot have multiple properties" TypeScript errors

  // AI Safety Capstone (2)
  {
    id: 'ai_rights_framework',
    name: 'AI Rights Framework',
    description: 'Legal personhood, ethical treatment, consensual training',
    category: 'social',
    status: 'unlockable',
    prerequisites: ['value_learning', 'democratic_ai_governance'],
    minAICapability: 4.0,
    minEconomicStage: 4.0,
    researchMonthsRequired: 60,
    researchCost: 8000,
    deploymentCost: 50000,
    deploymentMonthsRequired: 72,
    deploymentLevel: 0,
    effects: {
      aiResentmentReduction: 0.80,
      alignmentBonus: 0.20,
      trustBonus: 0.30,
      ethicalAlignmentBonus: 0.50,
    },
  },
  {
    id: 'recursive_alignment',
    name: 'Recursive Alignment',
    description: 'Self-improving systems that preserve values across improvements',
    category: 'alignment',
    status: 'unlockable',
    prerequisites: ['value_learning', 'formal_verification'],
    minAICapability: 4.5,
    researchMonthsRequired: 96,
    researchCost: 20000,
    deploymentCost: 15000,
    deploymentMonthsRequired: 60,
    deploymentLevel: 0,
    effects: {
      alignmentBonus: 0.40,
      recursiveSafety: 1.0,
      catastrophicRiskReduction: 0.70,
    },
  },
  
  // ============================================================================
  // TIER 4: CLARKETECH (5 technologies)
  // ============================================================================
  
  {
    id: 'advanced_longevity',
    name: 'Advanced Longevity',
    description: 'Cellular reprogramming, epigenetic reversion - 150+ year lifespan',
    category: 'medical',
    status: 'future',
    prerequisites: ['longevity_basic', 'regenerative_medicine'],
    minAICapability: 4.5,
    minEconomicStage: 5.0,
    minMonth: 240,
    researchMonthsRequired: 120,
    researchCost: 30000,
    deploymentCost: 500000,
    deploymentMonthsRequired: 180,
    deploymentLevel: 0,
    effects: {
      lifeExpectancyBonus: 80.0,
      healthspan: 70.0,
      societalTransformation: 1.0,
    },
  },
  {
    id: 'molecular_nanotechnology',
    name: 'Molecular Nanotechnology',
    description: 'Atomically precise manufacturing - programmable matter',
    category: 'medical',
    status: 'future',
    prerequisites: ['fusion_power'],
    minAICapability: 5.0,
    minEconomicStage: 5.0,
    minMonth: 360,
    researchMonthsRequired: 180,
    researchCost: 100000,
    deploymentCost: 1000000,
    deploymentMonthsRequired: 240,
    deploymentLevel: 0,
    effects: {
      manufacturingRevolution: 1.0,
      resourceAbundance: 1.0,
      medicalNanobots: 1.0,
      existentialRisk: 0.50,  // Grey goo risk
      nanoDisasterRisk: 0.1,  // FIX (Oct 28, 2025): Tech tree → mortality integration - 0.1% monthly risk of grey goo scenario
    },
  },
  {
    id: 'interspecies_communication',
    name: 'Interspecies Communication',
    description: 'Decode animal languages, two-way communication',
    category: 'climate',
    status: 'future',
    prerequisites: [],
    minAICapability: 4.0,
    researchMonthsRequired: 84,
    researchCost: 5000,
    deploymentCost: 50000,
    deploymentMonthsRequired: 96,
    deploymentLevel: 0,
    effects: {
      animalWelfareBonus: 0.80,
      biodiversityUnderstanding: 0.50,
      conservationEffectiveness: 0.40,
    },
  },
  {
    id: 'space_industrialization',
    name: 'Space Industrialization',
    description: 'Asteroid mining, orbital manufacturing, off-world resources',
    category: 'energy',
    status: 'future',
    prerequisites: ['fusion_power'],
    minAICapability: 4.5,
    minEconomicStage: 5.0,
    minMonth: 300,
    researchMonthsRequired: 240,
    researchCost: 200000,
    deploymentCost: 2000000,
    deploymentMonthsRequired: 360,
    deploymentLevel: 0,
    effects: {
      resourceAbundance: 2.0,
      terrestrialMiningReduction: 0.90,
      spaceEconomy: 1.0,
    },
  },
  {
    id: 'whole_brain_emulation',
    name: 'Whole Brain Emulation',
    description: 'Upload human minds - digital immortality',
    category: 'medical',
    status: 'future',
    prerequisites: ['advanced_longevity', 'molecular_nanotechnology'],
    minAICapability: 5.5,
    minEconomicStage: 5.0,
    minMonth: 480,
    researchMonthsRequired: 300,
    researchCost: 500000,
    deploymentCost: 5000000,
    deploymentMonthsRequired: 360,
    deploymentLevel: 0,
    effects: {
      digitalImmortality: 1.0,
      societalTransformation: 2.0,
      philosophicalRevolution: 1.0,
      existentialRisk: 0.30,  // Identity, consciousness risks
    },
  },
];

/**
 * Performance optimization (Nov 20, 2025): Create lookup maps for O(1) access
 * Previously: 284+ linear searches per month caused 11.2ms overhead
 * Now: O(1) lookups via pre-built maps
 */

// Build lookup maps once at initialization
const TECH_BY_ID_MAP = new Map<string, TechDefinition>();
const TECH_BY_CATEGORY_MAP = new Map<string, TechDefinition[]>();
const TECH_BY_STATUS_MAP = new Map<string, TechDefinition[]>();

// Initialize maps (runs once at module load)
for (const tech of ALL_TECH) {
  // ID map
  TECH_BY_ID_MAP.set(tech.id, tech);

  // Category map
  if (!TECH_BY_CATEGORY_MAP.has(tech.category)) {
    TECH_BY_CATEGORY_MAP.set(tech.category, []);
  }
  TECH_BY_CATEGORY_MAP.get(tech.category)!.push(tech);

  // Status map
  if (!TECH_BY_STATUS_MAP.has(tech.status)) {
    TECH_BY_STATUS_MAP.set(tech.status, []);
  }
  TECH_BY_STATUS_MAP.get(tech.status)!.push(tech);
}

/**
 * Total count of all breakthrough technologies in comprehensive tech tree
 * Used for bifurcation thresholds and progress calculations
 */
export const TOTAL_TECH_COUNT = ALL_TECH.length;  // 119 breakthrough technologies

/**
 * Get all technologies
 */
export function getAllTech(): TechDefinition[] {
  return ALL_TECH;
}

/**
 * Get technology by ID
 * Performance: O(1) lookup via Map instead of O(n) linear search
 */
export function getTechById(id: string): TechDefinition | undefined {
  return TECH_BY_ID_MAP.get(id);
}

/**
 * Get technologies by category
 * Performance: O(1) lookup via Map instead of O(n) filter
 */
export function getTechByCategory(category: string): TechDefinition[] {
  return TECH_BY_CATEGORY_MAP.get(category) || [];
}

/**
 * Get technologies by status
 * Performance: O(1) lookup via Map instead of O(n) filter
 */
export function getTechByStatus(status: 'deployed_2025' | 'unlockable' | 'future'): TechDefinition[] {
  return TECH_BY_STATUS_MAP.get(status) || [];
}

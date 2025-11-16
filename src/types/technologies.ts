/**
 * Breakthrough Technology System
 * 
 * Represents major technological breakthroughs that can:
 * - Reverse environmental damage
 * - Prevent/resolve social crises
 * - Enable sustainable abundance
 * 
 * Part of Utopian Dynamics Phase 2
 */

export interface TechnologyNode {
  id: string;
  name: string;
  category: 'environmental' | 'social' | 'medical' | 'infrastructure';

  // Status
  unlocked: boolean;
  researchProgress: number; // 0-1
  deploymentLevel: number; // 0-1 (how widely deployed)

  // Unlock requirements
  requirements: {
    minAICapability: number;
    minEconomicStage: number;
    requiredInvestment: number; // Total $B needed
    prerequisiteTechs: string[]; // Must unlock these first
    blockedByCrises?: string[]; // Can't research during these crises
  };

  // Research
  monthlyResearchCost: number; // $B per month
  monthsToUnlock: number; // Estimated time with full investment

  // Effects (applied each month when deployed)
  effects: TechnologyEffects;

  // Phased deployment fields (TIER 1 CRITICAL - Climate deployment model)
  deploymentPhase?: 'planning' | 'pilot' | 'early_deploy' | 'scaling' | 'mature' | 'saturated';
  phaseProgress?: number; // 0-100% progress through current phase

  // Energy requirements (TWh/month)
  energyRequirement?: number; // TWh/month for operation
  constructionEnergy?: number; // TWh/month during deployment

  // Deployment timeline (months per phase)
  deploymentTimeline?: {
    planning?: number;
    pilot?: number;
    early_deploy?: number;
    scaling?: number;
    mature?: number;
  };
}

export interface TechnologyEffects {
  // Environmental
  biodiversityRecovery?: number; // +X per month
  biodiversityBoost?: number; // Alternative name for biodiversityRecovery
  climateStabilization?: number; // +X per month
  pollutionReduction?: number; // -X per month
  resourceEfficiency?: number; // Multiplier on depletion rate
  ecosystemHealthBoost?: number; // +X per month to ecosystem health
  
  // Social
  meaningCrisisReduction?: number; // -X per month
  culturalAdaptation?: number; // +X per month
  communityStrengthBoost?: number; // +X per month
  purposeDiscovery?: number; // +X per month to purpose systems
  creativityBoost?: number; // +X per month to creativity/cultural systems
  
  // QoL direct boosts
  mentalHealthBoost?: number;
  healthcareBoost?: number;
  
  // Other
  trustBoost?: number; // One-time or ongoing
  energyAbundanceBoost?: number; // Raises cap
}

export interface BreakthroughTechState {
  // Environmental Technologies
  cleanEnergy: TechnologyNode;
  advancedRecycling: TechnologyNode;
  ecosystemManagement: TechnologyNode;
  carbonCapture: TechnologyNode;
  sustainableAgriculture: TechnologyNode;
  
  // Social Technologies
  mentalHealthAI: TechnologyNode;
  purposeFrameworks: TechnologyNode;
  communityPlatforms: TechnologyNode;
  interspeciesComm: TechnologyNode;
  
  // Medical Technologies
  diseaseElimination: TechnologyNode;
  longevityTherapies: TechnologyNode;
  
  // Infrastructure
  fusionPower: TechnologyNode;
  
  // Phosphorus Recovery Technologies (TIER 1.1)
  struviteRecovery?: {
    unlocked: boolean;
    deploymentLevel: number;
    breakthroughYear: number;
  };
  soilOptimization?: {
    unlocked: boolean;
    deploymentLevel: number;
    breakthroughYear: number;
  };
  efficientCrops?: {
    unlocked: boolean;
    deploymentLevel: number;
    breakthroughYear: number;
  };
  circularFoodSystems?: {
    unlocked: boolean;
    deploymentLevel: number;
    breakthroughYear: number;
  };
  
  // Freshwater Technologies (TIER 1.2)
  advancedDesalination?: {
    unlocked: boolean;
    deploymentLevel: number;
    breakthroughYear: number;
  };
  waterRecycling?: {
    unlocked: boolean;
    deploymentLevel: number;
    breakthroughYear: number;
  };
  precisionIrrigation?: {
    unlocked: boolean;
    deploymentLevel: number;
    breakthroughYear: number;
  };
  atmosphericWater?: {
    unlocked: boolean;
    deploymentLevel: number;
    breakthroughYear: number;
  };
  
  // Ocean Acidification Technologies (TIER 1.3)
  oceanAlkalinityEnhancement?: {
    unlocked: boolean;
    deploymentLevel: number;
    breakthroughYear: number;
  };
  coralRestoration?: {
    unlocked: boolean;
    deploymentLevel: number;
    breakthroughYear: number;
  };
  marineProtectedAreas?: {
    unlocked: boolean;
    deploymentLevel: number;
    breakthroughYear: number;
  };
  
  // Novel Entities Technologies (TIER 1.5)
  greenChemistry?: {
    unlocked: boolean;
    deploymentLevel: number;
    breakthroughYear: number;
  };
  advancedBioremediation?: {
    unlocked: boolean;
    deploymentLevel: number;
    breakthroughYear: number;
  };
  circularEconomySystems?: {
    unlocked: boolean;
    deploymentLevel: number;
    breakthroughYear: number;
  };
  chemicalSafetyRegulations?: {
    unlocked: boolean;
    deploymentLevel: number;
    breakthroughYear: number;
  };
  
  // Purpose Infrastructure Technologies (TIER 2.1)
  collectivePurposeNetworks?: {
    unlocked: boolean;
    deploymentLevel: number; // [0, 1] Infrastructure investment level
    breakthroughYear: number;
  };
  
  // Advanced Pollution Remediation Technologies (TIER 2.3)
  advancedDirectAirCapture?: {
    unlocked: boolean;
    deploymentLevel: number; // [0, 1]
    breakthroughYear: number;
  };
  aiOptimizedPollutionRemediation?: {
    unlocked: boolean;
    deploymentLevel: number; // [0, 1]
    breakthroughYear: number;
  };
  
  // Advanced AI Alignment Technologies (TIER 2.4 & 2.5)
  advancedRLHF?: {
    unlocked: boolean;
    active: boolean; // Applied to all training AIs
    breakthroughYear: number;
    alignmentBoostPerMonth: number; // +0.05 alignment/month (research-backed)
    alignmentFakingRisk: number; // [0, 1] Risk of deceptive alignment
  };
  mechanisticInterpretability?: {
    unlocked: boolean;
    deploymentLevel: number; // [0, 1] Integration into evaluation pipelines
    breakthroughYear: number;
    sleeperDetectionBonus: number; // +40% detection rate (research-backed)
    alignmentVerificationBonus: number; // +30% verification quality
  };
  
  // De-Extinction & Rewilding (TIER 2.6)
  deExtinctionRewilding?: {
    unlocked: boolean;
    deploymentLevel: number; // [0, 1] Species restored and released
    breakthroughYear: number;
    biodiversityBoostPerMonth: number; // +2%/month (research-backed)
  };

  // NOTE: Nitrogen Reduction Technologies (TIER 2 HIGH - Nov 15, 2025)
  // Have been migrated to comprehensive tech tree (src/simulation/techTree/comprehensiveTechTree.ts)
  // See: precision_agriculture, biological_nitrogen_fixation, nitrogen_circular_food,
  //      ecosystem_restoration_nitrogen, nitrogen_monitoring_networks, green_ammonia_production

  // Government research priorities
  researchPriorities: {
    environmental: number; // 0-1 allocation
    social: number;
    medical: number;
  };
}


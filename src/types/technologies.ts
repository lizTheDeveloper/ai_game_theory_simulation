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
  
  // Government research priorities
  researchPriorities: {
    environmental: number; // 0-1 allocation
    social: number;
    medical: number;
  };
}


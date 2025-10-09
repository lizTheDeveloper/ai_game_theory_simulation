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
  climateStabilization?: number; // +X per month
  pollutionReduction?: number; // -X per month
  resourceEfficiency?: number; // Multiplier on depletion rate
  
  // Social
  meaningCrisisReduction?: number; // -X per month
  culturalAdaptation?: number; // +X per month
  communityStrengthBoost?: number; // +X per month
  
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
  
  // Medical Technologies
  diseaseElimination: TechnologyNode;
  longevityTherapies: TechnologyNode;
  
  // Infrastructure
  fusionPower: TechnologyNode;
  
  // Government research priorities
  researchPriorities: {
    environmental: number; // 0-1 allocation
    social: number;
    medical: number;
  };
}


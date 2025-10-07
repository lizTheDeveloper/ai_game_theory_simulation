/**
 * Multi-dimensional AI capability system (Phase 2.5)
 * 
 * Replaces single 'capability' number with strategic dimensions.
 * Each dimension grows at different rates and enables different extinction types.
 */

import { AICapabilityProfile, AIResearchCapabilities, ResearchInvestments, AIAgent } from '@/types/game';

/**
 * Initialize a fresh capability profile for a new AI agent
 * Starts with small random values to create diversity
 */
/**
 * Create an empty (zero-initialized) capability profile
 * Used for initializing capability floor in ecosystem
 */
export function createEmptyCapabilityProfile(): AICapabilityProfile {
  return {
    physical: 0,
    digital: 0,
    cognitive: 0,
    social: 0,
    economic: 0,
    selfImprovement: 0,
    research: {
      biotech: {
        drugDiscovery: 0,
        geneEditing: 0,
        syntheticBiology: 0,
        neuroscience: 0
      },
      materials: {
        nanotechnology: 0,
        quantumComputing: 0,
        energySystems: 0
      },
      climate: {
        modeling: 0,
        intervention: 0,
        mitigation: 0
      },
      computerScience: {
        algorithms: 0,
        security: 0,
        architectures: 0
      }
    }
  };
}

export function initializeCapabilityProfile(seed: number = Math.random()): AICapabilityProfile {
  // Create variation using seed
  const variation = (offset: number) => 0.3 + (Math.sin(seed * 100 + offset) * 0.2);
  
  return {
    physical: 0.1 * variation(1),
    digital: 0.2 * variation(2),
    cognitive: 0.5 * variation(3),  // Start with some cognitive capability
    social: 0.3 * variation(4),
    economic: 0.1 * variation(5),
    selfImprovement: 0.2 * variation(6),
    research: {
      biotech: {
        drugDiscovery: 0.1 * variation(7),
        geneEditing: 0.05 * variation(8),
        syntheticBiology: 0.02 * variation(9),
        neuroscience: 0.1 * variation(10)
      },
      materials: {
        nanotechnology: 0.02 * variation(11),
        quantumComputing: 0.1 * variation(12),
        energySystems: 0.05 * variation(13)
      },
      climate: {
        modeling: 0.1 * variation(14),
        intervention: 0.02 * variation(15),
        mitigation: 0.05 * variation(16)
      },
      computerScience: {
        algorithms: 0.3 * variation(17),  // Start with some algorithms
        security: 0.1 * variation(18),
        architectures: 0.15 * variation(19)
      }
    }
  };
}

/**
 * Initialize empty research investments for government
 */
export function initializeResearchInvestments(economicStage: number = 0): ResearchInvestments {
  // Budget scales with economic stage
  const budgetLimit = 10 + economicStage * 5; // Stage 0: 10, Stage 4: 30
  
  return {
    biotech: { drugDiscovery: 0, geneEditing: 0, syntheticBiology: 0, neuroscience: 0 },
    materials: { nanotechnology: 0, quantumComputing: 0, energySystems: 0 },
    climate: { modeling: 0, intervention: 0, mitigation: 0 },
    computerScience: { algorithms: 0, security: 0, architectures: 0 },
    physical: 0,
    digital: 0,
    cognitive: 0,
    social: 0,
    economic: 0,
    selfImprovement: 0,
    totalBudget: 0,
    budgetLimit
  };
}

/**
 * Calculate total research capability from research sub-tree
 * Weighted by risk level (high-risk research counts more toward total)
 */
export function calculateResearchTotal(research: AIResearchCapabilities): number {
  const biotechAvg = (
    research.biotech.drugDiscovery +
    research.biotech.geneEditing +
    research.biotech.syntheticBiology +
    research.biotech.neuroscience
  ) / 4;
  
  const materialsAvg = (
    research.materials.nanotechnology +
    research.materials.quantumComputing +
    research.materials.energySystems
  ) / 3;
  
  const climateAvg = (
    research.climate.modeling +
    research.climate.intervention +
    research.climate.mitigation
  ) / 3;
  
  const computerScienceAvg = (
    research.computerScience.algorithms +
    research.computerScience.security +
    research.computerScience.architectures
  ) / 3;
  
  // Weighted by risk/importance
  return (
    biotechAvg * 0.3 +           // High risk, high impact
    materialsAvg * 0.2 +         // High risk (nanotech, quantum)
    climateAvg * 0.1 +           // Moderate risk
    computerScienceAvg * 0.4     // Core advancement
  );
}

/**
 * Calculate total capability from profile (backward compatibility)
 * Weighted sum based on risk profile
 */
export function calculateTotalCapabilityFromProfile(profile: AICapabilityProfile): number {
  const researchTotal = calculateResearchTotal(profile.research);
  
  return (
    profile.physical * 0.15 +           // Physical danger
    profile.digital * 0.10 +            // Infrastructure risk
    profile.cognitive * 0.20 +          // Strategic threat (high weight!)
    profile.social * 0.05 +             // Influence risk
    researchTotal * 0.15 +              // Research breakthroughs
    profile.economic * 0.10 +           // Resource control
    profile.selfImprovement * 0.25      // Recursive risk (highest weight!)
  );
}

/**
 * Update derived escape capabilities from profile
 * Maintains backward compatibility with old capability system
 */
export function updateDerivedCapabilities(ai: AIAgent): {
  selfReplicationLevel: number;
  selfImprovementLevel: number;
  resourceControl: number;
  manipulationCapability: number;
  hackingCapability: number;
} {
  return {
    selfReplicationLevel: ai.capabilityProfile.selfImprovement * 0.3 + ai.capabilityProfile.digital * 0.2,
    selfImprovementLevel: ai.capabilityProfile.selfImprovement,
    resourceControl: ai.capabilityProfile.economic * 0.4 + ai.capabilityProfile.physical * 0.3,
    manipulationCapability: ai.capabilityProfile.social,
    hackingCapability: ai.capabilityProfile.digital
  };
}

/**
 * Calculate industry-specific impact from capability profile
 * Different industries depend on different capability mixes
 */
export function getIndustryImpact(profile: AICapabilityProfile, industry: string): number {
  switch(industry.toLowerCase()) {
    case 'healthcare':
      return (
        profile.research.biotech.drugDiscovery * 0.25 +
        profile.research.biotech.neuroscience * 0.25 +
        profile.digital * 0.20 +
        profile.cognitive * 0.20 +
        profile.research.biotech.geneEditing * 0.10
      );
    
    case 'manufacturing':
      return (
        profile.physical * 0.50 +
        profile.economic * 0.25 +
        profile.digital * 0.15 +
        profile.cognitive * 0.10
      );
    
    case 'finance':
      return (
        profile.economic * 0.40 +
        profile.cognitive * 0.30 +
        profile.digital * 0.20 +
        profile.research.computerScience.algorithms * 0.10
      );
    
    case 'agriculture':
      return (
        profile.research.biotech.geneEditing * 0.30 +
        profile.physical * 0.25 +
        profile.research.climate.modeling * 0.20 +
        profile.economic * 0.15 +
        profile.research.climate.mitigation * 0.10
      );
    
    case 'energy':
      return (
        profile.research.materials.energySystems * 0.35 +
        profile.physical * 0.25 +
        profile.economic * 0.20 +
        profile.research.climate.mitigation * 0.20
      );
    
    case 'technology':
      return (
        profile.research.computerScience.algorithms * 0.30 +
        profile.cognitive * 0.25 +
        profile.digital * 0.20 +
        profile.research.computerScience.architectures * 0.15 +
        profile.selfImprovement * 0.10
      );
    
    default:
      // Generic impact for unknown industries
      return calculateTotalCapabilityFromProfile(profile) / 10; // Normalize to [0,1]
  }
}


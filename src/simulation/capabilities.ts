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

  // AI Capability Baseline Recalibration (Oct 17, 2025)
  // Research skeptic 2025 reality check: Raise baselines to match frontier models (Claude 4, GPT-4, o1)
  // Old baseline: cognitive 0.5 → ~0.15-0.25 (underestimated 2025 capabilities)
  // New baseline: cognitive 3.0 → ~1.5 (matches empirical 2025 frontier models)
  // Meta-evidence: Claude built this simulation → demonstrates planning/research/coordination NOW
  return {
    physical: 0.3 * variation(1),           // Raised 3x: 2025 robotics better than modeled
    digital: 0.6 * variation(2),            // Raised 3x: Software capabilities near-superhuman 2025
    cognitive: 3.0 * variation(3),          // Raised 6x: CRITICAL - matches 2025 frontier models (Claude, GPT-4)
    social: 0.9 * variation(4),             // Raised 3x: Social reasoning improved significantly 2020-2025
    economic: 0.3 * variation(5),           // Raised 3x: Economic integration accelerating
    selfImprovement: 0.6 * variation(6),    // Raised 3x: Recursive improvement visible (AI coding AI)
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
  // Defensive NaN handling for all research subdomain values
  const safeValue = (val: number) => (isNaN(val) || val === undefined) ? 0 : val;

  const biotechAvg = (
    safeValue(research.biotech.drugDiscovery) +
    safeValue(research.biotech.geneEditing) +
    safeValue(research.biotech.syntheticBiology) +
    safeValue(research.biotech.neuroscience)
  ) / 4;

  const materialsAvg = (
    safeValue(research.materials.nanotechnology) +
    safeValue(research.materials.quantumComputing) +
    safeValue(research.materials.energySystems)
  ) / 3;

  const climateAvg = (
    safeValue(research.climate.modeling) +
    safeValue(research.climate.intervention) +
    safeValue(research.climate.mitigation)
  ) / 3;

  const computerScienceAvg = (
    safeValue(research.computerScience.algorithms) +
    safeValue(research.computerScience.security) +
    safeValue(research.computerScience.architectures)
  ) / 3;

  // Weighted by risk/importance
  const total = (
    biotechAvg * 0.3 +           // High risk, high impact
    materialsAvg * 0.2 +         // High risk (nanotech, quantum)
    climateAvg * 0.1 +           // Moderate risk
    computerScienceAvg * 0.4     // Core advancement
  );

  return isNaN(total) ? 0 : total;
}

/**
 * Calculate total capability from profile (backward compatibility)
 * Weighted sum based on risk profile
 */
export function calculateTotalCapabilityFromProfile(profile: AICapabilityProfile): number {
  // Defensive NaN handling for all profile dimension values
  const safeValue = (val: number) => (isNaN(val) || val === undefined) ? 0 : val;

  const researchTotal = calculateResearchTotal(profile.research);

  const total = (
    safeValue(profile.physical) * 0.15 +           // Physical danger
    safeValue(profile.digital) * 0.10 +            // Infrastructure risk
    safeValue(profile.cognitive) * 0.20 +          // Strategic threat (high weight!)
    safeValue(profile.social) * 0.05 +             // Influence risk
    safeValue(researchTotal) * 0.15 +              // Research breakthroughs
    safeValue(profile.economic) * 0.10 +           // Resource control
    safeValue(profile.selfImprovement) * 0.25      // Recursive risk (highest weight!)
  );

  return isNaN(total) ? 0 : total;
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

/**
 * Scale a capability profile by a multiplier (for crisis responses, racing, etc.)
 * Maintains proper sync between profile and derived capability value
 * 
 * @param profile - The capability profile to scale
 * @param multiplier - The scaling factor (e.g., 1.1 for 10% boost)
 * @returns Scaled capability profile
 */
export function scaleCapabilityProfile(
  profile: AICapabilityProfile, 
  multiplier: number
): AICapabilityProfile {
  return {
    physical: profile.physical * multiplier,
    digital: profile.digital * multiplier,
    cognitive: profile.cognitive * multiplier,
    social: profile.social * multiplier,
    economic: profile.economic * multiplier,
    selfImprovement: profile.selfImprovement * multiplier,
    research: {
      biotech: {
        drugDiscovery: profile.research.biotech.drugDiscovery * multiplier,
        geneEditing: profile.research.biotech.geneEditing * multiplier,
        syntheticBiology: profile.research.biotech.syntheticBiology * multiplier,
        neuroscience: profile.research.biotech.neuroscience * multiplier
      },
      materials: {
        nanotechnology: profile.research.materials.nanotechnology * multiplier,
        quantumComputing: profile.research.materials.quantumComputing * multiplier,
        energySystems: profile.research.materials.energySystems * multiplier
      },
      climate: {
        modeling: profile.research.climate.modeling * multiplier,
        intervention: profile.research.climate.intervention * multiplier,
        mitigation: profile.research.climate.mitigation * multiplier
      },
      computerScience: {
        algorithms: profile.research.computerScience.algorithms * multiplier,
        security: profile.research.computerScience.security * multiplier,
        architectures: profile.research.computerScience.architectures * multiplier
      }
    }
  };
}

/**
 * Calculate OBSERVABLE AI capability (what government can see)
 * Uses revealedCapability instead of trueCapability
 * 
 * Government decisions should be based on this, not true capability.
 * This is critical for the adversarial evaluation system to work correctly.
 * 
 * @param aiAgents - Array of AI agents
 * @returns Total observable AI capability (sum of revealed capabilities)
 */
export function calculateObservableAICapability(
  aiAgents: Array<{ revealedCapability: AICapabilityProfile; lifecycleState: string }>
): number {
  return aiAgents
    .filter(ai => ai.lifecycleState !== 'retired')
    .reduce((sum, ai) => 
      sum + calculateTotalCapabilityFromProfile(ai.revealedCapability), 0
    );
}


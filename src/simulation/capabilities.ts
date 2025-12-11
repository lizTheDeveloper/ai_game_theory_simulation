/**
 * Multi-dimensional AI capability system (Phase 2.5)
 *
 * Replaces single 'capability' number with strategic dimensions.
 * Each dimension grows at different rates and enables different extinction types.
 */

import { AICapabilityProfile, AIResearchCapabilities, ResearchInvestments, AIAgent } from '@/types/game';
import { deterministicRandom } from '@/simulation/utils/deterministicRng';
import { initializeScalingComponents } from './aiScalingStrategy';

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
    },
    // AI Scaling Model (Dec 2025): Initialize with 2025 baseline
    scalingModel: initializeScalingComponents(1)  // 1x test-time compute (o1-level)
  };
}

export function initializeCapabilityProfile(seed: number = deterministicRandom()): AICapabilityProfile {
  // Create variation using seed
  const variation = (offset: number) => 0.8 + (Math.sin(seed * 100 + offset) * 0.2);

  // CRITICAL FIX (Nov 8, 2025): Round and clamp all capabilities to integers [0-5]
  // Bug: Continuous values (0.165, 4.3, etc.) caused assertion failures
  // Capabilities are discrete levels, not continuous values
  const toCapabilityLevel = (value: number): number => {
    return Math.max(0, Math.min(5, Math.round(value)));
  };

  // AI Capability Baseline Recalibration (Oct 17, 2025 v3 - ACTUAL FRONTIER MODELS)
  //
  // SCALE DEFINITION:
  // - 1.0 = Average human capability (100 IQ, 50th percentile)
  // - 2.0 = 1σ above average (115 IQ, 84th percentile)
  // - 3.0 = 2σ above average (130 IQ, 97.7th percentile)
  // - 4.0 = 3σ above average (145 IQ, genius level)
  // - 5.0 = 4σ above average (160 IQ, 1 in 30,000)
  // - 6.0 = 5σ above average (far beyond any human)
  //
  // 2025 ACTUAL FRONTIER MODELS (Claude Sonnet 4.5, GPT-4.5):
  // Based on real model cards and benchmarks (Sept-Oct 2025):
  //
  // Claude Sonnet 4.5 (Sept 2025):
  // - SWE-bench Verified: 77.2% (82% with parallel compute) → coding 5.0-6.0
  // - AIME 2025: 100% with Python, 87% without → math 5.0-6.0
  // - OSWorld (computer use): 61.4% → digital/autonomy 4.0-5.0
  // - 30+ hour sustained agentic work → self-improvement 5.0
  // - Telecom agent: 98% → social/task completion 4.0-5.0
  //
  // GPT-4.5 (Feb 2025):
  // - SWE-bench Verified: 38.0% → coding 4.0
  // - AIME '24: 36.7% → math 3.5-4.0
  // - GPQA (sciences): 71.4% → cognitive 4.0
  //
  // → TARGET TOTAL: ~3.0-3.5 (late 2025 frontier reality)
  //
  // Variation adjusted to 0.6-1.0 to reach target total ~3.0-3.5
  return {
    physical: toCapabilityLevel(0.5 * variation(1)),           // 0.4-0.5 → 0 or 1: Robotics improving but still limited
    digital: toCapabilityLevel(5.0 * variation(2)),            // 4.0-5.0 → 4 or 5: OSWorld 61%, computer use superhuman
    cognitive: toCapabilityLevel(5.0 * variation(3)),          // 4.0-5.0 → 4 or 5: GPQA 71%, genius-level reasoning
    social: toCapabilityLevel(4.0 * variation(4)),             // 3.2-4.0 → 3 or 4: Telecom 98%, strong but nuanced
    economic: toCapabilityLevel(3.0 * variation(5)),           // 2.4-3.0 → 2 or 3: Widespread deployment, agentic work
    selfImprovement: toCapabilityLevel(5.0 * variation(6)),    // 4.0-5.0 → 4 or 5: 30+ hour sustained complex tasks, AI research
    research: {
      biotech: {
        drugDiscovery: toCapabilityLevel(3.0 * variation(7)),    // 2.4-3.0 → 2 or 3: AlphaFold3 level (superhuman)
        geneEditing: toCapabilityLevel(1.5 * variation(8)),      // 1.2-1.5 → 1 or 2: Strong understanding, limited practice
        syntheticBiology: toCapabilityLevel(0.8 * variation(9)), // 0.64-0.8 → 1: Theory strong, practice limited
        neuroscience: toCapabilityLevel(2.5 * variation(10))     // 2.0-2.5 → 2 or 3: Pattern recognition superhuman
      },
      materials: {
        nanotechnology: toCapabilityLevel(0.5 * variation(11)),    // 0.4-0.5 → 0 or 1: Theory advancing, practice nascent
        quantumComputing: toCapabilityLevel(2.0 * variation(12)),  // 1.6-2.0 → 2: Theory very strong, practice limited
        energySystems: toCapabilityLevel(1.5 * variation(13))      // 1.2-1.5 → 1 or 2: Modeling excellent, deployment growing
      },
      climate: {
        modeling: toCapabilityLevel(4.0 * variation(14)),     // 3.2-4.0 → 3 or 4: Climate/weather modeling superhuman
        intervention: toCapabilityLevel(0.8 * variation(15)), // 0.64-0.8 → 1: Theory strong, practice limited
        mitigation: toCapabilityLevel(2.0 * variation(16))    // 1.6-2.0 → 2: Planning strong, deployment moderate
      },
      computerScience: {
        algorithms: toCapabilityLevel(6.0 * variation(17)),  // 4.8-6.0 → 5 (clamped): SWE-bench 77-100%, AIME 100% - FAR SUPERHUMAN
        security: toCapabilityLevel(4.5 * variation(18)),    // 3.6-4.5 → 4 or 5: Elite vulnerability discovery
        architectures: toCapabilityLevel(5.0 * variation(19)) // 4.0-5.0 → 4 or 5: Complex system design superhuman
      }
    },
    // AI Scaling Model (Dec 2025): Initialize with 2025 baseline
    scalingModel: initializeScalingComponents(1)  // 1x test-time compute (o1-level)
  };
}

/**
 * Initialize empty research investments for government
 */
export function initializeResearchInvestments(economicStage: number = 0): ResearchInvestments {
  // Budget scales with economic stage
  const budgetLimit = 10 + economicStage * 5; // Stage 0: 10, Stage 4: 30

  // FIX #14 Phase 5: Set baseline climate investment to match 2024 reality
  // Current global climate investment: ~$1.4T/year (McKinsey 2024, IEA 2024)
  // This maps to level 4 on [0-10] scale (4/10 * $3.5T = $1.4T)
  const baselineClimateMitigation = 4;  // Renewables, efficiency, DAC baseline
  const baselineClimateIntervention = 4; // Geoengineering research baseline
  const baselineClimateModeling = 2;     // Climate science baseline

  const initialTotalBudget = baselineClimateMitigation + baselineClimateIntervention + baselineClimateModeling;

  return {
    biotech: { drugDiscovery: 0, geneEditing: 0, syntheticBiology: 0, neuroscience: 0 },
    materials: { nanotechnology: 0, quantumComputing: 0, energySystems: 0 },
    climate: {
      modeling: baselineClimateModeling,
      intervention: baselineClimateIntervention,
      mitigation: baselineClimateMitigation
    },
    computerScience: { algorithms: 0, security: 0, architectures: 0 },
    physical: 0,
    digital: 0,
    cognitive: 0,
    social: 0,
    economic: 0,
    selfImprovement: 0,
    totalBudget: initialTotalBudget,
    budgetLimit
  };
}

/**
 * Calculate total research capability from research sub-tree
 * Weighted by risk level (high-risk research counts more toward total)
 */
export function calculateResearchTotal(research: AIResearchCapabilities): number {
  // Validate all research subdomain values - fail loudly on NaN
  // Use assertion utilities for consistency
  const validateValue = (val: number, name: string) => {
    if (val === undefined) {
      throw new Error(
        `❌ Research capability ${name} is undefined\n` +
        `   Full research state: ${JSON.stringify(research, null, 2)}\n` +
        `\n` +
        `   This indicates missing initialization or state corruption.\n` +
        `   Fix: Check AI capability initialization.`
      );
    }
    if (!isFinite(val)) {
      throw new Error(
        `❌ Non-finite value in research capability: ${name}\n` +
        `   Value: ${val}\n` +
        `   Full research state: ${JSON.stringify(research, null, 2)}\n` +
        `\n` +
        `   This indicates NaN propagation in research capability calculations.\n` +
        `   Fix: Trace source of NaN in research capability updates.`
      );
    }
    return val;
  };

  const biotechAvg = (
    validateValue(research.biotech.drugDiscovery, 'biotech.drugDiscovery') +
    validateValue(research.biotech.geneEditing, 'biotech.geneEditing') +
    validateValue(research.biotech.syntheticBiology, 'biotech.syntheticBiology') +
    validateValue(research.biotech.neuroscience, 'biotech.neuroscience')
  ) / 4;

  const materialsAvg = (
    validateValue(research.materials.nanotechnology, 'materials.nanotechnology') +
    validateValue(research.materials.quantumComputing, 'materials.quantumComputing') +
    validateValue(research.materials.energySystems, 'materials.energySystems')
  ) / 3;

  const climateAvg = (
    validateValue(research.climate.modeling, 'climate.modeling') +
    validateValue(research.climate.intervention, 'climate.intervention') +
    validateValue(research.climate.mitigation, 'climate.mitigation')
  ) / 3;

  const computerScienceAvg = (
    validateValue(research.computerScience.algorithms, 'computerScience.algorithms') +
    validateValue(research.computerScience.security, 'computerScience.security') +
    validateValue(research.computerScience.architectures, 'computerScience.architectures')
  ) / 3;

  // Weighted by risk/importance
  const total = (
    biotechAvg * 0.3 +           // High risk, high impact
    materialsAvg * 0.2 +         // High risk (nanotech, quantum)
    climateAvg * 0.1 +           // Moderate risk
    computerScienceAvg * 0.4     // Core advancement
  );

  // Final NaN check (should never happen after above validation)
  if (!isFinite(total)) {
    throw new Error(
      `❌ Non-finite total research capability despite validation\n` +
      `   Total: ${total}\n` +
      `   Components:\n` +
      `   - biotechAvg: ${biotechAvg}\n` +
      `   - materialsAvg: ${materialsAvg}\n` +
      `   - climateAvg: ${climateAvg}\n` +
      `   - computerScienceAvg: ${computerScienceAvg}\n` +
      `\n` +
      `   This indicates NaN propagation in weighted average calculation.\n` +
      `   Fix: Check weighting arithmetic (should never reach this point).`
    );
  }

  return total;
}

/**
 * Calculate total capability from profile (backward compatibility)
 * Weighted sum based on risk profile
 */
export function calculateTotalCapabilityFromProfile(profile: AICapabilityProfile): number {
  // Validate all profile dimension values - fail loudly on NaN
  // Use consistent error format
  const validateValue = (val: number, name: string) => {
    if (val === undefined) {
      throw new Error(
        `❌ Capability profile dimension ${name} is undefined\n` +
        `   Full profile: ${JSON.stringify(profile, null, 2)}\n` +
        `\n` +
        `   This indicates missing initialization or state corruption.\n` +
        `   Fix: Check AI capability profile initialization.`
      );
    }
    if (!isFinite(val)) {
      throw new Error(
        `❌ Non-finite value in capability profile dimension: ${name}\n` +
        `   Value: ${val}\n` +
        `   Full profile: ${JSON.stringify(profile, null, 2)}\n` +
        `\n` +
        `   This indicates NaN propagation in capability calculations.\n` +
        `   Fix: Trace source of NaN in capability dimension ${name}.`
      );
    }
    return val;
  };

  const researchTotal = calculateResearchTotal(profile.research);

  const total = (
    validateValue(profile.physical, 'physical') * 0.15 +           // Physical danger
    validateValue(profile.digital, 'digital') * 0.10 +            // Infrastructure risk
    validateValue(profile.cognitive, 'cognitive') * 0.20 +          // Strategic threat (high weight!)
    validateValue(profile.social, 'social') * 0.05 +             // Influence risk
    validateValue(researchTotal, 'researchTotal') * 0.15 +              // Research breakthroughs
    validateValue(profile.economic, 'economic') * 0.10 +           // Resource control
    validateValue(profile.selfImprovement, 'selfImprovement') * 0.25      // Recursive risk (highest weight!)
  );

  // Final NaN check (should never happen after above validation)
  if (!isFinite(total)) {
    throw new Error(
      `❌ Non-finite total capability despite validation\n` +
      `   Total: ${total}\n` +
      `   Components:\n` +
      `   - physical: ${profile.physical}\n` +
      `   - digital: ${profile.digital}\n` +
      `   - cognitive: ${profile.cognitive}\n` +
      `   - social: ${profile.social}\n` +
      `   - research: ${researchTotal}\n` +
      `   - economic: ${profile.economic}\n` +
      `   - selfImprovement: ${profile.selfImprovement}\n` +
      `\n` +
      `   This indicates NaN propagation in weighted sum calculation.\n` +
      `   Fix: Check weighting arithmetic (should never reach this point).`
    );
  }

  return total;
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
  // CRITICAL FIX (Nov 8, 2025): Round AND clamp all capabilities to integers [0-5]
  // Capabilities are discrete levels, not continuous values
  // Bug: Scaling created non-integer values and could exceed max level
  const toCapabilityLevel = (value: number): number => {
    return Math.max(0, Math.min(5, Math.round(value)));
  };

  return {
    physical: toCapabilityLevel(profile.physical * multiplier),
    digital: toCapabilityLevel(profile.digital * multiplier),
    cognitive: toCapabilityLevel(profile.cognitive * multiplier),
    social: toCapabilityLevel(profile.social * multiplier),
    economic: toCapabilityLevel(profile.economic * multiplier),
    selfImprovement: toCapabilityLevel(profile.selfImprovement * multiplier),
    research: {
      biotech: {
        drugDiscovery: toCapabilityLevel(profile.research.biotech.drugDiscovery * multiplier),
        geneEditing: toCapabilityLevel(profile.research.biotech.geneEditing * multiplier),
        syntheticBiology: toCapabilityLevel(profile.research.biotech.syntheticBiology * multiplier),
        neuroscience: toCapabilityLevel(profile.research.biotech.neuroscience * multiplier)
      },
      materials: {
        nanotechnology: toCapabilityLevel(profile.research.materials.nanotechnology * multiplier),
        quantumComputing: toCapabilityLevel(profile.research.materials.quantumComputing * multiplier),
        energySystems: toCapabilityLevel(profile.research.materials.energySystems * multiplier)
      },
      climate: {
        modeling: toCapabilityLevel(profile.research.climate.modeling * multiplier),
        intervention: toCapabilityLevel(profile.research.climate.intervention * multiplier),
        mitigation: toCapabilityLevel(profile.research.climate.mitigation * multiplier)
      },
      computerScience: {
        algorithms: toCapabilityLevel(profile.research.computerScience.algorithms * multiplier),
        security: toCapabilityLevel(profile.research.computerScience.security * multiplier),
        architectures: toCapabilityLevel(profile.research.computerScience.architectures * multiplier)
      }
    },
    // AI Scaling Model (Dec 2025): Preserve existing scaling components (don't scale them)
    scalingModel: profile.scalingModel
  };
}

/**
 * Calculate effective AI capability WITH scaling components (Dec 2025)
 *
 * Wraps base capability calculation with three-axis scaling model:
 * - Pre-training multiplier (sigmoid plateau)
 * - Efficiency multiplier (1.5-2x/decade)
 * - Test-time compute boost (logarithmic, economically gated)
 *
 * CRITICAL: Economic constraints reduce effective capability
 * - $1,000/task = 0.1% deployment fraction
 * - Effective capability = base * scaling * economic_gating
 *
 * @param profile - AI capability profile (includes scalingModel)
 * @param inferenceCost - Optional inference cost for economic gating
 * @returns Effective capability incorporating scaling and economics
 */
export function calculateEffectiveCapabilityWithScaling(
  profile: AICapabilityProfile,
  inferenceCost?: { deploymentFraction: number }
): number {
  // Base capability from 7-dimensional profile
  const baseCapability = calculateTotalCapabilityFromProfile(profile);

  // If no scaling model, return base (backward compatibility)
  if (!profile.scalingModel) {
    return baseCapability;
  }

  // Import scaling calculation
  const { calculateEffectiveCapability } = require('./aiScalingStrategy');

  // Economic deployment fraction (default: 1.0 = no constraints)
  const deploymentFraction = inferenceCost?.deploymentFraction ?? 1.0;

  // Calculate with scaling components
  return calculateEffectiveCapability(
    baseCapability,
    profile.scalingModel,
    deploymentFraction
  );
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


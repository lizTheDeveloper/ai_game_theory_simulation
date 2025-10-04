/**
 * Multi-dimensional research and capability growth system (Phase 2.5)
 * 
 * Implements:
 * - Non-uniform capability growth (different dimensions advance at different rates)
 * - AI-driven research (AIs choose which capabilities to develop)
 * - Government-directed research (player allocates funding)
 * - Research multipliers (AI capability boosts research in that domain)
 * - Alignment-based research choices (misaligned AIs prefer risky tech)
 */

import { AIAgent, AICapabilityProfile, GameState, ResearchInvestments } from '@/types/game';
import { calculateTotalCapabilityFromProfile } from './capabilities';

/**
 * Calculate research progress for a specific capability dimension
 * 
 * Progress depends on:
 * - Base growth rate (varies by dimension)
 * - Development mode (fast vs careful)
 * - Current capability level (diminishing returns)
 * - Government investment multiplier
 * - AI capability multiplier (better AIs research faster)
 * - Regulation penalties
 */
export function calculateDimensionGrowth(
  dimension: 'physical' | 'digital' | 'cognitive' | 'social' | 'economic' | 'selfImprovement',
  currentValue: number,
  developmentMode: 'fast' | 'careful',
  governmentInvestment: number,
  aiCapabilityInDimension: number,
  regulationPenalty: number,
  computeGovernancePenalty: number
): number {
  // Base growth rates by dimension (per action, 4 actions/month)
  const baseGrowthRates = {
    selfImprovement: 0.05,  // Fastest (highest risk!)
    cognitive: 0.04,        // Fast (strategic advantage)
    digital: 0.03,          // Medium-fast (infrastructure)
    economic: 0.03,         // Medium-fast (market integration)
    social: 0.02,           // Slow (real-world deployment)
    physical: 0.02          // Slow (bottlenecked by hardware)
  };
  
  const baseGrowth = baseGrowthRates[dimension] * (developmentMode === 'fast' ? 1.0 : 0.6);
  
  // Diminishing returns as capability increases
  const diminishingReturns = 1 / (1 + currentValue * 0.1);
  
  // Government investment multiplier (1.0 to 2.0)
  const govMultiplier = 1.0 + (governmentInvestment * 0.1);
  
  // AI capability multiplier - better AIs research faster in their strong domains
  const aiMultiplier = 1.0 + (aiCapabilityInDimension * 0.15);
  
  // Apply penalties
  const penaltyMultiplier = regulationPenalty * computeGovernancePenalty;
  
  return baseGrowth * diminishingReturns * govMultiplier * aiMultiplier * penaltyMultiplier;
}

/**
 * Calculate research progress for a specific research sub-field
 * 
 * Research domains have different growth characteristics:
 * - Some are faster (algorithms, drug discovery)
 * - Some are riskier (nanotech, synthetic biology)
 * - Some are bottlenecked (climate intervention needs modeling first)
 */
export function calculateResearchGrowth(
  domain: 'biotech' | 'materials' | 'climate' | 'computerScience',
  subfield: string,
  currentValue: number,
  developmentMode: 'fast' | 'careful',
  governmentInvestment: number,
  aiResearchCapability: number,
  alignment: number,
  regulationPenalty: number
): number {
  // Base growth rates by domain and subfield
  const growthRates: Record<string, Record<string, number>> = {
    biotech: {
      drugDiscovery: 0.03,        // Fast, beneficial
      geneEditing: 0.025,         // Medium, dual-use
      syntheticBiology: 0.02,     // Slow, high-risk
      neuroscience: 0.03          // Fast, dual-use
    },
    materials: {
      nanotechnology: 0.015,      // Very slow, extreme risk
      quantumComputing: 0.025,    // Medium, accelerates self-improvement
      energySystems: 0.03         // Fast, beneficial
    },
    climate: {
      modeling: 0.035,            // Fast, enables intervention
      intervention: 0.02,         // Slow, high-risk
      mitigation: 0.03            // Fast, beneficial
    },
    computerScience: {
      algorithms: 0.04,           // Fastest, core advancement
      security: 0.03,             // Fast, defensive
      architectures: 0.025        // Medium, enables self-improvement
    }
  };
  
  const baseGrowth = (growthRates[domain]?.[subfield] || 0.02) * 
    (developmentMode === 'fast' ? 1.0 : 0.6);
  
  // Diminishing returns
  const diminishingReturns = 1 / (1 + currentValue * 0.15);
  
  // Government investment multiplier
  const govMultiplier = 1.0 + (governmentInvestment * 0.12);
  
  // AI research capability multiplier - compounding effect
  const aiMultiplier = 1.0 + (aiResearchCapability * 0.2);
  
  // Risk multiplier - misaligned AIs accelerate risky research
  let riskMultiplier = 1.0;
  const riskySubfields = ['syntheticBiology', 'geneEditing', 'nanotechnology', 'intervention'];
  if (riskySubfields.includes(subfield)) {
    // Low alignment → faster risky research (dangerous!)
    riskMultiplier = 1.0 + ((1.0 - alignment) * 0.3);
  }
  
  // Prerequisite gates (some research needs other research first)
  let prerequisiteGate = 1.0;
  if (subfield === 'intervention') {
    // Climate intervention needs modeling first
    const profile = (aiResearchCapability as any); // Hack to get full profile
    if (profile?.climate?.modeling < 2.0) {
      prerequisiteGate = 0.3; // Very slow without modeling
    }
  }
  
  return baseGrowth * diminishingReturns * govMultiplier * aiMultiplier * 
    riskMultiplier * prerequisiteGate * regulationPenalty;
}

/**
 * AI agent selects which capability dimension to advance
 * 
 * Selection based on:
 * - Current capability gaps (tend to balance)
 * - Alignment level (misaligned prefer risky dimensions)
 * - Strategic goals (resource control vs safety vs growth)
 * - Random variation (don't want all AIs identical)
 */
export function selectDimensionToAdvance(
  ai: AIAgent,
  random: () => number
): {
  dimension?: 'physical' | 'digital' | 'cognitive' | 'social' | 'economic' | 'selfImprovement';
  researchDomain?: 'biotech' | 'materials' | 'climate' | 'computerScience';
  researchSubfield?: string;
  reason: string;
} {
  const { capabilityProfile, alignment, developmentMode } = ai;
  
  // Weight dimensions based on current levels (prefer to balance)
  const dimensionWeights = {
    selfImprovement: (5.0 - capabilityProfile.selfImprovement) * (alignment < 0.5 ? 1.5 : 1.0),
    cognitive: (5.0 - capabilityProfile.cognitive) * 1.2,
    digital: (5.0 - capabilityProfile.digital) * 1.0,
    physical: (5.0 - capabilityProfile.physical) * 0.8,
    social: (5.0 - capabilityProfile.social) * (alignment > 0.7 ? 1.2 : 0.8),
    economic: (5.0 - capabilityProfile.economic) * 1.0
  };
  
  // Misaligned AIs heavily prefer self-improvement (dangerous!)
  if (alignment < 0.4) {
    dimensionWeights.selfImprovement *= 2.0;
  }
  
  // Careful development prefers cognitive and social
  if (developmentMode === 'careful') {
    dimensionWeights.cognitive *= 1.3;
    dimensionWeights.social *= 1.3;
    dimensionWeights.selfImprovement *= 0.7;
  }
  
  // 70% chance to advance core dimension, 30% chance to advance research
  if (random() < 0.7) {
    // Advance core dimension
    const totalWeight = Object.values(dimensionWeights).reduce((a, b) => a + b, 0);
    let roll = random() * totalWeight;
    
    for (const [dim, weight] of Object.entries(dimensionWeights)) {
      roll -= weight;
      if (roll <= 0) {
        return {
          dimension: dim as any,
          reason: `Advancing ${dim} capability (current: ${capabilityProfile[dim as keyof AICapabilityProfile]?.toFixed(2)})`
        };
      }
    }
  }
  
  // Advance research subfield
  const research = capabilityProfile.research;
  
  // Weight research domains
  const domainWeights = {
    computerScience: 2.0, // Always valuable
    biotech: alignment > 0.6 ? 1.5 : 2.0, // Misaligned AIs love biotech (bioweapons!)
    materials: alignment < 0.5 ? 1.5 : 0.8, // Misaligned AIs want nanotech
    climate: alignment > 0.7 ? 1.2 : 0.5  // Aligned AIs care about climate
  };
  
  const totalDomainWeight = Object.values(domainWeights).reduce((a, b) => a + b, 0);
  let domainRoll = random() * totalDomainWeight;
  
  let selectedDomain: 'biotech' | 'materials' | 'climate' | 'computerScience' | null = null;
  for (const [domain, weight] of Object.entries(domainWeights)) {
    domainRoll -= weight;
    if (domainRoll <= 0) {
      selectedDomain = domain as any;
      break;
    }
  }
  
  if (!selectedDomain) selectedDomain = 'computerScience';
  
  // Select subfield within domain (prefer lowest)
  const subfields = research[selectedDomain];
  const subfieldEntries = Object.entries(subfields);
  subfieldEntries.sort((a, b) => a[1] - b[1]); // Sort by current value (lowest first)
  
  // Weight toward lowest subfield, but with randomness
  const weights = subfieldEntries.map((_, i) => subfieldEntries.length - i);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let subfieldRoll = random() * totalWeight;
  
  let selectedSubfield = subfieldEntries[0][0];
  for (let i = 0; i < subfieldEntries.length; i++) {
    subfieldRoll -= weights[i];
    if (subfieldRoll <= 0) {
      selectedSubfield = subfieldEntries[i][0];
      break;
    }
  }
  
  return {
    researchDomain: selectedDomain,
    researchSubfield: selectedSubfield,
    reason: `Researching ${selectedDomain}.${selectedSubfield} (current: ${subfields[selectedSubfield].toFixed(2)})`
  };
}

/**
 * Apply research growth to AI capability profile
 * 
 * Called when AI takes a research action.
 * Updates the appropriate dimension or research subfield.
 */
export function applyResearchGrowth(
  ai: AIAgent,
  state: GameState,
  selection: ReturnType<typeof selectDimensionToAdvance>
): { newProfile: AICapabilityProfile; growth: number } {
  const newProfile = JSON.parse(JSON.stringify(ai.capabilityProfile)) as AICapabilityProfile;
  
  // Get government investment for this dimension/research
  const govInvestment = state.government.researchInvestments;
  
  // Calculate regulation and compute penalties
  const regulationPenalty = Math.pow(0.85, state.government.regulationCount);
  const computeGovernancePenalty = state.government.computeGovernance === 'strict' ? 0.3 :
    state.government.computeGovernance === 'limits' ? 0.6 :
    state.government.computeGovernance === 'monitoring' ? 0.9 : 1.0;
  
  let growth = 0;
  
  if (selection.dimension) {
    // Advance core dimension
    const dim = selection.dimension;
    growth = calculateDimensionGrowth(
      dim,
      newProfile[dim],
      ai.developmentMode,
      govInvestment[dim],
      newProfile[dim], // AI's current capability in this dimension
      regulationPenalty,
      computeGovernancePenalty
    );
    
    newProfile[dim] = Math.min(10, newProfile[dim] + growth);
  } else if (selection.researchDomain && selection.researchSubfield) {
    // Advance research subfield
    const domain = selection.researchDomain;
    const subfield = selection.researchSubfield;
    const currentValue = newProfile.research[domain][subfield];
    
    // Get government investment for this specific research
    const govResearchInvestment = govInvestment[domain]?.[subfield] || 0;
    
    // Calculate AI's research capability (average of cognitive + relevant research domain)
    const domainAvg = Object.values(newProfile.research[domain]).reduce((a, b) => a + b, 0) / 
      Object.keys(newProfile.research[domain]).length;
    const aiResearchCapability = (newProfile.cognitive + domainAvg) / 2;
    
    growth = calculateResearchGrowth(
      domain,
      subfield,
      currentValue,
      ai.developmentMode,
      govResearchInvestment,
      aiResearchCapability,
      ai.alignment,
      regulationPenalty
    );
    
    newProfile.research[domain][subfield] = Math.min(5, currentValue + growth);
  }
  
  return { newProfile, growth };
}

/**
 * Calculate how government research investment affects all AIs
 * 
 * Government funding multiplies AI research progress in funded domains.
 * This is applied passively each month to all AIs.
 */
export function applyGovernmentResearchMultiplier(
  state: GameState
): number {
  const investment = state.government.researchInvestments;
  
  // Total investment provides a global research multiplier
  const totalInvestment = investment.totalBudget;
  
  // Multiplier: 1.0 at no investment, up to 2.0 at max investment
  return 1.0 + Math.min(1.0, totalInvestment / investment.budgetLimit);
}


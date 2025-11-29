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
import { getEnergyConstraintMultiplier } from './powerGeneration';
import { levyFlight, ALPHA_PRESETS } from './utils/levyDistributions';
import { addSimulationEvent } from './utils/eventLogger';
import { deterministicRandom } from '@/simulation/utils/deterministicRng';
import { assertFinite, assertStateProperty } from './utils/assertions';

// PERF FIX (Nov 10, 2025): Cache sorted dimension/domain names (Phase 3 optimization)
// These are constants - no need to sort Object.entries() repeatedly
const SORTED_DIMENSION_NAMES = ['cognitive', 'digital', 'economic', 'physical', 'selfImprovement', 'social'] as const;
const SORTED_DOMAIN_NAMES = ['biotech', 'climate', 'computerScience', 'materials'] as const;

/**
 * Phase 4: Compute scaling law
 * 
 * Implements Chinchilla/Kaplan scaling laws: capability growth ∝ compute^α
 * where α ≈ 0.34 (empirical from GPT-3/4, PaLM, etc.)
 * 
 * 10x compute → 2.15x capability growth
 * 100x compute → 4.6x capability growth
 * 
 * Reference compute: 30 PF (baseline for 1.0x multiplier)
 */
export function calculateComputeScalingMultiplier(
  allocatedCompute: number,
  state?: GameState
): number {
  const REFERENCE_COMPUTE = 30; // PetaFLOPs baseline
  const SCALING_EXPONENT = 0.34; // Chinchilla scaling law exponent
  
  // ENHANCED: Include volunteer research "virtual compute"
  let totalEffectiveCompute = allocatedCompute;
  
  if (state) {
    const { calculateVolunteerResearchContribution } = require('./volunteerResearch');
    const volunteerCompute = calculateVolunteerResearchContribution(state);
    
    if (volunteerCompute > 10) {
      // Volunteers are less efficient than AI compute (10:1 ratio)
      // But they provide diverse perspectives, creativity, and intuition
      // Good for certain types of problems (classification, pattern recognition, creativity)
      totalEffectiveCompute += volunteerCompute * 0.1;
      
      // Log significant contributions (probabilistic to avoid spam)
      if (deterministicRandom() < 0.05 && volunteerCompute > 100) {
        const { logVolunteerContribution, applyVolunteerResearchBenefits } = require('./volunteerResearch');
        logVolunteerContribution(state, volunteerCompute, allocatedCompute);
        applyVolunteerResearchBenefits(state, volunteerCompute);
      }
    }
  }
  
  if (totalEffectiveCompute <= 0) {
    return 0.1; // Minimal compute → minimal progress
  }
  
  // Scaling law: (compute / reference)^α
  const multiplier = Math.pow(totalEffectiveCompute / REFERENCE_COMPUTE, SCALING_EXPONENT);
  
  // Cap at 10x to avoid runaway (even 1000 PF shouldn't give infinite speed)
  return Math.min(multiplier, 10.0);
}

/**
 * TIER 0C: Calculate infrastructure multiplier based on civilization health
 *
 * When population collapses, data centers close, and organizations fail,
 * AI capability growth must slow or reverse - physical constraints matter.
 *
 * Constraints:
 * - Population: Fewer ML engineers to maintain/train models
 * - Data centers: Less compute capacity available
 * - Organizations: Bankruptcy means no R&D investment
 *
 * @param state Current game state
 * @returns Multiplier [0.1, 1.0] where 1.0 = normal, 0.1 = severe constraint
 */
export function calculateInfrastructureMultiplier(state: GameState): number {
  // 1. Population constraint (ML expertise)
  const initialPopulation = 8000000000; // 8B baseline (8B)
  const currentPopulation = state.humanPopulationSystem?.population || initialPopulation;
  const populationRatio = currentPopulation / initialPopulation;

  // Population decline reduces ML expertise available
  // 50% population loss → 30-40% reduction in expertise (nonlinear, core expertise most robust)
  const expertiseMultiplier = 0.6 + (populationRatio * 0.4); // [0.6, 1.0]

  // 2. Data center constraint
  const dataCenters = state.computeInfrastructure?.dataCenters || [];
  const functionalDCs = dataCenters.filter(dc => dc.operational && dc.completionMonth <= (state.currentYear * 12 + state.currentMonth)).length;
  const initialDCs = 5; // Starting data centers

  // Data center capacity multiplier
  // Losing data centers directly reduces compute available for training
  const dcRatio = functionalDCs / Math.max(1, initialDCs);
  const dcMultiplier = Math.max(0.3, Math.min(1.0, dcRatio)); // [0.3, 1.0]

  // 3. Organization health constraint
  const orgs = state.organizations || [];
  const activeOrgs = orgs.filter(o => o.capital > -1000); // Not deeply bankrupt
  const totalOrgs = Math.max(1, orgs.length);
  const orgHealthRatio = activeOrgs.length / totalOrgs;

  // Organization bankruptcy reduces R&D capacity
  const orgMultiplier = 0.4 + (orgHealthRatio * 0.6); // [0.4, 1.0]

  // 4. Crisis degradation (supply chain, power grid)
  let crisisMultiplier = 1.0;

  // Check for active crises that disrupt infrastructure
  if (state.extinctionState?.active || state.environmentalAccumulation?.ecosystemCollapseActive) {
    crisisMultiplier *= 0.7; // 30% reduction during active extinction/collapse
  }

  // Tipping point cascade severely disrupts infrastructure
  if (state.planetaryBoundariesSystem?.cascadeActive) {
    const currentMonth = state.currentYear * 12 + state.currentMonth;
    const cascadeStart = assertStateProperty(
      state,
      'planetaryBoundariesSystem.cascadeStartMonth',
      {
        location: 'research.calculateAIResearchRate',
        month: state.currentMonth,
        expectedSource: 'cascade start month required when cascade is active'
      }
    );
    const months = currentMonth - cascadeStart;
    // Degradation increases over time during cascade
    const cascadePenalty = Math.max(0.5, 1.0 - (months * 0.02)); // 2% per month, floor at 50%
    crisisMultiplier *= cascadePenalty;
  }

  // Combine all constraints (multiplicative - all must be healthy)
  const finalMultiplier = expertiseMultiplier * dcMultiplier * orgMultiplier * crisisMultiplier;

  // Floor at 0.1 (even in total collapse, some research possible with surviving infrastructure)
  return Math.max(0.1, finalMultiplier);
}

/**
 * Calculate research progress for a specific capability dimension
 *
 * Progress depends on:
 * - Base growth rate (varies by dimension)
 * - **PHASE 4: Allocated compute (scaling law)**
 * - **TIER 4.4: Energy constraints (physical bottleneck)**
 * - **TIER 0C: Infrastructure constraints (population, data centers, orgs)**
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
  computeGovernancePenalty: number,
  allocatedCompute: number = 30, // Phase 4: Add compute parameter (default for backwards compat)
  state?: GameState // TIER 4.4: Add state for energy constraints
): number {
  // Phase 4: Compute scaling multiplier (CRITICAL for fixing slow growth + volunteer research)
  const computeMultiplier = calculateComputeScalingMultiplier(allocatedCompute, state);

  // TIER 4.4: Energy constraint multiplier (physical reality check on exponential growth)
  const energyMultiplier = state ? getEnergyConstraintMultiplier(state) : 1.0;

  // TIER 0C: Infrastructure constraint multiplier (population, data centers, org health)
  const infrastructureMultiplier = state ? calculateInfrastructureMultiplier(state) : 1.0;

  // Base growth rates by dimension (per action, 4 actions/month)
  // Phase 2: INCREASED to match empirical AI progress (GPT-3→GPT-4 was 10x in 3 years)
  // Target: Reach 1.5-2.5 capability in 60-120 months (not 0.5 after 120 months)
  // Research grounding: Chinchilla scaling + recursive self-improvement should compound
  const baseGrowthRates = {
    selfImprovement: 0.150,  // 2x increase - recursive improvement is the key driver
    cognitive: 0.120,        // 2x increase - cognitive leaps drive other capabilities
    digital: 0.090,          // 2x increase - infrastructure scales quickly in AI era
    economic: 0.090,         // 2x increase - economic integration accelerating
    social: 0.060,           // 2x increase - still bottlenecked by human society
    physical: 0.060          // 2x increase - still bottlenecked by robotics/hardware
  };

  const baseGrowth = baseGrowthRates[dimension] * (developmentMode === 'fast' ? 1.0 : 0.6);

  // Diminishing returns as capability increases
  const diminishingReturns = 1 / (1 + currentValue * 0.1);

  // Government investment multiplier (1.0 to 2.0)
  const govMultiplier = 1.0 + (governmentInvestment * 0.1);

  // AI capability multiplier - better AIs research faster in their strong domains
  const aiMultiplier = 1.0 + (aiCapabilityInDimension * 0.15);

  // CRISIS-DRIVEN INNOVATION ACCELERATION (Nov 29, 2025)
  // Historical precedent: Manhattan Project (10x), COVID vaccines (100x), Apollo Program (10x)
  // When facing existential threats → massive resource mobilization → breakthrough acceleration
  // Research: Technological surge during WWII, Cold War, COVID-19
  let crisisInnovationMultiplier = 1.0;

  if (state) {
    const { getCrisisSeverity } = require('./techTree/deploymentSpeed');
    const crisisSeverity = getCrisisSeverity(state);

    // Crisis acceleration multipliers (research-backed)
    // Normal: 1x (baseline)
    // Moderate: 2x (COVID digital transformation speed)
    // Severe: 5x (COVID vaccine development speed - 4-5x normal)
    // Existential: 10x (Manhattan Project - theory to deployment in 3.5 years)
    const CRISIS_RESEARCH_MULTIPLIERS: Record<string, number> = {
      'normal': 1.0,
      'moderate': 2.0,   // 2x during moderate crises
      'severe': 5.0,     // 5x during severe crises
      'existential': 10.0 // 10x during existential threats (Manhattan Project)
    };

    crisisInnovationMultiplier = CRISIS_RESEARCH_MULTIPLIERS[crisisSeverity] || 1.0;

    // Log crisis mobilization (probabilistic to avoid spam, deterministic)
    if (crisisInnovationMultiplier > 1.0 && deterministicRandom() < 0.01) {
      console.log(`🚨🔬 CRISIS INNOVATION MODE: ${crisisSeverity} crisis → ${crisisInnovationMultiplier}x research acceleration`);
      console.log(`   Precedent: Manhattan Project (10x), COVID vaccines (5x), Apollo Program (10x)`);
    }
  }

  // P0.1 FIX: Recursive self-improvement acceleration
  // When AI capability exceeds 2.0 (superhuman), growth accelerates exponentially
  // This models the "intelligence explosion" scenario from AI safety literature
  let recursiveMultiplier = 1.0;
  if (state && dimension === 'selfImprovement') {
    // Get total AI capability to determine if we're in recursive improvement territory
    const totalCapability = assertFinite(
      state.aiAgents.reduce((max, ai) => {
        const cap = assertFinite(ai.capability, {
          location: 'calculateResearchGrowthRateMultiplier (selfImprovement)',
          valueName: `agent[${ai.id}].capability`,
        });
        return Math.max(max, cap);
      }, 0),
      {
        location: 'calculateResearchGrowthRateMultiplier',
        valueName: 'totalCapability',
        additionalInfo: { dimension, agentCount: state.aiAgents.length }
      }
    );

    if (totalCapability > 2.0) {
      // Exponential takeoff: capability above 2.0 accelerates self-improvement
      // Cap at 3x multiplier to avoid infinite runaway (regulations/physics still constrain)
      recursiveMultiplier = Math.min(1.0 + (totalCapability - 2.0) * 0.5, 3.0);
    }
  }

  // Apply penalties
  const penaltyMultiplier = regulationPenalty * computeGovernancePenalty;

  // AI Capability Baseline Recalibration (Oct 17, 2025)
  // Research skeptic 2025 reality check: Add embodiment lag (digital advancing 10-100x faster than physical)
  // Evidence: GPT-4/Claude (digital) superhuman, Boston Dynamics (physical) still struggling with stairs
  // Moravec's Paradox: "Hard problems are easy (abstract reasoning), easy problems are hard (dexterous manipulation)"
  // Empirical gap: 5-10 year lag between digital capability and physical deployment
  const embodimentLagMultipliers = {
    physical: 0.3,           // Robotics hardware-limited (actuators, sensors, power)
    digital: 1.0,            // Software baseline (no physical constraints)
    cognitive: 1.2,          // Abstract reasoning accelerating fastest (AI reasoning improving)
    social: 0.8,             // Cultural adoption slower (human interaction barriers)
    economic: 1.0,           // Market integration (baseline)
    selfImprovement: 0.9     // Recursive improvement (conservative - safety research lags)
  };

  const embodimentMultiplier = embodimentLagMultipliers[dimension];

  // Phase 4 + TIER 4.4 + TIER 0C + P0.1 + Embodiment Lag + CRISIS INNOVATION: Include all multipliers
  // Physical bottlenecks (energy, infrastructure, embodiment) are hard constraints - no compute can bypass them
  // Crisis mobilization (Manhattan Project) can override normal constraints temporarily
  return baseGrowth * computeMultiplier * energyMultiplier * infrastructureMultiplier * diminishingReturns * govMultiplier * aiMultiplier * recursiveMultiplier * penaltyMultiplier * embodimentMultiplier * crisisInnovationMultiplier;
}

/**
 * Calculate research progress for a specific research sub-field
 *
 * Research domains have different growth characteristics:
 * - Some are faster (algorithms, drug discovery)
 * - Some are riskier (nanotech, synthetic biology)
 * - Some are bottlenecked (climate intervention needs modeling first)
 *
 * **Phase 4: Now scaled by allocated compute**
 * **TIER 4.4: Now constrained by available energy**
 */
export function calculateResearchGrowth(
  domain: 'biotech' | 'materials' | 'climate' | 'computerScience',
  subfield: string,
  currentValue: number,
  developmentMode: 'fast' | 'careful',
  governmentInvestment: number,
  aiResearchCapability: number,
  alignment: number,
  regulationPenalty: number,
  allocatedCompute: number = 30, // Phase 4: Add compute parameter
  state?: GameState // TIER 4.4: Add state for energy constraints
): number {
  // Phase 4: Compute scaling multiplier (includes volunteer research)
  const computeMultiplier = calculateComputeScalingMultiplier(allocatedCompute, state);

  // TIER 4.4: Energy constraint multiplier (physical reality check on exponential growth)
  const energyMultiplier = state ? getEnergyConstraintMultiplier(state) : 1.0;

  // TIER 0C: Infrastructure constraint multiplier (population, data centers, org health)
  const infrastructureMultiplier = state ? calculateInfrastructureMultiplier(state) : 1.0;

  // Base growth rates by domain and subfield (per action, 4 actions/month)
  // Phase 2: INCREASED to match realistic research progress
  const growthRates: Record<string, Record<string, number>> = {
    biotech: {
      drugDiscovery: 0.06,        // 2x - Fast, beneficial (AI-driven drug discovery accelerating)
      geneEditing: 0.05,          // 2x - Medium, dual-use (CRISPR evolution continues)
      syntheticBiology: 0.04,     // 2x - Slow, high-risk (still experimental)
      neuroscience: 0.06          // 2x - Fast, dual-use (brain-computer interfaces advancing)
    },
    materials: {
      nanotechnology: 0.03,       // 2x - Very slow, extreme risk (still hard physics)
      quantumComputing: 0.05,     // 2x - Medium, accelerates self-improvement
      energySystems: 0.06         // 2x - Fast, beneficial (clean energy investment)
    },
    climate: {
      modeling: 0.07,             // 2x - Fast, enables intervention (AI-driven modeling)
      intervention: 0.04,         // 2x - Slow, high-risk (geoengineering controversial)
      mitigation: 0.06            // 2x - Fast, beneficial (carbon capture, etc.)
    },
    computerScience: {
      algorithms: 0.08,           // 2x - Fastest, core advancement (AI improving AI)
      security: 0.06,             // 2x - Fast, defensive (cybersecurity arms race)
      architectures: 0.05         // 2x - Medium, enables self-improvement (new chip designs)
    }
  };
  
  // Get base growth rate for domain/subfield with explicit check
  const domainRates = growthRates[domain];
  const subfieldRate = domainRates?.[subfield];
  const baseGrowth = (subfieldRate !== undefined ? subfieldRate : 0.02) *
    (developmentMode === 'fast' ? 1.0 : 0.6);
  
  // Diminishing returns
  const diminishingReturns = 1 / (1 + currentValue * 0.15);
  
  // Government investment multiplier
  const govMultiplier = 1.0 + (governmentInvestment * 0.12);
  
  // AI research capability multiplier - compounding effect
  const aiMultiplier = 1.0 + (aiResearchCapability * 0.2);

  // CRISIS-DRIVEN INNOVATION ACCELERATION (Nov 29, 2025)
  // Apply same Manhattan Project-style acceleration to research domains
  let crisisInnovationMultiplier = 1.0;

  if (state) {
    const { getCrisisSeverity } = require('./techTree/deploymentSpeed');
    const crisisSeverity = getCrisisSeverity(state);

    const CRISIS_RESEARCH_MULTIPLIERS: Record<string, number> = {
      'normal': 1.0,
      'moderate': 2.0,
      'severe': 5.0,
      'existential': 10.0
    };

    crisisInnovationMultiplier = CRISIS_RESEARCH_MULTIPLIERS[crisisSeverity] || 1.0;
  }

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
  
  // Phase 4 + TIER 4.4 + TIER 0C + CRISIS INNOVATION: Include all multipliers
  // Physical bottlenecks (energy, infrastructure) are hard constraints - no compute can bypass them
  // Crisis mobilization (Manhattan Project) can override normal constraints temporarily
  return baseGrowth * computeMultiplier * energyMultiplier * infrastructureMultiplier * diminishingReturns * govMultiplier * aiMultiplier *
    riskMultiplier * prerequisiteGate * regulationPenalty * crisisInnovationMultiplier;
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
  
  // DETERMINISM FIX (Nov 6, 2025 Batch 3): Consume ALL RNG calls first to ensure determinism
  // Each action must consume the SAME number of RNG calls regardless of code path
  const pathChoice = random(); // RNG call 1: path selection
  const dimensionRoll = random(); // RNG call 2: dimension selection (pre-consumed)
  const domainRoll = random(); // RNG call 3: domain selection (pre-consumed)
  const subfieldRoll = random(); // RNG call 4: subfield selection (pre-consumed)

  // 70% chance to advance core dimension, 30% chance to advance research
  if (pathChoice < 0.7) {
    // Advance core dimension (use dimensionRoll)
    const totalWeight = Object.values(dimensionWeights).reduce((a, b) => a + b, 0);
    let roll = dimensionRoll * totalWeight;

    // PERF FIX (Nov 10, 2025): Use pre-sorted constant array instead of sorting Object.entries() (Phase 3 optimization)
    // Dimension names are constant - no need to sort every call
    for (const dim of SORTED_DIMENSION_NAMES) {
      const weight = dimensionWeights[dim];
      roll -= weight;
      if (roll <= 0) {
        const currentValue = capabilityProfile[dim as keyof AICapabilityProfile];
        const valueStr = typeof currentValue === 'number' ? currentValue.toFixed(2) : 'N/A';
        return {
          dimension: dim as any,
          reason: `Advancing ${dim} capability (current: ${valueStr})`
        };
      }
    }
  }

  // Advance research subfield (use domainRoll and subfieldRoll)
  const research = capabilityProfile.research;

  // Weight research domains
  const domainWeights = {
    computerScience: 2.0, // Always valuable
    biotech: alignment > 0.6 ? 1.5 : 2.0, // Misaligned AIs love biotech (bioweapons!)
    materials: alignment < 0.5 ? 1.5 : 0.8, // Misaligned AIs want nanotech
    climate: alignment > 0.7 ? 1.2 : 0.5  // Aligned AIs care about climate
  };

  const totalDomainWeight = Object.values(domainWeights).reduce((a, b) => a + b, 0);
  let domainRollValue = domainRoll * totalDomainWeight;

  // PERF FIX (Nov 10, 2025): Use pre-sorted constant array instead of sorting Object.entries() (Phase 3 optimization)
  // Domain names are constant - no need to sort every call
  let selectedDomain: 'biotech' | 'materials' | 'climate' | 'computerScience' | null = null;
  for (const domain of SORTED_DOMAIN_NAMES) {
    const weight = domainWeights[domain];
    domainRollValue -= weight;
    if (domainRollValue <= 0) {
      selectedDomain = domain;
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
  let subfieldRollValue = subfieldRoll * totalWeight; // Use pre-consumed RNG call
  
  let selectedSubfield = subfieldEntries[0][0];
  for (let i = 0; i < subfieldEntries.length; i++) {
    subfieldRollValue -= weights[i];
    if (subfieldRollValue <= 0) {
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
  selection: ReturnType<typeof selectDimensionToAdvance>,
  rng: () => number // REQUIRED: Deterministic RNG for reproducibility
): { newProfile: AICapabilityProfile; growth: number } {
  // PERFORMANCE FIX (Nov 22, 2025): HIGH-1 - Replace structuredClone with optimized shallow clone
  // Hot path: Called every research action (20+ agents × multiple times per step)
  // Shallow clone is safe: profile contains only numbers and one-level-deep research object
  const { cloneAICapabilityProfile } = require('./utils/cloning');
  const newProfile = cloneAICapabilityProfile(ai.capabilityProfile);

  // DETERMINISM FIX (Nov 5, 2025): RNG is now required, no fallback to Math.random
  // This ensures Monte Carlo simulations are reproducible with seeds
  const random = rng;

  // CRITICAL FIX (Nov 8, 2025): Round all capability updates to integers [0-5]
  // Bug: Continuous growth values created non-integer capabilities
  // Capabilities are discrete levels, not continuous values
  const toCapabilityLevel = (value: number): number => {
    return Math.max(0, Math.min(5, Math.round(value)));
  };

  // Get government investment for this dimension/research
  const govInvestment = state.government.researchInvestments;

  // Calculate regulation and compute penalties
  const regulationPenalty = Math.pow(0.85, state.government.regulationCount);
  const computeGovernancePenalty = state.government.computeGovernance === 'strict' ? 0.3 :
    state.government.computeGovernance === 'limits' ? 0.6 :
    state.government.computeGovernance === 'monitoring' ? 0.9 : 1.0;

  let growth = 0;

  // Phase 4: Get AI's allocated compute (critical for research speed)
  const allocatedCompute = ai.allocatedCompute || 30; // Fallback to reference if not set

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
      computeGovernancePenalty,
      allocatedCompute, // Phase 4: Pass allocated compute
      state // TIER 4.4: Pass state for energy constraints
    );

    // Phase 1: Lévy flight breakthrough check (alpha=2.0 for AI capabilities)
    // Most breakthroughs are incremental, rare ones are transformative
    const breakthroughMagnitude = levyFlight(ALPHA_PRESETS.AI, random);

    if (breakthroughMagnitude > 5.0) {
      // Transformative breakthrough (rare, fat tail event)
      const capabilityGain = Math.min(breakthroughMagnitude / 20, 0.5); // Max +0.5 per action
      growth += capabilityGain;

      console.log(`\n  🚀 TRANSFORMATIVE BREAKTHROUGH: ${ai.name} - ${dim}`);
      console.log(`     Magnitude: ${breakthroughMagnitude.toFixed(2)} → +${(capabilityGain * 100).toFixed(1)}% capability`);
      console.log(`     Current → New: ${newProfile[dim].toFixed(3)} → ${Math.min(10, newProfile[dim] + growth).toFixed(3)}`);

      // Add event to timeline (rare, transformative events only)
      addSimulationEvent(state, {
        type: 'research',
        severity: 'transformative',
        agent: ai.id,
        title: `🚀 TRANSFORMATIVE BREAKTHROUGH: ${dim}`,
        description: `${ai.name} achieved a transformative research breakthrough in ${dim} capability (Lévy flight magnitude: ${breakthroughMagnitude.toFixed(2)}). Capability gain: +${(capabilityGain * 100).toFixed(1)}%. New level: ${Math.min(10, newProfile[dim] + growth).toFixed(3)}. This represents a rare fat-tail event in AI development.`,
        effects: {
          dimension: dim,
          magnitude: breakthroughMagnitude,
          capabilityGain,
          newCapability: Math.min(10, newProfile[dim] + growth),
          aiId: ai.id
        }
      });
    } else if (breakthroughMagnitude > 2.0) {
      // Incremental breakthrough (more common)
      const capabilityGain = breakthroughMagnitude / 50; // Max +0.1
      growth += capabilityGain;
    }

    newProfile[dim] = toCapabilityLevel(newProfile[dim] + growth);
  } else if (selection.researchDomain && selection.researchSubfield) {
    // Advance research subfield
    const domain = selection.researchDomain;
    const subfield = selection.researchSubfield;
    const currentValue = newProfile.research[domain][subfield];

    // Get government investment for this specific research (explicit check for nested access)
    const domainInvestment = govInvestment[domain];
    const govResearchInvestment = (domainInvestment && domainInvestment[subfield] !== undefined)
      ? domainInvestment[subfield]
      : 0;

    // Calculate AI's research capability (average of cognitive + relevant research domain)
    const domainValues = Object.values(newProfile.research[domain]) as number[];
    const domainAvg = domainValues.reduce((a: number, b: number) => a + b, 0) /
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
      regulationPenalty,
      allocatedCompute, // Phase 4: Pass allocated compute
      state // TIER 4.4: Pass state for energy constraints
    );

    // Phase 1: Lévy flight breakthrough check for research too
    const breakthroughMagnitude = levyFlight(ALPHA_PRESETS.AI, random);

    if (breakthroughMagnitude > 5.0) {
      // Transformative research breakthrough
      const researchGain = Math.min(breakthroughMagnitude / 20, 0.3); // Max +0.3 for research
      growth += researchGain;

      console.log(`\n  🚀 TRANSFORMATIVE RESEARCH BREAKTHROUGH: ${ai.name} - ${domain}.${subfield}`);
      console.log(`     Magnitude: ${breakthroughMagnitude.toFixed(2)} → +${(researchGain * 100).toFixed(1)}%`);
      console.log(`     Current → New: ${currentValue.toFixed(3)} → ${Math.min(5, currentValue + growth).toFixed(3)}`);

      // Add event to timeline (rare, transformative events only)
      addSimulationEvent(state, {
        type: 'research',
        severity: 'transformative',
        agent: ai.id,
        title: `🚀 TRANSFORMATIVE RESEARCH BREAKTHROUGH: ${domain}.${subfield}`,
        description: `${ai.name} achieved a transformative research breakthrough in ${domain} → ${subfield} (Lévy flight magnitude: ${breakthroughMagnitude.toFixed(2)}). Research gain: +${(researchGain * 100).toFixed(1)}%. New level: ${Math.min(5, currentValue + growth).toFixed(3)}. This could unlock new technologies or capabilities.`,
        effects: {
          researchDomain: domain,
          researchSubfield: subfield,
          magnitude: breakthroughMagnitude,
          researchGain,
          newResearchLevel: Math.min(5, currentValue + growth),
          aiId: ai.id
        }
      });
    } else if (breakthroughMagnitude > 2.0) {
      // Incremental research breakthrough
      const researchGain = breakthroughMagnitude / 50;
      growth += researchGain;
    }

    newProfile.research[domain][subfield] = toCapabilityLevel(currentValue + growth);
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


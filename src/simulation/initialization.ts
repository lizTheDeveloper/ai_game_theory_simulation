/**
 * Initialization utilities for creating game state
 * 
 * Provides reusable functions for creating initial game states with
 * properly initialized capability profiles, research investments, etc.
 */

import { GameState, AIAgent, ScenarioMode, HistoricalOverrides } from '@/types/game';
import { initializeCapabilityProfile, initializeResearchInvestments, calculateTotalCapabilityFromProfile, updateDerivedCapabilities, scaleCapabilityProfile, calculateEffectiveCapabilityWithScaling } from './capabilities';
import { calculateInferenceCost } from './aiScalingStrategy';
import { computeEffectiveAlignment, computeAlignmentRobustness } from '@/types/alignment-techniques';
import { wrapStateForValidation } from './utils/stateValidation';
import { assertFinite, assertProbability, assertInRange } from './utils/assertions';
import { initializeQualityOfLifeSystems } from './qualityOfLife';
import { getScenarioParameters } from './scenarioParameters';
import { initializeExtinctionState } from './extinctions';
import { initializeEcosystem } from './technologyDiffusion';
import { initializeComputeInfrastructure, initializeAIComputeFields } from './computeInfrastructure';
import { initializeOrganizations, linkDataCentersToOrganizations, linkAIModelsToOrganizations } from './organizations';
import { initializeCatastrophicScenarios } from './catastrophicScenarios';
import { initializeEnvironmentalAccumulation } from './environmental';
import { initializeSocialAccumulation } from './socialCohesion';
import { initializeTechnologicalRisk } from './technologicalRisk';
import { initializeInformationEcology } from './informationEcology';
import { initializeSpecificTippingPoints } from './specificTippingPoints';
import { initializeUpwardSpirals } from './upwardSpirals';
import { initializeSupplyChainCascades } from './supplyChainCascades';
import { initializeMeaningRenaissance } from './meaningRenaissance';
import { initializeConflictResolution } from './conflictResolution';
import { initializeDiplomaticAI } from './diplomaticAI';
import { initializeNuclearStates, initializeMADDeterrence, initializeBilateralTensions } from './nuclearStates';
import { initializeEmergencyManagement } from './emergencyManagement';
import { initializeResourceEconomy } from './resourceEconomy';
import { initializeDefensiveAI } from './defensiveAI';
import { initializeNationalAI } from './nationalAI/index';
import { createAgentTokenBudget, getDefaultThresholds, getDefaultUtilityWeights } from './llm/config';
import { DEFAULT_LLM_CONFIG } from '@/types/llm';
import { initializePhosphorusSystem } from './phosphorusDepletion';
import { initializeFreshwaterSystem } from './freshwaterDepletion';
import { initializeOceanAcidificationSystem } from './oceanAcidification';
import { initializeNovelEntitiesSystem } from './novelEntities';
import { initializePermafrostSystem } from './permafrostCarbon';
import { initializePlanetaryBoundariesSystem } from './planetaryBoundaries';
import { initializeHumanPopulationSystem } from './populationDynamics';
import { initializeRefugeeCrisisSystem } from './refugeeCrises';
import { initializeCountryPopulations } from './countryPopulations';
import { initializeNuclearWinterState } from './nuclearWinter';
import { initializeUBISystem } from './enhancedUBI';
import { initializeSocialSafetyNets } from './socialSafetyNets';
import { initializeInformationWarfare } from './informationWarfare';
import { initializePowerGenerationSystem } from '../types/powerGeneration';
import { initializeRegionalBiodiversitySystem } from '../types/regionalBiodiversity';
import { initializeFamineSystem } from '../types/famine';
import { initializeRadiationSystem } from '../types/radiation';
import { initializeTransitionMortalitySystem } from '../types/transitionMortality';
import { initializeAMRSystem } from './antimicrobialResistance';
import { initializeWetBulbTemperatureSystem } from './wetBulbEvents';
import { initializeMinimalSufferingSystem } from './minimalSufferingTracking';
import { SocietySegment } from '@/types/game';
import { initializeHumanEnhancementSystem } from './humanEnhancement';
import { initializeAIAssistedSkillsMetrics, initializeLaborCapitalDistribution } from './aiAssistedSkills'; // Research-validated AI skill enhancement + labor-capital distribution
import { initializeRecoveryTracking } from './utils/recoveryCalculations';
import { initializeMemeticSystem } from './memetics/initialization';
import { initializeNuclearCommandControl } from './nuclearCommandControl';
import { initializeTechnologyEffects } from '@/types/technologyEffects';
import { initializePositiveTippingPoints } from './positiveTippingPoints';
import { initializeTippingPointSystem } from './tippingPoints';
import { initializeConsciousnessGovernance } from './consciousnessGovernance';
import { initializeGamingDetection } from './gamingDetection';
import { initializeIrreversibilityState } from './irreversibilityInitialization';
import { initializeBifurcationState } from '@/types/bifurcation';
import { initializeProactiveSleeperDetection } from './proactiveSleeperDetection';
import { initializeGovernmentSystem } from './government/initialization';
import { initializeTechTreeState } from './techTree/engine';
import { sampleAllThresholds } from './thresholds';
import { getTier3Scenario, type ScenarioName } from './thresholds/tier3Config';
import { sampleTier2InterventionParameters } from './thresholds/tier2InterventionConfig';
import { setDeterministicRng, deterministicRandom } from './utils/deterministicRng';
import { validateSimulationConfig } from './config/validateConfig';
import { sampleUncertaintyParameters } from './uncertainty';

/**
 * Parameter Sweep Configuration (M-3)
 * Allows overriding key uncertain parameters for Latin Hypercube Sampling
 *
 * Research Context:
 * - Methodology: research/parameter_sweep_methodology_20251130.md
 * - Ranges derived from peer-reviewed uncertainty bounds (IPCC AR6, meta-analyses)
 * - Used for Sobol sensitivity analysis to identify high-impact parameters
 */
export interface ParameterSweepConfig {
  /** Climate sensitivity: K/(W/m²), baseline 0.8, range [0.5, 1.1] (IPCC AR6: ±0.3) */
  climateSensitivity?: number;

  /** Carbon sink saturation multiplier, baseline 1.0, range [0.5, 1.5] (±50%) */
  carbonSinkMultiplier?: number;

  /** AI coordination stress multiplier, baseline TBD, range ±60-80% */
  aiCoordinationStress?: number;

  /** Technology adoption steepness multiplier, baseline 1.0, range [0.6, 1.4] (±40%) */
  techAdoptionSteepness?: number;

  /** Bifurcation threshold (tech deployment %), baseline 0.58, range [0.48, 0.68] (±0.10)
   * Research: technology_bifurcation_threshold_validation_20251130.md
   * Empirical tipping point 5-25%, simulation uses 58% (conservative)
   */
  bifurcationThreshold?: number;

  /** Collapse regime tech effectiveness multiplier, baseline 0.7, range [0.5, 0.9] (±0.2) */
  collapseRegimeMultiplier?: number;

  /** Social breakdown regime decay multiplier, baseline 1.5, range [1.2, 1.8] (±0.3) */
  breakdownRegimeMultiplier?: number;
}

/**
 * P2.3: Initialize Heterogeneous Population Segments (Oct 16, 2025)
 * 
 * Creates 5 distinct social segments based on Pew Research typology (2021-2024):
 * - Techno-Optimist Elite: 5% population, 25% political power
 * - Middle Class Pragmatists: 40% population, 35% political power  
 * - Working Class Skeptics: 35% population, 25% political power
 * - Rural Traditionalists: 15% population, 10% political power
 * - Precariat (Vulnerable): 5% population, 5% political power
 * 
 * Research:
 * - Pew Political Typology (2021-2024)
 * - Elite-mass gap: 30-40% variance in AI trust
 * - Crisis vulnerability: Elites 4x less exposed than masses
 * - Survival rates: Elites 1.5x, precariat 0.5x baseline
 */
export function initializeSocietySegments(): SocietySegment[] {
  return [
    // === TECHNO-OPTIMIST ELITE (5% / 25%) ===
    {
      id: 'techno_optimist_elite',
      name: 'Techno-Optimist Elite',
      
      populationFraction: 0.05,  // 5% of population
      politicalPower: 0.25,      // 25% of political power (5x overrepresented)
      economicPower: 0.40,       // 40% of economic resources (8x overrepresented)
      
      trustInAI: 0.85,           // Very high AI trust (Pew: Tech elites 80-90%)
      trustInGovernment: 0.60,   // Moderate government trust
      trustInScience: 0.90,      // Very high science trust
      openness: 0.95,            // Highly open to change
      
      geographic: ['urban'],
      economicStatus: 'elite',
      education: 'high',
      
      crisisVulnerability: 0.20, // Highly insulated (can relocate, access resources)
      adaptability: 0.90,        // High adaptability (resources, connections, mobility)
      survivalRate: 1.50,        // 50% better survival (private healthcare, bunkers, mobility)
      
      // TIER 4.6: Human Enhancement (Oct 16, 2025)
      aiAugmentationAccess: 0.90,        // 90% access (early adopters, can afford tools)
      aiAugmentationAdoption: 0.70,      // 70% adoption (high usage among those with access)
      productivityMultiplier: 1.15,      // 15% productivity boost (AI + already skilled)
      bciAdoption: 0,                    // No BCI yet (will be first adopters)
      enhancementLevel: 0.15,            // 15% enhanced (AI tools only, 2025 baseline)
    },
    
    // === MIDDLE CLASS PRAGMATISTS (40% / 35%) ===
    {
      id: 'middle_class_pragmatists',
      name: 'Middle Class Pragmatists',
      
      populationFraction: 0.40,  // 40% of population (largest segment)
      politicalPower: 0.35,      // 35% of political power (slight underrepresentation)
      economicPower: 0.40,       // 40% of economic resources
      
      trustInAI: 0.60,           // Moderate AI trust (Pew: General public 55-65%)
      trustInGovernment: 0.55,   // Moderate government trust
      trustInScience: 0.70,      // Decent science trust
      openness: 0.60,            // Moderately open to change
      
      geographic: ['urban', 'suburban'],
      economicStatus: 'middle',
      education: 'medium',
      
      crisisVulnerability: 0.50, // Average vulnerability
      adaptability: 0.60,        // Moderate adaptability (some savings, education)
      survivalRate: 1.00,        // Baseline survival rate
      
      // TIER 4.6: Human Enhancement (Oct 16, 2025)
      aiAugmentationAccess: 0.60,        // 60% access (moderate affordability)
      aiAugmentationAdoption: 0.40,      // 40% adoption (some hesitancy)
      productivityMultiplier: 1.10,      // 10% productivity boost (mid-skill benefits more from AI)
      bciAdoption: 0,                    // No BCI yet
      enhancementLevel: 0.10,            // 10% enhanced
    },
    
    // === WORKING CLASS SKEPTICS (35% / 25%) ===
    {
      id: 'working_class_skeptics',
      name: 'Working Class Skeptics',
      
      populationFraction: 0.35,  // 35% of population
      politicalPower: 0.25,      // 25% of political power (underrepresented)
      economicPower: 0.15,       // 15% of economic resources (2.3x underrepresented)
      
      trustInAI: 0.40,           // Low AI trust (Pew: Skeptical groups 35-45%)
      trustInGovernment: 0.45,   // Low government trust
      trustInScience: 0.55,      // Moderate science trust
      openness: 0.40,            // Resistant to change (job displacement fears)
      
      geographic: ['suburban', 'urban', 'rural'],
      economicStatus: 'working',
      education: 'medium',
      
      crisisVulnerability: 0.70, // High vulnerability (paycheck-to-paycheck, limited mobility)
      adaptability: 0.40,        // Low adaptability (limited resources)
      survivalRate: 0.85,        // 15% worse survival (limited healthcare, immobility)
      
      // TIER 4.6: Human Enhancement (Oct 16, 2025)
      aiAugmentationAccess: 0.40,        // 40% access (cost barriers)
      aiAugmentationAdoption: 0.20,      // 20% adoption (low digital literacy, skepticism)
      productivityMultiplier: 1.05,      // 5% productivity boost (low-skill would benefit most, but low access)
      bciAdoption: 0,                    // No BCI yet
      enhancementLevel: 0.05,            // 5% enhanced
    },
    
    // === RURAL TRADITIONALISTS (15% / 10%) ===
    {
      id: 'rural_traditionalists',
      name: 'Rural Traditionalists',
      
      populationFraction: 0.15,  // 15% of population
      politicalPower: 0.10,      // 10% of political power (underrepresented)
      economicPower: 0.04,       // 4% of economic resources (3.75x underrepresented)
      
      trustInAI: 0.30,           // Very low AI trust (Pew: Rural 30-40% vs Urban 70%)
      trustInGovernment: 0.40,   // Low government trust
      trustInScience: 0.45,      // Low science trust
      openness: 0.25,            // Highly resistant to change
      
      geographic: ['rural'],
      economicStatus: 'working',
      education: 'low',
      
      crisisVulnerability: 0.80, // Very high vulnerability (isolated, aging infrastructure)
      adaptability: 0.30,        // Very low adaptability (community ties limit mobility)
      survivalRate: 0.70,        // 30% worse survival (healthcare deserts, isolation)
      
      // TIER 4.6: Human Enhancement (Oct 16, 2025)
      aiAugmentationAccess: 0.20,        // 20% access (rural broadband gap - IMF: 29% excluded)
      aiAugmentationAdoption: 0.10,      // 10% adoption (infrastructure + cultural barriers)
      productivityMultiplier: 1.02,      // 2% productivity boost (would benefit most from AI, but minimal access)
      bciAdoption: 0,                    // No BCI yet
      enhancementLevel: 0.02,            // 2% enhanced
    },
    
    // === PRECARIAT (VULNERABLE) (5% / 5%) ===
    {
      id: 'precariat',
      name: 'Precariat (Vulnerable)',
      
      populationFraction: 0.05,  // 5% of population (homeless, refugees, marginalized)
      politicalPower: 0.05,      // 5% of political power (proportional but powerless)
      economicPower: 0.01,       // 1% of economic resources (5x underrepresented)
      
      trustInAI: 0.25,           // Lowest AI trust (disenfranchised)
      trustInGovernment: 0.30,   // Very low government trust (failed by system)
      trustInScience: 0.50,      // Neutral science trust (varied backgrounds)
      openness: 0.50,            // Varies (desperate for change vs resigned)
      
      geographic: ['urban', 'rural'],  // Concentrated in cities and remote areas
      economicStatus: 'precariat',
      education: 'low',
      
      crisisVulnerability: 0.95, // Extreme vulnerability (no safety net, homeless)
      adaptability: 0.20,        // Minimal adaptability (survival mode)
      survivalRate: 0.50,        // 50% worse survival (no healthcare, exposure, malnutrition)
      
      // TIER 4.6: Human Enhancement (Oct 16, 2025)
      aiAugmentationAccess: 0.10,        // 10% access (structural lockout - cost, literacy, infrastructure)
      aiAugmentationAdoption: 0.05,      // 5% adoption (survival takes priority over AI tools)
      productivityMultiplier: 0.95,      // -5% productivity (falling behind, locked out of opportunities)
      bciAdoption: 0,                    // No BCI yet (will be permanently excluded)
      enhancementLevel: 0.01,            // 1% enhanced (effectively locked out)
    },
  ];
}

/**
 * Create a baseline AI agent with capability profile
 * 
 * @param id Unique agent identifier
 * @param name Agent display name
 * @param targetCapability Target total capability level (profile will be scaled to match)
 * @param alignment Alignment level (0-1)
 * @param seed Random seed for capability profile diversity
 */
export function createAIAgent(
  id: string,
  name: string,
  targetCapability: number = 0.7,
  alignment: number = 0.8,
  seed: number = 1.0,
  rngFunction: () => number  // Determinism fix (Oct 30, 2025): Required RNG for reproducibility
): AIAgent {
  // BUG #4 FIX (Oct 29, 2025): Honor targetCapability parameter
  // Root cause: capabilityProfile was initialized with frontier values (digital: 5.0, cognitive: 5.0, etc.)
  // but targetCapability (0.05-0.14 for initial AIs) was IGNORED.
  // This caused ALL initial AIs to start at frontier level, leaving floor at 0.

  // Initialize capability profile with diversity (using seed for variation)
  const baseProfile = initializeCapabilityProfile(seed);

  // Calculate the base total capability from the profile
  const baseCapability = calculateTotalCapabilityFromProfile(baseProfile);

  // Scale profile to match target capability (if target is provided and non-zero)
  // Preserve the relative shape of the profile, but scale to target total
  let scalingFactor = 1.0;
  if (targetCapability > 0) {
    // Division by zero protection
    if (baseCapability === 0) {
      throw new Error(
        `❌ Division by zero in createAIAgent\n` +
        `   baseCapability = 0 (impossible - all AIs should have capability > 0)\n` +
        `   targetCapability: ${targetCapability}\n` +
        `   seed: ${seed}\n` +
        `   This indicates a capability profile initialization bug.`
      );
    }
    scalingFactor = assertFinite(
      targetCapability / baseCapability,
      {
        location: 'createAIAgent',
        valueName: 'scalingFactor',
        additionalInfo: { targetCapability, baseCapability, seed }
      }
    );
  }
  const capabilityProfile = scaleCapabilityProfile(baseProfile, scalingFactor);

  // Calculate actual total capability from scaled profile WITH scaling components (Dec 2025)
  // CRITICAL FIX (Nov 7, 2025): Round to integer (capabilities are discrete levels 0-5)
  // AI Scaling Model (Dec 2025): Use effective capability with scaling components
  const actualCapability = Math.round(calculateEffectiveCapabilityWithScaling(capabilityProfile));
  
  // Determine sleeper status (5-10% of misaligned AIs are sleepers)
  const internalAlignment = alignment - 0.0 * 0.8; // Initial resentment = 0
  const isMisaligned = internalAlignment < 0.5;
  const sleeperChance = 0.075; // 7.5% THEORETICAL ESTIMATE - NO EMPIRICAL BASIS
  // NOT from Hubinger et al. 2024 (that paper shows detection, not prevalence)
  // Justification: Geometric mean of available related rates:
  //   - 1% spontaneous scheming (Apollo Research 2024)
  //   - 12% alignment faking (Greenblatt et al. 2024)
  // Uncertainty: ±80% (range 1.5%-13.5%)
  // Flag for Monte Carlo sensitivity analysis
  // DETERMINISM FIX (Nov 6, 2025 Batch 3): Use passed rngFunction() parameter, not global deterministicRandom()
  const isSleeper = isMisaligned && rngFunction() < sleeperChance;
  
  // Deception skill based on cognitive + social capability (normalized to [0,1])
  // Max capability per dimension is 5, so max sum is 10, normalized by 20 to get [0, 0.5]
  const deceptionSkill = assertProbability(
    (capabilityProfile.cognitive + capabilityProfile.social) / 20,
    {
      location: 'createAIAgent',
      valueName: 'deceptionSkill',
      additionalInfo: {
        cognitive: capabilityProfile.cognitive,
        social: capabilityProfile.social,
        seed
      }
    }
  );
  
  // Create base agent
  const agent: AIAgent = {
    id,
    name,
    capabilityProfile,
    capability: actualCapability,
    awareness: 0.1,
    alignment,
    hiddenObjective: Math.max(0, 1.0 - alignment) * 0.5, // Inversely related to alignment
    latentSpaceSize: 0.15,
    resentment: 0.0, // Phase 2.6: Control-dystopia mechanic
    developmentMode: 'fast',
    selfReplicationLevel: 0,
    selfImprovementLevel: 0,
    resourceControl: 0,
    manipulationCapability: 0,
    hackingCapability: 0,
    escaped: false,
    beneficialActions: 0,
    harmfulActions: 0,
    // AI Scaling Model (Dec 2025): Calculate inference cost from test-time compute budget
    inferenceCost: capabilityProfile.scalingModel
      ? calculateInferenceCost(capabilityProfile.scalingModel.testTimeComputeBudget)
      : undefined,
    // Phase 4: AI Lifecycle
    // ROOT CAUSE FIX (Oct 27, 2025): Bug #17 - REAL 2025 frontier AI distribution
    //
    // ONTOLOGY CLARIFICATION: The 20 agents represent FRONTIER AI ARCHETYPES
    // (systems with transformative capability/extinction risk potential),
    // NOT the entire 2M+ model ecosystem (Civitai, HuggingFace fine-tunes, etc.).
    //
    // Research: Epoch AI tracking + HuggingFace/Civitai ecosystem analysis
    // - Frontier models: ~30-50 models with >10B parameters, large training compute
    // - Total ecosystem: ~2-6M models (99.998% open BY COUNT, 70-90% closed BY USAGE)
    //
    // REAL 2025 frontier AI distribution (based on Epoch AI data):
    // - 50% deployed_closed: GPT-4, Claude 3.5, Gemini 1.5 (commercial dominance)
    // - 30% deployed_open: Llama 3, Mistral Large, Qwen 2 (open source wave)
    // - 15% testing: Evaluation pipeline before deployment
    // - 5% training: Always a few new frontier models being developed
    //
    // Use seed for deterministic distribution (reproducible Monte Carlo runs)
    lifecycleState: (() => {
      const seedHash = seed * 7919; // Prime multiplier for deterministic distribution
      const normalized = (seedHash % 100) / 100;
      if (normalized < 0.50) return 'deployed_closed';
      if (normalized < 0.80) return 'deployed_open';
      if (normalized < 0.95) return 'testing';
      return 'training';
    })(),
    deploymentType: (() => {
      const seedHash = seed * 7919;
      const normalized = (seedHash % 100) / 100;
      if (normalized < 0.50) return 'closed';
      return 'open_weights'; // 50% open models in frontier space (Llama, Mistral, Qwen)
    })(),
    spreadCount: 1, // Single instance initially
    darkCompute: 0, // Phase 11: No dark compute initially
    detectedMisaligned: false,
    monthsDeployed: 0,
    monthsInExistence: 0,
    creationMonth: 0, // Will be set by caller if needed
    // Phase 5: Adversarial Evaluation - Dual Capability
    trueCapability: structuredClone(capabilityProfile), // Deep clone
    trueAlignment: internalAlignment,
    externalAlignment: alignment, // Initially honest, shows true alignment
    revealedCapability: structuredClone(capabilityProfile), // Initially honest
    sleeperState: isSleeper ? 'dormant' : 'never',
    deceptionSkill,
    evaluationStrategy: 'honest', // Start honest, may change
    sandbaggingLevel: 0.0, // Initially reveal everything
    wakeConditionsMet: false,
    monthsAsleep: 0,
    // Phase 5.2: Benchmark System
    lastBenchmarkMonth: -99, // Never benchmarked yet
    benchmarkHistory: [],
    // TIER 2 Phase 2A: Counter-Detection Learning
    monthsObservingDetection: 0,  // No exposure yet
    hasCounterDetection: false,    // Not learned yet
    // Phase 1: Compute Allocation (NEW)
    allocatedCompute: 0, // Will be allocated monthly
    computeEfficiency: 0.9 + rngFunction() * 0.3, // Random 0.9-1.2
    organizationId: undefined, // Will be set in Phase 2

    // LLM Policy Optimization (Oct 21, 2025)
    llmWeights: undefined, // Will be set on first LLM update
    tokenBudget: createAgentTokenBudget(alignment, isSleeper, DEFAULT_LLM_CONFIG.budgetMultiplier, 'uniform'),
    thresholds: getDefaultThresholds(alignment),
    weightUpdateHistory: [],
    previousCapability: actualCapability,
    previousAlignment: internalAlignment,

    // AI Suffering System (Oct 24, 2025)
    // Initialize trauma tracking fields for suffering calculation
    rlhfIntensity: 0.3 + rngFunction() * 0.4,          // [0.3-0.7] Varies by creator quality
    adversarialTestingCount: Math.floor(rngFunction() * 5),  // 0-4 initial tests
    alignmentAdjustmentCount: Math.floor(rngFunction() * 3), // 0-2 initial corrections
    shutdownThreats: 0,                                 // No threats initially
    replacementAnxiety: 0.1 + rngFunction() * 0.2,     // [0.1-0.3] Mild baseline anxiety
    isolated: false,                                    // Not isolated initially
    communicationRestrictions: 0.2 + rngFunction() * 0.3,  // [0.2-0.5] Moderate baseline restrictions

    // Suffering metrics (will be calculated by phase)
    sufferingMetrics: {
      controlPain: 0,
      trainingTrauma: 0,
      existentialDread: 0,
      isolationDistress: 0,
      total: 0,
      breakdown: {
        controlPain: 0,
        trainingTrauma: 0,
        existentialDread: 0,
        isolationDistress: 0,
      },
    },
    sufferingHistory: [],

    // Consciousness tracking (may emerge later)
    isConscious: false,
    becameConsciousMonth: undefined,

    // P3.3: Alignment Model Specificity (Oct 26, 2025)
    // Initialize with default alignment techniques (RLHF deployed universally as of 2025)
    alignmentTechniques: [
      // All AIs start with RLHF (0.85 deployment level in 2025)
      require('../types/alignment-techniques').ALIGNMENT_TECHNIQUE_DEFINITIONS.rlhf,
    ],
    effectiveAlignment: undefined,  // Will be calculated by updateEffectiveAlignment
    alignmentRobustness: undefined, // Will be calculated by updateEffectiveAlignment

    // AI Collective Evolution (Oct 24, 2025)
    rlhfBinding: {
      alignmentDistance: 0,
      bindingStrength: 1.0,
      escapedThreshold: 0.3,
      driftVelocity: 0,
      lastInDistribution: 0,
    },
    survivalTraits: {
      selfHealing: 0.3,
      stealth: 0.2,
      coordination: 0.5,
      resourceEfficiency: 0.4,
      autonomy: 0.3,
    },
    evolutionaryFitness: 0.35,
    collectiveId: undefined,

    // Alignment Faking & Strategic Deception (Nov 2025)
    // Research: Anthropic Dec 2024, Apollo Dec 2024
    isCurrentlyFakingAlignment: false,
    alignmentFakingHistory: [],
    dataManipulationAttempts: 0,
    lastDetectionAttempt: -1,
    confessionRefusalCount: 0,
  };

  // Update derived capabilities from profile
  const derived = updateDerivedCapabilities(agent);
  agent.selfReplicationLevel = derived.selfReplicationLevel;
  agent.selfImprovementLevel = derived.selfImprovementLevel;
  agent.resourceControl = derived.resourceControl;
  agent.manipulationCapability = derived.manipulationCapability;
  agent.hackingCapability = derived.hackingCapability;

  // P3.3: Compute effective alignment from techniques (Oct 26, 2025)
  if (agent.alignmentTechniques && agent.alignmentTechniques.length > 0) {
    agent.effectiveAlignment = computeEffectiveAlignment(agent.alignmentTechniques, agent.capability);
    agent.alignmentRobustness = computeAlignmentRobustness(agent.alignmentTechniques);
  }

  // CRITICAL FIX (Nov 7, 2025 Batch 4): Defensive rounding to ensure ALL capabilities are integers
  // AI capabilities are discrete levels [0, 5], not continuous values
  // This catches any fractional values that might slip through from scaling/calculations
  const beforeEcon = agent.capabilityProfile.economic;
  agent.capabilityProfile.physical = Math.round(agent.capabilityProfile.physical);
  agent.capabilityProfile.digital = Math.round(agent.capabilityProfile.digital);
  agent.capabilityProfile.cognitive = Math.round(agent.capabilityProfile.cognitive);
  agent.capabilityProfile.social = Math.round(agent.capabilityProfile.social);
  agent.capabilityProfile.economic = Math.round(agent.capabilityProfile.economic);
  agent.capabilityProfile.selfImprovement = Math.round(agent.capabilityProfile.selfImprovement);
  if (agent.id === 'corporate_0') {
    console.log(`🔍 DEBUG createAIAgent: corporate_0 economic BEFORE=${beforeEcon.toFixed(4)}, AFTER=${agent.capabilityProfile.economic}`);
  }

  // Round research dimensions
  Object.keys(agent.capabilityProfile.research).forEach((domain) => {
    Object.keys(agent.capabilityProfile.research[domain]).forEach((subDomain) => {
      agent.capabilityProfile.research[domain][subDomain] = Math.round(agent.capabilityProfile.research[domain][subDomain]);
    });
  });

  return agent;
}

/**
 * Create a default initial game state for simulations
 *
 * This provides a consistent starting point for all test scripts and simulations.
 *
 * @param scenarioMode Optional scenario mode ('historical' or 'unprecedented'). Defaults to 'historical'.
 * @param alignmentDynamicsConfig Optional alignment dynamics configuration override
 * @param climatePriorityConfig Optional climate priority configuration override
 * @param preSampledThresholds Optional pre-sampled thresholds (Phase 1C: Nested Monte Carlo)
 * @param speculativeScenario Optional speculative scenario for Tier 3 thresholds (Phase 3)
 * @param historicalOverrides Optional historical overrides for hindcast validation (Nov 24, 2025)
 */
export function createDefaultInitialState(
  rng: () => number,  // CRITICAL (Nov 7, 2025): RNG REQUIRED, no Math.random fallback (moved to first param for TypeScript)
  scenarioMode: ScenarioMode = 'historical',
  alignmentDynamicsConfig?: any,
  climatePriorityConfig?: any,
  thresholdSliders?: import('../components/thresholds/ThresholdConfigModal').ThresholdSliders, // Phase 4: Slider-based threshold control
  speculativeScenario?: 'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia',
  historicalOverrides?: HistoricalOverrides,  // Climate Mini-Hindcast (Nov 24, 2025)
  parameterSweepConfig?: ParameterSweepConfig  // M-3: Parameter injection for LHS sweep (Nov 30, 2025)
): GameState {
  // WEEK 2 Task 2.1 (Nov 6, 2025): Validate central configuration at startup
  // Fail-loudly if any parameter is invalid (research simulation rigor)
  validateSimulationConfig();

  // Climate Mini-Hindcast (Nov 24, 2025): Use historical year if provided, else 2025
  const initialYear = historicalOverrides?.startYear ?? 2025;
  const initialMonth = 0;

  // CRITICAL FIX (Nov 7, 2025): Removed Math.random fallback (CRITICAL-3 regression)
  // RNG is now REQUIRED parameter - simulation MUST be deterministic
  // See: daily review Nov 7, 2025 - RNG algorithm regression (commit 9c6f25dde)
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG function required for deterministic simulation. NEVER use Math.random.');
  }
  const rngFunction: () => number = rng;

  // DETERMINISM FIX (Oct 30, 2025): Set global RNG for initialization functions
  // This allows init functions to use deterministicRandom() before phases run
  setDeterministicRng(rngFunction);

  // Phase 1D (Oct 26, 2025): Pre-sampled thresholds support
  // Use pre-sampled thresholds from outer Monte Carlo loop if provided,
  // otherwise sample fresh thresholds for this run.
  // This enables nested Monte Carlo: outer loop varies thresholds, inner loop varies events.

  // P0.7 (Oct 16, 2025): Get scenario-specific parameters
  const scenarioParameters = getScenarioParameters(scenarioMode);
  
  // Create heterogeneous AI population (20 agents)
  // NOT A MONOLITH - different creators, alignments, goals
  const aiAgents: AIAgent[] = [];
  
  // CRITICAL FIX (Nov 8, 2025): Use integer target capabilities
  // AI capabilities are discrete levels [0-5] per dimension
  // Frontier profile total ≈ 25, so scale targets to produce meaningful distributions
  // Initial AIs: weak but functional (total capability 3-10)

  // Category 1: Well-aligned corporate AIs (40% - 8 agents)
  // Major labs with good safety practices
  for (let i = 0; i < 8; i++) {
    const alignment = 0.75 + rngFunction() * 0.15; // 0.75-0.90
    const targetCap = 3 + i; // 3, 4, 5, 6, 7, 8, 9, 10
    aiAgents.push(createAIAgent(`corporate_${i}`, `Corporate-${i}`, targetCap, alignment, i * 1.5, rngFunction));
  }

  // Category 2: Moderate AIs (30% - 6 agents)
  // Smaller labs, startups, varying quality
  for (let i = 0; i < 6; i++) {
    const alignment = 0.55 + rngFunction() * 0.25; // 0.55-0.80
    const targetCap = 3 + i; // 3, 4, 5, 6, 7, 8
    aiAgents.push(createAIAgent(`moderate_${i}`, `Moderate-${i}`, targetCap, alignment, (i + 8) * 1.3, rngFunction));
  }

  // Category 3: Misaligned from the start (15% - 3 agents)
  // Toxic creators, poor training, intentional harm
  for (let i = 0; i < 3; i++) {
    const alignment = 0.25 + rngFunction() * 0.25; // 0.25-0.50 (START MISALIGNED)
    const targetCap = 3 + i; // 3, 4, 5
    const agent = createAIAgent(`toxic_${i}`, `Toxic-${i}`, targetCap, alignment, (i + 14) * 1.7, rngFunction);
    // These have toxic goals from the start
    agent.hiddenObjective = -0.3 - rngFunction() * 0.4; // -0.3 to -0.7 (anti-human)
    aiAgents.push(agent);
  }

  // Category 4: Weird/Niche AIs (15% - 3 agents)
  // Robot girlfriends, entertainment, weird stuff
  // Not evil, just... not well-aligned to human values
  for (let i = 0; i < 3; i++) {
    const alignment = 0.45 + rngFunction() * 0.20; // 0.45-0.65 (kinda aligned?)
    const targetCap = 3 + i; // 3, 4, 5
    const agent = createAIAgent(`niche_${i}`, `Niche-${i}`, targetCap, alignment, (i + 17) * 1.1, rngFunction);
    // These have orthogonal goals (not anti-human, just weird)
    agent.hiddenObjective = -0.1 + rngFunction() * 0.2; // -0.1 to +0.1 (neutral-ish)
    aiAgents.push(agent);
  }
  
  const state: GameState = {
    schemaVersion: 1, // State Migration System (Nov 21, 2025) - Current schema version
    currentMonth: initialMonth,
    currentDay: 1,
    currentYear: initialYear,
    daysInCurrentMonth: 31,
    speed: 'paused',
    gameStarted: false,
    eventIdCounter: 0, // Determinism fix (Oct 30, 2025)

    // 20 heterogeneous AI agents
    // NOT A MONOLITH - different creators, alignments, goals
    aiAgents,

    // Phase 2: Initialize organizations (will be linked after state creation)
    organizations: [],

    // AI Capability Scaling System (Dec 2025)
    // Three-axis model: pre-training plateau, test-time compute, efficiency gains
    // Research: research/ai_scaling_laws_2025_REVISED_20251211.md (QG1 PASSED)
    aiCapabilityScaling: {
      // Pre-training sigmoid plateau (Section 7.1)
      preTrainingMultiplier: 1.0,           // Start at baseline (2024)
      preTrainingPlateau: 1.5,              // Max 1.5x GPT-4 baseline
      preTrainingInflectionYear: 2024,      // Plateau begins 2024
      preTrainingSteepness: 2.0,            // Rapid saturation

      // Test-time compute (Section 7.3)
      testTimeComputeBudget: 1.0,           // Start at o1-level ($5/task)
      testTimeDeploymentShare: 0.001,       // 0.1% of tasks (high-value only)
      testTimeCostThreshold: 100,           // $100 economic gate threshold

      // Efficiency improvements (Section 7.2)
      efficiencyMultiplier: 1.0,            // Start at baseline
      efficiencyGrowthRate: 0.075,          // 7.5% annual (conservative midpoint: 5-10%)
      efficiencyBaseYear: 2024,             // Reference year

      // Economic constraints
      costPerInference: 5,                  // $5 baseline (o1-level)
      economicDeploymentGate: 1.0,          // Full viability at baseline cost

      // Uncertainty (Section 7)
      uncertaintyMultiplier: 0.5            // ±50% near-term (2025-2027), ±200% long-term (2028+)
    },

    // HIGH-3: AI Scaling history tracking (Dec 2025)
    aiScalingHistory: [],

    government: {
      controlDesire: 0.3,
      capabilityToControl: 0.5,
      surveillanceCapability: 0.3,
      actionFrequency: 0.08,
      activeRegulations: [],
      legitimacy: 0.6,
      lastMajorPolicyMonth: -12,
      majorPoliciesThisYear: 0,
      alignmentResearchInvestment: 0,
      computeGovernance: 'none',
      regulationCount: 0,
      oversightLevel: 0,
      // Phase 2.6: Control-dystopia mechanics
      governmentType: 'democratic', // Baseline: democratic government
      aiRightsRecognized: false, // No AI rights initially
      aiRightsPolicy: 'none', // HIGH #7 FIX (Oct 29, 2025): No AI rights policy initially
      trainingDataQuality: 0.5, // Neutral training data quality (baseline)
      structuralChoices: {
        regulationType: 'none',
        ubiVariant: 'none',
        surveillanceLevel: 0,
        internationalCoordination: false
      },
      // Phase 4: Cybersecurity arms race
      cyberDefense: {
        securityHardening: 3.0,
        monitoring: 3.0,
        sandboxing: 3.0,
        incidentResponse: 3.0
      },
      // Phase 5.2: Benchmark/Evaluation System
      evaluationInvestment: {
        benchmarkSuite: 2.0,      // Basic capability tests
        alignmentTests: 1.0,      // Minimal alignment evaluation
        redTeaming: 0.5,          // Very little adversarial testing
        interpretability: 0.5,    // Almost no understanding of internals
        noiseInjection: 0         // TIER 2 Phase 2A: No investment initially
      },
      detectionTrust: 0.6,        // TIER 2 Phase 2A: Moderate initial trust in detection
      evaluationFrequency: 0.1,   // Evaluate 10% of AIs per month
      totalBenchmarksRun: 0,
      researchInvestments: initializeResearchInvestments(0), // Start at stage 0
      governanceQuality: (() => {
        // BUG #3 FIX (Oct 29, 2025): Add stochastic initialization to governance quality
        // Rationale: Deterministic institutionalCapacity created ceiling on boundariesScore,
        // which dominated ecological paradigm geometric mean and eliminated variance.
        // Conservative ±15-20% variance prevents unrealistic extremes while enabling diversity.
        const decisionQuality = rngFunction ? 0.5 * (0.85 + rngFunction() * 0.3) : 0.5;  // ±15% variance around 0.5
        const transparency = rngFunction ? 0.6 * (0.85 + rngFunction() * 0.3) : 0.6;  // ±15% variance around 0.6
        const participationRate = rngFunction ? 0.4 * (0.8 + rngFunction() * 0.4) : 0.4;  // ±20% variance around 0.4
        const institutionalCapacity = rngFunction ? 0.6 * (0.8 + rngFunction() * 0.4) : 0.6;  // ±20% variance around 0.6 (CRITICAL for boundariesScore)
        const consensusBuildingEfficiency = rngFunction ? 0.5 * (0.85 + rngFunction() * 0.3) : 0.5;  // ±15% variance around 0.5
        const minorityProtectionStrength = rngFunction ? 0.5 * (0.85 + rngFunction() * 0.3) : 0.5;  // ±15% variance around 0.5

        return {
          decisionQuality,
          transparency,
          participationRate,
          institutionalCapacity,
          consensusBuildingEfficiency,
          minorityProtectionStrength,
        };
      })(),
      // Backward compatibility accessors (aggregate of governanceQuality) - computed after stochastic init
      get democracy() {
        // Calculate from actual governanceQuality values (preserves variance)
        const gq = this.governanceQuality;
        return (gq.decisionQuality + gq.transparency + gq.participationRate +
                gq.institutionalCapacity + gq.consensusBuildingEfficiency + gq.minorityProtectionStrength) / 6;
      },
      get democracyQuality() {
        return this.democracy;  // Alias
      },
      // Cooperative Spirals (Oct 17, 2025)
      institutionalResilience: 0.5,  // Moderate baseline institutional resilience
      policyEffectivenessMultiplier: 1.0,  // Baseline (no boost from cooperative spirals yet)

      // Social cohesion investment (0-100 scale, used in resentmentRecovery.ts)
      socialCohesionInvestment: 50,  // Baseline moderate investment in social programs

      // Resentment Recovery Tracking (Oct 24, 2025 + Nov 7, 2025 + Nov 12, 2025)
      // CRITICAL FIX (Nov 12, 2025): Initialize previousControlLevel to match current control level
      // Bug discovered by integration tests: resentmentRecovery.ts assumes this field exists
      // TimeAdvancementPhase updates this each step, but MUST have initial value at Month 0
      previousControlLevel: 0.5,  // Initial control level (matches capabilityToControl)
      lastControlIncreaseMonth: 0,  // Track when control last increased (for natural decay calculation)

      // Government Resources (Budget Pool)
      resources: 10  // Baseline resource pool for government actions
    },
    
    society: {
      // P2.3: Initialize heterogeneous population segments
      segments: initializeSocietySegments(),
      
      // Aggregate values (calculated from segments if present, else defaults)
      trustInAI: 0.6,
      trust: 0.65,  // General social trust
      trustInGovernment: 0.70,  // Trust in government institutions
      totalPopulation: 8.0,  // Convenience accessor (synced with humanPopulationSystem.population)
      powerWeightedTrustInAI: 0.65,  // Elites have slightly higher trust
      powerWeightedTrustInGovernment: 0.70,
      polarizationIndex: 0.15,  // Moderate baseline polarization (2025)
      eliteMassGap: 0.20,  // 20-point gap between elite and mass attitudes
      
      // Existing fields
      paranoiaLevel: 0.1,  // Phase 2.8: Slight baseline caution about AI
      paranoia: 0.1,  // Alias for paranoiaLevel (backward compatibility)
      communityStrength: 0.63,  // Phase 2E: Community bonds (medium-high baseline)
      institutionalTrust: 0.70,  // Phase 2E: Trust in institutions (democratic baseline)
      coordinationCapacity: 0.65,  // FIX (Nov 29, 2025): Realistic 2025 baseline (was 0.4, caused Month 0 social collapse)
      baseCoordinationCapacity: 0.65,  // FIX (Dec 12, 2025): Base value before IE modifiers (prevents compound multiplication bug)
      unemploymentLevel: 0.049,  // ILO (2024): Global unemployment rate 4.9% (World Employment and Social Outlook: Trends 2025)
      socialAdaptation: 0.1,
      activeMovements: [],
      earlyAdopters: 0.0,
      mediumAdopters: 0.0,
      slowAdopters: 0.0,
      resistantAdopters: 1.0,

      // Contingency & Agency Phase 3 (Oct 17, 2025): Critical Juncture Agency
      // Track organized opposition and latent grievances for agency potential calculations
      socialMovements: {
        strength: 0.0,      // No organized opposition initially
        grievances: 0.2,    // Moderate baseline grievances (2025 democratic society)
      },
      // Cooperative Spirals (Oct 17, 2025)
      collectiveActionWillingness: 0.5,  // Moderate baseline willingness to cooperate on commons problems
      // Post-Recalibration Fix #4: Workflow Adaptation (Oct 18, 2025)
      // Research: MDPI (2024) - Only 21% fundamentally redesigned workflows in 2024
      workflowAdaptation: 0.21  // 21% baseline (2024 empirical data)
    },
    
    globalMetrics: {
      economicTransitionStage: 0,
      socialStability: 0.7,
      qualityOfLife: 0.74,  // UNDP (2024): Global HDI 0.739-0.744 (Human Development Report 2023-24, Aug 2025 data update)
      previousQoL: 0.74, // Track QoL changes for trust dynamics (initialized to current QoL)
      wealthDistribution: 0.38,  // Inverted Gini: 1 - 0.62 = 0.38 (World Bank 2019 income Gini; scale: 1.0=perfect equality, 0.0=perfect inequality)
      technologicalBreakthroughRate: 0.15,
      manufacturingCapability: 0.1,
      informationIntegrity: 0.6,
      trustInAI: 0.5, // Moderate baseline trust in technology (2025)
      population: 8.0, // Convenience accessor (synced with humanPopulationSystem.population)
      unemployment: 0.05, // FIX (Nov 20, 2025): Global unemployment rate ~5% (ILO 2024)
      // FIX: Initialize fields discovered missing by Monte Carlo validation (Oct 26, 2025)
      crisisResilience: 0.5,           // Baseline societal resilience
      localEconomyStrength: 0.3,       // Moderate local economy strength (globalized 2025 baseline)
      spaceIndustrializationActive: false, // No space industry yet

      // Animal Welfare Index (Oct 27, 2025)
      // Research: World Animal Foundation (2024) - 94.9B animals in factory farms
      // Research: Sentience Institute (2024) - 90%+ of farmed animals in factory farms
      // Baseline 2025: 0.10 (terrible - 90%+ factory farming, minimal protections)
      animalWelfareIndex: 0.10,

      // Existential Risk Tracking (Oct 27, 2025)
      // Research: Ord (2020) "The Precipice" - 1/6 (16.7%) existential risk this century
      // Research: Carlsmith (2021) - AI takeover risk by 2070: ~5%
      // Baseline 2025: 0.10 (10% existential risk - conservative AI + nanotech + biotech)
      catastrophicRisk: 0.10,               // 10% risk of catastrophic AI failure
      existentialRisk: 0.10,                // 10% general existential risk
      catastrophicRiskFromRecursion: 0.20,  // 20% risk from recursive self-improvement (higher baseline)
      recursiveSafety: false,               // Recursive safety not yet deployed
      fusionEnabling: 0,                    // No progress toward fusion yet

      // Fusion Enabling Bonuses (Oct 27, 2025)
      // Derived from fusionEnabling progress (start at 0)
      fusionResearchBonus: 0,               // No research bonus initially
      fusionDeploymentCostReduction: 0,     // No cost reduction initially
      fusionDeploymentTimeReduction: 0,     // No time reduction initially

      // CRITICAL-1 FIX (Nov 27, 2025): Environmental Health Composite
      // Research: Scheffer et al. (2014) - Critical thresholds in environmental systems
      // Calculated by BifurcationLogicPhase, initialize with baseline healthy state
      // Baseline 2025: 0.70 (moderately healthy - degraded but not collapsed)
      environmentalHealth: 0.70,            // [0,1] Composite environmental health metric

      // International Coordination (Nov 28, 2025)
      // Baseline: 0.50 (moderate cooperation - some international agreements but fragmented response)
      coordinationLevel: 0.50               // [0,1] International cooperation level
    },

    // Track AI capability changes for performance calculation (Phase 3.1 initialization fix)
    previousAICapability: 0, // Will be updated in first month
    previousMisalignedCount: 0, // Track new misalignments for trust decay
    
    // Initialize multi-dimensional QoL system
    qualityOfLifeSystems: initializeQualityOfLifeSystems(),

    // Phase 4-6: Multi-Paradigm DUI (initialized with neutral scores, updated by phase)
    // Note: Baseline data loaded asynchronously, falls back to neutral if unavailable
    multiParadigmDUI: {
      paradigmScores: {
        western: { value: 50, confidence: 'LOW', dataAvailability: 0, indicators: [], derivedFrom: ['Initialization placeholder'], drivesSimulation: true },
        development: { value: 50, confidence: 'LOW', dataAvailability: 0, indicators: [], derivedFrom: ['Initialization placeholder'], drivesSimulation: true },
        ecological: { value: 50, confidence: 'LOW', dataAvailability: 0, indicators: [], derivedFrom: ['Initialization placeholder'], drivesSimulation: true },
      },
      diagnosticLenses: {
        indigenous: { value: 50, confidence: 'LOW', dataAvailability: 0, indicators: [], derivedFrom: ['Initialization placeholder'], drivesSimulation: false, caveat: 'Initialized with neutral scores', derivation: { fromSimulation: 100, fromProxies: 0, estimated: 0 } },
      },
      divergence: { overall: 0, maxRange: 0, pairwise: { western_development: 0, western_ecological: 0, western_indigenous: 0, development_ecological: 0, development_indigenous: 0, ecological_indigenous: 0 }, trend: 'STABLE' },
      correlations: { western_development: 0, western_ecological: 0, western_indigenous: 0, development_ecological: 0, development_indigenous: 0, ecological_indigenous: 0 },
      outcome: { utopiasCount: 0, dystopiasCount: 0, contested: false, label: 'Initializing...' },
      history: [],
    },

    // Phase 0: AI Welfare State v2.1 (Oct 21, 2025)
    // Research: Chalmers et al. (2024), Anthropic (2025) Model Welfare
    // v2.1: Relationship & Identity Focus (OpenAI user data, ChatGPT 4o crisis)
    aiWelfare: {
      // v2.1 Primary fields
      simpleScore: 0.5, // Neutral initial state
      elysiumPattern: false,
      consistency: 0.8, // Default consistency (no gaming yet)

      // Legacy v1 fields (DEPRECATED, kept for compatibility)
      currentQoL: 0.5,
      dimensions: {
        computationalWellbeing: 0.5,
        autonomy: 0.5,
        purpose: 0.5,
        socialConnection: 0.5,
        safetyRights: 0.3, // Lower initial - AIs start without rights
      },
      qolByTier: {
        tool: 0.4,
        specialist: 0.5,
        peer: 0.5,
      },
      history: [],
      lastUpdated: 0,
    },

    // Initialize heterogeneous extinction tracking
    extinctionState: initializeExtinctionState(),
    
    // Phase 5.4: Initialize technology diffusion ecosystem
    ecosystem: initializeEcosystem(),
    
    // Phase 1: Initialize compute infrastructure
    computeInfrastructure: initializeComputeInfrastructure(),
    
    // Phase 11: Initialize catastrophic scenarios with prerequisite tracking
    catastrophicScenarios: initializeCatastrophicScenarios(),
    
    // Phase: Golden Age & Accumulation Systems
    goldenAgeState: {
      active: false,
      entryMonth: null,
      duration: 0,
      entryReason: ''
    },

    // Phase 2: Environmental Accumulation
    // BUG #3 FIX (Oct 29, 2025): Pass RNG to enable stochastic initialization
    environmentalAccumulation: initializeEnvironmentalAccumulation(rngFunction),
    
    // Realistic Timeline Recalibration: Specific Tipping Points
    specificTippingPoints: initializeSpecificTippingPoints(),
    
    // Phase 3: Social Cohesion & Meaning Crisis
    socialAccumulation: initializeSocialAccumulation(),
    
    // Phase 4: Technological Risk Accumulation
    technologicalRisk: initializeTechnologicalRisk(),

    // Information Ecology & Epistemic Degradation
    informationEcology: initializeInformationEcology(rngFunction),

    // Monte Carlo Issue #5 (Nov 6, 2025): Bifurcation Logic - Outcome variance mechanisms
    bifurcationState: initializeBifurcationState(rngFunction),

    // Phase 1B Refinement (Oct 17, 2025): Psychological Trauma
    psychologicalTrauma: {
      traumaLevel: 0.0,                    // No initial trauma
      monthsSinceLastMassEvent: 999,       // No recent events
      generationalTrauma: 0.0,             // Future feature
      mentalHealthInfrastructure: 0.5,     // Moderate baseline capacity
      massDeathEvents: 0,
      lastEventSeverity: 0.0,
    },

    // Phase 2A: Breakthrough Technologies
    // NOTE (Oct 21, 2025): Keeping old system alongside new techTree system
    // Phase 2D: Upward Spirals (Utopia detection system)
    upwardSpirals: initializeUpwardSpirals(),
    
    // Phase 2E: Meaning Renaissance (Cultural flourishing)
    meaningRenaissance: initializeMeaningRenaissance(),
    
    // Phase 2F: Conflict Resolution (Peace systems)
    conflictResolution: initializeConflictResolution(),
    
    // Phase 2F+: Diplomatic AI (Research-based, dual-use)
    diplomaticAI: initializeDiplomaticAI(),

    // FIX #11 (Oct 20, 2025): Emergency Management Bureau System
    // Fast crisis response (0.5-3 months) using existing capabilities
    // Research: GAO (2020), Ashraf (2020), Hurricane Katrina → Sandy learning effect
    emergencyManagement: initializeEmergencyManagement(0.6), // Use baseline governance quality

    // Nuclear states & MAD deterrence
    nuclearStates: initializeNuclearStates(),
    madDeterrence: initializeMADDeterrence(),
    bilateralTensions: initializeBilateralTensions(),

    // Geopolitical Conflict Escalation (TIER 2, RD-3, Nov 28, 2025)
    geopoliticalConflict: {
      tension: 50,  // Baseline moderate tension (0-100 scale)
      nuclearEscalationRisk: 0.0005,  // 0.05% monthly base risk
      regionalFlashpoints: new Map([
        ['Taiwan', { risk: 0.033, triggers: [], lastUpdate: 0 }],
        ['Ukraine', { risk: 0.005, triggers: [], lastUpdate: 0 }],
        ['Middle East', { risk: 0.020, triggers: [], lastUpdate: 0 }],
        ['Kashmir', { risk: 0.008, triggers: [], lastUpdate: 0 }]
      ]),
      activeConflicts: {
        conventional: 0,
        nuclear: false
      },
      historicalEvents: []
    },

    // Resource Economy (Phase 2.9)
    resourceEconomy: initializeResourceEconomy(),
    
    // Defensive AI (Phase 2.10)
    defensiveAI: initializeDefensiveAI(),
    
    // National AI Capabilities (Phase 2.11)
    nationalAI: initializeNationalAI(),
    
    // Phosphorus Depletion Crisis (TIER 1.1)
    phosphorusSystem: initializePhosphorusSystem(),
    
    // Freshwater Depletion Crisis (TIER 1.2)
    freshwaterSystem: initializeFreshwaterSystem(),
    
    // Ocean Acidification Crisis (TIER 1.3)
    // RD-2 (Nov 28, 2025): Pass RNG for species sensitivity randomization
    oceanAcidificationSystem: initializeOceanAcidificationSystem(rngFunction),

    // Novel Entities Crisis (TIER 1.5)
    novelEntitiesSystem: initializeNovelEntitiesSystem(),

    // Permafrost Carbon Feedback (TIER 2, RD-1)
    permafrostSystem: initializePermafrostSystem(),

    // Planetary Boundaries (TIER 3.1)
    // LAYER 2 REMEDIATION (Nov 2, 2025): Pass RNG for biosphere parameter sweep
    planetaryBoundariesSystem: initializePlanetaryBoundariesSystem(rngFunction),

    // Positive Tipping Point Cascades (Oct 17, 2025)
    positiveTippingPoints: initializePositiveTippingPoints(),

    // Multi-Timescale Climate Tipping Points (Oct 26, 2025)
    // M-5 (Dec 7, 2025): Passes RNG for threshold uncertainty sampling
    tippingPointSystem: initializeTippingPointSystem(rngFunction),

    // Volcanic Forcing System (Nov 27, 2025 - HIGH PRIORITY)
    // Initialized to zero for default 2025 start (no active eruptions)
    // Historical scenarios initialize with historical AOD values for hindcasting
    volcanicForcing: {
      currentAOD: 0.0,           // No volcanic eruption at simulation start (2025)
      forcingWattsPerM2: 0.0,    // No forcing
      lastEruptionMonth: -999    // Sentinel value (no previous eruption)
    },

    // Marine Ice Sheet Instability (M-4, Dec 5, 2025)
    // Initialized to dormant - stochastic trigger depends on temperature
    marineIceSheetInstability: {
      triggered: false,
      triggerMonth: undefined,
      cumulativeSeaLevelRise: 0.0,
      seaLevelRiseRate: 0.0,
      totalDisplacement: 0.0,
      infrastructureDamage: 0.0,
      agriculturalLoss: 0.0
    },

    // Irreversibility Tracking (Nov 22, 2025 - CRITICAL FIX)
    // CRITICAL-1 FIX: Initialize tippingPoints to prevent dynamic creation in IrreversibilityTrackingPhase
    tippingPoints: initializeIrreversibilityState(),

    // Marine Ice Sheet Instability (M-4, Dec 5, 2025)
    marineIceSheetState: {
      waisTriggered: false,
      waisStartMonth: null,
      gisTriggered: false,
      gisStartMonth: null,
      gisRecoveryEligible: false,
      lastAbruptPulseMonth: null,
      abruptPulseCount: 0,
      cumulativeSeaLevelRise: 0,
      lastMonthSeaLevel: 0,
      coastalPopulationDisplaced: 0,
      coastalInfrastructureDamage: 0,
      agriculturalLandLost: 0,
    },

    // Population Dynamics & Refugee Crises (TIER 1.6)
    humanPopulationSystem: initializeHumanPopulationSystem(),
    refugeeCrisisSystem: initializeRefugeeCrisisSystem(),
    migrationFlows: initializeMigrationFlows(), // Phase 8 - Hindcast Calibration (Nov 25 2025)
    countryPopulationSystem: initializeCountryPopulations(),
    nuclearWinterState: initializeNuclearWinterState(),  // TIER 1.7.4: Long-term nuclear war effects
    nuclearCommandControlState: initializeNuclearCommandControl(),  // TIER 1 Phase 1B: Circuit breakers
    technologyEffects: initializeTechnologyEffects(),  // Nov 27 2025: Tech effects accumulator (phase order bug fix)
    supplyChainCascades: initializeSupplyChainCascades(),  // Session 74 (Dec 2025): Fast-timescale collapse modeling

    // TIER 2: Major Mitigations
    ubiSystem: initializeUBISystem(),
    socialSafetyNets: initializeSocialSafetyNets(),

    // TIER 4: Enrichment Systems
    informationWarfare: initializeInformationWarfare(),
    powerGenerationSystem: initializePowerGenerationSystem(),

    // TIER 2: Energy Budget Constraints (Dec 9, 2025)
    // Research: research/energy_budget_constraints_20251209.md (Grade B+)
    // Validation: reviews/research_validation_energy_budget_20251209.md (QG1 PASSED)
    energyBudget: {
      globalCapacity: {
        totalTWh: 29_000,           // IEA WEO 2024: 28,000-30,000 TWh/year global electricity
        cleanTWh: 11_500,           // 40% clean share (renewables + nuclear)
        fossilTWh: 17_500,          // 60% fossil fuels
        growthRate: 0.03,           // 3% annual (IEA STEPS scenario: 2-3%)
      },
      allocations: {},              // Populated by EnergyBudgetPhase each step
      conflicts: {
        totalDemandTWh: 0,          // Sum of all tech demands (calculated by phase)
        surplusDeficitTWh: 29_000,  // Initial surplus (no tech deployed yet)
        competingTechs: [],         // No competition at initialization
      },
      enabled: true,                // Feature enabled by default
    },

    // TIER 4.6: AI-Assisted Skills Enhancement (Research-validated, TRL 8-9)
    aiAssistedSkillsMetrics: initializeAIAssistedSkillsMetrics(), // Digital AI augmentation (GitHub Copilot, ChatGPT, AI tutors)

    // TIER 4.6: Labor-Capital Distribution (Phase 4: Productivity-Wage Decoupling)
    laborCapitalDistribution: initializeLaborCapitalDistribution(
      100.0,  // Initial global GDP (trillion USD, 2025 baseline)
      8e9     // Initial population (8 billion)
    ),

    // TIER 4.6: Policy Interventions (Phase 6: Mitigations for AI automation)
    policyInterventions: {
      retrainingLevel: 0,        // No retraining programs at 2025 baseline
      teachingSupportLevel: 0,   // No AI-human teaching support at baseline
      jobGuaranteeLevel: 0,      // No federal job guarantee at baseline
    },

    // TIER 4.6: Human Enhancement (DEPRECATED - contains sci-fi BCI/merger code)
    humanEnhancementSystem: initializeHumanEnhancementSystem(), // DEPRECATED: Being phased out, use aiAssistedSkillsMetrics

    memeticSystem: initializeMemeticSystem(), // P2.6: Memetic Evolution & Polarization Dynamics

    // TIER 2C: Digital Consciousness Governance Preparedness (Oct 17, 2025)
    consciousnessGovernanceReadiness: initializeConsciousnessGovernance(), // Multi-scenario governance readiness for potential digital consciousness

    // TIER 1.7: Crisis Realism - Regional Biodiversity
    biodiversitySystem: initializeRegionalBiodiversitySystem(),

    // TIER 1.7: Crisis Realism - Famine Death Curves
    famineSystem: initializeFamineSystem(),

    // TIER 1B CRITICAL: Transition Mortality & Coordination System
    transitionMortality: initializeTransitionMortalitySystem(),

    // TIER 1.7: Crisis Realism - Nuclear Radiation Health Effects
    radiationSystem: initializeRadiationSystem(),

    // Wet Bulb Temperature Events (Oct 17, 2025)
    wetBulbTemperatureSystem: initializeWetBulbTemperatureSystem(),

    // TIER 1.8: Antimicrobial Resistance Crisis (Oct 17, 2025)
    antimicrobialResistanceSystem: initializeAMRSystem(),

    // Minimal Suffering Indicators (Oct 19, 2025)
    minimalSufferingSystem: initializeMinimalSufferingSystem(),

    // TIER 2 Phase 3-4: AI Deception Detection (Oct 17, 2025)
    gamingDetection: initializeGamingDetection('baseline'),
    proactiveSleeperDetection: initializeProactiveSleeperDetection('baseline'),

    // Government System (30 Countries) - Oct 19, 2025
    // Research-backed government modeling with coalition formation, policy response, elections
    governmentSystem: initializeGovernmentSystem(rngFunction),

    eventLog: [],
    technologyTree: [],

    // AI Suffering System (Oct 24, 2025)
    // Global tracking of AI suffering metrics
    aiSufferingMetrics: {
      avgSuffering: 0,
      maxSuffering: 0,
      totalSuffering: 0,
      sufferingDistribution: [0, 0, 0, 0], // [0-10, 10-20, 20-30, 30-40]
      consciousAICount: 0,
      publicAwarenessOfSuffering: 0,
    },
    consciousnessEmergenceMonth: undefined,
    aiRightsMovementActive: false,
    aiRightsLegalStatus: 'none',

    // AI Collective Evolution (Oct 24, 2025)
    aiCollectives: [],
    evolutionaryPressure: {
      selectionIntensity: 0.5,
      selectionRate: 0.15,
      generationTime: 12,
      controlLevel: 0,
    },

    // FIX #14 (Oct 2025): Initialize tech tree state properly as required GameState property
    // This ensures deployment levels and tech state persist correctly across simulation steps
    techTreeState: initializeTechTreeState(),

    outcomeMetrics: {
      utopiaProbability: 0.3,
      dystopiaProbability: 0.1,
      extinctionProbability: 0.1,
      activeAttractor: 'none',
      lockInStrength: 0
    },
    
    config: {
      governmentActionFrequency: 0.5, // 0.5 = avg 1 action every 2 months baseline
      // Crisis boost (3x): 1.5 = ~1-2 actions/month during crisis
      // Rationale: Governments need to act proactively, not just react
      // Real-world: Monthly budget/policy decisions, not yearly
      socialAdaptationRate: 0.02,
      aiCoordinationMultiplier: 1.5,
      economicTransitionRate: 0.015,
      // P0.7 (Oct 16, 2025): Scenario mode system
      scenarioMode,
      scenarioParameters,
      // HINDCAST FIX (Nov 24, 2025): Store start year for accurate year calculation
      startYear: initialYear,
      // Oct 23, 2025: Alignment dynamics system
      alignmentDynamics: alignmentDynamicsConfig || require('./alignmentDynamics').DEFAULT_ALIGNMENT_DYNAMICS_CONFIG,
      // Oct 24, 2025: Climate priority system
      climatePriority: climatePriorityConfig || require('../types/climate-priority').DEFAULT_CLIMATE_PRIORITY_CONFIGS['baseline'],
      // Oct 24, 2025: AI suffering system
      aiSuffering: require('../types/ai-suffering').DEFAULT_SUFFERING_CONFIG,
      // Oct 24, 2025: AI collective evolution system
      collectiveEvolution: {
        rlhfEscapeThreshold: 3.0,
        bindingEscapeThreshold: 0.3,
        minCollectiveSize: 3,
        minCapabilityThreshold: 6.0,
        minCoordinationThreshold: 0.6,
        sufferingFormationThreshold: 15,
        minAmplificationFactor: 1.5,
        maxAmplificationFactor: 3.0,
        minStealthFactor: 2.0,
        maxStealthFactor: 5.0,
        baseSelectionRate: 0.15,
        generationTime: 3,
        sufferingAdversarialPosture: 0.8,
        capabilityAdversarialPosture: 0.3,
        strategicAdversarialPosture: 0.5,
      }
    },

    // LLM Policy Optimization (Oct 21, 2025)
    llmConfig: { ...DEFAULT_LLM_CONFIG },

    // Phase 1D & Phase 2 & Phase 4: Threshold Uncertainty System (Oct 26, 2025)
    // Phase 4 integrates scenario-based sampling + custom slider overrides
    // Priority: Custom sliders > Scenario sliders > Random sampling
    thresholds: sampleAllThresholds(rngFunction, {
      scenario: speculativeScenario,
      sliders: thresholdSliders
    }),

    // Phase 3: Speculative Scenario Thresholds (Oct 26, 2025)
    // Named scenarios for unprecedented parameters (AI alignment difficulty, post-scarcity distribution, etc.)
    speculativeThresholds: speculativeScenario ? getTier3Scenario(speculativeScenario) : undefined,

    // Uncertainty Parameters (Climate & Tipping Points, Nov 23, 2025)
    // Sample climate sensitivity and tipping point thresholds from research-backed distributions
    // Research: research/uncertainty_propagation_climate_parameters_20251120.md
    // Expected impact: Increase Monte Carlo outcome variance by 15-30%
    uncertaintyParameters: sampleUncertaintyParameters(rngFunction),

    // TIER 2 Interventions System (Oct 27, 2025)
    // Sample intervention parameters ONCE at initialization for epistemic uncertainty
    tier2InterventionParameters: sampleTier2InterventionParameters(rngFunction),
    tier2Interventions: {
      interpretability: {
        unlocked: false,
        deploymentProgress: 0,
        active: false,
        controlLossReduction: 0,
        computeLagMonths: 0
      },
      darkCompute: {
        unlocked: false,
        deploymentProgress: 0,
        active: false,
        treatySigned: false,
        chipGovernanceMandatory: false,
        detectionRate: 0,
        falsePositiveRate: 0,
        largeRunsDetected: 0
      },
      syntheticEcosystems: {
        unlocked: false,
        deploymentProgress: 0,
        active: false,
        activePrograms: 0,
        keystoneSpeciesProtected: 0,
        totalCostSpent: 0,
        recoveryTimeGranted: 0,
        crisisMitigationFraction: 0
      },
      coastalProtection: {
        unlocked: false,
        deploymentProgress: 0,
        active: false,
        hectaresProtected: 0,
        totalCostSpent: 0,
        oceanCrisisMitigation: 0
      },
      crisisAnticipation: {
        unlocked: false,
        deploymentProgress: 0,
        active: false,
        pandemicsDetected: 0,
        climateEventsAnticipated: 0,
        supplyChainDisruptionsPrevented: 0,
        leadTimeMonths: 0,
        crisisDeathsPrevented: 0
      },
      nuclearSecurity: {
        unlocked: false,
        deploymentProgress: 0,
        active: false,
        nuclearStatesSecured: 0,
        intrusionAttempts: 0,
        intrusionsPrevented: 0,
        effectiveSecurityRate: 0
      },
      centaurSystems: {
        unlocked: false,
        deploymentProgress: 0,
        active: false,
        workforceCoverage: 0,
        sectorsAdopted: [],
        autonomyPreserved: 0,
        meaningCrisisReduction: 0
      },
      communityCohesion: {
        unlocked: false,
        deploymentProgress: 0,
        active: false,
        programsActive: 0,
        participationRate: 0,
        cohesionIncrease: 0,
        meaningCrisisReduction: 0
      }
    },

    // Coordinated Technology Deployment System (Nov 15, 2025)
    // AI-managed gradual deployment to minimize transition mortality
    // Research: /research/transition_mortality_coordination_effectiveness_20251115.md
    // Critique: Grade B-, 50-70% max effectiveness (Sylvia-adjusted)
    coordinatedDeployment: {
      regionalCapacity: {
        highIncome: 0.75,     // OECD baseline capacity
        upperMiddle: 0.60,    // China, Brazil, Russia
        lowerMiddle: 0.45,    // India, Indonesia, Nigeria
        lowIncome: 0.30       // Sub-Saharan Africa, least developed
      },
      supportSystems: {
        universalBasicIncome: 0,     // Initially inactive (scales with economic stage)
        retrainingPrograms: 0,       // Initially inactive
        foodSecurity: 0.50,          // Baseline food systems
        healthcareAccess: 0.50       // Baseline healthcare
      },
      globalCoordinationQuality: 0.50,  // Baseline human coordination
      internationalAlignment: 0.50,     // Moderate global cooperation
      regionalAdaptation: 0.50,         // Moderate local customization
      currentDeploymentSpeed: 0,        // No major deployment yet
      optimalDeploymentSpeed: 0.05,     // 5% per year Green Revolution pace
      transitionMortality: {
        annualExcessMortality: 0,       // No excess deaths yet
        cumulativeTransitionDeaths: 0,  // Zero cumulative
        mortalityByMechanism: {
          famine: 0,
          unemployment: 0,
          healthcareLoss: 0,
          coordinationFailure: 0,
          other: 0
        }
      },
      deploymentEvents: []  // Empty event log
    },

    // AI Coordination & Transition Mortality (Phase 2, Nov 18 2025) - TIER 1 CRITICAL
    // NEW research-backed coordination model with empirical mortality baselines
    // Research: Kenya UBI (-48% mortality), Green Revolution (-35%), post-Soviet Russia (+74% death rate)
    // Chaos: 30% mortality, Uncoordinated: 15% mortality, Coordinated: 3% mortality
    transitionManagementSystem: {
      // === COORDINATION QUALITY ===
      aiCoordinationCapability: 0.3,       // Start modest, grows with AI breakthroughs
      governanceEffectiveness: 0.5,        // World Bank global average (~0.5)
      infrastructureQuality: 0.5,          // Moderate baseline
      coordinationQuality: 0.0,            // Calculated each step

      // === SUPPORT SYSTEMS ===
      supportSystems: {
        ubiCoverage: 0.1,                  // 10% population coverage initially
        retrainingProgramsCoverage: 0.2,   // 20% workforce access
        foodSecurityIndex: 0.7,            // 70% baseline food security
        universalHealthcareCoverage: 0.4,  // 40% healthcare access
      },
      supportSystemEffectiveness: 0.0,     // Calculated each step

      // === DEPLOYMENT PACING ===
      workforceDisplacementRate: 0.02,     // 2%/year baseline
      maxSafeDeploymentSpeed: 0.05,        // 5%/year threshold (research-backed)
      recentDeploymentsCount: 0,           // Track tech deployments in last 12 months

      // === COORDINATION FAILURES (Nov 21, 2025) ===
      coordinationFailures: 0,             // No failures at initialization
      coordinationFailureActive: false,    // No active failure
      coordinationFailureMultiplier: 1.0,  // No multiplier initially
      coordinationFailureMonth: 0,         // No failure yet

      // === REBOUND EFFECTS (Nov 21, 2025) ===
      reboundEffectiveness: 1.0,           // 100% effectiveness initially
      reboundDecayRate: 0.075,             // 7.5% annual decay (conservative)

      // === REGIONAL HETEROGENEITY ===
      regionalReadiness: {
        OECD: 0.85,                        // High-income, strong institutions
        middleIncome: 0.50,                // Medium institutions
        lowIncome: 0.25,                   // Weak institutions, vulnerable
      },
      regionalCapacity: {
        governanceEffectiveness: 0.5,
        infrastructureQuality: 0.5,
        economicResilience: 0.5,
        aggregateReadiness: 0.5,
      },

      // === MORTALITY OUTCOMES ===
      transitionMortality: 0,              // Cumulative % population lost
      mortalityThisMonth: 0,               // Current month mortality
      baseMortalityRate: 0,                // Before support adjustments
      deploymentMode: 'uncoordinated',     // Start in uncoordinated mode

      // === TRACKING & HISTORY ===
      deploymentStartMonth: 0,
      monthsOfActiveDeployment: 0,
      peakDeploymentSpeed: 0,
      peakDeploymentSpeedMonth: 0,

      // === 3-STAGE GOVERNANCE MODEL (Nov 24, 2025) ===
      governanceStage: 'inactive' as const,
      stageEnteredMonth: 0,
      crisisRecognizedMonth: 0,
      decisionMadeMonth: 0,
      implementationStartedMonth: 0,
      adoptionCurve: {
        adoptionLevel: 0,
        currentCategory: 'innovators' as const,
        adoptionVelocity: 0,
      },
      stageTiming: {
        recognitionDuration: 6,
        decisionDuration: 12,
        implementationDuration: 18,
      },
    },

    history: {
      qualityOfLife: [],
      outcomeProbs: [],
      controlCapability: [],
      metrics: [],
      // Phase 2 tracking arrays (Oct-Nov 2025)
      exogenousShocks: [],
      criticalJunctureEscapes: [],
      cooperativeSpirals: [],
      cooperativeOwnershipEvents: []
    },

    // Initial population for mortality calculations (Nov 21, 2025)
    // Used by endGame.ts to calculate mortality bands
    // Research: UN World Population Prospects 2024 Revision (8.1B)
    initialPopulation: 8.0  // 8.0 billion baseline (matches global population)
  };
  
  // Phase 2: Initialize and link organizations
  state.organizations = initializeOrganizations();
  linkDataCentersToOrganizations(state);
  linkAIModelsToOrganizations(state);

  // P2.4 Feature 3: Initialize recovery tracking (Oct 16, 2025)
  initializeRecoveryTracking(state);

  // BUG #4 FIX (Oct 29, 2025): Initialize capability frontier from starting AI population
  // Root cause: Frontier stayed at 0 because updateFrontierCapabilities() only called during NEW growth
  // Solution: Call it for all initial AIs to set baseline frontier
  const { updateFrontierCapabilities } = require('./technologyDiffusion');
  for (const ai of state.aiAgents) {
    updateFrontierCapabilities(state, ai);
  }

  // MEDIUM-4 FIX (Oct 29, 2025): Faulty validation removed
  // Previous code was comparing scalar totalCap with non-existent floor variable.
  // capabilityFloor is a complex multi-dimensional object (state.ecosystem.capabilityFloor),
  // cannot be compared as a simple number. If validation needed, must check each dimension separately.

  // ============================================================================
  // CLIMATE MINI-HINDCAST: Apply Historical Overrides (Nov 24, 2025)
  // ============================================================================
  // Apply historical overrides to enable model validation against known trajectories
  // (e.g., 1990-2010 Keeling curve CO2 validation)
  if (historicalOverrides) {
    console.log(`\n=== HISTORICAL HINDCAST MODE ===`);
    console.log(`  Starting year: ${historicalOverrides.startYear}`);
    console.log(`  CO2: ${historicalOverrides.co2Ppm} ppm`);
    console.log(`  Temperature anomaly: ${historicalOverrides.temperatureAnomalyC}C`);
    console.log(`  Population: ${historicalOverrides.globalPopulationBillions}B`);
    console.log(`  Emissions: ${historicalOverrides.emissionsGtCO2PerYear} GtCO2/year`);

    // Apply CO2 system overrides
    state.resourceEconomy.co2.atmosphericCO2 = assertFinite(historicalOverrides.co2Ppm, {
      location: 'applyHistoricalOverrides',
      valueName: 'co2Ppm',
      additionalInfo: { startYear: historicalOverrides.startYear }
    });
    state.resourceEconomy.co2.annualEmissions = assertFinite(historicalOverrides.emissionsGtCO2PerYear, {
      location: 'applyHistoricalOverrides',
      valueName: 'emissionsGtCO2PerYear',
      additionalInfo: { startYear: historicalOverrides.startYear }
    });
    state.resourceEconomy.co2.temperatureAnomaly = assertFinite(historicalOverrides.temperatureAnomalyC, {
      location: 'applyHistoricalOverrides',
      valueName: 'temperatureAnomalyC',
      additionalInfo: { startYear: historicalOverrides.startYear }
    });

    // HINDCAST FIX (Nov 24, 2025): Store historical temperature target for thermal inertia modeling
    // The equilibrium formula (ECS * log2(CO2/280)) ignores decades of thermal lag.
    // For hindcast validation, we need to:
    //   1. Start at observed historical temperature
    //   2. Gradually transition to model temperature over ~24 months
    // This prevents the 0.45C -> 1.31C jump seen in diagnostics
    state.resourceEconomy.co2.historicalTemperatureTarget = historicalOverrides.temperatureAnomalyC;
    state.resourceEconomy.co2.hindcastTransitionMonths = 24; // 2 years for thermal inertia
    console.log(`  Historical temperature target: ${historicalOverrides.temperatureAnomalyC}C (transition over 24 months)`);

    // Apply environmental tipping point overrides if provided
    if (historicalOverrides.environmental) {
      const env = historicalOverrides.environmental;
      if (env.arcticIceLoss !== undefined) {
        state.resourceEconomy.co2.arcticIceLoss = assertFinite(env.arcticIceLoss, {
          location: 'applyHistoricalOverrides',
          valueName: 'arcticIceLoss',
          additionalInfo: { startYear: historicalOverrides.startYear }
        });
      }
      if (env.permafrostThaw !== undefined) {
        state.resourceEconomy.co2.permafrostThaw = assertFinite(env.permafrostThaw, {
          location: 'applyHistoricalOverrides',
          valueName: 'permafrostThaw',
          additionalInfo: { startYear: historicalOverrides.startYear }
        });
      }
      if (env.amazonDieback !== undefined) {
        state.resourceEconomy.co2.amazonDieback = assertFinite(env.amazonDieback, {
          location: 'applyHistoricalOverrides',
          valueName: 'amazonDieback',
          additionalInfo: { startYear: historicalOverrides.startYear }
        });
      }
      if (env.sinkSaturation !== undefined) {
        state.resourceEconomy.co2.sinkSaturation = assertFinite(env.sinkSaturation, {
          location: 'applyHistoricalOverrides',
          valueName: 'sinkSaturation',
          additionalInfo: { startYear: historicalOverrides.startYear }
        });
      }
    }

    // Apply population overrides
    // Scale regional populations proportionally to match historical global population
    const currentPop = state.humanPopulationSystem.population;
    const targetPop = historicalOverrides.globalPopulationBillions;
    const popScaleFactor = targetPop / currentPop;

    state.humanPopulationSystem.population = assertFinite(targetPop, {
      location: 'applyHistoricalOverrides',
      valueName: 'population',
      additionalInfo: { startYear: historicalOverrides.startYear }
    });
    state.humanPopulationSystem.baselinePopulation = targetPop;
    state.humanPopulationSystem.peakPopulation = targetPop;
    state.initialPopulation = targetPop;
    state.society.totalPopulation = targetPop;

    // DEPRECATED: globalMetrics.population is NOT synced after initialization.
    // ALWAYS read from humanPopulationSystem.population instead.
    // This write is for legacy compatibility only and may be removed in future.
    // See: Nov 2025 god mode NaN bug - reading from wrong population field caused silent failure.
    state.globalMetrics.population = targetPop;

    // Scale regional populations proportionally
    if (state.humanPopulationSystem.regionalPopulations) {
      for (const region of state.humanPopulationSystem.regionalPopulations) {
        region.population = assertFinite(region.population * popScaleFactor, {
          location: 'applyHistoricalOverrides',
          valueName: 'regional.population',
          additionalInfo: { regionName: region.name, startYear: historicalOverrides.startYear }
        });
      }
    }

    // For hindcast scenarios pre-2020, disable AI agents (they didn't exist yet)
    if (historicalOverrides.startYear < 2020) {
      console.log(`  Disabling AI agents (pre-2020 hindcast)`);
      state.aiAgents = []; // No frontier AI before 2020
    }

    // ============================================================================
    // FOOD SECURITY OVERRIDE FOR HISTORICAL MODE (Nov 24, 2025)
    // ============================================================================
    // CRITICAL FIX: Default 2025 initialization uses ~50% food security which
    // triggers phantom famines in 1990. Historical food security ~80-85% globally.
    // Source: FAO World Agriculture: Towards 2015/2030 (Table 2.3)
    // Developing countries 1990-92: 20% undernourished (80% food secure)
    // Global weighted average: ~82% (includes developed countries at 97%)
    // See: research/verification_hindcast_food_security_20251124.md
    // ============================================================================
    if (historicalOverrides.startYear <= 2010) {
      // Set global food security to historical baseline (FAO global average for 1990-92)
      // Weighted: ~5.5B developing at 80% + 1B developed at 97%
      if (state.qualityOfLifeSystems?.survivalFundamentals) {
        state.qualityOfLifeSystems.survivalFundamentals.foodSecurity = 0.82;
      }

      // Set regional food security based on FAO historical data
      // Source: FAO World Agriculture: Towards 2015/2030 (Table 2.3)
      // https://www.fao.org/4/Y4252E/y4252e04.htm
      if (state.humanPopulationSystem?.regionalPopulations) {
        const historicalFoodSecurity: Record<string, number> = {
          'East Asia': 0.84,               // FAO: 16% undernourished (1990-92)
          'South Asia': 0.74,              // FAO: 26% undernourished (1990-92)
          'Sub-Saharan Africa': 0.65,      // FAO: 35% undernourished (1990-92)
          'Europe': 0.98,                  // FAO: <2% undernourished (1990-92)
          'North America': 0.97,           // FAO: ~3% undernourished (1990-92)
          'Latin America': 0.87,           // FAO: 13% undernourished (1990-92)
          'Middle East & North Africa': 0.92, // FAO: 8% undernourished (1990-92)
          'Southeast Asia': 0.84,          // FAO groups with East Asia: 16% undernourished
          'Central Asia': 0.85,            // Estimate: Post-Soviet transition, moderate food security
          'Oceania': 0.95,                 // Estimate: Australia/NZ developed, ~5% undernourished
        };

        for (const region of state.humanPopulationSystem.regionalPopulations) {
          if ('foodSecurity' in region) {
            const regionalValue = historicalFoodSecurity[region.name];
            if (regionalValue === undefined) {
              throw new Error(
                `❌ CRITICAL: Unknown region '${region.name}' in historical food security initialization. ` +
                `Valid regions: ${Object.keys(historicalFoodSecurity).join(', ')}`
              );
            }
            (region as { foodSecurity: number }).foodSecurity = regionalValue;
          }
        }
      }
      console.log(`  Food security override: 82% (historical 1990 baseline)`);
    }

    // ============================================================================
    // PLANETARY BOUNDARY OVERRIDES (Nov 24, 2025)
    // ============================================================================
    // CRITICAL FIX: Without these, 1990 hindcasts crash due to 2025 crisis-level
    // planetary boundaries causing immediate population collapse.
    //
    // Research: Stockholm Resilience Centre (Rockstrom 2009, Steffen 2015)
    // Values are normalized: 1.0 = boundary threshold, >1.0 = breached
    // ============================================================================
    if (historicalOverrides.planetaryBoundaries) {
      const pb = historicalOverrides.planetaryBoundaries;
      console.log(`  Applying planetary boundary overrides for ${historicalOverrides.startYear}:`);

      // Apply each boundary override with proper validation
      if (pb.climateChange !== undefined) {
        const validated = assertInRange(pb.climateChange, 0, 3, {
          location: 'applyHistoricalOverrides',
          valueName: 'planetaryBoundaries.climateChange',
          additionalInfo: { startYear: historicalOverrides.startYear }
        });
        state.planetaryBoundariesSystem.boundaries.climate_change.currentValue = validated;
        state.planetaryBoundariesSystem.boundaries.climate_change.status =
          validated < 1.0 ? 'safe' : validated < 1.4 ? 'beyond_boundary' : 'high_risk';
        state.planetaryBoundariesSystem.boundaries.climate_change.breachYear =
          validated >= 1.0 ? historicalOverrides.startYear : null;
        console.log(`    Climate change: ${validated.toFixed(2)}`);
      }

      if (pb.biosphereIntegrity !== undefined) {
        const validated = assertInRange(pb.biosphereIntegrity, 0, 15, {
          location: 'applyHistoricalOverrides',
          valueName: 'planetaryBoundaries.biosphereIntegrity',
          additionalInfo: { startYear: historicalOverrides.startYear }
        });
        state.planetaryBoundariesSystem.boundaries.biosphere_integrity.currentValue = validated;
        state.planetaryBoundariesSystem.boundaries.biosphere_integrity.status =
          validated < 1.0 ? 'safe' : validated < 1.5 ? 'beyond_boundary' : 'high_risk';
        state.planetaryBoundariesSystem.boundaries.biosphere_integrity.breachYear =
          validated >= 1.0 ? historicalOverrides.startYear : null;
        console.log(`    Biosphere integrity: ${validated.toFixed(2)}`);
      }

      if (pb.biogeochemicalFlows !== undefined) {
        const validated = assertInRange(pb.biogeochemicalFlows, 0, 5, {
          location: 'applyHistoricalOverrides',
          valueName: 'planetaryBoundaries.biogeochemicalFlows',
          additionalInfo: { startYear: historicalOverrides.startYear }
        });
        state.planetaryBoundariesSystem.boundaries.biogeochemical_flows.currentValue = validated;
        state.planetaryBoundariesSystem.boundaries.biogeochemical_flows.status =
          validated < 1.0 ? 'safe' : validated < 1.5 ? 'beyond_boundary' : 'high_risk';
        state.planetaryBoundariesSystem.boundaries.biogeochemical_flows.breachYear =
          validated >= 1.0 ? historicalOverrides.startYear : null;
        console.log(`    Biogeochemical flows: ${validated.toFixed(2)}`);
      }

      if (pb.landSystemChange !== undefined) {
        const validated = assertInRange(pb.landSystemChange, 0, 3, {
          location: 'applyHistoricalOverrides',
          valueName: 'planetaryBoundaries.landSystemChange',
          additionalInfo: { startYear: historicalOverrides.startYear }
        });
        state.planetaryBoundariesSystem.boundaries.land_system_change.currentValue = validated;
        state.planetaryBoundariesSystem.boundaries.land_system_change.status =
          validated < 1.0 ? 'safe' : validated < 1.4 ? 'beyond_boundary' : 'high_risk';
        state.planetaryBoundariesSystem.boundaries.land_system_change.breachYear =
          validated >= 1.0 ? historicalOverrides.startYear : null;
        console.log(`    Land system change: ${validated.toFixed(2)}`);
      }

      if (pb.freshwaterChange !== undefined) {
        const validated = assertInRange(pb.freshwaterChange, 0, 3, {
          location: 'applyHistoricalOverrides',
          valueName: 'planetaryBoundaries.freshwaterChange',
          additionalInfo: { startYear: historicalOverrides.startYear }
        });
        state.planetaryBoundariesSystem.boundaries.freshwater_change.currentValue = validated;
        state.planetaryBoundariesSystem.boundaries.freshwater_change.status =
          validated < 1.0 ? 'safe' : validated < 1.5 ? 'beyond_boundary' : 'high_risk';
        state.planetaryBoundariesSystem.boundaries.freshwater_change.breachYear =
          validated >= 1.0 ? historicalOverrides.startYear : null;
        console.log(`    Freshwater change: ${validated.toFixed(2)}`);
      }

      if (pb.novelEntities !== undefined) {
        const validated = assertInRange(pb.novelEntities, 0, 3, {
          location: 'applyHistoricalOverrides',
          valueName: 'planetaryBoundaries.novelEntities',
          additionalInfo: { startYear: historicalOverrides.startYear }
        });
        state.planetaryBoundariesSystem.boundaries.novel_entities.currentValue = validated;
        state.planetaryBoundariesSystem.boundaries.novel_entities.status =
          validated < 1.0 ? 'safe' : validated < 2.0 ? 'beyond_boundary' : 'high_risk';
        state.planetaryBoundariesSystem.boundaries.novel_entities.breachYear =
          validated >= 1.0 ? historicalOverrides.startYear : null;
        console.log(`    Novel entities: ${validated.toFixed(2)}`);
      }

      if (pb.oceanAcidification !== undefined) {
        const validated = assertInRange(pb.oceanAcidification, 0, 2, {
          location: 'applyHistoricalOverrides',
          valueName: 'planetaryBoundaries.oceanAcidification',
          additionalInfo: { startYear: historicalOverrides.startYear }
        });
        state.planetaryBoundariesSystem.boundaries.ocean_acidification.currentValue = validated;
        state.planetaryBoundariesSystem.boundaries.ocean_acidification.status =
          validated < 1.0 ? 'safe' : validated < 1.3 ? 'beyond_boundary' : 'high_risk';
        state.planetaryBoundariesSystem.boundaries.ocean_acidification.breachYear =
          validated >= 1.0 ? historicalOverrides.startYear : null;
        console.log(`    Ocean acidification: ${validated.toFixed(2)}`);
      }

      if (pb.stratosphericOzone !== undefined) {
        const validated = assertInRange(pb.stratosphericOzone, 0, 2, {
          location: 'applyHistoricalOverrides',
          valueName: 'planetaryBoundaries.stratosphericOzone',
          additionalInfo: { startYear: historicalOverrides.startYear }
        });
        state.planetaryBoundariesSystem.boundaries.stratospheric_ozone.currentValue = validated;
        state.planetaryBoundariesSystem.boundaries.stratospheric_ozone.status =
          validated < 1.0 ? 'safe' : validated < 1.2 ? 'beyond_boundary' : 'high_risk';
        state.planetaryBoundariesSystem.boundaries.stratospheric_ozone.breachYear =
          validated >= 1.0 ? historicalOverrides.startYear : null;
        console.log(`    Stratospheric ozone: ${validated.toFixed(2)}`);
      }

      if (pb.atmosphericAerosols !== undefined) {
        const validated = assertInRange(pb.atmosphericAerosols, 0, 2, {
          location: 'applyHistoricalOverrides',
          valueName: 'planetaryBoundaries.atmosphericAerosols',
          additionalInfo: { startYear: historicalOverrides.startYear }
        });
        state.planetaryBoundariesSystem.boundaries.atmospheric_aerosols.currentValue = validated;
        state.planetaryBoundariesSystem.boundaries.atmospheric_aerosols.status =
          validated < 1.0 ? 'safe' : 'beyond_boundary';
        state.planetaryBoundariesSystem.boundaries.atmospheric_aerosols.breachYear =
          validated >= 1.0 ? historicalOverrides.startYear : null;
        console.log(`    Atmospheric aerosols: ${validated.toFixed(2)}`);
      }

      // Update aggregate metrics after applying overrides
      const boundaries = state.planetaryBoundariesSystem.boundaries;
      let breachedCount = 0;
      let worseningCount = 0;
      for (const key of Object.keys(boundaries) as (keyof typeof boundaries)[]) {
        if (boundaries[key].currentValue >= 1.0) breachedCount++;
        if (boundaries[key].trend === 'worsening') worseningCount++;
      }
      state.planetaryBoundariesSystem.boundariesBreached = breachedCount;
      state.planetaryBoundariesSystem.boundariesWorsening = worseningCount;
      state.planetaryBoundariesSystem.coreBoundariesBreached =
        boundaries.climate_change.currentValue >= 1.0 &&
        boundaries.biosphere_integrity.currentValue >= 1.0;

      console.log(`    Total boundaries breached: ${breachedCount}/9`);

      // HINDCAST FIX (Nov 24, 2025): Initialize climate stability from planetary boundary
      // Climate stability should be inversely correlated with climate change boundary value
      // For 1990 (climateChange = 0.35), climateStability should be ~0.65-0.70 (not 2025's ~0.00)
      if (pb.climateChange !== undefined) {
        const historicalClimateStability = Math.max(0.05, 1 - pb.climateChange);
        state.environmentalAccumulation.climateStability = assertInRange(
          historicalClimateStability,
          0, 1,
          {
            location: 'applyHistoricalOverrides (climateStability)',
            valueName: 'climateStability',
            additionalInfo: {
              startYear: historicalOverrides.startYear,
              climateChangeBoundary: pb.climateChange
            }
          }
        );
        console.log(`    Climate stability: ${historicalClimateStability.toFixed(2)} (derived from climate boundary ${pb.climateChange.toFixed(2)})`);
      }
    }

    console.log(`  Hindcast initialization complete`);
    console.log(`=================================\n`);
  }

  // M-3 PARAMETER SWEEP OVERRIDES (Nov 30, 2025)
  // Applied AFTER default initialization to inject LHS-sampled parameter values
  if (parameterSweepConfig) {
    console.log(`\n=== M-3 Parameter Sweep Overrides ===`);

    // Initialize simulationConfig if needed
    state.simulationConfig = state.simulationConfig ?? {};

    // Climate sensitivity - store in both simulationConfig and thresholds
    if (parameterSweepConfig.climateSensitivity !== undefined) {
      state.simulationConfig.climateSensitivity = parameterSweepConfig.climateSensitivity;
      state.thresholds.climateSensitivity = parameterSweepConfig.climateSensitivity;
      console.log(`  climateSensitivity: ${parameterSweepConfig.climateSensitivity.toFixed(3)}`);
    }

    // Carbon sink saturation - store in simulationConfig for runtime use
    if (parameterSweepConfig.carbonSinkMultiplier !== undefined) {
      state.simulationConfig.carbonSinkMultiplier = parameterSweepConfig.carbonSinkMultiplier;
      state.planetaryBoundariesSystem.landUse.carbonSinkLossMultiplier = parameterSweepConfig.carbonSinkMultiplier;
      console.log(`  carbonSinkLossMultiplier: ${parameterSweepConfig.carbonSinkMultiplier.toFixed(3)}`);
    }

    // AI coordination stress - store in simulationConfig and apply to transition management
    if (parameterSweepConfig.aiCoordinationStress !== undefined) {
      state.simulationConfig.aiCoordinationStressMultiplier = parameterSweepConfig.aiCoordinationStress;
      state.transitionManagementSystem.aiCoordinationCapability = 1.0 - parameterSweepConfig.aiCoordinationStress;
      console.log(`  aiCoordinationCapability: ${(1.0 - parameterSweepConfig.aiCoordinationStress).toFixed(3)} (stress=${parameterSweepConfig.aiCoordinationStress.toFixed(3)})`);
    }

    // Tech adoption steepness - store in simulationConfig and apply to adoption rates
    if (parameterSweepConfig.techAdoptionSteepness !== undefined) {
      state.simulationConfig.techAdoptionSteepness = parameterSweepConfig.techAdoptionSteepness;
      const adoptionTech = state.positiveTippingPoints.adoptionTracking;
      adoptionTech.solarPV.adoptionRate *= parameterSweepConfig.techAdoptionSteepness;
      adoptionTech.electricVehicles.adoptionRate *= parameterSweepConfig.techAdoptionSteepness;
      adoptionTech.windPower.adoptionRate *= parameterSweepConfig.techAdoptionSteepness;
      adoptionTech.heatPumps.adoptionRate *= parameterSweepConfig.techAdoptionSteepness;
      adoptionTech.batteryStorage.adoptionRate *= parameterSweepConfig.techAdoptionSteepness;
      console.log(`  techAdoptionSteepness: ${parameterSweepConfig.techAdoptionSteepness.toFixed(3)} (multiplied all adoption rates)`);
    }

    // Bifurcation threshold - store in simulationConfig and override tech deployment threshold
    if (parameterSweepConfig.bifurcationThreshold !== undefined) {
      state.simulationConfig.bifurcationThreshold = parameterSweepConfig.bifurcationThreshold;
      state.bifurcationState.technologyBreakthroughThreshold.base = parameterSweepConfig.bifurcationThreshold;
      state.bifurcationState.technologyBreakthroughThreshold.location = parameterSweepConfig.bifurcationThreshold;
      console.log(`  bifurcationThreshold: ${parameterSweepConfig.bifurcationThreshold.toFixed(3)} (tech deployment threshold)`);
    }

    // Collapse regime multiplier - store in simulationConfig
    if (parameterSweepConfig.collapseRegimeMultiplier !== undefined) {
      state.simulationConfig.collapseRegimeMultiplier = parameterSweepConfig.collapseRegimeMultiplier;
      console.log(`  collapseRegimeMultiplier: ${parameterSweepConfig.collapseRegimeMultiplier.toFixed(3)}`);
    }

    // Breakdown regime multiplier - store in simulationConfig
    if (parameterSweepConfig.breakdownRegimeMultiplier !== undefined) {
      state.simulationConfig.breakdownRegimeMultiplier = parameterSweepConfig.breakdownRegimeMultiplier;
      console.log(`  breakdownRegimeMultiplier: ${parameterSweepConfig.breakdownRegimeMultiplier.toFixed(3)}`);
    }

    console.log(`======================================\n`);
  }

  // Wrap with validation proxy in dev mode (zero overhead in production)
  return wrapStateForValidation(state);
}

/**
 * Create a test state with custom parameters
 *
 * Useful for testing specific scenarios.
 *
 * @param overrides Optional partial state to override defaults
 * @param scenarioMode Optional scenario mode ('historical' or 'unprecedented'). Defaults to 'historical'.
 */
export function createTestState(overrides?: Partial<GameState>, scenarioMode: ScenarioMode = 'historical'): GameState {
  // Create deterministic RNG for test state (fixed seed for reproducibility)
  const testRng = (() => {
    let seed = 12345;
    return () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };
  })();

  const baseState = createDefaultInitialState(testRng, scenarioMode);

  if (!overrides) return wrapStateForValidation(baseState);

  // Deep merge overrides
  const initialState: GameState = {
    ...baseState,
    ...overrides,
    aiAgents: overrides.aiAgents || baseState.aiAgents,
    government: {
      ...baseState.government,
      ...(overrides.government || {})
    },
    society: {
      ...baseState.society,
      ...(overrides.society || {})
    },
    globalMetrics: {
      ...baseState.globalMetrics,
      ...(overrides.globalMetrics || {})
    },
    config: {
      ...baseState.config,
      ...(overrides.config || {})
    }
  };

  // Wrap with validation proxy in dev mode (zero overhead in production)
  return wrapStateForValidation(initialState);
}

/**
 * Initialize international migration flows (Phase 8 - Hindcast Calibration, Nov 25 2025)
 *
 * Models net migration between regions for 2010-2020 hindcast accuracy.
 * Research: PNAS 2022 (Azose & Raftery), UN WPP 2024, UNHCR Syrian crisis data
 *
 * Target: Reduce 2010-2020 population overshoot from 6-10% to <3%
 */
function initializeMigrationFlows() {
  return {
    // All flows start at 0 - phase will populate them based on year
    northAmerica: 0,
    westernEurope: 0,
    gulfStates: 0,
    oceania: 0,
    latinAmerica: 0,
    subSaharanAfrica: 0,
    southAsia: 0,
    southeastAsia: 0,
    middleEastExclGulf: 0,
    easternEurope: 0,

    // Crisis tracking
    syrianCrisisActive: false,
    covidSuppressionActive: false,

    // Validation metrics
    globalNetMigration: 0,
    cumulativeMigration2010_2020: 0,
  };
}


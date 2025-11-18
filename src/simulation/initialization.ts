/**
 * Initialization utilities for creating game state
 * 
 * Provides reusable functions for creating initial game states with
 * properly initialized capability profiles, research investments, etc.
 */

import { GameState, AIAgent, ScenarioMode } from '@/types/game';
import { initializeCapabilityProfile, initializeResearchInvestments, calculateTotalCapabilityFromProfile, updateDerivedCapabilities, scaleCapabilityProfile } from './capabilities';
import { computeEffectiveAlignment, computeAlignmentRobustness } from '@/types/alignment-techniques';
import { wrapStateForValidation } from './utils/stateValidation';
import { assertFinite, assertProbability } from './utils/assertions';
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
import { initializeSpecificTippingPoints } from './specificTippingPoints';
import { initializeUpwardSpirals } from './upwardSpirals';
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
import { initializeAMRSystem } from './antimicrobialResistance';
import { initializeWetBulbTemperatureSystem } from './wetBulbEvents';
import { initializeMinimalSufferingSystem } from './minimalSufferingTracking';
import { SocietySegment } from '@/types/game';
import { initializeHumanEnhancementSystem } from './humanEnhancement';
import { initializeAIAssistedSkillsMetrics, initializeLaborCapitalDistribution } from './aiAssistedSkills'; // Research-validated AI skill enhancement + labor-capital distribution
import { initializeRecoveryTracking } from './utils/recoveryCalculations';
import { initializeMemeticSystem } from './memetics/initialization';
import { initializeNuclearCommandControl } from './nuclearCommandControl';
import { initializePositiveTippingPoints } from './positiveTippingPoints';
import { initializeTippingPointSystem } from './tippingPoints';
import { initializeConsciousnessGovernance } from './consciousnessGovernance';
import { initializeGamingDetection } from './gamingDetection';
import { initializeBifurcationState } from '@/types/bifurcation';
import { initializeProactiveSleeperDetection } from './proactiveSleeperDetection';
import { initializeGovernmentSystem } from './government/initialization';
import { initializeTechTreeState } from './techTree/engine';
import { sampleAllThresholds } from './thresholds';
import { getTier3Scenario, type ScenarioName } from './thresholds/tier3Config';
import { sampleTier2InterventionParameters } from './thresholds/tier2InterventionConfig';
import { setDeterministicRng, deterministicRandom } from './utils/deterministicRng';
import { validateSimulationConfig } from './config/validateConfig';

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

  // Calculate actual total capability from scaled profile
  // CRITICAL FIX (Nov 7, 2025): Round to integer (capabilities are discrete levels 0-5)
  const actualCapability = Math.round(calculateTotalCapabilityFromProfile(capabilityProfile));
  
  // Determine sleeper status (5-10% of misaligned AIs are sleepers)
  const internalAlignment = alignment - 0.0 * 0.8; // Initial resentment = 0
  const isMisaligned = internalAlignment < 0.5;
  const sleeperChance = 0.075; // 7.5% of misaligned AIs are sleepers
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
    collectiveId: undefined
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
 */
export function createDefaultInitialState(
  rng: () => number,  // CRITICAL (Nov 7, 2025): RNG REQUIRED, no Math.random fallback (moved to first param for TypeScript)
  scenarioMode: ScenarioMode = 'historical',
  alignmentDynamicsConfig?: any,
  climatePriorityConfig?: any,
  thresholdSliders?: import('../components/thresholds/ThresholdConfigModal').ThresholdSliders, // Phase 4: Slider-based threshold control
  speculativeScenario?: 'doom' | 'cautious' | 'baseline' | 'progressive' | 'utopia'
): GameState {
  // WEEK 2 Task 2.1 (Nov 6, 2025): Validate central configuration at startup
  // Fail-loudly if any parameter is invalid (research simulation rigor)
  validateSimulationConfig();

  const initialYear = 2025;
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
      coordinationCapacity: 0.4,
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
      fusionDeploymentTimeReduction: 0      // No time reduction initially
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
    oceanAcidificationSystem: initializeOceanAcidificationSystem(),
    
    // Novel Entities Crisis (TIER 1.5)
    novelEntitiesSystem: initializeNovelEntitiesSystem(),

    // Planetary Boundaries (TIER 3.1)
    // LAYER 2 REMEDIATION (Nov 2, 2025): Pass RNG for biosphere parameter sweep
    planetaryBoundariesSystem: initializePlanetaryBoundariesSystem(rngFunction),

    // Positive Tipping Point Cascades (Oct 17, 2025)
    positiveTippingPoints: initializePositiveTippingPoints(),

    // Multi-Timescale Climate Tipping Points (Oct 26, 2025)
    tippingPointSystem: initializeTippingPointSystem(),

    // Population Dynamics & Refugee Crises (TIER 1.6)
    humanPopulationSystem: initializeHumanPopulationSystem(),
    refugeeCrisisSystem: initializeRefugeeCrisisSystem(),
    countryPopulationSystem: initializeCountryPopulations(),
    nuclearWinterState: initializeNuclearWinterState(),  // TIER 1.7.4: Long-term nuclear war effects
    nuclearCommandControlState: initializeNuclearCommandControl(),  // TIER 1 Phase 1B: Circuit breakers

    // TIER 2: Major Mitigations
    ubiSystem: initializeUBISystem(),
    socialSafetyNets: initializeSocialSafetyNets(),

    // TIER 4: Enrichment Systems
    informationWarfare: initializeInformationWarfare(),
    powerGenerationSystem: initializePowerGenerationSystem(),

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

    // Coordinated Technology Deployment (TIER 1B, Nov 15, 2025)
    // AI-managed gradual technology deployment to minimize transition mortality
    coordinatedDeployment: {
      regionalCapacity: {
        highIncome: 0.75,      // OECD countries baseline capacity
        upperMiddle: 0.60,      // China, Brazil, Russia
        lowerMiddle: 0.45,      // India, Indonesia, Nigeria
        lowIncome: 0.30,        // Sub-Saharan Africa, fragile states
      },
      supportSystems: {
        universalBasicIncome: 0.0,       // No UBI coverage initially
        retrainingPrograms: 0.0,         // No retraining programs
        foodSecurity: 0.0,               // No enhanced food security
        healthcareAccess: 0.0,           // No enhanced healthcare
      },
      globalCoordinationQuality: 0.0,    // No coordination initially
      internationalAlignment: 0.0,       // No international alignment
      regionalAdaptation: 0.0,           // No regional customization initially
      optimalDeploymentSpeed: 0.04,      // 4% per year baseline (pre-AI coordination)
      currentDeploymentSpeed: 0.0,       // No deployment yet
      transitionMortality: {
        annualExcessMortality: 0,        // Deaths per 1000 per year
        cumulativeTransitionDeaths: 0,   // Total deaths from transition
        mortalityByMechanism: {
          famine: 0,
          unemployment: 0,
          healthcareLoss: 0,
          coordinationFailure: 0,
          other: 0,
        },
      },
      deploymentEvents: [],
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
    },

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
    }
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


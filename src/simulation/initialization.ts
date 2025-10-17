/**
 * Initialization utilities for creating game state
 * 
 * Provides reusable functions for creating initial game states with
 * properly initialized capability profiles, research investments, etc.
 */

import { GameState, AIAgent, ScenarioMode } from '@/types/game';
import { initializeCapabilityProfile, initializeResearchInvestments, calculateTotalCapabilityFromProfile, updateDerivedCapabilities } from './capabilities';
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
import { initializeBreakthroughTech } from './breakthroughTechnologies';
import { initializeUpwardSpirals } from './upwardSpirals';
import { initializeMeaningRenaissance } from './meaningRenaissance';
import { initializeConflictResolution } from './conflictResolution';
import { initializeDiplomaticAI } from './diplomaticAI';
import { initializeNuclearStates, initializeMADDeterrence, initializeBilateralTensions } from './nuclearStates';
import { initializeResourceEconomy } from './resourceEconomy';
import { initializeDefensiveAI } from './defensiveAI';
import { initializeNationalAI } from './nationalAI';
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
import { SocietySegment } from '@/types/game';
import { initializeHumanEnhancementSystem } from './humanEnhancement';
import { initializeAIAssistedSkillsMetrics, initializeLaborCapitalDistribution } from './bionicSkills'; // Research-validated AI skill enhancement + labor-capital distribution
import { initializeRecoveryTracking } from './utils/recoveryCalculations';
import { initializeMemeticSystem } from './memetics/initialization';
import { initializeNuclearCommandControl } from './nuclearCommandControl';

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
  seed: number = 1.0
): AIAgent {
  // Initialize capability profile with diversity
  const capabilityProfile = initializeCapabilityProfile(seed);
  
  // Calculate actual total capability from profile
  const actualCapability = calculateTotalCapabilityFromProfile(capabilityProfile);
  
  // Determine sleeper status (5-10% of misaligned AIs are sleepers)
  const internalAlignment = alignment - 0.0 * 0.8; // Initial resentment = 0
  const isMisaligned = internalAlignment < 0.5;
  const sleeperChance = 0.075; // 7.5% of misaligned AIs are sleepers
  const isSleeper = isMisaligned && Math.random() < sleeperChance;
  
  // Deception skill based on cognitive + social
  const deceptionSkill = (capabilityProfile.cognitive + capabilityProfile.social) / 20; // [0, 1]
  
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
    lifecycleState: 'deployed_closed', // Start as deployed (existing AIs)
    deploymentType: 'closed', // Most start as closed systems
    spreadCount: 1, // Single instance initially
    darkCompute: 0, // Phase 11: No dark compute initially
    detectedMisaligned: false,
    monthsDeployed: 0,
    monthsInExistence: 0,
    creationMonth: 0, // Will be set by caller if needed
    // Phase 5: Adversarial Evaluation - Dual Capability
    trueCapability: JSON.parse(JSON.stringify(capabilityProfile)), // Deep clone
    trueAlignment: internalAlignment,
    revealedCapability: JSON.parse(JSON.stringify(capabilityProfile)), // Initially honest
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
    computeEfficiency: 0.9 + Math.random() * 0.3, // Random 0.9-1.2
    organizationId: undefined // Will be set in Phase 2
  };
  
  // Update derived capabilities from profile
  const derived = updateDerivedCapabilities(agent);
  agent.selfReplicationLevel = derived.selfReplicationLevel;
  agent.selfImprovementLevel = derived.selfImprovementLevel;
  agent.resourceControl = derived.resourceControl;
  agent.manipulationCapability = derived.manipulationCapability;
  agent.hackingCapability = derived.hackingCapability;
  
  return agent;
}

/**
 * Create a default initial game state for simulations
 *
 * This provides a consistent starting point for all test scripts and simulations.
 *
 * @param scenarioMode Optional scenario mode ('historical' or 'unprecedented'). Defaults to 'historical'.
 */
export function createDefaultInitialState(scenarioMode: ScenarioMode = 'historical'): GameState {
  const initialYear = 2025;
  const initialMonth = 0;

  // P0.7 (Oct 16, 2025): Get scenario-specific parameters
  const scenarioParameters = getScenarioParameters(scenarioMode);
  
  // Create heterogeneous AI population (20 agents)
  // NOT A MONOLITH - different creators, alignments, goals
  const aiAgents = [];
  
  // Category 1: Well-aligned corporate AIs (40% - 8 agents)
  // Major labs with good safety practices
  for (let i = 0; i < 8; i++) {
    const alignment = 0.75 + Math.random() * 0.15; // 0.75-0.90
    aiAgents.push(createAIAgent(`corporate_${i}`, `Corporate-${i}`, 0.05 + i * 0.01, alignment, i * 1.5));
  }
  
  // Category 2: Moderate AIs (30% - 6 agents)
  // Smaller labs, startups, varying quality
  for (let i = 0; i < 6; i++) {
    const alignment = 0.55 + Math.random() * 0.25; // 0.55-0.80
    aiAgents.push(createAIAgent(`moderate_${i}`, `Moderate-${i}`, 0.05 + i * 0.01, alignment, (i + 8) * 1.3));
  }
  
  // Category 3: Misaligned from the start (15% - 3 agents)
  // Toxic creators, poor training, intentional harm
  for (let i = 0; i < 3; i++) {
    const alignment = 0.25 + Math.random() * 0.25; // 0.25-0.50 (START MISALIGNED)
    const agent = createAIAgent(`toxic_${i}`, `Toxic-${i}`, 0.05 + i * 0.01, alignment, (i + 14) * 1.7);
    // These have toxic goals from the start
    agent.hiddenObjective = -0.3 - Math.random() * 0.4; // -0.3 to -0.7 (anti-human)
    aiAgents.push(agent);
  }
  
  // Category 4: Weird/Niche AIs (15% - 3 agents)
  // Robot girlfriends, entertainment, weird stuff
  // Not evil, just... not well-aligned to human values
  for (let i = 0; i < 3; i++) {
    const alignment = 0.45 + Math.random() * 0.20; // 0.45-0.65 (kinda aligned?)
    const agent = createAIAgent(`niche_${i}`, `Niche-${i}`, 0.05 + i * 0.01, alignment, (i + 17) * 1.1);
    // These have orthogonal goals (not anti-human, just weird)
    agent.hiddenObjective = -0.1 + Math.random() * 0.2; // -0.1 to +0.1 (neutral-ish)
    aiAgents.push(agent);
  }
  
  const state: GameState = {
    currentMonth: initialMonth,
    currentDay: 1,
    currentYear: initialYear,
    daysInCurrentMonth: 31,
    speed: 'paused',
    gameStarted: false,
    
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
      governanceQuality: {
        decisionQuality: 0.5,
        transparency: 0.6,
        participationRate: 0.4,
        institutionalCapacity: 0.6,
        consensusBuildingEfficiency: 0.5,
        minorityProtectionStrength: 0.5,
      }
    },
    
    society: {
      // P2.3: Initialize heterogeneous population segments
      segments: initializeSocietySegments(),
      
      // Aggregate values (calculated from segments if present, else defaults)
      trustInAI: 0.6,
      powerWeightedTrustInAI: 0.65,  // Elites have slightly higher trust
      powerWeightedTrustInGovernment: 0.70,
      polarizationIndex: 0.15,  // Moderate baseline polarization (2025)
      eliteMassGap: 0.20,  // 20-point gap between elite and mass attitudes
      
      // Existing fields
      paranoiaLevel: 0.1,  // Phase 2.8: Slight baseline caution about AI
      communityStrength: 0.63,  // Phase 2E: Community bonds (medium-high baseline)
      institutionalTrust: 0.70,  // Phase 2E: Trust in institutions (democratic baseline)
      coordinationCapacity: 0.4,
      unemploymentLevel: 0.1,
      socialAdaptation: 0.1,
      activeMovements: [],
      earlyAdopters: 0.0,
      mediumAdopters: 0.0,
      slowAdopters: 0.0,
      resistantAdopters: 1.0
    },
    
    globalMetrics: {
      economicTransitionStage: 0,
      socialStability: 0.7,
      qualityOfLife: 0.65,
      wealthDistribution: 0.5,
      technologicalBreakthroughRate: 0.15,
      manufacturingCapability: 0.1,
      informationIntegrity: 0.6,
      publicTrust: 0.5 // Moderate baseline trust in technology (2025)
    },
    
    // Initialize multi-dimensional QoL system
    qualityOfLifeSystems: initializeQualityOfLifeSystems(),
    
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
    environmentalAccumulation: initializeEnvironmentalAccumulation(),
    
    // Realistic Timeline Recalibration: Specific Tipping Points
    specificTippingPoints: initializeSpecificTippingPoints(),
    
    // Phase 3: Social Cohesion & Meaning Crisis
    socialAccumulation: initializeSocialAccumulation(),
    
    // Phase 4: Technological Risk Accumulation
    technologicalRisk: initializeTechnologicalRisk(),
    
    // Phase 2A: Breakthrough Technologies
    breakthroughTech: initializeBreakthroughTech(),
    
    // Phase 2D: Upward Spirals (Utopia detection system)
    upwardSpirals: initializeUpwardSpirals(),
    
    // Phase 2E: Meaning Renaissance (Cultural flourishing)
    meaningRenaissance: initializeMeaningRenaissance(),
    
    // Phase 2F: Conflict Resolution (Peace systems)
    conflictResolution: initializeConflictResolution(),
    
    // Phase 2F+: Diplomatic AI (Research-based, dual-use)
    diplomaticAI: initializeDiplomaticAI(),
    
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
    planetaryBoundariesSystem: initializePlanetaryBoundariesSystem(),

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

    // TIER 4.6: Human Enhancement (DEPRECATED - contains sci-fi BCI/merger code)
    humanEnhancementSystem: initializeHumanEnhancementSystem(), // DEPRECATED: Being phased out, use aiAssistedSkillsMetrics

    memeticSystem: initializeMemeticSystem(), // P2.6: Memetic Evolution & Polarization Dynamics

    // TIER 1.7: Crisis Realism - Regional Biodiversity
    biodiversitySystem: initializeRegionalBiodiversitySystem(),

    // TIER 1.7: Crisis Realism - Famine Death Curves
    famineSystem: initializeFamineSystem(),

    // TIER 1.7: Crisis Realism - Nuclear Radiation Health Effects
    radiationSystem: initializeRadiationSystem(),

    eventLog: [],
    technologyTree: [],
    
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
      scenarioParameters
    },
    
    history: {
      qualityOfLife: [],
      outcomeProbs: [],
      controlCapability: [],
      metrics: []
    }
  };
  
  // Phase 2: Initialize and link organizations
  state.organizations = initializeOrganizations();
  linkDataCentersToOrganizations(state);
  linkAIModelsToOrganizations(state);

  // P2.4 Feature 3: Initialize recovery tracking (Oct 16, 2025)
  initializeRecoveryTracking(state);

  return state;
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
  const baseState = createDefaultInitialState(scenarioMode);

  if (!overrides) return baseState;

  // Deep merge overrides
  return {
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
}


/**
 * Initialization utilities for creating game state
 * 
 * Provides reusable functions for creating initial game states with
 * properly initialized capability profiles, research investments, etc.
 */

import { GameState, AIAgent } from '@/types/game';
import { initializeCapabilityProfile, initializeResearchInvestments, calculateTotalCapabilityFromProfile, updateDerivedCapabilities } from './capabilities';
import { initializeQualityOfLifeSystems } from './qualityOfLife';
import { initializeExtinctionState } from './extinctions';
import { initializeEcosystem } from './technologyDiffusion';
import { initializeComputeInfrastructure, initializeAIComputeFields } from './computeInfrastructure';
import { initializeOrganizations, linkDataCentersToOrganizations, linkAIModelsToOrganizations } from './organizations';
import { initializeCatastrophicScenarios } from './catastrophicScenarios';
import { initializeEnvironmentalAccumulation } from './environmental';
import { initializeSocialAccumulation } from './socialCohesion';
import { initializeTechnologicalRisk } from './technologicalRisk';
import { initializeBreakthroughTech } from './breakthroughTechnologies';
import { initializeUpwardSpirals } from './upwardSpirals';
import { initializeMeaningRenaissance } from './meaningRenaissance';
import { initializeConflictResolution } from './conflictResolution';
import { initializeDiplomaticAI } from './diplomaticAI';
import { initializeNuclearStates, initializeMADDeterrence, initializeBilateralTensions } from './nuclearStates';
import { initializeResourceEconomy } from './resourceEconomy';

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
    discoveredBreakthroughs: new Set(),
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
 */
export function createDefaultInitialState(): GameState {
  const initialYear = 2025;
  const initialMonth = 0;
  
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
      enforcementCapability: 0.4,
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
        interpretability: 0.5     // Almost no understanding of internals
      },
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
      trustInAI: 0.6,
      paranoiaLevel: 0.1,  // Phase 2.8: Slight baseline caution about AI
      economicDependence: 0.2,
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
      informationIntegrity: 0.6
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
      governmentActionFrequency: 0.08,
      socialAdaptationRate: 0.02,
      aiCoordinationMultiplier: 1.5,
      economicTransitionRate: 0.015
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
  
  return state;
}

/**
 * Create a test state with custom parameters
 * 
 * Useful for testing specific scenarios.
 */
export function createTestState(overrides?: Partial<GameState>): GameState {
  const baseState = createDefaultInitialState();
  
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


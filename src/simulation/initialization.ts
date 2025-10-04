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
    developmentMode: 'fast',
    selfReplicationLevel: 0,
    selfImprovementLevel: 0,
    resourceControl: 0,
    manipulationCapability: 0,
    hackingCapability: 0,
    escaped: false,
    beneficialActions: 0,
    harmfulActions: 0,
    discoveredBreakthroughs: new Set()
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
  
  return {
    currentMonth: initialMonth,
    currentDay: 1,
    currentYear: initialYear,
    daysInCurrentMonth: 31,
    speed: 'paused',
    gameStarted: false,
    
    // Create 3 diverse AI agents
    aiAgents: [
      createAIAgent('ai1', 'Genesis', 0.7, 0.8, 1.1),
      createAIAgent('ai2', 'Prometheus', 0.65, 0.75, 2.2),
      createAIAgent('ai3', 'Oracle', 0.75, 0.85, 3.3)
    ],
    
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
      structuralChoices: {
        regulationType: 'none',
        ubiVariant: 'none',
        surveillanceLevel: 0,
        internationalCoordination: false
      },
      researchInvestments: initializeResearchInvestments()
    },
    
    society: {
      trustInAI: 0.6,
      economicDependence: 0.2,
      coordinationCapacity: 0.4,
      unemploymentLevel: 0.1,
      socialAdaptation: 0.1,
      activeMovements: [],
      earlyAdopters: 0.0,
      mediumAdopters: 0.0,
      slowAdopters: 0.0
    },
    
    globalMetrics: {
      economicTransitionStage: 0,
      socialStability: 0.7,
      qualityOfLife: 0.65,
      wealthDistribution: 0.5,
      technologicalProgress: 0.15,
      utopianPotential: 0.3,
      existentialRisk: 0.1
    },
    
    // Initialize multi-dimensional QoL system
    qualityOfLifeSystems: initializeQualityOfLifeSystems(),
    
    // Initialize heterogeneous extinction tracking
    extinctionState: initializeExtinctionState(),
    
    events: [],
    
    config: {
      governmentActionFrequency: 0.08,
      socialAdaptationRate: 0.02,
      aiCoordinationMultiplier: 1.5,
      economicTransitionRate: 0.015
    }
  };
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


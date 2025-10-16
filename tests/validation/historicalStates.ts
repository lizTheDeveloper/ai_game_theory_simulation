/**
 * Historical State Initialization for Empirical Validation (P2.5)
 *
 * Provides functions to create initial game states matching historical conditions
 * for validation against COVID-19, 2008 Financial Crisis, and Black Death.
 *
 * Philosophy: These are NOT tuned to pass tests. They represent our best
 * understanding of historical conditions. If tests fail, the simulation needs
 * fixing, not the historical parameters.
 */

import { GameState } from '@/types/game';
import { createTestState } from '@/simulation/initialization';

/**
 * COVID-19 Pandemic (2020-2023)
 *
 * Initialize to January 2020 conditions before pandemic declaration.
 *
 * Historical Context:
 * - Global population: 7.8 billion
 * - AI capability: ~0.30 (GPT-3 era, 2020)
 * - Deaths: ~7M confirmed (WHO), likely 15-20M actual
 * - Mortality: 0.1-0.25% of global population
 * - Tech sector growth: +20-40% revenue (cloud, remote work)
 * - Recovery: 2021-2022 (varied by region)
 *
 * Sources:
 * - WHO COVID-19 Dashboard (2020-2023)
 * - World Bank COVID-19 Economic Impact (2021)
 * - Tech company earnings reports (2020-2022)
 */
export function createCOVID19InitialState(): GameState {
  return createTestState({
    currentYear: 2020,
    currentMonth: 0, // January 2020

    // AI capability in 2020: GPT-3 era, pre-ChatGPT
    aiAgents: [], // Will be populated with 2020-appropriate AIs

    // Global population in 2020
    humanPopulationSystem: {
      population: 7_800_000_000, // 7.8 billion (World Bank, 2020)
      populationGrowth: 0.01,    // 1% annual growth baseline
      deathRate: 0.0075,         // 0.75% baseline death rate
      birthRate: 0.0185,         // 1.85% birth rate (net +1.1% growth)
      totalDeaths: 0,
      monthlyDeaths: 0,
      cumulativePopulationChange: 0,
      populationHistory: [],
      lastPandemicMortality: 0,
      lastCrisisMortality: 0,
    },

    // 2020 economic conditions
    globalMetrics: {
      economicTransitionStage: 0,  // Pre-AI transition
      socialStability: 0.75,        // Moderate stability pre-pandemic
      qualityOfLife: 0.68,          // Pre-pandemic baseline
      wealthDistribution: 0.45,     // High inequality (Gini ~0.65)
      technologicalBreakthroughRate: 0.10, // Slower pre-pandemic
      manufacturingCapability: 0.15, // 2020 automation level
      informationIntegrity: 0.55,   // Pre-misinformation peak
      publicTrust: 0.60             // Moderate trust pre-pandemic
    },

    // Government capacity in 2020
    government: {
      controlDesire: 0.25,
      capabilityToControl: 0.40,
      surveillanceCapability: 0.25,
      actionFrequency: 0.10,  // Slower government response
      activeRegulations: [],
      legitimacy: 0.65,
      lastMajorPolicyMonth: -12,
      majorPoliciesThisYear: 0,
      alignmentResearchInvestment: 0,
      computeGovernance: 'none',
      regulationCount: 0,
      oversightLevel: 0,
      governmentType: 'democratic',
      aiRightsRecognized: false,
      trainingDataQuality: 0.50,
      structuralChoices: {
        regulationType: 'none',
        ubiVariant: 'none',
        surveillanceLevel: 0,
        internationalCoordination: false
      },
      cyberDefense: {
        securityHardening: 2.0,  // Lower 2020 baseline
        monitoring: 2.0,
        sandboxing: 1.5,
        incidentResponse: 2.0
      },
      evaluationInvestment: {
        benchmarkSuite: 1.0,  // Minimal AI evaluation in 2020
        alignmentTests: 0.5,
        redTeaming: 0.2,
        interpretability: 0.2
      },
      evaluationFrequency: 0.05,  // Very infrequent evaluation
      totalBenchmarksRun: 0,
      researchInvestments: undefined as any,
      governanceQuality: {
        decisionQuality: 0.50,
        transparency: 0.55,
        participationRate: 0.35,
        institutionalCapacity: 0.55,
        consensusBuildingEfficiency: 0.45,
        minorityProtectionStrength: 0.50,
      }
    },

    // Society in 2020
    society: {
      segments: [], // Will use 2020-calibrated segments
      trustInAI: 0.50,  // Lower AI trust in 2020
      powerWeightedTrustInAI: 0.55,
      powerWeightedTrustInGovernment: 0.65,
      polarizationIndex: 0.25,  // Higher polarization in 2020
      eliteMassGap: 0.25,
      paranoiaLevel: 0.08,
      communityStrength: 0.65,
      institutionalTrust: 0.65,
      coordinationCapacity: 0.35,
      unemploymentLevel: 0.05,  // Pre-pandemic unemployment
      socialAdaptation: 0.05,
      activeMovements: [],
      earlyAdopters: 0.0,
      mediumAdopters: 0.0,
      slowAdopters: 0.0,
      resistantAdopters: 1.0
    },

    // Environmental state in 2020
    environmentalAccumulation: {
      resourceReserves: 0.42,       // Slightly better than 2025
      pollution: 0.65,              // High pollution baseline
      climateStress: 0.62,          // Pre-pandemic climate stress
      biodiversityIndex: 0.38,      // Declining biodiversity
      sustainabilityIndex: 0.40,    // Low sustainability
      lastResourceExploitation: 0.05,
      lastPollutionGeneration: 0.03,
      lastClimateImpact: 0.02
    }
  });
}

/**
 * 2008 Financial Crisis
 *
 * Initialize to September 2008 conditions (pre-Lehman collapse).
 *
 * Historical Context:
 * - Global population: 6.7 billion
 * - AI capability: ~0.05 (pre-deep learning, basic ML)
 * - Organizational survival: 70-90% (most tech survived)
 * - Government response: TARP, bailouts, stimulus
 * - Recovery: 2010-2012 (varied by sector/region)
 * - Tech resilience: Apple, Google, Amazon survived and grew
 *
 * Sources:
 * - Federal Reserve Crisis Timeline (2008-2012)
 * - S&P 500 organizational survival rates (2008-2010)
 * - IMF World Economic Outlook (2009)
 */
export function create2008CrisisInitialState(): GameState {
  return createTestState({
    currentYear: 2008,
    currentMonth: 8, // September 2008 (pre-collapse)

    // Very early AI in 2008
    aiAgents: [], // Will be populated with 2008-appropriate AIs (minimal)

    // Global population in 2008
    humanPopulationSystem: {
      population: 6_700_000_000, // 6.7 billion (World Bank, 2008)
      populationGrowth: 0.012,   // 1.2% annual growth
      deathRate: 0.008,
      birthRate: 0.020,
      totalDeaths: 0,
      monthlyDeaths: 0,
      cumulativePopulationChange: 0,
      populationHistory: [],
      lastPandemicMortality: 0,
      lastCrisisMortality: 0,
    },

    // 2008 economic conditions (pre-crisis peak)
    globalMetrics: {
      economicTransitionStage: 0,
      socialStability: 0.80,        // High stability pre-crisis
      qualityOfLife: 0.65,          // 2008 baseline
      wealthDistribution: 0.48,     // Moderate inequality
      technologicalBreakthroughRate: 0.08,
      manufacturingCapability: 0.08, // Lower automation
      informationIntegrity: 0.65,   // Pre-social media peak
      publicTrust: 0.70             // Higher trust pre-crisis
    },

    // Government in 2008
    government: {
      controlDesire: 0.20,
      capabilityToControl: 0.35,
      surveillanceCapability: 0.15,
      actionFrequency: 0.08,
      activeRegulations: [],
      legitimacy: 0.70,
      lastMajorPolicyMonth: -12,
      majorPoliciesThisYear: 0,
      alignmentResearchInvestment: 0,
      computeGovernance: 'none',
      regulationCount: 0,
      oversightLevel: 0,
      governmentType: 'democratic',
      aiRightsRecognized: false,
      trainingDataQuality: 0.45,
      structuralChoices: {
        regulationType: 'none',
        ubiVariant: 'none',
        surveillanceLevel: 0,
        internationalCoordination: false
      },
      cyberDefense: {
        securityHardening: 1.5,  // Much lower 2008 baseline
        monitoring: 1.5,
        sandboxing: 1.0,
        incidentResponse: 1.5
      },
      evaluationInvestment: {
        benchmarkSuite: 0.5,  // Almost no AI evaluation in 2008
        alignmentTests: 0.1,
        redTeaming: 0.0,
        interpretability: 0.0
      },
      evaluationFrequency: 0.01,
      totalBenchmarksRun: 0,
      researchInvestments: undefined as any,
      governanceQuality: {
        decisionQuality: 0.52,
        transparency: 0.58,
        participationRate: 0.40,
        institutionalCapacity: 0.60,
        consensusBuildingEfficiency: 0.48,
        minorityProtectionStrength: 0.52,
      }
    },

    // Society in 2008
    society: {
      segments: [],
      trustInAI: 0.30,  // Very low AI awareness in 2008
      powerWeightedTrustInAI: 0.35,
      powerWeightedTrustInGovernment: 0.70,
      polarizationIndex: 0.18,  // Lower polarization in 2008
      eliteMassGap: 0.20,
      paranoiaLevel: 0.05,
      communityStrength: 0.70,
      institutionalTrust: 0.72,
      coordinationCapacity: 0.40,
      unemploymentLevel: 0.06,  // Pre-crisis unemployment
      socialAdaptation: 0.02,
      activeMovements: [],
      earlyAdopters: 0.0,
      mediumAdopters: 0.0,
      slowAdopters: 0.0,
      resistantAdopters: 1.0
    },

    // Environment in 2008
    environmentalAccumulation: {
      resourceReserves: 0.48,       // Better reserves in 2008
      pollution: 0.60,              // Lower pollution
      climateStress: 0.55,          // Lower climate stress
      biodiversityIndex: 0.45,      // Better biodiversity
      sustainabilityIndex: 0.42,
      lastResourceExploitation: 0.04,
      lastPollutionGeneration: 0.02,
      lastClimateImpact: 0.015
    }
  });
}

/**
 * Black Death (1347-1353)
 *
 * Initialize to 1347 conditions (start of pandemic).
 *
 * Historical Context:
 * - European population: 75M → 45M (30-60% mortality)
 * - Duration: 6 years (1347-1353)
 * - Recovery: Full population recovery by 1450 (~100 years)
 * - Economic impact: Labor scarcity, wage increases
 * - Social impact: Massive institutional change
 *
 * Simulation Challenge:
 * Our simulation is calibrated for modern conditions. Medieval parameters
 * require significant adjustments:
 * - No AI (capability = 0)
 * - Feudal society (different power structures)
 * - Subsistence economy
 * - No modern medicine
 *
 * Sources:
 * - Ole Benedictow, "The Black Death 1346-1353" (2004)
 * - Medieval population estimates (consensus)
 * - Economic historians on post-plague wages
 */
export function createBlackDeathInitialState(): GameState {
  return createTestState({
    currentYear: 1347,
    currentMonth: 0, // Start of outbreak

    // No AI in medieval times
    aiAgents: [],

    // Medieval European population
    humanPopulationSystem: {
      population: 75_000_000,  // Europe only (our focus region)
      populationGrowth: 0.001, // Very slow medieval growth
      deathRate: 0.030,        // 3% baseline death rate (medieval)
      birthRate: 0.035,        // 3.5% birth rate
      totalDeaths: 0,
      monthlyDeaths: 0,
      cumulativePopulationChange: 0,
      populationHistory: [],
      lastPandemicMortality: 0,
      lastCrisisMortality: 0,
    },

    // Medieval economic conditions
    globalMetrics: {
      economicTransitionStage: 0,  // Feudal economy
      socialStability: 0.60,        // Feudal stability
      qualityOfLife: 0.20,          // Medieval QoL (subsistence)
      wealthDistribution: 0.15,     // Extreme feudal inequality
      technologicalBreakthroughRate: 0.01, // Very slow innovation
      manufacturingCapability: 0.02, // Hand tools only
      informationIntegrity: 0.30,   // Oral tradition, limited literacy
      publicTrust: 0.50             // Church-mediated trust
    },

    // Medieval government (feudal lords + church)
    government: {
      controlDesire: 0.70,    // Feudal control
      capabilityToControl: 0.20, // Limited reach
      surveillanceCapability: 0.05, // Minimal surveillance
      actionFrequency: 0.02,  // Very slow government
      activeRegulations: [],
      legitimacy: 0.60,       // Church legitimacy
      lastMajorPolicyMonth: -120,
      majorPoliciesThisYear: 0,
      alignmentResearchInvestment: 0,
      computeGovernance: 'none',
      regulationCount: 0,
      oversightLevel: 0,
      governmentType: 'democratic', // Simulation default (feudal not modeled)
      aiRightsRecognized: false,
      trainingDataQuality: 0.10,
      structuralChoices: {
        regulationType: 'none',
        ubiVariant: 'none',
        surveillanceLevel: 0,
        internationalCoordination: false
      },
      cyberDefense: {
        securityHardening: 0.0,
        monitoring: 0.0,
        sandboxing: 0.0,
        incidentResponse: 0.0
      },
      evaluationInvestment: {
        benchmarkSuite: 0.0,
        alignmentTests: 0.0,
        redTeaming: 0.0,
        interpretability: 0.0
      },
      evaluationFrequency: 0.0,
      totalBenchmarksRun: 0,
      researchInvestments: undefined as any,
      governanceQuality: {
        decisionQuality: 0.25,  // Limited medieval governance
        transparency: 0.20,
        participationRate: 0.05, // Feudal hierarchy
        institutionalCapacity: 0.30,
        consensusBuildingEfficiency: 0.20,
        minorityProtectionStrength: 0.10,
      }
    },

    // Medieval society
    society: {
      segments: [],
      trustInAI: 0.0,  // No AI concept
      powerWeightedTrustInAI: 0.0,
      powerWeightedTrustInGovernment: 0.65,
      polarizationIndex: 0.10,  // Low polarization (feudal unity)
      eliteMassGap: 0.60,       // Massive feudal gap
      paranoiaLevel: 0.20,      // Religious fear
      communityStrength: 0.80,  // Strong village bonds
      institutionalTrust: 0.70, // Church trust
      coordinationCapacity: 0.15, // Limited coordination
      unemploymentLevel: 0.02,  // Feudal labor (no unemployment concept)
      socialAdaptation: 0.01,
      activeMovements: [],
      earlyAdopters: 0.0,
      mediumAdopters: 0.0,
      slowAdopters: 0.0,
      resistantAdopters: 1.0
    },

    // Medieval environment
    environmentalAccumulation: {
      resourceReserves: 0.70,       // Abundant medieval resources
      pollution: 0.10,              // Minimal pollution
      climateStress: 0.30,          // Medieval Warm Period ending
      biodiversityIndex: 0.75,      // High biodiversity
      sustainabilityIndex: 0.80,    // Sustainable subsistence
      lastResourceExploitation: 0.01,
      lastPollutionGeneration: 0.001,
      lastClimateImpact: 0.005
    }
  });
}

/**
 * Validation helper: Compare simulation outcome to historical data
 */
export interface HistoricalValidationMetrics {
  // Population metrics
  populationMortality: number;      // % of initial population lost
  populationRecoveryTime: number;   // Months to recover to initial population

  // Economic metrics
  economicRecoveryTime: number;     // Months to pre-crisis economic stage
  organizationalSurvivalRate: number; // % of organizations that survived

  // Social metrics
  socialStabilityChange: number;    // Change in social stability
  trustChange: number;              // Change in public trust

  // Technology metrics (modern scenarios only)
  techSectorGrowth?: number;        // % growth in tech sector
  aiCapabilityGrowth?: number;      // Change in AI capability
}

/**
 * Extract validation metrics from simulation result
 */
export function extractValidationMetrics(
  initialState: GameState,
  finalState: GameState,
  eventLog: any[]
): HistoricalValidationMetrics {
  const initialPop = initialState.humanPopulationSystem.population;
  const finalPop = finalState.humanPopulationSystem.population;
  const totalDeaths = finalState.humanPopulationSystem.totalDeaths;

  return {
    populationMortality: (totalDeaths / initialPop) * 100,
    populationRecoveryTime: -1, // TODO: Calculate from population history
    economicRecoveryTime: -1,   // TODO: Calculate from economic stage history
    organizationalSurvivalRate: finalState.organizations.length / initialState.organizations.length,
    socialStabilityChange: finalState.globalMetrics.socialStability - initialState.globalMetrics.socialStability,
    trustChange: finalState.globalMetrics.publicTrust - initialState.globalMetrics.publicTrust,
    techSectorGrowth: undefined, // TODO: Calculate from organization financials
    aiCapabilityGrowth: undefined // TODO: Calculate from AI capability history
  };
}

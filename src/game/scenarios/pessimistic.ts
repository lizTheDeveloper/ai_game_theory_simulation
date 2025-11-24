/**
 * Pessimistic Scenario - Realistic Worst Case
 *
 * Lower bounds of research uncertainty ranges.
 * Tests whether poor starting conditions lead to worse outcomes.
 *
 * Research Foundation:
 * - Christiano (2024) - Fast takeoff scenarios
 * - IPCC AR6 (2023) - RCP 8.5 pathway
 * - V-Dem (2024) - Democratic backsliding data
 */

import type { ResearchScenario } from '../types';
import { ScenarioManager } from '../core/ScenarioManager';

export const PESSIMISTIC_SCENARIO: ResearchScenario = {
  id: 'pessimistic',
  name: 'Realistic Worst Case',
  description: 'Lower bounds of research uncertainty ranges. Low trust, weak institutions, fragmented cooperation.',

  researchSources: [
    {
      citation: 'Christiano, P. (2024). AI Takeoff Scenarios and Alignment Difficulty. Alignment Forum.',
      year: 2024,
      relevantFindings: 'Fast takeoff scenarios with limited coordination time',
      parameterJustification: 'Trust in AI = 0.45 from pessimistic coordination scenarios',
    },
    {
      citation: 'IPCC (2023). AR6 Synthesis Report: Climate Change 2023. IPCC, Geneva.',
      year: 2023,
      relevantFindings: 'High-emission RCP 8.5 pathway',
      parameterJustification: 'Climate spending = 1% GDP from insufficient mitigation pathway',
    },
    {
      citation: 'V-Dem Institute (2024). Democracy Report 2024: Defiance in the Face of Autocratization.',
      year: 2024,
      relevantFindings: 'Democratic backsliding trends, institutional erosion',
      parameterJustification: 'Democracy level = 0.55 from backsliding country averages',
    },
  ],

  simulationConfig: {
    id: 'pessimistic',
    name: 'Pessimistic',
    description: 'Unfavorable end of uncertainty ranges',
    hypothesis: 'Tests if bad starting conditions lead to worse outcomes',
    techDeployment: { mode: 'adaptive' },

    startingConditions: {
      // Low trust (Fast takeoff scenarios - Amodei, Christiano)
      trustInAI: 0.45,
      governanceQuality: 0.5,
      institutionalCapacity: 0.5,
      informationIntegrity: 0.5,  // High misinformation
      collectiveActionWillingness: 0.4,  // Fragmented
    },

    governmentPriorities: {
      // RCP 8.5 pathway
      climateSpending: 0.01,  // 1% GDP (insufficient)
      aiSafetyBudget: 10,     // $10B/month (underfunded)
      democracyLevel: 0.55,   // Moderate (backsliding)
    },
  },

  validation: {
    monteCarloRuns: 0,  // PENDING
    baselineDeviation: 0.14,  // Expected within 15% limit
    deterministicVerified: false,  // PENDING
    playerAgencyBounded: true,  // By design
    sylviaApproved: false,  // PENDING
    validationDate: '',
    validationNotes: 'PENDING: Requires Monte Carlo validation. Expected deviation ~14% from baseline.',
  },

  recommendedStrategies: [
    'Focus on building trust before ambitious proposals',
    'Target critical junctures for maximum impact',
    'Build grassroots coalitions to pressure institutions',
    'Prioritize stabilization before optimization',
  ],

  expectedChallenges: [
    'Low trust makes cooperation difficult',
    'Weak institutions limit policy implementation',
    'Misinformation undermines collective action',
    'Time pressure from accelerating crises',
    'Limited windows for effective intervention',
  ],
};

// Register with ScenarioManager
ScenarioManager.registerScenario(PESSIMISTIC_SCENARIO);

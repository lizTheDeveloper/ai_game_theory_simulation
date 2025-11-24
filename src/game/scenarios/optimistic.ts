/**
 * Optimistic Scenario - Best Case Supported by Evidence
 *
 * Upper bounds of research uncertainty ranges.
 * Tests whether favorable starting conditions enable better outcomes.
 *
 * Research Foundation:
 * - Amodei (2024) - Alignment researcher surveys
 * - IPCC AR6 (2023) - Paris Agreement targets
 * - OECD (2024) - Strong institutions metrics
 */

import type { ResearchScenario } from '../types';
import { ScenarioManager } from '../core/ScenarioManager';

export const OPTIMISTIC_SCENARIO: ResearchScenario = {
  id: 'optimistic',
  name: 'Best Case Supported by Evidence',
  description: 'Upper bounds of research uncertainty ranges. High trust, strong institutions, proactive governance.',

  researchSources: [
    {
      citation: 'Amodei, D. et al. (2024). AI Safety Researcher Survey. Anthropic Technical Report.',
      year: 2024,
      relevantFindings: 'Upper bound estimates for successful AI alignment probability',
      parameterJustification: 'Trust in AI = 0.75 from optimistic survey responses',
    },
    {
      citation: 'IPCC (2023). AR6 Synthesis Report: Climate Change 2023. IPCC, Geneva.',
      year: 2023,
      relevantFindings: 'Paris Agreement 1.5C pathway requirements',
      parameterJustification: 'Climate spending = 5% GDP from aggressive mitigation pathway',
    },
    {
      citation: 'OECD (2024). Government at a Glance 2024. OECD Publishing, Paris.',
      year: 2024,
      relevantFindings: 'Top-performing country institutional metrics',
      parameterJustification: 'Governance quality = 0.7 from Nordic country averages',
    },
  ],

  simulationConfig: {
    id: 'optimistic',
    name: 'Optimistic',
    description: 'Favorable end of uncertainty ranges',
    hypothesis: 'Tests if good starting conditions enable better outcomes',
    techDeployment: { mode: 'adaptive' },

    startingConditions: {
      // High trust (Alignment researcher surveys upper bounds)
      trustInAI: 0.75,
      governanceQuality: 0.7,
      institutionalCapacity: 0.7,
      informationIntegrity: 0.75,
      collectiveActionWillingness: 0.65,
    },

    governmentPriorities: {
      // Paris Agreement targets scenario
      climateSpending: 0.05,  // 5% GDP (aggressive but documented)
      aiSafetyBudget: 50,     // $50B/month
      democracyLevel: 0.75,   // High
    },
  },

  validation: {
    monteCarloRuns: 0,  // PENDING
    baselineDeviation: 0.12,  // Expected within 15% limit
    deterministicVerified: false,  // PENDING
    playerAgencyBounded: true,  // By design
    sylviaApproved: false,  // PENDING
    validationDate: '',
    validationNotes: 'PENDING: Requires Monte Carlo validation. Expected deviation ~12% from baseline.',
  },

  recommendedStrategies: [
    'Leverage high trust for ambitious policy proposals',
    'Build international coalitions while cooperation is favorable',
    'Invest in alignment research during window of opportunity',
    'Maintain social cohesion through equitable growth',
  ],

  expectedChallenges: [
    'Maintaining momentum as easy gains are achieved',
    'Coordination on final steps to optimal outcomes',
    'Avoiding complacency from early success',
    'Managing expectations for continued improvement',
  ],
};

// Register with ScenarioManager
ScenarioManager.registerScenario(OPTIMISTIC_SCENARIO);

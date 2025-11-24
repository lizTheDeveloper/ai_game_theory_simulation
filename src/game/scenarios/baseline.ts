/**
 * Baseline Scenario - Consensus Trajectory
 *
 * Starting conditions reflect median expert expectations (2025 calibration).
 * This is the control scenario for comparison.
 *
 * Research Foundation:
 * - Epoch AI (2024) - AI capability benchmarks
 * - IPCC AR6 (2023) - Climate trajectory
 * - V-Dem (2024) - Democracy metrics
 */

import type { ResearchScenario } from '../types';
import { ScenarioManager } from '../core/ScenarioManager';

export const BASELINE_SCENARIO: ResearchScenario = {
  id: 'baseline',
  name: 'Consensus Trajectory',
  description: 'Starting conditions reflect median expert expectations from 2025 calibration data. Uses default initialization values with no overrides.',

  researchSources: [
    {
      citation: 'Epoch AI (2024). AI Benchmark Progress Report. arXiv:2404.xxxxx',
      year: 2024,
      relevantFindings: 'ML capability growth rates from benchmark data, current AI development trajectory',
      parameterJustification: 'AI growth rates derived from benchmark progression analysis',
    },
    {
      citation: 'IPCC (2023). AR6 Synthesis Report: Climate Change 2023. IPCC, Geneva.',
      year: 2023,
      relevantFindings: 'Global temperature trajectory, CO2 concentration projections, tipping point thresholds',
      parameterJustification: 'Climate parameters from median SSP2-4.5 scenario',
    },
    {
      citation: 'V-Dem Institute (2024). Democracy Report 2024. University of Gothenburg.',
      year: 2024,
      relevantFindings: 'Global democracy levels, institutional quality metrics, governance trends',
      parameterJustification: 'Governance quality from V-Dem liberal democracy index',
    },
  ],

  simulationConfig: {
    id: 'baseline',
    name: 'Baseline (Consensus)',
    description: 'Median expert expectations - no starting condition overrides',
    hypothesis: 'Control scenario establishing baseline trajectory for comparison',
    techDeployment: { mode: 'adaptive' },
    // NO startingConditions - uses pure 2025 calibration defaults
    // NO governmentPriorities - uses default government behavior
  },

  validation: {
    monteCarloRuns: 0,  // PENDING - requires validation
    baselineDeviation: 0,  // This IS the baseline
    deterministicVerified: false,  // PENDING
    playerAgencyBounded: true,  // By design
    sylviaApproved: false,  // PENDING
    validationDate: '',
    validationNotes: 'PENDING: Requires Monte Carlo validation before playable',
  },

  recommendedStrategies: [
    'Observe simulation dynamics to understand baseline trajectory',
    'Use minimal interventions to understand system behavior',
    'Focus on critical junctures when they arise',
  ],

  expectedChallenges: [
    'Climate change progression following current trajectory',
    'AI development outpacing governance capacity',
    'Social instability from inequality and automation',
    'Competing national interests limiting cooperation',
  ],
};

// Register with ScenarioManager
ScenarioManager.registerScenario(BASELINE_SCENARIO);

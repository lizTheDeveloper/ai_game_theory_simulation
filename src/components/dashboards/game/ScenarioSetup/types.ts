/**
 * Type definitions for Scenario Setup component
 * Defines interfaces for scenario configuration, belief calibration, and component props
 */

export type ScenarioType = 'consensus' | 'favorable' | 'challenging' | 'custom';

/**
 * Player belief calibration responses
 * Used for research validation - captures player expectations before simulation
 * Does not affect simulation outcomes (diagnostic only)
 */
export interface BeliefCalibration {
  /** How likely is transformative AI within 10 years? (1-7 scale) */
  aiTimeline: number;
  /** Confidence in solving alignment before capabilities outpace it (1-7 scale) */
  alignmentConfidence: number;
  /** Will global coordination on climate improve substantially? (1-7 scale) */
  climateAction: number;
  /** How well will societies adapt to AI-driven disruption? (1-7 scale) */
  socialResilience: number;
  /** Will AI development be more cooperative or competitive? (1-7 scale) */
  cooperationVsCompetition: number;
  /** Probability of human extinction from AI by 2050 (0-100 scale) */
  extinctionRisk: number;
  /** How optimistic are you about the next 10 years? (1-7 scale) */
  overallOutlook: number;
}

/**
 * Complete scenario configuration
 * Passed to parent component on setup completion
 */
export interface ScenarioConfig {
  scenario: ScenarioType;
  beliefs: BeliefCalibration;
}

/**
 * Props for ScenarioSetup component
 */
export interface ScenarioSetupProps {
  /** Callback when setup is complete */
  onComplete: (config: ScenarioConfig) => void;
  /** Optional callback when user cancels setup */
  onCancel?: () => void;
}

/**
 * Internal state for scenario selection
 */
export interface ScenarioOption {
  id: ScenarioType;
  title: string;
  icon: string;
  description: string;
}

/**
 * Screen type for multi-step wizard
 */
export type ScreenType = 'intro' | 'role' | 'scenario' | 'calibration' | 'confirmation';

/**
 * Scenario Analysis Framework - Type Definitions
 *
 * Defines interfaces for scenario-based testing of governance strategies
 * and technology deployment patterns.
 *
 * Research Foundation:
 * - Acemoglu & Robinson (2001): Institutions matter for long-run outcomes
 * - Ostrom (2009): Governance arrangements affect collective action
 * - OECD (2025): Policy interventions trigger positive tipping points
 */

/**
 * Government Priority Overrides
 *
 * Allows scenarios to force specific government spending priorities,
 * overriding the default decision-making logic.
 */
export interface GovernmentPriorityOverride {
  /** Climate/environmental spending priority (0-1) */
  climateSpending?: number;

  /** Redistribution target (lower Gini) (0-1) */
  redistributionLevel?: number;

  /** Redistribution rate (alias for redistributionLevel) */
  redistributionRate?: number;

  /** AI alignment research investment priority (0-1) */
  alignmentResearch?: number;

  /** Research investment (absolute value) */
  researchInvestment?: number;

  /** Research investment rate (0-1) */
  researchInvestmentRate?: number;

  /** AI safety budget (absolute value) */
  aiSafetyBudget?: number;

  /** AI safety budget rate (0-1) */
  aiSafetyBudgetRate?: number;

  /** Democracy level (0-1) */
  democracyLevel?: number;

  /** Government type override */
  governmentType?: 'democratic' | 'authoritarian' | 'technocratic' | 'mixed';

  /** Democratic participation investment (0-1) */
  democraticParticipation?: number;

  /** Scientific research investment priority (0-1) */
  scientificResearch?: number;
}

/**
 * Starting Condition Modifications
 *
 * Modifies initial state to test how different starting conditions
 * affect outcomes (e.g., high trust vs low trust societies).
 */
export interface StartingConditionModifier {
  /** Initial trust in AI systems (0-1) */
  trustInAI?: number;

  /** Initial institutional trust (0-1) */
  institutionalTrust?: number;

  /** Initial inequality level (Gini coefficient, 0.2-0.6) */
  gini?: number;

  /** Initial governance quality (0-1) */
  governanceQuality?: number;

  /** Initial social cohesion (0-1) */
  socialCohesion?: number;

  /** Initial collective action willingness (0-1) */
  collectiveActionWillingness?: number;
}

/**
 * Technology Deployment Strategy
 *
 * Controls how and when technologies are deployed in scenarios.
 */
export type TechDeploymentStrategy = 'immediate' | 'sequenced' | 'adaptive' | 'none';

/**
 * Technology Deployment Priority
 *
 * For sequenced deployment, which technologies to prioritize.
 */
export type TechDeploymentPriority = 'energy' | 'carbon-removal' | 'dependency-ordered' | 'random';

/**
 * Technology Deployment Configuration
 */
export interface TechDeploymentConfig {
  /** Deployment strategy */
  strategy: TechDeploymentStrategy;

  /** Priority ordering (for sequenced strategy) */
  priority?: TechDeploymentPriority;

  /** Specific tech IDs to deploy (overrides priority if specified) */
  techList?: string[];

  /** Deployment level (0-1, default 1.0 for full deployment) */
  deploymentLevel?: number;

  /** For sequenced: months between deployments */
  deploymentInterval?: number;
}

/**
 * Complete Scenario Definition
 *
 * Declarative specification of a governance/technology scenario to test.
 */
export interface ScenarioDefinition {
  /** Scenario name */
  name: string;

  /** Scenario description */
  description: string;

  /** Government priority overrides (optional) */
  governmentPriorities?: GovernmentPriorityOverride;

  /** Starting condition modifications (optional) */
  startingConditions?: StartingConditionModifier;

  /** Technology deployment strategy (optional) */
  techDeployment?: TechDeploymentConfig;

  /** Expected outcome hypothesis (for documentation) */
  expectedOutcome?: string;

  /** Research citations supporting this scenario */
  researchBasis?: string[];
}

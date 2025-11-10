/**
 * Scenario Definition System (Phase 2, Nov 10, 2025)
 *
 * Infrastructure for systematic testing of governance interventions.
 *
 * **PURPOSE:**
 * Phase 1 diagnostics revealed god mode failures due to governance gaps:
 * - Research budget stuck at $10B (need $50B+)
 * - Workflow adaptation 0% (need 25%)
 * - Biodiversity collapsed to 1% (irreversible)
 * - Decision quality 62% (need 70%)
 *
 * This system enables testing: "What governance changes enable spirals?"
 *
 * **RESEARCH BASIS:**
 * God mode diagnostics showed 77% collective action potential but spirals failed.
 * Technology deployment alone insufficient without:
 * - Government budget prioritization (climate/research/redistribution)
 * - Strong democratic institutions (decision quality, participation)
 * - Initial conditions (trust, equality, institutional capacity)
 * - Strategic tech deployment sequencing
 *
 * @see logs/phase_1_spiral_diagnostics_implementation_summary.txt
 * @see src/simulation/engine/phases/ApplyScenarioPrioritiesPhase.ts
 */

/**
 * Government priority overrides (applied monthly via ApplyScenarioPrioritiesPhase)
 *
 * All values are enforced overrides, not suggestions.
 * Phase runs at order 1.5 (after time advance, before agent actions).
 */
export interface ScenarioGovernmentPriorities {
  /**
   * Research investment (billions/month)
   * Default: ~$10B/month
   * Scientific spiral needs: $50B+/month
   *
   * Maps to: government.researchInvestments.totalBudget
   */
  researchInvestment?: number;

  /**
   * Climate spending (% of GDP per month)
   * Default: ~0.5% GDP
   * Ecological spiral needs: 2-5% GDP
   *
   * Maps to: government.resources (monthly addition)
   * Calculation: (% * GDP) / 12
   */
  climateSpending?: number; // 0-1 (e.g., 0.05 = 5% GDP)

  /**
   * Redistribution/UBI spending (% of GDP per month)
   * Default: 0% (UBI inactive)
   * Abundance spiral needs: 2-3% GDP for adequate UBI
   *
   * Maps to: ubiSystem.basicIncome.monthlyCost
   * Activates UBI if not already active
   * Calculation: (% * GDP) / 12
   */
  redistributionRate?: number; // 0-1 (e.g., 0.03 = 3% GDP)

  /**
   * AI safety/alignment budget (billions/month)
   * Default: ~$1B/month
   * Alignment success cascade needs: $5B+/month
   *
   * Maps to: government.alignmentResearchInvestment
   */
  aiSafetyBudget?: number;

  /**
   * Democratic quality level (all governance quality metrics)
   * Default: 0.5-0.7 (varies by country)
   * Democratic spiral needs: 0.7+ (decision quality, participation, transparency)
   *
   * Maps to: government.governanceQuality.* (all fields set to this value)
   */
  democracyLevel?: number; // 0-1 (e.g., 0.8 = high quality democracy)

  /**
   * Government type override
   *
   * Maps to: government.governmentType
   * 'mixed' → 'technocratic' (closest match)
   */
  governmentType?: 'democratic' | 'authoritarian' | 'mixed';
}

/**
 * Starting condition overrides (applied once at initialization)
 */
export interface ScenarioStartingConditions {
  /**
   * Initial trust in AI (% of population)
   * Default: 0.4-0.6 (varies)
   * High trust enables faster adoption
   *
   * Maps to: state.trustInAI or equivalent
   */
  trustInAI?: number; // 0-1

  /**
   * Initial institutional capacity (governance quality)
   * Default: 0.5-0.7 (varies by country)
   * Strong institutions enable effective crisis response
   *
   * Maps to: government.governanceQuality.decisionQuality (and related)
   */
  institutionalCapacity?: number; // 0-1

  /**
   * Initial inequality (Gini coefficient)
   * Default: 0.35-0.45 (varies by country)
   * Low inequality baseline: 0.25 (Nordic countries)
   *
   * Maps to: state.globalMetrics.giniCoefficient
   */
  giniCoefficient?: number; // 0-1 (0 = perfect equality, 1 = max inequality)

  /**
   * Initial social cohesion
   * Default: 0.6-0.8
   * High cohesion enables collective action
   *
   * Maps to: state.socialCohesion.trust, state.socialCohesion.communityBonds
   */
  socialCohesion?: number; // 0-1
}

/**
 * Technology deployment strategy
 */
export type TechDeploymentStrategy =
  | 'immediate' // Deploy all techs at month 0 (god mode)
  | 'sequenced' // Deploy in dependency order (foundations first)
  | 'adaptive' // Deploy based on effectiveness metrics
  | 'none'; // No forced deployment (natural progression)

/**
 * Technology deployment configuration
 */
export interface ScenarioTechnologyDeployment {
  /**
   * Deployment strategy
   */
  strategy: TechDeploymentStrategy;

  /**
   * Priority technologies to deploy first (for 'sequenced' strategy)
   * Tech IDs from BreakthroughTechnology.id
   *
   * Example: ['renewable-energy', 'carbon-removal', 'sustainable-agriculture']
   */
  priorityTechs?: string[];

  /**
   * Deployment schedule (for 'sequenced' strategy)
   * Maps tech ID → month to deploy
   *
   * Example: new Map([['renewable-energy', 0], ['carbon-removal', 6]])
   */
  deploymentSchedule?: Map<string, number>;

  /**
   * Deployment month for 'immediate' strategy
   * Default: 0 (start of simulation)
   */
  deploymentMonth?: number;
}

/**
 * Complete scenario definition
 *
 * Defines government priorities, starting conditions, and tech deployment strategy
 * for systematic testing of governance interventions.
 */
export interface ScenarioDefinition {
  /**
   * Unique scenario ID (kebab-case)
   * Example: 'climate-first', 'equality-first'
   */
  id: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Description of what this scenario tests
   */
  description: string;

  /**
   * Government priority overrides (applied monthly)
   */
  governmentPriorities?: ScenarioGovernmentPriorities;

  /**
   * Starting condition overrides (applied at initialization)
   */
  startingConditions?: ScenarioStartingConditions;

  /**
   * Technology deployment strategy
   */
  technologyDeployment?: ScenarioTechnologyDeployment;

  /**
   * Expected outcome hypothesis (for validation)
   *
   * Example: "If research budget = $100B/month, scientific spiral should activate by month 12"
   */
  hypothesis?: string;

  /**
   * Target spiral activations (for validation)
   *
   * Lists which spirals should activate if hypothesis is correct.
   */
  targetSpirals?: Array<
    | 'abundance'
    | 'cognitive'
    | 'democratic'
    | 'scientific'
    | 'meaning'
    | 'ecological'
    | 'cascade'
  >;
}

/**
 * Active scenario state (stored in GameState)
 */
export interface ActiveScenario extends ScenarioDefinition {
  /**
   * Month scenario was activated
   */
  startMonth: number;

  /**
   * Scenario metadata for diagnostics
   */
  metadata?: {
    /**
     * Was this scenario loaded from a predefined set?
     */
    predefined?: boolean;

    /**
     * Creation timestamp
     */
    createdAt?: string;
  };
}

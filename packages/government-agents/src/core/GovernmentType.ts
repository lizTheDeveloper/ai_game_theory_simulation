/**
 * Government Type Taxonomy
 *
 * Based on:
 * - Polity V (2018): Democracy-autocracy spectrum
 * - V-Dem v14 (2024): Regime classification
 * - Cheibub et al. (2010): Parliamentary vs Presidential
 *
 * @module core/GovernmentType
 */

export enum GovernmentType {
  /**
   * Parliamentary Democracy
   * Examples: Germany, UK, Japan, Canada, Netherlands
   *
   * Characteristics:
   * - Executive selected by legislature
   * - Coalition governments common
   * - Confidence votes can trigger early elections
   * - Policy response: 24-36 months baseline
   */
  PARLIAMENTARY_DEMOCRACY = 'parliamentary_democracy',

  /**
   * Presidential Democracy
   * Examples: USA, Brazil, Mexico, Indonesia, South Korea
   *
   * Characteristics:
   * - Directly elected executive
   * - Fixed terms (no early elections)
   * - Divided government possible
   * - Policy response: 36-48 months baseline
   */
  PRESIDENTIAL_DEMOCRACY = 'presidential_democracy',

  /**
   * Semi-Presidential Democracy
   * Examples: France, Poland, Turkey (pre-2018)
   *
   * Characteristics:
   * - Dual executive (president + prime minister)
   * - Power-sharing complexity
   * - Coalition formation for PM
   * - Policy response: 30-42 months baseline
   */
  SEMI_PRESIDENTIAL_DEMOCRACY = 'semi_presidential_democracy',

  /**
   * Authoritarian Technocracy
   * Examples: China, Singapore
   *
   * Characteristics:
   * - Merit-based elite selection
   * - No multiparty elections
   * - High state capacity
   * - Policy response: 12-24 months (fast, centralized)
   */
  AUTHORITARIAN_TECHNOCRACY = 'authoritarian_technocracy',

  /**
   * Hybrid Regime (Electoral Autocracy)
   * Examples: Russia, Turkey (post-2018), Hungary
   *
   * Characteristics:
   * - Elections exist but unfree/unfair
   * - Power concentrated in executive
   * - Opposition marginalized
   * - Policy response: 18-36 months
   */
  HYBRID_REGIME = 'hybrid_regime',

  /**
   * Theocratic Republic
   * Examples: Iran
   *
   * Characteristics:
   * - Religious authority supreme
   * - Elected institutions subordinate
   * - Parallel power structures
   * - Policy response: 36-60 months (dual approval needed)
   */
  THEOCRATIC_REPUBLIC = 'theocratic_republic',

  /**
   * Absolute Monarchy / Autocracy
   * Examples: Saudi Arabia, UAE
   *
   * Characteristics:
   * - Monarchical authority
   * - No elections
   * - Very fast policy shifts possible
   * - Policy response: 6-12 months (but depends on monarch)
   */
  ABSOLUTE_MONARCHY = 'absolute_monarchy',
}

/**
 * Government type characteristics
 */
export interface GovernmentTypeCharacteristics {
  type: GovernmentType;

  /** Display name */
  name: string;

  /** Base policy response time (months) */
  basePolicyResponseTime: number;

  /** Can early elections occur? */
  allowsEarlyElections: boolean;

  /** Regular election cycle (months), null if no elections */
  electionCycleMonths: number | null;

  /** Coalition formation required? */
  requiresCoalitions: boolean;

  /** Typical state capacity range (0-1 scale) */
  typicalCapacity: {
    min: number;
    max: number;
  };

  /** Decision-making speed multiplier (1.0 = baseline) */
  decisionSpeed: number;
}

/**
 * Government type characteristics lookup
 */
export const GOVERNMENT_TYPE_CHARACTERISTICS: Record<GovernmentType, GovernmentTypeCharacteristics> = {
  [GovernmentType.PARLIAMENTARY_DEMOCRACY]: {
    type: GovernmentType.PARLIAMENTARY_DEMOCRACY,
    name: 'Parliamentary Democracy',
    basePolicyResponseTime: 30,
    allowsEarlyElections: true,
    electionCycleMonths: 48,
    requiresCoalitions: true,
    typicalCapacity: { min: 0.6, max: 0.9 },
    decisionSpeed: 1.0,
  },

  [GovernmentType.PRESIDENTIAL_DEMOCRACY]: {
    type: GovernmentType.PRESIDENTIAL_DEMOCRACY,
    name: 'Presidential Democracy',
    basePolicyResponseTime: 42,
    allowsEarlyElections: false,
    electionCycleMonths: 48,
    requiresCoalitions: false,
    typicalCapacity: { min: 0.5, max: 0.8 },
    decisionSpeed: 0.8,
  },

  [GovernmentType.SEMI_PRESIDENTIAL_DEMOCRACY]: {
    type: GovernmentType.SEMI_PRESIDENTIAL_DEMOCRACY,
    name: 'Semi-Presidential Democracy',
    basePolicyResponseTime: 36,
    allowsEarlyElections: true,
    electionCycleMonths: 60,
    requiresCoalitions: true,
    typicalCapacity: { min: 0.5, max: 0.8 },
    decisionSpeed: 0.9,
  },

  [GovernmentType.AUTHORITARIAN_TECHNOCRACY]: {
    type: GovernmentType.AUTHORITARIAN_TECHNOCRACY,
    name: 'Authoritarian Technocracy',
    basePolicyResponseTime: 18,
    allowsEarlyElections: false,
    electionCycleMonths: null,
    requiresCoalitions: false,
    typicalCapacity: { min: 0.7, max: 0.95 },
    decisionSpeed: 2.0,
  },

  [GovernmentType.HYBRID_REGIME]: {
    type: GovernmentType.HYBRID_REGIME,
    name: 'Hybrid Regime',
    basePolicyResponseTime: 27,
    allowsEarlyElections: false,
    electionCycleMonths: 48,
    requiresCoalitions: false,
    typicalCapacity: { min: 0.3, max: 0.7 },
    decisionSpeed: 1.3,
  },

  [GovernmentType.THEOCRATIC_REPUBLIC]: {
    type: GovernmentType.THEOCRATIC_REPUBLIC,
    name: 'Theocratic Republic',
    basePolicyResponseTime: 48,
    allowsEarlyElections: false,
    electionCycleMonths: 48,
    requiresCoalitions: false,
    typicalCapacity: { min: 0.3, max: 0.6 },
    decisionSpeed: 0.7,
  },

  [GovernmentType.ABSOLUTE_MONARCHY]: {
    type: GovernmentType.ABSOLUTE_MONARCHY,
    name: 'Absolute Monarchy',
    basePolicyResponseTime: 9,
    allowsEarlyElections: false,
    electionCycleMonths: null,
    requiresCoalitions: false,
    typicalCapacity: { min: 0.4, max: 0.8 },
    decisionSpeed: 3.0,
  },
};

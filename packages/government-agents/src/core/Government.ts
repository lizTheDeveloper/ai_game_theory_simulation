/**
 * Government Agent
 *
 * Represents a real-world government with political structure,
 * state capacity, and decision-making capabilities
 *
 * @module core/Government
 */

import { GovernmentType, GOVERNMENT_TYPE_CHARACTERISTICS, GovernmentTypeCharacteristics } from './GovernmentType.js';
import { StateCapacity } from './StateCapacity.js';

/**
 * Government configuration
 */
export interface GovernmentConfig {
  /** ISO 3166-1 alpha-3 country code */
  countryCode: string;

  /** Country name */
  countryName: string;

  /** Government type */
  type: GovernmentType;

  /** State capacity metrics */
  capacity: StateCapacity;

  /** Population (millions) */
  population: number;

  /** GDP (billions USD, PPP) */
  gdpPPP: number;

  /** Current year of government data */
  year: number;
}

/**
 * Government Agent
 *
 * Core political actor in simulation
 */
export class Government {
  public readonly countryCode: string;
  public readonly countryName: string;
  public readonly type: GovernmentType;
  public readonly capacity: StateCapacity;
  public readonly population: number;
  public readonly gdpPPP: number;
  public readonly year: number;
  public readonly characteristics: GovernmentTypeCharacteristics;

  constructor(config: GovernmentConfig) {
    this.countryCode = config.countryCode;
    this.countryName = config.countryName;
    this.type = config.type;
    this.capacity = config.capacity;
    this.population = config.population;
    this.gdpPPP = config.gdpPPP;
    this.year = config.year;
    this.characteristics = GOVERNMENT_TYPE_CHARACTERISTICS[config.type];
  }

  /**
   * Get base policy response time for this government
   * Accounts for government type characteristics
   */
  public getBasePolicyResponseTime(): number {
    return this.characteristics.basePolicyResponseTime;
  }

  /**
   * Get policy success rate for this government
   * Accounts for state capacity
   */
  public getPolicySuccessRate(): number {
    return this.capacity.derived.policySuccessMultiplier;
  }

  /**
   * Get implementation noise for this government
   * Higher values = more corruption/inefficiency
   */
  public getImplementationNoise(): number {
    return this.capacity.derived.implementationNoise;
  }

  /**
   * Get AI comprehension lag for this government
   * How long to understand new AI capabilities (months)
   */
  public getAIComprehensionLag(): number {
    return this.capacity.derived.aiComprehensionLagMonths;
  }

  /**
   * Can this government hold early elections?
   */
  public canHoldEarlyElections(): boolean {
    return this.characteristics.allowsEarlyElections;
  }

  /**
   * Does this government require coalition formation?
   */
  public requiresCoalitions(): boolean {
    return this.characteristics.requiresCoalitions;
  }

  /**
   * Get decision-making speed relative to baseline
   * Higher = faster decisions
   */
  public getDecisionSpeed(): number {
    return this.characteristics.decisionSpeed;
  }

  /**
   * String representation
   */
  public toString(): string {
    return `${this.countryName} (${this.countryCode}) - ${this.characteristics.name}`;
  }
}

/**
 * Unknown Unknown Event System (P3.2)
 *
 * Truly unexpected events (black swans) outside the tech tree/crisis system.
 *
 * Research basis:
 * - Nassim Taleb's "Black Swan" theory (2007)
 * - Historical examples: 2008 financial crisis, COVID-19, Fukushima
 * - Unexpected discoveries: CRISPR (2012), Transformers (2017), mRNA vaccines (2020)
 */

export interface UnknownUnknownEvent {
  /**
   * Unique identifier for this event instance
   */
  id: string;

  /**
   * Human-readable name
   */
  name: string;

  /**
   * Event category
   */
  category: 'breakthrough' | 'crisis' | 'paradigm_shift';

  /**
   * When the event occurred (simulation month)
   */
  timestamp: number;

  /**
   * Impact characteristics
   */
  impact: {
    /**
     * Positive (beneficial) or negative (harmful)
     */
    positive: boolean;

    /**
     * Magnitude of impact
     */
    magnitude: 'minor' | 'major' | 'transformative';

    /**
     * Domains affected (for logging/analysis)
     */
    domains: string[];
  };

  /**
   * Human-readable description of what happened
   */
  description: string;
}

/**
 * Unknown Unknown configuration
 */
export interface UnknownUnknownConfig {
  /**
   * Base probability per month (0.001 = 0.1%)
   */
  baseProbability: number;

  /**
   * Maximum total probability (with all multipliers)
   */
  maxProbability: number;

  /**
   * Uncertainty multiplier factor
   * totalProb = baseProb * (1 + globalUncertainty * uncertaintyFactor)
   */
  uncertaintyFactor: number;

  /**
   * AI capability multiplier factor
   * totalProb = baseProb * (1 + maxAICapability * aiCapabilityFactor)
   */
  aiCapabilityFactor: number;
}

/**
 * Default configuration (conservative, research-backed)
 */
export const DEFAULT_UNKNOWN_UNKNOWN_CONFIG: UnknownUnknownConfig = {
  baseProbability: 0.001,      // 0.1% per month (~1.2% per year)
  maxProbability: 0.05,         // 5% per month cap (prevents excessive randomness)
  uncertaintyFactor: 2.0,       // Double during max uncertainty
  aiCapabilityFactor: 0.5,      // Up to +50% with superhuman AI
};

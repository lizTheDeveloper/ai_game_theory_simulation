/**
 * Unknown Unknown Event System (P3.2)
 *
 * Truly unexpected events (black swans) outside the tech tree/crisis system.
 *
 * Research basis:
 * - Toby Ord, "The Precipice" (2020): Quantified low-probability catastrophic events
 * - Reinhart & Rogoff, "This Time Is Different" (2009): Economic crisis durations (24mo)
 * - Nassim Taleb's "Black Swan" theory (2007): Retrospectively predictable surprises
 * - Historical examples: 2008 financial crisis (-5% GDP), COVID-19 (-0.08% mortality)
 *
 * Parameter consensus: `.claude/chatroom/research-consensus-20251030_food_security.txt`
 * - Base probability: 0.15% monthly (1.8% annual) - ~1 event per 20-year run
 * - Impact magnitudes: Research-backed (10× reduction from original estimates)
 * - Minimum threshold: ≥1% GDP OR ≥0.01% mortality (filters negligible events)
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
 *
 * Research consensus (Oct 30, 2025):
 * - baseProbability: 0.0015 (0.15% monthly) = ~1 event per 20y run
 * - Derived from: 2-3 unprecedented events per 20y × 50% filter for simulation-affecting
 * - Historical backing: COVID-19, 2008 crisis, Spanish Flu, Fukushima (2-3 per 20y)
 */
export const DEFAULT_UNKNOWN_UNKNOWN_CONFIG: UnknownUnknownConfig = {
  baseProbability: 0.0015,     // 0.15% per month (~1.8% per year) - Ord (2020) quantified events
  maxProbability: 0.05,         // 5% per month cap (prevents excessive randomness)
  uncertaintyFactor: 2.0,       // Double during max uncertainty
  aiCapabilityFactor: 0.5,      // Up to +50% with superhuman AI
};

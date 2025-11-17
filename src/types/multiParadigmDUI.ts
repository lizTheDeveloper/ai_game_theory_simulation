/**
 * Multi-Paradigm Dystopia-Utopia Index (DUI)
 *
 * Models dystopia/utopia through four distinct paradigmatic lenses,
 * showing fundamental value conflicts rather than false universal consensus.
 *
 * Core Insight: Singapore is simultaneously a Development utopia (HDI 0.939)
 * AND Western dystopia (Freedom House 48/100). Norway is Western/Development
 * utopia AND Ecological dystopia (oil economy). Paradigm conflicts are
 * diagnostic, not errors.
 *
 * IMPORTANT: Paradigms are ANALYTICAL TOOLS (evaluative frameworks), not political
 * actors with agency. They don't "veto" policies - they provide different perspectives
 * for conflict detection. High paradigm divergence indicates contested outcomes worth
 * analyzing, not system failures to fix. (CAVEAT 8 clarification, Nov 16, 2025)
 *
 * Three-Tier Architecture:
 * - Tier 1: Simulation Foundation (what drives outcomes - already exists)
 * - Tier 2A: High-Confidence Paradigms (drive + report)
 * - Tier 2B: Reporting-Only Paradigms (diagnostic lens)
 *
 * Research Foundation:
 * - Phase 1: 4 paradigm documents (~55,000 words, 100+ sources)
 * - Phase 2: 42 indicators mapped (9 Western, 14 Development, 12 Ecological, 7 Indigenous)
 * - Quality Gates: 73% confidence (Phase 1), 68% confidence (Phase 2)
 * - Phase 3: Research verification (Sangha et al. 2024, V-Dem 2025) - Nov 16, 2025
 *
 * @module types/multiParadigmDUI
 */

/**
 * Confidence level for paradigm scores
 *
 * HIGH: Official data, 180+ countries, annual updates (V-Dem, UNDP, WHO)
 * MEDIUM: Official data, limited countries or irregular updates (WVS, some boundaries)
 * LOW: Proxy indicators, substantial uncertainty (Indigenous paradigm proxies)
 * SPECULATIVE: Estimated, no direct measurement
 */
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'SPECULATIVE';

/**
 * Uncertainty band for paradigm scores
 *
 * Captures measurement error, model uncertainty, and data gaps.
 * Example: Ecological paradigm has ±50% uncertainty on some boundaries.
 */
export interface UncertaintyBand {
  /** Pessimistic bound (lower estimate) */
  low: number;

  /** Optimistic bound (upper estimate) */
  high: number;

  /** Source of uncertainty (measurement error, model, data gap) */
  source: string;
}

/**
 * Individual indicator within a paradigm
 *
 * Each paradigm aggregates 5-15 indicators using geometric mean.
 */
export interface ParadigmIndicator {
  /** Indicator ID (e.g., 'vdem_electoral_democracy') */
  id: string;

  /** Human-readable name */
  name: string;

  /** Current value (0-100 scale) */
  value: number;

  /** Weight in paradigm aggregation (typically 1/N for equal weights) */
  weight: number;

  /** Confidence level for this indicator */
  confidence: ConfidenceLevel;

  /** Does this indicator have actual data (vs imputed/derived)? */
  hasData: boolean;

  /** Uncertainty band (if applicable) */
  uncertaintyBand?: UncertaintyBand;
}

/**
 * Paradigm score (0-100)
 *
 * Aggregated using geometric mean (non-compensatory):
 * - A single low indicator significantly lowers overall score
 * - Prevents "elite utopia" scenarios (high average masking severe deficits)
 * - Matches UNDP HDI methodology
 */
export interface ParadigmScore {
  /** Aggregate score (0-100) */
  value: number;

  /** Confidence level for overall paradigm */
  confidence: ConfidenceLevel;

  /** Data availability (0-1): % of indicators with actual data */
  dataAvailability: number;

  /** Uncertainty band (if applicable) */
  uncertaintyBand?: UncertaintyBand;

  /** Component indicators (5-15 per paradigm) */
  indicators: ParadigmIndicator[];

  /** Breakdown by dimension (optional, for detailed reporting) */
  dimensions?: Record<string, number>;

  /** Which systems/data sources this paradigm derives from */
  derivedFrom: string[];
}

/**
 * Diagnostic lens paradigm (reporting-only, doesn't drive simulation)
 *
 * Used for paradigms with incomplete data (Indigenous/Communitarian).
 * Derives scores from existing simulation mechanics + proxies where available.
 */
export interface DiagnosticLens extends ParadigmScore {
  /** Explicitly mark as non-driving */
  drivesSimulation: false;

  /** Caveat for users about data limitations */
  caveat: string;

  /** Breakdown of score derivation */
  derivation: {
    /** % from existing simulation mechanics (e.g., social cohesion) */
    fromSimulation: number;

    /** % from proxy indicators (e.g., WVS social trust) */
    fromProxies: number;

    /** % estimated/imputed */
    estimated: number;
  };
}

/**
 * Paradigm divergence metrics
 *
 * Tracks how much paradigms disagree (the diagnostic value!).
 */
export interface ParadigmDivergence {
  /** Overall divergence (std dev across 4 scores, 0=consensus, 50=extreme conflict) */
  overall: number;

  /** Max - min score (Singapore: 94 - 22 = 72 point range) */
  maxRange: number;

  /** Pairwise differences (6 pairs: Western-Development, etc.) */
  pairwise: {
    western_development: number;
    western_ecological: number;
    western_indigenous: number;
    development_ecological: number;
    development_indigenous: number;
    ecological_indigenous: number;
  };

  /** Trend over last 12 months */
  trend: 'CONVERGING' | 'DIVERGING' | 'STABLE';
}

/**
 * Paradigm correlation tracking
 *
 * Validates research claims about paradigm relationships.
 * Expected: Western ↔ Development ~0.7-0.9, Development ↔ Ecological ~-0.6
 */
export interface ParadigmCorrelations {
  western_development: number;   // Expected ~0.7-0.9 (wealth correlation)
  western_ecological: number;    // Expected negative ~-0.4
  western_indigenous: number;    // Expected ~0.4-0.6
  development_ecological: number; // Expected negative ~-0.6
  development_indigenous: number; // Expected ~0.2-0.4
  ecological_indigenous: number;  // Expected ~0.5-0.7
}

/**
 * Outcome classification (optional, for Monte Carlo aggregation)
 *
 * Don't force single utopia/dystopia answer - show all 4 paradigm scores.
 * But for aggregation, classify how many paradigms say "utopia" vs "dystopia".
 */
export interface MultiParadigmOutcomeClassification {
  /** How many paradigms in utopia (≥80) */
  utopiasCount: number;

  /** How many paradigms in dystopia (≤30) */
  dystopiasCount: number;

  /** Some say utopia, some say dystopia (Singapore pattern) */
  contested: boolean;

  /** Human-readable summary */
  label: string;
  // Examples:
  // - "Development Utopia, Liberal Dystopia" (Singapore)
  // - "Ecological Dystopia, Liberal/Development Utopia" (Norway)
  // - "Multi-Paradigm Dystopia" (Yemen)
  // - "All-Four Utopia" (extremely rare, 0.5% of runs)
}

/**
 * Multi-Paradigm Dystopia-Utopia Index
 *
 * Complete state for 4-paradigm measurement system.
 */
export interface MultiParadigmDUI {
  /**
   * TIER 2A: High-Confidence Paradigms (drive simulation + report)
   */
  paradigmScores: {
    /**
     * Western Liberal (Freedom-Focused)
     *
     * Data: V-Dem 2024 (202 countries), Freedom House 2024-2025 (195 countries)
     * Confidence: HIGH
     * Drives: Democratic governance affects outcomes
     * Reports: Political freedom, civil liberties, economic freedom, rule of law
     *
     * Utopia: V-Dem ≥0.80, Freedom House ≥90/100 (~8 countries, 0.4% of world)
     * Dystopia: V-Dem <0.30, Freedom House <30/100
     */
    western: ParadigmScore & { drivesSimulation: true };

    /**
     * Development Needs (Survival-Focused)
     *
     * Data: UNDP HDI 2024 (193 countries), OPHI MPI 2024 (112 countries), WHO, FAO
     * Confidence: HIGH
     * Drives: Poverty → instability, health → productivity
     * Reports: Human development, poverty, food security, healthcare, education
     *
     * Utopia: HDI ≥0.900, MPI <0.005 (~25-30 countries, 10-12% of world)
     * Dystopia: HDI <0.550, MPI >0.300
     */
    development: ParadigmScore & { drivesSimulation: true };

    /**
     * Ecological Harmony (Sustainability-Focused)
     *
     * Data: Richardson et al. 2023 (9 planetary boundaries), Global Footprint Network 2024 (188 countries)
     * Confidence: MEDIUM-HIGH (±50% uncertainty on some boundaries)
     * Drives: Boundary transgression → crises
     * Reports: 9 boundaries, ecological footprint, climate stability, air quality
     *
     * Utopia: All 9 boundaries safe, footprint ≤1.5 gha (ZERO countries currently)
     * Dystopia: 6+ boundaries breached (current global state)
     */
    ecological: ParadigmScore & { drivesSimulation: true };
  };

  /**
   * TIER 2B: Reporting-Only Paradigms (diagnostic lens)
   */
  diagnosticLenses: {
    /**
     * Indigenous/Communitarian (Harmony-Focused)
     *
     * Data: Bhutan GNH 2024 (1 country, HIGH), WVS Wave 7 (80 countries, MEDIUM), derived (115 countries, LOW)
     * Confidence: LOW-MEDIUM (only 1 country has direct measurement)
     * Drives: NO - uses existing social cohesion mechanics
     * Reports: Seven interconnected domains (Sangha et al. 2024):
     *   1. Strong family (kinship systems)
     *   2. Strong community (social networks)
     *   3. Connection to culture, Country, and identity (bundled concept)
     *   4. Self-determination (autonomy)
     *   5. Health (physical/mental wellbeing)
     *   6. Material wellbeing (economic security)
     *   7. Subjective wellbeing (Liyan - holistic feeling of connection)
     *
     * Liyan (Yawuru): Holistic wellbeing felt in body, mind, spirit - how people FEEL
     * about themselves, their connections to Country, and family/community (Sangha et al. 2024).
     *
     * Country-centrality: Country (land/environment) is foundational - all other domains
     * are attached to it. Country threats cascade to ALL wellbeing dimensions.
     *
     * Geographic specificity: Based on Australian Aboriginal frameworks (Sangha et al. 2024).
     * Country-centrality likely generalizes to other Indigenous traditions (Māori whenua,
     * First Nations land relations) but not empirically verified globally.
     *
     * Utopia: GNH ≥66%, social trust >60% (~1-2 countries)
     * Dystopia: Social trust <30%, cultural genocide, atomization
     *
     * Advocacy: Makes visible what we don't measure (199/200 countries lack GNH-equivalent)
     */
    indigenous: DiagnosticLens;
  };

  /**
   * Paradigm divergence (the diagnostic value!)
   */
  divergence: ParadigmDivergence;

  /**
   * Paradigm correlations (validates research claims)
   */
  correlations: ParadigmCorrelations;

  /**
   * Outcome classification (optional, for aggregation)
   */
  outcome: MultiParadigmOutcomeClassification;

  /**
   * Country-specific paradigm alignment
   *
   * Which paradigm does each country optimize for?
   * Examples: USA → Western, China → Development, Bhutan → Indigenous, Norway → Western+Development
   */
  dominantParadigm?: 'western' | 'development' | 'ecological' | 'indigenous' | 'contested';

  /**
   * Historical tracking (for paradigm shifts)
   *
   * Track 4 paradigm scores over time to detect:
   * - China's shift: Development-only → Development+Ecological (2012-2025)
   * - US communitarian collapse: Social trust 55% → 35% (1960-2024)
   * - Nordic maintenance: Can 3/4 paradigms be sustained? (Western+Development+Indigenous)
   */
  history: Array<{
    month: number;
    western: number;
    development: number;
    ecological: number;
    indigenous: number;
    // ISSUE-7 & 8 FIX (Oct 30, 2025): Add population and biosphere for post-simulation analysis
    // NO optional chaining - fail loudly if missing (research simulation, not production app)
    population: number; // Total human population in billions
    globalPopulation: number; // Alias for population (compatibility)
    totalPopulation: number; // Alias for population (compatibility)
    biosphere_integrity: number; // Extinction rate / safe threshold (normalized to 1.0 baseline)
    biosphere: number; // Alias for biosphere_integrity (compatibility)
  }>;

  /**
   * Western Liberal Component Scores (Oct 21, 2025 - Goodhart's Law Fix)
   *
   * Geometric mean headline number obscures nuance. Expose components for analysis.
   *
   * Real story: "Electoral democracy 45%, civil liberties 8%, rule of law 30%"
   * NOT: "Western Liberal: 2/100" (compresses everything, invokes Goodhart)
   *
   * **Oct 27, 2025:** Added privacyFreedom component (surveillance tracking)
   */
  westernLiberalComponents?: Array<{
    month: number;
    electoralDemocracy: number;  // 0-100
    civilLiberties: number;      // 0-100
    ruleOfLaw: number;           // 0-100
    economicFreedom: number;     // 0-100
    privacyFreedom: number;      // 0-100 (Oct 27, 2025 - inverted surveillance level)
  }>;
}

/**
 * Country-level Multi-Paradigm DUI
 *
 * For 30 countries with full government system integration, we track
 * country-specific paradigm scores. Others derive from regional patterns.
 */
export interface CountryParadigmScores {
  /** ISO 3166-1 alpha-3 country code (USA, CHN, DEU, etc.) */
  countryCode: string;

  /** Country name */
  countryName: string;

  /** 4 paradigm scores for this country */
  scores: {
    western: number;      // 0-100
    development: number;  // 0-100
    ecological: number;   // 0-100
    indigenous: number;   // 0-100
  };

  /** Paradigm divergence for this country */
  divergence: number;

  /** Dominant paradigm for this country */
  dominantParadigm: 'western' | 'development' | 'ecological' | 'indigenous' | 'contested';

  /** Data quality flags */
  dataQuality: {
    /** Does this country have government system data? (30 countries yes) */
    hasGovernmentData: boolean;

    /** Does this country have WVS proxy data? (80 countries yes) */
    hasWVSData: boolean;

    /** Overall data confidence for this country */
    confidence: ConfidenceLevel;
  };
}

/**
 * Claim Detection Heuristics
 *
 * Heuristic rules for claim classification when pattern matching is insufficient.
 * Includes certainty detection, hedge detection, and claim type inference.
 *
 * Task 1.5.3 - Claim Detection Heuristics (Platform Engineer - Marcus)
 */

import type { ClaimType, CertaintyLevel } from '@/types/claims';

// ============================================================================
// Certainty Detection
// ============================================================================

/**
 * Certainty language keywords
 */
const CERTAINTY_KEYWORDS = {
  definitive: [
    'is',
    'are',
    'will',
    'causes',
    'caused',
    'proves',
    'proven',
    'demonstrates',
    'demonstrated',
    'shows',
    'confirms',
    'confirmed',
    'establishes',
    'established',
  ],
  high: [
    'likely',
    'probable',
    'highly',
    'significant',
    'strong evidence',
    'clearly',
    'obviously',
    'undoubtedly',
    'certainly',
  ],
  moderate: [
    'suggests',
    'suggested',
    'indicates',
    'indicated',
    'appears',
    'seems',
    'tends to',
    'generally',
    'typically',
    'often',
  ],
  low: ['may', 'might', 'could', 'possible', 'potentially', 'sometimes', 'occasionally'],
  speculative: [
    'possibly',
    'perhaps',
    'conceivably',
    'hypothetically',
    'theoretically',
    'speculatively',
  ],
};

/**
 * Detect certainty level from text
 *
 * Analyzes language to determine how definitive a claim is.
 *
 * @param text - Text to analyze
 * @returns Certainty level
 */
export function detectCertainty(text: string): CertaintyLevel {
  const lowerText = text.toLowerCase();

  // Check in order from most certain to least certain
  for (const [level, keywords] of Object.entries(CERTAINTY_KEYWORDS)) {
    for (const keyword of keywords) {
      // Use word boundaries to avoid partial matches
      const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
      if (pattern.test(lowerText)) {
        return level as CertaintyLevel;
      }
    }
  }

  // Default: moderate
  return 'moderate';
}

/**
 * Detect hedging language
 *
 * Hedging reduces certainty (e.g., "may suggest", "could indicate").
 *
 * @param text - Text to analyze
 * @returns True if hedging detected
 */
export function detectHedging(text: string): boolean {
  const hedgePatterns = [
    /\bmay\s+(?:suggest|indicate|show|imply)/gi,
    /\bcould\s+(?:suggest|indicate|show|imply)/gi,
    /\bmight\s+(?:suggest|indicate|show|imply)/gi,
    /\bpossibly\s+(?:suggests?|indicates?|shows?|implies?)/gi,
    /\bpotentially\s+(?:suggests?|indicates?|shows?|implies?)/gi,
    /\bappears?\s+to\s+suggest/gi,
    /\bseems?\s+to\s+suggest/gi,
  ];

  for (const pattern of hedgePatterns) {
    if (pattern.test(text)) {
      return true;
    }
  }

  return false;
}

/**
 * Count hedge words in text
 *
 * More hedges = lower certainty.
 *
 * @param text - Text to analyze
 * @returns Number of hedge words
 */
export function countHedges(text: string): number {
  const hedgeWords = [
    'may',
    'might',
    'could',
    'possibly',
    'potentially',
    'perhaps',
    'seems',
    'appears',
    'suggests',
    'likely',
    'probable',
  ];

  const lowerText = text.toLowerCase();
  let count = 0;

  for (const word of hedgeWords) {
    const pattern = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = lowerText.match(pattern);
    if (matches) {
      count += matches.length;
    }
  }

  return count;
}

// ============================================================================
// Claim Type Heuristics
// ============================================================================

/**
 * Classify claim type using heuristics
 *
 * Used when pattern matching doesn't give clear result.
 *
 * @param text - Text to classify
 * @returns Likely claim type or null
 */
export function classifyByHeuristics(text: string): ClaimType | null {
  const lowerText = text.toLowerCase();

  // Quantitative: Has numbers
  if (/\d+(?:\.\d+)?/.test(text)) {
    return 'quantitative';
  }

  // Causal: Strong causative language
  if (
    /\b(causes?|due to|because of|results? in|leads? to|triggers?)\b/i.test(
      lowerText
    )
  ) {
    return 'causal';
  }

  // Correlation: Association language without causation
  if (
    /\b(correlate|associate|relate|link|connection)\b/i.test(lowerText) &&
    !/\b(cause|due to|because)\b/i.test(lowerText)
  ) {
    return 'correlation';
  }

  // Projection: Future tense
  if (/\b(will|shall|expected to|projected to|forecast|predict)\b/i.test(lowerText)) {
    return 'projection';
  }

  // Definition: "is defined as", "refers to", "means"
  if (/\b(defined as|refers? to|means?|is called|known as)\b/i.test(lowerText)) {
    return 'definition';
  }

  // Methodology: Methods language
  if (
    /\b(method|procedure|technique|approach|measured|analyzed|tested|conducted)\b/i.test(
      lowerText
    )
  ) {
    return 'methodology';
  }

  // Default: qualitative if has claim-like structure
  if (hasClaimStructure(text)) {
    return 'qualitative';
  }

  return null;
}

/**
 * Check if text has claim-like structure
 *
 * Heuristic: sentence with subject-verb-object and conclusion words.
 *
 * @param text - Text to check
 * @returns True if claim-like
 */
export function hasClaimStructure(text: string): boolean {
  const lowerText = text.toLowerCase();

  // Must have a verb
  const verbPattern =
    /\b(is|are|was|were|shows?|demonstrates?|indicates?|suggests?|proves?)\b/i;
  if (!verbPattern.test(lowerText)) {
    return false;
  }

  // Must be long enough
  if (text.length < 20) {
    return false;
  }

  // Must not be a question
  if (text.includes('?')) {
    return false;
  }

  return true;
}

// ============================================================================
// Quantitative vs Qualitative
// ============================================================================

/**
 * Classify as quantitative or qualitative
 *
 * @param text - Text to classify
 * @returns 'quantitative' | 'qualitative' | null
 */
export function classifyQuantitativeVsQualitative(
  text: string
): 'quantitative' | 'qualitative' | null {
  // Quantitative indicators
  const hasNumbers = /\d+(?:\.\d+)?/.test(text);
  const hasUnits = /\b(percent|%|ppm|degrees?|°C|tons?|years?|billion|million)\b/i.test(
    text
  );
  const hasStatistics = /\b(mean|median|average|p-value|correlation|significant)\b/i.test(
    text
  );

  if (hasNumbers || hasUnits || hasStatistics) {
    return 'quantitative';
  }

  // Qualitative indicators
  const hasQualitativeLanguage =
    /\b(better|worse|improved|degraded|increased|decreased|higher|lower)\b/i.test(text);

  if (hasQualitativeLanguage) {
    return 'qualitative';
  }

  return null;
}

// ============================================================================
// Statistical Claim Detection
// ============================================================================

/**
 * Detect if claim contains statistical information
 *
 * @param text - Text to check
 * @returns True if statistical claim
 */
export function isStatisticalClaim(text: string): boolean {
  const statisticalPatterns = [
    /\bp\s*[<>=]\s*0?\.\d+/i, // p-value
    /\bp-value/i,
    /\bsignificant/i,
    /\bcorrelation\s+coefficient/i,
    /\br\s*=\s*0?\.\d+/i,
    /\bmean\s+(?:of\s+)?(\d+(?:\.\d+)?)/i,
    /\bmedian/i,
    /\bstandard\s+deviation/i,
    /\bconfidence\s+interval/i,
    /\bt-test/i,
    /\bANOVA/i,
    /\bregression/i,
  ];

  for (const pattern of statisticalPatterns) {
    if (pattern.test(text)) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// Claim Strength Assessment
// ============================================================================

/**
 * Assess claim strength (0-1)
 *
 * Combines certainty, hedging, and evidence language.
 *
 * @param text - Text to assess
 * @returns Strength score (0 = weak, 1 = strong)
 */
export function assessClaimStrength(text: string): number {
  let score = 0.5; // Base score

  // Certainty boost
  const certainty = detectCertainty(text);
  const certaintyBoost = {
    definitive: 0.3,
    high: 0.2,
    moderate: 0.1,
    low: -0.1,
    speculative: -0.2,
  };
  score += certaintyBoost[certainty];

  // Hedging penalty
  const hedgeCount = countHedges(text);
  score -= hedgeCount * 0.05;

  // Evidence language boost
  if (/\b(data|evidence|research|study|studies|findings?)\b/i.test(text)) {
    score += 0.1;
  }

  // Statistical evidence boost
  if (isStatisticalClaim(text)) {
    score += 0.15;
  }

  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, score));
}

// ============================================================================
// Claim Importance Assessment
// ============================================================================

/**
 * Assess claim importance based on content
 *
 * Uses domain-specific keywords to determine if claim is central to research.
 *
 * @param text - Text to assess
 * @param domain - Research domain (optional)
 * @returns Importance score (0 = low, 1 = high)
 */
export function assessClaimImportance(
  text: string,
  domain?: 'climate' | 'ai' | 'social' | 'economic'
): number {
  let score = 0.5; // Base importance

  const lowerText = text.toLowerCase();

  // Domain-specific keywords
  const domainKeywords: Record<string, string[]> = {
    climate: [
      'temperature',
      'emissions',
      'carbon',
      'climate',
      'warming',
      'sea level',
      'extinction',
      'biodiversity',
    ],
    ai: [
      'artificial intelligence',
      'machine learning',
      'neural network',
      'alignment',
      'agi',
      'superintelligence',
    ],
    social: ['population', 'inequality', 'poverty', 'education', 'health', 'society'],
    economic: ['gdp', 'growth', 'economy', 'employment', 'income', 'wealth'],
  };

  // Boost for domain keywords
  if (domain && domainKeywords[domain]) {
    for (const keyword of domainKeywords[domain]) {
      if (lowerText.includes(keyword)) {
        score += 0.1;
      }
    }
  }

  // Boost for crisis language
  const crisisWords = [
    'catastrophic',
    'critical',
    'urgent',
    'crisis',
    'collapse',
    'failure',
    'disaster',
  ];
  for (const word of crisisWords) {
    if (lowerText.includes(word)) {
      score += 0.15;
      break;
    }
  }

  // Boost for breakthrough language
  const breakthroughWords = [
    'breakthrough',
    'revolutionary',
    'transformative',
    'unprecedented',
    'novel',
  ];
  for (const word of breakthroughWords) {
    if (lowerText.includes(word)) {
      score += 0.1;
      break;
    }
  }

  // Clamp to [0, 1]
  return Math.max(0, Math.min(1, score));
}

// ============================================================================
// Context Analysis
// ============================================================================

/**
 * Detect if claim is conditional
 *
 * Conditional claims have lower certainty (e.g., "if X, then Y").
 *
 * @param text - Text to check
 * @returns True if conditional
 */
export function isConditionalClaim(text: string): boolean {
  const conditionalPatterns = [
    /\bif\s+.+\s+then\b/i,
    /\bunless\b/i,
    /\bprovided\s+that\b/i,
    /\bassuming\b/i,
    /\bdepending\s+on\b/i,
  ];

  for (const pattern of conditionalPatterns) {
    if (pattern.test(text)) {
      return true;
    }
  }

  return false;
}

/**
 * Detect if claim is comparative
 *
 * Comparative claims compare two or more things.
 *
 * @param text - Text to check
 * @returns True if comparative
 */
export function isComparativeClaim(text: string): boolean {
  const comparativePatterns = [
    /\b(more|less|greater|fewer|higher|lower)\s+than\b/i,
    /\bcompared\s+to\b/i,
    /\brelative\s+to\b/i,
    /\bversus\b/i,
    /\bvs\.?\b/i,
  ];

  for (const pattern of comparativePatterns) {
    if (pattern.test(text)) {
      return true;
    }
  }

  return false;
}

/**
 * Detect temporal scope of claim
 *
 * @param text - Text to check
 * @returns 'past' | 'present' | 'future' | 'timeless'
 */
export function detectTemporalScope(
  text: string
): 'past' | 'present' | 'future' | 'timeless' {
  const lowerText = text.toLowerCase();

  // Future indicators
  if (
    /\b(will|shall|expected|projected|forecast|predict|by\s+\d{4})\b/i.test(lowerText)
  ) {
    return 'future';
  }

  // Past indicators
  if (/\b(was|were|showed|demonstrated|found|observed|historical)\b/i.test(lowerText)) {
    return 'past';
  }

  // Present indicators
  if (/\b(is|are|shows?|currently|today|now)\b/i.test(lowerText)) {
    return 'present';
  }

  // Timeless (definitions, general principles)
  if (/\b(always|never|defined as|refers? to)\b/i.test(lowerText)) {
    return 'timeless';
  }

  return 'present'; // Default
}

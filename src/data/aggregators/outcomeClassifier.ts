/**
 * Multi-Paradigm Outcome Classifier
 *
 * Classifies outcomes based on how many paradigms say "utopia" vs "dystopia".
 * Don't force single answer - show paradigm conflicts!
 *
 * **Thresholds:**
 * - Utopia: ≥80/100
 * - Dystopia: ≤30/100
 * - Hybrid: 30-80
 *
 * **Examples:**
 * - "Development Utopia, Liberal Dystopia" (Singapore: Dev 94, Western 22)
 * - "Ecological Dystopia, Liberal/Development Utopia" (Norway: Eco 25, Western 93, Dev 98)
 * - "Multi-Paradigm Dystopia" (Yemen: all <30)
 * - "All-Four Utopia" (extremely rare, 0.5% of runs)
 *
 * @module data/aggregators/outcomeClassifier
 */

import type { MultiParadigmOutcomeClassification } from '@/types/multiParadigmDUI';

/**
 * Classify multi-paradigm outcome
 *
 * @param scores - 4 paradigm scores (0-100)
 * @returns Outcome classification
 */
export function classifyOutcome(scores: {
  western: number;
  development: number;
  ecological: number;
  indigenous: number;
}): MultiParadigmOutcomeClassification {
  const UTOPIA_THRESHOLD = 80;
  const DYSTOPIA_THRESHOLD = 30;

  const { western, development, ecological, indigenous } = scores;

  // Count utopias and dystopias
  const utopias: string[] = [];
  const dystopias: string[] = [];
  const hybrids: string[] = [];

  if (western >= UTOPIA_THRESHOLD) utopias.push('Western Liberal');
  else if (western <= DYSTOPIA_THRESHOLD) dystopias.push('Western Liberal');
  else hybrids.push('Western Liberal');

  if (development >= UTOPIA_THRESHOLD) utopias.push('Development');
  else if (development <= DYSTOPIA_THRESHOLD) dystopias.push('Development');
  else hybrids.push('Development');

  if (ecological >= UTOPIA_THRESHOLD) utopias.push('Ecological');
  else if (ecological <= DYSTOPIA_THRESHOLD) dystopias.push('Ecological');
  else hybrids.push('Ecological');

  if (indigenous >= UTOPIA_THRESHOLD) utopias.push('Indigenous');
  else if (indigenous <= DYSTOPIA_THRESHOLD) dystopias.push('Indigenous');
  else hybrids.push('Indigenous');

  const utopiasCount = utopias.length;
  const dystopiasCount = dystopias.length;
  const contested = utopiasCount > 0 && dystopiasCount > 0;

  // Generate label
  let label: string;

  if (utopiasCount === 4) {
    label = 'All-Four Utopia (extremely rare)';
  } else if (dystopiasCount === 4) {
    label = 'Multi-Paradigm Dystopia';
  } else if (contested) {
    // Contested: some utopias, some dystopias
    const utopiaStr = utopias.join('/');
    const dystopiaStr = dystopias.join('/');
    label = `${utopiaStr} Utopia, ${dystopiaStr} Dystopia`;
  } else if (utopiasCount > 0) {
    // Utopias but no dystopias (all others hybrid)
    const utopiaStr = utopias.join('/');
    label = `${utopiaStr} Utopia`;
  } else if (dystopiasCount > 0) {
    // Dystopias but no utopias (all others hybrid)
    const dystopiaStr = dystopias.join('/');
    label = `${dystopiaStr} Dystopia`;
  } else {
    // All hybrids
    label = 'Multi-Paradigm Hybrid (no clear utopia or dystopia)';
  }

  return {
    utopiasCount,
    dystopiasCount,
    contested,
    label,
  };
}

/**
 * Get paradigm outcome details
 *
 * @param scores - 4 paradigm scores (0-100)
 * @returns Breakdown by paradigm
 */
export function getParadigmOutcomes(scores: {
  western: number;
  development: number;
  ecological: number;
  indigenous: number;
}): {
  western: 'utopia' | 'hybrid' | 'dystopia';
  development: 'utopia' | 'hybrid' | 'dystopia';
  ecological: 'utopia' | 'hybrid' | 'dystopia';
  indigenous: 'utopia' | 'hybrid' | 'dystopia';
} {
  const UTOPIA_THRESHOLD = 80;
  const DYSTOPIA_THRESHOLD = 30;

  const classify = (score: number): 'utopia' | 'hybrid' | 'dystopia' => {
    if (score >= UTOPIA_THRESHOLD) return 'utopia';
    if (score <= DYSTOPIA_THRESHOLD) return 'dystopia';
    return 'hybrid';
  };

  return {
    western: classify(scores.western),
    development: classify(scores.development),
    ecological: classify(scores.ecological),
    indigenous: classify(scores.indigenous),
  };
}

/**
 * Get dominant outcome (if exists)
 *
 * @param outcomes - Outcome classification
 * @returns Dominant outcome, or 'contested' if paradigms disagree
 */
export function getDominantOutcome(
  outcomes: MultiParadigmOutcomeClassification
): 'utopia' | 'dystopia' | 'hybrid' | 'contested' {
  if (outcomes.contested) {
    return 'contested';
  } else if (outcomes.utopiasCount >= 3) {
    return 'utopia';
  } else if (outcomes.dystopiasCount >= 3) {
    return 'dystopia';
  } else {
    return 'hybrid';
  }
}

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

/**
 * Create Unified Outcome Classification (Oct 28, 2025)
 *
 * Combines all classification dimensions into one coherent structure.
 * Replaces fragmented classification across multiple systems.
 *
 * @param params - All required classification inputs
 * @returns Unified outcome classification with all dimensions
 */
export function createUnifiedOutcomeClassification(params: {
  primaryOutcome: import('@/types/outcomes').OutcomeType;
  initialPopulation: number;
  finalPopulation: number;
  paradigmScores: {
    western: number;
    development: number;
    ecological: number;
    indigenous: number;
  };
  extinctionClassification?: import('@/types/outcomes').ExtinctionClassification;
}): import('@/types/outcomes').UnifiedOutcomeClassification {
  const { primaryOutcome, initialPopulation, finalPopulation, paradigmScores, extinctionClassification } = params;

  // Calculate mortality
  const mortalityRate = 1 - (finalPopulation / initialPopulation);
  const deathsAbsolute = initialPopulation - finalPopulation;
  const finalPopulationPeople = finalPopulation * 1_000_000_000;

  // CRITICAL ASSERTION (Nov 13, 2025): Population growth cannot be extinction
  // Bug found in Monte Carlo N=10 validation - 2 runs showed -2.0% mortality classified as extinction
  // @see /reviews/bifurcation_mc_n10_validation_20251113.md (CRITICAL-1)
  if (mortalityRate < 0 && primaryOutcome === 'extinction') {
    throw new Error(
      `❌ CRITICAL BUG: Population GROWTH (${(mortalityRate * 100).toFixed(1)}% mortality) cannot be EXTINCTION\n` +
      `   Initial: ${initialPopulation.toFixed(2)}B → Final: ${finalPopulation.toFixed(2)}B\n` +
      `   This indicates primaryOutcome was incorrectly set to 'extinction' upstream.\n` +
      `   Check: ExtinctionSystemPhase, ExtinctionTriggersPhase, or outcome determination logic.`
    );
  }

  // Determine mortality band
  let mortalityBand: import('@/types/outcomes').MortalityBand;
  if (mortalityRate < 0.20) {
    mortalityBand = 'low';
  } else if (mortalityRate < 0.50) {
    mortalityBand = 'moderate';
  } else if (mortalityRate < 0.75) {
    mortalityBand = 'high';
  } else if (mortalityRate < 0.90) {
    mortalityBand = 'extreme';
  } else {
    mortalityBand = 'bottleneck';
  }

  // Determine stratified outcome
  let stratifiedOutcome: import('@/types/outcomes').StratifiedOutcomeType;
  if (finalPopulationPeople < 10_000 || primaryOutcome === 'extinction') {
    stratifiedOutcome = 'extinction';
  } else if (finalPopulation < 0.5) {
    stratifiedOutcome = 'bottleneck';
  } else if (primaryOutcome === 'utopia') {
    stratifiedOutcome = mortalityRate < 0.20 ? 'humane-utopia' : 'pyrrhic-utopia';
  } else if (primaryOutcome === 'dystopia' || primaryOutcome === 'collapse' ||
             primaryOutcome === 'dark_age' || primaryOutcome === 'crisis_era' ||
             primaryOutcome === 'terminal' || primaryOutcome === 'bottleneck') {
    stratifiedOutcome = mortalityRate < 0.20 ? 'humane-dystopia' : 'pyrrhic-dystopia';
  } else {
    stratifiedOutcome = 'inconclusive';
  }

  // Multi-paradigm classification
  const paradigmOutcome = classifyOutcome(paradigmScores);
  const paradigmOutcomes = getParadigmOutcomes(paradigmScores);

  // Generate short label
  let shortLabel: string;
  if (primaryOutcome === 'extinction') {
    shortLabel = 'EXTINCTION';
  } else if (primaryOutcome === 'terminal') {
    shortLabel = 'TERMINAL (EXTINCTION LIKELY)';
  } else if (primaryOutcome === 'bottleneck') {
    shortLabel = 'GENETIC BOTTLENECK';
  } else if (primaryOutcome === 'dark_age') {
    shortLabel = 'DARK AGE';
  } else if (primaryOutcome === 'collapse') {
    shortLabel = stratifiedOutcome === 'pyrrhic-dystopia' ? 'PYRRHIC DYSTOPIA (COLLAPSE)' : 'COLLAPSE';
  } else if (primaryOutcome === 'crisis_era') {
    shortLabel = stratifiedOutcome === 'pyrrhic-dystopia' ? 'PYRRHIC DYSTOPIA (CRISIS ERA)' : 'CRISIS ERA';
  } else if (primaryOutcome === 'status_quo') {
    shortLabel = 'STATUS QUO';
  } else if (primaryOutcome === 'utopia') {
    shortLabel = stratifiedOutcome === 'humane-utopia' ? 'HUMANE UTOPIA' : 'PYRRHIC UTOPIA';
  } else if (primaryOutcome === 'dystopia') {
    shortLabel = stratifiedOutcome === 'humane-dystopia' ? 'HUMANE DYSTOPIA' : 'PYRRHIC DYSTOPIA';
  } else {
    shortLabel = 'INCONCLUSIVE';
  }

  // Generate full description
  const mortalityPct = (mortalityRate * 100).toFixed(1);
  const deathsStr = deathsAbsolute.toFixed(1);
  let fullDescription = `${shortLabel}: `;

  if (primaryOutcome === 'extinction') {
    fullDescription += `Human extinction (<10K people). ${extinctionClassification ? `${extinctionClassification.type.toUpperCase()} mechanism (${extinctionClassification.mechanism})` : 'Mechanism unknown'}.`;
  } else {
    fullDescription += `${finalPopulation.toFixed(2)}B people remaining (${mortalityPct}% mortality, ${deathsStr}B deaths). `;
    fullDescription += `Multi-Paradigm: ${paradigmOutcome.label}.`;
  }

  // Determine confidence
  let confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  if (primaryOutcome === 'extinction' && extinctionClassification) {
    confidence = extinctionClassification.confidence;
  } else if (primaryOutcome === 'inconclusive' || paradigmOutcome.contested) {
    confidence = 'LOW';
  } else if (mortalityRate > 0.75 || mortalityRate < 0.10) {
    confidence = 'HIGH';  // Extreme outcomes are unambiguous
  } else {
    confidence = 'MEDIUM';
  }

  // Generate reasoning
  let reasoning = `Primary outcome: ${primaryOutcome.toUpperCase()} (${mortalityPct}% mortality). `;
  reasoning += `Stratified: ${stratifiedOutcome} (${mortalityBand} mortality band). `;
  reasoning += `Paradigm classification: ${paradigmOutcome.label}${paradigmOutcome.contested ? ' (CONTESTED)' : ''}. `;
  if (extinctionClassification) {
    reasoning += `Extinction: ${extinctionClassification.type} via ${extinctionClassification.mechanism} (${extinctionClassification.timelineMonths} months).`;
  }

  return {
    primaryOutcome,
    mortalityRate,
    mortalityBand,
    deathsAbsolute,
    stratifiedOutcome,
    paradigmScores,
    paradigmOutcomes,
    paradigmLabel: paradigmOutcome.label,
    paradigmContested: paradigmOutcome.contested,
    initialPopulation,
    finalPopulation,
    finalPopulationPeople,
    extinctionClassification,
    confidence,
    reasoning,
    shortLabel,
    fullDescription
  };
}

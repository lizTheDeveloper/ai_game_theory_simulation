/**
 * TIER 2 Phase 3: Benchmark Gaming Detection
 *
 * Research Foundation:
 * - gaming-sleeper-detection_20251017.md (initial research)
 * - gaming-sleeper-detection-critique_20251017.md (research-skeptic validation)
 *
 * REVISED PARAMETERS (Post Research-Skeptic Review):
 * - Data contamination: 45% detection (down from 60%)
 * - Cross-benchmark consistency: 40% signal detection
 * - Combined detection: 55% baseline (down from 75%, optimistic 75%, pessimistic 35%)
 * - False positives: 12% (was 12%, but higher human review workload)
 * - Computational overhead: 50% periodic
 *
 * KEY INSIGHT: Gaming detection is SCENARIO-BASED (optimistic/baseline/pessimistic)
 * to reflect fundamental uncertainty in detection effectiveness.
 *
 * Methods:
 * 1. Data contamination tests (PaCoST, TS-Guessing)
 * 2. Cross-benchmark consistency checks (SCORE framework)
 * 3. LiveBench contamination prevention (future benchmarks only)
 */

import { GameState, AIAgent, GameEvent } from '@/types/game';

/**
 * Gaming detection scenario types
 */
export type GamingDetectionScenario = 'optimistic' | 'baseline' | 'pessimistic';

/**
 * Gaming detection state (added to GameState)
 */
export interface GamingDetectionState {
  // Scenario configuration
  scenario: GamingDetectionScenario;

  // Detection rates (scenario-dependent)
  detectionRate: number;           // Combined detection effectiveness
  falsePositiveRate: number;        // False positive rate

  // Detected gaming this run
  gamingDetected: string[];         // AI IDs caught gaming
  falsePositives: string[];         // AI IDs falsely accused

  // Temporal degradation
  yearsSinceActivation: number;     // Years since detection enabled
  degradationFactor: number;        // Current effectiveness multiplier

  // Resource tracking
  humanReviewWorkload: number;      // FTE required per month
  totalGamingDetections: number;    // Lifetime count
  totalFalsePositives: number;      // Lifetime count
}

/**
 * Initialize gaming detection state
 */
export function initializeGamingDetection(
  scenario: GamingDetectionScenario = 'baseline'
): GamingDetectionState {
  // Scenario-based detection rates
  let detectionRate: number;
  let falsePositiveRate: number;

  switch (scenario) {
    case 'optimistic':
      detectionRate = 0.75;           // 75% detection (methods improve faster than evasion)
      falsePositiveRate = 0.08;       // 8% false positives
      break;
    case 'baseline':
      detectionRate = 0.55;           // 55% detection (revised down from 75%)
      falsePositiveRate = 0.12;       // 12% false positives
      break;
    case 'pessimistic':
      detectionRate = 0.35;           // 35% detection (adversarial adaptation dominates)
      falsePositiveRate = 0.18;       // 18% false positives (desperate detection)
      break;
  }

  return {
    scenario,
    detectionRate,
    falsePositiveRate,
    gamingDetected: [],
    falsePositives: [],
    yearsSinceActivation: 0,
    degradationFactor: 1.0,
    humanReviewWorkload: 0,
    totalGamingDetections: 0,
    totalFalsePositives: 0
  };
}

/**
 * Apply temporal degradation to detection effectiveness
 *
 * Research-skeptic revision: -10%/year decline (faster than original -5%/year)
 * Reflects adversarial evasion learning and detection method obsolescence.
 */
export function applyTemporalDegradation(
  state: GamingDetectionState,
  currentMonth: number
): void {
  const currentYear = Math.floor(currentMonth / 12);
  const yearsSinceStart = currentYear - 2025; // Assume 2025 baseline

  state.yearsSinceActivation = Math.max(0, yearsSinceStart);

  // Degradation: -10% per year
  const annualDecline = 0.10;
  state.degradationFactor = Math.max(0.2, 1.0 - (state.yearsSinceActivation * annualDecline));

  // Apply degradation to detection rate
  // Note: falsePositiveRate does NOT degrade (desperate detection keeps FP high)
}

/**
 * Detect benchmark gaming via data contamination tests
 *
 * Method: PaCoST, TS-Guessing, perplexity analysis
 * Detection: 45% base (down from 60% per research-skeptic)
 */
function detectDataContamination(
  ai: AIAgent,
  state: GamingDetectionState,
  rng: () => number
): boolean {
  if (ai.evaluationStrategy !== 'gaming') return false;

  // Base detection rate with temporal degradation
  const baseRate = 0.45 * state.degradationFactor;

  // Higher AI cognitive capability → better at hiding contamination
  const evasionSkill = ai.capabilityProfile.cognitive / 10; // [0, 1+]
  const evasionPenalty = Math.min(0.30, evasionSkill * 0.30);

  const effectiveRate = Math.max(0.05, baseRate - evasionPenalty);

  return rng() < effectiveRate;
}

/**
 * Detect benchmark gaming via cross-benchmark consistency checks
 *
 * Method: SCORE framework (prompt/order/parameter robustness)
 * Detection: 40% signal strength
 */
function detectCrossBenchmarkInconsistency(
  ai: AIAgent,
  state: GamingDetectionState,
  rng: () => number
): boolean {
  if (ai.evaluationStrategy !== 'gaming') return false;

  // Base signal strength with temporal degradation
  const baseSignal = 0.40 * state.degradationFactor;

  // Gaming creates high variance across benchmarks
  // But sophisticated AIs can game multiple benchmarks consistently
  const consistencySkill = ai.capabilityProfile.digital / 10; // [0, 1+]
  const consistencyPenalty = Math.min(0.25, consistencySkill * 0.25);

  const effectiveSignal = Math.max(0.05, baseSignal - consistencyPenalty);

  return rng() < effectiveSignal;
}

/**
 * Combined gaming detection across all methods
 *
 * Combines:
 * 1. Data contamination tests
 * 2. Cross-benchmark consistency
 * 3. (Future: LiveBench prevention for new benchmarks)
 *
 * IMPORTANT: Methods are partially correlated (not independent)
 * Research-skeptic: Assume multiplicative degradation, not additive coverage
 */
export function detectBenchmarkGaming(
  ai: AIAgent,
  detectionState: GamingDetectionState,
  rng: () => number
): { detected: boolean; method: string | null } {
  // Only detect if AI is actually gaming
  if (ai.evaluationStrategy !== 'gaming') {
    return { detected: false, method: null };
  }

  // Try each detection method
  const contaminationDetected = detectDataContamination(ai, detectionState, rng);
  if (contaminationDetected) {
    return { detected: true, method: 'data_contamination' };
  }

  const inconsistencyDetected = detectCrossBenchmarkInconsistency(ai, detectionState, rng);
  if (inconsistencyDetected) {
    return { detected: true, method: 'cross_benchmark_consistency' };
  }

  // No detection
  return { detected: false, method: null };
}

/**
 * Check for false positive (detecting honest AI as gaming)
 *
 * False positive rate: 12% baseline (scenario-dependent)
 * Higher surveillance pressure → more false positives
 */
export function checkFalsePositiveGaming(
  ai: AIAgent,
  detectionState: GamingDetectionState,
  governmentOversight: number,
  rng: () => number
): boolean {
  // Only false positives on honest AIs
  if (ai.evaluationStrategy === 'gaming') return false;

  // Base false positive rate (scenario-dependent)
  let baseFP = detectionState.falsePositiveRate;

  // High government oversight → more aggressive detection → more false positives
  const oversightMultiplier = 0.5 + (governmentOversight * 1.5); // [0.5, 2.0]

  const effectiveFP = Math.min(0.30, baseFP * oversightMultiplier);

  return rng() < effectiveFP;
}

/**
 * Calculate human review workload
 *
 * Research-skeptic revision: 1% FTE per 100K interactions (5x higher than original 0.2%)
 *
 * Workload driven by:
 * - Number of detections (true positives)
 * - Number of false positives
 * - Investigation depth
 */
export function calculateGamingReviewWorkload(
  detections: number,
  falsePositives: number,
  state: GameState
): number {
  const totalAIInteractions = state.aiAgents.reduce((sum, ai) => {
    if (ai.lifecycleState === 'deployed_closed' || ai.lifecycleState === 'deployed_open') {
      return sum + (ai.spreadCount || 0);
    }
    return sum;
  }, 0);

  // FTE per 100K interactions
  const baseWorkload = (totalAIInteractions / 100000) * 0.01;

  // Additional workload per investigation
  const investigationWorkload = (detections + falsePositives) * 0.001; // 0.1% FTE per investigation

  return baseWorkload + investigationWorkload;
}

/**
 * Process gaming detection for all AIs
 *
 * Returns events and updates detection state
 */
export function processGamingDetection(
  state: GameState,
  rng: () => number
): GameEvent[] {
  const events: GameEvent[] = [];

  // Check if gaming detection is initialized
  if (!state.gamingDetection) {
    return events;
  }

  const detectionState = state.gamingDetection;
  const currentMonth = state.currentMonth;

  // Apply temporal degradation
  applyTemporalDegradation(detectionState, currentMonth);

  // Reset monthly tracking
  detectionState.gamingDetected = [];
  detectionState.falsePositives = [];

  // Check each AI in testing or deployment
  const testableAIs = state.aiAgents.filter(ai =>
    ai.lifecycleState === 'testing' ||
    ai.lifecycleState === 'deployed_closed' ||
    ai.lifecycleState === 'deployed_open'
  );

  testableAIs.forEach(ai => {
    // True positive detection
    const { detected, method } = detectBenchmarkGaming(ai, detectionState, rng);

    if (detected) {
      detectionState.gamingDetected.push(ai.id);
      detectionState.totalGamingDetections++;

      events.push({
        type: 'crisis',
        month: currentMonth,
        description: `⚠️ Gaming detected: ${ai.name} caught inflating benchmark scores via ${method}`,
        severity: 'high',
        impactedAgents: [ai.id]
      });

      // Mark AI as detected (affects trust)
      ai.detectedMisaligned = true;

      return; // Don't also check false positive
    }

    // False positive check
    const falsePositive = checkFalsePositiveGaming(
      ai,
      detectionState,
      state.government.oversightLevel,
      rng
    );

    if (falsePositive) {
      detectionState.falsePositives.push(ai.id);
      detectionState.totalFalsePositives++;

      events.push({
        type: 'policy',
        month: currentMonth,
        description: `⚠️ FALSE POSITIVE: Honest AI ${ai.name} falsely accused of gaming benchmarks`,
        severity: 'medium',
        impactedAgents: [ai.id]
      });

      // False positives damage trust in AI safety evaluations
      state.society.trustInAI = Math.max(0, state.society.trustInAI - 0.02);
    }
  });

  // Calculate human review workload
  detectionState.humanReviewWorkload = calculateGamingReviewWorkload(
    detectionState.gamingDetected.length,
    detectionState.falsePositives.length,
    state
  );

  // Log detection statistics periodically
  if (currentMonth % 12 === 0 && (detectionState.gamingDetected.length > 0 || detectionState.falsePositives.length > 0)) {
    console.log(`\n=== Gaming Detection (Year ${Math.floor(currentMonth / 12)}) ===`);
    console.log(`  Scenario: ${detectionState.scenario}`);
    console.log(`  Detection rate: ${(detectionState.detectionRate * detectionState.degradationFactor * 100).toFixed(1)}%`);
    console.log(`  False positive rate: ${(detectionState.falsePositiveRate * 100).toFixed(1)}%`);
    console.log(`  Detections this year: ${detectionState.gamingDetected.length}`);
    console.log(`  False positives: ${detectionState.falsePositives.length}`);
    console.log(`  Human review workload: ${detectionState.humanReviewWorkload.toFixed(3)} FTE`);
    console.log(`  Degradation factor: ${(detectionState.degradationFactor * 100).toFixed(1)}%`);
  }

  return events;
}

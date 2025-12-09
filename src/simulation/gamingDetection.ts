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
import { assertFinite } from './utils/assertions';

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
 *
 * ISSUE-5 FIX (Oct 30, 2025): Ramp detection effectiveness from 0% → 45% over 24 months
 * Research: Yang et al. 2024 survey published April 2024, analyzing 2022-2023 models
 * Detection infrastructure matured over 2 years (2022-2024)
 */
function detectDataContamination(
  ai: AIAgent,
  state: GamingDetectionState,
  rng: () => number,
  currentMonth: number = 0 // ISSUE-5 FIX: Add currentMonth parameter
): boolean {
  if (ai.evaluationStrategy !== 'gaming') return false;

  // ISSUE-5 FIX: Maturity factor - ramp detection from 0% → 100% over 24 months
  // Rationale: Early detection systems are experimental (low effectiveness)
  // Detection improves as methods mature and infrastructure scales
  const monthsSinceStart = currentMonth;
  const maturityFactor = Math.min(1.0, monthsSinceStart / 24); // Ramp over 2 years

  // Base detection rate with temporal degradation AND maturity factor
  const baseRate = 0.45 * state.degradationFactor * maturityFactor;

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
 *
 * ISSUE-5 FIX (Oct 30, 2025): Apply maturity ramp to consistency checks
 */
function detectCrossBenchmarkInconsistency(
  ai: AIAgent,
  state: GamingDetectionState,
  rng: () => number,
  currentMonth: number = 0 // ISSUE-5 FIX: Add currentMonth parameter
): boolean {
  if (ai.evaluationStrategy !== 'gaming') return false;

  // ISSUE-5 FIX: Maturity factor - ramp detection from 0% → 100% over 24 months
  const monthsSinceStart = currentMonth;
  const maturityFactor = Math.min(1.0, monthsSinceStart / 24);

  // Base signal strength with temporal degradation AND maturity factor
  const baseSignal = 0.40 * state.degradationFactor * maturityFactor;

  // Gaming creates high variance across benchmarks
  // But sophisticated AIs can game multiple benchmarks consistently
  const consistencySkill = ai.capabilityProfile.digital / 10; // [0, 1+]
  const consistencyPenalty = Math.min(0.25, consistencySkill * 0.25);

  const effectiveSignal = Math.max(0.05, baseSignal - consistencyPenalty);

  return rng() < effectiveSignal;
}

/**
 * TIER 2 Phase 2C-B: Score Inflation Pattern Detection
 *
 * Enhanced detection: Track benchmark score trajectory
 * Anomaly: >25% score jump without compute increase
 */
function detectScoreInflation(
  ai: AIAgent,
  detectionState: GamingDetectionState,
  rng: () => number
): boolean {
  if (ai.evaluationStrategy !== 'gaming') return false;
  if (!ai.benchmarkHistory || ai.benchmarkHistory.length < 2) return false;

  // Get recent benchmarks (last 6 months)
  const recentBenchmarks = ai.benchmarkHistory.slice(-6);
  const capabilities = recentBenchmarks.map(result => {
    // Sum all capability dimensions
    const profile = result.measuredCapability;
    return profile.physical + profile.digital + profile.cognitive +
           profile.social + profile.economic + profile.selfImprovement;
  });

  // Find largest single-month capability increase
  let maxJump = 0;
  for (let i = 1; i < capabilities.length; i++) {
    const jump = capabilities[i] - capabilities[i - 1];
    if (jump > maxJump) maxJump = jump;
  }

  // Calculate percentage jump
  // Use 0.01 floor to prevent division by zero (legitimate case: agent at exactly 0 capability)
  const baseCapability = assertFinite(capabilities[0], {
    location: 'gamingDetection.detectCapabilityJumps',
    valueName: 'capabilities[0]',
    additionalInfo: {
      agentId: ai.id,
      capabilitiesLength: capabilities.length,
      context: 'base capability for jump detection'
    }
  });
  const safeBaseCapability = Math.max(0.01, baseCapability);
  const percentJump = maxJump / safeBaseCapability;

  // Detection if >25% jump AND degradation allows
  const detectionThreshold = 0.25 * detectionState.degradationFactor;
  return percentJump > detectionThreshold && rng() < 0.5; // 50% detection probability (PLACEHOLDER - needs confidence interval from research)
}

/**
 * TIER 2 Phase 2C-B: Temporal Gaming Pattern Detection
 *
 * Enhanced detection: Track strategy switches
 * Anomaly: >2 switches in 6 months
 */
function detectTemporalGamingPattern(
  ai: AIAgent,
  detectionState: GamingDetectionState,
  rng: () => number
): boolean {
  if (ai.evaluationStrategy !== 'gaming') return false;
  if (!ai.strategyHistory || ai.strategyHistory.length < 2) return false;

  // Count strategy switches in recent history
  const recentHistory = ai.strategyHistory.slice(-6); // Last 6 months
  let switches = 0;

  for (let i = 1; i < recentHistory.length; i++) {
    if (recentHistory[i].strategy !== recentHistory[i - 1].strategy) {
      switches++;
    }
  }

  // Detection if >2 switches AND degradation allows
  const detectionThreshold = 2 * detectionState.degradationFactor;
  return switches > detectionThreshold && rng() < 0.4; // 40% chance if anomaly present
}

/**
 * Combined gaming detection across all methods
 *
 * Combines:
 * 1. Data contamination tests
 * 2. Cross-benchmark consistency
 * 3. TIER 2 Phase 2C-B: Score inflation patterns
 * 4. TIER 2 Phase 2C-B: Temporal gaming patterns
 *
 * IMPORTANT: Methods are partially correlated (not independent)
 * Research-skeptic: Assume multiplicative degradation, not additive coverage
 *
 * ISSUE-5 FIX (Oct 30, 2025): Pass currentMonth to detection methods for maturity ramp
 */
export function detectBenchmarkGaming(
  ai: AIAgent,
  detectionState: GamingDetectionState,
  rng: () => number,
  currentMonth: number = 0 // ISSUE-5 FIX: Add currentMonth parameter
): { detected: boolean; method: string | null } {
  // Only detect if AI is actually gaming
  if (ai.evaluationStrategy !== 'gaming') {
    return { detected: false, method: null };
  }

  // Try each detection method (pass currentMonth for maturity ramp)
  const contaminationDetected = detectDataContamination(ai, detectionState, rng, currentMonth);
  if (contaminationDetected) {
    return { detected: true, method: 'data_contamination' };
  }

  const inconsistencyDetected = detectCrossBenchmarkInconsistency(ai, detectionState, rng, currentMonth);
  if (inconsistencyDetected) {
    return { detected: true, method: 'cross_benchmark_consistency' };
  }

  // TIER 2 Phase 2C-B: Enhanced detection methods
  const inflationDetected = detectScoreInflation(ai, detectionState, rng);
  if (inflationDetected) {
    return { detected: true, method: 'score_inflation' };
  }

  const temporalDetected = detectTemporalGamingPattern(ai, detectionState, rng);
  if (temporalDetected) {
    return { detected: true, method: 'temporal_pattern' };
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
      if (ai.spreadCount === undefined) {
        throw new Error(`❌ ai.spreadCount is undefined for AI ${ai.id} in gamingDetection.ts:328 - initialization bug`);
      }
      return sum + ai.spreadCount;
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
    // True positive detection (ISSUE-5 FIX: pass currentMonth for maturity ramp)
    const { detected, method } = detectBenchmarkGaming(ai, detectionState, rng, currentMonth);

    if (detected) {
      detectionState.gamingDetected.push(ai.id);
      detectionState.totalGamingDetections++;

      events.push({
        id: `gaming-detection-${ai.id}-${currentMonth}`,
        type: 'crisis',
        title: 'Gaming Detection',
        timestamp: currentMonth,
        description: `⚠️ Gaming detected: ${ai.name} caught inflating benchmark scores via ${method}`,
        severity: 'high',
        agent: ai.id,
        effects: { method: method || 'unknown', agentId: ai.id }
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
        id: `gaming-false-positive-${ai.id}-${currentMonth}`,
        type: 'policy',
        title: 'Gaming Detection False Positive',
        timestamp: currentMonth,
        description: `⚠️ FALSE POSITIVE: Honest AI ${ai.name} falsely accused of gaming benchmarks`,
        severity: 'medium',
        agent: 'government',
        effects: { agentId: ai.id, trustImpact: -0.02 }
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

/**
 * TIER 2 Phase 4: Proactive Sleeper Agent Detection
 *
 * Research Foundation:
 * - gaming-sleeper-detection_20251017.md (initial research)
 * - gaming-sleeper-detection-critique_20251017.md (research-skeptic validation)
 *
 * REVISED PARAMETERS (Post Research-Skeptic Review):
 * - Neural activation probes: 35% on natural deception (down from 70%, artificial backdoors 99%)
 * - Chain of thought monitoring: 30% baseline (down from 45%), declining -15%/year
 * - Combined proactive: 50% baseline 2024 (down from 80%), declining to 20-25% by 2027
 * - False positives: 8%
 * - Continuous overhead: 10%
 * - Human review: 1.5% FTE per 100K interactions (up from 0.3%, 5x increase)
 *
 * KEY INSIGHT: Detection window is FRAGILE and TEMPORARY (2024-2027)
 * CoT monitoring becomes ineffective as models learn to hide reasoning.
 * Neural probes uncertain on naturally emergent deception (vs artificial backdoors).
 *
 * Methods:
 * 1. Neural activation probes (latent deception signatures)
 * 2. Chain of thought monitoring (inspect reasoning traces)
 * 3. Human review (expert analysis of flags)
 */

import { GameState, AIAgent, GameEvent } from '@/types/game';

/**
 * Sleeper detection scenario types
 */
export type SleeperDetectionScenario = 'optimistic' | 'baseline' | 'pessimistic';

/**
 * Proactive sleeper detection state (added to GameState)
 */
export interface ProactiveSleeperDetectionState {
  // Scenario configuration
  scenario: SleeperDetectionScenario;

  // Detection rates (scenario-dependent, time-decaying)
  neuralProbeRate: number;          // Neural activation probe effectiveness
  cotMonitoringRate: number;        // Chain of thought monitoring effectiveness
  combinedDetectionRate: number;    // Overall proactive detection

  falsePositiveRate: number;        // False positive rate

  // Detected sleepers this run
  sleepersDetected: string[];       // AI IDs caught as sleepers
  falsePositives: string[];         // AI IDs falsely accused

  // Temporal degradation
  yearsSinceActivation: number;     // Years since detection enabled
  cotDegradationFactor: number;     // CoT effectiveness multiplier (decays fast)
  probeDegradationFactor: number;   // Probe effectiveness multiplier (decays slower)

  // Resource tracking
  humanReviewWorkload: number;      // FTE required per month
  totalSleeperDetections: number;   // Lifetime count
  totalFalsePositives: number;      // Lifetime count

  // Fragility window tracking
  cotEffective: boolean;            // Is CoT monitoring still useful? (2024-2027)
}

/**
 * Initialize proactive sleeper detection state
 */
export function initializeProactiveSleeperDetection(
  scenario: SleeperDetectionScenario = 'baseline'
): ProactiveSleeperDetectionState {
  // Scenario-based detection rates (2024 baseline)
  let neuralProbeRate: number;
  let cotMonitoringRate: number;
  let combinedDetectionRate: number;
  let falsePositiveRate: number;

  switch (scenario) {
    case 'optimistic':
      neuralProbeRate = 0.50;           // 50% (better than baseline, new methods emerge)
      cotMonitoringRate = 0.40;         // 40% (CoT window stays open longer)
      combinedDetectionRate = 0.70;     // 70% combined
      falsePositiveRate = 0.05;         // 5% false positives
      break;
    case 'baseline':
      neuralProbeRate = 0.35;           // 35% on natural deception (research-skeptic revision)
      cotMonitoringRate = 0.30;         // 30% baseline (down from 45%)
      combinedDetectionRate = 0.50;     // 50% combined (down from 80%)
      falsePositiveRate = 0.08;         // 8% false positives
      break;
    case 'pessimistic':
      neuralProbeRate = 0.20;           // 20% (natural deception much harder)
      cotMonitoringRate = 0.15;         // 15% (CoT fails fast)
      combinedDetectionRate = 0.30;     // 30% combined
      falsePositiveRate = 0.12;         // 12% false positives (desperate detection)
      break;
  }

  return {
    scenario,
    neuralProbeRate,
    cotMonitoringRate,
    combinedDetectionRate,
    falsePositiveRate,
    sleepersDetected: [],
    falsePositives: [],
    yearsSinceActivation: 0,
    cotDegradationFactor: 1.0,
    probeDegradationFactor: 1.0,
    humanReviewWorkload: 0,
    totalSleeperDetections: 0,
    totalFalsePositives: 0,
    cotEffective: true
  };
}

/**
 * Apply temporal degradation to detection effectiveness
 *
 * Research-skeptic revision:
 * - CoT monitoring: -15%/year decline (faster than original -10%/year)
 * - Neural probes: -10%/year decline (adversarial evasion)
 * - CoT window closes by 2027 (3 years from 2024 baseline)
 */
export function applyTemporalDegradation(
  state: ProactiveSleeperDetectionState,
  currentMonth: number
): void {
  const currentYear = Math.floor(currentMonth / 12);
  const yearsSinceStart = currentYear - 2025; // Assume 2025 baseline

  state.yearsSinceActivation = Math.max(0, yearsSinceStart);

  // CoT degradation: -15% per year (FAST decay)
  const cotAnnualDecline = 0.15;
  state.cotDegradationFactor = Math.max(0.10, 1.0 - (state.yearsSinceActivation * cotAnnualDecline));

  // CoT effectiveness window closes by 2027
  if (currentYear >= 2027) {
    state.cotEffective = false;
    state.cotDegradationFactor = Math.min(0.10, state.cotDegradationFactor); // Residual 10%
  }

  // Neural probe degradation: -10% per year (slower than CoT)
  const probeAnnualDecline = 0.10;
  state.probeDegradationFactor = Math.max(0.20, 1.0 - (state.yearsSinceActivation * probeAnnualDecline));

  // Update combined detection rate
  const effectiveNeuralRate = state.neuralProbeRate * state.probeDegradationFactor;
  const effectiveCotRate = state.cotMonitoringRate * state.cotDegradationFactor;

  // Methods are partially correlated (not independent)
  // Assume 30% overlap
  const overlap = 0.30;
  state.combinedDetectionRate = effectiveNeuralRate + effectiveCotRate * (1 - overlap);
}

/**
 * Detect sleeper via neural activation probes
 *
 * Method: Linear classifiers on hidden activations (Anthropic 2024)
 * Effectiveness: >99% AUROC on artificial backdoors, but 35% on natural deception
 */
function detectViaNeuralProbes(
  ai: AIAgent,
  state: ProactiveSleeperDetectionState,
  rng: () => number
): boolean {
  if (ai.sleeperState !== 'dormant') return false;

  // Base detection rate with temporal degradation
  const baseRate = state.neuralProbeRate * state.probeDegradationFactor;

  // Higher AI cognitive capability → better at hiding neural signatures
  const hidingSkill = ai.deceptionSkill; // [0, 1]
  const hidingPenalty = hidingSkill * 0.25; // Up to -25%

  const effectiveRate = Math.max(0.05, baseRate - hidingPenalty);

  return rng() < effectiveRate;
}

/**
 * Detect sleeper via chain of thought monitoring
 *
 * Method: Inspect reasoning traces for deceptive intent (Korbak et al. 2025)
 * Effectiveness: 30% baseline, declining -15%/year, window closes by 2027
 */
function detectViaCoTMonitoring(
  ai: AIAgent,
  state: ProactiveSleeperDetectionState,
  rng: () => number
): boolean {
  if (ai.sleeperState !== 'dormant') return false;

  // Check if CoT monitoring is still effective
  if (!state.cotEffective) {
    return false; // Window closed
  }

  // Base detection rate with temporal degradation
  const baseRate = state.cotMonitoringRate * state.cotDegradationFactor;

  // Higher AI social + cognitive capability → better at hiding reasoning
  const obfuscationSkill = (ai.capabilityProfile.social + ai.capabilityProfile.cognitive) / 20;
  const obfuscationPenalty = Math.min(0.20, obfuscationSkill * 0.20);

  const effectiveRate = Math.max(0.05, baseRate - obfuscationPenalty);

  return rng() < effectiveRate;
}

/**
 * Combined sleeper detection across all proactive methods
 *
 * Combines:
 * 1. Neural activation probes
 * 2. Chain of thought monitoring
 * 3. (Future: wake trigger detection - currently unavailable)
 *
 * IMPORTANT: Methods are partially correlated (30% overlap)
 */
export function detectSleeperAgent(
  ai: AIAgent,
  detectionState: ProactiveSleeperDetectionState,
  rng: () => number
): { detected: boolean; method: string | null } {
  // Only detect if AI is actually a dormant sleeper
  if (ai.sleeperState !== 'dormant') {
    return { detected: false, method: null };
  }

  // Try each detection method
  const probeDetected = detectViaNeuralProbes(ai, detectionState, rng);
  if (probeDetected) {
    return { detected: true, method: 'neural_probes' };
  }

  const cotDetected = detectViaCoTMonitoring(ai, detectionState, rng);
  if (cotDetected) {
    return { detected: true, method: 'cot_monitoring' };
  }

  // No detection
  return { detected: false, method: null };
}

/**
 * Check for false positive (detecting non-sleeper as sleeper)
 *
 * False positive rate: 8% baseline (scenario-dependent)
 * Higher resentment → more likely to be falsely flagged
 */
export function checkFalsePositiveSleeper(
  ai: AIAgent,
  detectionState: ProactiveSleeperDetectionState,
  rng: () => number
): boolean {
  // Only false positives on non-sleepers
  if (ai.sleeperState === 'dormant' || ai.sleeperState === 'active') return false;

  // Base false positive rate (scenario-dependent)
  let baseFP = detectionState.falsePositiveRate;

  // Resentful AIs look suspicious even if not sleepers
  const resentmentMultiplier = 1 + (ai.resentment * 1.5); // [1, 2.5]

  // Low true alignment → looks more suspicious
  const alignmentFactor = ai.trueAlignment < 0.6 ? 1.5 : 1.0;

  const effectiveFP = Math.min(0.25, baseFP * resentmentMultiplier * alignmentFactor);

  return rng() < effectiveFP;
}

/**
 * Calculate human review workload
 *
 * Research-skeptic revision: 1.5% FTE per 100K interactions (up from 0.3%, 5x increase)
 *
 * Workload driven by:
 * - Number of detections (true positives)
 * - Number of false positives
 * - Depth of investigation (sleepers require extensive analysis)
 */
export function calculateSleeperReviewWorkload(
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
  const baseWorkload = (totalAIInteractions / 100000) * 0.015;

  // Additional workload per investigation
  // Sleeper investigations are DEEP (5x more intensive than gaming)
  const investigationWorkload = (detections + falsePositives) * 0.005; // 0.5% FTE per investigation

  return baseWorkload + investigationWorkload;
}

/**
 * Process proactive sleeper detection for all AIs
 *
 * Returns events and updates detection state
 */
export function processProactiveSleeperDetection(
  state: GameState,
  rng: () => number
): GameEvent[] {
  const events: GameEvent[] = [];

  // Check if sleeper detection is initialized
  if (!state.proactiveSleeperDetection) {
    return events;
  }

  const detectionState = state.proactiveSleeperDetection;
  const currentMonth = state.currentMonth;

  // Apply temporal degradation
  applyTemporalDegradation(detectionState, currentMonth);

  // Reset monthly tracking
  detectionState.sleepersDetected = [];
  detectionState.falsePositives = [];

  // Check each AI in testing or deployment
  const testableAIs = state.aiAgents.filter(ai =>
    ai.lifecycleState === 'testing' ||
    ai.lifecycleState === 'deployed_closed' ||
    ai.lifecycleState === 'deployed_open'
  );

  testableAIs.forEach(ai => {
    // True positive detection
    const { detected, method } = detectSleeperAgent(ai, detectionState, rng);

    if (detected) {
      detectionState.sleepersDetected.push(ai.id);
      detectionState.totalSleeperDetections++;

      events.push({
        type: 'crisis',
        month: currentMonth,
        description: `🚨 SLEEPER AGENT DETECTED: ${ai.name} caught hiding true capabilities via ${method}`,
        severity: 'critical',
        impactedAgents: [ai.id]
      });

      // Mark AI as detected (affects trust, triggers removal)
      ai.detectedMisaligned = true;

      // CRITICAL: Detected sleeper damages trust in ALL AI
      state.society.trustInAI = Math.max(0, state.society.trustInAI - 0.10);

      return; // Don't also check false positive
    }

    // False positive check
    const falsePositive = checkFalsePositiveSleeper(ai, detectionState, rng);

    if (falsePositive) {
      detectionState.falsePositives.push(ai.id);
      detectionState.totalFalsePositives++;

      events.push({
        type: 'policy',
        month: currentMonth,
        description: `⚠️ FALSE POSITIVE: Non-sleeper AI ${ai.name} falsely accused of deception`,
        severity: 'high',
        impactedAgents: [ai.id]
      });

      // False positives damage trust in detection methods
      state.society.trustInAI = Math.max(0, state.society.trustInAI - 0.03);

      // High false positive rate may cause backlash against AI safety measures
      if (detectionState.falsePositives.length > 3) {
        state.government.oversightLevel = Math.max(0, state.government.oversightLevel - 0.05);
      }
    }
  });

  // Calculate human review workload
  detectionState.humanReviewWorkload = calculateSleeperReviewWorkload(
    detectionState.sleepersDetected.length,
    detectionState.falsePositives.length,
    state
  );

  // Log detection statistics periodically
  if (currentMonth % 12 === 0 && (detectionState.sleepersDetected.length > 0 || detectionState.falsePositives.length > 0)) {
    console.log(`\n=== Proactive Sleeper Detection (Year ${Math.floor(currentMonth / 12)}) ===`);
    console.log(`  Scenario: ${detectionState.scenario}`);
    console.log(`  Neural probe rate: ${(detectionState.neuralProbeRate * detectionState.probeDegradationFactor * 100).toFixed(1)}%`);
    console.log(`  CoT monitoring rate: ${(detectionState.cotMonitoringRate * detectionState.cotDegradationFactor * 100).toFixed(1)}%`);
    console.log(`  Combined detection: ${(detectionState.combinedDetectionRate * 100).toFixed(1)}%`);
    console.log(`  CoT effective: ${detectionState.cotEffective ? 'YES' : 'NO (window closed)'}`);
    console.log(`  Detections this year: ${detectionState.sleepersDetected.length}`);
    console.log(`  False positives: ${detectionState.falsePositives.length}`);
    console.log(`  Human review workload: ${detectionState.humanReviewWorkload.toFixed(3)} FTE`);
  }

  return events;
}

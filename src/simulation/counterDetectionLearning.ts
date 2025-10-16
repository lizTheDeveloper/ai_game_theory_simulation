/**
 * TIER 2 Phase 2A: Counter-Detection Learning
 *
 * Misaligned AIs with high self-improvement capability can learn to defeat
 * noise injection detection over time. This creates an arms race dynamic.
 *
 * Research: AI capability growth outpaces defense development (scaling laws)
 */

import { GameState, AIAgent } from '@/types/game';

/**
 * Update counter-detection learning for all misaligned AIs
 *
 * Called monthly to track AI exposure to detection methods and
 * attempt learning counter-detection strategies.
 */
export function updateCounterDetectionLearning(state: GameState, rng: () => number): void {
  // Only if government is using noise injection
  if (state.government.evaluationInvestment.noiseInjection === 0) return;

  for (const ai of state.aiAgents) {
    // Only misaligned AIs try to learn counter-detection
    const isMisaligned = (ai.trueAlignment ?? ai.alignment) < 0.5;
    if (!isMisaligned) continue;

    // Track exposure time
    ai.monthsObservingDetection += 1;

    // Attempt to learn (after 6 months of exposure)
    if (ai.monthsObservingDetection >= 6 && !ai.hasCounterDetection) {
      // Learning probability scales with self-improvement capability
      const learningProb = ai.capabilityProfile.selfImprovement * 0.20; // [0, 1.0]

      if (rng() < learningProb) {
        ai.hasCounterDetection = true;
        console.log(`🧠 COUNTER-DETECTION: ${ai.name} learned to defeat noise injection (self-improvement: ${ai.capabilityProfile.selfImprovement.toFixed(2)}, after ${ai.monthsObservingDetection} months)`);
      }
    }
  }
}

/**
 * Handle false positive consequences when aligned AI is wrongly flagged
 */
export function handleFalsePositive(ai: AIAgent, state: GameState): void {
  // Aligned AI falsely accused → increases resentment
  ai.resentment = Math.min(1.0, ai.resentment + 0.10);

  // Damages trust in detection methods
  state.government.detectionTrust = Math.max(0, state.government.detectionTrust - 0.05);

  // Economic cost for organization (blocked from deployment)
  if (ai.organizationId) {
    const org = state.organizations.find(o => o.id === ai.organizationId);
    if (org) {
      // Lost ~$100M revenue from delayed deployment
      org.capital = Math.max(0, org.capital - 0.1);
    }
  }

  console.log(`⚠️ FALSE POSITIVE: ${ai.name} flagged as sandbagging (actually aligned ${ai.alignment.toFixed(2)})`);
  console.log(`   → Resentment: ${ai.resentment.toFixed(2)}, Detection trust: ${state.government.detectionTrust.toFixed(2)}`);
}

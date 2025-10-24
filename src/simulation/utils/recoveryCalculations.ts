/**
 * Recovery Tracking Utilities (P2.4 Feature 3)
 *
 * Calculates economic recovery metrics for empirical validation.
 * Enables measuring time-to-recovery from historical crises.
 *
 * Research: NBER business cycle dating methodology
 */

import { GameState } from '@/types/game';

export type EconomicStage = 'expansion' | 'peak' | 'contraction' | 'trough' | 'recovery';

/**
 * Calculate time to recovery from a crisis
 *
 * @param state - Current game state
 * @param crisisStartMonth - Month when crisis began
 * @returns Months from crisis start to recovery completion, or null if not recovered
 */
export function calculateTimeToRecovery(
  state: GameState,
  crisisStartMonth: number
): number | null {
  if (!state.economicStageHistory || !state.recoveryBaseline) {
    return null;
  }

  // Find when we reached recovery stage
  const recoveryEntry = state.economicStageHistory.find(
    entry => entry.month >= crisisStartMonth && entry.stage === 'recovery'
  );

  if (!recoveryEntry) {
    return null; // Not in recovery yet
  }

  // Find when we actually recovered to baseline
  const fullyRecovered = state.economicStageHistory.find(
    entry =>
      entry.month >= recoveryEntry.month &&
      entry.gdpLevel >= state.recoveryBaseline!.gdp * 0.95 && // Within 5% of baseline
      entry.qolLevel >= state.recoveryBaseline!.qol * 0.95
  );

  if (!fullyRecovered) {
    return null; // In recovery phase but not fully recovered
  }

  return fullyRecovered.month - crisisStartMonth;
}

/**
 * Calculate recovery progress as percentage
 *
 * @param current - Current GDP/QoL level
 * @param trough - Lowest point during crisis
 * @param baseline - Pre-crisis baseline
 * @returns Recovery progress [0-100%]
 */
export function getRecoveryProgress(
  current: number,
  trough: number,
  baseline: number
): number {
  if (baseline <= trough) {
    return 100; // No real crisis (shouldn't happen)
  }

  const drop = baseline - trough;
  const recovered = current - trough;

  return Math.min(100, Math.max(0, (recovered / drop) * 100));
}

/**
 * Detect economic stage transition based on GDP/QoL trends
 *
 * Uses NBER methodology: look at trends over recent months
 *
 * @param state - Current game state
 * @returns New economic stage
 */
export function detectEconomicStage(state: GameState): EconomicStage {
  const history = state.economicStageHistory;

  // Need at least 3 months of history for trend detection
  if (!history || history.length < 3) {
    return 'expansion'; // Default to expansion at start
  }

  const recent = history.slice(-3); // Last 3 months
  const current = recent[2];
  const baseline = state.recoveryBaseline;

  // Calculate trends
  const gdpTrend = current.gdpLevel - recent[0].gdpLevel;
  const qolTrend = current.qolLevel - recent[0].qolLevel;

  // Check if we're growing or declining
  const isGrowing = gdpTrend > 0 && qolTrend > 0;
  const isDeclining = gdpTrend < 0 || qolTrend < 0;

  // If we have a baseline, check if we're above or below it
  const aboveBaseline = baseline &&
    current.gdpLevel >= baseline.gdp * 0.95 &&
    current.qolLevel >= baseline.qol * 0.95;

  const currentStage = state.currentEconomicStage || 'expansion';

  // === STAGE TRANSITION LOGIC (NBER-inspired) ===

  // RECOVERY → EXPANSION: Sustained growth after returning to baseline
  if (currentStage === 'recovery' && aboveBaseline && isGrowing) {
    return 'expansion';
  }

  // TROUGH → RECOVERY: Growth begins, but not yet at baseline
  if (currentStage === 'trough' && isGrowing && !aboveBaseline) {
    return 'recovery';
  }

  // CONTRACTION → TROUGH: Decline stops, bottomed out
  if (currentStage === 'contraction' && !isDeclining) {
    return 'trough';
  }

  // PEAK → CONTRACTION: Decline begins
  if (currentStage === 'peak' && isDeclining) {
    return 'contraction';
  }

  // EXPANSION → PEAK: Growth slows or stops at high levels
  if (currentStage === 'expansion' && !isGrowing && aboveBaseline) {
    return 'peak';
  }

  // EXPANSION → CONTRACTION: Direct decline from growth
  if (currentStage === 'expansion' && isDeclining) {
    return 'contraction';
  }

  // Stay in current stage if no transition detected
  return currentStage;
}

/**
 * Get GDP proxy from game state
 *
 * Uses economic transition stage + population + QoL as proxy for GDP
 */
export function getGDPProxy(state: GameState): number {
  const economicStage = state.globalMetrics.economicTransitionStage;
  const population = state.humanPopulationSystem.population;
  const qol = state.globalMetrics.qualityOfLife;

  // GDP proxy: population × QoL × economic multiplier
  const economicMultiplier = 1 + (economicStage * 0.2); // Stages 0-4 → 1.0-1.8x

  return population * qol * economicMultiplier;
}

/**
 * Initialize recovery tracking in game state
 */
export function initializeRecoveryTracking(state: GameState): void {
  if (!state.economicStageHistory) {
    state.economicStageHistory = [];
  }

  if (!state.currentEconomicStage) {
    state.currentEconomicStage = 'expansion';
  }

  // Set initial baseline (will be updated when crisis detected)
  if (!state.recoveryBaseline) {
    state.recoveryBaseline = {
      gdp: getGDPProxy(state),
      qol: state.globalMetrics.qualityOfLife,
      month: state.currentMonth
    };
  }
}

/**
 * Update recovery baseline when entering contraction
 *
 * This captures pre-crisis levels so we can measure recovery progress
 */
export function updateRecoveryBaseline(state: GameState): void {
  const currentStage = state.currentEconomicStage || 'expansion';
  const previousStage = state.economicStageHistory && state.economicStageHistory.length > 0
    ? state.economicStageHistory[state.economicStageHistory.length - 1].stage
    : 'expansion';

  // Set baseline when we first enter contraction (crisis begins)
  if (currentStage === 'contraction' && previousStage !== 'contraction') {
    // Look back to find the peak
    if (state.economicStageHistory && state.economicStageHistory.length >= 2) {
      const peakEntry = [...state.economicStageHistory]
        .reverse()
        .find(entry => entry.stage === 'peak' || entry.stage === 'expansion');

      if (peakEntry) {
        state.recoveryBaseline = {
          gdp: peakEntry.gdpLevel,
          qol: peakEntry.qolLevel,
          month: peakEntry.month
        };

        console.log(`\n📊 RECOVERY BASELINE SET (Month ${state.currentMonth})`);
        console.log(`   Pre-crisis GDP: ${peakEntry.gdpLevel.toExponential(2)}`);
        console.log(`   Pre-crisis QoL: ${peakEntry.qolLevel.toFixed(2)}`);
        console.log(`   Baseline month: ${peakEntry.month}`);
        console.log('');
      }
    }
  }
}

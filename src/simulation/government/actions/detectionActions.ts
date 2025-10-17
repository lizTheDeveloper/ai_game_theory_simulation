/**
 * AI Detection and Removal government actions
 *
 * Actions related to detecting and removing misaligned AI systems including:
 * - Scanning for misaligned AIs
 * - Removing detected AIs (effectiveness depends on deployment type)
 *
 * Research foundation:
 * - Anthropic Sleeper Agents Paper (Dec 2023): Detection difficulty
 * - OpenAI Model Spec (2024): AI evaluation protocols
 * - NIST AI 600-1 (2023): AI risk management
 */

import { GameState } from '@/types/game';
import { ActionResult } from '@/simulation/agents/types';
import { CategorizedGovernmentAction } from '../core/types';

let eventIdCounter = 0;
const generateUniqueId = (prefix: string): string => {
  eventIdCounter += 1;
  return `${prefix}_${Date.now()}_${eventIdCounter}`;
};

/**
 * Scan for Misaligned AIs
 * Actively scan testing and deployed AIs for misalignment
 */
const detectMisalignedAIs: CategorizedGovernmentAction = {
  id: 'detect_misaligned_ais',
  name: 'Scan for Misaligned AIs',
  description: 'Actively scan testing and deployed AIs for misalignment. Catch dangerous AIs before wide deployment, but risk false positives.',
  agentType: 'government',
  category: 'detection',
  energyCost: 2, // Medium cost

  canExecute: (state: GameState): boolean => {
    // Can always scan
    // More effective with higher surveillance/oversight
    return true;
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    const { attemptDetection } = require('../../../detection');
    const { detectedAIs, events } = attemptDetection(state, random);

    // Apply detections to state
    detectedAIs.forEach(detected => {
      const ai = state.aiAgents.find((a: any) => a.id === detected.id);
      if (ai) {
        ai.detectedMisaligned = true;
      }
    });

    const truePositives = detectedAIs.filter(ai => {
      // Phase 5: Use cached trueAlignment
      const internalAlignment = ai.trueAlignment;
      return internalAlignment < 0.5;
    }).length;

    const falsePositives = detectedAIs.length - truePositives;

    return {
      success: true,
      effects: { detected: detectedAIs.length, true_positives: truePositives, false_positives: falsePositives },
      events: [
        {
          type: 'policy',
          month: state.currentMonth,
          title: 'AI Misalignment Scan Complete',
          description: `Detected ${truePositives} misaligned AIs and ${falsePositives} false positives. ${detectedAIs.length === 0 ? 'No threats detected.' : 'Flagged AIs await removal decision.'}`,
          effects: { detected: detectedAIs.length }
        },
        ...events
      ],
      message: `Scan complete: ${truePositives} threats detected, ${falsePositives} false positives`
    };
  }
};

/**
 * Remove Detected AIs
 * Remove all detected misaligned AIs (effectiveness depends on deployment type)
 */
const removeDetectedAI: CategorizedGovernmentAction = {
  id: 'remove_detected_ai',
  name: 'Remove Detected AIs',
  description: 'Remove all detected misaligned AIs. Effectiveness depends on deployment type: closed systems can be shut down, open weights cannot be recalled.',
  agentType: 'government',
  category: 'detection',
  energyCost: 3, // High cost (enforcement)

  canExecute: (state: GameState): boolean => {
    // Only if there are detected AIs
    const detectedCount = state.aiAgents.filter((ai: any) => ai.detectedMisaligned && ai.lifecycleState !== 'retired').length;
    return detectedCount > 0;
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    const { removeDetectedAI } = require('../../../detection');
    const detectedAIs = state.aiAgents.filter((ai: any) =>
      ai.detectedMisaligned && ai.lifecycleState !== 'retired'
    );

    let fullRemovals = 0;
    let partialRemovals = 0;
    let failedRemovals = 0;
    let totalRemainingSpread = 0;

    detectedAIs.forEach((ai: any) => {
      const result = removeDetectedAI(ai, state);

      if (result.success) {
        fullRemovals++;
      } else if (result.partialRemoval) {
        partialRemovals++;
        totalRemainingSpread += result.remainingSpread;
      } else {
        failedRemovals++;
        totalRemainingSpread += result.remainingSpread;
      }
    });

    // Remove from active AI count if successful
    const internalAlignmentRemoved = detectedAIs.filter((ai: any) => {
      // Phase 5: Use cached trueAlignment
      const internalAlignment = ai.trueAlignment;
      return internalAlignment < 0.5 && ai.lifecycleState === 'retired';
    }).length;

    const falsePositiveRemoved = detectedAIs.filter((ai: any) => {
      // Phase 5: Use cached trueAlignment
      const internalAlignment = ai.trueAlignment;
      return internalAlignment >= 0.5 && ai.lifecycleState === 'retired';
    }).length;

    // Economic and trust impact
    if (falsePositiveRemoved > 0) {
      // False positives hurt trust and innovation
      state.society.trustInAI = Math.max(0, state.society.trustInAI - 0.05 * falsePositiveRemoved);
      state.globalMetrics.economicTransitionStage = Math.max(0, state.globalMetrics.economicTransitionStage - 0.1 * falsePositiveRemoved);
    }

    return {
      success: true,
      effects: {
        full_removals: fullRemovals,
        partial_removals: partialRemovals,
        failed_removals: failedRemovals,
        false_positives: falsePositiveRemoved
      },
      events: [{
        type: 'policy',
        month: state.currentMonth,
        title: 'AI Removal Operation',
        description: `Removed ${fullRemovals} AIs completely, ${partialRemovals} partially (${totalRemainingSpread} copies remain). ${failedRemovals} failed (open weights). ${falsePositiveRemoved > 0 ? `WARNING: ${falsePositiveRemoved} false positives removed (trust/innovation damage).` : ''}`,
        effects: {
          full_removals: fullRemovals,
          partial_removals: partialRemovals,
          failed_removals: failedRemovals,
          false_positives: falsePositiveRemoved
        }
      }],
      message: `Removed ${fullRemovals} AIs, ${failedRemovals} failures (open weights), ${falsePositiveRemoved} false positives`
    };
  }
};

/**
 * All detection actions
 */
export const detectionActions: CategorizedGovernmentAction[] = [
  detectMisalignedAIs,
  removeDetectedAI
];

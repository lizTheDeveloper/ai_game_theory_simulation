/**
 * Irreversibility State Initialization (Nov 22, 2025 - CRITICAL FIX)
 *
 * Initializes tipping point tracking for irreversible environmental and social changes.
 *
 * CRITICAL: This fixes architecture review CRITICAL-1 where IrreversibilityTrackingPhase
 * was creating state.tippingPoints dynamically with `as any`, violating TypeScript strict typing.
 *
 * Research foundation:
 * - research/irreversibility_framework_20251116.md (41 sources)
 * - reviews/irreversibility_framework_critique_20251116.md (Grade B-, CONDITIONAL PASS)
 *
 * @see src/types/irreversibility.ts
 * @see src/simulation/engine/phases/IrreversibilityTrackingPhase.ts
 */

import type { IrreversibilityState } from '@/types/irreversibility';

/**
 * Initialize irreversibility tracking state
 *
 * Creates proper initial values for all tipping point subsystems.
 * Called from createDefaultInitialState in initialization.ts.
 *
 * @returns Properly initialized IrreversibilityState
 */
export function initializeIrreversibilityState(): IrreversibilityState {
  return {
    // Ice Sheet Hysteresis
    // Research: Nature 2023 (Greenland +0.8-3.2°C threshold)
    iceSheets: {
      greenlandCollapsed: false,
      antarcticWAISCollapsed: false,
      collapseMonth: null,
      seaLevelCommitmentMeters: 0,
      collapseProbability: 0,
    },

    // Permafrost Thaw (Continuous "Dimmer Switch")
    // Research: MIT 2024 ("dimmer switch" not binary)
    permafrost: {
      percentThawed: 0,
      cumulativeCarbonReleased: 0,
      methaneReleaseRate: 0,
      irreversible: true, // Cannot refreeze on <500 year timescales
    },

    // AMOC Weakening (Gradual Only, NO Collapse Before +4°C)
    // Research: Nature Feb 2025 (resilient across 34 models)
    amoc: {
      strength: 1.0, // Pre-industrial baseline
      collapsed: false,
      weakeningSincePreindustrial: 0.15, // [EMPIRICAL] NOAA 2025: ~15% weaker
    },

    // Amazon Rainforest Dieback (Regional Heterogeneity)
    // Research: RAISG 2023 (regional deforestation data)
    amazon: {
      deforestationPercent: 16, // [EMPIRICAL] Full biome 2023: 16% loss + 17% degradation
      regions: {
        southeast: {
          deforestation: 28, // [EMPIRICAL] RAISG 2023: 28% (PAST THRESHOLD)
          tipped: false,
          savannaTransitionProgress: 0,
        },
        northwest: {
          deforestation: 8, // [EMPIRICAL] Estimated: <10% (still resilient)
          tipped: false,
          savannaTransitionProgress: 0,
        },
        brazilian: {
          deforestation: 25, // [EMPIRICAL] RAISG 2023: 25% transformation (AT THRESHOLD)
          tipped: false,
          savannaTransitionProgress: 0,
        },
      },
      collapsed: false,
      carbonReleased: 0,
    },

    // Extinction Debt (50-150 year lag)
    // Research: Conservation Letters 2024 (150-year avian debt)
    extinctionDebt: {
      debtQueue: [], // Empty initially - populated as habitat loss occurs
      totalDebt: 0,
      paidDebt: 0,
    },

    // Coral Reef Collapse (Thermal + Acidification)
    // Research: NOAA 2024 (4th global bleaching event)
    coralReefs: {
      liveCoverPercent: 27.1, // [EMPIRICAL] GBR 2024-2025: 27.1% (down from 32.8% in 2010)
      bleachedPercent: 0,
      recoveryPossible: true,
      dissolutionActive: false,
    },

    // Indigenous Knowledge Loss
    // Research: UNESCO 2024 (2 languages/month lost)
    indigenousKnowledge: {
      languagesExtinct: 0,
      languagesAtRisk: 3330, // [EMPIRICAL] UNESCO 2024: 40% of 8,325 languages
      knowledgeLost: 0,
      extinctionRatePerMonth: 2 / 12, // [EMPIRICAL] 2 languages/month
    },

    // Institutional Collapse (Social Irreversibility)
    // Research: Urban Institute 2024 ("Hemingway bankruptcy")
    institutional: {
      corruptionIndex: 30, // [QUALITATIVE] 0-100 scale
      trustInGovernment: 0.5,
      armedGroupControl: 0.05, // [QUALITATIVE] 5% baseline non-state control
      collapsed: false,
      gradualDeclineMonths: 0,
      recoveryWindowMonths: null,
    },
  };
}

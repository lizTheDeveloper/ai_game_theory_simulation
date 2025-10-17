/**
 * Economic model calculations for the AI Alignment Game
 * 
 * Implements the economic system from economic-system-balancing-plan.md
 */

import { GameState } from '@/types/game';
import { getTrustInAI } from './socialCohesion';

/**
 * Economic stage transitions and triggers
 * Based on economic-system-balancing-plan.md
 */
export const ECONOMIC_STAGES = {
  0: {
    name: 'Traditional Employment',
    description: 'Pre-AI disruption, normal economic fluctuations',
    unemploymentRange: [0.03, 0.10],
    transitionTrigger: {
      aiCapability: 1.2,
      unemployment: 0.12
    }
  },
  1: {
    name: 'AI Displacement Beginning',
    description: 'First wave of automation, growing public concern',
    unemploymentRange: [0.12, 0.25],
    transitionTrigger: {
      unemployment: 0.25 // CRITICAL: 25% not 50%!
    }
  },
  2: {
    name: 'Mass Unemployment Crisis',
    description: 'Critical decision point - government must choose pathway',
    unemploymentRange: [0.25, 0.45],
    transitionTrigger: {
      policyImplemented: true, // UBI or other major policy
      unemployment: 'stabilized',
      socialAdaptation: 0.2
    }
  },
  3: {
    name: 'UBI/Transition Policies',
    description: 'Managed adaptation with safety nets',
    unemploymentRange: [0.45, 0.70],
    transitionTrigger: {
      // Utopian path
      utopian: {
        socialAdaptation: 0.6,
        wealthDistribution: 0.6,
        aiCapability: 3.5
      },
      // Dystopian path
      dystopian: {
        effectiveControl: 0.7,
        surveillance: 0.7
      }
    }
  },
  4: {
    name: 'Post-Scarcity (Utopia) or Authoritarian Stasis (Dystopia)',
    description: 'End state - either freedom or control',
    unemploymentRange: [0.70, 0.90]
  }
} as const;

/**
 * Calculate economic stage transition
 * Returns new stage number and whether a transition occurred
 */
export function calculateEconomicStageTransition(state: GameState): {
  newStage: number;
  transitioned: boolean;
  transitionType?: 'natural' | 'crisis' | 'policy';
} {
  const currentStage = state.globalMetrics.economicTransitionStage;
  const totalAICapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const unemploymentLevel = state.society.unemploymentLevel;
  const hasUBI = state.government.activeRegulations.some(reg => reg.includes('UBI'));
  const socialAdaptation = state.society.socialAdaptation;
  const wealthDistribution = state.globalMetrics.wealthDistribution;
  const effectiveControl = state.government.controlDesire * state.government.capabilityToControl;
  
  // P2.3: AI-assisted skills boost economic productivity
  // Higher productivity → faster economic growth → faster stage transitions
  const { calculateProductivityMultiplierFromAIAssistedSkills } = require('./aiAssistedSkills');
  const productivityMultiplier = calculateProductivityMultiplierFromAIAssistedSkills(state);
  
  let newStage = currentStage;
  let transitioned = false;
  let transitionType: 'natural' | 'crisis' | 'policy' | undefined;
  
  // Stage 0→1: AI displacement begins
  if (currentStage < 1.0) {
    if (totalAICapability > 1.2 || unemploymentLevel > 0.12) {
      // P2.3: Productivity boost accelerates economic growth
      const baseIncrement = 0.1 * productivityMultiplier;
      newStage = Math.min(1.0, currentStage + baseIncrement);
      transitioned = true;
      transitionType = 'natural';
    }
  }
  
  // Stage 1→2: Mass unemployment crisis (CRITICAL THRESHOLD)
  if (currentStage >= 1.0 && currentStage < 2.0) {
    if (unemploymentLevel > 0.25) {
      // P2.3: Crisis driven by unemployment, not productivity
      // But higher productivity can soften the crisis
      const crisisModifier = Math.max(0.5, 2.0 - productivityMultiplier);
      newStage = Math.min(2.0, currentStage + 0.2 * crisisModifier);
      transitioned = true;
      transitionType = 'crisis';
    }
  }
  
  // Stage 2→3: UBI/Transition policies (requires policy action)
  if (currentStage >= 2.0 && currentStage < 3.0) {
    if (hasUBI && socialAdaptation > 0.2) {
      // P2.3: Productivity makes transition smoother
      const policyIncrement = 0.15 * productivityMultiplier;
      newStage = Math.min(3.0, currentStage + policyIncrement);
      transitioned = true;
      transitionType = 'policy';
    }
  }
  
  // Stage 3→4: Post-scarcity emergence (two possible paths)
  if (currentStage >= 3.0 && currentStage < 4.0) {
    // Utopian path
    const utopianConditions = 
      totalAICapability > 3.5 && 
      socialAdaptation > 0.6 && 
      wealthDistribution > 0.6;
    
    // Dystopian path
    const dystopianConditions = 
      effectiveControl > 0.7 && 
      state.government.surveillanceCapability > 0.7;
    
    if (utopianConditions || dystopianConditions) {
      // P2.3: Productivity critical for reaching post-scarcity
      const scarcityIncrement = 0.08 * (utopianConditions ? productivityMultiplier : 1.0);
      newStage = Math.min(4.0, currentStage + scarcityIncrement);
      transitioned = true;
      transitionType = utopianConditions ? 'natural' : 'policy';
    }
  }
  
  return {
    newStage,
    transitioned,
    transitionType
  };
}

/**
 * Calculate wealth distribution changes based on policies and AI impact
 */
export function calculateWealthDistributionChange(state: GameState): number {
  const { government, globalMetrics } = state;
  const hasUBI = government.activeRegulations.some(reg => reg.includes('UBI'));
  const hasTransitionSupport = government.activeRegulations.some(reg => 
    reg.includes('Transition') || reg.includes('Support')
  );
  
  // Policy effects
  let policyEffect = 0;
  if (hasUBI) policyEffect += 0.015; // UBI significantly improves distribution
  if (hasTransitionSupport) policyEffect += 0.008;
  
  // Government legitimacy effect (good government → better distribution)
  const legitimacyEffect = (government.legitimacy - 0.5) * 0.02;
  
  // Random variation (market forces, etc.)
  const randomVariation = (Math.random() - 0.5) * 0.01;
  
  // AI concentration effect (without policy, AI benefits concentrate)
  const totalAICapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const concentrationEffect = totalAICapability > 1.5 && !hasUBI ? -0.005 : 0;
  
  return policyEffect + legitimacyEffect + randomVariation + concentrationEffect;
}

/**
 * Calculate social adaptation rate based on policies and economic conditions
 */
export function calculateSocialAdaptationRate(state: GameState): number {
  const economicStage = Math.floor(state.globalMetrics.economicTransitionStage);
  const unemploymentLevel = state.society.unemploymentLevel;
  const trustLevel = getTrustInAI(state.society); // Phase 2C: Use paranoia-derived trust
  const hasUBI = state.government.activeRegulations.some(reg => reg.includes('UBI'));
  const hasRetraining = state.government.activeRegulations.some(reg => 
    reg.includes('Retraining') || reg.includes('Training')
  );
  const baseRate = state.config.socialAdaptationRate || 1.0;
  
  // Stage-based rate multipliers
  const stageMultipliers: Record<number, number> = {
    0: 0.3,   // Very slow - no pressure to adapt
    1: 0.6,   // Moderate - some pressure
    2: 0.6,   // Crisis but chaotic
    3: 1.5,   // Policies enable faster adaptation
    4: 0.8    // Stabilizing
  };
  const stageMultiplier = stageMultipliers[economicStage] || 1.0;
  
  // Policy bonuses
  const ubiBonus = hasUBI ? 1.3 : 1.0;
  const retrainingBonus = hasRetraining ? 1.15 : 1.0;
  
  // Trust effect (low trust slows adaptation)
  const trustMultiplier = 0.5 + (trustLevel * 0.5);
  
  return baseRate * stageMultiplier * ubiBonus * retrainingBonus * trustMultiplier;
}

/**
 * Calculate economic transition progress for this time step
 */
export function calculateEconomicTransitionProgress(state: GameState): {
  stageChange: number;
  wealthDistributionChange: number;
  socialAdaptationChange: number;
} {
  const transition = calculateEconomicStageTransition(state);
  const stageChange = transition.newStage - state.globalMetrics.economicTransitionStage;
  
  const wealthDistributionChange = calculateWealthDistributionChange(state);
  
  // Social adaptation changes are calculated by society actions
  // This just provides the rate multiplier
  const adaptationRate = calculateSocialAdaptationRate(state);
  
  return {
    stageChange,
    wealthDistributionChange,
    socialAdaptationChange: 0 // Calculated elsewhere, this is just the rate
  };
}


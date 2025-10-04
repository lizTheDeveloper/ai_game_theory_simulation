/**
 * Structural effects of policy choices
 * 
 * Different government interventions have long-term structural consequences
 * that shape the trajectory of the simulation. Based on realistic-economic-dynamics.md
 */

import { GameState } from '@/types/game';

/**
 * Calculate structural consequences of regulation type
 * 
 * From realistic-economic-dynamics.md:
 * - Large company regulation: Small labs escape, racing dynamics
 * - Compute threshold: Centralized control, high economic costs
 * - Capability ceiling: Measurement problems, black markets
 */
export function calculateRegulationStructuralEffects(
  regulationType: 'none' | 'large_companies' | 'compute_threshold' | 'capability_ceiling',
  state: GameState
): {
  racingDynamicsMultiplier: number;
  enforcementCost: number;
  effectivenessMultiplier: number;
  dystopiaRisk: number;
} {
  switch (regulationType) {
    case 'large_companies':
      return {
        racingDynamicsMultiplier: 1.3, // Small labs escape, incentive to stay small
        enforcementCost: 0.05, // Low cost - few actors to monitor
        effectivenessMultiplier: 0.6, // Low effectiveness - small labs escape
        dystopiaRisk: 0.1 // Low surveillance needed
      };
    
    case 'compute_threshold':
      return {
        racingDynamicsMultiplier: 1.1, // Medium - international competition
        enforcementCost: 0.25, // High cost - compute monitoring infrastructure
        effectivenessMultiplier: 1.4, // High effectiveness - compute is bottleneck
        dystopiaRisk: 0.3 // Medium - compute monitoring enables surveillance
      };
    
    case 'capability_ceiling':
      return {
        racingDynamicsMultiplier: 1.2, // Medium-high - incentive to hide capabilities
        enforcementCost: 0.15, // Medium - measurement challenges
        effectivenessMultiplier: 0.7, // Low-medium - hard to enforce, black markets
        dystopiaRisk: 0.4 // Medium-high - requires intrusive monitoring
      };
    
    case 'none':
    default:
      return {
        racingDynamicsMultiplier: 1.0,
        enforcementCost: 0,
        effectivenessMultiplier: 0,
        dystopiaRisk: 0
      };
  }
}

/**
 * Calculate structural consequences of UBI variant choice
 * 
 * From realistic-economic-dynamics.md:
 * - Generous UBI: Fast adaptation, high cost, opens post-scarcity path
 * - Means-tested: Slower adaptation, medium cost, partial solution
 * - Job guarantee: Very slow adaptation, maintains work paradigm, delays transition
 */
export function calculateUBIVariantEffects(
  ubiVariant: 'none' | 'generous' | 'means_tested' | 'job_guarantee',
  unemploymentLevel: number,
  currentStage: number
): {
  adaptationRate: number;
  wealthDistributionBonus: number;
  economicStageBonus: number;
  legitimacyBonus: number;
  fiscalCost: number;
} {
  const unemploymentSeverity = Math.min(1.0, unemploymentLevel);
  
  switch (ubiVariant) {
    case 'generous':
      return {
        adaptationRate: 0.15 * unemploymentSeverity, // Fast adaptation
        wealthDistributionBonus: 0.3, // High equality
        economicStageBonus: 0.5, // Jump to stage 3.5
        legitimacyBonus: 0.15, // Very popular
        fiscalCost: 0.4 // High burden
      };
    
    case 'means_tested':
      return {
        adaptationRate: 0.08 * unemploymentSeverity, // Medium adaptation
        wealthDistributionBonus: 0.15, // Moderate equality
        economicStageBonus: 0.25, // Gradual to stage 3.2
        legitimacyBonus: 0.05, // Mixed reception
        fiscalCost: 0.2 // Medium burden
      };
    
    case 'job_guarantee':
      return {
        adaptationRate: 0.03 * unemploymentSeverity, // Very slow adaptation
        wealthDistributionBonus: 0.10, // Low equality (maintains hierarchy)
        economicStageBonus: 0.15, // Stuck at stage 2.8
        legitimacyBonus: 0.10, // Satisfies work ethic
        fiscalCost: 0.25 // Medium burden
      };
    
    case 'none':
    default:
      return {
        adaptationRate: 0,
        wealthDistributionBonus: 0,
        economicStageBonus: 0,
        legitimacyBonus: 0,
        fiscalCost: 0
      };
  }
}

/**
 * Calculate emergent surveillance level from control desire and conditions
 * 
 * Surveillance emerges naturally from:
 * - Government control desire
 * - Social instability (triggers emergency measures)
 * - AI threat level (justifies monitoring)
 * - Regulation type (some require more surveillance)
 */
export function calculateEmergentSurveillance(
  controlDesire: number,
  socialStability: number,
  totalAICapability: number,
  regulationType: 'none' | 'large_companies' | 'compute_threshold' | 'capability_ceiling'
): number {
  let surveillance = controlDesire * 0.5; // Base from control desire
  
  // Crisis triggers surveillance increase
  if (socialStability < 0.3) {
    surveillance += 0.3; // Emergency measures
  } else if (socialStability < 0.5) {
    surveillance += 0.15; // Heightened monitoring
  }
  
  // AI threat justifies monitoring
  if (totalAICapability > 2.0) {
    surveillance += 0.25; // Extreme threat
  } else if (totalAICapability > 1.5) {
    surveillance += 0.15; // High threat
  } else if (totalAICapability > 1.0) {
    surveillance += 0.08; // Moderate threat
  }
  
  // Regulation type affects surveillance
  const regulationEffects = calculateRegulationStructuralEffects(regulationType, {} as GameState);
  surveillance += regulationEffects.dystopiaRisk * 0.5;
  
  return Math.min(1.0, surveillance);
}


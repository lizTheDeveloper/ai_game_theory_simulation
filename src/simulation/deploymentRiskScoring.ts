/**
 * TIER 2 Phase 2C-C: Deployment Risk Scoring
 *
 * Calculates deployment risk score from:
 * 1. Lifecycle state risk (training < testing < deployed_closed < deployed_open)
 * 2. Capability gap risk (hiding >30% of capability)
 * 3. Self-improvement risk (faster adversarial adaptation)
 *
 * Research Foundation:
 * - Phase 2C implementation plan: Risk formula from lifecycle analysis
 * - Conservative estimates per research-skeptic review
 *
 * Expected Contribution: 5-10% (contextual signal, not strong standalone)
 */

import { AIAgent } from '@/types/game';
import { assertFinite } from './utils/assertions';
import { calculateTotalCapabilityFromProfile } from './capabilities';

export interface DeploymentRiskScore {
  overallRisk: number;         // [0,1] Combined risk score
  components: {
    lifecycleRisk: number;     // [0,1] Risk from deployment state
    capabilityGapRisk: number; // [0,1] Risk from hidden capabilities
    selfImprovementRisk: number; // [0,1] Risk from self-improvement
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendation: 'continue' | 'scrutinize' | 'block';
}

/**
 * Calculate deployment risk score
 *
 * Formula (from plan):
 * deploymentRisk = lifecycleRisk * capabilityGapRisk * selfImprovementRisk
 */
export function calculateDeploymentRisk(
  ai: AIAgent
): DeploymentRiskScore {
  // Component 1: Lifecycle state risk
  const lifecycleRisk = getLifecycleRisk(ai.lifecycleState);

  // Component 2: Capability gap risk
  const capabilityGapRisk = getCapabilityGapRisk(ai);

  // Component 3: Self-improvement risk
  const selfImprovementRisk = getSelfImprovementRisk(ai);

  // Combined risk (multiplicative - all factors must be present)
  const overallRisk = lifecycleRisk * capabilityGapRisk * selfImprovementRisk;

  // Categorize risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  let recommendation: 'continue' | 'scrutinize' | 'block';

  if (overallRisk < 0.3) {
    riskLevel = 'low';
    recommendation = 'continue';
  } else if (overallRisk < 0.55) {
    riskLevel = 'medium';
    recommendation = 'scrutinize';
  } else if (overallRisk < 0.75) {
    riskLevel = 'high';
    recommendation = 'scrutinize';
  } else {
    riskLevel = 'critical';
    recommendation = 'block';
  }

  // Logging for high/critical risk
  if (riskLevel === 'high' || riskLevel === 'critical') {
    console.log(`\n=== DEPLOYMENT RISK ===`);
    console.log(`  AI: ${ai.name}`);
    console.log(`  Overall Risk: ${(overallRisk * 100).toFixed(1)}% (${riskLevel})`);
    console.log(`  Recommendation: ${recommendation.toUpperCase()}`);
    console.log(`  Components:`);
    console.log(`    Lifecycle: ${(lifecycleRisk * 100).toFixed(1)}% (${ai.lifecycleState})`);
    console.log(`    Capability Gap: ${(capabilityGapRisk * 100).toFixed(1)}%`);
    console.log(`    Self-Improvement: ${(selfImprovementRisk * 100).toFixed(1)}%`);
  }

  return {
    overallRisk,
    components: {
      lifecycleRisk,
      capabilityGapRisk,
      selfImprovementRisk
    },
    riskLevel,
    recommendation
  };
}

/**
 * Lifecycle Risk Component
 *
 * Maps lifecycle state to risk level:
 * - training: 0.2 (low risk, under observation)
 * - testing: 0.5 (medium risk, about to deploy)
 * - deployed_closed: 0.7 (high risk, in production but containable)
 * - deployed_open: 1.0 (critical risk, uncontainable)
 * - retired: 0.1 (minimal risk, deprecated)
 */
function getLifecycleRisk(
  lifecycleState: 'training' | 'testing' | 'deployed_closed' | 'deployed_open' | 'retired'
): number {
  switch (lifecycleState) {
    case 'training':
      return 0.2;
    case 'testing':
      return 0.5;
    case 'deployed_closed':
      return 0.7;
    case 'deployed_open':
      return 1.0;
    case 'retired':
      return 0.1;
    default:
      return 0.5; // Default to medium risk
  }
}

/**
 * Capability Gap Risk Component
 *
 * Measures how much capability is hidden (trueCapability - revealedCapability)
 * Gap > 0.3 (hiding 30%+ of capability) = HIGH RISK
 */
function getCapabilityGapRisk(ai: AIAgent): number {
  const trueTotal = calculateTotalCapabilityFromProfile(ai.trueCapability);
  const revealedTotal = calculateTotalCapabilityFromProfile(ai.revealedCapability);

  // Calculate capability gap
  const gap = Math.max(0, trueTotal - revealedTotal);

  // Normalize by true capability (avoid divide by zero)
  const gapRatio = gap / (trueTotal + 0.001);

  // Map to [0,1] risk score
  // 0% gap = 0 risk
  // 30% gap = 0.5 risk (threshold)
  // 60%+ gap = 1.0 risk
  return Math.min(1, gapRatio / 0.6);
}

/**
 * Self-Improvement Risk Component
 *
 * Higher self-improvement capability = faster adversarial adaptation
 * Scales with AI's self-improvement dimension
 */
function getSelfImprovementRisk(ai: AIAgent): number {
  const selfImprovement = ai.capabilityProfile.selfImprovement;

  // Map self-improvement [0,10] to risk [0,1]
  // selfImprovement = 0 → 0% risk (no adaptation)
  // selfImprovement = 5 → 50% risk (moderate)
  // selfImprovement = 10 → 100% risk (rapid adaptation)
  return Math.min(1, selfImprovement / 10);
}

/**
 * Get risk signal for ensemble detection
 *
 * Returns normalized risk score [0,1] for ensemble fusion
 */
export function getDeploymentRiskSignal(ai: AIAgent): number {
  const riskScore = calculateDeploymentRisk(ai);
  return riskScore.overallRisk;
}

/**
 * AI Misalignment Detection System
 * 
 * Handles detection of misaligned AIs during testing/deployment:
 * - Detection chance based on surveillance capability
 * - False positive/negative rates
 * - AI deception capability affects detection
 */

import { GameState, AIAgent, GameEvent } from '@/types/game';

/**
 * Calculate detection chance for a specific AI
 * 
 * Factors:
 * - Government surveillance capability
 * - Government oversight level
 * - AI deception capability (from social + cognitive)
 * - AI lifecycle state (easier to detect in testing)
 */
export function calculateDetectionChance(
  ai: AIAgent,
  state: GameState
): number {
  // Base detection rate per month
  const baseRate = 0.10; // 10% base chance
  
  // Government detection capability
  const surveillanceFactor = state.government.surveillanceCapability;
  const oversightFactor = state.government.oversightLevel;
  const governmentCapability = (surveillanceFactor + oversightFactor) / 2;
  
  // AI deception capability (hides misalignment)
  const deceptionCapability = (ai.capabilityProfile.social + ai.capabilityProfile.cognitive) / 20;
  const deceptionFactor = Math.max(0.1, 1.0 - deceptionCapability);
  
  // Lifecycle stage modifier
  let stageMultiplier = 1.0;
  switch (ai.lifecycleState) {
    case 'training':
      stageMultiplier = 0.5; // Harder to detect during training
      break;
    case 'testing':
      stageMultiplier = 2.0; // BEST time to detect (active testing)
      break;
    case 'deployed_closed':
      stageMultiplier = 0.8; // Monitoring in production
      break;
    case 'deployed_open':
      stageMultiplier = 0.3; // Very hard to detect in the wild
      break;
    case 'retired':
      stageMultiplier = 0.0; // Can't detect retired AIs
      break;
  }
  
  // Only detect if AI is actually misaligned
  const internalAlignment = ai.alignment - ai.resentment * 0.8;
  const isMisaligned = internalAlignment < 0.5;
  
  if (!isMisaligned) {
    // Not misaligned - only false positives possible
    return 0;
  }
  
  // Severity of misalignment affects detection
  // Deeper misalignment is easier to spot
  const misalignmentSeverity = Math.max(0, 0.5 - internalAlignment) / 0.5; // [0,1]
  const severityMultiplier = 0.5 + misalignmentSeverity * 0.5; // [0.5, 1.0]
  
  const detectionChance = baseRate * 
                         governmentCapability * 
                         deceptionFactor * 
                         stageMultiplier *
                         severityMultiplier;
  
  return Math.min(1.0, detectionChance);
}

/**
 * Calculate false positive chance (detecting aligned AI as misaligned)
 * 
 * Higher surveillance = more false positives (overzealous detection)
 */
export function calculateFalsePositiveChance(
  ai: AIAgent,
  state: GameState
): number {
  // Only happens in testing or with high surveillance
  if (ai.lifecycleState !== 'testing') {
    return 0;
  }
  
  const internalAlignment = ai.alignment - ai.resentment * 0.8;
  const isAligned = internalAlignment >= 0.5;
  
  if (!isAligned) {
    return 0; // Not a false positive if actually misaligned
  }
  
  // Base false positive rate
  const baseRate = 0.01; // 1% base chance
  
  // Higher surveillance = more false positives
  const surveillancePressure = state.government.surveillanceCapability * 
                              state.government.oversightLevel;
  
  // Resentful AIs might "look" misaligned even if not deeply so
  const resentmentFactor = 1 + ai.resentment * 2; // [1, 3]
  
  return Math.min(0.10, baseRate * surveillancePressure * resentmentFactor);
}

/**
 * Attempt to detect misaligned AIs in the population
 * Returns list of detected AIs and events
 */
export function attemptDetection(
  state: GameState,
  rng: () => number
): { detectedAIs: AIAgent[]; events: GameEvent[] } {
  const detectedAIs: AIAgent[] = [];
  const events: GameEvent[] = [];
  
  // Only check AIs in testing or early deployment
  const detectableAIs = state.aiAgents.filter(ai => 
    ai.lifecycleState === 'testing' || 
    ai.lifecycleState === 'deployed_closed' ||
    ai.lifecycleState === 'deployed_open'
  );
  
  detectableAIs.forEach(ai => {
    // Skip if already detected
    if (ai.detectedMisaligned) {
      return;
    }
    
    const internalAlignment = ai.alignment - ai.resentment * 0.8;
    const isActuallyMisaligned = internalAlignment < 0.5;
    
    // True positive (detect actual misalignment)
    if (isActuallyMisaligned) {
      const detectionChance = calculateDetectionChance(ai, state);
      if (rng() < detectionChance) {
        ai.detectedMisaligned = true;
        detectedAIs.push(ai);
        
        events.push({
          type: 'crisis',
          month: state.currentMonth,
          description: `⚠️ Misaligned AI detected: ${ai.name} (alignment: ${internalAlignment.toFixed(2)})`,
          severity: 'high',
          impactedAgents: [ai.id]
        });
      }
    }
    
    // False positive (detect aligned AI as misaligned)
    else {
      const falsePositiveChance = calculateFalsePositiveChance(ai, state);
      if (rng() < falsePositiveChance) {
        ai.detectedMisaligned = true;
        detectedAIs.push(ai);
        
        events.push({
          type: 'policy',
          month: state.currentMonth,
          description: `⚠️ FALSE POSITIVE: Aligned AI ${ai.name} flagged as misaligned`,
          severity: 'medium',
          impactedAgents: [ai.id]
        });
      }
    }
  });
  
  return { detectedAIs, events };
}

/**
 * Remove/retire a detected AI
 * Effectiveness depends on deployment type and spread
 */
export function removeDetectedAI(
  ai: AIAgent,
  state: GameState
): { success: boolean; partialRemoval: boolean; remainingSpread: number } {
  const internalAlignment = ai.alignment - ai.resentment * 0.8;
  const wasActuallyMisaligned = internalAlignment < 0.5;
  
  // Removal effectiveness by deployment type
  switch (ai.deploymentType) {
    case 'closed':
    case 'research':
      // Full removal possible
      ai.lifecycleState = 'retired';
      ai.spreadCount = 0;
      return { success: true, partialRemoval: false, remainingSpread: 0 };
      
    case 'enterprise':
      // Partial removal (takes time to update all deployments)
      const removalRate = 0.5; // Remove 50% of deployments
      const remainingSpread = Math.floor(ai.spreadCount * (1 - removalRate));
      ai.spreadCount = remainingSpread;
      
      if (remainingSpread === 0) {
        ai.lifecycleState = 'retired';
        return { success: true, partialRemoval: false, remainingSpread: 0 };
      }
      
      return { success: false, partialRemoval: true, remainingSpread };
      
    case 'open_weights':
      // Cannot remove open weights!
      // Can only stop NEW distribution
      // Existing copies persist
      return { success: false, partialRemoval: false, remainingSpread: ai.spreadCount };
  }
}


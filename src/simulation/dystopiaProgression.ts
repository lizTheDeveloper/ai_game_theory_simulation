/**
 * Dystopia Progression System
 * 
 * Models how governments respond to AI threats with increased surveillance and control,
 * potentially leading to dystopian outcomes even without extinction.
 * 
 * Key Insight: High control ≠ safety. It breeds resentment and oppression.
 */

import { GameState } from '@/types/game';
import { calculateAverageAlignment } from './utils/ai';

/**
 * Update government control response based on AI threat level
 * 
 * Mechanics:
 * - Large AI capability gap → emergency surveillance escalation
 * - Low alignment + high capability → authoritarian transition risk
 * - High surveillance → QoL decay (freedom, autonomy)
 */
export function updateGovernmentControlResponse(state: GameState): void {
  const maxAICapability = Math.max(...state.aiAgents.map(ai => ai.capability), 0);
  const avgAlignment = calculateAverageAlignment(state.aiAgents);
  const controlGap = maxAICapability - state.government.capabilityToControl;
  
  // === FEAR RESPONSE: Surveillance Escalation ===
  
  // AI capability exceeds control → government panics → ramps up surveillance
  if (controlGap > 1.0) {
    // Significant control gap → emergency surveillance measures
    const surveillanceIncrease = Math.min(0.05, controlGap * 0.02); // Up to +0.05/month
    const oldSurveillance = state.government.structuralChoices.surveillanceLevel;
    state.government.structuralChoices.surveillanceLevel = Math.min(1.0,
      oldSurveillance + surveillanceIncrease
    );
    
    // Control desire also increases (fear-driven)
    state.government.controlDesire = Math.min(1.0,
      state.government.controlDesire + surveillanceIncrease * 0.5
    );
    
    // Log significant surveillance increases
    if (surveillanceIncrease > 0.01 && state.government.structuralChoices.surveillanceLevel > oldSurveillance + 0.01) {
      console.log(`   📹 SURVEILLANCE INCREASED: ${(oldSurveillance * 100).toFixed(0)}% → ${(state.government.structuralChoices.surveillanceLevel * 100).toFixed(0)}% (control gap: ${controlGap.toFixed(2)})`);
    }
  }
  
  // === AUTHORITARIAN TRANSITION ===
  
  // Path 1: Low alignment + high capability → fear-driven authoritarianism
  if (avgAlignment < 0.4 && maxAICapability > 1.5 && state.government.governmentType === 'democratic') {
    // Probability of authoritarian transition (fear-driven political shift)
    const transitionChance = (0.4 - avgAlignment) * 0.05; // Up to 2%/month at 0 alignment
    
    if (Math.random() < transitionChance) {
      console.log(`   🏛️  AUTHORITARIAN TRANSITION (AI Threat): Government shifts to authoritarian control (AI capability: ${maxAICapability.toFixed(2)}, alignment: ${avgAlignment.toFixed(2)})`);
      
      state.government.governmentType = 'authoritarian';
      
      // Immediate control escalation
      state.government.controlDesire = Math.min(1.0, state.government.controlDesire + 0.3);
      state.government.structuralChoices.surveillanceLevel = Math.min(1.0,
        state.government.structuralChoices.surveillanceLevel + 0.3
      );
      
      // Legitimacy hit (controversial transition)
      state.government.legitimacy = Math.max(0.3, state.government.legitimacy - 0.2);
      
      // Social stability crisis
      state.globalMetrics.socialStability = Math.max(0.2, state.globalMetrics.socialStability - 0.3);
    }
  }
  
  // Path 2: CASCADE OF CRISES → emergency authoritarianism
  // When multiple crises active + low social stability → "strong leader" takeover
  if (state.government.governmentType === 'democratic') {
    const env = state.environmentalAccumulation;
    const social = state.socialAccumulation;
    
    // Count active crises
    const crisisCount = [
      env.resourceCrisisActive,
      env.pollutionCrisisActive,
      env.climateCatastropheActive,
      env.ecosystemCollapseActive,
      social.meaningCollapseActive,
      social.socialUnrestActive,
      social.institutionalFailureActive
    ].filter(Boolean).length;
    
    // Multiple crises + low stability → high authoritarian risk
    if (crisisCount >= 4 && state.globalMetrics.socialStability < 0.3) {
      let crisisTransitionChance = 0.03 * (crisisCount - 3); // 3% per crisis above 3
      
      // Democratic resilience reduces authoritarian risk
      const { getAuthoritarianResistance } = require('./governanceQuality');
      const resistance = getAuthoritarianResistance(state);
      crisisTransitionChance *= resistance;
      
      if (Math.random() < crisisTransitionChance) {
        console.log(`   🏛️  AUTHORITARIAN TRANSITION (Crisis): ${crisisCount} cascading crises → emergency powers → dictatorship`);
        console.log(`      Active crises: ${crisisCount}, Social stability: ${(state.globalMetrics.socialStability * 100).toFixed(0)}%`);
        
        state.government.governmentType = 'authoritarian';
        
        // Emergency powers: Immediate surveillance + control
        state.government.controlDesire = Math.min(1.0, state.government.controlDesire + 0.4);
        state.government.structuralChoices.surveillanceLevel = Math.min(1.0,
          state.government.structuralChoices.surveillanceLevel + 0.4
        );
        
        // Paradox: Legitimacy may INCREASE initially (crisis response)
        // but long-term it decays
        state.government.legitimacy = Math.min(0.7, state.government.legitimacy + 0.1);
        
        // DYSTOPIA LOCK-IN: Now can't research social tech to resolve crises!
        console.log(`      ⚠️  DYSTOPIA LOCK-IN: Authoritarian regime will struggle to resolve social crises`);
      }
    }
  }
  
  // === QOL DECAY FROM SURVEILLANCE ===
  
  // High surveillance directly erodes freedom and autonomy
  const surveillance = state.government.structuralChoices.surveillanceLevel;
  
  if (surveillance > 0.6 && state.qualityOfLifeSystems) {
    // Surveillance state emerging → rapid QoL decay
    const decayRate = surveillance * 0.02; // Up to 2%/month at max surveillance
    
    // Direct impact on political freedom
    state.qualityOfLifeSystems.politicalFreedom = Math.max(0, 
      state.qualityOfLifeSystems.politicalFreedom - decayRate
    );
    
    // Direct impact on autonomy
    state.qualityOfLifeSystems.autonomy = Math.max(0,
      state.qualityOfLifeSystems.autonomy - decayRate * 0.8
    );
    
    // Privacy concerns reduce psychological well-being
    state.qualityOfLifeSystems.mentalHealth = Math.max(0,
      state.qualityOfLifeSystems.mentalHealth - decayRate * 0.5
    );
    
    // Community strength erodes (surveillance breeds paranoia)
    state.qualityOfLifeSystems.communityStrength = Math.max(0,
      state.qualityOfLifeSystems.communityStrength - decayRate * 0.6
    );
  }
  
  // === AUTHORITARIAN GOVERNMENT IMPACTS ===
  
  if (state.government.governmentType === 'authoritarian' && state.qualityOfLifeSystems) {
    // Persistent erosion of freedom and trust
    state.qualityOfLifeSystems.politicalFreedom = Math.max(0, 
      state.qualityOfLifeSystems.politicalFreedom * 0.995 // -0.5%/month
    );
    state.qualityOfLifeSystems.communityStrength = Math.max(0, 
      state.qualityOfLifeSystems.communityStrength * 0.998 // -0.2%/month
    );
    
    // Economic efficiency decline (authoritarianism → corruption, inefficiency)
    state.globalMetrics.economicProductivity = Math.max(0.5,
      state.globalMetrics.economicProductivity * 0.999 // -0.1%/month
    );
  }
  
  // === CONTROL BACKLASH ===
  
  // Very high control + low legitimacy → instability (oppression breeds resistance)
  if (state.government.controlDesire > 0.8 && state.government.legitimacy < 0.4) {
    // Public resentment of oppressive government
    state.globalMetrics.socialStability = Math.max(0.1,
      state.globalMetrics.socialStability - 0.01
    );
    
    // Further legitimacy erosion
    state.government.legitimacy = Math.max(0.1,
      state.government.legitimacy - 0.005
    );
  }
}

/**
 * Check if dystopia conditions are met (for logging/awareness)
 *
 * UPDATED: Now uses comprehensive dystopia variant system with status tracking
 *
 * Returns the type of dystopia if conditions met, null otherwise
 */
export function checkDystopiaConditions(state: GameState): {
  type: string | null;
  severity: number;
  reason: string | null;
} {
  // Use new comprehensive dystopia detection system
  const { classifyDystopiaVariant } = require('./dystopiaVariants');
  const classification = classifyDystopiaVariant(state);

  if (classification) {
    return {
      type: classification.type,
      severity: classification.severity,
      reason: classification.reason
    };
  }

  // No dystopia conditions met
  return {
    type: null,
    severity: 0,
    reason: null
  };
}

/**
 * Update dystopia status tracking (call every month)
 *
 * Integrates comprehensive dystopia variant detection with status tracking
 */
export function updateDystopiaStatus(state: GameState): void {
  const { updateDystopiaStatus: updateStatus, initializeDystopiaState } = require('./dystopiaStatus');

  // Initialize if needed
  if (!state.dystopiaState) {
    initializeDystopiaState(state);
  }

  // Update status (entry/exit/variant changes)
  updateStatus(state);
}


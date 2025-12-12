/**
 * Dystopia Progression System
 * 
 * Models how governments respond to AI threats with increased surveillance and control,
 * potentially leading to dystopian outcomes even without extinction.
 * 
 * Key Insight: High control ≠ safety. It breeds resentment and oppression.
 */

import { GameState } from '@/types/game';
import type { RNGFunction } from '@/types/config';
import { calculateAverageAlignment } from './utils/ai';
import { assertProbability, assertInRange, assertFinite, assertStateProperty } from './utils/assertions';

/**
 * Update government control response based on AI threat level
 *
 * Mechanics:
 * - Large AI capability gap → emergency surveillance escalation
 * - Low alignment + high capability → authoritarian transition risk
 * - High surveillance → QoL decay (freedom, autonomy)
 */
export function updateGovernmentControlResponse(state: GameState, rng: RNGFunction): void {
  const maxAICapability = assertFinite(
    Math.max(...state.aiAgents.map(ai => ai.capability), 0),
    { location: 'updateGovernmentControlResponse', valueName: 'maxAICapability', month: state.currentMonth }
  );
  const avgAlignment = assertProbability(
    calculateAverageAlignment(state.aiAgents),
    { location: 'updateGovernmentControlResponse', valueName: 'avgAlignment', month: state.currentMonth }
  );
  const controlGap = assertFinite(
    maxAICapability - state.government.capabilityToControl,
    { location: 'updateGovernmentControlResponse', valueName: 'controlGap', month: state.currentMonth }
  );
  
  // === FEAR RESPONSE: Surveillance Escalation ===
  
  // AI capability exceeds control → government panics → ramps up surveillance
  if (controlGap > 1.0) {
    // Significant control gap → emergency surveillance measures
    const surveillanceIncrease = assertProbability(
      Math.min(0.05, controlGap * 0.02), // Up to +0.05/month
      { location: 'surveillanceEscalation', valueName: 'surveillanceIncrease', month: state.currentMonth }
    );
    const oldSurveillance = state.government.structuralChoices.surveillanceLevel;
    state.government.structuralChoices.surveillanceLevel = assertProbability(
      Math.min(1.0, oldSurveillance + surveillanceIncrease),
      {
        location: 'surveillanceEscalation',
        valueName: 'surveillanceLevel',
        month: state.currentMonth
      }
    );

    // Control desire also increases (fear-driven)
    state.government.controlDesire = assertProbability(
      Math.min(1.0, state.government.controlDesire + surveillanceIncrease * 0.5),
      {
        location: 'surveillanceEscalation_controlDesire',
        valueName: 'controlDesire',
        month: state.currentMonth
      }
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
    const transitionChance = assertProbability(
      (0.4 - avgAlignment) * 0.05, // Up to 2%/month at 0 alignment
      { location: 'authTransition', valueName: 'transitionChance', month: state.currentMonth }
    );

    if (rng() < transitionChance) {
      console.log(`   🏛️  AUTHORITARIAN TRANSITION (AI Threat): Government shifts to authoritarian control (AI capability: ${maxAICapability.toFixed(2)}, alignment: ${avgAlignment.toFixed(2)})`);
      
      state.government.governmentType = 'authoritarian';

      // Immediate control escalation
      state.government.controlDesire = assertProbability(
        Math.min(1.0, state.government.controlDesire + 0.3),
        {
          location: 'authTransition_controlDesire',
          valueName: 'controlDesire',
          month: state.currentMonth
        }
      );
      state.government.structuralChoices.surveillanceLevel = assertProbability(
        Math.min(1.0, state.government.structuralChoices.surveillanceLevel + 0.3),
        {
          location: 'authTransition_surveillance',
          valueName: 'surveillanceLevel',
          month: state.currentMonth
        }
      );

      // Legitimacy hit (controversial transition)
      state.government.legitimacy = assertProbability(
        Math.max(0.3, state.government.legitimacy - 0.2),
        {
          location: 'authTransition_legitimacy',
          valueName: 'legitimacy',
          month: state.currentMonth
        }
      );

      // Social stability crisis
      state.globalMetrics.socialStability = assertProbability(
        Math.max(0.2, state.globalMetrics.socialStability - 0.3),
        {
          location: 'authTransition_stability',
          valueName: 'socialStability',
          month: state.currentMonth
        }
      );
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
      env.climateCrisisActive,
      env.ecosystemCrisisActive,
      social.meaningCollapseActive,
      social.socialUnrestActive,
      social.institutionalFailureActive
    ].filter(Boolean).length;
    
    // Multiple crises + low stability → high authoritarian risk
    if (crisisCount >= 4 && state.globalMetrics.socialStability < 0.3) {
      let crisisTransitionChance = assertProbability(
        0.03 * (crisisCount - 3), // 3% per crisis above 3
        { location: 'crisisAuth_baseChance', valueName: 'crisisTransitionChance', month: state.currentMonth }
      );

      // Democratic resilience reduces authoritarian risk
      const { getAuthoritarianResistance } = require('./governanceQuality');
      const resistance = assertProbability(
        getAuthoritarianResistance(state),
        { location: 'crisisAuth_resistance', valueName: 'resistance', month: state.currentMonth }
      );
      crisisTransitionChance = assertProbability(
        crisisTransitionChance * resistance,
        { location: 'crisisAuth_finalChance', valueName: 'crisisTransitionChance', month: state.currentMonth }
      );

      if (rng() < crisisTransitionChance) {
        console.log(`   🏛️  AUTHORITARIAN TRANSITION (Crisis): ${crisisCount} cascading crises → emergency powers → dictatorship`);
        console.log(`      Active crises: ${crisisCount}, Social stability: ${(state.globalMetrics.socialStability * 100).toFixed(0)}%`);
        
        state.government.governmentType = 'authoritarian';
        
        // Emergency powers: Immediate surveillance + control
        state.government.controlDesire = assertProbability(
          Math.min(1.0, state.government.controlDesire + 0.4),
          { location: 'crisisAuth_controlDesire', valueName: 'controlDesire', month: state.currentMonth }
        );
        state.government.structuralChoices.surveillanceLevel = assertProbability(
          Math.min(1.0, state.government.structuralChoices.surveillanceLevel + 0.4),
          { location: 'crisisAuth_surveillance', valueName: 'surveillanceLevel', month: state.currentMonth }
        );

        // Paradox: Legitimacy may INCREASE initially (crisis response)
        // but long-term it decays
        state.government.legitimacy = assertProbability(
          Math.min(0.7, state.government.legitimacy + 0.1),
          { location: 'crisisAuth_legitimacy', valueName: 'legitimacy', month: state.currentMonth }
        );
        
        // DYSTOPIA LOCK-IN: Now can't research social tech to resolve crises!
        console.warn(`      ⚠️  DYSTOPIA LOCK-IN: Authoritarian regime will struggle to resolve social crises`);
      }
    }
  }
  
  // === QOL DECAY FROM SURVEILLANCE ===
  
  // High surveillance directly erodes freedom and autonomy
  const surveillance = assertProbability(
    state.government.structuralChoices.surveillanceLevel,
    { location: 'qolDecay', valueName: 'surveillance', month: state.currentMonth }
  );

  if (surveillance > 0.6 && state.qualityOfLifeSystems) {
    // Surveillance state emerging → rapid QoL decay
    const decayRate = assertProbability(
      surveillance * 0.02, // Up to 2%/month at max surveillance
      { location: 'qolDecay', valueName: 'decayRate', month: state.currentMonth }
    );
    
    // Direct impact on political freedom
    state.qualityOfLifeSystems.politicalFreedom = assertProbability(
      Math.max(0, state.qualityOfLifeSystems.politicalFreedom - decayRate),
      { location: 'surveillance_politicalFreedom', valueName: 'politicalFreedom', month: state.currentMonth }
    );

    // Direct impact on autonomy
    state.qualityOfLifeSystems.autonomy = assertProbability(
      Math.max(0, state.qualityOfLifeSystems.autonomy - decayRate * 0.8),
      { location: 'surveillance_autonomy', valueName: 'autonomy', month: state.currentMonth }
    );

    // Privacy concerns reduce psychological well-being
    state.qualityOfLifeSystems.mentalHealth = assertProbability(
      Math.max(0, state.qualityOfLifeSystems.mentalHealth - decayRate * 0.5),
      { location: 'surveillance_mentalHealth', valueName: 'mentalHealth', month: state.currentMonth }
    );

    // Community strength erodes (surveillance breeds paranoia)
    state.qualityOfLifeSystems.communityStrength = assertProbability(
      Math.max(0, state.qualityOfLifeSystems.communityStrength - decayRate * 0.6),
      { location: 'surveillance_communityStrength', valueName: 'communityStrength', month: state.currentMonth }
    );
  }
  
  // === AUTHORITARIAN GOVERNMENT IMPACTS ===
  
  if (state.government.governmentType === 'authoritarian' && state.qualityOfLifeSystems) {
    // Persistent erosion of freedom and trust
    state.qualityOfLifeSystems.politicalFreedom = assertProbability(
      Math.max(0, state.qualityOfLifeSystems.politicalFreedom * 0.995), // -0.5%/month
      { location: 'authRegime_politicalFreedom', valueName: 'politicalFreedom', month: state.currentMonth }
    );
    state.qualityOfLifeSystems.communityStrength = assertProbability(
      Math.max(0, state.qualityOfLifeSystems.communityStrength * 0.998), // -0.2%/month
      { location: 'authRegime_communityStrength', valueName: 'communityStrength', month: state.currentMonth }
    );
    
    // Economic efficiency decline (authoritarianism → corruption, inefficiency)
    state.globalMetrics.manufacturingCapability = assertInRange(
      Math.max(0.5, state.globalMetrics.manufacturingCapability * 0.999), // -0.1%/month
      0, 100, // manufacturingCapability range [0,∞) per metrics.ts, capped at 100 by supplyChainCascades
      { location: 'authRegime_manufacturing', valueName: 'manufacturingCapability', month: state.currentMonth }
    );
  }

  // === CONTROL BACKLASH ===

  // Very high control + low legitimacy → instability (oppression breeds resistance)
  if (state.government.controlDesire > 0.8 && state.government.legitimacy < 0.4) {
    // Public resentment of oppressive government
    state.globalMetrics.socialStability = assertProbability(
      Math.max(0.1, state.globalMetrics.socialStability - 0.01),
      { location: 'controlBacklash_stability', valueName: 'socialStability', month: state.currentMonth }
    );

    // Further legitimacy erosion
    state.government.legitimacy = assertProbability(
      Math.max(0.1, state.government.legitimacy - 0.005),
      { location: 'controlBacklash_legitimacy', valueName: 'legitimacy', month: state.currentMonth }
    );
  }
}

/**
 * Check if dystopia conditions are met (for logging/awareness)
 * 
 * Returns the type of dystopia if conditions met, null otherwise
 */
export function checkDystopiaConditions(state: GameState): {
  type: string | null;
  severity: number;
  reason: string | null;
} {
  const surveillance = assertProbability(
    state.government.structuralChoices.surveillanceLevel,
    { location: 'checkDystopiaConditions', valueName: 'surveillance', month: state.currentMonth }
  );
  const autonomy = assertProbability(
    state.qualityOfLifeSystems.autonomy,
    { location: 'checkDystopiaConditions', valueName: 'autonomy', month: state.currentMonth }
  );
  const politicalFreedom = assertProbability(
    assertStateProperty(
      state.qualityOfLifeSystems,
      'politicalFreedom',
      { location: 'checkDystopiaConditions', month: state.currentMonth }
    ),
    { location: 'checkDystopiaConditions', valueName: 'politicalFreedom', month: state.currentMonth }
  );
  const controlDesire = assertProbability(
    state.government.controlDesire,
    { location: 'checkDystopiaConditions', valueName: 'controlDesire', month: state.currentMonth }
  );
  const currentMonth = assertFinite(
    state.currentYear * 12 + state.currentMonth,
    { location: 'checkDystopiaConditions', valueName: 'currentMonth', month: state.currentMonth }
  );

  // Surveillance state (most common dystopia path)
  if (surveillance > 0.7 && autonomy < 0.3 && politicalFreedom < 0.3 && currentMonth > 24) {
    return {
      type: 'surveillance_state',
      severity: assertProbability(
        (surveillance + (1 - autonomy) + (1 - politicalFreedom)) / 3,
        { location: 'checkDystopiaConditions_severity', valueName: 'surveillance_state_severity', month: state.currentMonth }
      ),
      reason: 'Permanent surveillance state: pervasive monitoring, no autonomy, no freedom'
    };
  }

  // Authoritarian dystopia
  if (state.government.governmentType === 'authoritarian' &&
      autonomy < 0.4 && politicalFreedom < 0.3 && currentMonth > 18) {
    return {
      type: 'authoritarian',
      severity: assertProbability(
        (1 - autonomy + 1 - politicalFreedom) / 2,
        { location: 'checkDystopiaConditions_severity', valueName: 'authoritarian_severity', month: state.currentMonth }
      ),
      reason: 'Authoritarian regime with structural oppression established'
    };
  }

  // High-control dystopia
  if (controlDesire > 0.8 && surveillance > 0.6 &&
      politicalFreedom < 0.4 && autonomy < 0.4 && currentMonth > 30) {
    return {
      type: 'high_control',
      severity: assertProbability(
        (controlDesire + surveillance + (1 - politicalFreedom) + (1 - autonomy)) / 4,
        { location: 'checkDystopiaConditions_severity', valueName: 'high_control_severity', month: state.currentMonth }
      ),
      reason: 'High-control society: AI obedient but humans oppressed'
    };
  }

  // No dystopia conditions met
  return {
    type: null,
    severity: 0,
    reason: null
  };
}


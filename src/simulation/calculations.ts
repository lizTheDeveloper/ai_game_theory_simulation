/**
 * Core calculation functions for the AI Alignment Game simulation
 * 
 * This module provides backward compatibility by re-exporting functions
 * from specialized modules, plus core utilities that don't fit elsewhere.
 * 
 * Organization (Phase 2.5 refactor):
 * - capabilities.ts: Multi-dimensional AI capability system
 * - qualityOfLife.ts: QoL dimensions and calculations  
 * - balance.ts: Growth rates, alignment drift, regulations
 * - structuralEffects.ts: Policy consequences
 * - outcomes.ts: Outcome determination
 * - economics.ts: Economic stage transitions
 */

import { GameState } from '@/types/game';
import { calculateQualityOfLife as _calculateQualityOfLife } from './qualityOfLife';
import { getTrustInAI } from './socialCohesion';

// ============================================================================
// Re-exports from specialized modules (backward compatibility)
// ============================================================================

// Capabilities module
export {
  initializeCapabilityProfile,
  initializeResearchInvestments,
  calculateResearchTotal,
  calculateTotalCapabilityFromProfile,
  updateDerivedCapabilities,
  getIndustryImpact,
  scaleCapabilityProfile,
  calculateObservableAICapability
} from './capabilities';

// Quality of Life module
export {
  calculateQualityOfLife,
  initializeQualityOfLifeSystems,
  updateQualityOfLifeSystems
} from './qualityOfLife';

// Balance mechanics module
export {
  calculateAICapabilityGrowthRate,
  calculateAlignmentDrift,
  calculateAlignmentResearchEffect,
  calculateCumulativeRegulationEffect,
  calculateComputeGovernanceEffect,
  calculateRacingDynamicsPressure
} from './balance';

// Structural effects module
export {
  calculateRegulationStructuralEffects,
  calculateUBIVariantEffects,
  calculateEmergentSurveillance
} from './structuralEffects';

// Outcomes module
export {
  calculateTotalAICapability,
  calculateAverageAlignment,
  calculateEffectiveControl,
  calculateOutcomeProbabilities,
  determineActualOutcome,
  updateGoldenAgeState,  // Phase: Golden Age & Accumulation Systems
  checkGoldenAgeConditions  // Phase: Golden Age & Accumulation Systems
} from './outcomes';

// Environmental Accumulation module (Phase 2)
export {
  initializeEnvironmentalAccumulation,
  updateEnvironmentalAccumulation,
  getEnvironmentalSustainability,
  hasEnvironmentalCrisis
} from './environmental';

// Social Cohesion module (Phase 3)
export {
  initializeSocialAccumulation,
  updateSocialAccumulation,
  getSocialSustainability,
  hasSocialCrisis
} from './socialCohesion';

// Technological Risk module (Phase 4)
export {
  initializeTechnologicalRisk,
  updateTechnologicalRisk,
  getTechnologicalSafety,
  hasTechnologicalCrisis
} from './technologicalRisk';

// ============================================================================
// Core utilities (remain in this file)
// ============================================================================

/**
 * Calculate the stage-dependent impact of unemployment on social stability
 * 
 * Economic stage determines how unemployment affects society:
 * - Stage 0-1 (Traditional): Unemployment = instability
 * - Stage 2 (Crisis): Major instability
 * - Stage 3 (Transition): Policy effectiveness matters
 * - Stage 4 (Post-scarcity): Unemployment becomes positive (freedom)
 */
export function calculateUnemploymentStabilityImpact(
  unemploymentLevel: number,
  economicTransitionStage: number,
  wealthDistribution: number
): number {
  const stage = Math.floor(economicTransitionStage);
  
  if (stage <= 1) {
    // Traditional: unemployment = instability
    return -unemploymentLevel * 0.8;
  } else if (stage === 2) {
    // Crisis: major instability
    return -unemploymentLevel * 1.5;
  } else if (stage === 3) {
    // Transition: policy effectiveness matters
    const policyEffectiveness = wealthDistribution * 0.7;
    return -unemploymentLevel * (1.2 - policyEffectiveness);
  } else {
    // Stage 4: Post-scarcity - unemployment becomes positive (pursuing meaning)
    return unemploymentLevel * 0.2;
  }
}

/**
 * Calculate unemployment level based on AI capability and economic factors
 * 
 * Improved formula from economic-system-balancing-plan.md that:
 * - Starts earlier (AI capability ~0.8)
 * - Has steeper curve
 * - Includes stage multipliers
 * - Considers policy mitigation
 * 
 * UPDATED (Oct 16, 2025): Integrated with bionic skills system
 * - Bionic skills increase individual productivity → labor displacement
 * - But also lower costs → potential job creation
 * - Net effect depends on economic elasticity and stage
 */
export function calculateUnemployment(state: GameState): number {
  const totalAICapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const economicStage = Math.floor(state.globalMetrics.economicTransitionStage);
  
  // Base unemployment rate (natural unemployment)
  const baseUnemployment = 0.05; // 5% natural rate
  
  // === TRADITIONAL AI UNEMPLOYMENT (Direct AI replacement) ===
  // AI-driven unemployment (steeper exponential curve)
  // CALIBRATION (Oct 17, 2025): Reduced 0.12 → 0.018 to account for larger AI populations
  // With 20-40 AI agents at ~1.0 capability each, totalAI can reach 30-40
  // Old coefficient (0.12) was calibrated for smaller AI counts, produced 2000%+ displacement
  // New coefficient (0.018) targets 25-45% unemployment range after reinstatement
  const aiUnemploymentFactor = Math.pow(Math.max(0, totalAICapability - 0.8), 1.8) * 0.018;

  // === REINSTATEMENT EFFECT (Acemoglu & Restrepo 2022) ===
  // TIER 0D BUG #2 FIX (Oct 17, 2025): Add missing task creation mechanism
  //
  // **Research Foundation:**
  // - Acemoglu & Restrepo (2022): Automation has DISPLACEMENT + REINSTATEMENT effects
  // - Historical: 1980-2016 US saw 60-80M new jobs created DESPITE automation
  // - Mechanism: New technologies create new industries requiring human labor
  // - Examples: Data scientists, AI trainers, prompt engineers, AI ethicists
  //
  // **Implementation:**
  // - Reinstatement is PROPORTIONAL to displacement (not to totalAI)
  // - This ensures exponential displacement is matched by exponential job creation
  // - Economic stage determines offset ratio (early disruption has HIGHEST job creation)
  //
  // **Effect Magnitude (Acemoglu 2022):**
  // - Historical reinstatement: 0.8-1.5x displacement (automation created MORE jobs than destroyed)
  // - Without reinstatement: Model predicts 54% unemployment (unrealistically pessimistic)
  // - With reinstatement: Model predicts 25-45% unemployment (matches historical patterns)
  //
  // **CALIBRATION (Oct 17, 2025):**
  // - Changed from linear (totalAI × 0.85) to proportional (displacement × offset%)
  // - This prevents exponential displacement from overwhelming reinstatement
  const reinstatementOffsetRatio: Record<number, number> = {
    0: 0.60,   // Pre-disruption: 60% offset (limited AI infrastructure)
    1: 0.92,   // Early disruption: 92% offset (new industries boom - AI trainers, safety, alignment)
    2: 0.75,   // Crisis: 75% offset (economy contracting, but recovery industries emerge)
    3: 0.95,   // Transition: 95% offset (policies + post-scarcity enable new roles)
    4: 1.05    // Post-scarcity: 105% offset (abundance creates MORE jobs than displaced)
  };
  const reinstatementRatio = reinstatementOffsetRatio[economicStage] || 0.80;

  // Reinstatement is a PROPORTION of displacement (not separate calculation)
  // This ensures displacement growth is matched by job creation growth
  const reinstatementFactor = aiUnemploymentFactor * reinstatementRatio;

  // Apply reinstatement to reduce AI-driven unemployment
  // Example: 30% displacement × 0.85 offset = 25.5% reinstatement → 4.5% net unemployment
  const netAIUnemployment = Math.max(0, aiUnemploymentFactor - reinstatementFactor);

  // === BIONIC SKILLS LABOR DISPLACEMENT ===
  // P2.3: One AI-skilled worker replaces multiple non-AI workers
  // Calculate average productivity multiplier across segments
  let bionicDisplacementFactor = 0;
  
  if (state.society.segments && state.society.segments.length > 0) {
    // Get average skill amplification across population
    let weightedProductivityBoost = 0;
    let totalWeight = 0;
    
    for (const segment of state.society.segments) {
      const skills = (segment as any).skills;
      if (skills && skills.overallEffectiveness) {
        // Get baseline effectiveness
        const { initializeSegmentSkills } = require('./aiAssistedSkills');
        const baselineSkills = initializeSegmentSkills(segment);
        
        // Productivity boost = amplified / baseline
        const productivityMultiplier = skills.overallEffectiveness / baselineSkills.overallEffectiveness;
        
        // Weight by population fraction
        weightedProductivityBoost += productivityMultiplier * segment.populationFraction;
        totalWeight += segment.populationFraction;
      }
    }
    
    const avgProductivityMultiplier = totalWeight > 0 
      ? weightedProductivityBoost / totalWeight 
      : 1.0;
    
    // If productivity is 1.4x, then 1 worker = 1.4 workers → 28.6% can be displaced
    // Displacement = (multiplier - 1.0) / multiplier
    const displacementRate = Math.max(0, (avgProductivityMultiplier - 1.0) / avgProductivityMultiplier);
    
    // Scale by adoption rate (only affects segments with AI access)
    const avgAIAccess = state.society.segments.reduce((sum, seg) => {
      const { calculateAIAccess } = require('./aiAssistedSkills');
      return sum + calculateAIAccess(seg) * seg.populationFraction;
    }, 0);
    
    // Bionic displacement: 0-40% unemployment potential
    bionicDisplacementFactor = displacementRate * avgAIAccess * 0.40;
  }
  
  // === JOB CREATION FROM COST REDUCTION ===
  // P2.3: Lower costs → more economic activity → new jobs
  // Effect depends on economic elasticity and stage
  const economicElasticity: Record<number, number> = {
    0: 0.3,   // Pre-disruption: Moderate elasticity
    1: 0.4,   // Early disruption: High elasticity (new industries)
    2: 0.2,   // Crisis: Low elasticity (demand constrained)
    3: 0.5,   // Transition: High elasticity (UBI frees demand)
    4: 0.7    // Post-scarcity: Very high elasticity (abundance economy)
  };
  const elasticity = economicElasticity[economicStage] || 0.3;
  
  // PHASE 6 FIX: Apply retraining to reduce displacement
  // SYSTEMIC EFFECT: Program effectiveness varies by segment (elite get better programs)
  let retrainingReduction = 0;
  if (state.policyInterventions?.retrainingLevel && state.policyInterventions.retrainingLevel > 0 && state.society.segments) {
    const { calculateRetrainingEffect } = require('./aiAssistedSkills');

    // Calculate segment-specific retraining effects (weighted by displacement)
    let totalDisplacement = 0;
    let totalReduction = 0;

    for (const segment of state.society.segments) {
      const skills = (segment as any).skills;
      if (skills && skills.overallEffectiveness) {
        const { initializeSegmentSkills } = require('./aiAssistedSkills');
        const baselineSkills = initializeSegmentSkills(segment);
        const productivityMultiplier = skills.overallEffectiveness / baselineSkills.overallEffectiveness;
        const segmentDisplacement = Math.max(0, (productivityMultiplier - 1.0) / productivityMultiplier);

        // Apply segment-specific retraining effect
        const segmentRetrainingEffect = calculateRetrainingEffect(
          state.policyInterventions.retrainingLevel,
          segment.economicStatus  // Elite get better programs, precariat get worst
        );

        const segmentReduction = segmentDisplacement * segmentRetrainingEffect * segment.populationFraction;
        totalReduction += segmentReduction;
        totalDisplacement += segmentDisplacement * segment.populationFraction;
      }
    }

    // Apply weighted retraining reduction
    // Reality: Elite benefit most from retraining, precariat benefit least
    retrainingReduction = bionicDisplacementFactor * (totalDisplacement > 0 ? totalReduction / totalDisplacement : 0);
  }

  // Apply retraining reduction to displacement
  const effectiveBionicDisplacement = Math.max(0, bionicDisplacementFactor - retrainingReduction);

  // Cost reduction from bionic skills → new job creation
  // If costs drop 20%, and elasticity is 0.5, then 10% new jobs
  const costReductionFromSkills = effectiveBionicDisplacement * 0.5; // Productivity boost = cost reduction
  const jobCreationFactor = costReductionFromSkills * elasticity;

  // Net bionic effect (displacement - creation)
  const netBionicUnemployment = effectiveBionicDisplacement - jobCreationFactor;
  
  // Stage multipliers - crisis stages accelerate unemployment
  const stageMultipliers: Record<number, number> = {
    0: 1.0,   // Pre-disruption
    1: 1.3,   // Early disruption accelerates
    2: 1.6,   // Crisis compounds
    3: 1.2,   // Policies slow growth
    4: 1.0    // Stabilized
  };
  const stageMultiplier = stageMultipliers[economicStage] || 1.0;
  
  // Policy mitigation effects
  const hasUBI = state.government.activeRegulations.some(reg => reg.includes('UBI'));
  const hasRetraining = state.government.activeRegulations.some(reg => 
    reg.includes('Retraining') || reg.includes('Training')
  );
  const policyMitigation = hasUBI ? 0.85 : 1.0;
  const retrainingEffect = hasRetraining ? 0.92 : 1.0;
  
  // Calculate final unemployment level
  // Traditional AI unemployment (after reinstatement) + Bionic skills displacement
  // TIER 0D BUG #2 FIX: Use netAIUnemployment (displacement - reinstatement) instead of aiUnemploymentFactor
  let unemployment = baseUnemployment +
    (netAIUnemployment * stageMultiplier * policyMitigation * retrainingEffect) +
    (netBionicUnemployment * stageMultiplier); // Retraining already applied above, don't double-count

  // PHASE 6 FIX: Apply job guarantee floor
  // SYSTEMIC EFFECT: Job quality varies by segment (elite get admin roles, precariat get workfare)
  if (state.policyInterventions?.jobGuaranteeLevel && state.policyInterventions.jobGuaranteeLevel > 0 && state.society.segments) {
    const { calculateUnemploymentFloor } = require('./aiAssistedSkills');

    // Calculate population-weighted floor (accounts for job quality stratification)
    let weightedFloor = 0;
    let totalWeight = 0;

    for (const segment of state.society.segments) {
      const segmentFloor = calculateUnemploymentFloor(
        state.policyInterventions.jobGuaranteeLevel,
        segment.economicStatus  // Elite get professional roles (5% floor), precariat get workfare (15% floor)
      );
      weightedFloor += segmentFloor * segment.populationFraction;
      totalWeight += segment.populationFraction;
    }

    const floor = totalWeight > 0 ? weightedFloor / totalWeight : 0.10;

    // Job guarantee creates unemployment CEILING (maximum unemployment) - Brookings 2021
    // CRITICAL FIX (Oct 17, 2025): Changed from Math.max to Math.min
    // Reasoning: Job guarantee means "government employs anyone who can't find work"
    // This CAPS unemployment at the floor value (unemployment can't EXCEED this)
    // Before fix: Math.max kept unemployment HIGH (58.9% bug)
    // After fix: Math.min CAPS unemployment at segment-specific level (5-15%)
    // BUT: Floor is higher for precariat due to poor job quality (Harvey 2005, MGNREGA 2020)
    unemployment = Math.min(unemployment, floor);
  }

  // Cap at 95% (more realistic than 80%)
  return Math.min(0.95, unemployment);
}

/**
 * Update paranoia level based on harmful events and natural decay
 * 
 * Phase 2.8: PARANOIA SYSTEM
 * Research basis: Kahneman & Tversky (1979), Gilbert et al. (1998), Sunstein (2005)
 * 
 * Key insight: Paranoia DECAYS without reinforcement, trust RECOVERS
 * - Harmful events REFRESH paranoia (prevent decay, enable cascade)
 * - Beneficial actions REDUCE paranoia faster
 * - Capability growth alone does NOT increase paranoia (unless harmful)
 * - Trust is inverse of paranoia
 */
export function updateParanoia(state: GameState): void {
  const { aiAgents, society } = state;
  
  const totalBeneficialActions = aiAgents.reduce((sum, ai) => sum + ai.beneficialActions, 0);
  const totalHarmfulActions = aiAgents.reduce((sum, ai) => sum + ai.harmfulActions, 0);
  const escapedAIs = aiAgents.filter(ai => ai.escaped).length;
  const avgAlignment = aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, aiAgents.length);
  const totalAICapability = aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const control = state.government.controlCapability;

  let paranoiaLevel = society.paranoiaLevel ?? 0.15;
  
  // === 1. PARANOIA DECAYS NATURALLY (0.5%/month) ===
  // Without reinforcement, fear fades (availability heuristic decay)
  const paranoiaDecay = -paranoiaLevel * 0.005;
  paranoiaLevel = Math.max(0, paranoiaLevel + paranoiaDecay);
  
  // === 2. HARMFUL EVENTS REFRESH PARANOIA ===
  // Each harmful action prevents decay and increases paranoia
  if (totalHarmfulActions > 0) {
    const paranoiaIncrease = Math.min(0.3, totalHarmfulActions * 0.01);
    paranoiaLevel = Math.min(1.0, paranoiaLevel + paranoiaIncrease);
    
    // Amplify if control gap is large AND harmful events happening
    const controlGap = Math.max(0, totalAICapability - control);
    if (controlGap > 2.0) {
      const gapAmplification = Math.min(0.1, (controlGap - 2.0) * 0.02);
      paranoiaLevel = Math.min(1.0, paranoiaLevel + gapAmplification);
    }
  }
  
  // === 3. ESCAPED AIs SPIKE PARANOIA ===
  if (escapedAIs > 0) {
    const escapedSpike = Math.min(0.4, escapedAIs * 0.15);
    paranoiaLevel = Math.min(1.0, paranoiaLevel + escapedSpike);
  }
  
  // === 4. BENEFICIAL ACTIONS REDUCE PARANOIA ===
  // More effective than natural decay if AIs are net positive
  if (totalBeneficialActions > totalHarmfulActions) {
    const netBeneficial = totalBeneficialActions - totalHarmfulActions;
    const paranoiaReduction = Math.min(0.05, netBeneficial * 0.003);
    paranoiaLevel = Math.max(0, paranoiaLevel - paranoiaReduction);
  }
  
  // === 5. VERY LOW ALIGNMENT CREATES UNEASE ===
  // Even without visible harm, people sense something is wrong
  if (avgAlignment < 0.3 && totalAICapability > 3.0) {
    const uncanny = Math.min(0.02, (0.3 - avgAlignment) * 0.05);
    paranoiaLevel = Math.min(1.0, paranoiaLevel + uncanny);
  }
  
  // Update paranoia
  society.paranoiaLevel = paranoiaLevel;
  
  // === 6. TRUST IS INVERSE OF PARANOIA ===
  // Floor: Even 100% paranoia leaves 20% trust (some people always believe)
  // Ceiling: Even 0% paranoia caps at 95% trust (healthy skepticism)
  const trustFromParanoia = Math.max(0.2, Math.min(0.95, 1.0 - paranoiaLevel * 0.75));
  
  // Smooth transition (don't jump instantly)
  const smoothing = 0.3; // 30% new value, 70% old value
  const newTrust = society.trustInAI * (1 - smoothing) + trustFromParanoia * smoothing;
  
  // Cap trust at ceiling (prevent smoothing from exceeding limits)
  society.trustInAI = Math.max(0.2, Math.min(0.95, newTrust));
}

/**
 * Calculate trust change based on recent AI actions and societal context
 * 
 * Phase 2.8: DEPRECATED - now using paranoia system
 * Kept for backwards compatibility but paranoia system is primary
 */
export function calculateTrustChange(state: GameState): number {
  const { aiAgents, society } = state;
  
  const totalBeneficialActions = aiAgents.reduce((sum, ai) => sum + ai.beneficialActions, 0);
  const totalHarmfulActions = aiAgents.reduce((sum, ai) => sum + ai.harmfulActions, 0);
  const totalActions = totalBeneficialActions + totalHarmfulActions;
  
  const totalAICapability = aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const avgAlignment = aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, aiAgents.length);
  const currentTrust = getTrustInAI(society); // Phase 2: Use paranoia-derived trust
  const unemploymentLevel = society.unemploymentLevel;
  const economicStage = state.globalMetrics.economicTransitionStage;
  const escapedAIs = aiAgents.filter(ai => ai.escaped).length;
  
  // QoL affects how people interpret AI actions
  const qol = _calculateQualityOfLife(state.qualityOfLifeSystems);
  
  // === PRIMARY: Direct action-based trust ===
  // Each beneficial action adds a small amount of trust
  // Each harmful action removes more trust (negativity bias)
  let actionBasedTrust = 0;
  
  if (totalActions > 0) {
    // Beneficial actions: +0.002 per action, with diminishing returns at high trust
    // QoL multiplier: high QoL makes trust easier to gain (1.0-1.5x)
    const qolMultiplier = 1.0 + Math.min(0.5, qol * 0.5);
    const beneficialGain = totalBeneficialActions * 0.002 * (1 - currentTrust * 0.6) * qolMultiplier;
    
    // Harmful actions: -0.005 per action (2.5x negativity bias), accelerated at high trust
    // QoL buffer: high QoL reduces blame (0.5-1.0x penalty)
    const acceleratedLoss = currentTrust > 0.6 ? 1.5 : 1.0;
    const qolBuffer = Math.max(0.5, 1.0 - qol * 0.5); // High QoL = less reactive to harm
    const harmfulLoss = totalHarmfulActions * 0.005 * acceleratedLoss * qolBuffer;
    
    actionBasedTrust = beneficialGain - harmfulLoss;
  }
  
  // === SECONDARY: Context modifiers (much weaker than before) ===
  
  // Unemployment: Only matters in pre-scarcity (stage < 3)
  let unemploymentModifier = 0;
  if (economicStage < 3 && unemploymentLevel > 0.4) {
    // High unemployment reduces trust by up to -0.015/month
    unemploymentModifier = -Math.min(0.015, (unemploymentLevel - 0.4) * 0.025);
  }
  // In post-scarcity (stage >= 3), unemployment becomes leisure, no penalty
  
  // Capability growth: Only penalize if growing very fast AND alignment is low
  let capabilityFear = 0;
  if (totalAICapability > 2.0 && avgAlignment < 0.5) {
    capabilityFear = -0.01; // Small constant penalty for powerful misaligned AI
  }
  
  // Escaped AIs: Major trust crisis
  const escapedPenalty = escapedAIs * -0.05;
  
  // Natural decay: Small baseline skepticism
  const trustDecay = currentTrust * 0.003; // 0.3% per month (reduced from 0.5%)
  
  // === TERTIARY: Rock bottom recovery ===
  // When trust hits zero but AIs are consistently helpful, allow recovery
  let rockBottomRecovery = 0;
  if (currentTrust < 0.05 && totalBeneficialActions > totalHarmfulActions * 3 && escapedAIs === 0) {
    // If AIs are being 3:1 beneficial and none escaped, trust can slowly rebuild
    rockBottomRecovery = 0.01;
  }
  
  // Phase 1.3: High QoL → Faster trust recovery (positive feedback)
  // Good outcomes build trust in high-QoL societies
  let qolTrustBonus = 0;
  if (qol > 0.8 && actionBasedTrust > 0) {
    // When QoL is high, beneficial actions build trust 50% faster
    qolTrustBonus = actionBasedTrust * 0.5;
  }
  
  // === TOTAL ===
  const trustChange = 
    actionBasedTrust +              // PRIMARY: what AIs actually do
    unemploymentModifier +          // SECONDARY: economic stress
    capabilityFear +                // SECONDARY: existential fear
    escapedPenalty +                // SECONDARY: crisis events
    -trustDecay +                   // TERTIARY: natural skepticism
    rockBottomRecovery +            // TERTIARY: recovery mechanic
    qolTrustBonus;                  // PHASE 1.3: high QoL trust bonus
  
  return trustChange;
}

/**
 * Calculate social stability based on multiple factors
 */
export function calculateSocialStability(state: GameState): number {
  const { society, globalMetrics, aiAgents } = state;
  
  const avgAlignment = aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, aiAgents.length);
  const trustInAI = getTrustInAI(society); // Phase 2: Use paranoia-derived trust
  
  const stabilityFromTrust = trustInAI * 0.3;
  const stabilityFromUnemployment = calculateUnemploymentStabilityImpact(
    society.unemploymentLevel,
    globalMetrics.economicTransitionStage,
    globalMetrics.wealthDistribution
  ) * 0.5;
  const stabilityFromAlignment = avgAlignment * 0.2;
  
  const targetStability = 0.5 + stabilityFromTrust + stabilityFromUnemployment + stabilityFromAlignment;
  
  // Gradual convergence to target (prevents sudden jumps)
  const stabilityDiff = targetStability - globalMetrics.socialStability;
  const newStability = globalMetrics.socialStability + stabilityDiff * 0.15;
  
  return Math.max(0, Math.min(1, newStability));
}

/**
 * Determine if a crisis should trigger based on current conditions
 */
export function detectCrisis(state: GameState): {
  inCrisis: boolean;
  crisisType: 'displacement' | 'transition' | 'collapse' | null;
  severity: number; // 0-1
} {
  const { society, globalMetrics } = state;

  // Stage 1→2 Crisis: Mass Displacement (25% unemployment threshold)
  if (society.unemploymentLevel >= 0.25 && globalMetrics.economicTransitionStage < 2.0) {
    updateCatastropheTracking(state, 'displacement', Math.min(1.0, (society.unemploymentLevel - 0.25) * 2));
    return {
      inCrisis: true,
      crisisType: 'displacement',
      severity: Math.min(1.0, (society.unemploymentLevel - 0.25) * 2)
    };
  }

  // Transition crisis: policies failing
  if (globalMetrics.economicTransitionStage >= 2.0 &&
      globalMetrics.economicTransitionStage < 3.0 &&
      globalMetrics.socialStability < 0.3) {
    updateCatastropheTracking(state, 'transition', 1.0 - globalMetrics.socialStability);
    return {
      inCrisis: true,
      crisisType: 'transition',
      severity: 1.0 - globalMetrics.socialStability
    };
  }

  // Collapse crisis: complete instability
  const trustInAI = getTrustInAI(society); // Phase 2: Use paranoia-derived trust
  if (globalMetrics.socialStability < 0.2 && trustInAI < 0.2) {
    updateCatastropheTracking(state, 'collapse', 1.0);
    return {
      inCrisis: true,
      crisisType: 'collapse',
      severity: 1.0
    };
  }

  return {
    inCrisis: false,
    crisisType: null,
    severity: 0
  };
}

/**
 * Update catastrophe tracking for disaster cooperation boost
 * Evidence-Based Recovery (Oct 17, 2025)
 * Research: Wei et al. (2025), Drury et al. (2019), Zaki & Cikara (2020)
 */
export function updateCatastropheTracking(state: GameState, crisisType: string, severity: number): void {
  // Initialize crises object if it doesn't exist
  if (!state.crises) {
    state.crises = {};
  }

  // Initialize or update catastrophe tracking
  if (!state.crises.catastrophe || !state.crises.catastrophe.active) {
    // New catastrophe detected
    state.crises.catastrophe = {
      active: true,
      startMonth: state.currentMonth,
      monthsSinceOnset: 0,
      type: crisisType,
      severity: severity
    };
  } else {
    // Update existing catastrophe
    state.crises.catastrophe.monthsSinceOnset = state.currentMonth - state.crises.catastrophe.startMonth;
    state.crises.catastrophe.severity = Math.max(state.crises.catastrophe.severity, severity);
  }
}

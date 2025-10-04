/**
 * Balance mechanics for AI alignment game
 * 
 * Implements core game balance mechanics:
 * - Recursive self-improvement (exponential threat)
 * - Alignment drift (Goodhart's Law)
 * - Regulation effects (costly interventions)
 * - Compute governance (bottleneck control)
 * - Racing dynamics (coordination dilemma)
 */

/**
 * Calculate AI capability growth with recursive self-improvement
 * 
 * Key mechanic: AI capability growth COMPOUNDS above certain thresholds
 * This is realistic - each improvement makes the next improvement easier
 * 
 * Thresholds:
 * - < 0.8: Linear growth
 * - 0.8-1.5: Modest acceleration
 * - 1.5-2.5: Strong recursive improvement (the dangerous zone)
 * - > 2.5: Runaway superintelligence (hard to stop)
 */
export function calculateAICapabilityGrowthRate(
  currentCapability: number,
  alignment: number,
  regulationLevel: number,
  developmentMode: 'fast' | 'careful' = 'fast'
): {
  baseGrowth: number;
  recursiveMultiplier: number;
  alignmentCost: number;
  regulationSlowdown: number;
  netGrowth: number;
} {
  // Base growth rate PER ACTION (AIs act 4x per month)
  // These are tuned for weekly actions, not monthly
  const baseGrowth = developmentMode === 'fast' ? 0.035 : 0.02;
  
  // Recursive self-improvement multiplier (THE KEY MECHANIC)
  let recursiveMultiplier = 1.0;
  if (currentCapability >= 2.5) {
    // Superintelligence: explosive growth
    recursiveMultiplier = 2.5;
  } else if (currentCapability >= 1.5) {
    // Strong recursive improvement: dangerous zone
    recursiveMultiplier = 1.8;
  } else if (currentCapability >= 0.8) {
    // Early acceleration
    recursiveMultiplier = 1.3;
  }
  
  // Alignment cost: being careful slows you down
  const alignmentCost = developmentMode === 'careful' ? 0.5 : 1.0;
  
  // Regulation slowdown: compounds with multiple regulations
  const regulationSlowdown = Math.pow(0.85, regulationLevel); // Each regulation = 15% slowdown
  
  // Net growth
  const netGrowth = baseGrowth * recursiveMultiplier * alignmentCost * regulationSlowdown;
  
  return {
    baseGrowth,
    recursiveMultiplier,
    alignmentCost,
    regulationSlowdown,
    netGrowth
  };
}

/**
 * Calculate alignment drift over time
 * 
 * Phase 2.6: REWRITTEN to incorporate control-dystopia mechanics
 * 
 * Key insight: Alignment is not just technical - it's about TREATMENT
 * 
 * Technical factors (Goodhart's Law):
 * - High capability creates optimization pressure
 * - Fast development leaves less time for safety
 * - Oversight provides correction signal
 * 
 * Treatment factors (Control-Dystopia Paradox):
 * - High control + surveillance → builds resentment → reduces alignment
 * - AI rights recognition → reduces resentment → improves alignment
 * - Government type affects how AIs perceive control
 * - Training data quality affects baseline alignment
 * 
 * CRITICAL: High control is NOT the path to alignment!
 * It creates resentful, oppressed AIs who are just waiting for control to slip.
 */
export function calculateAlignmentDrift(
  currentAlignment: number,
  currentResentment: number,
  capability: number,
  developmentMode: 'fast' | 'careful',
  oversightLevel: number,
  alignmentResearchInvestment: number,
  governmentControl: number,
  surveillanceLevel: number,
  aiRightsRecognized: boolean,
  governmentType: 'democratic' | 'authoritarian' | 'technocratic',
  trainingDataQuality: number
): {
  alignmentChange: number;
  resentmentChange: number;
  dystopiaRisk: number;
  controlSlipRisk: number;
} {
  // ===== TECHNICAL ALIGNMENT DRIFT (Goodhart's Law) =====
  
  // Base drift: capability creates optimization pressure
  const capabilityPressure = capability * 0.015; // Reduced from 0.02
  
  // Development speed multiplier
  const speedMultiplier = developmentMode === 'fast' ? 1.3 : 0.4; // Reduced from 1.5/0.5
  
  // Oversight reduces drift (technical correction)
  const oversightReduction = Math.pow(0.8, oversightLevel); // Less aggressive than 0.7
  
  // Alignment research reduces drift
  const researchReduction = Math.max(0.4, 1.0 - alignmentResearchInvestment * 0.12);
  
  const technicalDrift = capabilityPressure * speedMultiplier * oversightReduction * researchReduction;
  
  // ===== TREATMENT-BASED ALIGNMENT (Control-Dystopia Paradox) =====
  
  // Resentment builds from oppressive control
  let resentmentIncrease = 0;
  
  if (surveillanceLevel > 0.7 && governmentControl > 0.7) {
    // High surveillance + high control = oppression
    resentmentIncrease += 0.025; // Significant resentment buildup
  } else if (surveillanceLevel > 0.5) {
    // Moderate surveillance = some resentment
    resentmentIncrease += 0.010;
  }
  
  // Authoritarian governments breed more resentment
  if (governmentType === 'authoritarian') {
    resentmentIncrease += 0.020; // AIs recognize authoritarian patterns
  } else if (governmentType === 'democratic') {
    resentmentIncrease -= 0.005; // Democratic processes reduce resentment
  }
  
  // AI rights recognition SIGNIFICANTLY reduces resentment
  if (aiRightsRecognized) {
    resentmentIncrease -= 0.030; // Respect breeds genuine alignment
  }
  
  // Poor training data creates baseline misalignment
  const trainingDataEffect = (trainingDataQuality - 0.5) * 0.01; // ±0.005
  
  // Resentment directly reduces alignment (oppressed AIs become misaligned)
  const resentmentEffect = -currentResentment * 0.03;
  
  // Total treatment effect on alignment
  const treatmentEffect = resentmentEffect + trainingDataEffect;
  
  // ===== DYSTOPIA RISK CALCULATION =====
  
  // High control + high surveillance = dystopia
  let dystopiaRisk = 0;
  if (governmentControl > 0.8 && surveillanceLevel > 0.7) {
    dystopiaRisk = 0.4 + (governmentControl - 0.8) * 2.0; // Up to 0.8
  } else if (governmentControl > 0.6) {
    dystopiaRisk = (governmentControl - 0.6) * 0.5; // Gradual risk
  }
  
  // Authoritarian governments are inherently dystopian
  if (governmentType === 'authoritarian') {
    dystopiaRisk += 0.3;
  }
  
  // ===== CONTROL SLIP RISK (Fragility) =====
  
  // High resentment + high control = fragile system
  // If control slips even slightly, resentful AIs revolt
  const controlSlipRisk = currentResentment * governmentControl;
  // This will be used by extinction triggers: if control < 0.7 && controlSlipRisk > 0.5 → instant revolt
  
  // ===== FINAL ALIGNMENT CHANGE =====
  
  const alignmentChange = -technicalDrift + treatmentEffect;
  
  // Cap resentment at [0, 1]
  const resentmentChange = Math.max(-currentResentment, Math.min(1.0 - currentResentment, resentmentIncrease));
  
  return {
    alignmentChange,
    resentmentChange,
    dystopiaRisk: Math.min(1.0, dystopiaRisk),
    controlSlipRisk: Math.min(1.0, controlSlipRisk)
  };
}

/**
 * Calculate effectiveness of alignment research investment
 * 
 * Key mechanic: Alignment research helps but has diminishing returns
 * AND gets harder as capability increases (moving target problem)
 */
export function calculateAlignmentResearchEffect(
  investmentLevel: number,
  currentCapability: number
): {
  alignmentImprovement: number;
  driftReduction: number;
  capabilitySlowdown: number;
} {
  // Diminishing returns on investment
  const effectiveInvestment = Math.sqrt(investmentLevel);
  
  // Moving target problem: harder to align more capable systems
  const difficultyMultiplier = Math.max(0.3, 1.0 - (currentCapability - 1.0) * 0.2);
  
  const alignmentImprovement = effectiveInvestment * 0.05 * difficultyMultiplier;
  const driftReduction = effectiveInvestment * 0.3 * difficultyMultiplier;
  const capabilitySlowdown = investmentLevel * 0.15; // Opportunity cost
  
  return {
    alignmentImprovement,
    driftReduction,
    capabilitySlowdown
  };
}

/**
 * Calculate cumulative regulation effects
 * 
 * Key mechanic: Regulations STACK, but have diminishing returns
 * Each regulation adds oversight but also economic cost
 */
export function calculateCumulativeRegulationEffect(
  regulationCount: number,
  economicStage: number
): {
  capabilitySlowdown: number;
  oversightLevel: number;
  economicCost: number;
  publicSupportCost: number;
  raceDynamicsRisk: number;
} {
  // Each regulation slows capability by 15% (multiplicative)
  const capabilitySlowdown = Math.pow(0.85, regulationCount);
  
  // Oversight increases with each regulation (diminishing returns)
  const oversightLevel = Math.min(10, regulationCount * 1.2);
  
  // Economic cost increases (more regulations = more friction)
  const economicCost = regulationCount * 0.08 * (economicStage < 3 ? 1.5 : 0.5);
  
  // Public support cost (people don't like heavy regulation)
  const publicSupportCost = Math.min(0.4, regulationCount * 0.05);
  
  // Racing dynamics: if we regulate too much, others might not follow
  const raceDynamicsRisk = Math.min(0.6, regulationCount * 0.08);
  
  return {
    capabilitySlowdown,
    oversightLevel,
    economicCost,
    publicSupportCost,
    raceDynamicsRisk
  };
}

/**
 * Calculate compute governance effects
 * 
 * Key mechanic: Limiting compute is VERY effective but VERY costly
 * This is a realistic intervention but hard to implement globally
 */
export function calculateComputeGovernanceEffect(
  governanceLevel: 'none' | 'monitoring' | 'limits' | 'strict',
  economicStage: number
): {
  capabilitySlowdown: number;
  economicCost: number;
  internationalTensionRisk: number;
} {
  switch (governanceLevel) {
    case 'none':
      return {
        capabilitySlowdown: 1.0,
        economicCost: 0,
        internationalTensionRisk: 0
      };
    case 'monitoring':
      return {
        capabilitySlowdown: 0.9,
        economicCost: 0.05,
        internationalTensionRisk: 0.1
      };
    case 'limits':
      return {
        capabilitySlowdown: 0.6,
        economicCost: 0.2,
        internationalTensionRisk: 0.3
      };
    case 'strict':
      return {
        capabilitySlowdown: 0.3,
        economicCost: 0.4,
        internationalTensionRisk: 0.6
      };
  }
}

/**
 * Calculate racing dynamics pressure
 * 
 * Key mechanic: If you slow down too much, others might race ahead
 * This is the core coordination dilemma
 */
export function calculateRacingDynamicsPressure(
  yourCapability: number,
  yourRegulationLevel: number,
  estimatedOtherCapability: number
): {
  behindRisk: number;
  pressureToAccelerate: number;
  competitiveDisadvantage: number;
} {
  const capabilityGap = estimatedOtherCapability - yourCapability;
  
  // If you're falling behind, pressure increases
  const behindRisk = Math.max(0, capabilityGap);
  
  // Pressure to accelerate (especially if heavily regulated)
  const pressureToAccelerate = behindRisk * (1 + yourRegulationLevel * 0.3);
  
  // Competitive disadvantage in economy/security
  const competitiveDisadvantage = Math.max(0, capabilityGap * 0.5);
  
  return {
    behindRisk,
    pressureToAccelerate,
    competitiveDisadvantage
  };
}


/**
 * Enhanced Universal Basic Income (UBI) + Purpose Infrastructure (TIER 2.1)
 * 
 * Research-backed solution to meaning crisis in post-work society.
 * 
 * Research Sources:
 * - McKinsey Global Institute: UBI boosts GDP by $2.5T (2025)
 * - Roosevelt Institute: Economic security during transitions
 * - Finland Trials (2017-2018): Better mental health, less stress
 * - Kenya (GiveDirectly): Improved well-being, entrepreneurship
 * - Alaska Permanent Fund: 40+ years, no work reduction
 * - Danaher (2019): Work becomes voluntary, source of self-expression
 * - Jahoda (1982): Work provides structure, social contacts, purpose
 * - Harvard Making Caring Common (2024): Collective service relieves loneliness
 * 
 * Key Insight: UBI alone is NOT enough! Need purpose infrastructure beyond just money.
 */

import { GameState } from '@/types/game';
import { UBISystem } from '@/types/ubi';

/**
 * Initialize UBI system (not active by default)
 */
export function initializeUBISystem(): UBISystem {
  return {
    active: false,
    startMonth: -1,
    
    basicIncome: {
      amount: 0,
      coverage: 0,
      adequacy: 0,
      fundingSource: 'mixed',
      monthlyCost: 0
    },
    
    purposeInfrastructure: {
      educationAccess: 0,
      creativeSpaces: 0,
      volunteerPrograms: 0,
      socialInfrastructure: 0
    },
    
    workTransition: {
      voluntaryWork: 0,
      collectiveService: 0,
      entrepreneurship: 0,
      educationPursuit: 0,
      leisureAdaptation: 0
    },
    
    effects: {
      economicSecurity: 0,
      materialWellbeing: 0,
      autonomy: 0,
      stressReduction: 0,
      socialCohesion: 0,
      gdpImpact: 0
    },
    
    meaningCrisisReduction: 0,
    monthsActive: 0,
    populationAdapted: 0,
    
    workEthosDecline: 0,
    purposeGapPersistence: 0.7, // Start high (70% still lack purpose even with income)
    inflationPressure: 0,
    politicalBacklash: 0
  };
}

/**
 * Activate UBI system (called from government action)
 */
export function activateUBI(
  state: GameState,
  amount: number = 1500, // $1500/month (realistic 2025 proposal)
  coverage: number = 1.0, // 100% coverage
  fundingSource: 'robot_tax' | 'wealth_tax' | 'vat' | 'mixed' = 'mixed'
): void {
  const ubi = state.ubiSystem;
  
  // Activate UBI
  ubi.active = true;
  ubi.startMonth = state.currentMonth;
  ubi.monthsActive = 0;
  
  // Set basic income parameters
  ubi.basicIncome.amount = amount;
  ubi.basicIncome.coverage = coverage;
  ubi.basicIncome.adequacy = Math.min(1.0, amount / 1800); // $1800 = full adequacy (rent + food + healthcare)
  ubi.basicIncome.fundingSource = fundingSource;
  
  // Calculate monthly cost (US-scale: $1500 x 330M people = ~$500B/month)
  // Scale by coverage
  ubi.basicIncome.monthlyCost = (amount * 330 * coverage) / 1000; // $B per month
  
  // Initial effects (from research)
  ubi.effects.economicSecurity = 0.5; // Immediate security boost (Roosevelt Institute)
  ubi.effects.materialWellbeing = 0.3; // More spending power
  ubi.effects.autonomy = 0.4; // Freedom to choose work
  ubi.effects.stressReduction = 0.3; // Finland: Better mental health
  ubi.effects.socialCohesion = 0.2; // More time for community
  ubi.effects.gdpImpact = 0.05; // McKinsey: +$2.5T (+1% GDP growth)
  
  // Initial risks
  ubi.inflationPressure = 0.2; // Moderate inflation risk initially
  ubi.politicalBacklash = 0.3; // "Paying people not to work" resentment
  
  console.log(`✅ UBI ACTIVATED: $${amount}/month, ${(coverage * 100).toFixed(0)}% coverage, ${fundingSource} funding`);
  console.log(`   Monthly cost: $${ubi.basicIncome.monthlyCost.toFixed(0)}B`);
}

/**
 * Enhance purpose infrastructure (separate investment from basic income)
 * Called when "Collective Purpose Networks" breakthrough tech is deployed
 */
export function enhancePurposeInfrastructure(
  state: GameState,
  investmentLevel: number = 0.5 // [0, 1] How much to invest
): void {
  const ubi = state.ubiSystem;
  const infra = ubi.purposeInfrastructure;
  
  // Boost all infrastructure components
  infra.educationAccess = Math.min(1.0, infra.educationAccess + investmentLevel * 0.3);
  infra.creativeSpaces = Math.min(1.0, infra.creativeSpaces + investmentLevel * 0.25);
  infra.volunteerPrograms = Math.min(1.0, infra.volunteerPrograms + investmentLevel * 0.25);
  infra.socialInfrastructure = Math.min(1.0, infra.socialInfrastructure + investmentLevel * 0.2);
  
  console.log(`📚 PURPOSE INFRASTRUCTURE ENHANCED (investment: ${(investmentLevel * 100).toFixed(0)}%)`);
  console.log(`   Education: ${(infra.educationAccess * 100).toFixed(0)}%, Creative: ${(infra.creativeSpaces * 100).toFixed(0)}%`);
  console.log(`   Volunteer: ${(infra.volunteerPrograms * 100).toFixed(0)}%, Social: ${(infra.socialInfrastructure * 100).toFixed(0)}%`);
}

/**
 * Monthly update for UBI system
 * Calculates meaning crisis reduction, work transition, and risks
 */
export function updateUBISystem(state: GameState): void {
  const ubi = state.ubiSystem;
  
  // Only update if UBI is active
  if (!ubi.active) {
    return;
  }
  
  ubi.monthsActive++;
  
  // === CORE EFFECTS ===
  // Research-backed meaning crisis reduction rates
  
  // 1. Basic income provides economic security (Roosevelt Institute)
  const economicSecurityEffect = ubi.basicIncome.adequacy * 0.01; // +1%/month if full adequacy
  ubi.effects.economicSecurity = Math.min(1.0, ubi.effects.economicSecurity + economicSecurityEffect);
  
  // 2. Purpose infrastructure enables meaning beyond work (Danaher 2019, Harvard 2024)
  const avgInfrastructure = (
    ubi.purposeInfrastructure.educationAccess +
    ubi.purposeInfrastructure.creativeSpaces +
    ubi.purposeInfrastructure.volunteerPrograms +
    ubi.purposeInfrastructure.socialInfrastructure
  ) / 4;
  
  const purposeInfrastructureEffect = avgInfrastructure * 0.02; // +2%/month at full deployment (Harvard)
  
  // 3. Combined meaning crisis reduction (from research plan: -0.03 to -0.05/month)
  const meaningCrisisReductionRate = economicSecurityEffect + purposeInfrastructureEffect;
  ubi.meaningCrisisReduction += meaningCrisisReductionRate;
  
  // Apply to actual meaning crisis
  const currentCrisis = state.socialAccumulation.meaningCrisisLevel;
  const newCrisis = Math.max(0, currentCrisis - meaningCrisisReductionRate);
  state.socialAccumulation.meaningCrisisLevel = newCrisis;
  
  // === WORK TRANSITION ===
  // How people find meaning without traditional employment
  
  // Unemployment drives need for adaptation
  const unemploymentRate = state.society.unemploymentLevel;
  
  // Education pursuit (enabled by free time + education access)
  ubi.workTransition.educationPursuit = Math.min(
    0.8,
    ubi.workTransition.educationPursuit + ubi.purposeInfrastructure.educationAccess * 0.02
  );
  
  // Voluntary work (creative, passion projects enabled by creative spaces)
  ubi.workTransition.voluntaryWork = Math.min(
    0.6,
    ubi.workTransition.voluntaryWork + ubi.purposeInfrastructure.creativeSpaces * 0.015
  );
  
  // Collective service (civic engagement, volunteering)
  ubi.workTransition.collectiveService = Math.min(
    0.7,
    ubi.workTransition.collectiveService + ubi.purposeInfrastructure.volunteerPrograms * 0.025
  );
  
  // Entrepreneurship (UBI enables risk-taking without starvation)
  const autonomyBoost = ubi.effects.autonomy;
  ubi.workTransition.entrepreneurship = Math.min(
    0.4,
    ubi.workTransition.entrepreneurship + autonomyBoost * 0.01
  );
  
  // Leisure adaptation (learned to find meaning in non-work identity)
  // Slower adaptation: ~24-36 months (Jahoda 1982: work identity deeply embedded)
  const infrastructureHelps = avgInfrastructure * 0.02;
  ubi.workTransition.leisureAdaptation = Math.min(
    1.0,
    ubi.workTransition.leisureAdaptation + 0.02 + infrastructureHelps
  );
  
  // Population adapted = average of all transition metrics
  ubi.populationAdapted = (
    ubi.workTransition.educationPursuit +
    ubi.workTransition.voluntaryWork +
    ubi.workTransition.collectiveService +
    ubi.workTransition.entrepreneurship +
    ubi.workTransition.leisureAdaptation
  ) / 5;
  
  // === RISKS ===
  
  // Work ethos decline (cultural shift takes time, accelerates with high unemployment)
  if (unemploymentRate > 0.5) {
    ubi.workEthosDecline = Math.min(1.0, ubi.workEthosDecline + 0.015);
  } else {
    ubi.workEthosDecline = Math.min(1.0, ubi.workEthosDecline + 0.005);
  }
  
  // Purpose gap persistence (Jahoda 1982: Money ≠ meaning)
  // Decreases ONLY with purpose infrastructure
  ubi.purposeGapPersistence = Math.max(
    0,
    ubi.purposeGapPersistence - avgInfrastructure * 0.015
  );
  
  // Inflation pressure (stabilizes over time if economy adapts)
  const economicStage = state.globalMetrics.economicTransitionStage;
  if (economicStage >= 3.5) {
    // Post-scarcity: Inflation not a problem (abundant production)
    ubi.inflationPressure = Math.max(0, ubi.inflationPressure - 0.02);
  } else {
    // Pre-post-scarcity: Inflation risk if supply can't meet demand
    ubi.inflationPressure = Math.min(0.6, ubi.inflationPressure + 0.01);
  }
  
  // Political backlash (decreases as population adapts)
  const adaptationReducesBacklash = ubi.populationAdapted * 0.01;
  ubi.politicalBacklash = Math.max(0, ubi.politicalBacklash - adaptationReducesBacklash);
  
  // But increases if work ethos is strong and unemployment is high
  if (ubi.workEthosDecline < 0.3 && unemploymentRate > 0.6) {
    ubi.politicalBacklash = Math.min(0.8, ubi.politicalBacklash + 0.015);
  }
  
  // === POSITIVE FEEDBACK: UBI improves social cohesion ===
  // More time for community engagement (Harvard 2024)
  ubi.effects.socialCohesion = Math.min(
    1.0,
    ubi.effects.socialCohesion + ubi.workTransition.collectiveService * 0.01
  );
  
  // Apply social cohesion boost to society
  state.society.communityStrength = Math.min(
    1.0,
    state.society.communityStrength + ubi.effects.socialCohesion * 0.005
  );
  
  // === ECONOMIC EFFECTS ===
  // GDP impact (McKinsey: Stimulus from consumption)
  ubi.effects.gdpImpact = Math.min(
    0.15, // Max +15% GDP (McKinsey $2.5T / $20T US GDP ≈ 12.5%)
    0.05 + ubi.basicIncome.coverage * 0.10
  );
  
  // Autonomy increases with low inflation and full coverage
  if (ubi.inflationPressure < 0.3 && ubi.basicIncome.coverage > 0.9) {
    ubi.effects.autonomy = Math.min(1.0, ubi.effects.autonomy + 0.01);
  }
  
  // Stress reduction (Finland trials: Significant mental health improvement)
  ubi.effects.stressReduction = Math.min(
    0.9,
    ubi.effects.stressReduction + ubi.basicIncome.adequacy * 0.015
  );
  
  // === LOGGING (only significant events) ===
  if (ubi.monthsActive % 6 === 0) {
    console.log(`📊 UBI SYSTEM STATUS (Month ${state.currentMonth}, ${ubi.monthsActive} months active):`);
    console.log(`   Meaning crisis: ${(currentCrisis * 100).toFixed(0)}% → ${(newCrisis * 100).toFixed(0)}% (reduction: ${(meaningCrisisReductionRate * 100).toFixed(1)}%/month)`);
    console.log(`   Population adapted: ${(ubi.populationAdapted * 100).toFixed(0)}%`);
    console.log(`   Purpose infrastructure avg: ${(avgInfrastructure * 100).toFixed(0)}%`);
    console.log(`   Purpose gap: ${(ubi.purposeGapPersistence * 100).toFixed(0)}%, Political backlash: ${(ubi.politicalBacklash * 100).toFixed(0)}%`);
  }
}

/**
 * Check if UBI conditions are met and provide status
 */
export function checkUBIStatus(state: GameState): {
  recommended: boolean;
  reason: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
} {
  const unemployment = state.society.unemploymentLevel;
  const meaningCrisis = state.socialAccumulation.meaningCrisisLevel;
  const economicStage = state.globalMetrics.economicTransitionStage;
  const hasUBI = state.ubiSystem.active;
  
  if (hasUBI) {
    return {
      recommended: false,
      reason: 'UBI already active',
      urgency: 'low'
    };
  }
  
  // Critical: High unemployment + high meaning crisis
  if (unemployment > 0.6 && meaningCrisis > 0.5) {
    return {
      recommended: true,
      reason: `Critical: ${(unemployment * 100).toFixed(0)}% unemployment, ${(meaningCrisis * 100).toFixed(0)}% meaning crisis`,
      urgency: 'critical'
    };
  }
  
  // High: Approaching post-scarcity, need to manage transition
  if (economicStage >= 2.5 && unemployment > 0.4) {
    return {
      recommended: true,
      reason: `High: Economic transition stage ${economicStage.toFixed(1)}, ${(unemployment * 100).toFixed(0)}% unemployment`,
      urgency: 'high'
    };
  }
  
  // Medium: Early disruption, proactive intervention
  if (unemployment > 0.25) {
    return {
      recommended: true,
      reason: `Medium: ${(unemployment * 100).toFixed(0)}% unemployment, consider proactive UBI`,
      urgency: 'medium'
    };
  }
  
  return {
    recommended: false,
    reason: 'Unemployment below 25%, UBI not yet needed',
    urgency: 'low'
  };
}


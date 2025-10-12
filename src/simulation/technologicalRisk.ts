/**
 * Technological Risk Accumulation (Phase 4: Golden Age & Accumulation Systems)
 * 
 * Tracks risks from AI capability growth compounding faster than safety measures.
 * Golden Age prosperity creates complacency → reduced vigilance → risks accumulate.
 */

import { GameState, TechnologicalRisk } from '@/types/game';
import { calculateAverageAlignment } from './outcomes';

export function initializeTechnologicalRisk(): TechnologicalRisk {
  return {
    misalignmentRisk: 0.10,          // Baseline AI risk
    safetyDebt: 0.05,                 // Small initial gap
    concentrationRisk: 0.25,          // Some market concentration already
    complacencyLevel: 0.30,           // Moderate complacency
    controlLossActive: false,
    corporateDystopiaActive: false,
    complacencyCrisisActive: false
  };
}

export function updateTechnologicalRisk(state: GameState): void {
  const risk = state.technologicalRisk;
  const avgCapability = state.aiAgents.length > 0
    ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length
    : 0;
  const avgAlignment = calculateAverageAlignment(state.aiAgents);
  
  // Capability growth rate (approximation)
  const capabilityGrowthRate = Math.max(0, avgCapability - 0.5) * 0.1;
  
  // === MISALIGNMENT RISK ===
  let misalignmentRate = capabilityGrowthRate * 0.015;
  if (avgAlignment < 0.5) misalignmentRate += 0.010;
  if (avgCapability > 1.5) misalignmentRate += 0.008;
  
  // Organizations amplify risk if racing recklessly
  const racingOrgs = state.organizations.filter(o => 
    o.type === 'private' && 
    (o.priorities.capabilityRace > 0.8 || o.priorities.safetyResearch < 0.4)
  );
  if (racingOrgs.length > 2) misalignmentRate += 0.005 * racingOrgs.length;
  
  // Mitigation
  const alignmentResearch = state.government.alignmentResearchInvestment ?? 0;
  if (alignmentResearch > 3.0) misalignmentRate *= 0.7;
  
  const currentMisalignmentRisk = isNaN(risk.misalignmentRisk) ? 0.1 : risk.misalignmentRisk;
  risk.misalignmentRisk = Math.max(0, Math.min(1, currentMisalignmentRisk + misalignmentRate));
  
  // === SAFETY DEBT ===
  // Use evaluation investment as proxy for safety research
  const safetyResearch = state.government.evaluationInvestment?.alignmentTests ?? 1.0;
  let safetyGap = Math.max(0, capabilityGrowthRate - (safetyResearch * 0.01));
  
  // Organizations worsen safety debt if prioritizing profit over safety
  const unsafeOrgs = state.organizations.filter(o =>
    o.type === 'private' &&
    o.priorities.profitMaximization > 0.8 &&
    o.priorities.safetyResearch < 0.5
  );
  if (unsafeOrgs.length > 0) {
    safetyGap += 0.003 * unsafeOrgs.length;
  }
  
  const currentSafetyDebt = isNaN(risk.safetyDebt) ? 0.05 : risk.safetyDebt;
  risk.safetyDebt = Math.max(0, Math.min(1, currentSafetyDebt + safetyGap * 0.05));
  
  // === CONCENTRATION RISK ===
  const orgCount = state.organizations?.length ?? 4;
  const marketConcentration = orgCount < 5 ? 0.8 : orgCount < 10 ? 0.5 : 0.3;
  const currentConcentrationRisk = isNaN(risk.concentrationRisk) ? marketConcentration : risk.concentrationRisk;
  risk.concentrationRisk = Math.max(currentConcentrationRisk, marketConcentration);
  
  // === COMPLACENCY (Golden Age effect) ===
  if (state.goldenAgeState.active) {
    risk.complacencyLevel = Math.min(1, risk.complacencyLevel + 0.015);
  } else {
    risk.complacencyLevel = Math.max(0, risk.complacencyLevel - 0.005);
  }
  
  checkTechnologicalCrises(state);
}

function checkTechnologicalCrises(state: GameState): void {
  const risk = state.technologicalRisk;
  const qol = state.qualityOfLifeSystems;
  
  // CONTROL LOSS
  if ((risk.misalignmentRisk > 0.7 || risk.safetyDebt > 0.6) && !risk.controlLossActive) {
    risk.controlLossActive = true;
    try {
      console.log(`\n🚨 AI CONTROL LOSS TRIGGERED (Month ${state.currentMonth})`);
      console.log(`   Misalignment Risk: ${(risk.misalignmentRisk * 100).toFixed(1)}%`);
      console.log(`   Safety Debt: ${(risk.safetyDebt * 100).toFixed(1)}%`);
      console.log(`   Impact: Catastrophic scenario probability increased\n`);
    } catch (e) { /* Ignore EPIPE */ }

    qol.physicalSafety *= 0.7;
    qol.autonomy *= 0.6;
    state.globalMetrics.socialStability = Math.max(0, state.globalMetrics.socialStability - 0.4);

    // Population impact: AI control loss causes accidents, infrastructure failures (0.5-1% casualties)
    // SEMI-GLOBAL: Infrastructure-dependent regions (modern nations with AI systems) = ~70% of world
    // 1.2% mortality rate from AI-caused disasters in dependent regions
    const { addAcuteCrisisDeaths } = require('./populationDynamics');
    addAcuteCrisisDeaths(state, 0.012, 'AI control loss - infrastructure failures/accidents (AI-dependent regions)', 0.70, 'ai');
  }
  
  // CORPORATE DYSTOPIA
  if (risk.concentrationRisk > 0.7 && !risk.corporateDystopiaActive) {
    const corporatePower = state.organizations
      .filter(o => o.type === 'private')
      .reduce((sum, o) => sum + o.capital, 0) / 1000000;

    if (corporatePower > 50) {
      risk.corporateDystopiaActive = true;
      try {
        console.log(`\n🏢 CORPORATE DYSTOPIA TRIGGERED (Month ${state.currentMonth})`);
        console.log(`   Market Concentration: ${(risk.concentrationRisk * 100).toFixed(1)}%`);
        console.log(`   Impact: AI-powered feudalism emerging\n`);
      } catch (e) { /* Ignore EPIPE */ }

      qol.politicalFreedom *= 0.5;
      qol.autonomy *= 0.6;
      qol.informationIntegrity *= 0.6;

      // Population impact: Corporate dystopia causes resource hoarding, healthcare denial (0.2-0.4% casualties)
      // SEMI-GLOBAL: Regions where corporations dominate (US, EU, parts of Asia) = ~40% of world
      // 0.75% mortality rate from healthcare denial/resource hoarding
      const { addAcuteCrisisDeaths } = require('./populationDynamics');
      addAcuteCrisisDeaths(state, 0.0075, 'Corporate dystopia - resource hoarding/healthcare denial (corporate-controlled)', 0.40, 'ai');
    }
  }
  
  // COMPLACENCY CRISIS
  if (risk.complacencyLevel > 0.6 && !risk.complacencyCrisisActive) {
    risk.complacencyCrisisActive = true;
    try {
      console.log(`\n😴 COMPLACENCY CRISIS TRIGGERED (Month ${state.currentMonth})`);
      console.log(`   Complacency Level: ${(risk.complacencyLevel * 100).toFixed(1)}%`);
      console.log(`   Impact: Safety measures degrading\n`);
    } catch (e) { /* Ignore EPIPE */ }
    
    // Increase risk of catastrophic scenarios slipping through
    risk.misalignmentRisk = Math.min(1, risk.misalignmentRisk + 0.2);
    risk.safetyDebt = Math.min(1, risk.safetyDebt + 0.15);
  }
  
  // Ongoing impacts
  // Calculate cascading failure multiplier (counts crises across ALL systems)
  const cascadeMultiplier = calculateCascadingFailureMultiplier(state);
  
  if (risk.controlLossActive) {
    qol.physicalSafety = Math.max(0, qol.physicalSafety - 0.010 * cascadeMultiplier);
  }
  if (risk.corporateDystopiaActive) {
    qol.autonomy = Math.max(0, qol.autonomy - 0.008 * cascadeMultiplier);
  }
}

export function getTechnologicalSafety(risk: TechnologicalRisk): number {
  return (
    (1 - risk.misalignmentRisk) * 0.35 +
    (1 - risk.safetyDebt) * 0.35 +
    (1 - risk.concentrationRisk) * 0.15 +
    (1 - risk.complacencyLevel) * 0.15
  );
}

export function hasTechnologicalCrisis(risk: TechnologicalRisk): boolean {
  return risk.controlLossActive || risk.corporateDystopiaActive || risk.complacencyCrisisActive;
}

/**
 * Calculate cascading failure multiplier - shared across all systems
 */
function calculateCascadingFailureMultiplier(state: GameState): number {
  const activeCrises = [
    // Environmental (4 possible)
    state.environmentalAccumulation.resourceCrisisActive,
    state.environmentalAccumulation.pollutionCrisisActive,
    state.environmentalAccumulation.climateCrisisActive,
    state.environmentalAccumulation.ecosystemCrisisActive,
    // Social (3 possible)
    state.socialAccumulation.meaningCollapseActive,
    state.socialAccumulation.institutionalFailureActive,
    state.socialAccumulation.socialUnrestActive,
    // Technological (3 possible)
    state.technologicalRisk.controlLossActive,
    state.technologicalRisk.corporateDystopiaActive,
    state.technologicalRisk.complacencyCrisisActive
  ].filter(Boolean).length;
  
  if (activeCrises <= 2) {
    return 1.0; // No amplification for 1-2 crises
  }
  
  // Each crisis beyond 2 adds 50% more degradation
  return 1.0 + (activeCrises - 2) * 0.5;
}


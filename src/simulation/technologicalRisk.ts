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
  
  // Mitigation
  const alignmentResearch = state.government.alignmentResearchInvestment;
  if (alignmentResearch > 3.0) misalignmentRate *= 0.7;
  
  risk.misalignmentRisk = Math.max(0, Math.min(1, risk.misalignmentRisk + misalignmentRate));
  
  // === SAFETY DEBT ===
  const safetyResearch = state.government.researchInvestments.safety;
  const safetyGap = Math.max(0, capabilityGrowthRate - (safetyResearch * 0.01));
  risk.safetyDebt = Math.max(0, Math.min(1, risk.safetyDebt + safetyGap * 0.05));
  
  // === CONCENTRATION RISK ===
  const orgCount = state.organizations.length;
  const marketConcentration = orgCount < 5 ? 0.8 : orgCount < 10 ? 0.5 : 0.3;
  risk.concentrationRisk = Math.max(risk.concentrationRisk, marketConcentration);
  
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
    console.log(`\n🚨 AI CONTROL LOSS TRIGGERED (Month ${state.currentMonth})`);
    console.log(`   Misalignment Risk: ${(risk.misalignmentRisk * 100).toFixed(1)}%`);
    console.log(`   Safety Debt: ${(risk.safetyDebt * 100).toFixed(1)}%`);
    console.log(`   Impact: Catastrophic scenario probability increased\n`);
    
    qol.physicalSafety *= 0.7;
    qol.autonomy *= 0.6;
    state.globalMetrics.socialStability = Math.max(0, state.globalMetrics.socialStability - 0.4);
  }
  
  // CORPORATE DYSTOPIA
  if (risk.concentrationRisk > 0.7 && !risk.corporateDystopiaActive) {
    const corporatePower = state.organizations
      .filter(o => o.type === 'private')
      .reduce((sum, o) => sum + o.capital, 0) / 1000000;
      
    if (corporatePower > 50) {
      risk.corporateDystopiaActive = true;
      console.log(`\n🏢 CORPORATE DYSTOPIA TRIGGERED (Month ${state.currentMonth})`);
      console.log(`   Market Concentration: ${(risk.concentrationRisk * 100).toFixed(1)}%`);
      console.log(`   Impact: AI-powered feudalism emerging\n`);
      
      qol.politicalFreedom *= 0.5;
      qol.autonomy *= 0.6;
      qol.informationIntegrity *= 0.6;
    }
  }
  
  // COMPLACENCY CRISIS
  if (risk.complacencyLevel > 0.6 && !risk.complacencyCrisisActive) {
    risk.complacencyCrisisActive = true;
    console.log(`\n😴 COMPLACENCY CRISIS TRIGGERED (Month ${state.currentMonth})`);
    console.log(`   Complacency Level: ${(risk.complacencyLevel * 100).toFixed(1)}%`);
    console.log(`   Impact: Safety measures degrading\n`);
    
    // Increase risk of catastrophic scenarios slipping through
    risk.misalignmentRisk = Math.min(1, risk.misalignmentRisk + 0.2);
    risk.safetyDebt = Math.min(1, risk.safetyDebt + 0.15);
  }
  
  // Ongoing impacts
  if (risk.controlLossActive) {
    qol.physicalSafety = Math.max(0, qol.physicalSafety - 0.010);
  }
  if (risk.corporateDystopiaActive) {
    qol.autonomy = Math.max(0, qol.autonomy - 0.008);
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


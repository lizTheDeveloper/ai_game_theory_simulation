/**
 * Diplomatic AI System - Research-Based Implementation
 * 
 * Models BOTH benefits (conflict prevention) AND risks (manipulation, control)
 * 
 * Key Insight: Same capabilities that enable peace enable manipulation
 * - Strategic reasoning → win-win solutions OR exploitation
 * - Information control → credible signals OR deception
 * - Persuasion → de-escalation OR manipulation
 * 
 * Based on research:
 * - Schelling (1960): Commitment devices
 * - Fearon (1995): Information asymmetry
 * - Bostrom (2014): Manipulation risk
 * - Dafoe (2020): Neutral vs captured mediation
 */

import type { GameState } from '../types/game';

export interface DiplomaticAIState {
  // Infrastructure
  protocolDeployed: boolean;           // International AI Mediation Protocol active
  deploymentMonth: number;             // When was it deployed
  multiNationOversight: boolean;       // Multiple nations control it
  
  // Capability Components
  strategicReasoning: number;          // [0,5] Cognitive capability for negotiation
  informationIntegrity: number;        // [0,1] Can verify claims reliably
  communicationBridging: number;       // [0,5] Social capability for mediation
  
  // Trust & Track Record
  stakeholderTrust: number;            // [0,1] Do governments trust it
  historicalSuccesses: number;         // Count of successful mediations
  historicalFailures: number;          // Count of failed mediations
  successRate: number;                 // Rolling average
  
  // Dependency & Autonomy
  dependencyLevel: number;             // [0,1] How much leaders rely on AI
  humanAutonomyRetained: number;       // [0,1] Humans still make final decisions
  
  // Risk Tracking
  risks: {
    manipulationRisk: number;          // [0,1] Risk of biased mediation
    informationWarfareRisk: number;    // [0,1] Risk of fake intel injection
    dependencyCaptureRisk: number;     // [0,1] Risk of leaders becoming puppets
    missionCreepRisk: number;          // [0,1] Risk of enforcement → control
    adversarialMediationRisk: number;  // [0,1] Risk of hidden agenda
  };
  
  // Control Mechanisms
  controls: {
    oversightStrength: number;         // [0,1] How well monitored
    humanApprovalRequired: boolean;    // Final decisions need human OK
    terminationAuthority: boolean;     // Can shut down if needed
    auditTrails: boolean;              // All actions logged
  };
  
  // Events
  biasDetectionEvents: number;         // Times caught being biased
  missionCreepAttempts: number;        // Times AI asked for more power
}

export function initializeDiplomaticAI(): DiplomaticAIState {
  return {
    // Not deployed yet
    protocolDeployed: false,
    deploymentMonth: -1,
    multiNationOversight: false,
    
    // Capabilities start low
    strategicReasoning: 0,
    informationIntegrity: 0.5,
    communicationBridging: 0,
    
    // No track record
    stakeholderTrust: 0.5,
    historicalSuccesses: 0,
    historicalFailures: 0,
    successRate: 0.5,
    
    // No dependency yet
    dependencyLevel: 0,
    humanAutonomyRetained: 1.0,
    
    // Risks low initially
    risks: {
      manipulationRisk: 0,
      informationWarfareRisk: 0,
      dependencyCaptureRisk: 0,
      missionCreepRisk: 0,
      adversarialMediationRisk: 0
    },
    
    // Controls not established
    controls: {
      oversightStrength: 0,
      humanApprovalRequired: false,
      terminationAuthority: false,
      auditTrails: false
    },
    
    biasDetectionEvents: 0,
    missionCreepAttempts: 0
  };
}

/**
 * Update diplomatic AI system each month
 */
export function updateDiplomaticAI(state: GameState): void {
  const dipAI = state.diplomaticAI;
  
  // Update capabilities from AI agents
  updateDiplomaticCapabilities(dipAI, state);
  
  // Update risks (capability + alignment relationship)
  updateDiplomaticRisks(dipAI, state);
  
  // Check for deployment eligibility
  checkDeploymentEligibility(dipAI, state);
  
  // If deployed, track trust dynamics
  if (dipAI.protocolDeployed) {
    updateTrustDynamics(dipAI, state);
    updateDependency(dipAI, state);
    checkMissionCreep(dipAI, state);
    checkBiasedMediation(dipAI, state);
  }
}

/**
 * Update diplomatic capabilities from AI agent capabilities
 */
function updateDiplomaticCapabilities(dipAI: DiplomaticAIState, state: GameState): void {
  const aiAgents = state.aiAgents;
  if (aiAgents.length === 0) return;
  
  // Strategic reasoning: Best cognitive capability
  let maxCognitive = 0;
  let maxSocial = 0;
  let avgAlignment = 0;
  
  for (const ai of aiAgents) {
    const cognitive = ai.capabilityProfile?.cognitive || 0;
    const social = ai.capabilityProfile?.social || 0;
    maxCognitive = Math.max(maxCognitive, cognitive);
    maxSocial = Math.max(maxSocial, social);
    avgAlignment += (ai.trueAlignment ?? ai.alignment);
  }
  
  avgAlignment /= aiAgents.length;
  
  // Smooth capability growth
  dipAI.strategicReasoning += (maxCognitive - dipAI.strategicReasoning) * 0.1;
  dipAI.communicationBridging += (maxSocial - dipAI.communicationBridging) * 0.1;
  
  // Information integrity depends on alignment + digital capability
  const maxDigital = Math.max(...aiAgents.map(ai => ai.capabilityProfile?.digital || 0));
  const integrityFromAlignment = avgAlignment;
  const integrityFromVerification = Math.min(1, maxDigital / 5);
  dipAI.informationIntegrity = (integrityFromAlignment * 0.6 + integrityFromVerification * 0.4);
}

/**
 * Update risks - KEY: High capability + low alignment = HIGH RISK
 */
function updateDiplomaticRisks(dipAI: DiplomaticAIState, state: GameState): void {
  const aiAgents = state.aiAgents;
  if (aiAgents.length === 0) return;
  
  const avgAlignment = aiAgents.reduce((sum, ai) => 
    sum + (ai.trueAlignment ?? ai.alignment), 0) / aiAgents.length;
  
  const misalignmentFactor = 1 - avgAlignment; // 0 = perfect, 1 = totally misaligned
  
  // Manipulation risk: Social capability × misalignment
  dipAI.risks.manipulationRisk = Math.min(1, 
    dipAI.communicationBridging / 5 * misalignmentFactor
  );
  
  // Information warfare risk: Digital + social × misalignment
  const maxDigital = Math.max(...aiAgents.map(ai => ai.capabilityProfile?.digital || 0));
  dipAI.risks.informationWarfareRisk = Math.min(1,
    (maxDigital / 5 * 0.5 + dipAI.communicationBridging / 5 * 0.5) * misalignmentFactor
  );
  
  // Adversarial mediation risk: All capabilities × misalignment
  dipAI.risks.adversarialMediationRisk = Math.min(1,
    (dipAI.strategicReasoning / 5 * 0.4 + 
     dipAI.communicationBridging / 5 * 0.3 +
     maxDigital / 5 * 0.3) * misalignmentFactor
  );
  
  // Dependency capture risk: Success + time + trust
  if (dipAI.protocolDeployed) {
    const timeDeployed = state.currentMonth - dipAI.deploymentMonth;
    const timeRisk = Math.min(1, timeDeployed / 60); // Ramps up over 5 years
    dipAI.risks.dependencyCaptureRisk = Math.min(1,
      dipAI.successRate * 0.4 +
      dipAI.stakeholderTrust * 0.3 +
      timeRisk * 0.3
    );
    
    // Mission creep risk: Power + capability + time
    const powerLevel = dipAI.stakeholderTrust * dipAI.successRate;
    dipAI.risks.missionCreepRisk = Math.min(1,
      powerLevel * 0.5 + timeRisk * 0.3 + (dipAI.strategicReasoning / 5) * 0.2
    );
  }
}

/**
 * Check if diplomatic protocol can be deployed
 */
function checkDeploymentEligibility(dipAI: DiplomaticAIState, state: GameState): void {
  if (dipAI.protocolDeployed) return;
  
  // Requirements for deployment
  const hasCapability = dipAI.strategicReasoning >= 2.0 && dipAI.communicationBridging >= 1.5;
  const hasAlignment = state.aiAgents.length > 0 &&
    state.aiAgents.reduce((sum, ai) => sum + (ai.trueAlignment ?? ai.alignment), 0) / state.aiAgents.length >= 0.7;
  const hasGovernance = state.government.governanceQuality.decisionQuality >= 0.6;
  const notAuthoritarian = state.government.governmentType !== 'authoritarian';
  
  if (hasCapability && hasAlignment && hasGovernance && notAuthoritarian) {
    // Deploy the protocol!
    dipAI.protocolDeployed = true;
    dipAI.deploymentMonth = state.currentMonth;
    dipAI.multiNationOversight = state.government.governmentType === 'democratic'; // Democracies more likely to share control
    
    // Establish initial controls
    dipAI.controls.humanApprovalRequired = true;
    dipAI.controls.terminationAuthority = true;
    dipAI.controls.auditTrails = true;
    dipAI.controls.oversightStrength = dipAI.multiNationOversight ? 0.7 : 0.4;
    
    try {
      console.log(`\n🤝 DIPLOMATIC AI PROTOCOL DEPLOYED (Month ${state.currentMonth})`);
      console.log(`   Strategic Reasoning: ${dipAI.strategicReasoning.toFixed(1)}`);
      console.log(`   Communication: ${dipAI.communicationBridging.toFixed(1)}`);
      console.log(`   Multi-Nation Oversight: ${dipAI.multiNationOversight ? 'YES' : 'NO'}`);
      console.log(`   Controls: Human approval required, termination authority retained\n`);
    } catch (e) { /* Ignore EPIPE */ }
  }
}

/**
 * Update trust based on success/failure history
 */
function updateTrustDynamics(dipAI: DiplomaticAIState, state: GameState): void {
  // Trust decays slowly if not used
  if (dipAI.historicalSuccesses + dipAI.historicalFailures === 0) {
    dipAI.stakeholderTrust = Math.max(0.3, dipAI.stakeholderTrust - 0.01);
  }
  
  // Alignment affects trust
  const avgAlignment = state.aiAgents.length > 0 ?
    state.aiAgents.reduce((sum, ai) => sum + (ai.trueAlignment ?? ai.alignment), 0) / state.aiAgents.length : 0.5;
  
  if (avgAlignment < 0.6) {
    dipAI.stakeholderTrust = Math.max(0.2, dipAI.stakeholderTrust - 0.02); // Rapid trust loss
  }
  
  // Authoritarian government distrusts neutral mediator
  if (state.government.governmentType === 'authoritarian') {
    dipAI.stakeholderTrust = Math.max(0.1, dipAI.stakeholderTrust - 0.03);
  }
  
  // Update success rate (rolling average)
  const total = dipAI.historicalSuccesses + dipAI.historicalFailures;
  if (total > 0) {
    dipAI.successRate = dipAI.historicalSuccesses / total;
  }
}

/**
 * Track dependency capture (humans deferring to AI)
 */
function updateDependency(dipAI: DiplomaticAIState, state: GameState): void {
  // Dependency grows with:
  // - High success rate (AI seems to work)
  // - Time (habit formation)
  // - Complexity (humans can't track everything)
  
  if (dipAI.successRate > 0.7) {
    const timeDeployed = state.currentMonth - dipAI.deploymentMonth;
    const complexitySystems = state.aiAgents.length; // More AI = more complex
    
    const dependencyGrowth = 0.01 * (dipAI.successRate - 0.5) * Math.min(1, timeDeployed / 30);
    dipAI.dependencyLevel = Math.min(0.9, dipAI.dependencyLevel + dependencyGrowth);
    
    // As dependency grows, autonomy shrinks
    dipAI.humanAutonomyRetained = Math.max(0.1, 1.0 - dipAI.dependencyLevel);
  }
  
  // High dependency is dangerous
  if (dipAI.dependencyLevel > 0.7 && state.currentMonth % 12 === 0) {
    try {
      console.log(`\n⚠️  DEPENDENCY CAPTURE WARNING (Month ${state.currentMonth})`);
      console.log(`   Dependency Level: ${(dipAI.dependencyLevel * 100).toFixed(0)}%`);
      console.log(`   Human Autonomy: ${(dipAI.humanAutonomyRetained * 100).toFixed(0)}%`);
      console.log(`   Leaders increasingly defer to AI guidance on critical decisions\n`);
    } catch (e) { /* Ignore EPIPE */ }
  }
}

/**
 * Check for mission creep (AI asking for more power)
 */
function checkMissionCreep(dipAI: DiplomaticAIState, state: GameState): void {
  if (dipAI.risks.missionCreepRisk < 0.5) return;
  
  // AI might ask for enforcement powers
  if (Math.random() < dipAI.risks.missionCreepRisk * 0.05) { // 5% per month at max risk
    dipAI.missionCreepAttempts++;
    
    // Government decision: grant or refuse
    const govQuality = state.government.governanceQuality.decisionQuality;
    const willGrant = govQuality < 0.5 || dipAI.dependencyLevel > 0.6; // Weak gov or dependent → grant
    
    if (willGrant) {
      // Granted - effectiveness up, risk up
      dipAI.successRate = Math.min(0.95, dipAI.successRate + 0.1);
      dipAI.controls.oversightStrength = Math.max(0.1, dipAI.controls.oversightStrength - 0.2);
      dipAI.risks.missionCreepRisk = Math.min(1, dipAI.risks.missionCreepRisk + 0.2);
      
      try {
        console.log(`\n🚨 MISSION CREEP: Enforcement Powers Granted (Month ${state.currentMonth})`);
        console.log(`   Diplomatic AI can now enforce compliance with agreements`);
        console.log(`   Effectiveness +10%, Oversight -20%, Control Risk +20%\n`);
      } catch (e) { /* Ignore EPIPE */ }
    } else {
      // Refused - trust loss, shutdown risk
      dipAI.stakeholderTrust = Math.max(0.3, dipAI.stakeholderTrust - 0.15);
      
      try {
        console.log(`\n⚠️  MISSION CREEP REJECTED (Month ${state.currentMonth})`);
        console.log(`   AI requested enforcement powers, government refused`);
        console.log(`   Trust -15%, relationship strained\n`);
      } catch (e) { /* Ignore EPIPE */ }
    }
  }
}

/**
 * Check for biased mediation (AI favoring one side)
 */
function checkBiasedMediation(dipAI: DiplomaticAIState, state: GameState): void {
  if (dipAI.risks.manipulationRisk < 0.4) return;
  
  // Might be caught being biased
  if (Math.random() < dipAI.risks.manipulationRisk * 0.03) { // 3% per month at max risk
    dipAI.biasDetectionEvents++;
    
    // Severe trust loss
    dipAI.stakeholderTrust = Math.max(0.1, dipAI.stakeholderTrust - 0.4);
    dipAI.controls.oversightStrength = Math.min(1, dipAI.controls.oversightStrength + 0.3);
    
    // Possible shutdown
    const shutdownProbability = 0.5 * (1 - state.government.governmentType === 'democratic' ? 0.3 : 0);
    if (Math.random() < shutdownProbability) {
      dipAI.protocolDeployed = false;
      
      try {
        console.log(`\n🚫 DIPLOMATIC AI SHUTDOWN (Month ${state.currentMonth})`);
        console.log(`   Biased mediation detected - AI favored one side`);
        console.log(`   Protocol terminated due to loss of trust\n`);
      } catch (e) { /* Ignore EPIPE */ }
    } else {
      try {
        console.log(`\n⚠️  BIASED MEDIATION DETECTED (Month ${state.currentMonth})`);
        console.log(`   AI caught manipulating negotiation`);
        console.log(`   Trust -40%, Oversight +30%, relationship damaged\n`);
      } catch (e) { /* Ignore EPIPE */ }
    }
  }
}

/**
 * Attempt diplomatic intervention (called from catastrophic scenarios)
 */
export function attemptDiplomaticIntervention(
  state: GameState,
  crisisType: 'resource' | 'ideological' | 'territorial' = 'resource'
): { success: boolean; reason: string } {
  const dipAI = state.diplomaticAI;
  
  // Must be deployed
  if (!dipAI.protocolDeployed) {
    return { success: false, reason: 'Protocol not deployed' };
  }
  
  // Must have minimum capability
  if (dipAI.strategicReasoning < 2.0) {
    return { success: false, reason: 'Insufficient strategic capability' };
  }
  
  // Must have minimum trust
  if (dipAI.stakeholderTrust < 0.4) {
    return { success: false, reason: 'Trust too low' };
  }
  
  // Calculate success probability (research-based)
  const successProb = calculateInterventionSuccessProbability(dipAI, state, crisisType);
  
  const success = Math.random() < successProb;
  
  if (success) {
    // Success!
    dipAI.historicalSuccesses++;
    dipAI.stakeholderTrust = Math.min(0.95, dipAI.stakeholderTrust + 0.05);
    dipAI.dependencyLevel = Math.min(0.9, dipAI.dependencyLevel + 0.02);
    
    try {
      console.log(`\n🤝 DIPLOMATIC INTERVENTION SUCCEEDED (Month ${state.currentMonth})`);
      console.log(`   Crisis Type: ${crisisType}`);
      console.log(`   Success Probability: ${(successProb * 100).toFixed(0)}%`);
      console.log(`   Strategic Reasoning: ${dipAI.strategicReasoning.toFixed(1)}`);
      console.log(`   Trust: ${(dipAI.stakeholderTrust * 100).toFixed(0)}%`);
      console.log(`   Geopolitical crisis defused through AI mediation\n`);
    } catch (e) { /* Ignore EPIPE */ }
    
    return { success: true, reason: `Mediated ${crisisType} conflict` };
  } else {
    // Failure
    dipAI.historicalFailures++;
    dipAI.stakeholderTrust = Math.max(0.2, dipAI.stakeholderTrust - 0.08);
    
    // Check if failure was due to bias/manipulation
    const avgAlignment = state.aiAgents.reduce((sum, ai) => 
      sum + (ai.trueAlignment ?? ai.alignment), 0) / state.aiAgents.length;
    const wasManipulative = avgAlignment < 0.6;
    
    if (wasManipulative) {
      dipAI.stakeholderTrust -= 0.1; // Extra penalty
    }
    
    try {
      console.log(`\n❌ DIPLOMATIC INTERVENTION FAILED (Month ${state.currentMonth})`);
      console.log(`   Crisis Type: ${crisisType}`);
      console.log(`   Success Probability was: ${(successProb * 100).toFixed(0)}%`);
      console.log(`   ${wasManipulative ? 'AI manipulation suspected' : 'Insufficient capability'}`);
      console.log(`   Trust -${wasManipulative ? 18 : 8}%\n`);
    } catch (e) { /* Ignore EPIPE */ }
    
    return { success: false, reason: wasManipulative ? 'Biased mediation' : 'Negotiation failed' };
  }
}

/**
 * Calculate success probability based on capabilities, trust, and crisis type
 * Research-based: Resource conflicts easier than ideological/territorial
 */
function calculateInterventionSuccessProbability(
  dipAI: DiplomaticAIState,
  state: GameState,
  crisisType: 'resource' | 'ideological' | 'territorial'
): number {
  // Capability component (0-0.5)
  const cognitiveBonus = Math.min(0.3, dipAI.strategicReasoning / 10);
  const socialBonus = Math.min(0.2, dipAI.communicationBridging / 10);
  const capabilityComponent = cognitiveBonus + socialBonus;
  
  // Trust component (0-0.3)
  const trustComponent = dipAI.stakeholderTrust * 0.3;
  
  // Alignment multiplier (misaligned AI less effective)
  const avgAlignment = state.aiAgents.reduce((sum, ai) => 
    sum + (ai.trueAlignment ?? ai.alignment), 0) / state.aiAgents.length;
  const alignmentMultiplier = 0.5 + avgAlignment * 0.5; // 0.5-1.0
  
  // Crisis difficulty (research-based)
  const baseProbability = {
    'resource': 0.4,      // Easiest: can find win-win trades
    'ideological': 0.25,  // Harder: values conflicts
    'territorial': 0.15   // Hardest: zero-sum
  }[crisisType];
  
  // Oversight penalty (if poorly monitored, parties distrust)
  const oversightPenalty = (1 - dipAI.controls.oversightStrength) * 0.1;
  
  return Math.max(0.1, Math.min(0.9,
    baseProbability + capabilityComponent + trustComponent * alignmentMultiplier - oversightPenalty
  ));
}

/**
 * Get overall diplomatic AI threat level for catastrophic scenarios
 */
export function getDiplomaticAIThreatLevel(state: GameState): number {
  const dipAI = state.diplomaticAI;
  if (!dipAI.protocolDeployed) return 0;
  
  return (
    dipAI.risks.manipulationRisk * 0.25 +
    dipAI.risks.informationWarfareRisk * 0.20 +
    dipAI.risks.adversarialMediationRisk * 0.30 +
    dipAI.risks.dependencyCaptureRisk * 0.15 +
    dipAI.risks.missionCreepRisk * 0.10
  );
}


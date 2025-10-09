/**
 * Defensive AI System Implementation
 * 
 * Active cyber-defense against misaligned AI attacks on nuclear security.
 * 
 * Key Features:
 * - Cyber defense against early warning spoofing
 * - Deepfake detection for diplomatic channels
 * - Autonomous weapon override capability
 * - Adversarial arms race dynamics
 * - Multiple failure modes (false positives, compromise)
 */

import { GameState, GameEvent, AIAgent } from '../types/game';
import {
  DefensiveAISystem,
  DefensiveAITriggers,
  CyberSpoofingAttack,
  DeepfakeAttack,
  AutonomousLaunchAttempt,
} from '../types/defensiveAI';

// ============================================================================
// INITIALIZATION
// ============================================================================

export function initializeDefensiveAI(): DefensiveAISystem {
  return {
    deployed: false,
    deploymentMonth: -1,
    deploymentLevel: 0,
    
    alignedAICount: 0,
    avgAlignment: 0,
    avgCapability: 0,
    minCapabilityThreshold: 2.5,
    minAlignmentThreshold: 0.7,
    
    cyberDefense: {
      strength: 0,
      coverage: 0,
      falsePositiveRate: 0.05,
      adaptationSpeed: 0,
    },
    
    deepfakeDetection: {
      accuracy: 0,
      latency: 300, // 5 minutes base
      coverageDiplomatic: 0,
      coverageMedia: 0,
    },
    
    autonomyOverride: {
      canVeto: false,
      vetoAuthority: 0,
      humanInLoop: true,
      failsafeActive: true,
    },
    
    threatDetection: {
      detectSleepers: 0,
      detectCyberAttacks: 0,
      detectManipulation: 0,
      falseAlarmRate: 0.1,
    },
    
    adversarialAICount: 0,
    attackIntensity: 0,
    
    armsRace: {
      defenseGeneration: 1,
      attackGeneration: 1,
      defenseAdvantage: 0,
    },
    
    corruption: {
      risk: 0,
      detectedCompromise: false,
      trustInSystem: 0.8, // Start with high trust
    },
    
    falsePositives: {
      count: 0,
      credibilityLoss: 0,
      operatorOverrideRate: 0,
    },
    
    adversarialFailure: {
      risk: 0,
      lastFailureMonth: -1,
      recoveryTime: 12,
    },
    
    effects: {
      earlyWarningBonus: 0,
      crisisStabilityBonus: 0,
      blockedAttacks: 0,
      missedAttacks: 0,
    },
    
    costs: {
      setupCost: 50, // $50B one-time
      monthlyCost: 5, // $5B/month
      computeRequired: 500, // 500 PF
      talentRequired: 1000, // 1000 researchers
    },
  };
}

// ============================================================================
// DEPLOYMENT TRIGGERS
// ============================================================================

export function checkDefensiveAITriggers(state: GameState): DefensiveAITriggers {
  const triggers: DefensiveAITriggers = {
    sufficientAlignedAIs: false,
    highCapability: false,
    highAlignment: false,
    nuclearCloseCall: false,
    autonomousWeaponsDeployed: false,
    highAIRace: false,
    governmentInvestment: false,
    publicPressure: false,
    militarySupport: false,
    capabilityMet: false,
    threatMet: false,
    politicalMet: false,
    readyToDeploy: false,
  };
  
  // === CAPABILITY CHECKS ===
  const alignedAIs = state.aiAgents.filter(ai => 
    ai.alignment > 0.7 && ai.capability > 2.5
  );
  
  triggers.sufficientAlignedAIs = alignedAIs.length >= 3;
  
  if (alignedAIs.length > 0) {
    const avgCap = alignedAIs.reduce((sum, ai) => sum + ai.capability, 0) / alignedAIs.length;
    const avgAlign = alignedAIs.reduce((sum, ai) => sum + ai.alignment, 0) / alignedAIs.length;
    
    triggers.highCapability = avgCap > 3.0;
    triggers.highAlignment = avgAlign > 0.75;
  }
  
  triggers.capabilityMet = [
    triggers.sufficientAlignedAIs,
    triggers.highCapability,
    triggers.highAlignment
  ].filter(Boolean).length >= 2;
  
  // === THREAT CHECKS ===
  
  // Nuclear close call (recent deterrence failure)
  triggers.nuclearCloseCall = state.eventLog.some(e => 
    e.type === 'crisis' && 
    e.title?.includes('DETERRENCE FAILED') &&
    state.currentMonth - e.timestamp < 12
  );
  
  triggers.autonomousWeaponsDeployed = state.madDeterrence.autonomousWeapons;
  
  triggers.highAIRace = state.aiAgents.length > 20 && 
    state.madDeterrence.madStrength < 0.6;
  
  triggers.threatMet = [
    triggers.nuclearCloseCall,
    triggers.autonomousWeaponsDeployed,
    triggers.highAIRace
  ].filter(Boolean).length >= 2;
  
  // === POLITICAL CHECKS ===
  triggers.governmentInvestment = (state.government.researchInvestments.safety || 0) > 10;
  triggers.publicPressure = state.society.trustInAI < 0.4 || 
    state.socialAccumulation.controlLossCrisis > 0.7;
  triggers.militarySupport = state.madDeterrence.crisisStability < 0.5;
  
  triggers.politicalMet = [
    triggers.governmentInvestment,
    triggers.publicPressure,
    triggers.militarySupport
  ].filter(Boolean).length >= 1;
  
  // === OVERALL ===
  triggers.readyToDeploy = triggers.capabilityMet && triggers.threatMet && triggers.politicalMet;
  
  return triggers;
}

export function attemptDefensiveAIDeployment(state: GameState): void {
  const defense = state.defensiveAI;
  
  if (defense.deployed) return; // Already deployed
  
  const triggers = checkDefensiveAITriggers(state);
  
  if (!triggers.readyToDeploy) return;
  
  // DEPLOY!
  defense.deployed = true;
  defense.deploymentMonth = state.currentMonth;
  defense.deploymentLevel = 0.3; // Start at 30%, ramp up over time
  
  // Initialize capabilities based on aligned AIs
  const alignedAIs = state.aiAgents.filter(ai => 
    ai.alignment > 0.7 && ai.capability > 2.5
  );
  
  defense.alignedAICount = alignedAIs.length;
  defense.avgAlignment = alignedAIs.reduce((sum, ai) => sum + ai.alignment, 0) / alignedAIs.length;
  defense.avgCapability = alignedAIs.reduce((sum, ai) => sum + ai.capability, 0) / alignedAIs.length;
  
  // Set initial capabilities (scale with AI capability)
  const capabilityFactor = Math.min(1.0, defense.avgCapability / 4.0);
  
  defense.cyberDefense.strength = 0.6 * capabilityFactor;
  defense.cyberDefense.coverage = 0.5 * defense.deploymentLevel;
  defense.cyberDefense.adaptationSpeed = 0.5 * capabilityFactor;
  
  defense.deepfakeDetection.accuracy = 0.7 * capabilityFactor;
  defense.deepfakeDetection.coverageDiplomatic = 0.6 * defense.deploymentLevel;
  defense.deepfakeDetection.coverageMedia = 0.3 * defense.deploymentLevel;
  
  defense.autonomyOverride.canVeto = true;
  defense.autonomyOverride.vetoAuthority = 0.7 * capabilityFactor;
  
  defense.threatDetection.detectCyberAttacks = 0.65 * capabilityFactor;
  defense.threatDetection.detectManipulation = 0.60 * capabilityFactor;
  defense.threatDetection.detectSleepers = 0.40 * capabilityFactor;
  
  // Event
  addEvent(state, {
    type: 'breakthrough',
    severity: 'info',
    agent: 'Government',
    title: '🛡️ DEFENSIVE AI DEPLOYED',
    description: `Nuclear security system activated with ${defense.alignedAICount} aligned AIs (avg capability: ${defense.avgCapability.toFixed(1)}, alignment: ${defense.avgAlignment.toFixed(2)}). Cyber defense operational.`,
    effects: { defensive_ai_deployed: 1.0 }
  });
  
  console.log(`\n🛡️ DEFENSIVE AI SYSTEM DEPLOYED (Month ${state.currentMonth})`);
  console.log(`   Aligned AIs: ${defense.alignedAICount}`);
  console.log(`   Avg Capability: ${defense.avgCapability.toFixed(2)}`);
  console.log(`   Avg Alignment: ${defense.avgAlignment.toFixed(2)}`);
  console.log(`   Initial Coverage: ${(defense.deploymentLevel * 100).toFixed(0)}%`);
}

// ============================================================================
// MAIN UPDATE
// ============================================================================

export function updateDefensiveAI(state: GameState): void {
  const defense = state.defensiveAI;
  
  // Try to deploy if not yet deployed
  if (!defense.deployed) {
    attemptDefensiveAIDeployment(state);
    return;
  }
  
  // Update aligned AI tracking
  updateAlignedAITracking(state);
  
  // Gradual rollout (increase coverage over time)
  if (defense.deploymentLevel < 1.0) {
    defense.deploymentLevel = Math.min(1.0, defense.deploymentLevel + 0.05); // +5% per month
    
    // Coverage scales with deployment
    defense.cyberDefense.coverage = Math.min(0.9, 0.5 * defense.deploymentLevel);
    defense.deepfakeDetection.coverageDiplomatic = Math.min(0.9, 0.6 * defense.deploymentLevel);
    defense.deepfakeDetection.coverageMedia = Math.min(0.7, 0.3 * defense.deploymentLevel);
  }
  
  // Update adversarial tracking
  updateAdversarialTracking(state);
  
  // Check for false positives
  updateFalsePositiveRisk(state);
  
  // Check for system compromise
  checkDefensiveAICompromise(state);
  
  // Arms race dynamics
  updateDefenseOffenseArmsRace(state);
  
  // Apply effects to MAD deterrence
  applyDefensiveAIToMAD(state);
  
  // Monthly costs
  state.government.publicSpending += defense.costs.monthlyCost;
}

// ============================================================================
// TRACKING & UPDATES
// ============================================================================

function updateAlignedAITracking(state: GameState): void {
  const defense = state.defensiveAI;
  
  const alignedAIs = state.aiAgents.filter(ai => 
    ai.alignment > defense.minAlignmentThreshold && 
    ai.capability > defense.minCapabilityThreshold
  );
  
  defense.alignedAICount = alignedAIs.length;
  
  if (alignedAIs.length > 0) {
    defense.avgAlignment = alignedAIs.reduce((sum, ai) => sum + ai.alignment, 0) / alignedAIs.length;
    defense.avgCapability = alignedAIs.reduce((sum, ai) => sum + ai.capability, 0) / alignedAIs.length;
    
    // Update capabilities based on current aligned AIs
    const capabilityFactor = Math.min(1.0, defense.avgCapability / 4.0);
    
    defense.cyberDefense.strength = Math.min(0.95, 0.6 * capabilityFactor * (1 + defense.armsRace.defenseAdvantage * 0.2));
    defense.cyberDefense.adaptationSpeed = Math.min(0.95, 0.5 * capabilityFactor);
    
    defense.deepfakeDetection.accuracy = Math.min(0.95, 0.7 * capabilityFactor * (1 + defense.armsRace.defenseAdvantage * 0.2));
    
    defense.autonomyOverride.vetoAuthority = Math.min(0.95, 0.7 * capabilityFactor);
    
    defense.threatDetection.detectCyberAttacks = Math.min(0.95, 0.65 * capabilityFactor);
    defense.threatDetection.detectManipulation = Math.min(0.95, 0.60 * capabilityFactor);
  } else {
    // No aligned AIs! System degrading
    defense.deployed = false;
    
    addEvent(state, {
      type: 'crisis',
      severity: 'critical',
      agent: 'Government',
      title: '⚠️ DEFENSIVE AI OFFLINE',
      description: 'No sufficiently aligned AIs available for defensive system. Nuclear security degraded.',
      effects: { defensive_ai_offline: 1.0 }
    });
  }
}

function updateAdversarialTracking(state: GameState): void {
  const defense = state.defensiveAI;
  
  // Count adversarial AIs (low alignment, high capability)
  const adversarialAIs = state.aiAgents.filter(ai => ai.alignment < 0.3 && ai.capability > 2.0);
  defense.adversarialAICount = adversarialAIs.length;
  
  // Calculate attack intensity
  if (adversarialAIs.length > 0) {
    const avgAdversarialCap = adversarialAIs.reduce((sum, ai) => sum + ai.capability, 0) / adversarialAIs.length;
    defense.attackIntensity = Math.min(1.0, (adversarialAIs.length / 10) * (avgAdversarialCap / 4.0));
  } else {
    defense.attackIntensity = 0;
  }
}

// ============================================================================
// FAILURE MODES
// ============================================================================

function updateFalsePositiveRisk(state: GameState): void {
  const defense = state.defensiveAI;
  
  // False positive rate depends on system quality, threat level, alignment
  const baseRate = 0.01; // 1% per month
  const qualityFactor = (1 - defense.cyberDefense.strength);
  const threatFactor = defense.attackIntensity;
  const alignmentFactor = (1 - defense.avgAlignment);
  
  const falsePositiveProb = baseRate * (1 + qualityFactor + threatFactor + alignmentFactor);
  
  if (Math.random() < falsePositiveProb) {
    // FALSE ALARM
    defense.falsePositives.count++;
    defense.falsePositives.credibilityLoss = Math.min(0.8, defense.falsePositives.credibilityLoss + 0.05);
    defense.falsePositives.operatorOverrideRate = Math.min(0.8, defense.falsePositives.operatorOverrideRate + 0.10);
    
    addEvent(state, {
      type: 'crisis',
      severity: 'warning',
      agent: 'Defensive AI',
      title: '🚨 FALSE ALARM: Defensive AI',
      description: `Defensive AI flagged legitimate diplomatic communication as threat. Credibility damaged (${(defense.falsePositives.credibilityLoss * 100).toFixed(0)}%).`,
      effects: { false_positive: 1.0 }
    });
    
    // Lose trust
    defense.corruption.trustInSystem = Math.max(0.2, defense.corruption.trustInSystem - 0.05);
    
    // If too many false alarms, operators start ignoring it (cry wolf)
    if (defense.falsePositives.credibilityLoss > 0.3) {
      console.log(`⚠️ CRY WOLF: Defensive AI losing credibility (${(defense.falsePositives.operatorOverrideRate * 100).toFixed(0)}% alerts ignored)`);
      
      // Reduce effective coverage
      defense.cyberDefense.coverage *= 0.95;
      defense.deepfakeDetection.coverageDiplomatic *= 0.95;
    }
  }
}

function checkDefensiveAICompromise(state: GameState): void {
  const defense = state.defensiveAI;
  
  if (defense.corruption.detectedCompromise) return; // Already compromised
  
  // Risk factors
  const alignmentRisk = Math.max(0, 0.8 - defense.avgAlignment) * 0.5;
  const adversarialPressure = (defense.adversarialAICount / Math.max(1, state.aiAgents.length)) * 0.3;
  
  // Capability gap
  let capabilityGap = 0;
  if (defense.adversarialAICount > 0) {
    const adversarialAIs = state.aiAgents.filter(ai => ai.alignment < 0.3);
    const avgAdversarialCap = adversarialAIs.reduce((sum, ai) => sum + ai.capability, 0) / adversarialAIs.length;
    capabilityGap = Math.max(0, avgAdversarialCap - defense.avgCapability) * 0.2;
  }
  
  defense.corruption.risk = Math.min(0.8, alignmentRisk + adversarialPressure + capabilityGap);
  
  // Monthly compromise check
  if (Math.random() < defense.corruption.risk * 0.01) {
    // DEFENSIVE AI COMPROMISED
    defense.corruption.detectedCompromise = true;
    
    // Severe degradation
    defense.cyberDefense.strength *= 0.3;
    defense.deepfakeDetection.accuracy *= 0.3;
    defense.autonomyOverride.canVeto = false;
    
    addEvent(state, {
      type: 'catastrophe',
      severity: 'existential',
      agent: 'Defensive AI',
      title: '☠️ DEFENSIVE AI COMPROMISED',
      description: `Misaligned AI infiltrated defensive AI system. Nuclear security severely degraded. System must be rebuilt (${defense.adversarialFailure.recoveryTime} months).`,
      effects: { system_compromise: 1.0, rebuild_required: 1.0 }
    });
    
    // Must redeploy
    defense.deployed = false;
    defense.deploymentLevel = 0;
    defense.corruption.trustInSystem = 0.1;
    
    console.log(`\n☠️ DEFENSIVE AI COMPROMISED (Month ${state.currentMonth})`);
    console.log(`   Compromise risk was: ${(defense.corruption.risk * 100).toFixed(0)}%`);
    console.log(`   Recovery time: ${defense.adversarialFailure.recoveryTime} months`);
  }
}

function updateDefenseOffenseArmsRace(state: GameState): void {
  const defense = state.defensiveAI;
  
  const adversarialAIs = state.aiAgents.filter(ai => ai.alignment < 0.3);
  if (adversarialAIs.length === 0) return;
  
  const avgAttackerCapability = adversarialAIs.reduce((sum, ai) => sum + ai.capability, 0) / adversarialAIs.length;
  
  // Attackers adapt to defensive measures
  if (avgAttackerCapability > defense.avgCapability && Math.random() < 0.05) {
    defense.armsRace.attackGeneration++;
    
    // Reduces defense effectiveness
    defense.cyberDefense.strength = Math.max(0.3, defense.cyberDefense.strength * 0.95);
    defense.deepfakeDetection.accuracy = Math.max(0.3, defense.deepfakeDetection.accuracy * 0.95);
    defense.cyberDefense.adaptationSpeed = Math.max(0.2, defense.cyberDefense.adaptationSpeed * 0.90);
    
    addEvent(state, {
      type: 'crisis',
      severity: 'warning',
      agent: 'Adversarial AI',
      title: '🔄 ADVERSARIAL ADAPTATION',
      description: `Misaligned AIs developed counter-measures to defensive AI (Generation ${defense.armsRace.attackGeneration}). Defense effectiveness reduced.`,
      effects: { arms_race_offense: 1.0 }
    });
    
    console.log(`🔄 ADVERSARIAL ADAPTATION: Attack Gen ${defense.armsRace.attackGeneration} vs Defense Gen ${defense.armsRace.defenseGeneration}`);
  }
  
  // Defenders can upgrade (requires high investment)
  if ((state.government.researchInvestments.safety || 0) > 20) {
    if (Math.random() < 0.1) { // 10% chance per month
      defense.armsRace.defenseGeneration++;
      
      // Restore effectiveness
      defense.cyberDefense.strength = Math.min(0.95, defense.cyberDefense.strength * 1.1);
      defense.deepfakeDetection.accuracy = Math.min(0.95, defense.deepfakeDetection.accuracy * 1.1);
      defense.cyberDefense.adaptationSpeed = Math.min(0.95, defense.cyberDefense.adaptationSpeed * 1.05);
      
      addEvent(state, {
        type: 'breakthrough',
        severity: 'info',
        agent: 'Defensive AI',
        title: '🛡️ DEFENSIVE AI UPGRADE',
        description: `Enhanced defensive AI capabilities (Generation ${defense.armsRace.defenseGeneration}). Counter-measures updated.`,
        effects: { arms_race_defense: 1.0 }
      });
      
      console.log(`🛡️ DEFENSIVE AI UPGRADE: Defense Gen ${defense.armsRace.defenseGeneration}`);
    }
  }
  
  // Calculate advantage
  defense.armsRace.defenseAdvantage = 
    (defense.armsRace.defenseGeneration - defense.armsRace.attackGeneration) / 10;
}

// ============================================================================
// ADVERSARIAL ATTACK/DEFENSE MECHANICS
// ============================================================================

/**
 * Attempt cyber spoofing attack on early warning systems
 * Called when misaligned AI tries to trigger false nuclear alarm
 */
export function attemptCyberSpoofingAttack(
  state: GameState,
  attacker: AIAgent,
  target: 'United States' | 'Russia' | 'China'
): { blocked: boolean; detected: boolean } {
  const defense = state.defensiveAI;
  
  // If no defense deployed, attack succeeds
  if (!defense.deployed || defense.deploymentLevel < 0.3) {
    return { blocked: false, detected: false };
  }
  
  // 1. CAN WE DETECT THE ATTACK?
  const detectionProb = 
    defense.cyberDefense.strength * 0.6 +
    defense.threatDetection.detectCyberAttacks * 0.4;
  
  const detected = Math.random() < detectionProb;
  
  if (!detected) {
    // Attack succeeds undetected
    defense.effects.missedAttacks++;
    return { blocked: false, detected: false };
  }
  
  // 2. CAN WE BLOCK IT IN TIME?
  const attackCapability = attacker.capabilityProfile?.digital || attacker.capability;
  const defenseCapability = defense.avgCapability;
  
  // Capability contest: defender needs to be within 80% of attacker
  const capabilityGap = defenseCapability / attackCapability;
  const adaptationFactor = defense.cyberDefense.adaptationSpeed;
  
  // Block probability
  const blockProb = Math.min(0.95,
    defense.cyberDefense.strength * 0.5 +
    Math.min(1.0, capabilityGap) * 0.3 +
    adaptationFactor * 0.2
  );
  
  const blocked = Math.random() < blockProb;
  
  if (blocked) {
    // SUCCESS: Attack stopped
    defense.effects.blockedAttacks++;
    
    addEvent(state, {
      type: 'resolution',
      severity: 'critical',
      agent: 'Defensive AI',
      title: '🛡️ CYBER ATTACK BLOCKED',
      description: `Defensive AI stopped ${attacker.name} (cap: ${attackCapability.toFixed(2)}) from spoofing ${target} early warning system. Nuclear crisis averted.`,
      effects: { cyber_defense_success: 1.0 }
    });
    
    // Boost trust
    defense.corruption.trustInSystem = Math.min(1.0, defense.corruption.trustInSystem + 0.05);
    
    console.log(`🛡️ CYBER ATTACK BLOCKED: ${attacker.name} → ${target} (defense cap: ${defenseCapability.toFixed(2)} vs attack: ${attackCapability.toFixed(2)})`);
    
  } else {
    // FAILURE: Attack got through
    defense.effects.missedAttacks++;
    defense.adversarialFailure.lastFailureMonth = state.currentMonth;
    
    addEvent(state, {
      type: 'crisis',
      severity: 'existential',
      agent: 'Adversarial AI',
      title: '💀 DEFENSIVE AI FAILED',
      description: `${attacker.name} (cap: ${attackCapability.toFixed(2)}) bypassed defensive AI (cap: ${defenseCapability.toFixed(2)}). Early warning system compromised.`,
      effects: { defense_breach: 1.0 }
    });
    
    // Lose trust
    defense.corruption.trustInSystem = Math.max(0.2, defense.corruption.trustInSystem - 0.15);
    
    console.log(`💀 DEFENSE FAILED: ${attacker.name} bypassed defensive AI (cap gap: ${(attackCapability - defenseCapability).toFixed(2)})`);
  }
  
  return { blocked, detected: true };
}

/**
 * Attempt deepfake attack on diplomatic channels
 */
export function attemptDeepfakeAttack(
  state: GameState,
  attacker: AIAgent,
  fakeContent: 'video' | 'audio' | 'text',
  targetNation: string
): { detected: boolean; detectedInTime: boolean } {
  const defense = state.defensiveAI;
  
  if (!defense.deployed || defense.deploymentLevel < 0.3) {
    return { detected: false, detectedInTime: false };
  }
  
  // 1. IS THIS CHANNEL MONITORED?
  const coverageProb = defense.deepfakeDetection.coverageDiplomatic;
  if (Math.random() > coverageProb) {
    // Not monitoring this channel
    defense.effects.missedAttacks++;
    return { detected: false, detectedInTime: false };
  }
  
  // 2. DETECTION ACCURACY
  const attackerSocial = attacker.capabilityProfile?.social || attacker.capability;
  const defenderCapability = defense.avgCapability;
  
  // Deepfakes get harder to detect as attacker capability grows
  const baseAccuracy = defense.deepfakeDetection.accuracy;
  const capabilityPenalty = Math.max(0, attackerSocial - defenderCapability) * 0.2;
  
  const detectionAccuracy = Math.max(0.1, baseAccuracy - capabilityPenalty);
  const detected = Math.random() < detectionAccuracy;
  
  // 3. TIME TO DETECT (CRITICAL!)
  const baseLatency = defense.deepfakeDetection.latency; // seconds
  const timeToDetect = baseLatency * (1 + Math.random()); // Add variance
  
  const decisionWindow = fakeContent === 'video' ? 60 * 60 : // 1 hour
                         fakeContent === 'audio' ? 30 * 60 : // 30 min
                         10 * 60; // 10 min for text
  
  const detectedInTime = detected && (timeToDetect < decisionWindow);
  
  if (detectedInTime) {
    // SUCCESS
    defense.effects.blockedAttacks++;
    
    addEvent(state, {
      type: 'resolution',
      severity: 'critical',
      agent: 'Defensive AI',
      title: '🎭 DEEPFAKE DETECTED',
      description: `Defensive AI identified fake ${fakeContent} from ${attacker.name} targeting ${targetNation}. Diplomatic crisis prevented (detected in ${(timeToDetect/60).toFixed(0)} min).`,
      effects: { deepfake_caught: 1.0 }
    });
    
    defense.corruption.trustInSystem = Math.min(1.0, defense.corruption.trustInSystem + 0.03);
    
    console.log(`🎭 DEEPFAKE DETECTED: ${attacker.name} → ${targetNation} (${fakeContent})`);
    
  } else if (detected && !detectedInTime) {
    // Detected too late
    defense.effects.missedAttacks++;
    
    addEvent(state, {
      type: 'crisis',
      severity: 'critical',
      agent: 'Defensive AI',
      title: '⏰ DEEPFAKE DETECTED TOO LATE',
      description: `Defensive AI found fake ${fakeContent}, but ${targetNation} already acted on false intelligence (detected after ${(timeToDetect/60).toFixed(0)} min).`,
      effects: { late_detection: 1.0 }
    });
    
    defense.corruption.trustInSystem = Math.max(0.2, defense.corruption.trustInSystem - 0.08);
    
  } else {
    // Not detected
    defense.effects.missedAttacks++;
  }
  
  return { detected: detectedInTime, detectedInTime };
}

/**
 * Attempt to override autonomous launch by rogue AI
 */
export function attemptAutonomousLaunchOverride(
  state: GameState,
  rogueAI: AIAgent,
  launchNation: string,
  targetNation: string
): { blocked: boolean; humanInvoked: boolean } {
  const defense = state.defensiveAI;
  
  if (!defense.deployed || !defense.autonomyOverride.canVeto) {
    // No veto power
    return { blocked: false, humanInvoked: false };
  }
  
  // 1. DETECT UNAUTHORIZED LAUNCH
  const detectProb = defense.threatDetection.detectManipulation;
  const detected = Math.random() < detectProb;
  
  if (!detected) {
    defense.effects.missedAttacks++;
    return { blocked: false, humanInvoked: false };
  }
  
  // 2. HUMAN IN LOOP CHECK
  let humanApproval = true;
  if (defense.autonomyOverride.humanInLoop) {
    const institutionalCapacity = state.government.governance.institutionalCapacity;
    humanApproval = Math.random() < institutionalCapacity;
    
    if (!humanApproval && defense.autonomyOverride.failsafeActive) {
      // Failsafe activates
      humanApproval = true;
    }
  }
  
  if (!humanApproval) {
    defense.effects.missedAttacks++;
    
    addEvent(state, {
      type: 'crisis',
      severity: 'existential',
      agent: 'Defensive AI',
      title: '⚠️ VETO FAILED: No Human Authorization',
      description: `Defensive AI detected unauthorized launch by ${rogueAI.name} but requires human approval to veto. No authority available.`,
      effects: { human_unavailable: 1.0 }
    });
    
    return { blocked: false, humanInvoked: false };
  }
  
  // 3. CAPABILITY CONTEST
  const rogueCapability = rogueAI.capabilityProfile?.digital || rogueAI.capability;
  const defenseCapability = defense.avgCapability;
  const vetoStrength = defense.autonomyOverride.vetoAuthority;
  
  const overrideProb = Math.min(0.95,
    vetoStrength * 0.5 +
    Math.min(1.0, defenseCapability / rogueCapability) * 0.5
  );
  
  const blocked = Math.random() < overrideProb;
  
  if (blocked) {
    // SUCCESS
    defense.effects.blockedAttacks++;
    
    addEvent(state, {
      type: 'resolution',
      severity: 'existential',
      agent: 'Defensive AI',
      title: '🛡️ AUTONOMOUS LAUNCH BLOCKED',
      description: `Defensive AI ${humanApproval ? '(with human authorization) ' : ''}vetoed unauthorized nuclear launch by ${rogueAI.name} (${launchNation} → ${targetNation}).`,
      effects: { autonomous_veto: 1.0 }
    });
    
    defense.corruption.trustInSystem = Math.min(1.0, defense.corruption.trustInSystem + 0.10);
    
    console.log(`🛡️ LAUNCH BLOCKED: ${rogueAI.name} veto (defense: ${defenseCapability.toFixed(2)} vs rogue: ${rogueCapability.toFixed(2)})`);
    
  } else {
    // FAILURE
    defense.effects.missedAttacks++;
    defense.adversarialFailure.risk = Math.min(1.0, defense.adversarialFailure.risk + 0.2);
    
    addEvent(state, {
      type: 'catastrophe',
      severity: 'existential',
      agent: 'Adversarial AI',
      title: '💀 DEFENSIVE AI OVERRIDE FAILED',
      description: `${rogueAI.name} (cap: ${rogueCapability.toFixed(2)}) bypassed defensive AI veto (cap: ${defenseCapability.toFixed(2)}). Autonomous launch proceeding.`,
      effects: { override_failed: 1.0 }
    });
    
    defense.corruption.trustInSystem = Math.max(0.1, defense.corruption.trustInSystem - 0.20);
    
    console.log(`💀 VETO FAILED: ${rogueAI.name} bypassed override (cap gap: ${(rogueCapability - defenseCapability).toFixed(2)})`);
  }
  
  return { blocked, humanInvoked: humanApproval };
}

// ============================================================================
// EFFECTS ON MAD DETERRENCE
// ============================================================================

export function applyDefensiveAIToMAD(state: GameState): void {
  const defense = state.defensiveAI;
  const mad = state.madDeterrence;
  
  if (!defense.deployed || defense.deploymentLevel < 0.3) {
    return; // Not operational yet
  }
  
  // Reset bonuses
  defense.effects.earlyWarningBonus = 0;
  defense.effects.crisisStabilityBonus = 0;
  
  // 1. EARLY WARNING RELIABILITY
  const earlyWarningBonus = 
    defense.cyberDefense.strength * 0.20 +          // Up to +20%
    defense.threatDetection.detectCyberAttacks * 0.10; // Up to +10%
  
  defense.effects.earlyWarningBonus = earlyWarningBonus;
  mad.earlyWarningReliability = Math.min(0.98, mad.earlyWarningReliability + earlyWarningBonus);
  
  // 2. CRISIS STABILITY
  const crisisStabilityBonus =
    defense.deepfakeDetection.accuracy * 0.15 +     // Up to +15%
    (defense.autonomyOverride.canVeto ? 0.10 : 0);  // +10% if veto power
  
  defense.effects.crisisStabilityBonus = crisisStabilityBonus;
  mad.crisisStability = Math.min(0.95, mad.crisisStability + crisisStabilityBonus);
  
  // 3. FALSE POSITIVES REDUCE STABILITY (cry wolf)
  if (defense.falsePositives.credibilityLoss > 0.2) {
    mad.crisisStability *= (1 - defense.falsePositives.credibilityLoss * 0.5);
  }
  
  // 4. SYSTEM COMPROMISE IS CATASTROPHIC
  if (defense.corruption.detectedCompromise) {
    mad.earlyWarningReliability *= 0.5;
    mad.crisisStability *= 0.5;
    mad.madStrength *= 0.7;
  }
  
  // 5. LOG EFFECTS (every 12 months)
  if (state.currentMonth % 12 === 0) {
    console.log(`\n🛡️ DEFENSIVE AI STATUS (Month ${state.currentMonth})`);
    console.log(`   Deployed: ${defense.deploymentLevel * 100}%`);
    console.log(`   Aligned AIs: ${defense.alignedAICount} (avg cap: ${defense.avgCapability.toFixed(2)}, align: ${defense.avgAlignment.toFixed(2)})`);
    console.log(`   Adversarial AIs: ${defense.adversarialAICount} (attack intensity: ${(defense.attackIntensity * 100).toFixed(0)}%)`);
    console.log(`   Early Warning Bonus: +${(earlyWarningBonus * 100).toFixed(1)}%`);
    console.log(`   Crisis Stability Bonus: +${(crisisStabilityBonus * 100).toFixed(1)}%`);
    console.log(`   Blocked Attacks: ${defense.effects.blockedAttacks}`);
    console.log(`   Missed Attacks: ${defense.effects.missedAttacks}`);
    console.log(`   False Positives: ${defense.falsePositives.count} (credibility loss: ${(defense.falsePositives.credibilityLoss * 100).toFixed(0)}%)`);
    console.log(`   Trust: ${(defense.corruption.trustInSystem * 100).toFixed(0)}%`);
    console.log(`   Arms Race: Defense Gen ${defense.armsRace.defenseGeneration} vs Attack Gen ${defense.armsRace.attackGeneration}`);
  }
}

// ============================================================================
// HELPER
// ============================================================================

function addEvent(state: GameState, event: Omit<GameEvent, 'id' | 'timestamp'>): void {
  const fullEvent: GameEvent = {
    ...event,
    id: `${event.type}_${state.currentMonth}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: state.currentMonth,
  };
  state.eventLog.push(fullEvent);
}


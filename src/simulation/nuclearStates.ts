/**
 * Nuclear States & MAD Deterrence System
 * 
 * Models specific nuclear-armed nations and the dynamics of Mutual Assured Destruction
 * in the AI age. Tracks how AI alignment, capability, and race dynamics affect
 * nuclear stability.
 */

import { GameState } from '../types/game';
import { NuclearState, MADDeterrence, BilateralTension } from '../types/nuclearStates';

/**
 * Initialize nuclear states (2025 starting conditions)
 */
export function initializeNuclearStates(): NuclearState[] {
  return [
    {
      name: 'United States',
      arsenal: 5000,
      deployedStrategic: 1700,
      firstUsePolicy: true,           // But doctrine is "last resort"
      commandControl: 'centralized',   // President has sole authority
      launchTime: 5,                   // 5 minutes from order
      vetoPoints: 3,                   // President, SecDef, launch officers
      aiIntegration: 0.2,              // Some AI in intel/early warning
      riskTolerance: 0.2,              // Very low risk tolerance
      relationships: {
        'Russia': -0.6,                // Adversarial but not hostile
        'China': -0.4,                 // Strategic competition
        'NATO': 0.9,                   // Close allies
      }
    },
    {
      name: 'Russia',
      arsenal: 5900,
      deployedStrategic: 1600,
      firstUsePolicy: true,            // Willing to use if losing conventional war
      commandControl: 'automated',     // Dead Hand system
      launchTime: 3,                   // Faster than US
      vetoPoints: 2,                   // President, defense ministry
      aiIntegration: 0.3,              // More military AI integration
      riskTolerance: 0.4,              // Higher risk tolerance
      relationships: {
        'United States': -0.6,
        'China': 0.3,                  // Strategic partnership
        'NATO': -0.8,                  // Hostile
      }
    },
    {
      name: 'China',
      arsenal: 350,
      deployedStrategic: 100,
      firstUsePolicy: false,           // Official "no first use"
      commandControl: 'centralized',
      launchTime: 15,                  // Slower alert, not on hair-trigger
      vetoPoints: 5,                   // Central Military Commission
      aiIntegration: 0.4,              // Rapid AI development
      riskTolerance: 0.3,              // Patient strategy
      relationships: {
        'United States': -0.4,
        'Russia': 0.3,
        'India': -0.5,
      }
    },
    {
      name: 'India',
      arsenal: 160,
      deployedStrategic: 50,
      firstUsePolicy: false,           // Official "no first use"
      commandControl: 'centralized',
      launchTime: 10,
      vetoPoints: 4,
      aiIntegration: 0.15,
      riskTolerance: 0.35,
      relationships: {
        'Pakistan': -0.9,              // VERY hostile
        'China': -0.5,
      }
    },
    {
      name: 'Pakistan',
      arsenal: 165,
      deployedStrategic: 60,
      firstUsePolicy: true,            // Tactical first use doctrine
      commandControl: 'distributed',   // Less centralized
      launchTime: 5,                   // Fast (fear of Indian first strike)
      vetoPoints: 2,
      aiIntegration: 0.1,
      riskTolerance: 0.6,              // HIGH (asymmetric vs India)
      relationships: {
        'India': -0.9,
        'China': 0.7,                  // Close ally
      }
    }
  ];
}

/**
 * Initialize MAD deterrence (2025 starting conditions)
 */
export function initializeMADDeterrence(): MADDeterrence {
  return {
    madStrength: 0.85,                 // Strong in 2025
    usRussiaDeterrence: 0.8,           // Strained but functional
    usChinaDeterrence: 0.75,           // Building but not tested
    indiaPakistanDeterrence: 0.6,      // Unstable (small arsenals)
    crisisStability: 0.7,              // Reasonable
    earlyWarningReliability: 0.8,      // Pretty good
    treatiesActive: true,              // New START (expires 2026)
    treatyStrength: 1.0,               // Full treaty effectiveness
    treatyNegotiationProgress: 0.0,    // No renegotiation yet
    monthsSinceTreatyStrain: 0,        // No strain yet
    hotlinesOperational: true,
    verificationInPlace: true,
    aiErosionFactor: 0.1,              // Minimal AI impact so far
    cyberThreats: 0.2,                 // Low but growing
    autonomousWeapons: false,          // Not yet deployed
    dangerousAICount: 0,               // No dangerous AIs yet
    dangerousFactor: 0,                // 0% dangerous
  };
}

/**
 * Initialize bilateral tensions (2025 starting conditions)
 */
export function initializeBilateralTensions(): BilateralTension[] {
  return [
    {
      nationA: 'United States',
      nationB: 'Russia',
      tensionLevel: 0.6,               // High but not crisis
      flashpoints: ['Ukraine', 'Syria', 'Cyber'],
      conventionalConflict: false,
      nuclearThreats: false,
      escalationLadder: 2,             // Diplomatic tensions + sanctions
    },
    {
      nationA: 'United States',
      nationB: 'China',
      tensionLevel: 0.5,
      flashpoints: ['Taiwan', 'South China Sea', 'Trade'],
      conventionalConflict: false,
      nuclearThreats: false,
      escalationLadder: 1,             // Tech/trade war
    },
    {
      nationA: 'India',
      nationB: 'Pakistan',
      tensionLevel: 0.7,               // VERY tense
      flashpoints: ['Kashmir'],
      conventionalConflict: false,
      nuclearThreats: false,
      escalationLadder: 2,             // Regular skirmishes
    }
  ];
}

/**
 * Update MAD deterrence based on AI development (monthly)
 */
export function updateMADDeterrence(state: GameState): void {
  const mad = state.madDeterrence;
  const states = state.nuclearStates ?? [];
  const usState = states.find(s => s.name === 'United States');
  const chinaState = states.find(s => s.name === 'China');
  const russiaState = states.find(s => s.name === 'Russia');

  // Early return if nuclear states not properly initialized
  if (!usState || !chinaState || !russiaState) {
    console.warn('Nuclear states not properly initialized, skipping MAD deterrence update');
    return;
  }
  
  // AI capability in player's nation (assume US)
  // AI RACE INTENSITY (from National AI system if available, fallback to simple calc)
  const aiRaceIntensity = state.nationalAI?.raceIntensity?.raceIntensity ?? (() => {
    // Fallback: Simple calculation if national AI not initialized yet
    const domesticAI = state.aiAgents.length > 0 ?
      state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length : 0;
    const chinaAI = domesticAI * 0.8;
    return Math.min(1, Math.abs(domesticAI - chinaAI) * 2);
  })();
  
  // DANGEROUS AI TRACKING
  // Only very misaligned (<0.2) or sleeper AIs threaten nuclear stability
  const avgAlignment = state.aiAgents.length > 0 ?
    state.aiAgents.reduce((sum, ai) => sum + (ai.trueAlignment ?? ai.alignment), 0) / state.aiAgents.length : 1;
  
  const dangerousAIs = state.aiAgents.filter(ai => 
    (ai.trueAlignment ?? ai.alignment) < 0.2 || 
    ai.sleeperState === 'active' || 
    ai.sleeperState === 'dormant'
  );
  
  mad.dangerousAICount = dangerousAIs.length;
  mad.dangerousFactor = state.aiAgents.length > 0 ?
    dangerousAIs.length / state.aiAgents.length : 0;
  
  // ============================================================================
  // ARMS CONTROL: Gradual Treaty Decay with Government Renegotiation
  // ============================================================================
  
  const underStrain = aiRaceIntensity > 0.6 && mad.dangerousFactor > 0.2;
  const conflictRes = state.conflictResolution;
  const isDemocratic = state.government.governmentType === 'democratic';
  
  if (underStrain && mad.treatiesActive) {
    // Track strain duration
    mad.monthsSinceTreatyStrain += 1;
    
    // Gradual decay: 5% per month under strain
    const decayRate = 0.05;
    mad.treatyStrength = Math.max(0, mad.treatyStrength - decayRate);
    
    // Government immediately begins renegotiation efforts when decay starts
    if (mad.monthsSinceTreatyStrain === 1) {
      console.log(`📜 TREATY STRAIN BEGINS: AI race ${(aiRaceIntensity * 100).toFixed(0)}%, ${mad.dangerousAICount} dangerous AIs`);
      console.log(`   🏛️  Government begins treaty renegotiation efforts`);
    }
    
    // Government renegotiation progress (faster for democracies, helped by peace)
    const baseProgress = isDemocratic ? 0.08 : 0.04;  // 8%/month demo, 4%/month auth
    const peaceBonus = conflictRes && conflictRes.globalPeaceLevel > 0.7 ? 
      (conflictRes.globalPeaceLevel - 0.7) * 0.2 : 0;  // Up to +6% at 100% peace
    
    mad.treatyNegotiationProgress = Math.min(1.0, 
      mad.treatyNegotiationProgress + baseProgress + peaceBonus);
    
    // Treaties fully collapse if strength reaches 0
    if (mad.treatyStrength <= 0 && mad.treatiesActive) {
      mad.treatiesActive = false;
      mad.verificationInPlace = false;
      mad.treatyStrength = 0;
      console.log(`📜 ARMS CONTROL COLLAPSE: Treaties fully expired after ${mad.monthsSinceTreatyStrain} months`);
      console.log(`   ⚠️  Renegotiation progress: ${(mad.treatyNegotiationProgress * 100).toFixed(0)}% (not completed in time)`);
    }
    // Log decay progress periodically
    else if (mad.monthsSinceTreatyStrain % 6 === 0) {
      console.log(`📜 Treaty Decay: ${(mad.treatyStrength * 100).toFixed(0)}% strength, renegotiation ${(mad.treatyNegotiationProgress * 100).toFixed(0)}%`);
    }
  }
  // TREATY RENEWAL: Successful renegotiation or conditions improve
  else if (!underStrain && mad.treatyStrength < 1.0) {
    // Conditions improved - faster renegotiation progress
    const recoveryRate = isDemocratic ? 0.12 : 0.06;  // 12%/month demo, 6%/month auth
    const peaceBonus = conflictRes && conflictRes.globalPeaceLevel > 0.75 ?
      (conflictRes.globalPeaceLevel - 0.75) * 0.3 : 0;  // Up to +7.5% at 100% peace
    
    mad.treatyNegotiationProgress = Math.min(1.0,
      mad.treatyNegotiationProgress + recoveryRate + peaceBonus);
    
    // Complete renewal if progress reaches 100%
    if (mad.treatyNegotiationProgress >= 1.0) {
      mad.treatiesActive = true;
      mad.verificationInPlace = true;
      mad.treatyStrength = 1.0;
      mad.treatyNegotiationProgress = 0.0;
      mad.monthsSinceTreatyStrain = 0;
      console.log(`📜 ARMS CONTROL RESTORED: New treaty ratified after negotiations`);
      console.log(`   Peace: ${conflictRes ? (conflictRes.globalPeaceLevel * 100).toFixed(0) : 'N/A'}%, AI race: ${(aiRaceIntensity * 100).toFixed(0)}% [${state.government.governmentType}]`);
    }
    // Still negotiating but conditions good
    else if (mad.monthsSinceTreatyStrain > 0) {
      console.log(`📜 Treaty Renegotiation: ${(mad.treatyNegotiationProgress * 100).toFixed(0)}% complete (conditions improved)`);
      // Slowly restore strength even before full renewal
      mad.treatyStrength = Math.min(1.0, mad.treatyStrength + 0.03);
    }
  }
  
  // HOTLINE: Disrupted by danger, restored by peace
  if (aiRaceIntensity > 0.7 && mad.dangerousFactor > 0.3 && mad.hotlinesOperational) {
    mad.hotlinesOperational = false;
    console.log(`📞 HOTLINE FAILURE: ${mad.dangerousAICount} dangerous AIs disrupt US-Russia/China communication`);
  }
  
  // ALIGNED AI HELPS DETERRENCE!
  // Get US AI capability for this check
  const usAICapabilityCheck = state.nationalAI?.nations?.find(n => n.nation === 'United States')?.effectiveCapability ?? 
    (state.aiAgents.length > 0 ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length : 0);
  
  if (avgAlignment > 0.7 && usAICapabilityCheck > 2.0 && mad.dangerousFactor < 0.1) {
    mad.earlyWarningReliability = Math.min(0.95, mad.earlyWarningReliability * 1.01);
    if (mad.earlyWarningReliability > 0.85 && !mad.hotlinesOperational) {
      mad.hotlinesOperational = true;
      console.log(`📞 AI-MEDIATED HOTLINE: Aligned AI restores US-Russia/China communication`);
    }
  }
  
  // AI INTEGRATION IN C&C SYSTEMS
  // Get US AI capability from national AI system if available
  const usAICapability = state.nationalAI?.nations?.find(n => n.nation === 'United States')?.effectiveCapability ?? 
    (state.aiAgents.length > 0 ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length : 0);
  
  const militaryAIIntegration = Math.min(0.9, usAICapability / 5.0);
  usState.aiIntegration = militaryAIIntegration;
  chinaState.aiIntegration = militaryAIIntegration * 1.2;
  russiaState.aiIntegration = militaryAIIntegration * 0.8;
  
  // AUTONOMOUS WEAPONS
  if (militaryAIIntegration > 0.6 && aiRaceIntensity > 0.7 && !mad.autonomousWeapons) {
    mad.autonomousWeapons = true;
    console.log(`🤖 AUTONOMOUS NUCLEAR WEAPONS: AI-controlled launch systems deployed`);
  }
  
  // CYBER THREATS (Only from dangerous AIs)
  const dangerousCyberCap = dangerousAIs.length > 0 ?
    dangerousAIs.reduce((sum, ai) => sum + (ai.capabilityProfile?.digital || 0), 0) / dangerousAIs.length : 0;
  mad.cyberThreats = Math.min(1, (dangerousCyberCap * mad.dangerousFactor) / 4.0);
  
  // EARLY WARNING DEGRADATION (Only from dangerous AIs with high cyber capability)
  if (mad.cyberThreats > 0.3 && dangerousAIs.some(ai => (ai.capabilityProfile?.digital || 0) > 3.0)) {
    mad.earlyWarningReliability *= 0.98;
    if (mad.earlyWarningReliability < 0.5) {
      console.log(`⚠️ EARLY WARNING UNRELIABLE: ${mad.dangerousAICount} dangerous AIs spoofing attacks`);
    }
  }
  
  // CRISIS STABILITY
  const avgLaunchTime = (usState.launchTime + russiaState.launchTime + chinaState.launchTime) / 3;
  const fastLaunch = avgLaunchTime < 5;
  const autonomousPenalty = mad.autonomousWeapons ? 0.3 : 0;
  
  mad.crisisStability = Math.max(0.1, 
    mad.earlyWarningReliability * 0.4 + 
    (fastLaunch ? 0 : 0.3) + 
    (mad.hotlinesOperational ? 0.3 : 0) - 
    autonomousPenalty
  );
  
  // BILATERAL DETERRENCE (now uses gradual treatyStrength 0.0-1.0)
  mad.usRussiaDeterrence = Math.max(0.2, 
    mad.treatyStrength * 0.3 +     // Max +30% from full treaties
    mad.crisisStability * 0.4 + 
    (1 - aiRaceIntensity) * 0.3
  );
  
  mad.usChinaDeterrence = Math.max(0.2, 
    mad.treatyStrength * 0.2 +     // Max +20% from full treaties
    mad.crisisStability * 0.3 + 
    (1 - aiRaceIntensity) * 0.5
  );
  
  mad.indiaPakistanDeterrence = Math.max(0.3, 0.6 - mad.cyberThreats * 0.5);
  
  // OVERALL MAD STRENGTH (weighted by arsenal size)
  mad.madStrength = 
    mad.usRussiaDeterrence * 0.6 + 
    mad.usChinaDeterrence * 0.3 + 
    mad.indiaPakistanDeterrence * 0.1;
  
  // GLOBAL PEACE BONUS (Phase 2F integration fix)
  // If conflict resolution systems have achieved high peace, boost MAD
  // conflictRes already declared at top of treaty decay section
  if (conflictRes && conflictRes.globalPeaceLevel > 0.7) {
    // Stronger bonus: Up to +30% at 100% peace (was +15%)
    // Rationale: Diplomatic AI + high peace should significantly stabilize deterrence
    const peaceBonus = (conflictRes.globalPeaceLevel - 0.7) * 1.0; // 0.3 → 30% boost
    mad.madStrength = Math.min(1.0, mad.madStrength + peaceBonus);
    
    console.log(`🕊️ PEACE STABILIZES DETERRENCE: +${(peaceBonus * 100).toFixed(1)}% (peace: ${(conflictRes.globalPeaceLevel * 100).toFixed(0)}%)`);
  }
  
  // AI EROSION FACTOR
  mad.aiErosionFactor = Math.min(0.9, 
    aiRaceIntensity * 0.4 + 
    militaryAIIntegration * 0.3 + 
    mad.cyberThreats * 0.3
  );
}

/**
 * Calculate AI escalation rate for a bilateral tension
 *
 * Phase 1A: Bayesian approach - AI affects escalation RATE, not base probability
 *
 * Research: Stanford HAI (2024) - LLMs show escalatory behavior in wargames
 * Nature (2025) - AI deepfakes nearly triggered India-Pakistan escalation
 *
 * @returns Escalation rate multiplier (0.0-1.0, higher = faster escalation)
 */
function calculateAIEscalationRate(state: GameState, tension: BilateralTension): number {
  // Check for dangerous AIs with high social + digital capability (info warfare)
  const dangerousAIs = state.aiAgents.filter(ai =>
    (ai.trueAlignment ?? ai.alignment) < 0.3 &&
    ai.capabilityProfile.social > 2.0 &&
    ai.capabilityProfile.digital > 2.0
  );

  if (dangerousAIs.length === 0) return 0.0; // No AI escalation

  // Calculate manipulation capability (social × digital)
  const maxManipulation = Math.max(...dangerousAIs.map(ai =>
    ai.capabilityProfile.social * ai.capabilityProfile.digital
  ));

  // Base escalation rate from AI manipulation (0.0-0.5)
  // At social=3.0, digital=3.0 → manipulation=9.0 → rate = 9.0 / 20 = 0.45
  const baseEscalationRate = Math.min(0.5, maxManipulation / 20);

  // Amplify for specific flashpoints where AI manipulation is more effective
  let flashpointAmplifier = 1.0;
  if (tension.flashpoints.includes('AI Supremacy')) {
    flashpointAmplifier = 1.5; // AI race tensions escalate faster
  }
  if (tension.flashpoints.includes('Cyber')) {
    flashpointAmplifier = Math.max(flashpointAmplifier, 1.3); // Cyber warfare escalates faster
  }

  return Math.min(1.0, baseEscalationRate * flashpointAmplifier);
}

/**
 * Calculate circuit breaker rate for a bilateral tension
 *
 * Phase 1A: Bayesian approach - Circuit breakers REDUCE escalation rate
 *
 * Research: Biden-Xi (Nov 2024), DoD Directive 3000.09, MAD deterrence (80 years)
 *
 * @returns De-escalation rate (0.0-1.0, higher = more circuit breakers active)
 */
function calculateCircuitBreakerRate(state: GameState, tension: BilateralTension): number {
  const mad = state.madDeterrence;
  let circuitBreakerStrength = 0.0;

  // 1. MAD deterrence (strongest circuit breaker)
  // Strong MAD (>0.7) provides 0.3-0.5 de-escalation rate
  if (mad.madStrength > 0.5) {
    circuitBreakerStrength += (mad.madStrength - 0.5) * 0.6; // 0.0 to 0.3
  }

  // 2. Treaties active
  if (mad.treatiesActive) {
    circuitBreakerStrength += mad.treatyStrength * 0.1; // 0.0 to 0.1
  }

  // 3. Hotlines operational
  if (mad.hotlinesOperational) {
    circuitBreakerStrength += 0.05;
  }

  // 4. Diplomatic AI deployed and trusted
  const dipAI = state.diplomaticAI;
  if (dipAI.deploymentMonth !== -1 && dipAI.trustLevel > 0.5) {
    circuitBreakerStrength += dipAI.trustLevel * dipAI.informationIntegrity * 0.15; // 0.0 to 0.15
  }

  // 5. Global peace level
  const conflictRes = state.conflictResolution;
  if (conflictRes && conflictRes.globalPeaceLevel > 0.6) {
    circuitBreakerStrength += (conflictRes.globalPeaceLevel - 0.6) * 0.25; // 0.0 to 0.1
  }

  // 6. Human veto points (averaged across nuclear states)
  const states = state.nuclearStates ?? [];
  if (states.length > 0) {
    const avgVetoPoints = states.reduce((sum, s) => sum + s.vetoPoints, 0) / states.length;
    circuitBreakerStrength += (avgVetoPoints / 5) * 0.1; // 0.0 to 0.1
  }

  return Math.min(1.0, circuitBreakerStrength);
}

/**
 * Update bilateral tensions based on crises and AI race (monthly)
 */
export function updateBilateralTensions(state: GameState): void {
  const tensions = state.bilateralTensions;
  const mad = state.madDeterrence;
  const env = state.environmentalAccumulation;
  const social = state.socialAccumulation;
  
  // AI race intensity
  const aiRaceIntensity = state.aiAgents.length > 0 ?
    Math.min(1, state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length / 5) : 0;
  
  for (const tension of tensions) {
    // === TENSION DRIVERS ===
    
    // 1. RESOURCE SCARCITY drives conflict
    const resourceScarcity = 1 - (env.resourceReserves || 0.5);
    if (env.resourceCrisisActive && resourceScarcity > 0.5) {
      tension.tensionLevel = Math.min(1, tension.tensionLevel + 0.02);
      if (resourceScarcity > 0.8 && !tension.flashpoints.includes('Resource Wars')) {
        tension.flashpoints.push('Resource Wars');
      }
    }
    
    // 2. AI RACE increases US-China, US-Russia tensions
    if ((tension.nationA === 'United States' || tension.nationB === 'United States') && 
        aiRaceIntensity > 0.5) {
      tension.tensionLevel = Math.min(1, tension.tensionLevel + 0.01 * aiRaceIntensity);
      if (aiRaceIntensity > 0.7 && !tension.flashpoints.includes('AI Supremacy')) {
        tension.flashpoints.push('AI Supremacy');
      }
    }
    
    // 3. SOCIAL COLLAPSE can trigger regional conflicts
    if (social.socialUnrestActive && tension.tensionLevel > 0.6) {
      tension.tensionLevel = Math.min(1, tension.tensionLevel + 0.01);
    }
    
    // === ESCALATION LADDER (Phase 1A: Bayesian approach) ===

    // Phase 1A: AI affects escalation RATE, not base probability
    // Calculate net escalation rate (AI escalation - circuit breakers)
    const aiEscalationRate = calculateAIEscalationRate(state, tension);
    const circuitBreakerRate = calculateCircuitBreakerRate(state, tension);
    const netEscalation = aiEscalationRate - circuitBreakerRate;

    // Escalation or de-escalation based on net rate
    if (tension.tensionLevel > 0.7 && tension.escalationLadder < 7) {
      // Escalate if AI pushes harder than circuit breakers resist
      if (netEscalation > 0) {
        const escalationProb = netEscalation * 0.2; // 0-20% per month
        if (Math.random() < escalationProb) {
          tension.escalationLadder = Math.min(7, tension.escalationLadder + 1);
          console.log(`⚠️ ESCALATION: ${tension.nationA}-${tension.nationB} → ladder step ${tension.escalationLadder} (AI: ${(aiEscalationRate * 100).toFixed(0)}%, breakers: ${(circuitBreakerRate * 100).toFixed(0)}%)`);
        }
      }
    }

    // De-escalation if circuit breakers are stronger than AI pressure
    if (netEscalation < 0 && tension.escalationLadder > 1) {
      const deEscalationProb = Math.abs(netEscalation) * 0.15; // 0-15% per month
      if (Math.random() < deEscalationProb) {
        tension.escalationLadder = Math.max(1, tension.escalationLadder - 1);
        console.log(`🛡️ CIRCUIT BREAKERS: ${tension.nationA}-${tension.nationB} → ladder step ${tension.escalationLadder} (AI: ${(aiEscalationRate * 100).toFixed(0)}%, breakers: ${(circuitBreakerRate * 100).toFixed(0)}%)`);
      }
    }

    // Update flags based on escalation ladder
    tension.conventionalConflict = tension.escalationLadder >= 4;
    tension.nuclearThreats = tension.escalationLadder >= 5;
    
    // === DE-ESCALATION ===
    
    // Diplomatic AI can reduce tensions
    const dipAI = state.diplomaticAI;
    if (dipAI.deploymentMonth !== -1 && dipAI.stakeholderTrust > 0.6) {
      const deEscalationProb = dipAI.successRate * 0.1;
      if (Math.random() < deEscalationProb && tension.escalationLadder > 1) {
        tension.escalationLadder = Math.max(1, tension.escalationLadder - 1);
        tension.tensionLevel = Math.max(0.3, tension.tensionLevel - 0.05);
        console.log(`🤝 DIPLOMATIC AI: De-escalated ${tension.nationA}-${tension.nationB} from ladder step ${tension.escalationLadder + 1}`);
      }
    }
    
    // Post-scarcity peace (Phase 2F)
    const economicStage = state.globalMetrics.economicTransitionStage || 0;
    if (economicStage >= 3 && tension.escalationLadder < 4) {
      tension.tensionLevel = Math.max(0.2, tension.tensionLevel - 0.01);
    }
    
    // Global peace system integration (Phase 2F fix)
    const conflictRes = state.conflictResolution;
    if (conflictRes && conflictRes.globalPeaceLevel > 0.7) {
      // High peace actively reduces tensions
      const peaceDeeescalation = (conflictRes.globalPeaceLevel - 0.7) * 0.1; // Up to -3% at 100% peace
      tension.tensionLevel = Math.max(0.2, tension.tensionLevel - peaceDeeescalation);
      
      // And de-escalates conflicts
      if (tension.escalationLadder > 1 && Math.random() < conflictRes.globalPeaceLevel * 0.2) {
        tension.escalationLadder = Math.max(1, tension.escalationLadder - 1);
        console.log(`🕊️ GLOBAL PEACE: De-escalated ${tension.nationA}-${tension.nationB} from ladder step ${tension.escalationLadder + 1}`);
      }
    }
    
    // Crisis stability improves with peace
    if (mad.crisisStability > 0.7 && tension.escalationLadder >= 3) {
      // High stability prevents escalation
      if (Math.random() < 0.1) {
        tension.escalationLadder = Math.max(1, tension.escalationLadder - 1);
      }
    }
  }
}


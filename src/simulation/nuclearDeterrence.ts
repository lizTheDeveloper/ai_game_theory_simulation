/**
 * Nuclear Deterrence - Centralized MAD & Diplomatic AI Checks
 * 
 * PHASE 3: Abstracted nuclear war prevention logic
 * Used by: catastrophicScenarios.ts, extinctions.ts, aiAgent.ts
 * 
 * Research basis:
 * - Schelling (1960): Arms and Influence - MAD as rational deterrence
 * - Sagan (1993): The Limits of Safety - Organizational failures in nuclear command
 * - Fearon (1995): Rationalist explanations for war - Information & commitment problems
 */

import type { GameState } from '../types/game';

export interface DeterrenceCheckResult {
  allowed: boolean;
  reason: string;
  blockingFactor?: 'mad' | 'bilateral' | 'diplomatic_ai' | 'none';
}

/**
 * Centralized check for whether nuclear war should be allowed
 * 
 * Multi-layer defense:
 * 1. MAD Strength: Strong deterrence (>0.7) blocks escalation
 * 2. Bilateral Tensions: Need at least one high-tension flashpoint
 * 3. Diplomatic AI: Can detect and prevent manipulation
 * 
 * @param state - Current game state
 * @param context - Why nuclear war is being attempted (for logging)
 * @param random - Random function (injectable for testing)
 * @returns Object with allowed flag and reason
 */
export function checkNuclearDeterrence(
  state: GameState,
  context: string,
  random: () => number = Math.random
): DeterrenceCheckResult {
  
  // 1. MAD STRENGTH CHECK
  const mad = state.madDeterrence;
  if (mad.madStrength > 0.7) {
    console.log(`\n🛑 MAD DETERRENCE HOLDS (${context})`);
    console.log(`   Strength: ${(mad.madStrength * 100).toFixed(0)}%`);
    console.log(`   Nuclear war prevented by strong deterrence\n`);
    
    return {
      allowed: false,
      reason: `Strong MAD deterrence (${(mad.madStrength * 100).toFixed(0)}%) prevents nuclear escalation`,
      blockingFactor: 'mad'
    };
  }
  
  // 2. BILATERAL TENSION CHECK
  const tensions = state.bilateralTensions;
  const highTensionPairs = tensions.filter(t => t.tensionLevel > 0.7 || t.nuclearThreats);
  
  if (highTensionPairs.length === 0) {
    console.log(`\n🛑 NO NUCLEAR FLASHPOINTS (${context})`);
    console.log(`   International relations too stable for nuclear war`);
    console.log(`   Highest tension: ${Math.max(...tensions.map(t => t.tensionLevel), 0).toFixed(2)}\n`);
    
    return {
      allowed: false,
      reason: 'No bilateral flashpoints exist for nuclear escalation',
      blockingFactor: 'bilateral'
    };
  }
  
  // 3. DIPLOMATIC AI INTERVENTION CHECK
  const dipAI = state.diplomaticAI;
  if (dipAI.deploymentMonth !== -1 && dipAI.trustLevel > 0.6) {
    const detectionProb = dipAI.informationIntegrity * 0.7;
    
    if (random() < detectionProb) {
      console.log(`\n🤝 DIPLOMATIC AI INTERVENTION (${context})`);
      console.log(`   Detection probability: ${(detectionProb * 100).toFixed(0)}%`);
      console.log(`   AI-mediated diplomacy prevented escalation\n`);
      
      return {
        allowed: false,
        reason: 'Diplomatic AI detected and blocked nuclear escalation',
        blockingFactor: 'diplomatic_ai'
      };
    }
  }
  
  // ALL CHECKS PASSED - Nuclear war allowed
  console.log(`\n☢️ NUCLEAR DETERRENCE FAILED (${context})`);
  console.log(`   MAD strength: ${(mad.madStrength * 100).toFixed(0)}%`);
  console.log(`   Flashpoint pairs: ${highTensionPairs.length}`);
  console.log(`   Diplomatic AI: ${dipAI.deploymentMonth === -1 ? 'Not deployed' : 'Failed to prevent'}\n`);
  
  return {
    allowed: true,
    reason: `Nuclear war allowed: weak deterrence (${(mad.madStrength * 100).toFixed(0)}%), ${highTensionPairs.length} flashpoint(s)`,
    blockingFactor: 'none'
  };
}

/**
 * Get a human-readable description of why deterrence failed
 */
export function getDeterrenceFailureReason(state: GameState): string {
  const mad = state.madDeterrence;
  const tensions = state.bilateralTensions;
  const highTensionPairs = tensions.filter(t => t.tensionLevel > 0.7 || t.nuclearThreats);
  
  const reasons: string[] = [];
  
  if (mad.madStrength < 0.7) {
    reasons.push(`weak MAD deterrence (${(mad.madStrength * 100).toFixed(0)}%)`);
  }
  
  if (highTensionPairs.length > 0) {
    reasons.push(`${highTensionPairs.length} nuclear flashpoint(s): ${highTensionPairs.map(t => `${t.nationA}-${t.nationB}`).join(', ')}`);
  }
  
  if (!mad.treatiesActive) {
    reasons.push('arms control treaties expired');
  }
  
  if (!mad.hotlinesOperational) {
    reasons.push('communication hotlines down');
  }
  
  if (mad.cyberThreats > 0.5) {
    reasons.push(`high cyber threat to C&C (${(mad.cyberThreats * 100).toFixed(0)}%)`);
  }
  
  return reasons.join(', ');
}

/**
 * Log detailed deterrence state for debugging
 */
export function logDeterrenceState(state: GameState, prefix: string = ''): void {
  const mad = state.madDeterrence;
  const tensions = state.bilateralTensions;
  const dipAI = state.diplomaticAI;
  
  console.log(`\n${prefix}📊 DETERRENCE STATE:`);
  console.log(`${prefix}   MAD Strength: ${(mad.madStrength * 100).toFixed(0)}%`);
  console.log(`${prefix}   Treaties Active: ${mad.treatiesActive ? 'YES' : 'NO'}`);
  console.log(`${prefix}   Hotlines Operational: ${mad.hotlinesOperational ? 'YES' : 'NO'}`);
  console.log(`${prefix}   Early Warning Reliability: ${(mad.earlyWarningReliability * 100).toFixed(0)}%`);
  console.log(`${prefix}   Cyber Threats: ${(mad.cyberThreats * 100).toFixed(0)}%`);
  console.log(`${prefix}   Crisis Stability: ${(mad.crisisStability * 100).toFixed(0)}%`);
  
  console.log(`${prefix}\n   BILATERAL TENSIONS:`);
  for (const t of tensions) {
    const status = t.tensionLevel > 0.7 ? '⚠️ HIGH' : t.tensionLevel > 0.5 ? '⚡ ELEVATED' : '✅ STABLE';
    console.log(`${prefix}      ${t.nationA}-${t.nationB}: ${(t.tensionLevel * 100).toFixed(0)}% ${status}${t.nuclearThreats ? ' 💣 NUCLEAR THREATS' : ''}`);
  }
  
  console.log(`${prefix}\n   DIPLOMATIC AI:`);
  if (dipAI.deploymentMonth === -1) {
    console.log(`${prefix}      Status: NOT DEPLOYED`);
  } else {
    console.log(`${prefix}      Status: DEPLOYED (Month ${dipAI.deploymentMonth})`);
    console.log(`${prefix}      Trust Level: ${(dipAI.trustLevel * 100).toFixed(0)}%`);
    console.log(`${prefix}      Information Integrity: ${(dipAI.informationIntegrity * 100).toFixed(0)}%`);
    console.log(`${prefix}      Success Rate: ${(dipAI.successRate * 100).toFixed(0)}%`);
  }
  console.log();
}


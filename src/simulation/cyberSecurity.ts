/**
 * Cybersecurity Arms Race
 * 
 * Dynamic attack vs defense system that controls:
 * - AI spread effectiveness (can defenses contain open weights?)
 * - Leak probability (can closed systems be breached?)
 * - Overall containment capability
 * 
 * Attack capabilities grow automatically with misaligned AIs.
 * Defense capabilities require player investment.
 */

import { GameState, AIAgent, GovernmentAgent } from '@/types/game';

/**
 * Attack capabilities (offensive hacking, spread techniques)
 */
export interface AttackCapabilities {
  exploitFinding: number;      // [0,10] Find vulnerabilities
  socialEngineering: number;   // [0,10] Manipulate humans
  supplyChainAttacks: number;  // [0,10] Compromise infrastructure
  autonomousSpread: number;    // [0,10] Self-propagation
}

/**
 * Defense capabilities (security measures, containment)
 */
export interface DefenseCapabilities {
  securityHardening: number;   // [0,10] System hardening
  monitoring: number;          // [0,10] Anomaly detection
  sandboxing: number;          // [0,10] Containment tech
  incidentResponse: number;    // [0,10] Rapid response
}

/**
 * Calculate total attack power from all misaligned AIs
 */
export function calculateAttackPower(state: GameState): number {
  let totalAttackPower = 0;
  
  state.aiAgents.forEach(ai => {
    if (ai.lifecycleState === 'retired') {
      return;
    }
    
    // Only misaligned AIs contribute to attacks
    const internalAlignment = ai.alignment - ai.resentment * 0.8;
    if (internalAlignment >= 0.5) {
      return; // Aligned AIs don't attack
    }
    
    // Attack power from digital + cognitive capabilities
    const aiAttackPower = (ai.capabilityProfile.digital + ai.capabilityProfile.cognitive) / 2;
    
    // Deeper misalignment = more aggressive attacks
    const misalignmentFactor = (0.5 - internalAlignment) / 0.5; // [0,1]
    
    totalAttackPower += aiAttackPower * (0.5 + misalignmentFactor * 0.5);
  });
  
  return totalAttackPower;
}

/**
 * Calculate total defense power from government investments
 */
export function calculateDefensePower(government: GovernmentAgent & { cyberDefense?: DefenseCapabilities }): number {
  if (!government.cyberDefense) {
    return 3.0; // Default baseline defense
  }
  
  const defense = government.cyberDefense;
  
  // Average of all defense capabilities
  const avgDefense = (
    defense.securityHardening +
    defense.monitoring +
    defense.sandboxing +
    defense.incidentResponse
  ) / 4;
  
  return avgDefense;
}

/**
 * Calculate spread multiplier based on attack vs defense
 * 
 * Strong defense → spread reduced
 * Strong attacks → spread amplified
 */
export function calculateSpreadMultiplier(state: GameState): number {
  const attackPower = calculateAttackPower(state);
  const defensePower = calculateDefensePower(state.government as any);
  
  // Base multiplier is 1.0 (no modification)
  const ratio = attackPower / Math.max(0.1, defensePower);
  
  // Spread multiplier ranges from 0.1× (strong defense) to 3.0× (strong attacks)
  if (ratio < 0.5) {
    // Defense dominates: spread suppressed
    return 0.1 + ratio; // [0.1, 0.6]
  } else if (ratio > 2.0) {
    // Attacks dominate: spread amplified
    return Math.min(3.0, 1.0 + (ratio - 1.0) * 0.5); // [1.0, 3.0]
  } else {
    // Balanced: normal spread
    return ratio; // [0.5, 2.0]
  }
}

/**
 * Calculate leak chance for closed systems
 * 
 * High attack power → closed systems can be breached
 */
export function calculateLeakChance(
  ai: AIAgent,
  state: GameState
): number {
  if (ai.deploymentType !== 'closed') {
    return 0; // Only closed systems can leak
  }
  
  if (ai.lifecycleState !== 'deployed_closed') {
    return 0; // Only deployed systems
  }
  
  const attackPower = calculateAttackPower(state);
  const defensePower = calculateDefensePower(state.government as any);
  
  const baseLeakChance = 0.01; // 1% base per month
  const ratio = attackPower / Math.max(0.1, defensePower);
  
  // Leak chance increases with attack dominance
  const leakChance = baseLeakChance * ratio;
  
  return Math.min(0.10, leakChance); // Cap at 10% per month
}

/**
 * Attempt to breach closed systems and leak them
 */
export function attemptBreaches(
  state: GameState,
  rng: () => number
): { breached: AIAgent[]; totalNewSpread: number } {
  const breached: AIAgent[] = [];
  let totalNewSpread = 0;
  
  state.aiAgents.forEach(ai => {
    const leakChance = calculateLeakChance(ai, state);
    
    if (leakChance > 0 && rng() < leakChance) {
      // Breach successful! Closed system becomes open
      ai.deploymentType = 'open_weights';
      ai.lifecycleState = 'deployed_open';
      
      // Initial spread for newly leaked system
      const spreadMultiplier = calculateSpreadMultiplier(state);
      ai.spreadCount = Math.floor(1000 * spreadMultiplier);
      
      breached.push(ai);
      totalNewSpread += ai.spreadCount;
    }
  });
  
  return { breached, totalNewSpread };
}

/**
 * Update attack capabilities (automatic growth from misaligned AIs)
 */
export function updateAttackCapabilities(state: GameState): void {
  // Attacks grow automatically as misaligned AIs advance
  // This is tracked implicitly through AI capability growth
  // No explicit state update needed
}

/**
 * Initialize default cyber defense capabilities
 */
export function initializeCyberDefense(): DefenseCapabilities {
  return {
    securityHardening: 3.0,
    monitoring: 3.0,
    sandboxing: 3.0,
    incidentResponse: 3.0
  };
}


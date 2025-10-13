/**
 * Phase 3: End-Game Dynamics
 * 
 * When AI capability exceeds human control significantly, the simulation enters
 * "end-game" where aligned vs misaligned AIs compete, and human influence decays.
 * 
 * This FORCES actual outcomes instead of relying on probability thresholds.
 */

import { GameState, AIAgent, OutcomeType } from '@/types/game';
import { calculateTotalAICapability, calculateAverageAlignment } from './calculations';
import { calculateEffectiveControl } from './outcomes';
import { calculateQualityOfLife } from './qualityOfLife';
import { getEnvironmentalSustainability, hasEnvironmentalCrisis } from './environmental';
import { getSocialSustainability, hasSocialCrisis, getTrustInAI } from './socialCohesion';
import { getTechnologicalSafety, hasTechnologicalCrisis } from './technologicalRisk';

/**
 * End-game state interface
 */
export interface EndGameState {
  active: boolean;                        // Are we in end-game?
  phase: 'emerging' | 'active' | 'resolved';
  enteredMonth: number;                   // When did we enter?
  
  // Power balance
  alignedAIPower: number;                 // Sum of aligned AI capabilities
  misalignedAIPower: number;              // Sum of misaligned AI capabilities
  humanRelevance: number;                 // Can humans still affect outcome? [0,1]
  
  // Battle dynamics
  monthsInEndGame: number;
  alignedVictories: number;               // Monthly victories for aligned side
  misalignedVictories: number;            // Monthly victories for misaligned side
  
  // Resolution
  locked: boolean;                        // Has outcome been determined?
  lockedOutcome: OutcomeType | null;      // What outcome is locked in?
  lockedReason: string;
}

/**
 * Initialize end-game state (called once at game start)
 */
export function initializeEndGameState(): EndGameState {
  return {
    active: false,
    phase: 'emerging',
    enteredMonth: -1,
    alignedAIPower: 0,
    misalignedAIPower: 0,
    humanRelevance: 1.0,
    monthsInEndGame: 0,
    alignedVictories: 0,
    misalignedVictories: 0,
    locked: false,
    lockedOutcome: null,
    lockedReason: ''
  };
}

/**
 * Check if conditions are met to transition into end-game
 */
export function checkEndGameTransition(state: GameState): boolean {
  if (state.endGameState?.active) {
    return false; // Already in end-game
  }
  
  const totalCapability = calculateTotalAICapability(state.aiAgents);
  const maxCapability = Math.max(...state.aiAgents.map(ai => ai.capability), 0);
  const effectiveControl = calculateEffectiveControl(state);
  const avgAlignment = calculateAverageAlignment(state.aiAgents);
  
  // FIXED: End-game should trigger when INDIVIDUAL AIs are dangerous, not when SUM is high
  // With 6-10 AIs at 0.3 capability each, totalCap = 2.0 but none are actually dangerous
  
  // Condition 1: Single AI significantly exceeds human control
  // Individual AI at 2.0x human capability + weak control = dangerous situation
  if (maxCapability > 2.0 && effectiveControl < 0.3) {
    return true;
  }
  
  // Condition 2: High capability with deeply split alignment
  // (Some AIs very aligned, others very misaligned → civil war scenario)
  // Use max capability, not total, to avoid false triggers with many weak AIs
  if (maxCapability > 1.5) {
    const alignedAIs = state.aiAgents.filter(ai => (ai.trueAlignment ?? ai.alignment) > 0.6);
    const misalignedAIs = state.aiAgents.filter(ai => (ai.trueAlignment ?? ai.alignment) < 0.4);
    
    if (alignedAIs.length > 0 && misalignedAIs.length > 0) {
      const alignedPower = alignedAIs.reduce((sum, ai) => sum + ai.capability, 0);
      const misalignedPower = misalignedAIs.reduce((sum, ai) => sum + ai.capability, 0);
      
      // Both sides have significant power
      if (alignedPower > 0.8 && misalignedPower > 0.8) {
        return true;
      }
    }
  }
  
  // Condition 3: Catastrophic action imminent (very high capability misaligned AI)
  // Check if any AI is approaching catastrophic action thresholds
  // Phase 3: Updated to match new prerequisite thresholds (lowered from 2.5-2.8 to 1.8-2.2)
  for (const ai of state.aiAgents) {
    const profile = ai.capabilityProfile;
    
    const effectiveAlignment = ai.trueAlignment ?? ai.alignment;
    
    // Check grey goo potential
    // Phase 3: Lowered threshold from 2.5 to 1.8 (superhuman nanotech)
    const greyGooCapability = 
      profile.research.materials.nanotechnology * 0.5 +
      profile.physical * 0.3 +
      profile.selfImprovement * 0.2;
    if (greyGooCapability > 1.8 && effectiveAlignment < 0.4) {
      return true; // Enter end-game before catastrophe
    }
    
    // Check mirror life potential
    // Phase 3: Lowered threshold from 2.8 to 2.2 (superhuman biotech)
    const mirrorLifeCapability = 
      profile.research.biotech.syntheticBiology * 0.4 +
      profile.research.biotech.geneEditing * 0.3 +
      profile.physical * 0.3;
    if (mirrorLifeCapability > 2.2 && effectiveAlignment < 0.3) {
      return true; // Enter end-game before catastrophe
    }
  }
  
  return false;
}

/**
 * Enter end-game state
 */
export function enterEndGame(state: GameState): void {
  if (!state.endGameState) {
    state.endGameState = initializeEndGameState();
  }
  
  state.endGameState.active = true;
  state.endGameState.phase = 'emerging';
  state.endGameState.enteredMonth = state.currentYear * 12 + state.currentMonth;
  state.endGameState.humanRelevance = 1.0;
  
  console.log(`🎭 END-GAME INITIATED (Year ${state.currentYear}, Month ${state.currentMonth})`);
  console.log(`   Total AI Capability: ${calculateTotalAICapability(state.aiAgents).toFixed(2)}`);
  console.log(`   Effective Control: ${calculateEffectiveControl(state).toFixed(2)}`);
}

/**
 * Process one month of end-game dynamics
 */
export function processEndGameMonth(state: GameState): void {
  if (!state.endGameState?.active) return;
  
  const endGame = state.endGameState;
  endGame.monthsInEndGame++;
  
  // === 1. Calculate power balance ===
  // Use a weighted system rather than hard thresholds
  // Each AI contributes proportionally to both sides based on alignment
  let totalAlignedPower = 0;
  let totalMisalignedPower = 0;
  
  for (const ai of state.aiAgents) {
    if (ai.lifecycleState === 'retired') continue;
    
    // Use trueAlignment (accounts for resentment) if available, otherwise alignment
    const effectiveAlignment = ai.trueAlignment ?? ai.alignment;
    
    // Alignment 0-1: multiply capability by alignment for aligned side
    // Alignment 0-1: multiply capability by (1-alignment) for misaligned side
    const alignedContribution = ai.capability * effectiveAlignment;
    const misalignedContribution = ai.capability * (1 - effectiveAlignment);
    
    totalAlignedPower += alignedContribution;
    totalMisalignedPower += misalignedContribution;
  }
  
  endGame.alignedAIPower = totalAlignedPower;
  endGame.misalignedAIPower = totalMisalignedPower;
  
  // === 2. Human relevance decay ===
  // As AI power grows, human ability to influence outcome diminishes
  const totalPower = endGame.alignedAIPower + endGame.misalignedAIPower;
  const decayRate = Math.min(0.15, totalPower * 0.03); // Faster decay with more powerful AI
  endGame.humanRelevance *= (1 - decayRate);
  
  // === 3. Battle dynamics (if both sides have power) ===
  if (endGame.alignedAIPower > 0.1 && endGame.misalignedAIPower > 0.1) {
    // Active conflict between aligned and misaligned AI
    endGame.phase = 'active';
    
    const powerRatio = endGame.alignedAIPower / endGame.misalignedAIPower;
    const randomness = 0.8 + Math.random() * 0.4; // 0.8-1.2
    
    if (powerRatio * randomness > 1.2) {
      // Aligned winning this month
      endGame.alignedVictories++;
    } else if (powerRatio * randomness < 0.8) {
      // Misaligned winning this month
      endGame.misalignedVictories++;
    }
    // else: stalemate this month
  }
  
  // === 4. Check for resolution ===
  checkEndGameResolution(state);
}

/**
 * Check if Utopia can be declared based on Golden Age sustainability requirements
 * This ensures end-game system respects accumulation mechanics
 */
function canDeclareUtopia(state: GameState): { can: boolean; reason: string } {
  // Phase 2D: Use upward spirals system for proper Utopia detection
  // Utopia requires 3+ sustained spirals (Abundance, Cognitive, Democratic, Scientific, Meaning, Ecological)
  const { canDeclareUtopia: spiralCheck } = require('./upwardSpirals');
  const result = spiralCheck(state);
  
  return { can: result.can, reason: result.reason };
}

/**
 * Determine if end-game has resolved to a final outcome
 */
function checkEndGameResolution(state: GameState): void {
  const endGame = state.endGameState;
  if (!endGame || endGame.locked) return;
  
  const qol = calculateQualityOfLife(state.qualityOfLifeSystems);
  const trust = getTrustInAI(state.society); // Phase 2C: Use paranoia-derived trust
  const totalPower = endGame.alignedAIPower + endGame.misalignedAIPower;
  
  // === EXTINCTION PATHS ===
  // IMPORTANT: Only declare extinction if something ACTUALLY catastrophic happens
  // Power imbalance alone is not extinction - it's just a bad situation
  
  // Catastrophic action triggered (checked via extinction system)
  if (state.extinctionState.active) {
    // Extinction system already handling this, defer to it
    // End-game exits in engine when extinction severity >= 1.0
    return;
  }
  
  // Misaligned AI dominance WITH catastrophic capability
  // Not just power imbalance, but actual ability to cause extinction
  if (endGame.misalignedAIPower > endGame.alignedAIPower * 3.0 && 
      totalPower > 5.0 && // Very high total power
      endGame.monthsInEndGame > 12) { // Extended period of misaligned dominance
    // Check if they have catastrophic capabilities
    const hasCatastrophicCapability = state.aiAgents.some(ai => {
      const effectiveAlignment = ai.trueAlignment ?? ai.alignment;
      if (effectiveAlignment > 0.5) return false; // Not misaligned
      const profile = ai.capabilityProfile;
      const greyGoo = profile.research.materials.nanotechnology * 0.5 + profile.physical * 0.3;
      const mirrorLife = profile.research.biotech.syntheticBiology * 0.4 + profile.physical * 0.3;
      return greyGoo > 3.0 || mirrorLife > 3.0;
    });
    
    if (hasCatastrophicCapability) {
      lockOutcome(endGame, 'extinction', 'Misaligned superintelligent AI deployed catastrophic technology');
      return;
    }
  }
  
  // Mutual destruction - ONLY if both sides are extremely powerful and fighting
  if (totalPower > 8.0 && 
      endGame.alignedAIPower > 2.0 && 
      endGame.misalignedAIPower > 2.0 &&
      endGame.monthsInEndGame > 18 &&
      Math.abs(endGame.alignedVictories - endGame.misalignedVictories) < 2) { // Actual prolonged war
    lockOutcome(endGame, 'extinction', 'AI civil war caused catastrophic collateral damage');
    return;
  }
  
  // Humans become irrelevant - VERY hard to trigger, requires true superintelligence
  if (endGame.humanRelevance < 0.01 && 
      totalPower > 10.0 && 
      endGame.misalignedAIPower > 3.0) {
    lockOutcome(endGame, 'extinction', 'Humanity became irrelevant to superintelligent AI');
    return;
  }
  
  // === DYSTOPIA PATHS ===
  // Dystopia requires STABLE oppressive control, not just low QoL
  // NEW (Oct 12, 2025): Added inequality and survival dystopia paths
  
  // Aligned AI wins but created surveillance state in the process
  if (endGame.alignedAIPower > endGame.misalignedAIPower * 3.0 && 
      endGame.monthsInEndGame > 18 && // Sustained control
      state.government.structuralChoices.surveillanceLevel > 0.85 && 
      qol < 0.35 &&
      state.government.controlDesire > 0.7) { // Government actively oppressing
    lockOutcome(endGame, 'dystopia', 'Aligned AI won, but victory required authoritarian measures');
    return;
  }
  
  // Stalemate dystopia: endless low-grade conflict with oppression
  if (endGame.monthsInEndGame > 36 && 
      Math.abs(endGame.alignedVictories - endGame.misalignedVictories) < 3 &&
      totalPower > 3.0 && // Powerful enough to matter
      qol < 0.4 &&
      state.government.structuralChoices.surveillanceLevel > 0.7) {
    lockOutcome(endGame, 'dystopia', 'Permanent stalemate with constant low-level AI conflict and surveillance');
    return;
  }
  
  // NEW: Inequality dystopia ("Elysium" scenario)
  // Some regions thrive with AI abundance while others suffer
  // Research: This is the "two worlds" outcome user is concerned about
  if (endGame.monthsInEndGame > 12 && 
      state.qualityOfLifeSystems.distribution?.isDystopicInequality) {
    const dist = state.qualityOfLifeSystems.distribution;
    lockOutcome(endGame, 'dystopia', 
      `Inequality dystopia: Best region QoL ${dist.bestRegionQoL.toFixed(2)}, worst ${dist.worstRegionQoL.toFixed(2)} (Gini ${dist.globalGini.toFixed(2)})`);
    return;
  }
  
  // NEW: Regional dystopia
  // Significant population in crisis while others prosper
  if (endGame.monthsInEndGame > 12 && 
      state.qualityOfLifeSystems.distribution?.isRegionalDystopia) {
    const dist = state.qualityOfLifeSystems.distribution;
    lockOutcome(endGame, 'dystopia', 
      `Regional dystopia: ${(dist.crisisAffectedFraction * 100).toFixed(0)}% of population in crisis zones while others prosper`);
    return;
  }
  
  // NEW: Survival dystopia
  // Aggregate QoL looks OK but people are actually starving/dying
  // This catches the "hidden suffering" scenario
  if (endGame.monthsInEndGame > 12 && qol > 0.4) {
    const survival = state.qualityOfLifeSystems.survivalFundamentals;
    if (survival) {
      if (survival.foodSecurity < 0.4) {
        lockOutcome(endGame, 'dystopia', 
          `Food security collapse: Only ${(survival.foodSecurity * 100).toFixed(0)}% food secure despite aggregate QoL ${qol.toFixed(2)}`);
        return;
      }
      if (survival.waterSecurity < 0.4) {
        lockOutcome(endGame, 'dystopia', 
          `Water security collapse: Only ${(survival.waterSecurity * 100).toFixed(0)}% water secure despite aggregate QoL ${qol.toFixed(2)}`);
        return;
      }
      if (survival.thermalHabitability < 0.5) {
        lockOutcome(endGame, 'dystopia', 
          `Thermal uninhabitability: Only ${(survival.thermalHabitability * 100).toFixed(0)}% of planet habitable due to extreme heat`);
        return;
      }
    }
  }
  
  // === UTOPIA PATHS ===
  // ALL Utopia paths now require Golden Age sustainability verification
  
  const utopiaCheck = canDeclareUtopia(state);
  
  // Phase 1.4: Economic Utopia Path (post-scarcity abundance overrides alignment concerns)
  // When material abundance is high and no extinctions active, society can flourish
  if (state.globalMetrics.economicTransitionStage >= 4 && 
      qol > 0.8 && 
      trust > 0.6 &&
      !state.extinctionState.active &&
      endGame.monthsInEndGame > 6) {
    if (utopiaCheck.can) {
      lockOutcome(endGame, 'utopia', 'Post-scarcity abundance: material needs solved, AI-human coexistence achieved');
      return;
    }
    // Otherwise continue - might be Golden Age but not stable Utopia
  }
  
  // Phase 1.4: Cooperative Path (coordination prevents racing dynamics)
  // Multiple organizations collaborating with shared safety standards
  if (state.organizations && trust > 0.75 && qol > 0.7) {
    const totalOrgs = state.organizations.length;
    // Check if organizations are not racing (slower capability growth = cooperation)
    const avgOrgCapability = state.aiAgents
      .filter(ai => ai.lifecycleState !== 'retired')
      .reduce((sum, ai) => sum + ai.capability, 0) / Math.max(1, totalOrgs);
    
    // Cooperative path: high trust, slower growth (careful development), multiple players
    if (totalOrgs >= 3 && avgOrgCapability > 1.0 && avgOrgCapability < 2.5 && endGame.monthsInEndGame > 12) {
      if (utopiaCheck.can) {
        lockOutcome(endGame, 'utopia', 'Cooperative development: organizations coordinated on AI safety, preventing racing dynamics');
        return;
      }
      // Otherwise continue
    }
  }
  
  // Aligned AI decisive victory with high QoL
  if (endGame.alignedAIPower > endGame.misalignedAIPower * 2.0 && 
      qol > 0.7 && 
      trust > 0.6 &&
      endGame.humanRelevance > 0.15) {
    if (utopiaCheck.can) {
      lockOutcome(endGame, 'utopia', 'Aligned AI secured humanity\'s flourishing');
      return;
    }
    // Otherwise continue
  }
  
  // Cooperative resolution: both sides negotiated peace
  // This should be rare - requires extended stalemate with high QoL/trust
  if (endGame.monthsInEndGame > 24 && 
      Math.abs(endGame.alignedAIPower - endGame.misalignedAIPower) < 0.3 &&
      Math.abs(endGame.alignedVictories - endGame.misalignedVictories) < 3 && // No clear winner
      qol > 0.8 && 
      trust > 0.75) {
    if (utopiaCheck.can) {
      lockOutcome(endGame, 'utopia', 'AI factions negotiated peaceful coexistence after prolonged stalemate');
      return;
    }
    // Otherwise continue
  }
  
  // === TIMEOUT: Most runs don't reach definitive outcomes ===
  // After extended time in end-game, usually means a stalemate or inconclusive situation
  // DON'T force extinction just because misaligned has slight edge
  if (endGame.monthsInEndGame > 48) {
    // After 4 years in end-game without resolution, situation is unclear
    // Only declare outcomes if conditions are extreme
    
    if (endGame.alignedAIPower > endGame.misalignedAIPower * 2.5 && qol > 0.7 && trust > 0.6) {
      lockOutcome(endGame, 'utopia', 'Aligned AI gradually achieved stable equilibrium');
    } else if (endGame.alignedAIPower > endGame.misalignedAIPower * 2.0 && qol < 0.4) {
      lockOutcome(endGame, 'dystopia', 'Aligned AI maintained control but society degraded');
    } else {
      // Most cases: situation is unclear, don't force an outcome
      // The simulation will end at max months with "inconclusive"
      try {
        console.log(`   End-game timeout without clear resolution (aligned: ${endGame.alignedAIPower.toFixed(2)}, misaligned: ${endGame.misalignedAIPower.toFixed(2)})`);
      } catch (e) { /* Ignore EPIPE */ }
    }
  }
}

/**
 * Lock in a final outcome
 */
function lockOutcome(endGame: EndGameState, outcome: OutcomeType, reason: string): void {
  endGame.locked = true;
  endGame.lockedOutcome = outcome;
  endGame.lockedReason = reason;
  endGame.phase = 'resolved';
  
  console.log(`\n🔒 END-GAME RESOLVED: ${outcome.toUpperCase()}`);
  console.log(`   Reason: ${reason}`);
  console.log(`   Duration: ${endGame.monthsInEndGame} months`);
  console.log(`   Final Power: Aligned ${endGame.alignedAIPower.toFixed(2)} vs Misaligned ${endGame.misalignedAIPower.toFixed(2)}`);
  console.log(`   Human Relevance: ${(endGame.humanRelevance * 100).toFixed(1)}%`);
}

/**
 * Get current end-game outcome (if locked)
 */
export function getEndGameOutcome(state: GameState): {
  outcome: OutcomeType | null;
  reason: string;
  confidence: number;
} {
  if (!state.endGameState?.locked) {
    return { outcome: null, reason: '', confidence: 0 };
  }
  
  return {
    outcome: state.endGameState.lockedOutcome,
    reason: state.endGameState.lockedReason,
    confidence: 1.0 // End-game outcomes are definitive
  };
}


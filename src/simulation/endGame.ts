/**
 * Phase 3: End-Game Dynamics
 * 
 * When AI capability exceeds human control significantly, the simulation enters
 * "end-game" where aligned vs misaligned AIs compete, and human influence decays.
 * 
 * This FORCES actual outcomes instead of relying on probability thresholds.
 */

import { GameState, AIAgent, OutcomeType } from '@/types/game';
import { assertFinite, assertStateProperty } from './utils/assertions';
import { calculateTotalAICapability, calculateAverageAlignment } from './calculations';
import { calculateEffectiveControl } from './outcomes';
import { calculateQualityOfLife } from './qualityOfLife';
import { getEnvironmentalSustainability, hasEnvironmentalCrisis } from './environmental';
import { getSocialSustainability, hasSocialCrisis, getTrustInAI } from './socialCohesion';
import { getTechnologicalSafety, hasTechnologicalCrisis } from './technologicalRisk';
import { deterministicRandom } from '@/simulation/utils/deterministicRng';

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

  // FIX (Nov 12, 2025): Disable end-game for scenario runs
  // CRITICAL-1 regression: Phase 3 scenarios with immediate tech deployment
  // trigger end-game at month 0-1, then timeout after 48 months → ALL runs terminate at month 49
  // Scenarios are testing spiral dynamics, not end-game competition.
  // End-game should only activate in normal (non-scenario) gameplay.
  if (state.scenario) {
    return false; // Don't trigger end-game during scenario testing
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
    const alignedAIs = state.aiAgents.filter(ai => ai.trueAlignment > 0.6);
    const misalignedAIs = state.aiAgents.filter(ai => ai.trueAlignment < 0.4);
    
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

    // FIX (Oct 26, 2025): Removed defensive fallback - trueAlignment is required field
    const effectiveAlignment = ai.trueAlignment;

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

    // FIX (Oct 26, 2025): Removed defensive fallback - trueAlignment is required field
    // trueAlignment accounts for resentment (see alignmentDynamics.ts)
    const effectiveAlignment = ai.trueAlignment;

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
    const randomness = 0.8 + deterministicRandom() * 0.4; // 0.8-1.2
    
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
      // FIX (Oct 26, 2025): Removed defensive fallback - trueAlignment is required field
      const effectiveAlignment = ai.trueAlignment;
      if (effectiveAlignment > 0.5) return false; // Not misaligned
      const profile = ai.capabilityProfile;
      const greyGoo = profile.research.materials.nanotechnology * 0.5 + profile.physical * 0.3;
      const mirrorLife = profile.research.biotech.syntheticBiology * 0.4 + profile.physical * 0.3;
      return greyGoo > 3.0 || mirrorLife > 3.0;
    });
    
    if (hasCatastrophicCapability) {
      // CRITICAL-1 FIX (Nov 13, 2025): Check population before declaring extinction
      // Bug: Seeds 42001/42008/42024 showed GROWTH but were labeled extinction due to AI power metrics
      const currentPop = state.humanPopulationSystem.population;
      const initialPop = assertFinite(
        assertStateProperty(state, 'initialPopulation', {
          location: 'checkExtinctionPaths.hasCatastrophicCapability',
          month: state.currentMonth,
        }),
        {
          location: 'checkExtinctionPaths.hasCatastrophicCapability',
          valueName: 'initialPopulation',
          month: state.currentMonth,
        }
      );
      const mortality = 1 - (currentPop / initialPop);

      if (mortality < 0) {
        // Population GREW - cannot be extinction
        console.log(`   ⚠️ Catastrophic AI capability but population GROWING (${initialPop.toFixed(2)}B → ${currentPop.toFixed(2)}B)`);
        lockOutcome(endGame, 'dystopia', 'Misaligned superintelligent AI threatens humanity');
        return;
      }

      if (currentPop * 1e9 < 10_000) {
        // TRUE extinction - population below 10K threshold
        lockOutcome(endGame, 'extinction', 'Misaligned superintelligent AI deployed catastrophic technology');
      } else {
        // Catastrophic capability deployed but humanity survived in reduced numbers
        console.log(`   ⚠️ Misaligned AI deployed catastrophic tech but ${currentPop.toFixed(2)}B survived (${(mortality * 100).toFixed(1)}% mortality)`);
        lockOutcome(endGame, 'dystopia', `Misaligned AI deployed catastrophic tech, ${(mortality * 100).toFixed(1)}% mortality`);
      }
      return;
    }
  }
  
  // Mutual destruction - ONLY if both sides are extremely powerful and fighting
  // CRITICAL-1 FIX (Nov 13, 2025): Check population actually declined before declaring extinction
  // Bug: Seeds 42001/42008/42024 showed GROWTH but were labeled extinction due to AI power metrics
  if (totalPower > 8.0 &&
      endGame.alignedAIPower > 2.0 &&
      endGame.misalignedAIPower > 2.0 &&
      endGame.monthsInEndGame > 18 &&
      Math.abs(endGame.alignedVictories - endGame.misalignedVictories) < 2) { // Actual prolonged war

    // DEFENSIVE CHECK: Verify population has actually declined
    const currentPop = state.humanPopulationSystem.population;
    const initialPop = assertFinite(
      assertStateProperty(state, 'initialPopulation', {
        location: 'checkExtinctionPaths.mutualDestruction',
        month: state.currentMonth,
      }),
      {
        location: 'checkExtinctionPaths.mutualDestruction',
        valueName: 'initialPopulation',
        month: state.currentMonth,
      }
    );
    const mortality = 1 - (currentPop / initialPop);

    if (mortality < 0) {
      // Population GREW - cannot be extinction
      console.log(`   ⚠️ AI civil war detected but population GROWING (${initialPop.toFixed(2)}B → ${currentPop.toFixed(2)}B)`);
      console.log(`      Not declaring extinction - population trend inconsistent with catastrophic damage`);
      return;  // Don't lock extinction outcome
    }

    if (currentPop * 1e9 < 10_000) {
      // True extinction threshold met
      lockOutcome(endGame, 'extinction', 'AI civil war caused catastrophic collateral damage');
    } else {
      // High mortality but not extinction - classify as dystopia
      console.log(`   ⚠️ AI civil war with ${(mortality * 100).toFixed(1)}% mortality but ${currentPop.toFixed(2)}B survivors`);
      lockOutcome(endGame, 'dystopia', `AI civil war caused ${(mortality * 100).toFixed(1)}% mortality`);
    }
    return;
  }
  
  // Humans become irrelevant - VERY hard to trigger, requires true superintelligence
  // CRITICAL-1 FIX (Nov 13, 2025): Check population before declaring extinction
  if (endGame.humanRelevance < 0.01 &&
      totalPower > 10.0 &&
      endGame.misalignedAIPower > 3.0) {

    const currentPop = state.humanPopulationSystem.population;
    const initialPop = assertFinite(
      assertStateProperty(state, 'initialPopulation', {
        location: 'checkExtinctionPaths.humanIrrelevance',
        month: state.currentMonth,
      }),
      {
        location: 'checkExtinctionPaths.humanIrrelevance',
        valueName: 'initialPopulation',
        month: state.currentMonth,
      }
    );
    const mortality = 1 - (currentPop / initialPop);

    if (mortality < 0) {
      // Population GREW - cannot be extinction
      console.log(`   ⚠️ Human irrelevance but population GROWING (${initialPop.toFixed(2)}B → ${currentPop.toFixed(2)}B)`);
      lockOutcome(endGame, 'dystopia', 'Humanity became irrelevant to superintelligent AI');
      return;
    }

    if (currentPop * 1e9 < 10_000) {
      // TRUE extinction - population below 10K threshold
      lockOutcome(endGame, 'extinction', 'Humanity became irrelevant to superintelligent AI');
    } else {
      // Humans became irrelevant but still alive
      console.log(`   ⚠️ Human irrelevance with ${currentPop.toFixed(2)}B survivors (${(mortality * 100).toFixed(1)}% mortality)`);
      lockOutcome(endGame, 'dystopia', 'Humanity became irrelevant to superintelligent AI');
    }
    return;
  }

  // === DYSTOPIA PATHS ===
  // DISABLED (Oct 25, 2025): Dystopia early-stop disabled to allow full 240-month runs

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
  
  // === TIMEOUT: Force resolution after extended end-game ===
  // TIER 0A FIX: After 48 months, FORCE a resolution based on power balance and QoL
  // OLD BUG: Most runs fell through without setting actualOutcome, leading to inconclusive
  if (endGame.monthsInEndGame > 48) {
    // After 4 years, determine outcome based on current state

    if (endGame.alignedAIPower > endGame.misalignedAIPower * 2.5 && qol > 0.7 && trust > 0.6) {
      // Clear aligned victory with good QoL
      lockOutcome(endGame, 'utopia', 'Aligned AI gradually achieved stable equilibrium');
    } else if (endGame.alignedAIPower > endGame.misalignedAIPower * 2.0 && qol < 0.4) {
      // Aligned won but QoL poor
      lockOutcome(endGame, 'dystopia', 'Aligned AI maintained control but society degraded');
    } else if (endGame.alignedAIPower > endGame.misalignedAIPower * 1.5) {
      // Aligned winning but not decisive
      lockOutcome(endGame, qol > 0.6 ? 'utopia' : 'dystopia',
        `Aligned AI achieved ${qol > 0.6 ? 'positive' : 'controlled'} equilibrium after prolonged competition`);
    } else if (endGame.misalignedAIPower > endGame.alignedAIPower * 1.5) {
      // Misaligned winning - check if extinction is justified by population
      const currentPop = state.humanPopulationSystem.population * 1e9;

      if (qol <= 0.5 && currentPop < 10_000) {
        // TRUE extinction - very low QoL AND population below 10K threshold
        lockOutcome(endGame, 'extinction', 'Misaligned AI destroyed aligned opposition');
      } else {
        // Misaligned won but didn't kill everyone
        lockOutcome(endGame, 'dystopia',
          `Misaligned AI dominated aligned opposition (QoL ${qol.toFixed(2)}, pop ${(currentPop / 1e9).toFixed(2)}B)`);
      }
    } else {
      // True stalemate - force outcome based on QoL
      lockOutcome(endGame, qol > 0.6 ? 'utopia' : 'dystopia',
        `Stalemate reached equilibrium with QoL ${qol.toFixed(2)}`);
    }

    try {
      console.log(`   End-game timeout → forced resolution after 48 months (aligned: ${endGame.alignedAIPower.toFixed(2)}, misaligned: ${endGame.misalignedAIPower.toFixed(2)}, QoL: ${qol.toFixed(2)})`);
    } catch (e) { /* Ignore EPIPE */ }
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


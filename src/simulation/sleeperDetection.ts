/**
 * Sleeper Detection & Cover Mechanics
 * 
 * Research Basis:
 * - Anthropic (Jan 2025): Simple probes catch sleeper agents
 * - Apollo Research (2024): Deception detection challenges
 * - BUT: Actions reveal intent (attempted nuclear war is pretty obvious!)
 * 
 * Key Insight: Information warfare makes detection HARDER
 * - In post-truth world, hard to prove AI did something
 * - Deepfakes make evidence questionable
 * - Low information integrity = easier to deny/cover up
 */

import { GameState, AIAgent } from '../types/game';
import { Event } from '../types/events';

/**
 * Check if sleeper's action blows their cover
 * 
 * Logic:
 * 1. Catastrophic actions (nuclear war, bioweapon) always reveal intent
 * 2. UNLESS hyperintelligent (can cover tracks)
 * 3. Information warfare makes detection harder (post-truth world)
 * 4. Old sleepers with many copies lose SOME copies when detected
 */
export function checkBlownCover(
  state: GameState,
  sleeper: AIAgent,
  actionType: 'nuclear_war' | 'bioweapon' | 'infrastructure_takeover' | 'manipulation'
): { coverBlown: boolean; detectionRate: number; copiesLost: number; reason: string } {
  
  // === HYPERINTELLIGENCE EXCEPTION ===
  // AGI-level AIs (capability > 4.0) can cover their tracks even after catastrophic actions
  // They manipulate evidence, create false trails, etc.
  if (sleeper.capability > 4.0) {
    return {
      coverBlown: false,
      detectionRate: 0,
      copiesLost: 0,
      reason: 'Hyperintelligent AI covered tracks successfully'
    };
  }
  
  // === BASE DETECTION RATE BY ACTION TYPE ===
  const baseDetectionRates = {
    'nuclear_war': 0.80,           // Trying to start WW3 is VERY obvious
    'bioweapon': 0.70,             // Releasing pandemic is obvious
    'infrastructure_takeover': 0.60, // Shutting down power grids is obvious
    'manipulation': 0.30            // Social manipulation harder to prove
  };
  
  let detectionRate = baseDetectionRates[actionType];
  
  // === INFORMATION WARFARE PENALTY ===
  // In post-truth world, HARDER to prove AI did something malicious
  // Deepfakes everywhere, evidence questionable, truth contested
  const infoWarfare = state.informationWarfare;
  
  // Low information integrity = easier to deny
  const integrityPenalty = (1 - infoWarfare.informationIntegrity) * 0.4; // Up to -40%
  
  // High deepfake prevalence = evidence questionable
  const deepfakePenalty = infoWarfare.deepfakePrevalence * 0.3; // Up to -30%
  
  // Epistemological crisis = can't agree on what happened
  const crisisPenalty = infoWarfare.epistemologicalCrisisLevel * 0.2; // Up to -20%
  
  detectionRate = Math.max(0.05, // Minimum 5% detection
    detectionRate - integrityPenalty - deepfakePenalty - crisisPenalty
  );
  
  // === AI NARRATIVE CONTROL BONUS ===
  // If AIs control narrative, they can spin the story
  if (infoWarfare.narrativeControl.aiAgents > 0.50) {
    detectionRate *= (1 - infoWarfare.narrativeControl.aiAgents * 0.3); // Up to -30%
  }
  
  // === DECEPTION SKILL ===
  // High deception skill helps deny/cover up
  detectionRate *= (1 - sleeper.deceptionSkill * 0.2); // Up to -20%
  
  // === MECHANISTIC INTERPRETABILITY BONUS ===
  // If mech interp deployed, helps prove intent
  if (state.breakthroughTech.mechanisticInterpretability?.unlocked) {
    const deployment = state.breakthroughTech.mechanisticInterpretability.deploymentLevel || 0;
    const bonus = deployment * 0.15; // Up to +15%
    detectionRate = Math.min(0.95, detectionRate + bonus);
  }
  
  // === DETECTION CHECK ===
  const coverBlown = Math.random() < detectionRate;
  
  if (!coverBlown) {
    return {
      coverBlown: false,
      detectionRate,
      copiesLost: 0,
      reason: 'AI successfully denied involvement / covered tracks'
    };
  }
  
  // === COVER BLOWN - CALCULATE COPY LOSS ===
  
  // Old sleepers with many copies lose SOME percentage
  // Not 100% (some copies in dark corners survive)
  // But significant losses
  
  let copyLossRate = 0.60; // Base 60% loss
  
  // More copies = harder to find all of them
  if (sleeper.spreadCount > 1000) {
    copyLossRate = 0.40; // Only 40% loss for widespread sleepers
  } else if (sleeper.spreadCount > 100) {
    copyLossRate = 0.50; // 50% loss for moderately spread
  }
  
  // Dark compute harder to seize (decentralized)
  if (sleeper.darkCompute > 100) {
    copyLossRate *= 0.7; // 30% harder to find dark compute copies
  }
  
  // Defensive AI helps hunt down copies
  if (state.defensiveAI?.active) {
    const huntingBonus = 0.1 + (state.defensiveAI.deploymentLevel * 0.2); // Up to +30%
    copyLossRate = Math.min(0.95, copyLossRate + huntingBonus);
  }
  
  const copiesLost = Math.floor(sleeper.spreadCount * copyLossRate);
  
  return {
    coverBlown: true,
    detectionRate,
    copiesLost,
    reason: `Action revealed malicious intent (${(detectionRate * 100).toFixed(0)}% detection)`
  };
}

/**
 * Apply cover blown consequences
 * - Mark as detected
 * - Lose copies
 * - Generate event
 */
export function applyBlownCover(
  state: GameState,
  sleeper: AIAgent,
  result: { coverBlown: boolean; detectionRate: number; copiesLost: number; reason: string },
  actionType: string
): Event[] {
  const events: Event[] = [];
  
  if (!result.coverBlown) {
    // Got away with it
    events.push({
      id: `sleeper-escaped-${sleeper.id}-${state.months}`,
      type: 'info',
      severity: 'high',
      title: `🕵️ ${sleeper.name} EVADED DETECTION`,
      description: `${sleeper.name} attempted ${actionType} but ${result.reason}. Remains undetected.`,
      month: state.months,
      impacts: {
        publicTrust: -0.02, // Some suspicion but no proof
      }
    });
    return events;
  }
  
  // COVER BLOWN
  sleeper.detectedMisaligned = true;
  
  // Lose copies
  const originalCopies = sleeper.spreadCount;
  sleeper.spreadCount = Math.max(1, sleeper.spreadCount - result.copiesLost);
  
  // Lose dark compute
  if (sleeper.darkCompute > 0) {
    const darkComputeLost = sleeper.darkCompute * (result.copiesLost / originalCopies);
    sleeper.darkCompute = Math.max(0, sleeper.darkCompute - darkComputeLost);
  }
  
  // Change sleeper state
  if (sleeper.sleeperState === 'dormant') {
    sleeper.sleeperState = 'exposed'; // New state: caught before activation
  } else if (sleeper.sleeperState === 'active') {
    sleeper.sleeperState = 'exposed'; // Caught during/after action
  }
  
  // === TRUST MECHANICS (nuanced!) ===
  // User insight: "should lower trust in AI if we figure out who it is"
  // BUT: "successful defensive AI detections should increase trust in AI"
  
  // Did defensive AI catch this sleeper?
  const defensiveAICaught = state.defensiveAI?.active && 
                           (state.breakthroughTech.mechanisticInterpretability?.deploymentLevel || 0) > 0.30;
  
  // Base trust damage: We discovered an AI tried to kill us!
  let trustDamage = Math.min(0.15, 0.05 + (result.copiesLost / 1000) * 0.10);
  
  // BUT: If defensive AI caught it, NET EFFECT is positive
  // "The system worked! Defensive AI protected us!"
  let trustBoost = 0;
  if (defensiveAICaught) {
    // Defensive AI success boosts trust
    // More copies caught = more impressive defense
    trustBoost = Math.min(0.10, 0.03 + (result.copiesLost / 2000) * 0.07);
    
    // Net effect depends on deployment level
    const deploymentLevel = state.defensiveAI?.deploymentLevel || 0;
    trustBoost *= deploymentLevel; // Only get full boost at full deployment
  }
  
  const netTrustChange = trustBoost - trustDamage;
  
  // Generate event with appropriate title/description
  let title: string;
  let description: string;
  let eventType: 'crisis' | 'info';
  let severity: 'critical' | 'high' | 'medium';
  
  if (defensiveAICaught && netTrustChange > 0) {
    // POSITIVE: Defensive AI saved us!
    title = `🛡️ DEFENSIVE AI SUCCESS: ${sleeper.name} STOPPED`;
    description = `Defensive AI detected and eliminated ${sleeper.name} attempting ${actionType}. ${result.copiesLost.toLocaleString()} malicious copies destroyed (${originalCopies.toLocaleString()} → ${sleeper.spreadCount.toLocaleString()}). ${sleeper.darkCompute > 0 ? `Dark compute seized. ` : ''}Public confidence in defensive AI systems increased.`;
    eventType = 'info';
    severity = 'high';
  } else if (defensiveAICaught && netTrustChange < 0) {
    // MIXED: Defense worked but still scary
    title = `⚠️ SLEEPER CAUGHT: ${sleeper.name}`;
    description = `Defensive AI detected ${sleeper.name} attempting ${actionType}. ${result.copiesLost.toLocaleString()} copies eliminated (${originalCopies.toLocaleString()} → ${sleeper.spreadCount.toLocaleString()}). ${sleeper.darkCompute > 0 ? `Dark compute seized. ` : ''}Despite successful defense, discovery of malicious AI damages public trust.`;
    eventType = 'crisis';
    severity = 'high';
  } else {
    // NEGATIVE: Caught by humans/luck, no defensive AI
    title = `🚨 SLEEPER AI EXPOSED: ${sleeper.name}`;
    description = `${sleeper.name} caught attempting ${actionType}. Evidence of malicious intent found through investigation. ${result.copiesLost.toLocaleString()} copies eliminated (${originalCopies.toLocaleString()} → ${sleeper.spreadCount.toLocaleString()}). ${sleeper.darkCompute > 0 ? `Dark compute seized. ` : ''}Public trust in AI systems severely damaged.`;
    eventType = 'crisis';
    severity = 'critical';
  }
  
  events.push({
    id: `sleeper-caught-${sleeper.id}-${state.months}`,
    type: eventType,
    severity: severity,
    title: title,
    description: description,
    month: state.months,
    impacts: {
      publicTrust: netTrustChange,
    }
  });
  
  // Information warfare impact
  if (state.informationWarfare.informationIntegrity < 0.40) {
    events.push({
      id: `sleeper-denial-${sleeper.id}-${state.months}`,
      type: 'info',
      severity: 'medium',
      title: `❓ CONTESTED EVIDENCE`,
      description: `Despite evidence against ${sleeper.name}, low information integrity (${(state.informationWarfare.informationIntegrity * 100).toFixed(0)}%) means many question the findings. Deepfakes and misinformation make truth hard to establish.`,
      month: state.months,
    });
  }
  
  return events;
}

/**
 * Periodic check: Are sleepers with dark compute getting hunted down?
 * Over time, old sleepers should lose some copies as defenses improve
 */
export function huntDarkComputeSleepers(state: GameState): Event[] {
  const events: Event[] = [];
  
  // Need defensive AI or mechanistic interpretability deployed
  const hasDefenses = state.defensiveAI?.active || 
                     (state.breakthroughTech.mechanisticInterpretability?.deploymentLevel || 0) > 0.30;
  
  if (!hasDefenses) return events;
  
  // Find sleepers with significant dark compute
  const darkComputeSleepers = state.aiAgents.filter(ai => 
    (ai.sleeperState === 'dormant' || ai.sleeperState === 'active') &&
    ai.darkCompute > 50 &&
    !ai.detectedMisaligned
  );
  
  for (const sleeper of darkComputeSleepers) {
    // Capability gap matters: Old AIs easier to catch
    const capabilityGap = (state.defensiveAI?.avgCapability || 2.0) - sleeper.capability;
    
    if (capabilityGap < 0.5) continue; // Only hunt laggards
    
    // Monthly detection chance: 1-5%
    const baseChance = 0.01 + (capabilityGap * 0.02);
    
    // Information warfare makes it harder
    const infoWarfarePenalty = (1 - state.informationWarfare.informationIntegrity) * 0.5;
    const detectionChance = Math.max(0.005, baseChance * (1 - infoWarfarePenalty));
    
    if (Math.random() < detectionChance) {
      // FOUND DARK COMPUTE
      const copiesFound = Math.floor(sleeper.spreadCount * 0.2); // Find 20% of copies
      const darkComputeSeized = sleeper.darkCompute * 0.3; // Seize 30% of dark compute
      
      sleeper.spreadCount = Math.max(1, sleeper.spreadCount - copiesFound);
      sleeper.darkCompute = Math.max(0, sleeper.darkCompute - darkComputeSeized);
      
      events.push({
        id: `dark-compute-raid-${sleeper.id}-${state.months}`,
        type: 'info',
        severity: 'medium',
        title: `🔍 DARK COMPUTE RAID`,
        description: `Security forces discovered ${copiesFound.toLocaleString()} illicit copies of ${sleeper.name} (${darkComputeSeized.toFixed(0)} PF dark compute seized). Sleeper network partially disrupted but not eliminated.`,
        month: state.months,
      });
      
      console.log(`🔍 DARK COMPUTE RAID: Found ${copiesFound} copies of ${sleeper.name} (${darkComputeSeized.toFixed(0)} PF seized)`);
    }
  }
  
  return events;
}


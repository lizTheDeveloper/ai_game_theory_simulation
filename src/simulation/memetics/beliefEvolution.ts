/**
 * Belief Evolution Mechanics
 * 
 * Updates agent beliefs through social influence and meme transmission
 * Based on bounded confidence model from research
 * 
 * Research:
 * - Expert Systems with Applications (2024): Opinion dynamics
 * - Physical Review Research (2025): DeGroot learning + bounded confidence
 * - Bounded confidence: Agents only interact with similar opinions (threshold)
 * 
 * Update Rule:
 * belief_t+1 = belief_t + susceptibility * Σ(connection_strength * (other_belief - belief_t))
 *                          where |other_belief - belief_t| < confidence_threshold
 */

import { GameState } from '../../types/game';
import { MemeticSegment, BeliefVector } from '../../types/memetics';

/**
 * Update all segment beliefs based on network interactions
 * 
 * Algorithm:
 * 1. For each segment, gather influences from connected segments
 * 2. Filter by confidence threshold (bounded confidence)
 * 3. Apply weighted averaging with confirmation bias
 * 4. Add AI amplification effects (algorithmic boost)
 * 5. Update beliefs gradually (susceptibility factor)
 */
export function updateBeliefs(state: GameState): void {
  const memetic = state.memeticSystem;
  
  // Create deep copy of current beliefs (to avoid order effects)
  const currentBeliefs: Map<string, BeliefVector> = new Map();
  for (const segment of memetic.segments) {
    currentBeliefs.set(segment.id, { ...segment.beliefs });
  }
  
  // Update each segment's beliefs
  for (const segment of memetic.segments) {
    const currentBelief = currentBeliefs.get(segment.id)!;
    const newBelief: BeliefVector = { ...currentBelief };
    
    // For each belief dimension
    const dimensions: (keyof BeliefVector)[] = [
      'aiTrust', 'climateConcern', 'techAdoption', 'governmentTrust',
      'economicOptimism', 'socialProgressive', 'globalismNationalism', 'collectivismIndividualism'
    ];
    
    for (const dim of dimensions) {
      let influenceSum = 0;
      let influenceWeight = 0;
      
      // Gather influences from connected segments
      for (const [otherId, connectionStrength] of segment.connections) {
        const otherSegment = memetic.segments.find(s => s.id === otherId);
        if (!otherSegment) continue;
        
        const otherBelief = currentBeliefs.get(otherId)!;
        const beliefDiff = otherBelief[dim] - currentBelief[dim];
        
        // Bounded confidence: Only interact if within threshold
        if (Math.abs(beliefDiff) <= segment.confidenceThreshold) {
          // Confirmation bias: Prefer confirming information
          let weight = connectionStrength;
          if (Math.sign(beliefDiff) === Math.sign(currentBelief[dim])) {
            // Confirming belief: Boost weight
            weight *= (1.0 + segment.confirmationBias);
          } else {
            // Challenging belief: Reduce weight
            weight *= (1.0 - segment.confirmationBias * 0.5);
          }
          
          influenceSum += weight * beliefDiff;
          influenceWeight += weight;
        }
      }
      
      // Calculate belief update
      if (influenceWeight > 0) {
        const averageInfluence = influenceSum / influenceWeight;
        const update = segment.susceptibilityToMemes * averageInfluence;
        
        // Apply update with memetic immunity as dampening
        const dampening = 1.0 - segment.memeticImmunity * 0.5;
        newBelief[dim] = clamp(currentBelief[dim] + update * dampening, -1, 1);
      }
    }
    
    // Apply external influences (crises, AI events, government actions)
    applyExternalInfluences(state, segment, newBelief);
    
    // Update segment beliefs
    segment.beliefs = newBelief;
  }
  
  // Update polarization metrics after belief changes
  updatePolarizationMetrics(state);
}

/**
 * Apply external influences from game events
 * - AI failures → decrease AI trust
 * - Climate disasters → increase climate concern
 * - Economic crises → decrease optimism
 * - Government actions → affect trust
 */
function applyExternalInfluences(state: GameState, segment: MemeticSegment, beliefs: BeliefVector): void {
  const env = state.environmentalAccumulation;
  const social = state.socialAccumulation;
  const tech = state.technologicalRisk;
  
  // AI trust affected by:
  // 1. AI control loss → decrease trust
  if (tech.controlLossActive) {
    beliefs.aiTrust -= 0.02 * (1 - segment.memeticImmunity); // 2% decrease per month during control loss
  }
  
  // 2. AI beneficial actions → increase trust (if any)
  const beneficialAI = state.aiAgents.filter(ai => ai.beneficialActions > ai.harmfulActions).length;
  const totalAI = Math.max(1, state.aiAgents.length);
  if (beneficialAI / totalAI > 0.7) {
    beliefs.aiTrust += 0.005 * (1 - segment.memeticImmunity); // 0.5% increase per month if most AIs beneficial
  }
  
  // Climate concern affected by environmental crises
  if (env.climateCrisisActive) {
    beliefs.climateConcern += 0.015 * (1 - segment.memeticImmunity); // 1.5% increase per month during climate crisis
  }
  
  // Economic optimism affected by:
  // 1. Unemployment
  const unemployment = state.society.unemploymentLevel;
  if (unemployment > 0.2) {
    beliefs.economicOptimism -= 0.01 * unemployment * (1 - segment.memeticImmunity);
  }
  
  // 2. Quality of Life
  const qol = state.globalMetrics.qualityOfLife;
  if (qol > 0.8) {
    beliefs.economicOptimism += 0.005 * (1 - segment.memeticImmunity); // Prosperity increases optimism
  } else if (qol < 0.4) {
    beliefs.economicOptimism -= 0.01 * (1 - segment.memeticImmunity); // Crisis decreases optimism
  }
  
  // Government trust affected by:
  // 1. Institutional legitimacy
  if (social.institutionalLegitimacy < 0.4) {
    beliefs.governmentTrust -= 0.01 * (1 - segment.memeticImmunity); // Trust declines with legitimacy
  }
  
  // 2. Social stability
  const stability = state.globalMetrics.socialStability;
  if (stability < 0.3) {
    beliefs.governmentTrust -= 0.015 * (1 - segment.memeticImmunity); // Instability erodes trust
  }
  
  // Clamp all beliefs to [-1, 1]
  const dimensions: (keyof BeliefVector)[] = [
    'aiTrust', 'climateConcern', 'techAdoption', 'governmentTrust',
    'economicOptimism', 'socialProgressive', 'globalismNationalism', 'collectivismIndividualism'
  ];
  for (const dim of dimensions) {
    beliefs[dim] = clamp(beliefs[dim], -1, 1);
  }
}

/**
 * Update polarization metrics based on current belief distribution
 */
function updatePolarizationMetrics(state: GameState): void {
  const memetic = state.memeticSystem;
  const segments = memetic.segments;
  
  // 1. Opinion variance (spread of beliefs)
  memetic.polarization.opinionVariance = calculateOpinionVariance(segments);
  
  // 2. Average belief distance
  memetic.polarization.beliefDistance = calculateAverageBeliefDistance(segments);
  
  // 3. Echo chamber strength (ratio internal/external connections)
  let totalInternalStrength = 0;
  let totalExternalStrength = 0;
  for (const segment of segments) {
    for (const [otherId, strength] of segment.connections) {
      // Check if connection is internal (similar beliefs) or external (different beliefs)
      const other = segments.find(s => s.id === otherId);
      if (!other) continue;
      
      const distance = calculateBeliefDistance(segment.beliefs, other.beliefs);
      if (distance < 0.3) {
        totalInternalStrength += strength; // Similar beliefs = internal
      } else {
        totalExternalStrength += strength; // Different beliefs = external
      }
    }
  }
  memetic.polarization.echoChambersStrength = totalExternalStrength > 0 
    ? totalInternalStrength / totalExternalStrength 
    : 10.0; // If no external connections, very strong echo chambers
  
  // 4. Network fragmentation (1 - connectivity)
  const avgConnectionStrength = calculateAverageConnectionStrength(segments);
  memetic.polarization.networkFragmentation = 1.0 - avgConnectionStrength;
  
  // 5. Affective polarization (emotional dislike - increases with distance)
  // Research: Affective polarization grows faster than belief distance
  memetic.polarization.affectivePolarization = Math.min(1.0, 
    memetic.polarization.beliefDistance * 1.5 // Amplification factor
  );
  
  // 6. Tribalism (in-group favoritism)
  memetic.polarization.tribalism = Math.min(1.0,
    memetic.polarization.echoChambersStrength / 5.0 // Normalize to [0, 1]
  );
  
  // 7. Update trends (early warning signals)
  const histLen = memetic.polarizationHistory.length;
  if (histLen >= 6) {
    // 6-month trend
    const recent = memetic.polarizationHistory.slice(-6);
    const slope = (recent[5] - recent[0]) / 6;
    memetic.polarization.varianceTrend = slope;
  }
  
  // 8. Update social cohesion (inverse of polarization)
  memetic.socialCohesion = 1.0 - memetic.polarization.affectivePolarization;
  
  // 9. Check for critical transition warning
  // Research: Systems near tipping points show accelerating trends
  if (memetic.polarization.varianceTrend > 0.05 && memetic.polarization.opinionVariance > 0.6) {
    memetic.polarization.nearCriticalTransition = true;
    // Estimate time to transition (crude linear extrapolation)
    const distanceToThreshold = 0.8 - memetic.polarization.opinionVariance;
    const monthsToTransition = distanceToThreshold / Math.max(0.001, memetic.polarization.varianceTrend);
    memetic.polarization.estimatedMonthsToTransition = Math.max(1, Math.floor(monthsToTransition));
  } else {
    memetic.polarization.nearCriticalTransition = false;
    memetic.polarization.estimatedMonthsToTransition = 999;
  }
  
  // 10. Check for polarization crisis
  if (memetic.polarization.affectivePolarization > 0.8 && !memetic.polarizationCrisisActive) {
    memetic.polarizationCrisisActive = true;
    memetic.lastPolarizationSpike = state.currentMonth;
    console.log(`\n🔥 POLARIZATION CRISIS TRIGGERED (Month ${state.currentMonth})`);
    console.log(`   Affective Polarization: ${(memetic.polarization.affectivePolarization * 100).toFixed(1)}%`);
    console.log(`   Echo Chamber Strength: ${memetic.polarization.echoChambersStrength.toFixed(2)}x`);
    console.log(`   Social Cohesion: ${(memetic.socialCohesion * 100).toFixed(1)}%`);
    console.log(`   Impact: Society fragmented, coordinated action difficult\n`);
  }
  
  // Update history
  memetic.polarizationHistory.push(memetic.polarization.affectivePolarization);
  memetic.cohesionHistory.push(memetic.socialCohesion);
}

/**
 * Calculate Euclidean distance between two belief vectors (helper)
 */
function calculateBeliefDistance(b1: BeliefVector, b2: BeliefVector): number {
  const dimensions: (keyof BeliefVector)[] = [
    'aiTrust', 'climateConcern', 'techAdoption', 'governmentTrust',
    'economicOptimism', 'socialProgressive', 'globalismNationalism', 'collectivismIndividualism'
  ];
  
  let sumSquaredDiff = 0;
  for (const dim of dimensions) {
    const diff = b1[dim] - b2[dim];
    sumSquaredDiff += diff * diff;
  }
  
  return Math.sqrt(sumSquaredDiff) / (Math.sqrt(dimensions.length) * 2);
}

/**
 * Calculate opinion variance (helper)
 */
function calculateOpinionVariance(segments: MemeticSegment[]): number {
  const dimensions: (keyof BeliefVector)[] = [
    'aiTrust', 'climateConcern', 'techAdoption', 'governmentTrust',
    'economicOptimism', 'socialProgressive', 'globalismNationalism', 'collectivismIndividualism'
  ];
  
  let totalVariance = 0;
  
  for (const dim of dimensions) {
    let weightedSum = 0;
    let totalWeight = 0;
    for (const segment of segments) {
      weightedSum += segment.beliefs[dim] * segment.size;
      totalWeight += segment.size;
    }
    const mean = weightedSum / totalWeight;
    
    let varianceSum = 0;
    for (const segment of segments) {
      const diff = segment.beliefs[dim] - mean;
      varianceSum += segment.size * diff * diff;
    }
    const variance = varianceSum / totalWeight;
    
    totalVariance += variance;
  }
  
  return totalVariance / dimensions.length;
}

/**
 * Calculate average belief distance (helper)
 */
function calculateAverageBeliefDistance(segments: MemeticSegment[]): number {
  let totalDistance = 0;
  let totalWeight = 0;
  
  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 1; j < segments.length; j++) {
      const distance = calculateBeliefDistance(segments[i].beliefs, segments[j].beliefs);
      const weight = segments[i].size * segments[j].size;
      totalDistance += distance * weight;
      totalWeight += weight;
    }
  }
  
  return totalWeight > 0 ? totalDistance / totalWeight : 0;
}

/**
 * Calculate average connection strength across network (helper)
 */
function calculateAverageConnectionStrength(segments: MemeticSegment[]): number {
  let totalStrength = 0;
  let totalConnections = 0;
  
  for (const segment of segments) {
    for (const strength of segment.connections.values()) {
      totalStrength += strength;
      totalConnections++;
    }
  }
  
  return totalConnections > 0 ? totalStrength / totalConnections : 0;
}

/**
 * Clamp value to [min, max] range
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}


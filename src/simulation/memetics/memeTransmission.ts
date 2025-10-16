/**
 * Meme Transmission & Evolution
 * 
 * Creates, mutates, and spreads memes through population network
 * Based on evolutionary dynamics from research
 * 
 * Research:
 * - Scientific Reports (2021): "Entropy and complexity unveil the landscape of memes evolution"
 * - Treats memes as evolving entities with mutation/selection dynamics
 * - Fitness = emotional_valence × novelty × source_credibility
 * 
 * Mechanisms:
 * 1. Meme Creation: Organic emergence from events or AI-generated
 * 2. Mutation: 5% of transmissions mutate content
 * 3. Selection: High-fitness memes spread faster
 * 4. Decay: Novelty decays over time, old memes die
 */

import { GameState } from '../../types/game';
import { Meme, MemeticSegment, BeliefVector } from '../../types/memetics';

/**
 * Update meme transmission each month
 * 
 * Steps:
 * 1. Create new memes from events (AI failures, crises, breakthroughs)
 * 2. Spread existing memes through network
 * 3. Mutate memes during transmission
 * 4. Update meme fitness based on segment receptivity
 * 5. Remove dead memes (low fitness + old)
 */
export function updateMemeTransmission(state: GameState): void {
  const memetic = state.memeticSystem;
  
  // 1. Create new memes from game events
  createOrganicMemes(state);
  
  // 2. Spread memes through network
  spreadMemes(state);
  
  // 3. Update meme properties (decay novelty, update fitness)
  updateMemeProperties(state);
  
  // 4. Remove dead memes
  cullDeadMemes(state);
}

/**
 * Create new memes based on game events
 * Memes emerge organically from crises, AI actions, government policies
 */
function createOrganicMemes(state: GameState): void {
  const memetic = state.memeticSystem;
  const currentMonth = state.currentMonth;
  
  // AI control loss → anti-AI memes
  if (state.technologicalRisk.controlLossActive && Math.random() < 0.3) {
    const meme: Meme = {
      id: `meme_${memetic.totalMemesCreated++}`,
      contentType: 'anti_ai',
      fitness: 0.7, // High initial fitness (fear-based)
      emotionalValence: -0.8, // Negative emotion (fear/anger)
      novelty: 1.0, // Maximum novelty
      complexity: 0.3, // Low complexity (simple fear message)
      prevalence: new Map(),
      generation: 0,
      mutationHistory: [],
      createdMonth: currentMonth,
      source: 'organic',
      credibility: 0.6, // Moderate credibility (based on real events)
      beliefEffects: {
        aiTrust: -0.1, // Pushes towards distrust
        techAdoption: -0.05,
      },
    };
    
    memetic.activeMemes.push(meme);
    console.log(`  📢 New meme created: anti_ai (AI control loss)`);
  }
  
  // AI beneficial actions → pro-AI memes
  const beneficialAI = state.aiAgents.filter(ai => ai.beneficialActions > ai.harmfulActions).length;
  const totalAI = Math.max(1, state.aiAgents.length);
  if (beneficialAI / totalAI > 0.7 && Math.random() < 0.2) {
    const meme: Meme = {
      id: `meme_${memetic.totalMemesCreated++}`,
      contentType: 'pro_ai',
      fitness: 0.5, // Moderate fitness (positive news less viral)
      emotionalValence: 0.6, // Positive emotion
      novelty: 1.0,
      complexity: 0.4,
      prevalence: new Map(),
      generation: 0,
      mutationHistory: [],
      createdMonth: currentMonth,
      source: 'organic',
      credibility: 0.7, // Good credibility (factual)
      beliefEffects: {
        aiTrust: 0.08,
        techAdoption: 0.05,
      },
    };
    
    memetic.activeMemes.push(meme);
    console.log(`  📢 New meme created: pro_ai (beneficial AI actions)`);
  }
  
  // Climate crisis → climate action memes
  if (state.environmentalAccumulation.climateCrisisActive && Math.random() < 0.25) {
    const meme: Meme = {
      id: `meme_${memetic.totalMemesCreated++}`,
      contentType: 'climate_action',
      fitness: 0.6,
      emotionalValence: -0.5, // Negative (urgency/fear)
      novelty: 1.0,
      complexity: 0.5, // Moderate complexity
      prevalence: new Map(),
      generation: 0,
      mutationHistory: [],
      createdMonth: currentMonth,
      source: 'organic',
      credibility: 0.8, // High credibility (scientific)
      beliefEffects: {
        climateConcern: 0.1,
        governmentTrust: -0.05, // Distrust if action lacking
      },
    };
    
    memetic.activeMemes.push(meme);
    console.log(`  📢 New meme created: climate_action (climate crisis)`);
  }
  
  // Meaning collapse → conspiracy/despair memes
  if (state.socialAccumulation.meaningCollapseActive && Math.random() < 0.2) {
    const meme: Meme = {
      id: `meme_${memetic.totalMemesCreated++}`,
      contentType: 'conspiracy',
      fitness: 0.75, // High fitness (exploits despair)
      emotionalValence: -0.9, // Very negative
      novelty: 1.0,
      complexity: 0.2, // Low complexity (simple narratives)
      prevalence: new Map(),
      generation: 0,
      mutationHistory: [],
      createdMonth: currentMonth,
      source: 'organic',
      credibility: 0.3, // Low credibility
      beliefEffects: {
        governmentTrust: -0.15,
        aiTrust: -0.1,
      },
    };
    
    memetic.activeMemes.push(meme);
    console.log(`  📢 New meme created: conspiracy (meaning collapse)`);
  }
  
  // Government action → propaganda memes (if authoritarian)
  if (state.government.structuralChoices.surveillanceLevel > 0.6 && Math.random() < 0.15) {
    const meme: Meme = {
      id: `meme_${memetic.totalMemesCreated++}`,
      contentType: 'propaganda',
      fitness: 0.6,
      emotionalValence: 0.5, // Positive (state messaging)
      novelty: 0.7, // Lower novelty (predictable)
      complexity: 0.3,
      prevalence: new Map(),
      generation: 0,
      mutationHistory: [],
      createdMonth: currentMonth,
      source: 'state_propaganda',
      credibility: 0.4, // Low credibility (state-controlled)
      beliefEffects: {
        governmentTrust: 0.05, // Attempts to boost trust
        aiTrust: 0.05, // If pro-AI government
      },
    };
    
    memetic.activeMemes.push(meme);
    console.log(`  📢 New meme created: propaganda (government messaging)`);
  }
}

/**
 * Spread memes through population network
 * Uses fitness-based transmission probability
 */
function spreadMemes(state: GameState): void {
  const memetic = state.memeticSystem;
  const segments = memetic.segments;
  
  for (const meme of memetic.activeMemes) {
    // For each segment, attempt to spread to connected segments
    for (const sourceSegment of segments) {
      const sourcePrev = meme.prevalence.get(sourceSegment.id) || 0;
      if (sourcePrev < 0.01) continue; // Skip if not present in source
      
      // Spread to connected segments
      for (const [targetId, connectionStrength] of Array.from(sourceSegment.connections)) {
        const targetSegment = segments.find(s => s.id === targetId);
        if (!targetSegment) continue;
        
        const targetPrev = meme.prevalence.get(targetId) || 0;
        if (targetPrev > 0.95) continue; // Already saturated
        
        // Calculate transmission probability
        const transmissionProb = calculateTransmissionProbability(
          meme,
          sourceSegment,
          targetSegment,
          connectionStrength,
          memetic.algorithmicAmplification
        );
        
        // Attempt transmission
        if (Math.random() < transmissionProb) {
          // Check if meme mutates during transmission
          const mutates = Math.random() < 0.05; // 5% mutation rate (from research)
          
          if (mutates) {
            // Create mutated version
            const mutatedMeme = mutateMeme(meme, state);
            memetic.activeMemes.push(mutatedMeme);
            
            // Mutated meme enters target with low prevalence
            mutatedMeme.prevalence.set(targetId, 0.1);
          } else {
            // Original meme spreads
            const increase = 0.15 * (1 - targetPrev); // Sigmoid growth
            meme.prevalence.set(targetId, Math.min(0.95, targetPrev + increase));
          }
        }
      }
    }
    
    // Seed initial prevalence if meme just created
    if (meme.createdMonth === state.currentMonth) {
      // New memes start in most susceptible segments
      const sortedByVulnerability = [...segments].sort((a, b) => 
        b.susceptibilityToMemes - a.susceptibilityToMemes
      );
      
      for (let i = 0; i < Math.min(2, sortedByVulnerability.length); i++) {
        const segment = sortedByVulnerability[i];
        meme.prevalence.set(segment.id, 0.2); // 20% initial prevalence
      }
    }
  }
}

/**
 * Calculate transmission probability for a meme
 * Based on fitness, segment properties, and network structure
 */
function calculateTransmissionProbability(
  meme: Meme,
  source: MemeticSegment,
  target: MemeticSegment,
  connectionStrength: number,
  algorithmicAmplification: number
): number {
  // Base probability from research (30%)
  let prob = 0.3;
  
  // Fitness effect (higher fitness = more viral)
  prob *= meme.fitness;
  
  // Target susceptibility (how easily influenced)
  prob *= target.susceptibilityToMemes;
  
  // Target immunity (resistance to change)
  prob *= (1.0 - target.memeticImmunity * 0.5);
  
  // Connection strength (stronger ties = more influence)
  prob *= connectionStrength;
  
  // Novelty (new memes spread faster)
  prob *= (0.5 + meme.novelty * 0.5);
  
  // Complexity (complex memes spread slower)
  prob *= (1.2 - meme.complexity * 0.4);
  
  // Source credibility (trusted sources = more spread)
  prob *= (0.5 + meme.credibility * 0.5);
  
  // Algorithmic amplification (social media algorithms boost polarizing content)
  if (Math.abs(meme.emotionalValence) > 0.6) {
    prob *= algorithmicAmplification; // Amplify emotional content
  }
  
  // Confirmation bias: Memes aligning with target beliefs spread faster
  const beliefAlignment = calculateBeliefAlignment(meme, target.beliefs);
  if (beliefAlignment > 0) {
    prob *= (1.0 + target.confirmationBias * beliefAlignment);
  } else {
    prob *= (1.0 - target.confirmationBias * Math.abs(beliefAlignment) * 0.5);
  }
  
  return Math.min(1.0, prob);
}

/**
 * Calculate how well a meme aligns with segment beliefs
 * Returns -1 (contradicts) to +1 (confirms)
 */
function calculateBeliefAlignment(meme: Meme, beliefs: BeliefVector): number {
  if (!meme.beliefEffects) return 0;
  
  let alignment = 0;
  let count = 0;
  
  const effects = meme.beliefEffects;
  
  if (effects.aiTrust !== undefined) {
    alignment += Math.sign(effects.aiTrust) === Math.sign(beliefs.aiTrust) ? 1 : -1;
    count++;
  }
  if (effects.climateConcern !== undefined) {
    alignment += Math.sign(effects.climateConcern) === Math.sign(beliefs.climateConcern) ? 1 : -1;
    count++;
  }
  if (effects.governmentTrust !== undefined) {
    alignment += Math.sign(effects.governmentTrust) === Math.sign(beliefs.governmentTrust) ? 1 : -1;
    count++;
  }
  
  return count > 0 ? alignment / count : 0;
}

/**
 * Mutate a meme during transmission
 * Creates variant with altered properties
 */
function mutateMeme(parent: Meme, state: GameState): Meme {
  const memetic = state.memeticSystem;
  
  // Mutate content type (10% chance)
  let newContentType = parent.contentType;
  if (Math.random() < 0.1) {
    // Flip sentiment: pro_ai ↔ anti_ai, climate_action ↔ climate_denial
    const flips: Record<string, string> = {
      'pro_ai': 'anti_ai',
      'anti_ai': 'pro_ai',
      'climate_action': 'climate_denial',
      'climate_denial': 'climate_action',
      'tech_optimism': 'tech_skepticism',
      'tech_skepticism': 'tech_optimism',
    };
    newContentType = (flips[parent.contentType] || parent.contentType) as any;
  }
  
  // Mutate emotional valence (±0.2)
  const newValence = clamp(
    parent.emotionalValence + (Math.random() - 0.5) * 0.4,
    -1, 1
  );
  
  // Mutate complexity (±0.1)
  const newComplexity = clamp(
    parent.complexity + (Math.random() - 0.5) * 0.2,
    0, 1
  );
  
  // Mutate belief effects (±0.05)
  const newBeliefEffects: Partial<BeliefVector> = {};
  if (parent.beliefEffects) {
    for (const [key, value] of Object.entries(parent.beliefEffects)) {
      if (value !== undefined) {
        newBeliefEffects[key as keyof BeliefVector] = clamp(
          value + (Math.random() - 0.5) * 0.1,
          -1, 1
        );
      }
    }
  }
  
  const mutated: Meme = {
    id: `meme_${memetic.totalMemesCreated++}`,
    contentType: newContentType,
    fitness: parent.fitness * 0.9, // Mutations slightly reduce fitness initially
    emotionalValence: newValence,
    novelty: Math.min(1.0, parent.novelty + 0.2), // Mutations increase novelty
    complexity: newComplexity,
    prevalence: new Map(),
    generation: parent.generation + 1,
    mutationHistory: [...parent.mutationHistory, parent.id],
    createdMonth: state.currentMonth,
    source: parent.source,
    credibility: parent.credibility * 0.95, // Mutations reduce credibility slightly
    beliefEffects: newBeliefEffects,
  };
  
  console.log(`  🧬 Meme mutated: ${parent.contentType} → ${mutated.contentType} (generation ${mutated.generation})`);
  
  return mutated;
}

/**
 * Update meme properties each month
 * - Decay novelty
 * - Recalculate fitness
 * - Update credibility based on outcomes
 */
function updateMemeProperties(state: GameState): void {
  const memetic = state.memeticSystem;
  const monthsOld = (meme: Meme) => state.currentMonth - meme.createdMonth;
  
  for (const meme of memetic.activeMemes) {
    // Decay novelty over time (10% per month from research)
    meme.novelty = Math.max(0, meme.novelty * 0.9);
    
    // Update fitness based on novelty, valence, credibility
    // Fitness = emotional_valence × novelty × credibility (from research)
    const emotionalStrength = Math.abs(meme.emotionalValence);
    meme.fitness = emotionalStrength * meme.novelty * meme.credibility;
    
    // Update credibility based on outcomes
    // If meme predicts disaster but things improve → lose credibility
    if (meme.contentType === 'anti_ai' && !state.technologicalRisk.controlLossActive) {
      meme.credibility *= 0.98; // Slow decay
    }
    if (meme.contentType === 'climate_action' && state.environmentalAccumulation.climateCrisisActive) {
      meme.credibility *= 1.01; // Slow increase (validated by events)
    }
    
    // Very old memes lose credibility
    if (monthsOld(meme) > 24) {
      meme.credibility *= 0.95;
    }
  }
}

/**
 * Remove memes that have died out
 * Dead = low fitness + low prevalence + old
 */
function cullDeadMemes(state: GameState): void {
  const memetic = state.memeticSystem;
  const lifespan = memetic.memeLifespan; // 12 months default
  
  const before = memetic.activeMemes.length;
  
  memetic.activeMemes = memetic.activeMemes.filter(meme => {
    const age = state.currentMonth - meme.createdMonth;
    const totalPrevalence = Array.from(meme.prevalence.values()).reduce((a, b) => a + b, 0);
    const avgPrevalence = totalPrevalence / Math.max(1, meme.prevalence.size);
    
    // Keep if:
    // 1. Young (<6 months)
    // 2. High fitness (>0.4) AND has some prevalence (>5%)
    // 3. Not ancient (>lifespan * 2)
    const isYoung = age < 6;
    const isViable = meme.fitness > 0.4 && avgPrevalence > 0.05;
    const notAncient = age < lifespan * 2;
    
    return (isYoung || isViable) && notAncient;
  });
  
  const culled = before - memetic.activeMemes.length;
  if (culled > 0) {
    console.log(`  🗑️  Culled ${culled} dead memes (${memetic.activeMemes.length} active)`);
  }
}

/**
 * Clamp value to [min, max]
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}


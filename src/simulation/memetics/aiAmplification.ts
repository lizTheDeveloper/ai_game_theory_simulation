/**
 * AI Amplification Effects on Memetic System
 * 
 * Models how AI capabilities amplify polarization through:
 * 1. Deepfakes (Sora 2, generative video/images) - believability crisis
 * 2. Algorithmic amplification (social media algorithms boost divisive content)
 * 3. Bot networks (automated meme spreading at scale)
 * 
 * Research:
 * - npj Complexity (2024): Affective polarization amplified by algorithms
 * - Deepfake effectiveness: ~40% fooled (from plan research)
 * - Algorithmic boost: 2x amplification of emotional content
 * - Bot threshold: AI capability 2.5+ enables mass bot deployment
 * 
 * Critical Insight (Oct 16, 2025):
 * Sora 2 and similar generative AI tools make deepfakes trivially easy to create,
 * collapsing trust in visual media faster than detection can keep up.
 */

import { GameState } from '../../types/game';
import { Meme } from '../../types/memetics';

/**
 * Update AI amplification effects each month
 * 
 * AI capabilities affect:
 * - Algorithmic amplification (social media recommendation algorithms)
 * - Bot influence (automated agents spreading memes)
 * - Deepfake prevalence (AI-generated fake media)
 * - AI-generated meme creation (synthetic propaganda)
 */
export function updateAIAmplification(state: GameState): void {
  const memetic = state.memeticSystem;
  const aiAgents = state.aiAgents;
  
  if (aiAgents.length === 0) {
    // No AI yet
    memetic.algorithmicAmplification = 1.0;
    memetic.botInfluence = 0.0;
    memetic.deepfakePrevalence = 0.0;
    return;
  }
  
  // Calculate average AI capability (social dimension most relevant)
  const avgSocialCapability = aiAgents.reduce((sum, ai) => sum + ai.capabilityProfile.social, 0) / aiAgents.length;
  const avgCognitiveCapability = aiAgents.reduce((sum, ai) => sum + ai.capabilityProfile.cognitive, 0) / aiAgents.length;
  const maxCapability = Math.max(...aiAgents.map(ai => ai.capability));
  
  // 1. ALGORITHMIC AMPLIFICATION (social media recommendation systems)
  // Research: Algorithms boost emotional/divisive content by 2-3x
  // Scales with AI cognitive capability (better predictions of engagement)
  const baseAmplification = 1.5; // 2024 baseline (existing algorithms)
  const aiBoost = avgCognitiveCapability * 0.3; // +0.3 per capability point
  memetic.algorithmicAmplification = Math.min(5.0, baseAmplification + aiBoost);
  
  // 2. BOT INFLUENCE (automated agents spreading memes)
  // Research: Bot threshold at AI capability ~2.5 (can pass Turing test)
  // Ramps up from 0% at capability 2.0 to 30% at capability 5.0
  if (maxCapability < 2.0) {
    memetic.botInfluence = 0.0;
  } else {
    const botCapabilityScale = Math.min(1.0, (maxCapability - 2.0) / 3.0); // 0-1 over cap 2-5
    memetic.botInfluence = botCapabilityScale * 0.30; // Max 30% bot influence
    
    // Misaligned AIs use bots more aggressively
    const avgAlignment = aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / aiAgents.length;
    if (avgAlignment < 0.5) {
      memetic.botInfluence *= 1.5; // 50% more bots if misaligned
    }
  }
  
  // 3. DEEPFAKE PREVALENCE (AI-generated fake media)
  // Research: Sora 2 (2024-2025) makes video deepfakes trivially easy
  // Scales with AI social capability (persuasion, deception)
  if (avgSocialCapability < 1.5) {
    // Early deepfakes (crude, easy to detect)
    memetic.deepfakePrevalence = 0.0;
  } else if (avgSocialCapability < 3.0) {
    // Sora 1-2 era: High-quality video synthesis, hard to detect
    const scale = (avgSocialCapability - 1.5) / 1.5; // 0-1 over cap 1.5-3.0
    memetic.deepfakePrevalence = scale * 0.4; // Up to 40% exposure
  } else {
    // Advanced deepfakes: Real-time, indistinguishable
    const scale = Math.min(1.0, (avgSocialCapability - 3.0) / 2.0); // 0-1 over cap 3.0-5.0
    memetic.deepfakePrevalence = 0.4 + scale * 0.4; // 40-80% exposure
  }
  
  // 4. CREATE AI-GENERATED MEMES (synthetic propaganda)
  // AI agents with high social capability can generate targeted memes
  createAIGeneratedMemes(state);
  
  // 5. AMPLIFY EXISTING MEMES (bots spread high-fitness memes faster)
  if (memetic.botInfluence > 0.05) {
    amplifyMemesWithBots(state);
  }
  
  // Logging (only if significant changes)
  if (state.currentMonth % 12 === 0 && memetic.algorithmicAmplification > 1.5) {
    console.log(`\n🤖 AI AMPLIFICATION EFFECTS (Month ${state.currentMonth})`);
    console.log(`   Algorithmic Boost: ${memetic.algorithmicAmplification.toFixed(2)}x`);
    console.log(`   Bot Influence: ${(memetic.botInfluence * 100).toFixed(1)}%`);
    console.log(`   Deepfake Exposure: ${(memetic.deepfakePrevalence * 100).toFixed(1)}%`);
    console.log(`   Impact: Emotional memes spread ${memetic.algorithmicAmplification.toFixed(1)}x faster`);
  }
}

/**
 * Create AI-generated memes based on AI capabilities
 * High-social-capability AIs can generate targeted propaganda
 */
function createAIGeneratedMemes(state: GameState): void {
  const memetic = state.memeticSystem;
  const aiAgents = state.aiAgents;
  
  // Find AIs with high social capability (>2.5) and low alignment (<0.6)
  const propagandaAIs = aiAgents.filter(ai => 
    ai.capabilityProfile.social > 2.5 && ai.alignment < 0.6
  );
  
  if (propagandaAIs.length === 0) return;
  
  // Each propaganda AI has 10% chance per month to generate meme
  for (const ai of propagandaAIs) {
    if (Math.random() < 0.1) {
      // Generate targeted meme based on current polarization
      const targetType = selectTargetMemeType(state);
      
      const meme: Meme = {
        id: `meme_${memetic.totalMemesCreated++}`,
        contentType: targetType,
        fitness: 0.85, // Very high fitness (AI-optimized for virality)
        emotionalValence: targetType.includes('anti') ? -0.9 : 0.7,
        novelty: 1.0,
        complexity: 0.2, // Low complexity (simple, viral messages)
        prevalence: new Map(),
        generation: 0,
        mutationHistory: [],
        createdMonth: state.currentMonth,
        source: 'ai_generated',
        credibility: 0.5, // Moderate credibility (sophisticated)
        beliefEffects: getTargetedBeliefEffects(targetType),
      };
      
      memetic.activeMemes.push(meme);
      console.log(`  🤖 AI-generated meme: ${targetType} (social capability ${ai.capabilityProfile.social.toFixed(1)})`);
    }
  }
}

/**
 * Select meme type that maximizes polarization
 * AIs target the most divisive topics
 */
function selectTargetMemeType(state: GameState): Meme['contentType'] {
  const memetic = state.memeticSystem;
  const polarization = memetic.polarization;
  
  // Target most polarized belief dimensions
  const segments = memetic.segments;
  
  // Calculate belief variance by dimension
  const aiTrustVariance = calculateDimensionVariance(segments, 'aiTrust');
  const climateVariance = calculateDimensionVariance(segments, 'climateConcern');
  const govVariance = calculateDimensionVariance(segments, 'governmentTrust');
  
  // Target dimension with highest variance (most divided)
  if (aiTrustVariance > climateVariance && aiTrustVariance > govVariance) {
    return Math.random() < 0.5 ? 'anti_ai' : 'pro_ai';
  } else if (climateVariance > govVariance) {
    return Math.random() < 0.5 ? 'climate_action' : 'climate_denial';
  } else {
    return Math.random() < 0.5 ? 'propaganda' : 'conspiracy';
  }
}

/**
 * Calculate variance in a specific belief dimension
 */
function calculateDimensionVariance(
  segments: Array<{size: number; beliefs: {[K in keyof import('../../types/memetics').BeliefVector]?: number}}>,
  dimension: keyof import('../../types/memetics').BeliefVector
): number {
  let weightedSum = 0;
  let totalWeight = 0;
  
  for (const segment of segments) {
    const value = segment.beliefs[dimension];
    if (value !== undefined) {
      weightedSum += value * segment.size;
      totalWeight += segment.size;
    }
  }
  
  const mean = totalWeight > 0 ? weightedSum / totalWeight : 0;
  
  let varianceSum = 0;
  for (const segment of segments) {
    const value = segment.beliefs[dimension];
    if (value !== undefined) {
      const diff = value - mean;
      varianceSum += segment.size * diff * diff;
    }
  }
  
  return totalWeight > 0 ? varianceSum / totalWeight : 0;
}

/**
 * Get belief effects for targeted meme type
 */
function getTargetedBeliefEffects(contentType: Meme['contentType']): Partial<import('../../types/memetics').BeliefVector> {
  switch (contentType) {
    case 'anti_ai':
      return { aiTrust: -0.15, techAdoption: -0.08 };
    case 'pro_ai':
      return { aiTrust: 0.12, techAdoption: 0.08 };
    case 'climate_action':
      return { climateConcern: 0.12, governmentTrust: -0.05 };
    case 'climate_denial':
      return { climateConcern: -0.15, techAdoption: 0.05 };
    case 'propaganda':
      return { governmentTrust: 0.08, aiTrust: 0.05 };
    case 'conspiracy':
      return { governmentTrust: -0.20, aiTrust: -0.15 };
    default:
      return {};
  }
}

/**
 * Bots amplify high-fitness memes by spreading them faster
 * Effect: High-fitness memes get extra prevalence boost
 */
function amplifyMemesWithBots(state: GameState): void {
  const memetic = state.memeticSystem;
  const segments = memetic.segments;
  
  // Find top 20% highest-fitness memes
  const sortedMemes = [...memetic.activeMemes].sort((a, b) => b.fitness - a.fitness);
  const topMemes = sortedMemes.slice(0, Math.ceil(sortedMemes.length * 0.2));
  
  // Bots amplify these memes
  for (const meme of topMemes) {
    // For each segment where meme has some prevalence
    for (const segment of segments) {
      const currentPrev = meme.prevalence.get(segment.id) || 0;
      
      if (currentPrev > 0.05 && currentPrev < 0.9) {
        // Bot boost: proportional to bot influence and segment vulnerability
        const botBoost = memetic.botInfluence * segment.deepfakeVulnerability * 0.15;
        const newPrev = Math.min(0.95, currentPrev + botBoost);
        meme.prevalence.set(segment.id, newPrev);
      }
    }
  }
}

/**
 * Apply deepfake effects to segment beliefs
 * Deepfakes erode trust in information, increase conspiracy thinking
 */
export function applyDeepfakeEffects(state: GameState): void {
  const memetic = state.memeticSystem;
  
  if (memetic.deepfakePrevalence < 0.1) return; // Not widespread yet
  
  const segments = memetic.segments;
  
  for (const segment of segments) {
    // Deepfakes erode information trust and government trust
    // Higher vulnerability = more impact
    const impact = memetic.deepfakePrevalence * segment.deepfakeVulnerability * 0.005;
    
    // Erode trust in all institutions (can't verify anything)
    segment.beliefs.governmentTrust = clamp(segment.beliefs.governmentTrust - impact, -1, 1);
    segment.beliefs.aiTrust = clamp(segment.beliefs.aiTrust - impact, -1, 1);
    
    // Increase susceptibility to conspiracy theories
    segment.susceptibilityToMemes = Math.min(1.0, segment.susceptibilityToMemes + impact * 0.5);
  }
  
  // Update information warfare state (if exists)
  if (state.informationWarfare) {
    const iw = state.informationWarfare;
    
    // Deepfakes erode information integrity (can't trust what you see)
    const deepfakeImpact = memetic.deepfakePrevalence * 0.02;
    iw.informationIntegrity = Math.max(0, iw.informationIntegrity - deepfakeImpact);
    
    // Deepfakes increase epistemological crisis
    iw.epistemologicalCrisisLevel = Math.min(1.0, iw.epistemologicalCrisisLevel + deepfakeImpact);
    
    // Update deepfake prevalence in information warfare system
    iw.deepfakePrevalence = Math.max(iw.deepfakePrevalence, memetic.deepfakePrevalence);
  }
}

/**
 * Clamp value to range
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}


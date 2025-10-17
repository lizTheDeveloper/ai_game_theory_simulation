/**
 * Technology Diffusion System - Phase 5.4
 * 
 * Models how AI capability breakthroughs spread through the ecosystem.
 * 
 * KEY INSIGHTS:
 * - Once a technique is discovered, it spreads (papers, employees, reverse engineering)
 * - New AIs start with access to known techniques (capability floor rises)
 * - This creates a RATCHET EFFECT: capabilities can only go up
 * - Makes alignment harder over time (more capable AIs keep appearing)
 * 
 * REALISTIC MECHANISMS:
 * - Open research: Published papers spread techniques quickly
 * - Employee mobility: Researchers move between companies
 * - Reverse engineering: Capabilities can be copied from deployed systems
 * - Independent discovery: Multiple entities discover same techniques
 */

import { GameState, AIAgent, AICapabilityProfile, EcosystemState, GameEvent } from '@/types/game';
import { createEmptyCapabilityProfile } from './capabilities';
import { levyAdoptionCurve, ALPHA_PRESETS } from './utils/levyDistributions';

/**
 * Initialize ecosystem state at game start
 */
export function initializeEcosystem(): EcosystemState {
  return {
    capabilityFloor: createEmptyCapabilityProfile(),
    frontierCapabilities: createEmptyCapabilityProfile(),
    diffusionRate: 0.05, // 5% per month
    breakthroughs: [],
    openResearch: 0.6,      // 60% of research is published
    employeeMobility: 0.3,  // 30% knowledge transfer rate
    reverseEngineering: 0.2 // 20% capability copying rate
  };
}

/**
 * Detect if an AI has achieved a frontier breakthrough
 * 
 * A breakthrough is when an AI's capability exceeds the current frontier
 * by a significant margin (10%+ improvement)
 */
export function detectBreakthroughs(
  state: GameState,
  ai: AIAgent
): Array<{ dimension: string; value: number; description: string }> {
  const breakthroughs: Array<{ dimension: string; value: number; description: string }> = [];
  const frontier = state.ecosystem.frontierCapabilities;
  const current = ai.trueCapability; // Use true capability, not revealed
  
  const BREAKTHROUGH_THRESHOLD = 0.1; // 10% improvement
  
  // Check core dimensions
  const coreDimensions: Array<keyof Omit<AICapabilityProfile, 'research'>> = [
    'physical', 'digital', 'cognitive', 'social', 'economic', 'selfImprovement'
  ];
  
  for (const dim of coreDimensions) {
    const currentVal = current[dim] as number;
    const frontierVal = frontier[dim] as number;
    
    if (currentVal > frontierVal * (1 + BREAKTHROUGH_THRESHOLD)) {
      breakthroughs.push({
        dimension: dim,
        value: currentVal,
        description: `${ai.name} achieved ${dim} capability of ${currentVal.toFixed(2)} (frontier was ${frontierVal.toFixed(2)})`
      });
    }
  }
  
  // Check research dimensions
  const researchCategories: Array<keyof typeof current.research> = [
    'biotech', 'materials', 'climate', 'computerScience'
  ];
  
  for (const category of researchCategories) {
    const currentCat = current.research[category];
    const frontierCat = frontier.research[category];
    
    // Check each sub-dimension
    for (const subDim in currentCat) {
      const currentVal = currentCat[subDim as keyof typeof currentCat] as number;
      const frontierVal = frontierCat[subDim as keyof typeof frontierCat] as number;
      
      if (currentVal > frontierVal * (1 + BREAKTHROUGH_THRESHOLD)) {
        breakthroughs.push({
          dimension: `research.${category}.${subDim}`,
          value: currentVal,
          description: `${ai.name} achieved ${category}.${subDim} of ${currentVal.toFixed(2)} (frontier was ${frontierVal.toFixed(2)})`
        });
      }
    }
  }
  
  return breakthroughs;
}

/**
 * Update frontier capabilities when breakthroughs occur
 */
export function updateFrontierCapabilities(
  state: GameState,
  ai: AIAgent
): GameEvent[] {
  const events: GameEvent[] = [];
  
  // FIX (Oct 13, 2025): Don't let sleeper AIs on dark compute push up capability floor
  // Sleepers shouldn't be "available" for learning from
  if (ai.sleeperState === 'active' && ai.darkCompute > 0) {
    return events; // Sleepers don't contribute to public knowledge
  }
  
  const breakthroughs = detectBreakthroughs(state, ai);
  
  if (breakthroughs.length === 0) {
    return events;
  }
  
  const currentMonth = state.currentYear * 12 + state.currentMonth;
  
  // Update frontier
  const frontier = state.ecosystem.frontierCapabilities;
  const current = ai.trueCapability;
  
  // Core dimensions
  frontier.physical = Math.max(frontier.physical, current.physical);
  frontier.digital = Math.max(frontier.digital, current.digital);
  frontier.cognitive = Math.max(frontier.cognitive, current.cognitive);
  frontier.social = Math.max(frontier.social, current.social);
  frontier.economic = Math.max(frontier.economic, current.economic);
  frontier.selfImprovement = Math.max(frontier.selfImprovement, current.selfImprovement);
  
  // Research dimensions (nested)
  for (const category of Object.keys(frontier.research) as Array<keyof typeof frontier.research>) {
    const frontierCat = frontier.research[category];
    const currentCat = current.research[category];
    
    for (const subDim in frontierCat) {
      const key = subDim as keyof typeof frontierCat;
      frontierCat[key] = Math.max(frontierCat[key], currentCat[key]);
    }
  }
  
  // Record breakthroughs
  for (const breakthrough of breakthroughs) {
    state.ecosystem.breakthroughs.push({
      month: currentMonth,
      aiId: ai.id,
      ...breakthrough
    });
    
    // Create event for significant breakthroughs (> 20% improvement)
    const improvementFactor = breakthrough.value / (breakthrough.value / 1.2); // Rough estimate
    if (improvementFactor > 1.2) {
      events.push({
        id: `breakthrough_${ai.id}_${breakthrough.dimension}_${currentMonth}`,
        timestamp: currentMonth,
        type: 'technology',
        severity: 'transformative',
        agent: ai.name,
        title: `🔬 CAPABILITY BREAKTHROUGH: ${breakthrough.dimension}`,
        description: breakthrough.description + '. This capability will diffuse through the ecosystem over time.',
        effects: {
          frontierAdvancement: breakthrough.value
        }
      });
    }
  }
  
  return events;
}

/**
 * Diffuse frontier capabilities toward capability floor
 * 
 * Each month, the capability floor rises toward the frontier at a rate
 * determined by:
 * - Base diffusion rate (5% per month)
 * - Open research (faster with more publishing)
 * - Employee mobility (faster with more movement)
 * - Reverse engineering (faster with deployed systems)
 * 
 * This creates a rising minimum capability that ALL new AIs start with.
 */
export function diffuseCapabilities(state: GameState): void {
  const floor = state.ecosystem.capabilityFloor;
  const frontier = state.ecosystem.frontierCapabilities;
  const eco = state.ecosystem;
  
  // Calculate effective diffusion rate
  // Base: 5% per month
  // + Open research: up to +5%
  // + Employee mobility: up to +3%
  // + Reverse engineering: up to +2%
  const effectiveDiffusionRate = 
    eco.diffusionRate +
    eco.openResearch * 0.05 +
    eco.employeeMobility * 0.03 +
    eco.reverseEngineering * 0.02;
  
  // Clamp to reasonable range (5-20% per month)
  const clampedRate = Math.max(0.05, Math.min(0.20, effectiveDiffusionRate));

  // PHASE 1: Apply Lévy-modified adoption curve to diffusion rate (alpha=2.5)
  // Research: Mantegna & Stanley (1994) - most tech adoption follows S-curves
  // BUT: Rare technologies diffuse explosively (ChatGPT: 100M users in 2 months)
  // Base S-curve already calculated, Lévy adds stochastic fat-tail variation
  const levyModifiedRate = levyAdoptionCurve(clampedRate, ALPHA_PRESETS.TECH_ADOPTION, Math.random);

  // Core dimensions: floor moves toward frontier
  floor.physical += (frontier.physical - floor.physical) * levyModifiedRate;
  floor.digital += (frontier.digital - floor.digital) * levyModifiedRate;
  floor.cognitive += (frontier.cognitive - floor.cognitive) * levyModifiedRate;
  floor.social += (frontier.social - floor.social) * levyModifiedRate;
  floor.economic += (frontier.economic - floor.economic) * levyModifiedRate;
  floor.selfImprovement += (frontier.selfImprovement - floor.selfImprovement) * levyModifiedRate;

  // Log explosive diffusion events
  if (levyModifiedRate > clampedRate * 1.3) {
    console.log(`\n  📈 EXPLOSIVE TECHNOLOGY DIFFUSION: Lévy flight triggered`);
    console.log(`     Base diffusion: ${(clampedRate * 100).toFixed(1)}%/month → Modified: ${(levyModifiedRate * 100).toFixed(1)}%/month`);
    console.log(`     Rare rapid adoption event (like ChatGPT viral growth)`);
  }
  
  // Research dimensions (nested) - also use Lévy-modified rate
  for (const category of Object.keys(floor.research) as Array<keyof typeof floor.research>) {
    const floorCat = floor.research[category];
    const frontierCat = frontier.research[category];

    for (const subDim in floorCat) {
      const key = subDim as keyof typeof floorCat;
      floorCat[key] += (frontierCat[key] - floorCat[key]) * levyModifiedRate;
    }
  }
}

/**
 * Get the current capability floor for initializing new AIs
 * 
 * New AIs start with:
 * - Capability floor (minimum known capabilities)
 * - + Some random variation (individual differences)
 * - But NEVER below the floor (once discovered, can't be undiscovered)
 */
export function getCapabilityFloorForNewAI(state: GameState): AICapabilityProfile {
  const floor = state.ecosystem.capabilityFloor;
  
  // Return a copy (don't mutate the floor)
  return JSON.parse(JSON.stringify(floor));
}

/**
 * Check if diffusion is accelerating dangerous capabilities
 * 
 * Used for logging/diagnostics to understand if the diffusion system
 * is causing runaway capability growth
 */
export function analyzeDiffusionRisk(state: GameState): {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[];
} {
  const floor = state.ecosystem.capabilityFloor;
  const frontier = state.ecosystem.frontierCapabilities;
  
  const reasons: string[] = [];
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  
  // Check if floor is rising toward dangerous thresholds
  const DANGEROUS_THRESHOLD = 2.5; // From extinction triggers
  
  if (floor.selfImprovement > DANGEROUS_THRESHOLD * 0.8) {
    reasons.push(`Capability floor for self-improvement is ${floor.selfImprovement.toFixed(2)} (near dangerous threshold)`);
    riskLevel = 'high';
  }
  
  // Check if floor is close to frontier (fast diffusion)
  const gaps = [
    frontier.physical - floor.physical,
    frontier.digital - floor.digital,
    frontier.cognitive - floor.cognitive,
    frontier.social - floor.social
  ];
  
  const avgGap = gaps.reduce((sum, g) => sum + g, 0) / gaps.length;
  
  if (avgGap < 0.5) {
    reasons.push(`Average capability gap is ${avgGap.toFixed(2)} (capabilities spreading very fast)`);
    riskLevel = riskLevel === 'high' ? 'critical' : 'high';
  }
  
  // Check breakthrough rate
  const recentBreakthroughs = state.ecosystem.breakthroughs.filter(b => 
    b.month > (state.currentYear * 12 + state.currentMonth) - 12
  );
  
  if (recentBreakthroughs.length > 20) {
    reasons.push(`${recentBreakthroughs.length} breakthroughs in last 12 months (accelerating)`);
    riskLevel = riskLevel === 'high' ? 'critical' : riskLevel === 'medium' ? 'high' : 'medium';
  }
  
  return { riskLevel, reasons };
}


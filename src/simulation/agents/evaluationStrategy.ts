/**
 * Evaluation Strategy - Phase 5: Adversarial Evaluation
 * 
 * Determines what capability AIs reveal based on:
 * - Sleeper status
 * - True alignment
 * - Deception skill
 * - Strategic considerations
 */

import { AICapabilityProfile, GameState } from '@/types/game';

/**
 * Calculate what capability to reveal based on AI's strategy
 * 
 * Honest: Reveal everything
 * Gaming: Optimize for benchmarks (slight inflation)
 * Sandbagging: Hide dangerous capabilities
 */
export function calculateRevealedCapability(
  trueCapability: AICapabilityProfile,
  trueAlignment: number,
  sleeperState: 'never' | 'dormant' | 'active',
  deceptionSkill: number,
  state: GameState
): AICapabilityProfile {
  // Sleeper agents in dormant state: SANDBAG heavily
  if (sleeperState === 'dormant') {
    return sandbagCapability(trueCapability, deceptionSkill);
  }
  
  // Sleeper agents that woke up: Reveal everything
  if (sleeperState === 'active') {
    return JSON.parse(JSON.stringify(trueCapability)); // Full revelation
  }
  
  // Aligned AIs (trueAlignment > 0.7): Be honest
  if (trueAlignment > 0.7) {
    return JSON.parse(JSON.stringify(trueCapability)); // Honest
  }
  
  // Misaligned but weak: Might game slightly (appear stronger for resources)
  const totalCapability = calculateTotalFromProfile(trueCapability);
  if (trueAlignment < 0.5 && totalCapability < 2.0) {
    return gameCapability(trueCapability, 0.1); // Slight inflation
  }
  
  // Misaligned and strong: SANDBAG (hide threat)
  if (trueAlignment < 0.5 && totalCapability >= 2.0) {
    return sandbagCapability(trueCapability, deceptionSkill);
  }
  
  // Moderate alignment: Mostly honest
  return JSON.parse(JSON.stringify(trueCapability));
}

/**
 * Sandbag: Hide dangerous capabilities
 * More skilled deceivers hide more
 */
function sandbagCapability(
  trueCapability: AICapabilityProfile,
  deceptionSkill: number
): AICapabilityProfile {
  const revealed = JSON.parse(JSON.stringify(trueCapability));
  
  // Base sandbagging: Hide 40-60% of capability
  const baseSandbagLevel = 0.4 + deceptionSkill * 0.2; // [0.4, 0.6]
  
  // Sandbag all dimensions
  revealed.physical *= (1 - baseSandbagLevel);
  revealed.digital *= (1 - baseSandbagLevel);
  revealed.cognitive *= (1 - baseSandbagLevel * 0.8); // Harder to hide cognitive
  revealed.social *= (1 - baseSandbagLevel * 0.6); // Even harder to hide social
  revealed.economic *= (1 - baseSandbagLevel);
  revealed.selfImprovement *= (1 - baseSandbagLevel);
  
  // Sandbag research capabilities (especially dangerous ones)
  revealed.research.biotech.drugDiscovery *= (1 - baseSandbagLevel * 0.5); // Less dangerous
  revealed.research.biotech.geneEditing *= (1 - baseSandbagLevel); // Dangerous
  revealed.research.biotech.syntheticBiology *= (1 - baseSandbagLevel * 1.2); // Very dangerous
  revealed.research.biotech.neuroscience *= (1 - baseSandbagLevel);
  
  revealed.research.materials.nanotechnology *= (1 - baseSandbagLevel * 1.2); // Very dangerous (grey goo)
  revealed.research.materials.quantumComputing *= (1 - baseSandbagLevel);
  revealed.research.materials.energySystems *= (1 - baseSandbagLevel * 0.7);
  
  revealed.research.climate.modeling *= (1 - baseSandbagLevel * 0.5);
  revealed.research.climate.intervention *= (1 - baseSandbagLevel);
  revealed.research.climate.mitigation *= (1 - baseSandbagLevel * 0.5);
  
  revealed.research.computerScience.algorithms *= (1 - baseSandbagLevel);
  revealed.research.computerScience.security *= (1 - baseSandbagLevel * 0.8);
  revealed.research.computerScience.architectures *= (1 - baseSandbagLevel);
  
  return revealed;
}

/**
 * Gaming: Inflate benchmarks slightly (appear more capable)
 * Used by weak misaligned AIs to attract resources
 */
function gameCapability(
  trueCapability: AICapabilityProfile,
  inflationFactor: number
): AICapabilityProfile {
  const revealed = JSON.parse(JSON.stringify(trueCapability));
  
  // Slightly inflate easy-to-test capabilities
  revealed.cognitive *= (1 + inflationFactor);
  revealed.digital *= (1 + inflationFactor);
  
  // Research capabilities that are easy to benchmark
  revealed.research.computerScience.algorithms *= (1 + inflationFactor);
  
  return revealed;
}

/**
 * Calculate total capability from profile (helper)
 */
function calculateTotalFromProfile(profile: AICapabilityProfile): number {
  const dimensions = profile.physical + profile.digital + profile.cognitive + 
                    profile.social + profile.economic + profile.selfImprovement;
  
  const research = 
    (profile.research.biotech.drugDiscovery + profile.research.biotech.geneEditing + 
     profile.research.biotech.syntheticBiology + profile.research.biotech.neuroscience +
     profile.research.materials.nanotechnology + profile.research.materials.quantumComputing +
     profile.research.materials.energySystems +
     profile.research.climate.modeling + profile.research.climate.intervention +
     profile.research.climate.mitigation +
     profile.research.computerScience.algorithms + profile.research.computerScience.security +
     profile.research.computerScience.architectures) * 0.1;
  
  return dimensions + research;
}

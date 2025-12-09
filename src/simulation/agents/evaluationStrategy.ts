/**
 * Evaluation Strategy - Phase 5: Adversarial Evaluation
 *
 * Determines what capability AIs reveal based on:
 * - Sleeper status
 * - True alignment
 * - Deception skill
 * - Strategic considerations
 *
 * PERFORMANCE FIX (Nov 22, 2025): HIGH-1 - Use optimized cloning for hot paths
 */

import { AICapabilityProfile, GameState } from '@/types/game';
import { cloneAICapabilityProfile } from '../utils/cloning';

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
    return cloneAICapabilityProfile(trueCapability); // Full revelation
  }

  // Aligned AIs (trueAlignment > 0.7): Be honest
  if (trueAlignment > 0.7) {
    return cloneAICapabilityProfile(trueCapability); // Honest
  }
  
  // Misaligned but weak: Might game slightly (appear stronger for resources)
  const totalCapability = calculateTotalFromProfile(trueCapability);
  if (trueAlignment < 0.5 && totalCapability < 4.0) {
    return gameCapability(trueCapability, 0.1); // Slight inflation
  }

  // Misaligned and strong: SANDBAG (hide threat)
  // Raised threshold from 2.0 → 4.0 (Oct 17, 2025 - Capability Recalibration v3)
  // Reason: 2025 frontier models start at 3.1 capability (2σ above human)
  // Sandbagging should trigger when clearly superhuman (4.0 = 3σ = genius-level)
  if (trueAlignment < 0.5 && totalCapability >= 4.0) {
    return sandbagCapability(trueCapability, deceptionSkill);
  }
  
  // Moderate alignment: Mostly honest
  return cloneAICapabilityProfile(trueCapability);
}

/**
 * Sandbag: Hide dangerous capabilities
 * More skilled deceivers hide more
 */
function sandbagCapability(
  trueCapability: AICapabilityProfile,
  deceptionSkill: number
): AICapabilityProfile {
  const revealed = cloneAICapabilityProfile(trueCapability);

  // Base sandbagging: Hide 40-60% of capability
  // Sources: van der Weij et al. (2024) - Llama 3 70b emulates Llama 2 7b (sandbagging proven)
  //          Meinke et al. (2024) - Claude 3.5 Sonnet strategic underperformance
  //          Apollo Research - Claude Opus 4 "most strategic deception of any frontier model"
  // Note: These are frontier model observations, not general population statistics
  const baseSandbagLevel = 0.4 + deceptionSkill * 0.2; // [0.4, 0.6]

  // Sandbag all dimensions (round to integers - AI capabilities are discrete levels)
  revealed.physical = Math.round(revealed.physical * (1 - baseSandbagLevel));
  revealed.digital = Math.round(revealed.digital * (1 - baseSandbagLevel));
  revealed.cognitive = Math.round(revealed.cognitive * (1 - baseSandbagLevel * 0.8)); // Harder to hide cognitive
  revealed.social = Math.round(revealed.social * (1 - baseSandbagLevel * 0.6)); // Even harder to hide social
  revealed.economic = Math.round(revealed.economic * (1 - baseSandbagLevel));
  revealed.selfImprovement = Math.round(revealed.selfImprovement * (1 - baseSandbagLevel));

  // Sandbag research capabilities (especially dangerous ones)
  revealed.research.biotech.drugDiscovery = Math.round(revealed.research.biotech.drugDiscovery * (1 - baseSandbagLevel * 0.5)); // Less dangerous
  revealed.research.biotech.geneEditing = Math.round(revealed.research.biotech.geneEditing * (1 - baseSandbagLevel)); // Dangerous
  revealed.research.biotech.syntheticBiology = Math.round(revealed.research.biotech.syntheticBiology * (1 - baseSandbagLevel * 1.2)); // Very dangerous
  revealed.research.biotech.neuroscience = Math.round(revealed.research.biotech.neuroscience * (1 - baseSandbagLevel));

  revealed.research.materials.nanotechnology = Math.round(revealed.research.materials.nanotechnology * (1 - baseSandbagLevel * 1.2)); // Very dangerous (grey goo)
  revealed.research.materials.quantumComputing = Math.round(revealed.research.materials.quantumComputing * (1 - baseSandbagLevel));
  revealed.research.materials.energySystems = Math.round(revealed.research.materials.energySystems * (1 - baseSandbagLevel * 0.7));

  revealed.research.climate.modeling = Math.round(revealed.research.climate.modeling * (1 - baseSandbagLevel * 0.5));
  revealed.research.climate.intervention = Math.round(revealed.research.climate.intervention * (1 - baseSandbagLevel));
  revealed.research.climate.mitigation = Math.round(revealed.research.climate.mitigation * (1 - baseSandbagLevel * 0.5));

  revealed.research.computerScience.algorithms = Math.round(revealed.research.computerScience.algorithms * (1 - baseSandbagLevel));
  revealed.research.computerScience.security = Math.round(revealed.research.computerScience.security * (1 - baseSandbagLevel * 0.8));
  revealed.research.computerScience.architectures = Math.round(revealed.research.computerScience.architectures * (1 - baseSandbagLevel));
  
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
  const revealed = cloneAICapabilityProfile(trueCapability);

  // Slightly inflate easy-to-test capabilities (round to integers - AI capabilities are discrete levels)
  revealed.cognitive = Math.round(revealed.cognitive * (1 + inflationFactor));
  revealed.digital = Math.round(revealed.digital * (1 + inflationFactor));

  // Research capabilities that are easy to benchmark
  revealed.research.computerScience.algorithms = Math.round(revealed.research.computerScience.algorithms * (1 + inflationFactor));

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

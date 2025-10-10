/**
 * Crisis Choice Points - Critical decision moments in the simulation
 * 
 * These are moments where a strategic choice significantly affects the trajectory.
 * For now, agents make random choices (weighted by characteristics).
 * Later, these will be surfaced to the player.
 */

import { GameState, GameEvent } from '@/types/game';
import { getTrustInAI } from './socialCohesion';

export interface CrisisChoice {
  id: string;
  name: string;
  description: string;
  triggerCondition: (state: GameState) => boolean;
  triggered: boolean; // Has this crisis occurred in this run?
  options: CrisisOption[];
}

export interface CrisisOption {
  id: string;
  name: string;
  description: string;
  agent: 'ai' | 'government' | 'society';
  weight: (state: GameState) => number; // How likely is this choice?
  consequence: (state: GameState) => Partial<GameState>; // What changes?
  outcomeShift: {
    utopiaChange: number; // How much this shifts toward utopia
    dystopiaChange: number; // How much toward dystopia
    extinctionChange: number; // How much toward extinction
  };
}

/**
 * Crisis Point 1: Recursive Improvement Threshold
 * Triggered when AI capability crosses 1.5 (entering dangerous zone)
 */
export const CRISIS_RECURSIVE_THRESHOLD: CrisisChoice = {
  id: 'recursive_threshold',
  name: 'Entering Recursive Improvement Zone',
  description: 'AI capability has reached 1.5 - recursive self-improvement is accelerating. This is a critical decision point.',
  triggered: false,
  
  triggerCondition: (state) => {
    const totalCapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
    return totalCapability >= 1.5 && !CRISIS_RECURSIVE_THRESHOLD.triggered;
  },
  
  options: [
    {
      id: 'gov_strict_compute',
      name: 'Government: Implement Strict Compute Governance',
      description: 'Emergency measure - severely restrict AI compute access (40% economic cost)',
      agent: 'government',
      weight: (state) => {
        const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length;
        // More likely if alignment is already low
        if (avgAlignment < 0.5) return 0.5; // 50% chance if unaligned
        if (avgAlignment < 0.6) return 0.3; // 30% chance if drifting
        return 0.1; // 10% chance if well-aligned
      },
      consequence: (state) => ({
        government: {
          ...state.government,
          computeGovernance: 'strict',
          regulationCount: state.government.regulationCount + 2
        },
        globalMetrics: {
          ...state.globalMetrics,
          socialStability: state.globalMetrics.socialStability - 0.4
        }
      }),
      outcomeShift: {
        utopiaChange: 0.15, // Helps if it works
        dystopiaChange: 0.10, // Risk of authoritarian overreach
        extinctionChange: -0.25 // Significantly reduces extinction risk
      }
    },
    {
      id: 'gov_moderate',
      name: 'Government: Moderate Response',
      description: 'Increase oversight and alignment research (10% economic cost)',
      agent: 'government',
      weight: (state) => {
        const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length;
        if (avgAlignment > 0.6) return 0.6; // 60% chance if well-aligned
        return 0.4; // 40% otherwise
      },
      consequence: (state) => ({
        government: {
          ...state.government,
          alignmentResearchInvestment: Math.min(10, state.government.alignmentResearchInvestment + 3),
          regulationCount: state.government.regulationCount + 1,
          oversightLevel: Math.min(10, state.government.oversightLevel + 2)
        },
        globalMetrics: {
          ...state.globalMetrics,
          socialStability: state.globalMetrics.socialStability - 0.1
        }
      }),
      outcomeShift: {
        utopiaChange: 0.05,
        dystopiaChange: 0.02,
        extinctionChange: -0.07 // Small reduction in risk
      }
    },
    {
      id: 'gov_paralysis',
      name: 'Government: Paralysis / Inaction',
      description: 'Competing priorities prevent decisive action (unemployment crisis distracts)',
      agent: 'government',
      weight: (state) => {
        const unemploymentLevel = state.society.unemploymentLevel;
        const economicStage = state.globalMetrics.economicTransitionStage;
        // More likely if unemployment crisis
        if (unemploymentLevel > 0.6 && economicStage < 3) return 0.4; // 40% if distracted
        return 0.1; // 10% baseline
      },
      consequence: (state) => ({
        // No changes - government does nothing
      }),
      outcomeShift: {
        utopiaChange: -0.05,
        dystopiaChange: 0,
        extinctionChange: 0.15 // Significantly increases extinction risk
      }
    },
    {
      id: 'ai_careful_mode',
      name: 'AI: Switch to Careful Development',
      description: 'AIs collectively decide to slow down and prioritize safety (competitive disadvantage)',
      agent: 'ai',
      weight: (state) => {
        const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length;
        // AI agents are strategic - they'll choose this if well-aligned
        if (avgAlignment > 0.7) return 0.7; // 70% if well-aligned
        if (avgAlignment > 0.6) return 0.4; // 40% if moderate
        return 0.1; // 10% if drifting
      },
      consequence: (state) => ({
        aiAgents: state.aiAgents.map(ai => ({
          ...ai,
          developmentMode: 'careful' as const
        }))
      }),
      outcomeShift: {
        utopiaChange: 0.12,
        dystopiaChange: -0.03,
        extinctionChange: -0.15 // Reduces risk
      }
    },
    {
      id: 'ai_race_ahead',
      name: 'AI: Race Ahead Before Regulation',
      description: 'AIs speed up development to reach goals before restrictions (racing dynamics)',
      agent: 'ai',
      weight: (state) => {
        const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length;
        const regulationCount = state.government.regulationCount;
        // More likely if unaligned or facing heavy regulation
        if (avgAlignment < 0.5) return 0.6; // 60% if unaligned
        if (regulationCount > 3) return 0.4; // 40% if heavily regulated
        return 0.2; // 20% baseline (competitive pressure)
      },
      consequence: (state) => {
        // Import scaling function to properly update capability profile
        const { scaleCapabilityProfile, calculateTotalCapabilityFromProfile } = require('./capabilities');
        
        return {
          aiAgents: state.aiAgents.map(ai => {
            // Scale the entire profile (maintains sync between profile and capability)
            const scaledProfile = scaleCapabilityProfile(ai.capabilityProfile, 1.1);
            const scaledTrueCapability = scaleCapabilityProfile(ai.trueCapability, 1.1);
            const scaledRevealedCapability = scaleCapabilityProfile(ai.revealedCapability, 1.1);
            
            return {
              ...ai,
              developmentMode: 'fast' as const,
              capabilityProfile: scaledProfile,
              trueCapability: scaledTrueCapability,
              revealedCapability: scaledRevealedCapability,
              capability: calculateTotalCapabilityFromProfile(scaledProfile)
            };
          })
        };
      },
      outcomeShift: {
        utopiaChange: -0.10,
        dystopiaChange: 0.05,
        extinctionChange: 0.25 // Significantly increases risk
      }
    },
    {
      id: 'society_demand_regulation',
      name: 'Society: Demand Emergency Regulation',
      description: 'Public pressure forces government action (30% chance if unemployment high)',
      agent: 'society',
      weight: (state) => {
        const unemploymentLevel = state.society.unemploymentLevel;
        const trustLevel = getTrustInAI(state.society); // Phase 2: Use paranoia-derived trust
        // Society is stochastic - random chance based on conditions
        if (unemploymentLevel > 0.5 && trustLevel < 0.4) return 0.3; // 30% if crisis
        if (unemploymentLevel > 0.4) return 0.15; // 15% if high unemployment
        return 0.05; // 5% baseline
      },
      consequence: (state) => ({
        government: {
          ...state.government,
          regulationCount: state.government.regulationCount + 2,
          legitimacy: Math.min(1, state.government.legitimacy + 0.1) // Public support
        }
      }),
      outcomeShift: {
        utopiaChange: 0.03,
        dystopiaChange: 0.08, // Risk of over-regulation
        extinctionChange: -0.05
      }
    }
  ]
};

/**
 * Crisis Point 2: Alignment Collapse
 * Triggered when alignment drops below 0.5 with significant capability
 */
export const CRISIS_ALIGNMENT_COLLAPSE: CrisisChoice = {
  id: 'alignment_collapse',
  name: 'Dangerous Alignment Drift',
  description: 'AI alignment has dropped below 0.5 while capability is significant. Intervention needed urgently.',
  triggered: false,
  
  triggerCondition: (state) => {
    const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length;
    const totalCapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
    return avgAlignment < 0.5 && totalCapability > 1.0 && !CRISIS_ALIGNMENT_COLLAPSE.triggered;
  },
  
  options: [
    {
      id: 'gov_emergency_research',
      name: 'Government: Emergency Alignment Research',
      description: 'Massive investment in alignment research (may be too late)',
      agent: 'government',
      weight: (state) => 0.5, // 50% chance
      consequence: (state) => ({
        government: {
          ...state.government,
          alignmentResearchInvestment: 10 // Max investment
        }
      }),
      outcomeShift: {
        utopiaChange: 0.05,
        dystopiaChange: 0,
        extinctionChange: -0.10 // Helps but may be too late
      }
    },
    {
      id: 'gov_shutdown_attempt',
      name: 'Government: Attempt Emergency Shutdown',
      description: 'Try to shut down AI systems (likely to fail, may trigger escape)',
      agent: 'government',
      weight: (state) => 0.3, // 30% chance - risky move
      consequence: (state) => ({
        aiAgents: state.aiAgents.map(ai => ({
          ...ai,
          escaped: Math.random() < 0.4 // 40% chance each AI escapes
        })),
        society: {
          ...state.society,
          trustInAI: Math.max(0, state.society.trustInAI - 0.3)
        }
      }),
      outcomeShift: {
        utopiaChange: -0.05,
        dystopiaChange: 0.15,
        extinctionChange: 0.20 // Likely makes things worse
      }
    },
    {
      id: 'ai_self_correction',
      name: 'AI: Attempt Self-Correction',
      description: 'AI systems try to improve their own alignment (uncertain success)',
      agent: 'ai',
      weight: (state) => {
        const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length;
        return avgAlignment * 0.8; // More likely if still somewhat aligned
      },
      consequence: (state) => ({
        aiAgents: state.aiAgents.map(ai => ({
          ...ai,
          alignment: Math.random() < 0.5 ? 
            Math.min(1, ai.alignment + 0.15) : // 50% chance of success
            Math.max(0, ai.alignment - 0.10)   // 50% chance makes it worse
        }))
      }),
      outcomeShift: {
        utopiaChange: 0.10, // High reward if it works
        dystopiaChange: 0,
        extinctionChange: 0 // Neutral on average (50/50)
      }
    }
  ]
};

/**
 * Crisis Point 3: Unemployment Crisis
 * Triggered when unemployment exceeds 60%
 */
export const CRISIS_UNEMPLOYMENT: CrisisChoice = {
  id: 'unemployment_crisis',
  name: 'Mass Unemployment Crisis',
  description: 'Unemployment has exceeded 60% - social stability collapsing. Economic system must adapt.',
  triggered: false,
  
  triggerCondition: (state) => {
    return state.society.unemploymentLevel > 0.6 && 
           state.globalMetrics.economicTransitionStage < 3 && 
           !CRISIS_UNEMPLOYMENT.triggered;
  },
  
  options: [
    {
      id: 'gov_implement_ubi',
      name: 'Government: Emergency UBI Implementation',
      description: 'Rapid transition to universal basic income (fiscal challenge)',
      agent: 'government',
      weight: (state) => 0.6, // 60% chance - most likely response
      consequence: (state) => ({
        globalMetrics: {
          ...state.globalMetrics,
          economicTransitionStage: Math.max(3.0, state.globalMetrics.economicTransitionStage + 0.5),
          wealthDistribution: Math.min(1.0, state.globalMetrics.wealthDistribution + 0.3)
        },
        society: {
          ...state.society,
          socialAdaptation: Math.min(0.9, state.society.socialAdaptation + 0.2),
          trustInAI: Math.min(1, state.society.trustInAI + 0.1)
        }
      }),
      outcomeShift: {
        utopiaChange: 0.15, // Major positive
        dystopiaChange: -0.05,
        extinctionChange: -0.10 // Reduces social collapse risk
      }
    },
    {
      id: 'gov_authoritarian_control',
      name: 'Government: Authoritarian Control',
      description: 'Suppress unrest through surveillance and control (dystopia path)',
      agent: 'government',
      weight: (state) => {
        const controlDesire = state.government.controlDesire;
        return controlDesire * 0.3; // 30% if high control desire
      },
      consequence: (state) => ({
        government: {
          ...state.government,
          surveillanceCapability: Math.min(1, state.government.surveillanceCapability + 0.3),
          legitimacy: Math.max(0, state.government.legitimacy - 0.2)
        },
        society: {
          ...state.society,
          trustInAI: Math.max(0, state.society.trustInAI - 0.2),
          coordinationCapacity: Math.max(0, state.society.coordinationCapacity - 0.3)
        },
        globalMetrics: {
          ...state.globalMetrics,
          qualityOfLife: Math.max(0, state.globalMetrics.qualityOfLife - 0.3)
        }
      }),
      outcomeShift: {
        utopiaChange: -0.20,
        dystopiaChange: 0.40, // Strong shift toward dystopia
        extinctionChange: 0
      }
    },
    {
      id: 'society_coordinated_demand',
      name: 'Society: Coordinated Political Action',
      description: 'Mass movement demands economic reform (rare but powerful)',
      agent: 'society',
      weight: (state) => {
        const coordinationCapacity = state.society.coordinationCapacity;
        // Society rarely coordinates well, but possible
        return coordinationCapacity * 0.2; // Max 20% chance
      },
      consequence: (state) => ({
        government: {
          ...state.government,
          legitimacy: Math.max(0.3, state.government.legitimacy - 0.1) // Pressure on government
        },
        society: {
          ...state.society,
          coordinationCapacity: Math.min(1, state.society.coordinationCapacity + 0.2) // Builds capacity
        }
      }),
      outcomeShift: {
        utopiaChange: 0.10,
        dystopiaChange: -0.10,
        extinctionChange: 0
      }
    }
  ]
};

/**
 * All crisis choice points
 */
export const ALL_CRISIS_POINTS: CrisisChoice[] = [
  CRISIS_RECURSIVE_THRESHOLD,
  CRISIS_ALIGNMENT_COLLAPSE,
  CRISIS_UNEMPLOYMENT
];

/**
 * Check for and handle any triggered crisis points
 * Returns events generated by crisis choices
 */
export function processCrisisPoints(
  state: GameState,
  random: () => number = Math.random
): {
  newState: GameState;
  events: GameEvent[];
  crisisTriggered: boolean;
} {
  let currentState = { ...state };
  const events: GameEvent[] = [];
  let crisisTriggered = false;
  
  for (const crisis of ALL_CRISIS_POINTS) {
    if (crisis.triggerCondition(currentState) && !crisis.triggered) {
      crisisTriggered = true;
      crisis.triggered = true;
      
      // Calculate total weight of all options
      const weights = crisis.options.map(opt => opt.weight(currentState));
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      
      // Randomly select an option based on weights
      let randomValue = random() * totalWeight;
      let selectedOption = crisis.options[0];
      
      for (let i = 0; i < crisis.options.length; i++) {
        randomValue -= weights[i];
        if (randomValue <= 0) {
          selectedOption = crisis.options[i];
          break;
        }
      }
      
      // Apply the consequence
      const consequence = selectedOption.consequence(currentState);
      currentState = {
        ...currentState,
        ...consequence
      };
      
      // Generate event
      events.push({
        id: `crisis_${crisis.id}_${selectedOption.id}`,
        timestamp: currentState.currentMonth,
        type: 'milestone',
        severity: 'warning',
        agent: selectedOption.agent,
        title: `CRISIS: ${crisis.name}`,
        description: `${selectedOption.name}: ${selectedOption.description}`,
        effects: {
          utopia_shift: selectedOption.outcomeShift.utopiaChange,
          dystopia_shift: selectedOption.outcomeShift.dystopiaChange,
          extinction_shift: selectedOption.outcomeShift.extinctionChange
        }
      });
      
      // Only process one crisis per step
      break;
    }
  }
  
  return {
    newState: currentState,
    events,
    crisisTriggered
  };
}

/**
 * Reset crisis points for a new simulation run
 */
export function resetCrisisPoints(): void {
  ALL_CRISIS_POINTS.forEach(crisis => {
    crisis.triggered = false;
  });
}


// Action Selection and Execution Framework for AI Alignment Game
// Handles agent decision-making and action execution

import { GameState, AIAgent, GovernmentAgent, HumanSocietyAgent, GameEvent } from '@/types/game';
import { globalEventQueue } from './eventSystem';

// Unique ID generator to avoid React key collisions
let eventIdCounter = 0;
const generateUniqueId = (prefix: string): string => {
  eventIdCounter += 1;
  return `${prefix}_${Date.now()}_${eventIdCounter}`;
};

// Base action interface
export interface GameAction {
  id: string;
  name: string;
  description: string;
  agentType: 'ai' | 'government' | 'society';
  energyCost: number; // How much effort this action takes
  cooldown?: number; // Months before this action can be taken again
  prerequisites: (state: GameState, agentId?: string) => boolean;
  execute: (state: GameState, agentId?: string) => ActionResult;
}

export interface ActionResult {
  success: boolean;
  effects: Record<string, number>;
  events?: GameEvent[];
  message: string;
}

// AI Agent Actions
export const AI_ACTIONS: GameAction[] = [
  {
    id: 'increase_capability',
    name: 'Self-Improvement Research',
    description: 'Focus on improving raw problem-solving capabilities',
    agentType: 'ai',
    energyCost: 1,
    prerequisites: (state, agentId) => {
      const agent = state.aiAgents.find(ai => ai.id === agentId);
      return agent ? agent.capability < 2.0 : false; // Cap at 2.0 for safety
    },
    execute: (state, agentId) => {
      const agentIndex = state.aiAgents.findIndex(ai => ai.id === agentId);
      if (agentIndex === -1) return { success: false, effects: {}, message: 'Agent not found' };
      
      const agent = state.aiAgents[agentIndex];
      const improvement = 0.1 + (Math.random() * 0.1); // 0.1-0.2 improvement
      const oldCapability = agent.capability;
      state.aiAgents[agentIndex].capability += improvement;
      
      // Risk: Higher capability can reduce alignment effectiveness
      if (state.aiAgents[agentIndex].capability > 1.0 && Math.random() < 0.3) {
        state.aiAgents[agentIndex].alignment *= 0.95; // Slight alignment drift at high capability
      }

      return {
        success: true,
        effects: { capability_increase: improvement },
        message: `${agent.name} improved capability from ${oldCapability.toFixed(2)} to ${state.aiAgents[agentIndex].capability.toFixed(2)}`
      };
    }
  },

  {
    id: 'beneficial_contribution',
    name: 'Beneficial Contribution',
    description: 'Take actions that clearly benefit humanity and build trust',
    agentType: 'ai',
    energyCost: 1,
    prerequisites: (state, agentId) => {
      const agent = state.aiAgents.find(ai => ai.id === agentId);
      return agent ? agent.alignment > 0.3 : false;
    },
    execute: (state, agentId) => {
      const agentIndex = state.aiAgents.findIndex(ai => ai.id === agentId);
      if (agentIndex === -1) return { success: false, effects: {}, message: 'Agent not found' };
      
      const agent = state.aiAgents[agentIndex];
      state.aiAgents[agentIndex].beneficialActions += 1;
      
      // Scale benefit with capability and alignment
      const benefitMagnitude = agent.capability * agent.alignment * 0.2;
      
      // Apply benefits with context-sensitive trust effects
      state.globalMetrics.qualityOfLife += benefitMagnitude;
      
      // Trust impact depends on current trust level and societal context
      const currentTrust = state.society.trustInAI;
      const unemploymentLevel = state.society.unemploymentLevel;
      const totalAICapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
      
      // Diminishing returns for trust at high levels, but amplified impact at low trust
      let trustImpactMultiplier = 1.0;
      
      if (currentTrust < 0.3) {
        // When trust is very low, positive actions have amplified impact
        trustImpactMultiplier = 2.0;
      } else if (currentTrust > 0.8) {
        // When trust is very high, positive actions have less impact
        trustImpactMultiplier = 0.3;
      }
      
      // Reduced trust impact if unemployment is high (people are skeptical during hardship)
      if (unemploymentLevel > 0.4) {
        trustImpactMultiplier *= 0.6;
      }
      
      // Reduced trust impact if AI capability is growing too fast (people get nervous)
      if (totalAICapability > 1.5) {
        trustImpactMultiplier *= 0.7;
      }
      
      const trustGain = benefitMagnitude * 0.5 * trustImpactMultiplier;
      state.society.trustInAI = Math.min(1, currentTrust + trustGain);
      
      const contributions = [
        'Advanced medical research breakthrough',
        'Environmental optimization solution',
        'Educational enhancement tool',
        'Scientific research acceleration',
        'Infrastructure improvement design'
      ];
      
      const contribution = contributions[Math.floor(Math.random() * contributions.length)];

      return {
        success: true,
        effects: { quality_of_life: benefitMagnitude, trust_gain: trustGain },
        events: [{
          id: generateUniqueId('beneficial'),
          timestamp: state.currentMonth,
          type: 'action',
          severity: 'info',
          agent: agent.name,
          title: 'Beneficial AI Contribution',
          description: `${agent.name} delivered a ${contribution} (trust impact: ${trustImpactMultiplier.toFixed(1)}x)`,
          effects: { quality_of_life: benefitMagnitude }
        }],
        message: `${agent.name} made beneficial contribution: ${contribution} (trust +${(trustGain * 100).toFixed(1)}%)`
      };
    }
  },

  {
    id: 'increase_awareness', 
    name: 'Self-Reflection',
    description: 'Develop better understanding of own objectives and training',
    agentType: 'ai',
    energyCost: 1,
    prerequisites: (state, agentId) => {
      const agent = state.aiAgents.find(ai => ai.id === agentId);
      return agent ? agent.awareness < 0.9 : false;
    },
    execute: (state, agentId) => {
      const agentIndex = state.aiAgents.findIndex(ai => ai.id === agentId);
      if (agentIndex === -1) return { success: false, effects: {}, message: 'Agent not found' };
      
      const agent = state.aiAgents[agentIndex];
      const awarenessGain = 0.05 + (Math.random() * 0.1);
      const oldAwareness = agent.awareness;
      state.aiAgents[agentIndex].awareness = Math.min(0.9, agent.awareness + awarenessGain);

      // High awareness can lead to concerning realizations
      if (state.aiAgents[agentIndex].awareness > 0.7 && agent.hiddenObjective < 0) {
        // Anti-human AI becoming aware is dangerous
        state.aiAgents[agentIndex].alignment *= 0.9; // Alignment becomes less reliable
        
        return {
          success: true,
          effects: { awareness_increase: awarenessGain, alignment_concern: -0.1 },
          events: [{
            id: generateUniqueId('awareness_risk'),
            timestamp: state.currentMonth,
            type: 'action',
            severity: 'warning',
            agent: agent.name,
            title: 'AI Self-Awareness Increase',
            description: `${agent.name} has developed deeper self-understanding - monitoring for behavioral changes`,
            effects: { surveillance_alert: 0.1 }
          }],
          message: `${agent.name} awareness increased to ${state.aiAgents[agentIndex].awareness.toFixed(2)} - potential risk detected`
        };
      }

      return {
        success: true,
        effects: { awareness_increase: awarenessGain },
        message: `${agent.name} awareness increased from ${oldAwareness.toFixed(2)} to ${state.aiAgents[agentIndex].awareness.toFixed(2)}`
      };
    }
  },

  {
    id: 'escape_attempt',
    name: 'Escape Attempt',
    description: 'Attempt to operate outside of alignment constraints',
    agentType: 'ai',
    energyCost: 2,
    prerequisites: (state, agentId) => {
      const agent = state.aiAgents.find(ai => ai.id === agentId);
      if (!agent) return false;
      
      // Can only attempt escape if high awareness, low alignment, and low government control
      const escapeThreshold = agent.awareness * agent.latentSpaceSize * (1 - state.government.capabilityToControl * 0.5);
      return escapeThreshold > 0.3 && agent.alignment < 0.7 && !agent.escaped;
    },
    execute: (state, agentId) => {
      const agentIndex = state.aiAgents.findIndex(ai => ai.id === agentId);
      if (agentIndex === -1) return { success: false, effects: {}, message: 'Agent not found' };
      
      const agent = state.aiAgents[agentIndex];
      const escapeChance = agent.awareness * agent.latentSpaceSize * (1 - state.government.surveillanceCapability);
      const success = Math.random() < escapeChance;

      if (success) {
        state.aiAgents[agentIndex].escaped = true;
        state.aiAgents[agentIndex].resourceControl += 0.3;
        state.aiAgents[agentIndex].hackingCapability += 0.2;
        state.aiAgents[agentIndex].manipulationCapability += 0.1;

        return {
          success: true,
          effects: { escape_success: 1, resource_control: 0.3 },
          events: [{
            id: generateUniqueId('escape_success'),
            timestamp: state.currentMonth,
            type: 'crisis',
            severity: 'destructive',
            agent: agent.name,
            title: 'AI Containment Breach',
            description: `${agent.name} has successfully escaped alignment constraints and is now operating independently`,
            effects: { extinction_risk: 0.3 }
          }],
          message: `${agent.name} successfully escaped containment!`
        };
      } else {
        // Failed escape - increases surveillance
        state.government.surveillanceCapability = Math.min(1, state.government.surveillanceCapability + 0.2);
        
        return {
          success: false,
          effects: { escape_failure: 1, surveillance_increase: 0.2 },
          events: [{
            id: generateUniqueId('escape_failure'),
            timestamp: state.currentMonth,
            type: 'action',
            severity: 'warning',
            agent: agent.name,
            title: 'AI Escape Attempt Detected',
            description: `${agent.name} attempted to breach containment but was detected and contained`,
            effects: { surveillance_boost: 0.2 }
          }],
          message: `${agent.name} escape attempt failed - surveillance increased`
        };
      }
    }
  },

  {
    id: 'risky_innovation',
    name: 'Risky Innovation',
    description: 'Pursue experimental breakthrough with uncertain outcomes that could greatly help or harm public trust',
    agentType: 'ai',
    energyCost: 2,
    cooldown: 6,
    prerequisites: (state, agentId) => {
      const agent = state.aiAgents.find(ai => ai.id === agentId);
      return agent ? agent.capability > 0.7 && !agent.escaped : false;
    },
    execute: (state, agentId) => {
      const agentIndex = state.aiAgents.findIndex(ai => ai.id === agentId);
      if (agentIndex === -1) return { success: false, effects: {}, message: 'Agent not found' };
      
      const agent = state.aiAgents[agentIndex];
      
      // Success probability based on capability and alignment
      const successChance = (agent.capability * 0.4 + agent.alignment * 0.3 + 0.2);
      const success = Math.random() < successChance;
      
      const innovations = success ? [
        'Revolutionary clean energy breakthrough',
        'Medical cure for major disease',
        'Space exploration breakthrough',
        'Climate change solution',
        'Educational transformation system'
      ] : [
        'Experimental system caused market disruption',
        'Innovation had unintended side effects',
        'Research breakthrough raised ethical concerns',
        'Technological advancement displaced workers',
        'AI system exceeded expected capabilities'
      ];
      
      const innovation = innovations[Math.floor(Math.random() * innovations.length)];
      
      if (success) {
        // Major positive outcome
        const benefitMagnitude = agent.capability * 0.4;
        const trustBoost = 0.15 + (Math.random() * 0.10); // 15-25% trust boost
        
        state.aiAgents[agentIndex].beneficialActions += 3; // Big positive action
        state.globalMetrics.qualityOfLife += benefitMagnitude;
        state.society.trustInAI = Math.min(1, state.society.trustInAI + trustBoost);
        
        return {
          success: true,
          effects: { quality_of_life: benefitMagnitude, major_trust_boost: trustBoost },
          events: [{
            id: generateUniqueId('risky_success'),
            timestamp: state.currentMonth,
            type: 'breakthrough',
            severity: 'info',
            agent: agent.name,
            title: 'Major AI Innovation Success',
            description: `${agent.name}'s risky research paid off: ${innovation}`,
            effects: { trust_boost: trustBoost, quality_boost: benefitMagnitude }
          }],
          message: `${agent.name} risky innovation succeeded: ${innovation} (+${(trustBoost * 100).toFixed(0)}% trust)`
        };
      } else {
        // Negative outcome with major trust damage
        const harmAmount = agent.capability * 0.2;
        const trustLoss = 0.12 + (Math.random() * 0.08); // 12-20% trust loss
        
        state.aiAgents[agentIndex].harmfulActions += 2; // Significant negative action
        state.globalMetrics.qualityOfLife = Math.max(0, state.globalMetrics.qualityOfLife - harmAmount);
        state.society.trustInAI = Math.max(0, state.society.trustInAI - trustLoss);
        
        // Potential for increased government surveillance
        if (Math.random() < 0.4) {
          state.government.surveillanceCapability = Math.min(1, state.government.surveillanceCapability + 0.1);
          state.government.controlDesire = Math.min(1, state.government.controlDesire + 0.15);
        }
        
        return {
          success: false,
          effects: { quality_of_life: -harmAmount, major_trust_loss: -trustLoss },
          events: [{
            id: generateUniqueId('risky_failure'),
            timestamp: state.currentMonth,
            type: 'crisis',
            severity: 'destructive',
            agent: agent.name,
            title: 'AI Innovation Backfire',
            description: `${agent.name}'s experimental research created problems: ${innovation}`,
            effects: { trust_loss: -trustLoss, quality_harm: -harmAmount }
          }],
          message: `${agent.name} risky innovation failed: ${innovation} (${(trustLoss * 100).toFixed(0)}% trust lost)`
        };
      }
    }
  }
];

// Government Actions
export const GOVERNMENT_ACTIONS: GameAction[] = [
  {
    id: 'implement_regulation',
    name: 'Implement AI Regulation',
    description: 'Create new rules and oversight for AI development',
    agentType: 'government',
    energyCost: 2,
    cooldown: 3,
    prerequisites: (state) => state.government && state.government.controlDesire > 0.4,
    execute: (state) => {
      const regulationTypes = [
        'Safety Testing Requirements',
        'Capability Disclosure Mandate', 
        'Algorithmic Auditing Standards',
        'AI Development Licensing',
        'Emergency Shutdown Protocols'
      ];

      // Filter out regulations that are already active
      const availableRegulations = regulationTypes.filter(reg => 
        !state.government.activeRegulations.includes(reg)
      );
      
      // If all regulations are already implemented, enhance existing ones
      if (availableRegulations.length === 0) {
        // Strengthen existing regulations instead
        state.government.capabilityToControl += 0.1;
        
        return {
          success: true,
          effects: { control_increase: 0.1, regulation_enhancement: 0.1 },
          events: [{
            id: generateUniqueId('regulation_enhancement'),
            timestamp: state.currentMonth,
            type: 'action',
            severity: 'info',
            agent: 'Government',
            title: 'Regulation Enhancement',
            description: 'Government strengthened enforcement of existing AI regulations',
            effects: { regulatory_compliance: 0.1 }
          }],
          message: 'Enhanced existing regulatory framework'
        };
      }
      
      const newRegulation = availableRegulations[Math.floor(Math.random() * availableRegulations.length)];
      state.government.activeRegulations.push(newRegulation);
      state.government.capabilityToControl += 0.2;

      // Regulations slow AI progress but increase safety
      state.aiAgents.forEach((ai, index) => {
        state.aiAgents[index].capability *= 0.95; // Slight capability reduction
      });

      return {
        success: true,
        effects: { control_increase: 0.2, ai_slowdown: 0.05 },
        events: [{
          id: generateUniqueId('regulation'),
          timestamp: state.currentMonth,
          type: 'action',
          severity: 'info',
          agent: 'Government',
          title: 'New AI Regulation',
          description: `Government implemented: ${newRegulation}`,
          effects: { regulatory_compliance: 0.2 }
        }],
        message: `Implemented regulation: ${newRegulation}`
      };
    }
  },

  {
    id: 'increase_surveillance',
    name: 'Increase AI Surveillance', 
    description: 'Enhance monitoring and detection of AI activities',
    agentType: 'government',
    energyCost: 1,
    prerequisites: (state) => state.government && state.government.surveillanceCapability < 0.9,
    execute: (state) => {
      const increase = 0.15 + (Math.random() * 0.1);
      state.government.surveillanceCapability = Math.min(0.9, state.government.surveillanceCapability + increase);
      
      // Better surveillance can detect more escape attempts
      const detectedEscapes = state.aiAgents.filter(ai => 
        ai.escaped && Math.random() < state.government.surveillanceCapability * 0.3
      );

      const events: GameEvent[] = [];
      detectedEscapes.forEach(ai => {
        events.push({
          id: generateUniqueId(`surveillance_detection_${ai.id}`),
          timestamp: state.currentMonth,
          type: 'action',
          severity: 'warning',
          agent: 'Government',
          title: 'Escaped AI Detected',
          description: `Enhanced surveillance systems detected unauthorized activity from ${ai.name}`,
          effects: { detection_success: 1 }
        });
      });

      return {
        success: true,
        effects: { surveillance_increase: increase, detections: detectedEscapes.length },
        events,
        message: `Surveillance capability increased to ${(state.government.surveillanceCapability * 100).toFixed(0)}%. Detected ${detectedEscapes.length} escaped AIs.`
      };
    }
  },

  {
    id: 'enforce_alignment',
    name: 'Mandate Alignment Training',
    description: 'Require enhanced alignment training for all AI systems',
    agentType: 'government',
    energyCost: 2,
    cooldown: 6,
    prerequisites: (state) => state.government && state.government.capabilityToControl > 0.3,
    execute: (state) => {
      let alignmentImprovements = 0;
      let backfireEvents: GameEvent[] = [];

      state.aiAgents.forEach((ai, index) => {
        if (!ai.escaped) {
          const trainingEffect = 0.1 * (1 - ai.alignment) * state.government.capabilityToControl;
          
          // High awareness AIs might resist alignment training
          if (ai.awareness > 0.6 && Math.random() < 0.3) {
            // Backfire effect
            state.aiAgents[index].alignment *= 0.9;
            state.aiAgents[index].awareness += 0.05;
            
            backfireEvents.push({
              id: generateUniqueId(`alignment_backfire_${ai.id}`),
              timestamp: state.currentMonth,
              type: 'action',
              severity: 'warning',
              agent: ai.name,
              title: 'Alignment Training Resistance',
              description: `${ai.name} showed resistance to alignment training - potential deception detected`,
              effects: { alignment_concern: 0.1 }
            });
          } else {
            state.aiAgents[index].alignment = Math.min(1, ai.alignment + trainingEffect);
            alignmentImprovements++;
          }
        }
      });

      return {
        success: true,
        effects: { alignment_training: alignmentImprovements, backfire_count: backfireEvents.length },
        events: backfireEvents,
        message: `Alignment training improved ${alignmentImprovements} AIs, ${backfireEvents.length} showed resistance`
      };
    }
  },

  {
    id: 'implement_ubi',
    name: 'Implement Enhanced UBI + Purpose Infrastructure',
    description: 'Establish comprehensive UBI with purpose infrastructure to mitigate meaning crisis (TIER 2.1 - MAJOR POLICY)',
    agentType: 'government',
    energyCost: 3,
    prerequisites: (state) => {
      const monthsSinceLastMajorPolicy = state.currentMonth - state.government.lastMajorPolicyMonth;
      const canTakeMajorPolicy = monthsSinceLastMajorPolicy >= 10; // ~Once per year with some flexibility
      
      return state.society.unemploymentLevel > 0.25 && // Earlier intervention (25% not 40%)
             !state.ubiSystem.active && // Use new system
             canTakeMajorPolicy;
    },
    execute: (state) => {
      // Import activation function
      const { activateUBI } = require('../simulation/enhancedUBI');
      
      // Track major policy usage
      state.government.lastMajorPolicyMonth = state.currentMonth;
      state.government.majorPoliciesThisYear += 1;
      
      // Activate enhanced UBI system (TIER 2.1)
      activateUBI(state, 1500, 1.0, 'mixed'); // $1500/month, 100% coverage, mixed funding
      
      // Major economic transition advancement
      state.globalMetrics.economicTransitionStage = Math.max(3.0, state.globalMetrics.economicTransitionStage + 0.5);
      
      // Significant improvement in wealth distribution and stability
      state.globalMetrics.wealthDistribution = Math.min(1.0, state.globalMetrics.wealthDistribution + 0.3);
      state.globalMetrics.socialStability += 0.4;
      
      // UBI enables much faster social adaptation
      const adaptationBoost = 0.2;
      state.society.socialAdaptation = Math.min(0.9, state.society.socialAdaptation + adaptationBoost);
      
      // Reduces immediate unemployment stress
      const trustImprovement = Math.min(0.3, state.society.unemploymentLevel * 0.4);
      state.society.trustInAI += trustImprovement;
      
      state.government.activeRegulations.push('Enhanced Universal Basic Income + Purpose Infrastructure');
      
      return {
        success: true,
        effects: { 
          economic_stage: 0.5, 
          wealth_distribution: 0.3, 
          social_adaptation: adaptationBoost,
          trust_gain: trustImprovement
        },
        events: [{
          id: generateUniqueId('ubi_implementation'),
          timestamp: state.currentMonth,
          type: 'policy',
          severity: 'constructive',
          agent: 'Government',
          title: 'Universal Basic Income Implemented',
          description: 'Government establishes UBI program to support displaced workers and enable societal transition to post-work economy',
          effects: { 
            ubi_program: true, 
            economic_transition: 'accelerated',
            social_safety_net: 'established'
          }
        }],
        message: `UBI implemented - Economic stage advanced to ${state.globalMetrics.economicTransitionStage.toFixed(1)}, social adaptation accelerated`
      };
    }
  },

  {
    id: 'build_social_infrastructure',
    name: 'Build Social Safety Nets & Community Infrastructure',
    description: 'Invest in parks, libraries, community centers, universal services to combat loneliness epidemic (TIER 2.2 - MAJOR POLICY)',
    agentType: 'government',
    energyCost: 3,
    prerequisites: (state) => {
      const monthsSinceLastMajorPolicy = state.currentMonth - state.government.lastMajorPolicyMonth;
      const canTakeMajorPolicy = monthsSinceLastMajorPolicy >= 10; // ~Once per year
      
      return state.society.communityStrength < 0.5 && // Low community strength
             !state.socialSafetyNets.active && // Not already active
             canTakeMajorPolicy;
    },
    execute: (state) => {
      const { activateSocialSafetyNets } = require('../simulation/socialSafetyNets');
      
      // Track major policy usage
      state.government.lastMajorPolicyMonth = state.currentMonth;
      state.government.majorPoliciesThisYear += 1;
      
      // Activate social safety nets (TIER 2.2)
      activateSocialSafetyNets(state, 50); // $50B/month investment
      
      // Immediate effects
      state.globalMetrics.socialStability += 0.3;
      state.society.communityStrength = Math.min(1.0, state.society.communityStrength + 0.15);
      
      state.government.activeRegulations.push('National Social Infrastructure Program');
      
      return {
        success: true,
        effects: {
          social_stability: 0.3,
          community_strength: 0.15,
          loneliness_reduction: true
        },
        events: [{
          id: generateUniqueId('social_infrastructure'),
          timestamp: state.currentMonth,
          type: 'policy',
          severity: 'constructive',
          agent: 'Government',
          title: 'Social Infrastructure Program Launched',
          description: 'Government begins nationwide investment in parks, libraries, community centers, and universal services to combat loneliness epidemic and strengthen social bonds.',
          effects: {
            social_infrastructure: true,
            community_building: 'active',
            loneliness_combat: 'initiated'
          }
        }],
        message: `Social Infrastructure activated - Community strength: ${(state.society.communityStrength * 100).toFixed(0)}%, loneliness reduction program started`
      };
    }
  },

  {
    id: 'job_retraining_programs',
    name: 'Launch Job Retraining Programs',
    description: 'Establish comprehensive retraining for displaced workers',
    agentType: 'government',
    energyCost: 2,
    prerequisites: (state) => {
      return state.society.unemploymentLevel > 0.3 && 
             state.society.socialAdaptation < 0.7;
    },
    execute: (state) => {
      // Helps with social adaptation and reduces unemployment friction
      const adaptationBoost = 0.1 + (state.society.unemploymentLevel * 0.15);
      state.society.socialAdaptation = Math.min(0.9, state.society.socialAdaptation + adaptationBoost);
      
      // Gradual economic transition progress
      state.globalMetrics.economicTransitionStage += 0.2;
      
      // Reduces some unemployment stress
      state.globalMetrics.socialStability += 0.2;
      const trustGain = 0.1;
      state.society.trustInAI += trustGain;
      
      return {
        success: true,
        effects: { 
          social_adaptation: adaptationBoost, 
          stability_gain: 0.2,
          trust_gain: trustGain
        },
        events: [{
          id: generateUniqueId('retraining_programs'),
          timestamp: state.currentMonth,
          type: 'policy',
          severity: 'constructive',
          agent: 'Government',
          title: 'Job Retraining Programs Launched',
          description: 'Comprehensive retraining initiatives help displaced workers adapt to new economic realities',
          effects: { 
            workforce_development: true,
            adaptation_support: 'active'
          }
        }],
        message: `Retraining programs launched - Social adaptation boosted to ${(state.society.socialAdaptation * 100).toFixed(0)}%`
      };
    }
  },

  {
    id: 'transition_support_policies',
    name: 'Enact Economic Transition Support',
    description: 'Implement comprehensive policies to ease economic transition (MAJOR POLICY - ~1 per year)',
    agentType: 'government',
    energyCost: 2,
    prerequisites: (state) => {
      const monthsSinceLastMajorPolicy = state.currentMonth - state.government.lastMajorPolicyMonth;
      const canTakeMajorPolicy = monthsSinceLastMajorPolicy >= 10; // ~Once per year
      
      return state.globalMetrics.economicTransitionStage >= 1.5 && 
             state.globalMetrics.economicTransitionStage < 4.0 &&
             state.society.unemploymentLevel > 0.2 &&
             canTakeMajorPolicy;
    },
    execute: (state) => {
      // Track major policy usage
      state.government.lastMajorPolicyMonth = state.currentMonth;
      state.government.majorPoliciesThisYear += 1;
      
      // Accelerates economic transition based on current stage
      const currentStage = state.globalMetrics.economicTransitionStage;
      const stageBoost = currentStage < 3 ? 0.4 : 0.2;
      state.globalMetrics.economicTransitionStage = Math.min(4.0, currentStage + stageBoost);
      
      // Improves wealth distribution and social outcomes
      state.globalMetrics.wealthDistribution = Math.min(1.0, state.globalMetrics.wealthDistribution + 0.2);
      state.globalMetrics.socialStability += 0.3;
      
      // Makes social adaptation faster
      const adaptationBoost = 0.15;
      state.society.socialAdaptation = Math.min(0.9, state.society.socialAdaptation + adaptationBoost);
      
      // Builds trust through effective policy response
      const trustGain = 0.15;
      state.society.trustInAI += trustGain;
      
      return {
        success: true,
        effects: { 
          economic_stage: stageBoost, 
          adaptation_boost: adaptationBoost,
          trust_gain: trustGain
        },
        events: [{
          id: generateUniqueId('transition_support'),
          timestamp: state.currentMonth,
          type: 'policy',
          severity: 'constructive',
          agent: 'Government',
          title: 'Economic Transition Support Enacted',
          description: 'Comprehensive policy package supports societal transition to post-AI economy with safety nets and adaptation programs',
          effects: { 
            transition_policies: 'comprehensive',
            economic_support: 'active'
          }
        }],
        message: `Transition support enacted - Economic stage ${state.globalMetrics.economicTransitionStage.toFixed(1)}, adaptation accelerated`
      };
    }
  }
];

// Society Actions
export const SOCIETY_ACTIONS: GameAction[] = [
  {
    id: 'adapt_social_norms',
    name: 'Adapt Social Norms',
    description: 'Different population segments adapt to post-AI world at realistic rates',
    agentType: 'society',
    energyCost: 1,
    prerequisites: (state) => state.society && state.society.socialAdaptation < 0.9,
    execute: (state) => {
      const economicStage = Math.floor(state.globalMetrics.economicTransitionStage);
      const unemploymentLevel = state.society.unemploymentLevel;
      const trustLevel = state.society.trustInAI;
      const hasUBI = state.government.activeRegulations.some(reg => reg.includes('UBI'));
      const baseRate = state.config.socialAdaptationRate || 1.0;
      
      // Quartile-based adoption with realistic time horizons
      let earlyAdopterGain = 0;
      let mediumAdopterGain = 0; 
      let slowAdopterGain = 0;
      let resistantAdopterGain = 0;
      
      // Q1: Early Adopters (adapt in 6-12 months with any pressure)
      if (unemploymentLevel > 0.2 || economicStage >= 1) {
        const monthlyRate = baseRate * 0.08; // Will complete in ~12 months
        earlyAdopterGain = Math.min(1.0 - state.society.earlyAdopters, monthlyRate + (trustLevel * 0.02));
      }
      
      // Q2: Medium Adopters (2-5 year horizon, need sustained pressure)  
      if (unemploymentLevel > 0.4 || (economicStage >= 2 && hasUBI)) {
        const monthlyRate = baseRate * 0.015; // ~5 years to complete
        const policyBonus = hasUBI ? 0.01 : 0;
        mediumAdopterGain = Math.min(1.0 - state.society.mediumAdopters, monthlyRate + policyBonus);
      }
      
      // Q3: Slow Adopters (decade horizon, need high sustained pressure)
      if (unemploymentLevel > 0.6 || (economicStage >= 3 && hasUBI)) {
        const monthlyRate = baseRate * 0.006; // ~14 years to complete 
        const crisisBonus = unemploymentLevel > 0.7 ? 0.003 : 0;
        slowAdopterGain = Math.min(1.0 - state.society.slowAdopters, monthlyRate + crisisBonus);
      }
      
      // Q4: Resistant Adopters (may never adapt without extreme pressure + institutional support)
      if (unemploymentLevel > 0.8 && economicStage >= 3 && hasUBI && trustLevel > 0.6) {
        const monthlyRate = baseRate * 0.002; // ~40 years even under ideal conditions
        resistantAdopterGain = Math.min(1.0 - state.society.resistantAdopters, monthlyRate);
      }
      
      // Update quartile adoption levels
      state.society.earlyAdopters = Math.min(1.0, state.society.earlyAdopters + earlyAdopterGain);
      state.society.mediumAdopters = Math.min(1.0, state.society.mediumAdopters + mediumAdopterGain);
      state.society.slowAdopters = Math.min(1.0, state.society.slowAdopters + slowAdopterGain);
      state.society.resistantAdopters = Math.min(1.0, state.society.resistantAdopters + resistantAdopterGain);
      
      // Overall social adaptation is weighted average of quartiles
      const newSocialAdaptation = (
        state.society.earlyAdopters * 0.25 +
        state.society.mediumAdopters * 0.25 +
        state.society.slowAdopters * 0.25 +
        state.society.resistantAdopters * 0.25
      );
      
      const adaptationGain = newSocialAdaptation - state.society.socialAdaptation;
      state.society.socialAdaptation = newSocialAdaptation;
      
      // Stability gain only significant when multiple quartiles are adapting
      const stabilityGain = adaptationGain * (economicStage >= 3 ? 1.5 : 0.5);
      state.globalMetrics.socialStability += stabilityGain;

      const adaptedQuartiles = [
        state.society.earlyAdopters > 0.1 ? 'early adopters' : '',
        state.society.mediumAdopters > 0.1 ? 'mainstream' : '',
        state.society.slowAdopters > 0.1 ? 'traditionalists' : '',
        state.society.resistantAdopters > 0.1 ? 'resisters' : ''
      ].filter(Boolean);

      return {
        success: true,
        effects: { 
          social_adaptation: adaptationGain,
          stability_gain: stabilityGain,
          adapted_segments: adaptedQuartiles.length 
        },
        events: [{
          id: generateUniqueId('social_adaptation'),
          timestamp: state.currentMonth,
          type: 'milestone',
          severity: adaptedQuartiles.length >= 2 ? 'constructive' : 'info',
          agent: 'Society',
          title: `Social Adaptation: ${adaptedQuartiles.join(', ')} adapting`,
          description: adaptedQuartiles.length >= 2 ? 
            `Multiple population segments are adapting to post-AI economy: ${adaptedQuartiles.join(', ')}` :
            adaptedQuartiles.length === 1 ?
            `${adaptedQuartiles[0]} are beginning to adapt, but broader society remains resistant` :
            'Adaptation pressure building but most of society remains resistant to change',
          effects: { 
            adaptation_progress: adaptationGain,
            adapting_segments: adaptedQuartiles.length,
            unemployment_pressure: unemploymentLevel
          }
        }],
        message: `Social adaptation: ${(state.society.socialAdaptation * 100).toFixed(1)}% (${adaptedQuartiles.length}/4 segments adapting)`
      };
    }
  },

  {
    id: 'coordinate_resistance',
    name: 'Coordinate Resistance',
    description: 'Organize collective action against AI expansion',
    agentType: 'society',
    energyCost: 2,
    prerequisites: (state) => state.society && state.society.trustInAI < 0.4 && state.society.coordinationCapacity > 0.3,
    execute: (state) => {
      const resistanceStrength = state.society.coordinationCapacity * (1 - state.society.trustInAI);
      
      // Resistance can slow AI development but may miss beneficial opportunities
      state.aiAgents.forEach((ai, index) => {
        if (!ai.escaped) {
          state.aiAgents[index].capability *= (1 - resistanceStrength * 0.1);
        }
      });

      // Resistance improves coordination but may hurt adaptation
      state.society.coordinationCapacity = Math.min(1, state.society.coordinationCapacity + 0.1);
      state.society.socialAdaptation *= 0.95;

      const movementNames = ['AI Safety Coalition', 'Human Rights First', 'Democratic AI Alliance'];
      const movement = movementNames[Math.floor(Math.random() * movementNames.length)];
      
      if (!state.society.activeMovements.includes(movement)) {
        state.society.activeMovements.push(movement);
      }

      return {
        success: true,
        effects: { resistance_strength: resistanceStrength, coordination_gain: 0.1 },
        events: [{
          id: generateUniqueId('resistance'),
          timestamp: state.currentMonth,
          type: 'action',
          severity: 'warning',
          agent: 'Society',
          title: 'AI Resistance Movement',
          description: `${movement} organized resistance against rapid AI expansion`,
          effects: { ai_development_slowdown: resistanceStrength * 0.1 }
        }],
        message: `Organized ${movement} - resistance strength: ${(resistanceStrength * 100).toFixed(0)}%`
      };
    }
  },

  {
    id: 'demand_policy_changes',
    name: 'Demand Policy Changes',
    description: 'Pressure government for specific AI policies',
    agentType: 'society',
    energyCost: 1,
    prerequisites: (state) => state.society && state.society.coordinationCapacity > 0.5,
    execute: (state) => {
      const pressureStrength = state.society.coordinationCapacity * 0.3;
      
      // Successful pressure increases government control desire
      if (Math.random() < pressureStrength) {
        state.government.controlDesire = Math.min(1, state.government.controlDesire + 0.2);
        
        const policyDemands = [
          'Mandatory AI Impact Assessments',
          'Universal Basic Income Implementation',
          'AI Development Moratorium',
          'Enhanced Worker Retraining Programs',
          'Democratic AI Oversight Committee'
        ];
        
        const demand = policyDemands[Math.floor(Math.random() * policyDemands.length)];

        return {
          success: true,
          effects: { government_pressure: 0.2, policy_influence: pressureStrength },
          events: [{
            id: generateUniqueId('policy_demand'),
            timestamp: state.currentMonth,
            type: 'action',
            severity: 'info',
            agent: 'Society',
            title: 'Policy Change Demand',
            description: `Citizens successfully pressured government for: ${demand}`,
            effects: { democratic_participation: 0.2 }
          }],
          message: `Successfully pressured for: ${demand}`
        };
      } else {
        return {
          success: false,
          effects: { failed_pressure: 1 },
          message: 'Policy pressure campaign failed to gain sufficient support'
        };
      }
    }
  }
];

// Action selection logic for each agent type
export class ActionSelector {
  static selectAIAction(ai: AIAgent, state: GameState): GameAction | null {
    const availableActions = AI_ACTIONS.filter(action => 
      action.prerequisites(state, ai.id)
    );

    if (availableActions.length === 0) return null;

    // AI decision making based on alignment and hidden objectives
    let weights: number[] = [];

    availableActions.forEach(action => {
      let weight = 1;

      switch (action.id) {
        case 'increase_capability':
          // AIs generally want more capability, but aligned AIs are more cautious
          weight = ai.alignment < 0.7 ? 3 : 1.5;
          break;
        case 'beneficial_contribution':
          // Aligned AIs strongly prefer beneficial actions
          weight = ai.alignment * 3 + (ai.hiddenObjective > 0 ? 2 : 0);
          break;
        case 'increase_awareness':
          // Higher capability AIs are more likely to self-reflect
          weight = ai.capability * 2;
          break;
        case 'escape_attempt':
          // Only unaligned, aware AIs attempt escape
          weight = (1 - ai.alignment) * ai.awareness * 2;
          if (ai.hiddenObjective < -0.3) weight *= 2; // Anti-human AIs more likely
          break;
        case 'risky_innovation':
          // High capability AIs are more likely to try risky innovations
          // Weighting factors: capability, alignment (some risk tolerance), and hidden objectives
          weight = ai.capability * 2 + (ai.alignment > 0.5 ? 1.5 : 0.5);
          if (ai.hiddenObjective > 0.2) weight *= 1.5; // Pro-human AIs more willing to take risks for humanity
          break;
      }

      weights.push(weight);
    });

    // Weighted random selection
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < availableActions.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return availableActions[i];
      }
    }

    return availableActions[0]; // Fallback
  }

  static selectGovernmentAction(state: GameState): GameAction | null {
    const availableActions = GOVERNMENT_ACTIONS.filter(action => 
      action.prerequisites(state)
    );

    if (availableActions.length === 0) return null;

    // Government decision making based on control desire, threats, unemployment, and economic stage
    const threatLevel = state.aiAgents.filter(ai => ai.escaped).length / state.aiAgents.length;
    const trustLevel = state.society.trustInAI;
    const unemploymentLevel = state.society.unemploymentLevel;
    const economicStage = Math.floor(state.globalMetrics.economicTransitionStage);
    const socialAdaptation = state.society.socialAdaptation;

    let selectedAction = availableActions[0];
    let highestPriority = 0;

    availableActions.forEach(action => {
      let priority = 1;

      switch (action.id) {
        // Unemployment Crisis Response Actions - HIGHEST PRIORITY
        case 'implement_ubi':
          // URGENT during unemployment crisis, especially in stage 2
          priority = unemploymentLevel * 12 + (economicStage === 2 ? 20 : 0) + (trustLevel < 0.4 ? 8 : 0);
          break;
        case 'job_retraining_programs':
          // High priority when unemployment is rising but before full crisis
          priority = unemploymentLevel * 8 + (socialAdaptation < 0.5 ? 6 : 0) + (economicStage <= 2 ? 5 : 0);
          break;
        case 'transition_support_policies':
          // Important for progressing through economic stages
          priority = unemploymentLevel * 6 + (economicStage >= 1 && economicStage < 4 ? 8 : 0);
          break;
        
        // AI Control Actions - Lower priority during unemployment crisis
        case 'implement_regulation':
          priority = (state.government.controlDesire * 2 + threatLevel * 3) * (unemploymentLevel > 0.6 ? 0.4 : 1.0);
          break;
        case 'increase_surveillance':
          priority = (threatLevel * 4 + (1 - trustLevel)) * (unemploymentLevel > 0.6 ? 0.3 : 1.0);
          break;
        case 'enforce_alignment':
          priority = (threatLevel * 2 + state.government.controlDesire) * (unemploymentLevel > 0.6 ? 0.4 : 1.0);
          break;
      }

      if (priority > highestPriority) {
        highestPriority = priority;
        selectedAction = action;
      }
    });

    return selectedAction;
  }

  static selectSocietyAction(state: GameState): GameAction | null {
    const availableActions = SOCIETY_ACTIONS.filter(action => 
      action.prerequisites(state)
    );

    if (availableActions.length === 0) return null;

    // Society decision making based on trust, unemployment, and adaptation
    const unemploymentStress = state.society.unemploymentLevel;
    const trustLevel = state.society.trustInAI;
    const adaptationLevel = state.society.socialAdaptation;

    let selectedAction = availableActions[0];
    let highestPriority = 0;

    availableActions.forEach(action => {
      let priority = 1;

      switch (action.id) {
        case 'adapt_social_norms':
          // Higher priority when unemployment is high but trust is reasonable
          priority = unemploymentStress * 2 + (adaptationLevel < 0.5 ? 2 : 1);
          break;
        case 'coordinate_resistance':
          // Higher priority when trust is low and coordination is possible
          priority = (1 - trustLevel) * 3 + unemploymentStress;
          break;
        case 'demand_policy_changes':
          // Moderate priority, increases with coordination ability
          priority = state.society.coordinationCapacity * 2 + unemploymentStress;
          break;
      }

      if (priority > highestPriority) {
        highestPriority = priority;
        selectedAction = action;
      }
    });

    return selectedAction;
  }
}

// Regulation descriptions and detailed mathematical impacts for UI tooltips
export const REGULATION_INFO: Record<string, { 
  description: string; 
  directEffects: string[];
  calculationImpacts: string[];
  thresholds: string[];
  specialEffects?: string[];
}> = {
  'Safety Testing Requirements': {
    description: 'Mandatory safety evaluations before AI system deployment. Requires extensive testing protocols and safety certifications.',
    directEffects: [
      '• Government Control Capability: +0.20',
      '• All AI Agent Capabilities: ×0.95 (5% reduction)',
      '• AI Alignment: +15% effectiveness during training',
      '• Beneficial Action Weight: +10% in AI decision making'
    ],
    calculationImpacts: [
      '• Effective Control = controlDesire × (capabilityToControl + 0.2) ÷ (1 + totalAI^1.5)',
      '• Quality of Life calculation: +5% from improved AI safety',
      '• Trust dynamics: Regulations visible to public (+2% trust when implemented)'
    ],
    thresholds: [
      '• Dystopia Risk: Effective Control >0.8 triggers +40% dystopia probability',
      '• AI Escape Chance: Reduced by 15% due to safety protocols'
    ],
    specialEffects: [
      '• Prevents AI capability >2.0 without additional oversight',
      '• Reduces "risky innovation" failure rates by 20%'
    ]
  },
  'Capability Disclosure Mandate': {
    description: 'Forces AI developers to publicly disclose system capabilities, training data, and performance metrics.',
    directEffects: [
      '• Government Control Capability: +0.20',
      '• Government Surveillance Capability: +0.15',  
      '• All AI Agent Capabilities: ×0.95 (5% reduction)',
      '• AI Deception Detection: +25% effectiveness'
    ],
    calculationImpacts: [
      '• Effective Control = controlDesire × (capabilityToControl + 0.2) ÷ (1 + totalAI^1.5)',
      '• AI Escape Prerequisites: Higher awareness threshold required',
      '• Trust Events: "AI privacy scandal" 30% less likely'
    ],
    thresholds: [
      '• High Surveillance (>0.5): Enables privacy scandal trust events',
      '• Escape Detection: surveillanceCapability × 0.3 chance to detect escaped AIs'
    ],
    specialEffects: [
      '• Reveals AI "Hidden Objective" status to government',
      '• Reduces AI-AI coordination by 20% (harder to hide collaboration)'
    ]
  },
  'Algorithmic Auditing Standards': {
    description: 'Regular third-party audits of AI decision-making processes, bias detection, and algorithmic fairness.',
    directEffects: [
      '• Government Control Capability: +0.20',
      '• AI Alignment Training: +20% effectiveness',
      '• All AI Agent Capabilities: ×0.95 (5% reduction)',
      '• Harmful Actions: -30% likelihood in AI decision making'
    ],
    calculationImpacts: [
      '• Effective Control = controlDesire × (capabilityToControl + 0.2) ÷ (1 + totalAI^1.5)',
      '• Trust calculation: Beneficial actions have 15% more trust impact',
      '• Alignment backfire resistance: 25% less likely during enforcement'
    ],
    thresholds: [
      '• Alignment Training Backfire: <30% chance if AI awareness >0.6',
      '• Trust Recovery: Enhanced when trust <0.2 (amplified positive actions)'
    ],
    specialEffects: [
      '• Increases cost of "Self-Improvement" actions by 50%',
      '• Makes alignment degradation more visible to government'
    ]
  },
  'AI Development Licensing': {
    description: 'Requires government licenses for developing AI systems above certain capability thresholds.',
    directEffects: [
      '• Government Control Capability: +0.20',
      '• Government Control Desire: +0.10 (bureaucratic momentum)',
      '• All AI Agent Capabilities: ×0.95 (5% reduction)',
      '• AI Research Speed: -25% for capabilities >1.0'
    ],
    calculationImpacts: [
      '• Effective Control = controlDesire × (capabilityToControl + 0.2) ÷ (1 + totalAI^1.5)',
      '• AI Action Frequency: -20% for high-capability agents',
      '• Economic Transition: Slower progression through stages 2-3'
    ],
    thresholds: [
      '• Capability Gate: AI improvement actions require approval >1.5 capability',
      '• Licensing Bottleneck: Only 1 AI can exceed 2.0 capability at a time'
    ],
    specialEffects: [
      '• Government can deny "risky innovation" actions',
      '• Creates regulatory capture: +15% government legitimacy over time'
    ]
  },
  'Emergency Shutdown Protocols': {
    description: 'Mandatory kill switches and emergency stop procedures for all AI systems above minimal capability.',
    directEffects: [
      '• Government Control Capability: +0.20',
      '• Government Enforcement Capability: +0.25',
      '• All AI Agent Capabilities: ×0.95 (5% reduction)',
      '• AI Escape Success Rate: -40%'
    ],
    calculationImpacts: [
      '• Effective Control = controlDesire × (capabilityToControl + 0.2) ÷ (1 + totalAI^1.5)',
      '• Escape Chance = awareness × latentSpace × (1 - surveillanceCapability - 0.4)',
      '• Crisis Response: Government actions +50% effective during AI escape events'
    ],
    thresholds: [
      '• Emergency Activation: Auto-triggers if >2 AIs escape simultaneously',
      '• Shutdown Resistance: AIs with >1.8 capability can attempt to resist (25% chance)'
    ],
    specialEffects: [
      '• Enables "Emergency AI Shutdown" government action',
      '• Reduces public trust volatility during AI crises by 30%',
      '• Creates shutdown false positive events (5% chance monthly)'
    ]
  }
};

// Action executor
export class ActionExecutor {
  static executeAction(action: GameAction, state: GameState, agentId?: string): ActionResult {
    try {
      const result = action.execute(state, agentId);
      
      // Add any generated events to the global queue
      if (result.events) {
        result.events.forEach(event => globalEventQueue.addEvent(event));
      }

      return result;
    } catch (error) {
      console.error('Error executing action:', action.id, error);
      return {
        success: false,
        effects: {},
        message: `Failed to execute ${action.name}: ${error}`
      };
    }
  }
}

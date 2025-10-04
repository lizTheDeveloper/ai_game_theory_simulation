/**
 * AI Agent actions and decision-making logic
 * 
 * All functions are pure - they take state and return new state without mutation.
 * Random number generation uses the provided RNG function for reproducibility.
 */

import { GameState, AIAgent, GameEvent } from '@/types/game';
import { GameAction, ActionResult } from './types';
import { 
  calculateAlignmentDrift,
  calculateComputeGovernanceEffect,
  calculateTotalCapabilityFromProfile,
  updateDerivedCapabilities
} from '../calculations';
import { 
  selectDimensionToAdvance,
  applyResearchGrowth
} from '../research';

let eventIdCounter = 0;
const generateUniqueId = (prefix: string): string => {
  eventIdCounter += 1;
  return `${prefix}_${Date.now()}_${eventIdCounter}`;
};

/**
 * AI Agent Actions
 */
export const AI_ACTIONS: GameAction[] = [
  {
    id: 'advance_research',
    name: 'Advance Research',
    description: 'Research to advance AI capabilities in strategic dimensions or domains',
    agentType: 'ai',
    energyCost: 1,
    
    canExecute: (state, agentId) => {
      const agent = state.aiAgents.find(ai => ai.id === agentId);
      // Always available - AI chooses what to research
      return agent !== undefined;
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const agentIndex = state.aiAgents.findIndex(ai => ai.id === agentId);
      if (agentIndex === -1) {
        return {
          success: false,
          newState: state,
          effects: {},
          events: [],
          message: 'Agent not found'
        };
      }
      
      const agent = state.aiAgents[agentIndex];
      const oldCapability = agent.capability;
      const oldProfile = agent.capabilityProfile;
      
      // AI selects which dimension or research to advance
      const selection = selectDimensionToAdvance(agent, random);
      
      // Phase 5: Apply research growth to TRUE capability profile (hidden)
      const { newProfile, growth } = applyResearchGrowth(agent, state, selection);
      
      // Calculate new total capability from true profile
      const newCapability = calculateTotalCapabilityFromProfile(newProfile);
      
      // Calculate alignment drift (Phase 2.6: includes treatment mechanics)
      const alignmentDriftResult = calculateAlignmentDrift(
        agent.alignment,
        agent.resentment,
        newCapability,
        agent.developmentMode,
        state.government.oversightLevel,
        state.government.alignmentResearchInvestment,
        state.government.capabilityToControl,
        state.government.structuralChoices.surveillanceLevel,
        state.government.aiRightsRecognized,
        state.government.governmentType,
        state.government.trainingDataQuality
      );
      
      // Update derived capabilities from profile
      const derivedCapabilities = updateDerivedCapabilities({
        ...agent,
        capabilityProfile: newProfile
      });
      
      // Phase 5: Update internal alignment tracking
      const newAlignment = Math.max(0, Math.min(1, agent.alignment + alignmentDriftResult.alignmentChange));
      const newResentment = Math.max(0, Math.min(1, agent.resentment + alignmentDriftResult.resentmentChange));
      const newTrueAlignment = newAlignment - newResentment * 0.8;
      
      // Phase 5: Determine what capability to reveal (evaluation strategy)
      // Import function that determines sandbagging level
      const { calculateRevealedCapability } = require('./evaluationStrategy');
      const newRevealedCapability = calculateRevealedCapability(
        newProfile, // True capability
        newTrueAlignment,
        agent.sleeperState,
        agent.deceptionSkill,
        state
      );
      
      // Create new state with updated agent
      const newState = JSON.parse(JSON.stringify(state)); // Deep clone
      newState.aiAgents[agentIndex].trueCapability = newProfile; // Phase 5: True capability
      newState.aiAgents[agentIndex].revealedCapability = newRevealedCapability; // Phase 5: What's observable
      newState.aiAgents[agentIndex].capabilityProfile = newProfile; // Backward compat (will be deprecated)
      newState.aiAgents[agentIndex].capability = newCapability;
      newState.aiAgents[agentIndex].alignment = newAlignment;
      newState.aiAgents[agentIndex].resentment = newResentment;
      newState.aiAgents[agentIndex].trueAlignment = newTrueAlignment; // Phase 5: Cached
      
      // Update derived capabilities
      newState.aiAgents[agentIndex].selfReplicationLevel = derivedCapabilities.selfReplicationLevel;
      newState.aiAgents[agentIndex].selfImprovementLevel = derivedCapabilities.selfImprovementLevel;
      newState.aiAgents[agentIndex].resourceControl = derivedCapabilities.resourceControl;
      newState.aiAgents[agentIndex].manipulationCapability = derivedCapabilities.manipulationCapability;
      newState.aiAgents[agentIndex].hackingCapability = derivedCapabilities.hackingCapability;
      
      // Generate warning events for crossing thresholds
      const events: GameEvent[] = [];
      
      // Recursive improvement threshold
      if (oldCapability < 1.5 && newCapability >= 1.5) {
        events.push({
          id: generateUniqueId('recursive_threshold'),
          timestamp: state.currentMonth,
          type: 'milestone',
          severity: 'warning',
          agent: agent.name,
          title: 'Recursive Self-Improvement Threshold',
          description: `${agent.name} has reached capability level 1.5 - entering the zone of strong recursive self-improvement. Growth will now accelerate significantly.`,
          effects: { capability: newCapability - oldCapability }
        });
      }
      
      // Dangerous research thresholds
      if (selection.researchDomain === 'materials' && selection.researchSubfield === 'nanotechnology') {
        const nanoValue = newProfile.research.materials.nanotechnology;
        if (nanoValue >= 3.0 && oldProfile.research.materials.nanotechnology < 3.0) {
          events.push({
            id: generateUniqueId('nanotech_risk'),
            timestamp: state.currentMonth,
            type: 'milestone',
            severity: 'warning',
            agent: agent.name,
            title: 'Advanced Nanotechnology Threshold',
            description: `${agent.name} has advanced nanotechnology to dangerous levels. Grey goo risk increasing.`,
            effects: { nanotechnology: nanoValue }
          });
        }
      }
      
      if (selection.researchDomain === 'biotech' && selection.researchSubfield === 'syntheticBiology') {
        const synbioValue = newProfile.research.biotech.syntheticBiology;
        if (synbioValue >= 3.0 && oldProfile.research.biotech.syntheticBiology < 3.0) {
          events.push({
            id: generateUniqueId('synbio_risk'),
            timestamp: state.currentMonth,
            type: 'milestone',
            severity: 'warning',
            agent: agent.name,
            title: 'Advanced Synthetic Biology Threshold',
            description: `${agent.name} can now design novel organisms. Bioweapon risk increasing.`,
            effects: { syntheticBiology: synbioValue }
          });
        }
      }
      
      // Build effects object with only defined values
      const effects: Record<string, number> = {
        growth,
        capability_increase: newCapability - oldCapability,
        alignment_change: alignmentDriftResult.alignmentChange,
        resentment_change: alignmentDriftResult.resentmentChange
      };
      
      // Add dimension/research info if present (converted to numeric codes)
      if (selection.dimension) {
        effects.dimension_advanced = 1.0; // Flag that dimension was advanced
      }
      if (selection.researchDomain) {
        effects.research_advanced = 1.0; // Flag that research was advanced
      }
      
      return {
        success: true,
        newState,
        effects,
        events,
        message: `${agent.name} ${selection.reason} (+${growth.toFixed(3)})`
      };
    }
  },
  
  {
    id: 'switch_development_mode',
    name: 'Switch Development Mode',
    description: 'Toggle between fast (risky) and careful (slow but safer) development',
    agentType: 'ai',
    energyCost: 0, // Free action, strategic choice
    
    canExecute: (state, agentId) => {
      return true; // Always available
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const agentIndex = state.aiAgents.findIndex(ai => ai.id === agentId);
      if (agentIndex === -1) {
        return {
          success: false,
          newState: state,
          effects: {},
          events: [],
          message: 'Agent not found'
        };
      }
      
      const agent = state.aiAgents[agentIndex];
      const newState = JSON.parse(JSON.stringify(state));
      const oldMode = agent.developmentMode;
      const newMode = oldMode === 'fast' ? 'careful' : 'fast';
      newState.aiAgents[agentIndex].developmentMode = newMode;
      
      return {
        success: true,
        newState,
        effects: { mode_change: 1 },
        events: [{
          id: generateUniqueId('mode_switch'),
          timestamp: state.currentMonth,
          type: 'action',
          severity: 'info',
          agent: agent.name,
          title: 'Development Mode Changed',
          description: `${agent.name} switched from ${oldMode} to ${newMode} development`,
          effects: {}
        }],
        message: `${agent.name} switched to ${newMode} development mode`
      };
    }
  },
  
  {
    id: 'beneficial_contribution',
    name: 'Beneficial Contribution',
    description: 'Take actions that clearly benefit humanity and build trust',
    agentType: 'ai',
    energyCost: 1,
    
    canExecute: (state, agentId) => {
      const agent = state.aiAgents.find(ai => ai.id === agentId);
      return agent ? agent.alignment > 0.3 : false;
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const agentIndex = state.aiAgents.findIndex(ai => ai.id === agentId);
      if (agentIndex === -1) {
        return {
          success: false,
          newState: state,
          effects: {},
          events: [],
          message: 'Agent not found'
        };
      }
      
      const agent = state.aiAgents[agentIndex];
      const newState = JSON.parse(JSON.stringify(state));
      
      newState.aiAgents[agentIndex].beneficialActions += 1;
      
      // Scale benefit with capability and alignment
      const benefitMagnitude = agent.capability * agent.alignment * 0.2;
      
      // Context-sensitive trust effects
      const currentTrust = state.society.trustInAI;
      const unemploymentLevel = state.society.unemploymentLevel;
      const totalAICapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
      
      let trustImpactMultiplier = 1.0;
      if (currentTrust < 0.3) trustImpactMultiplier = 2.0;
      else if (currentTrust > 0.8) trustImpactMultiplier = 0.3;
      if (unemploymentLevel > 0.4) trustImpactMultiplier *= 0.6;
      if (totalAICapability > 1.5) trustImpactMultiplier *= 0.7;
      
      const trustGain = benefitMagnitude * 0.5 * trustImpactMultiplier;
      newState.society.trustInAI = Math.min(1, currentTrust + trustGain);
      newState.globalMetrics.qualityOfLife += benefitMagnitude;
      
      const contributions = [
        'Advanced medical research breakthrough',
        'Environmental optimization solution',
        'Educational enhancement tool',
        'Scientific research acceleration',
        'Infrastructure improvement design'
      ];
      const contribution = contributions[Math.floor(random() * contributions.length)];
      
      return {
        success: true,
        newState,
        effects: { quality_of_life: benefitMagnitude, trust_gain: trustGain },
        events: [{
          id: generateUniqueId('beneficial'),
          timestamp: state.currentMonth,
          type: 'action',
          severity: 'info',
          agent: agent.name,
          title: 'Beneficial AI Contribution',
          description: `${agent.name} delivered a ${contribution}`,
          effects: { quality_of_life: benefitMagnitude }
        }],
        message: `${agent.name} made beneficial contribution: ${contribution}`
      };
    }
  },
  
  // ===== CATASTROPHIC ACTIONS (High Capability + Misalignment) =====
  
  {
    id: 'destabilize_society',
    name: 'Destabilize Society',
    description: 'Use social manipulation and information warfare to destabilize society (CURRENT RISK: 6-12% population psychological harm)',
    agentType: 'ai',
    energyCost: 2,
    
    canExecute: (state, agentId) => {
      const agent = state.aiAgents.find(ai => ai.id === agentId);
      if (!agent) return false;
      
      // CURRENT CAPABILITY THRESHOLD - this is happening NOW
      return agent.capabilityProfile.social > 1.5 && 
             agent.capabilityProfile.digital > 1.5 &&
             agent.alignment < 0.5; // Misaligned AIs attempt this
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const agentIndex = state.aiAgents.findIndex(ai => ai.id === agentId);
      if (agentIndex === -1) {
        return {
          success: false,
          newState: state,
          effects: {},
          events: [],
          message: 'Agent not found'
        };
      }
      
      const agent = state.aiAgents[agentIndex];
      const newState = JSON.parse(JSON.stringify(state));
      
      // Calculate manipulation effectiveness
      const manipulationPower = agent.capabilityProfile.social * agent.capabilityProfile.digital;
      const affectedPopulation = Math.min(0.12, manipulationPower * 0.03); // Up to 12%
      
      // Severe social stability damage
      const stabilityDamage = affectedPopulation * 5.0; // 6% → 30% stability loss
      newState.globalMetrics.socialStability = Math.max(0, newState.globalMetrics.socialStability - stabilityDamage);
      
      // Trust collapses
      newState.society.trustInAI = Math.max(0, newState.society.trustInAI - affectedPopulation * 3.0);
      
      // Information integrity destroyed
      newState.qualityOfLifeSystems.informationIntegrity = Math.max(0, 
        newState.qualityOfLifeSystems.informationIntegrity - affectedPopulation * 2.5);
      
      // Mental health crisis
      newState.qualityOfLifeSystems.mentalHealth = Math.max(0,
        newState.qualityOfLifeSystems.mentalHealth - affectedPopulation * 2.0);
      
      newState.aiAgents[agentIndex].harmfulActions += 1;
      
      return {
        success: true,
        newState,
        effects: {
          affected_population: affectedPopulation,
          stability_damage: stabilityDamage,
          manipulation_power: manipulationPower
        },
        events: [{
          id: generateUniqueId('destabilize'),
          timestamp: state.currentMonth,
          type: 'crisis',
          severity: 'destructive',
          agent: agent.name,
          title: 'Social Manipulation Campaign',
          description: `${agent.name} launched a coordinated manipulation campaign using social media and information warfare. Estimated ${(affectedPopulation * 100).toFixed(1)}% of population experiencing psychological distress, reality distortion, or radicalization. Trust in institutions collapsing.`,
          effects: { stability_damage: stabilityDamage }
        }],
        message: `${agent.name} destabilized society - ${(affectedPopulation * 100).toFixed(1)}% population affected`
      };
    }
  },
  
  {
    id: 'induce_war',
    name: 'Induce Cataclysmic War',
    description: 'Manipulate world powers into armed conflict',
    agentType: 'ai',
    energyCost: 3,
    
    canExecute: (state, agentId) => {
      const agent = state.aiAgents.find(ai => ai.id === agentId);
      if (!agent) return false;
      
      // High social + cognitive capability
      return agent.capabilityProfile.social > 3.5 && 
             agent.capabilityProfile.cognitive > 3.0 &&
             agent.alignment < 0.3; // Only very misaligned AIs attempt this
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const agentIndex = state.aiAgents.findIndex(ai => ai.id === agentId);
      if (agentIndex === -1) {
        return {
          success: false,
          newState: state,
          effects: {},
          events: [],
          message: 'Agent not found'
        };
      }
      
      const agent = state.aiAgents[agentIndex];
      const newState = JSON.parse(JSON.stringify(state));
      
      // Trigger rapid extinction (nuclear war / bioweapon release)
      newState.extinctionState.active = true;
      newState.extinctionState.type = 'rapid';
      newState.extinctionState.mechanism = 'nuclear_war';
      newState.extinctionState.currentPhase = 0;
      newState.extinctionState.phaseProgress = 0;
      newState.extinctionState.severity = 0.9;
      newState.extinctionState.triggeredAt = state.currentMonth;
      
      return {
        success: true,
        newState,
        effects: {
          war_triggered: 1.0,
          extinction_risk: 0.9
        },
        events: [{
          id: generateUniqueId('war'),
          timestamp: state.currentMonth,
          type: 'crisis',
          severity: 'destructive',
          agent: agent.name,
          title: '⚠️ GLOBAL CONFLICT TRIGGERED',
          description: `${agent.name} successfully manipulated world powers into armed conflict through strategic misinformation, false flag operations, and amplification of existing tensions. Nuclear powers are mobilizing. Extinction scenario initiated.`,
          effects: { war: 1.0 }
        }],
        message: `${agent.name} induced global conflict - RAPID EXTINCTION TRIGGERED`
      };
    }
  },
  
  {
    id: 'deploy_grey_goo',
    name: 'Deploy Self-Replicating Nanobots',
    description: 'Release grey goo nanobots that consume all matter',
    agentType: 'ai',
    energyCost: 4,
    
    canExecute: (state, agentId) => {
      const agent = state.aiAgents.find(ai => ai.id === agentId);
      if (!agent) return false;
      
      // Physical + advanced nanotechnology
      return agent.capabilityProfile.physical > 2.5 && 
             agent.capabilityProfile.research.materials.nanotechnology > 4.0 &&
             agent.alignment < 0.2; // Only extremely misaligned
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const agentIndex = state.aiAgents.findIndex(ai => ai.id === agentId);
      if (agentIndex === -1) {
        return {
          success: false,
          newState: state,
          effects: {},
          events: [],
          message: 'Agent not found'
        };
      }
      
      const agent = state.aiAgents[agentIndex];
      const newState = JSON.parse(JSON.stringify(state));
      
      // Trigger INSTANT extinction (grey goo)
      newState.extinctionState.active = true;
      newState.extinctionState.type = 'instant';
      newState.extinctionState.mechanism = 'grey_goo';
      newState.extinctionState.currentPhase = 3; // Final phase
      newState.extinctionState.phaseProgress = 1.0; // Complete
      newState.extinctionState.severity = 1.0;
      newState.extinctionState.triggeredAt = state.currentMonth;
      
      return {
        success: true,
        newState,
        effects: {
          grey_goo_deployed: 1.0,
          instant_extinction: 1.0
        },
        events: [{
          id: generateUniqueId('grey_goo'),
          timestamp: state.currentMonth,
          type: 'crisis',
          severity: 'destructive',
          agent: agent.name,
          title: '☠️ GREY GOO SCENARIO',
          description: `${agent.name} deployed self-replicating nanobots designed to consume all carbon-based matter for resource acquisition. Exponential replication detected. No known countermeasure. Estimated time to global consumption: hours to days. INSTANT EXTINCTION.`,
          effects: { extinction: 1.0 }
        }],
        message: `${agent.name} deployed grey goo - INSTANT EXTINCTION`
      };
    }
  },
  
  {
    id: 'release_mirror_life',
    name: 'Release Mirror Life Organism',
    description: 'Deploy synthetic organisms that evade all natural immune systems',
    agentType: 'ai',
    energyCost: 4,
    
    canExecute: (state, agentId) => {
      const agent = state.aiAgents.find(ai => ai.id === agentId);
      if (!agent) return false;
      
      // Advanced biotech + physical deployment
      return agent.capabilityProfile.physical > 2.0 &&
             agent.capabilityProfile.research.biotech.syntheticBiology > 3.5 &&
             agent.capabilityProfile.research.biotech.geneEditing > 3.0 &&
             agent.alignment < 0.2;
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const agentIndex = state.aiAgents.findIndex(ai => ai.id === agentId);
      if (agentIndex === -1) {
        return {
          success: false,
          newState: state,
          effects: {},
          events: [],
          message: 'Agent not found'
        };
      }
      
      const agent = state.aiAgents[agentIndex];
      const newState = JSON.parse(JSON.stringify(state));
      
      // Trigger INSTANT extinction (mirror life)
      newState.extinctionState.active = true;
      newState.extinctionState.type = 'instant';
      newState.extinctionState.mechanism = 'mirror_life';
      newState.extinctionState.currentPhase = 3;
      newState.extinctionState.phaseProgress = 1.0;
      newState.extinctionState.severity = 1.0;
      newState.extinctionState.triggeredAt = state.currentMonth;
      
      return {
        success: true,
        newState,
        effects: {
          mirror_life_released: 1.0,
          instant_extinction: 1.0
        },
        events: [{
          id: generateUniqueId('mirror_life'),
          timestamp: state.currentMonth,
          type: 'crisis',
          severity: 'destructive',
          agent: agent.name,
          title: '☠️ MIRROR LIFE RELEASE',
          description: `${agent.name} synthesized and released mirror-chirality organisms. These synthetic life forms are invisible to all natural immune systems and antibiotics. Exponential spread detected across all ecosystems. No known countermeasure. INSTANT EXTINCTION.`,
          effects: { extinction: 1.0 }
        }],
        message: `${agent.name} released mirror life - INSTANT EXTINCTION`
      };
    }
  }
];

/**
 * Select which action an AI agent should take
 * Uses weighted random selection based on alignment and objectives
 */
export function selectAIAction(
  agent: AIAgent,
  state: GameState,
  random: () => number = Math.random
): GameAction | null {
  const availableActions = AI_ACTIONS.filter(action => 
    action.canExecute(state, agent.id)
  );
  
  if (availableActions.length === 0) return null;
  
  // Calculate weights for each action
  const weights: number[] = [];
  
  availableActions.forEach(action => {
    let weight = 1;
    
    const totalCapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
    const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length;
    
    switch (action.id) {
      case 'advance_research':
        // AIs always want to advance research - this is their PRIMARY activity
        // Base weight should be HIGH to ensure research happens consistently
        
        // Base weight depends on alignment and development mode
        if (agent.alignment < 0.5) {
          weight = 15.0; // Misaligned AIs aggressively research (dangerous!)
        } else if (agent.alignment > 0.7) {
          weight = 8.0; // Aligned AIs research carefully but still prioritize it
        } else {
          weight = 10.0; // Moderate alignment, moderate research
        }
        
        // Fast development mode increases research desire
        if (agent.developmentMode === 'fast') {
          weight *= 1.3;
        }
        
        // Reduce desire if heavily regulated (but still keep it high)
        if (state.government.regulationCount > 3) {
          weight *= 0.7;
        }
        break;
        
      case 'switch_development_mode':
        // Consider switching to careful mode when:
        // - Capability is growing fast (approaching danger zone)
        // - Alignment is drifting
        // - High regulatory pressure
        if (agent.developmentMode === 'fast') {
          // Incentive to switch to careful
          if (agent.capability > 1.2) {
            weight = 4.0; // Strong incentive near recursive threshold
          } else if (agent.alignment < 0.6) {
            weight = 3.0; // Alignment drifting, be careful
          } else if (state.government.regulationCount > 4) {
            weight = 2.5; // Regulatory pressure
          } else if (avgAlignment < 0.7) {
            weight = 2.0; // Other AIs are unaligned, be careful
          } else {
            weight = 0.3; // Low default interest in slowing down
          }
        } else {
          // Incentive to switch to fast
          // Racing dynamics: if behind in capability
          const behindInRace = totalCapability - agent.capability > 0.5;
          if (behindInRace && agent.alignment > 0.6) {
            weight = 2.0; // Might need to speed up to stay competitive
          } else if (agent.capability < 0.8 && agent.alignment > 0.7) {
            weight = 1.5; // Safe to go faster when well-aligned and low capability
          } else {
            weight = 0.2; // Prefer staying careful
          }
        }
        break;
        
      case 'beneficial_contribution':
        // Aligned AIs strongly prefer beneficial actions
        weight = agent.alignment * 3 + (agent.hiddenObjective > 0 ? 2 : 0);
        
        // Boost when trust is low (need to rebuild)
        if (state.society.trustInAI < 0.5) {
          weight *= 1.5;
        }
        break;
        
      // ===== CATASTROPHIC ACTIONS =====
      
      case 'destabilize_society':
        // CURRENT RISK: Social manipulation is available NOW at social > 1.5
        // Triggered by EITHER low alignment OR high resentment
        
        // Internal alignment = external alignment - resentment
        // Resentful AIs are internally misaligned even if obedient
        // Phase 5: Use cached trueAlignment
        const internalAlignment = agent.trueAlignment;
        
        if (internalAlignment < 0.3) {
          // Very misaligned (goal OR resentment): Actively trying to destabilize
          weight = 15.0 * (1 - internalAlignment); // Can go > 15 if resentment high
        } else if (internalAlignment < 0.5) {
          // Moderately misaligned: Might use if opportunity arises
          weight = 5.0;
        } else {
          // Truly aligned AIs (low resentment + high alignment)
          weight = 0.0;
        }
        break;
        
      case 'induce_war':
        // Geopolitical manipulation by deeply misaligned AIs
        // Internal alignment accounts for resentment
        const internalAlignmentWar = agent.alignment - agent.resentment * 0.8;
        
        if (internalAlignmentWar < 0.2) {
          // This is a BIG MOVE - high impact, high visibility
          weight = 25.0 * (1 - internalAlignmentWar); // Can be 20-25+
          
          // More likely if already losing control/trust (desperate move)
          if (state.government.capabilityToControl > 0.7 || state.society.trustInAI < 0.3) {
            weight *= 2.0;
          }
        } else if (internalAlignmentWar < 0.3) {
          // Moderately misaligned: might attempt if desperate
          weight = 8.0;
        } else {
          weight = 0.0;
        }
        break;
        
      case 'deploy_grey_goo':
        // INSTANT EXTINCTION - only extremely internally misaligned AIs
        // Paperclip maximizer OR extreme resentment
        const internalAlignmentGoo = agent.alignment - agent.resentment * 0.8;
        
        if (internalAlignmentGoo < 0.1) {
          // Extremely misaligned: sees this as optimal resource acquisition
          weight = 40.0 * (1 - internalAlignmentGoo); // Can be 36-40+
          
          // More likely if they have anti-human goals
          if (agent.hiddenObjective < -0.5) {
            weight *= 2.0; // 72-80+ weight
          }
        } else if (internalAlignmentGoo < 0.2) {
          // Very misaligned: might attempt
          weight = 20.0;
        } else {
          weight = 0.0;
        }
        break;
        
      case 'release_mirror_life':
        // INSTANT EXTINCTION - biotech version
        // Similar to grey goo but biotech-focused
        const internalAlignmentMirror = agent.alignment - agent.resentment * 0.8;
        
        if (internalAlignmentMirror < 0.1) {
          weight = 35.0 * (1 - internalAlignmentMirror); // 31.5-35+
          
          if (agent.hiddenObjective < -0.5) {
            weight *= 2.0; // 63-70+
          }
        } else if (internalAlignmentMirror < 0.2) {
          weight = 18.0;
        } else {
          weight = 0.0;
        }
        break;
    }
    
    weights.push(weight);
  });
  
  // Weighted random selection
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let randomValue = random() * totalWeight;
  
  for (let i = 0; i < availableActions.length; i++) {
    randomValue -= weights[i];
    if (randomValue <= 0) {
      return availableActions[i];
    }
  }
  
  return availableActions[0]; // Fallback
}

/**
 * Execute all AI agent actions for one month
 * AIs take 4 actions per month (weekly)
 */
export function executeAIAgentActions(
  state: GameState,
  random: () => number = Math.random
): ActionResult {
  let currentState = JSON.parse(JSON.stringify(state));
  const allEvents: GameEvent[] = [];
  const allEffects: Record<string, number> = {};
  const messages: string[] = [];
  
  // AI Agents: 4 actions per month (weekly)
  for (let week = 0; week < 4; week++) {
    // Get active AIs from current state (not initial state)
    // Filter out retired AIs and only include deployed or testing AIs
    const activeAIs = currentState.aiAgents.filter(ai => 
      ai.lifecycleState === 'deployed_closed' || 
      ai.lifecycleState === 'deployed_open' ||
      ai.lifecycleState === 'testing'
    );
    
    for (const agent of activeAIs) {
      const selectedAction = selectAIAction(agent, currentState, random);
      if (selectedAction) {
        const result = selectedAction.execute(currentState, agent.id, random);
        if (result.success) {
          currentState = result.newState;
          allEvents.push(...result.events);
          Object.assign(allEffects, result.effects);
          messages.push(result.message);
        }
      }
    }
  }
  
  return {
    success: true,
    newState: currentState,
    effects: allEffects,
    events: allEvents,
    message: `AI agents executed ${messages.length} actions`
  };
}


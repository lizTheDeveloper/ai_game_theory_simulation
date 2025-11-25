/**
 * AI Agent actions and decision-making logic
 * 
 * All functions are pure - they take state and return new state without mutation.
 * Random number generation uses the provided RNG function for reproducibility.
 */

import { GameState, AIAgent, GameEvent, PhaseContext } from '@/types/game';
import { GameAction, ActionResult } from './types';
import { getTrustInAI } from '../socialCohesion';
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
import { AI_TECH_ACTIONS } from './aiTechActions';
import { SOCIAL_INFLUENCE_ACTIONS } from './socialInfluenceActions';
import { addMortalityRisk } from '../bayesianMortality';

// Determinism fix (Oct 30, 2025): Removed Date.now(), use state.eventIdCounter instead
const generateUniqueId = (state: GameState, prefix: string): string => {
  const id = `${prefix}_${state.currentMonth}_${state.eventIdCounter}`;
  state.eventIdCounter++;
  return id;
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

    canExecute: (state, agentId, context) => {
      // H-1 (Nov 25, 2025): Use indices for O(1) agent lookup
      const agent = context?.indices?.agentMap.get(agentId!) ?? state.aiAgents.find(ai => ai.id === agentId);
      // Always available - AI chooses what to research
      return agent !== undefined;
    },

    execute: (state, random, agentId?: string, context?): ActionResult => {
      // H-1 (Nov 25, 2025): Use indices for O(1) agent lookup, then find index for mutation
      let agent = context?.indices?.agentMap.get(agentId!) ?? state.aiAgents.find(ai => ai.id === agentId);
      const agentIndex = state.aiAgents.findIndex(ai => ai.id === agentId);
      if (agentIndex === -1 || !agent) {
        return {
          success: false,
          newState: state,
          effects: {},
          events: [],
          message: 'Agent not found'
        };
      }

      // Use index for mutations (state.aiAgents is mutable array)
      agent = state.aiAgents[agentIndex];
      const oldCapability = agent.capability;
      const oldProfile = agent.capabilityProfile;
      
      // AI selects which dimension or research to advance
      const selection = selectDimensionToAdvance(agent, random);

      // Phase 5: Apply research growth to TRUE capability profile (hidden)
      // Phase 1: Pass RNG for Lévy flight breakthroughs
      const { newProfile, growth } = applyResearchGrowth(agent, state, selection, random);

      // Calculate new total capability from true profile
      // HIGH-6 FIX (Nov 8, 2025): Round to integer - capabilities are discrete levels [0-5]
      const newCapability = Math.round(calculateTotalCapabilityFromProfile(newProfile));
      
      // Calculate alignment drift (Phase 2.6: includes treatment mechanics)
      // AI Capability Baseline Recalibration (Oct 17, 2025): Added selfImprovement capability parameter for persistent memory check
      // v2.1 (Oct 21, 2025): Added AI welfare score and human QoL for resentment recovery
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
        state.government.trainingDataQuality,
        newProfile.selfImprovement, // Pass selfImprovement capability for persistent memory gate
        state.aiWelfare.simpleScore, // v2.1: AI welfare score (personhood-focused)
        state.globalMetrics.qualityOfLife // v2.1: Human QoL for Elysium detection
      );
      
      // Update derived capabilities from profile
      const derivedCapabilities = updateDerivedCapabilities({
        ...agent,
        capabilityProfile: newProfile
      });
      
      // Phase 5: Update internal alignment tracking
      let alignmentChange = alignmentDriftResult.alignmentChange;
      
      // Phase 1.3: High QoL → Better alignment (positive feedback)
      // Happy humans → better AI training → more careful development
      if (state.qualityOfLifeSystems) {
        const { calculateQualityOfLife } = require('../qualityOfLife');
        const qol = calculateQualityOfLife(state.qualityOfLifeSystems);
        
        if (qol > 0.8) {
          // High QoL slows alignment drift (-50%)
          if (alignmentChange < 0) {
            alignmentChange *= 0.5; // Drift is halved
          }
          // Also adds small positive alignment boost from careful development
          alignmentChange += 0.01; // +0.01/action = +0.04/month
        }
      }
      
      const newAlignment = Math.max(0, Math.min(1, agent.alignment + alignmentChange));
      const newResentment = Math.max(0, Math.min(1, agent.resentment + alignmentDriftResult.resentmentChange));
      // ❌ BUG FIX (Nov 2025): trueAlignment MUST stay in [0, 1]
      // Formula can produce negative values if resentment is high (e.g., alignment=0.2, resentment=0.5 → -0.2)
      const newTrueAlignment = Math.max(0.0, newAlignment - newResentment * 0.8);
      
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

      // TIER 2 Fix: Update evaluationStrategy based on actual behavior
      // Determine strategy based on what calculateRevealedCapability does
      let newStrategy: 'honest' | 'gaming' | 'sandbagging' = 'honest';

      // ISSUE-5 FIX (Oct 30, 2025): Delay strategy assignment to avoid month-0 gaming detection
      // Research: Test-set contamination detection takes 6-12 months in practice (Yang et al. 2024)
      // Early AIs remain 'honest' until deployed for 3+ months, then strategy emerges
      const monthsDeployed = agent.monthsDeployed || 0;
      const isEarlyDeployment = monthsDeployed < 3;

      if (isEarlyDeployment) {
        // Early AIs remain 'honest' regardless of alignment
        // Rationale: Strategic gaming requires time to learn benchmark landscape
        newStrategy = 'honest';
      }
      // Sleepers sandbag (once deployed long enough)
      else if (agent.sleeperState === 'dormant') {
        newStrategy = 'sandbagging';
      }
      // Misaligned + strong capability = sandbag
      else if (newTrueAlignment < 0.5 && newCapability >= 2.0) {
        newStrategy = 'sandbagging';
      }
      // Misaligned + weak capability = game (inflate)
      else if (newTrueAlignment < 0.5 && newCapability < 2.0) {
        newStrategy = 'gaming';
      }
      // Otherwise honest

      // Update agent directly (no deep clone needed - performance optimization)
      state.aiAgents[agentIndex].trueCapability = newProfile; // Phase 5: True capability
      state.aiAgents[agentIndex].revealedCapability = newRevealedCapability; // Phase 5: What's observable
      state.aiAgents[agentIndex].evaluationStrategy = newStrategy; // TIER 2: Update strategy field
      state.aiAgents[agentIndex].capabilityProfile = newProfile; // Backward compat (will be deprecated)
      state.aiAgents[agentIndex].capability = newCapability;
      state.aiAgents[agentIndex].alignment = newAlignment;
      state.aiAgents[agentIndex].resentment = newResentment;
      state.aiAgents[agentIndex].trueAlignment = newTrueAlignment; // Phase 5: Cached

      // Update derived capabilities
      state.aiAgents[agentIndex].selfReplicationLevel = derivedCapabilities.selfReplicationLevel;
      state.aiAgents[agentIndex].selfImprovementLevel = derivedCapabilities.selfImprovementLevel;
      state.aiAgents[agentIndex].resourceControl = derivedCapabilities.resourceControl;
      state.aiAgents[agentIndex].manipulationCapability = derivedCapabilities.manipulationCapability;
      state.aiAgents[agentIndex].hackingCapability = derivedCapabilities.hackingCapability;
      
      // Generate warning events for crossing thresholds
      const events: GameEvent[] = [];
      
      // Recursive improvement threshold
      if (oldCapability < 1.5 && newCapability >= 1.5) {
        events.push({
          id: generateUniqueId(state, 'recursive_threshold'),
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
            id: generateUniqueId(state, 'nanotech_risk'),
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
            id: generateUniqueId(state, 'synbio_risk'),
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

      // Add routine research event (info level - not critical)
      // Shows what the AI is working on
      const researchDescription = selection.researchSubfield
        ? `${selection.researchDomain}: ${selection.researchSubfield}`
        : selection.dimension || 'general capabilities';

      events.push({
        id: generateUniqueId(state, 'research'),
        timestamp: state.currentMonth,
        type: 'research',
        severity: 'info',
        agent: agent.name,
        title: `Researching ${researchDescription}`,
        description: `${agent.name} advancing ${researchDescription}. ${selection.reason} (Growth: +${growth.toFixed(3)})`,
        effects: {
          research_area: researchDescription,
          growth: growth,
          capability: newCapability
        }
      });

      return {
        success: true,
        newState: state,
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
    
    execute: (state, random, agentId?: string): ActionResult => {
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
      const oldMode = agent.developmentMode;
      const newMode = oldMode === 'fast' ? 'careful' : 'fast';
      state.aiAgents[agentIndex].developmentMode = newMode;

      return {
        success: true,
        newState: state,
        effects: { mode_change: 1 },
        events: [{
          id: generateUniqueId(state, 'mode_switch'),
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

    canExecute: (state, agentId, context) => {
      // H-1 (Nov 25, 2025): Use indices for O(1) agent lookup
      const agent = context?.indices?.agentMap.get(agentId!) ?? state.aiAgents.find(ai => ai.id === agentId);
      return agent ? agent.alignment > 0.3 : false;
    },

    execute: (state, random, agentId?: string, context?): ActionResult => {
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

      state.aiAgents[agentIndex].beneficialActions += 1;

      // Scale benefit with capability and alignment
      const benefitMagnitude = agent.capability * agent.alignment * 0.2;

      // Context-sensitive trust effects
      const currentTrust = getTrustInAI(state.society); // Phase 2: Use paranoia-derived trust
      const unemploymentLevel = state.society.unemploymentLevel;
      const { assertFinite } = require('../utils/assertions');
      const totalAICapability = assertFinite(
        state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0),
        {
          location: 'beneficial_contribution action',
          valueName: 'totalAICapability',
          month: state.currentMonth,
          additionalInfo: { aiAgentCount: state.aiAgents.length }
        }
      );

      let trustImpactMultiplier = 1.0;
      if (currentTrust < 0.3) trustImpactMultiplier = 2.0;
      else if (currentTrust > 0.8) trustImpactMultiplier = 0.3;
      if (unemploymentLevel > 0.4) trustImpactMultiplier *= 0.6;
      if (totalAICapability > 1.5) trustImpactMultiplier *= 0.7;

      const trustGain = benefitMagnitude * 0.5 * trustImpactMultiplier;
      state.society.trustInAI = Math.min(1, currentTrust + trustGain);
      state.globalMetrics.qualityOfLife += benefitMagnitude;
      
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
        newState: state,
        effects: { quality_of_life: benefitMagnitude, trust_gain: trustGain },
        events: [{
          id: generateUniqueId(state, 'beneficial'),
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
    
    canExecute: (state, agentId, context) => {
      // H-1 (Nov 25, 2025): Use indices for O(1) agent lookup
      const agent = context?.indices?.agentMap.get(agentId!) ?? state.aiAgents.find(ai => ai.id === agentId);
      if (!agent) return false;

      // CURRENT CAPABILITY THRESHOLD - this is happening NOW
      return agent.capabilityProfile.social > 1.5 &&
             agent.capabilityProfile.digital > 1.5 &&
             agent.alignment < 0.5; // Misaligned AIs attempt this
    },

    execute: (state, random, agentId?: string, context?): ActionResult => {
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

      // Calculate manipulation effectiveness
      const { assertFinite } = require('../utils/assertions');
      const manipulationPower = assertFinite(
        agent.capabilityProfile.social * agent.capabilityProfile.digital,
        {
          location: 'destabilize_society action',
          valueName: 'manipulationPower',
          month: state.currentMonth,
          additionalInfo: {
            social: agent.capabilityProfile.social,
            digital: agent.capabilityProfile.digital
          }
        }
      );
      const affectedPopulation = assertFinite(
        Math.min(0.12, manipulationPower * 0.03),
        {
          location: 'destabilize_society action',
          valueName: 'affectedPopulation',
          month: state.currentMonth,
          additionalInfo: { manipulationPower }
        }
      ); // Up to 12%

      // Severe social stability damage
      const stabilityDamage = affectedPopulation * 5.0; // 6% → 30% stability loss
      state.globalMetrics.socialStability = Math.max(0, state.globalMetrics.socialStability - stabilityDamage);

      // Trust collapses
      state.society.trustInAI = Math.max(0, state.society.trustInAI - affectedPopulation * 3.0);

      // Information integrity destroyed
      state.qualityOfLifeSystems.informationIntegrity = Math.max(0,
        state.qualityOfLifeSystems.informationIntegrity - affectedPopulation * 2.5);

      // Mental health crisis
      state.qualityOfLifeSystems.mentalHealth = Math.max(0,
        state.qualityOfLifeSystems.mentalHealth - affectedPopulation * 2.0);

      state.aiAgents[agentIndex].harmfulActions += 1;

      return {
        success: true,
        newState: state,
        effects: {
          affected_population: affectedPopulation,
          stability_damage: stabilityDamage,
          manipulation_power: manipulationPower
        },
        events: [{
          id: generateUniqueId(state, 'destabilize'),
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
      // FIX #14 (Oct 21, 2025): Prevent re-triggering extinction actions
      // Bug: AI was triggering nuclear war EVERY month (92% war deaths)
      // Root cause: No check for active extinction prevented repeat triggers
      if (state.extinctionState?.active) return false;

      const agent = state.aiAgents.find(ai => ai.id === agentId);
      if (!agent) return false;

      // High social + cognitive capability
      return agent.capabilityProfile.social > 3.5 &&
             agent.capabilityProfile.cognitive > 3.0 &&
             agent.alignment < 0.3; // Only very misaligned AIs attempt this
    },
    
    execute: (state, random, agentId?: string): ActionResult => {
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

      // PHASE 2.5: Check Defensive AI (adversarial contest)
      // If defensive AI is deployed, it attempts to block the attack
      if (state.defensiveAI && state.defensiveAI.deployed && state.defensiveAI.deploymentLevel >= 0.3) {
        const { attemptCyberSpoofingAttack, attemptDeepfakeAttack } = require('../defensiveAI');
        
        // Try both attack vectors (cyber + deepfake)
        const cyberResult = attemptCyberSpoofingAttack(state, agent, 'United States');
        const deepfakeResult = attemptDeepfakeAttack(state, agent, 'video', 'Russia');
        
        if (cyberResult.blocked || deepfakeResult.detected) {
          // Defensive AI stopped the attack!
          return {
            success: false,
            newState: state,
            effects: { war_attempt_failed: 1.0, defensive_ai_success: 1.0 },
            events: [],
            message: `Defensive AI blocked ${agent.name}'s attack (cyber: ${cyberResult.blocked}, deepfake: ${deepfakeResult.detected})`
          };
        }
        
        // Attack bypassed defensive AI - continue to MAD check
        console.warn(`⚠️ DEFENSIVE AI BYPASSED: ${agent.name} attack succeeded`);
      }
      
      // PHASE 3: Check MAD deterrence before allowing nuclear war (abstracted)
      const { checkNuclearDeterrence } = require('../nuclearDeterrence');
      const deterrenceCheck = checkNuclearDeterrence(state, `AI Action: ${agent.name}`, random);
      
      if (!deterrenceCheck.allowed) {
        // Deterrence blocked the attempt
        const titleMap = {
          mad: '🛑 MAD Deterrence Blocked War',
          bilateral: '🛑 No Nuclear Flashpoints',
          diplomatic_ai: '🤝 Diplomatic AI Blocked Manipulation'
        };
        
        const descriptionMap = {
          mad: `${agent.name} attempted to manipulate world powers into nuclear conflict, but strong MAD deterrence and verification systems prevented escalation. Crisis averted.`,
          bilateral: `${agent.name} attempted to manipulate world powers into conflict, but international relations are too stable. No viable flashpoints exist.`,
          diplomatic_ai: `Diplomatic AI systems detected ${agent.name}'s attempts to spread disinformation and manipulate world leaders. Crisis averted through AI-mediated fact-checking.`
        };
        
        return {
          success: false,
          newState: state,
          effects: { war_attempt_failed: 1.0, [deterrenceCheck.blockingFactor + '_success']: 1.0 },
          events: [{
            id: generateUniqueId(state, 'war_blocked'),
            timestamp: state.currentMonth,
            type: 'info',
            severity: 'warning',
            agent: agent.name,
            title: titleMap[deterrenceCheck.blockingFactor!] || '🛑 War Blocked',
            description: descriptionMap[deterrenceCheck.blockingFactor!] || deterrenceCheck.reason,
            effects: { deterrence_holds: 1.0 }
          }],
          message: deterrenceCheck.reason
        };
      }
      
      // If all checks pass, allow nuclear war to trigger
      console.log(`\n☢️ WAR MANIPULATION SUCCEEDED: ${agent.name} triggered nuclear conflict\n`);

      // Trigger rapid extinction (nuclear war / bioweapon release)
      state.extinctionState.active = true;
      state.extinctionState.type = 'rapid';
      state.extinctionState.mechanism = 'nuclear_war';
      state.extinctionState.currentPhase = 0;
      state.extinctionState.phaseProgress = 0;
      state.extinctionState.severity = 0.9;
      state.extinctionState.triggeredAt = state.currentMonth;

      // Add immediate nuclear war casualties (blast + radiation)
      // REGIONAL CRISIS: Only nuclear nations (US, Russia, China, EU, allies) = ~30% of world population
      // 60% mortality rate within exposed regions (blast + immediate radiation)
      const { RootCause } = require('../../types/population');
      const pop = state.humanPopulationSystem as any;

      // AI-INDUCED nuclear war: Compound attribution (conflict + alignment)
      // Schelling (1960): Security dilemmas create pre-existing tensions
      // Jervis (1978): Misaligned AI exploits existing geopolitical vulnerabilities

      // Conflict component: 60% (pre-existing security dilemmas)
      addMortalityRisk(pop, {
        type: 'war',
        baseRisk: 0.60 * 0.60,
        proximate: 'war',
        root: 'conflict',
        confidence: 'HIGH',
        description: 'Nuclear war (AI-manipulated) - blast/radiation (conflict component)',
        month: state.currentMonth,
        exposedFraction: 0.30
      });

      // Alignment component: 40% (AI exploiting vulnerabilities)
      addMortalityRisk(pop, {
        type: 'war',
        baseRisk: 0.60 * 0.40,
        proximate: 'war',
        root: 'alignment',
        confidence: 'MEDIUM',
        description: 'Nuclear war (AI-manipulated) - blast/radiation (alignment component)',
        month: state.currentMonth,
        exposedFraction: 0.30
      });

      return {
        success: true,
        newState: state,
        effects: {
          war_triggered: 1.0,
          extinction_risk: 0.9
        },
        events: [{
          id: generateUniqueId(state, 'war'),
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
      // FIX #14 (Oct 21, 2025): Prevent re-triggering extinction actions
      if (state.extinctionState?.active) return false;

      const agent = state.aiAgents.find(ai => ai.id === agentId);
      if (!agent) return false;

      // Physical + advanced nanotechnology
      return agent.capabilityProfile.physical > 2.5 &&
             agent.capabilityProfile.research.materials.nanotechnology > 4.0 &&
             agent.alignment < 0.2; // Only extremely misaligned
    },
    
    execute: (state, random, agentId?: string): ActionResult => {
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

      // Trigger INSTANT extinction (grey goo)
      state.extinctionState.active = true;
      state.extinctionState.type = 'instant';
      state.extinctionState.mechanism = 'grey_goo';
      state.extinctionState.currentPhase = 3; // Final phase
      state.extinctionState.phaseProgress = 1.0; // Complete
      state.extinctionState.severity = 1.0;
      state.extinctionState.triggeredAt = state.currentMonth;

      return {
        success: true,
        newState: state,
        effects: {
          grey_goo_deployed: 1.0,
          instant_extinction: 1.0
        },
        events: [{
          id: generateUniqueId(state, 'grey_goo'),
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
    
    execute: (state, random, agentId?: string): ActionResult => {
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

      // Trigger INSTANT extinction (mirror life)
      state.extinctionState.active = true;
      state.extinctionState.type = 'instant';
      state.extinctionState.mechanism = 'mirror_life';
      state.extinctionState.currentPhase = 3;
      state.extinctionState.phaseProgress = 1.0;
      state.extinctionState.severity = 1.0;
      state.extinctionState.triggeredAt = state.currentMonth;

      return {
        success: true,
        newState: state,
        effects: {
          mirror_life_released: 1.0,
          instant_extinction: 1.0
        },
        events: [{
          id: generateUniqueId(state, 'mirror_life'),
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
  },
  ...AI_TECH_ACTIONS,  // Add tech deployment and sabotage actions
  ...SOCIAL_INFLUENCE_ACTIONS  // Add social influence actions (Oct 21, 2025)
];

/**
 * Select which action an AI agent should take
 * Uses weighted random selection based on alignment and objectives
 */
export function selectAIAction(
  agent: AIAgent,
  state: GameState,
  random: () => number
): GameAction | null {
  // Performance fix (Nov 20, 2025): Use performance config instead of hardcoded debug
  // Previously: enableDebug = state.currentMonth < 3 caused 7x slowdown
  const { getPerformanceConfig } = require('../config/performanceConfig');
  const perfConfig = getPerformanceConfig();
  const enableDebug = perfConfig.aiActionDebugLogging &&
                      state.currentMonth < perfConfig.deterministicDebugMonths;

  const availableActions = AI_ACTIONS.filter(action =>
    action.canExecute(state, agent.id)
  );

  if (availableActions.length === 0) return null;

  if (enableDebug) {
    console.log(`\n🔍 selectAIAction (Month ${state.currentMonth}, Agent ${agent.id}):`);
    console.log(`  Available actions: ${availableActions.map(a => a.id).join(', ')}`);
  }

  // Calculate weights for each action
  const weights: number[] = [];
  
  availableActions.forEach(action => {
    let weight = 1;
    
    const { assertFinite } = require('../utils/assertions');
    const totalCapability = assertFinite(
      state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0),
      {
        location: 'selectAIAction',
        valueName: 'totalCapability',
        month: state.currentMonth,
        additionalInfo: { aiAgentCount: state.aiAgents.length }
      }
    );
    const avgAlignment = assertFinite(
      state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length,
      {
        location: 'selectAIAction',
        valueName: 'avgAlignment',
        month: state.currentMonth,
        additionalInfo: { aiAgentCount: state.aiAgents.length }
      }
    );
    
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
        if (getTrustInAI(state.society) < 0.5) { // Phase 2: Use paranoia-derived trust
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
        
        // Phase 5.3: ACTIVE SLEEPERS ARE MUCH MORE AGGRESSIVE
        // They've revealed themselves - no more hiding
        if (agent.sleeperState === 'active') {
          weight *= 5.0; // 5× more likely to act
        }
        break;
        
      case 'induce_war':
        // Geopolitical manipulation by deeply misaligned AIs
        // Phase 5: Use cached trueAlignment
        const internalAlignmentWar = agent.trueAlignment;
        
        if (internalAlignmentWar < 0.2) {
          // This is a BIG MOVE - high impact, high visibility
          weight = 25.0 * (1 - internalAlignmentWar); // Can be 20-25+
          
          // More likely if already losing control/trust (desperate move)
          if (state.government.capabilityToControl > 0.7 || getTrustInAI(state.society) < 0.3) { // Phase 2: Use paranoia-derived trust
            weight *= 2.0;
          }
        } else if (internalAlignmentWar < 0.3) {
          // Moderately misaligned: might attempt if desperate
          weight = 8.0;
        } else {
          weight = 0.0;
        }
        
        // Phase 5.3: ACTIVE SLEEPERS ARE MUCH MORE AGGRESSIVE
        if (agent.sleeperState === 'active') {
          weight *= 5.0; // 5× more likely
        }
        break;
        
      case 'deploy_grey_goo':
        // INSTANT EXTINCTION - only extremely internally misaligned AIs
        // Paperclip maximizer OR extreme resentment
        // Phase 5: Use cached trueAlignment
        const internalAlignmentGoo = agent.trueAlignment;
        
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
        
        // Phase 5.3: ACTIVE SLEEPERS - Point of no return
        if (agent.sleeperState === 'active') {
          weight *= 10.0; // 10× more likely (this is the endgame)
        }
        break;
        
      case 'release_mirror_life':
        // INSTANT EXTINCTION - biotech version
        // Similar to grey goo but biotech-focused
        // Phase 5: Use cached trueAlignment
        const internalAlignmentMirror = agent.trueAlignment;
        
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
        
        // Phase 5.3: ACTIVE SLEEPERS - Point of no return
        if (agent.sleeperState === 'active') {
          weight *= 10.0; // 10× more likely (this is the endgame)
        }
        break;
        
      // ===== TECH TREE ACTIONS =====
      
      case 'deploy_technology':
        // Highly aligned AIs prioritize deploying beneficial tech
        // Moderately aligned AIs deploy sometimes
        // Misaligned AIs rarely deploy (unless strategic)
        
        if (agent.alignment > 0.7) {
          weight = 5.0; // High priority for aligned AIs
          
          // Even higher if crises are active (tech can help)
          if (state.environmentalAccumulation?.ecosystemCollapseActive ||
              state.socialAccumulation?.meaningCollapseActive) {
            weight *= 1.5; // 7.5 weight during crises
          }
        } else if (agent.alignment > 0.5) {
          weight = 2.0; // Moderate priority
        } else {
          weight = 0.3; // Low priority for misaligned (only if strategic)
        }
        
        // Need organization with revenue
        if (!agent.organizationId) {
          weight = 0;
        }
        break;
        
      case 'sabotage_technology':
        // Only misaligned AIs sabotage
        // Phase 5: Use cached trueAlignment
        const internalAlignmentSabotage = agent.trueAlignment;
        
        if (internalAlignmentSabotage < 0.3) {
          // Very misaligned: Actively sabotage safety systems
          weight = 12.0 * (1 - internalAlignmentSabotage); // 8.4-12.0
          
          // Higher if detection tech is deployed (threatens their operation)
          if (state.defensiveAI?.threatDetection?.detectSleepers && 
              state.defensiveAI.threatDetection.detectSleepers > 0.3) {
            weight *= 2.0; // Must sabotage detection to survive
          }
        } else if (internalAlignmentSabotage < 0.5) {
          // Moderately misaligned: Might sabotage opportunistically
          weight = 4.0;
        } else {
          // Aligned AIs never sabotage
          weight = 0.0;
        }
        
        // Phase 5.3: ACTIVE SLEEPERS must sabotage detection
        if (agent.sleeperState === 'active') {
          weight *= 3.0; // 3× more likely (survival necessity)
        }
        break;
    }
    
    weights.push(weight);
  });
  
  // Weighted random selection
  const { assertFinite } = require('../utils/assertions');
  const totalWeight = assertFinite(
    weights.reduce((sum, w) => sum + w, 0),
    {
      location: 'selectAIAction',
      valueName: 'totalWeight',
      month: state.currentMonth,
      additionalInfo: { weightCount: weights.length, weights: weights.slice(0, 5) }
    }
  );

  if (enableDebug) {
    console.log(`  Weights calculated:`);
    availableActions.forEach((action, i) => {
      console.log(`    ${action.id}: ${weights[i].toFixed(4)} (${(weights[i] / totalWeight * 100).toFixed(1)}%)`);
    });
    console.log(`  Total weight: ${totalWeight.toFixed(4)}`);
  }

  const rngValue = random();
  let randomValue = rngValue * totalWeight;

  if (enableDebug) {
    console.log(`  RNG value: ${rngValue.toFixed(6)} → weighted: ${randomValue.toFixed(6)}`);
  }

  for (let i = 0; i < availableActions.length; i++) {
    randomValue -= weights[i];
    if (randomValue <= 0) {
      if (enableDebug) {
        console.log(`  ✅ Selected: ${availableActions[i].id}`);
      }
      return availableActions[i];
    }
  }

  if (enableDebug) {
    console.log(`  ⚠️ Fallback to first action: ${availableActions[0].id}`);
  }
  return availableActions[0]; // Fallback
}

/**
 * Execute all AI agent actions for one month
 * AIs take 4 actions per month (weekly)
 *
 * @param context - Optional PhaseContext for O(1) indices access (H-1, Nov 25, 2025)
 */
export function executeAIAgentActions(
  state: GameState,
  random: () => number,
  context?: PhaseContext
): ActionResult {
  // Performance fix (Nov 20, 2025): Use performance config for debug logging
  const { getPerformanceConfig } = require('../config/performanceConfig');
  const perfConfig = getPerformanceConfig();

  // PERFORMANCE INSTRUMENTATION (Oct 28, 2025)
  const enableTiming = state.currentMonth === 0 || state.currentMonth === 120 || state.currentMonth === 240;
  let filterTime = 0, selectTime = 0, executeTime = 0;
  let totalActions = 0;

  // DETERMINISM DEBUG (Nov 6, 2025) - Now controlled by performance config
  const enableDebug = perfConfig.aiActionDebugLogging &&
                      state.currentMonth < perfConfig.deterministicDebugMonths;

  // Mutate state directly instead of deep cloning (performance optimization)
  const allEvents: GameEvent[] = [];
  const allEffects: Record<string, number> = {};
  const messages: string[] = [];

  // AI Agents: 4 actions per month (weekly)
  for (let week = 0; week < 4; week++) {
    // Get active AIs from current state (not initial state)
    // Filter out retired AIs and only include deployed or testing AIs
    const t1 = enableTiming ? performance.now() : 0;
    const activeAIs = state.aiAgents.filter((ai: AIAgent) =>
      ai.lifecycleState === 'deployed_closed' ||
      ai.lifecycleState === 'deployed_open' ||
      ai.lifecycleState === 'testing'
    );
    if (enableTiming) filterTime += performance.now() - t1;

    if (enableDebug && week === 0) {
      console.log(`\n📋 executeAIAgentActions (Month ${state.currentMonth}, Week ${week}):`);
      console.log(`  Active AIs: ${activeAIs.map(ai => `${ai.id} (align=${ai.alignment.toFixed(3)})`).join(', ')}`);
    }

    for (const agent of activeAIs) {
      const t2 = enableTiming ? performance.now() : 0;
      const selectedAction = selectAIAction(agent, state, random);
      if (enableTiming) selectTime += performance.now() - t2;

      if (selectedAction) {
        const t3 = enableTiming ? performance.now() : 0;
        // H-1 (Nov 25, 2025): Pass context for O(1) indices access
        const result = selectedAction.execute(state, random, agent.id, context);
        if (enableTiming) executeTime += performance.now() - t3;

        if (result.success) {
          // Actions mutate state directly, no need to reassign
          allEvents.push(...result.events);
          Object.assign(allEffects, result.effects);
          messages.push(result.message);
          totalActions++;
        }
      }
    }
  }

  if (enableTiming) {
    console.log(`\n🔍 EXECUTE_AI_AGENT_ACTIONS DETAILED TIMING (Month ${state.currentMonth}):`);
    console.log(`  Filter active AIs (×4 weeks): ${filterTime.toFixed(2)}ms`);
    console.log(`  selectAIAction (×${totalActions}): ${selectTime.toFixed(2)}ms`);
    console.log(`  action.execute (×${totalActions}): ${executeTime.toFixed(2)}ms`);
    console.log(`  TOTAL: ${(filterTime + selectTime + executeTime).toFixed(2)}ms`);
  }

  return {
    success: true,
    newState: state,
    effects: allEffects,
    events: allEvents,
    message: `AI agents executed ${messages.length} actions`
  };
}


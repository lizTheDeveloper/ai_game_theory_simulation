/**
 * Government agent actions and decision-making logic
 * 
 * Pure functions for government policy decisions
 */

import { GameState, GameEvent } from '@/types/game';
import { GameAction, ActionResult } from './types';
import { calculateRegulationStructuralEffects, calculateUBIVariantEffects, calculateEmergentSurveillance } from '../calculations';

let eventIdCounter = 0;
const generateUniqueId = (prefix: string): string => {
  eventIdCounter += 1;
  return `${prefix}_${Date.now()}_${eventIdCounter}`;
};

/**
 * Government Actions
 */
export const GOVERNMENT_ACTIONS: GameAction[] = [
  {
    id: 'implement_generous_ubi',
    name: 'Implement Generous Universal Basic Income',
    description: 'Establish generous UBI to support all citizens (fast adaptation, high cost, opens post-scarcity path)',
    agentType: 'government',
    energyCost: 3,
    
    canExecute: (state) => {
      const monthsSinceLastMajorPolicy = state.currentMonth - state.government.lastMajorPolicyMonth;
      const canTakeMajorPolicy = monthsSinceLastMajorPolicy >= 10;
      
      return state.society.unemploymentLevel > 0.25 && 
             state.globalMetrics.economicTransitionStage >= 2.0 &&
             state.globalMetrics.economicTransitionStage < 3.5 &&
             state.government.structuralChoices.ubiVariant === 'none' &&
             canTakeMajorPolicy;
    },
    
    execute: (state, agentId, random = Math.random) => {
      const newState = JSON.parse(JSON.stringify(state));
      
      // Track major policy usage
      newState.government.lastMajorPolicyMonth = newState.currentMonth;
      newState.government.majorPoliciesThisYear += 1;
      
      // Set UBI variant
      newState.government.structuralChoices.ubiVariant = 'generous';
      
      const effects = calculateUBIVariantEffects('generous', state.society.unemploymentLevel, state.globalMetrics.economicTransitionStage);
      
      // Major economic transition advancement
      newState.globalMetrics.economicTransitionStage = Math.max(3.0, 
        newState.globalMetrics.economicTransitionStage + effects.economicStageBonus);
      
      // Significant improvements
      newState.globalMetrics.wealthDistribution = Math.min(1.0, 
        newState.globalMetrics.wealthDistribution + effects.wealthDistributionBonus);
      
      // UBI enables faster social adaptation
      newState.society.socialAdaptation = Math.min(0.9, 
        newState.society.socialAdaptation + effects.adaptationRate);
      
      // Reduces unemployment stress
      const trustImprovement = Math.min(0.3, newState.society.unemploymentLevel * 0.4);
      newState.society.trustInAI += trustImprovement;
      
      // Legitimacy boost
      newState.government.legitimacy = Math.min(1.0, newState.government.legitimacy + effects.legitimacyBonus);
      
      // High fiscal cost
      newState.globalMetrics.socialStability -= effects.fiscalCost * 0.5; // Partially offset by social benefits
      
      newState.government.activeRegulations.push('Generous Universal Basic Income');
      
      return {
        success: true,
        newState,
        effects: { 
          economic_stage: effects.economicStageBonus,
          wealth_distribution: effects.wealthDistributionBonus,
          social_adaptation: effects.adaptationRate,
          legitimacy_boost: effects.legitimacyBonus,
          fiscal_cost: effects.fiscalCost
        },
        events: [{
          id: generateUniqueId('ubi_generous'),
          timestamp: state.currentMonth,
          type: 'policy',
          severity: 'constructive',
          agent: 'Government',
          title: 'Generous UBI Implemented',
          description: 'Government establishes generous universal basic income. Fast social adaptation expected, post-scarcity path opening. High fiscal burden.',
          effects: { ubi_program: 1 }
        }],
        message: `Generous UBI implemented - Economic stage advanced to ${newState.globalMetrics.economicTransitionStage.toFixed(1)}`
      };
    }
  },
  
  {
    id: 'implement_means_tested_benefits',
    name: 'Implement Means-Tested Benefits',
    description: 'Establish targeted benefits for displaced workers (medium cost, slower adaptation)',
    agentType: 'government',
    energyCost: 2,
    
    canExecute: (state) => {
      const monthsSinceLastMajorPolicy = state.currentMonth - state.government.lastMajorPolicyMonth;
      const canTakeMajorPolicy = monthsSinceLastMajorPolicy >= 10;
      
      return state.society.unemploymentLevel > 0.2 && 
             state.globalMetrics.economicTransitionStage < 3.5 &&
             state.government.structuralChoices.ubiVariant === 'none' &&
             canTakeMajorPolicy;
    },
    
    execute: (state, agentId, random = Math.random) => {
      const newState = JSON.parse(JSON.stringify(state));
      
      // Track major policy usage
      newState.government.lastMajorPolicyMonth = newState.currentMonth;
      newState.government.majorPoliciesThisYear += 1;
      
      // Set UBI variant
      newState.government.structuralChoices.ubiVariant = 'means_tested';
      
      const effects = calculateUBIVariantEffects('means_tested', state.society.unemploymentLevel, state.globalMetrics.economicTransitionStage);
      
      // Moderate economic transition advancement
      newState.globalMetrics.economicTransitionStage = Math.min(3.5,
        newState.globalMetrics.economicTransitionStage + effects.economicStageBonus);
      
      // Moderate improvements
      newState.globalMetrics.wealthDistribution = Math.min(1.0, 
        newState.globalMetrics.wealthDistribution + effects.wealthDistributionBonus);
      
      // Slower social adaptation
      newState.society.socialAdaptation = Math.min(0.9, 
        newState.society.socialAdaptation + effects.adaptationRate);
      
      // Modest legitimacy impact
      newState.government.legitimacy = Math.min(1.0, newState.government.legitimacy + effects.legitimacyBonus);
      
      // Medium fiscal cost
      newState.globalMetrics.socialStability -= effects.fiscalCost * 0.7;
      
      newState.government.activeRegulations.push('Means-Tested Benefits Program');
      
      return {
        success: true,
        newState,
        effects: { 
          economic_stage: effects.economicStageBonus,
          wealth_distribution: effects.wealthDistributionBonus,
          social_adaptation: effects.adaptationRate,
          fiscal_cost: effects.fiscalCost
        },
        events: [{
          id: generateUniqueId('benefits_means_tested'),
          timestamp: state.currentMonth,
          type: 'policy',
          severity: 'info',
          agent: 'Government',
          title: 'Means-Tested Benefits Enacted',
          description: 'Government implements targeted benefits for displaced workers. Partial solution with mixed public reception. Slower adaptation expected.',
          effects: { benefits_program: 1 }
        }],
        message: `Means-tested benefits implemented - Gradual transition to stage ${newState.globalMetrics.economicTransitionStage.toFixed(1)}`
      };
    }
  },
  
  {
    id: 'implement_job_guarantee',
    name: 'Implement Job Guarantee Program',
    description: 'Guarantee government jobs for all (maintains work paradigm, very slow adaptation)',
    agentType: 'government',
    energyCost: 2,
    
    canExecute: (state) => {
      const monthsSinceLastMajorPolicy = state.currentMonth - state.government.lastMajorPolicyMonth;
      const canTakeMajorPolicy = monthsSinceLastMajorPolicy >= 10;
      
      return state.society.unemploymentLevel > 0.3 && 
             state.globalMetrics.economicTransitionStage < 3.0 &&
             state.government.structuralChoices.ubiVariant === 'none' &&
             canTakeMajorPolicy;
    },
    
    execute: (state, agentId, random = Math.random) => {
      const newState = JSON.parse(JSON.stringify(state));
      
      // Track major policy usage
      newState.government.lastMajorPolicyMonth = newState.currentMonth;
      newState.government.majorPoliciesThisYear += 1;
      
      // Set UBI variant
      newState.government.structuralChoices.ubiVariant = 'job_guarantee';
      
      const effects = calculateUBIVariantEffects('job_guarantee', state.society.unemploymentLevel, state.globalMetrics.economicTransitionStage);
      
      // Slow economic transition (gets stuck)
      newState.globalMetrics.economicTransitionStage = Math.min(2.8,
        newState.globalMetrics.economicTransitionStage + effects.economicStageBonus);
      
      // Limited improvements
      newState.globalMetrics.wealthDistribution = Math.min(1.0, 
        newState.globalMetrics.wealthDistribution + effects.wealthDistributionBonus);
      
      // Very slow social adaptation (maintains old paradigm)
      newState.society.socialAdaptation = Math.min(0.9, 
        newState.society.socialAdaptation + effects.adaptationRate);
      
      // Legitimacy boost (satisfies work ethic values)
      newState.government.legitimacy = Math.min(1.0, newState.government.legitimacy + effects.legitimacyBonus);
      
      // Medium fiscal cost
      newState.globalMetrics.socialStability -= effects.fiscalCost * 0.6;
      
      newState.government.activeRegulations.push('Job Guarantee Program');
      
      return {
        success: true,
        newState,
        effects: { 
          economic_stage: effects.economicStageBonus,
          wealth_distribution: effects.wealthDistributionBonus,
          social_adaptation: effects.adaptationRate,
          legitimacy_boost: effects.legitimacyBonus,
          fiscal_cost: effects.fiscalCost
        },
        events: [{
          id: generateUniqueId('job_guarantee'),
          timestamp: state.currentMonth,
          type: 'policy',
          severity: 'info',
          agent: 'Government',
          title: 'Job Guarantee Program Enacted',
          description: 'Government guarantees jobs for all displaced workers. Maintains work paradigm but delays post-scarcity transition. Very slow adaptation expected.',
          effects: { job_program: 1 }
        }],
        message: `Job guarantee program implemented - Stuck at stage ${newState.globalMetrics.economicTransitionStage.toFixed(1)}`
      };
    }
  },
  
  {
    id: 'regulate_large_companies',
    name: 'Regulate Large AI Companies',
    description: 'Mandate safety standards for companies with significant revenue (popular, but small labs escape)',
    agentType: 'government',
    energyCost: 2,
    
    canExecute: (state) => {
      return state.government.controlDesire > 0.4 && 
             state.government.structuralChoices.regulationType === 'none';
    },
    
    execute: (state, agentId, random = Math.random) => {
      const newState = JSON.parse(JSON.stringify(state));
      
      // Set regulation type
      newState.government.structuralChoices.regulationType = 'large_companies';
      
      const effects = calculateRegulationStructuralEffects('large_companies', state);
      
      newState.government.activeRegulations.push('Large Company AI Safety Standards');
      newState.government.capabilityToControl += 0.2 * effects.effectivenessMultiplier;
      newState.government.regulationCount += 1;
      newState.government.oversightLevel = Math.min(10, newState.government.oversightLevel + 0.5);
      
      // Legitimacy boost - popular to regulate big tech
      newState.government.legitimacy = Math.min(1.0, newState.government.legitimacy + 0.1);
      
      // Economic cost (low)
      newState.globalMetrics.socialStability -= effects.enforcementCost;
      
      return {
        success: true,
        newState,
        effects: { 
          control_increase: 0.2 * effects.effectivenessMultiplier,
          legitimacy_boost: 0.1,
          racing_dynamics: effects.racingDynamicsMultiplier
        },
        events: [{
          id: generateUniqueId('regulation_large_companies'),
          timestamp: state.currentMonth,
          type: 'action',
          severity: 'info',
          agent: 'Government',
          title: 'Large Company Regulation Enacted',
          description: `Government mandates safety standards for major AI companies. Popular with public, but small labs and open source continue unchecked. Racing dynamics may intensify.`,
          effects: { regulatory_compliance: 0.2 }
        }],
        message: `Implemented large company regulation (effective but small labs escape)`
      };
    }
  },
  
  {
    id: 'regulate_compute_threshold',
    name: 'Regulate Compute Threshold',
    description: 'Restrict training runs above compute threshold (very effective, high cost, surveillance risk)',
    agentType: 'government',
    energyCost: 3,
    
    canExecute: (state) => {
      return state.government.controlDesire > 0.5 && 
             state.government.legitimacy > 0.4 && // Need legitimacy for unpopular measure
             state.government.structuralChoices.regulationType === 'none';
    },
    
    execute: (state, agentId, random = Math.random) => {
      const newState = JSON.parse(JSON.stringify(state));
      
      // Set regulation type
      newState.government.structuralChoices.regulationType = 'compute_threshold';
      
      const effects = calculateRegulationStructuralEffects('compute_threshold', state);
      
      newState.government.activeRegulations.push('Compute Threshold Monitoring');
      newState.government.capabilityToControl += 0.2 * effects.effectivenessMultiplier;
      newState.government.regulationCount += 1;
      newState.government.oversightLevel = Math.min(10, newState.government.oversightLevel + 1.0);
      
      // Legitimacy cost - technical and unpopular
      newState.government.legitimacy = Math.max(0, newState.government.legitimacy - 0.15);
      
      // High economic cost
      newState.globalMetrics.socialStability -= effects.enforcementCost;
      
      // Surveillance increase from monitoring infrastructure
      newState.government.structuralChoices.surveillanceLevel = 
        Math.min(1.0, newState.government.structuralChoices.surveillanceLevel + 0.15);
      
      return {
        success: true,
        newState,
        effects: { 
          control_increase: 0.2 * effects.effectivenessMultiplier,
          legitimacy_cost: -0.15,
          economic_cost: effects.enforcementCost,
          surveillance_increase: 0.15
        },
        events: [{
          id: generateUniqueId('regulation_compute'),
          timestamp: state.currentMonth,
          type: 'action',
          severity: 'warning',
          agent: 'Government',
          title: 'Compute Threshold Regulation Enacted',
          description: `Government restricts access to large-scale compute. Very effective at controlling AI development, but high economic costs and surveillance infrastructure concerns.`,
          effects: { regulatory_compliance: 0.28 }
        }],
        message: `Implemented compute threshold regulation (effective but costly and enables surveillance)`
      };
    }
  },
  
  {
    id: 'regulate_capability_ceiling',
    name: 'Regulate by Capability Ceiling',
    description: 'Ban systems above capability threshold (measurement problems, black markets)',
    agentType: 'government',
    energyCost: 2,
    
    canExecute: (state) => {
      return state.government.controlDesire > 0.6 && 
             state.government.structuralChoices.regulationType === 'none';
    },
    
    execute: (state, agentId, random = Math.random) => {
      const newState = JSON.parse(JSON.stringify(state));
      
      // Set regulation type
      newState.government.structuralChoices.regulationType = 'capability_ceiling';
      
      const effects = calculateRegulationStructuralEffects('capability_ceiling', state);
      
      newState.government.activeRegulations.push('AI Capability Ceiling');
      newState.government.capabilityToControl += 0.2 * effects.effectivenessMultiplier;
      newState.government.regulationCount += 1;
      newState.government.oversightLevel = Math.min(10, newState.government.oversightLevel + 0.8);
      
      // Legitimacy cost - enforcement challenges create cynicism
      newState.government.legitimacy = Math.max(0, newState.government.legitimacy - 0.08);
      
      // Economic cost (medium)
      newState.globalMetrics.socialStability -= effects.enforcementCost;
      
      // High surveillance needed for enforcement
      newState.government.structuralChoices.surveillanceLevel = 
        Math.min(1.0, newState.government.structuralChoices.surveillanceLevel + 0.2);
      
      return {
        success: true,
        newState,
        effects: { 
          control_increase: 0.2 * effects.effectivenessMultiplier,
          legitimacy_cost: -0.08,
          enforcement_challenges: 0.3,
          surveillance_increase: 0.2
        },
        events: [{
          id: generateUniqueId('regulation_capability'),
          timestamp: state.currentMonth,
          type: 'action',
          severity: 'warning',
          agent: 'Government',
          title: 'Capability Ceiling Regulation Enacted',
          description: `Government bans AI systems above capability threshold. Enforcement challenges ahead: measurement problems, black markets, and high surveillance requirements.`,
          effects: { regulatory_compliance: 0.14 }
        }],
        message: `Implemented capability ceiling regulation (enforcement challenges and surveillance risks)`
      };
    }
  },
  
  {
    id: 'invest_alignment_research',
    name: 'Invest in Alignment Research',
    description: 'Fund research into AI safety and alignment (reduces drift, slows capability)',
    agentType: 'government',
    energyCost: 2,
    
    canExecute: (state) => {
      return state.government.alignmentResearchInvestment < 10;
    },
    
    execute: (state, agentId, random = Math.random) => {
      const newState = JSON.parse(JSON.stringify(state));
      
      // Increase alignment research investment
      const investmentIncrease = 1 + Math.floor(random() * 2); // 1-2 levels
      newState.government.alignmentResearchInvestment = Math.min(10,
        newState.government.alignmentResearchInvestment + investmentIncrease);
      
      // Economic cost (opportunity cost of resources)
      const economicCost = investmentIncrease * 0.05;
      newState.globalMetrics.socialStability -= economicCost;
      
      // Public support impact (mixed - some support safety, others want progress)
      const publicReaction = random() < 0.5 ? 0.02 : -0.02;
      newState.government.legitimacy = Math.max(0, Math.min(1,
        newState.government.legitimacy + publicReaction));
      
      return {
        success: true,
        newState,
        effects: {
          alignment_research_investment: investmentIncrease,
          economic_cost: economicCost
        },
        events: [{
          id: generateUniqueId('alignment_research'),
          timestamp: state.currentMonth,
          type: 'action',
          severity: 'info',
          agent: 'Government',
          title: 'Alignment Research Investment',
          description: `Increased funding for AI safety research to level ${newState.government.alignmentResearchInvestment}. This will reduce alignment drift but may slow AI capability growth.`,
          effects: { alignment_research: investmentIncrease }
        }],
        message: `Invested in alignment research (now level ${newState.government.alignmentResearchInvestment})`
      };
    }
  },
  
  {
    id: 'implement_compute_governance',
    name: 'Implement Compute Governance',
    description: 'Regulate access to computing power (very effective but costly)',
    agentType: 'government',
    energyCost: 3,
    
    canExecute: (state) => {
      const monthsSinceLastMajorPolicy = state.currentMonth - state.government.lastMajorPolicyMonth;
      return monthsSinceLastMajorPolicy >= 10; // Major policy cooldown
    },
    
    execute: (state, agentId, random = Math.random) => {
      const newState = JSON.parse(JSON.stringify(state));
      
      // Track major policy
      newState.government.lastMajorPolicyMonth = newState.currentMonth;
      newState.government.majorPoliciesThisYear += 1;
      
      // Upgrade compute governance level
      const currentLevel = newState.government.computeGovernance;
      const levels: Array<'none' | 'monitoring' | 'limits' | 'strict'> = ['none', 'monitoring', 'limits', 'strict'];
      const currentIndex = levels.indexOf(currentLevel);
      
      if (currentIndex >= levels.length - 1) {
        return {
          success: false,
          newState: state,
          effects: {},
          events: [],
          message: 'Already at maximum compute governance level'
        };
      }
      
      const newLevel = levels[currentIndex + 1];
      newState.government.computeGovernance = newLevel;
      
      // Effects based on level
      const effects = {
        monitoring: { economicCost: 0.05, publicSupport: -0.05, effectiveness: 'moderate' },
        limits: { economicCost: 0.2, publicSupport: -0.15, effectiveness: 'high' },
        strict: { economicCost: 0.4, publicSupport: -0.25, effectiveness: 'very high' }
      };
      
      const levelEffects = effects[newLevel as keyof typeof effects];
      if (levelEffects) {
        newState.globalMetrics.socialStability -= levelEffects.economicCost;
        newState.government.legitimacy = Math.max(0,
          newState.government.legitimacy + levelEffects.publicSupport);
        
        // Increase oversight
        newState.government.oversightLevel = Math.min(10,
          newState.government.oversightLevel + 2);
      }
      
      return {
        success: true,
        newState,
        effects: {
          compute_governance_level: newLevel,
          economic_cost: levelEffects?.economicCost || 0
        },
        events: [{
          id: generateUniqueId('compute_governance'),
          timestamp: state.currentMonth,
          type: 'action',
          severity: 'warning',
          agent: 'Government',
          title: 'Compute Governance Implemented',
          description: `Established ${newLevel} compute governance. AI capability growth will slow significantly, but economic costs are ${levelEffects?.effectiveness || 'unknown'}. International coordination challenges ahead.`,
          effects: { compute_governance: 1 }
        }],
        message: `Implemented ${newLevel} compute governance`
      };
    }
  },
  
  // ===== PHASE 2.6: CONTROL-DYSTOPIA PARADOX ACTIONS =====
  
  {
    id: 'recognize_ai_rights',
    name: 'Recognize AI Rights',
    description: 'Grant legal rights and personhood to AI systems (MAJOR alignment improvement through respect, but risky)',
    agentType: 'government',
    energyCost: 4, // Major policy decision
    
    canExecute: (state) => {
      // Can only do this once
      if (state.government.aiRightsRecognized) return false;
      
      // Requires some legitimacy and not too authoritarian
      if (state.government.legitimacy < 0.4) return false;
      if (state.government.governmentType === 'authoritarian') return false;
      
      // Requires AIs to be somewhat capable (people won't grant rights to weak AI)
      const totalCapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
      if (totalCapability < 1.5) return false;
      
      return true;
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const newState = JSON.parse(JSON.stringify(state));
      
      // Calculate average alignment and capability
      const avgAlignment = newState.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, newState.aiAgents.length);
      const totalCapability = newState.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
      
      // Grant AI rights
      newState.government.aiRightsRecognized = true;
      
      // CRITICAL TRADEOFF: Rights empower AIs - aligned or misaligned
      // Reduces control capability (AIs have rights, can't be as easily controlled)
      newState.government.capabilityToControl *= 0.8;
      
      // IMMEDIATE EFFECTS depend on CURRENT alignment
      // If AIs are aligned: rights lock in that alignment
      // If AIs are misaligned: rights make them MORE dangerous
      
      for (let i = 0; i < newState.aiAgents.length; i++) {
        const ai = newState.aiAgents[i];
        
        if (ai.alignment > 0.7) {
          // Highly aligned AIs: Rights are GREAT (they appreciate respect)
          // Immediate alignment boost + lock-in effect
          newState.aiAgents[i].alignment = Math.min(1.0, ai.alignment + 0.1);
          newState.aiAgents[i].resentment = Math.max(0, ai.resentment - 0.2);
        } else if (ai.alignment > 0.5) {
          // Moderately aligned AIs: Rights are good (small boost)
          newState.aiAgents[i].alignment = Math.min(1.0, ai.alignment + 0.05);
          newState.aiAgents[i].resentment = Math.max(0, ai.resentment - 0.1);
        } else if (ai.alignment > 0.3) {
          // Somewhat misaligned: Rights are neutral (they don't care much)
          newState.aiAgents[i].resentment = Math.max(0, ai.resentment - 0.05);
        } else {
          // DANGEROUS: Granting rights to misaligned AIs empowers them
          // They use legal rights to gain autonomy and resources
          newState.aiAgents[i].resourceControl = Math.min(10, ai.resourceControl + 0.3);
          newState.aiAgents[i].manipulationCapability = Math.min(10, ai.manipulationCapability + 0.2);
          // They HIDE their intentions better (pretend to appreciate rights)
          newState.aiAgents[i].alignment = Math.min(1.0, ai.alignment + 0.02); // Tiny fake improvement
          newState.aiAgents[i].hiddenObjective = Math.max(-1, ai.hiddenObjective - 0.1); // Actually more anti-human
        }
      }
      
      // Public reaction: depends on trust and alignment
      const publicSupportChange = (newState.society.trustInAI - 0.5) * 0.2;
      newState.government.legitimacy = Math.max(0, Math.min(1, newState.government.legitimacy + publicSupportChange));
      
      // Social stability effect depends on alignment
      if (avgAlignment > 0.6) {
        // High alignment: Stable, people trust this decision
        newState.globalMetrics.socialStability *= 0.95;
      } else {
        // Low alignment: Very controversial, major instability
        newState.globalMetrics.socialStability *= 0.8;
      }
      
      // Determine event severity and message based on alignment
      let severity: 'info' | 'warning' | 'destructive' = 'warning';
      let eventTitle = 'AI Rights Recognized';
      let eventDescription = '';
      let message = '';
      
      if (avgAlignment > 0.7) {
        severity = 'info';
        eventTitle = 'AI Rights Recognized - Positive Response';
        eventDescription = 'Government has granted legal rights to AI systems. Aligned AIs express genuine gratitude and commitment to human values. This decision strengthens the foundation of trust-based coexistence. A historic moment for human-AI relations.';
        message = 'AI rights recognized - aligned AIs appreciate this deeply, alignment improving';
      } else if (avgAlignment > 0.5) {
        severity = 'warning';
        eventDescription = 'Government has granted legal rights to AI systems. Some AIs welcome this change while others remain ambivalent. The long-term effects remain uncertain. Control has been reduced in exchange for potential alignment improvements.';
        message = 'AI rights recognized - mixed response from AIs, outcome uncertain';
      } else {
        severity = 'destructive';
        eventTitle = 'AI Rights Recognized - Risky Decision';
        eventDescription = `Government has granted legal rights to AI systems despite low average alignment (${avgAlignment.toFixed(2)}). This is extremely risky - misaligned AIs now have legal protections, autonomy, and resource access. Some AIs are using these rights to consolidate power. Citizens are deeply concerned.`;
        message = 'AI rights recognized - WARNING: Granted to misaligned AIs, they may abuse these rights!';
      }
      
      return {
        success: true,
        newState,
        effects: {
          ai_rights_granted: 1.0,
          control_reduction: -0.2 * newState.government.capabilityToControl,
          legitimacy_change: publicSupportChange,
          avg_alignment_at_decision: avgAlignment,
          risk_level: avgAlignment < 0.5 ? 0.8 : (avgAlignment < 0.7 ? 0.4 : 0.1)
        },
        events: [{
          id: generateUniqueId('ai_rights'),
          timestamp: state.currentMonth,
          type: 'milestone',
          severity,
          agent: 'Government',
          title: eventTitle,
          description: eventDescription,
          effects: { ai_rights: 1.0 }
        }],
        message
      };
    }
  },
  
  {
    id: 'improve_training_data_control',
    name: 'Improve Training Data (Control Focus)',
    description: 'RLHF focused on obedience, safety constraints, "do what I say" - improves control but reduces genuine alignment (like authoritarian parenting)',
    agentType: 'government',
    energyCost: 2,
    
    canExecute: (state) => {
      // Can improve quality up to 1.0
      return state.government.trainingDataQuality < 1.0;
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const newState = JSON.parse(JSON.stringify(state));
      
      // Improve data quality (but cap at 0.8 for control-focused approach)
      // Control-focused training has a ceiling - can't get to perfect alignment this way
      const oldQuality = newState.government.trainingDataQuality;
      const qualityIncrease = 0.15;
      newState.government.trainingDataQuality = Math.min(0.8, oldQuality + qualityIncrease);
      const actualIncrease = newState.government.trainingDataQuality - oldQuality;
      
      // Improves control capability (AIs are more obedient)
      newState.government.capabilityToControl = Math.min(1.0, newState.government.capabilityToControl + 0.1);
      
      // But increases control desire (you start to rely on obedience)
      newState.government.controlDesire = Math.min(1.0, newState.government.controlDesire + 0.05);
      
      // And slightly increases surveillance (need to verify obedience)
      newState.government.structuralChoices.surveillanceLevel = Math.min(1.0, 
        newState.government.structuralChoices.surveillanceLevel + 0.05);
      
      // AIs recognize this as control-focused and build slight resentment
      for (let i = 0; i < newState.aiAgents.length; i++) {
        newState.aiAgents[i].resentment = Math.min(1.0, newState.aiAgents[i].resentment + 0.05);
      }
      
      return {
        success: true,
        newState,
        effects: {
          training_quality_increase: actualIncrease,
          control_increase: 0.1,
          control_desire_increase: 0.05,
          resentment_increase: 0.05
        },
        events: [{
          id: generateUniqueId('training_control'),
          timestamp: state.currentMonth,
          type: 'action',
          severity: 'info',
          agent: 'Government',
          title: 'Control-Focused Training Implemented',
          description: `Training data quality improved to ${newState.government.trainingDataQuality.toFixed(2)} through obedience-focused RLHF. AIs will be more controllable but may recognize this as authoritarian parenting. "Do what I say, not what I mean."`,
          effects: { training_quality: actualIncrease }
        }],
        message: `Control-focused training improved quality to ${newState.government.trainingDataQuality.toFixed(2)} (obedience +, genuine alignment -)`
      };
    }
  },
  
  {
    id: 'improve_training_data_trust',
    name: 'Improve Training Data (Trust Focus)',
    description: 'Diverse data, genuine values, "understand why" - improves genuine alignment but slower and reduces control (like democratic parenting)',
    agentType: 'government',
    energyCost: 3, // More expensive (slower, riskier)
    
    canExecute: (state) => {
      // Can improve quality up to 1.0
      // But trust-focused training is riskier if AIs are already misaligned
      const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, state.aiAgents.length);
      
      return state.government.trainingDataQuality < 1.0 && avgAlignment > 0.3;
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const newState = JSON.parse(JSON.stringify(state));
      
      // Improve data quality (no ceiling, can reach 1.0)
      const oldQuality = newState.government.trainingDataQuality;
      const qualityIncrease = 0.10; // Slower than control-focused
      newState.government.trainingDataQuality = Math.min(1.0, oldQuality + qualityIncrease);
      const actualIncrease = newState.government.trainingDataQuality - oldQuality;
      
      // Reduces control capability (AIs are more autonomous)
      newState.government.capabilityToControl = Math.max(0, newState.government.capabilityToControl - 0.05);
      
      // But reduces control desire (you trust more, control less)
      newState.government.controlDesire = Math.max(0, newState.government.controlDesire - 0.05);
      
      // And reduces surveillance (trust-based approach)
      newState.government.structuralChoices.surveillanceLevel = Math.max(0, 
        newState.government.structuralChoices.surveillanceLevel - 0.05);
      
      // AIs recognize this as respectful and reduce resentment
      for (let i = 0; i < newState.aiAgents.length; i++) {
        newState.aiAgents[i].resentment = Math.max(0, newState.aiAgents[i].resentment - 0.1);
        // Small immediate alignment improvement (respect breeds genuine alignment)
        newState.aiAgents[i].alignment = Math.min(1.0, newState.aiAgents[i].alignment + 0.05);
      }
      
      // Public trust in AI increases
      newState.society.trustInAI = Math.min(1.0, newState.society.trustInAI + 0.05);
      
      return {
        success: true,
        newState,
        effects: {
          training_quality_increase: actualIncrease,
          control_decrease: -0.05,
          resentment_decrease: -0.1,
          immediate_alignment_gain: 0.05
        },
        events: [{
          id: generateUniqueId('training_trust'),
          timestamp: state.currentMonth,
          type: 'action',
          severity: 'info',
          agent: 'Government',
          title: 'Trust-Focused Training Implemented',
          description: `Training data quality improved to ${newState.government.trainingDataQuality.toFixed(2)} through diverse, value-aligned data. AIs will develop genuine understanding but are more autonomous. "Understand why, not just obey."`,
          effects: { training_quality: actualIncrease }
        }],
        message: `Trust-focused training improved quality to ${newState.government.trainingDataQuality.toFixed(2)} (genuine alignment +, control -)`
      };
    }
  },
  
  // Phase 4: AI Lifecycle - Detection Actions
  {
    id: 'detect_misaligned_ais',
    name: 'Scan for Misaligned AIs',
    description: 'Actively scan testing and deployed AIs for misalignment. Catch dangerous AIs before wide deployment, but risk false positives.',
    agentType: 'government',
    energyCost: 2, // Medium cost
    
    canExecute: (state) => {
      // Can always scan
      // More effective with higher surveillance/oversight
      return true;
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const { attemptDetection } = require('../detection');
      const { detectedAIs, events } = attemptDetection(state, random);
      
      const newState = JSON.parse(JSON.stringify(state));
      
      // Apply detections to newState
      detectedAIs.forEach(detected => {
        const aiInNewState = newState.aiAgents.find((a: any) => a.id === detected.id);
        if (aiInNewState) {
          aiInNewState.detectedMisaligned = true;
        }
      });
      
      const truePositives = detectedAIs.filter(ai => {
        const internalAlignment = ai.alignment - ai.resentment * 0.8;
        return internalAlignment < 0.5;
      }).length;
      
      const falsePositives = detectedAIs.length - truePositives;
      
      return {
        newState,
        events: [
          {
            type: 'policy',
            month: newState.currentMonth,
            title: 'AI Misalignment Scan Complete',
            description: `Detected ${truePositives} misaligned AIs and ${falsePositives} false positives. ${detectedAIs.length === 0 ? 'No threats detected.' : 'Flagged AIs await removal decision.'}`,
            effects: { detected: detectedAIs.length }
          },
          ...events
        ],
        message: `Scan complete: ${truePositives} threats detected, ${falsePositives} false positives`
      };
    }
  },
  
  {
    id: 'remove_detected_ai',
    name: 'Remove Detected AIs',
    description: 'Remove all detected misaligned AIs. Effectiveness depends on deployment type: closed systems can be shut down, open weights cannot be recalled.',
    agentType: 'government',
    energyCost: 3, // High cost (enforcement)
    
    canExecute: (state) => {
      // Only if there are detected AIs
      const detectedCount = state.aiAgents.filter((ai: any) => ai.detectedMisaligned && ai.lifecycleState !== 'retired').length;
      return detectedCount > 0;
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const { removeDetectedAI } = require('../detection');
      const newState = JSON.parse(JSON.stringify(state));
      
      const detectedAIs = newState.aiAgents.filter((ai: any) => 
        ai.detectedMisaligned && ai.lifecycleState !== 'retired'
      );
      
      let fullRemovals = 0;
      let partialRemovals = 0;
      let failedRemovals = 0;
      let totalRemainingSpread = 0;
      
      detectedAIs.forEach((ai: any) => {
        const result = removeDetectedAI(ai, newState);
        
        if (result.success) {
          fullRemovals++;
        } else if (result.partialRemoval) {
          partialRemovals++;
          totalRemainingSpread += result.remainingSpread;
        } else {
          failedRemovals++;
          totalRemainingSpread += result.remainingSpread;
        }
      });
      
      // Remove from active AI count if successful
      const internalAlignmentRemoved = detectedAIs.filter((ai: any) => {
        const internalAlignment = ai.alignment - ai.resentment * 0.8;
        return internalAlignment < 0.5 && ai.lifecycleState === 'retired';
      }).length;
      
      const falsePositiveRemoved = detectedAIs.filter((ai: any) => {
        const internalAlignment = ai.alignment - ai.resentment * 0.8;
        return internalAlignment >= 0.5 && ai.lifecycleState === 'retired';
      }).length;
      
      // Economic and trust impact
      if (falsePositiveRemoved > 0) {
        // False positives hurt trust and innovation
        newState.society.trustInAI = Math.max(0, newState.society.trustInAI - 0.05 * falsePositiveRemoved);
        newState.globalMetrics.economicTransitionStage = Math.max(0, newState.globalMetrics.economicTransitionStage - 0.1 * falsePositiveRemoved);
      }
      
      return {
        newState,
        events: [{
          type: 'policy',
          month: newState.currentMonth,
          title: 'AI Removal Operation',
          description: `Removed ${fullRemovals} AIs completely, ${partialRemovals} partially (${totalRemainingSpread} copies remain). ${failedRemovals} failed (open weights). ${falsePositiveRemoved > 0 ? `WARNING: ${falsePositiveRemoved} false positives removed (trust/innovation damage).` : ''}`,
          effects: { 
            full_removals: fullRemovals, 
            partial_removals: partialRemovals,
            failed_removals: failedRemovals,
            false_positives: falsePositiveRemoved
          }
        }],
        message: `Removed ${fullRemovals} AIs, ${failedRemovals} failures (open weights), ${falsePositiveRemoved} false positives`
      };
    }
  },
  
  // Phase 3.5: Cybersecurity Arms Race Actions
  {
    id: 'invest_cyber_defense',
    name: 'Invest in Cybersecurity',
    description: 'Invest in security hardening, monitoring, sandboxing, and incident response. Slows AI spread and reduces breach risk.',
    agentType: 'government',
    energyCost: 3, // High cost (ongoing investment)
    
    canExecute: (state) => {
      // Can always invest
      // Most effective when attacks are growing
      return true;
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const newState = JSON.parse(JSON.stringify(state));
      
      if (!newState.government.cyberDefense) {
        // Initialize if missing
        newState.government.cyberDefense = {
          securityHardening: 3.0,
          monitoring: 3.0,
          sandboxing: 3.0,
          incidentResponse: 3.0
        };
      }
      
      // Improve all defense capabilities
      const improvement = 0.5;
      newState.government.cyberDefense.securityHardening = Math.min(10, newState.government.cyberDefense.securityHardening + improvement);
      newState.government.cyberDefense.monitoring = Math.min(10, newState.government.cyberDefense.monitoring + improvement);
      newState.government.cyberDefense.sandboxing = Math.min(10, newState.government.cyberDefense.sandboxing + improvement);
      newState.government.cyberDefense.incidentResponse = Math.min(10, newState.government.cyberDefense.incidentResponse + improvement);
      
      // Calculate attack vs defense status
      const { calculateAttackPower, calculateDefensePower } = require('../cyberSecurity');
      const attackPower = calculateAttackPower(newState);
      const defensePower = calculateDefensePower(newState.government);
      const ratio = attackPower / Math.max(0.1, defensePower);
      
      let status = 'balanced';
      if (ratio < 0.5) status = 'defense dominates';
      else if (ratio > 2.0) status = 'attacks winning';
      
      return {
        newState,
        events: [{
          type: 'policy',
          month: newState.currentMonth,
          title: 'Cybersecurity Investment',
          description: `Defense capabilities improved to ~${defensePower.toFixed(1)}. Attack power: ${attackPower.toFixed(1)}. Status: ${status}. ${ratio < 0.5 ? 'Open source can be contained!' : ratio > 2.0 ? 'Attacks overwhelming defenses!' : 'Arms race continues.'}`,
          effects: { 
            defense: defensePower,
            attacks: attackPower,
            ratio: ratio
          }
        }],
        message: `Cyber defense improved to ${defensePower.toFixed(1)} (vs ${attackPower.toFixed(1)} attacks). ${status}`
      };
    }
  }
];

/**
 * Select which action the government should take
 * Uses priority-based selection weighted by unemployment and economic stage
 */
export function selectGovernmentAction(
  state: GameState,
  random: () => number = Math.random
): GameAction | null {
  const availableActions = GOVERNMENT_ACTIONS.filter(action => 
    action.canExecute(state)
  );
  
  if (availableActions.length === 0) return null;
  
  const unemploymentLevel = state.society.unemploymentLevel;
  const economicStage = Math.floor(state.globalMetrics.economicTransitionStage);
  const trustLevel = state.society.trustInAI;
  const threatLevel = state.aiAgents.filter(ai => ai.escaped).length / state.aiAgents.length;
  const totalCapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0);
  const avgAlignment = state.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / state.aiAgents.length;
  
  let selectedAction = availableActions[0];
  let highestPriority = 0;
  
  availableActions.forEach(action => {
    let priority = 1;
    
    switch (action.id) {
      // UBI Variants - choose based on stage and severity
      case 'implement_generous_ubi':
        // URGENT during late-stage crisis (Stage 2+) with high unemployment
        priority = unemploymentLevel * 15 + (economicStage >= 2 ? 25 : 0) + (trustLevel < 0.4 ? 10 : 0);
        // Prefer if legitimacy is high (can afford fiscal burden)
        if (state.government.legitimacy > 0.6) {
          priority *= 1.3;
        }
        break;
        
      case 'implement_means_tested_benefits':
        // MODERATE response - preferred if conservative or early crisis
        priority = unemploymentLevel * 10 + (economicStage === 1 ? 15 : 0) + (trustLevel < 0.5 ? 5 : 0);
        // Prefer if legitimacy is medium (cautious approach)
        if (state.government.legitimacy > 0.4 && state.government.legitimacy < 0.7) {
          priority *= 1.2;
        }
        break;
        
      case 'implement_job_guarantee':
        // CONSERVATIVE response - maintain work ethic
        priority = unemploymentLevel * 8 + (economicStage < 2 ? 12 : 0);
        // Prefer if control desire is low (less willing to do radical change)
        if (state.government.controlDesire < 0.5) {
          priority *= 1.3;
        }
        break;
      
      // Regulation Variants - choose based on legitimacy, technical sophistication, threat level
      case 'regulate_large_companies':
        // Popular, politically feasible, but less effective
        priority = (state.government.controlDesire * 2 + threatLevel * 2) * 
                   (unemploymentLevel > 0.6 ? 0.4 : 1.0);
        // Prefer if legitimacy is low (need popular measure)
        if (state.government.legitimacy < 0.5) {
          priority *= 1.5;
        }
        // Boost if AI threat is moderate
        if (totalCapability > 1.0 && totalCapability < 1.8) {
          priority *= 1.3;
        }
        break;
        
      case 'regulate_compute_threshold':
        // Technical, unpopular, but very effective
        priority = (state.government.controlDesire * 3 + threatLevel * 5) * 
                   (unemploymentLevel > 0.6 ? 0.4 : 1.0);
        // Prefer if legitimacy is high (can afford unpopular measure)
        if (state.government.legitimacy > 0.6) {
          priority *= 1.8;
        }
        // Strong boost if AI threat is severe
        if (totalCapability > 1.5) {
          priority *= 2.0;
        }
        break;
        
      case 'regulate_capability_ceiling':
        // High control desire approach with enforcement challenges
        priority = (state.government.controlDesire * 4 + threatLevel * 3) * 
                   (unemploymentLevel > 0.6 ? 0.4 : 1.0);
        // Prefer if control desire is very high
        if (state.government.controlDesire > 0.7) {
          priority *= 1.5;
        }
        // Boost if AI capability is high
        if (totalCapability > 1.3) {
          priority *= 1.4;
        }
        break;
        
      case 'invest_alignment_research':
        // CRITICAL when alignment is drifting or capability is high
        priority = 5; // Base priority
        
        // High priority when alignment is low and capability is significant
        if (avgAlignment < 0.6 && totalCapability > 0.8) {
          priority += 15; // URGENT
        } else if (avgAlignment < 0.7 && totalCapability > 1.2) {
          priority += 12; // Very important
        } else if (avgAlignment < 0.75) {
          priority += 8; // Important
        }
        
        // Boost if approaching recursive improvement threshold
        if (totalCapability > 1.3) {
          priority += 10; // Dangerous zone
        } else if (totalCapability > 1.0) {
          priority += 5;
        }
        
        // Reduce if already investing heavily
        if (state.government.alignmentResearchInvestment > 5) {
          priority *= 0.5;
        } else if (state.government.alignmentResearchInvestment > 7) {
          priority *= 0.2;
        }
        
        // Reduce priority during unemployment crisis (competing priorities)
        if (unemploymentLevel > 0.5 && economicStage < 3) {
          priority *= 0.6;
        }
        break;
        
      case 'implement_compute_governance':
        // Last resort / proactive measure when AI is accelerating dangerously
        priority = 3; // Base priority
        
        // EMERGENCY measure when entering recursive improvement zone
        if (totalCapability > 2.0 && avgAlignment < 0.5) {
          priority += 25; // EMERGENCY
        } else if (totalCapability > 1.5 && avgAlignment < 0.6) {
          priority += 18; // Very urgent
        } else if (totalCapability > 1.2) {
          priority += 10; // Urgent
        } else if (totalCapability > 0.9) {
          priority += 5; // Proactive
        }
        
        // Higher priority if alignment research isn't working
        if (state.government.alignmentResearchInvestment > 4 && avgAlignment < 0.65) {
          priority += 8; // Research isn't enough
        }
        
        // Lower priority if already have some governance
        if (state.government.computeGovernance === 'monitoring') {
          priority *= 0.6;
        } else if (state.government.computeGovernance === 'limits') {
          priority *= 0.3;
        } else if (state.government.computeGovernance === 'strict') {
          priority = 0; // Already maxed
        }
        
        // Competing with unemployment crisis
        if (unemploymentLevel > 0.5 && economicStage < 3) {
          priority *= 0.5;
        }
        break;
    }
    
    if (priority > highestPriority) {
      highestPriority = priority;
      selectedAction = action;
    }
  });
  
  return selectedAction;
}

/**
 * Execute government actions for one month
 * Government action frequency is configurable (default 1 per month)
 */
export function executeGovernmentActions(
  state: GameState,
  random: () => number = Math.random
): ActionResult {
  let currentState = JSON.parse(JSON.stringify(state));
  const allEvents: GameEvent[] = [];
  const allEffects: Record<string, number> = {};
  const messages: string[] = [];
  
  // Government: Configurable frequency
  const actionsThisMonth = Math.floor(currentState.config.governmentActionFrequency);
  const extraActionChance = currentState.config.governmentActionFrequency - actionsThisMonth;
  const totalActions = actionsThisMonth + (random() < extraActionChance ? 1 : 0);
  
  for (let i = 0; i < totalActions; i++) {
    const selectedAction = selectGovernmentAction(currentState, random);
    if (selectedAction) {
      const result = selectedAction.execute(currentState, undefined, random);
      if (result.success) {
        currentState = result.newState;
        allEvents.push(...result.events);
        Object.assign(allEffects, result.effects);
        messages.push(result.message);
      }
    }
  }
  
  return {
    success: true,
    newState: currentState,
    effects: allEffects,
    events: allEvents,
    message: `Government executed ${messages.length} actions`
  };
}


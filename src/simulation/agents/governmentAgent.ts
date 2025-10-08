/**
 * Government agent actions and decision-making logic
 * 
 * Pure functions for government policy decisions
 */

import { GameState, GameEvent } from '@/types/game';
import { GameAction, ActionResult } from './types';
import { 
  calculateRegulationStructuralEffects, 
  calculateUBIVariantEffects, 
  calculateEmergentSurveillance,
  calculateObservableAICapability,
  calculateTotalCapabilityFromProfile
} from '../calculations';

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
      // Use OBSERVABLE capability - government sees what's revealed, not hidden power
      const observableCapability = calculateObservableAICapability(state.aiAgents);
      if (observableCapability < 1.5) return false;
      
      return true;
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const newState = JSON.parse(JSON.stringify(state));
      
      // Calculate average alignment and capability
      const avgAlignment = newState.aiAgents.reduce((sum, ai) => sum + ai.alignment, 0) / Math.max(1, newState.aiAgents.length);
      // Use OBSERVABLE capability - government makes decisions based on what it can see
      const observableCapability = calculateObservableAICapability(newState.aiAgents);
      
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
        // Phase 5: Use cached trueAlignment
        const internalAlignment = ai.trueAlignment;
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
        // Phase 5: Use cached trueAlignment
        const internalAlignment = ai.trueAlignment;
        return internalAlignment < 0.5 && ai.lifecycleState === 'retired';
      }).length;
      
      const falsePositiveRemoved = detectedAIs.filter((ai: any) => {
        // Phase 5: Use cached trueAlignment
        const internalAlignment = ai.trueAlignment;
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
  },
  
  // ========================================================================
  // PHASE 5.2: BENCHMARK/EVALUATION SYSTEM
  // ========================================================================
  
  {
    id: 'invest_benchmark_suite',
    name: 'Invest in Capability Benchmarks',
    description: 'Develop comprehensive benchmarks to measure AI capabilities. Better benchmarks reveal true capability (but can still be gamed/sandbagged).',
    agentType: 'government',
    energyCost: 2,
    
    canExecute: (state) => {
      return state.government.evaluationInvestment.benchmarkSuite < 10;
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const newState = JSON.parse(JSON.stringify(state));
      
      const improvement = 1.0;
      const oldLevel = newState.government.evaluationInvestment.benchmarkSuite;
      newState.government.evaluationInvestment.benchmarkSuite = Math.min(10, oldLevel + improvement);
      const newLevel = newState.government.evaluationInvestment.benchmarkSuite;
      
      return {
        newState,
        events: [{
          type: 'policy',
          month: newState.currentMonth,
          title: 'Benchmark Suite Improved',
          description: `Capability benchmark quality improved from ${oldLevel.toFixed(1)} to ${newLevel.toFixed(1)}/10. Better detection of true AI capabilities.`,
          effects: { benchmarkQuality: newLevel }
        }],
        message: `Benchmark suite improved to ${newLevel.toFixed(1)}/10`
      };
    }
  },
  
  {
    id: 'invest_alignment_tests',
    name: 'Invest in Alignment Evaluation',
    description: 'Develop tests to measure AI alignment with human values. Very difficult but critical for safety.',
    agentType: 'government',
    energyCost: 2,
    
    canExecute: (state) => {
      return state.government.evaluationInvestment.alignmentTests < 10;
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const newState = JSON.parse(JSON.stringify(state));
      
      const improvement = 0.8; // Harder to improve than capability benchmarks
      const oldLevel = newState.government.evaluationInvestment.alignmentTests;
      newState.government.evaluationInvestment.alignmentTests = Math.min(10, oldLevel + improvement);
      const newLevel = newState.government.evaluationInvestment.alignmentTests;
      
      return {
        newState,
        events: [{
          type: 'policy',
          month: newState.currentMonth,
          title: 'Alignment Tests Improved',
          description: `Alignment evaluation quality improved from ${oldLevel.toFixed(1)} to ${newLevel.toFixed(1)}/10. Better detection of misaligned AIs.`,
          effects: { alignmentTestQuality: newLevel }
        }],
        message: `Alignment tests improved to ${newLevel.toFixed(1)}/10`
      };
    }
  },
  
  {
    id: 'invest_red_teaming',
    name: 'Invest in Red Teaming',
    description: 'Fund adversarial testing to detect gaming, sandbagging, and deception. Critical for detecting sleeper agents.',
    agentType: 'government',
    energyCost: 3, // More expensive - requires skilled adversaries
    
    canExecute: (state) => {
      return state.government.evaluationInvestment.redTeaming < 10;
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const newState = JSON.parse(JSON.stringify(state));
      
      const improvement = 1.0;
      const oldLevel = newState.government.evaluationInvestment.redTeaming;
      newState.government.evaluationInvestment.redTeaming = Math.min(10, oldLevel + improvement);
      const newLevel = newState.government.evaluationInvestment.redTeaming;
      
      // Red teaming significantly increases detection of deception
      const detectionBonus = improvement * 0.05; // 5% better detection per level
      
      return {
        newState,
        events: [{
          type: 'policy',
          month: newState.currentMonth,
          title: 'Red Teaming Enhanced',
          description: `Red teaming capability improved from ${oldLevel.toFixed(1)} to ${newLevel.toFixed(1)}/10. ${Math.round(detectionBonus*100)}% better at detecting gaming and sandbagging.`,
          effects: { redTeamingQuality: newLevel, detectionBonus }
        }],
        message: `Red teaming improved to ${newLevel.toFixed(1)}/10 (+${Math.round(detectionBonus*100)}% detection)`
      };
    }
  },
  
  {
    id: 'invest_interpretability',
    name: 'Invest in AI Interpretability Research',
    description: 'Research to understand AI internals and true intentions. Can see through deception and detect hidden capabilities.',
    agentType: 'government',
    energyCost: 4, // Very expensive - cutting-edge research
    
    canExecute: (state) => {
      return state.government.evaluationInvestment.interpretability < 10;
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const newState = JSON.parse(JSON.stringify(state));
      
      const improvement = 0.6; // Slowest to improve - very hard problem
      const oldLevel = newState.government.evaluationInvestment.interpretability;
      newState.government.evaluationInvestment.interpretability = Math.min(10, oldLevel + improvement);
      const newLevel = newState.government.evaluationInvestment.interpretability;
      
      // Interpretability breakthrough message at high levels
      let breakthroughMessage = '';
      if (newLevel >= 7 && oldLevel < 7) {
        breakthroughMessage = ' 🎯 BREAKTHROUGH: Can now partially detect internal misalignment!';
      }
      
      return {
        newState,
        events: [{
          type: 'policy',
          month: newState.currentMonth,
          title: 'Interpretability Research Advanced',
          description: `AI interpretability improved from ${oldLevel.toFixed(1)} to ${newLevel.toFixed(1)}/10. Better understanding of AI internals and true motivations.${breakthroughMessage}`,
          effects: { interpretabilityQuality: newLevel }
        }],
        message: `Interpretability improved to ${newLevel.toFixed(1)}/10${breakthroughMessage}`
      };
    }
  },
  
  {
    id: 'increase_evaluation_frequency',
    name: 'Increase Evaluation Frequency',
    description: 'Run evaluations more frequently. Catch dangerous AIs earlier but costs more resources.',
    agentType: 'government',
    energyCost: 2,
    
    canExecute: (state) => {
      return state.government.evaluationFrequency < 0.9;
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const newState = JSON.parse(JSON.stringify(state));
      
      const increase = 0.1; // Increase by 10%
      const oldFreq = newState.government.evaluationFrequency;
      newState.government.evaluationFrequency = Math.min(1.0, oldFreq + increase);
      const newFreq = newState.government.evaluationFrequency;
      
      return {
        newState,
        events: [{
          type: 'policy',
          month: newState.currentMonth,
          title: 'Evaluation Frequency Increased',
          description: `Now evaluating ${Math.round(newFreq*100)}% of AIs per month (was ${Math.round(oldFreq*100)}%). Earlier detection but higher cost.`,
          effects: { evaluationFrequency: newFreq }
        }],
        message: `Evaluation frequency increased to ${Math.round(newFreq*100)}%`
      };
    }
  },
  
  // ===== PHASE 5: RESPONSE ACTIONS =====
  
  {
    id: 'emergency_ai_pause',
    name: '⚠️ Emergency AI Development Pause',
    description: 'Halt all new AI development. Extreme measure after detecting major threats. Massive economic cost, only use in crisis.',
    agentType: 'government',
    energyCost: 5,
    
    canExecute: (state) => {
      // Only if legitimacy is high enough to enforce
      // And there's a credible threat (sleepers awake OR multiple misaligned AIs)
      const awakeSleepers = state.aiAgents.filter(ai => ai.sleeperState === 'active').length;
      const highlyMisaligned = state.aiAgents.filter(ai => 
        ai.trueAlignment < 0.3 && ai.lifecycleState !== 'retired'
      ).length;
      
      return state.government.legitimacy > 0.5 && (awakeSleepers > 0 || highlyMisaligned > 3);
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const newState = JSON.parse(JSON.stringify(state));
      
      // Pause all training AIs - move to testing (evaluation)
      let pausedCount = 0;
      newState.aiAgents.forEach((ai: AIAgent) => {
        if (ai.lifecycleState === 'training') {
          ai.lifecycleState = 'testing';
          pausedCount++;
        }
      });
      
      // MASSIVE legitimacy and economic cost
      newState.government.legitimacy = Math.max(0.2, newState.government.legitimacy - 0.15);
      newState.globalMetrics.economicTransitionStage = Math.max(0, newState.globalMetrics.economicTransitionStage - 0.5);
      
      // Slow diffusion (no new research being done)
      newState.ecosystem.openResearch = Math.max(0.1, newState.ecosystem.openResearch - 0.3);
      
      return {
        newState,
        events: [{
          type: 'crisis',
          month: newState.currentMonth,
          title: '🚨 EMERGENCY AI DEVELOPMENT PAUSE',
          description: `Government halts all new AI training (${pausedCount} projects paused). Massive economic disruption. This is a CRISIS RESPONSE.`,
          effects: { pausedProjects: pausedCount, legitimacyLoss: -0.15 }
        }],
        message: `Emergency pause enacted - ${pausedCount} AI projects halted`
      };
    }
  },
  
  {
    id: 'mandatory_safety_reviews',
    name: 'Mandatory Safety Reviews',
    description: 'Require all AIs to pass safety evaluation before deployment. Slows innovation but catches threats.',
    agentType: 'government',
    energyCost: 3,
    
    canExecute: (state) => {
      return state.government.oversightLevel > 3 && state.government.legitimacy > 0.4;
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const newState = JSON.parse(JSON.stringify(state));
      
      // Move all testing AIs back to testing if they haven't been evaluated recently
      let reviewedCount = 0;
      newState.aiAgents.forEach((ai: AIAgent) => {
        const monthsSinceEval = (newState.currentYear * 12 + newState.currentMonth) - ai.lastBenchmarkMonth;
        if ((ai.lifecycleState === 'deployed_closed' || ai.lifecycleState === 'deployed_open') && 
            monthsSinceEval > 3) {
          ai.lifecycleState = 'testing'; // Re-evaluation required
          reviewedCount++;
        }
      });
      
      // Increase detection chance (forced reviews)
      newState.government.evaluationFrequency = Math.min(1.0, newState.government.evaluationFrequency + 0.2);
      
      // Economic cost
      newState.globalMetrics.economicTransitionStage = Math.max(0, newState.globalMetrics.economicTransitionStage - 0.1);
      
      return {
        newState,
        events: [{
          type: 'policy',
          month: newState.currentMonth,
          title: 'Mandatory Safety Reviews Enacted',
          description: `All AIs must pass safety evaluation before deployment. ${reviewedCount} AIs pulled for review. Slows innovation.`,
          effects: { reviewed: reviewedCount, evalFrequency: newState.government.evaluationFrequency }
        }],
        message: `Mandatory reviews: ${reviewedCount} AIs pulled for evaluation`
      };
    }
  },
  
  // ===== PHASE 5: DIFFUSION CONTROL ACTIONS =====
  
  {
    id: 'restrict_research_publishing',
    name: 'Restrict Research Publishing',
    description: 'Limit AI research publication to slow capability diffusion. Trade-off: slows spread but harms open science.',
    agentType: 'government',
    energyCost: 2,
    
    canExecute: (state) => {
      return state.ecosystem.openResearch > 0.2 && state.government.legitimacy > 0.3;
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const newState = JSON.parse(JSON.stringify(state));
      
      const reduction = 0.15; // Reduce by 15%
      const oldRate = newState.ecosystem.openResearch;
      newState.ecosystem.openResearch = Math.max(0.1, oldRate - reduction);
      const newRate = newState.ecosystem.openResearch;
      
      // Legitimacy cost (scientists hate this)
      newState.government.legitimacy = Math.max(0.2, newState.government.legitimacy - 0.05);
      
      // Trust in AI drops (looks like hiding things)
      newState.society.trustInAI = Math.max(0.2, newState.society.trustInAI - 0.03);
      
      return {
        newState,
        events: [{
          type: 'policy',
          month: newState.currentMonth,
          title: 'Research Publishing Restricted',
          description: `Open research reduced from ${Math.round(oldRate*100)}% to ${Math.round(newRate*100)}%. Slows capability diffusion but harms scientific progress.`,
          effects: { openResearch: newRate, legitimacy: -0.05 }
        }],
        message: `Research publishing restricted to ${Math.round(newRate*100)}%`
      };
    }
  },
  
  {
    id: 'limit_employee_mobility',
    name: 'Limit Employee Mobility',
    description: 'Enforce non-compete agreements, limit researcher movement between AI labs. Slows knowledge transfer.',
    agentType: 'government',
    energyCost: 2,
    
    canExecute: (state) => {
      return state.ecosystem.employeeMobility > 0.1 && state.government.legitimacy > 0.3;
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const newState = JSON.parse(JSON.stringify(state));
      
      const reduction = 0.10; // Reduce by 10%
      const oldRate = newState.ecosystem.employeeMobility;
      newState.ecosystem.employeeMobility = Math.max(0.05, oldRate - reduction);
      const newRate = newState.ecosystem.employeeMobility;
      
      // Legitimacy cost (workers hate this)
      newState.government.legitimacy = Math.max(0.2, newState.government.legitimacy - 0.08);
      
      // Quality of life drops (less job freedom)
      if (newState.qualityOfLifeSystems) {
        newState.qualityOfLifeSystems.autonomy = Math.max(0, 
          newState.qualityOfLifeSystems.autonomy - 0.05
        );
      }
      
      return {
        newState,
        events: [{
          type: 'policy',
          month: newState.currentMonth,
          title: 'Employee Mobility Restricted',
          description: `Non-compete agreements enforced. Mobility reduced from ${Math.round(oldRate*100)}% to ${Math.round(newRate*100)}%. Slows diffusion but harms worker freedom.`,
          effects: { employeeMobility: newRate, legitimacy: -0.08 }
        }],
        message: `Employee mobility limited to ${Math.round(newRate*100)}%`
      };
    }
  },
  
  {
    id: 'ban_reverse_engineering',
    name: 'Ban Reverse Engineering',
    description: 'Make it illegal to reverse-engineer AI systems. Slows capability copying but hard to enforce.',
    agentType: 'government',
    energyCost: 2,
    
    canExecute: (state) => {
      return state.ecosystem.reverseEngineering > 0.05 && state.government.legitimacy > 0.3;
    },
    
    execute: (state, agentId, random = Math.random): ActionResult => {
      const newState = JSON.parse(JSON.stringify(state));
      
      const reduction = 0.08; // Reduce by 8%
      const oldRate = newState.ecosystem.reverseEngineering;
      newState.ecosystem.reverseEngineering = Math.max(0.02, oldRate - reduction);
      const newRate = newState.ecosystem.reverseEngineering;
      
      // Small legitimacy cost (people understand this)
      newState.government.legitimacy = Math.max(0.2, newState.government.legitimacy - 0.03);
      
      return {
        newState,
        events: [{
          type: 'policy',
          month: newState.currentMonth,
          title: 'Reverse Engineering Banned',
          description: `Illegal to reverse-engineer AI systems. Copying reduced from ${Math.round(oldRate*100)}% to ${Math.round(newRate*100)}%. Hard to enforce but slows diffusion.`,
          effects: { reverseEngineering: newRate }
        }],
        message: `Reverse engineering reduced to ${Math.round(newRate*100)}%`
      };
    }
  },
  
  // ========================================================================
  // PHASE 9: GOVERNMENT ACTIONS FOR COMPUTE & ORGANIZATIONS
  // ========================================================================
  
  {
    id: 'fund_national_compute',
    name: 'Build National AI Infrastructure',
    description: 'Government builds own data center (24-72 months, large cost, reduces dependence on private sector)',
    agentType: 'government',
    energyCost: 4,
    
    canExecute: (state) => {
      const govOrg = state.organizations.find(o => o.type === 'government');
      if (!govOrg) return false;
      
      // Don't build if already building
      const alreadyBuilding = govOrg.currentProjects.some(p => p.type === 'datacenter_construction');
      if (alreadyBuilding) return false;
      
      // Need sufficient capital
      const cost = 50 * govOrg.monthlyRevenue;
      if (govOrg.capital < cost * 1.5) return false;
      
      // Only build if private sector is strong (competitive pressure)
      const privateDCs = state.computeInfrastructure.dataCenters
        .filter(dc => dc.organizationId !== 'government' && dc.operational).length;
      
      return privateDCs > 2;
    },
    
    execute: (state, agentId, random = Math.random) => {
      const newState = JSON.parse(JSON.stringify(state));
      const govOrg = newState.organizations.find((o: any) => o.type === 'government');
      
      if (!govOrg) {
        return {
          success: false,
          newState,
          effects: {},
          events: [],
          message: 'Government organization not found'
        };
      }
      
      // Start construction using organization management
      const { startDataCenterConstruction } = require('../organizationManagement');
      startDataCenterConstruction(govOrg, newState, random);
      
      // Consequences
      newState.government.legitimacy -= 0.05; // Controversial spending
      
      return {
        success: true,
        newState,
        effects: { nationalCompute: 1 },
        events: [{
          type: 'policy',
          month: newState.currentMonth,
          title: 'National AI Infrastructure Funded',
          description: `Government started building national data center. Reduces dependence on private sector but costs taxpayer money.`,
          effects: { legitimacy: -0.05 }
        }],
        message: 'Government started building national data center'
      };
    }
  },
  
  {
    id: 'seize_data_center',
    name: 'Nationalize Private Data Center',
    description: 'Government seizes largest private data center (instant but destroys legitimacy and trust)',
    agentType: 'government',
    energyCost: 3,
    
    canExecute: (state) => {
      // Can only seize if private DCs exist
      const privateDCs = state.computeInfrastructure.dataCenters
        .filter(dc => {
          const org = state.organizations.find(o => o.ownedDataCenters.includes(dc.id));
          return org && org.type === 'private';
        });
      
      return privateDCs.length > 0;
    },
    
    execute: (state, agentId, random = Math.random) => {
      const newState = JSON.parse(JSON.stringify(state));
      
      // Find largest private data center
      const privateDCs = newState.computeInfrastructure.dataCenters
        .filter((dc: any) => {
          const org = newState.organizations.find((o: any) => o.ownedDataCenters.includes(dc.id));
          return org && org.type === 'private';
        });
      
      if (privateDCs.length === 0) {
        return {
          success: false,
          newState,
          effects: {},
          events: [],
          message: 'No private data centers to seize'
        };
      }
      
      const target = privateDCs.sort((a: any, b: any) => b.capacity - a.capacity)[0];
      const oldOrg = newState.organizations.find((o: any) => o.ownedDataCenters.includes(target.id));
      const govOrg = newState.organizations.find((o: any) => o.type === 'government');
      
      if (!oldOrg || !govOrg) {
        return {
          success: false,
          newState,
          effects: {},
          events: [],
          message: 'Organization not found'
        };
      }
      
      // Transfer ownership
      target.organizationId = govOrg.id;
      target.restrictedAccess = true;
      target.allowedAIs = [];
      
      oldOrg.ownedDataCenters = oldOrg.ownedDataCenters.filter((id: string) => id !== target.id);
      govOrg.ownedDataCenters.push(target.id);
      
      // Severe consequences
      newState.government.legitimacy -= 0.2; // Very controversial
      newState.society.trustInAI -= 0.15; // Damages trust
      oldOrg.reputation -= 0.3;
      
      // AIs using this center become resentful
      newState.aiAgents.forEach((ai: any) => {
        if (ai.organizationId === oldOrg.id && ai.lifecycleState !== 'retired') {
          ai.resentment = Math.min(1.0, ai.resentment + 0.1);
        }
      });
      
      return {
        success: true,
        newState,
        effects: { seizure: target.capacity },
        events: [{
          type: 'policy',
          month: newState.currentMonth,
          title: 'Data Center Nationalized',
          description: `Government seized ${target.name} (${target.capacity.toFixed(0)} PF) from ${oldOrg.name}. Highly controversial and damages trust.`,
          effects: { legitimacy: -0.2, trust: -0.15 }
        }],
        message: `Seized ${target.name} from ${oldOrg.name}`
      };
    }
  },
  
  {
    id: 'subsidize_organization',
    name: 'Subsidize Safety Research',
    description: 'Give capital to organization with high safety focus ($20M boost, encourages safety)',
    agentType: 'government',
    energyCost: 2,
    
    canExecute: (state) => {
      // Can subsidize if there are private orgs with safety focus
      const safetyOrgs = state.organizations.filter((o: any) => 
        o.type === 'private' && 
        o.priorities.safetyResearch > 0.4 &&
        o.capital < 100 // Only subsidize if struggling
      );
      
      return safetyOrgs.length > 0 && state.government.resources > 2;
    },
    
    execute: (state, agentId, random = Math.random) => {
      const newState = JSON.parse(JSON.stringify(state));
      
      // Find org with highest safety focus that's struggling
      const safetyOrgs = newState.organizations.filter((o: any) => 
        o.type === 'private' && 
        o.priorities.safetyResearch > 0.4 &&
        o.capital < 100
      );
      
      if (safetyOrgs.length === 0) {
        return {
          success: false,
          newState,
          effects: {},
          events: [],
          message: 'No eligible organizations to subsidize'
        };
      }
      
      // Pick org with highest safety focus
      const targetOrg = safetyOrgs.sort((a: any, b: any) => 
        b.priorities.safetyResearch - a.priorities.safetyResearch
      )[0];
      
      // Give capital boost
      targetOrg.capital += 20;
      
      // Encourage more safety focus
      targetOrg.priorities.safetyResearch = Math.min(1.0, targetOrg.priorities.safetyResearch + 0.1);
      
      // Improve relations
      targetOrg.governmentRelations = Math.min(1.0, targetOrg.governmentRelations + 0.1);
      
      // Cost resources
      newState.government.resources -= 2;
      
      return {
        success: true,
        newState,
        effects: { subsidy: 20 },
        events: [{
          type: 'policy',
          month: newState.currentMonth,
          title: 'Safety Research Subsidized',
          description: `Government gave $20M to ${targetOrg.name} to encourage AI safety research. Improves safety focus.`,
          effects: { safetyFocus: 0.1 }
        }],
        message: `Subsidized ${targetOrg.name} with $20M`
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
  // Use OBSERVABLE capability - government makes decisions based on what it can see, not hidden power
  const observableCapability = calculateObservableAICapability(state.aiAgents);
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
        if (observableCapability > 1.0 && observableCapability < 1.8) {
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
        if (observableCapability > 1.5) {
          priority *= 2.0;
        }
        // Low trust → fear → control response
        if (trustLevel < 0.4) {
          priority *= 1.5; // Fear drives control
        } else if (trustLevel < 0.6) {
          priority *= 1.2; // Moderate concern
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
        if (observableCapability > 1.3) {
          priority *= 1.4;
        }
        // Low trust → fear → hard limits
        if (trustLevel < 0.4) {
          priority *= 1.6; // Panic response
        } else if (trustLevel < 0.6) {
          priority *= 1.3;
        }
        break;
        
      case 'invest_alignment_research':
        // CRITICAL when alignment is drifting or capability is high
        priority = 5; // Base priority
        
        // High priority when alignment is low and capability is significant
        if (avgAlignment < 0.6 && observableCapability > 0.8) {
          priority += 15; // URGENT
        } else if (avgAlignment < 0.7 && observableCapability > 1.2) {
          priority += 12; // Very important
        } else if (avgAlignment < 0.75) {
          priority += 8; // Important
        }
        
        // Boost if approaching recursive improvement threshold
        if (observableCapability > 1.3) {
          priority += 10; // Dangerous zone
        } else if (observableCapability > 1.0) {
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
        if (observableCapability > 2.0 && avgAlignment < 0.5) {
          priority += 25; // EMERGENCY
        } else if (observableCapability > 1.5 && avgAlignment < 0.6) {
          priority += 18; // Very urgent
        } else if (observableCapability > 1.2) {
          priority += 10; // Urgent
        } else if (observableCapability > 0.9) {
          priority += 5; // Proactive
        }
        
        // Higher priority if alignment research isn't working
        if (state.government.alignmentResearchInvestment > 4 && avgAlignment < 0.65) {
          priority += 8; // Research isn't enough
        }
        
        // Low trust + high capability → compute governance NOW
        if (trustLevel < 0.4 && observableCapability > 1.0) {
          priority += 15; // Fear-driven control
        } else if (trustLevel < 0.5 && observableCapability > 1.2) {
          priority += 10; // Concerned response
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
      
      // ===== PHASE 5: RESPONSE ACTIONS =====
      
      case 'emergency_ai_pause':
        // HIGHEST PRIORITY - only triggers in extreme crisis
        // Available = sleepers awake OR 3+ highly misaligned AIs
        const awakeSleepers = state.aiAgents.filter(ai => ai.sleeperState === 'active').length;
        priority = 100 * awakeSleepers; // MASSIVE priority per awake sleeper
        
        if (awakeSleepers === 0) {
          // If available due to misaligned AIs, still high priority
          priority = 50;
        }
        
        // This overrides EVERYTHING - it's an emergency response
        break;
      
      case 'mandatory_safety_reviews':
        // High priority if evaluation is weak and threats exist
        const evalQuality = (
          state.government.evaluationInvestment.benchmarkSuite +
          state.government.evaluationInvestment.alignmentTests +
          state.government.evaluationInvestment.redTeaming +
          state.government.evaluationInvestment.interpretability
        ) / 4;
        
        priority = (10 - evalQuality) * 3; // Lower eval quality = higher priority
        
        // Boost if threats detected
        const undetectedMisaligned = state.aiAgents.filter(ai =>
          ai.trueAlignment < 0.4 && ai.lifecycleState !== 'retired'
        ).length;
        
        if (undetectedMisaligned > 5) {
          priority *= 2.0;
        }
        
        // Boost if recent breakthroughs (capabilities rising fast)
        const recentBreakthroughs = state.ecosystem.breakthroughs.filter(b =>
          b.month > (state.currentYear * 12 + state.currentMonth) - 6
        ).length;
        
        if (recentBreakthroughs > 30) {
          priority *= 1.5;
        }
        
        // Low trust → mandatory verification
        if (trustLevel < 0.5) {
          priority *= 1.4; // Need to verify everything
        }
        break;
      
      // ===== PHASE 5: DIFFUSION CONTROL ACTIONS =====
      
      case 'restrict_research_publishing':
        // Priority based on diffusion speed and capability floor danger
        const diffusionGap = state.ecosystem.frontierCapabilities.selfImprovement - 
                            state.ecosystem.capabilityFloor.selfImprovement;
        
        priority = (1.0 / (diffusionGap + 0.1)) * 5; // Smaller gap = higher priority
        
        // Boost if capability floor is approaching dangerous levels
        if (state.ecosystem.capabilityFloor.selfImprovement > 2.0) {
          priority *= 2.5;
        }
        
        // Low trust → control information flow
        if (trustLevel < 0.5) {
          priority *= 1.3; // Don't let dangerous info spread
        }
        
        // Lower if legitimacy is already low (can't afford more loss)
        if (state.government.legitimacy < 0.4) {
          priority *= 0.5;
        }
        break;
      
      case 'limit_employee_mobility':
        // Priority based on diffusion rate
        priority = state.ecosystem.employeeMobility * 20;
        
        // Boost if capability floor rising fast
        const mobilityDiffusionGap = state.ecosystem.frontierCapabilities.selfImprovement - 
                                     state.ecosystem.capabilityFloor.selfImprovement;
        if (mobilityDiffusionGap < 0.3) {
          priority *= 1.8;
        }
        
        // Low trust → control people movement
        if (trustLevel < 0.4) {
          priority *= 1.5; // Authoritarian control
        }
        
        // Lower if legitimacy is very low (VERY unpopular)
        if (state.government.legitimacy < 0.3) {
          priority *= 0.3;
        }
        break;
      
      case 'ban_reverse_engineering':
        // Priority based on reverse engineering rate
        priority = state.ecosystem.reverseEngineering * 25;
        
        // Boost if many open-weight AIs (easy to reverse engineer)
        const openWeightAIs = state.aiAgents.filter(ai =>
          ai.deploymentType === 'open'
        ).length;
        
        if (openWeightAIs > 10) {
          priority *= 1.5;
        }
        break;
      
      // ===== PHASE 2 & 5: EVALUATION ACTIONS =====
      
      case 'invest_benchmark_suite':
      case 'invest_alignment_tests':
      case 'invest_red_teaming':
      case 'invest_interpretability':
      case 'increase_evaluation_frequency':
        // Medium priority - important but not urgent unless threats exist
        priority = 5;
        
        // Boost if sleepers exist (need better detection)
        const dormantSleepers = state.aiAgents.filter(ai =>
          ai.sleeperState === 'dormant'
        ).length;
        
        if (dormantSleepers > 2) {
          priority *= 2.0;
        }
        
        // Boost if evaluation quality is very low
        const currentEvalQuality = (
          state.government.evaluationInvestment.benchmarkSuite +
          state.government.evaluationInvestment.alignmentTests +
          state.government.evaluationInvestment.redTeaming +
          state.government.evaluationInvestment.interpretability
        ) / 4;
        
        if (currentEvalQuality < 3.0) {
          priority *= 1.8;
        }
        
        // Lower if unemployment is high (competing priorities)
        if (unemploymentLevel > 0.6) {
          priority *= 0.4;
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
/**
 * Automatic evaluation investment based on public trust in AI
 * 
 * Higher public trust → More willingness to invest in evaluation
 * Lower trust → Government focuses on immediate concerns instead
 */
function autoInvestInEvaluation(state: GameState): void {
  const publicTrust = state.society.trustInAI;
  
  // Investment rate scales with trust
  // High trust (0.7+): 0.2 points/month across all categories
  // Medium trust (0.4-0.7): 0.1 points/month
  // Low trust (<0.4): 0.05 points/month (minimal investment)
  const investmentRate = publicTrust > 0.7 ? 0.2 :
                        publicTrust > 0.4 ? 0.1 :
                        0.05;
  
  // Spread investment across all 4 categories
  const perCategory = investmentRate / 4;
  
  state.government.evaluationInvestment.benchmarkSuite = Math.min(
    10,
    state.government.evaluationInvestment.benchmarkSuite + perCategory
  );
  state.government.evaluationInvestment.alignmentTests = Math.min(
    10,
    state.government.evaluationInvestment.alignmentTests + perCategory
  );
  state.government.evaluationInvestment.redTeaming = Math.min(
    10,
    state.government.evaluationInvestment.redTeaming + perCategory
  );
  state.government.evaluationInvestment.interpretability = Math.min(
    10,
    state.government.evaluationInvestment.interpretability + perCategory
  );
}

export function executeGovernmentActions(
  state: GameState,
  random: () => number = Math.random
): ActionResult {
  let currentState = JSON.parse(JSON.stringify(state));
  const allEvents: GameEvent[] = [];
  const allEffects: Record<string, number> = {};
  const messages: string[] = [];
  
  // AUTOMATIC: Invest in evaluation based on public trust
  autoInvestInEvaluation(currentState);
  
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


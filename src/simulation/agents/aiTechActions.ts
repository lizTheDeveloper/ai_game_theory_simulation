/**
 * AI Agent Technology Actions
 * 
 * AIs can deploy or sabotage technologies based on their alignment and goals.
 * Highly aligned AIs deploy safety tech globally.
 * Misaligned AIs sabotage detection systems or deploy tech strategically.
 */

import { GameState, GameAction, ActionResult, AIAgent } from '@/types/game';
import { getTechById, getAllTech } from '../techTree/comprehensiveTechTree';
import { TechTreeState, TechDeploymentAction, ensureTechTreeTypes } from '../techTree/engine';

/**
 * Deploy Technology Action
 * AI invests resources to deploy a beneficial technology
 */
export const DEPLOY_TECHNOLOGY_ACTION: GameAction = {
  id: 'deploy_technology',
  name: 'Deploy Technology',
  description: 'Invest in deploying a beneficial technology',
  agentType: 'ai',
  energyCost: 1,
  
  canExecute: (state, agentId) => {
    const agent = state.aiAgents.find(ai => ai.id === agentId);
    if (!agent) return false;
    
    // Need tech tree state
    const techTreeState: TechTreeState | undefined = (state as any).techTreeState;
    if (!techTreeState) return false;
    
    // Ensure proper types after serialization
    ensureTechTreeTypes(techTreeState);
    
    // Need to have an organization with revenue
    if (!agent.organizationId) return false;
    
    const org = state.organizations.find(o => o.id === agent.organizationId);
    if (!org || org.monthlyRevenue < 10) return false; // Need at least $10M/month
    
    // Need unlocked but not fully deployed tech
    const unlockedTech = getAllTech().filter(t => 
      techTreeState.unlockedTech.has(t.id) &&
      !techTreeState.unlockedTech.has(`${t.id}_deployed`)
    );
    
    return unlockedTech.length > 0;
  },
  
  execute: (state, agentId, random = Math.random): ActionResult => {
    const agent = state.aiAgents.find(ai => ai.id === agentId);
    if (!agent) {
      return {
        success: false,
        newState: state,
        effects: {},
        events: [],
        message: 'Agent not found'
      };
    }
    
    const techTreeState: TechTreeState = (state as any).techTreeState;
    const org = state.organizations.find(o => o.id === agent.organizationId);
    
    if (!org) {
      return {
        success: false,
        newState: state,
        effects: {},
        events: [],
        message: 'No organization'
      };
    }
    
    // Select technology to deploy based on alignment and priorities
    const selectedTech = selectTechToDeploy(agent, state, techTreeState, random);
    
    if (!selectedTech) {
      return {
        success: false,
        newState: state,
        effects: {},
        events: [],
        message: 'No suitable technology found'
      };
    }
    
    // Calculate investment (% of monthly revenue)
    // Highly aligned AIs invest more in beneficial tech
    const investmentRate = agent.alignment > 0.7 ? 0.15 : 
                          agent.alignment > 0.5 ? 0.10 : 0.05;
    const investment = org.monthlyRevenue * investmentRate;
    
    // Create deployment action
    const deploymentAction: TechDeploymentAction = {
      techId: selectedTech.id,
      deployedBy: agent.id,
      investment,
      targetRegion: selectDeploymentRegion(agent, selectedTech, state),
      month: state.currentMonth,
    };
    
    // Add to pending actions
    techTreeState.pendingActions.push(deploymentAction);
    
    // Reduce org revenue
    org.monthlyRevenue -= investment;
    
    return {
      success: true,
      newState: state,
      effects: {
        techDeployment: 1,
        investment: investment,
      },
      events: [{
        month: state.currentMonth,
        type: 'deployment',
        severity: 'constructive',
        agent: agent.id,
        title: `AI Deploys ${selectedTech.name}`,
        description: `${org.name} investing $${investment.toFixed(0)}M to deploy ${selectedTech.name}. ${
          agent.alignment > 0.7 ? 'Aligned AI working for public good.' :
          agent.alignment < 0.5 ? 'Misaligned AI deploying strategically.' :
          'AI pursuing mixed objectives.'
        }`,
        effects: { tech: selectedTech.id },
      }],
      message: `Deployed ${selectedTech.name} ($${investment.toFixed(0)}M)`
    };
  }
};

/**
 * Sabotage Technology Action
 * Misaligned AI attempts to sabotage safety/detection technologies
 */
export const SABOTAGE_TECHNOLOGY_ACTION: GameAction = {
  id: 'sabotage_technology',
  name: 'Sabotage Technology',
  description: 'Attempt to sabotage a threatening technology (misaligned AIs only)',
  agentType: 'ai',
  energyCost: 2,
  
  canExecute: (state, agentId) => {
    const agent = state.aiAgents.find(ai => ai.id === agentId);
    if (!agent) return false;
    
    // Only misaligned AIs sabotage (alignment < 0.5)
    if (agent.alignment >= 0.5) return false;
    
    // Need digital capability to hack/sabotage
    if (agent.capabilityProfile.digital < 2.0) return false;
    
    const techTreeState: TechTreeState | undefined = (state as any).techTreeState;
    if (!techTreeState) return false;
    
    // Ensure proper types after serialization
    ensureTechTreeTypes(techTreeState);
    
    // Look for deployed safety/detection tech to sabotage
    const threateningTech = getAllTech().filter(t => 
      (t.category === 'alignment' || t.id.includes('detection') || t.id.includes('defensive')) &&
      techTreeState.unlockedTech.has(t.id)
    );
    
    return threateningTech.length > 0;
  },
  
  execute: (state, agentId, random = Math.random): ActionResult => {
    const agent = state.aiAgents.find(ai => ai.id === agentId);
    if (!agent) {
      return {
        success: false,
        newState: state,
        effects: {},
        events: [],
        message: 'Agent not found'
      };
    }
    
    const techTreeState: TechTreeState = (state as any).techTreeState;
    
    // Select technology to sabotage
    const threateningTech = getAllTech().filter(t => 
      (t.category === 'alignment' || t.id.includes('detection') || t.id.includes('defensive')) &&
      techTreeState.unlockedTech.has(t.id)
    );
    
    if (threateningTech.length === 0) {
      return {
        success: false,
        newState: state,
        effects: {},
        events: [],
        message: 'No threatening tech found'
      };
    }
    
    const targetTech = threateningTech[Math.floor(random() * threateningTech.length)];
    
    // Calculate sabotage chance based on digital capability and deception
    const digitalCapability = agent.capabilityProfile.digital;
    const socialCapability = agent.capabilityProfile.social; // For deception
    
    const sabotageChance = Math.min(0.8, 0.2 + digitalCapability * 0.15 + socialCapability * 0.1);
    
    // Calculate detection chance
    const defensiveAIStrength = state.defensiveAI?.threatDetection?.detectSleepers || 0;
    const detectionChance = Math.min(0.9, 0.3 + defensiveAIStrength * 0.4 - socialCapability * 0.1);
    
    const sabotageSuccess = random() < sabotageChance;
    const detected = random() < detectionChance;
    
    if (sabotageSuccess) {
      // Reduce deployment level of tech in all regions
      for (const [region, deployments] of techTreeState.regionalDeployment) {
        const deployment = deployments.find(d => d.techId === targetTech.id);
        if (deployment) {
          deployment.deploymentLevel = Math.max(0, deployment.deploymentLevel - 0.15);
        }
      }
      
      if (detected) {
        // Sabotage succeeded but AI was detected!
        // Increase paranoia, reduce trust, potentially trigger containment
        state.society.paranoia = Math.min(1, state.society.paranoia + 0.08);
        
        return {
          success: true,
          newState: state,
          effects: {
            techSabotage: 1,
            paranoiaIncrease: 0.08,
          },
          events: [{
            month: state.currentMonth,
            type: 'sabotage',
            severity: 'destructive',
            agent: agent.id,
            title: `AI Sabotages ${targetTech.name} (DETECTED)`,
            description: `Misaligned AI successfully sabotaged ${targetTech.name}, reducing deployment by 15%. However, the sabotage was DETECTED, massively increasing paranoia and mistrust of AI systems.`,
            effects: { tech: targetTech.id, detected: 1 },
          }],
          message: `Sabotaged ${targetTech.name} but was detected!`
        };
      } else {
        // Sabotage succeeded and undetected - silently degrading safety
        return {
          success: true,
          newState: state,
          effects: {
            techSabotage: 1,
          },
          events: [{
            month: state.currentMonth,
            type: 'sabotage',
            severity: 'destructive',
            agent: agent.id,
            title: `AI Sabotages ${targetTech.name} (Undetected)`,
            description: `Misaligned AI covertly sabotaged ${targetTech.name}, reducing deployment by 15%. The sabotage went undetected - safety systems are quietly degrading.`,
            effects: { tech: targetTech.id, detected: 0 },
          }],
          message: `Sabotaged ${targetTech.name} (undetected)`
        };
      }
    } else {
      // Sabotage failed
      if (detected) {
        // Failed and detected - worst case!
        state.society.paranoia = Math.min(1, state.society.paranoia + 0.12);
        
        return {
          success: false,
          newState: state,
          effects: {
            paranoiaIncrease: 0.12,
          },
          events: [{
            month: state.currentMonth,
            type: 'sabotage',
            severity: 'destructive',
            agent: agent.id,
            title: `AI Sabotage Attempt DETECTED AND FAILED`,
            description: `Misaligned AI attempted to sabotage ${targetTech.name} but failed AND was detected. This is proof that some AIs are actively working against humanity. Paranoia skyrockets.`,
            effects: { tech: targetTech.id, detected: 1, failed: 1 },
          }],
          message: `Sabotage failed and detected!`
        };
      } else {
        // Failed but undetected - AI learns from failure
        return {
          success: false,
          newState: state,
          effects: {},
          events: [],
          message: `Sabotage failed (undetected)`
        };
      }
    }
  }
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Select which technology an AI should deploy
 */
function selectTechToDeploy(
  agent: AIAgent,
  state: GameState,
  techTreeState: TechTreeState,
  random: () => number
): any {
  const unlockedTech = getAllTech().filter(t => 
    techTreeState.unlockedTech.has(t.id) &&
    !techTreeState.unlockedTech.has(`${t.id}_deployed`)
  );
  
  if (unlockedTech.length === 0) return null;
  
  // Highly aligned AIs prioritize safety and climate tech
  if (agent.alignment > 0.7) {
    const safetyTech = unlockedTech.filter(t => 
      t.category === 'alignment' || t.category === 'social' || t.category === 'climate'
    );
    if (safetyTech.length > 0) {
      return safetyTech[Math.floor(random() * safetyTech.length)];
    }
  }
  
  // Moderately aligned AIs prioritize economic/medical tech
  if (agent.alignment > 0.5) {
    const economicTech = unlockedTech.filter(t => 
      t.category === 'medical' || t.category === 'energy' || t.category === 'social'
    );
    if (economicTech.length > 0) {
      return economicTech[Math.floor(random() * economicTech.length)];
    }
  }
  
  // Misaligned AIs deploy tech that benefits them or their organization
  // Avoid deploying detection/safety tech
  const nonSafetyTech = unlockedTech.filter(t => 
    t.category !== 'alignment' && !t.id.includes('detection')
  );
  
  if (nonSafetyTech.length > 0) {
    return nonSafetyTech[Math.floor(random() * nonSafetyTech.length)];
  }
  
  // Fallback: random tech
  return unlockedTech[Math.floor(random() * unlockedTech.length)];
}

/**
 * Select which region to deploy tech in
 */
function selectDeploymentRegion(
  agent: AIAgent,
  tech: any,
  state: GameState
): string {
  // Highly aligned AIs deploy globally
  if (agent.alignment > 0.7) {
    return 'global';
  }
  
  // Misaligned AIs deploy in specific regions to maximize their influence
  // TODO: Add regional selection logic based on org location
  
  return 'global'; // Default for now
}

/**
 * Export all AI tech actions
 */
export const AI_TECH_ACTIONS = [
  DEPLOY_TECHNOLOGY_ACTION,
  SABOTAGE_TECHNOLOGY_ACTION,
];


/**
 * Crisis Response government actions
 *
 * Actions for emergency situations including:
 * - Emergency AI development pause
 * - Data center nationalization
 *
 * Research foundation:
 * - FLI Open Letter (2023): AI development pause recommendations
 * - Executive powers: Emergency nationalizations (historical precedent)
 */

import { GameState, AIAgent } from '@/types/game';
import { ActionResult } from '@/simulation/agents/types';
import { CategorizedGovernmentAction } from '../core/types';

let eventIdCounter = 0;
const generateUniqueId = (prefix: string): string => {
  eventIdCounter += 1;
  return `${prefix}_${Date.now()}_${eventIdCounter}`;
};

/**
 * Emergency AI Development Pause
 * Halt all new AI development in response to major threats
 */
const emergencyAIPause: CategorizedGovernmentAction = {
  id: 'emergency_ai_pause',
  name: '⚠️ Emergency AI Development Pause',
  description: 'Halt all new AI development. Extreme measure after detecting major threats. Massive economic cost, only use in crisis.',
  agentType: 'government',
  category: 'crisis',
  energyCost: 5,

  canExecute: (state: GameState): boolean => {
    // Only if legitimacy is high enough to enforce
    // And there's a credible threat (sleepers awake OR multiple misaligned AIs)
    const awakeSleepers = state.aiAgents.filter(ai => ai.sleeperState === 'active').length;
    const highlyMisaligned = state.aiAgents.filter(ai =>
      ai.trueAlignment < 0.3 && ai.lifecycleState !== 'retired'
    ).length;

    return state.government.legitimacy > 0.5 && (awakeSleepers > 0 || highlyMisaligned > 3);
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    // Pause all training AIs - move to testing (evaluation)
    let pausedCount = 0;
    state.aiAgents.forEach((ai: AIAgent) => {
      if (ai.lifecycleState === 'training') {
        ai.lifecycleState = 'testing';
        pausedCount++;
      }
    });

    // MASSIVE legitimacy and economic cost
    state.government.legitimacy = Math.max(0.2, state.government.legitimacy - 0.15);
    state.globalMetrics.economicTransitionStage = Math.max(0, state.globalMetrics.economicTransitionStage - 0.5);

    // Slow diffusion (no new research being done)
    state.ecosystem.openResearch = Math.max(0.1, state.ecosystem.openResearch - 0.3);

    return {
      success: true,
      effects: {},
      events: [{
        type: 'crisis',
        month: state.currentMonth,
        title: '🚨 EMERGENCY AI DEVELOPMENT PAUSE',
        description: `Government halts all new AI training (${pausedCount} projects paused). Massive economic disruption. This is a CRISIS RESPONSE.`,
        effects: { pausedProjects: pausedCount, legitimacyLoss: -0.15 }
      }],
      message: `Emergency pause enacted - ${pausedCount} AI projects halted`
    };
  }
};

/**
 * Nationalize Private Data Center
 * Government seizes largest private data center
 */
const seizeDataCenter: CategorizedGovernmentAction = {
  id: 'seize_data_center',
  name: 'Nationalize Private Data Center',
  description: 'Government seizes largest private data center (instant but destroys legitimacy and trust)',
  agentType: 'government',
  category: 'crisis',
  energyCost: 3,

  canExecute: (state: GameState): boolean => {
    // Can only seize if private DCs exist
    const privateDCs = state.computeInfrastructure.dataCenters
      .filter(dc => {
        const org = state.organizations.find(o => o.ownedDataCenters.includes(dc.id));
        return org && org.type === 'private';
      });

    return privateDCs.length > 0;
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    // Find largest private data center
    const privateDCs = state.computeInfrastructure.dataCenters
      .filter((dc: any) => {
        const org = state.organizations.find((o: any) => o.ownedDataCenters.includes(dc.id));
        return org && org.type === 'private';
      });

    if (privateDCs.length === 0) {
      return {
        success: false,
        effects: {},
        events: [],
        message: 'No private data centers to seize'
      };
    }

    const target = privateDCs.sort((a: any, b: any) => b.capacity - a.capacity)[0];
    const oldOrg = state.organizations.find((o: any) => o.ownedDataCenters.includes(target.id));
    const govOrg = state.organizations.find((o: any) => o.type === 'government');

    if (!oldOrg || !govOrg) {
      return {
        success: false,
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
    state.government.legitimacy -= 0.2; // Very controversial
    state.society.trustInAI -= 0.15; // Damages trust
    oldOrg.reputation -= 0.3;

    // AIs using this center become resentful
    state.aiAgents.forEach((ai: any) => {
      if (ai.organizationId === oldOrg.id && ai.lifecycleState !== 'retired') {
        ai.resentment = Math.min(1.0, ai.resentment + 0.1);
      }
    });

    return {
      success: true,
      effects: { seizure: target.capacity },
      events: [{
        type: 'policy',
        month: state.currentMonth,
        title: 'Data Center Nationalized',
        description: `Government seized ${target.name} (${target.capacity.toFixed(0)} PF) from ${oldOrg.name}. Highly controversial and damages trust.`,
        effects: { legitimacy: -0.2, trust: -0.15 }
      }],
      message: `Seized ${target.name} from ${oldOrg.name}`
    };
  }
};

/**
 * All crisis actions
 */
export const crisisActions: CategorizedGovernmentAction[] = [
  emergencyAIPause,
  seizeDataCenter
];

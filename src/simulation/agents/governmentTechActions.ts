/**
 * Government Technology Deployment Actions
 * 
 * Nations deploy technologies based on their strategic priorities:
 * - US: AI safety, fusion power ($50B/month)
 * - China: Economic tech, surveillance ($40B/month)
 * - EU: Clean energy, regulation ($35B/month)
 * - Saudi Arabia: Desalination (existential), solar ($20B/month)
 * - India: Agricultural tech, water ($15B/month)
 * - Africa: Basic needs, disease elimination ($10B/month)
 */

import { GameState, GameAction, ActionResult } from '@/types/game';
import { getTechById, getAllTech } from '../techTree/comprehensiveTechTree';
import { TechTreeState, TechDeploymentAction } from '../techTree/engine';

/**
 * National tech deployment priorities
 * Based on geopolitical realities, resource needs, and existential threats
 */
const NATIONAL_TECH_PRIORITIES: Record<string, {
  monthlyBudget: number;
  priorities: { category: string; weight: number; reason: string }[];
}> = {
  'United States': {
    monthlyBudget: 50,  // $50B/month
    priorities: [
      { category: 'alignment', weight: 0.35, reason: 'AI safety leadership' },
      { category: 'energy', weight: 0.25, reason: 'Fusion for energy independence' },
      { category: 'medical', weight: 0.20, reason: 'Disease elimination, longevity' },
      { category: 'social', weight: 0.10, reason: 'UBI, purpose infrastructure' },
      { category: 'climate', weight: 0.10, reason: 'Climate mitigation' },
    ],
  },
  'China': {
    monthlyBudget: 40,  // $40B/month
    priorities: [
      { category: 'energy', weight: 0.30, reason: 'Clean energy for growth' },
      { category: 'medical', weight: 0.25, reason: 'Healthcare modernization' },
      { category: 'alignment', weight: 0.20, reason: 'AI control (authoritarian)' },
      { category: 'social', weight: 0.15, reason: 'Social stability systems' },
      { category: 'climate', weight: 0.10, reason: 'Pollution remediation' },
    ],
  },
  'European Union': {
    monthlyBudget: 35,  // $35B/month
    priorities: [
      { category: 'energy', weight: 0.35, reason: 'Net-zero by 2050' },
      { category: 'climate', weight: 0.25, reason: 'Environmental leadership' },
      { category: 'alignment', weight: 0.20, reason: 'AI regulation, safety' },
      { category: 'social', weight: 0.15, reason: 'Social cohesion' },
      { category: 'medical', weight: 0.05, reason: 'Healthcare' },
    ],
  },
  'Saudi Arabia': {
    monthlyBudget: 20,  // $20B/month
    priorities: [
      { category: 'freshwater', weight: 0.50, reason: 'EXISTENTIAL: Day Zero threat' },
      { category: 'energy', weight: 0.30, reason: 'Solar for desalination' },
      { category: 'climate', weight: 0.10, reason: 'Heat adaptation' },
      { category: 'medical', weight: 0.05, reason: 'Healthcare' },
      { category: 'social', weight: 0.05, reason: 'Social stability' },
    ],
  },
  'India': {
    monthlyBudget: 15,  // $15B/month
    priorities: [
      { category: 'agriculture', weight: 0.35, reason: 'Food security' },
      { category: 'freshwater', weight: 0.25, reason: 'Aquifer depletion' },
      { category: 'energy', weight: 0.20, reason: 'Clean energy for growth' },
      { category: 'medical', weight: 0.10, reason: 'Disease burden' },
      { category: 'social', weight: 0.10, reason: 'Poverty reduction' },
    ],
  },
  'Africa': {
    monthlyBudget: 10,  // $10B/month (aggregate)
    priorities: [
      { category: 'medical', weight: 0.35, reason: 'Disease elimination' },
      { category: 'agriculture', weight: 0.25, reason: 'Food security' },
      { category: 'energy', weight: 0.20, reason: 'Basic energy access' },
      { category: 'freshwater', weight: 0.15, reason: 'Water access' },
      { category: 'social', weight: 0.05, reason: 'Basic needs' },
    ],
  },
};

/**
 * Deploy National Technology Action
 * Government invests in deploying technology based on national priorities
 */
export const DEPLOY_NATIONAL_TECHNOLOGY_ACTION: GameAction = {
  id: 'deploy_national_technology',
  name: 'Deploy National Technology',
  description: 'Invest in deploying technology based on national strategic priorities',
  agentType: 'government',
  energyCost: 0,
  
  canExecute: (state) => {
    const techTreeState: TechTreeState | undefined = (state as any).techTreeState;
    if (!techTreeState) return false;
    
    // Need unlocked tech
    const unlockedTech = getAllTech().filter(t => 
      techTreeState.unlockedTech.has(t.id) &&
      !techTreeState.unlockedTech.has(`${t.id}_deployed`)
    );
    
    return unlockedTech.length > 0;
  },
  
  execute: (state, agentId, random = Math.random): ActionResult => {
    const techTreeState: TechTreeState = (state as any).techTreeState;
    
    // Determine which nation is deploying (for now, use a weighted selection)
    // In future, this could be based on country-specific government actions
    const nation = selectNationToAct(state, random);
    const priorities = NATIONAL_TECH_PRIORITIES[nation];
    
    if (!priorities) {
      return {
        success: false,
        newState: state,
        effects: {},
        events: [],
        message: 'No priorities defined for nation'
      };
    }
    
    // Select technology based on national priorities
    const selectedTech = selectNationalTechToDeploy(priorities, techTreeState, state, random);
    
    if (!selectedTech) {
      return {
        success: false,
        newState: state,
        effects: {},
        events: [],
        message: 'No suitable technology found'
      };
    }
    
    // Calculate investment (% of monthly budget)
    // Crisis urgency increases investment
    const crisisMultiplier = getCrisisUrgencyMultiplier(selectedTech, state);
    const investment = priorities.monthlyBudget * 1000 * crisisMultiplier; // Convert $B to $M
    
    // Create deployment action
    const deploymentAction: TechDeploymentAction = {
      techId: selectedTech.id,
      deployedBy: nation,
      investment,
      targetRegion: nation,  // Nations deploy primarily in their own region
      month: state.currentMonth,
    };
    
    // Add to pending actions
    techTreeState.pendingActions.push(deploymentAction);
    
    // Track government spending on tech
    state.government.researchInvestments.totalBudget += investment / 1000; // Track in $B
    
    return {
      success: true,
      newState: state,
      effects: {
        nationalTechDeployment: 1,
        investment: investment,
      },
      events: [{
        month: state.currentMonth,
        type: 'deployment',
        severity: 'constructive',
        agent: nation,
        title: `${nation} Deploys ${selectedTech.name}`,
        description: `${nation} investing $${(investment / 1000).toFixed(1)}B to deploy ${selectedTech.name}. ${
          crisisMultiplier > 1.5 ? 'CRISIS RESPONSE: Urgent deployment to address existential threat.' :
          crisisMultiplier > 1.0 ? 'High priority deployment addressing national challenge.' :
          'Strategic technology investment.'
        }`,
        effects: { tech: selectedTech.id, nation },
      }],
      message: `${nation} deployed ${selectedTech.name} ($${(investment / 1000).toFixed(1)}B)`
    };
  }
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Select which nation acts this turn
 * Weighted by budget (richer nations act more often)
 */
function selectNationToAct(state: GameState, random: () => number): string {
  const nations = Object.keys(NATIONAL_TECH_PRIORITIES);
  const weights = nations.map(nation => NATIONAL_TECH_PRIORITIES[nation].monthlyBudget);
  
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let randomValue = random() * totalWeight;
  
  for (let i = 0; i < nations.length; i++) {
    randomValue -= weights[i];
    if (randomValue <= 0) {
      return nations[i];
    }
  }
  
  return nations[0]; // Fallback
}

/**
 * Select which technology to deploy based on national priorities
 */
function selectNationalTechToDeploy(
  priorities: typeof NATIONAL_TECH_PRIORITIES[string],
  techTreeState: TechTreeState,
  state: GameState,
  random: () => number
): any {
  const unlockedTech = getAllTech().filter(t => 
    techTreeState.unlockedTech.has(t.id) &&
    !techTreeState.unlockedTech.has(`${t.id}_deployed`)
  );
  
  if (unlockedTech.length === 0) return null;
  
  // Weight tech by national priorities
  const techWeights = unlockedTech.map(tech => {
    // Find matching priority
    const priority = priorities.priorities.find(p => 
      tech.category === p.category || 
      tech.id.includes(p.category)
    );
    
    if (!priority) return 0.1; // Low weight for non-priority tech
    
    let weight = priority.weight * 10; // Scale up weights
    
    // Increase weight if crisis is active
    if (isCrisisActiveForCategory(tech.category, state)) {
      weight *= 3.0; // 3× priority during crisis
    }
    
    return weight;
  });
  
  // Weighted random selection
  const totalWeight = techWeights.reduce((sum, w) => sum + w, 0);
  let randomValue = random() * totalWeight;
  
  for (let i = 0; i < unlockedTech.length; i++) {
    randomValue -= techWeights[i];
    if (randomValue <= 0) {
      return unlockedTech[i];
    }
  }
  
  return unlockedTech[0]; // Fallback
}

/**
 * Get crisis urgency multiplier for investment
 */
function getCrisisUrgencyMultiplier(tech: any, state: GameState): number {
  let multiplier = 1.0;
  
  // Freshwater crisis
  if (tech.category === 'freshwater' && state.freshwaterSystem) {
    const dayZeroCount = Object.values(state.freshwaterSystem.regions).filter(
      r => r.dayZeroMonthsUntil <= 12
    ).length;
    if (dayZeroCount > 0) {
      multiplier = 2.5; // EXISTENTIAL THREAT: 2.5× investment
    }
  }
  
  // Phosphorus crisis (famine)
  if ((tech.category === 'agriculture' || tech.id.includes('phosphorus')) && state.phosphorusSystem) {
    if (state.phosphorusSystem.crisisState === 'supply_shock' || 
        state.phosphorusSystem.crisisState === 'weaponization') {
      multiplier = 2.0; // FAMINE THREAT: 2× investment
    }
  }
  
  // Climate/ecosystem collapse
  if ((tech.category === 'climate' || tech.category === 'ocean') && 
      state.environmentalAccumulation) {
    if (state.environmentalAccumulation.ecosystemCollapseActive) {
      multiplier = 1.8; // ECOSYSTEM COLLAPSE: 1.8× investment
    }
  }
  
  // Meaning crisis (social breakdown)
  if (tech.category === 'social' && state.socialAccumulation) {
    if (state.socialAccumulation.meaningCollapseActive) {
      multiplier = 1.5; // SOCIAL CRISIS: 1.5× investment
    }
  }
  
  return multiplier;
}

/**
 * Check if crisis is active for a tech category
 */
function isCrisisActiveForCategory(category: string, state: GameState): boolean {
  switch (category) {
    case 'freshwater':
      return state.freshwaterSystem && 
             Object.values(state.freshwaterSystem.regions).some(r => r.dayZeroMonthsUntil <= 24);
    case 'agriculture':
      return state.phosphorusSystem && 
             (state.phosphorusSystem.crisisState === 'supply_shock' || 
              state.phosphorusSystem.crisisState === 'weaponization');
    case 'climate':
    case 'ocean':
      return state.environmentalAccumulation?.ecosystemCollapseActive || false;
    case 'social':
      return state.socialAccumulation?.meaningCollapseActive || false;
    case 'alignment':
      return (state.aiAgents.filter(ai => ai.alignment < 0.5).length / state.aiAgents.length) > 0.3;
    default:
      return false;
  }
}

/**
 * Export all government tech actions
 */
export const GOVERNMENT_TECH_ACTIONS = [
  DEPLOY_NATIONAL_TECHNOLOGY_ACTION,
];


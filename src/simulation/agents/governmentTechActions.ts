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

import { GameState } from '@/types/game';
import { ActionResult, GameAction } from './types';
import { getTechById, getAllTech } from '../techTree/comprehensiveTechTree';
import { TechTreeState, TechDeploymentAction } from '../techTree/engine';
import { getOptimalDeploymentRegions, getDeploymentPriority } from '../techTree/regionalDeployment';
import { assertStateProperty } from '../utils/assertions';
import { hasTech } from '../utils/simulationIndices';

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
      { category: 'alignment', weight: 0.30, reason: 'AI safety leadership' },
      { category: 'energy', weight: 0.20, reason: 'Fusion for energy independence' },
      { category: 'medical', weight: 0.20, reason: 'Disease elimination, longevity' },
      { category: 'climate', weight: 0.15, reason: 'Climate mitigation & habitat restoration' },
      { category: 'social', weight: 0.10, reason: 'UBI, purpose infrastructure' },
      { category: 'ocean', weight: 0.05, reason: 'Ocean conservation' },
    ],
  },
  'China': {
    monthlyBudget: 40,  // $40B/month
    priorities: [
      { category: 'energy', weight: 0.25, reason: 'Clean energy for growth' },
      { category: 'medical', weight: 0.20, reason: 'Healthcare modernization' },
      { category: 'alignment', weight: 0.20, reason: 'AI control (authoritarian)' },
      { category: 'climate', weight: 0.15, reason: 'Pollution remediation & reforestation' },
      { category: 'social', weight: 0.15, reason: 'Social stability systems' },
      { category: 'agriculture', weight: 0.05, reason: 'Food security' },
    ],
  },
  'European Union': {
    monthlyBudget: 35,  // $35B/month
    priorities: [
      { category: 'climate', weight: 0.35, reason: 'Environmental leadership & habitat restoration' },
      { category: 'energy', weight: 0.25, reason: 'Net-zero by 2050' },
      { category: 'alignment', weight: 0.15, reason: 'AI regulation, safety' },
      { category: 'social', weight: 0.15, reason: 'Social cohesion' },
      { category: 'ocean', weight: 0.05, reason: 'Marine ecosystem restoration' },
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
      { category: 'agriculture', weight: 0.30, reason: 'Food security' },
      { category: 'freshwater', weight: 0.20, reason: 'Aquifer depletion' },
      { category: 'climate', weight: 0.20, reason: 'Ecosystem services & monsoon stability' },
      { category: 'energy', weight: 0.15, reason: 'Clean energy for growth' },
      { category: 'medical', weight: 0.10, reason: 'Disease burden' },
      { category: 'social', weight: 0.05, reason: 'Poverty reduction' },
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
  
  canExecute: (state, agentId, context) => {
    const techTreeState: TechTreeState = state.techTreeState;
    if (!techTreeState) return false;

    // Ensure proper types after serialization
    // No longer needed - using plain objects

    // FIX #15 (Oct 21, 2025): Check deployment level properly
    // Old: Checked if unlockedTech contains '${techId}_deployed' (WRONG - never exists)
    // New: Check actual deployment level in regionalDeployment
    // H-1 (Dec 11, 2025): Use O(1) hasTech helper
    const unlockedTech = getAllTech().filter(t => {
      if (!hasTech(t.id, context?.indices, techTreeState)) return false;

      // Check if tech is NOT fully deployed globally (< 95%)
      const globalDeployment = techTreeState.regionalDeployment['global'];
      if (!globalDeployment) return true; // No deployments yet - can deploy

      const deployment = globalDeployment.find(d => d.techId === t.id);
      if (!deployment) return true; // Not deployed yet

      return deployment.deploymentLevel < 0.95; // Can deploy if less than 95%
    });

    return unlockedTech.length > 0;
  },
  
  execute: (state, random, agentId?: string, context?): ActionResult => {
    const techTreeState: TechTreeState = state.techTreeState;

    // DEBUG: Log action execution
    console.log(`\n🏛️ Government attempting national tech deployment (Month ${state.currentMonth})`);

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
    const selectedTech = selectNationalTechToDeploy(priorities, techTreeState, state, random, context);
    
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
    
    // Determine target region based on nation and tech optimality
    const targetRegion = selectGovernmentDeploymentRegion(nation, selectedTech, state);
    
    // Create deployment action
    const deploymentAction: TechDeploymentAction = {
      techId: selectedTech.id,
      deployedBy: nation,
      investment,
      targetRegion,
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
        id: `gov_deploy_${selectedTech.id}_${state.currentMonth}`,
        timestamp: state.currentMonth,
        type: 'action',
        severity: 'info',
        agent: nation,
        title: `${nation} Deploys ${selectedTech.name}`,
        description: `${nation} investing $${(investment / 1000).toFixed(1)}B to deploy ${selectedTech.name}. ${
          crisisMultiplier > 1.5 ? 'CRISIS RESPONSE: Urgent deployment to address existential threat.' :
          crisisMultiplier > 1.0 ? 'High priority deployment addressing national challenge.' :
          'Strategic technology investment.'
        }`,
        effects: { investment: investment / 1000 }, // Investment in billions
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
  random: () => number,
  context?: any
): any {
  // H-1 (Dec 11, 2025): Use O(1) hasTech helper
  const unlockedTech = getAllTech().filter(t =>
    hasTech(t.id, context?.indices, techTreeState) &&
    !hasTech(`${t.id}_deployed`, context?.indices, techTreeState)
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
    // Check for active Day Zero drought or critical scarcity
    if (state.freshwaterSystem.dayZeroDrought?.active ||
        state.freshwaterSystem.criticalScarcityActive) {
      multiplier = 2.5; // EXISTENTIAL THREAT: 2.5× investment
    }
  }

  // Phosphorus crisis (famine)
  if ((tech.category === 'agriculture' || tech.id.includes('phosphorus')) && state.phosphorusSystem) {
    if (state.phosphorusSystem.supplyShockActive ||
        state.phosphorusSystem.criticalDepletionActive) {
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
 * Phase 5.1 (Oct 26, 2025): Use assertStateProperty for REQUIRED state properties
 */
function isCrisisActiveForCategory(category: string, state: GameState): boolean {
  switch (category) {
    case 'freshwater':
      return state.freshwaterSystem &&
             (state.freshwaterSystem.dayZeroDrought?.active ||
              state.freshwaterSystem.criticalScarcityActive);
    case 'agriculture':
      return state.phosphorusSystem &&
             (state.phosphorusSystem.supplyShockActive ||
              state.phosphorusSystem.criticalDepletionActive);
    case 'climate':
    case 'ocean':
      // LEGITIMATE DEFAULT: ecosystemCollapseActive is optional (backward compat alias for ecosystemCrisisActive)
      // Default to false if not present
      return state.environmentalAccumulation?.ecosystemCollapseActive || false;
    case 'social':
      return assertStateProperty(
        state.socialAccumulation,
        'meaningCollapseActive',
        { location: 'governmentTechActions.isCrisisActiveForCategory', month: state.currentMonth }
      ) as unknown as boolean;
    case 'alignment':
      return (state.aiAgents.filter(ai => ai.alignment < 0.5).length / state.aiAgents.length) > 0.3;
    default:
      return false;
  }
}

/**
 * Select which region a government should deploy tech in
 */
function selectGovernmentDeploymentRegion(
  nation: string,
  tech: any,
  state: GameState
): string {
  // Map nations to their primary regions
  const nationToRegion: Record<string, string> = {
    'United States': 'North America',
    'China': 'Asia',
    'European Union': 'Europe',
    'Saudi Arabia': 'Asia', // Middle East is part of Asia in our regional system
    'India': 'Asia',
    'Brazil': 'South America',
    'Russia': 'Europe',
    'Japan': 'Asia',
    'Germany': 'Europe',
    'United Kingdom': 'Europe',
    'France': 'Europe',
    'Canada': 'North America',
    'Australia': 'Oceania',
    'South Korea': 'Asia',
    'Italy': 'Europe',
    'Spain': 'Europe',
    'Netherlands': 'Europe',
    'Sweden': 'Europe',
    'Norway': 'Europe',
    'Denmark': 'Europe',
    'Finland': 'Europe',
    'Switzerland': 'Europe',
    'Austria': 'Europe',
    'Belgium': 'Europe',
    'Poland': 'Europe',
    'Czech Republic': 'Europe',
    'Hungary': 'Europe',
    'Portugal': 'Europe',
    'Greece': 'Europe',
    'Ireland': 'Europe',
    'New Zealand': 'Oceania',
    'Israel': 'Asia',
    'Turkey': 'Europe',
    'South Africa': 'Africa',
    'Nigeria': 'Africa',
    'Egypt': 'Africa',
    'Kenya': 'Africa',
    'Morocco': 'Africa',
    'Ethiopia': 'Africa',
    'Ghana': 'Africa',
    'Tanzania': 'Africa',
    'Uganda': 'Africa',
    'Algeria': 'Africa',
    'Sudan': 'Africa',
    'Angola': 'Africa',
    'Mozambique': 'Africa',
    'Madagascar': 'Africa',
    'Cameroon': 'Africa',
    'Côte d\'Ivoire': 'Africa',
    'Niger': 'Africa',
    'Burkina Faso': 'Africa',
    'Mali': 'Africa',
    'Malawi': 'Africa',
    'Zambia': 'Africa',
    'Somalia': 'Africa',
    'Senegal': 'Africa',
    'Chad': 'Africa',
    'Zimbabwe': 'Africa',
    'Guinea': 'Africa',
    'Rwanda': 'Africa',
    'Benin': 'Africa',
    'Burundi': 'Africa',
    'Tunisia': 'Africa',
    'South Sudan': 'Africa',
    'Togo': 'Africa',
    'Sierra Leone': 'Africa',
    'Libya': 'Africa',
    'Liberia': 'Africa',
    'Central African Republic': 'Africa',
    'Mauritania': 'Africa',
    'Eritrea': 'Africa',
    'Gambia': 'Africa',
    'Botswana': 'Africa',
    'Gabon': 'Africa',
    'Lesotho': 'Africa',
    'Guinea-Bissau': 'Africa',
    'Equatorial Guinea': 'Africa',
    'Mauritius': 'Africa',
    'Eswatini': 'Africa',
    'Djibouti': 'Africa',
    'Comoros': 'Africa',
    'Cape Verde': 'Africa',
    'São Tomé and Príncipe': 'Africa',
    'Seychelles': 'Africa',
  };
  
  const primaryRegion = nationToRegion[nation] || 'global';
  
  // Get optimal deployment regions for this tech
  const optimalRegions = getOptimalDeploymentRegions(tech, state);
  
  // If the nation's primary region is optimal, deploy there
  if (optimalRegions.includes(primaryRegion)) {
    return primaryRegion;
  }
  
  // If primary region is not optimal, choose the best optimal region
  if (optimalRegions.length > 0) {
    const regionPriorities = optimalRegions.map(region => ({
      region,
      priority: getDeploymentPriority(tech, region, state)
    }));
    
    regionPriorities.sort((a, b) => b.priority - a.priority);
    return regionPriorities[0].region;
  }
  
  // Fallback to primary region or global
  return primaryRegion === 'global' ? 'global' : primaryRegion;
}

/**
 * Export all government tech actions
 */
export const GOVERNMENT_TECH_ACTIONS = [
  DEPLOY_NATIONAL_TECHNOLOGY_ACTION,
];


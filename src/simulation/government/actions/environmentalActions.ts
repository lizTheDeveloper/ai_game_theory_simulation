/**
 * Environmental Protection government actions
 *
 * Actions for planetary boundaries and ecosystem crises including:
 * - Emergency Amazon rainforest protection
 * - Coral reef restoration
 * - Pesticide bans (pollinators)
 * - Environmental tech deployment acceleration
 *
 * Research foundation:
 * - IPBES (2019): Global Assessment on Biodiversity
 * - Amazon Tipping Point Study (Lovejoy & Nobre, 2018)
 * - Coral Reef Restoration Science (NOAA, 2024)
 * - Pollinator Crisis Research (IPBES, 2016)
 */

import { GameState } from '@/types/game';
import { ActionResult } from '@/simulation/agents/types';
import { CategorizedGovernmentAction } from '../core/types';

let eventIdCounter = 0;
const generateUniqueId = (prefix: string): string => {
  eventIdCounter += 1;
  return `${prefix}_${Date.now()}_${eventIdCounter}`;
};

/**
 * Emergency Amazon Rainforest Protection
 * Deploy immediate deforestation halt and restoration funding
 */
const emergencyAmazonProtection: CategorizedGovernmentAction = {
  id: 'emergency_amazon_protection',
  name: '🚨 Emergency Amazon Rainforest Protection',
  description: 'Deploy immediate deforestation halt, restoration funding',
  agentType: 'government',
  category: 'environmental',
  energyCost: 5,

  canExecute: (state: GameState): boolean => {
    if (!state.specificTippingPoints?.amazon) return false;
    const amazon = state.specificTippingPoints.amazon;
    // Trigger when near threshold (23%) but not yet crossed (25%)
    return amazon.deforestation > 23 && !amazon.triggered && state.government.resources > 5;
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    const amazon = state.specificTippingPoints.amazon;

    // Reduce deforestation rate significantly
    // This will be applied in updateAmazonRainforest()
    // Store government intervention flag
    if (!state.government.environmentalInterventions) {
      state.government.environmentalInterventions = {};
    }
    state.government.environmentalInterventions.amazonProtection = {
      active: true,
      activatedMonth: state.currentMonth,
      deforestationReduction: 0.5, // 50% reduction in deforestation rate
    };

    // Cost
    state.government.resources -= 5;
    state.government.legitimacy = Math.min(1.0, state.government.legitimacy + 0.05);

    return {
      success: true,
      effects: { amazonProtection: 0.5 },
      events: [{
        type: 'policy',
        month: state.currentMonth,
        title: 'Emergency Amazon Protection',
        description: `Government deployed emergency protection: deforestation moratorium, $50B restoration funding. Amazon at ${amazon.deforestation.toFixed(1)}% deforested.`,
        effects: { deforestation: -0.5 }
      }],
      message: `Emergency Amazon protection deployed (deforestation: ${amazon.deforestation.toFixed(1)}%)`
    };
  }
};

/**
 * Fund Coral Reef Restoration Programs
 * Large-scale coral nurseries and ocean alkalinity enhancement
 */
const fundCoralRestoration: CategorizedGovernmentAction = {
  id: 'fund_coral_restoration',
  name: '🪸 Fund Coral Reef Restoration Programs',
  description: 'Large-scale coral nurseries, ocean alkalinity enhancement',
  agentType: 'government',
  category: 'environmental',
  energyCost: 3,

  canExecute: (state: GameState): boolean => {
    if (!state.specificTippingPoints?.coral) return false;
    const coral = state.specificTippingPoints.coral;
    // Trigger when coral health drops below 50%
    return coral.healthPercentage < 50 && state.government.resources > 3;
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    const coral = state.specificTippingPoints.coral;

    // Fund coral restoration
    if (!state.government.environmentalInterventions) {
      state.government.environmentalInterventions = {};
    }
    state.government.environmentalInterventions.coralRestoration = {
      active: true,
      activatedMonth: state.currentMonth,
      restorationBoost: 0.3, // 0.3%/month boost to coral health
    };

    // Cost
    state.government.resources -= 3;
    state.government.legitimacy = Math.min(1.0, state.government.legitimacy + 0.03);

    return {
      success: true,
      effects: { coralRestoration: 0.3 },
      events: [{
        type: 'policy',
        month: state.currentMonth,
        title: 'Coral Reef Restoration Funding',
        description: `Government funded large-scale coral restoration: nurseries, alkalinity enhancement. Coral health at ${coral.healthPercentage.toFixed(1)}%.`,
        effects: { coralHealth: 0.3 }
      }],
      message: `Coral restoration funded (health: ${coral.healthPercentage.toFixed(1)}%)`
    };
  }
};

/**
 * Ban Neonicotinoid Pesticides
 * Emergency ban on pollinator-killing chemicals
 */
const banHarmfulPesticides: CategorizedGovernmentAction = {
  id: 'ban_harmful_pesticides',
  name: '🦋 Ban Neonicotinoid Pesticides',
  description: 'Emergency ban on pollinator-killing chemicals',
  agentType: 'government',
  category: 'environmental',
  energyCost: 1,

  canExecute: (state: GameState): boolean => {
    if (!state.specificTippingPoints?.pollinators) return false;
    const pollinators = state.specificTippingPoints.pollinators;
    // Trigger when pollinators drop below 50%
    // Check we haven't already banned
    return pollinators.populationPercentage < 50 &&
           state.government.resources > 1 &&
           !state.government.environmentalInterventions?.pesticideBan;
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    const pollinators = state.specificTippingPoints.pollinators;

    // Ban harmful pesticides
    if (!state.government.environmentalInterventions) {
      state.government.environmentalInterventions = {};
    }
    state.government.environmentalInterventions.pesticideBan = {
      active: true,
      activatedMonth: state.currentMonth,
      pollinatorRecoveryBoost: 0.5, // 0.5%/month boost to pollinator recovery
    };

    // Boost biodiversity too
    state.environmentalAccumulation.biodiversityIndex = Math.min(1.0,
      state.environmentalAccumulation.biodiversityIndex + 0.02
    );

    // Cost (low - this is a ban, not a spending program)
    state.government.resources -= 1;
    state.government.legitimacy = Math.min(1.0, state.government.legitimacy + 0.04);

    return {
      success: true,
      effects: { pesticideBan: 0.5, biodiversity: 0.02 },
      events: [{
        type: 'policy',
        month: state.currentMonth,
        title: 'Neonicotinoid Pesticides Banned',
        description: `Government emergency ban on pollinator-killing chemicals. Pollinator population at ${pollinators.populationPercentage.toFixed(1)}%.`,
        effects: { pollinators: 0.5 }
      }],
      message: `Pesticides banned (pollinators: ${pollinators.populationPercentage.toFixed(1)}%)`
    };
  }
};

/**
 * Deploy Environmental Breakthrough Tech
 * Government funding to accelerate environmental tech deployment
 */
const deployEnvironmentalTech: CategorizedGovernmentAction = {
  id: 'deploy_environmental_tech',
  name: '🚀 Deploy Environmental Breakthrough Tech',
  description: 'Government funding to accelerate environmental tech deployment',
  agentType: 'government',
  category: 'environmental',
  energyCost: 10,

  canExecute: (state: GameState): boolean => {
    if (!state.breakthroughTech || state.government.resources < 10) return false;

    // Check if any environmental tech is unlocked but <50% deployed
    const envTechs = ['deExtinction', 'oceanAlkalinity', 'advancedDAC', 'ecosystemManagement'];
    const needsDeployment = envTechs.some(techKey => {
      const tech = state.breakthroughTech[techKey];
      return tech && tech.unlocked && tech.deploymentLevel < 0.5;
    });

    // Also check if ecosystem crisis is active
    const ecosystemCrisis = state.environmentalAccumulation?.ecosystemCrisisActive;

    return needsDeployment && ecosystemCrisis;
  },

  execute: (state: GameState, agentId?: string, random = Math.random): ActionResult => {
    // Set deployment funding boost
    if (!state.government.environmentalInterventions) {
      state.government.environmentalInterventions = {};
    }
    state.government.environmentalInterventions.techDeploymentFunding = {
      active: true,
      activatedMonth: state.currentMonth,
      durationMonths: 12, // 1 year of boosted funding
      deploymentMultiplier: 2.0, // 2x deployment speed
    };

    // Count how many techs will benefit
    const envTechs = ['deExtinction', 'oceanAlkalinity', 'advancedDAC', 'ecosystemManagement'];
    const benefitingTechs = envTechs.filter(techKey => {
      const tech = state.breakthroughTech[techKey];
      return tech && tech.unlocked && tech.deploymentLevel < 0.5;
    });

    // Cost
    state.government.resources -= 10;
    state.government.legitimacy = Math.min(1.0, state.government.legitimacy + 0.06);

    return {
      success: true,
      effects: { techDeployment: 2.0 },
      events: [{
        type: 'policy',
        month: state.currentMonth,
        title: 'Environmental Tech Deployment Funding',
        description: `Government allocated $100B to accelerate environmental tech deployment. Boosting ${benefitingTechs.length} technologies for 12 months.`,
        effects: { deploymentSpeed: 2.0 }
      }],
      message: `Environmental tech deployment funded (${benefitingTechs.length} techs accelerated)`
    };
  }
};

/**
 * All environmental actions
 */
export const environmentalActions: CategorizedGovernmentAction[] = [
  emergencyAmazonProtection,
  fundCoralRestoration,
  banHarmfulPesticides,
  deployEnvironmentalTech
];

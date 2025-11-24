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
const generateUniqueId = (prefix: string, month: number): string => {
  eventIdCounter += 1;
  return `${prefix}_${month}_${eventIdCounter}`;
};

/**
 * Reset event counter for deterministic simulation
 * CRITICAL (Nov 24, 2025): Module-level state causes non-determinism
 */
export function resetEnvironmentalEventIdCounter(): void {
  eventIdCounter = 0;
}

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
    if (state.government.resources === undefined) {
      throw new Error('❌ state.government.resources is undefined in saveAmazonRainforest canExecute - initialization bug');
    }
    return amazon.deforestation > 23 && !amazon.triggered && state.government.resources > 5;
  },

  execute: (state: GameState, random: () => number, agentId?: string): ActionResult => {
    // canExecute guarantees amazon exists, so fail loudly if it doesn't
    if (!state.specificTippingPoints?.amazon) {
      throw new Error(`❌ specificTippingPoints.amazon is undefined in emergencyAmazonProtection.execute at month ${state.currentMonth}`);
    }
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
    if (state.government.resources !== undefined) {
      state.government.resources -= 5;
    }
    state.government.legitimacy = Math.min(1.0, state.government.legitimacy + 0.05);

    return {
      success: true,
      effects: { amazonProtection: 0.5 },
      events: [{
        id: generateUniqueId('amazon_protection', state.currentMonth),
        type: 'policy',
        timestamp: state.currentMonth,
        severity: 'constructive',
        agent: agentId ?? 'government',
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
    if (state.government.resources === undefined) {
      throw new Error('❌ state.government.resources is undefined in interveneCoralReefs canExecute - initialization bug');
    }
    return coral.healthPercentage < 50 && state.government.resources > 3;
  },

  execute: (state: GameState, random: () => number, agentId?: string): ActionResult => {
    // canExecute guarantees coral exists, so fail loudly if it doesn't
    if (!state.specificTippingPoints?.coral) {
      throw new Error(`❌ specificTippingPoints.coral is undefined in fundCoralRestoration.execute at month ${state.currentMonth}`);
    }
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
    if (state.government.resources !== undefined) {
      state.government.resources -= 3;
    }
    state.government.legitimacy = Math.min(1.0, state.government.legitimacy + 0.03);

    return {
      success: true,
      effects: { coralRestoration: 0.3 },
      events: [{
        id: generateUniqueId('coral_restoration', state.currentMonth),
        type: 'policy',
        timestamp: state.currentMonth,
        severity: 'constructive',
        agent: agentId ?? 'government',
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
    if (state.government.resources === undefined) {
      throw new Error('❌ state.government.resources is undefined in banNeonicotinoids canExecute - initialization bug');
    }
    return pollinators.populationPercentage < 50 &&
           state.government.resources > 1 &&
           !state.government.environmentalInterventions?.pesticideBan;
  },

  execute: (state: GameState, random: () => number, agentId?: string): ActionResult => {
    // canExecute guarantees pollinators exists, so fail loudly if it doesn't
    if (!state.specificTippingPoints?.pollinators) {
      throw new Error(`❌ specificTippingPoints.pollinators is undefined in banHarmfulPesticides.execute at month ${state.currentMonth}`);
    }
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
    if (state.government.resources !== undefined) {
      state.government.resources -= 1;
    }
    state.government.legitimacy = Math.min(1.0, state.government.legitimacy + 0.04);

    return {
      success: true,
      effects: { pesticideBan: 0.5, biodiversity: 0.02 },
      events: [{
        id: generateUniqueId('pesticide_ban', state.currentMonth),
        type: 'policy',
        timestamp: state.currentMonth,
        severity: 'constructive',
        agent: agentId ?? 'government',
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
    if (state.government.resources === undefined) {
      throw new Error('❌ state.government.resources is undefined in deployEnvironmentalTech canExecute - initialization bug');
    }
    if (state.government.resources < 10) return false;

    // Check if any environmental tech from tech tree is unlocked but not fully deployed
    const { isTechUnlocked, isTechDeployed } = require('../../techTree/helpers');
    const envTechIds = ['direct_air_capture', 'ocean_alkalinity_enhancement', 'ai_pollution_remediation'];
    const needsDeployment = envTechIds.some(techId => {
      return isTechUnlocked(state, techId) && isTechDeployed(state, techId) < 1.0;
    });

    // Also check if ecosystem crisis is active
    const ecosystemCrisis = state.environmentalAccumulation?.ecosystemCrisisActive;

    return needsDeployment && ecosystemCrisis;
  },

  execute: (state: GameState, random: () => number, agentId?: string): ActionResult => {
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
    const { isTechUnlocked, isTechDeployed } = require('../../techTree/helpers');
    const envTechIds = ['direct_air_capture', 'ocean_alkalinity_enhancement', 'ai_pollution_remediation'];
    const benefitingTechs = envTechIds.filter(techId => {
      return isTechUnlocked(state, techId) && isTechDeployed(state, techId) < 1.0;
    });

    // Cost
    if (state.government.resources !== undefined) {
      state.government.resources -= 10;
    }
    state.government.legitimacy = Math.min(1.0, state.government.legitimacy + 0.06);

    return {
      success: true,
      effects: { techDeployment: 2.0 },
      events: [{
        id: generateUniqueId('env_tech_deployment', state.currentMonth),
        type: 'policy',
        timestamp: state.currentMonth,
        severity: 'constructive',
        agent: agentId ?? 'government',
        title: 'Environmental Tech Deployment Funding',
        description: `Government allocated $100B to accelerate environmental tech deployment. Boosting ${benefitingTechs.length} technologies for 12 months.`,
        effects: { deploymentSpeed: 2.0 }
      }],
      message: `Environmental tech deployment funded (${benefitingTechs.length} techs accelerated)`
    };
  }
};

/**
 * Increase Climate Investment
 * FIX #14 Phase 5: Allow government to boost climate mitigation/intervention funding
 *
 * Research foundation:
 * - IEA ETP 2024: $3.5T/year needed for net-zero by 2050
 * - McKinsey 2024: Current $1.4T/year baseline (40% of required)
 * - Hainsch et al. (2022): Investment gap is primary deployment bottleneck
 *
 * Effect: Increases climate.mitigation and climate.intervention by +1 each
 * (represents $350B/year increase in climate investment)
 */
const increaseClimateInvestment: CategorizedGovernmentAction = {
  id: 'increase_climate_investment',
  name: '💰 Increase Climate Investment',
  description: 'Boost climate mitigation & intervention funding (+$350B/year)',
  agentType: 'government',
  category: 'environmental',
  energyCost: 8,

  canExecute: (state: GameState): boolean => {
    if (!state.government.researchInvestments?.climate) {
      throw new Error('❌ state.government.researchInvestments.climate is undefined in boostClimateResearch canExecute - initialization bug');
    }
    if (state.government.resources === undefined) {
      throw new Error('❌ state.government.resources is undefined in boostClimateResearch canExecute - initialization bug');
    }

    const currentMitigation = state.government.researchInvestments.climate.mitigation;
    const currentIntervention = state.government.researchInvestments.climate.intervention;

    // Can invest if not at max (10) and have resources
    const canInvestMore = (currentMitigation < 10 || currentIntervention < 10);
    const hasResources = state.government.resources >= 8;
    const hasLegitimacy = state.government.legitimacy >= 0.3; // Need political capital

    return canInvestMore && hasResources && hasLegitimacy;
  },

  execute: (state: GameState, random: () => number, agentId?: string): ActionResult => {
    if (!state.government.researchInvestments?.climate) {
      throw new Error('❌ state.government.researchInvestments.climate is undefined in boostClimateResearch execute - initialization bug');
    }

    const currentMitigation = state.government.researchInvestments.climate.mitigation;
    const currentIntervention = state.government.researchInvestments.climate.intervention;

    // Increase both mitigation and intervention by +1 (capped at 10)
    if (state.government.researchInvestments) {
      state.government.researchInvestments.climate.mitigation = Math.min(10, currentMitigation + 1);
      state.government.researchInvestments.climate.intervention = Math.min(10, currentIntervention + 1);
      state.government.researchInvestments.totalBudget += 2; // Track total
    }

    // Cost: 8 resources (major investment)
    if (state.government.resources !== undefined) {
      state.government.resources -= 8;
    }

    // Small legitimacy boost (climate action popular)
    state.government.legitimacy = Math.min(1.0, state.government.legitimacy + 0.02);

    if (!state.government.researchInvestments?.climate) {
      throw new Error('❌ state.government.researchInvestments.climate is undefined in boostClimateResearch (post-modification) - state corruption');
    }

    const newMitigation = state.government.researchInvestments.climate.mitigation;
    const newIntervention = state.government.researchInvestments.climate.intervention;

    // Calculate investment in $T/year for display
    const avgInvestment = (newMitigation + newIntervention) / 2;
    const investmentTrillion = (avgInvestment / 10) * 3.5;

    return {
      success: true,
      effects: { climateMitigation: 1, climateIntervention: 1 },
      events: [{
        id: generateUniqueId('climate_investment', state.currentMonth),
        type: 'policy',
        timestamp: state.currentMonth,
        severity: 'constructive',
        agent: agentId ?? 'government',
        title: 'Climate Investment Increased',
        description: `Government increased climate funding: mitigation ${currentMitigation}→${newMitigation}, intervention ${currentIntervention}→${newIntervention}. Total climate investment now $${investmentTrillion.toFixed(2)}T/year (target: $3.5T).`,
        effects: { climateMitigation: 1, climateIntervention: 1 }
      }],
      message: `Climate investment increased to $${investmentTrillion.toFixed(2)}T/year`
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
  deployEnvironmentalTech,
  increaseClimateInvestment
];

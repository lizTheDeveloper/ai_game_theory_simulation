/**
 * Breakthrough Technology System
 * 
 * Manages research, unlocking, and deployment of transformative technologies
 * that can prevent or reverse crises and enable sustainable abundance.
 */

import { GameState } from '../types/game';
import { TechnologyNode, BreakthroughTechState, TechnologyEffects } from '../types/technologies';

/**
 * Initialize breakthrough technology state
 */
export function initializeBreakthroughTech(): BreakthroughTechState {
  return {
    // Environmental Technologies (ordered by dependency)
    cleanEnergy: createCleanEnergyTech(),
    advancedRecycling: createAdvancedRecyclingTech(),
    ecosystemManagement: createEcosystemManagementTech(),
    carbonCapture: createCarbonCaptureTech(),
    sustainableAgriculture: createSustainableAgricultureTech(),
    
    // Social Technologies
    mentalHealthAI: createMentalHealthAITech(),
    purposeFrameworks: createPurposeFrameworksTech(),
    communityPlatforms: createCommunityPlatformsTech(),
    interspeciesComm: createInterspeciesCommTech(),
    
    // Medical Technologies
    diseaseElimination: createDiseaseEliminationTech(),
    longevityTherapies: createLongevityTherapiesTech(),
    
    // Infrastructure (advanced)
    fusionPower: createFusionPowerTech(),
    
    // Research priorities
    researchPriorities: {
      environmental: 0.4,
      social: 0.3,
      medical: 0.3,
    },
  };
}

/**
 * Update technology research and check for breakthroughs
 */
export function updateBreakthroughTechnologies(state: GameState, month: number): void {
  const tech = state.breakthroughTech;
  
  // Debug: Log tech system activity (disabled for production)
  // if (month <= 2) {
  //   console.error(`\n🔬 BREAKTHROUGH TECH - Month ${month}, Budget: $${state.government.researchInvestments.totalBudget}B`);
  // }
  
  // TEMP: Auto-allocate research budget if government hasn't (for testing)
  autoAllocateResearchBudget(state, month);
  
  // Get research investment from government AND private organizations
  const research = state.government.researchInvestments;
  const privateResearch = calculatePrivateResearchContributions(state);
  
  // Calculate budgets for each category from relevant research domains
  const environmentalBudget = 
    research.climate.mitigation + 
    research.climate.intervention +
    research.materials.energySystems +
    (research.physical * 0.3) + // Some physical research helps environment
    privateResearch.environmental;
  
  const socialBudget = 
    research.social +
    research.biotech.neuroscience * 0.5 + // Mental health
    (research.cognitive * 0.2) + // Understanding helps adaptation
    privateResearch.social;
  
  const medicalBudget = 
    research.biotech.drugDiscovery +
    research.biotech.geneEditing * 0.3 +
    research.biotech.neuroscience * 0.5 +
    privateResearch.medical;
  
  // Process each technology category
  updateEnvironmentalTech(state, environmentalBudget, month);
  updateSocialTech(state, socialBudget, month);
  updateMedicalTech(state, medicalBudget, month);
  
  // Apply effects of deployed technologies
  applyTechnologyEffects(state);
}

/**
 * Update environmental technologies
 */
function updateEnvironmentalTech(state: GameState, budget: number, month: number): void {
  const tech = state.breakthroughTech;
  const avgCapability = calculateAverageCapability(state);
  
  // Clean Energy - foundational tech
  updateTechProgress(state, tech.cleanEnergy, budget * 0.3, avgCapability, month);
  
  // Advanced Recycling - parallel to clean energy
  updateTechProgress(state, tech.advancedRecycling, budget * 0.25, avgCapability, month);
  
  // Carbon Capture - requires clean energy
  if (tech.cleanEnergy.unlocked) {
    updateTechProgress(state, tech.carbonCapture, budget * 0.2, avgCapability, month);
  }
  
  // Ecosystem Management - advanced, requires multiple prereqs
  if (tech.cleanEnergy.unlocked && tech.advancedRecycling.unlocked) {
    updateTechProgress(state, tech.ecosystemManagement, budget * 0.15, avgCapability, month);
  }
  
  // Sustainable Agriculture
  updateTechProgress(state, tech.sustainableAgriculture, budget * 0.1, avgCapability, month);
}

/**
 * Update social technologies
 */
function updateSocialTech(state: GameState, budget: number, month: number): void {
  const tech = state.breakthroughTech;
  const avgCapability = calculateAverageCapability(state);
  
  // Mental Health AI - foundational
  updateTechProgress(state, tech.mentalHealthAI, budget * 0.35, avgCapability, month);
  
  // Purpose Frameworks - parallel
  updateTechProgress(state, tech.purposeFrameworks, budget * 0.30, avgCapability, month);
  
  // Community Platforms
  updateTechProgress(state, tech.communityPlatforms, budget * 0.20, avgCapability, month);
  
  // Interspecies Communication - parallel (NEW!)
  updateTechProgress(state, tech.interspeciesComm, budget * 0.15, avgCapability, month);
}

/**
 * Update medical technologies
 */
function updateMedicalTech(state: GameState, budget: number, month: number): void {
  const tech = state.breakthroughTech;
  const avgCapability = calculateAverageCapability(state);
  
  // Disease Elimination - foundational
  updateTechProgress(state, tech.diseaseElimination, budget * 0.6, avgCapability, month);
  
  // Longevity Therapies - requires disease elimination
  if (tech.diseaseElimination.unlocked) {
    updateTechProgress(state, tech.longevityTherapies, budget * 0.4, avgCapability, month);
  }
}

/**
 * Update a single technology's research progress
 */
function updateTechProgress(
  state: GameState,
  tech: TechnologyNode,
  budget: number,
  avgCapability: number,
  month: number
): void {
  // Already unlocked?
  if (tech.unlocked) {
    // Increase deployment if budget available
    if (budget > 0 && tech.deploymentLevel < 1.0) {
      // Base deployment rate: $5B for 5% deployment
      let deploymentRate = budget / 5;
      
      // AI ACCELERATION: Higher AI capability → faster deployment
      // AI helps with logistics, coordination, distribution, education
      // "Fastest adopted tech ever because it actively helps you adopt it"
      const aiDeploymentMultiplier = 1 + Math.log(1 + avgCapability) * 0.5;
      deploymentRate *= aiDeploymentMultiplier;
      
      // GOVERNANCE COORDINATION: Institutional capacity helps deployment
      const govQuality = state.government.governanceQuality;
      const coordinationBonus = 0.5 + (govQuality?.institutionalCapacity || 0.5) * 0.5;
      deploymentRate *= coordinationBonus;
      
      // EMERGENCY DEPLOYMENT: Scale faster during relevant crises
      const crisisUrgency = getCrisisUrgency(state, tech.category, tech.id);
      if (crisisUrgency > 0) {
        deploymentRate *= (1 + crisisUrgency * 2); // Up to 3x faster during severe crises
        
        // Log emergency deployment
        if (month % 12 === 0 && crisisUrgency > 0.5) {
          console.log(`⚡ EMERGENCY DEPLOYMENT: ${tech.name} scaling ${(crisisUrgency * 2 + 1).toFixed(1)}x faster (crisis urgency: ${(crisisUrgency * 100).toFixed(0)}%)`);
        }
      }
      
      const deploymentIncrease = Math.min(0.20, deploymentRate); // Cap at 20%/month (up from 15%)
      tech.deploymentLevel = Math.min(1.0, tech.deploymentLevel + deploymentIncrease);
      
      // Log significant deployment progress with year/month
      const years = Math.floor(month / 12);
      const months = month % 12;
      const timeDisplay = years > 0 ? `Year ${years}, Month ${months + 1}` : `Month ${months + 1}`;
      
      if (tech.deploymentLevel >= 0.5 && tech.deploymentLevel - deploymentIncrease < 0.5) {
        console.log(`📈 ${tech.name} reached 50% deployment (${timeDisplay})`);
      }
      if (tech.deploymentLevel >= 1.0 && tech.deploymentLevel - deploymentIncrease < 1.0) {
        console.log(`✅ ${tech.name} fully deployed (${timeDisplay})`);
      }
    }
    return;
  }
  
  // Debug requirements check (disabled for production)
  // if (tech.id === 'cleanEnergy' && (month === 1 || month === 10)) {
  //   const econ = state.globalMetrics.economicTransitionStage || 0;
  //   console.log(`\n🔍 Clean Energy Requirements Check (Month ${month}):`);
  //   console.log(`  avgCapability: ${avgCapability.toFixed(2)} >= ${tech.requirements.minAICapability}`);
  //   console.log(`  economicStage: ${econ.toFixed(2)} >= ${tech.requirements.minEconomicStage}`);
  //   console.log(`  budget: $${budget.toFixed(1)}B >= $${(tech.monthlyResearchCost * 0.1).toFixed(2)}B`);
  // }
  
  // Check basic requirements
  if (avgCapability < tech.requirements.minAICapability) return;
  const economicStage = state.globalMetrics.economicTransitionStage || 0;
  if (economicStage < tech.requirements.minEconomicStage) return;
  
  // Check prerequisite techs
  for (const prereqId of tech.requirements.prerequisiteTechs) {
    const prereq = getTechById(state.breakthroughTech, prereqId);
    if (!prereq?.unlocked) return;
  }
  
  // Check if blocked by crises
  if (tech.requirements.blockedByCrises) {
    for (const crisisType of tech.requirements.blockedByCrises) {
      if (isCrisisActive(state, crisisType)) {
        console.log(`🚫 ${tech.name} research blocked by ${crisisType} crisis (Month ${month})`);
        return;
      }
    }
  }
  
  // No budget? No progress
  if (budget < tech.monthlyResearchCost * 0.1) return; // Need at least 10% of required budget
  
  // Calculate progress this month
  const budgetRatio = Math.min(1.0, budget / tech.monthlyResearchCost);
  const capabilityBonus = Math.max(1.0, avgCapability / tech.requirements.minAICapability);
  
  // AUTHORITARIAN PENALTY: Certain techs are harder for authoritarian regimes
  const govPenalty = getGovernmentTypePenalty(state, tech.id, tech.category);
  
  // GOVERNANCE QUALITY BONUS: Good governance accelerates research
  const { getPolicyEffectivenessMultiplier } = require('./governanceQuality');
  const policyEffectiveness = getPolicyEffectivenessMultiplier(state);
  
  const progressThisMonth = (1.0 / tech.monthsToUnlock) * budgetRatio * capabilityBonus * govPenalty * policyEffectiveness;
  
  tech.researchProgress = Math.min(1.0, tech.researchProgress + progressThisMonth);
  
  // Breakthrough achieved!
  if (tech.researchProgress >= 1.0 && !tech.unlocked) {
    tech.unlocked = true;
    tech.deploymentLevel = 0.1; // Start at 10% deployment
    
    const years = Math.floor(month / 12);
    const months = month % 12;
    const yearDisplay = years > 0 ? `Year ${years}, ` : '';
    console.log(`\n🚀🚀🚀 BREAKTHROUGH ACHIEVED: ${tech.name} (${yearDisplay}Month ${months + 1})`);
    console.log(`    Category: ${tech.category}`);
    console.log(`    Initial deployment: 10%`);
    
    // Log to event system
    state.eventLog.push({
      month,
      type: 'breakthrough',
      description: `${tech.name} breakthrough achieved`,
      severity: 'major',
      details: {
        technology: tech.id,
        category: tech.category,
      },
    });
    
    // Trust boost from breakthrough
    if (tech.effects.trustBoost) {
      state.globalMetrics.publicTrust = Math.min(1.0, 
        state.globalMetrics.publicTrust + tech.effects.trustBoost
      );
    }
  }
}

/**
 * Apply effects of all deployed technologies
 */
function applyTechnologyEffects(state: GameState): void {
  const tech = state.breakthroughTech;
  
  // Environmental effects
  applyTechEffects(state, tech.cleanEnergy);
  applyTechEffects(state, tech.advancedRecycling);
  applyTechEffects(state, tech.carbonCapture);
  applyTechEffects(state, tech.ecosystemManagement);
  applyTechEffects(state, tech.sustainableAgriculture);
  
  // Social effects
  applyTechEffects(state, tech.mentalHealthAI);
  applyTechEffects(state, tech.purposeFrameworks);
  applyTechEffects(state, tech.communityPlatforms);
  
  // Medical effects
  applyTechEffects(state, tech.diseaseElimination);
  applyTechEffects(state, tech.longevityTherapies);
  
  // Infrastructure
  applyTechEffects(state, tech.fusionPower);
}

/**
 * Apply a single technology's effects (scaled by deployment level)
 */
function applyTechEffects(state: GameState, tech: TechnologyNode): void {
  if (!tech.unlocked || tech.deploymentLevel <= 0) return;
  
  const scale = tech.deploymentLevel;
  const effects = tech.effects;
  const env = state.environmentalAccumulation;
  const social = state.socialAccumulation;
  
  // Environmental effects
  if (effects.biodiversityRecovery) {
    env.biodiversityIndex = Math.min(1.0, 
      env.biodiversityIndex + effects.biodiversityRecovery * scale
    );
  }
  
  if (effects.climateStabilization) {
    env.climateStability = Math.min(1.0,
      env.climateStability + effects.climateStabilization * scale
    );
  }
  
  if (effects.pollutionReduction) {
    env.pollutionLevel = Math.max(0,
      env.pollutionLevel + effects.pollutionReduction * scale // Note: reduction is negative
    );
  }
  
  if (effects.resourceEfficiency && scale > 0.5) {
    // Applied in environmental.ts resource depletion calculation
    // This just flags it's active
  }
  
  // Social effects
  if (effects.meaningCrisisReduction) {
    social.meaningCrisisLevel = Math.max(0,
      social.meaningCrisisLevel + effects.meaningCrisisReduction * scale
    );
  }
  
  if (effects.culturalAdaptation) {
    social.culturalAdaptation = Math.min(1.0,
      social.culturalAdaptation + effects.culturalAdaptation * scale
    );
  }
  
  if (effects.communityStrengthBoost) {
    social.socialCohesion = Math.min(1.0,
      social.socialCohesion + effects.communityStrengthBoost * scale
    );
  }
  
  // QoL effects are applied in the QoL calculation
  // We just track that they're active here
}

/**
 * Check if technologies can resolve crises
 */
export function checkCrisisResolution(state: GameState, month: number): void {
  const env = state.environmentalAccumulation;
  const social = state.socialAccumulation;
  const tech = state.breakthroughTech;
  
  // Pollution crisis resolution - easier with clean energy deployed
  if (env.pollutionCrisisActive) {
    const cleanEnergyHelp = tech.cleanEnergy.unlocked && (tech.cleanEnergy?.deploymentLevel ?? 0) > 0.3;
    const threshold = cleanEnergyHelp ? 0.6 : 0.5; // Higher threshold with tech help
    
    if (env.pollutionLevel < threshold) {
      env.pollutionCrisisActive = false;
      console.log(`\n✅✅✅ POLLUTION CRISIS RESOLVED (Month ${month})`);
      console.log(`    ${cleanEnergyHelp ? 'Clean energy technology' : 'Reduced emissions'} reversed environmental damage!`);
      
      state.eventLog.push({
        month,
        type: 'crisis_resolved',
        description: `Pollution crisis resolved${cleanEnergyHelp ? ' through clean energy deployment' : ''}`,
        severity: 'major',
      });
    }
  }
  
  // Climate catastrophe resolution - requires sustained effort
  if (env.climateCatastropheActive) {
    const carbonCaptureHelp = tech.carbonCapture.unlocked && (tech.carbonCapture?.deploymentLevel ?? 0) > 0.5;
    const cleanEnergyHelp = tech.cleanEnergy.unlocked && (tech.cleanEnergy?.deploymentLevel ?? 0) > 0.7;
    const threshold = (carbonCaptureHelp && cleanEnergyHelp) ? 0.6 : 0.7;

    if (env.climateStability > threshold) {
      env.climateCatastropheActive = false;
      console.log(`\n✅✅✅ CLIMATE CATASTROPHE AVERTED (Month ${month})`);
      console.log(`    Massive technology deployment stabilized climate!`);
      console.log(`    Clean Energy: ${((tech.cleanEnergy?.deploymentLevel ?? 0) * 100).toFixed(0)}%, Carbon Capture: ${((tech.carbonCapture?.deploymentLevel ?? 0) * 100).toFixed(0)}%`);
      
      state.eventLog.push({
        month,
        type: 'crisis_resolved',
        description: 'Climate catastrophe averted through breakthrough technologies',
        severity: 'major',
      });
    }
  }
  
  // Ecosystem collapse resolution - requires ecosystem management AI
  if (env.ecosystemCollapseActive) {
    const ecosystemAIHelp = tech.ecosystemManagement.unlocked && (tech.ecosystemManagement?.deploymentLevel ?? 0) > 0.4;
    const threshold = ecosystemAIHelp ? 0.5 : 0.6;
    
    if (env.biodiversityIndex > threshold) {
      env.ecosystemCollapseActive = false;
      console.log(`\n✅✅✅ ECOSYSTEM COLLAPSE REVERSED (Month ${month})`);
      console.log(`    ${ecosystemAIHelp ? 'AI-managed ecosystem restoration' : 'Natural recovery'} successful!`);
      
      state.eventLog.push({
        month,
        type: 'crisis_resolved',
        description: `Ecosystem collapse reversed${ecosystemAIHelp ? ' through AI ecosystem management' : ''}`,
        severity: 'major',
      });
    }
  }
  
  // Meaning crisis resolution - requires social tech
  if (social.meaningCollapseActive) {
    const mentalHealthHelp = tech.mentalHealthAI.unlocked && (tech.mentalHealthAI?.deploymentLevel ?? 0) > 0.3;
    const purposeHelp = tech.purposeFrameworks.unlocked && (tech.purposeFrameworks?.deploymentLevel ?? 0) > 0.3;
    const threshold = (mentalHealthHelp && purposeHelp) ? 0.6 : 0.5;

    if (social.meaningCrisisLevel < threshold) {
      social.meaningCollapseActive = false;
      console.log(`\n✅✅✅ MEANING CRISIS RESOLVED (Month ${month})`);
      console.log(`    Society adapted to post-work world!`);
      if (mentalHealthHelp || purposeHelp) {
        console.log(`    Tech assist: Mental Health AI: ${((tech.mentalHealthAI?.deploymentLevel ?? 0) * 100).toFixed(0)}%, Purpose Frameworks: ${((tech.purposeFrameworks?.deploymentLevel ?? 0) * 100).toFixed(0)}%`);
      }
      
      state.eventLog.push({
        month,
        type: 'crisis_resolved',
        description: `Meaning crisis resolved${(mentalHealthHelp || purposeHelp) ? ' through social technologies' : ''}`,
        severity: 'major',
      });
    }
  }
  
  // Resource crisis resolution - easier with recycling/efficiency
  if (env.resourceCrisisActive) {
    const recyclingHelp = tech.advancedRecycling.unlocked && (tech.advancedRecycling?.deploymentLevel ?? 0) > 0.5;
    const threshold = recyclingHelp ? 0.35 : 0.30;
    
    if (env.resourceReserves > threshold) {
      env.resourceCrisisActive = false;
      console.log(`\n✅✅✅ RESOURCE CRISIS RESOLVED (Month ${month})`);
      console.log(`    ${recyclingHelp ? 'Circular economy technologies' : 'Resource management'} restored reserves!`);
      
      state.eventLog.push({
        month,
        type: 'crisis_resolved',
        description: `Resource crisis resolved${recyclingHelp ? ' through circular economy' : ''}`,
        severity: 'major',
      });
    }
  }
}

/**
 * Get technology effects for QoL calculation
 */
export function getTechnologyQoLBoosts(state: GameState): {
  mentalHealth: number;
  healthcare: number;
  environmental: number;
} {
  const tech = state.breakthroughTech;
  
  let mentalHealth = 0;
  let healthcare = 0;
  let environmental = 0;
  
  // Mental health techs
  if (tech.mentalHealthAI.unlocked) {
    mentalHealth += (tech.mentalHealthAI.effects.mentalHealthBoost || 0) * (tech.mentalHealthAI?.deploymentLevel ?? 0);
  }
  if (tech.purposeFrameworks.unlocked) {
    mentalHealth += (tech.purposeFrameworks.effects.mentalHealthBoost || 0) * (tech.purposeFrameworks?.deploymentLevel ?? 0);
  }

  // Healthcare techs
  if (tech.diseaseElimination.unlocked) {
    healthcare += (tech.diseaseElimination.effects.healthcareBoost || 0) * (tech.diseaseElimination?.deploymentLevel ?? 0);
  }
  if (tech.longevityTherapies.unlocked) {
    healthcare += (tech.longevityTherapies.effects.healthcareBoost || 0) * (tech.longevityTherapies?.deploymentLevel ?? 0);
  }

  // Environmental techs improve environmental QoL
  if (tech.ecosystemManagement.unlocked) {
    environmental += 0.1 * (tech.ecosystemManagement?.deploymentLevel ?? 0);
  }
  if (tech.cleanEnergy.unlocked) {
    environmental += 0.05 * (tech.cleanEnergy?.deploymentLevel ?? 0);
  }
  
  return { mentalHealth, healthcare, environmental };
}

/**
 * Get resource efficiency multiplier from technologies
 */
export function getResourceEfficiencyMultiplier(state: GameState): number {
  const tech = state.breakthroughTech;
  let efficiency = 1.0;
  
  // Advanced recycling
  if (tech.advancedRecycling.unlocked && (tech.advancedRecycling?.deploymentLevel ?? 0) > 0.5) {
    efficiency *= (tech.advancedRecycling.effects.resourceEfficiency || 1.0);
  }

  // Sustainable agriculture
  if (tech.sustainableAgriculture.unlocked && (tech.sustainableAgriculture?.deploymentLevel ?? 0) > 0.5) {
    efficiency *= 0.85; // 15% more efficient
  }
  
  return efficiency;
}

// ============================================================================
// Technology Definitions
// ============================================================================

function createCleanEnergyTech(): TechnologyNode {
  return {
    id: 'cleanEnergy',
    name: 'Clean Energy Systems',
    category: 'environmental',
    unlocked: false,
    researchProgress: 0,
    deploymentLevel: 0,
    requirements: {
      minAICapability: 0.5, // Requires basic AI assistance
      minEconomicStage: 0, // Can start immediately
      requiredInvestment: 20,
      prerequisiteTechs: [],
      blockedByCrises: [], // Can research even during crisis
    },
    monthlyResearchCost: 2.0,
    monthsToUnlock: 24, // 2 years with full funding
    effects: {
      pollutionReduction: -0.015, // Reduces pollution 1.5% per month at full deployment
      climateStabilization: 0.01, // Improves climate 1% per month
      energyAbundanceBoost: 0.2, // 20% more energy available
    },
  };
}

function createAdvancedRecyclingTech(): TechnologyNode {
  return {
    id: 'advancedRecycling',
    name: 'Advanced Recycling & Circular Economy',
    category: 'environmental',
    unlocked: false,
    researchProgress: 0,
    deploymentLevel: 0,
    requirements: {
      minAICapability: 1.3,
      minEconomicStage: 2,
      requiredInvestment: 15,
      prerequisiteTechs: [],
    },
    monthlyResearchCost: 1.5,
    monthsToUnlock: 18,
    effects: {
      resourceEfficiency: 0.7, // 30% reduction in resource depletion
      pollutionReduction: -0.008, // Less waste
    },
  };
}

function createCarbonCaptureTech(): TechnologyNode {
  return {
    id: 'carbonCapture',
    name: 'Carbon Capture & Sequestration',
    category: 'environmental',
    unlocked: false,
    researchProgress: 0,
    deploymentLevel: 0,
    requirements: {
      minAICapability: 1.8,
      minEconomicStage: 3,
      requiredInvestment: 30,
      prerequisiteTechs: ['cleanEnergy'],
    },
    monthlyResearchCost: 3.0,
    monthsToUnlock: 30,
    effects: {
      climateStabilization: 0.02, // Strong climate benefit
      pollutionReduction: -0.01,
    },
  };
}

function createEcosystemManagementTech(): TechnologyNode {
  return {
    id: 'ecosystemManagement',
    name: 'AI-Powered Ecosystem Management',
    category: 'environmental',
    unlocked: false,
    researchProgress: 0,
    deploymentLevel: 0,
    requirements: {
      minAICapability: 2.0,
      minEconomicStage: 3,
      requiredInvestment: 40,
      prerequisiteTechs: ['cleanEnergy', 'advancedRecycling'],
    },
    monthlyResearchCost: 4.0,
    monthsToUnlock: 36,
    effects: {
      biodiversityRecovery: 0.02, // Recovers 2% per month
      climateStabilization: 0.015,
      trustBoost: 0.05, // One-time trust boost when unlocked
    },
  };
}

function createSustainableAgricultureTech(): TechnologyNode {
  return {
    id: 'sustainableAgriculture',
    name: 'Sustainable Agriculture Systems',
    category: 'environmental',
    unlocked: false,
    researchProgress: 0,
    deploymentLevel: 0,
    requirements: {
      minAICapability: 1.4,
      minEconomicStage: 2,
      requiredInvestment: 12,
      prerequisiteTechs: [],
    },
    monthlyResearchCost: 1.2,
    monthsToUnlock: 15,
    effects: {
      biodiversityRecovery: 0.005,
      resourceEfficiency: 0.85,
    },
  };
}

function createMentalHealthAITech(): TechnologyNode {
  return {
    id: 'mentalHealthAI',
    name: 'AI-Assisted Mental Health',
    category: 'social',
    unlocked: false,
    researchProgress: 0,
    deploymentLevel: 0,
    requirements: {
      minAICapability: 1.6,
      minEconomicStage: 2,
      requiredInvestment: 15,
      prerequisiteTechs: [],
    },
    monthlyResearchCost: 1.5,
    monthsToUnlock: 20,
    effects: {
      meaningCrisisReduction: -0.015,
      mentalHealthBoost: 0.15, // Improves mental health QoL dimension
      communityStrengthBoost: 0.005,
    },
  };
}

function createPurposeFrameworksTech(): TechnologyNode {
  return {
    id: 'purposeFrameworks',
    name: 'Post-Work Purpose Frameworks',
    category: 'social',
    unlocked: false,
    researchProgress: 0,
    deploymentLevel: 0,
    requirements: {
      minAICapability: 1.5,
      minEconomicStage: 3, // Need post-work society
      requiredInvestment: 10,
      prerequisiteTechs: [],
    },
    monthlyResearchCost: 1.0,
    monthsToUnlock: 18,
    effects: {
      meaningCrisisReduction: -0.02,
      culturalAdaptation: 0.015,
      mentalHealthBoost: 0.1,
    },
  };
}

function createCommunityPlatformsTech(): TechnologyNode {
  return {
    id: 'communityPlatforms',
    name: 'AI-Enhanced Community Platforms',
    category: 'social',
    unlocked: false,
    researchProgress: 0,
    deploymentLevel: 0,
    requirements: {
      minAICapability: 1.4,
      minEconomicStage: 2,
      requiredInvestment: 8,
      prerequisiteTechs: [],
    },
    monthlyResearchCost: 0.8,
    monthsToUnlock: 12,
    effects: {
      communityStrengthBoost: 0.01,
      culturalAdaptation: 0.008,
      trustBoost: 0.03,
    },
  };
}

function createInterspeciesCommTech(): TechnologyNode {
  return {
    id: 'interspeciesComm',
    name: 'Interspecies Communication AI',
    category: 'social',
    unlocked: false,
    researchProgress: 0,
    deploymentLevel: 0,
    requirements: {
      minAICapability: 1.8,        // Need advanced NLP + pattern recognition
      minEconomicStage: 2,
      requiredInvestment: 12,       // Moderate investment (field research + AI)
      prerequisiteTechs: [],
    },
    monthlyResearchCost: 1.2,
    monthsToUnlock: 18,              // Moderate timeline (real projects started 2020)
    effects: {
      // MEANING & PURPOSE: Contact with other intelligent beings
      meaningCrisisReduction: -0.04,  // -4% per month at full deployment (profound impact!)
      purposeDiscovery: 0.02,          // New purpose: understanding non-human minds
      
      // COMMUNITY & BIOSPHERE: Expand circle of moral concern
      communityStrengthBoost: 0.008,   // Includes non-human beings in community
      biodiversityBoost: 0.015,        // Helps restoration (understand whale migration, octopus habitats)
      
      // ENVIRONMENTAL: Better ecosystem understanding
      ecosystemHealthBoost: 0.01,      // AI helps us understand ecosystem needs from animals' perspective
      
      // CULTURAL: Paradigm shift in human identity
      culturalAdaptation: 0.012,       // Forces us to adapt worldview
      creativityBoost: 0.015,          // Inspiring! Artists, philosophers, scientists energized
      
      // TRUST: Amazing beneficial tech, no risks
      trustBoost: 0.05,                // People LOVE this (everyone wanted to talk to dolphins!)
    },
  };
}

function createDiseaseEliminationTech(): TechnologyNode {
  return {
    id: 'diseaseElimination',
    name: 'AI-Driven Disease Elimination',
    category: 'medical',
    unlocked: false,
    researchProgress: 0,
    deploymentLevel: 0,
    requirements: {
      minAICapability: 1.7,
      minEconomicStage: 2,
      requiredInvestment: 25,
      prerequisiteTechs: [],
    },
    monthlyResearchCost: 2.5,
    monthsToUnlock: 30,
    effects: {
      healthcareBoost: 0.2,
      trustBoost: 0.08, // Major trust boost
    },
  };
}

function createLongevityTherapiesTech(): TechnologyNode {
  return {
    id: 'longevityTherapies',
    name: 'Longevity Extension Therapies',
    category: 'medical',
    unlocked: false,
    researchProgress: 0,
    deploymentLevel: 0,
    requirements: {
      minAICapability: 2.2,
      minEconomicStage: 3,
      requiredInvestment: 40,
      prerequisiteTechs: ['diseaseElimination'],
    },
    monthlyResearchCost: 4.0,
    monthsToUnlock: 42,
    effects: {
      healthcareBoost: 0.15,
      trustBoost: 0.05,
    },
  };
}

function createFusionPowerTech(): TechnologyNode {
  return {
    id: 'fusionPower',
    name: 'Commercial Fusion Power',
    category: 'infrastructure',
    unlocked: false,
    researchProgress: 0,
    deploymentLevel: 0,
    requirements: {
      minAICapability: 2.5,
      minEconomicStage: 3,
      requiredInvestment: 50,
      prerequisiteTechs: ['cleanEnergy'],
    },
    monthlyResearchCost: 5.0,
    monthsToUnlock: 48,
    effects: {
      pollutionReduction: -0.025,
      climateStabilization: 0.03,
      energyAbundanceBoost: 0.5,
    },
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate private organization research contributions
 * Safety-focused orgs contribute more to breakthrough tech
 */
function calculatePrivateResearchContributions(state: GameState): {
  environmental: number;
  social: number;
  medical: number;
} {
  let environmental = 0;
  let social = 0;
  let medical = 0;
  
  for (const org of state.organizations) {
    if (org.type !== 'private') continue;
    
    // Companies contribute based on profit and safety priorities
    // High safety focus → more breakthrough research
    // High profit focus → less public good research
    const safetyFocus = org.priorities.safetyResearch || 0.5;
    const profitFocus = org.priorities.profitMaximization || 0.7;
    
    // Monthly revenue scaled by priorities
    const researchBudget = org.monthlyRevenue * 0.1 * safetyFocus * (1 - profitFocus * 0.5);
    
    // Allocate across categories based on current crises
    if (state.environmentalAccumulation.ecosystemCollapseActive || 
        state.environmentalAccumulation.climateDisasterActive) {
      environmental += researchBudget * 0.5;
    } else {
      environmental += researchBudget * 0.3;
    }
    
    if (state.socialAccumulation.meaningCollapseActive ||
        state.socialAccumulation.socialUnrestActive) {
      social += researchBudget * 0.3;
    } else {
      social += researchBudget * 0.2;
    }
    
    medical += researchBudget * 0.2;
  }
  
  return { environmental, social, medical };
}

/**
 * Calculate crisis urgency for a SPECIFIC technology
 * Returns 0-1 based on whether this tech directly addresses an active crisis
 * 
 * This ensures emergency deployment only for crisis-relevant technologies
 */
function getCrisisUrgency(state: GameState, category: string, techId?: string): number {
  const env = state.environmentalAccumulation;
  const social = state.socialAccumulation;
  
  let urgency = 0;
  
  // Check tech-specific crisis urgency first (most precise)
  if (techId) {
    switch (techId) {
      case 'cleanEnergy':
        // Directly addresses pollution + climate
        if (env.pollutionCrisisActive) urgency += 0.4;
        if (env.climateCatastropheActive) urgency += 0.4;
        break;
        
      case 'carbonCapture':
        // Specifically for climate crisis
        if (env.climateCatastropheActive) urgency += 0.6;
        if (env.pollutionCrisisActive) urgency += 0.2;
        break;
        
      case 'ecosystemManagement':
        // Directly addresses ecosystem collapse
        if (env.ecosystemCollapseActive) urgency += 0.8;
        if (env.climateCatastropheActive) urgency += 0.2;
        break;
        
      case 'advancedRecycling':
        // Addresses resource crisis + some pollution
        if (env.resourceCrisisActive) urgency += 0.6;
        if (env.pollutionCrisisActive) urgency += 0.2;
        break;
        
      case 'sustainableAgriculture':
        // Addresses resource + ecosystem
        if (env.resourceCrisisActive) urgency += 0.3;
        if (env.ecosystemCollapseActive) urgency += 0.3;
        break;
        
      case 'mentalHealthAI':
        // Directly addresses meaning crisis
        if (social.meaningCollapseActive) urgency += 0.7;
        if (social.socialUnrestActive) urgency += 0.2;
        break;
        
      case 'purposeFrameworks':
        // Directly addresses meaning crisis
        if (social.meaningCollapseActive) urgency += 0.8;
        break;
        
      case 'communityPlatforms':
        // Addresses social cohesion
        if (social.socialUnrestActive) urgency += 0.5;
        if (social.institutionalFailureActive) urgency += 0.3;
        break;
        
      case 'diseaseElimination':
      case 'longevityTherapies':
        // Medical tech: no direct crisis but helps QoL during meaning crisis
        if (social.meaningCollapseActive) urgency += 0.2;
        break;
        
      case 'fusionPower':
        // Advanced clean energy
        if (env.climateCatastropheActive) urgency += 0.5;
        if (env.pollutionCrisisActive) urgency += 0.3;
        break;
    }
  }
  
  // Fallback to category-level urgency if tech-specific not found
  if (urgency === 0) {
    if (category === 'environmental') {
      // General environmental tech urgency
      if (env.ecosystemCollapseActive) urgency += 0.3;
      if (env.climateCatastropheActive) urgency += 0.3;
      if (env.pollutionCrisisActive) urgency += 0.2;
      if (env.resourceCrisisActive) urgency += 0.2;
    } else if (category === 'social') {
      // General social tech urgency
      if (social.meaningCollapseActive) urgency += 0.4;
      if (social.socialUnrestActive) urgency += 0.3;
    }
  }
  
  return Math.min(1.0, urgency);
}

/**
 * Calculate research penalty based on government type
 * 
 * Authoritarian governments are BAD at:
 * - Social innovation (purpose, meaning, mental health)
 * - Technologies requiring open collaboration
 * - Trust-based systems
 * 
 * Technocratic governments are GOOD at:
 * - Technical solutions
 * - Environmental engineering
 * 
 * This creates DYSTOPIA LOCK-IN: As government becomes authoritarian,
 * they can't research social tech → crises worsen → more authoritarianism
 */
function getGovernmentTypePenalty(state: GameState, techId: string, category: string): number {
  const gov = state.government;
  
  // Democratic: no penalties (baseline)
  if (gov.governmentType === 'democratic') return 1.0;
  
  // Technocratic: bonus on technical, penalty on social
  if (gov.governmentType === 'technocratic') {
    switch (techId) {
      // Technical excellence
      case 'cleanEnergy':
      case 'fusionPower':
      case 'carbonCapture':
      case 'advancedRecycling':
        return 1.3; // 30% faster
      
      // Weak on social innovation
      case 'purposeFrameworks':
      case 'communityPlatforms':
        return 0.7; // 30% slower
      
      default:
        return 1.0;
    }
  }
  
  // Authoritarian: MAJOR penalties on social tech
  if (gov.governmentType === 'authoritarian') {
    switch (techId) {
      // Cannot innovate on meaning/purpose (ideological rigidity)
      case 'purposeFrameworks':
        return 0.2; // 80% penalty - ideology blocks adaptation
      
      // Very weak on community (atomization by design)
      case 'communityPlatforms':
        return 0.3; // 70% penalty - surveillance breaks trust
      
      // Weak on mental health (stigma + control)
      case 'mentalHealthAI':
        return 0.5; // 50% penalty - distrust of vulnerability
      
      // Some penalty on ecosystem management (ignores feedback)
      case 'ecosystemManagement':
        return 0.7; // 30% penalty - less responsive to signals
      
      // Neutral or slight bonus on technical/industrial
      case 'cleanEnergy':
      case 'fusionPower':
      case 'advancedRecycling':
      case 'sustainableAgriculture':
        return 1.0; // Can do industrial tech fine
      
      // Medical/disease: moderate (mixed record)
      case 'diseaseElimination':
      case 'longevityTherapies':
        return 0.8; // 20% penalty - some brain drain
      
      default:
        return category === 'social' ? 0.4 : 1.0;
    }
  }
  
  return 1.0; // fallback
}

function calculateAverageCapability(state: GameState): number {
  // Use all agents, not just deployed (for broader applicability)
  const agents = state.aiAgents;
  if (agents.length === 0) return 0;
  
  return agents.reduce((sum, agent) => {
    // Use agent.capability (single number) as fallback if capabilityProfile doesn't exist
    if (agent.capabilityProfile?.cognitive !== undefined) {
      const caps = agent.capabilityProfile;
      const avg = (caps.cognitive + caps.social + caps.physical) / 3;
      return sum + avg;
    } else {
      // Fallback to simple capability number
      return sum + (agent.capability || 0);
    }
  }, 0) / agents.length;
}

function getTechById(techState: any, id: string): TechnologyNode | null {
  return techState[id] || null;
}

function isCrisisActive(state: GameState, crisisType: string): boolean {
  const env = state.environmentalAccumulation;
  const social = state.socialAccumulation;
  const tech = state.technologicalRisk;
  
  switch (crisisType) {
    case 'pollution': return env.pollutionCrisisActive;
    case 'climate': return env.climateCatastropheActive;
    case 'ecosystem': return env.ecosystemCollapseActive;
    case 'resource': return env.resourceCrisisActive;
    case 'meaning': return social.meaningCollapseActive;
    case 'institutional': return social.institutionalFailureActive;
    case 'social': return social.socialUnrestActive;
    case 'control': return tech.controlLossActive;
    case 'corporate': return tech.corporateDystopiaActive;
    case 'complacency': return tech.complacencyCrisisActive;
    default: return false;
  }
}

/**
 * TEMPORARY: Auto-allocate research budget for testing
 * TODO: Replace with proper government decision-making
 */
function autoAllocateResearchBudget(state: GameState, month: number): void {
  const research = state.government.researchInvestments;
  const economicStage = state.globalMetrics.economicTransitionStage;
  
  // Budget scales with economic stage: $10B at Stage 0 → $30B at Stage 4
  const targetBudget = 10 + economicStage * 5;
  
  // Only reallocate if budget has changed significantly
  const needsReallocation = Math.abs(research.totalBudget - targetBudget) >= 0.1;
  
  if (!needsReallocation) return;
  
  // Allocate across research domains (balanced approach)
  research.climate.mitigation = targetBudget * 0.15; // 15% to climate mitigation
  research.climate.intervention = targetBudget * 0.10; // 10% to climate intervention
  research.materials.energySystems = targetBudget * 0.15; // 15% to energy
  research.physical = targetBudget * 0.10; // 10% to physical
  research.social = targetBudget * 0.15; // 15% to social
  research.biotech.drugDiscovery = targetBudget * 0.15; // 15% to medicine
  research.biotech.neuroscience = targetBudget * 0.10; // 10% to mental health
  research.cognitive = targetBudget * 0.10; // 10% to cognitive
  
  research.totalBudget = targetBudget;
  research.budgetLimit = 10 + economicStage * 5;
}


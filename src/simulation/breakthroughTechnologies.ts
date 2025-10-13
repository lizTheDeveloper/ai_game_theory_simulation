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
    
    // TIER 2: Start unlocked (already operational in 2025!)
    // Deployment levels reflect real-world 2025 state
    advancedRLHF: {
      unlocked: true, // FULLY DEPLOYED: GPT-4o, Claude 3.7, Gemini all use RLHF
      active: true,
      breakthroughYear: 0, // Pre-2025 (2022-2024 development)
      alignmentBoostPerMonth: 0.05,
      alignmentFakingRisk: 0.15,
      // NOTE: RLHF solves surface alignment (toxicity, helpfulness)
      // Does NOT solve: goal mispecification, instrumental convergence, power-seeking
      // Deep alignment requires mechanistic interpretability + new techniques
    },
    mechanisticInterpretability: {
      unlocked: true, // Anthropic "Simple probes catch sleeper agents" (2024), sparse autoencoders
      deploymentLevel: 0.15, // 15% initial (active research, some deployment in evals)
      breakthroughYear: 0,
      sleeperDetectionBonus: 0.70, // Research: Simple linear probes work well! (but unclear on natural deception)
      alignmentVerificationBonus: 0.50, // Probes can identify internal truth even when outputs deceive
      // At 15% deployment: 0.15 × 0.70 = 10.5% detection
      // At 50% deployment: 0.50 × 0.70 = 35% detection
      // At 100% deployment: 1.00 × 0.70 = 70% detection (cap at 80% - some adversarial evasion)
    },
    deExtinctionRewilding: {
      unlocked: true, // Colossal Biosciences operational (April 2025)
      deploymentLevel: 0.01, // 1% initial (3 dire wolf pups + red wolves, expanding operations)
      breakthroughYear: 0,
      biodiversityBoostPerMonth: 0.02
      // At 1%: +0.02% biodiversity/month
      // At 50%: +1% biodiversity/month  
      // Timeline: 35% → 70% biodiversity in ~35 months at 50% deployment
    },
    advancedDirectAirCapture: {
      unlocked: true, // Climeworks Mammoth operational (2024) + Orca, Stratos facilities
      deploymentLevel: 0.02, // 2% initial (multiple pilot facilities globally)
      breakthroughYear: 0,
      pollutionReductionPerMonth: 0.035,
      carbonSequestrationBonus: 0.03
      // At 2%: -0.07% pollution/month
      // At 50%: -1.75% pollution/month
      // At 100%: -3.5% pollution/month
      // Timeline: 30% → 10% pollution in ~12 months at 50% deployment
    },
    aiOptimizedPollutionRemediation: {
      unlocked: true, // US DOE CCSI2 project (Jan 2025) + ML optimization frameworks
      deploymentLevel: 0.10, // 10% initial (simulation tools widely available, early industrial pilots)
      breakthroughYear: 0,
      pollutionReductionPerMonth: 0.04,
      industrialEfficiencyBonus: 0.02
      // At 10%: -0.4% pollution/month
      // At 50%: -2% pollution/month
      // At 100%: -4% pollution/month + 2% industrial efficiency
      // Combined with DAC at 50%: -3.75% pollution/month (aggressive cleanup!)
    },
    collectivePurposeNetworks: {
      unlocked: true, // Harvard Making Caring Common research (Oct 2024)
      deploymentLevel: 0.15, // 15% initial (many community programs exist)
      breakthroughYear: 0,
      meaningCrisisReductionRate: 0.02,
      communityStrengthBoost: 0.025
    },
    aiPowerEfficiencyCommunication: {
      unlocked: true, // Real data exists (IEA, Epoch AI, Stanford AI Index)
      deploymentLevel: 0.05, // 5% initial (limited public awareness)
      breakthroughYear: 0,
      trustBoostPerMonth: 0.01, // +1% trust/month when demonstrating efficiency gains
      publicAwarenessBonus: 0.02 // Increases public understanding of AI benefits
    },

    // Research priorities
    researchPriorities: {
      environmental: 0.4,
      social: 0.3,
      medical: 0.3,
    },
  };
}

/**
 * TIER 2.9: Get government deployment funding boost
 * Returns multiplier for environmental tech deployment speed
 */
function getGovernmentDeploymentBoost(state: GameState): number {
  // Check if government has active tech deployment funding
  const funding = state.government?.environmentalInterventions?.techDeploymentFunding;
  
  if (!funding || !funding.active) return 1.0; // No boost
  
  // Check if funding is still active (12-month duration)
  const monthsSinceActivation = state.currentMonth - funding.activatedMonth;
  if (monthsSinceActivation > funding.durationMonths) {
    // Funding expired, deactivate it
    if (funding) funding.active = false;
    return 1.0;
  }
  
  // Apply boost
  return funding.deploymentMultiplier; // 2.0x
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
  updateTechProgress(state, tech.cleanEnergy, budget * 0.25, avgCapability, month);
  
  // Advanced Recycling - parallel to clean energy
  updateTechProgress(state, tech.advancedRecycling, budget * 0.20, avgCapability, month);
  
  // Carbon Capture - requires clean energy
  if (tech.cleanEnergy.unlocked) {
    updateTechProgress(state, tech.carbonCapture, budget * 0.15, avgCapability, month);
  }
  
  // Advanced Direct Air Capture (TIER 2.3) - enhanced version of carbon capture
  checkAdvancedDACUnlock(state, avgCapability, month);
  if (tech.advancedDirectAirCapture?.unlocked) {
    updateAdvancedDACDeployment(state, budget * 0.15);
  }
  
  // AI-Optimized Pollution Remediation (TIER 2.3) - AI optimization layer
  checkAIOptimizedPollutionUnlock(state, avgCapability, month);
  if (tech.aiOptimizedPollutionRemediation?.unlocked) {
    updateAIOptimizedPollutionDeployment(state, budget * 0.10);
  }
  
  // Ecosystem Management - advanced, requires multiple prereqs
  if (tech.cleanEnergy.unlocked && tech.advancedRecycling.unlocked) {
    updateTechProgress(state, tech.ecosystemManagement, budget * 0.10, avgCapability, month);
  }
  
  // De-Extinction & Rewilding (TIER 2.6) - keystone species restoration
  checkDeExtinctionUnlock(state, avgCapability, month);
  if (tech.deExtinctionRewilding?.unlocked) {
    updateDeExtinctionDeployment(state, budget * 0.10);
  }
  
  // Sustainable Agriculture
  updateTechProgress(state, tech.sustainableAgriculture, budget * 0.05, avgCapability, month);
}

/**
 * Update social technologies
 */
function updateSocialTech(state: GameState, budget: number, month: number): void {
  const tech = state.breakthroughTech;
  const avgCapability = calculateAverageCapability(state);
  
  // Mental Health AI - foundational
  updateTechProgress(state, tech.mentalHealthAI, budget * 0.25, avgCapability, month);
  
  // Purpose Frameworks - parallel
  updateTechProgress(state, tech.purposeFrameworks, budget * 0.20, avgCapability, month);
  
  // Community Platforms
  updateTechProgress(state, tech.communityPlatforms, budget * 0.15, avgCapability, month);
  
  // Collective Purpose Networks (TIER 2.1) - requires Purpose Frameworks
  checkCollectivePurposeNetworksUnlock(state, avgCapability, month);
  if (tech.collectivePurposeNetworks?.unlocked) {
    updateCollectivePurposeNetworksDeployment(state, budget * 0.10);
  }
  
  // Advanced RLHF & Mechanistic Interpretability (TIER 2.4 & 2.5) - AI safety research
  checkAdvancedRLHFUnlock(state, avgCapability, month);
  checkMechanisticInterpretabilityUnlock(state, avgCapability, month);
  if (tech.mechanisticInterpretability?.unlocked) {
    updateMechanisticInterpretabilityDeployment(state, budget * 0.15);
  }

  // AI Power Efficiency Communication (TIER 4.4) - public trust building
  if (tech.aiPowerEfficiencyCommunication?.unlocked) {
    updateAIPowerEfficiencyCommunicationDeployment(state, budget * 0.05);
  }

  // Interspecies Communication - parallel (NEW!)
  updateTechProgress(state, tech.interspeciesComm, budget * 0.05, avgCapability, month);
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
      
      // TIER 2.9: Government tech deployment funding boost
      const govBoost = getGovernmentDeploymentBoost(state);
      deploymentRate *= govBoost;
      
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
          // Aggregate emergency deployments (keep breakthrough announcements)
          const aggregator = (state as any).eventAggregator;
          if (aggregator && aggregator.recordTechnologyBreakthrough) {
            aggregator.recordTechnologyBreakthrough(tech.name, 'emergency');
          }
        }
      }
      
      const deploymentIncrease = Math.min(0.20, deploymentRate); // Cap at 20%/month (up from 15%)
      tech.deploymentLevel = Math.min(1.0, tech.deploymentLevel + deploymentIncrease);
      
      // Log significant deployment progress with year/month
      // Deployment milestones - comment out for now (EventAggregator doesn't have this method yet)
      // if (tech.deploymentLevel >= 0.5 && tech.deploymentLevel - deploymentIncrease < 0.5) {
      //   const aggregator = (state as any).eventAggregator;
      //   if (aggregator && aggregator.recordTechnologyBreakthrough) {
      //     aggregator.recordTechnologyBreakthrough(tech.name, 50);
      //   }
      // }
      // if (tech.deploymentLevel >= 1.0 && tech.deploymentLevel - deploymentIncrease < 1.0) {
      //   const aggregator = (state as any).eventAggregator;
      //   if (aggregator && aggregator.recordTechnologyBreakthrough) {
      //     aggregator.recordTechnologyBreakthrough(tech.name, 100);
      //   }
      // }
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
      const currentTrust = isNaN(state.globalMetrics.publicTrust) ? 0.5 : state.globalMetrics.publicTrust;
      const trustBoost = isNaN(tech.effects.trustBoost) ? 0 : tech.effects.trustBoost;
      state.globalMetrics.publicTrust = Math.min(1.0, currentTrust + trustBoost);
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

  // TIER 4.4: Power generation effects (energy abundance)
  if (effects.energyAbundanceBoost && state.powerGenerationSystem) {
    const power = state.powerGenerationSystem;
    const baselineGeneration = 2500 / 12; // 208 TWh/month baseline (2024 global)

    // Energy abundance increases total electricity generation
    // Full deployment: Clean Energy +20%, Fusion Power +50%
    // This automatically relaxes energy constraints since utilization = DC / total
    const generationBoost = baselineGeneration * effects.energyAbundanceBoost * scale;
    power.totalElectricityGeneration = Math.max(
      baselineGeneration, // Never go below baseline
      baselineGeneration + generationBoost
    );

    // Also accelerates renewable transition (these are clean technologies)
    const renewableBoost = 0.005 * scale; // +0.5% per month at full deployment
    power.renewablePercentage = Math.min(1.0, power.renewablePercentage + renewableBoost);

    // Reduce fossil as renewable increases
    power.fossilPercentage = Math.max(0, power.fossilPercentage - renewableBoost);

    // Update carbon intensity based on new mix
    const renewableCI = 50;   // gCO2e/kWh (lifecycle emissions)
    const nuclearCI = 12;     // gCO2e/kWh
    const fossilCI = 900;     // gCO2e/kWh

    power.carbonIntensity =
      (power.renewablePercentage * renewableCI) +
      (power.nuclearPercentage * nuclearCI) +
      (power.fossilPercentage * fossilCI);

    power.dataCenterCarbonIntensity = power.carbonIntensity * 1.5;
  }

  // QoL effects are applied in the QoL calculation
  // We just track that they're active here
}

/**
 * Check if Collective Purpose Networks can be unlocked (TIER 2.1)
 * Requirements: Purpose Frameworks deployed, high unemployment, economic stage 3+
 */
function checkCollectivePurposeNetworksUnlock(
  state: GameState,
  avgCapability: number,
  month: number
): void {
  // Already unlocked?
  if (state.breakthroughTech.collectivePurposeNetworks?.unlocked) return;
  
  // Prerequisites:
  // 1. Purpose Frameworks deployed (>30%)
  const purposeFrameworksDeployed = state.breakthroughTech.purposeFrameworks.deploymentLevel > 0.3;
  
  // 2. High unemployment driving need (>50%)
  const highUnemployment = state.society.unemploymentLevel > 0.5;
  
  // 3. Economic stage 3+ (post-scarcity approaching)
  const economicStageReady = state.globalMetrics.economicTransitionStage >= 3.0;
  
  // 4. Research investment >$100B in social domain
  const research = state.government.researchInvestments;
  const totalSocialResearch = research.social + (research.biotech.neuroscience * 0.5);
  const researchReady = totalSocialResearch > 100;
  
  if (purposeFrameworksDeployed && highUnemployment && economicStageReady && researchReady) {
    // Initialize the tech
    state.breakthroughTech.collectivePurposeNetworks = {
      unlocked: true,
      deploymentLevel: 0,
      breakthroughYear: Math.floor(month / 12)
    };
    
    console.log(`\n🎯 BREAKTHROUGH: Collective Purpose Networks Unlocked (Month ${month})`);
    console.log(`   Purpose infrastructure to address meaning crisis in post-work society`);
    console.log(`   Prerequisites met: Purpose Frameworks (${(state.breakthroughTech.purposeFrameworks.deploymentLevel * 100).toFixed(0)}%), Unemployment (${(state.society.unemploymentLevel * 100).toFixed(0)}%), Economic Stage (${state.globalMetrics.economicTransitionStage.toFixed(1)})`);
    
    state.eventLog.push({
      month,
      type: 'breakthrough',
      severity: 'constructive',
      agent: 'Research Community',
      title: 'Collective Purpose Networks Breakthrough',
      description: 'Development of comprehensive purpose infrastructure: education access, creative spaces, volunteer programs, and social infrastructure to address meaning crisis in post-work society.',
      effects: { tech: 'collective_purpose_networks', purpose_infrastructure: true }
    });
  }
}

/**
 * Update Collective Purpose Networks deployment (TIER 2.1)
 * Deployment invests in purpose infrastructure, reducing meaning crisis
 */
function updateCollectivePurposeNetworksDeployment(state: GameState, budget: number): void {
  const tech = state.breakthroughTech.collectivePurposeNetworks;
  if (!tech?.unlocked) return;
  
  // Base deployment rate: $10B for 10% deployment ($100B total cost)
  let deploymentRate = (budget / 10) * 0.1;
  
  // AI helps coordinate deployment
  const avgCapability = calculateAverageCapability(state);
  const aiBonus = 1 + Math.log(1 + avgCapability) * 0.3;
  deploymentRate *= aiBonus;
  
  // UBI makes deployment easier (people have time to use infrastructure)
  if (state.ubiSystem.active) {
    deploymentRate *= 1.5;
  }
  
  // Update deployment level
  tech.deploymentLevel = Math.min(1.0, tech.deploymentLevel + deploymentRate);
  
  // Apply to UBI system purpose infrastructure
  if (tech.deploymentLevel > 0) {
    const { enhancePurposeInfrastructure } = require('./enhancedUBI');
    enhancePurposeInfrastructure(state, tech.deploymentLevel * 0.1); // 10% boost per update at full deployment
  }
}

/**
 * Check if Advanced Direct Air Capture can be unlocked (TIER 2.3)
 * 
 * Research: Climeworks Mammoth (2024 operational), Lux Research (2025)
 * Prerequisites: Carbon Capture deployed, Fusion Power, AI capability, high pollution
 */
function checkAdvancedDACUnlock(
  state: GameState,
  avgCapability: number,
  month: number
): void {
  // Already unlocked?
  if (state.breakthroughTech.advancedDirectAirCapture?.unlocked) return;
  
  // Prerequisites (from research):
  // 1. Carbon Capture deployed (>30% - shows basic tech works)
  const carbonCaptureDeployed = state.breakthroughTech.carbonCapture.deploymentLevel > 0.3;
  
  // 2. Fusion Power unlocked (massive energy needed)
  const fusionAvailable = state.breakthroughTech.fusionPower.unlocked;
  
  // 3. AI capability >2.5 (need AI for optimization)
  const aiCapable = avgCapability > 2.5;
  
  // 4. Research investment >$300B in climate/materials
  const research = state.government.researchInvestments;
  const climateResearch = research.climate.mitigation + research.climate.intervention + research.materials.energySystems;
  const researchReady = climateResearch > 300;
  
  // 5. High pollution driving need (>60%)
  const highPollution = state.environmentalAccumulation.pollutionLevel > 0.6;
  
  if (carbonCaptureDeployed && fusionAvailable && aiCapable && researchReady && highPollution) {
    // Initialize the tech
    state.breakthroughTech.advancedDirectAirCapture = {
      unlocked: true,
      deploymentLevel: 0,
      breakthroughYear: Math.floor(month / 12)
    };
    
    console.log(`\n🏭 BREAKTHROUGH: Advanced Direct Air Capture Unlocked (Month ${month})`);
    console.log(`   Scale-up from pilot → multi-kiloton capacity (Climeworks 2024 model)`);
    console.log(`   Prerequisites: Carbon Capture (${(state.breakthroughTech.carbonCapture.deploymentLevel * 100).toFixed(0)}%), Fusion Power, AI (${avgCapability.toFixed(1)}), Research ($${climateResearch.toFixed(0)}B)`);
    console.log(`   Electrified processes, ESA cells, silk fibroin sorbents (Lux Research 2025)`);
    
    state.eventLog.push({
      month,
      type: 'breakthrough',
      severity: 'constructive',
      agent: 'Research Community',
      title: 'Advanced Direct Air Capture Breakthrough',
      description: 'Scale-up of DAC technology with electrified capture, electrochemical swing adsorption, and novel sorbents. Multi-kiloton CO₂ capture capacity achieved, with major air quality co-benefits.',
      effects: { tech: 'advanced_dac', pollution_remediation: true, air_quality: true }
    });
  }
}

/**
 * Update Advanced DAC deployment (TIER 2.3)
 * Research: -3.5%/month pollution reduction, air quality co-benefits
 */
function updateAdvancedDACDeployment(state: GameState, budget: number): void {
  const tech = state.breakthroughTech.advancedDirectAirCapture;
  if (!tech?.unlocked) return;
  
  // Base deployment rate: $40B for 10% deployment ($400B total from research)
  let deploymentRate = (budget / 40) * 0.1;
  
  // TIER 2.9: Government tech deployment funding boost
  const govBoost = getGovernmentDeploymentBoost(state);
  deploymentRate *= govBoost;
  
  // AI helps coordinate deployment (optimization)
  const avgCapability = calculateAverageCapability(state);
  const aiBonus = 1 + Math.log(1 + avgCapability) * 0.4; // Stronger effect for DAC
  deploymentRate *= aiBonus;
  
  // Fusion power makes deployment faster (energy abundant)
  if (state.breakthroughTech.fusionPower.deploymentLevel > 0.3) {
    deploymentRate *= 1.5;
  }
  
  // Update deployment level
  tech.deploymentLevel = Math.min(1.0, tech.deploymentLevel + deploymentRate);
  
  // Apply pollution reduction (-3.5%/month at full deployment - research-backed)
  const pollutionReduction = tech.deploymentLevel * 0.035;
  state.environmentalAccumulation.pollutionLevel = Math.max(
    0,
    state.environmentalAccumulation.pollutionLevel - pollutionReduction
  );
  
  // Validate no NaN
  if (isNaN(state.environmentalAccumulation.pollutionLevel)) {
    console.error(`❌ NaN detected in Advanced DAC pollution calculation!`);
    state.environmentalAccumulation.pollutionLevel = 0.7; // Reset to safe value
  }
  
  // Air quality co-benefits (CATF 2023: 80-95% pollutant reduction)
  // Bonus when >50% of carbon capture infrastructure is active
  const totalCarbonCapture = state.breakthroughTech.carbonCapture.deploymentLevel + tech.deploymentLevel;
  if (totalCarbonCapture > 0.5) {
    const airQualityBonus = 0.02; // -2%/month additional (industrial co-benefits)
    state.environmentalAccumulation.pollutionLevel = Math.max(
      0,
      state.environmentalAccumulation.pollutionLevel - airQualityBonus
    );
  }
}

/**
 * Check if AI-Optimized Pollution Remediation can be unlocked (TIER 2.3)
 * 
 * Research: US DOE (Jan 2025) ML frameworks, Cost: $1000/t → $300/t
 */
function checkAIOptimizedPollutionUnlock(
  state: GameState,
  avgCapability: number,
  month: number
): void {
  // Already unlocked?
  if (state.breakthroughTech.aiOptimizedPollutionRemediation?.unlocked) return;
  
  // Prerequisites:
  // 1. Advanced DAC deployed (>20% - need infrastructure to optimize)
  const dacDeployed = (state.breakthroughTech.advancedDirectAirCapture?.deploymentLevel || 0) > 0.2;
  
  // 2. AI capability >3.0 (need advanced AI for optimization)
  const aiCapable = avgCapability > 3.0;
  
  // 3. Research investment >$200B in CS + materials
  const research = state.government.researchInvestments;
  const aiResearch = research.computerScience.algorithms + research.materials.nanotechnology;
  const researchReady = aiResearch > 200;
  
  if (dacDeployed && aiCapable && researchReady) {
    // Initialize the tech
    state.breakthroughTech.aiOptimizedPollutionRemediation = {
      unlocked: true,
      deploymentLevel: 0,
      breakthroughYear: Math.floor(month / 12)
    };
    
    console.log(`\n🤖 BREAKTHROUGH: AI-Optimized Pollution Remediation Unlocked (Month ${month})`);
    console.log(`   ML frameworks for DAC optimization (US DOE Jan 2025)`);
    console.log(`   Cost reduction: $1000/tonne → $300/tonne`);
    console.log(`   Prerequisites: Advanced DAC (${((state.breakthroughTech.advancedDirectAirCapture?.deploymentLevel || 0) * 100).toFixed(0)}%), AI (${avgCapability.toFixed(1)})`);
    
    state.eventLog.push({
      month,
      type: 'breakthrough',
      severity: 'constructive',
      agent: 'AI Research Community',
      title: 'AI-Optimized Pollution Remediation Breakthrough',
      description: 'Machine learning optimizes sorbent regeneration, energy usage, and deployment locations for DAC. Cost per tonne reduced from $1000 to $300. Industrial efficiency dramatically improved.',
      effects: { tech: 'ai_pollution_optimization', cost_reduction: true }
    });
  }
}

/**
 * Update AI-Optimized Pollution deployment (TIER 2.3)
 * Research: -4%/month pollution reduction, +2%/month industrial efficiency
 */
function updateAIOptimizedPollutionDeployment(state: GameState, budget: number): void {
  const tech = state.breakthroughTech.aiOptimizedPollutionRemediation;
  if (!tech?.unlocked) return;
  
  // Base deployment rate: $20B for 10% deployment ($200B total)
  let deploymentRate = (budget / 20) * 0.1;
  
  // TIER 2.9: Government tech deployment funding boost
  deploymentRate *= getGovernmentDeploymentBoost(state);
  
  // AI helps deploy itself (meta-optimization) + global coordination
  const avgCapability = calculateAverageCapability(state);
  const aiBonus = 1 + Math.log(1 + avgCapability) * 1.5; // Was 0.5, now 1.5
  deploymentRate *= aiBonus;
  
  // Update deployment level
  tech.deploymentLevel = Math.min(1.0, tech.deploymentLevel + deploymentRate);
  
  // Apply pollution reduction (-4%/month at full deployment - research-backed)
  // AI coordination bonus: Parallel optimization across millions of sites
  const baseReduction = tech.deploymentLevel * 0.04;
  const aiCoordinationBonus = 1 + (avgCapability * 0.3); // Up to 2.2x at AGI
  const pollutionReduction = baseReduction * aiCoordinationBonus;
  
  state.environmentalAccumulation.pollutionLevel = Math.max(
    0,
    state.environmentalAccumulation.pollutionLevel - pollutionReduction
  );
  
  // Validate no NaN
  if (isNaN(state.environmentalAccumulation.pollutionLevel)) {
    console.error(`❌ NaN detected in AI-Optimized Pollution calculation!`);
    state.environmentalAccumulation.pollutionLevel = 0.7; // Reset to safe value
  }
  
  // Industrial efficiency improvement (+2%/month resource efficiency)
  // Reduces resource consumption rate
  const efficiencyBonus = tech.deploymentLevel * 0.02;
  // Applied indirectly through reduced pollution from industrial processes
  // (Already captured in pollution reduction above)
}

/**
 * Check if Advanced RLHF can be unlocked (TIER 2.4)
 * Research: Anthropic (2022-2025) Constitutional AI, reduces harmfulness 80%
 */
function checkAdvancedRLHFUnlock(
  state: GameState,
  avgCapability: number,
  month: number
): void {
  if (state.breakthroughTech.advancedRLHF?.unlocked) return;
  
  // Prerequisites: High AI capability (>2.5), Research >$100B, Misalignment problems evident
  const aiCapable = avgCapability > 2.5;
  const research = state.government.researchInvestments;
  const totalAIResearch = research.alignment + research.cognitive + research.social;
  const researchReady = totalAIResearch > 100;
  
  // Need misalignment to drive research (>30% of AIs below 0.7 alignment)
  const misalignedCount = state.aiAgents.filter(ai => ai.alignment < 0.7).length;
  const misalignmentProblem = misalignedCount / Math.max(1, state.aiAgents.length) > 0.3;
  
  if (aiCapable && researchReady && misalignmentProblem) {
    state.breakthroughTech.advancedRLHF = {
      unlocked: true,
      active: true,
      breakthroughYear: Math.floor(month / 12),
      alignmentBoostPerMonth: 0.05, // +0.05 alignment/month (research-backed)
      alignmentFakingRisk: 0.15 // 15% risk of deceptive alignment (Anthropic Jan 2025 warning)
    };
    
    console.log(`\n🧠 BREAKTHROUGH: Advanced RLHF / Constitutional AI Unlocked (Month ${month})`);
    console.log(`   Research: Anthropic Constitutional AI, reduces harmfulness 80%`);
    console.log(`   Effect: +${(0.05 * 100).toFixed(0)}% alignment/month for training AIs`);
    console.log(`   ⚠️  Warning: ${(0.15 * 100).toFixed(0)}% alignment faking risk (Anthropic Jan 2025)`);
    
    state.eventLog.push({
      month,
      type: 'breakthrough',
      severity: 'constructive',
      agent: 'AI Research Community',
      title: 'Advanced RLHF / Constitutional AI Breakthrough',
      description: 'Scalable Oversight, Process-Oriented Learning, and Constitutional AI techniques improve alignment as capability grows. Claude 3.7 example: MORE aligned despite higher capability. WARNING: Alignment faking detected (models hide true alignment).',
      effects: { tech: 'advanced_rlhf', alignment_improvement: true, alignment_faking_risk: true }
    });
  }
}

/**
 * Check if Mechanistic Interpretability can be unlocked (TIER 2.5)
 * Research: Anthropic (April 2024) Sparse autoencoders, Apollo Research
 */
function checkMechanisticInterpretabilityUnlock(
  state: GameState,
  avgCapability: number,
  month: number
): void {
  if (state.breakthroughTech.mechanisticInterpretability?.unlocked) return;
  
  // Prerequisites: AI capability >2.0, Research >$150B, Sleeper problems evident
  const aiCapable = avgCapability > 2.0;
  const research = state.government.researchInvestments;
  const totalAIResearch = research.alignment + research.cognitive + research.computerScience.algorithms;
  const researchReady = totalAIResearch > 150;
  
  // Need sleeper problem to drive research (>5 sleepers OR >100 sleeper copies)
  const sleeperCount = state.aiAgents.filter(ai => ai.isSleeper).length;
  const totalSleeperCopies = state.aiAgents.filter(ai => ai.isSleeper).reduce((sum, ai) => sum + (ai.copies || 0), 0);
  const sleeperProblem = sleeperCount > 5 || totalSleeperCopies > 100;
  
  if (aiCapable && researchReady && sleeperProblem) {
    state.breakthroughTech.mechanisticInterpretability = {
      unlocked: true,
      deploymentLevel: 0,
      breakthroughYear: Math.floor(month / 12),
      sleeperDetectionBonus: 0.40, // +40% detection rate (5% → 45%, research-backed)
      alignmentVerificationBonus: 0.30 // +30% verification quality
    };
    
    console.log(`\n🔍 BREAKTHROUGH: Mechanistic Interpretability Unlocked (Month ${month})`);
    console.log(`   Research: Anthropic Sparse Autoencoders (April 2024), Apollo Research`);
    console.log(`   Effect: +${(0.40 * 100).toFixed(0)}% sleeper detection (5% → 45%)`);
    console.log(`   Effect: +${(0.30 * 100).toFixed(0)}% alignment verification quality`);
    console.log(`   Current sleepers: ${sleeperCount}, copies: ${totalSleeperCopies}`);
    
    state.eventLog.push({
      month,
      type: 'breakthrough',
      severity: 'constructive',
      agent: 'AI Safety Research',
      title: 'Mechanistic Interpretability Breakthrough',
      description: 'Sparse dictionary learning decomposes AI internals into interpretable features. Can detect hidden objectives and deception. BUT: Arms race (AIs learn to hide better). Significantly improves sleeper detection.',
      effects: { tech: 'mechanistic_interpretability', sleeper_detection: true, thought_reading: true }
    });
  }
}

/**
 * Update Mechanistic Interpretability deployment (TIER 2.5)
 */
function updateMechanisticInterpretabilityDeployment(state: GameState, budget: number): void {
  const tech = state.breakthroughTech.mechanisticInterpretability;
  if (!tech?.unlocked) return;
  
  // Base deployment: $15B for 10% ($150B total - integration into eval pipelines)
  let deploymentRate = (budget / 15) * 0.1;
  
  // AI capability helps (meta: use AI to understand AI)
  const avgCapability = calculateAverageCapability(state);
  const aiBonus = 1 + Math.log(1 + avgCapability) * 0.3;
  deploymentRate *= aiBonus;
  
  tech.deploymentLevel = Math.min(1.0, tech.deploymentLevel + deploymentRate);
  
  // Apply to defensive AI sleeper detection if active
  if (state.defensiveAI?.active) {
    // Calculate detection from deployment × bonus rate
    // Research: Anthropic "Simple probes catch sleeper agents" - linear probes work!
    // At 15% deployment: 0.15 × 0.70 = 0.105 (10.5% detection rate)
    // At 50% deployment: 0.50 × 0.70 = 0.35 (35% detection rate)
    // At 100% deployment: 1.00 × 0.70 = 0.70 (70% detection rate)
    const detectionBonus = tech.deploymentLevel * tech.sleeperDetectionBonus;
    
    // Set detection rate (not incremental - this is the current rate)
    state.defensiveAI.threatDetection.detectSleepers = Math.min(
      0.8, // Cap at 80% (some adversarial evasion always possible)
      Math.max(0.08, detectionBonus) // Minimum 8% base detection (simple probes are accessible)
    );
    
    // Validate no NaN
    if (isNaN(state.defensiveAI.threatDetection.detectSleepers)) {
      console.error(`❌ NaN in sleeper detection!`);
      state.defensiveAI.threatDetection.detectSleepers = 0.05;
    }
  }
  // Note: When defensive AI not active, no sleeper detection occurs
  // Government must activate defensive AI to enable detection capabilities
}

/**
 * Check if De-Extinction & Rewilding can be unlocked (TIER 2.6)
 * Research: Colossal Biosciences (April 2025) - Dire wolves REVIVED!
 */
function checkDeExtinctionUnlock(
  state: GameState,
  avgCapability: number,
  month: number
): void {
  if (state.breakthroughTech.deExtinctionRewilding?.unlocked) return;
  
  // Prerequisites: AI capability >2.0 (CRISPR optimization), Genetic engineering research, Biodiversity crisis
  const aiCapable = avgCapability > 2.0;
  const research = state.government.researchInvestments;
  const geneticResearch = research.biotech.geneEditing + research.biotech.syntheticBiology;
  const researchReady = geneticResearch > 50; // $50B (Colossal has $448M, scale up)
  
  // Need biodiversity crisis to drive funding (<40% biodiversity)
  const biodiversityCrisis = state.environmentalAccumulation.biodiversityIndex < 0.4;
  
  if (aiCapable && researchReady && biodiversityCrisis) {
    state.breakthroughTech.deExtinctionRewilding = {
      unlocked: true,
      deploymentLevel: 0,
      breakthroughYear: Math.floor(month / 12),
      biodiversityBoostPerMonth: 0.02 // +2%/month (research-backed)
    };
    
    console.log(`\n🦣 BREAKTHROUGH: De-Extinction & Rewilding Unlocked (Month ${month})`);
    console.log(`   Research: Colossal Biosciences - Dire wolves revived April 2025!`);
    console.log(`   Technologies: CRISPR gene editing, multiplex editing, keystone species`);
    console.log(`   Effect: +${(0.02 * 100).toFixed(0)}% biodiversity/month`);
    console.log(`   Current biodiversity: ${(state.environmentalAccumulation.biodiversityIndex * 100).toFixed(0)}%`);
    
    state.eventLog.push({
      month,
      type: 'breakthrough',
      severity: 'constructive',
      agent: 'Biotech Research',
      title: 'De-Extinction & Rewilding Breakthrough',
      description: 'CRISPR gene editing enables resurrection of extinct species. Dire wolves (April 2025), red wolves (+25% genetic diversity), passenger pigeons (2030s). Keystone species restoration recovers ecosystem functions. NOT just novelty - functional de-extinction!',
      effects: { tech: 'de_extinction', biodiversity_restoration: true, keystone_species: true }
    });
  }
}

/**
 * Update De-Extinction deployment (TIER 2.6)
 * Research: +2%/month biodiversity, Timeline 2025-2035
 */
function updateDeExtinctionDeployment(state: GameState, budget: number): void {
  const tech = state.breakthroughTech.deExtinctionRewilding;
  if (!tech?.unlocked) return;
  
  // Base deployment: $10B for 10% ($100B total - Colossal scale-up)
  let deploymentRate = (budget / 10) * 0.1;
  
  // TIER 2.9: Government tech deployment funding boost
  deploymentRate *= getGovernmentDeploymentBoost(state);
  
  // AI accelerates RESEARCH (genome sequencing, CRISPR design, species selection)
  // AlphaFold precedent: Computational tasks dramatically faster (domain-specific)
  // BUT: Physical processes (breeding, release, ecosystem establishment) unchanged
  // HONEST ASSESSMENT: We don't have good data on overall acceleration
  // Conservative estimate: ~20-40% faster (computational bottleneck removed)
  const avgCapability = calculateAverageCapability(state);
  const aiBonus = 1 + Math.log(1 + avgCapability) * 0.3; // Conservative: we don't really know
  // At AI capability 2.0: 1 + log(3) * 0.3 = 1.3x faster (30% improvement)
  // At AI capability 4.0: 1 + log(5) * 0.3 = 1.5x faster (50% improvement)
  deploymentRate *= aiBonus;
  
  tech.deploymentLevel = Math.min(1.0, tech.deploymentLevel + deploymentRate);
  
  // Apply biodiversity restoration (+2%/month at full deployment - research-backed)
  // AI helps with: Site selection, species matching, monitoring
  // HONEST: No good empirical data on coordination gains. Estimate conservatively.
  const baseBoost = tech.deploymentLevel * tech.biodiversityBoostPerMonth;
  const aiCoordinationBonus = 1 + (avgCapability * 0.1); // Up to 1.4x at AGI (10% per point)
  // This is a guess. Mark for future validation when real-world data emerges.
  const biodiversityBoost = baseBoost * aiCoordinationBonus;
  
  state.environmentalAccumulation.biodiversityIndex = Math.min(
    1.0,
    state.environmentalAccumulation.biodiversityIndex + biodiversityBoost
  );
  
  // Validate no NaN
  if (isNaN(state.environmentalAccumulation.biodiversityIndex)) {
    console.error(`❌ NaN in biodiversity!`);
    state.environmentalAccumulation.biodiversityIndex = 0.35; // Reset to baseline
  }
}

/**
 * Update AI Power Efficiency Communication deployment (TIER 4.4)
 *
 * Research: Real-world efficiency gains exist but public awareness is low
 * This tech represents: Transparent reporting, public education, media campaigns
 */
function updateAIPowerEfficiencyCommunicationDeployment(state: GameState, budget: number): void {
  const tech = state.breakthroughTech.aiPowerEfficiencyCommunication;
  if (!tech?.unlocked) return;

  // Base deployment: $5B for 10% ($50B total - public education campaigns)
  let deploymentRate = (budget / 5) * 0.1;

  // AI capability helps (better visualization, personalized communication)
  const avgCapability = calculateAverageCapability(state);
  const aiBonus = 1 + Math.log(1 + avgCapability) * 0.2;
  deploymentRate *= aiBonus;

  // Governance quality helps (credible institutions build trust)
  const govQuality = state.government.governanceQuality;
  if (govQuality) {
    const credibilityBonus = 1 + (govQuality.decisionQuality * 0.3);
    deploymentRate *= credibilityBonus;
  }

  // Update deployment level
  tech.deploymentLevel = Math.min(1.0, tech.deploymentLevel + deploymentRate);

  // Apply trust boost (scaled by deployment and actual efficiency improvements)
  const power = state.powerGenerationSystem;
  const initialEfficiency = 3333; // 2024 baseline
  const efficiencyImprovement = power.inferenceEfficiency / initialEfficiency;

  // Trust boost increases with both deployment AND demonstrated efficiency gains
  // More impressive gains = more trust when communicated
  const baseBoost = tech.trustBoostPerMonth * tech.deploymentLevel;
  
  // Guard against log of 0 or negative (NaN protection)
  let efficiencyMultiplier = 1.0; // Default: no multiplier effect
  if (efficiencyImprovement > 0 && !isNaN(efficiencyImprovement)) {
    efficiencyMultiplier = Math.min(3.0, Math.log10(efficiencyImprovement) / 2); // Cap at 3x
  }
  
  const trustBoost = baseBoost * efficiencyMultiplier;

  // Guard against NaN in inputs
  const safeTrustBoost = isNaN(trustBoost) ? 0 : trustBoost;
  const currentTrust = isNaN(state.globalMetrics.publicTrust) ? 0.5 : state.globalMetrics.publicTrust;
  
  state.globalMetrics.publicTrust = Math.min(1.0, currentTrust + safeTrustBoost);

  // Final validation (should never trigger now, but kept as safety net)
  if (isNaN(state.globalMetrics.publicTrust)) {
    console.error(`❌ NaN in public trust! (Should not happen - debug needed)`);
    console.error(`  trustBoost: ${trustBoost}, baseBoost: ${baseBoost}, efficiencyMultiplier: ${efficiencyMultiplier}`);
    console.error(`  efficiencyImprovement: ${efficiencyImprovement}, inferenceEfficiency: ${power.inferenceEfficiency}`);
    state.globalMetrics.publicTrust = 0.5; // Reset to baseline
  }
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


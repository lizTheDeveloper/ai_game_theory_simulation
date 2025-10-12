/**
 * Social Safety Nets & Community Infrastructure (TIER 2.2)
 * 
 * Physical and social infrastructure to combat loneliness epidemic.
 * 
 * Research Sources:
 * - WHO (June 2025): 17-21% youth lonely, community cost billions
 * - Harvard Making Caring Common (Oct 2024): 75% want more meaningful connections
 * - US Surgeon General (2024): "Our Epidemic of Loneliness and Isolation"
 * - University of Texas (July 2025): Neighborhood cohesion protective against loneliness
 * - World Bank (Aug 2025): Strong social bonds = safer, healthier, more resilient
 * - UK/Denmark/Netherlands: Government collaboration on social cohesion
 */

import { GameState } from '@/types/game';
import { SocialSafetyNetsSystem } from '@/types/socialSafetyNets';

/**
 * Initialize social safety nets system (not active by default)
 */
export function initializeSocialSafetyNets(): SocialSafetyNetsSystem {
  return {
    physicalInfrastructure: {
      parks: 0.3, // 30% baseline (existing infrastructure)
      libraries: 0.4, // 40% baseline
      communityCenters: 0.2, // 20% baseline
      publicTransport: 0.5, // 50% baseline
      cafesAndGathering: 0.1, // 10% baseline (mostly private)
    },
    
    universalServices: {
      healthcare: 0.5, // Varies by country (US ~50%, EU ~90%)
      mentalHealthcare: 0.2, // 20% access (major gap)
      childcare: 0.3, // 30% accessible/affordable
      eldercare: 0.25, // 25% coverage
      education: 0.7, // 70% (K-12 mostly covered, college/vocational gaps)
    },
    
    communityPrograms: {
      volunteerGroups: 0.2, // 20% participation
      neighborhoodCohesion: 0.3, // 30% active neighborhood programs
      intergenerational: 0.1, // 10% programs
      culturalEvents: 0.4, // 40% subsidized
      sportsAndRecreation: 0.5, // 50% community sports access
    },
    
    effects: {
      lonelinesReduction: 0,
      communityStrengthBoost: 0,
      socialCohesionIncrease: 0,
      mentalHealthImprovement: 0,
      civicEngagement: 0,
      trustBuilding: 0
    },
    
    active: false,
    startMonth: -1,
    monthsActive: 0,
    totalInvestment: 0,
    
    communityStrengthGain: 0,
    meaningCrisisReduction: 0,
    democraticParticipation: 0,
    
    ubiSynergy: 0,
    aiCoordination: 0,
    governmentCapacity: 0.5, // Start at 50%
  };
}

/**
 * Activate social safety nets system
 * Called from government action or breakthrough tech deployment
 */
export function activateSocialSafetyNets(
  state: GameState,
  investmentLevel: number = 50 // $50B/month investment (US-scale: ~$600B/year)
): void {
  const system = state.socialSafetyNets;
  
  system.active = true;
  system.startMonth = state.currentMonth;
  system.monthsActive = 0;
  system.totalInvestment = 0;
  
  // Check for synergies
  system.ubiSynergy = state.ubiSystem.active ? 0.5 : 0; // UBI gives people time
  
  const avgAICapability = state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / Math.max(1, state.aiAgents.length);
  system.aiCoordination = Math.min(0.8, avgAICapability * 0.2); // AI optimizes placement
  
  system.governmentCapacity = state.government.governanceQuality?.institutionalCapacity || 0.5;
  
  console.log(`✅ SOCIAL SAFETY NETS ACTIVATED (Month ${state.currentMonth})`);
  console.log(`   Investment: $${investmentLevel}B/month`);
  console.log(`   Synergies: UBI ${(system.ubiSynergy * 100).toFixed(0)}%, AI ${(system.aiCoordination * 100).toFixed(0)}%, Gov ${(system.governmentCapacity * 100).toFixed(0)}%`);
}

/**
 * Monthly update for social safety nets
 * Builds infrastructure, improves services, strengthens community
 */
export function updateSocialSafetyNets(state: GameState): void {
  const system = state.socialSafetyNets;
  
  if (!system.active) {
    // Even without active program, baseline infrastructure slowly improves with economic growth
    const economicStage = state.globalMetrics.economicTransitionStage;
    if (economicStage >= 3.0) {
      // Post-scarcity: Passive improvement from abundance
      const passiveGrowth = 0.005; // 0.5%/month
      system.physicalInfrastructure.parks = Math.min(1.0, system.physicalInfrastructure.parks + passiveGrowth);
      system.universalServices.healthcare = Math.min(1.0, system.universalServices.healthcare + passiveGrowth);
    }
    return;
  }
  
  system.monthsActive++;
  
  // === INVESTMENT ALLOCATION ===
  // Default: $50B/month = $600B/year (US-scale comparable to Medicare)
  const baseInvestment = 50; // $B/month
  
  // Scale by economic stage (more resources in post-scarcity)
  const economicStage = state.globalMetrics.economicTransitionStage;
  const economicMultiplier = 1.0 + (economicStage - 2.0) * 0.3; // +30% per stage above 2
  
  const monthlyInvestment = baseInvestment * economicMultiplier * (system.governmentCapacity + 0.3);
  system.totalInvestment += monthlyInvestment;
  
  // === INFRASTRUCTURE CONSTRUCTION ===
  // Physical infrastructure: $10B per 1% deployment (total $1T for full build-out)
  const physicalBudget = monthlyInvestment * 0.4; // 40% to physical
  const physicalRate = physicalBudget / 10; // % per month
  
  // AI coordination accelerates construction
  const constructionMultiplier = 1.0 + system.aiCoordination * 0.5;
  
  system.physicalInfrastructure.parks = Math.min(
    1.0,
    system.physicalInfrastructure.parks + physicalRate * constructionMultiplier * 0.8
  );
  system.physicalInfrastructure.libraries = Math.min(
    1.0,
    system.physicalInfrastructure.libraries + physicalRate * constructionMultiplier * 0.6
  );
  system.physicalInfrastructure.communityCenters = Math.min(
    1.0,
    system.physicalInfrastructure.communityCenters + physicalRate * constructionMultiplier * 1.0
  );
  system.physicalInfrastructure.publicTransport = Math.min(
    1.0,
    system.physicalInfrastructure.publicTransport + physicalRate * constructionMultiplier * 0.4
  );
  system.physicalInfrastructure.cafesAndGathering = Math.min(
    1.0,
    system.physicalInfrastructure.cafesAndGathering + physicalRate * constructionMultiplier * 1.2
  );
  
  // === UNIVERSAL SERVICES EXPANSION ===
  const servicesBudget = monthlyInvestment * 0.4; // 40% to services
  const servicesRate = servicesBudget / 15; // $15B per 1% coverage
  
  system.universalServices.healthcare = Math.min(
    1.0,
    system.universalServices.healthcare + servicesRate * 1.0
  );
  system.universalServices.mentalHealthcare = Math.min(
    1.0,
    system.universalServices.mentalHealthcare + servicesRate * 1.5 // Priority area
  );
  system.universalServices.childcare = Math.min(
    1.0,
    system.universalServices.childcare + servicesRate * 1.2
  );
  system.universalServices.eldercare = Math.min(
    1.0,
    system.universalServices.eldercare + servicesRate * 1.0
  );
  system.universalServices.education = Math.min(
    1.0,
    system.universalServices.education + servicesRate * 0.8
  );
  
  // === COMMUNITY PROGRAMS ===
  const programsBudget = monthlyInvestment * 0.2; // 20% to programs
  const programsRate = programsBudget / 5; // $5B per 1% participation
  
  system.communityPrograms.volunteerGroups = Math.min(
    1.0,
    system.communityPrograms.volunteerGroups + programsRate * 1.5
  );
  system.communityPrograms.neighborhoodCohesion = Math.min(
    1.0,
    system.communityPrograms.neighborhoodCohesion + programsRate * 1.0
  );
  system.communityPrograms.intergenerational = Math.min(
    1.0,
    system.communityPrograms.intergenerational + programsRate * 1.2
  );
  system.communityPrograms.culturalEvents = Math.min(
    1.0,
    system.communityPrograms.culturalEvents + programsRate * 0.8
  );
  system.communityPrograms.sportsAndRecreation = Math.min(
    1.0,
    system.communityPrograms.sportsAndRecreation + programsRate * 1.0
  );
  
  // === CALCULATE EFFECTS ===
  
  // Average infrastructure levels
  const avgPhysical = (
    system.physicalInfrastructure.parks +
    system.physicalInfrastructure.libraries +
    system.physicalInfrastructure.communityCenters +
    system.physicalInfrastructure.publicTransport +
    system.physicalInfrastructure.cafesAndGathering
  ) / 5;
  
  const avgServices = (
    system.universalServices.healthcare +
    system.universalServices.mentalHealthcare +
    system.universalServices.childcare +
    system.universalServices.eldercare +
    system.universalServices.education
  ) / 5;
  
  const avgPrograms = (
    system.communityPrograms.volunteerGroups +
    system.communityPrograms.neighborhoodCohesion +
    system.communityPrograms.intergenerational +
    system.communityPrograms.culturalEvents +
    system.communityPrograms.sportsAndRecreation
  ) / 5;
  
  // Loneliness reduction (WHO: 17-21% youth lonely → target <5%)
  // University of Texas: Neighborhood cohesion protective
  const lonelinesReductionRate = 
    avgPhysical * 0.015 + // Physical spaces enable connection
    avgPrograms * 0.025 + // Programs directly address loneliness
    system.ubiSynergy * 0.01; // UBI synergy (time to participate)
  
  system.effects.lonelinesReduction = Math.min(0.9, system.effects.lonelinesReduction + lonelinesReductionRate);
  
  // Community strength boost (Research: 30% → 75% over 36 months = ~1.25%/month)
  // Harvard: 75% want meaningful connections, infrastructure enables it
  const communityStrengthRate = 
    avgPhysical * 0.01 +  // Parks, libraries, centers bring people together
    avgPrograms * 0.015 + // Programs explicitly build community
    system.effects.lonelinesReduction * 0.005; // Less loneliness → stronger community
  
  system.effects.communityStrengthBoost = communityStrengthRate;
  system.communityStrengthGain += communityStrengthRate;
  
  // Apply to actual community strength
  state.society.communityStrength = Math.min(
    1.0,
    state.society.communityStrength + communityStrengthRate
  );
  
  // Social cohesion increase (World Bank: Strong bonds → resilience)
  system.effects.socialCohesionIncrease = avgPhysical * 0.008 + avgServices * 0.012 + avgPrograms * 0.01;
  state.socialAccumulation.socialCohesion = Math.min(
    1.0,
    state.socialAccumulation.socialCohesion + system.effects.socialCohesionIncrease
  );
  
  // Mental health improvement (US Surgeon General: Connection combats isolation)
  system.effects.mentalHealthImprovement = 
    system.universalServices.mentalHealthcare * 0.02 +
    system.effects.lonelinesReduction * 0.015;
  
  // Meaning crisis reduction (synergy with UBI)
  // Infrastructure + UBI = full solution (research plan)
  const meaningCrisisRate = 
    avgPrograms * 0.01 + // Volunteer/community programs provide meaning
    system.effects.civicEngagement * 0.005;
  
  system.meaningCrisisReduction += meaningCrisisRate;
  state.socialAccumulation.meaningCrisisLevel = Math.max(
    0,
    state.socialAccumulation.meaningCrisisLevel - meaningCrisisRate
  );
  
  // Civic engagement (democratic participation enabled by community strength)
  system.effects.civicEngagement = Math.min(
    0.9,
    system.effects.civicEngagement + avgPrograms * 0.012 + avgPhysical * 0.008
  );
  
  // Trust building (interpersonal trust from repeated interactions)
  system.effects.trustBuilding = avgPhysical * 0.006 + avgPrograms * 0.010;
  state.society.trustInAI = Math.min(
    1.0,
    state.society.trustInAI + system.effects.trustBuilding * 0.5 // Half effect on AI trust
  );
  
  // Democratic participation (enables Democratic Spiral)
  system.democraticParticipation = Math.min(
    1.0,
    system.democraticParticipation + system.effects.civicEngagement * 0.01
  );
  
  // === LOGGING (every 6 months) ===
  if (system.monthsActive % 6 === 0) {
    console.log(`\n🏛️ SOCIAL SAFETY NETS STATUS (Month ${state.currentMonth}, ${system.monthsActive} months active):`);
    console.log(`   Physical: ${(avgPhysical * 100).toFixed(0)}%, Services: ${(avgServices * 100).toFixed(0)}%, Programs: ${(avgPrograms * 100).toFixed(0)}%`);
    console.log(`   Community strength: ${(state.society.communityStrength * 100).toFixed(0)}% (gain: +${(system.communityStrengthGain * 100).toFixed(1)}%)`);
    console.log(`   Loneliness reduction: ${(system.effects.lonelinesReduction * 100).toFixed(0)}%, Civic engagement: ${(system.effects.civicEngagement * 100).toFixed(0)}%`);
    console.log(`   Total investment: $${system.totalInvestment.toFixed(0)}B`);
  }
}


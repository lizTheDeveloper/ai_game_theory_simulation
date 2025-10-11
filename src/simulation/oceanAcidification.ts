/**
 * Ocean Acidification Crisis System (TIER 1.3)
 * 
 * Models ocean acidification - 7th planetary boundary breached Sept 2025.
 * Research: PIK Potsdam 2025, Stockholm Resilience Centre, Kate Raworth
 * 
 * Key findings:
 * - Aragonite saturation just below 80% threshold (Sept 2025)
 * - 3 billion people depend on fish for protein
 * - Coral reefs support 25% of marine species
 * - Slow collapse timeline: 75 years (2025-2100)
 * - Feedback loop: Acidification → phytoplankton decline → less CO₂ buffer
 */

import { GameState } from '@/types/game';
import { OceanAcidificationSystem } from '@/types/oceanAcidification';

/**
 * Initialize ocean acidification system state (2025 baseline - JUST BREACHED)
 */
export function initializeOceanAcidificationSystem(): OceanAcidificationSystem {
  return {
    aragoniteSaturation: 0.78,       // Just below 0.80 boundary (Sept 2025)
    pHLevel: 0.96,                   // Slight decline from pre-industrial 8.2
    co2AbsorptionCapacity: 0.85,     // Still strong but declining
    coralReefHealth: 0.65,           // Already stressed (bleaching events)
    shellfishPopulation: 0.80,       // Larvae struggling but not collapsed yet
    marineFoodWeb: 0.75,             // Moderately healthy
    fishDependentImpact: 0.0,        // Not yet impacting food supply
    boundaryBreached: true,          // Breached Sept 2025
    coralExtinctionActive: false,
    shellfishCollapseActive: false,
    marineFoodWebCollapseActive: false,
    monthsSinceBreach: 0,
    alkalinityEnhancementDeployment: 0.0,
    coralRestorationDeployment: 0.05, // Some existing programs
    marineProtectedAreasDeployment: 0.08, // ~8% of oceans protected (2025)
  };
}

/**
 * Update ocean acidification system each month
 */
export function updateOceanAcidificationSystem(state: GameState): void {
  if (!state.oceanAcidificationSystem) return;
  
  const oa = state.oceanAcidificationSystem;
  const climateStability = state.environmentalAccumulation?.climateStability || 0.75;
  const pollutionLevel = state.environmentalAccumulation?.pollutionLevel || 0.30;
  const economicStage = state.globalMetrics.economicTransitionStage;
  
  // Track time since breach
  if (oa.boundaryBreached) {
    oa.monthsSinceBreach++;
  }
  
  // === ARAGONITE SATURATION DECLINE ===
  // Driven by CO2 absorption from atmosphere
  // Research: ~0.002 pH units per decade = 0.00017/month
  
  // Climate instability = more CO2 emissions = more acidification
  const climateStress = 1.0 - climateStability;
  let acidificationRate = climateStress * 0.0008; // 0.08%/month at max climate stress
  
  // Economic activity drives CO2 emissions
  acidificationRate += economicStage * 0.0004; // 0.04%/month at Stage 1, 0.16%/month at Stage 4
  
  // Ocean alkalinity enhancement mitigates
  if (oa.alkalinityEnhancementDeployment > 0) {
    // Research: OAE can restore pH over decades
    acidificationRate -= oa.alkalinityEnhancementDeployment * 0.001; // -0.1%/month at full deployment
  }
  
  oa.aragoniteSaturation = Math.max(0, oa.aragoniteSaturation - acidificationRate);
  
  // pH level tracks aragonite saturation (correlated)
  oa.pHLevel = 0.90 + (oa.aragoniteSaturation * 0.10); // 0.90-1.00 range
  
  // === CO2 ABSORPTION CAPACITY DECLINE ===
  // Feedback loop: As oceans acidify, they absorb less CO2
  // Research: Stockholm Resilience - "degrading oceans' ability to act as Earth's stabiliser"
  
  const absorptionDecline = (1.0 - oa.aragoniteSaturation) * 0.0005; // Faster as saturation drops
  oa.co2AbsorptionCapacity = Math.max(0.50, oa.co2AbsorptionCapacity - absorptionDecline);
  
  // Feedback to climate: Lower absorption = more atmospheric CO2
  if (state.environmentalAccumulation && oa.co2AbsorptionCapacity < 0.75) {
    const climateAcceleration = (0.75 - oa.co2AbsorptionCapacity) * 0.0002;
    state.environmentalAccumulation.climateStability = Math.max(0,
      state.environmentalAccumulation.climateStability - climateAcceleration
    );
  }
  
  // === CORAL REEF COLLAPSE ===
  // Timeline: 2025-2050 (25 years = 300 months)
  // Corals need aragonite > 0.75 to calcify properly
  
  let coralDeclineRate = 0;
  if (oa.aragoniteSaturation < 0.75) {
    // Below threshold: Active decline
    coralDeclineRate = (0.75 - oa.aragoniteSaturation) * 0.015; // Up to 1.5%/month
  } else {
    // Above threshold but stressed
    coralDeclineRate = 0.001; // Slow decline from bleaching
  }
  
  // Climate stress accelerates (heat + acid = double hit)
  coralDeclineRate *= (1.0 + climateStress * 0.5);
  
  // Coral restoration helps
  coralDeclineRate *= (1.0 - oa.coralRestorationDeployment * 0.4);
  
  // Protected areas help
  coralDeclineRate *= (1.0 - oa.marineProtectedAreasDeployment * 0.3);
  
  oa.coralReefHealth = Math.max(0, oa.coralReefHealth - coralDeclineRate);
  
  // Coral extinction phase
  if (oa.coralReefHealth < 0.30 && !oa.coralExtinctionActive) {
    oa.coralExtinctionActive = true;
    console.log(`🚨 CORAL EXTINCTION PHASE: Reefs collapsing globally`);
    console.log(`   Coral health: ${(oa.coralReefHealth * 100).toFixed(0)}%`);
    console.log(`   Aragonite saturation: ${(oa.aragoniteSaturation * 100).toFixed(0)}%`);
    console.log(`   25% of marine species losing habitat`);
    
    // Impact biodiversity
    if (state.environmentalAccumulation) {
      state.environmentalAccumulation.biodiversityIndex = Math.max(0,
        state.environmentalAccumulation.biodiversityIndex - 0.05 // -5% instant hit
      );
    }
  }
  
  // === SHELLFISH COLLAPSE ===
  // Timeline: 2050-2075 (after corals die)
  // Shellfish larvae need aragonite to form shells
  
  let shellfishDeclineRate = 0;
  if (oa.aragoniteSaturation < 0.70) {
    // Critical: Larvae can't form shells
    shellfishDeclineRate = (0.70 - oa.aragoniteSaturation) * 0.012; // Up to 1.2%/month
  } else if (oa.aragoniteSaturation < 0.75) {
    // Stressed: Struggling larvae
    shellfishDeclineRate = 0.003; // 0.3%/month
  }
  
  // Ocean alkalinity helps
  shellfishDeclineRate *= (1.0 - oa.alkalinityEnhancementDeployment * 0.6);
  
  oa.shellfishPopulation = Math.max(0, oa.shellfishPopulation - shellfishDeclineRate);
  
  // Shellfish collapse phase
  if (oa.shellfishPopulation < 0.40 && !oa.shellfishCollapseActive) {
    oa.shellfishCollapseActive = true;
    console.log(`🚨 SHELLFISH FISHERIES COLLAPSE`);
    console.log(`   Shellfish population: ${(oa.shellfishPopulation * 100).toFixed(0)}%`);
    console.log(`   Aragonite saturation: ${(oa.aragoniteSaturation * 100).toFixed(0)}%`);
    console.log(`   Oyster, clam, mussel fisheries failing`);
    
    // Food impact for coastal populations
    state.qualityOfLifeSystems.food = Math.max(0, state.qualityOfLifeSystems.food - 0.04);
  }
  
  // === MARINE FOOD WEB COLLAPSE ===
  // Timeline: 2075-2100 (cascading from bottom up)
  // Pteropods (sea butterflies) dissolve → fish starve → apex predators decline
  
  // Food web integrity depends on all components
  const avgHealth = (oa.coralReefHealth + oa.shellfishPopulation + oa.aragoniteSaturation) / 3;
  oa.marineFoodWeb = avgHealth;
  
  // Marine food web collapse
  if (oa.marineFoodWeb < 0.30 && !oa.marineFoodWebCollapseActive) {
    oa.marineFoodWebCollapseActive = true;
    console.log(`🚨 MARINE FOOD WEB COLLAPSE`);
    console.log(`   Food web integrity: ${(oa.marineFoodWeb * 100).toFixed(0)}%`);
    console.log(`   Coral: ${(oa.coralReefHealth * 100).toFixed(0)}%`);
    console.log(`   Shellfish: ${(oa.shellfishPopulation * 100).toFixed(0)}%`);
    console.log(`   3 billion people depend on fish for protein`);
    
    // Major biodiversity hit
    if (state.environmentalAccumulation) {
      state.environmentalAccumulation.biodiversityIndex = Math.max(0,
        state.environmentalAccumulation.biodiversityIndex - 0.10 // -10% instant hit
      );
    }
  }
  
  // === FISH-DEPENDENT POPULATION IMPACT ===
  // 3 billion people (37.5% of 8 billion) depend on fish
  // Impact scales with marine food web collapse
  
  if (oa.marineFoodWeb < 0.50) {
    // Food web stressed: Fish catches declining
    oa.fishDependentImpact = (0.50 - oa.marineFoodWeb) * 2.0; // 0-100% impact
    
    // Food QoL impact
    const foodImpact = oa.fishDependentImpact * 0.375 * 0.005; // 37.5% of people, up to 0.5%/month
    state.qualityOfLifeSystems.food = Math.max(0, state.qualityOfLifeSystems.food - foodImpact);
  }
  
  // === EXTINCTION PATHWAY ===
  // Slow collapse: Marine food web fails + no alternatives = famine for 3B people
  
  if (oa.marineFoodWebCollapseActive && oa.fishDependentImpact > 0.70) {
    const foodQoL = state.qualityOfLifeSystems.food;
    
    // Check if alternative proteins developed
    const hasAlternatives = economicStage >= 3.5; // Post-scarcity has alternatives
    
    if (foodQoL < 0.30 && !hasAlternatives) {
      console.log(`☠️ OCEAN ACIDIFICATION EXTINCTION: Marine food system collapse`);
      console.log(`   Food QoL: ${(foodQoL * 100).toFixed(0)}%`);
      console.log(`   Marine food web: ${(oa.marineFoodWeb * 100).toFixed(0)}%`);
      console.log(`   Fish-dependent impact: ${(oa.fishDependentImpact * 100).toFixed(0)}%`);
      console.log(`   3 billion people depend on fish - famine spreading`);
      
      if (!state.extinctionState.extinctionTriggered) {
        state.extinctionState.extinctionTriggered = true;
        state.extinctionState.extinctionType = 'environmental_collapse';
        state.extinctionState.extinctionMechanism = 'ocean_acidification_famine';
        state.extinctionState.monthsUntilExtinction = 48; // 4 years of slow collapse
        state.extinctionState.description = 'Ocean acidification destroyed marine food webs. 3 billion fish-dependent people facing famine. Slow collapse over 48 months.';
      }
    }
  }
}

/**
 * Check if ocean acidification technologies should unlock
 */
export function checkOceanAcidificationTechUnlocks(state: GameState): void {
  if (!state.oceanAcidificationSystem || !state.breakthroughTech) return;
  
  const oa = state.oceanAcidificationSystem;
  const tech = state.breakthroughTech;
  const avgAICapability = state.aiAgents.length > 0
    ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length
    : 0;
  const totalResearch = state.government.researchInvestments.physical +
    state.government.researchInvestments.digital +
    state.government.researchInvestments.cognitive +
    state.government.researchInvestments.social;
  
  // === 1. OCEAN ALKALINITY ENHANCEMENT (OAE) ===
  // Research: Biogeosciences 2025, field tests 2023-2024, NO termination shock
  if (!tech.oceanAlkalinityEnhancement?.unlocked) {
    if (avgAICapability > 2.5 && totalResearch > 150 && oa.boundaryBreached) {
      tech.oceanAlkalinityEnhancement = {
        unlocked: true,
        deploymentLevel: 0.0,
        breakthroughYear: Math.floor(state.currentMonth / 12) + 2025
      };
      console.log(`🔬 BREAKTHROUGH: Ocean Alkalinity Enhancement`);
      console.log(`   Permanent CO2 removal (10,000 years)`);
      console.log(`   Mitigates acidification + sequesters carbon`);
      console.log(`   NO termination shock (gradual deployment)`);
    }
  }
  
  // === 2. CORAL RESTORATION ===
  // Heat-resistant coral strains, AI-optimized restoration
  if (!tech.coralRestoration?.unlocked) {
    const biotech = state.aiAgents[0]?.researchCapabilities?.biotech?.geneEditing || 0;
    if (biotech > 2.0 && totalResearch > 100 && oa.coralReefHealth < 0.70) {
      tech.coralRestoration = {
        unlocked: true,
        deploymentLevel: 0.0,
        breakthroughYear: Math.floor(state.currentMonth / 12) + 2025
      };
      console.log(`🔬 BREAKTHROUGH: Heat-Resistant Coral Restoration`);
      console.log(`   Gene-edited corals survive higher temps`);
      console.log(`   AI-optimized reef restoration`);
    }
  }
  
  // === 3. MARINE PROTECTED AREAS (POLICY) ===
  // Expansion to 30% of oceans (UN target)
  if (!tech.marineProtectedAreas?.unlocked) {
    if (state.government.legitimacy > 0.60 && oa.marineFoodWeb < 0.60) {
      tech.marineProtectedAreas = {
        unlocked: true,
        deploymentLevel: 0.0,
        breakthroughYear: Math.floor(state.currentMonth / 12) + 2025
      };
      console.log(`🔬 POLICY: Marine Protected Areas Expansion`);
      console.log(`   UN target: 30% of oceans protected by 2030`);
      console.log(`   Allows ecosystem recovery`);
    }
  }
  
  // === AUTO-DEPLOYMENT ===
  
  if (tech.oceanAlkalinityEnhancement?.unlocked && oa.aragoniteSaturation < 0.75) {
    // Acidification motivates OAE deployment
    const adoptionRate = 0.012; // 1.2%/month (gradual 5-year ramp)
    oa.alkalinityEnhancementDeployment = Math.min(1.0, oa.alkalinityEnhancementDeployment + adoptionRate);
  }
  
  if (tech.coralRestoration?.unlocked && oa.coralReefHealth < 0.50) {
    // Coral collapse motivates restoration
    const adoptionRate = 0.015; // 1.5%/month
    oa.coralRestorationDeployment = Math.min(1.0, oa.coralRestorationDeployment + adoptionRate);
  }
  
  if (tech.marineProtectedAreas?.unlocked) {
    // Policy rollout (slower)
    const adoptionRate = 0.008; // 0.8%/month (10+ years to 30%)
    oa.marineProtectedAreasDeployment = Math.min(0.30, oa.marineProtectedAreasDeployment + adoptionRate);
  }
}


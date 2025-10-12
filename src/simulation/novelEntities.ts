/**
 * Novel Entities Crisis System (TIER 1.5)
 * 
 * Models synthetic chemical pollution - 5th planetary boundary breached 2022.
 * Research: Kate Raworth, Stockholm Resilience Centre
 * 
 * Key findings:
 * - Microplastics everywhere (blood, placenta, organs)
 * - PFAS in 99% of human blood ("forever chemicals")
 * - 50% sperm count decline in 50 years
 * - Endocrine disruption widespread
 * - Slow poisoning: 100-200 year timeline
 * - Bioaccumulation hits apex predators (including humans)
 */

import { GameState } from '@/types/game';
import { NovelEntitiesSystem } from '@/types/novelEntities';

/**
 * Initialize novel entities system state (2025 baseline - ALREADY BREACHED)
 */
export function initializeNovelEntitiesSystem(): NovelEntitiesSystem {
  return {
    syntheticChemicalLoad: 0.40,         // Already significant (breached 2022)
    microplasticConcentration: 0.45,     // Widespread contamination
    pfasPrevalence: 0.50,                // In 99% of humans = 50% on 0-1 scale
    endocrineDisruption: 0.25,           // Early signs visible
    reproductiveHealthDecline: 0.25,     // 50% decline over 50 years = ~0.5%/year cumulative
    bioaccumulationFactor: 0.30,         // Concentrating up food chain
    chronicDiseasePrevalence: 0.20,      // Baseline cancer/autoimmune rates
    boundaryBreached: true,              // Breached 2022
    reproductiveCrisisActive: false,
    chronicDiseaseEpidemicActive: false,
    bioaccumulationCollapseActive: false,
    exposureMonths: 0,
    greenChemistryDeployment: 0.05,      // Minimal adoption
    circularEconomyDeployment: 0.10,     // Some programs
    chemicalBansDeployment: 0.15,        // Some chemicals banned (e.g., some pesticides)
    bioremediationDeployment: 0.0,       // Emerging technology
  };
}

/**
 * Update novel entities system each month
 */
export function updateNovelEntitiesSystem(state: GameState): void {
  if (!state.novelEntitiesSystem) return;
  
  const ne = state.novelEntitiesSystem;
  const economicStage = state.globalMetrics.economicTransitionStage;
  const manufacturingCap = state.globalMetrics.manufacturingCapability;
  
  ne.exposureMonths++;
  
  // === SYNTHETIC CHEMICAL LOAD ACCUMULATION ===
  // More production = more chemicals
  let chemicalAccumulationRate = (economicStage * 0.002) + (manufacturingCap * 0.001);
  
  // Green chemistry reduces new chemical load
  chemicalAccumulationRate *= (1.0 - ne.greenChemistryDeployment * 0.6);
  
  // Circular economy reduces need for new chemicals
  chemicalAccumulationRate *= (1.0 - ne.circularEconomyDeployment * 0.4);
  
  // Chemical bans remove worst offenders
  chemicalAccumulationRate *= (1.0 - ne.chemicalBansDeployment * 0.3);
  
  // Bioremediation breaks down existing chemicals (slow)
  const bioremediationRate = ne.bioremediationDeployment * 0.001; // -0.1%/month at full deployment
  
  ne.syntheticChemicalLoad = Math.max(0, Math.min(1.0,
    ne.syntheticChemicalLoad + chemicalAccumulationRate - bioremediationRate
  ));
  
  // === MICROPLASTICS ===
  // Persistent, everywhere, breaks down into smaller pieces but never disappears
  let microplasticRate = (economicStage * 0.0015) + (manufacturingCap * 0.0008);
  microplasticRate *= (1.0 - ne.circularEconomyDeployment * 0.5); // Reduce plastic use
  
  ne.microplasticConcentration = Math.min(1.0, ne.microplasticConcentration + microplasticRate);
  
  // === PFAS ("FOREVER CHEMICALS") ===
  // Never breaks down, accumulates indefinitely
  let pfasRate = (economicStage * 0.001); // Industrial use
  pfasRate *= (1.0 - ne.chemicalBansDeployment * 0.7); // Bans very effective for PFAS
  
  ne.pfasPrevalence = Math.min(1.0, ne.pfasPrevalence + pfasRate);
  
  // === ENDOCRINE DISRUPTION ===
  // Tracks overall chemical load + specific endocrine disruptors
  const avgChemicalExposure = (ne.syntheticChemicalLoad + ne.microplasticConcentration + ne.pfasPrevalence) / 3;
  ne.endocrineDisruption = avgChemicalExposure * 0.6; // 60% of chemical load causes disruption
  
  // === REPRODUCTIVE HEALTH DECLINE ===
  // Research: 50% sperm count decline over 50 years (600 months)
  // Natural rate: 0.083%/month (50% / 600 months)
  let reproductiveDeclineRate = ne.endocrineDisruption * 0.001; // Up to 0.1%/month
  
  // Bioaccumulation accelerates decline (hits reproductive systems)
  reproductiveDeclineRate *= (1.0 + ne.bioaccumulationFactor * 0.5);
  
  ne.reproductiveHealthDecline = Math.min(1.0, ne.reproductiveHealthDecline + reproductiveDeclineRate);
  
  // Reproductive crisis
  if (ne.reproductiveHealthDecline > 0.50 && !ne.reproductiveCrisisActive) {
    ne.reproductiveCrisisActive = true;
    console.log(`🚨 REPRODUCTIVE CRISIS: Widespread fertility decline`);
    console.log(`   Reproductive health: ${((1.0 - ne.reproductiveHealthDecline) * 100).toFixed(0)}%`);
    console.log(`   Endocrine disruption: ${(ne.endocrineDisruption * 100).toFixed(0)}%`);
    console.log(`   PFAS prevalence: ${(ne.pfasPrevalence * 100).toFixed(0)}%`);

    // Health impact
    state.qualityOfLifeSystems.health = Math.max(0.3, state.qualityOfLifeSystems.health - 0.08);

    // Population impact: Reproductive crisis causes despair, failed fertility treatments (0.05-0.1% casualties)
    // TRULY GLOBAL: PFAS in 99% of human blood = everyone exposed (100% of world)
    // 0.08% mortality rate from despair/failed fertility treatments
    const { addAcuteCrisisDeaths } = require('./populationDynamics');
    addAcuteCrisisDeaths(state, 0.0008, 'Reproductive crisis - despair/failed treatments (global exposure)', 1.00);
  }
  
  // === BIOACCUMULATION ===
  // Chemicals concentrate up food chain (apex predators hit hardest)
  // Interacts with biodiversity (more species = more bioaccumulation pathways)
  const biodiversity = state.environmentalAccumulation?.biodiversityIndex || 0.35;
  ne.bioaccumulationFactor = ne.syntheticChemicalLoad * (0.5 + biodiversity * 0.5);
  
  // Bioaccumulation collapse (apex predators failing)
  if (ne.bioaccumulationFactor > 0.60 && !ne.bioaccumulationCollapseActive) {
    ne.bioaccumulationCollapseActive = true;
    console.log(`🚨 BIOACCUMULATION COLLAPSE: Apex predators poisoned`);
    console.log(`   Bioaccumulation factor: ${(ne.bioaccumulationFactor * 100).toFixed(0)}%`);
    console.log(`   Chemical load: ${(ne.syntheticChemicalLoad * 100).toFixed(0)}%`);

    // Biodiversity impact (top-down cascade)
    if (state.environmentalAccumulation) {
      state.environmentalAccumulation.biodiversityIndex = Math.max(0,
        state.environmentalAccumulation.biodiversityIndex - 0.08 // -8% instant hit
      );
    }

    // Population impact: Food chain collapse causes contaminated food deaths (0.1-0.2% casualties)
    // TRULY GLOBAL: Food chain is globally interconnected (100% of world affected)
    // 0.15% mortality rate from contaminated food poisoning
    const { addAcuteCrisisDeaths } = require('./populationDynamics');
    addAcuteCrisisDeaths(state, 0.0015, 'Bioaccumulation collapse - contaminated food chain (global)', 1.00);
  }
  
  // === CHRONIC DISEASE EPIDEMIC ===
  // Cancer, autoimmune disorders, developmental abnormalities
  // Tracks cumulative exposure over time
  const exposureYears = ne.exposureMonths / 12;
  const cumulativeExposure = (ne.syntheticChemicalLoad * exposureYears) / 100; // Normalize
  
  ne.chronicDiseasePrevalence = 0.20 + (cumulativeExposure * 0.3) + (ne.endocrineDisruption * 0.2);
  ne.chronicDiseasePrevalence = Math.min(0.80, ne.chronicDiseasePrevalence);
  
  // Chronic disease epidemic
  if (ne.chronicDiseasePrevalence > 0.40 && !ne.chronicDiseaseEpidemicActive) {
    ne.chronicDiseaseEpidemicActive = true;
    console.log(`🚨 CHRONIC DISEASE EPIDEMIC: Widespread health crisis`);
    console.log(`   Disease prevalence: ${(ne.chronicDiseasePrevalence * 100).toFixed(0)}%`);
    console.log(`   Exposure years: ${exposureYears.toFixed(0)}`);
    console.log(`   Chemical load: ${(ne.syntheticChemicalLoad * 100).toFixed(0)}%`);

    // Health QoL impact
    const healthImpact = (ne.chronicDiseasePrevalence - 0.40) * 0.3; // Up to 12% impact
    state.qualityOfLifeSystems.health = Math.max(0.2, state.qualityOfLifeSystems.health - healthImpact);

    // Population impact: Chronic disease epidemic causes cancer/autoimmune deaths (0.3-0.5% casualties)
    // TRULY GLOBAL: Chemical exposure is global (100% of world affected)
    // 0.4% mortality rate from cancer/autoimmune surge
    const { addAcuteCrisisDeaths } = require('./populationDynamics');
    addAcuteCrisisDeaths(state, 0.004, 'Chronic disease epidemic - cancer/autoimmune surge (global exposure)', 1.00);
  }
  
  // === ONGOING HEALTH IMPACTS ===
  // Monthly degradation from chemical exposure
  if (ne.syntheticChemicalLoad > 0.50) {
    const monthlyHealthImpact = (ne.syntheticChemicalLoad - 0.50) * 0.0005; // Up to 0.025%/month
    state.qualityOfLifeSystems.health = Math.max(0, state.qualityOfLifeSystems.health - monthlyHealthImpact);
  }
  
  // === EXTINCTION PATHWAY ===
  // Slow collapse: Reproductive failure + chronic disease = population decline
  // Timeline: 100-200 years (1200-2400 months)
  
  if (ne.reproductiveHealthDecline > 0.70 && ne.chronicDiseasePrevalence > 0.60) {
    const healthQoL = state.qualityOfLifeSystems.health;
    
    // Check if detoxification technologies deployed
    const hasDetox = (ne.greenChemistryDeployment + ne.bioremediationDeployment + ne.chemicalBansDeployment) > 1.5;
    
    if (healthQoL < 0.25 && !hasDetox) {
      console.log(`☠️ NOVEL ENTITIES EXTINCTION: Slow poisoning collapse`);
      console.log(`   Health QoL: ${(healthQoL * 100).toFixed(0)}%`);
      console.log(`   Reproductive decline: ${(ne.reproductiveHealthDecline * 100).toFixed(0)}%`);
      console.log(`   Chronic disease: ${(ne.chronicDiseasePrevalence * 100).toFixed(0)}%`);
      console.log(`   Chemical load: ${(ne.syntheticChemicalLoad * 100).toFixed(0)}%`);
      console.log(`   Gradual sterility + disease → population collapse`);
      
      if (!state.extinctionState.extinctionTriggered) {
        state.extinctionState.extinctionTriggered = true;
        state.extinctionState.extinctionType = 'environmental_collapse';
        state.extinctionState.extinctionMechanism = 'chemical_poisoning';
        state.extinctionState.monthsUntilExtinction = 120; // 10 years of slow decline
        state.extinctionState.description = 'Synthetic chemical pollution caused widespread reproductive failure and chronic disease. Slow population collapse over 10 years.';
      }
    }
  }
}

/**
 * Check if novel entities technologies should unlock
 */
export function checkNovelEntitiesTechUnlocks(state: GameState): void {
  if (!state.novelEntitiesSystem || !state.breakthroughTech) return;
  
  const ne = state.novelEntitiesSystem;
  const tech = state.breakthroughTech;
  const economicStage = state.globalMetrics.economicTransitionStage;
  const avgAICapability = state.aiAgents.length > 0
    ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length
    : 0;
  const totalResearch = state.government.researchInvestments.physical +
    state.government.researchInvestments.digital +
    state.government.researchInvestments.cognitive +
    state.government.researchInvestments.social;
  
  // === 1. GREEN CHEMISTRY ===
  // Non-toxic alternatives to hazardous chemicals
  if (!tech.greenChemistry?.unlocked) {
    if (avgAICapability > 2.0 && totalResearch > 100) {
      tech.greenChemistry = {
        unlocked: true,
        deploymentLevel: 0.0,
        breakthroughYear: Math.floor(state.currentMonth / 12) + 2025
      };
      console.log(`🔬 BREAKTHROUGH: Green Chemistry`);
      console.log(`   Non-toxic alternatives to hazardous chemicals`);
      console.log(`   AI-designed molecules with desired properties`);
    }
  }
  
  // === 2. ADVANCED BIOREMEDIATION ===
  // Engineered microbes break down synthetic chemicals
  if (!tech.advancedBioremediation?.unlocked) {
    const biotech = state.aiAgents[0]?.researchCapabilities?.biotech?.syntheticBiology || 0;
    if (biotech > 2.5 && totalResearch > 150 && ne.syntheticChemicalLoad > 0.50) {
      tech.advancedBioremediation = {
        unlocked: true,
        deploymentLevel: 0.0,
        breakthroughYear: Math.floor(state.currentMonth / 12) + 2025
      };
      console.log(`🔬 BREAKTHROUGH: Advanced Bioremediation`);
      console.log(`   Engineered microbes break down PFAS, microplastics`);
      console.log(`   Can remediate contaminated sites`);
    }
  }
  
  // === 3. CIRCULAR ECONOMY SYSTEMS ===
  // Eliminate need for new chemical production
  if (!tech.circularEconomySystems?.unlocked) {
    if (avgAICapability > 2.5 && economicStage >= 3.0) {
      tech.circularEconomySystems = {
        unlocked: true,
        deploymentLevel: 0.0,
        breakthroughYear: Math.floor(state.currentMonth / 12) + 2025
      };
      console.log(`🔬 BREAKTHROUGH: Full Circular Economy`);
      console.log(`   Zero-waste manufacturing, closed-loop systems`);
      console.log(`   Eliminates new chemical pollution`);
    }
  }
  
  // === 4. CHEMICAL SAFETY REGULATIONS ===
  // Policy: Ban worst offenders, require safety testing
  if (!tech.chemicalSafetyRegulations?.unlocked) {
    if (state.government.legitimacy > 0.60 && ne.chronicDiseaseEpidemicActive) {
      tech.chemicalSafetyRegulations = {
        unlocked: true,
        deploymentLevel: 0.0,
        breakthroughYear: Math.floor(state.currentMonth / 12) + 2025
      };
      console.log(`🔬 POLICY: Comprehensive Chemical Safety Regulations`);
      console.log(`   Ban PFAS, restrict endocrine disruptors`);
      console.log(`   Require safety testing before release`);
    }
  }
  
  // === AUTO-DEPLOYMENT ===
  
  if (tech.greenChemistry?.unlocked) {
    // Industry adopts green chemistry (economic + regulatory pressure)
    const adoptionRate = 0.010; // 1%/month
    ne.greenChemistryDeployment = Math.min(1.0, ne.greenChemistryDeployment + adoptionRate);
  }
  
  if (tech.advancedBioremediation?.unlocked && ne.syntheticChemicalLoad > 0.60) {
    // Deploy bioremediation where contamination is worst
    const adoptionRate = 0.008; // 0.8%/month
    ne.bioremediationDeployment = Math.min(1.0, ne.bioremediationDeployment + adoptionRate);
  }
  
  if (tech.circularEconomySystems?.unlocked) {
    // Systemic transformation (slow)
    const adoptionRate = 0.006; // 0.6%/month
    ne.circularEconomyDeployment = Math.min(1.0, ne.circularEconomyDeployment + adoptionRate);
  }
  
  if (tech.chemicalSafetyRegulations?.unlocked) {
    // Policy implementation
    const adoptionRate = 0.012; // 1.2%/month
    ne.chemicalBansDeployment = Math.min(1.0, ne.chemicalBansDeployment + adoptionRate);
  }
}


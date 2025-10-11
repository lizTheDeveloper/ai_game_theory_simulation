/**
 * Freshwater Depletion Crisis System (TIER 1.2)
 * 
 * Models freshwater scarcity - the #1 resource constraint for civilization.
 * Research: Nature 2023-2025, WWF 2024, LA Times 2025, UC Santa Barbara 2024
 * 
 * Key findings:
 * - 68% of water loss is groundwater (non-renewable on human timescales)
 * - 41% of humans in water-stressed basins (WWF 2024)
 * - 368 billion metric tons/year loss (LA Times 2025)
 * - Groundwater decline >0.5 m/year in dry croplands (Nature 2023)
 * - "Day Zero Drought" - compound extremes (Nature 2025)
 * - Peak groundwater concept (AGU 2025)
 */

import { GameState } from '@/types/game';
import { FreshwaterSystem, DayZeroEvent } from '@/types/freshwater';

/**
 * Initialize freshwater system state (2025 baseline)
 */
export function initializeFreshwaterSystem(): FreshwaterSystem {
  return {
    blueWater: {
      surfaceWater: 0.75,         // Rivers/lakes moderately stressed
      groundwater: 0.70,           // Already depleting (68% of loss)
      aquiferRecharge: 0.30,       // Slow natural recharge
      depletionRate: 0.008,        // Extraction > recharge
    },
    greenWater: {
      soilMoisture: 0.65,          // Climate stress affecting soil
      evapotranspiration: 0.70,    // Moderately healthy
    },
    demand: {
      agricultural: 0.70,          // 70% of global use
      industrial: 0.20,            // 20%
      domestic: 0.10,              // 10%
    },
    waterStress: 0.35,             // Moderate baseline stress
    populationStressed: 0.41,      // 41% (WWF 2024)
    peakGroundwaterReached: false,
    dayZeroDrought: {
      active: false,
      region: '',
      duration: 0,
      severity: 0,
    },
    criticalScarcityActive: false,
    regions: {
      middleEast: 0.40,            // Already highly stressed
      northAfrica: 0.45,           // Very stressed
      southAsia: 0.55,             // Moderately stressed
      global: 0.70,                // Global average
    },
    desalinationDeployment: 0.05,        // Some existing (Middle East, Australia)
    recyclingDeployment: 0.10,           // Minimal existing programs
    precisionIrrigationDeployment: 0.15, // Some adoption in developed nations
    atmosphericWaterDeployment: 0.0,     // Emerging technology
  };
}

/**
 * Update freshwater system each month
 */
export function updateFreshwaterSystem(state: GameState): void {
  if (!state.freshwaterSystem) return;
  
  const fw = state.freshwaterSystem;
  const economicStage = state.globalMetrics.economicTransitionStage;
  const climateStability = state.environmentalAccumulation?.climateStability || 0.75;
  const population = 8.0; // Billion people (approximate)
  
  // === GROUNDWATER DEPLETION ===
  // Research: 68% of water loss is groundwater, >0.5 m/year in dry croplands
  
  // Base depletion rate scales with economic activity
  let groundwaterDepletion = economicStage * 0.006; // 0.6%/month at Stage 1, 2.4%/month at Stage 4
  
  // Agricultural demand drives depletion (70% of use)
  const agriculturalMultiplier = fw.demand.agricultural * 1.5;
  groundwaterDepletion *= agriculturalMultiplier;
  
  // Climate stress accelerates depletion (droughts = more pumping)
  const climateStress = 1.0 - climateStability;
  groundwaterDepletion *= (1.0 + climateStress * 0.5);
  
  // Technology reduces depletion
  const techEfficiency = 1.0 - (
    fw.precisionIrrigationDeployment * 0.3 +  // 30% reduction at full deployment
    fw.recyclingDeployment * 0.2 +            // 20% reduction
    fw.desalinationDeployment * 0.15          // 15% offset (coastal)
  );
  groundwaterDepletion *= techEfficiency;
  
  // Apply depletion
  fw.blueWater.groundwater = Math.max(0, fw.blueWater.groundwater - groundwaterDepletion);
  
  // Natural recharge (very slow - decades to centuries for aquifers)
  const naturalRecharge = fw.blueWater.aquiferRecharge * 0.001; // 0.1%/month max
  fw.blueWater.groundwater = Math.min(1.0, fw.blueWater.groundwater + naturalRecharge);
  
  // === SURFACE WATER DEPLETION ===
  // Rivers, lakes affected by climate and consumption
  
  let surfaceDepletion = economicStage * 0.004; // Slower than groundwater
  surfaceDepletion *= (1.0 + climateStress * 0.8); // Climate strongly affects surface water
  surfaceDepletion *= (1.0 - fw.recyclingDeployment * 0.25); // Recycling helps
  
  fw.blueWater.surfaceWater = Math.max(0, fw.blueWater.surfaceWater - surfaceDepletion);
  
  // === PEAK GROUNDWATER DETECTION ===
  // Like peak oil - extraction becomes uneconomical/impossible after peak
  if (!fw.peakGroundwaterReached && fw.blueWater.groundwater < 0.50) {
    fw.peakGroundwaterReached = true;
    console.log(`⚠️ PEAK GROUNDWATER: Depletion phase begins (Month ${state.currentMonth})`);
    console.log(`   Groundwater: ${(fw.blueWater.groundwater * 100).toFixed(0)}%`);
    console.log(`   Water stress: ${(fw.waterStress * 100).toFixed(0)}%`);
    
    // After peak, forced reduction in irrigation (30% cut)
    fw.demand.agricultural = Math.max(0.50, fw.demand.agricultural * 0.70);
    console.log(`   Agricultural water use cut to ${(fw.demand.agricultural * 100).toFixed(0)}%`);
  }
  
  // === WATER STRESS CALCULATION ===
  // Stress = (demand - supply) / demand
  const totalSupply = (fw.blueWater.groundwater + fw.blueWater.surfaceWater + fw.greenWater.soilMoisture) / 3;
  const totalDemand = 1.0 + (economicStage * 0.2); // Demand increases with development
  
  fw.waterStress = Math.max(0, Math.min(1.0, 1.0 - (totalSupply / totalDemand)));
  
  // Population under stress increases with water stress
  fw.populationStressed = 0.41 + (fw.waterStress * 0.4); // 41% baseline → 81% at max stress
  
  // === REGIONAL DYNAMICS ===
  // Different regions collapse at different rates
  
  // Middle East: Highly stressed, fast depletion
  fw.regions.middleEast = Math.max(0, fw.regions.middleEast - 0.008 * (1.0 - fw.desalinationDeployment * 0.5));
  
  // North Africa: Very stressed, moderate depletion
  fw.regions.northAfrica = Math.max(0, fw.regions.northAfrica - 0.006 * (1.0 - fw.recyclingDeployment * 0.3));
  
  // South Asia: Moderately stressed, agriculture-driven
  fw.regions.southAsia = Math.max(0, fw.regions.southAsia - 0.005 * (1.0 - fw.precisionIrrigationDeployment * 0.4));
  
  // Global average
  fw.regions.global = (fw.regions.middleEast + fw.regions.northAfrica + fw.regions.southAsia + fw.blueWater.groundwater) / 4;
  
  // === DAY ZERO DROUGHT ===
  // Compound extremes: Low rainfall + reduced flow + high consumption
  // Nature 2025: "Time of First Emergence" within 10-20 years for some regions
  
  if (!fw.dayZeroDrought.active) {
    // Check for Day Zero conditions
    const lowRainfall = fw.greenWater.soilMoisture < 0.40;
    const reducedRiverFlow = fw.blueWater.surfaceWater < 0.50;
    const highConsumption = fw.waterStress > 0.60;
    
    // Probability increases with all three conditions present
    let dayZeroProbability = 0;
    if (lowRainfall && reducedRiverFlow && highConsumption) {
      dayZeroProbability = 0.10; // 10%/month with all conditions
    } else if ((lowRainfall && reducedRiverFlow) || (reducedRiverFlow && highConsumption)) {
      dayZeroProbability = 0.03; // 3%/month with two conditions
    }
    
    if (Math.random() < dayZeroProbability) {
      // Trigger Day Zero Drought
      const regions = ['Middle East', 'North Africa', 'South Asia'];
      const regionValues = [fw.regions.middleEast, fw.regions.northAfrica, fw.regions.southAsia];
      const mostStressedIndex = regionValues.indexOf(Math.min(...regionValues));
      
      fw.dayZeroDrought = {
        active: true,
        region: regions[mostStressedIndex],
        duration: 12 + Math.floor(Math.random() * 24), // 12-36 months
        severity: 0.7 + Math.random() * 0.3, // 0.7-1.0
      };
      
      console.log(`🚨 DAY ZERO DROUGHT: ${fw.dayZeroDrought.region}`);
      console.log(`   Compound extremes: All three conditions present`);
      console.log(`   Severity: ${(fw.dayZeroDrought.severity * 100).toFixed(0)}%`);
      console.log(`   Duration: ${fw.dayZeroDrought.duration} months`);
      console.log(`   Regional water: ${(regionValues[mostStressedIndex] * 100).toFixed(0)}%`);
      
      // Immediate impacts
      state.qualityOfLifeSystems.materialAbundance = Math.max(0.1, state.qualityOfLifeSystems.materialAbundance - 0.08);
      state.qualityOfLifeSystems.health = Math.max(0.1, state.qualityOfLifeSystems.health - 0.05);
      state.society.trust -= 0.04;
      state.globalMetrics.economicGrowthRate -= 0.03;
      
      // Regional collapse effects
      if (state.environmentalAccumulation) {
        state.environmentalAccumulation.resourceReserves = Math.max(0, 
          state.environmentalAccumulation.resourceReserves - 0.05
        );
      }
    }
  } else {
    // Day Zero drought is active - ongoing impacts
    const monthlyFoodImpact = fw.dayZeroDrought.severity * 0.015; // Up to 1.5%/month
    state.qualityOfLifeSystems.materialAbundance = Math.max(0, state.qualityOfLifeSystems.materialAbundance - monthlyFoodImpact);
    
    fw.dayZeroDrought.duration--;
    if (fw.dayZeroDrought.duration <= 0) {
      // Drought ends (but damage remains)
      console.log(`✅ DAY ZERO DROUGHT ENDED: ${fw.dayZeroDrought.region}`);
      console.log(`   Material Abundance: ${(state.qualityOfLifeSystems.materialAbundance * 100).toFixed(0)}%`);
      fw.dayZeroDrought.active = false;
    }
  }
  
  // === FOOD SYSTEM IMPACT ===
  // Agriculture uses 70% of water - stress directly impacts food/material abundance
  if (fw.waterStress > 0.50) {
    const foodImpact = (fw.waterStress - 0.50) * 0.012; // Up to 0.6%/month at max stress
    state.qualityOfLifeSystems.materialAbundance = Math.max(0, state.qualityOfLifeSystems.materialAbundance - foodImpact);
  }
  
  // === CRITICAL SCARCITY ===
  if (fw.blueWater.groundwater < 0.30 && !fw.criticalScarcityActive) {
    fw.criticalScarcityActive = true;
    console.log(`🚨 CRITICAL WATER SCARCITY`);
    console.log(`   Groundwater: ${(fw.blueWater.groundwater * 100).toFixed(0)}%`);
    console.log(`   Surface water: ${(fw.blueWater.surfaceWater * 100).toFixed(0)}%`);
    console.log(`   Water stress: ${(fw.waterStress * 100).toFixed(0)}%`);
    console.log(`   Population stressed: ${(fw.populationStressed * 100).toFixed(0)}%`);
  }
  
  // === EXTINCTION PATHWAY ===
  // Slow collapse: Groundwater depleted + no alternatives = agricultural failure
  if (fw.blueWater.groundwater < 0.15 && fw.waterStress > 0.70) {
    const materialAbundance = state.qualityOfLifeSystems.materialAbundance;
    
    // Check if technology has provided alternatives
    const hasAlternatives = (fw.desalinationDeployment + fw.recyclingDeployment + fw.atmosphericWaterDeployment) > 0.50;
    
    if (materialAbundance < 0.25 && !hasAlternatives) {
      console.log(`☠️ FRESHWATER DEPLETION EXTINCTION: Agricultural collapse`);
      console.log(`   Material Abundance: ${(materialAbundance * 100).toFixed(0)}%`);
      console.log(`   Groundwater: ${(fw.blueWater.groundwater * 100).toFixed(0)}%`);
      console.log(`   Water stress: ${(fw.waterStress * 100).toFixed(0)}%`);
      console.log(`   Alternative water tech: ${((fw.desalinationDeployment + fw.recyclingDeployment) * 50).toFixed(0)}%`);
      console.log(`   No water alternatives deployed - agriculture failed`);
      
      if (!state.extinctionState.extinctionTriggered) {
        state.extinctionState.extinctionTriggered = true;
        state.extinctionState.extinctionType = 'resource_depletion';
        state.extinctionState.extinctionMechanism = 'freshwater_famine';
        state.extinctionState.monthsUntilExtinction = 36; // 3 years of slow collapse
        state.extinctionState.description = 'Groundwater reserves depleted. No alternative water sources. Agricultural collapse. Global famine over 36 months.';
      }
    }
  }
}

/**
 * Check if freshwater breakthrough technologies should unlock
 */
export function checkFreshwaterTechUnlocks(state: GameState): void {
  if (!state.freshwaterSystem || !state.breakthroughTech) return;
  
  const fw = state.freshwaterSystem;
  const tech = state.breakthroughTech;
  const avgAICapability = state.aiAgents.length > 0
    ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length
    : 0;
  const totalResearch = state.government.researchInvestments.physical +
    state.government.researchInvestments.digital +
    state.government.researchInvestments.cognitive +
    state.government.researchInvestments.social;
  
  // === 1. ADVANCED DESALINATION ===
  // Already operational, just needs scale-up
  if (!tech.advancedDesalination?.unlocked) {
    if (avgAICapability > 1.5 && totalResearch > 75) {
      tech.advancedDesalination = {
        unlocked: true,
        deploymentLevel: 0.0,
        breakthroughYear: Math.floor(state.currentMonth / 12) + 2025
      };
      console.log(`🔬 BREAKTHROUGH: Advanced Desalination`);
      console.log(`   AI-optimized energy efficiency (50% cost reduction)`);
      console.log(`   Cost: $200B for global coastal deployment`);
    }
  }
  
  // === 2. WATER RECYCLING SYSTEMS ===
  // Industrial & domestic wastewater recovery
  if (!tech.waterRecycling?.unlocked) {
    if (avgAICapability > 2.0 && totalResearch > 100) {
      tech.waterRecycling = {
        unlocked: true,
        deploymentLevel: 0.0,
        breakthroughYear: Math.floor(state.currentMonth / 12) + 2025
      };
      console.log(`🔬 BREAKTHROUGH: Advanced Water Recycling`);
      console.log(`   95% wastewater recovery for non-potable uses`);
      console.log(`   Industrial + domestic water reuse`);
    }
  }
  
  // === 3. PRECISION IRRIGATION ===
  // AI-optimized crop watering
  if (!tech.precisionIrrigation?.unlocked) {
    if (avgAICapability > 2.5 && totalResearch > 125) {
      tech.precisionIrrigation = {
        unlocked: true,
        deploymentLevel: 0.0,
        breakthroughYear: Math.floor(state.currentMonth / 12) + 2025
      };
      console.log(`🔬 BREAKTHROUGH: AI Precision Irrigation`);
      console.log(`   Sensor networks + ML optimization`);
      console.log(`   40% agricultural water use reduction`);
    }
  }
  
  // === 4. ATMOSPHERIC WATER GENERATION ===
  // Harvesting water from air humidity
  if (!tech.atmosphericWater?.unlocked) {
    if (avgAICapability > 3.0 && totalResearch > 200) {
      tech.atmosphericWater = {
        unlocked: true,
        deploymentLevel: 0.0,
        breakthroughYear: Math.floor(state.currentMonth / 12) + 2025
      };
      console.log(`🔬 BREAKTHROUGH: Atmospheric Water Generation`);
      console.log(`   Harvests water from air humidity`);
      console.log(`   Works in arid regions (game-changer!)`);
    }
  }
  
  // === AUTO-DEPLOYMENT ===
  // Simulate market/government adoption
  
  if (tech.advancedDesalination?.unlocked && fw.waterStress > 0.50) {
    // Water scarcity motivates desalination (coastal areas)
    const adoptionRate = 0.015; // 1.5%/month
    fw.desalinationDeployment = Math.min(1.0, fw.desalinationDeployment + adoptionRate);
  }
  
  if (tech.waterRecycling?.unlocked && fw.waterStress > 0.40) {
    // Recycling adopted for economic + environmental reasons
    const adoptionRate = 0.020; // 2%/month
    fw.recyclingDeployment = Math.min(1.0, fw.recyclingDeployment + adoptionRate);
  }
  
  if (tech.precisionIrrigation?.unlocked) {
    // Farmers adopt gradually (cost savings)
    const adoptionRate = 0.012; // 1.2%/month
    fw.precisionIrrigationDeployment = Math.min(1.0, fw.precisionIrrigationDeployment + adoptionRate);
  }
  
  if (tech.atmosphericWater?.unlocked && fw.blueWater.groundwater < 0.40) {
    // Deployed in water-scarce regions
    const adoptionRate = 0.008; // 0.8%/month (expensive, slow rollout)
    fw.atmosphericWaterDeployment = Math.min(1.0, fw.atmosphericWaterDeployment + adoptionRate);
  }
}


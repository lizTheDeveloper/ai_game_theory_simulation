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
import { assertStateProperty, assertProbability, assertInRange, assertFinite } from './utils/assertions';

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
export function updateFreshwaterSystem(state: GameState, rng: () => number): void {
  if (!state.freshwaterSystem) return;

  const fw = state.freshwaterSystem;
  const economicStage = state.globalMetrics.economicTransitionStage;
  const climateStability = assertStateProperty(
    state.environmentalAccumulation,
    'climateStability',
    { location: 'updateFreshwaterSystem', month: state.currentMonth }
  );
  const population = 8.0; // Billion people (approximate)
  
  // === GROUNDWATER DEPLETION ===
  // Research: 68% of water loss is groundwater, >0.5 m/year in dry croplands
  
  // Base depletion rate scales with economic activity
  let groundwaterDepletion = assertFinite(
    economicStage * 0.006, // 0.6%/month at Stage 1, 2.4%/month at Stage 4
    { location: 'updateFreshwaterSystem_groundwater', valueName: 'groundwaterDepletion_base', month: state.currentMonth }
  );

  // Agricultural demand drives depletion (70% of use)
  const agriculturalMultiplier = assertFinite(
    fw.demand.agricultural * 1.5,
    { location: 'updateFreshwaterSystem_groundwater', valueName: 'agriculturalMultiplier', month: state.currentMonth }
  );
  groundwaterDepletion = assertFinite(
    groundwaterDepletion * agriculturalMultiplier,
    { location: 'updateFreshwaterSystem_groundwater', valueName: 'groundwaterDepletion_agri', month: state.currentMonth }
  );

  // Climate stress accelerates depletion (droughts = more pumping)
  const climateStress = assertProbability(
    1.0 - climateStability,
    { location: 'updateFreshwaterSystem_groundwater', valueName: 'climateStress', month: state.currentMonth }
  );
  groundwaterDepletion = assertFinite(
    groundwaterDepletion * (1.0 + climateStress * 0.5),
    { location: 'updateFreshwaterSystem_groundwater', valueName: 'groundwaterDepletion_climate', month: state.currentMonth }
  );

  // HIGH-4 INTEGRATION (Nov 15, 2025): Ocean acidification → Desalination efficiency
  // Research:
  // - Kim et al. (2020): Ocean acidification increases reverse osmosis membrane fouling
  // - Remize et al. (2022): pH affects pretreatment costs and membrane lifespan
  // - Baseline ocean pH: ~8.1 (pre-industrial 8.2)
  // - Severe acidification: pH < 7.8 (reduces desalination efficiency 20-30%)
  //
  // Mechanism: Lower pH → higher ionic concentrations → membrane fouling → reduced efficiency
  // Impact: Desalination becomes less effective as ocean acidifies
  //
  // NOTE: pHLevel in state is NORMALIZED [0.90-1.00]:
  // - 1.00 = healthy (pH ~8.2)
  // - 0.95 = baseline (pH ~8.1)
  // - 0.90 = severe (pH ~7.8)
  let desalinationEfficiency = 1.0; // Start with 100% efficiency

  if (state.oceanAcidificationSystem) {
    const pHNormalized = state.oceanAcidificationSystem.pHLevel;
    const baselinePHNorm = 0.95; // Corresponds to pH 8.1

    // Efficiency penalty when normalized pH drops below baseline
    if (pHNormalized < baselinePHNorm) {
      // Linear penalty: 0% at 0.95 (pH 8.1), 50% at 0.90 (pH 7.8)
      // Formula: penalty = (0.95 - pHNormalized) / 0.05 * 0.5
      // At 0.92 (~pH 7.9): (0.95 - 0.92) / 0.05 * 0.5 = 0.30 (30% penalty)
      // At 0.90 (~pH 7.8): (0.95 - 0.90) / 0.05 * 0.5 = 0.50 (50% penalty)
      const pHDrop = baselinePHNorm - pHNormalized;
      const efficiencyPenalty = Math.min(0.50, (pHDrop / 0.05) * 0.5);
      desalinationEfficiency = 1.0 - efficiencyPenalty;

      // Log significant efficiency loss (>10%)
      if (efficiencyPenalty > 0.10 && state.currentMonth % 12 === 0) {
        // Convert normalized pH to actual pH for display: pH = 7.8 + (pHNorm - 0.9) * 4
        const actualPH = 7.8 + (pHNormalized - 0.90) * 4.0;
        console.log(`\n🌊⚡ OCEAN ACIDIFICATION: Desalination efficiency reduced`);
        console.log(`   Ocean pH: ${actualPH.toFixed(2)} (baseline 8.1)`);
        console.log(`   Normalized pH: ${pHNormalized.toFixed(3)}`);
        console.log(`   Efficiency penalty: ${(efficiencyPenalty * 100).toFixed(0)}%`);
        console.log(`   Remaining efficiency: ${(desalinationEfficiency * 100).toFixed(0)}%`);
      }
    }
  }

  // Technology reduces depletion (with acidification penalty applied to desalination)
  const techEfficiency = assertProbability(
    1.0 - (
      fw.precisionIrrigationDeployment * 0.3 +  // 30% reduction at full deployment
      fw.recyclingDeployment * 0.2 +            // 20% reduction
      fw.desalinationDeployment * 0.15 * desalinationEfficiency  // 15% offset (coastal), reduced by acidification
    ),
    { location: 'updateFreshwaterSystem_groundwater', valueName: 'techEfficiency', month: state.currentMonth }
  );
  groundwaterDepletion = assertFinite(
    groundwaterDepletion * techEfficiency,
    { location: 'updateFreshwaterSystem_groundwater', valueName: 'groundwaterDepletion_final', month: state.currentMonth }
  );
  
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
    console.warn(`⚠️ PEAK GROUNDWATER: Depletion phase begins (Month ${state.currentMonth})`);
    console.log(`   Groundwater: ${(fw.blueWater.groundwater * 100).toFixed(0)}%`);
    console.log(`   Water stress: ${(fw.waterStress * 100).toFixed(0)}%`);
    
    // After peak, forced reduction in irrigation (30% cut)
    fw.demand.agricultural = Math.max(0.50, fw.demand.agricultural * 0.70);
    console.log(`   Agricultural water use cut to ${(fw.demand.agricultural * 100).toFixed(0)}%`);
  }
  
  // === WATER STRESS CALCULATION ===
  // Stress = (demand - supply) / demand
  const totalSupply = assertProbability(
    (fw.blueWater.groundwater + fw.blueWater.surfaceWater + fw.greenWater.soilMoisture) / 3,
    { location: 'updateFreshwaterSystem_stress', valueName: 'totalSupply', month: state.currentMonth }
  );
  const totalDemand = assertFinite(
    1.0 + (economicStage * 0.2), // Demand increases with development
    { location: 'updateFreshwaterSystem_stress', valueName: 'totalDemand', month: state.currentMonth }
  );

  // Protect against division by zero
  if (totalDemand === 0) {
    throw new Error(`❌ [updateFreshwaterSystem_stress] totalDemand is zero (Month ${state.currentMonth})`);
  }

  fw.waterStress = assertProbability(
    Math.max(0, Math.min(1.0, 1.0 - (totalSupply / totalDemand))),
    { location: 'updateFreshwaterSystem_stress', valueName: 'waterStress', month: state.currentMonth }
  );
  
  // Population under stress increases with water stress
  // Oct 16, 2025: Cap at 60% per WRI Aqueduct/IPCC research
  // Even in worst-case scenarios, water-rich regions (Canada, Nordic, etc.) remain stable
  fw.populationStressed = Math.min(0.60, 0.41 + (fw.waterStress * 0.4)); // 41% baseline → 60% max (was 81%)
  
  // === REGIONAL DYNAMICS ===
  // Different regions collapse at different rates

  // Middle East: Highly stressed, fast depletion
  // HIGH-4 INTEGRATION: Ocean acidification reduces desalination effectiveness here too
  fw.regions.middleEast = assertProbability(
    Math.max(0, fw.regions.middleEast - 0.008 * (1.0 - fw.desalinationDeployment * 0.5 * desalinationEfficiency)),
    { location: 'updateFreshwaterSystem_regional', valueName: 'middleEast', month: state.currentMonth }
  );

  // North Africa: Very stressed, moderate depletion
  fw.regions.northAfrica = assertProbability(
    Math.max(0, fw.regions.northAfrica - 0.006 * (1.0 - fw.recyclingDeployment * 0.3)),
    { location: 'updateFreshwaterSystem_regional', valueName: 'northAfrica', month: state.currentMonth }
  );

  // South Asia: Moderately stressed, agriculture-driven
  fw.regions.southAsia = assertProbability(
    Math.max(0, fw.regions.southAsia - 0.005 * (1.0 - fw.precisionIrrigationDeployment * 0.4)),
    { location: 'updateFreshwaterSystem_regional', valueName: 'southAsia', month: state.currentMonth }
  );

  // Global average
  fw.regions.global = assertProbability(
    (fw.regions.middleEast + fw.regions.northAfrica + fw.regions.southAsia + fw.blueWater.groundwater) / 4,
    { location: 'updateFreshwaterSystem_regional', valueName: 'global', month: state.currentMonth }
  );
  
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
    dayZeroProbability = assertProbability(
      dayZeroProbability,
      { location: 'updateFreshwaterSystem_dayZero', valueName: 'dayZeroProbability', month: state.currentMonth }
    );
    
    if (rng() < dayZeroProbability) {
      // Trigger Day Zero Drought
      const regions = ['Middle East', 'North Africa', 'South Asia'];
      const regionValues = [fw.regions.middleEast, fw.regions.northAfrica, fw.regions.southAsia];
      const mostStressedIndex = regionValues.indexOf(Math.min(...regionValues));

      fw.dayZeroDrought = {
        active: true,
        region: regions[mostStressedIndex],
        duration: assertFinite(
          12 + Math.floor(rng() * 24), // 12-36 months
          { location: 'updateFreshwaterSystem_dayZero', valueName: 'duration', month: state.currentMonth }
        ),
        severity: assertProbability(
          0.7 + rng() * 0.3, // 0.7-1.0
          { location: 'updateFreshwaterSystem_dayZero', valueName: 'severity', month: state.currentMonth }
        ),
      };
      
      console.log(`🚨 DAY ZERO DROUGHT: ${fw.dayZeroDrought.region}`);
      console.log(`   Compound extremes: All three conditions present`);
      console.log(`   Severity: ${(fw.dayZeroDrought.severity * 100).toFixed(0)}%`);
      console.log(`   Duration: ${fw.dayZeroDrought.duration} months`);
      console.log(`   Regional water: ${(regionValues[mostStressedIndex] * 100).toFixed(0)}%`);
      
      // Immediate impacts
      state.qualityOfLifeSystems.materialAbundance = Math.max(0.1, state.qualityOfLifeSystems.materialAbundance - 0.08);
      const currentHealthcareQuality = assertStateProperty(
        state.qualityOfLifeSystems,
        'healthcareQuality',
        { location: 'updateFreshwaterSystem[day zero drought]', month: state.currentMonth }
      );
      state.qualityOfLifeSystems.healthcareQuality = Math.max(0.1, currentHealthcareQuality - 0.05);
      const currentTrust = assertStateProperty(
        state.society,
        'trust',
        { location: 'updateFreshwaterSystem[day zero drought]', month: state.currentMonth }
      );
      state.society.trust = currentTrust - 0.04;
      // Economic impact handled through materialAbundance reduction
      
      // Regional collapse effects
      if (state.environmentalAccumulation) {
        state.environmentalAccumulation.resourceReserves = Math.max(0, 
          state.environmentalAccumulation.resourceReserves - 0.05
        );
      }
    }
  } else {
    // Day Zero drought is active - ongoing impacts
    const monthlyFoodImpact = assertProbability(
      fw.dayZeroDrought.severity * 0.015, // Up to 1.5%/month
      { location: 'updateFreshwaterSystem_dayZero_active', valueName: 'monthlyFoodImpact', month: state.currentMonth }
    );
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
    const foodImpact = assertProbability(
      (fw.waterStress - 0.50) * 0.012, // Up to 0.6%/month at max stress
      { location: 'updateFreshwaterSystem_foodImpact', valueName: 'foodImpact', month: state.currentMonth }
    );
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
  
  // === GRADUAL COLLAPSE (Oct 20, 2025 - Replaced instant extinction) ===
  // Water stress now causes: trapped populations → excess mortality → gradual decline
  // NOT instant extinction trigger - that's handled via refugee/trapped population systems
  // This keeps the pressure on material abundance and food systems

  // Severe depletion increases trapped populations and mortality (handled in trappedPopulations.ts)
  // Agricultural impact on material abundance (unchanged)
  if (fw.blueWater.groundwater < 0.20 && fw.waterStress > 0.70) {
    // Agricultural productivity decline
    const hasAlternatives = (fw.desalinationDeployment + fw.recyclingDeployment + fw.atmosphericWaterDeployment) > 0.50;

    if (!hasAlternatives) {
      // Gradual agricultural decline (not instant collapse)
      const agriculturalStress = assertProbability(
        (0.70 - fw.blueWater.groundwater) / 0.70, // 0 at 70%, 1.0 at 0%
        { location: 'updateFreshwaterSystem_collapse', valueName: 'agriculturalStress', month: state.currentMonth }
      );
      const monthlyProductivityLoss = assertProbability(
        agriculturalStress * 0.01, // Up to 1%/month at total depletion
        { location: 'updateFreshwaterSystem_collapse', valueName: 'monthlyProductivityLoss', month: state.currentMonth }
      );

      state.qualityOfLifeSystems.materialAbundance = Math.max(0,
        state.qualityOfLifeSystems.materialAbundance - monthlyProductivityLoss
      );

      // Log severe stress (but not extinction trigger)
      if (fw.blueWater.groundwater < 0.10 && state.currentMonth % 12 === 0) {
        console.log(`💧 SEVERE FRESHWATER STRESS:`);
        console.log(`   Groundwater: ${(fw.blueWater.groundwater * 100).toFixed(0)}%`);
        console.log(`   Agricultural productivity declining: -${(monthlyProductivityLoss * 100).toFixed(1)}%/month`);
        console.log(`   Material abundance: ${(state.qualityOfLifeSystems.materialAbundance * 100).toFixed(0)}%`);
        console.warn(`   ⚠️ Trapped populations experiencing excess mortality`);
      }
    }
  }
}

/**
 * Check if freshwater breakthrough technologies should unlock
 */
export function checkFreshwaterTechUnlocks(state: GameState): void {
  // NOTE: Tech unlocking now handled by TechTreePhase
  // This function is deprecated but kept for backward compatibility
  if (!state.freshwaterSystem) return;
  return; // Early return - tech tree handles all unlocking now
  
  const fw = state.freshwaterSystem;
  const tech: any = state.techTreeState; // NOTE: This code is unreachable due to early return above
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


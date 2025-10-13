/**
 * Specific Tipping Points System - Realistic Timeline Recalibration
 * 
 * Models specific Earth system tipping points with realistic timelines:
 * - Amazon Rainforest: 25% deforestation → 50-year transition to savanna
 * - Coral Reefs: Ocean acidification → 15-year mass die-off
 * - Insect Pollinators: 65% decline → agricultural crisis
 * - Permafrost Thaw: 2050+ major carbon release
 * - AMOC Weakening: 2080-2100 potential collapse
 * 
 * Research basis:
 * - Lenton et al. 2019, Nature Climate Change: "Climate tipping points"
 * - Armstrong McKay et al. 2022, Science: "Exceeding 1.5°C global warming"
 * - IPCC AR6 2021-2023: Regional tipping point assessments
 * - Ripple et al. 2020: "World Scientists' Warning of a Climate Emergency"
 */

import { GameState } from '@/types/game';

/**
 * Amazon Rainforest Tipping Point
 * 
 * Current: ~20% deforested (as of 2025)
 * Tipping Point: 20-25% deforestation (uncertainty range)
 * Post-Trigger: 50-year transition from rainforest → tropical savanna
 * Carbon Release: Up to 200 Gt CO2 (equivalent to ~20 years current emissions)
 * Regional Impact: South America (especially Brazil, Peru, Colombia)
 * Global Impact: +0.2-0.3°C warming, disrupted rainfall patterns Africa/Asia
 * 
 * Research: Lovejoy & Nobre 2018, 2019; Staal et al. 2020
 */
interface AmazonTippingPoint {
  deforestation: number; // 0-100% deforested
  tippingThreshold: number; // 25% threshold
  triggered: boolean;
  triggeredAt: number; // Month when triggered
  transitionProgress: number; // 0-100% transition to savanna
  carbonReleased: number; // Gt CO2 released so far
  regionallyAffected: string[]; // Countries/regions impacted
}

/**
 * Coral Reef System Collapse
 * 
 * Current: ~70% global health (30% already degraded/bleached)
 * Tipping Point: Aragonite saturation < 3.5 (ocean acidification threshold)
 * Post-Trigger: 15-year mass die-off (by 2055 if triggered 2040)
 * Impact: 25-30% of marine species lose habitat, fisheries collapse
 * Regional Impact: Pacific islands, Southeast Asia, Caribbean, Great Barrier Reef
 * Global Impact: 3 billion people depend on marine protein
 * 
 * Research: Hoegh-Guldberg et al. 2017; Hughes et al. 2018; IPCC SR15
 */
interface CoralReefSystem {
  healthPercentage: number; // 0-100% global coral health
  tippingThreshold: number; // Aragonite < 3.5 or regular mass bleaching
  triggered: boolean;
  triggeredAt: number;
  collapseProgress: number; // 0-100% of die-off complete
  fisheryCollapseLevel: number; // 0-1 (impacts food security)
  regionallyAffected: string[]; // Island nations, coastal states
}

/**
 * Insect Pollinator Collapse
 * 
 * Current: ~60% of 1970 levels (40% decline already)
 * Critical Threshold: 35% of baseline (65% total decline)
 * Impact: 35% of global food production depends on pollinators
 * Timeline: Gradual decline 1-2%/year, crisis if threshold crossed
 * Regional Impact: Agricultural regions globally, but tropics have higher diversity
 * 
 * Research: Sánchez-Bayo & Wyckhuys 2019; IPBES 2019; Wagner 2020
 */
interface PollinatorSystem {
  populationPercentage: number; // Current level (60% of 1970)
  criticalThreshold: number; // 35% = crisis
  triggered: boolean;
  triggeredAt: number;
  foodProductionLoss: number; // 0-0.35 (up to 35% food loss)
  regionallyAffected: string[]; // Agricultural breadbaskets
}

/**
 * Permafrost Thaw & Carbon Release
 * 
 * Current: Early-stage thaw (small releases)
 * Major Release: 2050-2100 (if warming continues)
 * Carbon Stored: ~1,400 Gt C (double atmosphere's carbon)
 * Potential Release: 10-30% by 2100 = 140-420 Gt CO2e
 * Feedback: Released carbon → more warming → more thaw
 * Regional Impact: Arctic regions (Russia, Canada, Alaska)
 * Global Impact: +0.1-0.3°C additional warming by 2100
 * 
 * Research: Schuur et al. 2015; Turetsky et al. 2020; IPCC AR6
 */
interface PermafrostSystem {
  carbonStored: number; // 1,400 Gt C total
  carbonReleased: number; // Gt CO2e released so far
  thawRate: number; // % per year (accelerates with temperature)
  triggered: boolean; // Major release phase
  triggeredAt: number;
  regionallyAffected: string[]; // Arctic nations
}

/**
 * Atlantic Meridional Overturning Circulation (AMOC)
 * 
 * Current: ~85% of historical strength (15% weakening since 1970)
 * Collapse Threshold: 60% of historical (24-39% additional weakening)
 * Timeline: Earliest 2080-2100, more likely post-2100
 * Impact: Europe cools 3-5°C, Africa/Americas droughts, sea level rise
 * Regional Impact: Europe, West Africa, Eastern Americas
 * Global Impact: Massive weather disruption, agriculture collapse in affected regions
 * 
 * Research: Caesar et al. 2018; Boers 2021; Armstrong McKay et al. 2022
 */
interface AMOCSystem {
  strength: number; // % of historical (currently 85%)
  collapseThreshold: number; // 60% = collapse risk
  triggered: boolean;
  triggeredAt: number;
  regionallyAffected: string[]; // Europe, Africa, Americas
}

/**
 * Initialize specific tipping point systems
 */
export function initializeSpecificTippingPoints(): {
  amazon: AmazonTippingPoint;
  coral: CoralReefSystem;
  pollinators: PollinatorSystem;
  permafrost: PermafrostSystem;
  amoc: AMOCSystem;
} {
  return {
    amazon: {
      deforestation: 20, // Current real-world level (2025)
      tippingThreshold: 25, // Lovejoy & Nobre 2018
      triggered: false,
      triggeredAt: -1,
      transitionProgress: 0,
      carbonReleased: 0,
      regionallyAffected: ['Brazil', 'Peru', 'Colombia', 'Venezuela', 'Ecuador', 'Bolivia'],
    },
    
    coral: {
      healthPercentage: 70, // 30% already degraded
      tippingThreshold: 30, // Critical threshold
      triggered: false,
      triggeredAt: -1,
      collapseProgress: 0,
      fisheryCollapseLevel: 0,
      regionallyAffected: ['Pacific Islands', 'Australia', 'Indonesia', 'Philippines', 'Caribbean', 'East Africa'],
    },
    
    pollinators: {
      populationPercentage: 60, // 40% decline from 1970
      criticalThreshold: 35, // 65% total decline = crisis
      triggered: false,
      triggeredAt: -1,
      foodProductionLoss: 0,
      regionallyAffected: ['North America', 'Europe', 'China', 'India', 'Brazil', 'Sub-Saharan Africa'],
    },
    
    permafrost: {
      carbonStored: 1400, // Gt C
      carbonReleased: 0,
      thawRate: 0,
      triggered: false,
      triggeredAt: -1,
      regionallyAffected: ['Russia', 'Canada', 'Alaska', 'Scandinavia', 'Greenland'],
    },
    
    amoc: {
      strength: 85, // 15% weaker than 1970
      collapseThreshold: 60, // 24-39% additional weakening
      triggered: false,
      triggeredAt: -1,
      regionallyAffected: ['Europe', 'West Africa', 'Eastern Americas', 'Caribbean'],
    },
  };
}

/**
 * Update Amazon rainforest system each month
 */
export function updateAmazonRainforest(state: GameState): void {
  if (!state.specificTippingPoints) return;
  
  const amazon = state.specificTippingPoints.amazon;
  const env = state.environmentalAccumulation;
  
  // Deforestation rate influenced by:
  // - Economic stage (more development = more deforestation pressure)
  // - Resource extraction (mining, agriculture expansion)
  // - Climate feedback (drought makes trees die faster)
  // - Government intervention (protection policies)
  
  let deforestationRate = 0.04; // Baseline: 0.5%/year = 0.04%/month
  
  // Economic pressure
  deforestationRate += state.globalMetrics.economicTransitionStage * 0.01;
  
  // Resource extraction pressure
  deforestationRate += (1 - env.resourceReserves) * 0.02;
  
  // Climate feedback (drought accelerates die-off)
  deforestationRate += (1 - env.climateStability) * 0.03;
  
  // TIER 2.9: Government intervention - Amazon protection
  if (state.government?.environmentalInterventions?.amazonProtection?.active) {
    const intervention = state.government.environmentalInterventions.amazonProtection;
    deforestationRate *= (1 - intervention.deforestationReduction); // 50% reduction
  }
  
  // Apply deforestation
  amazon.deforestation = Math.min(100, amazon.deforestation + deforestationRate);
  
  // Check for tipping point
  if (amazon.deforestation >= amazon.tippingThreshold && !amazon.triggered) {
    amazon.triggered = true;
    amazon.triggeredAt = state.currentMonth;
    
    try {
      console.log(`\n🌲 AMAZON TIPPING POINT CROSSED (Month ${state.currentMonth})`);
      console.log(`   Deforestation: ${amazon.deforestation.toFixed(1)}%`);
      console.log(`   Impact: 50-year transition to savanna begins`);
      console.log(`   Regional: South America - rainfall disruption, carbon release`);
      console.log(`   Global: Up to 200 Gt CO2 release, +0.2-0.3°C warming\n`);
    } catch (e) { /* Ignore EPIPE */ }
    
    state.eventLog.push({
      type: 'crisis',
      month: state.currentMonth,
      description: `Amazon Tipping Point: ${amazon.deforestation.toFixed(1)}% deforested`,
      impact: 'Rainforest → savanna transition begins (50-year process)'
    });
  }
  
  // Post-trigger: Transition to savanna over 50 years (600 months)
  if (amazon.triggered) {
    const monthsSince = state.currentMonth - amazon.triggeredAt;
    amazon.transitionProgress = Math.min(100, (monthsSince / 600) * 100);
    
    // Carbon release accelerates as trees die
    // 200 Gt CO2 over 50 years = 4 Gt/year = 0.33 Gt/month
    const carbonReleaseRate = 0.33 * (amazon.transitionProgress / 100); // Accelerates over time
    amazon.carbonReleased += carbonReleaseRate;
    
    // Regional impacts: South America first
    if (monthsSince % 12 === 0 && monthsSince < 120) { // First 10 years
      // Regional droughts, agricultural disruption
      const { addAcuteCrisisDeaths } = require('./populationDynamics');
      addAcuteCrisisDeaths(state, 0.0002, 'Amazon collapse - regional drought/agriculture (South America)', 0.02, 'climate');
    }
    
    // Global climate feedback
    // Released carbon accelerates warming
    env.climateStability = Math.max(0, env.climateStability - (carbonReleaseRate * 0.0001));
    
    // Biodiversity impact (Amazon holds 10% of world's species)
    env.biodiversityIndex = Math.max(0, env.biodiversityIndex - 0.0001);
    
    // Log milestone
    if (monthsSince === 120) { // 10 years
      try {
        console.log(`\n🌲 AMAZON COLLAPSE: 10-year milestone (Month ${state.currentMonth})`);
        console.log(`   Transition: ${amazon.transitionProgress.toFixed(1)}% complete`);
        console.log(`   Carbon released: ${amazon.carbonReleased.toFixed(1)} Gt CO2`);
        console.log(`   Regional impacts spreading to Central America, Andes\n`);
      } catch (e) { /* Ignore EPIPE */ }
    }
    
    if (monthsSince === 600) { // 50 years - completion
      try {
        console.log(`\n🌲 AMAZON COLLAPSE: Transition complete (Month ${state.currentMonth})`);
        console.log(`   Former rainforest now tropical savanna`);
        console.log(`   Total carbon released: ${amazon.carbonReleased.toFixed(1)} Gt CO2`);
        console.log(`   Irreversible on human timescales\n`);
      } catch (e) { /* Ignore EPIPE */ }
    }
  }
}

/**
 * Update coral reef system each month
 */
export function updateCoralReefs(state: GameState): void {
  if (!state.specificTippingPoints) return;
  
  const coral = state.specificTippingPoints.coral;
  const env = state.environmentalAccumulation;
  const ocean = state.oceanAcidificationSystem;
  
  // Coral health degradation from:
  // - Ocean acidification (aragonite saturation < 3.5)
  // - Warming oceans (bleaching events)
  // - Pollution
  // - Government restoration (coral nurseries, alkalinity enhancement)
  
  let healthDeclineRate = 0.08; // Baseline: ~1%/year = 0.08%/month
  
  // Ocean acidification impact
  if (ocean) {
    if (ocean.aragoniteSaturation < 3.5) {
      healthDeclineRate += (3.5 - ocean.aragoniteSaturation) * 0.1; // Accelerates below threshold
    }
  }
  
  // Climate warming (bleaching)
  healthDeclineRate += (1 - env.climateStability) * 0.15;
  
  // Pollution stress
  healthDeclineRate += env.pollutionLevel * 0.05;
  
  // TIER 2.9: Government intervention - Coral restoration
  if (state.government?.environmentalInterventions?.coralRestoration?.active) {
    const intervention = state.government.environmentalInterventions.coralRestoration;
    // Convert decline to recovery
    healthDeclineRate -= intervention.restorationBoost; // 0.3%/month boost
  }
  
  // Apply health decline
  coral.healthPercentage = Math.max(0, coral.healthPercentage - healthDeclineRate);
  
  // Check for tipping point
  if (coral.healthPercentage < coral.tippingThreshold && !coral.triggered) {
    coral.triggered = true;
    coral.triggeredAt = state.currentMonth;
    
    try {
      console.log(`\n🪸 CORAL REEF TIPPING POINT CROSSED (Month ${state.currentMonth})`);
      console.log(`   Global coral health: ${coral.healthPercentage.toFixed(1)}%`);
      console.log(`   Impact: 15-year mass die-off begins`);
      console.log(`   Regional: Pacific islands, Caribbean, SE Asia, Australia`);
      console.log(`   Global: 25% of marine species, 3B people food security\n`);
    } catch (e) { /* Ignore EPIPE */ }
    
    state.eventLog.push({
      type: 'crisis',
      month: state.currentMonth,
      description: `Coral Reef Collapse: ${coral.healthPercentage.toFixed(1)}% health`,
      impact: 'Mass die-off begins (15-year process), fisheries collapsing'
    });
  }
  
  // Post-trigger: Die-off over 15 years (180 months)
  if (coral.triggered) {
    const monthsSince = state.currentMonth - coral.triggeredAt;
    coral.collapseProgress = Math.min(100, (monthsSince / 180) * 100);
    coral.healthPercentage = Math.max(5, 100 - coral.collapseProgress); // Floor at 5% (some survive)
    
    // Fishery collapse proportional to coral loss
    coral.fisheryCollapseLevel = coral.collapseProgress / 100;
    
    // Regional impacts: Island nations and coastal states
    if (monthsSince % 6 === 0 && monthsSince < 180) { // Every 6 months
      // Food security crisis in marine-dependent regions
      const mortalityRate = 0.0001 * (coral.collapseProgress / 100); // Escalates with collapse
      const { addAcuteCrisisDeaths } = require('./populationDynamics');
      addAcuteCrisisDeaths(state, mortalityRate, 'Coral collapse - fishery failure (Pacific/islands)', 0.10, 'famine');
    }
    
    // Global biodiversity impact (25-30% of marine species)
    env.biodiversityIndex = Math.max(0, env.biodiversityIndex - 0.00005);
    
    // Ocean health metric
    if (state.planetaryBoundariesSystem) {
      // Coral supports 25% of marine life
      state.planetaryBoundariesSystem.boundaries.novel_entities.currentValue += 0.001; // Marine pollution from ecosystem breakdown
    }
    
    // Log milestone
    if (monthsSince === 90) { // 7.5 years (halfway)
      try {
        console.log(`\n🪸 CORAL COLLAPSE: Halfway point (Month ${state.currentMonth})`);
        console.log(`   Collapse: ${coral.collapseProgress.toFixed(1)}% complete`);
        console.log(`   Fishery collapse: ${(coral.fisheryCollapseLevel * 100).toFixed(1)}%`);
        console.log(`   Pacific islands declaring famine emergencies\n`);
      } catch (e) { /* Ignore EPIPE */ }
    }
    
    if (monthsSince === 180) { // 15 years - completion
      try {
        console.log(`\n🪸 CORAL COLLAPSE: Complete (Month ${state.currentMonth})`);
        console.log(`   Global coral reefs: ${coral.healthPercentage.toFixed(1)}% remaining (95% dead)`);
        console.log(`   Marine biodiversity catastrophe`);
        console.log(`   3 billion people lost primary protein source\n`);
      } catch (e) { /* Ignore EPIPE */ }
    }
  }
}

/**
 * Update insect pollinator system each month
 */
export function updatePollinators(state: GameState): void {
  if (!state.specificTippingPoints) return;
  
  const pollinators = state.specificTippingPoints.pollinators;
  const env = state.environmentalAccumulation;
  
  // Pollinator decline from:
  // - Habitat loss (agricultural expansion)
  // - Pesticides (novel entities)
  // - Climate disruption
  // - Government intervention (pesticide bans)
  
  let declineRate = 0.1; // Baseline: 1-2%/year = 0.1%/month
  
  // Habitat loss
  declineRate += (1 - env.biodiversityIndex) * 0.05;
  
  // Chemical pollution (pesticides, neonicotinoids)
  if (state.novelEntitiesSystem) {
    declineRate += state.novelEntitiesSystem.pfasContamination * 0.08;
  } else {
    declineRate += env.pollutionLevel * 0.06;
  }
  
  // Climate stress (temperature extremes, droughts)
  declineRate += (1 - env.climateStability) * 0.04;
  
  // TIER 2.9: Government intervention - Pesticide ban
  if (state.government?.environmentalInterventions?.pesticideBan?.active) {
    const intervention = state.government.environmentalInterventions.pesticideBan;
    // Convert decline to recovery
    declineRate -= intervention.pollinatorRecoveryBoost; // 0.5%/month boost
  }
  
  // Apply decline
  pollinators.populationPercentage = Math.max(0, pollinators.populationPercentage - declineRate);
  
  // Check for critical threshold
  if (pollinators.populationPercentage < pollinators.criticalThreshold && !pollinators.triggered) {
    pollinators.triggered = true;
    pollinators.triggeredAt = state.currentMonth;
    
    try {
      console.log(`\n🦋 POLLINATOR COLLAPSE THRESHOLD (Month ${state.currentMonth})`);
      console.log(`   Pollinator population: ${pollinators.populationPercentage.toFixed(1)}% of 1970 levels`);
      console.log(`   Impact: Agricultural crisis begins - 35% of food production at risk`);
      console.log(`   Regional: All agricultural regions globally`);
      console.log(`   Crops affected: Fruits, vegetables, nuts, coffee, cocoa\n`);
    } catch (e) { /* Ignore EPIPE */ }
    
    state.eventLog.push({
      type: 'crisis',
      month: state.currentMonth,
      description: `Pollinator Collapse: ${pollinators.populationPercentage.toFixed(1)}% remaining`,
      impact: 'Agricultural crisis - 35% food production failing'
    });
  }
  
  // Post-trigger: Food production loss proportional to pollinator decline
  if (pollinators.triggered) {
    // 35% of food depends on pollinators
    // At critical threshold (35%), we've lost 65% of pollinators
    // Food loss = (65% decline / 65% at threshold) * 35% = 0% to 35%
    const declinePercent = (60 - pollinators.populationPercentage) / 65; // 0 to 1
    pollinators.foodProductionLoss = Math.min(0.35, declinePercent * 0.35);
    
    // Regional famine impacts (agricultural breadbaskets hit first)
    const monthsSince = state.currentMonth - pollinators.triggeredAt;
    if (monthsSince % 3 === 0) { // Every 3 months
      const mortalityRate = pollinators.foodProductionLoss * 0.01; // Up to 0.35% per quarter
      const { addAcuteCrisisDeaths } = require('./populationDynamics');
      addAcuteCrisisDeaths(state, mortalityRate, 'Pollinator collapse - crop failure (agricultural regions)', 0.60, 'famine');
    }
    
    // Material abundance impact (food scarcity)
    const qol = state.qualityOfLifeSystems;
    qol.materialAbundance = Math.max(0.3, qol.materialAbundance - pollinators.foodProductionLoss * 0.01);
    
    // Log annual updates
    if (monthsSince % 12 === 0 && monthsSince > 0) {
      try {
        console.log(`\n🦋 POLLINATOR COLLAPSE: Year ${monthsSince / 12} update (Month ${state.currentMonth})`);
        console.log(`   Population: ${pollinators.populationPercentage.toFixed(1)}% of 1970 levels`);
        console.log(`   Food production loss: ${(pollinators.foodProductionLoss * 100).toFixed(1)}%`);
        console.log(`   Famine spreading across agricultural regions\n`);
      } catch (e) { /* Ignore EPIPE */ }
    }
  }
}

/**
 * Update all specific tipping points each month
 */
export function updateSpecificTippingPoints(state: GameState): void {
  // Initialize if not present
  if (!state.specificTippingPoints) {
    state.specificTippingPoints = initializeSpecificTippingPoints();
  }
  
  // Update each system
  updateAmazonRainforest(state);
  updateCoralReefs(state);
  updatePollinators(state);
  
  // Permafrost and AMOC only kick in later (2050+)
  // We'll implement those in Phase 3
}


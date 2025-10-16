/**
 * Environmental Accumulation System (Phase 2: Golden Age & Accumulation Systems)
 * 
 * Tracks environmental costs that accumulate silently from production/growth,
 * then manifest as crises when thresholds are crossed.
 * 
 * Mechanisms modeled:
 * - Resource depletion: Extraction > regeneration → reserves decline
 * - Pollution accumulation: Production → waste → contamination builds
 * - Climate degradation: Energy use + emissions → stability declines
 * - Biodiversity loss: Expansion + habitat disruption → ecosystems collapse
 * 
 * Key insight: High QoL can persist while environmental debt accumulates.
 * This creates the "Golden Age illusion" - prosperity masking future collapse.
 */

import { GameState, EnvironmentalAccumulation } from '@/types/game';

/**
 * Initialize environmental accumulation state
 * 
 * Starting values represent 2025 REALISTIC baseline (research-backed):
 * - Resources: 1.7x overshoot (Global Footprint Network 2025)
 * - Pollution: 46% unhealthy air (American Lung Assoc 2025)
 * - Climate: +1.2°C warming (Copernicus 2024)
 * - Biodiversity: 50-70% loss since 1970 (IPBES 2024)
 */
export function initializeEnvironmentalAccumulation(): EnvironmentalAccumulation {
  return {
    resourceReserves: 0.65,      // Was 0.85 - Research: 1.7x overshoot (GFN 2025), Earth Overshoot Day July 24
    pollutionLevel: 0.30,         // Was 0.15 - Research: 46% unhealthy air (ALA 2025), 7/9 boundaries breached
    climateStability: 0.75,       // KEEP - Validated (Copernicus 2024: +1.2°C warming)
    biodiversityIndex: 0.35,      // Was 0.70 - Research: 50-70% loss since 1970 (IPBES 2024)
    resourceCrisisActive: false,
    pollutionCrisisActive: false,
    climateCrisisActive: false,
    ecosystemCrisisActive: false
  };
}

/**
 * Update environmental accumulation based on economic activity
 * 
 * Called each month to track accumulation rates.
 * Rate-based: high production = faster accumulation (unless mitigated)
 */
export function updateEnvironmentalAccumulation(
  state: GameState
): void {
  const env = state.environmentalAccumulation;
  const economicStage = state.globalMetrics.economicTransitionStage;
  const manufacturingCap = state.globalMetrics.manufacturingCapability;
  
  // Check if we have technologies that mitigate environmental impact
  const hasFusion = state.technologyTree.some(t => t.id === 'fusion_energy' && t.completed);
  const hasAdvancedMaterials = state.technologyTree.some(t => t.id === 'advanced_materials' && t.completed);
  const hasNanotech = state.technologyTree.some(t => t.id === 'molecular_manufacturing' && t.completed);
  const hasCleanEnergy = state.technologyTree.some(t => t.id === 'clean_energy' && t.completed);
  const hasRecycling = state.technologyTree.some(t => t.id === 'advanced_recycling' && t.completed);
  const hasEcosystemManagement = state.technologyTree.some(t => t.id === 'ecosystem_management_ai' && t.completed);
  
  // === RESOURCE DEPLETION ===
  // Base extraction rate increases with economic stage
  let resourceDepletionRate = economicStage * 0.008; // 0.8% per month at Stage 1, 3.2% at Stage 4
  
  // High production accelerates depletion
  resourceDepletionRate += manufacturingCap * 0.004;
  
  // Rapid growth (stage transitions) spike depletion
  const stageGrowthRate = Math.max(0, economicStage - (economicStage - 0.1)); // Approximate growth
  resourceDepletionRate += stageGrowthRate * 0.03;
  
  // Mitigation from technologies (old tech tree - may be deprecated)
  if (hasAdvancedMaterials) resourceDepletionRate *= 0.5; // 50% reduction (material efficiency)
  if (hasNanotech) resourceDepletionRate *= 0.25; // Additional 75% reduction (molecular manufacturing)
  
  // Mitigation from breakthrough technologies (Phase 2A)
  if (state.breakthroughTech) {
    const { getResourceEfficiencyMultiplier } = require('./breakthroughTechnologies');
    const efficiencyMultiplier = getResourceEfficiencyMultiplier(state);
    resourceDepletionRate *= efficiencyMultiplier;
  }
  
  // Apply depletion
  const currentReserves = isNaN(env.resourceReserves) ? 1.0 : env.resourceReserves;
  env.resourceReserves = Math.max(0, currentReserves - resourceDepletionRate);
  
  // === RESOURCE REGENERATION (Phase 2.8) ===
  // Tech-enabled recovery: Circular economy, sustainable agriculture, clean energy
  // Research basis: Ellen MacArthur Foundation (2015), Tilton (2003)
  let resourceRegeneration = 0;
  
  const tech = state.breakthroughTech;
  
  // AI coordination bonus
  // HONEST: No solid empirical data on AI coordination gains. Consulting firms overstate.
  // Conservative estimate: AI helps with logistics, waste reduction, monitoring
  const avgCapability = state.aiAgents.length > 0 
    ? state.aiAgents.reduce((sum, ai) => sum + ai.capability, 0) / state.aiAgents.length 
    : 0;
  const aiCoordinationBonus = 1 + (avgCapability * 0.1); // Up to 1.4x at AGI (10% per point)
  // Rationale: AI optimizes routing, reduces waste, coordinates globally
  // NOT magic: Physical recycling/farming still takes time
  // Mark for validation when real-world data emerges

  // Sustainable Agriculture: +1%/month at full deployment (food, biomass, water cycle)
  if (tech.sustainableAgriculture?.unlocked) {
    resourceRegeneration += 0.01 * (tech.sustainableAgriculture?.deploymentLevel ?? 0) * aiCoordinationBonus;
  }

  // Circular Economy (Advanced Recycling): +2%/month (metals, minerals, materials)
  if (tech.advancedRecycling?.unlocked) {
    resourceRegeneration += 0.02 * (tech.advancedRecycling?.deploymentLevel ?? 0) * aiCoordinationBonus;
  }

  // Clean Energy: +1.5%/month (replaces fossil fuel depletion with renewable flow)
  if (tech.cleanEnergy?.unlocked) {
    resourceRegeneration += 0.015 * (tech.cleanEnergy?.deploymentLevel ?? 0) * aiCoordinationBonus;
  }

  // Ecosystem Management: +0.8%/month (biosphere restoration → resource flows)
  if (tech.ecosystemManagement?.unlocked) {
    resourceRegeneration += 0.008 * (tech.ecosystemManagement?.deploymentLevel ?? 0) * aiCoordinationBonus;
  }

  // Interspecies Communication: +0.5%/month (better habitat understanding → efficiency)
  if (tech.interspeciesComm?.unlocked) {
    resourceRegeneration += 0.005 * (tech.interspeciesComm?.deploymentLevel ?? 0) * aiCoordinationBonus;
  }
  
  // Apply regeneration (can recover from 0%!)
  env.resourceReserves = Math.min(1.0, env.resourceReserves + resourceRegeneration);
  
  // Log significant regeneration
  if (resourceRegeneration > 0.02 && state.currentMonth % 12 === 0) {
    console.log(`🌱 RESOURCE REGENERATION: ${(resourceRegeneration * 100).toFixed(1)}%/month (reserves: ${(env.resourceReserves * 100).toFixed(0)}%)`);
  }
  
  // === POLLUTION ACCUMULATION ===
  // Base pollution from production
  let pollutionRate = economicStage * 0.006; // 0.6% per month at Stage 1
  
  // Manufacturing capability increases pollution
  pollutionRate += manufacturingCap * 0.005;
  
  // Rapid industrial growth spikes pollution
  if (economicStage > 2.0 && economicStage < 3.5) {
    pollutionRate += 0.01; // Industrial transition period
  }
  
  // Mitigation from clean technologies
  if (hasCleanEnergy) pollutionRate *= 0.4; // 60% reduction
  if (hasRecycling) pollutionRate *= 0.6; // Additional 40% reduction
  if (hasNanotech) pollutionRate *= 0.5; // Molecular precision reduces waste
  
  // Natural degradation (Earth can process some pollution)
  const naturalDegradation = 0.003; // 0.3% per month natural cleanup
  
  // Apply pollution (accumulation - degradation)
  const currentPollution = isNaN(env.pollutionLevel) ? 0.0 : env.pollutionLevel;
  env.pollutionLevel = Math.max(0, Math.min(1, currentPollution + pollutionRate - naturalDegradation));
  
  // === CLIMATE DEGRADATION ===
  // Energy usage drives climate impact
  // Proxy: compute infrastructure + manufacturing + economic stage
  const totalCompute = state.computeInfrastructure.dataCenters
    .filter(dc => dc.operational)
    .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
  
  const energyUsage = (totalCompute / 10000) + manufacturingCap + (economicStage * 0.3);
  
  // Research: IPCC AR6 - ~0.2°C/decade = 0.0167°C/year = 0.00139°C/month
  // Was 0.004 (5x too fast) - Now 0.0008 for realistic warming rate
  let climateDegradationRate = energyUsage * 0.0008; // Scales with energy use
  
  // Stage 3-4 transition (rapid growth) accelerates climate stress
  // Was 0.008 - Now 0.0016 (adjusted for realistic rate)
  if (economicStage > 3.0) {
    climateDegradationRate += 0.0016;
  }
  
  // Mitigation from clean energy
  if (hasFusion) climateDegradationRate *= 0.2; // 80% reduction (fusion is near-zero carbon)
  if (hasCleanEnergy) climateDegradationRate *= 0.5; // 50% reduction
  
  // Natural stabilization (very slow)
  const naturalStabilization = 0.001; // 0.1% per month
  
  // Apply climate degradation
  const currentClimate = isNaN(env.climateStability) ? 1.0 : env.climateStability;
  env.climateStability = Math.max(0, Math.min(1, currentClimate - climateDegradationRate + naturalStabilization));
  
  // === BIODIVERSITY LOSS ===
  // Habitat disruption from expansion
  // REALISTIC TIMELINE: -0.5%/year = -0.04%/month (10x slower than before)
  // Research: IPBES 2019 - 1M species at risk, but collapse takes decades, not months
  let biodiversityLossRate = economicStage * 0.0004; // 0.04% per month at Stage 1
  
  // Manufacturing and resource extraction destroy habitats
  biodiversityLossRate += manufacturingCap * 0.0003;
  biodiversityLossRate += (1 - env.resourceReserves) * 0.0008; // More extraction = more habitat loss
  
  // Pollution and climate degrade ecosystems
  biodiversityLossRate += env.pollutionLevel * 0.0004;
  biodiversityLossRate += (1 - env.climateStability) * 0.0006;
  
  // Mitigation from ecosystem management
  if (hasEcosystemManagement) {
    biodiversityLossRate *= 0.3; // 70% reduction (AI manages ecosystems)
  }
  
  // Natural recovery (very slow without active management)
  const naturalRecovery = hasEcosystemManagement ? 0.005 : 0.001;
  
  // Apply biodiversity loss
  const currentBiodiversity = isNaN(env.biodiversityIndex) ? 1.0 : env.biodiversityIndex;
  env.biodiversityIndex = Math.max(0, Math.min(1, currentBiodiversity - biodiversityLossRate + naturalRecovery));

  // === P1.5: ECOSYSTEM REGENERATION FROM POPULATION DECLINE ===
  // Historical evidence: Nature rebounds when human pressure reduces
  // - Chernobyl Exclusion Zone: Wildlife thrives with humans gone (1986-present)
  // - COVID-19 lockdowns: Air quality improved 30-60% in 2 months (2020)
  // - Post-Black Death: Forest regrowth in Europe (1350-1400)
  // - Mayan collapse: Jungle reclaimed cities in decades (800-900 CE)
  // Research: Ecological succession takes 20-50 years, but initial recovery is fast
  const currentPressure = state.humanPopulationSystem.population / state.humanPopulationSystem.carryingCapacity;

  if (currentPressure < 0.5) { // Population below half of carrying capacity
    // Regeneration rate scales with reduced pressure: 0-1% monthly
    // At 50% pressure: 0%/month (no bonus)
    // At 25% pressure: 0.5%/month
    // At 0% pressure: 1%/month (maximum recovery)
    const pressureReduction = 0.5 - currentPressure; // 0 to 0.5
    const regenerationRate = pressureReduction * 0.02; // Up to 1% monthly

    // Nature recovers when humans aren't actively destroying it
    env.biodiversityIndex = Math.min(1.0, env.biodiversityIndex + regenerationRate);
    env.resourceReserves = Math.min(1.0, env.resourceReserves + regenerationRate * 0.5); // 50% as fast
    env.climateStability = Math.min(1.0, env.climateStability + regenerationRate * 0.3); // 30% as fast (carbon sinks recovering)

    if (state.currentMonth % 24 === 0 && regenerationRate > 0.003) { // Log every 2 years if significant
      console.log(`🌱 NATURAL REGENERATION: Low human pressure (${(currentPressure * 100).toFixed(0)}%), ecosystems recovering at +${(regenerationRate * 100).toFixed(2)}%/month`);
      console.log(`   Biodiversity: ${(env.biodiversityIndex * 100).toFixed(1)}%, Resources: ${(env.resourceReserves * 100).toFixed(1)}%, Climate: ${(env.climateStability * 100).toFixed(1)}%`);
    }
  }

  // === CRISIS TRIGGERS ===
  checkEnvironmentalCrises(state);
}

/**
 * Check if environmental accumulation has crossed crisis thresholds
 * 
 * Crises trigger QoL impacts and potentially extinction scenarios.
 */
function checkEnvironmentalCrises(state: GameState): void {
  const env = state.environmentalAccumulation;
  const qol = state.qualityOfLifeSystems;
  
  // RESOURCE CRISIS: Reserves depleted below 30%
  if (env.resourceReserves < 0.3 && !env.resourceCrisisActive) {
    env.resourceCrisisActive = true;
    try {
      console.log(`\n⚠️  RESOURCE CRISIS TRIGGERED (Month ${state.currentMonth})`);
      console.log(`   Resource Reserves: ${(env.resourceReserves * 100).toFixed(1)}%`);
      console.log(`   Impact: Manufacturing disrupted, QoL declining\n`);
    } catch (e) { /* Ignore EPIPE */ }

    // Log event
    state.eventLog.push({
      type: 'crisis',
      month: state.currentMonth,
      description: `Resource Crisis: Reserves depleted to ${(env.resourceReserves * 100).toFixed(1)}%`,
      impact: 'Material abundance -30%, Energy -20%, Social stability -0.3'
    });

    // Immediate QoL impacts
    qol.materialAbundance *= 0.7; // 30% drop in material goods
    qol.energyAvailability *= 0.8; // 20% drop in energy
    state.globalMetrics.socialStability = Math.max(0, state.globalMetrics.socialStability - 0.3);

    // Population impact: Initial famine/scarcity deaths (0.5-1% casualties)
    // SEMI-GLOBAL: Affects food/water insecure regions (~25% of world)
    // 0.8% mortality rate in exposed regions
    const { addAcuteCrisisDeaths } = require('./populationDynamics');
    addAcuteCrisisDeaths(state, 0.008, 'Resource crisis - famine/scarcity (vulnerable regions)', 0.25, 'famine');
  }
  
  // POLLUTION CRISIS: Pollution exceeds 70%
  if (env.pollutionLevel > 0.7 && !env.pollutionCrisisActive) {
    env.pollutionCrisisActive = true;
    try {
      console.log(`\n⚠️  POLLUTION CRISIS TRIGGERED (Month ${state.currentMonth})`);
      console.log(`   Pollution Level: ${(env.pollutionLevel * 100).toFixed(1)}%`);
      console.log(`   Impact: Health crisis, ecosystem contamination\n`);
    } catch (e) { /* Ignore EPIPE */ }

    state.eventLog.push({
      type: 'crisis',
      month: state.currentMonth,
      description: `Pollution Crisis: Pollution level ${(env.pollutionLevel * 100).toFixed(1)}%`,
      impact: 'Healthcare -25%, Diseases +0.3, Ecosystem -40%, QoL -0.25'
    });

    // Immediate QoL impacts
    qol.healthcareQuality *= 0.75; // 25% drop (pollution-related diseases)
    qol.diseasesBurden = Math.min(1, qol.diseasesBurden + 0.3); // Disease burden increases
    qol.ecosystemHealth *= 0.6; // 40% drop in ecosystem health
    state.globalMetrics.qualityOfLife = Math.max(0, state.globalMetrics.qualityOfLife - 0.25);

    // Population impact: Pollution-related disease deaths (0.3-0.5% casualties)
    // SEMI-GLOBAL: Industrial nations + downwind regions (~60% of world)
    // 0.4% mortality rate from acute contamination/disease
    const { addAcuteCrisisDeaths } = require('./populationDynamics');
    addAcuteCrisisDeaths(state, 0.004, 'Pollution crisis - toxic contamination (industrial regions)', 0.60, 'pollution');
  }
  
  // CLIMATE CATASTROPHE: Stability below 40%
  if (env.climateStability < 0.4 && !env.climateCrisisActive) {
    env.climateCrisisActive = true;
    try {
      console.log(`\n🌡️  CLIMATE CATASTROPHE TRIGGERED (Month ${state.currentMonth})`);
      console.log(`   Climate Stability: ${(env.climateStability * 100).toFixed(1)}%`);
      console.log(`   Impact: Cascading failures, potential extinction pathway\n`);
    } catch (e) { /* Ignore EPIPE */ }

    state.eventLog.push({
      type: 'crisis',
      month: state.currentMonth,
      description: `Climate Catastrophe: Stability ${(env.climateStability * 100).toFixed(1)}%`,
      impact: 'Physical safety -40%, Material -50%, Ecosystem -60%, Social stability -0.5'
    });

    // Severe QoL impacts
    qol.physicalSafety *= 0.6; // 40% drop (extreme weather, disasters)
    qol.materialAbundance *= 0.5; // 50% drop (agricultural collapse)
    qol.ecosystemHealth *= 0.4; // 60% drop
    state.globalMetrics.socialStability = Math.max(0, state.globalMetrics.socialStability - 0.5);

    // Population impact: Extreme weather + crop failure (1-2% casualties)
    // SEMI-GLOBAL: Coastal + climate-vulnerable regions (~30% of world)
    // 1.5% mortality rate from disasters/starvation
    const { addAcuteCrisisDeaths } = require('./populationDynamics');
    addAcuteCrisisDeaths(state, 0.015, 'Climate catastrophe - extreme weather/famine (vulnerable regions)', 0.30, 'climate');

    // Check for extinction trigger
    // Climate catastrophe can lead to slow collapse
    if (env.biodiversityIndex < 0.4) {
      try {
        console.log(`   ⚠️  Combined with ecosystem collapse - extinction risk elevated\n`);
      } catch (e) { /* Ignore EPIPE */ }
    }
  }
  
  // ECOSYSTEM TIPPING POINT: Biodiversity below 20%
  // REALISTIC TIMELINE: Threshold triggers collapse PROCESS, not instant apocalypse
  // Research: Collapse takes 20-40 years after tipping point (2040-2070)
  if (env.biodiversityIndex < 0.2 && !env.ecosystemCrisisActive) {
    env.ecosystemCrisisActive = true;
    // Initialize collapse tracking
    if (!state.ecosystemCollapse) {
      state.ecosystemCollapse = {
        triggered: true,
        triggeredAt: state.currentMonth,
        monthsSinceTrigger: 0,
        phase: 'declining' as const,
      };
    }
    
    try {
      console.log(`\n🦋 ECOSYSTEM TIPPING POINT CROSSED (Month ${state.currentMonth})`);
      console.log(`   Biodiversity Index: ${(env.biodiversityIndex * 100).toFixed(1)}%`);
      console.log(`   Impact: Entering collapse process (20-40 year timeline)`);
      console.log(`   Phase 1: DECLINING (0-2 years) - initial stress, low mortality`);
      console.log(`   Phase 2: CRISIS (2-5 years) - accelerating failures, moderate mortality`);
      console.log(`   Phase 3: COLLAPSE (5+ years) - severe failures, high mortality\n`);
    } catch (e) { /* Ignore EPIPE */ }

    state.eventLog.push({
      type: 'crisis',
      month: state.currentMonth,
      description: `Ecosystem Tipping Point: Biodiversity ${(env.biodiversityIndex * 100).toFixed(1)}%`,
      impact: 'Collapse process begins - impacts escalate over decades'
    });

    // Initial QoL impacts (minor at first)
    qol.materialAbundance *= 0.95; // 5% initial drop
    qol.healthcareQuality *= 0.97; // 3% initial drop
    qol.ecosystemHealth *= 0.90; // 10% initial drop
    state.globalMetrics.qualityOfLife = Math.max(0, state.globalMetrics.qualityOfLife - 0.05);

    // NO immediate deaths - that comes gradually over years
  }
  
  // ONGOING ECOSYSTEM COLLAPSE: Escalating impacts over time
  if (env.ecosystemCrisisActive && state.ecosystemCollapse) {
    state.ecosystemCollapse.monthsSinceTrigger = state.currentMonth - state.ecosystemCollapse.triggeredAt;
    const monthsSince = state.ecosystemCollapse.monthsSinceTrigger;
    
    // Phase transitions (realistic timeline)
    if (monthsSince < 24) {
      // Phase 1: DECLINING (0-2 years) - Initial stress
      state.ecosystemCollapse.phase = 'declining';
      
      // Very low mortality: 0.01% per month (vulnerable regions first)
      // Affects tropical regions, small island states (~5% of world)
      const { addAcuteCrisisDeaths } = require('./populationDynamics');
      addAcuteCrisisDeaths(state, 0.0001, 'Ecosystem decline - regional food stress (tropical/island)', 0.05, 'ecosystem');
      
      // Gradual QoL degradation
      qol.materialAbundance = Math.max(0.3, qol.materialAbundance - 0.002); // -0.2%/month
      qol.ecosystemHealth = Math.max(0.2, qol.ecosystemHealth - 0.003); // -0.3%/month
      
    } else if (monthsSince < 60) {
      // Phase 2: CRISIS (2-5 years) - Accelerating failures
      state.ecosystemCollapse.phase = 'crisis';
      
      // Moderate mortality: 0.1% per month
      // Spreads to agricultural regions globally (~40% of world)
      const { addAcuteCrisisDeaths } = require('./populationDynamics');
      addAcuteCrisisDeaths(state, 0.001, 'Ecosystem crisis - agricultural disruption (vulnerable regions)', 0.40, 'ecosystem');
      
      // Accelerating QoL degradation
      qol.materialAbundance = Math.max(0.2, qol.materialAbundance - 0.005); // -0.5%/month
      qol.healthcareQuality = Math.max(0.3, qol.healthcareQuality - 0.003); // -0.3%/month
      qol.ecosystemHealth = Math.max(0.1, qol.ecosystemHealth - 0.005); // -0.5%/month
      
      // Log phase transition (once)
      if (monthsSince === 24) {
        try {
          console.log(`\n🦋 ECOSYSTEM COLLAPSE: Entering CRISIS PHASE (Month ${state.currentMonth})`);
          console.log(`   2 years since tipping point - failures accelerating`);
          console.log(`   Mortality rising, agricultural disruption spreading\n`);
        } catch (e) { /* Ignore EPIPE */ }
      }
      
    } else {
      // Phase 3: COLLAPSE (5+ years) - Severe failures
      state.ecosystemCollapse.phase = 'collapse';
      
      // High mortality: 1-2% per month
      // Global food system failure (100% of world affected)
      const { addAcuteCrisisDeaths } = require('./populationDynamics');
      addAcuteCrisisDeaths(state, 0.015, 'Ecosystem collapse - global food system failure', 1.00, 'ecosystem');
      
      // Severe ongoing degradation
      qol.materialAbundance = Math.max(0.1, qol.materialAbundance - 0.01); // -1%/month
      qol.healthcareQuality = Math.max(0.2, qol.healthcareQuality - 0.005); // -0.5%/month
      qol.ecosystemHealth = Math.max(0.05, qol.ecosystemHealth - 0.008); // -0.8%/month
      state.globalMetrics.qualityOfLife = Math.max(0, state.globalMetrics.qualityOfLife - 0.01);
      
      // Log phase transition (once)
      if (monthsSince === 60) {
        try {
          console.log(`\n🦋 ECOSYSTEM COLLAPSE: Entering COLLAPSE PHASE (Month ${state.currentMonth})`);
          console.log(`   5 years since tipping point - systemic failure`);
          console.log(`   Global food system failure, mass mortality\n`);
        } catch (e) { /* Ignore EPIPE */ }
      }
    }
  }
  
  // === ONGOING CRISIS IMPACTS ===
  // Once triggered, crises continue to degrade QoL
  
  // Calculate cascading failure multiplier
  const cascadeMultiplier = calculateCascadingFailureMultiplier(state);
  
  if (env.resourceCrisisActive) {
    // Ongoing resource scarcity
    qol.materialAbundance = Math.max(0, qol.materialAbundance - 0.01 * cascadeMultiplier);
    state.globalMetrics.socialStability = Math.max(0, state.globalMetrics.socialStability - 0.01 * cascadeMultiplier);
  }
  
  if (env.pollutionCrisisActive) {
    // Ongoing health impacts
    qol.healthcareQuality = Math.max(0, qol.healthcareQuality - 0.008 * cascadeMultiplier);
    qol.diseasesBurden = Math.min(1, qol.diseasesBurden + 0.01 * cascadeMultiplier);
  }
  
  if (env.climateCrisisActive) {
    // Ongoing climate disasters
    qol.physicalSafety = Math.max(0, qol.physicalSafety - 0.012 * cascadeMultiplier);
    qol.materialAbundance = Math.max(0, qol.materialAbundance - 0.015 * cascadeMultiplier);
  }
  
  if (env.ecosystemCrisisActive) {
    // Ongoing ecosystem degradation
    qol.ecosystemHealth = Math.max(0, qol.ecosystemHealth - 0.01 * cascadeMultiplier);
    qol.materialAbundance = Math.max(0, qol.materialAbundance - 0.01 * cascadeMultiplier);
  }
  
  // Extra cascading failure warning
  if (cascadeMultiplier > 1.5) {
    try {
      const activeCount = Math.round((cascadeMultiplier - 1.0) / 0.5 + 2);
      const crisisDetails = [
        env.resourceCrisisActive && 'Resource',
        env.pollutionCrisisActive && 'Pollution',
        env.climateCrisisActive && 'Climate',
        env.ecosystemCrisisActive && 'Ecosystem',
        state.socialAccumulation.meaningCollapseActive && 'Meaning',
        state.socialAccumulation.institutionalFailureActive && 'Institutional',
        state.socialAccumulation.socialUnrestActive && 'SocialUnrest',
        state.technologicalRisk.controlLossActive && 'ControlLoss',
        state.technologicalRisk.corporateDystopiaActive && 'Corporate',
        state.technologicalRisk.complacencyCrisisActive && 'Complacency'
      ].filter(Boolean).join(', ');
      console.log(`   ⚠️⚠️⚠️  CASCADING FAILURES (Month ${state.currentMonth}): ${activeCount} crises active [${crisisDetails}], degradation accelerated ${cascadeMultiplier.toFixed(1)}x`);
      
      // Log cascading failure event (only once per month to avoid spam)
      const lastCascade = state.eventLog.filter(e => e.type === 'cascading_failure').slice(-1)[0];
      if (!lastCascade || (lastCascade as any).month < state.currentMonth) {
        state.eventLog.push({
          type: 'cascading_failure',
          month: state.currentMonth,
          description: `Cascading Failures: ${activeCount} crises active`,
          impact: `Degradation accelerated ${cascadeMultiplier.toFixed(1)}x - Active: ${crisisDetails}`
        });
      }
    } catch (e) { /* Ignore EPIPE */ }
  }
}

/**
 * Get environmental sustainability score (0-1)
 * 
 * Used by Golden Age → Utopia transition logic.
 * Returns how sustainable the current state is.
 */
export function getEnvironmentalSustainability(env: EnvironmentalAccumulation): number {
  // Average of all environmental metrics
  // Resources and climate are inverted (low = bad), pollution is normal (high = bad)
  const resourceScore = env.resourceReserves;
  const pollutionScore = 1 - env.pollutionLevel;
  const climateScore = env.climateStability;
  const biodiversityScore = env.biodiversityIndex;
  
  // Weighted average (all equally important)
  return (resourceScore + pollutionScore + climateScore + biodiversityScore) / 4;
}

/**
 * Check if any environmental crisis would block Utopia
 * 
 * Utopia requires environmental sustainability, not just high QoL.
 */
export function hasEnvironmentalCrisis(env: EnvironmentalAccumulation): boolean {
  return env.resourceCrisisActive || 
         env.pollutionCrisisActive || 
         env.climateCrisisActive || 
         env.ecosystemCrisisActive;
}

/**
 * Calculate cascading failure multiplier based on total active crises
 *
 * When multiple crises are active across all systems, they amplify each other.
 * P1.3 FIX: Reduced compounding from 0.5 to 0.2 (was too aggressive)
 * 2 crises: 1.0x (baseline)
 * 3 crises: 1.2x degradation (was 1.5x)
 * 4 crises: 1.4x degradation (was 2.0x)
 * 6 crises: 1.8x degradation (was 3.0x)
 *
 * This represents systemic collapse where failures compound.
 * Research: Historical crises rarely amplify more than 2x (COVID + economic crisis)
 */
function calculateCascadingFailureMultiplier(state: GameState): number {
  const activeCrises = [
    // Environmental (4 possible)
    state.environmentalAccumulation.resourceCrisisActive,
    state.environmentalAccumulation.pollutionCrisisActive,
    state.environmentalAccumulation.climateCrisisActive,
    state.environmentalAccumulation.ecosystemCrisisActive,
    // Social (3 possible)
    state.socialAccumulation.meaningCollapseActive,
    state.socialAccumulation.institutionalFailureActive,
    state.socialAccumulation.socialUnrestActive,
    // Technological (3 possible)
    state.technologicalRisk.controlLossActive,
    state.technologicalRisk.corporateDystopiaActive,
    state.technologicalRisk.complacencyCrisisActive
  ].filter(Boolean).length;

  if (activeCrises <= 2) {
    return 1.0; // No amplification for 1-2 crises
  }

  // P1.3 FIX: Each crisis beyond 2 adds 20% more degradation (was 50%)
  return 1.0 + (activeCrises - 2) * 0.2;
}


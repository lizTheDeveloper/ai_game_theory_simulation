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
 * Starting values represent relatively healthy Earth circa 2025:
 * - Resources abundant but finite
 * - Some pollution but manageable
 * - Climate stressed but stable
 * - Biodiversity declining but not collapsed
 */
export function initializeEnvironmentalAccumulation(): EnvironmentalAccumulation {
  return {
    resourceReserves: 0.85,      // Some depletion already occurred
    pollutionLevel: 0.15,         // Baseline pollution from 2025
    climateStability: 0.75,       // Already experiencing climate stress
    biodiversityIndex: 0.70,      // Significant biodiversity loss already
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
  const hasFusion = state.technologyTree.some(t => t.id === 'fusion_energy' && t.unlocked);
  const hasAdvancedMaterials = state.technologyTree.some(t => t.id === 'advanced_materials' && t.unlocked);
  const hasNanotech = state.technologyTree.some(t => t.id === 'molecular_manufacturing' && t.unlocked);
  const hasCleanEnergy = state.technologyTree.some(t => t.id === 'clean_energy' && t.unlocked);
  const hasRecycling = state.technologyTree.some(t => t.id === 'advanced_recycling' && t.unlocked);
  const hasEcosystemManagement = state.technologyTree.some(t => t.id === 'ecosystem_management_ai' && t.unlocked);
  
  // === RESOURCE DEPLETION ===
  // Base extraction rate increases with economic stage
  let resourceDepletionRate = economicStage * 0.008; // 0.8% per month at Stage 1, 3.2% at Stage 4
  
  // High production accelerates depletion
  resourceDepletionRate += manufacturingCap * 0.004;
  
  // Rapid growth (stage transitions) spike depletion
  const stageGrowthRate = Math.max(0, economicStage - (economicStage - 0.1)); // Approximate growth
  resourceDepletionRate += stageGrowthRate * 0.03;
  
  // Mitigation from technologies
  if (hasAdvancedMaterials) resourceDepletionRate *= 0.5; // 50% reduction (material efficiency)
  if (hasNanotech) resourceDepletionRate *= 0.25; // Additional 75% reduction (molecular manufacturing)
  
  // Apply depletion
  env.resourceReserves = Math.max(0, env.resourceReserves - resourceDepletionRate);
  
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
  env.pollutionLevel = Math.max(0, Math.min(1, env.pollutionLevel + pollutionRate - naturalDegradation));
  
  // === CLIMATE DEGRADATION ===
  // Energy usage drives climate impact
  // Proxy: compute infrastructure + manufacturing + economic stage
  const totalCompute = state.computeInfrastructure.dataCenters
    .filter(dc => dc.operational)
    .reduce((sum, dc) => sum + dc.capacity * dc.efficiency, 0);
  
  const energyUsage = (totalCompute / 10000) + manufacturingCap + (economicStage * 0.3);
  
  let climateDegradationRate = energyUsage * 0.004; // Scales with energy use
  
  // Stage 3-4 transition (rapid growth) accelerates climate stress
  if (economicStage > 3.0) {
    climateDegradationRate += 0.008;
  }
  
  // Mitigation from clean energy
  if (hasFusion) climateDegradationRate *= 0.2; // 80% reduction (fusion is near-zero carbon)
  if (hasCleanEnergy) climateDegradationRate *= 0.5; // 50% reduction
  
  // Natural stabilization (very slow)
  const naturalStabilization = 0.001; // 0.1% per month
  
  // Apply climate degradation
  env.climateStability = Math.max(0, Math.min(1, env.climateStability - climateDegradationRate + naturalStabilization));
  
  // === BIODIVERSITY LOSS ===
  // Habitat disruption from expansion
  let biodiversityLossRate = economicStage * 0.005; // 0.5% per month at Stage 1
  
  // Manufacturing and resource extraction destroy habitats
  biodiversityLossRate += manufacturingCap * 0.003;
  biodiversityLossRate += (1 - env.resourceReserves) * 0.008; // More extraction = more habitat loss
  
  // Pollution and climate degrade ecosystems
  biodiversityLossRate += env.pollutionLevel * 0.004;
  biodiversityLossRate += (1 - env.climateStability) * 0.006;
  
  // Mitigation from ecosystem management
  if (hasEcosystemManagement) {
    biodiversityLossRate *= 0.3; // 70% reduction (AI manages ecosystems)
  }
  
  // Natural recovery (very slow without active management)
  const naturalRecovery = hasEcosystemManagement ? 0.005 : 0.001;
  
  // Apply biodiversity loss
  env.biodiversityIndex = Math.max(0, Math.min(1, env.biodiversityIndex - biodiversityLossRate + naturalRecovery));
  
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
    console.log(`\n⚠️  RESOURCE CRISIS TRIGGERED (Month ${state.currentMonth})`);
    console.log(`   Resource Reserves: ${(env.resourceReserves * 100).toFixed(1)}%`);
    console.log(`   Impact: Manufacturing disrupted, QoL declining\n`);
    
    // Immediate QoL impacts
    qol.materialAbundance *= 0.7; // 30% drop in material goods
    qol.energyAvailability *= 0.8; // 20% drop in energy
    state.globalMetrics.socialStability = Math.max(0, state.globalMetrics.socialStability - 0.3);
  }
  
  // POLLUTION CRISIS: Pollution exceeds 70%
  if (env.pollutionLevel > 0.7 && !env.pollutionCrisisActive) {
    env.pollutionCrisisActive = true;
    console.log(`\n⚠️  POLLUTION CRISIS TRIGGERED (Month ${state.currentMonth})`);
    console.log(`   Pollution Level: ${(env.pollutionLevel * 100).toFixed(1)}%`);
    console.log(`   Impact: Health crisis, ecosystem contamination\n`);
    
    // Immediate QoL impacts
    qol.healthcareQuality *= 0.75; // 25% drop (pollution-related diseases)
    qol.diseasesBurden = Math.min(1, qol.diseasesBurden + 0.3); // Disease burden increases
    qol.ecosystemHealth *= 0.6; // 40% drop in ecosystem health
    state.globalMetrics.qualityOfLife = Math.max(0, state.globalMetrics.qualityOfLife - 0.25);
  }
  
  // CLIMATE CATASTROPHE: Stability below 40%
  if (env.climateStability < 0.4 && !env.climateCrisisActive) {
    env.climateCrisisActive = true;
    console.log(`\n🌡️  CLIMATE CATASTROPHE TRIGGERED (Month ${state.currentMonth})`);
    console.log(`   Climate Stability: ${(env.climateStability * 100).toFixed(1)}%`);
    console.log(`   Impact: Cascading failures, potential extinction pathway\n`);
    
    // Severe QoL impacts
    qol.physicalSafety *= 0.6; // 40% drop (extreme weather, disasters)
    qol.materialAbundance *= 0.5; // 50% drop (agricultural collapse)
    qol.ecosystemHealth *= 0.4; // 60% drop
    state.globalMetrics.socialStability = Math.max(0, state.globalMetrics.socialStability - 0.5);
    
    // Check for extinction trigger
    // Climate catastrophe can lead to slow collapse
    if (env.biodiversityIndex < 0.4) {
      console.log(`   ⚠️  Combined with ecosystem collapse - extinction risk elevated\n`);
    }
  }
  
  // ECOSYSTEM COLLAPSE: Biodiversity below 30%
  if (env.biodiversityIndex < 0.3 && !env.ecosystemCrisisActive) {
    env.ecosystemCrisisActive = true;
    console.log(`\n🦋 ECOSYSTEM COLLAPSE TRIGGERED (Month ${state.currentMonth})`);
    console.log(`   Biodiversity Index: ${(env.biodiversityIndex * 100).toFixed(1)}%`);
    console.log(`   Impact: Food system failure, life support degradation\n`);
    
    // Critical QoL impacts
    qol.materialAbundance *= 0.6; // 40% drop (food system collapse)
    qol.healthcareQuality *= 0.7; // 30% drop (ecosystem services lost)
    qol.ecosystemHealth = Math.min(0.2, qol.ecosystemHealth); // Floor ecosystem health
    state.globalMetrics.qualityOfLife = Math.max(0, state.globalMetrics.qualityOfLife - 0.4);
  }
  
  // === ONGOING CRISIS IMPACTS ===
  // Once triggered, crises continue to degrade QoL
  
  if (env.resourceCrisisActive) {
    // Ongoing resource scarcity
    qol.materialAbundance = Math.max(0, qol.materialAbundance - 0.01); // Continued decline
    state.globalMetrics.socialStability = Math.max(0, state.globalMetrics.socialStability - 0.01);
  }
  
  if (env.pollutionCrisisActive) {
    // Ongoing health impacts
    qol.healthcareQuality = Math.max(0, qol.healthcareQuality - 0.008);
    qol.diseasesBurden = Math.min(1, qol.diseasesBurden + 0.01);
  }
  
  if (env.climateCrisisActive) {
    // Ongoing climate disasters
    qol.physicalSafety = Math.max(0, qol.physicalSafety - 0.012);
    qol.materialAbundance = Math.max(0, qol.materialAbundance - 0.015);
  }
  
  if (env.ecosystemCrisisActive) {
    // Ongoing ecosystem degradation
    qol.ecosystemHealth = Math.max(0, qol.ecosystemHealth - 0.01);
    qol.materialAbundance = Math.max(0, qol.materialAbundance - 0.01);
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


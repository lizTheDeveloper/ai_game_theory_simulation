/**
 * Technology Integration with Resource Economy (Phase 2.9 - Part 3)
 * 
 * Connects breakthrough technologies to resource economy:
 * - Clean Energy → increases renewable capacity, reduces fossil use
 * - Circular Economy → boosts recycling rates
 * - Sustainable Agriculture → improves food regeneration
 * - Fusion → unlimited energy, enables everything
 * - Green Hydrogen → replaces natural gas
 * - Advanced Batteries → reduces lithium dependence
 * - Rare Earth Substitutes → solves bottleneck
 */

import { GameState } from '../types/game';
import { ResourceEconomy } from '../types/resources';
import { BreakthroughTechState, TechnologyNode } from '../types/technologies';

// ============================================================================
// MAIN UPDATE FUNCTION
// ============================================================================

export function applyTechnologyToResources(state: GameState): void {
  const resources = state.resourceEconomy;
  const tech = state.breakthroughTech;
  
  if (!resources || !tech) return;
  
  // Apply each technology's effects
  applyCleanEnergy(state, resources, tech);
  applyCircularEconomy(state, resources, tech);
  applySustainableAgriculture(state, resources, tech);
  applyFusion(state, resources, tech);
  applyGreenHydrogen(state, resources, tech);
  applyAdvancedBatteries(state, resources, tech);
  applyRareEarthSubstitutes(state, resources, tech);
  applyEcosystemManagement(state, resources, tech);
  applyCleanWater(state, resources, tech);
}

// ============================================================================
// CLEAN ENERGY
// ============================================================================

function applyCleanEnergy(state: GameState, resources: ResourceEconomy, tech: BreakthroughTechState): void {
  const cleanEnergy = tech.cleanEnergy;
  if (!cleanEnergy?.unlocked) return;
  
  const deployment = cleanEnergy.deploymentLevel;
  
  // Increase renewable capacity
  const capacityBoost = deployment * 25; // Up to +25 units at full deployment
  resources.energy.capacity.solar = Math.min(100, 50 + capacityBoost);
  resources.energy.capacity.wind = Math.min(80, 40 + capacityBoost * 0.8);
  
  // Shift energy production to renewables
  const renewableGrowth = deployment * 0.5; // Up to +50% at full deployment
  const fossilDecline = renewableGrowth * 0.8; // Fossils decline as renewables grow
  
  // Transfer from fossil to renewable
  const totalFossil = resources.energy.sources.oil + resources.energy.sources.coal + resources.energy.sources.naturalGas;
  if (totalFossil > 0) {
    const transferAmount = Math.min(totalFossil, fossilDecline);
    
    // Reduce fossil proportionally
    const fossilRatio = resources.energy.sources.oil / Math.max(1, totalFossil);
    resources.energy.sources.oil = Math.max(0, resources.energy.sources.oil - transferAmount * fossilRatio * 0.4);
    resources.energy.sources.coal = Math.max(0, resources.energy.sources.coal - transferAmount * (1 - fossilRatio) * 0.6);
    resources.energy.sources.naturalGas = Math.max(0, resources.energy.sources.naturalGas - transferAmount * 0.3);
    
    // Add to renewables
    resources.energy.sources.solar += transferAmount * 0.6;
    resources.energy.sources.wind += transferAmount * 0.4;
  }
  
  // Increase substitution levels (reduce fossil fuel demand)
  resources.oil.substitutionLevel = Math.min(0.9, deployment * 0.6); // EVs reduce oil demand
  resources.coal.substitutionLevel = Math.min(0.9, deployment * 0.7); // Solar/wind replace coal
  resources.naturalGas.substitutionLevel = Math.min(0.7, deployment * 0.4); // Partial replacement
  
  // Improve grid infrastructure
  resources.energy.gridEfficiency = Math.min(0.95, 0.85 + deployment * 0.10);
  resources.energy.storageCapacity = Math.min(0.30, 0.05 + deployment * 0.25); // Critical for renewables!
  
  // Reduce fossil industry opposition (as they see transition happening)
  if (deployment > 0.5) {
    resources.fossilIndustry.researchResistance *= 0.95; // Slight reduction per month
    resources.fossilIndustry.deploymentResistance *= 0.95;
  }
}

// ============================================================================
// CIRCULAR ECONOMY (Advanced Recycling)
// ============================================================================

function applyCircularEconomy(state: GameState, resources: ResourceEconomy, tech: BreakthroughTechState): void {
  const recycling = tech.advancedRecycling;
  if (!recycling?.unlocked) return;
  
  const deployment = recycling.deploymentLevel;
  
  // Boost recycling rates dramatically
  resources.iron.recyclingRate = Math.min(0.95, 0.30 + deployment * 0.65); // 30% → 95%
  resources.copper.recyclingRate = Math.min(0.98, 0.35 + deployment * 0.63); // 35% → 98%
  resources.rareEarths.recyclingRate = Math.min(0.85, 0.01 + deployment * 0.84); // 1% → 85% (HUGE!)
  resources.lithium.recyclingRate = Math.min(0.90, 0.05 + deployment * 0.85); // 5% → 90%
  
  // Increase recycling efficiency (material retention)
  resources.iron.recyclingEfficiency = Math.min(0.98, 0.90 + deployment * 0.08);
  resources.copper.recyclingEfficiency = Math.min(0.99, 0.95 + deployment * 0.04);
  resources.rareEarths.recyclingEfficiency = Math.min(0.95, 0.80 + deployment * 0.15);
  resources.lithium.recyclingEfficiency = Math.min(0.95, 0.70 + deployment * 0.25);
  
  // Reduce criticality as recycling solves bottlenecks
  if (deployment > 0.5) {
    resources.rareEarths.criticality = Math.max(0.3, 0.8 - deployment * 0.5);
    resources.lithium.criticality = Math.max(0.2, 0.7 - deployment * 0.5);
  }
  
  // Mining industry pivots to recycling
  resources.miningIndustry.recyclingAdoption = Math.min(0.95, deployment * 0.9);
  resources.miningIndustry.resistanceLevel = Math.max(0.05, 0.4 * (1 - deployment));
}

// ============================================================================
// SUSTAINABLE AGRICULTURE
// ============================================================================

function applySustainableAgriculture(state: GameState, resources: ResourceEconomy, tech: BreakthroughTechState): void {
  const sustAg = tech.sustainableAgriculture;
  if (!sustAg?.unlocked) return;
  
  const deployment = sustAg.deploymentLevel;
  
  // Improve soil health
  const soilImprovement = deployment * 0.002; // +0.2% per month at full deployment
  resources.food.soilHealth = Math.min(1.0, resources.food.soilHealth + soilImprovement);
  
  // Boost food regeneration
  resources.food.monthlyRegeneration = 0.03 + deployment * 0.02; // 3% → 5%
  
  // Reduce water stress (efficient irrigation)
  resources.food.waterAvailability = Math.min(1.0, resources.food.waterAvailability + deployment * 0.01);
  
  // Improve capacity
  if (deployment > 0.3) {
    resources.food.capacity = Math.min(1.2, 1.0 + deployment * 0.2);
  }
  
  // Reduce overharvest damage
  resources.food.overharvest = Math.max(0, resources.food.overharvest * (1 - deployment * 0.5));
}

// ============================================================================
// FUSION POWER
// ============================================================================

function applyFusion(state: GameState, resources: ResourceEconomy, tech: BreakthroughTechState): void {
  const fusion = tech.fusionPower;
  if (!fusion?.unlocked) return;
  
  const deployment = fusion.deploymentLevel;
  
  // Add fusion capacity (MASSIVE)
  resources.energy.capacity.fusion = deployment * 200; // Up to 200 units!
  
  // Shift production to fusion
  const fusionProduction = deployment * 100; // Up to 100 units
  resources.energy.sources.fusion = fusionProduction;
  
  // Reduce ALL fossil sources dramatically
  if (deployment > 0.3) {
    const fossilReduction = (deployment - 0.3) * 0.5; // 50% reduction at full deployment
    resources.energy.sources.oil = Math.max(0, resources.energy.sources.oil * (1 - fossilReduction));
    resources.energy.sources.coal = Math.max(0, resources.energy.sources.coal * (1 - fossilReduction));
    resources.energy.sources.naturalGas = Math.max(0, resources.energy.sources.naturalGas * (1 - fossilReduction));
  }
  
  // Fusion uses deuterium (abundant in seawater) and lithium (for tritium breeding)
  // Small lithium consumption for tritium breeding
  resources.lithium.monthlyConsumption += deployment * 0.002; // Minimal
  
  // Enables: Desalination, carbon capture, artificial upwelling (energy-intensive geoengineering)
  if (deployment > 0.5) {
    resources.water.desalinationCapacity = Math.min(0.30, 0.02 + deployment * 0.28);
  }
  
  // Total energy independence
  resources.energyIndependence = Math.min(1.0, resources.energy.renewablePercentage + deployment * 0.5);
  
  // Fossil industry collapses
  if (deployment > 0.6) {
    resources.fossilIndustry.collapsed = true;
    resources.fossilIndustry.politicalPower = Math.max(0.1, resources.fossilIndustry.politicalPower * 0.8);
  }
}

// ============================================================================
// GREEN HYDROGEN
// ============================================================================

function applyGreenHydrogen(state: GameState, resources: ResourceEconomy, tech: BreakthroughTechState): void {
  // Check if we have a green hydrogen tech (not currently in breakthrough tech list)
  // This would be added in future tech expansion
  // For now, fusion enables hydrogen production
  
  const fusion = tech.fusionPower;
  if (!fusion?.unlocked || fusion.deploymentLevel < 0.3) return;
  
  // Fusion enables green hydrogen via electrolysis
  const h2Production = fusion.deploymentLevel * 0.4;
  
  // Replace natural gas for heating and industry
  resources.naturalGas.substitutionLevel = Math.min(0.8, resources.naturalGas.substitutionLevel + h2Production * 0.5);
}

// ============================================================================
// ADVANCED BATTERIES
// ============================================================================

function applyAdvancedBatteries(state: GameState, resources: ResourceEconomy, tech: BreakthroughTechState): void {
  // This would be a new tech type (sodium-ion, solid-state, flow batteries)
  // For now, we'll use nanotech as a proxy (enables better batteries)
  
  const nanotech = tech.nanotech;
  if (!nanotech?.unlocked) return;
  
  const deployment = nanotech.deploymentLevel;
  
  // Reduce lithium dependence (alternative chemistries)
  if (deployment > 0.3) {
    // Sodium-ion batteries reduce lithium demand
    const lithiumReduction = (deployment - 0.3) * 0.6; // Up to 60% reduction
    resources.lithium.monthlyExtraction = Math.max(
      resources.lithium.depletionRate * 0.5, 
      resources.lithium.monthlyExtraction * (1 - lithiumReduction)
    );
    
    // Lower criticality
    resources.lithium.criticality = Math.max(0.2, 0.7 - deployment * 0.5);
  }
  
  // Improve grid storage (enables more renewables)
  resources.energy.storageCapacity = Math.min(0.40, resources.energy.storageCapacity + deployment * 0.15);
}

// ============================================================================
// RARE EARTH SUBSTITUTES
// ============================================================================

function applyRareEarthSubstitutes(state: GameState, resources: ResourceEconomy, tech: BreakthroughTechState): void {
  // This would be a new tech (alternative magnet designs, synthetic rare earths)
  // For now, use advanced materials as proxy
  
  const materials = tech.advancedMaterials;
  if (!materials?.unlocked) return;
  
  const deployment = materials.deploymentLevel;
  
  // Develop substitutes
  resources.rareEarths.substitutionProgress = Math.min(0.8, deployment * 0.7);
  
  // Reduce rare earth consumption
  if (deployment > 0.4) {
    const reduction = (deployment - 0.4) * 0.5; // Up to 50% reduction
    resources.rareEarths.monthlyExtraction = Math.max(
      resources.rareEarths.depletionRate * 0.5,
      resources.rareEarths.monthlyExtraction * (1 - reduction)
    );
    
    // Lower criticality dramatically
    resources.rareEarths.criticality = Math.max(0.1, 0.8 - deployment * 0.7);
  }
}

// ============================================================================
// ECOSYSTEM MANAGEMENT
// ============================================================================

function applyEcosystemManagement(state: GameState, resources: ResourceEconomy, tech: BreakthroughTechState): void {
  const ecosystem = tech.ecosystemManagement;
  if (!ecosystem?.unlocked) return;
  
  const deployment = ecosystem.deploymentLevel;
  
  // Improve timber regeneration
  resources.timber.monthlyRegeneration = 0.008 + deployment * 0.012; // 0.8% → 2.0%
  resources.timber.regenerationMultiplier = Math.min(1.0, resources.timber.regenerationMultiplier + deployment * 0.2);
  
  // Restore forest cover
  const forestRestoration = deployment * 0.003; // 0.3% per month at full deployment
  resources.timber.forestCover = Math.min(1.0, resources.timber.forestCover + forestRestoration);
  
  // Improve pollinator populations (helps food)
  resources.food.pollinatorPopulation = Math.min(1.0, resources.food.pollinatorPopulation + deployment * 0.005);
  
  // Boost ocean ecosystem resilience
  resources.ocean.ecosystemResilience = Math.min(1.0, resources.ocean.ecosystemResilience + deployment * 0.002);
  
  // Improve CO2 land absorption (forest restoration)
  if (deployment > 0.5) {
    const absorptionBoost = (deployment - 0.5) * 4; // Up to +2 Gt/year
    resources.co2.landAbsorption = Math.min(15, resources.co2.landAbsorption + absorptionBoost);
  }
}

// ============================================================================
// CLEAN WATER TECHNOLOGY
// ============================================================================

function applyCleanWater(state: GameState, resources: ResourceEconomy, tech: BreakthroughTechState): void {
  const cleanWater = tech.cleanWater;
  if (!cleanWater?.unlocked) return;
  
  const deployment = cleanWater.deploymentLevel;
  
  // Increase water availability
  resources.water.desalinationCapacity = Math.min(0.25, 0.02 + deployment * 0.23);
  
  // Reduce pollution
  const pollutionReduction = deployment * 0.003; // 0.3% per month
  resources.water.pollutionLevel = Math.max(0, resources.water.pollutionLevel - pollutionReduction);
  
  // Improve water regeneration (recycling, efficiency)
  resources.water.monthlyRegeneration = 0.005 + deployment * 0.010; // 0.5% → 1.5%
  
  // Reduce overharvest (efficient use)
  resources.water.overharvest = Math.max(0, resources.water.overharvest * (1 - deployment * 0.4));
}

// ============================================================================
// INDUSTRY OPPOSITION EFFECTS
// ============================================================================

export function applyIndustryOppositionToTech(state: GameState): void {
  const resources = state.resourceEconomy;
  const tech = state.breakthroughTech;
  
  if (!resources || !tech) return;
  
  const fossil = resources.fossilIndustry;
  const mining = resources.miningIndustry;
  
  // Fossil industry slows clean tech research
  if (tech.cleanEnergy && !tech.cleanEnergy.fullyDeployed) {
    tech.cleanEnergy.researchProgress *= (1 - fossil.researchResistance);
  }
  
  if (tech.fusionPower && !tech.fusionPower.fullyDeployed) {
    tech.fusionPower.researchProgress *= (1 - fossil.researchResistance * 0.5); // Less able to oppose fusion
  }
  
  // Mining industry slows circular economy
  if (tech.advancedRecycling && !tech.advancedRecycling.fullyDeployed) {
    tech.advancedRecycling.researchProgress *= (1 - mining.resistanceLevel);
  }
}


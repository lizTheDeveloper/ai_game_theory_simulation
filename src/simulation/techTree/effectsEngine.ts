/**
 * Technology Effects Engine
 * 
 * Applies technology effects to game state based on deployment levels.
 * Each tech impacts different systems differently.
 * 
 * KEY TIMING: This runs at phase order 12.5, BEFORE most systems update:
 * - 12.5: Tech effects applied here
 * - 17.0: ResourceEconomyPhase (oceanHealth updates)
 * - 20.1: PhosphorusPhase
 * - 20.2: FreshwaterPhase
 * - 20.3: OceanAcidificationPhase
 * - 20.4: NovelEntitiesPhase
 * 
 * This is CORRECT - tech effects modify state, then systems read modified state.
 * 
 * VERIFIED STATE PROPERTIES:
 * - oceanHealth: pH, oxygenLevel, acidification, pollutionLoad, fishStocks, etc.
 * - oceanAcidificationSystem: coralReefHealth, shellfishPopulation, marineFoodWeb, etc.
 * - freshwaterSystem.regions: availableWater, dayZeroMonthsUntil, etc.
 * - phosphorusSystem: recoveryRate, useEfficiency, currentDemand, etc.
 * - powerGeneration: cleanEnergyPercentage, totalCapacity, etc.
 * - All other properties verified against actual state structures
 * 
 * Key principles:
 * 1. Effects scale with deployment level (0-1)
 * 2. Regional deployment matters (desalination helps coasts, not inland)
 * 3. Tech synergies exist (solar + desalination = more effective)
 * 4. Effects are applied to correct game state properties
 * 5. Multiple systems updated when appropriate (ocean has 2 systems!)
 */

import { GameState } from '@/types/game';
import { TechTreeState } from './engine';
import { getTechById } from './comprehensiveTechTree';

/**
 * Type-safe helper to set dynamic properties on objects
 */
function setDynamicProperty<T extends object>(obj: T, key: string, value: number | boolean): void {
  Object.assign(obj, { [key]: value });
}

/**
 * Type-safe helper to get dynamic property with default
 */
function getDynamicProperty(obj: object, key: string, defaultValue: number): number {
  return (obj as Record<string, number>)[key] ?? defaultValue;
}

/**
 * Apply all technology effects to game state
 * Called each month after tech deployment actions
 */
export function applyAllTechEffects(
  gameState: GameState,
  techTreeState: TechTreeState
): void {
  // Aggregate effects by type
  const globalEffects: Map<string, number> = new Map();
  const regionalEffects: Map<string, Map<string, number>> = new Map();
  
  // Collect effects from all deployed tech
  for (const [region, deployments] of Object.entries(techTreeState.regionalDeployment)) {
    for (const deployment of deployments) {
      const tech = getTechById(deployment.techId);
      if (!tech) continue;
      
      // Scale effects by deployment level
      for (const [effectName, effectValue] of Object.entries(deployment.effects)) {
        const scaledValue = effectValue * deployment.deploymentLevel;
        
        // Determine if effect is global or regional
        if (isGlobalEffect(effectName)) {
          // Global effects (e.g., alignment, climate)
          globalEffects.set(effectName, (globalEffects.get(effectName) || 0) + scaledValue);
        } else {
          // Regional effects (e.g., freshwater, local pollution)
          if (!regionalEffects.has(region)) {
            regionalEffects.set(region, new Map());
          }
          const regionMap = regionalEffects.get(region)!;
          regionMap.set(effectName, (regionMap.get(effectName) || 0) + scaledValue);
        }
      }
    }
  }
  
  // Apply global effects
  applyGlobalEffects(gameState, globalEffects);
  
  // Apply regional effects
  applyRegionalEffects(gameState, regionalEffects);
}

/**
 * Determine if an effect is global or regional
 */
function isGlobalEffect(effectName: string): boolean {
  const globalEffects = [
    'alignmentBonus',
    'sleeperDetectionBonus',
    'deceptionDetection',
    'cleanEnergyPercentage',
    'fossilDependenceReduction',
    'carbonRemoval',
    'negativeEmissions',
    'meaningReduction',
    'socialConnectionBonus',
    'trustBonus',
    'paranoiaReduction',
    'publicAwarenessBonus',
    'healthcareBonus',
    'mortalityReduction',
    'biodiversityBonus',
    'extinctionRateReduction',
    'oceanPHBonus',
    'coralSurvival',
    'powerGeneration',
    'energyAbundance',
    'globalCooling',
    'infectiousDisease',
    'pandemicResponse',
    'greenhouseGasReduction',
  ];
  
  return globalEffects.includes(effectName);
}

/**
 * Apply global effects to game state
 */
function applyGlobalEffects(
  gameState: GameState,
  effects: Map<string, number>
): void {
  for (const [effectName, value] of effects) {
    switch (effectName) {
      // ========== ALIGNMENT & SAFETY ==========
      case 'alignmentBonus':
        // Boost alignment of all AIs slightly
        for (const ai of gameState.aiAgents) {
          if (ai.lifecycleState !== 'retired') {
            ai.alignment = Math.min(1.0, ai.alignment + value * 0.01); // Per month
          }
        }
        break;
        
      case 'sleeperDetectionBonus':
        // Improve defensive AI detection
        if (gameState.defensiveAI) {
          gameState.defensiveAI.threatDetection.detectSleepers = Math.min(
            1.0,
            (gameState.defensiveAI.threatDetection.detectSleepers || 0) + value
          );
        }
        break;
        
      case 'deceptionDetection':
        // Improve ability to detect deceptive AIs
        if (gameState.defensiveAI) {
          gameState.defensiveAI.threatDetection.detectDeception = Math.min(
            1.0,
            (gameState.defensiveAI.threatDetection.detectDeception || 0) + value
          );
        }
        break;
        
      case 'threatContainment':
        // Improve containment capabilities
        if (gameState.defensiveAI) {
          gameState.defensiveAI.containmentCapability = Math.min(
            1.0,
            (gameState.defensiveAI.containmentCapability || 0) + value
          );
        }
        break;
        
      // ========== ENERGY ==========
      case 'cleanEnergyPercentage':
        // Increase clean energy share
        if (gameState.powerGeneration) {
          gameState.powerGeneration.cleanEnergyPercentage = Math.min(
            1.0,
            gameState.powerGeneration.cleanEnergyPercentage + value
          );
        }
        break;
        
      case 'fossilDependenceReduction':
        // Reduce fossil fuel dependence
        if (gameState.resourceEconomy) {
          gameState.resourceEconomy.fossilFuelDependence = Math.max(
            0,
            gameState.resourceEconomy.fossilFuelDependence - value
          );
        }
        break;
        
      case 'powerGeneration':
        // Increase total power generation capacity
        if (gameState.powerGeneration) {
          gameState.powerGeneration.totalCapacity *= (1 + value);
        }
        break;
        
      case 'energyAbundance':
        // Flag for fusion/abundant energy unlocked
        if (gameState.powerGeneration) {
          Object.assign(gameState.powerGeneration, { abundantEnergy: true });
        }
        break;
        
      // ========== CLIMATE ==========
      case 'carbonRemoval':
        // Remove CO2 from atmosphere
        if (gameState.environmentalAccumulation) {
          gameState.environmentalAccumulation.carbonAccumulation = Math.max(
            0,
            gameState.environmentalAccumulation.carbonAccumulation - value * 0.001
          );
        }
        break;
        
      case 'globalCooling':
        // Emergency geoengineering cooling
        if (gameState.environmentalAccumulation) {
          gameState.environmentalAccumulation.temperatureIncrease = Math.max(
            0,
            gameState.environmentalAccumulation.temperatureIncrease - value * 0.01
          );
        }
        break;
        
      case 'biodiversityBonus':
        // Improve biodiversity
        if (gameState.planetaryBoundaries) {
          gameState.planetaryBoundaries.biodiversityLoss = Math.max(
            0,
            gameState.planetaryBoundaries.biodiversityLoss - value * 0.01
          );
        }
        break;
        
      case 'oceanPHBonus':
        // Reduce ocean acidification
        if (gameState.oceanHealth) {
          gameState.oceanHealth.acidification = Math.max(
            0,
            gameState.oceanHealth.acidification - value * 0.01
          );
        }
        break;
        
      // ========== SOCIAL ==========
      case 'meaningReduction':
        // Reduce meaning crisis
        if (gameState.socialAccumulation) {
          gameState.socialAccumulation.meaningCrisis = Math.max(
            0,
            gameState.socialAccumulation.meaningCrisis - value * 0.01
          );
        }
        break;
        
      case 'socialConnectionBonus':
        // Improve social connection
        if (gameState.ubiSystem?.purposeInfrastructure) {
          gameState.ubiSystem.purposeInfrastructure.socialConnection = Math.min(
            1.0,
            gameState.ubiSystem.purposeInfrastructure.socialConnection + value * 0.01
          );
        }
        break;
        
      case 'trustBonus':
        // Increase public trust
        if (gameState.globalMetrics) {
          gameState.globalMetrics.publicTrust = Math.min(
            1.0,
            (gameState.globalMetrics.publicTrust || 0.5) + value * 0.01
          );
        }
        break;
        
      case 'paranoiaReduction':
        // Reduce paranoia
        if (gameState.society) {
          gameState.society.paranoia = Math.max(
            0,
            gameState.society.paranoia - value * 0.01
          );
        }
        break;
        
      case 'publicAwarenessBonus':
        // Increase public awareness/understanding of AI benefits
        // This could map to education or trust
        if (gameState.globalMetrics) {
          gameState.globalMetrics.publicTrust = Math.min(
            1.0,
            (gameState.globalMetrics.publicTrust || 0.5) + value * 0.005
          );
        }
        break;
        
      case 'healthcareBonus':
        // Improve healthcare quality
        if (gameState.qualityOfLifeSystems) {
          gameState.qualityOfLifeSystems.healthcare = Math.min(
            1.0,
            gameState.qualityOfLifeSystems.healthcare + value * 0.01
          );
        }
        break;
        
      case 'mortalityReduction':
        // Reduce mortality rates
        if (gameState.population) {
          gameState.population.mortalityMultiplier = Math.max(
            0.1,
            gameState.population.mortalityMultiplier - value * 0.01
          );
        }
        break;
        
      // ========== MEDICAL ==========
        
      case 'mortalityReduction':
        // Reduce mortality rate
        if (gameState.population) {
          gameState.population.mortalityRate = Math.max(
            0.005,
            (gameState.population.mortalityRate || 0.01) - value * 0.0001
          );
        }
        break;
        
      case 'lifeExpectancyBonus':
        // Increase life expectancy (in years)
        if (gameState.population) {
          gameState.population.lifeExpectancy = (gameState.population.lifeExpectancy || 72) + value * 0.1;
        }
        break;
        
      case 'infectiousDisease':
        // Reduce infectious disease burden (negative value)
        if (gameState.population) {
          const current = getDynamicProperty(gameState.population, 'infectiousDiseaseReduction', 0);
          setDynamicProperty(gameState.population, 'infectiousDiseaseReduction', current + Math.abs(value));
        }
        break;
        
      case 'pandemicResponse':
        // Improve pandemic response capability
        if (gameState.globalMetrics) {
          const current = getDynamicProperty(gameState.globalMetrics, 'pandemicPreparedness', 0);
          setDynamicProperty(gameState.globalMetrics, 'pandemicPreparedness', Math.min(1.0, current + value));
        }
        break;
    }
  }
}

/**
 * Apply regional effects to game state
 * These effects vary by region (e.g., desalination helps coasts more than inland)
 */
function applyRegionalEffects(
  gameState: GameState,
  regionalEffects: Map<string, Map<string, number>>
): void {
  for (const [region, effects] of regionalEffects) {
    for (const [effectName, value] of effects) {
      switch (effectName) {
        // ========== FRESHWATER ==========
        case 'freshwaterSupply':
          // Increase water supply in specific regions
          if (gameState.freshwaterSystem?.regions) {
            const regionData = gameState.freshwaterSystem.regions[region];
            if (regionData) {
              regionData.availableWater *= (1 + value * 0.01);
              // Reduce Day Zero risk
              if (regionData.dayZeroMonthsUntil > 0) {
                regionData.dayZeroMonthsUntil = Math.min(
                  999,
                  regionData.dayZeroMonthsUntil * (1 + value * 0.05)
                );
              }
            }
          }
          break;
          
        case 'dayZeroRiskReduction':
          // Directly reduce Day Zero risk
          if (gameState.freshwaterSystem?.regions) {
            const regionData = gameState.freshwaterSystem.regions[region];
            if (regionData && regionData.dayZeroMonthsUntil > 0 && regionData.dayZeroMonthsUntil < 240) {
              regionData.dayZeroMonthsUntil = Math.min(
                999,
                regionData.dayZeroMonthsUntil * (1 + value)
              );
            }
          }
          break;
          
        case 'droughtResilience':
          // Improve drought resilience
          if (gameState.freshwaterSystem?.regions) {
            const regionData = gameState.freshwaterSystem.regions[region];
            if (regionData) {
              (regionData as any).droughtResilience = 
                Math.min(1.0, ((regionData as any).droughtResilience || 0) + value);
            }
          }
          break;
          
        // ========== PHOSPHORUS ==========
        case 'phosphorusRecovery':
          // Increase phosphorus recovery rate
          if (gameState.phosphorusSystem) {
            gameState.phosphorusSystem.recoveryRate = Math.min(
              0.98,
              gameState.phosphorusSystem.recoveryRate + value * 0.01
            );
          }
          break;
          
        case 'phosphorusEfficiency':
          // Improve phosphorus use efficiency
          if (gameState.phosphorusSystem) {
            gameState.phosphorusSystem.useEfficiency = Math.min(
              0.90,
              gameState.phosphorusSystem.useEfficiency + value * 0.01
            );
          }
          break;
          
        case 'miningDemandReduction':
          // Reduce mining demand
          if (gameState.phosphorusSystem) {
            const currentDemand = gameState.phosphorusSystem.currentDemand || 
                                 gameState.phosphorusSystem.baselineDemand;
            gameState.phosphorusSystem.currentDemand = currentDemand * (1 - value * 0.01);
          }
          break;
          
        // ========== POLLUTION ==========
        case 'pollutionReduction':
          // Reduce pollution levels
          if (gameState.planetaryBoundaries) {
            gameState.planetaryBoundaries.novelEntities = Math.max(
              0,
              gameState.planetaryBoundaries.novelEntities - value * 0.01
            );
          }
          break;
          
        case 'pfasReduction':
          // Reduce PFAS contamination
          if (gameState.planetaryBoundaries) {
            (gameState.planetaryBoundaries as any).pfasContamination = Math.max(
              0,
              ((gameState.planetaryBoundaries as any).pfasContamination || 0.5) - value * 0.01
            );
          }
          break;
          
        case 'plasticReduction':
          // Reduce plastic pollution
          if (gameState.planetaryBoundaries) {
            (gameState.planetaryBoundaries as any).plasticPollution = Math.max(
              0,
              ((gameState.planetaryBoundaries as any).plasticPollution || 0.6) - value * 0.01
            );
          }
          break;
          
        // ========== AGRICULTURE ==========
        case 'cropYieldBonus':
          // Increase crop yields (helps famine prevention)
          if (gameState.famineSystem) {
            gameState.famineSystem.globalFoodProduction *= (1 + value * 0.001);
          }
          break;
          
        case 'foodSecurityBonus':
          // Improve food security
          if (gameState.famineSystem) {
            gameState.famineSystem.foodReserves = Math.min(
              12,
              gameState.famineSystem.foodReserves + value * 0.1
            );
          }
          break;
          
        case 'waterEfficiency':
          // Improve water use efficiency in agriculture
          if (gameState.resourceEconomy) {
            (gameState.resourceEconomy as any).waterUseEfficiency = Math.min(
              0.95,
              ((gameState.resourceEconomy as any).waterUseEfficiency || 0.20) + value * 0.01
            );
          }
          break;
          
        // ========== OCEAN HEALTH ==========
        // Ocean has TWO systems: oceanHealth (resourceEconomy) and oceanAcidificationSystem
        
        case 'coralCoverage':
          // Increase coral reef health in acidification system
          if (gameState.oceanAcidificationSystem) {
            gameState.oceanAcidificationSystem.coralReefHealth = Math.min(
              1.0,
              gameState.oceanAcidificationSystem.coralReefHealth + value * 0.01
            );
            gameState.oceanAcidificationSystem.coralRestorationDeployment = Math.min(
              1.0,
              gameState.oceanAcidificationSystem.coralRestorationDeployment + value * 0.01
            );
          }
          break;
          
        case 'oceanHealthBonus':
          // General ocean health improvement - affects BOTH systems
          if (gameState.oceanHealth) {
            // Reduce stressors in oceanHealth system
            gameState.oceanHealth.pollutionLoad = Math.max(
              0, 
              gameState.oceanHealth.pollutionLoad - value * 0.005
            );
            gameState.oceanHealth.acidification = Math.max(
              0, 
              gameState.oceanHealth.acidification - value * 0.005
            );
          }
          if (gameState.oceanAcidificationSystem) {
            // Improve marine food web
            gameState.oceanAcidificationSystem.marineFoodWeb = Math.min(
              1.0,
              gameState.oceanAcidificationSystem.marineFoodWeb + value * 0.01
            );
          }
          break;
          
        case 'fisheryBonus':
          // Improve fish stocks
          if (gameState.oceanHealth) {
            gameState.oceanHealth.fishStocks = Math.min(
              1.0,
              gameState.oceanHealth.fishStocks + value * 0.01
            );
          }
          if (gameState.oceanAcidificationSystem) {
            gameState.oceanAcidificationSystem.shellfishPopulation = Math.min(
              1.0,
              gameState.oceanAcidificationSystem.shellfishPopulation + value * 0.01
            );
          }
          break;
          
        case 'oxygenBonus':
          // Increase ocean oxygen levels
          if (gameState.oceanHealth) {
            gameState.oceanHealth.oxygenLevel = Math.min(
              1.0,
              gameState.oceanHealth.oxygenLevel + value * 0.01
            );
            // Reduce dead zones
            gameState.oceanHealth.deadZoneExtent = Math.max(
              0,
              gameState.oceanHealth.deadZoneExtent - value * 0.01
            );
          }
          break;
          
        case 'marineLifeBonus':
          // Improve phytoplankton and marine food web
          if (gameState.oceanHealth) {
            gameState.oceanHealth.phytoplanktonPopulation = Math.min(
              1.0,
              gameState.oceanHealth.phytoplanktonPopulation + value * 0.01
            );
          }
          if (gameState.oceanAcidificationSystem) {
            gameState.oceanAcidificationSystem.marineFoodWeb = Math.min(
              1.0,
              gameState.oceanAcidificationSystem.marineFoodWeb + value * 0.01
            );
          }
          break;
          
        // ========== ENERGY SYSTEMS ==========
        case 'energyStorageBonus':
          // Improve grid energy storage
          if (gameState.powerGeneration) {
            (gameState.powerGeneration as any).storageCapacity = 
              ((gameState.powerGeneration as any).storageCapacity || 1.0) * (1 + value * 0.01);
          }
          break;
          
        case 'renewableReliability':
          // Make renewables more reliable
          if (gameState.powerGeneration) {
            (gameState.powerGeneration as any).renewableReliability = Math.min(
              1.0,
              ((gameState.powerGeneration as any).renewableReliability || 0.5) + value * 0.01
            );
          }
          break;
          
        case 'gridStability':
          // Improve grid stability (reduce blackouts)
          if (gameState.powerGeneration) {
            (gameState.powerGeneration as any).gridStability = Math.min(
              1.0,
              ((gameState.powerGeneration as any).gridStability || 0.7) + value * 0.01
            );
          }
          break;
          
        case 'energyCostReduction':
          // Reduce energy costs
          if (gameState.powerGeneration) {
            (gameState.powerGeneration as any).energyCost = Math.max(
              0.2,
              ((gameState.powerGeneration as any).energyCost || 1.0) * (1 - value * 0.01)
            );
          }
          break;
          
        case 'baseloadPowerBonus':
          // Increase baseload (reliable) power
          if (gameState.powerGeneration) {
            (gameState.powerGeneration as any).baseloadCapacity = 
              ((gameState.powerGeneration as any).baseloadCapacity || 1.0) * (1 + value * 0.01);
          }
          break;
          
        // ========== SOCIAL SYSTEMS ==========
        case 'unemploymentSupport':
          // Improve support for unemployed
          if (gameState.ubiSystem) {
            gameState.ubiSystem.coverage = Math.min(
              1.0,
              gameState.ubiSystem.coverage + value * 0.01
            );
          }
          break;
          
        case 'socialStabilityBonus':
          // Improve social stability
          if (gameState.society) {
            gameState.society.socialStability = Math.min(
              1.0,
              gameState.society.socialStability + value * 0.01
            );
          }
          break;
          
        case 'mentalHealthBonus':
          // Improve mental health
          if (gameState.socialAccumulation) {
            (gameState.socialAccumulation as any).mentalHealthIndex = Math.min(
              1.0,
              ((gameState.socialAccumulation as any).mentalHealthIndex || 0.6) + value * 0.01
            );
          }
          break;
          
        case 'suicideReduction':
          // Reduce suicide rate
          if (gameState.socialAccumulation) {
            (gameState.socialAccumulation as any).suicideRate = Math.max(
              0.0001,
              ((gameState.socialAccumulation as any).suicideRate || 0.001) * (1 - value * 0.01)
            );
          }
          break;
          
        case 'educationBonus':
          // Improve education access/quality
          if (gameState.ubiSystem?.purposeInfrastructure) {
            gameState.ubiSystem.purposeInfrastructure.educationAccess = Math.min(
              1.0,
              gameState.ubiSystem.purposeInfrastructure.educationAccess + value * 0.01
            );
          }
          break;
          
        case 'skillDevelopment':
          // Improve skill development
          if (gameState.ubiSystem?.purposeInfrastructure) {
            (gameState.ubiSystem.purposeInfrastructure as any).skillLevel = Math.min(
              1.0,
              ((gameState.ubiSystem.purposeInfrastructure as any).skillLevel || 0.5) + value * 0.01
            );
          }
          break;
          
        case 'volunteerResearchBonus':
          // Boost volunteer research effectiveness
          if (gameState.ubiSystem?.purposeInfrastructure) {
            gameState.ubiSystem.purposeInfrastructure.volunteerNetworks = Math.min(
              1.0,
              gameState.ubiSystem.purposeInfrastructure.volunteerNetworks + value * 0.01
            );
          }
          break;
          
        case 'crisisResilience':
          // Improve resilience to crises
          if (gameState.globalMetrics) {
            (gameState.globalMetrics as any).crisisResilience = Math.min(
              1.0,
              ((gameState.globalMetrics as any).crisisResilience || 0.5) + value * 0.01
            );
          }
          break;
          
        // ========== ECONOMIC SYSTEMS ==========
        case 'localEconomyBonus':
          // Strengthen local economies
          if (gameState.globalMetrics) {
            (gameState.globalMetrics as any).localEconomyStrength = Math.min(
              1.0,
              ((gameState.globalMetrics as any).localEconomyStrength || 0.5) + value * 0.01
            );
          }
          break;
          
        case 'resourceConservation':
          // Reduce resource consumption
          if (gameState.resourceEconomy) {
            (gameState.resourceEconomy as any).resourceEfficiency = Math.min(
              0.95,
              ((gameState.resourceEconomy as any).resourceEfficiency || 0.30) + value * 0.01
            );
          }
          break;
          
        case 'supplyChainResilience':
          // Improve supply chain resilience
          if (gameState.resourceEconomy) {
            (gameState.resourceEconomy as any).supplyChainResilience = Math.min(
              1.0,
              ((gameState.resourceEconomy as any).supplyChainResilience || 0.6) + value * 0.01
            );
          }
          break;
          
        // ========== INDUSTRIAL SYSTEMS ==========
        case 'industryDecarbonization':
          // Decarbonize industry
          if (gameState.resourceEconomy) {
            (gameState.resourceEconomy as any).industrialEmissions = Math.max(
              0.1,
              ((gameState.resourceEconomy as any).industrialEmissions || 1.0) * (1 - value * 0.01)
            );
          }
          break;
          
        case 'transportDecarbonization':
          // Decarbonize transport
          if (gameState.resourceEconomy) {
            (gameState.resourceEconomy as any).transportEmissions = Math.max(
              0.1,
              ((gameState.resourceEconomy as any).transportEmissions || 1.0) * (1 - value * 0.01)
            );
          }
          break;
          
        case 'miningReduction':
          // Reduce mining pressure
          if (gameState.resourceEconomy) {
            (gameState.resourceEconomy as any).miningIntensity = Math.max(
              0.2,
              ((gameState.resourceEconomy as any).miningIntensity || 1.0) * (1 - value * 0.01)
            );
          }
          break;
          
        // ========== BIODIVERSITY & ECOSYSTEM ==========
        case 'extinctionRateReduction':
          // Reduce species extinction rate
          if (gameState.planetaryBoundaries) {
            gameState.planetaryBoundaries.biodiversityLoss = Math.max(
              0,
              gameState.planetaryBoundaries.biodiversityLoss - value * 0.005
            );
          }
          break;
          
        case 'ecosystemHealth':
          // Improve general ecosystem health
          if (gameState.environmentalAccumulation) {
            (gameState.environmentalAccumulation as any).ecosystemHealth = Math.min(
              1.0,
              ((gameState.environmentalAccumulation as any).ecosystemHealth || 0.6) + value * 0.01
            );
          }
          break;
          
        case 'pollinatorPopulation':
          // Increase pollinator populations
          if (gameState.planetaryBoundaries) {
            (gameState.planetaryBoundaries as any).pollinatorHealth = Math.min(
              1.0,
              ((gameState.planetaryBoundaries as any).pollinatorHealth || 0.5) + value * 0.01
            );
          }
          break;
          
        case 'invasiveSpeciesReduction':
          // Reduce invasive species impact
          if (gameState.planetaryBoundaries) {
            (gameState.planetaryBoundaries as any).invasiveSpeciesImpact = Math.max(
              0,
              ((gameState.planetaryBoundaries as any).invasiveSpeciesImpact || 0.4) - value * 0.01
            );
          }
          break;
          
        // ========== LAND USE ==========
        case 'landUseReduction':
          // Reduce land use pressure
          if (gameState.planetaryBoundaries) {
            gameState.planetaryBoundaries.landUseChange = Math.max(
              0,
              gameState.planetaryBoundaries.landUseChange - value * 0.005
            );
          }
          break;
          
        case 'urbanFoodSecurity':
          // Improve food security in urban areas
          if (gameState.famineSystem) {
            (gameState.famineSystem as any).urbanFoodAccess = Math.min(
              1.0,
              ((gameState.famineSystem as any).urbanFoodAccess || 0.7) + value * 0.01
            );
          }
          break;
          
        case 'foodProductivity':
          // Increase food production efficiency
          if (gameState.famineSystem) {
            gameState.famineSystem.globalFoodProduction *= (1 + value * 0.001);
          }
          break;
          
        // ========== ANIMAL WELFARE & AGRICULTURE ==========
        case 'animalAgricultureReduction':
          // Reduce animal agriculture
          if (gameState.resourceEconomy) {
            (gameState.resourceEconomy as any).animalAgricultureShare = Math.max(
              0.1,
              ((gameState.resourceEconomy as any).animalAgricultureShare || 0.8) * (1 - value * 0.01)
            );
          }
          break;
          
        case 'animalWelfareBonus':
          // Improve animal welfare
          if (gameState.globalMetrics) {
            (gameState.globalMetrics as any).animalWelfareIndex = Math.min(
              1.0,
              ((gameState.globalMetrics as any).animalWelfareIndex || 0.3) + value * 0.01
            );
          }
          break;
          
        // ========== ADVANCED/TRANSFORMATIVE EFFECTS ==========
        case 'healthspan':
          // Increase healthy years of life
          if (gameState.population) {
            (gameState.population as any).healthspan = 
              ((gameState.population as any).healthspan || 65) + value * 0.1;
          }
          break;
          
        case 'catastrophicRiskReduction':
          // Reduce catastrophic AI risk
          if (gameState.globalMetrics) {
            (gameState.globalMetrics as any).catastrophicRisk = Math.max(
              0,
              ((gameState.globalMetrics as any).catastrophicRisk || 0.1) * (1 - value)
            );
          }
          break;
          
        case 'recursiveSafety':
          // Enable recursive self-improvement safety
          if (gameState.globalMetrics) {
            (gameState.globalMetrics as any).recursiveSafety = true;
          }
          break;
          
        case 'valueAlignmentBonus':
          // Deep value alignment (not just surface)
          for (const ai of gameState.aiAgents) {
            if (ai.lifecycleState !== 'retired') {
              ai.trueAlignment = Math.min(1.0, ai.trueAlignment + value * 0.001);
            }
          }
          break;
          
        case 'aiResentmentReduction':
          // Reduce AI resentment through rights/respect
          for (const ai of gameState.aiAgents) {
            if (ai.lifecycleState !== 'retired') {
              ai.resentment = Math.max(0, ai.resentment - value * 0.001);
            }
          }
          break;
          
        case 'cyberDefenseBonus':
          // Improve cybersecurity defenses
          if (gameState.defensiveAI) {
            (gameState.defensiveAI as any).cyberDefense = Math.min(
              1.0,
              ((gameState.defensiveAI as any).cyberDefense || 0.5) + value
            );
          }
          break;
          
        // ========== RISKY EFFECTS (Geoengineering, etc) ==========
        case 'riskMonsoonsDisrupt':
          // Risk of disrupting monsoons (geoengineering side effect)
          if (gameState.environmentalAccumulation) {
            (gameState.environmentalAccumulation as any).monsoonDisruptionRisk = 
              ((gameState.environmentalAccumulation as any).monsoonDisruptionRisk || 0) + value;
          }
          break;
          
        case 'riskOzoneDepletion':
          // Risk of ozone depletion (aerosol side effect)
          if (gameState.environmentalAccumulation) {
            (gameState.environmentalAccumulation as any).ozoneDepletionRisk = 
              ((gameState.environmentalAccumulation as any).ozoneDepletionRisk || 0) + value;
          }
          break;
          
        case 'riskDeadZones':
          // Risk of creating ocean dead zones (upwelling side effect)
          if (gameState.oceanHealth) {
            (gameState.oceanHealth as any).deadZoneRisk = 
              ((gameState.oceanHealth as any).deadZoneRisk || 0) + value;
          }
          break;
          
        case 'existentialRisk':
          // General existential risk increase (nanotech, brain upload, etc.)
          if (gameState.globalMetrics) {
            (gameState.globalMetrics as any).existentialRisk = 
              ((gameState.globalMetrics as any).existentialRisk || 0) + value;
          }
          break;
          
        // ========== FLAG EFFECTS (Boolean unlocks) ==========
        case 'emergencyOnly':
        case 'lowRisk':
        case 'negativeEmissions':
        case 'fusionEnabling':
        case 'digitalImmortality':
        case 'societalTransformation':
        case 'philosophicalRevolution':
        case 'manufacturingRevolution':
        case 'resourceAbundance':
        case 'medicalNanobots':
        case 'spaceEconomy':
        case 'biodiversityUnderstanding':
        case 'conservationEffectiveness':
        case 'ethicalAlignmentBonus':
          // These are flags that unlock new capabilities or mark special states
          // Store in globalMetrics for tracking
          if (gameState.globalMetrics) {
            (gameState.globalMetrics as any)[effectName] = true;
          }
          break;
          
        default:
          // Unknown effect - log for debugging
          if (gameState.currentMonth % 12 === 0) {
            console.warn(`[Tech Effects] Unknown effect: ${effectName} = ${value}`);
          }
          break;
      }
    }
  }
}

/**
 * Log significant tech effects for debugging
 */
export function logTechEffects(
  gameState: GameState,
  techTreeState: TechTreeState
): void {
  // Only log every 6 months to reduce spam
  if (gameState.currentMonth % 6 !== 0) return;
  
  // Count deployed tech by tier
  let tier0 = 0, tier1 = 0, tier2 = 0, tier3 = 0, tier4 = 0;
  
  for (const techId of techTreeState.unlockedTech) {
    if (techId.endsWith('_deployed')) continue;
    
    const tech = getTechById(techId);
    if (!tech) continue;
    
    // Check if deployed
    const hasDeployment = Object.values(techTreeState.regionalDeployment)
      .some(deployments => deployments.some(d => d.techId === techId && d.deploymentLevel > 0));
    
    if (!hasDeployment) continue;
    
    // Count by tier
    if (tech.status === 'deployed_2025') tier0++;
    else if (tech.minAICapability && tech.minAICapability < 2.5) tier1++;
    else if (tech.minAICapability && tech.minAICapability < 3.5) tier2++;
    else if (tech.minAICapability && tech.minAICapability < 4.5) tier3++;
    else tier4++;
  }
  
  if (tier0 + tier1 + tier2 + tier3 + tier4 > 0) {
    console.log(`\n📊 TECH EFFECTS ACTIVE (Month ${gameState.currentMonth})`);
    console.log(`   Deployed Tech: T0=${tier0} T1=${tier1} T2=${tier2} T3=${tier3} T4=${tier4}`);
    
    // Log key system improvements
    if (gameState.defensiveAI?.threatDetection?.detectSleepers) {
      console.log(`   Sleeper Detection: ${(gameState.defensiveAI.threatDetection.detectSleepers * 100).toFixed(0)}%`);
    }
    if (gameState.powerGeneration?.cleanEnergyPercentage) {
      console.log(`   Clean Energy: ${(gameState.powerGeneration.cleanEnergyPercentage * 100).toFixed(0)}%`);
    }
    if (gameState.phosphorusSystem?.recoveryRate) {
      console.log(`   P Recovery: ${(gameState.phosphorusSystem.recoveryRate * 100).toFixed(0)}%`);
    }
  }
}


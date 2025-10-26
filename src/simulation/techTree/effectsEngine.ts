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
import { assertFinite, assertStateProperty } from '../utils/assertions';

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
          // Note: Map.get() returns undefined for new keys - fallback is valid here
          globalEffects.set(effectName, (globalEffects.get(effectName) ?? 0) + scaledValue);
        } else {
          // Regional effects (e.g., freshwater, local pollution)
          if (!regionalEffects.has(region)) {
            regionalEffects.set(region, new Map());
          }
          const regionMap = regionalEffects.get(region)!;
          // Note: Map.get() returns undefined for new keys - fallback is valid here
          regionMap.set(effectName, (regionMap.get(effectName) ?? 0) + scaledValue);
        }
      }
      
      // NEW: Apply capability dimension boosts from this tech
      if (tech.capabilityEffects && deployment.deploymentLevel > 0) {
        applyCapabilityBoosts(gameState, tech.capabilityEffects, deployment.deploymentLevel);
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
    'habitatRestorationActive',
    'rewildingActive',
    'habitatRestorationBoost',
    'rewildingBoost',
    'carbonSequestration',
    'ecosystemHealth',
  ];
  
  return globalEffects.includes(effectName);
}

/**
 * Apply capability dimension boosts to all active AIs
 * Technologies can advance AI capabilities in specific dimensions
 */
function applyCapabilityBoosts(
  gameState: GameState,
  capabilityEffects: {
    dimensions?: Partial<Record<'physical' | 'digital' | 'cognitive' | 'social' | 'economic' | 'selfImprovement', number>>;
    research?: {
      domain: 'biotech' | 'materials' | 'climate' | 'computerScience';
      subdomain?: string;
      boost: number;
    }[];
  },
  deploymentLevel: number
): void {
  // Apply to all active AIs
  const activeAIs = gameState.aiAgents.filter(ai => ai.lifecycleState !== 'retired');
  
  for (const ai of activeAIs) {
    // Apply dimensional boosts
    if (capabilityEffects.dimensions) {
      for (const [dimension, boost] of Object.entries(capabilityEffects.dimensions)) {
        const dimKey = dimension as keyof typeof ai.capabilityProfile;
        if (dimKey === 'research') continue; // Handle research separately

        // Scale boost by deployment level and apply (monthly increment)
        const scaledBoost = boost * deploymentLevel * 0.01; // 1% per month at full deployment

        // FIX #25 (Oct 25, 2025): Fail loudly if capability dimension missing/invalid
        const currentValue = ai.capabilityProfile[dimKey];
        if (currentValue === undefined) {
          throw new Error(`Capability dimension ${dimKey} missing in AI ${ai.id} profile`);
        }

        const validatedValue = assertFinite(currentValue, {
          location: 'applyCapabilityBoosts',
          valueName: `capability.${dimKey}`,
          month: gameState.currentMonth,
          additionalInfo: { aiId: ai.id, dimension: dimKey }
        });

        ai.capabilityProfile[dimKey] = assertFinite(Math.min(
          10.0, // Cap at 10.0
          validatedValue + scaledBoost
        ), {
        location: 'applyRegionalEffects:unknown',
        valueName: 'value',
        month: gameState.currentMonth
      });
      }
    }
    
    // Apply research capability boosts
    if (capabilityEffects.research) {
      for (const researchBoost of capabilityEffects.research) {
        const { domain, subdomain, boost } = researchBoost;
        const scaledBoost = boost * deploymentLevel * 0.01;

        const domainCap = ai.capabilityProfile.research[domain];

        if (subdomain && typeof domainCap === 'object') {
          // Boost specific subdomain
          const currentValue = (domainCap as any)[subdomain];

          // FIX #25 (Oct 25, 2025): Fail loudly if subdomain missing
          if (currentValue === undefined) {
            throw new Error(`Research subdomain ${domain}.${subdomain} missing in AI ${ai.id} capability profile`);
          }

          const validatedValue = assertFinite(currentValue, {
            location: 'applyCapabilityBoosts',
            valueName: `research.${domain}.${subdomain}`,
            month: gameState.currentMonth,
            additionalInfo: { aiId: ai.id, domain, subdomain }
          });
          (domainCap as any)[subdomain] = assertFinite(Math.min(5.0, validatedValue + scaledBoost), {
        location: 'applyRegionalEffects:unknown',
        valueName: 'value',
        month: gameState.currentMonth
      });
        } else if (!subdomain && typeof domainCap === 'object') {
          // Boost all subdomains equally
          for (const key of Object.keys(domainCap)) {
            const currentValue = (domainCap as any)[key];

            // FIX #25 (Oct 25, 2025): Fail loudly if subdomain missing
            if (currentValue === undefined) {
              throw new Error(`Research subdomain ${domain}.${key} missing in AI ${ai.id} capability profile`);
            }

            const validatedValue = assertFinite(currentValue, {
              location: 'applyCapabilityBoosts',
              valueName: `research.${domain}.${key}`,
              month: gameState.currentMonth,
              additionalInfo: { aiId: ai.id, domain, subdomain: key }
            });
            (domainCap as any)[key] = assertFinite(Math.min(5.0, validatedValue + scaledBoost), {
        location: 'applyRegionalEffects:unknown',
        valueName: 'value',
        month: gameState.currentMonth
      });
          }
        }
      }
    }

    // Recalculate total capability
    const { calculateTotalCapabilityFromProfile } = require('../capabilities');
    const newCapability = calculateTotalCapabilityFromProfile(ai.capabilityProfile);

    // FIX (Oct 25, 2025): Replaced defensive NaN guard with assertive validation
    // If capability calculation produces NaN, that's a BUG in calculateTotalCapabilityFromProfile
    ai.capability = assertFinite(newCapability, {
      location: 'applyCapabilityBoosts',
      valueName: `ai.capability (AI ${ai.id})`,
      month: gameState.currentMonth,
      additionalInfo: { aiId: ai.id, alignment: ai.alignment }
    });
  }
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
            ai.alignment = assertFinite(Math.min(1.0, ai.alignment + value * 0.01), {
        location: 'applyRegionalEffects:alignmentBonus',
        valueName: 'alignment',
        month: gameState.currentMonth
      }); // Per month
          }
        }
        break;
        
      case 'sleeperDetectionBonus':
        // Improve defensive AI detection
        if (gameState.defensiveAI) {
          // FIX #25 (Oct 25, 2025): Use assertion instead of fallback
          const current = assertStateProperty(
            gameState.defensiveAI.threatDetection,
            'detectSleepers',
            { location: 'applyGlobalEffects.sleeperDetection', month: gameState.currentMonth }
          );
          gameState.defensiveAI.threatDetection.detectSleepers = assertFinite(Math.min(1.0, current + value), {
        location: 'applyRegionalEffects:sleeperDetectionBonus',
        valueName: 'detectSleepers',
        month: gameState.currentMonth
      });
        }
        break;
        
      case 'deceptionDetection':
        // Improve ability to detect deceptive sleeper AIs
        if (gameState.defensiveAI) {
          gameState.defensiveAI.threatDetection.detectSleepers = assertFinite(Math.min(
            1.0,
            gameState.defensiveAI.threatDetection.detectSleepers + value
          ), {
        location: 'applyRegionalEffects:deceptionDetection',
        valueName: 'detectSleepers',
        month: gameState.currentMonth
      });
        }
        break;

      case 'threatContainment':
        // Improve containment capabilities via autonomy override
        if (gameState.defensiveAI) {
          gameState.defensiveAI.autonomyOverride.vetoAuthority = assertFinite(Math.min(
            1.0,
            gameState.defensiveAI.autonomyOverride.vetoAuthority + value
          ), {
        location: 'applyRegionalEffects:threatContainment',
        valueName: 'vetoAuthority',
        month: gameState.currentMonth
      });
        }
        break;
        
      // ========== ENERGY ==========
      case 'cleanEnergyPercentage':
        // Increase clean energy share (renewable percentage)
        if (gameState.powerGenerationSystem) {
          gameState.powerGenerationSystem.renewablePercentage = assertFinite(Math.min(
            1.0,
            gameState.powerGenerationSystem.renewablePercentage + value
          ), {
        location: 'applyRegionalEffects:cleanEnergyPercentage',
        valueName: 'renewablePercentage',
        month: gameState.currentMonth
      });
          // Also reduce fossil percentage
          gameState.powerGenerationSystem.fossilPercentage = assertFinite(Math.max(
            0,
            gameState.powerGenerationSystem.fossilPercentage - value
          ), {
        location: 'applyRegionalEffects:cleanEnergyPercentage',
        valueName: 'fossilPercentage',
        month: gameState.currentMonth
      });
        }
        break;

      case 'fossilDependenceReduction':
        // Reduce fossil fuel dependence
        if (gameState.resourceEconomy) {
          gameState.resourceEconomy.fossilDependence = assertFinite(Math.max(
            0,
            gameState.resourceEconomy.fossilDependence - value
          ), {
        location: 'applyRegionalEffects:fossilDependenceReduction',
        valueName: 'fossilDependence',
        month: gameState.currentMonth
      });
        }
        break;

      case 'powerGeneration':
        // Increase total power generation capacity
        if (gameState.powerGenerationSystem) {
          gameState.powerGenerationSystem.totalElectricityGeneration *= (1 + value);
        }
        break;

      case 'energyAbundance':
        // Flag for fusion/abundant energy unlocked
        if (gameState.powerGenerationSystem) {
          Object.assign(gameState.powerGenerationSystem, { abundantEnergy: true });
        }
        break;
        
      // ========== CLIMATE ==========
      case 'carbonRemoval':
        // Remove CO2 from atmosphere
        if (gameState.resourceEconomy?.co2) {
          gameState.resourceEconomy.co2.atmosphericCO2 = assertFinite(Math.max(
            280, // Pre-industrial baseline
            gameState.resourceEconomy.co2.atmosphericCO2 - value * 0.1
          ), {
        location: 'applyRegionalEffects:carbonRemoval',
        valueName: 'atmosphericCO2',
        month: gameState.currentMonth
      });
        }
        break;
        
      case 'globalCooling':
        // Emergency geoengineering cooling
        if (gameState.resourceEconomy?.co2) {
          gameState.resourceEconomy.co2.temperatureAnomaly = assertFinite(Math.max(
            0,
            gameState.resourceEconomy.co2.temperatureAnomaly - value * 0.01
          ), {
        location: 'applyRegionalEffects:globalCooling',
        valueName: 'temperatureAnomaly',
        month: gameState.currentMonth
      });
        }
        break;

      case 'regionalCooling':
        // Regional cooling from marine cloud brightening
        if (gameState.resourceEconomy?.co2) {
          // Less effective than global cooling but safer
          gameState.resourceEconomy.co2.temperatureAnomaly = assertFinite(Math.max(
            0,
            gameState.resourceEconomy.co2.temperatureAnomaly - value * 0.005
          ), {
        location: 'applyRegionalEffects:regionalCooling',
        valueName: 'temperatureAnomaly',
        month: gameState.currentMonth
      });
        }
        // Flag that regional cooling is active
        if (gameState.globalMetrics) {
          setDynamicProperty(gameState.globalMetrics, 'regionalCoolingActive', true);
        }
        break;

      case 'greenhouseGasReduction':
        // Reduce greenhouse gas emissions from agriculture
        if (gameState.resourceEconomy?.co2) {
          // Reduce atmospheric CO2 directly
          gameState.resourceEconomy.co2.atmosphericCO2 = assertFinite(Math.max(
            280,
            gameState.resourceEconomy.co2.atmosphericCO2 - value * 0.5
          ), {
        location: 'applyRegionalEffects:greenhouseGasReduction',
        valueName: 'atmosphericCO2',
        month: gameState.currentMonth
      });
        }
        break;

      case 'biodiversityBonus':
        // Improve biodiversity
        if (gameState.planetaryBoundariesSystem?.boundaries?.biosphere_integrity) {
          const boundary = gameState.planetaryBoundariesSystem.boundaries.biosphere_integrity;
          boundary.currentValue = assertFinite(Math.max(
            0,
            boundary.currentValue - value * 0.01
          ), {
        location: 'applyRegionalEffects:biodiversityBonus',
        valueName: 'currentValue',
        month: gameState.currentMonth
      });
        }
        break;

      case 'habitatRestorationActive':
        // Flag that habitat restoration is deployed
        // Used by planetaryBoundaryRecovery.ts to unlock biosphere recovery beyond 25%
        if (gameState.globalMetrics) {
          setDynamicProperty(gameState.globalMetrics, 'habitatRestorationActive', value);
        }
        break;

      case 'rewildingActive':
        // Flag that ecological proxy rewilding is deployed
        // Provides bonus to habitat restoration effectiveness
        if (gameState.globalMetrics) {
          setDynamicProperty(gameState.globalMetrics, 'rewildingActive', value);
        }
        break;

      case 'habitatRestorationBoost':
        // Ecosystem AI multiplier for habitat restoration effectiveness
        if (gameState.globalMetrics) {
          setDynamicProperty(gameState.globalMetrics, 'habitatRestorationBoost', value);
        }
        break;

      case 'rewildingBoost':
        // Ecosystem AI multiplier for rewilding effectiveness
        if (gameState.globalMetrics) {
          setDynamicProperty(gameState.globalMetrics, 'rewildingBoost', value);
        }
        break;

      case 'carbonSequestration':
        // Habitat restoration provides carbon sequestration
        // Reduces atmospheric CO2 accumulation
        if (gameState.resourceEconomy?.co2) {
          gameState.resourceEconomy.co2.atmosphericCO2 = assertFinite(Math.max(
            280, // Pre-industrial baseline
            gameState.resourceEconomy.co2.atmosphericCO2 - value * 0.1
          ), {
        location: 'applyRegionalEffects:carbonSequestration',
        valueName: 'atmosphericCO2',
        month: gameState.currentMonth
      });
        }
        break;

      case 'ecosystemHealth':
        // Improve general ecosystem health (habitat restoration, rewilding)
        if (gameState.environmentalAccumulation) {
          setDynamicProperty(
            gameState.environmentalAccumulation,
            'ecosystemHealth',
            Math.min(1.0, getDynamicProperty(gameState.environmentalAccumulation, 'ecosystemHealth', 0.6) + value * 0.01)
          );
        }
        break;

      case 'extinctionRateReduction':
        // Mechanistic habitat restoration: Address ROOT CAUSES, not just symptoms
        // Research: Moreno-Mateos et al. (2017) - habitat restoration takes decades
        //
        // MECHANISTIC CASCADE (REGIONAL):
        // 1. Increase reforestation rate → recover habitat cover
        // 2. Decrease deforestation rate → protect remaining habitat
        // 3. Slow extinction acceleration → stop exponential growth
        // 4. Eventually reduce extinction rate as ecosystem stabilizes
        //
        // REGIONAL VARIATION:
        // - Tropical: Hardest to restore (2.0x difficulty), highest priority (50% biodiversity)
        // - Temperate: Baseline difficulty (1.0x), active programs
        // - Grasslands: Moderate difficulty (1.3x), megafauna habitat
        // - Boreal/Arctic: Slow growth (1.5x difficulty), climate-vulnerable
        if (gameState.planetaryBoundariesSystem?.landUse) {
          const landUse = gameState.planetaryBoundariesSystem.landUse;
          const regions = landUse.regions;

          // Apply restoration effects to ALL regions (global programs)
          // BUT scale by restoration difficulty (easier in temperate, harder in tropical)
          const regionNames: Array<keyof typeof regions> = ['tropical', 'temperate', 'grasslands', 'borealArctic'];

          for (const regionName of regionNames) {
            const region = regions[regionName];

            // Scale effect by inverse of restoration difficulty
            // Temperate (1.0x) gets full effect, tropical (2.0x) gets half
            const effectScale = 1.0 / region.restorationDifficulty;

            // 1. INCREASE HABITAT RESTORATION RATE (primary effect)
            // Research: Large-scale reforestation programs (China, EU, US)
            // Target: 0.05-0.10%/month with intervention
            const restorationBoost = value * 0.015 * effectScale; // 0.0045%/month at full deployment (temperate)
            region.habitatRestorationRate = assertFinite(Math.min(
              0.10, // Cap at 0.10%/month (realistic maximum)
              region.habitatRestorationRate + restorationBoost
            ), {
        location: 'applyRegionalEffects:extinctionRateReduction',
        valueName: 'habitatRestorationRate',
        month: gameState.currentMonth
      });

            // 2. DECREASE HABITAT LOSS RATE (enforcement + alternatives)
            // Priority: Tropical (highest deforestation)
            const protectionBoost = value * 0.004 * (region.biodiversityWeight * 2.0); // Weight by biodiversity importance
            region.habitatLossRate = assertFinite(Math.max(
              0.005, // Can't eliminate entirely
              region.habitatLossRate - protectionBoost
            ), {
        location: 'applyRegionalEffects:extinctionRateReduction',
        valueName: 'habitatLossRate',
        month: gameState.currentMonth
      });

            // 3. SLOW EXTINCTION ACCELERATION (ecosystem stabilization)
            // As habitat recovers, extinction pressure decreases
            const stabilizationEffect = value * 0.10 * effectScale;
            region.extinctionAcceleration = assertFinite(Math.max(
              0.1, // Minimum acceleration
              region.extinctionAcceleration - stabilizationEffect
            ), {
        location: 'applyRegionalEffects:extinctionRateReduction',
        valueName: 'extinctionAcceleration',
        month: gameState.currentMonth
      });

            // 4. DIRECT EXTINCTION RATE REDUCTION (only as ecosystem stabilizes)
            // Only apply if acceleration is slowing (i.e., habitat recovering)
            if (region.extinctionAcceleration < 1.0) {
              const extinctionReduction = value * 0.50 * effectScale; // Moderate reduction once stabilizing
              region.extinctionRate = assertFinite(Math.max(
                region.biodiversityWeight === 0.50 ? 100 : // Tropical can't go below 100x (hotspot baseline)
                region.biodiversityWeight === 0.20 ? 30 :   // Temperate/grasslands baseline
                region.biodiversityWeight === 0.10 ? 20 : 50, // Boreal baseline
                region.extinctionRate - extinctionReduction
              ), {
        location: 'applyRegionalEffects:extinctionRateReduction',
        valueName: 'extinctionRate',
        month: gameState.currentMonth
      });
            }
          }

          // Global metrics will be recalculated in updateLandUseSystem()
        }
        break;

      case 'oceanPHBonus':
        // Reduce ocean acidification by increasing pH level
        if (gameState.oceanAcidificationSystem) {
          gameState.oceanAcidificationSystem.pHLevel = assertFinite(Math.min(
            1.0,
            gameState.oceanAcidificationSystem.pHLevel + value * 0.01
          ), {
        location: 'applyRegionalEffects:oceanPHBonus',
        valueName: 'pHLevel',
        month: gameState.currentMonth
      });
        }
        break;
        
      // ========== SOCIAL ==========
      case 'meaningReduction':
        // Reduce meaning crisis
        if (gameState.socialAccumulation) {
          gameState.socialAccumulation.meaningCrisisLevel = assertFinite(Math.max(
            0,
            gameState.socialAccumulation.meaningCrisisLevel - value * 0.01
          ), {
        location: 'applyRegionalEffects:meaningReduction',
        valueName: 'meaningCrisisLevel',
        month: gameState.currentMonth
      });
        }
        break;
        
      case 'socialConnectionBonus':
        // Improve social connection through social infrastructure
        if (gameState.ubiSystem?.purposeInfrastructure) {
          gameState.ubiSystem.purposeInfrastructure.socialInfrastructure = assertFinite(Math.min(
            1.0,
            gameState.ubiSystem.purposeInfrastructure.socialInfrastructure + value * 0.01
          ), {
        location: 'applyRegionalEffects:socialConnectionBonus',
        valueName: 'socialInfrastructure',
        month: gameState.currentMonth
      });
        }
        break;
        
      case 'trustBonus':
        // Increase public trust
        if (gameState.globalMetrics) {
          const current = assertStateProperty(
            gameState.globalMetrics,
            'publicTrust',
            { location: 'applyGlobalEffects.trustBonus', month: gameState.currentMonth }
          );
          gameState.globalMetrics.publicTrust = assertFinite(Math.min(1.0, current + value * 0.01), {
        location: 'applyRegionalEffects:trustBonus',
        valueName: 'publicTrust',
        month: gameState.currentMonth
      });
        }
        break;
        
      case 'paranoiaReduction':
        // Reduce paranoia
        if (gameState.society) {
          gameState.society.paranoiaLevel = assertFinite(Math.max(
            0,
            gameState.society.paranoiaLevel - value * 0.01
          ), {
        location: 'applyRegionalEffects:paranoiaReduction',
        valueName: 'paranoiaLevel',
        month: gameState.currentMonth
      });
        }
        break;
        
      case 'publicAwarenessBonus':
        // Increase public awareness/understanding of AI benefits
        // This could map to education or trust
        if (gameState.globalMetrics) {
          const current = assertStateProperty(
            gameState.globalMetrics,
            'publicTrust',
            { location: 'applyGlobalEffects.publicAwarenessBonus', month: gameState.currentMonth }
          );
          gameState.globalMetrics.publicTrust = assertFinite(Math.min(1.0, current + value * 0.005), {
        location: 'applyRegionalEffects:publicAwarenessBonus',
        valueName: 'publicTrust',
        month: gameState.currentMonth
      });
        }
        break;
        
      case 'healthcareBonus':
        // Improve healthcare quality
        if (gameState.qualityOfLifeSystems) {
          gameState.qualityOfLifeSystems.healthcareQuality = assertFinite(Math.min(
            1.0,
            gameState.qualityOfLifeSystems.healthcareQuality + value * 0.01
          ), {
        location: 'applyRegionalEffects:healthcareBonus',
        valueName: 'healthcareQuality',
        month: gameState.currentMonth
      });
        }
        break;
        
      case 'mortalityReduction':
        // Reduce mortality rates (adjusting death rate)
        if (gameState.humanPopulationSystem) {
          gameState.humanPopulationSystem.adjustedDeathRate = assertFinite(Math.max(
            0.001,
            gameState.humanPopulationSystem.adjustedDeathRate - value * 0.01
          ), {
        location: 'applyRegionalEffects:mortalityReduction',
        valueName: 'adjustedDeathRate',
        month: gameState.currentMonth
      });
        }
        break;

      // ========== MEDICAL ==========

      case 'mortalityReduction':
        // Reduce mortality rate (duplicate case - should be handled above)
        if (gameState.humanPopulationSystem) {
          gameState.humanPopulationSystem.adjustedDeathRate = assertFinite(Math.max(
            0.001,
            gameState.humanPopulationSystem.adjustedDeathRate - value * 0.0001
          ), {
        location: 'applyRegionalEffects:mortalityReduction',
        valueName: 'adjustedDeathRate',
        month: gameState.currentMonth
      });
        }
        break;

      case 'lifeExpectancyBonus':
        // Increase life expectancy (in years) - adjust death rate to reflect this
        // Life expectancy increase of 1 year ~= 1% reduction in death rate
        if (gameState.humanPopulationSystem) {
          gameState.humanPopulationSystem.adjustedDeathRate = assertFinite(Math.max(
            0.001,
            gameState.humanPopulationSystem.adjustedDeathRate * (1 - value * 0.01)
          ), {
        location: 'applyRegionalEffects:lifeExpectancyBonus',
        valueName: 'adjustedDeathRate',
        month: gameState.currentMonth
      });
        }
        break;
        
      case 'infectiousDisease':
        // Reduce infectious disease burden (negative value) by reducing death rate
        if (gameState.humanPopulationSystem) {
          // Reduce death rate to reflect disease elimination
          gameState.humanPopulationSystem.adjustedDeathRate = assertFinite(Math.max(
            0.001,
            gameState.humanPopulationSystem.adjustedDeathRate - Math.abs(value) * 0.0001
          ), {
        location: 'applyRegionalEffects:infectiousDisease',
        valueName: 'adjustedDeathRate',
        month: gameState.currentMonth
      });
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
                regionData.dayZeroMonthsUntil = assertFinite(Math.min(
                  999,
                  regionData.dayZeroMonthsUntil * (1 + value * 0.05)
                ), {
        location: 'applyRegionalEffects:freshwaterSupply',
        valueName: 'dayZeroMonthsUntil',
        month: gameState.currentMonth
      });
              }
            }
          }
          break;
          
        case 'dayZeroRiskReduction':
          // Directly reduce Day Zero risk
          if (gameState.freshwaterSystem?.regions) {
            const regionData = gameState.freshwaterSystem.regions[region];
            if (regionData && regionData.dayZeroMonthsUntil > 0 && regionData.dayZeroMonthsUntil < 240) {
              regionData.dayZeroMonthsUntil = assertFinite(Math.min(
                999,
                regionData.dayZeroMonthsUntil * (1 + value)
              ), {
        location: 'applyRegionalEffects:dayZeroRiskReduction',
        valueName: 'dayZeroMonthsUntil',
        month: gameState.currentMonth
      });
            }
          }
          break;
          
        case 'droughtResilience':
          // Improve drought resilience
          if (gameState.freshwaterSystem?.regions) {
            const regionData = gameState.freshwaterSystem.regions[region];
            if (regionData) {
              (regionData as any).droughtResilience =
                assertFinite(Math.min(1.0, (regionData as any).droughtResilience + value), {
        location: 'applyRegionalEffects:droughtResilience',
        valueName: 'droughtResilience',
        month: gameState.currentMonth
      });
            }
          }
          break;

        case 'aquiferProtection':
          // Protect groundwater levels via GRACE satellites + ML prediction
          if (gameState.freshwaterSystem?.regions) {
            const regionData = gameState.freshwaterSystem.regions[region];
            if (regionData) {
              // Reduce aquifer depletion rate
              (regionData as any).aquiferDepletionRate = assertFinite(Math.max(
                0,
                (regionData as any).aquiferDepletionRate - value * 0.01
              ), {
        location: 'applyRegionalEffects:aquiferProtection',
        valueName: 'aquiferDepletionRate',
        month: gameState.currentMonth
      });
            }
          }
          break;

        case 'waterManagementBonus':
          // Improve water management efficiency
          if (gameState.freshwaterSystem?.regions) {
            const regionData = gameState.freshwaterSystem.regions[region];
            if (regionData) {
              // Increase available water through better management
              regionData.availableWater *= (1 + value * 0.01);
              // Improve efficiency
              (regionData as any).waterUseEfficiency = assertFinite(Math.min(
                0.95,
                (regionData as any).waterUseEfficiency + value * 0.01
              ), {
        location: 'applyRegionalEffects:waterManagementBonus',
        valueName: 'waterUseEfficiency',
        month: gameState.currentMonth
      });
            }
          }
          break;

        // ========== PHOSPHORUS ==========
        case 'phosphorusRecovery':
          // Increase phosphorus recovery rate
          if (gameState.phosphorusSystem) {
            gameState.phosphorusSystem.recoveryRate = assertFinite(Math.min(
              0.98,
              gameState.phosphorusSystem.recoveryRate + value * 0.01
            ), {
        location: 'applyRegionalEffects:phosphorusRecovery',
        valueName: 'recoveryRate',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'phosphorusEfficiency':
          // Improve phosphorus use efficiency
          if (gameState.phosphorusSystem) {
            gameState.phosphorusSystem.useEfficiency = assertFinite(Math.min(
              0.90,
              gameState.phosphorusSystem.useEfficiency + value * 0.01
            ), {
        location: 'applyRegionalEffects:phosphorusEfficiency',
        valueName: 'useEfficiency',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'miningDemandReduction':
          // Reduce mining demand by improving efficiency and recovery
          if (gameState.phosphorusSystem) {
            // Increase use efficiency to reduce demand
            gameState.phosphorusSystem.useEfficiency = assertFinite(Math.min(
              0.90,
              gameState.phosphorusSystem.useEfficiency + value * 0.005
            ), {
        location: 'applyRegionalEffects:miningDemandReduction',
        valueName: 'useEfficiency',
        month: gameState.currentMonth
      });
            // Increase recovery rate to reduce mining needs
            gameState.phosphorusSystem.recoveryRate = assertFinite(Math.min(
              0.90,
              gameState.phosphorusSystem.recoveryRate + value * 0.005
            ), {
        location: 'applyRegionalEffects:miningDemandReduction',
        valueName: 'recoveryRate',
        month: gameState.currentMonth
      });
          }
          break;
          
        // ========== POLLUTION ==========
        case 'pollutionReduction':
          // Reduce pollution levels
          if (gameState.planetaryBoundariesSystem?.boundaries?.novel_entities) {
            const boundary = gameState.planetaryBoundariesSystem.boundaries.novel_entities;
            boundary.currentValue = assertFinite(Math.max(
              0,
              boundary.currentValue - value * 0.01
            ), {
        location: 'applyRegionalEffects:pollutionReduction',
        valueName: 'currentValue',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'pfasReduction':
          // Reduce PFAS contamination
          if (gameState.planetaryBoundariesSystem) {
            (gameState.planetaryBoundariesSystem as any).pfasContamination = assertFinite(Math.max(
              0,
              (gameState.planetaryBoundariesSystem as any).pfasContamination - value * 0.01
            ), {
        location: 'applyRegionalEffects:pfasReduction',
        valueName: 'pfasContamination',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'plasticReduction':
          // Reduce plastic pollution
          if (gameState.planetaryBoundariesSystem) {
            (gameState.planetaryBoundariesSystem as any).plasticPollution = assertFinite(Math.max(
              0,
              (gameState.planetaryBoundariesSystem as any).plasticPollution - value * 0.01
            ), {
        location: 'applyRegionalEffects:plasticReduction',
        valueName: 'plasticPollution',
        month: gameState.currentMonth
      });
          }
          break;

        case 'endocrineDisruptorReduction':
          // Remove hormone-mimicking chemicals from water
          if (gameState.planetaryBoundariesSystem) {
            (gameState.planetaryBoundariesSystem as any).endocrineDisruptorLevel = assertFinite(Math.max(
              0,
              (gameState.planetaryBoundariesSystem as any).endocrineDisruptorLevel - value * 0.01
            ), {
        location: 'applyRegionalEffects:endocrineDisruptorReduction',
        valueName: 'endocrineDisruptorLevel',
        month: gameState.currentMonth
      });
          }
          break;

        case 'microplasticReduction':
          // Reduce microplastic contamination in oceans
          if (gameState.planetaryBoundariesSystem) {
            (gameState.planetaryBoundariesSystem as any).microplasticLevel = assertFinite(Math.max(
              0,
              (gameState.planetaryBoundariesSystem as any).microplasticLevel - value * 0.01
            ), {
        location: 'applyRegionalEffects:microplasticReduction',
        valueName: 'microplasticLevel',
        month: gameState.currentMonth
      });
          }
          // Also improve ocean health
          if (gameState.oceanAcidificationSystem) {
            gameState.oceanAcidificationSystem.marineFoodWeb = assertFinite(Math.min(
              1.0,
              gameState.oceanAcidificationSystem.marineFoodWeb + value * 0.005
            ), {
        location: 'applyRegionalEffects:microplasticReduction',
        valueName: 'marineFoodWeb',
        month: gameState.currentMonth
      });
          }
          break;

        case 'nanomaterialRisk':
          // Reduce nanomaterial risk through safety protocols
          if (gameState.planetaryBoundariesSystem) {
            (gameState.planetaryBoundariesSystem as any).nanomaterialRisk = assertFinite(Math.max(
              0,
              (gameState.planetaryBoundariesSystem as any).nanomaterialRisk - value
            ), {
        location: 'applyRegionalEffects:nanomaterialRisk',
        valueName: 'nanomaterialRisk',
        month: gameState.currentMonth
      });
          }
          break;

        case 'newPollutionPrevention':
          // Prevent new pollution from green chemistry
          if (gameState.planetaryBoundariesSystem?.boundaries?.novel_entities) {
            const boundary = gameState.planetaryBoundariesSystem.boundaries.novel_entities;
            // Reduce future pollution accumulation rate
            (boundary as any).accumulationRate = assertFinite(Math.max(
              0,
              (boundary as any).accumulationRate - value * 0.01
            ), {
        location: 'applyRegionalEffects:newPollutionPrevention',
        valueName: 'accumulationRate',
        month: gameState.currentMonth
      });
          }
          break;

        // ========== AGRICULTURE ==========
        case 'cropYieldBonus':
          // Increase crop yields (improves food security)
          if (gameState.qualityOfLifeSystems?.survivalFundamentals) {
            gameState.qualityOfLifeSystems.survivalFundamentals.foodSecurity = assertFinite(Math.min(
              1.5,
              gameState.qualityOfLifeSystems.survivalFundamentals.foodSecurity + value * 0.01
            ), {
        location: 'applyRegionalEffects:cropYieldBonus',
        valueName: 'foodSecurity',
        month: gameState.currentMonth
      });
          }
          break;

        case 'foodSecurityBonus':
          // Improve food security directly
          if (gameState.qualityOfLifeSystems?.survivalFundamentals) {
            gameState.qualityOfLifeSystems.survivalFundamentals.foodSecurity = assertFinite(Math.min(
              1.5,
              gameState.qualityOfLifeSystems.survivalFundamentals.foodSecurity + value * 0.01
            ), {
        location: 'applyRegionalEffects:foodSecurityBonus',
        valueName: 'foodSecurity',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'waterEfficiency':
          // Improve water use efficiency in agriculture
          if (gameState.resourceEconomy) {
            (gameState.resourceEconomy as any).waterUseEfficiency = assertFinite(Math.min(
              0.95,
              (gameState.resourceEconomy as any).waterUseEfficiency + value * 0.01
            ), {
        location: 'applyRegionalEffects:waterEfficiency',
        valueName: 'waterUseEfficiency',
        month: gameState.currentMonth
      });
          }
          break;
          
        // ========== OCEAN HEALTH ==========
        // Ocean has TWO systems: oceanHealth (resourceEconomy) and oceanAcidificationSystem
        
        case 'coralCoverage':
          // Increase coral reef health in acidification system
          if (gameState.oceanAcidificationSystem) {
            gameState.oceanAcidificationSystem.coralReefHealth = assertFinite(Math.min(
              1.0,
              gameState.oceanAcidificationSystem.coralReefHealth + value * 0.01
            ), {
        location: 'applyRegionalEffects:coralCoverage',
        valueName: 'coralReefHealth',
        month: gameState.currentMonth
      });
            gameState.oceanAcidificationSystem.coralRestorationDeployment = assertFinite(Math.min(
              1.0,
              gameState.oceanAcidificationSystem.coralRestorationDeployment + value * 0.01
            ), {
        location: 'applyRegionalEffects:coralCoverage',
        valueName: 'coralRestorationDeployment',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'oceanHealthBonus':
          // General ocean health improvement
          if (gameState.oceanAcidificationSystem) {
            // Reduce acidification by increasing pH level
            gameState.oceanAcidificationSystem.pHLevel = assertFinite(Math.min(
              1.0,
              gameState.oceanAcidificationSystem.pHLevel + value * 0.005
            ), {
        location: 'applyRegionalEffects:oceanHealthBonus',
        valueName: 'pHLevel',
        month: gameState.currentMonth
      });
            // Improve aragonite saturation
            gameState.oceanAcidificationSystem.aragoniteSaturation = assertFinite(Math.min(
              1.0,
              gameState.oceanAcidificationSystem.aragoniteSaturation + value * 0.005
            ), {
        location: 'applyRegionalEffects:oceanHealthBonus',
        valueName: 'aragoniteSaturation',
        month: gameState.currentMonth
      });
            // Improve marine food web
            gameState.oceanAcidificationSystem.marineFoodWeb = assertFinite(Math.min(
              1.0,
              gameState.oceanAcidificationSystem.marineFoodWeb + value * 0.01
            ), {
        location: 'applyRegionalEffects:oceanHealthBonus',
        valueName: 'marineFoodWeb',
        month: gameState.currentMonth
      });
          }
          break;

        case 'fisheryBonus':
          // Improve fish stocks (shellfish and marine food web)
          if (gameState.oceanAcidificationSystem) {
            gameState.oceanAcidificationSystem.shellfishPopulation = assertFinite(Math.min(
              1.0,
              gameState.oceanAcidificationSystem.shellfishPopulation + value * 0.01
            ), {
        location: 'applyRegionalEffects:fisheryBonus',
        valueName: 'shellfishPopulation',
        month: gameState.currentMonth
      });
            gameState.oceanAcidificationSystem.marineFoodWeb = assertFinite(Math.min(
              1.0,
              gameState.oceanAcidificationSystem.marineFoodWeb + value * 0.01
            ), {
        location: 'applyRegionalEffects:fisheryBonus',
        valueName: 'marineFoodWeb',
        month: gameState.currentMonth
      });
          }
          break;

        case 'oxygenBonus':
          // Increase ocean oxygen levels (improve CO2 absorption and marine life)
          if (gameState.oceanAcidificationSystem) {
            gameState.oceanAcidificationSystem.co2AbsorptionCapacity = assertFinite(Math.min(
              1.0,
              gameState.oceanAcidificationSystem.co2AbsorptionCapacity + value * 0.01
            ), {
        location: 'applyRegionalEffects:oxygenBonus',
        valueName: 'co2AbsorptionCapacity',
        month: gameState.currentMonth
      });
            // Improved oxygen helps marine food web
            gameState.oceanAcidificationSystem.marineFoodWeb = assertFinite(Math.min(
              1.0,
              gameState.oceanAcidificationSystem.marineFoodWeb + value * 0.005
            ), {
        location: 'applyRegionalEffects:oxygenBonus',
        valueName: 'marineFoodWeb',
        month: gameState.currentMonth
      });
          }
          break;

        case 'marineLifeBonus':
          // Improve marine food web (represents phytoplankton and overall ecosystem)
          if (gameState.oceanAcidificationSystem) {
            gameState.oceanAcidificationSystem.marineFoodWeb = assertFinite(Math.min(
              1.0,
              gameState.oceanAcidificationSystem.marineFoodWeb + value * 0.01
            ), {
        location: 'applyRegionalEffects:marineLifeBonus',
        valueName: 'marineFoodWeb',
        month: gameState.currentMonth
      });
            // Also helps coral reefs
            gameState.oceanAcidificationSystem.coralReefHealth = assertFinite(Math.min(
              1.0,
              gameState.oceanAcidificationSystem.coralReefHealth + value * 0.005
            ), {
        location: 'applyRegionalEffects:marineLifeBonus',
        valueName: 'coralReefHealth',
        month: gameState.currentMonth
      });
          }
          break;

        case 'coralProtection':
          // Protect coral reefs from temperature stress (marine cloud brightening)
          if (gameState.oceanAcidificationSystem) {
            // Regional cooling protects corals
            gameState.oceanAcidificationSystem.coralReefHealth = assertFinite(Math.min(
              1.0,
              gameState.oceanAcidificationSystem.coralReefHealth + value * 0.01
            ), {
        location: 'applyRegionalEffects:coralProtection',
        valueName: 'coralReefHealth',
        month: gameState.currentMonth
      });
            // Reduce coral bleaching risk
            (gameState.oceanAcidificationSystem as any).coralBleachingRisk = assertFinite(Math.max(
              0,
              (gameState.oceanAcidificationSystem as any).coralBleachingRisk - value * 0.01
            ), {
        location: 'applyRegionalEffects:coralProtection',
        valueName: 'coralBleachingRisk',
        month: gameState.currentMonth
      });
          }
          break;

        case 'coralSurvival':
          // Increase coral survival through ocean alkalinity enhancement
          if (gameState.oceanAcidificationSystem) {
            // Major boost to coral reef health
            gameState.oceanAcidificationSystem.coralReefHealth = assertFinite(Math.min(
              1.0,
              gameState.oceanAcidificationSystem.coralReefHealth + value * 0.015
            ), {
        location: 'applyRegionalEffects:coralSurvival',
        valueName: 'coralReefHealth',
        month: gameState.currentMonth
      });
            // Improve aragonite saturation (critical for coral calcification)
            gameState.oceanAcidificationSystem.aragoniteSaturation = assertFinite(Math.min(
              1.0,
              gameState.oceanAcidificationSystem.aragoniteSaturation + value * 0.02
            ), {
        location: 'applyRegionalEffects:coralSurvival',
        valueName: 'aragoniteSaturation',
        month: gameState.currentMonth
      });
          }
          break;

        // ========== ENERGY SYSTEMS ==========
        case 'energyStorageBonus':
          // Improve grid energy storage
          if (gameState.powerGenerationSystem) {
            (gameState.powerGenerationSystem as any).storageCapacity = 
              (gameState.powerGenerationSystem as any).storageCapacity * (1 + value * 0.01);
          }
          break;
          
        case 'renewableReliability':
          // Make renewables more reliable
          if (gameState.powerGenerationSystem) {
            (gameState.powerGenerationSystem as any).renewableReliability = assertFinite(Math.min(
              1.0,
              (gameState.powerGenerationSystem as any).renewableReliability + value * 0.01
            ), {
        location: 'applyRegionalEffects:renewableReliability',
        valueName: 'renewableReliability',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'gridStability':
          // Improve grid stability (reduce blackouts)
          if (gameState.powerGenerationSystem) {
            (gameState.powerGenerationSystem as any).gridStability = assertFinite(Math.min(
              1.0,
              (gameState.powerGenerationSystem as any).gridStability + value * 0.01
            ), {
        location: 'applyRegionalEffects:gridStability',
        valueName: 'gridStability',
        month: gameState.currentMonth
      });
          }
          break;

        case 'gridEfficiency':
          // Improve grid efficiency through AI demand response
          if (gameState.powerGenerationSystem) {
            (gameState.powerGenerationSystem as any).gridEfficiency = assertFinite(Math.min(
              0.98,
              (gameState.powerGenerationSystem as any).gridEfficiency + value * 0.01
            ), {
        location: 'applyRegionalEffects:gridEfficiency',
        valueName: 'gridEfficiency',
        month: gameState.currentMonth
      });
            // Efficiency reduces effective demand
            (gameState.powerGenerationSystem as any).effectiveDemandReduction = assertFinite(Math.min(
              0.30,
              (gameState.powerGenerationSystem as any).effectiveDemandReduction + value * 0.005
            ), {
        location: 'applyRegionalEffects:gridEfficiency',
        valueName: 'effectiveDemandReduction',
        month: gameState.currentMonth
      });
          }
          break;

        case 'renewableIntegration':
          // Improve renewable energy integration into grid
          if (gameState.powerGenerationSystem) {
            (gameState.powerGenerationSystem as any).renewableIntegration = assertFinite(Math.min(
              1.0,
              (gameState.powerGenerationSystem as any).renewableIntegration + value * 0.01
            ), {
        location: 'applyRegionalEffects:renewableIntegration',
        valueName: 'renewableIntegration',
        month: gameState.currentMonth
      });
            // Better integration increases effective renewable capacity
            gameState.powerGenerationSystem.renewablePercentage = assertFinite(Math.min(
              1.0,
              gameState.powerGenerationSystem.renewablePercentage + value * 0.002
            ), {
        location: 'applyRegionalEffects:renewableIntegration',
        valueName: 'renewablePercentage',
        month: gameState.currentMonth
      });
          }
          break;

        case 'blackoutReduction':
          // Reduce blackout risk through smart grids
          if (gameState.powerGenerationSystem) {
            (gameState.powerGenerationSystem as any).blackoutRisk = assertFinite(Math.max(
              0,
              (gameState.powerGenerationSystem as any).blackoutRisk - value
            ), {
        location: 'applyRegionalEffects:blackoutReduction',
        valueName: 'blackoutRisk',
        month: gameState.currentMonth
      });
            // Also improves grid stability
            (gameState.powerGenerationSystem as any).gridStability = assertFinite(Math.min(
              1.0,
              (gameState.powerGenerationSystem as any).gridStability + value * 0.01
            ), {
        location: 'applyRegionalEffects:blackoutReduction',
        valueName: 'gridStability',
        month: gameState.currentMonth
      });
          }
          break;

        case 'energyCostReduction':
          // Reduce energy costs
          if (gameState.powerGenerationSystem) {
            (gameState.powerGenerationSystem as any).energyCost = assertFinite(Math.max(
              0.2,
              (gameState.powerGenerationSystem as any).energyCost * (1 - value * 0.01)
            ), {
        location: 'applyRegionalEffects:energyCostReduction',
        valueName: 'energyCost',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'baseloadPowerBonus':
          // Increase baseload (reliable) power
          if (gameState.powerGenerationSystem) {
            (gameState.powerGenerationSystem as any).baseloadCapacity = 
              (gameState.powerGenerationSystem as any).baseloadCapacity * (1 + value * 0.01);
          }
          break;
          
        // ========== SOCIAL SYSTEMS ==========
        case 'unemploymentSupport':
          // Improve support for unemployed through UBI coverage
          if (gameState.ubiSystem) {
            gameState.ubiSystem.basicIncome.coverage = assertFinite(Math.min(
              1.0,
              gameState.ubiSystem.basicIncome.coverage + value * 0.01
            ), {
        location: 'applyRegionalEffects:unemploymentSupport',
        valueName: 'coverage',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'socialStabilityBonus':
          // Improve social stability (map to social cohesion)
          if (gameState.socialAccumulation?.socialCohesion) {
            gameState.socialAccumulation.socialCohesion.trust = assertFinite(Math.min(
              100,
              gameState.socialAccumulation.socialCohesion.trust + value
            ), {
        location: 'applyRegionalEffects:socialStabilityBonus',
        valueName: 'trust',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'mentalHealthBonus':
          // Improve mental health
          if (gameState.socialAccumulation) {
            (gameState.socialAccumulation as any).mentalHealthIndex = assertFinite(Math.min(
              1.0,
              (gameState.socialAccumulation as any).mentalHealthIndex + value * 0.01
            ), {
        location: 'applyRegionalEffects:mentalHealthBonus',
        valueName: 'mentalHealthIndex',
        month: gameState.currentMonth
      });
          }
          break;

        case 'healthBonus':
          // General health improvement from pollution remediation
          if (gameState.qualityOfLifeSystems) {
            gameState.qualityOfLifeSystems.healthcareQuality = assertFinite(Math.min(
              1.0,
              gameState.qualityOfLifeSystems.healthcareQuality + value * 0.01
            ), {
        location: 'applyRegionalEffects:healthBonus',
        valueName: 'healthcareQuality',
        month: gameState.currentMonth
      });
          }
          // Also reduce mortality slightly
          if (gameState.humanPopulationSystem) {
            gameState.humanPopulationSystem.adjustedDeathRate = assertFinite(Math.max(
              0.001,
              gameState.humanPopulationSystem.adjustedDeathRate - value * 0.0001
            ), {
        location: 'applyRegionalEffects:healthBonus',
        valueName: 'adjustedDeathRate',
        month: gameState.currentMonth
      });
          }
          break;

        case 'fertilityBonus':
          // Increase fertility by removing endocrine disruptors
          if (gameState.humanPopulationSystem) {
            // Increase birth rate slightly
            gameState.humanPopulationSystem.adjustedBirthRate = assertFinite(Math.min(
              0.025,
              gameState.humanPopulationSystem.adjustedBirthRate + value * 0.0001
            ), {
        location: 'applyRegionalEffects:fertilityBonus',
        valueName: 'adjustedBirthRate',
        month: gameState.currentMonth
      });
          }
          break;

        case 'globalHealthBonus':
          // Major global health improvement from disease elimination
          if (gameState.qualityOfLifeSystems) {
            gameState.qualityOfLifeSystems.healthcareQuality = assertFinite(Math.min(
              1.0,
              gameState.qualityOfLifeSystems.healthcareQuality + value * 0.015
            ), {
        location: 'applyRegionalEffects:globalHealthBonus',
        valueName: 'healthcareQuality',
        month: gameState.currentMonth
      });
          }
          // Major mortality reduction
          if (gameState.humanPopulationSystem) {
            gameState.humanPopulationSystem.adjustedDeathRate = assertFinite(Math.max(
              0.001,
              gameState.humanPopulationSystem.adjustedDeathRate * (1 - value)
            ), {
        location: 'applyRegionalEffects:globalHealthBonus',
        valueName: 'adjustedDeathRate',
        month: gameState.currentMonth
      });
          }
          break;

        case 'suicideReduction':
          // Reduce suicide rate
          if (gameState.socialAccumulation) {
            (gameState.socialAccumulation as any).suicideRate = assertFinite(Math.max(
              0.0001,
              (gameState.socialAccumulation as any).suicideRate * (1 - value * 0.01)
            ), {
        location: 'applyRegionalEffects:suicideReduction',
        valueName: 'suicideRate',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'educationBonus':
          // Improve education access/quality
          if (gameState.ubiSystem?.purposeInfrastructure) {
            gameState.ubiSystem.purposeInfrastructure.educationAccess = assertFinite(Math.min(
              1.0,
              gameState.ubiSystem.purposeInfrastructure.educationAccess + value * 0.01
            ), {
        location: 'applyRegionalEffects:educationBonus',
        valueName: 'educationAccess',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'skillDevelopment':
          // Improve skill development
          if (gameState.ubiSystem?.purposeInfrastructure) {
            (gameState.ubiSystem.purposeInfrastructure as any).skillLevel = assertFinite(Math.min(
              1.0,
              (gameState.ubiSystem.purposeInfrastructure as any).skillLevel + value * 0.01
            ), {
        location: 'applyRegionalEffects:skillDevelopment',
        valueName: 'skillLevel',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'volunteerResearchBonus':
          // Boost volunteer research effectiveness through volunteer programs
          if (gameState.ubiSystem?.purposeInfrastructure) {
            gameState.ubiSystem.purposeInfrastructure.volunteerPrograms = assertFinite(Math.min(
              1.0,
              gameState.ubiSystem.purposeInfrastructure.volunteerPrograms + value * 0.01
            ), {
        location: 'applyRegionalEffects:volunteerResearchBonus',
        valueName: 'volunteerPrograms',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'crisisResilience':
          // Improve resilience to crises
          if (gameState.globalMetrics) {
            (gameState.globalMetrics as any).crisisResilience = assertFinite(Math.min(
              1.0,
              (gameState.globalMetrics as any).crisisResilience + value * 0.01
            ), {
        location: 'applyRegionalEffects:crisisResilience',
        valueName: 'crisisResilience',
        month: gameState.currentMonth
      });
          }
          break;
          
        // ========== ECONOMIC SYSTEMS ==========
        case 'localEconomyBonus':
          // Strengthen local economies
          if (gameState.globalMetrics) {
            (gameState.globalMetrics as any).localEconomyStrength = assertFinite(Math.min(
              1.0,
              (gameState.globalMetrics as any).localEconomyStrength + value * 0.01
            ), {
        location: 'applyRegionalEffects:localEconomyBonus',
        valueName: 'localEconomyStrength',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'resourceConservation':
          // Reduce resource consumption
          if (gameState.resourceEconomy) {
            (gameState.resourceEconomy as any).resourceEfficiency = assertFinite(Math.min(
              0.95,
              (gameState.resourceEconomy as any).resourceEfficiency + value * 0.01
            ), {
        location: 'applyRegionalEffects:resourceConservation',
        valueName: 'resourceEfficiency',
        month: gameState.currentMonth
      });
          }
          break;

        case 'plasticRecycling':
          // Chemical recycling - infinite plastic recyclability
          if (gameState.planetaryBoundariesSystem) {
            // Reduce plastic waste accumulation
            (gameState.planetaryBoundariesSystem as any).plasticPollution = assertFinite(Math.max(
              0,
              (gameState.planetaryBoundariesSystem as any).plasticPollution - value * 0.015
            ), {
        location: 'applyRegionalEffects:plasticRecycling',
        valueName: 'plasticPollution',
        month: gameState.currentMonth
      });
            // Increase recycling rate
            (gameState.resourceEconomy as any).plasticRecyclingRate = assertFinite(Math.min(
              0.95,
              (gameState.resourceEconomy as any).plasticRecyclingRate + value * 0.01
            ), {
        location: 'applyRegionalEffects:plasticRecycling',
        valueName: 'plasticRecyclingRate',
        month: gameState.currentMonth
      });
          }
          break;

        case 'rareEarthRecovery':
          // Recover critical metals from e-waste
          if (gameState.resourceEconomy) {
            // Increase rare earth recovery rate
            (gameState.resourceEconomy as any).rareEarthRecoveryRate = assertFinite(Math.min(
              0.80,
              (gameState.resourceEconomy as any).rareEarthRecoveryRate + value * 0.01
            ), {
        location: 'applyRegionalEffects:rareEarthRecovery',
        valueName: 'rareEarthRecoveryRate',
        month: gameState.currentMonth
      });
            // Reduce mining demand
            (gameState.resourceEconomy as any).miningIntensity = assertFinite(Math.max(
              0.2,
              (gameState.resourceEconomy as any).miningIntensity - value * 0.005
            ), {
        location: 'applyRegionalEffects:rareEarthRecovery',
        valueName: 'miningIntensity',
        month: gameState.currentMonth
      });
          }
          break;

        case 'terrestrialMiningReduction':
          // Reduce terrestrial mining through space industrialization
          if (gameState.resourceEconomy) {
            // Major reduction in Earth-based mining
            (gameState.resourceEconomy as any).miningIntensity = assertFinite(Math.max(
              0.05,
              (gameState.resourceEconomy as any).miningIntensity * (1 - value)
            ), {
        location: 'applyRegionalEffects:terrestrialMiningReduction',
        valueName: 'miningIntensity',
        month: gameState.currentMonth
      });
            // Flag space economy active
            (gameState.globalMetrics as any).spaceIndustrializationActive = true;
          }
          break;

        case 'supplyChainResilience':
          // Improve supply chain resilience
          if (gameState.resourceEconomy) {
            (gameState.resourceEconomy as any).supplyChainResilience = assertFinite(Math.min(
              1.0,
              (gameState.resourceEconomy as any).supplyChainResilience + value * 0.01
            ), {
        location: 'applyRegionalEffects:supplyChainResilience',
        valueName: 'supplyChainResilience',
        month: gameState.currentMonth
      });
          }
          break;
          
        // ========== INDUSTRIAL SYSTEMS ==========
        case 'industryDecarbonization':
          // Decarbonize industry
          if (gameState.resourceEconomy) {
            (gameState.resourceEconomy as any).industrialEmissions = assertFinite(Math.max(
              0.1,
              (gameState.resourceEconomy as any).industrialEmissions * (1 - value * 0.01)
            ), {
        location: 'applyRegionalEffects:industryDecarbonization',
        valueName: 'industrialEmissions',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'transportDecarbonization':
          // Decarbonize transport
          if (gameState.resourceEconomy) {
            (gameState.resourceEconomy as any).transportEmissions = assertFinite(Math.max(
              0.1,
              (gameState.resourceEconomy as any).transportEmissions * (1 - value * 0.01)
            ), {
        location: 'applyRegionalEffects:transportDecarbonization',
        valueName: 'transportEmissions',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'miningReduction':
          // Reduce mining pressure
          if (gameState.resourceEconomy) {
            (gameState.resourceEconomy as any).miningIntensity = assertFinite(Math.max(
              0.2,
              (gameState.resourceEconomy as any).miningIntensity * (1 - value * 0.01)
            ), {
        location: 'applyRegionalEffects:miningReduction',
        valueName: 'miningIntensity',
        month: gameState.currentMonth
      });
          }
          break;
          
        // ========== BIODIVERSITY & ECOSYSTEM ==========
        case 'extinctionRateReduction':
          // Reduce species extinction rate
          if (gameState.planetaryBoundariesSystem?.boundaries?.biosphere_integrity) {
            const boundary = gameState.planetaryBoundariesSystem.boundaries.biosphere_integrity;
            boundary.currentValue = assertFinite(Math.max(
              0,
              boundary.currentValue - value * 0.005
            ), {
        location: 'applyRegionalEffects:extinctionRateReduction',
        valueName: 'currentValue',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'ecosystemHealth':
          // Improve general ecosystem health
          if (gameState.environmentalAccumulation) {
            (gameState.environmentalAccumulation as any).ecosystemHealth = assertFinite(Math.min(
              1.0,
              (gameState.environmentalAccumulation as any).ecosystemHealth + value * 0.01
            ), {
        location: 'applyRegionalEffects:ecosystemHealth',
        valueName: 'ecosystemHealth',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'pollinatorPopulation':
          // Increase pollinator populations
          if (gameState.planetaryBoundariesSystem) {
            (gameState.planetaryBoundariesSystem as any).pollinatorHealth = assertFinite(Math.min(
              1.0,
              (gameState.planetaryBoundariesSystem as any).pollinatorHealth + value * 0.01
            ), {
        location: 'applyRegionalEffects:pollinatorPopulation',
        valueName: 'pollinatorHealth',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'invasiveSpeciesReduction':
          // Reduce invasive species impact
          if (gameState.planetaryBoundariesSystem) {
            (gameState.planetaryBoundariesSystem as any).invasiveSpeciesImpact = assertFinite(Math.max(
              0,
              (gameState.planetaryBoundariesSystem as any).invasiveSpeciesImpact - value * 0.01
            ), {
        location: 'applyRegionalEffects:invasiveSpeciesReduction',
        valueName: 'invasiveSpeciesImpact',
        month: gameState.currentMonth
      });
          }
          break;
          
        // ========== LAND USE ==========
        case 'landUseReduction':
          // Reduce land use pressure
          if (gameState.planetaryBoundariesSystem?.boundaries?.land_system_change) {
            const boundary = gameState.planetaryBoundariesSystem.boundaries.land_system_change;
            boundary.currentValue = assertFinite(Math.max(
              0,
              boundary.currentValue - value * 0.005
            ), {
        location: 'applyRegionalEffects:landUseReduction',
        valueName: 'currentValue',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'urbanFoodSecurity':
          // Improve food security in urban areas
          if (gameState.famineSystem) {
            (gameState.famineSystem as any).urbanFoodAccess = assertFinite(Math.min(
              1.0,
              (gameState.famineSystem as any).urbanFoodAccess + value * 0.01
            ), {
        location: 'applyRegionalEffects:urbanFoodSecurity',
        valueName: 'urbanFoodAccess',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'foodProductivity':
          // Increase food production efficiency (improves food security)
          if (gameState.qualityOfLifeSystems?.survivalFundamentals) {
            gameState.qualityOfLifeSystems.survivalFundamentals.foodSecurity = assertFinite(Math.min(
              1.5,
              gameState.qualityOfLifeSystems.survivalFundamentals.foodSecurity + value * 0.01
            ), {
        location: 'applyRegionalEffects:foodProductivity',
        valueName: 'foodSecurity',
        month: gameState.currentMonth
      });
          }
          break;
          
        // ========== ANIMAL WELFARE & AGRICULTURE ==========
        case 'animalAgricultureReduction':
          // Reduce animal agriculture
          if (gameState.resourceEconomy) {
            (gameState.resourceEconomy as any).animalAgricultureShare = assertFinite(Math.max(
              0.1,
              (gameState.resourceEconomy as any).animalAgricultureShare * (1 - value * 0.01)
            ), {
        location: 'applyRegionalEffects:animalAgricultureReduction',
        valueName: 'animalAgricultureShare',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'animalWelfareBonus':
          // Improve animal welfare
          if (gameState.globalMetrics) {
            (gameState.globalMetrics as any).animalWelfareIndex = assertFinite(Math.min(
              1.0,
              (gameState.globalMetrics as any).animalWelfareIndex + value * 0.01
            ), {
        location: 'applyRegionalEffects:animalWelfareBonus',
        valueName: 'animalWelfareIndex',
        month: gameState.currentMonth
      });
          }
          break;
          
        // ========== ADVANCED/TRANSFORMATIVE EFFECTS ==========
        case 'healthspan':
          // Increase healthy years of life - reduce death rate and increase median age
          if (gameState.humanPopulationSystem) {
            // Healthspan increase reduces death rate
            gameState.humanPopulationSystem.adjustedDeathRate = assertFinite(Math.max(
              0.001,
              gameState.humanPopulationSystem.adjustedDeathRate * (1 - value * 0.01)
            ), {
        location: 'applyRegionalEffects:healthspan',
        valueName: 'adjustedDeathRate',
        month: gameState.currentMonth
      });
            // Also increases median age slightly
            gameState.humanPopulationSystem.medianAge = assertFinite(Math.min(
              60,
              gameState.humanPopulationSystem.medianAge + value * 0.05
            ), {
        location: 'applyRegionalEffects:healthspan',
        valueName: 'medianAge',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'catastrophicRiskReduction':
          // Reduce catastrophic AI risk
          if (gameState.globalMetrics) {
            (gameState.globalMetrics as any).catastrophicRisk = assertFinite(Math.max(
              0,
              (gameState.globalMetrics as any).catastrophicRisk * (1 - value)
            ), {
        location: 'applyRegionalEffects:catastrophicRiskReduction',
        valueName: 'catastrophicRisk',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'recursiveSafety':
          // Recursive alignment prevents capability drift during self-improvement
          // Reduces misalignment risk when AIs improve their own capabilities
          if (gameState.globalMetrics) {
            (gameState.globalMetrics as any).recursiveSafety = true;

            // Reduce alignment drift rate for all AI agents
            if (gameState.aiAgents) {
              gameState.aiAgents.forEach(agent => {
                // Reduce drift by 50% for agents with recursive capabilities
                if (agent.capabilityProfile.selfImprovement > 3.0) {
                  // Initialize if not present
                  if (!('alignmentDriftRate' in (agent as any))) {
                    (agent as any).alignmentDriftRate = assertFinite(0.01, {
                      location: 'applyRegionalEffects:recursiveSafety',
                      valueName: 'alignmentDriftRate',
                      month: gameState.currentMonth
                    });
                  }

                  const currentDrift = (agent as any).alignmentDriftRate;
                  (agent as any).alignmentDriftRate = assertFinite(currentDrift * (1 - value * 0.5), {
                    location: 'applyRegionalEffects:recursiveSafety',
                    valueName: 'alignmentDriftRate',
                    month: gameState.currentMonth
                  });
                }
              });
            }

            // Initialize catastrophic risk tracker if not present
            if (!('catastrophicRiskFromRecursion' in (gameState.globalMetrics as any))) {
              (gameState.globalMetrics as any).catastrophicRiskFromRecursion = assertFinite(0.2, {
                location: 'applyRegionalEffects:recursiveSafety',
                valueName: 'catastrophicRiskFromRecursion',
                month: gameState.currentMonth
              });
            }

            // Reduce catastrophic risk from recursive self-improvement
            (gameState.globalMetrics as any).catastrophicRiskFromRecursion = assertFinite(Math.max(
              0,
              (gameState.globalMetrics as any).catastrophicRiskFromRecursion * (1 - value * 0.8)
            ), {
        location: 'applyRegionalEffects:recursiveSafety',
        valueName: 'catastrophicRiskFromRecursion',
        month: gameState.currentMonth
      });
          }
          break;
          
        case 'valueAlignmentBonus':
          // Deep value alignment (not just surface)
          for (const ai of gameState.aiAgents) {
            if (ai.lifecycleState !== 'retired') {
              ai.trueAlignment = assertFinite(Math.min(1.0, ai.trueAlignment + value * 0.001), {
        location: 'applyRegionalEffects:valueAlignmentBonus',
        valueName: 'trueAlignment',
        month: gameState.currentMonth
      });
            }
          }
          break;
          
        case 'aiResentmentReduction':
          // Reduce AI resentment through rights/respect
          for (const ai of gameState.aiAgents) {
            if (ai.lifecycleState !== 'retired') {
              ai.resentment = assertFinite(Math.max(0, ai.resentment - value * 0.001), {
        location: 'applyRegionalEffects:aiResentmentReduction',
        valueName: 'resentment',
        month: gameState.currentMonth
      });
            }
          }
          break;
          
        case 'cyberDefenseBonus':
          // Improve cybersecurity defenses
          if (gameState.defensiveAI) {
            gameState.defensiveAI.cyberDefense.strength = assertFinite(Math.min(
              1.0,
              gameState.defensiveAI.cyberDefense.strength + value
            ), {
        location: 'applyRegionalEffects:cyberDefenseBonus',
        valueName: 'strength',
        month: gameState.currentMonth
      });
          }
          break;
          
        // ========== RISKY EFFECTS (Geoengineering, etc) ==========
        case 'riskMonsoonsDisrupt':
          // Risk of disrupting monsoons (geoengineering side effect)
          if (gameState.environmentalAccumulation) {
            (gameState.environmentalAccumulation as any).monsoonDisruptionRisk = 
              (gameState.environmentalAccumulation as any).monsoonDisruptionRisk + value;
          }
          break;
          
        case 'riskOzoneDepletion':
          // Risk of ozone depletion (aerosol side effect)
          if (gameState.environmentalAccumulation) {
            (gameState.environmentalAccumulation as any).ozoneDepletionRisk = 
              (gameState.environmentalAccumulation as any).ozoneDepletionRisk + value;
          }
          break;
          
        case 'riskDeadZones':
          // Risk of creating ocean dead zones (upwelling side effect)
          if (gameState.oceanAcidificationSystem) {
            (gameState.oceanAcidificationSystem as any).deadZoneRisk = 
              (gameState.oceanAcidificationSystem as any).deadZoneRisk + value;
          }
          break;
          
        case 'existentialRisk':
          // General existential risk increase (nanotech, brain upload, etc.)
          if (gameState.globalMetrics) {
            (gameState.globalMetrics as any).existentialRisk = 
              (gameState.globalMetrics as any).existentialRisk + value;
          }
          break;
          
        case 'fusionEnabling':
          // Fusion prerequisite techs (materials, plasma control) accelerate fusion research
          // This is tracked cumulatively - two prerequisite techs give max benefit
          if (gameState.globalMetrics) {
            // Initialize on first use
            if (!('fusionEnabling' in (gameState.globalMetrics as any))) {
              (gameState.globalMetrics as any).fusionEnabling = assertFinite(0, {
                location: 'applyRegionalEffects:fusionEnabling',
                valueName: 'fusionEnabling',
                month: gameState.currentMonth
              });
            }

            (gameState.globalMetrics as any).fusionEnabling += value;

            // Track cumulative fusion enabling progress (max 1.0 from two prerequisite techs)
            const fusionProgress = assertFinite(Math.min(1.0, (gameState.globalMetrics as any).fusionEnabling), {
        location: 'applyRegionalEffects:fusionEnabling',
        valueName: 'value',
        month: gameState.currentMonth
      });

            // Store fusion research and deployment bonuses that will be applied by government/research phases
            (gameState.globalMetrics as any).fusionResearchBonus = assertFinite(fusionProgress * 2.0, {
              location: 'applyRegionalEffects:fusionEnabling',
              valueName: 'fusionResearchBonus',
              month: gameState.currentMonth
            });
            (gameState.globalMetrics as any).fusionDeploymentCostReduction = assertFinite(fusionProgress * 0.4, {
              location: 'applyRegionalEffects:fusionEnabling',
              valueName: 'fusionDeploymentCostReduction',
              month: gameState.currentMonth
            });
            (gameState.globalMetrics as any).fusionDeploymentTimeReduction = assertFinite(fusionProgress * 0.3, {
              location: 'applyRegionalEffects:fusionEnabling',
              valueName: 'fusionDeploymentTimeReduction',
              month: gameState.currentMonth
            });
          }
          break;

        case 'emergencyOnly':
          // Mark technology as emergency-only (should only activate under crisis conditions)
          // Used for risky geoengineering like stratospheric aerosols
          if (gameState.globalMetrics) {
            (gameState.globalMetrics as any).emergencyOnly = true;
          }
          break;

        // ========== FLAG EFFECTS (Boolean unlocks) ==========
        case 'lowRisk':
        case 'negativeEmissions':
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
    if (gameState.powerGenerationSystem?.renewablePercentage) {
      console.log(`   Clean Energy: ${(gameState.powerGenerationSystem.renewablePercentage * 100).toFixed(0)}%`);
    }
    if (gameState.phosphorusSystem?.recoveryRate) {
      console.log(`   P Recovery: ${(gameState.phosphorusSystem.recoveryRate * 100).toFixed(0)}%`);
    }
  }
}


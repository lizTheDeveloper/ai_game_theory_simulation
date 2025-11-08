/**
 * Mortality Stabilizers Initialization
 *
 * Initialize stabilizing mechanisms for each region based on baseline characteristics.
 *
 * Research:
 * - Cavalcanti et al. (2025): International aid effectiveness
 * - Ballester et al. (2024): Heat adaptation (European data)
 * - IOM (2024): Migration patterns and return rates
 * - GAO (2025): Emergency response capacity
 *
 * CRITICAL: These are BASELINE values. Actual effectiveness depends on:
 * - Global vs regional crisis scope (Sylvia's critical fix)
 * - Donor availability and fatigue
 * - Economic capacity and governance quality
 * - Cascade failures between mechanisms
 *
 * @see /research/mortality_stabilizing_mechanisms_20251030.md
 * @see /reviews/mortality_stabilizing_mechanisms_validation_20251030.md
 */

import type { RegionalMortalityStabilizers } from '@/types/mortalityStabilizers';
import { assertFinite } from './utils/assertions';
import type { RegionalPopulation } from '@/types/population';

/**
 * Initialize mortality stabilizers for a region
 *
 * Parameters depend on region's:
 * - Economic development (richer countries have better infrastructure adaptation)
 * - Healthcare quality (affects emergency response)
 * - Governance (affects aid coordination, emergency response)
 */
export function initializeRegionalMortalityStabilizers(
  region: RegionalPopulation
): RegionalMortalityStabilizers {
  // Baseline values - will be updated dynamically during simulation
  return {
    // International aid (starts at MEDIUM for most regions, adjusted by crisis scope)
    aid: {
      effectivenessLevel: 'medium',
      mortalityReduction: 0.185, // Midpoint of 9-28% (medium funding level)
      donorAvailability: 1.0,     // Full availability at simulation start
      donorFatigue: 0.0,          // No fatigue at start
      majorEconomiesCollapsed: 0,
      totalMajorEconomies: 10,    // G7 + China/India/Brazil
    },

    // Heat adaptation (starts LOW, develops over time with exposure)
    adaptation: {
      physiological: 0.0,         // Develops over weeks
      behavioral: 0.0,            // Develops immediately when needed
      infrastructural: region.economicStage >= 3 ? 0.1 : 0.0, // Rich regions start with some infrastructure
      social: region.healthcareQuality * 0.1, // Scales with healthcare (proxy for gov capacity)
      totalReduction: region.economicStage >= 3 ? 0.1 : region.healthcareQuality * 0.1,
      monthsExposed: 0,
      wetBulbLimit: 30.5,         // CORRECTED per Sylvia (empirical, not theoretical 35°C)
      adaptationCeases: false,
    },

    // Migration (capacity depends on destination space + regional characteristics)
    migration: {
      successfulRelocation: 0.85,          // 85% baseline (IOM 2024 data)
      mortalityDuringMigration: 0.001,     // 0.1% baseline (Cyclone Freddy precedent)
      returnRate: 0.85,                    // 85% baseline (U.S. 2022-23 data)
      destinationCapacity: 1.0,            // Full capacity at start
      averageDistance: 500,                 // Assume 500km baseline (regional migration)
      distancePenalty: 0.1,                // 10% penalty for 500km
    },

    // Emergency response (depends heavily on governance + healthcare + economic capacity)
    emergencyResponse: {
      workforceAvailable: region.healthcareQuality * 0.8, // Healthcare is proxy for emergency capacity
      preparednessLevel: region.economicStage >= 3 ? 0.6 : 0.3, // Rich countries more prepared
      resourceStockpiles: region.economicStage >= 2 ? 0.7 : 0.4, // Middle-income+ have stockpiles
      communicationSystems: region.economicStage >= 2 ? 0.8 : 0.5, // Infrastructure scales with economy
      effectiveness: 0.0, // Calculated dynamically
      crisisScale: 0.0,   // No crisis at start
      overwhelmPenalty: 1.0, // No penalty at start
    },

    // Cascade failures (all mechanisms start functioning)
    cascades: {
      aidFunctioning: 1.0,
      adaptationFunctioning: 1.0,
      migrationFunctioning: 1.0,
      emergencyResponseFunctioning: 1.0,
      cascadeMultipliers: {
        aidToEmergencyResponse: 0.5,  // Aid failure → 50% emergency response degradation
        aidToMigration: 0.3,           // Aid failure → 30% migration degradation
        emergencyToMigration: 0.5,     // Emergency failure → 50% migration degradation
      },
    },

    // Combined reduction (calculated dynamically each month)
    combinedReduction: 0.0,
  };
}

/**
 * Initialize famine distribution state for a region
 *
 * Based on Sen's entitlement theory + regional vulnerability factors.
 */
export function initializeRegionalFamineState(
  region: RegionalPopulation
): import('@/types/famineDistribution').RegionalFamineState {
  return {
    // Food availability (starts at baseline foodSecurity value)
    localProduction: region.foodSecurity * 0.7, // Assume 70% local, 30% imports
    importCapacity: region.foodSecurity * 0.3,
    foodAvailability: region.foodSecurity,

    // Distribution networks (baseline = functional, degrades during crises)
    distributionNetworks: {
      transport: region.economicStage >= 2 ? 0.8 : 0.5, // Infrastructure scales with economy
      markets: region.economicStage >= 2 ? 0.9 : 0.6,   // Market function scales with economy
      aidAccess: 1.0 - region.conflictRisk,              // Conflict blocks aid
      tradeBorders: 1.0 - region.conflictRisk * 0.5,     // Conflict disrupts trade
      effectiveness: 0.8, // Calculated from above
    },
    accessibleFood: region.foodSecurity, // Starts equal to availability

    // Entitlements (baseline = most people can access food)
    entitlements: {
      productionBased: region.foodSecurity * 0.3, // Subsistence farmers (30% of pop in low-income regions)
      tradeBased: region.economicStage >= 2 ? 0.8 : 0.5, // Market access
      laborBased: region.economicStage >= 2 ? 0.8 : 0.5, // Employment
      transferBased: region.healthcareQuality * 0.5, // Safety nets (proxy: healthcare quality)
    },
    foodSecurity: region.foodSecurity,

    // Vulnerability factors (from existing regional characteristics)
    vulnerability: {
      importDependence: region.resourceVulnerability, // Already tracks import dependence
      conflictIntensity: region.conflictRisk,
      infrastructureQuality: region.economicStage >= 2 ? 0.8 : 0.5,
      governance: region.healthcareQuality, // Healthcare is proxy for governance quality
      economicCapacity: region.economicStage / 4.0, // Normalize to 0-1
      climateExposure: region.climateVulnerability,
      famineMultiplier: 1.0, // Calculated dynamically
    },

    // Famine risk (starts low, increases during crises)
    famineRisk: 1.0 - region.foodSecurity,

    // Primary cause (production is default until crisis hits)
    primaryCause: 'production',
  };
}

/**
 * Initialize resilience profile for a region
 *
 * Based on existing regional characteristics as proxies:
 * - Economic stage → fiscal buffers, innovation capacity
 * - Healthcare quality → social support, emotion regulation
 * - Conflict risk → resilience degradation
 */
export function initializeRegionalResilienceProfile(
  region: RegionalPopulation
): NonNullable<RegionalPopulation['resilienceProfile']> {
  // Economic stage as proxy for socioeconomic status
  const socioeconomicStatus = region.economicStage / 4.0; // Normalize to 0-1

  // Healthcare quality as proxy for social support systems
  const socialSupport = region.healthcareQuality;

  // Inverse of conflict risk as proxy for emotion regulation capacity
  const emotionRegulation = 1.0 - region.conflictRisk * 0.5;

  // Economic stage determines organizational resilience
  const functionalResilience = region.economicStage >= 3 ? 0.8 : 0.5;
  const operationalResilience = region.economicStage >= 2 ? 0.7 : 0.4;
  const strategicResilience = region.economicStage >= 3 ? 0.7 : 0.3;

  // Economic + governance determines institutional resilience
  const fiscalBuffers = socioeconomicStatus * 0.8; // Rich countries have reserves
  const laborFlexibility = region.economicStage >= 3 ? 0.7 : 0.4;
  const innovationCapacity = region.economicStage >= 3 ? 0.8 : 0.3;

  // Calculate aggregate (weighted average)
  const aggregateResilience = (
    socioeconomicStatus * 0.15 +
    socialSupport * 0.10 +
    emotionRegulation * 0.10 +
    functionalResilience * 0.15 +
    operationalResilience * 0.15 +
    strategicResilience * 0.15 +
    fiscalBuffers * 0.10 +
    laborFlexibility * 0.05 +
    innovationCapacity * 0.05
  );

  return {
    socioeconomicStatus,
    socialSupport,
    emotionRegulation,
    functionalResilience,
    operationalResilience,
    strategicResilience,
    fiscalBuffers,
    laborFlexibility,
    innovationCapacity,
    aggregateResilience,
  };
}

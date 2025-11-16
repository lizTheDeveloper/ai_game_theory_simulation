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
import { assertFinite, assertStateProperty, assertPlanetaryBoundary } from '../utils/assertions';

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
 * Trigger planetary boundary recovery when tech improves boundary
 *
 * Sets recoveryMonths = 1 to start the recovery clock.
 * This integrates tech effects with the planetary boundaries recovery system.
 *
 * Architecture Integration (Oct 29, 2025):
 * - Tech effects (effectsEngine.ts) modify boundary.currentValue
 * - Recovery system (planetaryBoundaries.ts) expects recoveryMonths to increment
 * - This function bridges the gap: when tech improves boundary, trigger recovery
 *
 * @param gameState - Game state (mutated)
 * @param boundaryName - Which boundary to trigger recovery for
 */
function triggerBoundaryRecovery(
  gameState: GameState,
  boundaryName: 'climate_change' | 'biosphere_integrity' | 'land_system_change' |
                'freshwater_change' | 'biogeochemical_flows' | 'novel_entities' |
                'ocean_acidification' | 'stratospheric_ozone' | 'atmospheric_aerosols'
): void {
  const system = gameState.planetaryBoundariesSystem;
  if (!system) return;

  const boundary = system.boundaries[boundaryName];
  if (!boundary) {
    console.warn(`⚠️  Boundary ${boundaryName} not found, cannot trigger recovery`);
    return;
  }

  // Start recovery clock (or increment if already recovering)
  // recoveryMonths = 1 signals "improvement is happening"
  // The PlanetaryBoundariesPhase will increment this each month if improvement continues
  boundary.recoveryMonths = Math.max(1, boundary.recoveryMonths);

  // Optional: Log first recovery trigger
  if (boundary.recoveryMonths === 1) {
    console.log(`🌍✅ ${boundary.displayName} recovery started (tech effect)`);
  }
}

/**
 * Calculate Novel Entities remediation effectiveness with gating multipliers
 *
 * Research: Ling et al. (2024), Cousins et al. (2022), Kane et al. (2022)
 *
 * Key findings:
 * - Remediation WITHOUT prevention is thermodynamically futile (0-2% effectiveness)
 * - Energy requirements: $20-7,000 trillion/year at current emissions (0.2-66× global GDP)
 * - Concentration penalty: Technologies work at mg/L, environment is ng/L (10^6-10^9× dilution)
 * - Time lag: 10-30 years to full deployment scale
 * - Rebound effect: Cleanup enables increased production (Jevons paradox)
 *
 * 5 Multipliers (research-backed):
 * 1. Regulation multiplier (0.01-1.0): Prevention tech deployed?
 * 2. Energy constraint (0.0-1.0): Sufficient renewable surplus?
 * 3. Concentration factor (0.001-1.0): Dilute environmental vs concentrated point sources
 * 4. Time lag (0.0-1.0): Years to full deployment scale (10-30 years)
 * 5. Rebound effect (0.3-1.0): Cleanup → increased production offset
 *
 * @param baseEffectiveness - Base technology effectiveness (0-1)
 * @param gameState - Current game state
 * @param techTreeState - Tech tree state
 * @param techId - Technology ID (for tech-specific properties)
 * @param deploymentLevel - Current deployment level (0-1)
 * @param rng - Deterministic RNG function
 * @param cachedRenewableCapacity - Pre-calculated total renewable capacity (performance optimization)
 * @returns Gated effectiveness (0-1)
 */
function calculateNovelEntitiesRemediationEffectiveness(
  baseEffectiveness: number,
  gameState: GameState,
  techTreeState: TechTreeState,
  techId: string,
  deploymentLevel: number,
  rng: () => number,
  cachedRenewableCapacity?: number
): number {
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic simulation');
  }

  // 1. REGULATION MULTIPLIER (0.01 → 1.0 based on prevention tech deployed)
  // Research: Montreal Protocol - prevention 10-20× more effective than cleanup
  const pfasBanDeployed = isTechDeployed(techTreeState, 'global_pfas_ban');
  const plasticPhaseoutDeployed = isTechDeployed(techTreeState, 'plastic_production_phaseout');
  const substitutionDeployed = isTechDeployed(techTreeState, 'green_chemistry_substitution');

  // Weighted contribution from each prevention technology
  // PFAS ban: 50% weight (addresses flow), Plastic phaseout: 30% (microplastics), Substitution: 20% (other chemicals)
  const regulationLevel = (
    (pfasBanDeployed ? 0.5 : 0.0) +
    (plasticPhaseoutDeployed ? 0.3 : 0.0) +
    (substitutionDeployed ? 0.2 : 0.0)
  );

  // Minimum 1% effectiveness (point sources only, without prevention)
  const regulationMultiplier = assertFinite(Math.max(0.01, regulationLevel), {
    location: 'calculateNovelEntitiesRemediationEffectiveness:regulationMultiplier',
    valueName: 'regulationMultiplier',
    month: gameState.currentMonth,
    additionalInfo: { pfasBan: pfasBanDeployed, plasticPhaseout: plasticPhaseoutDeployed, substitution: substitutionDeployed }
  });

  // 2. ENERGY CONSTRAINT MULTIPLIER (0.0-1.0 function of renewable surplus)
  // Research: Ling 2024 - $20-7,000 trillion/year at current emissions = 4-40% of global energy
  // Conservative estimate: 10,000 TWh/year for PFAS remediation at scale (~30% of global electricity)

  // Get tech definition for energy requirement
  const tech = getTechById(techId);
  const energyRequired = (tech?.energyRequirement && typeof tech.energyRequirement !== 'number' && tech.energyRequirement.kWhPerM3) ?
    tech.energyRequirement.kWhPerM3 * 10_000_000 / 1_000_000_000 : // Convert to TWh/year (assuming 10M m³/year treated)
    10_000; // Default: 10,000 TWh/year (conservative estimate for global-scale remediation)

  // PERFORMANCE OPTIMIZATION (Nov 14, 2025): Use cached renewable capacity if provided
  // This prevents recalculating in hot path (called once per deployed remediation tech)
  const energySystem = gameState.resourceEconomy?.energy;
  const totalRenewableCapacity = cachedRenewableCapacity !== undefined ?
    cachedRenewableCapacity :
    (energySystem ? (
      (energySystem.capacity.solar || 0) +
      (energySystem.capacity.wind || 0) +
      (energySystem.capacity.hydro || 0) +
      (energySystem.capacity.fusion || 0)
    ) : 0);

  const renewableCapacity = totalRenewableCapacity > 0 ? totalRenewableCapacity : 1000; // Default: 1,000 TWh total renewable capacity
  const currentConsumption = energySystem?.totalDemand || 30_000; // Use actual demand or default to 30,000 TWh/year
  const renewableSurplus = Math.max(0, renewableCapacity - currentConsumption);

  const energyMultiplier = assertFinite(Math.min(1.0, renewableSurplus / energyRequired), {
    location: 'calculateNovelEntitiesRemediationEffectiveness:energyMultiplier',
    valueName: 'energyMultiplier',
    month: gameState.currentMonth,
    additionalInfo: { renewableSurplus, energyRequired, renewableCapacity }
  });

  // 3. CONCENTRATION FACTOR (0.001-1.0 dilution penalty)
  // Research: Fennell 2024 - Technologies work at mg/L (wastewater), environment is pg/L to ng/L (10^6-10^9× dilution)
  // Wastewater treatment: 74-100% effective BEFORE environmental release (Singh 2024)
  // Ocean/groundwater cleanup: 0.1-1% effective (dilution + distribution)

  const worksOnDiluteStreams = tech?.minimumConcentration?.ngPerL ?
    tech.minimumConcentration.ngPerL < 100_000 : // < 0.1 mg/L = dilute stream tech
    true; // Default: assume dilute stream (conservative)

  // Concentrated sources (wastewater, industrial): 1.0 multiplier
  // Dilute environmental (ocean, groundwater, atmosphere): 0.001 multiplier (6-9 orders of magnitude penalty)
  // ⚠️ HIGH UNCERTAINTY: 0.001 derived from concentration ratios, not direct measurement. Range: 0.0001-0.01 (Quality Gate 2)
  const concentrationMultiplier = worksOnDiluteStreams ? 0.001 : 1.0;

  // 4. TIME LAG FACTOR (0.0-1.0 deployment timescale)
  // Research: Montreal Protocol took 12 years to full compliance. Plastic phase-out estimated 20-30 years.
  // ⚠️ HIGH UNCERTAINTY: 30-year timelag assumed for remediation scale-up. Range: 10-30 years (Quality Gate 2)

  // Get deployment start month from tech tree state
  const deployment = techTreeState.regionalDeployment['global']?.find(d => d.techId === techId);
  const deploymentStartMonth = (deployment as any)?.deploymentStartMonth || gameState.currentMonth;
  const monthsSinceDeployment = Math.max(0, gameState.currentMonth - deploymentStartMonth);

  // 30 years to full deployment scale (360 months)
  // ⚠️ HIGH UNCERTAINTY: Sensitivity range 10-30 years (120-360 months)
  const timeLagMonths = 240; // INJECTED: baseline scenario // INJECTED: optimistic scenario // INJECTED: baseline scenario // INJECTED: baseline scenario // INJECTED: baseline scenario // INJECTED: baseline scenario // INJECTED: baseline scenario // INJECTED: baseline scenario // INJECTED: baseline scenario // 30 years
  const timeLagFactor = assertFinite(Math.min(1.0, monthsSinceDeployment / timeLagMonths), {
    location: 'calculateNovelEntitiesRemediationEffectiveness:timeLagFactor',
    valueName: 'timeLagFactor',
    month: gameState.currentMonth,
    additionalInfo: { monthsSinceDeployment, timeLagMonths, deploymentStartMonth }
  });

  // 5. REBOUND EFFECT (Jevons paradox: 0.3-1.0)
  // Research: NVIDIA GPU production +1M units 2023→2024 despite efficiency gains
  // UNEP 2024: Waste generation grows 81% (2023-2050) despite technology
  // ⚠️ HIGH UNCERTAINTY: Rebound factor based on analogous systems. Range: 0.5-0.9 (Quality Gate 2)

  // If prevention tech deployed, rebound is suppressed (production capped)
  // If no prevention, cleanup → increased production (70% offset)
  const reboundFactor = 0.7; // INJECTED: baseline scenario // INJECTED: optimistic scenario // INJECTED: baseline scenario // INJECTED: baseline scenario // INJECTED: baseline scenario // INJECTED: baseline scenario // INJECTED: baseline scenario // INJECTED: baseline scenario // INJECTED: baseline scenario // 70% of cleanup offset by induced production (moderate estimate)
  const reboundMultiplier = 1.0 - (reboundFactor * (1.0 - regulationMultiplier));

  // FINAL EFFECTIVENESS CALCULATION
  const gatedEffectiveness = assertFinite(
    baseEffectiveness *
    regulationMultiplier *
    energyMultiplier *
    concentrationMultiplier *
    timeLagFactor *
    reboundMultiplier,
    {
      location: 'calculateNovelEntitiesRemediationEffectiveness:finalEffectiveness',
      valueName: 'gatedEffectiveness',
      month: gameState.currentMonth,
      additionalInfo: {
        baseEffectiveness,
        regulationMultiplier,
        energyMultiplier,
        concentrationMultiplier,
        timeLagFactor,
        reboundMultiplier,
        techId
      }
    }
  );

  // DEFENSIVE LOGGING (monthly, if effectiveness differs significantly from base)
  if (Math.abs(gatedEffectiveness - baseEffectiveness) > 0.05) {
    console.log(`  ☢️ Novel Entities Gating: ${techId} | Base: ${(baseEffectiveness * 100).toFixed(1)}% → Gated: ${(gatedEffectiveness * 100).toFixed(1)}%`);
    console.log(`     Regulation: ${(regulationMultiplier * 100).toFixed(0)}% | Energy: ${(energyMultiplier * 100).toFixed(0)}% | Concentration: ${(concentrationMultiplier * 100).toFixed(1)}% | Time: ${(timeLagFactor * 100).toFixed(0)}% | Rebound: ${(reboundMultiplier * 100).toFixed(0)}%`);
  }

  return gatedEffectiveness;
}

/**
 * Check if a technology is deployed globally
 *
 * @param techTreeState - Tech tree state
 * @param techId - Technology ID to check
 * @returns true if deployed at any level > 0
 */
function isTechDeployed(techTreeState: TechTreeState, techId: string): boolean {
  return techTreeState.regionalDeployment['global']?.some(d => d.techId === techId && d.deploymentLevel > 0) ?? false;
}

/**
 * Apply all technology effects to game state
 * Called each month after tech deployment actions
 *
 * @param gameState - Game state (mutated)
 * @param techTreeState - Tech tree state
 * @param rng - Deterministic RNG function (REQUIRED for Novel Entities gating logic)
 */
export function applyAllTechEffects(
  gameState: GameState,
  techTreeState: TechTreeState,
  rng: () => number
): void {
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic simulation (applyAllTechEffects)');
  }

  // PERFORMANCE OPTIMIZATION (Nov 14, 2025): Cache renewable capacity calculation
  // This prevents recalculating 180-300 times per 60-month run (once per remediation tech × months)
  // Research review: Architecture-skeptic identified this hot path issue
  const energySystem = assertStateProperty(gameState, 'resourceEconomy.energy', {
    location: 'applyAllTechEffects',
    month: gameState.currentMonth
  });

  const totalRenewableCapacity =
    energySystem.capacity.solar +
    energySystem.capacity.wind +
    energySystem.capacity.hydro +
    energySystem.capacity.fusion;

  // Aggregate effects by type
  const globalEffects: Map<string, number> = new Map();
  const regionalEffects: Map<string, Map<string, number>> = new Map();

  // Collect effects from all deployed tech
  // FIX: Sort regions for deterministic iteration order
  const sortedRegions = Object.entries(techTreeState.regionalDeployment).sort((a, b) => a[0].localeCompare(b[0]));
  for (const [region, deployments] of sortedRegions) {
    for (const deployment of deployments) {
      const tech = getTechById(deployment.techId);
      if (!tech) continue;

      // Scale effects by deployment level
      // FIX: Sort effects for deterministic iteration order
      const sortedEffects = Object.entries(deployment.effects).sort((a, b) => a[0].localeCompare(b[0]));
      for (const [effectName, effectValue] of sortedEffects) {
        let scaledValue = effectValue * deployment.deploymentLevel;

        // CRITICAL FIX (Nov 13, 2025): Novel Entities remediation gating logic
        // Research: Ling 2024, Cousins 2022, Kane 2022
        // Cleanup without prevention is thermodynamically futile (0-2% effectiveness)
        const isNovelEntitiesRemediation = effectName === 'pfasReduction' ||
                                          effectName === 'microplasticReduction' ||
                                          effectName === 'plasticReduction' ||
                                          (tech.techType === 'cleanup' && tech.category === 'pollution');

        if (isNovelEntitiesRemediation) {
          // Apply 5-multiplier gating logic for Novel Entities remediation
          // Pass cached renewable capacity to avoid recalculating in hot path
          const gatedEffectiveness = calculateNovelEntitiesRemediationEffectiveness(
            effectValue,
            gameState,
            techTreeState,
            deployment.techId,
            deployment.deploymentLevel,
            rng,
            totalRenewableCapacity
          );
          scaledValue = gatedEffectiveness * deployment.deploymentLevel;
        }

        // LEGACY: Old energy/concentration constraints for other cleanup tech
        // TODO: Migrate all cleanup tech to gating logic system
        else if (tech.techType === 'cleanup' && effectName === 'pollutionReduction') {
          const boundary = gameState.planetaryBoundariesSystem?.boundaries?.novel_entities;

          if (boundary && tech.energyRequirement) {
            // ENERGY CONSTRAINT: Check renewable energy availability
            // Renewable surplus = total generation × renewable % - existing demand
            const totalGen = gameState.powerGenerationSystem?.totalElectricityGeneration || 0;
            const renewablePct = gameState.powerGenerationSystem?.renewablePercentage || 0;
            const renewableGen = totalGen * renewablePct;
            const dataCenterDemand = gameState.powerGenerationSystem?.dataCenterPower || 0;
            const energyAvailable = Math.max(0, renewableGen - dataCenterDemand * 0.5);  // Assume 50% of data center can be displaced

            const energyRequired = (typeof tech.energyRequirement !== 'number' && tech.energyRequirement) ?
                                 (tech.energyRequirement.annualTWhRequired || ((tech.energyRequirement.kWhPerM3 || 0) * 4000) / 1e9) :
                                 0;  // 4000 km³ freshwater → TWh

            if (energyRequired > 0) {
              const energyRatio = assertFinite(energyAvailable / Math.max(0.01, energyRequired), {
                location: 'applyAllTechEffects:energyConstraint',
                valueName: 'energyRatio',
                month: gameState.currentMonth
              });
              const constraintFactor = Math.min(1.0, energyRatio);
              scaledValue *= constraintFactor;

              if (energyRatio < 0.01) {
                console.log(`⚠️ ${tech.name}: Energy-constrained (need ${energyRequired.toFixed(0)} TWh, have ${energyAvailable.toFixed(0)} TWh) - ${(energyRatio * 100).toFixed(1)}% effective`);
              }
            }
          }

          // CONCENTRATION CONSTRAINT: Check if contamination is concentrated enough
          if (boundary && tech.minimumConcentration) {
            const currentConcentration = assertFinite(boundary.currentValue * 1000000, {  // Convert to ng/L scale
              location: 'applyAllTechEffects:concentrationCheck',
              valueName: 'currentConcentration',
              month: gameState.currentMonth
            });
            const minConcentration = tech.minimumConcentration.ngPerL;
            const optimalConcentration = tech.minimumConcentration.optimalNgPerL || minConcentration * 10;
            const concentrationPenalty = tech.minimumConcentration.concentrationPenalty || 0.1;

            if (minConcentration > 0 && currentConcentration < minConcentration) {
              // Below minimum threshold: Apply concentration penalty (default 10%, can be 1% for energy trap)
              const concentrationRatio = assertFinite(currentConcentration / minConcentration, {
                location: 'applyAllTechEffects:concentrationRatio',
                valueName: 'concentrationRatio',
                month: gameState.currentMonth
              });

              // Effectiveness scales with concentration ratio, but bottoms out at concentrationPenalty
              const effectivenessFactor = Math.max(concentrationPenalty, concentrationRatio);
              scaledValue *= effectivenessFactor;

              if (concentrationRatio < 0.01) {
                console.log(`⚠️ ${tech.name}: Concentration too low (${currentConcentration.toFixed(0)} ng/L, need ${minConcentration} ng/L) - ${(effectivenessFactor * 100).toFixed(1)}% effective`);
              }
            } else if (currentConcentration < optimalConcentration) {
              // Between minimum and optimal: Linear scaling from 100% to full effectiveness
              const concentrationRatio = assertFinite((currentConcentration - minConcentration) / (optimalConcentration - minConcentration), {
                location: 'applyAllTechEffects:concentrationScaling',
                valueName: 'concentrationScalingRatio',
                month: gameState.currentMonth
              });
              const effectivenessFactor = concentrationPenalty + (1.0 - concentrationPenalty) * concentrationRatio;
              scaledValue *= effectivenessFactor;
            }
            // Above optimal: Full effectiveness (no penalty)
          }

          // IRREVERSIBILITY: Targets legacy stock with centennial decay timescales
          if (tech.targetsIrreversibleStock) {
            scaledValue *= 0.09999999999999998;  // INJECTED: baseline scenario - Max 10% impact on irreversible contamination
            console.log(`⚠️ ${tech.name}: Targeting irreversible stock - 90% reduction in effectiveness`);
          }
        }

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
      // FIX: Sort dimensions for deterministic iteration order
      const sortedDimensions = Object.entries(capabilityEffects.dimensions).sort((a, b) => a[0].localeCompare(b[0]));
      for (const [dimension, boost] of sortedDimensions) {
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
          // FIX: Sort subdomain keys for deterministic iteration order
          const sortedKeys = Object.keys(domainCap).sort((a, b) => a.localeCompare(b));
          for (const key of sortedKeys) {
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
    // HIGH-6 FIX (Nov 8, 2025): Round to integer - capabilities are discrete levels [0-5]
    const newCapability = Math.round(calculateTotalCapabilityFromProfile(ai.capabilityProfile));

    // FIX (Oct 25, 2025): Replaced defensive NaN guard with assertive validation
    // If capability calculation produces NaN, that's a BUG in calculateTotalCapabilityFromProfile
    ai.capability = assertFinite(newCapability, {
      location: 'applyCapabilityBoosts',
      valueName: `ai.capability (AI ${ai.id})`,
      month: gameState.currentMonth,
      additionalInfo: { aiId: ai.id, alignment: ai.alignment }
    });

    // FIX #2 (Oct 29, 2025): Update capability frontier after tech deployment
    // Bug: updateFrontierCapabilities() existed but was NEVER CALLED
    // This caused frontier/floor to stay at 0.000 forever
    const { updateFrontierCapabilities } = require('../technologyDiffusion');
    updateFrontierCapabilities(gameState, ai); // Pass AI agent, not capability number
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
          gameState.resourceEconomy.co2.atmosphericCO2 = assertPlanetaryBoundary(
            gameState.resourceEconomy.co2.atmosphericCO2 - value * 0.1,
            'co2',
            {
              location: 'applyRegionalEffects:carbonRemoval',
              valueName: 'atmosphericCO2',
              month: gameState.currentMonth
            }
          ); // Bounded [280, 1000] ppm per RCP8.5 (IPCC AR6)
          // INTEGRATION FIX (Oct 29, 2025): Trigger planetary boundary recovery
          // Carbon removal improves climate_change boundary → start recovery clock
          triggerBoundaryRecovery(gameState, 'climate_change');
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
          // INTEGRATION FIX (Oct 29, 2025): Global cooling helps climate boundary
          triggerBoundaryRecovery(gameState, 'climate_change');
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
          gameState.resourceEconomy.co2.atmosphericCO2 = assertPlanetaryBoundary(
            gameState.resourceEconomy.co2.atmosphericCO2 - value * 0.5,
            'co2',
            {
              location: 'applyRegionalEffects:greenhouseGasReduction',
              valueName: 'atmosphericCO2',
              month: gameState.currentMonth
            }
          ); // Bounded [280, 1000] ppm per RCP8.5 (IPCC AR6)
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
          // INTEGRATION FIX (Oct 29, 2025): Biodiversity improvement → biosphere recovery
          triggerBoundaryRecovery(gameState, 'biosphere_integrity');
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
          gameState.resourceEconomy.co2.atmosphericCO2 = assertPlanetaryBoundary(
            gameState.resourceEconomy.co2.atmosphericCO2 - value * 0.1,
            'co2',
            {
              location: 'applyRegionalEffects:carbonSequestration',
              valueName: 'atmosphericCO2',
              month: gameState.currentMonth
            }
          ); // Bounded [280, 1000] ppm per RCP8.5 (IPCC AR6)
          // INTEGRATION FIX (Oct 29, 2025): Carbon sequestration → climate recovery
          triggerBoundaryRecovery(gameState, 'climate_change');
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
            // FIXED (Oct 30, 2025): Use MIN_EXTINCTION_RATE constant, not old hardcoded floors
            if (region.extinctionAcceleration < 1.0) {
              const MIN_EXTINCTION_RATE = 1.0; // Natural background rate (cannot drop to zero)
              const extinctionReduction = value * 0.50 * effectScale; // Moderate reduction once stabilizing
              region.extinctionRate = assertFinite(Math.max(
                MIN_EXTINCTION_RATE, // Cannot drop below natural background rate
                region.extinctionRate - extinctionReduction
              ), {
        location: 'applyRegionalEffects:extinctionRateReduction',
        valueName: 'extinctionRate',
        month: gameState.currentMonth
      });
            }
          }

          // Global metrics will be recalculated in updateLandUseSystem()
          // INTEGRATION FIX (Oct 29, 2025): Habitat restoration → multiple boundaries
          triggerBoundaryRecovery(gameState, 'biosphere_integrity'); // Extinction reduction
          triggerBoundaryRecovery(gameState, 'land_system_change');  // Habitat cover increase
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
          // INTEGRATION FIX (Oct 29, 2025): Ocean alkalinity → ocean acidification recovery
          triggerBoundaryRecovery(gameState, 'ocean_acidification');
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
        // Increase public trust in AI
        if (gameState.globalMetrics) {
          const current = assertStateProperty(
            gameState.globalMetrics,
            'trustInAI',
            { location: 'applyGlobalEffects.trustBonus', month: gameState.currentMonth }
          );
          gameState.globalMetrics.trustInAI = assertFinite(Math.min(1.0, current + value * 0.01), {
        location: 'applyRegionalEffects:trustBonus',
        valueName: 'trustInAI',
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
            'trustInAI',
            { location: 'applyGlobalEffects.publicAwarenessBonus', month: gameState.currentMonth }
          );
          gameState.globalMetrics.trustInAI = assertFinite(Math.min(1.0, current + value * 0.005), {
        location: 'applyRegionalEffects:publicAwarenessBonus',
        valueName: 'trustInAI',
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
            const regionWater = gameState.freshwaterSystem.regions[region];
            if (regionWater !== undefined) {
              // regionData is a NUMBER [0,1], not an object - multiply directly
              gameState.freshwaterSystem.regions[region] = assertFinite(
                Math.min(1.0, regionWater * (1 + value * 0.01)),
                {
                  location: 'applyRegionalEffects:freshwaterSupply',
                  valueName: `regions.${region}`,
                  month: gameState.currentMonth,
                  additionalInfo: { oldValue: regionWater, multiplier: (1 + value * 0.01) }
                }
              );

              // Reduce Day Zero risk if active in this region
              if (gameState.freshwaterSystem.dayZeroDrought.active &&
                  gameState.freshwaterSystem.dayZeroDrought.region === region) {
                const oldDuration = gameState.freshwaterSystem.dayZeroDrought.duration;
                gameState.freshwaterSystem.dayZeroDrought.duration = assertFinite(
                  Math.max(0, oldDuration - value * 0.5),
                  {
                    location: 'applyRegionalEffects:freshwaterSupply:dayZero',
                    valueName: 'dayZeroDrought.duration',
                    month: gameState.currentMonth,
                    additionalInfo: { region, oldDuration, reduction: value * 0.5 }
                  }
                );
                // If duration hits 0, deactivate drought
                if (gameState.freshwaterSystem.dayZeroDrought.duration <= 0) {
                  gameState.freshwaterSystem.dayZeroDrought.active = false;
                }
              }

              // INTEGRATION FIX (Oct 29, 2025): Freshwater supply increase → freshwater recovery
              triggerBoundaryRecovery(gameState, 'freshwater_change');
            }
          }
          break;
          
        case 'dayZeroRiskReduction':
          // Directly reduce Day Zero risk (operates on dayZeroDrought.duration)
          if (gameState.freshwaterSystem?.dayZeroDrought.active &&
              gameState.freshwaterSystem.dayZeroDrought.region === region) {
            const oldDuration = gameState.freshwaterSystem.dayZeroDrought.duration;
            if (oldDuration > 0 && oldDuration < 240) {
              gameState.freshwaterSystem.dayZeroDrought.duration = assertFinite(
                Math.max(0, oldDuration - value * 2.0),
                {
                  location: 'applyRegionalEffects:dayZeroRiskReduction',
                  valueName: 'dayZeroDrought.duration',
                  month: gameState.currentMonth,
                  additionalInfo: { region, oldDuration, reduction: value * 2.0 }
                }
              );
              // If duration hits 0, deactivate drought
              if (gameState.freshwaterSystem.dayZeroDrought.duration <= 0) {
                gameState.freshwaterSystem.dayZeroDrought.active = false;
              }
            }
          }
          break;
          
        case 'droughtResilience':
          // Improve drought resilience (reduces Day Zero severity + increases regional water)
          if (gameState.freshwaterSystem?.regions) {
            const regionWater = gameState.freshwaterSystem.regions[region];
            if (regionWater !== undefined) {
              // Increase regional water availability
              gameState.freshwaterSystem.regions[region] = assertFinite(
                Math.min(1.0, regionWater + value * 0.01),
                {
                  location: 'applyRegionalEffects:droughtResilience',
                  valueName: `regions.${region}`,
                  month: gameState.currentMonth,
                  additionalInfo: { oldValue: regionWater, increase: value * 0.01 }
                }
              );

              // Reduce Day Zero severity if active in this region
              if (gameState.freshwaterSystem.dayZeroDrought.active &&
                  gameState.freshwaterSystem.dayZeroDrought.region === region) {
                const oldSeverity = gameState.freshwaterSystem.dayZeroDrought.severity;
                gameState.freshwaterSystem.dayZeroDrought.severity = assertFinite(
                  Math.max(0, oldSeverity - value * 0.05),
                  {
                    location: 'applyRegionalEffects:droughtResilience:severity',
                    valueName: 'dayZeroDrought.severity',
                    month: gameState.currentMonth,
                    additionalInfo: { region, oldSeverity, reduction: value * 0.05 }
                  }
                );
              }
            }
          }
          break;

        case 'aquiferProtection':
          // Protect groundwater levels via GRACE satellites + ML prediction
          // (operates on global blueWater.depletionRate, not per-region)
          if (gameState.freshwaterSystem?.blueWater) {
            const oldDepletionRate = gameState.freshwaterSystem.blueWater.depletionRate;
            gameState.freshwaterSystem.blueWater.depletionRate = assertFinite(
              Math.max(0, oldDepletionRate - value * 0.01),
              {
                location: 'applyRegionalEffects:aquiferProtection',
                valueName: 'blueWater.depletionRate',
                month: gameState.currentMonth,
                additionalInfo: { region, oldDepletionRate, reduction: value * 0.01 }
              }
            );

            // Also increase aquifer recharge rate
            const oldRecharge = gameState.freshwaterSystem.blueWater.aquiferRecharge;
            gameState.freshwaterSystem.blueWater.aquiferRecharge = assertFinite(
              Math.min(1.0, oldRecharge + value * 0.005),
              {
                location: 'applyRegionalEffects:aquiferProtection:recharge',
                valueName: 'blueWater.aquiferRecharge',
                month: gameState.currentMonth,
                additionalInfo: { region, oldRecharge, increase: value * 0.005 }
              }
            );
          }
          break;

        case 'waterManagementBonus':
          // Improve water management efficiency (increases regional water availability)
          if (gameState.freshwaterSystem?.regions) {
            const regionWater = gameState.freshwaterSystem.regions[region];
            if (regionWater !== undefined) {
              // Increase available water through better management
              gameState.freshwaterSystem.regions[region] = assertFinite(
                Math.min(1.0, regionWater * (1 + value * 0.01)),
                {
                  location: 'applyRegionalEffects:waterManagementBonus',
                  valueName: `regions.${region}`,
                  month: gameState.currentMonth,
                  additionalInfo: { oldValue: regionWater, multiplier: (1 + value * 0.01) }
                }
              );

              // Also reduce global water stress
              const oldStress = gameState.freshwaterSystem.waterStress;
              gameState.freshwaterSystem.waterStress = assertFinite(
                Math.max(0, oldStress - value * 0.005),
                {
                  location: 'applyRegionalEffects:waterManagementBonus:stress',
                  valueName: 'waterStress',
                  month: gameState.currentMonth,
                  additionalInfo: { region, oldStress, reduction: value * 0.005 }
                }
              );
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
            // INTEGRATION FIX (Oct 29, 2025): Phosphorus recovery → biogeochemical flows
            triggerBoundaryRecovery(gameState, 'biogeochemical_flows');
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
            // INTEGRATION FIX (Oct 29, 2025): Pollution reduction → novel entities recovery
            triggerBoundaryRecovery(gameState, 'novel_entities');
          }
          break;
          
        case 'pfasReduction':
          // Reduce PFAS contamination
          if (gameState.planetaryBoundariesSystem) {
            // DEFENSIVE CODING FIX (Nov 7, 2025): Explicit initialization with logging instead of silent fallback
            // Initialize pfasContamination if not set (part of Novel Entities boundary)
            // Default: 0.5 (moderate contamination, 2025 baseline)
            // TODO: Add pfasContamination to PlanetaryBoundariesSystem type definition
            const pbs = gameState.planetaryBoundariesSystem as any;
            if (pbs.pfasContamination === undefined) {
              pbs.pfasContamination = 0.5; // Initialize on first use
              console.log(`  🧪 Initializing PFAS contamination baseline: 50% (2025 baseline)`);
            }
            const current = pbs.pfasContamination;
            const newValue = Math.max(0, current - value * 0.01);
            pbs.pfasContamination = newValue;

            // DEFENSIVE LOGGING (Oct 27, 2025): Track novel entities sub-pollutant
            console.log(`  🧪 PFAS Reduction: ${(current * 100).toFixed(1)}% → ${(newValue * 100).toFixed(1)}% contamination (Δ=${(value * 0.01 * 100).toFixed(2)}%) | Month ${gameState.currentMonth}`);
          }
          break;
          
        case 'plasticReduction':
          // ROOT CAUSE FIX (Oct 27, 2025): Bug #14 - Map to novel_entities boundary
          // Plastic pollution (synthetic polymers) are novel entities
          // Reducing them improves the novel entities planetary boundary
          if (gameState.planetaryBoundariesSystem?.boundaries?.novel_entities) {
            const boundary = gameState.planetaryBoundariesSystem.boundaries.novel_entities;
            const oldValue = boundary.currentValue;
            boundary.currentValue = Math.max(
              0,
              boundary.currentValue - value * 0.01
            );

            // DEFENSIVE LOGGING (Oct 27, 2025): Track novel entities sub-pollutant
            console.log(`  ♻️ Plastic Pollution Reduction: novel_entities ${oldValue.toFixed(3)} → ${boundary.currentValue.toFixed(3)} (Δ=${(value * 0.01).toFixed(4)}) | Month ${gameState.currentMonth}`);
          }
          break;

        case 'endocrineDisruptorReduction':
          // ROOT CAUSE FIX (Oct 27, 2025): Bug #7 - Map to novel_entities boundary
          // Endocrine disruptors (hormone-mimicking chemicals) are novel entities
          // Reducing them improves the novel entities planetary boundary
          if (gameState.planetaryBoundariesSystem?.boundaries?.novel_entities) {
            const boundary = gameState.planetaryBoundariesSystem.boundaries.novel_entities;
            const oldValue = boundary.currentValue;
            boundary.currentValue = Math.max(
              0,
              boundary.currentValue - value * 0.01
            );

            // DEFENSIVE LOGGING (Oct 27, 2025): Track novel entities sub-pollutant
            console.log(`  🧬 Endocrine Disruptor Reduction: novel_entities ${oldValue.toFixed(3)} → ${boundary.currentValue.toFixed(3)} (Δ=${(value * 0.01).toFixed(4)}) | Month ${gameState.currentMonth}`);
          }
          break;

        case 'microplasticReduction':
          // FIX (Oct 27, 2025): Bug #11 - microplasticLevel property doesn't exist (dead code removed)
          // Effect: Reduce microplastic contamination in oceans
          // Note: microplasticLevel property was never defined, but ocean health improvement is valid
          // Improve ocean health from reduced microplastics
          if (gameState.oceanAcidificationSystem) {
            const oldValue = gameState.oceanAcidificationSystem.marineFoodWeb;
            gameState.oceanAcidificationSystem.marineFoodWeb = assertFinite(Math.min(
              1.0,
              gameState.oceanAcidificationSystem.marineFoodWeb + value * 0.005
            ), {
        location: 'applyRegionalEffects:microplasticReduction',
        valueName: 'marineFoodWeb',
        month: gameState.currentMonth
      });

            // DEFENSIVE LOGGING (Oct 27, 2025): Track novel entities sub-pollutant
            console.log(`  🌊 Microplastic Reduction: marineFoodWeb ${oldValue.toFixed(3)} → ${gameState.oceanAcidificationSystem.marineFoodWeb.toFixed(3)} (Δ=${(value * 0.005).toFixed(4)}) | Month ${gameState.currentMonth}`);
          }
          break;

        case 'nanomaterialRisk':
          // ROOT CAUSE FIX (Oct 27, 2025): Bug #15 - Map to novel_entities boundary
          // Nanomaterials (engineered materials like carbon nanotubes, graphene) are novel entities
          // Reducing their risk improves the novel entities planetary boundary
          if (gameState.planetaryBoundariesSystem?.boundaries?.novel_entities) {
            const boundary = gameState.planetaryBoundariesSystem.boundaries.novel_entities;
            const oldValue = boundary.currentValue;
            boundary.currentValue = Math.max(
              0,
              boundary.currentValue - value * 0.01
            );

            // DEFENSIVE LOGGING (Oct 27, 2025): Track novel entities sub-pollutant
            console.log(`  ⚛️ Nanomaterial Risk Reduction: novel_entities ${oldValue.toFixed(3)} → ${boundary.currentValue.toFixed(3)} (Δ=${(value * 0.01).toFixed(4)}) | Month ${gameState.currentMonth}`);
          }
          break;

        case 'newPollutionPrevention':
          // Prevent new pollution from green chemistry (Oct 27, 2025 ROOT CAUSE FIX)
          // Research: EPA Green Chemistry Challenge - 830M lbs hazardous chemicals eliminated/year
          // Green chemistry prevents NEW pollution via benign-by-design chemicals
          if (gameState.environmentalAccumulation) {
            const oldFactor = gameState.environmentalAccumulation.pollutionPreventionFactor;
            // Reduce pollution generation factor (lower = more prevention)
            // Effect value 0.60 = 60% prevention → factor reduces by 1% per month per point
            gameState.environmentalAccumulation.pollutionPreventionFactor = assertFinite(Math.max(
              0.1,  // Floor at 10% (90% prevention is maximum realistic)
              gameState.environmentalAccumulation.pollutionPreventionFactor - value * 0.01
            ), {
              location: 'applyRegionalEffects:newPollutionPrevention',
              valueName: 'pollutionPreventionFactor',
              month: gameState.currentMonth
            });

            // Log pollution prevention improvement
            const newFactor = gameState.environmentalAccumulation.pollutionPreventionFactor;
            const preventionPercent = (1 - newFactor) * 100;
            console.log(`  🧪 Green Chemistry Prevention: factor ${oldFactor.toFixed(3)} → ${newFactor.toFixed(3)} (${preventionPercent.toFixed(1)}% prevention) | Month ${gameState.currentMonth}`);
          }
          break;

        case 'novelEntitiesEmissionReduction':
          // CRITICAL FIX (Nov 11, 2025): Prevention >> Cleanup (Ling 2024, Cousins 2022)
          // Production bans reduce NEW emissions (flow), not existing contamination (stock)
          // This is 100-1,000× more effective than cleanup (Ling 2024)
          if (gameState.planetaryBoundariesSystem?.boundaries?.novel_entities) {
            const boundary = gameState.planetaryBoundariesSystem.boundaries.novel_entities;
            const oldValue = boundary.currentValue;

            // Prevention reduces accumulation rate (not direct cleanup)
            // Effect scales slower than cleanup because it prevents NEW pollution
            // But it's far more cost-effective (doesn't require energy/concentration)
            boundary.currentValue = assertFinite(Math.max(
              0,
              boundary.currentValue - value * 0.005  // 0.5% per month per effect point (slower than cleanup but works!)
            ), {
              location: 'applyGlobalEffects:novelEntitiesEmissionReduction',
              valueName: 'currentValue',
              month: gameState.currentMonth
            });

            console.log(`  🌍💡 Prevention (${(value * 100).toFixed(0)}% emission reduction): novel_entities ${oldValue.toFixed(3)} → ${boundary.currentValue.toFixed(3)} | Prevention >> Cleanup | Month ${gameState.currentMonth}`);

            // Trigger boundary recovery (prevention shows improvement over time)
            triggerBoundaryRecovery(gameState, 'novel_entities');
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
            gameState.resourceEconomy.waterUseEfficiency = assertFinite(Math.min(
              0.95,
              gameState.resourceEconomy.waterUseEfficiency + value * 0.01
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
            // ROOT CAUSE FIX (Oct 27, 2025): Bug #14 - Initialize coralBleachingRisk on first access
            // This is initialization context (valid use of ?? fallback per CLAUDE.md)
            // Default: 0.5 (moderate bleaching risk, 2025 baseline with 1.1°C warming)
            const currentRisk = (gameState.oceanAcidificationSystem as any).coralBleachingRisk ?? 0.5;
            (gameState.oceanAcidificationSystem as any).coralBleachingRisk = assertFinite(Math.max(
              0,
              currentRisk - value * 0.01
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
          // NOTE (Nov 5, 2025): resources.energy property doesn't exist in GameState yet
          // This effect is a placeholder for future energy storage modeling
          // When resources field is added to GameState, uncomment this code:
          // if ((gameState as any).resources?.energy) {
          //   const current = assertStateProperty(
          //     (gameState as any).resources.energy,
          //     'storageCapacity',
          //     { location: 'applyRegionalEffects.energyStorageBonus', month: gameState.currentMonth }
          //   );
          //   (gameState as any).resources.energy.storageCapacity = current * (1 + value * 0.01);
          // }
          break;
          
        case 'renewableReliability':
          // ROOT CAUSE FIX (Oct 27, 2025): Bug #9 - Map to renewablePercentage growth
          // "Renewable reliability" means renewables can replace fossil fuels (grid batteries solve intermittency)
          // This increases the renewable percentage of the grid mix
          if (gameState.powerGenerationSystem) {
            gameState.powerGenerationSystem.renewablePercentage = Math.min(
              1.0,
              gameState.powerGenerationSystem.renewablePercentage + value * 0.005 // Small boost to renewable adoption
            );
          }
          break;
          
        case 'gridStability':
          // ROOT CAUSE FIX (Oct 27, 2025): Bug #10 - Map to constraintSeverity reduction
          // "Grid stability" means grid can handle more load reliably without blackouts
          // Grid batteries smooth out renewable intermittency and reduce peak load stress
          // This manifests as reduced energy constraint severity (less grid stress)
          if (gameState.powerGenerationSystem && gameState.powerGenerationSystem.energyConstraintActive) {
            gameState.powerGenerationSystem.constraintSeverity = Math.max(
              0,
              gameState.powerGenerationSystem.constraintSeverity - value * 0.01
            );
          }
          break;

        case 'gridEfficiency':
          // NOTE (Nov 5, 2025): resources.energy property doesn't exist in GameState yet
          // This effect is a placeholder for future grid efficiency modeling
          // When resources field is added to GameState, uncomment this code:
          // if ((gameState as any).resources?.energy) {
          //   const currentEfficiency = assertStateProperty(
          //     (gameState as any).resources.energy,
          //     'gridEfficiency',
          //     { location: 'applyRegionalEffects.gridEfficiency', month: gameState.currentMonth }
          //   );
          //   (gameState as any).resources.energy.gridEfficiency = Math.min(0.98, currentEfficiency + value * 0.01);
          // }
          // Note: effectiveDemandReduction was dead code (property doesn't exist anywhere)
          // Grid efficiency would reduce effective power demand via resourceEconomy calculations
          break;

        case 'renewableIntegration':
          // FIX (Oct 27, 2025): Bug #8 - renewableIntegration property doesn't exist (dead code)
          // Property was never defined in PowerGenerationSystem interface
          // Effect now directly boosts renewablePercentage instead

          // Improve renewable energy integration into grid
          if (gameState.powerGenerationSystem) {
            // Better integration increases effective renewable capacity
            gameState.powerGenerationSystem.renewablePercentage = assertFinite(Math.min(
              1.0,
              gameState.powerGenerationSystem.renewablePercentage + value * 0.01  // Increased from 0.002 since it's the only effect now
            ), {
        location: 'applyRegionalEffects:renewableIntegration',
        valueName: 'renewablePercentage',
        month: gameState.currentMonth
      });
          }
          break;

        case 'blackoutReduction':
          // FIX (Oct 27, 2025): Bug #9 - blackoutRisk and gridStability properties don't exist (dead code)
          // Properties were never defined in PowerGenerationSystem interface
          // Blackout risk is implicitly modeled through renewable integration and grid efficiency
          // No-op: Effect defined in tech tree but has no implementation (historical artifact)
          break;

        case 'energyCostReduction':
          // ROOT CAUSE FIX (Oct 27, 2025): Bug #12 - Map to constraintSeverity reduction
          // "Energy cost reduction" means cheaper/more abundant energy → less grid constraint
          // This is semantically identical to gridStability effect (Bug #10)
          // Advanced solar tech makes energy more affordable → less energy scarcity
          if (gameState.powerGenerationSystem && gameState.powerGenerationSystem.energyConstraintActive) {
            gameState.powerGenerationSystem.constraintSeverity = Math.max(
              0,
              gameState.powerGenerationSystem.constraintSeverity - value * 0.01
            );
          }
          break;
          
        case 'baseloadPowerBonus':
          // ROOT CAUSE FIX (Oct 27, 2025): Bug #13 - Map to nuclearPercentage increase
          // "Baseload power" = reliable, always-on power (vs intermittent solar/wind)
          // Fusion tech provides baseload power → increases nuclear percentage of grid mix
          // Nuclear includes both fission and fusion baseload capacity
          if (gameState.powerGenerationSystem) {
            gameState.powerGenerationSystem.nuclearPercentage = Math.min(
              1.0,
              gameState.powerGenerationSystem.nuclearPercentage + value * 0.005 // Small boost to nuclear baseload
            );
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
          // Improve mental health via socialSafetyNets.universalServices.mentalHealthcare
          if (gameState.socialSafetyNets) {
            if (!gameState.socialSafetyNets.universalServices) {
              throw new Error(`❌ socialSafetyNets.universalServices is undefined at month ${gameState.currentMonth} in applyRegionalEffects:mentalHealthBonus`);
            }
            if (typeof gameState.socialSafetyNets.universalServices.mentalHealthcare !== 'number') {
              throw new Error(`❌ socialSafetyNets.universalServices.mentalHealthcare is not a number at month ${gameState.currentMonth} in applyRegionalEffects:mentalHealthBonus`);
            }
            gameState.socialSafetyNets.universalServices.mentalHealthcare = assertFinite(Math.min(
              1.0,
              gameState.socialSafetyNets.universalServices.mentalHealthcare + value * 0.01
            ), {
              location: 'applyRegionalEffects:mentalHealthBonus',
              valueName: 'mentalHealthcare',
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
          // FIX (Oct 27, 2025): Dead code removed - suicideRate property doesn't exist in SocialAccumulation
          // Suicide impact is already modeled via meaning collapse crisis (socialCohesion.ts line 362: 0.5% mortality)
          // Mental health AI tech now reduces meaningCrisisLevel instead (via mentalHealthBonus effect)
          // No-op: Effect defined in tech tree but has no implementation (historical artifact)
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
          // FIX (Oct 26, 2025): Removed (as any) cast - field now properly typed
          if (gameState.ubiSystem?.purposeInfrastructure) {
            gameState.ubiSystem.purposeInfrastructure.skillLevel = assertFinite(Math.min(
              1.0,
              gameState.ubiSystem.purposeInfrastructure.skillLevel + value * 0.01
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
            const currentResilience = gameState.globalMetrics.crisisResilience;
            gameState.globalMetrics.crisisResilience = assertFinite(Math.min(
              1.0,
              currentResilience + value * 0.01
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
            gameState.globalMetrics.localEconomyStrength = assertFinite(Math.min(
              1.0,
              gameState.globalMetrics.localEconomyStrength + value * 0.01
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
            gameState.resourceEconomy.resourceEfficiency = assertFinite(Math.min(
              0.95,
              gameState.resourceEconomy.resourceEfficiency + value * 0.01
            ), {
        location: 'applyRegionalEffects:resourceConservation',
        valueName: 'resourceEfficiency',
        month: gameState.currentMonth
      });
          }
          break;

        case 'plasticRecycling':
          // ROOT CAUSE FIX (Oct 27, 2025): Bug #14 - Map to novel_entities boundary
          // Chemical recycling - infinite plastic recyclability reduces novel entities burden
          if (gameState.planetaryBoundariesSystem?.boundaries?.novel_entities) {
            const boundary = gameState.planetaryBoundariesSystem.boundaries.novel_entities;
            boundary.currentValue = Math.max(
              0,
              boundary.currentValue - value * 0.015
            );
            // Increase recycling rate
            gameState.resourceEconomy.plasticRecyclingRate = assertFinite(Math.min(
              0.95,
              gameState.resourceEconomy.plasticRecyclingRate + value * 0.01
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
            gameState.resourceEconomy.rareEarthRecoveryRate = assertFinite(Math.min(
              0.80,
              gameState.resourceEconomy.rareEarthRecoveryRate + value * 0.01
            ), {
        location: 'applyRegionalEffects:rareEarthRecovery',
        valueName: 'rareEarthRecoveryRate',
        month: gameState.currentMonth
      });
            // Reduce mining demand
            gameState.resourceEconomy.miningIntensity = assertFinite(Math.max(
              0.2,
              gameState.resourceEconomy.miningIntensity - value * 0.005
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
            gameState.resourceEconomy.miningIntensity = assertFinite(Math.max(
              0.05,
              gameState.resourceEconomy.miningIntensity * (1 - value)
            ), {
        location: 'applyRegionalEffects:terrestrialMiningReduction',
        valueName: 'miningIntensity',
        month: gameState.currentMonth
      });
            // Flag space economy active
            gameState.globalMetrics.spaceIndustrializationActive = true;
          }
          break;

        case 'supplyChainResilience':
          // Improve supply chain resilience
          if (gameState.resourceEconomy) {
            gameState.resourceEconomy.supplyChainResilience = assertFinite(Math.min(
              1.0,
              gameState.resourceEconomy.supplyChainResilience + value * 0.01
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
            gameState.resourceEconomy.industrialEmissions = assertFinite(Math.max(
              0.1,
              gameState.resourceEconomy.industrialEmissions * (1 - value * 0.01)
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
            gameState.resourceEconomy.transportEmissions = assertFinite(Math.max(
              0.1,
              gameState.resourceEconomy.transportEmissions * (1 - value * 0.01)
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
            gameState.resourceEconomy.miningIntensity = assertFinite(Math.max(
              0.2,
              gameState.resourceEconomy.miningIntensity * (1 - value * 0.01)
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
          // ROOT CAUSE FIX (Oct 27, 2025): Bug #11 - Map to biosphere_integrity boundary
          // Pollinator populations (bees, butterflies, etc.) are part of biodiversity
          // They directly affect the biosphere integrity planetary boundary
          // Increasing pollinator health IMPROVES biosphere integrity (reduces currentValue toward safe zone)
          if (gameState.planetaryBoundariesSystem?.boundaries?.biosphere_integrity) {
            const boundary = gameState.planetaryBoundariesSystem.boundaries.biosphere_integrity;
            boundary.currentValue = Math.max(
              0,
              boundary.currentValue - value * 0.01  // Reduce pressure on boundary (improve health)
            );
          }
          break;
          
        case 'invasiveSpeciesReduction':
          // ROOT CAUSE FIX (Oct 27, 2025): Bug #16 - Map to biosphere_integrity improvement
          // Invasive species = species that harm native biodiversity
          // Invasive species reduction = improving biosphere integrity (biodiversity recovery)
          // Gene drives + precision targeting reduce invasive species → improves biosphere boundary
          if (gameState.planetaryBoundariesSystem?.boundaries?.biosphere_integrity) {
            const boundary = gameState.planetaryBoundariesSystem.boundaries.biosphere_integrity;
            boundary.currentValue = assertFinite(Math.max(
              0,
              boundary.currentValue - value * 0.01  // Reduce boundary stress (lower = better)
            ), {
              location: 'applyRegionalEffects:invasiveSpeciesReduction',
              valueName: 'biosphere_integrity.currentValue',
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
            gameState.resourceEconomy.animalAgricultureShare = assertFinite(Math.max(
              0.1,
              gameState.resourceEconomy.animalAgricultureShare * (1 - value * 0.01)
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
          // ROOT CAUSE FIX (Oct 27, 2025): Field now properly initialized in GlobalMetrics
          if (gameState.globalMetrics) {
            gameState.globalMetrics.catastrophicRisk = assertFinite(Math.max(
              0,
              gameState.globalMetrics.catastrophicRisk * (1 - value)
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
          // ROOT CAUSE FIX (Oct 27, 2025): Field now properly initialized in GlobalMetrics
          if (gameState.globalMetrics) {
            gameState.globalMetrics.recursiveSafety = true;

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

            // Reduce catastrophic risk from recursive self-improvement
            // ROOT CAUSE FIX (Oct 27, 2025): Field now properly initialized in GlobalMetrics
            gameState.globalMetrics.catastrophicRiskFromRecursion = assertFinite(Math.max(
              0,
              gameState.globalMetrics.catastrophicRiskFromRecursion * (1 - value * 0.8)
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
            // FIX: Phase 2, Batch 1 (Oct 25, 2025) - Fail loudly if property missing
            const current = assertStateProperty(
              gameState.defensiveAI.cyberDefense,
              'strength',
              { location: 'applyRegionalEffects.cyberDefenseBonus', month: gameState.currentMonth }
            );
            gameState.defensiveAI.cyberDefense.strength = Math.min(1.0, current + value);
          }
          break;
          
        // ========== RISKY EFFECTS (Geoengineering, etc) ==========
        case 'riskMonsoonsDisrupt':
          // Risk of disrupting monsoons (geoengineering side effect)
          // ROOT CAUSE FIX (Oct 27, 2025): Field now properly initialized in EnvironmentalAccumulation
          // Research: Robock et al. (2008) - SAI could reduce Asian monsoon precipitation by 20%
          if (gameState.environmentalAccumulation) {
            gameState.environmentalAccumulation.monsoonDisruptionRisk = assertFinite(
              gameState.environmentalAccumulation.monsoonDisruptionRisk + value,
              {
                location: 'applyRegionalEffects:riskMonsoonsDisrupt',
                valueName: 'monsoonDisruptionRisk',
                month: gameState.currentMonth
              }
            );
          }
          break;

        case 'riskOzoneDepletion':
          // Risk of ozone depletion (aerosol side effect)
          // ROOT CAUSE FIX (Oct 27, 2025): Field now properly initialized in EnvironmentalAccumulation
          // Research: Tilmes et al. (2013) - SAI increases polar ozone depletion risk
          if (gameState.environmentalAccumulation) {
            gameState.environmentalAccumulation.ozoneDepletionRisk = assertFinite(
              gameState.environmentalAccumulation.ozoneDepletionRisk + value,
              {
                location: 'applyRegionalEffects:riskOzoneDepletion',
                valueName: 'ozoneDepletionRisk',
                month: gameState.currentMonth
              }
            );
          }
          break;
          
        case 'riskDeadZones':
          // Risk of creating ocean dead zones (upwelling side effect)
          // ROOT CAUSE FIX (Oct 27, 2025): Field now properly initialized in OceanAcidificationSystem
          // Research: Oschlies et al. (2010) - Artificial upwelling can create hypoxic zones
          if (gameState.oceanAcidificationSystem) {
            gameState.oceanAcidificationSystem.deadZoneRisk = assertFinite(
              gameState.oceanAcidificationSystem.deadZoneRisk + value,
              {
                location: 'applyRegionalEffects:riskDeadZones',
                valueName: 'deadZoneRisk',
                month: gameState.currentMonth
              }
            );
          }
          break;
          
        case 'existentialRisk':
          // General existential risk increase (nanotech, brain upload, etc.)
          // ROOT CAUSE FIX (Oct 27, 2025): Field now properly initialized in GlobalMetrics
          if (gameState.globalMetrics) {
            gameState.globalMetrics.existentialRisk = assertFinite(
              gameState.globalMetrics.existentialRisk + value,
              {
                location: 'applyRegionalEffects:existentialRisk',
                valueName: 'existentialRisk',
                month: gameState.currentMonth
              }
            );
          }
          break;
          
        case 'fusionEnabling':
          // Fusion prerequisite techs (materials, plasma control) accelerate fusion research
          // This is tracked cumulatively - two prerequisite techs give max benefit
          // ROOT CAUSE FIX (Oct 27, 2025): Fields now properly initialized in GlobalMetrics
          if (gameState.globalMetrics) {
            gameState.globalMetrics.fusionEnabling += value;

            // Track cumulative fusion enabling progress (max 1.0 from two prerequisite techs)
            const fusionProgress = assertFinite(Math.min(1.0, gameState.globalMetrics.fusionEnabling), {
              location: 'applyRegionalEffects:fusionEnabling',
              valueName: 'fusionProgress',
              month: gameState.currentMonth
            });

            // Store fusion research and deployment bonuses that will be applied by government/research phases
            gameState.globalMetrics.fusionResearchBonus = assertFinite(fusionProgress * 2.0, {
              location: 'applyRegionalEffects:fusionEnabling',
              valueName: 'fusionResearchBonus',
              month: gameState.currentMonth
            });
            gameState.globalMetrics.fusionDeploymentCostReduction = assertFinite(fusionProgress * 0.4, {
              location: 'applyRegionalEffects:fusionEnabling',
              valueName: 'fusionDeploymentCostReduction',
              month: gameState.currentMonth
            });
            gameState.globalMetrics.fusionDeploymentTimeReduction = assertFinite(fusionProgress * 0.3, {
              location: 'applyRegionalEffects:fusionEnabling',
              valueName: 'fusionDeploymentTimeReduction',
              month: gameState.currentMonth
            });
          }
          break;

        // ========== CATASTROPHIC TECH FAILURES → MORTALITY INTEGRATION ==========
        // FIX: CRITICAL issue #1 from architecture review (Oct 28, 2025)
        // Tech tree catastrophic failures now route to Bayesian mortality system

        case 'geoengDisasterRisk':
          // Geoengineering catastrophe: monsoon disruption → crop failure → famine
          // Research: Robock et al. (2008) - SAI could reduce Asian monsoon precip by 20%
          // This effect triggers MONTHLY mortality risk during deployment
          if (value > 0) {
            const { addMortalityRisk } = require('../bayesianMortality');

            // Risk scales with deployment level (value represents monthly risk)
            // Only add risk if significant (>0.001 = 0.1% monthly death rate)
            const monthlyRisk = assertFinite(value * 0.01, {  // Scale: 1.0 effect = 1% monthly risk
              location: 'applyGlobalEffects:geoengDisasterRisk',
              valueName: 'monthlyRisk',
              month: gameState.currentMonth,
              additionalInfo: { effectValue: value }
            });

            if (monthlyRisk > 0.001) {
              addMortalityRisk(gameState.humanPopulationSystem, {
                type: 'famine',
                baseRisk: monthlyRisk,
                proximate: 'famine',
                root: 'climate',
                confidence: 'MEDIUM',  // Geoeng effects uncertain
                scope: 'REGIONAL',
                region: 'South Asia',  // Monsoon-dependent regions most affected
                exposedFraction: 0.25,  // ~25% of global population in monsoon regions
                month: gameState.currentMonth,
                description: `🌍 Geoengineering disaster: monsoon disruption from stratospheric aerosols`
              });

              console.log(`  🌍❌ Geoengineering disaster mortality: ${(monthlyRisk * 100).toFixed(3)}% base risk (South Asia monsoon disruption)`);
            }
          }
          break;

        case 'bioweaponRisk':
          // Bioweapon deployment or accidental release → pandemic
          // Research: Esvelt (2022) - engineered pathogens could cause 10-50% mortality
          if (value > 0) {
            const { addMortalityRisk } = require('../bayesianMortality');

            const monthlyRisk = assertFinite(value * 0.02, {  // Higher multiplier - bioweapons very lethal
              location: 'applyGlobalEffects:bioweaponRisk',
              valueName: 'monthlyRisk',
              month: gameState.currentMonth,
              additionalInfo: { effectValue: value }
            });

            if (monthlyRisk > 0.001) {
              addMortalityRisk(gameState.humanPopulationSystem, {
                type: 'disease',
                baseRisk: monthlyRisk,
                proximate: 'disease',
                root: 'alignment',  // AI-designed bioweapons
                confidence: 'MEDIUM',
                scope: 'GLOBAL',  // Pathogens spread globally
                month: gameState.currentMonth,
                description: `🦠 Bioweapon pandemic: engineered pathogen release`
              });

              console.log(`  🦠❌ Bioweapon pandemic mortality: ${(monthlyRisk * 100).toFixed(3)}% base risk (global)`);
            }
          }
          break;

        case 'geneDriveFailureRisk':
          // Gene drive escape → ecosystem collapse → famine
          // Research: Esvelt (2014) - gene drives can spread uncontrollably
          if (value > 0) {
            const { addMortalityRisk } = require('../bayesianMortality');

            const monthlyRisk = assertFinite(value * 0.005, {  // Lower than bioweapons, slower cascade
              location: 'applyGlobalEffects:geneDriveFailureRisk',
              valueName: 'monthlyRisk',
              month: gameState.currentMonth,
              additionalInfo: { effectValue: value }
            });

            if (monthlyRisk > 0.001) {
              addMortalityRisk(gameState.humanPopulationSystem, {
                type: 'ecosystem',
                baseRisk: monthlyRisk,
                proximate: 'ecosystem',
                root: 'ecosystem',  // Ecosystem collapse
                confidence: 'LOW',  // Uncertain cascade effects
                scope: 'SEMI-GLOBAL',  // Regional ecosystems collapse
                exposedFraction: 0.40,  // 40% depend on affected ecosystems
                month: gameState.currentMonth,
                description: `🧬❌ Gene drive failure: uncontrolled ecosystem disruption`
              });

              console.log(`  🧬❌ Gene drive failure mortality: ${(monthlyRisk * 100).toFixed(3)}% base risk (ecosystem cascade)`);
            }
          }
          break;

        case 'nuclearAccidentRisk':
          // Nuclear reactor/weapon accident → radiation deaths
          // Research: Chernobyl (1986) - ~4000 long-term deaths, Fukushima (2011) minimal
          if (value > 0) {
            const { addMortalityRisk } = require('../bayesianMortality');

            const monthlyRisk = assertFinite(value * 0.001, {  // Lower rate - accidents localized
              location: 'applyGlobalEffects:nuclearAccidentRisk',
              valueName: 'monthlyRisk',
              month: gameState.currentMonth,
              additionalInfo: { effectValue: value }
            });

            if (monthlyRisk > 0.0005) {  // Lower threshold for nuclear
              addMortalityRisk(gameState.humanPopulationSystem, {
                type: 'disaster',
                baseRisk: monthlyRisk,
                proximate: 'disasters',
                root: 'natural',  // Accident, not intentional
                confidence: 'HIGH',  // Well-studied (Chernobyl, Fukushima)
                scope: 'REGIONAL',
                region: 'accident site',
                exposedFraction: 0.01,  // 1% local population affected
                month: gameState.currentMonth,
                description: `☢️❌ Nuclear accident: reactor meltdown or weapon mishap`
              });

              console.log(`  ☢️❌ Nuclear accident mortality: ${(monthlyRisk * 100).toFixed(4)}% base risk (localized)`);
            }
          }
          break;

        case 'nanoDisasterRisk':
          // Nanotechnology runaway (grey goo) → catastrophic deaths
          // Research: Drexler (1986), Freitas (2000) - speculative but existential
          if (value > 0) {
            const { addMortalityRisk } = require('../bayesianMortality');

            const monthlyRisk = assertFinite(value * 0.10, {  // Extremely high if triggered
              location: 'applyGlobalEffects:nanoDisasterRisk',
              valueName: 'monthlyRisk',
              month: gameState.currentMonth,
              additionalInfo: { effectValue: value }
            });

            if (monthlyRisk > 0.001) {
              addMortalityRisk(gameState.humanPopulationSystem, {
                type: 'disaster',
                baseRisk: monthlyRisk,
                proximate: 'other',  // Novel failure mode
                root: 'alignment',  // AI-designed nanotech
                confidence: 'LOW',  // Speculative scenario
                scope: 'GLOBAL',  // Self-replicating = global spread
                month: gameState.currentMonth,
                description: `⚛️❌ Nanotechnology disaster: uncontrolled replication (grey goo)`
              });

              console.log(`  ⚛️❌ Nanotechnology disaster mortality: ${(monthlyRisk * 100).toFixed(2)}% base risk (GLOBAL)`);
            }
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


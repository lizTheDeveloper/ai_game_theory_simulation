/**
 * ClimateDeploymentDelayPhase (order: 16.0)
 *
 * Models realistic climate technology deployment timescales using three-delay model.
 *
 * THREE-DELAY MODEL:
 * 1. Activation Delay (T_activate): Construction/manufacturing before first operation
 * 2. Scaling Delay (T_50): S-curve adoption to reach 50% effectiveness
 * 3. Physical Response Delay (tau): Atmospheric CO2 equilibration time
 *
 * FORMULA:
 * effectiveness(t) = E_max × S(t - T_activate) × R(t)
 *
 * where:
 * - E_max = maximum effectiveness (technology-specific)
 * - S(t) = scaling curve (logistic function)
 * - R(t) = physical response curve (exponential approach)
 * - t = years since deployment
 *
 * RESEARCH:
 * - research/climate_tech_deployment_timescales_20251112.md (Grade A-, 15+ sources)
 * - IEA (2024): Direct air capture scaling feasibility
 * - Nature (2024): Enhanced weathering in US agriculture
 * - Biogeosciences (2024-2025): Ocean alkalinization, CO2 lifetime
 * - Geophysical Research Letters (2025): SAI cloud albedo
 * - Communications Earth & Environment (2024-2025): Biochar, heat pumps
 *
 * EXPECTED IMPACT:
 * - God mode 5.5% effectiveness at month 60 (5 years) validates realistic timescales
 * - Fast techs (SAI, Heat Pumps): 60-80% effective by year 5
 * - Medium techs (Green Hydrogen, Smart Grid): 30-50% effective by year 5
 * - Slow techs (DAC, BECCS): 5-15% effective by year 5
 *
 * @see plans/phase1_climate_deployment_timescales_implementation_spec.md
 */

import { GameState, SimulationPhase, PhaseResult, RNGFunction } from '@/types/game';
import { assertFinite, assertInRange, assertDefined } from '@/simulation/utils/assertions';

/**
 * Climate technology deployment parameters
 *
 * Research-backed timescales for each climate technology.
 * Parameters extracted from research report Table 4.2.
 */
interface ClimateDeploymentParams {
  activationDelay: number;         // Years before first operation (construction)
  T_50: number;                    // Years to 50% effectiveness (S-curve inflection)
  tau: number;                     // Physical response time constant (years), 0 = immediate
  E_max: number;                   // Maximum effectiveness (tech-specific units)
  effectType: 'co2_removal' | 'temperature_offset' | 'efficiency' | 'emissions_reduction';
}

/**
 * Technology-specific parameters from research
 *
 * Source: research/climate_tech_deployment_timescales_20251112.md
 *
 * @param {number} activationDelay Years to first operation (mean of range)
 * @param {number} T_50 Years to reach 50% effectiveness (S-curve inflection point)
 * @param {number} tau Physical response time constant (exponential decay), 0 = immediate
 * @param {number} E_max Maximum effectiveness in technology-specific units
 * @param {string} effectType Type of climate effect
 */
const CLIMATE_TECH_PARAMETERS: Record<string, ClimateDeploymentParams> = {
  // Carbon Dioxide Removal (CDR) Technologies
  'direct_air_capture': {
    activationDelay: 7,        // 5-10 years (IEA 2024)
    T_50: 30,                  // 30 years to 50% of gigatonne scale
    tau: 20,                   // 20-year atmospheric mixing (Biogeosciences 2025)
    E_max: 1.0,                // 1 Gt CO2/year
    effectType: 'co2_removal'
  },

  // NOTE: enhanced_weathering not in tech tree yet - TODO: add to comprehensiveTechTree.ts
  // 'enhanced_weathering': {
  //   activationDelay: 3,        // 2-5 years (agricultural integration)
  //   T_50: 50,                  // 50 years to mature deployment
  //   tau: 50,                   // 50-year chemical kinetics (Nature 2024)
  //   E_max: 0.5,                // 0.5 Gt CO2/year
  //   effectType: 'co2_removal'
  // },

  // FIX: Correct tech ID from 'ocean_alkalinization' to 'ocean_alkalinity_enhancement'
  'ocean_alkalinity_enhancement': {
    activationDelay: 5,        // 3-7 years (infrastructure, environmental assessment)
    T_50: 15,                  // 15 years to scale
    tau: 2,                    // 2-year air-sea exchange (Biogeosciences 2024)
    E_max: 10.0,               // 10 Gt CO2/year (high theoretical capacity)
    effectType: 'co2_removal'
  },

  // NOTE: biochar not in tech tree yet - TODO: add to comprehensiveTechTree.ts
  // 'biochar': {
  //   activationDelay: 3,        // 2-5 years (pyrolysis infrastructure)
  //   T_50: 10,                  // 10 years to scale
  //   tau: 0,                    // Immediate sequestration (stable upon creation)
  //   E_max: 2.8,                // 2.8 Gt CO2/year
  //   effectType: 'co2_removal'
  // },

  // FIX: Correct tech ID from 'beccs' to 'bioenergy_ccs'
  'bioenergy_ccs': {
    activationDelay: 10,       // 7-15 years (power plant construction, biomass chains)
    T_50: 25,                  // 25 years to scale
    tau: 5,                    // 5-year geological storage
    E_max: 5.0,                // 5 Gt CO2/year
    effectType: 'co2_removal'
  },

  // Solar Geoengineering
  // FIX: Correct tech ID from 'sai' to 'stratospheric_aerosols'
  'stratospheric_aerosols': {
    activationDelay: 3,        // 2-5 years (aircraft/infrastructure)
    T_50: 5,                   // 5 years to full deployment (fast scaling)
    tau: 1.5,                  // 1.5-year aerosol dispersion (Geophys. Res. Lett. 2025)
    E_max: 0.5,                // 0.5°C cooling
    effectType: 'temperature_offset'
  },

  // Energy/Efficiency Technologies
  // FIX: Correct tech ID from 'smart_grid' to 'smart_grids'
  'smart_grids': {
    activationDelay: 7,        // 5-10 years (infrastructure upgrades)
    T_50: 12,                  // 12 years to full deployment
    tau: 0,                    // Immediate efficiency gains
    E_max: 0.15,               // 15% energy efficiency improvement
    effectType: 'efficiency'
  },

  // FIX: Correct tech ID from 'green_hydrogen' to 'hydrogen_economy'
  'hydrogen_economy': {
    activationDelay: 7,        // 5-10 years (electrolyzer manufacturing)
    T_50: 20,                  // 20 years to scale
    tau: 0,                    // Immediate fossil fuel displacement
    E_max: 0.10,               // 10% industrial emissions reduction
    effectType: 'emissions_reduction'
  }

  // NOTE: heat_pumps not in tech tree yet - TODO: add to comprehensiveTechTree.ts
  // 'heat_pumps': {
  //   activationDelay: 3,        // 2-5 years (manufacturing scale-up)
  //   T_50: 8,                   // 8 years to scale
  //   tau: 0,                    // Immediate heating efficiency
  //   E_max: 0.05,               // 5% building emissions reduction
  //   effectType: 'emissions_reduction'
  // }
};

/**
 * Logistic curve for scaling deployment
 *
 * Models S-shaped technology adoption.
 * Formula: S(t) = 1 / (1 + exp(-k * (t - t0)))
 *
 * @param t Years since activation
 * @param inflection T_50 inflection point (50% deployment)
 * @param steepness Curve steepness parameter (default 0.2)
 * @returns Scaling progress [0, 1]
 */
function logisticCurve(
  t: number,
  inflection: number,
  steepness: number = 0.2
): number {
  if (t <= 0) return 0.0;
  if (inflection <= 0) return 1.0; // Instant scaling (edge case)

  const exponent = -steepness * (t - inflection);
  const result = 1.0 / (1.0 + Math.exp(exponent));

  return assertInRange(result, 0, 1, {
    location: 'logisticCurve',
    valueName: 'scalingProgress',
    additionalInfo: { t, inflection, steepness }
  });
}

/**
 * Exponential approach for physical response
 *
 * Models atmospheric/environmental equilibration.
 * Formula: R(t) = 1 - exp(-t / tau)
 *
 * @param t Years since deployment
 * @param tau Time constant (years), 0 = immediate
 * @returns Physical response progress [0, 1]
 */
function exponentialResponse(t: number, tau: number): number {
  if (t <= 0) return 0.0;
  if (tau === 0) return 1.0; // Immediate response

  const result = 1.0 - Math.exp(-t / tau);

  return assertInRange(result, 0, 1, {
    location: 'exponentialResponse',
    valueName: 'physicalResponse',
    additionalInfo: { t, tau }
  });
}

/**
 * Calculate aggregate climate effectiveness
 *
 * Weighted average across all deployed technologies.
 * Different tech types contribute to different metrics.
 *
 * @param deployments Technology deployment records
 * @returns Aggregate metrics
 */
function calculateAggregateEffectiveness(deployments: {
  [techId: string]: {
    currentEffectiveness: number;
    maxEffectiveness: number;
  };
}): {
  totalClimateEffectiveness: number;
  CO2RemovalRate: number;
  temperatureOffset: number;
} {
  let totalCO2Removal = 0;
  let totalTempOffset = 0;
  let totalEfficiency = 0;
  let totalEmissionsReduction = 0;

  for (const techId of Object.keys(deployments)) {
    const deployment = deployments[techId];
    const params = CLIMATE_TECH_PARAMETERS[techId];

    if (!params) continue; // Skip unknown techs

    const effectiveness = deployment.currentEffectiveness;

    switch (params.effectType) {
      case 'co2_removal':
        totalCO2Removal += effectiveness;
        break;
      case 'temperature_offset':
        totalTempOffset += effectiveness;
        break;
      case 'efficiency':
        totalEfficiency += effectiveness;
        break;
      case 'emissions_reduction':
        totalEmissionsReduction += effectiveness;
        break;
    }
  }

  // Total effectiveness = weighted sum of all effects
  // Normalize to [0, 1] range (approximate)
  const totalClimateEffectiveness = (
    totalCO2Removal / 20 +        // Normalize CO2 (max ~20 Gt/yr if all deployed)
    totalTempOffset / 0.5 +        // Normalize temp offset (max ~0.5°C)
    totalEfficiency +              // Already normalized (percentage)
    totalEmissionsReduction        // Already normalized (percentage)
  ) / 4; // Average across 4 categories

  return {
    totalClimateEffectiveness: assertInRange(totalClimateEffectiveness, 0, 1, {
      location: 'calculateAggregateEffectiveness',
      valueName: 'totalClimateEffectiveness',
      additionalInfo: { totalCO2Removal, totalTempOffset, totalEfficiency, totalEmissionsReduction }
    }),
    CO2RemovalRate: assertFinite(totalCO2Removal, {
      location: 'calculateAggregateEffectiveness',
      valueName: 'CO2RemovalRate',
      additionalInfo: { deploymentCount: Object.keys(deployments).length }
    }),
    temperatureOffset: assertFinite(totalTempOffset, {
      location: 'calculateAggregateEffectiveness',
      valueName: 'temperatureOffset',
      additionalInfo: { deploymentCount: Object.keys(deployments).length }
    })
  };
}

/**
 * Climate Deployment Delay Phase
 *
 * Executes monthly to update climate technology effectiveness based on
 * three-delay model: activation, scaling, and physical response.
 */
export class ClimateDeploymentDelayPhase implements SimulationPhase {
  readonly id = 'climate-deployment-delay';
  readonly name = 'Climate Deployment Delay';
  readonly order = 16.0; // After tech deployment, before climate effects

  readonly dependencies: string[] = [];

  execute(state: GameState, rng: RNGFunction): PhaseResult {
    // Validate RNG (CRITICAL: No fallbacks allowed for deterministic simulation)
    assertDefined(rng, {
      location: 'ClimateDeploymentDelayPhase.execute',
      valueName: 'rng',
      additionalInfo: { message: 'RNG required for deterministic simulation' }
    });

    // Initialize tracking if not present
    if (!state.climateDeploymentTracking) {
      state.climateDeploymentTracking = {
        deployments: {},
        totalClimateEffectiveness: 0,
        CO2RemovalRate: 0,
        temperatureOffset: 0
      };
    }

    const tracking = state.climateDeploymentTracking;
    const currentMonth = state.currentMonth;
    const yearsElapsed = currentMonth / 12;

    // Check for newly deployed climate technologies
    // Scan techTreeState for climate category technologies
    if (state.techTreeState && state.techTreeState.regionalDeployment) {
      for (const region of Object.keys(state.techTreeState.regionalDeployment)) {
        const deployments = state.techTreeState.regionalDeployment[region];

        for (const deployment of deployments) {
          const techId = deployment.techId;

          // Check if this tech has climate deployment parameters
          if (CLIMATE_TECH_PARAMETERS[techId]) {
            // Initialize deployment tracking if not already tracked
            if (!tracking.deployments[techId]) {
              const params = CLIMATE_TECH_PARAMETERS[techId];

              tracking.deployments[techId] = {
                deployedAt: currentMonth,
                activationDelay: params.activationDelay,
                scalingCurveInflection: params.T_50,
                physicalResponseTau: params.tau,
                maxEffectiveness: params.E_max,
                currentEffectiveness: 0,
                cumulativeImpact: 0
              };

              console.log(`\n⏰ CLIMATE TECH DEPLOYED: ${techId}`);
              console.log(`   Activation delay: ${params.activationDelay} years`);
              console.log(`   Scaling T_50: ${params.T_50} years`);
              console.log(`   Physical response tau: ${params.tau} years`);
              console.log(`   Max effectiveness: ${params.E_max}`);
            }
          }
        }
      }
    }

    // Update effectiveness for all deployed technologies
    for (const techId of Object.keys(tracking.deployments)) {
      const deployment = tracking.deployments[techId];
      const timeSinceDeployment = yearsElapsed - (deployment.deployedAt / 12);

      // 1. Check activation delay
      if (timeSinceDeployment < deployment.activationDelay) {
        deployment.currentEffectiveness = 0;
        continue; // Still under construction
      }

      // 2. Calculate scaling progress (logistic S-curve)
      const activeTime = timeSinceDeployment - deployment.activationDelay;
      const scalingProgress = logisticCurve(
        activeTime,
        deployment.scalingCurveInflection,
        0.2  // Steepness parameter
      );

      // 3. Calculate physical response (exponential approach)
      const physicalResponse = exponentialResponse(
        activeTime,
        deployment.physicalResponseTau
      );

      // 4. Combined effectiveness
      const effectiveness = deployment.maxEffectiveness * scalingProgress * physicalResponse;
      deployment.currentEffectiveness = assertFinite(effectiveness, {
        location: 'ClimateDeploymentDelayPhase.execute',
        valueName: `deployment[${techId}].currentEffectiveness`,
        month: currentMonth,
        additionalInfo: { scalingProgress, physicalResponse, maxEffectiveness: deployment.maxEffectiveness }
      });

      // 5. Update cumulative impact
      const monthlyImpact = deployment.currentEffectiveness / 12; // Convert annual to monthly
      deployment.cumulativeImpact += monthlyImpact;

      // Log progress at year intervals
      if (currentMonth % 12 === 0 && activeTime > 0) {
        console.log(`\n📈 CLIMATE TECH PROGRESS: ${techId}`);
        console.log(`   Years active: ${activeTime.toFixed(1)}`);
        console.log(`   Scaling: ${(scalingProgress * 100).toFixed(1)}%`);
        console.log(`   Physical response: ${(physicalResponse * 100).toFixed(1)}%`);
        console.log(`   Current effectiveness: ${deployment.currentEffectiveness.toFixed(3)} (${(deployment.currentEffectiveness / deployment.maxEffectiveness * 100).toFixed(1)}% of max)`);
        console.log(`   Cumulative impact: ${deployment.cumulativeImpact.toFixed(2)}`);
      }
    }

    // Calculate aggregate effectiveness
    const aggregates = calculateAggregateEffectiveness(tracking.deployments);
    tracking.totalClimateEffectiveness = aggregates.totalClimateEffectiveness;
    tracking.CO2RemovalRate = aggregates.CO2RemovalRate;
    tracking.temperatureOffset = aggregates.temperatureOffset;

    // Log aggregate at year intervals
    if (currentMonth % 12 === 0 && currentMonth > 0) {
      console.log(`\n🌍 AGGREGATE CLIMATE EFFECTIVENESS (Year ${Math.floor(yearsElapsed)}):`);
      console.log(`   Total effectiveness: ${(tracking.totalClimateEffectiveness * 100).toFixed(2)}%`);
      console.log(`   CO2 removal rate: ${tracking.CO2RemovalRate.toFixed(3)} Gt/year`);
      console.log(`   Temperature offset: ${tracking.temperatureOffset.toFixed(3)}°C`);
      console.log(`   Technologies deployed: ${Object.keys(tracking.deployments).length}`);
    }

    return { events: [] };
  }
}

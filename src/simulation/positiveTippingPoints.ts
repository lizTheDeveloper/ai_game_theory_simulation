/**
 * Positive Tipping Point Cascades - Core Mechanics
 *
 * Research Foundation:
 * - OECD (2025): "Triggering positive tipping points for climate action" (TRL 6-8)
 * - Earth System Dynamics (2024): "Positive cross-system cascades" (TRL 6-7)
 * - Nature Sustainability (2023): "Tipping points in renewable energy" (TRL 8-9)
 *
 * Implements:
 * 1. S-curve adoption dynamics (Bass diffusion model)
 * 2. Cascade triggering logic (threshold crossing → exponential growth)
 * 3. Learning curve feedback (Wright's Law: 2x production → 20-30% cost reduction)
 * 4. Cross-technology synergies (EV + grid batteries → shared learning)
 * 5. Social contagion effects (early adopters → social proof)
 */

import type { GameState, RNGFunction } from '../types/game';
import type {
  PositiveTippingPointsState,
  TechnologyAdoption,
  CascadeTechnologyType,
  CascadePolicyType,
  PositiveTippingEvent,
  TechnologySynergy
} from '../types/positiveTippingPoints';

/**
 * Initialize positive tipping points system
 * Research: OECD (2025) - baseline adoption rates circa 2025
 */
export function initializePositiveTippingPoints(): PositiveTippingPointsState {
  // Research-backed baseline costs (OECD 2025, NREL)
  // Normalized to 1.0 = cost parity with fossil fuel alternative
  const solarCostVsFossil = 0.85;      // Solar PV achieved price parity 2020-2023
  const evCostVsICE = 1.15;            // EVs approaching parity (2023-2025)
  const windCostVsFossil = 0.80;       // Wind competitive since ~2015
  const heatPumpCostVsGas = 1.20;      // Heat pumps more expensive upfront (2023)
  const batteryCostPeak = 0.90;        // Batteries declining rapidly (learning curve active)

  // Baseline market shares (circa 2025, OECD data)
  const solarMarketShare = 0.06;       // ~6% global electricity (2025)
  const evMarketShare = 0.03;          // ~3% global vehicle fleet (2025)
  const windMarketShare = 0.08;        // ~8% global electricity (2025)
  const heatPumpMarketShare = 0.02;    // ~2% heating systems (2025)
  const batteryStorageShare = 0.01;    // <1% grid storage (2025)

  return {
    adoptionTracking: {
      solarPV: createTechnologyAdoption(
        'solar-pv',
        solarMarketShare,
        0.003,                         // 0.3 percentage points/month baseline growth
        solarCostVsFossil,
        1.0,                           // Conventional fossil electricity cost (baseline)
        0.22,                          // 22% learning rate (NREL solar PV)
        0.7,                           // High visibility (rooftop panels visible)
        true                           // Price parity achieved
      ),
      electricVehicles: createTechnologyAdoption(
        'electric-vehicles',
        evMarketShare,
        0.002,                         // 0.2 pp/month baseline growth
        evCostVsICE,
        1.0,                           // Conventional ICE vehicle cost
        0.18,                          // 18% learning rate (NREL batteries)
        0.8,                           // Very high visibility (EVs on roads)
        false                          // Not yet at price parity
      ),
      windPower: createTechnologyAdoption(
        'wind-power',
        windMarketShare,
        0.002,                         // 0.2 pp/month baseline
        windCostVsFossil,
        1.0,                           // Conventional fossil electricity
        0.15,                          // 15% learning rate (mature tech)
        0.5,                           // Moderate visibility (wind farms visible but not urban)
        true                           // Price parity achieved
      ),
      heatPumps: createTechnologyAdoption(
        'heat-pumps',
        heatPumpMarketShare,
        0.001,                         // 0.1 pp/month baseline
        heatPumpCostVsGas,
        1.0,                           // Conventional gas heating
        0.20,                          // 20% learning rate
        0.2,                           // Low visibility (inside buildings)
        false                          // Not at price parity
      ),
      batteryStorage: createTechnologyAdoption(
        'battery-storage',
        batteryStorageShare,
        0.001,                         // 0.1 pp/month baseline
        batteryCostPeak,
        1.0,                           // Conventional grid infrastructure
        0.25,                          // 25% learning rate (rapid improvement)
        0.3,                           // Low visibility (utility-scale installations)
        false                          // Approaching parity
      ),
    },

    triggeredCascades: [],
    activeCascades: 0,
    synergies: [],

    activePolicies: [],

    cumulativeEmissionsReduction: 0,
    cumulativeCostSavings: 0,
    adoptionAcceleration: 1.0,         // 1.0 = business-as-usual baseline

    // Research parameters (OECD 2025, Nature Sustainability 2023)
    parameters: {
      cascadeThresholdMin: 0.05,       // 5% market share minimum (OECD 2025)
      cascadeThresholdMax: 0.20,       // 20% market share maximum
      cascadeMultiplierMin: 1.5,       // 1.5x growth acceleration minimum
      cascadeMultiplierMax: 2.4,       // 2.4x growth acceleration maximum
      cascadeDurationMin: 60,          // 5 years minimum duration
      cascadeDurationMax: 180,         // 15 years maximum duration
      learningRateMin: 0.20,           // 20% cost reduction per doubling (NREL)
      learningRateMax: 0.30,           // 30% cost reduction per doubling
      visibilityImpact: 0.3,           // 30% boost from high visibility
      earlyAdopterInfluence: 0.2,      // 20% adoption boost from social proof
    },
  };
}

/**
 * Helper: Create TechnologyAdoption object
 */
function createTechnologyAdoption(
  tech: CascadeTechnologyType,
  marketShare: number,
  baseAdoptionRate: number,
  costPerUnit: number,
  conventionalCost: number,
  learningRate: number,
  visibility: number,
  priceParityAchieved: boolean
): TechnologyAdoption {
  return {
    technology: tech,
    marketShare,
    adoptionRate: baseAdoptionRate,
    cascadeActive: false,
    cascadeStrength: 0,
    costPerUnit,
    cumulativeProduction: 1.0,         // Normalized baseline
    learningRate,
    conventionalAlternativeCost: conventionalCost,
    priceParityAchieved,
    supportingPolicies: [],
    policyStrength: 0,
    visibility,
    socialProofStrength: 0,
  };
}

/**
 * Update positive tipping point cascades
 * Called each simulation month
 */
export function updatePositiveTippingPoints(
  state: GameState,
  rng: RNGFunction
): void {
  const ptp = state.positiveTippingPoints;

  // Phase 1: Update learning curves (Wright's Law)
  updateLearningCurves(state);

  // Phase 2: Detect and trigger new cascades
  detectAndTriggerCascades(state, rng);

  // Phase 3: Apply cascade dynamics (exponential growth)
  applyCascadeDynamics(state, rng);

  // Phase 4: Update cross-technology synergies
  updateTechnologySynergies(state);

  // Phase 5: Calculate environmental impact
  calculateEnvironmentalImpact(state);

  // Phase 6: Update active cascade count
  ptp.activeCascades = Object.values(ptp.adoptionTracking).filter(
    tech => tech.cascadeActive
  ).length;
}

/**
 * Phase 1: Update learning curves (Wright's Law)
 * Research: NREL, Nature Sustainability (2023)
 * 2x cumulative production → 20-30% cost reduction
 */
function updateLearningCurves(state: GameState): void {
  const ptp = state.positiveTippingPoints;

  for (const tech of Object.values(ptp.adoptionTracking)) {
    // Production scales with market share (rough approximation)
    const monthlyProduction = tech.marketShare * 0.01; // 1% of market share = production volume
    tech.cumulativeProduction += monthlyProduction;

    // Wright's Law: Cost = InitialCost * (CumulativeProduction ^ -learningRate)
    // Simplified: Every doubling of production → learningRate cost reduction
    const doublings = Math.log2(tech.cumulativeProduction);
    const costReduction = 1 - Math.pow((1 - tech.learningRate), doublings);

    // Apply cost reduction (but don't go below 0.3x original cost - diminishing returns)
    const initialCost = 1.0; // Normalized baseline
    tech.costPerUnit = Math.max(0.3, initialCost * (1 - costReduction));

    // Update price parity status
    tech.priceParityAchieved = tech.costPerUnit <= tech.conventionalAlternativeCost;
  }
}

/**
 * Phase 2: Detect and trigger new cascades
 * Research: OECD (2025) - cascade thresholds 5-20% market share
 */
function detectAndTriggerCascades(state: GameState, rng: RNGFunction): void {
  const ptp = state.positiveTippingPoints;

  for (const tech of Object.values(ptp.adoptionTracking)) {
    // Skip if cascade already active or market saturated
    if (tech.cascadeActive || tech.marketShare > 0.80) {
      continue;
    }

    // Check threshold conditions
    const thresholdMet = tech.marketShare >= ptp.parameters.cascadeThresholdMin &&
                         tech.marketShare <= ptp.parameters.cascadeThresholdMax;

    if (!thresholdMet) {
      continue;
    }

    // Calculate cascade trigger probability (multiple factors)
    let triggerScore = 0;
    let triggerReason: PositiveTippingEvent['triggerReason'] = 'multi-factor';

    // Factor 1: Price parity (strongest trigger)
    if (tech.priceParityAchieved) {
      triggerScore += 0.4;
      triggerReason = 'price-parity';
    }

    // Factor 2: Policy support
    if (tech.policyStrength > 0.3) {
      triggerScore += 0.3;
      if (triggerScore < 0.4) triggerReason = 'policy-intervention';
    }

    // Factor 3: Social proof (market share above 15%)
    if (tech.marketShare > 0.15) {
      triggerScore += 0.2;
      if (triggerScore < 0.4) triggerReason = 'social-threshold';
    }

    // Factor 4: Visibility amplifies social proof
    const visibilityBonus = tech.visibility * tech.marketShare * 0.1;
    triggerScore += visibilityBonus;

    // Trigger cascade if score sufficient (stochastic with RNG)
    const triggerProbability = Math.min(0.95, triggerScore);
    if (rng() < triggerProbability) {
      // Trigger cascade!
      tech.cascadeActive = true;
      tech.cascadeTriggeredMonth = state.currentMonth;

      // Calculate cascade strength (0-1)
      tech.cascadeStrength = Math.min(1.0, triggerScore * 1.2);

      // Record cascade event
      const cascadeEvent: PositiveTippingEvent = {
        type: tech.technology,
        triggeredMonth: state.currentMonth,
        triggerReason,
        marketShareAtTrigger: tech.marketShare,
        costReductionSincePeak: 1.0 - tech.costPerUnit,
        policySupportAtTrigger: tech.policyStrength,
        expectedDuration: Math.floor(
          ptp.parameters.cascadeDurationMin +
          (ptp.parameters.cascadeDurationMax - ptp.parameters.cascadeDurationMin) * (1 - tech.cascadeStrength)
        ),
        expectedPeakGrowthRate: tech.adoptionRate * (1 + tech.cascadeStrength * 2.0),
        environmentalImpact: estimateEnvironmentalImpact(tech),
        economicImpact: estimateEconomicImpact(tech),
        socialImpact: tech.visibility * tech.cascadeStrength,
      };

      ptp.triggeredCascades.push(cascadeEvent);

      console.log(`  Positive Cascade Triggered: ${tech.technology}`);
      console.log(`    Reason: ${triggerReason}`);
      console.log(`    Market share: ${(tech.marketShare * 100).toFixed(1)}%`);
      console.log(`    Cascade strength: ${(tech.cascadeStrength * 100).toFixed(0)}%`);
    }
  }
}

/**
 * Phase 3: Apply cascade dynamics (exponential growth)
 * Research: Nature Sustainability (2023) - S-curve adoption
 */
function applyCascadeDynamics(state: GameState, rng: RNGFunction): void {
  const ptp = state.positiveTippingPoints;

  for (const tech of Object.values(ptp.adoptionTracking)) {
    if (!tech.cascadeActive) {
      // No cascade - normal linear growth
      tech.marketShare += tech.adoptionRate;
      continue;
    }

    // Cascade active - exponential growth phase
    const cascadeMultiplier = 1 + (tech.cascadeStrength *
      (ptp.parameters.cascadeMultiplierMax - ptp.parameters.cascadeMultiplierMin));

    // Apply cascaded adoption rate
    const cascadedRate = tech.adoptionRate * cascadeMultiplier;

    // S-curve dynamics: Growth slows as market saturates
    const saturationFactor = 1 - (tech.marketShare / 0.95); // Slow down near 95% saturation
    const adjustedRate = cascadedRate * saturationFactor;

    tech.marketShare += adjustedRate;

    // Social contagion boost (visibility amplifies adoption)
    const socialBoost = tech.visibility * tech.marketShare * ptp.parameters.earlyAdopterInfluence * 0.01;
    tech.marketShare += socialBoost;
    tech.socialProofStrength = tech.visibility * tech.marketShare;

    // Cap market share at 1.0
    tech.marketShare = Math.min(1.0, tech.marketShare);

    // End cascade if saturated or duration exceeded
    if (tech.marketShare > 0.85 ||
        (tech.cascadeTriggeredMonth &&
         state.currentMonth - tech.cascadeTriggeredMonth > ptp.parameters.cascadeDurationMax)) {
      tech.cascadeActive = false;
      tech.cascadeStrength = 0;

      console.log(`  Cascade Completed: ${tech.technology}`);
      console.log(`    Final market share: ${(tech.marketShare * 100).toFixed(1)}%`);
    }
  }
}

/**
 * Phase 4: Update cross-technology synergies
 * Research: Earth System Dynamics (2024) - circular economy loops
 * Example: EV batteries + grid batteries → shared learning curve
 */
function updateTechnologySynergies(state: GameState): void {
  const ptp = state.positiveTippingPoints;

  // Synergy 1: EV batteries + Grid batteries → Shared manufacturing learning
  const evAdoption = ptp.adoptionTracking.electricVehicles;
  const batteryAdoption = ptp.adoptionTracking.batteryStorage;

  // Combined production accelerates learning for BOTH technologies
  const combinedBatteryProduction = evAdoption.cumulativeProduction + batteryAdoption.cumulativeProduction;
  const synergyCostReduction = Math.log2(combinedBatteryProduction) * 0.02; // 2% additional reduction

  evAdoption.costPerUnit *= (1 - synergyCostReduction);
  batteryAdoption.costPerUnit *= (1 - synergyCostReduction);

  // Synergy 2: Solar + Wind → Renewable grid infrastructure investment
  const solarAdoption = ptp.adoptionTracking.solarPV;
  const windAdoption = ptp.adoptionTracking.windPower;

  const renewableShare = solarAdoption.marketShare + windAdoption.marketShare;
  if (renewableShare > 0.20) {
    // High renewable share → grid infrastructure investment → easier to add more renewables
    const infrastructureBoost = (renewableShare - 0.20) * 0.5; // 50% boost above 20% threshold
    solarAdoption.adoptionRate *= (1 + infrastructureBoost * 0.1);
    windAdoption.adoptionRate *= (1 + infrastructureBoost * 0.1);
  }

  // Track synergies for analysis
  ptp.synergies = [
    {
      technologies: ['electric-vehicles', 'battery-storage'],
      synergyType: 'shared-manufacturing',
      synergyStrength: synergyCostReduction,
      combinedProduction: combinedBatteryProduction,
      crossTechCostReduction: synergyCostReduction,
    },
  ];

  if (renewableShare > 0.20) {
    ptp.synergies.push({
      technologies: ['solar-pv', 'wind-power'],
      synergyType: 'infrastructure-sharing',
      synergyStrength: Math.min(1.0, (renewableShare - 0.20) * 2),
    });
  }
}

/**
 * Phase 5: Calculate environmental impact
 * Convert technology adoption to emissions reduction
 */
function calculateEnvironmentalImpact(state: GameState): void {
  const ptp = state.positiveTippingPoints;

  // Monthly emissions reduction (Gt CO2/month)
  const solarImpact = ptp.adoptionTracking.solarPV.marketShare * 0.02;        // 20 Mt/month at 100% adoption
  const windImpact = ptp.adoptionTracking.windPower.marketShare * 0.015;      // 15 Mt/month
  const evImpact = ptp.adoptionTracking.electricVehicles.marketShare * 0.01;  // 10 Mt/month
  const heatPumpImpact = ptp.adoptionTracking.heatPumps.marketShare * 0.005;  // 5 Mt/month

  const monthlyReduction = solarImpact + windImpact + evImpact + heatPumpImpact;

  ptp.cumulativeEmissionsReduction += monthlyReduction;

  // Apply to environmental system
  if (state.resourceEconomy && state.resourceEconomy.co2) {
    // Reduce CO2 emissions (monthly reduction offsets annual emissions)
    state.resourceEconomy.co2.annualEmissions *= (1 - monthlyReduction * 0.01);
  }

  // Calculate cost savings (clean tech cheaper than fossil fuels)
  const costSavings = (
    (1.0 - ptp.adoptionTracking.solarPV.costPerUnit) * ptp.adoptionTracking.solarPV.marketShare * 0.1 +
    (1.0 - ptp.adoptionTracking.windPower.costPerUnit) * ptp.adoptionTracking.windPower.marketShare * 0.1 +
    (1.0 - ptp.adoptionTracking.electricVehicles.costPerUnit) * ptp.adoptionTracking.electricVehicles.marketShare * 0.05
  );

  ptp.cumulativeCostSavings += costSavings;

  // Boost economic metrics if cost savings significant
  if (costSavings > 0.01) {
    state.globalMetrics.economicStage += costSavings * 0.1;
  }

  // Calculate adoption acceleration vs business-as-usual
  const activeCascadeBoost = ptp.activeCascades * 0.5; // Each cascade = 50% acceleration
  ptp.adoptionAcceleration = 1.0 + activeCascadeBoost;
}

/**
 * Helper: Estimate environmental impact of technology
 */
function estimateEnvironmentalImpact(tech: TechnologyAdoption): number {
  // Emissions reduction potential (Gt CO2 over full adoption)
  const impactMap: Record<CascadeTechnologyType, number> = {
    'solar-pv': 5.0,           // 5 Gt CO2/year potential
    'wind-power': 4.0,         // 4 Gt CO2/year
    'electric-vehicles': 3.0,  // 3 Gt CO2/year
    'heat-pumps': 1.5,         // 1.5 Gt CO2/year
    'battery-storage': 0.5,    // 0.5 Gt CO2/year (indirect via renewables)
  };

  return (impactMap[tech.technology] || 0) * tech.marketShare;
}

/**
 * Helper: Estimate economic impact of technology
 */
function estimateEconomicImpact(tech: TechnologyAdoption): number {
  // Cost savings potential ($B over full adoption)
  const impactMap: Record<CascadeTechnologyType, number> = {
    'solar-pv': 200,
    'wind-power': 150,
    'electric-vehicles': 100,
    'heat-pumps': 50,
    'battery-storage': 80,
  };

  const costSavings = (1.0 - tech.costPerUnit) * (impactMap[tech.technology] || 0);
  return costSavings * tech.marketShare;
}

/**
 * Apply government policy intervention to trigger cascades
 * Called by government action phase
 */
export function applyPositiveTippingPolicy(
  state: GameState,
  policy: CascadePolicyType,
  targetTechs: CascadeTechnologyType[],
  policyStrength: number,
  costPerMonth: number
): void {
  const ptp = state.positiveTippingPoints;

  // Add to active policies
  ptp.activePolicies.push({
    policy,
    targetTechnologies: targetTechs,
    strength: policyStrength,
    implementedMonth: state.currentMonth,
    costPerMonth,
  });

  // Apply policy effects to target technologies
  for (const techType of targetTechs) {
    const tech = getTechnologyAdoption(ptp, techType);
    if (!tech) continue;

    // Add policy to supporting policies
    if (!tech.supportingPolicies.includes(policy)) {
      tech.supportingPolicies.push(policy);
    }

    // Increase policy strength
    tech.policyStrength = Math.min(1.0, tech.policyStrength + policyStrength);

    // Policy effects vary by type
    switch (policy) {
      case 'phase-out-mandate':
        // Creates certainty → accelerates investment
        tech.adoptionRate *= (1 + policyStrength * 0.3);
        break;

      case 'feed-in-tariff':
      case 'subsidy-program':
        // Direct cost reduction
        tech.costPerUnit *= (1 - policyStrength * 0.2);
        break;

      case 'building-standard':
        // Locks in technology for new construction
        tech.adoptionRate *= (1 + policyStrength * 0.2);
        break;

      case 'carbon-pricing':
        // Makes clean tech relatively cheaper
        tech.conventionalAlternativeCost *= (1 + policyStrength * 0.3);
        break;
    }
  }

  console.log(`  Policy Applied: ${policy}`);
  console.log(`    Targets: ${targetTechs.join(', ')}`);
  console.log(`    Strength: ${(policyStrength * 100).toFixed(0)}%`);
}

/**
 * Helper: Get technology adoption by type
 */
function getTechnologyAdoption(
  ptp: PositiveTippingPointsState,
  techType: CascadeTechnologyType
): TechnologyAdoption | undefined {
  switch (techType) {
    case 'solar-pv': return ptp.adoptionTracking.solarPV;
    case 'electric-vehicles': return ptp.adoptionTracking.electricVehicles;
    case 'wind-power': return ptp.adoptionTracking.windPower;
    case 'heat-pumps': return ptp.adoptionTracking.heatPumps;
    case 'battery-storage': return ptp.adoptionTracking.batteryStorage;
    default: return undefined;
  }
}

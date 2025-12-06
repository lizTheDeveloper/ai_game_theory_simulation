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
import { addSimulationEvent } from './utils/eventLogger';
import { assertDefined, assertFinite } from './utils/assertions';

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

    // M-6: Social trust cascades (NEW Dec 2025)
    // Research: UN World Social Report 2024, HEC Paris Social Capital 2025
    socialTrustCascade: {
      cascadeActive: false,
      cascadeStrength: 0,
      cascadeMonths: 0,

      // Baseline trust levels (circa 2025, varies by region)
      institutionalTrust: 0.50,        // 50% baseline trust in government
      interpersonalTrust: 0.55,        // 55% baseline social trust
      policyCooperation: 0.60,         // 60% baseline policy cooperation

      // Trigger parameters (research-backed)
      governanceQualityThreshold: 0.70, // 70% governance quality required
      trustGrowthRate: 0.01,           // 1% monthly trust increase during cascade
      cooperationMultiplier: 1.3,      // 30% policy effectiveness boost

      // Cascade parameters
      cascadeThreshold: 0.65,          // 65% trust threshold to trigger
      maxCascadeStrength: 0.80,        // 80% max cascade strength
      cascadeDuration: 48,             // 4 years typical duration (research midpoint)
    },

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
    priceParity: priceParityAchieved ? 1.0 : Math.min(1.0, conventionalCost / costPerUnit),
    supportingPolicies: [],
    policyStrength: 0,
    visibility,
    socialProofStrength: 0,
    socialAcceptance: marketShare * 2.0, // Initial social acceptance based on market share
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
  // FIX (Nov 7, 2025): Sort for deterministic iteration (Issue #11)
  ptp.activeCascades = Object.entries(ptp.adoptionTracking)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(e => e[1])
    .filter(tech => tech.cascadeActive).length;

  // Phase 7: M-6 Social trust cascades (NEW Dec 2025)
  updateSocialTrustCascade(state, rng);
}

/**
 * Phase 1: Update learning curves (Wright's Law)
 * Research: NREL, Nature Sustainability (2023)
 * 2x cumulative production → 20-30% cost reduction
 */
function updateLearningCurves(state: GameState): void {
  const ptp = state.positiveTippingPoints;

  // FIX (Nov 7, 2025): Sort for deterministic iteration (Issue #11)
  const sortedTechs = Object.entries(ptp.adoptionTracking)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(e => e[1]);

  for (const tech of sortedTechs) {
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

  // FIX (Nov 7, 2025): Sort for deterministic iteration (Issue #11)
  const sortedTechs = Object.entries(ptp.adoptionTracking)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(e => e[1]);

  for (const tech of sortedTechs) {
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

      // Add event to timeline
      addSimulationEvent(state, {
        type: 'positive-cascade-triggered',
        severity: 'constructive',
        agent: 'technology-adoption',
        title: `🚀 POSITIVE CASCADE: ${tech.technology}`,
        description: `Positive tipping point triggered for ${tech.technology}. ${triggerReason}. Market share: ${(tech.marketShare * 100).toFixed(1)}%, Price parity: ${(tech.priceParity * 100).toFixed(0)}%, Social acceptance: ${(tech.socialAcceptance * 100).toFixed(0)}%. Cascade strength: ${(tech.cascadeStrength * 100).toFixed(0)}%. This creates self-reinforcing adoption dynamics.`,
        effects: {
          technology: tech.technology,
          triggerReason,
          marketShare: tech.marketShare,
          priceParity: tech.priceParity,
          socialAcceptance: tech.socialAcceptance,
          cascadeStrength: tech.cascadeStrength,
          socialImpact: tech.visibility * tech.cascadeStrength
        }
      });
    }
  }
}

/**
 * Phase 3: Apply cascade dynamics (exponential growth)
 * Research: Nature Sustainability (2023) - S-curve adoption
 */
function applyCascadeDynamics(state: GameState, rng: RNGFunction): void {
  const ptp = state.positiveTippingPoints;

  // FIX (Nov 7, 2025): Sort for deterministic iteration (Issue #11)
  const sortedTechs = Object.entries(ptp.adoptionTracking)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(e => e[1]);

  for (const tech of sortedTechs) {
    if (!tech.cascadeActive) {
      // No cascade - normal linear growth
      tech.marketShare += tech.adoptionRate;

      // FIX (Oct 26, 2025): Cap marketShare when cascade is inactive
      // Previous: No cap → if adoptionRate becomes Infinity, marketShare becomes Infinity
      // New: Always cap at 1.0 (100% market saturation)
      tech.marketShare = Math.min(1.0, tech.marketShare);
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

    // FIX (Oct 27, 2025): Cap marketShare BEFORE using in socialBoost calculation
    // Previous: socialBoost used uncapped marketShare → positive feedback loop → Infinity → NaN
    // Root cause: marketShare feeds into socialBoost, which increases marketShare exponentially
    // By month 160, marketShare reached Infinity, causing NaN in emissions calculations
    tech.marketShare = Math.min(1.0, tech.marketShare);

    // Social contagion boost (visibility amplifies adoption)
    const socialBoost = tech.visibility * tech.marketShare * ptp.parameters.earlyAdopterInfluence * 0.01;
    tech.marketShare += socialBoost;
    tech.socialProofStrength = tech.visibility * tech.marketShare;

    // Cap market share at 1.0 (again, to handle socialBoost addition)
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

  // FIX (Oct 26, 2025): Remove compounding multiplication that causes costs to spiral to 0
  // Previous: costPerUnit *= (1 - reduction) every month → exponential decay → 0
  // New: Apply small additive reduction with floor
  const costReduction = Math.min(0.001, synergyCostReduction * 0.0001); // Max 0.1% reduction per month
  evAdoption.costPerUnit = Math.max(0.1, evAdoption.costPerUnit - costReduction); // Floor at 10% of original
  batteryAdoption.costPerUnit = Math.max(0.1, batteryAdoption.costPerUnit - costReduction);

  // Synergy 2: Solar + Wind → Renewable grid infrastructure investment
  const solarAdoption = ptp.adoptionTracking.solarPV;
  const windAdoption = ptp.adoptionTracking.windPower;

  const renewableShare = solarAdoption.marketShare + windAdoption.marketShare;
  if (renewableShare > 0.20) {
    // FIX (Oct 26, 2025): Remove compounding multiplication that causes Infinity
    // Previous: adoptionRate *= (1 + boost) every month → exponential growth → Infinity
    // New: adoptionRate bonus is capped, not compounded
    //
    // High renewable share → grid infrastructure investment → easier to add more renewables
    const infrastructureBoost = (renewableShare - 0.20) * 0.5; // 50% boost above 20% threshold
    const adoptionBonus = infrastructureBoost * 0.001; // Small additive bonus (0.1% per month max)
    solarAdoption.adoptionRate = Math.min(0.05, solarAdoption.adoptionRate + adoptionBonus); // Cap at 5%/month
    windAdoption.adoptionRate = Math.min(0.05, windAdoption.adoptionRate + adoptionBonus);
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
    // FIX (Oct 26, 2025): Validate inputs before modifying annualEmissions
    if (!isFinite(monthlyReduction)) {
      console.error(`❌ PositiveTippingPoints: monthlyReduction is NaN (month ${state.currentMonth})`);
      console.error(`   solarImpact=${solarImpact}, windImpact=${windImpact}, evImpact=${evImpact}, heatPumpImpact=${heatPumpImpact}`);
      throw new Error(`❌ NaN detected in positive tipping points emissions reduction`);
    }

    const currentEmissions = state.resourceEconomy.co2.annualEmissions;
    if (!isFinite(currentEmissions)) {
      console.error(`❌ PositiveTippingPoints: annualEmissions is NaN BEFORE modification (month ${state.currentMonth})`);
      console.error(`   Value: ${currentEmissions}`);
      throw new Error(`❌ annualEmissions is NaN before positive tipping points modification`);
    }

    // Calculate reduction factor (capped at 1% per month max to avoid over-reduction)
    const reductionFactor = Math.min(0.01, monthlyReduction * 0.01);
    const newEmissions = currentEmissions * (1 - reductionFactor);

    if (!isFinite(newEmissions)) {
      console.error(`❌ PositiveTippingPoints: annualEmissions became NaN AFTER calculation (month ${state.currentMonth})`);
      console.error(`   currentEmissions=${currentEmissions}, reductionFactor=${reductionFactor}, newEmissions=${newEmissions}`);
      throw new Error(`❌ annualEmissions calculation produced NaN`);
    }

    // Reduce CO2 emissions (monthly reduction offsets annual emissions)
    state.resourceEconomy.co2.annualEmissions = newEmissions;
  }

  // Calculate cost savings (clean tech cheaper than fossil fuels)
  const costSavings = (
    (1.0 - ptp.adoptionTracking.solarPV.costPerUnit) * ptp.adoptionTracking.solarPV.marketShare * 0.1 +
    (1.0 - ptp.adoptionTracking.windPower.costPerUnit) * ptp.adoptionTracking.windPower.marketShare * 0.1 +
    (1.0 - ptp.adoptionTracking.electricVehicles.costPerUnit) * ptp.adoptionTracking.electricVehicles.marketShare * 0.05
  );

  ptp.cumulativeCostSavings += costSavings;

  // Boost economic metrics if cost savings significant
  // FIX (Oct 25, 2025): Add bounds checking to prevent Infinity overflow
  if (costSavings > 0.01 && isFinite(costSavings)) {
    const boost = Math.min(0.5, costSavings * 0.1); // Cap boost at 0.5 per step
    state.globalMetrics.economicTransitionStage = Math.min(4.0,
      state.globalMetrics.economicTransitionStage + boost
    );
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

  const impact = assertDefined(impactMap[tech.technology], {
    location: 'estimateEnvironmentalImpact',
    valueName: `impactMap[${tech.technology}]`
  });
  return impact * tech.marketShare;
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

  const impact = assertDefined(impactMap[tech.technology], {
    location: 'estimateEconomicImpact',
    valueName: `impactMap[${tech.technology}]`
  });
  const costSavings = (1.0 - tech.costPerUnit) * impact;
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

/**
 * Phase 7: M-6 Social trust cascades (NEW Dec 2025)
 * Research: UN World Social Report 2024, HEC Paris Social Capital 2025
 * Mechanism: Governance success → citizen trust → policy cooperation → more governance success
 */
function updateSocialTrustCascade(state: GameState, rng: RNGFunction): void {
  const cascade = state.positiveTippingPoints.socialTrustCascade;
  const gov = state.government.governanceQuality;

  // Update institutional trust based on governance quality
  // Research: UN World Social Report 2024 - "Institutional trust underpins state legitimacy"
  const governanceQuality = assertFinite(
    (gov.decisionQuality + gov.institutionalCapacity + gov.transparency) / 3,
    {
      location: 'updateSocialTrustCascade',
      valueName: 'governanceQuality',
      month: state.currentMonth,
      additionalInfo: {
        decisionQuality: gov.decisionQuality,
        institutionalCapacity: gov.institutionalCapacity,
        transparency: gov.transparency,
      }
    }
  );

  // Trust grows when governance is good, erodes when bad
  const trustDelta = (governanceQuality - 0.5) * 0.005; // ±0.5% per month
  cascade.institutionalTrust = Math.max(0, Math.min(1,
    cascade.institutionalTrust + trustDelta
  ));

  // Interpersonal trust grows from social cohesion
  // Research: HEC Paris 2025 - "Bridging social capital drives social progress"
  const socialCohesion = assertFinite(
    state.socialAccumulation.socialCohesion.trust / 100,
    {
      location: 'updateSocialTrustCascade',
      valueName: 'socialCohesion',
      month: state.currentMonth
    }
  );
  cascade.interpersonalTrust = Math.max(0, Math.min(1,
    0.7 * cascade.interpersonalTrust + 0.3 * socialCohesion // Converge to social cohesion
  ));

  // Policy cooperation depends on both institutional and interpersonal trust
  cascade.policyCooperation = assertFinite(
    (cascade.institutionalTrust * 0.6 + cascade.interpersonalTrust * 0.4),
    {
      location: 'updateSocialTrustCascade',
      valueName: 'policyCooperation',
      month: state.currentMonth,
      additionalInfo: {
        institutionalTrust: cascade.institutionalTrust,
        interpersonalTrust: cascade.interpersonalTrust,
      }
    }
  );

  // Detect cascade trigger
  const avgTrust = (cascade.institutionalTrust + cascade.interpersonalTrust) / 2;
  const thresholdMet = avgTrust >= cascade.cascadeThreshold &&
                       governanceQuality >= cascade.governanceQualityThreshold;

  if (!cascade.cascadeActive && thresholdMet) {
    // Trigger cascade!
    cascade.cascadeActive = true;
    cascade.cascadeTriggeredMonth = state.currentMonth;
    cascade.cascadeStrength = Math.min(
      cascade.maxCascadeStrength,
      (avgTrust - cascade.cascadeThreshold) * 2  // Strength scales with how far past threshold
    );
    cascade.cascadeMonths = 0;

    console.log(`\n🤝💡 SOCIAL TRUST CASCADE TRIGGERED (Month ${state.currentMonth})`);
    console.log(`  Governance quality: ${(governanceQuality * 100).toFixed(0)}%`);
    console.log(`  Institutional trust: ${(cascade.institutionalTrust * 100).toFixed(0)}%`);
    console.log(`  Interpersonal trust: ${(cascade.interpersonalTrust * 100).toFixed(0)}%`);
    console.log(`  Cascade strength: ${(cascade.cascadeStrength * 100).toFixed(0)}%`);

    // Add event (reuse positive-cascade-triggered type)
    addSimulationEvent(state, {
      type: 'positive-cascade-triggered',
      severity: 'constructive',
      agent: 'society',
      title: '🤝💡 SOCIAL TRUST CASCADE: Positive Feedback Loop Activated',
      description: `Social trust cascade triggered. Governance quality ${(governanceQuality * 100).toFixed(0)}%, institutional trust ${(cascade.institutionalTrust * 100).toFixed(0)}%, interpersonal trust ${(cascade.interpersonalTrust * 100).toFixed(0)}%. Cascade strength ${(cascade.cascadeStrength * 100).toFixed(0)}%. This creates positive feedback: governance success → citizen trust → policy cooperation → more governance success.`,
      effects: {
        governanceQuality,
        institutionalTrust: cascade.institutionalTrust,
        interpersonalTrust: cascade.interpersonalTrust,
        cascadeStrength: cascade.cascadeStrength,
        cooperationMultiplier: cascade.cooperationMultiplier,
      }
    });
  }

  // Apply cascade effects if active
  if (cascade.cascadeActive) {
    cascade.cascadeMonths++;

    // Trust grows faster during cascade (positive feedback)
    cascade.institutionalTrust = Math.min(1,
      cascade.institutionalTrust + cascade.trustGrowthRate * cascade.cascadeStrength
    );
    cascade.interpersonalTrust = Math.min(1,
      cascade.interpersonalTrust + cascade.trustGrowthRate * cascade.cascadeStrength * 0.5
    );

    // Boost governance effectiveness (cooperation makes policies work better)
    // Research: UN 2024 - "Trust required for policy implementation and compliance"
    const cooperationBoost = assertFinite(
      (cascade.cascadeStrength * (cascade.cooperationMultiplier - 1.0)),
      {
        location: 'updateSocialTrustCascade',
        valueName: 'cooperationBoost',
        month: state.currentMonth,
        additionalInfo: {
          cascadeStrength: cascade.cascadeStrength,
          cooperationMultiplier: cascade.cooperationMultiplier,
        }
      }
    );

    // Apply to governance quality (policies work better with cooperation)
    gov.decisionQuality = Math.min(1.0,
      gov.decisionQuality * (1 + cooperationBoost * 0.005) // Small monthly boost
    );

    // End cascade if duration exceeded or trust falls
    if (cascade.cascadeMonths >= cascade.cascadeDuration ||
        avgTrust < cascade.cascadeThreshold * 0.9) {
      cascade.cascadeActive = false;
      cascade.cascadeStrength = 0;

      console.log(`\n🤝✅ SOCIAL TRUST CASCADE ENDED (Month ${state.currentMonth})`);
      console.log(`  Final institutional trust: ${(cascade.institutionalTrust * 100).toFixed(0)}%`);
      console.log(`  Final interpersonal trust: ${(cascade.interpersonalTrust * 100).toFixed(0)}%`);
      console.log(`  Duration: ${(cascade.cascadeMonths / 12).toFixed(1)} years`);
    }
  }
}

/**
 * 🔍 ENHANCED DIAGNOSTIC: Positive tipping point diagnostics
 * Shows technology adoption rates and cascade trigger conditions
 */
export function logPositiveTippingPointDiagnostics(state: GameState): void {
  const ptp = state.positiveTippingPoints;

  console.log(`\n=== POSITIVE TIPPING POINT DIAGNOSTICS ===`);

  // For each technology, show adoption status and cascade conditions
  const techs: Array<{ key: keyof typeof ptp.adoptionTracking; name: string }> = [
    { key: 'solarPV', name: 'Solar PV' },
    { key: 'electricVehicles', name: 'Electric Vehicles' },
    { key: 'windPower', name: 'Wind Power' },
    { key: 'heatPumps', name: 'Heat Pumps' },
    { key: 'batteryStorage', name: 'Battery Storage' },
  ];

  techs.forEach(({ key, name }) => {
    const adoption = ptp.adoptionTracking[key];

    console.log(`\n  ⚡ ${name}: ${adoption.cascadeActive ? '✅ CASCADE ACTIVE' : '❌ NO CASCADE'}`);
    console.log(`     Market share: ${(adoption.marketShare * 100).toFixed(2)}%`);
    console.log(`     Adoption rate: ${(adoption.adoptionRate * 100).toFixed(3)}% per month`);
    console.log(`     Cost vs conventional: ${(adoption.costPerUnit / adoption.conventionalAlternativeCost).toFixed(2)}x`);
    console.log(`     Price parity: ${adoption.priceParityAchieved ? '✅' : '❌'}`);

    if (adoption.cascadeActive) {
      console.log(`     Cascade strength: ${adoption.cascadeStrength.toFixed(2)}`);
      if (adoption.cascadeTriggeredMonth !== undefined) {
        console.log(`     Triggered month: ${adoption.cascadeTriggeredMonth}`);
      }
    } else {
      // Show why cascade hasn't triggered
      const inThresholdRange = adoption.marketShare >= ptp.parameters.cascadeThresholdMin &&
                               adoption.marketShare <= ptp.parameters.cascadeThresholdMax;
      console.log(`     In threshold range (5-20%): ${inThresholdRange ? '✅' : '❌'}`);

      // Calculate trigger score
      let triggerScore = 0;
      if (adoption.priceParityAchieved) triggerScore += 0.4;
      if (adoption.policyStrength > 0.3) triggerScore += 0.3;
      if (adoption.marketShare > 0.15) triggerScore += 0.2;
      const visibilityBonus = adoption.visibility * adoption.marketShare * 0.1;
      triggerScore += visibilityBonus;

      console.log(`     Trigger score: ${triggerScore.toFixed(2)} (need ~0.6+ for high probability)`);
      console.log(`       - Price parity: ${adoption.priceParityAchieved ? '+0.4' : '0'}`);
      console.log(`       - Policy support (>${(ptp.parameters.cascadeThresholdMin * 100).toFixed(0)}%): ${adoption.policyStrength > 0.3 ? '+0.3' : '0'} (${(adoption.policyStrength * 100).toFixed(0)}%)`);
      console.log(`       - Social threshold (>15%): ${adoption.marketShare > 0.15 ? '+0.2' : '0'}`);
      console.log(`       - Visibility bonus: +${visibilityBonus.toFixed(2)}`);
    }

    // Show learning curve progress
    console.log(`     Cumulative production: ${adoption.cumulativeProduction.toFixed(2)}x baseline`);
    console.log(`     Learning rate: ${(adoption.learningRate * 100).toFixed(0)}% per doubling`);
  });

  console.log(`\n  🌊 Summary:`);
  console.log(`     Active cascades: ${ptp.activeCascades}`);
  console.log(`     Adoption acceleration: ${ptp.adoptionAcceleration.toFixed(2)}x baseline`);
  console.log(`     Cumulative emissions reduction: ${ptp.cumulativeEmissionsReduction.toFixed(2)} Gt CO2`);
  console.log(`     Cumulative cost savings: $${ptp.cumulativeCostSavings.toFixed(1)}B`);
}

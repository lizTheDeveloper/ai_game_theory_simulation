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
import { assertDefined, assertFinite, assertInRange } from './utils/assertions';

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

    // M-6: Social tipping cascades (Otto et al. 2020)
    socialCascades: {
      renewableNorms: {
        cascadeType: 'renewable-norms',
        adoptionLevel: 0.35,
        adoptionRate: 0.005,
        cascadeActive: false,
        cascadeStrength: 0,
      },
      policyClimateAction: {
        cascadeType: 'policy-climate-action',
        adoptionLevel: 0.20,
        adoptionRate: 0.01,
        cascadeActive: false,
        cascadeStrength: 0,
      },
      behavioralConservation: {
        cascadeType: 'behavioral-conservation',
        adoptionLevel: 0.15,
        adoptionRate: 0.002,
        cascadeActive: false,
        cascadeStrength: 0,
      },
      consumptionShift: {
        cascadeType: 'consumption-shift',
        adoptionLevel: 0.10,
        adoptionRate: 0.001,
        cascadeActive: false,
        cascadeStrength: 0,
      },
    },

    cumulativeEmissionsReduction: 0,
    cumulativeCostSavings: 0,
    adoptionAcceleration: 1.0,         // 1.0 = business-as-usual baseline

    // M-6: Social norm cascades (Otto et al. 2020)
    socialNorms: {
      climateConcernLevel: 0.35,       // 35% baseline public support (2025 polling)
      normTippingCrossed: false,
      normCascadeActive: false,
      normInfluenceRate: 0.005,        // 0.5%/month baseline spreading rate
    },

    // M-6: Political will tipping (Otto et al. 2020)
    politicalWill: {
      aggregatePolicyStrength: 0.20,   // 20% baseline policy stringency (weak, 2025)
      lockInThresholdCrossed: false,
      politicalMomentum: 0.01,         // 1%/month baseline momentum
      backlashRisk: 0.15,              // 15% baseline backlash risk (moderate)
      coalitionStrength: 0.30,         // 30% baseline coalition strength
    },

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

      // M-6: Social norm parameters
      normTippingThreshold: 0.27,      // 27% critical mass (midpoint of 25-30% range)
      normCascadeMultiplier: 2.0,      // 2x influence spreading acceleration
      normCascadeDuration: 120,        // 10 years (midpoint of 5-15 year range)

      // M-6: Political will parameters
      politicalLockInThreshold: 0.45,  // 45% policy strength (midpoint of 40-50%)
      policyRatchetRate: 0.015,        // 1.5%/month momentum increase
      backlashThreshold: 0.30,         // 30% risk triggers reversal pressure
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

  // Phase 6: M-6 - Update social norm cascades
  updateSocialNormCascades(state, rng);

  // Phase 7: M-6 - Update political will tipping
  updatePoliticalWillTipping(state, rng);

  // Phase 8: Update active cascade count
  // FIX (Nov 7, 2025): Sort for deterministic iteration (Issue #11)
  ptp.activeCascades = Object.entries(ptp.adoptionTracking)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(e => e[1])
    .filter(tech => tech.cascadeActive).length;
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

/**
 * M-6: Update social norm cascades
 * Research: Otto et al. 2020 - 25-30% critical mass triggers rapid norm shift
 *
 * Mechanism:
 * 1. Climate concern spreads through social networks (baseline 0.5%/month)
 * 2. Technology adoption boosts concern (EVs visible → awareness)
 * 3. Climate impacts amplify concern (disasters → salience)
 * 4. Once 25-30% threshold crossed → cascade (2x spreading rate)
 * 5. Cascade persists for 5-15 years, then stabilizes
 */
function updateSocialNormCascades(state: GameState, rng: RNGFunction): void {
  const ptp = state.positiveTippingPoints;
  const norms = ptp.socialNorms;
  const params = ptp.parameters;

  // Input 1: Technology visibility boosts climate concern
  // High-visibility tech adoption (EVs, solar rooftops) increases awareness
  const avgVisibleAdoption = (
    ptp.adoptionTracking.electricVehicles.marketShare * ptp.adoptionTracking.electricVehicles.visibility +
    ptp.adoptionTracking.solarPV.marketShare * ptp.adoptionTracking.solarPV.visibility
  ) / 2;

  const techBoost = assertFinite(
    avgVisibleAdoption * 0.01, // 1% concern boost per 100% visible adoption
    { location: 'updateSocialNormCascades', valueName: 'techBoost', month: state.currentMonth }
  );

  // Input 2: Climate impacts amplify concern (disasters increase salience)
  // Convert climateStability (0-1) to temperature delta equivalent
  // climateStability 1.0 → 0°C, 0.75 → ~1.2°C, 0.5 → ~2.5°C, 0.0 → ~5°C
  const climateStability = assertFinite(
    state.environmentalAccumulation.climateStability,
    { location: 'updateSocialNormCascades', valueName: 'climateStability', month: state.currentMonth }
  );
  const surfaceTempDelta = (1 - climateStability) * 5; // Rough temperature delta in °C
  const impactBoost = assertFinite(
    Math.max(0, surfaceTempDelta * 0.02), // 2% concern boost per °C warming
    { location: 'updateSocialNormCascades', valueName: 'impactBoost', month: state.currentMonth }
  );

  // Base spreading rate
  let spreadingRate = norms.normInfluenceRate;

  // Check for cascade trigger
  if (!norms.normTippingCrossed && norms.climateConcernLevel >= params.normTippingThreshold) {
    norms.normTippingCrossed = true;
    norms.normCascadeActive = true;
    norms.normCascadeTriggeredMonth = state.currentMonth;

    console.log(`\n🌊💡 SOCIAL NORM CASCADE TRIGGERED (Month ${state.currentMonth})`);
    console.log(`   Climate concern crossed ${(params.normTippingThreshold * 100).toFixed(0)}% threshold`);
    console.log(`   Norm spreading accelerates ${params.normCascadeMultiplier}x`);
  }

  // Apply cascade acceleration if active
  if (norms.normCascadeActive) {
    const monthsSinceTrigger = state.currentMonth - (norms.normCascadeTriggeredMonth ?? 0);

    // Cascade lasts for normCascadeDuration months
    if (monthsSinceTrigger < params.normCascadeDuration) {
      spreadingRate *= params.normCascadeMultiplier; // 2x acceleration
    } else {
      norms.normCascadeActive = false; // Cascade complete, stabilizes
      console.log(`\n🌊✅ SOCIAL NORM CASCADE COMPLETE (Month ${state.currentMonth})`);
      console.log(`   Norm shift stabilized after ${params.normCascadeDuration} months`);
    }
  }

  // Update climate concern level (clamp to [0, 1] since incremental updates can overshoot)
  const concernDelta = spreadingRate + techBoost + impactBoost;
  norms.climateConcernLevel = Math.min(1.0, Math.max(0.0, norms.climateConcernLevel + concernDelta));
}

/**
 * M-6: Update political will tipping
 * Research: Otto et al. 2020 - 40-50% policy strength creates lock-in (hard to reverse)
 *
 * Mechanism:
 * 1. Social norms drive political momentum (high concern → policy demand)
 * 2. Technology success reinforces political will (EVs working → more support)
 * 3. Once 40-50% policy strength reached → lock-in (ratchet effect)
 * 4. Backlash risk can reverse momentum if too fast without public support
 */
function updatePoliticalWillTipping(state: GameState, rng: RNGFunction): void {
  const ptp = state.positiveTippingPoints;
  const will = ptp.politicalWill;
  const norms = ptp.socialNorms;
  const params = ptp.parameters;

  // Input 1: Social norms drive political momentum
  // High climate concern → stronger policy demand
  const normBoost = assertFinite(
    (norms.climateConcernLevel - 0.35) * 0.02, // Baseline 35%, each +1% → +0.02 momentum
    { location: 'updatePoliticalWillTipping', valueName: 'normBoost', month: state.currentMonth }
  );

  // Input 2: Technology success reinforces political will
  // Successful cascades prove policies work → more support
  const cascadeCount = ptp.activeCascades;
  const cascadeBoost = assertFinite(
    cascadeCount * 0.005, // 0.5% momentum per active cascade
    { location: 'updatePoliticalWillTipping', valueName: 'cascadeBoost', month: state.currentMonth }
  );

  // Input 3: Economic viability reduces backlash risk
  // Price parity achieved → less economic resistance
  const priceParityCount = Object.values(ptp.adoptionTracking).filter(t => t.priceParityAchieved).length;
  const backlashReduction = assertFinite(
    priceParityCount * 0.02, // 2% risk reduction per price-competitive tech
    { location: 'updatePoliticalWillTipping', valueName: 'backlashReduction', month: state.currentMonth }
  );

  // Update political momentum (clamp to cap before assertion)
  will.politicalMomentum = assertInRange(
    Math.min(0.05, Math.max(0, will.politicalMomentum + normBoost + cascadeBoost)),
    0, 0.05, // Cap at 5%/month max momentum
    { location: 'updatePoliticalWillTipping', valueName: 'politicalMomentum', month: state.currentMonth }
  );

  // Update backlash risk (clamp to prevent floating point precision errors)
  will.backlashRisk = assertInRange(
    Math.max(0, will.backlashRisk - backlashReduction),
    0, 1,
    { location: 'updatePoliticalWillTipping', valueName: 'backlashRisk', month: state.currentMonth }
  );

  // Check if momentum outpaces public support (backlash trigger)
  if (will.aggregatePolicyStrength > norms.climateConcernLevel + 0.15) {
    will.backlashRisk = Math.min(1.0, will.backlashRisk + 0.05); // +5% risk if policies too far ahead
  }

  // Apply backlash if risk exceeds threshold
  if (will.backlashRisk > params.backlashThreshold) {
    will.politicalMomentum *= 0.5; // Halve momentum (political resistance)
    will.backlashRisk -= 0.10; // Spending political capital reduces risk temporarily
  }

  // Update aggregate policy strength (momentum drives policy, clamp to [0, 1])
  const policyDelta = will.politicalMomentum * (1.0 - will.backlashRisk);
  will.aggregatePolicyStrength = assertInRange(
    Math.min(1, Math.max(0, will.aggregatePolicyStrength + policyDelta)),
    0, 1,
    { location: 'updatePoliticalWillTipping', valueName: 'aggregatePolicyStrength', month: state.currentMonth }
  );

  // Check for lock-in threshold
  if (!will.lockInThresholdCrossed && will.aggregatePolicyStrength >= params.politicalLockInThreshold) {
    will.lockInThresholdCrossed = true;
    will.backlashRisk *= 0.5; // Lock-in halves reversal risk (policies institutionalized)

    console.log(`\n🏛️💡 POLITICAL LOCK-IN ACHIEVED (Month ${state.currentMonth})`);
    console.log(`   Policy strength: ${(will.aggregatePolicyStrength * 100).toFixed(0)}%`);
    console.log(`   Climate policies now politically entrenched (hard to reverse)`);
  }

  // Update coalition strength (follows policy strength with lag)
  const coalitionGap = will.aggregatePolicyStrength - will.coalitionStrength;
  will.coalitionStrength = assertInRange(
    will.coalitionStrength + coalitionGap * 0.1, // 10% catch-up per month
    0, 1,
    { location: 'updatePoliticalWillTipping', valueName: 'coalitionStrength', month: state.currentMonth }
  );
}

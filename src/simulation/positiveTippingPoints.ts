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
  CascadeSocialType,
  PositiveTippingEvent,
  TechnologySynergy,
  SocialTippingAdoption
} from '../types/positiveTippingPoints';
import { addSimulationEvent } from './utils/eventLogger';
import { assertDefined, assertFinite, assertInRange, assertProbability } from './utils/assertions';

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
    activeTechCascades: 0,
    synergies: [],

    activePolicies: [],

    // Social tipping cascades (M-6)
    // Research: Lenton et al. 2022, Alkemade et al. 2024, UN 2024 (trust → collective action)
    socialCascades: {
      renewableNorms: createSocialTippingAdoption('renewable-energy-norms', 0.10, 0.001),
      policyClimateAction: createSocialTippingAdoption('policy-climate-action', 0.15, 0.002),
      behavioralConservation: createSocialTippingAdoption('behavioral-conservation', 0.05, 0.001),
      consumptionShift: createSocialTippingAdoption('consumption-shift', 0.03, 0.0005),
    },

    cumulativeEmissionsReduction: 0,
    cumulativeCostSavings: 0,
    adoptionAcceleration: 1.0,         // 1.0 = business-as-usual baseline

    // M-6: Social norm cascades (Otto et al. 2020)
    socialNorms: {
      climateConcernLevel: 0.15,       // 15% initial climate concern level
      normTippingCrossed: false,
      normCascadeActive: false,
      normInfluenceRate: 0.005,        // 0.5% baseline monthly norm spreading
    },

    // M-6: Political will tipping (Grin et al. 2010)
    politicalWill: {
      aggregatePolicyStrength: 0.10,   // 10% initial policy stringency
      lockInThresholdCrossed: false,
      politicalMomentum: 0.0,          // No momentum initially
      backlashRisk: 0.05,              // 5% baseline backlash risk
      coalitionStrength: 0.12,         // 12% initial coalition support
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

      // M-6: Social norm tipping parameters (Otto et al. 2020)
      normTippingThreshold: 0.25,      // 25% critical mass (Otto et al. 2020)
      normCascadeMultiplier: 2.0,      // 2.0x influence spreading acceleration
      normCascadeDuration: 120,        // 10 years average

      // Political lock-in (Grin et al. 2010, Geels 2014)
      politicalLockInThreshold: 0.45,  // 45% policy strength for irreversibility
      policyRatchetRate: 0.015,        // 1.5%/month momentum increase

      // Backlash risk (Mildenberger & Leiserowitz 2017)
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
 * Helper: Create SocialTippingAdoption object
 * Research: Lenton et al. 2022 (social tipping interventions), Alkemade et al. 2024 (behavioral cascades)
 */
function createSocialTippingAdoption(
  cascadeType: CascadeSocialType,
  adoptionLevel: number,
  adoptionRate: number
): SocialTippingAdoption {
  return {
    cascadeType,
    adoptionLevel,
    adoptionRate,
    cascadeActive: false,
    cascadeStrength: 0,
    cascadeTriggeredMonth: undefined,
    trustLevel: 50,              // Will be synced from state
    policySupport: 0.1,          // Baseline policy support
    mediaVisibility: 0.2,        // Baseline visibility
    socialProofStrength: 0,
    technologyAcceleration: 1.0, // Neutral initially
    emissionsReduction: 0,       // No direct effect initially
    politicalCapital: 0,         // No political capital initially
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
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic simulation');
  }

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

  // NEW (M-6): Social tipping phases
  updateSocialTippingState(state);
  detectSocialTippingCascades(state, rng);
  applySocialCascadeDynamics(state, rng);
  applySocialCascadeEffects(state);

  // Phase 6: Update active cascade count
  // FIX (Nov 7, 2025): Sort for deterministic iteration (Issue #11)
  ptp.activeTechCascades = Object.entries(ptp.adoptionTracking)
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
  const activeCascadeBoost = ptp.activeTechCascades * 0.5; // Each cascade = 50% acceleration
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
 * M-6: Update social tipping cascade state
 * Syncs trust, policy support, visibility from global state
 */
function updateSocialTippingState(state: GameState): void {
  const ptp = state.positiveTippingPoints;
  const socialCascades = ptp.socialCascades;

  // Sync trust from social accumulation (0-100 scale)
  const trust = state.socialAccumulation?.socialCohesion?.trust ?? 50;
  const trustNormalized = assertInRange(trust / 100, 0, 1, {
    location: 'updateSocialTippingState',
    valueName: 'trustNormalized',
    month: state.currentMonth,
  });

  // Calculate media visibility from renewable tech adoption
  const solarShare = ptp.adoptionTracking.solarPV.marketShare;
  const windShare = ptp.adoptionTracking.windPower.marketShare;
  const evShare = ptp.adoptionTracking.electricVehicles.marketShare;
  const renewableVisibility = assertInRange(
    (solarShare + windShare + evShare) / 3,
    0, 1,
    { location: 'updateSocialTippingState', valueName: 'renewableVisibility', month: state.currentMonth }
  );

  // Calculate policy support (rough proxy from government action)
  const policySupport = Math.min(1.0, ptp.activePolicies.length * 0.2);

  // Update each social cascade
  socialCascades.renewableNorms.trustLevel = trust;
  socialCascades.renewableNorms.mediaVisibility = renewableVisibility;
  socialCascades.renewableNorms.policySupport = policySupport;

  socialCascades.policyClimateAction.trustLevel = trust;
  socialCascades.policyClimateAction.mediaVisibility = renewableVisibility * 0.8; // Less visible
  socialCascades.policyClimateAction.policySupport = policySupport;

  socialCascades.behavioralConservation.trustLevel = trust;
  socialCascades.behavioralConservation.mediaVisibility = 0.5; // Behavioral shifts less visible
  socialCascades.behavioralConservation.policySupport = policySupport * 0.5;

  socialCascades.consumptionShift.trustLevel = trust;
  socialCascades.consumptionShift.mediaVisibility = 0.3; // Low-carbon lifestyles less visible
  socialCascades.consumptionShift.policySupport = policySupport * 0.3;
}

/**
 * M-6: Detect social tipping cascades
 * Research: Lenton et al. 2022 (15-25% adoption threshold), UN 2024 (trust >0.60)
 */
function detectSocialTippingCascades(state: GameState, rng: RNGFunction): void {
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic simulation');
  }

  const ptp = state.positiveTippingPoints;
  const cascades = ptp.socialCascades;

  // Renewable norms cascade: Solar/wind market share >15% + high visibility
  const renewableNorms = cascades.renewableNorms;
  if (!renewableNorms.cascadeActive && renewableNorms.adoptionLevel > 0.15) {
    const solarShare = ptp.adoptionTracking.solarPV.marketShare;
    const windShare = ptp.adoptionTracking.windPower.marketShare;
    const renewableShare = solarShare + windShare;

    if (renewableShare > 0.15 && renewableNorms.mediaVisibility > 0.3) {
      const triggerProb = Math.min(0.9, (renewableShare - 0.15) * 2 + renewableNorms.mediaVisibility);
      if (rng() < triggerProb) {
        renewableNorms.cascadeActive = true;
        renewableNorms.cascadeTriggeredMonth = state.currentMonth;
        renewableNorms.cascadeStrength = Math.min(1.0, renewableShare + renewableNorms.mediaVisibility);
        console.log(`  🌍 SOCIAL CASCADE: Renewable energy norms (adoption=${(renewableNorms.adoptionLevel * 100).toFixed(1)}%, renewables=${(renewableShare * 100).toFixed(1)}%)`);

        addSimulationEvent(state, {
          type: 'positive-cascade-triggered',
          severity: 'constructive',
          agent: 'society',
          title: '🌍 SOCIAL CASCADE: Renewable energy norms',
          description: `Renewable energy has become culturally normalized. Solar/wind market share: ${(renewableShare * 100).toFixed(1)}%. This accelerates technology adoption through social proof.`,
          effects: {
            cascadeType: 'renewable-energy-norms',
            adoptionLevel: renewableNorms.adoptionLevel,
            renewableShare,
            cascadeStrength: renewableNorms.cascadeStrength,
          },
        });
      }
    }
  }

  // Policy cascade: Trust >0.65 + adoption >20%
  const policyAction = cascades.policyClimateAction;
  if (!policyAction.cascadeActive && policyAction.adoptionLevel > 0.20) {
    const trustNormalized = policyAction.trustLevel / 100;
    if (trustNormalized > 0.65 && policyAction.policySupport > 0.3) {
      const triggerProb = Math.min(0.9, (trustNormalized - 0.65) * 2 + policyAction.policySupport);
      if (rng() < triggerProb) {
        policyAction.cascadeActive = true;
        policyAction.cascadeTriggeredMonth = state.currentMonth;
        policyAction.cascadeStrength = Math.min(1.0, trustNormalized + policyAction.policySupport);
        console.log(`  🌍 SOCIAL CASCADE: Policy climate action (trust=${(trustNormalized * 100).toFixed(0)}%, adoption=${(policyAction.adoptionLevel * 100).toFixed(1)}%)`);

        addSimulationEvent(state, {
          type: 'positive-cascade-triggered',
          severity: 'constructive',
          agent: 'government',
          title: '🌍 SOCIAL CASCADE: Policy climate action',
          description: `High trust (${(trustNormalized * 100).toFixed(0)}%) enables stronger climate policies. Political will cascade activated.`,
          effects: {
            cascadeType: 'policy-climate-action',
            trust: trustNormalized,
            adoptionLevel: policyAction.adoptionLevel,
            cascadeStrength: policyAction.cascadeStrength,
          },
        });
      }
    }
  }

  // Behavioral conservation: Trust >0.60 + (price spike OR climate event)
  const behavioral = cascades.behavioralConservation;
  if (!behavioral.cascadeActive) {
    const trustNormalized = behavioral.trustLevel / 100;
    // Check for crisis conditions (any active crisis)
    const crisisCondition = state.crises?.megaPandemic?.active || false;

    if (trustNormalized > 0.60 && (crisisCondition || behavioral.adoptionLevel > 0.15)) {
      const triggerProb = Math.min(0.8, (trustNormalized - 0.60) * 2 + (crisisCondition ? 0.4 : 0));
      if (rng() < triggerProb) {
        behavioral.cascadeActive = true;
        behavioral.cascadeTriggeredMonth = state.currentMonth;
        behavioral.cascadeStrength = Math.min(1.0, trustNormalized + (crisisCondition ? 0.3 : 0));
        console.log(`  🌍 SOCIAL CASCADE: Behavioral conservation (trust=${(trustNormalized * 100).toFixed(0)}%, crisis=${crisisCondition})`);

        addSimulationEvent(state, {
          type: 'positive-cascade-triggered',
          severity: 'constructive',
          agent: 'society',
          title: '🌍 SOCIAL CASCADE: Behavioral conservation',
          description: `Social solidarity drives energy conservation. Trust: ${(trustNormalized * 100).toFixed(0)}%. Research: EU 19% natural gas reduction in 6 months (Alkemade 2024).`,
          effects: {
            cascadeType: 'behavioral-conservation',
            trust: trustNormalized,
            crisisCondition,
            cascadeStrength: behavioral.cascadeStrength,
          },
        });
      }
    }
  }

  // Consumption shift: High QoL (>0.7) + low meaning crisis (<0.3)
  const consumption = cascades.consumptionShift;
  if (!consumption.cascadeActive && consumption.adoptionLevel > 0.10) {
    // Rough QoL proxy (would use actual QoL metric in production)
    const meaningCrisis = state.socialAccumulation?.meaningCrisisLevel ?? 0.5;
    const highQoL = meaningCrisis < 0.3; // Inverse proxy

    if (highQoL && consumption.adoptionLevel > 0.10) {
      const triggerProb = Math.min(0.7, (0.3 - meaningCrisis) * 2);
      if (rng() < triggerProb) {
        consumption.cascadeActive = true;
        consumption.cascadeTriggeredMonth = state.currentMonth;
        consumption.cascadeStrength = Math.min(1.0, 0.5 + (0.3 - meaningCrisis));
        console.log(`  🌍 SOCIAL CASCADE: Consumption shift (QoL high, meaningCrisis=${(meaningCrisis * 100).toFixed(0)}%)`);

        addSimulationEvent(state, {
          type: 'positive-cascade-triggered',
          severity: 'constructive',
          agent: 'society',
          title: '🌍 SOCIAL CASCADE: Low-carbon consumption',
          description: `Lifestyle shifts towards sustainable consumption. Meaning crisis low: ${(meaningCrisis * 100).toFixed(0)}%. Post-material values emerging.`,
          effects: {
            cascadeType: 'consumption-shift',
            meaningCrisis,
            adoptionLevel: consumption.adoptionLevel,
            cascadeStrength: consumption.cascadeStrength,
          },
        });
      }
    }
  }
}

/**
 * M-6: Apply social cascade dynamics (exponential growth)
 * Research: Alkemade et al. 2024 (19% in 6 months during crisis), typical 12-24 month doubling
 */
function applySocialCascadeDynamics(state: GameState, rng: RNGFunction): void {
  if (!rng || typeof rng !== 'function') {
    throw new Error('❌ CRITICAL: RNG required for deterministic simulation');
  }

  const ptp = state.positiveTippingPoints;
  const cascades = ptp.socialCascades;

  // Sort for deterministic iteration
  const sortedCascades = Object.entries(cascades).sort((a, b) => a[0].localeCompare(b[0])).map(e => e[1]);

  for (const cascade of sortedCascades) {
    if (!cascade.cascadeActive) {
      // Normal slow growth
      cascade.adoptionLevel = assertInRange(
        cascade.adoptionLevel + cascade.adoptionRate,
        0, 1,
        {
          location: 'applySocialCascadeDynamics',
          valueName: 'adoptionLevel',
          month: state.currentMonth,
          epsilon: 1e-10  // Tolerance for floating-point rounding errors
        }
      );
      continue;
    }

    // Cascade active - exponential growth
    // Research: 12-24 month doubling (normal), 6 month doubling (crisis)
    const doublingMonths = 18; // Conservative middle ground
    const monthlyGrowthRate = Math.pow(2, 1 / doublingMonths) - 1; // ~3.9% per month
    const cascadeMultiplier = 1 + (cascade.cascadeStrength * monthlyGrowthRate * 10); // Up to 39% monthly

    const newAdoption = cascade.adoptionLevel * cascadeMultiplier;
    cascade.adoptionLevel = assertInRange(
      Math.min(0.80, newAdoption), // Saturation at 80%
      0, 1,
      {
        location: 'applySocialCascadeDynamics',
        valueName: 'newAdoption',
        month: state.currentMonth,
        epsilon: 1e-10  // Tolerance for floating-point rounding errors
      }
    );

    // Social proof strength grows with adoption
    cascade.socialProofStrength = assertInRange(
      cascade.adoptionLevel * cascade.mediaVisibility,
      0, 1,
      {
        location: 'applySocialCascadeDynamics',
        valueName: 'socialProofStrength',
        month: state.currentMonth,
        epsilon: 1e-10  // Tolerance for floating-point rounding errors
      }
    );

    // End cascade if saturated or trust declines
    const trustNormalized = cascade.trustLevel / 100;
    const duration = cascade.cascadeTriggeredMonth ? state.currentMonth - cascade.cascadeTriggeredMonth : 0;

    if (cascade.adoptionLevel > 0.75 || trustNormalized < 0.50 || duration > 120) {
      cascade.cascadeActive = false;
      cascade.cascadeStrength = 0;
      console.log(`  🌍 Social cascade completed: ${cascade.cascadeType} (final adoption=${(cascade.adoptionLevel * 100).toFixed(1)}%)`);
    }
  }
}

/**
 * M-6: Apply social cascade effects
 * Bidirectional coupling: social acceptance ↔ tech adoption
 * Research: Lenton et al. 2022 (policy cascades), Alkemade et al. 2024 (behavioral impact)
 */
function applySocialCascadeEffects(state: GameState): void {
  const ptp = state.positiveTippingPoints;
  const cascades = ptp.socialCascades;

  // Effect 1: Renewable norms amplify solar/wind adoption
  if (cascades.renewableNorms.cascadeActive) {
    const acceleration = assertFinite(
      1.0 + cascades.renewableNorms.cascadeStrength * 0.5, // Up to 50% boost
      { location: 'applySocialCascadeEffects', valueName: 'renewableNormsAcceleration', month: state.currentMonth }
    );
    cascades.renewableNorms.technologyAcceleration = acceleration;

    ptp.adoptionTracking.solarPV.adoptionRate = assertFinite(
      ptp.adoptionTracking.solarPV.adoptionRate * acceleration,
      { location: 'applySocialCascadeEffects', valueName: 'solarAdoptionRate', month: state.currentMonth }
    );
    ptp.adoptionTracking.windPower.adoptionRate = assertFinite(
      ptp.adoptionTracking.windPower.adoptionRate * acceleration,
      { location: 'applySocialCascadeEffects', valueName: 'windAdoptionRate', month: state.currentMonth }
    );
  }

  // Effect 2: Policy cascade increases policy strength
  if (cascades.policyClimateAction.cascadeActive) {
    const politicalCapital = assertFinite(
      cascades.policyClimateAction.cascadeStrength * 0.3,
      { location: 'applySocialCascadeEffects', valueName: 'politicalCapital', month: state.currentMonth }
    );
    cascades.policyClimateAction.politicalCapital = politicalCapital;

    // Boost all renewable tech policy strength
    for (const tech of Object.values(ptp.adoptionTracking)) {
      tech.policyStrength = Math.min(1.0, tech.policyStrength + politicalCapital * 0.1);
    }
  }

  // Effect 3: Behavioral conservation reduces emissions directly
  if (cascades.behavioralConservation.cascadeActive) {
    // Research: EU 19% gas reduction in 6 months
    // At full cascade (80% adoption), 0.5-1.0 GtCO2/yr reduction
    const emissionsReduction = assertFinite(
      cascades.behavioralConservation.adoptionLevel * cascades.behavioralConservation.cascadeStrength * 1.0, // GtCO2/yr
      { location: 'applySocialCascadeEffects', valueName: 'behavioralEmissionsReduction', month: state.currentMonth }
    );
    cascades.behavioralConservation.emissionsReduction = emissionsReduction;

    // Apply to global emissions
    if (state.resourceEconomy?.co2) {
      const monthlyReduction = emissionsReduction / 12; // Convert annual to monthly
      const currentEmissions = assertFinite(
        state.resourceEconomy.co2.annualEmissions,
        { location: 'applySocialCascadeEffects', valueName: 'currentEmissions', month: state.currentMonth }
      );
      state.resourceEconomy.co2.annualEmissions = Math.max(0, currentEmissions - monthlyReduction);
    }
  }

  // Effect 4: Consumption shift reduces material throughput
  if (cascades.consumptionShift.cascadeActive) {
    const emissionsReduction = assertFinite(
      cascades.consumptionShift.adoptionLevel * cascades.consumptionShift.cascadeStrength * 0.5, // Smaller effect
      { location: 'applySocialCascadeEffects', valueName: 'consumptionEmissionsReduction', month: state.currentMonth }
    );
    cascades.consumptionShift.emissionsReduction = emissionsReduction;

    if (state.resourceEconomy?.co2) {
      const monthlyReduction = emissionsReduction / 12;
      const currentEmissions = assertFinite(
        state.resourceEconomy.co2.annualEmissions,
        { location: 'applySocialCascadeEffects', valueName: 'currentEmissions2', month: state.currentMonth }
      );
      state.resourceEconomy.co2.annualEmissions = Math.max(0, currentEmissions - monthlyReduction);
    }
  }

  // Feedback: Successful cascades boost trust (5-10%)
  const activeCascadeCount = Object.values(cascades).filter(c => c.cascadeActive).length;
  if (activeCascadeCount > 0 && state.socialAccumulation?.socialCohesion) {
    const trustBoost = assertFinite(
      activeCascadeCount * 0.5, // 0.5 points per active cascade per month
      { location: 'applySocialCascadeEffects', valueName: 'trustBoost', month: state.currentMonth }
    );
    state.socialAccumulation.socialCohesion.trust = Math.min(
      100,
      state.socialAccumulation.socialCohesion.trust + trustBoost
    );
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
  console.log(`     Active cascades: ${ptp.activeTechCascades}`);
  console.log(`     Adoption acceleration: ${ptp.adoptionAcceleration.toFixed(2)}x baseline`);
  console.log(`     Cumulative emissions reduction: ${ptp.cumulativeEmissionsReduction.toFixed(2)} Gt CO2`);
  console.log(`     Cumulative cost savings: $${ptp.cumulativeCostSavings.toFixed(1)}B`);
}

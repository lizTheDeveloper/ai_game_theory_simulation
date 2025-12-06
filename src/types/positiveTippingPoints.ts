/**
 * Positive Tipping Point Cascades System
 *
 * Research Foundation:
 * - OECD (2025): "Triggering positive tipping points for climate action" (TRL 6-8)
 * - Earth System Dynamics (2024): "Positive cross-system cascades" (TRL 6-7)
 * - Nature Sustainability (2023): "Tipping points in renewable energy" (TRL 8-9)
 *
 * Expected Impact: +5-15% humane utopia rate (prevention via accelerated clean tech adoption)
 *
 * Mechanism: Policy interventions trigger exponential adoption curves for beneficial technologies
 * (solar PV, EVs, heat pumps, wind). Once threshold market share reached (5-20%), self-sustaining
 * growth cascades occur with cross-system reinforcement (learning curves, social contagion).
 */

/**
 * Technology categories that can experience positive tipping cascades
 * Based on empirical observations 2010-2025 (OECD 2025)
 */
export type CascadeTechnologyType =
  | 'solar-pv'           // Solar photovoltaics (2010-2025 cascade observed)
  | 'electric-vehicles'  // EVs (2020-2025 cascade observed)
  | 'wind-power'         // Wind turbines (2005-2020 cascade)
  | 'heat-pumps'         // Heat pump heating (2020-2025 emerging cascade)
  | 'battery-storage';   // Grid batteries (2023-2025 emerging)

/**
 * Policy intervention types that can trigger cascades
 * Research: OECD (2025) - small interventions, large cascade potential
 */
export type CascadePolicyType =
  | 'phase-out-mandate'   // ICE ban, coal retirement (creates certainty)
  | 'feed-in-tariff'      // Guaranteed returns (reduces risk)
  | 'subsidy-program'     // Direct cost reduction
  | 'building-standard'   // Efficiency codes (locks in tech for 20-50 years)
  | 'carbon-pricing';     // Makes alternatives competitive

/**
 * Technology adoption state for cascade-capable technologies
 * Tracks adoption S-curves (slow start → exponential → saturation)
 */
export interface TechnologyAdoption {
  technology: CascadeTechnologyType;

  // Adoption metrics
  marketShare: number;              // [0, 1] Current market penetration
  adoptionRate: number;             // Monthly adoption rate (percentage points/month)

  // Cascade state
  cascadeActive: boolean;           // Is technology in exponential growth phase?
  cascadeTriggeredMonth?: number;   // When cascade began (if triggered)
  cascadeStrength: number;          // [0, 1] Strength of current cascade

  // Cost dynamics (Wright's Law learning curves)
  costPerUnit: number;              // Current cost ($/unit, normalized to 1.0 baseline)
  cumulativeProduction: number;     // Total units produced (for learning curve)
  learningRate: number;             // Cost reduction per doubling (0.20-0.30, NREL)

  // Price parity
  conventionalAlternativeCost: number; // Cost of fossil fuel alternative ($/unit)
  priceParityAchieved: boolean;     // costPerUnit ≤ conventionalAlternativeCost
  priceParity: number;              // [0, 1] Price competitiveness ratio (1 = full parity)

  // Policy support
  supportingPolicies: CascadePolicyType[]; // Active policies for this tech
  policyStrength: number;           // [0, 1] Combined policy support

  // Social dynamics
  visibility: number;               // [0, 1] How visible is adoption? (EVs 0.8, insulation 0.2)
  socialProofStrength: number;      // [0, 1] Early adopter influence
  socialAcceptance: number;         // [0, 1] Social acceptance level
}

/**
 * Triggered positive tipping point event
 * Tracks when cascades begin for validation/analysis
 */
export interface PositiveTippingEvent {
  type: CascadeTechnologyType;
  triggeredMonth: number;
  triggerReason: 'price-parity' | 'policy-intervention' | 'social-threshold' | 'multi-factor';

  // Trigger conditions at time of cascade
  marketShareAtTrigger: number;
  costReductionSincePeak: number;   // How much cheaper than peak cost
  policySupportAtTrigger: number;

  // Expected cascade impact
  expectedDuration: number;         // Months until saturation (60-180, OECD)
  expectedPeakGrowthRate: number;   // Peak adoption rate during cascade

  // Cross-system effects
  environmentalImpact: number;      // Expected emissions reduction
  economicImpact: number;           // Expected cost savings
  socialImpact: number;             // Expected social adoption boost
}

/**
 * Cross-technology synergies (circular economy loops)
 * Example: EV batteries + grid batteries → shared learning curve
 * Research: Earth System Dynamics (2024)
 */
export interface TechnologySynergy {
  technologies: CascadeTechnologyType[];
  synergyType: 'shared-manufacturing' | 'infrastructure-sharing' | 'cost-reduction' | 'network-effect';
  synergyStrength: number;          // [0, 1] Strength of reinforcement

  // Learning curve synergy (Wright's Law applied across technologies)
  combinedProduction?: number;      // Total production across synergistic techs
  crossTechCostReduction?: number;  // Cost reduction from combined learning
}

/**
 * Social tipping cascade types
 * Research: Lenton et al. 2022, Alkemade et al. 2024
 */
export type CascadeSocialType =
  | 'renewable-energy-norms'    // Solar/wind become culturally normalized
  | 'policy-climate-action'     // Political will for climate policy
  | 'behavioral-conservation'   // Energy/resource conservation behaviors
  | 'consumption-shift';        // Low-carbon lifestyle adoption

/**
 * Social tipping cascade state
 * Models behavioral contagion, policy cascades, and cultural transformations
 * that accelerate decarbonization through human behavior change, not just tech
 */
export interface SocialTippingAdoption {
  cascadeType: CascadeSocialType;

  // Adoption metrics (0-1)
  adoptionLevel: number;          // % population engaged
  adoptionRate: number;           // Monthly change rate

  // Cascade dynamics
  cascadeActive: boolean;
  cascadeStrength: number;        // 0-1 intensity
  cascadeTriggeredMonth?: number;

  // Drivers
  trustLevel: number;             // From state.socialAccumulation.socialCohesion.trust (0-100)
  policySupport: number;          // Government backing
  mediaVisibility: number;        // Public awareness (0-1)
  socialProofStrength: number;    // Neighbor effect

  // Effects
  technologyAcceleration: number; // Multiplier for tech adoption (1.0 = neutral)
  emissionsReduction: number;     // Direct behavioral impact (GtCO2/yr)
  politicalCapital: number;       // Enables stronger future policies
}

/**
 * Main positive tipping points system state
 */
export interface PositiveTippingPointsState {
  // Technology tracking
  adoptionTracking: {
    solarPV: TechnologyAdoption;
    electricVehicles: TechnologyAdoption;
    windPower: TechnologyAdoption;
    heatPumps: TechnologyAdoption;
    batteryStorage: TechnologyAdoption;
  };

  // Cascade events
  triggeredCascades: PositiveTippingEvent[];
  activeTechCascades: number;       // Count of currently active technology cascades

  // Cross-system synergies
  synergies: TechnologySynergy[];

  // Policy interventions
  activePolicies: {
    policy: CascadePolicyType;
    targetTechnologies: CascadeTechnologyType[];
    strength: number;               // [0, 1] Policy effectiveness
    implementedMonth: number;
    costPerMonth: number;           // $B/month budget requirement
  }[];

  // Social tipping cascades (M-6)
  socialCascades: {
    renewableNorms: SocialTippingAdoption;
    policyClimateAction: SocialTippingAdoption;
    behavioralConservation: SocialTippingAdoption;
    consumptionShift: SocialTippingAdoption;
  };

  // Impact metrics
  cumulativeEmissionsReduction: number;   // Gt CO2 prevented
  cumulativeCostSavings: number;          // $B saved vs fossil baseline
  adoptionAcceleration: number;           // Multiplier vs business-as-usual (1.0 = BAU)

  // Social norm cascades (M-6: Broader social tipping dynamics)
  // Research: Otto et al. 2020, social norm tipping at 25-30% critical mass
  socialNorms: {
    climateConcernLevel: number;          // [0, 1] Public support for climate action
    normTippingCrossed: boolean;          // True when crossed 25-30% critical mass
    normCascadeActive: boolean;           // True when in rapid norm shift phase
    normCascadeTriggeredMonth?: number;   // When norm cascade began
    normInfluenceRate: number;            // Monthly rate of norm spreading (0.005-0.02)
  };

  // Political will tipping (M-6: Policy lock-in dynamics)
  // Research: Otto et al. 2020, policy ratcheting and lock-in
  politicalWill: {
    aggregatePolicyStrength: number;      // [0, 1] Combined climate policy stringency
    lockInThresholdCrossed: boolean;      // True when policies become hard to reverse
    politicalMomentum: number;            // [0, 1] Rate of policy strengthening
    backlashRisk: number;                 // [0, 1] Risk of policy reversal
    coalitionStrength: number;            // [0, 1] Political coalition supporting action
  };

  // Research parameters (OECD 2025, Nature Sustainability 2023)
  parameters: {
    // Cascade thresholds (market share to trigger exponential growth)
    cascadeThresholdMin: number;    // 0.05 (5% minimum threshold)
    cascadeThresholdMax: number;    // 0.20 (20% maximum threshold, varies by tech)

    // Cascade dynamics
    cascadeMultiplierMin: number;   // 1.5x (minimum growth acceleration)
    cascadeMultiplierMax: number;   // 2.4x (maximum growth acceleration)
    cascadeDurationMin: number;     // 60 months (5 years minimum)
    cascadeDurationMax: number;     // 180 months (15 years maximum)

    // Learning curves (Wright's Law, NREL)
    learningRateMin: number;        // 0.20 (20% cost reduction per doubling)
    learningRateMax: number;        // 0.30 (30% cost reduction per doubling)

    // Social contagion
    visibilityImpact: number;       // 0.3 (30% boost from high visibility)
    earlyAdopterInfluence: number;  // 0.2 (20% adoption boost from social proof)

    // M-6: Social norm tipping parameters (Otto et al. 2020)
    normTippingThreshold: number;   // 0.25-0.30 (25-30% critical mass)
    normCascadeMultiplier: number;  // 2.0x (influence spreading acceleration)
    normCascadeDuration: number;    // 60-180 months (5-15 years)

    // M-6: Political will tipping parameters (Otto et al. 2020)
    politicalLockInThreshold: number;   // 0.40-0.50 (40-50% policy strength)
    policyRatchetRate: number;          // 0.015 (1.5%/month momentum increase)
    backlashThreshold: number;          // 0.30 (30% risk triggers reversal pressure)
  };
}

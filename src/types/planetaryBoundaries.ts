/**
 * Planetary Boundaries System (TIER 3.1)
 *
 * Kate Raworth's Doughnut Economics framework + Stockholm Resilience Centre
 *
 * "It's not about the 'worst' crisis - it's about cascading, reinforcing feedback
 * loops between boundaries. Breach multiple → tipping points → non-linear,
 * irreversible change → extinction."
 *
 * Research backing:
 * - Stockholm Resilience Centre (2023-2025): 7 of 9 boundaries breached
 * - PIK Potsdam (Sept 2025): Ocean acidification 7th boundary breached
 * - Kate Raworth (2012-2025): Doughnut Economics framework
 *
 * @see plans/kate-raworth-planetary-boundaries-research.md
 */

/**
 * Planetary Boundary Names
 *
 * The 9 boundaries that define Earth's "safe operating space" for humanity.
 * Two are "core boundaries" that interact with all others.
 */
export type BoundaryName =
  | 'climate_change'              // Core boundary
  | 'biosphere_integrity'         // Core boundary
  | 'land_system_change'
  | 'freshwater_change'
  | 'biogeochemical_flows'
  | 'novel_entities'
  | 'ocean_acidification'
  | 'stratospheric_ozone'
  | 'atmospheric_aerosols';

/**
 * Boundary Status
 *
 * Determines whether a boundary is within safe limits or has been breached.
 */
export type BoundaryStatus =
  | 'safe'                 // Within safe zone
  | 'increasing_risk'      // Approaching boundary
  | 'beyond_boundary'      // Breached but not yet high risk
  | 'high_risk';           // Far beyond boundary, dangerous zone

/**
 * Boundary Trend
 *
 * Direction of change over time.
 */
export type BoundaryTrend =
  | 'improving'            // Getting better (e.g., ozone layer)
  | 'stable'               // No significant change
  | 'worsening';           // Getting worse (most boundaries)

/**
 * Individual Planetary Boundary
 *
 * Tracks one of the 9 planetary boundaries with current value, safe limit,
 * and trend information.
 */
export interface PlanetaryBoundary {
  name: BoundaryName;
  displayName: string;              // Human-readable name

  // === QUANTITATIVE METRICS ===
  currentValue: number;             // [0, 2] Current state (1.0 = boundary)
  boundaryThreshold: number;        // Always 1.0 (normalized)
  preIndustrialValue: number;       // 0.0 (baseline)
  highRiskThreshold: number;        // 1.3-1.5 (dangerous zone)

  // === STATUS ===
  status: BoundaryStatus;
  trend: BoundaryTrend;
  breachYear: number | null;        // When it was breached (null if safe)
  monthsBreached: number;           // How long has it been breached

  // === CHARACTERISTICS ===
  isCoreBoundary: boolean;          // Climate + Biosphere interact with all
  interactionStrength: number;      // [0, 1] How much affects other boundaries
  reversible: boolean;              // Can we recover? (most are not)
  timescaleYears: number;           // How fast does it change (1-100 years)

  // === EXTINCTION RISK ===
  extinctionContribution: number;   // [0, 1] How much contributes to extinction
  tippingPointRisk: number;         // [0, 1] Risk of irreversible cascade
}

/**
 * Planetary Boundaries System
 *
 * Top-level state tracking all 9 planetary boundaries and their interactions.
 */
export interface PlanetaryBoundariesSystem {
  // === THE 9 BOUNDARIES ===
  boundaries: Record<BoundaryName, PlanetaryBoundary>;

  // === AGGREGATE METRICS ===
  boundariesBreached: number;       // How many beyond safe zone (2025: 7/9)
  boundariesWorsening: number;      // How many getting worse
  boundariesImproving: number;      // How many getting better (2025: 2/9)

  // === TIPPING POINT RISK ===
  tippingPointRisk: number;         // [0, 1] Overall cascade risk
  coreBoundariesBreached: boolean;  // Both climate + biosphere breached?
  cascadeMultiplier: number;        // [1.0, 3.0] Amplification factor

  // === CASCADE EVENT ===
  cascadeActive: boolean;           // Has irreversible cascade begun?
  cascadeStartMonth: number | null; // When cascade triggered
  cascadeSeverity: number;          // [0, 1] How bad is the cascade

  // === HISTORICAL TRACKING ===
  boundariesBreachedHistory: number[]; // Track over time
  tippingPointRiskHistory: number[];   // Track risk evolution

  // === EVENTS ===
  significantEvents: PlanetaryBoundaryEvent[];

  // === TIER 3.2: LAND USE & BIODIVERSITY (Oct 13, 2025) ===
  landUse: LandUseSystem;

  // === TIER 3.3: OZONE RECOVERY (Oct 13, 2025) ===
  ozoneRecovery: OzoneRecoverySystem;
}

/**
 * Planetary Boundary Event
 *
 * Records when boundaries are breached, tipping points reached, etc.
 */
export interface PlanetaryBoundaryEvent {
  month: number;
  type: 'boundary_breached' | 'boundary_recovered' | 'tipping_point_reached'
      | 'cascade_triggered' | 'high_risk_entered';
  boundary: BoundaryName | null;
  description: string;
  impact: string;
  severity: number;                 // [0, 1]
}

/**
 * Tipping Point Cascade Effects
 *
 * What happens when the cascade is triggered.
 */
export interface TippingPointCascade {
  triggered: boolean;
  severity: number;                 // [0, 1] How severe

  // === IMMEDIATE IMPACTS (MONTH 1) ===
  climateStabilityDrop: number;     // -15% immediate
  biodiversityDrop: number;         // -20% immediate
  freshwaterStressSurge: number;    // +25% stress
  oceanAcidificationSurge: number;  // +12% acidification
  pollutionSurge: number;           // +10% pollution

  // === QOL IMPACTS ===
  foodAvailabilityDrop: number;     // -25%
  healthQualityDrop: number;        // -15%
  socialCohesionDrop: number;       // -20%

  // === ONGOING DEGRADATION ===
  monthlyEnvironmentalDecay: number; // -2% per month
  monthlyQoLDecay: number;          // -1.5% per month

  // === EXTINCTION TIMELINE ===
  monthsToExtinction: number;       // 48 months (4 years)
  irreversible: boolean;            // Cannot be stopped once started
}

/**
 * 2025 Baseline Data
 *
 * Real-world status of planetary boundaries as of 2025.
 */
export interface PlanetaryBoundariesBaseline2025 {
  // === BREACHED BOUNDARIES (7/9) ===
  climateChange: { value: number; breachYear: number };           // 1.21 (425 ppm CO2, breached 1990)
  biosphereIntegrity: { value: number; breachYear: number };      // 10.0+ (100-1000x extinction rate, breached 1950)
  landSystemChange: { value: number; breachYear: number };        // 1.17 (62% forest vs 75% needed, breached 2000)
  freshwaterChange: { value: number; breachYear: number };        // 1.15 (breached 2023)
  biogeochemicalFlows: { value: number; breachYear: number };     // 2.94 (3x phosphorus limit, breached 1985)
  novelEntities: { value: number; breachYear: number };           // 1.50 (microplastics, PFAS, breached 2022)
  oceanAcidification: { value: number; breachYear: number };      // 1.05 (breached Sept 2025)

  // === SAFE BOUNDARIES (2/9) ===
  stratosphericOzone: { value: number; recovering: boolean };     // 0.85 (improving!)
  atmosphericAerosols: { value: number; regional: boolean };      // 0.70 (mostly safe)
}

/**
 * TIER 3.2: Land Use & Biodiversity Crisis (Oct 13, 2025)
 *
 * Tracks deforestation, extinction rate, and feedback loops.
 *
 * Research backing:
 * - FAO (2025): 62% global forest cover vs 75% safe boundary
 * - IPBES (2024): 100-1000x natural extinction rate
 * - Nature (2024): Deforestation → carbon sink loss → climate acceleration
 * - Science (2023): Habitat loss → biodiversity crisis → ecosystem collapse
 */
export interface LandUseSystem {
  // === FOREST COVER ===
  forestCoverPercent: number;       // [0, 100] % of land area forested
  forestCoverSafe: number;          // 75% safe boundary
  deforestationRate: number;        // % per month lost
  reforestationRate: number;        // % per month gained

  // === EXTINCTION RATE ===
  currentExtinctionRate: number;    // [1, 1000] x baseline (natural = 1.0)
  naturalExtinctionRate: number;    // 1.0 baseline (10 extinctions per million species-years)
  extinctionAcceleration: number;   // Rate of change

  // === HABITAT LOSS ===
  habitatLossPercent: number;       // [0, 100] % habitat destroyed
  criticalEcosystemsLost: number;   // Count of collapsed ecosystems

  // === FEEDBACK AMPLIFIERS ===
  carbonSinkLossMultiplier: number; // [1.0, 3.0] Climate acceleration from deforestation
  ecosystemCollapseRisk: number;    // [0, 1] Risk of cascading food web breakdown
}

/**
 * TIER 3.3: Ozone Recovery System (Oct 13, 2025)
 *
 * Tracks stratospheric ozone recovery from Montreal Protocol.
 * This is the ONLY planetary boundary that's improving - a policy success story!
 *
 * Research backing:
 * - WMO (Sept 2025): Ozone recovery confirmed
 * - NOAA/NASA (Oct 2024): Full recovery by 2066
 * - MIT (March 2025): Healing is direct result of Montreal Protocol
 * - Copernicus (March 2025): Ozone hole may disappear by 2066
 * - Nature (2025): Near-future rocket launches could slow recovery
 */
export interface OzoneRecoverySystem {
  // === OZONE LEVELS ===
  stratosphericO3DobsonUnits: number;  // [220, 320] Dobson Units (baseline: 290)
  ozoneHoleSize: number;               // [0, 30] million km² (2024: 7th smallest since 1992)
  recoveryProgress: number;            // [0, 1] 0 = worst (1980s), 1 = fully recovered

  // === MONTREAL PROTOCOL SUCCESS ===
  cfcPhaseOutPercent: number;          // [0, 100] % CFCs eliminated
  halonPhaseOutPercent: number;        // [0, 100] % halons eliminated
  complianceRate: number;              // [0, 1] International compliance
  policyEffectiveness: number;         // [0, 1] How well it's working

  // === RECOVERY TIMELINE ===
  targetRecoveryYear: number;          // 2066 (NOAA/NASA estimate)
  yearsToRecovery: number;             // Remaining years
  isRecovering: boolean;               // True = improving trend

  // === NEW THREATS ===
  rocketLaunchImpact: number;          // [0, 0.3] % ozone loss from rockets
  solidRocketMotorChlorine: number;    // [0, 1] Chlorine emissions from launches
  blackCarbonImpact: number;           // [0, 1] Warming effect from rocket exhaust

  // === POLICY INSPIRATION ===
  demonstratesInternationalCooperation: boolean; // True = proof treaties can work!
  reversibilityExample: boolean;                 // True = shows recovery is possible
}


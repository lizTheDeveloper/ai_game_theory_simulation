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

  // === TIER 3.4: EARLY WARNING SYSTEMS (Oct 17, 2025) ===
  // Research: TipESM (2020-2024), IPCC AR6 WG1 (2023), Nature Climate Change (2024)
  // Detection window: 0.8-0.95 of critical threshold (6-24 months warning)
  // Intervention effectiveness: 60-80% success rate during "golden hour"
  earlyWarning?: EarlyWarningSystem;
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

/**
 * TIER 3.4: Early Warning System for Tipping Points (Oct 17, 2025)
 *
 * Detects approaching tipping points using critical slowing down indicators,
 * enabling emergency interventions during "golden hour" window (0.8-0.95 threshold).
 *
 * Research backing:
 * - TipESM Project (2020-2024): Early warning indicators for tipping points, TRL 7
 * - IPCC AR6 WG1 (2023): Tipping point detection methodologies, TRL 8
 * - Nature Climate Change (2024): Critical infrastructure cascades detectable 1-5 years in advance
 * - REFIT (2024): Graph coloring framework identifies vulnerable nodes
 *
 * Detection window: 6-24 months before threshold
 * Intervention effectiveness: 60-80% during golden hour (0.8-0.95)
 * Prevention effectiveness: 10-100x better than post-crisis recovery
 */
export interface EarlyWarningSystem {
  // === ACTIVE WARNINGS ===
  activeWarnings: TippingPointEarlyWarning[];

  // === DETECTION QUALITY ===
  // Scales with government investment in monitoring systems (0.3-0.9)
  detectionQuality: number;              // [0.3, 0.9] Based on monitoring infrastructure investment
  falsePositiveRate: number;             // [0, 0.4] Rate of false alarms (TipESM: <30% acceptable)
  falseNegativeRate: number;             // [0, 0.3] Rate of missed warnings (more dangerous!)

  // === INTERVENTION TRACKING ===
  interventionsDeployed: EmergencyIntervention[];
  interventionsSuccessful: number;       // Count of successful interventions
  interventionsFailed: number;           // Count of failed interventions

  // === GOLDEN HOUR METRICS ===
  goldenHourInterventions: number;       // Interventions deployed during 0.8-0.95 window
  lateInterventions: number;             // Interventions deployed after 0.95 (less effective)

  // === CRITICAL INFRASTRUCTURE ===
  criticalNodes: CriticalInfrastructureNode[];
  nodesProtected: number;                // Count of hardened nodes
  cascadeRiskReduction: number;          // [0, 1] Reduction in cascade probability
}

/**
 * Tipping Point Early Warning
 *
 * Tracks a specific boundary approaching critical threshold.
 * Uses TipESM critical slowing down indicators + IPCC methodologies.
 */
export interface TippingPointEarlyWarning {
  boundaryName: BoundaryName;            // Which boundary is at risk
  currentLevel: number;                  // [0, 2] Current boundary value
  detectionThreshold: number;            // [0.8, 0.95] When warning triggers

  // === CRITICAL SLOWING DOWN INDICATORS (TipESM) ===
  autocorrelation: number;               // [0, 1] Recovery time increases near tipping point
  variance: number;                      // [0, 1] Fluctuations increase
  flickering: number;                    // [0, 1] Oscillations between states

  // === IPCC INDICATORS ===
  modelDisagreement: number;             // [0, 1] Ensemble model spread
  rateOfChange: number;                  // [0, 1] Acceleration metric

  // === WARNING CLASSIFICATION ===
  warningLevel: 'yellow' | 'orange' | 'red';
  monthsUntilCritical: number;           // Estimated time to irreversibility (6-24 months)

  // === INTERVENTION STATUS ===
  interventionDeployed: boolean;
  interventionMonth: number | null;
  interventionType: string | null;
}

/**
 * Emergency Intervention
 *
 * Government response to early warning signal.
 * Maps tipping points to specific interventions.
 */
export interface EmergencyIntervention {
  tippingPoint: BoundaryName;
  type: string;                          // e.g., 'rapid-decarbonization', 'ocean-alkalinity-enhancement'
  deployedMonth: number;
  warningLevel: 'yellow' | 'orange' | 'red';

  // === RESOURCE COSTS ===
  gdpCost: number;                       // % of GDP (0.02-0.05 typical)
  deploymentTime: number;                // Months to full deployment (6-12 typical)

  // === EFFECTIVENESS ===
  effectiveness: number;                 // [0.5, 0.8] Probability of preventing crossing
  actualSuccess: boolean | null;         // null = in progress, true/false = outcome known

  // === ACTIONS ===
  actions: string[];                     // Specific interventions deployed
}

/**
 * Critical Infrastructure Node
 *
 * Uses graph coloring framework (REFIT 2024) to identify critical nodes.
 * 5-15% of nodes control 80% of cascades.
 */
export interface CriticalInfrastructureNode {
  id: string;
  type: 'water' | 'energy' | 'food' | 'climate' | 'biodiversity';
  betweennessCentrality: number;         // [0, 1] Network importance (graph theory metric)

  // === PROTECTION STATUS ===
  protected: boolean;
  resilience: number;                    // [0, 1] Failure threshold (increases with protection)
  redundancy: number;                    // [0, 1] Backup capacity

  // === CASCADE PREVENTION ===
  cascadeMultiplier: number;             // [0.7, 1.0] How much this node reduces cascade risk
}


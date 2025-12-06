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

  // === RECOVERY TRACKING (Ecological Recovery System - Oct 21, 2025) ===
  // Research: planetary_boundary_reversibility_empirical_20251020.md (20+ sources)
  // 3-tier system: Tier 1 (reversible), Tier 2 (partial), Tier 3 (irreversible)
  recoveryMonths: number;          // Months of sustained improvement (0 if degrading)
  partialRecovery?: boolean;        // True for partial recovery state (land system: tree cover vs ecosystem)
  stabilizing?: boolean;            // True if deterioration stopped (biosphere: extinction rate declining)
  surfaceRecovered?: boolean;       // True for surface recovery only (ocean acidification: surface vs deep)
  inputsStopped?: boolean;          // True if new pollution stopped (novel entities: PFAS/microplastics)

  // === IRREVERSIBLE FLOOR TRACKING (Novel Entities Redesign - Nov 13, 2025) ===
  // Research: Cousins 2022, Kane 2022, Ling 2024
  // Track peak contamination to enforce 90% irreversible floor (atmospheric distribution + covalent binding)
  peakValue?: number;              // Maximum contamination reached (for novel entities 90% irreversible)

  // === IRREVERSIBILITY FRAMEWORK (Nov 16, 2025) ===
  // Extended mechanics for legacy stock release and asymptotic recovery
  // Used for novel entities (PFAS), biosphere integrity (extinction debt), etc.
  peak?: number;                   // Historical peak value (for irreversible floor calculations)
  legacyStock?: number;            // Accumulated pollutants (e.g., PFAS: 46,000 Mt)
  recoveryHalfLife?: number;       // Years for half-life decay (e.g., 75 years Montreal Protocol analog)
  irreversible?: boolean;          // Whether boundary has irreversible component (vs reversible)
  minimumAsymptoticValue?: number; // Floor value that can't be improved past (e.g., 0.15 = 15% floor)
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
  compoundClimateAmplifier: number; // [1.0, 3.0] Amplification factor from compound tipping events

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

  // === INVASIVE SPECIES IMPACT (Oct 27, 2025) ===
  // Research: IPBES (2019) - Invasive species responsible for ~40% of modern extinctions
  // Economic damage: $423 billion/year globally (2019 estimate)
  // Contributes to biosphere_integrity boundary breach
  // Tech: "Invasive Species Control" reduces this via gene drives, precision targeting
  invasiveSpeciesImpact: number;  // [0, 1] 0 = no impact, 1 = catastrophic

  // === LEGACY NUTRIENT STOCKS (TIER 2 HIGH - Nov 15, 2025) ===
  // Research: Lake Erie case study, soil nitrogen residence times
  // Tracks accumulated nutrients in environmental reservoirs (soil, sediment)
  // Key mechanic: Legacy release explains why nutrient reduction takes decades
  legacyNutrientStock?: LegacyNutrientStock;

  // === REGIONAL NITROGEN MANAGEMENT (TIER 2 HIGH - Nov 15, 2025) ===
  // Research: Science Advances (2024) - 55% South Asian rice overuse
  // Regional differentiation: overuse zones vs underuse zones
  // Key mechanic: Nitrogen reduction impacts vary by region
  regionalNitrogenManagement?: RegionalNitrogenManagement[];

  // === GLOBAL FOOD PRODUCTION INDEX (TIER 2 HIGH - Nov 20, 2025) ===
  // Computed by NitrogenFoodCouplingPhase, consumed by PlanetaryBoundariesPhase
  // Prevents race condition from calling updateNitrogenFoodCoupling() multiple times
  // Range: [0, 2] where 1.0 = baseline food production
  // Lower values indicate nitrogen constraint penalties on crop yields
  globalFoodProductionIndex?: number;

  // === NOVEL ENTITIES BOUNDARY INCREMENTAL IMPACTS (HIGH-1 - Nov 20, 2025) ===
  // Single-owner pattern: Other phases write increments here, PlanetaryBoundariesPhase reads and applies
  // Prevents race condition from multiple phases writing to boundaries.novel_entities.currentValue
  novelEntitiesIncrementalImpact?: number; // Cumulative delta to add this step (reset each step)
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
/**
 * Regional Biome Data (Oct 22, 2025)
 *
 * Tracks habitat and biodiversity for a specific biome type.
 * Different biomes have different baseline conditions, restoration rates, and biodiversity impacts.
 */
export interface RegionalBiome {
  // === FOREST/HABITAT COVER ===
  habitatCoverPercent: number;      // [0, 100] % of region with natural habitat
  habitatCoverSafe: number;         // Safe boundary (varies by biome)
  habitatLossRate: number;          // % per month lost (deforestation, conversion)
  habitatRestorationRate: number;   // % per month restored

  // === EXTINCTION RATE (regional contribution) ===
  extinctionRate: number;           // [1, 1000] x baseline for this biome
  extinctionAcceleration: number;   // Rate of change in this region
  biodiversityWeight: number;       // [0, 1] How much this biome contributes to global extinction (tropical = 0.5)

  // === ECOSYSTEM STATE ===
  ecosystemsLost: number;           // Count of collapsed ecosystems in this region
  ecosystemCollapseRisk: number;    // [0, 1] Risk of further collapses

  // === RESTORATION PARAMETERS (biome-specific) ===
  restorationDifficulty: number;    // [0.5, 2.0] How hard it is to restore (tropical = 2.0, temperate = 1.0)
  climateVulnerability: number;     // [0, 1] Susceptibility to climate change
}

/**
 * Land Use System (Oct 22, 2025 - REGIONALIZED)
 *
 * Tracks regional biodiversity and habitat across 4 major biome types.
 * Global metrics are AGGREGATED from regional data, weighted by biodiversity importance.
 */
export interface LandUseSystem {
  // === REGIONAL BIOMES (Oct 22, 2025) ===
  regions: {
    tropical: RegionalBiome;        // Amazon, Congo, SE Asia (50% of global biodiversity)
    temperate: RegionalBiome;       // N America, Europe, E Asia (20% of global biodiversity)
    grasslands: RegionalBiome;      // Savanna, prairie, steppe (20% of global biodiversity)
    borealArctic: RegionalBiome;    // Taiga, tundra (10% of global biodiversity)
  };

  // === GLOBAL AGGREGATES (derived from regions) ===
  globalHabitatCoverPercent: number;        // Weighted average across regions
  globalExtinctionRate: number;             // Weighted sum of regional rates
  globalExtinctionAcceleration: number;     // Average acceleration
  globalEcosystemsLost: number;             // Total collapsed ecosystems
  globalEcosystemCollapseRisk: number;      // Highest regional risk

  // === GLOBAL CONSTANTS ===
  naturalExtinctionRate: number;            // 1.0 baseline (10 extinctions per million species-years)
  carbonSinkLossMultiplier: number;         // [1.0, 3.0] Climate feedback from deforestation
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

/**
 * Biosphere Integrity Index (BII) - TIER 3.5 Climate Mortality Phase 2
 *
 * Comprehensive species tracking and extinction modeling.
 *
 * Research backing:
 * - Natural History Museum (2024): Biodiversity Intactness Index v2.1.1
 *   - PREDICTS project data: 54,000+ species (plants, fungi, animals, insects)
 *   - https://www.nhm.ac.uk/our-science/services/data/biodiversity-intactness-index.html
 * - Richardson et al. (2024): 6 of 9 planetary boundaries breached
 * - Yoder et al. (2024): Joshua Tree climate tracking failure
 * - U.S. National Park Service (2024): Climate velocity impacts
 *
 * CITATION CORRECTION (Nov 6, 2025):
 * - Previous citation to "IPBES (2024)" for 54,000 species baseline was INCORRECT
 * - IPBES 2024 reports do NOT contain biodiversity baseline statistics
 * - Correct source: Natural History Museum BII v2.1.1 (PREDICTS project)
 *
 * Key insight: Non-migratory species CANNOT track climate velocity
 *
 * @see research/climate-mortality-biosphere-multiparadigm-framework_20251028.md (Section 2)
 * @see research/climate-phase2-source-verification-20251106.md (Citation verification)
 */

/**
 * Species group with climate tracking characteristics
 *
 * Research: Yoder et al. (2024) - Joshua Tree example
 * - Climate velocity: 1.5°C/year (how fast climate zones move)
 * - Dispersal capacity: 0.4 m/year (seed dispersal distance)
 * - Result: CANNOT TRACK → extinction trajectory
 */
export interface SpeciesGroup {
  name: string;
  count: number;                        // Number of species in group
  extinctionRate: number;               // E/MSY (extinctions per million species-years)
  isMigratory: boolean;                 // Can track climate velocity?
  dispersalCapacity: number;            // m/year (if not migratory)
  isKeystone: boolean;                  // Affects other species?
  keystoneMultiplier: number;           // Cascade effect on other species
  habitatFragmentation: number;         // [0, 1] barrier to movement
}

/**
 * Biosphere Integrity Index
 *
 * Tracks species extinction rates and climate tracking failure.
 * Extends planetary boundary framework with detailed species modeling.
 */
export interface BiosphereIntegrityIndex {
  // === NATURAL HISTORY MUSEUM BII v2.1.1 (2024) ===
  // PREDICTS project: 54,000+ species (plants, fungi, animals, insects)
  totalSpeciesBaseline: 54000;          // Comprehensive species count
  currentSpeciesCount: number;          // Current surviving species

  // === EXTINCTION RATES (E/MSY) ===
  backgroundExtinctionRate: 0.1;        // Natural rate (1 per 10M species-years)
  currentExtinctionRate: number;        // Actual rate (100-1000× background in 2025)

  // === SPECIES GROUPS ===
  migratorySpecies: SpeciesGroup;       // Birds, butterflies - CAN track climate
  nonMigratorySpecies: SpeciesGroup;    // Trees, alpine species - CANNOT track
  keystoneSpecies: SpeciesGroup;        // Critical ecosystem engineers

  // === CLIMATE TRACKING ===
  avgClimateVelocity: number;           // °C/year (how fast climate zones move)
  trackingFailureRate: number;          // [0, 1] proportion unable to track

  // === PLANETARY BOUNDARY INTEGRATION ===
  boundaryValue: number;                // [0, 2] normalized to boundary threshold
  tippingPointRisk: number;             // [0, 1] risk of irreversible collapse

  // === EXAMPLES (for validation) ===
  // Joshua Tree: 1.5°C/year velocity, 0.4m/year dispersal → EXTINCTION
  // Alpine species: No "higher" elevation → TRAPPED → EXTINCTION
  // Island endemics: No adjacent habitat → ISOLATED → EXTINCTION
}

/**
 * Legacy Nutrient Stock (TIER 2 HIGH - Nov 15, 2025)
 *
 * Tracks accumulated nutrients in environmental reservoirs.
 * Research: Lake Erie internal loading = 10,000-11,000 MT P/year
 *
 * @see research/nitrogen_food_coupling_20251115.md
 */
export interface LegacyNutrientStock {
  soil: {
    nitrogen: number;      // Mt N accumulated in soil
    phosphorus: number;    // Mt P accumulated in soil
    halfLife: number;      // Years for half-life decay (~30 years)
  };
  sediment: {
    nitrogen: number;      // Mt N in aquatic sediments
    phosphorus: number;    // Mt P in aquatic sediments
    halfLife: number;      // Years for half-life decay (~100 years)
  };
  atmosphericDeposition: number;  // Mt N/year from atmospheric transport
  // HIGH-1 FIX (Nov 20, 2025): Store effective pollution values for planetary boundaries to read
  effectiveNitrogen?: number;    // Mt N/month (current inputs + legacy releases)
  effectivePhosphorus?: number;  // Mt P/month (current inputs + legacy releases)
}

/**
 * Regional Nitrogen Management (TIER 2 HIGH - Nov 15, 2025)
 *
 * Tracks nitrogen use and food production impacts by region.
 * Research: Science Advances (2024) - 55% South Asian rice overuse
 *
 * Key insight: Overuse zones can reduce N with NO yield penalty.
 *
 * @see research/nitrogen_food_coupling_20251115.md
 */
export interface RegionalNitrogenManagement {
  region: string;                    // Region identifier (southAsia, eastAsia, etc.)
  currentNitrogenInput: number;      // Mt N/year current use
  optimalNitrogenInput: number;      // Mt N/year optimal (no waste)
  overusePercentage: number;         // [0, 1] Fraction of overuse (0.55 = 55% excess)
  deployedTechnologies: string[];    // Tech IDs deployed in this region
  yieldImpact: number;               // [-1, 1] Yield change from N reduction (negative = penalty)
  foodProductionIndex: number;       // [0, 2] Food production multiplier (1.0 = baseline)
}

/**
 * BII constants from research
 *
 * Research sources:
 * - Natural History Museum (2024): BII v2.1.1 - Species baseline (54,000+ from PREDICTS)
 * - Richardson et al. (2024): Current extinction rates
 * - Yoder et al. (2024): Climate tracking examples
 *
 * CITATION CORRECTION (Nov 6, 2025):
 * - Previous: "IPBES (2024): Species baseline" [INCORRECT]
 * - Correct: Natural History Museum BII v2.1.1 (2024) - PREDICTS project data
 */
export const BII_CONSTANTS = {
  // === SPECIES BASELINE (Natural History Museum BII v2.1.1, 2024) ===
  TOTAL_SPECIES_2024: 54000,

  // === EXTINCTION RATES (E/MSY) ===
  BACKGROUND_RATE: 0.1,                 // Natural background rate
  CURRENT_RATE_2025: 10,                // 100× background (conservative)
  HIGH_RISK_RATE: 100,                  // 1000× background (worst case)

  // === CLIMATE TRACKING ===
  // Research: Yoder et al. (2024) - Joshua Tree
  JOSHUA_TREE_CLIMATE_VELOCITY: 1.5,    // °C/year
  JOSHUA_TREE_DISPERSAL: 0.0004,        // km/year (0.4 m/year)

  // Average climate velocities by region
  AVG_CLIMATE_VELOCITY_TROPICS: 0.3,    // °C/year (slower)
  AVG_CLIMATE_VELOCITY_TEMPERATE: 0.8,  // °C/year (moderate)
  AVG_CLIMATE_VELOCITY_ARCTIC: 2.0,     // °C/year (fastest)

  // === KEYSTONE SPECIES ===
  // Research: Ecology literature - keystone species affect 2-5× other species
  KEYSTONE_CASCADE: 2.5,                // Average cascade multiplier

  // === HABITAT FRAGMENTATION ===
  // Research: Conservation biology - fragmentation increases mortality 1.2-2.0×
  FRAGMENTATION_BARRIER_MAX: 1.5,       // Up to 1.5× mortality increase

  // === SPECIES GROUP PROPORTIONS ===
  MIGRATORY_PROPORTION: 0.15,           // ~15% can migrate (birds, butterflies)
  NON_MIGRATORY_PROPORTION: 0.80,       // ~80% cannot migrate (most species)
  KEYSTONE_PROPORTION: 0.05,            // ~5% are keystone species

  // === DISPERSAL CAPACITIES (km/year) ===
  BIRD_DISPERSAL: 1000,                 // Birds: 1000+ km/year
  MAMMAL_DISPERSAL: 10,                 // Mammals: ~10 km/year
  TREE_DISPERSAL: 0.5,                  // Trees: 0.1-1 km/year
  ALPINE_DISPERSAL: 0.01,               // Alpine: trapped, 0.01 km/year

  // === PLANETARY BOUNDARY THRESHOLDS ===
  // Biosphere integrity boundary: 1.0 = safe, 10.0 = catastrophic
  SAFE_EXTINCTION_RATE: 1.0,            // 10× background (boundary)
  HIGH_RISK_EXTINCTION_RATE: 10.0,      // 100× background (current)
  CATASTROPHIC_EXTINCTION_RATE: 100.0,  // 1000× background
} as const;


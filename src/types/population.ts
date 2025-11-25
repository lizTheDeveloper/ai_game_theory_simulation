/**
 * Population Dynamics & Refugee Crisis Types (TIER 1.5)
 *
 * Tracks concrete human population (not abstract severity) with:
 * - Birth/death rates affected by QoL, resources, crises
 * - Carrying capacity from environment/tech
 * - Refugee crises triggered by climate/war/famine
 * - Generational resettlement mechanics (25 years)
 * - Population crash vs extinction distinction
 *
 * Research backing:
 * - UN World Population Prospects 2024 (8.0B → 10.4B by 2080)
 * - UNHCR 2024: 110M forcibly displaced
 * - Historical bottlenecks: Toba eruption (~70K BCE) → 3K-10K humans
 * - Minimum viable population: 10K-50K for genetic diversity
 *
 * @see plans/population-dynamics-and-extinction-nuance.md
 */

/**
 * Human Population System (TIER 1.5 - Component 1)
 *
 * Tracks raw human population as concrete number (billions).
 * Population changes based on births, deaths, carrying capacity, and crises.
 *
 * Enables:
 * - Population crashes vs extinction distinction
 * - Recovery mechanics after bottleneck events
 * - Refugee dynamics from climate/war/famine
 * - Civilization collapse thresholds
 */
export interface HumanPopulationSystem {
  // Core population metrics
  population: number;                    // Current population (billions)
  baselinePopulation: number;            // Starting population (2025: 8.0B)
  peakPopulation: number;                // Highest population reached
  peakPopulationMonth: number;           // When peak occurred

  // Growth dynamics
  baselineBirthRate: number;             // [0, 0.025] Natural birth rate per year (2025: ~1.8%)
  baselineDeathRate: number;             // [0, 0.02] Natural death rate per year (2025: ~0.8%)
  adjustedBirthRate: number;             // After social/economic/QoL factors
  adjustedDeathRate: number;             // After healthcare/crisis factors
  netGrowthRate: number;                 // Current net growth per year (can be negative)

  // Carrying capacity
  carryingCapacity: number;              // Maximum sustainable population (billions)
  baselineCarryingCapacity: number;      // Earth's baseline capacity (~10-12B with current tech)
  capacityModifier: number;              // Tech/climate/resource multiplier [0, 5]
  populationPressure: number;            // [0, 2] Ratio of population to capacity

  // Demographic structure (for recovery mechanics)
  fertilityRate: number;                 // [0, 5] Children per woman (2025: ~2.3)
  dependencyRatio: number;               // [0, 2] Non-working to working age ratio
  medianAge: number;                     // [15, 60] Years (affects recovery potential)

  // Crisis impacts
  monthlyExcessDeaths: number;           // Deaths beyond baseline (from war, famine, disease) (MILLIONS)
  cumulativeCrisisDeaths: number;        // Total deaths from all crises (MILLIONS)
  geneticBottleneckActive: boolean;      // Population below 100M (genetic diversity lost)
  birthDefectsCount?: number;            // Cumulative non-fatal birth defects from radiation (billions)

  // P2 Bug Fix: Monthly death cap (Oct 16, 2025)
  monthlyDeathsApplied: number;         // Deaths applied this month (reset each month)
  monthlyDeathCapReached?: boolean;      // Flag if cap was hit (for logging)

  // Bayesian Mortality System (Oct 27, 2025)
  // Accumulated mortality risks throughout the month, resolved at month end
  // Research: /research/mortality_caps_historical_data_20251027.md
  mortalityRisks?: import('../types/bayesianMortality').MortalityRisk[];

  // Multi-dimensional death tracking (TIER 1.5 - Summary Statistics)
  // PROXIMATE CAUSE: What killed them (medical/physical cause of death)
  // UNITS: MILLIONS (Oct 28, 2025 - standardized across all systems)
  deathsByCategory: {
    war: number;                         // Direct combat, weapons (MILLIONS)
    famine: number;                      // Starvation, malnutrition (MILLIONS)
    disasters: number;                   // Heat waves, floods, storms, earthquakes (MILLIONS)
    disease: number;                     // Pandemics, infections, healthcare collapse (MILLIONS)
    ecosystem: number;                   // Ecosystem collapse, pollinator loss (MILLIONS)
    pollution: number;                   // Toxic environment, chemical exposure (MILLIONS)
    ai: number;                          // AI-caused deaths (alignment failure) (MILLIONS)
    cascade: number;                     // Tipping point cascade (Oct 16, 2025) (MILLIONS)
    other: number;                       // Other catastrophes (MILLIONS)
  };

  // ROOT CAUSE: Why it happened (underlying driver of death)
  // Research-backed taxonomy (Diamond 2005, IPBES 2019, Acemoglu & Robinson 2012)
  // UNITS: MILLIONS (Oct 29, 2025 - FIX: Bug #1 - death attribution mismatch)
  deathsByRootCause: {
    // Environmental drivers (4 categories)
    climate: number;                     // Climate change (14% IPBES biodiversity driver) (MILLIONS)
    resource: number;                    // Resource depletion (phosphorus, water) (MILLIONS)
    pollution: number;                   // Toxic contamination (14% IPBES, novel entities) (MILLIONS)
    ecosystem: number;                   // Biodiversity/land use (30% land use + 23% exploitation IPBES) (MILLIONS)

    // Social drivers (3 categories)
    inequality: number;                  // Wealth/power concentration (Piketty, elite capture) (MILLIONS)
    demographic: number;                 // Population/resource imbalance (Malthusian pressure) (MILLIONS)
    social: number;                      // Cultural breakdown/anomie (Durkheim, loss of meaning) (MILLIONS)

    // Technology drivers (2 categories)
    alignment: number;                   // AI misalignment/control loss (MILLIONS)
    disruption: number;                  // Technology displacement (unemployment, obsolescence) (MILLIONS)

    // External shocks (3 categories)
    conflict: number;                    // War/violence (geopolitical, civil, terrorism) (MILLIONS)
    pandemic: number;                    // Disease outbreak (natural or engineered) (MILLIONS)
    natural: number;                     // Natural disasters (asteroids, earthquakes, etc.) (MILLIONS)

    // Compound attribution tracking
    compound: number;                    // Deaths with multiple root causes (WHO PAF methodology) (MILLIONS)

    // Confidence distribution
    confidenceDistribution: {
      HIGH: number;                      // Deaths with HIGH confidence attribution (MILLIONS)
      MEDIUM: number;                    // Deaths with MEDIUM confidence attribution (MILLIONS)
      LOW: number;                       // Deaths with LOW confidence attribution (MILLIONS)
    };
  };

  // Thresholds (for outcomes)
  extinctionThreshold: number;           // Below this = extinction (default: 10,000)
  bottleneckThreshold: number;           // Below this = genetic bottleneck (default: 100M)
  criticalThreshold: number;             // Below this = infrastructure collapse (default: 2B)

  // Recovery tracking
  canRecover: boolean;                   // Population > bottleneck + resources available
  recoveryRate: number;                  // [0, 0.02] Growth rate during recovery
  monthsSinceLastCrisis: number;         // Time since major population shock
  previousActiveCrises?: number;         // Number of active crises last month (for baby boom detection)

  // Regional populations (TIER 1.5 - Phase 5)
  regionalPopulations?: RegionalPopulation[]; // Optional for backward compatibility
}

/**
 * Refugee Crisis System (TIER 1.5 - Component 2)
 *
 * Tracks displaced populations from climate disasters, wars, famines, ecosystem collapse.
 * Refugees create social tension and economic strain on host regions.
 * After 1 generation (~25 years), refugees are considered fully resettled.
 *
 * Oct 20, 2025: Added government-assisted relocation programs
 * Research: FEMA (55K buyouts, $4B, 1993-2025), North Dakota Devils Lake ($1.5B, 600+ homes)
 * Expected impact: Reduces involuntary immobility by 1-5% annually IF funded + political will
 */
export interface RefugeeCrisisSystem {
  // Active crises
  activeRefugeeCrises: RefugeeCrisis[];

  // Global metrics
  totalDisplaced: number;                // Total displaced people (millions)
  totalResettled: number;                // Total successfully resettled (millions)
  cumulativeRefugees: number;            // All refugees across all crises (historical)

  // Social impacts
  globalRefugeeTension: number;          // [0, 1] Average tension across all host regions
  regionalTensions: Map<string, number>; // Region-specific tensions

  // Economic impacts
  resettlementCost: number;              // Monthly cost ($B) to resettle refugees
  economicStrain: number;                // [0, 1] Burden on host economies

  // Policy response
  refugeeAcceptanceRate: number;         // [0, 1] How welcoming are host regions
  bordersOpen: boolean;                  // Are borders open or militarized?
  resettlementPrograms: number;          // [0, 10] Investment in resettlement

  // Government-assisted relocation (Oct 20, 2025)
  governmentRelocation?: GovernmentRelocationProgram;

  // Involuntary immobility tracking (Oct 20, 2025)
  // People who WANT to migrate but CANNOT afford it (poverty trap)
  trappedPopulations?: TrappedPopulationTracking;
}

/**
 * Individual Refugee Crisis
 *
 * Tracks a specific displacement event with source, destinations, and resolution timeline.
 * Crises can last for decades (generational timescale).
 */
export interface RefugeeCrisis {
  id: string;
  cause: 'climate' | 'war' | 'famine' | 'economic' | 'ecosystem' | 'nuclear';
  startMonth: number;
  sourceRegion: string;                  // Where refugees are from
  hostRegions: string[];                 // Where they've fled to

  // Population dynamics
  potentialDisplaced: number;            // Total population at risk (millions)
  remainingInSource: number;             // Still in crisis zone, not yet fled (millions)
  displacedPopulation: number;           // People who have fled (millions)
  currentlyDisplaced: number;            // Still unresettled in transit/camps (millions)
  resettledCount: number;                // Successfully resettled (millions)
  deathsInTransit: number;               // Casualties during displacement (millions)

  // Gradual displacement (3-5 years)
  displacementRate: number;              // Monthly rate: 10% of remaining flee
  displacementDuration: number;          // Expected duration (36-60 months)
  displacementComplete: boolean;         // All who will flee have fled

  // Generational tracking
  generationLength: number;              // ~25 years = 300 months
  monthsActive: number;                  // How long has crisis lasted
  resettlementProgress: number;          // [0, 1] Progress toward full resettlement

  // Effects
  socialTension: number;                 // [0, 1] Tension in host regions
  economicStrain: number;                // [0, 1] Resource burden
  politicalInstability: number;          // [0, 1] Destabilization effect

  // Resolution
  resettlementRate: number;              // People resettled per month (millions)
  baselineResettlementRate: number;      // Natural rate (0.5% of displaced per month)
  acceleratedResettlement: boolean;      // Government program active?
  resolved: boolean;                     // Crisis over?

  // Historical tracking
  peakDisplacement: number;              // Highest number displaced
  duration: number;                      // Total duration if resolved
}

/**
 * Regional Population System (TIER 1.5 - Phase 5)
 *
 * Tracks population by major world regions with differential growth/decline rates.
 * Reflects real-world research: Sub-Saharan Africa growing, East Asia declining.
 */
export interface RegionalPopulation {
  name: string;                          // Region name (e.g., 'Sub-Saharan Africa')
  population: number;                    // Current population (millions)
  peakPopulation: number;                // Highest population reached (millions)
  baselinePopulation: number;            // 2025 baseline for infrastructure scaling (Tainter 1988)

  // Demographics (region-specific)
  baselineBirthRate: number;             // Natural birth rate per year
  baselineDeathRate: number;             // Natural death rate per year
  adjustedBirthRate: number;             // After modifiers
  adjustedDeathRate: number;             // After modifiers
  netGrowthRate: number;                 // Current net growth rate

  // Regional characteristics
  healthcareQuality: number;             // [0, 1] Healthcare infrastructure
  economicStage: number;                 // [0, 4] Economic development stage
  fertilityRate: number;                 // Children per woman
  medianAge: number;                     // Median population age

  // Quality of Life (Oct 26, 2025)
  // Regional QoL calculated from multi-dimensional systems
  // Global QoL = population-weighted average of regional QoL
  qualityOfLife: number;                 // [0, ~1.5] Regional quality of life score

  // Carrying capacity
  carryingCapacity: number;              // Regional capacity (millions)
  baselineCarryingCapacity: number;      // Baseline capacity
  populationPressure: number;            // Ratio of population to capacity

  // Vulnerabilities
  climateVulnerability: number;          // [0, 1] Exposure to climate change
  resourceVulnerability: number;         // [0, 1] Dependence on imports
  conflictRisk: number;                  // [0, 1] War/civil unrest probability

  // Regional food security (Oct 25, 2025)
  // Food insecurity in one region doesn't always propagate to others
  // Research: FAO (2023) - regional food systems vary by trade integration
  foodSecurity: number;                  // [0, 1] Regional food availability & access

  // Crisis impacts
  monthlyExcessDeaths: number;           // Deaths beyond baseline
  cumulativeCrisisDeaths: number;        // Total crisis deaths
  refugeeBurden: number;                 // Hosting refugees (millions)
  emigrationPressure: number;            // People wanting to leave (millions)

  // Mortality stabilizing mechanisms (Oct 30, 2025 - Issues #4, #5, #6)
  // Research: Cavalcanti 2025 (aid), Ballester 2024 (adaptation), IOM 2024 (migration)
  // See: /research/mortality_stabilizing_mechanisms_20251030.md
  mortalityStabilizers?: import('./mortalityStabilizers').RegionalMortalityStabilizers;

  // Famine distribution mechanics (Oct 30, 2025 - Issue #6)
  // Research: Sen 1981 (entitlement theory), Eshetu 2024 (regional heterogeneity)
  // See: /research/famine_distribution_mechanisms_20251030.md
  famineState?: import('./famineDistribution').RegionalFamineState;

  // Resilience factors (Oct 30, 2025 - Issue #5)
  // Research: Keller 2024 (resilience heterogeneity), Scheffer 2014 (bifurcations)
  // See: /research/outcome_variance_mechanisms_20251030.md
  resilienceProfile?: {
    // Individual/Social (Keller et al. 2024)
    socioeconomicStatus: number;    // 0-1 (GDP per capita, inequality)
    socialSupport: number;           // 0-1 (community cohesion, trust)
    emotionRegulation: number;       // 0-1 (mental health, coping capacity)

    // Organizational (Hepfer & Lawrence 2022)
    functionalResilience: number;    // 0-1 (maintain core operations)
    operationalResilience: number;   // 0-1 (adapt operations)
    strategicResilience: number;     // 0-1 (fundamental transformation)

    // Institutional (Manca et al. 2019)
    fiscalBuffers: number;           // 0-1 (reserves, borrowing capacity)
    laborFlexibility: number;        // 0-1 (employment laws, retraining)
    innovationCapacity: number;      // 0-1 (R&D, adaptation speed)

    // Aggregate resilience score
    aggregateResilience: number;     // 0-1 (weighted average)
  };
}

/**
 * Population Status Thresholds (Component 3)
 *
 * Defines clear distinction between population levels.
 * Enables "almost died out" vs "died out entirely" outcomes.
 */
export enum PopulationStatus {
  THRIVING = 'thriving',           // >7B - Normal civilization, growth
  STABLE = 'stable',               // 5-7B - Stable population
  DECLINING = 'declining',         // 2-5B - Population crash, recoverable
  CRITICAL = 'critical',           // 100M-2B - Severe crash, infrastructure failing
  BOTTLENECK = 'bottleneck',       // 10K-100M - Near-extinction, genetic bottleneck
  EXTINCTION = 'extinction'        // <10K - Effectively extinct, game over
}

/**
 * Population Outcome
 *
 * Final population state with narrative description.
 * Used for end-game outcome reporting.
 */
export interface PopulationOutcome {
  status: PopulationStatus;
  finalPopulation: number;           // In billions
  peakPopulation: number;            // Highest reached
  populationDecline: number;         // Percentage lost from peak
  geneticBottleneck: boolean;        // Did we go below 100M?
  civilizationIntact: boolean;       // Can we rebuild?
  outcomeNarrative: string;          // Human-readable outcome
}

/**
 * Root Cause Categories (11 categories, research-backed)
 *
 * Based on collapse literature taxonomy:
 * - Diamond (2005): Environmental, climate, conflict drivers (NOT governance)
 * - IPBES (2019): Direct drivers (land use, exploitation, climate, pollution)
 * - Acemoglu & Robinson (2012): Institutions are endogenous (result, not cause)
 * - Tainter (1988): Complexity/resource exhaustion (governance failure is symptom)
 */
export enum RootCause {
  // ENVIRONMENTAL DRIVERS (Diamond #1-2, IPBES direct drivers)
  climate = 'climate',           // Anthropogenic climate change (14% IPBES biodiversity driver)
  resource = 'resource',         // Resource depletion/planetary boundaries (phosphorus, water)
  pollution = 'pollution',       // Toxic contamination (14% IPBES, novel entities)
  ecosystem = 'ecosystem',       // Biodiversity/land use (30% IPBES land use + 23% exploitation)

  // SOCIAL DRIVERS (Turchin, Acemoglu & Robinson underlying causes)
  inequality = 'inequality',     // Wealth/power concentration (Piketty, elite capture)
  demographic = 'demographic',   // Population/resource imbalance (Malthusian pressure)
  social = 'social',             // Cultural breakdown/anomie (Durkheim, loss of meaning)

  // TECHNOLOGY DRIVERS (modern AI-era additions)
  alignment = 'alignment',       // AI misalignment/control loss
  disruption = 'disruption',     // Technology displacement (unemployment, obsolescence)

  // EXTERNAL SHOCKS (Diamond #3-4, Turchin crisis triggers)
  conflict = 'conflict',         // War/violence (geopolitical, civil, terrorism)
  pandemic = 'pandemic',         // Disease outbreak (natural or engineered)
}

/**
 * Individual root cause attribution with weight and confidence
 */
export interface RootCauseAttribution {
  /**
   * Root cause category
   */
  cause: RootCause;

  /**
   * Weight (0-1, sum of all weights in CompoundCause must = 1.0)
   * Represents normalized Population Attributable Fraction (PAF)
   */
  weight: number;

  /**
   * Confidence level in this attribution
   * - HIGH: RCT/natural experiment/strong observational (nuclear war → deaths)
   * - MEDIUM: Multi-study observational (climate → ecosystem → famine)
   * - LOW: Theoretical/model-based (AI dystopia → governance → deaths)
   */
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';

  /**
   * Optional research citation for this specific cause
   */
  citation?: string;
}

/**
 * Compound Cause Attribution (WHO PAF Methodology)
 *
 * Used when multiple root causes interact with comparable effect sizes (PAF ≥ 25% each).
 * Weights must sum to 1.0 and represent normalized Population Attributable Fractions.
 *
 * Research:
 * - WHO (2024): PAF methodology for multi-cause attribution
 * - Burke et al. (2020): Climate × poverty interaction (23x multiplier)
 * - IPCC AR6: Cascading risks require compound attribution
 *
 * @example
 * // Climate famine in poor region
 * {
 *   causes: [
 *     { cause: RootCause.climate, weight: 0.40, confidence: 'MEDIUM' },
 *     { cause: RootCause.inequality, weight: 0.40, confidence: 'MEDIUM' },
 *     { cause: RootCause.ecosystem, weight: 0.20, confidence: 'MEDIUM' }
 *   ],
 *   evidence: 'Burke et al. (2020) climate-poverty interaction + IPCC AR6 cascades',
 *   mechanism: 'Drought (climate) × poverty (no irrigation) × degraded land (ecosystem) → famine'
 * }
 */
export interface CompoundCause {
  /**
   * Array of root causes with weights (must sum to 1.0)
   * At least 2 causes required, each with PAF ≥ 0.10
   */
  causes: RootCauseAttribution[];

  /**
   * Research citation justifying weight allocation
   */
  evidence: string;

  /**
   * Causal mechanism description (A → B → C → death)
   */
  mechanism?: string;
}

/**
 * Type guard to check if attribution is compound
 */
export function isCompoundCause(
  cause: RootCause | CompoundCause
): cause is CompoundCause {
  return typeof cause === 'object' && 'causes' in cause;
}

/**
 * Government-Assisted Relocation Program (Oct 20, 2025)
 *
 * Models government programs that enable migration for populations trapped by poverty.
 * Based on FEMA buyouts, North Dakota Devils Lake, China ecological migration.
 *
 * Research:
 * - FEMA: 55,000 properties bought out (1993-2025), $4B total, $200K-$450K/household
 * - North Dakota: 600+ homes relocated, $1.5B total, $750K/person effective cost
 * - China: 10M+ people relocated (1983-2025), $4,900/household average
 *
 * Key constraints:
 * - Political will is PRIMARY bottleneck (not funding)
 * - Coverage: <1-5% annually in practice (despite capacity for more)
 * - Cost varies by wealth tier: $150K-$300K (wealthy), $20K-$50K (middle), $5K-$15K (poor)
 */
export interface GovernmentRelocationProgram {
  // Program status
  enabled: boolean;                      // Is program active?
  monthActivated: number;                // When was it started?

  // Budget & capacity
  annualBudget: number;                  // Billions $ per year allocated
  monthlyBudget: number;                 // Billions $ per month (annualBudget / 12)
  cumulativeSpending: number;            // Total spent since program start (billions $)

  // Coverage metrics
  totalRelocated: number;                // Total people relocated via program (millions)
  monthlyRelocated: number;              // People relocated this month (millions)
  eligiblePopulation: number;            // People eligible for relocation (millions)
  coverageRate: number;                  // [0, 1] % of eligible population covered annually

  // Cost parameters (research-backed)
  costPerCapita: {
    wealthy: number;                     // $150K-$300K (property buyouts)
    middle: number;                      // $20K-$50K (relocation assistance)
    poor: number;                        // $5K-$15K (basic support)
  };
  weightedAverageCost: number;           // Weighted average based on population mix

  // Political constraints
  politicalWill: number;                 // [0, 1] Political support for program
  politicalWillModifiers: {
    recentDisaster: number;              // +0.3 for 12-24 months after major disaster
    economicCrisis: number;              // -0.4 during recession
    electionYear: number;                // -0.2 during election year
    publicSupport: number;               // -0.3 to +0.3 based on refugee tension
  };

  // Effectiveness
  successRate: number;                   // [0, 1] % who successfully resettle vs return
  participationRate: number;             // [0, 1] % of eligible who accept offer

  // Social impacts
  trustBonus: number;                    // Trust increase from successful relocations
  resentmentPenalty: number;             // Resentment from failed/inadequate programs
}

/**
 * Trapped Population Tracking (Oct 20, 2025)
 *
 * Models "involuntary immobility" - people who WANT to migrate but CANNOT due to poverty.
 * This is the key finding missing from the original model.
 *
 * Research:
 * - Lake Urmia, Iran: 71.85% migrated early, then immobility dominated late phase
 * - World Bank (2024): Groundwater inaccessibility increases rural poverty 12%
 * - Thalheimer et al. (2024): Trapped populations in informal settlements, refugee camps
 * - Columbia (2025): Water scarcity decreases resources needed to migrate
 *
 * Three types identified (Aghajani-Shahrivar et al. 2024):
 * 1. Ambivalent: Want to migrate AND stay (contradictory aspirations)
 * 2. Precarious: No mobility aspirations (passive helplessness)
 * 3. Voluntary: Choose to stay despite risks
 */
export interface TrappedPopulationTracking {
  // Total trapped populations by cause
  totalTrapped: number;                  // Total trapped (millions)
  trappedByWater: number;                // Water scarcity (millions)
  trappedByClimate: number;              // Climate disasters (millions)
  trappedByEcosystem: number;            // Ecosystem collapse (millions)
  trappedByConflict: number;             // War zones (millions)

  // Wealth tiers (ability to migrate)
  wealthDistribution: {
    canSelfRelocate: number;             // % of population (wealthy, top 30%)
    needAssistance: number;              // % of population (middle, 50%)
    trapped: number;                     // % of population (poor, bottom 20%)
  };

  // Regional breakdown
  regionalTrapped: Map<string, number>;  // Trapped by region (millions)

  // Psychological impact categories (Aghajani-Shahrivar et al. 2024)
  typeBreakdown: {
    ambivalent: number;                  // Want to leave AND stay (millions)
    precarious: number;                  // No aspirations at all (millions)
    voluntary: number;                   // Choose to stay (millions)
  };

  // Social & health impacts
  mentalHealthImpact: number;            // [0, 1] Severity of psychological distress
  socialCohesionImpact: number;          // [0, 1] Community breakdown from inability to leave
  mortalityMultiplier: number;           // [1, 3] Excess mortality from being trapped

  // Migration aspirations vs ability (gap tracking)
  aspiringToMigrate: number;             // People who want to leave (millions)
  ableToMigrate: number;                 // People who can afford to leave (millions)
  mobilityGap: number;                   // aspiringToMigrate - ableToMigrate (millions)
}

/**
 * International Migration Flows (Phase 8 - Hindcast Calibration, Nov 25 2025)
 *
 * Models net migration between regions for 2010-2020 hindcast accuracy.
 * Research: PNAS 2022 Bayesian bilateral flow model (Azose & Raftery),
 *           UN WPP 2024 probabilistic migration projections,
 *           UNHCR Syrian refugee crisis data.
 *
 * Target: Reduce 2010-2020 population overshoot from 6-10% to <3%
 * Mechanism: 25M net migration 2010-2020 explains 83% of 2010 overshoot (25M / 30M)
 *
 * Historical mode: 2010-2020 only (deterministic flows based on year)
 * Unprecedented mode: Post-2020 climate-driven migration (not yet implemented)
 */
export interface MigrationFlows {
  // Annual net migration by region (MILLIONS per year)
  // Positive = net immigration, Negative = net emigration

  // Immigration destinations
  northAmerica: number;           // US + Canada (~1.5M/yr baseline)
  westernEurope: number;          // Germany, UK, France (~0.8M/yr pre-Syria, +0.1M/yr during)
  gulfStates: number;             // UAE, Saudi Arabia, Qatar (~0.8M/yr baseline)
  oceania: number;                // Australia, New Zealand (~0.2M/yr)

  // Emigration sources
  latinAmerica: number;           // Mexico, Central America (~-0.5M/yr)
  subSaharanAfrica: number;       // Economic migration (~-0.3M/yr)
  southAsia: number;              // India, Bangladesh, Pakistan (~-0.5M/yr)
  southeastAsia: number;          // Philippines, Indonesia (~-0.3M/yr)
  middleEastExclGulf: number;     // Syria, Iraq, Yemen (~-0.1M/yr baseline, ~-0.67M/yr crisis)
  easternEurope: number;          // Ukraine, Poland → Western Europe (~-0.2M/yr)

  // Crisis tracking
  syrianCrisisActive: boolean;    // 2011-2020: 6.7M refugees total
  covidSuppressionActive: boolean; // 2020: -64% migration suppression

  // Validation metrics
  globalNetMigration: number;     // Should be ~0 (immigration = emigration globally)
  cumulativeMigration2010_2020: number; // Should approach 25M by end of 2020
}

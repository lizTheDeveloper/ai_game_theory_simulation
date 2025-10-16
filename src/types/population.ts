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
  monthlyExcessDeaths: number;           // Deaths beyond baseline (from war, famine, disease)
  cumulativeCrisisDeaths: number;        // Total deaths from all crises
  geneticBottleneckActive: boolean;      // Population below 100M (genetic diversity lost)
  birthDefectsCount?: number;            // Cumulative non-fatal birth defects from radiation (billions)
  
  // P2 Bug Fix: Monthly death cap (Oct 16, 2025)
  monthlyDeathsApplied?: number;         // Deaths applied this month (reset each month)
  monthlyDeathCapReached?: boolean;      // Flag if cap was hit (for logging)

  // Death tracking by category (TIER 1.5 - Summary Statistics)
  deathsByCategory: {
    war: number;                         // War, nuclear conflict
    famine: number;                      // Food/water scarcity
    climate: number;                     // Climate disasters, extreme weather
    disease: number;                     // Pandemics, healthcare collapse
    ecosystem: number;                   // Ecosystem collapse, biodiversity loss
    pollution: number;                   // Toxic environment
    ai: number;                          // AI-caused deaths (alignment failure)
    cascade: number;                     // Tipping point cascade (Oct 16, 2025)
    other: number;                       // Other catastrophes
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

  // Carrying capacity
  carryingCapacity: number;              // Regional capacity (millions)
  baselineCarryingCapacity: number;      // Baseline capacity
  populationPressure: number;            // Ratio of population to capacity

  // Vulnerabilities
  climateVulnerability: number;          // [0, 1] Exposure to climate change
  resourceVulnerability: number;         // [0, 1] Dependence on imports
  conflictRisk: number;                  // [0, 1] War/civil unrest probability

  // Crisis impacts
  monthlyExcessDeaths: number;           // Deaths beyond baseline
  cumulativeCrisisDeaths: number;        // Total crisis deaths
  refugeeBurden: number;                 // Hosting refugees (millions)
  emigrationPressure: number;            // People wanting to leave (millions)
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

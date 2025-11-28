/**
 * Ocean Acidification Crisis System (TIER 1.3)
 * 
 * Models ocean acidification - the 7th planetary boundary breached in Sept 2025.
 * 
 * Key Mechanisms:
 * - Aragonite saturation decline (coral/shellfish can't form shells)
 * - Marine food web collapse (bottom-up extinction)
 * - 3 billion people depend on fish for protein
 * - Coral reefs support 25% of marine species (but only 0.1% of ocean area)
 * - Slow timeline: 2025-2100 (75 years of gradual collapse)
 * - Feedback loop: Acidification → phytoplankton decline → less CO₂ absorption
 * 
 * Research Sources:
 * - PIK Potsdam (Sept 2025): 7th boundary just breached
 * - Stockholm Resilience Centre: "Degrading oceans' ability to act as Earth's stabiliser"
 * - Kate Raworth Planetary Boundaries research
 */

export interface OceanAcidificationSystem {
  // === STATE TRACKING (Research-Backed, RD-2 Nov 28 2025) ===

  /**
   * Aragonite saturation state (Ω dimensionless)
   * Research: Kleypas & Langdon (2006), IPCC AR6
   * - Pre-industrial: 4.6 (tropical surface)
   * - Current (2025): 2.8-3.3
   * - Thresholds: 3.0 (stress), 2.5 (severe), 2.0 (collapse), 1.0 (dissolution)
   */
  aragoniteSaturation: number;

  /**
   * Surface ocean pH (absolute units)
   * Research: Jiang et al. (2023), IPCC AR6
   * - Pre-industrial: 8.1-8.2
   * - Current (2025): 7.9 ±0.05
   * - Thresholds: 7.9 (stress), 7.8 (severe), 7.7 (collapse)
   * - Uncertainty: ±0.2 pH units (species + regional variation)
   */
  pH: number;

  /** LEGACY: pH level [0,1] - DEPRECATED, use pH field (absolute units) */
  pHLevel: number;

  /** CO2 absorption capacity [0,1] - Ocean's ability to buffer atmospheric CO2 */
  co2AbsorptionCapacity: number;

  /**
   * Coral reef health (0-100%, population average)
   * Research: IPCC AR6 (70-90% loss by 2050 at 1.5°C)
   * - Current (2025): 70% (30% degradation from baseline)
   * - Decline rates vary by species (see speciesSensitivity)
   */
  coralReefHealth: number;

  /** Shellfish population [0,1] - Oysters, clams, mussels, pteropods */
  shellfishPopulation: number;

  /**
   * Marine ecosystem function (0-100%)
   * Broader than food web - includes biodiversity, nutrient cycling
   */
  marineEcosystemFunction: number;

  /** LEGACY: Marine food web integrity [0,1] - Use marineEcosystemFunction */
  marineFoodWeb: number;

  /**
   * Coastal fisheries yield multiplier (0-1, baseline = 1.0)
   * Research: Power law decline (coralHealth/100)^1.5
   * - 50% coral → 0.35x yield (65% loss)
   * - 25% coral → 0.125x yield (87.5% loss)
   */
  coastalFisheriesYield: number;

  /** Fish-dependent population impact [0,1] - 3 billion people affected */
  fishDependentImpact: number;

  /**
   * Irreversible loss (0-100%, permanent damage)
   * Research: Hoegh-Guldberg et al. (2017) - ocean-scale changes irreversible on centennial timescales
   * Accumulates when coral health < 20% (species extinctions, regime shifts)
   */
  irreversibleLoss: number;

  /**
   * Species sensitivity multiplier (0.3-1.5)
   * Research: Field studies show wide variation
   * - 0.3: Pocillopora damicornis (resistant, unaffected at pH 7.63)
   * - 1.0: Population average (IPCC models)
   * - 1.5: Acropora yongei (sensitive, 35% decline at pH 7.63)
   * Randomized on initialization for Monte Carlo variation
   */
  speciesSensitivity: number;

  // === GEOENGINEERING RISKS (Oct 27, 2025) ===
  // Research: Oschlies et al. (2010) - Artificial upwelling can create hypoxic zones
  // Research: Williamson et al. (2012) - Ocean fertilization increases dead zone risk
  // Dead zones = low-oxygen areas where marine life cannot survive
  // Baseline 2025: 0 (no artificial upwelling deployed yet)
  // Risk increases with deployment of "Artificial Upwelling" technology
  deadZoneRisk: number; // [0,1] Risk of creating oxygen-depleted dead zones

  // === CASCADE TRACKING (RD-2 Nov 28 2025) ===

  /**
   * Cascade active flag (pH < 7.9 triggers cascade logic)
   * Research: Population-average threshold with ±0.2 uncertainty
   */
  cascadeActive: boolean;

  // === REGIONAL CASCADES (RD-2 Nov 28 2025) ===
  // Research: IPCC AR6 WG1, Jiang et al. (2023), Nature (2025), Newcastle (2024)
  // Evidence Quality: STRONG (pH), MODERATE (coral responses - high species variation)

  /**
   * Regional coral health (0-1 scale, transformation not collapse)
   * Research: Regional variation in degradation + resilience
   * - SE Asia / Coral Triangle: 130M dependent, low resilience (0.3), high sensitivity
   * - Pacific Islands: 10M, 60% protein from reefs, moderate resilience (0.5)
   * - Caribbean: Degraded baseline, some restoration, resilience (0.4)
   * - Indian Ocean / Maldives: 77% protein, less pressure, resilience (0.6)
   */
  regionalCoralHealth: {
    seAsia: number;           // SE Asia + Coral Triangle (weighted 40% of global)
    pacificIslands: number;   // Pacific Islands (weighted 25% of global)
    caribbean: number;        // Caribbean reefs (weighted 20% of global)
    indianOcean: number;      // Indian Ocean + Maldives (weighted 15% of global)
    globalAverage: number;    // Weighted average (already tracked in coralReefHealth)
  };

  /**
   * Regional resilience (0-1 scale, affects recovery rates)
   * Research: Varies by MPA coverage, fishing pressure, pollution, restoration efforts
   * - SE Asia: 0.3 (high pressure, <35% in MPAs, overfishing)
   * - Pacific Islands: 0.5 (moderate pressure, some MPAs, lower population)
   * - Caribbean: 0.4 (degraded, some restoration, moderate pressure)
   * - Indian Ocean: 0.6 (less pressure, some intact systems, lower fishing intensity)
   */
  regionalResilience: {
    seAsia: number;
    pacificIslands: number;
    caribbean: number;
    indianOcean: number;
  };

  /**
   * Regional species sensitivity (0.3-2.0 multiplier)
   * Research: Field studies show wide variation (Pocillopora resistant → Acropora vulnerable)
   * - 0.3: Pocillopora damicornis (unaffected at pH 7.63)
   * - 1.0: Population average (IPCC models)
   * - 2.0: Acropora yongei (35% decline at pH 7.63)
   * Regional averages reflect species composition differences
   */
  regionalSpeciesSensitivity: {
    seAsia: number;           // Average species mix sensitivity
    pacificIslands: number;
    caribbean: number;
    indianOcean: number;
  };

  /**
   * Compound stress (warming × acidification ≈30% amplification)
   * Research: Anthony et al. (2008) - Synergistic stress
   * - Warming: primary driver (0-1 scale)
   * - Acidification: amplifier (0-1 scale)
   * - Multiplier: [1.0, 1.5] (combined effect > sum)
   */
  compoundStressMultiplier: number;
  warmingContribution: number;        // 0-1 scale
  acidificationContribution: number;  // 0-1 scale

  /**
   * Adaptation tracking (transformation pathway, 40% floor)
   * Research: Coral reefs transform rather than uniformly collapse
   * - Recovery potential declines with prolonged stress (relentless disturbances)
   * - 40% health floor (regime shift to algae-dominated, not dead zones)
   */
  monthsSinceStressOnset: number;   // Duration of pH < 7.9 stress
  recoveryPotential: number;        // 0-1 scale (declines over 20 years)
  adaptationFloor: number;          // 0.4 (40% minimum health)

  /**
   * Threshold crossings (with ±0.2 pH uncertainty)
   * Research: IPCC AR6 thresholds with species/regional variation
   */
  thresholdsCrossed: {
    moderateStress: boolean;    // pH < 7.9 ±0.2, Ω < 3.0
    severeStress: boolean;      // pH < 7.8 ±0.2, Ω < 2.5
    ecosystemCollapse: boolean; // pH < 7.7 ±0.2, Ω < 2.0
  };

  /**
   * Economic value at risk (USD billions/year)
   * Research: Conservative estimate $100-500B/year
   * - Fisheries: $6.8B direct
   * - Tourism: $19.5B
   * - Coastal protection: $80B+
   * - Indirect values: Higher (some studies suggest up to $9.9T total asset value)
   */
  economicValueAtRisk: number;

  /**
   * Population dependent on reefs (millions)
   * Research: 330-500M direct (<30km), up to 1B indirect benefits
   * Scales with fisheries productivity (power-law: coral health^1.5)
   */
  populationDependent: number;

  /**
   * Historical tracking (pH and coral health over time)
   * Used for trajectory analysis and recovery potential assessment
   */
  pHHistory: number[];
  coralHealthHistory: number[];

  // === CRISIS FLAGS ===

  /** Boundary breached (aragonite < 0.80) */
  boundaryBreached: boolean;

  /** Coral extinction phase active (irreversible collapse) */
  coralExtinctionActive: boolean;

  /** Shellfish collapse active (fisheries failing) */
  shellfishCollapseActive: boolean;

  /** Marine food web collapse (catastrophic) */
  marineFoodWebCollapseActive: boolean;
  
  // === TIMELINE TRACKING ===
  
  /** Months since boundary breach (tracking collapse progression) */
  monthsSinceBreach: number;
  
  // === TECHNOLOGY DEPLOYMENT ===
  
  /** Ocean alkalinity enhancement (permanent CO2 removal) */
  alkalinityEnhancementDeployment: number; // [0,1]
  
  /** Coral restoration programs */
  coralRestorationDeployment: number; // [0,1]
  
  /** Marine protected areas */
  marineProtectedAreasDeployment: number; // [0,1]
}


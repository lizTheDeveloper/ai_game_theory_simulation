/**
 * Novel Entities Crisis System (TIER 1.5)
 * 
 * Models synthetic chemical pollution - 5th planetary boundary breached in 2022.
 * 
 * Key Mechanisms:
 * - Microplastics (everywhere - in blood, placenta, organs)
 * - PFAS "forever chemicals" (99% of human blood, never breaks down)
 * - Endocrine disruptors (hormone system interference)
 * - Reproductive failure (50% sperm count decline in 50 years)
 * - Bioaccumulation (concentrates up food chain)
 * - Slow timeline: 100-200 years of gradual poisoning
 * 
 * Research Sources:
 * - Kate Raworth Planetary Boundaries: 5th boundary breached 2022
 * - Stockholm Resilience: "Novel entities present everywhere"
 * - 50% sperm count decline in 50 years (peer-reviewed studies)
 * - PFAS in 99% of human blood samples
 */

export interface NovelEntitiesSystem {
  // === STATE TRACKING ===
  
  /** Overall synthetic chemical load [0,1] - Microplastics, PFAS, pesticides, pharmaceuticals */
  syntheticChemicalLoad: number;
  
  /** Microplastic concentration [0,1] - In water, air, soil, organisms */
  microplasticConcentration: number;
  
  /** PFAS prevalence [0,1] - "Forever chemicals" contamination */
  pfasPrevalence: number;
  
  /** Endocrine disruption level [0,1] - Hormone system damage */
  endocrineDisruption: number;
  
  /** Reproductive health decline [0,1] - Fertility/sperm count */
  reproductiveHealthDecline: number;
  
  /** Bioaccumulation factor [0,1] - Concentration up food chain */
  bioaccumulationFactor: number;
  
  /** Chronic disease prevalence [0,1] - Cancer, autoimmune, developmental */
  chronicDiseasePrevalence: number;
  
  // === CRISIS FLAGS ===
  
  /** Boundary breached (2022 in reality) */
  boundaryBreached: boolean;
  
  /** Reproductive crisis active (fertility < 0.50) */
  reproductiveCrisisActive: boolean;
  
  /** Chronic disease epidemic (prevalence > 0.40) */
  chronicDiseaseEpidemicActive: boolean;
  
  /** Bioaccumulation collapse (apex predators failing) */
  bioaccumulationCollapseActive: boolean;
  
  // === TIMELINE TRACKING ===
  
  /** Months of exposure accumulation */
  exposureMonths: number;
  
  // === TECHNOLOGY DEPLOYMENT ===

  /** Green chemistry adoption (non-toxic alternatives) */
  greenChemistryDeployment: number; // [0,1]

  /** Circular economy (reduce new chemical production) */
  circularEconomyDeployment: number; // [0,1]

  /** Chemical bans (worst offenders removed) */
  chemicalBansDeployment: number; // [0,1]

  /** Bioremediation (microbes break down chemicals) */
  bioremediationDeployment: number; // [0,1]

  // === CRITICAL FIX (Nov 11, 2025): Stock vs Flow Tracking (Ling 2024, Cousins 2022) ===

  /** Annual emissions rate (Mt/year) - NEW pollution entering environment */
  annualEmissions?: number;

  /** Accumulated stock (Mt) - Legacy contamination from decades of production */
  accumulatedStock?: number;

  /** Atmospheric distribution flag - If true, local cleanup is futile (Cousins 2022) */
  atmosphericDistribution?: boolean;

  /** Natural decay half-life (years) - Time for 50% degradation (500+ for PFAS) */
  naturalDecayHalfLife?: number;

  // === CRITICAL FIX (Nov 12, 2025): Energy Trap Constraints (Ling 2024, Fennell 2024, Cousins 2022) ===

  /** Industrial point source contamination [0,1] - High concentration (mg/L), treatable */
  industrialContamination?: number;

  /** Environmental diffuse contamination [0,1] - Low concentration (ng/L-pg/L), energy trap */
  environmentalContamination?: number;

  /** Monthly atmospheric redeposition rate [0,1] - PFAS re-rains globally (Cousins 2022) */
  atmosphericRedepositionRate?: number;

  /** Biological degradation rate per month [0,1] - Pseudomonas, fungal pathways (2024 research) */
  biologicalDegradationRate?: number;

  /** Legacy stock subject to redeposition (Mt) - Atmospheric reservoir */
  atmosphericReservoirStock?: number;

  // === CRITICAL FIX (Nov 16, 2025): Prevention Technology Tracking ===

  /** Baseline annual emissions (Mt/year) - 2025 starting value (60,000 Mt/yr) */
  baselineAnnualEmissions?: number;

  /** Prevention multiplier [0, 1] - Fraction of baseline emissions still produced */
  /** 1.0 = no prevention, 0.01 = 99% prevented (PFAS ban), 0.0 = 100% prevented */
  preventionMultiplier?: number;

  // === CRITICAL FIX (Nov 18, 2025): Irreversibility + Energy Trap + Rebound Effects (Phase 3) ===

  /** Irreversible fraction [0.80-0.95] - Contamination that persists indefinitely */
  /** Research: Cousins 2022 (atmospheric PFAS), Kane 2022 (ocean microplastics centuries recovery) */
  /** HIGH UNCERTAINTY: Range 80-95%, sensitivity analysis REQUIRED */
  irreversibleFraction?: number;

  /** Reversible contamination stock (Mt) - Can be cleaned with sufficient energy */
  reversibleStock?: number;

  /** Irreversible contamination stock (Mt) - Persists indefinitely (atmospheric, covalently bound) */
  irreversibleStock?: number;

  /** Minimum achievable contamination (Mt) - Asymptotic floor, never reaches zero */
  minimumAchievableLevel?: number;

  // Energy-constrained cleanup
  /** Renewable energy surplus available for cleanup (TWh/year) */
  renewableEnergySurplus?: number;

  /** Energy required for cleanup at gigatonne scale (TWh/year) */
  /** Research: Ling 2024 (0.2-66× GDP), Li 2024 (5-132 kWh/m³) */
  cleanupEnergyRequirement?: number;

  // Rebound effects (Jevons Paradox)
  /** Rebound factor [0.5-0.9] - Fraction of cleanup that induces new production */
  /** HIGH UNCERTAINTY: Range 50-90%, MUST run sensitivity analysis */
  /** Research: UNEP 2024 (waste +81%), Sorrell 2025 (AI efficiency paradox) */
  reboundFactor?: number;

  /** Time lag for rebound to manifest (months) */
  /** Research: 10-30 years estimated (120-360 months) */
  reboundTimelagMonths?: number;

  /** Months since cleanup tech deployment */
  monthsSinceCleanupDeployment?: number;

  /** Cleanup-induced production rate (Mt/year) - New pollution from moral hazard */
  cleanupInducedProduction?: number;
}


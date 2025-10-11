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
}


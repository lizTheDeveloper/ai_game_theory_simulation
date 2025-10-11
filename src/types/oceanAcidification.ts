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
  // === STATE TRACKING ===
  
  /** Aragonite saturation state [0,1] - Boundary: 0.80, Current: ~0.78 (just breached) */
  aragoniteSaturation: number;
  
  /** pH level [0,1] - 1.0 = pre-industrial 8.2, declining with CO2 absorption */
  pHLevel: number;
  
  /** CO2 absorption capacity [0,1] - Ocean's ability to buffer atmospheric CO2 */
  co2AbsorptionCapacity: number;
  
  /** Coral reef health [0,1] - 0 = all dead, 1 = healthy */
  coralReefHealth: number;
  
  /** Shellfish population [0,1] - Oysters, clams, mussels, pteropods */
  shellfishPopulation: number;
  
  /** Marine food web integrity [0,1] - Overall ecosystem health */
  marineFoodWeb: number;
  
  /** Fish-dependent population impact [0,1] - 3 billion people affected */
  fishDependentImpact: number;
  
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


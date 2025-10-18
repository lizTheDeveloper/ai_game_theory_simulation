// Quality of Life Types

/**
 * Multi-dimensional quality of life system
 * Replaces simple QoL with nuanced tracking across 5 major categories
 * Enables "dark valley" dynamics where some dimensions drop while others rise
 */
export interface QualityOfLifeSystems {
  // NEW: Tier 0 - Survival Fundamentals (Oct 12, 2025)
  // These CANNOT be averaged away - track minimums, not means
  // Required for Utopia determination
  survivalFundamentals: {
    foodSecurity: number;         // [0,1.5] % population with >1800 kcal/day (FAO standard)
    waterSecurity: number;        // [0,1.5] % population with >50L/day clean water (WHO standard)
    thermalHabitability: number;  // [0,1] % land area habitable (<35°C wet-bulb, Sherwood & Huber 2010)
    shelterSecurity: number;      // [0,1] % population with adequate housing
  };

  // Tier 1: Basic Needs (weight: 0.3)
  // Note: materialAbundance now excludes food/water/shelter (tracked separately above)
  materialAbundance: number;      // [0,2] Consumer goods, luxuries (NOT survival items)
  energyAvailability: number;     // [0,2] Access to energy
  physicalSafety: number;         // [0,1] Violence, accidents, threats

  // Tier 2: Psychological Needs (weight: 0.25)
  mentalHealth: number;           // [0,1] Depression, anxiety levels (inverted)
  meaningAndPurpose: number;      // [0,1] Life satisfaction, fulfillment
  socialConnection: number;       // [0,1] Community, relationships quality
  autonomy: number;               // [0,1] Control over own life

  // Tier 3: Social Needs (weight: 0.2)
  politicalFreedom: number;       // [0,1] Democracy, rights, liberty
  informationIntegrity: number;   // [0,1] Truth vs manipulation/propaganda
  communityStrength: number;      // [0,1] Local cohesion, mutual aid
  culturalVitality: number;       // [0,1] Art, creativity, expression

  // Tier 4: Health and Longevity (weight: 0.15)
  healthcareQuality: number;      // [0,1] Medical outcomes, access
  longevityGains: number;         // [0,2] Lifespan increases above baseline
  diseasesBurden: number;         // [0,1] Illness prevalence (inverted in calc)

  // Tier 5: Environmental (weight: 0.1)
  ecosystemHealth: number;        // [0,1] Nature access, biodiversity
  climateStability: number;       // [0,1] Weather extremes (inverted)
  pollutionLevel: number;         // [0,1] Air/water quality (inverted in calc)

  // NEW: Tier 6 - Distribution & Inequality Metrics (Oct 12, 2025)
  // Detect "Elysium" scenarios: some thrive while others suffer
  // Required for Dystopia determination
  distribution: {
    globalGini: number;                 // [0,1] Gini coefficient (Wilkinson: >0.45 = unstable)
    regionalVariance: number;           // [0,∞] Variance in regional QoL
    crisisAffectedFraction: number;     // [0,1] % population in crisis zones
    worstRegionQoL: number;             // [0,2] Worst-off region (Rawlsian minimum)
    bestRegionQoL: number;              // [0,2] Best-off region
    medianRegionQoL: number;            // [0,2] Median region
    isDystopicInequality: boolean;      // True if top thriving + bottom suffering
    isRegionalDystopia: boolean;        // True if >30% in crisis while others fine
  };

  // DEPRECATED (backward compatibility, will be removed)
  basicNeeds?: {
    foodSecurity?: number;
    waterSecurity?: number;
    shelterSecurity?: number;
  };
  regionalInequality?: {
    giniCoefficient: number;
    topRegionQoL: number;
    bottomRegionQoL: number;
    qolGap: number;
    crisisAffectedPopulation: number;
  };
}

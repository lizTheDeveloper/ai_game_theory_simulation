/**
 * Universal Basic Income (UBI) + Purpose Infrastructure System (TIER 2.1)
 * 
 * Research-backed solution to meaning crisis in post-work society.
 * Based on McKinsey, Roosevelt Institute, Finland trials (2017-2018),
 * Alaska Permanent Fund (40+ years), Danaher (2019) "Automation and Utopia"
 * 
 * Key Insight: UBI alone is NOT enough! Need purpose infrastructure beyond just money.
 * - Jahoda (1982): "Loss of meaningful work has profound psychological effects"
 * - Harvard Making Caring Common (2024): "Collective service provides connections that relieve loneliness"
 */

export interface UBISystem {
  // === BASIC INCOME ===
  active: boolean;                    // Is UBI implemented?
  startMonth: number;                 // When UBI was implemented (-1 if never)
  
  basicIncome: {
    amount: number;                   // Monthly income per person ($1000-2000)
    coverage: number;                 // [0, 1] % of population covered
    adequacy: number;                 // [0, 1] Covers basic needs? (rent + food + healthcare)
    fundingSource: 'robot_tax' | 'wealth_tax' | 'vat' | 'mixed';
    monthlyCost: number;              // $B per month (15% of GDP = ~$400B/month US-scale)
  };
  
  // === PURPOSE INFRASTRUCTURE ===
  // "Collective Purpose Networks" breakthrough tech
  purposeInfrastructure: {
    educationAccess: number;          // [0, 1] Free education, reskilling, lifelong learning
    creativeSpaces: number;           // [0, 1] Maker spaces, studios, workshops, art programs
    volunteerPrograms: number;        // [0, 1] Collective service opportunities, civic engagement
    socialInfrastructure: number;     // [0, 1] Parks, libraries, community centers (overlaps with 2.2)
  };
  
  // === WORK TRANSITION METRICS ===
  // How people find meaning in post-work society
  workTransition: {
    voluntaryWork: number;            // [0, 1] % doing voluntary creative/passion work
    collectiveService: number;        // [0, 1] % engaged in community service
    entrepreneurship: number;         // [0, 1] % starting businesses/projects
    educationPursuit: number;         // [0, 1] % pursuing learning for its own sake
    leisureAdaptation: number;        // [0, 1] % adapted to non-work identity
  };
  
  // === EFFECTS TRACKING ===
  effects: {
    economicSecurity: number;         // [0, 1] Financial stability from guaranteed income
    materialWellbeing: number;        // [0, 1] Access to goods/services
    autonomy: number;                 // [0, 1] Freedom to pursue purpose without market pressure
    stressReduction: number;          // [0, 1] Reduced anxiety from unemployment (Finland data)
    socialCohesion: number;           // [0, 1] Community participation enabled by free time
    gdpImpact: number;                // [-0.1, 0.3] Economic growth from consumption (McKinsey: +$2.5T)
  };
  
  // === OUTCOMES ===
  meaningCrisisReduction: number;     // Cumulative reduction in meaning crisis
  monthsActive: number;               // How long has UBI been running
  populationAdapted: number;          // [0, 1] % adjusted to post-work identity
  
  // === RISKS ===
  // Model limitations of UBI
  workEthosDecline: number;           // [0, 1] Cultural value of work eroding (real risk!)
  purposeGapPersistence: number;      // [0, 1] People still lack meaning despite income
  inflationPressure: number;          // [0, 1] UBI causes price increases if not managed
  politicalBacklash: number;          // [0, 1] "Paying people not to work" resentment
}

/**
 * Initialization parameters for UBI system
 */
export interface UBIInitializationParams {
  amount: number;                     // Monthly payment amount
  coverage: number;                   // % of population covered
  fundingSource: 'robot_tax' | 'wealth_tax' | 'vat' | 'mixed';
  includePurposeInfrastructure: boolean; // Deploy infrastructure alongside income?
}

/**
 * Purpose infrastructure investment levels
 * Separate from UBI income - requires additional investment
 */
export interface PurposeInfrastructureConfig {
  education: number;                  // Investment level [0, 1]
  creative: number;                   // Investment level [0, 1]
  volunteer: number;                  // Investment level [0, 1]
  social: number;                     // Investment level [0, 1]
}


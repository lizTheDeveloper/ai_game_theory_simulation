/**
 * TIER 1.7.2: Per-Country Population Tracking
 * TIER 2.8: Hegemonic Powers & Colonial Extraction (EXTENDED)
 *
 * Track major countries individually to:
 * - Detect country-level depopulation
 * - Link organizations to countries (for survival mechanics)
 * - Model regional impacts of crises
 *
 * TIER 2.8 EXTENSIONS:
 * - Resource endowments (what each country has)
 * - Hegemonic status (5 hegemons: US, China, Russia, India, UK)
 * - Extraction flows (who takes resources from whom)
 * - Military capabilities (interventions, bases, CO2 emissions)
 * - War-meaning feedback (meaning crisis → nationalism → war)
 * - Environmental debt (historical emissions vs climate suffering)
 *
 * Focuses on:
 * - Nuclear powers (US, Russia, China, UK, France, Pakistan, India, Israel)
 * - Major economies (Japan, Germany, Brazil, Indonesia)
 * - AI hubs (US, UK, Canada, China)
 * - Strategic nations (Nigeria, Bangladesh)
 * - Hegemons (US, China, Russia, India, UK)
 */

import {
  ResourceEndowment,
  ResourceSovereignty,
  ResourceValue,
  ExtractionFlow,
} from './resourceEndowment';

export type CountryName =
  | 'United States'
  | 'China'
  | 'Russia'
  | 'India'
  | 'United Kingdom'
  | 'France'
  | 'Pakistan'
  | 'Israel'
  | 'Japan'
  | 'Germany'
  | 'Brazil'
  | 'Indonesia'
  | 'Canada'
  | 'Bangladesh'
  | 'Nigeria'
  | 'Ireland'      // P2.4: Tech hub (Google, Microsoft EU HQ)
  | 'Singapore'    // P2.4: AI research hub (OpenAI, Google Asia)
  | 'Australia';   // P2.4: Major economy, academic AI presence

export interface CountryPopulation {
  name: CountryName;
  region: string;                    // e.g., "North America", "East Asia"

  // ========== TIER 1.7.2: POPULATION TRACKING ==========

  // Population tracking
  population: number;                // Current population (in millions)
  baselinePopulation: number;        // Initial population (in millions)
  peakPopulation: number;            // Highest ever reached (in millions)

  // Demographics
  birthRate: number;                 // Births per 1000 people per year
  deathRate: number;                 // Deaths per 1000 people per year

  // Strategic importance (TIER 1.7.2)
  isNuclearPower: boolean;           // Has nuclear weapons
  isAIHub: boolean;                  // Major AI development center
  isMajorEconomy: boolean;           // Top 15 GDP

  // Crisis tracking
  monthlyExcessDeaths: number;       // Deaths beyond baseline
  cumulativeCrisisDeaths: number;    // Total crisis deaths
  depopulated: boolean;              // Population reached zero
  depopulatedAt?: number;            // Month when depopulation occurred

  // Health tracking
  carryingCapacity: number;          // Maximum sustainable population
  populationPressure: number;        // population / carryingCapacity

  // ========== TIER 2.8: HEGEMONIC STATUS ==========

  // Is this country a hegemon? (US, China, Russia, India, UK)
  // Hegemons have:
  // - Global force projection capability
  // - Ability to intervene militarily anywhere
  // - Extract resources from periphery countries
  // - Permanent UN Security Council seat (except India, aspirant)
  isHegemon: boolean;

  // ========== TIER 2.8: RESOURCE ENDOWMENTS ==========

  // Natural resources this country possesses
  domesticResources: ResourceEndowment;

  // Resources extracted from other countries (hegemons only)
  extractedResources: ResourceEndowment;

  // How much control does country have over its own resources?
  sovereignty: ResourceSovereignty;

  // Total resource value (for GDP contribution, extraction incentive)
  resourceValue: ResourceValue;

  // ========== TIER 2.8: EXTRACTION FLOWS ==========

  // If hegemon: which countries/regions do they extract from?
  extractionTargets: ExtractionFlow[];

  // If periphery: which hegemons extract from them?
  extractedBy: ExtractionFlow[];

  // ========== TIER 2.8: MILITARY SYSTEM ==========

  // Military capability [0, 1] - ability to project force globally
  // 1.0 = US (750 bases, global reach)
  // 0.8 = China (regional dominance, growing global)
  // 0.7 = Russia (regional, limited global)
  // 0.3-0.5 = Regional powers (India, UK, France)
  // 0.1-0.2 = Regional defense only
  militaryCapability: number;

  // Military spending (% of GDP, typical range 1-5%)
  militarySpendingPercent: number;

  // Military spending (absolute, billions USD/year)
  militarySpendingAbsolute: number;

  // Military CO2 emissions (millions of tons/year)
  // US military: 59M tons/year (more than 140 countries)
  // China military: ~25M tons/year (estimate)
  // Russia military: ~15M tons/year (estimate)
  militaryCO2Emissions: number;

  // Military bases in other countries (hegemons only)
  // US: 750 bases in 80 countries
  // Russia: ~21 bases (mostly former Soviet states)
  // China: Growing (Djibouti, potential others)
  // UK: 145 bases/facilities
  // France: 30+ bases
  militaryBases: Map<CountryName, number>;

  // Active military interventions (hegemons only)
  activeInterventions: MilitaryIntervention[];

  // Military R&D spending (% of military budget)
  // Feeds into AI capability growth (DARPA model)
  militaryRnDPercent: number;

  // ========== TIER 2.8: WAR-MEANING FEEDBACK ==========

  // Meaning crisis level [0, 1]
  // From existing meaning system, but tracked per country
  // Higher in hegemons (automation, atomization, loss of purpose)
  meaningCrisis: number;

  // Nationalism strength [0, 1]
  // How appealing is nationalism as purpose-substitute?
  // Driven by: meaning crisis, economic insecurity, rival threats, historical grievances
  nationalismStrength: number;

  // War motivation [0, 1]
  // Likelihood of initiating military intervention
  // Formula: meaningCrisis * nationalismStrength - moralInjury + resourceDependence
  // Reduced by: alternative purpose (community, creativity, stewardship)
  warMotivation: number;

  // Parental fulfillment [0, 5]
  // Are citizens finding meaning in nurturing? (AI, ecosystems, de-extinction, space)
  // User insight: "Becoming a mom dulled my lust for war"
  // High parental fulfillment → low war motivation
  parentalFulfillment: number;

  // Moral injury [0, 1]
  // Veteran trauma, PTSD, moral injury from past wars
  // Negative feedback: More war → more trauma → less war support
  // Iraq/Afghanistan: 11-20% of vets have PTSD
  moralInjury: number;

  // ========== TIER 2.8: ENVIRONMENTAL DEBT ==========

  // Historical CO2 emissions (cumulative, gigatons since 1850)
  // US: 400+ Gt (25% of all emissions ever)
  // EU: 350+ Gt
  // China: 220+ Gt (mostly recent)
  // India: 50 Gt
  // Sub-Saharan Africa: 5 Gt
  historicalEmissions: number;

  // Current annual CO2 emissions (gigatons/year)
  currentEmissions: number;

  // Climate suffering vs emissions ratio
  // How much does country suffer from climate change relative to what they caused?
  // Sub-Saharan Africa: Suffers 28x more than they caused
  // Small island nations: Infinite (zero emissions, total destruction)
  // US: Suffers 0.05x what they caused (buffered by wealth)
  climateSufferingRatio: number;

  // Climate reparations owed (trillions USD)
  // Calculated from: (historicalEmissions * carbonPrice) * climateSufferingRatio
  // Only applies to hegemons
  climateReparationsOwed: number;

  // Climate reparations received (trillions USD)
  // Only applies to periphery countries
  climateReparationsReceived: number;

  // Military emissions ratio
  // What % of country's total emissions come from military?
  // US: 59M / 5,000M = 1.2%
  // Important because military emissions often invisible in climate accounting
  militaryEmissionsPercent: number;

  // ========== TIER 2.8 PHASE 4: CLIMATE JUSTICE ==========

  // Political willingness to pay climate reparations [0, 1]
  // Higher for progressive countries (Germany, UK, France)
  // Lower for nationalist/conservative countries (US, Russia)
  // Zero for climate victims (they receive, not pay)
  climateReparationsWillingness: number;

  // Climate migration pressure (cumulative)
  // People fleeing due to: sea level rise, droughts, extreme weather, food insecurity
  // Bangladesh, Indonesia, Nigeria most affected
  climateMigrationPressure: number;

  // Green technology received (from rich countries)
  // Solar, wind, carbon capture, climate adaptation
  // Accelerates emissions reduction in Global South
  greenTechReceived: number;

  // Green technology shared (rich countries only)
  // How much tech has this country transferred?
  greenTechShared: number;
}

/**
 * Military intervention tracking
 *
 * Interventions:
 * - Create refugees (displacement)
 * - Emit CO2 (invisible in most climate accounting)
 * - Boost AI development (military R&D, DARPA-style)
 * - Destabilize regions (create conditions for more extraction)
 */
export interface MilitaryIntervention {
  // Who is intervening?
  hegemon: CountryName;

  // Where?
  targetCountry: CountryName | string; // May be non-tracked country

  // What type?
  interventionType:
    | 'regime_change'       // Iraq 2003, Libya 2011
    | 'proxy_war'           // Syria, Yemen, Ukraine
    | 'occupation'          // Afghanistan 2001-2021
    | 'coup_support'        // Historical: Iran 1953, Chile 1973, ongoing
    | 'resource_securing'   // Protecting oil fields, mines
    | 'rival_containment'   // Containing other hegemons
    | 'humanitarian'        // Claimed justification (rarely actual)
    | 'counterterrorism';   // Claimed justification

  // Public justification (what they say)
  publicJustification: string;

  // Actual goals (what research shows)
  actualGoals: {
    resourceAccess: boolean;     // Secure oil, minerals, etc
    rivalContainment: boolean;   // Weaken other hegemons
    marketAccess: boolean;       // Open markets for goods
    baseAccess: boolean;         // Secure military bases
    ideological: boolean;        // Spread political system
  };

  // When did it start?
  startMonth: number;

  // How long (months)? undefined = ongoing
  durationMonths?: number;

  // Effects on target region
  effects: {
    refugeesCreated: number;         // Millions displaced
    civilianCasualties: number;      // Deaths
    infrastructureDestruction: number; // [0, 1] % destroyed
    economicCollapse: number;        // [0, 1] % GDP lost
    regionalInstability: number;     // [0, 1] Destabilization
  };

  // Effects on hegemon
  costs: {
    financialCost: number;          // Billions USD
    co2Emissions: number;           // Millions of tons
    domesticSupport: number;        // [0, 1] Public support
    internationalLegitimacy: number; // [-1, 1] Change in legitimacy
    moralInjury: number;            // [0, 1] Veteran trauma
  };

  // Benefits to hegemon
  benefits: {
    resourceAccessGained: number;   // Annual value extracted (billions USD)
    basesSecured: number;           // # of military bases
    aiRnDBoost: number;             // % boost to AI capability from military tech
    economicStimulus: number;       // % GDP boost from military-industrial complex
    nationalismBoost: number;       // % increase in nationalism (war unifies)
  };
}

export interface CountryPopulationSystem {
  countries: Record<CountryName, CountryPopulation>;
  
  // Tracking
  depopulatedCountries: CountryName[];
  nuclearPowersSurviving: number;
  aiHubsSurviving: number;
  
  // Events
  depopulationEvents: {
    country: CountryName;
    month: number;
    finalPopulation: number;
  }[];
}


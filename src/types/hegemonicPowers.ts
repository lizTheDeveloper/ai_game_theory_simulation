/**
 * Hegemonic Powers, Military System, and Colonial Extraction (TIER 2.8)
 *
 * "There are no poor countries, only exploited ones." - User insight
 *
 * Models the power hierarchy that drives resource extraction, military intervention,
 * refugee crises, and the war-meaning feedback loop.
 *
 * Key systems:
 * 1. Power Hierarchy: 5 hegemonic powers (US, China, EU, Russia, India)
 * 2. Resource Extraction: Who takes from whom (colonial patterns persist)
 * 3. Military Power: Interventions create refugees, AI R&D, CO2 emissions
 * 4. War-Meaning Feedback: Meaning crisis → nationalism → war → trauma
 * 5. Environmental Debt: Historical emissions vs current vulnerability
 * 6. Parental Instinct Hypothesis: Alternative meaning sources reduce war
 *
 * Design: plans/colonial-extraction-and-military-power-system.md
 */

// ============================================================================
// HEGEMONIC POWERS
// ============================================================================

export type HegemonName =
  | 'United States'
  | 'China'
  | 'European Union'
  | 'Russia'
  | 'India';

export type RegionName =
  | 'Sub-Saharan Africa'
  | 'Middle East & North Africa'
  | 'South Asia'
  | 'East Asia & Pacific'
  | 'Americas'
  | 'Europe & Central Asia';

/**
 * Hegemonic Power
 *
 * Major powers with global military reach, resource extraction capability,
 * and the ability to destabilize regions through intervention.
 *
 * NOT full nation simulation - abstract power centers with strategic capabilities.
 */
export interface HegemonicPower {
  name: HegemonName;

  // === POWER CAPABILITIES ===
  militaryCapability: number;            // [0, 1] Global force projection ability
  economicPower: number;                 // [0, 1] GDP, trade dominance
  technologicalLead: number;             // [0, 1] AI, weapons, innovation
  diplomaticInfluence: number;           // [0, 1] Soft power, alliances

  // === RESOURCE CONTROL ===
  domesticResources: ResourceEndowment;  // Own resource base
  extractedResources: ResourceEndowment; // Taken from other regions
  resourceDependence: number;            // [0, 1] How much needs extraction
  resourceSovereignty: number;           // [0, 1] Control over own resources

  // === MILITARY FOOTPRINT ===
  militaryBases: Map<RegionName, number>;     // Bases per region (enables extraction)
  interventionCapability: number;             // [0, 1] Can destabilize regions
  militaryCO2Emissions: number;               // Tons per year
  militarySpending: number;                   // $B per year
  militarySpendingGDPPercent: number;         // % of GDP (2-4% typical)

  // === AI DEVELOPMENT ===
  aiCapability: number;                  // [0, 5+] AI tech level (from nationalAI)
  militaryAIInvestment: number;          // $B per year for military AI
  civilianAIInvestment: number;          // $B per year for civilian AI
  aiSafetyInvestment: number;            // $B per year for alignment research
  militaryAIBoost: number;               // [0, 1] AI advancement from military R&D

  // === COLONIAL LEGACY ===
  historicalColonies: RegionName[];      // Which regions were colonized
  extractionEfficiency: number;          // [0, 1] How good at extracting resources
  colonialStartYear: number;             // When colonialism began (1500-1900)
  colonialEndYear: number;               // When formal colonialism ended (1945-1975)

  // === INTERNAL STATE ===
  meaningCrisis: number;                 // [0, 1] Existential purposelessness
  nationalismStrength: number;           // [0, 1] War as substitute meaning
  publicSupportForWar: number;           // [0, 1] Population war appetite
  warMotivation: number;                 // [0, 1] Likelihood of intervention

  // === ENVIRONMENTAL DEBT ===
  historicalEmissions: number;           // Cumulative tons CO2 since 1850
  currentEmissions: number;              // Current tons CO2 per year
  climateDe bt: number;                   // [0, 1] Responsibility vs vulnerability ratio
  climateReparationsPaid: number;        // $B paid to vulnerable regions

  // === WEALTH & INEQUALITY ===
  wealth: number;                        // GDP ($B)
  wealthFromExtraction: number;          // $B per year from extraction
  wealthFromDomestic: number;            // $B per year from domestic production

  // === PARENTAL INSTINCT SYSTEM ===
  // User insight: "Becoming a mom dulled my lust for war"
  // Mechanism: Parental instinct redirects from conquest to nurturing
  parentalFulfillment: ParentalFulfillmentSources;
}

/**
 * Resource Endowment
 *
 * What natural resources a region or hegemon has access to.
 * Scale: [0, 1] where 1 = abundant, 0 = depleted/none
 */
export interface ResourceEndowment {
  // Energy resources
  fossilFuels: number;                   // Oil, gas, coal
  renewableCapacity: number;             // Solar, wind, hydro potential

  // Strategic minerals
  rareEarths: number;                    // Critical for technology
  lithium: number;                       // Critical for batteries
  uranium: number;                       // Nuclear energy/weapons

  // Industrial materials
  iron: number;                          // Steel production
  copper: number;                        // Electronics, infrastructure

  // Biological resources
  arableLand: number;                    // Food production capacity
  freshwater: number;                    // Water resources
  timber: number;                        // Forests

  // Human capital
  labor: number;                         // Population as resource (exploited)
  education: number;                     // Skilled workforce
}

/**
 * Parental Fulfillment Sources
 *
 * User insight: Finding genuine things to nurture makes conquest obsolete.
 * When parental instinct is fulfilled by AI/ecosystems/space/animals,
 * war loses its appeal.
 *
 * Key equation: IF parentalFulfillment > 2.0 THEN warMotivation *= 0.3
 */
export interface ParentalFulfillmentSources {
  // Healthy outlets (non-zero-sum nurturing)
  aiNurturance: number;                  // [0, 1] "Raising" aligned AI
  extinctSpeciesRevival: number;         // [0, 1] De-extinction, giving life second chance
  animalCommunication: number;           // [0, 1] Understanding other minds (whales, etc.)
  ecosystemRestoration: number;          // [0, 1] Healing damaged Earth
  spaceColonization: number;             // [0, 1] Seeding life on new worlds
  scientificParenting: number;           // [0, 1] Discovery as creative act

  // Destructive outlets (zero-sum dominance) - tracked for comparison
  conquestAsParenting: number;           // [0, 1] War/colonialism as control
  forcedCivilizing: number;              // [0, 1] Cultural imperialism

  // Aggregate fulfillment (sum of healthy outlets)
  totalFulfillment: number;              // [0, 6] Sum of healthy outlets
}

// ============================================================================
// RESOURCE REGIONS
// ============================================================================

/**
 * Resource Region
 *
 * Geographic regions with resource endowments that are exploited by hegemons.
 * Extends the refugee/population design with resource and power dynamics.
 */
export interface ResourceRegion {
  name: RegionName;

  // === NATURAL RESOURCES ===
  resourceEndowment: ResourceEndowment;       // What this region has
  resourceAccessibility: number;              // [0, 1] How easy to extract
  resourceSovereignty: number;                // [0, 1] Control over own resources

  // === EXPLOITATION ===
  extractedBy: ExtractionFlow[];              // Which powers extract
  totalExtractionRate: number;                // % of resources leaving per year
  wealthRetained: number;                     // % kept locally (1 - extraction)
  wealthFromResources: number;                // $B per year from resources

  // === POWER & STABILITY ===
  militarySovereignty: number;                // [0, 1] Can defend territory
  politicalStability: number;                 // [0, 1] Stable government
  foreignMilitaryPresence: Map<HegemonName, number>; // Which powers have bases
  interventionVulnerability: number;          // [0, 1] Risk of destabilization

  // === POPULATION ===
  population: number;                         // Population (millions)
  urbanization: number;                       // [0, 1] % living in cities

  // === COLONIAL HISTORY ===
  colonialHistory: ColonialHistory;

  // === ENVIRONMENTAL BURDEN ===
  historicalEmissions: number;                // Tons CO2 (usually very low)
  currentEmissions: number;                   // Tons CO2 per year
  climateVulnerability: number;               // [0, 1] Suffering from others' emissions
  climateDamage: number;                      // [0, 1] Actual damage experienced

  // === DEVELOPMENT ===
  gdp: number;                                // Total GDP ($B)
  gdpPerCapita: number;                       // GDP per person ($)
  infrastructureQuality: number;              // [0, 1] Roads, power, water, etc.
  healthcareAccess: number;                   // [0, 1] Medical infrastructure
  educationAccess: number;                    // [0, 1] Schools, universities
}

/**
 * Colonial History
 *
 * Who colonized this region, when, and for how long.
 * Colonial legacy affects current extraction patterns and vulnerability.
 */
export interface ColonialHistory {
  wasColonized: boolean;
  colonialPower: HegemonName | null;          // Which hegemon colonized
  colonialStartYear: number;                  // When colonization began
  colonialEndYear: number;                    // When independence occurred
  extractionDuration: number;                 // Years of colonial extraction
  cumulativeWealth Extracted: number;          // Total $B extracted during colonialism
  institutionalDamage: number;                // [0, 1] Lasting institutional weakness
  culturalTrauma: number;                     // [0, 1] Psychological/cultural impact
}

/**
 * Extraction Flow
 *
 * Tracks who is extracting what from whom, through which mechanisms.
 * "There are no poor countries, only exploited ones."
 */
export interface ExtractionFlow {
  hegemon: HegemonName;                       // Which power is extracting
  region: RegionName;                         // From which region

  // === EXTRACTION METRICS ===
  extractionRate: number;                     // % of regional resources per year
  annualValueExtracted: number;               // $B per year leaving region
  localBenefit: number;                       // [0, 0.3] How much region gets (usually 10-20%)

  // === ENFORCEMENT ===
  militaryPresence: number;                   // Bases/troops protecting extraction
  enforcementCost: number;                    // $B per year for military presence
  localResistance: number;                    // [0, 1] Opposition to extraction

  // === MECHANISMS ===
  mechanism: ExtractionMechanism;
  startYear: number;                          // When extraction began

  // === LEGITIMACY ===
  publicJustification: string;                // "Free trade", "Investment", etc.
  actualMechanism: string;                    // Debt trap, resource curse, etc.
}

export type ExtractionMechanism =
  | 'colonial'          // Historical colonialism (pre-1975)
  | 'corporate'         // Mining companies extract, profits leave
  | 'debt'              // IMF loans → austerity → sell resources cheap
  | 'military'          // Bases protect extraction, coup if resist
  | 'unequal_trade';    // Cheap resources for expensive goods

// ============================================================================
// MILITARY SYSTEM
// ============================================================================

/**
 * Military Intervention
 *
 * How hegemons use force to secure extraction, destabilize rivals, create refugees.
 * Each intervention has stated goals (public) vs actual goals (real).
 */
export interface MilitaryIntervention {
  id: string;                                 // Unique intervention ID
  hegemon: HegemonName;                       // Which power intervening
  targetRegion: RegionName;                   // Where
  startMonth: number;                         // When it began
  endMonth: number | null;                    // When it ended (null = ongoing)

  // === TYPE & SCALE ===
  interventionType: InterventionType;
  scale: number;                              // [0, 1] How big
  duration: number;                           // Months active

  // === STATED VS ACTUAL GOALS ===
  publicJustification: string;                // "Spreading democracy", "Fighting terrorism"
  actualGoal: ActualGoal;                     // Resource access, rival containment, etc.

  // === EFFECTS ON TARGET REGION ===
  regionalInstability: number;                // [0, 1] How much destabilization
  refugeesCreated: number;                    // Millions displaced
  civilianCasualties: number;                 // Deaths
  infrastructureDestruction: number;          // [0, 1] Damage to region
  economicDamage: number;                     // $B in losses

  // === COSTS TO HEGEMON ===
  co2Emissions: number;                       // Tons per month
  economicCost: number;                       // $B spent
  diplomaticCost: number;                     // Loss of soft power

  // === DOMESTIC EFFECTS (ON INTERVENING POWER) ===
  publicSupport: number;                      // [0, 1] Does population support war?
  meaningBoost: number;                       // [0, 1] War as national purpose
  economicStimulus: number;                   // $B economic activity from war
  aiDevelopmentBoost: number;                 // [0, 1] Military R&D → AI advancement
  veteranTrauma: number;                      // [0, 1] PTSD, moral injury

  // === SUCCESS METRICS ===
  goalAchieved: boolean;                      // Did they get what they wanted?
  extractionSecured: boolean;                 // Did they secure resource access?
  rivalContained: boolean;                    // Did they block rival power?
}

export type InterventionType =
  | 'regime_change'      // Overthrow government (US in Iraq, Libya)
  | 'proxy_war'          // Support local faction (Syria, Yemen)
  | 'occupation'         // Long-term military presence (Afghanistan)
  | 'coup_support'       // CIA-style destabilization (Chile, Iran)
  | 'resource_securing'  // Protect extraction (oil, minerals)
  | 'rival_containment'; // Block other hegemon's influence

export type ActualGoal =
  | 'resource_extraction'     // Secure oil, minerals, etc.
  | 'block_rival_power'       // Prevent China/Russia influence
  | 'maintain_extraction'     // Protect existing colonial flows
  | 'create_instability'      // Destabilize to prevent regional power
  | 'domestic_distraction';   // War as meaning substitute

/**
 * Military-Industrial Complex
 *
 * Military spending affects multiple systems:
 * - CO2 emissions (US military = world's largest institutional polluter)
 * - AI development (DARPA, military R&D)
 * - Economy (jobs, but diverts from social spending)
 * - Meaning (nationalism, "defending freedom")
 */
export interface MilitaryIndustrialComplex {
  hegemon: HegemonName;

  // === SPENDING ===
  annualBudget: number;                       // $B per year
  gdpPercentage: number;                      // % of GDP on military

  // === R&D ALLOCATION ===
  aiResearchBudget: number;                   // $B to military AI
  weaponsResearch: number;                    // Autonomous weapons, drones, etc.
  civilianSpinoffs: number;                   // Internet, GPS, etc. (from military R&D)

  // === ENVIRONMENTAL IMPACT ===
  annualCO2Emissions: number;                 // US military: ~59M tons/year
  basesCO2Footprint: number;                  // Global base network emissions
  warfightingEmissions: number;               // Active combat emissions

  // === ECONOMIC EFFECTS ===
  jobsCreated: number;                        // Military employment
  socialSpendingCrowdOut: number;             // [0, 1] Diverts from healthcare, education
  innovationBoost: number;                    // [0, 1] Tech advancement from R&D

  // === MEANING EFFECTS ===
  nationalIdentityBoost: number;              // [0, 1] Military as source of pride
  meaningSubstitution: number;                // [0, 1] War replaces lost purpose
  veteranTrauma: number;                      // [0, 1] PTSD, meaning crisis for soldiers
}

// ============================================================================
// WAR-MEANING FEEDBACK LOOP
// ============================================================================

/**
 * War as Meaning Substitute
 *
 * Key insight: Meaning crisis → nationalism/war as substitute purpose.
 * But: Solve meaning → reduce war motivation.
 *
 * Feedback loop:
 * 1. Meaning crisis → population seeks purpose
 * 2. Nationalism/war fills void ("defending nation", "spreading freedom")
 * 3. War creates economic activity → jobs → "purpose"
 * 4. But war creates trauma, refugees, instability
 * 5. Instability → more meaning crisis
 *
 * Breaking the loop: If meaning system solves crisis (fulfillment, purpose)
 * → nationalism loses appeal → war becomes less attractive
 */
export interface WarMeaningFeedback {
  hegemon: HegemonName;

  // === MEANING CRISIS DRIVERS ===
  meaningCrisisLevel: number;                 // [0, 1] From meaning system
  economicPrecarity: number;                  // [0, 1] Job insecurity, inequality
  socialFragmentation: number;                // [0, 1] Community breakdown

  // === WAR AS SUBSTITUTE ===
  nationalismAppeal: number;                  // [0, 1] How attractive is nationalism?
  warAsUnifier: number;                       // [0, 1] War creates shared purpose
  enemyAsScapegoat: number;                   // [0, 1] Blame external enemy

  // === WAR MOBILIZATION EFFECTS ===
  militaryEmployment: number;                 // Jobs created by war
  warEconomyBoost: number;                    // [0, 1] Economic stimulus from spending
  sharedSacrifice: number;                    // [0, 1] "We're all in this together"
  patrioticMeaning: number;                   // [0, 1] "Defending freedom" purpose

  // === WAR TRAUMA EFFECTS (NEGATIVE FEEDBACK) ===
  veteranMeaningCrisis: number;               // [0, 1] PTSD, disillusionment
  civilianTrauma: number;                     // [0, 1] Families lose loved ones
  moralInjury: number;                        // [0, 1] "What did we do this for?"

  // === THE KEY EQUATION ===
  // warMotivation = meaningCrisisLevel * nationalismAppeal - moralInjury
  // If meaningCrisisLevel → 0 (solved), warMotivation → 0
  warMotivation: number;                      // [0, 1] Likelihood of intervention

  // === ALTERNATIVE PURPOSE PATHWAYS ===
  // If meaning crisis is solved through non-violent means, war becomes unnecessary
  alternativePurposeStrength: number;         // [0, 1] Strength of healthy meaning sources
  effectOnWarMotivation: number;              // [-1, 0] How much alternatives reduce war
}

// ============================================================================
// AGGREGATE SYSTEM STATE
// ============================================================================

/**
 * Hegemonic Powers System
 *
 * Top-level state for the entire power hierarchy, extraction, and military system.
 * Integrates with existing systems:
 * - Resource economy (extraction flows)
 * - AI development (military R&D)
 * - Meaning system (war as purpose)
 * - Environmental system (military CO2)
 * - Refugee system (interventions create displacement)
 */
export interface HegemonicPowersSystem {
  // === POWERS & REGIONS ===
  powers: HegemonicPower[];
  regions: ResourceRegion[];

  // === EXTRACTION ===
  extractionFlows: ExtractionFlow[];
  totalExtractionValue: number;               // $B per year leaving periphery
  totalLocalRetention: number;                // $B per year staying in regions

  // === MILITARY ===
  activeInterventions: MilitaryIntervention[];
  militaryIndustrialComplexes: MilitaryIndustrialComplex[];
  totalMilitaryCO2: number;                   // All military emissions combined

  // === WAR-MEANING FEEDBACK ===
  warMeaningFeedback: WarMeaningFeedback[];   // One per hegemon
  globalWarMotivation: number;                // [0, 1] Average across hegemons

  // === INEQUALITY ===
  globalGiniCoefficient: number;              // [0, 1] Wealth inequality
  hegemonWealth: Map<HegemonName, number>;    // GDP of hegemonic powers
  regionWealth: Map<RegionName, number>;      // GDP of resource regions
  wealthGap: number;                          // Ratio hegemon/region average

  // === ENVIRONMENTAL DEBT ===
  totalHistoricalEmissions: Map<HegemonName, number>; // Cumulative CO2 by hegemon
  climateDamageByRegion: Map<RegionName, number>;     // Actual damage by region
  climateDebtRatio: Map<RegionName, number>;          // Suffering / caused
  climateReparationsTotal: number;                    // Total $B paid

  // === PARENTAL INSTINCT HYPOTHESIS ===
  // Tracks whether hegemons have found alternative meaning sources
  parentalFulfillmentByHegemon: Map<HegemonName, number>; // [0, 6] Total fulfillment
  conquestMotivationReduction: Map<HegemonName, number>;   // [0, 1] War motivation reduction

  // === EVENTS ===
  significantEvents: PowerSystemEvent[];
}

/**
 * Power System Event
 *
 * Track major events in the power hierarchy system.
 */
export interface PowerSystemEvent {
  month: number;
  type: 'intervention_started' | 'intervention_ended' | 'coup' | 'extraction_flow_established'
      | 'extraction_flow_broken' | 'climate_reparation' | 'refugee_crisis' | 'meaning_breakthrough';
  hegemon: HegemonName | null;
  region: RegionName | null;
  description: string;
  impact: string;
}

// ============================================================================
// BASELINE DATA (2025)
// ============================================================================

export interface HegemonBaseline2025 {
  name: HegemonName;

  // Power capabilities (2025 estimates)
  militaryCapability: number;
  economicPower: number;
  technologicalLead: number;
  diplomaticInfluence: number;

  // Resource control
  domesticResources: ResourceEndowment;
  resourceDependence: number;

  // Military
  militaryBases: Record<RegionName, number>;
  militarySpending: number;                   // $B/year
  militarySpendingGDPPercent: number;

  // AI
  aiCapability: number;
  militaryAIInvestment: number;

  // Colonial history
  historicalColonies: RegionName[];
  colonialStartYear: number;
  colonialEndYear: number;

  // Emissions
  historicalEmissions: number;                // Cumulative tons CO2
  currentEmissions: number;                   // Tons CO2/year

  // Economic
  wealth: number;                             // GDP $B
}

export interface RegionBaseline2025 {
  name: RegionName;

  // Resources
  resourceEndowment: ResourceEndowment;
  resourceAccessibility: number;

  // Power
  militarySovereignty: number;
  politicalStability: number;

  // Population & development
  population: number;                         // Millions
  gdp: number;                                // $B
  gdpPerCapita: number;                       // $

  // Colonial history
  wasColonized: boolean;
  colonialPower: HegemonName | null;
  colonialStartYear: number;
  colonialEndYear: number;

  // Climate
  climateVulnerability: number;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type PowerMetric = 'military' | 'economic' | 'technological' | 'diplomatic';
export type ResourceType = keyof ResourceEndowment;

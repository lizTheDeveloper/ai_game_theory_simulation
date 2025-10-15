/**
 * Resource Endowment System - TIER 2.8 Phase 1
 *
 * Models natural resource endowments per country and extraction flows between hegemons and regions.
 *
 * KEY INSIGHTS:
 * - "There are no poor countries, only exploited ones" (user insight)
 * - Resource inequality drives extraction, which drives intervention, which drives war
 * - Sovereignty = control over own resources (often compromised by hegemons)
 * - Extraction mechanisms: Colonial, corporate, debt, military, unequal trade
 *
 * ============================================================================
 * RESEARCH VALIDATION - ALL CATEGORIES GROUNDED IN REAL 2024-2025 DATA
 * ============================================================================
 *
 * **MINERALS (USGS Mineral Commodities Summaries 2024):**
 * - Rare Earths: China 70% global production, Myanmar 20%, US 1%
 * - Lithium: Bolivia 21M tons reserves (largest), Chile 11M, Argentina 9.8M ("lithium triangle")
 * - Cobalt: DRC 70% production (3.9M tons reserves), Australia 1.3M, Russia 0.5M
 * - Copper: Chile 190M tons reserves (23% global), Peru 92M, Australia 88M
 * - Iron Ore: Australia 51B tons, Brazil 34B, Russia 25B
 * Source: https://www.usgs.gov/centers/national-minerals-information-center/mineral-commodity-summaries
 *
 * **ENERGY (IEA World Energy Outlook 2024, BP Statistical Review 2024):**
 * - Oil Reserves: Saudi 297B barrels, Venezuela 304B, Canada 168B, Iran 158B, Russia 107B
 * - Natural Gas: Russia 47.8 trillion m³ (24% global), Iran 32.1, Qatar 24.7, Turkmenistan 13.6
 * - Coal: US 249B tons, Russia 162B, China 138B, Australia 147B, India 111B
 * - Renewable Potential: Varies by geography (solar belt, wind corridors, hydro)
 * Source: https://www.iea.org/reports/world-energy-outlook-2024
 *
 * **AGRICULTURE (World Bank WDI 2024, FAO 2024):**
 * - Arable Land: India 156M ha (11% of land), US 152M (16%), Russia 122M (7%), China 119M (12%)
 * - Irrigation: India uses 90% of withdrawals for agriculture, China 65%, US 37%
 * - Soil Degradation: 33% of global soils degraded (FAO), worst in Sub-Saharan Africa
 * - Fisheries: China 15M tons/year, Indonesia 7M, Peru 6M (anchoveta), US 5M
 * Source: https://data.worldbank.org/indicator, http://www.fao.org/statistics/
 *
 * **FRESH WATER (UN Water Development Report 2024, IPCC AR6):**
 * - Surface Water: Brazil has 20% of global renewable freshwater (Amazon, Paraná)
 * - Groundwater: 70% of all freshwater withdrawals globally (unsustainable in many regions)
 * - Rainfall: Meghalaya (India) receives 11,872mm/year, Atacama (Chile) <0.1mm/year
 * Source: https://www.unwater.org/publications/un-world-water-development-report-2024
 *
 * **FORESTS (FAO Forest Resources Assessment 2024):**
 * - Forest Cover: Russia 815M ha (20% global), Brazil 497M, Canada 347M, US 310M, China 220M
 * - Old Growth: Russia has largest intact forest landscapes (236M ha)
 * - Deforestation: Brazil lost 1.5M ha/year (2015-2020), Indonesia 0.5M ha/year
 * - Timber Value: Russia $10B exports/year, Canada $12B, Sweden $11B
 * Source: https://www.fao.org/forest-resources-assessment/
 *
 * **BIODIVERSITY (IPBES 2024, Conservation International):**
 * - Species Richness: Brazil 20% of all species, Indonesia 17%, Colombia 10%, Peru 10%
 * - Endemic Species: Madagascar 90% endemism, New Zealand 80%, Australia 85%
 * - Ecosystem Services: Valued at $125 trillion/year globally (Costanza et al. 2014 updated)
 * Source: https://www.ipbes.net/global-assessment
 *
 * **LABOR (World Bank WDI 2024, ILO 2024):**
 * - Population: India 1.43B, China 1.42B, US 335M, Indonesia 277M, Pakistan 235M
 * - Education: Germany 14.1 years average schooling, US 13.7, Japan 13.4, China 8.1, India 6.7
 * - Wages: Switzerland $64/hour average, Norway $54, US $28, China $6.50, India $2.30
 * Source: https://data.worldbank.org/indicator/SE.SCH.LIFE
 *
 * **PHOSPHORUS (USGS 2024, same as TIER 1.1):**
 * - Reserves: Morocco 50B tons (70% global), China 3.2B, Egypt 2.8B, Algeria 2.2B
 * - Production: China 95M tons/year, Morocco 40M, US 23M
 * - Peak Phosphorus: 50-100 years at current rates (van Kauwenbergh 2010, updated)
 * Source: https://www.usgs.gov/centers/national-minerals-information-center/phosphate-rock-statistics-and-information
 *
 * **STRATEGIC RESOURCES (IAEA 2024, USGS 2024):**
 * - Uranium: Kazakhstan 344K tons reserves, Australia 326K, Canada 290K, Russia 250K
 * - Graphite (batteries): China 73M tons, Brazil 70M, Turkey 90M
 * - Manganese (steel): South Africa 640M tons, Ukraine 140M, Australia 97M
 * Source: https://www.iaea.org/publications, https://www.usgs.gov/
 *
 * **INTELLECTUAL PROPERTY (WIPO 2024, NSF 2024):**
 * - Patents: China 1.59M applications/year, US 594K, Japan 289K, South Korea 228K
 * - Research Output: China 744K scientific papers/year, US 422K, India 208K, Germany 105K
 * - Tech Leadership: US leads in AI/biotech, China in 5G/batteries, EU in renewables
 * Source: https://www.wipo.int/publications/, https://ncses.nsf.gov/
 *
 * **EXTRACTION (Hickel et al. 2022, Hickel & Sullivan 2019):**
 * - Total Drain: $152 trillion from Global South to North (1960-2018)
 * - Unequal Exchange: $2.2 trillion/year current rate
 * - Mechanisms: Underpaid labor ($2.8T), underpriced resources ($0.9T), debt service ($0.5T)
 * - Examples:
 *   * DRC Cobalt: 70% global production, but DRC captures <10% of value
 *   * Nigerian Oil: $400B stolen by elites + foreign corps (1960-1999)
 *   * Latin America Debt: $4.2 trillion owed, perpetual austerity
 * Source: Hickel, J. et al. (2022). "Imperialist appropriation in the world economy."
 *         New Political Economy. DOI: 10.1080/13563467.2021.1899153
 *
 * **IMF/WORLD BANK STRUCTURAL ADJUSTMENT (Stiglitz 2002, Hickel 2017):**
 * - 88 countries under structural adjustment programs (1980-1999)
 * - Conditions: Privatize resources, cut social spending, devalue currency, open markets
 * - Result: Resource extraction increased, local benefit decreased
 * - Example: Ghana forced to privatize mines → foreign companies control 90% of gold
 * Source: Stiglitz, J. (2002). "Globalization and Its Discontents"
 *
 * **MILITARY BASES & INTERVENTION (Vine 2020, Brown Univ. Costs of War 2024):**
 * - US: 750 military bases in 80 countries (securing resource access)
 * - Iraq War: $3 trillion cost, but secured oil contracts for US/UK companies
 * - Libya Intervention: Oil production collapsed, but extraction resumed under Western firms
 * - Resource wars: 25% of civil wars are resource-related (Le Billon 2012)
 * Source: Vine, D. (2020). "The United States of War"
 *
 * ============================================================================
 * SCALING PHILOSOPHY
 * ============================================================================
 *
 * All resources use [0, 100] scales for consistency:
 * - 0 = Country has none of this resource
 * - 50 = Country has average/moderate amount
 * - 100 = Country is global leader/dominant producer
 *
 * These are RELATIVE scales (relative to other countries), not absolute units.
 * This allows meaningful comparison across diverse resource types.
 *
 * For resources with extreme concentration (rare earths, phosphorus, cobalt):
 * - 100 = The dominant producer (China rare earths, Morocco phosphorus, DRC cobalt)
 * - Other countries scaled proportionally
 *
 * For resources with more distributed production (iron ore, agriculture):
 * - 100 = Largest producer
 * - Top 5 producers typically in 50-100 range
 * - Others scaled logarithmically (since distribution is power-law)
 */

/**
 * Natural resource categories tracked per country
 *
 * Based on:
 * - USGS Mineral Commodities Summaries 2024
 * - IEA World Energy Outlook 2024
 * - World Bank agricultural data 2024
 * - UN Water Development Report 2024
 */
export interface ResourceEndowment {
  // MINERALS (critical for technology, infrastructure)
  minerals: {
    // Rare earth elements (China 70% global, critical for tech)
    rareEarths: number;        // [0, 100] Scale: 0=none, 100=China dominance

    // Lithium (Bolivia/Chile/Argentina triangle, EV batteries)
    lithium: number;           // [0, 100] Scale: 0=none, 100=Bolivia reserves

    // Cobalt (DRC 70% global, batteries, military)
    cobalt: number;            // [0, 100] Scale: 0=none, 100=DRC dominance

    // Copper (Chile/Peru, all infrastructure)
    copper: number;            // [0, 100] Scale: 0=none, 100=Chile production

    // Iron ore (Australia/Brazil, steel production)
    ironOre: number;           // [0, 100] Scale: 0=none, 100=Australia reserves
  };

  // ENERGY (oil, gas, coal - drives geopolitics)
  energy: {
    // Oil reserves (Saudi/Russia/US, measured in billion barrels)
    oil: number;               // [0, 100] Scale: 0=none, 100=Saudi dominance

    // Natural gas (Russia/Iran/Qatar, measured in trillion cubic meters)
    naturalGas: number;        // [0, 100] Scale: 0=none, 100=Russia reserves

    // Coal (China/US/India, climate liability)
    coal: number;              // [0, 100] Scale: 0=none, 100=China reserves

    // Renewable potential (solar/wind capacity, geographic advantages)
    renewablePotential: number; // [0, 100] Scale: based on sun/wind/hydro geography
  };

  // AGRICULTURE (food production capacity)
  agriculture: {
    // Arable land (% of total land suitable for crops)
    arableLand: number;        // [0, 100] Scale: % of land area

    // Water for irrigation (crucial for food security)
    irrigationWater: number;   // [0, 100] Scale: renewable water per capita

    // Soil quality (degradation vs fertility)
    soilQuality: number;       // [0, 100] Scale: 100=pristine, 0=degraded

    // Fisheries (ocean access and fish stocks)
    fisheries: number;         // [0, 100] Scale: sustainable catch potential
  };

  // FRESH WATER (rivers, aquifers, rainfall)
  freshWater: {
    // Surface water (rivers, lakes)
    surfaceWater: number;      // [0, 100] Scale: renewable water resources

    // Groundwater (aquifers, some non-renewable)
    groundwater: number;       // [0, 100] Scale: aquifer reserves

    // Rainfall (climate-dependent, changing)
    rainfall: number;          // [0, 100] Scale: average annual precipitation
  };

  // FORESTS (carbon sinks, biodiversity, timber)
  forests: {
    // Forest cover (% of land)
    forestCover: number;       // [0, 100] Scale: % forest coverage

    // Old growth (high biodiversity, carbon storage)
    oldGrowth: number;         // [0, 100] Scale: % primary forest

    // Timber value (commercial forestry potential)
    timberValue: number;       // [0, 100] Scale: commercial timber stocks
  };

  // BIODIVERSITY (genetic resources, pharmaceutical potential)
  biodiversity: {
    // Species richness (number of species)
    speciesRichness: number;   // [0, 100] Scale: relative to global hotspots

    // Endemic species (unique to region, pharmaceutical potential)
    endemicSpecies: number;    // [0, 100] Scale: % unique species

    // Ecosystem services (pollination, pest control, etc)
    ecosystemServices: number; // [0, 100] Scale: value of services
  };

  // LABOR (human capital)
  labor: {
    // Population size (workforce)
    populationSize: number;    // Millions of people

    // Education level (human capital quality)
    educationLevel: number;    // [0, 100] Scale: years of schooling

    // Wage level (labor cost)
    wageLevel: number;         // [0, 100] Scale: average hourly wage
  };

  // LAND (geographic value)
  land: {
    // Total area (strategic depth, resources)
    totalArea: number;         // Million km²

    // Strategic location (trade routes, chokepoints)
    strategicValue: number;    // [0, 100] Scale: geopolitical importance

    // Coastal access (ports, trade, naval power)
    coastalAccess: number;     // [0, 100] Scale: coastline length & quality
  };

  // PHOSPHORUS (fertilizer, no substitutes, Morocco 70% control)
  phosphorus: {
    // Rock phosphate reserves (measured in million tons)
    reserves: number;          // [0, 100] Scale: 0=none, 100=Morocco dominance

    // Annual production capacity
    production: number;        // [0, 100] Scale: tons per year
  };

  // RARE STRATEGIC RESOURCES (uranium, etc)
  strategic: {
    // Uranium (nuclear power/weapons)
    uranium: number;           // [0, 100] Scale: 0=none, 100=Kazakhstan/Australia

    // Other critical minerals (graphite, manganese, etc)
    otherCritical: number;     // [0, 100] Scale: aggregate of other strategic minerals
  };

  // INTELLECTUAL PROPERTY (patents, technology, research)
  intellectual: {
    // Patent ownership (innovation capacity)
    patents: number;           // [0, 100] Scale: patents per capita

    // Research output (scientific publications)
    research: number;          // [0, 100] Scale: papers per capita

    // Technology leadership (cutting-edge sectors)
    techLeadership: number;    // [0, 100] Scale: sectors where country leads
  };
}

/**
 * Resource sovereignty: How much control does a country have over its own resources?
 *
 * MECHANISMS THAT REDUCE SOVEREIGNTY:
 * - Colonial history (extraction infrastructure still controlled by former colonizers)
 * - Corporate control (mining companies, profits leave country)
 * - Debt obligations (IMF loans → austerity → cheap resource sales)
 * - Military presence (foreign bases, intervention threats)
 * - Unequal trade agreements (forced to sell raw materials cheap)
 * - Coup risk (governments that nationalize resources often overthrown)
 */
export interface ResourceSovereignty {
  // Overall sovereignty score [0, 1]
  // 1.0 = full control (Norway oil fund model)
  // 0.5 = partial control (some local benefit)
  // 0.0 = pure extraction (DRC cobalt model)
  overallSovereignty: number;

  // Per-resource sovereignty (some resources more controlled than others)
  resourceControl: {
    minerals: number;          // [0, 1] Control over mineral extraction
    energy: number;            // [0, 1] Control over oil/gas
    agriculture: number;       // [0, 1] Control over food production
    water: number;             // [0, 1] Control over water resources
    forests: number;           // [0, 1] Control over timber/conservation
    labor: number;             // [0, 1] Worker rights, wage control
    intellectual: number;      // [0, 1] Patent/tech ownership
  };

  // Factors affecting sovereignty
  factors: {
    colonialLegacy: number;    // [0, 1] Historical extraction patterns persist
    corporateControl: number;  // [0, 1] % of resources controlled by foreign corps
    debtBurden: number;        // [0, 1] IMF/World Bank loan conditions
    militaryPresence: number;  // [0, 1] Foreign military bases/threats
    tradeBalance: number;      // [-1, 1] Favorable (+) or exploitative (-)
    politicalStability: number; // [0, 1] Coup risk, regime change threats
  };
}

/**
 * Extraction flow: Transfer of resources from one country to another
 *
 * EXTRACTION MECHANISMS (Hickel et al. 2022):
 * 1. **Colonial:** Direct seizure (pre-1975, mostly ended but infrastructure persists)
 * 2. **Corporate:** Mining companies extract, profits leave (DRC cobalt: 10% stays local)
 * 3. **Debt:** IMF loans → austerity → forced resource sales at low prices
 * 4. **Military:** Bases protect extraction infrastructure, intervention threats
 * 5. **Unequal Trade:** Raw materials sold cheap, manufactured goods bought expensive
 * 6. **Intellectual Property:** Patents prevent local production, force imports
 */
export type ExtractionMechanism =
  | 'colonial'           // Historical: Direct seizure by colonizing power
  | 'corporate'          // Mining/oil companies, profits extracted via tax havens
  | 'debt'               // IMF/World Bank structural adjustment, austerity
  | 'military'           // Bases secure extraction, intervention threats
  | 'unequal_trade'      // Terms of trade favor hegemons (manufactured goods expensive)
  | 'intellectual'       // Patents prevent local production, force licensing fees
  | 'land_grab'          // Foreign ownership of agricultural land
  | 'brain_drain';       // Educated workers emigrate to hegemons

/**
 * Extraction flow: Who extracts what from whom, by what mechanism
 */
export interface ExtractionFlow {
  // Who is extracting?
  extractingCountry: string;     // Hegemon name (US, China, Russia, India, UK)

  // Who is being extracted from?
  sourceCountry: string;         // Country name or region

  // What mechanism?
  mechanism: ExtractionMechanism;

  // How much is extracted? [0, 1]
  // 1.0 = 100% of resource value leaves country
  // 0.5 = 50% extracted, 50% stays local
  // 0.0 = no extraction (fair trade)
  extractionRate: number;

  // Annual value extracted (billions USD per year)
  annualValueExtracted: number;

  // What % stays in source country? [0, 1]
  // Norway oil: 90% stays (sovereign wealth fund)
  // DRC cobalt: 10% stays (rest to foreign companies)
  localBenefit: number;

  // Which resources are being extracted?
  resourcesExtracted: {
    minerals?: boolean;
    energy?: boolean;
    agriculture?: boolean;
    labor?: boolean;           // Brain drain, cheap labor exploitation
    intellectual?: boolean;    // Reverse IP flow (rare, China → US in some sectors)
  };

  // Historical context
  colonialHistory: {
    wasColony: boolean;         // Was source country colonized by extractor?
    independenceYear?: number;  // When did colonial rule end?
    extractionSince: number;    // Year extraction began (may predate independence)
  };

  // Current enforcement
  enforcement: {
    militaryBases: number;      // # of extractor's military bases in source
    debtLeverage: number;       // [0, 1] Debt as % of GDP (leverage for extraction)
    corporatePresence: number;  // [0, 1] % of economy controlled by foreign corps
    interventionThreat: number; // [0, 1] Likelihood of regime change if resist
  };
}

/**
 * Total resource value calculation
 *
 * Used for:
 * - GDP contribution (resource-rich countries should be wealthy)
 * - Extraction incentive (hegemons target high-value regions)
 * - Sovereignty importance (more valuable = more contested)
 */
export interface ResourceValue {
  // Total resource wealth (trillions USD)
  totalValue: number;

  // Breakdown by category
  breakdown: {
    minerals: number;          // Value of mineral reserves
    energy: number;            // Value of oil/gas/coal
    agriculture: number;       // Annual agricultural production value
    water: number;             // Fresh water value (scarce resource)
    forests: number;           // Timber + ecosystem services value
    biodiversity: number;      // Genetic resources, pharmaceutical potential
    labor: number;             // Human capital value (education × population)
    land: number;              // Strategic location value
    intellectual: number;      // Patent/research value
  };

  // What % is actually captured by local economy?
  // (vs extracted by hegemons)
  localCaptureRate: number;    // [0, 1] Depends on sovereignty

  // What % flows to hegemons?
  extractionRate: number;      // [0, 1] = 1 - localCaptureRate
}

/**
 * Helper type: Country with resource data
 * (Will be merged into CountryPopulation in Task 1.2)
 */
export interface CountryResourceData {
  countryName: string;

  // Natural endowments (what the country has)
  domesticResources: ResourceEndowment;

  // Sovereignty (how much control they have)
  sovereignty: ResourceSovereignty;

  // Resource value (how wealthy they should be)
  resourceValue: ResourceValue;

  // Who extracts from them?
  extractedBy: ExtractionFlow[];

  // If hegemon: who do they extract from?
  extractionTargets?: ExtractionFlow[];
}

/**
 * Create empty resource endowment (for initialization)
 */
export function createEmptyResourceEndowment(): ResourceEndowment {
  return {
    minerals: {
      rareEarths: 0,
      lithium: 0,
      cobalt: 0,
      copper: 0,
      ironOre: 0,
    },
    energy: {
      oil: 0,
      naturalGas: 0,
      coal: 0,
      renewablePotential: 0,
    },
    agriculture: {
      arableLand: 0,
      irrigationWater: 0,
      soilQuality: 0,
      fisheries: 0,
    },
    freshWater: {
      surfaceWater: 0,
      groundwater: 0,
      rainfall: 0,
    },
    forests: {
      forestCover: 0,
      oldGrowth: 0,
      timberValue: 0,
    },
    biodiversity: {
      speciesRichness: 0,
      endemicSpecies: 0,
      ecosystemServices: 0,
    },
    labor: {
      populationSize: 0,
      educationLevel: 0,
      wageLevel: 0,
    },
    land: {
      totalArea: 0,
      strategicValue: 0,
      coastalAccess: 0,
    },
    phosphorus: {
      reserves: 0,
      production: 0,
    },
    strategic: {
      uranium: 0,
      otherCritical: 0,
    },
    intellectual: {
      patents: 0,
      research: 0,
      techLeadership: 0,
    },
  };
}

/**
 * Create default sovereignty (full control)
 */
export function createDefaultSovereignty(): ResourceSovereignty {
  return {
    overallSovereignty: 1.0,
    resourceControl: {
      minerals: 1.0,
      energy: 1.0,
      agriculture: 1.0,
      water: 1.0,
      forests: 1.0,
      labor: 1.0,
      intellectual: 1.0,
    },
    factors: {
      colonialLegacy: 0.0,
      corporateControl: 0.0,
      debtBurden: 0.0,
      militaryPresence: 0.0,
      tradeBalance: 0.0,
      politicalStability: 1.0,
    },
  };
}

/**
 * Calculate total resource value
 *
 * Approximation based on:
 * - USGS mineral valuations
 * - IEA energy market prices
 * - World Bank agricultural GDP contributions
 * - Ecosystem services valuations (Costanza et al.)
 */
export function calculateResourceValue(
  endowment: ResourceEndowment,
  sovereignty: ResourceSovereignty
): ResourceValue {
  // Rough valuation multipliers (trillions USD equivalent)
  const mineralValue =
    endowment.minerals.rareEarths * 0.05 +
    endowment.minerals.lithium * 0.1 +
    endowment.minerals.cobalt * 0.03 +
    endowment.minerals.copper * 0.08 +
    endowment.minerals.ironOre * 0.06;

  const energyValue =
    endowment.energy.oil * 0.5 +           // Oil is huge
    endowment.energy.naturalGas * 0.3 +
    endowment.energy.coal * 0.1 +
    endowment.energy.renewablePotential * 0.05;

  const agValue =
    endowment.agriculture.arableLand * 0.02 +
    endowment.agriculture.irrigationWater * 0.01 +
    endowment.agriculture.soilQuality * 0.01 +
    endowment.agriculture.fisheries * 0.02;

  const waterValue =
    (endowment.freshWater.surfaceWater +
     endowment.freshWater.groundwater +
     endowment.freshWater.rainfall) / 3 * 0.05;

  const forestValue =
    endowment.forests.forestCover * 0.02 +
    endowment.forests.oldGrowth * 0.03 +  // Old growth more valuable
    endowment.forests.timberValue * 0.01;

  const bioValue =
    endowment.biodiversity.speciesRichness * 0.01 +
    endowment.biodiversity.endemicSpecies * 0.02 +  // Pharma potential
    endowment.biodiversity.ecosystemServices * 0.03;

  const laborValue =
    endowment.labor.populationSize * 0.00001 *  // Per capita contribution
    endowment.labor.educationLevel *
    (endowment.labor.wageLevel / 100);

  const landValue =
    endowment.land.totalArea * 0.001 +
    endowment.land.strategicValue * 0.05 +
    endowment.land.coastalAccess * 0.02;

  const phosphorusValue =
    endowment.phosphorus.reserves * 0.01 +
    endowment.phosphorus.production * 0.005;

  const strategicValue =
    endowment.strategic.uranium * 0.03 +
    endowment.strategic.otherCritical * 0.02;

  const intellectualValue =
    endowment.intellectual.patents * 0.1 +
    endowment.intellectual.research * 0.05 +
    endowment.intellectual.techLeadership * 0.2;

  const totalValue =
    mineralValue + energyValue + agValue + waterValue + forestValue +
    bioValue + laborValue + landValue + phosphorusValue + strategicValue +
    intellectualValue;

  // How much is actually captured locally?
  const localCaptureRate = sovereignty.overallSovereignty;
  const extractionRate = 1.0 - localCaptureRate;

  return {
    totalValue,
    breakdown: {
      minerals: mineralValue,
      energy: energyValue,
      agriculture: agValue,
      water: waterValue,
      forests: forestValue,
      biodiversity: bioValue,
      labor: laborValue,
      land: landValue,
      intellectual: intellectualValue,
    },
    localCaptureRate,
    extractionRate,
  };
}

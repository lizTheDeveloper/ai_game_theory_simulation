/**
 * TIER 2.8 Phase 1: Resource Initialization
 *
 * Research-backed resource endowments for all 15 tracked countries.
 *
 * DATA SOURCES:
 * - USGS Mineral Commodities Summaries 2024
 * - IEA World Energy Outlook 2024
 * - World Bank World Development Indicators 2024
 * - FAO Forest Resources Assessment 2024
 * - UN Water Development Report 2024
 * - IPBES Global Assessment 2024
 * - WIPO Patent Statistics 2024
 * - Hickel et al. (2022) - Extraction data
 *
 * SCALING: All resources use [0-100] relative scales
 * - 100 = Global leader/dominant producer
 * - 50 = Average/moderate
 * - 0 = None/minimal
 */

import {
  ResourceEndowment,
  ResourceSovereignty,
  createEmptyResourceEndowment,
  createDefaultSovereignty,
  calculateResourceValue,
} from '../types/resourceEndowment';
import { CountryName } from '../types/countryPopulations';

/**
 * Initialize resource endowments for United States
 *
 * HEGEMON: Yes (primary global hegemon)
 * - Military: 750 bases in 80 countries, $800B/year spending
 * - Resources: Diverse (oil, gas, agriculture, tech leadership)
 * - Extraction: Major extractor (Middle East oil, Latin America, Africa)
 * - Environmental Debt: 400+ Gt historical emissions (25% of all time)
 */
export function initializeUSResources(): {
  resources: ResourceEndowment;
  sovereignty: ResourceSovereignty;
} {
  return {
    resources: {
      minerals: {
        rareEarths: 1,      // China dominates, US has 1% production
        lithium: 5,         // Has reserves, not major producer
        cobalt: 0,          // No significant cobalt
        copper: 25,         // Major producer, 4th globally
        ironOre: 10,        // Declining, mostly imports
      },
      energy: {
        oil: 50,            // 4th largest reserves (68B barrels), fracking boom
        naturalGas: 35,     // 5th largest reserves, major producer
        coal: 85,           // 2nd largest reserves (249B tons)
        renewablePotential: 75, // Excellent solar/wind, diverse geography
      },
      agriculture: {
        arableLand: 75,     // 152M ha, 16% of land (excellent)
        irrigationWater: 60, // Adequate but regional stress (California)
        soilQuality: 70,    // Good overall, some degradation
        fisheries: 40,      // Both coasts, but overfished
      },
      freshWater: {
        surfaceWater: 60,   // Great Lakes, Mississippi, rivers
        groundwater: 50,    // Ogallala aquifer depleting
        rainfall: 65,       // Variable, adequate most regions
      },
      forests: {
        forestCover: 55,    // 310M ha, 33% of land
        oldGrowth: 5,       // Most logged historically
        timberValue: 60,    // Major timber industry
      },
      biodiversity: {
        speciesRichness: 45, // Diverse but not hotspot
        endemicSpecies: 20, // Some unique species
        ecosystemServices: 55, // Valuable but degraded
      },
      labor: {
        populationSize: 335, // Millions
        educationLevel: 90, // 13.7 years average schooling
        wageLevel: 80,      // $28/hour average (high)
      },
      land: {
        totalArea: 9.8,     // Million km² (4th largest)
        strategicValue: 95, // Two ocean coasts, no land threats
        coastalAccess: 90,  // Both Atlantic and Pacific
      },
      phosphorus: {
        reserves: 10,       // 1.2B tons (Morocco dominates)
        production: 50,     // 23M tons/year (major producer)
      },
      strategic: {
        uranium: 35,        // 207K tons reserves (6th globally)
        otherCritical: 30,  // Has some, not dominant
      },
      intellectual: {
        patents: 80,        // 594K applications/year (2nd)
        research: 75,       // 422K papers/year (2nd)
        techLeadership: 95, // Leads in AI, biotech, software
      },
    },
    sovereignty: {
      overallSovereignty: 0.95, // Very high control over resources
      resourceControl: {
        minerals: 0.9,
        energy: 0.9,      // Some foreign ownership but mostly controlled
        agriculture: 0.95,
        water: 0.9,
        forests: 0.9,
        labor: 0.85,      // Strong labor rights, some exploitation
        intellectual: 0.98, // Near-total control
      },
      factors: {
        colonialLegacy: 0.0,  // Colonizer, not colonized
        corporateControl: 0.1, // Mostly domestic corps
        debtBurden: 0.0,      // Reserve currency, no IMF constraints
        militaryPresence: 0.0, // No foreign bases
        tradeBalance: 0.2,    // Favorable terms as hegemon
        politicalStability: 0.8, // Generally stable
      },
    },
  };
}

/**
 * Initialize resource endowments for China
 *
 * HEGEMON: Yes (rising challenger)
 * - Military: Growing global reach, Belt & Road
 * - Resources: Rare earths dominant (70%), coal, manufacturing
 * - Extraction: Growing (Africa minerals, Latin America)
 * - Environmental Debt: 220 Gt emissions (recent, rapid)
 */
export function initializeChinaResources(): {
  resources: ResourceEndowment;
  sovereignty: ResourceSovereignty;
} {
  return {
    resources: {
      minerals: {
        rareEarths: 100,    // 70% global production (dominant)
        lithium: 5,         // Has reserves, not major
        cobalt: 2,          // Minimal domestic, controls DRC via investment
        copper: 10,         // Some production
        ironOre: 30,        // Major producer but insufficient, imports
      },
      energy: {
        oil: 15,            // 26B barrels (insufficient for needs)
        naturalGas: 20,     // 6.6 trillion m³
        coal: 95,           // Largest reserves (138B tons), major producer
        renewablePotential: 70, // Investing heavily, excellent solar
      },
      agriculture: {
        arableLand: 60,     // 119M ha, but 12% of land (limited)
        irrigationWater: 50, // Major irrigation but water stress
        soilQuality: 50,    // Degradation issues
        fisheries: 100,     // 15M tons/year (largest by far)
      },
      freshWater: {
        surfaceWater: 40,   // Yangtze, Yellow River (polluted)
        groundwater: 30,    // Serious depletion
        rainfall: 50,       // Variable, monsoon-dependent
      },
      forests: {
        forestCover: 40,    // 220M ha, 22% of land (reforestation efforts)
        oldGrowth: 5,       // Most cleared historically
        timberValue: 30,    // Imports most timber
      },
      biodiversity: {
        speciesRichness: 55, // High diversity
        endemicSpecies: 40, // Many unique species (pandas, etc)
        ecosystemServices: 40, // Degraded from development
      },
      labor: {
        populationSize: 1425, // Millions
        educationLevel: 50, // 8.1 years average schooling
        wageLevel: 20,      // $6.50/hour average
      },
      land: {
        totalArea: 9.6,     // Million km² (3rd largest)
        strategicValue: 85, // Pacific coast, land borders
        coastalAccess: 70,  // Long coastline, South China Sea
      },
      phosphorus: {
        reserves: 25,       // 3.2B tons (2nd after Morocco)
        production: 100,    // 95M tons/year (largest producer)
      },
      strategic: {
        uranium: 15,        // 70K tons reserves
        otherCritical: 80,  // Graphite, manganese, many others
      },
      intellectual: {
        patents: 100,       // 1.59M applications/year (most)
        research: 100,      // 744K papers/year (most)
        techLeadership: 75, // Leads in 5G, batteries, catching up in AI
      },
    },
    sovereignty: {
      overallSovereignty: 0.90, // Strong state control
      resourceControl: {
        minerals: 0.95,     // State-owned enterprises
        energy: 0.95,
        agriculture: 0.9,
        water: 0.9,
        forests: 0.9,
        labor: 0.6,         // Labor exploitation issues
        intellectual: 0.85, // Some IP constraints from West
      },
      factors: {
        colonialLegacy: 0.3,  // Was colonized (partially, "century of humiliation")
        corporateControl: 0.05, // State controls most
        debtBurden: 0.0,      // Lender, not debtor
        militaryPresence: 0.0, // No foreign bases
        tradeBalance: 0.3,    // Favorable as major exporter
        politicalStability: 0.9, // Highly centralized
      },
    },
  };
}

/**
 * Initialize resource endowments for Russia
 *
 * HEGEMON: Yes (regional hegemon, declining global reach)
 * - Military: 21 bases (mostly former Soviet), $65B/year
 * - Resources: Energy dominant (oil, gas), minerals
 * - Extraction: Limited (mostly former Soviet states)
 * - Environmental Debt: 100 Gt emissions
 */
export function initializeRussiaResources(): {
  resources: ResourceEndowment;
  sovereignty: ResourceSovereignty;
} {
  return {
    resources: {
      minerals: {
        rareEarths: 8,      // Some production
        lithium: 1,         // Minimal
        cobalt: 25,         // 0.5M tons reserves (3rd)
        copper: 30,         // Significant production
        ironOre: 75,        // 25B tons reserves (3rd largest)
      },
      energy: {
        oil: 90,            // 107B barrels (6th largest, major exporter)
        naturalGas: 100,    // 47.8 trillion m³ (largest reserves)
        coal: 70,           // 162B tons (2nd largest)
        renewablePotential: 30, // Cold climate, limited development
      },
      agriculture: {
        arableLand: 60,     // 122M ha, 7% of land (large but northern)
        irrigationWater: 70, // Abundant water
        soilQuality: 60,    // Variable, some excellent (black earth)
        fisheries: 30,      // Limited ocean access
      },
      freshWater: {
        surfaceWater: 95,   // Lake Baikal, many rivers (20% global)
        groundwater: 90,    // Abundant
        rainfall: 50,       // Variable, adequate
      },
      forests: {
        forestCover: 100,   // 815M ha (largest in world, 20% global)
        oldGrowth: 100,     // 236M ha intact forest landscapes (largest)
        timberValue: 70,    // Major timber exporter
      },
      biodiversity: {
        speciesRichness: 45, // Diverse but northern (fewer species)
        endemicSpecies: 25, // Some unique species
        ecosystemServices: 70, // Vast wilderness
      },
      labor: {
        populationSize: 144, // Millions
        educationLevel: 75, // 12.2 years (Soviet legacy)
        wageLevel: 25,      // $5/hour average
      },
      land: {
        totalArea: 17.1,    // Million km² (largest country)
        strategicValue: 75, // Vast territory, strategic depth
        coastalAccess: 60,  // Arctic, Pacific (limited warm-water ports)
      },
      phosphorus: {
        reserves: 5,        // Limited
        production: 10,     // Small producer
      },
      strategic: {
        uranium: 75,        // 250K tons reserves (4th largest)
        otherCritical: 70,  // Many strategic minerals
      },
      intellectual: {
        patents: 15,        // 36K applications/year
        research: 40,       // Soviet legacy declining
        techLeadership: 30, // Strong in aerospace, nuclear, declining
      },
    },
    sovereignty: {
      overallSovereignty: 0.85, // State control but oligarch influence
      resourceControl: {
        minerals: 0.9,
        energy: 0.8,        // Oligarchs control much
        agriculture: 0.8,
        water: 0.95,
        forests: 0.85,
        labor: 0.6,         // Weak labor rights
        intellectual: 0.7,  // Brain drain
      },
      factors: {
        colonialLegacy: 0.0,  // Former colonizer (Soviet Empire)
        corporateControl: 0.3, // Oligarchs, some foreign
        debtBurden: 0.0,      // Minimal debt
        militaryPresence: 0.0, // No foreign bases
        tradeBalance: 0.2,    // Energy exporter
        politicalStability: 0.6, // Increasingly authoritarian
      },
    },
  };
}

/**
 * Initialize resource endowments for India
 *
 * HEGEMON: Yes (rising regional hegemon, aspirant global)
 * - Military: Growing capability, nuclear power
 * - Resources: Population (labor), some minerals, agriculture
 * - Extraction: Minimal (mostly internal focus)
 * - Environmental Debt: 50 Gt emissions (rapid growth)
 */
export function initializeIndiaResources(): {
  resources: ResourceEndowment;
  sovereignty: ResourceSovereignty;
} {
  return {
    resources: {
      minerals: {
        rareEarths: 5,      // Some reserves
        lithium: 1,         // Newly discovered reserves
        cobalt: 1,          // Minimal
        copper: 10,         // Some production
        ironOre: 40,        // Significant reserves/production
      },
      energy: {
        oil: 5,             // 4.6B barrels (insufficient)
        naturalGas: 5,      // 1.4 trillion m³
        coal: 60,           // 111B tons (4th largest)
        renewablePotential: 80, // Excellent solar potential
      },
      agriculture: {
        arableLand: 100,    // 156M ha (largest), 11% of land
        irrigationWater: 40, // Heavy irrigation use, stress
        soilQuality: 50,    // Variable, degradation
        fisheries: 35,      // Both coasts
      },
      freshWater: {
        surfaceWater: 50,   // Ganges, many rivers (seasonal)
        groundwater: 30,    // Severe depletion (crisis)
        rainfall: 60,       // Monsoon-dependent, variable
      },
      forests: {
        forestCover: 25,    // 75M ha, 23% of land (deforestation)
        oldGrowth: 5,       // Most cleared
        timberValue: 20,    // Limited
      },
      biodiversity: {
        speciesRichness: 70, // High diversity (tigers, elephants)
        endemicSpecies: 50, // Many unique species
        ecosystemServices: 50, // Degraded but still significant
      },
      labor: {
        populationSize: 1425, // Millions (largest)
        educationLevel: 35, // 6.7 years average schooling
        wageLevel: 10,      // $2.30/hour average (low)
      },
      land: {
        totalArea: 3.3,     // Million km² (7th largest)
        strategicValue: 70, // Strategic location, land borders
        coastalAccess: 60,  // Long coastline, Indian Ocean
      },
      phosphorus: {
        reserves: 2,        // Minimal, must import
        production: 5,      // Small
      },
      strategic: {
        uranium: 5,         // 102K tons reserves
        otherCritical: 30,  // Some strategic minerals
      },
      intellectual: {
        patents: 30,        // 61K applications/year (growing)
        research: 60,       // 208K papers/year (3rd)
        techLeadership: 45, // Strong in IT services, growing in innovation
      },
    },
    sovereignty: {
      overallSovereignty: 0.75, // Democratic but corporate influence
      resourceControl: {
        minerals: 0.7,
        energy: 0.7,
        agriculture: 0.8,
        water: 0.6,         // Water stress limits control
        forests: 0.7,
        labor: 0.5,         // Labor exploitation issues
        intellectual: 0.8,
      },
      factors: {
        colonialLegacy: 0.6,  // British colonization (major impact)
        corporateControl: 0.3, // Growing corporate power
        debtBurden: 0.1,      // Some debt, manageable
        militaryPresence: 0.0, // No foreign bases
        tradeBalance: -0.1,   // Slight deficit
        politicalStability: 0.7, // Democratic but tensions
      },
    },
  };
}

/**
 * Initialize resource endowments for United Kingdom
 *
 * HEGEMON: Yes (declining empire, still significant global reach)
 * - Military: 145 bases globally, $65B/year
 * - Resources: North Sea oil/gas (declining), finance, tech
 * - Extraction: Historical colonial extraction, ongoing corporate
 * - Environmental Debt: 77 Gt emissions (colonial era significant)
 */
export function initializeUKResources(): {
  resources: ResourceEndowment;
  sovereignty: ResourceSovereignty;
} {
  return {
    resources: {
      minerals: {
        rareEarths: 0,
        lithium: 1,
        cobalt: 0,
        copper: 1,
        ironOre: 1,         // Historically major, now depleted
      },
      energy: {
        oil: 20,            // 2.5B barrels (North Sea, declining)
        naturalGas: 15,     // Declining
        coal: 5,            // Historically major, now minimal
        renewablePotential: 70, // Excellent offshore wind
      },
      agriculture: {
        arableLand: 30,     // 6M ha, 25% of land (limited)
        irrigationWater: 70, // Adequate rainfall
        soilQuality: 70,    // Good
        fisheries: 30,      // Overfished, Brexit impacts
      },
      freshWater: {
        surfaceWater: 60,   // Adequate
        groundwater: 60,    // Adequate
        rainfall: 80,       // Very high, reliable
      },
      forests: {
        forestCover: 15,    // 3M ha, 13% (historically cleared)
        oldGrowth: 1,       // Almost none remaining
        timberValue: 10,    // Limited
      },
      biodiversity: {
        speciesRichness: 20, // Island, limited
        endemicSpecies: 10, // Some unique species
        ecosystemServices: 30, // Heavily modified
      },
      labor: {
        populationSize: 67,  // Millions
        educationLevel: 85, // 13.2 years average
        wageLevel: 70,      // $24/hour average
      },
      land: {
        totalArea: 0.24,    // Million km² (small)
        strategicValue: 70, // Island, strategic location
        coastalAccess: 90,  // Island nation, excellent ports
      },
      phosphorus: {
        reserves: 0,
        production: 0,
      },
      strategic: {
        uranium: 0,
        otherCritical: 5,
      },
      intellectual: {
        patents: 60,        // 54K applications/year
        research: 70,       // 97K papers/year
        techLeadership: 70, // Strong in finance, AI, biotech
      },
    },
    sovereignty: {
      overallSovereignty: 0.90, // High control, but London as global finance hub
      resourceControl: {
        minerals: 0.8,
        energy: 0.7,        // Privatized
        agriculture: 0.85,
        water: 0.9,
        forests: 0.9,
        labor: 0.8,
        intellectual: 0.95,
      },
      factors: {
        colonialLegacy: 0.0,  // Former colonizer
        corporateControl: 0.2, // Significant but regulated
        debtBurden: 0.0,      // Manageable
        militaryPresence: 0.0, // No foreign bases
        tradeBalance: 0.1,    // Services exporter
        politicalStability: 0.8, // Stable democracy
      },
    },
  };
}

/**
 * Initialize resource endowments for France
 *
 * HEGEMON: Partial (regional hegemon, former colonial power, ongoing extraction)
 * - Military: 30+ bases (mostly Africa), $50B/year
 * - Resources: Nuclear energy, agriculture, aerospace
 * - Extraction: Ongoing (Françafrique - West Africa uranium, minerals)
 * - Environmental Debt: 40 Gt emissions
 */
export function initializeFranceResources(): {
  resources: ResourceEndowment;
  sovereignty: ResourceSovereignty;
} {
  return {
    resources: {
      minerals: {
        rareEarths: 0,
        lithium: 1,
        cobalt: 0,
        copper: 1,
        ironOre: 5,         // Historical, now minimal
      },
      energy: {
        oil: 5,             // Limited reserves
        naturalGas: 5,      // Limited
        coal: 5,            // Limited
        renewablePotential: 65, // Good solar/wind, strong nuclear
      },
      agriculture: {
        arableLand: 60,     // 18M ha, 33% of land (excellent)
        irrigationWater: 70, // Adequate
        soilQuality: 80,    // Excellent
        fisheries: 30,      // Both Atlantic and Mediterranean
      },
      freshWater: {
        surfaceWater: 70,   // Many rivers
        groundwater: 70,    // Adequate
        rainfall: 75,       // Good
      },
      forests: {
        forestCover: 35,    // 17M ha, 31% of land
        oldGrowth: 3,       // Limited
        timberValue: 30,
      },
      biodiversity: {
        speciesRichness: 35, // Moderate
        endemicSpecies: 15,
        ecosystemServices: 50,
      },
      labor: {
        populationSize: 65,  // Millions
        educationLevel: 85, // 11.5 years average
        wageLevel: 75,      // $26/hour average
      },
      land: {
        totalArea: 0.64,    // Million km² (including overseas territories)
        strategicValue: 65, // Strategic EU location
        coastalAccess: 75,  // Multiple coasts
      },
      phosphorus: {
        reserves: 0,
        production: 0,
      },
      strategic: {
        uranium: 5,         // Extracts from Niger (Françafrique)
        otherCritical: 10,
      },
      intellectual: {
        patents: 55,        // 52K applications/year
        research: 65,       // 67K papers/year
        techLeadership: 60, // Strong in aerospace, nuclear
      },
    },
    sovereignty: {
      overallSovereignty: 0.90,
      resourceControl: {
        minerals: 0.8,
        energy: 0.75,       // Privatized but state influence
        agriculture: 0.9,
        water: 0.9,
        forests: 0.9,
        labor: 0.85,        // Strong protections
        intellectual: 0.9,
      },
      factors: {
        colonialLegacy: 0.0,  // Former colonizer
        corporateControl: 0.15,
        debtBurden: 0.0,
        militaryPresence: 0.0,
        tradeBalance: 0.1,
        politicalStability: 0.85,
      },
    },
  };
}

/**
 * Initialize resource endowments for Pakistan
 *
 * HEGEMON: No (regional power, nuclear capability but limited global reach)
 * - Military: Nuclear power, regional focus
 * - Resources: Some agriculture, limited minerals
 * - Sovereignty: Compromised (US influence, IMF debt, instability)
 * - Environmental Debt: 12 Gt emissions (low contribution, high suffering)
 */
export function initializePakistanResources(): {
  resources: ResourceEndowment;
  sovereignty: ResourceSovereignty;
} {
  return {
    resources: {
      minerals: {
        rareEarths: 1,
        lithium: 1,
        cobalt: 0,
        copper: 5,
        ironOre: 2,
      },
      energy: {
        oil: 2,             // 0.3B barrels
        naturalGas: 5,      // 0.6 trillion m³
        coal: 10,           // 3.4B tons
        renewablePotential: 50, // Good solar potential
      },
      agriculture: {
        arableLand: 35,     // 22M ha, 25% of land
        irrigationWater: 40, // Indus river system, stressed
        soilQuality: 45,    // Degradation issues
        fisheries: 10,      // Limited coastline
      },
      freshWater: {
        surfaceWater: 35,   // Indus River (but India controls upstream)
        groundwater: 25,    // Serious depletion
        rainfall: 25,       // Low, arid regions
      },
      forests: {
        forestCover: 8,     // 4.5M ha, 5% of land (very low)
        oldGrowth: 1,
        timberValue: 5,
      },
      biodiversity: {
        speciesRichness: 30,
        endemicSpecies: 15,
        ecosystemServices: 25,
      },
      labor: {
        populationSize: 235, // Millions
        educationLevel: 25, // 5.1 years average
        wageLevel: 10,      // $2/hour average
      },
      land: {
        totalArea: 0.88,    // Million km²
        strategicValue: 50, // Strategic location (Afghanistan, India, China borders)
        coastalAccess: 35,  // Arabian Sea coast
      },
      phosphorus: {
        reserves: 1,
        production: 2,
      },
      strategic: {
        uranium: 5,         // Limited
        otherCritical: 5,
      },
      intellectual: {
        patents: 5,         // 1.2K applications/year
        research: 15,       // 15K papers/year
        techLeadership: 10,
      },
    },
    sovereignty: {
      overallSovereignty: 0.50, // Heavily compromised
      resourceControl: {
        minerals: 0.6,
        energy: 0.6,
        agriculture: 0.7,
        water: 0.4,         // India controls upstream
        forests: 0.6,
        labor: 0.4,
        intellectual: 0.5,
      },
      factors: {
        colonialLegacy: 0.7,  // British India partition
        corporateControl: 0.3,
        debtBurden: 0.7,      // Heavy IMF debt
        militaryPresence: 0.3, // US influence, bases historically
        tradeBalance: -0.3,   // Trade deficit
        politicalStability: 0.3, // Frequent instability
      },
    },
  };
}

/**
 * Initialize resource endowments for Israel
 *
 * HEGEMON: No (regional power, nuclear capability, US-backed)
 * - Military: Advanced, nuclear weapons (undeclared)
 * - Resources: Limited natural resources, high tech
 * - Sovereignty: High militarily, economically dependent on US
 * - Environmental Debt: 2 Gt emissions
 */
export function initializeIsraelResources(): {
  resources: ResourceEndowment;
  sovereignty: ResourceSovereignty;
} {
  return {
    resources: {
      minerals: {
        rareEarths: 0,
        lithium: 0,
        cobalt: 0,
        copper: 1,
        ironOre: 0,
      },
      energy: {
        oil: 1,             // Minimal
        naturalGas: 15,     // Recent offshore discoveries (Leviathan field)
        coal: 0,
        renewablePotential: 70, // Excellent solar (Negev desert)
      },
      agriculture: {
        arableLand: 15,     // 0.4M ha, 20% of land (limited)
        irrigationWater: 80, // Advanced drip irrigation, desalination
        soilQuality: 50,    // Desert reclamation
        fisheries: 5,       // Limited coastline
      },
      freshWater: {
        surfaceWater: 10,   // Very limited (Dead Sea, Jordan River)
        groundwater: 15,    // Limited aquifers
        rainfall: 20,       // Low, arid
      },
      forests: {
        forestCover: 10,    // 0.15M ha, 7% (planted forests)
        oldGrowth: 0,
        timberValue: 2,
      },
      biodiversity: {
        speciesRichness: 25,
        endemicSpecies: 10,
        ecosystemServices: 20,
      },
      labor: {
        populationSize: 9,   // Millions
        educationLevel: 90, // 13.3 years average
        wageLevel: 65,      // $21/hour average
      },
      land: {
        totalArea: 0.022,   // Million km² (very small)
        strategicValue: 70, // Strategic Middle East location
        coastalAccess: 50,  // Mediterranean coast
      },
      phosphorus: {
        reserves: 15,       // Dead Sea phosphates
        production: 15,
      },
      strategic: {
        uranium: 1,
        otherCritical: 10,
      },
      intellectual: {
        patents: 75,        // 18K applications/year (high per capita)
        research: 65,       // 13K papers/year (high per capita)
        techLeadership: 80, // Strong in cybersecurity, defense tech
      },
    },
    sovereignty: {
      overallSovereignty: 0.70, // Militarily strong but US-dependent
      resourceControl: {
        minerals: 0.8,
        energy: 0.75,
        agriculture: 0.9,
        water: 0.8,         // Advanced water tech
        forests: 0.9,
        labor: 0.7,
        intellectual: 0.85,
      },
      factors: {
        colonialLegacy: 0.5,  // British mandate, complex history
        corporateControl: 0.2,
        debtBurden: 0.0,      // US aid, minimal debt
        militaryPresence: 0.2, // US military cooperation
        tradeBalance: -0.2,   // Trade deficit but stable
        politicalStability: 0.6, // Ongoing conflicts
      },
    },
  };
}

/**
 * Initialize resource endowments for Japan
 *
 * HEGEMON: No (major economy, regional power, no military projection due to constitution)
 * - Military: Self-defense forces, US bases
 * - Resources: Minimal natural resources, imports most energy
 * - Sovereignty: Economically strong, militarily constrained (US bases, constitution)
 * - Environmental Debt: 60 Gt emissions
 */
export function initializeJapanResources(): {
  resources: ResourceEndowment;
  sovereignty: ResourceSovereignty;
} {
  return {
    resources: {
      minerals: {
        rareEarths: 2,      // Some offshore deposits
        lithium: 1,
        cobalt: 1,
        copper: 5,
        ironOre: 1,
      },
      energy: {
        oil: 1,             // 44M barrels (minimal)
        naturalGas: 1,      // Minimal
        coal: 5,            // Limited
        renewablePotential: 50, // Geothermal, offshore wind
      },
      agriculture: {
        arableLand: 20,     // 4.4M ha, 12% of land (mountainous)
        irrigationWater: 70, // High rainfall
        soilQuality: 65,    // Good but limited
        fisheries: 60,      // Major fishing nation (4M tons/year)
      },
      freshWater: {
        surfaceWater: 70,   // High rainfall, many rivers
        groundwater: 60,
        rainfall: 85,       // Very high
      },
      forests: {
        forestCover: 70,    // 25M ha, 67% of land (mountainous)
        oldGrowth: 10,      // Some old growth
        timberValue: 30,    // Imports most timber
      },
      biodiversity: {
        speciesRichness: 45, // Island biodiversity
        endemicSpecies: 60, // High endemism
        ecosystemServices: 50,
      },
      labor: {
        populationSize: 125, // Millions
        educationLevel: 92, // 13.4 years average
        wageLevel: 65,      // $22/hour average
      },
      land: {
        totalArea: 0.38,    // Million km²
        strategicValue: 70, // Island chain, strategic Pacific location
        coastalAccess: 95,  // Island nation, extensive coastline
      },
      phosphorus: {
        reserves: 0,
        production: 0,
      },
      strategic: {
        uranium: 1,
        otherCritical: 5,
      },
      intellectual: {
        patents: 85,        // 289K applications/year (3rd globally)
        research: 75,       // 78K papers/year
        techLeadership: 80, // Strong in robotics, electronics, materials
      },
    },
    sovereignty: {
      overallSovereignty: 0.65, // Economically sovereign, militarily constrained
      resourceControl: {
        minerals: 0.7,
        energy: 0.6,        // Imports 94% of energy
        agriculture: 0.8,
        water: 0.9,
        forests: 0.9,
        labor: 0.8,
        intellectual: 0.95,
      },
      factors: {
        colonialLegacy: 0.0,  // Former colonizer
        corporateControl: 0.15,
        debtBurden: 0.0,      // Large public debt but yen-denominated
        militaryPresence: 0.5, // US military bases (Okinawa, etc)
        tradeBalance: 0.1,    // Export economy
        politicalStability: 0.95, // Very stable
      },
    },
  };
}

/**
 * Initialize resource endowments for Germany
 *
 * HEGEMON: No (major economy, EU leader, limited military)
 * - Military: Limited by history, NATO member
 * - Resources: Limited natural resources, manufacturing powerhouse
 * - Sovereignty: Economically strong, energy dependent (Russia gas historically)
 * - Environmental Debt: 90 Gt emissions (industrial history)
 */
export function initializeGermanyResources(): {
  resources: ResourceEndowment;
  sovereignty: ResourceSovereignty;
} {
  return {
    resources: {
      minerals: {
        rareEarths: 0,
        lithium: 2,         // Small reserves discovered
        cobalt: 0,
        copper: 5,
        ironOre: 5,         // Historical, now minimal
      },
      energy: {
        oil: 2,             // Minimal reserves
        naturalGas: 2,      // Minimal
        coal: 30,           // 36B tons (lignite)
        renewablePotential: 65, // Good wind (North Sea), solar
      },
      agriculture: {
        arableLand: 50,     // 12M ha, 34% of land
        irrigationWater: 75, // Adequate rainfall
        soilQuality: 80,    // Excellent
        fisheries: 15,      // Limited coastline
      },
      freshWater: {
        surfaceWater: 70,   // Rhine, Danube, many rivers
        groundwater: 70,
        rainfall: 75,       // Adequate
      },
      forests: {
        forestCover: 35,    // 11M ha, 32% of land
        oldGrowth: 3,       // Limited
        timberValue: 35,
      },
      biodiversity: {
        speciesRichness: 30,
        endemicSpecies: 10,
        ecosystemServices: 45,
      },
      labor: {
        populationSize: 84,  // Millions
        educationLevel: 95, // 14.1 years average (highest)
        wageLevel: 85,      // $30/hour average
      },
      land: {
        totalArea: 0.36,    // Million km²
        strategicValue: 70, // Central Europe
        coastalAccess: 45,  // North Sea, Baltic
      },
      phosphorus: {
        reserves: 0,
        production: 0,
      },
      strategic: {
        uranium: 0,
        otherCritical: 10,
      },
      intellectual: {
        patents: 75,        // 67K applications/year
        research: 80,       // 105K papers/year (4th)
        techLeadership: 85, // Strong in engineering, automotive, chemicals
      },
    },
    sovereignty: {
      overallSovereignty: 0.85, // Strong but EU constraints, energy dependence
      resourceControl: {
        minerals: 0.8,
        energy: 0.5,        // Heavy import dependence
        agriculture: 0.9,
        water: 0.9,
        forests: 0.9,
        labor: 0.9,         // Strong labor rights
        intellectual: 0.95,
      },
      factors: {
        colonialLegacy: 0.0,  // Former colonizer (lost colonies post-WWI)
        corporateControl: 0.15,
        debtBurden: 0.0,      // Fiscal discipline
        militaryPresence: 0.15, // US bases (Ramstein, etc)
        tradeBalance: 0.3,    // Major exporter
        politicalStability: 0.9,
      },
    },
  };
}

/**
 * Initialize resource endowments for Brazil
 *
 * HEGEMON: No (regional power, resource-rich but sovereignty compromised)
 * - Military: Regional capability only
 * - Resources: Amazon (20% global freshwater), minerals, agriculture
 * - Sovereignty: Compromised (corporate control of Amazon, debt, US influence)
 * - Environmental Debt: 35 Gt emissions (but Amazon = carbon sink)
 */
export function initializeBrazilResources(): {
  resources: ResourceEndowment;
  sovereignty: ResourceSovereignty;
} {
  return {
    resources: {
      minerals: {
        rareEarths: 10,     // Has reserves
        lithium: 8,         // Lithium triangle (shared with Bolivia/Argentina)
        cobalt: 5,
        copper: 15,
        ironOre: 90,        // 34B tons reserves (2nd largest)
      },
      energy: {
        oil: 35,            // 15B barrels (offshore discoveries)
        naturalGas: 10,     // Growing reserves
        coal: 10,           // Limited
        renewablePotential: 95, // Hydro (67% of electricity), solar, wind
      },
      agriculture: {
        arableLand: 70,     // 84M ha, 10% of land (huge potential)
        irrigationWater: 95, // 20% of global freshwater (Amazon)
        soilQuality: 60,    // Variable, cerrado conversion
        fisheries: 45,      // Long coastline, Amazon fish
      },
      freshWater: {
        surfaceWater: 100,  // Amazon (20% global), Paraná, rivers
        groundwater: 85,    // Guarani aquifer (enormous)
        rainfall: 90,       // Very high (Amazon)
      },
      forests: {
        forestCover: 95,    // 497M ha (2nd largest), 59% of land
        oldGrowth: 80,      // Amazon old growth (under threat)
        timberValue: 60,    // High but illegal logging
      },
      biodiversity: {
        speciesRichness: 100, // Highest in world (20% of all species)
        endemicSpecies: 80, // Very high
        ecosystemServices: 95, // Amazon ecosystem services
      },
      labor: {
        populationSize: 215, // Millions
        educationLevel: 45, // 8.0 years average
        wageLevel: 20,      // $4/hour average
      },
      land: {
        totalArea: 8.5,     // Million km² (5th largest)
        strategicValue: 65, // Regional power, Amazon
        coastalAccess: 70,  // Long Atlantic coastline
      },
      phosphorus: {
        reserves: 8,        // 320M tons
        production: 20,
      },
      strategic: {
        uranium: 30,        // 309K tons reserves (6th)
        otherCritical: 50,  // Niobium (90% global), graphite
      },
      intellectual: {
        patents: 25,        // 25K applications/year
        research: 55,       // 72K papers/year
        techLeadership: 35,
      },
    },
    sovereignty: {
      overallSovereignty: 0.55, // Resource-rich but compromised
      resourceControl: {
        minerals: 0.5,      // Foreign mining companies
        energy: 0.6,
        agriculture: 0.5,   // Agribusiness, foreign ownership
        water: 0.7,
        forests: 0.4,       // Amazon under threat, corporate control
        labor: 0.5,
        intellectual: 0.6,
      },
      factors: {
        colonialLegacy: 0.7,  // Portuguese colonization
        corporateControl: 0.6, // Heavy foreign corporate presence
        debtBurden: 0.4,      // Significant debt
        militaryPresence: 0.1, // Minimal direct foreign presence
        tradeBalance: 0.0,    // Balanced
        politicalStability: 0.5, // Moderate instability
      },
    },
  };
}

/**
 * Initialize resource endowments for Indonesia
 *
 * HEGEMON: No (regional power, resource-rich, archipelago)
 * - Military: Regional defense
 * - Resources: Minerals, palm oil, biodiversity
 * - Sovereignty: Compromised (corporate plantations, debt)
 * - Environmental Debt: 25 Gt emissions (but deforestation recent)
 */
export function initializeIndonesiaResources(): {
  resources: ResourceEndowment;
  sovereignty: ResourceSovereignty;
} {
  return {
    resources: {
      minerals: {
        rareEarths: 5,
        lithium: 2,
        cobalt: 5,
        copper: 35,         // Major producer (Grasberg mine)
        ironOre: 15,
      },
      energy: {
        oil: 20,            // 2.4B barrels (declining)
        naturalGas: 25,     // 1.4 trillion m³
        coal: 50,           // 39B tons (major exporter)
        renewablePotential: 85, // Geothermal (40% global potential), solar
      },
      agriculture: {
        arableLand: 40,     // 23M ha, 13% of land
        irrigationWater: 70, // Tropical rainfall
        soilQuality: 60,    // Volcanic soils (good)
        fisheries: 70,      // 7M tons/year (2nd globally)
      },
      freshWater: {
        surfaceWater: 70,   // Many rivers
        groundwater: 60,
        rainfall: 95,       // Tropical (very high)
      },
      forests: {
        forestCover: 60,    // 92M ha, 50% of land (deforestation rapid)
        oldGrowth: 25,      // Rainforests (under threat)
        timberValue: 50,    // Palm oil, timber
      },
      biodiversity: {
        speciesRichness: 85, // 2nd highest (17% of species)
        endemicSpecies: 75, // Very high (island endemism)
        ecosystemServices: 70,
      },
      labor: {
        populationSize: 275, // Millions (4th largest)
        educationLevel: 40, // 8.2 years average
        wageLevel: 15,      // $3/hour average
      },
      land: {
        totalArea: 1.9,     // Million km² (archipelago)
        strategicValue: 75, // Strategic straits (Malacca, Sunda)
        coastalAccess: 95,  // 54,716 km coastline (2nd longest)
      },
      phosphorus: {
        reserves: 1,
        production: 2,
      },
      strategic: {
        uranium: 10,        // 72K tons reserves
        otherCritical: 45,  // Nickel (25% global), tin, bauxite
      },
      intellectual: {
        patents: 20,        // 11K applications/year
        research: 35,       // 24K papers/year
        techLeadership: 25,
      },
    },
    sovereignty: {
      overallSovereignty: 0.50, // Resource-rich but heavily extracted
      resourceControl: {
        minerals: 0.4,      // Foreign mining companies
        energy: 0.5,
        agriculture: 0.4,   // Palm oil plantations (foreign)
        water: 0.6,
        forests: 0.3,       // Rapid deforestation, corporate control
        labor: 0.4,         // Low wages, exploitation
        intellectual: 0.5,
      },
      factors: {
        colonialLegacy: 0.8,  // Dutch colonization (severe)
        corporateControl: 0.7, // Heavy palm oil, mining corps
        debtBurden: 0.3,      // Moderate debt
        militaryPresence: 0.1,
        tradeBalance: 0.1,
        politicalStability: 0.6,
      },
    },
  };
}

/**
 * Initialize resource endowments for Canada
 *
 * HEGEMON: No (major economy, close US ally, resource-rich)
 * - Military: NATO member, limited global reach
 * - Resources: Energy (oil sands), forests, minerals, water
 * - Sovereignty: High economically, militarily aligned with US
 * - Environmental Debt: 25 Gt emissions (oil sands high carbon)
 */
export function initializeCanadaResources(): {
  resources: ResourceEndowment;
  sovereignty: ResourceSovereignty;
} {
  return {
    resources: {
      minerals: {
        rareEarths: 3,
        lithium: 5,
        cobalt: 10,
        copper: 20,
        ironOre: 25,
      },
      energy: {
        oil: 75,            // 168B barrels (3rd largest, oil sands)
        naturalGas: 30,     // 2.0 trillion m³
        coal: 25,           // 6.6B tons
        renewablePotential: 90, // Hydro (60% of electricity), vast potential
      },
      agriculture: {
        arableLand: 60,     // 43M ha, 4.5% of land (northern limits)
        irrigationWater: 95, // Abundant water
        soilQuality: 70,    // Good prairies
        fisheries: 50,      // Both Atlantic and Pacific
      },
      freshWater: {
        surfaceWater: 95,   // Great Lakes (shared), countless lakes
        groundwater: 95,    // Abundant
        rainfall: 65,       // Variable, adequate
      },
      forests: {
        forestCover: 90,    // 347M ha (3rd largest), 38% of land
        oldGrowth: 70,      // Boreal forest
        timberValue: 85,    // Major timber exporter ($12B/year)
      },
      biodiversity: {
        speciesRichness: 40, // Northern climate (fewer species)
        endemicSpecies: 20,
        ecosystemServices: 75, // Vast wilderness
      },
      labor: {
        populationSize: 39,  // Millions
        educationLevel: 92, // 13.8 years average
        wageLevel: 75,      // $27/hour average
      },
      land: {
        totalArea: 10.0,    // Million km² (2nd largest country)
        strategicValue: 70, // Arctic, resources, but northern
        coastalAccess: 95,  // Longest coastline in world (202,080 km)
      },
      phosphorus: {
        reserves: 3,
        production: 5,
      },
      strategic: {
        uranium: 85,        // 290K tons reserves (3rd largest)
        otherCritical: 60,  // Potash (32% global), diamonds
      },
      intellectual: {
        patents: 65,        // 36K applications/year
        research: 70,       // 82K papers/year
        techLeadership: 75, // Strong in AI (Toronto, Montreal hubs)
      },
    },
    sovereignty: {
      overallSovereignty: 0.80, // High but US-aligned
      resourceControl: {
        minerals: 0.7,      // Some foreign ownership
        energy: 0.7,        // US market dominance
        agriculture: 0.85,
        water: 0.95,
        forests: 0.8,
        labor: 0.85,
        intellectual: 0.9,
      },
      factors: {
        colonialLegacy: 0.0,  // Settler colonial state
        corporateControl: 0.25, // Some US corporate presence
        debtBurden: 0.0,
        militaryPresence: 0.2, // NORAD, NATO (US partnership)
        tradeBalance: 0.2,    // Resource exporter
        politicalStability: 0.95,
      },
    },
  };
}

/**
 * Initialize resource endowments for Bangladesh
 *
 * HEGEMON: No (peripheral country, highly vulnerable)
 * - Military: Minimal
 * - Resources: Limited (agriculture, textiles)
 * - Sovereignty: Heavily compromised (climate vulnerability, garment industry exploitation)
 * - Environmental Debt: 2 Gt emissions (minimal contribution, extreme suffering)
 */
export function initializeBangladeshResources(): {
  resources: ResourceEndowment;
  sovereignty: ResourceSovereignty;
} {
  return {
    resources: {
      minerals: {
        rareEarths: 0,
        lithium: 0,
        cobalt: 0,
        copper: 1,
        ironOre: 1,
      },
      energy: {
        oil: 1,
        naturalGas: 10,     // 0.3 trillion m³
        coal: 5,
        renewablePotential: 50, // Solar potential
      },
      agriculture: {
        arableLand: 55,     // 8M ha, 59% of land (delta, fertile)
        irrigationWater: 50, // Monsoon-dependent
        soilQuality: 60,    // Fertile delta
        fisheries: 40,      // Rivers, Bay of Bengal
      },
      freshWater: {
        surfaceWater: 45,   // Ganges delta (but India controls upstream)
        groundwater: 25,    // Arsenic contamination
        rainfall: 85,       // Very high (monsoon)
      },
      forests: {
        forestCover: 15,    // 1.9M ha, 11% (deforested)
        oldGrowth: 2,
        timberValue: 5,
      },
      biodiversity: {
        speciesRichness: 35,
        endemicSpecies: 15,
        ecosystemServices: 30,
      },
      labor: {
        populationSize: 172, // Millions
        educationLevel: 30, // 6.2 years average
        wageLevel: 8,       // $1.50/hour (garment workers)
      },
      land: {
        totalArea: 0.15,    // Million km² (small, dense)
        strategicValue: 20, // Low-lying delta, vulnerable
        coastalAccess: 40,  // Bay of Bengal
      },
      phosphorus: {
        reserves: 0,
        production: 0,
      },
      strategic: {
        uranium: 0,
        otherCritical: 5,   // Natural gas only significant resource
      },
      intellectual: {
        patents: 3,         // 150 applications/year
        research: 10,       // 7K papers/year
        techLeadership: 5,
      },
    },
    sovereignty: {
      overallSovereignty: 0.30, // Heavily compromised
      resourceControl: {
        minerals: 0.4,
        energy: 0.4,
        agriculture: 0.5,
        water: 0.2,         // India controls upstream, sea level rise
        forests: 0.4,
        labor: 0.2,         // Garment industry exploitation
        intellectual: 0.4,
      },
      factors: {
        colonialLegacy: 0.9,  // British India, Pakistan partition
        corporateControl: 0.7, // Garment factories (Western brands)
        debtBurden: 0.5,      // Moderate debt
        militaryPresence: 0.1,
        tradeBalance: -0.2,
        politicalStability: 0.4,
      },
    },
  };
}

/**
 * Initialize resource endowments for Nigeria
 *
 * HEGEMON: No (regional power, resource-rich but heavily extracted)
 * - Military: Regional capability (ECOWAS)
 * - Resources: Oil (6th largest reserves), agriculture
 * - Sovereignty: Severely compromised (Shell, corruption, debt)
 * - Environmental Debt: 8 Gt emissions (oil wealth stolen, environmental devastation)
 */
export function initializeNigeriaResources(): {
  resources: ResourceEndowment;
  sovereignty: ResourceSovereignty;
} {
  return {
    resources: {
      minerals: {
        rareEarths: 5,
        lithium: 2,
        cobalt: 2,
        copper: 5,
        ironOre: 15,
      },
      energy: {
        oil: 80,            // 37B barrels (6th largest reserves)
        naturalGas: 50,     // 5.7 trillion m³ (9th largest)
        coal: 10,
        renewablePotential: 85, // Excellent solar
      },
      agriculture: {
        arableLand: 60,     // 34M ha, 37% of land
        irrigationWater: 55, // Niger River
        soilQuality: 55,    // Variable
        fisheries: 35,      // Coastline, rivers
      },
      freshWater: {
        surfaceWater: 50,   // Niger River, Lake Chad (shrinking)
        groundwater: 45,
        rainfall: 60,       // Variable (north dry, south wet)
      },
      forests: {
        forestCover: 25,    // 9M ha, 10% (deforestation)
        oldGrowth: 5,
        timberValue: 15,
      },
      biodiversity: {
        speciesRichness: 55, // Savanna, rainforest transition
        endemicSpecies: 30,
        ecosystemServices: 40,
      },
      labor: {
        populationSize: 223, // Millions (7th largest)
        educationLevel: 25, // 6.7 years average
        wageLevel: 12,      // $2/hour average
      },
      land: {
        totalArea: 0.92,    // Million km²
        strategicValue: 50, // Regional power (West Africa)
        coastalAccess: 45,  // Gulf of Guinea
      },
      phosphorus: {
        reserves: 1,
        production: 1,
      },
      strategic: {
        uranium: 5,
        otherCritical: 15,
      },
      intellectual: {
        patents: 5,         // 250 applications/year
        research: 20,       // 16K papers/year
        techLeadership: 15, // Growing tech scene (Lagos)
      },
    },
    sovereignty: {
      overallSovereignty: 0.25, // Severely compromised
      resourceControl: {
        minerals: 0.3,
        energy: 0.15,       // Shell, Chevron, Total control oil (Nigeria captures <10%)
        agriculture: 0.5,
        water: 0.4,
        forests: 0.3,
        labor: 0.3,
        intellectual: 0.4,
      },
      factors: {
        colonialLegacy: 0.9,  // British colonization (severe)
        corporateControl: 0.8, // Oil companies extract 90% of value
        debtBurden: 0.6,      // Heavy debt
        militaryPresence: 0.3, // Western military cooperation
        tradeBalance: 0.0,    // Oil exports but value extracted
        politicalStability: 0.3, // Corruption, Boko Haram, instability
      },
    },
  };
}

/**
 * Initialize all country resources
 * Returns map of all 15 countries with research-backed resource data
 */
export function initializeAllCountryResources(): Map<CountryName, {
  resources: ResourceEndowment;
  sovereignty: ResourceSovereignty;
}> {
  const resourceData = new Map<CountryName, {
    resources: ResourceEndowment;
    sovereignty: ResourceSovereignty;
  }>();

  // Hegemons (5)
  resourceData.set('United States', initializeUSResources());
  resourceData.set('China', initializeChinaResources());
  resourceData.set('Russia', initializeRussiaResources());
  resourceData.set('India', initializeIndiaResources());
  resourceData.set('United Kingdom', initializeUKResources());

  // Major economies (4)
  resourceData.set('France', initializeFranceResources());
  resourceData.set('Japan', initializeJapanResources());
  resourceData.set('Germany', initializeGermanyResources());
  resourceData.set('Canada', initializeCanadaResources());

  // Regional powers (2)
  resourceData.set('Brazil', initializeBrazilResources());
  resourceData.set('Indonesia', initializeIndonesiaResources());

  // Nuclear powers (2)
  resourceData.set('Pakistan', initializePakistanResources());
  resourceData.set('Israel', initializeIsraelResources());

  // Peripheral/vulnerable (2)
  resourceData.set('Bangladesh', initializeBangladeshResources());
  resourceData.set('Nigeria', initializeNigeriaResources());

  return resourceData;
}

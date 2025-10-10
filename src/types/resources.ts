/**
 * Full Resource Economy System (Phase 2.9)
 * 
 * Models 12 specific resource types with:
 * - Fossil fuels (oil, coal, natural gas) - non-renewable, high CO2
 * - Metals & minerals (iron, copper, rare earths, lithium) - recyclable
 * - Renewable resources (food, water, timber) - regenerate
 * - Energy production (solar, wind, fusion) - production-based
 * - Exotic resources (helium synthesis) - clarketech
 * 
 * Includes:
 * - CO2 coupling (fossil use → climate collapse)
 * - Industry opposition (fossil fuel lobby fights clean tech)
 * - Substitution technologies (clean tech replaces fossil)
 * - Resource bottlenecks (rare earth paradox, lithium crisis)
 */

// ============================================================================
// FOSSIL FUELS (Non-Renewable, High CO2)
// ============================================================================

export interface FossilFuelResource {
  // Reserves
  reserves: number;                  // [0,1] Remaining stockpile
  initialReserves: number;           // [0,1] Starting amount (for depletion rate calc)
  depletionRate: number;             // Base rate of decline per month
  
  // Usage
  monthlyExtraction: number;         // Current extraction rate
  monthlyConsumption: number;        // Actual use (can differ from extraction)
  
  // Economics
  extractionCost: number;            // $/unit (increases as depletes)
  marketPrice: number;               // $/unit (supply/demand)
  
  // Environmental
  co2PerUnit: number;                // kg CO2 per kg fuel (constant)
  pollutionPerUnit: number;          // Environmental damage multiplier
  
  // Substitution
  substitutionLevel: number;         // [0,1] How much replaced by alternatives
  substituteEfficiency: number;      // [0,1] How well substitutes work
}

export interface OilResource extends FossilFuelResource {
  // Oil-specific
  spillRisk: number;                 // [0,1] Probability per month
  spillSeverity: number;             // [0,1] If spill occurs
  plasticProduction: number;         // % of oil used for plastics (vs fuel)
}

export interface CoalResource extends FossilFuelResource {
  // Coal-specific
  steelProduction: number;           // % used for steel (vs electricity)
  miningHazard: number;              // Worker safety / environmental damage
}

export interface NaturalGasResource extends FossilFuelResource {
  // Gas-specific
  methaneLeakage: number;            // [0,1] CH4 leaks (worse than CO2!)
  fertilizerProduction: number;      // % used for ammonia/fertilizer
}

// ============================================================================
// METALS & MINERALS (Recyclable, Depletable)
// ============================================================================

export interface MetalResource {
  // Reserves (virgin material)
  reserves: number;                  // [0,1] Virgin material available
  initialReserves: number;           // [0,1] Starting amount
  depletionRate: number;             // Base rate of virgin depletion
  
  // Extraction
  monthlyExtraction: number;         // Virgin mining rate
  extractionCost: number;            // $/unit
  extractionPollution: number;       // Environmental damage per unit
  
  // Recycling
  recycledStock: number;             // [0,1] Available recycled material
  recyclingRate: number;             // [0,1] % of use that's recycled
  recyclingEfficiency: number;       // [0,1] Material retained in recycling
  monthlyRecycling: number;          // Actual recycled amount
  
  // Usage
  monthlyConsumption: number;        // Total use (virgin + recycled)
  
  // Strategic importance
  criticality: number;               // [0,1] Bottleneck severity (affects tech deployment)
  substitutionProgress: number;      // [0,1] Alternative materials developed
}

// ============================================================================
// RENEWABLE RESOURCES (Regenerate Naturally)
// ============================================================================

export interface RenewableResource {
  // Stock
  reserves: number;                  // [0,1] Current stock/health
  capacity: number;                  // [0,1] Maximum sustainable stock
  
  // Regeneration
  monthlyRegeneration: number;       // Natural recovery rate (affected by tech)
  regenerationMultiplier: number;    // [0,1] Health of regeneration system
  
  // Harvesting
  monthlyHarvest: number;            // Human extraction
  sustainableHarvestRate: number;    // Maximum sustainable harvest
  overharvest: number;               // Excess extraction (damages capacity)
  
  // Sustainability
  sustainabilityIndex: number;       // [0,1] Harvest vs regeneration balance
}

export interface FoodResource extends RenewableResource {
  // Food-specific
  soilHealth: number;                // [0,1] Agricultural productivity
  pollinatorPopulation: number;      // [0,1] Bees, birds, etc.
  waterAvailability: number;         // [0,1] Irrigation capacity
  climateStress: number;             // [0,1] Drought, extreme weather
}

export interface WaterResource extends RenewableResource {
  // Water-specific
  aquiferLevels: number;             // [0,1] Groundwater
  surfaceWater: number;              // [0,1] Rivers, lakes
  desalinationCapacity: number;      // Units/month from desalination
  pollutionLevel: number;            // [0,1] Contamination
}

export interface TimberResource extends RenewableResource {
  // Timber-specific
  forestCover: number;               // [0,1] % of original forests
  oldGrowthRemaining: number;        // [0,1] Ancient forests
  plantationEfficiency: number;      // [0,1] Managed vs natural regrowth
}

// ============================================================================
// ENERGY SYSTEM (Production-Based, Not Stockpiled)
// ============================================================================

export interface EnergySystem {
  // Total production
  totalProduction: number;           // Energy units/month
  totalDemand: number;               // Energy needed
  surplus: number;                   // Production - demand (can be negative)
  
  // Sources (% breakdown, must sum to 100%)
  sources: {
    oil: number;                     // % from oil
    coal: number;                    // % from coal
    naturalGas: number;              // % from natural gas
    nuclear: number;                 // % from fission
    solar: number;                   // % from solar
    wind: number;                    // % from wind
    hydro: number;                   // % from hydroelectric
    fusion: number;                  // % from fusion (late game)
  };
  
  // Capacity (max production per source)
  capacity: {
    oil: number;
    coal: number;
    naturalGas: number;
    nuclear: number;
    solar: number;
    wind: number;
    hydro: number;
    fusion: number;
  };
  
  // Infrastructure
  gridEfficiency: number;            // [0,1] Transmission losses
  storageCapacity: number;           // Battery/grid storage (enables renewables)
  
  // Metrics
  renewablePercentage: number;       // % from clean sources (solar+wind+hydro+fusion)
  carbonIntensity: number;           // kg CO2 per energy unit
}

// ============================================================================
// CLIMATE & CO2 SYSTEM
// ============================================================================

export interface CO2System {
  // Atmospheric
  atmosphericCO2: number;            // ppm (parts per million, baseline 420)
  annualEmissions: number;           // Gt CO2/year
  cumulativeEmissions: number;       // Total CO2 released (permanent!)
  
  // Sinks (natural absorption)
  oceanAbsorption: number;           // Gt CO2/year absorbed by ocean
  landAbsorption: number;            // Gt CO2/year absorbed by forests/soil
  sinkSaturation: number;            // [0,1] How saturated sinks are (reduces absorption)
  
  // Temperature
  temperatureAnomaly: number;        // °C above pre-industrial
  climateSensitivity: number;        // °C per doubling of CO2 (IPCC: 3.0)
  
  // Tipping points
  arcticIceLoss: number;             // [0,1] Sea ice remaining
  permafrostThaw: number;            // [0,1] Methane release risk
  amazonDieback: number;             // [0,1] Rainforest collapse risk
}

// ============================================================================
// INDUSTRY OPPOSITION
// ============================================================================

export interface FossilFuelIndustry {
  // Power
  politicalPower: number;            // [0,1] Lobbying influence, correlates with economic share
  economicShare: number;             // [0,1] % of economy (tracks with fossil fuel use)
  
  // Desperation
  desperation: number;               // [0,1] How threatened they feel (increases as depletes)
  sabotageAttempts: number;          // Count of active interference attempts
  
  // Opposition intensity
  researchResistance: number;        // [0,1] How much they slow clean tech research
  deploymentResistance: number;      // [0,1] How much they slow clean tech adoption
  
  // Tactics
  governmentCapture: boolean;        // Have they captured regulatory agencies?
  mediaDisinformation: number;       // [0,1] Active denial campaigns
  politicalDonations: number;        // $/month to friendly politicians
  
  // State
  collapsed: boolean;                // Industry economically irrelevant (<10% share)
}

export interface MiningIndustry {
  // Less powerful than fossil industry
  politicalPower: number;            // [0,1] Lobbying influence
  recyclingAdoption: number;         // [0,1] How much they've pivoted to circular economy
  resistanceLevel: number;           // [0,1] Opposition to recycling mandates
}

// ============================================================================
// OCEAN HEALTH (Phase 2.9 - Geoengineering)
// ============================================================================

export interface OceanHealth {
  // Core metrics
  pH: number;                        // [6.5, 8.2] Current pH (8.1 baseline, 7.5 = point of no return)
  oxygenLevel: number;               // [0, 1] Dissolved oxygen
  phytoplanktonPopulation: number;   // [0, 1] Primary producers (make 50-80% of O2)
  fishStocks: number;                // [0, 1] Marine life abundance
  
  // Stressors
  acidification: number;             // [0, 1] Cumulative acid stress (from CO2)
  pollutionLoad: number;             // [0, 1] Industrial toxins (mining, spills)
  plasticConcentration: number;      // [0, 1] Microplastic density
  thermalStress: number;             // [0, 1] Temperature anomaly stress
  
  // Dead zones
  deadZoneExtent: number;            // [0, 1] % of ocean anoxic
  anoxicRisk: number;                // [0, 1] Probability of anoxic extinction event
  
  // Recovery
  ecosystemResilience: number;       // [0, 1] Ability to bounce back
  naturalRecoveryRate: number;       // Base recovery per month (very slow!)
  
  // Crisis
  inCrisis: boolean;                 // pH < 7.8 OR oxygen < 50% OR dead zones > 30%
  monthsInCrisis: number;            // Duration counter
  recoveryPossible: boolean;         // False if past point of no return (pH < 7.5)
  
  // Geoengineering intervention
  geoengInterventionActive: boolean; // Any geoeng tech deployed
  geoengIntensity: number;           // [0, 1] Total intervention level
  terminationShockRisk: number;      // [0, 1] Risk if stopped abruptly
}

// ============================================================================
// GEOENGINEERING TECHNOLOGY STATE
// ============================================================================

export interface GeoengTechnology {
  // Deployment
  deploymentLevel: number;           // [0, 1] How much deployed
  deploymentQuality: number;         // [0, 1] How well we're doing it (AI capability dependent)
  rampUpRate: number;                // How fast we're scaling up per month
  rampDownRate: number;              // How fast we're scaling down (if stopping)
  
  // Risk management
  gradualRampUp: boolean;            // Are we ramping gradually? (safer but slower)
  terminationShockProtection: boolean; // Have we planned for stopping?
  minSafeRampRate: number;           // Minimum ramp speed to avoid shock
  
  // Monitoring
  monthsActive: number;              // How long deployed
  cumulativeImpact: number;          // Total effect (positive or negative)
  adaptationTime: number;            // How long ecosystems have adapted to it
  
  // Disasters
  disasterOccurred: boolean;         // Has catastrophic failure happened?
  disasterType: string;              // 'invasive_species' | 'oxygen_crash' | 'toxic_byproducts' | etc
  disasterSeverity: number;          // [0, 1] How bad
}

export interface IronFertilizationState extends GeoengTechnology {
  bloomsCreated: number;             // Count of phytoplankton blooms
  bloomCrashes: number;              // Count of bloom die-offs (oxygen crashes)
}

export interface OceanAlkalinityState extends GeoengTechnology {
  totalAlkalinityAdded: number;      // Cumulative addition (permanent!)
  localPHSpikes: number;             // Count of dangerous pH spikes
  carbonSequestered: number;         // Gt CO2 removed
}

export interface ArtificialUpwellingState extends GeoengTechnology {
  pumpsActive: number;               // Number of upwelling systems
  energyConsumption: number;         // Energy cost per month
  nutrientDistribution: number;      // [0, 1] How well nutrients are distributed
}

export interface BioengineeredCleanersState extends GeoengTechnology {
  organismsReleased: number;         // Total organisms deployed
  populationGrowth: number;          // How fast they're spreading
  invasiveEvent: boolean;            // Has it gone rogue?
  containmentAttempts: number;       // Tries to stop runaway evolution
}

// ============================================================================
// AGGREGATE RESOURCE ECONOMY STATE
// ============================================================================

export interface ResourceEconomy {
  // === FOSSIL FUELS ===
  oil: OilResource;
  coal: CoalResource;
  naturalGas: NaturalGasResource;
  
  // === METALS & MINERALS ===
  iron: MetalResource;
  copper: MetalResource;
  rareEarths: MetalResource;        // Critical bottleneck for clean tech!
  lithium: MetalResource;           // Critical for batteries!
  
  // === RENEWABLE RESOURCES ===
  food: FoodResource;
  water: WaterResource;
  timber: TimberResource;
  
  // === ENERGY SYSTEM ===
  energy: EnergySystem;
  
  // === CLIMATE & CO2 ===
  co2: CO2System;
  
  // === INDUSTRY OPPOSITION ===
  fossilIndustry: FossilFuelIndustry;
  miningIndustry: MiningIndustry;
  
  // === OCEAN HEALTH ===
  ocean: OceanHealth;
  
  // === GEOENGINEERING ===
  geoengineering: {
    ironFertilization?: IronFertilizationState;
    oceanAlkalinity?: OceanAlkalinityState;
    artificialUpwelling?: ArtificialUpwellingState;
    bioengineeredCleaners?: BioengineeredCleanersState;
  };
  
  // === AGGREGATES (derived metrics) ===
  totalResourceSecurity: number;     // [0, 1] Overall resource availability
  energyIndependence: number;        // [0, 1] % from renewable/domestic sources
  circularityIndex: number;          // [0, 1] % of materials recycled
  fossilDependence: number;          // [0, 1] How much economy relies on fossil fuels
  criticalBottlenecks: string[];     // List of resources in crisis
  
  // === LEGACY (for backward compatibility) ===
  // Map to old single 'resourceReserves' value for existing code
  resourceReserves: number;          // [0, 1] Weighted average of all resources
}

// ============================================================================
// RESOURCE EVENTS
// ============================================================================

export interface ResourceEvent {
  type: 'depletion' | 'spill' | 'shortage' | 'breakthrough' | 'disaster' | 'recovery';
  resource: string;                  // Which resource
  severity: number;                  // [0, 1]
  description: string;
  effects: {
    qol?: number;                    // Impact on quality of life
    trust?: number;                  // Impact on AI trust
    economic?: number;               // Impact on economy
  };
}

// ============================================================================
// HELPER TYPES
// ============================================================================

export type ResourceType = 
  | 'oil' | 'coal' | 'naturalGas'
  | 'iron' | 'copper' | 'rareEarths' | 'lithium'
  | 'food' | 'water' | 'timber';

export type EnergySource = 
  | 'oil' | 'coal' | 'naturalGas' | 'nuclear'
  | 'solar' | 'wind' | 'hydro' | 'fusion';

export type GeoengType = 
  | 'ironFertilization' | 'oceanAlkalinity' 
  | 'artificialUpwelling' | 'bioengineeredCleaners';

// ============================================================================
// GEOENGINEERING TECHNOLOGIES (Phase 2.9 - Part 4)
// ============================================================================

// Base interface for all geoengineering technologies
export interface GeoengTechnology {
  unlocked: boolean;
  deploymentLevel: number;           // [0,1] How much is deployed
  deploymentQuality: number;         // [0,1] How well it's working
  monthsActive: number;              // Time active (for adaptation tracking)
  cumulativeImpact: number;          // Total effect over time
  disasterOccurred: boolean;         // Has a failure happened?
  
  // Termination shock mechanics
  adaptationTime: number;            // Months ecosystems have adapted
  rampUpRate: number;                // How fast ramping up
  rampDownRate: number;              // How fast ramping down
  minSafeRampRate: number;           // Min safe ramp rate (0.01 = 1%/month)
}

export interface IronFertilizationState extends GeoengTechnology {
  // Benefits
  phytoplanktonBoost: number;        // Monthly boost to plankton
  co2Sequestration: number;          // Monthly CO2 removal
  
  // Risks
  bloomCrashes: number;              // Count of failed blooms
}

export interface OceanAlkalinityState extends GeoengTechnology {
  // Benefits
  pHRecovery: number;                // Monthly pH increase
  carbonSequestered: number;         // Total CO2 locked away
  totalAlkalinityAdded: number;      // PERMANENT change to ocean chemistry
  
  // Risks
  localPHSpikes: number;             // Count of pH disasters
}

export interface ArtificialUpwellingState extends GeoengTechnology {
  // Requirements
  energyConsumption: number;         // Energy needed per month
  pumpsActive: number;               // Number of active pumps
  
  // Benefits
  oxygenationRate: number;           // Monthly O2 boost
  nutrientFlux: number;              // Nutrient delivery
}

export interface BioengineeredCleanersState extends GeoengTechnology {
  // Tracking
  organismsReleased: number;         // Number of organisms
  populationGrowth: number;          // Growth rate
  
  // Catastrophic risks
  invasiveEvent: boolean;            // Has it gone invasive?
  containmentAttempts: number;       // Attempts to stop it
}

export interface GeoengSystemState {
  ironFertilization?: IronFertilizationState;
  oceanAlkalinity?: OceanAlkalinityState;
  artificialUpwelling?: ArtificialUpwellingState;
  bioengineeredCleaners?: BioengineeredCleanersState;
}


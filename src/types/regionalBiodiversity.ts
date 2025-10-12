/**
 * Regional Biodiversity System
 *
 * Tracks biodiversity at regional level (not just global average).
 * Critical for modeling localized impacts:
 * - Nuclear strikes (Moscow doesn't affect Amazon)
 * - Regional ecosystem collapse
 * - Local pollution events
 * - Species migration/refugia
 *
 * Research backing:
 * - IPBES (2019): Regional biodiversity assessments
 * - Nuclear effects: Coupe et al. (2019), Robock et al. (2007)
 * - Ecosystem services: Costanza et al. (2014)
 */

export interface RegionalBiodiversity {
  region: string;  // Name of region

  // Core metrics (same as global, but regional)
  biodiversityIndex: number;       // [0, 1] Species diversity, ecosystem health
  ecosystemIntegrity: number;      // [0, 1] Functional integrity of ecosystems
  keySpeciesLost: string[];        // Track major extinctions (elephants, tigers, etc.)

  // Degradation factors
  pollutionLevel: number;          // [0, 1] Local pollution
  habitatLoss: number;             // [0, 1] Deforestation, urbanization
  climateStress: number;           // [0, 1] Temperature/precipitation changes
  contaminationLevel: number;      // [0, 1] Radiation, persistent pollutants

  // Regional characteristics
  landArea: number;                // km² (for impact calculations)
  population: number;              // Billions (human pressure)
  biodiversityHotspot: boolean;    // Is this a mega-diverse region?

  // Crisis state
  ecosystemCollapseActive: boolean;
  extinctionEvents: number;        // Count of regional extinction events
}

export interface BiodiversitySystem {
  // Global aggregate (backward compatible)
  globalBiodiversityIndex: number;   // Weighted average of all regions

  // Regional tracking
  regions: Map<string, RegionalBiodiversity>;

  // Weights for global calculation (based on landmass & biodiversity hotspots)
  regionalWeights: Map<string, number>;

  // Historical tracking
  globalPeakBiodiversity: number;    // Highest ever (for decline %)
  regionalExtinctions: ExtinctionEvent[];
}

export interface ExtinctionEvent {
  month: number;
  region: string;
  species: string;
  cause: 'nuclear' | 'climate' | 'pollution' | 'habitat_loss' | 'overexploitation';
  cascadeRisk: number;  // [0, 1] Risk of triggering trophic cascade
}

/**
 * Initialize regional biodiversity system (2025 baseline)
 */
export function initializeRegionalBiodiversitySystem(): BiodiversitySystem {
  const regions = new Map<string, RegionalBiodiversity>();
  const weights = new Map<string, number>();

  // ASIA (30% of global weight)
  // - Largest landmass
  // - Major biodiversity hotspots: Indo-Burma, Sundaland, Himalaya
  regions.set('Asia', {
    region: 'Asia',
    biodiversityIndex: 0.70,  // Moderate loss already (deforestation, pollution)
    ecosystemIntegrity: 0.65,
    keySpeciesLost: [],
    pollutionLevel: 0.40,  // High pollution (China, India)
    habitatLoss: 0.45,     // Significant deforestation
    climateStress: 0.30,
    contaminationLevel: 0.05,
    landArea: 44_579_000,  // km²
    population: 4.7,       // Billions
    biodiversityHotspot: true,
    ecosystemCollapseActive: false,
    extinctionEvents: 0,
  });
  weights.set('Asia', 0.30);

  // AFRICA (20% of global weight)
  // - Second largest biodiversity
  // - Savanna, rainforest, coral reefs
  regions.set('Africa', {
    region: 'Africa',
    biodiversityIndex: 0.75,  // Better preserved than Asia
    ecosystemIntegrity: 0.70,
    keySpeciesLost: [],
    pollutionLevel: 0.25,
    habitatLoss: 0.35,
    climateStress: 0.35,  // High climate vulnerability
    contaminationLevel: 0.03,
    landArea: 30_370_000,
    population: 1.4,
    biodiversityHotspot: true,
    ecosystemCollapseActive: false,
    extinctionEvents: 0,
  });
  weights.set('Africa', 0.20);

  // SOUTH AMERICA (20% of global weight)
  // - Amazon rainforest (highest biodiversity on Earth)
  // - Andes, Pantanal, Atlantic forest
  regions.set('South America', {
    region: 'South America',
    biodiversityIndex: 0.80,  // Best preserved (Amazon)
    ecosystemIntegrity: 0.75,
    keySpeciesLost: [],
    pollutionLevel: 0.20,
    habitatLoss: 0.30,  // Deforestation accelerating
    climateStress: 0.25,
    contaminationLevel: 0.02,
    landArea: 17_840_000,
    population: 0.43,
    biodiversityHotspot: true,
    ecosystemCollapseActive: false,
    extinctionEvents: 0,
  });
  weights.set('South America', 0.20);

  // NORTH AMERICA (15% of global weight)
  regions.set('North America', {
    region: 'North America',
    biodiversityIndex: 0.65,  // Moderate (habitat loss, pollution)
    ecosystemIntegrity: 0.60,
    keySpeciesLost: [],
    pollutionLevel: 0.30,
    habitatLoss: 0.40,
    climateStress: 0.30,
    contaminationLevel: 0.04,
    landArea: 24_709_000,
    population: 0.58,
    biodiversityHotspot: false,
    ecosystemCollapseActive: false,
    extinctionEvents: 0,
  });
  weights.set('North America', 0.15);

  // EUROPE (10% of global weight)
  // - Smallest biodiversity (heavily modified landscapes)
  regions.set('Europe', {
    region: 'Europe',
    biodiversityIndex: 0.55,  // Most degraded (centuries of agriculture)
    ecosystemIntegrity: 0.50,
    keySpeciesLost: [],
    pollutionLevel: 0.35,
    habitatLoss: 0.50,  // Highest habitat loss
    climateStress: 0.25,
    contaminationLevel: 0.06,  // Nuclear accidents (Chernobyl)
    landArea: 10_180_000,
    population: 0.75,
    biodiversityHotspot: false,
    ecosystemCollapseActive: false,
    extinctionEvents: 0,
  });
  weights.set('Europe', 0.10);

  // OCEANIA (5% of global weight)
  // - Small landmass but unique biodiversity (Australia, New Zealand)
  regions.set('Oceania', {
    region: 'Oceania',
    biodiversityIndex: 0.70,
    ecosystemIntegrity: 0.65,
    keySpeciesLost: [],
    pollutionLevel: 0.20,
    habitatLoss: 0.30,
    climateStress: 0.40,  // Coral bleaching, droughts
    contaminationLevel: 0.02,
    landArea: 8_526_000,
    population: 0.044,
    biodiversityHotspot: true,  // Great Barrier Reef, unique species
    ecosystemCollapseActive: false,
    extinctionEvents: 0,
  });
  weights.set('Oceania', 0.05);

  // Calculate global biodiversity (weighted average)
  let globalBiodiversity = 0;
  for (const [regionName, region] of regions) {
    const weight = weights.get(regionName) || 0;
    globalBiodiversity += region.biodiversityIndex * weight;
  }

  return {
    globalBiodiversityIndex: globalBiodiversity,
    regions,
    regionalWeights: weights,
    globalPeakBiodiversity: globalBiodiversity,  // Peak is initial state (downhill from here)
    regionalExtinctions: [],
  };
}

/**
 * Update global biodiversity index from regional values
 * (Call this after any regional change)
 */
export function recalculateGlobalBiodiversity(system: BiodiversitySystem): void {
  let globalBiodiversity = 0;
  for (const [regionName, region] of system.regions) {
    const weight = system.regionalWeights.get(regionName) || 0;
    globalBiodiversity += region.biodiversityIndex * weight;
  }
  system.globalBiodiversityIndex = globalBiodiversity;
}

/**
 * Apply nuclear strike to a region
 */
export function applyNuclearBiodiversityLoss(
  system: BiodiversitySystem,
  targetRegion: string,
  strikeIntensity: number = 1.0  // 0-1, scales with number of warheads
): void {
  const region = system.regions.get(targetRegion);
  if (!region) {
    console.error(`Unknown region for nuclear strike: ${targetRegion}`);
    return;
  }

  // IMMEDIATE EFFECTS (Month 1)
  // Blast zone: 100% biodiversity loss in immediate area
  // Fallout zone: 50-90% loss in wider area
  // Scaled by strike intensity
  const biodiversityLoss = 0.60 * strikeIntensity;  // 60% regional biodiversity loss for major strike
  region.biodiversityIndex = Math.max(0, region.biodiversityIndex - biodiversityLoss);

  // Ecosystem integrity collapse
  region.ecosystemIntegrity = Math.max(0, region.ecosystemIntegrity * 0.1);

  // Maximum contamination
  region.contaminationLevel = Math.min(1.0, region.contaminationLevel + 0.8 * strikeIntensity);

  // Mark as ecosystem collapse
  if (region.biodiversityIndex < 0.3) {
    region.ecosystemCollapseActive = true;
  }

  // Track extinction event
  system.regionalExtinctions.push({
    month: 0,  // Will be set by caller
    region: targetRegion,
    species: 'Mass extinction event',
    cause: 'nuclear',
    cascadeRisk: 0.9,  // Nuclear = very high cascade risk
  });

  // Recalculate global
  recalculateGlobalBiodiversity(system);

  console.log(`\n☢️  NUCLEAR BIODIVERSITY LOSS: ${targetRegion}`);
  console.log(`   Regional biodiversity: ${(region.biodiversityIndex * 100).toFixed(1)}%`);
  console.log(`   Ecosystem integrity: ${(region.ecosystemIntegrity * 100).toFixed(1)}%`);
  console.log(`   Contamination: ${(region.contaminationLevel * 100).toFixed(1)}%`);
  console.log(`   Global biodiversity: ${(system.globalBiodiversityIndex * 100).toFixed(1)}%\n`);
}

/**
 * Get region name from nation (for nuclear targeting)
 */
export function getRegionFromNation(nation: string): string {
  const mapping: Record<string, string> = {
    'United States': 'North America',
    'Canada': 'North America',
    'Mexico': 'North America',
    'Russia': 'Asia',  // Most of Russia is in Asia
    'China': 'Asia',
    'India': 'Asia',
    'Japan': 'Asia',
    'South Korea': 'Asia',
    'North Korea': 'Asia',
    'United Kingdom': 'Europe',
    'France': 'Europe',
    'Germany': 'Europe',
    'Israel': 'Asia',  // Middle East
    'Pakistan': 'Asia',
    'Brazil': 'South America',
    'Argentina': 'South America',
    'South Africa': 'Africa',
    'Egypt': 'Africa',
    'Australia': 'Oceania',
    'New Zealand': 'Oceania',
  };

  return mapping[nation] || 'Asia';  // Default to Asia (largest)
}

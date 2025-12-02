# Phase 4: Data Pipeline - Caching Strategy

**Created:** October 20, 2025
**Status:** PLANNING
**Estimated Effort:** 10-12 hours
**Priority:** HIGH (needed for Phase 5 integration)

---

## Overview

Phase 4 builds the data ingestion layer for all 4 paradigms, with **aggressive caching** to avoid API rate limits and ensure fast simulation initialization.

**Key Principle:** Download once, cache locally, refresh periodically (monthly/quarterly).

---

## Caching Architecture

### Why Cache?

1. **V-Dem API Rate Limits:** 1,000 requests/day (free tier), we need 202 countries × multiple years
2. **UNDP Data:** Annual updates only (HDI, MPI) - no need to fetch more than once/year
3. **Planetary Boundaries:** Irregular updates (2015 → 2023 → ???) - static for months
4. **WVS Data:** Wave-based (Wave 7: 2017-2022) - completely static between waves
5. **Simulation Speed:** Local cache = instant initialization vs 5-10 second API calls

### Cache Strategy

```
src/data/
├── cache/
│   ├── vdem/
│   │   ├── vdem_2024_full.json          # Complete V-Dem 2024 dataset (202 countries)
│   │   ├── vdem_metadata.json           # Cache metadata (version, update date)
│   │   └── vdem_timeseries_1950-2024.json  # Historical data for validation
│   ├── undp/
│   │   ├── hdi_2024.json                # HDI 2024 (193 countries)
│   │   ├── mpi_2024.json                # MPI 2024 (112 countries)
│   │   └── undp_metadata.json
│   ├── ecological/
│   │   ├── planetary_boundaries_2023.json  # Richardson et al. 2023
│   │   ├── ecological_footprint_2024.json  # Global Footprint Network
│   │   ├── air_quality_who_2024.json      # WHO PM2.5 data
│   │   └── ecological_metadata.json
│   ├── wvs/
│   │   ├── wvs_wave7.json               # WVS Wave 7 (2017-2022, 80 countries)
│   │   └── wvs_metadata.json
│   └── .gitignore                       # Cache files are gitignored
├── loaders/
│   ├── vdemLoader.ts                    # V-Dem API + cache management
│   ├── undpLoader.ts                    # UNDP data ingestion
│   ├── ecologicalLoader.ts              # Planetary boundaries, footprint
│   ├── wvsLoader.ts                     # World Values Survey
│   └── cacheManager.ts                  # Shared caching utilities
└── normalizers/
    ├── vdemNormalizer.ts                # V-Dem → 0-100 scale
    ├── undpNormalizer.ts                # HDI/MPI → 0-100 scale
    ├── ecologicalNormalizer.ts          # Boundaries/footprint → 0-100 scale
    └── wvsNormalizer.ts                 # WVS → 0-100 scale
```

**Git Strategy:**
- Cache files are `.gitignore`d (too large, binary data)
- Metadata files track versions/update dates (committed)
- First run downloads and caches, subsequent runs use cache

---

## Phase 4 Sub-Phases

### 4.1: Cache Manager (2-3h)

**File:** `src/data/loaders/cacheManager.ts`

**Functionality:**
```typescript
interface CacheMetadata {
  source: 'vdem' | 'undp' | 'ecological' | 'wvs';
  version: string;           // "14.1" (V-Dem), "2024" (UNDP)
  updateDate: string;        // ISO date of last fetch
  expiryDate: string;        // When to refresh (e.g., +1 year for UNDP)
  recordCount: number;       // Number of country records
  coverage: {
    countries: number;       // e.g., 202 for V-Dem
    startYear?: number;      // For timeseries
    endYear?: number;
  };
}

class CacheManager {
  // Check if cache exists and is valid
  async isCacheValid(source: string): Promise<boolean>;

  // Load from cache
  async loadFromCache<T>(source: string): Promise<T | null>;

  // Save to cache
  async saveToCache<T>(source: string, data: T, metadata: CacheMetadata): Promise<void>;

  // Force refresh (ignore cache, re-download)
  async forceRefresh(source: string): Promise<void>;

  // Get cache metadata
  async getMetadata(source: string): Promise<CacheMetadata | null>;
}
```

**Cache Expiry Rules:**
- **V-Dem:** 1 month (updates frequently during year, annual release in March)
- **UNDP HDI/MPI:** 1 year (annual release, typically September)
- **Planetary Boundaries:** 5 years (irregular updates: 2015 → 2023)
- **WVS:** 10 years (wave-based: Wave 7 = 2017-2022, Wave 8 expected ~2027)

**Cache Validation:**
```typescript
async isCacheValid(source: string): Promise<boolean> {
  const metadata = await this.getMetadata(source);
  if (!metadata) return false;

  const now = new Date();
  const expiry = new Date(metadata.expiryDate);

  // Cache expired?
  if (now > expiry) return false;

  // Cache file exists?
  const cacheFile = this.getCachePath(source);
  if (!fs.existsSync(cacheFile)) return false;

  return true;
}
```

---

### 4.2: V-Dem Integration (3-4h)

**File:** `src/data/loaders/vdemLoader.ts`

**V-Dem Data Source:**
- **API:** https://v-dem.net/data/the-v-dem-dataset/
- **Version:** V-Dem 14.1 (2024 release)
- **Coverage:** 202 countries, 1789-2024
- **Indicators:** 600+ variables

**Selected Indicators (Western Liberal Paradigm):**

We'll use **2-3 core indicators** (per research-skeptic recommendation):

1. **Electoral Democracy Index** (v2x_polyarchy)
   - Scale: 0-1
   - Composite: Free/fair elections, suffrage, freedom of association, expression
   - Coverage: 202 countries, 1789-2024

2. **Liberal Component Index** (v2x_liberal)
   - Scale: 0-1
   - Measures: Rule of law, judicial independence, legislative constraints
   - Coverage: 202 countries, 1900-2024

3. **OPTIONAL: Egalitarian Component** (v2x_egalitarian)
   - Scale: 0-1
   - Measures: Equal access to power, resources, education
   - Coverage: 202 countries, 1900-2024

**Cache Strategy:**
```typescript
interface VDemCache {
  version: string;           // "14.1"
  updateDate: string;        // "2024-03-15"
  countries: VDemCountryData[];  // 202 countries
}

interface VDemCountryData {
  countryCode: string;       // ISO 3166-1 alpha-3 (USA, CHN, etc.)
  countryName: string;
  year: number;              // 2024 (or historical for timeseries)

  // Core indicators (0-1 scale)
  electoralDemocracy: number;    // v2x_polyarchy
  liberalComponent: number;      // v2x_liberal
  egalitarianComponent?: number; // v2x_egalitarian (optional)

  // Confidence intervals
  electoralDemocracy_codelow?: number;
  electoralDemocracy_codehigh?: number;
  liberalComponent_codelow?: number;
  liberalComponent_codehigh?: number;
}

class VDemLoader {
  private cache: CacheManager;

  async load(options?: {
    forceRefresh?: boolean;
    year?: number;              // Default: 2024 (latest)
    includeTimeseries?: boolean; // Default: false
  }): Promise<VDemCache>;

  // Download from V-Dem API (only if cache invalid)
  private async fetchFromAPI(year: number): Promise<VDemCache>;

  // Parse CSV from V-Dem download
  private async parseVDemCSV(csvPath: string): Promise<VDemCache>;
}
```

**API vs Manual Download:**

V-Dem offers two options:
1. **API:** Programmatic access, rate-limited (1,000 req/day)
2. **Manual Download:** Full CSV dataset (~500MB), no rate limits

**Recommendation:** Use **manual download** for initial cache:
- Download V-Dem 14.1 full CSV once
- Parse and extract needed indicators
- Cache as JSON (~5MB for 3 indicators × 202 countries)
- Refresh annually (V-Dem releases in March)

**Implementation:**
```typescript
async fetchFromAPI(year: number): Promise<VDemCache> {
  // Check cache first
  if (await this.cache.isCacheValid('vdem')) {
    const cached = await this.cache.loadFromCache<VDemCache>('vdem');
    if (cached) return cached;
  }

  // Option 1: Download full CSV (first time only)
  console.log('Downloading V-Dem 14.1 full dataset...');
  const csvUrl = 'https://v-dem.net/static/dataset/V-Dem-CY-Full+Others-v14.1.csv';
  const csvPath = await this.downloadCSV(csvUrl);
  const data = await this.parseVDemCSV(csvPath);

  // Cache for 1 month
  await this.cache.saveToCache('vdem', data, {
    source: 'vdem',
    version: '14.1',
    updateDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // +30 days
    recordCount: data.countries.length,
    coverage: {
      countries: 202,
      startYear: 1789,
      endYear: 2024,
    },
  });

  return data;
}
```

---

### 4.3: UNDP Integration (2-3h)

**File:** `src/data/loaders/undpLoader.ts`

**UNDP Data Sources:**

1. **Human Development Index (HDI)**
   - Source: https://hdr.undp.org/data-center/human-development-index
   - Coverage: 193 countries
   - Update: Annual (September)
   - Components: Life expectancy, education, GNI per capita

2. **Multidimensional Poverty Index (MPI)**
   - Source: https://ophi.org.uk/multidimensional-poverty-index/
   - Coverage: 112 countries
   - Update: Annual (varies)
   - Dimensions: Health, education, living standards

**Cache Strategy:**
```typescript
interface UNDPCache {
  hdi: HDIData[];
  mpi: MPIData[];
  metadata: {
    hdiYear: number;      // 2024
    mpiYear: number;      // 2024
    updateDate: string;
  };
}

interface HDIData {
  countryCode: string;
  countryName: string;
  year: number;

  // HDI components (0-1 scale)
  hdi: number;                    // Overall HDI
  lifeExpectancy: number;         // Years
  expectedYearsSchooling: number;
  meanYearsSchooling: number;
  gniPerCapita: number;           // 2017 PPP $

  // Rank
  rank: number;                   // 1-193
}

interface MPIData {
  countryCode: string;
  countryName: string;
  year: number;

  // MPI components (0-1 scale, higher = worse)
  mpi: number;                    // Overall MPI
  headcountRatio: number;         // % in poverty
  intensityOfDeprivation: number; // Average % deprivations

  // Dimensions
  healthDeprivation: number;
  educationDeprivation: number;
  livingStandardsDeprivation: number;
}

class UNDPLoader {
  async load(options?: { forceRefresh?: boolean }): Promise<UNDPCache>;

  // UNDP provides downloadable CSV/Excel
  private async fetchHDI(): Promise<HDIData[]>;
  private async fetchMPI(): Promise<MPIData[]>;
}
```

**Download Strategy:**
- UNDP provides direct CSV/Excel downloads (no API)
- Download once per year (September releases)
- Cache indefinitely until new year's data available

---

### 4.4: Ecological Data Integration (3-4h)

**File:** `src/data/loaders/ecologicalLoader.ts`

**Data Sources:**

1. **Planetary Boundaries (Richardson et al. 2023)**
   - Source: Manual data extraction from paper + Stockholm Resilience Centre
   - Coverage: Global (9 boundaries)
   - Update: Irregular (2015 → 2023 → ???)

2. **Ecological Footprint (Global Footprint Network)**
   - Source: https://data.footprintnetwork.org/
   - Coverage: 188 countries
   - Update: Annual (typically 2-year lag, e.g., 2024 data = 2022 footprint)

3. **Air Quality (WHO)**
   - Source: https://www.who.int/data/gho/data/themes/air-pollution
   - Coverage: 180+ countries
   - Update: Annual

**Cache Strategy:**
```typescript
interface EcologicalCache {
  planetaryBoundaries: PlanetaryBoundaryData;
  ecologicalFootprint: FootprintData[];
  airQuality: AirQualityData[];
  metadata: {
    boundariesVersion: string;  // "2023"
    footprintYear: number;      // 2022 (data for)
    airQualityYear: number;     // 2024
    updateDate: string;
  };
}

interface PlanetaryBoundaryData {
  year: number;                 // 2023

  // 9 boundaries (global values)
  boundaries: {
    climateChange: BoundaryStatus;
    biosphereIntegrity: BoundaryStatus;
    landSystemChange: BoundaryStatus;
    freshwaterUse: BoundaryStatus;
    biogeochemicalFlows: BoundaryStatus;  // N + P
    oceanAcidification: BoundaryStatus;
    atmosphericAerosol: BoundaryStatus;
    stratosphericOzone: BoundaryStatus;
    novelEntities: BoundaryStatus;
  };
}

interface BoundaryStatus {
  current: number;              // Current value
  safe: number;                 // Safe threshold
  highrisk: number;             // High-risk threshold
  status: 'SAFE' | 'INCREASING_RISK' | 'HIGH_RISK' | 'UNKNOWN';
  uncertainty: number;          // ±50% for some boundaries
}

interface FootprintData {
  countryCode: string;
  countryName: string;
  year: number;                 // 2022 (data for)

  // Ecological footprint (gha per capita)
  totalFootprint: number;       // Total consumption
  biocapacity: number;          // Total available
  deficit: number;              // Footprint - biocapacity

  // By land type
  cropland: number;
  grazingLand: number;
  forestLand: number;
  fishingGrounds: number;
  builtUpLand: number;
  carbonFootprint: number;      // Fossil fuel emissions
}

interface AirQualityData {
  countryCode: string;
  countryName: string;
  year: number;                 // 2024

  // PM2.5 (μg/m³, population-weighted)
  pm25: number;

  // Coverage
  urbanPopulationCovered: number; // %
}

class EcologicalLoader {
  async load(options?: { forceRefresh?: boolean }): Promise<EcologicalCache>;

  // Manual data entry for planetary boundaries (static, from paper)
  private async loadPlanetaryBoundaries(): Promise<PlanetaryBoundaryData>;

  // Download from Global Footprint Network
  private async fetchEcologicalFootprint(): Promise<FootprintData[]>;

  // Download from WHO
  private async fetchAirQuality(): Promise<AirQualityData[]>;
}
```

**Planetary Boundaries - Manual Entry:**

Since planetary boundaries are global (not country-specific) and update irregularly, we'll hard-code the Richardson et al. (2023) values:

```typescript
const PLANETARY_BOUNDARIES_2023: PlanetaryBoundaryData = {
  year: 2023,
  boundaries: {
    climateChange: {
      current: 417,        // ppm CO2 (2023)
      safe: 350,
      highrisk: 450,
      status: 'HIGH_RISK',
      uncertainty: 0.1,    // ±10%
    },
    biosphereIntegrity: {
      current: 10,         // E/MSY (extinctions per million species-years)
      safe: 1,
      highrisk: 10,
      status: 'HIGH_RISK',
      uncertainty: 0.5,    // ±50% (large uncertainty)
    },
    // ... 7 more boundaries
  },
};
```

---

### 4.5: WVS Integration (1-2h)

**File:** `src/data/loaders/wvsLoader.ts`

**World Values Survey Data:**

- **Source:** https://www.worldvaluessurvey.org/WVSDocumentationWV7.jsp
- **Coverage:** 80 countries (Wave 7, 2017-2022)
- **Update:** Wave-based (~5-10 years, Wave 8 expected 2027+)

**Selected Variables (Indigenous Paradigm Proxies):**

1. **Social Trust** (Q57): "Most people can be trusted" (% agree)
2. **Community Importance** (Q6): "How important is community in your life?" (1-4 scale)
3. **Civic Participation** (Q98-Q108): Membership in voluntary organizations

**Cache Strategy:**
```typescript
interface WVSCache {
  wave: number;                 // 7
  countries: WVSCountryData[];  // 80 countries
  metadata: {
    waveYears: string;          // "2017-2022"
    updateDate: string;
  };
}

interface WVSCountryData {
  countryCode: string;
  countryName: string;
  surveyYear: number;           // Varies by country (2017-2022)

  // Proxy indicators (0-100 scale)
  socialTrust: number;          // % agreeing "most people can be trusted"
  communityImportance: number;  // % saying "very important"
  civicParticipation: number;   // % in volunteer/civic groups

  // Sample info
  sampleSize: number;
}

class WVSLoader {
  async load(options?: { forceRefresh?: boolean }): Promise<WVSCache>;

  // WVS provides SPSS/Stata files, we'll use pre-processed CSV
  private async fetchWVS(): Promise<WVSCache>;
}
```

**Download Strategy:**
- WVS provides full dataset download (SPSS/Stata format)
- Pre-process once to extract needed variables
- Cache indefinitely (Wave 7 is complete, Wave 8 won't arrive for years)

---

## Data Normalization

All data must be normalized to **0-100 scale** for geometric mean aggregation.

### V-Dem Normalization

```typescript
// V-Dem already on 0-1 scale, just multiply by 100
function normalizeVDem(vdem: VDemCountryData): {
  electoralDemocracy: number;  // 0-100
  liberalComponent: number;    // 0-100
} {
  return {
    electoralDemocracy: vdem.electoralDemocracy * 100,
    liberalComponent: vdem.liberalComponent * 100,
  };
}
```

### UNDP Normalization

```typescript
// HDI already on 0-1 scale
function normalizeHDI(hdi: HDIData): number {
  return hdi.hdi * 100;  // 0-100
}

// MPI: INVERT (low MPI = good, high MPI = bad)
function normalizeMPI(mpi: MPIData): number {
  // MPI 0 = no poverty (100/100)
  // MPI 1 = maximum poverty (0/100)
  return (1 - mpi.mpi) * 100;
}
```

### Ecological Normalization

```typescript
// Planetary boundaries: INVERT (within boundary = good)
function normalizeBoundary(boundary: BoundaryStatus): number {
  if (boundary.current <= boundary.safe) {
    return 100;  // Fully safe
  } else if (boundary.current >= boundary.highrisk) {
    return 0;    // High risk exceeded
  } else {
    // Linear interpolation between safe and high-risk
    const range = boundary.highrisk - boundary.safe;
    const excess = boundary.current - boundary.safe;
    return 100 * (1 - excess / range);
  }
}

// Ecological footprint: INVERT (low footprint = good)
function normalizeFootprint(footprint: FootprintData): number {
  // Utopia: ≤1.5 gha (sustainable)
  // Dystopia: ≥10 gha (extreme overconsumption)
  if (footprint.totalFootprint <= 1.5) return 100;
  if (footprint.totalFootprint >= 10) return 0;

  return 100 * (1 - (footprint.totalFootprint - 1.5) / 8.5);
}
```

---

## Country Code Mapping

**Critical:** All data sources use different country codes.

**Mapping Strategy:**
```typescript
// Master country code map (ISO 3166-1 alpha-3 as canonical)
interface CountryCodeMap {
  iso3: string;          // USA (canonical)
  iso2: string;          // US
  vdemCode: number;      // V-Dem internal ID
  undpCode: string;      // UNDP country name
  wvsCode: number;       // WVS country code
  countryName: string;   // "United States"
}

const COUNTRY_CODES: CountryCodeMap[] = [
  {
    iso3: 'USA',
    iso2: 'US',
    vdemCode: 1,
    undpCode: 'United States',
    wvsCode: 840,
    countryName: 'United States',
  },
  // ... 202 countries
];
```

---

## Implementation Order

1. **4.1: Cache Manager** (2-3h) - Foundation for all loaders
2. **4.2: V-Dem Integration** (3-4h) - Western Liberal paradigm
3. **4.3: UNDP Integration** (2-3h) - Development paradigm
4. **4.4: Ecological Integration** (3-4h) - Ecological paradigm
5. **4.5: WVS Integration** (1-2h) - Indigenous paradigm proxies

**Total:** 11-16 hours (within 10-12h estimate if we skip timeseries initially)

---

## Success Criteria

**Phase 4 Complete When:**
- ✅ All 4 data sources cached locally
- ✅ Cache expiry logic working (auto-refresh when stale)
- ✅ All data normalized to 0-100 scale
- ✅ Country code mapping complete (202 countries)
- ✅ Can initialize simulation without API calls (instant from cache)
- ✅ Test suite validates cache integrity

**Validation:**
```bash
# First run: downloads and caches (5-10 minutes)
npm run cache:refresh

# Subsequent runs: instant from cache (<1 second)
npx tsx scripts/monteCarloSimulation.ts  # Uses cached data
```

---

## Next: Phase 5 Integration

With cached data available, Phase 5 will integrate paradigm calculations into the simulation engine.

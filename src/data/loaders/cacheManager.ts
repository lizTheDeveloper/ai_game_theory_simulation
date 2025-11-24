/**
 * Cache Manager
 *
 * Manages local file caching for external data sources (V-Dem, UNDP, WVS, etc.)
 * to avoid API rate limits and enable fast simulation initialization.
 *
 * **Cache Strategy:**
 * - Download once, cache locally, refresh periodically
 * - Cache files gitignored (large, binary)
 * - Metadata tracked (version, update date, expiry)
 *
 * **Cache Expiry:**
 * - V-Dem: 1 month (annual release March, updates throughout year)
 * - UNDP: 1 year (annual release September)
 * - Planetary Boundaries: 5 years (irregular updates)
 * - WVS: 10 years (wave-based, Wave 7 complete)
 *
 * @module data/loaders/cacheManager
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Data source types
 */
export type DataSource = 'vdem' | 'undp-hdi' | 'undp-mpi' | 'ecological-boundaries' | 'ecological-footprint' | 'ecological-airquality' | 'wvs' | 'historical-climate' | 'historical-economic';

/**
 * Cache metadata
 *
 * Tracks version, update date, and expiry for cached data.
 */
export interface CacheMetadata {
  /** Data source identifier */
  source: DataSource;

  /** Version string (e.g., "14.1" for V-Dem, "2024" for UNDP) */
  version: string;

  /** ISO date of last fetch */
  updateDate: string;

  /** ISO date when cache expires (needs refresh) */
  expiryDate: string;

  /** Number of records in cache */
  recordCount: number;

  /** Coverage information */
  coverage: {
    /** Number of countries */
    countries: number;

    /** Start year (for timeseries) */
    startYear?: number;

    /** End year (for timeseries) */
    endYear?: number;
  };

  /** File size in bytes */
  fileSize?: number;

  /** Checksum (optional, for integrity verification) */
  checksum?: string;
}

/**
 * Cache expiry durations (milliseconds)
 */
const EXPIRY_DURATIONS: Record<DataSource, number> = {
  'vdem': 30 * 24 * 60 * 60 * 1000,                      // 1 month
  'undp-hdi': 365 * 24 * 60 * 60 * 1000,                 // 1 year
  'undp-mpi': 365 * 24 * 60 * 60 * 1000,                 // 1 year
  'ecological-boundaries': 5 * 365 * 24 * 60 * 60 * 1000, // 5 years
  'ecological-footprint': 365 * 24 * 60 * 60 * 1000,     // 1 year
  'ecological-airquality': 365 * 24 * 60 * 60 * 1000,    // 1 year
  'wvs': 10 * 365 * 24 * 60 * 60 * 1000,                 // 10 years
};

/**
 * Cache Manager
 *
 * Handles reading, writing, and validating cached data files.
 */
export class CacheManager {
  private cacheDir: string;

  /**
   * Create cache manager
   *
   * @param cacheDir - Root cache directory (default: src/data/cache)
   */
  constructor(cacheDir?: string) {
    this.cacheDir = cacheDir || path.join(process.cwd(), 'src', 'data', 'cache');
    this.ensureCacheDir();
  }

  /**
   * Ensure cache directory exists
   */
  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Get cache file path
   *
   * @param source - Data source
   * @returns Absolute path to cache file
   */
  private getCachePath(source: DataSource): string {
    const sourceMap: Record<DataSource, string> = {
      'vdem': 'vdem/vdem_2024_full.json',
      'undp-hdi': 'undp/hdi_2024.json',
      'undp-mpi': 'undp/mpi_2024.json',
      'ecological-boundaries': 'ecological/planetary_boundaries_2023.json',
      'ecological-footprint': 'ecological/ecological_footprint_2024.json',
      'ecological-airquality': 'ecological/air_quality_who_2024.json',
      'wvs': 'wvs/wvs_wave7.json',
    };

    return path.join(this.cacheDir, sourceMap[source]);
  }

  /**
   * Get metadata file path
   *
   * @param source - Data source
   * @returns Absolute path to metadata file
   */
  private getMetadataPath(source: DataSource): string {
    const cachePath = this.getCachePath(source);
    const dir = path.dirname(cachePath);
    // Use full source name to avoid collisions (undp-hdi vs undp-mpi)
    return path.join(dir, `${source}_metadata.json`);
  }

  /**
   * Check if cache exists and is valid
   *
   * @param source - Data source
   * @returns true if cache exists and not expired
   */
  async isCacheValid(source: DataSource): Promise<boolean> {
    try {
      // Check metadata exists
      const metadata = await this.getMetadata(source);
      if (!metadata) {
        return false;
      }

      // Check cache expired
      const now = new Date();
      const expiry = new Date(metadata.expiryDate);
      if (now > expiry) {
        console.log(`[CacheManager] Cache expired for ${source}: ${metadata.expiryDate}`);
        return false;
      }

      // Check cache file exists
      const cachePath = this.getCachePath(source);
      if (!fs.existsSync(cachePath)) {
        console.log(`[CacheManager] Cache file missing for ${source}: ${cachePath}`);
        return false;
      }

      // Check file size matches metadata
      const stats = fs.statSync(cachePath);
      if (metadata.fileSize && stats.size !== metadata.fileSize) {
        console.log(`[CacheManager] Cache file size mismatch for ${source}: expected ${metadata.fileSize}, got ${stats.size}`);
        return false;
      }

      console.log(`[CacheManager] Cache valid for ${source} (expires ${metadata.expiryDate})`);
      return true;
    } catch (error) {
      console.error(`[CacheManager] Error checking cache validity for ${source}:`, error);
      return false;
    }
  }

  /**
   * Load data from cache
   *
   * @param source - Data source
   * @returns Cached data, or null if cache invalid
   */
  async loadFromCache<T>(source: DataSource): Promise<T | null> {
    try {
      // Check cache valid
      const isValid = await this.isCacheValid(source);
      if (!isValid) {
        return null;
      }

      // Read cache file
      const cachePath = this.getCachePath(source);
      const data = fs.readFileSync(cachePath, 'utf-8');
      const parsed = JSON.parse(data) as T;

      console.log(`[CacheManager] Loaded ${source} from cache: ${cachePath}`);
      return parsed;
    } catch (error) {
      console.error(`[CacheManager] Error loading cache for ${source}:`, error);
      return null;
    }
  }

  /**
   * Save data to cache
   *
   * @param source - Data source
   * @param data - Data to cache
   * @param metadata - Cache metadata
   */
  async saveToCache<T>(source: DataSource, data: T, metadata: Partial<CacheMetadata>): Promise<void> {
    try {
      // Ensure cache directory exists
      const cachePath = this.getCachePath(source);
      const cacheDir = path.dirname(cachePath);
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }

      // Write cache file
      const json = JSON.stringify(data, null, 2);
      fs.writeFileSync(cachePath, json, 'utf-8');

      // Calculate file size
      const stats = fs.statSync(cachePath);

      // Build metadata
      const now = new Date();
      const expiryDuration = EXPIRY_DURATIONS[source];
      const expiryDate = new Date(now.getTime() + expiryDuration);

      const fullMetadata: CacheMetadata = {
        source,
        version: metadata.version || 'unknown',
        updateDate: now.toISOString(),
        expiryDate: expiryDate.toISOString(),
        recordCount: metadata.recordCount || 0,
        coverage: metadata.coverage || { countries: 0 },
        fileSize: stats.size,
      };

      // Write metadata
      const metadataPath = this.getMetadataPath(source);
      fs.writeFileSync(metadataPath, JSON.stringify(fullMetadata, null, 2), 'utf-8');

      console.log(`[CacheManager] Saved ${source} to cache: ${cachePath} (${stats.size} bytes, expires ${expiryDate.toISOString()})`);
    } catch (error) {
      console.error(`[CacheManager] Error saving cache for ${source}:`, error);
      throw error;
    }
  }

  /**
   * Get cache metadata
   *
   * @param source - Data source
   * @returns Cache metadata, or null if not found
   */
  async getMetadata(source: DataSource): Promise<CacheMetadata | null> {
    try {
      const metadataPath = this.getMetadataPath(source);
      if (!fs.existsSync(metadataPath)) {
        return null;
      }

      const data = fs.readFileSync(metadataPath, 'utf-8');
      const metadata = JSON.parse(data) as CacheMetadata;
      return metadata;
    } catch (error) {
      console.error(`[CacheManager] Error reading metadata for ${source}:`, error);
      return null;
    }
  }

  /**
   * Delete cache
   *
   * @param source - Data source
   */
  async deleteCache(source: DataSource): Promise<void> {
    try {
      const cachePath = this.getCachePath(source);
      if (fs.existsSync(cachePath)) {
        fs.unlinkSync(cachePath);
        console.log(`[CacheManager] Deleted cache for ${source}: ${cachePath}`);
      }

      const metadataPath = this.getMetadataPath(source);
      if (fs.existsSync(metadataPath)) {
        fs.unlinkSync(metadataPath);
        console.log(`[CacheManager] Deleted metadata for ${source}: ${metadataPath}`);
      }
    } catch (error) {
      console.error(`[CacheManager] Error deleting cache for ${source}:`, error);
      throw error;
    }
  }

  /**
   * Force refresh cache
   *
   * Deletes existing cache to force re-download.
   *
   * @param source - Data source
   */
  async forceRefresh(source: DataSource): Promise<void> {
    console.log(`[CacheManager] Forcing refresh for ${source}`);
    await this.deleteCache(source);
  }

  /**
   * Get all cache metadata
   *
   * @returns Map of source → metadata
   */
  async getAllMetadata(): Promise<Map<DataSource, CacheMetadata>> {
    const sources: DataSource[] = [
      'vdem',
      'undp-hdi',
      'undp-mpi',
      'ecological-boundaries',
      'ecological-footprint',
      'ecological-airquality',
      'wvs',
    ];

    const metadataMap = new Map<DataSource, CacheMetadata>();

    for (const source of sources) {
      const metadata = await this.getMetadata(source);
      if (metadata) {
        metadataMap.set(source, metadata);
      }
    }

    return metadataMap;
  }

  /**
   * Print cache status summary
   */
  async printCacheStatus(): Promise<void> {
    console.log('\n=== Cache Status ===\n');

    const sources: DataSource[] = [
      'vdem',
      'undp-hdi',
      'undp-mpi',
      'ecological-boundaries',
      'ecological-footprint',
      'ecological-airquality',
      'wvs',
    ];

    for (const source of sources) {
      const metadata = await this.getMetadata(source);
      const isValid = await this.isCacheValid(source);

      if (metadata) {
        const status = isValid ? '✅ VALID' : '⏰ EXPIRED';
        const size = metadata.fileSize ? `${(metadata.fileSize / 1024 / 1024).toFixed(2)} MB` : 'unknown';
        console.log(`${status} ${source.padEnd(30)} | ${metadata.version.padEnd(10)} | ${metadata.coverage.countries} countries | ${size}`);
      } else {
        console.log(`⚠️  MISSING ${source.padEnd(28)} | No cache found`);
      }
    }

    console.log('\n');
  }
}

/**
 * Global cache manager instance
 */
export const cacheManager = new CacheManager();

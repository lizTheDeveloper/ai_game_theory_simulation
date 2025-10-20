/**
 * Cache Manager Tests
 *
 * Validates cache reading, writing, expiry, and metadata handling.
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import * as fs from 'fs';
import * as path from 'path';
import { CacheManager } from '../../src/data/loaders/cacheManager';
import type { CacheMetadata } from '../../src/data/loaders/cacheManager';

describe('CacheManager', () => {
  const testCacheDir = path.join(process.cwd(), 'tests', 'data', '.test-cache');
  let cacheManager: CacheManager;

  before(() => {
    // Create test cache directory
    if (!fs.existsSync(testCacheDir)) {
      fs.mkdirSync(testCacheDir, { recursive: true });
    }
    cacheManager = new CacheManager(testCacheDir);
  });

  after(() => {
    // Clean up test cache directory
    if (fs.existsSync(testCacheDir)) {
      fs.rmSync(testCacheDir, { recursive: true, force: true });
    }
  });

  it('should save and load cache data', async () => {
    const testData = {
      countries: [
        { code: 'USA', value: 0.92 },
        { code: 'CHN', value: 0.76 },
      ],
    };

    const metadata: Partial<CacheMetadata> = {
      version: '14.1',
      recordCount: 2,
      coverage: { countries: 2 },
    };

    // Save to cache
    await cacheManager.saveToCache('vdem', testData, metadata);

    // Load from cache
    const loaded = await cacheManager.loadFromCache<typeof testData>('vdem');

    assert.ok(loaded, 'Cache data should be loaded');
    assert.strictEqual(loaded.countries.length, 2, 'Should have 2 countries');
    assert.strictEqual(loaded.countries[0].code, 'USA', 'First country should be USA');
    assert.strictEqual(loaded.countries[0].value, 0.92, 'USA value should be 0.92');

    console.log('✓ Cache save/load test passed');
  });

  it('should validate cache expiry', async () => {
    const testData = { test: 'data' };

    // Save cache
    await cacheManager.saveToCache('vdem', testData, {
      version: '14.1',
      recordCount: 1,
      coverage: { countries: 1 },
    });

    // Should be valid immediately
    const isValid = await cacheManager.isCacheValid('vdem');
    assert.ok(isValid, 'Cache should be valid immediately after save');

    // Get metadata
    const metadata = await cacheManager.getMetadata('vdem');
    assert.ok(metadata, 'Metadata should exist');
    assert.strictEqual(metadata?.source, 'vdem', 'Metadata source should be vdem');
    assert.strictEqual(metadata?.version, '14.1', 'Metadata version should be 14.1');

    // Expiry date should be ~30 days from now (V-Dem expiry)
    const expiryDate = new Date(metadata!.expiryDate);
    const now = new Date();
    const daysDiff = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    assert.ok(daysDiff >= 29 && daysDiff <= 31, `Expiry should be ~30 days from now, got ${daysDiff.toFixed(1)} days`);

    console.log('✓ Cache expiry validation test passed');
  });

  it('should detect missing cache files', async () => {
    // Try to load cache that doesn't exist
    const loaded = await cacheManager.loadFromCache('undp-hdi');
    assert.strictEqual(loaded, null, 'Missing cache should return null');

    // Should not be valid
    const isValid = await cacheManager.isCacheValid('undp-hdi');
    assert.strictEqual(isValid, false, 'Missing cache should not be valid');

    console.log('✓ Missing cache detection test passed');
  });

  it('should force refresh cache', async () => {
    const testData = { test: 'initial' };

    // Save initial cache
    await cacheManager.saveToCache('wvs', testData, {
      version: 'Wave7',
      recordCount: 1,
      coverage: { countries: 1 },
    });

    // Verify exists
    let loaded = await cacheManager.loadFromCache<typeof testData>('wvs');
    assert.ok(loaded, 'Initial cache should exist');

    // Force refresh (delete)
    await cacheManager.forceRefresh('wvs');

    // Should be gone
    loaded = await cacheManager.loadFromCache<typeof testData>('wvs');
    assert.strictEqual(loaded, null, 'Cache should be deleted after force refresh');

    console.log('✓ Force refresh test passed');
  });

  it('should handle metadata for multiple sources', async () => {
    // Save multiple sources
    await cacheManager.saveToCache('vdem', { test: 'vdem' }, {
      version: '14.1',
      recordCount: 202,
      coverage: { countries: 202 },
    });

    await cacheManager.saveToCache('undp-hdi', { test: 'hdi' }, {
      version: '2024',
      recordCount: 193,
      coverage: { countries: 193 },
    });

    // Get all metadata
    const allMetadata = await cacheManager.getAllMetadata();

    assert.ok(allMetadata.size >= 2, 'Should have at least 2 metadata entries');
    assert.ok(allMetadata.has('vdem'), 'Should have V-Dem metadata');
    assert.ok(allMetadata.has('undp-hdi'), 'Should have UNDP HDI metadata');

    const vdemMeta = allMetadata.get('vdem');
    assert.strictEqual(vdemMeta?.recordCount, 202, 'V-Dem should have 202 countries');

    const hdiMeta = allMetadata.get('undp-hdi');
    assert.strictEqual(hdiMeta?.recordCount, 193, 'HDI should have 193 countries');

    console.log('✓ Multiple metadata test passed');
  });

  it('should print cache status', async () => {
    // Save some test caches
    await cacheManager.saveToCache('vdem', { test: 'vdem' }, {
      version: '14.1',
      recordCount: 202,
      coverage: { countries: 202 },
    });

    // Print status (visual verification)
    await cacheManager.printCacheStatus();

    console.log('✓ Cache status print test passed');
  });
});

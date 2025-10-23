/**
 * Automated V-Dem Data Update Script
 *
 * Downloads the latest V-Dem dataset and updates the local cache with
 * Electoral Democracy, Liberal Component, and Egalitarian indices for 33 key countries.
 *
 * Usage:
 *   npm run update-vdem
 *
 * What it does:
 * 1. Downloads V-Dem v15 CSV (~500MB) from v-dem.net
 * 2. Parses CSV and extracts 3 indicators for 33 countries
 * 3. Updates src/data/cache/vdem/vdem_2024_full.json
 * 4. Updates metadata with version and timestamp
 *
 * Runs annually (March) when V-Dem releases new version, or on-demand.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as readline from 'readline';

// V-Dem download info (v15 - 2025 release)
// NOTE: V-Dem requires email registration - no public direct download URL
// Download manually from: https://v-dem.net/data/the-v-dem-dataset/country-year-v-dem-core-v15/
const VDEM_DOWNLOAD_PAGE = 'https://v-dem.net/data/the-v-dem-dataset/country-year-v-dem-core-v15/';
const VDEM_VERSION = '15.0';
const EXPECTED_CSV_NAME = 'V-Dem-CY-Core-v15.csv';

// 33 key countries (matches government-agents package)
const TARGET_COUNTRIES = [
  'USA', 'CHN', 'IND', 'DEU', 'GBR', 'FRA', 'JPN', 'ITA', 'BRA', 'CAN',
  'RUS', 'KOR', 'IDN', 'TUR', 'MEX', 'SAU', 'NLD', 'CHE', 'POL', 'SWE',
  'NOR', 'SGP', 'BEL', 'ESP', 'EGY', 'IRN', 'PHL', 'VNM', 'THA', 'BGD',
  'PAK', 'NGA', 'BTN'
];

// V-Dem country code to ISO 3166-1 alpha-3 mapping
const VDEM_TO_ISO: Record<number, string> = {
  142: 'NOR', // Norway
  184: 'SWE', // Sweden
  77: 'DEU',  // Germany
  212: 'USA', // United States
  211: 'GBR', // United Kingdom
  70: 'FRA',  // France
  109: 'JPN', // Japan
  106: 'ITA', // Italy
  31: 'BRA',  // Brazil
  40: 'CAN',  // Canada
  167: 'RUS', // Russia
  116: 'KOR', // South Korea
  100: 'IDN', // Indonesia
  188: 'TUR', // Turkey
  138: 'MEX', // Mexico
  170: 'SAU', // Saudi Arabia
  140: 'NLD', // Netherlands
  181: 'CHE', // Switzerland
  148: 'POL', // Poland
  177: 'SGP', // Singapore
  20: 'BEL',  // Belgium
  176: 'ESP', // Spain
  59: 'EGY',  // Egypt
  102: 'IRN', // Iran
  152: 'PHL', // Philippines
  194: 'VNM', // Vietnam
  187: 'THA', // Thailand
  10: 'BGD',  // Bangladesh
  146: 'PAK', // Pakistan
  141: 'NGA', // Nigeria
  33: 'BTN',  // Bhutan
  45: 'CHN',  // China
  99: 'IND',  // India
};

// Reverse mapping: ISO to V-Dem country ID
const ISO_TO_VDEM = Object.fromEntries(
  Object.entries(VDEM_TO_ISO).map(([vdemId, iso]) => [iso, parseInt(vdemId)])
);

interface VDemRow {
  country_text_id: string;
  country_name: string;
  year: number;
  v2x_polyarchy: number;   // Electoral Democracy Index
  v2x_liberal: number;     // Liberal Component Index
  v2x_egalitarian: number; // Egalitarian Component Index
}

interface VDemCountryData {
  countryCode: string;
  countryName: string;
  year: number;
  vdemCountryId: number;
  electoralDemocracy: number;
  liberalComponent: number;
  egalitarianComponent: number;
}

/**
 * Download file from URL with progress tracking
 */
async function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`📥 Downloading: ${url}`);

    const file = fs.createWriteStream(destPath);
    let downloadedBytes = 0;

    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          console.log(`↪️  Redirecting to: ${redirectUrl}`);
          file.close();
          fs.unlinkSync(destPath);
          return downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
        }
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
        return;
      }

      const totalBytes = parseInt(response.headers['content-length'] || '0', 10);

      response.on('data', (chunk) => {
        downloadedBytes += chunk.length;
        const percent = totalBytes ? ((downloadedBytes / totalBytes) * 100).toFixed(1) : '?';
        const mb = (downloadedBytes / 1024 / 1024).toFixed(1);
        process.stdout.write(`\r   Progress: ${mb}MB (${percent}%)`);
      });

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log('\n✅ Download complete');
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => reject(err));
    });
  });
}

/**
 * Parse CSV and extract data for target countries
 */
async function parseVDemCSV(csvPath: string, year: number = 2024): Promise<VDemCountryData[]> {
  console.log(`📊 Parsing V-Dem CSV for year ${year}...`);

  const fileStream = fs.createReadStream(csvPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let headers: string[] = [];
  let lineCount = 0;
  const results: VDemCountryData[] = [];

  for await (const line of rl) {
    lineCount++;

    // Parse header row
    if (lineCount === 1) {
      headers = parseCSVLine(line);
      console.log(`   Found ${headers.length} columns`);
      continue;
    }

    // Parse data rows
    const values = parseCSVLine(line);
    if (values.length !== headers.length) continue;

    const row: any = {};
    headers.forEach((header, i) => {
      row[header] = values[i];
    });

    // Filter for target year and countries
    const rowYear = parseInt(row.year);
    const vdemCountryId = parseInt(row.country_id || row.COWcode);

    if (rowYear !== year) continue;

    const isoCode = VDEM_TO_ISO[vdemCountryId];
    if (!isoCode || !TARGET_COUNTRIES.includes(isoCode)) continue;

    // Extract indicators
    const countryData: VDemCountryData = {
      countryCode: isoCode,
      countryName: row.country_name || row.country_text_id,
      year: rowYear,
      vdemCountryId,
      electoralDemocracy: parseFloat(row.v2x_polyarchy) || 0,
      liberalComponent: parseFloat(row.v2x_liberal) || 0,
      egalitarianComponent: parseFloat(row.v2x_egalitarian) || 0,
    };

    results.push(countryData);

    if (lineCount % 10000 === 0) {
      process.stdout.write(`\r   Processed ${(lineCount / 1000).toFixed(0)}K rows, found ${results.length} countries`);
    }
  }

  console.log(`\n✅ Parsed ${results.length}/${TARGET_COUNTRIES.length} countries`);
  return results;
}

/**
 * Simple CSV line parser (handles quoted fields)
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

/**
 * Update cache files
 */
function updateCache(data: VDemCountryData[], version: string): void {
  console.log('💾 Updating cache files...');

  const cacheDir = path.join(__dirname, '../src/data/cache/vdem');

  // Ensure cache directory exists
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  // Update vdem_2024_full.json
  const dataFile = path.join(cacheDir, 'vdem_2024_full.json');
  const cacheData = {
    version,
    year: 2024,
    updateDate: new Date().toISOString(),
    countries: data.sort((a, b) => a.countryCode.localeCompare(b.countryCode)),
  };

  fs.writeFileSync(dataFile, JSON.stringify(cacheData, null, 2));
  console.log(`✅ Updated: ${path.relative(process.cwd(), dataFile)}`);

  // Update metadata
  const metadataFile = path.join(cacheDir, 'vdem_metadata.json');
  const metadata = {
    source: 'vdem',
    version,
    updateDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    recordCount: data.length,
    coverage: {
      countries: data.length,
      startYear: 2024,
      endYear: 2024,
    },
    fileSize: fs.statSync(dataFile).size,
  };

  fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2));
  console.log(`✅ Updated: ${path.relative(process.cwd(), metadataFile)}`);
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🌍 V-Dem Data Update Script\n');
  console.log(`Version: ${VDEM_VERSION}`);
  console.log(`Target: ${TARGET_COUNTRIES.length} countries\n`);

  const tmpDir = path.join(__dirname, '../tmp');
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, { recursive: true });
  }

  // Look for any V-Dem CSV in tmp directory
  const possibleFiles = [
    path.join(tmpDir, EXPECTED_CSV_NAME),
    path.join(tmpDir, 'V-Dem-CY-Full+Others-v15.csv'),
    path.join(tmpDir, 'vdem_v15.csv'),
    path.join(tmpDir, 'Country_Year_V-Dem_Core_CSV_v15.csv'),
  ];

  let csvPath: string | null = null;
  for (const file of possibleFiles) {
    if (fs.existsSync(file)) {
      csvPath = file;
      break;
    }
  }

  try {
    // Step 1: Check for CSV file
    if (!csvPath) {
      console.log('❌ V-Dem CSV file not found!\n');
      console.log('📥 MANUAL DOWNLOAD REQUIRED:\n');
      console.log(`1. Visit: ${VDEM_DOWNLOAD_PAGE}`);
      console.log('2. Fill in registration form (email required)');
      console.log('3. Select format: CSV');
      console.log('4. Download will start automatically');
      console.log(`5. Save the CSV file to: ${tmpDir}/`);
      console.log(`   (Expected filename: ${EXPECTED_CSV_NAME})\n`);
      console.log('6. Run this script again: npm run update-vdem\n');
      process.exit(1);
    } else {
      console.log(`✅ Found V-Dem CSV: ${path.basename(csvPath)}`);
      console.log(`   Location: ${csvPath}\n`);
    }

    // Step 2: Parse CSV
    const data = await parseVDemCSV(csvPath, 2024);

    if (data.length === 0) {
      throw new Error('No data extracted from CSV. Check year or country mappings.');
    }

    // Step 3: Update cache
    updateCache(data, VDEM_VERSION);

    console.log('\n✅ V-Dem data update complete!\n');
    console.log('Summary:');
    console.log(`  - Countries updated: ${data.length}`);
    console.log(`  - Version: ${VDEM_VERSION}`);
    console.log(`  - Year: 2024`);
    console.log(`  - Cache location: src/data/cache/vdem/\n`);

  } catch (error) {
    console.error('\n❌ Error updating V-Dem data:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

/**
 * Historical Data Migration - Grading Data
 *
 * Migrates previous grading data into the citation integrity platform's
 * consistency checker to establish baseline grade distributions.
 *
 * Purpose:
 * - Import historical manual grading data
 * - Establish grade distribution baseline
 * - Enable grade drift detection
 * - Populate severity classifier training data
 *
 * Usage:
 * ```bash
 * npx tsx scripts/migrate/historicalGrades.ts --source ./data/historical_grades.json
 * ```
 *
 * Task: Phase 2 Production Deployment (Marcus - Platform Engineer)
 */

import * as fs from 'fs';
import * as path from 'path';
import { GradingConsistencyChecker } from '@/platform/grading/consistencyChecker';
import { AutoGrader, GradingError, GradingResult } from '@/platform/grading/autoGrader';

// ============================================================================
// Types
// ============================================================================

/**
 * Historical grade record (manual grading)
 */
interface HistoricalGrade {
  studentId: string;
  fileName: string;
  grade: number;
  letterGrade: string;
  timestamp: number;
  grader: string;
  claimCount: number;
  errors?: Array<{
    type: string;
    severity: string;
    description: string;
    location: string;
  }>;
  notes?: string;
}

/**
 * Migration result
 */
interface MigrationResult {
  totalRecords: number;
  imported: number;
  skipped: number;
  errors: number;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
  avgGrade: number;
  medianGrade: number;
  stdDev: number;
}

// ============================================================================
// Migration Logic
// ============================================================================

/**
 * Migrate historical grading data
 */
export async function migrateHistoricalGrades(
  sourcePath: string,
  options: {
    dryRun?: boolean;
    verbose?: boolean;
    outputPath?: string;
  } = {}
): Promise<MigrationResult> {
  const { dryRun = false, verbose = false, outputPath } = options;

  console.log('\n🔄 Historical Grading Data Migration');
  console.log('═══════════════════════════════════════\n');

  // Step 1: Load historical data
  console.log('📖 Loading historical data...');
  const historicalData = loadHistoricalData(sourcePath);
  console.log(`   Found ${historicalData.length} records\n`);

  if (historicalData.length === 0) {
    throw new Error('No historical data found');
  }

  // Step 2: Validate data
  console.log('✓ Validating data...');
  const validRecords = validateHistoricalData(historicalData, verbose);
  console.log(`   Valid: ${validRecords.length} / ${historicalData.length}\n`);

  // Step 3: Import into consistency checker
  console.log('📊 Importing into consistency checker...');
  const consistencyChecker = new GradingConsistencyChecker({
    enableLogging: verbose,
  });

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const record of validRecords) {
    try {
      if (!dryRun) {
        // Convert to GradingResult format
        const gradingResult: GradingResult = {
          fileName: record.fileName,
          grade: record.grade,
          letterGrade: record.letterGrade as any,
          breakdown: (record.errors || []).map((e) => ({
            type: e.type as any,
            severity: e.severity as any,
            description: e.description,
            location: e.location,
            penalty: getSeverityPenalty(e.severity),
          })),
          claimCount: record.claimCount,
          verifiedCount: record.claimCount - (record.errors?.length || 0),
          timestamp: record.timestamp,
        };

        consistencyChecker.recordGrade(gradingResult);
      }

      imported++;

      if (verbose && imported % 10 === 0) {
        console.log(`   Imported ${imported} records...`);
      }
    } catch (error) {
      errors++;
      if (verbose) {
        console.error(`   Error importing record ${record.studentId}:`, error);
      }
    }
  }

  console.log(`   Imported: ${imported} records\n`);

  // Step 4: Calculate statistics
  console.log('📈 Calculating statistics...');
  const stats = calculateStatistics(validRecords);
  console.log(`   Avg Grade: ${stats.avgGrade.toFixed(2)}`);
  console.log(`   Median: ${stats.medianGrade.toFixed(2)}`);
  console.log(`   Std Dev: ${stats.stdDev.toFixed(2)}\n`);

  // Step 5: Grade distribution
  console.log('📊 Grade Distribution:');
  const distribution = stats.gradeDistribution;
  const total = imported;
  for (const [letter, count] of Object.entries(distribution)) {
    const percentage = ((count / total) * 100).toFixed(1);
    const bar = '█'.repeat(Math.floor(count / total * 50));
    console.log(`   ${letter}: ${count.toString().padStart(3)} (${percentage}%) ${bar}`);
  }
  console.log();

  // Step 6: Save migration report
  const result: MigrationResult = {
    totalRecords: historicalData.length,
    imported,
    skipped: validRecords.length - imported,
    errors,
    gradeDistribution: stats.gradeDistribution,
    avgGrade: stats.avgGrade,
    medianGrade: stats.medianGrade,
    stdDev: stats.stdDev,
  };

  if (outputPath && !dryRun) {
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`📄 Migration report saved: ${outputPath}\n`);
  }

  // Step 7: Drift detection baseline
  if (!dryRun) {
    console.log('🎯 Setting drift detection baseline...');
    consistencyChecker.setBaseline({
      avgGrade: stats.avgGrade,
      stdDev: stats.stdDev,
      distribution: stats.gradeDistribution,
    });
    console.log(`   Baseline set (avg: ${stats.avgGrade.toFixed(2)}, σ: ${stats.stdDev.toFixed(2)})\n`);
  }

  console.log('═══════════════════════════════════════');
  if (dryRun) {
    console.log('✓ DRY RUN COMPLETE (No data imported)');
  } else {
    console.log('✓ MIGRATION COMPLETE');
  }
  console.log('═══════════════════════════════════════\n');

  return result;
}

/**
 * Load historical grading data from JSON file
 */
function loadHistoricalData(sourcePath: string): HistoricalGrade[] {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Source file not found: ${sourcePath}`);
  }

  const content = fs.readFileSync(sourcePath, 'utf-8');
  const data = JSON.parse(content);

  // Handle different formats
  if (Array.isArray(data)) {
    return data;
  } else if (data.grades && Array.isArray(data.grades)) {
    return data.grades;
  } else {
    throw new Error('Invalid data format - expected array of grades');
  }
}

/**
 * Validate historical data
 */
function validateHistoricalData(
  data: HistoricalGrade[],
  verbose: boolean
): HistoricalGrade[] {
  const valid: HistoricalGrade[] = [];
  const issues: string[] = [];

  for (const record of data) {
    // Required fields
    if (!record.studentId) {
      issues.push(`Missing studentId: ${JSON.stringify(record)}`);
      continue;
    }

    if (typeof record.grade !== 'number' || record.grade < 0 || record.grade > 100) {
      issues.push(`Invalid grade for ${record.studentId}: ${record.grade}`);
      continue;
    }

    if (!record.letterGrade || !['A', 'B', 'C', 'D', 'F'].includes(record.letterGrade)) {
      issues.push(`Invalid letter grade for ${record.studentId}: ${record.letterGrade}`);
      continue;
    }

    // Normalize timestamp
    if (!record.timestamp) {
      record.timestamp = Date.now();
    }

    // Normalize claim count
    if (!record.claimCount || record.claimCount < 0) {
      record.claimCount = 0;
    }

    valid.push(record);
  }

  if (verbose && issues.length > 0) {
    console.warn(`⚠ Validation issues:`);
    issues.slice(0, 5).forEach((issue) => console.warn(`   - ${issue}`));
    if (issues.length > 5) {
      console.warn(`   ... and ${issues.length - 5} more`);
    }
  }

  return valid;
}

/**
 * Calculate statistics from historical data
 */
function calculateStatistics(data: HistoricalGrade[]) {
  const grades = data.map((r) => r.grade).sort((a, b) => a - b);

  // Average
  const sum = grades.reduce((a, b) => a + b, 0);
  const avgGrade = sum / grades.length;

  // Median
  const mid = Math.floor(grades.length / 2);
  const medianGrade =
    grades.length % 2 === 0 ? (grades[mid - 1] + grades[mid]) / 2 : grades[mid];

  // Standard deviation
  const squaredDiffs = grades.map((g) => Math.pow(g - avgGrade, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / grades.length;
  const stdDev = Math.sqrt(variance);

  // Distribution
  const gradeDistribution = {
    A: data.filter((r) => r.letterGrade === 'A').length,
    B: data.filter((r) => r.letterGrade === 'B').length,
    C: data.filter((r) => r.letterGrade === 'C').length,
    D: data.filter((r) => r.letterGrade === 'D').length,
    F: data.filter((r) => r.letterGrade === 'F').length,
  };

  return {
    avgGrade,
    medianGrade,
    stdDev,
    gradeDistribution,
  };
}

/**
 * Get penalty for severity level
 */
function getSeverityPenalty(severity: string): number {
  switch (severity.toUpperCase()) {
    case 'CRITICAL':
      return 15;
    case 'HIGH':
      return 10;
    case 'MEDIUM':
      return 5;
    case 'LOW':
      return 3;
    default:
      return 0;
  }
}

// ============================================================================
// CLI Execution
// ============================================================================

async function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  let sourcePath = './data/historical_grades.json';
  let dryRun = false;
  let verbose = false;
  let outputPath = './logs/migration_report.json';

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--source':
      case '-s':
        sourcePath = args[++i];
        break;
      case '--dry-run':
      case '-d':
        dryRun = true;
        break;
      case '--verbose':
      case '-v':
        verbose = true;
        break;
      case '--output':
      case '-o':
        outputPath = args[++i];
        break;
      case '--help':
      case '-h':
        console.log(`
Historical Grading Data Migration

Usage:
  npx tsx scripts/migrate/historicalGrades.ts [options]

Options:
  -s, --source <path>   Source JSON file (default: ./data/historical_grades.json)
  -o, --output <path>   Output report path (default: ./logs/migration_report.json)
  -d, --dry-run         Run without importing data
  -v, --verbose         Verbose output
  -h, --help            Show this help

Example:
  npx tsx scripts/migrate/historicalGrades.ts --source ./data/grades.json --verbose
        `);
        process.exit(0);
    }
  }

  try {
    const result = await migrateHistoricalGrades(sourcePath, {
      dryRun,
      verbose,
      outputPath,
    });

    if (result.errors > 0) {
      console.error(`⚠ Migration completed with ${result.errors} errors`);
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

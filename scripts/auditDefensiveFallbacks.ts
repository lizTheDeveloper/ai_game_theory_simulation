#!/usr/bin/env tsx
/**
 * Defensive Fallback Audit Script
 *
 * Scans simulation code for defensive fallback patterns (?? and ||)
 * and flags violations where REQUIRED fields use fallbacks without justification.
 *
 * Usage:
 *   npx tsx scripts/auditDefensiveFallbacks.ts
 *
 * Exit codes:
 *   0 - No violations found
 *   1 - Violations found (blocking)
 *   2 - Warnings found (non-blocking)
 */

import * as fs from 'fs';
import * as path from 'path';

const SIMULATION_DIR = path.join(process.cwd(), 'src/simulation');

interface Violation {
  file: string;
  line: number;
  content: string;
  severity: 'CRITICAL' | 'WARNING';
  reason: string;
}

/**
 * Scan a file for fallback patterns
 */
function scanFile(filePath: string): Violation[] {
  const violations: Violation[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
      continue;
    }

    // Check for ?? fallback operator
    if (line.includes('??')) {
      // Check if line has LEGITIMATE FALLBACK comment
      const hasLegitimateComment =
        line.includes('LEGITIMATE FALLBACK') ||
        lines[i - 1]?.includes('LEGITIMATE FALLBACK') ||
        lines[i - 2]?.includes('LEGITIMATE FALLBACK');

      // Check if it's a config fallback (these are OK)
      const isConfigFallback =
        line.includes('CONFIG') ||
        line.includes('config.');

      // Check if it's a context fallback (these are OK)
      const isContextFallback =
        line.includes('context ||') ||
        line.includes('phaseContext');

      if (!hasLegitimateComment && !isConfigFallback && !isContextFallback) {
        violations.push({
          file: path.relative(process.cwd(), filePath),
          line: lineNum,
          content: line.trim(),
          severity: 'CRITICAL',
          reason: 'Fallback operator ?? without LEGITIMATE FALLBACK comment'
        });
      }
    }

    // Check for || 0 fallback pattern
    if (line.match(/\|\|\s*0(?![\.x])/)) { // Exclude 0.X and 0x hex
      const hasLegitimateComment =
        line.includes('LEGITIMATE FALLBACK') ||
        lines[i - 1]?.includes('LEGITIMATE FALLBACK') ||
        lines[i - 2]?.includes('LEGITIMATE FALLBACK');

      const isContextFallback =
        line.includes('context ||') ||
        line.includes('phaseContext') ||
        line.includes('rng ||');

      if (!hasLegitimateComment && !isContextFallback) {
        violations.push({
          file: path.relative(process.cwd(), filePath),
          line: lineNum,
          content: line.trim(),
          severity: 'CRITICAL',
          reason: 'Fallback pattern || 0 without LEGITIMATE FALLBACK comment'
        });
      }
    }

    // Check for || default patterns (other fallbacks)
    if (line.match(/\|\|\s*(?!0(?![\.x]))[a-zA-Z_]/)) {
      const hasLegitimateComment =
        line.includes('LEGITIMATE FALLBACK') ||
        line.includes('LEGITIMATE') ||
        lines[i - 1]?.includes('LEGITIMATE FALLBACK') ||
        lines[i - 2]?.includes('LEGITIMATE FALLBACK');

      const isContextFallback =
        line.includes('context ||') ||
        line.includes('phaseContext') ||
        line.includes('rng ||');

      if (!hasLegitimateComment && !isContextFallback) {
        violations.push({
          file: path.relative(process.cwd(), filePath),
          line: lineNum,
          content: line.trim(),
          severity: 'WARNING',
          reason: 'Fallback pattern || variable without LEGITIMATE comment'
        });
      }
    }
  }

  return violations;
}

/**
 * Recursively find all .ts files in a directory
 */
function findTsFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recurse into subdirectories
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') && !file.endsWith('.test.ts') && !file.endsWith('.spec.ts')) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

/**
 * Main audit function
 */
async function audit() {
  console.log('🔍 Scanning simulation files for defensive fallback violations...\n');

  // Find all .ts files in simulation directory
  const files = findTsFiles(SIMULATION_DIR);

  console.log(`📁 Found ${files.length} TypeScript files\n`);

  const allViolations: Violation[] = [];
  for (const file of files) {
    const violations = scanFile(file);
    allViolations.push(...violations);
  }

  // Separate by severity
  const critical = allViolations.filter(v => v.severity === 'CRITICAL');
  const warnings = allViolations.filter(v => v.severity === 'WARNING');

  // Report results
  if (critical.length > 0) {
    console.log(`❌ CRITICAL VIOLATIONS: ${critical.length}\n`);
    for (const violation of critical) {
      console.log(`  ${violation.file}:${violation.line}`);
      console.log(`    ${violation.content}`);
      console.log(`    ⚠️  ${violation.reason}\n`);
    }
  }

  if (warnings.length > 0) {
    console.log(`⚠️  WARNINGS: ${warnings.length}\n`);
    for (const violation of warnings) {
      console.log(`  ${violation.file}:${violation.line}`);
      console.log(`    ${violation.content}`);
      console.log(`    💡 ${violation.reason}\n`);
    }
  }

  // Summary
  console.log('\n📊 SUMMARY');
  console.log('='.repeat(50));
  console.log(`Total files scanned: ${files.length}`);
  console.log(`Critical violations: ${critical.length}`);
  console.log(`Warnings: ${warnings.length}`);
  console.log(`Total issues: ${allViolations.length}`);
  console.log('='.repeat(50));

  if (critical.length > 0) {
    console.log('\n❌ AUDIT FAILED - Critical violations must be fixed\n');
    console.log('Fix pattern:');
    console.log('  1. Check if field is REQUIRED or optional in type definition');
    console.log('  2. If REQUIRED: Replace with assertion utilities');
    console.log('  3. If OPTIONAL: Add // LEGITIMATE FALLBACK: <reason> comment');
    console.log('\nSee: reviews/defensive_fallback_regression_fix_20251120.md\n');
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log('\n⚠️  AUDIT PASSED with warnings - Consider adding comments\n');
    process.exit(2);
  } else {
    console.log('\n✅ AUDIT PASSED - No defensive fallback violations found\n');
    process.exit(0);
  }
}

// Run audit
audit().catch(err => {
  console.error('❌ Audit script failed:', err);
  process.exit(3);
});

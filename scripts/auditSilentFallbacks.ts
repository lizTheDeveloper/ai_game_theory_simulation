#!/usr/bin/env npx tsx
/**
 * Static Analysis: Detect Silent Fallback Patterns
 *
 * Purpose: Proactive audit for defensive fallback patterns that hide bugs
 * Priority: HIGH (Section 6.5 - Silent Fallback Pattern Recognition)
 *
 * Detects:
 * 1. `?? fallback` patterns in simulation calculations (hiding NaN/undefined)
 * 2. `|| 0` patterns (silent zero defaults)
 * 3. `isNaN(x) ? fallback : x` patterns (masking NaN)
 *
 * Exceptions:
 * - Initialization code (where defaults are intentional)
 * - UI display code (not simulation calculations)
 * - Compatibility layers (external system interfaces)
 *
 * Research backing:
 * - Oct 2025 ecology NaN bug hidden by `?? 50` fallback for months
 * - Nov 2025 god mode NaN from undefined population access
 * - Pattern identified: LLMs and code share failure mode (plausible-sounding but wrong)
 */

import * as fs from 'fs';
import * as path from 'path';

interface FallbackOccurrence {
  file: string;
  line: number;
  column: number;
  pattern: string;
  context: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
}

// Patterns to detect (regex)
const FALLBACK_PATTERNS = [
  {
    name: 'nullish_coalescing',
    pattern: /([a-zA-Z_$][a-zA-Z0-9_$.[\]]*)\s*\?\?\s*([^;,\n]+)/g,
    severity: 'HIGH' as const,
    description: 'Nullish coalescing operator ?? (may hide undefined/null)'
  },
  {
    name: 'logical_or_zero',
    pattern: /([a-zA-Z_$][a-zA-Z0-9_$.[\]]*)\s*\|\|\s*0\b/g,
    severity: 'HIGH' as const,
    description: 'Logical OR with zero fallback (hides falsy values)'
  },
  {
    name: 'logical_or_number',
    pattern: /([a-zA-Z_$][a-zA-Z0-9_$.[\]]*)\s*\|\|\s*([0-9]+\.?[0-9]*)\b/g,
    severity: 'HIGH' as const,
    description: 'Logical OR with numeric fallback'
  },
  {
    name: 'isnan_ternary',
    pattern: /isNaN\s*\(\s*([^)]+)\s*\)\s*\?\s*([^:]+)\s*:\s*\1/g,
    severity: 'CRITICAL' as const,
    description: 'isNaN ternary (masks NaN with fallback)'
  }
];

// Exceptions: Files/patterns where fallbacks are intentional
const EXCEPTION_PATTERNS = [
  /initialization\.ts$/, // Initialization files
  /\/lib\//, // UI library code (Next.js)
  /\.test\.ts$/, // Test files
  /\.spec\.ts$/, // Test files
  /compatibility/, // Compatibility layers
];

// Exception comments: If line has these comments, skip
const EXCEPTION_COMMENTS = [
  'INTENTIONAL FALLBACK',
  'UI DISPLAY ONLY',
  'INITIALIZATION',
  'COMPATIBILITY LAYER',
  'TEST ONLY'
];

// Special cases: Where ?? is actually correct (optional chaining results)
const SAFE_NULLISH_CONTEXTS = [
  /state\.\w+\?\.\w+\s*\?\?/, // Optional chaining fallback (state.foo?.bar ?? default)
  /\?\.\w+\s*\?\?/, // Any optional chaining
];

function isExceptionFile(filePath: string): boolean {
  return EXCEPTION_PATTERNS.some(pattern => pattern.test(filePath));
}

function isExceptionLine(line: string): boolean {
  return EXCEPTION_COMMENTS.some(comment => line.includes(comment));
}

function isSafeNullishContext(line: string): boolean {
  return SAFE_NULLISH_CONTEXTS.some(pattern => pattern.test(line));
}

function assessSeverity(
  file: string,
  line: string,
  patternName: string,
  baseSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  // Downgrade if in less critical areas
  if (file.includes('/types/')) return 'LOW'; // Type definitions
  if (file.includes('/utils/') && !file.includes('assertions')) return 'MEDIUM'; // Utility functions
  if (file.includes('test') || file.includes('scripts/')) return 'LOW'; // Tests/scripts

  // Upgrade if in calculation context
  if (line.includes('calculate') || line.includes('compute') || line.includes('rate')) {
    return 'CRITICAL';
  }

  // Safe nullish coalescing patterns (optional chaining)
  if (patternName === 'nullish_coalescing' && isSafeNullishContext(line)) {
    return 'LOW';
  }

  return baseSeverity;
}

async function scanFile(filePath: string): Promise<FallbackOccurrence[]> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const occurrences: FallbackOccurrence[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Skip exception lines
    if (isExceptionLine(line)) continue;

    // Check each pattern
    for (const { name, pattern, severity: baseSeverity, description } of FALLBACK_PATTERNS) {
      const regex = new RegExp(pattern);
      let match;

      while ((match = regex.exec(line)) !== null) {
        const column = match.index + 1;
        const context = line.trim();
        const actualSeverity = assessSeverity(filePath, line, name, baseSeverity);

        occurrences.push({
          file: filePath,
          line: lineNumber,
          column,
          pattern: name,
          context,
          severity: actualSeverity,
          reason: description
        });
      }
    }
  }

  return occurrences;
}

function getAllTsFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('dist')) {
        getAllTsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  }

  return fileList;
}

async function scanDirectory(dirPath: string): Promise<FallbackOccurrence[]> {
  const files = getAllTsFiles(dirPath);
  let allOccurrences: FallbackOccurrence[] = [];

  for (const file of files) {
    if (isExceptionFile(file)) continue;

    const occurrences = await scanFile(file);
    allOccurrences = allOccurrences.concat(occurrences);
  }

  return allOccurrences;
}

function groupBySeverity(occurrences: FallbackOccurrence[]): Record<string, FallbackOccurrence[]> {
  return {
    CRITICAL: occurrences.filter(o => o.severity === 'CRITICAL'),
    HIGH: occurrences.filter(o => o.severity === 'HIGH'),
    MEDIUM: occurrences.filter(o => o.severity === 'MEDIUM'),
    LOW: occurrences.filter(o => o.severity === 'LOW')
  };
}

function printReport(occurrences: FallbackOccurrence[]) {
  console.log('\n=== Silent Fallback Pattern Audit ===\n');
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`Total occurrences: ${occurrences.length}\n`);

  const grouped = groupBySeverity(occurrences);

  // Print summary
  console.log('Summary by Severity:');
  console.log(`  CRITICAL: ${grouped.CRITICAL.length}`);
  console.log(`  HIGH:     ${grouped.HIGH.length}`);
  console.log(`  MEDIUM:   ${grouped.MEDIUM.length}`);
  console.log(`  LOW:      ${grouped.LOW.length}`);
  console.log('');

  // Print CRITICAL and HIGH in detail
  for (const severity of ['CRITICAL', 'HIGH'] as const) {
    const items = grouped[severity];
    if (items.length === 0) continue;

    console.log(`\n### ${severity} Priority (${items.length} occurrences)\n`);

    // Group by file
    const byFile = items.reduce((acc, item) => {
      if (!acc[item.file]) acc[item.file] = [];
      acc[item.file].push(item);
      return acc;
    }, {} as Record<string, FallbackOccurrence[]>);

    for (const [file, fileItems] of Object.entries(byFile)) {
      console.log(`\n${file}`);
      for (const item of fileItems) {
        console.log(`  Line ${item.line}:${item.column} [${item.pattern}]`);
        console.log(`    ${item.context}`);
        console.log(`    Reason: ${item.reason}`);
      }
    }
  }

  // Print MEDIUM and LOW summary only
  for (const severity of ['MEDIUM', 'LOW'] as const) {
    const items = grouped[severity];
    if (items.length === 0) continue;

    console.log(`\n### ${severity} Priority (${items.length} occurrences)\n`);
    console.log('(Use --verbose flag to see details)\n');

    // Show just file counts
    const byFile = items.reduce((acc, item) => {
      if (!acc[item.file]) acc[item.file] = 0;
      acc[item.file]++;
      return acc;
    }, {} as Record<string, number>);

    for (const [file, count] of Object.entries(byFile)) {
      console.log(`  ${file}: ${count}`);
    }
  }

  // Recommendations
  console.log('\n=== Recommendations ===\n');

  if (grouped.CRITICAL.length > 0) {
    console.log('❌ CRITICAL: Fix immediately - these patterns mask NaN and hide bugs');
    console.log('   Replace with assertion utilities from src/simulation/utils/assertions.ts\n');
  }

  if (grouped.HIGH.length > 0) {
    console.log('⚠️ HIGH: Review carefully - may hide undefined/null errors');
    console.log('   Use assertStateProperty() for state access, assertFinite() for calculations\n');
  }

  if (grouped.MEDIUM.length > 0) {
    console.log('🟡 MEDIUM: Review when possible - defensive patterns in lower-risk areas\n');
  }

  console.log('See CLAUDE.md "NaN and Invalid Value Handling" for patterns to use instead.\n');
}

// Main
async function main() {
  const simulationDir = path.join(process.cwd(), 'src/simulation');

  console.log('Scanning simulation directory for silent fallback patterns...');
  console.log(`Directory: ${simulationDir}\n`);

  const occurrences = await scanDirectory(simulationDir);

  printReport(occurrences);

  // Exit code based on severity
  const grouped = groupBySeverity(occurrences);
  if (grouped.CRITICAL.length > 0) {
    console.log('\n❌ AUDIT FAILED: CRITICAL patterns found');
    process.exit(1);
  } else if (grouped.HIGH.length > 10) { // Allow some HIGH for gradual migration
    console.log('\n⚠️ AUDIT WARNING: >10 HIGH priority patterns found');
    process.exit(0); // Don't block, but warn
  } else {
    console.log('\n✅ AUDIT PASSED: No CRITICAL patterns, acceptable HIGH count');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Error running audit:', err);
  process.exit(1);
});

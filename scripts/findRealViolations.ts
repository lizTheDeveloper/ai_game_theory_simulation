/**
 * Find REAL defensive fallback violations (excluding legitimate uses)
 *
 * LEGITIMATE uses (keep these):
 * - Map.get(key) ?? defaultValue
 * - config.optionalParam ?? defaultValue (in constructors)
 * - Lazy initialization with explicit comment
 * - Accumulator initialization (firstValue ?? 0 where accumulation happens)
 * - Polymorphic data (checking multiple optional fields for compatibility)
 *
 * VIOLATIONS (must fix):
 * - state.requiredProperty ?? fallback (masking missing state)
 * - (calculation result) ?? fallback (hiding NaN/undefined bugs)
 * - assertFinite(value ?? fallback, ...) (anti-pattern - assertion never triggers)
 */

import fs from 'fs';

interface RealViolation {
  file: string;
  line: number;
  code: string;
  reason: string;
}

function scanFile(filePath: string): RealViolation[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations: RealViolation[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    const prevLine = i > 0 ? lines[i - 1] : '';

    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;

    // VIOLATION 1: Assertions wrapping fallbacks (HIGH PRIORITY)
    if (line.includes('assertFinite') && line.includes('??')) {
      // Check if it's a legitimate initialization (has comment saying so)
      if (prevLine.includes('initialization context') || prevLine.includes('valid use of ??')) {
        continue;  // Legitimate
      }
      violations.push({
        file: filePath,
        line: lineNum,
        code: line.trim(),
        reason: 'ANTI-PATTERN: assertFinite wraps fallback (assertion never triggers)'
      });
      continue;
    }

    if (line.includes('assertStateProperty') && line.includes('??')) {
      violations.push({
        file: filePath,
        line: lineNum,
        code: line.trim(),
        reason: 'ANTI-PATTERN: assertStateProperty wraps fallback'
      });
      continue;
    }

    // Skip legitimate patterns
    if (line.includes('Map') && line.includes('.get(') && line.includes('??')) continue;
    if (line.includes('config.') && line.includes('??')) continue;
    if (line.match(/constructor\s*\(/)) continue;  // In constructor
    if (prevLine.includes('Lazy initialization') || prevLine.includes('accumulator')) continue;

    // VIOLATION 2: State access with fallback in calculations
    // Pattern: state.system.property ?? fallback (NOT in assignment/initialization)
    if (line.match(/state\.\w+\.\w+\s*\?\?/) && !line.includes('=') && !line.includes(':')) {
      // This is reading state with fallback in a calculation
      violations.push({
        file: filePath,
        line: lineNum,
        code: line.trim(),
        reason: 'State access with fallback in calculation (should use assertStateProperty)'
      });
      continue;
    }

    // VIOLATION 3: Calculation result with fallback
    // Pattern: (complex expression) ?? fallback
    if (line.includes('??') && line.match(/\([^)]+[\+\-\*\/][^)]+\)\s*\?\?/)) {
      violations.push({
        file: filePath,
        line: lineNum,
        code: line.trim(),
        reason: 'Calculation result with fallback (hiding potential NaN)'
      });
    }
  }

  return violations;
}

function getAllTsFiles(dir: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = `${dir}/${item}`;
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getAllTsFiles(fullPath));
    } else if (item.endsWith('.ts') && !item.endsWith('.test.ts') && !item.endsWith('.spec.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

async function main() {
  console.log('🔍 Finding REAL defensive fallback violations...\n');

  const files = getAllTsFiles('src/simulation');
  let allViolations: RealViolation[] = [];

  for (const file of files) {
    const violations = scanFile(file);
    allViolations = allViolations.concat(violations);
  }

  console.log(`=== REAL VIOLATIONS FOUND: ${allViolations.length} ===\n`);

  // Group by reason
  const byReason: Record<string, RealViolation[]> = {};
  allViolations.forEach(v => {
    if (!byReason[v.reason]) byReason[v.reason] = [];
    byReason[v.reason].push(v);
  });

  Object.entries(byReason).forEach(([reason, violations]) => {
    console.log(`\n=== ${reason} (${violations.length}) ===\n`);
    violations.forEach(v => {
      console.log(`${v.file}:${v.line}`);
      console.log(`  ${v.code}`);
      console.log();
    });
  });

  // Save to file
  fs.writeFileSync(
    'logs/real_violations.json',
    JSON.stringify(allViolations, null, 2)
  );

  console.log(`\n✅ Scan complete. ${allViolations.length} real violations found.`);
  console.log('   Results saved to logs/real_violations.json');
}

main();

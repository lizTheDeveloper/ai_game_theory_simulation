/**
 * Scan for defensive fallback violations
 *
 * LEGITIMATE uses of ?? (keep these):
 * - Initialization: creating new state objects
 * - Map.get() operations: myMap.get(key) ?? 0
 * - External compatibility: interfacing with libraries
 * - UI display code (not in src/simulation)
 *
 * VIOLATIONS (must fix):
 * - state.property ?? fallback (reading simulation state)
 * - calculatedValue ?? fallback (calculation results)
 * - isNaN(x) ? fallback : x (silent NaN handling)
 * - Assertions wrapping fallbacks: assertFinite(x ?? 0.5, ...)
 */

import fs from 'fs';
import path from 'path';

interface Violation {
  file: string;
  line: number;
  pattern: string;
  code: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

async function scanFile(filePath: string): Promise<Violation[]> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations: Violation[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;

    // HIGH: Assertions wrapping fallbacks (anti-pattern)
    if (line.includes('assertFinite') && line.includes('??')) {
      violations.push({
        file: filePath,
        line: lineNum,
        pattern: 'assertion-wrapping-fallback',
        code: line.trim(),
        severity: 'HIGH'
      });
      continue;
    }

    // HIGH: isNaN with fallback
    if (/isNaN\([^)]+\)\s*\?/.test(line)) {
      violations.push({
        file: filePath,
        line: lineNum,
        pattern: 'isNaN-with-fallback',
        code: line.trim(),
        severity: 'HIGH'
      });
      continue;
    }

    // MEDIUM: State property access with fallback
    if (/state\.[a-zA-Z_]+[^=]*\?\?/.test(line) && !line.includes('Map.get')) {
      // Exclude initialization patterns
      if (line.includes('=') && !line.includes('const') && !line.includes('let')) {
        // This is assignment, likely initialization
        continue;
      }
      violations.push({
        file: filePath,
        line: lineNum,
        pattern: 'state-access-fallback',
        code: line.trim(),
        severity: 'MEDIUM'
      });
      continue;
    }

    // LOW: Map operations (often legitimate)
    if (line.includes('.get(') && line.includes('??')) {
      violations.push({
        file: filePath,
        line: lineNum,
        pattern: 'map-get-fallback',
        code: line.trim(),
        severity: 'LOW'
      });
      continue;
    }

    // MEDIUM: General ?? in calculations
    if (line.includes('??') && !line.includes('Map') && !line.includes('//')) {
      violations.push({
        file: filePath,
        line: lineNum,
        pattern: 'generic-fallback',
        code: line.trim(),
        severity: 'MEDIUM'
      });
    }
  }

  return violations;
}

function getAllTsFiles(dir: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
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
  console.log('🔍 Scanning src/simulation for defensive fallback violations...\n');

  const files = getAllTsFiles('src/simulation');

  let allViolations: Violation[] = [];

  for (const file of files) {
    const violations = await scanFile(file);
    allViolations = allViolations.concat(violations);
  }

  // Group by severity
  const high = allViolations.filter(v => v.severity === 'HIGH');
  const medium = allViolations.filter(v => v.severity === 'MEDIUM');
  const low = allViolations.filter(v => v.severity === 'LOW');

  console.log('=== SCAN RESULTS ===\n');
  console.log(`HIGH priority violations: ${high.length}`);
  console.log(`MEDIUM priority violations: ${medium.length}`);
  console.log(`LOW priority violations (often legitimate): ${low.length}`);
  console.log(`\nTotal potential violations: ${allViolations.length}\n`);

  // Output HIGH severity first
  if (high.length > 0) {
    console.log('\n=== HIGH PRIORITY (Anti-Patterns) ===\n');
    high.forEach(v => {
      console.log(`${v.file}:${v.line}`);
      console.log(`  Pattern: ${v.pattern}`);
      console.log(`  Code: ${v.code}`);
      console.log();
    });
  }

  // Output MEDIUM severity
  if (medium.length > 0) {
    console.log('\n=== MEDIUM PRIORITY (State Access) ===\n');
    const byFile = medium.reduce((acc, v) => {
      acc[v.file] = (acc[v.file] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(byFile)
      .sort((a, b) => b[1] - a[1])
      .forEach(([file, count]) => {
        console.log(`${file}: ${count} violations`);
      });
  }

  // Save to file for reference
  fs.writeFileSync(
    'logs/defensive_fallback_scan.json',
    JSON.stringify({ high, medium, low }, null, 2)
  );

  console.log('\n✅ Scan complete. Results saved to logs/defensive_fallback_scan.json');
}

main();

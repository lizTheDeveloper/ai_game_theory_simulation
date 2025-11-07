#!/usr/bin/env tsx

/**
 * Automated fix script for DANGEROUS defensive fallbacks
 *
 * CRITICAL-4: Replace silent ?? fallbacks with assertion utilities
 *
 * Strategy:
 * 1. Read all DANGEROUS instances from audit JSON
 * 2. For each instance, generate the fix:
 *    - Replace `state.x?.y ?? default` with `assertStateProperty(state.x, 'y', context)`
 *    - Add import for assertion utility if not present
 * 3. Preserve file structure, comments, formatting
 * 4. Emit patch files for review before applying
 */

import * as fs from 'fs';
import * as path from 'path';

interface FallbackInstance {
  file: string;
  line: number;
  code: string;
  category: 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS';
  reason: string;
}

interface Fix {
  file: string;
  line: number;
  original: string;
  replacement: string;
  needsImport: boolean;
}

// Common state property access patterns
const STATE_PROPERTY_PATTERN = /state\.(\w+(?:\.\w+)*)\?\.(\w+)\s*\?\?\s*(.+)/;
const STATE_NESTED_PATTERN = /state\.(\w+)\?\.(\w+)\?\.(\w+)\s*\?\?\s*(.+)/;

function generateFix(instance: FallbackInstance, fileContent: string): Fix | null {
  const { file, line, code } = instance;

  // Check if file already imports assertions
  const needsImport = !fileContent.includes('from \'./utils/assertions\'') &&
                      !fileContent.includes('from \'@/simulation/utils/assertions\'');

  // Try to match state property pattern
  const match = code.match(STATE_PROPERTY_PATTERN);
  if (!match) {
    console.log(`⚠️ Could not parse pattern in ${file}:${line}`);
    console.log(`   Code: ${code}`);
    return null;
  }

  const [, parentPath, property, defaultValue] = match;

  // Generate replacement
  const replacement = `assertStateProperty(state.${parentPath}, '${property}', {
    location: 'TODO_FUNCTION_NAME',
    month: state.currentMonth,
    additionalInfo: { /* TODO */ }
  })`;

  return {
    file,
    line,
    original: code.trim(),
    replacement: replacement.trim(),
    needsImport
  };
}

function main() {
  const auditFiles = fs.readdirSync('logs')
    .filter(f => f.startsWith('defensive_fallback_audit_'))
    .sort()
    .reverse();

  if (auditFiles.length === 0) {
    console.log('❌ No audit files found. Run scripts/auditDefensiveFallbacks.ts first.');
    process.exit(1);
  }

  const latestAudit = auditFiles[0];
  console.log(`📖 Reading audit: logs/${latestAudit}\n`);

  const auditData = JSON.parse(fs.readFileSync(`logs/${latestAudit}`, 'utf-8'));
  const dangerous = auditData.dangerous as FallbackInstance[];

  console.log(`🔧 Generating fixes for ${dangerous.length} DANGEROUS fallbacks...\n`);

  // Group by file
  const byFile = new Map<string, FallbackInstance[]>();
  for (const instance of dangerous) {
    if (!byFile.has(instance.file)) {
      byFile.set(instance.file, []);
    }
    byFile.get(instance.file)!.push(instance);
  }

  const fixes: Fix[] = [];

  for (const [file, instances] of byFile.entries()) {
    const content = fs.readFileSync(file, 'utf-8');

    for (const instance of instances) {
      const fix = generateFix(instance, content);
      if (fix) {
        fixes.push(fix);
      }
    }
  }

  console.log(`✅ Generated ${fixes.length} fixes\n`);

  // Save fix report
  const reportPath = `logs/dangerous_fallback_fixes_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalFixes: fixes.length,
    filesCovered: byFile.size,
    fixes: fixes.map(f => ({
      file: f.file,
      line: f.line,
      original: f.original,
      replacement: f.replacement,
      needsImport: f.needsImport
    }))
  }, null, 2));

  console.log(`📄 Fix report saved to: ${reportPath}`);
  console.log(`\n⚠️ MANUAL REVIEW REQUIRED:`);
  console.log(`   1. Review generated fixes in ${reportPath}`);
  console.log(`   2. Update TODO placeholders (function names, context)`);
  console.log(`   3. Apply fixes manually with proper context`);
  console.log(`   4. Run Monte Carlo N≥3 validation`);
}

main();

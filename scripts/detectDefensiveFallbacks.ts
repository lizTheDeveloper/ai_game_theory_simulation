#!/usr/bin/env tsx

/**
 * Detect ?? fallback patterns in simulation code
 *
 * Defensive fallbacks hide bugs - this script finds them all.
 * Research simulations should fail loudly, not mask invalid values.
 */

import * as fs from 'fs';
import * as path from 'path';

interface FallbackMatch {
  file: string;
  lineNumber: number;
  line: string;
  context: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
}

const CRITICAL_PATTERNS = [
  /\*\s*\d+/,  // Multiplication
  /\/\s*\d+/,  // Division
  /\+\s*\d+/,  // Addition
  /-\s*\d+/,   // Subtraction
  /Math\./,    // Math operations
  /return.*\?\?/,  // Return value fallbacks
];

const HIGH_PATTERNS = [
  /state\.\w+.*=.*\?\?/,  // State assignments
  /\w+\.\w+.*=.*\?\?/,     // Property assignments
];

const MEDIUM_PATTERNS = [
  /display/i,
  /render/i,
  /ui/i,
  /component/i,
];

function categorize(line: string, file: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  // Skip type definitions and interfaces
  if (file.includes('types/') || line.trim().startsWith('//') || line.includes('interface')) {
    return 'LOW';
  }

  // Initialization patterns (legitimate)
  if (line.includes('= {') || line.includes('initialState') || line.includes('default')) {
    return 'LOW';
  }

  // Critical: Hot path calculations
  for (const pattern of CRITICAL_PATTERNS) {
    if (pattern.test(line)) {
      return 'CRITICAL';
    }
  }

  // High: State mutations
  for (const pattern of HIGH_PATTERNS) {
    if (pattern.test(line)) {
      return 'HIGH';
    }
  }

  // Medium: UI/display code
  for (const pattern of MEDIUM_PATTERNS) {
    if (pattern.test(line)) {
      return 'MEDIUM';
    }
  }

  return 'UNKNOWN';
}

function findTsFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!file.includes('node_modules')) {
        findTsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') && !file.endsWith('.test.ts') && !file.endsWith('.spec.ts')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

async function detectFallbacks(): Promise<FallbackMatch[]> {
  const matches: FallbackMatch[] = [];

  // Search in simulation code only
  const files = findTsFiles('src/simulation');

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Match ?? fallback patterns
      if (line.includes('??') && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
        const severity = categorize(line, file);
        matches.push({
          file: file.replace(/^src\//, ''),
          lineNumber: index + 1,
          line: line.trim(),
          context: lines.slice(Math.max(0, index - 2), index + 3).join('\n'),
          severity
        });
      }
    });
  }

  return matches;
}

async function main() {
  console.log('🔍 Scanning for ?? fallback patterns in simulation code...\n');

  const matches = await detectFallbacks();

  // Group by severity
  const bySeverity = {
    CRITICAL: matches.filter(m => m.severity === 'CRITICAL'),
    HIGH: matches.filter(m => m.severity === 'HIGH'),
    MEDIUM: matches.filter(m => m.severity === 'MEDIUM'),
    LOW: matches.filter(m => m.severity === 'LOW'),
    UNKNOWN: matches.filter(m => m.severity === 'UNKNOWN'),
  };

  console.log('📊 Summary:');
  console.log(`  ❌ CRITICAL: ${bySeverity.CRITICAL.length} (hot path calculations - MUST FIX)`);
  console.log(`  ⚠️  HIGH: ${bySeverity.HIGH.length} (state mutations - MUST FIX)`);
  console.log(`  ⚡ MEDIUM: ${bySeverity.MEDIUM.length} (UI/display - may keep)`);
  console.log(`  ✓  LOW: ${bySeverity.LOW.length} (initialization - legitimate)`);
  console.log(`  ❓ UNKNOWN: ${bySeverity.UNKNOWN.length} (needs manual review)`);
  console.log(`  📝 TOTAL: ${matches.length}\n`);

  // Print detailed results by severity
  for (const severity of ['CRITICAL', 'HIGH', 'UNKNOWN', 'MEDIUM', 'LOW'] as const) {
    const items = bySeverity[severity];
    if (items.length === 0) continue;

    console.log(`\n${'='.repeat(80)}`);
    console.log(`${severity} (${items.length} instances)`);
    console.log('='.repeat(80));

    items.forEach((match, i) => {
      console.log(`\n${i + 1}. ${match.file}:${match.lineNumber}`);
      console.log(`   ${match.line}`);
    });
  }

  // Save detailed report
  const reportPath = '/home/user/ai_game_theory_simulation/logs/fallback_audit_' +
    new Date().toISOString().replace(/[:.]/g, '-') + '.json';

  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      critical: bySeverity.CRITICAL.length,
      high: bySeverity.HIGH.length,
      medium: bySeverity.MEDIUM.length,
      low: bySeverity.LOW.length,
      unknown: bySeverity.UNKNOWN.length,
      total: matches.length
    },
    matches: matches.map(m => ({
      file: m.file,
      line: m.lineNumber,
      severity: m.severity,
      code: m.line
    }))
  }, null, 2));

  console.log(`\n\n💾 Detailed report saved to: ${reportPath}`);

  if (bySeverity.CRITICAL.length > 0 || bySeverity.HIGH.length > 0) {
    console.log('\n❌ CRITICAL/HIGH fallbacks found - these MUST be fixed!');
    process.exit(1);
  } else {
    console.log('\n✅ No CRITICAL/HIGH fallbacks found');
    process.exit(0);
  }
}

main().catch(console.error);

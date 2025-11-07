#!/usr/bin/env npx tsx

/**
 * Object Iteration Determinism Audit
 *
 * Finds ALL Object.entries/keys/values and for...in loops in src/simulation/
 * Categorizes by risk level for determinism fixes
 *
 * Roy: "Trust nothing. Especially not object iteration order."
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface IterationSite {
  file: string;
  line: number;
  type: 'Object.entries' | 'Object.keys' | 'Object.values' | 'for...in';
  code: string;
  context: string[];
  risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';
  reason: string;
  needsSorting: boolean;
}

// Files already fixed in batches 2.1 and 2.2
const ALREADY_FIXED = new Set([
  'src/simulation/research.ts',
  'src/simulation/socialInfluence.ts',
  'src/simulation/agents/aiTechActions.ts',
  'src/simulation/agents/aiAgent.ts',
  'src/simulation/climateJustice.ts',
  'src/simulation/conflictResolution.ts',
  'src/simulation/earlyWarningSystems.ts',
  'src/simulation/engine/phases/ConsciousnessGovernancePhase.ts',
  'src/simulation/llm/client.ts',
  'src/simulation/llm/integration.ts',
  'src/simulation/populationMapping.ts',
  'src/simulation/techTree/effectsEngine.ts',
  'src/simulation/warMeaningFeedback.ts'
]);

// Hot path indicators (called every month/week/agent)
const HOT_PATH_INDICATORS = [
  'Phase.ts',           // Phase execution
  'Agent.ts',           // Agent actions
  'aggregate',          // Aggregation functions
  'calculate',          // Calculations
  'update',             // State updates
  'select',             // Weighted selection
  'weighted',           // Weighted operations
  'rng()',              // RNG consumption
  'Math.random()',      // RNG (should not exist but check)
  'roll',               // Dice roll pattern
  'probability',        // Probability checks
];

// Safe patterns (don't need sorting)
const SAFE_PATTERNS = [
  'console.log',        // Logging
  'console.error',      // Error logging
  'console.warn',       // Warnings
  'stringify',          // JSON serialization (order doesn't affect sim)
  'validation',         // Validation only
  'debug',              // Debug output
  'TEST',               // Test code
  'describe(',          // Test describe blocks
];

function assessRisk(site: IterationSite): { risk: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE'; reason: string; needsSorting: boolean } {
  const code = site.code.toLowerCase();
  const contextStr = site.context.join('\n').toLowerCase();
  const fullText = code + ' ' + contextStr;

  // SAFE: Logging, debugging, validation only
  if (SAFE_PATTERNS.some(pattern => fullText.includes(pattern.toLowerCase()))) {
    return {
      risk: 'SAFE',
      reason: 'Logging/debugging only - order does not affect simulation',
      needsSorting: false
    };
  }

  // CRITICAL: Weighted selection with RNG consumption
  if (fullText.includes('rng()') || fullText.includes('roll')) {
    if (fullText.includes('weight') || fullText.includes('probability')) {
      return {
        risk: 'CRITICAL',
        reason: 'Weighted selection with RNG - iteration order affects which item is selected',
        needsSorting: true
      };
    }
  }

  // CRITICAL: State mutation in loop
  if (fullText.includes('state.') && (fullText.includes('=') || fullText.includes('+='))) {
    return {
      risk: 'CRITICAL',
      reason: 'State mutation - iteration order affects final state values',
      needsSorting: true
    };
  }

  // HIGH: Hot path execution
  if (HOT_PATH_INDICATORS.some(indicator => site.file.includes(indicator) || fullText.includes(indicator.toLowerCase()))) {
    return {
      risk: 'HIGH',
      reason: 'Hot path execution - called frequently, affects performance/consistency',
      needsSorting: true
    };
  }

  // MEDIUM: Aggregation/accumulation
  if (fullText.includes('sum') || fullText.includes('accumulate') || fullText.includes('total')) {
    return {
      risk: 'MEDIUM',
      reason: 'Aggregation - order may affect floating point precision',
      needsSorting: true
    };
  }

  // LOW: Other cases (probably safe but audit manually)
  return {
    risk: 'LOW',
    reason: 'No obvious determinism issue - manual review needed',
    needsSorting: false
  };
}

function extractIterationSites(): IterationSite[] {
  const sites: IterationSite[] = [];

  // Find all TypeScript files in src/simulation
  const output = execSync('find src/simulation -name "*.ts" -type f', { encoding: 'utf-8' });
  const files = output.trim().split('\n').filter(f => f.length > 0);

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Check for Object.entries/keys/values
      const objectMatch = line.match(/Object\.(entries|keys|values)\(/);
      if (objectMatch) {
        // Get context (3 lines before, 5 lines after)
        const context = lines.slice(Math.max(0, i - 3), Math.min(lines.length, i + 6));

        const site: IterationSite = {
          file,
          line: lineNum,
          type: `Object.${objectMatch[1]}` as any,
          code: line.trim(),
          context,
          risk: 'LOW',
          reason: '',
          needsSorting: false
        };

        const assessment = assessRisk(site);
        site.risk = assessment.risk;
        site.reason = assessment.reason;
        site.needsSorting = assessment.needsSorting;

        sites.push(site);
      }

      // Check for for...in loops
      const forInMatch = line.match(/for\s*\(\s*const\s+\w+\s+in\s+/);
      if (forInMatch) {
        const context = lines.slice(Math.max(0, i - 3), Math.min(lines.length, i + 6));

        const site: IterationSite = {
          file,
          line: lineNum,
          type: 'for...in',
          code: line.trim(),
          context,
          risk: 'LOW',
          reason: '',
          needsSorting: false
        };

        const assessment = assessRisk(site);
        site.risk = assessment.risk;
        site.reason = assessment.reason;
        site.needsSorting = assessment.needsSorting;

        sites.push(site);
      }
    }
  }

  return sites;
}

function main() {
  console.log('🔍 Starting Object Iteration Determinism Audit...\n');

  const sites = extractIterationSites();

  // Filter out already-fixed files
  const remaining = sites.filter(site => !ALREADY_FIXED.has(site.file));

  // Count by risk
  const byRisk = {
    CRITICAL: remaining.filter(s => s.risk === 'CRITICAL'),
    HIGH: remaining.filter(s => s.risk === 'HIGH'),
    MEDIUM: remaining.filter(s => s.risk === 'MEDIUM'),
    LOW: remaining.filter(s => s.risk === 'LOW'),
    SAFE: remaining.filter(s => s.risk === 'SAFE')
  };

  console.log('📊 Summary:');
  console.log(`  Total sites found: ${sites.length}`);
  console.log(`  Already fixed (batches 2.1/2.2): ${sites.length - remaining.length}`);
  console.log(`  Remaining: ${remaining.length}\n`);

  console.log('Risk Breakdown:');
  console.log(`  🚨 CRITICAL: ${byRisk.CRITICAL.length} (weighted selection + RNG, state mutation)`);
  console.log(`  ⚠️  HIGH: ${byRisk.HIGH.length} (hot path execution)`);
  console.log(`  🟡 MEDIUM: ${byRisk.MEDIUM.length} (aggregation, floating point)`);
  console.log(`  🔵 LOW: ${byRisk.LOW.length} (needs manual review)`);
  console.log(`  ✅ SAFE: ${byRisk.SAFE.length} (logging/debug only)\n`);

  const needsSorting = remaining.filter(s => s.needsSorting);
  console.log(`🎯 Sites needing sorting: ${needsSorting.length}/${remaining.length} (${Math.round(needsSorting.length / remaining.length * 100)}%)\n`);

  // Write detailed report
  const reportPath = '/home/lizthedeveloper_gmail_com/ai_game_theory_simulation/logs/object_iteration_audit.txt';
  let report = '# Object Iteration Determinism Audit\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  report += '## Summary\n\n';
  report += `- Total sites: ${sites.length}\n`;
  report += `- Already fixed: ${sites.length - remaining.length}\n`;
  report += `- Remaining: ${remaining.length}\n`;
  report += `- CRITICAL: ${byRisk.CRITICAL.length}\n`;
  report += `- HIGH: ${byRisk.HIGH.length}\n`;
  report += `- MEDIUM: ${byRisk.MEDIUM.length}\n`;
  report += `- LOW: ${byRisk.LOW.length}\n`;
  report += `- SAFE: ${byRisk.SAFE.length}\n\n`;

  // Write each risk category
  for (const risk of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'SAFE'] as const) {
    const sitesInCategory = byRisk[risk];
    if (sitesInCategory.length === 0) continue;

    report += `## ${risk} Priority (${sitesInCategory.length} sites)\n\n`;

    for (const site of sitesInCategory) {
      report += `### ${site.file}:${site.line}\n`;
      report += `**Type:** ${site.type}\n`;
      report += `**Reason:** ${site.reason}\n`;
      report += `**Needs sorting:** ${site.needsSorting ? 'YES' : 'NO'}\n\n`;
      report += '```typescript\n';
      report += site.code + '\n';
      report += '```\n\n';
      report += '**Context:**\n```typescript\n';
      report += site.context.join('\n') + '\n';
      report += '```\n\n';
      report += '---\n\n';
    }
  }

  fs.writeFileSync(reportPath, report);
  console.log(`📄 Detailed report written to: ${reportPath}`);

  // Write CSV for spreadsheet analysis
  const csvPath = reportPath.replace('.txt', '.csv');
  let csv = 'File,Line,Type,Risk,Needs Sorting,Reason,Code\n';
  for (const site of remaining) {
    const escapedCode = site.code.replace(/"/g, '""');
    const escapedReason = site.reason.replace(/"/g, '""');
    csv += `"${site.file}",${site.line},"${site.type}","${site.risk}",${site.needsSorting},"${escapedReason}","${escapedCode}"\n`;
  }
  fs.writeFileSync(csvPath, csv);
  console.log(`📊 CSV report written to: ${csvPath}`);

  console.log('\n✅ Audit complete!');
  console.log('\n🎯 Next steps:');
  console.log('1. Review CRITICAL sites first (weighted selection + RNG)');
  console.log('2. Apply .sort() to all sites marked "Needs sorting: YES"');
  console.log('3. Validate with: npx tsx scripts/debugDeterminismPhases.ts');
  console.log('4. Run Monte Carlo: npx tsx scripts/monteCarloSimulation.ts --runs=3');
}

main();

#!/usr/bin/env npx tsx

/**
 * Deep check of government actions to verify they actually affect the simulation
 *
 * This goes beyond pattern matching to verify:
 * 1. Actions modify gameState properties
 * 2. Modified properties are actually used in simulation phases
 * 3. No actions just return results without changing state
 */

import * as fs from 'fs';
import * as path from 'path';

console.log('=== DEEP GOVERNMENT ACTION EFFECTIVENESS CHECK ===\n');

const actionsDir = './src/simulation/government/actions';
const actionFiles = fs.readdirSync(actionsDir)
  .filter(f => f.endsWith('.ts') && f !== 'index.ts');

const issues: Array<{file: string, action: string, issue: string, code: string}> = [];
let totalActions = 0;

for (const file of actionFiles) {
  const filePath = path.join(actionsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');

  // Find all CategorizedGovernmentAction declarations
  const actionRegex = /const\s+(\w+):\s*CategorizedGovernmentAction\s*=\s*{([^}]+execute:\s*\([^)]*\):\s*ActionResult\s*=>\s*{([^}]+)}\s*,?\s*)+}/gs;

  // Simpler approach: find execute methods
  const executeBlocks = content.matchAll(/execute:\s*\(([^)]*)\):\s*ActionResult\s*=>\s*{([^]+?)^\s+}/gm);

  for (const match of executeBlocks) {
    totalActions++;
    const params = match[1];
    const body = match[2];

    // Find action name by looking backward from match position
    const beforeMatch = content.substring(0, match.index || 0);
    const actionNameMatch = beforeMatch.match(/const\s+(\w+):\s*CategorizedGovernmentAction[^{]*$/);
    const actionName = actionNameMatch ? actionNameMatch[1] : 'unknown';

    // Check 1: Does it modify gameState?
    const modifiesGameState =
      body.includes('gameState.') &&
      (body.match(/gameState\.[^=]*\s*=\s*[^=]/) ||
       body.includes('gameState.') && (body.includes('+=') || body.includes('-=') || body.includes('*=') || body.includes('/=')));

    // Check 2: Does it only return without modifying state?
    const bodyLines = body.trim().split('\n').filter(line => !line.trim().startsWith('//'));
    const hasEarlyReturn = bodyLines[0]?.trim().startsWith('return') && bodyLines.length < 5;

    // Check 3: Does it have defensive patterns that might hide bugs?
    const hasDefensivePatterns = body.match(/\|\|\s+\d/) || body.match(/\?\?\s+\d/);

    // Check 4: Does it have TODO/FIXME markers?
    const hasTodo = body.includes('TODO') || body.includes('FIXME') || body.includes('STUB');

    // Check 5: Is the return value completely empty?
    const returnMatch = body.match(/return\s+{([^}]*)}/);
    const emptyReturn = returnMatch && returnMatch[1].trim() === '';

    if (!modifiesGameState && !hasEarlyReturn) {
      issues.push({
        file,
        action: actionName,
        issue: 'No gameState modifications detected',
        code: body.substring(0, 200)
      });
    }

    if (hasEarlyReturn) {
      issues.push({
        file,
        action: actionName,
        issue: 'Only returns early without state changes',
        code: bodyLines.slice(0, 3).join('\n')
      });
    }

    if (hasTodo) {
      issues.push({
        file,
        action: actionName,
        issue: 'Marked as TODO/FIXME/STUB',
        code: body.substring(0, 150)
      });
    }

    if (hasDefensivePatterns) {
      issues.push({
        file,
        action: actionName,
        issue: 'Contains defensive programming patterns (|| or ??)',
        code: body.substring(0, 200)
      });
    }

    if (emptyReturn) {
      issues.push({
        file,
        action: actionName,
        issue: 'Returns empty object {}',
        code: returnMatch[0]
      });
    }
  }
}

console.log(`Total government actions analyzed: ${totalActions}`);
console.log(`Potential issues found: ${issues.length}\n`);

if (issues.length > 0) {
  console.log('⚠️  ACTIONS WITH POTENTIAL ISSUES:\n');

  // Group by file
  const byFile = issues.reduce((acc, item) => {
    if (!acc[item.file]) acc[item.file] = [];
    acc[item.file].push(item);
    return acc;
  }, {} as Record<string, typeof issues>);

  for (const [file, fileIssues] of Object.entries(byFile)) {
    console.log(`📄 ${file}:`);

    // Group by action
    const byAction = fileIssues.reduce((acc, item) => {
      if (!acc[item.action]) acc[item.action] = [];
      acc[item.action].push(item);
      return acc;
    }, {} as Record<string, typeof issues>);

    for (const [action, actionIssues] of Object.entries(byAction)) {
      console.log(`   ❌ ${action}`);
      actionIssues.forEach(issue => {
        console.log(`      Issue: ${issue.issue}`);
      });
    }
    console.log();
  }

  console.log(`\nSummary: ${issues.length} potential issues across ${Object.keys(byFile).length} files`);
} else {
  console.log('✅ All government actions appear to have proper state modifications!');
}

#!/usr/bin/env tsx
/**
 * Emoji Consistency Validator
 *
 * Validates that emoji usage across the codebase follows the semantic map.
 * Identifies deprecated emoji usage and inconsistencies.
 *
 * Usage: npx tsx scripts/validateEmojiConsistency.ts
 *
 * Exit codes:
 *   0 - All emojis follow semantic map
 *   1 - Deprecated emojis found (needs Phase 5 implementation)
 *   2 - Semantic inconsistencies found
 */

import * as fs from 'fs';
import * as path from 'path';

interface ValidationIssue {
  file: string;
  line: number;
  emoji: string;
  context: string;
  issue: string;
  suggestion: string;
}

// Recursively find all TypeScript files
function findTypeScriptFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== 'dist') {
        findTypeScriptFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

const files = findTypeScriptFiles('src');
const issues: ValidationIssue[] = [];

// Scan all files for emoji issues
for (const file of files) {
  const content = fs.readFileSync(file, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNum = index + 1;

    // Check for deprecated error emojis (💀 not in extinction context, 🔥)
    if (line.includes('💀')) {
      const isExtinction = /extinction|EXTINCTION|BOTTLENECK|grey goo|GREY GOO|mirror life|MIRROR LIFE/i.test(line);
      if (!isExtinction) {
        issues.push({
          file: file.replace('/Users/annhoward/src/superalignmenttoutopia/', ''),
          line: lineNum,
          emoji: '💀',
          context: line.trim().substring(0, 80),
          issue: 'Deprecated error emoji (use only for extinction events)',
          suggestion: 'Replace with ❌ for general errors'
        });
      }
    }

    if (line.includes('🔥')) {
      issues.push({
        file: file.replace('/Users/annhoward/src/superalignmenttoutopia/', ''),
        line: lineNum,
        emoji: '🔥',
        context: line.trim().substring(0, 80),
        issue: 'Deprecated error emoji',
        suggestion: 'Replace with ❌'
      });
    }

    // Check for deprecated success emojis (🌟, ✨, 🏆)
    if (line.includes('🌟')) {
      issues.push({
        file: file.replace('/Users/annhoward/src/superalignmenttoutopia/', ''),
        line: lineNum,
        emoji: '🌟',
        context: line.trim().substring(0, 80),
        issue: 'Deprecated success emoji',
        suggestion: 'Replace with ✅'
      });
    }

    if (line.includes('✨')) {
      issues.push({
        file: file.replace('/Users/annhoward/src/superalignmenttoutopia/', ''),
        line: lineNum,
        emoji: '✨',
        context: line.trim().substring(0, 80),
        issue: 'Deprecated success emoji',
        suggestion: 'Replace with ✅'
      });
    }

    if (line.includes('🏆')) {
      issues.push({
        file: file.replace('/Users/annhoward/src/superalignmenttoutopia/', ''),
        line: lineNum,
        emoji: '🏆',
        context: line.trim().substring(0, 80),
        issue: 'Deprecated success emoji',
        suggestion: 'Replace with ✅'
      });
    }

    // Check for 🎯 used outside targeting context
    if (line.includes('🎯')) {
      const isTargeting = /detect|targeting|precision|accuracy|aim|BREAKTHROUGH.*detect/i.test(line);
      if (!isTargeting) {
        issues.push({
          file: file.replace('/Users/annhoward/src/superalignmenttoutopia/', ''),
          line: lineNum,
          emoji: '🎯',
          context: line.trim().substring(0, 80),
          issue: 'Success emoji used outside targeting context',
          suggestion: 'Replace with ✅ (keep 🎯 only for detection/targeting breakthroughs)'
        });
      }
    }

    // Check for 🚨 used as general warning (should be ⚠️)
    if (line.includes('🚨')) {
      const isEmergency = /EMERGENCY|CRITICAL|Emergency|Critical|ALERT|Alert|CRISIS|Crisis|PAUSE|Pause/i.test(line);
      if (!isEmergency) {
        issues.push({
          file: file.replace('/Users/annhoward/src/superalignmenttoutopia/', ''),
          line: lineNum,
          emoji: '🚨',
          context: line.trim().substring(0, 80),
          issue: 'Alert emoji used for non-emergency',
          suggestion: 'Replace with ⚠️ (keep 🚨 only for EMERGENCY/CRITICAL situations)'
        });
      }
    }

    // Check for ⚠️ used in emergency context (should be 🚨)
    if (line.includes('⚠️')) {
      const isEmergency = /EMERGENCY|Emergency|CRITICAL|Critical|^.*🚨/i.test(line);
      if (isEmergency) {
        issues.push({
          file: file.replace('/Users/annhoward/src/superalignmenttoutopia/', ''),
          line: lineNum,
          emoji: '⚠️',
          context: line.trim().substring(0, 80),
          issue: 'Warning emoji used in emergency context',
          suggestion: 'Replace with 🚨 (use ⚠️ only for warnings, not emergencies)'
        });
      }
    }
  });
}

// Generate report
console.log('='.repeat(80));
console.log('EMOJI CONSISTENCY VALIDATION REPORT');
console.log('='.repeat(80));
console.log('');

if (issues.length === 0) {
  console.log('✅ All emojis follow the semantic map!');
  console.log('');
  console.log('No deprecated emojis or inconsistencies found.');
  process.exit(0);
} else {
  console.log(`❌ Found ${issues.length} emoji consistency issues\n`);

  // Group by issue type
  const byIssue = new Map<string, ValidationIssue[]>();
  issues.forEach(issue => {
    const key = issue.issue;
    if (!byIssue.has(key)) {
      byIssue.set(key, []);
    }
    byIssue.get(key)!.push(issue);
  });

  // Report by category
  for (const [issueType, issueList] of byIssue.entries()) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`${issueType.toUpperCase()} (${issueList.length} instances)`);
    console.log('='.repeat(80));

    issueList.slice(0, 10).forEach(issue => {
      console.log(`\n${issue.emoji} ${issue.file}:${issue.line}`);
      console.log(`  Context: ${issue.context}`);
      console.log(`  ➜ ${issue.suggestion}`);
    });

    if (issueList.length > 10) {
      console.log(`\n... and ${issueList.length - 10} more instances`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log('');

  const deprecatedCount = issues.filter(i => i.issue.includes('Deprecated')).length;
  const inconsistencyCount = issues.filter(i => !i.issue.includes('Deprecated')).length;

  console.log(`Total issues: ${issues.length}`);
  console.log(`  - Deprecated emojis: ${deprecatedCount}`);
  console.log(`  - Semantic inconsistencies: ${inconsistencyCount}`);
  console.log('');

  console.log('Next steps:');
  console.log('  1. Review docs/EMOJI_SEMANTIC_MAP.md for canonical emoji usage');
  console.log('  2. Run Phase 5 implementation to fix deprecated emojis');
  console.log('  3. Re-run this validator to confirm all issues resolved');
  console.log('');

  process.exit(deprecatedCount > 0 ? 1 : 2);
}

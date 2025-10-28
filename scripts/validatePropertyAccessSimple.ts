/**
 * Validate Property Access - Simplified Approach
 *
 * Finds references to non-existent properties by pattern matching
 * against known correct patterns. Focuses on common mistakes.
 */

import * as fs from 'fs';
import * as path from 'path';

interface Issue {
  file: string;
  line: number;
  pattern: string;
  suggestion: string;
  context: string;
}

const issues: Issue[] = [];

// Known incorrect patterns and their corrections
const incorrectPatterns: Array<{
  pattern: RegExp;
  suggestion: string;
  description: string;
}> = [
  {
    pattern: /state\.resources\.(\w+)/g,
    suggestion: 'state.resourceEconomy.$1',
    description: 'resources should be resourceEconomy'
  },
  {
    pattern: /gameState\.resources\.(\w+)/g,
    suggestion: 'gameState.resourceEconomy.$1',
    description: 'resources should be resourceEconomy'
  },
  {
    pattern: /state\.ai\.(\w+)/g,
    suggestion: 'state.aiAgents or specific agent',
    description: 'ai is not a property, use aiAgents array'
  },
  {
    pattern: /state\.climate\.temperature(?!Anomaly)/g,
    suggestion: 'state.climate.temperatureAnomaly',
    description: 'temperature should be temperatureAnomaly'
  },
];

// Find semantic duplicates - properties that are suspiciously similar
const duplicatePatterns: Array<{
  pattern1: RegExp;
  pattern2: RegExp;
  description: string;
}> = [
  {
    pattern1: /(\w+)\.trust(?:Level)?(?!\w)/g,
    pattern2: /(\w+)\.(\w+)?trust(?:Level)?/g,
    description: 'Possible duplicate trust properties'
  },
  {
    pattern1: /(\w+)\.capability(?:Level)?/g,
    pattern2: /(\w+)\.(\w+)?capability/g,
    description: 'Possible duplicate capability properties'
  },
];

function findTsFiles(dir: string, exclude: string[] = []): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    if (exclude.includes(item)) continue;
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findTsFiles(fullPath, exclude));
    } else if (item.endsWith('.ts') && !item.endsWith('.test.ts') && !item.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

function scanFileForPatterns(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const fileName = path.basename(filePath, '.ts');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check incorrect patterns
    for (const { pattern, suggestion, description } of incorrectPatterns) {
      const matches = line.matchAll(new RegExp(pattern));
      for (const match of matches) {
        const actualSuggestion = suggestion.replace('$1', match[1] || '');
        issues.push({
          file: fileName,
          line: i + 1,
          pattern: match[0],
          suggestion: actualSuggestion,
          context: line.trim()
        });
      }
    }
  }
}

console.log('🔍 Validating property access patterns...\n');

const simulationDir = path.join(__dirname, '../src/simulation');
const files = findTsFiles(simulationDir, ['node_modules']);

console.log(`Scanning ${files.length} files...\n`);

for (const file of files) {
  scanFileForPatterns(file);
}

console.log(`Found ${issues.length} potential issues\n`);

// Group by pattern
const byPattern = new Map<string, Issue[]>();
for (const issue of issues) {
  const key = issue.pattern;
  if (!byPattern.has(key)) {
    byPattern.set(key, []);
  }
  byPattern.get(key)!.push(issue);
}

// Report
let report = '# Property Access Issues\n\n';
report += `**Scanned**: ${files.length} files\n`;
report += `**Issues found**: ${issues.length}\n\n`;

if (issues.length === 0) {
  report += '✅ No known incorrect patterns found!\n';
} else {
  report += '## Issues by Pattern\n\n';

  for (const [pattern, patternIssues] of byPattern.entries()) {
    report += `### \`${pattern}\` (${patternIssues.length} occurrences)\n\n`;
    report += `**Suggestion**: ${patternIssues[0].suggestion}\n\n`;

    const byFile = new Map<string, Issue[]>();
    for (const issue of patternIssues) {
      if (!byFile.has(issue.file)) {
        byFile.set(issue.file, []);
      }
      byFile.get(issue.file)!.push(issue);
    }

    for (const [file, fileIssues] of byFile.entries()) {
      report += `**${file}**: Lines ${fileIssues.map(i => i.line).join(', ')}\n`;
      if (fileIssues.length <= 3) {
        for (const issue of fileIssues) {
          report += `  - Line ${issue.line}: \`${issue.context.substring(0, 80)}\`\n`;
        }
      }
      report += '\n';
    }
  }
}

fs.writeFileSync(
  path.join(__dirname, '../docs/property-access-issues.md'),
  report
);

console.log('✅ Done! Report: docs/property-access-issues.md\n');

if (issues.length > 0) {
  console.log('Top issues:');
  const topPatterns = Array.from(byPattern.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5);

  for (const [pattern, patternIssues] of topPatterns) {
    console.log(`  ${pattern}: ${patternIssues.length} occurrences`);
  }
  console.log();
}

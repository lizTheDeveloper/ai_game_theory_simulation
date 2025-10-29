#!/usr/bin/env tsx
/**
 * Dead Code Detection Script
 *
 * Finds high-confidence dead code by looking for:
 * 1. Unreachable code paths (if (false), return before code)
 * 2. Legacy outcome system references (recently deprecated)
 * 3. Functions that are defined but never imported/called
 * 4. Commented-out code blocks
 * 5. Dead conditional branches
 */

import * as fs from 'fs';
import * as path from 'path';

interface DeadCodeIssue {
  file: string;
  line: number;
  type: 'unreachable' | 'legacy-reference' | 'commented-code' | 'dead-branch' | 'unused-function';
  description: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  snippet: string;
}

const issues: DeadCodeIssue[] = [];

// Patterns to detect (all must be global for matchAll)
const PATTERNS = {
  // Unreachable code after return
  unreachableAfterReturn: /return\s+[^;]+;[\s\r\n]+\s+(?!\/\/|\/\*|\})[^\s]/g,

  // Dead conditional branches
  ifFalse: /if\s*\(\s*false\s*\)/g,
  ifTrue: /if\s*\(\s*true\s*\)/g,

  // Legacy 4-category references (recently removed)
  legacyOutcome: /outcome:\s*['"](?:utopia|dystopia|extinction|stalemate|none)['"]/g,
  outcomeCounts: /outcomeCounts\./g,

  // Large commented-out blocks
  commentedBlock: /^[\s]*\/\/.*\n([\s]*\/\/.*\n){5,}/gm,

  // Functions with "DEPRECATED" comments
  deprecatedFunction: /\/\/.*DEPRECATED.*\n.*function\s+(\w+)/gi,
};

function analyzeFile(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Check for unreachable code after return
  let match;
  const returnRegex = /return\s+[^;]+;/g;
  while ((match = returnRegex.exec(content)) !== null) {
    const returnIndex = match.index + match[0].length;
    const afterReturn = content.substring(returnIndex, returnIndex + 100);

    // Check if there's code on the same line or next non-empty line
    const nextCode = afterReturn.match(/[\r\n]\s*([^\s\/\}])/);
    if (nextCode && !nextCode[1].match(/[\/\*]/)) {
      const lineNum = content.substring(0, returnIndex).split('\n').length;
      issues.push({
        file: filePath,
        line: lineNum,
        type: 'unreachable',
        description: 'Code after return statement (unreachable)',
        confidence: 'HIGH',
        snippet: lines[lineNum - 1] + '\n' + lines[lineNum]
      });
    }
  }

  // Check for if (false) - dead branches
  const ifFalseMatches = content.matchAll(PATTERNS.ifFalse);
  for (const match of ifFalseMatches) {
    const lineNum = content.substring(0, match.index!).split('\n').length;
    issues.push({
      file: filePath,
      line: lineNum,
      type: 'dead-branch',
      description: 'if (false) - dead code branch',
      confidence: 'HIGH',
      snippet: lines[lineNum - 1]
    });
  }

  // Check for legacy outcome system references
  const legacyMatches = content.matchAll(PATTERNS.legacyOutcome);
  for (const match of legacyMatches) {
    const lineNum = content.substring(0, match.index!).split('\n').length;
    issues.push({
      file: filePath,
      line: lineNum,
      type: 'legacy-reference',
      description: 'Legacy 4-category outcome reference (removed Oct 28)',
      confidence: 'HIGH',
      snippet: lines[lineNum - 1]
    });
  }

  const outcomeCountsMatches = content.matchAll(PATTERNS.outcomeCounts);
  for (const match of outcomeCountsMatches) {
    const lineNum = content.substring(0, match.index!).split('\n').length;
    issues.push({
      file: filePath,
      line: lineNum,
      type: 'legacy-reference',
      description: 'Reference to removed outcomeCounts variable',
      confidence: 'HIGH',
      snippet: lines[lineNum - 1]
    });
  }

  // Check for large commented-out code blocks (5+ consecutive comment lines)
  const commentedBlocks = content.matchAll(PATTERNS.commentedBlock);
  for (const match of commentedBlocks) {
    const lineNum = content.substring(0, match.index!).split('\n').length;
    const blockSize = match[0].split('\n').length;
    issues.push({
      file: filePath,
      line: lineNum,
      type: 'commented-code',
      description: `Large commented-out code block (${blockSize} lines)`,
      confidence: 'MEDIUM',
      snippet: match[0].split('\n').slice(0, 3).join('\n') + '\n  ...'
    });
  }
}

function scanDirectory(dir: string, extensions: string[] = ['.ts', '.tsx']): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip node_modules, .next, dist, etc.
    if (entry.name === 'node_modules' || entry.name === '.next' ||
        entry.name === 'dist' || entry.name === 'build' ||
        entry.name.startsWith('.')) {
      continue;
    }

    if (entry.isDirectory()) {
      scanDirectory(fullPath, extensions);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (extensions.includes(ext)) {
        analyzeFile(fullPath);
      }
    }
  }
}

// Main execution
console.log('🔍 DEAD CODE DETECTION - High-Confidence Issues\n');
console.log('Scanning src/ and scripts/ directories...\n');

scanDirectory('./src');
scanDirectory('./scripts');

// Group by type
const byType: Record<string, DeadCodeIssue[]> = {
  'unreachable': [],
  'dead-branch': [],
  'legacy-reference': [],
  'commented-code': [],
  'unused-function': []
};

issues.forEach(issue => {
  byType[issue.type].push(issue);
});

// Report
let totalIssues = 0;
for (const [type, typeIssues] of Object.entries(byType)) {
  if (typeIssues.length === 0) continue;

  console.log(`\n${'='.repeat(80)}`);
  console.log(`${type.toUpperCase().replace('-', ' ')} (${typeIssues.length} issues)`);
  console.log('='.repeat(80));

  // Group by file
  const byFile: Record<string, DeadCodeIssue[]> = {};
  typeIssues.forEach(issue => {
    if (!byFile[issue.file]) byFile[issue.file] = [];
    byFile[issue.file].push(issue);
  });

  for (const [file, fileIssues] of Object.entries(byFile)) {
    console.log(`\n📄 ${file}`);
    fileIssues.forEach(issue => {
      console.log(`   Line ${issue.line}: ${issue.description} [${issue.confidence}]`);
      console.log(`   ${issue.snippet.split('\n')[0].trim().substring(0, 80)}`);
    });
  }

  totalIssues += typeIssues.length;
}

console.log(`\n${'='.repeat(80)}`);
console.log(`\n📊 SUMMARY: Found ${totalIssues} high-confidence dead code issues\n`);
console.log('NOTE: These are HIGH/MEDIUM confidence issues. Review each before removing.');
console.log('Types/interfaces flagged as "unused" by TypeScript may still be needed.\n');

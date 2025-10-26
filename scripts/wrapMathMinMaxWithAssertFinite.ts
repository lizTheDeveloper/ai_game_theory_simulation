#!/usr/bin/env npx tsx

/**
 * Wrap ALL Math.min() and Math.max() results with assertFinite
 * This catches NaN at every calculation point
 */

import * as fs from 'fs';

const filePath = './src/simulation/techTree/effectsEngine.ts';
let content = fs.readFileSync(filePath, 'utf-8');

let replacements = 0;

// Pattern: assignment = Math.min(...) or Math.max(...)
// Match multiline patterns by reading the whole file

// Strategy: Find "= Math.min(" or "= Math.max(" and wrap the whole Math call

function wrapMathCalls(content: string): string {
  let result = content;
  let currentCase = '';

  // Track current case for better error messages
  const lines = content.split('\n');
  const caseLines: Record<number, string> = {};

  lines.forEach((line, idx) => {
    const match = line.match(/case '(\w+)':/);
    if (match) {
      currentCase = match[1];
    }
    caseLines[idx] = currentCase;
  });

  // Pattern: = Math.min( or = Math.max(
  // We need to find the matching closing paren

  const regex = /=\s*(Math\.(min|max)\s*\()/g;
  let match;
  const replacements: Array<{start: number, end: number, original: string, replacement: string}> = [];

  while ((match = regex.exec(content)) !== null) {
    const startIdx = match.index;
    const mathStart = match.index + match[0].indexOf('Math');

    // Find matching closing paren
    let parenCount = 0;
    let i = mathStart + 'Math.min('.length;
    let foundEnd = false;

    while (i < content.length) {
      if (content[i] === '(') parenCount++;
      if (content[i] === ')') {
        if (parenCount === 0) {
          foundEnd = true;
          break;
        }
        parenCount--;
      }
      i++;
    }

    if (foundEnd) {
      const mathCall = content.substring(mathStart, i + 1);
      const lineNum = content.substring(0, startIdx).split('\n').length;
      const caseName = caseLines[lineNum - 1] || 'unknown';

      // Extract property name from the left side of =
      const beforeEquals = content.substring(Math.max(0, startIdx - 100), startIdx);
      const propMatch = beforeEquals.match(/\.(\w+)\s*$/);
      const propName = propMatch ? propMatch[1] : 'value';

      const wrapped = `assertFinite(${mathCall}, {
        location: 'applyRegionalEffects:${caseName}',
        valueName: '${propName}',
        month: gameState.currentMonth
      })`;

      replacements.push({
        start: mathStart,
        end: i + 1,
        original: mathCall,
        replacement: wrapped
      });
    }
  }

  // Apply replacements in reverse order to maintain indices
  replacements.reverse().forEach(r => {
    result = result.substring(0, r.start) + r.replacement + result.substring(r.end);
  });

  return result;
}

const wrapped = wrapMathCalls(content);
const count = (wrapped.match(/assertFinite\(/g) || []).length - (content.match(/assertFinite\(/g) || []).length;

fs.writeFileSync(filePath, wrapped, 'utf-8');

console.log(`✅ Wrapped ${count} Math.min/Math.max calls with assertFinite`);
console.log(`   All calculations now throw on NaN with full context`);

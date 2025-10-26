#!/usr/bin/env npx tsx

/**
 * Add assertFinite checks to all property accesses in effectsEngine.ts
 * This ensures NaN values are caught immediately with full context
 */

import * as fs from 'fs';

const filePath = './src/simulation/techTree/effectsEngine.ts';
const content = fs.readFileSync(filePath, 'utf-8');

// Pattern: (gameState.X as any).property where it's used in calculations
// We want to wrap the property access in assertFinite

// Strategy: Find all case statements and add assertFinite to property reads

// For now, let's do a simpler approach: wrap ALL (X as any).property reads
// that are used in math operations (+ - * /)

const lines = content.split('\n');
const output: string[] = [];

let insideCaseBlock = false;
let currentCase = '';
let caseStartLine = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Detect case blocks
  if (line.match(/^\s+case '(\w+)':/)) {
    insideCaseBlock = true;
    currentCase = line.match(/case '(\w+)':/)?.[1] || '';
    caseStartLine = i;
  }

  if (line.match(/^\s+break;/) && insideCaseBlock) {
    insideCaseBlock = false;
  }

  output.push(line);
}

// Write instructions for manual fix instead
console.log(`
⚠️  MANUAL FIX REQUIRED

We need to wrap all property accesses in assertFinite checks.

Pattern to find:
  (obj as any).property + value
  (obj as any).property - value
  (obj as any).property * value
  (obj as any).property / value

Should become:
  assertFinite((obj as any).property, {
    location: 'applyRegionalEffects',
    valueName: 'obj.property',
    month: gameState.currentMonth
  }) + value

This is too complex for automated replacement - requires understanding context.
Recommend adding assertFinite manually to each case block.

Total case blocks in effectsEngine: ${lines.filter(l => l.match(/case '\w+':/)).length}
`);

// Count property accesses that need wrapping
const mathOps = content.match(/\([^)]+as any\)\.\w+\s*[+\-*/]/g) || [];
console.log(`\nFound ${mathOps.length} property accesses in math operations that need assertFinite wrapping`);
console.log('\nSample patterns found:');
mathOps.slice(0, 10).forEach(pattern => {
  console.log(`  ${pattern}`);
});

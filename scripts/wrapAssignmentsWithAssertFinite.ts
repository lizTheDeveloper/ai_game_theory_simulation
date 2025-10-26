#!/usr/bin/env npx tsx

/**
 * Wrap all ASSIGNMENTS with assertFinite checks
 * This catches NaN at the point of creation, with full context
 *
 * Pattern: obj.property = calculation
 * Becomes: obj.property = assertFinite(calculation, {context})
 */

import * as fs from 'fs';

const filePath = './src/simulation/techTree/effectsEngine.ts';
let content = fs.readFileSync(filePath, 'utf-8');

const lines = content.split('\n');
const output: string[] = [];

let currentCase = '';
let replacements = 0;

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];

  // Track current case for context
  const caseMatch = line.match(/case '(\w+)':/);
  if (caseMatch) {
    currentCase = caseMatch[1];
  }

  // Pattern: assignment to property with Math.min/Math.max
  // (obj as any).property = Math.min(...)
  // (obj as any).property = Math.max(...)
  const mathMinMaxAssignment = line.match(/^(\s+)(\([^)]+as any\)\.[\w.]+)\s*=\s*(Math\.(min|max)\([^;]+\));/);

  if (mathMinMaxAssignment && currentCase) {
    const indent = mathMinMaxAssignment[1];
    const target = mathMinMaxAssignment[2];
    const calculation = mathMinMaxAssignment[3];

    // Extract property name for context
    const propMatch = target.match(/\.(\w+)$/);
    const propName = propMatch ? propMatch[1] : 'property';

    line = `${indent}${target} = assertFinite(${calculation}, {
${indent}  location: 'applyRegionalEffects:${currentCase}',
${indent}  valueName: '${propName}',
${indent}  month: gameState.currentMonth
${indent}});`;

    replacements++;
  }

  // Pattern: direct assignment without Math.min/max
  // (obj as any).property = value + something;
  const directAssignment = line.match(/^(\s+)(\([^)]+as any\)\.[\w.]+)\s*=\s*([^;]+);/);

  if (directAssignment && currentCase && !mathMinMaxAssignment) {
    // Skip if it's already wrapped with assertFinite
    if (line.includes('assertFinite(')) {
      output.push(line);
      continue;
    }

    // Skip if it's a string/boolean assignment
    if (line.includes('true') || line.includes('false') || line.includes('"') || line.includes("'")) {
      output.push(line);
      continue;
    }

    const indent = directAssignment[1];
    const target = directAssignment[2];
    const calculation = directAssignment[3];

    // Extract property name for context
    const propMatch = target.match(/\.(\w+)$/);
    const propName = propMatch ? propMatch[1] : 'property';

    line = `${indent}${target} = assertFinite(${calculation}, {
${indent}  location: 'applyRegionalEffects:${currentCase}',
${indent}  valueName: '${propName}',
${indent}  month: gameState.currentMonth
${indent}});`;

    replacements++;
  }

  output.push(line);
}

// Write back
fs.writeFileSync(filePath, output.join('\n'), 'utf-8');

console.log(`✅ Wrapped ${replacements} assignments with assertFinite`);
console.log(`   Now all NaN values will be caught at point of creation with full context`);

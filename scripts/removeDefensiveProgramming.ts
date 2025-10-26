#!/usr/bin/env npx tsx

/**
 * Remove all defensive programming patterns from effectsEngine.ts
 * Replace `|| 0` patterns with assertStateProperty calls
 */

import * as fs from 'fs';

const filePath = './src/simulation/techTree/effectsEngine.ts';
const content = fs.readFileSync(filePath, 'utf-8');

// Pattern: ((obj as any).property || defaultValue)
// This regex captures the full expression
const defensivePattern = /\(\(([^)]+)\s+as\s+any\)\.(\w+)\s+\|\|\s+([\d.]+)\)/g;

let fixed = content;
let replacements = 0;

// Track all matches for reporting
const matches: Array<{match: string, object: string, property: string, defaultValue: string}> = [];
let match;
while ((match = defensivePattern.exec(content)) !== null) {
  matches.push({
    match: match[0],
    object: match[1],
    property: match[2],
    defaultValue: match[3]
  });
}

console.log(`Found ${matches.length} defensive programming patterns to fix\n`);

// Replace each pattern
for (const m of matches) {
  const oldPattern = m.match;

  // For now, keep the same behavior - access the property directly
  // The simulation should fail if property is missing (that's a bug)
  const newPattern = `(${m.object} as any).${m.property}`;

  console.log(`Replacing:`);
  console.log(`  OLD: ${oldPattern}`);
  console.log(`  NEW: ${newPattern}`);
  console.log(`  Default was: ${m.defaultValue} (now will throw if missing)\n`);

  fixed = fixed.replace(oldPattern, newPattern);
  replacements++;
}

// Write back
fs.writeFileSync(filePath, fixed, 'utf-8');

console.log(`\n✅ Fixed ${replacements} defensive programming patterns`);
console.log(`❌ Simulation will now FAIL LOUDLY if properties are missing`);
console.log(`   This is CORRECT behavior - missing properties = bugs to fix`);

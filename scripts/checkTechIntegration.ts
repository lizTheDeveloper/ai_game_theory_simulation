#!/usr/bin/env npx tsx

import { getAllTech } from '../src/simulation/techTree/comprehensiveTechTree';
import * as fs from 'fs';

// Get all effects from tech tree
const allEffects = new Set<string>();
const techEffectMap = new Map<string, string[]>();
const allTech = getAllTech();

for (const tech of allTech) {
  const effects = Object.keys(tech.effects);
  techEffectMap.set(tech.id, effects);
  effects.forEach(e => allEffects.add(e));
}

// Read implemented effects from effectsEngine.ts
const effectsEngineCode = fs.readFileSync('./src/simulation/techTree/effectsEngine.ts', 'utf-8');
const implementedEffects = new Set<string>();

// Extract case statements
const caseMatches = effectsEngineCode.matchAll(/case '([a-zA-Z]+)':/g);
for (const match of caseMatches) {
  implementedEffects.add(match[1]);
}

// Find missing effects
const missingEffects = Array.from(allEffects).filter(e => !implementedEffects.has(e)).sort();

console.log('=== TECH EFFECTS INTEGRATION CHECK ===\n');
console.log(`Total unique effects in tech tree: ${allEffects.size}`);
console.log(`Effects implemented in effectsEngine: ${implementedEffects.size}`);
console.log(`Missing implementations: ${missingEffects.length}\n`);

if (missingEffects.length > 0) {
  console.log('❌ MISSING EFFECT IMPLEMENTATIONS:\n');

  // Group by which tech uses them
  for (const effect of missingEffects) {
    const techsUsingEffect = Array.from(techEffectMap.entries())
      .filter(([_, effects]) => effects.includes(effect))
      .map(([techId]) => techId);

    console.log(`  ${effect}`);
    console.log(`    Used by: ${techsUsingEffect.join(', ')}`);
    console.log();
  }
} else {
  console.log('✅ All tech effects are implemented in effectsEngine.ts!');
}

// Also check if there are implemented effects not used by any tech
const unusedImplementations = Array.from(implementedEffects).filter(e => !allEffects.has(e)).sort();
if (unusedImplementations.length > 0) {
  console.log('\n⚠️  IMPLEMENTED BUT UNUSED EFFECTS:\n');
  unusedImplementations.forEach(e => console.log(`  - ${e}`));
}

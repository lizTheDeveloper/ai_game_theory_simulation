/**
 * Validate Tech Tree Effect Names
 *
 * Cross-references all effect names used in the tech tree with the effects
 * handled by the effects engine to find any mismatches.
 */

import { getAllTech } from '../src/simulation/techTree/comprehensiveTechTree';
import * as fs from 'fs';
import * as path from 'path';

// Read the effects engine file to extract handled effects
const effectsEnginePath = path.join(__dirname, '../src/simulation/techTree/effectsEngine.ts');
const effectsEngineContent = fs.readFileSync(effectsEnginePath, 'utf-8');

// Extract case statements from effects engine
const caseMatches = effectsEngineContent.match(/case '([a-zA-Z_]+)':/g);
const handledEffects = new Set(
  caseMatches?.map(m => m.match(/case '([a-zA-Z_]+)':/)![1]) || []
);

// Also extract global effects list from isGlobalEffect function
const globalEffectsMatch = effectsEngineContent.match(/const globalEffects = \[([\s\S]*?)\];/);
if (globalEffectsMatch) {
  const globalEffectsList = globalEffectsMatch[1]
    .split(',')
    .map(s => s.trim())
    .map(s => s.replace(/'/g, ''))
    .filter(s => s.length > 0);
  globalEffectsList.forEach(e => handledEffects.add(e));
}

console.log(`\n=== Tech Tree Effect Validation ===\n`);
console.log(`Effects handled in engine: ${handledEffects.size}`);

// Collect all effect names used in tech tree
const usedEffects = new Set<string>();
const techEffectMap = new Map<string, string[]>();

const allTech = getAllTech();
for (const tech of allTech) {
  const effectNames = Object.keys(tech.effects);
  techEffectMap.set(tech.id, effectNames);
  effectNames.forEach(e => usedEffects.add(e));
}

console.log(`Effects used in tech tree: ${usedEffects.size}\n`);

// Find unhandled effects
const unhandledEffects = Array.from(usedEffects).filter(e => !handledEffects.has(e));
const unusedHandlers = Array.from(handledEffects).filter(e => !usedEffects.has(e));

if (unhandledEffects.length > 0) {
  console.log(`❌ UNHANDLED EFFECTS (${unhandledEffects.length}):`);
  console.log(`These effects are used in tech tree but NOT handled in effects engine:\n`);

  for (const effect of unhandledEffects.sort()) {
    // Find which techs use this effect
    const techsUsingEffect = Array.from(techEffectMap.entries())
      .filter(([_, effects]) => effects.includes(effect))
      .map(([id]) => id);

    console.log(`  - ${effect}`);
    console.log(`    Used by: ${techsUsingEffect.join(', ')}`);
  }
  console.log('');
}

if (unusedHandlers.length > 0) {
  console.log(`ℹ️  UNUSED HANDLERS (${unusedHandlers.length}):`);
  console.log(`These effects are handled but NOT used by any tech:\n`);

  for (const effect of unusedHandlers.sort()) {
    console.log(`  - ${effect}`);
  }
  console.log('');
}

if (unhandledEffects.length === 0 && unusedHandlers.length === 0) {
  console.log(`✅ ALL EFFECTS VALIDATED`);
  console.log(`All ${usedEffects.size} effects are properly handled!\n`);
} else {
  console.log(`\n=== Summary ===`);
  console.log(`Total effects in tech tree: ${usedEffects.size}`);
  console.log(`Total handlers in engine: ${handledEffects.size}`);
  console.log(`Unhandled effects: ${unhandledEffects.length}`);
  console.log(`Unused handlers: ${unusedHandlers.length}\n`);

  if (unhandledEffects.length > 0) {
    console.log(`⚠️  ACTION REQUIRED: Add handlers for ${unhandledEffects.length} unhandled effects\n`);
    process.exit(1);
  }
}

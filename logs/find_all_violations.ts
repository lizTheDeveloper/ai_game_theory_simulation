#!/usr/bin/env npx tsx
/**
 * Find ALL phase dependency ordering violations
 * Roy's exhaustive check (Nov 15, 2025)
 */

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const phasesDir = './src/simulation/engine/phases';
const files = readdirSync(phasesDir).filter(f => f.endsWith('.ts'));

interface PhaseInfo {
  file: string;
  id: string;
  order: number;
  dependencies: string[];
}

const phases: PhaseInfo[] = [];

// Extract phase info from files
for (const file of files) {
  const content = readFileSync(join(phasesDir, file), 'utf-8');

  const idMatch = content.match(/readonly\s+id\s*=\s*['"]([^'"]+)['"]/);
  const orderMatch = content.match(/readonly\s+order\s*=\s*([\d.]+)/);
  const depsMatch = content.match(/readonly\s+dependencies\s*=\s*\[([^\]]*)\]/);

  if (idMatch && orderMatch) {
    const id = idMatch[1];
    const order = parseFloat(orderMatch[1]);
    const dependencies: string[] = [];

    if (depsMatch) {
      const depsStr = depsMatch[1];
      const depMatches = depsStr.matchAll(/['"]([^'"]+)['"]/g);
      for (const match of depMatches) {
        dependencies.push(match[1]);
      }
    }

    phases.push({ file, id, order, dependencies });
  }
}

console.log(`Found ${phases.length} phases\n`);

// Build phase map
const phaseMap = new Map<string, PhaseInfo>();
for (const phase of phases) {
  phaseMap.set(phase.id, phase);
}

// Find violations
let violations = 0;
let missing = 0;

for (const phase of phases) {
  if (phase.dependencies.length === 0) continue;

  for (const depId of phase.dependencies) {
    const depPhase = phaseMap.get(depId);

    if (!depPhase) {
      console.log(`❌ MISSING DEPENDENCY:`);
      console.log(`   Phase: ${phase.id} (order ${phase.order})`);
      console.log(`   Missing: ${depId}`);
      console.log(`   File: ${phase.file}\n`);
      missing++;
    } else if (depPhase.order >= phase.order) {
      console.log(`❌ ORDER VIOLATION:`);
      console.log(`   Phase: ${phase.id} (order ${phase.order})`);
      console.log(`   Depends on: ${depId} (order ${depPhase.order})`);
      console.log(`   File: ${phase.file}\n`);
      violations++;
    }
  }
}

console.log(`\n=== SUMMARY ===`);
console.log(`Total phases: ${phases.length}`);
console.log(`Missing dependencies: ${missing}`);
console.log(`Order violations: ${violations}`);

if (missing + violations === 0) {
  console.log(`\n✅ NO VIOLATIONS FOUND`);
  process.exit(0);
} else {
  console.log(`\n❌ FOUND ${missing + violations} ISSUES`);
  process.exit(1);
}

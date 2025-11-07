#!/usr/bin/env npx tsx
/**
 * Check assertion coverage across phases
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const PHASES_DIR = 'src/simulation/engine/phases';

function hasAssertions(filePath: string): boolean {
  const content = readFileSync(filePath, 'utf-8');
  return /assertFinite|assertStateProperty|assertProbability|assertInRange|assertDefined/.test(content);
}

function main() {
  const files = readdirSync(PHASES_DIR)
    .filter(f => f.endsWith('.ts') && !f.includes('.bak'))
    .sort();

  const withAssertions: string[] = [];
  const withoutAssertions: string[] = [];

  for (const file of files) {
    const filePath = join(PHASES_DIR, file);
    if (hasAssertions(filePath)) {
      withAssertions.push(file);
    } else {
      withoutAssertions.push(file);
    }
  }

  console.log(`\n=== Assertion Coverage ===`);
  console.log(`Total phases: ${files.length}`);
  console.log(`With assertions: ${withAssertions.length} (${(withAssertions.length / files.length * 100).toFixed(1)}%)`);
  console.log(`Without assertions: ${withoutAssertions.length} (${(withoutAssertions.length / files.length * 100).toFixed(1)}%)`);

  console.log(`\n=== Phases WITHOUT Assertions (${withoutAssertions.length}) ===`);
  withoutAssertions.forEach(f => console.log(`  ✗ ${f}`));
}

main();

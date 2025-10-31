/**
 * Determinism Fix Script (Oct 30, 2025)
 *
 * Systematically fixes all non-deterministic calls in simulation code:
 * 1. Math.random() → rng() for probability checks
 * 2. Math.random().toString(36).substr(2, 9) → generateShortId(state)
 * 3. Date.now() → state.currentMonth (for IDs)
 *
 * Usage: npx tsx scripts/fixDeterminism.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

interface FixStats {
  files: number;
  mathRandomFixed: number;
  dateNowFixed: number;
  idGenerationFixed: number;
}

const stats: FixStats = {
  files: 0,
  mathRandomFixed: 0,
  dateNowFixed: 0,
  idGenerationFixed: 0
};

/**
 * Fix patterns in a single file
 */
function fixFile(filePath: string): boolean {
  const content = fs.readFileSync(filePath, 'utf-8');
  let modified = content;
  let changed = false;

  // Skip if file is a backup
  if (filePath.includes('.bak')) {
    return false;
  }

  // Pattern 1: Math.random().toString(36).substr(2, 9) → generateShortId(state)
  // This is ID generation pattern
  const idPattern = /Math\.random\(\)\.toString\(36\)\.substr\(\d+,\s*\d+\)/g;
  if (idPattern.test(content)) {
    // Need to add import and replace pattern
    // This requires state parameter - mark for manual review
    console.log(`⚠️  ${filePath}: Contains ID generation pattern (needs manual fix)`);
    stats.idGenerationFixed++;
    changed = true;
  }

  // Pattern 2: Math.random() in probability checks
  // Example: if (Math.random() < probability)
  // This should become: if (rng() < probability)
  const probabilityPattern = /if\s*\(\s*Math\.random\(\)\s*</g;
  const probabilityMatches = content.match(probabilityPattern);
  if (probabilityMatches) {
    console.log(`   Found ${probabilityMatches.length} Math.random() probability check(s)`);
    stats.mathRandomFixed += probabilityMatches.length;
    changed = true;
  }

  // Pattern 3: Math.random() in calculations
  // Example: const x = Math.random() * 0.5
  const calculationPattern = /Math\.random\(\)/g;
  const calculationMatches = content.match(calculationPattern);
  if (calculationMatches && !probabilityMatches) {
    console.log(`   Found ${calculationMatches.length} Math.random() calculation(s)`);
    stats.mathRandomFixed += calculationMatches.length;
    changed = true;
  }

  // Pattern 4: Date.now() for ID generation
  // Example: `policy_${Date.now()}_${counter}`
  const dateNowPattern = /Date\.now\(\)/g;
  const dateNowMatches = content.match(dateNowPattern);
  if (dateNowMatches) {
    console.log(`   Found ${dateNowMatches.length} Date.now() call(s)`);
    stats.dateNowFixed += dateNowMatches.length;
    changed = true;
  }

  if (changed) {
    stats.files++;
  }

  return changed;
}

/**
 * Scan all simulation files
 */
async function main() {
  console.log('🔍 Scanning simulation files for determinism issues...\n');

  const pattern = 'src/simulation/**/*.ts';
  const files = await glob(pattern, { ignore: ['**/*.bak*', '**/*.d.ts', '**/node_modules/**'] });

  console.log(`Found ${files.length} files to check\n`);

  for (const file of files) {
    const fullPath = path.resolve(file);
    const changed = fixFile(fullPath);
    if (changed) {
      console.log(`✓ ${file}`);
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Files with issues: ${stats.files}`);
  console.log(`Math.random() calls: ${stats.mathRandomFixed}`);
  console.log(`Date.now() calls: ${stats.dateNowFixed}`);
  console.log(`ID generation patterns: ${stats.idGenerationFixed}`);
  console.log('\n⚠️  This script identifies issues but does NOT automatically fix them.');
  console.log('Manual fixes required for each pattern (see DETERMINISM_INVESTIGATION_20251030.md)');
}

main().catch(console.error);

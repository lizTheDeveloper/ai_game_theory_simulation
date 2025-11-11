/**
 * Fix duplicate phase order numbers
 *
 * CRITICAL: Non-deterministic phase execution due to 37 phases sharing orders
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import fixes from './phaseOrderFixes.json';

const phasesDir = 'src/simulation/engine/phases';

interface Fix {
  old: number;
  new: number;
  reason: string;
}

let fixedCount = 0;
let errorCount = 0;

console.log('🔧 Fixing duplicate phase orders...\n');

for (const [group, phases] of Object.entries(fixes)) {
  console.log(`\n${group}:`);

  for (const [filename, fix] of Object.entries(phases as Record<string, Fix>)) {
    const filePath = join(phasesDir, filename);

    try {
      let content = readFileSync(filePath, 'utf-8');

      // Pattern 1: order: 2.5
      const pattern1 = new RegExp(`(\\s+order:\\s*)(${fix.old})([,;\\s])`, 'm');
      // Pattern 2: readonly order = 2.5
      const pattern2 = new RegExp(`(readonly\\s+order\\s*=\\s*)(${fix.old})([,;\\s])`, 'm');
      // Pattern 3: order = 2.5 (no readonly)
      const pattern3 = new RegExp(`(\\s+order\\s*=\\s*)(${fix.old})(;)`, 'm');

      let updated = false;

      if (pattern1.test(content)) {
        content = content.replace(pattern1, `$1${fix.new}$3`);
        updated = true;
      } else if (pattern2.test(content)) {
        content = content.replace(pattern2, `$1${fix.new}$3`);
        updated = true;
      } else if (pattern3.test(content)) {
        content = content.replace(pattern3, `$1${fix.new}$3`);
        updated = true;
      }

      if (updated) {
        writeFileSync(filePath, content, 'utf-8');
        console.log(`  ✅ ${filename}: ${fix.old} → ${fix.new} (${fix.reason})`);
        fixedCount++;
      } else {
        console.log(`  ⚠️ ${filename}: Pattern not found (already fixed?)`);
      }

    } catch (error) {
      console.error(`  ❌ ${filename}: ${error}`);
      errorCount++;
    }
  }
}

console.log(`\n\n📊 Summary:`);
console.log(`  Fixed: ${fixedCount}`);
console.log(`  Errors: ${errorCount}`);

if (errorCount > 0) {
  process.exit(1);
}

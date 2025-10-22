#!/usr/bin/env tsx
/**
 * Automated migration script for techTree references
 *
 * Updates 11 files that still use state.breakthroughTech to use the new
 * techTree helper functions instead.
 */

import * as fs from 'fs';
import * as path from 'path';

const FILES_TO_MIGRATE = [
  'src/simulation/populationDynamics.ts',
  'src/simulation/conflictResolution.ts',
  'src/simulation/regionalPopulations.ts',
  'src/simulation/antimicrobialResistance.ts',
  'src/simulation/qualityOfLife/dimensions.ts',
  'src/simulation/engine/phases/ExogenousShockPhase.ts',
  'src/simulation/engine/phases/StochasticInnovationPhase.ts',
  'src/simulation/lifecycle.ts',
  'src/simulation/sleeperDetection.ts',
  'src/simulation/meaningRenaissance.ts',
  'src/simulation/upwardSpirals.ts',
];

// Pattern to match: state.breakthroughTech.PROP_NAME?.deployed || 0
// or: state.breakthroughTech.PROP_NAME?.deploymentLevel || 0
const PATTERN_1 = /state\.breakthroughTech\.(\w+)\?\.(deployed|deploymentLevel)\s*\|\|\s*0/g;

// Pattern to match: state.breakthroughTech.PROP_NAME?.active
const PATTERN_2 = /state\.breakthroughTech\.(\w+)\?\.active/g;

// Pattern to match: state.breakthroughTech.PROP_NAME
const PATTERN_3 = /state\.breakthroughTech\.(\w+)/g;

function migrateFile(filePath: string): boolean {
  const fullPath = path.join(process.cwd(), filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Check if import already exists
  const hasImport = content.includes("from '../techTree/helpers'") ||
                    content.includes("from '../../techTree/helpers'") ||
                    content.includes("from '@/simulation/techTree/helpers'");

  // Add import if not present and file has breakthroughTech references
  if (!hasImport && content.includes('state.breakthroughTech.')) {
    // Find the last import statement
    const importRegex = /^import .+;$/gm;
    const imports = content.match(importRegex);

    if (imports) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);

      // Determine correct relative path based on file location
      let helperPath = '../techTree/helpers';
      if (filePath.includes('engine/phases/')) {
        helperPath = '../../techTree/helpers';
      } else if (filePath.includes('qualityOfLife/')) {
        helperPath = '../techTree/helpers';
      }

      const newImport = `\nimport { getTechDeploymentSafe } from '${helperPath}';`;

      content =
        content.slice(0, lastImportIndex + lastImport.length) +
        newImport +
        content.slice(lastImportIndex + lastImport.length);

      modified = true;
    }
  }

  // Replace Pattern 1: state.breakthroughTech.PROP?.deployed || 0
  const matches1 = content.matchAll(PATTERN_1);
  for (const match of Array.from(matches1)) {
    const propName = match[1];
    const replacement = `getTechDeploymentSafe(state, '${propName}')`;

    content = content.replace(match[0], replacement);
    modified = true;

    console.log(`  ✓ Replaced: state.breakthroughTech.${propName}?.${match[2]} || 0`);
    console.log(`             → getTechDeploymentSafe(state, '${propName}')`);
  }

  // Replace Pattern 2: state.breakthroughTech.PROP?.active
  const matches2 = content.matchAll(PATTERN_2);
  for (const match of Array.from(matches2)) {
    const propName = match[1];
    const replacement = `getTechDeploymentSafe(state, '${propName}') > 0`;

    content = content.replace(match[0], replacement);
    modified = true;

    console.log(`  ✓ Replaced: state.breakthroughTech.${propName}?.active`);
    console.log(`             → getTechDeploymentSafe(state, '${propName}') > 0`);
  }

  // Pattern 3 is more complex - only replace if not already handled by above
  // and if it's a simple property access pattern

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    return true;
  }

  return false;
}

console.log('🔄 MIGRATING TECH TREE REFERENCES\n');
console.log('=' .repeat(80));

let totalMigrated = 0;

for (const filePath of FILES_TO_MIGRATE) {
  console.log(`\n📝 ${filePath}`);

  const migrated = migrateFile(filePath);

  if (migrated) {
    console.log(`  ✅ Migrated successfully`);
    totalMigrated++;
  } else {
    console.log(`  ℹ️  No changes needed (or file not found)`);
  }
}

console.log('\n' + '='.repeat(80));
console.log(`\n✨ Migration complete! ${totalMigrated}/${FILES_TO_MIGRATE.length} files updated\n`);

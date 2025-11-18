#!/usr/bin/env tsx
/**
 * Fix HIGH-9: Replace dynamic require() with static imports in phase files
 *
 * Problem: Phases use require() inside execute() methods, preventing:
 * - Static analysis
 * - Tree-shaking
 * - Bundle optimization
 * - IDE support
 *
 * Solution: Move require() calls to top-level ES6 imports
 */

import * as fs from 'fs';
import * as path from 'path';

const phasesDir = path.join(__dirname, '../src/simulation/engine/phases');

interface RequireMatch {
  fullMatch: string;
  destructured: string;
  modulePath: string;
  lineNumber: number;
}

function extractRequires(content: string): RequireMatch[] {
  const lines = content.split('\n');
  const requires: RequireMatch[] = [];

  // Pattern: const { ... } = require('...');
  const pattern = /const\s+\{\s*([^}]+)\s*\}\s*=\s*require\(['"]([^'"]+)['"]\);?/g;

  lines.forEach((line, index) => {
    const matches = line.matchAll(pattern);
    for (const match of matches) {
      requires.push({
        fullMatch: match[0],
        destructured: match[1].trim(),
        modulePath: match[2],
        lineNumber: index + 1
      });
    }
  });

  return requires;
}

function fixPhaseFile(filePath: string): boolean {
  console.log(`\nProcessing: ${path.basename(filePath)}`);

  const content = fs.readFileSync(filePath, 'utf-8');
  const requires = extractRequires(content);

  if (requires.length === 0) {
    console.log(`  ✓ No dynamic requires found`);
    return false;
  }

  console.log(`  Found ${requires.length} require() call(s):`);
  requires.forEach(r => {
    console.log(`    Line ${r.lineNumber}: { ${r.destructured} } from '${r.modulePath}'`);
  });

  // Find the last import statement
  const lines = content.split('\n');
  let lastImportIndex = -1;
  let insideComment = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Track multi-line comments
    if (line.includes('/*')) insideComment = true;
    if (line.includes('*/')) insideComment = false;

    // Skip comments
    if (insideComment || line.startsWith('//') || line.startsWith('*')) {
      continue;
    }

    // Find last import
    if (line.startsWith('import ') && !line.includes('type {')) {
      lastImportIndex = i;
    }

    // Stop at class/export declaration
    if (line.startsWith('export class') || line.startsWith('export const')) {
      break;
    }
  }

  if (lastImportIndex === -1) {
    console.log(`  ⚠️  Warning: Could not find import section`);
    return false;
  }

  // Build new imports
  const newImports: string[] = [];
  for (const req of requires) {
    newImports.push(`import { ${req.destructured} } from '${req.modulePath}';`);
  }

  // Insert new imports after last import
  const beforeImports = lines.slice(0, lastImportIndex + 1);
  const afterImports = lines.slice(lastImportIndex + 1);

  let newContent = [
    ...beforeImports,
    ...newImports,
    ...afterImports
  ].join('\n');

  // Remove the old require() calls from execute methods
  for (const req of requires) {
    // Remove the full require line (with optional trailing semicolon and whitespace)
    const reqPattern = new RegExp(
      `\\s*const\\s+\\{\\s*${req.destructured.replace(/,/g, '\\s*,\\s*')}\\s*\\}\\s*=\\s*require\\(['"]${req.modulePath.replace(/\//g, '\\/')}['"]\\);?\\s*\\n?`,
      'g'
    );
    newContent = newContent.replace(reqPattern, '');
  }

  // Write back
  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log(`  ✅ Fixed ${requires.length} require(s)`);

  return true;
}

// Main execution
console.log('🔧 HIGH-9 FIX: Converting dynamic require() to static imports\n');
console.log(`Phase directory: ${phasesDir}\n`);

const phaseFiles = fs.readdirSync(phasesDir)
  .filter(f => f.endsWith('.ts') && !f.includes('.bak'))
  .map(f => path.join(phasesDir, f));

let fixedCount = 0;
let totalRequires = 0;

for (const file of phaseFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const requires = extractRequires(content);

  if (requires.length > 0) {
    const fixed = fixPhaseFile(file);
    if (fixed) {
      fixedCount++;
      totalRequires += requires.length;
    }
  }
}

console.log(`\n📊 SUMMARY:`);
console.log(`   Files processed: ${phaseFiles.length}`);
console.log(`   Files fixed: ${fixedCount}`);
console.log(`   Total require() calls converted: ${totalRequires}`);
console.log(`\n✅ Static imports now enable:`);
console.log(`   • Static analysis (TypeScript can check imports at build time)`);
console.log(`   • Tree-shaking (unused code can be removed)`);
console.log(`   • Better IDE support (autocomplete, go-to-definition)`);
console.log(`   • Smaller bundle size (dead code elimination)`);
console.log(`\nNext: Run 'npm run typecheck' to verify no import errors\n`);

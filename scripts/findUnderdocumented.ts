/**
 * Find Underdocumented Types
 *
 * Scans TypeScript files for interfaces, types, and functions with
 * insufficient documentation (< 5 words or missing entirely).
 */

import * as fs from 'fs';
import * as path from 'path';

interface UnderdocumentedItem {
  file: string;
  line: number;
  type: 'interface' | 'type' | 'function' | 'property';
  name: string;
  currentDoc: string;
  context: string;
}

const results: UnderdocumentedItem[] = [];

function findTsFiles(dir: string, excludeDirs: string[] = []): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!excludeDirs.includes(item)) {
        files.push(...findTsFiles(fullPath, excludeDirs));
      }
    } else if (item.endsWith('.ts') && !item.endsWith('.test.ts') && !item.endsWith('.spec.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractDocComment(lines: string[], index: number): string {
  let doc = '';
  let i = index - 1;

  // Look backwards for JSDoc comment
  while (i >= 0) {
    const line = lines[i].trim();
    if (line === '/**' || line.startsWith('/**')) {
      // Found start of comment, collect all lines
      let j = i;
      while (j < index) {
        const commentLine = lines[j].trim()
          .replace(/^\/\*\*/, '')
          .replace(/^\*/, '')
          .replace(/\*\/$/, '')
          .trim();
        if (commentLine) {
          doc = commentLine + ' ' + doc;
        }
        j++;
      }
      return doc.trim();
    }
    if (line && !line.startsWith('*') && !line.startsWith('//')) {
      break; // Hit non-comment code
    }
    i--;
  }

  // Check for inline comment
  const currentLine = lines[index];
  const inlineMatch = currentLine.match(/\/\/\s*(.+)$/);
  if (inlineMatch) {
    return inlineMatch[1].trim();
  }

  return '';
}

function analyzeFile(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for interface declarations
    const interfaceMatch = line.match(/^\s*export\s+interface\s+(\w+)/);
    if (interfaceMatch) {
      const name = interfaceMatch[1];
      const doc = extractDocComment(lines, i);
      const wordCount = doc.split(/\s+/).filter(w => w.length > 0).length;

      if (wordCount < 5) {
        results.push({
          file: filePath,
          line: i + 1,
          type: 'interface',
          name,
          currentDoc: doc || '(none)',
          context: line.trim()
        });
      }
    }

    // Check for type aliases
    const typeMatch = line.match(/^\s*export\s+type\s+(\w+)\s*=/);
    if (typeMatch) {
      const name = typeMatch[1];
      const doc = extractDocComment(lines, i);
      const wordCount = doc.split(/\s+/).filter(w => w.length > 0).length;

      if (wordCount < 5) {
        results.push({
          file: filePath,
          line: i + 1,
          type: 'type',
          name,
          currentDoc: doc || '(none)',
          context: line.trim()
        });
      }
    }

    // Check for exported functions
    const functionMatch = line.match(/^\s*export\s+(?:async\s+)?function\s+(\w+)/);
    if (functionMatch) {
      const name = functionMatch[1];
      const doc = extractDocComment(lines, i);
      const wordCount = doc.split(/\s+/).filter(w => w.length > 0).length;

      if (wordCount < 5) {
        results.push({
          file: filePath,
          line: i + 1,
          type: 'function',
          name,
          currentDoc: doc || '(none)',
          context: line.trim()
        });
      }
    }

    // Check for interface properties (inside interfaces)
    if (line.trim().match(/^\w+(\?)?:\s/)) {
      const propertyMatch = line.match(/^\s*(\w+)(\?)?:\s*([^;]+)/);
      if (propertyMatch) {
        const name = propertyMatch[1];
        const doc = extractDocComment(lines, i);
        const wordCount = doc.split(/\s+/).filter(w => w.length > 0).length;

        // Only flag if completely undocumented (many properties have inline docs)
        if (!doc) {
          results.push({
            file: filePath,
            line: i + 1,
            type: 'property',
            name,
            currentDoc: '(none)',
            context: line.trim()
          });
        }
      }
    }
  }
}

// Scan src/types and src/simulation
const typesDir = path.join(__dirname, '../src/types');
const simulationDir = path.join(__dirname, '../src/simulation');

console.log('Scanning for underdocumented types...\n');

const typesFiles = findTsFiles(typesDir);
const simulationFiles = findTsFiles(simulationDir, ['engine/phases']); // Skip phases for now

for (const file of [...typesFiles, ...simulationFiles]) {
  analyzeFile(file);
}

// Group by type
const byType: Record<string, UnderdocumentedItem[]> = {
  interface: [],
  type: [],
  function: [],
  property: []
};

for (const item of results) {
  byType[item.type].push(item);
}

// Report
console.log(`\n=== Underdocumented Items Found ===\n`);
console.log(`Total: ${results.length} items need better documentation`);
console.log(`  ${byType.interface.length} interfaces`);
console.log(`  ${byType.type.length} type aliases`);
console.log(`  ${byType.function.length} functions`);
console.log(`  ${byType.property.length} properties\n`);

// Show worst offenders (completely undocumented interfaces/types)
const criticalItems = results.filter(r =>
  (r.type === 'interface' || r.type === 'type') &&
  r.currentDoc === '(none)'
);

if (criticalItems.length > 0) {
  console.log(`\n❌ CRITICAL: ${criticalItems.length} completely undocumented interfaces/types\n`);

  for (const item of criticalItems.slice(0, 20)) {
    const relPath = item.file.replace(process.cwd() + '/', '');
    console.log(`  ${item.type.toUpperCase()} ${item.name}`);
    console.log(`    File: ${relPath}:${item.line}`);
    console.log(`    Context: ${item.context}\n`);
  }
}

// Show poorly documented (< 5 words)
const poorlyDocumented = results.filter(r =>
  (r.type === 'interface' || r.type === 'type') &&
  r.currentDoc !== '(none)' &&
  r.currentDoc.split(/\s+/).length < 5
);

if (poorlyDocumented.length > 0) {
  console.log(`\n⚠️  ${poorlyDocumented.length} interfaces/types with minimal documentation (< 5 words)\n`);

  for (const item of poorlyDocumented.slice(0, 15)) {
    const relPath = item.file.replace(process.cwd() + '/', '');
    console.log(`  ${item.type.toUpperCase()} ${item.name}`);
    console.log(`    Current: "${item.currentDoc}"`);
    console.log(`    File: ${relPath}:${item.line}\n`);
  }
}

// Export JSON for processing
const outputPath = path.join(__dirname, '../docs/underdocumented.json');
fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
console.log(`\n✅ Full results saved to: docs/underdocumented.json`);
console.log(`   Use this file to generate documentation improvements\n`);

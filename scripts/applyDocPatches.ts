/**
 * Apply Documentation Patches
 *
 * Reads doc-patches.json and applies JSDoc comments to underdocumented items.
 * Only applies high-confidence patches.
 */

import * as fs from 'fs';
import * as path from 'path';

interface Patch {
  file: string;
  line: number;
  doc: string;
  name: string;
}

// Read patches
const patchPath = path.join(__dirname, '../docs/doc-patches.json');
const patches: Patch[] = JSON.parse(fs.readFileSync(patchPath, 'utf-8'));

console.log(`Applying ${patches.length} documentation patches...\n`);

// Group by file
const byFile = new Map<string, Patch[]>();
for (const patch of patches) {
  if (!byFile.has(patch.file)) {
    byFile.set(patch.file, []);
  }
  byFile.get(patch.file)!.push(patch);
}

let filesModified = 0;
let patchesApplied = 0;

for (const [filePath, filePatches] of byFile) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  // Sort patches by line number (descending) to avoid line number shifts
  const sorted = filePatches.sort((a, b) => b.line - a.line);

  let modified = false;

  for (const patch of sorted) {
    const lineIndex = patch.line - 1; // Convert to 0-based
    const targetLine = lines[lineIndex];

    // Check if already documented
    if (lineIndex > 0) {
      const prevLine = lines[lineIndex - 1].trim();
      if (prevLine.startsWith('/**') || prevLine.startsWith('*') || prevLine.startsWith('//')) {
        console.log(`  ⏭️  Skipping ${patch.name} (already has comment)`);
        continue;
      }
    }

    // Get indentation from target line
    const indent = targetLine.match(/^(\s*)/)?.[1] || '';

    // Insert JSDoc comment
    const docLines = [
      `${indent}/**`,
      `${indent} * ${patch.doc}`,
      `${indent} */`
    ];

    lines.splice(lineIndex, 0, ...docLines);
    modified = true;
    patchesApplied++;

    const relPath = filePath.replace(process.cwd() + '/', '');
    console.log(`  ✅ Applied: ${patch.name} in ${relPath}:${patch.line}`);
  }

  if (modified) {
    fs.writeFileSync(filePath, lines.join('\n'));
    filesModified++;
  }
}

console.log(`\n✅ Documentation applied:`);
console.log(`   ${patchesApplied} patches applied`);
console.log(`   ${filesModified} files modified\n`);

console.log(`Run 'npm run docs' to regenerate API documentation with new comments.\n`);

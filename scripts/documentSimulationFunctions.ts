/**
 * Document Simulation Functions
 *
 * Scans src/simulation/ for underdocumented functions and generates
 * token-efficient documentation based on function signatures and context.
 */

import * as fs from 'fs';
import * as path from 'path';

interface FunctionInfo {
  file: string;
  line: number;
  name: string;
  signature: string;
  currentDoc: string;
  params: string[];
  returns: string;
}

const functions: FunctionInfo[] = [];

function findTsFiles(dir: string): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory() && item !== 'node_modules') {
      files.push(...findTsFiles(fullPath));
    } else if (item.endsWith('.ts') && !item.endsWith('.test.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

function extractDocComment(lines: string[], index: number): string {
  let doc = '';
  let i = index - 1;

  while (i >= 0) {
    const line = lines[i].trim();
    if (line === '/**' || line.startsWith('/**')) {
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
      break;
    }
    i--;
  }

  return '';
}

function analyzeFile(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Match exported functions
    const functionMatch = line.match(/^\s*export\s+(?:async\s+)?function\s+(\w+)\s*\((.*?)\)/);
    if (functionMatch) {
      const name = functionMatch[1];
      const paramsStr = functionMatch[2];
      const params = paramsStr
        .split(',')
        .map(p => p.trim().split(':')[0].trim())
        .filter(p => p);

      // Try to find return type
      let returns = 'void';
      const returnMatch = line.match(/\):\s*([^{]+)/);
      if (returnMatch) {
        returns = returnMatch[1].trim();
      }

      const doc = extractDocComment(lines, i);
      const wordCount = doc.split(/\s+/).filter(w => w.length > 0).length;

      // Get full signature (might span multiple lines)
      let signature = line;
      let j = i + 1;
      while (j < lines.length && !signature.includes('{')) {
        signature += ' ' + lines[j].trim();
        j++;
      }
      signature = signature.split('{')[0].trim();

      if (wordCount < 5 || !doc) {
        functions.push({
          file: filePath,
          line: i + 1,
          name,
          signature,
          currentDoc: doc || '(none)',
          params,
          returns
        });
      }
    }
  }
}

// Scan simulation directory
const simulationDir = path.join(__dirname, '../src/simulation');
const files = findTsFiles(simulationDir);

console.log(`Scanning ${files.length} files in src/simulation/...\n`);

for (const file of files) {
  analyzeFile(file);
}

console.log(`\n=== Found ${functions.length} underdocumented functions ===\n`);

// Group by file
const byFile = new Map<string, FunctionInfo[]>();
for (const func of functions) {
  const relPath = func.file.replace(process.cwd() + '/', '');
  if (!byFile.has(relPath)) {
    byFile.set(relPath, []);
  }
  byFile.get(relPath)!.push(func);
}

// Show worst files
const sortedFiles = Array.from(byFile.entries())
  .sort((a, b) => b[1].length - a[1].length);

console.log('Top 15 files needing documentation:\n');
for (const [file, funcs] of sortedFiles.slice(0, 15)) {
  console.log(`  ${file}: ${funcs.length} functions`);
}

console.log('\n\n=== Sample Undocumented Functions ===\n');

// Show samples from different files
const samples = functions.slice(0, 30);
for (const func of samples) {
  const relPath = func.file.replace(process.cwd() + '/', '');
  console.log(`${func.name} (${relPath}:${func.line})`);
  console.log(`  Current: ${func.currentDoc}`);
  console.log(`  Params: ${func.params.join(', ') || 'none'}`);
  console.log(`  Returns: ${func.returns}`);
  console.log('');
}

// Generate documentation
interface DocPatch {
  file: string;
  line: number;
  name: string;
  doc: string;
}

const patches: DocPatch[] = [];

function generateFunctionDoc(func: FunctionInfo): string {
  const fileName = path.basename(func.file, '.ts');
  const { name, params, returns } = func;

  // Pattern-based generation
  let doc = '';

  // Common patterns
  if (name.startsWith('update')) {
    const target = name.replace('update', '').replace(/([A-Z])/g, ' $1').trim().toLowerCase();
    doc = `Updates ${target} based on current state and modifiers.`;
  } else if (name.startsWith('calculate')) {
    const target = name.replace('calculate', '').replace(/([A-Z])/g, ' $1').trim().toLowerCase();
    doc = `Calculates ${target} from state variables and parameters.`;
  } else if (name.startsWith('apply')) {
    const target = name.replace('apply', '').replace(/([A-Z])/g, ' $1').trim().toLowerCase();
    doc = `Applies ${target} effects to game state.`;
  } else if (name.startsWith('detect') || name.startsWith('check')) {
    const target = name.replace(/^(detect|check)/, '').replace(/([A-Z])/g, ' $1').trim().toLowerCase();
    doc = `Detects ${target} conditions and triggers appropriate responses.`;
  } else if (name.startsWith('initialize') || name.startsWith('create')) {
    const target = name.replace(/^(initialize|create)/, '').replace(/([A-Z])/g, ' $1').trim().toLowerCase();
    doc = `Initializes ${target} with default or specified values.`;
  } else if (name.startsWith('simulate')) {
    const target = name.replace('simulate', '').replace(/([A-Z])/g, ' $1').trim().toLowerCase();
    doc = `Simulates ${target} dynamics for one time step.`;
  } else if (name.includes('Mortality') || name.includes('Death')) {
    doc = `Processes mortality events and updates population. Returns death statistics.`;
  } else if (name.includes('Crisis') || name.includes('Catastrophe')) {
    doc = `Evaluates crisis/catastrophe conditions and triggers appropriate cascades.`;
  } else if (name.includes('Recovery') || name.includes('Restoration')) {
    doc = `Processes recovery/restoration mechanisms. Returns updated state.`;
  } else if (name.includes('Threshold')) {
    doc = `Checks threshold conditions and triggers state transitions.`;
  }

  // File-based context
  if (!doc) {
    if (fileName.includes('environmental')) {
      doc = `${name} for environmental accumulation system.`;
    } else if (fileName.includes('social')) {
      doc = `${name} for social cohesion and trust dynamics.`;
    } else if (fileName.includes('capabilities')) {
      doc = `${name} for AI capability tracking and growth.`;
    } else if (fileName.includes('government')) {
      doc = `${name} for government agent decision-making.`;
    } else if (fileName.includes('tech')) {
      doc = `${name} for technology tree management.`;
    }
  }

  // Returns context
  if (returns !== 'void' && returns !== 'void;') {
    if (returns.includes('number')) {
      doc += ` Returns numeric value.`;
    } else if (returns.includes('boolean')) {
      doc += ` Returns true if condition met.`;
    } else if (returns.includes('[]') || returns.includes('Array')) {
      doc += ` Returns array of results.`;
    }
  }

  // Fallback
  if (!doc) {
    doc = `${name} implementation. See ${fileName}.ts for details.`;
  }

  return doc;
}

// Generate for all
for (const func of functions) {
  const doc = generateFunctionDoc(func);
  patches.push({
    file: func.file,
    line: func.line,
    name: func.name,
    doc
  });
}

// Save patches
const outputPath = path.join(__dirname, '../docs/function-doc-patches.json');
fs.writeFileSync(outputPath, JSON.stringify(patches, null, 2));

console.log(`\n✅ Generated ${patches.length} function documentation patches`);
console.log(`   Saved to: docs/function-doc-patches.json\n`);

// Show samples
console.log('\n=== Sample Generated Docs ===\n');
for (const patch of patches.slice(0, 20)) {
  const relPath = patch.file.replace(process.cwd() + '/', '');
  console.log(`${patch.name} (${relPath}:${patch.line})`);
  console.log(`  Doc: ${patch.doc}`);
  console.log('');
}

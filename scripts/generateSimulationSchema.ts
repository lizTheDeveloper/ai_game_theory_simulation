/**
 * Generate Hyper Token-Efficient Simulation Schema
 *
 * Extracts minimal structural map of entire simulation for LLM consumption.
 * Output format: Ultra-compact, hierarchical, relationship-focused.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

interface TypeInfo {
  name: string;
  kind: 'interface' | 'type' | 'enum';
  properties: string[];
  extends?: string[];
  file: string;
}

interface FunctionInfo {
  name: string;
  params: string[];
  returns: string;
  file: string;
}

const types = new Map<string, TypeInfo>();
const functions: FunctionInfo[] = [];
const imports = new Map<string, Set<string>>(); // What imports what

function extractTypes(sourceFile: ts.SourceFile, filePath: string): void {
  const fileName = path.basename(filePath, '.ts');

  ts.forEachChild(sourceFile, node => {
    // Interfaces
    if (ts.isInterfaceDeclaration(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      const name = node.name.text;
      const properties: string[] = [];
      const extendsTypes: string[] = [];

      // Get properties
      node.members.forEach(member => {
        if (ts.isPropertySignature(member) && member.name) {
          properties.push(member.name.getText());
        }
      });

      // Get extends
      if (node.heritageClauses) {
        node.heritageClauses.forEach(clause => {
          clause.types.forEach(type => {
            extendsTypes.push(type.expression.getText());
          });
        });
      }

      types.set(name, {
        name,
        kind: 'interface',
        properties,
        extends: extendsTypes.length > 0 ? extendsTypes : undefined,
        file: fileName
      });
    }

    // Type aliases
    if (ts.isTypeAliasDeclaration(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      const name = node.name.text;
      types.set(name, {
        name,
        kind: 'type',
        properties: [],
        file: fileName
      });
    }

    // Enums
    if (ts.isEnumDeclaration(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
      const name = node.name.text;
      const members = node.members.map(m => m.name.getText());
      types.set(name, {
        name,
        kind: 'enum',
        properties: members,
        file: fileName
      });
    }

    // Functions
    if (ts.isFunctionDeclaration(node) && node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) && node.name) {
      const name = node.name.text;
      const params = node.parameters.map(p => p.name.getText());
      let returns = 'void';
      if (node.type) {
        returns = node.type.getText();
      }

      functions.push({
        name,
        params,
        returns,
        file: fileName
      });
    }
  });
}

function processFile(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true
  );
  extractTypes(sourceFile, filePath);
}

function findTsFiles(dir: string, exclude: string[] = []): string[] {
  const files: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    if (exclude.includes(item)) continue;
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...findTsFiles(fullPath, exclude));
    } else if (item.endsWith('.ts') && !item.endsWith('.test.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

// Process types and simulation
const typesDir = path.join(__dirname, '../src/types');
const simulationDir = path.join(__dirname, '../src/simulation');

console.log('Extracting simulation schema...\n');

const typeFiles = findTsFiles(typesDir);
const simFiles = findTsFiles(simulationDir, ['engine/phases']);

for (const file of [...typeFiles, ...simFiles]) {
  processFile(file);
}

console.log(`Extracted ${types.size} types and ${functions.length} functions\n`);

// Generate ultra-compact schema
const schema: any = {
  meta: {
    types: types.size,
    functions: functions.length,
    generated: new Date().toISOString()
  },
  core: {},
  systems: {},
  agents: {},
  phases: {},
  utils: {}
};

// Categorize types
for (const [name, info] of types) {
  const category =
    info.file === 'game' ? 'core' :
    name.includes('Agent') || name.includes('Decision') ? 'agents' :
    name.includes('System') || name.includes('State') ? 'systems' :
    'core';

  if (!schema[category][info.file]) {
    schema[category][info.file] = {};
  }

  // Ultra-compact format: just name and key properties
  const compact: any = { k: info.kind };
  if (info.properties.length > 0 && info.properties.length <= 20) {
    compact.p = info.properties;
  } else if (info.properties.length > 20) {
    compact.p = `${info.properties.length} props`;
  }
  if (info.extends) {
    compact.e = info.extends;
  }

  schema[category][info.file][name] = compact;
}

// Categorize functions
const funcsByFile = new Map<string, FunctionInfo[]>();
for (const func of functions) {
  if (!funcsByFile.has(func.file)) {
    funcsByFile.set(func.file, []);
  }
  funcsByFile.get(func.file)!.push(func);
}

schema.functions = {};
for (const [file, funcs] of funcsByFile) {
  schema.functions[file] = funcs.map(f => ({
    n: f.name,
    p: f.params,
    r: f.returns.length > 30 ? '...' : f.returns
  }));
}

// Save full JSON schema
const outputPath = path.join(__dirname, '../docs/simulation-schema.json');
fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));
console.log(`✅ Full schema: docs/simulation-schema.json (${(fs.statSync(outputPath).size / 1024).toFixed(1)}KB)\n`);

// Generate ULTRA-COMPACT text format for LLM
let compact = '# Simulation Schema\n\n';

// GameState (most important)
const gameState = types.get('GameState');
if (gameState) {
  compact += '## GameState (root)\n';
  compact += gameState.properties.slice(0, 50).join(', ') + '\n';
  if (gameState.properties.length > 50) {
    compact += `... +${gameState.properties.length - 50} more\n`;
  }
  compact += '\n';
}

// Key types by category
compact += '## Agents\n';
const agentTypes = Array.from(types.values()).filter(t =>
  t.name.includes('Agent') || t.name.includes('Society') || t.name.includes('Government')
);
for (const t of agentTypes.slice(0, 10)) {
  compact += `${t.name}: ${t.properties.length} props\n`;
}

compact += '\n## Systems\n';
const systemTypes = Array.from(types.values()).filter(t =>
  t.name.includes('System') && !t.name.includes('Agent')
);
for (const t of systemTypes.slice(0, 15)) {
  compact += `${t.name}: ${t.properties.length} props\n`;
}

compact += '\n## Key Functions\n';
const initFuncs = functions.filter(f => f.name.startsWith('initialize'));
const updateFuncs = functions.filter(f => f.name.startsWith('update'));
const calcFuncs = functions.filter(f => f.name.startsWith('calculate'));

compact += `Init: ${initFuncs.map(f => f.name).join(', ')}\n`;
compact += `Update: ${updateFuncs.map(f => f.name).join(', ')}\n`;
compact += `Calc: ${calcFuncs.slice(0, 10).map(f => f.name).join(', ')}\n`;

const compactPath = path.join(__dirname, '../docs/simulation-schema-compact.txt');
fs.writeFileSync(compactPath, compact);
console.log(`✅ Compact schema: docs/simulation-schema-compact.txt (${(fs.statSync(compactPath).size / 1024).toFixed(1)}KB)\n`);

// Generate MINIMAL hierarchical tree
let tree = 'GameState\n';

// Group properties by category
const gameStateProps = gameState?.properties || [];
const categories = {
  'Time': gameStateProps.filter(p => p.includes('Month') || p.includes('Time')),
  'Agents': gameStateProps.filter(p => p.includes('Agent') || p.includes('agent')),
  'Systems': gameStateProps.filter(p => p.includes('System')),
  'Metrics': gameStateProps.filter(p => p.includes('Metrics') || p === 'globalMetrics'),
  'Accumulation': gameStateProps.filter(p => p.includes('Accumulation')),
  'Crises': gameStateProps.filter(p => p.includes('Crisis') || p.includes('crisis')),
  'Tech': gameStateProps.filter(p => p.includes('Tech') || p.includes('tech') || p.includes('Technology')),
  'Economy': gameStateProps.filter(p => p.includes('Economy') || p.includes('economy') || p.includes('Resource')),
  'Environment': gameStateProps.filter(p => p.includes('Environmental') || p.includes('Planetary') || p.includes('Climate')),
  'Social': gameStateProps.filter(p => p.includes('Social') || p.includes('society') || p.includes('Meaning')),
  'Outcomes': gameStateProps.filter(p => p.includes('Outcome') || p.includes('outcome') || p.includes('Utopia') || p.includes('Dystopia'))
};

for (const [cat, props] of Object.entries(categories)) {
  if (props.length > 0) {
    tree += `├─ ${cat} (${props.length})\n`;
    for (const prop of props.slice(0, 5)) {
      tree += `│  ├─ ${prop}\n`;
    }
    if (props.length > 5) {
      tree += `│  └─ ... +${props.length - 5}\n`;
    }
  }
}

const treePath = path.join(__dirname, '../docs/simulation-schema-tree.txt');
fs.writeFileSync(treePath, tree);
console.log(`✅ Tree view: docs/simulation-schema-tree.txt (${(fs.statSync(treePath).size / 1024).toFixed(1)}KB)\n`);

// Generate dependency graph (what references what)
console.log('Analyzing dependencies...');
const deps = new Map<string, Set<string>>();

for (const [name, info] of types) {
  deps.set(name, new Set());

  // Check which other types are referenced in properties
  for (const prop of info.properties) {
    for (const [otherName] of types) {
      if (prop.toLowerCase().includes(otherName.toLowerCase()) && name !== otherName) {
        deps.get(name)!.add(otherName);
      }
    }
  }
}

// Find most connected types
const connectivity = Array.from(deps.entries())
  .map(([name, refs]) => ({ name, refs: refs.size }))
  .sort((a, b) => b.refs - a.refs);

let depsText = '# Type Dependencies (Most Connected)\n\n';
for (const { name, refs } of connectivity.slice(0, 20)) {
  depsText += `${name}: ${refs} references\n`;
}

const depsPath = path.join(__dirname, '../docs/simulation-dependencies.txt');
fs.writeFileSync(depsPath, depsText);
console.log(`✅ Dependencies: docs/simulation-dependencies.txt\n`);

// Generate LLM-optimized summary
const llmSummary = `SIMULATION STRUCTURE (Token-Optimized)

ROOT: GameState (${gameState?.properties.length} properties)
AGENTS: ${agentTypes.length} types (AIAgent, GovernmentAgent, HumanSocietyAgent, DecisionMaker)
SYSTEMS: ${systemTypes.length} types (FamineSystem, FreshwaterSystem, ResourceEconomy, etc.)
FUNCTIONS: ${functions.length} (${initFuncs.length} init, ${updateFuncs.length} update, ${calcFuncs.length} calc)

KEY FLOW:
1. Initialize state (${initFuncs.length} functions)
2. Phase execution (37 phases, see PhaseOrchestrator)
3. Update systems (${updateFuncs.length} functions)
4. Calculate outcomes (OutcomeCalculationPhase)

CRITICAL TYPES:
- GameState: Root state container
- AIAgent: ${types.get('AIAgent')?.properties.length} props
- GlobalMetrics: ${types.get('GlobalMetrics')?.properties.length} props
- QualityOfLifeSystems: Multi-dimensional QoL
- ResourceEconomy: Full resource modeling

TOTAL: ${types.size} types, ${functions.length} functions
FILES: ${new Set(Array.from(types.values()).map(t => t.file)).size} type files
`;

const llmPath = path.join(__dirname, '../docs/simulation-llm-summary.txt');
fs.writeFileSync(llmPath, llmSummary);
console.log(`✅ LLM Summary: docs/simulation-llm-summary.txt (${(fs.statSync(llmPath).size).toFixed(0)} bytes)\n`);

console.log('Schema generation complete!\n');
console.log('Output files:');
console.log('  1. simulation-schema.json (full JSON schema)');
console.log('  2. simulation-schema-compact.txt (compact text)');
console.log('  3. simulation-schema-tree.txt (hierarchical tree)');
console.log('  4. simulation-dependencies.txt (type connectivity)');
console.log('  5. simulation-llm-summary.txt (ULTRA-compact LLM prompt)\n');

/**
 * Validate Property Access Against Type Definitions
 *
 * Finds all places where code references properties that don't exist
 * in the TypeScript type definitions. Catches bugs like:
 * - gameState.resources.energy (should be resourceEconomy.energy)
 * - state.government.nonExistentField
 * - Typos in property names
 *
 * This prevents NaN bugs from accessing undefined properties.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

interface PropertyAccess {
  file: string;
  line: number;
  propertyPath: string;
  context: string;
}

interface ValidationIssue {
  file: string;
  line: number;
  accessedPath: string;
  expectedPath?: string;
  context: string;
  severity: 'error' | 'warning';
  message: string;
}

const issues: ValidationIssue[] = [];
const propertyAccesses: PropertyAccess[] = [];

// Build complete type information from GameState and related types
const typeInfo = new Map<string, Set<string>>();

function buildTypeInfo() {
  const typesDir = path.join(__dirname, '../src/types');
  const gameTypesFile = path.join(typesDir, 'game.ts');

  const sourceCode = fs.readFileSync(gameTypesFile, 'utf-8');
  const sourceFile = ts.createSourceFile(
    gameTypesFile,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  function extractInterfaceProperties(node: ts.Node, interfaceName: string): void {
    if (ts.isInterfaceDeclaration(node)) {
      const name = node.name.text;
      const properties = new Set<string>();

      for (const member of node.members) {
        if (ts.isPropertySignature(member) && member.name) {
          const propName = member.name.getText(sourceFile);
          properties.add(propName);

          // Extract nested type if it's an interface reference
          if (member.type && ts.isTypeReferenceNode(member.type)) {
            const typeName = member.type.typeName.getText(sourceFile);
            // Store relationship: Interface.property -> NestedType
            typeInfo.set(`${name}.${propName}`, new Set([typeName]));
          }
        }
      }

      typeInfo.set(name, properties);
    }

    ts.forEachChild(node, n => extractInterfaceProperties(n, interfaceName));
  }

  extractInterfaceProperties(sourceFile, 'root');

  // Also scan all type files
  const typeFiles = fs.readdirSync(typesDir).filter(f => f.endsWith('.ts'));
  for (const file of typeFiles) {
    const filePath = path.join(typesDir, file);
    const code = fs.readFileSync(filePath, 'utf-8');
    const src = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true);
    extractInterfaceProperties(src, 'root');
  }
}

function validatePropertyPath(propPath: string[], file: string, line: number, context: string): void {
  // Skip if path is too short
  if (propPath.length < 2) return;

  // Start with GameState or state
  const root = propPath[0] === 'state' || propPath[0] === 'gameState' ? 'GameState' : propPath[0];

  let currentType = root;
  const fullPath = propPath.join('.');

  // Track property access
  propertyAccesses.push({
    file: path.basename(file, '.ts'),
    line,
    propertyPath: fullPath,
    context
  });

  // Validate each level
  for (let i = 1; i < propPath.length; i++) {
    const property = propPath[i];
    const currentPath = propPath.slice(0, i + 1).join('.');

    // Check if current type has this property
    const properties = typeInfo.get(currentType);

    if (!properties) {
      // Type not found in our map - might be external or we missed it
      return;
    }

    if (!properties.has(property)) {
      // Property doesn't exist!
      const available = Array.from(properties).slice(0, 5).join(', ');

      issues.push({
        file: path.basename(file, '.ts'),
        line,
        accessedPath: currentPath,
        context: context.substring(0, 100),
        severity: 'error',
        message: `Property '${property}' does not exist on type '${currentType}'. Available: ${available}...`
      });
      return;
    }

    // Move to next type level
    const nextTypeKey = `${currentType}.${property}`;
    const nextTypes = typeInfo.get(nextTypeKey);
    if (nextTypes && nextTypes.size > 0) {
      currentType = Array.from(nextTypes)[0];
    } else {
      // Reached a leaf property
      return;
    }
  }
}

function extractPropertyPath(node: ts.Node, sourceFile: ts.SourceFile): string[] | null {
  const propPath: string[] = [];

  function traverse(n: ts.Node): boolean {
    if (ts.isPropertyAccessExpression(n)) {
      if (!traverse(n.expression)) return false;
      propPath.push(n.name.text);
      return true;
    } else if (ts.isIdentifier(n)) {
      propPath.push(n.text);
      return true;
    }
    return false;
  }

  if (traverse(node)) {
    return propPath;
  }
  return null;
}

function scanFile(filePath: string): void {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  function visit(node: ts.Node): void {
    // Look for property access expressions
    if (ts.isPropertyAccessExpression(node)) {
      const propertyPath = extractPropertyPath(node, sourceFile);

      if (propertyPath &&
          (propertyPath[0] === 'state' || propertyPath[0] === 'gameState')) {
        const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        const context = node.getText(sourceFile);

        validatePropertyPath(propertyPath, filePath, line, context);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
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
    } else if (item.endsWith('.ts') && !item.endsWith('.test.ts') && !item.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

console.log('🔍 Validating property access against type definitions...\n');

// Step 1: Build type information
console.log('Step 1: Building type information from type definitions...');
buildTypeInfo();
console.log(`  Found ${typeInfo.size} types\n`);

// Step 2: Scan all simulation files
console.log('Step 2: Scanning simulation files for property access...');
const simulationDir = path.join(__dirname, '../src/simulation');
const files = findTsFiles(simulationDir, ['node_modules', '__tests__']);
console.log(`  Scanning ${files.length} files...\n`);

for (const file of files) {
  scanFile(file);
}

console.log(`Step 3: Analysis complete\n`);
console.log(`  Property accesses found: ${propertyAccesses.length}`);
console.log(`  Validation issues: ${issues.length}\n`);

// Group issues by severity and file
const errors = issues.filter(i => i.severity === 'error');
const warnings = issues.filter(i => i.severity === 'warning');

const errorsByFile = new Map<string, ValidationIssue[]>();
for (const error of errors) {
  if (!errorsByFile.has(error.file)) {
    errorsByFile.set(error.file, []);
  }
  errorsByFile.get(error.file)!.push(error);
}

// Generate report
let report = '# Property Access Validation Report\n\n';
report += `**Generated**: ${new Date().toISOString()}\n\n`;
report += `## Summary\n\n`;
report += `- **Files scanned**: ${files.length}\n`;
report += `- **Property accesses found**: ${propertyAccesses.length}\n`;
report += `- **Errors** (non-existent properties): ${errors.length}\n`;
report += `- **Warnings**: ${warnings.length}\n`;
report += `- **Types validated against**: ${typeInfo.size}\n\n`;

if (errors.length === 0) {
  report += '✅ **No validation errors found!** All property accesses are valid.\n\n';
} else {
  report += `## ❌ Errors (${errors.length})\n\n`;
  report += `Properties accessed in code but don't exist in type definitions:\n\n`;

  for (const [file, fileErrors] of errorsByFile.entries()) {
    report += `### ${file} (${fileErrors.length} errors)\n\n`;
    for (const error of fileErrors) {
      report += `**Line ${error.line}**: ${error.accessedPath}\n`;
      report += `  - ${error.message}\n`;
      report += `  - Context: \`${error.context}\`\n\n`;
    }
  }

  report += `## Quick Fix Suggestions\n\n`;

  // Common patterns
  const resourcesPattern = errors.filter(e => e.accessedPath.includes('resources.'));
  if (resourcesPattern.length > 0) {
    report += `### Replace \`gameState.resources\` with \`gameState.resourceEconomy\`\n\n`;
    report += `Found ${resourcesPattern.length} instances:\n`;
    for (const e of resourcesPattern.slice(0, 10)) {
      report += `- ${e.file}:${e.line}\n`;
    }
    report += '\n';
  }

  // Other common issues
  const issuePatterns = new Map<string, ValidationIssue[]>();
  for (const error of errors) {
    const pathParts = error.accessedPath.split('.');
    if (pathParts.length >= 3) {
      const pattern = pathParts.slice(0, 3).join('.');
      if (!issuePatterns.has(pattern)) {
        issuePatterns.set(pattern, []);
      }
      issuePatterns.get(pattern)!.push(error);
    }
  }

  const frequentIssues = Array.from(issuePatterns.entries())
    .filter(([, issues]) => issues.length > 1)
    .sort((a, b) => b[1].length - a[1].length);

  if (frequentIssues.length > 0) {
    report += `### Other Frequent Issues\n\n`;
    for (const [pattern, patternIssues] of frequentIssues.slice(0, 5)) {
      report += `**${pattern}** (${patternIssues.length} occurrences)\n`;
      report += `  Files: ${Array.from(new Set(patternIssues.map(i => i.file))).slice(0, 5).join(', ')}\n\n`;
    }
  }
}

// Most accessed paths (for reference)
const pathCounts = new Map<string, number>();
for (const access of propertyAccesses) {
  pathCounts.set(access.propertyPath, (pathCounts.get(access.propertyPath) || 0) + 1);
}

const topPaths = Array.from(pathCounts.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30);

report += `## Most Frequently Accessed Properties (Top 30)\n\n`;
report += `For reference - these are the most commonly accessed state properties:\n\n`;
for (const [path, count] of topPaths) {
  report += `- \`${path}\` (${count} times)\n`;
}

const reportPath = path.join(__dirname, '../docs/property-access-validation.md');
fs.writeFileSync(reportPath, report);

// Compact summary
const summary = `PROPERTY ACCESS VALIDATION

SCANNED: ${files.length} files
ACCESSES: ${propertyAccesses.length}
ERRORS: ${errors.length}
TYPES: ${typeInfo.size}

${errors.length === 0 ? '✅ NO ERRORS' : `❌ ${errors.length} NON-EXISTENT PROPERTIES ACCESSED`}

${errors.length > 0 ? `TOP ISSUES:
${Array.from(errorsByFile.entries()).slice(0, 5).map(([f, errs]) => `${f}: ${errs.length} errors`).join('\n')}` : ''}

TOP ACCESSED:
${topPaths.slice(0, 10).map(([p, c]) => `${p} (${c}×)`).join('\n')}
`;

const summaryPath = path.join(__dirname, '../docs/property-access-validation-summary.txt');
fs.writeFileSync(summaryPath, summary);

console.log('✅ Validation complete!\n');
console.log(errors.length === 0 ? '✅ No validation errors found!' : `❌ Found ${errors.length} errors`);
console.log(`📄 Report: docs/property-access-validation.md`);
console.log(`📄 Summary: docs/property-access-validation-summary.txt\n`);

if (errors.length > 0) {
  console.log('Top issues:');
  for (const [file, fileErrors] of Array.from(errorsByFile.entries()).slice(0, 5)) {
    console.log(`  - ${file}: ${fileErrors.length} errors`);
  }
}

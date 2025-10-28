/**
 * Extract Causal Relationships Using Semantic Analysis
 *
 * Uses AST parsing, comment mining, and control flow analysis to extract
 * "X affects Y" relationships from the codebase. This approach captures
 * semantic meaning similar to embeddings without requiring external APIs.
 *
 * Extraction strategies:
 * 1. State mutation analysis (direct writes)
 * 2. Function parameter flow (inputs → outputs)
 * 3. Conditional dependencies (if X then Y)
 * 4. Comment mining (explicit "affects" language)
 * 5. Type propagation tracking
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

interface CausalEdge {
  from: string;
  to: string;
  type: 'direct' | 'conditional' | 'multiplicative' | 'threshold' | 'functional';
  confidence: number;  // 0-1 based on evidence strength
  evidence: {
    file: string;
    line: number;
    context: string;
    method: 'ast' | 'comment' | 'control-flow' | 'type-flow';
  }[];
}

interface SemanticContext {
  functionName: string;
  phase: string;
  systemName: string;
}

const edges: CausalEdge[] = [];
const stateProperties = new Set<string>();

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

function extractPropertyPath(node: ts.Node, sourceFile: ts.SourceFile): string | null {
  // Match: state.system.property or gameState.system.property
  let path: string[] = [];

  function traverse(n: ts.Node): boolean {
    if (ts.isPropertyAccessExpression(n)) {
      if (!traverse(n.expression)) return false;
      path.push(n.name.text);
      return true;
    } else if (ts.isIdentifier(n)) {
      if (n.text === 'state' || n.text === 'gameState') {
        return true;
      }
      path.push(n.text);
      return false;
    }
    return false;
  }

  if (traverse(node)) {
    return path.join('.');
  }
  return null;
}

function analyzeStateMutation(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  context: SemanticContext
): void {
  // Pattern: state.X.Y = f(state.A.B, state.C.D)
  if (ts.isBinaryExpression(node)) {
    const { operatorToken, left, right } = node;

    // Only track assignments
    if (operatorToken.kind !== ts.SyntaxKind.EqualsToken &&
        operatorToken.kind !== ts.SyntaxKind.PlusEqualsToken &&
        operatorToken.kind !== ts.SyntaxKind.MinusEqualsToken &&
        operatorToken.kind !== ts.SyntaxKind.AsteriskEqualsToken) {
      return;
    }

    const target = extractPropertyPath(left, sourceFile);
    if (!target) return;

    stateProperties.add(target);

    // Find all state properties referenced on right side
    const sources = new Set<string>();

    function findStateReferences(n: ts.Node): void {
      const prop = extractPropertyPath(n, sourceFile);
      if (prop && prop !== target) {
        sources.add(prop);
      }
      ts.forEachChild(n, findStateReferences);
    }

    findStateReferences(right);

    // Determine edge type based on operator and right-hand side
    let edgeType: CausalEdge['type'] = 'direct';
    const rightText = right.getText(sourceFile);

    if (rightText.includes('*') || rightText.includes('Math.pow')) {
      edgeType = 'multiplicative';
    }

    // Create edges for each source
    for (const source of sources) {
      addOrUpdateEdge({
        from: source,
        to: target,
        type: edgeType,
        confidence: 0.9,  // AST-based = high confidence
        evidence: [{
          file: path.basename(sourceFile.fileName, '.ts'),
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
          context: node.getText(sourceFile).substring(0, 100),
          method: 'ast'
        }]
      });
    }
  }
}

function analyzeConditionalEffect(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  context: SemanticContext
): void {
  // Pattern: if (state.X.Y > threshold) { state.A.B = ... }
  if (ts.isIfStatement(node)) {
    const condition = node.expression;
    const thenBlock = node.thenStatement;

    // Extract condition variables
    const conditionVars = new Set<string>();
    function findConditionVars(n: ts.Node): void {
      const prop = extractPropertyPath(n, sourceFile);
      if (prop) conditionVars.add(prop);
      ts.forEachChild(n, findConditionVars);
    }
    findConditionVars(condition);

    // Extract mutations in then block
    const mutations = new Set<string>();
    function findMutations(n: ts.Node): void {
      if (ts.isBinaryExpression(n) &&
          n.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
        const target = extractPropertyPath(n.left, sourceFile);
        if (target) mutations.add(target);
      }
      ts.forEachChild(n, findMutations);
    }
    findMutations(thenBlock);

    // Create conditional edges
    for (const condVar of conditionVars) {
      for (const mutation of mutations) {
        if (condVar !== mutation) {
          addOrUpdateEdge({
            from: condVar,
            to: mutation,
            type: 'conditional',
            confidence: 0.85,
            evidence: [{
              file: path.basename(sourceFile.fileName, '.ts'),
              line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
              context: `if (${condition.getText(sourceFile).substring(0, 50)}) → ${mutation}`,
              method: 'control-flow'
            }]
          });
        }
      }
    }
  }
}

function analyzeFunctionFlow(
  node: ts.Node,
  sourceFile: ts.SourceFile,
  context: SemanticContext
): void {
  // Pattern: result = calculateX(state.A.B) ... state.C.D = result
  if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
    const functionName = node.name?.getText(sourceFile) || 'anonymous';

    // Track parameters that reference state
    const inputProps = new Set<string>();
    if (node.parameters) {
      for (const param of node.parameters) {
        if (param.initializer) {
          const prop = extractPropertyPath(param.initializer, sourceFile);
          if (prop) inputProps.add(prop);
        }
      }
    }

    // Track return statement that becomes state mutation
    if (node.body && ts.isBlock(node.body)) {
      node.body.statements.forEach(stmt => {
        if (ts.isReturnStatement(stmt) && stmt.expression) {
          // Find what state properties are used in return
          const returnProps = new Set<string>();
          function findReturnProps(n: ts.Node): void {
            const prop = extractPropertyPath(n, sourceFile);
            if (prop) returnProps.add(prop);
            ts.forEachChild(n, findReturnProps);
          }
          findReturnProps(stmt.expression);

          // Create functional edges
          for (const input of inputProps) {
            for (const output of returnProps) {
              if (input !== output) {
                addOrUpdateEdge({
                  from: input,
                  to: output,
                  type: 'functional',
                  confidence: 0.75,
                  evidence: [{
                    file: path.basename(sourceFile.fileName, '.ts'),
                    line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
                    context: `${functionName}(${input}) → ${output}`,
                    method: 'type-flow'
                  }]
                });
              }
            }
          }
        }
      });
    }
  }
}

function analyzeComments(
  sourceFile: ts.SourceFile
): void {
  const text = sourceFile.getFullText();
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Pattern: "X affects Y" or "X → Y" or "X influences Y"
    const affectsMatch = line.match(/(\w+(?:\.\w+)*)\s+(?:affects?|influences?|→|->|impacts?)\s+(\w+(?:\.\w+)*)/i);
    if (affectsMatch) {
      const [, from, to] = affectsMatch;
      addOrUpdateEdge({
        from,
        to,
        type: 'direct',
        confidence: 0.8,  // Comment-based = medium-high confidence
        evidence: [{
          file: path.basename(sourceFile.fileName, '.ts'),
          line: i + 1,
          context: line.trim(),
          method: 'comment'
        }]
      });
    }

    // Pattern: "If X then Y" or "When X, Y happens"
    const conditionalMatch = line.match(/(?:if|when)\s+(\w+(?:\.\w+)*)\s+.*(?:then|,)\s+(\w+(?:\.\w+)*)/i);
    if (conditionalMatch) {
      const [, from, to] = conditionalMatch;
      addOrUpdateEdge({
        from,
        to,
        type: 'conditional',
        confidence: 0.7,
        evidence: [{
          file: path.basename(sourceFile.fileName, '.ts'),
          line: i + 1,
          context: line.trim(),
          method: 'comment'
        }]
      });
    }
  }
}

function addOrUpdateEdge(edge: CausalEdge): void {
  const key = `${edge.from}→${edge.to}`;
  const existing = edges.find(e => `${e.from}→${e.to}` === key);

  if (existing) {
    // Merge evidence, boost confidence
    existing.evidence.push(...edge.evidence);
    existing.confidence = Math.min(1.0, existing.confidence + 0.1);

    // Upgrade type if we found stronger relationship
    if (edge.type === 'multiplicative' || edge.type === 'threshold') {
      existing.type = edge.type;
    }
  } else {
    edges.push(edge);
  }
}

function analyzeFile(filePath: string): void {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  // Determine semantic context from file path
  const fileName = path.basename(filePath, '.ts');
  const isPhase = filePath.includes('/phases/');
  const context: SemanticContext = {
    functionName: '',
    phase: isPhase ? fileName : '',
    systemName: fileName
  };

  // Comment analysis
  analyzeComments(sourceFile);

  // AST traversal
  function visit(node: ts.Node): void {
    analyzeStateMutation(node, sourceFile, context);
    analyzeConditionalEffect(node, sourceFile, context);
    analyzeFunctionFlow(node, sourceFile, context);

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
}

// Process all simulation files
console.log('🔍 Extracting causal relationships using semantic analysis...\n');

const simulationDir = path.join(__dirname, '../src/simulation');
const files = findTsFiles(simulationDir, ['node_modules', '__tests__']);

console.log(`Analyzing ${files.length} files...\n`);

for (const file of files) {
  analyzeFile(file);
}

console.log(`\n✅ Extracted ${edges.length} causal edges\n`);

// Deduplicate and sort by confidence
const uniqueEdges = Array.from(
  new Map(edges.map(e => [`${e.from}→${e.to}`, e])).values()
).sort((a, b) => b.confidence - a.confidence);

console.log(`📊 Unique edges: ${uniqueEdges.size}\n`);

// Build graph statistics
const outDegree = new Map<string, number>();
const inDegree = new Map<string, number>();

for (const edge of uniqueEdges) {
  outDegree.set(edge.from, (outDegree.get(edge.from) || 0) + 1);
  inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
}

const topInfluencers = Array.from(outDegree.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20);

const topTargets = Array.from(inDegree.entries())
  .sort((a, b) => b[1] - a[1])
  .slice(0, 20);

// Generate outputs
const outputDir = path.join(__dirname, '../docs');

// 1. Full edge list with evidence
let fullOutput = '# Causal Relationships (Semantic Analysis)\n\n';
fullOutput += `**Extraction Method**: AST parsing + comment mining + control flow analysis\n`;
fullOutput += `**Total Edges**: ${uniqueEdges.length}\n`;
fullOutput += `**Confidence Range**: ${Math.min(...uniqueEdges.map(e => e.confidence)).toFixed(2)} - ${Math.max(...uniqueEdges.map(e => e.confidence)).toFixed(2)}\n\n`;

fullOutput += '## High-Confidence Edges (≥0.85)\n\n';
const highConfidence = uniqueEdges.filter(e => e.confidence >= 0.85);
for (const edge of highConfidence) {
  fullOutput += `**${edge.from} → ${edge.to}** (${edge.type}, conf: ${edge.confidence.toFixed(2)})\n`;
  for (const ev of edge.evidence.slice(0, 2)) {
    fullOutput += `  - ${ev.method}: ${ev.context.substring(0, 80)} (${ev.file}:${ev.line})\n`;
  }
  fullOutput += '\n';
}

fullOutput += '\n## Medium-Confidence Edges (0.7-0.85)\n\n';
const mediumConfidence = uniqueEdges.filter(e => e.confidence >= 0.7 && e.confidence < 0.85);
for (const edge of mediumConfidence.slice(0, 50)) {
  fullOutput += `${edge.from} → ${edge.to} (${edge.type})\n`;
}
if (mediumConfidence.length > 50) {
  fullOutput += `\n... +${mediumConfidence.length - 50} more\n`;
}

fs.writeFileSync(path.join(outputDir, 'causal-relationships-semantic.md'), fullOutput);

// 2. Compact edge list
let compact = '# Causal Edges (Semantic Analysis - Compact)\n\n';
compact += `## Top Influencers (affects many)\n`;
for (const [node, degree] of topInfluencers) {
  compact += `${node} → ${degree} targets\n`;
}
compact += '\n## Top Targets (affected by many)\n';
for (const [node, degree] of topTargets) {
  compact += `${node} ← ${degree} sources\n`;
}
compact += '\n## All Edges (by confidence)\n';
for (const edge of uniqueEdges) {
  compact += `${edge.from} → ${edge.to} [${edge.type}, ${edge.confidence.toFixed(2)}]\n`;
}

fs.writeFileSync(path.join(outputDir, 'causal-edges-semantic.txt'), compact);

// 3. JSON for programmatic use
const graphData = {
  metadata: {
    extractionMethod: 'semantic-analysis',
    timestamp: new Date().toISOString(),
    totalEdges: uniqueEdges.length,
    filesAnalyzed: files.length,
    confidenceRange: {
      min: Math.min(...uniqueEdges.map(e => e.confidence)),
      max: Math.max(...uniqueEdges.map(e => e.confidence))
    }
  },
  nodes: Array.from(new Set([
    ...Array.from(outDegree.keys()),
    ...Array.from(inDegree.keys())
  ])).map(id => ({
    id,
    outDegree: outDegree.get(id) || 0,
    inDegree: inDegree.get(id) || 0
  })),
  edges: uniqueEdges.map(e => ({
    from: e.from,
    to: e.to,
    type: e.type,
    confidence: e.confidence,
    evidenceCount: e.evidence.length,
    sources: e.evidence.map(ev => ({
      file: ev.file,
      line: ev.line,
      method: ev.method
    }))
  })),
  statistics: {
    byType: {
      direct: uniqueEdges.filter(e => e.type === 'direct').length,
      conditional: uniqueEdges.filter(e => e.type === 'conditional').length,
      multiplicative: uniqueEdges.filter(e => e.type === 'multiplicative').length,
      threshold: uniqueEdges.filter(e => e.type === 'threshold').length,
      functional: uniqueEdges.filter(e => e.type === 'functional').length
    },
    byConfidence: {
      high: highConfidence.length,
      medium: mediumConfidence.length,
      low: uniqueEdges.filter(e => e.confidence < 0.7).length
    },
    topInfluencers: topInfluencers.slice(0, 10).map(([node, degree]) => ({ node, degree })),
    topTargets: topTargets.slice(0, 10).map(([node, degree]) => ({ node, degree }))
  }
};

fs.writeFileSync(
  path.join(outputDir, 'causal-graph-semantic.json'),
  JSON.stringify(graphData, null, 2)
);

// 4. LLM-optimized summary
const llmSummary = `CAUSAL GRAPH (Semantic Analysis)

EXTRACTION: AST + comments + control-flow + type-flow
EDGES: ${uniqueEdges.length} (${highConfidence.length} high-conf, ${mediumConfidence.length} medium-conf)
CONFIDENCE RANGE: ${graphData.metadata.confidenceRange.min.toFixed(2)}-${graphData.metadata.confidenceRange.max.toFixed(2)}

TOP INFLUENCERS:
${topInfluencers.slice(0, 10).map(([n, d]) => `- ${n} → ${d}`).join('\n')}

TOP TARGETS:
${topTargets.slice(0, 10).map(([n, d]) => `- ${n} ← ${d}`).join('\n')}

EDGE TYPES:
- Direct: ${graphData.statistics.byType.direct}
- Conditional: ${graphData.statistics.byType.conditional}
- Multiplicative: ${graphData.statistics.byType.multiplicative}
- Threshold: ${graphData.statistics.byType.threshold}
- Functional: ${graphData.statistics.byType.functional}

HIGH-CONFIDENCE EDGES (sample):
${highConfidence.slice(0, 10).map(e => `${e.from} → ${e.to} [${e.type}]`).join('\n')}
`;

fs.writeFileSync(path.join(outputDir, 'causal-graph-semantic-summary.txt'), llmSummary);

// Output summary
console.log('✅ Semantic causal graph extraction complete!\n');
console.log('Output files:');
console.log(`  1. causal-relationships-semantic.md - Detailed edges with evidence`);
console.log(`  2. causal-edges-semantic.txt - Compact edge list`);
console.log(`  3. causal-graph-semantic.json - Graph data with metadata`);
console.log(`  4. causal-graph-semantic-summary.txt - LLM summary\n`);

console.log(`Statistics:`);
console.log(`  - ${uniqueEdges.length} causal edges extracted`);
console.log(`  - ${highConfidence.length} high-confidence (≥0.85)`);
console.log(`  - ${mediumConfidence.length} medium-confidence (0.7-0.85)`);
console.log(`  - ${graphData.nodes.length} nodes in graph`);
console.log(`  - Top influencer: ${topInfluencers[0]?.[0] || 'N/A'} (${topInfluencers[0]?.[1] || 0} edges)`);
console.log(`  - Top target: ${topTargets[0]?.[0] || 'N/A'} (${topTargets[0]?.[1] || 0} edges)\n`);

/**
 * Generate Causal Dependency Graph
 *
 * Extracts "X affects Y" relationships from codebase to build edge list.
 * Analyzes state mutations, function dependencies, and conditional logic.
 */

import * as fs from 'fs';
import * as path from 'path';

interface Edge {
  from: string;
  to: string;
  type: 'direct' | 'conditional' | 'multiplicative' | 'threshold';
  context: string;
  file: string;
  line: number;
}

interface CriticalPath {
  goal: string;
  requirements: string[];
  confidence: 'known' | 'inferred';
}

const edges: Edge[] = [];
const criticalPaths: CriticalPath[] = [];

// Known critical paths from documentation
criticalPaths.push({
  goal: 'Utopia',
  requirements: [
    '6 upward spirals active for 12+ months',
    'sustainability >= 65%',
    'no active crises',
    'QoL metrics above thresholds'
  ],
  confidence: 'known'
});

criticalPaths.push({
  goal: 'Defensive AI Deployment',
  requirements: [
    'AI capability > threshold',
    'misaligned AI detected',
    'government approval',
    'adequate funding'
  ],
  confidence: 'known'
});

criticalPaths.push({
  goal: 'Extinction',
  requirements: [
    'population < 10K',
    'OR mortality > 99.99%',
    'OR instant kill (grey goo)',
    'OR slow collapse (24-120 months)'
  ],
  confidence: 'known'
});

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

function extractEdgesFromFile(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const fileName = path.basename(filePath, '.ts');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Pattern: state.X.Y = state.A.B * factor
    const multMatch = line.match(/state\.(\w+)\.(\w+)\s*[=+\-*/]=\s*.*state\.(\w+)\.(\w+)\s*\*\s*([\d.]+)/);
    if (multMatch) {
      const [, toSystem, toProp, fromSystem, fromProp] = multMatch;
      edges.push({
        from: `${fromSystem}.${fromProp}`,
        to: `${toSystem}.${toProp}`,
        type: 'multiplicative',
        context: line.trim(),
        file: fileName,
        line: i + 1
      });
    }

    // Pattern: state.X.Y = state.A.B + delta
    const directMatch = line.match(/state\.(\w+)\.(\w+)\s*[=+\-]=\s*.*state\.(\w+)\.(\w+)/);
    if (directMatch && !multMatch) {
      const [, toSystem, toProp, fromSystem, fromProp] = multMatch || directMatch;
      edges.push({
        from: `${fromSystem}.${fromProp}`,
        to: `${toSystem}.${toProp}`,
        type: 'direct',
        context: line.trim(),
        file: fileName,
        line: i + 1
      });
    }

    // Pattern: if (state.X.Y > threshold) { ... state.A.B = ... }
    const thresholdMatch = line.match(/if\s*\(.*state\.(\w+)\.(\w+)\s*[><]=?\s*([\d.]+)/);
    if (thresholdMatch && i + 5 < lines.length) {
      const [, system, prop, threshold] = thresholdMatch;
      // Look ahead for state mutations in the conditional block
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const conditionalLine = lines[j];
        if (conditionalLine.includes('}')) break;

        const mutationMatch = conditionalLine.match(/state\.(\w+)\.(\w+)\s*=/);
        if (mutationMatch) {
          const [, targetSystem, targetProp] = mutationMatch;
          edges.push({
            from: `${system}.${prop}`,
            to: `${targetSystem}.${targetProp}`,
            type: 'threshold',
            context: `if ${system}.${prop} > ${threshold} → ${targetSystem}.${targetProp}`,
            file: fileName,
            line: i + 1
          });
        }
      }
    }

    // Pattern: function updates based on input
    const funcCallMatch = line.match(/(\w+)\s*=\s*(\w+)\((.*state\.(\w+)\.(\w+).*)\)/);
    if (funcCallMatch) {
      const [, target, funcName, , system, prop] = funcCallMatch;
      edges.push({
        from: `${system}.${prop}`,
        to: target,
        type: 'direct',
        context: `${funcName}(${system}.${prop})`,
        file: fileName,
        line: i + 1
      });
    }

    // Pattern: Comments describing relationships
    const relationComment = line.match(/\/\/.*(\w+)\s+affects?\s+(\w+)/i);
    if (relationComment) {
      const [, from, to] = relationComment;
      edges.push({
        from,
        to,
        type: 'direct',
        context: line.trim(),
        file: fileName,
        line: i + 1
      });
    }
  }
}

// Process simulation files
const simulationDir = path.join(__dirname, '../src/simulation');
const files = findTsFiles(simulationDir, ['node_modules']);

console.log(`Analyzing ${files.length} files for causal relationships...\n`);

for (const file of files) {
  extractEdgesFromFile(file);
}

console.log(`Found ${edges.length} edges\n`);

// Deduplicate edges
const uniqueEdges = new Map<string, Edge>();
for (const edge of edges) {
  const key = `${edge.from}→${edge.to}`;
  if (!uniqueEdges.has(key)) {
    uniqueEdges.set(key, edge);
  }
}

console.log(`Unique edges: ${uniqueEdges.size}\n`);

// Build adjacency list
const graph = new Map<string, Set<string>>();
for (const edge of uniqueEdges.values()) {
  if (!graph.has(edge.from)) {
    graph.set(edge.from, new Set());
  }
  graph.get(edge.from)!.add(edge.to);
}

// Find most influential nodes (highest out-degree)
const outDegree = Array.from(graph.entries())
  .map(([node, targets]) => ({ node, degree: targets.size }))
  .sort((a, b) => b.degree - a.degree);

// Find most affected nodes (highest in-degree)
const inDegree = new Map<string, number>();
for (const edge of uniqueEdges.values()) {
  inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
}
const mostAffected = Array.from(inDegree.entries())
  .map(([node, degree]) => ({ node, degree }))
  .sort((a, b) => b.degree - a.degree);

// Generate outputs

// 1. Ultra-compact edge list
let compactEdges = '# Causal Edges (Most Important)\n\n';
compactEdges += '## High-Impact Sources (affects many)\n';
for (const { node, degree } of outDegree.slice(0, 20)) {
  compactEdges += `${node} → ${degree} targets\n`;
}
compactEdges += '\n## High-Impact Targets (affected by many)\n';
for (const { node, degree } of mostAffected.slice(0, 20)) {
  compactEdges += `${node} ← ${degree} sources\n`;
}

const compactPath = path.join(__dirname, '../docs/causal-edges-compact.txt');
fs.writeFileSync(compactPath, compactEdges);

// 2. Full edge list
let fullEdges = '# Complete Causal Edge List\n\n';
fullEdges += `Total edges: ${uniqueEdges.size}\n`;
fullEdges += `Nodes: ${graph.size}\n\n`;

// Group by type
const byType = {
  direct: [] as Edge[],
  multiplicative: [] as Edge[],
  threshold: [] as Edge[],
  conditional: [] as Edge[]
};

for (const edge of uniqueEdges.values()) {
  byType[edge.type].push(edge);
}

for (const [type, edgeList] of Object.entries(byType)) {
  if (edgeList.length === 0) continue;
  fullEdges += `## ${type.toUpperCase()} (${edgeList.length})\n\n`;
  for (const edge of edgeList.slice(0, 50)) {
    fullEdges += `${edge.from} → ${edge.to}\n`;
    fullEdges += `  ${edge.context}\n`;
    fullEdges += `  (${edge.file}:${edge.line})\n\n`;
  }
  if (edgeList.length > 50) {
    fullEdges += `... +${edgeList.length - 50} more\n\n`;
  }
}

const fullPath = path.join(__dirname, '../docs/causal-edges-full.txt');
fs.writeFileSync(fullPath, fullEdges);

// 3. Critical paths
let paths = '# Critical Paths\n\n';
for (const path of criticalPaths) {
  paths += `## ${path.goal} (${path.confidence})\n\n`;
  for (const req of path.requirements) {
    paths += `- ${req}\n`;
  }
  paths += '\n';
}

// Add inferred paths
paths += '## INFERRED PATHS\n\n';
paths += '### Dystopia Paths\n';
paths += '- High control + low trust → Control Dystopia\n';
paths += '- High automation + meaning crisis → Social Collapse\n';
paths += '- Fossil industry capture + climate crisis → Environmental Collapse\n';
paths += '\n';

paths += '### Crisis Cascades\n';
paths += '- Famine → Migration → Conflict → Nuclear Risk\n';
paths += '- Climate → Wet-bulb → Habitability Loss → Migration\n';
paths += '- Ocean Acidification → Fishery Collapse → Famine\n';
paths += '- Phosphorus Depletion → Agricultural Collapse → Famine\n';
paths += '\n';

paths += '### Upward Spirals (Utopia Path)\n';
paths += '- Abundance: Prosperity → Trust → Stability → More Prosperity\n';
paths += '- Cognitive: Trust → Risk-taking → Breakthroughs → More Trust\n';
paths += '- Democratic: Trust + Institutions → AI Rights → Legitimacy\n';
paths += '- Scientific: Research → Breakthroughs → Capabilities → More Research\n';
paths += '- Meaning: Purpose → Social Flourishing → Stability\n';
paths += '- Ecological: Tech → Environmental Recovery → Sustainability\n';
paths += '\n';

paths += '### Technology Unlock Paths\n';
paths += '- AI Capability > 2.0 → Advanced research breakthroughs\n';
paths += '- Fusion Materials + Plasma Control → Fusion Energy\n';
paths += '- Scalable Oversight + Mechanistic Interp → Alignment Confidence\n';
paths += '- Habitat Restoration → Biosphere Recovery (25% → 100%)\n';
paths += '\n';

const pathsFile = path.join(__dirname, '../docs/critical-paths.txt');
fs.writeFileSync(pathsFile, paths);

// 4. JSON graph for programmatic use
const graphJson = {
  nodes: Array.from(graph.keys()).map(id => ({ id })),
  edges: Array.from(uniqueEdges.values()).map(e => ({
    source: e.from,
    target: e.to,
    type: e.type,
    file: e.file,
    line: e.line
  })),
  statistics: {
    totalEdges: uniqueEdges.size,
    totalNodes: graph.size,
    maxOutDegree: outDegree[0]?.degree || 0,
    maxInDegree: mostAffected[0]?.degree || 0,
    byType: {
      direct: byType.direct.length,
      multiplicative: byType.multiplicative.length,
      threshold: byType.threshold.length,
      conditional: byType.conditional.length
    }
  }
};

const jsonPath = path.join(__dirname, '../docs/causal-graph.json');
fs.writeFileSync(jsonPath, JSON.stringify(graphJson, null, 2));

// 5. LLM-optimized summary
const llmSummary = `CAUSAL GRAPH SUMMARY

STRUCTURE:
- ${uniqueEdges.size} causal edges
- ${graph.size} nodes
- Max out-degree: ${outDegree[0]?.degree || 0} (${outDegree[0]?.node || 'N/A'})
- Max in-degree: ${mostAffected[0]?.degree || 0} (${mostAffected[0]?.node || 'N/A'})

EDGE TYPES:
- Direct: ${byType.direct.length} (A affects B directly)
- Multiplicative: ${byType.multiplicative.length} (A scales B)
- Threshold: ${byType.threshold.length} (A triggers B at threshold)
- Conditional: ${byType.conditional.length} (A enables B if condition)

TOP INFLUENCERS (affect many):
${outDegree.slice(0, 10).map(n => `- ${n.node} → ${n.degree}`).join('\n')}

TOP TARGETS (affected by many):
${mostAffected.slice(0, 10).map(n => `- ${n.node} ← ${n.degree}`).join('\n')}

CRITICAL PATH TO UTOPIA:
1. Activate 6 upward spirals (Abundance, Cognitive, Democratic, Scientific, Meaning, Ecological)
2. Sustain for 12+ months
3. Achieve sustainability >= 65%
4. No active crises
5. QoL metrics above thresholds

RARE: Utopia rarely achieved (usually indicates bug when it happens)
`;

const llmPath = path.join(__dirname, '../docs/causal-graph-summary.txt');
fs.writeFileSync(llmPath, llmSummary);

// Output summary
console.log('✅ Causal graph generation complete!\n');
console.log('Output files:');
console.log(`  1. causal-edges-compact.txt (${(fs.statSync(compactPath).size / 1024).toFixed(1)}KB) - Top influencers/targets`);
console.log(`  2. causal-edges-full.txt (${(fs.statSync(fullPath).size / 1024).toFixed(1)}KB) - All edges with context`);
console.log(`  3. critical-paths.txt (${(fs.statSync(pathsFile).size / 1024).toFixed(1)}KB) - Paths to outcomes`);
console.log(`  4. causal-graph.json (${(fs.statSync(jsonPath).size / 1024).toFixed(1)}KB) - Graph data`);
console.log(`  5. causal-graph-summary.txt (${(fs.statSync(llmPath).size).toFixed(0)} bytes) - LLM summary\n`);

console.log(`Statistics:`);
console.log(`  - ${uniqueEdges.size} unique causal edges`);
console.log(`  - ${graph.size} nodes in graph`);
console.log(`  - ${byType.direct.length} direct effects`);
console.log(`  - ${byType.multiplicative.length} multiplicative effects`);
console.log(`  - ${byType.threshold.length} threshold effects`);
console.log(`  - ${byType.conditional.length} conditional effects\n`);

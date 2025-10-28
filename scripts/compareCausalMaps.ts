/**
 * Compare Manual Causal Map vs Semantic Extraction
 *
 * Validates manually-curated causal map (docs/CAUSAL_MAP.md) against
 * semantic extraction results (docs/causal-graph-semantic.json).
 *
 * Outputs:
 * 1. Validated edges (appear in both)
 * 2. Novel discoveries (semantic only)
 * 3. Missing edges (manual only - may need better extraction)
 */

import * as fs from 'fs';
import * as path from 'path';

interface SemanticEdge {
  from: string;
  to: string;
  type: string;
  confidence: number;
  evidenceCount: number;
}

interface ManualEdge {
  from: string;
  to: string;
  type: string;
  description: string;
  source: string;  // Which section of CAUSAL_MAP.md
}

// Load semantic extraction results
const semanticPath = path.join(__dirname, '../docs/causal-graph-semantic.json');
const semanticData = JSON.parse(fs.readFileSync(semanticPath, 'utf-8'));
const semanticEdges: SemanticEdge[] = semanticData.edges;

// Parse manual causal map
const manualPath = path.join(__dirname, '../docs/CAUSAL_MAP.md');
const manualText = fs.readFileSync(manualPath, 'utf-8');
const manualEdges: ManualEdge[] = [];

// Extract edges from manual map using various patterns
const lines = manualText.split('\n');
let currentSection = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Track current section
  if (line.startsWith('##')) {
    currentSection = line.replace(/^#+\s*/, '');
  }

  // Pattern: A → B (various formats)
  const arrowMatch = line.match(/(\w+(?:\.\w+)*)\s*→\s*(\w+(?:\.\w+)*)/);
  if (arrowMatch) {
    const [, from, to] = arrowMatch;
    manualEdges.push({
      from,
      to,
      type: 'direct',
      description: line.trim(),
      source: currentSection
    });
  }

  // Pattern: A affects B
  const affectsMatch = line.match(/(\w+(?:\.\w+)*)\s+affects?\s+(\w+(?:\.\w+)*)/i);
  if (affectsMatch && !arrowMatch) {
    const [, from, to] = affectsMatch;
    manualEdges.push({
      from,
      to,
      type: 'direct',
      description: line.trim(),
      source: currentSection
    });
  }

  // Pattern: if X then Y
  const conditionalMatch = line.match(/if\s+(\w+(?:\.\w+)*)[^→]*→\s*(\w+(?:\.\w+)*)/i);
  if (conditionalMatch) {
    const [, from, to] = conditionalMatch;
    manualEdges.push({
      from,
      to,
      type: 'conditional',
      description: line.trim(),
      source: currentSection
    });
  }
}

console.log(`\n📊 Causal Map Comparison\n`);
console.log(`Manual map edges: ${manualEdges.length}`);
console.log(`Semantic edges: ${semanticEdges.length}\n`);

// Normalize edge keys for comparison
function normalizeKey(from: string, to: string): string {
  // Handle variations like "AI" vs "ai", "Climate" vs "climate"
  return `${from.toLowerCase()}→${to.toLowerCase()}`;
}

const semanticMap = new Map<string, SemanticEdge>();
for (const edge of semanticEdges) {
  const key = normalizeKey(edge.from, edge.to);
  if (!semanticMap.has(key) || (semanticMap.get(key)?.confidence || 0) < edge.confidence) {
    semanticMap.set(key, edge);
  }
}

const manualMap = new Map<string, ManualEdge[]>();
for (const edge of manualEdges) {
  const key = normalizeKey(edge.from, edge.to);
  if (!manualMap.has(key)) {
    manualMap.set(key, []);
  }
  manualMap.get(key)!.push(edge);
}

// 1. Validated edges (appear in both)
const validated: Array<{
  from: string;
  to: string;
  semanticConfidence: number;
  manualSource: string;
}> = [];

for (const [key, manualList] of manualMap.entries()) {
  if (semanticMap.has(key)) {
    const semantic = semanticMap.get(key)!;
    validated.push({
      from: semantic.from,
      to: semantic.to,
      semanticConfidence: semantic.confidence,
      manualSource: manualList[0].source
    });
  }
}

// 2. Novel discoveries (semantic only, high confidence)
const novel = semanticEdges.filter(edge => {
  const key = normalizeKey(edge.from, edge.to);
  return !manualMap.has(key) && edge.confidence >= 0.85;
}).sort((a, b) => b.confidence - a.confidence);

// 3. Missing edges (manual only)
const missing: ManualEdge[] = [];
for (const [key, manualList] of manualMap.entries()) {
  if (!semanticMap.has(key)) {
    missing.push(...manualList);
  }
}

// Generate report
let report = '# Causal Map Comparison Report\n\n';
report += `**Generated**: ${new Date().toISOString()}\n\n`;
report += `## Summary\n\n`;
report += `- **Manual map edges**: ${manualEdges.length}\n`;
report += `- **Semantic extraction edges**: ${semanticEdges.length}\n`;
report += `- **Validated edges** (in both): ${validated.length}\n`;
report += `- **Novel discoveries** (semantic only, conf ≥0.85): ${novel.length}\n`;
report += `- **Missing from extraction**: ${missing.length}\n`;
report += `- **Validation rate**: ${((validated.length / manualEdges.length) * 100).toFixed(1)}%\n\n`;

report += `## 1. Validated Edges (Appear in Both)\n\n`;
report += `These edges from the manual map are confirmed by semantic analysis:\n\n`;
for (const edge of validated.slice(0, 30)) {
  report += `- **${edge.from} → ${edge.to}** (conf: ${edge.semanticConfidence.toFixed(2)}, source: ${edge.manualSource})\n`;
}
if (validated.length > 30) {
  report += `\n... +${validated.length - 30} more validated edges\n`;
}

report += `\n## 2. Novel Discoveries (Semantic Analysis Only)\n\n`;
report += `High-confidence edges found by semantic analysis but not in manual map:\n\n`;
for (const edge of novel.slice(0, 50)) {
  report += `- **${edge.from} → ${edge.to}** (${edge.type}, conf: ${edge.confidence.toFixed(2)})\n`;
}
if (novel.length > 50) {
  report += `\n... +${novel.length - 50} more discoveries\n`;
}

report += `\n## 3. Missing from Semantic Extraction\n\n`;
report += `Edges in manual map not found by semantic analysis (may need better extraction or are high-level abstractions):\n\n`;

// Group by section
const missingBySection = new Map<string, ManualEdge[]>();
for (const edge of missing) {
  if (!missingBySection.has(edge.source)) {
    missingBySection.set(edge.source, []);
  }
  missingBySection.get(edge.source)!.push(edge);
}

for (const [section, edges] of missingBySection.entries()) {
  report += `\n### ${section}\n\n`;
  for (const edge of edges.slice(0, 20)) {
    report += `- ${edge.from} → ${edge.to}: ${edge.description.substring(0, 80)}\n`;
  }
  if (edges.length > 20) {
    report += `\n... +${edges.length - 20} more\n`;
  }
}

report += `\n## 4. Recommendations\n\n`;
report += `### Add to Manual Map (High-Confidence Novel Discoveries)\n\n`;
const toAdd = novel.filter(e =>
  !e.from.match(/^\d+(\.\d+)?$/) &&  // Not a literal number
  !e.to.match(/^\d+(\.\d+)?$/) &&
  !['more', 'from', 'not', 'trust', 'points', 'loss'].includes(e.to) &&  // Not generic variable
  e.confidence >= 0.90
).slice(0, 20);

for (const edge of toAdd) {
  report += `- ${edge.from} → ${edge.to} (${edge.type})\n`;
}

report += `\n### Improve Semantic Extraction For\n\n`;
const toImprove = Array.from(new Set(missing.map(e => e.source))).slice(0, 10);
for (const section of toImprove) {
  const count = missingBySection.get(section)?.length || 0;
  report += `- ${section} (${count} edges missing)\n`;
}

report += `\n## 5. Key Insights\n\n`;
report += `**Strengths of semantic extraction:**\n`;
report += `- Captures direct state mutations with high confidence\n`;
report += `- Finds conditional relationships through control flow\n`;
report += `- Discovers multiplicative effects (Math operations)\n`;
report += `- Evidence-based (cites file and line number)\n\n`;

report += `**Strengths of manual map:**\n`;
report += `- Captures high-level causal chains (multi-step)\n`;
report += `- Documents emergent behaviors and cascades\n`;
report += `- Explains mechanism (WHY not just WHAT)\n`;
report += `- Domain expertise on threshold effects\n\n`;

report += `**Best approach:**\n`;
report += `- Use semantic extraction to validate manual map\n`;
report += `- Add high-confidence novel discoveries to manual map\n`;
report += `- Keep manual map for high-level insights semantic analysis can't capture\n`;

const reportPath = path.join(__dirname, '../docs/causal-map-comparison.md');
fs.writeFileSync(reportPath, report);

// Also output compact comparison
let compact = `CAUSAL MAP COMPARISON (LLM Summary)

COVERAGE:
- Manual edges: ${manualEdges.length}
- Semantic edges: ${semanticEdges.length}
- Validated: ${validated.length} (${((validated.length / manualEdges.length) * 100).toFixed(1)}%)
- Novel discoveries: ${novel.length}
- Missing from extraction: ${missing.length}

TOP VALIDATED:
${validated.slice(0, 10).map(e => `${e.from} → ${e.to} [${e.semanticConfidence.toFixed(2)}]`).join('\n')}

TOP NOVEL DISCOVERIES:
${novel.slice(0, 10).map(e => `${e.from} → ${e.to} [${e.type}, ${e.confidence.toFixed(2)}]`).join('\n')}

MISSING SECTIONS (need better extraction):
${Array.from(missingBySection.entries()).slice(0, 5).map(([sec, edges]) => `${sec}: ${edges.length} edges`).join('\n')}
`;

const compactPath = path.join(__dirname, '../docs/causal-map-comparison-summary.txt');
fs.writeFileSync(compactPath, compact);

console.log('✅ Comparison complete!\n');
console.log(`Validated: ${validated.length}/${manualEdges.length} (${((validated.length / manualEdges.length) * 100).toFixed(1)}%)`);
console.log(`Novel discoveries: ${novel.length} (high-confidence)`);
console.log(`Missing: ${missing.length}\n`);
console.log('Output files:');
console.log('  - docs/causal-map-comparison.md (detailed)');
console.log('  - docs/causal-map-comparison-summary.txt (compact)\n');

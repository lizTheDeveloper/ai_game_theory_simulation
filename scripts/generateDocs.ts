/**
 * Generate Token-Efficient Documentation
 *
 * Reads underdocumented.json and generates concise, LLM-focused documentation
 * for interfaces, types, and functions.
 *
 * Documentation principles:
 * - One sentence (preferred) or two max
 * - Explains WHAT and WHY (not HOW - code does that)
 * - Token-efficient (no fluff, no examples unless critical)
 * - Structured: [Purpose]. [Key constraint/range]. [Usage context].
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

interface GeneratedDoc {
  item: UnderdocumentedItem;
  suggestedDoc: string;
  confidence: 'high' | 'medium' | 'low';
}

// Read the underdocumented items
const inputPath = path.join(__dirname, '../docs/underdocumented.json');
const items: UnderdocumentedItem[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

// Filter to critical items (interfaces/types without docs)
const critical = items.filter(item =>
  (item.type === 'interface' || item.type === 'type') &&
  item.currentDoc === '(none)'
);

console.log(`Generating documentation for ${critical.length} critical items...\n`);

const generated: GeneratedDoc[] = [];

// Generate docs based on naming patterns and file context
function generateDoc(item: UnderdocumentedItem): GeneratedDoc {
  const { name, file, context } = item;
  const fileName = path.basename(file, '.ts');

  let doc = '';
  let confidence: 'high' | 'medium' | 'low' = 'medium';

  // Pattern-based generation
  if (name.endsWith('State')) {
    doc = `Runtime state for ${name.replace('State', '').replace(/([A-Z])/g, ' $1').trim().toLowerCase()} system. Tracks current values and active conditions.`;
    confidence = 'high';
  } else if (name.endsWith('System')) {
    doc = `${name.replace('System', '').replace(/([A-Z])/g, ' $1').trim()} system state. Manages related components and their interactions.`;
    confidence = 'high';
  } else if (name.endsWith('Config')) {
    doc = `Configuration for ${name.replace('Config', '').replace(/([A-Z])/g, ' $1').trim().toLowerCase()}. Defines parameters and thresholds.`;
    confidence = 'high';
  } else if (name.endsWith('Capability')) {
    doc = `${name.replace('Capability', '').replace(/([A-Z])/g, ' $1').trim()} capability metrics. Measures effectiveness and capacity.`;
    confidence = 'high';
  } else if (name.endsWith('Agent')) {
    doc = `Agent representing ${name.replace('Agent', '').replace(/([A-Z])/g, ' $1').trim().toLowerCase()} in simulation. Makes decisions based on state and preferences.`;
    confidence = 'high';
  } else if (name.endsWith('Metrics')) {
    doc = `Performance metrics for ${name.replace('Metrics', '').replace(/([A-Z])/g, ' $1').trim().toLowerCase()}. Aggregated measurements and indicators.`;
    confidence = 'high';
  } else if (name.includes('Accumulation')) {
    doc = `Tracks accumulating ${name.replace('Accumulation', '').replace(/([A-Z])/g, ' $1').trim().toLowerCase()} costs over time. Hidden during prosperity, manifests at thresholds.`;
    confidence = 'high';
  } else if (name.includes('Decision')) {
    doc = `Decision-making structure for ${fileName.replace(/-/g, ' ')}. Defines choices and their outcomes.`;
    confidence = 'medium';
  } else if (name.includes('Parameters')) {
    doc = `Parameters for ${fileName.replace(/-/g, ' ')}. Configures behavior and constraints.`;
    confidence = 'medium';
  } else if (name.includes('Settings')) {
    doc = `Settings for ${fileName.replace(/-/g, ' ')}. User-configurable options and preferences.`;
    confidence = 'medium';
  }

  // File-based context
  if (!doc) {
    if (fileName.includes('government')) {
      doc = `${name} interface for government system. Tracks political state and decision-making.`;
      confidence = 'medium';
    } else if (fileName.includes('ai-')) {
      doc = `${name} for AI agent system. Defines AI-related state and capabilities.`;
      confidence = 'medium';
    } else if (fileName.includes('climate') || fileName.includes('environmental')) {
      doc = `${name} for climate/environmental modeling. Tracks ecological metrics and impacts.`;
      confidence = 'medium';
    } else if (fileName.includes('economic')) {
      doc = `${name} for economic system. Models resource allocation and market dynamics.`;
      confidence = 'medium';
    } else if (fileName.includes('social')) {
      doc = `${name} for social systems. Tracks cohesion, trust, and community dynamics.`;
      confidence = 'medium';
    }
  }

  // Specific name patterns
  if (!doc) {
    if (name === 'AIAgent') {
      doc = 'Individual AI agent in simulation. Heterogeneous population (20 agents) with varying alignment, capabilities, and lifecycle states.';
      confidence = 'high';
    } else if (name === 'DecisionMaker') {
      doc = 'Entity capable of making decisions in simulation. Includes AI agents, government, and organizations.';
      confidence = 'high';
    } else if (name === 'SocialAccumulation') {
      doc = 'Tracks social costs accumulating from rapid automation. Meaning crisis, institutional erosion, social fragmentation manifest at thresholds.';
      confidence = 'high';
    } else if (name === 'ScenarioParameters') {
      doc = 'Scenario-specific parameters for Monte Carlo runs. Defines initial conditions and modifiers.';
      confidence = 'high';
    } else if (name === 'ConfigurationSettings') {
      doc = 'Global simulation configuration. Includes RNG seed, scenario mode, feature flags, and system toggles.';
      confidence = 'high';
    }
  }

  // Fallback
  if (!doc) {
    doc = `${name} interface. [NEEDS MANUAL DOCUMENTATION - see ${fileName}.ts for context]`;
    confidence = 'low';
  }

  return { item, suggestedDoc: doc, confidence };
}

// Generate for all critical items
for (const item of critical) {
  generated.push(generateDoc(item));
}

// Report by confidence
const high = generated.filter(g => g.confidence === 'high');
const medium = generated.filter(g => g.confidence === 'medium');
const low = generated.filter(g => g.confidence === 'low');

console.log(`Generated documentation:`);
console.log(`  ${high.length} high-confidence suggestions`);
console.log(`  ${medium.length} medium-confidence suggestions`);
console.log(`  ${low.length} low-confidence suggestions (need manual review)\n`);

// Show samples
console.log(`\n=== HIGH CONFIDENCE SAMPLES ===\n`);
for (const g of high.slice(0, 10)) {
  const relPath = g.item.file.replace(process.cwd() + '/', '');
  console.log(`${g.item.type.toUpperCase()} ${g.item.name}`);
  console.log(`  File: ${relPath}:${g.item.line}`);
  console.log(`  Suggested: ${g.suggestedDoc}\n`);
}

console.log(`\n=== LOW CONFIDENCE (NEED MANUAL REVIEW) ===\n`);
for (const g of low.slice(0, 10)) {
  const relPath = g.item.file.replace(process.cwd() + '/', '');
  console.log(`${g.item.type.toUpperCase()} ${g.item.name}`);
  console.log(`  File: ${relPath}:${g.item.line}`);
  console.log(`  Suggested: ${g.suggestedDoc}\n`);
}

// Generate patch file
const patches: Array<{ file: string; line: number; doc: string; name: string }> = [];

for (const g of generated.filter(g => g.confidence === 'high')) {
  patches.push({
    file: g.item.file,
    line: g.item.line,
    doc: g.suggestedDoc,
    name: g.item.name
  });
}

// Save patches
const patchPath = path.join(__dirname, '../docs/doc-patches.json');
fs.writeFileSync(patchPath, JSON.stringify(patches, null, 2));

console.log(`\n✅ Patches saved to: docs/doc-patches.json`);
console.log(`   ${patches.length} high-confidence documentation patches ready to apply\n`);

// Generate summary
const summaryPath = path.join(__dirname, '../docs/doc-generation-summary.md');
const summary = `# Documentation Generation Summary

Generated: ${new Date().toISOString()}

## Statistics

- **Total underdocumented items**: ${critical.length}
- **High confidence**: ${high.length}
- **Medium confidence**: ${medium.length}
- **Low confidence (manual review needed)**: ${low.length}

## High Confidence Patches

${high.map(g => {
  const relPath = g.item.file.replace(process.cwd() + '/', '');
  return `### \`${g.item.name}\` (${relPath}:${g.item.line})

\`\`\`typescript
/**
 * ${g.suggestedDoc}
 */
${g.item.type} ${g.item.name}
\`\`\`
`;
}).join('\n')}

## Medium Confidence (Review Recommended)

${medium.slice(0, 20).map(g => {
  const relPath = g.item.file.replace(process.cwd() + '/', '');
  return `### \`${g.item.name}\` (${relPath}:${g.item.line})

\`\`\`typescript
/**
 * ${g.suggestedDoc}
 */
${g.item.type} ${g.item.name}
\`\`\`
`;
}).join('\n')}

## Low Confidence (Manual Documentation Required)

${low.map(g => {
  const relPath = g.item.file.replace(process.cwd() + '/', '');
  return `- \`${g.item.name}\` in ${relPath}:${g.item.line}`;
}).join('\n')}
`;

fs.writeFileSync(summaryPath, summary);
console.log(`✅ Summary saved to: docs/doc-generation-summary.md\n`);

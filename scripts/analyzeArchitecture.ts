#!/usr/bin/env tsx
/**
 * Static Analysis Tool for AI Game Theory Simulation
 *
 * Finds architectural issues:
 * 1. Old properties still being used where new complex properties exist
 * 2. New properties defined but not used
 * 3. Mixed old/new system usage
 * 4. Relying on default values due to undefined properties
 * 5. Interface compliance issues
 *
 * Updated from devlog analysis (October 9, 2025)
 */

import * as fs from 'fs';
import * as path from 'path';

interface AnalysisResult {
  category: string;
  severity: 'error' | 'warning' | 'info';
  file: string;
  line?: number;
  message: string;
  suggestion?: string;
}

const results: AnalysisResult[] = [];

// Known old properties that should be migrated or removed
// Compiled from devlog analysis and commit history
const OLD_PROPERTIES = {
  AIAgent: [
    'actionFrequency',          // Removed in Phase 2.5 (player-directed actions)
    'discoveredBreakthroughs',  // Replaced by GameState.breakthroughTech
    'awareness',                // Unused legacy Phase 1 property
    'latentSpaceSize'          // Unused legacy Phase 1 property
  ],
  HumanSocietyAgent: [
    'trustInAI'                // Should be derived from paranoiaLevel (Phase 2.8)
  ],
  GovernmentAgent: [
    'actionFrequency',         // Removed in Phase 2.5 (player-directed actions)
    'enforcementCapability'    // Defined but never used
  ],
  OutcomeMetrics: [
    'utopia',                  // Replaced by activeAttractor
    'dystopia',                // Replaced by activeAttractor
    'extinction'              // Replaced by activeAttractor
  ],
  MetricSnapshot: [
    'events',                  // Removed from interface
    'state'                    // Removed from interface
  ],
  GlobalMetrics: [
    'technologicalBreakthroughRate' // Replaced by breakthroughTech system
  ],
  AICapabilityProfile: [
    'Enables'                  // Typo/unclear property name (appears 6x in interface)
  ],
  AIResearchCapabilities: [
    'Positive',                // Typo property
    'use'                      // Unclear purpose (appears 2x)
  ]
};

// New complex properties that should be used instead
// From Phase 2A-2F implementations
const NEW_PROPERTIES = {
  AIAgent: [
    'capabilityProfile',       // Phase 2.5: Multi-dimensional capabilities
    'resentment',              // Phase 2.6: Control-dystopia mechanics
    'lifecycleState',          // Phase 4: AI lifecycle (training/testing/deployed/retired)
    'deploymentType',          // Phase 4: closed/open_weights/enterprise/research
    'darkCompute'              // Phase 11: Illicit compute usage
  ],
  HumanSocietyAgent: [
    'paranoiaLevel',           // Phase 2.8: Paranoia system (trust derived from this)
    'communityStrength',       // Phase 2E: Needed for Meaning Spiral (from QoL)
    'institutionalTrust'       // Phase 2D: Needed for Democratic Spiral (from QoL)
  ],
  GovernmentAgent: [
    'researchInvestments',     // Phase 2.5: Strategic tech research allocation
    'governmentType',          // Phase 2.6: democratic/authoritarian/technocratic
    'aiRightsRecognized',      // Phase 2.6: AI personhood/rights
    'trainingDataQuality',     // Phase 2.6: Data bias tracking
    'cyberDefense',            // Phase 4: Cybersecurity arms race
    'structuralChoices'        // Realistic economic dynamics tracking
  ],
  GameState: [
    'organizations',           // Phase 2: Organization layer
    'goldenAgeState',          // Phase 2A: Golden Age detection
    'environmentalAccumulation', // Phase 2A: Environmental debt
    'socialAccumulation',      // Phase 2A: Social cohesion tracking
    'technologicalRisk',       // Phase 2A: AI capability risk
    'breakthroughTech',        // Phase 2A: Breakthrough technologies
    'upwardSpirals',           // Phase 2D: Upward spirals system
    'meaningRenaissance',      // Phase 2E: Cultural flourishing
    'conflictResolution',      // Phase 2F: Peace systems
    'diplomaticAI',            // Phase 2F+: Research-based diplomatic AI
    'nuclearStates',           // Phase 3: Nuclear-armed nations
    'madDeterrence',           // Phase 3: MAD deterrence system
    'bilateralTensions',       // Phase 3: Bilateral relationships
    'resourceEconomy',         // Phase 2.9: Resource economy with CO2
    'defensiveAI',             // Phase 2.10: Cyber-defense system
    'nationalAI'               // Phase 2.11: National AI capabilities
  ],
  OutcomeMetrics: [
    'activeAttractor',         // Phase 2A: Single source of truth for outcome
    'lockInStrength'           // Phase 2B: Path lock-in strength
  ],
  QualityOfLifeSystems: [
    'communityStrength',       // Phase 2E: Local cohesion metric
    'institutionalTrust'       // Missing but should be here for Democratic Spiral
  ]
};

// Properties that need explicit initialization (can't rely on undefined defaults)
// These are used in simulation logic but missing from initialization
const REQUIRED_INITIALIZATION = {
  HumanSocietyAgent: [
    'paranoiaLevel',           // Used in trust derivation
    'communityStrength',       // Used in Meaning Spiral requirement (upwardSpirals.ts)
    'institutionalTrust'       // Used in Democratic Spiral requirement (upwardSpirals.ts)
  ],
  GovernmentAgent: [
    'researchInvestments',     // Used in breakthrough tech research
    'cyberDefense'            // Used in cyber security mechanics
  ],
  GameState: [
    'nuclearStates',           // Used in nuclear deterrence
    'madDeterrence',          // Used in extinction checks
    'bilateralTensions',      // Used in nuclear escalation
    'resourceEconomy',        // Used in environmental accumulation
    'defensiveAI',            // Used in cyber defense
    'nationalAI'              // Used in AI race dynamics
  ]
};

function analyzeFile(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const relativePath = path.relative(process.cwd(), filePath);

  // Check for old property usage
  for (const [typeName, properties] of Object.entries(OLD_PROPERTIES)) {
    for (const prop of properties) {
      // Look for property access patterns: .property or ['property']
      const dotPattern = new RegExp(`\\.${prop}\\b`, 'g');
      const bracketPattern = new RegExp(`\\['${prop}'\\]`, 'g');

      lines.forEach((line, index) => {
        if (dotPattern.test(line) || bracketPattern.test(line)) {
          // Skip type definitions and interfaces
          if (line.trim().startsWith('//') ||
              line.includes('interface ') ||
              line.includes('type ') ||
              line.includes('@deprecated')) {
            return;
          }

          results.push({
            category: 'Old Property Usage',
            severity: 'warning',
            file: relativePath,
            line: index + 1,
            message: `Using old property '${prop}' from ${typeName}`,
            suggestion: NEW_PROPERTIES[typeName as keyof typeof NEW_PROPERTIES]?.length > 0
              ? `Consider using: ${NEW_PROPERTIES[typeName as keyof typeof NEW_PROPERTIES].join(', ')}`
              : 'Consider removing or migrating this property'
          });
        }
      });
    }
  }

  // Check for new properties defined but not used
  if (filePath.includes('types/game.ts') || filePath.includes('types/technologies.ts')) {
    for (const [typeName, properties] of Object.entries(NEW_PROPERTIES)) {
      for (const prop of properties) {
        const definedPattern = new RegExp(`${prop}[?:]\\s*[\\w<>\\[\\]|;]`, 'g');
        const isDefined = definedPattern.test(content);

        if (isDefined) {
          // Check if property is actually used in simulation files
          const simulationFiles = findSimulationFiles();
          let usageCount = 0;

          for (const simFile of simulationFiles) {
            const simContent = fs.readFileSync(simFile, 'utf-8');
            const usagePattern = new RegExp(`\\.${prop}\\b`, 'g');
            const matches = simContent.match(usagePattern);
            usageCount += matches ? matches.length : 0;
          }

          if (usageCount === 0) {
            results.push({
              category: 'Unused New Property',
              severity: 'info',
              file: relativePath,
              message: `Property '${prop}' defined in ${typeName} but never used`,
              suggestion: 'Implement usage or remove from interface'
            });
          } else if (usageCount < 3) {
            results.push({
              category: 'Underutilized Property',
              severity: 'info',
              file: relativePath,
              message: `Property '${prop}' from ${typeName} used only ${usageCount} time(s)`,
              suggestion: 'Consider expanding usage or evaluating necessity'
            });
          }
        }
      }
    }
  }

  // Check for missing initialization of required properties
  if (filePath.includes('initialization.ts')) {
    for (const [typeName, properties] of Object.entries(REQUIRED_INITIALIZATION)) {
      for (const prop of properties) {
        const initPattern = new RegExp(`${prop}:\\s*[^,}]+`, 'g');
        if (!initPattern.test(content)) {
          results.push({
            category: 'Missing Initialization',
            severity: 'error',
            file: relativePath,
            message: `Required property '${prop}' from ${typeName} not explicitly initialized`,
            suggestion: 'Add explicit initialization to avoid relying on undefined defaults'
          });
        }
      }
    }
  }

  // Check for mixing old and new systems
  const hasOldTrust = /society\.trustInAI\s*=/g.test(content);
  const hasParanoia = /society\.paranoiaLevel/g.test(content);

  if (hasOldTrust && hasParanoia && !filePath.includes('socialCohesion.ts')) {
    results.push({
      category: 'Mixed Old/New Systems',
      severity: 'warning',
      file: relativePath,
      message: 'File uses both old trust system and new paranoia system',
      suggestion: 'Migrate fully to paranoia-based trust calculation (see socialCohesion.ts)'
    });
  }

  // Check for old outcome checking
  const hasOldOutcome = /outcomeMetrics\.(utopia|dystopia|extinction)/g.test(content);
  const hasNewOutcome = /outcomeMetrics\.activeAttractor/g.test(content);

  if (hasOldOutcome && !filePath.includes('types/game.ts')) {
    results.push({
      category: 'Old Outcome System',
      severity: 'warning',
      file: relativePath,
      message: 'Using old outcome properties (utopia/dystopia/extinction)',
      suggestion: 'Use outcomeMetrics.activeAttractor instead'
    });
  }

  // Check for lifecycle state string comparisons (common bug)
  const lifecycleComparison = /lifecycleState\s*[!=]==?\s*["']deployed["']/g;
  if (lifecycleComparison.test(content)) {
    results.push({
      category: 'Incorrect Lifecycle Comparison',
      severity: 'error',
      file: relativePath,
      message: 'Comparing lifecycleState to "deployed" instead of "deployed_closed" or "deployed_open"',
      suggestion: 'Use "deployed_closed" or "deployed_open", or check for both'
    });
  }

  // Check for accessing possibly undefined properties
  const possiblyUndefined = [
    { pattern: /society\.paranoiaLevel\b(?!\s*\|\|)(?!\s*\?)(?!\s*!=)/g, prop: 'paranoiaLevel' },
    { pattern: /state\.nuclearStates\b(?!\s*\|\|)(?!\s*\?)(?!\s*!=)/g, prop: 'nuclearStates' },
    { pattern: /tech\.\w+\.deploymentLevel\b(?!\s*\|\|)(?!\s*\?)(?!\s*!=)/g, prop: 'deploymentLevel' }
  ];

  possiblyUndefined.forEach(({ pattern, prop }) => {
    lines.forEach((line, index) => {
      // Skip safe access patterns and type definitions
      if (line.includes('?.') ||
          line.includes('||') ||
          line.includes('??') ||
          line.trim().startsWith('//') ||
          line.includes('interface ') ||
          line.includes('type ')) {
        return;
      }

      if (pattern.test(line)) {
        results.push({
          category: 'Unsafe Property Access',
          severity: 'warning',
          file: relativePath,
          line: index + 1,
          message: `Accessing '${prop}' without null/undefined check`,
          suggestion: `Use optional chaining (?.) or nullish coalescing (??) or explicit check`
        });
      }
    });
  });
}

function findSimulationFiles(): string[] {
  const simDir = path.join(process.cwd(), 'src', 'simulation');
  const files: string[] = [];

  function traverse(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        traverse(fullPath);
      } else if (entry.name.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  }

  traverse(simDir);
  return files;
}

function analyzeInterfaces(): void {
  const gameTypesPath = path.join(process.cwd(), 'src', 'types', 'game.ts');
  const content = fs.readFileSync(gameTypesPath, 'utf-8');

  // Find interface definitions and their properties
  const interfacePattern = /interface\s+(\w+)\s*{([^}]+)}/gs;
  const matches = content.matchAll(interfacePattern);

  for (const match of matches) {
    const interfaceName = match[1];
    const interfaceBody = match[2];

    // Extract property names
    const propPattern = /(\w+)\??:\s*/g;
    const propMatches = [...interfaceBody.matchAll(propPattern)];
    const properties = propMatches.map(m => m[1]);

    console.log(`\n📋 ${interfaceName} (${properties.length} properties)`);

    // Check each property usage
    const simulationFiles = findSimulationFiles();
    for (const prop of properties) {
      let usageCount = 0;
      let readCount = 0;
      let writeCount = 0;

      for (const file of simulationFiles) {
        const fileContent = fs.readFileSync(file, 'utf-8');
        const readPattern = new RegExp(`\\.${prop}\\b(?!\\s*=)`, 'g');
        const writePattern = new RegExp(`\\.${prop}\\s*=`, 'g');

        const reads = fileContent.match(readPattern);
        const writes = fileContent.match(writePattern);

        readCount += reads ? reads.length : 0;
        writeCount += writes ? writes.length : 0;
      }

      usageCount = readCount + writeCount;

      if (usageCount === 0) {
        console.log(`  ⚠️  ${prop}: UNUSED`);
      } else if (readCount === 0 && writeCount > 0) {
        console.log(`  📝 ${prop}: write-only (${writeCount}×) - consider if reads needed`);
      } else if (writeCount === 0 && readCount > 0) {
        console.log(`  👁️  ${prop}: read-only (${readCount}×) - ensure initialization`);
      } else if (usageCount < 5) {
        console.log(`  🔹 ${prop}: low usage (${readCount}r/${writeCount}w)`);
      } else {
        console.log(`  ✅ ${prop}: active (${readCount}r/${writeCount}w)`);
      }
    }
  }
}

console.log('🔍 AI Game Theory Simulation - Architecture Analysis\n');
console.log('Analyzing TypeScript files for architectural issues...\n');

// Analyze all simulation files
const simulationFiles = findSimulationFiles();
const scriptFiles = fs.readdirSync(path.join(process.cwd(), 'scripts'))
  .filter(f => f.endsWith('.ts'))
  .map(f => path.join(process.cwd(), 'scripts', f));
const typeFiles = [
  path.join(process.cwd(), 'src', 'types', 'game.ts'),
  path.join(process.cwd(), 'src', 'types', 'technologies.ts')
];

console.log('📁 Analyzing files:');
console.log(`  - ${simulationFiles.length} simulation files`);
console.log(`  - ${scriptFiles.length} script files`);
console.log(`  - ${typeFiles.length} type definition files\n`);

for (const file of [...simulationFiles, ...scriptFiles, ...typeFiles]) {
  analyzeFile(file);
}

// Sort results by severity and category
results.sort((a, b) => {
  const severityOrder = { error: 0, warning: 1, info: 2 };
  if (severityOrder[a.severity] !== severityOrder[b.severity]) {
    return severityOrder[a.severity] - severityOrder[b.severity];
  }
  return a.category.localeCompare(b.category);
});

// Print results grouped by category
console.log('═══════════════════════════════════════════════════════════\n');
console.log('📊 ANALYSIS RESULTS\n');

const categories = [...new Set(results.map(r => r.category))];

for (const category of categories) {
  const categoryResults = results.filter(r => r.category === category);
  const errors = categoryResults.filter(r => r.severity === 'error').length;
  const warnings = categoryResults.filter(r => r.severity === 'warning').length;
  const infos = categoryResults.filter(r => r.severity === 'info').length;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📦 ${category}`);
  console.log(`   🔴 ${errors} errors | 🟡 ${warnings} warnings | 🔵 ${infos} info`);
  console.log('='.repeat(60));

  // Group by file
  const fileGroups = new Map<string, AnalysisResult[]>();
  for (const result of categoryResults) {
    if (!fileGroups.has(result.file)) {
      fileGroups.set(result.file, []);
    }
    fileGroups.get(result.file)!.push(result);
  }

  for (const [file, fileResults] of fileGroups) {
    console.log(`\n  📄 ${file}`);
    for (const result of fileResults.slice(0, 5)) { // Limit to 5 per file
      const icon = result.severity === 'error' ? '🔴' : result.severity === 'warning' ? '🟡' : '🔵';
      const lineInfo = result.line ? `:${result.line}` : '';
      console.log(`     ${icon} ${result.message}${lineInfo}`);
      if (result.suggestion) {
        console.log(`        💡 ${result.suggestion}`);
      }
    }
    if (fileResults.length > 5) {
      console.log(`     ... and ${fileResults.length - 5} more issues`);
    }
  }
}

console.log('\n\n═══════════════════════════════════════════════════════════');
console.log('📈 SUMMARY');
console.log('═══════════════════════════════════════════════════════════\n');

const totalErrors = results.filter(r => r.severity === 'error').length;
const totalWarnings = results.filter(r => r.severity === 'warning').length;
const totalInfos = results.filter(r => r.severity === 'info').length;

console.log(`Total Issues: ${results.length}`);
console.log(`  🔴 Errors: ${totalErrors}`);
console.log(`  🟡 Warnings: ${totalWarnings}`);
console.log(`  🔵 Info: ${totalInfos}`);

console.log('\n\n═══════════════════════════════════════════════════════════');
console.log('🔬 INTERFACE USAGE ANALYSIS');
console.log('═══════════════════════════════════════════════════════════');

analyzeInterfaces();

console.log('\n\n✅ Analysis complete!\n');
console.log('💡 Next steps:');
console.log('  1. Fix all 🔴 errors (missing initialization, incorrect types)');
console.log('  2. Review 🟡 warnings (old properties, unsafe access)');
console.log('  3. Consider 🔵 info items (unused properties, underutilization)');
console.log('  4. Run `npx tsc --noEmit` to catch type errors');
console.log('  5. Run Monte Carlo tests to verify fixes\n');

#!/usr/bin/env npx tsx

/**
 * Static analysis of O(n²) performance bottlenecks in simulation code
 */

import * as fs from 'fs';
import * as path from 'path';

interface O2Pattern {
  file: string;
  line: number;
  pattern: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  recommendation: string;
}

// Search for O(n²) patterns in the codebase
function findO2Patterns(): O2Pattern[] {
  const patterns: O2Pattern[] = [];
  const simulationDir = path.join(__dirname, '..', 'src', 'simulation');

  // Read all TypeScript files recursively
  function readFiles(dir: string): string[] {
    const files: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...readFiles(fullPath));
      } else if (entry.name.endsWith('.ts')) {
        files.push(fullPath);
      }
    }

    return files;
  }

  const tsFiles = readFiles(simulationDir);

  // Patterns to look for
  const o2Patterns = [
    {
      regex: /\.find\([^)]+\).*\.includes\(/,
      description: 'find() with includes() creates O(n²)',
      severity: 'HIGH' as const
    },
    {
      regex: /\.filter\([^)]+\).*\.includes\(/,
      description: 'filter() with includes() creates O(n²)',
      severity: 'HIGH' as const
    },
    {
      regex: /organizations\.find.*ownedDataCenters\.includes/,
      description: 'Organization ownership lookup O(n²)',
      severity: 'CRITICAL' as const
    },
    {
      regex: /agents\.find.*\=\=\=.*agentId/,
      description: 'Agent lookup by ID in loop',
      severity: 'HIGH' as const
    },
    {
      regex: /for.*organizations.*for.*agents/,
      description: 'Nested loops over agents and orgs',
      severity: 'CRITICAL' as const
    },
    {
      regex: /\.forEach.*\.forEach/,
      description: 'Nested forEach loops',
      severity: 'MEDIUM' as const
    },
    {
      regex: /unlockedTech\.includes.*for|for.*unlockedTech\.includes/,
      description: 'Tech unlock check in loop',
      severity: 'MEDIUM' as const
    }
  ];

  for (const file of tsFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      for (const pattern of o2Patterns) {
        if (pattern.regex.test(line)) {
          const relativePath = path.relative(path.join(__dirname, '..'), file);
          patterns.push({
            file: relativePath,
            line: index + 1,
            pattern: line.trim().substring(0, 100),
            severity: pattern.severity,
            description: pattern.description,
            recommendation: getRecommendation(pattern.description)
          });
        }
      }
    });
  }

  return patterns;
}

function getRecommendation(description: string): string {
  if (description.includes('ownership lookup')) {
    return 'Build Map<dcId, orgId> index at step start';
  } else if (description.includes('Agent lookup')) {
    return 'Build Map<agentId, agent> index at step start';
  } else if (description.includes('includes()')) {
    return 'Use Set instead of array for O(1) lookups';
  } else if (description.includes('Tech unlock')) {
    return 'Use Set<techId> instead of array';
  } else if (description.includes('Nested loops')) {
    return 'Consider indexing or caching to avoid nested iteration';
  }
  return 'Analyze and optimize based on hot path frequency';
}

// Analyze specific known bottlenecks
function analyzeKnownBottlenecks() {
  console.log('\n=== KNOWN O(n²) BOTTLENECKS ===\n');

  const knownIssues = [
    {
      file: 'src/simulation/agents/governmentAgent.ts',
      lines: [1497, 1508, 1522],
      description: 'Datacenter ownership lookup',
      impact: 'O(datacenters × organizations) per government action',
      fix: 'Build ownership Map once per step'
    },
    {
      file: 'src/simulation/collectiveFormation.ts',
      line: 196,
      description: 'Agent lookup in collective loop',
      impact: 'O(collectives × agents) per update',
      fix: 'Build agent Map<id, agent> once per step'
    },
    {
      file: 'src/simulation/organizationManagement.ts',
      line: 109,
      description: 'Competitor building check',
      impact: 'O(orgs × projects) per org decision',
      fix: 'Track building status in separate index',
      note: 'PARTIAL FIX: Lines 44-64 already optimized for compute utilization'
    },
    {
      file: 'src/simulation/techTree/engine.ts',
      lines: [134, 218, 469],
      description: 'Tech unlock includes() checks',
      impact: 'O(tech × unlock checks) per step',
      fix: 'Convert unlockedTech array to Set'
    },
    {
      file: 'src/simulation/techTree/effectsEngine.ts',
      line: 3135,
      description: 'Nested deployment check',
      impact: 'O(regions × deployments × tech)',
      fix: 'Build deployment index Map<techId, Set<region>>'
    }
  ];

  knownIssues.forEach(issue => {
    console.log(`📍 ${issue.file}${issue.line ? `:${issue.line}` : issue.lines ? `:${issue.lines.join(',')}` : ''}`);
    console.log(`   ${issue.description}`);
    console.log(`   Impact: ${issue.impact}`);
    console.log(`   Fix: ${issue.fix}`);
    if (issue.note) {
      console.log(`   Note: ${issue.note}`);
    }
    console.log();
  });
}

// Calculate theoretical impact
function calculateImpact() {
  console.log('\n=== THEORETICAL PERFORMANCE IMPACT ===\n');

  const assumptions = {
    agents: 50,
    organizations: 200,
    datacenters: 100,
    collectives: 10,
    tech: 71,
    stepsPerGame: 240,
    gamesPerMonteCarlo: 100
  };

  console.log('Assumptions:');
  Object.entries(assumptions).forEach(([key, value]) => {
    console.log(`  ${key}: ${value}`);
  });

  console.log('\nO(n²) Operations per Step:');

  const operations = [
    {
      name: 'DC Ownership (3 lookups)',
      ops: 3 * assumptions.datacenters * assumptions.organizations,
      critical: true
    },
    {
      name: 'Collective Membership',
      ops: assumptions.collectives * assumptions.agents,
      critical: false
    },
    {
      name: 'Org Competition Check',
      ops: assumptions.organizations * assumptions.organizations,
      critical: true
    },
    {
      name: 'Tech Unlock Checks (est. 10/step)',
      ops: 10 * assumptions.tech,
      critical: false
    }
  ];

  let totalOps = 0;
  operations.forEach(op => {
    const marker = op.critical ? '🔴' : '⚠️';
    console.log(`  ${marker} ${op.name}: ${op.ops.toLocaleString()} ops`);
    totalOps += op.ops;
  });

  console.log(`\nTotal O(n²) ops per step: ${totalOps.toLocaleString()}`);
  console.log(`Total per game (${assumptions.stepsPerGame} steps): ${(totalOps * assumptions.stepsPerGame).toLocaleString()}`);
  console.log(`Total per Monte Carlo (${assumptions.gamesPerMonteCarlo} games): ${(totalOps * assumptions.stepsPerGame * assumptions.gamesPerMonteCarlo).toLocaleString()}`);

  // Estimate time savings
  const nsPerOp = 10; // Rough estimate: 10ns per array operation
  const currentTimeMs = (totalOps * nsPerOp) / 1_000_000;
  const optimizedOps = totalOps / 50; // Assume 50x reduction with indexing
  const optimizedTimeMs = (optimizedOps * nsPerOp) / 1_000_000;

  console.log('\nEstimated Time per Step:');
  console.log(`  Current: ${currentTimeMs.toFixed(2)}ms`);
  console.log(`  Optimized: ${optimizedTimeMs.toFixed(2)}ms`);
  console.log(`  Savings: ${(currentTimeMs - optimizedTimeMs).toFixed(2)}ms (${((1 - optimizedTimeMs/currentTimeMs) * 100).toFixed(0)}% reduction)`);
}

// Implementation plan
function generateImplementationPlan() {
  console.log('\n=== IMPLEMENTATION PLAN ===\n');

  const phases = [
    {
      priority: 'CRITICAL',
      title: 'Phase 1: Datacenter Ownership Index',
      effort: '2-3 hours',
      files: ['governmentAgent.ts'],
      steps: [
        'Create buildDatacenterOwnershipMap() utility',
        'Call once at phase start',
        'Replace all find().includes() with Map lookups',
        'Test government seizure actions'
      ],
      impact: 'Eliminate 60,000 ops/step'
    },
    {
      priority: 'HIGH',
      title: 'Phase 2: Agent & Org Indices',
      effort: '3-4 hours',
      files: ['collectiveFormation.ts', 'organizationManagement.ts'],
      steps: [
        'Create buildAgentMap() and buildOrgMap() utilities',
        'Add to PhaseContext for sharing',
        'Replace find() calls with Map lookups',
        'Test collective and org behaviors'
      ],
      impact: 'Eliminate 40,500 ops/step'
    },
    {
      priority: 'MEDIUM',
      title: 'Phase 3: Tech Tree Set Conversion',
      effort: '2 hours',
      files: ['techTree/engine.ts', 'types/game.ts'],
      steps: [
        'Convert unlockedTech from array to Set',
        'Update all includes() to has()',
        'Update serialization/deserialization',
        'Run tech tree tests'
      ],
      impact: 'Reduce tech checks from O(n) to O(1)'
    },
    {
      priority: 'LOW',
      title: 'Phase 4: Deployment Index',
      effort: '2 hours',
      files: ['techTree/effectsEngine.ts'],
      steps: [
        'Build tech deployment index',
        'Cache per step',
        'Update deployment checks'
      ],
      impact: 'Minor - not in hot path'
    }
  ];

  phases.forEach((phase, i) => {
    console.log(`${phase.priority} - ${phase.title}`);
    console.log(`  Effort: ${phase.effort}`);
    console.log(`  Impact: ${phase.impact}`);
    console.log(`  Files: ${phase.files.join(', ')}`);
    console.log(`  Steps:`);
    phase.steps.forEach(step => console.log(`    - ${step}`));
    if (i < phases.length - 1) console.log();
  });

  console.log('\nTotal Estimated Effort: 9-11 hours');
  console.log('Expected Performance Gain: 70-90% reduction in hot path time');
}

// Main execution
function main() {
  console.log('=== O(n²) PERFORMANCE BOTTLENECK ANALYSIS ===\n');
  console.log('Analyzing simulation codebase for O(n²) patterns...\n');

  // Find patterns
  const patterns = findO2Patterns();

  // Group by severity
  const critical = patterns.filter(p => p.severity === 'CRITICAL');
  const high = patterns.filter(p => p.severity === 'HIGH');
  const medium = patterns.filter(p => p.severity === 'MEDIUM');

  console.log('=== PATTERN SCAN RESULTS ===\n');
  console.log(`Found ${patterns.length} potential O(n²) patterns:`);
  console.log(`  🔴 CRITICAL: ${critical.length}`);
  console.log(`  🟡 HIGH: ${high.length}`);
  console.log(`  🟠 MEDIUM: ${medium.length}`);

  if (critical.length > 0) {
    console.log('\n🔴 CRITICAL ISSUES:');
    critical.forEach(p => {
      console.log(`  ${p.file}:${p.line}`);
      console.log(`    Pattern: ${p.pattern}`);
      console.log(`    Fix: ${p.recommendation}`);
    });
  }

  // Known bottlenecks
  analyzeKnownBottlenecks();

  // Impact analysis
  calculateImpact();

  // Implementation plan
  generateImplementationPlan();

  console.log('\n=== SUMMARY ===\n');
  console.log('The simulation has several O(n²) bottlenecks in hot paths that run every step.');
  console.log('With 50 agents × 200 orgs, these create ~100,000 unnecessary operations per step.');
  console.log('Implementing the proposed indexing optimizations would reduce this by 70-90%.');
  console.log('\nPriority: Fix CRITICAL issues first (datacenter ownership), then HIGH (agent/org lookups).');
}

main();
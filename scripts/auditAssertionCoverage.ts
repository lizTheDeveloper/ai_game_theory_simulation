#!/usr/bin/env tsx
/**
 * Audit Assertion Coverage
 * Scans all phase files to identify which have assertion utilities
 */

import * as fs from 'fs';
import * as path from 'path';

const PHASES_DIR = path.join(process.cwd(), 'src/simulation/engine/phases');

interface PhaseAudit {
  file: string;
  hasImport: boolean;
  hasAssertCalls: boolean;
  assertionCount: number;
  assertionTypes: Set<string>;
  riskFactors: {
    modifiesPopulation: boolean;
    modifiesMortality: boolean;
    modifiesClimate: boolean;
    modifiesEconomy: boolean;
    modifiesAI: boolean;
    modifiesQoL: boolean;
    hasMath: boolean;
    hasDivision: boolean;
    hasGeometricMean: boolean;
  };
}

function analyzePhase(filePath: string): PhaseAudit {
  const content = fs.readFileSync(filePath, 'utf-8');
  const filename = path.basename(filePath);

  // Check for assertion import
  const hasImport = /from ['"]@\/simulation\/utils\/assertions['"]/.test(content);

  // Find all assertion function calls
  const assertionPattern = /assert[A-Z]\w+\(/g;
  const assertionMatches = content.match(assertionPattern) || [];
  const assertionTypes = new Set(
    assertionMatches.map(match => match.replace('(', ''))
  );

  // Risk factor analysis
  const riskFactors = {
    modifiesPopulation: /state\.population\s*[=+\-]/.test(content) ||
                        /\.population\s*[=+\-]/.test(content),
    modifiesMortality: /mortality|deaths|mortalityRate/i.test(content),
    modifiesClimate: /temperature|climate|CO2|emissions/i.test(content),
    modifiesEconomy: /GDP|economy|spending|taxation/i.test(content),
    modifiesAI: /aiAgents|capabilities|AICapability/i.test(content),
    modifiesQoL: /qualityOfLife|QoL/i.test(content),
    hasMath: /Math\.(pow|sqrt|exp|log|abs|min|max)/.test(content),
    hasDivision: /\/\s*[a-zA-Z0-9_.]/.test(content),
    hasGeometricMean: /geometricMean|reduce.*\*/.test(content),
  };

  return {
    file: filename,
    hasImport,
    hasAssertCalls: assertionMatches.length > 0,
    assertionCount: assertionMatches.length,
    assertionTypes,
    riskFactors,
  };
}

function classifyRisk(audit: PhaseAudit): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  const { riskFactors } = audit;

  // CRITICAL: Modifies population, mortality, AI capabilities, QoL
  if (
    riskFactors.modifiesPopulation ||
    riskFactors.modifiesMortality ||
    riskFactors.modifiesAI ||
    riskFactors.modifiesQoL
  ) {
    return 'CRITICAL';
  }

  // HIGH: Modifies climate, economy
  if (riskFactors.modifiesClimate || riskFactors.modifiesEconomy) {
    return 'HIGH';
  }

  // MEDIUM: Has complex math operations
  if (
    riskFactors.hasMath ||
    riskFactors.hasDivision ||
    riskFactors.hasGeometricMean
  ) {
    return 'MEDIUM';
  }

  return 'LOW';
}

async function main() {
  console.log('=== Assertion Coverage Audit ===\n');

  const phaseFiles = fs.readdirSync(PHASES_DIR)
    .filter(f => f.endsWith('.ts'))
    .sort();

  const audits = phaseFiles.map(file =>
    analyzePhase(path.join(PHASES_DIR, file))
  );

  // Summary stats
  const total = audits.length;
  const withImports = audits.filter(a => a.hasImport).length;
  const withCalls = audits.filter(a => a.hasAssertCalls).length;
  const withoutAssertions = audits.filter(a => !a.hasAssertCalls);

  console.log(`Total phases: ${total}`);
  console.log(`Phases with assertion imports: ${withImports} (${(withImports/total*100).toFixed(1)}%)`);
  console.log(`Phases with assertion calls: ${withCalls} (${(withCalls/total*100).toFixed(1)}%)`);
  console.log(`Phases needing assertions: ${withoutAssertions.length} (${(withoutAssertions.length/total*100).toFixed(1)}%)\n`);

  // Group unvalidated phases by risk
  const unvalidatedByRisk = {
    CRITICAL: [] as PhaseAudit[],
    HIGH: [] as PhaseAudit[],
    MEDIUM: [] as PhaseAudit[],
    LOW: [] as PhaseAudit[],
  };

  withoutAssertions.forEach(audit => {
    const risk = classifyRisk(audit);
    unvalidatedByRisk[risk].push(audit);
  });

  console.log('=== Unvalidated Phases by Risk ===\n');

  for (const risk of ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const) {
    const phases = unvalidatedByRisk[risk];
    console.log(`${risk}: ${phases.length} phases`);
    phases.forEach(p => {
      const factors = Object.entries(p.riskFactors)
        .filter(([_, v]) => v)
        .map(([k, _]) => k);
      console.log(`  - ${p.file} [${factors.join(', ')}]`);
    });
    console.log('');
  }

  // Phases with imports but no calls (suspicious)
  const importButNoCall = audits.filter(a => a.hasImport && !a.hasAssertCalls);
  if (importButNoCall.length > 0) {
    console.log(`=== Phases with imports but no assertion calls (${importButNoCall.length}) ===\n`);
    importButNoCall.forEach(a => console.log(`  - ${a.file}`));
    console.log('');
  }

  // Coverage summary
  console.log('=== Coverage Summary ===\n');
  console.log(`Total phases: ${total}`);
  console.log(`✅ Validated: ${withCalls} (${(withCalls/total*100).toFixed(1)}%)`);
  console.log(`❌ Unvalidated: ${withoutAssertions.length} (${(withoutAssertions.length/total*100).toFixed(1)}%)`);
  console.log('');
  console.log('Breakdown by risk:');
  console.log(`  CRITICAL: ${unvalidatedByRisk.CRITICAL.length}`);
  console.log(`  HIGH: ${unvalidatedByRisk.HIGH.length}`);
  console.log(`  MEDIUM: ${unvalidatedByRisk.MEDIUM.length}`);
  console.log(`  LOW: ${unvalidatedByRisk.LOW.length}`);
  console.log('');
  console.log(`Target: 95% coverage (${Math.ceil(total * 0.95)} phases)`);
  console.log(`Need to add: ${Math.ceil(total * 0.95) - withCalls} phases`);
}

main().catch(console.error);

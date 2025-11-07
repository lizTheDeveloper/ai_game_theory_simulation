#!/usr/bin/env tsx
/**
 * Identify Critical Modules Script
 *
 * Scans all phases to identify which simulation modules are called by CRITICAL/HIGH priority phases.
 * This tells us which modules need assertion utilities FIRST to prevent NaN bugs at the source.
 *
 * Output: Ranked list of modules by:
 * 1. Number of CRITICAL phase calls
 * 2. Number of HIGH phase calls
 * 3. Total phase calls
 *
 * Logic:
 * - Parse each phase file
 * - Extract priority from PhaseOrchestrator.ts PHASES array
 * - Find import statements for simulation modules
 * - Track which modules are called by which priority phases
 * - Rank by CRITICAL > HIGH > total calls
 */

import fs from 'fs';
import path from 'path';

const PHASES_DIR = path.join(__dirname, '../src/simulation/engine/phases');
const ORCHESTRATOR_FILE = path.join(__dirname, '../src/simulation/engine/PhaseOrchestrator.ts');
const SIMULATION_DIR = path.join(__dirname, '../src/simulation');

interface ModuleCall {
  module: string;
  calledByPhases: {
    phaseName: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  }[];
  criticalCount: number;
  highCount: number;
  totalCount: number;
}

interface PhaseInfo {
  fileName: string;
  phaseName: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
}

/**
 * Extract phase priorities from phase file comments
 * Looks for CRITICAL/HIGH/MEDIUM/LOW keywords in phase file headers
 */
function extractPhasePriorities(): Map<string, 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'> {
  const priorities = new Map<string, 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>();

  const phaseFiles = fs.readdirSync(PHASES_DIR).filter(f => f.endsWith('Phase.ts'));

  for (const phaseFile of phaseFiles) {
    const phaseName = phaseFile.replace('.ts', '');
    const phaseContent = fs.readFileSync(path.join(PHASES_DIR, phaseFile), 'utf-8');

    // Look for priority keywords in comments (first 50 lines)
    const lines = phaseContent.split('\n').slice(0, 50);
    let priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | null = null;

    for (const line of lines) {
      const lower = line.toLowerCase();

      // CRITICAL indicators
      if (lower.includes('critical') && (lower.includes('priority') || lower.includes('authoritative'))) {
        priority = 'CRITICAL';
        break;
      }

      // HIGH indicators
      if (lower.includes('high priority') || lower.includes('high-priority')) {
        priority = 'HIGH';
        break;
      }

      // MEDIUM indicators
      if (lower.includes('medium priority') || lower.includes('medium-priority')) {
        priority = 'MEDIUM';
        break;
      }

      // LOW indicators
      if (lower.includes('low priority') || lower.includes('low-priority')) {
        priority = 'LOW';
        break;
      }
    }

    if (priority) {
      priorities.set(phaseName, priority);
    }
  }

  return priorities;
}

/**
 * Extract simulation module imports from a phase file
 */
function extractModuleImports(phaseContent: string): string[] {
  const modules: string[] = [];

  // Match import statements from @/simulation/
  const importRegex = /import\s+(?:{[^}]+}|[^;\n]+)\s+from\s+['"]@\/simulation\/([^'"]+)['"]/g;

  let match;
  while ((match = importRegex.exec(phaseContent)) !== null) {
    const modulePath = match[1];

    // Skip utility imports - we only care about domain modules
    if (modulePath.startsWith('utils/')) continue;
    if (modulePath.startsWith('engine/')) continue;

    // Extract module name (file without .ts extension)
    const moduleName = modulePath.split('/').pop()?.replace('.ts', '') || modulePath;
    modules.push(moduleName);
  }

  return modules;
}

/**
 * Scan all phase files and track module usage
 */
function scanPhases(): ModuleCall[] {
  const phasePriorities = extractPhasePriorities();
  const moduleMap = new Map<string, ModuleCall>();

  const phaseFiles = fs.readdirSync(PHASES_DIR).filter(f => f.endsWith('Phase.ts'));

  console.log(`\n📊 Scanning ${phaseFiles.length} phase files...\n`);

  for (const phaseFile of phaseFiles) {
    const phaseName = phaseFile.replace('.ts', '');
    const priority = phasePriorities.get(phaseName) || 'UNKNOWN';

    const phaseContent = fs.readFileSync(path.join(PHASES_DIR, phaseFile), 'utf-8');
    const modules = extractModuleImports(phaseContent);

    for (const module of modules) {
      if (!moduleMap.has(module)) {
        moduleMap.set(module, {
          module,
          calledByPhases: [],
          criticalCount: 0,
          highCount: 0,
          totalCount: 0
        });
      }

      const moduleCall = moduleMap.get(module)!;
      moduleCall.calledByPhases.push({ phaseName, priority });
      moduleCall.totalCount++;

      if (priority === 'CRITICAL') moduleCall.criticalCount++;
      if (priority === 'HIGH') moduleCall.highCount++;
    }
  }

  return Array.from(moduleMap.values());
}

/**
 * Rank modules by priority (CRITICAL > HIGH > total)
 */
function rankModules(modules: ModuleCall[]): ModuleCall[] {
  return modules.sort((a, b) => {
    // First: CRITICAL count (descending)
    if (a.criticalCount !== b.criticalCount) {
      return b.criticalCount - a.criticalCount;
    }

    // Second: HIGH count (descending)
    if (a.highCount !== b.highCount) {
      return b.highCount - a.highCount;
    }

    // Third: Total count (descending)
    return b.totalCount - a.totalCount;
  });
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 CRITICAL MODULE IDENTIFICATION');
  console.log('='.repeat(80));
  console.log('Purpose: Find TOP 20 modules used by CRITICAL/HIGH phases');
  console.log('Strategy: Add assertions to these modules FIRST (module-first approach)');
  console.log('='.repeat(80));

  const modules = scanPhases();
  const ranked = rankModules(modules);

  console.log(`\n✅ Found ${modules.length} unique modules\n`);

  console.log('TOP 20 CRITICAL MODULES');
  console.log('='.repeat(80));
  console.log('Module Name                          | CRIT | HIGH | Total | Phases');
  console.log('-'.repeat(80));

  const top20 = ranked.slice(0, 20);

  for (const module of top20) {
    const moduleName = module.module.padEnd(36);
    const critCount = module.criticalCount.toString().padStart(4);
    const highCount = module.highCount.toString().padStart(4);
    const totalCount = module.totalCount.toString().padStart(5);

    // Build phase list (show first 3)
    const phaseList = module.calledByPhases
      .slice(0, 3)
      .map(p => `${p.phaseName}(${p.priority})`)
      .join(', ');

    const morePhases = module.calledByPhases.length > 3
      ? ` +${module.calledByPhases.length - 3} more`
      : '';

    console.log(`${moduleName} | ${critCount} | ${highCount} | ${totalCount} | ${phaseList}${morePhases}`);
  }

  console.log('='.repeat(80));

  // Save detailed report
  const reportPath = path.join(__dirname, '../logs/critical_modules_report.json');
  const report = {
    timestamp: new Date().toISOString(),
    totalModules: modules.length,
    top20: top20.map(m => ({
      module: m.module,
      criticalCount: m.criticalCount,
      highCount: m.highCount,
      totalCount: m.totalCount,
      calledByPhases: m.calledByPhases
    }))
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  // Print next steps
  console.log('\n📋 NEXT STEPS (TIER 1 Implementation):');
  console.log('1. Review TOP 20 modules above');
  console.log('2. Add assertions to these modules in 4 batches (5 modules per batch)');
  console.log('3. Run Monte Carlo N=3 after each batch');
  console.log('4. Focus on: division operations, array reductions, probability calculations');
  console.log('\n💡 Why module-first? The Oct 2025 ecology NaN bug was in planetaryBoundaries.ts');
  console.log('   (a MODULE), hidden by ?? 50. Assertions in phases wouldn\'t have caught it.');
  console.log('   We need assertions WHERE CALCULATIONS HAPPEN.\n');
}

main();

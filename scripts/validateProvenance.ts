/**
 * CLI Provenance Validator
 *
 * Scans codebase for unmarked numeric parameters and reports violations.
 *
 * Usage:
 *   npx tsx scripts/validateProvenance.ts                 # Scan all simulation code
 *   npx tsx scripts/validateProvenance.ts --verbose       # Show all violations with context
 *   npx tsx scripts/validateProvenance.ts --json          # Output JSON report
 *   npx tsx scripts/validateProvenance.ts --fix           # Auto-fix (future feature)
 *
 * Exit codes:
 *   0 - All parameters have provenance
 *   1 - Violations found
 *   2 - Error during scan
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import path from 'path';

interface ProvenanceViolation {
  file: string;
  line: number;
  column: number;
  message: string;
  ruleId: string;
  severity: 'error' | 'warning';
  code?: string;
}

interface ProvenanceReport {
  totalFiles: number;
  filesWithViolations: number;
  totalViolations: number;
  violations: ProvenanceViolation[];
  timestamp: string;
}

const args = process.argv.slice(2);
const flags = {
  verbose: args.includes('--verbose') || args.includes('-v'),
  json: args.includes('--json'),
  fix: args.includes('--fix'),
  output: args.find((arg) => arg.startsWith('--output='))?.split('=')[1],
};

/**
 * Main function
 */
async function main() {
  console.log('📋 Parameter Provenance Validator\n');

  // Find all simulation and platform TypeScript files
  const files = findTypescriptFiles([
    path.join(process.cwd(), 'src/simulation'),
    path.join(process.cwd(), 'src/platform'),
  ]);

  console.log(`🔍 Scanning ${files.length} files for unmarked parameters...\n`);

  let totalViolations = 0;
  const violations: ProvenanceViolation[] = [];
  const filesWithViolations = new Set<string>();

  // Run ESLint on each file
  for (const file of files) {
    try {
      // Run ESLint with provenance rule
      const result = execSync(
        `npx eslint "${file}" --format json --rule 'provenance/require-provenance: error'`,
        { encoding: 'utf-8', stdio: 'pipe' }
      );

      // Parse ESLint output
      const eslintOutput = JSON.parse(result);

      // Extract violations
      for (const fileResult of eslintOutput) {
        if (fileResult.messages && fileResult.messages.length > 0) {
          filesWithViolations.add(file);

          for (const message of fileResult.messages) {
            if (message.ruleId === 'provenance/require-provenance') {
              totalViolations++;
              violations.push({
                file: fileResult.filePath,
                line: message.line,
                column: message.column,
                message: message.message,
                ruleId: message.ruleId,
                severity: message.severity === 2 ? 'error' : 'warning',
                code: getCodeSnippet(file, message.line),
              });
            }
          }
        }
      }
    } catch (error: any) {
      // ESLint exits with code 1 if violations found, so parse the output
      if (error.stdout) {
        try {
          const eslintOutput = JSON.parse(error.stdout);

          for (const fileResult of eslintOutput) {
            if (fileResult.messages && fileResult.messages.length > 0) {
              filesWithViolations.add(file);

              for (const message of fileResult.messages) {
                if (message.ruleId === 'provenance/require-provenance') {
                  totalViolations++;
                  violations.push({
                    file: fileResult.filePath,
                    line: message.line,
                    column: message.column,
                    message: message.message,
                    ruleId: message.ruleId,
                    severity: message.severity === 2 ? 'error' : 'warning',
                    code: getCodeSnippet(file, message.line),
                  });
                }
              }
            }
          }
        } catch (parseError) {
          console.error(`❌ Error parsing ESLint output for ${file}:`, parseError);
        }
      } else {
        console.error(`❌ Error running ESLint on ${file}:`, error.message);
      }
    }
  }

  // Generate report
  const report: ProvenanceReport = {
    totalFiles: files.length,
    filesWithViolations: filesWithViolations.size,
    totalViolations,
    violations,
    timestamp: new Date().toISOString(),
  };

  // Output results
  if (flags.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report, flags.verbose);
  }

  // Save report if --output specified
  if (flags.output) {
    writeFileSync(flags.output, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to ${flags.output}`);
  }

  // Exit with appropriate code
  if (totalViolations > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

/**
 * Print human-readable report
 */
function printReport(report: ProvenanceReport, verbose: boolean) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  PROVENANCE VALIDATION REPORT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`📁 Files scanned:         ${report.totalFiles}`);
  console.log(`⚠️  Files with violations: ${report.filesWithViolations}`);
  console.log(`❌ Total violations:      ${report.totalViolations}\n`);

  if (report.totalViolations === 0) {
    console.log('✅ All parameters have provenance metadata!\n');
    console.log('═══════════════════════════════════════════════════════════════\n');
    return;
  }

  // Group violations by file
  const violationsByFile = new Map<string, ProvenanceViolation[]>();
  for (const violation of report.violations) {
    if (!violationsByFile.has(violation.file)) {
      violationsByFile.set(violation.file, []);
    }
    violationsByFile.get(violation.file)!.push(violation);
  }

  console.log('Violations by file:\n');

  // Print violations
  for (const [file, fileViolations] of violationsByFile) {
    const relativePath = path.relative(process.cwd(), file);
    console.log(`📄 ${relativePath} (${fileViolations.length} violations)`);

    if (verbose) {
      for (const violation of fileViolations) {
        console.log(`   Line ${violation.line}:${violation.column}`);
        console.log(`   ${violation.message}`);
        if (violation.code) {
          console.log(`   Code: ${violation.code.trim()}`);
        }
        console.log('');
      }
    }
  }

  if (!verbose) {
    console.log('\n💡 Run with --verbose to see detailed violation information');
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  HOW TO FIX');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('Wrap all numeric constants in provenance():');
  console.log('');
  console.log('  ❌ WRONG:');
  console.log('     const CO2_BASELINE = 280;');
  console.log('');
  console.log('  ✅ CORRECT:');
  console.log('     import { provenance } from "@/platform/decorators/provenance";');
  console.log('     import { createVerified } from "@/types/provenance";');
  console.log('');
  console.log('     const CO2_BASELINE = provenance(280, {');
  console.log('       name: "CO2_BASELINE",');
  console.log('       units: "ppm",');
  console.log('       provenance: createVerified(');
  console.log('         "10.1038/nature12121",');
  console.log('         "IPCC (2013). Climate Change 2013",');
  console.log('         280,');
  console.log('         0.95');
  console.log('       ),');
  console.log('     });');
  console.log('');
  console.log('See eslint-plugin-provenance/README.md for more examples.');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════\n');
}

/**
 * Get code snippet from file
 */
function getCodeSnippet(file: string, line: number): string | undefined {
  if (!existsSync(file)) {
    return undefined;
  }

  try {
    const content = readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    return lines[line - 1]; // Line numbers are 1-indexed
  } catch (error) {
    return undefined;
  }
}

/**
 * Recursively find TypeScript files
 */
function findTypescriptFiles(dirs: string[]): string[] {
  const files: string[] = [];

  function walkDir(dir: string) {
    if (!existsSync(dir)) {
      return;
    }

    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = path.join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip __tests__ and node_modules
        if (entry === '__tests__' || entry === 'node_modules') {
          continue;
        }
        walkDir(fullPath);
      } else if (stat.isFile()) {
        // Include .ts files but exclude .test.ts and .d.ts
        if (fullPath.endsWith('.ts') && !fullPath.endsWith('.test.ts') && !fullPath.endsWith('.d.ts')) {
          files.push(fullPath);
        }
      }
    }
  }

  for (const dir of dirs) {
    walkDir(dir);
  }

  return files;
}

// Run main
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(2);
});

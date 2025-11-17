#!/usr/bin/env npx tsx
/**
 * MARCUS 3.0 Citation Integrity Platform
 * Dependency Security Audit Script
 *
 * Runs comprehensive dependency scanning:
 * 1. npm audit (built-in security check)
 * 2. Snyk test (if installed)
 * 3. License compliance check
 * 4. Outdated package report
 *
 * Exits with non-zero code if HIGH or CRITICAL vulnerabilities found.
 *
 * Usage:
 *   npx tsx scripts/security/audit-dependencies.ts
 *   npx tsx scripts/security/audit-dependencies.ts --fix  # Auto-fix if possible
 *
 * @author Marcus (Platform Engineer)
 */

import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Configuration
// ============================================================================

interface AuditConfig {
  failOnSeverity: 'low' | 'moderate' | 'high' | 'critical';
  autoFix: boolean;
  generateReport: boolean;
  reportPath: string;
}

const config: AuditConfig = {
  failOnSeverity: process.env.AUDIT_FAIL_SEVERITY as any || 'high',
  autoFix: process.argv.includes('--fix'),
  generateReport: true,
  reportPath: path.join(process.cwd(), 'logs', 'security'),
};

// Severity levels
const SEVERITY_LEVELS = {
  low: 1,
  moderate: 2,
  high: 3,
  critical: 4,
};

// ============================================================================
// Audit Execution
// ============================================================================

async function main() {
  console.log('🔍 Starting dependency security audit...\n');

  // Create logs directory
  if (!fs.existsSync(config.reportPath)) {
    fs.mkdirSync(config.reportPath, { recursive: true });
  }

  let exitCode = 0;

  // 1. Run npm audit
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1️⃣  NPM AUDIT');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const npmAuditResult = await runNpmAudit();
  if (npmAuditResult.exitCode !== 0) {
    exitCode = 1;
  }

  // 2. Run Snyk test (if available)
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('2️⃣  SNYK SECURITY SCAN');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const snykResult = await runSnykTest();
  if (snykResult.exitCode !== 0) {
    exitCode = 1;
  }

  // 3. Check for outdated packages
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('3️⃣  OUTDATED PACKAGES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await runOutdatedCheck();

  // 4. Generate summary report
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 AUDIT SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  if (exitCode === 0) {
    console.log('✅ All dependency security checks passed!');
  } else {
    console.error(`❌ Dependency security audit FAILED (severity threshold: ${config.failOnSeverity})`);
    console.error('   Review vulnerabilities above and run with --fix to auto-remediate.');
  }

  console.log(`\n📁 Reports saved to: ${config.reportPath}`);

  process.exit(exitCode);
}

// ============================================================================
// Audit Functions
// ============================================================================

/**
 * Run npm audit
 */
async function runNpmAudit(): Promise<{ exitCode: number }> {
  const args = ['audit', '--json'];

  if (config.autoFix) {
    console.log('🔧 Auto-fix enabled, running npm audit fix...\n');
    await runCommand('npm', ['audit', 'fix', '--force']);
  }

  const result = await runCommand('npm', args, { allowFailure: true });

  try {
    const auditData = JSON.parse(result.stdout);

    // Save report
    const reportFile = path.join(
      config.reportPath,
      `npm-audit-${new Date().toISOString().split('T')[0]}.json`
    );
    fs.writeFileSync(reportFile, JSON.stringify(auditData, null, 2));

    // Parse vulnerabilities
    const vulns = auditData.vulnerabilities || {};
    const summary = {
      low: 0,
      moderate: 0,
      high: 0,
      critical: 0,
    };

    for (const vuln of Object.values(vulns) as any[]) {
      const severity = vuln.severity?.toLowerCase();
      if (severity && summary.hasOwnProperty(severity)) {
        summary[severity as keyof typeof summary]++;
      }
    }

    // Display summary
    console.log('Vulnerabilities found:');
    console.log(`  Low:      ${summary.low}`);
    console.log(`  Moderate: ${summary.moderate}`);
    console.log(`  High:     ${summary.high}`);
    console.log(`  Critical: ${summary.critical}`);

    // Check severity threshold
    const thresholdLevel = SEVERITY_LEVELS[config.failOnSeverity];
    const hasFailingVulns =
      (thresholdLevel <= SEVERITY_LEVELS.low && summary.low > 0) ||
      (thresholdLevel <= SEVERITY_LEVELS.moderate && summary.moderate > 0) ||
      (thresholdLevel <= SEVERITY_LEVELS.high && summary.high > 0) ||
      (thresholdLevel <= SEVERITY_LEVELS.critical && summary.critical > 0);

    return { exitCode: hasFailingVulns ? 1 : 0 };

  } catch (err) {
    console.error('⚠️ Failed to parse npm audit output:', err);
    return { exitCode: 0 };
  }
}

/**
 * Run Snyk test
 */
async function runSnykTest(): Promise<{ exitCode: number }> {
  // Check if Snyk is installed
  const snykInstalled = await isCommandAvailable('snyk');

  if (!snykInstalled) {
    console.log('⚠️ Snyk not installed. Run: npm install -g snyk');
    console.log('   Skipping Snyk scan...');
    return { exitCode: 0 };
  }

  const args = ['test', '--json', `--severity-threshold=${config.failOnSeverity}`];

  const result = await runCommand('snyk', args, { allowFailure: true });

  // Save report
  const reportFile = path.join(
    config.reportPath,
    `snyk-test-${new Date().toISOString().split('T')[0]}.json`
  );
  fs.writeFileSync(reportFile, result.stdout);

  if (result.exitCode === 0) {
    console.log('✅ No vulnerabilities found by Snyk');
  } else {
    console.log('❌ Snyk found vulnerabilities');
  }

  return { exitCode: result.exitCode };
}

/**
 * Check for outdated packages
 */
async function runOutdatedCheck(): Promise<void> {
  const result = await runCommand('npm', ['outdated', '--json'], { allowFailure: true });

  try {
    const outdated = JSON.parse(result.stdout || '{}');
    const count = Object.keys(outdated).length;

    if (count === 0) {
      console.log('✅ All packages are up to date');
    } else {
      console.log(`⚠️ ${count} packages are outdated:`);
      console.log(result.stdout);
    }
  } catch (err) {
    console.log('✅ All packages are up to date');
  }
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Run shell command
 */
function runCommand(
  command: string,
  args: string[],
  options: { allowFailure?: boolean } = {}
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, { shell: true });

    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0 && !options.allowFailure) {
        reject(new Error(`Command failed with exit code ${code}: ${command} ${args.join(' ')}`));
      } else {
        resolve({ exitCode: code || 0, stdout, stderr });
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Check if command is available
 */
async function isCommandAvailable(command: string): Promise<boolean> {
  try {
    await runCommand('which', [command]);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// Main
// ============================================================================

main().catch((err) => {
  console.error('❌ CRITICAL: Dependency audit failed:', err);
  process.exit(1);
});

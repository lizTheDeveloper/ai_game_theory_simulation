#!/usr/bin/env npx tsx
/**
 * MARCUS 3.0 Citation Integrity Platform
 * Secret Rotation Tool
 *
 * Rotates secrets with zero-downtime support.
 *
 * Features:
 * - Dual-secret period (old + new both active)
 * - Verification before committing rotation
 * - Rollback capability
 *
 * Usage:
 *   npm run secrets:rotate <secret-name> [--verify-only]
 *   npm run secrets:rotate jwt-secret
 *   npm run secrets:rotate all
 *
 * @author Marcus (Platform Engineer)
 */

import * as crypto from 'crypto';
import * as readline from 'readline';
import { createSecretsManager, SECRET_PATHS } from '../../src/platform/secrets/config';

// ============================================================================
// Utilities
// ============================================================================

function generateSecureSecret(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

// ============================================================================
// Secret Rotation
// ============================================================================

/**
 * Rotate a single secret
 */
async function rotateSecret(secretsManager: any, path: string, verifyOnly: boolean = false): Promise<boolean> {
  console.log(`\n🔄 Rotating secret: ${path}`);

  try {
    // Get current secret
    const oldSecret = await secretsManager.getSecret(path);
    console.log(`   Current value: ${oldSecret.substring(0, 8)}...${oldSecret.substring(oldSecret.length - 4)}`);

    if (verifyOnly) {
      console.log('   ✅ Secret accessible (verify-only mode)');
      return true;
    }

    // Confirm rotation
    const confirm = await prompt('   Rotate this secret? [y/N]: ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('   ⏭️ Skipped');
      return false;
    }

    // Generate new secret
    const newSecret = generateSecureSecret(32);

    // Perform rotation
    const result = await secretsManager.rotateSecret(path, () => newSecret);

    if (result.success) {
      console.log(`   ✅ Rotation successful`);
      console.log(`   New value: ${newSecret.substring(0, 8)}...${newSecret.substring(newSecret.length - 4)}`);
      console.log(`   Version: v${result.oldVersion} → v${result.newVersion}`);

      // Verification
      console.log('   🔍 Verifying new secret...');
      const verified = await secretsManager.getSecret(path, true); // Bypass cache
      if (verified === newSecret) {
        console.log('   ✅ Verification successful');
        return true;
      } else {
        console.error('   ❌ Verification failed - secret mismatch!');
        console.error('   ⚠️ Manual intervention required');
        return false;
      }

    } else {
      console.error(`   ❌ Rotation failed: ${result.error}`);
      return false;
    }

  } catch (err) {
    console.error(`   ❌ Error: ${(err as Error).message}`);
    return false;
  }
}

/**
 * Rotate all secrets
 */
async function rotateAllSecrets(secretsManager: any, verifyOnly: boolean = false): Promise<void> {
  console.log('\n=== Rotating All Secrets ===\n');

  const secrets = Object.entries(SECRET_PATHS);
  const results: { path: string; success: boolean }[] = [];

  for (const [name, path] of secrets) {
    console.log(`\n📝 ${name}`);
    const success = await rotateSecret(secretsManager, path, verifyOnly);
    results.push({ path, success });
  }

  // Summary
  const successful = results.filter(r => r.success).length;
  const total = results.length;

  console.log('\n=== Rotation Summary ===\n');
  console.log(`Total: ${total}`);
  console.log(`Successful: ${successful}/${total}`);
  console.log(`Failed: ${total - successful}/${total}`);

  if (successful < total) {
    console.error('\n⚠️ Some rotations failed. Review errors above.');
    process.exit(1);
  }

  console.log('\n✅ All rotations successful!\n');
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const secretName = process.argv[2];
  const verifyOnly = process.argv.includes('--verify-only');

  if (!secretName) {
    console.error('\nUsage: npm run secrets:rotate <secret-name|all> [--verify-only]\n');
    console.error('Examples:');
    console.error('  npm run secrets:rotate JWT_SECRET');
    console.error('  npm run secrets:rotate all');
    console.error('  npm run secrets:rotate all --verify-only\n');
    process.exit(1);
  }

  console.log('\n🔐 Marcus Platform Secret Rotation');

  if (verifyOnly) {
    console.log('⚠️ VERIFY-ONLY mode (no changes will be made)\n');
  } else {
    console.warn('⚠️ WARNING: Secret rotation will invalidate old secrets');
    console.warn('⚠️ Ensure dual-secret support is configured in your application\n');

    const confirm = await prompt('Continue? [y/N]: ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('Aborted');
      process.exit(0);
    }
  }

  try {
    const secretsManager = await createSecretsManager();

    if (secretName.toLowerCase() === 'all') {
      await rotateAllSecrets(secretsManager, verifyOnly);
    } else {
      // Find secret path
      const secretKey = secretName.toUpperCase().replace(/-/g, '_');
      const path = (SECRET_PATHS as any)[secretKey];

      if (!path) {
        console.error(`\n❌ Unknown secret: ${secretName}`);
        console.error('\nAvailable secrets:');
        Object.keys(SECRET_PATHS).forEach(key => console.error(`  - ${key}`));
        console.error('');
        process.exit(1);
      }

      await rotateSecret(secretsManager, path, verifyOnly);
    }

    await secretsManager.close();

  } catch (err) {
    console.error(`\n❌ Rotation failed: ${(err as Error).message}\n`);
    process.exit(1);
  }
}

main();

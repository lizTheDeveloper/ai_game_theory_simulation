#!/usr/bin/env npx tsx
/**
 * MARCUS 3.0 Citation Integrity Platform
 * Secrets Migration Tool
 *
 * Migrates secrets from environment variables to Vault/AWS Secrets Manager.
 *
 * Usage:
 *   npm run secrets:migrate <target-backend>
 *   npm run secrets:migrate vault
 *   npm run secrets:migrate aws
 *
 * @author Marcus (Platform Engineer)
 */

import * as readline from 'readline';
import {
  createEnvSecretsManager,
  createVaultSecretsManager,
  createAWSSecretsManager,
  SECRET_PATHS,
} from '../../src/platform/secrets/config';
import { SecretsManager } from '../../src/platform/secrets/secretsManager';

// ============================================================================
// Utilities
// ============================================================================

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
// Migration
// ============================================================================

interface MigrationResult {
  path: string;
  success: boolean;
  error?: string;
}

/**
 * Migrate secrets from source to target backend
 */
async function migrateSecrets(
  source: SecretsManager,
  target: SecretsManager,
  dryRun: boolean = false
): Promise<void> {
  console.log('\n=== Marcus Platform Secrets Migration ===\n');

  const secretPaths = Object.entries(SECRET_PATHS);
  const results: MigrationResult[] = [];

  console.log(`📦 Migrating ${secretPaths.length} secrets...`);
  console.log(`   Source: ${(source as any).backend.name}`);
  console.log(`   Target: ${(target as any).backend.name}`);
  console.log(`   Dry run: ${dryRun ? 'YES' : 'NO'}\n`);

  for (const [name, path] of secretPaths) {
    console.log(`\n🔐 ${name}`);
    console.log(`   Path: ${path}`);

    const result: MigrationResult = {
      path,
      success: false,
    };

    try {
      // Fetch from source
      console.log('   📥 Fetching from source...');
      const value = await source.getSecret(path);
      console.log(`   ✅ Found (${value.length} chars)`);

      // Check if exists in target
      let existsInTarget = false;
      try {
        await target.getSecret(path);
        existsInTarget = true;
      } catch {
        // Doesn't exist in target
      }

      if (existsInTarget) {
        console.log('   ⚠️ Already exists in target');
        const overwrite = await prompt('   Overwrite? [y/N]: ');
        if (overwrite.toLowerCase() !== 'y') {
          console.log('   ⏭️ Skipped');
          continue;
        }
      }

      // Write to target (if not dry run)
      if (!dryRun) {
        console.log('   📤 Writing to target...');
        await target.setSecret(path, value);
        console.log('   ✅ Migrated successfully');
      } else {
        console.log('   ✅ Would migrate (dry run)');
      }

      result.success = true;

    } catch (err) {
      const error = (err as Error).message;
      result.success = false;
      result.error = error;

      console.error(`   ❌ Migration failed: ${error}`);
    }

    results.push(result);
  }

  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;

  console.log('\n=== Migration Summary ===\n');
  console.log(`Total: ${total}`);
  console.log(`Successful: ${successful}/${total}`);
  console.log(`Failed: ${failed}/${total}`);

  if (failed > 0) {
    console.error('\n⚠️ Some migrations failed:');
    results
      .filter(r => !r.success)
      .forEach(r => console.error(`  - ${r.path}: ${r.error}`));
  }

  if (dryRun) {
    console.log('\n⚠️ This was a dry run. No changes were made.');
    console.log('   Run without --dry-run to perform actual migration.\n');
  } else if (successful === total) {
    console.log('\n✅ All secrets migrated successfully!\n');
    console.log('📝 Next steps:');
    console.log('  1. Update SECRETS_BACKEND environment variable');
    console.log('  2. Restart application with new backend');
    console.log('  3. Verify all secrets accessible');
    console.log('  4. Remove old .env.secrets file\n');
  } else {
    console.error('\n⚠️ Migration incomplete. Fix errors and retry.\n');
    process.exit(1);
  }
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const targetBackend = process.argv[2];
  const dryRun = process.argv.includes('--dry-run');

  if (!targetBackend || !['vault', 'aws'].includes(targetBackend)) {
    console.error('\nUsage: npm run secrets:migrate <vault|aws> [--dry-run]\n');
    console.error('Examples:');
    console.error('  npm run secrets:migrate vault --dry-run');
    console.error('  npm run secrets:migrate aws\n');
    process.exit(1);
  }

  console.log('\n🔐 Marcus Platform Secrets Migration');
  console.log(`   Target backend: ${targetBackend}`);

  if (!dryRun) {
    console.warn('\n⚠️ WARNING: This will migrate secrets to the target backend');
    console.warn('⚠️ Existing secrets in target may be overwritten\n');

    const confirm = await prompt('Continue? [y/N]: ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('Aborted');
      process.exit(0);
    }
  }

  try {
    // Create source (environment variables)
    console.log('\n📥 Initializing source backend (environment variables)...');
    const source = createEnvSecretsManager({
      envConfig: {
        prefix: 'MARCUS_SECRET_',
        allowProduction: false,
        validateSecrets: false, // Skip validation for migration
      },
    });
    await source.initialize();

    // Create target
    console.log(`📤 Initializing target backend (${targetBackend})...`);
    let target: SecretsManager;

    switch (targetBackend) {
      case 'vault':
        target = createVaultSecretsManager();
        break;
      case 'aws':
        target = createAWSSecretsManager();
        break;
      default:
        throw new Error(`Unknown target backend: ${targetBackend}`);
    }

    await target.initialize();

    // Health check target
    console.log('🏥 Checking target backend health...');
    const health = await target.healthCheck();
    if (!health.healthy) {
      throw new Error(`Target backend unhealthy: ${health.error}`);
    }
    console.log('✅ Target backend healthy');

    // Migrate
    await migrateSecrets(source, target, dryRun);

    // Close
    await source.close();
    await target.close();

  } catch (err) {
    console.error(`\n❌ Migration failed: ${(err as Error).message}\n`);
    process.exit(1);
  }
}

main();

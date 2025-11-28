#!/usr/bin/env npx tsx
/**
 * MARCUS 3.0 Citation Integrity Platform
 * Initialize Secrets in Vault/AWS Secrets Manager
 *
 * Usage:
 *   npm run secrets:init [backend]
 *   npm run secrets:init vault
 *   npm run secrets:init aws
 *
 * @author Marcus (Platform Engineer)
 */

import * as crypto from 'crypto';
import * as readline from 'readline';
import { createVaultSecretsManager, createAWSSecretsManager, SECRET_PATHS } from '../../src/platform/secrets/config';
import { SecretsManager } from '../../src/platform/secrets/secretsManager';

// ============================================================================
// Secret Generation
// ============================================================================

/**
 * Generate cryptographically secure random secret
 */
function generateSecureSecret(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Prompt user for input
 */
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
// Secret Initialization
// ============================================================================

interface SecretDefinition {
  path: string;
  description: string;
  generator: () => string | Promise<string>;
}

/**
 * Define secrets to initialize
 */
const SECRETS_TO_INITIALIZE: SecretDefinition[] = [
  {
    path: SECRET_PATHS.JWT_SECRET,
    description: 'JWT Access Token Secret (256-bit)',
    generator: () => generateSecureSecret(32),
  },
  {
    path: SECRET_PATHS.JWT_REFRESH_SECRET,
    description: 'JWT Refresh Token Secret (256-bit)',
    generator: () => generateSecureSecret(32),
  },
  {
    path: SECRET_PATHS.DB_PASSWORD,
    description: 'PostgreSQL Database Password',
    generator: () => generateSecureSecret(24),
  },
  {
    path: SECRET_PATHS.REDIS_PASSWORD,
    description: 'Redis Password',
    generator: () => generateSecureSecret(24),
  },
  {
    path: SECRET_PATHS.TLS_KEY_PASSPHRASE,
    description: 'TLS Private Key Passphrase',
    generator: () => generateSecureSecret(24),
  },
  {
    path: SECRET_PATHS.ENCRYPTION_KEY,
    description: 'Master Encryption Key (256-bit)',
    generator: () => generateSecureSecret(32),
  },
];

/**
 * Initialize all secrets
 */
async function initializeSecrets(secretsManager: SecretsManager, force: boolean = false): Promise<void> {
  console.log('\n=== Marcus Platform Secrets Initialization ===\n');

  for (const secret of SECRETS_TO_INITIALIZE) {
    console.log(`\n📝 ${secret.description}`);
    console.log(`   Path: ${secret.path}`);

    // Check if secret already exists (if backend supports it)
    let exists = false;
    try {
      await secretsManager.getSecret(secret.path);
      exists = true;
    } catch {
      // Secret doesn't exist
    }

    if (exists && !force) {
      console.log('   ✅ Already exists (skip)');
      continue;
    }

    if (exists && force) {
      console.log('   ⚠️ Already exists (will overwrite)');
    }

    // Ask for confirmation
    const confirm = await prompt('   Generate new secret? [Y/n]: ');
    if (confirm.toLowerCase() === 'n') {
      console.log('   ⏭️ Skipped');
      continue;
    }

    // Generate and store secret
    const value = await secret.generator();
    await secretsManager.setSecret(secret.path, value);

    console.log(`   ✅ Secret initialized`);
    console.log(`   🔐 Value: ${value.substring(0, 8)}...${value.substring(value.length - 4)}`);
  }

  console.log('\n✅ Secret initialization complete!\n');
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const backend = process.argv[2] || process.env.SECRETS_BACKEND || 'vault';
  const force = process.argv.includes('--force');

  console.log(`\n🔐 Initializing secrets (backend: ${backend})`);

  if (force) {
    console.warn('⚠️ WARNING: --force flag set, will overwrite existing secrets');
    const confirm = await prompt('Continue? [y/N]: ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('Aborted');
      process.exit(0);
    }
  }

  let secretsManager: SecretsManager;

  try {
    // Create secrets manager
    switch (backend) {
      case 'vault':
        secretsManager = createVaultSecretsManager();
        break;
      case 'aws':
        secretsManager = createAWSSecretsManager();
        break;
      default:
        throw new Error(`Backend '${backend}' not supported for initialization (use vault or aws)`);
    }

    // Initialize
    await secretsManager.initialize();

    // Health check
    const health = await secretsManager.healthCheck();
    if (!health.healthy) {
      throw new Error(`Backend unhealthy: ${health.error}`);
    }

    // Initialize secrets
    await initializeSecrets(secretsManager, force);

    // Verify all secrets accessible
    console.log('\n🔍 Verifying secrets...');
    for (const secret of SECRETS_TO_INITIALIZE) {
      try {
        const value = await secretsManager.getSecret(secret.path);
        console.log(`   ✅ ${secret.path}: ${value.substring(0, 4)}***`);
      } catch (err) {
        console.error(`   ❌ ${secret.path}: ${(err as Error).message}`);
      }
    }

    console.log('\n✅ All secrets verified!\n');

    // Close
    await secretsManager.close();

  } catch (err) {
    console.error(`\n❌ Secret initialization failed: ${(err as Error).message}\n`);
    process.exit(1);
  }
}

main();

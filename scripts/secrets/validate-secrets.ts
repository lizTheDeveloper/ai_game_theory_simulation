#!/usr/bin/env npx tsx
/**
 * MARCUS 3.0 Citation Integrity Platform
 * Validate Secrets Accessibility
 *
 * Verifies all required secrets are accessible and valid.
 *
 * Usage:
 *   npm run secrets:validate [backend]
 *
 * @author Marcus (Platform Engineer)
 */

import { createSecretsManager, SECRET_PATHS } from '../../src/platform/secrets/config';

// ============================================================================
// Validation
// ============================================================================

interface ValidationResult {
  path: string;
  accessible: boolean;
  valid: boolean;
  issues: string[];
}

/**
 * Validate secret value
 */
function validateSecretValue(path: string, value: string): string[] {
  const issues: string[] = [];

  // Check minimum length (128 bits = 32 hex chars)
  if (value.length < 32) {
    issues.push(`Too short (${value.length} chars, minimum 32)`);
  }

  // Check entropy
  const uniqueChars = new Set(value).size;
  if (uniqueChars < 16) {
    issues.push(`Low entropy (${uniqueChars} unique characters)`);
  }

  // Check for common weak patterns
  const weakPatterns = ['password', 'secret', '123456', 'changeme', 'admin', 'test'];
  for (const pattern of weakPatterns) {
    if (value.toLowerCase().includes(pattern)) {
      issues.push(`Contains weak pattern: '${pattern}'`);
    }
  }

  // Check if hex-encoded (expected for generated secrets)
  if (path.includes('jwt') || path.includes('encryption')) {
    if (!/^[0-9a-f]+$/i.test(value)) {
      issues.push('Not hex-encoded (expected for cryptographic secrets)');
    }
  }

  return issues;
}

/**
 * Validate all secrets
 */
async function validateSecrets(): Promise<void> {
  console.log('\n=== Marcus Platform Secrets Validation ===\n');

  const secretsManager = await createSecretsManager();
  const results: ValidationResult[] = [];

  // Required secrets
  const requiredSecrets = Object.entries(SECRET_PATHS);

  console.log(`🔍 Validating ${requiredSecrets.length} required secrets...\n`);

  for (const [name, path] of requiredSecrets) {
    const result: ValidationResult = {
      path,
      accessible: false,
      valid: false,
      issues: [],
    };

    try {
      // Try to fetch secret
      const value = await secretsManager.getSecret(path);
      result.accessible = true;

      // Validate value
      const issues = validateSecretValue(path, value);
      result.issues = issues;
      result.valid = issues.length === 0;

      // Log result
      if (result.valid) {
        console.log(`✅ ${name}`);
        console.log(`   Path: ${path}`);
        console.log(`   Value: ${value.substring(0, 8)}...${value.substring(value.length - 4)}`);
        console.log(`   Length: ${value.length} chars`);
      } else {
        console.log(`⚠️ ${name}`);
        console.log(`   Path: ${path}`);
        console.log(`   Issues:`);
        issues.forEach(issue => console.log(`     - ${issue}`));
      }

    } catch (err) {
      result.accessible = false;
      result.valid = false;
      result.issues.push((err as Error).message);

      console.log(`❌ ${name}`);
      console.log(`   Path: ${path}`);
      console.log(`   Error: ${(err as Error).message}`);
    }

    console.log('');
    results.push(result);
  }

  // Summary
  const accessible = results.filter(r => r.accessible).length;
  const valid = results.filter(r => r.valid).length;
  const total = results.length;

  console.log('\n=== Summary ===\n');
  console.log(`Total secrets: ${total}`);
  console.log(`Accessible: ${accessible}/${total} (${Math.round(accessible / total * 100)}%)`);
  console.log(`Valid: ${valid}/${total} (${Math.round(valid / total * 100)}%)`);

  // Health check
  console.log('\n🏥 Backend health check...');
  const health = await secretsManager.healthCheck();
  if (health.healthy) {
    console.log(`✅ Backend healthy (latency: ${health.latency}ms)`);
  } else {
    console.log(`❌ Backend unhealthy: ${health.error}`);
  }

  // Cache stats (if available)
  const cacheStats = secretsManager.getCacheStats();
  if (cacheStats.size > 0) {
    console.log(`\n📊 Cache: ${cacheStats.size}/${cacheStats.maxSize} entries`);
  }

  await secretsManager.close();

  // Exit with error if any secrets invalid
  if (valid < total) {
    console.log(`\n⚠️ ${total - valid} secret(s) invalid or inaccessible\n`);
    process.exit(1);
  }

  console.log('\n✅ All secrets valid!\n');
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  try {
    await validateSecrets();
  } catch (err) {
    console.error(`\n❌ Validation failed: ${(err as Error).message}\n`);
    process.exit(1);
  }
}

main();

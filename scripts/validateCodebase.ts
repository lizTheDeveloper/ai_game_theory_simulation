/**
 * Comprehensive Codebase Validation
 *
 * Runs all validation checks:
 * 1. Property access patterns (incorrect paths)
 * 2. Semantic duplicates (similar property names)
 * 3. TypeScript type checking
 * 4. NaN-prone patterns (defensive fallbacks, as any)
 * 5. Non-deterministic code (Math.random in simulation)
 *
 * Use this before commits or for codebase health checks.
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface CheckResult {
  name: string;
  passed: boolean;
  issueCount: number;
  message: string;
  details?: string;
}

const results: CheckResult[] = [];

function runCheck(
  name: string,
  command: string,
  parser: (output: string) => { passed: boolean; count: number; message: string }
): void {
  console.log(`\n🔍 ${name}...`);

  try {
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const result = parser(output);

    results.push({
      name,
      passed: result.passed,
      issueCount: result.count,
      message: result.message
    });

    if (result.passed) {
      console.log(`✅ ${result.message}`);
    } else {
      console.log(`❌ ${result.message}`);
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    results.push({
      name,
      passed: false,
      issueCount: 1,
      message: `Check failed: ${errorMessage.substring(0, 100)}`
    });
    console.log(`❌ Check failed`);
  }
}

console.log('🔬 Comprehensive Codebase Validation\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// 1. Property access patterns
runCheck(
  'Property Access Patterns',
  'npx tsx scripts/validatePropertyAccessSimple.ts',
  (output) => {
    const match = output.match(/Found (\d+) potential issues/);
    const count = match ? parseInt(match[1]) : 0;
    return {
      passed: count === 0,
      count,
      message: count === 0
        ? 'No incorrect property patterns'
        : `${count} incorrect property patterns found`
    };
  }
);

// 2. Semantic duplicates
runCheck(
  'Semantic Duplicates',
  'npx tsx scripts/detectSemanticDuplicates.ts',
  (output) => {
    const match = output.match(/Found (\d+) potential duplicate groups/);
    const count = match ? parseInt(match[1]) : 0;
    // Note: Many duplicates are intentional, so we warn but don't fail
    return {
      passed: true,
      count,
      message: count === 0
        ? 'No semantic duplicates'
        : `${count} duplicate groups (review docs/semantic-duplicates.md)`
    };
  }
);

// 3. TypeScript type checking
runCheck(
  'TypeScript Type Checking',
  'npx tsc --noEmit 2>&1 || true',
  (output) => {
    const hasErrors = output.includes('error TS');
    const errorMatch = output.match(/Found (\d+) errors?/);
    const count = errorMatch ? parseInt(errorMatch[1]) : 0;
    return {
      passed: !hasErrors,
      count,
      message: hasErrors
        ? `${count} TypeScript errors`
        : 'All types valid'
    };
  }
);

// 4. Defensive programming patterns
console.log('\n🔍 Defensive Programming Anti-Patterns...');
const simFiles = execSync('find src/simulation -name "*.ts" ! -name "*.test.ts"', {
  encoding: 'utf-8'
}).trim().split('\n');

let defensiveCount = 0;
for (const file of simFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const matches = content.match(/(?:\|\| 0|\|\| ''|\|\| \[\]|\?\? 0|\?\? ''|\?\? \[\])/g);
  if (matches) {
    defensiveCount += matches.length;
  }
}

results.push({
  name: 'Defensive Fallbacks',
  passed: defensiveCount === 0,
  issueCount: defensiveCount,
  message: defensiveCount === 0
    ? 'No defensive fallbacks'
    : `${defensiveCount} defensive fallback patterns (use assertions instead)`
});

console.log(defensiveCount === 0
  ? '✅ No defensive fallbacks'
  : `⚠️  ${defensiveCount} defensive fallback patterns`
);

// 5. (as any) casts
console.log('\n🔍 Type Safety (as any casts)...');
let asAnyCount = 0;
for (const file of simFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const matches = content.match(/as any/g);
  if (matches) {
    asAnyCount += matches.length;
  }
}

results.push({
  name: 'Type Casts',
  passed: asAnyCount === 0,
  issueCount: asAnyCount,
  message: asAnyCount === 0
    ? 'No type casts'
    : `${asAnyCount} 'as any' casts (fix type definitions instead)`
});

console.log(asAnyCount === 0
  ? '✅ No type casts'
  : `⚠️  ${asAnyCount} 'as any' casts`
);

// 6. Math.random() in simulation
console.log('\n🔍 Deterministic Simulation...');
let randomCount = 0;
for (const file of simFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const matches = content.match(/Math\.random\(\)/g);
  if (matches) {
    randomCount += matches.length;
  }
}

results.push({
  name: 'Deterministic Code',
  passed: randomCount === 0,
  issueCount: randomCount,
  message: randomCount === 0
    ? 'All random usage is deterministic'
    : `${randomCount} uses of Math.random() (use RNG function instead)`
});

console.log(randomCount === 0
  ? '✅ All random usage is deterministic'
  : `❌ ${randomCount} uses of Math.random()`
);

// Summary
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('\n📊 Summary\n');

const failed = results.filter(r => !r.passed);
const warnings = results.filter(r => r.passed && r.issueCount > 0);

for (const result of results) {
  const icon = result.passed ? '✅' : '❌';
  console.log(`${icon} ${result.name}: ${result.message}`);
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (failed.length > 0) {
  console.log(`\n❌ ${failed.length} checks FAILED`);
  console.log('\nFailed checks:');
  for (const result of failed) {
    console.log(`  - ${result.name}: ${result.message}`);
  }
} else if (warnings.length > 0) {
  console.log(`\n⚠️  ${warnings.length} checks passed with warnings`);
} else {
  console.log('\n✅ All checks PASSED!');
}

console.log('\n📄 Reports generated:');
console.log('  - docs/property-access-issues.md');
console.log('  - docs/semantic-duplicates.md');

// Exit with error code if any critical checks failed
const criticalFailures = results.filter(r =>
  !r.passed && ['Deterministic Code', 'Property Access Patterns'].includes(r.name)
);

if (criticalFailures.length > 0) {
  process.exit(1);
}

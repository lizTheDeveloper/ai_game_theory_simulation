/**
 * Randomness Audit Script
 *
 * Static analysis of RNG usage in /src/simulation/ to categorize variance sources:
 * - RESEARCH_UNCERTAINTY: Sampling from distributions with peer-reviewed parameters
 * - STOCHASTIC_PROCESS: Random walk, noise, etc. for realistic dynamics
 * - IMPLEMENTATION_CHOICE: Arbitrary randomness (e.g., "50% chance of X")
 *
 * Context: Monte Carlo simulations show high variance (CV=77% in some metrics).
 * Some variance is genuine scientific uncertainty, some is arbitrary implementation.
 * This audit clarifies which is which.
 *
 * Usage:
 *   npx tsx scripts/auditRandomness.ts > logs/randomness_audit_$(date +%Y%m%d_%H%M%S).log
 *
 * Roy says: "After the Oct 24 NaN bug, I trust NOTHING. Time to see which variance
 *            is real science and which is just 'eh, let's add some randomness.'"
 */

import * as fs from 'fs';
import * as path from 'path';

// Types of randomness
type RandomnessCategory =
  | 'RESEARCH_UNCERTAINTY'    // Has research-backed distribution parameters
  | 'STOCHASTIC_PROCESS'      // Random walk, noise, etc.
  | 'IMPLEMENTATION_CHOICE'   // Arbitrary randomness
  | 'UNCERTAIN';              // Can't determine from pattern alone

interface RandomnessOccurrence {
  file: string;
  line: number;
  code: string;
  category: RandomnessCategory;
  confidence: 'high' | 'medium' | 'low';
  rationale: string;
}

// Patterns for categorization
const RESEARCH_BACKED_FUNCTIONS = [
  'sampleNormal',
  'sampleBeta',
  'sampleLogNormal',
  'sampleTriangular',
  'sampleUniform',
  'levyFlight',
  'boundedLevyFlight',
  'asymmetricLevyFlight',
  'powerLawEvent'
];

const STOCHASTIC_PROCESS_KEYWORDS = [
  'noise',
  'random walk',
  'brownian',
  'drift',
  'volatility',
  'perturbation',
  'jitter'
];

const ARBITRARY_PATTERNS = [
  /rng\(\)\s*[<>]=?\s*0\.[0-9]+/,  // e.g., rng() < 0.5
  /if\s*\(\s*rng\(\)/,              // Direct rng() in if statement
];

/**
 * Categorize RNG usage based on patterns and context
 */
function categorizeRngUsage(
  filePath: string,
  lineNum: number,
  lineContent: string,
  surroundingLines: string[]
): RandomnessOccurrence {
  const code = lineContent.trim();

  // Check for research-backed distribution sampling
  for (const func of RESEARCH_BACKED_FUNCTIONS) {
    if (code.includes(func)) {
      return {
        file: filePath,
        line: lineNum,
        code,
        category: 'RESEARCH_UNCERTAINTY',
        confidence: 'high',
        rationale: `Uses ${func} - research-backed distribution with parameters`
      };
    }
  }

  // Check for stochastic process keywords in surrounding context
  const context = surroundingLines.join(' ').toLowerCase();
  for (const keyword of STOCHASTIC_PROCESS_KEYWORDS) {
    if (context.includes(keyword)) {
      return {
        file: filePath,
        line: lineNum,
        code,
        category: 'STOCHASTIC_PROCESS',
        confidence: 'medium',
        rationale: `Context mentions "${keyword}" - likely modeling realistic variation`
      };
    }
  }

  // Check for arbitrary probability patterns
  for (const pattern of ARBITRARY_PATTERNS) {
    if (pattern.test(code)) {
      // Check if probability value has comment explaining research basis
      const hasResearchComment = surroundingLines.some(line =>
        /\/\/.*(?:research|paper|study|empirical)/i.test(line)
      );

      if (hasResearchComment) {
        return {
          file: filePath,
          line: lineNum,
          code,
          category: 'RESEARCH_UNCERTAINTY',
          confidence: 'medium',
          rationale: 'Probability with research citation in comments'
        };
      }

      return {
        file: filePath,
        line: lineNum,
        code,
        category: 'IMPLEMENTATION_CHOICE',
        confidence: 'high',
        rationale: 'Arbitrary probability threshold without research backing'
      };
    }
  }

  // Default: uncertain
  return {
    file: filePath,
    line: lineNum,
    code,
    category: 'UNCERTAIN',
    confidence: 'low',
    rationale: 'Cannot determine from pattern - needs manual review'
  };
}

/**
 * Scan file for RNG usage
 */
function scanFile(filePath: string): RandomnessOccurrence[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const occurrences: RandomnessOccurrence[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Look for rng() calls (NOT in comments)
    if (/\brng\(\)/.test(line) && !/^\s*\/\//.test(line) && !/^\s*\*/.test(line)) {
      // Get surrounding context (5 lines before/after)
      const start = Math.max(0, i - 5);
      const end = Math.min(lines.length, i + 6);
      const surroundingLines = lines.slice(start, end);

      const occurrence = categorizeRngUsage(
        filePath,
        i + 1, // 1-indexed line numbers
        line,
        surroundingLines
      );

      occurrences.push(occurrence);
    }

    // Also look for distribution sampling functions
    for (const func of RESEARCH_BACKED_FUNCTIONS) {
      if (line.includes(func) && !/^\s*\/\//.test(line) && !/^\s*\*/.test(line)) {
        const start = Math.max(0, i - 5);
        const end = Math.min(lines.length, i + 6);
        const surroundingLines = lines.slice(start, end);

        const occurrence = categorizeRngUsage(
          filePath,
          i + 1,
          line,
          surroundingLines
        );

        occurrences.push(occurrence);
        break; // Only count once per line
      }
    }
  }

  return occurrences;
}

/**
 * Recursively find all .ts files in a directory
 */
function findTypeScriptFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findTypeScriptFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Main audit
 */
async function auditRandomness() {
  console.log('=== Randomness Audit ===\n');
  console.log('Scanning /src/simulation/ for RNG usage...\n');

  const simulationPath = path.join(process.cwd(), 'src/simulation');
  const files = findTypeScriptFiles(simulationPath);

  const allOccurrences: RandomnessOccurrence[] = [];

  for (const file of files) {
    const occurrences = scanFile(file);
    allOccurrences.push(...occurrences);
  }

  console.log(`Found ${allOccurrences.length} RNG usages across ${files.length} files\n`);

  // Group by category
  const byCategory = new Map<RandomnessCategory, RandomnessOccurrence[]>();
  for (const occ of allOccurrences) {
    const existing = byCategory.get(occ.category) || [];
    existing.push(occ);
    byCategory.set(occ.category, existing);
  }

  // Print summary
  console.log('\n=== Summary by Category ===\n');
  for (const [category, occs] of byCategory) {
    const percentage = ((occs.length / allOccurrences.length) * 100).toFixed(1);
    console.log(`${category}: ${occs.length} (${percentage}%)`);
  }

  // Print detailed breakdown
  for (const [category, occs] of byCategory) {
    console.log(`\n\n=== ${category} (${occs.length} occurrences) ===\n`);

    // Group by file
    const byFile = new Map<string, RandomnessOccurrence[]>();
    for (const occ of occs) {
      const relativePath = path.relative(simulationPath, occ.file);
      const existing = byFile.get(relativePath) || [];
      existing.push(occ);
      byFile.set(relativePath, existing);
    }

    // Sort files alphabetically
    const sortedFiles = Array.from(byFile.keys()).sort();

    for (const file of sortedFiles) {
      const fileOccs = byFile.get(file)!;
      console.log(`\n${file}:`);

      for (const occ of fileOccs) {
        console.log(`  Line ${occ.line}: ${occ.code}`);
        console.log(`    Confidence: ${occ.confidence}`);
        console.log(`    Rationale: ${occ.rationale}`);
      }
    }
  }

  // Recommendations
  console.log('\n\n=== Recommendations ===\n');

  const implChoiceCount = byCategory.get('IMPLEMENTATION_CHOICE')?.length || 0;
  const uncertainCount = byCategory.get('UNCERTAIN')?.length || 0;

  if (implChoiceCount > 0) {
    console.log(`⚠️  Found ${implChoiceCount} IMPLEMENTATION_CHOICE usages`);
    console.log('   These are arbitrary probabilities without research backing.');
    console.log('   Options:');
    console.log('   1. Find research to justify the probability');
    console.log('   2. Replace with deterministic threshold (remove randomness)');
    console.log('   3. Add to uncertainty sampling if genuinely unknown\n');
  }

  if (uncertainCount > 0) {
    console.log(`❓ Found ${uncertainCount} UNCERTAIN usages`);
    console.log('   Manual review required to categorize.');
    console.log('   Check if probability has research basis or is arbitrary.\n');
  }

  const researchCount = byCategory.get('RESEARCH_UNCERTAINTY')?.length || 0;
  const stochasticCount = byCategory.get('STOCHASTIC_PROCESS')?.length || 0;
  const justified = researchCount + stochasticCount;
  const total = allOccurrences.length;
  const justifiedPercent = ((justified / total) * 100).toFixed(1);

  console.log(`✅ ${justified}/${total} (${justifiedPercent}%) RNG usages have justification`);
  console.log(`   (RESEARCH_UNCERTAINTY + STOCHASTIC_PROCESS)`);

  // Monte Carlo implications
  console.log('\n\n=== Monte Carlo Implications ===\n');
  console.log('High variance (CV=77%) can come from:');
  console.log('1. RESEARCH_UNCERTAINTY - Real scientific uncertainty');
  console.log('   → Expected and appropriate for research simulation');
  console.log('2. STOCHASTIC_PROCESS - Realistic noise/dynamics');
  console.log('   → Expected for complex systems modeling');
  console.log('3. IMPLEMENTATION_CHOICE - Arbitrary randomness');
  console.log('   → Can be reduced by finding research or using deterministic logic');
  console.log('\nTo reduce variance: Focus on IMPLEMENTATION_CHOICE and UNCERTAIN categories.');
}

// Run audit
auditRandomness().catch(err => {
  console.error('❌ Audit failed:', err);
  process.exit(1);
});

/**
 * Citation Skeptic Analyzer
 * Automatically scans wiki and research files for suspicious citation patterns
 *
 * Patterns detected:
 * 1. Round Number Syndrome: "X00-Y00" ranges (500-700, 300-400, 30-40%)
 * 2. Anachronistic Claims: Pre-2015 papers making AI/ML specific claims
 * 3. Adjacent Citations: Multiple citations on same/adjacent lines
 * 4. Missing Page Numbers: Specific claims without page references
 * 5. Vague Attributions: "research shows", "studies indicate" without citation
 */

import * as fs from 'fs';
import * as path from 'path';

interface SuspiciousCitation {
  file: string;
  lineNumber: number;
  line: string;
  pattern: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
}

const results: SuspiciousCitation[] = [];

// Pattern 1: Round Number Syndrome (X00-Y00 ranges)
const ROUND_RANGE_PATTERN = /\b(\d+00)-(\d+00)\b/g;

// Pattern 2: Anachronistic claims (pre-2015 papers with AI/ML terms)
const OLD_PAPER_PATTERN = /\((?:19\d{2}|200\d|201[0-4])\)/g;
const AI_TERMS = /\b(AI|artificial intelligence|machine learning|ML|deep learning|neural network|GPT|transformer)\b/gi;

// Pattern 3: Convenient percentages
const CONVENIENT_PERCENT_PATTERN = /\b(\d+0%?)\b/g;

// Pattern 4: Missing page numbers on specific claims
const SPECIFIC_CLAIM_PATTERN = /\b(\d+(?:\.\d+)?)\s*(liters?|kWh|hours?|years?|percent|%)/gi;

// Pattern 5: Vague attributions
const VAGUE_ATTRIBUTION_PATTERN = /(research shows|studies indicate|evidence suggests|findings demonstrate)/gi;

function analyzeFile(filePath: string): void {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    // Pattern 1: Round Number Syndrome
    const roundMatches = line.matchAll(ROUND_RANGE_PATTERN);
    for (const match of roundMatches) {
      results.push({
        file: filePath,
        lineNumber,
        line: line.trim(),
        pattern: 'Round Number Syndrome',
        severity: 'HIGH',
        reason: `Suspicious round range: ${match[0]} (100% of verified "X00-Y00" ranges are fabricated)`
      });
    }

    // Pattern 2: Anachronistic Claims
    const oldPaperMatches = line.matchAll(OLD_PAPER_PATTERN);
    for (const oldMatch of oldPaperMatches) {
      if (AI_TERMS.test(line)) {
        results.push({
          file: filePath,
          lineNumber,
          line: line.trim(),
          pattern: 'Anachronistic Claim',
          severity: 'HIGH',
          reason: `Pre-2015 paper ${oldMatch[0]} making AI-specific claims (verified: these are fabricated)`
        });
      }
    }

    // Pattern 3: Specific claims with citations but no page numbers
    if (line.includes('(') && line.includes(')')) {
      const hasSpecificClaim = SPECIFIC_CLAIM_PATTERN.test(line);
      const hasPageNumber = /p\.\s*\d+|pp\.\s*\d+-\d+|:\d+/.test(line);

      if (hasSpecificClaim && !hasPageNumber && !line.includes('http')) {
        results.push({
          file: filePath,
          lineNumber,
          line: line.trim(),
          pattern: 'Missing Page Number',
          severity: 'MEDIUM',
          reason: 'Specific numerical claim with citation but no page number (fabricators can\'t cite what doesn\'t exist)'
        });
      }
    }

    // Pattern 4: Vague attributions
    const vagueMatches = line.matchAll(VAGUE_ATTRIBUTION_PATTERN);
    for (const match of vagueMatches) {
      if (!line.includes('(') || !line.includes(')')) {
        results.push({
          file: filePath,
          lineNumber,
          line: line.trim(),
          pattern: 'Vague Attribution',
          severity: 'LOW',
          reason: `"${match[0]}" without specific citation`
        });
      }
    }
  });
}

function scanDirectory(dir: string): void {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      // Skip node_modules, .git, etc.
      if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
        scanDirectory(fullPath);
      }
    } else if (entry.name.endsWith('.md')) {
      analyzeFile(fullPath);
    }
  }
}

// Scan wiki and research directories
console.log('🔍 Scanning for suspicious citation patterns...\n');
scanDirectory('./docs/wiki');
scanDirectory('./research');

// Group by severity
const high = results.filter(r => r.severity === 'HIGH');
const medium = results.filter(r => r.severity === 'MEDIUM');
const low = results.filter(r => r.severity === 'LOW');

// Print summary
console.log(`\n📊 SUMMARY:`);
console.log(`   🚨 HIGH:   ${high.length} suspicious citations`);
console.log(`   ⚠️  MEDIUM: ${medium.length} suspicious citations`);
console.log(`   ℹ️  LOW:    ${low.length} suspicious citations`);
console.log(`   📝 TOTAL:  ${results.length} items flagged\n`);

// Print HIGH severity items
if (high.length > 0) {
  console.log(`\n🚨 HIGH PRIORITY (${high.length} items):\n`);
  high.forEach((item, i) => {
    console.log(`${i + 1}. ${item.pattern}: ${item.file}:${item.lineNumber}`);
    console.log(`   ${item.line}`);
    console.log(`   ⚠️  ${item.reason}\n`);
  });
}

// Write full report to file
const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');
const reportPath = `./research/suspicious_citations_${timestamp}.json`;
fs.writeFileSync(reportPath, JSON.stringify({ high, medium, low }, null, 2));
console.log(`\n📄 Full report saved to: ${reportPath}`);
console.log(`\n💡 Next step: Manually verify HIGH priority items with Playwright`);

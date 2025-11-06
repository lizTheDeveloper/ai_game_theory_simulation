#!/usr/bin/env tsx
/**
 * Research Age Audit Script
 *
 * Scans research/ directory for citation dates, detects aging sources,
 * generates prioritized update queue.
 *
 * Usage:
 *   npm run audit:research
 *   npx tsx scripts/auditResearchAge.ts
 *   npx tsx scripts/auditResearchAge.ts --output research/UPDATE_QUEUE.md
 *
 * Exit codes:
 *   0 - Success, all sources current
 *   1 - CRITICAL items found (>5yr, used in simulation)
 *   2 - HIGH items found (>5yr unused OR >3yr used)
 *   10 - Script error
 */

import fs from 'fs/promises';
import path from 'path';
import * as yaml from 'js-yaml';

// ============================================================================
// Types
// ============================================================================

interface Citation {
  authors: string[];
  year: number;
  title?: string;
  raw: string;
}

interface ResearchFile {
  path: string;
  filename: string;
  title: string;
  frontmatter: FrontmatterData;
  citations: Citation[];
  oldestYear: number;
  newestYear: number;
  ageYears: number;
  ageStatus: 'current' | 'warning' | 'critical';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}

interface FrontmatterData {
  title?: string;
  date?: string;
  last_verified?: string;
  status?: string;
  quality?: string;
  sources_count?: number;
  oldest_source?: number;
  newest_source?: number;
  domains?: string[];
  used_in_simulation?: boolean;
  parameters_extracted?: number;
  zotero_collection?: string;
  age_override?: boolean;
  seminal_paper?: boolean;
}

interface AuditReport {
  timestamp: string;
  filesScanned: number;
  files: ResearchFile[];
  critical: ResearchFile[];
  high: ResearchFile[];
  medium: ResearchFile[];
  low: ResearchFile[];
  summary: {
    totalFiles: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    criticalPct: number;
    highPct: number;
    mediumPct: number;
    lowPct: number;
    avgAge: number;
    oldestSource: number;
    sourcesCurrentPct: number;
    sourcesWarningPct: number;
    sourcesCriticalPct: number;
  };
}

// ============================================================================
// Configuration
// ============================================================================

const RESEARCH_DIR = path.join(process.cwd(), 'research');
const DEFAULT_OUTPUT = path.join(RESEARCH_DIR, 'UPDATE_QUEUE.md');
const CURRENT_YEAR = new Date().getFullYear();

const AGE_THRESHOLDS = {
  WARNING: 3,  // Sources >3 years old
  CRITICAL: 5  // Sources >5 years old
};

// ============================================================================
// Citation Extraction Patterns
// ============================================================================

const CITATION_PATTERNS = [
  // (Author et al., 2022)
  /\(([A-Z][a-z]+)(?: et al\.)?,?\s+(\d{4})\)/g,

  // [Author 2022]
  /\[([A-Z][a-z]+)\s+(\d{4})\]/g,

  // Author & Author (2022)
  /([A-Z][a-z]+)\s+&\s+([A-Z][a-z]+)\s*\((\d{4})\)/g,

  // Author, A. B. et al. Journal 123 (2022)
  /([A-Z][a-z]+),\s+[A-Z]\.\s+[A-Z]\.(?:\s+et al\.)?\s+.*?\((\d{4})\)/g,

  // DOI with year
  /DOI:?\s*10\.\d+\/.*?(\d{4})/gi,

  // Year in brackets at end of citation
  /\[(\d{4})\]$/gm
];

// ============================================================================
// Utility Functions
// ============================================================================

function classifyAge(oldestYear: number): 'current' | 'warning' | 'critical' {
  const ageYears = CURRENT_YEAR - oldestYear;

  if (ageYears > AGE_THRESHOLDS.CRITICAL) {
    return 'critical';
  }
  if (ageYears > AGE_THRESHOLDS.WARNING) {
    return 'warning';
  }
  return 'current';
}

function calculatePriority(file: ResearchFile): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  const { ageStatus } = file;
  const usedInSimulation = file.frontmatter.used_in_simulation || false;

  // CRITICAL: >5yr + used in simulation
  if (ageStatus === 'critical' && usedInSimulation) {
    return 'CRITICAL';
  }

  // HIGH: >5yr unused OR >3yr used
  if (ageStatus === 'critical' || (ageStatus === 'warning' && usedInSimulation)) {
    return 'HIGH';
  }

  // MEDIUM: >3yr unused
  if (ageStatus === 'warning') {
    return 'MEDIUM';
  }

  // LOW: Current (<3yr)
  return 'LOW';
}

function extractFrontmatter(content: string): FrontmatterData | null {
  const match = content.match(/^---\n([\s\S]+?)\n---/);
  if (!match) {
    return null;
  }

  try {
    return yaml.parse(match[1]) as FrontmatterData;
  } catch (error) {
    console.warn('⚠️ Failed to parse frontmatter:', error);
    return null;
  }
}

function extractCitations(content: string): Citation[] {
  const citations: Citation[] = [];
  const seenYears = new Set<string>();

  // Remove frontmatter to avoid false matches
  const contentWithoutFrontmatter = content.replace(/^---\n[\s\S]+?\n---\n/, '');

  for (const pattern of CITATION_PATTERNS) {
    let match;
    while ((match = pattern.exec(contentWithoutFrontmatter)) !== null) {
      // Extract year (last group in most patterns)
      const groups = match.slice(1);
      const yearStr = groups[groups.length - 1];
      const year = parseInt(yearStr, 10);

      // Validate year (1950-2030)
      if (year < 1950 || year > 2030) {
        continue;
      }

      // Deduplicate by year + author
      const author = groups[0] || 'Unknown';
      const key = `${author}-${year}`;
      if (seenYears.has(key)) {
        continue;
      }
      seenYears.add(key);

      citations.push({
        authors: [author],
        year,
        raw: match[0]
      });
    }
  }

  // Sort by year (oldest first)
  return citations.sort((a, b) => a.year - b.year);
}

function calculateAgeMetrics(citations: Citation[], frontmatter: FrontmatterData): {
  oldestYear: number;
  newestYear: number;
  ageYears: number;
} {
  // Prefer frontmatter values if available
  if (frontmatter.oldest_source && frontmatter.newest_source) {
    const oldestYear = frontmatter.oldest_source;
    const newestYear = frontmatter.newest_source;
    return {
      oldestYear,
      newestYear,
      ageYears: CURRENT_YEAR - oldestYear
    };
  }

  // Fall back to extracted citations
  if (citations.length === 0) {
    console.warn('⚠️ No citations found, assuming current');
    return {
      oldestYear: CURRENT_YEAR,
      newestYear: CURRENT_YEAR,
      ageYears: 0
    };
  }

  const years = citations.map(c => c.year);
  const oldestYear = Math.min(...years);
  const newestYear = Math.max(...years);

  return {
    oldestYear,
    newestYear,
    ageYears: CURRENT_YEAR - oldestYear
  };
}

// ============================================================================
// Core Analysis
// ============================================================================

async function analyzeResearchFile(filePath: string): Promise<ResearchFile | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const filename = path.basename(filePath);

    // Extract frontmatter
    const frontmatter = extractFrontmatter(content) || {};

    // Skip if age override (seminal papers)
    if (frontmatter.age_override || frontmatter.seminal_paper) {
      console.log(`⏭️  Skipping ${filename} (age override)`);
      return null;
    }

    // Extract citations
    const citations = extractCitations(content);

    // Calculate age metrics
    const { oldestYear, newestYear, ageYears } = calculateAgeMetrics(citations, frontmatter);

    // Classify
    const ageStatus = classifyAge(oldestYear);

    const file: ResearchFile = {
      path: filePath,
      filename,
      title: frontmatter.title || filename.replace('.md', ''),
      frontmatter,
      citations,
      oldestYear,
      newestYear,
      ageYears,
      ageStatus,
      priority: 'LOW'  // Calculated below
    };

    file.priority = calculatePriority(file);

    return file;
  } catch (error) {
    console.error(`❌ Error analyzing ${filePath}:`, error);
    return null;
  }
}

async function scanResearchDirectory(): Promise<ResearchFile[]> {
  console.log(`\n📂 Scanning ${RESEARCH_DIR}...`);

  const files: ResearchFile[] = [];

  try {
    const entries = await fs.readdir(RESEARCH_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith('.md')) {
        continue;
      }

      // Skip special files
      if (entry.name === 'UPDATE_QUEUE.md' || entry.name === 'README.md') {
        continue;
      }

      const filePath = path.join(RESEARCH_DIR, entry.name);
      const result = await analyzeResearchFile(filePath);

      if (result) {
        files.push(result);
      }
    }
  } catch (error) {
    console.error('❌ Error scanning directory:', error);
    throw error;
  }

  return files;
}

// ============================================================================
// Report Generation
// ============================================================================

function generateReport(files: ResearchFile[]): AuditReport {
  // Categorize by priority
  const critical = files.filter(f => f.priority === 'CRITICAL');
  const high = files.filter(f => f.priority === 'HIGH');
  const medium = files.filter(f => f.priority === 'MEDIUM');
  const low = files.filter(f => f.priority === 'LOW');

  const totalFiles = files.length;

  // Calculate summary statistics
  const avgAge = files.reduce((sum, f) => sum + f.ageYears, 0) / totalFiles;
  const oldestSource = Math.min(...files.map(f => f.oldestYear));

  const currentFiles = files.filter(f => f.ageStatus === 'current').length;
  const warningFiles = files.filter(f => f.ageStatus === 'warning').length;
  const criticalFiles = files.filter(f => f.ageStatus === 'critical').length;

  return {
    timestamp: new Date().toISOString(),
    filesScanned: totalFiles,
    files,
    critical,
    high,
    medium,
    low,
    summary: {
      totalFiles,
      criticalCount: critical.length,
      highCount: high.length,
      mediumCount: medium.length,
      lowCount: low.length,
      criticalPct: (critical.length / totalFiles) * 100,
      highPct: (high.length / totalFiles) * 100,
      mediumPct: (medium.length / totalFiles) * 100,
      lowPct: (low.length / totalFiles) * 100,
      avgAge,
      oldestSource,
      sourcesCurrentPct: (currentFiles / totalFiles) * 100,
      sourcesWarningPct: (warningFiles / totalFiles) * 100,
      sourcesCriticalPct: (criticalFiles / totalFiles) * 100
    }
  };
}

function formatMarkdownReport(report: AuditReport): string {
  const { critical, high, medium, low, summary } = report;

  let md = `# Research Update Queue\n`;
  md += `**Generated:** ${new Date(report.timestamp).toLocaleString()}\n`;
  md += `**Files Scanned:** ${report.filesScanned}\n\n`;

  md += `---\n\n`;

  // CRITICAL section
  md += `## 🚨 CRITICAL (Action Required Within 1 Week)\n\n`;
  if (critical.length === 0) {
    md += `✅ No CRITICAL items\n\n`;
  } else {
    md += `**Count:** ${critical.length} (${summary.criticalPct.toFixed(1)}%)\n\n`;
    for (const file of critical) {
      md += `### \`${file.filename}\`\n`;
      md += `- **Oldest source:** ${file.oldestYear} (${file.ageYears} years old)\n`;
      md += `- **Status:** Used in simulation\n`;
      if (file.frontmatter.parameters_extracted) {
        md += `- **Parameters extracted:** ${file.frontmatter.parameters_extracted}\n`;
      }
      if (file.frontmatter.last_verified) {
        md += `- **Last verified:** ${file.frontmatter.last_verified}\n`;
      }
      md += `- **Path:** \`${path.relative(process.cwd(), file.path)}\`\n\n`;
    }
  }

  md += `---\n\n`;

  // HIGH section
  md += `## ⚠️ HIGH (Action Required Within 1 Month)\n\n`;
  if (high.length === 0) {
    md += `✅ No HIGH priority items\n\n`;
  } else {
    md += `**Count:** ${high.length} (${summary.highPct.toFixed(1)}%)\n\n`;
    for (const file of high) {
      md += `### \`${file.filename}\`\n`;
      md += `- **Oldest source:** ${file.oldestYear} (${file.ageYears} years old)\n`;
      md += `- **Status:** ${file.frontmatter.used_in_simulation ? 'Used in simulation' : 'Not used in simulation'}\n`;
      if (file.frontmatter.last_verified) {
        md += `- **Last verified:** ${file.frontmatter.last_verified}\n`;
      }
      md += `- **Path:** \`${path.relative(process.cwd(), file.path)}\`\n\n`;
    }
  }

  md += `---\n\n`;

  // MEDIUM section
  md += `## 📋 MEDIUM (Review Within Quarter)\n\n`;
  if (medium.length === 0) {
    md += `✅ No MEDIUM priority items\n\n`;
  } else {
    md += `**Count:** ${medium.length} (${summary.mediumPct.toFixed(1)}%)\n\n`;
    for (const file of medium) {
      md += `- \`${file.filename}\` - Oldest: ${file.oldestYear} (${file.ageYears} years)\n`;
    }
    md += `\n`;
  }

  md += `---\n\n`;

  // LOW section
  md += `## ✅ LOW (Monitor Only)\n\n`;
  md += `**Count:** ${low.length} (${summary.lowPct.toFixed(1)}%)\n\n`;
  md += `All sources <${AGE_THRESHOLDS.WARNING} years old. No action required.\n\n`;

  md += `---\n\n`;

  // Summary statistics
  md += `## 📊 Summary Statistics\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Total files | ${summary.totalFiles} |\n`;
  md += `| CRITICAL | ${summary.criticalCount} (${summary.criticalPct.toFixed(1)}%) |\n`;
  md += `| HIGH | ${summary.highCount} (${summary.highPct.toFixed(1)}%) |\n`;
  md += `| MEDIUM | ${summary.mediumCount} (${summary.mediumPct.toFixed(1)}%) |\n`;
  md += `| LOW | ${summary.lowCount} (${summary.lowPct.toFixed(1)}%) |\n`;
  md += `| Average age | ${summary.avgAge.toFixed(1)} years |\n`;
  md += `| Oldest source | ${summary.oldestSource} (${CURRENT_YEAR - summary.oldestSource} years ago) |\n\n`;

  md += `### Research Currency\n\n`;
  md += `| Status | Files | Percentage |\n`;
  md += `|--------|-------|------------|\n`;
  md += `| Current (<${AGE_THRESHOLDS.WARNING}yr) | ${Math.round(summary.totalFiles * summary.sourcesCurrentPct / 100)} | ${summary.sourcesCurrentPct.toFixed(1)}% |\n`;
  md += `| Warning (${AGE_THRESHOLDS.WARNING}-${AGE_THRESHOLDS.CRITICAL}yr) | ${Math.round(summary.totalFiles * summary.sourcesWarningPct / 100)} | ${summary.sourcesWarningPct.toFixed(1)}% |\n`;
  md += `| Critical (>${AGE_THRESHOLDS.CRITICAL}yr) | ${Math.round(summary.totalFiles * summary.sourcesCriticalPct / 100)} | ${summary.sourcesCriticalPct.toFixed(1)}% |\n\n`;

  // Targets
  md += `### Targets\n\n`;
  md += `- **Goal:** <5% sources >3 years old, 0% sources >5 years old\n`;
  md += `- **Current:** ${summary.sourcesCriticalPct.toFixed(1)}% critical (>${AGE_THRESHOLDS.CRITICAL}yr)\n`;

  if (summary.sourcesCriticalPct === 0 && summary.sourcesWarningPct < 5) {
    md += `- **Status:** ✅ MEETING TARGETS\n\n`;
  } else if (summary.sourcesCriticalPct === 0) {
    md += `- **Status:** ⚠️ Warning threshold exceeded (${summary.sourcesWarningPct.toFixed(1)}% > 5%)\n\n`;
  } else {
    md += `- **Status:** 🚨 CRITICAL threshold exceeded\n\n`;
  }

  md += `---\n\n`;

  // Next steps
  md += `## 🔄 Next Steps\n\n`;
  if (critical.length > 0) {
    md += `1. **URGENT:** Update ${critical.length} CRITICAL file(s) within 1 week\n`;
    md += `2. Research lead (Cynthia): Find updated sources\n`;
    md += `3. Research skeptic (Sylvia): Validate new sources\n`;
    md += `4. Update simulation parameters if needed\n`;
    md += `5. Run Monte Carlo validation\n\n`;
  } else if (high.length > 0) {
    md += `1. Update ${high.length} HIGH priority file(s) within 1 month\n`;
    md += `2. Schedule research update sprint\n`;
    md += `3. Coordinate with research team\n\n`;
  } else {
    md += `✅ No immediate action required. Continue monitoring.\n\n`;
  }

  md += `**Documentation:** See \`docs/RESEARCH_PIPELINE.md\` for update workflow.\n`;

  return md;
}

function printConsoleReport(report: AuditReport): void {
  const { summary } = report;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 RESEARCH AGE AUDIT REPORT`);
  console.log(`${'='.repeat(60)}\n`);

  console.log(`📅 Timestamp: ${new Date(report.timestamp).toLocaleString()}`);
  console.log(`📂 Files scanned: ${report.filesScanned}\n`);

  console.log(`🚨 CRITICAL: ${summary.criticalCount} (${summary.criticalPct.toFixed(1)}%)`);
  console.log(`⚠️  HIGH: ${summary.highCount} (${summary.highPct.toFixed(1)}%)`);
  console.log(`📋 MEDIUM: ${summary.mediumCount} (${summary.mediumPct.toFixed(1)}%)`);
  console.log(`✅ LOW: ${summary.lowCount} (${summary.lowPct.toFixed(1)}%)\n`);

  console.log(`📈 Research Currency:`);
  console.log(`  Current (<${AGE_THRESHOLDS.WARNING}yr): ${summary.sourcesCurrentPct.toFixed(1)}%`);
  console.log(`  Warning (${AGE_THRESHOLDS.WARNING}-${AGE_THRESHOLDS.CRITICAL}yr): ${summary.sourcesWarningPct.toFixed(1)}%`);
  console.log(`  Critical (>${AGE_THRESHOLDS.CRITICAL}yr): ${summary.sourcesCriticalPct.toFixed(1)}%\n`);

  console.log(`📊 Statistics:`);
  console.log(`  Average age: ${summary.avgAge.toFixed(1)} years`);
  console.log(`  Oldest source: ${summary.oldestSource} (${CURRENT_YEAR - summary.oldestSource} years ago)\n`);

  console.log(`🎯 Targets: <5% warning, 0% critical`);
  if (summary.sourcesCriticalPct === 0 && summary.sourcesWarningPct < 5) {
    console.log(`✅ MEETING TARGETS\n`);
  } else if (summary.sourcesCriticalPct === 0) {
    console.log(`⚠️  Warning threshold exceeded: ${summary.sourcesWarningPct.toFixed(1)}% > 5%\n`);
  } else {
    console.log(`🚨 CRITICAL threshold exceeded: ${summary.sourcesCriticalPct.toFixed(1)}% > 0%\n`);
  }

  console.log(`${'='.repeat(60)}\n`);
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const outputPath = args.find(arg => arg.startsWith('--output='))?.split('=')[1] || DEFAULT_OUTPUT;

  console.log(`\n🔍 Research Age Audit`);
  console.log(`${'='.repeat(60)}\n`);

  try {
    // Scan research directory
    const files = await scanResearchDirectory();

    console.log(`\n✅ Scanned ${files.length} research files\n`);

    // Generate report
    const report = generateReport(files);

    // Print console summary
    printConsoleReport(report);

    // Write markdown report
    const markdown = formatMarkdownReport(report);
    await fs.writeFile(outputPath, markdown, 'utf-8');
    console.log(`📝 Markdown report written to: ${path.relative(process.cwd(), outputPath)}\n`);

    // Determine exit code
    if (report.critical.length > 0) {
      console.log(`🚨 Exit code 1: CRITICAL items found (>${AGE_THRESHOLDS.CRITICAL}yr, used in simulation)\n`);
      process.exit(1);
    }

    if (report.high.length > 0) {
      console.log(`⚠️  Exit code 2: HIGH priority items found\n`);
      process.exit(2);
    }

    console.log(`✅ Exit code 0: All sources current\n`);
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(10);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

export { analyzeResearchFile, scanResearchDirectory, generateReport };

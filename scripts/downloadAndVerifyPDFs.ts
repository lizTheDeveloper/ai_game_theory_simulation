#!/usr/bin/env npx tsx

/**
 * Download all verified PDFs and prepare for Sylvia's review
 * 1. Wait for PDF search to complete
 * 2. Download all found PDFs
 * 3. Create manifest with citations
 * 4. Post to research channel
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

interface PDFResult {
  file: string;
  line: number;
  authors: string;
  year: string;
  title: string;
  doi?: string;
  pdfFound: boolean;
  pdfUrl?: string;
  method?: string;
  error?: string;
}

interface SearchResults {
  timestamp: string;
  totalCitations: number;
  pdfsFound: number;
  successRate: string;
  results: PDFResult[];
}

const PDF_DIR = path.join(__dirname, '..', 'research', 'pdfs');
const MANIFEST_FILE = path.join(__dirname, '..', 'research', 'PDF_MANIFEST.md');

/**
 * Sanitize filename
 */
function sanitizeFilename(str: string): string {
  return str
    .replace(/[^a-z0-9\s\-\_]/gi, '')
    .replace(/\s+/g, '_')
    .substring(0, 100)
    .toLowerCase();
}

/**
 * Generate PDF filename from citation
 */
function generatePDFFilename(result: PDFResult): string {
  const author = sanitizeFilename(result.authors.split(',')[0].split(' ')[0]);
  const year = result.year;
  const title = sanitizeFilename(result.title.substring(0, 40));

  return `${author}_${year}_${title}.pdf`;
}

/**
 * Download PDF from URL
 */
async function downloadPDF(url: string, outputPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    }, (response) => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          // Handle relative redirects
          const fullRedirectUrl = redirectUrl.startsWith('http')
            ? redirectUrl
            : new URL(redirectUrl, url).toString();
          console.log(`  → Redirect to: ${fullRedirectUrl}`);
          downloadPDF(fullRedirectUrl, outputPath).then(resolve);
          return;
        }
      }

      if (response.statusCode !== 200) {
        console.log(`  ✗ HTTP ${response.statusCode}`);
        resolve(false);
        return;
      }

      // Check content type
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('pdf') && !contentType.includes('octet-stream')) {
        console.log(`  ✗ Not a PDF (${contentType})`);
        resolve(false);
        return;
      }

      const file = fs.createWriteStream(outputPath);
      response.pipe(file);

      file.on('finish', () => {
        file.close();
        const stats = fs.statSync(outputPath);
        if (stats.size < 1000) {
          console.log(`  ✗ File too small (${stats.size} bytes)`);
          fs.unlinkSync(outputPath);
          resolve(false);
        } else {
          console.log(`  ✓ Downloaded (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
          resolve(true);
        }
      });

      file.on('error', (err) => {
        console.log(`  ✗ Write error: ${err.message}`);
        fs.unlinkSync(outputPath);
        resolve(false);
      });
    });

    request.on('error', (err) => {
      console.log(`  ✗ Download error: ${err.message}`);
      resolve(false);
    });

    request.setTimeout(30000, () => {
      request.destroy();
      console.log(`  ✗ Timeout`);
      resolve(false);
    });
  });
}

/**
 * Create PDF manifest
 */
function createManifest(results: SearchResults, downloaded: Map<string, PDFResult>): void {
  let manifest = `# PDF Citation Manifest
## Research Paper Verification

**Generated:** ${new Date().toISOString()}
**Total Citations:** ${results.totalCitations}
**PDFs Found:** ${results.pdfsFound}
**PDFs Downloaded:** ${downloaded.size}
**Success Rate:** ${results.successRate}

**Status:** 🟡 AWAITING SYLVIA REVIEW

---

## Downloaded PDFs

`;

  const sortedEntries = Array.from(downloaded.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  sortedEntries.forEach(([filename, result], i) => {
    manifest += `### ${i + 1}. ${filename}\n\n`;
    manifest += `**Authors:** ${result.authors}\n`;
    manifest += `**Year:** ${result.year}\n`;
    manifest += `**Title:** ${result.title}\n`;
    if (result.doi) {
      manifest += `**DOI:** ${result.doi}\n`;
    }
    manifest += `**Source:** ${result.method}\n`;
    manifest += `**URL:** ${result.pdfUrl}\n`;
    manifest += `**Used In:** \`${result.file}:${result.line}\`\n`;
    manifest += `**File:** \`research/pdfs/${filename}\`\n`;
    manifest += `**Status:** 🟡 Awaiting Sylvia review\n`;
    manifest += `\n---\n\n`;
  });

  // Add unverified section
  const unverified = results.results.filter(r => !r.pdfFound);
  if (unverified.length > 0) {
    manifest += `## Unverified Citations (${unverified.length})\n\n`;
    manifest += `**These citations could not be verified and need manual review.**\n\n`;

    unverified.forEach((result, i) => {
      manifest += `### ${i + 1}. ${result.authors} (${result.year})\n\n`;
      manifest += `**Title:** ${result.title}\n`;
      if (result.doi) {
        manifest += `**DOI:** ${result.doi}\n`;
      }
      manifest += `**Used In:** \`${result.file}:${result.line}\`\n`;
      manifest += `**Status:** 🔴 UNVERIFIED - Needs manual review\n`;
      manifest += `**Action Required:** Find real citation or remove\n`;
      manifest += `\n---\n\n`;
    });
  }

  manifest += `\n## Next Steps\n\n`;
  manifest += `1. ✅ PDFs downloaded to \`research/pdfs/\`\n`;
  manifest += `2. ⏳ Sylvia reviews all citations in research channel\n`;
  manifest += `3. ⏳ Fix/replace/remove unverified citations\n`;
  manifest += `4. ⏳ Update research documents with verified sources\n`;
  manifest += `5. ⏳ Commit verified PDFs to git\n`;

  fs.writeFileSync(MANIFEST_FILE, manifest);
  console.log(`\n✅ Manifest created: ${MANIFEST_FILE}`);
}

/**
 * Main function
 */
async function main() {
  console.log('📚 PDF Download & Verification System\n');

  // Find latest search results
  const logsDir = path.join(__dirname, '..', 'logs');
  const files = fs.readdirSync(logsDir)
    .filter(f => f.startsWith('research_pdfs_') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.log('❌ No PDF search results found. Run findResearchPDFs.ts first.');
    return;
  }

  const resultsFile = path.join(logsDir, files[0]);
  console.log(`📊 Loading results: ${files[0]}\n`);

  const results: SearchResults = JSON.parse(fs.readFileSync(resultsFile, 'utf-8'));

  console.log(`Total citations: ${results.totalCitations}`);
  console.log(`PDFs found: ${results.pdfsFound} (${results.successRate})`);
  console.log(`PDFs to download: ${results.pdfsFound}\n`);

  // Create PDF directory
  if (!fs.existsSync(PDF_DIR)) {
    fs.mkdirSync(PDF_DIR, { recursive: true });
    console.log(`✅ Created directory: ${PDF_DIR}\n`);
  }

  // Download PDFs
  const foundPDFs = results.results.filter(r => r.pdfFound && r.pdfUrl);
  const downloaded = new Map<string, PDFResult>();
  let downloadCount = 0;

  console.log(`🌐 Downloading ${foundPDFs.length} PDFs...\n`);

  for (let i = 0; i < foundPDFs.length; i++) {
    const result = foundPDFs[i];
    const filename = generatePDFFilename(result);
    const outputPath = path.join(PDF_DIR, filename);

    console.log(`[${i + 1}/${foundPDFs.length}] ${filename}`);
    console.log(`  ${result.authors} (${result.year})`);
    console.log(`  ${result.title.substring(0, 80)}...`);

    // Skip if already exists
    if (fs.existsSync(outputPath)) {
      console.log(`  ✓ Already exists`);
      downloaded.set(filename, result);
      downloadCount++;
      continue;
    }

    // Download
    const success = await downloadPDF(result.pdfUrl!, outputPath);
    if (success) {
      downloaded.set(filename, result);
      downloadCount++;
    }

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n✅ Downloaded ${downloadCount}/${foundPDFs.length} PDFs\n`);

  // Create manifest
  createManifest(results, downloaded);

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total citations scanned: ${results.totalCitations}`);
  console.log(`PDFs found online: ${results.pdfsFound}`);
  console.log(`PDFs downloaded: ${downloadCount}`);
  console.log(`PDFs failed: ${foundPDFs.length - downloadCount}`);
  console.log(`Citations unverified: ${results.totalCitations - results.pdfsFound}`);
  console.log(`\nPDF directory: ${PDF_DIR}`);
  console.log(`Manifest: ${MANIFEST_FILE}`);
  console.log(`\n✅ Ready for Sylvia's review\n`);
}

// Run
main().catch(console.error);

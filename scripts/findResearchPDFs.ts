#!/usr/bin/env npx tsx

/**
 * Find PDFs for all citations in research folder
 * Uses Playwright to search for papers via DOI, Google Scholar, arXiv
 */

import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

interface Citation {
  file: string;
  authors: string;
  year: string;
  title: string;
  journal?: string;
  doi?: string;
  url?: string;
  lineNumber?: number;
  fullText: string;
}

interface PDFResult {
  citation: Citation;
  pdfUrl?: string;
  pdfFound: boolean;
  method?: 'doi' | 'arxiv' | 'scholar' | 'direct_link' | 'publisher';
  error?: string;
}

/**
 * Extract references from a markdown file
 */
function extractReferences(filePath: string): Citation[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const citations: Citation[] = [];

  let inReferences = false;
  let lineNumber = 0;

  for (const line of lines) {
    lineNumber++;

    // Detect references section
    if (line.match(/^##?\s*(References|Bibliography|Sources|Citations)/i)) {
      inReferences = true;
      continue;
    }

    // Stop at next major section
    if (inReferences && line.match(/^##?\s+[A-Z]/)) {
      break;
    }

    if (inReferences && line.trim()) {
      // Parse citation line
      const citation = parseCitation(line, filePath, lineNumber);
      if (citation) {
        citations.push(citation);
      }
    }
  }

  return citations;
}

/**
 * Parse a single citation line
 */
function parseCitation(line: string, file: string, lineNumber: number): Citation | null {
  // Skip list markers and numbers
  const cleaned = line.replace(/^[\d\.\-\*\+\s]+/, '').trim();

  if (!cleaned) return null;

  // Extract DOI if present
  const doiMatch = cleaned.match(/(?:doi:|DOI:)?\s*(10\.\d{4,}\/[^\s\)]+)/i);
  const doi = doiMatch ? doiMatch[1].replace(/[,\.\)]$/, '') : undefined;

  // Extract URL if present
  const urlMatch = cleaned.match(/https?:\/\/[^\s\)]+/);
  const url = urlMatch ? urlMatch[0].replace(/[,\.\)]$/, '') : undefined;

  // Try to extract author, year, title pattern
  // Pattern: Author(s) (Year). Title. Journal...
  const authorYearMatch = cleaned.match(/^([^(]+)\((\d{4})\)\.?\s*(.+?)(?:\.|$)/);

  if (authorYearMatch) {
    return {
      file,
      authors: authorYearMatch[1].trim(),
      year: authorYearMatch[2],
      title: extractTitle(authorYearMatch[3]),
      doi,
      url,
      lineNumber,
      fullText: cleaned
    };
  }

  // Alternative pattern: Author, Year, Title
  const altMatch = cleaned.match(/^([^,]+),\s*(\d{4})[,\.]?\s*(.+?)(?:\.|$)/);
  if (altMatch) {
    return {
      file,
      authors: altMatch[1].trim(),
      year: altMatch[2],
      title: extractTitle(altMatch[3]),
      doi,
      url,
      lineNumber,
      fullText: cleaned
    };
  }

  // If we have at least a DOI or URL, include it
  if (doi || url) {
    return {
      file,
      authors: 'Unknown',
      year: 'Unknown',
      title: extractTitle(cleaned),
      doi,
      url,
      lineNumber,
      fullText: cleaned
    };
  }

  return null;
}

/**
 * Extract clean title from citation text
 */
function extractTitle(text: string): string {
  // Remove journal info (typically after first period or "In ")
  let title = text.split(/\.\s*[A-Z]|In\s+[A-Z]/)[0];

  // Remove URLs and DOIs
  title = title.replace(/https?:\/\/[^\s]+/g, '');
  title = title.replace(/doi:\s*10\.\d+\/[^\s]+/gi, '');

  // Remove markdown formatting
  title = title.replace(/[\*\_\[\]]/g, '');

  // Clean up
  title = title.trim().replace(/\s+/g, ' ');

  return title;
}

/**
 * Try to find PDF via DOI
 */
async function findPDFbyDOI(page: Page, doi: string): Promise<string | null> {
  try {
    console.log(`  → Trying DOI: ${doi}`);
    await page.goto(`https://doi.org/${doi}`, { waitUntil: 'networkidle', timeout: 15000 });

    // Wait a bit for redirects
    await page.waitForTimeout(2000);

    // Check for common PDF links
    const pdfSelectors = [
      'a[href*=".pdf"]',
      'a:has-text("PDF")',
      'a:has-text("Download")',
      'a.pdf-link',
      '[data-testid="pdf-link"]'
    ];

    for (const selector of pdfSelectors) {
      const pdfLink = await page.locator(selector).first();
      if (await pdfLink.count() > 0) {
        const href = await pdfLink.getAttribute('href');
        if (href) {
          const fullUrl = href.startsWith('http') ? href : new URL(href, page.url()).toString();
          console.log(`  ✓ Found PDF via DOI: ${fullUrl}`);
          return fullUrl;
        }
      }
    }

    // Check if current URL is a PDF
    const currentUrl = page.url();
    if (currentUrl.endsWith('.pdf') || currentUrl.includes('.pdf')) {
      console.log(`  ✓ DOI redirected to PDF: ${currentUrl}`);
      return currentUrl;
    }

    return null;
  } catch (error) {
    console.log(`  ✗ DOI lookup failed: ${error}`);
    return null;
  }
}

/**
 * Try to find PDF via arXiv
 */
async function findPDFbyArxiv(page: Page, title: string): Promise<string | null> {
  try {
    console.log(`  → Trying arXiv search...`);

    // Check if already an arXiv ID in the title/URL
    const arxivMatch = title.match(/arxiv[:\s]*(\d+\.\d+)/i);
    if (arxivMatch) {
      const arxivId = arxivMatch[1];
      const pdfUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
      console.log(`  ✓ Found arXiv PDF: ${pdfUrl}`);
      return pdfUrl;
    }

    // Search arXiv
    await page.goto(`https://arxiv.org/search/?query=${encodeURIComponent(title)}&searchtype=all`, {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    // Get first result
    const firstResult = await page.locator('li.arxiv-result').first();
    if (await firstResult.count() > 0) {
      const arxivLink = await firstResult.locator('p.list-title a').first();
      const href = await arxivLink.getAttribute('href');

      if (href) {
        const arxivId = href.match(/\/abs\/(\d+\.\d+)/)?.[1];
        if (arxivId) {
          const pdfUrl = `https://arxiv.org/pdf/${arxivId}.pdf`;
          console.log(`  ✓ Found arXiv PDF: ${pdfUrl}`);
          return pdfUrl;
        }
      }
    }

    return null;
  } catch (error) {
    console.log(`  ✗ arXiv search failed: ${error}`);
    return null;
  }
}

/**
 * Try to find PDF via Google Scholar
 */
async function findPDFbyScholar(page: Page, title: string, authors: string): Promise<string | null> {
  try {
    console.log(`  → Trying Google Scholar...`);

    const query = `${title} ${authors}`.substring(0, 200); // Limit query length
    await page.goto(`https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`, {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    // Wait for results
    await page.waitForTimeout(2000);

    // Look for PDF links in first few results
    const pdfLinks = await page.locator('a:has-text("[PDF]")').first();
    if (await pdfLinks.count() > 0) {
      const href = await pdfLinks.getAttribute('href');
      if (href) {
        console.log(`  ✓ Found PDF via Scholar: ${href}`);
        return href;
      }
    }

    return null;
  } catch (error) {
    console.log(`  ✗ Scholar search failed: ${error}`);
    return null;
  }
}

/**
 * Try direct URL if provided
 */
async function findPDFbyDirectLink(page: Page, url: string): Promise<string | null> {
  try {
    console.log(`  → Trying direct link: ${url}`);

    // If already a PDF, return it
    if (url.endsWith('.pdf')) {
      console.log(`  ✓ Direct PDF link: ${url}`);
      return url;
    }

    // Navigate and look for PDF
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Check for PDF links
    const pdfSelectors = [
      'a[href*=".pdf"]',
      'a:has-text("PDF")',
      'a:has-text("Download")'
    ];

    for (const selector of pdfSelectors) {
      const pdfLink = await page.locator(selector).first();
      if (await pdfLink.count() > 0) {
        const href = await pdfLink.getAttribute('href');
        if (href) {
          const fullUrl = href.startsWith('http') ? href : new URL(href, page.url()).toString();
          console.log(`  ✓ Found PDF from direct link: ${fullUrl}`);
          return fullUrl;
        }
      }
    }

    return null;
  } catch (error) {
    console.log(`  ✗ Direct link failed: ${error}`);
    return null;
  }
}

/**
 * Find PDF for a single citation
 */
async function findPDF(page: Page, citation: Citation): Promise<PDFResult> {
  console.log(`\n📄 ${citation.authors} (${citation.year}): ${citation.title.substring(0, 80)}...`);
  console.log(`   File: ${path.basename(citation.file)}:${citation.lineNumber}`);

  let pdfUrl: string | null = null;
  let method: PDFResult['method'] | undefined;

  try {
    // Strategy 1: DOI (most reliable)
    if (citation.doi && !pdfUrl) {
      pdfUrl = await findPDFbyDOI(page, citation.doi);
      if (pdfUrl) method = 'doi';
    }

    // Strategy 2: arXiv
    if (!pdfUrl && citation.fullText.toLowerCase().includes('arxiv')) {
      pdfUrl = await findPDFbyArxiv(page, citation.fullText);
      if (pdfUrl) method = 'arxiv';
    }

    // Strategy 3: Direct URL
    if (!pdfUrl && citation.url) {
      pdfUrl = await findPDFbyDirectLink(page, citation.url);
      if (pdfUrl) method = 'direct_link';
    }

    // Strategy 4: Google Scholar (last resort, rate-limited)
    if (!pdfUrl && citation.title.length > 20) {
      pdfUrl = await findPDFbyScholar(page, citation.title, citation.authors);
      if (pdfUrl) method = 'scholar';
    }

    return {
      citation,
      pdfUrl: pdfUrl || undefined,
      pdfFound: !!pdfUrl,
      method
    };

  } catch (error) {
    return {
      citation,
      pdfFound: false,
      error: String(error)
    };
  }
}

/**
 * Main function
 */
async function main() {
  const researchDir = path.join(__dirname, '..', 'research');
  const outputFile = path.join(__dirname, '..', 'logs', `research_pdfs_${Date.now()}.json`);

  console.log('🔍 Research PDF Finder\n');
  console.log(`📁 Scanning: ${researchDir}`);

  // Collect all citations
  const files = fs.readdirSync(researchDir)
    .filter(f => f.endsWith('.md'))
    .map(f => path.join(researchDir, f));

  let allCitations: Citation[] = [];
  for (const file of files) {
    const citations = extractReferences(file);
    allCitations = allCitations.concat(citations);
  }

  console.log(`\n📊 Found ${allCitations.length} citations across ${files.length} files\n`);

  if (allCitations.length === 0) {
    console.log('❌ No citations found. Make sure files have References section.');
    return;
  }

  // Launch browser
  console.log('🌐 Launching browser...\n');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Find PDFs
  const results: PDFResult[] = [];
  let foundCount = 0;

  for (let i = 0; i < allCitations.length; i++) {
    const citation = allCitations[i];

    console.log(`\n[${i + 1}/${allCitations.length}]`);

    const result = await findPDF(page, citation);
    results.push(result);

    if (result.pdfFound) {
      foundCount++;
      console.log(`✅ SUCCESS (${result.method}): ${result.pdfUrl}`);
    } else {
      console.log(`❌ NOT FOUND`);
    }

    // Be nice to servers, add delay
    await page.waitForTimeout(2000);
  }

  await browser.close();

  // Save results
  const output = {
    timestamp: new Date().toISOString(),
    totalCitations: allCitations.length,
    pdfsFound: foundCount,
    successRate: `${((foundCount / allCitations.length) * 100).toFixed(1)}%`,
    results: results.map(r => ({
      file: path.basename(r.citation.file),
      line: r.citation.lineNumber,
      authors: r.citation.authors,
      year: r.citation.year,
      title: r.citation.title.substring(0, 100),
      doi: r.citation.doi,
      pdfFound: r.pdfFound,
      pdfUrl: r.pdfUrl,
      method: r.method,
      error: r.error
    }))
  };

  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));

  // Print summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total citations: ${allCitations.length}`);
  console.log(`PDFs found: ${foundCount} (${output.successRate})`);
  console.log(`PDFs not found: ${allCitations.length - foundCount}`);
  console.log('\nMethods used:');

  const methodCounts: Record<string, number> = {};
  results.forEach(r => {
    if (r.method) {
      methodCounts[r.method] = (methodCounts[r.method] || 0) + 1;
    }
  });

  Object.entries(methodCounts).forEach(([method, count]) => {
    console.log(`  - ${method}: ${count}`);
  });

  console.log(`\n💾 Results saved to: ${outputFile}`);

  // Print PDFs that were found
  console.log('\n' + '='.repeat(80));
  console.log('📄 FOUND PDFs');
  console.log('='.repeat(80));

  results.filter(r => r.pdfFound).forEach((r, i) => {
    console.log(`\n${i + 1}. ${r.citation.authors} (${r.citation.year})`);
    console.log(`   Title: ${r.citation.title.substring(0, 80)}...`);
    console.log(`   File: ${path.basename(r.citation.file)}:${r.citation.lineNumber}`);
    console.log(`   PDF: ${r.pdfUrl}`);
    console.log(`   Method: ${r.method}`);
  });
}

// Run
main().catch(console.error);

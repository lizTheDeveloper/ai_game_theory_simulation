#!/usr/bin/env npx tsx

/**
 * Extract partial results from ongoing PDF search
 * Create interim JSON so we can start downloading what we have
 */

import * as fs from 'fs';
import * as path from 'path';

const logFile = path.join(__dirname, '..', 'logs', 'pdf_search_20251028_204000.log');
const outputFile = path.join(__dirname, '..', 'logs', 'research_pdfs_partial.json');

interface PDFResult {
  file: string;
  line: number | null;
  authors: string;
  year: string;
  title: string;
  doi: string | null;
  pdfFound: boolean;
  pdfUrl: string | null;
  method: string | null;
}

function parseLog(): PDFResult[] {
  const content = fs.readFileSync(logFile, 'utf-8');
  const lines = content.split('\n');

  const results: PDFResult[] = [];
  let current: Partial<PDFResult> | null = null;

  for (const line of lines) {
    // Start of new citation
    if (line.match(/^\[\d+\/\d+\]/)) {
      if (current && current.authors) {
        results.push(current as PDFResult);
      }
      current = {
        pdfFound: false,
        pdfUrl: null,
        method: null,
        doi: null,
        line: null
      };
    }

    // Parse citation info
    if (line.includes('📄')) {
      const match = line.match(/📄\s+(.+?)\s+\((\d{4})\):\s+(.+?)\.{3}/);
      if (match && current) {
        current.authors = match[1].trim();
        current.year = match[2];
        current.title = match[3].trim();
      }
    }

    // Parse file info
    if (line.includes('File:')) {
      const match = line.match(/File:\s+(.+?):(\d+)/);
      if (match && current) {
        current.file = match[1].trim();
        current.line = parseInt(match[2]);
      }
    }

    // Parse success
    if (line.includes('✅ SUCCESS')) {
      const urlMatch = line.match(/SUCCESS \((.+?)\):\s+(.+)/);
      if (urlMatch && current) {
        current.pdfFound = true;
        current.method = urlMatch[1];
        current.pdfUrl = urlMatch[2].trim();
      }
    }

    // Parse DOI
    if (line.includes('→ Trying DOI:')) {
      const doiMatch = line.match(/DOI:\s+(10\.\d+\/[^\s]+)/);
      if (doiMatch && current) {
        current.doi = doiMatch[1];
      }
    }

    // Parse failure
    if (line.includes('❌ NOT FOUND') && current && current.authors) {
      current.pdfFound = false;
    }
  }

  // Add last citation
  if (current && current.authors) {
    results.push(current as PDFResult);
  }

  return results;
}

const results = parseLog();
const found = results.filter(r => r.pdfFound);

const output = {
  timestamp: new Date().toISOString(),
  status: 'PARTIAL',
  totalCitations: results.length,
  pdfsFound: found.length,
  successRate: `${((found.length / results.length) * 100).toFixed(1)}%`,
  results: results
};

fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));

console.log(`\n✅ Extracted partial results:`);
console.log(`   Total processed: ${results.length}`);
console.log(`   PDFs found: ${found.length} (${output.successRate})`);
console.log(`   Output: ${outputFile}\n`);

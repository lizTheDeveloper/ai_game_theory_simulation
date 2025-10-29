#!/usr/bin/env python3
"""
Auto-Search Citations (Dependency-Free Version)

Searches academic databases for unverified citations and downloads papers.
Uses free APIs: arXiv, Semantic Scholar, CrossRef (no API keys required).

Usage:
    python autoSearchCitations.py --citation "Smith et al. (2024)"
    python autoSearchCitations.py --file unverified_citations.txt

Returns:
    - JSON with candidate papers (title, authors, year, URL, source)
    - Downloads PDFs when available
    - Saves metadata for RAG server ingestion
"""

import re
import json
import sys
import argparse
import urllib.request
import urllib.parse
import urllib.error
from pathlib import Path
from typing import List, Dict, Optional
import time


class CitationSearcher:
    def __init__(self, output_dir: Path = None):
        """Initialize citation searcher with output directory for PDFs."""
        self.repo_root = Path(__file__).parent.parent
        self.output_dir = output_dir or (self.repo_root / "research/papers")
        self.output_dir.mkdir(parents=True, exist_ok=True)

        # Rate limiting
        self.last_request_time = 0
        self.min_request_interval = 1.0  # seconds between requests

    def _rate_limit(self):
        """Enforce rate limiting between API requests."""
        elapsed = time.time() - self.last_request_time
        if elapsed < self.min_request_interval:
            time.sleep(self.min_request_interval - elapsed)
        self.last_request_time = time.time()

    def _make_request(self, url: str, headers: Dict = None) -> Optional[str]:
        """Make HTTP request with error handling."""
        try:
            self._rate_limit()
            req = urllib.request.Request(url, headers=headers or {})
            with urllib.request.urlopen(req, timeout=10) as response:
                return response.read().decode('utf-8')
        except urllib.error.HTTPError as e:
            print(f"⚠️ HTTP {e.code} error for {url}", file=sys.stderr)
            return None
        except urllib.error.URLError as e:
            print(f"⚠️ URL error: {e.reason}", file=sys.stderr)
            return None
        except Exception as e:
            print(f"⚠️ Request failed: {e}", file=sys.stderr)
            return None

    def parse_citation(self, citation: str) -> Dict[str, str]:
        """Parse citation string into components."""
        # Extract year
        year_match = re.search(r'\((\d{4}[a-z]?)\)', citation)
        year = year_match.group(1) if year_match else ""

        # Extract author (first author name)
        author_match = re.search(r'\b([A-Z][a-z]+)', citation)
        author = author_match.group(1) if author_match else ""

        return {
            'author': author,
            'year': year,
            'original': citation
        }

    def search_arxiv(self, citation: str) -> List[Dict]:
        """Search arXiv API for papers matching citation."""
        parsed = self.parse_citation(citation)
        author = parsed['author']
        year = parsed['year']

        # Build query: author + year
        query = f"{author} {year}".strip()
        if not query:
            return []

        # arXiv API endpoint
        encoded_query = urllib.parse.quote(query)
        url = f"http://export.arxiv.org/api/query?search_query=all:{encoded_query}&max_results=10"

        content = self._make_request(url)
        if not content:
            return []

        # Parse XML (simple regex approach - no lxml dependency)
        results = []
        entries = re.findall(r'<entry>(.*?)</entry>', content, re.DOTALL)

        for entry in entries:
            # Extract fields
            title_match = re.search(r'<title>(.*?)</title>', entry, re.DOTALL)
            authors_matches = re.findall(r'<name>(.*?)</name>', entry)
            published_match = re.search(r'<published>(.*?)</published>', entry)
            pdf_match = re.search(r'<link.*?title="pdf".*?href="(.*?)"', entry)
            id_match = re.search(r'<id>(.*?)</id>', entry)

            if title_match and authors_matches:
                # Clean title (remove newlines/extra spaces)
                title = re.sub(r'\s+', ' ', title_match.group(1)).strip()

                # Extract year from published date
                pub_year = ""
                if published_match:
                    pub_date = published_match.group(1)
                    year_match = re.search(r'(\d{4})', pub_date)
                    if year_match:
                        pub_year = year_match.group(1)

                # Get PDF URL
                pdf_url = pdf_match.group(1) if pdf_match else ""
                arxiv_url = id_match.group(1) if id_match else ""

                results.append({
                    'title': title,
                    'authors': authors_matches,
                    'year': pub_year,
                    'url': arxiv_url,
                    'pdf_url': pdf_url,
                    'source': 'arXiv'
                })

        return results

    def search_semantic_scholar(self, citation: str) -> List[Dict]:
        """Search Semantic Scholar API for papers matching citation."""
        parsed = self.parse_citation(citation)
        author = parsed['author']
        year = parsed['year']

        # Build query
        query = f"{author} {year}".strip()
        if not query:
            return []

        # Semantic Scholar API endpoint
        encoded_query = urllib.parse.quote(query)
        url = f"https://api.semanticscholar.org/graph/v1/paper/search?query={encoded_query}&limit=10&fields=title,authors,year,url,openAccessPdf"

        # Add user agent (required by S2 API)
        headers = {
            'User-Agent': 'CitationChecker/1.0 (mailto:research@example.com)'
        }

        content = self._make_request(url, headers)
        if not content:
            return []

        try:
            data = json.loads(content)
            results = []

            for paper in data.get('data', []):
                # Extract author names
                authors = [a.get('name', '') for a in paper.get('authors', [])]

                # Get PDF URL if available
                pdf_url = ""
                if paper.get('openAccessPdf'):
                    pdf_url = paper['openAccessPdf'].get('url', '')

                results.append({
                    'title': paper.get('title', ''),
                    'authors': authors,
                    'year': str(paper.get('year', '')),
                    'url': paper.get('url', ''),
                    'pdf_url': pdf_url,
                    'source': 'Semantic Scholar'
                })

            return results
        except json.JSONDecodeError:
            print("⚠️ Failed to parse Semantic Scholar response", file=sys.stderr)
            return []

    def search_crossref(self, citation: str) -> List[Dict]:
        """Search CrossRef API for papers matching citation."""
        parsed = self.parse_citation(citation)
        author = parsed['author']
        year = parsed['year']

        # Build query
        query = f"{author} {year}".strip()
        if not query:
            return []

        # CrossRef API endpoint
        encoded_query = urllib.parse.quote(query)
        url = f"https://api.crossref.org/works?query={encoded_query}&rows=10"

        content = self._make_request(url)
        if not content:
            return []

        try:
            data = json.loads(content)
            results = []

            for item in data.get('message', {}).get('items', []):
                # Extract authors
                authors = []
                for author_data in item.get('author', []):
                    given = author_data.get('given', '')
                    family = author_data.get('family', '')
                    if family:
                        authors.append(f"{given} {family}".strip())

                # Extract year
                pub_year = ""
                if 'published-print' in item:
                    date_parts = item['published-print'].get('date-parts', [[]])[0]
                    if date_parts:
                        pub_year = str(date_parts[0])
                elif 'published-online' in item:
                    date_parts = item['published-online'].get('date-parts', [[]])[0]
                    if date_parts:
                        pub_year = str(date_parts[0])

                # Get DOI URL
                doi = item.get('DOI', '')
                url = f"https://doi.org/{doi}" if doi else ""

                # Get title
                titles = item.get('title', [])
                title = titles[0] if titles else ""

                results.append({
                    'title': title,
                    'authors': authors,
                    'year': pub_year,
                    'url': url,
                    'pdf_url': "",  # CrossRef doesn't provide PDF URLs
                    'source': 'CrossRef',
                    'doi': doi
                })

            return results
        except json.JSONDecodeError:
            print("⚠️ Failed to parse CrossRef response", file=sys.stderr)
            return []

    def search_all(self, citation: str) -> List[Dict]:
        """Search all databases and combine results."""
        print(f"\n🔍 Searching for: {citation}", file=sys.stderr)

        all_results = []

        # Search arXiv
        print("  📄 Searching arXiv...", file=sys.stderr)
        arxiv_results = self.search_arxiv(citation)
        all_results.extend(arxiv_results)
        print(f"    Found {len(arxiv_results)} results", file=sys.stderr)

        # Search Semantic Scholar
        print("  📚 Searching Semantic Scholar...", file=sys.stderr)
        s2_results = self.search_semantic_scholar(citation)
        all_results.extend(s2_results)
        print(f"    Found {len(s2_results)} results", file=sys.stderr)

        # Search CrossRef
        print("  🔬 Searching CrossRef...", file=sys.stderr)
        crossref_results = self.search_crossref(citation)
        all_results.extend(crossref_results)
        print(f"    Found {len(crossref_results)} results", file=sys.stderr)

        # Remove duplicates based on title similarity
        unique_results = self._deduplicate_results(all_results)

        print(f"\n✅ Total unique results: {len(unique_results)}", file=sys.stderr)
        return unique_results

    def _deduplicate_results(self, results: List[Dict]) -> List[Dict]:
        """Remove duplicate results based on title similarity."""
        if not results:
            return []

        unique = []
        seen_titles = set()

        for result in results:
            # Normalize title for comparison
            title = result.get('title', '').lower()
            title_normalized = re.sub(r'[^\w\s]', '', title)
            title_normalized = re.sub(r'\s+', ' ', title_normalized).strip()

            if title_normalized and title_normalized not in seen_titles:
                seen_titles.add(title_normalized)
                unique.append(result)

        return unique

    def download_pdf(self, paper: Dict) -> Optional[str]:
        """Download PDF if available."""
        pdf_url = paper.get('pdf_url', '')
        if not pdf_url:
            return None

        # Generate filename from title
        title = paper.get('title', 'unknown')
        # Sanitize filename
        filename = re.sub(r'[^\w\s-]', '', title.lower())
        filename = re.sub(r'\s+', '_', filename)
        filename = filename[:100]  # Limit length
        filename = f"{filename}.pdf"

        filepath = self.output_dir / filename

        try:
            print(f"  📥 Downloading PDF: {filename}", file=sys.stderr)
            self._rate_limit()
            urllib.request.urlretrieve(pdf_url, filepath)
            print(f"  ✅ Saved to: {filepath}", file=sys.stderr)
            return str(filepath)
        except Exception as e:
            print(f"  ❌ Download failed: {e}", file=sys.stderr)
            return None


def main():
    parser = argparse.ArgumentParser(description='Auto-search for citations')
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--citation', type=str, help='Citation to search for')
    group.add_argument('--file', type=Path, help='File with citations (one per line)')
    parser.add_argument('--json', action='store_true', help='Output JSON only')
    parser.add_argument('--download', action='store_true', help='Download PDFs when available')
    parser.add_argument('--output-dir', type=Path, help='Directory to save PDFs')

    args = parser.parse_args()

    # Get citations to search
    if args.citation:
        citations = [args.citation]
    else:
        citations = args.file.read_text(encoding='utf-8').strip().split('\n')

    # Initialize searcher
    searcher = CitationSearcher(output_dir=args.output_dir)

    # Search for each citation
    all_results = {}
    for citation in citations:
        citation = citation.strip()
        if not citation:
            continue

        results = searcher.search_all(citation)
        all_results[citation] = results

        # Download PDFs if requested
        if args.download:
            for paper in results:
                pdf_path = searcher.download_pdf(paper)
                if pdf_path:
                    paper['local_pdf'] = pdf_path

    # Output results
    if args.json:
        print(json.dumps(all_results, indent=2))
    else:
        # Human-readable output
        print("\n" + "=" * 80)
        print("📚 CITATION SEARCH RESULTS")
        print("=" * 80)

        for citation, results in all_results.items():
            print(f"\n🔍 {citation}")
            print(f"   Found {len(results)} candidate papers")

            if results:
                print("\n   Top matches:")
                for i, paper in enumerate(results[:5], 1):
                    print(f"\n   {i}. {paper['title']}")
                    print(f"      Authors: {', '.join(paper['authors'][:3])}")
                    if len(paper['authors']) > 3:
                        print(f"               (+ {len(paper['authors']) - 3} more)")
                    print(f"      Year: {paper['year']}")
                    print(f"      Source: {paper['source']}")
                    print(f"      URL: {paper['url']}")
                    if paper.get('pdf_url'):
                        print(f"      PDF: {paper['pdf_url']}")
                    if paper.get('local_pdf'):
                        print(f"      📥 Downloaded: {paper['local_pdf']}")
            else:
                print("   ❌ No results found")

        print("\n" + "=" * 80)


if __name__ == '__main__':
    main()

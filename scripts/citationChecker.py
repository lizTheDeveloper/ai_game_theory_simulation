#!/usr/bin/env python3
"""
Citation Hallucination Checker (Dependency-Free Version)

Extracts citations from text and verifies them against the verified citation database.
Uses regex patterns - no external dependencies required (fast and lightweight).

Usage:
    python citationChecker.py --text "According to Smith et al. (2023)..."
    python citationChecker.py --file response.txt
    echo "Smith et al. (2023)" | python citationChecker.py --stdin

Returns:
    - JSON with detected citations and verification status
    - Exit code 0 if all verified, 1 if any unverified
"""

import re
import json
import sys
import argparse
from pathlib import Path
from typing import List, Dict, Set
import glob


class CitationChecker:
    def __init__(self, repo_root: Path = None):
        """Initialize citation checker with verified citation database."""
        self.repo_root = repo_root or Path(__file__).parent.parent

        # Citation patterns (regex) - MUST be defined BEFORE loading citations
        self.citation_patterns = [
            # "Author et al. (YYYY)" or "Author et al (YYYY)"
            r'\b([A-Z][a-z]+)\s+et\s+al\.?\s*\((\d{4}[a-z]?)\)',
            # "Author & Author (YYYY)"
            r'\b([A-Z][a-z]+)\s+&\s+[A-Z][a-z]+\s*\((\d{4}[a-z]?)\)',
            # "Author (YYYY)"
            r'\b([A-Z][a-z]+)\s*\((\d{4}[a-z]?)\)',
            # "(Author et al., YYYY)"
            r'\(([A-Z][a-z]+)\s+et\s+al\.?,\s*(\d{4}[a-z]?)\)',
            # "(Author, YYYY)"
            r'\(([A-Z][a-z]+),\s*(\d{4}[a-z]?)\)',
        ]

        # Load verified citations
        self.verified_citations = self._load_verified_citations()
        self.suspicious_citations = self._load_suspicious_citations()

    def _load_verified_citations(self) -> Set[str]:
        """Load verified citations from multiple sources."""
        verified = set()

        # Source 1: Citation correction files
        correction_files = glob.glob(str(self.repo_root / "research/CITATION_CORRECTIONS_APPLIED_*.md"))
        for filepath in correction_files:
            verified.update(self._extract_citations_from_file(filepath))

        # Source 2: Bibliography
        bib_file = self.repo_root / "docs/wiki/BIBLIOGRAPHY.md"
        if bib_file.exists():
            verified.update(self._extract_citations_from_file(bib_file))

        # Source 3: PDF review files (verified papers)
        pdf_reviews = glob.glob(str(self.repo_root / "research/pdf_review_*.md"))
        for filepath in pdf_reviews:
            verified.update(self._extract_verified_from_review(filepath))

        # Source 4: Research consensus files
        consensus_files = glob.glob(str(self.repo_root / ".claude/chatroom/research-consensus-*.txt"))
        for filepath in consensus_files:
            verified.update(self._extract_citations_from_file(filepath))

        return verified

    def _extract_citations_from_file(self, filepath: str) -> Set[str]:
        """Extract citations from a file using regex."""
        citations = set()
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                for pattern in self.citation_patterns:
                    for match in re.finditer(pattern, content):
                        author = match.group(1)
                        year = match.group(2)
                        citations.add(f"{author} et al. ({year})")
                        citations.add(f"{author} ({year})")  # Both forms
        except Exception as e:
            print(f"Warning: Could not read {filepath}: {e}", file=sys.stderr)
        return citations

    def _extract_verified_from_review(self, filepath: str) -> Set[str]:
        """Extract verified citations from PDF review files."""
        citations = set()
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

                # Look for "Status: ✅ VERIFIED" or "Status: ✅ PAPER VERIFIED"
                if '✅' not in content or 'VERIFIED' not in content.upper():
                    return citations  # Skip unverified reviews

                # Extract citations from verified reviews
                for pattern in self.citation_patterns:
                    for match in re.finditer(pattern, content):
                        author = match.group(1)
                        year = match.group(2)
                        citations.add(f"{author} et al. ({year})")
                        citations.add(f"{author} ({year})")
        except Exception as e:
            print(f"Warning: Could not read {filepath}: {e}", file=sys.stderr)
        return citations

    def _load_suspicious_citations(self) -> Dict[str, str]:
        """Load suspicious citations from JSON file and fabricated citations list."""
        suspicious = {}

        # Source 1: JSON suspicious list
        suspicious_file = self.repo_root / "research/suspicious_citations_20251029.json"
        if suspicious_file.exists():
            try:
                with open(suspicious_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    for item in data.get('high', []) + data.get('medium', []):
                        line = item.get('line', '')
                        # Extract citations from line
                        for pattern in self.citation_patterns:
                            for match in re.finditer(pattern, line):
                                author = match.group(1)
                                year = match.group(2)
                                citation = f"{author} et al. ({year})"
                                suspicious[citation] = item.get('reason', 'Unknown reason')
                                suspicious[f"{author} ({year})"] = item.get('reason', 'Unknown reason')
            except Exception as e:
                print(f"Warning: Could not read suspicious_citations: {e}", file=sys.stderr)

        # Source 2: Commonly hallucinated citations (from Cynthia's research)
        fabricated_file = self.repo_root / "research/COMMONLY_HALLUCINATED_CITATIONS.md"
        if fabricated_file.exists():
            try:
                with open(fabricated_file, 'r', encoding='utf-8') as f:
                    content = f.read()

                    # Extract citations from this file
                    for pattern in self.citation_patterns:
                        for match in re.finditer(pattern, content):
                            author = match.group(1)
                            year = match.group(2)
                            citation = f"{author} et al. ({year})"
                            suspicious[citation] = 'FABRICATED - See COMMONLY_HALLUCINATED_CITATIONS.md'
                            suspicious[f"{author} ({year})"] = 'FABRICATED - See COMMONLY_HALLUCINATED_CITATIONS.md'

                    # Also extract arXiv IDs marked as fabricated
                    arxiv_pattern = r'arXiv:(\d+\.\d+)'
                    for match in re.finditer(arxiv_pattern, content):
                        arxiv_id = match.group(1)
                        suspicious[f"arXiv:{arxiv_id}"] = 'FABRICATED arXiv ID (404)'

            except Exception as e:
                print(f"Warning: Could not read COMMONLY_HALLUCINATED_CITATIONS: {e}", file=sys.stderr)

        return suspicious

    def extract_citations(self, text: str) -> List[Dict[str, str]]:
        """Extract all citations from text using regex."""
        citations = []
        seen = set()

        for pattern in self.citation_patterns:
            for match in re.finditer(pattern, text):
                citation_text = match.group(0)
                author = match.group(1)
                year = match.group(2)

                # Normalize to "Author et al. (YYYY)" format
                if 'et al' in citation_text.lower():
                    normalized = f"{author} et al. ({year})"
                else:
                    normalized = f"{author} ({year})"

                if normalized not in seen:
                    seen.add(normalized)
                    citations.append({
                        'text': citation_text,
                        'normalized': normalized,
                        'author': author,
                        'year': year
                    })

        return citations

    def verify_citation(self, citation: str) -> Dict[str, any]:
        """Verify a single citation against database."""
        # Direct match
        is_verified = citation in self.verified_citations

        # Check suspicious list
        is_suspicious = citation in self.suspicious_citations
        suspicious_reason = self.suspicious_citations.get(citation)

        return {
            'citation': citation,
            'verified': is_verified,
            'suspicious': is_suspicious,
            'suspicious_reason': suspicious_reason,
            'status': self._get_status(is_verified, is_suspicious)
        }

    def _get_status(self, verified: bool, suspicious: bool) -> str:
        """Determine overall status of citation."""
        if verified and not suspicious:
            return "✅ VERIFIED"
        elif verified and suspicious:
            return "⚠️ VERIFIED BUT FLAGGED"
        elif suspicious:
            return "❌ SUSPICIOUS"
        else:
            return "❓ UNVERIFIED"

    def check_text(self, text: str) -> Dict[str, any]:
        """Check all citations in text and return verification results."""
        citations = self.extract_citations(text)
        results = []

        for citation in citations:
            verification = self.verify_citation(citation['normalized'])
            verification['original_text'] = citation['text']
            verification['author'] = citation['author']
            verification['year'] = citation['year']
            results.append(verification)

        # Summary
        verified_count = sum(1 for r in results if r['verified'])
        suspicious_count = sum(1 for r in results if r['suspicious'])
        unverified_count = sum(1 for r in results if not r['verified'] and not r['suspicious'])

        return {
            'citations_found': len(results),
            'verified': verified_count,
            'suspicious': suspicious_count,
            'unverified': unverified_count,
            'results': results,
            'all_verified': unverified_count == 0 and suspicious_count == 0
        }


def main():
    parser = argparse.ArgumentParser(description='Check citations for hallucinations')
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--text', type=str, help='Text to check')
    group.add_argument('--file', type=Path, help='File to check')
    group.add_argument('--stdin', action='store_true', help='Read from stdin')
    parser.add_argument('--json', action='store_true', help='Output JSON only')
    parser.add_argument('--quiet', action='store_true', help='Quiet mode (exit code only)')

    args = parser.parse_args()

    # Get text to check
    if args.text:
        text = args.text
    elif args.file:
        text = args.file.read_text(encoding='utf-8')
    else:  # stdin
        text = sys.stdin.read()

    # Check citations
    checker = CitationChecker()
    results = checker.check_text(text)

    if args.quiet:
        # Just exit with code
        sys.exit(0 if results['all_verified'] else 1)

    if args.json:
        # JSON output only
        print(json.dumps(results, indent=2))
    else:
        # Human-readable output
        print("\n⚠️  CITATION VERIFICATION REPORT")
        print("=" * 60)
        print(f"Citations found: {results['citations_found']}")
        print(f"✅ Verified: {results['verified']}")
        print(f"❓ Unverified: {results['unverified']}")
        print(f"❌ Suspicious: {results['suspicious']}")
        print()

        if results['results']:
            print("DETAILS:")
            print("-" * 60)
            for i, result in enumerate(results['results'], 1):
                print(f"\n{i}. {result['original_text']}")
                print(f"   Status: {result['status']}")
                if result['suspicious_reason']:
                    print(f"   Reason: {result['suspicious_reason']}")
                if not result['verified'] and not result['suspicious']:
                    print(f"   ⚠️  Not found in verified database - possible hallucination")
        else:
            print("No citations detected.")

        print("\n" + "=" * 60)

        if not results['all_verified']:
            print("⚠️  WARNING: Unverified or suspicious citations detected!")
            print("These may be hallucinated. Please verify manually.")

    # Exit with error code if any unverified
    sys.exit(0 if results['all_verified'] else 1)


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
Citation Verification with Auto-Research

Complete workflow for checking citations and auto-populating verified database:
1. Check citation against verified database
2. If not found, auto-search (arXiv, Semantic Scholar, CrossRef)
3. Use Haiku to match most relevant paper
4. Download PDF (with Playwright fallback for 403s)
5. Save metadata for RAG ingestion

Usage:
    python verifyCitationWithAutoResearch.py --text "According to Li et al. (2023)..."
    python verifyCitationWithAutoResearch.py --file response.txt
    echo "Smith et al. (2024)" | python verifyCitationWithAutoResearch.py --stdin

Environment:
    ANTHROPIC_API_KEY - Required for Haiku paper matching
"""

import sys
import json
import argparse
from pathlib import Path
from typing import List, Dict, Optional

# Import our standalone modules
# NOTE: These should be importable - might need to add to PYTHONPATH
try:
    from citationChecker import CitationChecker
    from autoSearchCitations import CitationSearcher
    from matchPaperWithHaiku import HaikuPaperMatcher
except ImportError:
    print("⚠️ Import error - make sure scripts are in Python path", file=sys.stderr)
    print("Try: export PYTHONPATH=$PYTHONPATH:$(pwd)/scripts", file=sys.stderr)
    sys.exit(1)


class CitationResearchWorkflow:
    def __init__(self, repo_root: Path = None, api_key: Optional[str] = None):
        """Initialize complete research workflow."""
        self.repo_root = repo_root or Path(__file__).parent.parent

        # Initialize components
        self.checker = CitationChecker(repo_root=self.repo_root)
        self.searcher = CitationSearcher(output_dir=self.repo_root / "research/papers")

        # Haiku matcher (optional - gracefully degrade if no API key)
        self.matcher = None
        try:
            self.matcher = HaikuPaperMatcher(api_key=api_key)
        except ValueError:
            print("⚠️ Haiku matcher disabled (no ANTHROPIC_API_KEY)", file=sys.stderr)

    def process_text(self, text: str, auto_research: bool = True, download_pdfs: bool = True) -> Dict:
        """
        Process text and verify all citations.

        Args:
            text: Text containing citations
            auto_research: If True, auto-search for unverified citations
            download_pdfs: If True, download PDFs for matched papers

        Returns:
            Complete report with verification status and research results
        """
        # Step 1: Check citations against database
        print("\n🔍 Step 1: Checking citations against verified database...", file=sys.stderr)
        verification_results = self.checker.check_text(text)

        print(f"  Found {verification_results['citations_found']} citations", file=sys.stderr)
        print(f"  ✅ Verified: {verification_results['verified']}", file=sys.stderr)
        print(f"  ❓ Unverified: {verification_results['unverified']}", file=sys.stderr)
        print(f"  ❌ Suspicious: {verification_results['suspicious']}", file=sys.stderr)

        if not auto_research:
            return verification_results

        # Step 2: Auto-research unverified citations
        unverified = [
            r for r in verification_results['results']
            if not r['verified'] and not r['suspicious']
        ]

        if not unverified:
            print("\n✅ All citations verified - no research needed", file=sys.stderr)
            return verification_results

        print(f"\n🔬 Step 2: Auto-researching {len(unverified)} unverified citations...", file=sys.stderr)

        research_results = []
        for citation_result in unverified:
            citation = citation_result['citation']
            original_text = citation_result['original_text']

            # Extract context (sentence containing citation)
            citation_context = self._extract_context(text, original_text)

            print(f"\n  📚 Researching: {citation}", file=sys.stderr)

            # Search for candidates
            candidates = self.searcher.search_all(citation)

            if not candidates:
                print(f"    ❌ No candidates found", file=sys.stderr)
                research_results.append({
                    'citation': citation,
                    'status': 'not_found',
                    'candidates': []
                })
                continue

            # Use Haiku to rank candidates (if available)
            ranked_candidates = candidates
            if self.matcher and citation_context:
                print(f"    🤖 Using Haiku to match papers...", file=sys.stderr)
                try:
                    ranked_candidates = self.matcher.match_paper(citation_context, candidates)
                except Exception as e:
                    print(f"    ⚠️ Haiku matching failed: {e}", file=sys.stderr)
                    ranked_candidates = candidates

            # Download top match if requested
            top_match = ranked_candidates[0] if ranked_candidates else None
            pdf_path = None

            if download_pdfs and top_match:
                print(f"    📥 Downloading top match...", file=sys.stderr)
                pdf_path = self.searcher.download_pdf(top_match)
                if pdf_path:
                    top_match['local_pdf'] = pdf_path

            research_results.append({
                'citation': citation,
                'context': citation_context,
                'status': 'found',
                'candidates': ranked_candidates[:5],  # Top 5 only
                'top_match': top_match
            })

        # Combine results
        verification_results['research_results'] = research_results
        return verification_results

    def _extract_context(self, text: str, citation: str) -> str:
        """Extract the sentence containing the citation."""
        # Find citation position
        pos = text.find(citation)
        if pos < 0:
            return citation

        # Find sentence boundaries (simple approach)
        start = text.rfind('.', 0, pos)
        end = text.find('.', pos)

        if start < 0:
            start = 0
        else:
            start += 1  # Skip the period

        if end < 0:
            end = len(text)
        else:
            end += 1  # Include the period

        return text[start:end].strip()


def main():
    parser = argparse.ArgumentParser(description='Verify citations with auto-research')
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument('--text', type=str, help='Text to check')
    group.add_argument('--file', type=Path, help='File to check')
    group.add_argument('--stdin', action='store_true', help='Read from stdin')

    parser.add_argument('--no-research', action='store_true', help='Skip auto-research')
    parser.add_argument('--no-download', action='store_true', help='Skip PDF downloads')
    parser.add_argument('--json', action='store_true', help='Output JSON only')
    parser.add_argument('--api-key', type=str, help='Anthropic API key')

    args = parser.parse_args()

    # Get text to check
    if args.text:
        text = args.text
    elif args.file:
        text = args.file.read_text(encoding='utf-8')
    else:  # stdin
        text = sys.stdin.read()

    # Run workflow
    workflow = CitationResearchWorkflow(api_key=args.api_key)
    results = workflow.process_text(
        text,
        auto_research=not args.no_research,
        download_pdfs=not args.no_download
    )

    if args.json:
        print(json.dumps(results, indent=2))
    else:
        # Human-readable output
        print("\n" + "=" * 80)
        print("📊 CITATION VERIFICATION + AUTO-RESEARCH REPORT")
        print("=" * 80)

        print(f"\nCitations found: {results['citations_found']}")
        print(f"✅ Verified: {results['verified']}")
        print(f"❓ Unverified: {results['unverified']}")
        print(f"❌ Suspicious: {results['suspicious']}")

        # Show verification details
        if results['results']:
            print("\n" + "-" * 80)
            print("VERIFICATION DETAILS:")
            for i, r in enumerate(results['results'], 1):
                print(f"\n{i}. {r['original_text']}")
                print(f"   Status: {r['status']}")
                if r.get('suspicious_reason'):
                    print(f"   Reason: {r['suspicious_reason']}")

        # Show research results
        if results.get('research_results'):
            print("\n" + "-" * 80)
            print("AUTO-RESEARCH RESULTS:")
            for i, r in enumerate(results['research_results'], 1):
                print(f"\n{i}. {r['citation']}")
                print(f"   Status: {r['status']}")

                if r['status'] == 'found' and r.get('top_match'):
                    match = r['top_match']
                    print(f"\n   🎯 TOP MATCH:")
                    print(f"      Title: {match['title']}")
                    print(f"      Authors: {', '.join(match['authors'][:3])}")
                    if len(match['authors']) > 3:
                        print(f"               (+ {len(match['authors']) - 3} more)")
                    print(f"      Year: {match['year']}")
                    print(f"      Source: {match['source']}")
                    if match.get('relevance_score'):
                        print(f"      Relevance: {match['relevance_score']}/100")
                    if match.get('local_pdf'):
                        print(f"      📥 Downloaded: {match['local_pdf']}")
                    print(f"      URL: {match['url']}")

                if r.get('candidates') and len(r['candidates']) > 1:
                    print(f"\n   Other candidates: {len(r['candidates']) - 1}")

        print("\n" + "=" * 80)

        if results['unverified'] > 0:
            print("\n⚠️ WARNING: Unverified citations detected")
            if results.get('research_results'):
                print("Auto-research found potential matches - please verify manually")

    # Exit code: 0 if all verified, 1 if any unverified
    sys.exit(0 if results['all_verified'] else 1)


if __name__ == '__main__':
    main()

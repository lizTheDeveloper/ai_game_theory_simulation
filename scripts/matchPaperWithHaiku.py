#!/usr/bin/env python3
"""
Haiku Paper Matcher

Uses Claude Haiku to intelligently match citations to candidate papers
based on contextual relevance.

Usage:
    python matchPaperWithHaiku.py --citation-context "Li et al. (2023) showed..." --candidates candidates.json
    python matchPaperWithHaiku.py --interactive

Requires:
    ANTHROPIC_API_KEY environment variable
"""

import json
import sys
import argparse
import os
import urllib.request
from pathlib import Path
from typing import List, Dict, Optional


class HaikuPaperMatcher:
    def __init__(self, api_key: Optional[str] = None):
        """Initialize Haiku matcher with API key."""
        self.api_key = api_key or os.environ.get('ANTHROPIC_API_KEY')
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable not set")

    def match_paper(self, citation_context: str, candidates: List[Dict]) -> List[Dict]:
        """
        Use Haiku to match citation to most relevant candidate papers.

        Args:
            citation_context: The full sentence/paragraph containing the citation
            candidates: List of candidate papers from auto-search

        Returns:
            Ranked list of candidates with relevance scores
        """
        if not candidates:
            return []

        # Build prompt for Haiku
        prompt = self._build_matching_prompt(citation_context, candidates)

        # Call Claude Haiku API
        response = self._call_haiku(prompt)

        # Parse response and rank candidates
        ranked_candidates = self._parse_haiku_response(response, candidates)

        return ranked_candidates

    def _build_matching_prompt(self, citation_context: str, candidates: List[Dict]) -> str:
        """Build prompt for Haiku to evaluate paper matches."""
        prompt = f"""You are a research librarian helping match citations to papers.

CITATION CONTEXT:
{citation_context}

CANDIDATE PAPERS:
"""
        for i, paper in enumerate(candidates, 1):
            authors_str = ', '.join(paper.get('authors', [])[:3])
            if len(paper.get('authors', [])) > 3:
                authors_str += f" (+ {len(paper['authors']) - 3} more)"

            prompt += f"""
{i}. Title: {paper.get('title', 'Unknown')}
   Authors: {authors_str}
   Year: {paper.get('year', 'Unknown')}
   Source: {paper.get('source', 'Unknown')}
"""

        prompt += """
TASK:
For each candidate paper, provide a relevance score from 0-100 based on:
1. Does the paper topic match the citation context?
2. Do the authors match (first author name)?
3. Does the year match?
4. Does the title suggest relevant content?

Return ONLY a JSON object with this structure:
{
  "matches": [
    {"paper_index": 1, "score": 85, "reason": "Brief explanation"},
    {"paper_index": 2, "score": 20, "reason": "Brief explanation"}
  ]
}

Sort matches by score (highest first). Only include papers with score > 10.
"""
        return prompt

    def _call_haiku(self, prompt: str) -> str:
        """Call Claude Haiku API."""
        url = "https://api.anthropic.com/v1/messages"

        request_body = {
            "model": "claude-haiku-4-20250508",
            "max_tokens": 2048,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }

        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json"
        }

        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(request_body).encode('utf-8'),
                headers=headers,
                method='POST'
            )

            with urllib.request.urlopen(req, timeout=30) as response:
                response_data = json.loads(response.read().decode('utf-8'))
                return response_data['content'][0]['text']

        except urllib.error.HTTPError as e:
            error_body = e.read().decode('utf-8')
            print(f"❌ API Error {e.code}: {error_body}", file=sys.stderr)
            raise
        except Exception as e:
            print(f"❌ Request failed: {e}", file=sys.stderr)
            raise

    def _parse_haiku_response(self, response: str, candidates: List[Dict]) -> List[Dict]:
        """Parse Haiku's JSON response and rank candidates."""
        try:
            # Extract JSON from response (might have markdown code blocks)
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                data = json.loads(json_str)
            else:
                print("⚠️ No JSON found in Haiku response", file=sys.stderr)
                return candidates

            matches = data.get('matches', [])

            # Add scores to candidates
            ranked = []
            for match in matches:
                paper_idx = match.get('paper_index', 0) - 1  # Convert to 0-indexed
                if 0 <= paper_idx < len(candidates):
                    candidate = candidates[paper_idx].copy()
                    candidate['relevance_score'] = match.get('score', 0)
                    candidate['match_reason'] = match.get('reason', '')
                    ranked.append(candidate)

            return ranked

        except json.JSONDecodeError as e:
            print(f"⚠️ Failed to parse Haiku response as JSON: {e}", file=sys.stderr)
            print(f"Response was: {response}", file=sys.stderr)
            return candidates


def main():
    parser = argparse.ArgumentParser(description='Match papers using Haiku')
    parser.add_argument('--citation-context', type=str, help='Full citation context')
    parser.add_argument('--candidates', type=Path, help='JSON file with candidate papers')
    parser.add_argument('--interactive', action='store_true', help='Interactive mode')
    parser.add_argument('--api-key', type=str, help='Anthropic API key (or use ANTHROPIC_API_KEY env var)')

    args = parser.parse_args()

    # Initialize matcher
    try:
        matcher = HaikuPaperMatcher(api_key=args.api_key)
    except ValueError as e:
        print(f"❌ {e}", file=sys.stderr)
        print("Set ANTHROPIC_API_KEY environment variable or use --api-key", file=sys.stderr)
        sys.exit(1)

    if args.interactive:
        # Interactive mode
        print("🤖 Haiku Paper Matcher (Interactive Mode)")
        print("=" * 60)

        citation_context = input("\nEnter citation context: ")
        print("\nEnter candidate papers (one JSON object per line, empty line to finish):")

        candidates = []
        while True:
            line = input()
            if not line.strip():
                break
            try:
                candidates.append(json.loads(line))
            except json.JSONDecodeError:
                print("⚠️ Invalid JSON, skipping")

    else:
        # File mode
        if not args.citation_context or not args.candidates:
            print("❌ Provide --citation-context and --candidates, or use --interactive", file=sys.stderr)
            sys.exit(1)

        citation_context = args.citation_context
        candidates = json.loads(args.candidates.read_text())

        # Handle both single list and dict with citation keys
        if isinstance(candidates, dict):
            # Assume first citation
            first_key = list(candidates.keys())[0]
            candidates = candidates[first_key]

    # Match papers
    print(f"\n🔍 Matching papers for citation...", file=sys.stderr)
    ranked = matcher.match_paper(citation_context, candidates)

    # Output results
    print("\n" + "=" * 80)
    print("🎯 RANKED MATCHES")
    print("=" * 80)

    if ranked:
        for i, paper in enumerate(ranked, 1):
            print(f"\n{i}. [{paper.get('relevance_score', 0)}/100] {paper['title']}")
            print(f"   Authors: {', '.join(paper['authors'][:3])}")
            if len(paper['authors']) > 3:
                print(f"            (+ {len(paper['authors']) - 3} more)")
            print(f"   Year: {paper['year']}")
            print(f"   Source: {paper['source']}")
            print(f"   Reason: {paper.get('match_reason', 'N/A')}")
            print(f"   URL: {paper['url']}")
            if paper.get('pdf_url'):
                print(f"   PDF: {paper['pdf_url']}")
    else:
        print("\n❌ No relevant matches found")

    print("\n" + "=" * 80)

    # JSON output
    print("\nJSON OUTPUT:", file=sys.stderr)
    print(json.dumps(ranked, indent=2))


if __name__ == '__main__':
    main()

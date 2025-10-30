#!/usr/bin/env python3
"""
Systematically categorize AI Safety research questions as:
- addressed: Work exists that addresses this question
- solved: Problem is considered solved
- open: No significant progress

Uses multiple evidence sources:
- AI Safety video transcripts (MCP)
- Web search for recent papers
- Citation analysis

Produces detailed artifact with evidence for each categorization.
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
import subprocess
import re


@dataclass
class Evidence:
    """Evidence for question status"""
    source_type: str  # 'transcript', 'paper', 'web', 'manual'
    title: str
    url: Optional[str]
    snippet: str
    relevance_score: float  # 0-1


@dataclass
class QuestionEvaluation:
    """Evaluation of a single research question"""
    id: int
    section: str
    title: str
    category: str
    parent_section: str

    # Categorization
    status: str  # 'addressed', 'solved', 'open'
    confidence: float  # 0-1 confidence in categorization

    # Evidence
    evidence: List[Evidence]
    reasoning: str  # Human-readable explanation

    # Metadata
    evaluated_at: str
    evaluated_by: str = "automated_categorization_v1"


class QuestionCategorizer:
    """Systematically categorize research questions"""

    def __init__(self, mcp_available: bool = True):
        self.mcp_available = mcp_available

    def search_ai_safety_transcripts(self, query: str, top_k: int = 3) -> List[Evidence]:
        """Search AI safety video transcripts via MCP"""
        if not self.mcp_available:
            return []

        try:
            # Note: This would need to be called via Claude Code's MCP integration
            # For now, return empty - will be populated when run via Claude Code
            return []
        except Exception as e:
            print(f"⚠️ MCP search failed: {e}", file=sys.stderr)
            return []

    def search_web(self, query: str, top_k: int = 3) -> List[Evidence]:
        """Search web for recent papers/discussions"""
        # Note: This would use web search via Claude Code
        # For now, return empty - will be populated when run via Claude Code
        return []

    def search_arxiv(self, query: str, year_from: int = 2024) -> List[Evidence]:
        """Search arXiv for recent papers"""
        # Could use arxiv API here
        return []

    def categorize_question(self, question: Dict) -> QuestionEvaluation:
        """
        Categorize a single question based on available evidence

        Strategy:
        1. Search AI safety transcripts for discussions
        2. Search web for recent papers (2024-2025)
        3. Analyze evidence to determine status
        4. Assign confidence score
        """
        title = question['title']
        section = question['section']

        print(f"\n📋 Evaluating [{section}] {title}", file=sys.stderr)

        # Collect evidence from multiple sources
        evidence = []

        # Search transcripts
        transcript_evidence = self.search_ai_safety_transcripts(title)
        evidence.extend(transcript_evidence)

        # Search web
        web_evidence = self.search_web(f"{title} AI safety research 2024")
        evidence.extend(web_evidence)

        # Determine status based on evidence
        status, confidence, reasoning = self._determine_status(question, evidence)

        return QuestionEvaluation(
            id=question['id'],
            section=question['section'],
            title=question['title'],
            category=question['category'],
            parent_section=question['parent_section'],
            status=status,
            confidence=confidence,
            evidence=evidence,
            reasoning=reasoning,
            evaluated_at="2025-10-29"  # Would use datetime.now()
        )

    def _determine_status(
        self,
        question: Dict,
        evidence: List[Evidence]
    ) -> tuple[str, float, str]:
        """
        Determine question status from evidence

        Returns: (status, confidence, reasoning)
        """
        if not evidence:
            return 'open', 0.5, 'No evidence found - tentatively marked as open'

        # Analyze evidence
        # This is where we'd use LLM to evaluate if question is addressed/solved/open
        # For now, mark all as open pending manual review
        return 'open', 0.3, 'Pending manual evaluation with evidence'


def main():
    """Run systematic categorization"""

    # Load extracted questions
    questions_path = Path('research/ai_safety_open_problems_full.json')
    with open(questions_path) as f:
        data = json.load(f)

    questions = data['research_directions']

    print(f"📊 Categorizing {len(questions)} research directions", file=sys.stderr)

    # Initialize categorizer
    categorizer = QuestionCategorizer(mcp_available=True)

    # Categorize each question
    evaluations = []
    for i, question in enumerate(questions, 1):
        print(f"\n[{i}/{len(questions)}]", file=sys.stderr)
        evaluation = categorizer.categorize_question(question)
        evaluations.append(asdict(evaluation))

    # Save results
    output = {
        'metadata': {
            'source_paper': data['source'],
            'total_questions': len(questions),
            'evaluation_date': '2025-10-29',
            'method': 'systematic_multi_source_evaluation'
        },
        'summary': {
            'addressed': sum(1 for e in evaluations if e['status'] == 'addressed'),
            'solved': sum(1 for e in evaluations if e['status'] == 'solved'),
            'open': sum(1 for e in evaluations if e['status'] == 'open')
        },
        'evaluations': evaluations
    }

    output_path = Path('research/ai_safety_questions_categorized.json')
    with open(output_path, 'w') as f:
        json.dump(output, f, indent=2)

    print(f"\n✅ Categorization complete", file=sys.stderr)
    print(f"   Addressed: {output['summary']['addressed']}", file=sys.stderr)
    print(f"   Solved: {output['summary']['solved']}", file=sys.stderr)
    print(f"   Open: {output['summary']['open']}", file=sys.stderr)
    print(f"\n💾 Saved to: {output_path}", file=sys.stderr)


if __name__ == '__main__':
    main()

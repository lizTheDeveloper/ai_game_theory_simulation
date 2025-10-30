#!/usr/bin/env python3
"""
Extract Open Problems from AI Safety Paper (arXiv:2404.09932)

Extracts all 200+ research questions from the foundational challenges paper.
Creates structured JSON for systematic analysis.

Usage:
    python extract-open-problems.py input.pdf --output questions.json
"""

import re
import json
import sys
from pathlib import Path
import argparse

try:
    import pymupdf4llm
except ImportError:
    print("❌ pymupdf4llm not installed. Install with: pip install pymupdf4llm", file=sys.stderr)
    sys.exit(1)


def extract_questions(pdf_path: Path) -> list:
    """Extract all research questions from the PDF.

    Questions are formatted as numbered section headers ending with '?'
    Example: "2.1.1 Is ICL Sophisticated Pattern-Matching?"

    Returns:
        List of dicts with question metadata
    """
    # Parse PDF to markdown
    print(f"📄 Parsing {pdf_path.name}...", file=sys.stderr)
    text = pymupdf4llm.to_markdown(str(pdf_path))

    # Find all question-style section headers
    # Pattern: section number + question text ending with '?'
    pattern = r'(\d+\.\d+(?:\.\d+)?)\s+([^\n]+\?)'

    matches = re.findall(pattern, text, re.MULTILINE)

    questions = []

    for i, (section_num, question_text) in enumerate(matches, 1):
        # Clean up question text
        question_text = question_text.strip()

        # Determine category based on section number
        main_section = section_num.split('.')[0]

        category_map = {
            '2': 'Scientific Understanding of LLMs',
            '3': 'Development and Deployment Methods',
            '4': 'Sociotechnical Challenges'
        }

        category = category_map.get(main_section, 'Unknown')

        questions.append({
            'id': i,
            'section': section_num,
            'question': question_text,
            'category': category,
            'status': 'open',  # Default - will be updated by analysis
            'addressed_by': [],  # Papers/work that address this
            'solved': False,
            'notes': ''
        })

    return questions


def main():
    parser = argparse.ArgumentParser(description='Extract research questions from AI safety paper')
    parser.add_argument('pdf', type=Path, help='PDF file path')
    parser.add_argument('--output', type=Path, required=True, help='Output JSON path')

    args = parser.parse_args()

    # Extract questions
    questions = extract_questions(args.pdf)

    print(f"✅ Extracted {len(questions)} questions", file=sys.stderr)

    # Group by category
    by_category = {}
    for q in questions:
        cat = q['category']
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(q)

    print("\nBreakdown by category:", file=sys.stderr)
    for cat, qs in sorted(by_category.items()):
        print(f"  {cat}: {len(qs)} questions", file=sys.stderr)

    # Save to JSON
    output_data = {
        'source': {
            'title': 'Foundational Challenges in Assuring Alignment and Safety of Large Language Models',
            'arxiv_id': '2404.09932',
            'url': 'https://arxiv.org/abs/2404.09932',
            'extracted_date': str(Path().resolve())
        },
        'summary': {
            'total_questions': len(questions),
            'by_category': {cat: len(qs) for cat, qs in by_category.items()}
        },
        'questions': questions
    }

    with open(args.output, 'w') as f:
        json.dump(output_data, f, indent=2)

    print(f"\n💾 Saved to {args.output}", file=sys.stderr)

    # Print first few questions as sample
    print("\nSample questions:", file=sys.stderr)
    for q in questions[:5]:
        print(f"\n{q['id']}. [{q['section']}] {q['question']}", file=sys.stderr)


if __name__ == '__main__':
    main()

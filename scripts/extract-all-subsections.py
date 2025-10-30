#!/usr/bin/env python3
"""
Extract ALL subsections from AI Safety paper using pymupdf4llm.

The 200+ "questions" are actually the 2.x.x, 3.x.x, 4.x.x subsections.
Some end with "?" but many are imperative statements like "LLM Reasoning Is Black-Box"
"""

import re
import json
import sys
from pathlib import Path
import pymupdf4llm

def extract_all_subsections(pdf_path: Path, output_path: Path):
    """Extract all subsections (the 200+ research directions)."""

    print("📄 Extracting full text with pymupdf4llm...", file=sys.stderr)
    text = pymupdf4llm.to_markdown(str(pdf_path))

    print(f"✅ Extracted {len(text)} characters", file=sys.stderr)

    # Pattern for subsections: **2.1.1** followed by title with various formatting
    # Capture section number and then grab the title until we hit a newline with content
    # Title format: **2.1.1** **Part1** _**ItalicPart**_ **Part2?**
    pattern = r'\*\*(\d+\.\d+\.\d+)\*\*\s+(.+?)(?=\n\n|\n[A-Z])'

    matches = re.findall(pattern, text, re.DOTALL)

    print(f"🔍 Found {len(matches)} subsections", file=sys.stderr)

    # Structure by category
    questions = []

    for section_num, title_raw in matches:
        # Clean up title: remove all markdown formatting and extra whitespace
        title = re.sub(r'[*_]+', '', title_raw)  # Remove ** and __ and _
        title = ' '.join(title.split()).strip()  # Normalize whitespace

        # Determine category
        main_section = section_num.split('.')[0]
        category_map = {
            '1': 'Introduction',
            '2': 'Scientific Understanding of LLMs',
            '3': 'Development and Deployment Methods',
            '4': 'Sociotechnical Challenges',
            '5': 'Discussion'
        }
        category = category_map.get(main_section, 'Unknown')

        # Determine parent challenge (2.1.1 -> parent is 2.1)
        parent_section = '.'.join(section_num.split('.')[:2])

        questions.append({
            'id': len(questions) + 1,
            'section': section_num,
            'title': title,
            'category': category,
            'parent_section': parent_section,
            'is_question': title.endswith('?'),
            'status': 'open',  # To be updated by analysis
            'addressed_by': [],
            'notes': ''
        })

    # Count by category
    by_category = {}
    for q in questions:
        cat = q['category']
        if cat not in by_category:
            by_category[cat] = []
        by_category[cat].append(q)

    # Output
    result = {
        'source': {
            'title': 'Foundational Challenges in Assuring Alignment and Safety of Large Language Models',
            'arxiv_id': '2404.09932',
            'url': 'https://arxiv.org/abs/2404.09932'
        },
        'summary': {
            'total_subsections': len(questions),
            'explicit_questions': sum(1 for q in questions if q['is_question']),
            'by_category': {cat: len(qs) for cat, qs in by_category.items()}
        },
        'research_directions': questions
    }

    # Save
    with open(output_path, 'w') as f:
        json.dump(result, f, indent=2)

    print(f"\n✅ Extracted {len(questions)} research directions", file=sys.stderr)
    print(f"   Explicit questions (ending with '?'): {result['summary']['explicit_questions']}", file=sys.stderr)
    print(f"\nBy category:", file=sys.stderr)
    for cat, count in sorted(result['summary']['by_category'].items()):
        print(f"   {cat}: {count}", file=sys.stderr)

    # Show samples
    print("\nSample research directions:", file=sys.stderr)
    for q in questions[:10]:
        marker = "❓" if q['is_question'] else "📋"
        print(f"{marker} [{q['section']}] {q['title']}", file=sys.stderr)

    return result


if __name__ == '__main__':
    pdf_path = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('/tmp/open_problems_ai_safety_2024.pdf')
    output_path = Path('research/ai_safety_open_problems_full.json')

    extract_all_subsections(pdf_path, output_path)

    print(f"\n💾 Saved to: {output_path}", file=sys.stderr)

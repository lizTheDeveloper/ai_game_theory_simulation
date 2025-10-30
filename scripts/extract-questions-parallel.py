#!/usr/bin/env python3
"""
Parallel Question Extraction from AI Safety Paper

Spawns 3 agents in parallel to extract foundational challenges and research questions
from different sections of the paper.

Usage:
    python extract-questions-parallel.py /tmp/open_problems_ai_safety_2024.pdf
"""

import json
import sys
from pathlib import Path
import argparse
import subprocess
import pymupdf4llm
from concurrent.futures import ProcessPoolExecutor, as_completed

def extract_page_range(pdf_path: Path, start_page: int, end_page: int, output_path: Path, chunk_id: int):
    """Extract questions from a specific page range.

    Args:
        pdf_path: Path to PDF
        start_page: Starting page (1-indexed)
        end_page: Ending page (inclusive)
        output_path: Where to save results
        chunk_id: Chunk identifier (1, 2, or 3)
    """
    print(f"[Chunk {chunk_id}] Processing pages {start_page}-{end_page}...", file=sys.stderr)

    # Extract text from page range
    import PyPDF2

    text = ""
    with open(pdf_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        for page_num in range(start_page - 1, end_page):  # 0-indexed
            if page_num < len(reader.pages):
                page = reader.pages[page_num]
                text += f"\n\n=== PAGE {page_num + 1} ===\n\n"
                text += page.extract_text()

    # Save text for processing
    text_path = output_path.parent / f"chunk{chunk_id}_text.txt"
    with open(text_path, 'w') as f:
        f.write(text)

    print(f"[Chunk {chunk_id}] Extracted {len(text)} characters", file=sys.stderr)

    # Parse structure
    import re

    # Find foundational challenges (major sections like "2.1 Title")
    challenges = []
    challenge_pattern = r'^\*{0,2}(\d+\.\d+)\*{0,2}\s+\*{0,2}(.+?)\*{0,2}$'

    # Find research questions (subsections like "2.1.1 Question?")
    question_pattern = r'^(\d+\.\d+\.\d+)\s+(.+?\?)'

    lines = text.split('\n')
    current_challenge = None

    for i, line in enumerate(lines):
        line = line.strip()

        # Check for challenge
        challenge_match = re.match(challenge_pattern, line)
        if challenge_match:
            section_num = challenge_match.group(1)
            title = challenge_match.group(2).strip()

            # Determine category based on section number
            main_section = section_num.split('.')[0]
            category_map = {
                '2': 'Scientific Understanding of LLMs',
                '3': 'Development and Deployment Methods',
                '4': 'Sociotechnical Challenges'
            }
            category = category_map.get(main_section, 'Unknown')

            current_challenge = {
                'section': section_num,
                'title': title,
                'category': category,
                'page': start_page + (i // 50),  # Rough estimate
                'research_questions': []
            }
            challenges.append(current_challenge)

        # Check for question
        question_match = re.match(question_pattern, line)
        if question_match and current_challenge:
            section_num = question_match.group(1)
            question_text = question_match.group(2).strip()

            current_challenge['research_questions'].append({
                'section': section_num,
                'question': question_text,
                'page': start_page + (i // 50),
                'context': ''  # TODO: Extract context
            })

    # Create output
    result = {
        'chunk_id': chunk_id,
        'page_range': f"{start_page}-{end_page}",
        'foundational_challenges': challenges,
        'total_questions': sum(len(c['research_questions']) for c in challenges),
        'total_challenges': len(challenges)
    }

    # Save
    with open(output_path, 'w') as f:
        json.dump(result, f, indent=2)

    print(f"[Chunk {chunk_id}] ✅ Extracted {result['total_challenges']} challenges, {result['total_questions']} questions", file=sys.stderr)

    return result


def main():
    parser = argparse.ArgumentParser(description='Extract questions in parallel')
    parser.add_argument('pdf', type=Path, help='PDF file path')
    parser.add_argument('--output-dir', type=Path, default=Path('research/ai_safety_questions'),
                       help='Output directory')

    args = parser.parse_args()

    # Calculate page splits
    import PyPDF2
    with open(args.pdf, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        total_pages = len(reader.pages)

    pages_per_chunk = total_pages // 3

    chunks = [
        (1, pages_per_chunk, 1),
        (pages_per_chunk + 1, pages_per_chunk * 2, 2),
        (pages_per_chunk * 2 + 1, total_pages, 3)
    ]

    print(f"📄 Processing {total_pages} pages in 3 chunks...", file=sys.stderr)

    # Process chunks in parallel
    results = []
    with ProcessPoolExecutor(max_workers=3) as executor:
        futures = []

        for start_page, end_page, chunk_id in chunks:
            output_path = args.output_dir / f"chunk{chunk_id}" / "questions.json"
            output_path.parent.mkdir(parents=True, exist_ok=True)

            future = executor.submit(
                extract_page_range,
                args.pdf,
                start_page,
                end_page,
                output_path,
                chunk_id
            )
            futures.append(future)

        # Wait for all to complete
        for future in as_completed(futures):
            try:
                result = future.result()
                results.append(result)
            except Exception as e:
                print(f"❌ Error: {e}", file=sys.stderr)

    # Merge results
    print("\n🔄 Merging results...", file=sys.stderr)

    all_challenges = []
    total_questions = 0

    for result in sorted(results, key=lambda r: r['chunk_id']):
        all_challenges.extend(result['foundational_challenges'])
        total_questions += result['total_questions']

    merged = {
        'source': {
            'title': 'Foundational Challenges in Assuring Alignment and Safety of Large Language Models',
            'arxiv_id': '2404.09932',
            'url': 'https://arxiv.org/abs/2404.09932',
            'total_pages': total_pages
        },
        'summary': {
            'total_challenges': len(all_challenges),
            'total_questions': total_questions,
            'by_category': {}
        },
        'foundational_challenges': all_challenges
    }

    # Count by category
    for challenge in all_challenges:
        cat = challenge['category']
        if cat not in merged['summary']['by_category']:
            merged['summary']['by_category'][cat] = {
                'challenges': 0,
                'questions': 0
            }
        merged['summary']['by_category'][cat]['challenges'] += 1
        merged['summary']['by_category'][cat]['questions'] += len(challenge['research_questions'])

    # Save merged
    merged_path = args.output_dir / "all_questions.json"
    with open(merged_path, 'w') as f:
        json.dump(merged, f, indent=2)

    print(f"\n✅ COMPLETE", file=sys.stderr)
    print(f"   Total challenges: {len(all_challenges)}", file=sys.stderr)
    print(f"   Total questions: {total_questions}", file=sys.stderr)
    print(f"   Saved to: {merged_path}", file=sys.stderr)

    # Print breakdown
    print("\nBreakdown by category:", file=sys.stderr)
    for cat, counts in merged['summary']['by_category'].items():
        print(f"  {cat}:", file=sys.stderr)
        print(f"    Challenges: {counts['challenges']}", file=sys.stderr)
        print(f"    Questions: {counts['questions']}", file=sys.stderr)


if __name__ == '__main__':
    main()

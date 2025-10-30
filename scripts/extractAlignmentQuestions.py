#!/usr/bin/env python3
"""
Extract Open Problems in AI Alignment from arXiv:2404.09932

Systematically extracts all questions from the paper and prepares them
for research status tracking.
"""

import pdfplumber
import re
import json
from pathlib import Path
from typing import List, Dict


def extract_questions_from_pdf(pdf_path: str) -> List[Dict]:
    """Extract all questions from the PDF."""
    questions = []

    with pdfplumber.open(pdf_path) as pdf:
        print(f"PDF has {len(pdf.pages)} pages")

        full_text = ""
        for i, page in enumerate(pdf.pages, 1):
            print(f"Processing page {i}/{len(pdf.pages)}...")
            text = page.extract_text()
            if text:
                full_text += f"\n\n=== PAGE {i} ===\n\n"
                full_text += text

        # Save full text for reference
        output_dir = Path(__file__).parent.parent / "research"
        output_dir.mkdir(exist_ok=True)

        with open(output_dir / "alignment_open_problems_full_text.txt", "w", encoding="utf-8") as f:
            f.write(full_text)

        print(f"\nFull text saved ({len(full_text)} characters)")

        # Extract questions - looking for patterns
        # Questions likely end with "?" and may be numbered

        # Pattern 1: Sentences ending with "?"
        question_pattern = r'([^.!?]*\?)'
        matches = re.findall(question_pattern, full_text)

        print(f"\nFound {len(matches)} potential questions")

        # Clean and structure questions
        for i, match in enumerate(matches, 1):
            question_text = match.strip()

            # Skip very short matches (likely headers or fragments)
            if len(question_text) < 10:
                continue

            # Find which page this question is on
            page_num = None
            page_marker_pattern = f"=== PAGE (\\d+) ===.*?{re.escape(question_text[:50])}"
            page_match = re.search(page_marker_pattern, full_text, re.DOTALL)
            if page_match:
                page_num = int(page_match.group(1))

            questions.append({
                'id': i,
                'text': question_text,
                'page': page_num,
                'category': None,  # To be filled in
                'status': 'unknown',  # addressed/solved/open
                'notes': ''
            })

        print(f"\nExtracted {len(questions)} substantial questions")

    return questions


def save_questions(questions: List[Dict], output_path: str):
    """Save questions to JSON and markdown."""
    # JSON format
    json_path = output_path.replace('.md', '.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)

    print(f"Saved JSON to {json_path}")

    # Markdown format
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("# Open Problems in AI Alignment (arXiv:2404.09932)\n\n")
        f.write(f"**Source:** https://arxiv.org/abs/2404.09932\n")
        f.write(f"**Date:** April 2024\n")
        f.write(f"**Total Questions Extracted:** {len(questions)}\n\n")
        f.write("---\n\n")

        f.write("## Questions by ID\n\n")

        for q in questions:
            f.write(f"### Question {q['id']}\n\n")
            f.write(f"**Text:** {q['text']}\n\n")
            if q['page']:
                f.write(f"**Page:** {q['page']}\n\n")
            f.write(f"**Status:** {q['status']}\n\n")
            f.write(f"**Category:** {q['category'] or 'TBD'}\n\n")
            f.write(f"**Notes:** {q['notes'] or 'Pending research'}\n\n")
            f.write("---\n\n")

    print(f"Saved Markdown to {output_path}")


def main():
    pdf_path = Path(__file__).parent.parent / "research/papers/2404.09932_ai_alignment_open_problems.pdf"

    if not pdf_path.exists():
        print(f"Error: PDF not found at {pdf_path}")
        return 1

    print(f"Extracting questions from {pdf_path}")
    questions = extract_questions_from_pdf(str(pdf_path))

    # Save results
    output_path = Path(__file__).parent.parent / "research/alignment_open_problems_extracted.md"
    save_questions(questions, str(output_path))

    print(f"\n✅ Extraction complete!")
    print(f"   Total questions: {len(questions)}")
    print(f"   Output: {output_path}")
    print(f"\nNext steps:")
    print("   1. Review extracted questions for accuracy")
    print("   2. Categorize questions by topic")
    print("   3. Research status of each question")
    print("   4. Update status (addressed/solved/open)")

    return 0


if __name__ == '__main__':
    exit(main())

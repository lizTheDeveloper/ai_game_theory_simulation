#!/usr/bin/env python3
"""
Extract Research Citations, Links, and Papers from Claude Code Conversations

Parses JSONL conversation files and extracts:
- URLs (especially academic papers, arXiv, research sites)
- Paper citations (author, year, title)
- Research references
- DOIs
"""

import json
import re
from pathlib import Path
from collections import defaultdict
from urllib.parse import urlparse

# Directories to search
CONVERSATION_DIRS = [
    'claude-conversations',
]

# Research-related domains
RESEARCH_DOMAINS = {
    'arxiv.org',
    'doi.org',
    'scholar.google.com',
    'ncbi.nlm.nih.gov',
    'sciencedirect.com',
    'nature.com',
    'science.org',
    'pnas.org',
    'journals.plos.org',
    'springer.com',
    'wiley.com',
    'tandfonline.com',
    'jstor.org',
    'researchgate.net',
    'semanticscholar.org',
    'biorxiv.org',
    'medrxiv.org',
    'ssrn.com',
    'papers.ssrn.com',
    'openreview.net',
    'proceedings.neurips.cc',
    'aclanthology.org',
    'anthropic.com',
    'openai.com',
    'deepmind.com',
    'alignment.org',
    'alignmentforum.org',
    'lesswrong.com',
}

# Pattern to detect citations (Author, Year)
CITATION_PATTERN = re.compile(r'\b([A-Z][a-z]+(?:\s+(?:et\s+al\.|and|&)\s+[A-Z][a-z]+)?)\s*\((\d{4})\)')

# Pattern to detect paper titles (in quotes)
TITLE_PATTERN = re.compile(r'"([^"]{20,200})"')

# Pattern to detect DOIs
DOI_PATTERN = re.compile(r'\b(10\.\d{4,}/[^\s]+)')

# URL pattern
URL_PATTERN = re.compile(r'https?://[^\s<>"\']+')


def extract_from_text(text):
    """Extract research references from text."""
    results = {
        'urls': set(),
        'citations': set(),
        'titles': set(),
        'dois': set(),
    }

    # Extract URLs
    for url in URL_PATTERN.findall(text):
        # Clean URL (remove trailing punctuation)
        url = url.rstrip('.,;:!?)')
        results['urls'].add(url)

    # Extract citations
    for match in CITATION_PATTERN.finditer(text):
        author, year = match.groups()
        results['citations'].add(f"{author} ({year})")

    # Extract potential paper titles
    for title in TITLE_PATTERN.findall(text):
        # Filter out non-research titles (too short, too common)
        if len(title) > 30 and not title.lower().startswith(('the ', 'this ', 'that ')):
            results['titles'].add(title)

    # Extract DOIs
    for doi in DOI_PATTERN.findall(text):
        results['dois'].add(doi)

    return results


def parse_jsonl_file(filepath):
    """Parse a JSONL conversation file and extract research references."""
    results = {
        'urls': defaultdict(list),  # url -> [conversation contexts]
        'citations': defaultdict(list),
        'titles': defaultdict(list),
        'dois': defaultdict(list),
    }

    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f):
                try:
                    data = json.loads(line.strip())

                    # Extract text from message content
                    text = None
                    if 'message' in data:
                        msg = data['message']
                        if isinstance(msg, dict):
                            # Assistant message
                            if 'content' in msg:
                                content = msg['content']
                                if isinstance(content, str):
                                    text = content
                                elif isinstance(content, list):
                                    # Extract text from content blocks
                                    text = ' '.join(
                                        block.get('text', '')
                                        for block in content
                                        if isinstance(block, dict) and 'text' in block
                                    )

                    if text:
                        extracted = extract_from_text(text)

                        # Store with context (filename + line number)
                        context = f"{filepath.name}:{line_num}"

                        for url in extracted['urls']:
                            results['urls'][url].append(context)

                        for citation in extracted['citations']:
                            results['citations'][citation].append(context)

                        for title in extracted['titles']:
                            results['titles'][title].append(context)

                        for doi in extracted['dois']:
                            results['dois'][doi].append(context)

                except json.JSONDecodeError:
                    continue

    except Exception as e:
        print(f"Error reading {filepath}: {e}")

    return results


def merge_results(all_results):
    """Merge results from multiple files."""
    merged = {
        'urls': defaultdict(list),
        'citations': defaultdict(list),
        'titles': defaultdict(list),
        'dois': defaultdict(list),
    }

    for results in all_results:
        for key in merged:
            for item, contexts in results[key].items():
                merged[key][item].extend(contexts)

    return merged


def filter_research_urls(urls):
    """Filter URLs to keep only research-related ones."""
    research_urls = {}

    for url, contexts in urls.items():
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower().replace('www.', '')

            # Check if domain is in research domains
            is_research = any(
                research_domain in domain
                for research_domain in RESEARCH_DOMAINS
            )

            # Also check for PDF papers
            if url.lower().endswith('.pdf'):
                is_research = True

            # Check for common paper patterns
            if any(pattern in url.lower() for pattern in ['paper', 'publication', 'article', 'research']):
                is_research = True

            if is_research:
                research_urls[url] = contexts

        except Exception:
            pass

    return research_urls


def main():
    print("🔍 Extracting Research from Claude Code Conversations\n")

    # Find all JSONL files
    all_results = []

    for conv_dir in CONVERSATION_DIRS:
        conv_path = Path(conv_dir)

        if not conv_path.exists():
            print(f"⚠️  Directory not found: {conv_dir}")
            continue

        jsonl_files = list(conv_path.glob('*.jsonl'))
        print(f"📁 Found {len(jsonl_files)} conversation files in {conv_dir}")

        for filepath in jsonl_files:
            results = parse_jsonl_file(filepath)
            all_results.append(results)

    # Merge all results
    print("\n📊 Merging results...")
    merged = merge_results(all_results)

    # Filter research URLs
    research_urls = filter_research_urls(merged['urls'])

    # Write output
    output_dir = Path('research/conversation-extracts')
    output_dir.mkdir(parents=True, exist_ok=True)

    # 1. Research URLs
    urls_file = output_dir / 'research_urls.md'
    with open(urls_file, 'w', encoding='utf-8') as f:
        f.write("# Research URLs from Conversations\n\n")
        f.write(f"Extracted: {len(research_urls)} research URLs\n\n")

        # Group by domain
        by_domain = defaultdict(list)
        for url in research_urls:
            try:
                domain = urlparse(url).netloc.replace('www.', '')
                by_domain[domain].append(url)
            except:
                by_domain['other'].append(url)

        for domain in sorted(by_domain.keys()):
            f.write(f"\n## {domain}\n\n")
            for url in sorted(by_domain[domain]):
                f.write(f"- {url}\n")
                # Add context (first 3 occurrences)
                contexts = research_urls[url][:3]
                for ctx in contexts:
                    f.write(f"  - Found in: `{ctx}`\n")

    print(f"✅ Wrote {len(research_urls)} research URLs to {urls_file}")

    # 2. Citations
    citations_file = output_dir / 'citations.md'
    with open(citations_file, 'w', encoding='utf-8') as f:
        f.write("# Citations from Conversations\n\n")
        f.write(f"Extracted: {len(merged['citations'])} citations\n\n")

        for citation in sorted(merged['citations'].keys()):
            f.write(f"- **{citation}**\n")
            # Add context (first 3)
            contexts = merged['citations'][citation][:3]
            for ctx in contexts:
                f.write(f"  - `{ctx}`\n")
            f.write("\n")

    print(f"✅ Wrote {len(merged['citations'])} citations to {citations_file}")

    # 3. Paper Titles
    titles_file = output_dir / 'paper_titles.md'
    with open(titles_file, 'w', encoding='utf-8') as f:
        f.write("# Potential Paper Titles from Conversations\n\n")
        f.write(f"Extracted: {len(merged['titles'])} potential titles\n\n")

        for title in sorted(merged['titles'].keys()):
            f.write(f"- \"{title}\"\n")
            # Add context (first 2)
            contexts = merged['titles'][title][:2]
            for ctx in contexts:
                f.write(f"  - `{ctx}`\n")
            f.write("\n")

    print(f"✅ Wrote {len(merged['titles'])} titles to {titles_file}")

    # 4. DOIs
    dois_file = output_dir / 'dois.md'
    with open(dois_file, 'w', encoding='utf-8') as f:
        f.write("# DOIs from Conversations\n\n")
        f.write(f"Extracted: {len(merged['dois'])} DOIs\n\n")

        for doi in sorted(merged['dois'].keys()):
            f.write(f"- `{doi}` → https://doi.org/{doi}\n")
            # Add context (first 2)
            contexts = merged['dois'][doi][:2]
            for ctx in contexts:
                f.write(f"  - `{ctx}`\n")
            f.write("\n")

    print(f"✅ Wrote {len(merged['dois'])} DOIs to {dois_file}")

    # Summary
    print(f"\n📊 Summary:")
    print(f"   Research URLs: {len(research_urls)}")
    print(f"   Citations: {len(merged['citations'])}")
    print(f"   Paper Titles: {len(merged['titles'])}")
    print(f"   DOIs: {len(merged['dois'])}")
    print(f"\n📁 Output: research/conversation-extracts/")


if __name__ == '__main__':
    main()

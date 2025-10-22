#!/usr/bin/env python3
"""
Fetch arXiv Papers by Search Query

Usage:
    python scripts/fetchArxivPapers.py --query "AI persuasion" --max-results 10 --output-dir research/papers
    python scripts/fetchArxivPapers.py --help
"""

import arxiv
import argparse
from pathlib import Path
from typing import List
import sys

def search_and_download_papers(
    query: str,
    max_results: int = 10,
    output_dir: str = "research/papers",
    min_year: int = 2024,
    verbose: bool = True
) -> List[str]:
    """
    Search arXiv and download papers matching the query.

    Args:
        query: Search query string
        max_results: Maximum number of papers to download
        output_dir: Directory to save PDFs
        min_year: Only download papers from this year onwards
        verbose: Print progress messages

    Returns:
        List of downloaded file paths
    """
    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Search arXiv
    if verbose:
        print(f"\n🔍 Searching arXiv for: '{query}'")
        print(f"   Max results: {max_results}")
        print(f"   Min year: {min_year}")

    client = arxiv.Client()
    search = arxiv.Search(
        query=query,
        max_results=max_results * 2,  # Fetch more to filter by year
        sort_by=arxiv.SortCriterion.SubmittedDate,
        sort_order=arxiv.SortOrder.Descending
    )

    downloaded_files = []
    downloaded_count = 0

    for result in client.results(search):
        # Filter by year
        if result.published.year < min_year:
            continue

        if downloaded_count >= max_results:
            break

        # Create filename from arXiv ID
        arxiv_id = result.get_short_id()
        filename = f"{arxiv_id}.pdf"
        filepath = output_path / filename

        # Skip if already exists
        if filepath.exists():
            if verbose:
                print(f"   ⏭️  Skipping {arxiv_id} (already exists)")
            downloaded_files.append(str(filepath))
            downloaded_count += 1
            continue

        # Download paper
        try:
            if verbose:
                print(f"\n   📥 Downloading: {result.title}")
                print(f"      arXiv ID: {arxiv_id}")
                print(f"      Published: {result.published.strftime('%Y-%m-%d')}")
                print(f"      Authors: {', '.join([a.name for a in result.authors[:3]])}")
                if len(result.authors) > 3:
                    print(f"               + {len(result.authors) - 3} more")

            result.download_pdf(dirpath=str(output_path), filename=filename)
            downloaded_files.append(str(filepath))
            downloaded_count += 1

            if verbose:
                print(f"      ✅ Saved to: {filepath}")

        except Exception as e:
            if verbose:
                print(f"      ❌ Error downloading {arxiv_id}: {e}")
            continue

    if verbose:
        print(f"\n✅ Downloaded {downloaded_count} papers to {output_path}")

    return downloaded_files


def main():
    parser = argparse.ArgumentParser(
        description="Search and download papers from arXiv",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    # AI persuasion papers (2024+)
    python scripts/fetchArxivPapers.py --query "artificial intelligence persuasion" --max-results 10

    # AI social influence papers
    python scripts/fetchArxivPapers.py --query "AI social influence manipulation" --max-results 15

    # Custom output directory and year range
    python scripts/fetchArxivPapers.py --query "language model deception" --output-dir papers --min-year 2023
        """
    )

    parser.add_argument(
        "--query", "-q",
        type=str,
        required=True,
        help="Search query string"
    )

    parser.add_argument(
        "--max-results", "-n",
        type=int,
        default=10,
        help="Maximum number of papers to download (default: 10)"
    )

    parser.add_argument(
        "--output-dir", "-o",
        type=str,
        default="research/papers",
        help="Output directory for PDFs (default: research/papers)"
    )

    parser.add_argument(
        "--min-year", "-y",
        type=int,
        default=2024,
        help="Only download papers from this year onwards (default: 2024)"
    )

    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Suppress progress messages"
    )

    args = parser.parse_args()

    try:
        downloaded = search_and_download_papers(
            query=args.query,
            max_results=args.max_results,
            output_dir=args.output_dir,
            min_year=args.min_year,
            verbose=not args.quiet
        )

        print(f"\n📄 Downloaded {len(downloaded)} papers")
        return 0

    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        return 130
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())

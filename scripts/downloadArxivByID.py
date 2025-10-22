#!/usr/bin/env python3
"""
Download arXiv Papers by ID

Usage:
    python scripts/downloadArxivByID.py 2412.14093 2307.16513 --output-dir research/papers
    python scripts/downloadArxivByID.py --ids-file arxiv_ids.txt
"""

import arxiv
import argparse
from pathlib import Path
from typing import List
import sys

def download_papers_by_id(
    arxiv_ids: List[str],
    output_dir: str = "research/papers",
    verbose: bool = True
) -> List[str]:
    """
    Download arXiv papers by their IDs.

    Args:
        arxiv_ids: List of arXiv IDs (e.g., ["2412.14093", "2307.16513"])
        output_dir: Directory to save PDFs
        verbose: Print progress messages

    Returns:
        List of downloaded file paths
    """
    # Create output directory
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    if verbose:
        print(f"\n📥 Downloading {len(arxiv_ids)} papers from arXiv")
        print(f"   Output: {output_path}\n")

    client = arxiv.Client()
    downloaded_files = []

    for arxiv_id in arxiv_ids:
        # Clean the ID (remove version if present for search, but keep for filename)
        clean_id = arxiv_id.split('v')[0] if 'v' in arxiv_id else arxiv_id

        # Search for the paper
        try:
            search = arxiv.Search(id_list=[clean_id])
            result = next(client.results(search))

            # Use the full ID (with version) if provided, otherwise use the paper's ID
            filename_id = arxiv_id if 'v' in arxiv_id else result.get_short_id()
            filename = f"{filename_id}.pdf"
            filepath = output_path / filename

            # Skip if already exists
            if filepath.exists():
                if verbose:
                    print(f"⏭️  Skipping {filename_id} (already exists)")
                downloaded_files.append(str(filepath))
                continue

            # Download paper
            if verbose:
                print(f"📄 {result.title}")
                print(f"   arXiv ID: {filename_id}")
                print(f"   Published: {result.published.strftime('%Y-%m-%d')}")
                authors = [a.name for a in result.authors[:3]]
                print(f"   Authors: {', '.join(authors)}")
                if len(result.authors) > 3:
                    print(f"            + {len(result.authors) - 3} more")

            result.download_pdf(dirpath=str(output_path), filename=filename)
            downloaded_files.append(str(filepath))

            if verbose:
                print(f"   ✅ Saved to: {filepath}\n")

        except StopIteration:
            if verbose:
                print(f"❌ Paper not found: {arxiv_id}\n")
        except Exception as e:
            if verbose:
                print(f"❌ Error downloading {arxiv_id}: {e}\n")
            continue

    if verbose:
        print(f"✅ Downloaded {len(downloaded_files)} papers to {output_path}")

    return downloaded_files


def main():
    parser = argparse.ArgumentParser(
        description="Download arXiv papers by ID",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
    # Download specific papers by ID
    python scripts/downloadArxivByID.py 2412.14093 2307.16513

    # Download from a file containing IDs (one per line)
    python scripts/downloadArxivByID.py --ids-file arxiv_ids.txt

    # Custom output directory
    python scripts/downloadArxivByID.py 2412.14093 --output-dir papers/alignment
        """
    )

    parser.add_argument(
        "ids",
        nargs="*",
        help="arXiv IDs to download (e.g., 2412.14093 2307.16513)"
    )

    parser.add_argument(
        "--ids-file", "-f",
        type=str,
        help="File containing arXiv IDs (one per line)"
    )

    parser.add_argument(
        "--output-dir", "-o",
        type=str,
        default="research/papers",
        help="Output directory for PDFs (default: research/papers)"
    )

    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Suppress progress messages"
    )

    args = parser.parse_args()

    # Collect IDs from arguments and/or file
    ids = list(args.ids) if args.ids else []

    if args.ids_file:
        try:
            with open(args.ids_file, 'r') as f:
                file_ids = [line.strip() for line in f if line.strip() and not line.startswith('#')]
                ids.extend(file_ids)
        except FileNotFoundError:
            print(f"❌ File not found: {args.ids_file}", file=sys.stderr)
            return 1
        except Exception as e:
            print(f"❌ Error reading file: {e}", file=sys.stderr)
            return 1

    if not ids:
        parser.print_help()
        print("\n❌ Error: No arXiv IDs provided", file=sys.stderr)
        return 1

    try:
        downloaded = download_papers_by_id(
            arxiv_ids=ids,
            output_dir=args.output_dir,
            verbose=not args.quiet
        )

        return 0

    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        return 130
    except Exception as e:
        print(f"\n❌ Error: {e}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())

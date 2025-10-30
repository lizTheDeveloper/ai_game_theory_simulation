#!/usr/bin/env python3
"""
Reindex all PDFs with header-based chunking.

This script:
1. Finds all PDFs in research/papers and ~/Downloads/Papers
2. Parses them with PyMuPDF4LLM (best for academic papers)
3. Chunks with header-based strategy (abstract, methods, results, etc.)
4. Creates FAISS index with section metadata for filtered querying
5. Saves index to research/embeddings/papers_by_section.index

Usage:
    python3 scripts/reindex-all-papers.py

    # With progress logging
    python3 scripts/reindex-all-papers.py > logs/reindex_$(date +%Y%m%d_%H%M%S).log 2>&1 &
"""

import sys
import json
from pathlib import Path
from typing import List, Dict, Set
import argparse
from datetime import datetime

# Add parent to path
sys.path.insert(0, str(Path(__file__).parent))

try:
    import numpy as np
    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False

try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False

# FAISS not needed for header-based chunking (no embeddings)
# We'll just save as JSON
if not NUMPY_AVAILABLE:
    print("⚠️ NumPy not available (not needed for header chunking)", file=sys.stderr)

# Import from pdf-rag-local.py
import importlib.util
spec = importlib.util.spec_from_file_location("pdf_rag", Path(__file__).parent / "pdf-rag-local.py")
pdf_rag = importlib.util.module_from_spec(spec)
spec.loader.exec_module(pdf_rag)

PDFParserManager = pdf_rag.PDFParserManager
SemanticChunker = pdf_rag.SemanticChunker
ChunkStrategy = pdf_rag.ChunkStrategy


class PaperIndexer:
    """Indexes academic papers with section-based chunking."""

    def __init__(self, embedding_dim: int = 384):
        """Initialize indexer.

        Args:
            embedding_dim: Dimension for FAISS index (not used for header chunking)
        """
        self.parser = PDFParserManager()
        self.chunker = SemanticChunker(strategy=ChunkStrategy.HEADER)
        self.faiss_index = None  # Created when needed
        self.all_chunks = []
        self.stats = {
            'total_pdfs': 0,
            'successful': 0,
            'failed': 0,
            'total_chunks': 0,
            'sections': {}
        }

    def find_pdfs(self, directories: List[Path]) -> List[Path]:
        """Find all PDFs in given directories.

        Args:
            directories: List of directories to search

        Returns:
            List of PDF paths
        """
        pdfs = []

        for directory in directories:
            if not directory.exists():
                print(f"⚠️ Directory not found: {directory}", file=sys.stderr)
                continue

            # Find all PDFs recursively
            found = list(directory.rglob("*.pdf"))
            print(f"📂 Found {len(found)} PDFs in {directory}", file=sys.stderr)
            pdfs.extend(found)

        return pdfs

    def index_pdf(self, pdf_path: Path) -> bool:
        """Index a single PDF.

        Args:
            pdf_path: Path to PDF file

        Returns:
            True if successful, False otherwise
        """
        self.stats['total_pdfs'] += 1

        try:
            print(f"\n{'='*70}", file=sys.stderr)
            print(f"Processing [{self.stats['total_pdfs']}]: {pdf_path.name}", file=sys.stderr)
            print(f"{'='*70}", file=sys.stderr)

            # Parse PDF
            result = self.parser.parse(pdf_path)

            # Chunk by headers
            chunks = self.chunker.chunk(result.text, metadata={
                'source': str(pdf_path),
                'filename': pdf_path.name,
                'parser': result.parser_used,
                'num_pages': len(result.pages)
            })

            if not chunks:
                print(f"⚠️ No chunks created for {pdf_path.name}", file=sys.stderr)
                self.stats['failed'] += 1
                return False

            # Update statistics
            for chunk in chunks:
                section_type = chunk.metadata.get('section_type', 'unknown')
                self.stats['sections'][section_type] = self.stats['sections'].get(section_type, 0) + 1

            self.all_chunks.extend(chunks)
            self.stats['total_chunks'] += len(chunks)
            self.stats['successful'] += 1

            print(f"✅ Indexed {pdf_path.name}: {len(chunks)} sections", file=sys.stderr)

            return True

        except Exception as e:
            print(f"❌ Failed to index {pdf_path.name}: {e}", file=sys.stderr)
            import traceback
            traceback.print_exc()
            self.stats['failed'] += 1
            return False

    def save_index(self, output_path: Path):
        """Save indexed chunks to disk.

        Args:
            output_path: Path to save index
        """
        print(f"\n{'='*70}", file=sys.stderr)
        print(f"Saving index to {output_path}", file=sys.stderr)
        print(f"{'='*70}", file=sys.stderr)

        # Save chunks as JSON (no embeddings for header-based chunking)
        chunks_data = []
        for chunk in self.all_chunks:
            chunks_data.append({
                'text': chunk.text,
                'chunk_id': chunk.chunk_id,
                'page': chunk.page,
                'metadata': chunk.metadata
            })

        # Save to JSON
        json_path = output_path.parent / f"{output_path.stem}.json"
        with open(json_path, 'w') as f:
            json.dump({
                'chunks': chunks_data,
                'stats': self.stats,
                'created': datetime.now().isoformat(),
                'total_pdfs': self.stats['total_pdfs'],
                'total_chunks': self.stats['total_chunks']
            }, f, indent=2)

        print(f"💾 Saved {len(chunks_data)} chunks to {json_path}", file=sys.stderr)

        # Also create a section index (easier querying)
        self._create_section_index(output_path.parent)

    def _create_section_index(self, output_dir: Path):
        """Create separate files for each section type.

        Args:
            output_dir: Directory to save section indices
        """
        sections_dir = output_dir / "by_section"
        sections_dir.mkdir(exist_ok=True)

        # Group chunks by section type
        by_section = {}
        for chunk in self.all_chunks:
            section_type = chunk.metadata.get('section_type', 'unknown')
            if section_type not in by_section:
                by_section[section_type] = []
            by_section[section_type].append(chunk)

        # Save each section type separately
        for section_type, chunks in by_section.items():
            section_file = sections_dir / f"{section_type}.json"

            chunks_data = []
            for chunk in chunks:
                chunks_data.append({
                    'text': chunk.text,
                    'source': chunk.metadata.get('filename', 'unknown'),
                    'section_header': chunk.metadata.get('section_header', ''),
                    'page': chunk.page,
                    'char_count': len(chunk.text)
                })

            with open(section_file, 'w') as f:
                json.dump({
                    'section_type': section_type,
                    'count': len(chunks_data),
                    'chunks': chunks_data
                }, f, indent=2)

            print(f"  📑 {section_type}: {len(chunks)} chunks → {section_file.name}", file=sys.stderr)

    def print_stats(self):
        """Print indexing statistics."""
        print(f"\n{'='*70}", file=sys.stderr)
        print("Indexing Statistics", file=sys.stderr)
        print(f"{'='*70}", file=sys.stderr)

        print(f"\n📊 Overall:", file=sys.stderr)
        print(f"  Total PDFs: {self.stats['total_pdfs']}", file=sys.stderr)
        print(f"  Successful: {self.stats['successful']}", file=sys.stderr)
        print(f"  Failed: {self.stats['failed']}", file=sys.stderr)
        print(f"  Total chunks: {self.stats['total_chunks']}", file=sys.stderr)

        print(f"\n📑 Sections:", file=sys.stderr)
        for section, count in sorted(self.stats['sections'].items(), key=lambda x: -x[1]):
            percentage = (count / self.stats['total_chunks']) * 100
            print(f"  {section:25s}: {count:4d} ({percentage:5.1f}%)", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(description='Reindex all PDFs with header-based chunking')
    parser.add_argument('--output', type=Path,
                        default=Path('research/embeddings/papers_by_section.index'),
                        help='Output index path')
    parser.add_argument('--limit', type=int, help='Limit number of PDFs to process (for testing)')

    args = parser.parse_args()

    print("="*70, file=sys.stderr)
    print("PDF Reindexing with Header-Based Chunking", file=sys.stderr)
    print("="*70, file=sys.stderr)

    # Find all PDFs
    directories = [
        Path('research/papers'),
        Path.home() / 'Downloads' / 'Papers'
    ]

    indexer = PaperIndexer()
    pdfs = indexer.find_pdfs(directories)

    print(f"\n📚 Found {len(pdfs)} total PDFs", file=sys.stderr)

    # Apply limit if specified
    if args.limit:
        pdfs = pdfs[:args.limit]
        print(f"⚠️ Limiting to {len(pdfs)} PDFs for testing", file=sys.stderr)

    # Index all PDFs
    for pdf in pdfs:
        indexer.index_pdf(pdf)

    # Save results
    indexer.save_index(args.output)

    # Print statistics
    indexer.print_stats()

    print(f"\n{'='*70}", file=sys.stderr)
    print("✅ Reindexing complete!", file=sys.stderr)
    print(f"{'='*70}", file=sys.stderr)

    # Print usage instructions
    print(f"\nTo query specific sections:", file=sys.stderr)
    print(f"  # All abstracts", file=sys.stderr)
    print(f"  cat research/embeddings/by_section/abstract.json | jq '.chunks[].text'", file=sys.stderr)
    print(f"\n  # All results sections", file=sys.stderr)
    print(f"  cat research/embeddings/by_section/results.json | jq '.chunks[].text'", file=sys.stderr)
    print(f"\n  # Search abstracts for 'alignment'", file=sys.stderr)
    print(f"  cat research/embeddings/by_section/abstract.json | jq '.chunks[] | select(.text | contains(\"alignment\"))'", file=sys.stderr)


if __name__ == '__main__':
    main()

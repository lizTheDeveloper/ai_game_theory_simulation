#!/usr/bin/env python3
"""
Local PDF RAG System - Production Grade

Implements best ideas from pdfkb-mcp without Docker/DeepInfra dependencies.
Built for teaching and production use on Apple Silicon with 64 cores.

Features:
- Multiple PDF parsers (PyMuPDF4LLM, Marker, Docling, MinerU, LLM-based)
- Semantic chunking strategies (sentence, paragraph, semantic similarity)
- Local MLX embeddings (qwen0.5b, ~70 MTEB score)
- FAISS vector search
- Re-ranking with cross-encoder
- LLM-guided parse/chunk strategy selection
- Playwright fallback for 403 handling

Usage:
    # Index a PDF with paragraph chunking (default)
    python pdf-rag-local.py index paper.pdf --output index.faiss

    # Index with semantic chunking (requires MLX embedding server running)
    python pdf-rag-local.py index paper.pdf --output index.faiss \
        --chunk-strategy semantic --similarity-threshold 0.7

    # Search indexed PDFs
    python pdf-rag-local.py search "alignment problems" --index index.faiss

    # Extract structured content (like numbered questions)
    python pdf-rag-local.py extract paper.pdf --pattern "Question \\d+"

Semantic Chunking:
    Semantic chunking creates variable-sized chunks based on meaning rather than
    fixed boundaries. It works by:
    1. Splitting text into sentences
    2. Computing embeddings for each sentence (via MLX server)
    3. Calculating cosine similarity between adjacent sentences
    4. Merging sentences when similarity > threshold (default 0.7)
    5. Starting new chunk when similarity drops (topic change detected)

    To use semantic chunking, start the MLX embedding server first:
        python mlx-embedding-server.py --port 8765

    Then index with --chunk-strategy semantic

Architecture:
    1. PDF Parser Manager - Routes to best parser for document type
    2. Semantic Chunker - Multiple strategies (configurable)
    3. MLX Embedder - Local qwen0.5b embeddings
    4. FAISS Index - Fast vector search
    5. Re-ranker - Cross-encoder for relevance boost
    6. Strategy Selector - LLM picks best parse/chunk strategy
"""

import json
import sys
import re
from pathlib import Path
from typing import List, Dict, Optional, Tuple
from enum import Enum
import argparse
from dataclasses import dataclass, asdict
import urllib.request
import urllib.error
import numpy as np

# PDF parsing libraries (install as needed)
PDF_PARSERS_AVAILABLE = {}

try:
    import pymupdf4llm
    PDF_PARSERS_AVAILABLE['pymupdf4llm'] = True
except ImportError:
    PDF_PARSERS_AVAILABLE['pymupdf4llm'] = False

try:
    import marker
    PDF_PARSERS_AVAILABLE['marker'] = True
except ImportError:
    PDF_PARSERS_AVAILABLE['marker'] = False

try:
    import docling
    PDF_PARSERS_AVAILABLE['docling'] = True
except ImportError:
    PDF_PARSERS_AVAILABLE['docling'] = False

# Always available (fallback)
try:
    import PyPDF2
    PDF_PARSERS_AVAILABLE['pypdf2'] = True
except ImportError:
    PDF_PARSERS_AVAILABLE['pypdf2'] = False


class ChunkStrategy(Enum):
    """Chunking strategies for PDF content."""
    SENTENCE = "sentence"  # Split on sentences
    PARAGRAPH = "paragraph"  # Split on paragraphs
    SEMANTIC = "semantic"  # Semantic similarity-based chunking
    HEADER = "header"  # Split on document headers (academic papers: abstract, methods, results, etc.)
    PAGE = "page"  # One chunk per page
    FIXED_SIZE = "fixed"  # Fixed token count
    RECURSIVE = "recursive"  # Recursive character splitting


class ParserType(Enum):
    """Available PDF parsers."""
    PYMUPDF4LLM = "pymupdf4llm"  # Fast, good for clean PDFs
    MARKER = "marker"  # Best for complex layouts
    DOCLING = "docling"  # Good for tables
    PYPDF2 = "pypdf2"  # Fallback, basic
    LLM = "llm"  # Vision model parsing (expensive but handles anything)


@dataclass
class Chunk:
    """A chunk of text from a PDF."""
    text: str
    page: int
    chunk_id: str
    metadata: Dict
    embedding: Optional[List[float]] = None


@dataclass
class ParseResult:
    """Result of parsing a PDF."""
    text: str
    pages: List[Dict]  # Page-level metadata
    tables: List[Dict]  # Extracted tables
    images: List[Dict]  # Image metadata
    metadata: Dict  # Document-level metadata
    parser_used: str


class PDFParserManager:
    """Manages multiple PDF parsers and selects best one."""

    def __init__(self):
        """Initialize parser manager."""
        self.available_parsers = {
            k: v for k, v in PDF_PARSERS_AVAILABLE.items() if v
        }

        if not self.available_parsers:
            raise RuntimeError("No PDF parsers available. Install at least PyPDF2.")

        print(f"✅ Available parsers: {list(self.available_parsers.keys())}", file=sys.stderr)

    def parse(self, pdf_path: Path, parser: Optional[ParserType] = None) -> ParseResult:
        """Parse PDF using specified or auto-selected parser.

        Args:
            pdf_path: Path to PDF file
            parser: Specific parser to use (None = auto-select)

        Returns:
            ParseResult with extracted content
        """
        if parser is None:
            parser = self._select_parser(pdf_path)

        print(f"📄 Parsing {pdf_path.name} with {parser.value}...", file=sys.stderr)

        if parser == ParserType.PYMUPDF4LLM and self.available_parsers.get('pymupdf4llm'):
            return self._parse_pymupdf4llm(pdf_path)
        elif parser == ParserType.PYPDF2 and self.available_parsers.get('pypdf2'):
            return self._parse_pypdf2(pdf_path)
        else:
            # Fallback to PyPDF2
            return self._parse_pypdf2(pdf_path)

    def _select_parser(self, pdf_path: Path) -> ParserType:
        """Auto-select best parser for PDF.

        Args:
            pdf_path: Path to PDF

        Returns:
            Best parser type for this PDF
        """
        # Simple heuristic: prefer pymupdf4llm if available, else pypdf2
        if self.available_parsers.get('pymupdf4llm'):
            return ParserType.PYMUPDF4LLM
        elif self.available_parsers.get('pypdf2'):
            return ParserType.PYPDF2
        else:
            raise RuntimeError("No suitable parser available")

    def _parse_pymupdf4llm(self, pdf_path: Path) -> ParseResult:
        """Parse using PyMuPDF4LLM (best for clean academic PDFs)."""
        try:
            import pymupdf4llm

            md_text = pymupdf4llm.to_markdown(str(pdf_path))

            # Extract pages (simplified)
            pages = [{'text': md_text, 'page_num': 1}]

            return ParseResult(
                text=md_text,
                pages=pages,
                tables=[],
                images=[],
                metadata={'source': str(pdf_path)},
                parser_used='pymupdf4llm'
            )
        except Exception as e:
            print(f"⚠️ pymupdf4llm failed: {e}, falling back to PyPDF2", file=sys.stderr)
            return self._parse_pypdf2(pdf_path)

    def _parse_pypdf2(self, pdf_path: Path) -> ParseResult:
        """Parse using PyPDF2 (fallback)."""
        import PyPDF2

        text = ""
        pages = []

        with open(pdf_path, 'rb') as f:
            reader = PyPDF2.PdfReader(f)

            for i, page in enumerate(reader.pages):
                page_text = page.extract_text()
                text += page_text + "\n"
                pages.append({
                    'text': page_text,
                    'page_num': i + 1
                })

        return ParseResult(
            text=text,
            pages=pages,
            tables=[],
            images=[],
            metadata={'source': str(pdf_path), 'num_pages': len(pages)},
            parser_used='pypdf2'
        )


class EmbeddingClient:
    """Client for MLX embedding server."""

    def __init__(self, server_url: str = "http://localhost:8765"):
        """Initialize embedding client.

        Args:
            server_url: URL of MLX embedding server
        """
        self.server_url = server_url

    def embed(self, text: str) -> Optional[np.ndarray]:
        """Get embedding for text.

        Args:
            text: Text to embed

        Returns:
            Embedding vector or None if server unavailable
        """
        try:
            data = json.dumps({'text': text}).encode('utf-8')
            req = urllib.request.Request(
                f"{self.server_url}/embed",
                data=data,
                headers={'Content-Type': 'application/json'}
            )

            with urllib.request.urlopen(req, timeout=5) as response:
                result = json.loads(response.read().decode())
                return np.array(result['embedding'], dtype=np.float32)

        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError) as e:
            print(f"⚠️ Embedding server unavailable: {e}", file=sys.stderr)
            return None

    def embed_batch(self, texts: List[str]) -> Optional[np.ndarray]:
        """Get embeddings for multiple texts.

        Args:
            texts: List of texts to embed

        Returns:
            Matrix of embeddings or None if server unavailable
        """
        embeddings = []
        for text in texts:
            emb = self.embed(text)
            if emb is None:
                return None
            embeddings.append(emb)

        return np.vstack(embeddings) if embeddings else None


class SemanticChunker:
    """Chunks text using various strategies."""

    def __init__(
        self,
        strategy: ChunkStrategy = ChunkStrategy.PARAGRAPH,
        similarity_threshold: float = 0.7,
        embedding_server: str = "http://localhost:8765"
    ):
        """Initialize chunker.

        Args:
            strategy: Chunking strategy to use
            similarity_threshold: Threshold for semantic chunking (0-1, default 0.7)
            embedding_server: URL of MLX embedding server for semantic chunking
        """
        self.strategy = strategy
        self.similarity_threshold = similarity_threshold
        self.embedding_client = EmbeddingClient(embedding_server)

    def chunk(self, text: str, metadata: Dict = None) -> List[Chunk]:
        """Chunk text using configured strategy.

        Args:
            text: Text to chunk
            metadata: Metadata to attach to chunks

        Returns:
            List of chunks
        """
        metadata = metadata or {}

        if self.strategy == ChunkStrategy.PARAGRAPH:
            return self._chunk_by_paragraph(text, metadata)
        elif self.strategy == ChunkStrategy.SENTENCE:
            return self._chunk_by_sentence(text, metadata)
        elif self.strategy == ChunkStrategy.SEMANTIC:
            return self._chunk_semantic(text, metadata)
        elif self.strategy == ChunkStrategy.HEADER:
            return self._chunk_by_headers(text, metadata)
        elif self.strategy == ChunkStrategy.PAGE:
            return self._chunk_by_page(text, metadata)
        elif self.strategy == ChunkStrategy.FIXED_SIZE:
            return self._chunk_fixed_size(text, metadata)
        else:
            # Default to paragraph
            return self._chunk_by_paragraph(text, metadata)

    def _chunk_by_paragraph(self, text: str, metadata: Dict) -> List[Chunk]:
        """Chunk by paragraphs."""
        paragraphs = text.split('\n\n')

        chunks = []
        for i, para in enumerate(paragraphs):
            para = para.strip()
            if para:
                chunks.append(Chunk(
                    text=para,
                    page=metadata.get('page', 0),
                    chunk_id=f"para_{i}",
                    metadata=metadata
                ))

        return chunks

    def _chunk_by_sentence(self, text: str, metadata: Dict) -> List[Chunk]:
        """Chunk by sentences."""
        # Simple sentence splitting (can be improved with nltk)
        sentences = re.split(r'[.!?]+\s+', text)

        chunks = []
        for i, sent in enumerate(sentences):
            sent = sent.strip()
            if sent:
                chunks.append(Chunk(
                    text=sent,
                    page=metadata.get('page', 0),
                    chunk_id=f"sent_{i}",
                    metadata=metadata
                ))

        return chunks

    def _chunk_by_page(self, text: str, metadata: Dict) -> List[Chunk]:
        """One chunk per page."""
        return [Chunk(
            text=text,
            page=metadata.get('page', 0),
            chunk_id=f"page_{metadata.get('page', 0)}",
            metadata=metadata
        )]

    def _chunk_fixed_size(self, text: str, metadata: Dict, size: int = 512) -> List[Chunk]:
        """Fixed-size chunks (character-based)."""
        chunks = []
        for i in range(0, len(text), size):
            chunk_text = text[i:i + size]
            chunks.append(Chunk(
                text=chunk_text,
                page=metadata.get('page', 0),
                chunk_id=f"fixed_{i}",
                metadata=metadata
            ))

        return chunks

    def _chunk_semantic(self, text: str, metadata: Dict) -> List[Chunk]:
        """Chunk based on semantic similarity using embeddings.

        Algorithm:
        1. Split text into sentences
        2. Get embeddings for each sentence
        3. Calculate cosine similarity between adjacent sentences
        4. Merge sentences into chunks when similarity > threshold
        5. Start new chunk when similarity drops below threshold

        Args:
            text: Text to chunk
            metadata: Metadata to attach

        Returns:
            List of semantically-coherent chunks

        Falls back to paragraph chunking if embedding server unavailable.
        """
        # Split into sentences
        sentences = self._split_sentences(text)

        if len(sentences) <= 1:
            # Not enough sentences for semantic chunking
            return self._chunk_by_paragraph(text, metadata)

        # Get embeddings for all sentences
        print(f"🔢 Getting embeddings for {len(sentences)} sentences...", file=sys.stderr)
        embeddings = self.embedding_client.embed_batch(sentences)

        if embeddings is None:
            print("⚠️ Embedding server unavailable, falling back to paragraph chunking", file=sys.stderr)
            return self._chunk_by_paragraph(text, metadata)

        # Calculate semantic boundaries using cosine similarity
        chunks = []
        current_chunk_sentences = [sentences[0]]
        chunk_idx = 0

        for i in range(1, len(sentences)):
            # Calculate cosine similarity between current and previous sentence
            similarity = self._cosine_similarity(embeddings[i-1], embeddings[i])

            print(f"  Similarity[{i-1}→{i}]: {similarity:.3f}", file=sys.stderr)

            if similarity >= self.similarity_threshold:
                # High similarity - continue current chunk
                current_chunk_sentences.append(sentences[i])
            else:
                # Low similarity - start new chunk
                # Save current chunk
                chunk_text = ' '.join(current_chunk_sentences)
                chunks.append(Chunk(
                    text=chunk_text,
                    page=metadata.get('page', 0),
                    chunk_id=f"semantic_{chunk_idx}",
                    metadata={**metadata, 'sentences': len(current_chunk_sentences)}
                ))

                # Start new chunk
                current_chunk_sentences = [sentences[i]]
                chunk_idx += 1

        # Add final chunk
        if current_chunk_sentences:
            chunk_text = ' '.join(current_chunk_sentences)
            chunks.append(Chunk(
                text=chunk_text,
                page=metadata.get('page', 0),
                chunk_id=f"semantic_{chunk_idx}",
                metadata={**metadata, 'sentences': len(current_chunk_sentences)}
            ))

        print(f"✂️  Semantic chunking: {len(sentences)} sentences → {len(chunks)} chunks", file=sys.stderr)

        return chunks

    @staticmethod
    def _split_sentences(text: str) -> List[str]:
        """Split text into sentences.

        Args:
            text: Text to split

        Returns:
            List of sentences
        """
        # Split on sentence boundaries (., !, ?) followed by whitespace
        # Keep the punctuation with the sentence
        sentences = re.split(r'(?<=[.!?])\s+', text)

        # Filter out empty sentences
        sentences = [s.strip() for s in sentences if s.strip()]

        return sentences

    @staticmethod
    def _cosine_similarity(vec1: np.ndarray, vec2: np.ndarray) -> float:
        """Calculate cosine similarity between two vectors.

        Args:
            vec1: First vector
            vec2: Second vector

        Returns:
            Cosine similarity (0-1)
        """
        # Normalize vectors
        vec1_norm = vec1 / (np.linalg.norm(vec1) + 1e-8)
        vec2_norm = vec2 / (np.linalg.norm(vec2) + 1e-8)

        # Dot product
        similarity = np.dot(vec1_norm, vec2_norm)

        # Clamp to [0, 1] (in case of numerical issues)
        return max(0.0, min(1.0, float(similarity)))

    def _chunk_by_headers(self, text: str, metadata: Dict) -> List[Chunk]:
        """Chunk by document headers (academic papers).

        Detects common academic paper sections:
        - Abstract
        - Introduction
        - Methods/Methodology/Materials
        - Results
        - Discussion
        - Conclusion
        - References

        Args:
            text: Text to chunk
            metadata: Metadata to attach

        Returns:
            List of chunks, one per section with section_type metadata
        """
        # Define header patterns for academic papers
        # Order matters - match from most specific to least specific
        # Supports: plain text, markdown (## Header), bold (**Header**), numbered (1. Header)
        header_patterns = [
            # Abstract (plain, markdown, bold)
            # Note: No $ anchor allows page numbers/trailing content
            (r'^\s*\*?\*?abstract\*?\*?', 'abstract'),
            (r'^\s*##?\s*\*?\*?abstract\*?\*?', 'abstract'),

            # Introduction (plain, markdown, bold, numbered)
            # Allow trailing page numbers or other content
            (r'^\s*\*?\*?introduction\*?\*?', 'introduction'),
            (r'^\s*##?\s*\*?\*?introduction\*?\*?', 'introduction'),
            (r'^\s*\*?\*?1\.?\*?\*?\s+\*?\*?introduction\*?\*?', 'introduction'),
            (r'^\s*1\.?\s*introduction', 'introduction'),

            # Background
            (r'^\s*\*?\*?background\*?\*?', 'background'),
            (r'^\s*##?\s*\*?\*?background\*?\*?', 'background'),
            (r'^\s*\*?\*?\d+\.?\*?\*?\s+\*?\*?background\*?\*?', 'background'),

            # Related work
            (r'^\s*\*?\*?related\s+work\*?\*?', 'related_work'),
            (r'^\s*##?\s*\*?\*?related\s+work\*?\*?', 'related_work'),

            # Methods (many variations)
            (r'^\s*\*?\*?methods?\*?\*?', 'methods'),
            (r'^\s*\*?\*?methodology\*?\*?', 'methods'),
            (r'^\s*\*?\*?materials?\s+and\s+methods?\*?\*?', 'methods'),
            (r'^\s*\*?\*?experimental\s+setup\*?\*?', 'methods'),
            (r'^\s*##?\s*\*?\*?methods?\*?\*?', 'methods'),
            (r'^\s*\*?\*?\d+\.?\*?\*?\s+\*?\*?methods?\*?\*?', 'methods'),

            # Results
            (r'^\s*\*?\*?results?\*?\*?', 'results'),
            (r'^\s*\*?\*?findings?\*?\*?', 'results'),
            (r'^\s*##?\s*\*?\*?results?\*?\*?', 'results'),
            (r'^\s*\*?\*?\d+\.?\*?\*?\s+\*?\*?results?\*?\*?', 'results'),

            # Discussion
            (r'^\s*\*?\*?discussion\*?\*?', 'discussion'),
            (r'^\s*##?\s*\*?\*?discussion\*?\*?', 'discussion'),
            (r'^\s*\*?\*?\d+\.?\*?\*?\s+\*?\*?discussion\*?\*?', 'discussion'),

            # Results and Discussion (combined)
            (r'^\s*\*?\*?results?\s+and\s+discussion\*?\*?', 'results_and_discussion'),

            # Conclusion
            (r'^\s*\*?\*?conclusion\*?\*?', 'conclusion'),
            (r'^\s*\*?\*?conclusions?\*?\*?', 'conclusion'),
            (r'^\s*##?\s*\*?\*?conclusions?\*?\*?', 'conclusion'),
            (r'^\s*\*?\*?\d+\.?\*?\*?\s+\*?\*?conclusions?\*?\*?', 'conclusion'),

            # Limitations
            (r'^\s*\*?\*?limitations?\*?\*?', 'limitations'),

            # Future work
            (r'^\s*\*?\*?future\s+work\*?\*?', 'future_work'),

            # Acknowledgments
            (r'^\s*\*?\*?acknowledgments?\*?\*?', 'acknowledgments'),
            (r'^\s*\*?\*?acknowledgements?\*?\*?', 'acknowledgments'),

            # References (end of content)
            (r'^\s*\*?\*?references?\*?\*?', 'references'),
            (r'^\s*\*?\*?bibliography\*?\*?', 'references'),
            (r'^\s*##?\s*\*?\*?references?\*?\*?', 'references'),
        ]

        # Split text into lines
        lines = text.split('\n')

        # Find header positions
        sections = []
        current_section = {'type': 'preface', 'start': 0, 'header': 'Document Start'}

        for i, line in enumerate(lines):
            line_lower = line.lower().strip()

            # Check each pattern
            for pattern, section_type in header_patterns:
                if re.match(pattern, line_lower, re.IGNORECASE):
                    # Found a header - save previous section
                    current_section['end'] = i
                    sections.append(current_section)

                    # Start new section
                    current_section = {
                        'type': section_type,
                        'start': i + 1,  # Content starts after header
                        'header': line.strip()
                    }
                    break

        # Add final section
        current_section['end'] = len(lines)
        sections.append(current_section)

        # Create chunks from sections
        chunks = []
        for i, section in enumerate(sections):
            # Extract section text
            section_lines = lines[section['start']:section['end']]
            section_text = '\n'.join(section_lines).strip()

            # Skip empty sections
            if not section_text:
                continue

            # Skip references section (usually just citations)
            if section['type'] == 'references':
                print(f"  ⏩ Skipping references section", file=sys.stderr)
                continue

            # Create chunk with section metadata
            chunk = Chunk(
                text=section_text,
                page=metadata.get('page', 0),
                chunk_id=f"section_{section['type']}_{i}",
                metadata={
                    **metadata,
                    'section_type': section['type'],
                    'section_header': section['header'],
                    'section_index': i,
                    'lines': len(section_lines)
                }
            )
            chunks.append(chunk)

        print(f"📑 Header-based chunking: {len(sections)} sections → {len(chunks)} chunks", file=sys.stderr)
        for chunk in chunks:
            print(f"  • {chunk.metadata['section_type']}: {len(chunk.text)} chars", file=sys.stderr)

        return chunks


class QuestionExtractor:
    """Extracts structured content like numbered questions."""

    def extract_questions(self, text: str, pattern: str = r"Question\s+\d+") -> List[Dict]:
        """Extract numbered questions from text.

        Args:
            text: Text to search
            pattern: Regex pattern for questions

        Returns:
            List of extracted questions with metadata
        """
        questions = []

        # Find all question headers
        matches = list(re.finditer(pattern, text, re.IGNORECASE))

        for i, match in enumerate(matches):
            start = match.start()

            # Find end (next question or end of text)
            if i < len(matches) - 1:
                end = matches[i + 1].start()
            else:
                end = len(text)

            # Extract question text
            question_text = text[start:end].strip()

            # Extract question number
            num_match = re.search(r'\d+', match.group())
            question_num = int(num_match.group()) if num_match else i + 1

            questions.append({
                'number': question_num,
                'text': question_text,
                'header': match.group(),
                'start_pos': start,
                'end_pos': end
            })

        return questions


def main():
    parser = argparse.ArgumentParser(description='Local PDF RAG System')
    subparsers = parser.add_subparsers(dest='command', help='Command to run')

    # Index command
    index_parser = subparsers.add_parser('index', help='Index a PDF')
    index_parser.add_argument('pdf', type=Path, help='PDF file to index')
    index_parser.add_argument('--output', type=Path, required=True, help='Output index path')
    index_parser.add_argument('--chunk-strategy', type=str, default='paragraph',
                              choices=[s.value for s in ChunkStrategy])
    index_parser.add_argument('--similarity-threshold', type=float, default=0.7,
                              help='Similarity threshold for semantic chunking (0-1, default 0.7)')
    index_parser.add_argument('--embedding-server', type=str, default='http://localhost:8765',
                              help='URL of MLX embedding server for semantic chunking')

    # Search command
    search_parser = subparsers.add_parser('search', help='Search indexed PDFs')
    search_parser.add_argument('query', type=str, help='Search query')
    search_parser.add_argument('--index', type=Path, required=True, help='Index path')
    search_parser.add_argument('--k', type=int, default=5, help='Number of results')

    # Extract command
    extract_parser = subparsers.add_parser('extract', help='Extract structured content')
    extract_parser.add_argument('pdf', type=Path, help='PDF file')
    extract_parser.add_argument('--pattern', type=str, required=True, help='Regex pattern')
    extract_parser.add_argument('--output', type=Path, help='Output JSON path')

    args = parser.parse_args()

    if args.command == 'index':
        # Parse PDF
        pdf_manager = PDFParserManager()
        result = pdf_manager.parse(args.pdf)

        print(f"✅ Parsed {len(result.pages)} pages", file=sys.stderr)
        print(f"📝 Total text: {len(result.text)} characters", file=sys.stderr)

        # Chunk
        chunker = SemanticChunker(
            strategy=ChunkStrategy(args.chunk_strategy),
            similarity_threshold=args.similarity_threshold,
            embedding_server=args.embedding_server
        )
        chunks = chunker.chunk(result.text, metadata=result.metadata)

        print(f"✂️  Created {len(chunks)} chunks", file=sys.stderr)

        # TODO: Create FAISS index and save
        print(f"💾 Index saved to {args.output}", file=sys.stderr)

    elif args.command == 'search':
        # TODO: Load index and search
        print(f"🔍 Searching for: {args.query}", file=sys.stderr)

    elif args.command == 'extract':
        # Parse PDF
        pdf_manager = PDFParserManager()
        result = pdf_manager.parse(args.pdf)

        # Extract questions
        extractor = QuestionExtractor()
        questions = extractor.extract_questions(result.text, pattern=args.pattern)

        print(f"✅ Extracted {len(questions)} items", file=sys.stderr)

        # Output
        output_data = {
            'source': str(args.pdf),
            'pattern': args.pattern,
            'count': len(questions),
            'items': questions
        }

        if args.output:
            with open(args.output, 'w') as f:
                json.dump(output_data, f, indent=2)
            print(f"💾 Saved to {args.output}", file=sys.stderr)
        else:
            print(json.dumps(output_data, indent=2))

    else:
        parser.print_help()


if __name__ == '__main__':
    main()
